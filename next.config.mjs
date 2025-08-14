import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Get environment-specific frame ancestors for Payload CMS live preview
const getFrameAncestors = () => {
  const baseAncestors = ['\'self\'']
  
  if (process.env.NODE_ENV === 'development') {
    baseAncestors.push('localhost:*')
  }
  
  // Add production admin domain if available
  const productionUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (productionUrl && process.env.NODE_ENV === 'production') {
    const domain = productionUrl.replace(/^https?:\/\//, '')
    baseAncestors.push(`https://${domain}`)
  }
  
  return baseAncestors.join(' ')
}

// Security headers for enhanced protection following Payload CMS best practices
const securityHeaders = [
  // Remove X-Frame-Options in favor of CSP frame-ancestors (modern approach)
  // {
  //   key: 'X-Frame-Options',
  //   value: 'SAMEORIGIN'
  // },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()'
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https://res.cloudinary.com https://*.r2.dev https://vercel.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.vercel.com https://*.upstash.io https://vercel.live",
      "media-src 'self' blob: https://*.r2.dev",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      `frame-ancestors ${getFrameAncestors()}`,
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ')
  }
]

const config = withPayload(
    withBundleAnalyzer(
    withNextIntl({
      eslint: {
        ignoreDuringBuilds: false,
      },
      typescript: {
        ignoreBuildErrors: false,
      },
      // Suppress hydration warnings from browser extensions
      reactStrictMode: false,
      // Remove transpilePackages until properly tested
      // transpilePackages: ['@tanstack/react-table'], // TODO: Test and re-enable if needed
      // Keep source maps disabled in production for better performance
      productionBrowserSourceMaps: false,
      experimental: {
        // Package import optimization for better performance (Next.js 15 best practice)
        optimizePackageImports: [
          '@radix-ui/react-icons',
          '@radix-ui/react-accordion',
          '@radix-ui/react-checkbox',
          '@radix-ui/react-dialog',
          '@radix-ui/react-label',
          '@radix-ui/react-navigation-menu',
          '@radix-ui/react-scroll-area',
          '@radix-ui/react-select',
          '@radix-ui/react-separator',
          '@radix-ui/react-slot',
          '@radix-ui/react-tabs',
          'lucide-react',
          '@hookform/resolvers',
          'recharts', // Heavy charting library - optimize imports
          // Removed @tanstack/react-table from optimizePackageImports due to module parsing issues
          'framer-motion', // Animation library - optimize imports
          'date-fns', // Date utility library - tree-shake unused functions
        ],
        // React Compiler for better performance (React 19 feature)
        reactCompiler: false, // Enable when ready for production
        serverActions: {
          bodySizeLimit: '100mb', // Increased for media evidence uploads (videos, audio, screenshots)
        },
        // CSS chunking optimization (Next.js 15 default best practice)
        cssChunking: true,
        // Static generation optimization for database-driven content
        staticGenerationRetryCount: 3, // Retry failed page generation up to 3 times
        staticGenerationMaxConcurrency: 6, // Process up to 6 pages per worker (reduced from default)
        staticGenerationMinPagesPerWorker: 10, // Start new worker after 10 pages (reduced from default)
        // Remove experimental features until properly tested
        // These will be re-enabled after validation in staging
      },
      // Turbopack configuration for enhanced performance
      turbopack: {
        // Module resolution optimizations
        resolveAlias: {
          // Common alias optimizations for the project structure
        },
      },
      env: {
        PAYLOAD_CORE_DEV: 'true',
        ROOT_DIR: path.resolve(dirname),
        // @todo remove in 4.0 - will behave like this by default in 4.0
        PAYLOAD_DO_NOT_SANITIZE_LOCALIZED_PROPERTY: 'true',
      },
      images: {
        deviceSizes: [640, 768, 1024, 1280, 1600, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
        minimumCacheTTL: 2678400, // 31 days
        dangerouslyAllowSVG: false,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'localhost',
            pathname: '/api/media/**',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            pathname: '/api/form-media/**',
          },
          {
            protocol: 'https', 
            hostname: 'localhost',
            pathname: '/api/media/**',
          },
          {
            protocol: 'https', 
            hostname: 'localhost',
            pathname: '/api/form-media/**',
          },
          {
            protocol: 'https',
            hostname: 'hapa-mr.vercel.app',
            pathname: '/api/media/**',
          },
          {
            protocol: 'https',
            hostname: 'hapa-mr.vercel.app',
            pathname: '/api/form-media/**',
          },
          {
            protocol: 'https',
            hostname: 'pub-17095e08be3e47baac773bf102d0e3ab.r2.dev',
            pathname: '/**',
          },
        ],
      },
      webpack: (webpackConfig, { dev, isServer }) => {
        webpackConfig.resolve.extensionAlias = {
          '.cjs': ['.cts', '.cjs'],
          '.js': ['.ts', '.tsx', '.js', '.jsx'],
          '.mjs': ['.mts', '.mjs'],
        }

        // Reduce webpack noise
        webpackConfig.ignoreWarnings = [
          ...(webpackConfig.ignoreWarnings ?? []),
          /Critical dependency: the request of a dependency is an expression/,
        ]

        // REMOVED: Dangerous production optimizations that could break builds
        // These will be re-added one by one after proper testing in staging
        // See docs/PRODUCTION_READINESS_AUDIT.md for details

        return webpackConfig
      },
      // Security and performance headers
      async headers() {
        return [
          {
            source: '/:path*',
            headers: securityHeaders,
          },
          // Optimize media file caching
          {
            source: '/api/media/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=2592000, s-maxage=2592000, immutable', // 30 days
              },
            ],
          },
          {
            source: '/api/form-media/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=2592000, s-maxage=2592000, immutable', // 30 days
              },
            ],
          },
        ]
      },
    })),
    { 
      configPath: path.resolve(dirname, 'src/payload.config.ts'),
      // Performance optimization: Disable server package bundling in development for faster compilation
      devBundleServerPackages: false 
    },
)

export default config
