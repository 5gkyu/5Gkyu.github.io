class HlLayout extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
  }
}
customElements.define('hl-layout', HlLayout);
