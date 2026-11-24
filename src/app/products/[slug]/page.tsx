'use client';

import React, { useState, use, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getCdnImageUrl } from '@/lib/imageCdn';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
  MessageCircle,
  Package,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  HelpCircle,
  ShoppingBag,
  Share2,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { STANDARD_METAL_TIERS, PRODUCT_METAL_PRICES } from '@/lib/data';
import ProductCard from '@/components/products/ProductCard';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import FindYourSizeDrawer, { INDIAN_SIZE_CHART, US_RING_SIZES } from '@/components/products/FindYourSizeDrawer';
import TrustCertificationRibbon from '@/components/products/TrustCertificationRibbon';
import WokeProductDetailsGrid from '@/components/products/WokeProductDetailsGrid';
import LiveDiamondTestBanner from '@/components/products/LiveDiamondTestBanner';
import WokeAccordions from '@/components/products/WokeAccordions';
import WokeOfferCard from '@/components/products/WokeOfferCard';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { getProductBySlug, products, isLoading } = useProducts();
  const product = getProductBySlug(resolvedParams.slug);

  const { addToCart, buyNow, isWishlisted, toggleWishlist, setIsCartOpen, triggerFlyAnimation } = useCart();
  const { formatPrice } = useCurrency();

  // State hooks - Etsy style selectors
  const [activeVariantIdx, setActiveVariantIdx] = useState<number>(0);
  const [selectedBandColour, setSelectedBandColour] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [personalisationText, setPersonalisationText] = useState<string>('');
  const [showPersonalisation, setShowPersonalisation] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{ band?: boolean; size?: boolean }>({});
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isShareCopied, setIsShareCopied] = useState<boolean>(false);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  // Sync scroll for bottom sticky buy bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If products are still being fetched from the server/storage and product is not ready yet
  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-[#FFF0F5] pt-32 pb-20 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#D39EAA] border-t-transparent animate-spin mx-auto" />
          <h2 className="font-serif text-xl text-[#18181B] font-bold">Loading Studio Gemstone Vault...</h2>
          <p className="text-xs text-gray-500 font-sans">Retrieving gemstone specifications & high-res angles</p>
        </div>
      </div>
    );
  }

  // Not found fallback
  if (!product) {
    notFound();
  }

  // ── METAL PRICING ──────────────────────────────────────────────────
  // Base price of the product is in 925 Sterling Silver.
  const basePrice = product.price;         // ₹ silver selling price
  const baseMRP   = product.originalPrice; // ₹ silver MRP

  // Exact per-product Etsy prices (or custom admin override), else additive premium model.
  const exactPrices = product.metalPrices ?? PRODUCT_METAL_PRICES[product.id] ?? null;

  // Filter relevant metal tiers:
  // 1. If exact Etsy prices exist, ONLY show the metals that Etsy actually offers for this item (with price > 0)
  // 2. Otherwise, adaptively filter based on product category & karat mentions
  const relevantTiers = STANDARD_METAL_TIERS.filter((tier) => {
    if (exactPrices) {
      const p = exactPrices[tier.metal];
      return p !== undefined && p > 0;
    }

    const category = (product.category || '').toLowerCase();
    const text = ((product.name || '') + ' ' + (product.description || '')).toLowerCase();
    const isSilverOnlyCategory = category.includes('necklace') || category.includes('pendant') || category.includes('bracelet');
    const mentionsSolidGold = text.includes('solid gold') || text.includes('14k solid') || text.includes('18k solid') || text.includes('9k solid') || text.includes('10k solid');

    if (isSilverOnlyCategory && !mentionsSolidGold) {
      return tier.group === 'Silver' || tier.group === 'Gold Overlay';
    }

    const has9k = text.includes('9k') || text.includes('9kt') || text.includes('9ct') || text.includes('375');
    const has10k = text.includes('10k') || text.includes('10kt') || text.includes('10ct') || text.includes('417');

    if (tier.group === '9k Gold') {
      if (has9k) return true;
      if (has10k) return false;
      return true;
    }

    if (tier.group === '10k Gold') {
      if (has10k) return true;
      if (has9k) return false;
      return false;
    }

    return true;
  });

  const metalBandOptions = relevantTiers.map((tier) => {
    // Compute selling price
    const price = exactPrices && exactPrices[tier.metal] !== undefined
      ? exactPrices[tier.metal]
      : basePrice + tier.priceAddon;

    // MRP: keep same discount% as the silver base for overlay/silver tiers;
    // for gold tiers, MRP = price * 2 (50% off, same as Etsy)
    const originalPrice = tier.priceAddon === 0
      ? baseMRP
      : Math.round(price * 2);

    return {
      metal:         tier.metal,
      colorCode:     tier.colorCode,
      group:         tier.group,
      price,
      originalPrice,
      // Try to find a matching variant image for this metal, else use first product image
      image: (
        product.variants?.find(
          (v) => v.metal.toLowerCase().includes(tier.metal.toLowerCase().split(' ')[0])
        )?.image
        || product.images?.[0]
        || ''
      ),
    };
  });

  // Active metal tier based on dropdown selection
  const activeTier = metalBandOptions.find((o) => o.metal === selectedBandColour)
    ?? metalBandOptions[0];

  // Pre-populate default metal & ring size so dropdowns are never unselected
  useEffect(() => {
    if (metalBandOptions.length > 0 && !selectedBandColour) {
      setSelectedBandColour(metalBandOptions[0].metal);
    }
    if (!selectedSize) {
      const isRing = (product?.category || '').toLowerCase().includes('ring') || (product?.name || '').toLowerCase().includes('ring');
      setSelectedSize(isRing ? 'US 7' : 'Standard');
    }
  }, [metalBandOptions, selectedBandColour, selectedSize, product]);

  // Prices shown in price block — update reactively as band colour changes
  const currentPrice         = activeTier?.price ?? basePrice;
  const currentOriginalPrice = activeTier?.originalPrice ?? baseMRP;

  const discountPercent = Math.max(
    5,
    Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
  );

  // For image gallery — use the active tier's matched image + rest of product images
  const activeVariantImage = activeTier?.image || product.images?.[0] || '';
  const allImages = [
    activeVariantImage,
    ...(product.images || []).filter((img) => img !== activeVariantImage),
  ];

  // Convenience alias for metal name used in cart / WhatsApp
  const activeMetal = activeTier?.metal || metalBandOptions[0]?.metal || '925 Sterling Silver';

  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    const isRing = (product?.category || '').toLowerCase().includes('ring') || (product?.name || '').toLowerCase().includes('ring');
    const bandToUse = selectedBandColour || activeMetal;
    const sizeToUse = selectedSize || (isRing ? 'US 7' : 'Standard');

    addToCart({
      product,
      quantity: 1,
      selectedMetal: bandToUse,
      selectedSize: sizeToUse,
      selectedCarat: product.carat,
      price: currentPrice,
      image: activeVariantImage,
      engravingText: personalisationText.trim() || undefined,
    });
    triggerFlyAnimation(activeVariantImage, e);
    setValidationErrors({});
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  // Buy it now (adds to cart & opens /checkout directly)
  const handleBuyNow = (e: React.MouseEvent) => {
    const isRing = (product?.category || '').toLowerCase().includes('ring') || (product?.name || '').toLowerCase().includes('ring');
    const bandToUse = selectedBandColour || activeMetal;
    const sizeToUse = selectedSize || (isRing ? 'US 7' : 'Standard');

    buyNow({
      product,
      quantity: 1,
      selectedMetal: bandToUse,
      selectedSize: sizeToUse,
      selectedCarat: product.carat,
      price: currentPrice,
      image: activeVariantImage,
      engravingText: personalisationText.trim() || undefined,
    });

    triggerFlyAnimation(activeVariantImage, e, 'drop');
    setValidationErrors({});
    setIsCartOpen(false);
    setTimeout(() => {
      router.push('/checkout');
    }, 1500); // Wait for the animation to play before redirecting
  };

  // WhatsApp order inquiry
  const handleWhatsAppOrder = () => {
    const sizeName = selectedSize || 'US 7';
    const message = encodeURIComponent(
      `*INQUIRY: ${product.name}*\n• Band Colour: ${activeMetal}\n• Ring Size: ${sizeName}\n• Carat: ${product.carat}${personalisationText ? `\n• Personalisation: ${personalisationText}` : ''}\n• Price: \u20b9${currentPrice.toLocaleString('en-IN')}\n\nHi ForeverJewells team, please assist me with ordering this piece!`
    );
    window.open(`https://wa.me/919999999999?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] text-[#18181B] font-sans antialiased">
      {/* 1. CLEAN BREADCRUMB & INTUITIVE BACK BUTTON */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500 border-b border-[#F0ECE1]">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap min-w-0">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
              } else {
                router.push(`/category/${product.category}`);
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-[#592D37] hover:text-[#D39EAA] text-stone-800 rounded-md text-xs font-semibold transition-all cursor-pointer mr-1 flex-shrink-0 border border-stone-200 shadow-2xs"
            title="Go back to previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span className="text-gray-300">|</span>
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Moissanite Jewellery</Link>
          <span className="text-gray-300">/</span>
          <Link href={`/category/${product.category}`} className="hover:text-black capitalize transition-colors">
            {product.category}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-medium truncate max-w-[280px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      {/* 2. MAIN PRODUCT SECTION (2-COLUMNS: WOKE COLLECTION LAYOUT) */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: LARGE HIGH-RES PHOTO + THUMBNAILS (7 COLS)           */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <ProductImageGallery
              images={allImages}
              productName={product.name}
              productId={product.id}
              badge={product.badge}
            />
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: BUY BOX, SELECTORS, CTAS, OFFERS (5 COLS)            */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Category / Collection Tag */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6A1F] block mb-1">
                Moissanite Solitaire Rings
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#18181B] leading-snug">
                {product.name} | Certified Moissanite & Fine Gold Ring
              </h1>
            </div>

            {/* Price Block */}
            <div className="space-y-1 pb-4 border-b border-[#E8E5DF]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-sans text-2xl sm:text-3xl font-bold text-[#18181B]">
                  {formatPrice(currentPrice)}
                </span>
                <span className="font-sans text-base text-gray-400 line-through">
                  {formatPrice(currentOriginalPrice)}
                </span>
                <span className="bg-[#18181B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-xs tracking-wider uppercase">
                  {discountPercent}% OFF
                </span>
                <span className="text-xs text-gray-500 font-sans cursor-pointer hover:underline">
                  Final sale ?
                </span>
              </div>
              <p className="text-xs text-gray-500">Taxes included.</p>
            </div>

            {/* ETSY STYLE SELECTORS (SS2 DESIGN) */}
            <div className="space-y-4 pt-1">
              {/* 1. Band colour Select */}
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-1.5">
                  Band colour
                </label>
                <div className="relative">
                  <select
                    value={selectedBandColour || metalBandOptions[0]?.metal || ''}
                    onChange={(e) => {
                      setSelectedBandColour(e.target.value);
                      setValidationErrors((prev) => ({ ...prev, band: false }));
                    }}
                    className="w-full bg-white border border-gray-400 hover:border-gray-600 focus:border-black focus:ring-1 focus:ring-black rounded-md px-3.5 py-3 pr-10 text-sm text-[#222222] appearance-none cursor-pointer transition-colors shadow-2xs font-sans"
                  >
                    {metalBandOptions.map((opt) => (
                      <option key={opt.metal} value={opt.metal}>
                        {opt.metal} ({formatPrice(opt.price)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none" />
                </div>
                {validationErrors.band && (
                  <p className="text-xs text-red-600 mt-1">Please select an option</p>
                )}
              </div>

              {/* 2. Ring size / Length Select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-[#222222]">
                    {((product.category || '').toLowerCase().includes('necklace') || (product.name || '').toLowerCase().includes('necklace') || (product.name || '').toLowerCase().includes('pendant'))
                      ? 'Chain Length'
                      : 'Ring size'}
                  </label>
                  {((product.category || '').toLowerCase().includes('ring') || (product.name || '').toLowerCase().includes('ring')) && (
                    <button
                      type="button"
                      onClick={() => setIsSizeDrawerOpen(true)}
                      className="text-xs text-gray-600 hover:text-black font-medium underline underline-offset-2 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Package className="w-3.5 h-3.5 text-gray-500" />
                      <span>Find your size</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => {
                      setSelectedSize(e.target.value);
                      setValidationErrors((prev) => ({ ...prev, size: false }));
                    }}
                    className="w-full bg-white border border-gray-400 hover:border-gray-600 focus:border-black focus:ring-1 focus:ring-black rounded-md px-3.5 py-3 pr-10 text-sm text-[#222222] appearance-none cursor-pointer transition-colors shadow-2xs font-sans"
                  >
                    {((product.category || '').toLowerCase().includes('necklace') || (product.name || '').toLowerCase().includes('necklace') || (product.name || '').toLowerCase().includes('pendant')) ? (
                      <>
                        <option value="16 Inch (40 cm)">16 Inch (40 cm) - Choker</option>
                        <option value="18 Inch (45 cm)">18 Inch (45 cm) - Standard Collarbone</option>
                        <option value="20 Inch (50 cm)">20 Inch (50 cm) - Matinee</option>
                      </>
                    ) : ((product.category || '').toLowerCase().includes('earring') || (product.name || '').toLowerCase().includes('earring')) ? (
                      <option value="Standard Pair">Standard Pair (Stud / Drop)</option>
                    ) : (
                      <>
                        <option value="US 7">US 7 (17.3 mm) - Standard Most Common</option>
                        {US_RING_SIZES.filter(s => s.us !== '7').map((s) => (
                          <option key={s.us} value={`US ${s.us}`}>
                            US {s.us} ({s.diameterMm} mm)
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none" />
                </div>
              </div>

              {/* 3. + Add personalisation (optional) */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowPersonalisation(!showPersonalisation)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#222222] hover:text-black cursor-pointer group py-1"
                >
                  {showPersonalisation ? (
                    <Minus className="w-4 h-4 text-gray-700 group-hover:text-black" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-700 group-hover:text-black" />
                  )}
                  <span className="group-hover:underline">Add personalisation (optional)</span>
                </button>

                <AnimatePresence>
                  {showPersonalisation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-2 pt-2"
                    >
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Add your personalisation (optional). Enter custom engraving text, ring sizing notes, or gift message.
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={50}
                          value={personalisationText}
                          onChange={(e) => setPersonalisationText(e.target.value)}
                          placeholder="e.g. Forever & Always ♡ / Custom engraving"
                          className="w-full bg-white border border-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-md px-3.5 py-2.5 text-sm text-[#222222] focus:outline-none transition-colors pr-14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                          {personalisationText.length}/50
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Action Buttons (Etsy Pill Button + Secondary Checkout) */}
              <div className="space-y-3 pt-2">
                {/* Etsy Large Pill Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 sm:py-4 bg-[#222222] hover:bg-black text-white font-bold text-sm sm:text-base rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to cart</span>
                    </>
                  ) : (
                    <span>Add to cart</span>
                  )}
                </button>

                {/* Secondary Fast Checkout */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3 bg-white hover:bg-gray-50 text-[#18181B] font-bold text-xs tracking-wider uppercase rounded-full border border-gray-300 hover:border-black transition-colors cursor-pointer select-none active:scale-95"
                  >
                    BUY IT NOW
                  </button>
                </div>

                {/* Wishlist & Share Action Bar */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => product && toggleWishlist(product.id)}
                    className={`flex-1 py-2.5 px-4 rounded-full border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95 ${
                      product && isWishlisted(product.id)
                        ? 'bg-rose-50 border-rose-300 text-rose-600'
                        : 'bg-white border-gray-300 hover:border-black text-gray-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${product && isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{product && isWishlisted(product.id) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        if (navigator.share) {
                          navigator.share({
                            title: product?.name,
                            text: `Check out this handcrafted Moissanite design at ForeverJewells: ${product?.name}`,
                            url: window.location.href,
                          }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          setIsShareCopied(true);
                          setTimeout(() => setIsShareCopied(false), 2000);
                        }
                      }
                    }}
                    className="py-2.5 px-4 rounded-full border border-gray-300 hover:border-black bg-white text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                    title="Share this design"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isShareCopied ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AVAILABLE OFFERS & STORE ATELIER CARDS */}
            <WokeOfferCard />
          </div>
        </div>

        {/* 3. TRUST & ACCREDITATION RIBBON (GIA, IGI, GRA, BIS HALLMARK) */}
        <TrustCertificationRibbon />

        {/* 4. PRODUCT DETAILS SPECIFICATION GRID (WARM BEIGE CARDS) */}
        <WokeProductDetailsGrid
          product={product}
          selectedMetal={activeMetal}
          selectedCarat={product.carat}
        />

        {/* 5. LIVE DIAMOND TEST VIRTUAL VIDEO CALL BANNER */}
        <LiveDiamondTestBanner productName={product.name} />

        {/* 6. CLEAN ACCORDIONS (DESCRIPTION, SHIPPING, RETURNS, CARE) */}
        <WokeAccordions
          product={product}
          selectedMetal={activeMetal}
          selectedCarat={product.carat}
        />

        {/* 7. CURATED RECOMMENDATIONS */}
        <div className="my-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6A1F] block">
              Curated Pairings
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#18181B] font-bold mt-1">
              You May Also Adore
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </main>

      {/* 8. FIND YOUR SIZE SLIDE-OVER DRAWER */}
      <FindYourSizeDrawer
        isOpen={isSizeDrawerOpen}
        onClose={() => setIsSizeDrawerOpen(false)}
        selectedSize={selectedSize}
        onSelectSize={(newSize) => {
          setSelectedSize(newSize);
          setValidationErrors((prev) => ({ ...prev, size: false }));
        }}
      />

      {/* 9. BOTTOM STICKY BUY BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E5DF] py-3 px-4 shadow-xl"
          >
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <Image
                    src={getCdnImageUrl(allImages[0], { width: 140, quality: 80 })}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <span className="font-serif text-xs font-bold text-[#18181B] truncate block">
                    {product.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-sans">
                    {activeMetal} {selectedSize ? `• ${selectedSize}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className="font-sans text-sm sm:text-base font-bold text-[#18181B] block">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="font-sans text-[10px] text-gray-400 line-through block">
                    {formatPrice(currentOriginalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-6 py-2.5 bg-[#222222] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  {isAdded ? '✓ Added' : 'Add to cart'}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="px-5 py-2.5 bg-white hover:bg-gray-100 text-[#18181B] font-bold text-xs uppercase tracking-wider rounded-full border border-gray-300 hover:border-black transition-colors cursor-pointer hidden md:block"
                >
                  BUY IT NOW
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
