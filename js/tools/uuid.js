/**
 * UUID v4 Generator using cryptographically secure randomness when available.
 */

import { generateUuidV4, showToast, copyToClipboard } from '../utils.js';

export function initUuidTool(container) {
  const output = container.querySelector('#uuid-output');
  const countInput = container.querySelector('#uuid-count');
  const btnGenerate = container.querySelector('#uuid-generate');
  const btnClear = container.querySelector('#uuid-clear');
  const btnCopy = container.querySelector('#uuid-copy');
  const status = container.querySelector('#uuid-status');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  btnGenerate.addEventListener('click', () => {
    let count = parseInt(countInput.value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 100) {
      count = 100;
      countInput.value = '100';
      setStatus('Maximum 100 UUIDs at once.', 'warning');
    } else {
      setStatus('');
    }

    const uuids = [];
    for (let i = 0; i < count; i++) {
      uuids.push(generateUuidV4());
    }
    output.value = uuids.join('\n');
    if (!status.textContent) {
      setStatus(`Generated ${count} UUID${count > 1 ? 's' : ''} (v4).`, 'success');
    }
  });

  btnClear.addEventListener('click', () => {
    output.value = '';
    status.textContent = '';
    status.className = 'status-message';
  });

  btnCopy.addEventListener('click', async () => {
    if (!output.value) {
      showToast('Nothing to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(output.value);
    showToast(ok ? 'Copied to clipboard.' : 'Copy failed.', ok ? 'success' : 'error');
  });

  // Generate one on init for convenience
  output.value = generateUuidV4();
  setStatus('A sample UUID is ready. Click Generate for more.', 'info');
}
