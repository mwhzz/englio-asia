import https from 'node:https';
import fs from 'node:fs';

const credentials = JSON.parse(fs.readFileSync(new URL('../.card-autofill.local/tls.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
const page = new URL('../public/card-autofill.html', import.meta.url);

https.createServer({
  pfx: fs.readFileSync(new URL('../.card-autofill.local/localhost.pfx', import.meta.url)),
  passphrase: credentials.passphrase,
}, (request, response) => {
  // Serve only this test page. Never accept or log submitted card data.
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }
  if (!['/', '/card-autofill.html'].includes(request.url)) {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(request.method === 'HEAD' ? undefined : fs.readFileSync(page));
}).listen(5443, '127.0.0.1', () => {
  console.log('Card autofill test: https://localhost:5443/card-autofill.html');
}).on('error', (error) => {
  console.error(`Unable to start HTTPS server: ${error.message}`);
  process.exitCode = 1;
});
