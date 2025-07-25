import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  GalleryBlock as GalleryBlockProps,
  MediaBlock as MediaBlockProps,
  QuoteBlock as QuoteBlockProps,
  StatisticsBlock as StatisticsBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { GalleryBlock } from '@/blocks/Gallery/Component'
import { QuoteBlock } from '@/blocks/Quote/Component'
import { StatisticsBlock } from '@/blocks/Statistics/Component'
import { cn } from '@/utilities/ui'
import { type Locale } from '@/i18n/routing'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps | QuoteBlockProps | StatisticsBlockProps | GalleryBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    quote: ({ node }) => <QuoteBlock className="col-start-2 mb-6" {...node.fields} />,
    statistics: ({ node }) => <StatisticsBlock className="col-start-1 col-span-3 mb-8" {...node.fields} />,
    gallery: ({ node }) => <GalleryBlock className="col-start-1 col-span-3 mb-8" {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  locale?: Locale
  variant?: 'default' | 'hapa' | 'article'
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { 
    className, 
    enableProse = true, 
    enableGutter = true, 
    locale = 'fr',
    variant = 'default',
    ...rest 
  } = props

  // Generate prose classes based on variant and locale
  const getProseClasses = () => {
    const baseClasses = []
    
    if (enableProse) {
      // Base prose classes
      baseClasses.push('prose', 'md:prose-lg', 'lg:prose-xl')
      
      // Variant-specific classes
      switch (variant) {
        case 'hapa':
          baseClasses.push('prose-hapa')
          break
        case 'article':
          baseClasses.push('prose-hapa', 'max-w-none')
          break
        default:
          baseClasses.push('dark:prose-invert')
      }
      
      // Add responsive classes for better reading experience
      baseClasses.push(
        'prose-headings:scroll-mt-20',
        'prose-a:transition-colors',
        'prose-img:rounded-xl',
        'prose-img:shadow-lg'
      )
    }
    
    return baseClasses
  }

  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
        },
        getProseClasses(),
        className,
      )}
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      {...rest}
    />
  )
}
