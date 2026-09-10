import { LitElement, html } from 'https://esm.sh/lit';

/**
 * 折りたたみアコーディオンコンポーネント (Lit製)
 */
class HlAccordion extends LitElement {
  static properties = {
    title: { type: String },
    isOpen: { type: Boolean, state: true }
  };

  constructor() {
    super();
    this.title = '詳細を見る';
    this.isOpen = false;
    this.contentId = 'acc-' + Math.random().toString(36).substr(2, 9);
  }

  createRenderRoot() {
    return this;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  render() {
    return html`
      <div class="hl-accordion ${this.isOpen ? 'is-open' : ''}">
        <button 
          class="hl-accordion__header" 
          aria-expanded="${this.isOpen}" 
          aria-controls="${this.contentId}"
          @click="${this.toggle}"
          type="button"
        >
          <span>${this.title}</span>
          <span class="hl-accordion__icon" aria-hidden="true" style="transform: ${this.isOpen ? 'rotate(180deg)' : 'none'}; transition: transform 0.25s ease;">▼</span>
        </button>
        <div class="hl-accordion__content-wrapper" id="${this.contentId}" aria-hidden="${!this.isOpen}">
          <div class="hl-accordion__content">
            <div class="hl-accordion__content-inner hl-content-text">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('hl-accordion')) {
  customElements.define('hl-accordion', HlAccordion);
}
