/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#F48C25',
        'critical-red': '#FF3B30',
        'water-blue': '#007AFF',
        'surface-light': '#F3F4F6', // Tailwind gray-100 for better contrast against white cards
        'surface-dark': '#1C1C1E',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(0,0,0,0.06), 0 6px 20px -4px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.14), 0 16px 40px -8px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '20px', // Exact 20px soft rounding requested
        '3xl': '28px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        marquee: 'marquee 10s linear infinite',
      }
    },
  },
  plugins: [],
}
