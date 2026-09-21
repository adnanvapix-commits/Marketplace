import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  role: string | null;
  isVerified: boolean;
  hydrated: boolean;
  selectedMode: "buy" | "sell";
  hasCompletedProfile: boolean;
  lastVisitedPage: string | null;

  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setIsVerified: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  setSelectedMode: (mode: "buy" | "sell") => void;
  setHasCompletedProfile: (v: boolean) => void;
  setLastVisitedPage: (page: string | null) => void;
}

const getInitialSelectedMode = (): "buy" | "sell" => {
  // Only read localStorage on client after mount — avoids SSR hydration mismatch
  return "buy";
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isVerified: false,
  hydrated: false,
  selectedMode: getInitialSelectedMode(),
  hasCompletedProfile: false,
  lastVisitedPage: null,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setIsVerified: (v) => set({ isVerified: v }),
  setHydrated: (v) => set({ hydrated: v }),
  setSelectedMode: (mode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedMode", mode);
    }
    set({ selectedMode: mode });
  },
  setHasCompletedProfile: (v) => set({ hasCompletedProfile: v }),
  setLastVisitedPage: (page) => set({ lastVisitedPage: page }),
}));
