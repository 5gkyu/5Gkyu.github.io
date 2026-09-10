class HlAppSheet extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const self = this;
    const label = this.getAttribute('label') || '設定';
    const mqMobile = window.matchMedia('(max-width: 860px)');

    // オーバーレイ
    const overlay = document.createElement('div');
    overlay.className = 'hl-app-sheet-overlay';
    document.body.appendChild(overlay);

    let btn = null;
    self.classList.remove('is-open');

    function open() {
      if (!mqMobile.matches) return;
      self.classList.add('is-open');
      overlay.classList.add('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      self.classList.remove('is-open');
      overlay.classList.remove('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function onResize() {
      if (!mqMobile.matches) close();
    }

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', onResize);

    const gearSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40q-2.16-.06-4.32,0L107.2,25.08a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.48a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84q-.06,2.16,0,4.32L25.08,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.9,123.66Z"/></svg>`;

    function tryInjectBtn() {
      const inner = document.querySelector('.site-header__inner');
      if (!inner) return false;
      if (inner.querySelector('.hl-app-sheet-header-btn')) return true;
      btn = document.createElement('button');
      btn.className = 'hl-app-sheet-header-btn';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = gearSvg;
      btn.addEventListener('click', () => {
        if (self.classList.contains('is-open')) close(); else open();
      });
      const menuBtn = inner.querySelector('.site-header__menu-btn');
      if (menuBtn) inner.insertBefore(btn, menuBtn); else inner.appendChild(btn);
      return true;
    }

    if (!tryInjectBtn()) {
      const obs = new MutationObserver(() => { if (tryInjectBtn()) obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true });
    }

    // 初期化時は必ず閉じた状態から開始
    close();
  }
}
customElements.define('hl-app-sheet', HlAppSheet);
