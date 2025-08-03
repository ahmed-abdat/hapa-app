import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  try {
    // Create screenshot files array table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "media_content_submissions_content_info_screenshot_files" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "url" varchar
      );
    `)

    // Create attachment files array table  
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "media_content_submissions_attachment_files" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "url" varchar
      );
    `)

    // Add top-level fields if they don't exist
    await db.execute(sql`
      ALTER TABLE "media_content_submissions" 
      ADD COLUMN IF NOT EXISTS "media_type" varchar;
    `)
    
    await db.execute(sql`
      ALTER TABLE "media_content_submissions" 
      ADD COLUMN IF NOT EXISTS "specific_channel" varchar;
    `)
    
    await db.execute(sql`
      ALTER TABLE "media_content_submissions" 
      ADD COLUMN IF NOT EXISTS "program_name" varchar;
    `)

    // Add foreign key constraints
    await db.execute(sql`
      ALTER TABLE "media_content_submissions_content_info_screenshot_files" 
      ADD CONSTRAINT "screenshot_files_parent_id_fk" 
      FOREIGN KEY ("_parent_id") REFERENCES "public"."media_content_submissions"("id") 
      ON DELETE cascade ON UPDATE no action;
    `)

    await db.execute(sql`
      ALTER TABLE "media_content_submissions_attachment_files" 
      ADD CONSTRAINT "attachment_files_parent_id_fk" 
      FOREIGN KEY ("_parent_id") REFERENCES "public"."media_content_submissions"("id") 
      ON DELETE cascade ON UPDATE no action;
    `)

    // Add indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "screenshot_files_order_idx" 
      ON "media_content_submissions_content_info_screenshot_files" ("_order");
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "screenshot_files_parent_id_idx" 
      ON "media_content_submissions_content_info_screenshot_files" ("_parent_id");
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "attachment_files_order_idx" 
      ON "media_content_submissions_attachment_files" ("_order");
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "attachment_files_parent_id_idx" 
      ON "media_content_submissions_attachment_files" ("_parent_id");
    `)

    console.log('✅ File array tables created successfully')
  } catch (error) {
    console.error('❌ Migration error:', error)
    throw error
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  try {
    await db.execute(sql`
      DROP TABLE IF EXISTS "media_content_submissions_content_info_screenshot_files" CASCADE;
    `)
    await db.execute(sql`
      DROP TABLE IF EXISTS "media_content_submissions_attachment_files" CASCADE;
    `)
    await db.execute(sql`
      ALTER TABLE "media_content_submissions" DROP COLUMN IF EXISTS "media_type";
    `)
    await db.execute(sql`
      ALTER TABLE "media_content_submissions" DROP COLUMN IF EXISTS "specific_channel";
    `)
    await db.execute(sql`
      ALTER TABLE "media_content_submissions" DROP COLUMN IF EXISTS "program_name";
    `)
    console.log('✅ File array tables rolled back successfully')
  } catch (error) {
    console.error('❌ Rollback error:', error)
    throw error
  }
}
