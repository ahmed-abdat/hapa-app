# CLAUDE.md

**HAPA Website** - Mauritania government media regulatory authority website.

## Tech Stack
- Next.js 15.3.3 + Payload CMS 3.44.0
- Bilingual: French/Arabic ONLY (NO English)
- Database: Neon PostgreSQL
- Storage: Cloudflare R2

## Critical Commands
```bash
pnpm dev                          # Start dev server
pnpm generate:types              # REQUIRED after schema changes
pnpm payload generate:importmap  # REQUIRED after admin components
pnpm lint                        # Code quality check
```

## Key Rules
- **i18n**: Import `Link` from `@/i18n/navigation` (NOT `next/link`)
- **Payload CMS**: Run `pnpm generate:types` after ANY schema changes
- **Blocks**: Register in `src/blocks/RenderBlocks.tsx`
- **Languages**: French (fr) required first, Arabic (ar) optional with RTL support

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