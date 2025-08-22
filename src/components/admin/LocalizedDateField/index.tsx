'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

const LocalizedDateField: React.FC<{ fieldPath?: string }> = ({ fieldPath = 'createdAt' }) => {
  const { value } = useField<string>({ path: fieldPath })
  const { value: formData } = useField<any>({ path: '' })
  
  // Determine locale from the submission
  const submissionLocale = formData?.locale || 'fr'
  
  if (!value) {
    return (
      <div className="field-type">
        <div className="field-type__wrap">
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '4px',
            fontStyle: 'italic',
            color: '#6b7280',
            direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
          }}>
            {submissionLocale === 'ar' ? 'لا يوجد تاريخ' : 'Aucune date'}
          </div>
        </div>
      </div>
    )
  }

  // Format the date based on locale
  const formatDate = (dateString: string, locale: 'fr' | 'ar'): string | { formatted: string; dayName: string; monthName: string; relativeTime: string } => {
    try {
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        return dateString // Return original if invalid
      }

      // Format: DD/MM/YYYY HH:MM
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`
      
      // Get day name based on locale
      const dayNames = {
        fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      }
      
      const monthNames = {
        fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
              'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
              'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      }
      
      const dayName = dayNames[locale][date.getDay()]
      const monthName = monthNames[locale][date.getMonth()]
      
      // Calculate relative time
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      let relativeTime = ''
      if (locale === 'ar') {
        if (diffHours < 1) {
          relativeTime = 'منذ أقل من ساعة'
        } else if (diffHours < 24) {
          relativeTime = `منذ ${diffHours} ساعة`
        } else if (diffDays < 7) {
          relativeTime = `منذ ${diffDays} أيام`
        } else if (diffDays < 30) {
          relativeTime = `منذ ${Math.floor(diffDays / 7)} أسابيع`
        } else if (diffDays < 365) {
          relativeTime = `منذ ${Math.floor(diffDays / 30)} أشهر`
        } else {
          relativeTime = `منذ ${Math.floor(diffDays / 365)} سنوات`
        }
      } else {
        if (diffHours < 1) {
          relativeTime = 'Il y a moins d\'une heure'
        } else if (diffHours < 24) {
          relativeTime = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
        } else if (diffDays < 7) {
          relativeTime = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
        } else if (diffDays < 30) {
          relativeTime = `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
        } else if (diffDays < 365) {
          relativeTime = `Il y a ${Math.floor(diffDays / 30)} mois`
        } else {
          relativeTime = `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`
        }
      }
      
      return {
        formatted: formattedDate,
        dayName,
        monthName,
        relativeTime
      }
    } catch (error) {
      return dateString
    }
  }

  const dateInfo = formatDate(value, submissionLocale)
  const isDateObject = typeof dateInfo === 'object'

  return (
    <div className="field-type">
      <div className="field-type__wrap">
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '6px',
          border: '1px solid #86efac',
          direction: submissionLocale === 'ar' ? 'rtl' : 'ltr'
        }}>
          {isDateObject ? (
            <>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '16px',
                color: '#166534',
                marginBottom: '4px'
              }}>
                📅 {(dateInfo as any).formatted}
              </div>
              <div style={{ 
                fontSize: '13px',
                color: '#15803d',
                marginTop: '4px'
              }}>
                {(dateInfo as any).dayName}, {(dateInfo as any).monthName}
              </div>
              <div style={{ 
                fontSize: '12px',
                color: '#64748b',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                {(dateInfo as any).relativeTime}
              </div>
            </>
          ) : (
            <div style={{ 
              fontSize: '14px',
              color: '#166534'
            }}>
              {dateInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocalizedDateField