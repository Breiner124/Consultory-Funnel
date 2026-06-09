/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "sans-serif"],
        sans: ["Manrope", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        ink: "#0B1220",
        "ink-soft": "#475569",
      },
    },
  },
  plugins: [],
};
