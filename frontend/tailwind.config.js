/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fbf7f0',
        ink: '#2b2118',
        leather: {
          50: '#fbf3ea',
          100: '#f4e2cc',
          200: '#e8c49b',
          300: '#d9a066',
          400: '#c98243',
          500: '#b0662c',
          600: '#8f4f22',
          700: '#6f3c1c',
          800: '#4f2b16',
          900: '#331c0f',
        },
        sage: {
          100: '#e3ece1',
          600: '#4f7a4a',
          700: '#3d6139',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};
