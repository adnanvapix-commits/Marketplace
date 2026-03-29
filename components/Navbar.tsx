"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag, PlusCircle, MessageCircle,
  User, LogOut, Heart, Menu, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const active = (path: string) =>
    pathname === path
      ? "text-primary font-semibold"
      : "text-gray-500 hover:text-primary";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    setOpen(false);
    router.push("/");
  }

  /* ── shared link style ── */
  const linkCls = (path: string) =>
    `flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors ${active(path)}`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary shrink-0">
          Market<span className="text-gray-800">Place</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/buy" className={linkCls("/buy")}>
            <ShoppingBag size={16} className="shrink-0" />
            Buy
          </Link>

          {user ? (
            <>
              <Link href="/sell" className={linkCls("/sell")}>
                <PlusCircle size={16} className="shrink-0" />
                Sell
              </Link>

              <Link href="/chat" className={linkCls("/chat")}>
                <MessageCircle size={16} className="shrink-0" />
                Chat
              </Link>

              <Link href="/wishlist" className={linkCls("/wishlist")}>
                <Heart size={16} className="shrink-0" />
                Wishlist
              </Link>

              <Link href="/profile" className={linkCls("/profile")}>
                <User size={16} className="shrink-0" />
                Profile
              </Link>

              <Link href="/account" className={linkCls("/account")}>
                <User size={16} className="shrink-0" />
                Account
              </Link>

              {/* divider */}
              <span className="w-px h-5 bg-gray-200 mx-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors whitespace-nowrap px-2 py-1 rounded-lg hover:bg-red-50"
              >
                <LogOut size={16} className="shrink-0" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-2 btn-primary text-sm px-4 py-2"
            >
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <MobileLink href="/buy" icon={<ShoppingBag size={18} />} label="Buy" active={pathname === "/buy"} onClick={() => setOpen(false)} />

            {user ? (
              <>
                <MobileLink href="/sell" icon={<PlusCircle size={18} />} label="Sell" active={pathname === "/sell"} onClick={() => setOpen(false)} />
                <MobileLink href="/chat" icon={<MessageCircle size={18} />} label="Chat" active={pathname === "/chat"} onClick={() => setOpen(false)} />
                <MobileLink href="/wishlist" icon={<Heart size={18} />} label="Wishlist" active={pathname === "/wishlist"} onClick={() => setOpen(false)} />
                <MobileLink href="/profile" icon={<User size={18} />} label="Profile" active={pathname === "/profile"} onClick={() => setOpen(false)} />

                <div className="border-t border-gray-100 my-2" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut size={18} className="shrink-0" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-primary text-sm text-center mt-2"
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

/* Mobile nav item */
function MobileLink({
  href, icon, label, active, onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
