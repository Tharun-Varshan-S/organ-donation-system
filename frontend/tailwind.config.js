/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'blood-flow-enhanced': 'blood-flow-enhanced linear infinite',
      },
      keyframes: {
        'blood-flow-enhanced': {
          '0%': {
            transform: 'translateY(-10vh) translateX(0) rotate(0deg)',
            opacity: '0',
          },
          '10%': {
            opacity: 'var(--opacity, 0.6)',
          },
          '90%': {
            opacity: 'var(--opacity, 0.6)',
          },
          '100%': {
            transform: 'translateY(110vh) translateX(var(--drift-x, 20px)) rotate(360deg)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}
