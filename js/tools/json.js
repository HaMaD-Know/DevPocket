/**
 * JSON Formatter, Validator, and Minifier.
 * All processing is local.
 */

import { safeJsonParse, jsonStringify, jsonMinify, showToast, copyToClipboard } from '../utils.js';

export function initJsonTool(container) {
  const input = container.querySelector('#json-input');
  const output = container.querySelector('#json-output');
  const status = container.querySelector('#json-status');
  const btnFormat = container.querySelector('#json-format');
  const btnMinify = container.querySelector('#json-minify');
  const btnValidate = container.querySelector('#json-validate');
  const btnClear = container.querySelector('#json-clear');
  const btnCopy = container.querySelector('#json-copy');
  const indentSelect = container.querySelector('#json-indent');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  function clearStatus() {
    status.textContent = '';
    status.className = 'status-message';
  }

  btnFormat.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      setStatus('Please enter some JSON.', 'warning');
      output.value = '';
      return;
    }
    const result = safeJsonParse(text);
    if (!result.ok) {
      setStatus(`Invalid JSON: ${result.error}`, 'error');
      output.value = '';
      return;
    }
    const space = parseInt(indentSelect.value, 10) || 2;
    output.value = jsonStringify(result.value, space);
    setStatus('JSON formatted successfully.', 'success');
  });

  btnMinify.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      setStatus('Please enter some JSON.', 'warning');
      output.value = '';
      return;
    }
    const result = safeJsonParse(text);
    if (!result.ok) {
      setStatus(`Invalid JSON: ${result.error}`, 'error');
      output.value = '';
      return;
    }
    output.value = jsonMinify(result.value);
    setStatus('JSON minified successfully.', 'success');
  });

  btnValidate.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      setStatus('Please enter some JSON.', 'warning');
      return;
    }
    const result = safeJsonParse(text);
    if (!result.ok) {
      setStatus(`Invalid JSON: ${result.error}`, 'error');
    } else {
      setStatus('Valid JSON.', 'success');
    }
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    clearStatus();
    input.focus();
  });

  btnCopy.addEventListener('click', async () => {
    const text = output.value;
    if (!text) {
      showToast('Nothing to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Copied to clipboard.' : 'Copy failed.', ok ? 'success' : 'error');
  });

  // Live validation on input (debounced feel via change)
  input.addEventListener('input', () => {
    if (!input.value.trim()) {
      clearStatus();
      return;
    }
  });
}
