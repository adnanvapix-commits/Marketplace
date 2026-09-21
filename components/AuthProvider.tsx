"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import type { RealtimeChannel } from "@supabase/supabase-js";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser                = useAuthStore((s) => s.setUser);
  const setRole                = useAuthStore((s) => s.setRole);
  const setIsVerified          = useAuthStore((s) => s.setIsVerified);
  const setHydrated            = useAuthStore((s) => s.setHydrated);
  const setHasCompletedProfile = useAuthStore((s) => s.setHasCompletedProfile);

  // Track the realtime channel so we can unsubscribe on cleanup — fixes channel leak
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const fallbackTimer = setTimeout(() => setHydrated(true), 100);

    function applyProfile(data: { role?: string; is_verified?: boolean; full_name?: string; whatsapp_number?: string } | null) {
      setRole(data?.role ?? null);
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

        // Clean up previous realtime channel before creating a new one
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        if (currentUser) {
          clearTimeout(fallbackTimer);

          // Apply from JWT metadata for instant render (zero DB calls)
          const meta = currentUser.user_metadata ?? {};
          applyProfile({
            role:            meta.role            as string  ?? null,
            is_verified:     meta.is_verified     as boolean ?? false,
            full_name:       meta.full_name       as string  ?? null,
            whatsapp_number: meta.whatsapp_number as string  ?? null,
          });

          setHydrated(true);

          // Always fetch from DB to ensure accurate role/verification state
          // (user_metadata is user-writable and shouldn't be fully trusted for UI gating)
          fetchProfileBackground(currentUser.id);

          // Realtime: re-fetch when admin updates the user's profile
          channelRef.current = supabase
            .channel(`user-profile-${currentUser.id}`)
            .on("postgres_changes", {
              event: "UPDATE", schema: "public", table: "users",
              filter: `id=eq.${currentUser.id}`,
            }, () => { fetchProfileBackground(currentUser.id); })
            .subscribe();

        } else {
          clearTimeout(fallbackTimer);
          setRole(null);
          setIsVerified(false);
          setHasCompletedProfile(false);
          setHydrated(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
      // Clean up realtime channel on unmount
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setUser, setRole, setIsVerified, setHydrated, setHasCompletedProfile]);

  return <>{children}</>;
}
