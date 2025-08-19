'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useField, useForm, useLocale } from '@payloadcms/ui'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react'
import { SEO_LIMITS, extractPlainTextFromLexical, truncateText } from '@/utilities/seo'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface SEOFieldsGroupProps {
  path: string
}

export const SEOFieldsGroup: React.FC<SEOFieldsGroupProps> = ({ path }) => {
  const locale = useLocale()
  const { fields, getData } = useForm()
  
  const { value: metaTitle, setValue: setMetaTitle } = useField({ path: `${path}.title` })
  const { value: metaDescription, setValue: setMetaDescription } = useField({ path: `${path}.description` })
  const { value: metaImage, setValue: setMetaImage } = useField({ path: `${path}.image` })
  
  const [titleLength, setTitleLength] = useState(0)
  const [descLength, setDescLength] = useState(0)
  const [seoScore, setSeoScore] = useState(0)
  const [generating, setGenerating] = useState(false)

  // Calculate SEO score
  const calculateSEOScore = useCallback(() => {
    let score = 0
    const maxScore = 100

    // Title scoring (40 points)
    if (metaTitle && typeof metaTitle === 'string') {
      const length = metaTitle.length
      if (length >= SEO_LIMITS.title.min && length <= SEO_LIMITS.title.max) {
        score += 40
      } else if (length > 0) {
        score += 20
      }
    }

    // Description scoring (40 points)
    if (metaDescription && typeof metaDescription === 'string') {
      const length = metaDescription.length
      if (length >= SEO_LIMITS.description.min && length <= SEO_LIMITS.description.max) {
        score += 40
      } else if (length > 0) {
        score += 20
      }
    }

    // Image scoring (20 points)
    if (metaImage) {
      score += 20
    }

    setSeoScore(Math.round((score / maxScore) * 100))
  }, [metaTitle, metaDescription, metaImage])

  useEffect(() => {
    setTitleLength(typeof metaTitle === 'string' ? metaTitle.length : 0)
    setDescLength(typeof metaDescription === 'string' ? metaDescription.length : 0)
    calculateSEOScore()
  }, [metaTitle, metaDescription, calculateSEOScore])

  // Auto-generate from content
  const handleAutoGenerate = async () => {
    setGenerating(true)
    const formData = await getData()
    
    try {
      // Get title and content from form data
      const title = formData?.title?.[locale.code] || formData?.title?.fr || formData?.title
      const content = formData?.content?.[locale.code] || formData?.content?.fr || formData?.content
      
      // Generate SEO title
      if (title && !metaTitle) {
        const siteName = locale.code === 'ar' 
          ? 'الهيئة العليا للصحافة والإعلام السمعي البصري'
          : 'HAPA'
        
        const maxTitleLength = SEO_LIMITS.title.max - siteName.length - 3
        const truncatedTitle = title.length > maxTitleLength 
          ? truncateText(title, maxTitleLength, false)
          : title
        
        setMetaTitle(`${truncatedTitle} — ${siteName}`)
      }
      
      // Generate SEO description
      if (content && !metaDescription) {
        let plainText = ''
        if (typeof content === 'object' && content.root) {
          plainText = extractPlainTextFromLexical(content as SerializedEditorState)
        } else if (typeof content === 'string') {
          plainText = content
        }
        
        if (plainText) {
          const description = truncateText(plainText, SEO_LIMITS.description.max, true)
          setMetaDescription(description)
        }
      }
      
      // Auto-select hero image if available
      if (formData?.heroImage && !metaImage) {
        setMetaImage(formData.heroImage)
      }
    } finally {
      setGenerating(false)
    }
  }

  // Get status badge color and icon
  const getFieldStatus = (value: unknown, type: 'title' | 'description') => {
    if (!value || typeof value !== 'string') return { color: 'secondary', icon: AlertCircle, text: 'Non défini' }
    
    const length = value.length
    const limits = SEO_LIMITS[type]
    
    if (length < limits.min) {
      return { 
        color: 'warning', 
        icon: AlertTriangle, 
        text: `Trop court (${limits.min - length} caractères à ajouter)` 
      }
    }
    
    if (length > limits.max) {
      return { 
        color: 'destructive', 
        icon: AlertCircle, 
        text: `Trop long (${length - limits.max} caractères en trop)` 
      }
    }
    
    return { 
      color: 'success', 
      icon: CheckCircle, 
      text: 'Longueur optimale' 
    }
  }

  const titleStatus = getFieldStatus(metaTitle, 'title')
  const descStatus = getFieldStatus(metaDescription, 'description')

  // Get SEO score color
  const getScoreColor = () => {
    if (seoScore >= 80) return 'text-green-600'
    if (seoScore >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Optimisation SEO</h3>
          <p className="text-sm text-muted-foreground">
            {locale.code === 'ar' 
              ? 'تحسين محرك البحث لمحتواك'
              : 'Optimisez votre contenu pour les moteurs de recherche'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor()}`}>
              {seoScore}%
            </div>
            <div className="text-xs text-muted-foreground">Score SEO</div>
          </div>
          
          <Button
            type="button"
            onClick={handleAutoGenerate}
            disabled={generating}
            variant="outline"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Génération...' : 'Auto-générer'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Title Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Titre SEO ({locale.code === 'ar' ? 'العربية' : 'Français'})
            </label>
            <div className="flex items-center gap-2">
              <Badge variant={titleStatus.color as any}>
                <titleStatus.icon className="w-3 h-3 mr-1" />
                {titleStatus.text}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {titleLength}/{SEO_LIMITS.title.max}
              </span>
            </div>
          </div>
          
          <input
            type="text"
            value={typeof metaTitle === 'string' ? metaTitle : ''}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={locale.code === 'ar' 
              ? 'أدخل عنوان SEO...'
              : 'Entrez le titre SEO...'}
            className="w-full px-3 py-2 border rounded-md"
            maxLength={SEO_LIMITS.title.max + 10} // Allow slight overflow for editing
          />
          
          <Progress 
            value={(titleLength / SEO_LIMITS.title.max) * 100} 
            className="h-1"
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Description SEO ({locale.code === 'ar' ? 'العربية' : 'Français'})
            </label>
            <div className="flex items-center gap-2">
              <Badge variant={descStatus.color as any}>
                <descStatus.icon className="w-3 h-3 mr-1" />
                {descStatus.text}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {descLength}/{SEO_LIMITS.description.max}
              </span>
            </div>
          </div>
          
          <textarea
            value={typeof metaDescription === 'string' ? metaDescription : ''}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={locale.code === 'ar'
              ? 'أدخل وصف SEO...'
              : 'Entrez la description SEO...'}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            maxLength={SEO_LIMITS.description.max + 20} // Allow slight overflow for editing
          />
          
          <Progress 
            value={(descLength / SEO_LIMITS.description.max) * 100} 
            className="h-1"
          />
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Aperçu Google</label>
          <div className="p-4 bg-white border rounded-lg">
            <div className="space-y-1">
              <div className="text-blue-600 text-xl hover:underline cursor-pointer">
                {(typeof metaTitle === 'string' ? metaTitle : '') || 'Titre de la page'}
              </div>
              <div className="text-green-700 text-sm">
                hapa.mr › {locale.code} › actualites
              </div>
              <div className="text-gray-600 text-sm">
                {(typeof metaDescription === 'string' ? metaDescription : '') || 'Description de la page...'}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Tips */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">
            {locale.code === 'ar' ? 'نصائح SEO' : 'Conseils SEO'}
          </h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• {locale.code === 'ar' 
              ? 'استخدم كلمات مفتاحية مهمة في العنوان'
              : 'Utilisez des mots-clés importants dans le titre'}</li>
            <li>• {locale.code === 'ar'
              ? 'اجعل الوصف جذابًا ومفيدًا'
              : 'Rendez la description attrayante et informative'}</li>
            <li>• {locale.code === 'ar'
              ? 'تجنب التكرار بين العنوان والوصف'
              : 'Évitez la duplication entre le titre et la description'}</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

export default SEOFieldsGroup