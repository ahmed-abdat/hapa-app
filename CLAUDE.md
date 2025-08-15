# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**HAPA Website** - Official Mauritania government media regulatory authority website.

**Tech Stack:**
- **Frontend**: Next.js 15.3.3 with App Router
- **CMS**: Payload CMS 3.44.0 (headless)
- **i18n**: next-intl (French/Arabic ONLY - NO English)
- **Database**: Neon PostgreSQL
- **Storage**: Cloudflare R2

## Critical Commands

```bash
pnpm dev                          # Start dev server
pnpm generate:types              # REQUIRED after schema changes
pnpm payload generate:importmap  # REQUIRED after adding admin components
pnpm payload migrate             # Apply DB migrations
pnpm build                       # Production build
pnpm lint                        # Check code quality
pnpm analyze                     # Bundle analysis
```

## Project Structure

```
app/
├── (frontend)/[locale]/         # Public pages (fr/ar localized)
│   ├── forms/                  # Media content forms
│   ├── posts/                  # News & categories
│   └── search/                 # Search functionality
├── (payload)/admin/            # CMS admin panel
└── api/                        # API routes & GraphQL

src/
├── blocks/                     # 13 content blocks + RenderBlocks.tsx
├── collections/                # Payload CMS collections (Posts, Media, Submissions)
├── components/                 # React components
│   ├── CustomForms/           # Form components (React Hook Form + Zod)
│   ├── admin/                 # Admin dashboard components
│   └── ui/                    # shadcn/ui components
├── i18n/                      # Internationalization
│   └── navigation.ts          # ALWAYS import Link from here
└── utilities/                 # Helpers (locale, translations, storage)
```

## Critical Development Rules

### Internationalization
- **Languages**: French (fr) and Arabic (ar) ONLY - NO English
- **ALWAYS** import `Link` from `@/i18n/navigation`, NOT `next/link`
- French content required first (generates slugs)
- Arabic is optional with French fallback
- RTL support: use `getLocaleDirection(locale)`

### Payload CMS
- Run `pnpm generate:types` after ANY schema changes
- Run `pnpm payload generate:importmap` after adding admin components
- All blocks must be registered in `src/blocks/RenderBlocks.tsx`
- Collections require localization configuration

### Content Blocks (13 Available)
1. Create: `src/blocks/YourBlock/Component.tsx` + `config.ts`
2. Register in `src/blocks/RenderBlocks.tsx`
3. Add to collection configs
4. Run `pnpm generate:types`

**Available Blocks**: AboutMission, Archive, Banner, CallToAction, Code, ComplaintForm, ContactForm, Content, CoreServices, MediaBlock, MediaSpace, NewsAnnouncements, PartnersSection

### Key Collections
- **Posts**: News articles with categories (localized fr/ar)
- **Media**: Unified media management (Cloudflare R2 storage)
- **MediaContentSubmissions**: Form submissions with admin dashboard
- **MediaSubmissionsDashboard**: Virtual collection for dashboard
- **Categories**: Content categorization
- **Users**: Admin users

## Database

**Neon PostgreSQL**: `damp-snow-64638673`

Schema changes:
1. Update collections in `src/collections/`
2. Run `pnpm payload migrate`
3. Run `pnpm generate:types`

## Forms & UI Framework

**Custom Forms**: `/forms/media-content-complaint` and `/forms/media-content-report`
- Components: `src/components/CustomForms/`
- Server actions: `src/actions/media-forms.ts`
- Admin dashboard: `/admin/media-submissions-dashboard`

**UI Framework**: 
- Tailwind CSS 3.4.17 with custom HAPA branding
- shadcn/ui components in `src/components/ui/`
- RTL support for Arabic
- Responsive design with container queries

## GitHub Actions & CI/CD

### Automated PR Reviews
- **Manual Reviews**: Comment `@claude` on any PR or issue for specific analysis
- **Automatic Reviews**: All PRs automatically reviewed for government compliance
- **Review Focus**: Internationalization, security, accessibility, Payload CMS compliance

### CI/CD Features
- Next.js build caching for faster workflows
- Dependency caching with pnpm
- Comprehensive GitHub CLI integration
- Government website compliance checks
- WCAG 2.1 AA accessibility validation
- French/Arabic translation verification
- RTL layout support validation

### Workflow Files
- `.github/workflows/claude.yml` - Manual trigger reviews
- `.github/workflows/claude-code-review.yml` - Automatic PR reviews

## Security & Performance

- Enhanced CSP and security headers
- Cloudflare R2 storage with CDN optimization
- Bundle analysis available via `pnpm analyze`
- Production-ready with 30-day media caching
- Government compliance automated checks