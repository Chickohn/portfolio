/**
 * Custom hook for keyboard shortcuts
 */

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
}

/**
 * Custom hook to handle keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, shiftKey, altKey, handler }) => {
        const keyMatches = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatches = ctrlKey === undefined || event.ctrlKey === ctrlKey;
        const shiftMatches = shiftKey === undefined || event.shiftKey === shiftKey;
        const altMatches = altKey === undefined || event.altKey === altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          // Don't trigger if user is typing in an input
          const target = event.target as HTMLElement;
          if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
          ) {
            return;
          }

          event.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

