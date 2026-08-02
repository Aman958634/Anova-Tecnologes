const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 300);
const LOGIN_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const LOGIN_MAX_REQUESTS = Number(process.env.LOGIN_RATE_LIMIT_MAX || 12);
const CONTACT_WINDOW_MS = Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const CONTACT_MAX_REQUESTS = Number(process.env.CONTACT_RATE_LIMIT_MAX || 6);

const stores = {
  api: new Map(),
  auth: new Map(),
  contact: new Map(),
};

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function hitStore(store, key, windowMs, maxRequests) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  current.count += 1;
  if (current.count > maxRequests) {
    return { limited: true, remaining: 0, resetAt: current.resetAt };
  }

  return { limited: false, remaining: Math.max(maxRequests - current.count, 0), resetAt: current.resetAt };
}

function setRateLimitHeaders(res, limit, remaining, resetAt) {
  res.setHeader('RateLimit-Limit', String(limit));
  res.setHeader('RateLimit-Remaining', String(remaining));
  res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
}

function apiRateLimit(req, res, next) {
  const key = `${getClientIp(req)}:${req.path}`;
  const { limited, remaining, resetAt } = hitStore(stores.api, key, WINDOW_MS, MAX_REQUESTS);
  setRateLimitHeaders(res, MAX_REQUESTS, remaining, resetAt);

  if (limited) {
    const retryAfter = Math.max(Math.ceil((resetAt - Date.now()) / 1000), 1);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }

  next();
}

function authRateLimit(req, res, next) {
  const key = getClientIp(req);
  const { limited, remaining, resetAt } = hitStore(stores.auth, key, LOGIN_WINDOW_MS, LOGIN_MAX_REQUESTS);
  setRateLimitHeaders(res, LOGIN_MAX_REQUESTS, remaining, resetAt);

  if (limited) {
    const retryAfter = Math.max(Math.ceil((resetAt - Date.now()) / 1000), 1);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Try again later.'
    });
  }

  next();
}

function contactRateLimit(req, res, next) {
  const key = getClientIp(req);
  const { limited, remaining, resetAt } = hitStore(stores.contact, key, CONTACT_WINDOW_MS, CONTACT_MAX_REQUESTS);
  setRateLimitHeaders(res, CONTACT_MAX_REQUESTS, remaining, resetAt);

  if (limited) {
    const retryAfter = Math.max(Math.ceil((resetAt - Date.now()) / 1000), 1);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Too many contact submissions. Please try again later.'
    });
  }

  next();
}

module.exports = {
  apiRateLimit,
  authRateLimit,
  contactRateLimit,
};