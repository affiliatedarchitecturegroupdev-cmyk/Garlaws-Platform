/** @type {import('tailwindcss').Config} */
export default {
  content: ['./apps/**/*.{html,ts}', './libs/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'garlaws-black': '#0b0c10',
        'garlaws-olive': '#2d3b2d',
        'garlaws-gold': '#c5a059',
        'garlaws-navy': '#1f2833',
        'garlaws-slate': '#45a29e',
        'light-grey': '#f4f4f4',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
};