"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);
  const setIsVerified = useAuthStore((s) => s.setIsVerified);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const setUserRole = useAuthStore((s) => s.setUserRole);
  const setHasCompletedProfile = useAuthStore((s) => s.setHasCompletedProfile);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data, error } = await supabase
            .from("users")
            .select("role, is_verified, full_name, whatsapp_number")
            .eq("id", currentUser.id)
            .single();

          if (error) {
            console.warn("[AuthProvider] profile fetch error:", error.message);
          }

          const verified = data?.is_verified ?? false;
          const role = data?.role ?? null;

          setRole(role);
          setUserRole(role);
          setIsVerified(verified);
          setHasCompletedProfile(!!(data?.full_name && data?.whatsapp_number));

          if (process.env.NODE_ENV === "development") {
            console.log("[AuthProvider] user:", currentUser.email, "| isVerified:", verified, "| role:", role);
          }
        } else {
          setRole(null);
          setUserRole(null);
          setIsVerified(false);
          setHasCompletedProfile(false);

          if (process.env.NODE_ENV === "development") {
            console.log("[AuthProvider] no session — user logged out");
          }
        }

        // Mark store as hydrated after first auth resolution
        setHydrated(true);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setRole, setIsVerified, setHydrated, setUserRole, setHasCompletedProfile]);

  return <>{children}</>;
}
