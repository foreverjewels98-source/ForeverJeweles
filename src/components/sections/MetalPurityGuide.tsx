'use client';

import React from 'react';
import { ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';

const METALS_INFO = [
  {
    name: '925 Solid Sterling Silver',
    stamp: 'STAMP: 925',
    tag: 'Accessible Luxury',
    purity: '92.5% Pure Solid Silver',
    finish: 'Heavy 2.5µm Rhodium / 18K Gold Vermeil Dip',
    skinSafe: '100% Nickel-Free & Hypoallergenic',
    durability: 'High (Shower & Daily Safe with Gentle Care)',
    recommendation: 'Perfect for daily elegance, anniversary gifts, and travel rings.',
    colorClass: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    name: '14K Solid Gold',
    stamp: 'STAMP: 585 / 14K',
    tag: 'Bridal Standard',
    purity: '58.5% Pure Fine Gold',
    finish: 'Solid Through-and-Through (Never Wears Off)',
    skinSafe: 'Lifetime Skin-Safe & Tarnish-Proof',
    durability: 'Maximum Tensile Strength (Scratch Resistant)',
    recommendation: 'The gold standard for everyday lifetime engagement rings.',
    colorClass: 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/40',
  },
  {
    name: '18K Solid Royal Gold',
    stamp: 'STAMP: 750 / 18K',
    tag: 'Royal Heirloom',
    purity: '75.0% Pure Fine Gold',
    finish: 'Intense Rich Royal Warmth & High Karat Luster',
    skinSafe: 'Supreme Bio-Compatibility',
    durability: 'Superior Heirloom Longevity',
    recommendation: 'Favored by high-jewelry connoisseurs for its rich, deep glow.',
    colorClass: 'bg-yellow-50 text-yellow-900 border-yellow-300',
  },
  {
    name: '950 Solid Platinum',
    stamp: 'STAMP: 950 Pt',
    tag: 'Forever Noble Metal',
    purity: '95.0% Pure Hypoallergenic Platinum',
    finish: 'Naturally White Forever (Never Needs Rhodium Dip)',
    skinSafe: 'Zero Allergies (100% Medical Grade)',
    durability: 'Highest Density on Earth (Never Loses Metal Mass)',
    recommendation: 'For clients who want the most prestigious, weighty metal.',
    colorClass: 'bg-zinc-100 text-zinc-900 border-zinc-300',
  },
];

export default function MetalPurityGuide() {
  return (
    <section className="py-12 sm:py-24 bg-[#FFF0F5] border-t border-[#E8E5DF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4E8C1]/60 text-[#8C6A1F] rounded-full text-[11px] sm:text-xs font-sans font-bold tracking-widest uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C88E91]" />
            Hallmarking & Purity Standards
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#18181B] mb-4">
            Solid Precious Metals Only
          </h2>
          <div className="w-16 h-[1.5px] bg-[#D39EAA] mx-auto mb-4" />
          <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We never use cheap brass, copper, or hollow bands. Every ForeverJewells ring is cast in solid precious metal with official assay hallmark stamps and an unbending <strong>1.8mm–2.0mm comfort-fit thickness guarantee</strong>.
          </p>
        </div>

        {/* Metal Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto mb-10">
          {METALS_INFO.map((metal, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm flex flex-col justify-between ${metal.colorClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-black/5 border border-black/10">
                    {metal.stamp}
                  </span>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#8C6A1F]">
                    {metal.tag}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#18181B] mb-4">
                  {metal.name}
                </h3>

                <div className="space-y-2.5 font-sans text-xs text-gray-700 mb-6">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Composition</span>
                    <strong className="text-[#18181B]">{metal.purity}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Skin Safety</span>
                    <strong className="text-[#B76E79]">{metal.skinSafe}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Durability Grade</span>
                    <strong className="text-[#18181B]">{metal.durability}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Best For</span>
                    <p className="text-gray-600 leading-snug">{metal.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center gap-1.5 text-[11px] font-sans font-semibold text-[#B76E79]">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Hallmarked Guarantee</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
