# HAPA Migration Scripts

This directory contains all scripts and utilities for migrating from Drupal 7 to Payload CMS.

## Directory Structure

```
scripts/migration/
├── README.md                    # This file
├── 01-extract-content.ts        # Database content extraction
├── 02-process-media.ts          # Media file processing and optimization
├── 03-import-to-payload.ts      # Payload CMS content import
├── 04-validate-migration.ts     # Content validation and integrity checks
├── utils/
│   ├── html-to-lexical.ts       # HTML to Lexical conversion
│   ├── database-client.ts       # Database connection utilities
│   └── payload-client.ts        # Payload CMS client utilities
└── data/
    ├── extracted/               # Extracted Drupal content (JSON)
    ├── processed/               # Processed content ready for import
    └── validation/              # Validation reports and checksums
```

## Usage

### Prerequisites
1. Install dependencies: `pnpm install mysql2 sharp`
2. Set up local database with Drupal backups
3. Configure environment variables

### Migration Process
1. **Extract**: `pnpm tsx scripts/migration/01-extract-content.ts`
2. **Process**: `pnpm tsx scripts/migration/02-process-media.ts`
3. **Import**: `pnpm tsx scripts/migration/03-import-to-payload.ts`
4. **Validate**: `pnpm tsx scripts/migration/04-validate-migration.ts`

## Environment Variables
```env
# Database connection for Drupal backup analysis
MIGRATION_DB_HOST=localhost
MIGRATION_DB_USER=root
MIGRATION_DB_PASSWORD=
MIGRATION_DB_NAME=hapa_migration

# Payload CMS configuration
PAYLOAD_SECRET=your_payload_secret
POSTGRES_URL=your_postgres_url
BLOB_READ_WRITE_TOKEN=your_blob_token
```

## Status
- [ ] Scripts created
- [ ] Database setup
- [ ] Content extraction
- [ ] Media processing
- [ ] Payload import
- [ ] Validation complete