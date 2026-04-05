import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  role: string | null;
  isVerified: boolean;
  selectedMode: "buy" | "sell";
  userRole: string | null;
  hasCompletedProfile: boolean;
  lastVisitedPage: string | null;

  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setIsVerified: (v: boolean) => void;
  setSelectedMode: (mode: "buy" | "sell") => void;
  setUserRole: (role: string | null) => void;
  setHasCompletedProfile: (v: boolean) => void;
  setLastVisitedPage: (page: string | null) => void;
}

const getInitialSelectedMode = (): "buy" | "sell" => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("selectedMode");
    if (stored === "buy" || stored === "sell") return stored;
  }
  return "buy";
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isVerified: false,
  selectedMode: getInitialSelectedMode(),
  userRole: null,
  hasCompletedProfile: false,
  lastVisitedPage: null,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setIsVerified: (v) => set({ isVerified: v }),
  setSelectedMode: (mode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedMode", mode);
    }
    set({ selectedMode: mode });
  },
  setUserRole: (role) => set({ userRole: role }),
  setHasCompletedProfile: (v) => set({ hasCompletedProfile: v }),
  setLastVisitedPage: (page) => set({ lastVisitedPage: page }),
}));
