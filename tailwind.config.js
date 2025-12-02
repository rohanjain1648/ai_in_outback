/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Australian-inspired color palette
        'outback': {
          50: '#fef7ed',
          100: '#fdebd4',
          200: '#fad4a8',
          300: '#f6b571',
          400: '#f18d38',
          500: '#ed6f16',
          600: '#de550c',
          700: '#b83f0c',
          800: '#933211',
          900: '#762b12',
        },
        'eucalyptus': {
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bce5cd',
          300: '#8dd1ab',
          400: '#57b882',
          500: '#339e63',
          600: '#26804f',
          700: '#206641',
          800: '#1d5236',
          900: '#19432d',
        },
        'bushland': {
          50: '#f7f6f3',
          100: '#ede9e1',
          200: '#ddd4c4',
          300: '#c7b89e',
          400: '#b19a79',
          500: '#a08660',
          600: '#937654',
          700: '#7a6147',
          800: '#65513e',
          900: '#544335',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}