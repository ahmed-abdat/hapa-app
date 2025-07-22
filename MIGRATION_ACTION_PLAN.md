# HAPA Migration: Practical Action Plan

## What We Have Access To

### ✅ Available Resources
- **cPanel Access**: Full file manager, database access, backup tools
- **Drupal Admin**: Content management, field structure, user accounts
- **SQL Backups**: `hapamr_fr.sql`, `hapamr_new.sql` files
- **Media Archive**: `drupal_backup_2025.zip` with 2,777+ files
- **Payload Environment**: Already configured with R2 storage
- **Development Setup**: Local environment ready

### ✅ Current Capabilities
- Direct file downloads from cPanel
- Database exports via phpMyAdmin
- Content analysis through Drupal admin
- Media extraction from backup ZIP
- Local database import and analysis

---

## Step-by-Step Migration Tasks

### **PHASE 1: Data Extraction & Analysis**

#### Task 1.1: Database Analysis
```bash
# What to do:
1. Import SQL backups locally for analysis
   mysql -u root -p -e "CREATE DATABASE hapa_analysis"
   mysql -u root -p hapa_analysis < hapamr_new.sql

2. Run content analysis queries:
   SELECT type, COUNT(*) FROM fd3_node GROUP BY type;
   SELECT nid, title, type, created FROM fd3_node WHERE status=1 ORDER BY created DESC LIMIT 20;
   SELECT name, COUNT(*) FROM fd3_taxonomy_term_data GROUP BY name;

3. Check for language data:
   SELECT DISTINCT language FROM fd3_node;
   
4. Media files analysis:
   SELECT filename, filepath FROM fd3_file_managed ORDER BY timestamp DESC LIMIT 20;
```

#### Task 1.2: Content Inventory via cPanel
```bash
# File Manager access:
1. Login to cPanel → File Manager
2. Navigate to: /home/hapamr/public_html/sites/default/files/
3. Document file structure and counts
4. Download sample files for testing
5. Note file naming conventions and organization
```

#### Task 1.3: Media Extraction
```bash
# From backup ZIP:
1. Extract drupal_backup_2025.zip
2. Locate: sites/default/files/ directory
3. Organize by file type:
   - Images: .jpg, .jpeg, .png, .gif
   - Documents: .pdf, .doc, .docx
   - Other media: .mp3, .mp4, etc.
4. Create inventory spreadsheet
```

### **PHASE 2: Content Structure Mapping**

#### Task 2.1: Drupal Field Analysis
```bash
# Via Drupal Admin (what you already did):
1. Document all field types from Reports → Field list
2. Map content types:
   - Article → Posts collection
   - Content → Pages collection  
   - Categories → Categories collection
3. Note field usage patterns
4. Screenshot admin interface for reference
```

#### Task 2.2: Payload Collection Setup
```bash
# Update existing Payload collections:
1. Verify Posts collection fields match Drupal articles
2. Verify Pages collection fields match Drupal content
3. Add missing fields if needed:
   - Audio field (for field_audiofield)
   - Video field (for field_video)
   - Gallery field (for field_colorbox_imag)
4. Test collection creation in admin
```

### **PHASE 3: Data Processing Scripts**

#### Task 3.1: Content Extraction Script
```javascript
// Create: scripts/extract-content.js
const mysql = require('mysql2/promise');

async function extractContent() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'hapa_analysis'
  });
  
  // Extract articles
  const [articles] = await connection.execute(`
    SELECT n.nid, n.title, n.created, n.status,
           b.body_value, b.body_summary,
           GROUP_CONCAT(t.name) as categories
    FROM fd3_node n
    LEFT JOIN fd3_field_data_body b ON n.nid = b.entity_id
    LEFT JOIN fd3_taxonomy_index ti ON n.nid = ti.nid
    LEFT JOIN fd3_taxonomy_term_data t ON ti.tid = t.tid
    WHERE n.type = 'article' AND n.status = 1
    GROUP BY n.nid
    ORDER BY n.created DESC
  `);
  
  // Save to JSON for processing
  require('fs').writeFileSync('./extracted-articles.json', JSON.stringify(articles, null, 2));
  console.log(`Extracted ${articles.length} articles`);
}

// Run: node scripts/extract-content.js
```

#### Task 3.2: Media Processing Script
```javascript
// Create: scripts/process-media.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // for image optimization

async function processMedia() {
  const mediaDir = './extracted-media/sites/default/files';
  const outputDir = './processed-media';
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Process each file
  const files = fs.readdirSync(mediaDir, { recursive: true });
  
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
      // Optimize images
      await sharp(path.join(mediaDir, file))
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(path.join(outputDir, file));
    } else {
      // Copy other files as-is
      fs.copyFileSync(
        path.join(mediaDir, file),
        path.join(outputDir, file)
      );
    }
  }
  
  console.log(`Processed ${files.length} media files`);
}

// Run: node scripts/process-media.js
```

### **PHASE 4: Migration Execution**

#### Task 4.1: Payload Content Import
```javascript
// Create: scripts/import-to-payload.js
const payload = require('payload');

async function importContent() {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    local: true
  });
  
  // Read extracted data
  const articles = JSON.parse(fs.readFileSync('./extracted-articles.json'));
  
  // Import articles as posts
  for (const article of articles) {
    try {
      const post = await payload.create({
        collection: 'posts',
        data: {
          title: {
            fr: article.title,
            ar: '' // Will need translation if required
          },
          content: {
            fr: convertHtmlToLexical(article.body_value),
            ar: null
          },
          publishedAt: new Date(article.created * 1000).toISOString(),
          _status: 'published'
        }
      });
      
      console.log(`Created post: ${post.id}`);
    } catch (error) {
      console.error(`Failed to create post for article ${article.nid}:`, error.message);
    }
  }
}

function convertHtmlToLexical(html) {
  // Basic HTML to Lexical conversion
  // For now, just strip HTML tags
  const text = html?.replace(/<[^>]*>/g, '') || '';
  
  return {
    root: {
      children: [{
        children: [{
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text: text,
          type: "text",
          version: 1
        }],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1
      }],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1
    }
  };
}

// Run: node scripts/import-to-payload.js
```

#### Task 4.2: Media Upload to R2
```javascript
// Create: scripts/upload-media.js
const fs = require('fs');
const path = require('path');

async function uploadMedia() {
  const mediaDir = './processed-media';
  const files = fs.readdirSync(mediaDir, { recursive: true });
  
  for (const file of files) {
    if (fs.statSync(path.join(mediaDir, file)).isFile()) {
      try {
        // Upload to Payload (which will use R2)
        const media = await payload.create({
          collection: 'media',
          filePath: path.join(mediaDir, file),
          data: {
            alt: path.basename(file, path.extname(file))
          }
        });
        
        console.log(`Uploaded: ${file} → ${media.id}`);
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error.message);
      }
    }
  }
}

// Run: node scripts/upload-media.js
```

### **PHASE 5: Validation & Testing**

#### Task 5.1: Content Verification
```bash
# What to check:
1. Compare content counts:
   - Drupal articles vs Payload posts
   - Drupal content vs Payload pages
   - Categories mapping accuracy

2. Spot check content:
   - Random sample of 10 articles
   - Check title, content, publication date
   - Verify media associations

3. Test admin interface:
   - Login to /admin
   - Create/edit content
   - Test French/Arabic switching
```

#### Task 5.2: Frontend Testing
```bash
# Test website functionality:
1. Navigate to frontend URLs
2. Test language switching (fr/ar)
3. Check mobile responsiveness
4. Verify search functionality
5. Test contact forms

# Performance testing:
1. Check page load speeds
2. Test with multiple browsers
3. Verify image optimization
4. Check Core Web Vitals
```

### **PHASE 6: Go-Live Preparation**

#### Task 6.1: URL Mapping
```javascript
// Create: scripts/generate-redirects.js
async function generateRedirects() {
  const articles = JSON.parse(fs.readFileSync('./extracted-articles.json'));
  const redirects = [];
  
  for (const article of articles) {
    // Old Drupal URL: /node/1234
    // New Payload URL: /fr/article-slug
    const slug = generateSlug(article.title);
    redirects.push({
      source: `/node/${article.nid}`,
      destination: `/fr/${slug}`,
      permanent: true
    });
  }
  
  // Save redirects for Next.js config
  fs.writeFileSync('./redirects.json', JSON.stringify(redirects, null, 2));
  console.log(`Generated ${redirects.length} redirects`);
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}
```

#### Task 6.2: DNS & Domain Setup
```bash
# Domain configuration steps:
1. Update DNS records to point to new server
2. Configure SSL certificates
3. Set up CDN (if using)
4. Configure email forwarding
5. Update any external service integrations
```

---

## Practical Execution Order

### Week 1: Data Extraction
- [ ] Task 1.1: Import and analyze SQL backups
- [ ] Task 1.2: Download sample files from cPanel
- [ ] Task 1.3: Extract and organize media files
- [ ] Task 2.1: Complete Drupal field documentation

### Week 2: Content Processing
- [ ] Task 2.2: Configure Payload collections
- [ ] Task 3.1: Build content extraction script
- [ ] Task 3.2: Build media processing script
- [ ] Test scripts with sample data

### Week 3: Migration Execution
- [ ] Task 4.1: Import content to Payload
- [ ] Task 4.2: Upload media to R2 storage
- [ ] Verify data integrity
- [ ] Test admin interface

### Week 4: Testing & Validation
- [ ] Task 5.1: Content verification
- [ ] Task 5.2: Frontend testing
- [ ] Performance optimization
- [ ] Bug fixes and refinements

### Week 5: Go-Live Preparation
- [ ] Task 6.1: Generate URL redirects
- [ ] Task 6.2: DNS and domain setup
- [ ] Final testing and approval
- [ ] Launch execution

### Week 6: Post-Launch Support
- [ ] Monitor performance and errors
- [ ] Fix any discovered issues
- [ ] User training and documentation
- [ ] Optimization and fine-tuning

---

## Immediate Next Steps

### This Week (Priority Actions)
1. **Set up local MySQL** and import backup files
2. **Run database analysis queries** to understand content structure
3. **Download sample media files** from cPanel File Manager
4. **Extract and explore** the backup ZIP file
5. **Document findings** in a simple spreadsheet

### Tools You'll Need
```bash
# Install required tools:
npm install mysql2 sharp fs-extra
# Or if you prefer Python:
pip install mysql-connector-python pillow

# Database tools:
# - MySQL Workbench (GUI)
# - phpMyAdmin (if running locally)
# - Command line mysql client
```

This action plan focuses on what you can actually do with your current access levels, no teams or budgets - just practical steps to get the migration done.