const cache = new Map();

const CACHE_ENABLED = (() => {
  if (typeof process.env.ENABLE_APP_CACHE === 'string') {
    return process.env.ENABLE_APP_CACHE.trim().toLowerCase() === 'true';
  }
  // Default: keep cache enabled in local/dev and disabled in production to avoid stale cross-request data.
  return process.env.NODE_ENV !== 'production';
})();

function getCache(key) {
  if (!CACHE_ENABLED) return null;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key, value, ttlMs = 120000) {
  if (!CACHE_ENABLED) return value;
  if (!key) return;
  cache.set(key, {
    value,
    expires: Date.now() + ttlMs
  });
  return value;
}

function invalidateCache(prefix) {
  if (!CACHE_ENABLED) return;
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of [...cache.keys()]) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

module.exports = {
  getCache,
  setCache,
  invalidateCache
};
