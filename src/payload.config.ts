// import { s3Storage } from '@payloadcms/storage-s3' // Using getStorageConfig instead
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { fr } from '@payloadcms/translations/languages/fr'
import { ar } from '@payloadcms/translations/languages/ar'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { CustomFormSubmissions } from './collections/CustomFormSubmissions'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { getStorageConfig } from './utilities/storage-config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: '- HAPA Admin',
      description: 'HAPA Media Regulatory Authority Admin Panel',
    },
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin/index.tsx'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard/index.tsx'],
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
      },
      ar: {
        // Plugin-generated collections
        'general:redirects': 'عمليات إعادة التوجيه',
        'general:search': 'نتائج البحث',
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
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  collections: [Pages, Posts, Media, Categories, CustomFormSubmissions, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
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
