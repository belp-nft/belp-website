/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/**/*.{js,ts,jsx,tsx,mdx}"],
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
          fontSize: "14px", // Default mobile size - giảm từ 16px
        },
        body: {
          fontSize: "1rem",
          color: "#1C007C !important", // Force default text color
        },
        // Apply base styles to all text elements
        "p, span, div, a, li, td, th, label, input, textarea, button": {
          fontSize: "1rem", // Will scale with html font-size
          color: "#1C007C", // Default text color
        },
        // Headings with relative sizes
        h1: {
          fontSize: "2.5rem",
          fontWeight: "700",
          color: "#1C007C",
        },
        h2: {
          fontSize: "2rem",
          fontWeight: "600",
          color: "#1C007C",
        },
        h3: {
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#1C007C",
        },
        h4: {
          fontSize: "1.25rem",
          fontWeight: "500",
          color: "#1C007C",
        },
        h5: {
          fontSize: "1.125rem",
          fontWeight: "500",
          color: "#1C007C",
        },
        h6: {
          fontSize: "1rem",
          fontWeight: "500",
          color: "#1C007C",
        },
        // Make text-base responsive by default
        ".text-base": {
          fontSize: "1rem", // Will scale with html font-size
        },
        // Mobile first approach - từ nhỏ đến lớn
        "@media (max-width: 639px)": {
          html: {
            fontSize: "14px", // Mobile - giảm từ 16px
          },
        },
        "@screen sm": {
          html: {
            fontSize: "15px", // Large mobile - giảm từ 18px
          },
        },
        "@screen md": {
          html: {
            fontSize: "16px", // Tablet - giảm từ 20px
          },
        },
        "@screen lg": {
          html: {
            fontSize: "17px", // Desktop - giảm từ 22px
          },
        },
        "@screen xl": {
          html: {
            fontSize: "18px", // Large desktop - giảm từ 24px
          },
        },
      });
    },
  ],
};
