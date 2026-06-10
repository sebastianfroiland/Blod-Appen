/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F0',
        ink: '#1A1A2E',
        blood: '#C41E3A',
        rose: '#E8556D',
        green: '#15A86B',
        amber: '#D98A1F',
        ash: '#797986'
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.04em'
      }
    }
  },
  plugins: []
}
