import Link from "next/link";
import {
  Search, ShieldCheck, Building2, Globe, ArrowRight,
  Sparkles, TrendingUp, Users, Package, Star,
  CheckCircle2, Zap, Lock,
} from "lucide-react";
import { CATEGORIES } from "@/types";
import GuestCTA from "./GuestCTA";

const STATS = [
  { value: "12,000+", label: "Verified Products", icon: Package },
  { value: "3,500+", label: "Active Businesses", icon: Building2 },
  { value: "80+", label: "Countries", icon: Globe },
  { value: "99%", label: "Satisfaction Rate", icon: Star },
];

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

const TESTIMONIALS = [
  {
    name: "Ahmed Al-Rashidi",
    company: "Gulf Trading Co.",
    text: "BULKORA transformed how we source products. The verified network means we only deal with trusted suppliers.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    company: "Pacific Imports LLC",
    text: "Best B2B marketplace for the UAE region. Clean interface, real sellers, and fast responses.",
    rating: 5,
  },
  {
    name: "Khalid Mansoor",
    company: "Mansoor Wholesale",
    text: "We listed our products and got our first bulk order within 48 hours. Incredible platform.",
    rating: 5,
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Electronics": "💻",
  "Clothing & Apparel": "👗",
  "Food & Beverages": "🥤",
  "Construction Materials": "🏗️",
  "Machinery & Equipment": "⚙️",
  "Chemicals": "🧪",
  "Automotive": "🚗",
  "Medical Supplies": "🏥",
  "Furniture": "🪑",
  "Packaging": "📦",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FFFDF7" }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-16 sm:py-24">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #F0CC70 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #B8860B 0%, transparent 70%)" }} />

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 text-amber-200 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/15 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-300" />
            Dubai&apos;s Premier B2B Marketplace
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight text-balance">
            Trade Smarter with<br />
            <span className="text-gold-gradient">Verified Businesses</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Connect with pre-verified buyers and sellers worldwide.
            Access exclusive wholesale pricing and build lasting partnerships.
          </p>

          {/* Search bar */}
          <form
            action="/buy"
            method="GET"
            className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="q"
                placeholder="Search products, brands, categories..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-soft-md"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-cream-md whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/buy"
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-cream-100 transition-all active:scale-95 shadow-soft"
            >
              🛒 Start Buying
            </Link>
            <Link
              href="/sell"
              className="flex items-center gap-2 px-7 py-3 rounded-xl border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-all active:scale-95"
            >
              🏷️ Start Selling
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-amber-200 text-sm font-medium hover:text-white transition-colors"
            >
              Create free account <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-4xl mx-auto mt-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="glass rounded-2xl px-4 py-4 text-center animate-slide-up">
                <Icon size={18} className="text-amber-300 mx-auto mb-1" />
                <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-cream-100 border-y border-cream-200 py-4 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {[
            "✅ Admin-verified sellers",
            "🔒 Secure transactions",
            "⚡ WhatsApp direct chat",
            "📦 Bulk MOQ pricing",
            "🌍 80+ countries",
          ].map((t) => (
            <span key={t} className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="divider mb-3" />
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Find exactly what your business needs across our verified product lines.</p>
          </div>
          <Link href="/buy" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 shrink-0 ml-4">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 stagger">
          {CATEGORIES.slice(0, 10).map((cat) => (
            <Link
              key={cat}
              href={`/buy?category=${encodeURIComponent(cat)}`}
              className="card-hover p-4 flex flex-col items-center gap-2 text-center group animate-slide-up"
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat] ?? "📦"}</span>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors leading-tight">
                {cat}
              </p>
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
          <p className="section-subtitle mx-auto text-center">
            Get started in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto stagger">
          {[
            { icon: Building2, step: "01", title: "Register Your Business", desc: "Create an account and submit your business details in under 5 minutes." },
            { icon: ShieldCheck,  step: "02", title: "Get Verified",          desc: "Our team manually reviews your profile within 24–48 hours." },
            { icon: Globe,        step: "03", title: "Start Trading",          desc: "Access all listings, post your products, and connect with partners." },
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

        {/* Connector line (desktop) */}
        <div className="hidden sm:flex items-center justify-center gap-0 max-w-4xl mx-auto -mt-32 mb-8 pointer-events-none" aria-hidden>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cream-300 to-cream-300 ml-24" />
          <div className="flex-1 h-px bg-gradient-to-r from-cream-300 via-cream-300 to-transparent mr-24" />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-cream-100 border-y border-cream-200 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="divider mx-auto mb-3" />
            <h2 className="section-title">Trusted by Businesses Worldwide</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
            {TESTIMONIALS.map(({ name, company, text, rating }) => (
              <div key={name} className="card p-5 animate-slide-up">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-2 border-t border-cream-200 pt-3">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">{company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Checklist CTA ── */}
      <section className="section text-center">
        <div className="max-w-2xl mx-auto card p-8 sm:p-12 shadow-cream-md border-primary/10">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
            <Users size={26} className="text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Ready to grow your business?
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Join thousands of verified businesses on BULKORA today.
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
          <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA — only shown to guests */}
      <GuestCTA />
    </div>
  );
}
