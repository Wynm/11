import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF7F0",
        ink: "#12171D",
        muted: "#5B6672",
        line: "#E7DFD2",
        pine: {
          DEFAULT: "#0B5D50",
          dark: "#08453C",
          soft: "#E7F0EC",
          tint: "#F1F7F4",
        },
        saffron: {
          DEFAULT: "#E0A03C",
          soft: "#FBF1DE",
        },
        clay: "#B4482F",
      },
      fontFamily: {
        sans: ["Tajawal", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,23,29,.04), 0 12px 32px -18px rgba(18,23,29,.28)",
        lift: "0 2px 4px rgba(18,23,29,.05), 0 30px 60px -30px rgba(11,93,80,.35)",
        sheet: "0 1px 2px rgba(18,23,29,.06), 0 50px 100px -45px rgba(18,23,29,.45)",
      },
      borderRadius: {
        xl2: "20px",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        rise: "rise .7s cubic-bezier(.2,.7,.2,1) both",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
