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
        stake_level_1: '#BE0369',
        stake_level_2: '#7B11A4',
        stake_level_3: '#421BD6',
        stake_level_4: '#266CDD',
        stake_level_5: '#01D8E4',
        modal_header_color1: '#FF97CF',
        modal_header_color2: '#7E0F1A',
        modal_stake_maturity_time: '#3FA54A',
        modal_unstake_header: '#872020',
      },
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
