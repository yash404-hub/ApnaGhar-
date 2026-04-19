/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          light: '#f0f4ff',
          DEFAULT: '#6366f1',
          dark: '#4338ca',
        }
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }
    },
  },
  plugins: [],
}
