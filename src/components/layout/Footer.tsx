'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#18181B] text-[#FFF0F5] pt-16 pb-12 border-t border-[#D39EAA]/20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter & Brand Spotlight */}
        <div className="pb-12 border-b border-[#27272A] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex flex-col items-start leading-[0.9] mb-4">
              <span className="font-serif italic text-[36px] sm:text-[44px] tracking-wide font-bold text-[#D39EAA]">
                ForeverJewells
              </span>
            </div>
            <p className="font-sans text-xs tracking-[0.25em] text-gray-400 uppercase mt-1 mb-4 font-semibold">
              Jaipur Moissanite & Fine Jewelry
            </p>
            <p className="font-sans text-sm text-gray-400 max-w-md leading-relaxed">
              Crafting ethical, lab-grown high jewelry with certified VVS1 D-Color Moissanite that rivals mined diamonds in fire, brilliance, and lifetime durability.
            </p>
          </div>

          <div className="bg-[#27272A]/60 p-6 rounded-2xl border border-[#D39EAA]/20">
            <h4 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D39EAA]" />
              Join the ForeverJewells Circle & Get 10% Off
            </h4>
            <p className="font-sans text-xs text-gray-400 mb-4">
              Receive secret drop access, bespoke ring customization discounts, and care guides.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#B76E79] text-[#D39EAA] text-xs font-sans rounded-xl font-bold">
                Welcome to the ForeverJewells Circle. Use code <strong>FOREVER10</strong> at checkout for 10% off.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#18181B] border border-[#3F3F46] rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none focus:border-[#D39EAA]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D39EAA] hover:bg-[#C88E91] text-[#18181B] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Multi-Column Links */}
        <div className="py-12 border-b border-[#27272A] grid grid-cols-2 md:grid-cols-4 gap-8 font-sans text-xs">
          {/* Col 1: Shop Collections */}
          <div>
            <h5 className="font-serif text-base font-bold text-[#D39EAA] uppercase tracking-wider mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link href="/category/rings" className="hover:text-white transition-colors">
                  Moissanite Solitaire Rings
                </Link>
              </li>
              <li>
                <Link href="/category/band" className="hover:text-white transition-colors">
                  Eternity Bands & Wedding Bands
                </Link>
              </li>
              <li>
                <Link href="/category/ring-set" className="hover:text-white transition-colors">
                  Bridal Stacks & Tiara Rings
                </Link>
              </li>
              <li>
                <Link href="/category/pendant" className="hover:text-white transition-colors">
                  Moissanite Pendants
                </Link>
              </li>
              <li>
                <Link href="/category/earrings" className="hover:text-white transition-colors">
                  Moissanite Stud Earrings
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Educational & Guides */}
          <div>
            <h5 className="font-serif text-base font-bold text-[#D39EAA] uppercase tracking-wider mb-4">
              Knowledge & Care
            </h5>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link href="/#comparison" className="hover:text-white transition-colors">
                  Moissanite vs Diamond Guide
                </Link>
              </li>
              <li>
                <Link href="/#size-guide" className="hover:text-white transition-colors">
                  Interactive Ring Sizing Chart
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors">
                  GRA Certificate Verification
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors">
                  Jewelry Care & Cleaning Tips
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors">
                  100% Lifetime Buyback Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h5 className="font-serif text-base font-bold text-[#D39EAA] uppercase tracking-wider mb-4">
              Client Support
            </h5>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors">
                  Free Insured Express Shipping
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors">
                  15-Day Free Exchange & Pickup
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#D39EAA] font-semibold text-white transition-colors">
                  Track Your Jewelry Order
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors">
                  Lifetime Polish & Repair Service
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors">
                  Terms of Service & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Store & Contact */}
          <div>
            <h5 className="font-serif text-base font-bold text-[#D39EAA] uppercase tracking-wider mb-4">
              Contact & Store
            </h5>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D39EAA] flex-shrink-0 mt-0.5" />
                <span>143 Railway Office Colony, Kanakpura Station Road, Near Elwood International School, Jaipur, Rajasthan 302012</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D39EAA] flex-shrink-0" />
                <a href="tel:+919828930454" className="hover:text-white transition-colors">
                  +91 98289 30454 (Call & WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D39EAA] flex-shrink-0" />
                <a href="mailto:Foreverjewels98@gmail.com" className="hover:text-white transition-colors">
                  Foreverjewels98@gmail.com
                </a>
              </li>
              <li className="pt-1">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D39EAA] hover:text-[#FADBD8] transition-colors uppercase tracking-wider"
                >
                  Get In Touch & Visit Store →
                </Link>
              </li>
              <li className="pt-2 flex gap-4 text-gray-400 text-xs">
                <a href="https://www.instagram.com/foreverjewellstudio/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D39EAA] flex items-center gap-1 transition-colors group" title="Visit our Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <span>•</span>
                <a href="https://www.etsy.com/shop/foreverjewellstudio?section_id=59060242" target="_blank" rel="noopener noreferrer" className="hover:text-[#F1641E] flex items-center gap-1 font-serif font-bold tracking-tight">
                  <span>Etsy</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Developer Credits & Payment Gateways */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-sans text-gray-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <p className="text-gray-500">
              © 2026 ForeverJewells Royal Moissanite Jewelry. All Rights Reserved.
            </p>
            <span className="hidden sm:inline text-gray-600">•</span>
            <p className="text-gray-400 flex items-center gap-1.5 flex-wrap justify-center">
              <span>Designed & Developed by</span>
              <span className="text-[#D39EAA] font-semibold tracking-wide">Aman Singh</span>
              <span className="text-gray-500">&</span>
              <span className="text-[#D39EAA] font-semibold tracking-wide">Ayush Choudhary</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Accepted Payments:
            </span>
            <div className="flex gap-2 flex-wrap justify-center">
              {['UPI / GPay', 'Visa', 'Mastercard', 'RuPay', 'NetBanking', 'PayPal'].map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 bg-[#27272A] text-[10px] text-gray-300 rounded font-medium border border-[#3F3F46]"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
