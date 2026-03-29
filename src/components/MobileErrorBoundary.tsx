'use client';
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class MobileErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('[ERROR BOUNDARY] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR BOUNDARY] Component crashed:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Mobile-specific error logging
    if (typeof window !== 'undefined') {
      const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
      console.error(`[ERROR BOUNDARY] Mobile device: ${isMobile}`, {
        userAgent: navigator.userAgent,
        memory: (performance as any)?.memory,
        timestamp: new Date().toISOString()
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-red-600 text-xl font-bold mb-4">App Error</h2>
            <p className="text-gray-700 mb-4">
              The app encountered an error. Please reload the page.
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Reload App
            </button>
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer text-gray-500">Error Details</summary>
              <pre className="mt-2 overflow-auto text-gray-600">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MobileErrorBoundary;