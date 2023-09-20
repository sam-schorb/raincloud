module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontSize: {
        'icon-lg': '2rem',  // You can adjust this as needed
      },
      backgroundColor: {
        'light-gray': '#b3b3b3',
        'vdark-gray': '#1a1a1a',
        'dark-gray': '#262626',
        'medium-gray': '#4d4d4d',
        'true-gray': '#7A7A7A', 
      }
    },
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    }
  },
  variants: {
    extend: {
      display: ['responsive'], // Adding responsive variant for display utility
      gridTemplateColumns: ['responsive'], // Adding responsive variant for gridTemplateColumns
      // You can extend other utilities in a similar manner if needed.
    },
  },
  plugins: [],
}
