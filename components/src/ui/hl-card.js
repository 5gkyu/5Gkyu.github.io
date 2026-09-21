class HlCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const title = this.getAttribute('title') || '';
    const image = this.getAttribute('image') || '';
    const href = this.getAttribute('href');
    const footerText = this.getAttribute('footer-text');

    const rawContent = this.innerHTML;

    // 1. リンクカード (href属性がある場合)
    if (href) {
      const imageHtml = image ? `<div class="hl-card__image-wrap"><img src="${image}" loading="lazy" decoding="async" alt=""></div>` : '';
      const titleHtml = title ? `<div class="hl-card__header"><h3 class="hl-card__title">${title}</h3></div>` : '';
      const footerSpan = footerText !== null ? footerText : 'Learn More';
      const footerHtml = footerSpan ? `<div class="hl-card__footer"><span>${footerSpan}</span></div>` : '';

      this.innerHTML = `<a href="${href}" class="hl-card hl-card--link">${imageHtml}<div class="hl-card__content">${titleHtml}<div class="hl-card__body hl-content-text">${rawContent}</div>${footerHtml}</div></a>`;
    } 
    // 2. 汎用コンテナ・パネルカード (href属性がない場合)
    else {
      const imageHtml = image ? `<div class="hl-card__image-wrap"><img src="${image}" loading="lazy" decoding="async" alt=""></div>` : '';
      const titleHtml = title ? `<div class="hl-card__header"><h3 class="hl-card__title">${title}</h3></div>` : '';

      this.innerHTML = `<div class="hl-card hl-card--panel">${imageHtml}${titleHtml}<div class="hl-card__body">${rawContent}</div></div>`;
    }
  }
}
customElements.define('hl-card', HlCard);

class HlCardGrid extends HTMLElement {
  connectedCallback() {
    // グリッドコンテナ: CSS変数でカラム制御
  }
}
customElements.define('hl-card-grid', HlCardGrid);
