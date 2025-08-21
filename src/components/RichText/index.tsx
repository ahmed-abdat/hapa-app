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
  GalleryBlock as GalleryBlockProps,
  MediaBlock as MediaBlockProps,
  YouTubeVideoBlock as YouTubeVideoBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { Gallery } from '@/blocks/Gallery/Component'
import { YouTubeVideoBlock } from '@/blocks/YouTubeVideo/Component'
import { cn } from '@/lib/utils'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<MediaBlockProps | BannerBlockProps | CodeBlockProps | GalleryBlockProps | YouTubeVideoBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const createJsxConverters = (locale?: 'fr' | 'ar'): JSXConvertersFunction<NodeTypes> => ({ defaultConverters }) => ({
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
    code: ({ node }: { node: SerializedBlockNode<CodeBlockProps> }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }: { node: SerializedBlockNode<any> }) => <CallToActionBlock {...node.fields} />,
    gallery: ({ node }) => (
      <Gallery
        className="col-start-1 col-span-3"
        locale={locale}
        {...node.fields}
      />
    ),
    youtubeVideo: ({ node }) => (
      <YouTubeVideoBlock
        className="col-start-1 col-span-3"
        {...node.fields}
        enableGutter={false}
      />
    ),
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  locale?: 'fr' | 'ar'
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, locale, ...rest } = props
  return (
    <ConvertRichText
      converters={createJsxConverters(locale)}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
