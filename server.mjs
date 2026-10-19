import { createHmac, randomUUID } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVICE_ROUTES = Object.freeze({
  '/backend/inventory': process.env.INVENTORY_SERVICE_URL ?? 'http://ca-nexa-inventory-wp',
  '/backend/orders': process.env.ORDER_SERVICE_URL ?? 'http://ca-nexa-order-wp',
  '/backend/suppliers': process.env.SUPPLIER_SERVICE_URL ?? 'http://ca-nexa-supplier-wp',
  '/backend/reporting': process.env.REPORTING_SERVICE_URL ?? 'http://ca-nexa-reporting-wp',
  '/backend/ai': process.env.AI_SERVICE_URL ?? 'http://ca-nexa-ai-wp'
});
const ISSUER = process.env.INTERNAL_JWT_ISSUER ?? 'nexasupply-portal';
const AUDIENCE = process.env.INTERNAL_JWT_AUDIENCE ?? 'nexasupply-internal-api';
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN ?? '';
const STATIC_ROOT = process.env.STATIC_ROOT ?? '/app/site';
const PORT = Number(process.env.PORT ?? 8080);
const DEFAULT_ROLES = parseRoles(process.env.NEXASUPPLY_DEFAULT_ROLES ?? 'REPORT_VIEWER');
const ROLE_BINDINGS = parseRoleBindings(process.env.NEXASUPPLY_ROLE_BINDINGS ?? '{}');
const SECRET = process.env.INTERNAL_JWT_SECRET
  ? Buffer.from(process.env.INTERNAL_JWT_SECRET, 'base64')
  : Buffer.alloc(0);

const MIME_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
});

function parseRoles(value) {
  return [...new Set(value.split(',').map(role => role.trim().toUpperCase()).filter(Boolean))];
}

function parseRoleBindings(value) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('NEXASUPPLY_ROLE_BINDINGS debe ser JSON valido');
  }
  return Object.fromEntries(Object.entries(parsed).map(([principal, roles]) => [
    principal,
    Array.isArray(roles) ? parseRoles(roles.join(',')) : parseRoles(String(roles))
  ]));
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parsePrincipal(request) {
  const encoded = request.headers['x-ms-client-principal'];
  const principalId = request.headers['x-ms-client-principal-id'];
  const identityProvider = request.headers['x-ms-client-principal-idp'];
  if (typeof encoded !== 'string' || typeof principalId !== 'string' || identityProvider !== 'github') return null;

  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    if (String(decoded.auth_typ).toLowerCase() !== 'github' || !Array.isArray(decoded.claims)) return null;
    const claims = Object.fromEntries(decoded.claims.map(claim => [String(claim.typ), String(claim.val)]));
    return {
      id: principalId,
      idp: 'github',
      name: String(request.headers['x-ms-client-principal-name'] ?? claims.name ?? principalId)
    };
  } catch {
    return null;
  }
}

function rolesFor(principal) {
  return ROLE_BINDINGS[principal.id] ?? DEFAULT_ROLES;
}

export function createInternalJwt(principal, roles, nowSeconds = Math.floor(Date.now() / 1000), secret = SECRET) {
  if (secret.length < 32) throw new Error('INTERNAL_JWT_SECRET debe contener al menos 32 bytes codificados en Base64');
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: ISSUER,
    aud: AUDIENCE,
    sub: principal.id,
    name: principal.name,
    idp: principal.idp,
    roles,
    iat: nowSeconds,
    nbf: nowSeconds - 5,
    exp: nowSeconds + 300,
    jti: randomUUID()
  }));
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function json(response, status, body) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff'
  });
  response.end(JSON.stringify(body));
}

function isAllowedWriteOrigin(request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method ?? 'GET')) return true;
  if (!PUBLIC_ORIGIN) return false;
  const origin = request.headers.origin;
  const referer = request.headers.referer;
  return origin === PUBLIC_ORIGIN || (typeof referer === 'string' && referer.startsWith(`${PUBLIC_ORIGIN}/`));
}

function proxy(request, response, routePrefix, target, principal) {
  if (!isAllowedWriteOrigin(request)) return json(response, 403, { error: 'INVALID_ORIGIN' });

  let jwt;
  try {
    jwt = createInternalJwt(principal, rolesFor(principal));
  } catch {
    return json(response, 503, { error: 'GATEWAY_SECURITY_NOT_CONFIGURED' });
  }

  const incoming = new URL(request.url ?? '/', 'http://portal.internal');
  const upstream = new URL(target);
  const upstreamPath = `${incoming.pathname.slice(routePrefix.length) || '/'}${incoming.search}`;
  const headers = {
    accept: request.headers.accept ?? 'application/json',
    authorization: `Bearer ${jwt}`,
    host: upstream.host,
    'x-correlation-id': String(request.headers['x-correlation-id'] ?? randomUUID())
  };
  if (request.headers['content-type']) headers['content-type'] = request.headers['content-type'];
  if (request.headers['content-length']) headers['content-length'] = request.headers['content-length'];

  const upstreamRequest = http.request({
    protocol: upstream.protocol,
    hostname: upstream.hostname,
    port: upstream.port || 80,
    method: request.method,
    path: upstreamPath,
    headers,
    timeout: 180_000
  }, upstreamResponse => {
    const responseHeaders = { ...upstreamResponse.headers };
    delete responseHeaders['set-cookie'];
    responseHeaders['cache-control'] = 'no-store';
    response.writeHead(upstreamResponse.statusCode ?? 502, responseHeaders);
    upstreamResponse.pipe(response);
  });
  upstreamRequest.on('timeout', () => upstreamRequest.destroy(new Error('upstream timeout')));
  upstreamRequest.on('error', () => {
    if (!response.headersSent) json(response, 502, { error: 'UPSTREAM_UNAVAILABLE' });
    else response.destroy();
  });
  request.pipe(upstreamRequest);
}

function serveStatic(request, response) {
  const url = new URL(request.url ?? '/', 'http://portal.internal');
  let relative = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
  if (relative === '/' || !extname(relative)) relative = '/index.html';
  let file = join(STATIC_ROOT, relative);
  if (!file.startsWith(`${STATIC_ROOT}/`) || !existsSync(file) || !statSync(file).isFile()) file = join(STATIC_ROOT, 'index.html');
  if (!existsSync(file)) return json(response, 404, { error: 'NOT_FOUND' });
  response.writeHead(200, {
    'cache-control': extname(file) === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
    'content-security-policy': "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'",
    'content-type': MIME_TYPES[extname(file)] ?? 'application/octet-stream',
    'referrer-policy': 'same-origin',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY'
  });
  createReadStream(file).pipe(response);
}

export function createServer() {
  return http.createServer((request, response) => {
    if (request.url === '/healthz') return json(response, 200, { status: 'UP' });
    const principal = parsePrincipal(request);
    if (!principal) return json(response, 401, { error: 'AUTHENTICATION_REQUIRED' });
    if (request.url === '/backend/session') {
      return json(response, 200, { id: principal.id, idp: principal.idp, name: principal.name, roles: rolesFor(principal) });
    }
    const route = Object.entries(SERVICE_ROUTES).find(([prefix]) => request.url === prefix || request.url?.startsWith(`${prefix}/`) || request.url?.startsWith(`${prefix}?`));
    if (route) return proxy(request, response, route[0], route[1], principal);
    return serveStatic(request, response);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (SECRET.length < 32) throw new Error('INTERNAL_JWT_SECRET no esta configurado correctamente');
  createServer().listen(PORT, '0.0.0.0', () => console.log(`NexaSupply portal listening on port ${PORT}`));
}
