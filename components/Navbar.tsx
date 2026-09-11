"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, ShoppingBag, PlusCircle, MessageCircle,
  User, LogOut, Menu, X, CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import SubscriptionBadge from "./SubscriptionBadge";
import type { SubscriptionTier } from "@/types";

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
  const isAdmin = role === "admin" || user?.email === ADMIN_EMAIL;
  const isLoggedIn = hydrated && !!user;
  const subTier = (user?.user_metadata?.subscription_tier ?? null) as SubscriptionTier;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const isActive = (path: string) => pathname === path;

  const linkCls = (path: string) =>
    `flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-all duration-150 px-3 py-2 rounded-lg ${
      isActive(path)
        ? "text-primary bg-primary-light"
        : "text-gray-600 hover:text-primary hover:bg-cream-100"
    }`;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-cream-200"
        : "bg-cream-50 border-b border-cream-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gold-gradient">BULK</span>
            <span className="text-gray-800">ORA</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/home" className={linkCls("/home")}>
            <Home size={15} className="shrink-0" /> Home
          </Link>
          <Link href="/buy" className={linkCls("/buy")}>
            <ShoppingBag size={15} className="shrink-0" /> Buy
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/sell" className={linkCls("/sell")}>
                <PlusCircle size={15} className="shrink-0" /> Sell
              </Link>

              <Link href="/chat" className={linkCls("/chat")}>
                <MessageCircle size={15} className="shrink-0" /> Chat
              </Link>

              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className={linkCls(isAdmin ? "/admin" : "/dashboard")}
              >
                <User size={15} className="shrink-0" />
                {isAdmin ? "Admin" : "Dashboard"}
              </Link>

              <Link href="/profile" className={linkCls("/profile")}>
                <User size={15} className="shrink-0" /> Profile
              </Link>

              <Link href="/subscription" className={`flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-all duration-150 px-3 py-2 rounded-lg ${
                isActive("/subscription") ? "text-primary bg-primary-light" : "text-gray-600 hover:text-primary hover:bg-cream-100"
              }`}>
                <CreditCard size={15} className="shrink-0" />
                {subTier ? <SubscriptionBadge tier={subTier} size="sm" showIcon={false} /> : "Plan"}
              </Link>

              <span className="w-px h-5 bg-cream-300 mx-1" />

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-all px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut size={15} className="shrink-0" /> Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-2 btn-primary text-sm flex items-center gap-1.5 animate-pulse-gold"
            >
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-cream-200 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50/95 backdrop-blur-md shadow-soft-md">
          <div className="px-4 py-4 flex flex-col gap-1">
            <MobileLink href="/home" icon={<Home size={18} />} label="Home"
              active={isActive("/home")} onClick={() => setOpen(false)} />
            <MobileLink href="/buy" icon={<ShoppingBag size={18} />} label="Buy"
              active={isActive("/buy")} onClick={() => setOpen(false)} />

            {isLoggedIn ? (
              <>
                <MobileLink href="/sell" icon={<PlusCircle size={18} />} label="Sell"
                  active={isActive("/sell")} onClick={() => setOpen(false)} />

                <MobileLink href="/chat" icon={<MessageCircle size={18} />} label="Chat"
                    active={isActive("/chat")} onClick={() => setOpen(false)} />

                <MobileLink
                  href={isAdmin ? "/admin" : "/dashboard"}
                  icon={<User size={18} />}
                  label={isAdmin ? "Admin Dashboard" : "Dashboard"}
                  active={isActive(isAdmin ? "/admin" : "/dashboard")}
                  onClick={() => setOpen(false)}
                />
                <MobileLink href="/profile" icon={<User size={18} />} label="Profile"
                  active={isActive("/profile")} onClick={() => setOpen(false)} />

                <Link
                  href="/subscription"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive("/subscription")
                      ? "bg-primary-light text-primary border border-primary/20"
                      : "text-gray-700 hover:bg-cream-200"
                  }`}
                >
                  <CreditCard size={18} className="shrink-0" />
                  <span className="flex-1">Subscription</span>
                  {subTier && <SubscriptionBadge tier={subTier} size="sm" />}
                </Link>

                <div className="border-t border-cream-200 my-2" />

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={18} className="shrink-0" /> Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-primary text-sm text-center mt-2 w-full justify-center flex items-center"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({
  href, icon, label, active, onClick,
}: {
  href: string; icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-primary-light text-primary border border-primary/20"
          : "text-gray-700 hover:bg-cream-200"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
