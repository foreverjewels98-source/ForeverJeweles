'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Order } from '@/lib/types/order';
import { getCdnImageUrl } from '@/lib/imageCdn';
import {
  Package,
  Search,
  RefreshCw,
  Copy,
  Check,
  Send,
  Phone,
  Mail,
  MapPin,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  DollarSign,
  ShieldCheck,
  Calendar,
  Filter,
  ArrowUpDown,
  Eye,
  X,
  Download,
  Printer,
  CreditCard,
  Sparkles,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Gem,
  Tag,
  FileText,
  User,
} from 'lucide-react';

interface OrdersManagerProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (
    id: string,
    status: string,
    trackingNumber?: string,
    carrier?: string,
    notes?: string
  ) => Promise<void>;
  updatingOrderId: string | null;
}

const CARRIERS = [
  'FedEx',
  'DHL Express',
  'Blue Dart',
  'IndiaPost Speed Post',
  'UPS',
  'USPS',
  'DTDC',
  'Other Express Courier',
];

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeCls: string; dotCls: string; desc: string }
> = {
  pending: {
    label: 'Pending Action',
    badgeCls: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
    dotCls: 'bg-amber-400',
    desc: 'Awaiting approval / payment verification',
  },
  confirmed: {
    label: 'Order Confirmed',
    badgeCls: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
    dotCls: 'bg-emerald-400',
    desc: 'Approved & queued for studio production',
  },
  processing: {
    label: 'Crafting in Studio',
    badgeCls: 'bg-purple-950/70 text-purple-300 border-purple-500/40',
    dotCls: 'bg-purple-400 animate-pulse',
    desc: 'Artisans setting stone & sizing metal',
  },
  shipped: {
    label: 'Dispatched / In Transit',
    badgeCls: 'bg-blue-950/70 text-blue-300 border-blue-500/40',
    dotCls: 'bg-blue-400',
    desc: 'Handed over to courier with tracking',
  },
  delivered: {
    label: 'Delivered',
    badgeCls: 'bg-green-950/70 text-green-300 border-green-500/40',
    dotCls: 'bg-green-400',
    desc: 'Safely received by customer',
  },
  cancelled: {
    label: 'Cancelled',
    badgeCls: 'bg-red-950/70 text-red-300 border-red-500/40',
    dotCls: 'bg-red-400',
    desc: 'Order cancelled / refunded',
  },
};

export default function OrdersManager({
  orders,
  isLoading,
  onRefresh,
  onUpdateStatus,
  updatingOrderId,
}: OrdersManagerProps) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [prioritizePending, setPrioritizePending] = useState<boolean>(false);

  // Clipboard & Drawer state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Drawer quick-edit state
  const [drawerStatus, setDrawerStatus] = useState<string>('');
  const [drawerCarrier, setDrawerCarrier] = useState<string>('FedEx');
  const [drawerTracking, setDrawerTracking] = useState<string>('');
  const [drawerNotes, setDrawerNotes] = useState<string>('');

  // Sync drawer fields when an order is opened
  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setDrawerStatus(order.orderStatus);
    setDrawerCarrier(order.carrier || 'FedEx');
    setDrawerTracking(order.trackingNumber || '');
    setDrawerNotes(order.notes || '');
  };

  // Helper: Date filtering logic
  const isDateMatching = (orderDateStr: string, filter: string) => {
    if (filter === 'all') return true;
    const orderDate = new Date(orderDateStr);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (filter === 'today') {
      return orderDate >= startOfToday;
    }
    if (filter === 'yesterday') {
      return orderDate >= startOfYesterday && orderDate < startOfToday;
    }
    if (filter === 'last_7_days') {
      return orderDate >= sevenDaysAgo;
    }
    if (filter === 'this_month') {
      return orderDate >= startOfMonth;
    }
    return true;
  };

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.orderStatus === 'pending').length;
    const crafting = orders.filter((o) => o.orderStatus === 'confirmed' || o.orderStatus === 'processing').length;
    const dispatched = orders.filter((o) => o.orderStatus === 'shipped' || o.orderStatus === 'delivered').length;

    // Revenue totals
    let revenueINR = 0;
    let revenueUSD = 0;
    orders.forEach((o) => {
      const amt = Number(o.total || 0);
      if (o.currency === 'INR') revenueINR += amt;
      else revenueUSD += amt;
    });

    return { total, pending, crafting, dispatched, revenueINR, revenueUSD };
  }, [orders]);

  // Status Counts Map
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      const st = o.orderStatus?.toLowerCase() || 'pending';
      if (counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [orders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
        return false;
      }

      // 2. Date Filter
      if (!isDateMatching(order.createdAt, dateFilter)) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = order.id.toLowerCase().includes(q);
        const nameMatch = `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(q);
        const emailMatch = (order.customer.email || '').toLowerCase().includes(q);
        const phoneMatch = (order.customer.phone || '').replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
        const cityMatch = (order.customer.city || '').toLowerCase().includes(q);
        const countryMatch = (order.customer.country || '').toLowerCase().includes(q);
        const trackingMatch = (order.trackingNumber || '').toLowerCase().includes(q);
        const itemMatch = (order.items || []).some((it) => it.productName.toLowerCase().includes(q));

        if (!idMatch && !nameMatch && !emailMatch && !phoneMatch && !cityMatch && !countryMatch && !trackingMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      // Prioritize pending orders if enabled
      if (prioritizePending) {
        if (a.orderStatus === 'pending' && b.orderStatus !== 'pending') return -1;
        if (b.orderStatus === 'pending' && a.orderStatus !== 'pending') return 1;
      }

      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'amount_high') {
        return Number(b.total || 0) - Number(a.total || 0);
      }
      if (sortBy === 'amount_low') {
        return Number(a.total || 0) - Number(b.total || 0);
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, dateFilter, searchQuery, sortBy, prioritizePending]);

  // Copy full customer address
  const copyAddress = (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = `${order.customer.firstName} ${order.customer.lastName}\n${order.customer.streetAddress}${
      order.customer.apartment ? `, ${order.customer.apartment}` : ''
    }\n${order.customer.city}, ${order.customer.state || ''} ${order.customer.postalCode}\n${
      order.customer.country
    }\nPhone: ${order.customer.phone}\nEmail: ${order.customer.email}`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // WhatsApp Customer
  const openCustomerWhatsApp = (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cleanPhone = (order.customer.phone || '').replace(/[^0-9]/g, '');
    const itemsList = order.items.map((i) => i.productName).join(', ');
    const trackingMsg = order.trackingNumber
      ? `Your parcel is dispatched via *${order.carrier || 'Express Courier'}* with tracking number: *${order.trackingNumber}*.\nYou can track it anytime at https://ring-pearl.vercel.app/my-orders?id=${order.id}`
      : `Your bespoke handcrafted order is currently in production with our master artisans.`;

    const message = encodeURIComponent(
      `Hello ${order.customer.firstName}! Greetings from Forever Jewellss.\n\n` +
      `Regarding your Order *#${order.id}* (${itemsList}):\n\n` +
      `${trackingMsg}\n\n` +
      `Please let us know if you need any adjustments or assistance. Thank you for choosing us!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'State',
      'Postal Code',
      'Country',
      'Items Count',
      'Total Amount',
      'Currency',
      'Payment Method',
      'Payment Status',
      'Fulfillment Status',
      'Courier Carrier',
      'Tracking Number',
      'Notes',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.customer.firstName} ${o.customer.lastName}"`,
      `"${o.customer.email}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.streetAddress}${o.customer.apartment ? `, ${o.customer.apartment}` : ''}"`,
      `"${o.customer.city}"`,
      `"${o.customer.state || ''}"`,
      `"${o.customer.postalCode || ''}"`,
      `"${o.customer.country}"`,
      o.items.length,
      o.total,
      o.currency,
      `"${o.payment?.method || ''}"`,
      `"${o.payment?.status || ''}"`,
      `"${o.orderStatus || ''}"`,
      `"${o.carrier || ''}"`,
      `"${o.trackingNumber || ''}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ForeverJewell_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format Date friendly
  const formatFriendlyDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return { main: 'Today', sub: timeStr, isRecent: true };

    const dateFormatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return { main: dateFormatted, sub: timeStr, isRecent: false };
  };

  // Drawer save handler
  const handleDrawerSave = async () => {
    if (!selectedOrder) return;
    await onUpdateStatus(
      selectedOrder.id,
      drawerStatus,
      drawerTracking.trim() || undefined,
      drawerCarrier,
      drawerNotes.trim() || undefined
    );
    // Update local selectedOrder snapshot
    setSelectedOrder((prev) =>
      prev
        ? {
            ...prev,
            orderStatus: drawerStatus as any,
            trackingNumber: drawerTracking.trim() || undefined,
            carrier: drawerCarrier,
            notes: drawerNotes.trim() || undefined,
          }
        : null
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full text-white">
      {/* ── TOP HEADER & ACTIONS ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-widest text-[#D39EAA] uppercase">
              Admin Orders & Fulfillment Hub
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D39EAA]/20 text-[#D39EAA] border border-[#D39EAA]/30">
              Live Cloud Sync
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Client Orders & Tracking
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review incoming orders, verify UPI/PayPal payments, update crafting stages, and dispatch courier tracking in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportToCSV}
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#022C22] hover:bg-[#033E30] text-[#D39EAA] border border-[#D39EAA]/40 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Download CSV spreadsheet of current orders"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/15 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D39EAA]' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-black/40 border border-white/15 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#D39EAA] text-[#592D37] shadow font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Compact Table List View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-[#D39EAA] text-[#592D37] shadow font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Expanded Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-[#032019] border border-white/10 rounded-2xl p-4 shadow-lg hover:border-[#D4AF37]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Total Bookings
            </span>
            <Package className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1.5">{metrics.total}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
            <span>Volume: ₹{metrics.revenueINR.toLocaleString()}</span>
            {metrics.revenueUSD > 0 && <span>+ ${metrics.revenueUSD.toLocaleString()}</span>}
          </div>
        </div>

        {/* Pending Action (Highlighted) */}
        <div
          onClick={() => {
            setStatusFilter('pending');
            setPrioritizePending(true);
          }}
          className={`bg-[#032019] border rounded-2xl p-4 shadow-lg transition-all cursor-pointer ${
            metrics.pending > 0
              ? 'border-amber-500/50 bg-gradient-to-br from-[#032019] to-amber-950/20 hover:border-amber-400'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              Pending Action
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-300 mt-1.5">{metrics.pending}</p>
          <span className="text-[10px] text-amber-400/80">Requires approval / UTR verify</span>
        </div>

        {/* In Production */}
        <div
          onClick={() => setStatusFilter('processing')}
          className="bg-[#032019] border border-white/10 rounded-2xl p-4 shadow-lg hover:border-[#D39EAA]/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#D39EAA] font-semibold uppercase tracking-wider">
              In Crafting
            </span>
            <Gem className="w-4 h-4 text-[#D39EAA]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E8EA] mt-1.5">{metrics.crafting}</p>
          <span className="text-[10px] text-[#D39EAA]/80">Active master artisans</span>
        </div>

        {/* Dispatched & Shipped */}
        <div
          onClick={() => setStatusFilter('shipped')}
          className="bg-[#032019] border border-white/10 rounded-2xl p-4 shadow-lg hover:border-blue-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
              Dispatched
            </span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-blue-300 mt-1.5">{metrics.dispatched}</p>
          <span className="text-[10px] text-blue-400/80">In transit or delivered</span>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH, DATE SELECTOR, SORT & PRIORITIZE ─────────────── */}
      <div className="bg-[#032019] border border-white/15 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID (#FJ-...), Name, Phone, Email, City, Tracking #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Filter & Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Date filter dropdown */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#042820]">All Dates</option>
                <option value="today" className="bg-[#042820]">Today Only</option>
                <option value="yesterday" className="bg-[#042820]">Yesterday</option>
                <option value="last_7_days" className="bg-[#042820]">Last 7 Days</option>
                <option value="this_month" className="bg-[#042820]">This Month</option>
              </select>
            </div>

            {/* Sort by dropdown */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-[#042820]">Newest First</option>
                <option value="oldest" className="bg-[#042820]">Oldest First</option>
                <option value="amount_high" className="bg-[#042820]">Amount: High → Low</option>
                <option value="amount_low" className="bg-[#042820]">Amount: Low → High</option>
              </select>
            </div>

            {/* Prioritize Pending Toggle Button */}
            <button
              onClick={() => setPrioritizePending(!prioritizePending)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                prioritizePending
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-black/40 text-gray-400 border-white/20 hover:text-white'
              }`}
              title="Show pending approval orders at the very top"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Pending First</span>
            </button>
          </div>
        </div>

        {/* ── STATUS TABS WITH LIVE COUNTS ─────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/10 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders', count: statusCounts.all, cls: 'text-gray-300' },
            { id: 'pending', label: 'Pending Action', count: statusCounts.pending, cls: 'text-amber-400 font-bold' },
            { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed, cls: 'text-emerald-300' },
            { id: 'processing', label: 'Crafting', count: statusCounts.processing, cls: 'text-purple-300' },
            { id: 'shipped', label: 'Shipped', count: statusCounts.shipped, cls: 'text-blue-300' },
            { id: 'delivered', label: 'Delivered', count: statusCounts.delivered, cls: 'text-green-300' },
            { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, cls: 'text-red-400' },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#022C22] font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#022C22] text-[#D4AF37]' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ORDERS CONTENT (TABLE OR CARDS) ──────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#032019] border border-white/10 rounded-2xl p-14 text-center">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-serif font-bold text-white mb-1">No Orders Matching Filters</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try clearing your search query or selecting "All Dates" / "All Orders".'
              : 'New customer orders placed in the store will automatically appear here.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="mt-4 px-4 py-1.5 bg-[#D4AF37] text-[#022C22] text-xs font-bold rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* ═══════════════════════════════════════════════════════════════════════
           CLEAN HIGH-DENSITY PROFESSIONAL TABLE VIEW
           ═══════════════════════════════════════════════════════════════════════ */
        <div className="bg-[#032019] border border-white/15 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-white/15">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Payment & Amount</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4">Courier / Tracking</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
                  const dateInfo = formatFriendlyDate(order.createdAt);
                  const isUpdating = updatingOrderId === order.id;
                  const isPaid = order.payment?.status === 'paid';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => openOrderDrawer(order)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      {/* 1. Order ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                            #{order.id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(order.id);
                              setCopiedId(order.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                          <span
                            className={
                              dateInfo.isRecent
                                ? 'text-amber-300 font-semibold px-1 rounded bg-amber-950/60 border border-amber-500/30'
                                : ''
                            }
                          >
                            {dateInfo.main}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span>{dateInfo.sub}</span>
                        </div>
                      </td>

                      {/* 2. Customer Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
                          {order.customer.city}, {order.customer.country}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-mono">
                            {order.customer.phone}
                          </span>
                          <button
                            onClick={(e) => openCustomerWhatsApp(order, e)}
                            className="text-[#D4AF37] hover:text-[#F3E5AB] transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <Send className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                      {/* 3. Items Summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 relative rounded bg-white/5 border border-white/10 overflow-hidden shrink-0">
                            {order.items[0]?.image ? (
                              <Image
                                src={order.items[0].image}
                                alt={order.items[0].productName}
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Gem className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate max-w-[200px]">
                              {order.items[0]?.productName || 'Jewelry Piece'}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {order.items[0]?.metal || 'Fine Metal'}
                              {order.items.length > 1 && (
                                <span className="ml-1.5 text-[10px] text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-1.5 py-0.2 rounded border border-[#D4AF37]/30">
                                  +{order.items.length - 1} more
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 4. Payment & Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-sm text-white">
                          {order.currencySymbol}
                          {Number(order.total || 0).toLocaleString()} {order.currency}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              isPaid
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {isPaid ? '✓ PAID' : 'PENDING'}
                          </span>
                          <span className="text-[11px] text-gray-400 capitalize">
                            {order.payment?.method === 'bank_transfer'
                              ? 'UPI / Bank'
                              : order.payment?.method || 'Direct'}
                          </span>
                        </div>
                      </td>

                      {/* 5. Fulfillment Status (Quick Switcher) */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={order.orderStatus}
                            disabled={isUpdating}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer uppercase tracking-wider ${cfg.badgeCls}`}
                          >
                            <option value="pending" className="bg-[#032019] text-amber-300">Pending Action</option>
                            <option value="confirmed" className="bg-[#032019] text-emerald-300">Confirmed</option>
                            <option value="processing" className="bg-[#032019] text-purple-300">Crafting</option>
                            <option value="shipped" className="bg-[#032019] text-blue-300">Shipped</option>
                            <option value="delivered" className="bg-[#032019] text-green-300">Delivered</option>
                            <option value="cancelled" className="bg-[#032019] text-red-300">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* 6. Courier / Tracking */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.trackingNumber ? (
                          <div>
                            <span className="text-[11px] font-mono font-bold text-blue-300 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded">
                              {order.carrier || 'Courier'}: {order.trackingNumber}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDrawer(order);
                            }}
                            className="text-[10px] text-gray-400 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/50 rounded-lg px-2 py-1 transition-colors"
                          >
                            + Add Tracking
                          </button>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openOrderDrawer(order)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-[#D4AF37] transition-colors cursor-pointer"
                            title="Inspect Order Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => openCustomerWhatsApp(order, e)}
                            className="p-1.5 bg-[#064E3B] hover:bg-[#043327] text-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                            title="Message on WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════════
           EXPANDED CARDS VIEW (CLEANED UP & STREAMLINED)
           ═══════════════════════════════════════════════════════════════════════ */
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
            const dateInfo = formatFriendlyDate(order.createdAt);
            const isPaid = order.payment?.status === 'paid';
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-[#032019] border border-white/15 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 transition-all hover:border-[#D39EAA]/50"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#D39EAA] bg-[#D39EAA]/15 px-2.5 py-1 rounded-lg border border-[#D39EAA]/30">
                      #{order.id}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-base text-white">
                        {order.currencySymbol}
                        {Number(order.total || 0).toLocaleString()} {order.currency}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          isPaid
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {isPaid ? '✓ PAID' : 'PENDING PAYMENT'}
                      </span>
                    </div>

                    <select
                      value={order.orderStatus}
                      disabled={isUpdating}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer uppercase tracking-wider ${cfg.badgeCls}`}
                    >
                      <option value="pending" className="bg-[#032019]">Pending Action</option>
                      <option value="confirmed" className="bg-[#032019]">Confirmed</option>
                      <option value="processing" className="bg-[#032019]">Crafting</option>
                      <option value="shipped" className="bg-[#032019]">Shipped</option>
                      <option value="delivered" className="bg-[#032019]">Delivered</option>
                      <option value="cancelled" className="bg-[#032019]">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Card Body: Customer & Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Customer info (5 Cols) */}
                  <div className="md:col-span-5 bg-black/30 border border-white/10 rounded-xl p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D39EAA] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Customer & Shipping Address
                      </span>
                      <button
                        onClick={(e) => copyAddress(order, e)}
                        className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>{copiedId === order.id ? 'Copied' : 'Label'}</span>
                      </button>
                    </div>

                    <div className="text-xs text-gray-300 space-y-1">
                      <p className="font-bold text-white text-sm">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-gray-300">
                        {order.customer.streetAddress}
                        {order.customer.apartment && `, ${order.customer.apartment}`}
                      </p>
                      <p className="text-gray-300">
                        {order.customer.city}, {order.customer.state || ''} {order.customer.postalCode}
                      </p>
                      <p className="font-semibold text-white">{order.customer.country}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="flex items-center gap-1 text-gray-300 hover:text-[#D39EAA]"
                      >
                        <Phone className="w-3 h-3 text-[#D39EAA]" />
                        <span>{order.customer.phone}</span>
                      </a>
                      <span className="text-gray-600">•</span>
                      <a
                        href={`mailto:${order.customer.email}`}
                        className="flex items-center gap-1 text-gray-300 hover:text-[#D39EAA] truncate max-w-[180px]"
                      >
                        <Mail className="w-3 h-3 text-[#D39EAA]" />
                        <span className="truncate">{order.customer.email}</span>
                      </a>

                      <button
                        onClick={(e) => openCustomerWhatsApp(order, e)}
                        className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-[#B76E79] hover:bg-[#A35D68] text-white text-[11px] font-bold rounded transition-colors cursor-pointer"
                        title="Message customer on WhatsApp"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Items list (7 Cols) */}
                  <div className="md:col-span-7 bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D39EAA] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        Ordered Pieces ({order.items.length})
                      </span>
                      <button
                        onClick={() => openOrderDrawer(order)}
                        className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Full Dossier</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          <div className="w-10 h-10 relative rounded bg-white/5 border border-white/10 overflow-hidden shrink-0">
                            {it.image && (
                              <Image src={getCdnImageUrl(it.image, { width: 120, quality: 80 })} alt={it.productName} fill className="object-cover" sizes="40px" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{it.productName}</p>
                            <p className="text-[11px] text-gray-400">
                              Metal: <strong className="text-gray-200">{it.metal}</strong> | Size:{' '}
                              <strong className="text-[#D39EAA]">{it.size}</strong>
                              {it.carat ? ` | Carat: ${it.carat}` : ''}
                            </p>
                            {it.engraving && (
                              <p className="text-[10px] text-[#D39EAA] italic">
                                Engraving: &ldquo;{it.engraving}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-gray-400 text-[11px]">{it.quantity} × </span>
                            <span className="font-bold text-white">
                              {order.currencySymbol}
                              {Number(it.unitPrice || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tracking bar */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D39EAA]" />
                    {order.trackingNumber ? (
                      <span className="font-mono text-blue-300 font-bold">
                        {order.carrier || 'Courier'}: {order.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">No courier tracking assigned yet</span>
                    )}
                  </div>

                  <button
                    onClick={() => openOrderDrawer(order)}
                    className="px-3 py-1 bg-[#D39EAA]/20 hover:bg-[#D39EAA]/30 text-[#D39EAA] border border-[#D39EAA]/40 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Manage Tracking & Dispatch →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
         SLIDE-OVER LUXURY ORDER DOSSIER DRAWER (MODAL)
         ═══════════════════════════════════════════════════════════════════════ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-all animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />

          {/* Drawer container */}
          <div className="relative w-full max-w-2xl bg-[#032019] border-l border-[#D4AF37]/30 h-full overflow-y-auto shadow-2xl flex flex-col z-10 text-white">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-[#021A14]/95 backdrop-blur border-b border-white/10 p-5 flex items-center justify-between z-20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-[#D4AF37]">
                    #{selectedOrder.id}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      (STATUS_CONFIG[selectedOrder.orderStatus] || STATUS_CONFIG.pending).badgeCls
                    }`}
                  >
                    {(STATUS_CONFIG[selectedOrder.orderStatus] || STATUS_CONFIG.pending).label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                  title="Print Invoice / Packing Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* 1. Fulfillment Status Switcher */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Fulfillment Status & Production Stage
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {(STATUS_CONFIG[drawerStatus] || STATUS_CONFIG.pending).desc}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'pending', label: 'Pending' },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'processing', label: 'Crafting' },
                    { id: 'shipped', label: 'Shipped' },
                    { id: 'delivered', label: 'Delivered' },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setDrawerStatus(s.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                        drawerStatus === s.id
                          ? 'bg-[#D4AF37] text-[#022C22] border-[#D4AF37] shadow font-bold'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Courier Dispatch Station */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  Courier Tracking & Dispatch Details
                </span>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Carrier Service</label>
                    <select
                      value={drawerCarrier}
                      onChange={(e) => setDrawerCarrier(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      {CARRIERS.map((c) => (
                        <option key={c} value={c} className="bg-[#042820]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Courier Tracking Number (AWB)</label>
                    <input
                      type="text"
                      placeholder="e.g. FDX982837482"
                      value={drawerTracking}
                      onChange={(e) => setDrawerTracking(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Internal Workshop Notes / Sizing Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Ring sized to 7.5; laser hallmark applied; dispatched in velvet gift box"
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* 3. Ordered Jewelry Pieces */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  Ordered Pieces ({selectedOrder.items.length})
                </span>

                <div className="divide-y divide-white/10 space-y-2.5">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="pt-2.5 first:pt-0 flex items-start gap-3 text-xs">
                      <div className="w-14 h-14 relative rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        {it.image && (
                          <Image src={getCdnImageUrl(it.image, { width: 140, quality: 80 })} alt={it.productName} fill className="object-cover" sizes="56px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">{it.productName}</p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          Metal: <strong className="text-gray-100">{it.metal}</strong> | Size:{' '}
                          <strong className="text-[#D4AF37]">{it.size}</strong>
                          {it.carat ? ` | Carat: ${it.carat}` : ''}
                        </p>
                        {it.engraving && (
                          <p className="text-[11px] text-[#D4AF37] italic mt-0.5">
                            Custom Engraving: &ldquo;{it.engraving}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-400">
                          {it.quantity} × {selectedOrder.currencySymbol}
                          {Number(it.unitPrice || 0).toLocaleString()}
                        </span>
                        <p className="font-bold text-white text-sm mt-0.5">
                          {selectedOrder.currencySymbol}
                          {Number(it.totalPrice || it.unitPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-300">Total Order Amount:</span>
                  <span className="text-lg text-white font-serif">
                    {selectedOrder.currencySymbol}
                    {Number(selectedOrder.total || 0).toLocaleString()} {selectedOrder.currency}
                  </span>
                </div>
              </div>

              {/* 4. Customer & Shipping Label */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Customer & Shipping Destination
                  </span>
                  <button
                    onClick={(e) => copyAddress(selectedOrder, e)}
                    className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white px-2 py-1 rounded-lg border border-white/15 bg-white/5 transition-colors cursor-pointer"
                  >
                    {copiedId === selectedOrder.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied Label</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Full Label</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-gray-300 space-y-1">
                  <p className="font-bold text-white text-sm">
                    {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                  </p>
                  <p>
                    {selectedOrder.customer.streetAddress}
                    {selectedOrder.customer.apartment && `, ${selectedOrder.customer.apartment}`}
                  </p>
                  <p>
                    {selectedOrder.customer.city}, {selectedOrder.customer.state || ''}{' '}
                    {selectedOrder.customer.postalCode}
                  </p>
                  <p className="font-semibold text-white">{selectedOrder.customer.country}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                  <a
                    href={`tel:${selectedOrder.customer.phone}`}
                    className="flex items-center gap-1 text-gray-300 hover:text-[#D4AF37]"
                  >
                    <Phone className="w-3 h-3 text-[#D4AF37]" />
                    <span>{selectedOrder.customer.phone}</span>
                  </a>
                  <a
                    href={`mailto:${selectedOrder.customer.email}`}
                    className="flex items-center gap-1 text-gray-300 hover:text-[#D4AF37]"
                  >
                    <Mail className="w-3 h-3 text-[#D4AF37]" />
                    <span>{selectedOrder.customer.email}</span>
                  </a>
                  <button
                    onClick={(e) => openCustomerWhatsApp(selectedOrder, e)}
                    className="ml-auto flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>WhatsApp Client</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer: Save Actions */}
            <div className="sticky bottom-0 bg-[#021A14]/95 backdrop-blur border-t border-white/10 p-4 flex items-center justify-between gap-3 z-20">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 text-xs text-gray-300 hover:text-white rounded-xl border border-white/15 transition-colors cursor-pointer"
              >
                Close Dossier
              </button>

              <button
                type="button"
                onClick={handleDrawerSave}
                disabled={updatingOrderId === selectedOrder.id}
                className="flex-1 max-w-xs py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] hover:from-[#F3E5AB] hover:to-[#D4AF37] disabled:opacity-50 text-[#022C22] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {updatingOrderId === selectedOrder.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {updatingOrderId === selectedOrder.id ? 'Syncing...' : 'Save & Notify Customer'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
