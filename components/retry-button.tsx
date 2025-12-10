/**
 * Retry Button Component
 * Reusable button for retrying failed operations
 * Provides consistent retry UI across error states
 */

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RetryButtonProps {
  /** Handler function called when button is clicked */
  onRetry: () => void;
  /** Button label (default: "Retry") */
  label?: string;
  /** Button variant style */
  variant?: 'default' | 'outline';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable retry button component
 * Includes refresh icon and customizable styling
 * @param props - Component props
 * @returns Retry button component
 */
export default function RetryButton({ 
  onRetry, 
  label = "Retry",
  variant = 'default',
  className
}: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      variant={variant}
      className={className}
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

