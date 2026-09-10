import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} <span className="font-semibold text-primary">BULKORA</span> — Dubai B2B Marketplace
        </p>
        <div className="flex items-center gap-4">
          <Link href="/buy"     className="text-xs text-gray-400 hover:text-primary transition-colors">Browse</Link>
          <Link href="/sell"    className="text-xs text-gray-400 hover:text-primary transition-colors">Sell</Link>
          <Link href="/login"   className="text-xs text-gray-400 hover:text-primary transition-colors">Login</Link>
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-primary transition-colors">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
