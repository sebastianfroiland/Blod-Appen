/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#08080C',
        nightSoft: '#101019',
        nightCard: '#13131D',
        bone: '#F4F2EC',
        ash: '#7A7A8A',
        ashDim: '#3A3A48',
        neon: '#3DFF8F',
        neonDim: '#1F6B47',
        blood: '#FF3355',
        bloodDeep: '#C41E3A',
        amber: '#FFB23D'
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
