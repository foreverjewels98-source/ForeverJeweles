'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCdnImageUrl } from '@/lib/imageCdn';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ShippingAddress, Order, OrderItem } from '@/lib/types/order';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  CreditCard,
  ArrowLeft,
  Truck,
  Sparkles,
  MapPin,
  User,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Package,
  Clock,
  Send,
  HelpCircle,
  Building2,
  Gem,
  QrCode,
  Smartphone,
  Zap,
  Tag,
} from 'lucide-react';
import DeliveryScooterAnimation from '@/components/layout/DeliveryScooterAnimation';

const POPULAR_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'Germany',
  'France',
  'United Arab Emirates',
  'Singapore',
  'Netherlands',
  'Italy',
  'Spain',
  'Japan',
  'Other',
];

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: globalCart, subtotal: globalSubtotal, clearCart, directCheckoutItems, setDirectCheckoutItems } = useCart();
  const { formatPrice, selectedCurrency, t } = useCurrency();
  const cart = directCheckoutItems || globalCart;
  const subtotal = directCheckoutItems ? directCheckoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0) : globalSubtotal;

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [saveAddress, setSaveAddress] = useState(true);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const handleClearSavedAddress = () => {
    try {
      localStorage.removeItem('fj_saved_shipping_address');
    } catch (_) {}
    setHasSavedAddress(false);
    setIsEditingAddress(true);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      streetAddress: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    });
  };

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'paypal' | 'payoneer' | 'bank_transfer' | 'whatsapp'>('razorpay');
  const [payoneerReference, setPayoneerReference] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const [upiSubTab, setUpiSubTab] = useState<'qr' | 'manual'>('qr');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedPayoneer, setCopiedPayoneer] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  const copyBankField = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankField(label);
    setTimeout(() => setCopiedBankField(null), 2500);
  };

  // PayPal SDK & Direct Gateway Integration State
  const [isPayPalLoading, setIsPayPalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [isRedirectingToPayPal, setIsRedirectingToPayPal] = useState(false);
  const capturedTokensRef = useRef<Set<string>>(new Set());

  // Razorpay Gateway State
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string | null>(null);

  // Load saved address from localStorage on mount (Amazon-style)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fj_saved_shipping_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.firstName && parsed.streetAddress) {
          setFormData(parsed);
          setHasSavedAddress(true);
        }
      }
    } catch (e) {
      console.error('Error loading saved address:', e);
    }
  }, []);

  // Listen for return from official PayPal Portal (Etsy / Shopify style)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const token = params.get('token');

    if (status === 'paypal_success' && token) {
      // Prevent duplicate call triggered by React StrictMode in development
      if (capturedTokensRef.current.has(token)) {
        return;
      }
      capturedTokensRef.current.add(token);

      setIsSubmitting(true);
      const pendingDataStr = localStorage.getItem('fj_pending_paypal_order');
      let pendingData: any = {};
      try {
        if (pendingDataStr) pendingData = JSON.parse(pendingDataStr);
      } catch (_) {}

      fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: token,
          customer: pendingData.customer || formData,
          items: pendingData.items || cart,
          currency: pendingData.currency || 'USD',
          currencySymbol: pendingData.currencySymbol || '$',
          total: pendingData.total || 57,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.order) {
            setCompletedOrder(data.order);
            setWhatsAppUrl(data.whatsAppUrl || '');
            if (directCheckoutItems) {
              setDirectCheckoutItems(null);
            } else {
              clearCart();
            }
            localStorage.removeItem('fj_pending_paypal_order');
            window.history.replaceState({}, document.title, '/checkout');
          } else {
            alert(data.error || 'Failed to capture PayPal payment.');
          }
        })
        .catch((err) => {
          console.error('Capture error:', err);
          alert('Could not verify PayPal payment.');
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else if (status === 'paypal_cancelled') {
      setPaypalError('PayPal payment was cancelled. You can try again or choose another payment method.');
      window.history.replaceState({}, document.title, '/checkout');
    }
  }, []);

  // Calculate currency converted prices using selectedCurrency object
  const currencyCode = selectedCurrency.code;
  const baseCurrencySymbol = selectedCurrency.symbol;
  const convertedSubtotal = Math.round(subtotal * selectedCurrency.rate);
  const shippingFee = 0; // Free express worldwide shipping
  // Scalable Promo Codes definition
  const PROMO_CODES: Record<string, { type: 'percent' | 'test'; value: number; label: string }> = {
    WELCOME10: { type: 'percent', value: 10, label: '10% Welcome Discount' },
    FOREVER10: { type: 'percent', value: 10, label: '10% Store Discount' },
    ROYAL15: { type: 'percent', value: 15, label: '15% Royal Luxury Discount' },
    FESTIVE20: { type: 'percent', value: 20, label: '20% Festive Special Discount' },
    TEST1: { type: 'test', value: 1, label: 'Special Promotional Discount' },
    RAZORPAY1: { type: 'test', value: 1, label: 'Special Promotional Discount' },
  };

  // Coupon / Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // Auto-apply from URL if ?coupon=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('coupon') || (params.get('test') === '1' ? 'TEST1' : null);
      if (c) {
        const upper = c.toUpperCase();
        if (PROMO_CODES[upper]) {
          setAppliedCoupon(upper);
        }
      }
    } catch (_) {}
  }, []);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;
    if (PROMO_CODES[clean]) {
      setAppliedCoupon(clean);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Please check and try again.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const appliedPromo = appliedCoupon ? PROMO_CODES[appliedCoupon] : null;
  const isTestCoupon = appliedPromo?.type === 'test';

  let couponDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      couponDiscount = Math.round(convertedSubtotal * (appliedPromo.value / 100));
    } else if (appliedPromo.type === 'test') {
      couponDiscount = Math.max(0, convertedSubtotal - 1);
    }
  }

  const currencySymbol = isTestCoupon ? '₹' : baseCurrencySymbol;
  const finalTotal = isTestCoupon ? 1 : Math.max(1, convertedSubtotal - couponDiscount + shippingFee);

  // Supported PayPal direct currencies
  const PAYPAL_DIRECT_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'NZD', 'CHF', 'HKD'];
  const isDirectPayPal = PAYPAL_DIRECT_CURRENCIES.includes(currencyCode);
  const paypalCurrency = isDirectPayPal ? currencyCode : 'USD';
  const paypalAmount = isDirectPayPal
    ? finalTotal
    : Math.max(1, Math.round(finalTotal / 86.5));

  // Indian Shopper Auto-Detection & UPI Configuration
  const isIndianCustomer = selectedCurrency.code === 'INR' || formData.country === 'India';

  useEffect(() => {
    if (selectedCurrency.code === 'INR' && formData.country !== 'India' && !hasSavedAddress) {
      setFormData((prev) => ({ ...prev, country: 'India' }));
    }
  }, [selectedCurrency.code, hasSavedAddress]);

  useEffect(() => {
    if (isIndianCustomer && paymentMethod === 'paypal') {
      setPaymentMethod('razorpay');
    }
  }, [isIndianCustomer]);

  // UPI dynamic payment parameters
  const upiAmount = currencyCode === 'INR' ? finalTotal : Math.round(finalTotal * 86.5);
  const upiVpa = process.env.NEXT_PUBLIC_UPI_ID || '982893045@kotak';
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'Kotak Mahindra Bank';
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '9848316724';
  const bankIfsc = process.env.NEXT_PUBLIC_BANK_IFSC || 'KKBK0000273';
  const bankBranch = process.env.NEXT_PUBLIC_BANK_BRANCH || 'Jaipur - Vaishali Nagar';
  const bankCrn = process.env.NEXT_PUBLIC_BANK_CRN || '798804404';
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent('Forever Jewell Studio')}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent('Fine Jewelry Order')}`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiUri)}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      newErrors.email = 'Valid email is required for receipt & tracking';
    if (!formData.phone.trim() || formData.phone.length < 7)
      newErrors.phone = 'Valid phone number is required for shipping courier';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'ZIP / Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    if (paymentMethod === 'payoneer' && !payoneerReference.trim()) {
      newErrors.payoneer = 'Please enter your Payoneer email or Transaction Reference ID';
    }

    if (paymentMethod === 'bank_transfer' && !bankReference.trim()) {
      newErrors.bankReference = 'Please enter your UPI reference number, UTR, or remitter account name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Order to backend
  const handlePlaceOrder = async (
    overridePayment?: {
      method: 'paypal' | 'card' | 'payoneer' | 'bank_transfer' | 'whatsapp' | 'razorpay';
      status: 'paid' | 'pending';
      transactionId?: string;
    },
    overrideCustomer?: ShippingAddress
  ) => {
    const activeCustomer = overrideCustomer || formData;
    if (!overrideCustomer && !validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save address if opted in
      if (saveAddress && !overrideCustomer) {
        localStorage.setItem('fj_saved_shipping_address', JSON.stringify(formData));
      }

      // Prepare order items
      const orderItems: OrderItem[] = cart.map((item) => {
        const itemConvertedPrice = Math.round(item.price * selectedCurrency.rate);
        return {
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          metal: item.selectedMetal,
          size: item.selectedSize || 'US 7',
          carat: item.selectedCarat || item.product.carat,
          engraving: item.engravingText,
          quantity: item.quantity,
          unitPrice: itemConvertedPrice,
          totalPrice: itemConvertedPrice * item.quantity,
          image: item.image || item.product.images?.[0] || '',
        };
      });

      const effectivePayment = overridePayment || {
        method: paymentMethod,
        status: (paymentMethod === 'paypal' ? 'paid' : 'pending') as 'paid' | 'pending',
        payoneerReference: paymentMethod === 'payoneer' ? payoneerReference : undefined,
        bankReference: paymentMethod === 'bank_transfer' ? bankReference : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: activeCustomer,
          items: orderItems,
          currency: currencyCode,
          currencySymbol: currencySymbol,
          subtotal: convertedSubtotal,
          shippingFee: 0,
          total: finalTotal,
          payment: effectivePayment,
        }),
      });

      const data = await res.json();

      if (data.success && data.order) {
        setCompletedOrder(data.order);
        setWhatsAppUrl(data.whatsAppUrl || '');
        if (directCheckoutItems) {
          setDirectCheckoutItems(null);
        } else {
          clearCart();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      console.error('Order error:', err);
      alert('An unexpected error occurred while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPayoneerEmail = () => {
    const email = process.env.NEXT_PUBLIC_PAYONEER_EMAIL || 'Foreverjewels98@gmail.com';
    navigator.clipboard.writeText(email);
    setCopiedPayoneer(true);
    setTimeout(() => setCopiedPayoneer(false), 2500);
  };

  // Synchronize state to refs to prevent re-rendering PayPal iframe on every keystroke
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const paypalAmountRef = useRef(paypalAmount);
  paypalAmountRef.current = paypalAmount;

  const cartRef = useRef(cart);
  cartRef.current = cart;

  const handlePlaceOrderRef = useRef(handlePlaceOrder);
  handlePlaceOrderRef.current = handlePlaceOrder;

  const validateFormRef = useRef(validateForm);
  validateFormRef.current = validateForm;

  // Handle direct Etsy-Style PayPal Portal Checkout (Redirects directly to official PayPal checkout without popup hangs)
  const handleEtsyStylePayPal = async () => {
    if (saveAddress) {
      try {
        localStorage.setItem('fj_saved_shipping_address', JSON.stringify(formData));
      } catch (_) {}
    }

    setIsRedirectingToPayPal(true);
    setPaypalError(null);

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paypalAmount,
          currency: paypalCurrency,
          customer: formData,
          items: cart,
        }),
      });

      const data = await res.json();

      if (data.success && data.approveUrl) {
        const normalizedItems: OrderItem[] = cart.map((item) => {
          const itemPrice = Math.round(item.price * selectedCurrency.rate);
          return {
            productId: item.product.id,
            productName: item.product.name,
            productSlug: item.product.slug,
            metal: item.selectedMetal,
            size: item.selectedSize || 'US 7',
            carat: item.selectedCarat || item.product.carat,
            engraving: item.engravingText,
            quantity: item.quantity,
            unitPrice: itemPrice,
            totalPrice: itemPrice * item.quantity,
            image: item.image || item.product.images?.[0] || '',
          };
        });

        localStorage.setItem(
          'fj_pending_paypal_order',
          JSON.stringify({
            customer: formData,
            items: normalizedItems,
            currency: currencyCode,
            currencySymbol: currencySymbol,
            total: finalTotal,
          })
        );

        // Open official PayPal checkout page directly (Etsy style!)
        window.location.href = data.approveUrl;
      } else {
        setPaypalError(data.error || 'Could not initiate PayPal checkout session. Please try again.');
        setIsRedirectingToPayPal(false);
      }
    } catch (err: any) {
      console.error('PayPal redirect error:', err);
      setPaypalError('Could not connect to PayPal server. Please try again.');
      setIsRedirectingToPayPal(false);
    }
  };

  // Clean up any pending state
  useEffect(() => {
    setIsPayPalLoading(false);
    setIsRazorpayLoading(false);
  }, [paymentMethod]);

  // Load Razorpay Checkout SDK Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay Payment flow
  const handleRazorpayPayment = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    if (saveAddress) {
      try {
        localStorage.setItem('fj_saved_shipping_address', JSON.stringify(formData));
      } catch (_) {}
    }

    setRazorpayError(null);
    setIsRazorpayLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay gateway. Please check your internet connection.');
      }

      // Calculate INR amount
      const inrAmount = isTestCoupon ? 1 : (selectedCurrency.code === 'INR' ? finalTotal : Math.round(finalTotal * 86.5));

      const normalizedItems: OrderItem[] = cart.map((item) => {
        const itemPrice = Math.round(item.price * selectedCurrency.rate);
        return {
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          metal: item.selectedMetal,
          size: item.selectedSize || 'US 7',
          carat: item.selectedCarat || item.product.carat,
          engraving: item.engravingText,
          quantity: item.quantity,
          unitPrice: itemPrice,
          totalPrice: itemPrice * item.quantity,
          image: item.image || item.product.images?.[0] || '',
        };
      });

      // 1. Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: inrAmount,
          currency: 'INR',
          customer: formData,
          items: normalizedItems,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize payment gateway.');
      }

      // 2. Open official Razorpay modal
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Forever Jewell Studio',
        description: 'Royal Moissanite Jewelry Order',
        image: '/images/logo.jpg',
        order_id: orderData.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
          method: 'upi',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        notes: {
          address: `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.postalCode}`,
        },
        theme: {
          color: '#064E3B',
        },
        modal: {
          ondismiss: () => {
            setIsRazorpayLoading(false);
          },
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: formData,
                items: normalizedItems,
                currency: 'INR',
                currencySymbol: '₹',
                total: inrAmount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.order) {
              setCompletedOrder(verifyData.order);
              setWhatsAppUrl(verifyData.whatsAppUrl || '');
              if (directCheckoutItems) {
                setDirectCheckoutItems(null);
              } else {
                clearCart();
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setRazorpayError(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (e: any) {
            console.error('Razorpay verification error:', e);
            setRazorpayError(e?.message || 'Error confirming payment with server.');
          } finally {
            setIsRazorpayLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        if (resp.error?.reason === 'payment_cancelled') {
          console.warn('Razorpay payment cancelled by user:', resp.error?.description);
          setRazorpayError('Payment was cancelled. You can try again whenever you are ready.');
        } else {
          console.error('Razorpay payment failed:', resp.error);
          setRazorpayError(resp.error?.description || 'Payment was unsuccessful or cancelled.');
        }
        setIsRazorpayLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay error:', err);
      setRazorpayError(err?.message || 'Failed to start payment.');
      setIsRazorpayLoading(false);
    }
  };

  // SUCCESS SCREEN — Premium Amazon-Style Order Confirmation
  if (completedOrder) {
    const isPaid = completedOrder.payment?.status === 'paid';
    const payMethodLabel: Record<string, string> = {
      razorpay: 'Razorpay UPI / Cards', paypal: 'PayPal', card: 'Credit / Debit Card',
      payoneer: 'Payoneer', bank_transfer: 'Bank Transfer / UPI', whatsapp: 'WhatsApp Order',
    };
    const estDelivery = () => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F0FDF8] to-[#FAFAF7] py-8 px-4 sm:px-6">
        <DeliveryScooterAnimation />
        <div className="max-w-2xl mx-auto space-y-4">

          {/* ── TOP CONFIRMATION CARD ── */}
          <div className="bg-white rounded-2xl border border-[#BBF7D0] shadow-lg overflow-hidden">
            {/* Green top bar */}
            <div className="bg-[#064E3B] px-6 py-5 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 mb-1">
                {isPaid ? '✓ Payment Received' : '✓ Order Received — Awaiting Payment Verification'}
              </p>
              <h1 className="text-2xl font-serif font-bold text-white">
                Thank you, {completedOrder.customer.firstName}! 🎉
              </h1>
              <p className="text-sm text-emerald-200 mt-1.5">
                Your order has been confirmed and our artisans have been notified.
              </p>
            </div>

            {/* Order ID + Email notice */}
            <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100 text-center">
              <p className="text-xs text-gray-500 mb-1">Your Order Reference</p>
              <p className="font-mono text-lg font-bold text-[#064E3B] tracking-wider">#{completedOrder.id}</p>
              <p className="text-[11px] text-gray-500 mt-1">
                {completedOrder.customer.email
                  ? `A confirmation has been sent to ${completedOrder.customer.email}`
                  : 'Save this Order ID to track your shipment'}
              </p>
            </div>

            {/* Progress Stepper */}
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Order Journey</p>
              <div className="flex items-start justify-between relative">
                <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200" />
                <div className="absolute top-5 left-10 h-0.5 bg-[#064E3B]" style={{ width: '0%' }} />
                {[
                  { icon: CheckCircle2, label: 'Confirmed', sub: 'Just now', done: true },
                  { icon: Sparkles, label: 'Crafting', sub: '3–5 days', done: false },
                  { icon: Truck, label: 'Shipped', sub: '5–10 days', done: false },
                  { icon: Package, label: 'Delivered', sub: `Est. ${estDelivery()}`, done: false },
                ].map(({ icon: Icon, label, sub, done }, idx) => (
                  <div key={idx} className="flex flex-col items-center z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-[#064E3B] border-[#064E3B] text-white shadow-md' : 'bg-white border-gray-200 text-gray-300'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`mt-2 text-[10px] font-bold text-center leading-tight ${done ? 'text-[#064E3B]' : 'text-gray-400'}`}>{label}</p>
                    <p className="text-[9px] text-gray-400 text-center">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Ordered */}
            {completedOrder.items.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="space-y-2.5">
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#064E3B]/10 rounded-lg flex items-center justify-center shrink-0">
                        <Gem className="w-4 h-4 text-[#064E3B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{it.productName}</p>
                        <p className="text-[11px] text-gray-500">{it.metal}{it.size ? ` · Size ${it.size}` : ''} · Qty {it.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">
                        {completedOrder.currencySymbol}{Number(it.totalPrice ?? it.unitPrice ?? 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Total {isPaid ? 'Paid' : 'Due'}</span>
                  <span className="text-base font-bold text-[#064E3B]">
                    {completedOrder.currencySymbol}{Number(completedOrder.total || 0).toLocaleString()} {completedOrder.currency}
                  </span>
                </div>
              </div>
            )}

            {/* Delivery + Payment side-by-side */}
            <div className="grid sm:grid-cols-2 gap-0 border-b border-gray-100">
              <div className="px-6 py-4 border-b sm:border-b-0 sm:border-r border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#064E3B]" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Shipping To</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{completedOrder.customer.firstName} {completedOrder.customer.lastName}</p>
                <p className="text-xs text-gray-600">{completedOrder.customer.streetAddress}</p>
                {completedOrder.customer.apartment && <p className="text-xs text-gray-600">{completedOrder.customer.apartment}</p>}
                <p className="text-xs text-gray-600">{completedOrder.customer.city}, {completedOrder.customer.state} {completedOrder.customer.postalCode}</p>
                <p className="text-xs font-semibold text-gray-700">{completedOrder.customer.country}</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-[#064E3B]" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{payMethodLabel[completedOrder.payment?.method || ''] || 'Unknown'}</p>
                <p className={`text-xs mt-0.5 font-bold ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  {isPaid ? '✓ Payment Confirmed' : '⏳ Pending Verification'}
                </p>
                {completedOrder.payment?.bankReference && (
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                    Ref / UTR: <strong className="text-gray-900">{completedOrder.payment.bankReference}</strong>
                  </p>
                )}
                {!isPaid && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    {completedOrder.payment?.method === 'bank_transfer'
                      ? 'UTR submitted! Our artisans in Jaipur verify deposits within 15–30 mins to begin crafting.'
                      : 'We will confirm your order once payment is verified (usually within 2–4 hrs).'}
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#064E3B] text-white flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#064E3B]">
                    {completedOrder.payment?.method === 'bank_transfer'
                      ? 'Send UPI Payment Receipt Screenshot'
                      : 'Send to our Concierge on WhatsApp'}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {completedOrder.payment?.method === 'bank_transfer'
                      ? 'Share your UPI transaction screenshot with our Jaipur studio for instant order confirmation.'
                      : 'Confirm ring size, engraving, or get order updates instantly.'}
                  </p>
                </div>
              </div>
              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#064E3B] hover:bg-[#043327] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {completedOrder.payment?.method === 'bank_transfer'
                    ? 'Open WhatsApp — Share UPI Payment Screenshot'
                    : 'Open WhatsApp — Send Order Details'}
                </a>
              )}
            </div>

            {/* Trust Badges */}
            <div className="px-6 py-4 bg-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: ShieldCheck, text: 'SSL Secured' },
                { icon: Lock, text: 'Data Private' },
                { icon: Truck, text: 'Tracked Shipping' },
                { icon: Sparkles, text: 'GIA Certified' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="w-4 h-4 text-[#064E3B]" />
                  <p className="text-[10px] font-semibold text-gray-600">{text}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/my-orders?orderId=${completedOrder.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#064E3B] hover:bg-[#043327] text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md rounded-xl"
              >
                <Package className="w-4 h-4" />
                View My Orders
              </Link>
              <Link
                href="/shop"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold tracking-widest uppercase transition-colors rounded-xl"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Reassurance note */}
          <p className="text-center text-[11px] text-gray-400">
            Questions? <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919828930454'}`} target="_blank" rel="noopener noreferrer" className="text-[#064E3B] font-semibold hover:underline">WhatsApp us</a> · We reply within 2 hours · ForeverJewellStudio
          </p>
        </div>
      </div>
    );
  }


  // EMPTY CART SCREEN
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7] px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E0D8] rounded-xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-serif text-gray-900 mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-gray-500 mb-6">
            Add your favorite handcrafted moissanite rings and fine jewelry before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-[#064E3B] text-white hover:bg-[#043327] text-xs font-bold tracking-widest uppercase transition-colors rounded shadow"
          >
            Explore Jewelry Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B]">
      {/* Checkout Minimal Top Bar */}
      <header className="border-b border-[#E5E0D8] bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shop</span>
          </Link>

          <Link href="/" className="font-serif text-lg tracking-widest uppercase font-bold text-[#18181B]">
            FOREVER JEWELL STUDIO
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-[#064E3B] font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Customer Form & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* SAVED ADDRESS CARD (When customer has a saved profile) */}
            {hasSavedAddress && !isEditingAddress ? (
              <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#064E3B] text-white text-xs font-bold flex items-center justify-center">
                      ✓
                    </span>
                    <h2 className="text-base font-serif font-bold text-gray-900 tracking-wide">
                      Delivery & Contact Details
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#064E3B] bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Saved in your browser
                  </span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formData.firstName} {formData.lastName}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          Default Address
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">
                        {formData.streetAddress}{formData.apartment ? `, ${formData.apartment}` : ''}
                      </p>
                      <p className="text-xs text-gray-700">
                        {formData.city}, {formData.state} {formData.postalCode}, {formData.country}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-gray-200/80 text-xs text-gray-600">
                        <span>📧 {formData.email}</span>
                        <span>📞 {formData.phone}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        ✏️ Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSavedAddress}
                        className="px-4 py-1.5 text-xs text-red-600 hover:text-red-800 hover:underline cursor-pointer text-center"
                      >
                        Clear Saved
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
                  <Lock className="w-3.5 h-3.5 text-[#064E3B]" />
                  <span>Your details are loaded securely from your device. You won&apos;t need to retype them.</span>
                </div>
              </div>
            ) : (
              <>
                {/* Step 1: Customer Contact Info */}
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h2 className="text-base font-serif font-bold tracking-wide">
                        Contact Information
                      </h2>
                    </div>
                    {hasSavedAddress && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="text-xs text-[#064E3B] font-semibold hover:underline cursor-pointer"
                      >
                        ← Back to Saved Address
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address * (for order receipt & tracking)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                          errors.email ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:border-[#B89035]`}
                      />
                      {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone Number * (for delivery courier)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                          errors.phone ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:border-[#B89035]`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Step 2: Shipping Address */}
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="w-6 h-6 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-base font-serif font-bold tracking-wide">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Country */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Country / Region *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#B89035]"
                      >
                        {POPULAR_COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* First and Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Jane"
                          className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:border-[#B89035]`}
                        />
                        {errors.firstName && (
                          <p className="text-[11px] text-red-600 mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:border-[#B89035]`}
                        />
                        {errors.lastName && (
                          <p className="text-[11px] text-red-600 mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        placeholder="123 Luxury Lane"
                        className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                          errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:border-[#B89035]`}
                      />
                      {errors.streetAddress && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.streetAddress}</p>
                      )}
                    </div>

                    {/* Apartment, Suite, etc. */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Apartment, Suite, Unit, etc. (optional)
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment || ''}
                        onChange={handleInputChange}
                        placeholder="Apt 4B, Penthouse"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#B89035]"
                      />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="New York"
                          className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:border-[#B89035]`}
                        />
                        {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          State / Province
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="NY"
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#B89035]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          ZIP / Postal Code *
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="10001"
                          className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                            errors.postalCode ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:border-[#B89035]`}
                        />
                        {errors.postalCode && (
                          <p className="text-[11px] text-red-600 mt-1">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>

                    {/* Save this address checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="w-4 h-4 text-[#064E3B] rounded border-gray-300 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-gray-700 font-medium">
                          Save this address securely in my browser for 1-click checkout next time
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CUSTOMER DATA & PAYMENT SECURITY PROMISE (Crucial for US/UK clients) */}
            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#064E3B] font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
                <span>Customer Data Security & Privacy Guarantee</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-gray-600">
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#064E3B]" /> Zero Card Storage
                  </p>
                  <p className="leading-relaxed">
                    We never store credit/debit card numbers or bank logins. All payments are securely handled by official PayPal & banking networks.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#064E3B]" /> Device-Level Privacy
                  </p>
                  <p className="leading-relaxed">
                    Your address is saved privately in your own browser for convenience. We never sell, rent, or monetize personal customer details.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 flex items-center gap-1">
                    <Package className="w-3 h-3 text-[#064E3B]" /> Passwordless Tracking
                  </p>
                  <p className="leading-relaxed">
                    Your orders can be accessed anytime from the &quot;My Orders&quot; hub with just your Order ID or Email without creating accounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method — 100% UPI Instant Checkout via Razorpay */}
            <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#18181B] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-base font-serif font-bold tracking-wide">
                    Payment Method
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064E3B] text-[#D4AF37] uppercase tracking-wider shadow-xs">
                  <Zap className="w-3 h-3 text-[#D4AF37]" /> Instant UPI
                </span>
              </div>

              {/* UPI via Razorpay Gateway Card */}
              <div className="bg-gradient-to-b from-[#F0FDF8] to-white border border-[#A7F3D0] rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-start justify-between border-b border-emerald-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#064E3B] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                      ₹
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
                        <span>Pay with UPI</span>
                        <span className="text-[10px] font-sans px-2 py-0.5 bg-[#064E3B] text-[#D4AF37] rounded-full font-extrabold uppercase tracking-wider">
                          Verified Gateway
                        </span>
                      </h3>
                      <p className="text-xs text-gray-600 font-sans mt-0.5">
                        Instant, zero-fee payment with Google Pay, PhonePe, Paytm, BHIM, or any UPI App & QR
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supported UPI Apps */}
                <div className="p-3.5 bg-white rounded-xl border border-emerald-100 mb-5">
                  <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#064E3B]" /> Supported UPI Apps:
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-800">
                    <span className="px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Google Pay
                    </span>
                    <span className="px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span> PhonePe
                    </span>
                    <span className="px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span> Paytm UPI
                    </span>
                    <span className="px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span> BHIM UPI
                    </span>
                    <span className="px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-gray-600" /> Any UPI QR Code
                    </span>
                  </div>
                </div>

                {razorpayError && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{razorpayError}</span>
                  </div>
                )}

                {/* Primary UPI Pay Button */}
                <button
                  type="button"
                  onClick={handleRazorpayPayment}
                  disabled={isRazorpayLoading}
                  className="w-full py-4 px-6 bg-[#064E3B] hover:bg-[#053d2e] text-[#D4AF37] font-sans font-bold text-sm tracking-widest uppercase rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isRazorpayLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      <span>Opening Secure UPI Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Pay ₹{(isTestCoupon ? 1 : (selectedCurrency.code === 'INR' ? finalTotal : Math.round(finalTotal * 86.5))).toLocaleString('en-IN')} via UPI
                      </span>
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-3 text-[11px] text-gray-500 font-sans">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#064E3B]" />
                    256-Bit Bank Encryption
                  </span>
                  <span>•</span>
                  <span>Instant Order Confirmation</span>
                  <span>•</span>
                  <span>Powered by Razorpay</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Order Summary ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  {selectedCurrency.code}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const itemConvertedPrice = Math.round(item.price * selectedCurrency.rate);
                  return (
                    <div key={item.id} className="py-3 flex gap-3 items-center">
                      <div className="w-14 h-14 relative bg-[#F4F1EA] rounded shrink-0 overflow-hidden border border-gray-200">
                        {item.image && (
                          <Image
                            src={getCdnImageUrl(item.image, { width: 140, quality: 80 })}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        )}
                        <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {item.selectedMetal} • Size: {item.selectedSize || 'US 7'}
                        </p>
                        {item.engravingText && (
                          <p className="text-[10px] text-[#B89035] italic">
                            Engraving: &ldquo;{item.engravingText}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="text-xs font-bold text-gray-900 shrink-0">
                        {currencySymbol}
                        {(itemConvertedPrice * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakdown (Exact Etsy Styling) */}
              <div className="border-t border-gray-150 pt-4 mt-4 space-y-2.5 text-xs font-sans text-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Item(s) total</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol}{(convertedSubtotal * 2).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#0F6F2C]">
                  <span className="font-medium">Shop discount</span>
                  <span className="font-bold">
                    -{currencySymbol}{convertedSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-gray-150">
                  <span className="font-medium text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol}{convertedSubtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Truck className="w-3.5 h-3.5 text-[#064E3B]" />
                    Delivery (Worldwide Express)
                  </span>
                  <span className="text-[#0F6F2C] font-bold uppercase tracking-wider text-[11px]">
                    FREE
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Sparkles className="w-3.5 h-3.5 text-[#B89035]" />
                    Velvet Ring Box & GRA Certificate
                  </span>
                  <span className="text-[#0F6F2C] font-bold uppercase tracking-wider text-[11px]">
                    INCLUDED
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-500 text-[11px]">Included in total</span>
                </div>

                {/* Coupon Discount */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Coupon ({appliedCoupon}) Applied</span>
                      </div>
                      <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                        {appliedPromo?.label || 'Discount Applied'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700 text-sm">
                        -{currencySymbol}{couponDiscount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                        title="Remove coupon"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Promo / Coupon Input */}
                {!appliedCoupon && (
                  <div className="pt-1.5 border-t border-gray-150">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          if (couponError) setCouponError('');
                        }}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-[#B76E79]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        Apply
                      </button>
                    </form>
                    {couponError && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{couponError}</p>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">
                    Total ({cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.length === 1 ? 'item' : 'items'})
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-serif font-bold text-gray-900">
                      {currencySymbol}{finalTotal.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-gray-500">
                      {selectedCurrency.code} · Includes all applicable duties & packaging
                    </span>
                  </div>
                </div>

                {/* Secure options in checkout + Payment logos (Exact Etsy style) */}
                <div className="pt-3 border-t border-gray-150 text-center space-y-2">
                  <p className="text-xs font-semibold text-gray-800 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gray-600" />
                    Secure options in checkout
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[10px] font-black tracking-wider text-[#1A1F71] shadow-2xs">
                      VISA
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[10px] font-bold text-gray-900 flex items-center gap-0.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#EB001B] inline-block -mr-1" />
                      <span className="w-2 h-2 rounded-full bg-[#F79E1B] inline-block opacity-90" />
                      <span className="text-[9px] ml-1">Mastercard</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#006FCF] text-white rounded text-[9px] font-bold tracking-wider shadow-2xs">
                      AMEX
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[10px] font-bold text-[#003087] shadow-2xs">
                      PayPal
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-250 rounded text-[9px] font-bold text-[#FF6000] shadow-2xs">
                      DISCOVER
                    </span>
                    <span className="px-2 py-0.5 bg-black text-white rounded text-[9px] font-bold tracking-tight shadow-2xs">
                       Pay
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Additional duties and fees <span className="underline cursor-pointer">may apply</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-700">
                <ShieldCheck className="w-4 h-4 text-[#B89035] shrink-0" />
                <span>
                  <strong>GRA Certified Moissanite:</strong> Authenticity card & laser inscription with every ring.
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-700">
                <Truck className="w-4 h-4 text-[#064E3B] shrink-0" />
                <span>
                  <strong>Doorstep Courier Delivery:</strong> Dispatched via FedEx / DHL with full door-to-door tracking.
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-700">
                <Clock className="w-4 h-4 text-[#B89035] shrink-0" />
                <span>
                  <strong>15-Day Exchange Guarantee:</strong> Sizing adjustments and return support.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
