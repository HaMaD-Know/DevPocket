/**
 * Lightweight pure-Node test runner for DevPocket utilities.
 * Run with: node tests/run-tests.js
 * Does not require external dependencies.
 */

import { strict as assert } from 'node:assert';
import { webcrypto } from 'node:crypto';

// Polyfill Web Crypto for Node if needed
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = await import('node:util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// Minimal btoa/atob for Node
if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
  globalThis.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}

// Dynamic import of modules under test
const utils = await import('../js/utils.js');
const base64 = await import('../js/tools/base64.js');
const jwt = await import('../js/tools/jwt.js');
const color = await import('../js/tools/color.js');
const regex = await import('../js/tools/regex.js');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, err });
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, err });
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
  }
}

console.log('\nDevPocket Unit Tests\n');

// --- utils ---
console.log('utils.js');
test('generateUuidV4 returns valid v4 format', () => {
  const id = utils.generateUuidV4();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('generateUuidV4 produces unique values', () => {
  const set = new Set();
  for (let i = 0; i < 50; i++) set.add(utils.generateUuidV4());
  assert.equal(set.size, 50);
});

test('safeJsonParse valid', () => {
  const r = utils.safeJsonParse('{"a":1}');
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { a: 1 });
});

test('safeJsonParse invalid', () => {
  const r = utils.safeJsonParse('{bad');
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test('jsonStringify / minify', () => {
  const obj = { b: 2, a: 1 };
  assert.equal(utils.jsonMinify(obj), '{"b":2,"a":1}');
  assert.ok(utils.jsonStringify(obj, 2).includes('\n'));
});

test('escapeHtml', () => {
  assert.equal(utils.escapeHtml('<script>"&\'</script>'), '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
});

await testAsync('sha256 of empty string', async () => {
  const h = await utils.sha256('');
  assert.equal(h, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

await testAsync('sha256 of "hello"', async () => {
  const h = await utils.sha256('hello');
  assert.equal(h, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
});

// --- base64 ---
console.log('\nbase64.js');
test('encode/decode roundtrip ASCII', () => {
  const s = 'Hello, World!';
  assert.equal(base64.decodeBase64(base64.encodeBase64(s)), s);
});

test('encode/decode Unicode', () => {
  const s = 'こんにちは 🌍 café';
  assert.equal(base64.decodeBase64(base64.encodeBase64(s)), s);
});

test('encode empty', () => {
  assert.equal(base64.encodeBase64(''), '');
});

test('decode invalid throws', () => {
  assert.throws(() => base64.decodeBase64('!!!notbase64!!!'));
});

// --- jwt ---
console.log('\njwt.js');
test('decode valid JWT structure', () => {
  // header: {"alg":"HS256","typ":"JWT"} payload: {"sub":"123","name":"John"}
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiJ9.signature';
  const { header, payload } = jwt.decodeJwt(token);
  assert.equal(header.alg, 'HS256');
  assert.equal(header.typ, 'JWT');
  assert.equal(payload.sub, '123');
  assert.equal(payload.name, 'John');
});

test('decode invalid format throws', () => {
  assert.throws(() => jwt.decodeJwt('not.a.jwt.enough.parts'));
  assert.throws(() => jwt.decodeJwt('onlyonepart'));
});

// --- color ---
console.log('\ncolor.js');
test('parse HEX #RGB', () => {
  const c = color.parseColor('#0ea');
  assert.equal(c.r, 0);
  assert.equal(c.g, 238);
  assert.equal(c.b, 170);
});

test('parse HEX #RRGGBB', () => {
  const c = color.parseColor('#0EA5E9');
  assert.equal(c.r, 14);
  assert.equal(c.g, 165);
  assert.equal(c.b, 233);
  assert.equal(c.a, 1);
});

test('parse rgb()', () => {
  const c = color.parseColor('rgb(14, 165, 233)');
  assert.equal(c.r, 14);
  assert.equal(c.g, 165);
  assert.equal(c.b, 233);
});

test('rgbToHex', () => {
  assert.equal(color.rgbToHex(14, 165, 233), '#0EA5E9');
});

test('rgbToHsl approx', () => {
  const { h, s, l } = color.rgbToHsl(14, 165, 233);
  assert.ok(h > 195 && h < 205);
  assert.ok(s > 80);
  assert.ok(l > 40 && l < 55);
});

test('invalid color throws', () => {
  assert.throws(() => color.parseColor('not-a-color'));
});

// --- regex ---
console.log('\nregex.js');
test('simple match', () => {
  const r = regex.testRegex('\\d+', 'g', 'a1b22c');
  assert.equal(r.error, null);
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '1');
  assert.equal(r.matches[1].match, '22');
});

test('invalid pattern', () => {
  const r = regex.testRegex('[', '', 'test');
  assert.ok(r.error);
  assert.equal(r.matches.length, 0);
});

test('no match', () => {
  const r = regex.testRegex('xyz', 'g', 'abc');
  assert.equal(r.matches.length, 0);
  assert.equal(r.error, null);
});

// Summary
console.log('\n────────────────────────────────');
console.log(`Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  - ${f.name}: ${f.err.message}`));
  process.exit(1);
}
console.log('All tests passed.\n');
process.exit(0);
