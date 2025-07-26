# HAPA Website Testing Guide

Comprehensive testing suite for the HAPA website using Playwright for end-to-end testing, API validation, and web crawling.

## 🎯 Overview

The HAPA website testing suite provides:

- **Category Integration Testing**: Validates all new category functionality
- **Website Crawling**: Discovers and tests all pages automatically
- **API Testing**: Validates GraphQL, REST APIs, and form submissions
- **Accessibility & Performance**: Core Web Vitals and WCAG compliance
- **Security Testing**: Basic security headers and vulnerability checks
- **Cross-browser & Mobile**: Multi-browser and responsive testing

## 🚀 Quick Start

### Installation

```bash
# Install Playwright browsers (one-time setup)
pnpm test:install

# Install additional dependencies if needed
pnpm install
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with UI mode (interactive)
pnpm test:ui

# Run in headed mode (see browser)
pnpm test:headed

# Debug specific test
pnpm test:debug

# Run specific test suites
pnpm test:category    # Category integration tests
pnpm test:crawl       # Website crawling tests
pnpm test:api         # API and forms tests

# View test reports
pnpm test:report
```

## 📁 Test Structure

```
e2e/
├── category-integration.spec.ts    # Task A, B, C validation
├── website-crawler.spec.ts         # Site discovery & crawling
├── api-testing.spec.ts             # API endpoints & forms
└── [future tests]

playwright.config.ts                # Main configuration
playwright-report/                  # HTML reports
test-results/                       # Test artifacts
```

## 🔧 Configuration

### Environment Variables

```bash
# Base URL for testing
PLAYWRIGHT_BASE_URL=http://localhost:3000

# For CI/CD environments
CI=true                             # Enables CI-specific settings
```

### Playwright Config Features

- **Multi-browser**: Chrome, Firefox, Safari, Mobile
- **Auto-retry**: 2 retries on CI
- **Screenshots**: Captured on failure
- **Video**: Recorded on failure
- **Reports**: HTML, JSON, JUnit formats
- **Web Server**: Auto-starts dev server

## 🎪 Test Suites

### 1. Category Integration Tests (`test:category`)

Tests the comprehensive category system implementation:

#### Task A: Core Category Routes

- ✅ `/[locale]/posts/category/[slug]` routes
- ✅ Pagination: `/[locale]/posts/category/[slug]/page/[pageNumber]`
- ✅ Bilingual support (French/Arabic + RTL)
- ✅ 404 handling for invalid categories
- ✅ SEO metadata generation

#### Task B: Posts Page Filtering

- ✅ Category filter UI component
- ✅ URL parameter filtering: `/posts?category=slug`
- ✅ Filter persistence during pagination
- ✅ Clear/reset filter functionality

#### Task C: Government Publication Routes

- ✅ `/[locale]/publications/[category]` routes
- ✅ `/[locale]/news` routes
- ✅ Empty states for missing categories
- ✅ Publication-specific pagination

### 2. Website Crawler Tests (`test:crawl`)

Comprehensive site discovery and validation:

#### Site Discovery

- 🔍 **Auto-discovery**: Finds all internal links
- 🌐 **Multi-locale**: Tests French and Arabic routes
- 📊 **Performance**: Measures load times and sizes
- 🔗 **Link validation**: Identifies broken links

#### Performance Testing

- ⚡ **Core Web Vitals**: FCP, LCP, loading metrics
- 📱 **Mobile testing**: Responsive design validation
- 🌐 **Network conditions**: Slow 3G simulation
- 🚀 **Concurrent requests**: Multi-page load testing

#### SEO & Accessibility

- 🔍 **Meta tags**: Title, description, hreflang validation
- ♿ **Accessibility**: Basic WCAG compliance checks
- 🗺️ **Sitemaps**: XML sitemap validation
- 🤖 **Robots.txt**: Search engine directives

### 3. API & Forms Testing (`test:api`)

Backend and integration validation:

#### Payload CMS APIs

- 🎮 **GraphQL**: Schema and query validation
- 📊 **REST endpoints**: Media, admin routes
- 🗺️ **Sitemaps**: Dynamic sitemap generation
- 🔐 **Admin interface**: Login and access validation

#### Custom Forms

- 📝 **Contact forms**: Submission validation
- 🔍 **Form validation**: Required field checking
- 🚀 **API endpoints**: Direct form submission testing
- ✅ **Response handling**: Success/error scenarios

#### Security & Internationalization

- 🔒 **Security headers**: CSP, X-Frame-Options
- 🛡️ **Vulnerability testing**: Basic XSS/injection checks
- 🌐 **CORS validation**: Cross-origin policy checks
- 🗣️ **Locale switching**: Language navigation

## 📊 Monitoring & Reporting

### Test Reports

Tests generate comprehensive reports in multiple formats:

- **HTML Report**: Interactive report with screenshots and videos
- **JSON Report**: Machine-readable test results
- **JUnit XML**: CI/CD integration format

```bash
# View interactive HTML report
pnpm test:report
```

### Performance Metrics

The crawler collects and reports:

- **Load times**: Page load performance
- **Bundle sizes**: Resource optimization
- **Core Web Vitals**: User experience metrics
- **Broken links**: Site integrity issues

### Coverage Analysis

- **Route coverage**: All discovered URLs tested
- **Feature coverage**: Category integration validated
- **Browser coverage**: Multi-browser compatibility
- **Accessibility coverage**: WCAG compliance checked

## 🏗️ CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm test:install

      - name: Run E2E tests
        run: pnpm test
        env:
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Environment-Specific Testing

```bash
# Local development
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm test

# Staging environment
PLAYWRIGHT_BASE_URL=https://staging.hapa.mr pnpm test

# Production smoke tests
PLAYWRIGHT_BASE_URL=https://hapa.mr pnpm test:category
```

## 🎯 Category Integration Validation

### Pre-Implementation Checklist

Before running category tests, ensure:

- [ ] Payload admin categories created:

  - [ ] `decisions` → "Décisions et communiqués" / "قرارات و بيانات"
  - [ ] `reports` → "Rapports" / "تقارير"
  - [ ] `laws` → "Lois et règlements" / "قوانين و تشريعات"
  - [ ] `publications` → "Publications et éditions" / "إصدرات ومنشورات"
  - [ ] `news` → "Actualités" / "الأخبار"

- [ ] Posts assigned to categories in admin
- [ ] Development server running: `pnpm dev`

### Expected Test Results

#### Task A Routes

```
✅ /fr/posts/category/news
✅ /ar/posts/category/news
✅ /fr/posts/category/decisions
✅ /ar/posts/category/decisions
✅ Pagination: /fr/posts/category/news/page/2
```

#### Task B Filtering

```
✅ /fr/posts?category=news
✅ /ar/posts?category=decisions
✅ Filter UI components visible
✅ Pagination preserves filters
```

#### Task C Publications

```
✅ /fr/publications/decisions
✅ /ar/publications/decisions
✅ /fr/publications/reports
✅ /fr/news
✅ /ar/news
```

## 🔧 Troubleshooting

### Common Issues

#### Tests Failing with 404s

```bash
# Check categories exist in Payload admin
# Visit: http://localhost:3000/admin -> Categories

# Verify posts are assigned to categories
# Visit: http://localhost:3000/admin -> Posts -> Edit -> Categories field
```

#### Performance Test Failures

```bash
# Increase timeout for slow environments
# Edit playwright.config.ts:
# timeout: 120 * 1000  // 2 minutes
```

#### Browser Installation Issues

```bash
# Reinstall browsers
pnpm test:install --force

# Install specific browser
npx playwright install chromium
```

### Debug Mode

```bash
# Debug specific test
pnpm test:debug e2e/category-integration.spec.ts

# Run single test with UI
pnpm test:ui --grep "should load category pages"

# Headed mode for visual debugging
pnpm test:headed --grep "category"
```

### Test Data Setup

For consistent testing, use the seed data:

```bash
# Seed development database
curl -X POST http://localhost:3000/next/seed

# Or visit in browser:
# http://localhost:3000/next/seed
```

## 📈 Best Practices

### Writing Tests

1. **Descriptive names**: Clear test descriptions
2. **Isolated tests**: Each test is independent
3. **Wait strategies**: Use `waitForLoadState('networkidle')`
4. **Error handling**: Graceful failure for missing content
5. **Cross-browser**: Consider browser differences

### Performance Guidelines

1. **Parallel execution**: Enable for faster testing
2. **Smart selectors**: Use semantic selectors over CSS
3. **Resource limits**: Limit crawl scope for large sites
4. **Timeout management**: Appropriate timeouts for operations

### Maintenance

1. **Regular updates**: Keep Playwright updated
2. **Test review**: Regular test suite review
3. **Data cleanup**: Clean test data periodically
4. **Report analysis**: Monitor test trends

## 🎯 Success Criteria

### Category Integration

- [ ] All Task A, B, C routes functional
- [ ] Bilingual content displays correctly
- [ ] RTL layout works for Arabic
- [ ] Pagination operates smoothly
- [ ] SEO metadata generates properly
- [ ] No regressions in existing functionality

### Overall Website Health

- [ ] > 95% pages load successfully
- [ ] <3s average load time
- [ ] No critical accessibility violations
- [ ] Security headers present
- [ ] Mobile-responsive design
- [ ] Cross-browser compatibility

---

## 🎉 Conclusion

This testing suite provides comprehensive validation for the HAPA website, ensuring quality, performance, and accessibility across all features. The category integration tests specifically validate that Tasks A, B, and C work correctly with proper bilingual support and government-compliant functionality.

**Next Steps:**

1. Run initial test suite: `pnpm test`
2. Set up CI/CD integration
3. Monitor test results and maintain
4. Expand coverage as site grows

For support or questions about testing, refer to the [Playwright documentation](https://playwright.dev) or consult the development team.
