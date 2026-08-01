import React, { useState, useEffect } from 'react';

export function formatDate(dateValue) {
  if (!dateValue) return 'Fresh update';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateValue));
}

export function buildImageUrl(url, fallback = null) {
  const defaultImage = fallback || '/placeholder-image.svg';
  if (!url) return defaultImage;

  const trimmed = String(url).trim();

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes('imagekit.io') && !parsed.searchParams.has('tr')) {
        parsed.searchParams.set('tr', 'w-1400,q-80,f-auto');
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  let path = trimmed.replace(/\\+/g, '/');
  if (!path.startsWith('/')) path = `/${path}`;

  return path;
}

export function imageFallbackByKey() {
  return '/placeholder-image.svg';
}

export function starsFromRating(rating = 5) {
  return Array.from({ length: 5 }, (_, index) => index < rating);
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
