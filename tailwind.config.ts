import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rust: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f6b978',
          400: '#f19341',
          500: '#ed7620',
          600: '#de5c14',
          700: '#b84413',
          800: '#933717',
          900: '#773016',
          950: '#40150a',
        },
        // Medieval Gold Colors
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a853',
          600: '#b8860b',
          700: '#92710c',
          800: '#78590e',
          900: '#5c4813',
          950: '#3d2e0a',
        },
        // Medieval Bronze
        bronze: {
          400: '#cd7f32',
          500: '#b87333',
          600: '#a0522d',
        },
        // Medieval Silver
        silver: {
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
        },
        metal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#1a1a1a',
        },
        radiation: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        blood: {
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
        },
      },
      fontFamily: {
        medieval: ['var(--font-medieval)', 'Georgia', 'serif'],
        'medieval-decorative': ['var(--font-medieval-decorative)', 'Georgia', 'serif'],
        display: ['var(--font-medieval)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'rust-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #2d1f1a 50%, #1a1a1a 100%)',
        'metal-texture': 'url("/textures/metal-texture.png")',
        'rust-texture': 'url("/textures/rust-texture.png")',
        'noise': 'url("/textures/noise.png")',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'flicker': 'flicker 0.15s infinite',
        'scan': 'scan 8s linear infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(237, 118, 32, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(237, 118, 32, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
      },
      boxShadow: {
        'rust': '0 0 30px rgba(237, 118, 32, 0.3)',
        'rust-lg': '0 0 60px rgba(237, 118, 32, 0.4)',
        'inner-rust': 'inset 0 0 30px rgba(237, 118, 32, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config
