import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-cream-50 to-white border-t border-cream-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-cream">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
                BULKORA
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dubai&apos;s premier B2B marketplace connecting verified businesses worldwide for wholesale trade and bulk procurement.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream-100 hover:bg-primary/10 flex items-center justify-center text-gray-600 hover:text-primary transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream-100 hover:bg-primary/10 flex items-center justify-center text-gray-600 hover:text-primary transition-all">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream-100 hover:bg-primary/10 flex items-center justify-center text-gray-600 hover:text-primary transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream-100 hover:bg-primary/10 flex items-center justify-center text-gray-600 hover:text-primary transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/buy" className="text-sm text-gray-600 hover:text-primary transition-colors">Browse Products</Link></li>
              <li><Link href="/sell" className="text-sm text-gray-600 hover:text-primary transition-colors">Start Selling</Link></li>
              <li><Link href="/dashboard" className="text-sm text-gray-600 hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/profile" className="text-sm text-gray-600 hover:text-primary transition-colors">My Profile</Link></li>
              <li><Link href="/chat" className="text-sm text-gray-600 hover:text-primary transition-colors">Messages</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/buy?category=Electronics" className="text-sm text-gray-600 hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/buy?category=Clothing+%26+Apparel" className="text-sm text-gray-600 hover:text-primary transition-colors">Clothing & Apparel</Link></li>
              <li><Link href="/buy?category=Food+%26+Beverages" className="text-sm text-gray-600 hover:text-primary transition-colors">Food & Beverages</Link></li>
              <li><Link href="/buy?category=Construction+Materials" className="text-sm text-gray-600 hover:text-primary transition-colors">Construction</Link></li>
              <li><Link href="/buy?category=Machinery+%26+Equipment" className="text-sm text-gray-600 hover:text-primary transition-colors">Machinery</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span>Dubai, United Arab Emirates</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-600">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <a href="mailto:support@bulkora.com" className="hover:text-primary transition-colors">
                  support@bulkora.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <a href="tel:+971500000000" className="hover:text-primary transition-colors">
                  +971 50 000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream-200 bg-cream-50/50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © {currentYear} BULKORA. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/terms" className="text-xs text-gray-500 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-xs text-gray-500 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
