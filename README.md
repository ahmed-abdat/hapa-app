# HAPA Official Website

**Haute Autorité de la Presse et de l'Audiovisuel** - Official website for Mauritania's media regulatory authority

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hapa&project-name=hapa-website&env=POSTGRES_URL,PAYLOAD_SECRET,BLOB_READ_WRITE_TOKEN&build-command=pnpm%20run%20ci)

## 🏛️ Project Overview

Modern, bilingual government website built for HAPA with:
- ✅ **Bilingual Support**: French/Arabic with RTL layout
- ✅ **Modern CMS**: Payload CMS 3.47.0+ with live preview
- ✅ **High Performance**: Next.js 15 with App Router
- ✅ **Production Ready**: Deployed on Vercel Pro with Neon PostgreSQL

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- Vercel account for deployment

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd hapa
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your database URL and secrets
   ```

3. **Database Setup**
   ```bash
   pnpm payload migrate
   pnpm generate:types
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

5. **Access the Application**
   - **Frontend**: http://localhost:3000 (redirects to /fr)
   - **French**: http://localhost:3000/fr  
   - **Arabic**: http://localhost:3000/ar (RTL layout)
   - **Admin Panel**: http://localhost:3000/admin

## 📖 Documentation

Complete project documentation is available in the [`/docs`](./docs) folder:

- **[📋 PRD.md](./docs/PRD.md)** - Complete Product Requirements Document
- **[🛠️ CLAUDE.md](./CLAUDE.md)** - Development guide and commands
- **[🌍 MULTILINGUAL_IMPLEMENTATION.md](./docs/MULTILINGUAL_IMPLEMENTATION.md)** - Bilingual features documentation

## 🌍 Bilingual Features

### Languages Supported
- **French** (fr) - Default language
- **Arabic** (ar) - With automatic RTL layout

### URL Structure
- Root → `/fr` (automatic redirect)
- French pages: `/fr/page-slug`
- Arabic pages: `/ar/page-slug`

### Content Management
- Side-by-side editing in admin interface
- Content fallback (Arabic → French when missing)
- Separate SEO meta tags per language
- Automatic sitemap generation for both languages

## 🎨 HAPA Brand Colors

```css
/* Government Brand Palette */
--primary: #065986;    /* HAPA Blue - Authority */
--secondary: #D4A574;  /* Gold - Official accent */
--accent: #2D5A27;     /* Green - Regulatory theme */
```

## 🛠️ Tech Stack

- **CMS**: Payload CMS 3.47.0+ (TypeScript-first)
- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL (Neon managed)
- **Styling**: Tailwind CSS with custom HAPA theme
- **Hosting**: Vercel Pro with global CDN
- **Storage**: Vercel Blob for media files

## 📊 Performance Targets

- **PageSpeed Score**: ≥ 90
- **Core Web Vitals**: All "Good" metrics
- **Load Time**: < 2 seconds on 3G
- **Accessibility**: WCAG 2.1 AA compliant

## 📝 Content Collections

### Available Content Types
- **Pages** - Static content (About HAPA, Legal information)
- **Posts** - News articles, press releases, decisions
- **Categories** - Content organization with bilingual labels
- **Feedback** - Public contact form submissions
- **Media** - Images, documents, videos with optimization

### Content Workflow
1. Create French content (required for slug generation)
2. Add Arabic translation
3. Preview in both languages
4. Publish to both `/fr/slug` and `/ar/slug`

## 🚀 Deployment

### Environment Variables
```env
POSTGRES_URL=postgresql://...
PAYLOAD_SECRET=your-secure-secret
BLOB_READ_WRITE_TOKEN=vercel-blob-token
NEXT_PUBLIC_SERVER_URL=https://www.hapa.mr
```

### Production Commands
```bash
pnpm build        # Build for production
pnpm start        # Start production server
pnpm ci           # Run migrations and build (CI/CD)
```

## 🧪 Testing

### Development Testing
```bash
pnpm lint         # ESLint checks
pnpm lint:fix     # Fix linting issues
pnpm generate:types # Generate TypeScript types
```

### Manual Testing Checklist
- [ ] French content displays at `/fr/*` URLs
- [ ] Arabic content displays at `/ar/*` URLs with RTL
- [ ] Language switcher works correctly
- [ ] Admin panel accessible at `/admin`
- [ ] Mobile responsiveness verified
- [ ] Performance metrics meet targets

## 📞 Support & Contribution

### Getting Help
- Check [documentation](./docs) first
- Review [CLAUDE.md](./CLAUDE.md) for commands
- Verify [testing checklist](./docs/MULTILINGUAL_IMPLEMENTATION.md)

### Development Workflow
1. Create feature branch from `main`
2. Test bilingual functionality
3. Verify performance targets
4. Submit pull request with documentation updates

## 📈 Project Status

- ✅ **Core Development**: Complete
- ✅ **Bilingual Implementation**: Complete
- ✅ **Testing & QA**: Complete
- ✅ **Production Deployment**: Ready
- 🔄 **Content Migration**: In Progress

## 🏆 Key Achievements

- Modern government website with international standards
- Complete bilingual implementation with RTL support
- High-performance architecture (PageSpeed ≥ 90)
- User-friendly content management system
- Production-ready deployment on Vercel Pro

---

**Built for HAPA** - Haute Autorité de la Presse et de l'Audiovisuel, Mauritania  
**Status**: Production Ready ✅  
**Last Updated**: July 15, 2025