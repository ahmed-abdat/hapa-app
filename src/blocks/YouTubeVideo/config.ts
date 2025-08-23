import type { Block } from 'payload'
import { validateYouTubeUrl } from '@/utilities/youtube'

export const YouTubeVideo: Block = {
  slug: 'youtubeVideo',
  interfaceName: 'YouTubeVideoBlock',
  labels: {
    singular: {
      fr: 'Vidéo YouTube',
      ar: 'فيديو يوتيوب'
    },
    plural: {
      fr: 'Vidéos YouTube',
      ar: 'فيديوهات يوتيوب'
    }
  },
  fields: [
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      label: {
        fr: 'URL de la vidéo YouTube',
        ar: 'رابط فيديو يوتيوب'
      },
      admin: {
        placeholder: {
          fr: 'https://www.youtube.com/watch?v=... ou https://youtu.be/...',
          ar: 'https://www.youtube.com/watch?v=... أو https://youtu.be/...'
        },
        description: {
          fr: 'Collez l\'URL de votre vidéo YouTube ici',
          ar: 'الصق رابط فيديو يوتيوب هنا'
        }
      },
      validate: validateYouTubeUrl,
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: {
        fr: 'Titre personnalisé (optionnel)',
        ar: 'عنوان مخصص (اختياري)'
      },
      admin: {
        description: {
          fr: 'Laissez vide pour utiliser le titre original de la vidéo',
          ar: 'اتركه فارغًا لاستخدام العنوان الأصلي للفيديو'
        }
      },
    },
  ],
}