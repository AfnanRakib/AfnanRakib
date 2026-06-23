'use strict';

/* ─── Files ─── */
const FILES = [
  { id: 'home',         label: 'home.html',              dot: 'html', ft: 'HTML'            },
  { id: 'about',        label: 'about.md',               dot: 'md',   ft: 'Markdown'        },
  { id: 'projects',     label: 'projects.js',            dot: 'js',   ft: 'JavaScript'      },
  { id: 'experience',   label: 'experience.html',        dot: 'html', ft: 'HTML'            },
  { id: 'achievements', label: 'achievements.md',        dot: 'md',   ft: 'Markdown'        },
  { id: 'skills',       label: 'skills.css',             dot: 'css',  ft: 'CSS'             },
  { id: 'contact',      label: 'contact.html',           dot: 'html', ft: 'HTML'            },
  { id: 'settings',     label: '.vscode/settings.json',  dot: 'json', ft: 'JSON'            },
  { id: 'photo',        label: 'Md. Rakib Hasan.png',    dot: 'png',  ft: 'PNG Image'       },
  { id: 'cv',           label: 'Md. Rakib Hasan.pdf',    dot: 'pdf',  ft: 'PDF'             },
];

/* ─── Themes ─── */
const THEMES = {
  'dark-default': { label: 'Dark Default (Indigo)', color: '#818cf8' },
  'tokyo-night':  { label: 'Tokyo Night',           color: '#7aa2f7' },
  'catppuccin':   { label: 'Catppuccin Mocha',      color: '#cba6f7' },
  'nord':         { label: 'Nord',                  color: '#88c0d0' },
  'vscode-light': { label: 'VS Code Light',          color: '#0078d4' },
  'dracula':      { label: 'Dracula',               color: '#bd93f9' },
  'solarized-light': { label: 'Solarized Light',      color: '#cb4b16' },
};

/* ─── Searchable index ─── */
const SEARCH_DATA = [
  { file: 'home',         text: 'Md. Rakib Hasan software developer competitive programmer technical leader AUST Bangladesh' },
  { file: 'about',        text: 'about background CSE CGPA 3.75 Ahsanullah University SOHOJOGI AUST CODE REALM HOMEHUTBD' },
  { file: 'projects',     text: 'SOHOJOGI Flutter Supabase AUST CODE REALM PHP MySQL HOMEHUTBD ASP.NET BHROMON Google Maps IRREVOCABLE-ETERNITY OpenGL Java JavaFX CODE REALM' },
  { file: 'experience',   text: 'president vice president AUST programming club CSE society CP community Geeky Solutions learnathon leader' },
  { file: 'achievements', text: 'champion learnathon ICPC #122 BUBT IUCPC #35 AUST inter-university #97 rank merit scholarship academic award runner-up research odyssey' },
  { file: 'skills',       text: 'C++ C Python Java Dart JavaScript C# Flutter HTML CSS ASP.NET MySQL Supabase Docker Firebase GitHub Actions computer vision machine learning' },
  { file: 'contact',      text: 'email github linkedin codeforces leetcode atcoder discord contact rakibhasan4101@gmail.com' },
  { file: 'settings',     text: 'settings theme editor font JetBrains Mono configuration vscode' },
  { file: 'photo',        text: 'photo portrait image png Md. Rakib Hasan' },
  { file: 'cv',           text: 'CV resume PDF download Md. Rakib Hasan curriculum vitae' },
];

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
   TERMINAL
════════════════════════════════ */
document.getElementById('ab-terminal').addEventListener('click', () => {
  termPanel.classList.toggle('open');
});
document.getElementById('term-close').addEventListener('click', () => {
  termPanel.classList.remove('open');
});
document.getElementById('mb-terminal-toggle').addEventListener('click', () => {
  termPanel.classList.toggle('open');
});

/* ─ Commands ─ */
const CMD = {
  help: () => [
    '<span class="t-ok">Available commands:</span>',
    '  <span class="t-cmd">open &lt;file&gt;</span>      — open a file (e.g. open home.html)',
    '  <span class="t-cmd">theme &lt;name&gt;</span>     — switch theme (e.g. theme tokyo-night)',
    '  <span class="t-cmd">themes</span>           — list all themes',
    '  <span class="t-cmd">ls</span>               — list all files',
    '  <span class="t-cmd">whoami</span>           — about Rakib',
    '  <span class="t-cmd">skills</span>           — tech stack overview',
    '  <span class="t-cmd">contact</span>          — contact info',
    '  <span class="t-cmd">neofetch</span>         — system info card',
    '  <span class="t-cmd">git log</span>          — commit history',
    '  <span class="t-cmd">git status</span>       — repo status',
    '  <span class="t-cmd">date</span>             — current date &amp; time',
    '  <span class="t-cmd">clear</span>            — clear terminal',
  ],
  ls: () => [
    '<span class="t-ok">RAKIB-PORTFOLIO/</span>',
    ...FILES.filter(f => f.id !== 'settings').map(f =>
      `  <span class="fi-dot ${f.dot}" style="display:inline-block;width:8px;height:8px;border-radius:2px;vertical-align:middle;margin-right:6px;"></span>${f.label}`
    ),
  ],
  whoami: () => [
    '<span class="t-ok">Md. Rakib Hasan</span>',
    '  Final-year CSE @ AUST · CGPA 3.75',
    '  Competitive Programmer · Software Developer · Technical Leader',
    '  President — AUST Programming and Informatics Club',
    '  Champion — Learnathon 3.0 · #122 ICPC Dhaka Regional',
  ],
  skills: () => [
    '<span class="t-ok">Tech Stack:</span>',
    '  <span class="kw">Languages</span>: C++, C, Python, Java, Dart, JS, C#',
    '  <span class="fn">Web/Mobile</span>: Flutter, HTML/CSS, ASP.NET MVC, PHP',
    '  <span class="str">Databases</span>: MySQL, Supabase, SQL Server, Firebase',
    '  <span class="type">Tools</span>:     Docker, GitHub Actions, Judge0, OpenCV',
  ],
  contact: () => [
    '<span class="t-ok">Contact:</span>',
    '  Email    : <a href="mailto:rakibhasan4101@gmail.com" style="color:var(--accent)">rakibhasan4101@gmail.com</a>',
    '  GitHub   : <a href="https://github.com/afnanrakib" target="_blank" style="color:var(--accent)">github.com/afnanrakib</a>',
    '  LinkedIn : <a href="https://linkedin.com/in/afnanhasanrakib" target="_blank" style="color:var(--accent)">linkedin.com/in/afnanhasanrakib</a>',
  ],
  themes: () => [
    '<span class="t-ok">Available themes:</span>',
    ...Object.entries(THEMES).map(([id, t]) =>
      `  ${id === activeTheme ? '<span style="color:var(--green)">✓</span>' : ' '} <span class="t-cmd">${id}</span> — ${t.label}`
    ),
    '<span class="t-ok">Usage: theme &lt;id&gt;</span>',
  ],
  clear: () => { termOutput.innerHTML = ''; return []; },
  neofetch: () => [
    '  <span style="color:var(--accent)">          ████████</span>   <span style="color:var(--tx);font-weight:700">rakib</span><span style="color:var(--tx3)">@</span><span style="color:var(--accent);font-weight:700">aust</span>',
    '  <span style="color:var(--accent)">       ████████████████</span>  <span style="color:var(--tx3)">─────────────────</span>',
    '  <span style="color:var(--accent)">     ████████████████████</span> <span style="color:var(--a2)">OS</span>       Windows 11 / Dhaka',
    '  <span style="color:var(--accent)">    ██████████████████████</span><span style="color:var(--a2)">Role</span>     Software Developer',
    '  <span style="color:var(--accent)">   ██████████████████████</span> <span style="color:var(--a2)">Major</span>    CSE @ AUST',
    '  <span style="color:var(--accent)">   ██████████████████████</span> <span style="color:var(--a2)">CGPA</span>     3.75 / 4.00',
    '  <span style="color:var(--accent)">    ██████████████████████</span><span style="color:var(--a2)">ICPC</span>     #122 Dhaka Regional',
    '  <span style="color:var(--accent)">     ████████████████████</span> <span style="color:var(--a2)">Club</span>     President · AUST PIC',
    '  <span style="color:var(--accent)">       ████████████████</span>  <span style="color:var(--a2)">Trophy</span>   Learnathon 3.0 Champion',
    '  <span style="color:var(--accent)">          ████████</span>   <span style="color:var(--a2)">Theme</span>    ' + (THEMES[activeTheme]?.label || 'Dark Default'),
    '                             <span style="color:var(--a2)">Editor</span>   VS Code Portfolio v2.0',
    '',
    '    <span style="background:#818cf8;color:#000;padding:0 4px"> </span><span style="background:#7aa2f7;color:#000;padding:0 4px"> </span><span style="background:#cba6f7;color:#000;padding:0 4px"> </span><span style="background:#88c0d0;color:#000;padding:0 4px"> </span><span style="background:#f59e0b;color:#000;padding:0 4px"> </span>',
  ],
  'git log': () => [
    '<span style="color:#f59e0b">commit a3f9b2c</span> <span style="color:var(--accent)">(HEAD → main, origin/main)</span>',
    '<span style="color:var(--tx3)">Author: Md. Rakib Hasan &lt;rakibhasan4101@gmail.com&gt;</span>',
    '<span style="color:var(--tx3)">Date:   ' + new Date().toDateString() + '</span>',
    '    feat: portfolio v2.0 — VS Code IDE themed',
    '',
    '<span style="color:#f59e0b">commit 7e84d1f</span>',
    '<span style="color:var(--tx3)">Author: Md. Rakib Hasan &lt;rakibhasan4101@gmail.com&gt;</span>',
    '    feat: AI Copilot, themes, zoom, fullscreen',
    '',
    '<span style="color:#f59e0b">commit 3c12ab8</span>',
    '    add: 6 projects · SOHOJOGI, AUST CODE REALM, HOMEHUTBD…',
    '',
    '<span style="color:#f59e0b">commit f0e1234</span>',
    '    initial commit: RAKIB-PORTFOLIO v1.0',
  ],
  'git status': () => [
    '<span style="color:var(--accent)">On branch main</span>',
    'Your branch is up to date with \'origin/main\'.',
    '',
    '<span style="color:var(--green)">nothing to commit, working tree clean</span>',
    '<span style="color:var(--tx3)">(all 11 files tracked and indexed)</span>',
  ],
  date: () => [new Date().toString()],
};

function addTermLine(html) {
  const p = document.createElement('p');
  p.innerHTML = html;
  termOutput.appendChild(p);
  termOutput.scrollTop = termOutput.scrollHeight;
}

termForm.addEventListener('submit', e => {
  e.preventDefault();
  const raw = termInput.value.trim();
  if (!raw) return;
  termInput.value = '';
  addTermLine(`<span class="tp">guest@rakib:~$</span> ${raw}`);

  const [cmd, ...args] = raw.toLowerCase().split(/\s+/);

  if (cmd === 'open') {
    const id = args[0];
    const f = FILES.find(f => f.id === id || f.label.toLowerCase() === id);
    if (f) { openFile(f.id); addTermLine(`<span class="t-ok">[ok] Opened ${f.label}</span>`); }
    else addTermLine(`<span class="t-err">[err] Unknown file: ${args[0] || '?'}. Try <strong>ls</strong>.</span>`);
  } else if (cmd === 'theme') {
    const id = args[0];
    if (THEMES[id]) { applyTheme(id); addTermLine(`<span class="t-ok">[ok] Theme set to: ${THEMES[id].label}</span>`); }
    else addTermLine(`<span class="t-err">[err] Unknown theme: ${args[0] || '?'}. Try <strong>themes</strong> to list.</span>`);
  } else if (cmd === 'git') {
    const sub = args[0];
    const key = 'git ' + sub;
    if (CMD[key]) CMD[key]().forEach(l => addTermLine(l));
    else addTermLine(`<span class="t-err">[err] git: '${sub}' is not a git command. Try git log or git status.</span>`);
  } else if (CMD[cmd]) {
    CMD[cmd]().forEach(l => addTermLine(l));
  } else {
    addTermLine(`<span class="t-err">[err] Unknown command: ${cmd}. Type <strong>help</strong>.</span>`);
  }
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
const isMobile = () => window.innerWidth <= 600;
let zoomLevel = isMobile() ? 100 : 110;
const ZOOM_STEP = 10, ZOOM_MIN = 60, ZOOM_MAX = 150;

function setZoom(pct) {
  zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pct));
  const scale = zoomLevel / 100;
  const app = document.getElementById('app');
  if (isMobile()) {
    // Never scale on mobile — transform: scale() creates a stacking context
    // that breaks position:fixed for the sidebar overlay and backdrop
    app.style.transform = '';
    app.style.width = '';
    app.style.height = '';
  } else {
    app.style.transformOrigin = 'top left';
    app.style.transform = `scale(${scale})`;
    app.style.width  = `${(1 / scale) * 100}vw`;
    app.style.height = `${(1 / scale) * 100}vh`;
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
   AI COPILOT
════════════════════════════════ */
const vscBody    = document.querySelector('.vsc-body');
const copPanel   = document.getElementById('copilot-panel');
const copMsgs    = document.getElementById('cop-messages');
const copForm    = document.getElementById('cop-form');
const copInput   = document.getElementById('cop-input');

const COPILOT_RESPONSES = [
  {
    keys: ['about', 'who', 'rakib', 'tell'],
    text: `**Rakib** is a final-year CSE student at AUST (CGPA 3.75) who blends algorithmic precision with full-stack product development.\n\nHe's the **President** of the AUST Programming Club, a **Learnathon 3.0 Champion**, and has ranked **#122 at ICPC Dhaka Regional**. He builds everything from cross-platform mobile apps to competitive programming judges.`,
  },
  {
    keys: ['project', 'built', 'work', 'apps'],
    text: `Rakib's key projects:\n\n• **SOHOJOGI** — Flutter/Supabase household services platform (Learnathon champion project)\n• **AUST CODE REALM** — Online judge with IDE integration, PHP/MySQL\n• **HOMEHUTBD** — ASP.NET property platform with ML-powered pricing\n• **BHROMON** — AI travel assistant with GPT-4 + Google Maps\n• **IRREVOCABLE-ETERNITY** — 2D dungeon fighter in C++/OpenGL`,
  },
  {
    keys: ['stack', 'skill', 'tech', 'language', 'tool'],
    text: `**Languages:** C++ (95%), C, Python, Java, Dart, JS, C#\n\n**Mobile/Web:** Flutter, HTML/CSS, ASP.NET MVC, Bootstrap, PHP\n\n**Databases:** MySQL, Supabase, SQL Server, Firebase\n\n**Tools:** Docker, GitHub Actions, Judge0, OpenCV, Git`,
  },
  {
    keys: ['hire', 'job', 'opportunity', 'recruit', 'work with'],
    text: `Rakib is **open to new opportunities** — full-time roles, internships, and freelance collaborations.\n\nBest way to reach him:\n📧 **rakibhasan4101@gmail.com**\n💼 <a href="https://linkedin.com/in/afnanhasanrakib" target="_blank">LinkedIn</a>\n\nHe's based in Dhaka, Bangladesh and available immediately.`,
  },
  {
    keys: ['contact', 'email', 'reach', 'find'],
    text: `📧 **Email:** rakibhasan4101@gmail.com\n🐙 **GitHub:** <a href="https://github.com/afnanrakib" target="_blank">github.com/afnanrakib</a>\n💼 **LinkedIn:** <a href="https://linkedin.com/in/afnanhasanrakib" target="_blank">afnanhasanrakib</a>\n⚔️ **Codeforces:** afnanrakib\n📍 **Location:** Dhaka, Bangladesh`,
  },
  {
    keys: ['achieve', 'award', 'rank', 'contest', 'icpc', 'champion'],
    text: `🏆 **Learnathon 3.0 Champion** — Geeky Solutions, 2025\n🏆 **Intra AUST Programming Champion** — CSE Carnival 4.0, 2024\n**#35** BUBT IUCPC National (Team AUST_DEADCODER)\n**#97** AUST Inter-University PC\n**#122** ICPC Dhaka Regional (Onsite)\n🥈 Research Odyssey Runner-Up\n🎓 Academic Merit Scholarship — Top 5% of dept`,
  },
  {
    keys: ['experience', 'leader', 'club', 'president', 'role'],
    text: `Rakib holds multiple leadership positions:\n\n• **President** — AUST Programming and Informatics Club\n• **Vice President** — AUST CSE Society\n• **ACM Coordinator** — AUST CP Community\n• **Team Leader** — Learnathon 3.0 (Geeky Solutions)`,
  },
];

function copilotReply(question) {
  const q = question.toLowerCase();
  for (const entry of COPILOT_RESPONSES) {
    if (entry.keys.some(k => q.includes(k))) return entry.text;
  }
  return `I'm not sure about that specific question! Try asking about:\n\n• **Projects** Rakib has built\n• His **Tech Stack**\n• **Achievements & Rankings**\n• **Experience** & leadership\n• How to **hire** or **contact** him`;
}

function addCopMsg(text, role = 'ai') {
  const msg = document.createElement('div');
  msg.className = `cop-msg cop-msg-${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'cop-avatar';
  avatar.innerHTML = role === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
  const bubble = document.createElement('div');
  bubble.className = 'cop-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  copMsgs.appendChild(msg);
  copMsgs.scrollTop = copMsgs.scrollHeight;
}

function sendCopilotMsg(question) {
  if (!question.trim()) return;
  addCopMsg(question, 'user');
  copInput.value = '';

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'cop-msg cop-msg-ai';
  typing.innerHTML = '<div class="cop-avatar"><i class="fas fa-robot"></i></div><div class="cop-bubble cop-typing"><span></span><span></span><span></span></div>';
  copMsgs.appendChild(typing);
  copMsgs.scrollTop = copMsgs.scrollHeight;

  setTimeout(() => {
    typing.remove();
    addCopMsg(copilotReply(question), 'ai');
  }, 700 + Math.random() * 400);
}

copForm?.addEventListener('submit', e => {
  e.preventDefault();
  sendCopilotMsg(copInput.value.trim());
});

document.querySelectorAll('.cop-chip').forEach(chip => {
  chip.addEventListener('click', () => sendCopilotMsg(chip.dataset.q));
});

document.getElementById('cop-close')?.addEventListener('click', () => {
  vscBody.classList.remove('copilot-open');
  copPanel.classList.add('hidden');
});
document.getElementById('ab-copilot')?.addEventListener('click', toggleCopilot);

function toggleCopilot() {
  const open = vscBody.classList.toggle('copilot-open');
  copPanel.classList.toggle('hidden', !open);
  if (open) {
    document.getElementById('ab-copilot').classList.add('active');
    copInput.focus();
  } else {
    document.getElementById('ab-copilot').classList.remove('active');
  }
}

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
  const expected = isMobile() ? 100 : 110;
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

/* ════════════════════════════════
   PDF.js VIEWER
════════════════════════════════ */
(function () {
  const canvas    = document.getElementById('pdf-canvas');
  const loadingEl = document.getElementById('pdf-loading');
  const pageInfo  = document.getElementById('pdf-page-info');
  const prevBtn   = document.getElementById('pdf-prev');
  const nextBtn   = document.getElementById('pdf-next');
  const zoomSel   = document.getElementById('pdf-zoom-sel');
  const wrap      = document.getElementById('pdf-canvas-wrap');
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  let pdfDoc      = null;
  let curPage     = 1;
  let pageWidth1  = 612; // actual page width at scale 1 (pts)
  let rendering   = false;
  let queued      = null;

  function getScale() {
    const val = zoomSel ? zoomSel.value : '1.0';
    if (val === 'fit') return Math.max(0.4, (wrap.clientWidth - 48) / pageWidth1);
    return parseFloat(val) || 1.0;
  }

  function renderPage(num) {
    if (!pdfDoc) return;
    if (rendering) { queued = num; return; }
    rendering = true;
    canvas.style.opacity = '0.4';

    pdfDoc.getPage(num).then(page => {
      const vp = page.getViewport({ scale: getScale() });
      canvas.width  = vp.width;
      canvas.height = vp.height;
      return page.render({ canvasContext: ctx, viewport: vp }).promise;
    }).then(() => {
      rendering = false;
      canvas.style.opacity = '1';
      curPage = num;
      pageInfo.textContent = `${num} / ${pdfDoc.numPages}`;
      prevBtn.disabled = num <= 1;
      nextBtn.disabled = num >= pdfDoc.numPages;
      if (queued !== null) { const q = queued; queued = null; renderPage(q); }
    }).catch(err => {
      rendering = false;
      console.error('PDF render error:', err);
    });
  }

  function showErr(msg) {
    loadingEl.innerHTML =
      `<i class="fas fa-exclamation-triangle" style="color:#f87171;font-size:2rem"></i>
       <span style="color:var(--tx2);font-size:0.82rem;text-align:center;max-width:300px">${msg}</span>
       <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px">
         <a href="resources/Md. Rakib Hasan.pdf" target="_blank" rel="noopener" class="res-dl-btn" style="font-size:0.75rem;padding:5px 12px">
           <i class="fas fa-external-link-alt"></i> Open in new tab
         </a>
         <a href="resources/Md. Rakib Hasan.pdf" download="Md. Rakib Hasan CV.pdf" class="res-dl-btn res-dl-btn--ghost" style="font-size:0.75rem;padding:5px 12px">
           <i class="fas fa-download"></i> Download
         </a>
       </div>`;
  }

  let loaded = false;
  window.pdfViewerLoad = async function () {
    if (loaded) return;
    loaded = true;

    loadingEl.style.display = 'flex';
    canvas.style.display    = 'none';

    // Step 1: check if PDF.js is available
    if (typeof pdfjsLib === 'undefined') {
      showErr('PDF viewer library failed to load. Please use the buttons below.');
      return;
    }

    // Worker version must match the main library
    const pdfVer = (typeof pdfjsLib.version === 'string' && pdfjsLib.version) ? pdfjsLib.version : '3.11.174';
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVer}/pdf.worker.min.js`;

    // Step 2: load PDF directly from the repo file
    const pdfUrl = encodeURI('resources/Md. Rakib Hasan.pdf');
    try {
      pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    } catch (e) {
      showErr(`Could not load PDF: ${e.message}`);
      return;
    }

    // Step 4: get real page width for fit-width scaling
    const pg1 = await pdfDoc.getPage(1);
    pageWidth1 = pg1.getViewport({ scale: 1 }).width;

    loadingEl.style.display = 'none';
    canvas.style.display    = 'block';
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    renderPage(1);

    document.getElementById('pdf-open-btn')?.addEventListener('click', () => {
      window.open(encodeURI('resources/Md. Rakib Hasan.pdf'), '_blank', 'noopener');
    });
  };

  prevBtn?.addEventListener('click',  () => { if (curPage > 1) renderPage(curPage - 1); });
  nextBtn?.addEventListener('click',  () => { if (pdfDoc && curPage < pdfDoc.numPages) renderPage(curPage + 1); });
  zoomSel?.addEventListener('change', () => { if (pdfDoc) renderPage(curPage); });

  let resizeTid;
  window.addEventListener('resize', () => {
    if (!pdfDoc || zoomSel?.value !== 'fit') return;
    clearTimeout(resizeTid);
    resizeTid = setTimeout(() => renderPage(curPage), 240);
  });
})();

/* ════════════════════════════════
   FIND WIDGET (Ctrl+F)
════════════════════════════════ */
(function initFind() {
  const widget   = document.getElementById('find-widget');
  const input    = document.getElementById('find-input');
  const counter  = document.getElementById('find-counter');
  const btnPrev  = document.getElementById('find-prev');
  const btnNext  = document.getElementById('find-next');
  const btnCase  = document.getElementById('find-case');
  const btnClose = document.getElementById('find-close');
  if (!widget) return;

  let matches    = [];
  let matchIdx   = -1;
  let caseSensitive = false;
  // Store originals so we can restore on close
  const originals = new Map();

  function getActivePane() {
    return document.querySelector('.pane.active');
  }

  function saveOriginal(pane) {
    if (!originals.has(pane)) originals.set(pane, pane.innerHTML);
  }

  function restoreOriginals() {
    originals.forEach((html, pane) => { pane.innerHTML = html; });
    originals.clear();
    matches = []; matchIdx = -1;
    counter.textContent = 'No results';
  }

  function highlightPane(pane, term) {
    saveOriginal(pane);
    pane.innerHTML = originals.get(pane); // start fresh from saved HTML

    if (!term) { counter.textContent = 'No results'; matches = []; matchIdx = -1; return; }

    const flags = caseSensitive ? 'g' : 'gi';
    let regex;
    try { regex = new RegExp(escapeRegex(term), flags); }
    catch { return; }

    walkAndMark(pane, regex);

    matches = Array.from(pane.querySelectorAll('mark.find-hl'));
    if (!matches.length) { counter.textContent = 'No results'; matchIdx = -1; return; }

    matchIdx = 0;
    activateMatch(matchIdx);
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function walkAndMark(root, regex) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => {
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.closest('.find-widget')) return NodeFilter.FILTER_REJECT;
        if (p.tagName === 'MARK') return NodeFilter.FILTER_REJECT;
        return regex.test(n.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      regex.lastIndex = 0;
      const text = node.textContent;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      regex.lastIndex = 0;
      while ((m = regex.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'find-hl';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
        if (m[0].length === 0) { regex.lastIndex++; }
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function activateMatch(idx) {
    matches.forEach(m => m.classList.remove('find-hl--active'));
    if (!matches.length || idx < 0) return;
    matchIdx = ((idx % matches.length) + matches.length) % matches.length;
    matches[matchIdx].classList.add('find-hl--active');
    matches[matchIdx].scrollIntoView({ block: 'center', behavior: 'smooth' });
    counter.textContent = `${matchIdx + 1} of ${matches.length}`;
  }

  function openFind() {
    widget.classList.remove('hidden');
    input.focus();
    input.select();
    const term = input.value.trim();
    if (term) highlightPane(getActivePane(), term);
  }

  function closeFind() {
    widget.classList.add('hidden');
    restoreOriginals();
    input.value = '';
  }

  input.addEventListener('input', () => {
    const pane = getActivePane();
    if (!pane) return;
    restoreOriginals();
    highlightPane(pane, input.value.trim());
  });

  btnNext.addEventListener('click',  () => activateMatch(matchIdx + 1));
  btnPrev.addEventListener('click',  () => activateMatch(matchIdx - 1));
  btnClose.addEventListener('click', closeFind);

  btnCase.addEventListener('click', () => {
    caseSensitive = !caseSensitive;
    btnCase.classList.toggle('active', caseSensitive);
    const pane = getActivePane();
    if (pane && input.value.trim()) { restoreOriginals(); highlightPane(pane, input.value.trim()); }
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.shiftKey ? activateMatch(matchIdx - 1) : activateMatch(matchIdx + 1); e.preventDefault(); }
    if (e.key === 'Escape') closeFind();
  });

  // Ctrl+F opens find
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      openFind();
    }
    if (e.key === 'Escape' && !widget.classList.contains('hidden')) {
      closeFind();
    }
  });

  // Re-run highlight when the active pane changes
  const origOpenFile = openFile;
  // Patch: clear stale highlights when switching files
  document.addEventListener('click', e => {
    const treeFile = e.target.closest('[data-file]');
    if (treeFile && !widget.classList.contains('hidden')) {
      setTimeout(() => {
        restoreOriginals();
        const term = input.value.trim();
        if (term) highlightPane(getActivePane(), term);
      }, 80);
    }
  });
})();
