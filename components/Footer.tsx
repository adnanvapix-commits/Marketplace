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

        {/* About */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">About</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            BULKORA connects verified wholesale buyers and sellers across the UAE and beyond.
            Every business is manually reviewed before gaining access.
          </p>
          <Link href="/about" className="text-xs text-primary hover:underline font-medium">
            Learn more →
          </Link>
        </div>

        {/* Business Hours + Links */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Business Hours</p>
          <div className="flex flex-col gap-1.5 text-xs text-gray-500">
            <span>Mon – Fri: 9:00 AM – 6:00 PM</span>
            <span>Sat: 10:00 AM – 3:00 PM</span>
            <span>Sun: Closed</span>
            <span className="text-primary font-medium mt-1">GST +4 (Dubai Time)</span>
          </div>
          <div className="flex gap-4 pt-1">
            <Link href="/help" className="text-xs text-gray-400 hover:text-primary transition-colors">Help & Support</Link>
            <Link href="/about" className="text-xs text-gray-400 hover:text-primary transition-colors">About Us</Link>
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
