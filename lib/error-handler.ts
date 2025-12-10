/**
 * Centralized error handling utilities
 * Provides standardized error objects and error handling functions
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  cause?: Error;
}

/**
 * Creates a standardized error object
 * @param message - Error message
 * @param code - Optional error code
 * @param statusCode - Optional HTTP status code
 * @param cause - Optional underlying error
 * @returns Standardized error object
 */
export function createError(
  message: string,
  code?: string,
  statusCode?: number,
  cause?: Error
): ErrorInfo {
  return {
    message,
    code,
    statusCode,
    cause,
  };
}

/**
 * Logs error to console in development
 * In production, this could be extended to send to error tracking service (Sentry, LogRocket, etc.)
 * @param error - Error to log
 * @param context - Optional context where error occurred
 */
export function logError(error: ErrorInfo | Error, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);
  }
  // In production, you could send to Sentry, LogRocket, etc.
}

/**
 * Gets user-friendly error message
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(error: ErrorInfo | Error): string {
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }
  return error.message || 'An unexpected error occurred';
}

/**
 * Type guard to check if error is a known error type
 * @param error - Unknown error value
 * @returns Boolean indicating if error matches ErrorInfo structure
 */
export function isKnownError(error: unknown): error is ErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorInfo).message === 'string'
  );
}

