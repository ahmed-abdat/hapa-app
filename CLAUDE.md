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
- **Homepage**: `app/(frontend)/[locale]/page.tsx` - Homepage with hero + blocks
- **Dynamic Pages**: Specific routes like `/posts/[slug]`, `/about/*`, `/forms/*`
- **Block System**: `src/blocks/RenderBlocks.tsx` - CMS content blocks renderer
- **Internationalization**: `src/i18n/navigation.ts` - next-intl routing utilities
- **App Structure**: `(frontend)` for public pages, `(payload)` for CMS admin

### Content Management Flow
1. **Collections** (`src/collections/`) define data structure with localization
2. **Admin interface** creates/edits bilingual content with side-by-side editing
3. **Static homepage** (`src/endpoints/seed/home-static.ts`) provides fallback content
4. **Dynamic rendering** combines hero + blocks for each page

**Block System Architecture:**
- All blocks registered in `src/blocks/RenderBlocks.tsx` with component mapping
- Block variants: `NewsAnnouncements` supports 'simple' and 'rich' layouts
- Each block: `Component.tsx` (React) + `config.ts` (Payload schema)
- Available blocks: `aboutMission`, `archive`, `banner`, `code`, `complaintForm`, `contactForm`, `content`, `coreServices`, `cta`, `mediaBlock`, `mediaReportingCTA`, `mediaSpace`, `newsAnnouncements`, `partnersSection`

**Hero System Architecture:**
- Heroes used directly in pages without central registry
- Available heroes: `HomepageHero`, `ContactUsHero`, `PostHero`, `PublicationsCategoryHero`
- Each hero accepts locale and content props for bilingual rendering

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
2. **Note**: There is no central `RenderHero.tsx` or `config.ts` - heroes are used directly in pages
3. Available hero types: `HomepageHero`, `ContactUsHero`, `PostHero`, `PublicationsCategoryHero`
4. Import directly in page components and pass appropriate props

### Adding Translations
1. Add keys to both `fr` and `ar` objects in `/messages/fr.json` and `/messages/ar.json`
2. Use `useTranslations()` hook or `getTranslations()` server function
3. Get locale from `useParams()` and cast to `Locale` type
4. Message files are loaded via next-intl `NextIntlClientProvider`

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
- **Posts**: News articles with categories and localization
- **Media**: File storage with metadata and CDN optimization 
- **FormMedia**: Form-specific file uploads separate from general media
- **Categories**: Post categorization system
- **MediaContentSubmissions**: Public form submissions (complaint/report)
- **Users**: Admin user management

### Custom Forms (React Hook Form + Zod + Shadcn UI)
- **Forms**: `/forms/media-content-complaint` and `/forms/media-content-report`
- **Components**: `src/components/CustomForms/` with field components and schemas
- **API**: Form submission via server actions in `src/actions/media-forms.ts`
- **Admin View**: Custom dashboard at `/admin/media-submissions` for form management

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

## Performance & Bundle Analysis

### Bundle Analysis Commands
- `pnpm analyze` - Production bundle analysis with size breakdown
- `pnpm analyze:dev` - Development bundle analysis
- Bundle analyzer available at `http://localhost:3000/__bundle_analyzer`

### Storage Configuration
- **Primary**: Cloudflare R2 bucket via `@payloadcms/storage-s3`
- **Fallback**: Local file storage for development
- **Configuration**: `src/utilities/storage-config.ts` with environment-based selection
- **Media Handling**: Automatic format optimization and CDN delivery

## Testing & Quality Assurance

### Code Quality Commands
- `pnpm lint` - ESLint checks with Next.js rules
- `pnpm lint:fix` - Auto-fix linting issues
- **Configuration**: `eslint.config2.mjs` with TypeScript and accessibility rules

### Browser Support
- **Modern Browsers**: Chrome 64+, Firefox 67+, Safari 12+, Edge 79+
- **RTL Support**: Full Arabic RTL layout with proper text direction
- **Performance**: Core Web Vitals optimized with Next.js 15 features