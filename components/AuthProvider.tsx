"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser           = useAuthStore((s) => s.setUser);
  const setRole           = useAuthStore((s) => s.setRole);
  const setIsVerified     = useAuthStore((s) => s.setIsVerified);
  const setHydrated       = useAuthStore((s) => s.setHydrated);
  const setUserRole       = useAuthStore((s) => s.setUserRole);
  const setHasCompletedProfile = useAuthStore((s) => s.setHasCompletedProfile);

  useEffect(() => {
    const supabase = createClient();

    // Fallback: mark hydrated after 800ms if auth never fires (missing env vars etc.)
    const fallbackTimer = setTimeout(() => setHydrated(true), 800);

    function applyProfile(data: { role?: string; is_verified?: boolean; full_name?: string; whatsapp_number?: string } | null) {
      setRole(data?.role ?? null);
      setUserRole(data?.role ?? null);
      setIsVerified(data?.is_verified ?? false);
      setHasCompletedProfile(!!(data?.full_name && data?.whatsapp_number));
    }

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("users")
        .select("role, is_verified, full_name, whatsapp_number")
        .eq("id", userId)
        .single();
      applyProfile(data);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Mark hydrated immediately — don't wait for the profile DB fetch
          setHydrated(true);
          clearTimeout(fallbackTimer);

          // Check user_metadata first (available instantly from JWT, no DB call)
          const meta = currentUser.user_metadata ?? {};
          if (meta.role || meta.is_verified !== undefined) {
            applyProfile({
              role: meta.role as string,
              is_verified: meta.is_verified as boolean,
              full_name: meta.full_name as string,
              whatsapp_number: meta.whatsapp_number as string,
            });
          }

          // Then fetch fresh profile from DB in background (updates if stale)
          fetchProfile(currentUser.id).catch(() => {});

          // Realtime: re-fetch when admin updates is_verified
          supabase
            .channel(`user-profile-${currentUser.id}`)
            .on("postgres_changes", {
              event: "UPDATE", schema: "public", table: "users",
              filter: `id=eq.${currentUser.id}`,
            }, () => { fetchProfile(currentUser.id).catch(() => {}); })
            .subscribe();

        } else {
          setRole(null);
          setUserRole(null);
          setIsVerified(false);
          setHasCompletedProfile(false);
          setHydrated(true);
          clearTimeout(fallbackTimer);
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
