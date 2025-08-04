'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Progress } from '@/components/ui/progress'
import { Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormSubmissionProgressProps {
  isVisible: boolean
  stage: 'preparing' | 'uploading' | 'validating' | 'saving' | 'complete' | 'error'
  progress: number
  uploadStats?: {
    total: number
    completed: number
    failed: number
  }
  errorMessage?: string
  locale?: 'fr' | 'ar'
}

const stageMessages = {
  fr: {
    preparing: 'Préparation de la soumission...',
    uploading: 'Téléchargement des fichiers...',
    validating: 'Validation des données...',
    saving: 'Enregistrement de la soumission...',
    complete: 'Soumission réussie!',
    error: 'Erreur lors de la soumission'
  },
  ar: {
    preparing: 'إعداد الإرسال...',
    uploading: 'رفع الملفات...',
    validating: 'التحقق من البيانات...',
    saving: 'حفظ الإرسال...',
    complete: 'تم الإرسال بنجاح!',
    error: 'خطأ في الإرسال'
  }
}

export function FormSubmissionProgress({
  isVisible,
  stage,
  progress,
  uploadStats,
  errorMessage,
  locale = 'fr'
}: FormSubmissionProgressProps) {
  const t = useTranslations()
  const isRTL = locale === 'ar'
  const messages = stageMessages[locale]

  if (!isVisible) return null

  const getStageIcon = () => {
    switch (stage) {
      case 'preparing':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-500 animate-bounce" />
      case 'validating':
      case 'saving':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getProgressColor = () => {
    switch (stage) {
      case 'complete':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'uploading':
        return 'bg-blue-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm",
        "transition-all duration-300"
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={cn(
        "bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4",
        "transform transition-all duration-300 scale-100"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center gap-3 mb-4",
          isRTL && "flex-row-reverse"
        )}>
          {getStageIcon()}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              <bdi>{messages[stage]}</bdi>
            </h3>
            {uploadStats && stage === 'uploading' && (
              <p className="text-sm text-gray-600 mt-1">
                <bdi>
                  {uploadStats.completed}/{uploadStats.total} {t('filesUploaded')}
                  {uploadStats.failed > 0 && ` (${uploadStats.failed} ${t('uploadFailures')})`}
                </bdi>
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress 
            value={progress} 
            className={cn(
              "h-3 transition-all duration-300",
              stage === 'error' && "opacity-50"
            )}
          />
          <div className={cn(
            "flex justify-between items-center mt-2 text-sm text-gray-600",
            isRTL && "flex-row-reverse"
          )}>
            <span>{Math.round(progress)}%</span>
            {stage === 'uploading' && uploadStats && (
              <span>
                <bdi>
                  {uploadStats.completed + uploadStats.failed}/{uploadStats.total}
                </bdi>
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {stage === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className={cn(
              "flex items-start gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">
                <bdi>{errorMessage}</bdi>
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {stage === 'complete' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">
                <bdi>{t('submissionSuccessfullyRecorded')}</bdi>
              </p>
            </div>
          </div>
        )}

        {/* Upload Details for Error State */}
        {stage === 'error' && uploadStats && uploadStats.failed > 0 && (
          <div className="text-xs text-gray-500 text-center">
            <bdi>
              {t('filesSuccessful')}: {uploadStats.completed}, 
              {t('failures')}: {uploadStats.failed}
            </bdi>
          </div>
        )}
      </div>
    </div>
  )
}