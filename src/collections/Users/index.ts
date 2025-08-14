import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

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
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    listSearchableFields: ['name', 'email'],
    useAsTitle: 'name',
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
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      defaultValue: 'user',
      required: true,
    },
  ],
  timestamps: true,
}
