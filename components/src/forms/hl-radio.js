class HlRadio extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name    = this.getAttribute('name') || 'radio';
    const label   = this.getAttribute('label') || '';
    const value   = this.getAttribute('value') || '';
    const checked = this.hasAttribute('checked') ? 'checked' : '';
    this.innerHTML = `<label class="hl-check-label"><input type="radio" name="${name}" value="${value}" ${checked}><span class="hl-radio-box" aria-hidden="true"></span>${label}</label>`;
  }
}
customElements.define('hl-radio', HlRadio);
