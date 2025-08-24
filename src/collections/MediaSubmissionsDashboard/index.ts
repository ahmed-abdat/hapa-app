import type { CollectionConfig } from "payload";

/**
 * Virtual Collection for Media Submissions Dashboard Navigation
 *
 * This collection appears in the "Formulaires et Soumissions" group alongside
 * MediaContentSubmissions and FormMedia, but redirects directly to the custom
 * dashboard at /admin/media-submissions instead of showing a typical collection list.
 *
 * This approach follows Payload CMS best practices for adding dashboard links
 * within existing navigation groups while maintaining consistent styling.
 */
export const MediaSubmissionsDashboard: CollectionConfig = {
  slug: "dashboard-submissions",
  labels: {
    singular: {
      fr: "Tableau de bord des Soumissions",
      ar: "لوحة إدارة الشكاوى والتبليغات"
    },
    plural: {
      fr: "Tableau de bord des Soumissions",
      ar: "لوحة إدارة الشكاوى والتبليغات"
    },
  },
  admin: {
    // Group with media-related forms for better admin organization
    group: {
      fr: "Formulaires Médiatiques",
      ar: "النماذج الإعلامية",
    },
    description: {
      fr: "Accéder au tableau de bord des soumissions médiatiques avec statistiques et gestion avancée",
      ar: "الوصول إلى لوحة إدارة الشكاوى والتبليغات مع الإحصائيات والإدارة المتقدمة"
    },
    hidden: ({ user }) => user?.role === 'editor',
    useAsTitle: "id",
    // Override the default list view with the full dashboard component
    components: {
      views: {
        list: {
          Component: "@/components/admin/MediaSubmissionsDashboard/index.tsx",
        },
      },
    },
    // Hide pagination and other list controls since we're redirecting
    pagination: {
      defaultLimit: 1,
      limits: [1],
    },
  },
  access: {
    // Only authenticated users can access (same as other admin features)
    read: ({ req: { user } }) => Boolean(user),
    // Prevent all CRUD operations - this is a navigation helper only
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  // Minimal field structure to satisfy TypeScript requirements
  fields: [
    {
      name: "id",
      type: "number",
      admin: {
        hidden: true,
      },
    },
  ],
};
