/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0e6ff",
          100: "#d8c7ff",
          200: "#b89aff",
          300: "#9d70ff",
          400: "#8447ff",
          500: "#6b1fff",
          600: "#1C007C", // Main primary color
          700: "#150060",
          800: "#0f0047",
          900: "#080029",
          DEFAULT: "#1C007C", // Default primary
          light: "#6b1fff",
          dark: "#0f0047",
          muted: "#6c5a99", // For muted text
          accent: "#7a4bd6", // For accents and links
          text: "#2b1a5e", // For main text when not using default
        },
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      height: {
        "cal-height-lt": "calc(100vh - 351px)",
        "cal-height-mb": "calc(100vh - 223px)",
        "main-content": "calc(100vh - 80px)", // For pages with header
      },
      fontFamily: {
        gmarket: ["GmarketSans", "sans-serif"],
        oxanium: ["var(--font-oxanium)", "Oxanium", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      // Set responsive base font size for html and body
      addBase({
        html: {
          fontSize: "16px",
        },
        body: {
          fontSize: "1rem",
          color: "#1C007C !important", // Force default text color
        },
        ".dark body": {
          color: "white !important", // Force dark mode text color
        },
        // Make text-base responsive by default
        ".text-base": {
          fontSize: "1rem", // Will scale with html font-size
        },
        "@screen md": {
          html: {
            fontSize: "18px",
          },
        },
        "@screen xl": {
          html: {
            fontSize: "20px",
          },
        },
      });
    },
  ],
};
