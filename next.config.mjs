import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const config = withPayload(
    withNextIntl({
      eslint: {
        ignoreDuringBuilds: false,
      },
      typescript: {
        ignoreBuildErrors: false,
      },
      // Suppress hydration warnings from browser extensions
      reactStrictMode: false,
      experimental: {
        fullySpecified: true,
        serverActions: {
          bodySizeLimit: '5mb',
        },
        // Static generation optimization for database-driven content
        staticGenerationRetryCount: 3, // Retry failed page generation up to 3 times
        staticGenerationMaxConcurrency: 6, // Process up to 6 pages per worker (reduced from default)
        staticGenerationMinPagesPerWorker: 10, // Start new worker after 10 pages (reduced from default)
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
            protocol: 'https', 
            hostname: 'localhost',
            pathname: '/api/media/**',
          },
          {
            protocol: 'https',
            hostname: 'hapa-mr.vercel.app',
            pathname: '/api/media/**',
          },
          {
            protocol: 'https',
            hostname: 'pub-17095e08be3e47baac773bf102d0e3ab.r2.dev',
            pathname: '/**',
          },
        ],
      },
      webpack: (webpackConfig) => {
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

        return webpackConfig
      },
    }),
    { configPath: path.resolve(dirname, 'src/payload.config.ts') },
)

export default config
