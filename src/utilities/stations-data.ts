/**
 * Media Stations Data Utility
 * Centralized data for TV channels and radio stations
 * Extracted from form validation components for use in directory pages
 */

export interface Station {
  value: string
  label: string
  labelAr: string
  category: 'state' | 'private' | 'regional' | 'other'
  frequency?: string
  coverage?: string
  website?: string
  description?: string
  descriptionAr?: string
}

export interface MediaType {
  id: 'radio' | 'television' | 'digital' | 'print'
  icon: string
  titleKey: string
  descKey: string
  stations?: Station[]
  comingSoon?: boolean
}

// TV Channels data - extracted from TVChannelCombobox
export const tvChannels: Station[] = [
  // El Mouritaniya channels (official state channels)
  {
    value: 'mouritaniya',
    label: 'El Mouritaniya',
    labelAr: 'الموريتانية',
    category: 'state',
    description: 'Chaîne nationale officielle de Mauritanie',
    descriptionAr: 'القناة الوطنية الرسمية لموريتانيا',
    website: 'https://elmouritania.mr'
  },
  {
    value: 'mouritaniya2',
    label: 'El Mouritaniya 2',
    labelAr: 'الموريتانية 2',
    category: 'state',
    description: 'Deuxième chaîne nationale généraliste',
    descriptionAr: 'القناة الوطنية الثانية العامة',
  },
  {
    value: 'thakafiya',
    label: 'Thakafiya',
    labelAr: 'الثقافية',
    category: 'state',
    description: 'Chaîne culturelle et éducative nationale',
    descriptionAr: 'القناة الثقافية والتعليمية الوطنية',
  },
  {
    value: 'riyadiya',
    label: 'Riyadiya',
    labelAr: 'الرياضية',
    category: 'state',
    description: 'Chaîne sportive nationale',
    descriptionAr: 'القناة الرياضية الوطنية',
  },
  {
    value: 'parlement',
    label: 'Parlement TV',
    labelAr: 'البرلمانية',
    category: 'state',
    description: 'Chaîne parlementaire officielle',
    descriptionAr: 'القناة البرلمانية الرسمية',
  },
  
  // Private channels
  {
    value: 'mahdhara',
    label: 'Al Mahdhara TV',
    labelAr: 'قناة المحظرة',
    category: 'private',
    description: 'Chaîne privée d\'information et de culture',
    descriptionAr: 'قناة خاصة للأخبار والثقافة',
  },
  {
    value: 'ousra',
    label: 'Al Ousra TV',
    labelAr: 'قناة الأسرة',
    category: 'private',
    description: 'Chaîne familiale et sociale',
    descriptionAr: 'قناة أسرية واجتماعية',
  },
  {
    value: 'mourabitoune',
    label: 'El Mourabitoune',
    labelAr: 'المرابطون',
    category: 'private',
    description: 'Chaîne privée généraliste',
    descriptionAr: 'قناة خاصة عامة',
  },
  {
    value: 'wataniya',
    label: 'El Wataniya',
    labelAr: 'الوطنية',
    category: 'private',
    description: 'Chaîne privée d\'actualités',
    descriptionAr: 'قناة أخبار خاصة',
  },
  {
    value: 'chinguitt',
    label: 'Chinguitt',
    labelAr: 'شنقيط',
    category: 'private',
    description: 'Chaîne culturelle privée',
    descriptionAr: 'قناة ثقافية خاصة',
  },
  {
    value: 'sahel',
    label: 'Sahel TV',
    labelAr: 'قناة الساحل',
    category: 'private',
    description: 'Chaîne régionale du Sahel',
    descriptionAr: 'قناة الساحل الجهوية',
  },
  {
    value: 'dava',
    label: 'DAVA TV',
    labelAr: 'قناة دافا',
    category: 'private',
    description: 'Chaîne privée d\'information',
    descriptionAr: 'قناة إعلامية خاصة',
  },
  {
    value: 'medina',
    label: 'Elmedina TV',
    labelAr: 'قناة المدينة',
    category: 'private',
    description: 'Chaîne urbaine et sociale',
    descriptionAr: 'قناة حضرية واجتماعية',
  },
  {
    value: 'sahra24',
    label: 'Sahra24 TV',
    labelAr: 'قناة صحراء 24',
    category: 'private',
    description: 'Chaîne d\'information 24h/24',
    descriptionAr: 'قناة أخبار على مدار الساعة',
  },
  {
    value: 'ghimem',
    label: 'Ghimem TV',
    labelAr: 'قناة قمم',
    category: 'private',
    description: 'Chaîne privée généraliste',
    descriptionAr: 'قناة خاصة عامة',
  },
]

// Radio Stations data - extracted from RadioStationCombobox
export const radioStations: Station[] = [
  // Radio Mauritanie (official state radio network)
  {
    value: 'radio_mauritanie',
    label: 'Radio Mauritanie',
    labelAr: 'إذاعة موريتانيا الأم',
    category: 'state',
    frequency: 'FM 95.5 - MW 549',
    coverage: 'National',
    description: 'Radio nationale officielle de Mauritanie',
    descriptionAr: 'الإذاعة الوطنية الرسمية لموريتانيا',
    website: 'https://radiomauritanie.mr'
  },
  {
    value: 'radio_coran',
    label: 'Radio Coran',
    labelAr: 'إذاعة القرآن الكريم',
    category: 'state',
    frequency: 'FM 98.0',
    coverage: 'National',
    description: 'Radio consacrée au Saint Coran et à l\'enseignement religieux',
    descriptionAr: 'إذاعة مخصصة للقرآن الكريم والتعليم الديني',
  },
  {
    value: 'radio_scolaire',
    label: 'Radio scolaire',
    labelAr: 'الاذاعة المدرسية',
    category: 'state',
    frequency: 'FM 101.5',
    coverage: 'National',
    description: 'Radio éducative pour l\'enseignement et la formation',
    descriptionAr: 'إذاعة تعليمية للتعليم والتكوين',
  },
  {
    value: 'radio_jeunesse',
    label: 'Radio Jeunesse',
    labelAr: 'إذاعة الشباب',
    category: 'state',
    frequency: 'FM 103.0',
    coverage: 'National',
    description: 'Radio destinée aux jeunes et à leurs préoccupations',
    descriptionAr: 'إذاعة موجهة للشباب واهتماماتهم',
  },
  {
    value: 'radio_culture',
    label: 'Radio culture',
    labelAr: 'الإذاعة الثقافية',
    category: 'state',
    frequency: 'FM 105.5',
    coverage: 'National',
    description: 'Radio culturelle et artistique nationale',
    descriptionAr: 'الإذاعة الثقافية والفنية الوطنية',
  },
  {
    value: 'radio_sante',
    label: 'Radio Éducation à la santé',
    labelAr: 'إذاعة التثقيف الصحي',
    category: 'state',
    frequency: 'FM 107.0',
    coverage: 'National',
    description: 'Radio d\'éducation sanitaire et de sensibilisation',
    descriptionAr: 'إذاعة التثقيف الصحي والتوعية',
  },
  {
    value: 'radio_rurale',
    label: 'Radio rurale',
    labelAr: 'الإذاعة الريفية',
    category: 'state',
    frequency: 'FM 109.5',
    coverage: 'Rural',
    description: 'Radio dédiée au développement rural et agricole',
    descriptionAr: 'إذاعة مخصصة للتنمية الريفية والزراعية',
  },
  
  // Private radio stations
  {
    value: 'radio_mauritanides',
    label: 'Radio Mauritanides',
    labelAr: 'إذاعة موريتانيد',
    category: 'private',
    frequency: 'FM 89.5',
    coverage: 'Nouakchott et région',
    description: 'Radio privée d\'information et de divertissement',
    descriptionAr: 'إذاعة خاصة للأخبار والترفيه',
  },
  {
    value: 'radio_koubeni',
    label: 'Radio Koubeni',
    labelAr: 'إذاعة كوبني',
    category: 'private',
    frequency: 'FM 91.0',
    coverage: 'Régionale',
    description: 'Radio communautaire et culturelle',
    descriptionAr: 'إذاعة مجتمعية وثقافية',
  },
  {
    value: 'radio_tenwir',
    label: 'Radio Tenwir',
    labelAr: 'إذاعة التنوير',
    category: 'private',
    frequency: 'FM 92.5',
    coverage: 'Nouakchott',
    description: 'Radio d\'éducation et d\'information privée',
    descriptionAr: 'إذاعة تعليمية وإعلامية خاصة',
  },
]

// Media types configuration
export const mediaTypes: MediaType[] = [
  {
    id: 'radio',
    icon: 'Radio',
    titleKey: 'radioStations',
    descKey: 'radioStationsDesc',
    stations: radioStations,
  },
  {
    id: 'television',
    icon: 'Tv',
    titleKey: 'televisionChannels',
    descKey: 'televisionChannelsDesc',
    stations: tvChannels,
  },
  {
    id: 'digital',
    icon: 'Globe',
    titleKey: 'newsWebsites',
    descKey: 'newsWebsitesDesc',
    comingSoon: true,
  },
  {
    id: 'print',
    icon: 'Newspaper',
    titleKey: 'pressMagazines',
    descKey: 'pressMagazinesDesc',
    comingSoon: true,
  },
]

// Utility functions
export function getStationsByType(type: 'radio' | 'television'): Station[] {
  return type === 'radio' ? radioStations : tvChannels
}

export function getStationBySlug(type: 'radio' | 'television', slug: string): Station | undefined {
  const stations = getStationsByType(type)
  return stations.find(station => station.value === slug)
}

export function getStationsByCategory(type: 'radio' | 'television', category: Station['category']): Station[] {
  const stations = getStationsByType(type)
  return stations.filter(station => station.category === category)
}

export function getStationCounts() {
  return {
    radio: {
      total: radioStations.length,
      state: radioStations.filter(s => s.category === 'state').length,
      private: radioStations.filter(s => s.category === 'private').length,
      regional: radioStations.filter(s => s.category === 'regional').length,
    },
    television: {
      total: tvChannels.length,
      state: tvChannels.filter(s => s.category === 'state').length,
      private: tvChannels.filter(s => s.category === 'private').length,
    }
  }
}

export function searchStations(
  type: 'radio' | 'television',
  query: string,
  locale: 'fr' | 'ar' = 'fr'
): Station[] {
  const stations = getStationsByType(type)
  const searchQuery = query.toLowerCase().trim()
  
  if (!searchQuery) return stations
  
  return stations.filter(station => {
    const label = locale === 'ar' ? station.labelAr : station.label
    const description = locale === 'ar' ? station.descriptionAr : station.description
    
    return (
      label.toLowerCase().includes(searchQuery) ||
      (description && description.toLowerCase().includes(searchQuery)) ||
      (station.frequency && station.frequency.toLowerCase().includes(searchQuery)) ||
      (station.coverage && station.coverage.toLowerCase().includes(searchQuery))
    )
  })
}