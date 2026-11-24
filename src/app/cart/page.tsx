'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCdnImageUrl } from '@/lib/imageCdn';
import {
  Lock,
  ShieldCheck,
  Truck,
  Trash2,
  Heart,
  ChevronDown,
  ChevronUp,
  Tag,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Leaf,
  Info,
  Check,
  Clock,
  Star,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, subtotal, totalItems, toggleWishlist, isWishlisted } = useCart();
  const { formatPrice, selectedCurrency } = useCurrency();

  // Urgency Countdown Timer (ticking down every second)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 48, seconds: 32 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 14, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gift option state
  const [isGift, setIsGift] = useState(false);
  const [showGiftInfo, setShowGiftInfo] = useState(false);

  // Coupon state
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Delivery dropdown toggle
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  // Notification toast for "Save for later"
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'FOREVER10' || code === 'SAVE10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon(code);
      setCouponDiscount(discount);
      setCouponMsg({ text: `Coupon "${code}" applied: 10% discount!`, error: false });
    } else {
      setCouponMsg({ text: 'Invalid code. Try "FOREVER10" for 10% off.', error: true });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponMsg(null);
  };

  const handleSaveForLater = (productId: string, productName: string) => {
    toggleWishlist(productId);
    showToast(`"${productName.slice(0, 30)}..." saved to your favorites!`);
  };

  // Pricing calculations
  // In Etsy jewelry stores, the listing price is 50% off compared to standard retail
  const originalItemsTotal = Math.round(subtotal * 2);
  const shopDiscount = originalItemsTotal - subtotal;
  const convertedSubtotal = Math.round(subtotal * selectedCurrency.rate);
  const finalDiscountedTotal = Math.max(0, subtotal - couponDiscount);
  const finalTotalConverted = Math.round(finalDiscountedTotal * selectedCurrency.rate);

  // Format delivery dates
  const today = new Date();
  const minDelivery = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const maxDelivery = new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000);
  const deliveryRangeStr = `${minDelivery.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${maxDelivery.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;

  const padZero = (n: number) => n.toString().padStart(2, '0');

  // EMPTY CART SCREEN
  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#FFF0F5] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-[#E5E0D8] rounded-2xl p-8 sm:p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#F4F1EA] rounded-full flex items-center justify-center mx-auto mb-5 text-[#8C6A1F]">
            <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#18181B] mb-2">Your cart is empty</h1>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Discover our master-crafted moissanite engagement rings, bridal sets, and fine jewelry.
          </p>
          <div className="space-y-3">
            <Link
              href="/shop"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#222222] hover:bg-black text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-sm transition-all"
            >
              Explore Ring Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/wishlist"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-full transition-colors"
            >
              <Heart className="w-4 h-4 text-[#D39EAA]" />
              View Saved Favorites
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] text-[#222222] pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-white/10 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Cart Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#222222]">
            Your cart <span className="text-lg font-normal text-gray-500">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: Etsy-Style Shop Card (7 Cols) ────────────────── */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#E5E0D8] rounded-2xl shadow-xs overflow-hidden">
              {/* Shop Header Bar (Exact Etsy Layout) */}
              <div className="px-5 py-3.5 border-b border-gray-150 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#B76E79] flex items-center justify-center text-[#D39EAA] font-serif font-bold text-sm shadow-xs border border-[#043327]">
                    FJ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#222222] tracking-tight hover:underline cursor-pointer">
                        foreverjewells
                      </span>
                      <div className="flex items-center text-amber-500 text-xs font-medium gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-gray-900 font-semibold text-xs ml-0.5">3.9</span>
                        <span className="text-gray-500 text-[11px]">(539)</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500">JAIPUR, INDIA · Certified Fine Jewelry Studio</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline-block">
                    ✓ Star Seller
                  </span>
                  <button
                    type="button"
                    aria-label="Shop options"
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items List (Exact Etsy Styling) */}
              <div className="divide-y divide-gray-150">
                {cart.map((item) => {
                  const itemUnitPrice = Math.round(item.price * selectedCurrency.rate);
                  const itemOriginalPrice = itemUnitPrice * 2;
                  const itemTotalPrice = itemUnitPrice * item.quantity;
                  const itemTotalOriginal = itemOriginalPrice * item.quantity;

                  return (
                    <div key={item.id} className="p-5 sm:p-6 transition-colors hover:bg-gray-50/50">
                      <div className="flex gap-4 sm:gap-5 items-start">
                        {/* Thumbnail */}
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="w-24 h-24 sm:w-28 sm:h-28 relative rounded-xl overflow-hidden bg-[#F4F1EA] border border-gray-200 shrink-0 group"
                        >
                          {item.image ? (
                            <Image
                              src={getCdnImageUrl(item.image, { width: 240, quality: 80 })}
                              alt={item.product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="120px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Sparkles className="w-6 h-6" />
                            </div>
                          )}
                        </Link>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1 pr-2">
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="text-sm font-semibold text-[#222222] hover:text-[#B76E79] hover:underline line-clamp-2 leading-snug"
                              >
                                {item.product.name}
                              </Link>

                              {/* Variation Pill Badges (Exact Etsy Style) */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                  Band colour: <strong className="ml-1 text-gray-900">{item.selectedMetal}</strong>
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                  Ring size: <strong className="ml-1 text-gray-900">{item.selectedSize}</strong>
                                </span>
                                {item.selectedCarat && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                    Carat: <strong className="ml-1 text-gray-900">{item.selectedCarat}</strong>
                                  </span>
                                )}
                              </div>

                              {item.engravingText && (
                                <p className="text-[11px] text-[#8C6A1F] mt-1.5 flex items-center gap-1">
                                  <span>✍️ Engraving:</span>
                                  <strong className="italic">&ldquo;{item.engravingText}&rdquo;</strong>
                                </p>
                              )}

                              {/* Etsy Urgent Countdown Timer */}
                              <div className="flex items-center gap-1.5 text-[#15803D] text-xs font-semibold mt-2.5">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  Sale ends in {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)}
                                </span>
                              </div>
                            </div>

                            {/* Price Block (Right side of item) */}
                            <div className="text-left sm:text-right shrink-0 mt-1 sm:mt-0">
                              <div className="inline-flex items-center px-1.5 py-0.5 bg-[#E7F8E8] text-[#0F6F2C] text-[11px] font-bold rounded mb-1">
                                50% off
                              </div>
                              <div className="text-base sm:text-lg font-bold text-[#222222]">
                                {selectedCurrency.symbol}{itemTotalPrice.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 line-through">
                                {selectedCurrency.symbol}{itemTotalOriginal.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Actions Row: Quantity Selector + Edit + Save for later + Remove */}
                          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                            {/* Quantity Dropdown */}
                            <div className="flex items-center gap-2">
                              <label htmlFor={`qty-${item.id}`} className="text-xs text-gray-600 font-medium">
                                Qty:
                              </label>
                              <select
                                id={`qty-${item.id}`}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                className="text-xs bg-white border border-gray-300 rounded-md px-2.5 py-1 font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                                  <option key={q} value={q}>
                                    {q}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Action Links (Exact Etsy style: text with hover underline) */}
                            <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-[#222222]">
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="underline hover:text-gray-600 transition-colors"
                              >
                                Edit
                              </Link>
                              <span className="text-gray-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleSaveForLater(item.product.id, item.product.name)}
                                className="underline hover:text-gray-600 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    isWishlisted(item.product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                  }`}
                                />
                                Save for later
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="underline text-red-700 hover:text-red-900 transition-colors cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer: Dispatch Info (Exact Etsy layout) */}
              <div className="bg-[#FAF8F5] px-5 py-3.5 border-t border-gray-200">
                <div
                  onClick={() => setDeliveryOpen(!deliveryOpen)}
                  className="flex items-center justify-between text-xs text-gray-800 cursor-pointer font-medium select-none"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#B76E79]" />
                    <span>
                      <strong>Dispatch: FREE</strong> (Get it by {deliveryRangeStr})
                    </span>
                  </div>
                  {deliveryOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>

                {deliveryOpen && (
                  <div className="mt-2.5 pt-2.5 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                    <p>• Handcrafted to order in our Jaipur atelier (crafting: 3–5 business days)</p>
                    <p>• Express international courier with door-to-door tracking (FedEx / DHL Express)</p>
                    <p>• Fully insured delivery against loss or transit damage</p>
                  </div>
                )}
              </div>
            </div>

            {/* Environmental Footer Note (Exact Etsy style from screenshot) */}
            <div className="flex items-start gap-2.5 text-xs text-gray-600 px-1 py-1">
              <Leaf className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                ForeverJewells invests in climate solutions like electric delivery vehicles and carbon offsets for every international shipment.{' '}
                <a
                  href="/contact"
                  className="underline hover:text-black font-medium"
                >
                  See how
                </a>
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Sticky Order Summary Box (5 Cols) ───────────── */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-xs space-y-4">
              {/* Order Breakdown */}
              <div className="space-y-2.5 text-xs font-sans text-gray-700">
                {/* Item(s) total */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Item(s) total</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCurrency.symbol}{(convertedSubtotal * 2).toLocaleString()}
                  </span>
                </div>

                {/* Shop discount */}
                <div className="flex justify-between items-center text-[#0F6F2C]">
                  <span className="font-medium">Shop discount</span>
                  <span className="font-bold">
                    -{selectedCurrency.symbol}{convertedSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* Coupon discount if applied */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-[#0F6F2C]">
                    <span className="font-medium">Coupon discount ({appliedCoupon})</span>
                    <span className="font-bold">
                      -{selectedCurrency.symbol}{Math.round(couponDiscount * selectedCurrency.rate).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between items-center pt-1 border-t border-gray-150">
                  <span className="font-medium text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {selectedCurrency.symbol}{finalTotalConverted.toLocaleString()}
                  </span>
                </div>

                {/* Delivery */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Delivery <span className="text-[11px] text-gray-500">(Worldwide Express)</span>
                  </span>
                  <span className="font-bold text-[#0F6F2C] uppercase tracking-wide">
                    FREE
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sales Tax / GST</span>
                  <span className="text-gray-500 text-[11px]">Included in Price</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Total (X items) */}
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-[#222222]">
                  Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#222222] tracking-tight">
                    {selectedCurrency.symbol}{finalTotalConverted.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-gray-500">
                    {selectedCurrency.code} · All taxes & insured delivery included
                  </span>
                </div>
              </div>

              {/* Gift Checkbox (Exact Etsy Layout) */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#222222] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">
                    Mark order as a gift
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGiftInfo(!showGiftInfo)}
                    className="text-xs text-gray-500 underline hover:text-black cursor-pointer ml-0.5"
                  >
                    Learn more
                  </button>
                </label>

                {showGiftInfo && (
                  <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                    Prices won&apos;t be shown on the packing slip. Includes a free luxury gift box with ribbon packaging.
                  </div>
                )}
              </div>

              {/* Primary CTA Button: Proceed to checkout (Exact Etsy dark charcoal) */}
              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="w-full py-4 bg-[#222222] hover:bg-black active:scale-[0.99] text-white text-sm font-bold tracking-wide rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secure options in checkout + Payment Icons (Exact Etsy Layout) */}
              <div className="space-y-2 pt-1 text-center">
                <p className="text-xs font-semibold text-[#222222] flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-600" />
                  Secure options in checkout
                </p>

                {/* SVG Payment Provider Badges (Visa, Mastercard, Amex, Discover, Diners, PayPal, Apple Pay) */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                  {/* Visa */}
                  <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[11px] font-black tracking-wider text-[#1A1F71] shadow-2xs">
                    VISA
                  </span>
                  {/* Mastercard */}
                  <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[11px] font-bold text-gray-900 flex items-center gap-0.5 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block -mr-1" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] inline-block opacity-90" />
                    <span className="text-[10px] ml-1">Mastercard</span>
                  </span>
                  {/* AMEX */}
                  <span className="px-2 py-0.5 bg-[#006FCF] text-white rounded text-[10px] font-bold tracking-wider shadow-2xs">
                    AMEX
                  </span>
                  {/* PayPal */}
                  <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[11px] font-bold text-[#003087] shadow-2xs">
                    PayPal
                  </span>
                  {/* Discover */}
                  <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[10px] font-bold text-[#FF6000] shadow-2xs">
                    DISCOVER
                  </span>
                  {/* Apple Pay */}
                  <span className="px-2 py-0.5 bg-black text-white rounded text-[10px] font-bold tracking-tight shadow-2xs">
                     Pay
                  </span>
                </div>
              </div>

              {/* Coupon Code Accordion */}
              <div className="pt-2 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setCouponOpen(!couponOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#222222] hover:text-[#B76E79] transition-colors cursor-pointer select-none"
                >
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#B76E79]" />
                    Apply coupon code
                  </span>
                  {couponOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {couponOpen && (
                  <form onSubmit={handleApplyCoupon} className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. FOREVER10"
                        className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#222222] hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {couponMsg && (
                      <p className={`text-xs ${couponMsg.error ? 'text-red-600' : 'text-emerald-700 font-semibold'}`}>
                        {couponMsg.text}
                      </p>
                    )}

                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        Remove applied coupon
                      </button>
                    )}
                  </form>
                )}
              </div>

              {/* Duties note */}
              <p className="text-[11px] text-gray-500 text-center">
                Additional duties and fees <span className="underline cursor-pointer">may apply</span>.
              </p>
            </div>

            {/* Trust reassurance badge */}
            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-4 text-center text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#B76E79]">
                <ShieldCheck className="w-4 h-4" />
                <span>ForeverJewells Purchase Protection</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Shop with confidence. If an item doesn&apos;t arrive or arrives damaged, we guarantee a full replacement or refund.
              </p>
            </div>
          </div>
        </div>

        {/* ── FOOTER ROW: Country selector & Legal links (Exact Etsy layout) ─ */}
        <div className="mt-16 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-base">🇮🇳</span>
            <span>India</span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold text-gray-800">{selectedCurrency.code} ({selectedCurrency.symbol})</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-gray-500 text-[11px]">
            <span>© 2026 ForeverJewells, Inc.</span>
            <Link href="/contact" className="hover:underline">Terms of Use</Link>
            <Link href="/contact" className="hover:underline">Privacy</Link>
            <Link href="/contact" className="hover:underline">Interest-based ads</Link>
            <Link href="/contact" className="hover:underline">Local Shops</Link>
            <Link href="/contact" className="hover:underline">Regions</Link>
            <Link href="/contact" className="hover:underline">Help Centre</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
