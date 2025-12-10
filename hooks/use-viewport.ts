/**
 * Custom hook for viewport detection
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect viewport width
 * @returns Object with viewport width and isMobile flag
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isMobile: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        isMobile: window.innerWidth < 768,
      });
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

