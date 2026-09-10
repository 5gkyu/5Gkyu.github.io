/* ============================================================
   SKELETON
============================================================ */
class HlSkeleton extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const type   = this.getAttribute('type')   || 'text';
    const width  = this.getAttribute('width')  || '100%';
    const height = this.getAttribute('height') || null;
    const lines  = parseInt(this.getAttribute('lines')) || 3;
    if (type === 'text') {
      this.innerHTML = Array.from({ length: lines }, () =>
        `<span class="hl-skeleton hl-skeleton--text" style="width:100%" aria-hidden="true"></span>`
      ).join('');
      return;
    }
    const cls = { title: 'hl-skeleton--title', circle: 'hl-skeleton--circle', rect: 'hl-skeleton--rect', card: 'hl-skeleton--card' }[type] || 'hl-skeleton--rect';
    const hDefault = { title: '1.4rem', circle: '48px', rect: '120px', card: '180px' }[type] || '100px';
    const wDefault = { circle: '48px' }[type] || '100%';
    this.innerHTML = `<span class="hl-skeleton ${cls}" style="display:block;width:${width || wDefault};height:${height || hDefault}" aria-hidden="true"></span>`;
  }
}
customElements.define('hl-skeleton', HlSkeleton);
