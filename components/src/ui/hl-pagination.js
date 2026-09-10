/* ============================================================
   PAGINATION
============================================================ */
class HlPagination extends HTMLElement {
  static get observedAttributes() { return ['page', 'total']; }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { if (this.dataset.rendered) this._render(); }
  _render() {
    this.dataset.rendered = 'true';
    const total    = parseInt(this.getAttribute('total'))    || 1;
    const current  = parseInt(this.getAttribute('page'))     || 1;
    const siblings = parseInt(this.getAttribute('siblings')) || 1;
    const pages    = [];
    const range    = (from, to) => { for (let i = from; i <= to; i++) pages.push(i); };
    range(Math.max(1, current - siblings), Math.min(total, current + siblings));
    if (!pages.includes(1)) { if (pages[0] > 2) pages.unshift('...'); pages.unshift(1); }
    if (!pages.includes(total)) { if (pages[pages.length - 1] < total - 1) pages.push('...'); pages.push(total); }
    const btns = pages.map(p => p === '...'
      ? `<span class="hl-page-ellipsis">…</span>`
      : `<button class="hl-page-btn${p === current ? ' is-active' : ''}" aria-label="${p}ページ目" ${p === current ? 'aria-current="page"' : ''} data-page="${p}">${p}</button>`
    ).join('');
    this.innerHTML = `<nav class="hl-pagination" aria-label="ページネーション">
      <button class="hl-page-btn" data-page="${current - 1}" aria-label="前のページ"${current <= 1 ? ' disabled' : ''}>‹</button>
      ${btns}
      <button class="hl-page-btn" data-page="${current + 1}" aria-label="次のページ"${current >= total ? ' disabled' : ''}>›</button>
    </nav>`;
    this.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (isNaN(p) || p < 1 || p > total) return;
        this.setAttribute('page', p);
        this.dispatchEvent(new CustomEvent('hl-page-change', { detail: { page: p }, bubbles: true }));
      });
    });
  }
}
customElements.define('hl-pagination', HlPagination);
