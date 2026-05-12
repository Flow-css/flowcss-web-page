import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import http from 'node:http';

const host = '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const rootArg = process.argv[2] || '.';
const rootDir = resolve(process.cwd(), rootArg);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function sendNotFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

function sendMethodNotAllowed(response) {
  response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Method not allowed');
}

const server = http.createServer((request, response) => {
  if (!request.url || !['GET', 'HEAD'].includes(request.method || '')) {
    sendMethodNotAllowed(response);
    return;
  }

  const requestPath = request.url.split('?')[0];
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const safePath = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = resolve(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    sendNotFound(response);
    return;
  }

  let finalPath = filePath;
  if (existsSync(finalPath) && statSync(finalPath).isDirectory()) {
    finalPath = join(finalPath, 'index.html');
  }

  if (!existsSync(finalPath) || !statSync(finalPath).isFile()) {
    sendNotFound(response);
    return;
  }

  const contentType = mimeTypes[extname(finalPath)] || 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': contentType });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(finalPath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Serving ${rootDir} at http://${host}:${port}`);
});
