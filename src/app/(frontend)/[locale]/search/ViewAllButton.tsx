'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { type Locale, getLocaleDirection } from '@/utilities/locale'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface ViewAllButtonProps {
  text: string
  href: string
}

export function ViewAllButton({ text, href }: ViewAllButtonProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as Locale) || 'fr'
  const direction = getLocaleDirection(locale)
  const isRtl = direction === 'rtl'

  return (
    <Button 
      variant="link"
      onClick={() => router.push(href)}
      className="text-primary hover:text-accent font-medium transition-colors p-0 inline-flex items-center gap-1"
    >
      {text}
      {isRtl ? (
        <ArrowLeft className="h-4 w-4" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
    </Button>
  )
}