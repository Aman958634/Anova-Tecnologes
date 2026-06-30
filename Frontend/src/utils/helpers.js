export function formatDate(dateValue) {
  if (!dateValue) return 'Fresh update';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateValue));
}

export function buildImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';
  if (url.startsWith('http')) return url;
  const apiUrl = import.meta.env.VITE_API_URL || 'https://anova-tecnologes-production.up.railway.app/api';
  const backendUrl = apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  return `${backendUrl}${url}`;
}

export function starsFromRating(rating = 5) {
  return Array.from({ length: 5 }, (_, index) => index < rating);
}
