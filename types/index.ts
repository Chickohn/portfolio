/**
 * Shared type definitions for the portfolio application
 */

/**
 * Skill level type for skill bars
 */
export interface Skill {
  name: string;
  level: number;
  icon: string;
  description: string;
}

/**
 * Skill category type
 */
export interface SkillCategory {
  title: string;
  description: string;
  color: string;
  skills: Skill[];
}

/**
 * Project item type for project listings
 */
export interface ProjectItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  external: boolean;
  link?: string;
}

/**
 * Project category type
 */
export interface ProjectCategory {
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ProjectItem[];
}

/**
 * Category configuration type
 */
export interface CategoryConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * React component type for icons
 */
export type IconComponent = React.ComponentType<{ className?: string }>;

/**
 * Animation variant types
 * Compatible with framer-motion Variants
 */
export interface AnimationVariants {
  hidden: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  visible: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    transition?: {
      duration: number;
      ease?: string;
    };
  };
  [key: string]: any; // Allow additional properties for framer-motion compatibility
}

/**
 * Stagger container variant type
 * Compatible with framer-motion Variants
 */
export interface StaggerContainerVariants {
  hidden: {
    opacity: number;
  };
  visible: {
    opacity: number;
    transition: {
      staggerChildren: number;
    };
  };
  [key: string]: any; // Allow additional properties for framer-motion compatibility
}

