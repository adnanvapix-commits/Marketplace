"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);
  const setIsVerified = useAuthStore((s) => s.setIsVerified);
  const setUserRole = useAuthStore((s) => s.setUserRole);
  const setHasCompletedProfile = useAuthStore((s) => s.setHasCompletedProfile);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from("users")
            .select("role, is_verified, full_name, whatsapp_number")
            .eq("id", currentUser.id)
            .single();

          setRole(data?.role ?? null);
          setUserRole(data?.role ?? null);
          setIsVerified(data?.is_verified ?? false);
          setHasCompletedProfile(!!(data?.full_name && data?.whatsapp_number));
        } else {
          setRole(null);
          setUserRole(null);
          setIsVerified(false);
          setHasCompletedProfile(false);
        }
      }
    );

    // Check for verification redirect cookie and dispatch event for home page
    if (typeof document !== "undefined" && document.cookie.includes("verification_redirect=1")) {
      window.dispatchEvent(new Event("verificationRedirect"));
      document.cookie = "verification_redirect=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    return () => subscription.unsubscribe();
  }, [setUser, setRole, setIsVerified, setUserRole, setHasCompletedProfile]);

  return <>{children}</>;
}
