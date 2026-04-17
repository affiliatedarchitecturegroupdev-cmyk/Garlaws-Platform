"use client";

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // Report error to monitoring service
  const errorObj = error instanceof Error ? error : new Error(String(error));

  if (typeof window !== 'undefined') {
    console.error('Application Error:', errorObj);
    // Send to error reporting service (Sentry, etc.)
    // reportError(errorObj);
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1f2833] rounded-xl border border-red-500/20 p-6 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-[#45a29e] mb-6">
          We encountered an unexpected error. Our team has been notified.
        </p>

        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] rounded-lg hover:border-[#45a29e]/40 transition-colors"
          >
            Go Home
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-[#45a29e] cursor-pointer mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-400 bg-[#0b0c10] p-3 rounded border overflow-auto">
              {errorObj.message}
              {errorObj.stack && `\n\n${errorObj.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  const logError = (error: unknown, errorInfo: React.ErrorInfo) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Send to error reporting service
    console.error('Global Error Boundary:', errorObj, errorInfo);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(errorObj, { contexts: { react: errorInfo } });
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Clear any error state and reload
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}