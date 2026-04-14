import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "منصة عناية | 3inaya Medical Ecosystem",
  description: "A production-ready digital health platform for the Algerian market connecting patients, doctors, pharmacies, and laboratories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
