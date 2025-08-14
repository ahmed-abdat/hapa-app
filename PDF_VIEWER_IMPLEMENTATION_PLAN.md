# PDF Viewer Implementation Plan - HAPA Admin Interface

## Project Overview

**Goal**: Replace basic iframe PDF viewer with react-pdf v10 for enhanced admin UX  
**Timeline**: 4-5 development sessions  
**Scope**: Admin interface only (no public frontend changes)  
**Risk Level**: Low (isolated admin component, fallback available)  

## Phase 1: Foundation Setup (Session 1)

### **Dependencies Installation**
```bash
# Core PDF viewer dependencies
pnpm add react-pdf pdfjs-dist

# Type definitions (if not included)
pnpm add -D @types/react-pdf
```

### **Bundle Configuration**
```javascript
// next.config.js - Add webpack configuration for PDF.js worker
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // ... existing config
};
```

### **Worker Setup Verification**
```tsx
// Test component to verify PDF.js worker loading
// Create: src/components/admin/test/PDFWorkerTest.tsx
```

**Deliverables**:
- [ ] Dependencies installed
- [ ] Next.js config updated  
- [ ] Worker configuration tested
- [ ] No build errors

---

## Phase 2: Core Component Development (Session 2)

### **Enhanced PDF Viewer Component**
```
src/components/admin/EnhancedMediaGallery/
├── components/
│   ├── AdminPDFViewer.tsx         # New PDF viewer component
│   ├── PDFToolbar.tsx             # Controls (navigation, zoom, download)
│   ├── PDFLoadingState.tsx        # Loading skeleton
│   └── PDFErrorState.tsx          # Error handling
├── hooks/
│   ├── usePDFViewer.ts            # PDF state management
│   └── usePDFNavigation.ts        # Page navigation logic
└── types/
    └── pdf-viewer.types.ts        # TypeScript interfaces
```

### **Core AdminPDFViewer Component**
```tsx
// src/components/admin/EnhancedMediaGallery/components/AdminPDFViewer.tsx
"use client";

import { useMemo, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { PDFToolbar } from "./PDFToolbar";
import { PDFLoadingState } from "./PDFLoadingState";
import { PDFErrorState } from "./PDFErrorState";

// CSS imports (only if text/annotation layers enabled)
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker configuration for Next.js App Router
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface AdminPDFViewerProps {
  url: string;
  filename: string;
  onError: () => void;
  className?: string;
}

export function AdminPDFViewer({ url, filename, onError, className }: AdminPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize options to prevent re-fetch on state changes
  const documentOptions = useMemo(
    () => ({ 
      withCredentials: true, // For authenticated admin session
      cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
    }),
    []
  );

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    setError(`Failed to load PDF: ${error.message}`);
    setIsLoading(false);
    onError();
  };

  // Navigation functions
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages || 1));
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  if (error) {
    return <PDFErrorState message={error} filename={filename} />;
  }

  return (
    <div className={`enhanced-pdf-viewer ${className || ''}`}>
      <PDFToolbar
        filename={filename}
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onDownload={() => window.open(url, '_blank')}
        isLoading={isLoading}
      />
      
      <div className="pdf-document-container">
        {isLoading && <PDFLoadingState />}
        
        <Document
          file={{ url }}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          options={documentOptions}
          loading=""
          className="pdf-document"
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={false}        // Disabled for performance
            renderAnnotationLayer={false}  // Disabled for performance
            className="pdf-page"
          />
        </Document>
      </div>
    </div>
  );
}
```

### **Supporting Components**

**PDFToolbar Component**:
```tsx
// src/components/admin/EnhancedMediaGallery/components/PDFToolbar.tsx
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download,
  FileText 
} from 'lucide-react';

interface PDFToolbarProps {
  filename: string;
  currentPage: number;
  numPages?: number;
  scale: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownload: () => void;
  isLoading: boolean;
}

export function PDFToolbar({ 
  filename, 
  currentPage, 
  numPages, 
  scale, 
  onPreviousPage, 
  onNextPage, 
  onZoomIn, 
  onZoomOut, 
  onResetZoom, 
  onDownload,
  isLoading 
}: PDFToolbarProps) {
  return (
    <div className="pdf-toolbar">
      <div className="pdf-info">
        <FileText size={20} className="pdf-icon" />
        <span className="pdf-title">{filename}</span>
        {numPages && (
          <span className="page-indicator">
            Page {currentPage} de {numPages}
          </span>
        )}
      </div>
      
      <div className="pdf-controls">
        {/* Navigation */}
        <div className="nav-controls">
          <button 
            onClick={onPreviousPage} 
            disabled={currentPage <= 1 || isLoading}
            className="control-btn"
            title="Page précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={onNextPage} 
            disabled={currentPage >= (numPages || 1) || isLoading}
            className="control-btn"
            title="Page suivante"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom */}
        <div className="zoom-controls">
          <button 
            onClick={onZoomOut} 
            disabled={scale <= 0.5 || isLoading}
            className="control-btn"
            title="Dézoomer"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={onResetZoom}
            disabled={isLoading}
            className="zoom-display"
            title="Réinitialiser le zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button 
            onClick={onZoomIn} 
            disabled={scale >= 3.0 || isLoading}
            className="control-btn"
            title="Zoomer"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="action-controls">
          <button 
            onClick={onDownload}
            className="control-btn"
            title="Télécharger"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Deliverables**:
- [ ] AdminPDFViewer component created
- [ ] Supporting components (toolbar, loading, error)
- [ ] TypeScript interfaces defined
- [ ] Basic styling applied

---

## Phase 3: Integration & Styling (Session 3)

### **Integration with EnhancedMediaGallery**

**Update existing PDFViewer component**:
```tsx
// src/components/admin/EnhancedMediaGallery/index.tsx
// Replace lines 346-399 (current PDFViewer) with:

import { AdminPDFViewer } from './components/AdminPDFViewer';

const PDFViewer: React.FC<PDFViewerProps> = ({ url, filename, onError }) => {
  // Feature flag for gradual rollout
  const USE_ENHANCED_PDF = process.env.NODE_ENV === 'development' || 
                           process.env.NEXT_PUBLIC_ENHANCED_PDF === 'true';

  if (USE_ENHANCED_PDF) {
    return (
      <AdminPDFViewer
        url={url}
        filename={filename}
        onError={onError}
        className="enhanced-pdf-viewer"
      />
    );
  }

  // Fallback to current iframe implementation
  return (
    <div className="enhanced-pdf-viewer">
      {/* ... existing iframe code ... */}
    </div>
  );
};
```

### **Styling Integration**

**Update SCSS file**:
```scss
// src/components/admin/EnhancedMediaGallery/index.scss
// Add new PDF viewer styles

.enhanced-pdf-viewer {
  .pdf-toolbar {
    @apply flex items-center justify-between p-3 border-b bg-gray-50;
    
    .pdf-info {
      @apply flex items-center gap-2;
      
      .pdf-icon {
        @apply text-red-600;
      }
      
      .pdf-title {
        @apply font-medium text-gray-900 truncate;
      }
      
      .page-indicator {
        @apply text-sm text-gray-600 ml-2;
      }
    }
    
    .pdf-controls {
      @apply flex items-center gap-4;
      
      .control-btn {
        @apply p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed;
        
        &:hover:not(:disabled) {
          @apply bg-gray-100;
        }
      }
      
      .zoom-display {
        @apply px-3 py-1 text-sm font-mono bg-gray-100 rounded-md;
      }
    }
  }
  
  .pdf-document-container {
    @apply flex-1 overflow-auto bg-gray-100 p-4;
    
    .pdf-document {
      @apply flex justify-center;
    }
    
    .pdf-page {
      @apply shadow-lg;
    }
  }
  
  // Loading state
  .pdf-loading {
    @apply flex flex-col items-center justify-center h-64 gap-4;
    
    .skeleton-loader {
      @apply w-full max-w-md h-48 bg-gray-200 animate-pulse rounded-lg;
    }
  }
  
  // Error state
  .pdf-error {
    @apply flex flex-col items-center justify-center h-64 gap-4 text-gray-600;
    
    .error-icon {
      @apply text-red-500;
    }
  }
}
```

### **Environment Configuration**

**Add feature flag**:
```bash
# .env.local
NEXT_PUBLIC_ENHANCED_PDF=true
```

**Deliverables**:
- [ ] Integration with existing component completed
- [ ] Feature flag implementation
- [ ] Styling integrated with admin theme
- [ ] Fallback mechanism working

---

## Phase 4: Testing & Polish (Session 4)

### **Testing Scenarios**

**Document Types**:
- [ ] Small PDFs (< 1MB)
- [ ] Large PDFs (> 10MB)  
- [ ] Multi-page documents (20+ pages)
- [ ] Scanned/image-based PDFs
- [ ] Password-protected PDFs (should show error)
- [ ] Corrupted/invalid PDF files

**Authentication Testing**:
- [ ] Admin session cookies passed correctly
- [ ] Cloudflare R2 URLs work with credentials
- [ ] Cross-origin PDF access (if applicable)

**Performance Testing**:
- [ ] Initial load time
- [ ] Page navigation responsiveness
- [ ] Zoom operations smoothness
- [ ] Memory usage with large documents

**Browser Compatibility**:
- [ ] Chrome/Edge (primary admin browsers)
- [ ] Firefox
- [ ] Safari (if admin users have Macs)
- [ ] Mobile browsers (admin mobile access)

### **Accessibility Improvements**

```tsx
// Add ARIA labels and keyboard navigation
<button 
  onClick={onNextPage}
  disabled={currentPage >= (numPages || 1)}
  className="control-btn"
  aria-label={`Aller à la page ${currentPage + 1} sur ${numPages}`}
  onKeyDown={(e) => {
    if (e.key === 'ArrowRight') onNextPage();
    if (e.key === 'ArrowLeft') onPreviousPage();
  }}
>
  <ChevronRight size={16} />
</button>
```

### **Error Handling Enhancement**

```tsx
// Enhanced error states with retry mechanism
function PDFErrorState({ message, filename, onRetry }: {
  message: string;
  filename: string;
  onRetry?: () => void;
}) {
  return (
    <div className="pdf-error">
      <FileText size={48} className="error-icon" />
      <h3>Impossible de charger le document</h3>
      <p>{filename}</p>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          Réessayer
        </button>
      )}
      <small>Vérifiez que le fichier est un PDF valide</small>
    </div>
  );
}
```

**Deliverables**:
- [ ] Comprehensive testing completed
- [ ] Performance benchmarks established
- [ ] Accessibility improvements implemented
- [ ] Error handling polished

---

## Phase 5: Production Readiness (Session 5)

### **Bundle Size Analysis**

```bash
# Analyze bundle impact
pnpm build
pnpm analyze

# Check admin bundle specifically
# react-pdf + pdfjs-dist ≈ 400KB gzipped
```

### **Performance Monitoring**

```tsx
// Add performance tracking
import { performance } from 'next/performance';

const trackPDFLoadTime = (startTime: number, filename: string) => {
  const loadTime = performance.now() - startTime;
  console.log(`PDF loaded: ${filename} in ${loadTime.toFixed(2)}ms`);
  
  // Could integrate with analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'pdf_load_time', {
      custom_parameter: loadTime,
      pdf_filename: filename
    });
  }
};
```

### **Production Configuration**

```javascript
// next.config.js - Production optimizations
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Production optimizations for PDF.js
      if (!dev) {
        config.optimization.splitChunks.cacheGroups.pdf = {
          name: 'pdf-viewer',
          test: /[\\/]node_modules[\\/](react-pdf|pdfjs-dist)/,
          chunks: 'all',
          priority: 10,
        };
      }
    }
    return config;
  },
  // ... existing config
};
```

### **Documentation Update**

```markdown
# Update CLAUDE.md
## Admin PDF Viewer

The admin interface now uses react-pdf v10 for enhanced PDF preview:

### Features:
- Page navigation with zoom controls
- Professional toolbar with download option
- Loading states and error handling
- Authenticated document access

### Commands:
- `NEXT_PUBLIC_ENHANCED_PDF=true` - Enable enhanced PDF viewer
- `NEXT_PUBLIC_ENHANCED_PDF=false` - Fallback to iframe viewer

### Troubleshooting:
- If PDFs don't load, check browser console for CORS errors
- Large PDFs (>10MB) may take longer to load
- Password-protected PDFs will show error state
```

**Deliverables**:
- [ ] Bundle size optimized
- [ ] Production configuration updated
- [ ] Performance monitoring implemented
- [ ] Documentation updated

---

## Implementation Checklist

### **Pre-Implementation**
- [ ] Backup current working state
- [ ] Create feature branch: `feature/enhanced-pdf-viewer`
- [ ] Document current iframe behavior for comparison

### **Dependencies & Setup**
- [ ] Install react-pdf and pdfjs-dist
- [ ] Configure Next.js webpack for PDF.js worker
- [ ] Set up development environment variables

### **Component Development**
- [ ] Create AdminPDFViewer component
- [ ] Build supporting components (toolbar, loading, error)
- [ ] Implement TypeScript interfaces
- [ ] Add SCSS styling

### **Integration**
- [ ] Integrate with existing EnhancedMediaGallery
- [ ] Implement feature flag for gradual rollout
- [ ] Maintain fallback to iframe viewer
- [ ] Test in development environment

### **Testing & Quality**
- [ ] Test with various PDF types and sizes
- [ ] Verify authentication and CORS handling
- [ ] Check accessibility compliance
- [ ] Performance testing and optimization

### **Production Deployment**
- [ ] Bundle size analysis and optimization
- [ ] Production configuration updates
- [ ] Documentation updates
- [ ] Gradual rollout with feature flag

---

## Risk Mitigation

### **Technical Risks**
1. **Bundle Size Impact**: Monitor admin bundle size, implement code splitting
2. **Performance Issues**: Disable text/annotation layers, implement lazy loading
3. **Authentication Problems**: Test with Cloudflare R2 URLs and admin sessions
4. **Browser Compatibility**: Test across admin-used browsers

### **Rollback Plan**
1. **Immediate**: Toggle feature flag `NEXT_PUBLIC_ENHANCED_PDF=false`
2. **Code Rollback**: Revert to iframe implementation in git
3. **Dependency Cleanup**: Remove react-pdf packages if needed

### **Success Metrics**
- **Performance**: PDF load time < 3 seconds for documents < 5MB
- **UX**: Admin user feedback positive on preview experience  
- **Reliability**: < 1% error rate on PDF loading
- **Adoption**: Feature flag enabled in production without issues

---

## Post-Implementation Enhancements

### **Phase 6: Advanced Features (Future)**
- [ ] Text search within PDFs
- [ ] Page thumbnails sidebar
- [ ] Annotation support for admin notes
- [ ] Print optimization
- [ ] Batch PDF operations

### **Phase 7: Analytics & Monitoring**
- [ ] PDF usage analytics
- [ ] Performance monitoring dashboard
- [ ] Error tracking and alerts
- [ ] User experience metrics

---

This implementation plan ensures a systematic, low-risk approach to upgrading the PDF viewer while maintaining the stability of the admin interface.