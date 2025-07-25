# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HAPA Website** - Official government website for Mauritania's media regulatory authority (Haute Autorité de la Presse et de l'Audiovisuel).

Production-ready bilingual government website with French/Arabic support and RTL layout. Built with Payload CMS 3.44.0 headless CMS and Next.js 15 with next-intl for internationalization.

**Critical Architecture Components:**
- **CMS**: Payload CMS with localized collections and block-based page builder
- **Internationalization**: next-intl routing with French (default) and Arabic (RTL) support
- **Frontend**: Next.js 15 App Router with locale-based routing (`/fr/`, `/ar/`)
- **Database**: Neon PostgreSQL with Vercel adapter
- **Storage**: Vercel Blob for media files

## Essential Commands

### Development Workflow
- `pnpm dev` - Start development server (http://localhost:3000 → redirects to /fr)
- `pnpm generate:types` - **REQUIRED after schema changes** - Regenerate TypeScript types
- `pnpm payload migrate` - Apply database schema changes (select "+" to accept)
- `pnpm lint` & `pnpm lint:fix` - Code quality checks and fixes

### Content Management
- Admin panel: http://localhost:3000/admin
- Frontend: http://localhost:3000/fr (French), http://localhost:3000/ar (Arabic RTL)

### Production
- `pnpm build` - Production build with automatic sitemap generation
- `pnpm ci` - Database migrations + build (used in CI/CD)

### Neon CLI Database Management
- `neonctl auth` - Authenticate with Neon (required once, opens browser)
- `neonctl projects list` - List all Neon projects 
- `neonctl databases list --project-id <project-id>` - List databases in project
- `neonctl branches list --project-id <project-id>` - List database branches
- `neonctl connection-string <branch> --project-id <project-id>` - Get connection string
- Direct queries via Node.js scripts with connection string for debugging

## Architecture Overview

### Page Structure & Routing
- **Dynamic Pages**: `app/(frontend)/[locale]/[slug]/page.tsx` - All localized pages
- **Hero System**: `src/heros/RenderHero.tsx` - Dynamic hero component resolver
- **Block System**: `src/blocks/RenderBlocks.tsx` - CMS content blocks renderer
- **Internationalization**: `src/i18n/navigation.ts` - next-intl routing utilities

### Content Management Flow
1. **Collections** (`src/collections/`) define data structure with localization
2. **Admin interface** creates/edits bilingual content with side-by-side editing
3. **Static homepage** (`src/endpoints/seed/home-static.ts`) provides fallback content
4. **Dynamic rendering** combines hero + blocks for each page

**Block System Architecture:**
- All blocks registered in `src/blocks/RenderBlocks.tsx`
- Block configs in `src/collections/Pages/index.ts` determine admin interface
- Each block: `Component.tsx` (React) + `config.ts` (Payload schema)

**Hero System Architecture:**
- Hero types registered in `src/heros/RenderHero.tsx`
- Hero configs in `src/heros/config.ts` define admin options
- Homepage uses `homepageHero` type with bilingual content

**Internationalization Stack:**
- `src/i18n/routing.ts` - Locale configuration (fr/ar)
- `src/i18n/navigation.ts` - **ALWAYS import Link from here, not next/link**
- `src/utilities/locale.ts` - Core locale utilities and direction detection
- `src/utilities/translations.ts` - UI string translations

## Development Workflow

### Adding New Content Blocks
1. Create block component: `src/blocks/YourBlock/Component.tsx`
2. Create block config: `src/blocks/YourBlock/config.ts`
3. Register in `src/blocks/RenderBlocks.tsx` (import + add to blockComponents)
4. Register in `src/collections/Pages/index.ts` (import + add to blocks array)
5. Run `pnpm generate:types` to update TypeScript types

### Adding New Hero Types
1. Create hero component: `src/heros/YourHero/index.tsx`
2. Register in `src/heros/RenderHero.tsx` (import + add to heroes object)
3. Add option in `src/heros/config.ts`
4. Run `pnpm generate:types` to update types

### Adding Translations
1. Add keys to both `fr` and `ar` objects in `src/utilities/translations.ts`
2. Use `getTranslation(key, locale)` in components
3. Get locale from `useParams()` and cast to `Locale` type

## Critical Development Rules

### Internationalization Requirements
- **ALWAYS** import `Link` from `@/i18n/navigation`, never from `next/link`
- **ALWAYS** run `pnpm generate:types` after schema changes
- French content required first (generates slugs), Arabic translation optional with fallback
- Use `useParams()` to get locale, cast as `Locale` type
- Support RTL layout: use `getLocaleDirection(locale)` for `dir` attribute

### Bilingual Content Workflow
1. **Create French first** - Required for slug generation and fallback
2. **Add Arabic translation** - Optional, falls back to French if missing  
3. **Test both locales** - Check /fr/ and /ar/ URLs, verify RTL layout
4. **Use translations** - `getTranslation(key, locale)` for UI strings

### Collections Overview
- **Pages**: Static content (About HAPA, Legal information) with block-based layout
- **Posts**: News articles, press releases, decisions with rich text content
- **Categories**: Content organization with bilingual labels
- **Custom Form Submissions**: Contact and complaint form submissions (replaced Feedback collection)
- **Media**: File uploads with automatic optimization and CDN delivery
- **Users**: Admin authentication with role-based access

### Custom Forms System
The project uses a custom forms system built with React Hook Form + Zod + Shadcn UI instead of Payload's form builder plugin for better control and government compliance:

- **Contact Forms**: General inquiries with name, email, phone, subject, message
- **Complaint Forms**: Formal complaints with organization, incident details, complaint type
- **Document Request Forms**: Official document requests with urgency levels
- **Bilingual Support**: All forms work in French/Arabic with proper RTL layout
- **Admin Interface**: Enhanced submission management with contact actions (email, WhatsApp)
- **API Endpoint**: `/api/custom-forms/submit` handles form submissions with validation

### Admin Interface
- **URL**: `/admin` - Payload CMS admin interface
- **Authentication**: Secure login with session management
- **Live Preview**: Real-time content preview in both languages
- **Language Tabs**: Switch between French and Arabic content editing
- **Media Management**: Upload, organize, and optimize files

## Development Guidelines

### Working with Localized Content
1. Always create French content first (required for slug generation)
2. Use the `getTranslation()` helper for UI strings
3. Test content in both languages and RTL layout
4. Verify fallback behavior (Arabic → French)

### Adding New Content Fields
1. Add `localized: true` to field definitions in collections
2. Run `pnpm generate:types` to update TypeScript types
3. Update components to handle localized data
4. Test with both French and Arabic content

### Component Development
1. Use locale-aware utilities from `src/utilities/`
2. Support both LTR and RTL layouts
3. Import translations from `src/utilities/translations.ts`
4. Test with `LocaleHandler` component for proper direction switching

### Database Schema Changes
1. Modify collection definitions in `src/collections/`
2. Run `pnpm payload migrate` to apply changes
3. Generate new types with `pnpm generate:types`
4. Update components to use new fields

### Database & Type Safety
- **Schema changes**: Update `src/collections/` → `pnpm payload migrate` → `pnpm generate:types`
- **New blocks/heroes**: Register in both Component file and config arrays
- **Localized fields**: Add `localized: true` to field definitions

## Environment Setup

Copy `.env.example` to `.env` with:
```env
POSTGRES_URL=postgresql://...           # Neon database connection  
PAYLOAD_SECRET=...                      # Payload CMS encryption key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000    # Public URL
BLOB_READ_WRITE_TOKEN=...              # Vercel Blob storage token
```

## Performance and SEO

### Optimization Features
- Image optimization with WebP/AVIF formats and multiple sizes
- Static generation for better performance
- Automatic sitemap generation for both languages
- CDN distribution via Vercel Edge Network
- Core Web Vitals optimization

### SEO Configuration
- Multilingual meta tags and Open Graph support
- Structured data for government organization
- Canonical URLs to prevent duplicate content
- Hreflang tags for language variants
- Performance target: PageSpeed score ≥ 90

## HAPA Brand Colors
Defined in `src/app/(frontend)/globals.css`:
- **Primary**: `#138B3A` (HAPA Green)
- **Secondary**: `#E6E619` (HAPA Yellow)  
- **Accent**: `#0F7A2E` (HAPA Dark Green)

## Testing Checklist
- [ ] French content displays at `/fr/*` URLs
- [ ] Arabic content displays at `/ar/*` URLs with RTL layout
- [ ] Language navigation works correctly
- [ ] Admin panel accessible at `/admin`
- [ ] `pnpm lint` passes without errors
- [ ] `pnpm build` completes successfully

## Database Management & Debugging

### Neon CLI Setup and Usage
The project uses Neon PostgreSQL with CLI tools for database operations:

**Installation & Authentication:**
```bash
npm install -g neonctl
neonctl auth  # Opens browser for OAuth (one-time setup)
```

**HAPA Project Details:**
- **Project ID**: `damp-snow-64638673` 
- **Database**: `neondb`
- **Region**: `aws-eu-central-1`
- **Branches**: 
  - `production` (br-floral-frog-a20lonlx) - main branch
  - `development` (br-dawn-recipe-a20o2l0x) - dev branch

**Common Neon CLI Commands:**
```bash
# List projects and branches
neonctl projects list
neonctl branches list --project-id damp-snow-64638673

# Get connection strings
neonctl connection-string production --project-id damp-snow-64638673

# Database management
neonctl databases list --project-id damp-snow-64638673
```

### Direct Database Access
For complex debugging, create temporary Node.js scripts:

```javascript
import pkg from 'pg';
const { Client } = pkg;

async function debugDatabase() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  // Your queries here
  await client.end();
}
```

**Best Practices:**
- Use Neon CLI for schema inspection and branch management
- Create temporary debug scripts for complex data analysis
- Always use SSL connections (`rejectUnauthorized: false` for dev)
- Clean up debug scripts after use
- Use `neonctl connection-string` to get current connection details

### Database Schema Management
When making schema changes that affect Payload collections:

1. **Remove Payload plugins**: Drop associated tables manually if needed
2. **Migration conflicts**: Use Neon CLI to inspect and clean conflicting tables
3. **Schema sync**: Let Payload dev mode auto-sync after manual cleanup
4. **Type generation**: Always run `pnpm generate:types` after schema changes

### Database Debugging with Neon CLI
When debugging database issues, use the Neon CLI for direct access:

1. **Authentication**: Run `neonctl auth` once (opens browser for OAuth)
2. **Project Access**: Use project ID `damp-snow-64638673` for HAPA project
3. **Database Structure**: 
   - Database: `neondb` 
   - Production branch: `br-floral-frog-a20lonlx`
   - Development branch: `br-dawn-recipe-a20o2l0x`
4. **Direct Queries**: Create Node.js scripts with pg client for complex debugging
5. **Schema Cleanup**: Drop conflicting tables when removing Payload plugins

**Example Debug Script Pattern:**
```javascript
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});
```

## Commit Guidelines
- Never mention "claude code" in commit messages
- Test bilingual functionality before committing
- Run `pnpm generate:types` after schema changes

## Project Status

This is a **production-ready** HAPA government website featuring:
- ✅ Complete bilingual implementation (French/Arabic + RTL)
- ✅ Modern tech stack (Next.js 15, Payload CMS 3.44.0)
- ✅ Government branding and accessibility compliance
- ✅ SEO optimization and performance focus
- ✅ Secure deployment on Vercel Pro
- ✅ Comprehensive documentation and knowledge base

The project is ready for content migration and production use.
