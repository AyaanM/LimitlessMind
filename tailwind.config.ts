import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#EFF7FB',
        card: '#FFFFFF',
        surface: '#E6F3ED',
        border: '#C4DDE9',
        accent: {
          DEFAULT: '#3D8FB5',
          hover: '#2E7EA3',
          light: '#D6EDF7',
          foreground: '#FFFFFF',
        },
        sage: {
          DEFAULT: '#4FA87A',
          hover: '#3E9469',
          light: '#D5EFDF',
        },
        premium: {
          DEFAULT: '#7B6B52',
          light: '#F0EAE0',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#E6F3ED',
          foreground: '#4E7A8A',
        },
        foreground: '#1B3A4B',
        destructive: {
          DEFAULT: '#B07070',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs:   ['0.75rem', { lineHeight: '1.4' }],
        sm:   ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg:   ['1.125rem', { lineHeight: '1.6' }],
        xl:   ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.09)',
        focus: '0 0 0 3px rgba(91,127,166,0.35)',
      },
      maxWidth: {
        content: '1200px',
        reading: '720px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
