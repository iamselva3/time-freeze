/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/admin/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        oxblood: {
          950: '#120202',
          900: '#220404',
          800: '#3D0505',
          700: '#5A0202',
          600: '#7A0000', // core brand oxblood
          500: '#940606',
          400: '#B81414',
          300: '#D63C3C',
        },
        gold: {
          50: '#FFFDF7',
          100: '#FFF8E6',
          200: '#FDF1CE',
          300: '#FCE095', // brand highlight gold
          400: '#F6E3B0',
          500: '#E8C57A', // signature champagne gold
          600: '#C99F55',
          700: '#9E7632',
          800: '#75541E',
          900: '#523912',
        },
        ivory: {
          50: '#FDFBF8',
          100: '#F5EFE6', // warm ivory
          200: '#EAE1D3',
          300: '#D8CAB5',
          400: '#C4B299',
        },
        charcoal: {
          950: '#0A0606', // deepest warm black
          900: '#120C0C', // warm near-black canvas
          850: '#161010',
          800: '#1D1515',
          750: '#241B1B',
          700: '#2E2323',
          600: '#3F3232',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Playfair Display', 'serif'],
        sans: ['"Inter"', 'DM Sans', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gold-subtle': '0 0 25px rgba(232, 197, 122, 0.15)',
        'gold-glow': '0 0 35px rgba(252, 224, 149, 0.28)',
        'oxblood-deep': '0 20px 50px rgba(18, 2, 2, 0.8)',
      },
      letterSpacing: {
        'widest-luxury': '0.25em',
        'super-wide': '0.35em',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
