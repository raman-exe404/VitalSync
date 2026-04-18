/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#C0392B',
        safe: '#27AE60',
        warn: '#F39C12',
        danger: '#E74C3C'
      }
    }
  },
  plugins: []
};
