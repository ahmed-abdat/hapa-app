# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HAPA Website** - Official government website for Mauritania's media regulatory authority (Haute Autorité de la Presse et de l'Audiovisuel).

Production-ready bilingual government website with **French/Arabic support ONLY** (no English translations) and RTL layout. Built with Payload CMS 3.44.0 headless CMS and Next.js 15.3.3 with next-intl for internationalization.

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
- `pnpm payload generate:importmap` - **REQUIRED after adding admin components** - Register new components
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
6. If block uses admin components, run `pnpm payload generate:importmap`

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

### Payload CMS Admin Development
- **MANDATORY**: Run `pnpm payload generate:importmap` after creating any custom admin components
- **MANDATORY**: Run `pnpm generate:types` after modifying collections, globals, or field schemas
- **Component Registration**: All admin components must be registered in importMap for Payload to recognize them
- **Collection Changes**: Any new collections or field modifications require type generation
- **Admin Component Paths**: Use absolute paths from project root (e.g., `@/components/admin/MyComponent`)

### Internationalization Requirements
- **LANGUAGES**: French (fr) and Arabic (ar) ONLY - NO English translations
- **ALWAYS** import `Link` from `@/i18n/navigation`, never from `next/link`
- **ALWAYS** run `pnpm generate:types` after schema changes
- **ALWAYS** run `pnpm payload generate:importmap` after adding admin components
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
- **Admin View**: Custom dashboard at `/admin/media-submissions-dashboard` for form management

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
4. If adding admin components, run `pnpm payload generate:importmap`

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

## MCP Servers & Advanced Analysis

### Available MCP Servers

**Core Analysis & Development:**
- **Serena** - Advanced codebase analysis and semantic navigation
- **Context7** - Library documentation and framework patterns  
- **Sequential Thinking** - Complex problem solving and architectural analysis
- **Magic** - UI component generation and design systems
- **Shadcn/ui** - Pre-built React UI component library
- **Tweakcn** - Enhanced shadcn/ui components with custom themes and styling

**Research & Content:**
- **Firecrawl** - Advanced web scraping and content extraction
- **Brave Search** - Real-time web search and research
- **Filesystem** - Advanced file system operations

### When to Use Each MCP Server

**🔍 Serena MCP** - *Use for codebase exploration and intelligent editing*
- **When**: Navigating complex code, finding symbols, refactoring
- **Best for**: Understanding project structure, symbol-based editing
- **Examples**: Finding all collection exports, locating component definitions, intelligent refactoring

**📚 Context7 MCP** - *Use for official documentation and framework patterns*
- **When**: Need library docs, best practices, framework-specific patterns
- **Best for**: Next.js patterns, Payload CMS documentation, TypeScript configs
- **Examples**: Getting Next.js 15 routing patterns, Payload CMS collection schemas

**🧠 Sequential Thinking MCP** - *Use for complex analysis and problem-solving*
- **When**: Debugging complex issues, architectural decisions, systematic analysis
- **Best for**: Multi-step reasoning, root cause analysis, system design
- **Examples**: Performance bottleneck analysis, internationalization logic review

**🎨 Magic MCP** - *Use for UI component generation*
- **When**: Creating new components, design system integration
- **Best for**: React components, forms, interactive elements
- **Examples**: Government forms, accessibility-compliant components, RTL layouts

**🧩 Shadcn/ui MCP** - *Use for consistent UI components*
- **When**: Need proven UI patterns, quick component implementation
- **Best for**: Standard components (buttons, dialogs, forms, tables)
- **Examples**: Admin dashboard components, form elements, navigation

**🎯 Tweakcn MCP** - *Use for enhanced shadcn/ui components with custom themes*
- **When**: Need advanced styling, custom themes, enhanced component variants
- **Best for**: Themed components, custom styling, design system extensions
- **Examples**: Government branding, custom color schemes, enhanced form components

**🕷️ Firecrawl MCP** - *Use for advanced web content extraction*
- **When**: Need structured data from websites, research, documentation scraping
- **Best for**: Government standards research, compliance documentation
- **Examples**: Scraping accessibility guidelines, regulatory requirements

**🔍 Brave Search MCP** - *Use for general web research*
- **When**: Quick searches, finding resources, troubleshooting
- **Best for**: Real-time information, documentation discovery
- **Examples**: Latest framework updates, government web standards

**📁 Filesystem MCP** - *Use for advanced file operations*
- **When**: Bulk file operations, project structure analysis
- **Best for**: Directory analysis, multi-file reads, file management
- **Examples**: Project cleanup, batch file operations

### MCP Usage Examples for HAPA Website

**Adding New Bilingual Content Block:**
```typescript
// 1. Use Serena to understand existing block structure
mcp__serena__get_symbols_overview("src/blocks/RenderBlocks.tsx")

// 2. Use Context7 for Payload CMS patterns
mcp__context7__get-library-docs("/payloadcms/payload", "blocks")

// 3. Use Magic to generate the component
mcp__magic__21st_magic_component_builder("Government announcement block with Arabic RTL support")

// 4. Use Shadcn/ui for consistent styling
mcp__shadcn-ui__get_component("card")

// 5. Use Tweakcn for enhanced themed components
mcp__tweakcn__get_themed_component("government-announcement-card")
```

**Debugging Internationalization Issues:**
```typescript
// 1. Use Sequential for systematic analysis
mcp__sequential-thinking__sequentialthinking("Analyze RTL layout issues in Arabic locale")

// 2. Use Serena to find i18n-related code
mcp__serena__search_for_pattern("useTranslations|getTranslations", "src")

// 3. Use Context7 for next-intl documentation
mcp__context7__resolve-library-id("next-intl")
```

**Creating Government Compliance Forms:**
```typescript
// 1. Use Firecrawl to research government form standards
mcp__firecrawl__firecrawl_search("Mauritania government digital forms accessibility")

// 2. Use Magic to generate form components
mcp__magic__21st_magic_component_builder("Government complaint form with Arabic support")

// 3. Use Shadcn/ui for form elements
mcp__shadcn-ui__get_component("form")

// 4. Use Tweakcn for government-themed form styling
mcp__tweakcn__get_themed_component("government-form")
```

### Key Serena Commands
- `find_symbol` - Locate functions, classes, exports by name/path pattern
- `search_for_pattern` - Regex-based semantic search across files
- `get_symbols_overview` - Analyze file structure and exports
- `replace_symbol_body` - Edit specific symbols intelligently
- `list_dir` - Get project structure with intelligent filtering

## Testing & Quality Assurance

### Code Quality Commands
- `pnpm lint` - ESLint checks with Next.js rules
- `pnpm lint:fix` - Auto-fix linting issues
- **Configuration**: `eslint.config2.mjs` with TypeScript and accessibility rules

### Automated Browser Testing with Playwright MCP

**Pure MCP approach** using Microsoft Playwright MCP Server for AI-powered testing.

**Usage:**
```bash
/test-auto  # Custom slash command for automated testing
```

**Benefits over JS scripts:**
- Real-time AI analysis of test results with adaptive strategies
- Accessibility snapshots (LLM-optimized, no manual screenshots)  
- Self-healing tests with intelligent retry logic
- Natural language test reports with insights

### Browser Support
- **Modern Browsers**: Chrome 64+, Firefox 67+, Safari 12+, Edge 79+
- **RTL Support**: Full Arabic RTL layout with proper text direction
- **Performance**: Core Web Vitals optimized with Next.js 15 features