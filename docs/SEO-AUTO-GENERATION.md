# SEO Auto-Generation Documentation

## Overview
The HAPA website now includes intelligent SEO field auto-generation that extracts content directly from the Lexical rich text editor, ensuring SEO descriptions are always based on actual article content rather than just titles.

## How It Works

### Description Generation Priority
1. **Primary Source**: Article content from Lexical editor
2. **Smart Extraction**: Uses `generateContentSummary()` to intelligently extract the first meaningful paragraph
3. **Fallback**: Only uses title when no content is available (e.g., new posts)

### Key Features

#### Content-Based Generation
```typescript
// The system prioritizes actual content over titles
if (contentValue && typeof contentValue === 'object' && 'root' in contentValue) {
  // Uses generateContentSummary for intelligent extraction
  const summary = generateContentSummary(contentValue)
  // This function:
  // - Extracts the first paragraph
  // - Respects sentence boundaries
  // - Maintains coherent descriptions
  // - Truncates at word boundaries (not mid-word)
}
```

#### Localization Support
- Handles both French and Arabic content
- Falls back to French if Arabic content is not available
- Site name adapts based on locale

#### Image Auto-Population
- Automatically uses `heroImage` as the SEO image
- Falls back to first media block in content if no hero image
- Extracts proper media IDs to avoid validation errors

## Configuration

Edit `src/collections/Posts/config/seo.config.ts`:

```typescript
export const seoConfig = {
  showSEOTab: true,           // Show/hide SEO tab in admin
  showManualGenerators: false, // Hide manual generation buttons
  autoPopulate: {
    mode: 'empty',           // 'always' | 'publish' | 'empty'
    overrideExisting: false, // Respect manual edits
    skipAutosave: true,      // Performance optimization
  },
  imageFallback: [
    'heroImage',
    'firstMediaBlock',
    'firstGalleryImage',
    'default',
  ],
}
```

## When SEO Fields Are Generated

### Automatic Generation Triggers
- **On Save**: When saving a draft (if fields are empty)
- **On Publish**: Always ensures SEO fields are populated
- **New Posts**: Immediately populates with available data

### Performance Optimizations
- Skips generation during autosave to reduce server load
- Only processes when necessary (empty fields or publishing)
- Handles errors gracefully without breaking save operations

## Content Extraction Logic

### Smart Summary Generation
The `generateContentSummary` function:
1. Extracts plain text from Lexical content
2. Identifies the first paragraph or meaningful sentences
3. Ensures optimal length (120-160 characters)
4. Maintains sentence structure and readability
5. Adds ellipsis when truncating

### Example Output
**Article Content**:
> "La HAPA participe à des ateliers organisés à Aleg et Rosso sur la lutte contre les discours de haine. Les deux ateliers ont été marqués par des échanges approfondis..."

**Generated Description**:
> "La HAPA participe à des ateliers organisés à Aleg et Rosso sur la lutte contre les discours de haine..."

## Validation & Error Handling

### Relationship Field Handling
- Properly extracts IDs from media relationships
- Prevents "invalid relationship" errors
- Handles various relationship formats

### Localized Content
- Correctly handles locale-specific content objects
- Provides appropriate fallbacks
- Maintains data integrity across languages

## Admin Experience

### Simplified Workflow
1. Admin creates/edits post
2. Adds title and content
3. SEO fields generate automatically
4. No need to visit SEO tab
5. Manual overrides still possible if needed

### Visual Feedback
- SEO preview shows generated content
- Character count indicators
- Validation messages for optimal length

## Troubleshooting

### Debug Mode
Enable logging in development:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[SEO Auto-populate] Content summary generated:', {
    locale,
    summaryLength: summary?.length,
    summaryPreview: summary?.substring(0, 50) + '...'
  })
}
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Description uses title instead of content | Ensure content has actual text (not just media blocks) |
| Validation errors on save | Check that media relationships return IDs only |
| SEO fields not generating | Verify `autoPopulate.mode` configuration |
| Arabic content not working | Ensure proper locale is set in request |

## Best Practices

1. **Content First**: Always add meaningful content before publishing
2. **Hero Images**: Set hero images for automatic SEO image population
3. **First Paragraph**: Make the first paragraph descriptive and engaging
4. **Manual Review**: Occasionally review generated SEO for quality
5. **Testing**: Test with both French and Arabic content

## Future Enhancements

Potential improvements:
- AI-powered description generation
- Keyword optimization suggestions
- SEO score calculation
- Bulk SEO operations for multiple posts
- A/B testing for descriptions