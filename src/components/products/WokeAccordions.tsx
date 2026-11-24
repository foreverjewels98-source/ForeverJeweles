'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldCheck, Truck, RotateCcw, Sparkles, HelpCircle, FileText } from 'lucide-react';
import { Product } from '@/lib/data';

interface WokeAccordionsProps {
  product: Product;
  selectedMetal?: string;
  selectedCarat?: string;
}

export default function WokeAccordions({ product, selectedMetal, selectedCarat }: WokeAccordionsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    shipping: false,
    returns: false,
    care: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentMetal = selectedMetal || product.metal || '925 sterling silver';
  const currentCarat = selectedCarat || product.carat || '2.00 CT';
  const bespokeText = product.bespokeNotice || (product.readyToShip ? 'READY TO SHIP • DISPATCHES IN 24-48 HRS' : 'BESPOKE! SHIPS IN 2-3 WEEKS!');

  const details = product.itemDetails || {};
  const parsedFromDesc: Record<string, string> = {};
  if (product.description) {
    product.description.split('\n').forEach((line) => {
      const trimmed = line.trim().replace(/^[*•-]+\s*/, '').trim();
      if (trimmed.includes(':')) {
        const [k, ...vParts] = trimmed.split(':');
        const key = k.trim();
        const val = vParts.join(':').trim();
        if (key && val && key.length < 35 && val.length < 120 && !key.toLowerCase().includes('http') && !key.toLowerCase().includes('important')) {
          parsedFromDesc[key] = val;
        }
      }
    });
  }
  const mergedDetails: Record<string, string> = { ...parsedFromDesc, ...details };

  const mainStone = mergedDetails['Main stone'] || mergedDetails['Main Stone'] || mergedDetails['Primary Gemstone'] || product.primaryGemstone || 'Moissanite';
  const stoneShape = mergedDetails['Stone Shape'] || mergedDetails['Cut/Shape'] || product.shape || 'Oval Cut';
  const stoneSize = mergedDetails['Stone Size'] || mergedDetails['Size'] || '7x9mm';
  const stoneColor = mergedDetails['Stone Color'] || mergedDetails['Color'] || product.diamondColor || 'Colorless (D-Grade)';
  const secondaryStone = mergedDetails['Secondary Stone'] || mergedDetails['Secondary Gemstone(s)'] || product.secondaryGemstone;
  const jewelryType = mergedDetails['Jewelry Type'] || 'Designer Fine Jewelry Ring';
  const baseMetal = mergedDetails['Metal'] || currentMetal;
  const craftMethod = mergedDetails['Method'] || '100% Handmade Atelier';
  const ringSize = mergedDetails['Ring Size'] || 'US 4 to US 10 (Custom sizes available)';
  const occasion = mergedDetails['Occasion'] || product.occasion || 'Engagement, Anniversary, Promise Ring';
  const style = mergedDetails['Style'] || product.settingStyle || 'Art Deco / Vintage Solitaire';
  const country = mergedDetails['Country of Manufacture'] || 'India (Jaipur Atelier)';

  return (
    <div className="my-8 max-w-5xl mx-auto px-4 font-sans divide-y divide-[#E8E5DF] border-t border-b border-[#E8E5DF]">
      {/* 1. DESCRIPTION & ITEM DETAILS ACCORDION */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('description')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <span className="font-serif text-base sm:text-lg font-bold text-[#18181B] group-hover:text-[#8C6A1F] transition-colors">
              Item Details & Description
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#FAF3E0] text-[#8C6A1F] border border-[#8C6A1F]/30 rounded-xs">
              Etsy Atelier Specs
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              openSections.description ? 'rotate-180 text-[#8C6A1F]' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-5 pb-3 space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                {/* Header Tagline & Dispatch Notice */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
                  <p className="font-serif text-base sm:text-lg text-[#18181B] font-semibold">
                    {currentCarat} {product.shape} Cut Ring | {mainStone} in {currentMetal}
                  </p>
                  <div className="self-start sm:self-auto inline-block px-3 py-1 bg-[#FAF3E0] text-[#8C6A1F] border border-[#8C6A1F]/30 rounded-md font-bold text-xs tracking-wider uppercase">
                    {bespokeText}
                  </div>
                </div>

                {/* Etsy-Style Highlights Pills */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Item Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F6F0] border border-[#E8E2D7] rounded-full text-xs font-medium text-gray-800">
                      <span>🔨</span> Handmade item
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F6F0] border border-[#E8E2D7] rounded-full text-xs font-medium text-gray-800">
                      <span>💎</span> Gemstone: {mainStone} ({stoneSize})
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F6F0] border border-[#E8E2D7] rounded-full text-xs font-medium text-gray-800">
                      <span>💍</span> Metal: {baseMetal}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F6F0] border border-[#E8E2D7] rounded-full text-xs font-medium text-gray-800">
                      <span>✂️</span> Style: {style}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F6F0] border border-[#E8E2D7] rounded-full text-xs font-medium text-gray-800">
                      <span>🎁</span> Luxury Gift Box Packaging
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F6F0] border border-[#E8E2D7] rounded-full text-xs font-medium text-gray-800">
                      <span>✍️</span> Personalized Sizing: {ringSize}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F6F0] border border-[#E8E2D7] rounded-full text-xs font-medium text-gray-800">
                      <span>📦</span> Made to order in Jaipur, India
                    </span>
                  </div>
                </div>

                {/* Structured Specifications Table (Etsy Format) */}
                <div className="bg-[#FAF8F5] border border-[#E8E2D7] rounded-xl p-4 sm:p-5">
                  <h4 className="font-serif text-sm font-bold text-[#18181B] mb-3 pb-2 border-b border-[#E8E2D7] flex items-center justify-between">
                    <span>Jewelry & Gemstone Specifications</span>
                    <span className="text-[11px] font-sans font-normal text-gray-500">Atelier Certificate Included</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Main Stone:</span>
                      <span className="font-bold text-[#18181B]">{mainStone}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Stone Shape:</span>
                      <span className="font-bold text-[#18181B]">{stoneShape}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Stone Dimensions:</span>
                      <span className="font-bold text-[#8C6A1F]">{stoneSize}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Stone Color:</span>
                      <span className="font-bold text-[#18181B]">{stoneColor}</span>
                    </div>

                    {secondaryStone && (
                      <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                        <span className="font-semibold text-gray-600">Secondary Stone:</span>
                        <span className="font-bold text-[#18181B]">{secondaryStone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Jewelry Type:</span>
                      <span className="font-bold text-[#18181B]">{jewelryType}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Base Metal:</span>
                      <span className="font-bold text-[#18181B]">{baseMetal}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Crafting Method:</span>
                      <span className="font-bold text-[#18181B]">{craftMethod}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Occasion:</span>
                      <span className="font-bold text-[#18181B]">{occasion}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Design Style:</span>
                      <span className="font-bold text-[#18181B]">{style}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Ring Size Range:</span>
                      <span className="font-bold text-[#18181B]">{ringSize}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="font-semibold text-gray-600">Manufactured In:</span>
                      <span className="font-bold text-[#18181B]">{country}</span>
                    </div>
                  </div>
                </div>

                {/* Customization & Bespoke Atelier Note */}
                <div className="p-4 bg-[#F5F2EB] rounded-lg border border-[#E3DBD0] text-xs sm:text-sm text-gray-800 space-y-1">
                  <p className="font-bold text-[#18181B] flex items-center gap-1.5">
                    <span>✨</span> Custom Materials & Bespoke Requests
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    It&apos;s easy to create jewelry that&apos;s perfect for you. Change the materials (14K/18K Solid Gold, Rose Gold, 925 Silver) to suit your personal style. We are always delighted to quote your custom piece or resize to smaller/larger finger sizes upon request.
                  </p>
                </div>

                {/* Inclusions & Features */}
                {product.features && product.features.length > 0 && (
                  <div className="pt-2">
                    <p className="font-semibold text-[#18181B] text-sm mb-2">What&apos;s Included In Your Order:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <span className="text-[#8C6A1F] mt-0.5 flex-shrink-0">✦</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Etsy Delivery & Care Service Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-[#18181B] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#8C6A1F]" /> Free Standard Delivery
                    </p>
                    <p className="text-gray-500">Delivered securely within 15 days of dispatch with end-to-end tracking.</p>
                  </div>

                  <div className="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-[#18181B] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#8C6A1F]" /> Luxury Gift Box
                    </p>
                    <p className="text-gray-500">Nicely packaged inside a fancy velvet presentation gift box with polishing cloth.</p>
                  </div>

                  <div className="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-[#18181B] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8C6A1F]" /> 24/7 Dedicated Care
                    </p>
                    <p className="text-gray-500">Customer service available 7 days a week for inquiries, resizing, and wholesale.</p>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2 text-emerald-800 font-medium text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Complimentary 100-Day Polish Warranty & Authenticity Guarantee included with foreverjewells atelier creations.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. SHIPPING & DELIVERY ACCORDION */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('shipping')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <span className="font-serif text-base sm:text-lg font-bold text-[#18181B] group-hover:text-[#8C6A1F] transition-colors">
            Shipping & Insured Delivery
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              openSections.shipping ? 'rotate-180 text-[#8C6A1F]' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.shipping && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                <p>
                  Every piece is individually handcrafted and cast to order. Ready-to-ship designs dispatch within 24-48 hours; bespoke pieces ship within 2-3 weeks.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                  <li><span className="font-semibold text-gray-800">100% Insured Transit:</span> Full transit insurance covers your jewelry until it reaches your doorstep.</li>
                  <li><span className="font-semibold text-gray-800">Discreet Tamper-Proof Packaging:</span> Delivered in unmarked luxury packaging with digital OTP verification.</li>
                  <li><span className="font-semibold text-gray-800">Courier Partners:</span> Shipped via BlueDart Express, Delhivery Air, and DTDC Priority across India.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. RETURNS & LIFETIME BUYBACK ACCORDION */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('returns')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <span className="font-serif text-base sm:text-lg font-bold text-[#18181B] group-hover:text-[#8C6A1F] transition-colors">
            Returns, Exchanges & Lifetime Upgrade
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              openSections.returns ? 'rotate-180 text-[#8C6A1F]' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.returns && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                <p>
                  We stand 100% behind the craftsmanship of every ForeverJewells creation.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                  <li><span className="font-semibold text-gray-800">15-Day Exchange:</span> If the size or style isn&apos;t flawless, exchange it within 15 days in unworn condition.</li>
                  <li><span className="font-semibold text-gray-800">100% Lifetime Buyback:</span> Trade in or upgrade your moissanite and gold jewelry anytime at transparent market valuation.</li>
                  <li><span className="font-semibold text-gray-800">Free Resizing Support:</span> Complimentary 1-size adjustment within 30 days of delivery.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. CARE & AUTHENTICITY ACCORDION */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('care')}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <span className="font-serif text-base sm:text-lg font-bold text-[#18181B] group-hover:text-[#8C6A1F] transition-colors">
            Authenticity & Jewelry Care
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              openSections.care ? 'rotate-180 text-[#8C6A1F]' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.care && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                <p>
                  Moissanite registers 9.25 on the Mohs hardness scale (second only to diamond) and will never lose its fire, cloud, or fade over time.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                  <li><span className="font-semibold text-gray-800">GRA Certificate:</span> Includes individual serial number matched to an online international verification card.</li>
                  <li><span className="font-semibold text-gray-800">Cleaning:</span> Gently soak in lukewarm water with mild dish soap and brush with a soft toothbrush. Rinse and pat dry with the provided lint-free polishing cloth.</li>
                  <li><span className="font-semibold text-gray-800">Storage:</span> Store in your velvet ForeverJewells presentation box to prevent contact with other hard gemstones.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
