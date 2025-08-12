import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { Link } from '@/i18n/navigation'
import React from 'react'

import type { Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'posts'
    value: Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `/${reference?.relationTo}/${reference.value.slug}`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  // Handle button variants - map invalid variants to valid ones
  const buttonVariant: ButtonProps['variant'] = (() => {
    const appearanceStr = String(appearance)
    if (appearanceStr === 'clear') return 'ghost'
    if (appearanceStr === 'inline') return 'ghost'
    
    // Check if appearance is a valid ButtonProps variant
    const validVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    if (validVariants.includes(appearanceStr)) {
      return appearanceStr as ButtonProps['variant']
    }
    
    return 'default'
  })()

  // Handle button sizes - map invalid sizes to valid ones  
  const buttonSize: ButtonProps['size'] = (() => {
    if (String(appearance) === 'link') return 'sm'
    
    const validSizes = ['default', 'sm', 'lg', 'icon']
    if (sizeFromProps && validSizes.includes(String(sizeFromProps))) {
      return sizeFromProps as ButtonProps['size']
    }
    
    return 'default'
  })()

  return (
    <Button asChild className={className} size={buttonSize} variant={buttonVariant}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
