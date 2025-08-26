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

const templates: TemplateOption[] = [
  {
    id: 'standard',
    name: 'Standard Reply',
    description: 'Professional response with full details',
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
    name: 'Quick Response',
    description: 'Brief acknowledgment',
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
    name: 'Detailed Response',
    description: 'Comprehensive reply with next steps',
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
    name: 'Follow-up',
    description: 'Check-in or additional information',
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
]

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  value,
  submission,
  onChange,
}) => {
  const locale = submission.preferredLanguage || 'fr'

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === value) || templates[0],
    [value]
  )

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        const content = template.generateContent(submission, locale)
        onChange(template.id, content)
      }
    },
    [submission, locale, onChange]
  )

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={handleTemplateChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex items-center gap-2">
                {template.icon}
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Template Preview Card */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          {selectedTemplate.icon}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">
              {selectedTemplate.name}
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              {selectedTemplate.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Template Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Tip:</strong> Templates provide a starting point for your reply</p>
        <p><strong>Edit:</strong> You can customize the content after selecting a template</p>
        <p><strong>Language:</strong> Template content is automatically adjusted based on the user&apos;s preferred language</p>
      </div>
    </div>
  )
}