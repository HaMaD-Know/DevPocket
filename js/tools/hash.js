/**
 * SHA-256 Hash Generator using Web Crypto API.
 */

import { sha256, hasWebCrypto, showToast, copyToClipboard } from '../utils.js';

export function initHashTool(container) {
  const input = container.querySelector('#hash-input');
  const output = container.querySelector('#hash-output');
  const status = container.querySelector('#hash-status');
  const btnHash = container.querySelector('#hash-generate');
  const btnClear = container.querySelector('#hash-clear');
  const btnCopy = container.querySelector('#hash-copy');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  if (!hasWebCrypto()) {
    setStatus('Web Crypto API is not available. SHA-256 cannot be computed.', 'error');
    btnHash.disabled = true;
  }

  btnHash.addEventListener('click', async () => {
    const text = input.value;
    if (text === '') {
      setStatus('Please enter text to hash.', 'warning');
      output.value = '';
      return;
    }
    btnHash.disabled = true;
    setStatus('Computing…', 'info');
    try {
      const digest = await sha256(text);
      output.value = digest;
      setStatus('SHA-256 computed successfully.', 'success');
    } catch (err) {
      output.value = '';
      setStatus(err.message || 'Hash failed.', 'error');
    } finally {
      btnHash.disabled = !hasWebCrypto();
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
}
