'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppWidget() {
  const [bottomOffset, setBottomOffset] = useState(16); // 1rem default

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      const windowHeight = window.innerHeight;
      
      let newBottom = 16; 

      // Avoid crossing Header (stay below header)
      if (header) {
        const headerRect = header.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        const widgetHeight = 56; // approx height of widget

        // Check if the default bottom pushes it above the header
        const calculatedWidgetTop = windowHeight - newBottom - widgetHeight;
        
        if (calculatedWidgetTop < headerBottom) {
          // Force it to stay just below the header
          newBottom = windowHeight - headerBottom - widgetHeight - 16;
        }
      }

      setBottomOffset(newBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <a
      href="https://wa.me/919828930454?text=Hello%20ForeverJewells%20Team!%20I%20have%20an%20inquiry%20regarding%20a%20product."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-40 bg-[#B76E79] hover:bg-[#043327] text-[#D39EAA] hover:text-white p-3 sm:p-3.5 rounded-full shadow-2xl border border-[#D39EAA]/50 flex items-center justify-center group cursor-pointer"
      style={{
        bottom: `${Math.max(16, bottomOffset)}px`,
        right: '1rem',
        transition: 'bottom 0.1s ease-out',
      }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-transform duration-300 group-hover:scale-110" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-sans text-xs font-bold uppercase tracking-wider pl-0 group-hover:pl-2">
        Chat on WhatsApp
      </span>
    </a>
  );
}
