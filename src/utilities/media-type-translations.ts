export interface MediaTypeTranslation {
  label: {
    fr: string
    ar: string
  }
  icon?: string
}

export const mediaTypeTranslations: Record<string, MediaTypeTranslation> = {
  television: {
    label: {
      fr: 'Télévision',
      ar: 'تلفزيون'
    },
    icon: '📺'
  },
  radio: {
    label: {
      fr: 'Radio',
      ar: 'راديو'
    },
    icon: '📻'
  },
  website: {
    label: {
      fr: 'Site web',
      ar: 'موقع ويب'
    },
    icon: '🌐'
  },
  newspaper: {
    label: {
      fr: 'Journal',
      ar: 'صحيفة'
    },
    icon: '📰'
  },
  magazine: {
    label: {
      fr: 'Magazine',
      ar: 'مجلة'
    },
    icon: '📖'
  },
  youtube: {
    label: {
      fr: 'YouTube',
      ar: 'يوتيوب'
    },
    icon: '▶️'
  },
  facebook: {
    label: {
      fr: 'Facebook',
      ar: 'فيسبوك'
    },
    icon: '👤'
  },
  twitter: {
    label: {
      fr: 'Twitter',
      ar: 'تويتر'
    },
    icon: '🐦'
  },
  instagram: {
    label: {
      fr: 'Instagram',
      ar: 'إنستغرام'
    },
    icon: '📷'
  },
  tiktok: {
    label: {
      fr: 'TikTok',
      ar: 'تيك توك'
    },
    icon: '🎵'
  },
  whatsapp: {
    label: {
      fr: 'WhatsApp',
      ar: 'واتساب'
    },
    icon: '💬'
  },
  podcast: {
    label: {
      fr: 'Podcast',
      ar: 'بودكاست'
    },
    icon: '🎙️'
  },
  other: {
    label: {
      fr: 'Autre',
      ar: 'آخر'
    },
    icon: '📱'
  }
}

export function getMediaTypeLabel(type: string, locale: 'fr' | 'ar' = 'fr'): string {
  const translation = mediaTypeTranslations[type]
  if (!translation) {
    return type // Fallback to key if no translation found
  }
  return translation.label[locale] || translation.label.fr // Fallback to French if Arabic not available
}

export function getMediaTypeIcon(type: string): string {
  const translation = mediaTypeTranslations[type]
  return translation?.icon || '📱'
}