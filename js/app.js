/**
 * DevPocket — main application bootstrap.
 * Handles navigation, theme switching, and tool initialization.
 * Everything runs client-side; no external network requests for user data.
 */

import { initJsonTool } from './tools/json.js';
import { initBase64Tool } from './tools/base64.js';
import { initUrlTool } from './tools/url.js';
import { initJwtTool } from './tools/jwt.js';
import { initUuidTool } from './tools/uuid.js';
import { initHashTool } from './tools/hash.js';
import { initTimestampTool } from './tools/timestamp.js';
import { initTextStatsTool } from './tools/textstats.js';
import { initRegexTool } from './tools/regex.js';
import { initColorTool } from './tools/color.js';

const TOOLS = {
  json: { init: initJsonTool, title: 'JSON Formatter' },
  base64: { init: initBase64Tool, title: 'Base64 Encoder / Decoder' },
  url: { init: initUrlTool, title: 'URL Encoder / Decoder' },
  jwt: { init: initJwtTool, title: 'JWT Decoder' },
  uuid: { init: initUuidTool, title: 'UUID Generator' },
  hash: { init: initHashTool, title: 'SHA-256 Hash' },
  timestamp: { init: initTimestampTool, title: 'Unix Timestamp' },
  textstats: { init: initTextStatsTool, title: 'Text Counter' },
  regex: { init: initRegexTool, title: 'Regex Tester' },
  color: { init: initColorTool, title: 'Color Converter' },
};

const THEME_KEY = 'devpocket-theme';

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    toggle.setAttribute('title', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

function initTheme() {
  applyTheme(getPreferredTheme());
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
}

function showTool(id) {
  const panels = document.querySelectorAll('.tool-panel');
  panels.forEach((p) => {
    p.hidden = p.dataset.tool !== id;
  });

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach((link) => {
    const isActive = link.dataset.tool === id;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  // Update page title
  const tool = TOOLS[id];
  if (tool) {
    document.title = `${tool.title} · DevPocket`;
    const heading = document.getElementById('tool-heading');
    if (heading) heading.textContent = tool.title;
  }

  // Close mobile nav
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.hidden = true;
}

function initNavigation() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.tool;
      if (id && TOOLS[id]) {
        history.pushState({ tool: id }, '', `#${id}`);
        showTool(id);
      }
    });
  });

  // Mobile menu toggle
  const menuBtn = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.hidden = !sidebar.classList.contains('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.hidden = true;
    });
  }

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    const id = (e.state && e.state.tool) || location.hash.slice(1) || 'json';
    if (TOOLS[id]) showTool(id);
  });

  // Initial route
  const initial = location.hash.slice(1) || 'json';
  if (TOOLS[initial]) {
    showTool(initial);
  } else {
    showTool('json');
  }
}

function initTools() {
  Object.keys(TOOLS).forEach((id) => {
    const panel = document.querySelector(`.tool-panel[data-tool="${id}"]`);
    if (panel && typeof TOOLS[id].init === 'function') {
      try {
        TOOLS[id].init(panel);
      } catch (err) {
        console.error(`Failed to init tool ${id}:`, err);
      }
    }
  });
}

// Keyboard: Escape closes mobile sidebar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (overlay) overlay.hidden = true;
    }
  }
});

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTools();
});
