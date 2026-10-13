/**
 * Shared utility functions for DevPocket.
 * All operations are local; no network requests.
 */

/**
 * Safely copy text to clipboard with fallback.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (typeof text !== 'string') text = String(text ?? '');
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  // Fallback for non-secure contexts
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} durationMs
 */
export function showToast(message, type = 'info', durationMs = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  const remove = () => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  };

  setTimeout(remove, durationMs);

  toast.addEventListener('click', remove);
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} wait
 */
export function debounce(fn, wait = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Escape HTML to prevent XSS when inserting into DOM via innerHTML (prefer textContent).
 * @param {string} str
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Check if Web Crypto is available.
 */
export function hasWebCrypto() {
  return typeof crypto !== 'undefined' && crypto.subtle != null;
}

/**
 * Generate a cryptographically secure random UUID v4.
 * Falls back to Math.random if crypto.getRandomValues is unavailable.
 * @returns {string}
 */
export function generateUuidV4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Manual implementation using getRandomValues when available
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  // Set version (4) and variant (RFC 4122)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 * @param {string} message
 * @returns {Promise<string>} hex digest
 */
export async function sha256(message) {
  if (!hasWebCrypto()) {
    throw new Error('Web Crypto API is not available in this browser.');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Format a number with thousand separators.
 * @param {number} n
 */
export function formatNumber(n) {
  return new Intl.NumberFormat().format(n);
}

/**
 * Safely parse JSON and return { ok, value, error }.
 * @param {string} text
 */
export function safeJsonParse(text) {
  try {
    const value = JSON.parse(text);
    return { ok: true, value, error: null };
  } catch (err) {
    return { ok: false, value: null, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Pretty-print JSON with indentation.
 * @param {*} value
 * @param {number} space
 */
export function jsonStringify(value, space = 2) {
  return JSON.stringify(value, null, space);
}

/**
 * Minify JSON (no whitespace).
 * @param {*} value
 */
export function jsonMinify(value) {
  return JSON.stringify(value);
}
