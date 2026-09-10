class HlButton extends HTMLElement {
  static get observedAttributes() { return ['loading', 'type', 'variant', 'size', 'selected', 'disabled']; }
  
  connectedCallback() {
    if (this.dataset.rendered && !this.hasAttribute('loading')) return;
    this.dataset.rendered = 'true';
    if (!this._originalContent) {
      this._originalContent = this.innerHTML;
    }
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (this.dataset.rendered && oldVal !== newVal) {
      this._render();
    }
  }

  _render() {
    const href = this.getAttribute('href');
    // type と variant の両方の指定に対応 (下位互換性確保)
    const variant = this.getAttribute('variant') || this.getAttribute('type') || 'primary';
    const size = this.getAttribute('size'); // 'sm', 'lg'
    const isBlock = this.hasAttribute('block');
    const isSelected = this.hasAttribute('selected') || this.classList.contains('active') || this.classList.contains('is-selected');
    const isDisabled = this.hasAttribute('disabled');
    const icon = this.getAttribute('icon') || '';
    const target = this.getAttribute('target') || '';
    const isLoading = this.hasAttribute('loading');
    
    const sizeClass = size ? `hl-btn--${size}` : '';
    const selectedClass = isSelected ? 'is-selected' : '';
    const disabledClass = isDisabled ? 'is-disabled' : '';
    const baseClass = `hl-btn hl-btn--${variant} ${sizeClass} ${selectedClass} ${disabledClass} ${isBlock ? 'hl-btn--block' : ''} ${isLoading ? 'is-loading' : ''}`;
    
    const spinnerHtml = `<span class="hl-spinner"></span>`;
    let iconHtml = '';
    if (icon) {
      if (typeof HL_ICONS !== 'undefined' && HL_ICONS[icon]) {
        iconHtml = `<span aria-hidden="true">${HL_ICONS[icon]}</span>`;
      } else {
        iconHtml = `<span aria-hidden="true">${icon}</span>`;
      }
    }
    const targetAttr = target ? `target="${target}" rel="noopener noreferrer"` : '';
    
    const innerStyle = isLoading ? 'visibility: hidden; opacity: 0;' : 'transition: opacity 0.2s;';
    const contentHtml = `<span style="display:inline-flex; align-items:center; gap:0.5rem; ${innerStyle}">${iconHtml}${this._originalContent}</span>`;
    const finalInner = isLoading ? `${spinnerHtml}${contentHtml}` : contentHtml;

    if (href) {
      this.innerHTML = `<a href="${href}" class="${baseClass}" ${targetAttr}>${finalInner}</a>`;
    } else {
      this.innerHTML = `<button class="${baseClass}" ${isLoading || isDisabled ? 'disabled' : ''} type="button">${finalInner}</button>`;
    }
  }
}
customElements.define('hl-button', HlButton);
