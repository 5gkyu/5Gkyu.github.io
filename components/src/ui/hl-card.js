class HlCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const title = this.getAttribute('title') || '';
    const image = this.getAttribute('image') || '';
    const href = this.getAttribute('href');
    const footerText = this.getAttribute('footer-text');

    // 既存の子ノード（イベントリスナーや状態を維持）を退避
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    // 1. リンクカード (href属性がある場合)
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.className = 'hl-card hl-card--link';

      if (image) {
        const imageWrap = document.createElement('div');
        imageWrap.className = 'hl-card__image-wrap';
        imageWrap.innerHTML = `<img src="${image}" loading="lazy" decoding="async" alt="">`;
        link.appendChild(imageWrap);
      }

      const content = document.createElement('div');
      content.className = 'hl-card__content';

      if (title) {
        const header = document.createElement('div');
        header.className = 'hl-card__header';
        header.innerHTML = `<h3 class="hl-card__title">${title}</h3>`;
        content.appendChild(header);
      }

      const body = document.createElement('div');
      body.className = 'hl-card__body hl-content-text';
      body.appendChild(fragment);
      content.appendChild(body);

      const footerSpan = footerText !== null ? footerText : 'Learn More';
      if (footerSpan) {
        const footer = document.createElement('div');
        footer.className = 'hl-card__footer';
        footer.innerHTML = `<span>${footerSpan}</span>`;
        content.appendChild(footer);
      }

      link.appendChild(content);
      this.appendChild(link);
    } 
    // 2. 汎用コンテナ・パネルカード (href属性がない場合)
    else {
      const panel = document.createElement('div');
      panel.className = 'hl-card hl-card--panel';

      if (image) {
        const imageWrap = document.createElement('div');
        imageWrap.className = 'hl-card__image-wrap';
        imageWrap.innerHTML = `<img src="${image}" loading="lazy" decoding="async" alt="">`;
        panel.appendChild(imageWrap);
      }

      if (title) {
        const header = document.createElement('div');
        header.className = 'hl-card__header';
        header.innerHTML = `<h3 class="hl-card__title">${title}</h3>`;
        panel.appendChild(header);
      }

      const body = document.createElement('div');
      body.className = 'hl-card__body';
      body.appendChild(fragment);
      panel.appendChild(body);

      this.appendChild(panel);
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
