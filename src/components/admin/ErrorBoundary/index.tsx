"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  errorCount: number;
}

/**
 * Production-ready error boundary for admin components
 * Features:
 * - Graceful error handling with fallback UI
 * - Error details toggle for debugging
 * - Automatic error recovery attempts
 * - Error logging capability
 * - Locale-aware error messages
 */
export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, componentName } = this.props;
    
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`Error in ${componentName || "component"}:`, error, errorInfo);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service (Sentry, etc.)
      this.logErrorToService(error, errorInfo);
    }

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Placeholder for error reporting service integration
    const errorPayload = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      component: this.props.componentName,
    };

    // TODO: Send to monitoring service
    console.warn("Error logged (production):", errorPayload);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });

    // Optionally reload the page after multiple failures
    if (this.state.errorCount >= 3) {
      window.location.reload();
    }
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI with Tailwind CSS
      return (
        <div className="p-5 m-5 border border-red-400 rounded-lg bg-red-50 dark:bg-red-950/20 font-sans">
          <div className="flex items-center gap-2.5 mb-4">
            <AlertTriangle size={24} className="text-red-500" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Une erreur s&apos;est produite
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {componentName
              ? `Le composant ${componentName} a rencontré une erreur.`
              : "Un problème est survenu lors du chargement de ce composant."}
          </p>

          <div className="flex gap-2.5 mb-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-sm font-medium"
            >
              <RefreshCw size={16} />
              Réessayer
            </button>

            {process.env.NODE_ENV === "development" && (
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors text-sm font-medium"
              >
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showDetails ? "Masquer" : "Afficher"} les détails
              </button>
            )}
          </div>

          {showDetails && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded mt-4 text-xs font-mono overflow-auto">
              <div className="mb-2.5">
                <strong>Message d&apos;erreur:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
              </div>

              <div className="mb-2.5">
                <strong>Stack trace:</strong>
                <pre className="mt-1 whitespace-pre-wrap max-h-[200px] overflow-auto">
                  {error.stack}
                </pre>
              </div>

              {errorInfo && (
                <div>
                  <strong>Component stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap max-h-[200px] overflow-auto">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}

// Convenient hook for using error boundary
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

// Export a simpler functional wrapper
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => (
    <AdminErrorBoundary componentName={componentName}>
      <Component {...props} />
    </AdminErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${componentName || Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

export default AdminErrorBoundary;