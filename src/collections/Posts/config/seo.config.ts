/**
 * SEO Configuration for Posts Collection
 * Controls how SEO fields are displayed and auto-populated
 */

export const seoConfig = {
  /**
   * Whether to show the SEO tab in the admin UI
   * Set to false to hide the tab while keeping SEO functionality
   */
  showSEOTab: true,

  /**
   * Whether to show the manual generation buttons
   * Set to false to rely entirely on automatic generation
   */
  showManualGenerators: false,

  /**
   * Auto-population settings
   */
  autoPopulate: {
    /**
     * When to auto-populate SEO fields
     * 'always' - On every save (draft and publish)
     * 'publish' - Only when publishing  
     * 'empty' - Only when fields are empty
     * 'smart' - Regenerate when content changes significantly or on publish
     */
    mode: 'smart' as 'always' | 'publish' | 'empty' | 'smart',

    /**
     * Whether to override existing SEO fields
     * false - Respect manually entered values (recommended)
     * true - Always regenerate (not recommended)
     */
    overrideExisting: false,

    /**
     * Performance optimization
     * Skip auto-generation for autosave drafts
     */
    skipAutosave: true,
  },

  /**
   * SEO field visibility
   * Control which fields are shown in the SEO tab
   */
  fields: {
    showOverview: true,      // SEO preview
    showTitle: true,         // Meta title field
    showDescription: true,   // Meta description field
    showImage: true,         // Meta image field
    showPreview: true,       // Search result preview
  },

  /**
   * Image fallback chain
   * Priority order for SEO image selection
   */
  imageFallback: [
    'heroImage',           // Primary: Hero image
    'firstMediaBlock',     // Secondary: First media block in content
    'firstGalleryImage',   // Tertiary: First image in gallery
    'default',            // Final: Site default image
  ],
}