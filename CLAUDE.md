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

