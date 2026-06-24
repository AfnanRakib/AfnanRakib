'use strict';

/* ─── State ─── */
let openTabs  = ['home'];
let activeFile = 'home';
let activeTheme = localStorage.getItem('vsc-theme') || 'dark-default';
let cmdFocusIdx = -1;

/* ─── DOM refs ─── */
const tabsBar    = document.getElementById('tabs');
const content    = document.getElementById('content');
const bcFile     = document.getElementById('bc-file');
const sbFiletype = document.getElementById('sb-filetype');
const sbThemeName= document.getElementById('sb-theme-name');
const termPanel  = document.getElementById('terminal-panel');
const termOutput = document.getElementById('term-output');
const termForm   = document.getElementById('term-form');
const termInput  = document.getElementById('term-input');
const sidebar    = document.getElementById('sidebar');
const cmdOverlay = document.getElementById('cmd-overlay');
const cmdInput   = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const notifStack = document.getElementById('notif-stack');

/* ════════════════════════════════
   TABS
════════════════════════════════ */
let dragSrcId = null;

function renderTabs() {
  tabsBar.innerHTML = '';
  openTabs.forEach(id => {
    const f = FILES.find(f => f.id === id);
    if (!f) return;
    const tab = document.createElement('div');
    tab.className = 'tab' + (id === activeFile ? ' active' : '');
    tab.dataset.file = id;
    tab.draggable = true;
    tab.innerHTML =
      `<span class="fi-dot ${f.dot}"></span>${f.id === 'settings' ? 'settings.json' : f.label}` +
      `<button class="tab-close" data-close="${id}" title="Close">✕</button>`;

    tab.addEventListener('click', e => {
      if (e.target.dataset.close) { closeTab(e.target.dataset.close); return; }
      openFile(id);
    });

    // Drag-and-drop reordering
    tab.addEventListener('dragstart', e => {
      dragSrcId = id;
      tab.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    tab.addEventListener('dragend', () => {
      tab.classList.remove('dragging');
      tabsBar.querySelectorAll('.tab').forEach(t => t.classList.remove('drag-over-left', 'drag-over-right'));
    });
    tab.addEventListener('dragover', e => {
      e.preventDefault();
      if (dragSrcId === id) return;
      e.dataTransfer.dropEffect = 'move';
      tabsBar.querySelectorAll('.tab').forEach(t => t.classList.remove('drag-over-left', 'drag-over-right'));
      const rect = tab.getBoundingClientRect();
      const mid  = rect.left + rect.width / 2;
      tab.classList.add(e.clientX < mid ? 'drag-over-left' : 'drag-over-right');
    });
    tab.addEventListener('dragleave', () => {
      tab.classList.remove('drag-over-left', 'drag-over-right');
    });
    tab.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragSrcId || dragSrcId === id) return;
      const rect = tab.getBoundingClientRect();
      const mid  = rect.left + rect.width / 2;
      const insertBefore = e.clientX < mid;
      openTabs = openTabs.filter(t => t !== dragSrcId);
      const targetIdx = openTabs.indexOf(id);
      openTabs.splice(insertBefore ? targetIdx : targetIdx + 1, 0, dragSrcId);
      dragSrcId = null;
      renderTabs();
    });

    tabsBar.appendChild(tab);
  });
}

function openFile(id) {
  if (!openTabs.includes(id)) openTabs.push(id);
  activeFile = id;

  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('pane-' + id);
  if (pane) pane.classList.add('active');

  document.querySelectorAll('.tree-file').forEach(f => {
    f.classList.toggle('active', f.dataset.file === id);
  });

  const f = FILES.find(f => f.id === id);
  if (f) {
    bcFile.textContent = f.id === 'settings' ? '.vscode/settings.json' : f.label;
    sbFiletype.textContent = f.ft;
  }

  renderTabs();
  content.scrollTo({ top: 0, behavior: 'smooth' });
  triggerSkillBars(id);
  generateMinimap();
  if (id === 'cv' && typeof window.pdfViewerLoad === 'function') window.pdfViewerLoad();
  if (isMobile()) closeMobileSidebar();
}

function closeTab(id) {
  openTabs = openTabs.filter(t => t !== id);
  if (openTabs.length === 0) openTabs = ['home'];
  if (activeFile === id) openFile(openTabs[openTabs.length - 1]);
  else renderTabs();
}

/* ════════════════════════════════
   SKILL BARS
════════════════════════════════ */
let skillsAnimated = false;
function triggerSkillBars(id) {
  if (id !== 'skills' || skillsAnimated) return;
  setTimeout(() => {
    const wrap = document.getElementById('skills-wrap');
    if (wrap) { wrap.classList.add('bars-animated'); skillsAnimated = true; }
  }, 160);
}

/* ════════════════════════════════
   THEMES
════════════════════════════════ */
function applyTheme(id) {
  if (!THEMES[id]) return;
  activeTheme = id;
  document.documentElement.dataset.theme = id;
  localStorage.setItem('vsc-theme', id);

  // Theme panel checkmarks
  document.querySelectorAll('.theme-item').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === id);
  });

  // Status bar
  if (sbThemeName) sbThemeName.textContent = THEMES[id].label;

  // Settings pane display
  const settDisp = document.getElementById('settings-theme-display');
  const settVal  = document.getElementById('settings-theme-val');
  if (settDisp) settDisp.textContent = THEMES[id].label;
  if (settVal)  settVal.textContent  = `"${THEMES[id].label}"`;

  // Settings quick-switch buttons
  document.querySelectorAll('.stb').forEach(btn => {
    btn.classList.toggle('active-theme', btn.dataset.theme === id);
  });

  notify(`Theme: ${THEMES[id].label}`, 'info', 'fas fa-palette');
  generateMinimap();
}

/* ════════════════════════════════
   COMMAND PALETTE
════════════════════════════════ */
function buildCmdItems(query) {
  const q = query.toLowerCase().trim();
  const items = [];

  // Files
  FILES.forEach(f => {
    const match = !q || f.label.toLowerCase().includes(q) || f.id.includes(q);
    if (match) items.push({
      icon: 'fas fa-file-code cri-file',
      label: f.label,
      desc: f.ft,
      cat: 'File',
      action: () => openFile(f.id),
    });
  });

  // Themes
  Object.entries(THEMES).forEach(([id, t]) => {
    if (!q || t.label.toLowerCase().includes(q) || 'theme color'.includes(q)) {
      items.push({
        icon: 'fas fa-palette cri-theme',
        label: `Theme: ${t.label}`,
        desc: id === activeTheme ? '✓ Active' : 'Click to activate',
        cat: 'Theme',
        swatch: t.color,
        action: () => applyTheme(id),
      });
    }
  });

  // Built-in commands
  const cmds = [
    { label: 'Toggle Terminal',      desc: 'Ctrl+`',       icon: 'fas fa-terminal cri-cmd',  action: () => termPanel.classList.toggle('open') },
    { label: 'Toggle Sidebar',       desc: 'Ctrl+B',       icon: 'fas fa-sidebar cri-cmd',   action: () => document.querySelector('.ab.active')?.click() },
    { label: 'Open Profile Panel',   desc: 'View profile', icon: 'fas fa-user cri-cmd',      action: () => document.querySelector('[data-panel="profile"]').click() },
    { label: 'Open Extensions',      desc: 'View skills',  icon: 'fas fa-puzzle-piece cri-cmd', action: () => document.querySelector('[data-panel="extensions"]').click() },
    { label: 'Download CV',          desc: 'PDF download', icon: 'fas fa-download cri-cmd',  action: () => { const a = document.createElement('a'); a.href='../../resources/Md. Rakib Hasan.pdf'; a.download=''; a.click(); } },
  ];
  cmds.forEach(c => {
    if (!q || c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)) {
      items.push({ ...c, cat: 'Command' });
    }
  });

  return items;
}

function renderCmdResults(query) {
  cmdFocusIdx = -1;
  const items = buildCmdItems(query).slice(0, 12);
  if (items.length === 0) {
    cmdResults.innerHTML = `<div style="padding:14px 16px;font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:var(--tx3)">No results for "${query}"</div>`;
    return;
  }
  cmdResults.innerHTML = items.map((it, i) => `
    <div class="cmd-result" data-idx="${i}">
      <div class="cmd-result-icon ${it.icon || 'fas fa-circle cri-file'}"></div>
      <div>
        <div class="cmd-result-label">${it.label}</div>
        <div class="cmd-result-desc">${it.desc || ''}</div>
      </div>
      <span class="cmd-result-cat">${it.cat || ''}</span>
    </div>
  `).join('');

  cmdResults.querySelectorAll('.cmd-result').forEach((el, i) => {
    el.addEventListener('click', () => { items[i].action(); closeCmdPalette(); });
  });

  // Store for keyboard nav
  cmdResults._items = items;
}

function openCmdPalette() {
  cmdOverlay.classList.add('open');
  cmdInput.value = '';
  renderCmdResults('');
  requestAnimationFrame(() => cmdInput.focus());
}
function closeCmdPalette() {
  cmdOverlay.classList.remove('open');
  cmdInput.value = '';
  cmdFocusIdx = -1;
}

cmdInput.addEventListener('input', () => renderCmdResults(cmdInput.value));

cmdInput.addEventListener('keydown', e => {
  const rows = cmdResults.querySelectorAll('.cmd-result');
  const items = cmdResults._items || [];
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    cmdFocusIdx = Math.min(cmdFocusIdx + 1, rows.length - 1);
    rows.forEach((r, i) => r.classList.toggle('focused', i === cmdFocusIdx));
    rows[cmdFocusIdx]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    cmdFocusIdx = Math.max(cmdFocusIdx - 1, 0);
    rows.forEach((r, i) => r.classList.toggle('focused', i === cmdFocusIdx));
    rows[cmdFocusIdx]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    if (cmdFocusIdx >= 0 && items[cmdFocusIdx]) {
      items[cmdFocusIdx].action();
      closeCmdPalette();
    } else if (items[0]) {
      items[0].action();
      closeCmdPalette();
    }
  } else if (e.key === 'Escape') {
    closeCmdPalette();
  }
});

cmdOverlay.addEventListener('click', e => { if (e.target === cmdOverlay) closeCmdPalette(); });
document.getElementById('mb-cmd-btn')?.addEventListener('click', openCmdPalette);

/* ════════════════════════════════
   NOTIFICATIONS
════════════════════════════════ */
function notify(msg, type = 'info', icon = 'fas fa-info-circle') {
  const n = document.createElement('div');
  n.className = `notif notif-${type}`;
  n.innerHTML = `<i class="${icon} notif-icon"></i><span>${msg}</span>`;
  notifStack.appendChild(n);
  setTimeout(() => {
    n.classList.add('out');
    setTimeout(() => n.remove(), 320);
  }, 2800);
}

/* ════════════════════════════════
   ACTIVITY BAR
════════════════════════════════ */
function closeMobileSidebar() {
  document.querySelector('.vsc-body')?.classList.add('sidebar-hidden');
  document.getElementById('sidebar-backdrop')?.classList.remove('open');
}

document.getElementById('sidebar-backdrop')?.addEventListener('click', closeMobileSidebar);
document.getElementById('sidebar-mobile-close')?.addEventListener('click', closeMobileSidebar);

document.querySelectorAll('.ab[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    const alreadyActive = btn.classList.contains('active');
    const vb = document.querySelector('.vsc-body');

    document.querySelectorAll('.ab[data-panel]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    if (!alreadyActive) {
      btn.classList.add('active');
      const el = document.getElementById('panel-' + panel);
      if (el) el.classList.add('active');
      vb.classList.remove('sidebar-hidden');
      if (isMobile()) document.getElementById('sidebar-backdrop')?.classList.add('open');
    } else {
      vb.classList.add('sidebar-hidden');
      document.getElementById('sidebar-backdrop')?.classList.remove('open');
    }
  });
});

/* ─ Explorer file clicks ─ */
document.querySelectorAll('.tree-file').forEach(el => {
  el.addEventListener('click', () => openFile(el.dataset.file));
});

/* ─ Folder toggle in explorer ─ */
document.querySelectorAll('.tf-label[data-folder]').forEach(label => {
  const folder = label.dataset.folder;
  label.addEventListener('click', () => {
    const chev = label.querySelector('.chev');
    const folderIcon = label.querySelector('.fi-folder');
    const idMap = { vscode: 'vscode-folder', resources: 'resources-folder', root: 'root-folder' };
    const folderId = idMap[folder] || null;
    if (folderId) {
      const ch = document.getElementById(folderId);
      if (ch) {
        const hidden = ch.classList.toggle('tf-hidden');
        if (chev) chev.style.transform = hidden ? 'rotate(-90deg)' : 'rotate(0deg)';
        if (folderIcon) {
          folderIcon.classList.toggle('fa-folder-open', !hidden);
          folderIcon.classList.toggle('fa-folder', hidden);
        }
      }
    }
  });
});

/* ─ Theme panel clicks ─ */
document.querySelectorAll('.theme-item').forEach(el => {
  el.addEventListener('click', () => applyTheme(el.dataset.theme));
});

/* ════════════════════════════════
   MINIMAP
════════════════════════════════ */
function generateMinimap() {
  const mm = document.getElementById('minimap');
  if (!mm) return;
  mm.innerHTML = '<div class="mm-viewport"></div>';
  const types = ['', '', 'mm-accent', 'mm-str', '', 'mm-kw', '', '', 'mm-accent', '', 'mm-str', '', ''];
  for (let i = 0; i < 140; i++) {
    const line = document.createElement('div');
    const cls = types[i % types.length];
    line.className = 'mm-line' + (cls ? ' ' + cls : '');
    const w = 20 + Math.random() * 60;
    line.style.width = w + '%';
    mm.appendChild(line);
  }
}

/* ════════════════════════════════
   SEARCH PANEL
════════════════════════════════ */
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput?.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResults.innerHTML = '<p class="search-hint">Search across all sections.</p>'; return; }

  const hits = [];
  SEARCH_DATA.forEach(({ file, text }) => {
    const idx = text.toLowerCase().indexOf(q);
    if (idx >= 0) {
      const start = Math.max(0, idx - 20);
      const snippet = text.slice(start, idx + q.length + 30);
      const marked = snippet.replace(new RegExp(q, 'gi'), m => `<mark>${m}</mark>`);
      const f = FILES.find(f => f.id === file);
      hits.push({ file, label: f?.label || file, snippet: marked });
    }
  });

  if (hits.length === 0) {
    searchResults.innerHTML = `<div class="sr-none">No results for "${q}"</div>`;
    return;
  }

  searchResults.innerHTML = hits.map(h => `
    <div class="sr-item" data-file="${h.file}">
      <span class="sr-file">${h.label}</span>
      <span class="sr-match">…${h.snippet}…</span>
    </div>
  `).join('');

  searchResults.querySelectorAll('.sr-item').forEach(el => {
    el.addEventListener('click', () => openFile(el.dataset.file));
  });
});

/* ════════════════════════════════
   ZOOM
════════════════════════════════ */
const isMobile = () => window.innerWidth <= 800;
let zoomLevel = isMobile() ? 70 : 110;
const ZOOM_STEP = 10, ZOOM_MIN = 40, ZOOM_MAX = 150;

function setZoom(pct) {
  zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pct));
  const scale = zoomLevel / 100;
  const app = document.getElementById('app');
  app.style.transformOrigin = 'top left';
  app.style.transform = `scale(${scale})`;
  app.style.width  = `${(1 / scale) * 100}vw`;
  app.style.height = `${(1 / scale) * 100}dvh`;
  // On mobile, position:fixed removes #app from document flow so
  // body { overflow:hidden } can't clip the scaled layout at 100dvh.
  // Without this, the status bar (at the bottom of the 142dvh layout)
  // gets clipped before the transform renders it into view.
  if (isMobile()) {
    app.style.position = 'fixed';
    app.style.top  = '0';
    app.style.left = '0';
  } else {
    app.style.position = '';
    app.style.top  = '';
    app.style.left = '';
  }
  const lbl = document.getElementById('zoom-label');
  const sb  = document.getElementById('sb-zoom');
  if (lbl) lbl.textContent = zoomLevel + '%';
  if (sb)  sb.textContent  = zoomLevel + '%';
}

document.getElementById('zoom-in-btn')?.addEventListener('click',  () => setZoom(zoomLevel + ZOOM_STEP));
document.getElementById('zoom-out-btn')?.addEventListener('click', () => setZoom(zoomLevel - ZOOM_STEP));

/* ════════════════════════════════
   FULLSCREEN
════════════════════════════════ */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}
document.getElementById('fullscreen-btn')?.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
  const icon = document.getElementById('fs-icon');
  if (icon) icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
});

/* ════════════════════════════════
   MENU BAR DROPDOWNS
════════════════════════════════ */
document.querySelectorAll('.mb-menu').forEach(menu => {
  menu.querySelector('span')?.addEventListener('click', e => {
    e.stopPropagation();
    const open = menu.classList.contains('open');
    document.querySelectorAll('.mb-menu.open').forEach(m => m.classList.remove('open'));
    if (!open) menu.classList.add('open');
  });
});

const MENU_ACTIONS = {
  palette:    () => openCmdPalette(),
  sidebar:    () => {
    const vb = document.querySelector('.vsc-body');
    if (vb.classList.contains('sidebar-hidden')) {
      document.querySelector('.ab[data-panel="explorer"]')?.click();
    } else {
      const activeBtn = document.querySelector('.ab.active[data-panel]');
      if (activeBtn) activeBtn.click();
      else vb.classList.add('sidebar-hidden');
    }
  },
  terminal:   () => termPanel.classList.toggle('open'),
  copilot:    () => toggleCopilot(),
  fullscreen: () => toggleFullscreen(),
  'zoom-in':  () => setZoom(zoomLevel + ZOOM_STEP),
  'zoom-out': () => setZoom(zoomLevel - ZOOM_STEP),
  'zoom-reset':() => setZoom(100),
  settings:   () => document.querySelector('.ab[data-panel="gear"]')?.click(),
  shortcuts:  () => {
    document.querySelector('.ab[data-panel="gear"]')?.click();
    notify('Keyboard Shortcuts — see Settings panel', 'info', 'fas fa-keyboard');
  },
  'close-tab': () => closeTab(activeFile),
  'close-all-tabs': () => {
    openTabs = ['home'];
    activeFile = 'home';
    openFile('home');
    notify('All tabs closed.', 'info', 'fas fa-times-circle');
  },
  'copy-email':() => { navigator.clipboard.writeText('rakibhasan4101@gmail.com'); notify('Email copied!', 'success', 'fas fa-check'); },
};

document.querySelectorAll('.mb-dd-item').forEach(item => {
  item.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.mb-menu.open').forEach(m => m.classList.remove('open'));
    const action = item.dataset.action;
    const file   = item.dataset.file;
    if (action && MENU_ACTIONS[action]) MENU_ACTIONS[action]();
    else if (file) openFile(file);
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.mb-menu.open').forEach(m => m.classList.remove('open'));
});

/* ════════════════════════════════
   GEAR PANEL
════════════════════════════════ */
document.querySelectorAll('.gear-theme').forEach(el => {
  el.addEventListener('click', () => {
    applyTheme(el.dataset.theme);
    document.querySelectorAll('.gear-theme').forEach(g => g.classList.toggle('active', g.dataset.theme === el.dataset.theme));
  });
});

document.querySelectorAll('.gear-action[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (MENU_ACTIONS[action]) MENU_ACTIONS[action]();
  });
});

/* ════════════════════════════════
   KEYBOARD SHORTCUTS
════════════════════════════════ */
document.addEventListener('keydown', e => {
  // Ctrl+Shift+P — Command Palette
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    cmdOverlay.classList.contains('open') ? closeCmdPalette() : openCmdPalette();
  }
  // Ctrl+Shift+C — Copilot
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    toggleCopilot();
  }
  // Ctrl+B — Toggle sidebar
  if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
    e.preventDefault();
    MENU_ACTIONS.sidebar();
  }
  // Ctrl+W — Close active tab
  if (e.ctrlKey && !e.shiftKey && e.key === 'w') {
    e.preventDefault();
    closeTab(activeFile);
  }
  // Ctrl+` or Ctrl+J — Toggle terminal
  if ((e.ctrlKey && e.key === '`') || (e.ctrlKey && e.key === 'j')) {
    e.preventDefault();
    termPanel.classList.toggle('open');
  }
  // Ctrl++ / Ctrl+= — Zoom in
  if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
    e.preventDefault(); setZoom(zoomLevel + ZOOM_STEP);
  }
  // Ctrl+- — Zoom out
  if (e.ctrlKey && e.key === '-') {
    e.preventDefault(); setZoom(zoomLevel - ZOOM_STEP);
  }
  // Ctrl+0 — Reset zoom
  if (e.ctrlKey && e.key === '0') {
    e.preventDefault(); setZoom(100);
  }
  // F11 — Fullscreen
  if (e.key === 'F11') {
    e.preventDefault(); toggleFullscreen();
  }
  // Escape — close overlays
  if (e.key === 'Escape') {
    if (cmdOverlay.classList.contains('open')) closeCmdPalette();
    document.querySelectorAll('.mb-menu.open').forEach(m => m.classList.remove('open'));
  }
  // Ctrl+1..8 — switch files
  if (e.ctrlKey && !e.shiftKey && e.key >= '1' && e.key <= '9') {
    const idx = parseInt(e.key) - 1;
    if (idx < FILES.length) { e.preventDefault(); openFile(FILES[idx].id); }
  }
});

/* ════════════════════════════════
   TYPED TEXT
════════════════════════════════ */
function initTyped() {
  const el = document.querySelector('.typed-text');
  if (!el) return;
  const words = el.dataset.words.split(',').map(w => w.trim());
  let wi = 0, ci = 0, deleting = false;
  function tick() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, deleting ? 52 : 88);
  }
  setTimeout(tick, 600);
}

/* ════════════════════════════════
   PROJECT FILTERS
════════════════════════════════ */
function initFilters() {
  document.querySelectorAll('.pf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.proj-card').forEach(card => {
        const cats = card.dataset.cat || '';
        card.classList.toggle('hidden', cat !== 'all' && !cats.split(' ').includes(cat));
      });
    });
  });
}

/* ════════════════════════════════
   COPY EMAIL
════════════════════════════════ */
function initCopyEmail() {
  const btn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('copy-toast');
  if (!btn) return;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.email).then(() => {
      if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
      notify('Email copied to clipboard!', 'success', 'fas fa-check');
    });
  });
}

/* ════════════════════════════════
   EXPERIENCE — EXPANDABLE ORGS
════════════════════════════════ */
function toggleExpOrg(idx) {
  const eorg = document.getElementById('eorg-' + idx);
  if (!eorg) return;
  const isOpen = eorg.classList.toggle('open');
  const roles = eorg.querySelector('.eorg-roles');
  if (roles) roles.classList.toggle('open', isOpen);
  const btnLabel = eorg.querySelector('.exp-toggle-btn span');
  if (btnLabel) btnLabel.textContent = isOpen ? 'Hide Details' : 'Show Details';
}

/* ════════════════════════════════
   COPILOT RESIZE
════════════════════════════════ */
function initCopilotResize() {
  const handle = document.getElementById('cop-resize');
  const panel  = document.getElementById('copilot-panel');
  const body   = document.querySelector('.vsc-body');
  if (!handle || !panel || !body) return;

  let startX, startW;
  handle.addEventListener('mousedown', e => {
    startX = e.clientX;
    startW = panel.getBoundingClientRect().width;
    handle.classList.add('dragging');

    function onMove(e) {
      const dx = startX - e.clientX;
      const newW = Math.min(520, Math.max(200, startW + dx));
      const cols = window.getComputedStyle(body).gridTemplateColumns.split(' ');
      const sideW = body.classList.contains('sidebar-hidden') ? '0px' : (cols[1] || '240px');
      body.style.gridTemplateColumns = `48px ${sideW} 1fr ${newW}px`;
    }
    function onUp() {
      handle.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
}

function initSidebarResize() {
  const handle  = document.getElementById('sidebar-resize');
  const sidebar  = document.getElementById('sidebar');
  const body     = document.querySelector('.vsc-body');
  if (!handle || !sidebar || !body) return;

  let startX, startW;
  handle.addEventListener('mousedown', e => {
    startX = e.clientX;
    startW = sidebar.getBoundingClientRect().width;
    handle.classList.add('dragging');
    document.body.style.userSelect = 'none';

    function onMove(e) {
      const dx = e.clientX - startX;
      const newW = Math.min(400, Math.max(140, startW + dx));
      const cols = window.getComputedStyle(body).gridTemplateColumns.split(' ');
      const copW = cols[3] || '0px';
      body.style.gridTemplateColumns = `48px ${newW}px 1fr ${copW}`;
    }
    function onUp() {
      handle.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
}

/* ════════════════════════════════
   SETTINGS QUICK-SWITCH BUTTONS
════════════════════════════════ */
function initSettingsThemeBtns() {
  const container = document.getElementById('set-theme-btns');
  if (!container) return;
  Object.entries(THEMES).forEach(([id, t]) => {
    const btn = document.createElement('button');
    btn.className = 'stb' + (id === activeTheme ? ' active-theme' : '');
    btn.dataset.theme = id;
    btn.innerHTML = `<span class="stb-swatch" style="background:${t.color}"></span>${t.label}`;
    btn.addEventListener('click', () => applyTheme(id));
    container.appendChild(btn);
  });
}

/* ════════════════════════════════
   LIVE CLOCK
════════════════════════════════ */
function updateClock() {
  const now = new Date();
  const opts = { timeZone: 'Asia/Dhaka', hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const parts = new Intl.DateTimeFormat('en-GB', opts).formatToParts(now);
  const get = t => parts.find(p => p.type === t)?.value || '00';
  const hh = get('hour'), mm = get('minute'), ss = get('second');
  const cl = document.getElementById('live-clock');
  const sb = document.getElementById('sb-time');
  if (cl) cl.textContent = `${hh}:${mm}:${ss}`;
  if (sb) sb.textContent = `${hh}:${mm}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ════════════════════════════════
   BOOT
════════════════════════════════ */
/* ════════════════════════════════
   WINDOW CONTROL BUTTONS
════════════════════════════════ */
const appEl    = document.getElementById('app');
const wdClosed = document.getElementById('wd-closed');

document.getElementById('wd-close')?.addEventListener('click', () => {
  appEl.classList.add('app-hidden');
  wdClosed.classList.remove('hidden');
});
document.getElementById('wd-reopen')?.addEventListener('click', () => {
  appEl.classList.remove('app-hidden');
  wdClosed.classList.add('hidden');
});
document.getElementById('wd-min')?.addEventListener('click', () => {
  appEl.classList.add('app-hidden');
  document.getElementById('minimized-overlay').classList.remove('hidden');
});
document.getElementById('desk-restore-min')?.addEventListener('click', () => {
  appEl.classList.remove('app-hidden');
  document.getElementById('minimized-overlay').classList.add('hidden');
  notify('Window restored.', 'info', 'fas fa-window-restore');
});
document.getElementById('wd-max')?.addEventListener('click', toggleFullscreen);

/* ════════════════════════════════
   SPLASH SCREEN
════════════════════════════════ */
(function initSplash() {
  const splash    = document.getElementById('splash');
  const splashTxt = document.getElementById('splash-status');
  if (!splash) return;

  const steps = [
    'Cloning RAKIB-PORTFOLIO...',
    'Installing dependencies...',
    'Loading home.html...',
    'Indexing 11 files...',
    'Starting extensions...',
    'Opening workspace...',
  ];
  let i = 0;
  const interval = setInterval(() => {
    if (splashTxt && i < steps.length) splashTxt.textContent = steps[i++];
  }, 320);

  setTimeout(() => {
    clearInterval(interval);
    splash.classList.add('splash-out');
    setTimeout(() => splash.remove(), 600);
  }, 2200);
})();

/* ════════════════════════════════
   KONAMI CODE EASTER EGG
════════════════════════════════ */
(function initKonami() {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        notify('🕹️ Konami Code! You found the Easter egg!', 'success', 'fas fa-star');
        termPanel.classList.add('open');
        addTermLine('<span style="color:var(--a2)">★ KONAMI CODE ACTIVATED ★</span>');
        addTermLine('<span style="color:var(--green)">You unlocked: Rakib\'s secret — he once solved 6 problems in an ICPC practice in under 2 hours.</span>');
      }
    } else { idx = 0; }
  });
})();

// Init copilot as hidden
copPanel?.classList.add('hidden');

applyTheme(activeTheme);
setZoom(zoomLevel);
renderTabs();
initTyped();
initFilters();
initCopyEmail();
initSettingsThemeBtns();
initCopilotResize();
initSidebarResize();
generateMinimap();
openFile('home');

// On mobile, start with sidebar hidden
if (isMobile()) {
  document.querySelector('.vsc-body')?.classList.add('sidebar-hidden');
  document.querySelectorAll('.ab[data-panel]').forEach(b => b.classList.remove('active'));
}

// Re-apply correct zoom if window is resized (e.g. orientation change)
window.addEventListener('resize', () => {
  const expected = isMobile() ? 70 : 110;
  setZoom(expected);
});

// ── Cursor ring ──
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!ring) return;
  let rx = 0, ry = 0, mx = 0, my = 0, visible = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    if (!visible) {
      rx = mx; ry = my; visible = true;
      dot?.classList.add('vis');
      ring?.classList.add('vis');
    }
  });
  document.addEventListener('mouseleave', () => {
    dot?.classList.remove('vis');
    ring?.classList.remove('vis');
    visible = false;
  });

  const hoverSels = 'a, button, .tree-file, .ab, .proj-card, .eorg-header, .soc-card, .skill-logo-item, .desk-taskbar-app, [data-file], [data-action]';
  document.querySelectorAll(hoverSels).forEach(el => {
    el.addEventListener('mouseenter', () => { ring?.classList.add('expanded'); dot?.classList.add('expanded'); });
    el.addEventListener('mouseleave', () => { ring?.classList.remove('expanded'); dot?.classList.remove('expanded'); });
  });

  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(loop);
  })();
})();

// Remove deploy overlay on back-button (BFCache restore)
window.addEventListener('pageshow', () => {
  document.querySelectorAll('.deploy-overlay').forEach(el => el.remove());
});

// Desktop overlay clock + date
function updateDeskClock() {
  const now      = new Date();
  const timeStr  = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr  = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  // Minimized overlay
  const clockEl = document.getElementById('desk-clock');
  const dateEl  = document.getElementById('desk-date');
  if (clockEl) clockEl.textContent = timeStr;
  if (dateEl)  dateEl.textContent  = dateStr;
  // Closed overlay
  const c2 = document.querySelector('#desk-dt-closed .desk-time-val');
  const d2 = document.querySelector('#desk-dt-closed .desk-date-val');
  if (c2) c2.textContent = timeStr;
  if (d2) d2.textContent = dateStr;
}
updateDeskClock();
setInterval(updateDeskClock, 30000);

/* ── Deploy animation for Run Portfolio button ── */
function launchDeploy(dest) {
  const overlay = document.createElement('div');
  overlay.className = 'deploy-overlay';
  overlay.innerHTML = `
    <div class="deploy-box">
      <div class="deploy-title">Deploying Portfolio</div>
      <div id="dl-steps"></div>
    </div>`;
  document.body.appendChild(overlay);

  const steps = [
    { text: '$ npm run build', cls: 'cmd', t: 0   },
    { text: '✓  Bundling assets…',   cls: 'ok',  t: 280 },
    { text: '✓  Compiling modules…', cls: 'ok',  t: 560 },
    { text: '✓  Deploying to production…', cls: 'ok', t: 850 },
    { text: '⚡ Launch successful — opening now', cls: 'done', t: 1150 },
  ];

  const container = overlay.querySelector('#dl-steps');
  steps.forEach(({ text, cls, t }) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `deploy-line ${cls}`;
      line.textContent = text;
      container.appendChild(line);
      requestAnimationFrame(() => requestAnimationFrame(() => line.classList.add('show')));
    }, t);
  });

  setTimeout(() => { window.location.href = dest; }, 1500);
}

document.querySelector('.run-portfolio-btn')?.addEventListener('click', e => {
  e.preventDefault();
  launchDeploy(e.currentTarget.getAttribute('href'));
});

setTimeout(() => notify('Welcome! Ctrl+Shift+P for commands · Ctrl+Shift+C for AI Copilot', 'info', 'fas fa-terminal'), 1400);
