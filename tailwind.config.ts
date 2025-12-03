import type { Config } from "tailwindcss";

// Tailwind v4 config: set sm to target widths under 500px
const config = {
  theme: {
    screens: {
      sm: { max: "500px" },
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
} satisfies Config;

export default config;
