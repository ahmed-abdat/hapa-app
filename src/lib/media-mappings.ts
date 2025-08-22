/**
 * Media label mappings for converting raw database values to localized display labels
 * Used by admin dashboard and other components that display media channel/station data
 */

export interface MediaOption {
  value: string
  label: string
  labelAr: string
  category?: string
}

// Radio station mappings extracted from RadioStationCombobox
export const radioStations: MediaOption[] = [
  // State radio stations
  { value: 'radio_mauritanie', label: 'Radio Mauritanie', labelAr: 'إذاعة موريتانيا', category: 'state' },
  { value: 'radio_jeunesse', label: 'Radio Jeunesse', labelAr: 'إذاعة الشباب', category: 'state' },
  { value: 'radio_femmes', label: 'Radio Femmes', labelAr: 'إذاعة النساء', category: 'state' },
  { value: 'radio_culture', label: 'Radio Culture', labelAr: 'إذاعة الثقافة', category: 'state' },
  { value: 'radio_coran', label: 'Radio Coran', labelAr: 'إذاعة القرآن', category: 'state' },
  { value: 'radio_regions', label: 'Radio Régions', labelAr: 'إذاعة الأقاليم', category: 'state' },
  
  // Private radio stations
  { value: 'fm_sahel', label: 'FM Sahel', labelAr: 'إف إم ساحل', category: 'private' },
  { value: 'radio_tenwir', label: 'Radio Tenwir', labelAr: 'إذاعة تنوير', category: 'private' },
  { value: 'radio_andalous', label: 'Radio Andalous', labelAr: 'إذاعة الأندلس', category: 'private' },
  { value: 'radio_hawwa', label: 'Radio Hawwa', labelAr: 'إذاعة حواء', category: 'private' },
  { value: 'radio_nouakchott', label: 'Radio Nouakchott', labelAr: 'إذاعة نواكشوط', category: 'private' },
  { value: 'radio_wassit', label: 'Radio Wassit', labelAr: 'إذاعة وسيط', category: 'private' },
  { value: 'medina_fm', label: 'Medina FM', labelAr: 'مدينة إف إم', category: 'private' },
  { value: 'radio_assalam', label: 'Radio Assalam', labelAr: 'إذاعة السلام', category: 'private' },
  { value: 'radio_chinguetti', label: 'Radio Chinguetti', labelAr: 'إذاعة شنقيط', category: 'private' },
  { value: 'radio_watan', label: 'Radio Watan', labelAr: 'إذاعة وطن', category: 'private' },
  
  // International radio stations
  { value: 'bbc_arabic', label: 'BBC Arabic', labelAr: 'بي بي سي عربي', category: 'international' },
  { value: 'radio_france_internationale', label: 'RFI', labelAr: 'راديو فرنسا الدولية', category: 'international' },
  { value: 'monte_carlo_doualiya', label: 'Monte Carlo Doualiya', labelAr: 'مونت كارلو الدولية', category: 'international' },
  { value: 'voice_of_america', label: 'Voice of America', labelAr: 'صوت أميركا', category: 'international' },
  { value: 'radio_sawa', label: 'Radio Sawa', labelAr: 'راديو سوا', category: 'international' },
]

// TV channel mappings extracted from TVChannelCombobox
export const tvChannels: MediaOption[] = [
  // State TV channels
  { value: 'tv_mauritanie', label: 'TV Mauritanie', labelAr: 'تلفزيون موريتانيا', category: 'state' },
  { value: 'al_mourabitoun', label: 'Al Mourabitoun', labelAr: 'المرابطون', category: 'state' },
  { value: 'tv_el_mouritaniya', label: 'TV El Mouritaniya', labelAr: 'تلفزيون الموريتانية', category: 'state' },
  { value: 'sahara_tv', label: 'Sahara TV', labelAr: 'تلفزيون الصحراء', category: 'state' },
  
  // Private TV channels
  { value: 'el_wataniya', label: 'El Wataniya', labelAr: 'الوطنية', category: 'private' },
  { value: 'chinguetti_tv', label: 'Chinguetti TV', labelAr: 'تلفزيون شنقيط', category: 'private' },
  { value: 'mauritanie_24', label: 'Mauritanie 24', labelAr: 'موريتانيا 24', category: 'private' },
  { value: 'al_akhbar', label: 'Al Akhbar', labelAr: 'الأخبار', category: 'private' },
  { value: 'tv_kobeni', label: 'TV Kobeni', labelAr: 'تلفزيون كوبني', category: 'private' },
  { value: 'dava_tv', label: 'Dava TV', labelAr: 'دعوة تي في', category: 'private' },
  { value: 'el_mayadeen_mauritanie', label: 'El Mayadeen Mauritanie', labelAr: 'الميادين موريتانيا', category: 'private' },
  
  // International TV channels
  { value: 'al_jazeera', label: 'Al Jazeera', labelAr: 'الجزيرة', category: 'international' },
  { value: 'bbc_arabic_tv', label: 'BBC Arabic', labelAr: 'بي بي سي عربي', category: 'international' },
  { value: 'france_24_arabic', label: 'France 24 Arabic', labelAr: 'فرانس 24 عربي', category: 'international' },
  { value: 'al_arabiya', label: 'Al Arabiya', labelAr: 'العربية', category: 'international' },
  { value: 'cnn_arabic', label: 'CNN Arabic', labelAr: 'سي إن إن عربي', category: 'international' },
  { value: 'euronews_arabic', label: 'Euronews Arabic', labelAr: 'يورونيوز عربي', category: 'international' },
  { value: 'dw_arabic', label: 'DW Arabic', labelAr: 'دويتشه فيله عربي', category: 'international' },
]

/**
 * Get localized label for a radio station
 * @param value - Raw radio station value from database
 * @param locale - Current locale ('fr' | 'ar')
 * @returns Localized label or fallback to raw value
 */
export function getRadioStationLabel(value: string, locale: 'fr' | 'ar' = 'fr'): string {
  const station = radioStations.find(s => s.value === value)
  if (!station) return value // Fallback to raw value
  
  return locale === 'ar' ? station.labelAr : station.label
}

/**
 * Get localized label for a TV channel
 * @param value - Raw TV channel value from database
 * @param locale - Current locale ('fr' | 'ar')
 * @returns Localized label or fallback to raw value
 */
export function getTVChannelLabel(value: string, locale: 'fr' | 'ar' = 'fr'): string {
  const channel = tvChannels.find(c => c.value === value)
  if (!channel) return value // Fallback to raw value
  
  return locale === 'ar' ? channel.labelAr : channel.label
}

/**
 * Get localized label for any media channel (radio or TV)
 * @param value - Raw media channel value from database
 * @param mediaType - Type of media ('radio' | 'television')
 * @param locale - Current locale ('fr' | 'ar')
 * @returns Localized label or fallback to raw value
 */
export function getMediaChannelLabel(
  value: string, 
  mediaType: 'radio' | 'television', 
  locale: 'fr' | 'ar' = 'fr'
): string {
  if (mediaType === 'radio') {
    return getRadioStationLabel(value, locale)
  } else if (mediaType === 'television') {
    return getTVChannelLabel(value, locale)
  }
  
  return value // Fallback to raw value
}

/**
 * Get all available radio stations
 */
export function getRadioStations(): MediaOption[] {
  return radioStations
}

/**
 * Get all available TV channels
 */
export function getTVChannels(): MediaOption[] {
  return tvChannels
}

/**
 * Get all media options for a specific type
 * @param mediaType - Type of media ('radio' | 'television')
 * @returns Array of media options
 */
export function getMediaOptions(mediaType: 'radio' | 'television'): MediaOption[] {
  return mediaType === 'radio' ? radioStations : tvChannels
}

// Media type mappings
export const mediaTypes: MediaOption[] = [
  { value: 'radio', label: 'Radio', labelAr: 'راديو' },
  { value: 'television', label: 'Télévision', labelAr: 'تلفزيون' },
  { value: 'online', label: 'En ligne', labelAr: 'عبر الإنترنت' },
  { value: 'print', label: 'Presse écrite', labelAr: 'صحافة مكتوبة' },
  { value: 'other', label: 'Autre', labelAr: 'أخرى' },
]

/**
 * Get localized label for a media type
 * @param value - Raw media type value from database
 * @param locale - Current locale ('fr' | 'ar')
 * @returns Localized label or fallback to raw value
 */
export function getMediaTypeLabel(value: string, locale: 'fr' | 'ar' = 'fr'): string {
  const mediaType = mediaTypes.find(t => t.value === value)
  if (!mediaType) return value // Fallback to raw value
  
  return locale === 'ar' ? mediaType.labelAr : mediaType.label
}