# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HAPA Website** - Official website for Haute Autorité de la Presse et de l'Audiovisuel (Mauritania's media regulatory authority)

This is a production-ready government website built with modern web technologies and full bilingual support (French/Arabic with RTL). The project uses Payload CMS as a headless CMS with Next.js 15 for the frontend.

**Tech Stack:**
- Payload CMS 3.44.0 (TypeScript-first headless CMS with localization)
- Next.js 15.3.3 with App Router and server-side rendering
- Neon PostgreSQL (managed serverless database via Vercel adapter)
- Vercel Pro (hosting, CDN & deployment)
- Tailwind CSS with HAPA government branding
- TypeScript with strict mode enabled
- Vercel Blob storage for media files

## Essential Commands

### Development
- `pnpm install` - Install dependencies
- `pnpm dev` - Start local development server at http://localhost:3000
- `pnpm payload` - Access Payload admin interface
- `pnpm generate:types` - Generate TypeScript types from collections (run after schema changes)
- `pnpm generate:importmap` - Generate import map for Payload admin

### Building & Deployment
- `pnpm build` - Build production application with automatic sitemap generation
- `pnpm start` - Start production server locally
- `pnpm lint` - Run ESLint checks
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm ci` - Run database migrations and build (used in CI/CD pipeline)

### Database Operations
- `pnpm payload migrate` - Run database migrations (select "+" to accept schema changes)
- `pnpm payload seed` - Seed database with sample content (development only)

## Quick Start Guide

1. **Install dependencies**: `pnpm install`
2. **Set up environment**: Copy `.env.example` to `.env` and configure:
   ```env
   POSTGRES_URL=your_neon_database_url
   PAYLOAD_SECRET=your_secure_random_string
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```
3. **Run migrations**: `pnpm payload migrate`
4. **Generate types**: `pnpm generate:types`
5. **Start development**: `pnpm dev`
6. **Access the application**: 
   - Frontend: http://localhost:3000 (automatically redirects to /fr)
   - French content: http://localhost:3000/fr
   - Arabic content: http://localhost:3000/ar (automatic RTL layout)
   - Admin panel: http://localhost:3000/admin

## Project Architecture

### Directory Structure
```
src/
├── app/
│   ├── (frontend)/[locale]/        # Localized public pages (/fr, /ar)
│   │   ├── layout.tsx             # Locale-specific layout with RTL support
│   │   ├── [slug]/                # Dynamic pages (About, Legal, etc.)
│   │   └── posts/                 # News articles and press releases
│   └── (payload)/                 # Payload CMS admin interface
│       ├── admin/                 # Admin panel routes
│       └── api/                   # API endpoints
├── collections/                   # Payload CMS collections with localization
│   ├── Pages/                     # Static pages (About, Legal info)
│   ├── Posts/                     # News articles, press releases
│   ├── Categories.ts              # Content categorization
│   ├── Feedback.ts                # Contact form submissions
│   ├── Media.ts                   # File uploads with Vercel Blob
│   └── Users/                     # Admin user accounts
├── components/                    # React components
│   ├── LocaleHandler/             # Client-side locale detection and HTML attributes
│   ├── LanguageSwitcher/          # Bilingual navigation component
│   ├── RichText/                  # Lexical editor renderer
│   └── ui/                        # Reusable UI components
├── blocks/                        # Content blocks for page builder
│   ├── Banner/                    # Hero sections
│   ├── Content/                   # Rich text content
│   ├── Form/                      # Contact forms
│   └── MediaBlock/                # Media displays
├── utilities/                     # Helper functions and utilities
│   ├── locale.ts                  # Core locale management
│   ├── translations.ts            # UI string translations
│   ├── generateMeta.ts            # SEO metadata generation
│   └── getGlobals.ts              # Cached global data fetching
└── payload.config.ts              # Main CMS configuration
```

### Key Files and Their Purpose

**Configuration Files:**
- `src/payload.config.ts` - Main Payload CMS configuration with localization setup
- `next.config.mjs` - Next.js configuration with redirects and image optimization
- `vercel.json` - Vercel deployment configuration with cron jobs

**Core Utility Files:**
- `src/utilities/locale.ts` - Locale definitions and validation (`['fr', 'ar']`)
- `src/utilities/translations.ts` - Translation system with UI strings
- `src/utilities/generateMeta.ts` - SEO metadata generation per locale

**Critical Components:**
- `src/components/LocaleHandler/index.tsx` - Updates HTML `dir` and `lang` attributes
- `src/components/LanguageSwitcher/index.tsx` - Language navigation component
- `src/app/(frontend)/[locale]/layout.tsx` - Main layout with locale validation

## Internationalization System

### Locale Configuration
- **French (fr)**: Default language for content creation and URL slugs
- **Arabic (ar)**: Full translation support with automatic RTL layout
- **URL Structure**: Root `/` redirects to `/fr`, supports `/fr/page` and `/ar/page`
- **Fallback**: Arabic content automatically falls back to French when missing

### Content Localization
All content collections support bilingual content through:
- `localized: true` fields in Payload collections
- Side-by-side editing interface in admin panel
- Automatic slug generation from French titles
- Separate SEO metadata per language

### RTL Support
- Automatic `dir="rtl"` attribute for Arabic content
- Mirrored layout elements (navigation, buttons, images)
- Proper text alignment and reading flow
- Arabic typography with appropriate fonts

## Content Management

### Collections Overview
- **Pages**: Static content (About HAPA, Legal information) with block-based layout
- **Posts**: News articles, press releases, decisions with rich text content
- **Categories**: Content organization with bilingual labels
- **Feedback**: Contact form submissions with localized fields
- **Media**: File uploads with automatic optimization and CDN delivery
- **Users**: Admin authentication with role-based access

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

## Environment Variables

### Required Variables
```env
POSTGRES_URL=postgresql://...           # Neon database connection
PAYLOAD_SECRET=...                      # Payload CMS encryption key
NEXT_PUBLIC_SERVER_URL=...             # Public URL (http://localhost:3000 for dev)
BLOB_READ_WRITE_TOKEN=...              # Vercel Blob storage token
```

### Optional Variables
```env
RESEND_API_KEY=...                     # Email notifications
CRON_SECRET=...                        # Vercel cron job authentication
```

## Brand Guidelines

### HAPA Brand Colors
Defined in `src/app/(frontend)/globals.css`:
- **Primary Blue**: `#065986` - Government authority color
- **Secondary Gold**: `#D4A574` - Official accent color
- **Supporting Green**: `#2D5A27` - Regulatory theme color

### Typography
- **Primary Font**: Geist font family
- **Arabic Support**: Proper Arabic typography with correct line height
- **Responsive Scaling**: Mobile-first approach with proper text sizing

## Testing and Quality Assurance

### Development Testing
1. **Bilingual Functionality**: Test both French and Arabic content display
2. **RTL Layout**: Verify Arabic content shows properly with RTL direction
3. **Language Switching**: Test navigation between locales
4. **Admin Interface**: Verify content editing in both languages
5. **Performance**: Check Core Web Vitals for both languages

### Before Deployment
1. Run `pnpm lint` to check for code issues
2. Run `pnpm build` to verify production build
3. Test all pages in both languages
4. Verify mobile responsiveness
5. Check SEO metadata generation

## Common Development Tasks

### Adding a New Page
1. Create content in admin panel at `/admin` → Pages
2. Add French title and content (required for slug generation)
3. Switch to Arabic tab and add translation
4. Preview in both languages
5. Publish to make available at `/fr/slug` and `/ar/slug`

### Modifying Content Structure
1. Update collection definitions in `src/collections/`
2. Run `pnpm payload migrate` to apply schema changes
3. Generate new TypeScript types with `pnpm generate:types`
4. Update components to handle new fields
5. Test with existing content

### Adding New UI Text
1. Add translations to `src/utilities/translations.ts`
2. Use `getTranslation(locale, key)` in components
3. Test with both French and Arabic
4. Verify RTL layout if text affects layout

## Deployment

### Production Environment
- **Platform**: Vercel Pro with global CDN
- **Database**: Neon PostgreSQL (managed, serverless)
- **Domain**: www.hapa.mr with SSL certificate
- **Storage**: Vercel Blob for media files

### Deployment Process
1. **Staging**: Automatic deployment on pull requests
2. **Production**: Manual deployment from main branch
3. **Migrations**: Automatic database migrations via `pnpm ci`
4. **Monitoring**: Performance and error tracking enabled

## Documentation

### Essential Documentation
- **docs/DEVELOPMENT_GUIDE.md** - Development patterns, common mistakes, and current improvements
- **docs/MULTILINGUAL_SLUG_IMPROVEMENTS.md** - Detailed tracking of slug generation enhancements

### Development Best Practices
1. **Check docs/DEVELOPMENT_GUIDE.md first** for common patterns and mistakes
2. **Update documentation** when you learn something new or fix an issue
3. **Focus on practical examples** with working code snippets
4. **Test bilingual functionality** (French/Arabic) for all changes

## Project Status

This is a **production-ready** HAPA government website featuring:
- ✅ Complete bilingual implementation (French/Arabic + RTL)
- ✅ Modern tech stack (Next.js 15, Payload CMS 3.44.0)
- ✅ Government branding and accessibility compliance
- ✅ SEO optimization and performance focus
- ✅ Secure deployment on Vercel Pro
- ✅ Comprehensive documentation and knowledge base

The project is ready for content migration and production use.