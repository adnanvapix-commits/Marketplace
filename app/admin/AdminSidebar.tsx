"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag,
  CreditCard, ScrollText, Menu, X, LogOut,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

const links = [
  { href: "/admin",               label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/users",         label: "Users",         icon: Users },
  { href: "/admin/products",      label: "Products",      icon: ShoppingBag },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/logs",          label: "Logs",          icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Clear auth store
      setUser(null);
      setRole(null);
      setHydrated(true);
      router.push("/");
      router.refresh();
    } catch {
      // fallback — hard redirect
      window.location.href = "/";
    } finally {
      setLoggingOut(false);
    }
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-4 flex-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
        Admin Panel
      </p>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
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

      <div className="mt-auto pt-4 border-t border-cream-200">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full disabled:opacity-50"
        >
          <LogOut size={17} />
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-cream-50 border-r border-cream-200 min-h-screen sticky top-0">
        <div className="h-16 flex items-center px-5 border-b border-cream-200 gap-2">
          <span className="font-bold text-lg tracking-tight">
            <span className="text-gold-gradient">BULK</span>
            <span className="text-gray-700">ORA</span>
          </span>
        </div>
        {nav}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-cream-50 border-b border-cream-200 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl text-gray-600 hover:bg-cream-200 transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-base tracking-tight">
            <span className="text-gold-gradient">BULK</span>
            <span className="text-gray-700">ORA</span>
          </span>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-56 bg-cream-50 border-r border-cream-200 pt-14 flex flex-col">
            {nav}
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
