'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { TrendingUpIcon, UsersIcon, FileTextIcon, AwardIcon, BuildingIcon, GlobeIcon } from 'lucide-react'

import type { StatisticsBlock as StatisticsBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { type Locale } from '@/i18n/routing'

type Props = {
  locale?: Locale
  className?: string
} & StatisticsBlockProps

// Icon mapping for statistics
const iconMap = {
  trending: TrendingUpIcon,
  users: UsersIcon,
  files: FileTextIcon,
  award: AwardIcon,
  building: BuildingIcon,
  globe: GlobeIcon,
}

// Animated counter component
const AnimatedCounter: React.FC<{
  value: number
  duration?: number
  suffix?: string
  prefix?: string
}> = ({ value, duration = 2, suffix = '', prefix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000 })
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, isInView, value])

  useEffect(() => {
    springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.floor(latest).toLocaleString()}${suffix}`
      }
    })
  }, [springValue, prefix, suffix])

  return <span ref={ref} />
}

export const StatisticsBlock: React.FC<Props> = ({
  title,
  subtitle,
  statistics = [],
  layout = 'grid',
  variant = 'default',
  className,
  locale = 'fr',
}) => {
  const isRTL = locale === 'ar'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap justify-center gap-8'
      case 'vertical':
        return 'flex flex-col gap-6 max-w-md mx-auto'
      default:
        return `grid gap-6 ${
          statistics.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          statistics.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          statistics.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          container: 'bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-primary/20',
          card: 'bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/20',
          number: 'text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
          label: 'text-foreground font-semibold',
        }
      case 'minimal':
        return {
          container: 'bg-transparent',
          card: 'bg-transparent hover:bg-muted/50 border-0',
          number: 'text-3xl md:text-4xl font-bold text-primary',
          label: 'text-muted-foreground',
        }
      case 'glassmorphism':
        return {
          container: 'bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10',
          card: 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20',
          number: 'text-3xl md:text-4xl font-bold text-white drop-shadow-lg',
          label: 'text-white/90 font-medium',
        }
      default:
        return {
          container: 'bg-gradient-to-br from-gray-50/50 to-white/50',
          card: 'bg-white shadow-md hover:shadow-lg border border-border',
          number: 'text-3xl md:text-4xl font-bold text-primary',
          label: 'text-muted-foreground',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <section 
      className={cn(
        'py-16 px-4 sm:px-6 lg:px-8 rounded-3xl',
        styles.container,
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={locale}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn(
              'text-center mb-12',
              { 'text-right': isRTL }
            )}
          >
            {title && (
              <h2
                className={cn(
                  'text-3xl md:text-4xl font-bold text-foreground mb-4',
                  'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
                  {
                    'font-arabic-display': locale === 'ar',
                  }
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={cn(
                  'text-lg text-muted-foreground max-w-2xl mx-auto',
                  {
                    'font-arabic-sans': locale === 'ar',
                  }
                )}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Statistics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={getLayoutClasses()}
        >
          {statistics.map((stat, index) => {
            const IconComponent = stat.icon ? iconMap[stat.icon as keyof typeof iconMap] : null

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className={cn(
                  'relative p-6 rounded-2xl transition-all duration-300',
                  styles.card,
                  {
                    'min-w-[200px]': layout === 'horizontal',
                  }
                )}
              >
                {/* Background Decoration */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-xl transform translate-x-4 -translate-y-4" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-lg transform -translate-x-2 translate-y-2" />
                </div>

                {/* Content */}
                <div className={cn(
                  'relative z-10 text-center',
                  { 'text-right': isRTL }
                )}>
                  {/* Icon */}
                  {IconComponent && (
                    <div className="mb-4 flex justify-center">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  )}

                  {/* Number */}
                  <div className={cn('mb-2', styles.number)}>
                    <AnimatedCounter
                      value={stat.value || 0}
                      suffix={stat.suffix || ''}
                      prefix={stat.prefix || ''}
                      duration={2}
                    />
                  </div>

                  {/* Label */}
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight',
                      styles.label,
                      {
                        'font-arabic-sans': locale === 'ar',
                      }
                    )}
                  >
                    {stat.label}
                  </p>

                  {/* Description */}
                  {stat.description && (
                    <p
                      className={cn(
                        'text-xs text-muted-foreground mt-2 leading-relaxed',
                        {
                          'font-arabic-sans': locale === 'ar',
                        }
                      )}
                    >
                      {stat.description}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}