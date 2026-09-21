class HlLayout extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    // cols="2" の場合、既存全ページの .hl-layout-main 内にある先頭のタイトルやパンくずを自動で全幅スパン（直下）に引き上げる
    const cols = this.getAttribute('cols');
    if (cols === '2') {
      const main = this.querySelector('.hl-layout-main');
      if (main) {
        const headerElements = main.querySelectorAll(':scope > hl-breadcrumb, :scope > page-title, :scope > .article-meta');
        headerElements.forEach(el => {
          this.insertBefore(el, main);
        });
      }
    }
  }
}
customElements.define('hl-layout', HlLayout);
