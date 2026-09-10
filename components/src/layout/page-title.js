class PageTitle extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this.innerHTML = `<h1 class="hl-page-title">${this.innerHTML}</h1><span class="hl-page-title-underline" aria-hidden="true"></span>`;
  }
}
customElements.define('page-title', PageTitle);
