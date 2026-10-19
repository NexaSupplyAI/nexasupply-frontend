import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { createInternalJwt } from './server.mjs';

test('creates a short-lived signed JWT with server-side roles', () => {
  const secret = Buffer.alloc(32, 7);
  const token = createInternalJwt({ id: 'github-123', name: 'test-user', idp: 'github' }, ['REPORT_VIEWER'], 1000, secret);
  const [header, payload, signature] = token.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(header, 'base64url')), { alg: 'HS256', typ: 'JWT' });
  const claims = JSON.parse(Buffer.from(payload, 'base64url'));
  assert.equal(claims.sub, 'github-123');
  assert.equal(claims.exp - claims.iat, 300);
  assert.deepEqual(claims.roles, ['REPORT_VIEWER']);
  assert.equal(signature, createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url'));
});

test('rejects weak signing keys', () => {
  assert.throws(() => createInternalJwt({ id: '1', name: 'u', idp: 'github' }, [], 1000, Buffer.alloc(16)), /32 bytes/);
});
