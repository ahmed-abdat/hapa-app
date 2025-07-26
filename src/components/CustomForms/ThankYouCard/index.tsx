'use client'

import React from 'react'
import { CheckCircle, Home, FileText, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface ThankYouCardProps {
  locale: 'fr' | 'ar'
  formType: 'report' | 'complaint'
  submissionId?: string
}

export function ThankYouCard({ locale, formType, submissionId }: ThankYouCardProps) {
  const router = useRouter()
  const isRTL = locale === 'ar'
  const isComplaint = formType === 'complaint'

  const getFormTypeLabel = () => {
    if (isComplaint) {
      return locale === 'fr' ? 'plainte officielle' : 'الشكوى الرسمية'
    }
    return locale === 'fr' ? 'signalement' : 'التبليغ'
  }

  const getTitle = () => {
    return locale === 'fr' 
      ? `Votre ${getFormTypeLabel()} a été soumis avec succès !`
      : `تم إرسال ${getFormTypeLabel()} بنجاح!`
  }

  const getDescription = () => {
    return locale === 'fr'
      ? `Nous avons bien reçu votre ${getFormTypeLabel()} et notre équipe spécialisée l'examinera dans les plus brefs délais.`
      : `لقد تلقينا ${getFormTypeLabel()} وسيقوم فريقنا المتخصص بفحصها في أقرب وقت ممكن.`
  }

  const getNextSteps = () => {
    if (isComplaint) {
      return locale === 'fr' ? [
        'Traitement sous 7 jours ouvrables',
        'Suivi personnalisé avec un responsable',
        'Réponse officielle par email'
      ] : [
        'معالجة خلال 7 أيام عمل',
        'متابعة شخصية مع مسؤول',
        'رد رسمي عبر البريد الإلكتروني'
      ]
    }

    return locale === 'fr' ? [
      'Traitement sous 24-48 heures',
      'Traitement confidentiel garanti',
      'Actions correctives si nécessaire'
    ] : [
      'معالجة خلال 24-48 ساعة',
      'معالجة سرية مضمونة',
      'إجراءات تصحيحية إذا لزم الأمر'
    ]
  }

  const nextSteps = getNextSteps()

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="max-w-2xl mx-auto">
      {/* Success Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Merci !' : 'شكراً لك!'}
          </h2>

          {/* Success Message */}
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {getTitle()}
          </p>

          {/* Reference Number */}
          {submissionId && (
            <div className="bg-white/60 rounded-lg p-4 mb-6 border border-primary/20">
              <p className="text-sm text-gray-600 mb-1">
                {locale === 'fr' ? 'Numéro de référence :' : 'رقم المرجع:'}
              </p>
              <p className="font-mono text-lg font-semibold text-primary">
                #{submissionId.slice(-8).toUpperCase()}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {getDescription()}
          </p>

          {/* Next Steps */}
          <div className="bg-white/40 rounded-lg p-6 mb-8 border border-primary/20">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {locale === 'fr' ? 'Prochaines étapes' : 'الخطوات التالية'}
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push(`/${locale}`)}
              className="bg-primary hover:bg-accent"
            >
              <Home className="h-4 w-4 mr-2" />
              {locale === 'fr' ? 'Retour à l\'accueil' : 'العودة للرئيسية'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/contact`)}
              className="border-primary text-primary hover:bg-primary/5"
            >
              {locale === 'fr' ? 'Nous contacter' : 'اتصل بنا'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}