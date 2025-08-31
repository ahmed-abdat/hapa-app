import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migration to add database indexes for optimizing post queries
 * This improves performance for slug-based queries and ISR generation
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  // Create compound index for posts collection slug and status queries
  // This significantly improves query performance for the common pattern:
  // WHERE slug = ? AND _status = 'published'
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_posts_slug_status 
    ON posts (slug, _status) 
    WHERE _status = 'published';
  `)

  // Create index for posts sorted by publishedAt (used in generateStaticParams)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_posts_published_at_desc 
    ON posts (published_at DESC NULLS LAST) 
    WHERE _status = 'published';
  `)

  // Create index for locale-specific queries
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_posts_locale_slug 
    ON posts_locales (locale, slug) 
    WHERE _locale = 'fr' OR _locale = 'ar';
  `)

  // Create index for draft mode queries
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_posts_draft_slug 
    ON posts (slug) 
    WHERE _status = 'draft';
  `)

  payload.logger.info('✅ Created performance indexes for posts collection')
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  // Remove the indexes in reverse order
  await db.execute(sql`DROP INDEX IF EXISTS idx_posts_draft_slug;`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_posts_locale_slug;`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_posts_published_at_desc;`)
  await db.execute(sql`DROP INDEX IF EXISTS idx_posts_slug_status;`)

  payload.logger.info('✅ Removed performance indexes for posts collection')
}