import type { RequiredDataFromCollectionSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'homepageHero',
    media: '1', // Placeholder media ID - will be replaced when real media is uploaded
    richText: null,
  },
  meta: {
    description: 'Site officiel de la Haute Autorité de la Presse et de l\'Audiovisuel de Mauritanie.',
    title: 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel',
  },
  title: 'Accueil',
  layout: [],
}
