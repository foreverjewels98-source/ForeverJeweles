'use client';

import React from 'react';
import { Award, ShieldCheck, RefreshCcw, Truck, Sparkles } from 'lucide-react';

const pillars = [
  {
    icon: Award,
    title: 'Individual GRA Certification',
    description: 'Every single Moissanite stone over 0.5CT comes with an official GRA lab certificate and a laser-inscribed unique serial number.',
  },
  {
    icon: ShieldCheck,
    title: '100% Lifetime Buyback & Upgrade',
    description: 'Enjoy guaranteed lifetime buyback and 100% exchange credit towards upgrading to larger carats or solid 18K Gold whenever you desire.',
  },
  {
    icon: Sparkles,
    title: 'Pure 925 Silver & BIS Hallmarked Gold',
    description: 'Forged exclusively in hypoallergenic 925 Sterling Silver with 3-micron thick gold dipping, or BIS Hallmarked 14K/18K Solid Gold.',
  },
  {
    icon: Truck,
    title: 'Free Express Insured Delivery',
    description: 'Delivered securely in tamper-proof armored packaging with doorstep insurance coverage across all pincodes in India.',
  },
  {
    icon: RefreshCcw,
    title: '15-Day Hassle-Free Exchange',
    description: 'Not the right ring size or preferred design? Enjoy our effortless doorstep pickup and complimentary ring resizing service.',
  },
  {
    icon: Sparkles,
    title: 'Free Lifetime Polishing & Care',
    description: 'Send your jewelry back anytime for complimentary ultrasonic cleaning, prong tightening, and rhodium re-polishing for life.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-[#F7F5F0] border-t border-[#E8E5DF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-sans text-xs font-bold tracking-[0.25em] text-[#8C6A1F] uppercase mb-2">
            The ForeverJewells Promise
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#18181B] mb-4">
            Why Discerning Clients Choose Us
          </h2>
          <div className="w-20 h-[1.5px] bg-[#C88E91] mx-auto mb-6" />
          <p className="font-sans text-sm sm:text-base text-gray-600">
            We bridge the gap between unattainable mined diamond prices and disposable fast-fashion jewelry by crafting heirloom-grade Moissanite masterworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-[#E8E5DF] shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFF0F5] border border-[#E8E5DF] flex items-center justify-center mb-6 group-hover:bg-[#18181B] transition-colors">
                  <Icon className="w-7 h-7 text-[#C88E91] group-hover:text-[#D39EAA] transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#18181B] mb-3 group-hover:text-[#8C6A1F] transition-colors">
                  {item.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
