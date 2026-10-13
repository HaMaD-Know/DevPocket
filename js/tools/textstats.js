/**
 * Text Character, Word, and Line Counter.
 */

import { formatNumber } from '../utils.js';

export function initTextStatsTool(container) {
  const input = container.querySelector('#text-input');
  const charsEl = container.querySelector('#stat-chars');
  const charsNoSpaceEl = container.querySelector('#stat-chars-nospace');
  const wordsEl = container.querySelector('#stat-words');
  const linesEl = container.querySelector('#stat-lines');
  const bytesEl = container.querySelector('#stat-bytes');
  const btnClear = container.querySelector('#text-clear');

  function countWords(text) {
    if (!text || !text.trim()) return 0;
    // Split on whitespace; handles multiple spaces, newlines, etc.
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function update() {
    const text = input.value;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = countWords(text);
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    // UTF-8 byte length
    const bytes = new TextEncoder().encode(text).length;

    charsEl.textContent = formatNumber(chars);
    charsNoSpaceEl.textContent = formatNumber(charsNoSpace);
    wordsEl.textContent = formatNumber(words);
    linesEl.textContent = formatNumber(lines);
    bytesEl.textContent = formatNumber(bytes);
  }

  input.addEventListener('input', update);
  btnClear.addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });

  update();
}
