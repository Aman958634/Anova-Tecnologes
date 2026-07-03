export function formatDate(dateValue) {
  if (!dateValue) return 'Fresh update';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateValue));
}

export function buildImageUrl(url, fallback = null) {
  const defaultImage = fallback || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';
  if (!url) return defaultImage;
  // If already an absolute URL, return as-is
  if (typeof url === 'string' && url.trim().startsWith('http')) return url;

  // Normalize backslashes and ensure leading slash
  let path = String(url).replace(/\\+/g, '/').trim();
  if (!path.startsWith('/')) path = `/${path}`;

  const apiUrl = import.meta.env.VITE_API_URL || 'https://anova-tecnologes-production.up.railway.app/api';
  const backendUrl = String(apiUrl).replace(/\/+$/, '').replace(/\/api$/, '');
  return `${backendUrl}${path}`;
}

export function imageFallbackByKey(key) {
  const slug = String(key || 'technology').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return `https://images.unsplash.com/seed/${encodeURIComponent(slug)}/1200x800?auto=format&fit=crop&w=1200&q=80`;
}

// persistent image override helpers removed — previews will not persist after refresh

export function starsFromRating(rating = 5) {
  return Array.from({ length: 5 }, (_, index) => index < rating);
}
