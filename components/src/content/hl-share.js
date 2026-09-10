/* --- SHARE BUTTONS --- */
class HlShare extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const text = this.getAttribute('text') || 'Share';
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    this.innerHTML = `
      <div class="hl-share">
        <span class="hl-share__label">${text}</span>
        <div class="hl-share__buttons">
          <a href="https://twitter.com/intent/tweet?url=${url}&text=${title}" target="_blank" rel="noopener noreferrer" class="hl-share__btn hl-share__btn--x" title="Xでシェア">
            <img src="https://5gkyu.github.io/icon/x.png" alt="X" draggable="false" oncontextmenu="return false;">
          </a>
          <button class="hl-share__btn hl-share__btn--native" id="hl-share-native" title="OS標準のシェア">
            <svg viewBox="0 0 256 256"><path d="M176,144a40,40,0,0,0-32.6,16.7l-41.5-24.9a40.1,40.1,0,0,0,0-43.6l41.5-24.9a40,40,0,1,0-8.3-13.8l-41.5,24.9a40,40,0,1,0,0,43.6l41.5,24.9A40,40,0,1,0,176,144Z"/></svg>
          </button>
          <button class="hl-share__btn hl-share__btn--copy" title="全文をコピー">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/></svg>
          </button>
        </div>
      </div>
    `;

    const nativeBtn = this.querySelector('#hl-share-native');
    if (navigator.share) {
      nativeBtn.addEventListener('click', () => {
        navigator.share({ title: document.title, url: window.location.href });
      });
    } else {
      nativeBtn.style.display = 'none';
    }

    const copyBtn = this.querySelector('.hl-share__btn--copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const charNames = { A: 'Akari', B: 'Becky', C: 'Charlotte', D: 'Dulcie', E: 'Esmé', F: 'Fūka' };
        const container = document.querySelector('.hl-layout-main .hl-content-text');
        if (!container) return;
        const parts = [];
        function processEl(el) {
          const tag = el.tagName ? el.tagName.toLowerCase() : '';
          if (tag === 'h2' || tag === 'h3') { const t = el.textContent.trim(); if (t) parts.push('・' + t); return; }
          if (tag === 'hl-chat') {
            const char = el.getAttribute('char');
            const name = charNames[char] || char || '?';
            const bubble = el.querySelector('.hl-chat-bubble');
            const t = (bubble || el).textContent.trim();
            if (t) parts.push(name + '：' + t); return;
          }
          if (tag === 'hl-lead') { el.querySelectorAll('p').forEach(p => { const t = p.textContent.trim(); if (t) parts.push(t); }); return; }
          if (tag === 'hl-quote') {
            const source = el.getAttribute('source') || '';
            const body = el.querySelector('.hl-quote__body');
            const t = (body || el).textContent.trim();
            if (t) parts.push(source ? '「' + t + '」\n── ' + source : '「' + t + '」'); return;
          }
          if (tag === 'hl-alert') { const inner = el.querySelector('p'); const t = (inner || el).textContent.trim(); if (t) parts.push('[注] ' + t); return; }
          if (tag === 'p') { const t = el.textContent.trim(); if (t) parts.push(t); return; }
          if (tag === 'ul') { el.querySelectorAll(':scope > li').forEach(li => { parts.push('  ・' + li.textContent.trim()); }); return; }
          if (tag === 'hl-cite') {
            const t = el.getAttribute('title') || '';
            const author = el.getAttribute('author') || '';
            const publisher = el.getAttribute('publisher') || '';
            const year = el.getAttribute('year') || '';
            const href = el.getAttribute('url') || '';
            const accessed = el.getAttribute('accessed') || '';
            const meta = [author, publisher, year].filter(Boolean).join(' / ');
            const urlPart = href ? (accessed ? href + '（' + accessed + ' 参照）' : href) : '';
            const line = [t, meta, urlPart].filter(Boolean).join('\n    ');
            if (line) parts.push('[参考] ' + line); return;
          }
          if (tag === 'hl-footnotes') {
            const label = el.getAttribute('label') || '注記';
            const items = el.querySelectorAll('hl-fn-item');
            if (items.length > 0) {
              parts.push('── ' + label + ' ──');
              items.forEach(item => { const num = item.getAttribute('num') || ''; const t = item.textContent.trim(); if (t) parts.push('[' + num + '] ' + t); });
            }
            return;
          }
          if (['hl-figure', 'hl-compare', 'hl-code', 'hl-step', 'hl-accordion'].includes(tag)) return;
          for (const child of el.children) processEl(child);
        }
        for (const child of container.children) processEl(child);
        const textContent = parts.join('\n\n');
        navigator.clipboard.writeText(textContent).then(() => {
          copyBtn.classList.add('is-copied');
          copyBtn.title = 'コピーしました';
          setTimeout(() => { copyBtn.classList.remove('is-copied'); copyBtn.title = '全文をコピー'; }, 2500);
        }).catch(() => { alert('コピーに失敗しました。'); });
      });
    }
  }
}
customElements.define('hl-share', HlShare);
