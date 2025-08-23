import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '../../access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      fr: 'Utilisateur',
      ar: 'مستخدم'
    },
    plural: {
      fr: 'Utilisateurs',
      ar: 'مستخدمون'
    }
  },
  access: {
    admin: authenticated,
    create: isAdmin, // Only admins can create new users
    delete: isAdmin, // Only admins can delete users
    read: authenticated, // All authenticated users can see user list
    update: ({ req: { user }, id }) => {
      // Users can update their own profile
      if (user?.id === id) return true
      // Only admins can update other users
      return user?.role === 'admin'
    },
  },
  admin: {
    defaultColumns: ['name', 'email'],
    listSearchableFields: ['name', 'email'],
    useAsTitle: 'name',
    hidden: ({ user }) => user?.role === 'editor' || user?.role === 'moderator',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: {
        fr: 'Photo de profil',
        ar: 'صورة الملف الشخصي'
      },
      admin: {
        description: {
          fr: 'Image de profil qui sera affichée dans l\'en-tête d\'administration',
          ar: 'صورة الملف الشخصي التي سيتم عرضها في رأس الإدارة'
        }
      }
    },
    {
      name: 'role',
      type: 'select',
      label: {
        fr: 'Rôle',
        ar: 'الدور'
      },
      options: [
        {
          label: {
            fr: 'Administrateur',
            ar: 'مدير'
          },
          value: 'admin',
        },
        {
          label: {
            fr: 'Éditeur',
            ar: 'محرر'
          },
          value: 'editor',
        },
        {
          label: {
            fr: 'Modérateur',
            ar: 'مشرف'
          },
          value: 'moderator',
        },
      ],
      defaultValue: 'editor',
      required: true,
      access: {
        update: ({ req: { user } }) => Boolean(user && user.role === 'admin'), // Only admins can change roles
      },
      admin: {
        description: {
          fr: 'Rôle de l\'utilisateur dans le système',
          ar: 'دور المستخدم في النظام'
        }
      }
    },
  ],
  timestamps: true,
}
