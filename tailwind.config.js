/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Crimson Text', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'warm': {
          50: '#FBF9F7',
          100: '#F8F6F3',
          200: '#F0EDE8',
          300: '#E8E3DD',
          400: '#D4CCC3',
          500: '#B8AA9E',
          600: '#9C8A7A',
          700: '#7A6B5C',
          800: '#5C4F42',
          900: '#2C1810',
        },
        'accent': {
          50: '#FEF7ED',
          100: '#FDEDD3',
          200: '#FBD9A5',
          300: '#F9C16D',
          400: '#F7A332',
          500: '#F58B0A',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
};