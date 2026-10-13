/**
 * Unix Timestamp Converter.
 */

import { showToast, copyToClipboard, formatNumber } from '../utils.js';

export function initTimestampTool(container) {
  const nowDisplay = container.querySelector('#ts-now');
  const inputUnix = container.querySelector('#ts-unix');
  const inputDate = container.querySelector('#ts-date');
  const outputHuman = container.querySelector('#ts-human');
  const outputIso = container.querySelector('#ts-iso');
  const outputUnix = container.querySelector('#ts-unix-out');
  const status = container.querySelector('#ts-status');
  const btnToHuman = container.querySelector('#ts-to-human');
  const btnToUnix = container.querySelector('#ts-to-unix');
  const btnNow = container.querySelector('#ts-now-btn');
  const btnClear = container.querySelector('#ts-clear');
  const btnCopyHuman = container.querySelector('#ts-copy-human');
  const btnCopyIso = container.querySelector('#ts-copy-iso');
  const btnCopyUnix = container.querySelector('#ts-copy-unix');
  const unitSelect = container.querySelector('#ts-unit');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  function updateNow() {
    const now = Date.now();
    const sec = Math.floor(now / 1000);
    nowDisplay.textContent = `${formatNumber(sec)} (s) / ${formatNumber(now)} (ms)`;
  }

  // Live clock
  updateNow();
  setInterval(updateNow, 1000);

  btnNow.addEventListener('click', () => {
    const now = Date.now();
    const unit = unitSelect.value;
    inputUnix.value = unit === 'ms' ? String(now) : String(Math.floor(now / 1000));
    inputDate.value = '';
    convertFromUnix();
  });

  function convertFromUnix() {
    const raw = inputUnix.value.trim();
    if (!raw) {
      setStatus('Enter a Unix timestamp.', 'warning');
      return;
    }
    let num = Number(raw);
    if (!Number.isFinite(num)) {
      setStatus('Invalid number.', 'error');
      return;
    }
    const unit = unitSelect.value;
    // Heuristic: if value looks like ms (> 1e12) and unit is s, treat as ms
    if (unit === 's' && Math.abs(num) > 1e12) {
      num = Math.floor(num / 1000);
    } else if (unit === 'ms' && Math.abs(num) < 1e11) {
      // likely seconds provided as ms unit
      num = num * 1000;
    } else if (unit === 's') {
      num = num * 1000;
    }
    // now num is milliseconds
    const d = new Date(num);
    if (isNaN(d.getTime())) {
      setStatus('Timestamp out of range or invalid.', 'error');
      outputHuman.value = '';
      outputIso.value = '';
      outputUnix.value = '';
      return;
    }
    outputHuman.value = d.toString();
    outputIso.value = d.toISOString();
    outputUnix.value = String(Math.floor(d.getTime() / 1000));
    setStatus('Converted successfully.', 'success');
  }

  function convertFromDate() {
    const raw = inputDate.value.trim();
    if (!raw) {
      setStatus('Enter a date/time string or use the picker.', 'warning');
      return;
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      setStatus('Could not parse date string.', 'error');
      return;
    }
    outputHuman.value = d.toString();
    outputIso.value = d.toISOString();
    outputUnix.value = String(Math.floor(d.getTime() / 1000));
    inputUnix.value = unitSelect.value === 'ms' ? String(d.getTime()) : outputUnix.value;
    setStatus('Converted successfully.', 'success');
  }

  btnToHuman.addEventListener('click', convertFromUnix);
  btnToUnix.addEventListener('click', convertFromDate);

  // Also support Enter key
  inputUnix.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') convertFromUnix();
  });
  inputDate.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') convertFromDate();
  });

  btnClear.addEventListener('click', () => {
    inputUnix.value = '';
    inputDate.value = '';
    outputHuman.value = '';
    outputIso.value = '';
    outputUnix.value = '';
    status.textContent = '';
    status.className = 'status-message';
  });

  async function copyField(el) {
    if (!el.value) {
      showToast('Nothing to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(el.value);
    showToast(ok ? 'Copied.' : 'Copy failed.', ok ? 'success' : 'error');
  }

  btnCopyHuman.addEventListener('click', () => copyField(outputHuman));
  btnCopyIso.addEventListener('click', () => copyField(outputIso));
  btnCopyUnix.addEventListener('click', () => copyField(outputUnix));
}
