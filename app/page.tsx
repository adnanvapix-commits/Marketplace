import Link from "next/link";
import {
  Search, ShieldCheck, Building2, Globe, ArrowRight,
  TrendingUp, Users, CheckCircle2, Zap, Lock,
} from "lucide-react";
import GuestCTA from "./GuestCTA";
import HeroCTA from "@/components/HeroCTA";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Sellers Only",
    desc: "Every business is manually reviewed by our team before gaining access to the marketplace.",
  },
  {
    icon: Zap,
    title: "Instant Connections",
    desc: "Chat directly with sellers via WhatsApp or our built-in messaging system.",
  },
  {
    icon: TrendingUp,
    title: "Bulk Trade Pricing",
    desc: "Access wholesale prices with clear MOQ and quantity-based tiers.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    desc: "Your data and business details are protected with enterprise-grade security.",
  },
];

// Category cards — product images from Unsplash, no live counts
const CATEGORY_CARDS = [
  {
    name: "Smartphones & Mobiles",
    slug: "Electronics",
    desc: "Latest flagship phones, bulk-ready stock and distributor clearance lots.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&auto=format&fit=crop",
    badge: "Most Popular",
  },
  {
    name: "Laptops & Computing",
    slug: "Electronics",
    desc: "Enterprise-grade laptops, workstations and wholesale computing hardware.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&auto=format&fit=crop",
    badge: "High Demand",
  },
  {
    name: "Tech Accessories",
    slug: "Electronics",
    desc: "Charging gear, cables, audio peripherals and premium bulk accessories.",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80&auto=format&fit=crop",
    badge: "Fast Moving",
  },
  {
    name: "Packaging & Materials",
    slug: "Packaging",
    desc: "Industrial packaging, custom boxes, protective materials for bulk orders.",
    image: "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=600&q=80&auto=format&fit=crop",
    badge: "B2B Favourite",
  },
  {
    name: "Audio & Headphones",
    slug: "Electronics",
    desc: "Wireless earbuds, professional headsets and speaker systems at wholesale.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&auto=format&fit=crop",
    badge: "Trending",
  },
  {
    name: "Wearables & Smartwear",
    slug: "Electronics",
    desc: "Smartwatches, fitness bands and wearable tech for retail and distribution.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format&fit=crop",
    badge: "Growing Fast",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FFFDF7" }}>

      {/* ── Hero — unchanged ── */}
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[600px] md:min-h-[680px] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80&auto=format&fit=crop"
          alt="Dubai skyline"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #1B3A6B 0%, transparent 70%)" }} />

        <div className="relative w-full px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold mb-4 sm:mb-6 border border-white/20">
              🇦🇪 Dubai&apos;s Premier B2B Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-5 leading-tight tracking-tight text-balance px-2 drop-shadow-lg">
              Trade Smarter with<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #7BA7FF 0%, #2E8B57 100%)" }}>
                Verified Businesses
              </span>
            </h1>
            <p className="text-white/80 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed px-4 drop-shadow">
              Connect with pre-verified buyers and sellers worldwide.
              Access exclusive wholesale pricing and build lasting partnerships.
            </p>

            <form action="/buy" method="GET"
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="q"
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-10 sm:pl-11 pr-4 py-3 sm:py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-lg bg-white" />
              </div>
              <button type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg whitespace-nowrap">
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-2">
              <Link href="/buy"
                className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all active:scale-95 shadow-lg">
                🛒 Start Buying
              </Link>
              <Link href="/sell"
                className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/25 transition-all active:scale-95">
                🏷️ Start Selling
              </Link>
              <HeroCTA />
            </div>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-white/50 text-xs">
              <span>📍</span>
              <span>Dubai, United Arab Emirates</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section className="section">
        <div className="mb-10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Specialist Categories</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                Source the stock your<br className="hidden sm:block" /> business runs on
              </h2>
              <p className="text-gray-500 text-sm mt-2 max-w-lg">
                Purpose-built trading lanes with verified inventory and real wholesale quantities.
              </p>
            </div>
            <Link href="/buy"
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 shrink-0">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.name}
              href={`/buy?category=${encodeURIComponent(cat.slug)}`}
              className="group rounded-2xl border border-cream-200 bg-white overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Product image */}
              <div className="relative h-48 bg-gray-50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                    {cat.badge}
                  </span>
                </div>
              </div>

              {/* Card content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {cat.desc}
                </p>
                <span className="flex items-center gap-1 text-primary text-xs font-semibold">
                  Browse listings <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-cream-100 border-y border-cream-200 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="divider mx-auto mb-3" />
            <h2 className="section-title">Why Choose BULKORA?</h2>
            <p className="section-subtitle mx-auto text-center">
              Built for serious B2B traders who value trust, speed, and reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card animate-slide-up">
                <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section">
        <div className="text-center mb-10">
          <div className="divider mx-auto mb-3" />
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle mx-auto text-center">Get started in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto stagger">
          {[
            { icon: Building2,   step: "01", title: "Register Your Business", desc: "Create an account and submit your business details in under 5 minutes." },
            { icon: ShieldCheck, step: "02", title: "Get Verified",           desc: "Our team manually reviews your profile within 24–48 hours." },
            { icon: Globe,       step: "03", title: "Start Trading",          desc: "Access all listings, post your products, and connect with partners." },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="text-center animate-slide-up">
              <div className="step-circle">{step}</div>
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section text-center">
        <div className="max-w-2xl mx-auto card p-8 sm:p-12 shadow-cream-md border-primary/10">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
            <Users size={26} className="text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Ready to grow your business?
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Register your business and start trading on BULKORA today.
          </p>
          <ul className="text-sm text-left inline-flex flex-col gap-2 mb-8">
            {[
              "Free registration — no credit card required",
              "Verified buyer & seller network",
              "Direct WhatsApp & in-app messaging",
              "Bulk pricing with transparent MOQs",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <HeroCTA variant="button" />
        </div>
      </section>

      {/* CTA — only shown to guests */}
      <GuestCTA />
    </div>
  );
}
