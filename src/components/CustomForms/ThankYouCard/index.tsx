'use client'

import { CheckCircle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { motion, type Variants } from 'framer-motion'

interface ThankYouCardProps {
  locale: 'fr' | 'ar'
  formType: 'report' | 'complaint'
  submissionId?: string
}

export function ThankYouCard({ locale, formType }: ThankYouCardProps) {
  const router = useRouter()
  const t = useTranslations()
  const isComplaint = formType === 'complaint'

  const getFormTypeLabel = () => {
    return isComplaint ? t('complaintForm') : t('reportForm')
  }

  // Animation variants with proper typing
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }
    }
  }

  const pulseVariants: Variants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: 2 // Reduced from Infinity to 2 repeats
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.01 }} // Reduced from 1.02 to 1.01
          transition={{ type: "spring", stiffness: 400, damping: 30 }} // Added damping for smoother animation
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg overflow-hidden">
            <CardContent className="p-8 text-center relative">
              {/* Background decorative elements - Static gradient, no animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-50" />

              {/* Success Icon with sophisticated animation */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center mb-6 relative z-10"
              >
                <motion.div 
                  className="bg-primary/10 rounded-full p-4 relative"
                  variants={iconVariants}
                >
                  <motion.div
                    variants={pulseVariants}
                    animate="pulse"
                  >
                    <CheckCircle className="h-16 w-16 text-primary" />
                  </motion.div>
                  
                  {/* Ripple effect - Single animation on mount */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/20"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{
                      scale: [1, 1.3, 1.5],
                      opacity: [0.5, 0.2, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: 0, // Changed from Infinity to 0 (run once)
                      delay: 0.3
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Title with elegant entrance */}
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative z-10"
              >
                {t('thankYou')}
              </motion.h2>

              {/* Success Message */}
              <motion.p
                variants={itemVariants}
                className="text-xl text-gray-700 mb-6 leading-relaxed relative z-10"
              >
                {t('submissionSuccess', { type: getFormTypeLabel() })}
              </motion.p>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-gray-600 mb-6 leading-relaxed relative z-10"
              >
                {t('submissionSuccessDescription')}
              </motion.p>

              {/* Processing Info with subtle animation */}
              <motion.div
                variants={itemVariants}
                className="bg-white/60 rounded-lg p-6 mb-8 border border-primary/20 relative z-10 backdrop-blur-sm"
              >
                <p className="text-sm font-medium text-primary">
                  {isComplaint ? t('complaintProcessingTime') : t('reportProcessingTime')}
                </p>
              </motion.div>

              {/* Action Button with hover effects */}
              <motion.div
                variants={itemVariants}
                className="relative z-10"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }} // Reduced from 1.05 to 1.02
                  whileTap={{ scale: 0.98 }} // Reduced from 0.95 to 0.98
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    onClick={() => router.push(`/${locale}`)}
                    className="bg-primary hover:bg-accent text-lg px-8 py-3 shadow-lg"
                    size="lg"
                  >
                    <Home className={cn("h-5 w-5", locale === "ar" ? "ml-2" : "mr-2")} />
                    {t('goBackHome')}
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}