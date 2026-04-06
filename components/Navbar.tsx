"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, PlusCircle, MessageCircle, User, LogOut, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com";
  const isAdmin = role === "admin" || user?.email === ADMIN_EMAIL;
  const isLoggedIn = hydrated && !!user;

  // Poll unread message count every 10s
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    async function fetchUnread() {
      try {
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", user!.id)
          .eq("is_read", false);
        setUnreadCount(count ?? 0);
      } catch {
        // is_read column may not exist yet — ignore
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (pathname.startsWith("/admin")) return null;

  const active = (path: string) =>
    pathname === path ? "text-primary font-semibold" : "text-gray-500 hover:text-primary";

  const linkCls = (path: string) =>
    `flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors ${active(path)}`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        <Link href="/" className="text-xl font-bold text-primary shrink-0">
          Market<span className="text-gray-800">Place</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/home" className={linkCls("/home")}>
            <Home size={16} className="shrink-0" /> Home
          </Link>

          <Link href="/buy" className={linkCls("/buy")}>
            <ShoppingBag size={16} className="shrink-0" /> Buy
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/sell" className={linkCls("/sell")}>
                <PlusCircle size={16} className="shrink-0" /> Sell
              </Link>

              {/* Chat with unread badge */}
              <div className="relative">
                <Link href="/chat" className={linkCls("/chat")}>
                  <MessageCircle size={16} className="shrink-0" /> Chat
                </Link>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              <Link href={isAdmin ? "/admin" : "/dashboard"}
                className={linkCls(isAdmin ? "/admin" : "/dashboard")}>
                <User size={16} className="shrink-0" />
                {isAdmin ? "Admin Dashboard" : "Dashboard"}
              </Link>
              <Link href="/profile" className={linkCls("/profile")}>
                <User size={16} className="shrink-0" /> Profile
              </Link>
              <span className="w-px h-5 bg-gray-200 mx-2" />
              <form action="/api/auth/logout" method="POST">
                <button type="submit"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors whitespace-nowrap px-2 py-1 rounded-lg hover:bg-red-50">
                  <LogOut size={16} className="shrink-0" /> Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="ml-2 btn-primary text-sm px-4 py-2">
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <MobileLink href="/home" icon={<Home size={18} />} label="Home"
              active={pathname === "/home"} onClick={() => setOpen(false)} />

            <MobileLink href="/buy" icon={<ShoppingBag size={18} />} label="Buy"
              active={pathname === "/buy"} onClick={() => setOpen(false)} />

            {isLoggedIn ? (
              <>
                <MobileLink href="/sell" icon={<PlusCircle size={18} />} label="Sell"
                  active={pathname === "/sell"} onClick={() => setOpen(false)} />

                {/* Chat with unread badge — mobile */}
                <div className="relative">
                  <MobileLink href="/chat" icon={<MessageCircle size={18} />} label="Chat"
                    active={pathname === "/chat"} onClick={() => setOpen(false)} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-3 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <MobileLink
                  href={isAdmin ? "/admin" : "/dashboard"}
                  icon={<User size={18} />}
                  label={isAdmin ? "Admin Dashboard" : "Dashboard"}
                  active={pathname === (isAdmin ? "/admin" : "/dashboard")}
                  onClick={() => setOpen(false)} />
                <MobileLink href="/profile" icon={<User size={18} />} label="Profile"
                  active={pathname === "/profile"} onClick={() => setOpen(false)} />
                <div className="border-t border-gray-100 my-2" />
                <form action="/api/auth/logout" method="POST">
                  <button type="submit"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full">
                    <LogOut size={18} className="shrink-0" /> Logout
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}
                className="btn-primary text-sm text-center mt-2">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({ href, icon, label, active, onClick }: {
  href: string; icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
        active ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
      }`}>
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
