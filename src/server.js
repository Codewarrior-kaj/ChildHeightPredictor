import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Rate limiting ─────────────────────────────────────────────
// Prevents abuse of your API key — 20 predictions per IP per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// ── Anthropic proxy ──────────────────────────────────────────
// Intercepts requests to /api/claude and forwards them to Anthropic,
// injecting the server-side API key. The browser never sees the key.
app.use(
  '/api/claude',
  limiter,
  createProxyMiddleware({
    target: 'https://api.anthropic.com',
    changeOrigin: true,
    pathRewrite: { '^/api/claude': '/v1/messages' },
    on: {
      proxyReq: (proxyReq) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set.');
          return;
        }
        // Inject auth headers server-side
        proxyReq.setHeader('x-api-key', apiKey);
        proxyReq.setHeader('anthropic-version', '2023-06-01');
        // Remove any key the client may have sent
        proxyReq.removeHeader('x-api-key-client');
      },
      error: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({ error: 'Failed to reach Anthropic API.' });
      },
    },
  })
);

// ── Serve frontend ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Warning: ANTHROPIC_API_KEY is not set. AI insights will not work.');
  }
});
