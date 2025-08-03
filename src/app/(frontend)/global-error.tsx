'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Phone } from 'lucide-react'
import { logger } from '@/utilities/logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log global error with structured logging and generate error ID
    const errorId = logger.error('Global error page displayed', error, {
      component: 'GlobalErrorPage',
      action: 'global_error',
      metadata: {
        digest: error.digest,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        type: 'global-error',
        timestamp: new Date().toISOString()
      }
    })
    
    // Store error ID for user support
    if (typeof window !== 'undefined') {
      ;(window as any).__hapa_error_id = errorId
    }
  }, [error])

  const handleRetry = () => {
    try {
      reset()
    } catch (retryError) {
      logger.error('Global error page retry failed', retryError as Error, {
        component: 'GlobalErrorPage',
        action: 'retry_failed',
        metadata: { originalError: error.message }
      })
      // Fallback to full page reload
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/fr'
    }
  }

  const handleReportError = () => {
    const errorId = typeof window !== 'undefined' ? (window as any).__hapa_error_id : 'N/A'
    const subject = encodeURIComponent(`Erreur critique HAPA - ${error.message}`)
    const body = encodeURIComponent(`
Une erreur critique s'est produite sur le site HAPA.

Message d'erreur: ${error.message}
Horodatage: ${new Date().toISOString()}
ID de l'erreur (support): ${errorId}
ID de l'erreur (système): ${error.digest || 'N/A'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}

Veuillez traiter cette erreur en priorité et inclure l'ID de l'erreur (support) dans votre investigation.
    `)
    
    if (typeof window !== 'undefined') {
      window.open(`mailto:support@hapa.mr?subject=${subject}&body=${body}`)
    }
  }

  return (
    <html lang="fr">
      <head>
        <title>Erreur système - HAPA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .error-container {
              max-width: 600px;
              width: 100%;
              background: white;
              border-radius: 12px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              padding: 40px;
              text-align: center;
            }
            
            .error-icon {
              width: 80px;
              height: 80px;
              background: #fee2e2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
            }
            
            .error-icon svg {
              width: 40px;
              height: 40px;
              color: #dc2626;
            }
            
            .error-title {
              font-size: 28px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 16px;
            }
            
            .error-description {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 32px;
              line-height: 1.6;
            }
            
            .button-group {
              display: flex;
              flex-direction: column;
              gap: 12px;
              align-items: center;
            }
            
            @media (min-width: 480px) {
              .button-group {
                flex-direction: row;
                justify-content: center;
              }
            }
            
            .button {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              text-decoration: none;
              font-size: 14px;
              border: none;
              cursor: pointer;
              transition: all 0.2s ease;
              min-width: 140px;
              justify-content: center;
            }
            
            .button-primary {
              background: #138B3A;
              color: white;
            }
            
            .button-primary:hover {
              background: #0F7A2E;
              transform: translateY(-1px);
            }
            
            .button-secondary {
              background: white;
              color: #374151;
              border: 1px solid #d1d5db;
            }
            
            .button-secondary:hover {
              background: #f9fafb;
              border-color: #9ca3af;
              transform: translateY(-1px);
            }
            
            .technical-details {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
              text-align: left;
            }
            
            .technical-details h3 {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 12px;
            }
            
            .technical-details pre {
              background: #f3f4f6;
              padding: 12px;
              border-radius: 6px;
              font-size: 12px;
              color: #6b7280;
              overflow-x: auto;
              white-space: pre-wrap;
            }
            
            .hapa-logo {
              color: #138B3A;
              font-weight: 700;
              font-size: 20px;
              margin-bottom: 20px;
            }
            
            .contact-info {
              margin-top: 24px;
              padding: 16px;
              background: #f0fdf4;
              border-radius: 8px;
              font-size: 14px;
              color: #166534;
            }
          `
        }} />
      </head>
      <body>
        <div className="error-container">
          <div className="hapa-logo">HAPA</div>
          
          <div className="error-icon">
            <AlertTriangle />
          </div>
          
          <h1 className="error-title">
            Erreur système critique
          </h1>
          
          <p className="error-description">
            Une erreur critique s&apos;est produite dans l&apos;application. 
            Nos équipes techniques ont été automatiquement informées 
            et travaillent à résoudre ce problème.
          </p>
          
          <div className="button-group">
            <button onClick={handleRetry} className="button button-primary">
              <RefreshCw width={16} height={16} />
              Réessayer
            </button>
            
            <button onClick={handleGoHome} className="button button-secondary">
              <Home width={16} height={16} />
              Page d&apos;accueil
            </button>
            
            <button onClick={handleReportError} className="button button-secondary">
              <Phone width={16} height={16} />
              Signaler
            </button>
          </div>
          
          <div className="contact-info">
            <strong>Support technique:</strong> support@hapa.mr | +222 45 25 25 25
          </div>
          
          <details className="technical-details">
            <summary style={{ cursor: 'pointer', marginBottom: '12px' }}>
              Détails techniques
            </summary>
            <pre>{JSON.stringify({
              message: error.message,
              digest: error.digest,
              timestamp: new Date().toISOString(),
              url: typeof window !== 'undefined' ? window.location.href : 'N/A'
            }, null, 2)}</pre>
          </details>
        </div>
      </body>
    </html>
  )
}