/** privtr.ee — configuración única de Tailwind.
 *  Sustituye a los bloques `tailwind.config` en línea que había en cada HTML.
 *  Build: ./build.sh  (usa el CLI standalone de Tailwind, sin Node).
 */
module.exports = {
  content: ['./*.html', './js/*.js'],
  theme: {
    extend: {
      colors: {
        void: '#05070a',
        panel: '#0b0f14',
        neon: '#0a84ff',
        'neon-glow': '#3b9eff',
        steel: '#8b9bb4',
        mist: '#c5d0e0',
        line: '#1c2330',
        paper: '#f2f4f7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn .6s ease-out forwards',
        'slide-up': 'slideUp .55s ease-out forwards',
        float: 'float 7s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  corePlugins: { preflight: true },
};
