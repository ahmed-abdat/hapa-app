# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HAPA Website** - Official website for Haute Autorité de la Presse et de l'Audiovisuel (Mauritania's media regulatory authority)

This is a clean, production-ready government website built specifically for HAPA with bilingual support and modern web standards.

**Tech Stack:**
- Payload CMS 3.47.0+ (TypeScript-first headless CMS with localization)
- Next.js 15 with App Router and i18n routing
- Neon PostgreSQL (managed serverless database)
- Vercel Pro (hosting, CDN & deployment)
- Tailwind CSS with HAPA government branding
- Full bilingual support (French/Arabic with automatic RTL)

## Essential Commands

### Development
- `pnpm dev` - Start local development server at http://localhost:3000
- `pnpm payload` - Access Payload admin interface
- `pnpm generate:types` - Generate TypeScript types from collections
- `pnpm generate:importmap` - Generate import map for Payload admin

### Building & Deployment
- `pnpm build` - Build production application with sitemap generation
- `pnpm start` - Start production server locally
- `pnpm lint` - Run ESLint checks
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm ci` - Run database migrations and build (for CI/CD)

### Testing the Application
1. **Install dependencies**: `pnpm install`
2. **Set up environment**: Copy `.env.example` to `.env` and configure:
   ```env
   POSTGRES_URL=your_neon_database_url
   PAYLOAD_SECRET=your_secure_random_string
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   ```
3. **Run migrations**: `pnpm payload migrate` (select "+" to accept schema changes)
4. **Generate types**: `pnpm generate:types`
5. **Start development**: `pnpm dev`
6. **Access the site**: 
   - Frontend: http://localhost:3000 (redirects to /fr)
   - French: http://localhost:3000/fr
   - Arabic: http://localhost:3000/ar (automatic RTL layout)
   - Admin panel: http://localhost:3000/admin

**Status**: ✅ Working with Next.js 15 App Router and full bilingual support

## Project Structure

### Clean Architecture
```
/home/ahmed/projects/hapa/
├── src/
│   ├── app/(frontend)/[locale]/     # Localized frontend pages
│   ├── app/(payload)/               # Payload CMS admin interface
│   ├── collections/                 # Payload collections with i18n
│   ├── components/                  # React components
│   ├── utilities/                   # Helper functions & locale utils
│   └── payload.config.ts           # Main CMS configuration
├── public/                         # Static assets
├── next.config.mjs                 # Next.js config with i18n
├── package.json                    # Dependencies (cleaned)
└── vercel.json                     # Deployment configuration
```

### Payload Collections (All Localized)
- **`pages`** - Static pages (About HAPA, Legal info) - Bilingual content
- **`posts`** - News articles, press releases, decisions - Bilingual content  
- **`categories`** - Content categorization - Bilingual labels
- **`feedback`** - Contact form submissions - Localized fields
- **`media`** - File uploads (images, PDFs, documents) with optimization
- **`users`** - Admin user accounts with authentication

### Internationalization Features
- **Automatic routing**: `/fr/page` and `/ar/page`
- **RTL support**: Automatic `dir="rtl"` for Arabic content
- **Localized content**: All text fields support French/Arabic
- **Language switcher**: Available in components
- **Fallback system**: French content shown if Arabic translation missing

## Configuration Files

### Environment Variables
Key environment variables in `.env` and Vercel settings:
```env
POSTGRES_URL=postgresql://...           # Neon database connection
PAYLOAD_SECRET=...                      # Payload encryption key
BLOB_READ_WRITE_TOKEN=...              # Vercel Blob storage
NEXT_PUBLIC_SERVER_URL=https://www.hapa.mr
RESEND_API_KEY=...                     # Email notifications (optional)
```

### HAPA Brand Colors
Defined in `src/app/(frontend)/globals.css`:
- **Primary Blue**: `#065986` (Government authority) - CSS var: `--primary`
- **Secondary Gold**: `#D4A574` (Official accent) - CSS var: `--secondary`
- **Supporting Green**: `#2D5A27` (Regulatory theme) - CSS var: `--accent`

### Localization Configuration
- **Payload Config**: French (`fr`) default, Arabic (`ar`) with RTL
- **Next.js i18n**: Automatic locale detection and routing
- **URL Structure**: Root redirects to `/fr`, supports `/fr/page` and `/ar/page`
- **RTL Support**: Automatic `dir="rtl"` attribute for Arabic pages
- **Typography**: Custom Arabic fonts with proper text rendering

## Content Management

### Admin Access
- **URL**: `/admin` 
- **Login**: Admin credentials configured during setup
- **Roles**: Admin users can manage all content and settings

### Content Types (All Bilingual)
1. **Pages** - Static content (About HAPA, Legal information) in French/Arabic
2. **Posts** - News articles, press releases, decisions with localized content
3. **Categories** - Content organization with bilingual labels
4. **Feedback** - Public contact form submissions with localized fields
5. **Media** - File uploads with automatic optimization and Vercel Blob storage

### Bilingual Content Management
- **Language Tabs**: Edit content in French and Arabic side-by-side
- **RTL Preview**: Live preview of Arabic content with proper RTL layout
- **Fallback Content**: Automatic fallback to French if Arabic translation missing
- **SEO per Language**: Separate meta titles/descriptions for each language

## Development Workflow

### Quick Start
1. **Install**: `pnpm install`
2. **Environment**: Copy `.env.example` to `.env` and configure database
3. **Migrate**: `pnpm payload migrate`
4. **Develop**: `pnpm dev`
5. **Admin**: Visit http://localhost:3000/admin to create first user

### Bilingual Content Workflow
1. **Admin Login**: Access `/admin` with your credentials
2. **Select Collection**: Navigate to Pages, Posts, or Categories
3. **Create Content**: 
   - Fill French content first (default language)
   - Switch to Arabic tab to add Arabic translation
   - Use RTL preview to verify Arabic layout
4. **SEO Optimization**: Add meta titles/descriptions per language
5. **Publish**: Content appears on both `/fr/slug` and `/ar/slug`

### Development Best Practices
- Always test both languages and RTL layout
- Use the LanguageSwitcher component for navigation
- Verify automatic `dir="rtl"` switching works
- Test content fallbacks (Arabic → French)

### Deployment
- **Platform**: Vercel Pro with automatic deployments
- **Database**: Neon PostgreSQL (managed, serverless)
- **CDN**: Global edge network via Vercel
- **Domain**: www.hapa.mr with SSL certificate

## Performance & SEO

### Optimization Features
- Image optimization with WebP/AVIF formats
- Static generation for better performance
- Core Web Vitals optimization (target: all green)
- Mobile-first responsive design

### SEO Configuration
- Automatic sitemap generation
- Multilingual meta tags and Open Graph
- Structured data for government organization
- Performance target: PageSpeed score ≥ 90

## Migration Notes

### From Drupal 7
- Content export scripts in `scripts/migrate-content.ts`
- URL redirects configured in `next.config.mjs`
- Media file migration process documented
- Preserve SEO rankings with 301 redirects

### Testing Checklist
✅ **Bilingual Functionality**
- French content displays correctly at `/fr/*` URLs
- Arabic content displays correctly at `/ar/*` URLs with RTL layout
- Language switcher works between French ↔ Arabic
- Content fallback works (Arabic → French when translation missing)

✅ **Admin Interface**
- Admin panel accessible at `/admin`
- User authentication working
- Bilingual content editing (French/Arabic tabs)
- Live preview for both languages
- File upload working with Vercel Blob storage

✅ **Technical Verification**
- Mobile responsiveness on all devices
- Performance metrics and Core Web Vitals
- SEO meta tags for both languages
- Automatic sitemap generation
- Cross-browser compatibility

## Project Status

This is a **production-ready** HAPA government website with:
- ✅ Complete bilingual setup (French/Arabic + RTL)
- ✅ Clean codebase (unnecessary files removed)
- ✅ Modern tech stack (Next.js 15, Payload 3.47.0)
- ✅ Government branding and accessibility
- ✅ SEO optimization and performance focus
- ✅ Vercel deployment ready

**Ready for content migration from Drupal 7 and go-live.**