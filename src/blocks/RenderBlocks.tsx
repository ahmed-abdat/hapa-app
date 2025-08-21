import React, { Fragment } from 'react'

import { AboutMissionBlock } from '@/blocks/AboutMission/Component'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CodeBlock } from '@/blocks/Code/Component'
import { ComplaintFormBlock } from '@/blocks/ComplaintFormBlock/Component'
import { ContactFormBlock } from '@/blocks/ContactFormBlock/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { CoreServicesBlock } from '@/blocks/CoreServices/Component'
import { Gallery } from '@/blocks/Gallery/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MediaSpaceBlock } from '@/blocks/MediaSpace/Component'
import { NewsAnnouncementsBlock } from '@/blocks/NewsAnnouncements/Component'
import { NewsAnnouncementsRichBlock } from '@/blocks/NewsAnnouncements/ComponentRich'
import { PartnersSectionBlock } from '@/blocks/PartnersSection/Component'
import { YouTubeVideoBlock } from '@/blocks/YouTubeVideo/Component'
import { MediaReportingCTA } from '@/components/MediaReportingCTA'

// Define available block types
type BlockType = 
  | { blockType: 'aboutMission'; [key: string]: unknown }
  | { blockType: 'archive'; [key: string]: unknown }
  | { blockType: 'banner'; [key: string]: unknown }
  | { blockType: 'code'; [key: string]: unknown }
  | { blockType: 'complaintForm'; [key: string]: unknown }
  | { blockType: 'contactForm'; [key: string]: unknown }
  | { blockType: 'content'; [key: string]: unknown }
  | { blockType: 'coreServices'; [key: string]: unknown }
  | { blockType: 'cta'; [key: string]: unknown }
  | { blockType: 'gallery'; [key: string]: unknown }
  | { blockType: 'mediaBlock'; [key: string]: unknown }
  | { blockType: 'mediaReportingCTA'; [key: string]: unknown }
  | { blockType: 'mediaSpace'; [key: string]: unknown }
  | { blockType: 'newsAnnouncements'; layoutVariant?: string; [key: string]: unknown }
  | { blockType: 'partnersSection'; [key: string]: unknown }
  | { blockType: 'youtubeVideo'; [key: string]: unknown }

const blockComponents = {
  aboutMission: AboutMissionBlock,
  archive: ArchiveBlock,
  banner: BannerBlock,
  code: CodeBlock,
  complaintForm: ComplaintFormBlock,
  contactForm: ContactFormBlock,
  content: ContentBlock,
  coreServices: CoreServicesBlock,
  cta: CallToActionBlock,
  gallery: Gallery,
  mediaBlock: MediaBlock,
  mediaReportingCTA: MediaReportingCTA,
  mediaSpace: MediaSpaceBlock,
  newsAnnouncements: NewsAnnouncementsBlock,
  partnersSection: PartnersSectionBlock,
  youtubeVideo: YouTubeVideoBlock,
} as const

export const RenderBlocks: React.FC<{
  blocks: BlockType[]
  locale?: 'fr' | 'ar'
}> = (props) => {
  const { blocks, locale = 'fr' } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          // Handle News/Announcements variant selection
          if (blockType === 'newsAnnouncements') {
            const layoutVariant = (block as { layoutVariant?: string }).layoutVariant || 'simple'
            const Block = layoutVariant === 'rich' ? NewsAnnouncementsRichBlock : NewsAnnouncementsBlock
            
            return (
              <div className={index === 0 ? "pt-8 sm:pt-12 md:pt-24" : "pt-8 sm:pt-12 md:pt-24"} key={index}>
                <Block {...block} locale={locale} />
              </div>
            )
          }

          // Handle other block types normally
          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents]

            if (Block) {
              return (
                <div className={index === 0 ? "pt-8 sm:pt-12 md:pt-24" : "pt-8 sm:pt-12 md:pt-24"} key={index}>
                  {/* @ts-expect-error Block props may not match exactly */}
                  <Block {...block} locale={locale} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
