/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#0F172A',
          950: '#0A0F1D',
        },
        soc: {
          primary: '#1E3A8A',     // Deep Navy
          accent: '#2563EB',      // Blue
          surface: '#F8FAFC',     // Clean Light Surface
          border: '#E2E8F0',      // Subtle Gray Border
          danger: '#DC2626',      // Red for critical risk only
          warning: '#EA580C',     // Orange for high risk only
          caution: '#D97706',     // Amber for medium risk
          success: '#16A34A',     // Green
        }
      }
    },
  },
  plugins: [],
}
