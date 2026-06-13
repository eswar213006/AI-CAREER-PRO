/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F19',
          card: '#161F30',
          border: '#22324D',
          hover: '#1D2A43',
        },
        primary: {
          50: '#F0F5FF',
          100: '#E1E9FF',
          200: '#B8CBFF',
          300: '#8FAEFF',
          400: '#6690FF',
          500: '#3D73FF',
          600: '#0047FF',
          700: '#0036C2',
          800: '#002585',
          900: '#001447',
        },
        accent: {
          purple: '#A855F7',
          pink: '#EC4899',
          cyan: '#06B6D4',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
