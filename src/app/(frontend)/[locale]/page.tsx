import PageTemplate, { generateMetadata } from './[slug]/page'

// Re-export the page component and metadata generation for the home route
export default PageTemplate
export { generateMetadata }

// Generate static params for home page with locales
export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}
