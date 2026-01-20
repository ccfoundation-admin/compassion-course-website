import DOMPurify from 'dompurify';

/**
 * Safely render HTML content
 */
export const renderHTML = (html: string): { __html: string } => {
  return {
    __html: DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    }),
  };
};
