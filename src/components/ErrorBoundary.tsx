'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import Link from 'next/link'
import { captureError } from '@/lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log to error tracking service (Sentry or console fallback)
    captureError(error, { extra: { componentStack: errorInfo.componentStack } })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-metal-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-metal-400 mb-6">
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-metal-900 border border-red-500/30 rounded-lg text-left">
                <p className="text-red-400 font-mono text-sm mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-metal-500 text-xs overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Erneut versuchen
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-metal-800 hover:bg-metal-700 text-white font-bold rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                Zur Startseite
              </Link>
            </div>

            {/* Report Bug */}
            <div className="mt-8 pt-6 border-t border-metal-800">
              <Link
                href="/contact?reason=bug"
                className="inline-flex items-center gap-2 text-metal-500 hover:text-metal-300 text-sm transition-colors"
              >
                <Bug className="w-4 h-4" />
                Fehler melden
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const handleError = (error: Error) => {
    console.error('Error caught by useErrorHandler:', error)
    // Could trigger a state update or notification here
  }

  return { handleError }
}

// Simple error fallback component
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error?: Error
  resetErrorBoundary?: () => void 
}) {
  return (
    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-red-400 mb-1">Fehler beim Laden</h3>
          <p className="text-metal-400 text-sm mb-3">
            {error?.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
          </p>
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="text-sm text-red-400 hover:text-red-300 underline"
            >
              Erneut versuchen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
