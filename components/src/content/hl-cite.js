/* ============================================================
   HL-CITE — 参考文献・引用元情報
   属性:
     title     — 書名・記事名
     author    — 著者名
     publisher — 出版社・サイト名
     year      — 年
     url       — URL
     accessed  — 参照日（例: 2026.05.17）
============================================================ */
class HlCite extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title     = this.getAttribute('title')     || '';
    const author    = this.getAttribute('author')    || '';
    const publisher = this.getAttribute('publisher') || '';
    const year      = this.getAttribute('year')      || '';
    const url       = this.getAttribute('url')       || '';
    const accessed  = this.getAttribute('accessed')  || '';
    const metaParts = [author, publisher, year].filter(Boolean).join(' / ');
    const titleHtml = title     ? `<span class="hl-cite__title">${title}</span>` : '';
    const metaHtml  = metaParts ? `<span class="hl-cite__meta">${metaParts}</span>` : '';
    const urlHtml   = url
      ? `<span class="hl-cite__url"><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${accessed ? `（${accessed} 参照）` : ''}</span>`
      : '';
    this.innerHTML = `<div class="hl-cite" role="note">${titleHtml}${metaHtml}${urlHtml}</div>`;
  }
}
customElements.define('hl-cite', HlCite);
