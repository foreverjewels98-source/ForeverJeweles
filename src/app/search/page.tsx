'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import ProductCard from '@/components/products/ProductCard';
import { SHAPES } from '@/lib/data';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [selectedMetal, setSelectedMetal] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const isFirstMountRef = useRef(true);
  const prevSearchFiltersRef = useRef({ searchTerm, selectedCategory, selectedShape, selectedMetal, sortBy });

  const PRODUCTS_PER_PAGE = 12;

  // Restore pagination on mount from URL searchParams or sessionStorage
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPage = parseInt(urlParams.get('page') || '', 10);
      const sessionPage = parseInt(sessionStorage.getItem('fj_search_page') || '', 10);
      const targetPage = (!isNaN(urlPage) && urlPage >= 1)
        ? urlPage
        : (!isNaN(sessionPage) && sessionPage >= 1 ? sessionPage : 1);

      if (targetPage > 1) {
        setCurrentPage(targetPage);
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  // Listen to browser Back / Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const p = parseInt(urlParams.get('page') || '1', 10);
        if (!isNaN(p) && p >= 1) {
          setCurrentPage(p);
        }
      } catch (e) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state if URL search query changes
  useEffect(() => {
    if (initialQuery !== searchTerm) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  // Handle Search Input Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    try {
      sessionStorage.setItem('fj_search_page', '1');
    } catch (e) {}
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    router.push('/search');
  };

  // Popular search suggestions
  const popularKeywords = [
    'Moissanite Rings',
    'Oval Solitaire',
    'Emerald Cut',
    'Signet Ring',
    'Opal Ring',
    'Vintage Art Deco',
    'Eternity Band',
    'Lesbian Pride Ring',
    'Gold Overlay',
    'Pendant',
  ];

  // Comprehensive multi-field and tokenized search filter
  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const queryTokens = query.split(/\s+/).filter(Boolean);

    return products
      .filter((p) => {
        // 1. Text Query Match
        if (queryTokens.length > 0) {
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

          // Every token in the query must match something in the searchable string
          const matchesAllTokens = queryTokens.every((token) =>
            searchableText.includes(token)
          );
          if (!matchesAllTokens) return false;
        }

        // 2. Category Filter
        if (selectedCategory !== 'all') {
          const cat = (p.category || '').toLowerCase();
          if (selectedCategory === 'rings' && !cat.includes('ring')) return false;
          if (selectedCategory === 'bands' && !cat.includes('band') && !(p.name.toLowerCase().includes('band'))) return false;
          if (selectedCategory === 'pendants' && !cat.includes('pendant') && !cat.includes('necklace')) return false;
          if (selectedCategory === 'earrings' && !cat.includes('earring')) return false;
        }

        // 3. Shape Filter
        if (selectedShape !== 'all') {
          if (p.shape.toLowerCase() !== selectedShape.toLowerCase()) return false;
        }

        // 4. Metal Filter
        if (selectedMetal !== 'all') {
          const metalLower = selectedMetal.toLowerCase();
          const hasMetal =
            p.metal.toLowerCase().includes(metalLower) ||
            p.variants.some((v) => v.metal.toLowerCase().includes(metalLower));
          if (!hasMetal) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default relevance / featured
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedShape, selectedMetal, sortBy]);

  // Reset pagination on filter change only after initial mount
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const prev = prevSearchFiltersRef.current;
    if (
      prev.searchTerm !== searchTerm ||
      prev.selectedCategory !== selectedCategory ||
      prev.selectedShape !== selectedShape ||
      prev.selectedMetal !== selectedMetal ||
      prev.sortBy !== sortBy
    ) {
      prevSearchFiltersRef.current = { searchTerm, selectedCategory, selectedShape, selectedMetal, sortBy };
      setCurrentPage(1);
      try {
        sessionStorage.setItem('fj_search_page', '1');
        const url = new URL(window.location.href);
        url.searchParams.delete('page');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  }, [searchTerm, selectedCategory, selectedShape, selectedMetal, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

  // Clamp page if count drops
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(clamped);
    try {
      sessionStorage.setItem('fj_search_page', String(clamped));
      const url = new URL(window.location.href);
      if (clamped > 1) {
        url.searchParams.set('page', String(clamped));
      } else {
        url.searchParams.delete('page');
      }
      window.history.pushState({ page: clamped }, '', url.toString());
    } catch (e) {}
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const startIndex = filteredProducts.length > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0;
  const endIndex = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedShape('all');
    setSelectedMetal('all');
    setSortBy('relevance');
  };

  return (
    <div className="w-full min-h-screen bg-[#FFF0F5] text-[#18181B] font-sans antialiased pt-20 sm:pt-28 pb-20">
      {/* ── Search Hero & Input Header ────────────────────────────────────────── */}
      <section className="bg-[#592D37] text-[#FFF0F5] py-10 sm:py-16 border-b border-[#D39EAA]/30 shadow-royal relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#B76E79]/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D39EAA]/20 border border-[#D39EAA]/40 text-[#D39EAA] rounded-full text-[11px] font-sans font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Studio Gemstone & Ring Vault
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold mb-3 text-white">
            Find Your Dream Ring
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#FFF0F5]/80 max-w-xl mx-auto mb-6">
            Search our complete collection of 280+ handcrafted rings, VVS1 D-Color moissanites, gemstones, and custom bespoke designs.
          </p>

          {/* Primary Search Bar Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative flex items-center bg-[#FFF0F5] rounded-full shadow-2xl p-1.5 sm:p-2 border border-[#D39EAA]/60"
          >
            <div className="pl-3 sm:pl-4 text-[#592D37]">
              <Search className="w-5 h-5 text-[#C88E91]" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rings, gemstones, shapes (e.g. Oval, Signet, Opal)..."
              className="w-full px-3 py-2 text-xs sm:text-sm text-[#18181B] bg-transparent focus:outline-none placeholder:text-gray-400 font-sans"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 mr-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-5 sm:px-7 py-2 sm:py-2.5 bg-[#592D37] hover:bg-[#D39EAA] text-[#D39EAA] hover:text-[#592D37] font-sans text-xs font-bold tracking-wider uppercase rounded-full transition-all shrink-0 cursor-pointer shadow-md"
            >
              Search
            </button>
          </form>

          {/* Popular Search Chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-sans text-[#FADBD8]/80 mr-1">Trending:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => {
                  setSearchTerm(kw);
                  router.push(`/search?q=${encodeURIComponent(kw)}`);
                }}
                className={`text-[11px] font-sans px-3 py-1 rounded-full transition-all cursor-pointer border ${
                  searchTerm.toLowerCase() === kw.toLowerCase()
                    ? 'bg-[#D39EAA] text-[#592D37] font-bold border-[#D39EAA]'
                    : 'bg-white/10 hover:bg-white/20 text-[#FFF0F5] border-white/20'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Results & Filtering Area ────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results Info & Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E8E5DF]">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#592D37]">
              {searchTerm.trim() ? (
                <>
                  Results for &ldquo;<span className="text-[#8C6A1F]">{searchTerm}</span>&rdquo;
                </>
              ) : (
                'All Jewelry Creations'
              )}
            </h2>
            <p className="font-sans text-xs text-gray-500 mt-0.5">
              Showing {filteredProducts.length > 0 ? `${startIndex}–${endIndex}` : 0} of {filteredProducts.length} jewelry designs
            </p>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs font-sans text-[#592D37] focus:outline-none focus:border-[#D39EAA] cursor-pointer shadow-2xs"
            >
              <option value="all">All Categories</option>
              <option value="rings">Rings</option>
              <option value="bands">Wedding Bands</option>
              <option value="pendants">Pendants & Necklaces</option>
              <option value="earrings">Earrings</option>
            </select>

            {/* Shape Filter */}
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              className="bg-white border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs font-sans text-[#592D37] focus:outline-none focus:border-[#D39EAA] cursor-pointer shadow-2xs"
            >
              <option value="all">All Shapes</option>
              <option value="Oval">Oval Cut</option>
              <option value="Round">Round Brilliant</option>
              <option value="Emerald">Emerald Cut</option>
              <option value="Cushion">Cushion Cut</option>
              <option value="Pear">Pear Cut</option>
              <option value="Princess">Princess Cut</option>
              <option value="Marquise">Marquise Cut</option>
              <option value="Radiant">Radiant Cut</option>
            </select>

            {/* Metal Filter */}
            <select
              value={selectedMetal}
              onChange={(e) => setSelectedMetal(e.target.value)}
              className="bg-white border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs font-sans text-[#592D37] focus:outline-none focus:border-[#D39EAA] cursor-pointer shadow-2xs"
            >
              <option value="all">All Metals</option>
              <option value="Silver">925 Sterling Silver</option>
              <option value="Yellow Gold">Yellow Gold</option>
              <option value="Rose Gold">Rose Gold</option>
              <option value="White Gold">White Gold</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs font-sans text-[#592D37] focus:outline-none focus:border-[#D39EAA] cursor-pointer shadow-2xs"
            >
              <option value="relevance">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Reset Filters */}
            {(selectedCategory !== 'all' || selectedShape !== 'all' || selectedMetal !== 'all' || sortBy !== 'relevance') && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Product Grid or Empty State ─────────────────────────────────────── */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 w-full">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-[#E8E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-gray-500 font-sans">
                  Page <strong className="text-[#592D37] font-semibold">{currentPage}</strong> of{' '}
                  <strong className="text-[#592D37] font-semibold">{totalPages}</strong> ({filteredProducts.length} total results)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3.5 py-2 bg-white border border-[#E8E5DF] text-[#592D37] disabled:opacity-30 rounded-xl text-xs font-semibold hover:border-[#D39EAA] transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {totalPages <= 7 ? (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-[#592D37] text-[#D39EAA] shadow-sm'
                              : 'bg-white border border-[#E8E5DF] text-gray-700 hover:border-[#D39EAA]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))
                    ) : (
                      <>
                        {[1, 2].map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-[#592D37] text-[#D39EAA] shadow-sm'
                                : 'bg-white border border-[#E8E5DF] text-gray-700 hover:border-[#D39EAA]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        {currentPage > 3 && <span className="px-1 text-gray-400 text-xs">...</span>}

                        {currentPage > 2 && currentPage < totalPages - 1 && (
                          <button
                            type="button"
                            className="w-8 h-8 rounded-lg text-xs font-sans font-bold bg-[#592D37] text-[#D39EAA] shadow-sm"
                          >
                            {currentPage}
                          </button>
                        )}

                        {currentPage < totalPages - 2 && <span className="px-1 text-gray-400 text-xs">...</span>}

                        {[totalPages - 1, totalPages].map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-[#592D37] text-[#D39EAA] shadow-sm'
                                : 'bg-white border border-[#E8E5DF] text-gray-700 hover:border-[#D39EAA]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3.5 py-2 bg-white border border-[#E8E5DF] text-[#592D37] disabled:opacity-30 rounded-xl text-xs font-semibold hover:border-[#D39EAA] transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="py-16 sm:py-24 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#F5F2EC] flex items-center justify-center mx-auto mb-4 text-[#8C6A1F]">
              <Search className="w-8 h-8 opacity-60" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-[#592D37] mb-2">
              No Rings Found Matching &ldquo;{searchTerm}&rdquo;
            </h3>
            <p className="font-sans text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
              We couldn&apos;t find any rings or jewelry matching your exact query. Try checking your spelling, using broader search terms, or explore our most popular collections below.
            </p>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {['Oval Solitaire', 'Moissanite Ring', 'Signet Ring', 'Emerald Cut', 'Rose Gold'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchTerm(tag);
                    router.push(`/search?q=${encodeURIComponent(tag)}`);
                  }}
                  className="px-3.5 py-1.5 bg-white border border-[#D39EAA]/50 hover:bg-[#592D37] hover:text-[#D39EAA] text-xs font-sans rounded-full text-[#592D37] transition-colors cursor-pointer shadow-xs"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* WhatsApp Custom Inquiry */}
            <div className="p-6 bg-white rounded-2xl border border-[#E8E5DF] shadow-xs text-center">
              <h4 className="font-serif text-base font-bold text-[#592D37] mb-1">
                Looking for a Custom Ring Design?
              </h4>
              <p className="font-sans text-xs text-gray-500 mb-4">
                Our master artisans can craft any custom Moissanite or gemstone ring from your photos or CAD sketches.
              </p>
              <a
                href={`https://wa.me/919828930454?text=${encodeURIComponent(
                  `Hi ForeverJewells, I searched for "${searchTerm}" on your website and would like a custom quote!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#592D37] hover:bg-[#D39EAA] text-[#D39EAA] hover:text-[#592D37] rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-colors"
              >
                Inquire on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF0F5] pt-32 pb-20 flex items-center justify-center font-sans">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#D39EAA] border-t-transparent animate-spin mx-auto" />
            <h2 className="font-serif text-xl text-[#18181B] font-bold">
              Searching Studio Gemstone Vault...
            </h2>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
