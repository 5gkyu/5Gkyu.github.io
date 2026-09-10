class HlPopover extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const label = this.getAttribute('label') || 'メニュー';
    const inner = this.innerHTML;
    this.innerHTML = `<div class="hl-popover-wrap"><button class="hl-btn hl-btn--secondary" aria-haspopup="true" aria-expanded="false" style="font-size:0.85rem;padding:0.5rem 1rem;">${label} ▾</button><div class="hl-popover-panel hl-content-text">${inner}</div></div>`;
    const btn   = this.querySelector('button');
    const panel = this.querySelector('.hl-popover-panel');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', () => {
      panel.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }
}
customElements.define('hl-popover', HlPopover);
