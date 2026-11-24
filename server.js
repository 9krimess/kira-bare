const http = require('http');
const { createBareServer } = require('@tomphttp/bare-server-node');

const bare = createBareServer('/bare/');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  console.log('Incoming:', req.method, req.url);

  if (bare.shouldRoute(req)) {
    try {
      bare.routeRequest(req, res);
    } catch (err) {
      console.error('Bare route error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Bare error: ' + err.message);
      }
    }
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('kira bare server is alive');
});

// Keep-alive tuning — reduces "too many keep-alive connections" errors
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Bare server listening on port ' + PORT);
});