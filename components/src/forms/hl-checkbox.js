class HlCheckbox extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name    = this.getAttribute('name') || 'checkbox';
    const label   = this.getAttribute('label') || '';
    const value   = this.getAttribute('value') || '1';
    const checked = this.hasAttribute('checked') ? 'checked' : '';
    this.innerHTML = `<label class="hl-check-label"><input type="checkbox" name="${name}" value="${value}" ${checked}><span class="hl-check-box" aria-hidden="true"></span>${label}</label>`;
  }
}
customElements.define('hl-checkbox', HlCheckbox);
