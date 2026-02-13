/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e83e0b', // 默认值，用于 bg-brand, text-brand 等
          50: '#fdf3f0',
          100: '#fbe5dd',
          200: '#f8cbbd',
          300: '#f3a690',
          400: '#ee7a5d',
          500: '#e83e0b', // Base color from logo
          600: '#ca2b08',
          700: '#a52109',
          800: '#861e0d',
          900: '#6d1c0f',
          950: '#3d0b05',
        }
      }
    },
  },
  plugins: [],
}
