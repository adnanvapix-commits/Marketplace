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

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("users")
        .select("role, is_verified, full_name, whatsapp_number")
        .eq("id", userId)
        .single();

      setRole(data?.role ?? null);
      setUserRole(data?.role ?? null);
      setIsVerified(data?.is_verified ?? false);
      setHasCompletedProfile(!!(data?.full_name && data?.whatsapp_number));
    }

    // Auth state listener — fires on mount with current session + on login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);

          // Realtime: re-fetch profile whenever admin updates is_verified
          supabase
            .channel(`user-profile-${currentUser.id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "users",
                filter: `id=eq.${currentUser.id}`,
              },
              async () => {
                await fetchProfile(currentUser.id);
              }
            )
            .subscribe();
        } else {
          setRole(null);
          setUserRole(null);
          setIsVerified(false);
          setHasCompletedProfile(false);
        }

        setHydrated(true);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setRole, setIsVerified, setHydrated, setUserRole, setHasCompletedProfile]);

  return <>{children}</>;
}
