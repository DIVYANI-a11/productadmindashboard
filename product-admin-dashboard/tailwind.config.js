/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12181B",
        canvas: "#F7F6F3",
        line: "#E1DED6",
        brand: {
          50: "#EFF6F3",
          100: "#D7E9E0",
          400: "#3E8E71",
          500: "#2E7259",
          600: "#245C47",
          700: "#1B4636",
        },
        rust: "#B5502E",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(18,24,27,0.06), 0 1px 1px 0 rgba(18,24,27,0.04)",
      },
    },
  },
  plugins: [],
};
