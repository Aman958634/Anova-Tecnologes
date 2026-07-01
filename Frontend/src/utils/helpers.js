export function formatDate(dateValue) {
  if (!dateValue) return 'Fresh update';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateValue));
}

export function buildImageUrl(url) {
  const defaultImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';
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

export function getImageOverride(resource, id) {
  try {
    const data = JSON.parse(localStorage.getItem('anova:image-overrides') || '{}');
    return data?.[resource]?.[String(id)] || null;
  } catch (e) {
    return null;
  }
}

export function setImageOverride(resource, id, url) {
  try {
    const key = 'anova:image-overrides';
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    data[resource] = data[resource] || {};
    data[resource][String(id)] = url;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function starsFromRating(rating = 5) {
  return Array.from({ length: 5 }, (_, index) => index < rating);
}
