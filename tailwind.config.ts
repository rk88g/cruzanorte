import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./validations/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#171717",
        platinum: "#f4f1ea",
        sand: "#d8c7a3",
        copper: "#a9673f"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 23, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
