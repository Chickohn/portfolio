'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

interface ProjectErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for project detail pages
 * Provides project-specific error handling and recovery
 */
export default function ProjectError({ error, reset }: ProjectErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Project page error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Failed to load project</h1>
          <p className="text-gray-400 mb-4">
            We couldn't load the project details. This might be a temporary issue.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mb-4">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

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
  );
}

