import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // More specific patterns for better performance
    './src/components/**/*.{ts,tsx}',
    './src/blocks/**/*.{ts,tsx}',
    './src/heros/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    // Include utilities for dynamic class generation
    './src/utilities/**/*.{ts,tsx}',
    './src/providers/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    // Grid spans
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    // Card states
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
    // Animation classes for dynamic content
    'animate-in',
    'animate-out',
    'fade-in',
    'fade-out',
    'slide-in-from-top',
    'slide-in-from-bottom',
    'slide-in-from-left',
    'slide-in-from-right',
    'zoom-in',
    'zoom-out',
    // Motion and transform classes
    'transform-gpu',
    'will-change-transform',
    'will-change-auto',
    // Dynamic spacing that might be generated
    'pt-16',
    'pb-16',
    'pt-12',
    'pb-12',
    'mt-8',
    'mb-8',
    // Line clamp utilities
    'line-clamp-1',
    'line-clamp-2',
    'line-clamp-3',
    'line-clamp-4',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        'header-x': '1rem',        // 16px - consistent horizontal spacing
        'header-y': '1rem',        // 16px - consistent vertical spacing
        'nav-gap': '0.5rem',       // 8px - navigation items gap
        'section-gap': '1.5rem',   // 24px - section spacing
        'action-gap': '1rem',      // 16px - action items gap
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
        sans: ['var(--font-geist-sans)'],
        'arabic-sans': ['var(--font-arabic-noto)', 'Noto Sans Arabic', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
        'arabic-display': ['var(--font-arabic-cairo)', 'Cairo', 'Noto Sans Arabic', 'Segoe UI', 'sans-serif'],
        'arabic-tajawal': ['var(--font-arabic-tajawal)', 'Tajawal', 'Arial', 'sans-serif'],
        'arabic-amiri': ['var(--font-arabic-amiri)', 'Amiri', 'Times New Roman', 'serif'],
      },
      fontSize: {
        // Enhanced sizing for Arabic text
        'xs': ['0.75rem', { lineHeight: '1.6' }],
        'sm': ['0.875rem', { lineHeight: '1.7' }],
        'base': ['1rem', { lineHeight: '1.75' }],
        'lg': ['1.125rem', { lineHeight: '1.8' }],
        'xl': ['1.25rem', { lineHeight: '1.8' }],
        '2xl': ['1.5rem', { lineHeight: '1.7' }],
        '3xl': ['1.875rem', { lineHeight: '1.6' }],
        '4xl': ['2.25rem', { lineHeight: '1.5' }],
        '5xl': ['3rem', { lineHeight: '1.4' }],
        '6xl': ['3.75rem', { lineHeight: '1.3' }],
        '7xl': ['4.5rem', { lineHeight: '1.2' }],
        '8xl': ['6rem', { lineHeight: '1.1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Arabic-specific sizes
        'arabic-sm': ['1rem', { lineHeight: '1.8', letterSpacing: '0.01em' }],
        'arabic-base': ['1.125rem', { lineHeight: '1.9', letterSpacing: '0.01em' }],
        'arabic-lg': ['1.25rem', { lineHeight: '1.9', letterSpacing: '0.005em' }],
        'arabic-xl': ['1.5rem', { lineHeight: '1.8', letterSpacing: '0.005em' }],
        'arabic-display': ['2rem', { lineHeight: '1.6', letterSpacing: '0' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
