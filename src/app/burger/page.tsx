'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getCdnImageUrl } from '@/lib/imageCdn';
import {
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Save,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  Image as ImageIcon,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Gem,
  ExternalLink,
  UploadCloud,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
  FileText,
  Sliders,
  DollarSign,
  FolderOpen,
  Download,
  Globe,
  Wand2,
  Tag,
  Package,
  ShieldCheck,
  Ruler,
  Hash,
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Table,
  Edit3,
  Filter,
  ArrowUpDown,
  Coins,
  RefreshCw,
  CheckCheck,
  SlidersHorizontal,
  ArrowRight,
  Truck,
  Phone,
  Mail,
  MapPin,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import {
  Product,
  ProductVariant,
  SHAPES,
  METALS,
  STANDARD_METAL_TIERS,
  PRODUCT_METAL_PRICES,
} from '@/lib/data';
import { Order } from '@/lib/types/order';
import { useProducts } from '@/context/ProductContext';
import { useCurrency, SUPPORTED_CURRENCIES } from '@/context/CurrencyContext';
import { US_RING_SIZES } from '@/components/products/FindYourSizeDrawer';
import ProductCard from '@/components/products/ProductCard';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import OrdersManager from '@/components/admin/OrdersManager';

// Security: Authentication is validated via server-side 2FA API (/api/admin/auth)

export const CATEGORY_DEFINITIONS: { value: string; label: string; shortLabel: string }[] = [
  { value: 'all', label: 'All Products', shortLabel: 'All' },
  { value: 'rings', label: 'Solitaire & Engagement Rings', shortLabel: 'Rings' },
  { value: 'band', label: 'Wedding & Eternity Bands', shortLabel: 'Bands' },
  { value: 'ring-set', label: 'Bridal Ring Sets', shortLabel: 'Ring Sets' },
  { value: 'necklace', label: 'Necklaces & Pendants', shortLabel: 'Necklaces' },
  { value: 'earrings', label: 'Fine Earrings', shortLabel: 'Earrings' },
  { value: 'bracelet', label: 'Bracelets & Bangles', shortLabel: 'Bracelets' },
  { value: 'lesbian-ring', label: 'Pride & Couple Rings', shortLabel: 'Pride Rings' },
  { value: 'nose-ring', label: 'Nose Jewelry', shortLabel: 'Nose Rings' },
  { value: 'belly-rings', label: 'Belly Rings', shortLabel: 'Belly Rings' },
];

const EMPTY_PRODUCT: Product = {
  id: '',
  name: '',
  slug: '',
  category: 'rings',
  shape: 'Oval',
  price: 3999,
  originalPrice: 7999,
  carat: '2.00 CT',
  clarity: 'VVS1',
  colorGrade: 'D Color (Colorless)',
  cut: 'Oval Brilliant Cut',
  certification: 'GRA Certified with Authenticity Card',
  badge: 'NEW ARRIVAL',
  rating: 5.0,
  reviewsCount: 12,
  metal: '925 Sterling Silver',
  readyToShip: true,
  primaryGemstone: 'Natural Rose Quartz',
  secondaryGemstone: 'CZ Diamond Accents',
  ringStyle: 'Art Deco / Royal Solitaire',
  occasion: 'Engagement & Wedding',
  deliveryTime: '4-7 Days Free Express Delivery',
  sku: 'FJ-ROSE-001',
  stockStatus: 'in_stock',
  stockQuantity: 10,
  metaTitle: '',
  metaDescription: '',
  isFeatured: false,
  grossWeight: '3.75G',
  karatage: '925 Silver / 14k Gold',
  materialColor: 'Silver / White / Rose / Yellow Gold',
  diamondType: 'Lab Grown Moissanite Diamond (Passes Diamond Tester)',
  diamondColor: 'White (D-Color / Colorless)',
  diamondClarity: 'VVS1 / Flawless (FL)',
  settingStyle: 'Crown Setting',
  prepaidDiscountNote: '₹300 OFF on prepaid orders',
  bespokeNotice: 'BESPOKE! SHIPS IN 2-3 WEEKS!',
  variants: [
    { metal: '925 Sterling Silver', colorCode: '#E2E8F0', image: '' },
    { metal: '14k Yellow Gold', colorCode: '#CA8A04', image: '' },
    { metal: '14k Rose Gold', colorCode: '#FB7185', image: '' },
  ],
  images: [],
  description: 'Handcrafted with passion by master artisans in India. Features an exquisite center stone held in a secure designer claw setting with brilliant light refraction and lifetime durability.\n\nDesigned for everyday luxury and milestone celebrations, each piece is cast in certified premium metal with a comfort-fit interior shank.',
  features: [
    'Handmade in India by Master Artisans',
    'Passes Standard Thermal Testers',
    'Laser-Inscribed Authenticity Serial Code',
    'Solid Comfort-Fit Shank',
    'Arrives in Luxury Velvet Gift Box'
  ],
};

export default function AdminBurgerPage() {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefaults } = useProducts();
  const { selectedCurrency, formatPrice } = useCurrency();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmailInput, setAdminEmailInput] = useState<string>('');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');
  const [authStep, setAuthStep] = useState<'PASSWORD' | '2FA_OTP'>('PASSWORD');
  const [twoFactorSessionId, setTwoFactorSessionId] = useState<string>('');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [devCodeHint, setDevCodeHint] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [adminTeamList, setAdminTeamList] = useState<{ email: string; role: string; name: string }[]>([]);
  const [isAdminTeamModalOpen, setIsAdminTeamModalOpen] = useState<boolean>(false);
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminName, setNewAdminName] = useState<string>('');
  const [newAdminRole, setNewAdminRole] = useState<'SUPER_ADMIN' | 'MANAGER'>('MANAGER');

  // Selected Product State
  const [formData, setFormData] = useState<Product>(EMPTY_PRODUCT);
  const [isNewListing, setIsNewListing] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'media' | 'specs' | 'pricing' | 'variants' | 'story' | 'seo'>('media');
  const [viewMode, setViewMode] = useState<'tabs' | 'all'>('tabs');
  const [isPreviewingDescription, setIsPreviewingDescription] = useState<boolean>(false);

  // Navigation & View Mode: Table Catalog View vs Deep Product Editor vs Orders Manager
  const [mainViewMode, setMainViewMode] = useState<'table' | 'editor' | 'orders'>('table');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [metalPricingFilter, setMetalPricingFilter] = useState<'all' | 'verified' | 'standard'>('all');
  const [adminCurrency, setAdminCurrency] = useState<string>('INR');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'stock-asc' | 'stock-desc'>('default');
  const [tableItemsPerPage, setTableItemsPerPage] = useState<number>(10);
  const [tableCurrentPage, setTableCurrentPage] = useState<number>(1);
  const [quickEditingPriceId, setQuickEditingPriceId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);

  // Orders Management State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const tok = sessionStorage.getItem('fj_admin_token') || '';
      const res = await fetch('/api/orders', {
        headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const updateOrderStatus = async (
    id: string,
    newStatus: string,
    trackingNumber?: string,
    carrier?: string,
    notes?: string
  ) => {
    setUpdatingOrderId(id);
    try {
      const tok = sessionStorage.getItem('fj_admin_token') || '';
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
        },
        body: JSON.stringify({
          id,
          orderStatus: newStatus,
          trackingNumber,
          carrier,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, ...data.order } : o))
        );
        showToast(`✓ Order #${id} updated to ${newStatus.toUpperCase()}`);
      } else {
        showToast(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      showToast('Connection error updating order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Currency conversion helper for admin table & matrix
  const formatAdminPrice = (inrPrice: number, targetCurrencyCode?: string) => {
    const code = targetCurrencyCode || adminCurrency;
    const cur = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.INR;
    const converted = Math.round(inrPrice * cur.rate);
    return `${cur.symbol}${converted.toLocaleString('en-US')}`;
  };

  // Search & Pagination state for catalog
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState<boolean>(false);

  // Dynamic full categories list with live item counts across all jewelry collections
  const allCategories = useMemo(() => {
    const map = new Map<string, { value: string; label: string; shortLabel: string }>();
    CATEGORY_DEFINITIONS.forEach((c) => map.set(c.value.toLowerCase(), c));

    // Discover any additional category from active products
    products.forEach((p) => {
      const c = (p.category || '').toLowerCase().trim();
      if (c && !map.has(c)) {
        const pretty = c.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        map.set(c, { value: c, label: pretty, shortLabel: pretty });
      }
    });

    const isMatch = (pCatRaw: string, target: string) => {
      if (target === 'all') return true;
      const pCat = (pCatRaw || '').toLowerCase().trim();
      const t = target.toLowerCase().trim();
      if (pCat === t) return true;
      if ((t === 'necklace' || t === 'necklaces') && (pCat === 'necklace' || pCat === 'necklaces' || pCat === 'pendant')) return true;
      if ((t === 'rings' || t === 'ring') && (pCat === 'rings' || pCat === 'ring')) return true;
      if ((t === 'band' || t === 'bands') && (pCat === 'band' || pCat === 'bands')) return true;
      if ((t === 'earrings' || t === 'earring') && (pCat === 'earrings' || pCat === 'earring')) return true;
      if ((t === 'bracelet' || t === 'bracelets') && (pCat === 'bracelet' || pCat === 'bracelets')) return true;
      if ((t === 'nose-ring' || t === 'nose') && (pCat === 'nose-ring' || pCat === 'nose')) return true;
      if ((t === 'belly-rings' || t === 'belly') && (pCat === 'belly-rings' || pCat === 'belly')) return true;
      return pCat.includes(t);
    };

    return Array.from(map.values()).map((cat) => ({
      ...cat,
      count: cat.value === 'all'
        ? products.length
        : products.filter((p) => isMatch(p.category, cat.value)).length,
    }));
  }, [products]);

  // Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Temporary inputs
  const [singleUrlInput, setSingleUrlInput] = useState<string>('');
  const [bulkUrlsInput, setBulkUrlsInput] = useState<string>('');
  const [showUrlInputs, setShowUrlInputs] = useState<boolean>(false);
  const [newFeatureText, setNewFeatureText] = useState<string>('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    const token = sessionStorage.getItem('fj_admin_token');
    if (token) {
      fetch('/api/admin/auth', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.authenticated) {
            setIsAuthenticated(true);
            if (Array.isArray(d.team)) setAdminTeamList(d.team);
          } else {
            sessionStorage.removeItem('fj_admin_token');
            sessionStorage.removeItem('fj_admin_auth');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          const sessionAuth = sessionStorage.getItem('fj_admin_auth');
          if (sessionAuth === 'true') setIsAuthenticated(true);
        });
    }
  }, []);

  // Cooldown timer for 2FA resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmailInput.trim().toLowerCase();
    const cleanPassword = enteredPin.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setPinError('Please enter your administrator email address.');
      return;
    }
    if (!cleanPassword) {
      setPinError('Please enter your Master Admin Passcode.');
      return;
    }

    setIsAuthLoading(true);
    setPinError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: cleanEmail,
          password: cleanPassword,
        }),
      });
      const data = await res.json();
      if (data.success && data.step === '2FA_REQUIRED') {
        setAuthStep('2FA_OTP');
        setTwoFactorSessionId(data.sessionId);
        setMaskedEmail(data.maskedEmail);
        if (data.devCode) setDevCodeHint(data.devCode);
        setResendCooldown(30);
      } else {
        setPinError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setPinError('Connection error. Could not contact authentication server.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setPinError('Please enter the 6-digit verification code.');
      return;
    }
    setIsAuthLoading(true);
    setPinError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_2fa',
          sessionId: twoFactorSessionId,
          code: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setIsAuthenticated(true);
        sessionStorage.setItem('fj_admin_auth', 'true');
        sessionStorage.setItem('fj_admin_token', data.token);
        setEnteredPin('');
        setOtpCode('');
        showToast('🛡️ Admin identity verified with 2FA.');
      } else {
        setPinError(data.error || 'Invalid 2FA code. Please try again.');
      }
    } catch {
      setPinError('Error verifying security code.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: adminEmailInput.trim().toLowerCase(),
          password: enteredPin.trim() || 'ForeverJewell@2026!',
        }),
      });
      const data = await res.json();
      if (data.success && data.sessionId) {
        setTwoFactorSessionId(data.sessionId);
        if (data.devCode) setDevCodeHint(data.devCode);
        setResendCooldown(30);
        showToast('A new 6-digit verification code has been dispatched.');
      }
    } catch {
      showToast('Could not resend code. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLock = async () => {
    const token = sessionStorage.getItem('fj_admin_token');
    if (token) {
      try {
        await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout', token }),
        });
      } catch (_) {}
    }
    setIsAuthenticated(false);
    setAuthStep('PASSWORD');
    sessionStorage.removeItem('aura_admin_auth');
    sessionStorage.removeItem('fj_admin_auth');
    sessionStorage.removeItem('fj_admin_token');
    setEnteredPin('');
    setOtpCode('');
    setDevCodeHint('');
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      showToast('Please enter a valid admin email.');
      return;
    }
    const token = sessionStorage.getItem('fj_admin_token');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'add_admin',
          email: newAdminEmail.trim(),
          name: newAdminName.trim() || 'Admin Team Member',
          role: newAdminRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminTeamList(data.team);
        setNewAdminEmail('');
        setNewAdminName('');
        showToast(`Admin ${newAdminEmail} added successfully.`);
      } else {
        showToast(data.error || 'Failed to add admin.');
      }
    } catch {
      showToast('Failed to add admin.');
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    const token = sessionStorage.getItem('fj_admin_token');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'remove_admin', email }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminTeamList(data.team);
        showToast(`Admin ${email} access revoked.`);
      } else {
        showToast(data.error || 'Failed to remove admin.');
      }
    } catch {
      showToast('Failed to remove admin.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Select a product from sidebar or table to edit in full editor
  const handleSelectProduct = (p: Product) => {
    const existingMetalPrices: Record<string, number> = p.metalPrices
      ? { ...p.metalPrices }
      : PRODUCT_METAL_PRICES[p.id]
      ? { ...PRODUCT_METAL_PRICES[p.id] }
      : {
          '925 Sterling Silver': p.price,
          'Yellow Gold Overlay': p.price,
          'Rose Gold Overlay': p.price,
          'White Gold Overlay': p.price,
          '9k Yellow Gold': p.price + 33461,
          '9k Rose Gold': p.price + 33461,
          '9k White Gold': p.price + 33461,
          '10k Yellow Gold': p.price + 35000,
          '10k Rose Gold': p.price + 35000,
          '10k White Gold': p.price + 35000,
          '14k Yellow Gold': p.price + 48489,
          '14k Rose Gold': p.price + 48489,
          '14k White Gold': p.price + 48489,
          '18k Yellow Gold': p.price + 66021,
          '18k Rose Gold': p.price + 66021,
          '18k White Gold': p.price + 66021,
        };

    const isBand =
      (p.category || '').toLowerCase().includes('band') ||
      (p.name || '').toLowerCase().includes('band') ||
      (p.name || '').toLowerCase().includes('signet');
    const hasCenterStone = p.hasCenterStone !== undefined ? p.hasCenterStone : !isBand;

    setFormData({
      ...p,
      sku: p.sku || `FJS-${(p.shape || 'RNG').toUpperCase()}-${p.id.replace(/[^0-9]/g, '').slice(-4) || '001'}`,
      stockStatus: p.stockStatus || (p.readyToShip ? 'in_stock' : 'made_to_order'),
      stockQuantity: p.stockQuantity ?? 10,
      metaTitle: p.metaTitle || `${p.name} | ForeverJewellStudio`,
      metaDescription: p.metaDescription || (p.description ? p.description.slice(0, 155) : ''),
      isFeatured: p.isFeatured ?? (p.badge === 'BESTSELLER'),
      grossWeight: p.grossWeight || '3.75G',
      karatage: p.karatage || '925 Silver / 14k Gold',
      materialColor: p.materialColor || 'Silver / White / Rose / Yellow Gold',
      diamondType: p.diamondType || 'Lab Grown Moissanite Diamond (Passes Diamond Tester)',
      diamondColor: p.diamondColor || p.colorGrade || 'White (D-Color / Colorless)',
      diamondClarity: p.diamondClarity || p.clarity || 'VVS1 / Flawless (FL)',
      settingStyle: p.settingStyle || p.ringStyle || 'Crown Setting',
      prepaidDiscountNote: p.prepaidDiscountNote || '₹300 OFF on prepaid orders',
      bespokeNotice: p.bespokeNotice || 'BESPOKE! SHIPS IN 2-3 WEEKS!',
      variants: p.variants ? [...p.variants] : [],
      images: p.images ? [...p.images] : [],
      features: p.features ? [...p.features] : [],
      metalPrices: existingMetalPrices,
      hasCenterStone,
    });
    setIsNewListing(false);
    setMainViewMode('editor');
    showToast(`Loaded details for "${p.name}"`);
  };

  // Create brand new product
  const handleCreateNew = () => {
    const newId = `moi-${Date.now().toString().slice(-4)}`;
    const defaultMetalPrices: Record<string, number> = {
      '925 Sterling Silver': 3999,
      'Yellow Gold Overlay': 3999,
      'Rose Gold Overlay': 3999,
      'White Gold Overlay': 3999,
      '9k Yellow Gold': 37460,
      '9k Rose Gold': 37460,
      '9k White Gold': 37460,
      '10k Yellow Gold': 38999,
      '10k Rose Gold': 38999,
      '10k White Gold': 38999,
      '14k Yellow Gold': 52488,
      '14k Rose Gold': 52488,
      '14k White Gold': 52488,
      '18k Yellow Gold': 70020,
      '18k Rose Gold': 70020,
      '18k White Gold': 70020,
    };
    setFormData({
      ...EMPTY_PRODUCT,
      id: newId,
      sku: `FJ-NEW-${newId.slice(-4)}`,
      name: '',
      slug: '',
      images: [],
      metalPrices: defaultMetalPrices,
      hasCenterStone: true,
    });
    setIsNewListing(true);
    setMainViewMode('editor');
    showToast('Ready to add a new product');
  };

  // Metal Pricing Variation Batch Helpers
  const handleUpdateMetalPrice = (metal: string, price: number) => {
    setFormData((prev) => {
      const updated = { ...(prev.metalPrices || {}) };
      if (price <= 0) {
        delete updated[metal];
      } else {
        updated[metal] = price;
      }
      return {
        ...prev,
        metalPrices: updated,
      };
    });
  };

  const handleApplyStandardMetalFormulas = () => {
    const base = formData.price || 3999;
    const formulaPrices: Record<string, number> = {
      '925 Sterling Silver': base,
      'Yellow Gold Overlay': base,
      'Rose Gold Overlay': base,
      'White Gold Overlay': base,
      '9k Yellow Gold': base + 33461,
      '9k Rose Gold': base + 33461,
      '9k White Gold': base + 33461,
      '10k Yellow Gold': base + 35000,
      '10k Rose Gold': base + 35000,
      '10k White Gold': base + 35000,
      '14k Yellow Gold': base + 48489,
      '14k Rose Gold': base + 48489,
      '14k White Gold': base + 48489,
      '18k Yellow Gold': base + 66021,
      '18k Rose Gold': base + 66021,
      '18k White Gold': base + 66021,
    };
    setFormData((prev) => ({
      ...prev,
      metalPrices: formulaPrices,
    }));
    showToast('Applied standard solid gold formulas to all 16 metal tiers');
  };

  const handleSyncOverlaysToBasePrice = () => {
    const base = formData.price || 3999;
    setFormData((prev) => ({
      ...prev,
      metalPrices: {
        ...(prev.metalPrices || {}),
        '925 Sterling Silver': base,
        'Yellow Gold Overlay': base,
        'Rose Gold Overlay': base,
        'White Gold Overlay': base,
      },
    }));
    showToast(`Synced all Gold Overlays to match ₹${base.toLocaleString('en-IN')}`);
  };

  const handleResetToEtsyDefaults = () => {
    if (PRODUCT_METAL_PRICES[formData.id]) {
      setFormData((prev) => ({
        ...prev,
        metalPrices: { ...PRODUCT_METAL_PRICES[formData.id] },
      }));
      showToast('Loaded verified Etsy listing pricing matrix');
    } else {
      handleApplyStandardMetalFormulas();
    }
  };

  // Duplicate current product
  const handleDuplicate = () => {
    const newId = `moi-${Date.now().toString().slice(-4)}`;
    const newSlug = `${formData.slug}-copy-${Date.now().toString().slice(-3)}`;
    setFormData((prev) => ({
      ...prev,
      id: newId,
      sku: `FJ-${(prev.shape || 'RNG').toUpperCase()}-${newId.slice(-4)}`,
      slug: newSlug,
      name: `${prev.name} (Copy)`,
    }));
    setIsNewListing(true);
    setMainViewMode('editor');
    showToast('Duplicated as new product draft');
  };

  // Quick stock quantity adjustment from table view
  const handleQuickStock = async (e: React.MouseEvent, p: Product, delta: number) => {
    e.stopPropagation();
    const currentQty = p.stockQuantity ?? 10;
    const newQty = Math.max(0, currentQty + delta);
    const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 3 ? 'low_stock' : 'in_stock';
    const updated: Product = {
      ...p,
      stockQuantity: newQty,
      stockStatus: newStatus,
      readyToShip: newQty > 0,
    };
    await updateProduct(updated);
    showToast(`Updated "${p.name}" stock to ${newQty}`);
  };

  // Quick toggle featured status
  const handleQuickToggleFeatured = async (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    const updated: Product = {
      ...p,
      isFeatured: !p.isFeatured,
    };
    await updateProduct(updated);
    showToast(`${!p.isFeatured ? '★ Featured on Home' : 'Removed from Featured'}: "${p.name}"`);
  };

  // Quick toggle ready to ship
  const handleQuickToggleReadyToShip = async (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    const updated: Product = {
      ...p,
      readyToShip: !p.readyToShip,
      stockStatus: !p.readyToShip ? 'in_stock' : 'made_to_order',
    };
    await updateProduct(updated);
    showToast(`Updated status for "${p.name}"`);
  };

  // Quick price save
  const handleQuickSavePrice = async (p: Product, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) {
      setQuickEditingPriceId(null);
      return;
    }
    const updated: Product = {
      ...p,
      price: newPrice,
    };
    await updateProduct(updated);
    setQuickEditingPriceId(null);
    showToast(`Price updated to ₹${newPrice.toLocaleString('en-IN')}`);
  };

  // Quick delete from table view
  const handleQuickDelete = async (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete "${p.name}" from your catalog?`)) {
      await deleteProduct(p.id);
      showToast(`Deleted "${p.name}"`);
    }
  };

  // Quick duplicate from table view
  const handleQuickDuplicate = async (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    const newId = `moi-${Date.now().toString().slice(-4)}`;
    const newSlug = `${p.slug}-copy-${Date.now().toString().slice(-3)}`;
    const duplicated: Product = {
      ...p,
      id: newId,
      sku: `FJ-${(p.shape || 'RNG').toUpperCase()}-${newId.slice(-4)}`,
      slug: newSlug,
      name: `${p.name} (Copy)`,
    };
    await addProduct(duplicated);
    showToast(`Duplicated "${p.name}" as new product`);
  };

  // Auto-generate SKU Code
  const handleGenerateSku = () => {
    const shapeCode = (formData.shape || 'RNG').toUpperCase().slice(0, 4);
    const metalCode = formData.metal?.includes('Gold') ? '14K' : '925';
    const num = formData.id.replace(/[^0-9]/g, '').slice(-3) || Math.floor(100 + Math.random() * 900).toString();
    const newSku = `FJ-${shapeCode}-${metalCode}-${num}`;
    setFormData((prev) => ({ ...prev, sku: newSku }));
    showToast(`Generated SKU: ${newSku}`);
  };

  // Export full store catalog backup as JSON
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foreverjewell_store_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('📥 Downloaded complete store catalog JSON backup!');
  };

  // Clean raw congested text into luxury formatted paragraphs
  const handleAutoCleanDescription = () => {
    if (!formData.description) return;
    let text = formData.description;

    text = text
      .replace(/important\*:-?/gi, '')
      .replace(/\*{1,5}/g, '');

    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const narrative: string[] = [];
    const extractedFeatures: string[] = [];

    for (const line of lines) {
      const isRawSpec = /^(Primary Gemstone|Secondary Gemstone|Cut\/Shape|Color|Clarity|Jewelry Type|Metal|Method|Personalization|Occasion|Style|Ring Size|Country of Manufacture|Standard Delivery|Speed Delivery):/i.test(line);
      if (!isRawSpec) {
        narrative.push(line);
      } else if (line.toLowerCase().includes('handmade') || line.toLowerCase().includes('comfort') || line.toLowerCase().includes('box')) {
        extractedFeatures.push(line.replace(/^[•\*\-\s]+/, ''));
      }
    }

    const cleanedNarrative = narrative.join('\n\n');
    setFormData((prev) => ({
      ...prev,
      description: cleanedNarrative || prev.description,
      features: extractedFeatures.length > 0 ? Array.from(new Set([...prev.features, ...extractedFeatures])) : prev.features,
    }));
    showToast('✨ Cleaned description into formatted luxury paragraphs!');
  };

  // Apply rich luxury story presets
  const applyDescriptionTemplate = (templateKey: 'solitaire' | 'artdeco' | 'rosequartz') => {
    if (templateKey === 'solitaire') {
      setFormData((prev) => ({
        ...prev,
        description: `Handcrafted with passion by master artisans in India, this timeless solitaire engagement ring captures pure romance. Features a brilliant center gemstone secured in a high-polish designer claw setting that maximizes fire, brilliance, and light dispersion.\n\nCrafted with a comfort-fit interior band for effortless everyday wear, each ring is cast in certified premium metal with exceptional luster and durability. Arrives ready to gift inside our illuminated signature velvet luxury box with a laboratory authenticity card.`,
      }));
      showToast('Applied Solitaire Romance Story');
    } else if (templateKey === 'artdeco') {
      setFormData((prev) => ({
        ...prev,
        description: `Inspired by royal Art Deco grandeur, this vintage-inspired heirloom ring showcases an exquisite center stone flanked by delicate handcrafted filigree and sparkling brilliant accents.\n\nEvery facet is cut to exacting symmetry, producing unparalleled scintillation and optical fire. Hand-finished with a solid luxury shank, this ring is an enduring symbol of love and artisanal heritage.`,
      }));
      showToast('Applied Art Deco Vintage Story');
    } else if (templateKey === 'rosequartz') {
      setFormData((prev) => ({
        ...prev,
        description: `Handcrafted with passion by master artisans in India, this vintage-inspired Oval Cut Rose Quartz ring captures timeless romantic allure. An ethereal blush-pink oval center gemstone is held securely in an artisan prong setting, flanked by shimmering round brilliant accent stones on a comfort-fit solid band.\n\nDesigned for everyday elegance and milestone moments, each ring is cast in certified premium metal with exceptional luster and durability. Arrives ready to gift inside our illuminated signature luxury box.`,
      }));
      showToast('Applied Rose Quartz Heritage Story');
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${formData.name}" from your store?`)) {
      await deleteProduct(formData.id);
      showToast(`Deleted "${formData.name}"`);
      handleCreateNew();
    }
  };

  // Update Name & auto-generate slug
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: isNewListing ? slug : prev.slug,
    }));
  };

  // =========================================================================
  // SUPABASE CLOUD FILE UPLOAD HANDLER (Zero Lag & Direct Cloud CDN)
  // =========================================================================
  const compressImageForCloud = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/') || file.size < 400 * 1024) return file;
    return new Promise((resolve) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const maxDim = 1800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const cleanName = file.name.replace(/\.[^.]+$/, '') + '.webp';
                resolve(new File([blob], cleanName, { type: 'image/webp' }));
              } else {
                resolve(file);
              }
            },
            'image/webp',
            0.88
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    showToast(`☁️ Optimizing & uploading ${files.length} photo${files.length > 1 ? 's' : ''} to Supabase Cloud...`);

    try {
      const uploadFormData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        const optimizedFile = await compressImageForCloud(rawFile);
        uploadFormData.append('files', optimizedFile);
      }

      const uploadTok = sessionStorage.getItem('fj_admin_token') || '';
      const uploadHeaders: Record<string, string> = uploadTok
        ? { Authorization: `Bearer ${uploadTok}` }
        : {};

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: uploadHeaders,
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.urls) && data.urls.length > 0) {
        setFormData((prev) => {
          const currentImages = prev.images || [];
          return {
            ...prev,
            images: [...currentImages, ...data.urls],
            variants: prev.variants.map((v, i) =>
              i === 0 && !v.image ? { ...v, image: data.urls[0] } : v
            ),
          };
        });
        showToast(`✓ Stored ${data.urls.length} photo${data.urls.length > 1 ? 's' : ''} in Supabase Cloud Storage!`);
      } else {
        showToast(`⚠️ Upload failed: ${data.error || 'Server error uploading to Supabase'}`);
      }
    } catch (err: any) {
      console.error('Cloud upload error:', err);
      showToast(`⚠️ Cloud connection error: ${err?.message || 'Could not reach Supabase upload service'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeviceFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Add single URL
  const handleAddSingleUrl = (url: string) => {
    if (!url.trim()) return;
    if (formData.images.includes(url.trim())) {
      showToast('Image already in gallery');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url.trim()],
    }));
    setSingleUrlInput('');
    showToast('Photo URL added');
  };

  // Add bulk URLs
  const handleAddBulkUrls = () => {
    if (!bulkUrlsInput.trim()) return;
    const urls = bulkUrlsInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 5);

    if (urls.length === 0) return;

    setFormData((prev) => {
      const existing = new Set(prev.images);
      const toAdd = urls.filter((u) => !existing.has(u));
      return {
        ...prev,
        images: [...prev.images, ...toAdd],
      };
    });
    setBulkUrlsInput('');
    showToast(`Added ${urls.length} photo links`);
  };

  // Move photo position (Up/Down)
  const handleMoveImage = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formData.images.length) return;

    setFormData((prev) => {
      const copy = [...prev.images];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return { ...prev, images: copy };
    });
  };

  // Remove photo
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Set as primary cover photo
  const handleSetPrimaryImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [imageUrl, ...prev.images.filter((img) => img !== imageUrl)],
      variants: prev.variants.map((v, i) => i === 0 ? { ...v, image: imageUrl } : v),
    }));
    showToast('Primary cover photo set');
  };

  // Add feature bullet
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()],
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  // Save / Publish product
  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a product name before saving.');
      return;
    }

    const finalId = formData.id || `moi-${Date.now().toString().slice(-4)}`;
    const finalSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const coverPhoto = formData.images.length > 0 ? formData.images[0] : '/images/ai_ring1_front.jpg';

    // Synchronize variant images with uploaded photos so stale placeholders never show
    const cleanVariants = (formData.variants && formData.variants.length > 0)
      ? formData.variants.map((v, i) => {
          const isStale = !v.image || v.image.includes('ai_ring1');
          return {
            ...v,
            image: isStale ? (formData.images[i] || coverPhoto) : v.image,
          };
        })
      : [
          { metal: '925 Sterling Silver', colorCode: '#E2E8F0', image: coverPhoto },
          { metal: '14k Yellow Gold', colorCode: '#CA8A04', image: formData.images[1] || coverPhoto },
          { metal: '14k Rose Gold', colorCode: '#FB7185', image: formData.images[2] || coverPhoto },
        ];

    const finalSku = formData.sku?.trim() || `AUR-${(formData.shape || 'RNG').toUpperCase()}-${finalId.replace(/[^0-9]/g, '').slice(-4) || '001'}`;
    const productToSave: Product = {
      ...formData,
      id: finalId,
      slug: finalSlug,
      sku: finalSku,
      stockStatus: formData.stockStatus || (formData.readyToShip ? 'in_stock' : 'made_to_order'),
      stockQuantity: Number(formData.stockQuantity) || 10,
      metaTitle: formData.metaTitle || `${formData.name} | ForeverJewellStudio`,
      metaDescription: formData.metaDescription || (formData.description ? formData.description.slice(0, 155) : ''),
      isFeatured: formData.isFeatured ?? (formData.badge === 'BESTSELLER'),
      price: Number(formData.price) || 2999,
      originalPrice: Number(formData.originalPrice) || 5999,
      rating: Number(formData.rating) || 5.0,
      reviewsCount: Number(formData.reviewsCount) || 10,
      images: formData.images.length > 0 ? formData.images : ['/images/ai_ring1_front.jpg'],
      variants: cleanVariants,
      metalPrices: formData.metalPrices,
      hasCenterStone: formData.hasCenterStone,
    };

    if (isNewListing) {
      await addProduct(productToSave);
      showToast(`🎉 "${productToSave.name}" published live to store!`);
      setIsNewListing(false);
    } else {
      await updateProduct(productToSave);
      showToast(`✓ "${productToSave.name}" updated successfully!`);
    }
  };

  // Filter and sort products for sidebar & table catalog
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          (p.shape && p.shape.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query)) ||
          (p.badge && p.badge.toLowerCase().includes(query));

        const target = selectedCategoryFilter.toLowerCase().trim();
        const pCat = (p.category || '').toLowerCase().trim();
        const matchCat =
          target === 'all' ||
          pCat === target ||
          ((target === 'necklace' || target === 'necklaces') && (pCat === 'necklace' || pCat === 'necklaces' || pCat === 'pendant')) ||
          ((target === 'rings' || target === 'ring') && (pCat === 'rings' || pCat === 'ring')) ||
          ((target === 'band' || target === 'bands') && (pCat === 'band' || pCat === 'bands')) ||
          ((target === 'earrings' || target === 'earring') && (pCat === 'earrings' || pCat === 'earring')) ||
          ((target === 'bracelet' || target === 'bracelets') && (pCat === 'bracelet' || pCat === 'bracelets')) ||
          ((target === 'nose-ring' || target === 'nose') && (pCat === 'nose-ring' || pCat === 'nose')) ||
          ((target === 'belly-rings' || target === 'belly') && (pCat === 'belly-rings' || pCat === 'belly')) ||
          pCat.includes(target);

        const matchStock =
          selectedStockFilter === 'all' ||
          (selectedStockFilter === 'in_stock' && (p.stockStatus === 'in_stock' || p.readyToShip)) ||
          (selectedStockFilter === 'low_stock' && p.stockStatus === 'low_stock') ||
          (selectedStockFilter === 'out_of_stock' && p.stockStatus === 'out_of_stock');

        const hasVerifiedMetal = !!p.metalPrices || !!PRODUCT_METAL_PRICES[p.id];
        const matchMetal =
          metalPricingFilter === 'all' ||
          (metalPricingFilter === 'verified' && hasVerifiedMetal) ||
          (metalPricingFilter === 'standard' && !hasVerifiedMetal);

        return matchSearch && matchCat && matchStock && matchMetal;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'stock-asc') return (a.stockQuantity ?? 10) - (b.stockQuantity ?? 10);
        if (sortBy === 'stock-desc') return (b.stockQuantity ?? 10) - (a.stockQuantity ?? 10);
        return 0;
      });
  }, [products, searchQuery, selectedCategoryFilter, selectedStockFilter, metalPricingFilter, sortBy]);

  const isFirstMountAdminRef = useRef(true);
  const prevAdminFiltersRef = useRef({
    searchQuery,
    selectedCategoryFilter,
    selectedStockFilter,
    metalPricingFilter,
    sortBy,
    tableItemsPerPage,
    itemsPerPage,
  });

  // Restore admin pagination from URL or sessionStorage on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAdminPage = parseInt(urlParams.get('tablePage') || '', 10);
      const savedAdminPage = parseInt(sessionStorage.getItem('fj_admin_table_page') || '', 10);
      const pageToUse = (!isNaN(urlAdminPage) && urlAdminPage >= 1)
        ? urlAdminPage
        : (!isNaN(savedAdminPage) && savedAdminPage >= 1 ? savedAdminPage : 1);
      if (pageToUse > 1) {
        setTableCurrentPage(pageToUse);
      }

      const savedSidebarPage = parseInt(sessionStorage.getItem('fj_admin_sidebar_page') || '', 10);
      if (!isNaN(savedSidebarPage) && savedSidebarPage > 1) {
        setCurrentPage(savedSidebarPage);
      }
    } catch (e) {}
  }, []);

  // Popstate listener for admin back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const p = parseInt(urlParams.get('tablePage') || '1', 10);
        if (!isNaN(p) && p >= 1) {
          setTableCurrentPage(p);
        }
      } catch (e) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Filter reset effect: ONLY when admin deliberately changes filters
  useEffect(() => {
    if (isFirstMountAdminRef.current) {
      isFirstMountAdminRef.current = false;
      return;
    }

    const prev = prevAdminFiltersRef.current;
    if (
      prev.searchQuery !== searchQuery ||
      prev.selectedCategoryFilter !== selectedCategoryFilter ||
      prev.selectedStockFilter !== selectedStockFilter ||
      prev.metalPricingFilter !== metalPricingFilter ||
      prev.sortBy !== sortBy ||
      prev.tableItemsPerPage !== tableItemsPerPage ||
      prev.itemsPerPage !== itemsPerPage
    ) {
      prevAdminFiltersRef.current = {
        searchQuery,
        selectedCategoryFilter,
        selectedStockFilter,
        metalPricingFilter,
        sortBy,
        tableItemsPerPage,
        itemsPerPage,
      };
      setTableCurrentPage(1);
      setCurrentPage(1);
      try {
        sessionStorage.setItem('fj_admin_table_page', '1');
        sessionStorage.setItem('fj_admin_sidebar_page', '1');
        const url = new URL(window.location.href);
        url.searchParams.delete('tablePage');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  }, [searchQuery, selectedCategoryFilter, selectedStockFilter, metalPricingFilter, sortBy, tableItemsPerPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const tableTotalPages = tableItemsPerPage === 0 ? 1 : Math.ceil(filteredProducts.length / tableItemsPerPage) || 1;

  // Clamp pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (tableCurrentPage > tableTotalPages && tableTotalPages > 0) {
      setTableCurrentPage(tableTotalPages);
    }
  }, [tableTotalPages, tableCurrentPage]);

  const handleTablePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, tableTotalPages));
    setTableCurrentPage(clamped);
    try {
      sessionStorage.setItem('fj_admin_table_page', String(clamped));
      const url = new URL(window.location.href);
      if (clamped > 1) {
        url.searchParams.set('tablePage', String(clamped));
      } else {
        url.searchParams.delete('tablePage');
      }
      window.history.pushState({ tablePage: clamped }, '', url.toString());
    } catch (e) {}
  };

  const handleSidebarPageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(clamped);
    try {
      sessionStorage.setItem('fj_admin_sidebar_page', String(clamped));
    } catch (e) {}
  };

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const startIndex = filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  const tablePaginatedProducts = useMemo(() => {
    if (tableItemsPerPage === 0) return filteredProducts;
    const start = (tableCurrentPage - 1) * tableItemsPerPage;
    return filteredProducts.slice(start, start + tableItemsPerPage);
  }, [filteredProducts, tableCurrentPage, tableItemsPerPage]);

  const tableStartIndex = filteredProducts.length > 0 ? (tableCurrentPage - 1) * tableItemsPerPage + 1 : 0;
  const tableEndIndex = tableItemsPerPage === 0 ? filteredProducts.length : Math.min(tableCurrentPage * tableItemsPerPage, filteredProducts.length);

  // =========================================================================
  // LOCK SCREEN (Protected 2-Factor Authentication Access)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#021A14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#042820] border border-[#D39EAA]/30 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-[#021A14] border-2 border-[#D39EAA] flex items-center justify-center mx-auto mb-5 text-[#D39EAA] shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-mono tracking-widest text-[#D39EAA] uppercase block mb-1">
            Secure Admin Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-white mb-2">
            ForeverJewellStudio Admin
          </h1>

          {authStep === 'PASSWORD' ? (
            <>
              <p className="text-xs text-gray-300 mb-6">
                Enter your administrative credentials to verify identity and dispatch your one-time 2FA security code.
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* 1. Admin Email Manual Input */}
                <div className="text-left space-y-1">
                  <label className="block text-[11px] font-semibold text-[#D39EAA] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Administrator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="admin@foreverjewell.com"
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      className="w-full bg-[#021A14] border border-[#D39EAA]/40 rounded-xl py-3 px-3.5 text-white placeholder-gray-500 font-sans text-sm focus:outline-none focus:border-[#D39EAA] focus:ring-1 focus:ring-[#D39EAA]"
                      autoFocus
                    />
                  </div>
                </div>

                {/* 2. Master Passcode with Reveal/Hide */}
                <div className="text-left space-y-1">
                  <label className="block text-[11px] font-semibold text-[#D39EAA] uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Master Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter master passcode..."
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      className="w-full bg-[#021A14] border border-[#D39EAA]/40 rounded-xl py-3 px-3.5 text-white placeholder-gray-500 font-mono tracking-wider text-sm focus:outline-none focus:border-[#D39EAA] focus:ring-1 focus:ring-[#D39EAA] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D39EAA] transition-colors cursor-pointer"
                      title={showPassword ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pinError && (
                  <p className="text-xs text-rose-400 font-sans flex items-center justify-center gap-1.5 py-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D39EAA] to-[#FADBD8] hover:from-[#FADBD8] hover:to-[#D39EAA] disabled:opacity-50 text-[#592D37] font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{isAuthLoading ? 'Authenticating...' : 'Verify & Send 2FA Code'}</span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <Link href="/" className="hover:text-white flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
                </Link>
                <span className="text-[10px] text-gray-500 font-mono">256-Bit TLS Protected</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl mb-4 text-left">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2FA Code Dispatched</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  A 6-digit one-time code was sent to <strong className="text-white">{maskedEmail}</strong>. Valid for 5 minutes.
                </p>
              </div>

              {devCodeHint && (
                <div className="mb-3 px-3 py-1.5 bg-[#D39EAA]/10 border border-[#D39EAA]/30 rounded-lg text-xs font-mono text-[#D39EAA]">
                  Local Dev Hint: Code is <strong>{devCodeHint}</strong>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5 text-left">
                    Enter 6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-[#021A14] border border-[#D39EAA] rounded-xl py-3.5 px-4 text-center text-white placeholder-gray-600 font-mono tracking-[0.5em] text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#D39EAA]"
                    autoFocus
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-rose-400 font-sans flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading || otpCode.length < 6}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D39EAA] to-[#FADBD8] hover:from-[#FADBD8] hover:to-[#D39EAA] disabled:opacity-50 text-[#592D37] font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>{isAuthLoading ? 'Verifying 2FA...' : 'Verify & Enter Dashboard'}</span>
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('PASSWORD');
                    setPinError('');
                    setOtpCode('');
                  }}
                  className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back / Re-enter Credentials
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isAuthLoading}
                  className="text-[#D39EAA] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN ADMIN INTERFACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#05130F] text-gray-100 flex flex-col font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-[#592D37] text-[#D39EAA] border border-[#D39EAA]/50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-sans text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER BAR */}
      <header className="bg-[#021A14] border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D39EAA] text-[#592D37] flex items-center justify-center font-serif font-bold text-[10px] shadow">
              FJ
            </div>
            <div>
              <h1 className="font-serif text-sm font-bold text-white tracking-wide">
                ForeverJewellStudio
              </h1>
              <p className="text-[10px] text-[#D39EAA] font-mono">
                Store Catalog & Product Manager
              </p>
            </div>
          </div>

          {/* VIEW MODE TOGGLE BUTTONS */}
          <div className="flex items-center bg-black/50 border border-white/15 p-1 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setMainViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainViewMode === 'table'
                  ? 'bg-[#D39EAA] text-[#592D37] shadow'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Products</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full font-mono">
                {products.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMainViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainViewMode === 'editor'
                  ? 'bg-[#D39EAA] text-[#592D37] shadow'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isNewListing ? 'New Listing' : 'Product Editor'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMainViewMode('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mainViewMode === 'orders'
                  ? 'bg-[#D39EAA] text-[#592D37] shadow'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orders</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full font-mono">
                {orders.length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-medium border border-white/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#D39EAA]" />
            <span>Store Live</span>
          </Link>

          <button
            onClick={handleCreateNew}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Product</span>
          </button>

          {mainViewMode === 'editor' && (
            <button
              onClick={handleSaveProduct}
              className="px-4 py-1.5 bg-[#D39EAA] hover:bg-white text-[#592D37] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Product</span>
            </button>
          )}

          <button
            onClick={() => setIsAdminTeamModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D39EAA]/15 hover:bg-[#D39EAA]/25 text-[#D39EAA] border border-[#D39EAA]/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Manage Admin Team & 2FA Security"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin Team & 2FA</span>
          </button>

          <button
            onClick={handleLock}
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Sign Out / Lock Admin Portal"
          >
            <Unlock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DASHBOARD STATS OVERVIEW */}
      {(() => {
        const inStockCount = products.filter(p => p.stockStatus === 'in_stock' || p.readyToShip).length;
        const outOfStockCount = products.filter(p => p.stockStatus === 'out_of_stock').length;
        const lowStockCount = products.filter(p => p.stockStatus === 'low_stock').length;
        const featuredCount = products.filter(p => p.isFeatured).length;
        const verifiedCount = products.filter(p => !!p.metalPrices || !!PRODUCT_METAL_PRICES[p.id]).length;
        const avgPrice = products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0;

        return (
          <div className="bg-[#021A14] border-b border-white/10 px-4 sm:px-8 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedStockFilter('all');
                  setSelectedCategoryFilter('all');
                  setMetalPricingFilter('all');
                  setSearchQuery('');
                  setMainViewMode('table');
                }}
                className={`bg-[#032019] border text-left rounded-xl p-3 hover:border-[#D39EAA]/40 transition-all cursor-pointer ${
                  selectedStockFilter === 'all' && selectedCategoryFilter === 'all' && metalPricingFilter === 'all' && !searchQuery
                    ? 'border-[#D39EAA] ring-1 ring-[#D39EAA]/50'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</span>
                </div>
                <span className="text-lg font-bold text-white block">{products.length}</span>
                <span className="text-[10px] text-gray-500">All products in catalog</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStockFilter('in_stock');
                  setMainViewMode('table');
                }}
                className={`bg-[#032019] border text-left rounded-xl p-3 hover:border-emerald-500/40 transition-all cursor-pointer ${
                  selectedStockFilter === 'in_stock'
                    ? 'border-emerald-500 ring-1 ring-emerald-500/50'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">In Stock</span>
                </div>
                <span className="text-lg font-bold text-emerald-400 block">{inStockCount}</span>
                <span className="text-[10px] text-gray-500">Ready to ship now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStockFilter('low_stock');
                  setMainViewMode('table');
                }}
                className={`bg-[#032019] border text-left rounded-xl p-3 hover:border-amber-500/40 transition-all cursor-pointer ${
                  selectedStockFilter === 'low_stock' || selectedStockFilter === 'out_of_stock'
                    ? 'border-amber-500 ring-1 ring-amber-500/50'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Low / Out</span>
                </div>
                <span className="text-lg font-bold text-amber-400 block">{lowStockCount + outOfStockCount}</span>
                <span className="text-[10px] text-gray-500">{lowStockCount} low, {outOfStockCount} out</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMetalPricingFilter((prev) => (prev === 'verified' ? 'all' : 'verified'));
                  setMainViewMode('table');
                }}
                className={`bg-[#032019] border text-left rounded-xl p-3 hover:border-[#D39EAA]/40 transition-all cursor-pointer ${
                  metalPricingFilter === 'verified'
                    ? 'border-[#D39EAA] ring-1 ring-[#D39EAA]/50'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#D39EAA]/15 flex items-center justify-center">
                    <CheckCheck className="w-3.5 h-3.5 text-[#D39EAA]" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Etsy Synced</span>
                </div>
                <span className="text-lg font-bold text-[#D39EAA] block">{verifiedCount}</span>
                <span className="text-[10px] text-gray-500">Live Etsy metal pricing</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('bestseller');
                  setMainViewMode('table');
                }}
                className="bg-[#032019] border text-left border-white/10 rounded-xl p-3 hover:border-[#D39EAA]/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-[#D39EAA]/15 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#D39EAA]" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Featured</span>
                </div>
                <span className="text-lg font-bold text-[#D39EAA] block">{featuredCount}</span>
                <span className="text-[10px] text-gray-500">On homepage spotlight</span>
              </button>

              <div className="bg-[#032019] border border-white/10 rounded-xl p-3 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Avg Price</span>
                </div>
                <span className="text-lg font-bold text-white block">
                  {formatAdminPrice(avgPrice)}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  ₹{avgPrice.toLocaleString('en-IN')} INR
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CONDITIONAL VIEW: ORDERS MANAGER vs ALL PRODUCTS TABLE vs DEEP PRODUCT EDITOR */}
      {mainViewMode === 'orders' ? (
        <OrdersManager
          orders={orders}
          isLoading={ordersLoading}
          onRefresh={fetchOrders}
          onUpdateStatus={updateOrderStatus}
          updatingOrderId={updatingOrderId}
        />
      ) : mainViewMode === 'table' ? (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
          {/* TOP CONTROLS & FILTER BAR */}
          <div className="bg-[#032019] border border-white/15 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, shape, gemstone, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA]"
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

              {/* Action Buttons & Dropdowns */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#D39EAA]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="default" className="bg-[#021A14]">Sort: Default</option>
                    <option value="price-asc" className="bg-[#021A14]">Price: Low → High</option>
                    <option value="price-desc" className="bg-[#021A14]">Price: High → Low</option>
                    <option value="name-asc" className="bg-[#021A14]">Name: A → Z</option>
                    <option value="stock-asc" className="bg-[#021A14]">Stock: Low → High</option>
                    <option value="stock-desc" className="bg-[#021A14]">Stock: High → Low</option>
                  </select>
                </div>

                {/* Per Page Dropdown */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/20 rounded-xl px-2.5 py-2 text-xs">
                  <span className="text-gray-400 text-[11px]">Show:</span>
                  <select
                    value={tableItemsPerPage}
                    onChange={(e) => setTableItemsPerPage(Number(e.target.value))}
                    className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value={10} className="bg-[#021A14]">10 / page</option>
                    <option value={25} className="bg-[#021A14]">25 / page</option>
                    <option value={50} className="bg-[#021A14]">50 / page</option>
                    <option value={0} className="bg-[#021A14]">All ({filteredProducts.length})</option>
                  </select>
                </div>

                {/* Currency Preview Dropdown */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-[#D39EAA]/40 rounded-xl px-2.5 py-2 text-xs shadow-inner">
                  <Globe className="w-3.5 h-3.5 text-[#D39EAA]" />
                  <span className="text-gray-400 text-[11px] hidden sm:inline">Currency:</span>
                  <select
                    value={adminCurrency}
                    onChange={(e) => setAdminCurrency(e.target.value)}
                    className="bg-transparent text-[#D39EAA] font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="INR" className="bg-[#021A14]">₹ INR (India)</option>
                    <option value="USD" className="bg-[#021A14]">$ USD (USA)</option>
                    <option value="GBP" className="bg-[#021A14]">£ GBP (UK)</option>
                    <option value="EUR" className="bg-[#021A14]">€ EUR (Europe)</option>
                    <option value="CAD" className="bg-[#021A14]">$ CAD (Canada)</option>
                    <option value="AUD" className="bg-[#021A14]">$ AUD (Australia)</option>
                    <option value="AED" className="bg-[#021A14]">AED (UAE)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3 py-2 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-white/15 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Download JSON store catalog backup"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Backup</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-[#D39EAA] hover:bg-white text-[#592D37] rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Product</span>
                </button>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/10">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-full">
                <span className="text-[11px] text-gray-400 font-semibold mr-1 flex-shrink-0">Category:</span>
                {allCategories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.value)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${
                      selectedCategoryFilter === cat.value
                        ? 'bg-[#D39EAA] text-[#592D37] font-bold shadow'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{cat.shortLabel}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedCategoryFilter === cat.value
                          ? 'bg-[#592D37]/20 text-[#592D37]'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Stock Status & Metal Pricing Pills */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs">
                {/* Stock Status Pills */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-semibold mr-1">Stock:</span>
                  {[
                    { id: 'all', label: 'All Stock' },
                    { id: 'in_stock', label: 'In Stock' },
                    { id: 'low_stock', label: 'Low' },
                    { id: 'out_of_stock', label: 'Out' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStockFilter(s.id as any)}
                      className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors text-[11px] font-medium ${
                        selectedStockFilter === s.id
                          ? 'bg-emerald-500 text-black font-bold shadow'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Metal Pricing Filter Pills */}
                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                  <span className="text-[11px] text-gray-400 font-semibold mr-1">Metals:</span>
                  {[
                    { id: 'all', label: 'All Metals' },
                    { id: 'verified', label: '✓ Etsy Synced' },
                    { id: 'standard', label: 'Formula' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setMetalPricingFilter(f.id as any)}
                      className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors text-[11px] font-medium ${
                        metalPricingFilter === f.id
                          ? 'bg-[#D39EAA] text-[#592D37] font-bold shadow'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-[#032019] border border-white/15 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#021A14] text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category & Shape</th>
                    <th className="py-3.5 px-4">Price ({adminCurrency})</th>
                    <th className="py-3.5 px-4">Etsy Variations</th>
                    <th className="py-3.5 px-4">Stock Qty</th>
                    <th className="py-3.5 px-4">Badges & Flags</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tablePaginatedProducts.length > 0 ? (
                    tablePaginatedProducts.map((p) => {
                      const primaryImg = p.images?.[0] || p.variants?.[0]?.image || '/images/ai_ring1_front.jpg';
                      const stockColor =
                        p.stockStatus === 'out_of_stock'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : p.stockStatus === 'low_stock'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      const stockDot =
                        p.stockStatus === 'out_of_stock'
                          ? 'bg-rose-500'
                          : p.stockStatus === 'low_stock'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500';
                      const stockLabel =
                        p.stockStatus === 'out_of_stock'
                          ? 'Out of Stock'
                          : p.stockStatus === 'low_stock'
                          ? 'Low Stock'
                          : 'In Stock';

                      const isEditingPrice = quickEditingPriceId === p.id;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                          onClick={() => handleSelectProduct(p)}
                        >
                          {/* PRODUCT INFO */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/15 flex-shrink-0 group-hover:scale-105 transition-transform">
                                <img
                                  src={getCdnImageUrl(primaryImg, { width: 140, quality: 80 })}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/ai_ring1_front.jpg';
                                  }}
                                />
                                <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] text-gray-300 px-1 font-mono">
                                  {p.images?.length || 0}📷
                                </span>
                              </div>
                              <div className="min-w-0 max-w-xs sm:max-w-sm">
                                <span className="font-serif font-bold text-white text-xs block truncate hover:text-[#D39EAA] transition-colors">
                                  {p.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 font-mono">
                                  <span>SKU: {p.sku || p.id}</span>
                                  {p.carat && <span>• {p.carat}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY & SHAPE */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-[10px] bg-white/10 text-gray-200 px-2 py-0.5 rounded-full capitalize font-medium">
                                {p.category}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {p.shape || 'Standard'} • {p.metal?.split(' ')[0] || 'Silver'}
                              </span>
                            </div>
                          </td>

                          {/* PRICE (WITH INLINE QUICK EDIT & MULTI-CURRENCY CONVERSION) */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            {isEditingPrice ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-400 text-xs">₹</span>
                                <input
                                  type="number"
                                  value={quickPriceVal}
                                  onChange={(e) => setQuickPriceVal(Number(e.target.value))}
                                  className="w-20 bg-black/60 border border-[#D39EAA] rounded px-1.5 py-1 text-xs text-white focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleQuickSavePrice(p, quickPriceVal);
                                    if (e.key === 'Escape') setQuickEditingPriceId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQuickSavePrice(p, quickPriceVal)}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                                  title="Save Price"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQuickEditingPriceId(null)}
                                  className="p-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-[10px] cursor-pointer"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div>
                                  <span className="font-sans font-bold text-emerald-400 text-xs block">
                                    {formatAdminPrice(p.price)}
                                  </span>
                                  {adminCurrency !== 'INR' ? (
                                    <span className="text-[10px] text-gray-400 font-mono block">
                                      ₹{p.price.toLocaleString('en-IN')} INR
                                    </span>
                                  ) : (
                                    p.originalPrice > p.price && (
                                      <span className="text-[10px] text-gray-500 line-through block">
                                        ₹{p.originalPrice.toLocaleString('en-IN')}
                                      </span>
                                    )
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuickEditingPriceId(p.id);
                                    setQuickPriceVal(p.price);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-[#D39EAA] transition-opacity cursor-pointer"
                                  title="Quick Edit Base Price"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* ETSY METAL VARIATIONS PRICING */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            {(() => {
                              const hasVerified = !!p.metalPrices || !!PRODUCT_METAL_PRICES[p.id];
                              const prices = p.metalPrices ?? PRODUCT_METAL_PRICES[p.id] ?? null;
                              const gold14k = prices?.['14k Yellow Gold'] || (p.price + 48489);
                              const gold18k = prices?.['18k Yellow Gold'] || (p.price + 66021);

                              return (
                                <div className="flex flex-col gap-1 items-start">
                                  <div className="flex items-center gap-1.5">
                                    {hasVerified ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-[#D39EAA]/20 text-[#D39EAA] border border-[#D39EAA]/40 px-2 py-0.5 rounded-full">
                                        <span>✓ Etsy Synced</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-medium bg-white/5 text-gray-400 border border-white/10 px-2 py-0.5 rounded-full">
                                        <span>Formula Tier</span>
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectProduct(p);
                                        setActiveTab('variants');
                                      }}
                                      className="text-[10px] text-gray-400 hover:text-[#D39EAA] underline cursor-pointer"
                                      title="Configure metal variation prices"
                                    >
                                      Configure
                                    </button>
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-mono">
                                    <span>14k: {formatAdminPrice(gold14k)}</span>
                                    <span className="mx-1">•</span>
                                    <span>18k: {formatAdminPrice(gold18k)}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          {/* STOCK WITH QUICK +/- */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => handleQuickStock(e, p, -1)}
                                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                title="Decrease stock by 1"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-white text-xs min-w-[20px] text-center">
                                {p.stockQuantity ?? 10}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleQuickStock(e, p, 1)}
                                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                title="Increase stock by 1"
                              >
                                +
                              </button>
                            </div>
                            <span className={`inline-flex items-center gap-1 mt-1 text-[9px] px-2 py-0.5 rounded-full border ${stockColor} font-medium`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${stockDot}`} />
                              <span>{stockLabel}</span>
                            </span>
                          </td>

                          {/* BADGES & FLAGS */}
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Toggle Featured */}
                              <button
                                type="button"
                                onClick={(e) => handleQuickToggleFeatured(e, p)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  p.isFeatured
                                    ? 'bg-[#D39EAA] text-[#592D37] shadow'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                }`}
                                title="Toggle Featured status on Home spotlight"
                              >
                                <span>★</span>
                                <span>{p.isFeatured ? 'Featured' : 'Feature'}</span>
                              </button>

                              {/* Toggle Ready to Ship */}
                              <button
                                type="button"
                                onClick={(e) => handleQuickToggleReadyToShip(e, p)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                                  p.readyToShip
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                                title="Toggle Ready to Ship vs Made to Order"
                              >
                                {p.readyToShip ? 'Ready to Ship' : 'Made to Order'}
                              </button>

                              {p.badge && (
                                <span className="text-[9px] bg-[#D39EAA]/20 text-[#D39EAA] px-1.5 py-0.5 rounded font-bold">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                className="p-1.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="View live on store website"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#D39EAA]" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleSelectProduct(p)}
                                className="px-2.5 py-1.5 bg-[#D39EAA] hover:bg-white text-[#592D37] rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
                                title="Edit all product specs, photos, pricing, story"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleQuickDuplicate(e, p)}
                                className="p-1.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Duplicate product"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => window.open(`/products/${p.slug}`, '_blank')}
                                className="p-1.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                title="View on Live Store"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleQuickDelete(e, p)}
                                className="p-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-300 rounded-lg transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Package className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold">No products found</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Try adjusting your search query or filters.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategoryFilter('all');
                            setSelectedStockFilter('all');
                          }}
                          className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE PAGINATION BAR */}
            {tableItemsPerPage > 0 && tableTotalPages > 1 && (
              <div className="p-4 bg-[#021711] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-gray-400">
                  Showing {filteredProducts.length > 0 ? `${tableStartIndex}–${tableEndIndex}` : 0} of{' '}
                  {filteredProducts.length} products
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={tableCurrentPage <= 1}
                    onClick={() => handleTablePageChange(tableCurrentPage - 1)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:hover:bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(tableTotalPages, 7) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleTablePageChange(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            tableCurrentPage === pageNum
                              ? 'bg-[#D39EAA] text-[#592D37]'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {tableTotalPages > 7 && <span className="text-gray-500 px-1">…</span>}
                  </div>

                  <button
                    type="button"
                    disabled={tableCurrentPage >= tableTotalPages}
                    onClick={() => handleTablePageChange(tableCurrentPage + 1)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:hover:bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* WORKSPACE GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* =================================================================== */}
        {/* LEFT COLUMN: PRODUCT CATALOG BROWSER (4 COLS)                       */}
        {/* =================================================================== */}
        <aside className="lg:col-span-4 bg-[#031E18] border-r border-white/10 flex flex-col h-auto lg:h-[calc(100vh-167px)]">
          {/* Mobile Drawer Bar (Prevents scrolling through 100 items on phone) */}
          <div className="lg:hidden p-3 bg-[#021A14] border-b border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsMobileCatalogOpen(!isMobileCatalogOpen)}
              className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-[#D39EAA]" />
              <span>Catalog ({filteredProducts.length} Rings)</span>
              <span className="text-[10px] text-[#D39EAA] bg-[#D39EAA]/15 px-2 py-0.5 rounded-full font-semibold">
                {isMobileCatalogOpen ? '▲ Collapse' : '▼ Browse Products'}
              </span>
            </button>
            <span className="text-[11px] text-gray-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Catalog Body (Always visible on desktop, toggleable on mobile) */}
          <div className={`${isMobileCatalogOpen ? 'flex' : 'hidden lg:flex'} flex-col flex-1 min-h-0`}>
            {/* Search & Category Filter */}
            <div className="p-3.5 border-b border-white/10 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA]"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {allCategories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.value)}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition-colors text-[10px] font-medium flex items-center gap-1 flex-shrink-0 ${
                      selectedCategoryFilter === cat.value
                        ? 'bg-[#D39EAA] text-[#592D37] font-bold'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{cat.shortLabel}</span>
                    <span className="opacity-70 text-[9px]">({cat.count})</span>
                  </button>
                ))}
              </div>

              {/* Items Counter & Per-Page Selector */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>
                  Showing {filteredProducts.length > 0 ? `${startIndex}–${endIndex}` : 0} of {filteredProducts.length} items
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Paginated Products List (5 items per page) */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 min-h-[300px] lg:min-h-0">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const isSelected = formData.id === p.id && !isNewListing;
                  const primaryImg = p.images?.[0] || p.variants?.[0]?.image || '/images/ai_ring1_front.jpg';
                  const stockColor = p.stockStatus === 'out_of_stock' ? 'bg-rose-500' : p.stockStatus === 'low_stock' ? 'bg-amber-500' : 'bg-emerald-500';
                  const stockLabel = p.stockStatus === 'out_of_stock' ? 'Out' : p.stockStatus === 'low_stock' ? 'Low' : 'In Stock';

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        handleSelectProduct(p);
                        setIsMobileCatalogOpen(false);
                      }}
                      className={`p-3 flex items-start gap-3 cursor-pointer transition-all group rounded-xl ${
                        isSelected
                          ? 'bg-[#06382C] ring-1 ring-[#D39EAA]/60 shadow-md'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Product Thumbnail */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={getCdnImageUrl(primaryImg, { width: 140, quality: 80 })}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover bg-black/40 border border-white/15 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = '/images/ai_ring1_front.jpg';
                          }}
                        />
                        {/* Stock dot */}
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${stockColor} border-2 border-[#031E18] shadow`} title={stockLabel} />
                        {/* Photo count badge */}
                        <span className="absolute -bottom-1 -right-1 text-[8px] bg-black/80 text-gray-300 px-1 py-0.5 rounded font-mono border border-white/10">
                          {p.images?.length || 0}📷
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-serif text-xs font-bold text-white truncate block leading-tight">
                            {p.name}
                          </span>
                        </div>

                        {/* Price + Badge Row */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="font-sans text-xs font-bold text-emerald-400">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          {p.originalPrice > p.price && (
                            <span className="text-[9px] text-gray-500 line-through">
                              ₹{p.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {p.badge && (
                            <span className="text-[8px] bg-[#D39EAA]/20 text-[#D39EAA] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                              {p.badge}
                            </span>
                          )}
                        </div>

                        {/* Meta Row: Category, Shape, Stock Qty */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] bg-white/8 text-gray-400 px-1.5 py-0.5 rounded capitalize border border-white/5">
                            {p.category}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            {p.shape}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            • Qty: {p.stockQuantity ?? '–'}
                          </span>
                          {p.isFeatured && (
                            <span className="text-[8px] text-[#D39EAA]">★</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No products found matching your search.
                </div>
              )}
            </div>

            {/* Bottom Pagination Bar */}
            {totalPages > 1 && (
              <div className="p-3 bg-[#021711] border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => handleSidebarPageChange(currentPage - 1)}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:hover:bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-[11px] font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {totalPages <= 5 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleSidebarPageChange(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#D39EAA] text-[#592D37] shadow'
                            : 'bg-black/30 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono">
                      <span className="text-[#D39EAA] font-bold">{currentPage}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-400">{totalPages}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => handleSidebarPageChange(currentPage + 1)}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:hover:bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-[11px] font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: MAIN PRODUCT EDITOR WORKSPACE (8 COLS)                */}
        {/* =================================================================== */}
        <main className="lg:col-span-8 flex flex-col h-auto lg:h-[calc(100vh-167px)] overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#041611]">
          {/* Top Product Banner */}
          <div className="bg-[#02241D] border border-[#D39EAA]/30 p-5 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-4">
              {/* Mini thumbnail preview */}
              {formData.images.length > 0 && (
                <img
                  src={formData.images[0]}
                  alt={formData.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#D39EAA]/30 shadow-md flex-shrink-0 hidden sm:block"
                  onError={(e) => { e.currentTarget.src = '/images/ai_ring1_front.jpg'; }}
                />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#D39EAA]">
                    {isNewListing ? '✨ Adding New Product' : `✏️ Editing: ${formData.id}`}
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-700">
                    {formData.readyToShip ? 'Ready to Ship' : 'Made to Order'}
                  </span>
                  {formData.badge && (
                    <span className="text-[10px] bg-[#D39EAA]/20 text-[#D39EAA] px-2 py-0.5 rounded font-bold">
                      {formData.badge}
                    </span>
                  )}
                </div>
                <div className="mt-2 w-full max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter product title / name..."
                      className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#021A14] border border-[#D4AF37]/50 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 font-serif text-base sm:text-xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner pr-10"
                      title="Click to edit product name"
                    />
                    <Edit3 className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 px-1">
                    <span className="text-[#D4AF37]/80 flex items-center gap-1 font-sans font-medium">
                      <Edit3 className="w-3 h-3" /> Edit product name directly above
                    </span>
                    <span className="font-mono text-gray-500">{formData.name.length} chars</span>
                  </div>
                </div>
                {/* Quick stats row */}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-emerald-400 font-bold">₹{formData.price.toLocaleString('en-IN')}</span>
                  {formData.originalPrice > formData.price && (
                    <span className="text-[10px] text-gray-500 line-through">₹{formData.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-400">{formData.images.length} photos</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-400 capitalize">{formData.category}</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-400">Qty: {formData.stockQuantity ?? 10}</span>
                  {formData.slug && (
                    <>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-500 font-mono">/{formData.slug}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setMainViewMode('table')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-[#D39EAA] hover:text-white text-xs font-semibold rounded-xl transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
                title="Return to Catalog Table"
              >
                <Table className="w-3.5 h-3.5" />
                <span>All Products</span>
              </button>

              {!isNewListing && (
                <>
                  <button
                    type="button"
                    onClick={() => window.open(`/products/${formData.slug}`, '_blank')}
                    className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold rounded-xl transition-colors border border-emerald-700/60 flex items-center gap-1.5 cursor-pointer"
                    title="View this product live on store"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View on Store</span>
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-xl transition-colors border border-rose-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-2 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs font-semibold rounded-xl border border-white/15 flex items-center gap-1.5 cursor-pointer"
                title="Download JSON store catalog backup"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Backup</span>
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-5 py-2.5 bg-[#D39EAA] hover:bg-white text-[#592D37] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save to Store</span>
              </button>
            </div>
          </div>

          {/* Clean High-Visibility Navigation Pills (Never cut off!) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#021A14] p-2 rounded-2xl border border-white/10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('media')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'media'
                    ? 'bg-[#D39EAA] text-[#592D37] shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>1. Photos ({formData.images.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-[#D39EAA] text-[#592D37] shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Gem className="w-3.5 h-3.5" />
                <span>2. Title, Gemstones & Specs</span>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'pricing'
                    ? 'bg-[#D39EAA] text-[#592D37] shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>3. Pricing, Stock & SKU</span>
              </button>

              <button
                onClick={() => setActiveTab('variants')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'variants'
                    ? 'bg-[#D39EAA] text-[#592D37] shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>4. Metal Swatches</span>
              </button>

              <button
                onClick={() => setActiveTab('story')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'story'
                    ? 'bg-[#D39EAA] text-[#592D37] shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>5. Description & Story</span>
              </button>

              <button
                onClick={() => setActiveTab('seo')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'seo'
                    ? 'bg-[#D39EAA] text-[#592D37] shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>6. SEO & Badges</span>
              </button>
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'tabs' ? 'all' : 'tabs')}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-[11px] font-semibold rounded-lg border border-white/10 transition-colors ml-auto cursor-pointer"
            >
              {viewMode === 'tabs' ? '📜 View All Sections' : '📑 Tabbed View'}
            </button>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: REAL DEVICE PHOTO UPLOADER (The core feature requested)    */}
          {/* ================================================================= */}
          {(activeTab === 'media' || viewMode === 'all') && (
            <div className="bg-[#032019] p-5 sm:p-7 rounded-2xl border border-white/15 space-y-6 mb-6 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#D39EAA]" />
                    Product Photos & Gallery
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Upload photos directly from your computer or phone. Support all angles (front, side claw, on-hand, box, certificate).
                  </p>
                </div>
                <span className="bg-[#D39EAA]/20 text-[#D39EAA] font-mono text-xs font-bold px-3 py-1 rounded-full border border-[#D39EAA]/40">
                  {formData.images.length} Photos in Gallery
                </span>
              </div>

              {/* REAL DEVICE FILE DROPZONE */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#D39EAA] bg-[#D39EAA]/10 scale-101'
                    : 'border-white/25 hover:border-[#D39EAA]/80 bg-black/30 hover:bg-black/40'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleDeviceFileInput}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-full bg-[#592D37] border border-[#D39EAA]/50 text-[#D39EAA] flex items-center justify-center mx-auto mb-3 shadow-md">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h4 className="text-sm font-bold text-white mb-1">
                  Click to Choose Photos from your Device (Computer / Phone)
                </h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto mb-3">
                  Or drag and drop multiple image files here. Supports JPG, PNG, WEBP.
                </p>

                <button
                  type="button"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#D39EAA] to-[#FADBD8] text-[#592D37] font-bold text-xs rounded-xl shadow cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Browse Device Files</span>
                </button>

                {isUploading && (
                  <p className="text-xs text-emerald-400 font-semibold mt-3 animate-pulse">
                    Processing and adding photos...
                  </p>
                )}
              </div>

              {/* Active Photos Management Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-200">
                    Current Photos ({formData.images.length}) — Click &lsquo;Set as Cover&rsquo; or delete anytime:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUrlInputs(!showUrlInputs)}
                    className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
                  >
                    {showUrlInputs ? 'Hide URL inputs' : '+ Or paste external image URLs'}
                  </button>
                </div>

                {formData.images.length === 0 ? (
                  <div className="p-8 text-center bg-black/20 rounded-xl border border-white/10 text-gray-400 text-xs">
                    No photos added yet. Click &lsquo;Browse Device Files&rsquo; above to upload your ring photos!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group aspect-square rounded-xl overflow-hidden bg-black/60 border transition-all ${
                          idx === 0
                            ? 'border-[#D39EAA] ring-2 ring-[#D39EAA]/50 shadow-lg'
                            : 'border-white/20 hover:border-white/50'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Product view ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/ai_ring1_front.jpg';
                          }}
                        />

                        {/* Cover Badge */}
                        <span
                          className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow z-10 ${
                            idx === 0
                              ? 'bg-[#D39EAA] text-[#592D37]'
                              : 'bg-black/80 text-gray-300'
                          }`}
                        >
                          {idx === 0 ? '★ Primary Cover' : `#${idx + 1}`}
                        </span>

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(img)}
                              className="w-full py-1 bg-[#D39EAA] hover:bg-white text-[#592D37] text-[10px] font-bold rounded cursor-pointer transition-colors"
                            >
                              Set as Cover
                            </button>
                          )}
                          <div className="flex gap-1 w-full justify-center">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'up')}
                                className="p-1 bg-white/20 hover:bg-white/40 text-white rounded text-[10px] cursor-pointer"
                                title="Move Earlier"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx < formData.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'down')}
                                className="p-1 bg-white/20 hover:bg-white/40 text-white rounded text-[10px] cursor-pointer"
                                title="Move Later"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] ml-auto cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional URL input fallback (clean and non-intrusive) */}
              {showUrlInputs && (
                <div className="pt-4 border-t border-white/10 space-y-3 bg-black/20 p-4 rounded-xl">
                  <span className="text-xs font-semibold text-gray-300 block">
                    Optional URL Add (If you already have hosted links):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste single image URL (https://...)"
                      value={singleUrlInput}
                      onChange={(e) => setSingleUrlInput(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSingleUrl(singleUrlInput)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      placeholder="Or paste multiple URLs (separated by lines or commas)"
                      value={bulkUrlsInput}
                      onChange={(e) => setBulkUrlsInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA] font-mono"
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={handleAddBulkUrls}
                        className="px-3 py-1.5 bg-[#D39EAA] hover:bg-white text-[#592D37] text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Add Bulk URLs
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: ITEM DETAILS & GEMSTONE SPECIFICATIONS                      */}
          {/* ================================================================= */}
          {(activeTab === 'specs' || viewMode === 'all') && (
            <div className="bg-[#032019] p-5 sm:p-7 rounded-2xl border border-white/15 space-y-6 mb-6 shadow-md">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <Gem className="w-4 h-4 text-[#D39EAA]" />
                Product Title & Gemstone Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oval Cut Rose Quartz Engagement Ring, 14k Solid Gold"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                    >
                      {CATEGORY_DEFINITIONS.filter((c) => c.value !== 'all').map((c) => (
                        <option key={c.value} value={c.value} className="bg-[#021A14]">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Gemstone Shape
                    </label>
                    <select
                      value={formData.shape}
                      onChange={(e: any) => setFormData({ ...formData, shape: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                    >
                      {SHAPES.filter((s) => s.value !== 'all').map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Badge / Tag (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RARE FIND, BESTSELLER"
                      value={formData.badge || ''}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>
                </div>

                {/* Specific Gemstone Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Primary Gemstone *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Natural Rose Quartz or GRA Moissanite"
                      value={formData.primaryGemstone || ''}
                      onChange={(e) => setFormData({ ...formData, primaryGemstone: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Secondary Gemstone(s)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Round CZ Diamonds / Lab Diamonds"
                      value={formData.secondaryGemstone || ''}
                      onChange={(e) => setFormData({ ...formData, secondaryGemstone: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>
                </div>

                {/* Solitaire Center Stone Toggle & Specs */}
                <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#D39EAA]" />
                        <span>Center Stone Solitaire Carat Selection</span>
                      </label>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formData.hasCenterStone !== false
                          ? 'Active: Shoppers can choose center stone carat and review 4Cs specifications.'
                          : 'Disabled: Plain Band / Eternity Band / Signet Ring mode (carat selection hidden from customers).'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasCenterStone !== false}
                        onChange={(e) => setFormData({ ...formData, hasCenterStone: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D39EAA]"></div>
                    </label>
                  </div>

                  {formData.hasCenterStone !== false ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/10">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Carat Weight
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2.00 CT"
                          value={formData.carat}
                          onChange={(e) => setFormData({ ...formData, carat: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Color Grade
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Blush Pink / D-Color"
                          value={formData.colorGrade}
                          onChange={(e) => setFormData({ ...formData, colorGrade: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Clarity Grade
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. VVS1 / Eye Clean"
                          value={formData.clarity}
                          onChange={(e) => setFormData({ ...formData, clarity: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Cut Symmetry
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Oval Brilliant Cut"
                          value={formData.cut}
                          onChange={(e) => setFormData({ ...formData, cut: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Solitaire carat specs are suppressed for this item. Perfect for eternity bands and plain signet rings.</span>
                    </div>
                  )}
                </div>

                {/* Sizing Standard Information Card */}
                <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D39EAA]/15 flex items-center justify-center text-[#D39EAA]">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block">Standard US Ring Sizes Offered</span>
                      <span className="text-[11px] text-gray-400">
                        US 3.0 to US 14.0 (23 full & half sizes, 14.0 mm to 22.6 mm comfort fit)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md border border-emerald-500/30">
                    Auto-Mapped Size Drawer
                  </span>
                </div>

                {/* Woke Collection Specifications Card Section */}
                <div className="bg-black/30 border border-[#D39EAA]/30 rounded-xl p-4 sm:p-5 space-y-4">
                  <h4 className="text-xs font-bold text-[#D39EAA] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-[#D39EAA]" />
                    <span>Luxury Specification Card Settings (Woke Collection Style)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Karatage
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 925/14k Gold"
                        value={formData.karatage || ''}
                        onChange={(e) => setFormData({ ...formData, karatage: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Material Colour
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Silver/White/Rose"
                        value={formData.materialColor || ''}
                        onChange={(e) => setFormData({ ...formData, materialColor: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Gross Weight
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3.75G"
                        value={formData.grossWeight || ''}
                        onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Diamond Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lab Grown Moissanite Diamond"
                        value={formData.diamondType || ''}
                        onChange={(e) => setFormData({ ...formData, diamondType: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Setting Architecture
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Crown Setting / Solitaire Prong"
                        value={formData.settingStyle || ''}
                        onChange={(e) => setFormData({ ...formData, settingStyle: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Bespoke Timeline Notice
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BESPOKE! SHIPS IN 2-3 WEEKS!"
                        value={formData.bespokeNotice || ''}
                        onChange={(e) => setFormData({ ...formData, bespokeNotice: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Prepaid Discount Ribbon (Badge on Buy Button)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹300 OFF on prepaid orders"
                      value={formData.prepaidDiscountNote || ''}
                      onChange={(e) => setFormData({ ...formData, prepaidDiscountNote: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Jewelry Style
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Art Deco / Vintage Solitaire"
                      value={formData.ringStyle || ''}
                      onChange={(e) => setFormData({ ...formData, ringStyle: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Occasion
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Engagement, Anniversary, Valentine Gift"
                      value={formData.occasion || ''}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: PRICING, INVENTORY & SKU MANAGEMENT                        */}
          {/* ================================================================= */}
          {(activeTab === 'pricing' || viewMode === 'all') && (
            <div className="bg-[#032019] p-5 sm:p-7 rounded-2xl border border-white/15 space-y-6 mb-6 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D39EAA]" />
                  Pricing, Stock Inventory & Vault SKU
                </h3>
                {formData.originalPrice > formData.price && (
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full text-[11px] border border-emerald-500/40">
                    {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% OFF (Saves ₹{(formData.originalPrice - formData.price).toLocaleString('en-IN')})
                  </span>
                )}
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value);
                      setFormData((prev) => {
                        const updatedPrices = { ...(prev.metalPrices || {}) };
                        // Auto-keep 925 silver and plated overlays matched to base price
                        updatedPrices['925 Sterling Silver'] = newPrice;
                        updatedPrices['Yellow Gold Overlay'] = newPrice;
                        updatedPrices['Rose Gold Overlay'] = newPrice;
                        updatedPrices['White Gold Overlay'] = newPrice;
                        return {
                          ...prev,
                          price: newPrice,
                          metalPrices: updatedPrices,
                        };
                      });
                    }}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-sm text-emerald-400 font-bold focus:outline-none focus:border-[#D39EAA]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Actual checkout price charged to the customer for base 925 Sterling Silver & Gold Overlays.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Original MRP (₹) (Strike-through price)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-sm text-gray-400 focus:outline-none focus:border-[#D39EAA]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Used to showcase exclusive discount savings.
                  </span>
                </div>
              </div>

              {/* International Price Conversion Live Preview */}
              <div className="p-4 bg-black/30 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#D39EAA]" />
                    Live Multi-Currency Price Conversion
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Baseline: ₹{formData.price.toLocaleString('en-IN')} INR
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                  {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED'].map((curCode) => {
                    const c = SUPPORTED_CURRENCIES[curCode];
                    if (!c) return null;
                    const val = Math.round(formData.price * c.rate);
                    return (
                      <div key={curCode} className="p-2 bg-black/40 border border-white/10 rounded-lg text-center">
                        <span className="text-[10px] text-gray-400 font-medium block">{curCode}</span>
                        <span className="text-xs font-bold text-white block">{c.symbol}{val.toLocaleString('en-US')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Metal Pricing Card with Tab 4 Jump */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-black/60 border border-[#D39EAA]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#D39EAA] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Precious Metal Variation Pricing
                  </span>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Silver/Overlays: ₹{formData.price.toLocaleString('en-IN')} • 
                    10k Gold: ₹{((formData.metalPrices?.['10k Yellow Gold']) || (formData.price + 35000)).toLocaleString('en-IN')} • 
                    14k Gold: ₹{((formData.metalPrices?.['14k Yellow Gold']) || (formData.price + 48489)).toLocaleString('en-IN')} • 
                    18k Gold: ₹{((formData.metalPrices?.['18k Yellow Gold']) || (formData.price + 66021)).toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('variants')}
                  className="px-3.5 py-1.5 bg-[#D39EAA] hover:bg-white text-[#592D37] text-xs font-bold rounded-lg transition-all shadow cursor-pointer whitespace-nowrap"
                >
                  Configure 16 Metal Tiers in Tab 4 →
                </button>
              </div>

              {/* SKU & Inventory Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-300">
                      Vault SKU (Stock Code)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[10px] text-[#D39EAA] hover:underline cursor-pointer"
                    >
                      ⚡ Auto-Gen
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. AUR-OVAL-925-016"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={formData.stockStatus || (formData.readyToShip ? 'in_stock' : 'made_to_order')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockStatus: e.target.value,
                        readyToShip: e.target.value === 'in_stock',
                      })
                    }
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                  >
                    <option value="in_stock" className="bg-[#032019]">🟢 In Stock (Ready to Ship)</option>
                    <option value="made_to_order" className="bg-[#032019]">🔵 Made to Order (3-5 Days)</option>
                    <option value="low_stock" className="bg-[#032019]">🟠 Low Stock Warning</option>
                    <option value="out_of_stock" className="bg-[#032019]">🔴 Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Units in Vault / Inventory
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity ?? 10}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>
              </div>

              {/* Delivery & Certificate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Delivery Estimate Guarantee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4-7 Days Free Express Delivery"
                    value={formData.deliveryTime || ''}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Laboratory Certificate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GRA Lab Authenticity Report"
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.readyToShip}
                    onChange={(e) => setFormData({ ...formData, readyToShip: e.target.checked })}
                    className="w-4 h-4 rounded text-[#D39EAA] focus:ring-[#D39EAA]"
                  />
                  <span>Mark as Ready to Ship in 24–48 Hours</span>
                </label>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: PRECIOUS METAL VARIATIONS & LIVE ETSY PRICING MATRIX       */}
          {/* ================================================================= */}
          {(activeTab === 'variants' || viewMode === 'all') && (
            <div className="bg-[#032019] p-5 sm:p-7 rounded-2xl border border-white/15 space-y-6 mb-6 shadow-md">
              {/* Header & Quick Action Buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#D39EAA]" />
                    <span>Precious Metal Variation Pricing & Swatches</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage exact selling prices for 925 Silver, Plated Overlays, and 9k/10k/14k/18k Solid Gold tiers. Customer selections will dynamically update the checkout price.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSyncOverlaysToBasePrice}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white rounded-lg text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Set Gold Overlays equal to 925 Silver base price"
                  >
                    <span>⚡ Sync Overlays</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyStandardMetalFormulas}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white rounded-lg text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Calculate +33.4k (9k), +35k (10k), +48.5k (14k), +66k (18k)"
                  >
                    <span>⚡ Standard Karat Addons</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToEtsyDefaults}
                    className="px-3.5 py-1.5 bg-[#D39EAA] hover:bg-white text-[#592D37] rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                    title="Reset to verified live Etsy shop pricing"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Load Etsy Defaults</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-gray-300 font-medium">
                    {PRODUCT_METAL_PRICES[formData.id]
                      ? '✓ Verified Etsy Shop Listing — Exact synchronized metal price matrix active'
                      : 'ℹ️ Custom Formula Pricing Active — Calculated from standard verified gold premiums'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">Preview Currency:</span>
                  <span className="font-bold text-[#D39EAA] font-mono px-2 py-0.5 bg-black/50 border border-[#D39EAA]/30 rounded">
                    {adminCurrency}
                  </span>
                </div>
              </div>

              {/* Metal Pricing Matrix Grid */}
              <div className="space-y-4">
                {[
                  {
                    groupName: '925 Sterling Silver & Plated Overlays (Base Tiers)',
                    description: 'Cast in certified 925 sterling silver; yellow/rose/white overlays are 18k thick plated.',
                    metals: [
                      { metal: '925 Sterling Silver', colorCode: '#C0C5CE', defaultOffset: 0 },
                      { metal: 'Yellow Gold Overlay', colorCode: '#D39EAA', defaultOffset: 0 },
                      { metal: 'Rose Gold Overlay', colorCode: '#E8927C', defaultOffset: 0 },
                      { metal: 'White Gold Overlay', colorCode: '#E5E7EB', defaultOffset: 0 },
                    ],
                  },
                  {
                    groupName: '9k Solid Gold (Affordable Luxury)',
                    description: 'Solid 9k gold (37.5% pure gold alloy), hallmark certified.',
                    metals: [
                      { metal: '9k Yellow Gold', colorCode: '#C8A951', defaultOffset: 33461 },
                      { metal: '9k Rose Gold', colorCode: '#D4826A', defaultOffset: 33461 },
                      { metal: '9k White Gold', colorCode: '#B8BEC7', defaultOffset: 33461 },
                    ],
                  },
                  {
                    groupName: '10k Solid Gold (Etsy International Standard)',
                    description: 'Solid 10k gold (41.7% pure gold alloy), popular worldwide.',
                    metals: [
                      { metal: '10k Yellow Gold', colorCode: '#C8A951', defaultOffset: 35000 },
                      { metal: '10k Rose Gold', colorCode: '#D4826A', defaultOffset: 35000 },
                      { metal: '10k White Gold', colorCode: '#B8BEC7', defaultOffset: 35000 },
                    ],
                  },
                  {
                    groupName: '14k Solid Gold (Flagship Fine Jewelry)',
                    description: 'Solid 14k gold (58.3% pure gold alloy), most popular engagement ring karat.',
                    metals: [
                      { metal: '14k Yellow Gold', colorCode: '#CA8A04', defaultOffset: 48489 },
                      { metal: '14k Rose Gold', colorCode: '#E0796A', defaultOffset: 48489 },
                      { metal: '14k White Gold', colorCode: '#CBD5E1', defaultOffset: 48489 },
                    ],
                  },
                  {
                    groupName: '18k Solid Gold (Royal Heirloom Standard)',
                    description: 'Solid 18k gold (75.0% pure gold alloy), premium rich luster.',
                    metals: [
                      { metal: '18k Yellow Gold', colorCode: '#B8860B', defaultOffset: 66021 },
                      { metal: '18k Rose Gold', colorCode: '#C97B6E', defaultOffset: 66021 },
                      { metal: '18k White Gold', colorCode: '#94A3B8', defaultOffset: 66021 },
                    ],
                  },
                ].map((grp, gIdx) => (
                  <div key={gIdx} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/10 gap-1">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {grp.groupName}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {grp.description}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {grp.metals.map((mItem) => {
                        const currentPrice =
                          formData.metalPrices?.[mItem.metal] ??
                          PRODUCT_METAL_PRICES[formData.id]?.[mItem.metal] ??
                          (formData.price + mItem.defaultOffset);
                        const isOffered = (formData.metalPrices?.[mItem.metal] ?? 1) > 0;
                        const diffFromBase = currentPrice - formData.price;

                        return (
                          <div
                            key={mItem.metal}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isOffered
                                ? 'bg-black/40 border-white/15'
                                : 'bg-black/20 border-white/5 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-4 h-4 rounded-full border border-white/40 flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: mItem.colorCode }}
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-xs text-white block truncate">
                                  {mItem.metal}
                                </span>
                                <span className="text-[10px] text-gray-400 block font-mono">
                                  {diffFromBase > 0 ? `+₹${diffFromBase.toLocaleString('en-IN')}` : 'Base Price'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    value={currentPrice}
                                    onChange={(e) => handleUpdateMetalPrice(mItem.metal, Number(e.target.value))}
                                    className="w-24 bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs font-bold text-emerald-400 text-right focus:outline-none focus:border-[#D39EAA]"
                                  />
                                </div>
                                <span className="text-[10px] text-[#D39EAA] font-semibold mt-0.5">
                                  ≈ {formatAdminPrice(currentPrice)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleUpdateMetalPrice(mItem.metal, isOffered ? 0 : (formData.price + mItem.defaultOffset))}
                                className={`text-[10px] px-2 py-1 rounded-md cursor-pointer transition-colors font-semibold ${
                                  isOffered
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-white/5 text-gray-500 hover:text-white'
                                }`}
                                title={isOffered ? 'Tier Offered (Click to disable)' : 'Tier Disabled (Click to enable)'}
                              >
                                {isOffered ? 'Active' : 'Off'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Swatch Photo & Color Mapping Sub-section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D39EAA]" />
                    <span>Visual Swatch Photo & Hex Code Mapping</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        variants: [
                          ...formData.variants,
                          {
                            metal: 'Custom Metal Tier',
                            colorCode: '#E2E8F0',
                            image: formData.images[0] || '/images/ai_ring1_front.jpg',
                          },
                        ],
                      });
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    + Add Custom Swatch
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span
                          className="w-5 h-5 rounded-full border border-white/30 flex-shrink-0"
                          style={{ backgroundColor: v.colorCode }}
                        />
                        <input
                          type="text"
                          value={v.metal}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].metal = e.target.value;
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="bg-transparent border-b border-white/20 p-1 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <input
                          type="text"
                          placeholder="Hex (#CA8A04)"
                          value={v.colorCode}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].colorCode = e.target.value;
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="w-24 bg-transparent border-b border-white/20 p-1 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#D39EAA]"
                        />
                        <input
                          type="text"
                          placeholder="Image URL for this metal swatch"
                          value={v.image}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[idx].image = e.target.value;
                            setFormData({ ...formData, variants: updated });
                          }}
                          className="flex-1 bg-transparent border-b border-white/20 p-1 text-xs text-gray-300 focus:outline-none focus:border-[#D39EAA]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            variants: formData.variants.filter((_, i) => i !== idx),
                          });
                        }}
                        className="p-1.5 text-gray-400 hover:text-rose-400 cursor-pointer"
                        title="Remove swatch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: STORY, CRAFTSMANSHIP & BULLETS                             */}
          {/* ================================================================= */}
          {(activeTab === 'story' || viewMode === 'all') && (
            <div className="bg-[#032019] p-5 sm:p-7 rounded-2xl border border-white/15 space-y-6 mb-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D39EAA]" />
                    Design Story & Description Polish
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Format comfortable, luxury paragraphs without congested text or foreign store tags.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoCleanDescription}
                    className="px-3 py-1.5 bg-[#D39EAA] hover:bg-white text-[#592D37] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Automatically clean raw Etsy copy-paste, asterisks, and format into luxury paragraphs"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>✨ Auto-Clean & De-Congest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewingDescription(!isPreviewingDescription)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isPreviewingDescription ? 'Hide Preview' : '👁️ Live Customer View'}</span>
                  </button>
                </div>
              </div>

              {/* Story Preset Templates */}
              <div className="p-3 bg-black/25 rounded-xl border border-white/10 space-y-2">
                <span className="text-[11px] font-semibold text-gray-300 block">
                  ⚡ 1-Click Luxury Story Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyDescriptionTemplate('solitaire')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs rounded-lg border border-white/10 cursor-pointer"
                  >
                    Solitaire Romance
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDescriptionTemplate('artdeco')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs rounded-lg border border-white/10 cursor-pointer"
                  >
                    Art Deco Heirloom
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDescriptionTemplate('rosequartz')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs rounded-lg border border-white/10 cursor-pointer"
                  >
                    Rose Quartz Heritage
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Detailed Item Description *
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a captivating story about this piece. Supports line breaks and multiple paragraphs."
                  className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA] leading-relaxed font-sans"
                />
              </div>

              {/* Live Preview of formatted description */}
              {isPreviewingDescription && (
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E5DF] text-gray-900 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="font-serif text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D39EAA]" />
                      Customer Reading Experience (Live Preview):
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ Zero Congestion
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-gray-700 leading-relaxed">
                    {formData.description
                      .split(/\n+/)
                      .map((p) => p.trim())
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-700 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#B76E79] flex-shrink-0" />
                      <span>Velvet Gift Box</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-700 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-[#B76E79] flex-shrink-0" />
                      <span>Custom Sizing</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#B76E79] flex-shrink-0" />
                      <span>Authenticity Report</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D39EAA] flex-shrink-0" />
                      <span>Lifetime Polish</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Craftsmanship Bullets */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Craftsmanship Bullet Highlights
                </label>

                <div className="space-y-2 mb-3">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-black/30 rounded-lg border border-white/10">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...formData.features];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, features: updated });
                        }}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-gray-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 100% Conflict-Free Lab Grown Gemstone"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-white/10 hover:bg-[#D39EAA] hover:text-[#592D37] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Add Highlight
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: SEO & MARKETING BADGES                                     */}
          {/* ================================================================= */}
          {(activeTab === 'seo' || viewMode === 'all') && (
            <div className="bg-[#032019] p-5 sm:p-7 rounded-2xl border border-white/15 space-y-6 mb-6 shadow-md">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <Globe className="w-4 h-4 text-[#D39EAA]" />
                Marketing Badges & Search Engine Optimization (SEO)
              </h3>

              {/* Marketing Badges Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-300">
                  Store Merchandising Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {['NEW ARRIVAL', 'BESTSELLER', 'LIMITED EDITION', 'BRIDAL FAVORITE', '50% OFF', 'VVS1 D-COLOR'].map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.badge === badge
                          ? 'bg-[#D39EAA] text-[#592D37]'
                          : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, badge: '' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      !formData.badge
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    No Badge
                  </button>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured ?? false}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#D39EAA] focus:ring-[#D39EAA]"
                    />
                    <span>🌟 Feature on Homepage Spotlight Carousel</span>
                  </label>
                </div>
              </div>

              {/* SEO Google Snippet Preview */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-300">
                      Google Search Title
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {(formData.metaTitle || `${formData.name || 'Ring'} | ForeverJewellStudio`).length} / 60 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Oval Rose Quartz Engagement Ring | ForeverJewellStudio"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-300">
                      Google Meta Description
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {(formData.metaDescription || (formData.description ? formData.description.slice(0, 155) : '')).length} / 160 characters
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Brief description that entices shoppers clicking from Google Search..."
                    value={formData.metaDescription || ''}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>

                {/* Google Search Card Preview */}
                <div className="bg-[#202124] p-4 rounded-xl border border-white/10 text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-[#D39EAA] font-bold">
                      F
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-300 font-medium block leading-none">ForeverJewellStudio</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        https://foreverjewellstudio.com &gt; products &gt; {formData.slug || 'product-url'}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-[#8ab4f8] text-sm font-medium hover:underline cursor-pointer pt-1">
                    {formData.metaTitle || `${formData.name || 'Handcrafted Solitaire Ring'} | ForeverJewellStudio`}
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {formData.metaDescription || (formData.description ? formData.description.slice(0, 150) + '...' : 'Shop certified handcrafted engagement rings in 14k Solid Gold and 925 Sterling Silver with free express delivery.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* BOTTOM LIVE PREVIEW (Interactive customer experience)             */}
          {/* ================================================================= */}
          <div className="mt-6 pt-6 border-t border-white/15 space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-[#D39EAA] flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Customer Preview (How your uploaded photos appear on store)
              </span>
              <span className="text-[11px] text-gray-400">
                Interactive real-time preview
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-black/30 p-5 rounded-2xl border border-white/10">
              <div className="lg:col-span-4">
                <span className="text-xs font-semibold text-gray-400 block mb-2">1. Catalog Card Preview:</span>
                <ProductCard product={formData} />
              </div>

              <div className="lg:col-span-8 bg-[#FFF0F5] p-4 rounded-2xl border border-gray-300">
                <span className="text-xs font-bold text-gray-800 block mb-2 font-sans">
                  2. Product Detail Page Multi-Photo Gallery Preview ({formData.images.length} photos):
                </span>
                <ProductImageGallery
                  images={formData.images}
                  productName={formData.name || 'Sample Product'}
                  productId={formData.id || 'preview'}
                  badge={formData.badge}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      )}

      {/* ADMIN TEAM & 2FA SECURITY MODAL */}
      <AnimatePresence>
        {isAdminTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#042820] border border-[#D39EAA]/40 rounded-2xl p-6 shadow-2xl space-y-5 text-gray-200"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D39EAA] text-[#592D37] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-base">
                      Admin Team & 2FA Security
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Manage authorized admins and two-factor access
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminTeamModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2FA Status Banner */}
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-300">2-Factor Authentication: ACTIVE</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-900/60 px-2 py-0.5 rounded">
                  OTP Email Protected
                </span>
              </div>

              {/* Current Authorized Admins */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Authorized Admin Accounts ({adminTeamList.length || 1})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(adminTeamList.length > 0 ? adminTeamList : [
                    { email: 'Foreverjewels98@gmail.com', role: 'SUPER_ADMIN', name: 'Forever Jewels (Store Owner)' }
                  ]).map((admin) => (
                    <div
                      key={admin.email}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{admin.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            admin.role === 'SUPER_ADMIN' ? 'bg-[#D39EAA]/20 text-[#D39EAA]' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {admin.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{admin.email}</p>
                      </div>

                      {admin.role !== 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdmin(admin.email)}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Admin Form */}
              <form onSubmit={handleAddAdmin} className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs font-bold text-[#D39EAA] uppercase tracking-wider">
                  + Add New Admin Member
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="email"
                    placeholder="Admin Email (e.g. partner@gmail.com)"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#021A14] border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA]"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#021A14] border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as any)}
                    className="px-3 py-2 text-xs bg-[#021A14] border border-white/15 rounded-lg text-gray-300 focus:outline-none focus:border-[#D39EAA]"
                  >
                    <option value="MANAGER">Role: Manager (Orders & Catalog)</option>
                    <option value="SUPER_ADMIN">Role: Super Admin (Full Access)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D39EAA] hover:bg-white text-[#592D37] font-bold text-xs rounded-lg transition-all shadow cursor-pointer shrink-0"
                  >
                    Authorize Admin
                  </button>
                </div>
              </form>

              {/* Cloudflare Zero Trust Tip */}
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-[11px] text-gray-400 space-y-1">
                <p className="text-gray-300 font-bold flex items-center gap-1.5">
                  ☁️ Cloudflare Zero Trust Integration:
                </p>
                <p className="leading-relaxed">
                  In your Cloudflare dashboard under <strong>Zero Trust &gt; Access</strong>, add any authorized admin emails to your application policy to block unauthorized visitors at the DNS edge before they even reach your server.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
