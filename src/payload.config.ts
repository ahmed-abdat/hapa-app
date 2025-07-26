// import { s3Storage } from '@payloadcms/storage-s3' // Using getStorageConfig instead
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { fr } from '@payloadcms/translations/languages/fr'
import { ar } from '@payloadcms/translations/languages/ar'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { CustomFormSubmissions } from './collections/CustomFormSubmissions'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { getStorageConfig } from './utilities/storage-config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: '- HAPA Administration',
      description: 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel - Interface d\'administration',
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/favicon.ico',
        },
      ],
      openGraph: {
        images: [
          {
            url: '/logo_hapa1.png',
            width: 800,
            height: 600,
          },
        ],
        siteName: 'HAPA',
        title: 'HAPA - Administration',
        description: 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel - Interface d\'administration',
      },
    },
    components: {
      // Custom HAPA branding components
      beforeLogin: ['@/components/BeforeLogin/index.tsx'],
      beforeDashboard: ['@/components/BeforeDashboard/index.tsx'],
      // Replace default Payload logo with HAPA logo
      graphics: {
        Logo: '@/components/AdminLogo/index.tsx',
        Icon: '@/components/AdminLogo/index.tsx',
      },
      // Load custom CSS styles
      providers: ['@/components/AdminProvider/index.tsx'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // Admin Interface Internationalization (French and Arabic only)
  i18n: {
    supportedLanguages: { fr, ar },
    translations: {
      fr: {
        // Plugin-generated collections
        'general:redirects': 'Redirections',
        'general:search': 'Résultats de recherche',
        // Custom HAPA admin translations
        'general:dashboard': 'Tableau de bord HAPA',
        'general:adminPanel': 'Interface d\'administration HAPA',
        'general:welcome': 'Bienvenue dans l\'interface d\'administration HAPA',
      },
      ar: {
        // Plugin-generated collections
        'general:redirects': 'عمليات إعادة التوجيه',
        'general:search': 'نتائج البحث',
        // Custom HAPA admin translations
        'general:dashboard': 'لوحة تحكم هابا',
        'general:adminPanel': 'واجهة إدارة هابا',
        'general:welcome': 'مرحباً بك في واجهة إدارة هابا',
      },
    },
  },
  localization: {
    locales: [
      {
        label: 'Français',
        code: 'fr',
      },
      {
        label: 'العربية',
        code: 'ar',
        rtl: true,
      },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      // Use Neon connection string directly (already pooled in .env.local)
      connectionString: process.env.POSTGRES_URL || '',
      
      // Optimized pooling settings for Neon + PostgreSQL adapter
      max: process.env.NODE_ENV === 'production' ? 15 : 10, // Higher limit for production
      min: 3, // Keep more connections warm
      idleTimeoutMillis: 20000, // Faster cleanup for better resource management
      connectionTimeoutMillis: 8000, // Increased for cold starts and latency
      
      // Neon-optimized timeouts (aligned with PgBouncer settings)
      statement_timeout: 15000, // Slightly higher for complex queries
      query_timeout: 15000, // Match statement timeout
      
      // Connection health and performance
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000, // Initial delay before first keepalive probe
      
      // Enhanced error handling - supported by standard PostgreSQL adapter
      maxUses: 7500, // Rotate connections to prevent memory leaks
      testOnBorrow: true, // Validate connections before use
    },
  }),
  collections: [Posts, Media, Categories, CustomFormSubmissions, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [],
  plugins: [
    ...plugins,
    // Storage Configuration (R2 preferred, local files fallback)
    getStorageConfig(),
  ].filter((plugin): plugin is NonNullable<typeof plugin> => Boolean(plugin)),
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Email configuration: Use Resend adapter for modern email delivery
  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || 'noreply@hapa.mr',
    defaultFromName: 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
