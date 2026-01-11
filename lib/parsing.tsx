/**
 * Text parsing utilities
 */

import React from 'react';

/**
 * Converts URLs in text to clickable React elements
 * @param text - The text that may contain URLs
 * @returns Array of React nodes with URLs converted to links
 */
export function renderTextWithLinks(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Parses project description into structured data
 * @param description - Project description in format "Key1: Value1 | Key2: Value2"
 * @returns Object with parsed key-value pairs
 */
export function parseProjectDescription(description: string): Record<string, string> {
  const sections = description.split('|').map(section => section.trim());
  const parsed: Record<string, string> = {};
  
  sections.forEach(section => {
    const [key, ...valueParts] = section.split(':');
    if (key && valueParts.length > 0) {
      parsed[key.trim().toLowerCase()] = valueParts.join(':').trim();
    }
  });
  
  return parsed;
}



