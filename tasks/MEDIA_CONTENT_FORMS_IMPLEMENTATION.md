# Media Content Forms Implementation - Detailed Task Breakdown

## Project Overview
Implement two specialized forms for HAPA's media regulatory functions:
1. **Media Content Reporting Form** (Formulaire de signalement) - For reporting inappropriate media content
2. **Media Content Complaint Form** (Formulaire de plainte) - For formal complaints with legal implications

## Epic: Media Content Forms System

### Prerequisites ✅
- Existing custom forms infrastructure (CustomFormSubmissions collection)
- Bilingual support (French/Arabic RTL)
- Zod validation schemas
- React Hook Form integration
- Admin interface for form submissions

---

## Story 1: Media Content Reporting Form (Signalement)

### 1.1 Backend Schema & Collection Updates
**Priority: High | Estimated: 2-3 hours**

#### Subtasks:
- [ ] **1.1.1** Update `CustomFormSubmissions` collection schema
  - Add `reportType: 'signalement' | 'plainte'` field
  - Add media-specific fields for content reporting
  - Ensure proper localization support

- [ ] **1.1.2** Create TypeScript interfaces
  - `MediaReportingFormData` interface
  - Update `CustomFormSubmission` type
  - Export types from form types file

- [ ] **1.1.3** Update API endpoint validation
  - Extend `/api/custom-forms/submit` route
  - Add server-side validation for media reporting fields
  - Handle file uploads for evidence

### 1.2 Frontend Form Component - Reporting
**Priority: High | Estimated: 4-5 hours**

#### Subtasks:
- [ ] **1.2.1** Create MediaReportingForm component
  - Location: `src/components/CustomForms/MediaReportingForm/index.tsx`
  - Implement all required fields from task-forms.md
  - Full bilingual support (French/Arabic)

- [ ] **1.2.2** Implement form sections
  - **Section 1**: Media Content Information
    - Media type selection (TV, Radio, Website, YouTube, Facebook, Other)
    - Program/content name
    - Date and time of broadcast/publication
    - Link or screenshot upload
  
  - **Section 2**: Reporting Reason
    - Multiple choice checkboxes for violation types
    - Custom "Other" field with text input
  
  - **Section 3**: Content Description
    - Large textarea for detailed description
    - Context and inappropriateness explanation
  
  - **Section 4**: Attachments (Optional)
    - File upload for screenshots
    - Links to videos/pages
    - Written statements
    - Audio recordings

- [ ] **1.2.3** Form validation & UX
  - Zod schema for client-side validation
  - Real-time validation feedback
  - Progress indicator for multi-section form
  - Responsive design for mobile devices

### 1.3 Frontend Form Component - RTL Arabic Support
**Priority: High | Estimated: 2 hours**

#### Subtasks:
- [ ] **1.3.1** Arabic RTL layout implementation
  - Proper text direction for Arabic content
  - RTL-compatible form layout
  - Arabic translations for all form labels and options

- [ ] **1.3.2** Bidirectional text handling
  - Mixed content support (Arabic with English URLs/names)
  - Proper alignment for form elements
  - Cultural adaptation for form flow

---

## Story 2: Media Content Complaint Form (Plainte)

### 2.1 Backend Schema Extensions
**Priority: High | Estimated: 1-2 hours**

#### Subtasks:
- [ ] **2.1.1** Extend CustomFormSubmissions for complaints
  - Add complainant information fields
  - Legal consent and declaration fields
  - Relationship to content field

- [ ] **2.1.2** Create ComplaintFormData interface
  - All required fields from task-forms.md
  - Proper TypeScript typing
  - Validation constraints

### 2.2 Frontend Complaint Form Component
**Priority: High | Estimated: 5-6 hours**

#### Subtasks:
- [ ] **2.2.1** Create MediaComplaintForm component
  - Location: `src/components/CustomForms/MediaComplaintForm/index.tsx`
  - Extended form with complainant information
  - Legal consent section

- [ ] **2.2.2** Implement complaint-specific sections
  - **Section 1**: Complainant Information
    - Full name, phone, WhatsApp, email
    - Optional profession field
    - Relationship to content (viewer, directly affected, journalist, other)
  
  - **Section 2**: Media Content Information (same as reporting)
  - **Section 3**: Complaint Reason (same options as reporting)
  - **Section 4**: Content Description (same as reporting)
  - **Section 5**: Attachments (same as reporting)
  - **Section 6**: Legal Declaration and Consent
    - Accuracy declaration checkbox
    - Data usage consent checkbox
    - Date field (auto-filled)

- [ ] **2.2.3** Enhanced validation for legal form
  - Required fields validation
  - Email and phone format validation
  - Consent checkbox requirements
  - Form submission confirmation dialog

---

## Story 3: Form Integration & Pages

### 3.1 Form Page Creation
**Priority: Medium | Estimated: 2-3 hours**

#### Subtasks:
- [ ] **3.1.1** Create reporting form page
  - `src/app/(frontend)/[locale]/signalement/page.tsx`
  - SEO optimization and meta tags
  - Proper page layout and navigation

- [ ] **3.1.2** Create complaint form page
  - `src/app/(frontend)/[locale]/plainte/page.tsx`
  - Legal disclaimer and instructions
  - Clear differentiation from reporting form

- [ ] **3.1.3** Update navigation
  - Add links to both forms in main navigation
  - Update `navigation-items.ts`
  - Ensure proper locale handling

### 3.2 Form Blocks Integration
**Priority: Medium | Estimated: 2 hours**

#### Subtasks:
- [ ] **3.2.1** Create MediaReportingFormBlock
  - Block for embedding reporting form in pages
  - CMS integration for content pages

- [ ] **3.2.2** Create MediaComplaintFormBlock
  - Block for embedding complaint form in pages
  - CMS configuration options

- [ ] **3.2.3** Register blocks in RenderBlocks
  - Update `src/blocks/RenderBlocks.tsx`
  - Update Pages collection configuration

---

## Story 4: Admin Interface Enhancement

### 4.1 Submission Management
**Priority: Medium | Estimated: 3-4 hours**

#### Subtasks:
- [ ] **4.1.1** Enhance SubmissionListCell component
  - Display form type (signalement vs plainte)
  - Show key information (media type, violation type)
  - Priority indicators for complaints

- [ ] **4.1.2** Enhance DetailedSubmissionView
  - Structured display for media-specific fields
  - Evidence file preview and download
  - Action buttons for admin workflow

- [ ] **4.1.3** Add filtering and search
  - Filter by form type
  - Filter by media type
  - Filter by violation type
  - Search by content name or description

### 4.2 Workflow Management
**Priority: Medium | Estimated: 2-3 hours**

#### Subtasks:
- [ ] **4.2.1** Add submission status tracking
  - Status field: received, under_review, resolved, closed
  - Admin assignment functionality
  - Status history tracking

- [ ] **4.2.2** Email notifications
  - Auto-acknowledgment emails
  - Status update notifications
  - Admin notification system

---

## Story 5: Testing & Quality Assurance

### 5.1 Form Functionality Testing
**Priority: High | Estimated: 2-3 hours**

#### Subtasks:
- [ ] **5.1.1** Unit tests for form components
  - Test form validation
  - Test submission flow
  - Test error handling

- [ ] **5.1.2** Integration tests
  - API endpoint testing
  - Database schema validation
  - File upload testing

- [ ] **5.1.3** E2E testing (if Playwright available)
  - Complete form submission flows
  - Multi-language testing
  - Mobile responsiveness testing

### 5.2 Accessibility & Performance
**Priority: Medium | Estimated: 2 hours**

#### Subtasks:
- [ ] **5.2.1** Accessibility testing
  - WCAG compliance check
  - Screen reader compatibility
  - Keyboard navigation

- [ ] **5.2.2** Performance optimization
  - Form loading speed
  - File upload performance
  - Mobile performance testing

---

## Story 6: Documentation & Deployment

### 6.1 Documentation
**Priority: Low | Estimated: 1-2 hours**

#### Subtasks:
- [ ] **6.1.1** Update CLAUDE.md
  - Document new form system
  - Add usage instructions
  - Update development guidelines

- [ ] **6.1.2** Create user documentation
  - Form usage guides for citizens
  - Admin interface documentation

### 6.2 Deployment Preparation
**Priority: Medium | Estimated: 1 hour**

#### Subtasks:
- [ ] **6.2.1** Environment configuration
  - Update environment variables if needed
  - Verify email configuration for notifications

- [ ] **6.2.2** Database migration preparation
  - Generate types after schema changes
  - Test migration on staging environment

---

## Implementation Strategy

### Phase 1: Core Infrastructure (Stories 1.1, 2.1)
- Backend schema updates
- API endpoint modifications
- TypeScript interfaces

### Phase 2: Form Components (Stories 1.2, 1.3, 2.2)
- Media reporting form component
- Media complaint form component
- RTL Arabic support

### Phase 3: Integration (Story 3)
- Page creation and navigation
- CMS block integration

### Phase 4: Admin Enhancement (Story 4)
- Enhanced admin interface
- Workflow management

### Phase 5: Quality & Deployment (Stories 5, 6)
- Testing and validation
- Documentation and deployment

## Success Criteria
- [ ] Both forms are fully functional in French and Arabic
- [ ] All form fields from task-forms.md are implemented
- [ ] Forms submit successfully to the database
- [ ] Admin can view and manage submissions
- [ ] Forms are accessible and mobile-friendly
- [ ] File uploads work correctly
- [ ] Email notifications are sent
- [ ] RTL Arabic layout is properly implemented

## Estimated Total Time: 20-25 hours
## Priority: High
## Dependencies: Existing CustomForms infrastructure, Payload CMS, Resend email service