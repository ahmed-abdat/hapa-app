'use client'

import React, { useCallback, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ContactSubmission } from '@/payload-types'
import { EmailTemplate } from './ReplyDialog'
import { Card } from '@/components/ui/card'
import { FileText, Zap, FileCheck, RefreshCw } from 'lucide-react'
import { useAdminTranslation } from '@/utilities/admin-translations'

interface TemplateSelectorProps {
  value: EmailTemplate
  submission: ContactSubmission
  onChange: (template: EmailTemplate, content: string) => void
}

interface TemplateOption {
  id: EmailTemplate
  name: string
  description: string
  icon: React.ReactNode
  generateContent: (submission: ContactSubmission, locale: string) => string
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  value,
  submission,
  onChange,
}) => {
  const { dt, i18n } = useAdminTranslation()
  // Use admin's interface language for template preview
  const adminLocale = i18n.language
  // Keep submission language for reference (will be used when actually sending the email)
  const emailLocale = submission.preferredLanguage || 'fr'
  
  // Use admin locale for template content generation in the UI
  const locale = adminLocale
  
  // Move templates inside component to access translations
  const templates = useMemo<TemplateOption[]>(() => [
    {
      id: 'standard',
      name: dt('emailReply.templates.standard'),
      description: dt('emailReply.templates.standardDesc'),
      icon: <FileText className="h-4 w-4" />,
      generateContent: (submission, locale) => {
        const name = submission.name || 'Client'
        if (locale === 'fr') {
          return `Merci pour votre message concernant "${submission.subject || 'votre demande'}".

Nous avons bien reçu votre demande et nous l'avons examinée attentivement.

[Votre réponse ici]

Si vous avez des questions supplémentaires, n'hésitez pas à nous contacter.`
        } else {
          return `شكراً لرسالتك بخصوص "${submission.subject || 'طلبك'}".

لقد تلقينا طلبك وقمنا بمراجعته بعناية.

[ردك هنا]

إذا كان لديك أي أسئلة إضافية، فلا تتردد في الاتصال بنا.`
        }
      },
    },
    {
      id: 'quick',
      name: dt('emailReply.templates.quick'),
      description: dt('emailReply.templates.quickDesc'),
      icon: <Zap className="h-4 w-4" />,
      generateContent: (submission, locale) => {
        if (locale === 'fr') {
          return `Merci pour votre message.

Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.

Cordialement,`
        } else {
          return `شكراً لرسالتك.

لقد تلقينا طلبك وسنرد عليك في أقرب وقت ممكن.

مع أطيب التحيات،`
        }
      },
    },
    {
      id: 'detailed',
      name: dt('emailReply.templates.detailed'),
      description: dt('emailReply.templates.detailedDesc'),
      icon: <FileCheck className="h-4 w-4" />,
      generateContent: (submission, locale) => {
        if (locale === 'fr') {
          return `Merci pour votre message du ${new Date(submission.createdAt).toLocaleDateString('fr-FR')}.

Suite à votre demande concernant "${submission.subject || 'votre requête'}", nous avons le plaisir de vous informer que :

1. [Premier point de réponse]
2. [Deuxième point de réponse]
3. [Troisième point de réponse]

**Prochaines étapes :**
- [Action à entreprendre]
- [Délai ou échéance]

Pour toute information complémentaire, vous pouvez :
- Nous contacter par email : support@hapa.mr
- Visiter notre site web : www.hapa.mr
- Nous appeler au : [Numéro de téléphone]

Nous restons à votre disposition pour tout complément d'information.`
        } else {
          return `شكراً لرسالتك بتاريخ ${new Date(submission.createdAt).toLocaleDateString('ar-SA')}.

بخصوص طلبك حول "${submission.subject || 'استفسارك'}"، يسرنا إبلاغك بما يلي:

1. [نقطة الرد الأولى]
2. [نقطة الرد الثانية]
3. [نقطة الرد الثالثة]

**الخطوات التالية:**
- [الإجراء المطلوب]
- [الموعد النهائي أو الإطار الزمني]

للحصول على معلومات إضافية، يمكنك:
- الاتصال بنا عبر البريد الإلكتروني: support@hapa.mr
- زيارة موقعنا الإلكتروني: www.hapa.mr
- الاتصال بنا على: [رقم الهاتف]

نبقى في خدمتك لأي معلومات إضافية.`
        }
      },
    },
    {
      id: 'follow-up',
      name: dt('emailReply.templates.followup'),
      description: dt('emailReply.templates.followupDesc'),
      icon: <RefreshCw className="h-4 w-4" />,
      generateContent: (submission, locale) => {
        if (locale === 'fr') {
          return `Suite à notre précédent échange concernant "${submission.subject || 'votre demande'}", nous souhaitions vous tenir informé(e) de l'avancement.

[Mise à jour ou information supplémentaire]

Nous espérons que ces informations vous sont utiles. N'hésitez pas à nous faire part de vos questions ou commentaires.`
        } else {
          return `بناءً على مراسلتنا السابقة بخصوص "${submission.subject || 'طلبك'}"، نود إطلاعك على آخر المستجدات.

[التحديث أو المعلومات الإضافية]

نأمل أن تكون هذه المعلومات مفيدة. لا تتردد في مشاركة أسئلتك أو تعليقاتك معنا.`
        }
      },
    },
  ], [dt])

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === value) || templates[0],
    [value, templates]
  )

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        const content = template.generateContent(submission, locale)
        onChange(template.id, content)
      }
    },
    [submission, locale, onChange, templates]
  )

  const isRTL = adminLocale === 'ar'
  
  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Enhanced Template Selector with HAPA Brand Colors */}
      <Select value={value} onValueChange={handleTemplateChange}>
        <SelectTrigger className="w-full h-auto py-2 px-3 border-gray-300 hover:border-green-500/50 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all">
          <div className="flex items-center justify-between w-full">
            <SelectValue placeholder={dt('emailReply.selectTemplate')}>
              {selectedTemplate && (
                <div className={`flex items-center gap-3 py-1 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <span className="text-green-700">{selectedTemplate.icon}</span>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className="font-medium text-gray-900">{selectedTemplate.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{selectedTemplate.description}</div>
                  </div>
                </div>
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]" dir={isRTL ? 'rtl' : 'ltr'}>
          {templates.map((template) => (
            <SelectItem 
              key={template.id} 
              value={template.id}
              className="py-3 px-3 hover:bg-green-50 cursor-pointer transition-colors"
            >
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <span className="text-green-700 shrink-0">{template.icon}</span>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-medium text-gray-900 mb-0.5">{template.name}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{template.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Enhanced Template Preview Card with HAPA Brand Colors */}
      <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 via-yellow-50/30 to-green-50">
        <div className="p-4">
          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 bg-white rounded-lg shadow-sm border border-green-200">
              <span className="text-green-700">{selectedTemplate.icon}</span>
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                {selectedTemplate.name}
              </h4>
              <p className="text-xs text-green-800/80 leading-relaxed">
                {selectedTemplate.description}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3 border-t border-green-100">
          <div className={`text-xs text-green-700 flex items-center gap-1 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{dt('emailReply.templateTip')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}