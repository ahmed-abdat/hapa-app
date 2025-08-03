'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { logger } from '@/utilities/logger'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Home, 
  RefreshCw, 
  HelpCircle, 
  Bug,
  ChevronDown,
  ChevronUp,
  Wifi,
  Globe,
  RotateCcw,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations()
  const locale = useLocale() as 'fr' | 'ar'
  const isRTL = locale === 'ar'
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  const [showDetails, setShowDetails] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(10)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we're on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Browser utility functions
  const reloadPage = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  const openUrl = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }, [])

  const copyCurrentUrl = useCallback(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert(locale === 'fr' ? 'URL copiée!' : 'تم نسخ الرابط!')
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert(locale === 'fr' ? 'URL copiée!' : 'تم نسخ الرابط!')
      })
    }
  }, [locale])

  const clearCacheAndReload = useCallback(() => {
    if (typeof window !== 'undefined') {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
        }).then(() => {
          reloadPage()
        }).catch(() => {
          reloadPage()
        })
      } else {
        reloadPage()
      }
    }
  }, [reloadPage])

  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      reset()
      setAutoRetryCountdown(10) // Reset countdown for potential next error
    } catch (retryError) {
      logger.error('Locale error page retry failed', retryError as Error, {
        component: 'LocaleErrorPage',
        action: 'retry_failed',
        metadata: { retryCount, locale, originalError: error.message }
      })
    } finally {
      setIsRetrying(false)
    }
  }, [reset, error.message, locale, retryCount])

  // Auto-retry countdown
  useEffect(() => {
    if (autoRetryCountdown > 0 && retryCount < 3) {
      const timer = setTimeout(() => {
        setAutoRetryCountdown(autoRetryCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (autoRetryCountdown === 0 && retryCount < 3) {
      handleRetry()
    }
  }, [autoRetryCountdown, retryCount, handleRetry])

  // Log error with structured logging and generate error ID
  useEffect(() => {
    const errorId = logger.error('Locale error page displayed', error, {
      component: 'LocaleErrorPage',
      action: 'error_displayed',
      metadata: {
        digest: error.digest,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        locale,
        retryCount,
        timestamp: new Date().toISOString()
      }
    })
    
    // Store error ID for user support
    if (typeof window !== 'undefined') {
      ;(window as any).__hapa_error_id = errorId
    }
  }, [error, locale, retryCount])

  const handleReportError = () => {
    const errorId = typeof window !== 'undefined' ? (window as any).__hapa_error_id : 'N/A'
    const subject = encodeURIComponent(`${t('errorReportIssue')} - ${error.message}`)
    const body = encodeURIComponent(`
${t('errorMessage')}: ${error.message}
${t('errorTimestamp')}: ${new Date().toISOString()}
${t('errorId')} (support): ${errorId}
${t('errorId')} (système): ${error.digest || 'N/A'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
${t('errorRetryAttempts')}: ${retryCount}
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}

${locale === 'fr' ? 'Veuillez inclure l\'ID de l\'erreur (support) dans votre demande.' : 'يرجى تضمين معرف الخطأ (الدعم) في طلبكم.'}
    `)
    
    if (typeof window !== 'undefined') {
      window.open(`mailto:support@hapa.mr?subject=${subject}&body=${body}`)
    }
  }

  const troubleshootingSteps = useMemo(() => [
    {
      icon: RefreshCw,
      title: t('errorRefreshPage'),
      description: t('errorRefreshPageDesc'),
      action: reloadPage
    },
    {
      icon: Wifi,
      title: t('errorCheckConnection'),
      description: t('errorCheckConnectionDesc'),
      action: () => openUrl('https://www.google.com')
    },
    {
      icon: RotateCcw,
      title: t('errorClearCache'),
      description: t('errorClearCacheDesc'),
      action: clearCacheAndReload
    },
    {
      icon: Globe,
      title: t('errorDifferentBrowser'),
      description: t('errorDifferentBrowserDesc'),
      action: copyCurrentUrl
    }
  ], [t, reloadPage, openUrl, clearCacheAndReload, copyCurrentUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5" >
      <div className="hapa-container section-spacing">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('errorOccurred')}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('errorDescription')}
              </p>
            </div>

            {/* Auto-retry countdown for limited attempts */}
            {retryCount < 3 && autoRetryCountdown > 0 && (
              <Card className="max-w-md mx-auto mb-8 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('errorAutoRetry', { seconds: autoRetryCountdown })}
                  </p>
                  <Button 
                    onClick={handleRetry} 
                    disabled={isRetrying}
                    className="w-full"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {t('loading')}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('errorRetryNow')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={handleRetry} 
                size="lg" 
                className="gap-2"
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    {t('errorTryAgain')}
                  </>
                )}
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/">
                  <Home className="w-5 h-5" />
                  {t('errorGoHome')}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* What Happened Section */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  {t('errorWhatHappened')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {t('errorWhatHappenedDesc')}
                </p>
                
                {retryCount > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>{t('errorRetryAttempts')}:</strong> {retryCount}/3
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What Can You Do Section */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-primary" />
                  {t('errorWhatCanYouDo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {t('errorWhatCanYouDoDesc')}
                </p>
                
                <div className="space-y-4">
                  {troubleshootingSteps.map((step, index) => {
                    const IconComponent = step.icon
                    return (
                      <div 
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={step.action}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1">
                            {step.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                        <ArrowIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details Section */}
          <Card className="mt-8">
            <CardHeader>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="flex items-center gap-3">
                  <Bug className="w-6 h-6 text-primary" />
                  {t('errorTechnicalDetails')}
                </CardTitle>
                {showDetails ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            
            {showDetails && (
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-sm">{t('errorMessage')}:</strong>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                      {error.message}
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-sm">{t('errorId')}:</strong>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                      {error.digest || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-sm">{t('errorTimestamp')}:</strong>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                      {new Date().toLocaleString(locale === 'fr' ? 'fr-FR' : 'ar-MA')}
                    </p>
                  </div>
                  
                  <div>
                    <strong className="text-sm">{t('errorRetryAttempts')}:</strong>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
                      {retryCount}/3
                    </p>
                  </div>
                </div>
                
                {error.stack && (
                  <div>
                    <strong className="text-sm">Stack Trace:</strong>
                    <pre className="text-xs text-muted-foreground bg-muted p-4 rounded mt-1 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Persistent Problem Section */}
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {t('errorPersistentProblem')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {t('errorPersistentProblemDesc')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleReportError} variant="outline" className="gap-2">
                  <Bug className="w-4 h-4" />
                  {t('errorReportIssue')}
                </Button>
                
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/contact">
                    <Mail className="w-4 h-4" />
                    {t('errorContactSupport')}
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="gap-2">
                  <a href="tel:+22245252525">
                    <Phone className="w-4 h-4" />
                    {locale === 'fr' ? 'Nous appeler' : 'اتصل بنا'}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}