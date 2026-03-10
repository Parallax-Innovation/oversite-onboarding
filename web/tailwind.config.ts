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
        oversite: {
          orange: "#FF3E1A",
          "orange-dark": "#e63612",
          bg: "#0e0d0c",
          "bg-light": "#1a1918",
          border: "#333",
          text: "#fcfcfc",
          muted: "#888",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
