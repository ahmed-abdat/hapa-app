# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**HAPA Website** - Official government website for Mauritania's media regulatory authority (Haute Autorité de la Presse et de l'Audiovisuel).

## Tech Stack

- **Frontend**: Next.js 15.3.3 with App Router
- **CMS**: Payload CMS 3.52.0 (headless, TypeScript-first)
- **Internationalization**: next-intl with French (default) and Arabic (RTL) support
- **Database**: Neon PostgreSQL with @payloadcms/db-postgres adapter (CLI: `neonctl`)
- **Storage**: Cloudflare R2 (primary) + Vercel Blob (legacy support)
- **UI Framework**: Tailwind CSS + shadcn/ui + Radix UI primitives
- **Package Manager**: pnpm (required - see packageManager field in package.json)

## Essential Commands

### Development

```bash
pnpm dev                          # Start development server (localhost:3000)
pnpm generate:types               # REQUIRED after ANY schema changes
pnpm payload generate:importmap   # REQUIRED after adding admin components
```

### Build & Deploy

```bash
pnpm build                        # Production build with sitemap generation
pnpm ci                          # Migrate database + build (for CI/CD)
pnpm start                       # Start production server
pnpm dev:prod                    # Test production build locally
```

### Database Operations

```bash
pnpm payload migrate             # Apply database schema migrations
pnpm payload                     # Access Payload CLI commands

# Neon CLI Database Management (globally available)
neonctl projects list            # List all Neon projects
neonctl databases list           # List databases in current project
neonctl branches list            # List branches in current project
neonctl connection-string        # Get connection string
neonctl connection-string --pooled  # Get pooled connection string
neonctl operations list          # Check recent database operations
```

### Quality Assurance

```bash
pnpm lint                        # ESLint checks
pnpm lint:fix                    # Auto-fix linting issues
pnpm analyze                     # Bundle analysis (sets ANALYZE=true)
```

### Testing & Browser Automation

```bash
# Playwright testing (MCP integration available)
npx playwright test              # Run Playwright tests
npx playwright test --ui         # Run tests with UI mode
npx playwright test --debug      # Debug mode with browser
npx playwright codegen           # Generate test code
```

## Architecture Overview

### Route Structure

- **Frontend routes**: `src/app/(frontend)/[locale]/` for public pages
- **Admin routes**: `src/app/(payload)/` for CMS admin interface
- **API routes**: `src/app/api/` for custom endpoints
- **Locale routing**: `/fr/` (default) and `/ar/` (RTL) with automatic redirects

### Internationalization System

- **Routing**: `src/i18n/routing.ts` - locale configuration with `localePrefix: 'always'`
- **Navigation**: `src/i18n/navigation.ts` - exports typed Link, redirect, useRouter, etc.
- **Languages**: French (fr) is default, Arabic (ar) with RTL support
- **URL Structure**: Always prefixed (`/fr/page`, `/ar/page`) - NO root-level pages
- **Content Management**: Side-by-side editing in admin with fallback (Arabic → French)

### Block-Based Content System

- **Block Registration**: All blocks MUST be registered in `src/blocks/RenderBlocks.tsx`
- **Block Structure**: Each block has its own directory with Component.tsx and config
- **Available Blocks**: AboutMission, Archive, Banner, CallToAction, Code, ComplaintForm, ContactForm, Content, CoreServices, MediaBlock, MediaSpace, NewsAnnouncements, PartnersSection, RelatedPosts

### CMS Collections Architecture

- **Posts**: Main content with blocks, categories, and multi-language support
- **Media**: File management with Cloudflare R2 integration
- **MediaContentSubmissions**: User-submitted media content with approval workflow
- **MediaSubmissionsDashboard**: Admin interface for managing submissions
- **Categories**: Hierarchical content organization
- **Users**: Admin user management with role-based access

### Storage Configuration

- **Primary**: Cloudflare R2 (configured via environment variables)
- **Legacy**: Vercel Blob (maintained for backward compatibility)
- **Config**: `src/utilities/storage-config.ts` handles storage adapter selection

## Critical Development Rules

### Import Path Standards

- **ALWAYS use `cn` from `@/lib/utils`** - NOT from `@/utilities/cn`
- The correct import is: `import { cn } from '@/lib/utils'`

### Internationalization Requirements

- **NEVER import Link from `next/link`** - always use `@/i18n/navigation`
- **NEVER use Next.js redirect/useRouter directly** - use i18n equivalents
- **French content is required** - Arabic is optional with French fallback
- **All routes must be locale-prefixed** - NO root-level pages except redirects

### Payload CMS Workflow

- **ALWAYS run `pnpm generate:types`** after schema changes (collections, fields, blocks)
- **ALWAYS run `pnpm payload generate:importmap`** after adding admin components
- **Test admin interface** after any CMS-related changes
- **Database migrations** are auto-generated but should be reviewed before production

### Block Development

1. Create block directory in `src/blocks/`
2. Add Component.tsx and config.ts
3. **MUST register in `src/blocks/RenderBlocks.tsx`**
4. Add to BlockType union type
5. Add to blockComponents mapping
6. Run `pnpm generate:types` to update schemas

### Form Development

- **Use React Hook Form + Zod** for validation (see existing forms)
- **Server Actions**: Place in `src/app/actions/` directory
- **Form Components**: Located in `src/components/` with proper TypeScript types

## Environment Setup

### Required Environment Variables

```bash
# Database (Neon PostgreSQL)
POSTGRES_URL=postgresql://...
POSTGRES_URL_POOLED=postgresql://... # Optional pooled connection

# Payload CMS
PAYLOAD_SECRET=your_secret_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Storage (Cloudflare R2)
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_ACCOUNT_ID=your_account_id
R2_PUBLIC_URL=https://pub-hash.r2.dev

# Email (Resend) - Required for production
RESEND_API_KEY=re_xxxxxxxxxxxxx         # Required: Get from resend.com
EMAIL_FROM=support@hapa.mr              # Required: Verified domain email
EMAIL_FROM_NAME=HAPA Support            # Optional

# Email addresses (create these mailboxes in cPanel)
# support@hapa.mr   - Main email for everything (system emails, replies, notifications)
# contact@hapa.mr   - Public contact (used on website) - can forward to support@hapa.mr
```

### Local Development Setup

1. Copy `.env.example` to `.env` and configure
2. Run `pnpm install` (pnpm is required)
3. Run `pnpm payload migrate` to setup database
4. Run `pnpm generate:types` to generate TypeScript types
5. Run `pnpm dev` to start development server

## Performance & Security

### Database Management & Debugging

**Neon CLI** - Global `neonctl` available for database debugging:

- **Current Project**: `hapa` (cold-salad-11795734), context pre-configured
- **Quick Debug**: `neonctl connection-string`, `neonctl operations list`
- **Branch Testing**: `neonctl branches create --name debug-$(date +%s)`

### Build Configuration

- **Bundle Analysis**: Use `pnpm analyze` to inspect bundle size
- **CSP Headers**: Configured in `next.config.mjs` for Payload live preview
- **Image Optimization**: Sharp configured for production builds
- **Security Headers**: XSS protection, content sniffing prevention

### Testing & Browser Automation

- **Playwright MCP Integration**: Multiple configurations available via `.mcp.json`
  - `playwright`: Headless mode for CI/CD
  - `playwright-headed`: Visual debugging with browser
  - `playwright-mobile`: Mobile device testing (iPhone 15)
- **Screenshot Management**: Screenshots stored in `.playwright-mcp/` (excluded from git)
- **Test Automation**: Visual regression testing, E2E scenarios, accessibility audits
- **Development Workflow**: Use MCP tools for browser automation, screenshot capture, and UI testing

### Claude Code CLI Agents

- **HAPA Admin Tester**: Specialized agent for comprehensive admin interface testing
  - **Location**: `.claude/agents/hapa-admin-tester.md`
  - **Invocation**: `@hapa-admin-tester`
  - **Purpose**: Test Payload CMS admin functionality, validate responsive design, capture screenshots
  - **Authentication**: Uses admin@hapa.mr credentials for testing
  - **Testing Scope**: All admin routes, forms, mobile responsiveness, performance
  - **Usage Examples**:
    - `@hapa-admin-tester test the admin dashboard and take screenshots`
    - `@hapa-admin-tester check mobile responsiveness of admin interface`
    - `@hapa-admin-tester validate all admin forms and report issues`
    - `@hapa-admin-tester run comprehensive admin audit with performance metrics`

### Production Considerations

- **Database**: Uses pooled connections in production (POSTGRES_URL_POOLED)
- **Storage**: Cloudflare R2 with custom domain support
- **CDN**: Vercel global CDN with automatic optimization
- **Monitoring**: Built-in error handling and recovery
