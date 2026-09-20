/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['Space Grotesk', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        ink: '#0b0f19',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,15,25,0.06), 0 8px 24px rgba(11,15,25,0.06)',
        pop: '0 12px 48px rgba(11,15,25,0.18)',
      },
    },
  },
  plugins: [],
}