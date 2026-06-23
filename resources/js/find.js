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
