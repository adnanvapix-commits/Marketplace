import Link from "next/link";
import { Search, ShieldCheck, Building2, Globe, ArrowRight, Lock } from "lucide-react";
import { CATEGORIES } from "@/types";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-white/20">
            <ShieldCheck size={13} /> Verified B2B Marketplace
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Trade Smarter with<br />
            <span className="text-primary">Verified Businesses</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Connect with verified buyers and sellers worldwide. Access exclusive B2B listings after verification.
          </p>

          {/* Search bar — redirects to /buy */}
          <form action="/buy" method="GET" className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="q"
                placeholder="Search products, brands, categories..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors shrink-0">
              Search
            </button>
          </form>        </div>
      </section>

      {/* Category quick links */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Browse by Category</h2>
          <Link href="/buy" className="text-primary text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.slice(0, 12).map((cat) => (
            <Link
              key={cat}
              href={`/buy?category=${encodeURIComponent(cat)}`}
              className="card p-3 text-center hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <p className="text-xs font-medium text-gray-700 group-hover:text-primary transition-colors leading-tight">
                {cat}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Building2, step: "1", title: "Register Your Business", desc: "Create an account and submit your business details for verification." },
              { icon: ShieldCheck, step: "2", title: "Get Verified", desc: "Our team reviews and approves your account within 24–48 hours." },
              { icon: Globe, step: "3", title: "Start Trading", desc: "Access the full marketplace, post listings, and connect with partners." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-1">STEP {step}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <Lock size={32} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Marketplace Access is Restricted
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Product listings are only visible to verified and subscribed members. Register today to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login?signup=1" className="btn-primary px-8 py-3">
              Register Your Business
            </Link>
            <Link href="/login" className="btn-outline px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
