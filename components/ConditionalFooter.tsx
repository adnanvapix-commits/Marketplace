"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Pages where footer should be shown
const FOOTER_PATHS = ["/", "/about", "/terms", "/privacy", "/help"];

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Show footer only on landing page, about, legal pages
  const show = FOOTER_PATHS.includes(pathname) || pathname === "/home";
  if (!show) return null;

  return <Footer />;
}
