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
      animation: {
        progress: 'progress 2s ease-in-out infinite',
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
