/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        saludar: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "10%, 30%":       { transform: "rotate(20deg)" },
          "20%, 40%":       { transform: "rotate(-10deg)" },
        },
      },
      animation: {
        saludar: "saludar 2s ease-in-out infinite 1s",
      },
    },
  },
  plugins: [],
}