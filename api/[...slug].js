import app from '../dist/index.mjs';

export default function handler(req, res) {
  if (typeof req.url === 'string' && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }
  return app(req, res);
}
