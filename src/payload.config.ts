// import { s3Storage } from '@payloadcms/storage-s3' // Using getStorageConfig instead
import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { fr } from "@payloadcms/translations/languages/fr";
import { ar } from "@payloadcms/translations/languages/ar";

import sharp from "sharp"; // sharp-import
import path from "path";
import { buildConfig, PayloadRequest } from "payload";
import { fileURLToPath } from "url";

import { Categories } from "./collections/Categories";
import { MediaContentSubmissions } from "./collections/MediaContentSubmissions";
import { MediaSubmissionsDashboard } from "./collections/MediaSubmissionsDashboard";
import { Media } from "./collections/Media";
import { FormMedia } from "./collections/FormMedia";
import { Posts } from "./collections/Posts";
import { Users } from "./collections/Users";
import { plugins } from "./plugins";
import { defaultLexical } from "@/fields/defaultLexical";
import { getServerSideURL } from "./utilities/getURL";
import { getStorageConfig } from "./utilities/storage-config";
import { adminTranslations } from "./translations/admin-translations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: "- HAPA Administration",
      description:
        "HAPA - Haute Autorité de la Presse et de l'Audiovisuel - Interface d'administration",
      icons: [
        {
          rel: "icon",
          type: "image/x-icon",
          url: "/favicon.ico",
        },
      ],
      openGraph: {
        images: [
          {
            url: "/logo_hapa1.png",
            width: 800,
            height: 600,
          },
        ],
        siteName: "HAPA",
        title: "HAPA - Administration",
        description:
          "HAPA - Haute Autorité de la Presse et de l'Audiovisuel - Interface d'administration",
      },
    },
    components: {
      // Custom HAPA branding components
      beforeLogin: ["@/components/BeforeLogin/index.tsx"],
      beforeDashboard: ["@/components/BeforeDashboard/index.tsx"],
      // Replace default Payload logo with HAPA logo
      graphics: {
        Logo: "@/components/AdminLogo/index.tsx",
        Icon: "@/components/AdminLogo/index.tsx",
      },
      // Load custom CSS styles
      providers: ["@/components/AdminProvider/index.tsx"],
      // Media Submissions Dashboard is handled via virtual collection
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // Admin Interface Internationalization (French and Arabic only)
  i18n: {
    supportedLanguages: { fr, ar },
    translations: adminTranslations,
  },
  localization: {
    locales: [
      {
        label: "Français",
        code: "fr",
      },
      {
        label: "العربية",
        code: "ar",
        rtl: true,
      },
    ],
    defaultLocale: "fr",
    fallback: true,
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      // Use Neon connection string directly (already pooled in .env.local)
      connectionString: process.env.POSTGRES_URL || "",

      // Optimized pooling settings for better timeout handling
      max: process.env.NODE_ENV === "production" ? 15 : 5, // Reduced for better resource management
      min: 0, // Allow pool to scale down completely when idle
      idleTimeoutMillis: 10000, // Faster idle timeout to free connections
      connectionTimeoutMillis: 8000, // Reduced connection timeout
      // acquireTimeoutMillis: 10000, // Property doesn't exist in PoolConfig

      // Reduced query timeouts to fail fast on problematic queries
      statement_timeout: 10000, // 10 second timeout for statements
      query_timeout: 10000, // Match statement timeout

      // Connection health and performance
      keepAlive: true,
      keepAliveInitialDelayMillis: 3000, // Faster initial keepalive

      // Enhanced error handling for Neon
      maxUses: 5000, // More frequent connection rotation
      application_name: "hapa-website", // Help identify connections in Neon dashboard

      // Retry configuration for unstable connections
      // max_retry_attempts: 2, // Property doesn't exist in PoolConfig
      // retry_delay: 500, // Property doesn't exist in PoolConfig
    },
  }),
  // Reordered to control sidebar grouping order for "Formulaires et Soumissions":
  // 1) MediaSubmissionsDashboard (dashboard link)
  // 2) MediaContentSubmissions (data list)
  // 3) FormMedia (uploads from forms)
  collections: [
    Posts,
    Media,
    Categories,
    MediaSubmissionsDashboard,
    MediaContentSubmissions,
    FormMedia,
    Users,
  ],
  cors:
    process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
        ].filter(Boolean)
      : [getServerSideURL()].filter(Boolean),
  globals: [],
  plugins: [
    ...plugins,
    // Storage Configuration (R2 preferred, local files fallback)
    getStorageConfig(),
  ].filter((plugin): plugin is NonNullable<typeof plugin> => Boolean(plugin)),
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  // Performance optimizations
  maxDepth: 5, // Limit query depth for performance
  graphQL: {
    maxComplexity: 100, // Prevent complex GraphQL queries
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Email configuration: Use Resend adapter for modern email delivery
  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || "noreply@hapa.mr",
    defaultFromName: "HAPA - Haute Autorité de la Presse et de l'Audiovisuel",
    apiKey: process.env.RESEND_API_KEY || "",
  }),
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true;

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get("authorization");
        return authHeader === `Bearer ${process.env.CRON_SECRET}`;
      },
    },
    tasks: [],
  },
});
