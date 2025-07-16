import type { CollectionBeforeOperationHook } from 'payload'

/**
 * Shared hook to enforce French locale for content creation and validation
 * Used across Posts and Pages collections to ensure French content is primary
 */
export const enforceFrenchLocale: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  // Only enforce for create operations in admin context
  if (operation === 'create' && req.context?.source !== 'local-api') {
    // Check if request is coming from admin panel
    const isAdminRequest = req.headers?.get?.('referer')?.includes('/admin') || req.context?.source === 'admin'
    
    if (isAdminRequest) {
      // Force French locale for new document creation
      if (args.locale && args.locale !== 'fr') {
        args.locale = 'fr'
      }
      
      // Ensure French locale is set in query parameters
      if (args.req?.query?.locale && args.req.query.locale !== 'fr') {
        args.req.query.locale = 'fr'
      }
    }
  }

  // For update operations, validate French title exists before allowing save
  if (operation === 'update' && args.data) {
    const titleData = args.data.title
    
    if (titleData && typeof titleData === 'object' && 'fr' in titleData) {
      const frenchTitle = titleData.fr
      
      // If trying to publish without French title, prevent it
      if (args.data._status === 'published' && (!frenchTitle || !frenchTitle.trim())) {
        throw new Error('French title is required before publishing. Please add a French title first.')
      }
    }
  }

  return args
}