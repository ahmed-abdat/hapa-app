'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import { format } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowRight, FileText } from 'lucide-react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

interface PostCardProps {
  title: string
  description?: string
  href: string
  image?: string | MediaType | null
  category?: string
  date?: string
  showDescription?: boolean
  className?: string
}

export const PostCard: React.FC<PostCardProps> = ({
  title,
  description,
  href,
  image,
  category,
  date,
  showDescription = false,
  className,
}) => {
  const locale = useLocale()

  return (
    <Link href={href} className="block h-full group">
      <Card 
        className={cn(
          'h-full flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-2',
          'border-gray-100/80 hover:border-primary/30 overflow-hidden',
          'bg-white/80 backdrop-blur-sm group-hover:bg-white',
          className
        )}
      >
        {/* Image Container - Fixed Height */}
        <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
          {image && typeof image !== 'string' ? (
            <>
              <Media 
                resource={image} 
                imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                priority={false}
              />
              {/* HAPA Brand Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="h-10 w-10 text-primary/40" />
            </div>
          )}
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4 z-10">
              <Badge 
                variant="default" 
                className="bg-primary/90 text-white backdrop-blur-md border-white/20 hover:bg-primary"
              >
                {category}
              </Badge>
            </div>
          )}
          
          {/* HAPA Brand Corner Accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section - Flexible */}
        <div className="flex flex-col flex-1 p-6">
          {/* Date */}
          {date && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
              <Calendar className="h-3.5 w-3.5 text-primary/60" />
              <time dateTime={date} className="font-medium">
                {format(new Date(date), 'd MMMM yyyy', {
                  locale: locale === 'ar' ? ar : fr,
                })}
              </time>
            </div>
          )}

          {/* Title - With proper truncation */}
          <h3 className={cn(
            "text-base md:text-lg leading-snug font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 mb-3",
            showDescription ? "line-clamp-2" : "line-clamp-3"
          )}>
            {title}
          </h3>

          {/* Description - Conditional with truncation */}
          {showDescription && description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
              {description}
            </p>
          )}

          {/* Spacer to push button to bottom */}
          <div className="flex-1" />

          {/* CTA Section - Always at Bottom */}
          <div className="pt-4 mt-auto border-t border-gray-100 group-hover:border-primary/20 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <span className="text-primary font-semibold text-sm group-hover:text-accent transition-colors duration-300">
                {locale === 'ar' ? 'اقرأ المزيد' : 'Lire la suite'}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 rtl:rotate-180">
                <ArrowRight className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* HAPA Brand Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Card>
    </Link>
  )
}