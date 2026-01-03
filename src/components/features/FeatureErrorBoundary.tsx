// Error Boundary for AAA Features
// Catches errors in voice chat, analytics, and other browser API features

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.featureName}:`, error, errorInfo);
    
    // Track error in analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `${this.props.featureName}: ${error.message}`,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-metal-900/50 border border-metal-800 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {this.props.featureName} nicht verfügbar
            </h3>
            <p className="text-sm text-metal-400 mb-4">
              Dieses Feature benötigt moderne Browser-Unterstützung.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-rust-500 hover:bg-rust-400 text-white rounded-lg transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in features
export function useFeatureErrorHandler(featureName: string) {
  return (error: Error) => {
    console.error(`Error in ${featureName}:`, error);
    
    // Show user-friendly notification
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('featureError', {
        detail: { featureName, error: error.message }
      });
      window.dispatchEvent(event);
    }
  };
}
