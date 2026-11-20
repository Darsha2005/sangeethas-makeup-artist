/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#061c16',
          900: '#092820', // Dark Green
          850: '#0e332a',
          800: '#123D32', // Deep Emerald Green
          700: '#1a5445',
          600: '#23735e',
          500: '#2e967b',
          100: '#e3f2ee',
          50: '#f0f7f5',
        },
        gold: {
          700: '#8a6a24',
          600: '#b08b35',
          500: '#D6B36A', // Champagne Gold
          400: '#e2c586',
          300: '#edd8a6',
          200: '#f5ebcc',
          100: '#fbf6e8',
          50: '#fdfbf6',
        },
        ivory: {
          DEFAULT: '#FAF7F0', // Warm Ivory
          50: '#fdfcf9',
          100: '#FAF7F0',
          200: '#EDE5D8', // Soft Beige
          300: '#dfd4c1',
          400: '#c5b59a',
        },
        charcoal: {
          DEFAULT: '#242424',
          light: '#3a3a3a',
          muted: '#5e5e5e',
        }
      },
      fontFamily: {
        brand: ['Cinzel', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(9, 40, 32, 0.08), 0 4px 10px -2px rgba(9, 40, 32, 0.04)',
        'gold': '0 4px 20px -2px rgba(214, 179, 106, 0.35)',
        'gold-lg': '0 10px 30px -5px rgba(214, 179, 106, 0.45)',
      },
      backgroundImage: {
        'grad-sidebar': 'linear-gradient(180deg, #123D32 0%, #092820 100%)',
        'grad-gold': 'linear-gradient(135deg, #D6B36A 0%, #edd8a6 50%, #b08b35 100%)',
        'grad-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 247, 240, 0.85) 100%)',
      }
    },
  },
  plugins: [],
}
