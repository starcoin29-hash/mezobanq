import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bitcoin: {
          50: "#fff8ec",
          100: "#ffeed3",
          200: "#ffd9a5",
          300: "#ffbf6d",
          400: "#ff9a32",
          500: "#f7931a",
          600: "#e07510",
          700: "#b95a0f",
          800: "#944615",
          900: "#793b17",
        },
        mezo: {
          50: "#edf9ff",
          100: "#d6f1ff",
          200: "#b5e8ff",
          300: "#83daff",
          400: "#48c3fc",
          500: "#1ea8f8",
          600: "#068bec",
          700: "#016fd9",
          800: "#0759b0",
          900: "#0c4b8b",
        },
        surface: {
          950: "#07070A", // Deeper background for more contrast
          900: "#0A0A0F", // Main page background
          800: "#13131A", // Cards background
          700: "#1A1A24", // Elevated cards
          600: "#242433", // Borders / Dividers
          500: "#303045", // Hover states
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        space: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Menlo", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "glow": "glow 2.5s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.4s ease-out",
        "gradient-x": "gradient-x 15s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(247,147,26,0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(247,147,26,0.8)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      boxShadow: {
        "bitcoin": "0 0 30px rgba(247, 147, 26, 0.35)",
        "bitcoin-sm": "0 0 15px rgba(247, 147, 26, 0.25)",
        "bitcoin-lg": "0 0 60px rgba(247, 147, 26, 0.5)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 12px 48px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.05)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "gradient-bitcoin": "linear-gradient(135deg, #f7931a 0%, #f5b942 100%)",
        "gradient-dark": "linear-gradient(180deg, #0A0A0F 0%, #07070A 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(19,19,26,0.8) 0%, rgba(10,10,15,0.9) 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backdropBlur: {
        "xs": "2px",
      },
    },
  },
  plugins: [],
};

export default config;