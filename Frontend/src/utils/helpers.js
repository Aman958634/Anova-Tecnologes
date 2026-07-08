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

  // If a VITE API URL is configured (useful for local development or custom deployments),
  // prefer it. Otherwise, on production hosts (like Vercel) use a proxied `/api` route
  // so the browser requests go to the same origin and Vercel's rewrites will forward them.
  const configuredApi = import.meta.env.VITE_API_URL;
  if (configuredApi) {
    let apiUrl = String(configuredApi).trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(apiUrl)) {
      apiUrl = `https://${apiUrl}`;
    }
    // If VITE_API_URL includes an /api suffix, strip it and join with path
    const backendUrl = apiUrl.replace(/\/api$/i, '');
    // If running in a browser and the current host is Vercel (or localhost for dev),
    // prefer the proxied relative `/uploads` path so the platform rewrite will
    // forward the request to the backend origin. This avoids CORB/CORS issues
    // caused by directly requesting cross-origin assets when a proxy is available.
    try {
      if (typeof window !== 'undefined') {
        const hostname = (window.location && window.location.hostname) || '';
        const isVercelHost = hostname.endsWith('.vercel.app');
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        if (isVercelHost || isLocal) {
          return path; // use relative path so rewrites/proxy handle the request
        }
      }
    } catch (e) {
      // ignore and fall back to absolute backend URL
    }

    return `${backendUrl}${path}`;
  }

  // Default: return the uploads path as-is (e.g. /uploads/filename). On production
  // we add a Vercel rewrite so requests to /uploads/* are forwarded to the backend
  // upload folder. This avoids embedding the backend hostname into the client.
  return path;
}

export function imageFallbackByKey(key) {
  const slug = String(key || 'technology').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return `https://images.unsplash.com/seed/${encodeURIComponent(slug)}/1200x800?auto=format&fit=crop&w=1200&q=80`;
}

// persistent image override helpers removed — previews will not persist after refresh

export function starsFromRating(rating = 5) {
  return Array.from({ length: 5 }, (_, index) => index < rating);
}
