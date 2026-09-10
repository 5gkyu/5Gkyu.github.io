/* ============================================================
   CHIP
============================================================ */
class HlChip extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const color     = this.getAttribute('color')    || '';
    const value     = this.getAttribute('value')    || '';
    const removable = this.hasAttribute('removable');
    const label     = this.innerHTML.trim() || value;
    const colorCls  = color ? ` hl-chip--${color}` : '';
    const closeBtn  = removable ? `<button class="hl-chip__close" aria-label="${label}を削除">✕</button>` : '';
    this.innerHTML  = `<span class="hl-chip${colorCls}">${label}${closeBtn}</span>`;
    if (removable) {
      this.querySelector('.hl-chip__close').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hl-chip-remove', { detail: { value: value || label }, bubbles: true }));
        this.remove();
      });
    }
  }
}
customElements.define('hl-chip', HlChip);
