import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0f172a",
          soft: "#1e293b",
        },
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 8px 24px -8px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
