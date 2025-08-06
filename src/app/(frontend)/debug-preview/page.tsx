import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Link } from '@/i18n/navigation'

export default async function DebugPreviewPage() {
  const { isEnabled: isDraftMode } = await draftMode()
  
  let debugInfo = {
    draftMode: isDraftMode,
    previewSecret: process.env.PREVIEW_SECRET ? 'SET' : 'NOT SET',
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
    environment: process.env.NODE_ENV,
  }

  // Try to get some posts for testing
  let posts: any[] = []
  let error = null
  
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      limit: 5,
      draft: isDraftMode,
      overrideAccess: isDraftMode,
    })
    posts = result.docs
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Preview Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Debug Info */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <pre className="bg-white p-4 rounded border text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Posts List */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Posts ({isDraftMode ? 'Draft Mode ON' : 'Published Only'})
          </h2>
          
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-3 rounded border">
                  <div className="font-medium">{post.title?.fr || post.title}</div>
                  <div className="text-sm text-gray-600">
                    Slug: {post.slug} | Status: {post._status}
                  </div>
                  <div className="mt-2">
                    <Link 
                      href={`/posts/${post.slug}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Post
                    </Link>
                    {post.slug && (
                      <span className="mx-2">|</span>
                    )}
                    {post.slug && (
                      <a 
                        href={`/next/preview?slug=${post.slug}&collection=posts&path=/fr/posts/${post.slug}&previewSecret=${process.env.PREVIEW_SECRET}`}
                        className="text-purple-600 hover:underline text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-gray-500">No posts found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test Links */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Links</h2>
        <div className="space-y-2">
          <div>
            <a 
              href="/next/exit-preview" 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Exit Preview Mode
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Use this page to debug preview functionality and test preview URLs.
          </p>
        </div>
      </div>
    </div>
  )
}