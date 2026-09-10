class HlToggle extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name    = this.getAttribute('name') || 'toggle';
    const label   = this.getAttribute('label') || '';
    const checked = this.hasAttribute('checked') ? 'checked' : '';
    this.innerHTML = `<label class="hl-toggle-label"><input type="checkbox" role="switch" aria-checked="${checked ? 'true' : 'false'}" name="${name}" ${checked}><span class="hl-toggle-track" aria-hidden="true"></span>${label}</label>`;
    const input = this.querySelector('input');
    input.addEventListener('change', (e) => input.setAttribute('aria-checked', e.target.checked));
  }
}
customElements.define('hl-toggle', HlToggle);
