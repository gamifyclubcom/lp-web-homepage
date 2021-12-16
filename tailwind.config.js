const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
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
        interpurp: {
          DEFAULT: '#BE0269',
        },
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
        fuchsia: {
          800: '#35184D',
        },
        stake_level_1: '#C0B290',
        stake_level_2: '#789173',
        stake_level_3: '#73AA8B',
        stake_level_4: '#6DC2A3',
        stake_level_5: '#62F3D4',
        modal_header_color1: '#FF97CF',
        modal_header_color2: '#7E0F1A',
        modal_stake_maturity_time: '#3FA54A',
        modal_unstake_header: '#872020',
        pool_title: '#733434',
        staking: '#022BBE',
        gcpurp: {
          200: 'rgba(217,191,245,1)'
        },
        pool_focus_1: '#6398FF',
        staking_btn: '#8A2020',
        staking_gmfc: '#AEAEAE',
        staking_unstake: '#FA0A00'
      },
      backgroundImage: {
        'pools-voting-list': "url('/images/gamify_bg_orb.jpeg')",
        'pools-dashboard': "url('/images/gamify_bg_orb.jpeg')",
      },
      backgroundImage: {
        'hero-pattern': "url('/images/gamify_bg_orb.jpeg')",
      },
      backgroundSize: {
        '100%': '100%',
        '190%': '190%',
      },
      backgroundPosition: {
        'center-50%': 'center 50%',
      },
      backgroundColor: {
        D01F36: '#D01F36',
        '1C0045': '#1C0045',
        '3232DC': '#3232DC',
        '38383D': '#38383D',
        222228: '#222228',
        '1e1945': '#1e1945',
        '303035': '#303035',
        pool_focus_1: '#6398FF',
        'B91D1D': '#B91D1D',
        '191920': '#191920',
        '8A2020': '#8A2020',
        '44454B': '#44454B',
        'B8B8FF': '#B8B8FF',
        'FA0A00': '#FA0A00'
      },
      borderColor: {
        '20459B': '#20459B',
        '6398FF': '#6398FF',
        '37373D': '#37373D',
        '8A2020': '#8A2020'
      },
      padding: {
        325: '325px',
      },
      height: {
        '10v': '10vh',
        '20v': '20vh',
        '30v': '30vh',
        '40v': '40vh',
        '50v': '50vh',
        '60v': '60vh',
        '70v': '70vh',
        '80v': '80vh',
        '90v': '90vh',
        '100v': '100vh',
        '7p': '7px',
        '46p': '46px'
      },
      width: {
        '300p': '300px',
        '200p': '200px',
        '46p': '46px'
      },
      fontSize: {
        '4.25xl': ['4.25rem', '5rem'],
        '1.5xl': ['1.5rem', '1.5rem'],
        '1.5xl2': ['1.25rem', '1.5rem'],
        '1.125lg': ['1.125rem', '1.625rem'],
        '15px': '15px',
        'xss': ['0.625rem', '0.875rem'],
      },
      minWidth: {
        '280px': '280px',
        '300px': '300px'
      },
      maxWidth: {
        '658px': '41.125rem',
        '369px': '369px'
      },
      animation: {
        'hk_wiggle': 'hk_wiggle 10s linear infinite',
      },
      keyframes: {
        hk_wiggle: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-924px)' },
        }
      },
      dropShadow: {
        '4px': '0px 4px 4px rgba(0, 0, 0, 0.25)'
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
