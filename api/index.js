import app from '../dist/index.mjs';

// Vercel serverless function handler
export default function handler(req, res) {
  if (typeof req.url === 'string' && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }
  return app(req, res);
}
