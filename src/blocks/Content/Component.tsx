import { cn } from '@/lib/utils'
import React from 'react'
import RichText from '@/components/RichText'

import { CMSLink } from '../../components/Link'

type ContentBlockProps = {
  columns?: Array<{
    size?: 'full' | 'half' | 'oneThird' | 'twoThirds'
    richText?: Record<string, any>  // Rich text from Payload CMS
    enableLink?: boolean
    link?: {
      type?: string
      url?: string
      label?: string
      [key: string]: any
    }
  }>
  blockType?: string
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={`content-column-${index}`}
              >
                {richText && richText.root && <RichText data={richText as any} enableGutter={false} />}

                {enableLink && link && <CMSLink {...(link as any)} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
