/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        enspd: {
          primary: '#1e40af', // Blue
          secondary: '#f59e0b', // Amber
          accent: '#10b981', // Emerald
        },
      },
    },
  },
  plugins: [],
}