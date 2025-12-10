import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, FileQuestion } from 'lucide-react';

/**
 * Custom 404 page
 * Provides helpful navigation options when a page is not found
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <FileQuestion className="w-20 h-20 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
          <p className="text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Link href="/projects">
              <Search className="w-4 h-4 mr-2" />
              Browse Projects
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Popular pages:</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/projects" className="text-blue-400 hover:text-blue-300">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/skills" className="text-blue-400 hover:text-blue-300">
                Skills
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

