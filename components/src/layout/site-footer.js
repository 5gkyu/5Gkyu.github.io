class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const copyText = this.getAttribute('copy') || '5Gkyu';
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer fluffy-entry delay-3" role="contentinfo">
        <img class="site-footer__chara" src="https://5gkyu.github.io/icon/Fuka_footer.png" alt="いちのせ ふうか" role="button" tabindex="0" title="いちのせ ふうか" draggable="false" oncontextmenu="return false;" id="fuka-chara" onerror="this.style.display='none'">
        <div class="site-footer__body"> <div class="site-footer__brand" style="max-width: 1100px; margin: 0 auto 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(251,246,234,0.12);">
            <div style="display: flex; align-items: center; gap: 1.5rem;">
              <img src="https://5gkyu.github.io/icon/hl-logo-6A7963.png" alt="" draggable="false" oncontextmenu="return false;" style="width: 64px; height: 64px; filter: brightness(0) invert(1) opacity(0.9);">
              <div>
                <h2 style="font-family: 'Quicksand', sans-serif; font-size: 2rem; color: var(--clr-cream); margin: 0; line-height: 1; letter-spacing: 0.05em;">Halcyon</h2>
                <p style="font-size: 0.8rem; color: var(--clr-cream); opacity: 0.6; margin-top: 0.6rem; letter-spacing: 0.1em;">Where the world falls silent</p>
              </div>
            </div>
          </div>

          <div class="site-footer__grid">
            <div class="site-footer__col--site">
              <p class="site-footer__col-heading" style="display:flex;align-items:center;gap:0.45rem;">
                <img src="https://5gkyu.github.io/icon/hl-char/Akari.png" alt="Akari" draggable="false" oncontextmenu="return false;" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(227,106,140,0.4);">
                Site
              </p>
              <a href="/" class="site-footer__col-link">Entrance - トップページ</a>
              <a href="/policy/" class="site-footer__col-link">Policy - サイトポリシー</a>
              <a href="/contact/" class="site-footer__col-link">Contact - お問い合わせ</a>
            </div>
            <div class="site-footer__col--archive">
              <p class="site-footer__col-heading" style="display:flex;align-items:center;gap:0.45rem;">
                <img src="https://5gkyu.github.io/icon/hl-char/Dulcie.png" alt="Dulcie" draggable="false" oncontextmenu="return false;" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(244,149,106,0.4);">
                Archive
              </p>
              <a href="/archive/" class="site-footer__col-link">Archive - コンテンツ一覧</a>
              <a href="/archive/app/" class="site-footer__col-link">App - アプリ・ツール</a>
              <a href="/archive/play/" class="site-footer__col-link">Play - ゲーム・遊び</a>
              <a href="/archive/note/" class="site-footer__col-link">Note - メモ・記事</a>
              <a href="/archive/other/" class="site-footer__col-link">Other - その他</a>
            </div>
            <div class="site-footer__col--me">
              <p class="site-footer__col-heading" style="display:flex;align-items:center;gap:0.45rem;">
                <img src="https://5gkyu.github.io/icon/hl-char/Esme.png" alt="Esme" draggable="false" oncontextmenu="return false;" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(243,196,111,0.4);">
                Me
              </p>
              <a href="https://5gkyu.github.io/KyuLink/?tag=Kyu" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">KyuLink</a>
              <a href="https://x.com/5gkyu" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">X</a>
              <a href="https://steamcommunity.com/id/QueenKyu/" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">Steam</a>
            </div>
            <div class="site-footer__col--credits">
              <p class="site-footer__col-heading" style="display:flex;align-items:center;gap:0.45rem;">
                <img src="https://5gkyu.github.io/icon/hl-char/Fuka.png" alt="Fuka" draggable="false" oncontextmenu="return false;" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(169,196,125,0.4);">
                Credits
              </p>
              <p class="site-footer__col-heading" style="display:flex;align-items:center;gap:0.4rem;">
                <img src="https://5gkyu.github.io/icon/hl-char/Becky.png" alt="" draggable="false" oncontextmenu="return false;" style="width:14px;height:14px;border-radius:50%;object-fit:cover;">
                Design &amp; Illust
              </p>
              <p class="site-footer__col-link" style="cursor:default;margin-bottom:0.8rem;">by ${copyText}</p>
              <p class="site-footer__col-heading" style="display:flex;align-items:center;gap:0.4rem;">
                <img src="https://5gkyu.github.io/icon/hl-char/Charlotte.png" alt="" draggable="false" oncontextmenu="return false;" style="width:14px;height:14px;border-radius:50%;object-fit:cover;">
                Services &amp; Libraries
              </p>
              <a href="https://phosphoricons.com/" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">Phosphor Icons</a>
            </div>
          </div>
          <div class="site-footer__bottom" style="margin-top: 1rem;">
            <p class="site-footer__copy">© ${year} ${copyText}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    `;

    const chara = this.querySelector('#fuka-chara');
    if (chara) {
      if (chara.complete) { chara.classList.add('is-loaded'); } else { chara.addEventListener('load', () => chara.classList.add('is-loaded')); }
      const handleAction = (e) => { e.preventDefault(); if (chara.classList.contains('is-animating')) return; chara.classList.add('is-animating'); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { chara.classList.remove('is-animating'); }, 800); };
      chara.addEventListener('click', handleAction);
      chara.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleAction(e); });
    }


  }
}
customElements.define('site-footer', SiteFooter);
