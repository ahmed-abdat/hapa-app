# HAPA Website Migration: Detailed Execution Plan
## From Drupal 7 to Payload CMS

**Document Version**: 2.0  
**Created**: January 2025  
**Status**: Ready for Implementation  
**Estimated Duration**: 6 weeks  
**Budget**: €17,825  

---

## Executive Summary

This document provides a comprehensive, step-by-step execution plan for migrating the HAPA (Haute Autorité de la Presse et de l'Audiovisuel) government website from Drupal 7 to the existing Payload CMS infrastructure. The plan includes specific scripts, validation procedures, risk mitigation strategies, and government compliance requirements.

**Critical Context**: Drupal 7 reached End-of-Life in January 2025, creating immediate security vulnerabilities that require urgent migration.

---

## Current Infrastructure Analysis

### Existing Payload CMS Setup
- **Framework**: Next.js 15.3.3 with App Router
- **CMS**: Payload CMS 3.44.0 with TypeScript
- **Database**: Neon PostgreSQL via Vercel adapter
- **Storage**: Cloudflare R2 for media files
- **Hosting**: Vercel Pro with global CDN
- **Localization**: French/Arabic with RTL support

### Available Migration Resources
- **SQL Backups**: `hapamr_fr.sql` (32,638 lines), `hapamr_new.sql` (33,702 lines)
- **File Archive**: `drupal_backup_2025.zip` (431MB)
- **Server Access**: Full cPanel access to hapa.mr
- **Content Volume**: ~1,500+ nodes, 2,777+ media files

---

## Week-by-Week Implementation Timeline

## **WEEK 1: Foundation & Data Analysis**

### Day 1-2: Project Setup & Environment Preparation

#### Immediate Actions
```bash
# 1. Create migration workspace
mkdir -p /home/ahmed/projects/hapa-website/migration-workspace
cd /home/ahmed/projects/hapa-website/migration-workspace

# 2. Set up migration tools
mkdir -p {scripts,data,logs,validation,backups}
mkdir -p data/{drupal-export,payload-import,media-files}
mkdir -p scripts/{extraction,transformation,validation,import}

# 3. Install migration dependencies
pnpm add --save-dev mysql2 dotenv csv-parser sharp fs-extra
```

#### Database Analysis Script
```typescript
// scripts/extraction/analyze-drupal-db.ts
import mysql from 'mysql2/promise';
import fs from 'fs-extra';

interface DrukpalAnalysisResult {
  contentTypes: Record<string, number>;
  taxonomy: Record<string, number>;
  mediaFiles: number;
  totalNodes: number;
  dateRange: { start: string; end: string };
}

export async function analyzeDrupalDatabase(): Promise<DrukpalAnalysisResult> {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hapamr_analysis'
  });

  try {
    // Analyze content types
    const [contentTypes] = await connection.execute(`
      SELECT type, COUNT(*) as count
      FROM fd3_node 
      WHERE status = 1
      GROUP BY type
      ORDER BY count DESC
    `);

    // Analyze taxonomy terms
    const [taxonomy] = await connection.execute(`
      SELECT v.name as vocabulary, COUNT(t.tid) as count
      FROM fd3_taxonomy_term_data t
      JOIN fd3_taxonomy_vocabulary v ON t.vid = v.vid
      GROUP BY v.name
    `);

    // Count media files
    const [mediaCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM fd3_file_managed WHERE status = 1
    `);

    // Get date range
    const [dateRange] = await connection.execute(`
      SELECT 
        FROM_UNIXTIME(MIN(created)) as start_date,
        FROM_UNIXTIME(MAX(changed)) as end_date
      FROM fd3_node 
      WHERE status = 1
    `);

    const result: DrukpalAnalysisResult = {
      contentTypes: Object.fromEntries(
        (contentTypes as any[]).map(row => [row.type, row.count])
      ),
      taxonomy: Object.fromEntries(
        (taxonomy as any[]).map(row => [row.vocabulary, row.count])
      ),
      mediaFiles: (mediaCount as any[])[0].count,
      totalNodes: Object.values(
        Object.fromEntries(
          (contentTypes as any[]).map(row => [row.type, row.count])
        )
      ).reduce((a, b) => a + b, 0),
      dateRange: {
        start: (dateRange as any[])[0].start_date,
        end: (dateRange as any[])[0].end_date
      }
    };

    await fs.writeJSON('./data/drupal-analysis.json', result, { spaces: 2 });
    return result;

  } finally {
    await connection.end();
  }
}
```

### Day 3-4: Content Extraction Pipeline

#### SQL Content Extraction Script
```typescript
// scripts/extraction/extract-content.ts
import mysql from 'mysql2/promise';
import fs from 'fs-extra';

interface DrupalNode {
  nid: number;
  type: string;
  title: string;
  body: string;
  created: number;
  changed: number;
  language: string;
  status: number;
}

export async function extractDrupalContent() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'hapamr_migration'
  });

  try {
    // Extract all published content with body text
    const [nodes] = await connection.execute(`
      SELECT 
        n.nid,
        n.type,
        n.title,
        n.created,
        n.changed,
        n.language,
        n.status,
        COALESCE(fb.body_value, '') as body,
        COALESCE(fb.body_format, 'filtered_html') as body_format,
        COALESCE(fs.body_summary, '') as body_summary
      FROM fd3_node n
      LEFT JOIN fd3_field_data_body fb ON n.nid = fb.entity_id AND fb.entity_type = 'node'
      LEFT JOIN fd3_field_data_body fs ON n.nid = fs.entity_id AND fs.entity_type = 'node'
      WHERE n.status = 1
      ORDER BY n.changed DESC
    `);

    // Extract taxonomy relationships
    const [taxonomyData] = await connection.execute(`
      SELECT 
        tn.nid,
        td.name as term_name,
        tv.name as vocabulary_name,
        td.tid
      FROM fd3_taxonomy_index ti
      JOIN fd3_taxonomy_term_data td ON ti.tid = td.tid
      JOIN fd3_taxonomy_vocabulary tv ON td.vid = tv.vid
      JOIN fd3_node tn ON ti.nid = tn.nid
      WHERE tn.status = 1
    `);

    // Extract media file references
    const [mediaData] = await connection.execute(`
      SELECT 
        n.nid,
        fm.fid,
        fm.filename,
        fm.uri,
        fm.filemime,
        fm.filesize,
        fm.timestamp as file_created
      FROM fd3_node n
      JOIN fd3_field_data_field_image fi ON n.nid = fi.entity_id
      JOIN fd3_file_managed fm ON fi.field_image_fid = fm.fid
      WHERE n.status = 1 AND fm.status = 1
      UNION
      SELECT 
        n.nid,
        fm.fid,
        fm.filename,
        fm.uri,
        fm.filemime,
        fm.filesize,
        fm.timestamp as file_created
      FROM fd3_node n
      JOIN fd3_field_data_field_video fv ON n.nid = fv.entity_id
      JOIN fd3_file_managed fm ON fv.field_video_fid = fm.fid
      WHERE n.status = 1 AND fm.status = 1
    `);

    // Save extracted data
    await fs.writeJSON('./data/drupal-export/nodes.json', nodes, { spaces: 2 });
    await fs.writeJSON('./data/drupal-export/taxonomy.json', taxonomyData, { spaces: 2 });
    await fs.writeJSON('./data/drupal-export/media.json', mediaData, { spaces: 2 });

    console.log(`Extracted ${(nodes as any[]).length} content nodes`);
    console.log(`Extracted ${(taxonomyData as any[]).length} taxonomy relationships`);
    console.log(`Extracted ${(mediaData as any[]).length} media file references`);

  } finally {
    await connection.end();
  }
}
```

### Day 5-7: Content Transformation Scripts

#### HTML to Lexical Conversion
```typescript
// scripts/transformation/html-to-lexical.ts
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, createEditor } from 'lexical';
import { JSDOM } from 'jsdom';

interface LexicalEditorState {
  root: {
    children: any[];
    direction: string;
    format: string;
    indent: number;
    type: string;
    version: number;
  };
}

export function convertHtmlToLexical(htmlContent: string): LexicalEditorState {
  const dom = new JSDOM(htmlContent);
  const editor = createEditor();

  let lexicalState: LexicalEditorState;

  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(htmlContent, 'text/html');
    const nodes = $generateNodesFromDOM(editor, dom);
    
    $getRoot().select();
    $getRoot().clear();
    $getRoot().append(...nodes);
    
    lexicalState = editor.getEditorState().toJSON() as LexicalEditorState;
  });

  return lexicalState!;
}

// Process content transformation
export async function transformDrupalContent() {
  const nodes = await fs.readJSON('./data/drupal-export/nodes.json');
  const transformedContent = [];

  for (const node of nodes) {
    const lexicalContent = convertHtmlToLexical(node.body);
    
    const transformedNode = {
      id: node.nid,
      title: {
        fr: node.title,
        ar: '' // Will be translated later
      },
      content: {
        fr: lexicalContent,
        ar: null // Will be translated later
      },
      slug: {
        fr: formatSlugFromTitle(node.title),
        ar: '' // Will be generated from Arabic title
      },
      status: node.status === 1 ? 'published' : 'draft',
      publishedAt: new Date(node.created * 1000).toISOString(),
      updatedAt: new Date(node.changed * 1000).toISOString(),
      type: mapDrupalTypeToPayload(node.type),
      originalDrupalId: node.nid
    };

    transformedContent.push(transformedNode);
  }

  await fs.writeJSON('./data/payload-import/transformed-content.json', transformedContent, { spaces: 2 });
}

function formatSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function mapDrupalTypeToPayload(drupalType: string): 'posts' | 'pages' {
  const typeMapping = {
    'article': 'posts',
    'content': 'pages',
    'poll': 'posts',
    'colorbox': 'posts'
  };
  return typeMapping[drupalType] || 'posts';
}
```

### Validation Checkpoint 1
```bash
# Week 1 Validation Script
# scripts/validation/week1-validation.sh

#!/bin/bash
echo "=== WEEK 1 VALIDATION ==="

# Check data extraction
echo "1. Validating data extraction..."
if [ -f "./data/drupal-export/nodes.json" ]; then
    node_count=$(jq length ./data/drupal-export/nodes.json)
    echo "✅ Extracted $node_count content nodes"
else
    echo "❌ Content extraction failed"
    exit 1
fi

# Check transformation
echo "2. Validating content transformation..."
if [ -f "./data/payload-import/transformed-content.json" ]; then
    transformed_count=$(jq length ./data/payload-import/transformed-content.json)
    echo "✅ Transformed $transformed_count content items"
else
    echo "❌ Content transformation failed"
    exit 1
fi

# Validate Lexical format
echo "3. Validating Lexical format..."
first_item=$(jq '.[0].content.fr' ./data/payload-import/transformed-content.json)
if echo "$first_item" | jq -e '.root.children' > /dev/null; then
    echo "✅ Lexical format is valid"
else
    echo "❌ Lexical format validation failed"
    exit 1
fi

echo "✅ Week 1 validation completed successfully"
```

---

## **WEEK 2: Content Processing & Media Migration**

### Day 8-10: Media File Processing

#### Media Extraction and Optimization
```typescript
// scripts/transformation/process-media.ts
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

interface MediaFile {
  fid: number;
  filename: string;
  uri: string;
  filemime: string;
  filesize: number;
  file_created: number;
}

export class MediaProcessor {
  private r2Client: S3Client;

  constructor() {
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async processAllMedia() {
    const mediaData = await fs.readJSON('./data/drupal-export/media.json');
    const processedMedia = [];

    for (const media of mediaData) {
      try {
        const processedFile = await this.processMediaFile(media);
        processedMedia.push(processedFile);
        console.log(`✅ Processed: ${media.filename}`);
      } catch (error) {
        console.error(`❌ Failed to process: ${media.filename}`, error);
      }
    }

    await fs.writeJSON('./data/payload-import/processed-media.json', processedMedia, { spaces: 2 });
  }

  private async processMediaFile(media: MediaFile) {
    const originalPath = this.convertDrupalUriToPath(media.uri);
    const filename = this.generateUniqueFilename(media.filename);
    
    // Read original file
    const originalBuffer = await fs.readFile(originalPath);
    
    // Process image files
    if (media.filemime.startsWith('image/')) {
      const optimizedBuffer = await this.optimizeImage(originalBuffer, media.filemime);
      
      // Upload to R2
      const r2Key = `media/${filename}`;
      await this.uploadToR2(optimizedBuffer, r2Key, media.filemime);
      
      return {
        originalFid: media.fid,
        filename: filename,
        alt: '', // Will be populated from Drupal alt text if available
        mimeType: media.filemime,
        filesize: optimizedBuffer.length,
        width: await this.getImageWidth(optimizedBuffer),
        height: await this.getImageHeight(optimizedBuffer),
        r2Key: r2Key,
        url: `${process.env.R2_PUBLIC_URL}/${r2Key}`,
        createdAt: new Date(media.file_created * 1000).toISOString(),
      };
    } else {
      // Handle non-image files
      const r2Key = `media/${filename}`;
      await this.uploadToR2(originalBuffer, r2Key, media.filemime);
      
      return {
        originalFid: media.fid,
        filename: filename,
        mimeType: media.filemime,
        filesize: originalBuffer.length,
        r2Key: r2Key,
        url: `${process.env.R2_PUBLIC_URL}/${r2Key}`,
        createdAt: new Date(media.file_created * 1000).toISOString(),
      };
    }
  }

  private async optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    const image = sharp(buffer);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Optimize based on size and format
    if (metadata.width && metadata.width > 2048) {
      image.resize(2048, null, { withoutEnlargement: true });
    }
    
    // Convert to WebP for better compression (except for SVGs)
    if (mimeType !== 'image/svg+xml') {
      return await image
        .webp({ quality: 85, effort: 6 })
        .toBuffer();
    }
    
    return buffer;
  }

  private async uploadToR2(buffer: Buffer, key: string, mimeType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await this.r2Client.send(command);
  }

  private convertDrupalUriToPath(uri: string): string {
    // Convert Drupal URI format (public://filename) to actual file path
    return uri.replace('public://', './hapa_backup/sites/default/files/');
  }

  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    return `${name}-${timestamp}${ext}`;
  }

  private async getImageWidth(buffer: Buffer): Promise<number> {
    const metadata = await sharp(buffer).metadata();
    return metadata.width || 0;
  }

  private async getImageHeight(buffer: Buffer): Promise<number> {
    const metadata = await sharp(buffer).metadata();
    return metadata.height || 0;
  }
}
```

### Day 11-12: Category and Taxonomy Migration

#### Taxonomy Transformation Script
```typescript
// scripts/transformation/process-taxonomy.ts
import fs from 'fs-extra';

interface DrupalTaxonomy {
  nid: number;
  term_name: string;
  vocabulary_name: string;
  tid: number;
}

export async function processTaxonomy() {
  const taxonomyData = await fs.readJSON('./data/drupal-export/taxonomy.json');
  const categories = new Map<string, any>();

  // Group by vocabulary and create categories
  for (const tax of taxonomyData) {
    const categoryId = `cat-${tax.tid}`;
    
    if (!categories.has(categoryId)) {
      categories.set(categoryId, {
        id: categoryId,
        title: {
          fr: tax.term_name,
          ar: '' // Will be translated
        },
        slug: {
          fr: formatSlugFromTitle(tax.term_name),
          ar: ''
        },
        description: {
          fr: '',
          ar: ''
        },
        parent: null, // Handle hierarchical categories if needed
        originalTid: tax.tid,
        vocabulary: tax.vocabulary_name,
        contentIds: []
      });
    }

    // Add content reference
    const category = categories.get(categoryId);
    if (!category.contentIds.includes(tax.nid)) {
      category.contentIds.push(tax.nid);
    }
  }

  const categoriesArray = Array.from(categories.values());
  await fs.writeJSON('./data/payload-import/categories.json', categoriesArray, { spaces: 2 });
  
  console.log(`Processed ${categoriesArray.length} categories`);
}

function formatSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
```

### Day 13-14: Content Relationship Mapping

#### Relationship Processor
```typescript
// scripts/transformation/process-relationships.ts
import fs from 'fs-extra';

export async function processContentRelationships() {
  const content = await fs.readJSON('./data/payload-import/transformed-content.json');
  const categories = await fs.readJSON('./data/payload-import/categories.json');
  const media = await fs.readJSON('./data/payload-import/processed-media.json');
  const taxonomy = await fs.readJSON('./data/drupal-export/taxonomy.json');

  // Create lookup maps
  const categoryMap = new Map(categories.map(cat => [cat.originalTid, cat.id]));
  const mediaMap = new Map(media.map(m => [m.originalFid, m]));

  // Process each content item
  for (const item of content) {
    // Add category relationships
    const itemTaxonomy = taxonomy.filter(tax => tax.nid === item.originalDrupalId);
    item.categories = itemTaxonomy.map(tax => categoryMap.get(tax.tid)).filter(Boolean);

    // Add featured image if available
    const itemMedia = media.find(m => 
      m.originalFid && content.some(c => c.originalDrupalId === item.originalDrupalId)
    );
    
    if (itemMedia) {
      item.featuredImage = {
        id: itemMedia.id || `media-${itemMedia.originalFid}`,
        filename: itemMedia.filename,
        mimeType: itemMedia.mimeType,
        filesize: itemMedia.filesize,
        width: itemMedia.width,
        height: itemMedia.height,
        alt: itemMedia.alt || '',
        url: itemMedia.url
      };
    }

    // Set default hero type based on content type
    item.hero = {
      type: item.type === 'posts' ? 'lowImpact' : 'mediumImpact',
      richText: item.content.fr,
      media: item.featuredImage || null
    };
  }

  await fs.writeJSON('./data/payload-import/final-content.json', content, { spaces: 2 });
  console.log(`Processed relationships for ${content.length} content items`);
}
```

### Validation Checkpoint 2
```bash
# scripts/validation/week2-validation.sh

#!/bin/bash
echo "=== WEEK 2 VALIDATION ==="

# Check media processing
echo "1. Validating media processing..."
if [ -f "./data/payload-import/processed-media.json" ]; then
    media_count=$(jq length ./data/payload-import/processed-media.json)
    echo "✅ Processed $media_count media files"
    
    # Check R2 upload success
    successful_uploads=$(jq '[.[] | select(.r2Key != null)] | length' ./data/payload-import/processed-media.json)
    echo "✅ Successfully uploaded $successful_uploads files to R2"
else
    echo "❌ Media processing failed"
    exit 1
fi

# Check category processing
echo "2. Validating category processing..."
if [ -f "./data/payload-import/categories.json" ]; then
    category_count=$(jq length ./data/payload-import/categories.json)
    echo "✅ Processed $category_count categories"
else
    echo "❌ Category processing failed"
    exit 1
fi

# Check relationship processing
echo "3. Validating relationship processing..."
if [ -f "./data/payload-import/final-content.json" ]; then
    relationship_count=$(jq '[.[] | select(.categories | length > 0)] | length' ./data/payload-import/final-content.json)
    echo "✅ $relationship_count content items have category relationships"
else
    echo "❌ Relationship processing failed"
    exit 1
fi

echo "✅ Week 2 validation completed successfully"
```

---

## **WEEK 3: Payload CMS Import & Translation**

### Day 15-17: Payload Import Scripts

#### Payload CMS Import Handler
```typescript
// scripts/import/import-to-payload.ts
import payload from 'payload';
import fs from 'fs-extra';
import path from 'path';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export class PayloadImporter {
  async initializePayload() {
    await payload.init({
      secret: process.env.PAYLOAD_SECRET!,
      config: path.resolve(__dirname, '../../src/payload.config.ts'),
    });
  }

  async importContent(): Promise<ImportResult> {
    const content = await fs.readJSON('./data/payload-import/final-content.json');
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const item of content) {
      try {
        const collection = item.type === 'posts' ? 'posts' : 'pages';
        
        const payloadData = {
          title: item.title,
          slug: item.slug,
          content: item.content,
          publishedAt: item.publishedAt,
          _status: item.status,
          hero: item.hero,
          categories: item.categories || [],
          featuredImage: item.featuredImage?.id || null,
          meta: {
            title: item.title,
            description: this.extractDescription(item.content.fr),
            image: item.featuredImage?.id || null
          }
        };

        const created = await payload.create({
          collection,
          data: payloadData,
          locale: 'fr' // Start with French content
        });

        result.imported++;
        console.log(`✅ Imported ${collection}: ${item.title.fr}`);

      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import ${item.title.fr}: ${error.message}`);
        console.error(`❌ Failed to import: ${item.title.fr}`, error);
      }
    }

    await fs.writeJSON('./logs/import-results.json', result, { spaces: 2 });
    return result;
  }

  async importCategories(): Promise<ImportResult> {
    const categories = await fs.readJSON('./data/payload-import/categories.json');
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const category of categories) {
      try {
        const created = await payload.create({
          collection: 'categories',
          data: {
            title: category.title,
            slug: category.slug,
            description: category.description
          },
          locale: 'fr'
        });

        result.imported++;
        console.log(`✅ Imported category: ${category.title.fr}`);

      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import category ${category.title.fr}: ${error.message}`);
        console.error(`❌ Failed to import category: ${category.title.fr}`, error);
      }
    }

    return result;
  }

  async importMedia(): Promise<ImportResult> {
    const mediaFiles = await fs.readJSON('./data/payload-import/processed-media.json');
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const media of mediaFiles) {
      try {
        const created = await payload.create({
          collection: 'media',
          data: {
            filename: media.filename,
            mimeType: media.mimeType,
            filesize: media.filesize,
            width: media.width,
            height: media.height,
            alt: media.alt || '',
            url: media.url,
            // Additional fields for R2 storage
            cloudflareR2: {
              key: media.r2Key,
              bucket: process.env.R2_BUCKET_NAME
            }
          }
        });

        result.imported++;
        console.log(`✅ Imported media: ${media.filename}`);

      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import media ${media.filename}: ${error.message}`);
        console.error(`❌ Failed to import media: ${media.filename}`, error);
      }
    }

    return result;
  }

  private extractDescription(lexicalContent: any): string {
    try {
      const textNodes = this.extractTextFromLexical(lexicalContent);
      return textNodes.slice(0, 160) + (textNodes.length > 160 ? '...' : '');
    } catch {
      return '';
    }
  }

  private extractTextFromLexical(lexicalState: any): string {
    if (!lexicalState?.root?.children) return '';
    
    let text = '';
    const extractFromNode = (node: any) => {
      if (node.type === 'text') {
        text += node.text;
      } else if (node.children) {
        node.children.forEach(extractFromNode);
      }
    };

    lexicalState.root.children.forEach(extractFromNode);
    return text.trim();
  }
}
```

### Day 18-19: Translation Integration

#### AI Translation Service
```typescript
// scripts/translation/ai-translator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs-extra';

export class AITranslator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async translateContent() {
    const content = await fs.readJSON('./data/payload-import/final-content.json');
    const translatedContent = [];

    for (const item of content) {
      try {
        // Translate title
        const arabicTitle = await this.translateText(item.title.fr, 'Arabic');
        
        // Translate Lexical content
        const frenchText = this.extractTextFromLexical(item.content.fr);
        const arabicText = await this.translateText(frenchText, 'Arabic');
        const arabicLexical = this.textToLexical(arabicText);

        // Generate Arabic slug
        const arabicSlug = await this.generateArabicSlug(arabicTitle);

        const translatedItem = {
          ...item,
          title: {
            fr: item.title.fr,
            ar: arabicTitle
          },
          content: {
            fr: item.content.fr,
            ar: arabicLexical
          },
          slug: {
            fr: item.slug.fr,
            ar: arabicSlug
          }
        };

        translatedContent.push(translatedItem);
        console.log(`✅ Translated: ${item.title.fr} → ${arabicTitle}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Translation failed for: ${item.title.fr}`, error);
        translatedContent.push(item); // Keep original if translation fails
      }
    }

    await fs.writeJSON('./data/payload-import/translated-content.json', translatedContent, { spaces: 2 });
  }

  private async translateText(text: string, targetLanguage: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Translate the following French text to ${targetLanguage}. 
    This is content for a government media regulatory authority website.
    Maintain formal, professional tone appropriate for official government communications.
    
    Text to translate: "${text}"
    
    Return only the translation, no additional text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  private async generateArabicSlug(arabicTitle: string): Promise<string> {
    // For Arabic content, we'll use transliteration to Latin characters for URL-safe slugs
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Convert this Arabic title to a URL-safe slug using Latin characters.
    Rules:
    - Use transliteration (Arabic sounds to Latin alphabet)
    - Use lowercase only
    - Use hyphens instead of spaces
    - Remove special characters
    - Keep it under 60 characters
    
    Arabic title: "${arabicTitle}"
    
    Return only the slug, no additional text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim().toLowerCase();
  }

  private extractTextFromLexical(lexicalState: any): string {
    if (!lexicalState?.root?.children) return '';
    
    let text = '';
    const extractFromNode = (node: any) => {
      if (node.type === 'text') {
        text += node.text;
      } else if (node.children) {
        node.children.forEach(extractFromNode);
      }
    };

    lexicalState.root.children.forEach(extractFromNode);
    return text.trim();
  }

  private textToLexical(text: string): any {
    return {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: text,
                type: 'text',
                version: 1
              }
            ],
            direction: 'rtl',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1
          }
        ],
        direction: 'rtl',
        format: '',
        indent: 0,
        type: 'root',
        version: 1
      }
    };
  }
}
```

### Day 20-21: Translation Update

#### Update Payload with Translations
```typescript
// scripts/import/update-translations.ts
import payload from 'payload';
import fs from 'fs-extra';

export async function updatePayloadTranslations() {
  const translatedContent = await fs.readJSON('./data/payload-import/translated-content.json');
  
  for (const item of translatedContent) {
    try {
      const collection = item.type === 'posts' ? 'posts' : 'pages';
      
      // Find the existing document
      const existing = await payload.find({
        collection,
        where: {
          'title.fr': {
            equals: item.title.fr
          }
        },
        locale: 'fr'
      });

      if (existing.docs.length > 0) {
        const docId = existing.docs[0].id;

        // Update with Arabic content
        await payload.update({
          collection,
          id: docId,
          data: {
            title: item.title.ar,
            slug: item.slug.ar,
            content: item.content.ar,
            meta: {
              title: item.title.ar,
              description: this.extractDescription(item.content.ar)
            }
          },
          locale: 'ar'
        });

        console.log(`✅ Updated Arabic translation for: ${item.title.fr}`);
      }

    } catch (error) {
      console.error(`❌ Failed to update translation for: ${item.title.fr}`, error);
    }
  }
}
```

### Validation Checkpoint 3
```bash
# scripts/validation/week3-validation.sh

#!/bin/bash
echo "=== WEEK 3 VALIDATION ==="

# Check Payload import
echo "1. Validating Payload import..."
import_results=$(cat ./logs/import-results.json)
imported_count=$(echo "$import_results" | jq '.imported')
failed_count=$(echo "$import_results" | jq '.failed')

echo "✅ Imported $imported_count items"
if [ "$failed_count" -gt 0 ]; then
    echo "⚠️  $failed_count items failed to import"
else
    echo "✅ All items imported successfully"
fi

# Check translation
echo "2. Validating translations..."
if [ -f "./data/payload-import/translated-content.json" ]; then
    translated_count=$(jq '[.[] | select(.title.ar != "")] | length' ./data/payload-import/translated-content.json)
    total_count=$(jq length ./data/payload-import/translated-content.json)
    echo "✅ Translated $translated_count of $total_count items"
else
    echo "❌ Translation validation failed"
    exit 1
fi

# Check bilingual content in Payload
echo "3. Testing Payload CMS access..."
curl -s http://localhost:3000/api/posts?locale=fr > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ French content accessible"
else
    echo "❌ French content access failed"
    exit 1
fi

curl -s http://localhost:3000/api/posts?locale=ar > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Arabic content accessible"
else
    echo "❌ Arabic content access failed"
    exit 1
fi

echo "✅ Week 3 validation completed successfully"
```

---

## **WEEK 4: Quality Assurance & Performance**

### Day 22-24: Content Validation

#### Comprehensive Content Validation
```typescript
// scripts/validation/content-validator.ts
import payload from 'payload';
import fs from 'fs-extra';

interface ValidationReport {
  totalItems: number;
  frenchContent: {
    complete: number;
    incomplete: number;
    issues: string[];
  };
  arabicContent: {
    complete: number;
    incomplete: number;
    issues: string[];
  };
  media: {
    accessible: number;
    broken: number;
    issues: string[];
  };
  links: {
    internal: number;
    external: number;
    broken: number;
    issues: string[];
  };
}

export class ContentValidator {
  async validateAllContent(): Promise<ValidationReport> {
    const report: ValidationReport = {
      totalItems: 0,
      frenchContent: { complete: 0, incomplete: 0, issues: [] },
      arabicContent: { complete: 0, incomplete: 0, issues: [] },
      media: { accessible: 0, broken: 0, issues: [] },
      links: { internal: 0, external: 0, broken: 0, issues: [] }
    };

    // Validate Posts
    await this.validateCollection('posts', report);
    
    // Validate Pages
    await this.validateCollection('pages', report);

    // Validate Media
    await this.validateMedia(report);

    await fs.writeJSON('./logs/validation-report.json', report, { spaces: 2 });
    return report;
  }

  private async validateCollection(collection: 'posts' | 'pages', report: ValidationReport) {
    // Get French content
    const frenchContent = await payload.find({
      collection,
      locale: 'fr',
      limit: 1000
    });

    for (const item of frenchContent.docs) {
      report.totalItems++;

      // Validate French content
      if (this.isContentComplete(item)) {
        report.frenchContent.complete++;
      } else {
        report.frenchContent.incomplete++;
        report.frenchContent.issues.push(`Incomplete French content: ${item.title || item.id}`);
      }

      // Get Arabic version
      try {
        const arabicVersion = await payload.findByID({
          collection,
          id: item.id,
          locale: 'ar'
        });

        if (this.isContentComplete(arabicVersion)) {
          report.arabicContent.complete++;
        } else {
          report.arabicContent.incomplete++;
          report.arabicContent.issues.push(`Incomplete Arabic content: ${arabicVersion.title || item.id}`);
        }
      } catch (error) {
        report.arabicContent.incomplete++;
        report.arabicContent.issues.push(`Missing Arabic content: ${item.title || item.id}`);
      }

      // Validate links in content
      if (item.content) {
        await this.validateLinksInContent(item.content, report);
      }
    }
  }

  private isContentComplete(item: any): boolean {
    return !!(item.title && item.slug && item.content);
  }

  private async validateLinksInContent(content: any, report: ValidationReport) {
    const links = this.extractLinksFromLexical(content);
    
    for (const link of links) {
      if (link.startsWith('http')) {
        report.links.external++;
        // Check if external link is accessible
        try {
          const response = await fetch(link, { method: 'HEAD', timeout: 5000 });
          if (!response.ok) {
            report.links.broken++;
            report.links.issues.push(`Broken external link: ${link}`);
          }
        } catch {
          report.links.broken++;
          report.links.issues.push(`Unreachable external link: ${link}`);
        }
      } else {
        report.links.internal++;
        // Validate internal links (basic check)
        if (!link.match(/^\/[a-z]{2}\/[\w-]+$/)) {
          report.links.issues.push(`Invalid internal link format: ${link}`);
        }
      }
    }
  }

  private async validateMedia(report: ValidationReport) {
    const media = await payload.find({
      collection: 'media',
      limit: 1000
    });

    for (const item of media.docs) {
      try {
        // Check if media is accessible
        const response = await fetch(item.url, { method: 'HEAD', timeout: 5000 });
        if (response.ok) {
          report.media.accessible++;
        } else {
          report.media.broken++;
          report.media.issues.push(`Inaccessible media: ${item.filename} (${item.url})`);
        }
      } catch {
        report.media.broken++;
        report.media.issues.push(`Unreachable media: ${item.filename} (${item.url})`);
      }
    }
  }

  private extractLinksFromLexical(lexicalContent: any): string[] {
    const links: string[] = [];
    
    const extractFromNode = (node: any) => {
      if (node.type === 'link') {
        links.push(node.url);
      } else if (node.children) {
        node.children.forEach(extractFromNode);
      }
    };

    if (lexicalContent?.root?.children) {
      lexicalContent.root.children.forEach(extractFromNode);
    }

    return links;
  }
}
```

### Day 25-26: Performance Optimization

#### Performance Testing and Optimization
```typescript
// scripts/validation/performance-tester.ts
import { execSync } from 'child_process';
import fs from 'fs-extra';

interface PerformanceMetrics {
  pageLoadTimes: Record<string, number>;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  apiResponseTimes: Record<string, number>;
  bundleSize: {
    javascript: number;
    css: number;
    total: number;
  };
}

export class PerformanceTester {
  async runPerformanceTests(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      pageLoadTimes: {},
      coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      apiResponseTimes: {},
      bundleSize: { javascript: 0, css: 0, total: 0 }
    };

    // Test key pages
    const testPages = [
      '/fr',
      '/ar',
      '/fr/about',
      '/ar/about',
      '/fr/posts',
      '/ar/posts'
    ];

    for (const page of testPages) {
      metrics.pageLoadTimes[page] = await this.measurePageLoad(page);
    }

    // Test API endpoints
    const apiEndpoints = [
      '/api/posts',
      '/api/pages',
      '/api/categories',
      '/api/media'
    ];

    for (const endpoint of apiEndpoints) {
      metrics.apiResponseTimes[endpoint] = await this.measureApiResponse(endpoint);
    }

    // Measure bundle size
    metrics.bundleSize = await this.measureBundleSize();

    // Core Web Vitals (using Lighthouse)
    metrics.coreWebVitals = await this.measureCoreWebVitals();

    await fs.writeJSON('./logs/performance-metrics.json', metrics, { spaces: 2 });
    return metrics;
  }

  private async measurePageLoad(path: string): Promise<number> {
    const start = Date.now();
    try {
      const response = await fetch(`http://localhost:3000${path}`);
      await response.text();
      return Date.now() - start;
    } catch {
      return -1; // Error
    }
  }

  private async measureApiResponse(endpoint: string): Promise<number> {
    const start = Date.now();
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      await response.json();
      return Date.now() - start;
    } catch {
      return -1; // Error
    }
  }

  private async measureBundleSize(): Promise<{ javascript: number; css: number; total: number }> {
    try {
      // Build the application
      execSync('pnpm build', { cwd: process.cwd() });
      
      // Analyze bundle
      const buildStats = execSync('du -sb .next', { cwd: process.cwd(), encoding: 'utf8' });
      const totalSize = parseInt(buildStats.split('\t')[0]);

      const jsStats = execSync('find .next -name "*.js" -type f -exec du -c {} + | tail -1', { 
        cwd: process.cwd(), 
        encoding: 'utf8' 
      });
      const jsSize = parseInt(jsStats.split('\t')[0]);

      const cssStats = execSync('find .next -name "*.css" -type f -exec du -c {} + | tail -1', { 
        cwd: process.cwd(), 
        encoding: 'utf8' 
      });
      const cssSize = parseInt(cssStats.split('\t')[0]);

      return {
        javascript: jsSize,
        css: cssSize,
        total: totalSize
      };
    } catch {
      return { javascript: 0, css: 0, total: 0 };
    }
  }

  private async measureCoreWebVitals(): Promise<{ lcp: number; fid: number; cls: number }> {
    try {
      // Using Lighthouse CLI for Core Web Vitals
      const lighthouseResult = execSync(
        'npx lighthouse http://localhost:3000/fr --only-categories=performance --output=json --quiet',
        { encoding: 'utf8' }
      );

      const report = JSON.parse(lighthouseResult);
      const audits = report.audits;

      return {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0
      };
    } catch {
      return { lcp: 0, fid: 0, cls: 0 };
    }
  }
}
```

### Day 27-28: Security and Compliance Audit

#### Security Audit Script
```typescript
// scripts/validation/security-auditor.ts
import { execSync } from 'child_process';
import fs from 'fs-extra';

interface SecurityReport {
  vulnerabilities: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  dependencies: {
    outdated: string[];
    vulnerable: string[];
  };
  configurationIssues: string[];
  accessControlTests: {
    passed: number;
    failed: number;
    issues: string[];
  };
  dataProtection: {
    compliant: boolean;
    issues: string[];
  };
}

export class SecurityAuditor {
  async runSecurityAudit(): Promise<SecurityReport> {
    const report: SecurityReport = {
      vulnerabilities: { high: 0, medium: 0, low: 0, total: 0 },
      dependencies: { outdated: [], vulnerable: [] },
      configurationIssues: [],
      accessControlTests: { passed: 0, failed: 0, issues: [] },
      dataProtection: { compliant: true, issues: [] }
    };

    // Run dependency audit
    await this.auditDependencies(report);

    // Test access controls
    await this.testAccessControls(report);

    // Check configuration security
    await this.checkConfiguration(report);

    // Validate data protection compliance
    await this.validateDataProtection(report);

    await fs.writeJSON('./logs/security-report.json', report, { spaces: 2 });
    return report;
  }

  private async auditDependencies(report: SecurityReport) {
    try {
      // Run npm audit
      const auditResult = execSync('pnpm audit --json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });

      const audit = JSON.parse(auditResult);
      report.vulnerabilities = {
        high: audit.metadata?.vulnerabilities?.high || 0,
        medium: audit.metadata?.vulnerabilities?.medium || 0,
        low: audit.metadata?.vulnerabilities?.low || 0,
        total: audit.metadata?.vulnerabilities?.total || 0
      };

      // Check for outdated packages
      const outdatedResult = execSync('pnpm outdated --json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      const outdated = JSON.parse(outdatedResult);
      report.dependencies.outdated = Object.keys(outdated);

    } catch (error) {
      report.configurationIssues.push('Failed to run dependency audit');
    }
  }

  private async testAccessControls(report: SecurityReport) {
    const tests = [
      {
        name: 'Admin panel requires authentication',
        test: async () => {
          const response = await fetch('http://localhost:3000/admin');
          return response.status === 401 || response.url.includes('login');
        }
      },
      {
        name: 'API endpoints respect authentication',
        test: async () => {
          const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test' })
          });
          return response.status === 401;
        }
      },
      {
        name: 'Draft content not accessible without auth',
        test: async () => {
          const response = await fetch('http://localhost:3000/api/posts?where[_status][equals]=draft');
          const data = await response.json();
          return data.docs.length === 0;
        }
      }
    ];

    for (const test of tests) {
      try {
        const passed = await test.test();
        if (passed) {
          report.accessControlTests.passed++;
        } else {
          report.accessControlTests.failed++;
          report.accessControlTests.issues.push(`Failed: ${test.name}`);
        }
      } catch (error) {
        report.accessControlTests.failed++;
        report.accessControlTests.issues.push(`Error testing ${test.name}: ${error.message}`);
      }
    }
  }

  private async checkConfiguration(report: SecurityReport) {
    const configChecks = [
      {
        check: 'PAYLOAD_SECRET is set and strong',
        test: () => {
          const secret = process.env.PAYLOAD_SECRET;
          return secret && secret.length >= 32;
        }
      },
      {
        check: 'Database connection uses SSL',
        test: () => {
          const dbUrl = process.env.POSTGRES_URL;
          return dbUrl && dbUrl.includes('sslmode=require');
        }
      },
      {
        check: 'R2 credentials are properly configured',
        test: () => {
          return !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
        }
      }
    ];

    for (const check of configChecks) {
      if (!check.test()) {
        report.configurationIssues.push(check.check);
      }
    }
  }

  private async validateDataProtection(report: SecurityReport) {
    // Check for GDPR compliance indicators
    const gdprChecks = [
      'Privacy policy endpoint exists',
      'Cookie consent mechanism',
      'Data deletion capabilities',
      'User consent tracking'
    ];

    // This is a basic check - in real implementation, 
    // you'd have more sophisticated GDPR compliance validation
    for (const check of gdprChecks) {
      // Placeholder for actual checks
      report.dataProtection.issues.push(`Need to implement: ${check}`);
    }

    if (report.dataProtection.issues.length > 0) {
      report.dataProtection.compliant = false;
    }
  }
}
```

### Validation Checkpoint 4
```bash
# scripts/validation/week4-validation.sh

#!/bin/bash
echo "=== WEEK 4 VALIDATION ==="

# Check content validation
echo "1. Running content validation..."
if [ -f "./logs/validation-report.json" ]; then
    french_complete=$(jq '.frenchContent.complete' ./logs/validation-report.json)
    arabic_complete=$(jq '.arabicContent.complete' ./logs/validation-report.json)
    total_items=$(jq '.totalItems' ./logs/validation-report.json)
    
    echo "✅ French content: $french_complete/$total_items complete"
    echo "✅ Arabic content: $arabic_complete/$total_items complete"
    
    broken_media=$(jq '.media.broken' ./logs/validation-report.json)
    if [ "$broken_media" -eq 0 ]; then
        echo "✅ All media files accessible"
    else
        echo "⚠️  $broken_media broken media files"
    fi
else
    echo "❌ Content validation not completed"
    exit 1
fi

# Check performance
echo "2. Checking performance metrics..."
if [ -f "./logs/performance-metrics.json" ]; then
    avg_load_time=$(jq '[.pageLoadTimes[]] | add / length' ./logs/performance-metrics.json)
    echo "✅ Average page load time: ${avg_load_time}ms"
    
    if (( $(echo "$avg_load_time < 2000" | bc -l) )); then
        echo "✅ Performance target met (< 2000ms)"
    else
        echo "⚠️  Performance needs optimization"
    fi
else
    echo "❌ Performance testing not completed"
    exit 1
fi

# Check security
echo "3. Checking security audit..."
if [ -f "./logs/security-report.json" ]; then
    high_vulns=$(jq '.vulnerabilities.high' ./logs/security-report.json)
    access_tests_passed=$(jq '.accessControlTests.passed' ./logs/security-report.json)
    
    if [ "$high_vulns" -eq 0 ]; then
        echo "✅ No high-severity vulnerabilities"
    else
        echo "❌ $high_vulns high-severity vulnerabilities found"
        exit 1
    fi
    
    echo "✅ $access_tests_passed access control tests passed"
else
    echo "❌ Security audit not completed"
    exit 1
fi

echo "✅ Week 4 validation completed successfully"
```

---

## **WEEK 5: Testing & Final Preparations**

### Day 29-31: Comprehensive Testing

#### Automated Testing Suite
```typescript
// scripts/testing/comprehensive-tests.ts
import { test, expect } from '@playwright/test';

export class ComprehensiveTestSuite {
  async runBilingualTests() {
    // Test French content
    await test('French homepage loads correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/fr');
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
      await expect(page.locator('h1')).toBeVisible();
    });

    // Test Arabic content and RTL
    await test('Arabic homepage loads with RTL', async ({ page }) => {
      await page.goto('http://localhost:3000/ar');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(page.locator('h1')).toBeVisible();
    });

    // Test language switching
    await test('Language switcher works', async ({ page }) => {
      await page.goto('http://localhost:3000/fr');
      await page.click('[data-testid="language-switcher"]');
      await page.click('a[href*="/ar/"]');
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    });

    // Test content accessibility
    await test('Content meets accessibility standards', async ({ page }) => {
      await page.goto('http://localhost:3000/fr');
      
      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        await expect(img).toHaveAttribute('alt');
      }
      
      // Check heading hierarchy
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // Check for skip links
      await expect(page.locator('a[href="#main-content"]')).toBeVisible();
    });
  }

  async runPerformanceTests() {
    await test('Pages load within performance budget', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/fr');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // 3 second budget
    });

    await test('Images are optimized', async ({ page }) => {
      await page.goto('http://localhost:3000/fr');
      
      const images = await page.locator('img').all();
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src) {
          // Check for WebP format
          expect(src).toMatch(/\.(webp|avif|jpg|png)$/);
          
          // Check for responsive images
          const srcset = await img.getAttribute('srcset');
          if (srcset) {
            expect(srcset).toContain('w,'); // Width descriptors
          }
        }
      }
    });
  }

  async runFunctionalTests() {
    // Test navigation
    await test('Navigation works in both languages', async ({ page }) => {
      await page.goto('http://localhost:3000/fr');
      
      // Test main navigation
      await page.click('nav a[href*="/posts"]');
      await expect(page).toHaveURL(/\/fr\/posts/);
      
      // Switch to Arabic
      await page.goto('http://localhost:3000/ar');
      await page.click('nav a[href*="/posts"]');
      await expect(page).toHaveURL(/\/ar\/posts/);
    });

    // Test search functionality
    await test('Search works in both languages', async ({ page }) => {
      await page.goto('http://localhost:3000/fr/search');
      await page.fill('input[name="search"]', 'HAPA');
      await page.press('input[name="search"]', 'Enter');
      await expect(page.locator('.search-results')).toBeVisible();
    });

    // Test contact form
    await test('Contact form submits correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/fr/contact');
      
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('textarea[name="message"]', 'Test message');
      
      await page.click('button[type="submit"]');
      await expect(page.locator('.success-message')).toBeVisible();
    });
  }

  async runAdminTests() {
    // Test admin authentication
    await test('Admin login works', async ({ page }) => {
      await page.goto('http://localhost:3000/admin');
      
      await page.fill('input[name="email"]', process.env.ADMIN_EMAIL!);
      await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/\/admin$/);
      await expect(page.locator('.dashboard')).toBeVisible();
    });

    // Test content creation
    await test('Can create bilingual content', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/collections/posts');
      await page.click('a[href*="/create"]');
      
      // Create French content
      await page.fill('input[name="title"]', 'Test Article');
      await page.fill('textarea[name="content"]', 'Test content in French');
      
      // Switch to Arabic tab
      await page.click('[data-testid="locale-tab-ar"]');
      await page.fill('input[name="title"]', 'مقال تجريبي');
      await page.fill('textarea[name="content"]', 'محتوى تجريبي باللغة العربية');
      
      await page.click('button[type="submit"]');
      await expect(page.locator('.success-notification')).toBeVisible();
    });
  }
}
```

### Day 32-33: URL Mapping and Redirects

#### URL Redirect Configuration
```typescript
// scripts/migration/setup-redirects.ts
import fs from 'fs-extra';

interface RedirectMapping {
  source: string;
  destination: string;
  permanent: boolean;
}

export async function setupRedirectMappings() {
  const content = await fs.readJSON('./data/payload-import/final-content.json');
  const redirects: RedirectMapping[] = [];

  // Create redirect mappings from old Drupal URLs to new Payload URLs
  for (const item of content) {
    const drupalId = item.originalDrupalId;
    
    // Old Drupal URL patterns
    const oldUrls = [
      `/node/${drupalId}`,
      `/fr/node/${drupalId}`,
      `/content/${drupalId}`,
      `/article/${drupalId}`
    ];

    // New Payload URL
    const newUrl = item.type === 'posts' 
      ? `/fr/posts/${item.slug.fr}`
      : `/fr/${item.slug.fr}`;

    // Arabic equivalent
    const newUrlAr = item.type === 'posts'
      ? `/ar/posts/${item.slug.ar}`
      : `/ar/${item.slug.ar}`;

    // Create redirects
    for (const oldUrl of oldUrls) {
      redirects.push({
        source: oldUrl,
        destination: newUrl,
        permanent: true
      });
    }
  }

  // Add common redirects
  redirects.push(
    { source: '/', destination: '/fr', permanent: false },
    { source: '/home', destination: '/fr', permanent: true },
    { source: '/index.php', destination: '/fr', permanent: true },
    { source: '/fr/home', destination: '/fr', permanent: true },
    { source: '/ar/home', destination: '/ar', permanent: true }
  );

  // Generate Next.js redirects config
  const nextjsRedirects = redirects.map(redirect => ({
    source: redirect.source,
    destination: redirect.destination,
    permanent: redirect.permanent
  }));

  await fs.writeJSON('./migration-workspace/redirects-config.json', nextjsRedirects, { spaces: 2 });

  // Generate .htaccess for immediate deployment
  const htaccess = redirects.map(redirect => 
    `Redirect ${redirect.permanent ? '301' : '302'} ${redirect.source} ${redirect.destination}`
  ).join('\n');

  await fs.writeFile('./migration-workspace/.htaccess', htaccess);

  console.log(`Generated ${redirects.length} redirect mappings`);
}
```

### Day 34-35: Final Testing and Documentation

#### Pre-Launch Checklist Generator
```typescript
// scripts/validation/pre-launch-checklist.ts
import fs from 'fs-extra';

interface ChecklistItem {
  category: string;
  task: string;
  completed: boolean;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

export async function generatePreLaunchChecklist(): Promise<ChecklistItem[]> {
  const checklist: ChecklistItem[] = [
    // Content Validation
    {
      category: 'Content',
      task: 'All French content migrated and validated',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Content',
      task: 'All Arabic translations completed and reviewed',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Content',
      task: 'All media files accessible and optimized',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Content',
      task: 'Category relationships properly mapped',
      completed: false,
      priority: 'medium'
    },

    // Technical Validation
    {
      category: 'Technical',
      task: 'Performance benchmarks met (< 2s page load)',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Technical',
      task: 'Core Web Vitals scores acceptable',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Technical',
      task: 'All API endpoints responding correctly',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Technical',
      task: 'Database connections stable',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Technical',
      task: 'R2 storage functioning properly',
      completed: false,
      priority: 'high'
    },

    // Security & Compliance
    {
      category: 'Security',
      task: 'No high-severity vulnerabilities',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Security',
      task: 'Access controls tested and working',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Security',
      task: 'SSL certificates properly configured',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Security',
      task: 'Government compliance requirements met',
      completed: false,
      priority: 'high'
    },

    // User Experience
    {
      category: 'UX',
      task: 'Bilingual navigation tested',
      completed: false,
      priority: 'high'
    },
    {
      category: 'UX',
      task: 'RTL layout working correctly for Arabic',
      completed: false,
      priority: 'high'
    },
    {
      category: 'UX',
      task: 'Language switching functional',
      completed: false,
      priority: 'high'
    },
    {
      category: 'UX',
      task: 'Mobile responsiveness verified',
      completed: false,
      priority: 'medium'
    },
    {
      category: 'UX',
      task: 'Accessibility standards compliance (WCAG 2.1 AA)',
      completed: false,
      priority: 'high'
    },

    // SEO & Redirects
    {
      category: 'SEO',
      task: 'All redirect mappings configured',
      completed: false,
      priority: 'high'
    },
    {
      category: 'SEO',
      task: 'Sitemap generated for both languages',
      completed: false,
      priority: 'medium'
    },
    {
      category: 'SEO',
      task: 'Meta tags and Open Graph data validated',
      completed: false,
      priority: 'medium'
    },
    {
      category: 'SEO',
      task: 'Canonical URLs properly set',
      completed: false,
      priority: 'medium'
    },

    // Admin & Training
    {
      category: 'Admin',
      task: 'Admin accounts created and tested',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Admin',
      task: 'Content editing workflows tested',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Admin',
      task: 'User training materials prepared',
      completed: false,
      priority: 'medium'
    },
    {
      category: 'Admin',
      task: 'Backup and recovery procedures documented',
      completed: false,
      priority: 'high'
    },

    // Deployment
    {
      category: 'Deployment',
      task: 'Production environment configured',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Deployment',
      task: 'DNS configuration ready',
      completed: false,
      priority: 'high'
    },
    {
      category: 'Deployment',
      task: 'Monitoring and alerting configured',
      completed: false,
      priority: 'medium'
    },
    {
      category: 'Deployment',
      task: 'Rollback plan documented and tested',
      completed: false,
      priority: 'high'
    }
  ];

  await fs.writeJSON('./logs/pre-launch-checklist.json', checklist, { spaces: 2 });
  return checklist;
}
```

### Validation Checkpoint 5
```bash
# scripts/validation/week5-validation.sh

#!/bin/bash
echo "=== WEEK 5 VALIDATION ==="

# Run comprehensive tests
echo "1. Running comprehensive test suite..."
pnpm test:e2e
if [ $? -eq 0 ]; then
    echo "✅ All end-to-end tests passed"
else
    echo "❌ Some tests failed"
    exit 1
fi

# Check redirect configuration
echo "2. Validating redirect configuration..."
if [ -f "./migration-workspace/redirects-config.json" ]; then
    redirect_count=$(jq length ./migration-workspace/redirects-config.json)
    echo "✅ Configured $redirect_count redirects"
else
    echo "❌ Redirect configuration missing"
    exit 1
fi

# Validate pre-launch checklist
echo "3. Checking pre-launch checklist..."
if [ -f "./logs/pre-launch-checklist.json" ]; then
    total_items=$(jq length ./logs/pre-launch-checklist.json)
    high_priority=$(jq '[.[] | select(.priority == "high")] | length' ./logs/pre-launch-checklist.json)
    echo "✅ Pre-launch checklist generated: $total_items items ($high_priority high priority)"
else
    echo "❌ Pre-launch checklist not generated"
    exit 1
fi

# Final system health check
echo "4. Running final system health check..."
curl -f http://localhost:3000/fr > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ French site accessible"
else
    echo "❌ French site not accessible"
    exit 1
fi

curl -f http://localhost:3000/ar > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Arabic site accessible"
else
    echo "❌ Arabic site not accessible"
    exit 1
fi

curl -f http://localhost:3000/admin > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Admin panel accessible"
else
    echo "❌ Admin panel not accessible"
    exit 1
fi

echo "✅ Week 5 validation completed successfully - READY FOR LAUNCH"
```

---

## **WEEK 6: Launch & Transition**

### Day 36-38: Production Deployment

#### Production Deployment Script
```bash
#!/bin/bash
# scripts/deployment/deploy-production.sh

echo "=== HAPA WEBSITE PRODUCTION DEPLOYMENT ==="

# Pre-deployment checks
echo "1. Running pre-deployment checks..."
if ! [ -f "./logs/pre-launch-checklist.json" ]; then
    echo "❌ Pre-launch checklist not completed"
    exit 1
fi

# Backup current production
echo "2. Backing up current production..."
mkdir -p ./backups/pre-migration-$(date +%Y%m%d)
pg_dump $POSTGRES_URL > ./backups/pre-migration-$(date +%Y%m%d)/database.sql
echo "✅ Database backup completed"

# Deploy to Vercel
echo "3. Deploying to Vercel..."
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

vercel --prod
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi
echo "✅ Application deployed successfully"

# Update DNS (manual step)
echo "4. DNS Update Required:"
echo "   → Point hapa.mr A record to Vercel IP"
echo "   → Update CNAME for www.hapa.mr"
echo "   → Verify SSL certificate provisioning"

# Configure redirects
echo "5. Setting up redirects..."
cp ./migration-workspace/.htaccess ./public/.htaccess
echo "✅ Redirects configured"

# Run post-deployment tests
echo "6. Running post-deployment validation..."
sleep 30 # Wait for DNS propagation
curl -f https://www.hapa.mr/fr > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Production site accessible"
else
    echo "⚠️  Site not yet accessible (DNS propagation may be pending)"
fi

echo "✅ Production deployment completed"
```

### Day 39-40: User Training and Documentation

#### Admin Training Script Generator
```typescript
// scripts/training/generate-training-materials.ts
import fs from 'fs-extra';

export async function generateTrainingMaterials() {
  const adminGuide = `
# HAPA Website Admin Training Guide

## Getting Started

### Accessing the Admin Panel
1. Go to: https://www.hapa.mr/admin
2. Enter your credentials
3. Click "Sign In"

### Dashboard Overview
- **Recent Activity**: Latest content changes
- **Content Statistics**: Number of posts, pages, media
- **Quick Actions**: Create new content, manage users

## Content Management

### Creating a New Article (Post)
1. Go to **Collections** → **Posts**
2. Click **Create New**
3. Fill in the French content first:
   - Title (required)
   - Content using the rich text editor
   - Select categories
   - Upload featured image if needed
4. Click the **Arabic** tab
5. Add Arabic translation:
   - Title in Arabic
   - Content in Arabic (right-to-left text)
6. Click **Save** or **Publish**

### Creating a New Page
1. Go to **Collections** → **Pages**
2. Click **Create New**
3. Same bilingual process as articles
4. Choose appropriate hero layout
5. Add content blocks as needed

### Managing Media
1. Go to **Collections** → **Media**
2. Click **Upload** to add new files
3. Fill in alt text for accessibility
4. Organize with folders if needed

### Categories Management
1. Go to **Collections** → Categories**
2. Create categories in both languages
3. Use clear, descriptive names
4. Organize hierarchically if needed

## Best Practices

### Content Creation
- Always create French content first
- Use clear, professional language
- Add alt text to all images
- Check content in preview before publishing
- Use categories consistently

### Translation Guidelines
- Maintain the same meaning across languages
- Use formal tone appropriate for government communications
- Ensure Arabic content flows naturally (RTL)
- Review translated content for accuracy

### SEO Optimization
- Write descriptive titles (50-60 characters)
- Add meta descriptions (150-160 characters)
- Use relevant keywords naturally
- Include alt text for images

## Troubleshooting

### Common Issues
- **Content not appearing**: Check publication status
- **Images not loading**: Verify file upload completed
- **Translation missing**: Ensure Arabic content is saved
- **Layout issues**: Preview in both languages

### Getting Help
- Check this guide first
- Contact technical support: [support email]
- Emergency contact: [emergency contact]

## Security Guidelines

### Password Management
- Use strong, unique passwords
- Enable two-factor authentication
- Don't share login credentials
- Log out when finished

### Content Guidelines
- Only publish approved content
- Follow government content standards
- Verify facts and sources
- Maintain professional tone

## Backup and Recovery

### Regular Backups
- Content is automatically backed up daily
- Media files are stored securely in cloud storage
- Contact technical team for restore requests

### Version Control
- Previous versions of content are saved
- Use "Revisions" to restore earlier versions
- Compare changes between versions
`;

  await fs.writeFile('./docs/ADMIN_TRAINING_GUIDE.md', adminGuide);

  // Generate quick reference cards
  const quickReference = `
# HAPA Admin Quick Reference

## Content Status
- **Draft**: Not visible to public
- **Published**: Live on website
- **Scheduled**: Will publish at specified time

## Keyboard Shortcuts
- **Ctrl+S**: Save draft
- **Ctrl+Enter**: Publish
- **Ctrl+P**: Preview
- **Tab**: Switch between language tabs

## Content Formatting
- **Bold**: **text**
- **Italic**: *text*
- **Link**: Select text, click link button
- **List**: Use bullet or number buttons
- **Quote**: Use quote button for citations

## Image Guidelines
- **Max size**: 5MB per image
- **Formats**: JPG, PNG, WebP recommended
- **Alt text**: Required for accessibility
- **Optimization**: Images auto-optimized for web

## Emergency Contacts
- **Technical Support**: [phone/email]
- **Content Manager**: [phone/email]
- **System Administrator**: [phone/email]
`;

  await fs.writeFile('./docs/ADMIN_QUICK_REFERENCE.md', quickReference);

  console.log('✅ Training materials generated');
}
```

### Day 41-42: Final Testing and Go-Live

#### Go-Live Checklist Executor
```bash
#!/bin/bash
# scripts/deployment/go-live-checklist.sh

echo "=== HAPA WEBSITE GO-LIVE CHECKLIST ==="

# Function to check and update checklist
check_item() {
    local item="$1"
    local test_command="$2"
    
    echo -n "Checking: $item... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo "✅ PASSED"
        return 0
    else
        echo "❌ FAILED"
        return 1
    fi
}

# Content checks
echo "=== CONTENT VALIDATION ==="
check_item "French homepage loads" "curl -f https://www.hapa.mr/fr"
check_item "Arabic homepage loads with RTL" "curl -f https://www.hapa.mr/ar"
check_item "Posts archive accessible" "curl -f https://www.hapa.mr/fr/posts"
check_item "Admin panel accessible" "curl -f https://www.hapa.mr/admin"

# Technical checks
echo "=== TECHNICAL VALIDATION ==="
check_item "SSL certificate valid" "curl -I https://www.hapa.mr | grep '200 OK'"
check_item "API endpoints responding" "curl -f https://www.hapa.mr/api/posts"
check_item "Media files accessible" "curl -I https://www.hapa.mr/media/logo_hapa1.png"
check_item "Sitemap accessible" "curl -f https://www.hapa.mr/sitemap.xml"

# Performance checks
echo "=== PERFORMANCE VALIDATION ==="
start_time=$(date +%s%N)
curl -f https://www.hapa.mr/fr > /dev/null 2>&1
end_time=$(date +%s%N)
load_time=$(( (end_time - start_time) / 1000000 ))

if [ $load_time -lt 3000 ]; then
    echo "✅ Page load time acceptable: ${load_time}ms"
else
    echo "⚠️  Page load time slow: ${load_time}ms"
fi

# SEO checks
echo "=== SEO VALIDATION ==="
check_item "French pages have lang attribute" "curl -s https://www.hapa.mr/fr | grep 'lang=\"fr\"'"
check_item "Arabic pages have RTL direction" "curl -s https://www.hapa.mr/ar | grep 'dir=\"rtl\"'"
check_item "Meta tags present" "curl -s https://www.hapa.mr/fr | grep '<meta'"
check_item "Open Graph tags present" "curl -s https://www.hapa.mr/fr | grep 'og:'"

# Security checks
echo "=== SECURITY VALIDATION ==="
check_item "HTTPS redirect working" "curl -I http://www.hapa.mr | grep '301'"
check_item "Security headers present" "curl -I https://www.hapa.mr | grep 'X-Frame-Options'"
check_item "Admin requires authentication" "curl -I https://www.hapa.mr/admin | grep -E '401|302'"

# Government compliance
echo "=== COMPLIANCE VALIDATION ==="
check_item "Accessibility: Alt tags present" "curl -s https://www.hapa.mr/fr | grep 'alt='"
check_item "Privacy policy accessible" "curl -f https://www.hapa.mr/fr/privacy"
check_item "Contact information available" "curl -f https://www.hapa.mr/fr/contact"

echo ""
echo "=== GO-LIVE SUMMARY ==="
echo "✅ Technical infrastructure operational"
echo "✅ Content migrated and accessible"
echo "✅ Bilingual functionality working"
echo "✅ Security measures in place"
echo "✅ Performance targets met"
echo ""
echo "🚀 HAPA WEBSITE IS LIVE! 🚀"
echo ""
echo "Next steps:"
echo "1. Monitor traffic and performance"
echo "2. Begin content team training"
echo "3. Set up regular backup schedule"
echo "4. Plan user feedback collection"

# Log the successful launch
echo "$(date): HAPA website migration completed successfully" >> ./logs/migration-log.txt
```

---

## Risk Mitigation Strategies

### Critical Risk: Data Loss
**Prevention:**
- Multiple backup points before each major step
- Checksum validation of all migrated content
- Parallel validation environment

**Response Plan:**
```bash
# Emergency rollback script
#!/bin/bash
# scripts/emergency/rollback.sh

echo "=== EMERGENCY ROLLBACK PROCEDURE ==="

# 1. Restore database from backup
echo "Restoring database from backup..."
pg_restore -d $POSTGRES_URL ./backups/pre-migration-$(date +%Y%m%d)/database.sql

# 2. Revert DNS changes
echo "Manual action required: Revert DNS to original Drupal server"

# 3. Activate maintenance page
echo "Activating maintenance page..."
cp ./emergency/maintenance.html ./public/index.html

# 4. Notify stakeholders
echo "ROLLBACK INITIATED - Notify all stakeholders immediately"
```

### Critical Risk: Performance Issues
**Prevention:**
- Performance testing at every major milestone
- CDN configuration with Cloudflare R2
- Image optimization pipeline

**Response Plan:**
- Emergency performance optimization checklist
- Scalability adjustments on Vercel
- Cache invalidation procedures

### Critical Risk: Security Vulnerabilities
**Prevention:**
- Regular security audits
- Dependency vulnerability scanning
- Access control testing

**Response Plan:**
- Security incident response checklist
- Emergency patch deployment procedure
- Communication plan for security issues

---

## Government Compliance Requirements

### WCAG 2.1 AA Accessibility
**Requirements:**
- Alt text for all images
- Proper heading hierarchy (H1-H6)
- Keyboard navigation support
- Color contrast ratios ≥ 4.5:1
- Screen reader compatibility

**Validation:**
```bash
# Accessibility testing script
npx @axe-core/cli https://www.hapa.mr/fr
npx @axe-core/cli https://www.hapa.mr/ar
```

### Data Protection (GDPR Compliance)
**Requirements:**
- Privacy policy clearly displayed
- Cookie consent mechanism
- Data processing transparency
- User rights information

### Government Security Standards
**Requirements:**
- SSL/TLS encryption (minimum TLS 1.2)
- Regular security updates
- Access logging and monitoring
- Incident response procedures

---

## Success Criteria & Performance Benchmarks

### Technical Metrics
- **Page Load Time**: < 2 seconds (target), < 3 seconds (maximum)
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Uptime**: 99.9% availability
- **Security**: Zero high-severity vulnerabilities

### Content Migration Metrics
- **Data Integrity**: 100% content preservation
- **Translation Quality**: 95% accuracy rate
- **Media Optimization**: 50% file size reduction
- **URL Preservation**: 100% redirect coverage

### User Experience Metrics
- **Admin Training**: 95% user satisfaction
- **Content Publishing**: Same or faster workflow
- **Error Rate**: < 1% content publishing errors
- **Mobile Performance**: Equal to desktop performance

---

## Post-Migration Support Plan

### Week 7-8: Immediate Support
- **24/7 monitoring** with automated alerts
- **Rapid response team** (< 2 hour response time)
- **Daily performance reports**
- **User support hotline**

### Month 2-3: Stabilization
- **Weekly health checks**
- **Performance optimization**
- **User feedback integration**
- **Feature enhancement planning**

### Long-term: Maintenance
- **Monthly security updates**
- **Quarterly performance reviews**
- **Annual technology assessment**
- **Continuous improvement planning**

---

## Emergency Contacts & Escalation

### Technical Team
- **Lead Engineer**: Available 24/7 for critical issues
- **DevOps Engineer**: Infrastructure and deployment issues
- **Security Specialist**: Security incidents and vulnerabilities

### Government Stakeholders
- **HAPA Director**: Executive approval and communications
- **IT Manager**: Technical coordination
- **Content Manager**: Content validation and approval

### External Support
- **Vercel Support**: Infrastructure and hosting issues
- **Neon Support**: Database performance and connectivity
- **Cloudflare Support**: CDN and R2 storage issues

---

This comprehensive migration plan provides a detailed, executable roadmap for migrating the HAPA website from Drupal 7 to Payload CMS. Each week includes specific deliverables, validation checkpoints, and contingency plans to ensure a successful migration that meets government standards and preserves all critical functionality.

The plan balances speed (6-week timeline) with thoroughness (comprehensive testing and validation) while providing specific code examples and scripts that can be immediately implemented for the HAPA project structure.