/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
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
      },
      fontFamily: {
        gmarket: ["GmarketSans", "sans-serif"],
      },
    },
  },
};
