// --- フォーカストラップ対応: HlDrawer ---
class HlDrawer extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title') || 'メニュー';
    const inner = this.innerHTML;
    const overlay = document.createElement('div');
    overlay.className = 'hl-drawer-overlay';
    overlay.innerHTML = `<div class="hl-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title-${title}"><div class="hl-drawer-header"><h3 class="hl-drawer-title" id="drawer-title-${title}">${title}</h3><button class="hl-drawer-close" aria-label="閉じる">✕</button></div><div class="hl-drawer-body hl-content-text">${inner}</div></div>`;
    document.body.appendChild(overlay);
    this.innerHTML = '';
    this._overlay = overlay;
    
    overlay.querySelector('.hl-drawer-close').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this._overlay.classList.contains('is-open')) this.close(); });
  }
  open()  { 
    this._previousFocus = document.activeElement; 
    this._overlay?.classList.add('is-open');    
    this._overlay?.querySelector('.hl-drawer-panel')?.classList.add('is-open');    
    document.body.style.overflow = 'hidden'; 
    trapFocus(this._overlay.querySelector('.hl-drawer-panel'));
  }
  close() { 
    this._overlay?.classList.remove('is-open'); 
    this._overlay?.querySelector('.hl-drawer-panel')?.classList.remove('is-open'); 
    document.body.style.overflow = ''; 
    if (this._previousFocus) this._previousFocus.focus(); 
  }
  disconnectedCallback() { if (this._overlay) this._overlay.remove(); }
}
customElements.define('hl-drawer', HlDrawer);
