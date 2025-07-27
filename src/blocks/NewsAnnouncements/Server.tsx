import { NewsAnnouncementsBlock } from './Component'
import { getCachedPosts } from '@/utilities/cached-queries'
import type { Locale } from '@/utilities/locale'
import { Suspense } from 'react'

type NewsAnnouncementsServerProps = {
  title?: string
  description?: string
  posts?: any[] // From block config
  showFeatured?: boolean
  maxPosts?: number
  locale: Locale
}

async function NewsAnnouncementsContent({
  title,
  description,
  posts: configPosts,
  showFeatured = true,
  maxPosts = 6,
  locale,
}: NewsAnnouncementsServerProps) {
  // Use configured posts if available, otherwise fetch latest posts
  let postsToDisplay = configPosts

  if (!configPosts || configPosts.length === 0) {
    // Fetch latest posts using cached query
    postsToDisplay = await getCachedPosts({
      limit: maxPosts,
      locale,
    })
  }

  return (
    <NewsAnnouncementsBlock
      title={title}
      description={description}
      posts={postsToDisplay}
      showFeatured={showFeatured}
      maxPosts={maxPosts}
      locale={locale}
    />
  )
}

function NewsAnnouncementsLoading() {
  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 via-white to-green-50/20">
      <div className="hapa-container">
        <div className="header-spacing">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-6 max-w-md mx-auto" />
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse max-w-2xl mx-auto mb-4" />
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse max-w-xl mx-auto" />
          <div className="w-24 h-1.5 bg-gray-200 rounded-full mx-auto mt-8" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
              <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-6 bg-gray-300 rounded animate-pulse mb-3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function NewsAnnouncementsServer(props: NewsAnnouncementsServerProps) {
  return (
    <Suspense fallback={<NewsAnnouncementsLoading />}>
      <NewsAnnouncementsContent {...props} />
    </Suspense>
  )
}