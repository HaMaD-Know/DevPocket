/**
 * Base64 Text Encoder / Decoder with Unicode (UTF-8) support.
 * Uses native btoa/atob with proper Unicode handling.
 */

import { showToast, copyToClipboard } from '../utils.js';

/**
 * Encode a Unicode string to Base64 (UTF-8).
 * @param {string} str
 * @returns {string}
 */
export function encodeBase64(str) {
  // Convert to UTF-8 bytes then to binary string for btoa
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode a Base64 string to Unicode (UTF-8).
 * @param {string} b64
 * @returns {string}
 * @throws {Error}
 */
export function decodeBase64(b64) {
  // Clean whitespace
  const cleaned = b64.replace(/\s/g, '');
  let binary;
  try {
    binary = atob(cleaned);
  } catch {
    throw new Error('Invalid Base64 string.');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Decoded data is not valid UTF-8.');
  }
}

export function initBase64Tool(container) {
  const input = container.querySelector('#base64-input');
  const output = container.querySelector('#base64-output');
  const status = container.querySelector('#base64-status');
  const btnEncode = container.querySelector('#base64-encode');
  const btnDecode = container.querySelector('#base64-decode');
  const btnClear = container.querySelector('#base64-clear');
  const btnCopy = container.querySelector('#base64-copy');
  const btnSwap = container.querySelector('#base64-swap');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  btnEncode.addEventListener('click', () => {
    const text = input.value;
    if (text === '') {
      setStatus('Please enter text to encode.', 'warning');
      output.value = '';
      return;
    }
    try {
      output.value = encodeBase64(text);
      setStatus('Encoded successfully (UTF-8).', 'success');
    } catch (err) {
      setStatus(err.message || 'Encoding failed.', 'error');
      output.value = '';
    }
  });

  btnDecode.addEventListener('click', () => {
    const text = input.value;
    if (text === '') {
      setStatus('Please enter Base64 to decode.', 'warning');
      output.value = '';
      return;
    }
    try {
      output.value = decodeBase64(text);
      setStatus('Decoded successfully (UTF-8).', 'success');
    } catch (err) {
      setStatus(err.message || 'Decoding failed.', 'error');
      output.value = '';
    }
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    status.textContent = '';
    status.className = 'status-message';
    input.focus();
  });

  btnCopy.addEventListener('click', async () => {
    if (!output.value) {
      showToast('Nothing to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(output.value);
    showToast(ok ? 'Copied to clipboard.' : 'Copy failed.', ok ? 'success' : 'error');
  });

  btnSwap.addEventListener('click', () => {
    const tmp = input.value;
    input.value = output.value;
    output.value = tmp;
    status.textContent = '';
    status.className = 'status-message';
  });
}
