'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Send,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiryType: 'Custom Ring Design',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    // Send formatted WhatsApp message or show confirmation
    const waText = `*NEW CONTACT INQUIRY - FOREVERJEWELLSTUDIO*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Email:* ${formData.email || 'N/A'}%0A*Type:* ${formData.inquiryType}%0A*Message:* ${formData.message || 'I would like to speak with a jewelry consultant.'}`;
    window.open(`https://wa.me/919828930454?text=${waText}`, '_blank');
    setIsSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FFF0F5]">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs font-sans text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#18181B] font-medium">Contact Us</span>
      </div>

      {/* Hero Header */}
      <section className="bg-[#592D37] text-[#FFF0F5] py-14 sm:py-20 border-b border-[#D39EAA]/30 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#D39EAA]/20 border border-[#D39EAA]/40 text-[#D39EAA] rounded-full text-xs font-sans font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Customer Support & Store Location
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">
            We Are Here to Assist You
          </h1>
          <div className="w-16 h-[1.5px] bg-[#D39EAA] mx-auto mb-5" />
          <p className="font-sans text-sm sm:text-base text-[#FFF0F5]/85 max-w-xl mx-auto leading-relaxed">
            Have questions about diamond testing, ring sizing, or custom engagement rings?
            Speak directly with our fine jewelry specialists.
          </p>
        </div>
      </section>

      {/* Contact Grid Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* 4 Direct Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {/* Card 1: WhatsApp */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-xs flex flex-col justify-between hover:border-[#B76E79] transition-all">
            <div>
              <div className="w-12 h-12 bg-[#ECFDF5] text-[#B76E79] rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#059669]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18181B] mb-1">
                WhatsApp Chat
              </h3>
              <p className="font-sans text-xs text-gray-500 mb-4">
                Fastest support. Instant answers on ring sizes, photos, and live video previews.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-sans font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
                Replies in ~15 mins
              </div>
            </div>
            <a
              href="https://wa.me/919828930454?text=Hello%20ForeverJewells%20Team!%20I%20have%20an%20inquiry%20regarding%20a%20product."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#B76E79] hover:bg-[#043327] text-[#D39EAA] font-sans text-xs font-bold uppercase tracking-wider rounded-xl text-center transition-colors block"
            >
              Start Chat
            </a>
          </div>

          {/* Card 2: Phone Call */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-xs flex flex-col justify-between hover:border-[#D39EAA] transition-all">
            <div>
              <div className="w-12 h-12 bg-[#F4E8C1]/50 text-[#8C6A1F] rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#8C6A1F]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18181B] mb-1">
                Phone Support
              </h3>
              <p className="font-sans text-xs text-gray-500 mb-2">
                Speak directly with an experienced gemologist or bridal consultant.
              </p>
              <p className="font-sans text-xs font-bold text-[#18181B] mb-4">
                +91 98289 30454
              </p>
            </div>
            <a
              href="tel:+919828930454"
              className="w-full py-2.5 bg-[#18181B] hover:bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl text-center transition-colors block"
            >
              Call Us
            </a>
          </div>

          {/* Card 3: Email */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-xs flex flex-col justify-between hover:border-[#D39EAA] transition-all">
            <div>
              <div className="w-12 h-12 bg-[#F5F2EC] text-gray-700 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#18181B]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18181B] mb-1">
                Email Inquiry
              </h3>
              <p className="font-sans text-xs text-gray-500 mb-2">
                Send custom CAD design drawings, moodboards, or corporate order requests.
              </p>
              <p className="font-sans text-xs font-bold text-[#18181B] mb-4 truncate">
                Foreverjewels98@gmail.com
              </p>
            </div>
            <a
              href="mailto:Foreverjewels98@gmail.com"
              className="w-full py-2.5 bg-[#F5F2EC] hover:bg-[#E8E5DF] text-[#18181B] font-sans text-xs font-bold uppercase tracking-wider rounded-xl text-center transition-colors block border border-[#E8E5DF]"
            >
              Send Email
            </a>
          </div>

          {/* Card 4: Store Location */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-xs flex flex-col justify-between hover:border-[#B76E79] transition-all">
            <div>
              <div className="w-12 h-12 bg-[#ECFDF5] text-[#B76E79] rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#B76E79]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#18181B] mb-1">
                Flagship Studio & Store
              </h3>
              <p className="font-sans text-xs text-gray-500 mb-2">
                143 Railway Office Colony, Kanakpura Station Road, Near Elwood International School, Jaipur, Rajasthan 302012
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4 font-sans">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Mon - Sat: 10 AM - 8 PM</span>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Kanakpura+Station+Road+Jaipur"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#F7F5F0] hover:bg-[#E8E5DF] text-[#B76E79] font-sans text-xs font-bold uppercase tracking-wider rounded-xl text-center transition-colors block border border-[#E8E5DF]"
            >
              Get Directions
            </a>
          </div>
        </div>

        {/* Contact Form & Studio Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E5DF] shadow-md">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B] mb-2">
              Send an Online Inquiry
            </h2>
            <p className="font-sans text-xs sm:text-sm text-gray-500 mb-8">
              Fill out your details below and a personal jewelry consultant will connect with you via WhatsApp or phone.
            </p>

            {isSubmitted ? (
              <div className="p-8 bg-[#ECFDF5] border border-[#059669]/30 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-[#B76E79] mb-2">
                  Thank You for Reaching Out!
                </h3>
                <p className="font-sans text-xs text-gray-600 mb-4 max-w-md mx-auto">
                  Your inquiry has been received. Our team will review your message and reply promptly.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', inquiryType: 'Custom Ring Design', message: '' });
                  }}
                  className="px-6 py-2.5 bg-[#B76E79] text-[#D39EAA] font-sans text-xs font-bold uppercase tracking-wider rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FFF0F5] border border-[#E8E5DF] rounded-xl px-4 py-3 text-xs text-[#18181B] focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FFF0F5] border border-[#E8E5DF] rounded-xl px-4 py-3 text-xs text-[#18181B] focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FFF0F5] border border-[#E8E5DF] rounded-xl px-4 py-3 text-xs text-[#18181B] focus:outline-none focus:border-[#D39EAA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-[#FFF0F5] border border-[#E8E5DF] rounded-xl px-4 py-3 text-xs text-[#18181B] focus:outline-none focus:border-[#D39EAA]"
                    >
                      <option value="Custom Ring Design">Custom Engagement Ring Design</option>
                      <option value="Order Tracking">Existing Order & Shipping Status</option>
                      <option value="Ring Sizing Assistance">Ring Sizing & Fit Help</option>
                      <option value="Buyback & Upgrade">100% Buyback & Upgrade Request</option>
                      <option value="Boutique Visit Appointment">Store Visit Appointment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Message or Special Request
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about the ring style, carat preference, metal type, or any questions you have..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FFF0F5] border border-[#E8E5DF] rounded-xl p-4 text-xs text-[#18181B] focus:outline-none focus:border-[#D39EAA]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#B76E79] hover:bg-[#592D37] text-[#D39EAA] font-sans text-xs font-bold tracking-widest uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Submit Inquiry via WhatsApp
                </button>
              </form>
            )}
          </div>

          {/* Right Trust & FAQ snippet */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#592D37] text-[#FFF0F5] p-8 rounded-3xl border border-[#D39EAA]/30 shadow-xl">
              <span className="font-serif text-2xl font-bold text-[#D39EAA] block mb-1">
                ForeverJewells
              </span>
              <p className="font-sans text-[10px] tracking-widest text-[#FADBD8] uppercase font-semibold mb-6">
                Jaipur Moissanite & Fine Jewelry
              </p>

              <div className="space-y-4 text-xs font-sans text-gray-300">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#D39EAA] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-serif text-sm">
                      100% Lifetime Buyback Guarantee
                    </strong>
                    <span>
                      Upgrade your ring anytime. We credit 100% of your original purchase price.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-[#D39EAA] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-serif text-sm">
                      Individual GRA Lab Reports
                    </strong>
                    <span>
                      Every stone arrives with an embossed authenticity card and laser-inscribed girdle serial.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D39EAA] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-serif text-sm">
                      Store Hours & Appointments
                    </strong>
                    <span>
                      Monday to Saturday: 10:00 AM – 8:00 PM IST<br />
                      Sunday: By Prior Appointment Only
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DF] text-center">
              <h4 className="font-serif text-base font-bold text-[#18181B] mb-1">
                Prefer Live Video Consultation?
              </h4>
              <p className="font-sans text-xs text-gray-500 mb-4">
                Schedule a 1-on-1 virtual appointment to view diamond sparkle live on camera before ordering.
              </p>
              <a
                href="https://wa.me/919828930454?text=Hello%20ForeverJewells%20Team!%20I%20have%20an%20inquiry%20regarding%20a%20product."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#F7F5F0] hover:bg-[#E8E5DF] text-[#B76E79] font-sans text-xs font-bold uppercase tracking-wider rounded-xl border border-[#E8E5DF] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Book Video Appointment
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
