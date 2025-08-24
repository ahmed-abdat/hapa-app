import type { CollectionConfig } from "payload";

/**
 * Virtual Collection for Contact Messages Dashboard Navigation
 *
 * Dedicated dashboard for managing contact form submissions with
 * statistics and quick access tools.
 */
export const ContactDashboard: CollectionConfig = {
  slug: "contact-dashboard",
  labels: {
    singular: {
      fr: "Tableau de bord - Messages de Contact",
      ar: "لوحة تحكم - رسائل الاتصال"
    },
    plural: {
      fr: "Tableau de bord - Messages de Contact",
      ar: "لوحة تحكم - رسائل الاتصال"
    },
  },
  admin: {
    // Group with contact-related messages for better admin organization
    group: {
      fr: "Messages de Contact",
      ar: "رسائل الاتصال",
    },
    description: {
      fr: "Tableau de bord dédié à la gestion des messages de contact avec statistiques et outils de gestion",
      ar: "لوحة تحكم مخصصة لإدارة رسائل الاتصال مع الإحصائيات وأدوات الإدارة"
    },
    hidden: ({ user }) => user?.role === 'editor',
    useAsTitle: "id",
    // Override the default list view with the dashboard component
    components: {
      views: {
        list: {
          Component: "@/components/admin/ContactDashboard/index.tsx",
        },
      },
    },
    // Hide pagination since this is a dashboard
    pagination: {
      defaultLimit: 1,
      limits: [1],
    },
  },
  access: {
    // Only authenticated users can access (admin and moderator roles)
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