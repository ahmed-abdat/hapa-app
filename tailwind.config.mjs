import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
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
              // Base typography with HAPA brand colors
              '--tw-prose-body': 'hsl(var(--foreground))',
              '--tw-prose-headings': 'hsl(var(--foreground))',
              '--tw-prose-lead': 'hsl(var(--muted-foreground))',
              '--tw-prose-links': 'hsl(var(--primary))',
              '--tw-prose-bold': 'hsl(var(--primary))',
              '--tw-prose-counters': 'hsl(var(--primary))',
              '--tw-prose-bullets': 'hsl(var(--primary))',
              '--tw-prose-hr': 'hsl(var(--border))',
              '--tw-prose-quotes': 'hsl(var(--foreground))',
              '--tw-prose-quote-borders': 'hsl(var(--secondary))',
              '--tw-prose-captions': 'hsl(var(--muted-foreground))',
              '--tw-prose-code': 'hsl(var(--primary))',
              '--tw-prose-pre-code': 'hsl(var(--primary-foreground))',
              '--tw-prose-pre-bg': 'hsl(var(--muted))',
              '--tw-prose-th-borders': 'hsl(var(--border))',
              '--tw-prose-td-borders': 'hsl(var(--border))',
              
              // Enhanced typography styles
              maxWidth: 'none',
              fontSize: '1rem',
              lineHeight: '1.7',
              
              h1: {
                fontWeight: '700',
                fontSize: '2.5rem',
                lineHeight: '1.2',
                marginBottom: '1.5rem',
                marginTop: '0',
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                backgroundClip: 'text',
                color: 'transparent',
              },
              
              h2: {
                fontWeight: '600',
                fontSize: '2rem',
                lineHeight: '1.3',
                marginTop: '2rem',
                marginBottom: '1rem',
                color: 'hsl(var(--primary))',
                borderBottom: '2px solid hsl(var(--primary) / 0.2)',
                paddingBottom: '0.5rem',
              },
              
              h3: {
                fontWeight: '600',
                fontSize: '1.5rem',
                marginTop: '1.5rem',
                marginBottom: '0.75rem',
                color: 'hsl(var(--accent))',
              },
              
              h4: {
                fontWeight: '600',
                fontSize: '1.25rem',
                marginTop: '1.25rem',
                marginBottom: '0.5rem',
              },
              
              p: {
                marginBottom: '1.25rem',
                fontSize: '1rem',
                lineHeight: '1.7',
              },
              
              a: {
                color: 'hsl(var(--primary))',
                textDecoration: 'none',
                fontWeight: '500',
                borderBottom: '1px solid hsl(var(--primary) / 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'hsl(var(--accent))',
                  borderBottomColor: 'hsl(var(--accent))',
                },
              },
              
              strong: {
                color: 'hsl(var(--primary))',
                fontWeight: '600',
              },
              
              blockquote: {
                borderLeft: '4px solid hsl(var(--secondary))',
                backgroundColor: 'hsl(var(--secondary) / 0.05)',
                padding: '1.5rem',
                margin: '2rem 0',
                borderRadius: '0 0.75rem 0.75rem 0',
                fontStyle: 'normal',
                fontSize: '1.125rem',
                fontWeight: '500',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  width: '2rem',
                  height: '2rem',
                  background: 'hsl(var(--secondary) / 0.2)',
                  borderRadius: '50%',
                },
              },
              
              'ul, ol': {
                paddingLeft: '1.5rem',
                marginBottom: '1.25rem',
              },
              
              li: {
                marginBottom: '0.5rem',
                '&::marker': {
                  color: 'hsl(var(--primary))',
                  fontWeight: '600',
                },
              },
              
              code: {
                backgroundColor: 'hsl(var(--muted))',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'hsl(var(--primary))',
              },
              
              pre: {
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                overflow: 'auto',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              },
              
              'pre code': {
                backgroundColor: 'transparent',
                padding: '0',
                borderRadius: '0',
                color: 'hsl(var(--foreground))',
              },
              
              img: {
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                margin: '2rem auto',
              },
              
              figcaption: {
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'hsl(var(--muted-foreground))',
                marginTop: '0.75rem',
                fontStyle: 'italic',
              },
              
              table: {
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                marginBottom: '2rem',
              },
              
              th: {
                backgroundColor: 'hsl(var(--primary) / 0.05)',
                borderBottom: '2px solid hsl(var(--primary) / 0.2)',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: 'hsl(var(--primary))',
              },
              
              td: {
                borderBottom: '1px solid hsl(var(--border))',
                padding: '0.75rem 1rem',
              },
              
              'tbody tr:hover': {
                backgroundColor: 'hsl(var(--muted) / 0.5)',
              },
            },
          ],
        },
        
        // HAPA branded theme for articles
        hapa: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--primary))',
            '--tw-prose-lead': 'hsl(var(--muted-foreground))',
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-bold': 'hsl(var(--primary))',
            '--tw-prose-counters': 'hsl(var(--secondary))',
            '--tw-prose-bullets': 'hsl(var(--secondary))',
            '--tw-prose-hr': 'hsl(var(--primary) / 0.3)',
            '--tw-prose-quotes': 'hsl(var(--primary))',
            '--tw-prose-quote-borders': 'hsl(var(--secondary))',
            '--tw-prose-captions': 'hsl(var(--accent))',
            '--tw-prose-code': 'hsl(var(--accent))',
            '--tw-prose-pre-code': 'hsl(var(--primary-foreground))',
            '--tw-prose-pre-bg': 'hsl(var(--primary) / 0.05)',
            '--tw-prose-th-borders': 'hsl(var(--primary) / 0.3)',
            '--tw-prose-td-borders': 'hsl(var(--border))',
          },
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
