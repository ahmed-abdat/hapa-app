# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HAPA Website** - Official government website for Mauritania's media regulatory authority (Haute Autorité de la Presse et de l'Audiovisuel).

Production-ready bilingual government website with French/Arabic support and RTL layout. Built with Payload CMS 3.44.0 headless CMS and Next.js 15.3.3 with next-intl for internationalization.

**Critical Architecture Components:**
- **CMS**: Payload CMS with localized collections and block-based page builder
- **Internationalization**: next-intl routing with French (default) and Arabic (RTL) support
- **Frontend**: Next.js 15.3.3 App Router with locale-based routing (`/fr/`, `/ar/`)
- **Database**: Neon PostgreSQL with Vercel adapter
- **Storage**: Cloudflare R2 for media files (legacy Vercel Blob also supported)

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

### Key Collections
- **Pages**: Block-based static content | **Posts**: News with categories | **MediaContentSubmissions**: Form submissions

### Custom Forms (React Hook Form + Zod + Shadcn UI)
- **Media Content Complaint/Report Forms**: Bilingual with RTL support
- **API**: `/api/media-forms/submit` | `/api/admin/media-submissions*`

## Database Management

**Project**: `damp-snow-64638673` | **Database**: `neondb` | **Region**: `aws-eu-central-1`

**Key Commands:**
```bash
neonctl auth  # One-time authentication
neonctl connection-string production --project-id damp-snow-64638673
```

**Schema Changes Workflow:**
1. Update collections in `src/collections/`
2. Run `pnpm payload migrate` 
3. Run `pnpm generate:types`