/**
 * URL Encoder / Decoder.
 */

import { showToast, copyToClipboard } from '../utils.js';

export function initUrlTool(container) {
  const input = container.querySelector('#url-input');
  const output = container.querySelector('#url-output');
  const status = container.querySelector('#url-status');
  const btnEncode = container.querySelector('#url-encode');
  const btnDecode = container.querySelector('#url-decode');
  const btnClear = container.querySelector('#url-clear');
  const btnCopy = container.querySelector('#url-copy');
  const btnSwap = container.querySelector('#url-swap');
  const componentSelect = container.querySelector('#url-component');

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
      const mode = componentSelect.value;
      output.value = mode === 'component' ? encodeURIComponent(text) : encodeURI(text);
      setStatus(`Encoded with ${mode === 'component' ? 'encodeURIComponent' : 'encodeURI'}.`, 'success');
    } catch (err) {
      setStatus(err.message || 'Encoding failed.', 'error');
      output.value = '';
    }
  });

  btnDecode.addEventListener('click', () => {
    const text = input.value;
    if (text === '') {
      setStatus('Please enter text to decode.', 'warning');
      output.value = '';
      return;
    }
    try {
      const mode = componentSelect.value;
      output.value = mode === 'component' ? decodeURIComponent(text) : decodeURI(text);
      setStatus(`Decoded with ${mode === 'component' ? 'decodeURIComponent' : 'decodeURI'}.`, 'success');
    } catch (err) {
      setStatus(err.message || 'Decoding failed (malformed URI sequence).', 'error');
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
