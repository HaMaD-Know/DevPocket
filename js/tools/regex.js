/**
 * Regex Tester with invalid-pattern handling and basic protection against UI freezes.
 * Uses a timeout wrapper for matching on large inputs / complex patterns.
 */

import { showToast, copyToClipboard, escapeHtml } from '../utils.js';

const MATCH_TIMEOUT_MS = 500;
const MAX_INPUT_LENGTH = 100000;

/**
 * Test a regex against a string with a soft timeout.
 * Returns { matches, error, timedOut }
 */
export function testRegex(pattern, flags, testString) {
  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err) {
    return { matches: [], error: err.message || 'Invalid regular expression.', timedOut: false };
  }

  if (testString.length > MAX_INPUT_LENGTH) {
    return {
      matches: [],
      error: `Input too large (max ${MAX_INPUT_LENGTH} characters).`,
      timedOut: false,
    };
  }

  const matches = [];
  const start = performance.now();

  try {
    if (flags.includes('g')) {
      let m;
      let iterations = 0;
      const maxIterations = 10000;
      while ((m = regex.exec(testString)) !== null) {
        matches.push({
          index: m.index,
          match: m[0],
          groups: m.slice(1),
          named: m.groups || null,
        });
        iterations++;
        if (iterations >= maxIterations) {
          return {
            matches,
            error: 'Too many matches (capped at 10 000). Pattern may be too broad.',
            timedOut: false,
          };
        }
        if (performance.now() - start > MATCH_TIMEOUT_MS) {
          return { matches, error: null, timedOut: true };
        }
        // Prevent infinite loop on zero-length matches
        if (m[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        matches.push({
          index: m.index,
          match: m[0],
          groups: m.slice(1),
          named: m.groups || null,
        });
      }
    }
  } catch (err) {
    return { matches: [], error: err.message || 'Match failed.', timedOut: false };
  }

  if (performance.now() - start > MATCH_TIMEOUT_MS) {
    return { matches, error: null, timedOut: true };
  }

  return { matches, error: null, timedOut: false };
}

export function initRegexTool(container) {
  const patternInput = container.querySelector('#regex-pattern');
  const flagsInput = container.querySelector('#regex-flags');
  const testInput = container.querySelector('#regex-test');
  const resultsEl = container.querySelector('#regex-results');
  const status = container.querySelector('#regex-status');
  const btnTest = container.querySelector('#regex-test-btn');
  const btnClear = container.querySelector('#regex-clear');
  const btnCopy = container.querySelector('#regex-copy');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  function renderResults(matches, timedOut) {
    resultsEl.innerHTML = '';
    if (matches.length === 0) {
      const p = document.createElement('p');
      p.className = 'empty-state';
      p.textContent = timedOut
        ? 'Matching timed out (possible expensive pattern). Showing partial results if any.'
        : 'No matches found.';
      resultsEl.appendChild(p);
      return;
    }

    const list = document.createElement('ol');
    list.className = 'match-list';
    matches.forEach((m, i) => {
      const li = document.createElement('li');
      const matchSpan = document.createElement('code');
      matchSpan.textContent = m.match;
      li.appendChild(document.createTextNode(`#${i + 1} @ ${m.index}: `));
      li.appendChild(matchSpan);
      if (m.groups && m.groups.length) {
        const groups = document.createElement('div');
        groups.className = 'match-groups';
        groups.textContent = 'Groups: ' + m.groups.map((g, gi) => `[${gi + 1}]=${JSON.stringify(g)}`).join(', ');
        li.appendChild(groups);
      }
      if (m.named) {
        const named = document.createElement('div');
        named.className = 'match-groups';
        named.textContent = 'Named: ' + JSON.stringify(m.named);
        li.appendChild(named);
      }
      list.appendChild(li);
    });
    resultsEl.appendChild(list);
  }

  btnTest.addEventListener('click', () => {
    const pattern = patternInput.value;
    const flags = flagsInput.value.trim();
    const testString = testInput.value;

    if (!pattern) {
      setStatus('Enter a regular expression pattern.', 'warning');
      resultsEl.innerHTML = '';
      return;
    }

    // Basic flag validation
    if (/[^gimsuy]/.test(flags)) {
      setStatus('Invalid flags. Allowed: g i m s u y', 'error');
      resultsEl.innerHTML = '';
      return;
    }

    const { matches, error, timedOut } = testRegex(pattern, flags, testString);

    if (error) {
      setStatus(error, 'error');
      resultsEl.innerHTML = '';
      return;
    }

    renderResults(matches, timedOut);
    if (timedOut) {
      setStatus(`Timed out after ~${MATCH_TIMEOUT_MS}ms. Showing partial results (${matches.length} matches).`, 'warning');
    } else {
      setStatus(`Found ${matches.length} match${matches.length === 1 ? '' : 'es'}.`, 'success');
    }
  });

  btnClear.addEventListener('click', () => {
    patternInput.value = '';
    flagsInput.value = 'g';
    testInput.value = '';
    resultsEl.innerHTML = '';
    status.textContent = '';
    status.className = 'status-message';
    patternInput.focus();
  });

  btnCopy.addEventListener('click', async () => {
    const text = resultsEl.innerText;
    if (!text || text.includes('No matches')) {
      showToast('Nothing useful to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Results copied.' : 'Copy failed.', ok ? 'success' : 'error');
  });
}
