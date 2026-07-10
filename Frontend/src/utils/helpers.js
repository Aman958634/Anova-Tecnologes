export function formatDate(dateValue) {
  if (!dateValue) return 'Fresh update';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateValue));
}

export function buildImageUrl(url, fallback = null) {
  const defaultImage = fallback || '/placeholder-image.svg';
  if (!url) return defaultImage;
  // If already an absolute URL, return as-is
  if (typeof url === 'string' && url.trim().startsWith('http')) return url;

  // Normalize backslashes and ensure leading slash
  let path = String(url).replace(/\\+/g, '/').trim();
  if (!path.startsWith('/')) path = `/${path}`;

  // If a bare filename is stored in the DB (for example: image-1234.png),
  // assume it belongs under /uploads/ so the browser requests the correct path.
  if (/^\/[^\/]+\.[a-z0-9]{2,5}$/i.test(path) && !path.startsWith('/uploads/')) {
    path = `/uploads${path}`;
  }

  const configuredApi = typeof import.meta.env.VITE_API_URL === 'string' ? import.meta.env.VITE_API_URL.trim() : '';
  if (configuredApi && path.startsWith('/uploads/')) {
    if (/^https?:\/\//i.test(configuredApi)) {
      const backendUrl = configuredApi.replace(/\/+$/, '').replace(/\/api$/i, '');
      return `${backendUrl}${path}`;
    }
    return path;
  }

  return path;
}

export function imageFallbackByKey() {
  return '/placeholder-image.svg';
}

// persistent image override helpers removed — previews will not persist after refresh

export function starsFromRating(rating = 5) {
  return Array.from({ length: 5 }, (_, index) => index < rating);
}
