import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    singular: {
      fr: 'Bloc média',
      ar: 'كتلة الوسائط'
    },
    plural: {
      fr: 'Blocs média',
      ar: 'كتل الوسائط'
    }
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: false, // Changed to false to avoid validation issues in lexical editor
      label: {
        fr: 'Média',
        ar: 'الوسائط'
      },
      admin: {
        description: {
          fr: 'Sélectionner un fichier média',
          ar: 'حدد ملف الوسائط'
        }
      },
      validate: (value: any) => {
        // Custom validation to ensure media is selected
        if (!value) {
          return 'Le média est requis / الوسائط مطلوبة'
        }
        return true
      }
    },
  ],
}
