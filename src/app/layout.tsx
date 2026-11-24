import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { ProductProvider } from "@/context/ProductContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import RegionalSettingsModal from "@/components/common/RegionalSettingsModal";
import { MessageCircle } from "lucide-react";
import FlyToCartAnimation from "@/components/layout/FlyToCartAnimation";
import WhatsAppWidget from "@/components/layout/WhatsAppWidget";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://foreverjewells.com'),
  title: "ForeverJewells | Moissanite Solitaire Rings & Fine Jewelry",
  description: "Discover certified VVS1 D-Color Moissanite solitaire rings, eternity bands, and bespoke fine jewelry. 100% Lifetime Buyback, GRA certified, and free insured delivery across India.",
  authors: [
    { name: "Aman Singh" },
    { name: "Ayush Choudhary" }
  ],
  creator: "Aman Singh & Ayush Choudhary",
  publisher: "ForeverJewells",
  other: {
    "developer": "Aman Singh & Ayush Choudhary",
    "developed-by": "Aman Singh & Ayush Choudhary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} overflow-x-hidden max-w-full`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#FFF0F5] text-[#18181B] selection:bg-[#D39EAA] selection:text-white antialiased overflow-x-hidden max-w-full w-full">
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
            }
          `}
        </Script>
        <Script id="dev-credits" strategy="afterInteractive">
          {`console.log("%c Crafted & Developed by Aman Singh & Ayush Choudhary ", "background: #18181B; color: #D39EAA; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 6px; border: 1px solid #D39EAA;");`}
        </Script>
        <ProductProvider>
          <CurrencyProvider>
            <CartProvider>
              <Header />
              <RegionalSettingsModal />
              <CartDrawer />
              <FlyToCartAnimation />
              <main className="flex-grow pt-[84px] md:pt-[112px] overflow-x-hidden w-full max-w-full">
                {children}
              </main>
              <Footer />
              <WhatsAppWidget />
            </CartProvider>
          </CurrencyProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
