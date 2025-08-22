export interface AttachmentTypeTranslation {
  label: {
    fr: string
    ar: string
  }
  description?: {
    fr: string
    ar: string
  }
}

export const attachmentTypeTranslations: Record<string, AttachmentTypeTranslation> = {
  screenshot: {
    label: {
      fr: 'Capture d\'écran',
      ar: 'لقطة شاشة'
    },
    description: {
      fr: 'Image capturée de l\'écran',
      ar: 'صورة ملتقطة من الشاشة'
    }
  },
  videoLink: {
    label: {
      fr: 'Lien vidéo',
      ar: 'رابط فيديو'
    },
    description: {
      fr: 'URL vers une vidéo en ligne',
      ar: 'رابط إلى فيديو على الإنترنت'
    }
  },
  writtenStatement: {
    label: {
      fr: 'Déclaration écrite',
      ar: 'بيان مكتوب'
    },
    description: {
      fr: 'Document ou témoignage écrit',
      ar: 'وثيقة أو شهادة مكتوبة'
    }
  },
  audioRecording: {
    label: {
      fr: 'Enregistrement audio',
      ar: 'تسجيل صوتي'
    },
    description: {
      fr: 'Fichier audio enregistré',
      ar: 'ملف صوتي مسجل'
    }
  },
  document: {
    label: {
      fr: 'Document',
      ar: 'وثيقة'
    },
    description: {
      fr: 'Fichier document (PDF, Word, etc.)',
      ar: 'ملف وثيقة (PDF، Word، إلخ)'
    }
  },
  image: {
    label: {
      fr: 'Image',
      ar: 'صورة'
    },
    description: {
      fr: 'Fichier image',
      ar: 'ملف صورة'
    }
  },
  video: {
    label: {
      fr: 'Vidéo',
      ar: 'فيديو'
    },
    description: {
      fr: 'Fichier vidéo',
      ar: 'ملف فيديو'
    }
  }
}

export function getAttachmentTypeLabel(type: string, locale: 'fr' | 'ar' = 'fr'): string {
  const translation = attachmentTypeTranslations[type]
  if (!translation) {
    return type // Fallback to key if no translation found
  }
  return translation.label[locale] || translation.label.fr // Fallback to French if Arabic not available
}

export function getAttachmentTypeDescription(type: string, locale: 'fr' | 'ar' = 'fr'): string {
  const translation = attachmentTypeTranslations[type]
  if (!translation || !translation.description) {
    return ''
  }
  return translation.description[locale] || translation.description.fr
}