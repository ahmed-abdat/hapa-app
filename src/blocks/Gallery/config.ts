import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: {
      fr: 'Galerie',
      ar: 'معرض'
    },
    plural: {
      fr: 'Galeries', 
      ar: 'معارض'
    }
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: {
        description: {
          fr: 'Titre optionnel pour la galerie',
          ar: 'عنوان اختياري للمعرض'
        }
      }
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: {
          fr: 'Description optionnelle pour la galerie',
          ar: 'وصف اختياري للمعرض'
        }
      }
    },
    {
      type: 'array',
      name: 'images',
      labels: {
        singular: {
          fr: 'Image',
          ar: 'صورة'
        },
        plural: {
          fr: 'Images',
          ar: 'صور'
        }
      },
      minRows: 1,
      maxRows: 20,
      admin: {
        initCollapsed: false,
        isSortable: true,
        components: {
          RowLabel: '@/components/admin/GalleryImageRowLabel/index.tsx#GalleryImageRowLabel',
        },
        description: {
          fr: 'Ajoutez plusieurs images pour créer une galerie (glissez-déposez pour réorganiser)',
          ar: 'أضف عدة صور لإنشاء معرض (اسحب وأفلت لإعادة الترتيب)'
        }
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: {
            mimeType: { contains: 'image' }
          },
          admin: {
            description: {
              fr: 'Sélectionner une image pour la galerie',
              ar: 'حدد صورة للمعرض'
            }
          }
        },
        {
          name: 'caption',
          type: 'text',
          localized: true,
          admin: {
            placeholder: {
              fr: 'Légende optionnelle pour cette image',
              ar: 'تسمية توضيحية اختيارية لهذه الصورة'
            }
          }
        }
      ],
    },
    {
      name: 'enableLightbox',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: {
          fr: 'Permettre l\'agrandissement des images en cliquant',
          ar: 'السماح بتكبير الصور عند النقر'
        }
      }
    }
  ],
}