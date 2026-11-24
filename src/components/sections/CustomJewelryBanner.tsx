'use client';

import React from 'react';
import { Sparkles, MessageCircle, Send, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CustomJewelryBanner() {
  return (
    <section className="py-16 bg-[#18181B] text-[#FFF0F5] relative overflow-hidden">
      {/* Subtle gold background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D39EAA]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-[#27272A] to-[#18181B] rounded-3xl border border-[#D39EAA]/30 p-8 sm:p-14 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#D39EAA]/20 border border-[#D39EAA]/40 text-[#D39EAA] rounded-full text-xs font-sans font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Custom Jewelry Studio
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
              Have a Dream Design in Mind? <br />
              <span className="text-[#D39EAA] italic font-light">
                Let Our Master Jewelers Craft It.
              </span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
              Send us any photo, Pinterest moodboard, or CAD sketch. We will render a photorealistic 3D CAD model and handcraft your ring in solid 925 Silver, 14K, or 18K Hallmarked Gold within 7 business days.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-sans text-gray-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D39EAA]" /> Free 3D CAD Preview
              </span>
              <span>•</span>
              <span>Laser-Engraved Personalization</span>
              <span>•</span>
              <span>Direct Master Jeweler Access</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <a
              href="https://wa.me/919828930454?text=Hello%20ForeverJewells%20Team!%20I%20have%20an%20inquiry%20regarding%20a%20product."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#B76E79] hover:bg-[#059669] text-[#D39EAA] hover:text-white font-sans text-xs font-bold tracking-widest uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp Now
            </a>

            <a
              href="mailto:Foreverjewels98@gmail.com"
              className="px-8 py-4 bg-transparent border border-[#D39EAA]/50 hover:bg-[#D39EAA]/10 text-[#D39EAA] font-sans text-xs font-bold tracking-widest uppercase rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Email Us CAD Files <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
