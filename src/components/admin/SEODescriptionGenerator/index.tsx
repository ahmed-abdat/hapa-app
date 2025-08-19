'use client'
import React, { useCallback, useState } from 'react'
import { useField, useForm, useLocale } from '@payloadcms/ui'
import { extractPlainTextFromLexical, truncateText, SEO_LIMITS } from '@/utilities/seo'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import './styles.scss'

export const SEODescriptionGenerator: React.FC = () => {
  const locale = useLocale()
  const { getData } = useForm()
  const { value: metaDescription, setValue: setMetaDescription } = useField({ 
    path: 'meta.description' 
  })
  const [generating, setGenerating] = useState(false)
  
  const handleGenerateDescription = useCallback(async () => {
    setGenerating(true)
    try {
      const formData = await getData()
      const currentLocale = locale?.code || 'fr'
      
      // Get content in current locale with fallback
      let content = formData?.content?.[currentLocale] || formData?.content?.fr || formData?.content
      
      if (!content) {
        alert(currentLocale === 'ar' 
          ? 'لا يوجد محتوى لاستخراج الوصف منه'
          : 'Aucun contenu trouvé pour générer la description'
        )
        return
      }
      
      // Extract plain text from Lexical content
      let plainText = ''
      if (typeof content === 'object' && content.root) {
        plainText = extractPlainTextFromLexical(content as SerializedEditorState)
      } else if (typeof content === 'string') {
        plainText = content
      }
      
      if (!plainText.trim()) {
        alert(currentLocale === 'ar'
          ? 'المحتوى فارغ'
          : 'Le contenu est vide'
        )
        return
      }
      
      // Generate smart description
      const description = truncateText(plainText, SEO_LIMITS.description.max, true)
      setMetaDescription(description)
      
    } catch (error) {
      console.error('Error generating description:', error)
      alert(locale?.code === 'ar'
        ? 'خطأ في توليد الوصف'
        : 'Erreur lors de la génération de la description'
      )
    } finally {
      setGenerating(false)
    }
  }, [locale, getData, setMetaDescription])

  return (
    <div className="seo-description-generator">
      <div className="seo-description-generator__header">
        <span className="seo-description-generator__title">
          ✨ {locale?.code === 'ar' ? 'مولد وصف SEO' : 'Générateur de description SEO'}
        </span>
        <button
          type="button"
          onClick={handleGenerateDescription}
          disabled={generating}
          className={`seo-description-generator__button ${generating ? 'seo-description-generator__button--disabled' : ''}`}
        >
          {generating 
            ? (locale?.code === 'ar' ? 'جاري التوليد...' : 'Génération...') 
            : (locale?.code === 'ar' ? 'توليد من المحتوى' : 'Générer du contenu')}
        </button>
      </div>
      <div className="seo-description-generator__description">
        {locale?.code === 'ar' 
          ? `يستخرج أول ${SEO_LIMITS.description.max} حرف من محتوى المقال لإنشاء وصف SEO محسن`
          : `Extrait les premiers ${SEO_LIMITS.description.max} caractères du contenu de l'article pour créer une description SEO optimisée`}
      </div>
    </div>
  )
}