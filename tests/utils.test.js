/**
 * Jest tests for core utilities (optional; requires npm install).
 * Prefer: npm test
 * Or pure runner: node tests/run-tests.js
 */

import { generateUuidV4, safeJsonParse, sha256, escapeHtml, jsonMinify } from '../js/utils.js';
import { encodeBase64, decodeBase64 } from '../js/tools/base64.js';
import { decodeJwt } from '../js/tools/jwt.js';
import { parseColor, rgbToHex } from '../js/tools/color.js';
import { testRegex } from '../js/tools/regex.js';

describe('UUID', () => {
  test('v4 format', () => {
    expect(generateUuidV4()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});

describe('JSON', () => {
  test('valid parse', () => {
    const r = safeJsonParse('{"ok":true}');
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ ok: true });
  });
  test('invalid parse', () => {
    expect(safeJsonParse('nope').ok).toBe(false);
  });
  test('minify', () => {
    expect(jsonMinify({ a: 1 })).toBe('{"a":1}');
  });
});

describe('Base64', () => {
  test('roundtrip unicode', () => {
    const s = 'こんにちは🌍';
    expect(decodeBase64(encodeBase64(s))).toBe(s);
  });
});

describe('SHA-256', () => {
  test('empty', async () => {
    await expect(sha256('')).resolves.toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });
});

describe('JWT', () => {
  test('decode', () => {
    const t =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.sig';
    const { header, payload } = decodeJwt(t);
    expect(header.alg).toBe('HS256');
    expect(payload.sub).toBe('123');
  });
});

describe('Color', () => {
  test('hex', () => {
    const c = parseColor('#0EA5E9');
    expect(c).toMatchObject({ r: 14, g: 165, b: 233 });
    expect(rgbToHex(14, 165, 233)).toBe('#0EA5E9');
  });
});

describe('Regex', () => {
  test('match', () => {
    const r = testRegex('a+', 'g', 'aaaba');
    expect(r.matches.length).toBe(2);
  });
  test('invalid', () => {
    expect(testRegex('(', '', 'x').error).toBeTruthy();
  });
});

describe('escapeHtml', () => {
  test('escapes', () => {
    expect(escapeHtml('<&>')).toBe('&lt;&amp;&gt;');
  });
});
