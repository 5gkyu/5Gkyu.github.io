class SectionHeading extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const idAttr = this.id ? `id="${this.id}"` : '';
    if (this.id) this.removeAttribute('id');
    this.innerHTML = `<h2 class="hl-section-heading" ${idAttr}>${this.innerHTML}</h2>`;
  }
}
customElements.define('section-heading', SectionHeading);
