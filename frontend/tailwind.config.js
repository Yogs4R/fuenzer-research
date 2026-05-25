/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        alabaster: '#FAFAFA',
        slate: {
          900: '#0F172A',
          700: '#334155',
          500: '#64748B',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        card: '0px 4px 20px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'text-rotate': {
          '0%, 15%': { transform: 'translateY(0)' },
          '20%, 35%': { transform: 'translateY(-20%)' },
          '40%, 55%': { transform: 'translateY(-40%)' },
          '60%, 75%': { transform: 'translateY(-60%)' },
          '80%, 95%': { transform: 'translateY(-80%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '10%': { opacity: '1', transform: 'translateY(0)' },
          '90%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
      animation: {
        progress: 'progress 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin 10s linear infinite reverse',
        'text-rotate': 'text-rotate 8s infinite',
        marquee: 'marquee 25s linear infinite',
        'slide-up-fade': 'slide-up-fade 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
