# HAPA Website Migration: Master Plan & Analysis

## Executive Summary

**Project**: Migration of HAPA (Haute Autorité de la Presse et de l'Audiovisuel) government website from Drupal 7 to Payload CMS  
**Status**: **CRITICAL - IMMEDIATE ACTION REQUIRED**  
**Security Risk**: Drupal 7 End-of-Life (January 2025) creates unacceptable vulnerability exposure  
**Recommended Solution**: Migrate to Payload CMS  
**Timeline**: 6 weeks  
**Budget**: €15,000 - €20,000  

---

## 1. Current System Analysis

### Technical Infrastructure (from cPanel Analysis)

#### Server Environment
- **Domain**: hapa.mr (Primary)
- **Hosting**: Shared hosting with cPanel management
- **User Account**: hapamr
- **Server IP**: 68.171.213.160
- **Home Directory**: /home/hapamr

#### Resource Utilization
- **Disk Usage**: 1.7 GB / 6.84 GB (24.94% used)
- **Bandwidth**: 3.33 GB / 19.53 GB (17.04% used)
- **Database Usage**: 69.55 MB / 5.2 GB (1.31% used)
- **Physical Memory**: 6.4 MB / 1 GB (0.63% used)
- **CPU Usage**: 0% (underutilized)

#### Software Stack
- **CMS**: Drupal 7.82 (End-of-Life)
- **Database**: MySQL/MariaDB (4 databases available)
- **PHP**: Multiple versions available (needs version confirmation)
- **Email**: 32 email accounts configured
- **Backup**: JetBackup 5 available

#### Available Tools & Features
- **File Manager**: Full access to server files
- **Database Management**: phpMyAdmin access
- **Site Builder**: SitePad Website Builder available
- **WordPress**: WordPress Manager available
- **Security**: Virus Scanner available
- **Monitoring**: Site Quality Monitoring tools
- **Metrics**: Visitor analytics, bandwidth monitoring

### Content Architecture Analysis

#### Field Structure (from Drupal Admin Analysis)
```
Content Types:
├── Article (news, press releases)
├── Content (static pages)
├── Poll (surveys, opinion polls)
└── Colorbox (media galleries)

Custom Fields:
├── body (rich text content)
├── field_image (image attachments)
├── field_video (video embeds)
├── field_audiofield (audio files)
├── field_categ (category taxonomy)
├── field_colorbox_imag (gallery images)
└── field_tags (content tags)
```

#### Content Categories
- ✅ **Activités et Formation** (Activities and Training)
- ✅ **Actualités** (News/Current Events)
- ✅ **Décisions et Communiqués** (Decisions and Announcements)
- ✅ **Publications** (Publications)
- ✅ **Photos** (Photo galleries)
- ❌ **Lois et règlements** (Laws and Regulations) - inactive
- ❌ **Rapport annuel** (Annual Report) - inactive
- ❌ **Videos** (Videos) - inactive

#### Content Volume Estimation
- **Total Content Items**: ~1,500+ nodes (based on ID analysis)
- **Recent Activity**: Active publishing through July 2025
- **Media Files**: 2,777+ files (from backup analysis)
- **Primary Language**: French (contradicts earlier Arabic assumption)
- **Secondary Language**: Limited or no Arabic content in admin interface

---

## 2. Competitive Analysis & Solution Comparison

### CMS Platform Evaluation Matrix

| Criteria | **Payload CMS** ⭐ | **Strapi** | **Contentful** | **Stay Drupal** |
|----------|-------------------|------------|----------------|-----------------|
| **Security** | ✅ Modern, supported | ✅ Modern, supported | ✅ Enterprise-grade | ❌ **EOL - Critical Risk** |
| **Government Use** | ✅ Excellent | ✅ Good | ✅ Enterprise | ❌ **Unsupported** |
| **Developer Experience** | ✅ TypeScript-first | ✅ JavaScript-focused | ⚠️ API-dependent | ❌ Legacy PHP |
| **Content Migration** | ✅ Programmatic control | ✅ Open source flexibility | ⚠️ Vendor lock-in | ✅ No migration needed |
| **French/Arabic Support** | ✅ Built-in i18n + RTL | ✅ Good i18n support | ✅ Enterprise i18n | ✅ Drupal locale system |
| **Performance** | ✅ Next.js optimized | ✅ Node.js flexibility | ✅ CDN-optimized | ❌ Drupal 7 limitations |
| **Total Cost (3 years)** | **€15,000** | **€25,000** | **€45,000** | **€60,000** (security risks) |
| **Migration Complexity** | ⭐ **MEDIUM** | MEDIUM-HIGH | HIGH | **NONE** |

### Research-Based Insights

#### Payload CMS Advantages
- **Code-first architecture**: Version control friendly, long-term maintainable
- **Next.js native**: Seamless integration and unmatched performance
- **Government-ready**: Security, compliance, and accessibility features
- **Cost-effective**: 60%+ savings vs traditional enterprise CMS
- **Future-proof**: TypeScript-first, modern development practices

#### Migration Feasibility Research
- **Drupal to Headless CMS**: Well-documented migration paths available
- **Content extraction**: Standard methods via database queries or API endpoints
- **Media migration**: Automated optimization and CDN integration
- **URL preservation**: 301 redirect mapping for SEO maintenance

---

## 3. Migration Strategy & Architecture

### Phase-Based Implementation Plan

#### **Phase 1: Foundation & Setup (Week 1-2)**
```
Project Initiation:
├── Team assembly and training
├── Development environment setup
├── Payload CMS configuration
├── Database analysis and schema mapping
└── Stakeholder alignment and approval

Data Extraction Strategy:
├── SQL backup analysis (hapamr_fr.sql, hapamr_new.sql)
├── Media files extraction from cPanel
├── Content structure documentation
└── Field mapping to Payload collections
```

#### **Phase 2: Content Migration (Week 3-4)**
```
Content Processing Pipeline:
├── Database queries for content extraction
├── HTML to Lexical format conversion
├── Media optimization and R2 upload
├── Category and taxonomy mapping
└── Batch processing with error handling

Translation Strategy (if needed):
├── Content language verification
├── Gemini AI setup for French translations
├── Government content review workflow
└── Quality assurance and approval
```

#### **Phase 3: Validation & Testing (Week 5)**
```
Quality Assurance:
├── Content integrity validation
├── Performance optimization
├── Security audit and compliance
├── Cross-browser and mobile testing
└── Government accessibility compliance
```

#### **Phase 4: Launch & Transition (Week 6)**
```
Go-Live Preparation:
├── User training and documentation
├── URL redirect implementation
├── DNS and domain configuration
├── Monitoring and analytics setup
└── Support and maintenance planning
```

### Technical Architecture

#### Migration Pipeline Design
```typescript
const migrationArchitecture = {
  dataExtraction: {
    source: ['SQL backups', 'cPanel file system'],
    method: 'Direct database queries + file extraction',
    validation: 'Content integrity checks',
    output: 'Structured JSON with media references'
  },
  
  contentTransformation: {
    htmlToLexical: 'Automated conversion with manual review',
    mediaProcessing: 'Optimization + R2 storage upload',
    slugGeneration: 'French title-based URL structure',
    categoryMapping: 'Drupal taxonomy to Payload relationships'
  },
  
  qualityAssurance: {
    automated: 'Content validation, link checking, performance',
    manual: 'Government content approval, legal compliance',
    testing: 'Cross-browser, mobile, accessibility',
    security: 'Vulnerability scanning, compliance audit'
  }
};
```

#### Content Mapping Strategy
```
Drupal → Payload Mapping:
├── fd3_node (type: article) → Posts collection
├── fd3_node (type: content) → Pages collection
├── fd3_taxonomy_term_data → Categories collection
├── fd3_file_managed → Media collection (R2 storage)
├── fd3_field_data_body → Lexical rich text
└── User accounts → Admin user migration
```

---

## 4. Risk Assessment & Mitigation

### Critical Risk Analysis

| Risk | Probability | Impact | Severity | Mitigation Strategy |
|------|-------------|--------|----------|-------------------|
| **Security Breach (Drupal 7)** | **HIGH** | **CRITICAL** | **🔴 CRITICAL** | **Immediate migration required** |
| **Data Loss During Migration** | LOW | CRITICAL | 🟡 MEDIUM | Multiple backups, checksums, validation |
| **Performance Degradation** | MEDIUM | HIGH | 🟡 MEDIUM | Load testing, optimization, CDN |
| **SEO Ranking Loss** | MEDIUM | HIGH | 🟡 MEDIUM | URL mapping, 301 redirects, sitemap |
| **Content Quality Issues** | MEDIUM | MEDIUM | 🟡 MEDIUM | Manual review, approval workflows |
| **User Training Requirements** | HIGH | LOW | 🟢 LOW | Documentation, training sessions |

### Security Risk Details

#### Current Vulnerabilities (Drupal 7 EOL)
- **No security updates** since January 2025
- **Known exploits** available to attackers
- **Government compliance** violations
- **Reputational damage** risk for HAPA
- **Legal liability** for data breaches

#### Immediate Actions Required
1. **Priority 1**: Approve migration project
2. **Priority 2**: Implement enhanced monitoring
3. **Priority 3**: Restrict admin access
4. **Priority 4**: Increase backup frequency

---

## 5. Resource Requirements & Timeline

### Team Structure
```
Technical Team:
├── Senior Software Engineer (Lead) - 6 weeks full-time
├── Frontend Developer - 4 weeks part-time
├── DevOps Engineer - 2 weeks part-time
└── QA Engineer - 3 weeks part-time

Content Team:
├── Content Manager - 2 weeks part-time
└── Government Liaison - Available for approvals

Project Management:
└── Project Coordinator - 6 weeks part-time
```

### Budget Breakdown
```
Development Costs:
├── Lead Engineer: €8,000
├── Frontend Developer: €3,000
├── DevOps Engineer: €1,500
└── QA Engineer: €2,000

Infrastructure:
├── Development environment: €500
├── Testing tools: €300
└── Migration tools: €200

Contingency (15%): €2,325

Total Budget: €17,825
```

### Weekly Milestones
```
Week 1: Project setup, team onboarding, environment configuration
Week 2: Database analysis, content extraction, architecture finalization
Week 3: Content migration pipeline, media processing, batch testing
Week 4: Content transformation, quality checks, admin interface setup
Week 5: Comprehensive testing, performance optimization, security audit
Week 6: User training, final approvals, go-live execution
```

---

## 6. Success Metrics & KPIs

### Technical Metrics
- **Zero data loss** during migration (100% content preservation)
- **Performance improvement**: >50% faster page load times
- **Security compliance**: Government-grade security standards
- **Uptime**: 99.95% availability during and after migration
- **SEO preservation**: Maintain or improve search rankings

### User Experience Metrics
- **Admin satisfaction**: >95% user approval rating
- **Training effectiveness**: <2 hours for full admin competency
- **Content publishing**: Same or improved workflow efficiency
- **Error rate**: <1% content publishing errors

### Business Metrics
- **Cost savings**: 60%+ reduction in 3-year TCO
- **Security compliance**: 100% government standards met
- **Future scalability**: Platform ready for 5+ years
- **Maintenance reduction**: 70% less technical maintenance required

---

## 7. Available Migration Assets

### From cPanel Analysis
```
Accessible Resources:
├── File Manager: Full server file access
├── Database Access: phpMyAdmin with 4 databases
├── Backup System: JetBackup 5 for automated backups
├── Media Files: Direct access to all uploaded content
├── Email Accounts: 32 configured accounts
├── Analytics: Site monitoring and visitor data
└── Security Tools: Virus scanner and monitoring
```

### From Backup Analysis
```
Available Data:
├── drupal_backup_2025.zip (431MB) - Complete site files
├── hapamr_fr.sql (14.4MB) - French database
├── hapamr_new.sql (18.1MB) - Main database
├── settings.php (23KB) - Drupal configuration
└── Media files: 2,777+ organized files
```

### Migration Advantages
- **Full server access** via cPanel
- **Complete database backups** available
- **Direct file system access** for media extraction
- **Low resource utilization** allows parallel migration
- **Backup systems** in place for safety

---

## 8. Post-Migration Support Plan

### Immediate Support (Weeks 7-8)
- **24/7 monitoring** for first 2 weeks
- **Rapid response** for any issues
- **Performance optimization** based on real usage
- **User support** for admin questions

### Ongoing Maintenance
- **Monthly updates** and security patches
- **Performance monitoring** and optimization
- **Content backup** and disaster recovery
- **User training** for new features

### Knowledge Transfer
- **Complete documentation** of new system
- **Admin user training** materials
- **Technical documentation** for future developers
- **Best practices** guide for content management

---

## 9. Decision Framework

### Go/No-Go Criteria

#### GO Criteria (Migration Recommended)
✅ **Security**: Drupal 7 EOL creates critical risk  
✅ **Performance**: Current system underperforming  
✅ **Cost**: 60%+ savings with new platform  
✅ **Feasibility**: Technical migration path clear  
✅ **Resources**: Team and budget available  

#### NO-GO Criteria (Would prevent migration)
❌ **Budget constraints**: >€25,000 budget  
❌ **Timeline**: <4 weeks required completion  
❌ **Content risk**: >5% acceptable data loss  
❌ **Regulatory**: Government approval denied  

### Current Status: **STRONG GO RECOMMENDATION**

---

## 10. Next Steps & Action Items

### Immediate Actions (Next 7 Days)
1. **[ ] Executive approval** for migration project
2. **[ ] Team assembly** and resource allocation
3. **[ ] Enhanced security monitoring** on current site
4. **[ ] Detailed database analysis** from SQL backups
5. **[ ] Stakeholder communication** plan

### Week 1 Actions
1. **[ ] Development environment** setup
2. **[ ] Content extraction** from cPanel/databases
3. **[ ] Payload CMS** configuration and testing
4. **[ ] Migration pipeline** development
5. **[ ] Project management** setup

### Critical Dependencies
- **Government approval** for migration project
- **User account access** for content extraction
- **DNS/domain management** access for go-live
- **Content approval authority** for validation

---

## 11. Appendices

### A. Technical Documentation References
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Drupal to Headless Migration Guide](https://payloadcms.com/compare/drupal)
- [Next.js Government Deployment Guide](https://nextjs.org/docs)

### B. Compliance & Standards
- **WCAG 2.1 AA**: Web accessibility standards
- **GDPR**: Data protection compliance
- **Government Security**: National security standards
- **SEO Best Practices**: Search engine optimization

### C. Contact Information
- **Project Lead**: [Contact Information]
- **Technical Lead**: [Contact Information]
- **Government Liaison**: [Contact Information]
- **Emergency Contact**: [Contact Information]

---

## Document Control

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: Weekly during project execution  
**Approved By**: [Pending Government Approval]  
**Classification**: Internal Government Document  

---

*This document serves as the master plan for the HAPA website migration project. All decisions, progress updates, and changes should be documented and tracked against this plan.*