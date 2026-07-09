/**
 * Vercel Serverless Function: Proxy API requests to Railway backend
 * Routes: /api/* → https://anova-tecnologes-production.railway.app/api/*
 */

import http from 'http';
import https from 'https';

const RAILWAY_BACKEND = 'https://anova-tecnologes-production.railway.app';

export default function handler(req, res) {
  const { path = [] } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path;
  const targetUrl = `${RAILWAY_BACKEND}/api/${pathString}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

  console.log(`[PROXY] ${req.method} /api/${pathString} → ${targetUrl}`);

  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      host: new URL(RAILWAY_BACKEND).hostname,
    },
  };

  // Remove headers that shouldn't be forwarded
  delete options.headers['x-forwarded-for'];
  delete options.headers['x-forwarded-proto'];
  delete options.headers['x-forwarded-host'];

  return new Promise((resolve) => {
    const proxyReq = https.request(targetUrl, options, (proxyRes) => {
      let data = '';

      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        res.status(proxyRes.statusCode || 200);

        // Copy headers from backend
        Object.entries(proxyRes.headers).forEach(([key, value]) => {
          if (!['transfer-encoding', 'content-encoding'].includes(key)) {
            res.setHeader(key, value);
          }
        });

        res.end(data);
        resolve();
      });
    });

    proxyReq.on('error', (error) => {
      console.error(`[PROXY ERROR] ${error.message}`);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to connect to backend',
        details: error.message,
      });
      resolve();
    });

    // Forward request body for POST/PUT/PATCH requests
    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      proxyReq.write(bodyData);
    }

    proxyReq.end();
  });
}
