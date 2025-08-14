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
  label: string
  description: string
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
    label: 'Discours de haine / Incitation à la violence',
    description: 'Contenu encourageant la haine ou la violence contre des groupes ou individus',
    icon: AlertTriangle,
    severity: 'critical',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
  },
  fakeNews: {
    key: 'fakeNews',
    label: 'Désinformation / Informations mensongères',
    description: 'Contenu contenant de fausses informations ou de la désinformation',
    icon: MessageSquareWarning,
    severity: 'critical',
    color: '#ea580c', // orange-600
    bgColor: '#fff7ed', // orange-50
  },
  misinformation: {
    key: 'misinformation',
    label: 'Désinformation / Informations mensongères',
    description: 'Contenu contenant de fausses informations ou de la désinformation',
    icon: MessageSquareWarning,
    severity: 'critical',
    color: '#ea580c', // orange-600
    bgColor: '#fff7ed', // orange-50
  },
  privacyViolation: {
    key: 'privacyViolation',
    label: 'Atteinte à la vie privée / Diffamation',
    description: 'Contenu violant la vie privée ou diffamatoire',
    icon: Shield,
    severity: 'high',
    color: '#7c3aed', // violet-600
    bgColor: '#faf5ff', // violet-50
  },
  shockingContent: {
    key: 'shockingContent',
    label: 'Contenu choquant / Violent / Inapproprié',
    description: 'Contenu graphique, violent ou inapproprié pour le public',
    icon: Zap,
    severity: 'high',
    color: '#dc2626', // red-600
    bgColor: '#fef2f2', // red-50
  },
  pluralismViolation: {
    key: 'pluralismViolation',
    label: 'Non-respect du pluralisme politique',
    description: 'Contenu ne respectant pas le pluralisme politique et médiatique',
    icon: Users,
    severity: 'medium',
    color: '#0369a1', // sky-700
    bgColor: '#f0f9ff', // sky-50
  },
  falseAdvertising: {
    key: 'falseAdvertising',
    label: 'Publicité mensongère ou interdite',
    description: 'Publicité contenant des informations trompeuses ou interdites',
    icon: Ban,
    severity: 'medium',
    color: '#059669', // emerald-600
    bgColor: '#ecfdf5', // emerald-50
  },
  other: {
    key: 'other',
    label: 'Autre motif',
    description: 'Autre motif non listé ci-dessus',
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
    label: key,
    description: 'Motif personnalisé',
    icon: HelpCircle,
    severity: 'low',
    color: '#6b7280',
    bgColor: '#f9fafb',
  }
}

/**
 * Get French label for a motif key
 * Fallback to the key itself if no translation found
 */
export function getMotifLabel(key: string): string {
  const config = getMotifConfig(key)
  return config.label
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