"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser                = useAuthStore((s) => s.setUser);
  const setRole                = useAuthStore((s) => s.setRole);
  const setIsVerified          = useAuthStore((s) => s.setIsVerified);
  const setHydrated            = useAuthStore((s) => s.setHydrated);
  const setUserRole            = useAuthStore((s) => s.setUserRole);
  const setHasCompletedProfile = useAuthStore((s) => s.setHasCompletedProfile);

  useEffect(() => {
    const supabase = createClient();

    // Fallback: mark hydrated after 100ms so navbar never blocks for long
    const fallbackTimer = setTimeout(() => setHydrated(true), 100);

    function applyProfile(data: { role?: string; is_verified?: boolean; full_name?: string; whatsapp_number?: string } | null) {
      setRole(data?.role ?? null);
      setUserRole(data?.role ?? null);
      setIsVerified(data?.is_verified ?? false);
      setHasCompletedProfile(!!(data?.full_name && data?.whatsapp_number));
    }

    async function fetchProfileBackground(userId: string) {
      try {
        const { data } = await supabase
          .from("users")
          .select("role, is_verified, full_name, whatsapp_number")
          .eq("id", userId)
          .single();
        applyProfile(data);
      } catch { /* non-blocking */ }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          clearTimeout(fallbackTimer);

          // Immediately apply from JWT metadata — zero DB calls, instant navbar
          const meta = currentUser.user_metadata ?? {};
          applyProfile({
            role:            meta.role            as string  ?? null,
            is_verified:     meta.is_verified     as boolean ?? false,
            full_name:       meta.full_name       as string  ?? null,
            whatsapp_number: meta.whatsapp_number as string  ?? null,
          });

          // Hydrate immediately — navbar renders right away
          setHydrated(true);

          // Only hit DB if JWT metadata is missing role (new users, pre-trigger)
          if (!meta.role) {
            fetchProfileBackground(currentUser.id);
          }

          // Realtime: re-fetch when admin updates is_verified
          supabase
            .channel(`user-profile-${currentUser.id}`)
            .on("postgres_changes", {
              event: "UPDATE", schema: "public", table: "users",
              filter: `id=eq.${currentUser.id}`,
            }, () => { fetchProfileBackground(currentUser.id); })
            .subscribe();

        } else {
          clearTimeout(fallbackTimer);
          setRole(null);
          setUserRole(null);
          setIsVerified(false);
          setHasCompletedProfile(false);
          setHydrated(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [setUser, setRole, setIsVerified, setHydrated, setUserRole, setHasCompletedProfile]);

  return <>{children}</>;
}
