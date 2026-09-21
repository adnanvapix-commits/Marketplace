import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import ToasterWithDismiss from "@/components/ToasterWithDismiss";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",      // prevent FOIT
  preload: true,
});

export const metadata: Metadata = {
  title: "BULKORA — Trade Smarter",
  description: "BULKORA — Verified B2B marketplace for buyers and sellers worldwide",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
    shortcut: "/logo.jpeg",
  },
  openGraph: {
    title: "BULKORA — Trade Smarter",
    description: "Dubai's verified B2B marketplace for wholesale trade",
    images: [{ url: "/logo.jpeg" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Supabase for faster first DB query */}
        <link rel="preconnect" href={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') ?? ''}`} />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ToasterWithDismiss />
        </AuthProvider>
      </body>
    </html>
  );
}
