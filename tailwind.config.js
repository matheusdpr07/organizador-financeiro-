/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilita o modo escuro via classe CSS
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f0ff',
          100: '#ede4ff',
          200: '#d9ccff',
          300: '#bca3ff',
          400: '#9b6eff',
          500: '#820ad1', 
          600: '#7209b7',
          700: '#5e0796',
          800: '#4b0678',
          900: '#3c0561',
        }
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
