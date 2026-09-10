/* ============================================================
   HL-FIGURE — 画像＋キャプション＋出典
   属性:
     src        — 画像URL（省略時は子要素の<img>をそのまま使用）
     alt        — alt テキスト
     caption    — キャプション文字列
     source     — 出典名
     source-url — 出典URL
============================================================ */
class HlFigure extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const caption   = this.getAttribute('caption')    || '';
    const src       = this.getAttribute('src')        || '';
    const alt       = this.getAttribute('alt')        || caption;
    const source    = this.getAttribute('source')     || '';
    const sourceUrl = this.getAttribute('source-url') || '';
    const imgHtml   = src
      ? `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`
      : this.innerHTML;
    const captionHtml = caption ? `<p class="hl-figure__caption">${caption}</p>` : '';
    const sourceHtml  = source
      ? (sourceUrl
          ? `<p class="hl-figure__source">出典: <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${source}</a></p>`
          : `<p class="hl-figure__source">出典: ${source}</p>`)
      : '';
    this.innerHTML = `<figure class="hl-figure">${imgHtml}<figcaption>${captionHtml}${sourceHtml}</figcaption></figure>`;
  }
}
customElements.define('hl-figure', HlFigure);
