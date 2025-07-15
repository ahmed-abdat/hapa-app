import { notFound } from 'next/navigation'
import React from 'react'
import { isValidLocale, type Locale as _Locale } from '@/utilities/locale'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  
  if (!isValidLocale(locale)) {
    notFound()
  }

  return <>{children}</>
}

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}