'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useField, useForm, useLocale } from '@payloadcms/ui'
import { SEO_LIMITS } from '@/utilities/seo'
import './styles.scss'

interface SEOFieldsEnhancerProps {
  path?: string
}

export const SEOFieldsEnhancer: React.FC<SEOFieldsEnhancerProps> = () => {
  const locale = useLocale()
  const { fields, getData } = useForm()
  const [generating, setGenerating] = useState(false)
  const [seoData, setSeoData] = useState<any>({})

  // Auto-generate SEO content
  const handleAutoGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      const formData = await getData()
      
      // Get title and content from form data
      const title = formData?.title?.[locale.code] || formData?.title?.fr || formData?.title || ''
      const content = formData?.content?.[locale.code] || formData?.content?.fr || formData?.content || ''
      
      // Generate suggestions
      const suggestions = {
        title: '',
        description: ''
      }
      
      if (title) {
        const siteName = locale.code === 'ar' 
          ? 'الهيئة العليا للصحافة والإعلام السمعي البصري'
          : 'HAPA'
        
        const maxTitleLength = SEO_LIMITS.title.max - siteName.length - 3
        const truncatedTitle = title.length > maxTitleLength 
          ? title.substring(0, maxTitleLength).trim()
          : title
        
        suggestions.title = `${truncatedTitle} — ${siteName}`
      }
      
      if (content) {
        let plainText = ''
        if (typeof content === 'object' && content.root) {
          // Extract text from Lexical content
          try {
            const extractText = (node: any): string => {
              if (!node) return ''
              if (node.type === 'text') return node.text || ''
              if (node.children) {
                return node.children.map(extractText).join(' ')
              }
              return ''
            }
            plainText = extractText(content.root).trim()
          } catch (error) {
            console.error('Error extracting text:', error)
          }
        } else if (typeof content === 'string') {
          plainText = content
        }
        
        if (plainText) {
          const maxLength = SEO_LIMITS.description.max
          suggestions.description = plainText.length > maxLength 
            ? plainText.substring(0, maxLength - 3).trim() + '...'
            : plainText
        }
      }
      
      setSeoData(suggestions)
      
      // Show suggestions to user
      if (suggestions.title || suggestions.description) {
        alert(
          locale.code === 'ar'
            ? `اقتراحات SEO:\n\nالعنوان: ${suggestions.title}\n\nالوصف: ${suggestions.description}\n\nانسخ والصق هذه في حقول SEO أدناه.`
            : `Suggestions SEO :\n\nTitre : ${suggestions.title}\n\nDescription : ${suggestions.description}\n\nCopiez et collez ces éléments dans les champs SEO ci-dessous.`
        )
      }
    } catch (error) {
      console.error('Error generating SEO:', error)
    } finally {
      setGenerating(false)
    }
  }, [locale, getData])

  return (
    <div className="seo-fields-enhancer">
      <div className="seo-header">
        <h4>
          {locale.code === 'ar' 
            ? '🎯 محسن SEO الذكي'
            : '🎯 Optimiseur SEO Intelligent'}
        </h4>
        <button
          type="button"
          onClick={handleAutoGenerate}
          disabled={generating}
          className="seo-generate-btn"
        >
          ✨ {generating 
            ? (locale.code === 'ar' ? 'جاري التوليد...' : 'Génération...') 
            : (locale.code === 'ar' ? 'توليد تلقائي' : 'Auto-générer')}
        </button>
      </div>
      
      <div className="seo-tips">
        <div className="seo-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            {locale.code === 'ar'
              ? `العنوان المثالي: ${SEO_LIMITS.title.min}-${SEO_LIMITS.title.max} حرف`
              : `Titre optimal : ${SEO_LIMITS.title.min}-${SEO_LIMITS.title.max} caractères`}
          </span>
        </div>
        <div className="seo-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            {locale.code === 'ar'
              ? `الوصف المثالي: ${SEO_LIMITS.description.min}-${SEO_LIMITS.description.max} حرف`
              : `Description optimale : ${SEO_LIMITS.description.min}-${SEO_LIMITS.description.max} caractères`}
          </span>
        </div>
        <div className="seo-tip">
          <span className="tip-icon">🔍</span>
          <span className="tip-text">
            {locale.code === 'ar'
              ? 'استخدم كلمات مفتاحية مهمة في بداية العنوان'
              : 'Utilisez des mots-clés importants au début du titre'}
          </span>
        </div>
      </div>

      {seoData.title || seoData.description ? (
        <div className="seo-suggestions">
          <h5>
            {locale.code === 'ar' ? 'الاقتراحات المولدة:' : 'Suggestions générées :'}
          </h5>
          {seoData.title && (
            <div className="suggestion-item">
              <strong>{locale.code === 'ar' ? 'العنوان:' : 'Titre :'}</strong>
              <div className="suggestion-text">{seoData.title}</div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(seoData.title)
                  alert(locale.code === 'ar' ? 'تم النسخ!' : 'Copié !')
                }}
                className="copy-btn"
              >
                📋 {locale.code === 'ar' ? 'نسخ' : 'Copier'}
              </button>
            </div>
          )}
          {seoData.description && (
            <div className="suggestion-item">
              <strong>{locale.code === 'ar' ? 'الوصف:' : 'Description :'}</strong>
              <div className="suggestion-text">{seoData.description}</div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(seoData.description)
                  alert(locale.code === 'ar' ? 'تم النسخ!' : 'Copié !')
                }}
                className="copy-btn"
              >
                📋 {locale.code === 'ar' ? 'نسخ' : 'Copier'}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default SEOFieldsEnhancer