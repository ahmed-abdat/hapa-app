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
import { MediaCleanupJobs } from "./collections/MediaCleanupJobs";
import { Media } from "./collections/Media";
// import { FormMedia } from "./collections/FormMedia"; // Not needed for minimal solution
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
    // Custom avatar component for account area
    avatar: {
      Component: '@/components/CustomAvatar/index.tsx#CustomAvatar',
    },
    // Custom components for admin UI
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
        label: "العربية",
        code: "ar",
        rtl: true,
      },
      {
        label: "Français",
        code: "fr",
      },
    ],
    defaultLocale: "ar", // Arabic as default locale for admin interface
    fallback: true,
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      // Use Neon connection string directly (already pooled in .env.local)
      connectionString: process.env.POSTGRES_URL || "",

      // Increased timeouts for media update operations
      max: process.env.NODE_ENV === "production" ? 25 : 5, // Increased pool size for production
      min: 5, // Ensure minimum connections for better performance
      idleTimeoutMillis: 30000, // Increased idle timeout
      connectionTimeoutMillis: 30000, // Increased connection timeout from 8s to 30s
      // acquireTimeoutMillis: 60000, // Not available in current pool config type

      // Increased query timeouts for complex operations like media updates
      statement_timeout: 45000, // Increased from 10s to 45s for media operations
      query_timeout: 45000, // Match statement timeout

      // Connection health and performance
      keepAlive: true,
      keepAliveInitialDelayMillis: 3000, // Faster initial keepalive

      // Enhanced error handling for Neon
      maxUses: 5000, // More frequent connection rotation
      application_name: "hapa-website", // Help identify connections in Neon dashboard

      // Additional timeout configurations for stability
      // createTimeoutMillis: 30000, // Not available in current pool config type
      // destroyTimeoutMillis: 5000, // Not available in current pool config type
      // reapIntervalMillis: 1000, // Not available in current pool config type
      // createRetryIntervalMillis: 200, // Not available in current pool config type
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
    MediaCleanupJobs,
    // FormMedia removed - using Media collection instead
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
