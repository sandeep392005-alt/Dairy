/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f5f1e8',
        ivory: '#fffdf8',
        meadow: '#40634a',
        sage: '#87a97f',
        bark: '#704f37',
        soil: '#9a7b5f',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(64, 99, 74, 0.12)',
      },
    },
  },
  plugins: [],
};
