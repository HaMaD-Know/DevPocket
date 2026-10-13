/**
 * JWT Decoder (header + payload only).
 * WARNING: Does NOT verify signature. Local only.
 */

import { showToast, copyToClipboard, escapeHtml } from '../utils.js';

/**
 * Decode a JWT without verification.
 * @param {string} token
 * @returns {{ header: object, payload: object, headerRaw: string, payloadRaw: string }}
 */
export function decodeJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length < 2 || parts.length > 3) {
    throw new Error('Invalid JWT format. Expected 2 or 3 parts separated by dots.');
  }

  function base64UrlDecode(str) {
    // Convert base64url to base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    let binary;
    try {
      binary = atob(base64);
    } catch {
      throw new Error('Invalid Base64URL encoding in token.');
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  let headerRaw, payloadRaw, header, payload;
  try {
    headerRaw = base64UrlDecode(parts[0]);
    header = JSON.parse(headerRaw);
  } catch (e) {
    throw new Error('Failed to decode/parse JWT header: ' + (e.message || e));
  }
  try {
    payloadRaw = base64UrlDecode(parts[1]);
    payload = JSON.parse(payloadRaw);
  } catch (e) {
    throw new Error('Failed to decode/parse JWT payload: ' + (e.message || e));
  }

  return { header, payload, headerRaw, payloadRaw };
}

export function initJwtTool(container) {
  const input = container.querySelector('#jwt-input');
  const headerOut = container.querySelector('#jwt-header');
  const payloadOut = container.querySelector('#jwt-payload');
  const status = container.querySelector('#jwt-status');
  const btnDecode = container.querySelector('#jwt-decode');
  const btnClear = container.querySelector('#jwt-clear');
  const btnCopyHeader = container.querySelector('#jwt-copy-header');
  const btnCopyPayload = container.querySelector('#jwt-copy-payload');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  function renderJson(el, obj) {
    el.textContent = JSON.stringify(obj, null, 2);
  }

  btnDecode.addEventListener('click', () => {
    const token = input.value.trim();
    if (!token) {
      setStatus('Please paste a JWT.', 'warning');
      headerOut.textContent = '';
      payloadOut.textContent = '';
      return;
    }
    try {
      const { header, payload } = decodeJwt(token);
      renderJson(headerOut, header);
      renderJson(payloadOut, payload);
      setStatus('Decoded locally. Signature is NOT verified.', 'success');
    } catch (err) {
      headerOut.textContent = '';
      payloadOut.textContent = '';
      setStatus(err.message || 'Decode failed.', 'error');
    }
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    headerOut.textContent = '';
    payloadOut.textContent = '';
    status.textContent = '';
    status.className = 'status-message';
    input.focus();
  });

  btnCopyHeader.addEventListener('click', async () => {
    if (!headerOut.textContent) {
      showToast('Nothing to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(headerOut.textContent);
    showToast(ok ? 'Header copied.' : 'Copy failed.', ok ? 'success' : 'error');
  });

  btnCopyPayload.addEventListener('click', async () => {
    if (!payloadOut.textContent) {
      showToast('Nothing to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(payloadOut.textContent);
    showToast(ok ? 'Payload copied.' : 'Copy failed.', ok ? 'success' : 'error');
  });
}
