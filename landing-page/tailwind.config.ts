/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#ef6c3e',
        'brand-strong': '#d35a2f',
        accent: '#0f766e',
        'surface-2': '#fff0e4',
        line: '#ebd6cc',
        muted: '#75636f',
        'app-text': '#2a2127',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.015em',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        card: '0 22px 44px -32px rgba(101, 60, 32, 0.75)',
        panel: '0 30px 60px -48px rgba(89, 45, 22, 0.85)',
        brand: '0 14px 28px -18px rgba(211, 90, 47, 0.95)',
        'brand-lg': '0 24px 48px -20px rgba(211, 90, 47, 0.45)',
      },
      borderRadius: {
        card: '1.35rem',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #fff7f2 0%, #fff0e4 50%, #ffe6d8 100%)',
        'brand-gradient': 'linear-gradient(135deg, #ef6c3e 0%, #d35a2f 100%)',
        'teal-gradient': 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
      },
    },
  },
  plugins: [],
};
