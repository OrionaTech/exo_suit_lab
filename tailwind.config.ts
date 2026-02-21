import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        labBg: '#050510',
        holo: '#44f6ff',
        holoSoft: '#1e7ea8'
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 30px rgba(68, 246, 255, 0.3)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(68,246,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(68,246,255,0.06) 1px, transparent 1px)'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.75' }
        }
      },
      animation: {
        shimmer: 'shimmer 4s linear infinite',
        pulseGlow: 'pulseGlow 5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
