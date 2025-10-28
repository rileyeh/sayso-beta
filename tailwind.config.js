/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sayso: {
          pink: '#F8D5D3',
          red: '#ED6228',
          blue: '#D3E3E6',
          green: '#BDA632',
          cream: '#FBE2C4',
          brown: '#5B5020',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        caveat: ['Caveat', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
}
