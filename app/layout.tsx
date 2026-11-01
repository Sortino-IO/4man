import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import Script from "next/script";
import { CookieBanner } from "@/components/CookieBanner";
import { ReviewsBadge } from "@/components/ReviewsBadge";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.4man.co.il"),
  icons: { icon: "/media/fb072e_d47657eb267c4784bb1f4731be2a755c~mv2.png" },
};

const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={rubik.className}>
      <head>
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-M9B7BMF');
        `}</Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-4Y0XK68961" strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4Y0XK68961');
        `}</Script>
        {PIXEL ? (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL}');
            fbq('track', 'PageView');
          `}</Script>
        ) : null}
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M9B7BMF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <Header />
        <main id="content">{children}</main>
        <Footer />
        <ReviewsBadge />
        <CookieBanner />
      </body>
    </html>
  );
}
