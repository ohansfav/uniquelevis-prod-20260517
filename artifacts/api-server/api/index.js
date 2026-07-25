import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

// Minimal in-memory store for signup/login (temporary workaround)
const users = new Map();
const challenges = new Map();
const tokens = new Map();

// Helper: create JWT-like token (simplified for now)
function createToken(userId) {
  const token = randomUUID();
  tokens.set(token, { userId, createdAt: Date.now() });
  return token;
}

// Helper: validate token
function validateToken(token) {
  const record = tokens.get(token);
  if (!record || Date.now() - record.createdAt > 24 * 60 * 60 * 1000) {
    return null;
  }
  return record.userId;
}

// Vercel serverless function handler (minimal implementation)
export default async function handler(req, res) {
  const pathname = new URL(`http://localhost${req.url}`).pathname;
  const method = req.method || 'GET';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/health
  if (pathname === '/api/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }));
    return;
  }

  // GET /api/auth/human-check
  if (pathname === '/api/auth/human-check' && method === 'GET') {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const mode = Math.random() > 0.5 ? 'add' : 'sub';
    const challengeId = randomUUID();
    const prompt = mode === 'add' ? `${a} + ${b} = ?` : `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
    const answer = mode === 'add' ? String(a + b) : String(Math.max(a, b) - Math.min(a, b));

    challenges.set(challengeId, { answer, expiresAt: Date.now() + 5 * 60 * 1000 });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ challengeId, prompt }));
    return;
  }

  // POST /api/auth/signup
  if (pathname === '/api/auth/signup' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const email = (data.email || '').toLowerCase().trim();
        const password = data.password || '';

        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email and password required' }));
          return;
        }

        if (users.has(email)) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email already in use' }));
          return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = randomUUID();
        const user = {
          id: userId,
          email,
          passwordHash,
          firstName: data.firstName || 'User',
          age: data.age || 25,
          city: data.city || '',
          bio: data.bio || '',
          verified: false,
          membershipTier: 'free',
        };

        users.set(email, user);

        const accessToken = createToken(userId);
        const refreshToken = createToken(userId);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          user: { id: user.id, email: user.email, firstName: user.firstName, age: user.age, city: user.city },
          accessToken,
          refreshToken,
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid request' }));
      }
    });
    return;
  }

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const email = (data.email || '').toLowerCase().trim();
        const password = data.password || '';

        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email and password required' }));
          return;
        }

        const user = users.get(email);
        if (!user) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
          return;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
          return;
        }

        const accessToken = createToken(user.id);
        const refreshToken = createToken(user.id);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          user: { id: user.id, email: user.email, firstName: user.firstName, age: user.age, city: user.city },
          accessToken,
          refreshToken,
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid request' }));
      }
    });
    return;
  }

  // Default: 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not found' }));
}
