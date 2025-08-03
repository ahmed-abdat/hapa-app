'use client'

import React from 'react'
import { CheckCircle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'

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

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('thankYou')}
          </h2>

          {/* Success Message */}
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            {t('submissionSuccess', { type: getFormTypeLabel() })}
          </p>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t('submissionSuccessDescription')}
          </p>

          {/* Processing Info */}
          <div className="bg-white/60 rounded-lg p-6 mb-8 border border-primary/20">
            <p className="text-sm font-medium text-primary">
              {isComplaint ? t('complaintProcessingTime') : t('reportProcessingTime')}
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => router.push(`/${locale}`)}
            className="bg-primary hover:bg-accent text-lg px-8 py-3"
            size="lg"
          >
            <Home className={cn("h-5 w-5", locale === "ar" ? "ml-2" : "mr-2")} />
            {t('goBackHome')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}