import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/utilities/logger'

interface PDFPreviewPageProps {
  params: Promise<{ id: string }>
}

export default async function PDFPreviewPage({ params }: PDFPreviewPageProps) {
  const { id } = await params
  
  try {
    // Initialize Payload
    const payload = await getPayload({ config })
    
    // Check authentication - this will throw if not authenticated
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })
    
    if (!user) {
      redirect('/admin/login')
    }

    // Fetch the media document
    const mediaDoc = await payload.findByID({
      collection: 'media',
      id,
    })

    // Validate that it's a PDF
    if (!mediaDoc || !mediaDoc.mimeType?.includes('pdf')) {
      notFound()
    }

    // Get the PDF URL
    const pdfUrl = typeof mediaDoc.url === 'string' ? mediaDoc.url : null
    
    if (!pdfUrl) {
      notFound()
    }

    const fileName = mediaDoc.filename || 'document.pdf'

    return (
      <div className="pdf-preview-container">
        <div className="pdf-header">
          <div className="pdf-header-left">
            <div className="pdf-icon-large">
              📄
            </div>
            <div className="pdf-info">
              <h1 className="pdf-title">{fileName}</h1>
              <div className="pdf-meta">
                <span className="pdf-badge">PDF Document</span>
                <span className="pdf-separator">•</span>
                <span className="pdf-source">HAPA Media Gallery</span>
              </div>
            </div>
          </div>
          <div className="pdf-actions">
            <a 
              href={pdfUrl} 
              download={fileName}
              className="download-btn"
            >
              <span className="btn-icon">⬇️</span>
              <span>Télécharger</span>
            </a>
            <button 
              onClick={() => window.close()}
              className="close-btn"
            >
              <span className="btn-icon">✕</span>
              <span>Fermer</span>
            </button>
          </div>
        </div>
        
        <div className="pdf-viewer">
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="pdf-object"
          >
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%"
            />
            <p>
              Your browser doesn&apos;t support PDF viewing. 
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Click here to download the PDF
              </a>
            </p>
          </object>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            .pdf-preview-container {
              width: 100vw;
              height: 100vh;
              display: flex;
              flex-direction: column;
              background: linear-gradient(135deg, var(--hapa-light, #f8f9fa) 0%, rgba(19, 139, 58, 0.03) 100%);
              font-family: var(--hapa-font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
            }
            
            .pdf-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1.5rem 2rem;
              background: white;
              border-bottom: 1px solid #e5e7eb;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            
            .pdf-header-left {
              display: flex;
              align-items: center;
              gap: 1rem;
            }
            
            .pdf-icon-large {
              font-size: 2.5rem;
              width: 64px;
              height: 64px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, rgba(19, 139, 58, 0.1) 0%, rgba(15, 122, 46, 0.15) 100%);
              border: 2px solid rgba(19, 139, 58, 0.3);
              border-radius: 1rem;
            }
            
            .pdf-info {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            }
            
            .pdf-title {
              margin: 0;
              font-size: 1.5rem;
              font-weight: 700;
              color: var(--hapa-text, #111827);
              line-height: 1.2;
            }
            
            .pdf-meta {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .pdf-badge {
              display: inline-flex;
              align-items: center;
              padding: 0.25rem 0.75rem;
              background: linear-gradient(135deg, var(--hapa-primary, #138b3a) 0%, var(--hapa-accent, #0f7a2e) 100%);
              color: white;
              font-size: 0.75rem;
              font-weight: 600;
              border-radius: 0.5rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .pdf-separator {
              color: #9ca3af;
              font-weight: 500;
            }
            
            .pdf-source {
              color: #6b7280;
              font-size: 0.875rem;
              font-weight: 500;
            }
            
            .pdf-actions {
              display: flex;
              gap: 0.75rem;
            }
            
            .download-btn, .close-btn {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1.25rem;
              border-radius: 0.75rem;
              font-size: 0.9rem;
              font-weight: 500;
              cursor: pointer;
              text-decoration: none;
              transition: all 0.2s ease;
              border: none;
            }
            
            .download-btn {
              background: linear-gradient(135deg, var(--hapa-primary, #138b3a) 0%, var(--hapa-accent, #0f7a2e) 100%);
              color: white;
              box-shadow: 0 2px 8px rgba(19, 139, 58, 0.25);
            }
            
            .download-btn:hover {
              background: linear-gradient(135deg, var(--hapa-accent, #0f7a2e) 0%, #0a5e24 100%);
              transform: translateY(-2px);
              box-shadow: 0 4px 16px rgba(19, 139, 58, 0.35);
            }
            
            .close-btn {
              background: white;
              color: #6b7280;
              border: 1px solid #d1d5db;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .close-btn:hover {
              background: #f9fafb;
              color: #374151;
              border-color: #9ca3af;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .btn-icon {
              font-size: 1rem;
            }
            
            .pdf-viewer {
              flex: 1;
              padding: 1.5rem;
              background: transparent;
            }
            
            .pdf-object {
              border-radius: 1rem;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
              background: white;
              border: 1px solid #e5e7eb;
            }
            
            @media (max-width: 768px) {
              .pdf-header {
                padding: 1rem;
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
              }
              
              .pdf-header-left {
                align-self: flex-start;
                gap: 0.75rem;
              }
              
              .pdf-icon-large {
                width: 48px;
                height: 48px;
                font-size: 1.75rem;
              }
              
              .pdf-title {
                font-size: 1.25rem;
              }
              
              .pdf-meta {
                flex-wrap: wrap;
                gap: 0.375rem;
              }
              
              .pdf-badge {
                font-size: 0.7rem;
                padding: 0.1875rem 0.5rem;
              }
              
              .pdf-source {
                font-size: 0.8rem;
              }
              
              .pdf-actions {
                width: 100%;
                justify-content: stretch;
                gap: 0.5rem;
              }
              
              .download-btn, .close-btn {
                flex: 1;
                justify-content: center;
                padding: 0.75rem 1rem;
                font-size: 0.85rem;
              }
              
              .pdf-viewer {
                padding: 0.75rem;
              }
            }
          `
        }} />
      </div>
    )
  } catch (error) {
    logger.error('PDF Preview Error', error, {
      component: 'PDFPreviewPage',
      action: 'pdf_preview_error',
      metadata: { 
        mediaId: (await params).id,
        route: '/admin/preview/pdf'
      }
    })
    notFound()
  }
}

export async function generateMetadata({ params }: PDFPreviewPageProps) {
  const { id } = await params
  
  try {
    const payload = await getPayload({ config })
    const mediaDoc = await payload.findByID({
      collection: 'media',  
      id,
    })

    return {
      title: `PDF Preview: ${mediaDoc?.filename || 'Document'}`,
      description: 'PDF Document Preview',
    }
  } catch {
    return {
      title: 'PDF Preview',
      description: 'PDF Document Preview',
    }
  }
}