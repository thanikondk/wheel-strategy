import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        positive: "#0f9f6e",
        caution: "#b7791f",
        danger: "#dc2626"
      }
    }
  },
  plugins: []
};

export default config;
