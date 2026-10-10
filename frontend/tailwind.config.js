/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0f172a',
          dark: '#0a0f1d',
          card: '#1e293b',
          teal: '#0d9488',
          tealLight: '#14b8a6',
          tealMuted: 'rgba(13, 148, 136, 0.15)',
          slate: '#334155',
          lightBg: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
