'use client';

import React from 'react';
import { Video, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';

interface LiveDiamondTestBannerProps {
  productName: string;
}

export default function LiveDiamondTestBanner({ productName }: LiveDiamondTestBannerProps) {
  const handleScheduleCall = () => {
    const message = encodeURIComponent(
      `Hi ForeverJewells Atelier, I would like to schedule a Live Video Call to preview the "${productName}" and see the Moissanite Diamond Thermal Tester verification!`
    );
    window.open(`https://wa.me/919828930454?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="my-8 max-w-5xl mx-auto px-4 font-sans">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#2A2338] via-[#3B2D4C] to-[#251D30] text-white p-6 sm:p-10 border border-purple-900/30 shadow-md">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl text-center sm:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#D39EAA]">
            <Sparkles className="w-3.5 h-3.5 text-[#D39EAA]" />
            <span>Virtual VIP Atelier Experience</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight text-[#FAF8F5]">
            Want To See A Live Diamond Test Before You Buy?
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
            Schedule a 1-on-1 private WhatsApp video preview with our senior gemologist. Watch the live thermal tester beep, inspect fire dispersion under 4K magnification, and see the exact finger fit.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleScheduleCall}
              className="w-full sm:w-auto px-6 py-3 bg-[#E9D5A1] hover:bg-white text-[#18181B] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#8C6A1F]" />
              <span>Schedule A Video Call Now</span>
            </button>
            <span className="text-[11px] text-gray-400">
              Free • Zero obligation • 10:00 AM – 9:00 PM IST
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
