export function formatDate(dateValue) {
  if (!dateValue) return 'Fresh update';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateValue));
}

export function buildImageUrl(url, fallback = null) {
  const defaultImage = fallback || '/placeholder-image.svg';
  if (!url) return defaultImage;

  const trimmed = String(url).trim();

  // Absolute URLs (Cloudinary, CDN, external hosts) — pass through as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Legacy local paths (/uploads/...) — resolve against the backend API origin
  let path = trimmed.replace(/\\+/g, '/');
  if (!path.startsWith('/')) path = `/${path}`;

  const configuredApi = typeof import.meta.env.VITE_API_URL === 'string'
    ? import.meta.env.VITE_API_URL.trim()
    : '';
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
