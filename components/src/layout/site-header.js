/* ============================================================
   HEADER
============================================================ */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    
    const siteName = this.getAttribute('site-name') || '';
    const siteLabel = siteName ? `<span class="site-header__site-name" aria-hidden="true">${siteName}</span>` : '';
    
    this.innerHTML = `
      <style>
        .site-header__nav-list { display: flex; align-items: center; gap: 2rem; margin: 0; padding: 0; list-style: none; }
        .site-header__dropdown { position: relative; }
        .site-header__dropdown-menu { position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(10px); background: #fff; border: 1.5px solid rgba(106, 86, 74, 0.08); border-radius: 12px; padding: 0.8rem 0; min-width: 140px; box-shadow: 0 10px 25px rgba(106, 86, 74, 0.1); opacity: 0; visibility: hidden; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); display: flex; flex-direction: column; z-index: 300; pointer-events: none; }
        .site-header__nav-label { position: relative; color: var(--clr-cream); font-family: var(--font-main); font-size: 0.9rem; font-weight: 500; padding-bottom: 3px; }
        .site-header__dropdown-link { display: block; padding: 0.6rem 1.5rem; color: var(--clr-brown); font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: background 0.2s ease, color 0.2s ease; }
        .site-header__dropdown-link:hover { background: rgba(154, 176, 143, 0.15); color: var(--clr-sage); }

        @media (min-width: 861px) {
          /* PCではArchiveモーダルを解除し横並びのリンクとして表示 */
          .site-header__dropdown { position: static; }
          .site-header__nav-label { display: none; }
          .site-header__dropdown-menu {
            position: static;
            transform: none;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            background: transparent;
            box-shadow: none;
            border: none;
            padding: 0;
            display: flex;
            flex-direction: row;
            gap: 2rem;
            min-width: 0;
          }
          .site-header__dropdown-link {
            padding: 0;
            position: relative;
            color: var(--clr-cream);
            font-family: var(--font-main);
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.25s ease;
            padding-bottom: 3px;
          }
          .site-header__dropdown-link:hover {
            background: transparent;
            color: var(--clr-peach);
          }
          .site-header__dropdown-link::after {
            content: ''; position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%); width: 0; height: 1.5px; background: var(--clr-peach); border-radius: 2px; transition: width 0.3s ease;
          }
          .site-header__dropdown-link:hover::after { width: 100%; }
          .site-header__dropdown-link--child::before { content: none; }

          .site-header__menu-btn { display: none; }
          .site-header__toc-btn { display: none; }
          #hl-toc-drawer { display: none !important; }
        }

        @media (max-width: 860px) {
  .site-header__inner {
    height: 56px;
    padding: 0 1rem;
  }

  /* サイト名のテキストとバッジを非表示にする */
  .site-header__logo-text {
    display: none;
  }
.site-header__logo-area {
  margin-left: 1.2rem;
  }
  .site-header__logo-icon img {
    width: 29px;
    height: 29px;
  }
  .site-header__site-name {
    display: inline-flex;
    margin-left: 0.42rem;
    padding: 0.14rem 0.46rem;
    font-size: 0.58rem;
    letter-spacing: 0.06em;
    border-color: rgba(251,246,234,0.36);
    opacity: 0.78;
  }
          .site-header__menu-btn { 
            display: flex; justify-content: center; align-items: center; width: 40px; height: 40px; 
            border: none; background: transparent; cursor: pointer; padding: 0; position: relative; 
            z-index: 250;
          }
          
          .site-header__menu-btn span { position: absolute; width: 26px; height: 14px; background: var(--clr-cream); border-radius: 14px 0 14px 0; transform: rotate(-20deg); transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); box-shadow: 0 2px 4px rgba(106, 86, 74, 0.15); transform-origin: center; }
          .site-header__menu-btn span::after { content: ''; position: absolute; top: 50%; left: 10%; width: 80%; height: 1.5px; background: rgba(154, 176, 143, 0.4); border-radius: 1px; transform: translateY(-50%); transition: opacity 0.2s ease; }

          .site-header__menu-btn.is-open span { height: 4px; border-radius: 2px; box-shadow: none; background: #6A564A; }
          .site-header__menu-btn.is-open span::after { opacity: 0; }
          .site-header__menu-btn.is-open span:nth-child(1) { width: 30px; transform: rotate(45deg); }
          .site-header__menu-btn.is-open span:nth-child(2) { width: 30px; transform: rotate(-45deg); }

          .site-header__nav { 
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
            background: rgba(251, 246, 234, 0.95);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            opacity: 0; visibility: hidden; transition: all 0.4s ease; z-index: 200; 
            clip-path: none; border: none; box-shadow: none;
          }
          .site-header__nav.is-open { opacity: 1; visibility: visible; }

          .site-header__nav-list { flex-direction: column; gap: 2.1rem; padding: 0; width: 100%; }
          .site-header__nav-list > li { width: 100%; text-align: center; }
          .site-header__nav-label {
            display: none;
            padding: 0.5rem;
            width: auto;
            font-size: 1.34rem;
            color: #6A564A;
            font-weight: 800;
            letter-spacing: 0.02em;
            line-height: 1.15;
          }
          .site-header__nav-link, .site-header__contact { 
            display: inline-block; padding: 0.5rem; width: auto; font-size: 1.4rem; color: #6A564A; font-weight: bold; background: transparent; border: none;
          }
          .site-header__nav-link::after { display: none; }

          .site-header__dropdown {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.6rem;
          }
          .site-header__dropdown-menu {
            position: static;
            transform: none;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            background: transparent;
            box-shadow: none;
            border: none;
            padding: 0.3rem 0 0 0;
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
            z-index: auto;
            align-items: center;
          }
          .site-header__dropdown-link {
            padding: 0.2rem 0.4rem;
            color: #9AB08F;
            font-size: 1.06rem;
            line-height: 1.3;
          }
          .site-header__dropdown-link--parent {
            color: #6A564A;
            font-size: 1.26rem;
            font-weight: 800;
            letter-spacing: 0.02em;
          }
          .site-header__dropdown-link--child {
            padding-left: 1.1rem;
            position: relative;
          }
          .site-header__dropdown-link--child::before {
            content: '└';
            position: absolute;
            left: 0;
            top: 0;
            color: rgba(106, 86, 74, 0.42);
            font-weight: 700;
          }

          .site-header__toc-btn {
            display: none;
            justify-content: center; align-items: center;
            width: 40px; height: 40px;
            border: none; background: transparent; cursor: pointer; padding: 0;
            border-radius: 10px;
            margin-left: auto;
          }
          .site-header.has-toc .site-header__toc-btn { display: flex; }
          .site-header__toc-btn svg { width: 22px; height: 22px; fill: var(--clr-cream); transition: fill 0.2s; }
          .site-header__toc-btn.is-active { background: rgba(154,176,143,0.35); }
          .site-header__toc-btn.is-active svg { fill: #fff; }

          hl-toc { display: none !important; }

          #hl-toc-drawer {
            position: fixed;
            top: 54px; right: 0;
            width: min(320px, 90vw);
            max-height: calc(100vh - 72px);
            overflow-y: auto;
            background: rgba(251,246,234,0.97);
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            border-left: 2px solid var(--clr-sage);
            border-radius: 0 0 0 16px;
            padding: 1.2rem 1.4rem;
            z-index: 190;
            box-shadow: -4px 4px 20px rgba(106,86,74,0.12);
            transform: translateX(110%);
            transition: transform 0.3s cubic-bezier(0.25,1,0.5,1);
          }
          #hl-toc-drawer.is-open { transform: translateX(0); }
          #hl-toc-drawer .hl-toc__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
          #hl-toc-drawer .hl-toc__item a { display: block; padding: 0.4rem 0.6rem; color: var(--clr-brown); font-size: 0.9rem; border-radius: 6px; text-decoration: none; }
          #hl-toc-drawer .hl-toc__item a:hover { background: rgba(154,176,143,0.15); }
          #hl-toc-drawer .hl-toc__item--active a { color: var(--clr-sage); font-weight: 700; background: rgba(154,176,143,0.12); }
          #hl-toc-drawer .hl-toc__sub-list { grid-template-rows: 1fr; opacity: 1; margin-top: 0; }
          #hl-toc-drawer .hl-toc__sub-list__inner { gap: 0.4rem; }
          #hl-toc-drawer .hl-toc__link--h3 { padding-left: 1.4rem; font-size: 0.85rem; opacity: 0.6; }
          #hl-toc-drawer .hl-toc__link--h3.is-active { opacity: 1; }
        }
      </style>

      <header class="site-header fluffy-entry-down delay-1" role="banner" style="position: fixed;">
        <div class="site-header__inner">
          <div class="site-header__logo-area">
            <a href="/" class="site-header__logo-link">
              <span class="site-header__logo-icon" aria-hidden="true">
                <img src="https://5gkyu.github.io/icon/hl-logo-6A7963.png" alt="Halcyon Logo" draggable="false" oncontextmenu="return false;">
              </span>
              <span class="site-header__logo-text">Halcyon</span>
            </a>
            ${siteLabel}
          </div>
          
          
          <button class="site-header__toc-btn" aria-label="目次を開く" id="hl-toc-toggle-btn" aria-expanded="false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" aria-hidden="true"><path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"/></svg>
          </button>

          <button class="site-header__menu-btn" aria-label="メニューを開く" aria-expanded="false">
            <span></span><span></span>
          </button>
          
          <nav class="site-header__nav" aria-label="グローバルナビゲーション">
            <ul class="site-header__nav-list">
              <!--
              <li class="site-header__dropdown" tabindex="0">
                <span class="site-header__nav-label">Archive</span>
                <div class="site-header__dropdown-menu">
                  <a href="/archive/" class="site-header__dropdown-link site-header__dropdown-link--parent">Archive</a>
                  <a href="/archive/app/" class="site-header__dropdown-link site-header__dropdown-link--child">App</a>
                  <a href="/archive/play/" class="site-header__dropdown-link site-header__dropdown-link--child">Play</a>
                  <a href="/archive/note/" class="site-header__dropdown-link site-header__dropdown-link--child">Note</a>
                  <a href="/archive/other/" class="site-header__dropdown-link site-header__dropdown-link--child">Other</a>
                </div>
              </li>
              -->
              <li><a href="/archive/" class="site-header__nav-link">Archive</a></li>
              <li><a href="/archive/app/" class="site-header__nav-link">App</a></li>
              <li><a href="/archive/play/" class="site-header__nav-link">Play</a></li>
              <li><a href="/archive/note/" class="site-header__nav-link">Note</a></li>
              <li><a href="/archive/other/" class="site-header__nav-link">Other</a></li>
              <li><a href="https://5gkyu.github.io/KyuLink/?tag=Kyu" class="site-header__nav-link">Links</a></li>
              <li><a href="/contact/" class="site-header__contact">Contact</a></li>
            </ul>
          </nav>
        </div>
        
        <!-- 
          ヘッダーのプログレスバー＆キャラクターギミック 
          左端にFukaが座っていて、ページ上部までスクロールを戻すと、
          PinoがFukaの膝の上に戻ってくるというストーリー性のあるギミックです。
        -->
        <div style="position: absolute; bottom: -2px; left: 0; width: calc(100% - 15px); height: 3px; z-index: 150; pointer-events: none;">
          <img src="https://5gkyu.github.io/icon/Fuka_header.png" alt="" draggable="false" oncontextmenu="return false;"
            style="
              position: absolute; 
              left: 0px; 
              bottom: -20px; 
              width: 40px; 
              height: auto; 
              z-index: 5;
            ">
          <div id="hl-scroll-vine" 
            style="
              height: 100%; 
              background: var(--clr-peach); 
              width: 0%; 
              border-radius: 0 3px 3px 0; 
              transition: width 0.1s ease-out; 
              position: relative; 
              box-shadow: 0 0 8px rgba(238, 175, 161, 0.5);
            ">
            <img src="https://5gkyu.github.io/icon/Pino_header.png" id="hl-header-bird" alt="" draggable="false" oncontextmenu="return false;"
              style="
                position: absolute; 
                left: max(20px, 100%);
                margin-left: -10px; 
                transform: scaleX(-1); 
                bottom: -1px; 
                width: 18px; 
                max-width: none;
                min-width: 18px;
                height: auto; 
                z-index: 10;
                transition: transform 0.2s ease;
              ">
          </div>
        </div>
      </header>
    `;

    const menuBtn = this.querySelector('.site-header__menu-btn');
    const nav = this.querySelector('.site-header__nav');
    const tocToggleBtn = this.querySelector('#hl-toc-toggle-btn');

    const initTocDrawer = () => {
      const tocEl = document.querySelector('hl-toc');
      if (!tocEl || !tocToggleBtn) return;
      const siteHeader = this.querySelector('.site-header');
      if (siteHeader) siteHeader.classList.add('has-toc');

      if (!document.getElementById('hl-toc-drawer')) {
        const drawer = document.createElement('div');
        drawer.id = 'hl-toc-drawer';
        drawer.className = 'hl-toc-drawer';
        document.body.appendChild(drawer);

        const updateDrawer = () => {
          const list = tocEl.querySelector('.hl-toc__list');
          if (list) {
            drawer.innerHTML = `
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--clr-sage); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                <span><img src="https://5gkyu.github.io/icon/content.svg" alt="" style="width:1em;height:1em;vertical-align:middle;display:inline-block;"></span>Contents
              </div>
              ${list.outerHTML}
            `;
          }
        };
        updateDrawer();
        const mo = new MutationObserver(updateDrawer);
        mo.observe(tocEl, { childList: true, subtree: true });

        drawer.addEventListener('click', e => {
          if (e.target.tagName === 'A') {
            drawer.classList.remove('is-open');
            tocToggleBtn.classList.remove('is-active');
            tocToggleBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    };

    setTimeout(initTocDrawer, 60);

    if (tocToggleBtn) {
      tocToggleBtn.addEventListener('click', () => {
        const drawer = document.getElementById('hl-toc-drawer');
        if (!drawer) return;
        const isOpen = drawer.classList.toggle('is-open');
        tocToggleBtn.classList.toggle('is-active', isOpen);
        tocToggleBtn.setAttribute('aria-expanded', isOpen);
        
        if (isOpen && nav.classList.contains('is-open')) {
          menuBtn.classList.remove('is-open');
          nav.classList.remove('is-open');
          menuBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.toggle('is-open');
      nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', isOpen); 
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        menuBtn.classList.remove('is-open');
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    let lastScroll = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
          
          const vine = this.querySelector('#hl-scroll-vine');
          const bird = this.querySelector('#hl-header-bird');
          
          if (vine) vine.style.width = scrolled + '%';
          
          if (bird) {
            if (winScroll > lastScroll) { bird.style.transform = 'scaleX(-1)'; }
            else if (winScroll < lastScroll) { bird.style.transform = 'scaleX(1)'; }
          }
          lastScroll = winScroll;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}
customElements.define('site-header', SiteHeader);
