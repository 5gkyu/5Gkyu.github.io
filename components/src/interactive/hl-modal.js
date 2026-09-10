// --- フォーカストラップ＆ARIA対応: HlModal ---
class HlModal extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title') || '';
    const overlay = document.createElement('div');
    overlay.className = 'hl-modal-overlay';
    overlay.innerHTML = `<div class="hl-modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title-${title}"><button class="hl-modal-close" aria-label="閉じる">✕</button>${title ? `<h3 class="hl-modal-title" id="modal-title-${title}">${title}</h3>` : ''}<div class="hl-content-text">${this.innerHTML}</div></div>`;
    document.body.appendChild(overlay);
    this.innerHTML = '';
    this._overlay = overlay;
    
    overlay.querySelector('.hl-modal-close').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => { if(e.target === overlay) this.close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this._overlay.classList.contains('is-open')) this.close(); });
  }
  open() { 
    this._previousFocus = document.activeElement; 
    this._overlay.classList.add('is-open'); 
    document.body.style.overflow = 'hidden';
    trapFocus(this._overlay.querySelector('.hl-modal-content'));
  }
  close() { 
    this._overlay.classList.remove('is-open'); 
    document.body.style.overflow = '';
    if (this._previousFocus) this._previousFocus.focus(); 
  }
  disconnectedCallback() { if (this._overlay) this._overlay.remove(); }
}
customElements.define('hl-modal', HlModal);
