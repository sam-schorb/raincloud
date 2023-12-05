module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
      extend: {
          fontSize: {
              'icon-lg': '2rem',
          },
          backgroundImage: theme => ({
            'gradient-medium-to-true-gray': `linear-gradient(to bottom, ${theme('backgroundColor.true-gray')}, ${theme('backgroundColor.true-gray')})`
          }),
          backgroundColor: {
              'light-gray': '#b3b3b3',
              'vdark-gray': '#1a1a1a',
              'dark-gray': '#262626',
              'medium-gray': '#4d4d4d',
              'true-gray': '#6b6a6a',
          },
          textColor: {  // Add this property
              'medium-gray': '#262626',
              'true-gray': '#6b6a6a',
              'light-gray': '#b3b3b3'

          },
          placeholderColor: { // Add this property
            'true-gray': '#6b6a6a',
        },
        borderColor: {
          'true-gray': '#6b6a6a',
          'medium-gray': '#4d4d4d',
          'dark-gray': '#262626',


        }
      
    },
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '800px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1500px',
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
