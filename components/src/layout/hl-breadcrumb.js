class HlBreadcrumb extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    
    const current = this.getAttribute('current') || 'Page';
    const level1Name = this.getAttribute('level1-name');
    const level1Url = this.getAttribute('level1-url');
    const level2Name = this.getAttribute('level2-name');
    const level2Url = this.getAttribute('level2-url');
    const level3Name = this.getAttribute('level3-name');
    const level3Url = this.getAttribute('level3-url');

    let pathHtml = '<li><a href="/">Home</a></li>';
    if (level1Name && level1Url) {
      pathHtml += `<li><a href="${level1Url}">${level1Name}</a></li>`;
    }
    if (level2Name && level2Url) {
      pathHtml += `<li><a href="${level2Url}">${level2Name}</a></li>`;
    }
    if (level3Name && level3Url) {
      pathHtml += `<li><a href="${level3Url}">${level3Name}</a></li>`;
    }
    pathHtml += `<li><span aria-current="page">${current}</span></li>`;
    this.innerHTML = `
      <style>
        .hl-breadcrumb-nav { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: var(--clr-sage); margin-bottom: 2rem; list-style: none; padding: 0; }
        .hl-breadcrumb-nav li { display: flex; align-items: center; gap: 0.5rem; }
        .hl-breadcrumb-nav li:not(:last-child)::after { content: '>'; opacity: 0.5; font-size: 0.7rem; margin-top: 1px; }
        .hl-breadcrumb-nav a { color: var(--clr-dusty-blue); text-decoration: none; transition: color 0.2s ease; }
        .hl-breadcrumb-nav a:hover { color: var(--clr-peach); }
        .hl-breadcrumb-nav span { opacity: 0.6; }
      </style>
      <nav aria-label="Breadcrumb">
        <ul class="hl-breadcrumb-nav">
          ${pathHtml}
        </ul>
      </nav>
    `;
  }
}
customElements.define('hl-breadcrumb', HlBreadcrumb);
