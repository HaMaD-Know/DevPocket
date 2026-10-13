/**
 * Color Converter: HEX ↔ RGB ↔ HSL.
 */

import { showToast, copyToClipboard } from '../utils.js';

/**
 * Parse various color inputs into { r, g, b, a } (0-255, a 0-1).
 */
export function parseColor(input) {
  const s = input.trim().toLowerCase();
  if (!s) throw new Error('Empty color.');

  // HEX: #rgb, #rrggbb, #rrggbbaa
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    } else if (hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      if ([r, g, b].some((v) => isNaN(v))) throw new Error('Invalid HEX color.');
      return { r, g, b, a };
    }
    throw new Error('Invalid HEX format. Use #RGB, #RRGGBB, or #RRGGBBAA.');
  }

  // rgb/rgba
  const rgbMatch = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (rgbMatch) {
    const r = clamp(Math.round(Number(rgbMatch[1])), 0, 255);
    const g = clamp(Math.round(Number(rgbMatch[2])), 0, 255);
    const b = clamp(Math.round(Number(rgbMatch[3])), 0, 255);
    const a = rgbMatch[4] != null ? clamp(Number(rgbMatch[4]), 0, 1) : 1;
    return { r, g, b, a };
  }

  // hsl/hsla
  const hslMatch = s.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (hslMatch) {
    const h = Number(hslMatch[1]) % 360;
    const sat = clamp(Number(hslMatch[2]), 0, 100) / 100;
    const l = clamp(Number(hslMatch[3]), 0, 100) / 100;
    const a = hslMatch[4] != null ? clamp(Number(hslMatch[4]), 0, 1) : 1;
    const { r, g, b } = hslToRgb(h, sat, l);
    return { r, g, b, a };
  }

  throw new Error('Unrecognized color format. Try HEX, rgb(), or hsl().');
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function rgbToHex(r, g, b, a = 1) {
  const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a < 1) {
    hex += toHex(Math.round(a * 255));
  }
  return hex.toUpperCase();
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return {
    h: Math.round(h * 10) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0,
    gp = 0,
    bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function initColorTool(container) {
  const input = container.querySelector('#color-input');
  const preview = container.querySelector('#color-preview');
  const hexOut = container.querySelector('#color-hex');
  const rgbOut = container.querySelector('#color-rgb');
  const hslOut = container.querySelector('#color-hsl');
  const status = container.querySelector('#color-status');
  const btnConvert = container.querySelector('#color-convert');
  const btnClear = container.querySelector('#color-clear');
  const btnCopyHex = container.querySelector('#color-copy-hex');
  const btnCopyRgb = container.querySelector('#color-copy-rgb');
  const btnCopyHsl = container.querySelector('#color-copy-hsl');
  const picker = container.querySelector('#color-picker');

  function setStatus(msg, type = 'info') {
    status.textContent = msg;
    status.className = `status-message status-${type}`;
  }

  function applyColor(r, g, b, a) {
    const hex = rgbToHex(r, g, b, a);
    const rgbStr =
      a < 1
        ? `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`
        : `rgb(${r}, ${g}, ${b})`;
    const { h, s, l } = rgbToHsl(r, g, b);
    const hslStr =
      a < 1
        ? `hsla(${h}, ${s}%, ${l}%, ${Math.round(a * 1000) / 1000})`
        : `hsl(${h}, ${s}%, ${l}%)`;

    hexOut.value = hex;
    rgbOut.value = rgbStr;
    hslOut.value = hslStr;
    preview.style.backgroundColor = rgbStr;
    preview.setAttribute('title', hex);
    // Sync picker (no alpha support in native color input)
    picker.value = rgbToHex(r, g, b).slice(0, 7).toLowerCase();
    setStatus('Converted successfully.', 'success');
  }

  function convert() {
    try {
      const { r, g, b, a } = parseColor(input.value);
      applyColor(r, g, b, a);
    } catch (err) {
      setStatus(err.message || 'Conversion failed.', 'error');
      preview.style.backgroundColor = 'transparent';
    }
  }

  btnConvert.addEventListener('click', convert);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') convert();
  });

  picker.addEventListener('input', () => {
    input.value = picker.value;
    convert();
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    hexOut.value = '';
    rgbOut.value = '';
    hslOut.value = '';
    preview.style.backgroundColor = 'transparent';
    status.textContent = '';
    status.className = 'status-message';
    input.focus();
  });

  async function copyField(el) {
    if (!el.value) {
      showToast('Nothing to copy.', 'warning');
      return;
    }
    const ok = await copyToClipboard(el.value);
    showToast(ok ? 'Copied.' : 'Copy failed.', ok ? 'success' : 'error');
  }

  btnCopyHex.addEventListener('click', () => copyField(hexOut));
  btnCopyRgb.addEventListener('click', () => copyField(rgbOut));
  btnCopyHsl.addEventListener('click', () => copyField(hslOut));
}
