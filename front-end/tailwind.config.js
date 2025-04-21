/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        light: '#f8fafc',
        secondary: '#f1f5f9',
        accent: '#e2e8f0',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 5s infinite',
        'shimmer': 'shimmer 23s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '13%': { backgroundPosition: '1000px 0' },
          '13.1%, 100%': { backgroundPosition: '1000px 0' }
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // Make sure all color-related core plugins are enabled
    backgroundColor: true,
    textColor: true,
    borderColor: true,
  },
  // Enable just-in-time mode for faster builds and more dynamic utilities
  future: {
    hoverOnlyWhenSupported: true,
  },
} 