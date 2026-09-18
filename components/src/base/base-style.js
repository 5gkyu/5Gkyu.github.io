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
  addMeta('<link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png">', 'link[rel="apple-touch-icon"]');
  addMeta('<link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png">', 'link[sizes="32x32"]');
  addMeta('<link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png">', 'link[sizes="16x16"]');
  addMeta('<link rel="manifest" href="/icon/site.webmanifest">', 'link[rel="manifest"]');
  addMeta('<meta property="og:title" content="Halcyon - 5Gkyu">', 'meta[property="og:title"]');
  addMeta('<meta property="og:description" content="Where the world falls silent, we found our own halcyon days.">', 'meta[property="og:description"]');
  addMeta('<meta property="og:image" content="/icon/ogp.png">', 'meta[property="og:image"]');
  addMeta('<meta property="og:url" content="https://5gkyu.github.io/">', 'meta[property="og:url"]');
  addMeta('<meta property="og:type" content="website">', 'meta[property="og:type"]');
  addMeta('<meta property="og:site_name" content="Halcyon">', 'meta[property="og:site_name"]');
  addMeta('<meta name="twitter:card" content="summary_large_image">', 'meta[name="twitter:card"]');
  addMeta('<meta name="twitter:site" content="@5gkyu">', 'meta[name="twitter:site"]');
  addMeta('<meta name="twitter:title" content="Halcyon">', 'meta[name="twitter:title"]');
  addMeta('<meta name="twitter:description" content="Where the world falls silent, we found our own halcyon days.">', 'meta[name="twitter:description"]');
  addMeta('<meta name="twitter:image" content="/icon/ogp.png">', 'meta[name="twitter:image"]');

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

    html { scroll-behavior: smooth; scroll-padding-top: 90px; scrollbar-color: var(--clr-brown) rgba(106, 86, 74, 0.12); }
    ::-webkit-scrollbar { width: 12px; }
    ::-webkit-scrollbar-track { background: rgba(106, 86, 74, 0.12); border-radius: 10px; margin: 4px 2px; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--clr-brown), #4A3B32); border-radius: 10px; border: 2.5px solid rgba(255, 255, 255, 0.9); box-shadow: 0 2px 6px rgba(74, 59, 50, 0.2); }
    ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #8C6F5E, var(--clr-brown)); border-color: #fff; }

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

    /* サイズバリエーション（ワイド・フル幅） */
    hl-layout[size="wide"],
    hl-layout[wide],
    hl-layout.is-wide {
      max-width: 1280px;
    }
    hl-layout[cols="1"][size="wide"],
    hl-layout[cols="1"][wide],
    hl-layout[cols="1"].is-wide {
      max-width: 1280px;
    }
    hl-layout[cols="2"][size="wide"],
    hl-layout[cols="2"][wide],
    hl-layout[cols="2"].is-wide {
      max-width: 1280px;
      gap: 3.5rem;
    }

    hl-layout[size="full"],
    hl-layout[full],
    hl-layout.is-full {
      max-width: min(1440px, 95vw);
    }
    hl-layout[cols="1"][size="full"],
    hl-layout[cols="1"][full],
    hl-layout[cols="1"].is-full {
      max-width: min(1440px, 95vw);
    }

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
    .sidebar-sticky {
      position: sticky;
      top: 90px;
      max-height: calc(100vh - 110px);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(154, 176, 143, 0.4) transparent;
    }
    .sidebar-sticky::-webkit-scrollbar { width: 4px; }
    .sidebar-sticky::-webkit-scrollbar-thumb { background: rgba(154, 176, 143, 0.4); border-radius: 4px; }

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
    /* ボタンコンポーネント (hl-btn) - デザイン＆バリエーション強化 */
    .hl-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.6rem;
      border-radius: 50px;
      font-family: var(--font-main);
      font-size: 0.92rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-decoration: none;
      cursor: pointer;
      border: 2px solid transparent;
      outline: none;
      transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
      box-shadow: 0 4px 14px rgba(106, 86, 74, 0.08);
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      position: relative;
      overflow: hidden;
      line-height: 1.3;
    }

    /* ホバー・アクティブ時のマイクロアニメーション */
    @media (hover: hover) {
      .hl-btn:hover {
        transform: translateY(-2.5px) scale(1.01);
        box-shadow: 0 8px 20px rgba(106, 86, 74, 0.16);
      }
    }
    .hl-btn:active {
      transform: translateY(1px) scale(0.97) !important;
      box-shadow: 0 2px 8px rgba(106, 86, 74, 0.1) !important;
    }

    /* 1. Primary (標準・主要アクション) */
    .hl-btn--primary {
      background: linear-gradient(145deg, var(--clr-sage), #809975);
      color: var(--clr-cream);
      border-color: rgba(255, 255, 255, 0.25);
      text-shadow: 0 1px 2px rgba(50, 60, 45, 0.2);
    }
    .hl-btn--primary:hover {
      background: linear-gradient(145deg, #8ba380, #738a68);
    }

    /* 2. Secondary (サブアクション・通常ボタン) */
    .hl-btn--secondary {
      background-color: rgba(255, 255, 255, 0.85);
      color: var(--clr-brown);
      border-color: rgba(106, 86, 74, 0.2);
      box-shadow: 0 2px 8px rgba(106, 86, 74, 0.05);
    }
    .hl-btn--secondary:hover {
      background-color: #fff;
      color: var(--clr-sage);
      border-color: var(--clr-sage);
    }

    /* 3. Outline (枠線スタイル) */
    .hl-btn--outline {
      background-color: transparent;
      color: var(--clr-sage);
      border-color: var(--clr-sage);
      box-shadow: none;
    }
    .hl-btn--outline:hover {
      background-color: rgba(154, 176, 143, 0.12);
    }

    /* 4. Ghost (透明背景スタイル) */
    .hl-btn--ghost {
      background-color: transparent;
      color: var(--clr-brown);
      border-color: transparent;
      box-shadow: none;
    }
    .hl-btn--ghost:hover {
      background-color: rgba(106, 86, 74, 0.08);
    }

    /* 5. Accent / Danger (強調・警告スタイル) */
    .hl-btn--accent, .hl-btn--danger {
      background: linear-gradient(145deg, var(--clr-peach), #d98e7f);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.3);
      text-shadow: 0 1px 2px rgba(80, 40, 30, 0.2);
    }
    .hl-btn--accent:hover, .hl-btn--danger:hover {
      background: linear-gradient(145deg, #e39d8e, #c77b6c);
    }

    /* 選択状態 (Selected / Active) - モード選択等の現在地をくっきり表現 */
    .hl-btn.is-selected, .hl-btn.active, .hl-btn.is-active {
      background: linear-gradient(145deg, #586e4e, #45573d) !important;
      color: #ffffff !important;
      border-color: var(--clr-sage) !important;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.25), 0 4px 12px rgba(69, 87, 61, 0.3) !important;
      transform: translateY(0);
    }
    .hl-btn.is-selected::before, .hl-btn.active::before {
      content: '✓';
      display: inline-block;
      margin-right: 0.15rem;
      font-weight: 900;
      opacity: 0.9;
    }

    /* サイズバリエーション */
    .hl-btn--sm {
      padding: 0.42rem 1.1rem;
      font-size: 0.8rem;
      border-radius: 30px;
    }
    .hl-btn--lg {
      padding: 0.95rem 2.2rem;
      font-size: 1.05rem;
      border-radius: 50px;
    }
    .hl-btn--block {
      width: 100%;
      display: flex;
    }

    /* 無効状態 (Disabled) */
    .hl-btn:disabled, .hl-btn.is-disabled {
      opacity: 0.55 !important;
      cursor: not-allowed !important;
      transform: none !important;
      box-shadow: none !important;
      pointer-events: none !important;
    }

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

    .hl-alert {
      display: flex;
      gap: 1.15rem;
      padding: 1.25rem 1.6rem;
      border-radius: 18px;
      margin: 2.2rem 0;
      color: var(--clr-brown);
      background: #ffffff;
      border: 1.5px solid rgba(106, 86, 74, 0.12);
      border-left-width: 5px;
      box-shadow: 0 4px 20px rgba(106, 86, 74, 0.05);
      align-items: flex-start;
      position: relative;
    }
    .hl-alert--info {
      border-left-color: var(--clr-dusty-blue);
      background: linear-gradient(135deg, rgba(146, 181, 188, 0.08) 0%, #ffffff 40%);
    }
    .hl-alert--warning {
      border-left-color: var(--clr-peach);
      background: linear-gradient(135deg, rgba(238, 175, 161, 0.08) 0%, #ffffff 40%);
    }
    .hl-alert--success {
      border-left-color: var(--clr-sage);
      background: linear-gradient(135deg, rgba(154, 176, 143, 0.08) 0%, #ffffff 40%);
    }
    .hl-alert__icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1px;
    }
    .hl-alert--info .hl-alert__icon {
      background: rgba(146, 181, 188, 0.22);
      color: var(--clr-dusty-blue);
    }
    .hl-alert--warning .hl-alert__icon {
      background: rgba(238, 175, 161, 0.25);
      color: #d96f5e;
    }
    .hl-alert--success .hl-alert__icon {
      background: rgba(154, 176, 143, 0.25);
      color: var(--clr-sage);
    }
    .hl-alert__icon svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    img[draggable="false"] { -webkit-user-drag: none; user-select: none; }
    .hl-alert__body {
      flex: 1;
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.85;
      color: var(--clr-brown);
      opacity: 0.95;
    }
    .hl-alert__body strong {
      color: var(--clr-brown);
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .hl-alert__body p:first-child { margin-top: 0; }
    .hl-alert__body p:last-child { margin-bottom: 0; }

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
    .hl-compare {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
      margin: 2.2rem 0;
    }
    .hl-compare__col {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.5rem 1.6rem;
      border: 1.5px solid rgba(106, 86, 74, 0.12);
      box-shadow: 0 4px 20px rgba(106, 86, 74, 0.04);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .hl-compare__col--left {
      border-top: 4px solid var(--clr-peach);
    }
    .hl-compare__col--right {
      border-top: 4px solid var(--clr-sage);
      background: linear-gradient(180deg, rgba(154, 176, 143, 0.04) 0%, #ffffff 60%);
    }
    .hl-compare__label {
      margin-bottom: 1.1rem;
    }
    .hl-compare__badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 0.35rem 0.85rem;
      border-radius: 8px;
    }
    .hl-compare__label--left .hl-compare__badge {
      background: rgba(238, 175, 161, 0.2);
      color: #b85a4a;
      border: 1px solid rgba(238, 175, 161, 0.4);
    }
    .hl-compare__label--right .hl-compare__badge {
      background: rgba(154, 176, 143, 0.2);
      color: #4e7343;
      border: 1px solid rgba(154, 176, 143, 0.4);
    }
    .hl-compare__body {
      font-size: 0.9rem;
      line-height: 1.8;
      color: var(--clr-brown);
      opacity: 0.95;
    }
    .hl-compare__body p {
      margin: 0 0 0.6rem 0;
    }
    .hl-compare__body p:last-child {
      margin-bottom: 0;
    }
    .hl-compare__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .hl-compare__list li {
      display: flex;
      align-items: flex-start;
      gap: 0.55rem;
      line-height: 1.65;
    }
    .hl-compare__col--left .hl-compare__list li::before {
      content: '•';
      color: var(--clr-peach);
      font-weight: 700;
      font-size: 1.2rem;
      line-height: 1.3;
      flex-shrink: 0;
    }
    .hl-compare__col--right .hl-compare__list li::before {
      content: '✓';
      color: var(--clr-sage);
      font-weight: 700;
      font-size: 0.95rem;
      line-height: 1.5;
      flex-shrink: 0;
    }
    @media (max-width: 640px) {
      .hl-compare {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    /* ------------------------------------------------------------
       LEAD
    ------------------------------------------------------------ */
    .hl-lead {
      font-size: 1.02rem;
      line-height: 1.95;
      color: var(--clr-brown);
      background: #ffffff;
      border: 1.5px solid rgba(106, 86, 74, 0.1);
      border-left: 5px solid var(--clr-sage);
      border-radius: 4px 18px 18px 4px;
      padding: 1.4rem 1.8rem;
      margin: 2.2rem 0;
      box-shadow: 0 4px 20px rgba(106, 86, 74, 0.04);
    }
    .hl-lead p { margin: 0; }

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
