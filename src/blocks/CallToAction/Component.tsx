import React from 'react'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

// Call to action block props type definition
type CTABlockProps = {
  links?: Array<{ link: unknown }>
  richText?: unknown
  blockType?: string
  [key: string]: unknown
}

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container">
      <div className="bg-card rounded border-border border p-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="max-w-[48rem] flex items-center">
          {richText ? <RichText className="mb-0" data={richText as any} enableGutter={false} /> : null}
        </div>
        <div className="flex flex-col gap-8">
          {(links || []).map(({ link }: { link: unknown }, i: number) => {
            return <CMSLink key={i} size="lg" {...(link as any)} />
          })}
        </div>
      </div>
    </div>
  )
}
