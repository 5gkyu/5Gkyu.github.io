class HlCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title') || '';
    const image = this.getAttribute('image') || '';
    const href = this.getAttribute('href') || '#';
    const imageHtml = image ? `<div class="hl-card__image-wrap"><img src="${image}" loading="lazy" decoding="async" alt=""></div>` : '';
    this.innerHTML = `<a href="${href}" class="hl-card">${imageHtml}<div class="hl-card__content"><div class="hl-card__header"><h3 class="hl-card__title">${title}</h3></div><div class="hl-card__body hl-content-text">${this.innerHTML}</div><div class="hl-card__footer"><span>Learn More</span></div></div></a>`;
  }
}
customElements.define('hl-card', HlCard);

class HlCardGrid extends HTMLElement {
  connectedCallback() {
    // グリッドコンテナ: cols属性でCSS変数を制御するだけ。
    // レンダリング不要（CSS側で制御）。
  }
}
customElements.define('hl-card-grid', HlCardGrid);
