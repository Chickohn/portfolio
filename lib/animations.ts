/**
 * Animation variants and utilities for Framer Motion
 */

import { AnimationVariants, StaggerContainerVariants } from '@/types';

/**
 * Scroll animation variants - fade in from bottom
 */
export const scrollAnimationVariants: AnimationVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

/**
 * Slide in from left animation variants
 */
export const slideInLeftVariants: AnimationVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

/**
 * Slide in from right animation variants
 */
export const slideInRightVariants: AnimationVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

/**
 * Scale in animation variants
 */
export const scaleInVariants: AnimationVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
};

/**
 * Stagger container for animating children sequentially
 */
export const staggerContainer: StaggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Hover lift animation variants
 */
export const hoverLiftVariants = {
  rest: { 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  },
  hover: { 
    y: -5,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
};

/**
 * Hover scale animation variants
 */
export const hoverScaleVariants = {
  rest: { 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" as const }
  },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
};

