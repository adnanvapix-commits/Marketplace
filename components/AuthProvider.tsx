"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes — this fires immediately with current session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", currentUser.id)
            .single();
          setRole(data?.role ?? null);
        } else {
          setRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setRole]);

  return <>{children}</>;
}
