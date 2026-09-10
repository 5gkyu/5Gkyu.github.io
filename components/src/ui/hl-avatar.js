/* ============================================================
   AVATAR
============================================================ */
class HlAvatar extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const src    = this.getAttribute('src')    || '';
    const label  = this.getAttribute('label')  || '';
    const size   = this.getAttribute('size')   || 'md';
    const square = this.hasAttribute('square') ? ' hl-avatar--square' : '';
    const inner  = src
      ? `<img src="${src}" alt="${label}" loading="lazy" decoding="async" draggable="false" oncontextmenu="return false;">`
      : `<span aria-hidden="true">${label.charAt(0).toUpperCase()}</span>`;
    this.innerHTML = `<span class="hl-avatar hl-avatar--${size}${square}" aria-label="${label}" role="img">${inner}</span>`;
  }
}
customElements.define('hl-avatar', HlAvatar);
