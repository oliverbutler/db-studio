const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.emerald,
        secondary: colors.teal,
        dark: { ...colors.zinc, 950: '#101012' },
      },
    },
  },
  plugins: [],
};
