/* ============================================================
   DIVIDER
============================================================ */
class HlDivider extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const variant = this.getAttribute('variant') || '';
    const cls     = variant ? ` hl-divider--${variant}` : '';
    const label   = this.innerHTML.trim();
    this.innerHTML = `<div class="hl-divider${cls}" role="separator">${label}</div>`;
  }
}
customElements.define('hl-divider', HlDivider);
