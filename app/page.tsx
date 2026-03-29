import Link from "next/link";
import { Search, ShieldCheck, Building2, Globe, ArrowRight, Lock } from "lucide-react";
import { CATEGORIES } from "@/types";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/20">
            <ShieldCheck size={12} /> Verified B2B Marketplace
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Trade Smarter with<br className="hidden sm:block" />
            <span className="text-primary"> Verified Businesses</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Connect with verified buyers and sellers worldwide.
          </p>

          {/* Search — stacked on mobile */}
          <form action="/buy" method="GET" className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text" name="q"
                placeholder="Search products, brands..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button type="submit"
              className="bg-primary hover:bg-primary-dark active:scale-95 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shrink-0">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">Browse by Category</h2>
          <Link href="/buy" className="text-primary text-xs sm:text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/buy?category=${encodeURIComponent(cat)}`}
              className="card px-5 py-3 hover:shadow-md hover:border-primary/40 active:scale-95 transition-all group flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                {cat}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Building2, step: "1", title: "Register", desc: "Create an account and submit your business details." },
              { icon: ShieldCheck, step: "2", title: "Get Verified", desc: "Our team reviews your account within 24–48 hours." },
              { icon: Globe, step: "3", title: "Start Trading", desc: "Access listings, post products, and connect with partners." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card p-5 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-1">STEP {step}</div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-14 px-4 text-center">
        <div className="max-w-sm sm:max-w-xl mx-auto">
          <Lock size={28} className="text-primary mx-auto mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Access is Restricted
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Only verified and subscribed members can view listings.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="btn-primary py-3 text-base">
              Register Your Business
            </Link>
            <Link href="/login" className="btn-outline py-3 text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
