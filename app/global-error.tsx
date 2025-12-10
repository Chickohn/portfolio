'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary component
 * Catches errors that occur in the root layout
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global application error:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-black">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Application Error</h1>
              <p className="text-gray-400 mb-4">
                A critical error occurred. Please refresh the page.
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mb-4">Error ID: {error.digest}</p>
              )}
            </div>

            <Button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload page
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="text-gray-400 cursor-pointer text-sm mb-2">
                  Error details (development only)
                </summary>
                <pre className="text-xs text-gray-500 bg-gray-900 p-4 rounded overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

