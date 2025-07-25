'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { QuoteIcon } from 'lucide-react'

import type { QuoteBlock as QuoteBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { type Locale } from '@/i18n/routing'

type Props = {
  locale?: Locale
  className?: string
} & QuoteBlockProps

export const QuoteBlock: React.FC<Props> = ({
  quote,
  author,
  role,
  variant = 'default',
  showIcon = true,
  className,
  locale = 'fr',
}) => {
  const isRTL = locale === 'ar'

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: 'back.out(1.7)',
      },
    },
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          container: 'bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20',
          quote: 'text-2xl md:text-3xl font-semibold',
          icon: 'w-16 h-16 text-primary',
        }
      case 'testimonial':
        return {
          container: 'bg-white shadow-xl border border-border/50',
          quote: 'text-xl md:text-2xl font-medium',
          icon: 'w-12 h-12 text-secondary',
        }
      case 'pull':
        return {
          container: 'bg-gradient-to-r from-secondary/10 to-transparent border-l-8 border-secondary',
          quote: 'text-xl md:text-2xl font-medium italic',
          icon: 'w-10 h-10 text-secondary/60',
        }
      default:
        return {
          container: 'bg-gradient-to-br from-secondary/8 via-secondary/4 to-transparent border-l-4 border-secondary',
          quote: 'text-lg md:text-xl font-medium',
          icon: 'w-12 h-12 text-secondary/70',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <motion.blockquote
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-8 my-8',
        'backdrop-blur-sm',
        styles.container,
        {
          'text-right': isRTL,
        },
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={locale}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Quote Icon */}
      {showIcon && (
        <motion.div
          variants={iconVariants}
          className={cn(
            'absolute top-6 opacity-40',
            isRTL ? 'right-6' : 'left-6'
          )}
        >
          <QuoteIcon className={styles.icon} />
        </motion.div>
      )}

      {/* Quote Content */}
      <div className={cn('relative z-10', showIcon ? 'mt-8' : '')}>
        <p
          className={cn(
            'leading-relaxed text-foreground mb-6',
            styles.quote,
            {
              'font-arabic-display': locale === 'ar',
            }
          )}
        >
          {quote}
        </p>

        {/* Attribution */}
        {(author || role) && (
          <footer className="flex flex-col gap-1">
            {author && (
              <cite
                className={cn(
                  'not-italic font-semibold text-primary text-base',
                  {
                    'font-arabic-display': locale === 'ar',
                  }
                )}
              >
                {author}
              </cite>
            )}
            {role && (
              <span
                className={cn(
                  'text-sm text-muted-foreground font-medium',
                  {
                    'font-arabic-sans': locale === 'ar',
                  }
                )}
              >
                {role}
              </span>
            )}
          </footer>
        )}
      </div>

      {/* Glassmorphism effect for featured variant */}
      {variant === 'featured' && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] rounded-2xl" />
      )}
    </motion.blockquote>
  )
}