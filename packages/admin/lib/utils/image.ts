/**
 * Convert relative URLs to absolute for Next.js Image component
 * @param url - Image URL (relative or absolute)
 * @returns Absolute URL
 */
export function getAbsoluteImageUrl(url: string): string {
  if (!url) return '';

  // Already absolute or base64
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }

  // Relative URL - make it absolute for current domain
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url}`;
  }

  // Fallback for SSR (shouldn't happen with client components)
  return url;
}

/**
 * Convert image URL to base64 string
 * @param url - Image URL to convert
 * @returns Promise with base64 string
 */
export async function urlToBase64(url: string): Promise<string> {
  // If already base64, return as is
  if (url.startsWith('data:')) {
    return url;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      try {
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
