/**
 * Custom hook for scroll animations
 * Uses Intersection Observer API to detect when elements enter viewport
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook for scroll animations using Intersection Observer
 * Detects when an element with data-scroll-animation attribute enters viewport
 * @param threshold - Intersection threshold (0-1), default 0.1
 * @returns Boolean indicating if element is in view
 */
export function useScrollAnimation(threshold = 0.1): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    const element = document.querySelector('[data-scroll-animation]');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  return isInView;
}

