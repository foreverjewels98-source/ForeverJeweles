'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getCdnImageUrl } from '@/lib/imageCdn';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { products } from '@/lib/data';

export default function Header() {
  const router = useRouter();
  const { totalItems, setIsCartOpen, wishlist } = useCart();
  const { selectedRegion, selectedCurrency, setIsSettingsModalOpen, formatPrice, t } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Cmd/Ctrl + K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Robust multi-token and multi-field search across catalog
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const tokens = query.split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      const searchableText = [
        p.name,
        p.category,
        p.shape,
        p.metal,
        p.primaryGemstone || '',
        p.secondaryGemstone || '',
        p.ringStyle || '',
        p.description || '',
        p.badge || '',
        ...(p.tags || []),
        p.sku || '',
      ]
        .join(' ')
        .toLowerCase();

      return tokens.every((token) => searchableText.includes(token));
    });
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleChipClick = (term: string) => {
    setSearchQuery(term);
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-[#592D37] text-[#FFF0F5] border-b border-[#D39EAA]/25 shadow-royal transition-all">
        {/* Top Gold Announcement Bar */}
        <AnnouncementBar />

        {/* Main Navbar */}
        <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between min-h-[64px] lg:min-h-[80px] py-2 lg:py-0">
            
            {/* Mobile Top Row / Unwrapped on Desktop */}
            <div className="flex items-center justify-between w-full lg:contents">
              
              {/* Brand Logo (Left) */}
              <div className="flex items-center justify-start shrink-0 lg:order-1 py-1 lg:py-0">
                <Link href="/" className="group flex items-center">
                  <span className="font-serif italic text-[18px] sm:text-[30px] lg:text-[36px] font-bold text-[#D39EAA] group-hover:text-white transition-colors tracking-wide flex flex-col sm:block leading-[1.1] sm:leading-normal">
                    <span>Forever</span>{' '}
                    <span className="-mt-0.5 sm:mt-0">Jewells</span>
                  </span>
                </Link>
              </div>

              {/* Right Action Icons (Right) */}
              <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0 lg:order-3">
                {/* Region & Currency Selector */}
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-sans text-[#FFF0F5] hover:text-[#D39EAA] bg-white/10 hover:bg-white/20 rounded-full transition-all border border-[#D39EAA]/35 hover:border-[#D39EAA] cursor-pointer shadow-xs"
                  title="Change country/region, language or currency"
                  aria-label="Change region and currency"
                >
                  <span className="text-sm leading-none">{selectedRegion.flag}</span>
                  <span className="font-semibold tracking-wide hidden sm:inline">
                    {selectedCurrency.code} ({selectedCurrency.symbol})
                  </span>
                  <span className="font-semibold tracking-wide sm:hidden">
                    {selectedCurrency.code}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#D39EAA]" />
                </button>


                {/* Etsy Shop Button */}
                <a
                  href="https://www.etsy.com/shop/foreverjewellstudio?section_id=59060242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex text-[#FFF0F5] hover:text-[#D39EAA] transition-colors p-1 items-center justify-center group"
                  title="Visit our Etsy Shop"
                >
                  <div className="bg-[#F1641E] text-white px-2 sm:px-2.5 h-6 flex items-center justify-center rounded shadow-sm group-hover:scale-105 transition-all">
                    <span className="font-serif font-bold text-[11px] sm:text-[12px] leading-none tracking-wide">
                      Etsy
                    </span>
                  </div>
                </a>

                {/* Search Button */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-[#FFF0F5] hover:text-[#D39EAA] transition-colors p-1.5 cursor-pointer rounded-full hover:bg-white/10"
                  title="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.8} />
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className="text-[#FFF0F5] hover:text-[#D39EAA] active:scale-95 transition-all relative p-1.5 block rounded-full hover:bg-white/10"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.8} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D39EAA] text-[#592D37] font-sans text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  id="header-cart-icon"
                  onClick={() => setIsCartOpen(true)}
                  className="text-[#FFF0F5] hover:text-[#D39EAA] transition-colors relative p-1.5 flex items-center rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.8} />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D39EAA] text-[#592D37] font-sans text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Links (Center on Desktop, Bottom Row on Mobile) */}
            <nav className="flex w-full lg:w-auto flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 lg:gap-x-6 xl:gap-x-10 gap-y-1 pt-2 mt-1 lg:mt-0 lg:pt-0 lg:border-none lg:order-2">
              {[
                { name: 'Home', href: '/' },
                { name: 'My Orders', href: '/my-orders' },
                { name: 'Contact', href: '/contact' },
                { name: 'Help', href: '/#faqs' },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="font-serif italic text-[13px] sm:text-[15px] xl:text-[18px] font-medium tracking-[0.05em] text-[#FFF0F5] hover:text-[#D39EAA] transition-colors relative group whitespace-nowrap"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#D39EAA] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

          </div>
        </div>
      </header>

      {/* ── LUXURY SEARCH OVERLAY MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-sm">
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={() => setIsSearchOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-[#FFF0F5] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#D39EAA]/50"
            >
              {/* Search Bar Input Form */}
              <form
                onSubmit={handleSearchSubmit}
                className="p-3.5 sm:p-4 border-b border-[#E8E5DF] flex items-center gap-3 bg-[#592D37] text-[#FFF0F5]"
              >
                <Search className="w-5 h-5 text-[#D39EAA] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.search.placeholder}

                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full font-sans text-sm sm:text-base text-white bg-transparent focus:outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-gray-300 hover:text-white cursor-pointer"
                    title="Clear query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="hidden sm:inline-block px-3.5 py-1.5 bg-[#D39EAA] hover:bg-[#FADBD8] text-[#592D37] rounded-lg font-sans text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-gray-300 hover:text-white cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {/* Suggestions or Live Results Area */}
              <div className="max-h-[65vh] overflow-y-auto p-4">
                {searchQuery.trim() === '' ? (
                  <div className="py-3">
                    <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold tracking-wider text-gray-400 uppercase font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-[#C88E91]" />
                      Popular Jewelry Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Moissanite Rings',
                        'Oval Solitaire',
                        'Emerald Cut',
                        'Signet Ring',
                        'Opal Ring',
                        'Vintage Art Deco',
                        'Eternity Band',
                        'Lesbian Pride Ring',
                        '14k Yellow Gold',
                        'Rose Gold Ring',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleChipClick(tag)}
                          className="px-3.5 py-1.5 bg-[#F5F2EC] hover:bg-[#D39EAA]/25 text-xs font-sans rounded-full text-[#592D37] transition-colors border border-[#E8E5DF] cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-sans">
                      <span>Tip: Press <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-300">Enter</kbd> to view full results page</span>
                      <Link
                        href="/shop"
                        onClick={() => setIsSearchOpen(false)}
                        className="text-[#8C6A1F] hover:underline font-semibold flex items-center gap-1"
                      >
                        Browse all rings <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                      <p className="font-sans text-xs font-semibold text-gray-400 uppercase">
                        {searchResults.length} {searchResults.length === 1 ? 'Design' : 'Designs'} Found
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        }}
                        className="text-xs font-semibold text-[#8C6A1F] hover:underline font-sans flex items-center gap-1 cursor-pointer"
                      >
                        View all in full grid <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {searchResults.slice(0, 8).map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 py-2.5 px-2 hover:bg-[#F5F2EC] rounded-xl transition-colors group"
                        >
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <Image
                              src={getCdnImageUrl(prod.images[0], { width: 140, quality: 80 })}
                              alt={prod.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-xs sm:text-sm font-semibold text-[#592D37] group-hover:text-[#C88E91] truncate">
                              {prod.name}
                            </h4>
                            <p className="font-sans text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <span>{prod.shape} Cut</span>
                              {prod.carat && prod.carat !== 'N/A' && (
                                <>
                                  <span>•</span>
                                  <span>{prod.carat}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="capitalize">{prod.category}</span>
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-sans text-xs sm:text-sm font-bold text-[#B76E79] block">
                              {formatPrice(prod.price)}
                            </span>
                            <span className="font-sans text-[10px] text-gray-400 line-through">
                              {formatPrice(prod.originalPrice)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {searchResults.length > 8 && (
                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false);
                            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          }}
                          className="w-full py-2 bg-[#F5F2EC] hover:bg-[#D39EAA]/20 text-[#592D37] font-sans text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#E8E5DF]"
                        >
                          View all {searchResults.length} results on Search Page →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3 font-sans">
                    <p className="text-gray-500 text-sm">
                      No matching rings or jewelry found for &ldquo;{searchQuery}&rdquo;.
                    </p>
                    <p className="text-xs text-gray-400">
                      Try searching for &ldquo;Oval&rdquo;, &ldquo;Emerald&rdquo;, &ldquo;Signet&rdquo;, or &ldquo;Moissanite&rdquo;.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#592D37] text-[#D39EAA] rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#D39EAA] hover:text-[#592D37] transition-colors"
                      >
                        Explore Advanced Search Page <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MOBILE MENU DRAWER ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="fixed inset-y-0 left-0 w-[84%] max-w-sm bg-[#592D37] text-[#FFF0F5] border-r border-[#D39EAA]/30 shadow-2xl flex flex-col justify-between"
            >
              <div className="overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-[#D39EAA]/20">
                  <div>
                    <span className="font-serif text-xl font-bold tracking-widest text-[#D39EAA] uppercase">
                      ForeverJewells
                    </span>
                    <p className="font-sans text-[8.5px] tracking-widest text-[#FADBD8] uppercase font-semibold">
                      Royal Moissanite & Fine Jewelry
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-gray-400 hover:text-white cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Region & Currency in Mobile Drawer */}
                <div className="p-3 border-b border-[#D39EAA]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-base">{selectedRegion.flag}</span>
                    <span className="font-medium text-[#FFF0F5]">{selectedRegion.name}</span>
                    <span className="text-[#D39EAA] font-bold">({selectedCurrency.code} {selectedCurrency.symbol})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="text-xs text-[#D39EAA] hover:underline font-semibold cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <nav className="p-4 space-y-2.5">
                  {[
                    { name: 'My Saved Wishlist', href: '/wishlist', count: `${wishlist.length} Saved` },
                    { name: 'My Orders & History', href: '/my-orders', count: 'My Orders' },
                    { name: 'Search Product Catalog', href: '/search', count: 'Search' },
                    { name: 'Shop All Jewelry', href: '/shop', count: 'Explore' },
                    { name: 'Rings', href: '/category/rings', count: 'Bestsellers' },
                    { name: 'Band', href: '/category/band', count: 'Classic' },
                    { name: 'Lesbian Ring', href: '/category/lesbian-ring', count: 'Trending' },
                    { name: 'Pendant', href: '/category/pendant', count: 'Gifting' },
                    { name: 'Earrings', href: '/category/earrings', count: 'Daily Wear' },
                    { name: 'Necklace', href: '/category/necklace', count: 'New' },
                    { name: 'Bracelet', href: '/category/bracelet', count: 'Essentials' },
                    { name: 'Nose Ring', href: '/category/nose-ring', count: 'Trendy' },
                    { name: 'Belly Rings', href: '/category/belly-rings', count: 'Trendy' },
                    { name: 'Ring Set', href: '/category/ring-set', count: 'Trending' },
                    { name: 'Moissanite vs Diamond Guide', href: '/#comparison', count: 'Guide' },
                    { name: 'Interactive Ring Sizer', href: '/#size-guide', count: 'Tool' },
                    { name: 'Contact Us & Store Location', href: '/contact', count: 'Help' },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-1.5 border-b border-[#D39EAA]/15 text-[#FFF0F5] hover:text-[#D39EAA] transition-colors"
                    >
                      <span className="font-serif text-sm sm:text-base">{item.name}</span>
                      <span className="font-sans text-[9px] text-[#D39EAA]/80 uppercase tracking-wider">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom Drawer Actions */}
              <div className="p-4 bg-[#011C15] border-t border-[#D39EAA]/20 space-y-2">
                <a
                  href="https://wa.me/919828930454"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#D39EAA] text-[#592D37] rounded-xl font-sans text-xs font-bold tracking-wider uppercase shadow-md hover:bg-[#FADBD8] transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
                <p className="text-center font-sans text-[10px] text-gray-400">
                  Mon - Sat • 10:00 AM - 8:00 PM IST
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
