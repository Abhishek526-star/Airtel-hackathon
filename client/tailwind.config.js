/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        airtel: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#E31E24', // Airtel Red Signature
          600: '#DC2626',
          700: '#B5121B', // Dark Red
          800: '#991B1B',
          900: '#7F1D1D',
        },
        slate: {
          850: '#172033',
          950: '#0B0F17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

