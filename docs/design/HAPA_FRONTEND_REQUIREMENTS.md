# HAPA Website Frontend Requirements & Context Guide

## 📋 Executive Summary

**HAPA (Haute Autorité de la Presse et de l'Audiovisuel)** is Mauritania's official media regulatory authority responsible for overseeing press and audiovisual media compliance, licensing, and policy enforcement. This document outlines comprehensive requirements for creating a world-class government website that serves citizens, media professionals, and international stakeholders.

## 🏛️ Organization Context

### About HAPA
- **Full Name**: Haute Autorité de la Presse et de l'Audiovisuel
- **Arabic Name**: الهيئة العليا للصحافة والإعلام  
- **Country**: Islamic Republic of Mauritania
- **Type**: Independent government regulatory authority
- **Established**: [Year] under Mauritanian media law
- **Jurisdiction**: National media regulation and oversight

### Mission Statement
HAPA ensures media freedom, professional standards, and regulatory compliance while protecting public interest in Mauritania's press and audiovisual landscape.

### Core Responsibilities
- Media licensing and registration
- Content regulation and standards enforcement
- Professional ethics oversight
- Public complaint resolution
- Industry policy development
- Media freedom protection

## 🎯 Website Goals & Objectives

### Primary Goals
1. **Transparency**: Provide clear access to regulations, decisions, and procedures
2. **Service Delivery**: Enable online applications, complaints, and information requests
3. **Public Information**: Share news, announcements, and regulatory updates
4. **Professional Resources**: Serve journalists, broadcasters, and media professionals
5. **International Presence**: Represent Mauritania's media regulatory framework globally

### Key Performance Indicators
- Citizen service accessibility
- Media professional satisfaction
- International recognition
- Regulatory transparency metrics
- Digital service adoption rates

## 👥 Target Audiences

### Primary Users
1. **Citizens & General Public**
   - Access to regulatory information
   - Filing complaints about media content
   - Understanding media rights and responsibilities

2. **Media Professionals**
   - Journalists, editors, content creators
   - Broadcasting companies and stations
   - Digital media platforms
   - International correspondents

3. **Government Stakeholders**
   - Ministry officials
   - Legal professionals
   - Policy researchers
   - International regulatory bodies

4. **Academic & Research Community**
   - Media studies researchers
   - Legal scholars
   - Policy analysts
   - Students and educators

## 🏗️ Technical Architecture

### Current Technology Stack
- **Frontend**: Next.js 15.3.3 with App Router
- **CMS**: Payload CMS 3.44.0 (TypeScript-first headless CMS)
- **Database**: Neon PostgreSQL (serverless)
- **Hosting**: Vercel Pro with global CDN
- **Storage**: Vercel Blob for media files
- **Styling**: Tailwind CSS with custom HAPA branding
- **Language**: Full bilingual support (French/Arabic + RTL)

### Performance Requirements
- **PageSpeed Score**: ≥ 90 on mobile and desktop
- **Core Web Vitals**: All metrics in "Good" range
- **Load Time**: < 3 seconds globally
- **Uptime**: 99.9% availability
- **SEO**: Top rankings for relevant government queries

## 🎨 Design Requirements

### Visual Identity
- **Primary Colors**:
  - Government Blue: `#065986`
  - Official Gold: `#D4A574` 
  - Regulatory Green: `#2D5A27`
- **Typography**: Geist font family with Arabic support
- **Logo**: Official HAPA emblem with variations
- **Government Branding**: Mauritanian flag colors and national symbols

### Design Principles
1. **Professional Authority**: Convey government credibility and trustworthiness
2. **Accessibility First**: WCAG 2.1 AA compliance
3. **Cultural Sensitivity**: Respect for Islamic and Mauritanian values
4. **Modern Minimalism**: Clean, uncluttered interface
5. **Mobile Excellence**: Mobile-first responsive design

### UI Components Required
- Government identity header with national motto
- Bilingual navigation with RTL support
- Document viewer with download capabilities
- Contact forms with validation
- News/announcement cards
- Service request interfaces
- Search functionality
- Language switcher
- Accessibility toolbar

## 📑 Content Structure & Information Architecture

### Homepage Sections
1. **Hero Section**
   - HAPA mission statement
   - Key service highlights
   - Latest announcements
   - Quick access buttons

2. **About HAPA**
   - Organization overview
   - Leadership team
   - Mission and vision
   - Organizational structure

3. **Core Services**
   - Media licensing
   - Complaint filing
   - Document requests
   - Professional registration

4. **Latest News & Updates**
   - Regulatory announcements
   - Policy updates
   - Press releases
   - Industry reports

5. **Quick Links**
   - Legal framework
   - Application forms
   - Contact information
   - Emergency contacts

6. **Footer**
   - Government links
   - Site map
   - Legal information
   - Social media

### Content Categories
- **Regulatory Framework**: Laws, decrees, and regulations
- **Professional Services**: Licensing, registration, certification
- **Public Services**: Complaints, information requests, consultations
- **Publications**: Reports, studies, guidelines
- **News & Updates**: Announcements, press releases, decisions
- **Resources**: Forms, templates, educational materials

## 🛠️ Features & Services

### Core Features
1. **Bilingual Content Management**
   - French (primary) and Arabic support
   - RTL layout for Arabic content
   - Automatic fallback mechanisms
   - SEO optimization per language

2. **Document Management**
   - Secure document uploads
   - Version control
   - Digital signatures
   - Download tracking

3. **Online Services**
   - License applications
   - Complaint submission
   - Information requests
   - Appointment booking

4. **Communication Tools**
   - Contact forms
   - Newsletter subscription
   - SMS notifications
   - Email alerts

5. **Search & Discovery**
   - Advanced search functionality
   - Content categorization
   - Tagging system
   - Filter options

### Advanced Features
- **Live Chat Support** (business hours)
- **Document Preview** (PDF, images)
- **Mobile App Integration** (future)
- **API Access** for developers
- **Analytics Dashboard** (admin)
- **Multi-channel Notifications**

## 📄 Page Requirements

### Essential Pages
1. **Homepage** - Main landing with key information
2. **About Us** - Organization details and mission
3. **Services** - Complete service catalog
4. **News & Updates** - Latest announcements
5. **Legal Framework** - Laws and regulations
6. **Contact** - Multi-channel contact information
7. **Site Map** - Complete site structure
8. **Privacy Policy** - Data protection information
9. **Terms of Use** - Website usage terms
10. **Accessibility** - Accessibility statement

### Service-Specific Pages
- **Media Licensing** - Application process and requirements
- **Professional Registration** - Journalist and media professional registration
- **Complaints Portal** - Public complaint submission system
- **Document Center** - Official documents and publications
- **Press Releases** - Official HAPA communications
- **FAQ** - Frequently asked questions
- **Forms & Applications** - Downloadable and online forms

### Administrative Pages
- **Admin Dashboard** - Content management interface
- **User Management** - Account administration
- **Analytics** - Performance metrics
- **System Settings** - Configuration options

## 🎨 Branding Guidelines

### Official Brand Assets

#### **Logo System**
- **Primary Logo**: `/public/logo_hapa1.png` (193px × 34px)
- **Usage Guidelines**:
  - Consistent placement across all components
  - Minimum size: 120px width for readability
  - Clear space: 16px minimum on all sides
  - Always maintain aspect ratio
  - Available in color and monochrome versions

#### **Favicon System**
```
/public/favicon.svg              - Vector format (preferred)
/public/custom-favicon-dark.png  - Dark theme variant
/public/custom-favicon-light.png - Light theme variant  
/public/favicon.ico              - Fallback ICO format
```

#### **Flag Assets** (Language Switcher)
```
/public/flags/fr.svg             - French flag
/public/flags/ar.svg             - Mauritanian flag
```

#### **Brand Implementation Files**
- `/src/app/(frontend)/globals.css` - Main brand color system
- `/src/app/(payload)/custom.scss` - Admin interface branding
- `/tailwind.config.mjs` - Design system configuration
- `/src/components/Logo/Logo.tsx` - Logo component

### Official HAPA Color Palette

#### **Primary Brand Colors** (Current Implementation)
```css
/* HAPA Authentic Brand Colors - HSL Format */
--primary: 142 80% 25%;        /* #138B3A - HAPA Primary Green */
--primary-foreground: 0 0% 100%;

--secondary: 60 95% 50%;       /* #E6E619 - HAPA Bright Yellow */
--secondary-foreground: 142 80% 25%;

--accent: 142 75% 20%;         /* #0F7A2E - HAPA Dark Green */
--accent-foreground: 0 0% 100%;
```

#### **Alternative Government Authority Colors**
```css
/* Government Authority Scheme */
--gov-primary: #065986;        /* Government Authority Blue */
--gov-secondary: #D4A574;      /* Official Gold Accent */
--gov-accent: #2D5A27;         /* Regulatory Green */
```

#### **Mauritanian Flag Colors**
```css
/* National Identity Colors */
--mauritania-red: #d01c1f;     /* Flag red */
--mauritania-green: #00a95c;   /* Flag green */
--mauritania-gold: #ffd700;    /* Flag gold/yellow */
```

#### **Semantic & Status Colors**
```css
/* Feedback & Status Colors */
--success: 196 52% 74%;        /* Success states */
--warning: 34 89% 85%;         /* Warning states */
--error: 10 100% 86%;          /* Error states */
--destructive: 0 84.2% 60.2%;  /* Destructive actions */
```

#### **Foundation UI Colors**
```css
/* Base Interface Colors */
--background: 0 0% 100%;       /* Pure white background */
--foreground: 222.2 84% 4.9%;  /* Primary text color */
--card: 240 5% 96%;            /* Card backgrounds */
--border: 240 6% 80%;          /* Border elements */
--muted: 210 40% 96.1%;        /* Muted backgrounds */
--muted-foreground: 215.4 16.3% 46.9%;
--input: 214.3 31.8% 91.4%;    /* Form input backgrounds */
--ring: 203 60% 28%;           /* Focus ring color */
```

### Typography System

#### **Font Families**
```css
/* Primary Typography */
--font-geist-sans: 'Geist Sans'     /* Primary Latin font */
--font-geist-mono: 'Geist Mono'     /* Monospace font */

/* Arabic Typography */
--font-arabic-noto: 'Noto Sans Arabic'
--font-arabic-cairo: 'Cairo'
--font-arabic-tajawal: 'Tajawal'
--font-arabic-amiri: 'Amiri'
```

#### **Typography Hierarchy**
- **H1**: 2.5rem (40px) - Page titles, high impact headers
- **H2**: 2rem (32px) - Section headers, major content divisions
- **H3**: 1.5rem (24px) - Subsection headers, content organization
- **H4**: 1.25rem (20px) - Content headers, article sections
- **Body**: 1rem (16px) - Main content, optimal reading size
- **Small**: 0.875rem (14px) - Secondary text, captions, metadata

#### **Arabic Typography Enhancements**
```css
.font-arabic-sans {
  font-size: 1.125rem;              /* 18px - larger for Arabic readability */
  line-height: 1.8;                 /* Better line height for Arabic */
  font-feature-settings: "liga" 1, "kern" 1, "calt" 1;
  text-rendering: optimizeLegibility;
}
```

#### **Responsive Typography**
- **Mobile**: Base sizes reduced by 10-15% for optimal mobile reading
- **Tablet**: Standard sizes maintained
- **Desktop**: Enhanced sizes for larger screens and better hierarchy

## 🌍 Multilingual Requirements

### Language Support
- **French**: Primary language, default content creation
- **Arabic**: Full translation with RTL layout support
- **URL Structure**: `/fr/page` and `/ar/page`
- **Fallback**: Arabic content falls back to French when unavailable

### RTL Implementation
- Automatic `dir="rtl"` for Arabic content
- Mirrored layout elements (navigation, buttons, images)
- Arabic typography with proper line height
- Cultural text alignment (right-to-left reading flow)

### Content Localization
- Government terminology accuracy
- Cultural context adaptation
- Legal document translation
- Service descriptions in both languages

## ♿ Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: 4.5:1 minimum ratio
- **Text Scaling**: Support up to 200% zoom
- **Alternative Text**: All images with descriptive alt text

### Assistive Technology Support
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Voice control software
- High contrast mode
- Reduced motion preferences

## 🔒 Security Considerations

### Data Protection
- GDPR-style privacy compliance
- Secure form submissions
- Encrypted data storage
- Session management
- User authentication

### Government Standards
- Official government security protocols
- Secure document handling
- Access control systems
- Audit trail maintenance
- Incident response procedures

## 📈 SEO & Performance

### Search Engine Optimization
- **Meta Tags**: Comprehensive meta descriptions per language
- **Structured Data**: Government organization schema
- **Sitemap**: Multilingual XML sitemaps
- **Canonical URLs**: Prevent duplicate content
- **Hreflang Tags**: Language variant indicators

### Performance Metrics
- **Lighthouse Score**: 90+ across all categories
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🏛️ Government Website Best Practices

### Design Standards
1. **Official Government Look**: Professional, trustworthy appearance
2. **Clear Navigation**: Intuitive menu structure
3. **Service-Oriented**: Focus on citizen services
4. **Transparency**: Easy access to public information
5. **Contact Accessibility**: Multiple contact methods

### Content Guidelines
- **Plain Language**: Clear, understandable text
- **Regular Updates**: Fresh, current information
- **Official Tone**: Professional government communication
- **Fact-Based**: Accurate, verified information
- **Public Service Focus**: Citizen-centered content

### Compliance Requirements
- **Open Government Standards**: Transparency initiatives
- **Digital Service Standards**: Government digital guidelines
- **Privacy Regulations**: Data protection compliance
- **Accessibility Laws**: Equal access requirements
- **Archive Requirements**: Historical record keeping

## 📱 Mobile & Responsive Design

### Mobile-First Approach
- Touch-friendly interface design
- Optimized form inputs
- Readable typography on small screens
- Fast loading on mobile networks
- Simplified navigation for mobile

### Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large Desktop**: 1440px+

### Mobile Features
- Click-to-call phone numbers
- GPS-enabled location services
- Mobile-optimized forms
- Touch gestures support
- Offline content caching

## 🔧 Content Management

### CMS Requirements
- **User Roles**: Admin, Editor, Contributor, Viewer
- **Workflow**: Draft → Review → Approve → Publish
- **Version Control**: Track content changes
- **Media Library**: Organized file management
- **SEO Tools**: Built-in optimization features

### Content Types
- **Pages**: Static content (About, Services, etc.)
- **Posts**: News, announcements, press releases
- **Documents**: Legal texts, reports, forms
- **Media**: Images, videos, audio files
- **Forms**: Contact forms, applications
- **Categories**: Content organization system

## 🎯 Call-to-Actions & User Journeys

### Primary CTAs
1. **"Apply for License"** - Media licensing process
2. **"File Complaint"** - Public complaint system
3. **"Contact Us"** - Multiple contact methods
4. **"Download Forms"** - Access to official documents
5. **"Latest News"** - Current announcements

### User Journey Examples
1. **Media Professional Registration**:
   Homepage → Services → Professional Registration → Application Form → Confirmation

2. **Public Complaint**:
   Homepage → Contact → Complaint Form → Submission → Tracking

3. **Information Request**:
   Homepage → Search → Document → Download → Confirmation

## 🌟 Inspiration & Benchmarks

### Similar Government Websites
- **French Regulatory Authorities**: CSA (Conseil Supérieur de l'Audiovisuel)
- **Canadian CRTC**: Professional government media regulation site
- **UK Ofcom**: Modern, service-oriented design
- **German Media Authorities**: Federal and state-level sites
- **European Media Regulatory Bodies**: Best practice examples

### Design Excellence Examples
- **Government.uk**: Service design leadership
- **Singapore Government**: Digital transformation
- **Estonia e-Government**: Digital services integration
- **Dubai Government**: Multilingual excellence
- **Canadian Government**: Accessibility leadership

## 💡 Innovation Opportunities

### Future Enhancements
- **AI-Powered Chatbot**: 24/7 citizen support
- **Document AI**: Intelligent document processing
- **Mobile App**: Dedicated HAPA mobile application
- **API Platform**: Developer ecosystem
- **Data Visualization**: Interactive regulatory dashboards

### Emerging Technologies
- **Voice Interface**: Accessibility enhancement
- **AR/VR Applications**: Immersive experiences
- **Blockchain**: Document verification
- **IoT Integration**: Smart regulatory monitoring
- **Machine Learning**: Content personalization

## 📊 Success Metrics

### User Experience Metrics
- **Task Completion Rate**: 90%+
- **User Satisfaction Score**: 4.5/5
- **Average Session Duration**: 3-5 minutes
- **Bounce Rate**: <40%
- **Return Visitor Rate**: 30%+

### Business Metrics
- **Online Service Adoption**: 70% of transactions online
- **Customer Service Reduction**: 30% fewer phone calls
- **Document Downloads**: Monthly tracking
- **Complaint Resolution Time**: <5 business days
- **Public Satisfaction**: Annual surveys

### Technical Metrics
- **Uptime**: 99.9%
- **Page Load Speed**: <3 seconds
- **Mobile Usage**: 60%+ of traffic
- **Search Engine Ranking**: Top 3 for key terms
- **Accessibility Score**: 100% WCAG AA compliance

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
- Core page structure
- Bilingual navigation
- Basic content management
- Mobile responsiveness

### Phase 2: Services (Months 3-4)
- Online application forms
- Document management system
- User registration/login
- Payment integration

### Phase 3: Enhancement (Months 5-6)
- Advanced search features
- Analytics implementation
- Performance optimization
- Security hardening

### Phase 4: Innovation (Months 7-8)
- AI features integration
- Advanced accessibility
- API development
- Mobile app foundation

---

**This comprehensive requirements document serves as a complete context guide for creating a world-class HAPA website that serves Mauritanian citizens, media professionals, and international stakeholders with excellence, transparency, and digital innovation.**

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Prepared for: HAPA Website Development Project*