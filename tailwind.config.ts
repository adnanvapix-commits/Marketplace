import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Navy Blue (from logo)
        primary: "#1B3A6B",
        "primary-dark": "#122A52",
        "primary-light": "#E8EEF8",

        // Accent: Emerald Green (from logo)
        accent: "#2E8B57",
        "accent-dark": "#1F6B40",
        "accent-light": "#E6F4ED",

        // Gold: Globe icon color
        gold: "#C8960C",
        "gold-dark": "#9E7309",
        "gold-light": "#FDF3D6",

        // Background: clean white with very subtle blue tint
        cream: {
          50:  "#F8FAFF",
          100: "#F0F4FF",
          200: "#E4EBFF",
          300: "#D0DCFF",
          400: "#A8BEFF",
          500: "#7A9BFF",
        },
        warm: {
          50:  "#F6F9F7",
          100: "#EBF4EF",
          200: "#D4E9DD",
          300: "#B5D5C5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "cream":    "0 2px 16px 0 rgba(27,58,107,0.08)",
        "cream-md": "0 4px 32px 0 rgba(27,58,107,0.12)",
        "cream-lg": "0 8px 48px 0 rgba(27,58,107,0.16)",
        "soft":     "0 2px 12px 0 rgba(0,0,0,0.06)",
        "soft-md":  "0 4px 24px 0 rgba(0,0,0,0.08)",
        "green":    "0 2px 16px 0 rgba(46,139,87,0.12)",
        "green-md": "0 4px 32px 0 rgba(46,139,87,0.18)",
      },
      backgroundImage: {
        "cream-gradient":  "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 50%, #E8EEF8 100%)",
        "navy-gradient":   "linear-gradient(135deg, #1B3A6B 0%, #122A52 100%)",
        "green-gradient":  "linear-gradient(135deg, #2E8B57 0%, #1F6B40 100%)",
        "gold-gradient":   "linear-gradient(135deg, #C8960C 0%, #E8B020 50%, #F5CC50 100%)",
        "hero-gradient":   "linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 60%, #E6F4ED 100%)",
        "brand-gradient":  "linear-gradient(135deg, #1B3A6B 0%, #2E8B57 100%)",
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-out",
        "slide-up":   "slideUp 0.5s ease-out",
        "float":      "float 6s ease-in-out infinite",
        "shimmer":    "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "pulse-navy": "pulseNavy 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(200,150,12,0.3)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(200,150,12,0)" },
        },
        pulseNavy: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(27,58,107,0.3)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(27,58,107,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
