const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        sm: '320px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      colors: {
        primary: {
          100: '#E0C4F5',
          200: '#BF8DEC',
          300: '#8A4FC7',
          400: '#53238F',
          500: '#1C0045',
          600: '#15003B',
          700: '#100031',
          800: '#0B0028',
          900: '#070021',
        },
        secondary: {
          100: '#D6D6FD',
          200: '#ADADFB',
          300: '#8383F4',
          400: '#6262EA',
          500: '#3232DC',
          600: '#2424BD',
          700: '#19199E',
          800: '#0F0F7F',
          900: '#090969',
        },
      },
      backgroundImage: {
        'hero-pattern': "url('/images/gamify_bg_orb.jpeg')"
      },
      backgroundSize: {
        '100%': '100%'
      },
      backgroundPosition: {
        'center-60%': 'center 60%'
      },
      backgroundColor: {
        'D01F36': '#D01F36',
        '1C0045': '#1C0045',
        '3232DC': '#3232DC',
        '38383D': '#38383D',
        '222228': '#222228',
      },
      padding: {
        '325': '325px'
      },
      height: {
        "10v": "10vh",
        "20v": "20vh",
        "30v": "30vh",
        "40v": "40vh",
        "50v": "50vh",
        "60v": "60vh",
        "70v": "70vh",
        "80v": "80vh",
        "90v": "90vh",
        "100v": "100vh",
      },
      fontSize: {
        '4.25xl': ['4.25rem', '5rem'],
        '1.5xl': ['1.5rem', '1.5rem'],
        '1.5xl2': ['1.25rem', '1.5rem'],
        '1.125lg': ['1.125rem', '1.625rem'],
        '15px': '15px'
      }
    },
    fontFamily: {
      sans: ['Gilroy', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times, serif'],
      mono: [
        'ui-monospace',
        'Menlo',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace',
      ],
    },
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
