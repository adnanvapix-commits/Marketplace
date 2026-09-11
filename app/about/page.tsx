import { ShieldCheck, Zap, Globe, TrendingUp, Users, CheckCircle2, Building2, Award } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Verified Businesses", value: "500+" },
  { label: "Product Categories", value: "10+" },
  { label: "Countries Served", value: "30+" },
  { label: "Deals Facilitated", value: "1,200+" },
];

const VALUES = [
  { icon: ShieldCheck, title: "Trust First", desc: "Every business on BULKORA is manually reviewed by our team. No fakes, no spam — only real, verified companies." },
  { icon: Zap,         title: "Speed & Simplicity", desc: "We built BULKORA to be fast and frictionless. Find what you need, connect instantly, and close deals faster." },
  { icon: Globe,       title: "Global Reach", desc: "Based in Dubai — the world's trade hub. We connect buyers and sellers from the UAE and across 30+ countries." },
  { icon: TrendingUp,  title: "Growth Focused", desc: "Our subscription tiers are designed to grow with your business — from first listing to market leader." },
];

const TEAM = [
  { name: "Operations", role: "Marketplace Management", icon: Building2 },
  { name: "Verification", role: "Business Review & Approval", icon: ShieldCheck },
  { name: "Support", role: "Customer Success", icon: Users },
  { name: "Technology", role: "Platform Development", icon: Award },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary-dark px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-primary/15">
          About BULKORA
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 tracking-tight mb-5 text-balance">
          Dubai&apos;s Trusted B2B<br />
          <span className="bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
            Wholesale Marketplace
          </span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
          BULKORA connects verified wholesale buyers and sellers worldwide. We built a platform where trust,
          speed, and transparency make every trade smoother — from first contact to final deal.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-cream-200 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="card p-6 sm:p-10">
          <div className="divider mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-4">
            Global B2B trade is broken — full of unverified contacts, middlemen, and wasted time. BULKORA
            was built to fix that. We created a marketplace where only real, verified businesses can
            participate, making every connection meaningful and every deal trustworthy.
          </p>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Based in Dubai — one of the world&apos;s most active trade hubs — we serve businesses across
            electronics, textiles, food, construction, machinery, and more. Whether you&apos;re sourcing
            bulk goods or expanding your distribution network, BULKORA is your partner.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-y border-cream-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="divider mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <div className="divider mx-auto mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">How BULKORA Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "01", icon: Building2, title: "Register Your Business", desc: "Create an account and submit your business details. The process takes under 5 minutes." },
            { step: "02", icon: ShieldCheck, title: "Get Verified", desc: "Our team manually reviews every profile within 24–48 hours before granting marketplace access." },
            { step: "03", icon: Globe, title: "Trade Globally", desc: "Browse verified listings, post your products, and connect with serious buyers and sellers worldwide." },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold text-sm flex items-center justify-center mx-auto mb-3 ring-4 ring-primary/10">
                {step}
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-primary" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-white border-y border-cream-200 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="divider mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Our Team</h2>
            <p className="text-gray-500 text-sm mt-2">Dedicated professionals keeping the marketplace running smoothly</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TEAM.map(({ name, role, icon: Icon }) => (
              <div key={name} className="card p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-2">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="font-bold text-gray-800 text-sm">{name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-14 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Ready to start trading?</h2>
        <p className="text-gray-500 text-sm mb-6">Join hundreds of verified businesses already on BULKORA.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="btn-primary text-sm px-6 py-3">Create Free Account</Link>
          <Link href="/help" className="btn-outline text-sm px-6 py-3">Get Help</Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          {["Manual verification", "No fake listings", "Instant messaging", "Bulk pricing"].map((f) => (
            <span key={f} className="flex items-center gap-1"><CheckCircle2 size={12} className="text-primary" />{f}</span>
          ))}
        </div>
      </section>

    </div>
  );
}
