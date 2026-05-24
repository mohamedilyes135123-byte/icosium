import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import "./premium-theme.css"; // ✨ Premium visual theme — remove this line to revert

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "عناية | بوابة الطبيب",
  description: "منصة عناية الطبية - إدارة العيادة، المرضى، والوصفات الطبية",
  manifest: "/manifest.json",
  themeColor: "#059669",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "عناية طبيب",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "عناية | بوابة الطبيب",
    description: "منصة عناية الطبية للطبيب",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="عناية طبيب" />
        <meta name="theme-color" content="#059669" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
