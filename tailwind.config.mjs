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
    // Ensure admin routes are included
    './src/app/(payload)/admin/**/*.{ts,tsx}',
    './src/components/admin/**/*.{ts,tsx}',
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
    // Design System Spacing
    'py-section-sm',
    'py-section',
    'py-section-md', 
    'py-section-lg',
    'mb-content-sm',
    'mb-content',
    'mb-content-lg',
    'gap-grid-sm',
    'gap-grid',
    'px-container-sm',
    'px-container',
    'px-container-lg',
    // Line clamp utilities
    'line-clamp-1',
    'line-clamp-2',
    'line-clamp-3',
    'line-clamp-4',
    // Admin dashboard status colors
    'bg-yellow-100',
    'text-yellow-800',
    'border-yellow-300',
    'bg-blue-100',
    'text-blue-800',
    'border-blue-300',
    'bg-green-100',
    'text-green-800',
    'border-green-300',
    'bg-gray-100',
    'text-gray-800',
    'border-gray-300',
    'bg-red-100',
    'text-red-800',
    'border-red-300',
    'bg-orange-100',
    'text-orange-800',
    'border-orange-300',
    // Admin dashboard colored backgrounds
    'bg-yellow-50',
    'bg-blue-50',
    'bg-green-50',
    'bg-red-50',
    'bg-orange-50',
    'bg-gray-50',
    // Admin dashboard text colors
    'text-yellow-600',
    'text-blue-600',
    'text-green-600',
    'text-red-600',
    'text-orange-600',
    'text-gray-600',
    // Admin dashboard border colors
    'border-l-blue-500',
    'border-l-yellow-500',
    'border-l-green-500',
    'border-l-red-500',
    'border-l-orange-500',
    // Ring colors for selection
    'ring-2',
    'ring-orange-500',
    'ring-blue-500',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        'DEFAULT': '1rem',     // px-4 - mobile
        'sm': '1rem',          // px-4 - small screens
        'md': '1.5rem',        // px-6 - medium screens  
        'lg': '2rem',          // px-8 - large screens
        'xl': '2rem',          // px-8 - extra large screens
        '2xl': '2rem',         // px-8 - 2xl screens
      },
      screens: {
        'sm': '40rem',         // 640px
        'md': '48rem',         // 768px  
        'lg': '64rem',         // 1024px
        'xl': '80rem',         // 1280px
        '2xl': '86rem',        // 1376px
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
        // Legacy header spacing (maintain compatibility)
        'header-x': '1rem',        // 16px - consistent horizontal spacing
        'header-y': '1rem',        // 16px - consistent vertical spacing
        'nav-gap': '0.5rem',       // 8px - navigation items gap
        'section-gap': '1.5rem',   // 24px - section spacing
        'action-gap': '1rem',      // 16px - action items gap
        
        // New Design System Spacing
        'section-sm': '3rem',      // 48px - small section padding
        'section': '4rem',         // 64px - default section padding (py-16)
        'section-md': '5rem',      // 80px - medium section padding (py-20)
        'section-lg': '6rem',      // 96px - large section padding (py-24)
        'content-sm': '2rem',      // 32px - small content spacing (mb-8)
        'content': '3rem',         // 48px - default content spacing (mb-12)
        'content-lg': '4rem',      // 64px - large content spacing (mb-16)
        'grid-sm': '1.5rem',       // 24px - small grid gap (gap-6)
        'grid': '2rem',            // 32px - default grid gap (gap-8)
        'container-sm': '1rem',    // 16px - small container padding (px-4)
        'container': '1.5rem',     // 24px - medium container padding (px-6)
        'container-lg': '2rem',    // 32px - large container padding (px-8)
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
              '--tw-prose-body': 'hsl(var(--foreground))',
              '--tw-prose-headings': 'hsl(var(--foreground))',
              '--tw-prose-lead': 'hsl(var(--foreground))',
              '--tw-prose-links': 'hsl(var(--primary))',
              '--tw-prose-bold': 'hsl(var(--foreground))',
              '--tw-prose-counters': 'hsl(var(--muted-foreground))',
              '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
              '--tw-prose-hr': 'hsl(var(--border))',
              '--tw-prose-quotes': 'hsl(var(--foreground))',
              '--tw-prose-quote-borders': 'hsl(var(--border))',
              '--tw-prose-captions': 'hsl(var(--muted-foreground))',
              '--tw-prose-code': 'hsl(var(--foreground))',
              '--tw-prose-pre-code': 'hsl(var(--foreground))',
              '--tw-prose-pre-bg': 'hsl(var(--muted))',
              '--tw-prose-th-borders': 'hsl(var(--border))',
              '--tw-prose-td-borders': 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              h1: {
                color: 'hsl(var(--foreground))',
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
              h2: {
                color: 'hsl(var(--foreground))',
              },
              h3: {
                color: 'hsl(var(--foreground))',
              },
              h4: {
                color: 'hsl(var(--foreground))',
              },
              h5: {
                color: 'hsl(var(--foreground))',
              },
              h6: {
                color: 'hsl(var(--foreground))',
              },
              p: {
                color: 'hsl(var(--foreground))',
              },
              strong: {
                color: 'hsl(var(--foreground))',
              },
              blockquote: {
                color: 'hsl(var(--foreground))',
              },
              'blockquote p:first-of-type::before': {
                content: 'none',
              },
              'blockquote p:last-of-type::after': {
                content: 'none',
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
