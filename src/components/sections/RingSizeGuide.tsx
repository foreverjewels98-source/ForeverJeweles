'use client';

import React, { useState } from 'react';
import { Ruler, Sparkles, Hand, HelpCircle } from 'lucide-react';

const caratScales = [
  {
    carat: '1.00 CT',
    mm: '6.5 mm',
    look: 'Subtle Everyday Elegance',
    description: 'Classic & understated. Ideal for slender fingers and everyday office wear.',
    diameterScale: 0.75,
  },
  {
    carat: '1.50 CT',
    mm: '7.5 mm',
    look: 'The Sweet Spot (Most Popular)',
    description: 'The golden ratio of solitaire rings. Provides noticeable presence without overwhelming.',
    diameterScale: 0.88,
  },
  {
    carat: '2.00 CT',
    mm: '8.0 mm',
    look: 'Statement Luxury & Brilliance',
    description: 'Commanding attention with immense light return. The signature ForeverJewells luxury solitaire size.',
    diameterScale: 1.0,
  },
  {
    carat: '3.00 CT',
    mm: '9.0 mm',
    look: 'Opulent Red Carpet Solitaire',
    description: 'Breathtaking visual spread that covers over 50% of standard finger width.',
    diameterScale: 1.18,
  },
  {
    carat: '4.00 CT',
    mm: '10.0 mm',
    look: 'Monumental High Jewelry',
    description: 'Maximum visual impact, dazzling fire dispersion, and royal grandeur.',
    diameterScale: 1.35,
  },
];

const sizeChart = [
  { us: '4', india: '7', insideMm: '14.8 mm', circumMm: '46.5 mm' },
  { us: '5', india: '9 - 10', insideMm: '15.6 mm', circumMm: '49.0 mm' },
  { us: '6', india: '12', insideMm: '16.5 mm', circumMm: '51.8 mm' },
  { us: '7', india: '14', insideMm: '17.3 mm', circumMm: '54.4 mm' },
  { us: '8', india: '16 - 17', insideMm: '18.1 mm', circumMm: '56.9 mm' },
  { us: '9', india: '19', insideMm: '19.0 mm', circumMm: '59.5 mm' },
  { us: '10', india: '21 - 22', insideMm: '19.8 mm', circumMm: '62.1 mm' },
];

export default function RingSizeGuide() {
  const [activeCaratIdx, setActiveCaratIdx] = useState(2); // 2.00 CT by default
  const [activeTab, setActiveTab] = useState<'carat' | 'sizer'>('carat');

  const currentCarat = caratScales[activeCaratIdx];

  return (
    <section id="size-guide" className="py-20 bg-[#FFF0F5] border-t border-[#E8E5DF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="font-sans text-xs font-bold tracking-[0.25em] text-[#8C6A1F] uppercase mb-2">
            Interactive Buyer Tools
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#18181B] mb-4">
            Carat Visualizer & Ring Sizing Guide
          </h2>
          <div className="w-20 h-[1.5px] bg-[#C88E91] mx-auto mb-6" />
          <p className="font-sans text-sm sm:text-base text-gray-600">
            Never guess how a ring will look or fit on your finger. Switch between our live carat scale simulator and Indian ring size conversion chart.
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex bg-[#F7F5F0] p-1.5 rounded-xl border border-[#E8E5DF] mt-6 gap-2">
            <button
              onClick={() => setActiveTab('carat')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-sans text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'carat'
                  ? 'bg-[#18181B] text-[#D39EAA] shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Carat Size Visualizer
            </button>
            <button
              onClick={() => setActiveTab('sizer')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-sans text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'sizer'
                  ? 'bg-[#18181B] text-[#D39EAA] shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Ruler className="w-4 h-4" />
              Ring Sizing Chart
            </button>
          </div>
        </div>

        {activeTab === 'carat' ? (
          <div className="bg-white rounded-2xl border border-[#E8E5DF] shadow-luxury p-6 sm:p-10 max-w-5xl mx-auto">
            {/* Carat Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {caratScales.map((item, idx) => (
                <button
                  key={item.carat}
                  onClick={() => setActiveCaratIdx(idx)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    activeCaratIdx === idx
                      ? 'border-[#C88E91] bg-[#F4E8C1]/30 ring-2 ring-[#C88E91]/50'
                      : 'border-[#E8E5DF] hover:border-gray-300 bg-[#FFF0F5]'
                  }`}
                >
                  <span className="block font-serif text-lg font-bold text-[#18181B]">
                    {item.carat}
                  </span>
                  <span className="block font-sans text-xs text-gray-500 mt-1">
                    {item.mm}
                  </span>
                </button>
              ))}
            </div>

            {/* Visualizer Hand Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#F7F5F0] rounded-xl p-8 border border-[#E8E5DF]">
              {/* Left: Graphic representation */}
              <div className="relative aspect-square max-w-[320px] mx-auto w-full flex items-center justify-center bg-radial from-amber-50 to-transparent rounded-full border border-dashed border-[#D39EAA]/40">
                {/* Finger silhouette outline */}
                <div className="w-28 h-64 bg-amber-100/60 rounded-t-full border border-amber-200 shadow-inner flex items-center justify-center relative">
                  {/* Ring Band */}
                  <div className="w-32 h-3 bg-gradient-to-r from-gray-300 via-amber-200 to-gray-400 rounded-full shadow-md z-10" />

                  {/* Solitaire Stone */}
                  <div
                    className="absolute -top-3 z-20 transition-all duration-500 flex items-center justify-center"
                    style={{
                      transform: `scale(${currentCarat.diameterScale})`,
                    }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-white via-amber-50 to-emerald-50 rounded-full shadow-2xl border-2 border-white flex items-center justify-center ring-2 ring-[#D39EAA] relative overflow-hidden">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B76E79" strokeWidth="1.2">
                        <polygon points="6,3 18,3 22,9 12,21 2,9" fill="rgba(212, 175, 55, 0.15)" stroke="#B76E79" />
                        <line x1="2" y1="9" x2="22" y2="9" stroke="#B76E79" strokeWidth="1" />
                        <line x1="12" y1="21" x2="6" y2="9" stroke="#B76E79" strokeWidth="0.8" />
                        <line x1="12" y1="21" x2="18" y2="9" stroke="#B76E79" strokeWidth="0.8" />
                        <line x1="6" y1="3" x2="12" y2="9" stroke="#B76E79" strokeWidth="0.8" />
                        <line x1="18" y1="3" x2="12" y2="9" stroke="#B76E79" strokeWidth="0.8" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Info */}
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#B76E79] text-[#D39EAA] font-sans text-xs font-bold rounded-md uppercase tracking-wider mb-2">
                    {currentCarat.look}
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-[#18181B]">
                    {currentCarat.carat} Solitaire ({currentCarat.mm})
                  </h3>
                </div>
                <p className="font-sans text-sm text-gray-600 leading-relaxed">
                  {currentCarat.description}
                </p>
                <div className="space-y-2 pt-4 border-t border-gray-200 text-xs font-sans text-gray-700">
                  <p className="flex justify-between">
                    <span>Stone Cut:</span>
                    <strong className="text-black">Ideal Hearts & Arrows</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Finger Coverage:</span>
                    <strong className="text-black">~{(currentCarat.diameterScale * 40).toFixed(0)}% width</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Passes Diamond Tester:</span>
                    <strong className="text-[#059669]">100% Positive</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Sizing Guide Table */
          <div className="bg-white rounded-2xl border border-[#E8E5DF] shadow-luxury p-6 sm:p-10 max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl font-bold text-[#18181B] mb-2 text-center">
              Indian & US Ring Size Chart
            </h3>
            <p className="font-sans text-xs text-gray-500 text-center mb-8">
              Measure the inside diameter of an existing comfortable ring or use a string around your knuckle.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#F7F5F0] border-b border-[#E8E5DF]">
                    <th className="p-3 font-bold text-[#18181B]">US Size</th>
                    <th className="p-3 font-bold text-[#B76E79] bg-[#F4E8C1]/30">Indian Size (Standard)</th>
                    <th className="p-3 text-gray-600">Inside Diameter (mm)</th>
                    <th className="p-3 text-gray-600">Circumference (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {sizeChart.map((row) => (
                    <tr key={row.us} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#18181B]">Size {row.us}</td>
                      <td className="p-3 font-bold text-[#B76E79] bg-[#F4E8C1]/10">{row.india}</td>
                      <td className="p-3 text-gray-600">{row.insideMm}</td>
                      <td className="p-3 text-gray-600">{row.circumMm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-[#FFF0F5] rounded-xl border border-[#E8E5DF] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-[#8C6A1F] flex-shrink-0" />
                <p className="font-sans text-xs text-gray-600">
                  Unsure of your exact size? Order your estimated size with peace of mind — we provide <strong>1 Free Doorstep Resizing</strong> on all orders!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
