import { Noto_Sans_Arabic, Cairo, Tajawal, Amiri } from 'next/font/google'

// Font loaders must be const declarations in module scope
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic-noto'
})

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic-cairo'
})

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-arabic-tajawal'
})

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-arabic-amiri'
})

// Available Arabic fonts for testing
export const arabicFonts = {
  noto: notoSansArabic,
  cairo: cairo,
  tajawal: tajawal,
  amiri: amiri
}

// Current active font (easy to switch for testing)
export const activeArabicFont = arabicFonts.noto // Change this to test different fonts

// Font configuration for different use cases
export const arabicFontConfig = {
  body: activeArabicFont.className,
  heading: arabicFonts.cairo.className,
  display: arabicFonts.cairo.className,
  mono: activeArabicFont.className
}

// CSS variables for Tailwind
export const arabicFontVariables = [
  activeArabicFont.variable,
  arabicFonts.cairo.variable,
  arabicFonts.tajawal.variable,
  arabicFonts.amiri.variable
].join(' ')