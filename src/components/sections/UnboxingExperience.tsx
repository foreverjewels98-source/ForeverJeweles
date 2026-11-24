'use client';

import React from 'react';
import Image from 'next/image';
import { Package, Award, Sparkles, Shield, Gift, EyeOff, CheckCircle2 } from 'lucide-react';
import { getCdnImageUrl } from '@/lib/imageCdn';

const UNBOXING_ITEMS = [
  {
    step: '01',
    title: 'Illuminated Royal Velvet Box',
    desc: 'Crafted in matte royal emerald with satin interior and integrated micro-LED lighting that illuminates the gemstone the second the box is opened.',
    icon: Gift,
    highlight: 'Proposal Ready',
    image: '/uploads/etsy_4523361246_img1.jpg',
  },
  {
    step: '02',
    title: 'Physical GRA Gemstone Report Card',
    desc: 'Individual embossed laboratory report verifying VVS1 clarity, Colorless D grade, cut symmetry, and corresponding laser girdle serial number.',
    icon: Award,
    highlight: 'Serial Inscribed',
    image: '/uploads/etsy_4514456821_img1.jpg',
  },
  {
    step: '03',
    title: 'Artisan Care Kit & Multisizer',
    desc: 'Includes an ultra-fine microfibre jewelry polishing cloth and a complimentary ring sizing multisizer tool for future heirloom stacking.',
    icon: Sparkles,
    highlight: 'Complimentary',
    image: '/uploads/etsy_4580287314_img1.jpg',
  },
  {
    step: '04',
    title: 'Discreet & 100% Insured Delivery',
    desc: 'Shipped in plain, tamper-evident unbranded outer packaging to keep your surprise proposal completely secret, fully insured door-to-door.',
    icon: EyeOff,
    highlight: 'Zero Risk',
    image: '/uploads/etsy_4514460848_img1.jpg',
  },
];

export default function UnboxingExperience() {
  return (
    <section className="py-12 sm:py-24 bg-[#F7F5F0] border-t border-[#E8E5DF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4E8C1] text-[#8C6A1F] rounded-full text-[11px] sm:text-xs font-sans font-bold tracking-widest uppercase mb-3 shadow-xs">
            <Package className="w-3.5 h-3.5" />
            The Unboxing Standard
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#18181B] mb-4">
            An Unforgettable Heirloom Experience
          </h2>
          <div className="w-16 h-[1.5px] bg-[#D39EAA] mx-auto mb-4" />
          <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
            While generic marketplace sellers ship jewelry in plain plastic envelopes, every ForeverJewells creation arrives in our signature museum-grade presentation suite.
          </p>
        </div>

        {/* 4 Unboxing Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {UNBOXING_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E8E5DF] p-5 sm:p-6 shadow-luxury flex flex-col justify-between hover:border-[#D39EAA] hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#F7F5F0] mb-5 border border-[#E8E5DF]">
                    <Image
                      src={getCdnImageUrl(item.image, { width: 640, quality: 85 })}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                      quality={85}
                      className="object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-[#592D37] text-[#D39EAA] font-sans text-[9px] font-bold tracking-wider px-2 py-0.5 rounded shadow-xs uppercase z-10">
                      {item.highlight}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 font-serif text-lg font-bold text-white/90 drop-shadow-md">
                      {item.step}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F4E8C1]/40 border border-[#D39EAA]/30 flex items-center justify-center text-[#8C6A1F] flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#18181B] leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="font-sans text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Footer Checkmark */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-sans font-semibold text-[#B76E79]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Complimentary with Every Order</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
