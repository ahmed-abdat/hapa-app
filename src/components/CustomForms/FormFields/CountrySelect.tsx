'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { FormSelect } from './FormSelect'
import { type FormSelectProps } from '../types'

// Comprehensive country list with flag emojis (ISO 3166-1 compliant)
const countries = [
  // Mauritania and neighboring countries (prioritized for HAPA)
  { value: 'MR', label: '🇲🇷 Mauritanie', labelAr: '🇲🇷 موريتانيا' },
  { value: 'MA', label: '🇲🇦 Maroc', labelAr: '🇲🇦 المغرب' },
  { value: 'DZ', label: '🇩🇿 Algérie', labelAr: '🇩🇿 الجزائر' },
  { value: 'TN', label: '🇹🇳 Tunisie', labelAr: '🇹🇳 تونس' },
  { value: 'SN', label: '🇸🇳 Sénégal', labelAr: '🇸🇳 السنغال' },
  { value: 'ML', label: '🇲🇱 Mali', labelAr: '🇲🇱 مالي' },
  
  // West Africa
  { value: 'BF', label: '🇧🇫 Burkina Faso', labelAr: '🇧🇫 بوركينا فاسو' },
  { value: 'CI', label: '🇨🇮 Côte d\'Ivoire', labelAr: '🇨🇮 ساحل العاج' },
  { value: 'GH', label: '🇬🇭 Ghana', labelAr: '🇬🇭 غانا' },
  { value: 'GN', label: '🇬🇳 Guinée', labelAr: '🇬🇳 غينيا' },
  { value: 'GW', label: '🇬🇼 Guinée-Bissau', labelAr: '🇬🇼 غينيا بيساو' },
  { value: 'LR', label: '🇱🇷 Liberia', labelAr: '🇱🇷 ليبيريا' },
  { value: 'NE', label: '🇳🇪 Niger', labelAr: '🇳🇪 النيجر' },
  { value: 'NG', label: '🇳🇬 Nigeria', labelAr: '🇳🇬 نيجيريا' },
  { value: 'SL', label: '🇸🇱 Sierra Leone', labelAr: '🇸🇱 سيراليون' },
  { value: 'TG', label: '🇹🇬 Togo', labelAr: '🇹🇬 توغو' },
  
  // North Africa & Middle East
  { value: 'EG', label: '🇪🇬 Égypte', labelAr: '🇪🇬 مصر' },
  { value: 'LY', label: '🇱🇾 Libye', labelAr: '🇱🇾 ليبيا' },
  { value: 'SD', label: '🇸🇩 Soudan', labelAr: '🇸🇩 السودان' },
  { value: 'TD', label: '🇹🇩 Tchad', labelAr: '🇹🇩 تشاد' },
  { value: 'AE', label: '🇦🇪 Émirats arabes unis', labelAr: '🇦🇪 الإمارات العربية المتحدة' },
  { value: 'SA', label: '🇸🇦 Arabie saoudite', labelAr: '🇸🇦 المملكة العربية السعودية' },
  { value: 'QA', label: '🇶🇦 Qatar', labelAr: '🇶🇦 قطر' },
  { value: 'KW', label: '🇰🇼 Koweït', labelAr: '🇰🇼 الكويت' },
  { value: 'BH', label: '🇧🇭 Bahreïn', labelAr: '🇧🇭 البحرين' },
  { value: 'OM', label: '🇴🇲 Oman', labelAr: '🇴🇲 عمان' },
  { value: 'JO', label: '🇯🇴 Jordanie', labelAr: '🇯🇴 الأردن' },
  { value: 'LB', label: '🇱🇧 Liban', labelAr: '🇱🇧 لبنان' },
  { value: 'SY', label: '🇸🇾 Syrie', labelAr: '🇸🇾 سوريا' },
  { value: 'IQ', label: '🇮🇶 Iraq', labelAr: '🇮🇶 العراق' },
  { value: 'IR', label: '🇮🇷 Iran', labelAr: '🇮🇷 إيران' },
  { value: 'TR', label: '🇹🇷 Turquie', labelAr: '🇹🇷 تركيا' },
  
  // Europe (Major countries)
  { value: 'FR', label: '🇫🇷 France', labelAr: '🇫🇷 فرنسا' },
  { value: 'ES', label: '🇪🇸 Espagne', labelAr: '🇪🇸 إسبانيا' },
  { value: 'GB', label: '🇬🇧 Royaume-Uni', labelAr: '🇬🇧 المملكة المتحدة' },
  { value: 'DE', label: '🇩🇪 Allemagne', labelAr: '🇩🇪 ألمانيا' },
  { value: 'IT', label: '🇮🇹 Italie', labelAr: '🇮🇹 إيطاليا' },
  { value: 'PT', label: '🇵🇹 Portugal', labelAr: '🇵🇹 البرتغال' },
  { value: 'NL', label: '🇳🇱 Pays-Bas', labelAr: '🇳🇱 هولندا' },
  { value: 'BE', label: '🇧🇪 Belgique', labelAr: '🇧🇪 بلجيكا' },
  { value: 'CH', label: '🇨🇭 Suisse', labelAr: '🇨🇭 سويسرا' },
  { value: 'AT', label: '🇦🇹 Autriche', labelAr: '🇦🇹 النمسا' },
  { value: 'SE', label: '🇸🇪 Suède', labelAr: '🇸🇪 السويد' },
  { value: 'NO', label: '🇳🇴 Norvège', labelAr: '🇳🇴 النرويج' },
  { value: 'DK', label: '🇩🇰 Danemark', labelAr: '🇩🇰 الدنمارك' },
  { value: 'FI', label: '🇫🇮 Finlande', labelAr: '🇫🇮 فنلندا' },
  { value: 'PL', label: '🇵🇱 Pologne', labelAr: '🇵🇱 بولندا' },
  { value: 'RU', label: '🇷🇺 Russie', labelAr: '🇷🇺 روسيا' },
  
  // Americas
  { value: 'US', label: '🇺🇸 États-Unis', labelAr: '🇺🇸 الولايات المتحدة' },
  { value: 'CA', label: '🇨🇦 Canada', labelAr: '🇨🇦 كندا' },
  { value: 'MX', label: '🇲🇽 Mexique', labelAr: '🇲🇽 المكسيك' },
  { value: 'BR', label: '🇧🇷 Brésil', labelAr: '🇧🇷 البرازيل' },
  { value: 'AR', label: '🇦🇷 Argentine', labelAr: '🇦🇷 الأرجنتين' },
  
  // Asia-Pacific
  { value: 'CN', label: '🇨🇳 Chine', labelAr: '🇨🇳 الصين' },
  { value: 'JP', label: '🇯🇵 Japon', labelAr: '🇯🇵 اليابان' },
  { value: 'KR', label: '🇰🇷 Corée du Sud', labelAr: '🇰🇷 كوريا الجنوبية' },
  { value: 'IN', label: '🇮🇳 Inde', labelAr: '🇮🇳 الهند' },
  { value: 'PK', label: '🇵🇰 Pakistan', labelAr: '🇵🇰 باكستان' },
  { value: 'BD', label: '🇧🇩 Bangladesh', labelAr: '🇧🇩 بنغلاديش' },
  { value: 'ID', label: '🇮🇩 Indonésie', labelAr: '🇮🇩 إندونيسيا' },
  { value: 'MY', label: '🇲🇾 Malaisie', labelAr: '🇲🇾 ماليزيا' },
  { value: 'TH', label: '🇹🇭 Thaïlande', labelAr: '🇹🇭 تايلاند' },
  { value: 'VN', label: '🇻🇳 Vietnam', labelAr: '🇻🇳 فيتنام' },
  { value: 'SG', label: '🇸🇬 Singapour', labelAr: '🇸🇬 سنغافورة' },
  { value: 'AU', label: '🇦🇺 Australie', labelAr: '🇦🇺 أستراليا' },
  { value: 'NZ', label: '🇳🇿 Nouvelle-Zélande', labelAr: '🇳🇿 نيوزيلندا' },
  
  // Central/East Africa
  { value: 'ET', label: '🇪🇹 Éthiopie', labelAr: '🇪🇹 إثيوبيا' },
  { value: 'KE', label: '🇰🇪 Kenya', labelAr: '🇰🇪 كينيا' },
  { value: 'TZ', label: '🇹🇿 Tanzanie', labelAr: '🇹🇿 تنزانيا' },
  { value: 'UG', label: '🇺🇬 Ouganda', labelAr: '🇺🇬 أوغندا' },
  { value: 'RW', label: '🇷🇼 Rwanda', labelAr: '🇷🇼 رواندا' },
  { value: 'CD', label: '🇨🇩 RD Congo', labelAr: '🇨🇩 جمهورية الكونغو الديمقراطية' },
  { value: 'CF', label: '🇨🇫 Centrafrique', labelAr: '🇨🇫 جمهورية أفريقيا الوسطى' },
  { value: 'CM', label: '🇨🇲 Cameroun', labelAr: '🇨🇲 الكاميرون' },
  { value: 'GA', label: '🇬🇦 Gabon', labelAr: '🇬🇦 الغابون' },
  { value: 'CG', label: '🇨🇬 Congo', labelAr: '🇨🇬 الكونغو' },
  { value: 'AO', label: '🇦🇴 Angola', labelAr: '🇦🇴 أنغولا' },
  { value: 'ZA', label: '🇿🇦 Afrique du Sud', labelAr: '🇿🇦 جنوب أفريقيا' },
  
  // Other
  { value: 'OTHER', label: 'Autre pays', labelAr: 'دولة أخرى' },
]

interface CountrySelectProps extends Omit<FormSelectProps, 'options'> {
  locale?: 'fr' | 'ar'
}

export function CountrySelect({ locale = 'fr', ...props }: CountrySelectProps) {
  const options = countries.map(country => ({
    value: country.value,
    label: locale === 'ar' ? country.labelAr : country.label,
  }))

  return (
    <FormSelect
      {...props}
      options={options}
    />
  )
}