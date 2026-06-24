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
