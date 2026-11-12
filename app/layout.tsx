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
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.4man.co.il"),
  icons: { icon: "/media/fb072e_d47657eb267c4784bb1f4731be2a755c~mv2.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={rubik.className}>
      <head>
        <Script id="consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          var ads = 'denied', analytics = 'denied';
          try {
            var saved = JSON.parse(localStorage.getItem('4man-consent') || 'null');
            if (saved) {
              if (saved.analytics) analytics = 'granted';
              if (saved.marketing) ads = 'granted';
            }
          } catch (e) {}
          gtag('consent', 'default', {
            ad_storage: ads,
            analytics_storage: analytics,
            ad_user_data: ads,
            ad_personalization: ads,
            wait_for_update: 500
          });
        `}</Script>
        <Script id="gtm" strategy="beforeInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-M9B7BMF');
        `}</Script>
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
