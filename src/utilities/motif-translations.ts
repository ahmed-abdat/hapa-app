/**
 * Motif Translation and Visualization System
 * Maps raw database keys to French labels with visual indicators
 * Used for enhanced admin UX in MediaContentSubmissions
 */

import type { LucideIcon } from 'lucide-react'
import { 
  AlertTriangle, 
  MessageSquareWarning, 
  Shield, 
  Zap, 
  Users, 
  Ban,
  HelpCircle
} from 'lucide-react'

export interface MotifConfig {
  key: string
  label: {
    fr: string
    ar: string
  }
  description: {
    fr: string
    ar: string
  }
  icon: LucideIcon
  severity: 'critical' | 'high' | 'medium' | 'low'
  color: string
  bgColor: string
}

/**
 * Comprehensive motif configuration with visual indicators
 * Matches the frontend form options for consistency
 */
export const MOTIF_CONFIGS: Record<string, MotifConfig> = {
  hateSpeech: {
    key: 'hateSpeech',
    label: {
      fr: 'Discours de haine / Incitation à la violence',
      ar: 'خطاب الكراهية / التحريض على العنف'
    },
    description: {
      fr: 'Contenu encourageant la haine ou la violence contre des groupes ou individus',
      ar: 'محتوى يشجع على الكراهية أو العنف ضد مجموعات أو أفراد'
    },
    icon: AlertTriangle,
    severity: 'critical',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
  },
  fakeNews: {
    key: 'fakeNews',
    label: {
      fr: 'Désinformation / Informations mensongères',
      ar: 'معلومات مضللة / أخبار كاذبة'
    },
    description: {
      fr: 'Contenu contenant de fausses informations ou de la désinformation',
      ar: 'محتوى يحتوي على معلومات خاطئة أو معلومات مضللة'
    },
    icon: MessageSquareWarning,
    severity: 'critical',
    color: '#ea580c', // orange-600
    bgColor: '#fff7ed', // orange-50
  },
  misinformation: {
    key: 'misinformation',
    label: {
      fr: 'Désinformation / Informations mensongères',
      ar: 'معلومات مضللة / أخبار كاذبة'
    },
    description: {
      fr: 'Contenu contenant de fausses informations ou de la désinformation',
      ar: 'محتوى يحتوي على معلومات خاطئة أو معلومات مضللة'
    },
    icon: MessageSquareWarning,
    severity: 'critical',
    color: '#ea580c', // orange-600
    bgColor: '#fff7ed', // orange-50
  },
  privacyViolation: {
    key: 'privacyViolation',
    label: {
      fr: 'Atteinte à la vie privée / Diffamation',
      ar: 'انتهاك الخصوصية / التشهير'
    },
    description: {
      fr: 'Contenu violant la vie privée ou diffamatoire',
      ar: 'محتوى ينتهك الخصوصية أو يحتوي على تشهير'
    },
    icon: Shield,
    severity: 'high',
    color: '#7c3aed', // violet-600
    bgColor: '#faf5ff', // violet-50
  },
  shockingContent: {
    key: 'shockingContent',
    label: {
      fr: 'Contenu choquant / Violent / Inapproprié',
      ar: 'محتوى صادم / عنيف / غير مناسب'
    },
    description: {
      fr: 'Contenu graphique, violent ou inapproprié pour le public',
      ar: 'محتوى مصور أو عنيف أو غير مناسب للجمهور'
    },
    icon: Zap,
    severity: 'high',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
  },
  pluralismViolation: {
    key: 'pluralismViolation',
    label: {
      fr: 'Non-respect du pluralisme politique',
      ar: 'عدم احترام التعددية السياسية'
    },
    description: {
      fr: 'Contenu ne respectant pas le pluralisme politique et médiatique',
      ar: 'محتوى لا يحترم التعددية السياسية والإعلامية'
    },
    icon: Users,
    severity: 'medium',
    color: '#0369a1', // sky-700
    bgColor: '#f0f9ff', // sky-50
  },
  falseAdvertising: {
    key: 'falseAdvertising',
    label: {
      fr: 'Publicité mensongère ou interdite',
      ar: 'إعلان كاذب أو محظور'
    },
    description: {
      fr: 'Publicité contenant des informations trompeuses ou interdites',
      ar: 'إعلان يحتوي على معلومات مضللة أو محظورة'
    },
    icon: Ban,
    severity: 'medium',
    color: '#059669', // emerald-600
    bgColor: '#ecfdf5', // emerald-50
  },
  other: {
    key: 'other',
    label: {
      fr: 'Autre motif',
      ar: 'سبب آخر'
    },
    description: {
      fr: 'Autre motif non listé ci-dessus',
      ar: 'سبب آخر غير مدرج أعلاه'
    },
    icon: HelpCircle,
    severity: 'low',
    color: '#6b7280', // gray-500
    bgColor: '#f9fafb', // gray-50
  },
}

/**
 * Get motif configuration by key
 * Returns default config for unknown keys
 */
export function getMotifConfig(key: string): MotifConfig {
  return MOTIF_CONFIGS[key] || {
    key,
    label: {
      fr: key,
      ar: key
    },
    description: {
      fr: 'Motif personnalisé',
      ar: 'سبب مخصص'
    },
    icon: HelpCircle,
    severity: 'low',
    color: '#6b7280',
    bgColor: '#f9fafb',
  }
}

/**
 * Get localized label for a motif key
 * Supports both French and Arabic
 * Fallback to the key itself if no translation found
 */
export function getMotifLabel(key: string, locale: 'fr' | 'ar' = 'fr'): string {
  const config = getMotifConfig(key)
  return config.label[locale] || config.label.fr || key
}

/**
 * Get localized description for a motif key
 */
export function getMotifDescription(key: string, locale: 'fr' | 'ar' = 'fr'): string {
  const config = getMotifConfig(key)
  return config.description[locale] || config.description.fr || ''
}

/**
 * Get all motif configs sorted by severity
 */
export function getAllMotifConfigs(): MotifConfig[] {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return Object.values(MOTIF_CONFIGS).sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  )
}

/**
 * Check if a motif key is considered urgent/critical
 */
export function isUrgentMotif(key: string): boolean {
  const config = getMotifConfig(key)
  return config.severity === 'critical' || config.severity === 'high'
}