/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#FF6B00',
          light: '#FF8C38',
          dark: '#E05A00',
          50: '#FFF4EC',
          100: '#FFE4CC',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
