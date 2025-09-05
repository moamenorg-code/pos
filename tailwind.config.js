/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,App,pages,hooks,screens}/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#14b8a6', // teal-500
          dark: '#0d9488',    // teal-600
          light: '#5eead4',   // teal-300
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500
          dark: '#475569',    // slate-600
          light: '#94a3b8',   // slate-400
        },
        'light-bg': '#f8fafc',      // slate-50
        'light-card': '#ffffff',
        'light-text': '#334155',    // slate-700
        'light-border': '#e2e8f0', // slate-200

        'dark-bg': '#0f172a',       // slate-900
        'dark-bg-alt': '#1e293b',   // slate-800
        'dark-card': '#1e293b',     // slate-800
        'dark-text': '#e2e8f0',     // slate-200
        'dark-border': '#334155',   // slate-700
      }
    }
  },
  plugins: [],
}