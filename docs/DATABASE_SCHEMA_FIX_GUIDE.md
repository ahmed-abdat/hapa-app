# Database Schema Fix Guide - HAPA Forms

**Date:** August 24, 2025  
**Issue:** Failed database migration, missing tables and columns  
**Status:** 🚨 CRITICAL - Immediate fix required  

---

## 🎯 **QUICK SUMMARY**

The database migration failed, leaving the system in an inconsistent state. We need to manually complete the schema changes to restore functionality.

### **What's Working:**
- ✅ Media forms and their database tables
- ✅ Core Payload CMS functionality
- ✅ Basic admin interface (with errors)

### **What's Broken:**
- ❌ Contact form collections (missing database tables)
- ❌ Admin relationship queries (missing columns)
- ❌ Contact dashboard and submission views

---

## 🔧 **MANUAL FIX APPROACH**

### **Step 1: Create Missing Database Tables**

#### **A. Contact Submissions Table**
```sql
-- Create enum types first
CREATE TYPE enum_contact_submissions_status AS ENUM('pending', 'in-progress', 'resolved');
CREATE TYPE enum_contact_submissions_locale AS ENUM('fr', 'ar');

-- Create contact_submissions table
CREATE TABLE contact_submissions (
    id serial PRIMARY KEY NOT NULL,
    status enum_contact_submissions_status DEFAULT 'pending' NOT NULL,
    locale enum_contact_submissions_locale NOT NULL,
    name varchar NOT NULL,
    email varchar NOT NULL,
    phone varchar,
    subject varchar NOT NULL,
    message text,
    admin_notes text,
    reply_message text,
    email_sent boolean DEFAULT false,
    email_sent_at timestamp(3) with time zone,
    submitted_at timestamp(3) with time zone NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX contact_submissions_status_idx ON contact_submissions USING btree (status);
CREATE INDEX contact_submissions_locale_idx ON contact_submissions USING btree (locale);
CREATE INDEX contact_submissions_email_sent_idx ON contact_submissions USING btree (email_sent);
CREATE INDEX contact_submissions_updated_at_idx ON contact_submissions USING btree (updated_at);
CREATE INDEX contact_submissions_created_at_idx ON contact_submissions USING btree (created_at);
CREATE INDEX contact_submissions_submitted_at_idx ON contact_submissions USING btree (submitted_at);
```

#### **B. Contact Dashboard Table (Virtual Collection Helper)**
```sql
-- Create minimal contact_dashboard table for virtual collection
CREATE TABLE contact_dashboard (
    id serial PRIMARY KEY NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- Create basic indexes
CREATE INDEX contact_dashboard_updated_at_idx ON contact_dashboard USING btree (updated_at);
CREATE INDEX contact_dashboard_created_at_idx ON contact_dashboard USING btree (created_at);
```

### **Step 2: Add Missing Relationship Columns**
```sql
-- Add missing columns to payload_locked_documents_rels
ALTER TABLE payload_locked_documents_rels 
ADD COLUMN contact_dashboard_id integer,
ADD COLUMN contact_submissions_id integer;

-- Create indexes for the new columns
CREATE INDEX payload_locked_documents_rels_contact_dashboard_id_idx 
ON payload_locked_documents_rels USING btree (contact_dashboard_id);

CREATE INDEX payload_locked_documents_rels_contact_submissions_id_idx 
ON payload_locked_documents_rels USING btree (contact_submissions_id);
```

### **Step 3: Verify Existing Media Tables**
```sql
-- Check that media_content_submissions table exists and is intact
SELECT COUNT(*) FROM media_content_submissions;

-- Check that the media relationship column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'payload_locked_documents_rels' 
AND column_name = 'media_content_submissions_id';
```

---

## 🗂️ **ALTERNATIVE: Using Payload CLI**

If manual SQL is not preferred, try these Payload commands:

### **Option A: Reset and Fresh Migration**
```bash
# 1. Backup any important data first
pnpm payload migrate:create

# 2. Reset Payload migrations
rm -rf src/migrations/*

# 3. Fresh migration
pnpm payload migrate

# 4. Answer migration prompts correctly:
# - Create new enums/tables for contact forms
# - Keep existing media tables unchanged
```

### **Option B: Generate Specific Migration**
```bash
# Generate a migration for just the missing pieces
pnpm payload migrate:create --name "add_contact_collections"

# Then manually edit the generated migration file in src/migrations/
# to include only the missing tables and columns
```

---

## 🧪 **TESTING AFTER FIX**

### **Database Verification:**
```sql
-- 1. Check all required tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('contact_submissions', 'contact_dashboard', 'media_content_submissions');

-- 2. Check all required columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'payload_locked_documents_rels'
AND column_name IN ('contact_dashboard_id', 'contact_submissions_id', 'media_content_submissions_id');

-- 3. Check enum types exist
SELECT typname FROM pg_type 
WHERE typname IN ('enum_contact_submissions_status', 'enum_contact_submissions_locale');
```

### **Application Testing:**
1. **Start dev server:** `pnpm dev`
2. **Check admin loads:** `http://localhost:3000/admin`
3. **Test contact dashboard:** `/admin/collections/contact-dashboard`
4. **Test contact submissions:** `/admin/collections/contact-submissions`
5. **Test media forms:** `/admin/collections/media-content-submissions`
6. **Test frontend contact form:** `/contact` (submit a test message)

---

## 🏗️ **COMPLETE SCHEMA REFERENCE**

### **Contact Submissions Collection Schema:**
```typescript
// From src/collections/ContactSubmissions/index.ts
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  fields: [
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'in-progress', 'resolved'],
      defaultValue: 'pending'
    },
    {
      name: 'locale', 
      type: 'select',
      options: ['fr', 'ar'],
      admin: { readOnly: true }
    },
    // User fields (all readOnly: true)
    { name: 'name', type: 'text', admin: { readOnly: true } },
    { name: 'email', type: 'email', admin: { readOnly: true } },
    { name: 'phone', type: 'text', admin: { readOnly: true } },
    { name: 'subject', type: 'text', admin: { readOnly: true } },
    { name: 'message', type: 'textarea', admin: { readOnly: true } },
    
    // Admin management fields
    { name: 'adminNotes', type: 'textarea' },
    { name: 'replyMessage', type: 'textarea' },
    { name: 'emailSent', type: 'checkbox', admin: { readOnly: true } },
    { name: 'emailSentAt', type: 'date', admin: { readOnly: true } },
    { name: 'submittedAt', type: 'date', admin: { readOnly: true } }
  ]
}
```

### **Media Content Submissions (Unchanged):**
```typescript
// This collection should remain completely unchanged
// It handles both 'report' and 'complaint' formTypes
// Database table: media_content_submissions
// Admin URL: /admin/collections/media-content-submissions
```

---

## 📋 **TROUBLESHOOTING COMMON ISSUES**

### **Issue 1: "relation does not exist"**
```
Error: relation "contact_submissions" does not exist
```
**Fix:** Run the CREATE TABLE commands from Step 1

### **Issue 2: "column does not exist"**
```
Error: column payload_locked_documents_rels.contact_dashboard_id does not exist
```
**Fix:** Run the ALTER TABLE commands from Step 2

### **Issue 3: "enum does not exist"**
```
Error: type "enum_contact_submissions_status" does not exist
```
**Fix:** Run the CREATE TYPE commands from Step 1

### **Issue 4: Media forms broken**
If media forms stop working:
1. Check `media_content_submissions` table exists
2. Check `media_content_submissions_id` column exists in `payload_locked_documents_rels`
3. Verify MediaContentSubmissions collection is still in payload.config.ts

---

## 🎯 **SUCCESS VERIFICATION**

After applying the fix, you should be able to:

1. ✅ **Access admin without errors:** `http://localhost:3000/admin`
2. ✅ **View contact dashboard:** `/admin/collections/contact-dashboard`
3. ✅ **View contact submissions:** `/admin/collections/contact-submissions`
4. ✅ **Submit contact form:** Fill out `/contact` form and see it in admin
5. ✅ **Media forms unchanged:** `/admin/collections/media-content-submissions` works
6. ✅ **No console errors** in browser or server logs

---

## 🚨 **EMERGENCY ROLLBACK**

If the fix causes more issues, you can rollback:

### **Quick Rollback to Working State:**
```sql
-- Remove the new tables (this will lose any new contact submissions)
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS contact_dashboard CASCADE;

-- Remove the new columns
ALTER TABLE payload_locked_documents_rels 
DROP COLUMN IF EXISTS contact_dashboard_id,
DROP COLUMN IF EXISTS contact_submissions_id;

-- Remove the new enums
DROP TYPE IF EXISTS enum_contact_submissions_status;
DROP TYPE IF EXISTS enum_contact_submissions_locale;
```

### **Then restore old system:**
1. Revert payload.config.ts to use original FormSubmissions collection
2. Restore the old FormSubmissions collection files
3. Revert the contact-form.ts action to use 'form-submissions'

---

**Fix Status:** ✅ **COMPLETED** (August 24, 2025)  
**Time Taken:** ~45 minutes  
**Method:** Custom Node.js migration script
**Result:** Database schema fully restored, data preserved

---

## ✅ **FIX COMPLETED SUCCESSFULLY**

### **Next Steps When Resuming:**
1. Run `pnpm dev` and **ACCEPT** these safe column deletions:
   - `form_submissions_id` in `payload_locked_documents_rels` (2 items) - ✅ Safe, data migrated
   - `dashboard_form_submissions_id` in `payload_locked_documents_rels` (2 items) - ✅ Safe, old system  
   - `form_type` column in `contact_submissions` (1 item) - ✅ Safe, field removed from schema

2. Use `@hapa-admin-tester` agent to test admin interface
3. Test contact form submission from `/contact`