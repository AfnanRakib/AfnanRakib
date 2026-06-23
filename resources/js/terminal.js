/* ════ TERMINAL ════ */
const _termPanel  = document.getElementById('terminal-panel');
const _termOutput = document.getElementById('term-output');
const _termForm   = document.getElementById('term-form');
const _termInput  = document.getElementById('term-input');

document.getElementById('ab-terminal').addEventListener('click', () => {
  _termPanel.classList.toggle('open');
});
document.getElementById('term-close').addEventListener('click', () => {
  _termPanel.classList.remove('open');
});
document.getElementById('mb-terminal-toggle').addEventListener('click', () => {
  _termPanel.classList.toggle('open');
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
  _termOutput.appendChild(p);
  _termOutput.scrollTop = _termOutput.scrollHeight;
}

_termForm.addEventListener('submit', e => {
  e.preventDefault();
  const raw = _termInput.value.trim();
  if (!raw) return;
  _termInput.value = '';
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
