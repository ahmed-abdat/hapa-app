import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { AboutMissionBlock } from '@/blocks/AboutMission/Component'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { CoreServicesBlock } from '@/blocks/CoreServices/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { MediaSpaceBlock } from '@/blocks/MediaSpace/Component'
import { NewsAnnouncementsBlock } from '@/blocks/NewsAnnouncements/Component'
import { NewsAnnouncementsRichBlock } from '@/blocks/NewsAnnouncements/ComponentRich'
import { PartnersSectionBlock } from '@/blocks/PartnersSection/Component'
import { QuoteBlock } from '@/blocks/Quote/Component'
import { StatisticsBlock } from '@/blocks/Statistics/Component'

const blockComponents = {
  aboutMission: AboutMissionBlock,
  archive: ArchiveBlock,
  content: ContentBlock,
  coreServices: CoreServicesBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  gallery: GalleryBlock,
  mediaBlock: MediaBlock,
  mediaSpace: MediaSpaceBlock,
  newsAnnouncements: NewsAnnouncementsBlock,
  partnersSection: PartnersSectionBlock,
  quote: QuoteBlock,
  statistics: StatisticsBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          // Handle News/Announcements variant selection
          if (blockType === 'newsAnnouncements') {
            const layoutVariant = (block as any).layoutVariant || 'simple'
            const Block = layoutVariant === 'rich' ? NewsAnnouncementsRichBlock : NewsAnnouncementsBlock
            
            return (
              <div className={index === 0 ? "pt-8 sm:pt-12 md:pt-24" : "pt-8 sm:pt-12 md:pt-24"} key={index}>
                {/* @ts-expect-error there may be some mismatch between the expected types here */}
                <Block {...block} disableInnerContainer />
              </div>
            )
          }

          // Handle other block types normally
          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className={index === 0 ? "pt-8 sm:pt-12 md:pt-24" : "pt-8 sm:pt-12 md:pt-24"} key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
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
