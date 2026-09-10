import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* Brand */}
        <div className="space-y-2">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            BULKORA
          </span>
          <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
            Dubai&apos;s verified B2B marketplace for wholesale trade.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={12} className="text-primary shrink-0" /> Dubai, UAE
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Mail size={12} className="text-primary shrink-0" /> support@bulkora.com
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Marketplace</p>
          <div className="flex flex-col gap-1.5">
            <Link href="/buy"       className="text-xs text-gray-500 hover:text-primary transition-colors">Browse Products</Link>
            <Link href="/sell"      className="text-xs text-gray-500 hover:text-primary transition-colors">Start Selling</Link>
            <Link href="/dashboard" className="text-xs text-gray-500 hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/chat"      className="text-xs text-gray-500 hover:text-primary transition-colors">Messages</Link>
          </div>
        </div>

        {/* Account */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account</p>
          <div className="flex flex-col gap-1.5">
            <Link href="/login"   className="text-xs text-gray-500 hover:text-primary transition-colors">Login / Sign Up</Link>
            <Link href="/profile" className="text-xs text-gray-500 hover:text-primary transition-colors">My Profile</Link>
            <Link href="/account" className="text-xs text-gray-500 hover:text-primary transition-colors">Settings</Link>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream-200 px-4 py-3">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} BULKORA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
