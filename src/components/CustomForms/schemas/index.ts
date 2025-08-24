import { z } from 'zod'

// Common validation messages in both languages
export const validationMessages = {
  fr: {
    required: 'Ce champ est requis',
    email: 'Veuillez saisir une adresse email valide',
    minLength: (min: number) => `Minimum ${min} caractères requis`,
    maxLength: (max: number) => `Maximum ${max} caractères autorisés`,
    phone: 'Veuillez saisir un numéro de téléphone valide',
    fileSize: 'Le fichier est trop volumineux (max 10MB)',
    fileType: 'Type de fichier non autorisé'
  },
  ar: {
    required: 'هذا الحقل مطلوب',
    email: 'يرجى إدخال عنوان بريد إلكتروني صالح',
    minLength: (min: number) => `الحد الأدنى ${min} أحرف مطلوبة`,
    maxLength: (max: number) => `الحد الأقصى ${max} أحرف مسموحة`,
    phone: 'يرجى إدخال رقم هاتف صالح',
    fileSize: 'الملف كبير جداً (الحد الأقصى 10 ميجابايت)',
    fileType: 'نوع الملف غير مسموح'
  }
}

// Contact Form Schema Factory
export const createContactFormSchema = (locale: 'fr' | 'ar' = 'fr') => {
  const messages = validationMessages[locale]
  
  return z.object({
    name: z.string()
      .min(2, messages.minLength(2))
      .max(100, messages.maxLength(100)),
    
    email: z.string()
      .email(messages.email),
      
    phone: z.string()
      .optional()
      .refine((val) => !val || /^[+]?[0-9\s\-\(\)]{8,}$/.test(val), {
        message: messages.phone
      }),
      
    subject: z.string()
      .min(5, messages.minLength(5))
      .max(200, messages.maxLength(200)),
      
    message: z.string()
      .min(10, messages.minLength(10))
      .max(2000, messages.maxLength(2000)),
      
    locale: z.enum(['fr', 'ar']),
    
    formType: z.literal('contact')
  })
}

// Default export for backward compatibility
export const contactFormSchema = createContactFormSchema('fr')


// Document Request Form Schema
export const documentRequestSchema = z.object({
  name: z.string()
    .min(2, validationMessages.fr.minLength(2))
    .max(100, validationMessages.fr.maxLength(100)),
    
  email: z.string()
    .email(validationMessages.fr.email),
    
  phone: z.string()
    .min(8, validationMessages.fr.minLength(8))
    .max(20, validationMessages.fr.maxLength(20)),
    
  nationalId: z.string()
    .optional(),
    
  documentType: z.enum(['license', 'permit', 'certificate', 'authorization', 'other']),
  
  documentDescription: z.string()
    .min(10, validationMessages.fr.minLength(10))
    .max(500, validationMessages.fr.maxLength(500)),
    
  urgency: z.enum(['normal', 'urgent', 'very-urgent']),
  
  purpose: z.string()
    .min(10, validationMessages.fr.minLength(10))
    .max(1000, validationMessages.fr.maxLength(1000)),
    
  attachments: z.array(z.string())
    .optional(),
    
  locale: z.enum(['fr', 'ar']),
  
  formType: z.literal('document-request')
})

// Export types
export type ContactFormData = z.infer<typeof contactFormSchema>
export type DocumentRequestData = z.infer<typeof documentRequestSchema>

export type FormData = ContactFormData | DocumentRequestData

// Form type union for validation
export const formSchemas = {
  contact: contactFormSchema,
  'document-request': documentRequestSchema
} as const

export type FormType = keyof typeof formSchemas