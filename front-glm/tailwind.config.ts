/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#FAF8F3',
          100: '#F5F0E8',
          200: '#EDE6DA',
          300: '#E2D5C4',
          400: '#D4C4A7',
          500: '#C9B896',
          600: '#BFA883',
          700: '#B0A48C',
          800: '#8B7D66',
          900: '#6B5D4A',
        },
        warm: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F5EFE6',
          300: '#EDE4D4',
          400: '#E0D1B8',
          500: '#D4C4A7',
          600: '#C4AF94',
          700: '#B09D80',
          800: '#8B7355',
          900: '#5C4D38',
          950: '#3D3426',
        },
        accent: {
          rose: '#C67B5C',
          green: '#7BA37C',
          blue: '#5B89AD',
          lavender: '#E8E0D4',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.15', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        'h2': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.375rem', { lineHeight: '1.35', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(107, 93, 74, 0.06)',
        'card': '0 4px 24px rgba(107, 93, 74, 0.08)',
        'card-hover': '0 12px 40px rgba(107, 93, 74, 0.14)',
        'warm': '0 4px 20px rgba(180, 168, 131, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'heart-beat': 'heartBeat 0.4s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        heartBeat: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(1)' },
          '75%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
