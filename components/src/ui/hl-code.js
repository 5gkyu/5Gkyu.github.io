window.HlToast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'hl-toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'success', duration = 3000) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `hl-toast ${type === 'warning' ? 'hl-toast--warning' : ''}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = message;
    
    // 古い通知の上に新しい通知が重ならないよう、リストの先頭に追加
    this.container.prepend(toast);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('is-show'));
    });

    setTimeout(() => {
      toast.classList.remove('is-show');
      toast.classList.add('is-hide');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
};

class HlCode extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const lang = this.getAttribute('lang') || 'code';
    const codeText = this.innerHTML.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const dialogTitle = `${lang} code`;
    this.innerHTML = `<div class="hl-code-wrapper"><div class="hl-code-header"><span class="hl-code-lang">${lang}</span><div class="hl-code-actions"><button class="hl-code-expand" aria-label="コードを拡大表示">Expand</button><button class="hl-code-copy">Copy</button></div></div><pre class="hl-code-pre"><code class="hl-code-content">${codeText}</code></pre></div>`;
    const copyBtn = this.querySelector('.hl-code-copy');
    const expandBtn = this.querySelector('.hl-code-expand');
    const overlay = document.createElement('div');
    overlay.className = 'hl-modal-overlay hl-code-modal-overlay';
    const modalId = `hl-code-modal-title-${Math.random().toString(36).slice(2, 10)}`;
    overlay.innerHTML = `<div class="hl-modal-content hl-code-modal-content" role="dialog" aria-modal="true" aria-labelledby="${modalId}"><button class="hl-modal-close" aria-label="閉じる">✕</button><div class="hl-code-modal-toolbar"><h3 class="hl-modal-title hl-code-modal-title" id="${modalId}">${dialogTitle}</h3><button class="hl-code-modal-copy" aria-label="モーダル内コードをコピー">Copy</button></div><pre class="hl-code-modal-pre"><code class="hl-code-modal-code">${codeText}</code></pre></div>`;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.hl-modal-close');
    const modalCopyBtn = overlay.querySelector('.hl-code-modal-copy');
    const closeModal = () => {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      if (this._previousFocus && typeof this._previousFocus.focus === 'function') this._previousFocus.focus();
    };

    const copyCurrentCode = (btn) => {
      const textToCopy = this.querySelector('.hl-code-content').textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (window.HlToast) HlToast.show('コードをコピーしました！');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    };

    expandBtn.addEventListener('click', () => {
      this._previousFocus = document.activeElement;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      trapFocus(overlay.querySelector('.hl-code-modal-content'));
      closeBtn.focus();
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    this._onCodeModalKeydown = (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    };
    document.addEventListener('keydown', this._onCodeModalKeydown);

    this._codeModalOverlay = overlay;

    copyBtn.addEventListener('click', () => copyCurrentCode(copyBtn));
    modalCopyBtn.addEventListener('click', () => copyCurrentCode(modalCopyBtn));
  }

  disconnectedCallback() {
    if (this._onCodeModalKeydown) {
      document.removeEventListener('keydown', this._onCodeModalKeydown);
      this._onCodeModalKeydown = null;
    }
    if (this._codeModalOverlay) {
      this._codeModalOverlay.remove();
      this._codeModalOverlay = null;
    }
  }
}
customElements.define('hl-code', HlCode);
