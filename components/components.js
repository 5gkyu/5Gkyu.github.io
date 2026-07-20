/**
 * =============================================================
 * Halcyon Shared Components & Loading Screen
 * =============================================================
 */

/* ============================================================
   0. ユーティリティ関数
============================================================ */
// フォーカストラップ（モーダルやドロワー用）
function trapFocus(element) {
  const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (focusableEls.length === 0) return;
  
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  element.addEventListener('keydown', function(e) {
    const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);
    if (!isTabPressed) return;

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  });
  // 開いた直後に最初のフォーカス可能要素にフォーカスを当てる
  setTimeout(() => firstEl.focus(), 100);
}

/* ============================================================
   1. メタタグ・共通CSSの注入 (スコープカプセル化)
============================================================ */
(function injectStylesAndMeta() {
  if (document.getElementById('halcyon-shared-style')) return;

  const addMeta = (tagHtml, selector) => {
    if (!document.querySelector(selector)) {
      document.head.insertAdjacentHTML('beforeend', tagHtml);
    }
  };

  // Icons & OGP
  addMeta('<link rel="apple-touch-icon" sizes="180x180" href="https://5gkyu.github.io/icon/apple-touch-icon.png">', 'link[rel="apple-touch-icon"]');
  addMeta('<link rel="icon" type="image/png" sizes="32x32" href="https://5gkyu.github.io/icon/favicon-32x32.png">', 'link[sizes="32x32"]');
  addMeta('<link rel="icon" type="image/png" sizes="16x16" href="https://5gkyu.github.io/icon/favicon-16x16.png">', 'link[sizes="16x16"]');
  addMeta('<link rel="manifest" href="https://5gkyu.github.io/icon/site.webmanifest">', 'link[rel="manifest"]');
  addMeta('<meta property="og:title" content="Halcyon - 5Gkyu">', 'meta[property="og:title"]');
  addMeta('<meta property="og:description" content="Where the world falls silent, we found our own halcyon days.">', 'meta[property="og:description"]');
  addMeta('<meta property="og:image" content="https://5gkyu.github.io/icon/ogp.png">', 'meta[property="og:image"]');
  addMeta('<meta property="og:url" content="https://5gkyu.github.io/">', 'meta[property="og:url"]');
  addMeta('<meta property="og:type" content="website">', 'meta[property="og:type"]');
  addMeta('<meta property="og:site_name" content="Halcyon">', 'meta[property="og:site_name"]');
  addMeta('<meta name="twitter:card" content="summary_large_image">', 'meta[name="twitter:card"]');
  addMeta('<meta name="twitter:site" content="@5gkyu">', 'meta[name="twitter:site"]');
  addMeta('<meta name="twitter:title" content="Halcyon">', 'meta[name="twitter:title"]');
  addMeta('<meta name="twitter:description" content="Where the world falls silent, we found our own halcyon days.">', 'meta[name="twitter:description"]');
  addMeta('<meta name="twitter:image" content="https://5gkyu.github.io/icon/ogp.png">', 'meta[name="twitter:image"]');

  // Google Fonts (★ 修正: 丸くて可愛いフォント 'Quicksand' を追加)
  const preconnect1 = document.createElement('link'); preconnect1.rel = 'preconnect'; preconnect1.href = 'https://fonts.googleapis.com'; document.head.appendChild(preconnect1);
  const preconnect2 = document.createElement('link'); preconnect2.rel = 'preconnect'; preconnect2.href = 'https://fonts.gstatic.com'; preconnect2.crossOrigin = 'anonymous'; document.head.appendChild(preconnect2);
  const fontLink = document.createElement('link'); fontLink.rel = 'stylesheet'; fontLink.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap'; document.head.appendChild(fontLink);

// ▼▼▼ ここから追加：Google Analytics (GA4) の注入 ▼▼▼
  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    // 外部スクリプトの読み込み
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-35DCQ7MMMR';
    document.head.appendChild(gaScript);

    // 設定用スクリプトの追加
    const inlineScript = document.createElement('script');
    inlineScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-35DCQ7MMMR');
    `;
    document.head.appendChild(inlineScript);
  }
  // ▲▲▲ ここまで追加 ▲▲▲

  const style = document.createElement('style');
  style.id = 'halcyon-shared-style';
  style.textContent = `
    /* ------------------------------------------------------------
       VARIABLES & RESET
    ------------------------------------------------------------ */
    :root {
      --clr-cream:       #FBF6EA;
      --clr-sage:        #9AB08F;
      --clr-peach:       #EEAFA1;
      --clr-dusty-blue:  #92B5BC;
      --clr-brown:       #6A564A;
      --font-main:       'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', 'Rounded Mplus 1c', sans-serif;
    }

    * { box-sizing: border-box; }

    html { scrollbar-gutter: stable; scroll-behavior: smooth; scroll-padding-top: 90px; }
    ::-webkit-scrollbar { width: 14px; }
    ::-webkit-scrollbar-track { background: var(--clr-cream); border-left: 1px solid rgba(106, 86, 74, 0.05); }
    ::-webkit-scrollbar-thumb { background: rgba(154, 176, 143, 0.4); border-radius: 10px; border: 4px solid var(--clr-cream); }
    ::-webkit-scrollbar-thumb:hover { background: rgba(154, 176, 143, 0.7); }

    site-header, site-footer, hl-layout, hl-toc, page-title, section-heading { display: block; width: 100%; box-sizing: border-box; }

    body {
      min-height: 100vh; display: flex; flex-direction: column;
      background: var(--clr-cream); color: var(--clr-brown); font-family: var(--font-main);
      margin: 0; padding: 0; line-height: 1.6; position: relative;
      transition: opacity 500ms ease-in-out;
    }

    body > *:not(.hl-overlay) {
      transition: opacity 680ms cubic-bezier(0.22, 1, 0.36, 1), filter 680ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    
    ::selection {
  background: rgba(154, 176, 143, 0.4); /* セージグリーンの半透明 */
  color: var(--clr-brown);
}
::-moz-selection {
  background: rgba(154, 176, 143, 0.4);
  color: var(--clr-brown);
}


    body.hl-page-fade-out { opacity: 0; pointer-events: none; }

    body::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 10% 10%, rgba(154, 176, 143, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(238, 175, 161, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(146, 181, 188, 0.08) 0%, transparent 50%); background-color: var(--clr-cream); filter: blur(40px); opacity: 0.8; pointer-events: none; z-index: -1; }
    body::after { content: ''; position: fixed; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%), linear-gradient(to top, rgba(106, 86, 74, 0.12) 0%, transparent 150px); pointer-events: none; z-index: -1; opacity: 0.5; }

    /* ------------------------------------------------------------
       TYPOGRAPHY & LAYOUT
    ------------------------------------------------------------ */
    .hl-content-text { font-size: 0.9rem; line-height: 1.95; color: var(--clr-brown); opacity: 0.82; }
    .hl-link { color: var(--clr-dusty-blue); text-underline-offset: 3px; transition: color 0.25s ease; }
    .hl-link:hover { color: var(--clr-peach); }
    .hl-page-title { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 700; color: var(--clr-brown); letter-spacing: 0.04em; margin-bottom: 0.5rem; }
    .hl-page-title-underline { display: block; width: 48px; height: 3px; background: var(--clr-sage); border-radius: 4px; margin-bottom: 1.5rem; }
    .hl-section-heading { display: flex; align-items: center; gap: 0.6rem; font-size: 1.05rem; font-weight: 700; color: var(--clr-brown); margin-bottom: 0.9rem; }
    .hl-section-heading::before { content: ''; display: inline-block; width: 4px; height: 1.1em; background: var(--clr-sage); border-radius: 3px; flex-shrink: 0; }
    .hl-section { margin-bottom: 3rem; }
    .hl-section:last-child { margin-bottom: 0; }

    hl-layout { margin: 0 auto; padding: 104px 2rem 60px; position: relative; z-index: 1; flex-grow: 1; }    
    hl-layout[cols="1"] { max-width: 720px; }
    hl-layout[cols="2"] { max-width: 1100px; display: grid; grid-template-columns: 1fr 280px; gap: 4rem; align-items: stretch; }
    @media (max-width: 860px) { hl-layout[cols="2"] { display: flex; flex-direction: column; gap: 2rem; } }
    @media (max-width: 860px) { hl-layout[cols="2"] .hl-layout-sidebar { display: contents; } }
    @media (max-width: 860px) { hl-layout[cols="2"] .hl-layout-main { order: 0; } }
    @media (max-width: 860px) { hl-layout[cols="2"] hl-profile { order: 1; } }

    @media (max-width: 860px) { .u-mobile-top { order: -2 !important; margin-bottom: -1rem; } }

    .hl-layout-main { min-width: 0; }
    .hl-layout-sidebar { min-width: 0; height: 100%; }

    .hl-fab { position: fixed; bottom: 20px; left: 20px; z-index: 190; width: 56px; height: 56px; border-radius: 50%; background: var(--clr-sage); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(106, 86, 74, 0.2); border: none; cursor: pointer; transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease; }
    .hl-fab:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(106, 86, 74, 0.25); }
    .hl-fab svg { width: 26px; height: 26px; fill: currentColor; }
    @media (min-width: 861px) { .hl-fab { display: none !important; } }

    /* ------------------------------------------------------------
       SIDEBAR COMPONENTS
    ------------------------------------------------------------ */
    .hl-sidebar-block { background: rgba(255, 255, 255, 0.75); border: 1.5px solid var(--clr-sage); border-radius: 24px 4px 24px 4px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 8px 25px rgba(106, 86, 74, 0.06); }
    .hl-sidebar-title { font-size: 0.85rem; font-weight: 700; color: var(--clr-sage); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem; }

    /* === hl-app-sheet: モバイルボトムシートコンポーネント === */
    hl-app-sheet { display: contents; }
    .hl-app-sheet-overlay { position: fixed; inset: 0; background: rgba(74,59,50,0.5); z-index: 2100; opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; pointer-events: none; }
    .hl-app-sheet-overlay.is-open { opacity: 1; visibility: visible; pointer-events: auto; }
    .hl-app-sheet-header-btn { display: none; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: rgba(251,246,234,0.12); border: none; cursor: pointer; color: var(--clr-cream); flex-shrink: 0; transition: background 0.2s; }
    .hl-app-sheet-header-btn:hover, .hl-app-sheet-header-btn[aria-expanded="true"] { background: rgba(251,246,234,0.28); }
    @media (max-width: 860px) {
      .hl-app-sheet-header-btn { display: flex; }
      hl-app-sheet { display: block !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; background: var(--clr-cream) !important; border-radius: 24px 24px 0 0 !important; padding: 1rem 1.5rem 2.5rem !important; max-height: 80vh !important; overflow-y: auto !important; z-index: 2110 !important; transform: translateY(110%) !important; visibility: hidden !important; pointer-events: none !important; transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), visibility 0.35s !important; box-shadow: 0 -8px 30px rgba(106,86,74,0.2) !important; scrollbar-width: thin; scrollbar-color: rgba(154,176,143,0.4) transparent; }
      hl-app-sheet::before { content: ''; display: block; width: 40px; height: 4px; background: rgba(106,86,74,0.2); border-radius: 2px; margin: 0 auto 1.2rem; }
      hl-app-sheet.is-open { transform: translateY(0) !important; visibility: visible !important; pointer-events: auto !important; }
      hl-app-sheet .sidebar-sticky { position: static !important; }
    }

    .hl-profile { display: flex; flex-direction: column; gap: 1rem; }
    .hl-profile__header { display: flex; align-items: center; gap: 1rem; }
    .hl-profile__icon { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: 0 0 0 3px #a9c47d, 0 4px 10px rgba(106,86,74,0.1); flex-shrink: 0; }
    .hl-profile__name-wrap { display: flex; flex-direction: column; justify-content: center; flex: 1; min-width: 0; }
    .hl-profile__name { font-weight: 700; color: var(--clr-brown); font-size: 1.15rem; line-height: 1.2; }
    .hl-profile__aliases { font-size: 0.72rem; color: var(--clr-sage); font-weight: 700; letter-spacing: 0.05em; margin-top: 0.3rem; }
    .hl-profile__sns { display: flex; gap: 0.5rem; margin-top: 0.2rem; }
    .hl-sns-icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #fff; color: var(--clr-brown); text-decoration: none; font-size: 0.95rem; transition: all 0.25s ease; border: 1px solid rgba(106, 86, 74, 0.1); }
    .hl-sns-icon:hover { background: var(--clr-peach); color: #fff; transform: translateY(-2px); border-color: var(--clr-peach); box-shadow: 0 4px 10px rgba(238, 175, 161, 0.3); }
    .hl-sns-icon img { width: 16px; height: 16px; object-fit: contain; display: block; transition: filter 0.25s ease; }
    .hl-sns-icon:hover img { filter: brightness(0) invert(1); }
    .hl-profile__bio { font-size: 0.82rem; line-height: 1.75; color: var(--clr-brown); opacity: 0.85; background: rgba(255, 255, 255, 0.5); padding: 1rem; border-radius: 4px 16px 4px 16px; }

    .hl-tags-wrapper { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    a.hl-badge { text-decoration: none; transition: all 0.2s ease; border: 1px solid transparent; display: inline-block; padding: 0.25rem 0.8rem; background: var(--clr-sage); color: var(--clr-cream); font-size: 0.7rem; font-weight: 700; border-radius: 50px; letter-spacing: 0.05em; }
    a.hl-badge:hover { background: #fff; color: var(--clr-sage); border-color: var(--clr-sage); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(154, 176, 143, 0.2); }

    hl-toc { position: sticky; top: 100px; z-index: 10; align-self: start; height: max-content; max-height: calc(100vh - 120px); overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(154, 176, 143, 0.4) transparent; }
    hl-toc::-webkit-scrollbar { width: 6px; }
    hl-toc::-webkit-scrollbar-track { background: transparent; }
    hl-toc::-webkit-scrollbar-thumb { background: rgba(154, 176, 143, 0.4); border-radius: 999px; }
    hl-toc::-webkit-scrollbar-thumb:hover { background: rgba(154, 176, 143, 0.7); }
    .hl-toc__list { display: flex; flex-direction: column; gap: 0.7rem; }
    .hl-toc__link { display: block; color: var(--clr-brown); text-decoration: none; font-family: var(--font-main); font-size: 0.85rem; font-weight: 700; opacity: 0.5; transition: all 0.25s ease; border-left: 2px solid transparent; padding-left: 0.5rem; line-height: 1.4; }
    .hl-toc__link:hover { opacity: 0.8; }
    .hl-toc__link.is-active { opacity: 1; color: var(--clr-sage); border-left-color: var(--clr-sage); transform: translateX(4px); }
    .hl-toc__sub-list { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.28s ease, opacity 0.2s ease; opacity: 0; overflow: hidden; margin-top: -0.7rem; }
    .hl-toc__sub-list.is-group-active { grid-template-rows: 1fr; opacity: 1; margin-top: 0; }
    .hl-toc__sub-list__inner { overflow: hidden; display: flex; flex-direction: column; gap: 0.5rem; padding-bottom: 0.15rem; }
    .hl-toc__link--h3 { font-size: 0.78rem; font-weight: 500; padding-left: 1.2rem; border-left-color: rgba(154, 176, 143, 0.2); }
    .hl-toc__link--h3.is-active { color: var(--clr-sage); border-left-color: var(--clr-sage); transform: translateX(3px); }

    /* ------------------------------------------------------------
       HEADER & FOOTER (★ 背景の明るさとフォントの修正)
    ------------------------------------------------------------ */
    .site-header { 
      position: fixed; inset: 0 0 auto 0; z-index: 200; 
      
      /* 元のセージグリーンを地色に設定 */
      background-color: var(--clr-sage);
      
      border-bottom: 1.5px solid rgba(106, 86, 74, 0.18); 
      box-shadow: 
        inset 0 -1px 0 rgba(251, 246, 234, 0.15), 
        0 4px 15px rgba(106, 86, 74, 0.06);
      font-family: var(--font-main); 
    }

    /* 疑似要素でテクスチャを重ね、opacityで「薄く」する */
    .site-header::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('https://5gkyu.github.io/icon/texture.jpg');
      background-size: 400px;
      background-repeat: repeat;
      mix-blend-mode: multiply; /* テクスチャの陰影を乗せる */
      opacity: 0.45; /* ★ 数値が小さいほど元のセージグリーンに近くなります (0.1〜0.2がおすすめ) */
      pointer-events: none;
      z-index: -1;
    }

    .site-header__inner { max-width: 1100px; margin: 0 auto; padding: 0 2rem; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .site-header__logo-area { display: flex; align-items: center; }
    .site-header__logo-link { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; transition: opacity 0.25s ease; }
    .site-header__logo-link:hover { opacity: 0.72; }
    
    .site-header__logo-icon img {
      width: 32px; 
      height: 32px; 
      object-fit: contain; 
      display: block;
    }

    /* ★ 修正: 丸みがあって可愛い「Quicksand」フォントを指定 */
    .site-header__logo-text { 
      font-family: 'Quicksand', var(--font-main); 
      font-size: 1.35rem; 
      font-weight: 600; /* 丸文字に合う少し太めのウェイト */
      color: var(--clr-cream); 
      letter-spacing: 0.06em; 
      margin-left: 0.3rem;
    }

    .site-header__site-name { font-size: 0.68rem; font-weight: 500; color: var(--clr-cream); opacity: 0.55; letter-spacing: 0.10em; margin-left: 0.55rem; padding: 0.18rem 0.55rem; border: 1px solid rgba(251,246,234,0.28); border-radius: 50px; white-space: nowrap; }
    .site-header__nav { display: flex; align-items: center; gap: 2rem; }
    .site-header__nav-link { position: relative; color: var(--clr-cream); font-family: var(--font-main); font-size: 0.9rem; font-weight: 500; text-decoration: none; padding-bottom: 3px; transition: color 0.25s ease; }
    .site-header__nav-link::after { content: ''; position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%); width: 0; height: 1.5px; background: var(--clr-peach); border-radius: 2px; transition: width 0.3s ease; }
    .site-header__nav-link:hover { color: var(--clr-peach); }
    .site-header__nav-link:hover::after { width: 100%; }
    .site-header__contact { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--clr-cream); font-family: var(--font-main); font-size: 0.82rem; font-weight: 500; letter-spacing: 0.08em; text-decoration: none; padding: 0.38rem 0.95rem; border: 1.5px solid rgba(251,246,234,0.45); border-radius: 50px; transition: background 0.25s ease, border-color 0.25s ease; }
    .site-header__contact:hover { background: rgba(251,246,234,0.14); border-color: rgba(251,246,234,0.80); }

    site-footer { margin-top: auto; }
    .site-footer { font-family: var(--font-main); line-height: 1; position: relative; margin-top: 130px; }   
    .site-footer__body { background: #4A3B32; padding: 1.5rem 2rem 2rem; position: relative; box-shadow: inset 0 35px 0 #5B4A3F, inset 0 36px 0 rgba(255, 240, 230, 0.15), 0 -15px 30px rgba(106, 86, 74, 0.12); padding-top: calc(1.5rem + 35px); }
    
    .site-footer__body::before {
      content: ''; position: absolute; pointer-events: none; z-index: 0;
      width: clamp(120px, 40vw, 220px); height: 18px;
      background: radial-gradient(ellipse at center, rgba(30, 20, 15, 0.75) 0%, rgba(30, 20, 15, 0.2) 40%, transparent 80%);
      top: 18px; right: max(1rem, calc(49% - 560px));
    }

    .site-footer__chara { 
      position: absolute; bottom: 100%; width: clamp(90px, 12vw, 150px); height: auto; pointer-events: none; filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18)); display: none; cursor: default; -webkit-user-drag: none; user-select: none; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease; z-index: 1; transform-origin: bottom center; 
      right: max(1rem, calc(50% - 560px)); transform: translateY(38%);
    }
    
    .site-footer__chara.is-loaded { display: block; pointer-events: auto; cursor: pointer; animation: hl-chara-in 1s cubic-bezier(0.25,1,0.5,1) both, hl-breathe 4s ease-in-out infinite alternate; animation-delay: 0.45s, 1.45s; }
    @media (hover: hover) { .site-footer__chara.is-loaded:hover { transform: translateY(calc(38% - 8px)) scale(1.05); filter: drop-shadow(0 0 15px rgba(238, 175, 161, 0.8)); } }
    .site-footer__chara.is-animating { animation: hl-chara-jump 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards !important; }
    
    @media (max-width: 640px) { 
      .site-footer { margin-top: 40px; } 
      .site-footer__chara { width: clamp(60px, 18vw, 90px); right: 0.5rem; transform: translateY(48%); } 
      .site-footer__body::before { width: clamp(80px, 24vw, 120px); right: 0.5rem; }
      .site-footer__chara.is-loaded { animation: hl-chara-in-sm 1s cubic-bezier(0.25,1,0.5,1) both, hl-breathe-sm 4s ease-in-out infinite alternate; animation-delay: 0.45s, 1.45s; }
      .site-footer__chara.is-animating { animation: hl-chara-jump-sm 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards !important; }
    }
    
    .site-footer__grid { max-width: 1100px; margin: 0 auto; display: grid; gap: 1.5rem 2rem; grid-template-columns: 1fr 1fr 1fr 1fr; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(251,246,234,0.12); }
    @media (max-width: 860px) {
      .site-footer__grid {
        grid-template-columns: 1fr 1fr;
        grid-template-areas:
          'site me'
          'archive credits';
        align-items: start;
      }
      .site-footer__grid > .site-footer__col--site { grid-area: site; }
      .site-footer__grid > .site-footer__col--archive { grid-area: archive; }
      .site-footer__grid > .site-footer__col--me { grid-area: me; }
      .site-footer__grid > .site-footer__col--credits { grid-area: credits; }
    }
    @media (max-width: 420px) { .site-footer__body { padding-left: 1rem; padding-right: 1rem; } .site-footer__col-link { font-size: 0.74rem; letter-spacing: 0.01em; } }
    .site-footer__col-heading { font-size: 0.72rem; font-weight: 700; color: rgba(251,246,234,0.45); letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 0.6rem; }
    .site-footer__col-heading img { flex-shrink: 0; }
    .site-footer__col-link { display: block; color: var(--clr-cream); font-size: 0.82rem; letter-spacing: 0.04em; opacity: 0.72; text-decoration: none; line-height: 2; transition: opacity 0.25s ease; }
    .site-footer__col-link:hover { opacity: 1; }
    .site-footer__bottom { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; padding-top: 1.25rem; }
    .site-footer__dots { display: flex; gap: 7px; align-items: center; }
    .site-footer__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--clr-cream); opacity: 0.45; }
    .site-footer__dot:nth-child(2) { width: 7px; height: 7px; opacity: 0.65; }
    .site-footer__copy { color: var(--clr-cream); font-size: 0.75rem; letter-spacing: 0.06em; opacity: 0.55; }
    .site-footer__top-btn { display: none; }

    /* ------------------------------------------------------------
       GENERAL UI COMPONENTS
    ------------------------------------------------------------ */
    .hl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem 1.8rem; border-radius: 50px; font-family: var(--font-main); font-size: 0.95rem; font-weight: 700; letter-spacing: 0.05em; text-decoration: none; cursor: pointer; border: 2px solid transparent; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); box-shadow: 0 4px 12px rgba(106, 86, 74, 0.06); }
    .hl-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(106, 86, 74, 0.12); }
    .hl-btn:active { transform: translateY(0); }
    .hl-btn--primary { background-color: var(--clr-sage); color: var(--clr-cream); }
    .hl-btn--primary:hover { background-color: #8da382; }
    .hl-btn--secondary { background-color: transparent; color: var(--clr-peach); border-color: var(--clr-peach); box-shadow: none; }
    .hl-btn--secondary:hover { background-color: rgba(238, 175, 161, 0.1); }
    .hl-btn--block { width: 100%; }

    hl-card-grid { display: grid; grid-template-columns: repeat(var(--hl-grid-cols, 3), 1fr); gap: 1.5rem; margin-top: 1rem; margin-bottom: 2rem; }
    hl-card-grid[cols="2"] { --hl-grid-cols: 2; }
    hl-card-grid[cols="3"] { --hl-grid-cols: 3; }
    hl-card-grid[cols="4"] { --hl-grid-cols: 4; }
    @media (max-width: 860px) { hl-card-grid { --hl-grid-cols: 2 !important; } }
    @media (max-width: 540px) { hl-card-grid { --hl-grid-cols: 1 !important; } }

    .hl-card { display: flex; flex-direction: column; background: #fff; border-radius: 20px; border: 1.5px solid rgba(106, 86, 74, 0.08); text-decoration: none; color: inherit; overflow: hidden; transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); position: relative; height: 100%; box-shadow: 0 10px 30px -12px rgba(106, 86, 74, 0.08); }
    .hl-card:hover { transform: translateY(-6px); border-color: var(--clr-sage); box-shadow: 0 20px 40px -15px rgba(154, 176, 143, 0.25); }
    .hl-card__image-wrap { width: 100%; aspect-ratio: 2 / 1; overflow: hidden; background: var(--clr-cream); flex-shrink: 0; }
    .hl-card__image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .hl-card:hover .hl-card__image-wrap img { transform: scale(1.08); }
    .hl-card__content { flex: 1; display: flex; flex-direction: column; padding: 1rem 1.1rem 0.9rem; }
    .hl-card__header { margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem; }
    .hl-card__title { font-size: 1rem; font-weight: 700; color: var(--clr-brown); line-height: 1.4; margin: 0; }
    .hl-card__body { flex: 1; margin-bottom: 0.7rem; }
    .hl-card__footer { display: flex; align-items: center; color: var(--clr-peach); font-size: 0.85rem; font-weight: 700; margin-top: auto; }
    .hl-card__footer::after { content: '→'; margin-left: 0.5rem; transition: transform 0.3s ease; }
    .hl-card:hover .hl-card__footer::after { transform: translateX(5px); }

    .hl-alert { display: flex; gap: 0.9rem; padding: 1rem 1.2rem; border-radius: 16px; margin-bottom: 1.8rem; color: var(--clr-brown); border: 1.5px solid transparent; box-shadow: 0 4px 14px rgba(106, 86, 74, 0.04); align-items: flex-start; }
    .hl-alert--info    { background: rgba(146, 181, 188, 0.1); border-color: rgba(146, 181, 188, 0.4); }
    .hl-alert--warning { background: rgba(238, 175, 161, 0.1); border-color: rgba(238, 175, 161, 0.4); }
    .hl-alert--success { background: rgba(154, 176, 143, 0.1); border-color: rgba(154, 176, 143, 0.4); }
    .hl-alert__icon { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
    .hl-alert--info    .hl-alert__icon { background: rgba(146, 181, 188, 0.25); }
    .hl-alert--warning .hl-alert__icon { background: rgba(238, 175, 161, 0.25); }
    .hl-alert--success .hl-alert__icon { background: rgba(154, 176, 143, 0.25); }
    .hl-alert__icon img { width: 0.9rem; height: 0.9rem; display: block; }
    img[draggable="false"] { -webkit-user-drag: none; user-select: none; }
    .hl-alert__body { flex: 1; margin: 0; line-height: 1.6; padding-top: 4px; }

    .hl-chat-wrapper { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; font-family: var(--font-main); }
    .hl-chat-wrapper.is-right { flex-direction: row-reverse; }
    .hl-chat-icon { flex-shrink: 0; width: 52px; height: 52px; border-radius: 50%; background-color: #fff; border: 2px solid rgba(106, 86, 74, 0.08); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; color: var(--clr-brown); overflow: hidden; box-shadow: 0 4px 10px rgba(106, 86, 74, 0.05); }
    .hl-chat-icon img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
    .hl-chat-bubble { position: relative; max-width: 75%; padding: 1.1rem 1.6rem; border-radius: 28px; color: var(--clr-brown); font-size: 0.95rem; line-height: 1.7; box-shadow: 0 8px 20px rgba(154, 176, 143, 0.1); text-align: left; }
    .hl-chat-wrapper.is-left .hl-chat-bubble { border-top-left-radius: 4px; }
    .hl-chat-wrapper.is-right .hl-chat-bubble { border-top-right-radius: 4px; }
    /* キャラクター別バブルカラー */
    :root {
      --clr-char-a: #E36A8C;
      --clr-char-b: #9FC9D6;
      --clr-char-c: #B794DA;
      --clr-char-d: #F4956A;
      --clr-char-e: #F3C46F;
      --clr-char-f: #A9C47D;
    }
    .hl-chat-wrapper[data-char="A"] .hl-chat-bubble { background: color-mix(in srgb, var(--clr-char-a) 18%, white); }
    .hl-chat-wrapper[data-char="B"] .hl-chat-bubble { background: color-mix(in srgb, var(--clr-char-b) 18%, white); }
    .hl-chat-wrapper[data-char="C"] .hl-chat-bubble { background: color-mix(in srgb, var(--clr-char-c) 18%, white); }
    .hl-chat-wrapper[data-char="D"] .hl-chat-bubble { background: color-mix(in srgb, var(--clr-char-d) 18%, white); }
    .hl-chat-wrapper[data-char="E"] .hl-chat-bubble { background: color-mix(in srgb, var(--clr-char-e) 18%, white); }
    .hl-chat-wrapper[data-char="F"] .hl-chat-bubble { background: color-mix(in srgb, var(--clr-char-f) 18%, white); }

    .hl-accordion { background: #fff; border: 1.5px solid rgba(106, 86, 74, 0.08); border-radius: 16px; margin-bottom: 1rem; overflow: hidden; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
    .hl-accordion:hover { border-color: rgba(154, 176, 143, 0.4); box-shadow: 0 4px 12px rgba(106, 86, 74, 0.04); }
    .hl-accordion__header { width: 100%; padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: transparent; border: none; cursor: pointer; font-family: var(--font-main); font-size: 1rem; font-weight: 700; color: var(--clr-brown); text-align: left; }
    .hl-accordion__icon { flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--clr-sage); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
    .hl-accordion__content-wrapper { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
    .hl-accordion__content { overflow: hidden; }
    .hl-accordion__content-inner { padding: 0 1.5rem 1.5rem; }
    .hl-accordion.is-open { border-color: var(--clr-sage); }
    .hl-accordion.is-open .hl-accordion__icon { transform: rotate(180deg); }
    .hl-accordion.is-open .hl-accordion__content-wrapper { grid-template-rows: 1fr; }

    .hl-tabs-nav { display: flex; gap: 1rem; border-bottom: 2px solid rgba(106, 86, 74, 0.1); margin-bottom: 1.5rem; overflow-x: auto; scrollbar-width: none; }
    .hl-tabs-nav::-webkit-scrollbar { display: none; }
    .hl-tabs-btn { background: transparent; border: none; padding: 0.8rem 0.5rem; font-family: var(--font-main); font-size: 0.95rem; font-weight: 700; color: var(--clr-brown); opacity: 0.5; cursor: pointer; position: relative; white-space: nowrap; transition: opacity 0.3s ease; touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; }
    .hl-tabs-btn:hover { opacity: 0.8; }
    .hl-tabs-btn.is-active { opacity: 1; color: var(--clr-peach); }
    .hl-tabs-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: var(--clr-peach); transform: scaleX(0); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
    .hl-tabs-btn.is-active::after { transform: scaleX(1); }
    .hl-tab-panel { display: none; animation: hl-fade-in 0.4s ease forwards; }
    .hl-tab-panel.is-active { display: block; }

    .hl-modal-overlay { position: fixed; inset: 0; background: rgba(106, 86, 74, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; padding: 1rem; }
    .hl-modal-overlay.is-open { opacity: 1; pointer-events: auto; }
    .hl-modal-content { background: var(--clr-cream); width: 100%; max-width: 500px; border-radius: 24px; padding: 2rem; box-shadow: 0 20px 40px rgba(106, 86, 74, 0.15); transform: translateY(20px) scale(0.95); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); position: relative; max-height: 90vh; overflow-y: auto; }
    .hl-modal-overlay.is-open .hl-modal-content { transform: translateY(0) scale(1); }
    .hl-modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(106, 86, 74, 0.05); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--clr-brown); transition: background 0.2s ease; }
    .hl-modal-close:hover { background: rgba(238, 175, 161, 0.2); color: var(--clr-peach); }
    .hl-modal-title { font-size: 1.2rem; font-weight: 700; color: var(--clr-brown); margin-bottom: 1rem; padding-right: 2rem; }

    .hl-toast-container {
      position: fixed;
      top: 5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      pointer-events: none;
      width: 100%;
      max-width: 400px;
    }
    .hl-toast {
      background: #fff;
      color: var(--clr-brown);
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      font-family: var(--font-main);
      font-size: 0.85rem;
      font-weight: 700;
      box-shadow: 0 8px 25px rgba(106, 86, 74, 0.12);
      border: 1.5px solid var(--clr-sage);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(-20px);
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
    }
    .hl-toast.is-show { opacity: 1; transform: translateY(0); }
    .hl-toast.is-hide { opacity: 0; transform: scale(0.95); }
    .hl-toast--warning { border-color: var(--clr-peach); }

    .hl-code-wrapper { background: #382F2A; border-radius: 12px; margin-bottom: 2rem; overflow: hidden; box-shadow: 0 8px 20px rgba(106, 86, 74, 0.15); }
    .hl-code-header { display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 0.6rem 1rem; }
    .hl-code-lang { font-size: 0.75rem; font-weight: 700; color: var(--clr-sage); letter-spacing: 0.05em; text-transform: uppercase; }
    .hl-code-actions { display: flex; align-items: center; gap: 0.5rem; }
    .hl-code-expand { background: transparent; border: 1px solid rgba(154, 176, 143, 0.4); color: var(--clr-cream); border-radius: 4px; font-size: 0.75rem; padding: 0.3rem 0.8rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.4rem; }
    .hl-code-expand:hover { background: rgba(154, 176, 143, 0.2); border-color: var(--clr-sage); }
    .hl-code-copy { background: transparent; border: 1px solid rgba(154, 176, 143, 0.4); color: var(--clr-cream); border-radius: 4px; font-size: 0.75rem; padding: 0.3rem 0.8rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.4rem; }
    .hl-code-copy:hover { background: rgba(154, 176, 143, 0.2); border-color: var(--clr-sage); }
    .hl-code-pre { margin: 0; padding: 1.2rem; overflow-x: auto; }
    .hl-code-content { font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; line-height: 1.6; color: var(--clr-cream); white-space: pre; }
    .hl-code-modal-content { max-width: min(1000px, 94vw); padding: 1.3rem; background: #2f2824; color: var(--clr-cream); }
    .hl-code-modal-content .hl-modal-close { color: var(--clr-cream); background: rgba(255,255,255,0.08); }
    .hl-code-modal-content .hl-modal-close:hover { background: rgba(255,255,255,0.16); color: var(--clr-cream); }
    .hl-code-modal-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; margin-bottom: 0.8rem; padding-right: 2.4rem; }
    .hl-code-modal-title { color: var(--clr-sage); margin-bottom: 0; }
    .hl-code-modal-copy { background: transparent; border: 1px solid rgba(154, 176, 143, 0.4); color: var(--clr-cream); border-radius: 4px; font-size: 0.75rem; padding: 0.3rem 0.8rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.4rem; }
    .hl-code-modal-copy:hover { background: rgba(154, 176, 143, 0.2); border-color: var(--clr-sage); }
    .hl-code-modal-pre { margin: 0; border-radius: 12px; border: 1px solid rgba(154, 176, 143, 0.35); background: #221d1a; max-height: min(72vh, 920px); overflow: auto; }
    .hl-code-modal-code { display: block; padding: 1.2rem; font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; line-height: 1.6; color: var(--clr-cream); white-space: pre; }

    .hl-step-container { margin-bottom: 2rem; display: flex; flex-direction: column; }
    .hl-step-item { display: flex; gap: 1.2rem; position: relative; }
    .hl-step-item::before { content: ''; position: absolute; left: 13px; top: 32px; bottom: -4px; width: 2px; background: rgba(154, 176, 143, 0.3); }
    .hl-step-item:last-child::before { display: none; }
    .hl-step-marker { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--clr-sage); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; margin-top: 4px; position: relative; z-index: 1; box-shadow: 0 0 0 4px var(--clr-cream), inset 0 0 0 2px rgba(255,255,255,0.2); }
    .hl-step-body { flex-grow: 1; min-width: 0; padding-bottom: 2rem; }
    .hl-step-title { font-weight: 700; color: var(--clr-brown); font-size: 1.1rem; margin-bottom: 0.5rem; margin-top: 5px; }

    /* ------------------------------------------------------------
       QUOTE
    ------------------------------------------------------------ */
    .hl-quote { position: relative; background: rgba(154, 176, 143, 0.08); border-left: 4px solid var(--clr-sage); border-radius: 4px 16px 16px 4px; padding: 1.5rem 1.8rem 1.5rem 2.5rem; margin: 2rem 0; color: var(--clr-brown); }
    .hl-quote__icon { position: absolute; top: 1rem; left: 0.5rem; font-family: serif; font-size: 3.5rem; color: var(--clr-sage); opacity: 0.25; line-height: 1; user-select: none; }
    .hl-quote__cite { display: block; margin-top: 1rem; font-size: 0.8rem; font-weight: 700; color: var(--clr-sage); text-align: right; font-style: normal; }

    /* ------------------------------------------------------------
       LEAD
    ------------------------------------------------------------ */
    .hl-lead { font-size: 1.08rem; line-height: 1.9; color: var(--clr-brown); background: rgba(154, 176, 143, 0.07); border-left: 3px solid var(--clr-sage); border-radius: 0 12px 12px 0; padding: 1.2rem 1.6rem; margin-bottom: 2.2rem; }
    .hl-lead p { margin: 0; }

    /* ------------------------------------------------------------
       FIGURE
    ------------------------------------------------------------ */
    .hl-figure { margin: 2rem 0; }
    .hl-figure img { width: 100%; border-radius: 12px; display: block; }
    .hl-figure figcaption { margin-top: 0.6rem; }
    .hl-figure__caption { font-size: 0.82rem; color: var(--clr-brown); opacity: 0.65; line-height: 1.6; margin: 0; }
    .hl-figure__source { font-size: 0.78rem; color: var(--clr-dusty-blue); margin-top: 0.15rem; }
    .hl-figure__source a { color: var(--clr-dusty-blue); text-decoration: none; }
    .hl-figure__source a:hover { text-decoration: underline; }

    /* ------------------------------------------------------------
       EMBED (動画埋め込み：YouTube / Niconico)
    ------------------------------------------------------------ */
    .hl-embed { margin: 2rem 0; }
    .hl-embed__video { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; box-shadow: 0 4px 16px rgba(106, 86, 74, 0.12); }
    .hl-embed__video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .hl-embed__caption { font-size: 0.82rem; color: var(--clr-brown); opacity: 0.65; line-height: 1.6; margin: 0.6rem 0 0; }

    /* ------------------------------------------------------------
       CITE
    ------------------------------------------------------------ */
    .hl-cite { display: flex; flex-direction: column; gap: 0.2rem; padding: 0.9rem 1.2rem; border-radius: 10px; background: rgba(106, 86, 74, 0.04); border: 1px solid rgba(106, 86, 74, 0.1); margin: 1.2rem 0; font-size: 0.83rem; color: var(--clr-brown); }
    .hl-cite__title { font-weight: 700; }
    .hl-cite__meta { opacity: 0.6; }
    .hl-cite__url a { color: var(--clr-dusty-blue); word-break: break-all; }

    /* ------------------------------------------------------------
       FOOTNOTES
    ------------------------------------------------------------ */
    .hl-fn-ref { display: inline; }
    .hl-fn-ref a { font-size: 0.72em; vertical-align: super; line-height: 1; color: var(--clr-dusty-blue); font-weight: 700; text-decoration: none; padding: 0 0.15em; }
    .hl-fn-ref a:hover { text-decoration: underline; }
    .hl-footnotes { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(106, 86, 74, 0.12); }
    .hl-footnotes__title { font-size: 0.75rem; font-weight: 700; color: var(--clr-brown); opacity: 0.5; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.8rem; }
    .hl-footnotes__list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .hl-footnotes__list li { display: flex; gap: 0.6rem; font-size: 0.82rem; color: var(--clr-brown); line-height: 1.6; }
    .hl-footnotes__num { flex-shrink: 0; color: var(--clr-dusty-blue); font-weight: 700; min-width: 2em; }
    .hl-footnotes__list a { color: var(--clr-dusty-blue); }

    /* ------------------------------------------------------------
       COMPARE
    ------------------------------------------------------------ */
    .hl-compare { display: grid; grid-template-columns: 1fr 1fr; border-radius: 16px; overflow: hidden; border: 1.5px solid rgba(106, 86, 74, 0.1); margin: 2rem 0; }
    .hl-compare__col { padding: 1.4rem; }
    .hl-compare__col--left  { background: rgba(238, 175, 161, 0.07); border-right: 1.5px solid rgba(106, 86, 74, 0.1); }
    .hl-compare__col--right { background: rgba(154, 176, 143, 0.07); }
    .hl-compare__label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.6; color: var(--clr-brown); margin-bottom: 0.9rem; display: flex; align-items: center; gap: 0.45rem; }
    .hl-compare__label--left::before  { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--clr-peach); flex-shrink: 0; }
    .hl-compare__label--right::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--clr-sage);  flex-shrink: 0; }
    .hl-compare__body p:first-child { margin-top: 0; }
    @media (max-width: 640px) {
      .hl-compare { grid-template-columns: 1fr; }
      .hl-compare__col--left { border-right: none; border-bottom: 1.5px solid rgba(106, 86, 74, 0.1); }
    }

    /* ------------------------------------------------------------
       SHARE BUTTONS
    ------------------------------------------------------------ */
    .hl-share { display: flex; align-items: center; gap: 1.2rem; margin: 3rem 0; padding: 1.5rem; background: #fff; border: 1.5px solid rgba(106, 86, 74, 0.08); border-radius: 20px; box-shadow: 0 8px 25px rgba(106, 86, 74, 0.04); }
    .hl-share__label { font-size: 0.85rem; font-weight: 700; color: var(--clr-brown); letter-spacing: 0.05em; opacity: 0.7; }
    .hl-share__buttons { display: flex; gap: 0.8rem; flex-wrap: wrap; }
    .hl-share__btn { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; border: none; background: rgba(106, 86, 74, 0.05); cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); color: var(--clr-brown); text-decoration: none; }
    .hl-share__btn img, .hl-share__btn svg { width: 20px; height: 20px; fill: currentColor; transition: transform 0.3s ease; }
    .hl-share__btn:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(106, 86, 74, 0.1); }
    .hl-share__btn--x:hover { background: #000; color: #fff; }
    .hl-share__btn--x:hover img { filter: brightness(0) invert(1); }
    .hl-share__btn--native:hover { background: var(--clr-dusty-blue); color: #fff; }
    .hl-share__btn--copy:hover { background: var(--clr-sage); color: #fff; }
    .hl-share__btn--copy.is-copied { background: var(--clr-sage); color: #fff; pointer-events: none; }

    /* ------------------------------------------------------------
       ANIMATIONS
    ------------------------------------------------------------ */
    .fluffy-entry { opacity: 0; animation: hl-float-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
    .fluffy-entry-down { opacity: 0; animation: hl-float-down 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
    @keyframes hl-float-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes hl-float-down { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes hl-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    
    @keyframes hl-chara-in { from { opacity: 0; transform: translateY(calc(38% + 16px)); } to { opacity: 1; transform: translateY(38%); } }
    @keyframes hl-chara-jump { 0% { transform: translateY(38%) scale(1); filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18)); } 50% { transform: translateY(calc(38% - 10px)) scale(1.03); filter: drop-shadow(0 0 20px rgba(238, 175, 161, 0.9)); } 100% { transform: translateY(38%) scale(1); filter: drop-shadow(0 0 10px rgba(238, 175, 161, 0.5)); } }
    @keyframes hl-breathe { 0% { transform: translateY(38%) scaleY(1); } 100% { transform: translateY(38%) scaleY(1.015); } }
    @keyframes hl-chara-in-sm { from { opacity: 0; transform: translateY(calc(48% + 16px)); } to { opacity: 1; transform: translateY(48%); } }
    @keyframes hl-chara-jump-sm { 0% { transform: translateY(48%) scale(1); filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18)); } 50% { transform: translateY(calc(48% - 10px)) scale(1.03); filter: drop-shadow(0 0 20px rgba(238, 175, 161, 0.9)); } 100% { transform: translateY(48%) scale(1); filter: drop-shadow(0 0 10px rgba(238, 175, 161, 0.5)); } }
    @keyframes hl-breathe-sm { 0% { transform: translateY(48%) scaleY(1); } 100% { transform: translateY(48%) scaleY(1.015); } }
    
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.35s; }
    .delay-3 { animation-delay: 0.55s; }

    /* ------------------------------------------------------------
   INLINE LOADING SPINNER
------------------------------------------------------------ */
.hl-spinner {
  width: 1.2em; height: 1.2em;
  border: 2.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: hl-spin 0.75s linear infinite;
  display: inline-block;
  position: absolute;
  left: 50%; top: 50%;
  margin-left: -0.6em; margin-top: -0.6em;
}
@keyframes hl-spin { to { transform: rotate(360deg); } }

.hl-btn { position: relative; }
.hl-btn.is-loading { pointer-events: none; opacity: 0.85; }

/* ------------------------------------------------------------
   LAZY IMAGE (Blur-Up)
------------------------------------------------------------ */
.hl-lazy-image {
  width: 100%; height: 100%; display: block;
  position: relative; overflow: hidden; background: var(--clr-cream);
  border-radius: inherit; /* 親要素の角丸を引き継ぐ */
}
.hl-lazy-image img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: opacity 0.6s ease, filter 0.6s ease;
  will-change: filter, opacity;
}
.hl-lazy-image img.is-loading { filter: blur(8px); opacity: 0.5; transform: scale(1.05); /* ぼかしの端が見えないように少し拡大 */ }
.hl-lazy-image img.is-loaded { filter: blur(0); opacity: 1; transform: scale(1); }

    /* ------------------------------------------------------------
       FORM COMPONENTS
    ------------------------------------------------------------ */
    .hl-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.2rem; }
    .hl-field:last-child { margin-bottom: 0; }
    .hl-label { font-size: 0.82rem; font-weight: 700; color: var(--clr-brown); letter-spacing: 0.03em; display: flex; align-items: center; gap: 0.4rem; }
    .hl-label__required { font-size: 0.68rem; background: var(--clr-peach); color: #fff; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700; }
    .hl-label__optional { font-size: 0.68rem; background: rgba(106,86,74,0.1); color: var(--clr-brown); padding: 0.1rem 0.4rem; border-radius: 4px; }
    .hl-input, .hl-textarea, .hl-select {
      width: 100%; font-family: var(--font-main); font-size: 0.9rem; color: var(--clr-brown);
      background: #fff; border: 1.5px solid rgba(106, 86, 74, 0.18); border-radius: 12px;
      padding: 0.7rem 1rem; outline: none; transition: border-color 0.25s ease, box-shadow 0.25s ease;
      appearance: none; -webkit-appearance: none;
    }
    .hl-input:focus, .hl-textarea:focus, .hl-select:focus {
      border-color: var(--clr-sage); box-shadow: 0 0 0 3px rgba(154, 176, 143, 0.2);
    }
    .hl-input::placeholder, .hl-textarea::placeholder { color: rgba(106, 86, 74, 0.38); }
    .hl-input.is-error, .hl-textarea.is-error, .hl-select.is-error {
      border-color: var(--clr-peach); box-shadow: 0 0 0 3px rgba(238, 175, 161, 0.2);
    }
    .hl-field-error { font-size: 0.75rem; color: var(--clr-peach); font-weight: 700; display: flex; align-items: center; gap: 0.3rem; }
    .hl-field-hint  { font-size: 0.75rem; color: var(--clr-brown); opacity: 0.55; }
    .hl-textarea { resize: vertical; min-height: 100px; line-height: 1.7; }
    .hl-select-wrap { position: relative; }
    .hl-select-wrap::after {
      content: ''; pointer-events: none; position: absolute; right: 1rem; top: 50%;
      transform: translateY(-50%); width: 0; height: 0;
      border-left: 5px solid transparent; border-right: 5px solid transparent;
      border-top: 6px solid var(--clr-sage);
    }
    .hl-select { cursor: pointer; padding-right: 2.5rem; }

    /* checkbox / radio */
    .hl-check-group { display: flex; flex-direction: column; gap: 0.6rem; }
    .hl-check-label { display: flex; align-items: center; gap: 0.7rem; font-size: 0.9rem; color: var(--clr-brown); cursor: pointer; user-select: none; }
    .hl-check-label input[type="checkbox"], .hl-check-label input[type="radio"] { display: none; }
    .hl-check-box, .hl-radio-box {
      flex-shrink: 0; width: 20px; height: 20px;
      border: 2px solid rgba(106, 86, 74, 0.3); border-radius: 6px; background: #fff;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease;
    }
    .hl-radio-box { border-radius: 50%; }
    .hl-check-label input[type="checkbox"]:checked ~ .hl-check-box { background: var(--clr-sage); border-color: var(--clr-sage); }
    .hl-check-label input[type="radio"]:checked ~ .hl-radio-box { border-color: var(--clr-sage); box-shadow: inset 0 0 0 5px var(--clr-sage); }
    .hl-check-box::after { content: ''; width: 5px; height: 9px; border-right: 2px solid #fff; border-bottom: 2px solid #fff; transform: rotate(45deg) translate(-1px, -1px); opacity: 0; transition: opacity 0.15s ease; }
    .hl-check-label input[type="checkbox"]:checked ~ .hl-check-box::after { opacity: 1; }

    /* toggle */
    .hl-toggle-label { display: flex; align-items: center; gap: 0.8rem; font-size: 0.9rem; color: var(--clr-brown); cursor: pointer; user-select: none; }
    .hl-toggle-label input { display: none; }
    .hl-toggle-track {
      flex-shrink: 0; width: 44px; height: 24px; border-radius: 50px;
      background: rgba(106, 86, 74, 0.15); border: 2px solid rgba(106, 86, 74, 0.15);
      position: relative; transition: all 0.3s ease;
    }
    .hl-toggle-track::after {
      content: ''; position: absolute; top: 2px; left: 2px;
      width: 16px; height: 16px; border-radius: 50%; background: #fff;
      box-shadow: 0 2px 6px rgba(106, 86, 74, 0.2);
      transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .hl-toggle-label input:checked ~ .hl-toggle-track { background: var(--clr-sage); border-color: var(--clr-sage); }
    .hl-toggle-label input:checked ~ .hl-toggle-track::after { transform: translateX(20px); }

    /* ------------------------------------------------------------
       INTERACTION COMPONENTS
    ------------------------------------------------------------ */
    /* Tooltip */
    .hl-tooltip-wrap { position: relative; display: inline-flex; }
    .hl-tooltip-tip {
      position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(4px);
      background: #4A3B32; color: var(--clr-cream); font-family: var(--font-main); font-size: 0.75rem;
      font-weight: 700; white-space: nowrap; padding: 0.4rem 0.8rem; border-radius: 8px;
      pointer-events: none; opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; z-index: 500;
      box-shadow: 0 4px 12px rgba(74,59,50,0.2);
    }
    .hl-tooltip-tip::after {
      content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
      border: 5px solid transparent; border-top-color: #4A3B32;
    }
    .hl-tooltip-wrap:hover .hl-tooltip-tip,
    .hl-tooltip-wrap:focus-within .hl-tooltip-tip { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Popover */
    .hl-popover-wrap { position: relative; display: inline-flex; }
    .hl-popover-panel {
      position: absolute; top: calc(100% + 10px); left: 0; min-width: 200px;
      background: #fff; border: 1.5px solid rgba(106, 86, 74, 0.1); border-radius: 16px;
      padding: 1rem 1.2rem; box-shadow: 0 12px 30px rgba(106, 86, 74, 0.1);
      pointer-events: none; opacity: 0; transform: translateY(6px);
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.25, 1, 0.5, 1); z-index: 400;
    }
    .hl-popover-panel.is-open { opacity: 1; transform: translateY(0); pointer-events: auto; }

    /* Drawer */
    .hl-drawer-overlay {
      position: fixed; inset: 0; background: rgba(106, 86, 74, 0.35); backdrop-filter: blur(3px);
      z-index: 800; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
    }
    .hl-drawer-overlay.is-open { opacity: 1; pointer-events: auto; }
    .hl-drawer-panel {
      position: fixed; top: 0; right: 0; height: 100%; width: min(360px, 90vw);
      background: var(--clr-cream); z-index: 900;
      transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      display: flex; flex-direction: column; box-shadow: -8px 0 32px rgba(106, 86, 74, 0.12);
    }
    .hl-drawer-panel.is-open { transform: translateX(0); }
    .hl-drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.2rem 1.5rem; border-bottom: 1.5px solid rgba(106, 86, 74, 0.08);
    }
    .hl-drawer-title { font-size: 1rem; font-weight: 700; color: var(--clr-brown); margin: 0; }
    .hl-drawer-close {
      background: rgba(106, 86, 74, 0.05); border: none; width: 32px; height: 32px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--clr-brown); font-size: 1rem; transition: background 0.2s ease;
    }
    .hl-drawer-close:hover { background: rgba(238, 175, 161, 0.2); color: var(--clr-peach); }
    .hl-drawer-body { flex: 1; overflow-y: auto; padding: 1.5rem; }

    /* ------------------------------------------------------------
       TABLE
    ------------------------------------------------------------ */
    .hl-table-wrap { overflow-x: auto; border-radius: 16px; border: 1.5px solid rgba(106, 86, 74, 0.1); }
    .hl-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; font-family: var(--font-main); color: var(--clr-brown); }
    .hl-table thead { background: rgba(154, 176, 143, 0.12); }
    .hl-table thead th { padding: 0.75rem 1.1rem; text-align: left; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.04em; color: var(--clr-brown); white-space: nowrap; }
    .hl-table tbody tr { border-top: 1px solid rgba(106, 86, 74, 0.07); transition: background 0.15s ease; }
    .hl-table tbody tr:hover { background: rgba(154, 176, 143, 0.07); }
    .hl-table td { padding: 0.75rem 1.1rem; vertical-align: middle; }
    .hl-table--striped tbody tr:nth-child(even) { background: rgba(106, 86, 74, 0.03); }
    .hl-table--compact thead th, .hl-table--compact td { padding: 0.5rem 0.8rem; font-size: 0.8rem; }

    /* ------------------------------------------------------------
       PAGINATION
    ------------------------------------------------------------ */
    .hl-pagination { display: flex; align-items: center; justify-content: center; gap: 0.4rem; flex-wrap: wrap; }
    .hl-page-btn {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 36px; height: 36px; padding: 0 0.6rem;
      border-radius: 10px; border: 1.5px solid rgba(106, 86, 74, 0.15);
      background: #fff; color: var(--clr-brown); font-family: var(--font-main);
      font-size: 0.85rem; font-weight: 700; cursor: pointer; text-decoration: none;
      transition: all 0.2s ease; user-select: none;
    }
    .hl-page-btn:hover:not(:disabled) { border-color: var(--clr-sage); background: rgba(154, 176, 143, 0.12); }
    .hl-page-btn.is-active { background: var(--clr-sage); color: #fff; border-color: var(--clr-sage); pointer-events: none; }
    .hl-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .hl-page-ellipsis { padding: 0 0.4rem; color: rgba(106, 86, 74, 0.4); font-size: 0.85rem; line-height: 36px; }

    /* ------------------------------------------------------------
       SKELETON
    ------------------------------------------------------------ */
    @keyframes hl-shimmer { from { background-position: -400px 0; } to { background-position: 400px 0; } }
    .hl-skeleton {
      display: block; border-radius: 8px;
      background: linear-gradient(90deg, rgba(106,86,74,0.08) 25%, rgba(106,86,74,0.14) 50%, rgba(106,86,74,0.08) 75%);
      background-size: 800px 100%;
      animation: hl-shimmer 1.6s infinite linear;
    }
    .hl-skeleton--text { height: 0.9rem; border-radius: 4px; margin-bottom: 0.5rem; }
    .hl-skeleton--text:last-child { width: 60%; }
    .hl-skeleton--title { height: 1.4rem; border-radius: 6px; margin-bottom: 0.8rem; }
    .hl-skeleton--circle { border-radius: 50%; }
    .hl-skeleton--rect { border-radius: 12px; }
    .hl-skeleton--card { border-radius: 20px; }

    /* ------------------------------------------------------------
       DIVIDER
    ------------------------------------------------------------ */
    .hl-divider {
      display: flex; align-items: center; gap: 1rem;
      margin: 1.5rem 0; color: rgba(106, 86, 74, 0.35);
      font-size: 0.78rem; font-family: var(--font-main); letter-spacing: 0.06em;
    }
    .hl-divider::before, .hl-divider::after {
      content: ''; flex: 1; height: 1px; background: rgba(106, 86, 74, 0.12);
    }
    .hl-divider:empty::after { display: none; }
    .hl-divider:empty::before { flex: none; width: 100%; }
    .hl-divider--dashed::before, .hl-divider--dashed::after {
      background: none; border-top: 1.5px dashed rgba(106, 86, 74, 0.18);
    }
    .hl-divider--bold::before, .hl-divider--bold::after {
      height: 2px; background: rgba(154, 176, 143, 0.4);
    }

    /* ------------------------------------------------------------
       AVATAR
    ------------------------------------------------------------ */
    .hl-avatar {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%; overflow: hidden; flex-shrink: 0;
      background: rgba(154, 176, 143, 0.25); color: var(--clr-brown);
      font-family: var(--font-main); font-weight: 700; letter-spacing: 0.02em;
      border: 2px solid rgba(154, 176, 143, 0.35);
    }
    .hl-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
    .hl-avatar--sm  { width: 32px;  height: 32px;  font-size: 0.7rem; }
    .hl-avatar--md  { width: 48px;  height: 48px;  font-size: 1rem; }
    .hl-avatar--lg  { width: 72px;  height: 72px;  font-size: 1.4rem; }
    .hl-avatar--xl  { width: 96px;  height: 96px;  font-size: 1.8rem; }
    .hl-avatar--square { border-radius: 14px; }
    .hl-avatar-group { display: flex; }
    .hl-avatar-group .hl-avatar { margin-left: -10px; border: 2.5px solid var(--clr-cream); }
    .hl-avatar-group .hl-avatar:first-child { margin-left: 0; }

    /* ------------------------------------------------------------
       CAROUSEL
    ------------------------------------------------------------ */
    .hl-carousel { display: block; width: 100%; position: relative; }
    .hl-carousel-viewport { position: relative; overflow: hidden; border-radius: 20px; }
    .hl-carousel-track { display: flex; transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
    .hl-carousel-slide { flex-shrink: 0; width: 100%; }
    .hl-carousel-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(251, 246, 234, 0.85); backdrop-filter: blur(6px);
      border: 1.5px solid rgba(106, 86, 74, 0.15); border-radius: 50%;
      width: 40px; height: 40px; cursor: pointer; z-index: 10;
      display: flex; align-items: center; justify-content: center;
      color: var(--clr-brown); font-size: 0.9rem;
      transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(106,86,74,0.1);
    }
    .hl-carousel-btn:hover { background: var(--clr-cream); border-color: var(--clr-sage); }
    .hl-carousel-btn--prev { left: 12px; }
    .hl-carousel-btn--next { right: 12px; }
    .hl-carousel-btn:disabled { opacity: 0.25; cursor: not-allowed; }
    .hl-carousel-dots { display: flex; justify-content: center; gap: 0.5rem; padding: 0.9rem 0 0.4rem; }
    .hl-carousel-dot {
      width: 8px; height: 8px; border-radius: 50%; border: none; padding: 0; cursor: pointer;
      background: rgba(106, 86, 74, 0.2); transition: all 0.25s ease;
    }
    .hl-carousel-dot.is-active { background: var(--clr-sage); width: 22px; border-radius: 4px; }

    /* ------------------------------------------------------------
       CHIP
    ------------------------------------------------------------ */
    .hl-chip-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .hl-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.75rem; border-radius: 50px;
      font-family: var(--font-main); font-size: 0.8rem; font-weight: 700;
      background: rgba(154, 176, 143, 0.15); color: var(--clr-brown);
      border: 1.5px solid rgba(154, 176, 143, 0.35);
      cursor: default; user-select: none; transition: all 0.2s ease;
    }
    .hl-chip:hover { background: rgba(154, 176, 143, 0.25); }
    .hl-chip--peach { background: rgba(238, 175, 161, 0.15); border-color: rgba(238, 175, 161, 0.4); }
    .hl-chip--peach:hover { background: rgba(238, 175, 161, 0.25); }
    .hl-chip--blue  { background: rgba(146, 181, 188, 0.15); border-color: rgba(146, 181, 188, 0.4); }
    .hl-chip--blue:hover  { background: rgba(146, 181, 188, 0.25); }
    .hl-chip__close {
      display: inline-flex; align-items: center; justify-content: center;
      width: 16px; height: 16px; border-radius: 50%; border: none;
      background: rgba(106, 86, 74, 0.15); color: var(--clr-brown);
      font-size: 0.65rem; line-height: 1; cursor: pointer; padding: 0;
      transition: background 0.2s ease;
    }
    .hl-chip__close:hover { background: var(--clr-peach); color: #fff; }

    /* ------------------------------------------------------------
       SLIDER
    ------------------------------------------------------------ */
    .hl-slider { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }
    .hl-slider__header {
      display: flex; justify-content: space-between; align-items: baseline;
      font-size: 0.85rem; font-weight: 700; color: var(--clr-brown);
    }
    .hl-slider__label { opacity: 0.75; }
    .hl-slider__value {
      min-width: 3rem; text-align: right;
      color: var(--clr-sage); font-variant-numeric: tabular-nums;
    }
    .hl-slider__track {
      position: relative; height: 6px; border-radius: 99px;
      background: rgba(106, 86, 74, 0.12); cursor: pointer;
    }
    .hl-slider__fill {
      position: absolute; left: 0; top: 0; height: 100%;
      border-radius: 99px; pointer-events: none;
      background: linear-gradient(90deg, var(--clr-sage), var(--clr-dusty-blue));
      transition: width 0.05s linear;
    }
    .hl-slider__thumb {
      position: absolute; top: 50%; transform: translate(-50%, -50%);
      width: 20px; height: 20px; border-radius: 50%;
      background: #fff; border: 2.5px solid var(--clr-sage);
      box-shadow: 0 2px 8px rgba(106, 86, 74, 0.18);
      cursor: grab; transition: border-color 0.15s, box-shadow 0.15s;
      touch-action: none;
    }
    .hl-slider__thumb:hover, .hl-slider__thumb:focus-visible {
      border-color: var(--clr-dusty-blue);
      box-shadow: 0 0 0 4px rgba(146, 181, 188, 0.22), 0 2px 8px rgba(106, 86, 74, 0.18);
      outline: none;
    }
    .hl-slider__thumb:active { cursor: grabbing; }
    .hl-slider__ticks {
      display: flex; justify-content: space-between;
      padding: 0 2px; margin-top: -0.1rem;
    }
    .hl-slider__tick {
      font-size: 0.68rem; color: var(--clr-brown); opacity: 0.45;
      line-height: 1;
    }
    /* range 入力を非表示にして完全自前UI */
    .hl-slider__input { display: none; }

    /* ------------------------------------------------------------
       FILE INPUT
    ------------------------------------------------------------ */
    .hl-file-input {
      display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    }
    .hl-file-input__btn {
      display: inline-flex; align-items: center; gap: 0.45rem;
      padding: 0.5rem 1.1rem; border-radius: 99px;
      background: rgba(154,176,143,0.12); border: 1.5px solid var(--clr-sage);
      color: var(--clr-sage); font-size: 0.85rem; font-weight: 700;
      cursor: pointer; font-family: inherit;
      transition: background 0.15s, box-shadow 0.15s;
      white-space: nowrap; flex-shrink: 0;
    }
    .hl-file-input__btn:hover {
      background: rgba(154,176,143,0.26);
      box-shadow: 0 2px 10px rgba(154,176,143,0.22);
    }
    .hl-file-input__btn svg { width: 1em; height: 1em; flex-shrink: 0; }
    .hl-file-input__name {
      font-size: 0.85rem; color: var(--clr-brown); opacity: 0.55;
      min-width: 0; word-break: break-all; line-height: 1.4;
    }
    .hl-file-input__name.is-set { opacity: 1; font-weight: 600; }
    .hl-file-input__native {
      position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;
    }
    /* ドロップゾーン variant */
    .hl-file-input--drop {
      border: 2px dashed rgba(154,176,143,0.35); border-radius: 16px;
      padding: 1.2rem 1.4rem; flex-direction: column; gap: 0.6rem;
      background: rgba(154,176,143,0.04); cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .hl-file-input--drop:hover,
    .hl-file-input--drop.is-dragging {
      border-color: var(--clr-sage); background: rgba(154,176,143,0.1);
    }
    .hl-file-input--drop .hl-file-input__icon {
      font-size: 2rem; line-height: 1;
    }
    .hl-file-input--drop .hl-file-input__hint {
      font-size: 0.78rem; color: var(--clr-brown); opacity: 0.5;
    }

    /* ------------------------------------------------------------
       LOADING OVERLAY FIX
    ------------------------------------------------------------ */
    .hl-overlay {
      position: fixed !important;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1.2rem;
      background:
        radial-gradient(circle at 14% 20%, rgba(154, 176, 143, 0.18) 0%, transparent 42%),
        radial-gradient(circle at 85% 80%, rgba(238, 175, 161, 0.16) 0%, transparent 40%),
        var(--clr-cream);
      opacity: 1;
      transition: opacity 0.48s ease;
    }

    .hl-overlay.is-out {
      opacity: 0;
    }

    .hl-char-outer {
      position: relative;
      width: 140px;
      height: 180px;
      transform: translateX(-50px);
      transition: transform 0.1s linear;
      z-index: 2;
      will-change: transform;
    }

    .hl-char-inner {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .hl-char-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 6px 16px rgba(154, 176, 143, 0.35));
      display: block;
    }

    .hl-char-img.is-missing {
      display: none;
    }

    .hl-char-img.is-loaded ~ .hl-char-placeholder {
      display: none;
    }

    .hl-char-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(148deg, rgba(154, 176, 143, 0.1), rgba(238, 175, 161, 0.08));
      border-radius: 20px;
      border: 2px dashed rgba(154, 176, 143, 0.3);
    }

    .hl-char-placeholder-icon {
      font-size: 2.8rem;
      opacity: 0.45;
      line-height: 1;
    }

    .hl-char-placeholder-label {
      font-size: 0.62rem;
      color: var(--clr-sage);
      opacity: 0.75;
      text-align: center;
      line-height: 1.7;
      letter-spacing: 0.03em;
    }

    .hl-companion {
      position: absolute;
      top: -4px;
      right: -10px;
      font-size: 1.35rem;
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none;
    }

    .hl-overlay:not([data-stage="-1"]) .hl-companion { opacity: 1; }

    .hl-overlay[data-stage="0"] .hl-char-inner { animation: hl-nod 0.55s ease; }
    .hl-overlay[data-stage="1"] .hl-char-inner,
    .hl-overlay[data-stage="2"] .hl-char-inner { animation: hl-walk 0.65s ease-in-out infinite; }
    .hl-overlay[data-stage="1"] .hl-companion,
    .hl-overlay[data-stage="2"] .hl-companion { animation: hl-bird-bob 0.65s ease-in-out infinite; }
    .hl-overlay[data-stage="3"] .hl-char-inner { animation: hl-tiptoe 1s ease-in-out infinite; }
    .hl-overlay[data-stage="4"] .hl-char-inner { animation: hl-wave 1.4s ease forwards; }
    .hl-overlay[data-stage="4"] .hl-companion { animation: hl-bird-bow 0.9s ease 0.9s both; }

    .hl-road-wrap {
      width: min(720px, 92vw);
      margin-top: -0.35rem;
      z-index: 1;
      opacity: 0.95;
    }

    .hl-road-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .hl-road-bg {
      fill: none;
      stroke: rgba(106, 86, 74, 0.22);
      stroke-width: 3.5;
      stroke-linecap: round;
    }

    .hl-road-fg {
      fill: none;
      stroke: var(--clr-sage);
      stroke-width: 4.5;
      stroke-linecap: round;
      filter: drop-shadow(0 0 6px rgba(154, 176, 143, 0.4));
    }

    .hl-road-milestone {
      opacity: 0.35;
      transform-origin: center;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .hl-road-milestone.is-reached {
      opacity: 1;
      transform: scale(1.15);
    }

    .hl-message {
      margin: 0;
      font-family: var(--font-main);
      font-size: clamp(0.86rem, 2.8vw, 1rem);
      font-weight: 700;
      color: var(--clr-brown);
      letter-spacing: 0.03em;
      text-align: center;
      min-height: 1.8em;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .hl-message.is-fade {
      opacity: 0;
      transform: translateY(4px);
    }

    .hl-bar-wrap {
      width: min(340px, 84vw);
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      align-items: center;
    }

    .hl-bar-pct {
      font-family: var(--font-main);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--clr-sage);
      letter-spacing: 0.08em;
    }

    .hl-bar-track {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: rgba(106, 86, 74, 0.12);
      overflow: hidden;
      border: 1px solid rgba(154, 176, 143, 0.28);
    }

    .hl-bar-fill {
      width: 0;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #9ab08f 0%, #92b5bc 60%, #eeafa1 100%);
      box-shadow: 0 0 8px rgba(146, 181, 188, 0.45);
      transition: width 0.14s linear;
    }

    @keyframes hl-nod {
      0%, 100% { transform: rotate(0deg) scale(1); }
      45% { transform: rotate(-6deg) scale(0.97); }
    }

    @keyframes hl-walk {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    @keyframes hl-tiptoe {
      0%, 100% { transform: translateY(0) scaleY(1); }
      50% { transform: translateY(-11px) scaleY(1.04); }
    }

    @keyframes hl-wave {
      0% { transform: rotate(0deg); opacity: 1; }
      15% { transform: rotate(-14deg); }
      30% { transform: rotate(9deg); }
      50% { transform: rotate(-10deg); }
      70% { transform: rotate(6deg) translateX(12px); }
      100% { transform: rotate(0deg) translateX(24px) scale(0.75); opacity: 0; }
    }

    @keyframes hl-bird-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes hl-bird-bow {
      0% { transform: rotate(0deg); }
      40% { transform: rotate(-26deg); }
      70% { transform: rotate(10deg); }
      100% { transform: rotate(-16deg); }
    }

    @media (max-width: 640px) {
      .hl-char-outer {
        width: 112px;
        height: 144px;
      }

      .hl-companion { font-size: 1.1rem; right: -6px; }

      .hl-road-wrap {
        width: min(560px, 94vw);
      }

      .hl-bar-wrap {
        width: min(300px, 88vw);
      }
    }

    /* ------------------------------------------------------------
       LOADING SCREEN LEGACY CSS BIRD RESTORE
    ------------------------------------------------------------ */
    .hl-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #FBF6EA;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.4rem;
      font-family: 'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif;
      opacity: 1;
      pointer-events: all;
      overflow: hidden;
    }

    .hl-overlay::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 18% 28%, rgba(255,250,230,0.55) 1px, transparent 2px),
        radial-gradient(circle at 73% 14%, rgba(255,255,255,0.65) 1.5px, transparent 2px),
        radial-gradient(circle at 44% 74%, rgba(240,255,250,0.45) 1px, transparent 2px),
        radial-gradient(circle at 83% 68%, rgba(255,250,220,0.55) 2px, transparent 3px);
      background-size: 200px 200px;
      opacity: 0.35;
      pointer-events: none;
    }

    .hl-overlay::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.5) 0%, transparent 65%);
      animation: hl-overlay-breathe 4.5s ease-in-out infinite;
      pointer-events: none;
    }

    .hl-overlay.is-out {
      opacity: 0;
      pointer-events: none;
      transition: opacity 480ms ease;
    }

    .css-bird {
      position: relative;
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 6px 16px rgba(154,176,143,0.35));
    }

    .bird-container {
      position: absolute;
      width: 120px;
      height: 120px;
      bottom: 0;
      left: 10px;
    }

    .bird-body {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 120px;
      height: 100px;
      background: #fdfaf3;
      background-image: radial-gradient(circle at 35% 30%, #ffffff 0%, #fdfaf3 50%, #f3eedc 100%);
      border: 4px solid #5a3f29;
      border-radius: 50% 50% 45% 50% / 60% 60% 40% 40%;
      z-index: 2;
      box-sizing: border-box;
    }

    .bird-leaf {
      position: absolute;
      background: #a4bc8e;
      border: 3.5px solid #5a3f29;
      z-index: 1;
      box-sizing: border-box;
    }

    .leaf1 {
      width: 28px;
      height: 16px;
      top: 30px;
      right: -6px;
      border-radius: 50%;
      transform: rotate(-1deg);
    }

    .leaf2 {
      width: 28px;
      height: 16px;
      top: 15px;
      right: 0px;
      border-radius: 50%;
      transform: rotate(-45deg);
    }

    .bird-eye {
      position: absolute;
      width: 9px;
      height: 9px;
      background: #4a3320;
      border-radius: 50%;
    }

    .eye-left { top: 40px; left: 35px; }
    .eye-right { top: 46px; left: 75px; }

    .bird-beak {
      position: absolute;
      top: 47px;
      left: 50px;
      width: 18px;
      height: 10px;
      background: #f29a68;
      border: 3.5px solid #5a3f29;
      border-radius: 50%;
      transform: rotate(10deg);
      box-sizing: border-box;
    }

    .bird-blush {
      position: absolute;
      width: 18px;
      height: 14px;
      background: #ffc2af;
      border-radius: 50%;
      opacity: 0.7;
    }

    .blush-left { top: 48px; left: 16px; transform: rotate(-10deg); }
    .blush-right { top: 54px; left: 88px; transform: rotate(10deg); }

    .hl-char-outer {
      position: relative;
      z-index: 1;
      will-change: transform;
    }

    .hl-char-inner {
      position: relative;
      width: 140px;
      height: 180px;
    }

    .hl-overlay[data-stage="0"] .hl-char-inner { animation: hl-nod 0.55s ease; }
    .hl-overlay[data-stage="1"] .hl-char-inner,
    .hl-overlay[data-stage="2"] .hl-char-inner { animation: hl-walk 0.65s ease-in-out infinite; }
    .hl-overlay[data-stage="3"] .hl-char-inner { animation: hl-tiptoe 1s ease-in-out infinite; }
    .hl-overlay[data-stage="4"] .hl-char-inner { animation: hl-wave 1.4s ease forwards; }

    .hl-road-wrap {
      position: absolute;
      bottom: 60px;
      left: 0;
      right: 0;
      width: 100% !important;
      max-width: none !important;
      margin-top: 0;
      height: 88px;
      pointer-events: none;
      z-index: 0;
    }

    .hl-road-svg { width: 100%; height: 100%; overflow: visible; }
    .hl-road-bg {
      fill: none;
      stroke: rgba(154,176,143,0.20);
      stroke-width: 2.5;
      stroke-dasharray: 7 5;
      stroke-linecap: round;
    }
    .hl-road-fg {
      fill: none;
      stroke: #9AB08F;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: stroke-dashoffset 0.1s linear;
    }
    .hl-road-milestone {
      opacity: 0;
      transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1);
      transform-origin: center;
      transform: scale(0);
    }
    .hl-road-milestone.is-reached { opacity: 1; transform: scale(1); }

    .hl-message {
      position: relative;
      z-index: 1;
      font-size: 0.87rem;
      color: #6A564A;
      opacity: 0.72;
      letter-spacing: 0.09em;
      min-height: 1.4em;
      text-align: center;
      transition: opacity 0.3s ease;
    }
    .hl-message.is-fade { opacity: 0; }

    .hl-bar-wrap {
      position: relative;
      z-index: 1;
      width: min(340px, 80vw);
    }
    .hl-bar-pct {
      position: absolute;
      right: 0;
      top: -1.55em;
      font-size: 0.76rem;
      font-weight: 500;
      color: #9AB08F;
      letter-spacing: 0.05em;
      min-width: 3em;
      text-align: right;
    }
    .hl-bar-track {
      height: 5px;
      background: rgba(154,176,143,0.16);
      border-radius: 10px;
      overflow: hidden;
    }
    .hl-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #9AB08F 0%, #EEAFA1 100%);
      border-radius: 10px;
      transition: width 0.1s linear;
    }

    @keyframes hl-overlay-breathe {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.9; }
    }
  `;
  if (!window.HL_SKIP_STYLES) {
    document.head.appendChild(style);
  }
})();

/* ============================================================
   2. カスタムコンポーネント定義 (JS)
============================================================ */

/* --- SHARE BUTTONS --- */
class HlShare extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const text = this.getAttribute('text') || 'Share';
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    this.innerHTML = `
      <div class="hl-share">
        <span class="hl-share__label">${text}</span>
        <div class="hl-share__buttons">
          <a href="https://twitter.com/intent/tweet?url=${url}&text=${title}" target="_blank" rel="noopener noreferrer" class="hl-share__btn hl-share__btn--x" title="Xでシェア">
            <img src="https://5gkyu.github.io/icon/x.png" alt="X" draggable="false" oncontextmenu="return false;">
          </a>
          <button class="hl-share__btn hl-share__btn--native" id="hl-share-native" title="OS標準のシェア">
            <svg viewBox="0 0 256 256"><path d="M176,144a40,40,0,0,0-32.6,16.7l-41.5-24.9a40.1,40.1,0,0,0,0-43.6l41.5-24.9a40,40,0,1,0-8.3-13.8l-41.5,24.9a40,40,0,1,0,0,43.6l41.5,24.9A40,40,0,1,0,176,144Z"/></svg>
          </button>
          <button class="hl-share__btn hl-share__btn--copy" title="全文をコピー">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/></svg>
          </button>
        </div>
      </div>
    `;

    const nativeBtn = this.querySelector('#hl-share-native');
    if (navigator.share) {
      nativeBtn.addEventListener('click', () => {
        navigator.share({ title: document.title, url: window.location.href });
      });
    } else {
      nativeBtn.style.display = 'none';
    }

    const copyBtn = this.querySelector('.hl-share__btn--copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const charNames = { A: 'Akari', B: 'Becky', C: 'Charlotte', D: 'Dulcie', E: 'Esmé', F: 'Fūka' };
        const container = document.querySelector('.hl-layout-main .hl-content-text');
        if (!container) return;
        const parts = [];
        function processEl(el) {
          const tag = el.tagName ? el.tagName.toLowerCase() : '';
          if (tag === 'h2' || tag === 'h3') { const t = el.textContent.trim(); if (t) parts.push('・' + t); return; }
          if (tag === 'hl-chat') {
            const char = el.getAttribute('char');
            const name = charNames[char] || char || '?';
            const bubble = el.querySelector('.hl-chat-bubble');
            const t = (bubble || el).textContent.trim();
            if (t) parts.push(name + '：' + t); return;
          }
          if (tag === 'hl-lead') { el.querySelectorAll('p').forEach(p => { const t = p.textContent.trim(); if (t) parts.push(t); }); return; }
          if (tag === 'hl-quote') {
            const source = el.getAttribute('source') || '';
            const body = el.querySelector('.hl-quote__body');
            const t = (body || el).textContent.trim();
            if (t) parts.push(source ? '「' + t + '」\n── ' + source : '「' + t + '」'); return;
          }
          if (tag === 'hl-alert') { const inner = el.querySelector('p'); const t = (inner || el).textContent.trim(); if (t) parts.push('[注] ' + t); return; }
          if (tag === 'p') { const t = el.textContent.trim(); if (t) parts.push(t); return; }
          if (tag === 'ul') { el.querySelectorAll(':scope > li').forEach(li => { parts.push('  ・' + li.textContent.trim()); }); return; }
          if (tag === 'hl-cite') {
            const t = el.getAttribute('title') || '';
            const author = el.getAttribute('author') || '';
            const publisher = el.getAttribute('publisher') || '';
            const year = el.getAttribute('year') || '';
            const href = el.getAttribute('url') || '';
            const accessed = el.getAttribute('accessed') || '';
            const meta = [author, publisher, year].filter(Boolean).join(' / ');
            const urlPart = href ? (accessed ? href + '（' + accessed + ' 参照）' : href) : '';
            const line = [t, meta, urlPart].filter(Boolean).join('\n    ');
            if (line) parts.push('[参考] ' + line); return;
          }
          if (tag === 'hl-footnotes') {
            const label = el.getAttribute('label') || '注記';
            const items = el.querySelectorAll('hl-fn-item');
            if (items.length > 0) {
              parts.push('── ' + label + ' ──');
              items.forEach(item => { const num = item.getAttribute('num') || ''; const t = item.textContent.trim(); if (t) parts.push('[' + num + '] ' + t); });
            }
            return;
          }
          if (['hl-figure', 'hl-compare', 'hl-code', 'hl-step', 'hl-accordion'].includes(tag)) return;
          for (const child of el.children) processEl(child);
        }
        for (const child of container.children) processEl(child);
        const textContent = parts.join('\n\n');
        navigator.clipboard.writeText(textContent).then(() => {
          copyBtn.classList.add('is-copied');
          copyBtn.title = 'コピーしました';
          setTimeout(() => { copyBtn.classList.remove('is-copied'); copyBtn.title = '全文をコピー'; }, 2500);
        }).catch(() => { alert('コピーに失敗しました。'); });
      });
    }
  }
}
customElements.define('hl-share', HlShare);

/* --- QUOTE --- */
class HlQuote extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const source = this.getAttribute('source') || '';
    const href = this.getAttribute('href') || '';
    const citeHtml = source ? (href ? `<cite class="hl-quote__cite"><a href="${href}" target="_blank" rel="noopener noreferrer" class="hl-link">― ${source}</a></cite>` : `<cite class="hl-quote__cite">― ${source}</cite>`) : '';
    this.innerHTML = `<blockquote class="hl-quote"><div class="hl-quote__icon">“</div><div class="hl-quote__body hl-content-text">${this.innerHTML}</div>${citeHtml}</blockquote>`;
  }
}
customElements.define('hl-quote', HlQuote);


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
        
        <div style="position: absolute; bottom: -2px; left: 0; width: calc(100% - 15px); height: 3px; z-index: 150; pointer-events: none;">
          <img src="https://5gkyu.github.io/icon/Fuka_header.png" alt="" draggable="false" oncontextmenu="return false;"
            style="
              position: absolute; 
              left: 0px; 
              bottom: -20px; 
              width: 40px; 
              height: auto; 
              z-index: 5;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
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
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
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
      const handleAction = (e) => { e.preventDefault(); if (chara.classList.contains('is-animating')) return; chara.classList.add('is-animating'); setTimeout(() => { window.location.href = '/prologue/'; }, 400); };
      chara.addEventListener('click', handleAction);
      chara.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleAction(e); });
    }

    /* ─── 上に戻るボタン ─── */
    if (!document.getElementById('hl-scroll-to-top')) {
      document.head.insertAdjacentHTML('beforeend', `<style>
        .hl-scroll-to-top {
          position: fixed; bottom: -100px; right: 16px;
          width: 46px; height: 46px; padding: 0;
          background: rgba(251, 246, 234, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          border: 1.5px solid var(--clr-sage); border-radius: 50px;
          z-index: 199; cursor: pointer;
          transition: bottom 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease, opacity 0.3s ease, border-color 0.2s ease;
          box-shadow: 0 4px 12px rgba(106, 86, 74, 0.08);
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 861px) { .hl-scroll-to-top { right: 30px; } }
        .hl-scroll-to-top.is-visible { bottom: 20px; }
        @media (min-width: 861px) { .hl-scroll-to-top.is-visible { bottom: 30px; } }
        .hl-scroll-to-top:hover { transform: translateY(-4px); border-color: #EEAFA1; box-shadow: 0 8px 16px rgba(106, 86, 74, 0.12); }
        .hl-scroll-to-top__balloon {
          width: 28px; height: auto;
          animation: hl-balloon-float 3.5s ease-in-out infinite;
          pointer-events: none; user-select: none;
        }
        @keyframes hl-balloon-float {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50%       { transform: translateY(-4px) rotate(1.5deg); }
        }
        .hl-scroll-to-top.is-soaring {
          transform: translateY(-55px);
          opacity: 0;
          transition: transform 0.55s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.55s ease;
          pointer-events: none;
        }
      </style>`);

      const soarBtn = document.createElement('div');
      soarBtn.id = 'hl-scroll-to-top';
      soarBtn.className = 'hl-scroll-to-top';
      soarBtn.title = 'とぶ'; 
      soarBtn.innerHTML = `
        <svg class="hl-scroll-to-top__balloon" viewBox="0 0 36 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="18" cy="20" rx="14" ry="17" fill="#EEAFA1"/>
          <ellipse cx="12.5" cy="13" rx="4.5" ry="5.5" fill="rgba(255,255,255,0.35)"/>
          <path d="M15 37 Q18 41 21 37" stroke="#d8897a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M18 41 C16 45 20 49 18 53" stroke="#9AB08F" stroke-width="1" fill="none" stroke-linecap="round"/>
        </svg>
      `;
      document.body.appendChild(soarBtn);
      
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) soarBtn.classList.add('is-visible');
        else soarBtn.classList.remove('is-visible');
      }, { passive: true });

      soarBtn.addEventListener('click', () => {
        if (soarBtn.classList.contains('is-soaring')) return;
        soarBtn.classList.add('is-soaring');
        document.documentElement.style.scrollBehavior = 'auto';
        const startY = window.scrollY;
        const duration = 800;
        let startTime = null;
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
        const animateScroll = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const percent = Math.min(progress / duration, 1);
          window.scrollTo(0, startY * (1 - easeOutQuart(percent)));
          if (progress < duration) {
            requestAnimationFrame(animateScroll);
          } else {
            document.documentElement.style.scrollBehavior = 'smooth';
            soarBtn.classList.remove('is-soaring');
            // 揺れアニメを再起動
            void soarBtn.offsetWidth;
          }
        };
        requestAnimationFrame(animateScroll);
      });
    }
  }
}
customElements.define('site-footer', SiteFooter);

class PageTitle extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this.innerHTML = `<h1 class="hl-page-title">${this.innerHTML}</h1><span class="hl-page-title-underline" aria-hidden="true"></span>`;
  }
}
customElements.define('page-title', PageTitle);

class SectionHeading extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const idAttr = this.id ? `id="${this.id}"` : '';
    if (this.id) this.removeAttribute('id');
    this.innerHTML = `<h2 class="hl-section-heading" ${idAttr}>${this.innerHTML}</h2>`;
  }
}
customElements.define('section-heading', SectionHeading);

class HlLayout extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
  }
}
customElements.define('hl-layout', HlLayout);

class HlProfile extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this.innerHTML = `
      <div class="hl-sidebar-block" style="padding: 1.2rem;">
        <div class="hl-profile">
          <div class="hl-profile__header">
            <img src="https://5gkyu.github.io/icon/Fuka_icon.png" alt="きゅー" class="hl-profile__icon" draggable="false" oncontextmenu="return false;" onerror="this.src='https://5gkyu.github.io/icon/Fuka_footer.png'">
            <div class="hl-profile__name-wrap">
              <div class="hl-profile__name">きゅー</div>
              <div class="hl-profile__aliases">Kyu / 5Gkyu / QueenKyu / EMA</div>
              <div class="hl-profile__sns">
                <a href="https://x.com/5gkyu" target="_blank" class="hl-sns-icon" aria-label="X (Twitter)" title="X" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/x.png" alt="X" draggable="false" oncontextmenu="return false;"></a>
                <a href="https://steamcommunity.com/id/QueenKyu" target="_blank" class="hl-sns-icon" aria-label="Steam" title="Steam" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/Steam.png" alt="Steam" draggable="false" oncontextmenu="return false;"></a>
                <a href="https://note.com/5gkyu" target="_blank" class="hl-sns-icon" aria-label="Note" title="Note" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/note.png" alt="Note" draggable="false" oncontextmenu="return false;"></a>
                <a href="https://marshmallow-qa.com/622lav7ywnaaew5" class="hl-sns-icon" aria-label="Marshmallow" title="Marshmallow" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/marshmallow.png" alt="Marshmallow" draggable="false" oncontextmenu="return false;"></a>
              </div>
            </div>
          </div>
          <div class="hl-profile__bio">字と絵とコードがちょっとずつかける。ゲームはQueenKyu、それ以外は大体5Gkyuで活動しています。</div>
        </div>
      </div>
    `;
  }
}
customElements.define('hl-profile', HlProfile);

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

class HlSidebarBox extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title');
    const icon = this.getAttribute('icon');
    let iconHtml = '';
    if (icon) {
      if (icon.match(/^[a-zA-Z0-9\-]+$/)) {
        iconHtml = `<span><hl-icon name="${icon}"></hl-icon></span>`;
      } else {
        iconHtml = `<span>${icon}</span>`;
      }
    }
    const titleHtml = title ? `<div class="hl-sidebar-title">${iconHtml}${title}</div>` : '';

    this.innerHTML = `<div class="hl-sidebar-block">${titleHtml}${this.innerHTML}</div>`;
  }
}
customElements.define('hl-sidebar-box', HlSidebarBox);

const HL_ICONS = {
  gear: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40q-2.16-.06-4.32,0L107.2,25.08a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.48a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84q-.06,2.16,0,4.32L25.08,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.9,123.66Z"/></svg>`,
  lightbulb: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M172,120a8,8,0,0,1-8,8H92a8,8,0,0,1,0-16h72A8,8,0,0,1,172,120Zm-24,32H108a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16ZM232,80a15.82,15.82,0,0,1-12.35,15.6l-20.35,4.52a64.08,64.08,0,0,0,8.7,31.88,8,8,0,1,1-13.86,8,80.12,80.12,0,0,1-10.87-39.86v-1.11A16.09,16.09,0,0,1,167.14,83.3a8,8,0,0,0-14.28-7.38,32,32,0,1,0-54.89-.92,8,8,0,0,0-13.86,8,15.93,15.93,0,0,1-16.14,16.14V100.3a80,80,0,0,1,3.48,157.6,8,8,0,0,1-2.31-15.83,64,64,0,0,0,8.83-30.07l-20.35-4.52A16,16,0,0,1,40,192a8,8,0,0,1,0-16,31.81,31.81,0,0,0,26.54-14.29,8,8,0,1,1,13.29,8.91A47.88,47.88,0,0,1,40,192l20.35,4.52A16,16,0,0,1,72.71,212.1a64,64,0,0,0,111.45,0,16,16,0,0,1,12.36-15.58L216.87,192a47.88,47.88,0,0,1-39.81-22.38,8,8,0,1,1,13.29-8.91A31.81,31.81,0,0,0,216,176a8,8,0,0,1,0,16,16,16,0,0,1-12.36,15.58L183.29,212.1a80,80,0,0,1-111.45,0L51.49,207.58A15.82,15.82,0,0,1,39.14,192a47.88,47.88,0,0,1,39.81-22.38,8,8,0,1,1-13.29,8.91A31.81,31.81,0,0,0,40,192a8,8,0,0,1,0-16,15.93,15.93,0,0,1,16.14-16.14V100.3a64,64,0,0,1-2.78-126,8,8,0,1,1,2.78,15.75,48,48,0,0,0,82.34,1.42,8,8,0,0,1,14.28,7.38,16.09,16.09,0,0,0,16.13,15.76v1.11a64.08,64.08,0,0,1-8.7,31.88,8,8,0,1,1,13.86-8A80.12,80.12,0,0,0,183.29,83.3v-1.11a16.09,16.09,0,0,1-16.13-15.76,8,8,0,0,1,14.28-7.38,48,48,0,0,0,82.34-1.42,8,8,0,1,1,2.78-15.75A64,64,0,0,1,183.29,212.1l20.35,4.52A15.82,15.82,0,0,1,216,232a8,8,0,0,1,0-16,31.81,31.81,0,0,0-26.54-14.29,8,8,0,1,1-13.29,8.91A47.88,47.88,0,0,1,216,232Zm-48-56H88a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16Z"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/></svg>`,
  image: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208V172.69l-34.34-34.35a16,16,0,0,0-22.63,0l-20.68,20.69L98.34,127a16,16,0,0,0-22.63,0L48,154.63ZM208,208H48V177.25l39-39,34.34,34.34a8,8,0,0,0,11.32,0L153.37,151.9l43.32,43.32ZM144,96a16,16,0,1,1-16-16A16,16,0,0,1,144,96Z"/></svg>`,
  ruler: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,100.69l-72-72a16,16,0,0,0-22.62,0l-104,104a16,16,0,0,0,0,22.62l72,72a16,16,0,0,0,22.62,0l104-104A16,16,0,0,0,227.31,100.69ZM104,216,40,152,72,120l12,12a8,8,0,0,0,11.32-11.32l-12-12L104,88l12,12a8,8,0,0,0,11.32-11.32l-12-12,20.69-20.68L216,136Z"/></svg>`,
  layout: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM120,48V120H48V48Zm-72,88h72v72H48Zm88,72V136h72v72Zm72-88H136V48h72Z"/></svg>`,
  'floppy-disk': `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM96,48h64V72H96ZM208,208H48V48H80V80a8,8,0,0,0,8,8h80a8,8,0,0,0,8-8V48h32V208Zm-40-72v56H88V136a8,8,0,0,1,8-8h64A8,8,0,0,1,168,136Zm-16,8H104v40h48Z"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>`,
  palette: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM84,108a12,12,0,1,1-12-12A12,12,0,0,1,84,108Zm44-36a12,12,0,1,1-12-12A12,12,0,0,1,128,72Zm44,36a12,12,0,1,1-12-12A12,12,0,0,1,172,108Zm24,72a24,24,0,0,1-24,24h-8.2c-5.74,0-12,2-16.73,6.72a39.9,39.9,0,0,0-11.5,23l-.11.66A88,88,0,1,1,216,128,48,48,0,0,1,196,180Z"/></svg>`,
  pdf: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216ZM156,120H100a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0v-8h48a24,24,0,0,0,0-48Zm0,32H108v-16h48a8,8,0,0,1,0,16Z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>`,
  file: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/></svg>`
};

class HlIcon extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name = this.getAttribute('name');
    if (name && HL_ICONS[name]) {
      this.innerHTML = HL_ICONS[name];
    }
    this.style.display = 'inline-flex';
    this.style.alignItems = 'center';
    this.style.justifyContent = 'center';
    this.style.verticalAlign = 'middle';
  }
}
customElements.define('hl-icon', HlIcon);

// class HlCategories extends HTMLElement {
//   connectedCallback() {
//     if (this.dataset.rendered) return;
//     this.dataset.rendered = 'true';
//     this.innerHTML = `
//       <hl-sidebar-box title="作ったもの" icon="🎨">
//         <div class="hl-tags-wrapper">
//           <a href="#" class="hl-badge">Webツール</a><a href="#" class="hl-badge">ロジックパズル</a><a href="#" class="hl-badge">デザイン</a><a href="#" class="hl-badge">ゲーム</a>
//         </div>
//       </hl-sidebar-box>
//     `;
//   }
// }
// customElements.define('hl-categories', HlCategories);


class HlToc extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this._onContentLoaded = () => this.render();
    window.addEventListener('halcyon-content-loaded', this._onContentLoaded);
    this.render();
  }

  disconnectedCallback() {
    if (this._onContentLoaded) {
      window.removeEventListener('halcyon-content-loaded', this._onContentLoaded);
    }
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  render() {
    setTimeout(() => {
      const headingHosts = Array.from(document.querySelectorAll('section-heading'));
      
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }

      // page-titleを取得 (先頭にあるか確認)
      const pageTitleHost = document.querySelector('page-title');
      let tocTargets = [];
      
      if (pageTitleHost) {
        const titleId = 'hl-heading-top';
        pageTitleHost.id = titleId;
        const titleText = pageTitleHost.textContent.trim();
        tocTargets.push({ id: titleId, text: titleText || 'Top', target: pageTitleHost, level: 2 });
      }

      if (headingHosts.length > 0) {
        const headingTargets = headingHosts.map((host, index) => {
          const section = host.closest('section');
          const target = section || host.querySelector('h2') || host;
          if (!target.id) target.id = `hl-heading-${index}`;
          return { id: target.id, text: host.textContent.trim(), target, level: 2 };
        }).filter(item => item.text.length > 0);
        
        tocTargets = tocTargets.concat(headingTargets);
      } else {
        // 記事ページ用: .hl-layout-main 内の h2[id] / h3[id] を収集
        const contentHeadings = Array.from(
          document.querySelectorAll('.hl-layout-main h2[id], .hl-layout-main h3[id]')
        );
        let currentH2Id = null;
        contentHeadings.forEach((el) => {
          const isH3 = el.tagName === 'H3';
          if (!isH3) currentH2Id = el.id;
          tocTargets.push({ id: el.id, text: el.textContent.trim(), target: el, level: isH3 ? 3 : 2, parentH2: isH3 ? currentH2Id : null });
        });
      }

      if (tocTargets.length === 0) return;

      // h3が含まれるか確認
      const hasH3 = tocTargets.some(t => t.level === 3);

      // HTML構築
      let linksHtml = '';
      if (!hasH3) {
        // シンプルモード（全て同レベル）
        tocTargets.forEach((item) => {
          linksHtml += `<a href="#${item.id}" class="hl-toc__link">${item.text}</a>`;
        });
      } else {
        // 記事モード: h3をh2のサブリストにまとめて折りたたみ
        let i = 0;
        while (i < tocTargets.length) {
          const item = tocTargets[i];
          if (item.level === 3) {
            // 親h2なしの孤立h3
            linksHtml += `<a href="#${item.id}" class="hl-toc__link hl-toc__link--h3" data-parent="">${item.text}</a>`;
            i++;
          } else {
            // h2リンク出力 → 直後のh3をサブリストにまとめる
            linksHtml += `<a href="#${item.id}" class="hl-toc__link" data-h2id="${item.id}">${item.text}</a>`;
            const h3Items = [];
            let j = i + 1;
            while (j < tocTargets.length && tocTargets[j].level === 3) {
              h3Items.push(tocTargets[j]);
              j++;
            }
            if (h3Items.length > 0) {
              const h3Links = h3Items.map(h =>
                `<a href="#${h.id}" class="hl-toc__link hl-toc__link--h3" data-parent="${item.id}">${h.text}</a>`
              ).join('');
              linksHtml += `<div class="hl-toc__sub-list" data-group="${item.id}"><div class="hl-toc__sub-list__inner">${h3Links}</div></div>`;
              i = j;
            } else {
              i++;
            }
          }
        }
      }

      this.innerHTML = `<div class="hl-sidebar-block" style="margin-bottom:0;"><div class="hl-sidebar-title"><span><img src="https://5gkyu.github.io/icon/content.svg" alt="" style="width:1em;height:1em;vertical-align:middle;display:inline-block;"></span>Contents</div><div class="hl-toc__list">${linksHtml}</div></div>`;

      this._observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.querySelectorAll('.hl-toc__link').forEach(link => link.classList.remove('is-active'));
            const activeLink = this.querySelector(`.hl-toc__link[href="#${entry.target.id}"]`);
            if (activeLink) {
              activeLink.classList.add('is-active');
              if (hasH3) {
                // アクティブ見出しのグループを展開・他は折りたたむ
                const activeGroupId = activeLink.dataset.parent !== undefined
                  ? activeLink.dataset.parent
                  : (activeLink.dataset.h2id || null);
                this.querySelectorAll('.hl-toc__sub-list').forEach(subList => {
                  subList.classList.toggle('is-group-active', !!activeGroupId && subList.dataset.group === activeGroupId);
                });
              }
            }
          }
        });
      }, { rootMargin: '-120px 0px -60% 0px' });
      tocTargets.forEach((item) => {
         this._observer.observe(item.target);
      });
    }, 50);
  }
}
customElements.define('hl-toc', HlToc);

class HlCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title') || '';
    const image = this.getAttribute('image') || '';
    const href = this.getAttribute('href') || '#';
    const imageHtml = image ? `<div class="hl-card__image-wrap"><img src="${image}" loading="lazy" decoding="async" alt=""></div>` : '';
    this.innerHTML = `<a href="${href}" class="hl-card">${imageHtml}<div class="hl-card__content"><div class="hl-card__header"><h3 class="hl-card__title">${title}</h3></div><div class="hl-card__body hl-content-text">${this.innerHTML}</div><div class="hl-card__footer"><span>Learn More</span></div></div></a>`;
  }
}
customElements.define('hl-card', HlCard);

class HlCardGrid extends HTMLElement {
  connectedCallback() {
    // グリッドコンテナ: cols属性でCSS変数を制御するだけ。
    // レンダリング不要（CSS側で制御）。
  }
}
customElements.define('hl-card-grid', HlCardGrid);

/* ============================================================
   ARCHIVE SEARCH COMPONENT
============================================================ */
class HlArchiveSearch extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const target      = this.getAttribute('target')      || 'sections-container';
    const placeholder = this.getAttribute('placeholder') || 'タイトル・内容で検索…';

    this.innerHTML = `
      <style>
        .hl-asearch {
          margin-bottom: 2rem;
        }
        .hl-asearch__field {
          position: relative;
          display: flex;
          align-items: center;
        }
        .hl-asearch__icon {
          position: absolute;
          left: 1rem;
          pointer-events: none;
          opacity: 0.45;
          display: flex;
          align-items: center;
          color: var(--clr-brown);
        }
        .hl-asearch__icon svg {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
        .hl-asearch__input {
          width: 100%;
          padding: 0.75rem 2.8rem 0.75rem 2.6rem;
          border: 1.5px solid rgba(106, 86, 74, 0.15);
          border-radius: 50px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(6px);
          color: var(--clr-brown);
          font-family: var(--font-main);
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          -webkit-appearance: none;
          appearance: none;
        }
        .hl-asearch__input::placeholder { opacity: 0.45; }
        .hl-asearch__input:focus {
          border-color: var(--clr-sage);
          box-shadow: 0 0 0 3px rgba(154, 176, 143, 0.18);
        }
        /* ネイティブのクリアボタンを隠す */
        .hl-asearch__input::-webkit-search-cancel-button { display: none; }
        .hl-asearch__clear {
          position: absolute;
          right: 0.85rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          color: var(--clr-brown);
          opacity: 0.4;
          padding: 0.25rem 0.35rem;
          border-radius: 50%;
          line-height: 1;
          transition: opacity 0.15s ease, background 0.15s ease;
        }
        .hl-asearch__clear:hover { opacity: 0.75; background: rgba(106,86,74,0.08); }
        .hl-asearch__meta {
          margin-top: 0.6rem;
          min-height: 1.2em;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--clr-brown);
          opacity: 0.5;
          padding-left: 0.3rem;
        }
        .hl-asearch__empty {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--clr-brown);
          opacity: 0.45;
          padding: 2.5rem 1rem;
          border: 1.5px dashed rgba(106,86,74,0.12);
          border-radius: 16px;
        }
      </style>
      <div class="hl-asearch" role="search" aria-label="記事内検索">
        <div class="hl-asearch__field">
          <span class="hl-asearch__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg></span>
          <input type="search" class="hl-asearch__input" placeholder="${placeholder}" aria-label="記事を検索">
          <button class="hl-asearch__clear" aria-label="検索をクリア" style="display:none;">✕</button>
        </div>
        <p class="hl-asearch__meta" aria-live="polite"></p>
      </div>
    `;

    const input   = this.querySelector('.hl-asearch__input');
    const clearBtn = this.querySelector('.hl-asearch__clear');
    const metaEl  = this.querySelector('.hl-asearch__meta');

    // 既存の empty placeholder 要素を管理 (sections-container 外に配置)
    let emptyEl = null;

    const doFilter = () => {
      const q = input.value.trim().toLowerCase();
      const container = document.getElementById(target);
      if (!container) return;

      clearBtn.style.display = q ? '' : 'none';

      const cards = container.querySelectorAll('hl-card');
      let total = cards.length;
      let visible = 0;

      cards.forEach(card => {
        const title = (card.getAttribute('title') || '').toLowerCase();
        const body  = (card.textContent || '').toLowerCase();
        const match = !q || title.includes(q) || body.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // セクションに可視カードがなければセクションごと隠す
      container.querySelectorAll('section.hl-section').forEach(sec => {
        const any = [...sec.querySelectorAll('hl-card')].some(c => c.style.display !== 'none');
        sec.style.display = any ? '' : 'none';
      });

      if (q) {
        metaEl.textContent = visible === 0 ? '一致する記事が見つかりませんでした' : `${visible} / ${total} 件`;
        // 0件のとき空状態プレースホルダー表示
        if (!emptyEl) {
          emptyEl = document.createElement('p');
          emptyEl.className = 'hl-asearch__empty';
          emptyEl.textContent = '「' + input.value.trim() + '」に一致する記事はありませんでした。';
          container.after(emptyEl);
        }
        if (visible === 0) {
          emptyEl.textContent = '「' + input.value.trim() + '」に一致する記事はありませんでした。';
          emptyEl.style.display = '';
        } else {
          emptyEl.style.display = 'none';
        }
      } else {
        metaEl.textContent = '';
        if (emptyEl) emptyEl.style.display = 'none';
      }
    };

    const wireEvents = () => {
      input.addEventListener('input', doFilter);
      clearBtn.addEventListener('click', () => {
        input.value = '';
        doFilter();
        input.focus();
      });
      // Enterキーでフォームのデフォルト送信を防止
      input.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    };

    // コンテンツがすでに読み込まれているか、後で読み込まれるかを判定
    const container = document.getElementById(target);
    if (container && container.children.length > 0) {
      wireEvents();
    } else {
      window.addEventListener('halcyon-content-loaded', wireEvents, { once: true });
    }
  }
}
customElements.define('hl-archive-search', HlArchiveSearch);

class HlAlert extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const type = this.getAttribute('type') || 'info';
    const BASE = 'https://5gkyu.github.io/icon/';
    const iconMap = {
      info:    `<img src="${BASE}lightbulb.svg" alt="">`,
      warning: `<img src="${BASE}warning.svg"   alt="">`,
      success: `<img src="${BASE}check.svg"     alt="">`,
    };
    const icon = iconMap[type] || iconMap.info;
    this.innerHTML = `<div class="hl-alert hl-alert--${type}"><span class="hl-alert__icon">${icon}</span><div class="hl-content-text hl-alert__body">${this.innerHTML}</div></div>`;
  }
}
customElements.define('hl-alert', HlAlert);

class HlChat extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const char  = this.getAttribute('char')  || 'A';
    const align = this.getAttribute('align') || 'left';
    const src   = this.getAttribute('src')   || '';
    let imgSrc;
    if (src) {
      imgSrc = src;
    } else {
      const charNames = { A: 'Akari', B: 'Becky', C: 'Charlotte', D: 'Dulcie', E: 'Esme', F: 'Fuka' };
      const charName = charNames[char] || char;
      imgSrc = `https://5gkyu.github.io/icon/hl-char/${charName}.png`;
    }
    this.innerHTML = `<div class="hl-chat-wrapper is-${align}" data-char="${char}"><div class="hl-chat-icon"><img src="${imgSrc}" loading="lazy" decoding="async" alt="Character ${char}" draggable="false" oncontextmenu="return false;" onerror="this.style.display='none'; this.parentNode.innerText='${char}'"></div><div class="hl-chat-bubble">${this.innerHTML}</div></div>`;
  }
}
customElements.define('hl-chat', HlChat);

class HlButton extends HTMLElement {
  static get observedAttributes() { return ['loading']; }
  
  connectedCallback() {
    if (this.dataset.rendered && !this.hasAttribute('loading')) return;
    this.dataset.rendered = 'true';
    // 初期状態のinnerHTMLを保存しておく（ローディング解除後に戻すため）
    if (!this._originalContent) {
      this._originalContent = this.innerHTML;
    }
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (this.dataset.rendered && name === 'loading') {
      this._render();
    }
  }

  _render() {
    const href = this.getAttribute('href');
    const variant = this.getAttribute('variant') || 'primary';
    const isBlock = this.hasAttribute('block');
    const icon = this.getAttribute('icon') || '';
    const target = this.getAttribute('target') || '';
    const isLoading = this.hasAttribute('loading');
    
    const baseClass = `hl-btn hl-btn--${variant} ${isBlock ? 'hl-btn--block' : ''} ${isLoading ? 'is-loading' : ''}`;
    
    const spinnerHtml = `<span class="hl-spinner"></span>`;
    const iconHtml = icon ? `<span aria-hidden="true">${icon}</span>` : '';
    const targetAttr = target ? `target="${target}" rel="noopener noreferrer"` : '';
    
    // loading中は元のテキストとアイコンを透明にして、中央にスピナーを配置
    const innerStyle = isLoading ? 'visibility: hidden; opacity: 0;' : 'transition: opacity 0.2s;';
    const contentHtml = `<span style="display:inline-flex; align-items:center; gap:0.5rem; ${innerStyle}">${iconHtml}${this._originalContent}</span>`;
    const finalInner = isLoading ? `${spinnerHtml}${contentHtml}` : contentHtml;

    if (href) {
      this.innerHTML = `<a href="${href}" class="${baseClass}" ${targetAttr}>${finalInner}</a>`;
    } else {
      this.innerHTML = `<button class="${baseClass}" ${isLoading ? 'disabled' : ''}>${finalInner}</button>`;
    }
  }
}
customElements.define('hl-button', HlButton);

// --- ARIA対応: HlAccordion ---
class HlAccordion extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const rawTitle = this.getAttribute('title') || '詳細を見る';
    const title = rawTitle;
    const contentId = 'acc-' + Math.random().toString(36).substr(2, 9);
    
    this.innerHTML = `
      <div class="hl-accordion">
        <button class="hl-accordion__header" aria-expanded="false" aria-controls="${contentId}">
          <span>${title}</span><span class="hl-accordion__icon" aria-hidden="true">▼</span>
        </button>
        <div class="hl-accordion__content-wrapper" id="${contentId}" aria-hidden="true">
          <div class="hl-accordion__content"><div class="hl-accordion__content-inner hl-content-text">${this.innerHTML}</div></div>
        </div>
      </div>`;
      
    const btn = this.querySelector('button');
    const wrapper = this.querySelector('.hl-accordion__content-wrapper');
    const container = this.querySelector('.hl-accordion');
    
    btn.addEventListener('click', () => {
      const isOpen = container.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen);
      wrapper.setAttribute('aria-hidden', !isOpen);
    });
  }
}
customElements.define('hl-accordion', HlAccordion);

// --- ARIA対応: HlTabs ---
class HlTabs extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    setTimeout(() => {
      const panels = Array.from(this.querySelectorAll('.hl-tab-panel'));
      const navHtml = panels.map((panel, index) => {
        const label = panel.getAttribute('data-label') || `タブ ${index + 1}`;
        const panelId = `tabpanel-${index}`;
        const tabId = `tab-${index}`;
        
        panel.id = panelId;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabId);
        
        return `<button class="hl-tabs-btn ${index === 0 ? 'is-active' : ''}" id="${tabId}" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" aria-controls="${panelId}" data-index="${index}" draggable="false" type="button">${label}</button>`;
      }).join('');
      
      const navContainer = document.createElement('div');
      navContainer.className = 'hl-tabs-nav';
      navContainer.setAttribute('role', 'tablist');
      navContainer.innerHTML = navHtml;
      this.insertBefore(navContainer, this.firstChild);
      
      const btns = this.querySelectorAll('.hl-tabs-btn');
      if(panels[0]) panels[0].classList.add('is-active');
      
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          // e.target が内部テキストノード等になるケースに備えてボタン自体を確実に取得
          const btnEl = e.currentTarget;
          const index = parseInt(btnEl.getAttribute('data-index'), 10);
          if (isNaN(index)) return;
          e.preventDefault();
          e.stopPropagation();
          btns.forEach(b => { 
            b.classList.remove('is-active'); 
            b.setAttribute('aria-selected', 'false');
          });
          panels.forEach(p => p.classList.remove('is-active'));
          
          btnEl.classList.add('is-active');
          btnEl.setAttribute('aria-selected', 'true');
          if(panels[index]) panels[index].classList.add('is-active');
        });
      });
    }, 10);
  }
}
customElements.define('hl-tabs', HlTabs);

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

class HlStep extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const content = this.innerHTML;
    this.innerHTML = `<div class="hl-step-container">${content}</div>`;
  }
}
customElements.define('hl-step', HlStep);

class HlStepItem extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const num = this.getAttribute('num') || '*';
    const title = this.getAttribute('title') || '';
    const content = this.innerHTML;
    const titleHtml = title ? `<div class="hl-step-title">${title}</div>` : '';
    this.innerHTML = `<div class="hl-step-item"><div class="hl-step-marker" aria-hidden="true">${num}</div><div class="hl-step-body">${titleHtml}<div class="hl-content-text">${content}</div></div></div>`;
  }
}
customElements.define('hl-step-item', HlStepItem);

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

/* ============================================================
   FORM COMPONENTS
============================================================ */
class HlInput extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name     = this.getAttribute('name') || 'input';
    const type     = this.getAttribute('type') || 'text';
    const ph       = this.getAttribute('placeholder') || '';
    const label    = this.getAttribute('label') || '';
    const hint     = this.getAttribute('hint') || '';
    const autocomplete = this.getAttribute('autocomplete') || 'off'; // 追加
    const required = this.hasAttribute('required');
    const optional = this.hasAttribute('optional');
    const val      = this.getAttribute('value') || '';
    const badge    = required ? '<span class="hl-label__required">必須</span>'
                   : optional ? '<span class="hl-label__optional">任意</span>' : '';
    const labelHtml = label ? `<label class="hl-label" for="hl-${name}">${label}${badge}</label>` : '';
    const hintHtml  = hint  ? `<span class="hl-field-hint">${hint}</span>` : '';
    // autocomplete="${autocomplete}" を追加
    this.innerHTML = `<div class="hl-field">${labelHtml}<input class="hl-input" id="hl-${name}" name="${name}" type="${type}" placeholder="${ph}" value="${val}" autocomplete="${autocomplete}"${required ? ' required' : ''}><div class="hl-field-error" style="display:none;" aria-live="polite"></div>${hintHtml}</div>`;
  }
}
customElements.define('hl-input', HlInput);

class HlTextarea extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name     = this.getAttribute('name') || 'textarea';
    const ph       = this.getAttribute('placeholder') || '';
    const label    = this.getAttribute('label') || '';
    const hint     = this.getAttribute('hint') || '';
    const rows     = this.getAttribute('rows') || '4';
    const required = this.hasAttribute('required');
    const optional = this.hasAttribute('optional');
    const inner    = this.innerHTML.trim();
    const badge    = required ? '<span class="hl-label__required">必須</span>' : optional ? '<span class="hl-label__optional">任意</span>' : '';
    const labelHtml = label ? `<label class="hl-label" for="hl-${name}">${label}${badge}</label>` : '';
    const hintHtml  = hint  ? `<span class="hl-field-hint" id="hl-hint-${name}">${hint}</span>` : '';
    this.innerHTML = `<div class="hl-field">${labelHtml}<textarea class="hl-textarea" id="hl-${name}" name="${name}" placeholder="${ph}" rows="${rows}"${required ? ' required aria-required="true"' : ''}${hint ? ` aria-describedby="hl-hint-${name}"` : ''}>${inner}</textarea><div class="hl-field-error" style="display:none;" aria-live="polite"></div>${hintHtml}</div>`;
  }
}
customElements.define('hl-textarea', HlTextarea);

class HlSelect extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name     = this.getAttribute('name') || 'select';
    const label    = this.getAttribute('label') || '';
    const hint     = this.getAttribute('hint') || '';
    const required = this.hasAttribute('required');
    const optional = this.hasAttribute('optional');
    const options  = this.innerHTML;
    const badge    = required ? '<span class="hl-label__required">必須</span>' : optional ? '<span class="hl-label__optional">任意</span>' : '';
    const labelHtml = label ? `<label class="hl-label" for="hl-${name}">${label}${badge}</label>` : '';
    const hintHtml  = hint  ? `<span class="hl-field-hint" id="hl-hint-${name}">${hint}</span>` : '';
    this.innerHTML = `<div class="hl-field">${labelHtml}<div class="hl-select-wrap"><select class="hl-select" id="hl-${name}" name="${name}"${required ? ' required aria-required="true"' : ''}${hint ? ` aria-describedby="hl-hint-${name}"` : ''}>${options}</select></div>${hintHtml}</div>`;
  }
}
customElements.define('hl-select', HlSelect);

class HlCheckbox extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name    = this.getAttribute('name') || 'checkbox';
    const label   = this.getAttribute('label') || '';
    const value   = this.getAttribute('value') || '1';
    const checked = this.hasAttribute('checked') ? 'checked' : '';
    this.innerHTML = `<label class="hl-check-label"><input type="checkbox" name="${name}" value="${value}" ${checked}><span class="hl-check-box" aria-hidden="true"></span>${label}</label>`;
  }
}
customElements.define('hl-checkbox', HlCheckbox);

class HlRadio extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name    = this.getAttribute('name') || 'radio';
    const label   = this.getAttribute('label') || '';
    const value   = this.getAttribute('value') || '';
    const checked = this.hasAttribute('checked') ? 'checked' : '';
    this.innerHTML = `<label class="hl-check-label"><input type="radio" name="${name}" value="${value}" ${checked}><span class="hl-radio-box" aria-hidden="true"></span>${label}</label>`;
  }
}
customElements.define('hl-radio', HlRadio);

class HlToggle extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name    = this.getAttribute('name') || 'toggle';
    const label   = this.getAttribute('label') || '';
    const checked = this.hasAttribute('checked') ? 'checked' : '';
    this.innerHTML = `<label class="hl-toggle-label"><input type="checkbox" role="switch" aria-checked="${checked ? 'true' : 'false'}" name="${name}" ${checked}><span class="hl-toggle-track" aria-hidden="true"></span>${label}</label>`;
    const input = this.querySelector('input');
    input.addEventListener('change', (e) => input.setAttribute('aria-checked', e.target.checked));
  }
}
customElements.define('hl-toggle', HlToggle);

/* ============================================================
   INTERACTION COMPONENTS
============================================================ */
class HlTooltip extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const tip = this.getAttribute('tip') || '';
    const inner = this.innerHTML;
    this.innerHTML = `<span class="hl-tooltip-wrap" tabindex="0">${inner}<span class="hl-tooltip-tip" role="tooltip">${tip}</span></span>`;
  }
}
customElements.define('hl-tooltip', HlTooltip);

class HlPopover extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const label = this.getAttribute('label') || 'メニュー';
    const inner = this.innerHTML;
    this.innerHTML = `<div class="hl-popover-wrap"><button class="hl-btn hl-btn--secondary" aria-haspopup="true" aria-expanded="false" style="font-size:0.85rem;padding:0.5rem 1rem;">${label} ▾</button><div class="hl-popover-panel hl-content-text">${inner}</div></div>`;
    const btn   = this.querySelector('button');
    const panel = this.querySelector('.hl-popover-panel');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', () => {
      panel.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }
}
customElements.define('hl-popover', HlPopover);

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

/* ============================================================
   TABLE
============================================================ */
class HlTable extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const striped = this.hasAttribute('striped') ? ' hl-table--striped' : '';
    const compact = this.hasAttribute('compact') ? ' hl-table--compact' : '';
    const table = this.querySelector('table');
    if (!table) return;
    table.classList.add('hl-table');
    if (striped) table.classList.add('hl-table--striped');
    if (compact) table.classList.add('hl-table--compact');
    const wrap = document.createElement('div');
    wrap.className = 'hl-table-wrap';
    this.appendChild(wrap);
    wrap.appendChild(table);
  }
}
customElements.define('hl-table', HlTable);

/* ============================================================
   PAGINATION
============================================================ */
class HlPagination extends HTMLElement {
  static get observedAttributes() { return ['page', 'total']; }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { if (this.dataset.rendered) this._render(); }
  _render() {
    this.dataset.rendered = 'true';
    const total    = parseInt(this.getAttribute('total'))    || 1;
    const current  = parseInt(this.getAttribute('page'))     || 1;
    const siblings = parseInt(this.getAttribute('siblings')) || 1;
    const pages    = [];
    const range    = (from, to) => { for (let i = from; i <= to; i++) pages.push(i); };
    range(Math.max(1, current - siblings), Math.min(total, current + siblings));
    if (!pages.includes(1)) { if (pages[0] > 2) pages.unshift('...'); pages.unshift(1); }
    if (!pages.includes(total)) { if (pages[pages.length - 1] < total - 1) pages.push('...'); pages.push(total); }
    const btns = pages.map(p => p === '...'
      ? `<span class="hl-page-ellipsis">…</span>`
      : `<button class="hl-page-btn${p === current ? ' is-active' : ''}" aria-label="${p}ページ目" ${p === current ? 'aria-current="page"' : ''} data-page="${p}">${p}</button>`
    ).join('');
    this.innerHTML = `<nav class="hl-pagination" aria-label="ページネーション">
      <button class="hl-page-btn" data-page="${current - 1}" aria-label="前のページ"${current <= 1 ? ' disabled' : ''}>‹</button>
      ${btns}
      <button class="hl-page-btn" data-page="${current + 1}" aria-label="次のページ"${current >= total ? ' disabled' : ''}>›</button>
    </nav>`;
    this.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (isNaN(p) || p < 1 || p > total) return;
        this.setAttribute('page', p);
        this.dispatchEvent(new CustomEvent('hl-page-change', { detail: { page: p }, bubbles: true }));
      });
    });
  }
}
customElements.define('hl-pagination', HlPagination);

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

/* ============================================================
   DIVIDER
============================================================ */
class HlDivider extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const variant = this.getAttribute('variant') || '';
    const cls     = variant ? ` hl-divider--${variant}` : '';
    const label   = this.innerHTML.trim();
    this.innerHTML = `<div class="hl-divider${cls}" role="separator">${label}</div>`;
  }
}
customElements.define('hl-divider', HlDivider);

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

/* ============================================================
   CAROUSEL
============================================================ */
class HlCarousel extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    setTimeout(() => this._setup(), 0);
  }
  _setup() {
    const slides   = Array.from(this.querySelectorAll('.hl-carousel-slide'));
    if (!slides.length) return;
    const loop     = this.hasAttribute('loop');
    const autoplay = this.hasAttribute('autoplay');
    const interval = parseInt(this.getAttribute('interval')) || 4000;
    this._total    = slides.length;
    this._current  = 0;
    const dots = slides.map((_, i) => `<button class="hl-carousel-dot${i === 0 ? ' is-active' : ''}" aria-label="${i + 1}ページ目" data-idx="${i}"></button>`).join('');
    const track = document.createElement('div');
    track.className = 'hl-carousel-track';
    slides.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', `${i + 1} of ${this._total}`);
      track.appendChild(s);
    });
    this.innerHTML = `
      <div role="region" aria-roledescription="carousel" aria-label="ギャラリー">
        <div class="hl-carousel-viewport">
          <button class="hl-carousel-btn hl-carousel-btn--prev" aria-label="前へ">‹</button>
          <button class="hl-carousel-btn hl-carousel-btn--next" aria-label="次へ">›</button>
        </div>
        <div class="hl-carousel-dots">${dots}</div>
      </div>`;
    const viewport = this.querySelector('.hl-carousel-viewport');
    viewport.insertBefore(track, this.querySelector('.hl-carousel-btn--prev'));
    this._track = track;
    this.querySelector('.hl-carousel-btn--prev').addEventListener('click', () => this._go(this._current - 1));
    this.querySelector('.hl-carousel-btn--next').addEventListener('click', () => this._go(this._current + 1));
    this.querySelectorAll('.hl-carousel-dot').forEach(d => d.addEventListener('click', () => this._go(parseInt(d.dataset.idx))));
    if (autoplay) this._timer = setInterval(() => this._go(this._current + 1), interval);
  }
  _go(idx) {
    const loop = this.hasAttribute('loop');
    if (loop) { idx = ((idx % this._total) + this._total) % this._total; }
    else       { idx = Math.max(0, Math.min(this._total - 1, idx)); }
    this._current = idx;
    this._track.style.transform = `translateX(-${idx * 100}%)`;
    this.querySelectorAll('.hl-carousel-dot').forEach((d, i) => d.classList.toggle('is-active', i === idx));
    const prev = this.querySelector('.hl-carousel-btn--prev');
    const next = this.querySelector('.hl-carousel-btn--next');
    if (!loop) { prev.disabled = idx === 0; next.disabled = idx === this._total - 1; }
  }
  disconnectedCallback() { clearInterval(this._timer); }
}
customElements.define('hl-carousel', HlCarousel);

/* ============================================================
   CHIP
============================================================ */
class HlChip extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const color     = this.getAttribute('color')    || '';
    const value     = this.getAttribute('value')    || '';
    const removable = this.hasAttribute('removable');
    const label     = this.innerHTML.trim() || value;
    const colorCls  = color ? ` hl-chip--${color}` : '';
    const closeBtn  = removable ? `<button class="hl-chip__close" aria-label="${label}を削除">✕</button>` : '';
    this.innerHTML  = `<span class="hl-chip${colorCls}">${label}${closeBtn}</span>`;
    if (removable) {
      this.querySelector('.hl-chip__close').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hl-chip-remove', { detail: { value: value || label }, bubbles: true }));
        this.remove();
      });
    }
  }
}
customElements.define('hl-chip', HlChip);

/* ============================================================
   SLIDER
============================================================ */
class HlSlider extends HTMLElement {
  static get observedAttributes() { return ['value', 'min', 'max', 'step', 'disabled']; }

  connectedCallback() {
    this._setup();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal || !this._track) return;
    if (name === 'value') {
      this._val = this._clamp(parseFloat(newVal));
      this._update();
    } else {
      // min/max/step/disabled changes require full re-render
      this._setup();
    }
  }

  _setup() {
    this._min      = parseFloat(this.getAttribute('min'))  || 0;
    this._max      = parseFloat(this.getAttribute('max'))  || 100;
    this._step     = parseFloat(this.getAttribute('step')) || 1;
    this._val      = this._clamp(parseFloat(this.getAttribute('value')) || this._min);
    const label    = this.getAttribute('label')  || '';
    const unit     = this.getAttribute('unit')   || '';
    const ticksRaw = this.getAttribute('ticks');
    const disabled = this.hasAttribute('disabled');
    this._unit     = unit;

    const id = 'hl-slider-' + Math.random().toString(36).substr(2, 7);

    let ticksHtml = '';
    if (ticksRaw) {
      const ticks = ticksRaw.split(',').map(s => s.trim());
      ticksHtml = `<div class="hl-slider__ticks" aria-hidden="true">${ticks.map(t => `<span class="hl-slider__tick">${t}</span>`).join('')}</div>`;
    }

    this.innerHTML = `
      <div class="hl-slider${disabled ? ' is-disabled' : ''}">
        ${label ? `<div class="hl-slider__header">
          <label class="hl-slider__label" for="${id}">${label}</label>
          <span class="hl-slider__value" id="${id}-val">${this._fmt(this._val)}</span>
        </div>` : `<div class="hl-slider__header" style="justify-content:flex-end;">
          <span class="hl-slider__value" id="${id}-val">${this._fmt(this._val)}</span>
        </div>`}
        <div class="hl-slider__track" role="none">
          <div class="hl-slider__fill"></div>
          <div class="hl-slider__thumb"
            role="slider"
            id="${id}"
            tabindex="${disabled ? -1 : 0}"
            aria-valuemin="${this._min}"
            aria-valuemax="${this._max}"
            aria-valuenow="${this._val}"
            aria-label="${label || 'スライダー'}"
            ${disabled ? 'aria-disabled="true"' : ''}
          ></div>
        </div>
        ${ticksHtml}
        <input type="range" class="hl-slider__input" min="${this._min}" max="${this._max}" step="${this._step}" value="${this._val}" aria-hidden="true" tabindex="-1">
      </div>`;

    this._track  = this.querySelector('.hl-slider__track');
    this._fill   = this.querySelector('.hl-slider__fill');
    this._thumb  = this.querySelector('.hl-slider__thumb');
    this._valEl  = this.querySelector('.hl-slider__value');
    this._input  = this.querySelector('.hl-slider__input');

    this._update();
    if (!disabled) this._bindEvents();
  }

  _clamp(v) {
    v = Math.min(this._max, Math.max(this._min, v));
    const steps = Math.round((v - this._min) / this._step);
    return parseFloat((this._min + steps * this._step).toFixed(10));
  }

  _fmt(v) {
    return v + (this._unit ? '\u00a0' + this._unit : '');
  }

  _pct() {
    return (this._val - this._min) / (this._max - this._min) * 100;
  }

  _update() {
    const pct = this._pct();
    this._fill.style.width  = pct + '%';
    this._thumb.style.left  = pct + '%';
    this._thumb.setAttribute('aria-valuenow', this._val);
    if (this._valEl) this._valEl.textContent = this._fmt(this._val);
    if (this._input) this._input.value = this._val;
  }

  _posToVal(clientX) {
    const rect = this._track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return this._clamp(this._min + ratio * (this._max - this._min));
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('hl-slider-change', {
      detail: { value: this._val },
      bubbles: true
    }));
  }

  _bindEvents() {
    // Mouse / Touch drag
    const move = (clientX) => {
      this._val = this._posToVal(clientX);
      this._update();
      this._emit();
    };

    this._thumb.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const onMove = (e) => move(e.clientX);
      const onUp   = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    this._thumb.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const onMove = (e) => move(e.touches[0].clientX);
      const onEnd  = () => { document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    });

    // Click on track
    this._track.addEventListener('click', (e) => {
      if (e.target === this._thumb) return;
      this._val = this._posToVal(e.clientX);
      this._update();
      this._emit();
    });

    // Keyboard
    this._thumb.addEventListener('keydown', (e) => {
      let changed = false;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        this._val = this._clamp(this._val + this._step); changed = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        this._val = this._clamp(this._val - this._step); changed = true;
      } else if (e.key === 'Home') {
        this._val = this._min; changed = true;
      } else if (e.key === 'End') {
        this._val = this._max; changed = true;
      }
      if (changed) { e.preventDefault(); this._update(); this._emit(); }
    });
  }

  // Public API
  get value() { return this._val; }
  set value(v) { this._val = this._clamp(parseFloat(v)); this._update(); }
}
customElements.define('hl-slider', HlSlider);

/* ============================================================
   HL-FILE-INPUT  — スタイル付きファイル選択コンポーネント
   属性:
     accept   – 許可する MIME タイプ / 拡張子 (例: "image/*")
     multiple – 複数選択を許可
     drop     – ドラッグ＆ドロップゾーン UI を使用
   プロパティ:
     .files   – 選択された FileList
   メソッド:
     .reset() – 選択状態をクリア
   イベント:
     change   – ファイル選択 / ドロップ時に bubbles: true で発火
============================================================ */
class HlFileInput extends HTMLElement {
  static get observedAttributes() { return ['accept', 'multiple', 'drop']; }

  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this._render();
    this._bind();
  }

  _render() {
    const accept   = this.getAttribute('accept') || '';
    const multiple = this.hasAttribute('multiple');
    const drop     = this.hasAttribute('drop');

    if (drop) {
      this.innerHTML = `
        <div class="hl-file-input hl-file-input--drop">
          <span class="hl-file-input__icon"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,44,44a8,8,0,0,0,11.31,0l28.69-28.68L216,184.68V200Z"/><circle cx="96" cy="96" r="16"/></svg></span>
          <button class="hl-file-input__btn" type="button">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12v3a2 2 0 002 2h10a2 2 0 002-2v-3M10 3v9M7 6l3-3 3 3"/>
            </svg>
            ファイルを選択
          </button>
          <span class="hl-file-input__name">選択されていません</span>
          <span class="hl-file-input__hint">またはここにドロップ</span>
          <input type="file" class="hl-file-input__native"${accept ? ` accept="${accept}"` : ''}${multiple ? ' multiple' : ''}>
        </div>`;
    } else {
      this.innerHTML = `
        <div class="hl-file-input">
          <button class="hl-file-input__btn" type="button">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12v3a2 2 0 002 2h10a2 2 0 002-2v-3M10 3v9M7 6l3-3 3 3"/>
            </svg>
            ファイルを選択
          </button>
          <span class="hl-file-input__name">選択されていません</span>
          <input type="file" class="hl-file-input__native"${accept ? ` accept="${accept}"` : ''}${multiple ? ' multiple' : ''}>
        </div>`;
    }

    this._wrap   = this.querySelector('.hl-file-input');
    this._btn    = this.querySelector('.hl-file-input__btn');
    this._name   = this.querySelector('.hl-file-input__name');
    this._native = this.querySelector('.hl-file-input__native');
  }

  _bind() {
    // ボタンクリック → ファイルダイアログを開く
    this._btn.addEventListener('click', () => this._native.click());

    // ドロップゾーンのクリック（ボタン以外の領域）
    if (this.hasAttribute('drop')) {
      this._wrap.addEventListener('click', (e) => {
        if (e.target === this._btn || this._btn.contains(e.target)) return;
        this._native.click();
      });
    }

    // ファイルが選択された
    this._native.addEventListener('change', () => this._onFiles(this._native.files));

    // ドラッグ＆ドロップ (drop 属性がある場合)
    if (this.hasAttribute('drop')) {
      this._wrap.addEventListener('dragover', (e) => {
        e.preventDefault();
        this._wrap.classList.add('is-dragging');
      });
      this._wrap.addEventListener('dragleave', () => {
        this._wrap.classList.remove('is-dragging');
      });
      this._wrap.addEventListener('drop', (e) => {
        e.preventDefault();
        this._wrap.classList.remove('is-dragging');
        const droppedFiles = e.dataTransfer.files;
        if (!droppedFiles.length) return;
        // multiple 属性がない場合は先頭 1 件のみ受け付ける
        const srcArr = this.hasAttribute('multiple')
          ? Array.from(droppedFiles)
          : [droppedFiles[0]];
        try {
          const dt = new DataTransfer();
          srcArr.forEach(f => dt.items.add(f));
          this._native.files = dt.files;
          this._onFiles(dt.files);
        } catch (_) {
          this._onFiles(droppedFiles);
        }
      });
    }
  }

  _onFiles(files) {
    if (files && files.length) {
      const names = Array.from(files).map(f => f.name).join(', ');
      this._name.textContent = names;
      this._name.classList.add('is-set');
    } else {
      this._name.textContent = '選択されていません';
      this._name.classList.remove('is-set');
    }
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  get files() { return this._native ? this._native.files : null; }

  reset() {
    if (this._native) this._native.value = '';
    if (this._name) {
      this._name.textContent = '選択されていません';
      this._name.classList.remove('is-set');
    }
  }
}
customElements.define('hl-file-input', HlFileInput);
class HlImage extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    
    const src = this.getAttribute('src') || '';
    const alt = this.getAttribute('alt') || '';
    // プレースホルダー（軽量なボカシ用画像など）。指定がなければ透明な1px画像を使用。
    const placeholder = this.getAttribute('placeholder') || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

    this.innerHTML = `
      <div class="hl-lazy-image">
        <img src="${placeholder}" data-src="${src}" alt="${alt}" class="is-loading" draggable="false" oncontextmenu="return false;">
      </div>
    `;
    
    const img = this.querySelector('img');
    
    // Intersection Observerで画面内に入ったら本画像を読み込む
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const trueSrc = img.getAttribute('data-src');
          if (trueSrc) {
            // 裏側で画像を読み込んでから表示を切り替える
            const tempImg = new Image();
            tempImg.src = trueSrc;
            tempImg.onload = () => {
              img.src = trueSrc;
              img.classList.remove('is-loading');
              img.classList.add('is-loaded');
            };
          }
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px 0px' }); // 画面に入る100px手前で読み込み開始
    
    observer.observe(img);
  }
}
customElements.define('hl-image', HlImage);

/* ============================================================
   HL-LEAD — 記事リード文
   使用例: <hl-lead><p>要約テキスト</p></hl-lead>
============================================================ */
class HlLead extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const content = this.innerHTML;
    this.innerHTML = `<div class="hl-lead">${content}</div>`;
  }
}
customElements.define('hl-lead', HlLead);

/* ============================================================
   HL-FIGURE — 画像＋キャプション＋出典
   属性:
     src        — 画像URL（省略時は子要素の<img>をそのまま使用）
     alt        — alt テキスト
     caption    — キャプション文字列
     source     — 出典名
     source-url — 出典URL
============================================================ */
class HlFigure extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const caption   = this.getAttribute('caption')    || '';
    const src       = this.getAttribute('src')        || '';
    const alt       = this.getAttribute('alt')        || caption;
    const source    = this.getAttribute('source')     || '';
    const sourceUrl = this.getAttribute('source-url') || '';
    const imgHtml   = src
      ? `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`
      : this.innerHTML;
    const captionHtml = caption ? `<p class="hl-figure__caption">${caption}</p>` : '';
    const sourceHtml  = source
      ? (sourceUrl
          ? `<p class="hl-figure__source">出典: <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${source}</a></p>`
          : `<p class="hl-figure__source">出典: ${source}</p>`)
      : '';
    this.innerHTML = `<figure class="hl-figure">${imgHtml}<figcaption>${captionHtml}${sourceHtml}</figcaption></figure>`;
  }
}
customElements.define('hl-figure', HlFigure);

/* ============================================================
   HL-CITE — 参考文献・引用元情報
   属性:
     title     — 書名・記事名
     author    — 著者名
     publisher — 出版社・サイト名
     year      — 年
     url       — URL
     accessed  — 参照日（例: 2026.05.17）
============================================================ */
class HlCite extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title     = this.getAttribute('title')     || '';
    const author    = this.getAttribute('author')    || '';
    const publisher = this.getAttribute('publisher') || '';
    const year      = this.getAttribute('year')      || '';
    const url       = this.getAttribute('url')       || '';
    const accessed  = this.getAttribute('accessed')  || '';
    const metaParts = [author, publisher, year].filter(Boolean).join(' / ');
    const titleHtml = title     ? `<span class="hl-cite__title">${title}</span>` : '';
    const metaHtml  = metaParts ? `<span class="hl-cite__meta">${metaParts}</span>` : '';
    const urlHtml   = url
      ? `<span class="hl-cite__url"><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${accessed ? `（${accessed} 参照）` : ''}</span>`
      : '';
    this.innerHTML = `<div class="hl-cite" role="note">${titleHtml}${metaHtml}${urlHtml}</div>`;
  }
}
customElements.define('hl-cite', HlCite);

/* ============================================================
   HL-FN / HL-FN-ITEM / HL-FOOTNOTES — 脚注
   hl-fn:        本文中の参照マーカー（属性: num）
   hl-fn-item:   個別注釈エントリ（属性: num、hl-footnotesの子要素として使用）
   hl-footnotes: 脚注一覧コンテナ（属性: label）
   使用例:
     本文中: ...本文テキスト<hl-fn num="1"></hl-fn>...
     末尾:
       <hl-footnotes label="注記">
         <hl-fn-item num="1">注釈テキスト</hl-fn-item>
       </hl-footnotes>
============================================================ */
class HlFn extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const num = this.getAttribute('num') || '?';
    this.innerHTML = `<span class="hl-fn-ref"><a href="#hl-footnote-${num}" id="hl-fn-ref-${num}" aria-label="脚注${num}">[${num}]</a></span>`;
  }
}
customElements.define('hl-fn', HlFn);

class HlFnItem extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const num = this.getAttribute('num') || '?';
    const content = this.innerHTML;
    this.innerHTML = `<span class="hl-footnotes__num"><a href="#hl-fn-ref-${num}" aria-label="本文に戻る">[${num}]</a></span><span>${content}</span>`;
    this.id = `hl-footnote-${num}`;
    this.setAttribute('role', 'listitem');
  }
}
customElements.define('hl-fn-item', HlFnItem);

class HlFootnotes extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const label = this.getAttribute('label') || '参考・注記';
    const items = this.innerHTML;
    this.innerHTML = `<section class="hl-footnotes" aria-label="${label}"><p class="hl-footnotes__title">${label}</p><ol class="hl-footnotes__list">${items}</ol></section>`;
  }
}
customElements.define('hl-footnotes', HlFootnotes);

/* ============================================================
   HL-EMBED — 動画埋め込み（YouTube / Niconico 等）
   属性:
     url     — 視聴URL（embed用URLに自動変換）
     src     — embed URL直接指定（urlと排他）
     caption — キャプション（任意）
   対応サービス:
     YouTube: https://www.youtube.com/watch?v=... / https://youtu.be/...
     Niconico: https://www.nicovideo.jp/watch/...
============================================================ */
class HlEmbed extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    let src           = this.getAttribute('src')     || '';
    const url         = this.getAttribute('url')     || '';
    const caption     = this.getAttribute('caption') || '';
    
    // オプション属性の取得
    const autoplay = this.hasAttribute('autoplay');
    const loop = this.hasAttribute('loop');
    const muted = this.hasAttribute('muted');

    if (!src && url) src = HlEmbed.toEmbedUrl(url, { autoplay, loop, muted });
    if (!src) { this.innerHTML = ''; return; }
    
    const captionHtml = caption ? `<p class="hl-embed__caption">${caption}</p>` : '';
    this.innerHTML = `
      <div class="hl-embed">
        <div class="hl-embed__video">
          <iframe src="${src}" allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy" title="${caption || '動画'}"></iframe>
        </div>
        ${captionHtml}
      </div>`;
  }
  
  static toEmbedUrl(url, options = {}) {
    let embedSrc = '';
    let isYouTube = false;
    let videoId = '';
    
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
        videoId = u.searchParams.get('v');
        if (videoId) { embedSrc = `https://www.youtube.com/embed/${videoId}`; isYouTube = true; }
      }
      else if (u.hostname === 'youtu.be') {
        videoId = u.pathname.slice(1);
        if (videoId) { embedSrc = `https://www.youtube.com/embed/${videoId}`; isYouTube = true; }
      }
      else if (u.hostname.includes('nicovideo.jp') && u.pathname.startsWith('/watch/')) {
        videoId = u.pathname.replace('/watch/', '');
        if (videoId) { embedSrc = `https://embed.nicovideo.jp/watch/${videoId}`; }
      }
    } catch (e) {}

    if (!embedSrc) return '';

    // パラメータの組み立て
    const params = new URLSearchParams();
    if (options.autoplay) params.append('autoplay', '1');
    if (options.muted) {
      if (isYouTube) params.append('mute', '1');
      else params.append('muted', '1');
    }
    if (options.loop) {
      if (isYouTube) {
        params.append('loop', '1');
        params.append('playlist', videoId); // YouTubeはloopにplaylistの指定が必要
      } else {
        params.append('loop', '1');
      }
    }
    
    const queryString = params.toString();
    return queryString ? `${embedSrc}?${queryString}` : embedSrc;
  }
}
customElements.define('hl-embed', HlEmbed);

/* ============================================================
   HL-COMPARE — 2カラム比較
   属性:
     left-label  — 左列の見出し
     right-label — 右列の見出し
   子要素:
     <div slot="left">左内容</div>
     <div slot="right">右内容</div>
   モバイル時: 縦積み
============================================================ */
class HlCompare extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const leftLabel  = this.getAttribute('left-label')  || 'A';
    const rightLabel = this.getAttribute('right-label') || 'B';
    const leftSlot   = this.querySelector('[slot="left"]');
    const rightSlot  = this.querySelector('[slot="right"]');
    const leftContent  = leftSlot  ? leftSlot.innerHTML  : '';
    const rightContent = rightSlot ? rightSlot.innerHTML : '';
    this.innerHTML = `
      <div class="hl-compare">
        <div class="hl-compare__col hl-compare__col--left">
          <div class="hl-compare__label hl-compare__label--left">${leftLabel}</div>
          <div class="hl-compare__body hl-content-text">${leftContent}</div>
        </div>
        <div class="hl-compare__col hl-compare__col--right">
          <div class="hl-compare__label hl-compare__label--right">${rightLabel}</div>
          <div class="hl-compare__body hl-content-text">${rightContent}</div>
        </div>
      </div>`;
  }
}
customElements.define('hl-compare', HlCompare);

/* ============================================================
   4. ローディング画面＆自動フェードアウト (スコープカプセル化)
============================================================ */
(function initHalcyonLoading() {
  if (window.HL_SKIP_LOADING) return;

  const FADE_OUT_MS  = 480;
  const PAGE_TRANSITION_MS = 500;

  // 到着時の視覚負荷を下げるため、本体をやさしくリビールする
  document.body.classList.add('hl-page-entering');

  let viewportMeta = document.querySelector('meta[name="viewport"]');
  let originalViewport = '';
  if (viewportMeta) {
    originalViewport = viewportMeta.content;
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }

  const STAGE_MSGS = [
    () => 'データをまとめています...',
    () => 'お昼寝の準備をしています...',
    () => 'ちょっとまってね',
    () => 'もうすこし...',
    () => 'ロード完了！',
  ];

  const overlay = document.createElement('div');
  overlay.className  = 'hl-overlay';
  overlay.dataset.stage = '-1';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');

  overlay.innerHTML = `
    <div class="hl-char-outer" id="hl-char-outer">
      <div class="hl-char-inner">
        <div id="hl-char-img" class="css-bird">
          <div class="bird-container">
            <div class="bird-leaf leaf1"></div>
            <div class="bird-leaf leaf2"></div>
            <div class="bird-body">
              <div class="bird-eye eye-left"></div>
              <div class="bird-eye eye-right"></div>
              <div class="bird-blush blush-left"></div>
              <div class="bird-blush blush-right"></div>
              <div class="bird-beak"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="hl-road-wrap" aria-hidden="true">
      <svg class="hl-road-svg" viewBox="0 0 1440 88" preserveAspectRatio="none">
        <path class="hl-road-bg" d="M0,55 C220,25 390,72 610,42 C830,12 1030,68 1230,40 C1330,25 1395,50 1440,44"/>
        <path class="hl-road-fg" id="hl-road-fg" d="M0,55 C220,25 390,72 610,42 C830,12 1030,68 1230,40 C1330,25 1395,50 1440,44"/>
        <text class="hl-road-milestone" id="hl-m1" x="355" y="62" font-size="18" text-anchor="middle" fill="#9AB08F">✿</text>
        <text class="hl-road-milestone" id="hl-m2" x="720" y="28" font-size="18" text-anchor="middle" fill="#EEAFA1">✦</text>
        <text class="hl-road-milestone" id="hl-m3" x="1080" y="54" font-size="18" text-anchor="middle" fill="#92B5BC">❀</text>
        <text class="hl-road-milestone" id="hl-m4" x="1410" y="34" font-size="16" text-anchor="middle" font-weight="bold" fill="#9AB08F" font-family="'Zen Maru Gothic', sans-serif">★</text>
      </svg>
    </div>
    <p class="hl-message" id="hl-message">読み込んでいます...</p>
    <div class="hl-bar-wrap">
      <span class="hl-bar-pct" id="hl-pct">0%</span>
      <div class="hl-bar-track"><div class="hl-bar-fill" id="hl-bar-fill"></div></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const foucStyle = document.getElementById('fouc-prevent');
  if (foucStyle) {
    foucStyle.remove();
  }

  function alignToVisualViewport() {
    if (!window.visualViewport) return;
    overlay.style.left = window.visualViewport.offsetLeft + 'px';
    overlay.style.top = window.visualViewport.offsetTop + 'px';
    overlay.style.width = window.visualViewport.width + 'px';
    overlay.style.height = window.visualViewport.height + 'px';
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', alignToVisualViewport);
    window.visualViewport.addEventListener('scroll', alignToVisualViewport);
    alignToVisualViewport();
  }

  const roadFg   = document.getElementById('hl-road-fg');
  let pathLength = 0;
  
  function initPathLength() {
    try {
      pathLength = roadFg.getTotalLength();
      roadFg.style.strokeDasharray  = pathLength;
      roadFg.style.strokeDashoffset = pathLength;
    } catch (_) {}
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPathLength);
  } else {
    requestAnimationFrame(initPathLength);
  }

  const pctEl   = document.getElementById('hl-pct');
  const fillEl  = document.getElementById('hl-bar-fill');
  const msgEl   = document.getElementById('hl-message');
  const outerEl = document.getElementById('hl-char-outer');
  const m1      = document.getElementById('hl-m1');
  const m2      = document.getElementById('hl-m2');
  const m3      = document.getElementById('hl-m3');
  const m4      = document.getElementById('hl-m4');

  let currentStage = -1;
  let rafId = null;
  let simulatedProgress = 0;
  let isFullyLoaded = false;

  if (document.readyState === 'complete') {
    isFullyLoaded = true;
  } else {
    window.addEventListener('load', () => isFullyLoaded = true);
  }

  function charX(p) {
    if (p < 0.25) return -50;
    if (p < 0.75) return -50 + ((p - 0.25) / 0.50) * 100;
    return 50;
  }

  function setProgress(p) {
    const pct = Math.min(Math.round(p * 100), 100);
    pctEl.textContent  = pct + '%';
    fillEl.style.width = pct + '%';
    outerEl.style.transform = `translateX(${charX(p).toFixed(1)}px)`;

    if (pathLength > 0) roadFg.style.strokeDashoffset = (pathLength * (1 - p)).toFixed(2);

    if (p >= 0.25) m1.classList.add('is-reached');
    if (p >= 0.50) m2.classList.add('is-reached');
    if (p >= 0.75) m3.classList.add('is-reached');
    if (p >= 1.00) m4.classList.add('is-reached');

    let stage;
    if      (p < 0.25) stage = 0;
    else if (p < 0.50) stage = 1;
    else if (p < 0.75) stage = 2;
    else if (p < 1.00) stage = 3;
    else               stage = 4;

    if (stage !== currentStage) {
      currentStage = stage;
      overlay.dataset.stage = stage;
      msgEl.classList.add('is-fade');
      setTimeout(() => {
        msgEl.textContent = STAGE_MSGS[stage]();
        msgEl.classList.remove('is-fade');
      }, 200);
    }
  }

  function tick() {
    if (isFullyLoaded) {
      simulatedProgress += (1 - simulatedProgress) * 0.15;
      if (simulatedProgress > 0.995) simulatedProgress = 1;
    } else {
      simulatedProgress += (0.85 - simulatedProgress) * 0.015;
    }
    setProgress(simulatedProgress);

    if (simulatedProgress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        overlay.classList.add('is-out');

        // オーバーレイのフェードアウト終盤から本体をクロスフェードで表示
        setTimeout(() => {
          document.body.classList.remove('hl-page-entering');
        }, Math.max(120, FADE_OUT_MS - 180));

        setTimeout(() => {
          overlay.remove();
          
          if (viewportMeta) {
            viewportMeta.content = originalViewport;
          }
          if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', alignToVisualViewport);
            window.visualViewport.removeEventListener('scroll', alignToVisualViewport);
          }
          
        }, FADE_OUT_MS);
      }, 450);
    }
  }

  rafId = requestAnimationFrame(tick);

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    const target = anchor.getAttribute('target');
    const hasDownload = anchor.hasAttribute('download');

    if (href && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript:') && !hasDownload) {
      e.preventDefault();
      const targetUrl = anchor.href;
      document.body.classList.add('hl-page-fade-out');
      setTimeout(() => window.location.href = targetUrl, PAGE_TRANSITION_MS);
    }
  });

  // bfcache復元時（ブラウザバック・フォワード）に fade-out クラスと FOUC スタイルをリセット
  window.addEventListener('pageshow', (e) => {
    // `pageshow` は bfcache 復元時だけでなく通常遷移でも発生します。
    // 復元後に body が fade-out のまま残るケースがあるため、常に解除しておきます。
    document.body.classList.remove('hl-page-fade-out');
    const foucStyle = document.getElementById('fouc-prevent');
    if (foucStyle) foucStyle.remove();
  });

})();