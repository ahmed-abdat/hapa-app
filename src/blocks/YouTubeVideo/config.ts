import type { Block } from 'payload'
import { validateYouTubeUrl } from '@/utilities/youtube'

export const YouTubeVideo: Block = {
  slug: 'youtubeVideo',
  interfaceName: 'YouTubeVideoBlock',
  fields: [
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      label: 'URL de la vidéo YouTube',
      admin: {
        placeholder: 'https://www.youtube.com/watch?v=... ou https://youtu.be/...',
        description: 'Collez l\'URL de votre vidéo YouTube ici',
      },
      validate: validateYouTubeUrl,
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Titre personnalisé (optionnel)',
      admin: {
        description: 'Laissez vide pour utiliser le titre original de la vidéo',
      },
    },
  ],
}