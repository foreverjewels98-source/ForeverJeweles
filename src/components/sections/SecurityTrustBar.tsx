'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Award, Truck, CheckCircle2, X, ExternalLink } from 'lucide-react';

export default function SecurityTrustBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="bg-[#011C15] text-[#FFF0F5] py-6 sm:py-8 border-t border-b border-[#D39EAA]/30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {/* 1. SSL Encryption */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#B76E79] border border-[#D39EAA]/40 flex items-center justify-center text-[#D39EAA] mb-2 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <span className="font-serif text-xs sm:text-sm font-bold text-white block">
                256-Bit Bank Encryption
              </span>
              <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                End-to-End SSL Protection
              </span>
            </div>

            {/* 2. PCI-DSS Payments */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#B76E79] border border-[#D39EAA]/40 flex items-center justify-center text-[#D39EAA] mb-2 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-serif text-xs sm:text-sm font-bold text-white block">
                PCI-DSS Level 1 Safe
              </span>
              <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                Zero Card Storage Policy
              </span>
            </div>

            {/* 3. Insured Transit */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#B76E79] border border-[#D39EAA]/40 flex items-center justify-center text-[#D39EAA] mb-2 shadow-xs">
                <Truck className="w-4 h-4 text-[#D39EAA]" />
              </div>
              <span className="font-serif text-xs sm:text-sm font-bold text-white block">
                100% Insured Delivery
              </span>
              <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                Tamper-Evident GPS Box
              </span>
            </div>

            {/* 4. GRA Verification */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#B76E79] border border-[#D39EAA]/40 flex items-center justify-center text-[#D39EAA] mb-2 shadow-xs">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-serif text-xs sm:text-sm font-bold text-white block">
                GRA Lab Report Verified
              </span>
              <span className="font-sans text-[10px] text-gray-400 mt-0.5">
                Laser Inscribed Girdle
              </span>
            </div>
          </div>

          {/* Trigger to Open Security Protocol Modal */}
          <div className="text-center mt-5 pt-4 border-t border-white/10">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-sans text-xs text-[#D39EAA] hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Read Our 5-Point Bank-Grade Buyer Security & Privacy Protocol →</span>
            </button>
          </div>
        </div>
      </section>

      {/* Security Protocol Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 relative border border-[#E8E5DF] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#065F46]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#18181B]">
                    ForeverJewells Buyer Security & Privacy Protocol
                  </h3>
                  <span className="font-sans text-[11px] text-gray-500 uppercase tracking-wider block">
                    Enterprise SSL & Certified Protection
                  </span>
                </div>
              </div>

              <p className="font-sans text-xs text-gray-600 mb-6 leading-relaxed">
                When you invest in fine jewelry at ForeverJewells, your financial credentials, personal address, and gemstone authenticity are safeguarded by military-grade security infrastructure.
              </p>

              <div className="space-y-4 font-sans text-xs">
                {/* Protocol 1 */}
                <div className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E5DF]">
                  <div className="flex items-center gap-2 font-bold text-[#18181B] mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>256-Bit SHA-2 RSA SSL Encryption</span>
                  </div>
                  <p className="text-gray-600 leading-normal pl-6">
                    Every byte of data transmitted between your browser and our store is fully encrypted. No third-party or intermediary can intercept your session.
                  </p>
                </div>

                {/* Protocol 2 */}
                <div className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E5DF]">
                  <div className="flex items-center gap-2 font-bold text-[#18181B] mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Strict Zero-Data-Selling Privacy Shield</span>
                  </div>
                  <p className="text-gray-600 leading-normal pl-6">
                    We never sell, rent, or share your phone number, email, or order history with marketing agencies. All communications are confidential and strictly for order fulfillment.
                  </p>
                </div>

                {/* Protocol 3 */}
                <div className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E5DF]">
                  <div className="flex items-center gap-2 font-bold text-[#18181B] mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>100% Fully-Insured Door-to-Door Courier</span>
                  </div>
                  <p className="text-gray-600 leading-normal pl-6">
                    Your jewelry is fully insured against theft, loss, or transit damage until signed for at your doorstep. Every box is sealed with tamper-evident holographic security tape.
                  </p>
                </div>

                {/* Protocol 4 */}
                <div className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E5DF]">
                  <div className="flex items-center gap-2 font-bold text-[#18181B] mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Individual Gemstone Laser Girdle Verification</span>
                  </div>
                  <p className="text-gray-600 leading-normal pl-6">
                    Each Moissanite center stone features a microscopic serial number laser-inscribed directly on the stone girdle, matching its physical GRA laboratory report.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-[#592D37] text-[#D39EAA] font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-colors"
                >
                  I Understand & Feel Confident
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
