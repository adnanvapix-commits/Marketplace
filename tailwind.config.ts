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
        primary: "#B8860B",          // deep gold
        "primary-dark": "#8B6508",   // darker gold
        "primary-light": "#F5E6B8",  // pale gold
        cream: {
          50:  "#FFFDF7",
          100: "#FFF9EC",
          200: "#FFF3D6",
          300: "#FDECC0",
          400: "#F9DFA0",
          500: "#F0CC70",
        },
        warm: {
          50:  "#FDFAF5",
          100: "#F9F3E8",
          200: "#F0E4CC",
          300: "#E5D0AA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "cream": "0 2px 16px 0 rgba(184,134,11,0.08)",
        "cream-md": "0 4px 32px 0 rgba(184,134,11,0.12)",
        "cream-lg": "0 8px 48px 0 rgba(184,134,11,0.16)",
        "soft": "0 2px 12px 0 rgba(0,0,0,0.06)",
        "soft-md": "0 4px 24px 0 rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "cream-gradient": "linear-gradient(135deg, #FFFDF7 0%, #FFF9EC 50%, #FFF3D6 100%)",
        "gold-gradient": "linear-gradient(135deg, #B8860B 0%, #D4A017 50%, #F0CC70 100%)",
        "hero-gradient": "linear-gradient(135deg, #1a1209 0%, #2d1f0a 40%, #3d2b10 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184,134,11,0.3)" },
          "50%": { boxShadow: "0 0 0 8px rgba(184,134,11,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
