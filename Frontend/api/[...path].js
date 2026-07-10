/**
 * Vercel Serverless Function: Proxy API requests to Render backend
 * Routes: /api/* → https://anova-tecnologes-backend.onrender.com/api/*
 */

const https = require('https');

const RAILWAY_BACKEND = 'https://anova-tecnologes-backend.onrender.com';

module.exports = async (req, res) => {
  try {
    // Extract path - Vercel passes [...path] as an array in req.query.path
    let pathArray = req.query.path || [];
    if (!Array.isArray(pathArray)) {
      pathArray = [pathArray];
    }
    
    const pathString = pathArray.join('/');
    
    // Build target URL with query string
    const queryString = Object.keys(req.query)
      .filter(key => key !== 'path')
      .map(key => `${key}=${encodeURIComponent(req.query[key])}`)
      .join('&');
    
    const queryPart = queryString ? `?${queryString}` : '';
    const targetUrl = `${RAILWAY_BACKEND}/api/${pathString}${queryPart}`;

    console.log(`[PROXY] ${req.method} /api/${pathString} → ${targetUrl}`);

    // Prepare request headers
    const headers = {
      'user-agent': req.headers['user-agent'] || 'Vercel-Proxy',
    };

    // Forward content-type for POST/PUT/PATCH
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }

    // Forward authorization header
    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'];
    }

    // Forward the request
    return new Promise((resolve) => {
      const proxyReq = https.request(targetUrl, {
        method: req.method,
        headers: headers,
      }, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
          data += chunk;
        });

        proxyRes.on('end', () => {
          // Set response status
          res.status(proxyRes.statusCode || 200);

          // Set proper content type
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          
          // Allow CORS for development
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');

          res.end(data);
          resolve();
        });
      });

      // Handle errors
      proxyReq.on('error', (error) => {
        console.error(`[PROXY ERROR] ${error.message}`, error);
        res.status(502).json({
          error: 'Bad Gateway',
          message: 'Failed to connect to backend',
          details: error.message,
        });
        resolve();
      });

      // Set timeout
      proxyReq.setTimeout(30000, () => {
        proxyReq.destroy();
        res.status(504).json({
          error: 'Gateway Timeout',
          message: 'Backend request timed out',
        });
        resolve();
      });

      // Forward request body for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (req.body) {
          const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
          proxyReq.write(bodyData);
        }
      }

      proxyReq.end();
    });
  } catch (error) {
    console.error('[PROXY EXCEPTION]', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
