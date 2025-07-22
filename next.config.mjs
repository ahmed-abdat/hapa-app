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
        ignoreDuringBuilds: true,
      },
      typescript: {
        ignoreBuildErrors: true,
      },
      // Suppress hydration warnings from browser extensions
      reactStrictMode: false,
      experimental: {
        fullySpecified: true,
        serverActions: {
          bodySizeLimit: '5mb',
        },
      },
      env: {
        PAYLOAD_CORE_DEV: 'true',
        ROOT_DIR: path.resolve(dirname),
        // @todo remove in 4.0 - will behave like this by default in 4.0
        PAYLOAD_DO_NOT_SANITIZE_LOCALIZED_PROPERTY: 'true',
      },
      images: {
        domains: ['localhost'],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'pub-17095e08be3e47baac773bf102d0e3ab.r2.dev',
            port: '',
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
