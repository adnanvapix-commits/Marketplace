"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, ShoppingBag, PlusCircle, MessageCircle,
  User, LogOut, Menu, X, CreditCard, LifeBuoy, Info, Shield, Heart,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import SubscriptionBadge from "./SubscriptionBadge";
import type { SubscriptionTier } from "@/types";

// Lazy-load notification bell — doesn't block initial navbar render
const NotificationBell = lazy(() => import("./NotificationBell"));

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
  const isAdmin = role === "admin" || user?.email === ADMIN_EMAIL;
  const isLoggedIn = hydrated && !!user;
  const subTier = (user?.user_metadata?.subscription_tier ?? null) as SubscriptionTier;

  // Fetch unread message count (lightweight: just a count query)
  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/chat/unread");
      if (res.ok) {
        const { count } = await res.json();
        setUnreadMessages(count ?? 0);
      }
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchUnread]);

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

  // All nav links use prefetch for instant navigation
  const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link href={href} prefetch className={className ?? linkCls(href)}>{children}</Link>
  );

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-cream-200"
        : "bg-cream-50 border-b border-cream-200"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <img src="/logo.jpeg" alt="BULKORA" className="w-9 h-9 rounded-lg object-contain" />
          <span className="text-lg font-black tracking-tight text-brand-gradient">BULKORA</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/">
            <Home size={15} className="shrink-0" /> Home
          </NavLink>
          <NavLink href="/buy">
            <ShoppingBag size={15} className="shrink-0" /> Buy
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink href="/sell">
                <PlusCircle size={15} className="shrink-0" /> Sell
              </NavLink>

              <div className="relative">
                <NavLink href="/chat">
                  <MessageCircle size={15} className="shrink-0" /> Chat
                </NavLink>
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 pointer-events-none">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </div>

              <NavLink href="/wishlist">
                <Heart size={15} className="shrink-0" /> Wishlist
              </NavLink>

              <NavLink href="/profile">
                <User size={15} className="shrink-0" /> Profile
              </NavLink>

              {isAdmin && (
                <NavLink href="/admin">
                  <Shield size={15} className="shrink-0" /> Admin
                </NavLink>
              )}

              <Link href="/subscription" prefetch className={`flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-all duration-150 px-3 py-2 rounded-lg ${
                isActive("/subscription") ? "text-primary bg-primary-light" : "text-gray-600 hover:text-primary hover:bg-cream-100"
              }`}>
                <CreditCard size={15} className="shrink-0" />
                {subTier ? <SubscriptionBadge tier={subTier} size="sm" showIcon={false} /> : "Plan"}
              </Link>

              <NavLink href="/about">
                <Info size={15} className="shrink-0" /> About
              </NavLink>

              <NavLink href="/help">
                <LifeBuoy size={15} className="shrink-0" /> Help
              </NavLink>

              <span className="w-px h-5 bg-cream-300 mx-1" />

              {/* Notification bell — lazy loaded, won't block navbar */}
              <Suspense fallback={<div className="w-8 h-8" />}>
                <NotificationBell userId={user!.id} />
              </Suspense>

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
            <>
              <NavLink href="/about">
                <Info size={15} className="shrink-0" /> About
              </NavLink>
              <NavLink href="/help">
                <LifeBuoy size={15} className="shrink-0" /> Help
              </NavLink>
              <Link
                href="/login"
                className="ml-2 btn-primary text-sm flex items-center gap-1.5 animate-pulse-gold"
              >
                Login / Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: notification bell + hamburger */}
        <div className="md:hidden flex items-center gap-1">
          {isLoggedIn && (
            <Suspense fallback={<div className="w-8 h-8" />}>
              <NotificationBell userId={user!.id} />
            </Suspense>
          )}
          <button
            className="p-2 rounded-xl text-gray-600 hover:bg-cream-200 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50/95 backdrop-blur-md shadow-soft-md">
          <div className="px-4 py-4 flex flex-col gap-1">
            <MobileLink href="/" icon={<Home size={18} />} label="Home"
              active={isActive("/")} onClick={() => setOpen(false)} />
            <MobileLink href="/buy" icon={<ShoppingBag size={18} />} label="Buy"
              active={isActive("/buy")} onClick={() => setOpen(false)} />

            {isLoggedIn ? (
              <>
                <MobileLink href="/sell" icon={<PlusCircle size={18} />} label="Sell"
                  active={isActive("/sell")} onClick={() => setOpen(false)} />

                <div className="relative">
                  <MobileLink href="/chat" icon={<MessageCircle size={18} />} label="Chat"
                    active={isActive("/chat")} onClick={() => setOpen(false)} />
                  {unreadMessages > 0 && (
                    <span className="absolute top-3 right-4 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 pointer-events-none">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </div>

                <MobileLink href="/wishlist" icon={<Heart size={18} />} label="Wishlist"
                  active={isActive("/wishlist")} onClick={() => setOpen(false)} />

                <MobileLink href="/profile" icon={<User size={18} />} label="Profile"
                  active={isActive("/profile")} onClick={() => setOpen(false)} />

                {isAdmin && (
                  <MobileLink href="/admin" icon={<Shield size={18} />} label="Admin Dashboard"
                    active={isActive("/admin")} onClick={() => setOpen(false)} />
                )}

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

                <MobileLink href="/about" icon={<Info size={18} />} label="About"
                  active={isActive("/about")} onClick={() => setOpen(false)} />
                <MobileLink href="/help" icon={<LifeBuoy size={18} />} label="Help & Support"
                  active={isActive("/help")} onClick={() => setOpen(false)} />

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
              <>
                <MobileLink href="/about" icon={<Info size={18} />} label="About"
                  active={isActive("/about")} onClick={() => setOpen(false)} />
                <MobileLink href="/help" icon={<LifeBuoy size={18} />} label="Help & Support"
                  active={isActive("/help")} onClick={() => setOpen(false)} />
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-primary text-sm text-center mt-2 w-full justify-center flex items-center"
                >
                  Login / Sign Up
                </Link>
              </>
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
      prefetch={true}
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
