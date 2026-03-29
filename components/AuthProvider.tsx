"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useAuthStore((s) => s.setRole);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("users").select("role").eq("id", user.id).single();
        setRole(data?.role ?? null);
      } else {
        setRole(null);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from("users").select("role").eq("id", session.user.id).single();
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
