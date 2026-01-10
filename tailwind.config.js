import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        main: {
          'primary': '#818CF8',
          'secondary': '#38BDF8',
          'accent': '#F471B5',
          'neutral': '#1E293B',
          'base-100': '#000000',
          'info': '#0CA5E9',
          'success': '#2DD4BF',
          'warning': '#F4BF50',
          'error': '#FB7085',
        },
      },
    ],
  },
}
