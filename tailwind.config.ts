import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        rare: {
          primary: '#041a45',        // Midnight Blue
          'primary-light': 'rgba(4, 26, 69, 0.08)',
          secondary: '#3f5071',      // Slate Blue
          accent: '#edcea4',         // Beige
          background: '#fdfbf8',     // Light cream
          'background-alt': '#edcea4', // Beige for alternating sections
          text: '#041a45',           // Midnight Blue for text
          'text-light': '#3f5071',   // Slate Blue for secondary text
          border: 'rgba(4, 26, 69, 0.3)',
          footer: '#041a45',         // Midnight Blue footer background
        },
      },
      letterSpacing: {
        'rare-nav': '3px',
        'rare-btn': '5px',
      },
      maxWidth: {
        '8xl': '1440px',
      },
    },
  },
  plugins: [],
} satisfies Config;

