/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E855E9', // Pink from image
        secondary: '#9CA3AF',
      }
    },
  },
  plugins: [],
}
