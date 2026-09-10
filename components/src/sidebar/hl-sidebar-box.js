class HlSidebarBox extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title');
    const icon = this.getAttribute('icon');
    let iconHtml = '';
    if (icon) {
      if (icon.match(/^[a-zA-Z0-9\-]+$/)) {
        iconHtml = `<span><hl-icon name="${icon}"></hl-icon></span>`;
      } else {
        iconHtml = `<span>${icon}</span>`;
      }
    }
    const titleHtml = title ? `<div class="hl-sidebar-title">${iconHtml}${title}</div>` : '';

    this.innerHTML = `<div class="hl-sidebar-block">${titleHtml}${this.innerHTML}</div>`;
  }
}
customElements.define('hl-sidebar-box', HlSidebarBox);
