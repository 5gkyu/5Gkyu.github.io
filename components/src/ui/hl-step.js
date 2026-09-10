class HlStep extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const content = this.innerHTML;
    this.innerHTML = `<div class="hl-step-container">${content}</div>`;
  }
}
customElements.define('hl-step', HlStep);

class HlStepItem extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const num = this.getAttribute('num') || '*';
    const title = this.getAttribute('title') || '';
    const content = this.innerHTML;
    const titleHtml = title ? `<div class="hl-step-title">${title}</div>` : '';
    this.innerHTML = `<div class="hl-step-item"><div class="hl-step-marker" aria-hidden="true">${num}</div><div class="hl-step-body">${titleHtml}<div class="hl-content-text">${content}</div></div></div>`;
  }
}
customElements.define('hl-step-item', HlStepItem);
