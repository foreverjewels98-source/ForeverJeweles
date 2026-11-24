'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface FindYourSizeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export const INDIAN_SIZE_CHART = [
  { indian: '1', us: '1', diameterMm: 13.0, circumMm: 41 },
  { indian: '2', us: '2', diameterMm: 13.4, circumMm: 42 },
  { indian: '3', us: '2.5', diameterMm: 13.7, circumMm: 43 },
  { indian: '4', us: '3', diameterMm: 14.0, circumMm: 44 },
  { indian: '5', us: '3.5', diameterMm: 14.3, circumMm: 45 },
  { indian: '6', us: '4', diameterMm: 14.6, circumMm: 46 },
  { indian: '7', us: '4.5', diameterMm: 15.0, circumMm: 47 },
  { indian: '8', us: '5', diameterMm: 15.3, circumMm: 48 },
  { indian: '9', us: '5.5', diameterMm: 15.7, circumMm: 49 },
  { indian: '10', us: '6', diameterMm: 16.1, circumMm: 51 },
  { indian: '11', us: '6.5', diameterMm: 16.5, circumMm: 52 },
  { indian: '12', us: '7', diameterMm: 16.9, circumMm: 53 },
  { indian: '13', us: '7.5', diameterMm: 17.3, circumMm: 54 },
  { indian: '14', us: '8', diameterMm: 17.7, circumMm: 56 },
  { indian: '15', us: '8.5', diameterMm: 18.1, circumMm: 57 },
  { indian: '16', us: '9', diameterMm: 18.5, circumMm: 58 },
  { indian: '17', us: '9.5', diameterMm: 19.0, circumMm: 60 },
  { indian: '18', us: '10', diameterMm: 19.4, circumMm: 61 },
  { indian: '19', us: '10.5', diameterMm: 19.8, circumMm: 62 },
  { indian: '20', us: '11', diameterMm: 20.2, circumMm: 63 },
  { indian: '21', us: '11.5', diameterMm: 20.6, circumMm: 65 },
  { indian: '22', us: '12', diameterMm: 21.0, circumMm: 66 },
  { indian: '23', us: '12.5', diameterMm: 21.4, circumMm: 67 },
  { indian: '24', us: '13', diameterMm: 21.8, circumMm: 69 },
  { indian: '25', us: '13.5', diameterMm: 22.2, circumMm: 70 },
  { indian: '26', us: '14', diameterMm: 22.6, circumMm: 71 },
];

export const US_RING_SIZES = [
  { us: '3', label: 'US 3 (14.0 mm)', diameterMm: 14.0, circumMm: 44 },
  { us: '3.5', label: 'US 3.5 (14.3 mm)', diameterMm: 14.3, circumMm: 45 },
  { us: '4', label: 'US 4 (14.6 mm)', diameterMm: 14.6, circumMm: 46 },
  { us: '4.5', label: 'US 4.5 (15.0 mm)', diameterMm: 15.0, circumMm: 47 },
  { us: '5', label: 'US 5 (15.3 mm)', diameterMm: 15.3, circumMm: 48 },
  { us: '5.5', label: 'US 5.5 (15.7 mm)', diameterMm: 15.7, circumMm: 49 },
  { us: '6', label: 'US 6 (16.1 mm)', diameterMm: 16.1, circumMm: 51 },
  { us: '6.5', label: 'US 6.5 (16.5 mm)', diameterMm: 16.5, circumMm: 52 },
  { us: '7', label: 'US 7 (16.9 mm)', diameterMm: 16.9, circumMm: 53 },
  { us: '7.5', label: 'US 7.5 (17.3 mm)', diameterMm: 17.3, circumMm: 54 },
  { us: '8', label: 'US 8 (17.7 mm)', diameterMm: 17.7, circumMm: 56 },
  { us: '8.5', label: 'US 8.5 (18.1 mm)', diameterMm: 18.1, circumMm: 57 },
  { us: '9', label: 'US 9 (18.5 mm)', diameterMm: 18.5, circumMm: 58 },
  { us: '9.5', label: 'US 9.5 (19.0 mm)', diameterMm: 19.0, circumMm: 60 },
  { us: '10', label: 'US 10 (19.4 mm)', diameterMm: 19.4, circumMm: 61 },
  { us: '10.5', label: 'US 10.5 (19.8 mm)', diameterMm: 19.8, circumMm: 62 },
  { us: '11', label: 'US 11 (20.2 mm)', diameterMm: 20.2, circumMm: 63 },
  { us: '11.5', label: 'US 11.5 (20.6 mm)', diameterMm: 20.6, circumMm: 65 },
  { us: '12', label: 'US 12 (21.0 mm)', diameterMm: 21.0, circumMm: 66 },
  { us: '12.5', label: 'US 12.5 (21.4 mm)', diameterMm: 21.4, circumMm: 67 },
  { us: '13', label: 'US 13 (21.8 mm)', diameterMm: 21.8, circumMm: 69 },
  { us: '13.5', label: 'US 13.5 (22.2 mm)', diameterMm: 22.2, circumMm: 70 },
  { us: '14', label: 'US 14 (22.6 mm)', diameterMm: 22.6, circumMm: 71 },
];

export default function FindYourSizeDrawer({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize,
}: FindYourSizeDrawerProps) {
  const initialIndex = Math.max(
    0,
    INDIAN_SIZE_CHART.findIndex((s) => s.indian === selectedSize || s.us === selectedSize)
  );
  const [sliderIndex, setSliderIndex] = useState<number>(initialIndex >= 0 ? initialIndex : 9);

  const currentItem = INDIAN_SIZE_CHART[sliderIndex] || INDIAN_SIZE_CHART[9];

  // Scale ring circle visual (between 60px to 140px)
  const ringScale = 60 + (sliderIndex / (INDIAN_SIZE_CHART.length - 1)) * 75;

  const handlePickSize = (sizeStr: string) => {
    onSelectSize(sizeStr);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-[#E8E5DF] flex items-center justify-between bg-[#FBF9F5]">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#8C6A1F]" />
                  <span className="font-serif text-sm font-bold text-[#18181B] tracking-wide">
                    Find Your Size
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-gray-200/70 text-gray-500 hover:text-black transition-colors cursor-pointer"
                  aria-label="Close Size Guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-[#18181B] text-center mb-1">
                    Ring Size Calculator
                  </h3>
                  <p className="text-xs text-gray-500 text-center">
                    Drag the slider to visually preview your diameter & Indian ring size.
                  </p>
                </div>

                {/* Interactive Ring Blueprint Visual Box */}
                <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-[#F9F7F2] border border-[#E8E2D7] rounded-2xl flex items-center justify-center p-4 overflow-hidden shadow-inner">
                  {/* Grid background effect */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(#8C6A1F 1px, transparent 1px), linear-gradient(90deg, #8C6A1F 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Ring Circle representation */}
                  <div
                    style={{ width: `${ringScale}px`, height: `${ringScale}px` }}
                    className="relative rounded-full border-4 border-[#D39EAA] bg-white/80 shadow-md flex items-center justify-center transition-all duration-150"
                  >
                    {/* Gemstone crown marker */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#8C6A1F] rotate-45 rounded-xs shadow-xs" />

                    <div className="text-center">
                      <span className="text-[11px] font-bold text-[#18181B] block">
                        Size: {currentItem.indian}
                      </span>
                      <span className="text-[9px] font-mono text-[#8C6A1F]">
                        {currentItem.diameterMm} mm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                    <span>Smaller (Size 1 / US 1)</span>
                    <span className="text-[#8C6A1F] font-bold">
                      US {currentItem.us} • Indian {currentItem.indian}
                    </span>
                    <span>Larger (US 14 / Indian 26)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={INDIAN_SIZE_CHART.length - 1}
                    value={sliderIndex}
                    onChange={(e) => setSliderIndex(Number(e.target.value))}
                    className="w-full accent-[#8C6A1F] cursor-pointer"
                  />
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => handlePickSize(`US ${currentItem.us}`)}
                      className="px-5 py-2 bg-[#18181B] hover:bg-[#8C6A1F] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Select US Size {currentItem.us}
                    </button>
                  </div>
                </div>

                {/* Conversion Table */}
                <div className="pt-4 border-t border-[#E8E5DF]">
                  <h4 className="font-serif text-sm font-bold text-[#18181B] mb-2 flex items-center justify-between">
                    <span>Indian Ring Size Conversion Chart</span>
                    <span className="text-[10px] text-gray-400 font-sans font-normal">
                      Click row to select
                    </span>
                  </h4>

                  <div className="border border-[#E8E5DF] rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F6F3EB] text-[#18181B] font-bold border-b border-[#E8E5DF]">
                          <th className="py-2.5 px-3">Ring Size (Indian)</th>
                          <th className="py-2.5 px-3">Diameter (mm)</th>
                          <th className="py-2.5 px-3">Circumference (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E5DF]">
                        {INDIAN_SIZE_CHART.map((row, idx) => {
                          const isCurrent =
                            selectedSize === row.indian ||
                            selectedSize === row.us ||
                            sliderIndex === idx;

                          return (
                            <tr
                              key={row.indian}
                              onClick={() => {
                                setSliderIndex(idx);
                                handlePickSize(`US ${row.us}`);
                              }}
                              className={`cursor-pointer transition-colors ${
                                isCurrent
                                  ? 'bg-[#8C6A1F]/15 font-bold text-[#18181B]'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <td className="py-2 px-3 flex items-center gap-1.5">
                                {isCurrent && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6A1F]" />
                                )}
                                <span>Size {row.indian} (US {row.us})</span>
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px]">
                                {row.diameterMm}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px]">
                                {row.circumMm}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sizing Assistance Banner */}
                <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E8E2D7] text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#18181B]">
                    <Sparkles className="w-4 h-4 text-[#8C6A1F]" />
                    <span>Free Lifetime Resizing & Support</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Not sure of your exact size? Order your best estimate! ForeverJewells provides 100% complimentary ring resizing support within 30 days of receiving your jewelry.
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#E8E5DF] bg-[#FBF9F5] text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close Size Guide
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
