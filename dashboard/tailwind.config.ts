import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft green / white / light gray brand palette
        brand: {
          50: "#f0faf4",
          100: "#dcf3e4",
          200: "#bce7cd",
          300: "#8fd5ab",
          400: "#5cbd84",
          500: "#36a366",
          600: "#268551",
          700: "#206a43",
          800: "#1d5438",
          900: "#194530",
        },
        ink: {
          DEFAULT: "#1f2a37",
          soft: "#475467",
          faint: "#98a2b3",
        },
        canvas: "#f6f8f7",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 6px 20px rgba(16, 24, 40, 0.06)",
        soft: "0 2px 8px rgba(16, 24, 40, 0.05)",
        pop: "0 12px 40px rgba(16, 24, 40, 0.14)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
