/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mafia: {
          black: '#0a0a0a',
          darkgray: '#1a1a1a',
          red: '#8B0000',
          gold: '#FFD700',
          lightgold: '#FFF4CC',
          crimson: '#DC143C',
          smoke: '#2a2a2a',
        }
      },
      fontFamily: {
        'cinzel': ['Cinzel Decorative', 'serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
      }
    },
  },
  plugins: [],
}
