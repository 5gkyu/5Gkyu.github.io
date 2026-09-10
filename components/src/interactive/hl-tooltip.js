/* ============================================================
   INTERACTION COMPONENTS
============================================================ */
class HlTooltip extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const tip = this.getAttribute('tip') || '';
    const inner = this.innerHTML;
    this.innerHTML = `<span class="hl-tooltip-wrap" tabindex="0">${inner}<span class="hl-tooltip-tip" role="tooltip">${tip}</span></span>`;
  }
}
customElements.define('hl-tooltip', HlTooltip);
