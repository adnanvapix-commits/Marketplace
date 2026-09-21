"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag,
  CreditCard, ScrollText, Menu, X, LogOut, LifeBuoy, Bell,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

const links = [
  { href: "/admin",                label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/users",          label: "Users",          icon: Users },
  { href: "/admin/products",       label: "Products",       icon: ShoppingBag },
  { href: "/admin/subscriptions",  label: "Subscriptions",  icon: CreditCard },
  { href: "/admin/tickets",        label: "Tickets",        icon: LifeBuoy },
  { href: "/admin/notifications",  label: "Notifications",  icon: Bell },
  { href: "/admin/logs",           label: "Logs",           icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const setUser     = useAuthStore((s) => s.setUser);
  const setRole     = useAuthStore((s) => s.setRole);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  async function handleLogout() {
    setLoggingOut(true);
    setUser(null);
    setRole(null);
    setHydrated(true);
    try { createClient().auth.signOut(); } catch { /* ignore */ }
    window.location.replace("/");
  }

  const navLinks = (
    <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2 mt-1">
        Admin Panel
      </p>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            prefetch
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-primary text-white shadow-cream"
                : "text-gray-600 hover:bg-cream-100 hover:text-gray-900"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </div>
  );

  // Logout button — always visible, pinned to bottom of sidebar
  const logoutBtn = (
    <div className="p-3 border-t border-cream-200 shrink-0">
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full disabled:opacity-50"
      >
        <LogOut size={17} />
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — flex column, logout always pinned at bottom */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-cream-50 border-r border-cream-200 h-screen sticky top-0 overflow-hidden">
        {/* Logo header */}
        <div className="h-16 flex items-center px-5 border-b border-cream-200 gap-2.5 shrink-0">
          <img src="/logo.jpeg" alt="BULKORA" className="w-8 h-8 rounded-md object-contain" />
          <span className="font-black text-base tracking-tight text-brand-gradient">BULKORA</span>
        </div>
        {/* Scrollable nav links */}
        {navLinks}
        {/* Logout always visible at bottom */}
        {logoutBtn}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-cream-50 border-b border-cream-200 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl text-gray-600 hover:bg-cream-200 transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-1.5 flex-1">
          <img src="/logo.jpeg" alt="BULKORA" className="w-7 h-7 rounded-md object-contain" />
          <span className="font-black text-base tracking-tight text-brand-gradient">BULKORA</span>
        </div>
        {/* Logout button in mobile top bar — always visible */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          <LogOut size={15} />
          {loggingOut ? "..." : "Logout"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-56 bg-cream-50 border-r border-cream-200 pt-14 flex flex-col h-full overflow-hidden">
            {navLinks}
            {logoutBtn}
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
