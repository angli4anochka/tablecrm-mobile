import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Включаем CORS для всех запросов
app.use(cors());

// Прокси для API TableCRM
app.use('/api', createProxyMiddleware({
  target: 'https://app.tablecrm.com',
  changeOrigin: true,
  secure: false,
  followRedirects: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying: ${req.method} ${req.url} -> ${proxyReq.path}`);
    proxyReq.setHeader('Accept', 'application/json');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response: ${proxyRes.statusCode} from ${req.url}`);
    console.log('Content-Type:', proxyRes.headers['content-type']);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests from http://localhost:${PORT}/api/* to https://app.tablecrm.com/api/*`);
});