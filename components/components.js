/**
 * =============================================================
 * Halcyon Shared Components  ―  components.js
 * =============================================================
 */

(function injectStylesAndMeta() {
  if (document.getElementById('halcyon-shared-style')) return;

  /* ============================================================
     Meta & Icons Injection
  ============================================================ */
  const addMeta = (tagHtml, selector) => {
    if (!document.querySelector(selector)) {
      document.head.insertAdjacentHTML('beforeend', tagHtml);
    }
  };

  addMeta('<link rel="apple-touch-icon" sizes="180x180" href="https://5gkyu.github.io/icon/apple-touch-icon.png">', 'link[rel="apple-touch-icon"]');
  addMeta('<link rel="icon" type="image/png" sizes="32x32" href="https://5gkyu.github.io/icon/favicon-32x32.png">', 'link[sizes="32x32"]');
  addMeta('<link rel="icon" type="image/png" sizes="16x16" href="https://5gkyu.github.io/icon/favicon-16x16.png">', 'link[sizes="16x16"]');
  addMeta('<link rel="manifest" href="https://5gkyu.github.io/icon/site.webmanifest">', 'link[rel="manifest"]');
  
  addMeta('<meta property="og:title" content="Halcyon">', 'meta[property="og:title"]');
  addMeta('<meta property="og:description" content="Where the world falls silent, we found our own halcyon days.">', 'meta[property="og:description"]');
  addMeta('<meta property="og:image" content="https://5gkyu.github.io/icon/ogp.png">', 'meta[property="og:image"]');
  addMeta('<meta property="og:url" content="https://5gkyu.github.io/">', 'meta[property="og:url"]');
  addMeta('<meta property="og:type" content="website">', 'meta[property="og:type"]');
  addMeta('<meta property="og:site_name" content="5gkyu">', 'meta[property="og:site_name"]');
  
  addMeta('<meta name="twitter:card" content="summary_large_image">', 'meta[name="twitter:card"]');
  addMeta('<meta name="twitter:site" content="@5gkyu">', 'meta[name="twitter:site"]');
  addMeta('<meta name="twitter:title" content="Halcyon">', 'meta[name="twitter:title"]');
  addMeta('<meta name="twitter:description" content="Where the world falls silent, we found our own halcyon days.">', 'meta[name="twitter:description"]');
  addMeta('<meta name="twitter:image" content="https://5gkyu.github.io/icon/ogp.png">', 'meta[name="twitter:image"]');

  const preconnect1 = document.createElement('link'); preconnect1.rel = 'preconnect'; preconnect1.href = 'https://fonts.googleapis.com'; document.head.appendChild(preconnect1);
  const preconnect2 = document.createElement('link'); preconnect2.rel = 'preconnect'; preconnect2.href = 'https://fonts.gstatic.com'; preconnect2.crossOrigin = 'anonymous'; document.head.appendChild(preconnect2);
  const fontLink = document.createElement('link'); fontLink.rel = 'stylesheet'; fontLink.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap'; document.head.appendChild(fontLink);

  /* ============================================================
     CSS Styles
  ============================================================ */
  const style = document.createElement('style');
  style.id = 'halcyon-shared-style';
  style.textContent = `
    /* ------------------------------------------------------------
       1. VARIABLES & RESET
    ------------------------------------------------------------ */
    :root {
      --clr-cream:       #FBF6EA;
      --clr-sage:        #9AB08F;
      --clr-peach:       #EEAFA1;
      --clr-dusty-blue:  #92B5BC;
      --clr-brown:       #6A564A;
      --font-main:       'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', 'Rounded Mplus 1c', sans-serif;
    }

    html { scrollbar-gutter: stable; overflow-x: clip; scroll-behavior: smooth; scroll-padding-top: 90px; }
    ::-webkit-scrollbar { width: 14px; }
    ::-webkit-scrollbar-track { background: var(--clr-cream); border-left: 1px solid rgba(106, 86, 74, 0.05); }
    ::-webkit-scrollbar-thumb { background: rgba(154, 176, 143, 0.4); border-radius: 10px; border: 4px solid var(--clr-cream); }
    ::-webkit-scrollbar-thumb:hover { background: rgba(154, 176, 143, 0.7); }

    site-header, site-footer, hl-layout, hl-toc, page-title, section-heading { display: block; width: 100%; }

    body {
      min-height: 100vh; display: flex; flex-direction: column;
      background: var(--clr-cream); color: var(--clr-brown); font-family: var(--font-main);
      margin: 0; padding: 0; line-height: 1.6; position: relative;
    }

    /* 背景グラデーションと奥の壁の影 */
    body::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle at 10% 10%, rgba(154, 176, 143, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(238, 175, 161, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(146, 181, 188, 0.08) 0%, transparent 50%); background-color: var(--clr-cream); filter: blur(40px); opacity: 0.8; pointer-events: none; z-index: -1; }
    body::after { content: ''; position: fixed; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%), linear-gradient(to top, rgba(106, 86, 74, 0.12) 0%, transparent 150px); pointer-events: none; z-index: -1; opacity: 0.5; }

    /* ------------------------------------------------------------
       2. TYPOGRAPHY & LAYOUT
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

    hl-layout { margin: 0 auto; padding: 104px 2rem 140px; position: relative; z-index: 1; flex-grow: 1; }
    hl-layout[cols="1"] { max-width: 720px; }
    hl-layout[cols="2"] { max-width: 1100px; display: grid; grid-template-columns: 1fr 280px; gap: 4rem; align-items: stretch; }
    @media (max-width: 860px) { hl-layout[cols="2"] { grid-template-columns: 1fr; gap: 3rem; } }
    .hl-layout-main { min-width: 0; }
    .hl-layout-sidebar { min-width: 0; height: 100%; }

    /* ------------------------------------------------------------
       3. SIDEBAR COMPONENTS (Profile, Categories, Toc)
    ------------------------------------------------------------ */
    .hl-sidebar-block { background: rgba(255, 255, 255, 0.75); border: 1.5px solid var(--clr-sage); border-radius: 24px 4px 24px 4px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 8px 25px rgba(106, 86, 74, 0.06); }
    .hl-sidebar-title { font-size: 0.85rem; font-weight: 700; color: var(--clr-sage); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem; }

    /* Profile */
    .hl-profile { display: flex; flex-direction: column; gap: 1rem; }
    .hl-profile__header { display: flex; align-items: center; gap: 1rem; }
    .hl-profile__icon { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(106,86,74,0.1); flex-shrink: 0; }
    .hl-profile__name-wrap { display: flex; flex-direction: column; justify-content: center; }
    .hl-profile__name { font-weight: 700; color: var(--clr-brown); font-size: 1.15rem; line-height: 1.2; }
    .hl-profile__aliases { font-size: 0.72rem; color: var(--clr-sage); font-weight: 700; letter-spacing: 0.05em; margin-top: 0.3rem; }
    .hl-profile__sns { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .hl-sns-icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #fff; color: var(--clr-brown); text-decoration: none; font-size: 0.95rem; transition: all 0.25s ease; border: 1px solid rgba(106, 86, 74, 0.1); }
    .hl-sns-icon:hover { background: var(--clr-peach); color: #fff; transform: translateY(-2px); border-color: var(--clr-peach); box-shadow: 0 4px 10px rgba(238, 175, 161, 0.3); }
    .hl-profile__bio { font-size: 0.82rem; line-height: 1.75; color: var(--clr-brown); opacity: 0.85; background: rgba(255, 255, 255, 0.5); padding: 1rem; border-radius: 4px 16px 4px 16px; }

    /* Categories */
    .hl-tags-wrapper { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    a.hl-badge { text-decoration: none; transition: all 0.2s ease; border: 1px solid transparent; display: inline-block; padding: 0.25rem 0.8rem; background: var(--clr-sage); color: var(--clr-cream); font-size: 0.7rem; font-weight: 700; border-radius: 50px; letter-spacing: 0.05em; }
    a.hl-badge:hover { background: #fff; color: var(--clr-sage); border-color: var(--clr-sage); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(154, 176, 143, 0.2); }

    /* Toc */
    hl-toc { position: sticky; top: 100px; z-index: 10; height: max-content; }
    .hl-toc__list { display: flex; flex-direction: column; gap: 0.8rem; }
    .hl-toc__link { color: var(--clr-brown); text-decoration: none; font-family: var(--font-main); font-size: 0.85rem; font-weight: 700; opacity: 0.5; transition: all 0.25s ease; border-left: 2px solid transparent; padding-left: 0.5rem; line-height: 1.4; }
    .hl-toc__link:hover { opacity: 0.8; }
    .hl-toc__link.is-active { opacity: 1; color: var(--clr-sage); border-left-color: var(--clr-sage); transform: translateX(4px); }

    /* ------------------------------------------------------------
       4. HEADER & FOOTER
    ------------------------------------------------------------ */
    /* Header */
    .site-header { position: fixed; inset: 0 0 auto 0; z-index: 200; background: #9AB08F; border-bottom: 1.5px solid rgba(106, 86, 74, 0.10); font-family: var(--font-main); }
    .site-header__inner { max-width: 1100px; margin: 0 auto; padding: 0 2rem; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .site-header__logo-area { display: flex; align-items: center; }
    .site-header__logo-link { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; user-select: none; transition: opacity 0.25s ease; }
    .site-header__logo-link:hover { opacity: 0.72; }
    .site-header__logo-icon { display: flex; align-items: center; flex-shrink: 0; }
    .site-header__logo-text { font-size: 1.2rem; font-weight: 700; color: var(--clr-cream); letter-spacing: 0.06em; }
    .site-header__site-name { font-size: 0.68rem; font-weight: 500; color: var(--clr-cream); opacity: 0.55; letter-spacing: 0.10em; margin-left: 0.55rem; padding: 0.18rem 0.55rem; border: 1px solid rgba(251,246,234,0.28); border-radius: 50px; white-space: nowrap; }
    .site-header__nav { display: flex; align-items: center; gap: 2rem; }
    .site-header__nav-link { position: relative; color: var(--clr-cream); font-family: var(--font-main); font-size: 0.9rem; font-weight: 500; text-decoration: none; padding-bottom: 3px; transition: color 0.25s ease; }
    .site-header__nav-link::after { content: ''; position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%); width: 0; height: 1.5px; background: var(--clr-peach); border-radius: 2px; transition: width 0.3s ease; }
    .site-header__nav-link:hover { color: var(--clr-peach); }
    .site-header__nav-link:hover::after { width: 100%; }
    .site-header__contact { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--clr-cream); font-family: var(--font-main); font-size: 0.82rem; font-weight: 500; letter-spacing: 0.08em; text-decoration: none; padding: 0.38rem 0.95rem; border: 1.5px solid rgba(251,246,234,0.45); border-radius: 50px; transition: background 0.25s ease, border-color 0.25s ease; }
    .site-header__contact:hover { background: rgba(251,246,234,0.14); border-color: rgba(251,246,234,0.80); }

    /* Footer Floor & Shadows */
    site-footer { margin-top: auto; }
    .site-footer { font-family: var(--font-main); line-height: 1; position: relative; margin-top: clamp(125px, 16.5vw, 210px); }
    .site-footer__body { background: #4A3B32; padding: 1.5rem 2rem 2rem; position: relative; box-shadow: inset 0 35px 0 #5B4A3F, inset 0 36px 0 rgba(255, 240, 230, 0.15), 0 -15px 30px rgba(106, 86, 74, 0.12); padding-top: calc(1.5rem + 35px); }
    
    /* ★ おち影の位置とサイズ調整 */
    .site-footer__body::before {
      content: ''; position: absolute; pointer-events: none; z-index: 0;
      /* 横幅をさらに広げ、縦幅も 12px から 18px に拡大 */
      width: clamp(120px, 40vw, 220px); 
      height: 18px;
      /* 影を濃く、ぼかしを広く調整 */
      background: radial-gradient(ellipse at center, rgba(30, 20, 15, 0.75) 0%, rgba(30, 20, 15, 0.2) 40%, transparent 80%);
      top: 18px;
      right: max(1rem, calc(49% - 560px));
    }

    /* ★ キャラクターの位置調整（基本設定はPC・タブレット向け: 38%） */
    .site-footer__chara { 
      position: absolute; bottom: 100%; width: clamp(90px, 12vw, 150px); height: auto; pointer-events: none; filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18)); display: none; cursor: default; -webkit-user-drag: none; user-select: none; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease; z-index: 1; transform-origin: bottom center; 
      right: max(1rem, calc(50% - 560px));
      transform: translateY(38%); /* 初期位置(38%) */
    }
    
    .site-footer__chara.is-loaded { display: block; pointer-events: auto; cursor: pointer; animation: hl-chara-in 1s cubic-bezier(0.25,1,0.5,1) both, hl-breathe 4s ease-in-out infinite alternate; animation-delay: 0.45s, 1.45s; }
    @media (hover: hover) { .site-footer__chara.is-loaded:hover { transform: translateY(calc(38% - 8px)) scale(1.05); filter: drop-shadow(0 0 15px rgba(238, 175, 161, 0.8)); } }
    .site-footer__chara.is-animating { animation: hl-chara-jump 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards !important; }
    
    /* PC・タブレット用アニメーション (38%) */
    @keyframes hl-chara-in { from { opacity: 0; transform: translateY(calc(38% + 16px)); } to { opacity: 1; transform: translateY(38%); } }
    @keyframes hl-chara-jump { 0% { transform: translateY(38%) scale(1); filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18)); } 50% { transform: translateY(calc(38% - 10px)) scale(1.03); filter: drop-shadow(0 0 20px rgba(238, 175, 161, 0.9)); } 100% { transform: translateY(38%) scale(1); filter: drop-shadow(0 0 10px rgba(238, 175, 161, 0.5)); } }
    @keyframes hl-breathe { 0% { transform: translateY(38%) scaleY(1); } 100% { transform: translateY(38%) scaleY(1.015); } }

    /* ★ スマホ用の調整 (48%) */
    @media (max-width: 640px) { 
      .site-footer { margin-top: clamp(85px, 24.5vw, 130px); } 
      .site-footer__chara { 
        width: clamp(60px, 18vw, 90px); 
        right: 0.5rem; 
        transform: translateY(48%); /* 初期位置(48%) */
      } 
      .site-footer__body::before {
        /* スマホ用に影も小さくし、右寄せを調整 */
        width: clamp(80px, 24vw, 120px);
        right: 0.5rem;
      }
      /* スマホ用アニメーションの上書き */
      .site-footer__chara.is-loaded { animation: hl-chara-in-sm 1s cubic-bezier(0.25,1,0.5,1) both, hl-breathe-sm 4s ease-in-out infinite alternate; animation-delay: 0.45s, 1.45s; }
      .site-footer__chara.is-animating { animation: hl-chara-jump-sm 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards !important; }
    }
    
    /* スマホ用アニメーションキーフレーム (48%) */
    @keyframes hl-chara-in-sm { from { opacity: 0; transform: translateY(calc(48% + 16px)); } to { opacity: 1; transform: translateY(48%); } }
    @keyframes hl-chara-jump-sm { 0% { transform: translateY(48%) scale(1); filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18)); } 50% { transform: translateY(calc(48% - 10px)) scale(1.03); filter: drop-shadow(0 0 20px rgba(238, 175, 161, 0.9)); } 100% { transform: translateY(48%) scale(1); filter: drop-shadow(0 0 10px rgba(238, 175, 161, 0.5)); } }
    @keyframes hl-breathe-sm { 0% { transform: translateY(48%) scaleY(1); } 100% { transform: translateY(48%) scaleY(1.015); } }
    .site-footer__grid { max-width: 1100px; margin: 0 auto; display: grid; gap: 1.5rem 2rem; grid-template-columns: 1fr 1fr 1fr 1fr; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(251,246,234,0.12); }
    @media (max-width: 860px) { .site-footer__grid { grid-template-columns: 1fr 1fr; } }
    .site-footer__col-heading { font-size: 0.72rem; font-weight: 700; color: var(--clr-cream); letter-spacing: 0.14em; opacity: 0.45; text-transform: uppercase; margin-bottom: 0.6rem; }
    .site-footer__col-link { display: block; color: var(--clr-cream); font-size: 0.82rem; letter-spacing: 0.04em; opacity: 0.72; text-decoration: none; line-height: 2; transition: opacity 0.25s ease; }
    .site-footer__col-link:hover { opacity: 1; }
    .site-footer__bottom { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; padding-top: 1.25rem; }
    .site-footer__dots { display: flex; gap: 7px; align-items: center; }
    .site-footer__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--clr-cream); opacity: 0.45; }
    .site-footer__dot:nth-child(2) { width: 7px; height: 7px; opacity: 0.65; }
    .site-footer__copy { color: var(--clr-cream); font-size: 0.75rem; letter-spacing: 0.06em; opacity: 0.55; }
    .site-footer__top-btn { display: none; }

    /* ------------------------------------------------------------
       5. GENERAL UI COMPONENTS
    ------------------------------------------------------------ */
    /* Button */
    .hl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem 1.8rem; border-radius: 50px; font-family: var(--font-main); font-size: 0.95rem; font-weight: 700; letter-spacing: 0.05em; text-decoration: none; cursor: pointer; border: 2px solid transparent; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); box-shadow: 0 4px 12px rgba(106, 86, 74, 0.06); }
    .hl-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(106, 86, 74, 0.12); }
    .hl-btn:active { transform: translateY(0); }
    .hl-btn--primary { background-color: var(--clr-sage); color: var(--clr-cream); }
    .hl-btn--primary:hover { background-color: #8da382; }
    .hl-btn--secondary { background-color: transparent; color: var(--clr-peach); border-color: var(--clr-peach); box-shadow: none; }
    .hl-btn--secondary:hover { background-color: rgba(238, 175, 161, 0.1); }
    .hl-btn--block { width: 100%; }

    /* Card */
    .hl-card { display: block; background: #fff; border-radius: 24px; border: 1.5px solid rgba(106, 86, 74, 0.08); text-decoration: none; color: inherit; overflow: hidden; transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); position: relative; height: 100%; box-shadow: 0 10px 30px -12px rgba(106, 86, 74, 0.08); }
    .hl-card:hover { transform: translateY(-8px); border-color: var(--clr-sage); box-shadow: 0 20px 40px -15px rgba(154, 176, 143, 0.25); }
    .hl-card__image-wrap { width: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: var(--clr-cream); }
    .hl-card__image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .hl-card:hover .hl-card__image-wrap img { transform: scale(1.08); }
    .hl-card__content { padding: 1.8rem; }
    .hl-card__header { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.8rem; }
    .hl-card__title { font-size: 1.15rem; font-weight: 700; color: var(--clr-brown); line-height: 1.4; margin: 0; }
    .hl-card__body { margin-bottom: 1.5rem; }
    .hl-card__footer { display: flex; align-items: center; color: var(--clr-peach); font-size: 0.85rem; font-weight: 700; }
    .hl-card__footer::after { content: '→'; margin-left: 0.5rem; transition: transform 0.3s ease; }
    .hl-card:hover .hl-card__footer::after { transform: translateX(5px); }

    /* Alert */
    .hl-alert { display: flex; gap: 1rem; padding: 1.2rem; border-radius: 8px; margin-bottom: 2rem; color: var(--clr-brown); }
    .hl-alert--info { background: rgba(146, 181, 188, 0.15); border-left: 4px solid var(--clr-dusty-blue); }
    .hl-alert--warning { background: rgba(238, 175, 161, 0.15); border-left: 4px solid var(--clr-peach); }
    .hl-alert__icon { font-size: 1.2rem; line-height: 1; }
    .hl-alert__body { margin: 0; line-height: 1.6; }

    /* Chat */
    .hl-chat-wrapper { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; font-family: var(--font-main); }
    .hl-chat-wrapper.is-right { flex-direction: row-reverse; }
    .hl-chat-icon { flex-shrink: 0; width: 52px; height: 52px; border-radius: 50%; background-color: #fff; border: 2px solid rgba(106, 86, 74, 0.08); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; color: var(--clr-brown); overflow: hidden; box-shadow: 0 4px 10px rgba(106, 86, 74, 0.05); }
    .hl-chat-icon img { width: 100%; height: 100%; object-fit: cover; }
    .hl-chat-bubble { position: relative; max-width: 75%; padding: 1.1rem 1.6rem; border-radius: 28px; color: var(--clr-brown); font-size: 0.95rem; line-height: 1.7; box-shadow: 0 8px 20px rgba(154, 176, 143, 0.1); }
    .hl-chat-wrapper.is-left .hl-chat-bubble { border-top-left-radius: 4px; }
    .hl-chat-wrapper.is-right .hl-chat-bubble { border-top-right-radius: 4px; }
    .hl-chat-wrapper[data-char="A"] .hl-chat-bubble { background: #FFFFFF; }
    .hl-chat-wrapper[data-char="B"] .hl-chat-bubble { background: #E8F0E6; }
    .hl-chat-wrapper[data-char="C"] .hl-chat-bubble { background: #FCEAE6; }
    .hl-chat-wrapper[data-char="D"] .hl-chat-bubble { background: #E6F0F2; }
    .hl-chat-wrapper[data-char="E"] .hl-chat-bubble { background: #FFFDF8; border: 1px solid rgba(106,86,74,0.05); }
    .hl-chat-wrapper[data-char="F"] .hl-chat-bubble { background: #F5EFEB; }

    /* Accordion */
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

    /* Tabs */
    .hl-tabs-nav { display: flex; gap: 1rem; border-bottom: 2px solid rgba(106, 86, 74, 0.1); margin-bottom: 1.5rem; overflow-x: auto; scrollbar-width: none; }
    .hl-tabs-nav::-webkit-scrollbar { display: none; }
    .hl-tabs-btn { background: transparent; border: none; padding: 0.8rem 0.5rem; font-family: var(--font-main); font-size: 0.95rem; font-weight: 700; color: var(--clr-brown); opacity: 0.5; cursor: pointer; position: relative; white-space: nowrap; transition: opacity 0.3s ease; }
    .hl-tabs-btn:hover { opacity: 0.8; }
    .hl-tabs-btn.is-active { opacity: 1; color: var(--clr-peach); }
    .hl-tabs-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: var(--clr-peach); transform: scaleX(0); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
    .hl-tabs-btn.is-active::after { transform: scaleX(1); }
    .hl-tab-panel { display: none; animation: hl-fade-in 0.4s ease forwards; }
    .hl-tab-panel.is-active { display: block; }

    /* Modal */
    .hl-modal-overlay { position: fixed; inset: 0; background: rgba(106, 86, 74, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; padding: 1rem; }
    .hl-modal-overlay.is-open { opacity: 1; pointer-events: auto; }
    .hl-modal-content { background: var(--clr-cream); width: 100%; max-width: 500px; border-radius: 24px; padding: 2rem; box-shadow: 0 20px 40px rgba(106, 86, 74, 0.15); transform: translateY(20px) scale(0.95); transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); position: relative; max-height: 90vh; overflow-y: auto; }
    .hl-modal-overlay.is-open .hl-modal-content { transform: translateY(0) scale(1); }
    .hl-modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(106, 86, 74, 0.05); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--clr-brown); transition: background 0.2s ease; }
    .hl-modal-close:hover { background: rgba(238, 175, 161, 0.2); color: var(--clr-peach); }
    .hl-modal-title { font-size: 1.2rem; font-weight: 700; color: var(--clr-brown); margin-bottom: 1rem; padding-right: 2rem; }

    /* Toast */
    .hl-toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 2000; display: flex; flex-direction: column; align-items: flex-end; gap: 0.8rem; pointer-events: none; }
    .hl-toast { background: #fff; color: var(--clr-brown); padding: 1rem 1.5rem; border-radius: 12px; font-family: var(--font-main); font-size: 0.9rem; font-weight: 700; box-shadow: 0 8px 25px rgba(106, 86, 74, 0.12); border-left: 4px solid var(--clr-sage); pointer-events: auto; transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease; }
    .hl-toast.is-show { transform: translateX(0); }
    .hl-toast.is-hide { opacity: 0; transform: translateY(-10px); }
    .hl-toast--warning { border-left-color: var(--clr-peach); }

    /* ------------------------------------------------------------
       6. TECHNICAL COMPONENTS (Code & Step)
    ------------------------------------------------------------ */
    /* Code */
    .hl-code-wrapper { background: #382F2A; border-radius: 12px; margin-bottom: 2rem; overflow: hidden; box-shadow: 0 8px 20px rgba(106, 86, 74, 0.15); }
    .hl-code-header { display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 0.6rem 1rem; }
    .hl-code-lang { font-size: 0.75rem; font-weight: 700; color: var(--clr-sage); letter-spacing: 0.05em; text-transform: uppercase; }
    .hl-code-copy { background: transparent; border: 1px solid rgba(154, 176, 143, 0.4); color: var(--clr-cream); border-radius: 4px; font-size: 0.75rem; padding: 0.3rem 0.8rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.4rem; }
    .hl-code-copy:hover { background: rgba(154, 176, 143, 0.2); border-color: var(--clr-sage); }
    .hl-code-pre { margin: 0; padding: 1.2rem; overflow-x: auto; }
    .hl-code-content { font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; line-height: 1.6; color: var(--clr-cream); white-space: pre; }

    /* Step */
    .hl-step-container { margin-bottom: 2rem; display: flex; flex-direction: column; }
    .hl-step-item { display: flex; gap: 1.2rem; position: relative; }
    .hl-step-item::before { content: ''; position: absolute; left: 13px; top: 32px; bottom: -4px; width: 2px; background: rgba(154, 176, 143, 0.3); }
    .hl-step-item:last-child::before { display: none; }
    .hl-step-marker { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--clr-sage); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; margin-top: 4px; position: relative; z-index: 1; box-shadow: 0 0 0 4px var(--clr-cream), inset 0 0 0 2px rgba(255,255,255,0.2); }
    .hl-step-body { flex-grow: 1; padding-bottom: 2rem; }
    .hl-step-title { font-weight: 700; color: var(--clr-brown); font-size: 1.1rem; margin-bottom: 0.5rem; margin-top: 5px; }

    /* ------------------------------------------------------------
       7. ANIMATIONS
    ------------------------------------------------------------ */
    .fluffy-entry { opacity: 0; animation: hl-float-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
    .fluffy-entry-down { opacity: 0; animation: hl-float-down 0.8s cubic-bezier(0.25, 1, 0.5, 1) both; }
    @keyframes hl-float-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes hl-float-down { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes hl-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    
    /* ★ アニメーション内の translateY(38%) も変更に合わせる */
    @keyframes hl-chara-in { from { opacity: 0; transform: translateY(calc(38% + 16px)); } to { opacity: 1; transform: translateY(38%); } }
    @keyframes hl-chara-jump { 0% { transform: translateY(38%) scale(1); filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18)); } 50% { transform: translateY(calc(38% - 10px)) scale(1.03); filter: drop-shadow(0 0 20px rgba(238, 175, 161, 0.9)); } 100% { transform: translateY(38%) scale(1); filter: drop-shadow(0 0 10px rgba(238, 175, 161, 0.5)); } }
    @keyframes hl-breathe { 0% { transform: translateY(38%) scaleY(1); } 100% { transform: translateY(38%) scaleY(1.015); } }
    
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.35s; }
    .delay-3 { animation-delay: 0.55s; }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   HEADER & FOOTER (JS)
============================================================ */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const siteName = this.getAttribute('site-name') || '';
    const contactHref = this.getAttribute('contact-href') || 'contact.html';
    let navItems = [];
    try { navItems = JSON.parse(this.getAttribute('nav-items') || '[]'); } catch (_) {}
    const siteLabel = siteName ? `<span class="site-header__site-name" aria-hidden="true">${siteName}</span>` : '';
    
    this.innerHTML = `
      <header class="site-header fluffy-entry-down delay-1" role="banner" style="position: fixed;">
        <div class="site-header__inner">
          <div class="site-header__logo-area">
            <a href="https://5gkyu.github.io/KyuLink/?tag=Home" class="site-header__logo-link">
              <span class="site-header__logo-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="13" stroke="#FBF6EA" stroke-width="1.5" stroke-opacity="0.5"/>
                  <path d="M14 5 L14 5 C14 5 8 10.5 8 15.5 A6 6 0 0 0 20 15.5 C20 10.5 14 5 14 5Z" fill="#FBF6EA" opacity="0.85"/>
                  <circle cx="14" cy="9.5" r="1.2" fill="#EEAFA1" opacity="0.9"/>
                </svg>
              </span>
              <span class="site-header__logo-text">5Gkyu</span>
            </a>
            ${siteLabel}
          </div>
          <nav class="site-header__nav" aria-label="グローバルナビゲーション">
            ${navItems.map(item => `<a href="${item.href}" class="site-header__nav-link">${item.label}</a>`).join('')}
            <a href="${contactHref}" class="site-header__contact">お問い合わせ</a>
          </nav>
        </div>
        <div id="hl-scroll-vine" style="position: absolute; bottom: -2px; left: 0; height: 3px; background: var(--clr-peach); width: 0%; border-radius: 0 3px 3px 0; transition: width 0.1s ease-out; z-index: 201;"></div>
      </header>
    `;

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const vine = this.querySelector('#hl-scroll-vine');
      if (vine) vine.style.width = scrolled + '%';
    });
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
        <img class="site-footer__chara" src="https://5gkyu.github.io/components/Fuka_footer.png" alt="いちのせ ふうか" role="button" tabindex="0" title="いちのせ ふうか" draggable="false" oncontextmenu="return false;" id="fuka-chara" onerror="this.style.display='none'">
        <div class="site-footer__body">
          <div class="site-footer__grid">
            <div><p class="site-footer__col-heading">ポリシー</p><a href="policy.html" class="site-footer__col-link">サイトポリシー</a></div>
            <div><p class="site-footer__col-heading">SNS</p><a href="https://x.com/5gkyu" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">🐦‍⬛ @5gkyu</a></div>
            <div><p class="site-footer__col-heading">サイト</p><a href="https://5gkyu.github.io/KyuLink/?tag=Home" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">KyuLink</a><a href="contact.html" class="site-footer__col-link">お問い合わせ</a></div>
            <div><p class="site-footer__col-heading">クレジット</p><p class="site-footer__col-link" style="cursor:default;opacity:0.45;">Design &amp; Illust</p><p class="site-footer__col-link" style="cursor:default;margin-bottom:0.8rem;">${copyText}</p><p class="site-footer__col-link" style="cursor:default;opacity:0.45;">Icons</p><a href="https://phosphoricons.com/" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">Phosphor Icons</a></div>
          </div>
          <div class="site-footer__bottom">
            <button class="site-footer__top-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="ページ最上部へ戻る">&#x2191; トップへ戻る</button>
            <div class="site-footer__dots" aria-hidden="true"><span class="site-footer__dot"></span><span class="site-footer__dot"></span><span class="site-footer__dot"></span></div>
            <p class="site-footer__copy">© ${year} ${copyText}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    `;
    const chara = this.querySelector('#fuka-chara');
    if (chara) {
      if (chara.complete) { chara.classList.add('is-loaded'); } else { chara.addEventListener('load', () => chara.classList.add('is-loaded')); }
      const handleAction = (e) => { e.preventDefault(); if (chara.classList.contains('is-animating')) return; chara.classList.add('is-animating'); setTimeout(() => { window.location.href = 'https://5gkyu.github.io/'; }, 400); };
      chara.addEventListener('click', handleAction);
      chara.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleAction(e); });
    }
  }
}
customElements.define('site-footer', SiteFooter);


/* ============================================================
   LAYOUT & SIDEBAR (JS)
============================================================ */
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

class HlLayout extends HTMLElement {}
customElements.define('hl-layout', HlLayout);

class HlProfile extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this.innerHTML = `
      <div class="hl-sidebar-block" style="padding: 1.2rem;">
        <div class="hl-profile">
          <div class="hl-profile__header">
            <img src="https://5gkyu.github.io/icon/ogp.png" alt="きゅー" class="hl-profile__icon" onerror="this.src='https://5gkyu.github.io/components/Fuka_footer.png'">
            <div class="hl-profile__name-wrap">
              <div class="hl-profile__name">きゅー</div>
              <div class="hl-profile__aliases">Kyu / 5Gkyu / QueenKyu</div>
              <div class="hl-profile__sns">
                <a href="https://x.com/5gkyu" target="_blank" class="hl-sns-icon" aria-label="X (Twitter)" title="X">𝕏</a>
                <a href="#" target="_blank" class="hl-sns-icon" aria-label="note" title="note">📝</a>
                <a href="https://github.com/5gkyu" target="_blank" class="hl-sns-icon" aria-label="GitHub" title="GitHub">🐙</a>
              </div>
            </div>
          </div>
          <div class="hl-profile__bio">Webツール開発やロジックパズル制作をしています。<br><br>Halcyonのような柔らかく有機的なUIデザインが好きです。</div>
        </div>
      </div>
    `;
  }
}
customElements.define('hl-profile', HlProfile);

class HlCategories extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this.innerHTML = `
      <hl-sidebar-box title="作ったもの" icon="🎨">
        <div class="hl-tags-wrapper">
          <a href="#" class="hl-badge">Webツール</a><a href="#" class="hl-badge">ロジックパズル</a><a href="#" class="hl-badge">デザイン</a><a href="#" class="hl-badge">ゲーム</a>
        </div>
      </hl-sidebar-box>
    `;
  }
}
customElements.define('hl-categories', HlCategories);

class HlSidebarBox extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title');
    const icon = this.getAttribute('icon') || '📌';
    const titleHtml = title ? `<div class="hl-sidebar-title"><span>${icon}</span>${title}</div>` : '';
    this.innerHTML = `<div class="hl-sidebar-block">${titleHtml}${this.innerHTML}</div>`;
  }
}
customElements.define('hl-sidebar-box', HlSidebarBox);

class HlToc extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    setTimeout(() => {
      const headings = document.querySelectorAll('section-heading h2');
      if (headings.length === 0) return;
      let linksHtml = '';
      headings.forEach((h2, index) => {
        if (!h2.id) h2.id = `hl-heading-${index}`;
        linksHtml += `<a href="#${h2.id}" class="hl-toc__link">${h2.textContent}</a>`;
      });
      this.innerHTML = `<div class="hl-sidebar-block" style="margin-bottom:0;"><div class="hl-sidebar-title"><span>📖</span>Contents</div><div class="hl-toc__list">${linksHtml}</div></div>`;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.querySelectorAll('.hl-toc__link').forEach(link => link.classList.remove('is-active'));
            const activeLink = this.querySelector(`.hl-toc__link[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('is-active');
          }
        });
      }, { rootMargin: '-120px 0px -60% 0px' });
      headings.forEach(h2 => observer.observe(h2));
    }, 50);
  }
}
customElements.define('hl-toc', HlToc);


/* ============================================================
   UI & TECHNICAL COMPONENTS (JS)
============================================================ */
class HlCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title') || '';
    const tag = this.getAttribute('tag') || '';
    const image = this.getAttribute('image') || '';
    const href = this.getAttribute('href') || '#';
    const imageHtml = image ? `<div class="hl-card__image-wrap"><img src="${image}" alt=""></div>` : '';
    const tagHtml = tag ? `<span class="hl-badge">${tag}</span>` : '';
    this.innerHTML = `<a href="${href}" class="hl-card">${imageHtml}<div class="hl-card__content"><div class="hl-card__header">${tagHtml}<h3 class="hl-card__title">${title}</h3></div><div class="hl-card__body hl-content-text">${this.innerHTML}</div><div class="hl-card__footer"><span>Learn More</span></div></div></a>`;
  }
}
customElements.define('hl-card', HlCard);

class HlAlert extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const type = this.getAttribute('type') || 'info';
    const icon = type === 'warning' ? '⚠️' : '💡';
    this.innerHTML = `<div class="hl-alert hl-alert--${type}"><span class="hl-alert__icon">${icon}</span><div class="hl-content-text hl-alert__body">${this.innerHTML}</div></div>`;
  }
}
customElements.define('hl-alert', HlAlert);

class HlChat extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const char = this.getAttribute('char') || 'A';
    const align = this.getAttribute('align') || 'left';
    const imgSrc = `https://5gkyu.github.io/icon/${char}.png`;
    this.innerHTML = `<div class="hl-chat-wrapper is-${align}" data-char="${char}"><div class="hl-chat-icon"><img src="${imgSrc}" alt="Character ${char}" onerror="this.style.display='none'; this.parentNode.innerText='${char}'"></div><div class="hl-chat-bubble">${this.innerHTML}</div></div>`;
  }
}
customElements.define('hl-chat', HlChat);

class HlButton extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const href = this.getAttribute('href');
    const variant = this.getAttribute('variant') || 'primary';
    const isBlock = this.hasAttribute('block');
    const icon = this.getAttribute('icon') || '';
    const target = this.getAttribute('target') || '';
    const baseClass = `hl-btn hl-btn--${variant} ${isBlock ? 'hl-btn--block' : ''}`;
    const iconHtml = icon ? `<span aria-hidden="true">${icon}</span>` : '';
    const targetAttr = target ? `target="${target}" rel="noopener noreferrer"` : '';
    if (href) {
      this.innerHTML = `<a href="${href}" class="${baseClass}" ${targetAttr}>${iconHtml}${this.innerHTML}</a>`;
    } else {
      this.innerHTML = `<button class="${baseClass}">${iconHtml}${this.innerHTML}</button>`;
    }
  }
}
customElements.define('hl-button', HlButton);

class HlAccordion extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title') || '詳細を見る';
    this.innerHTML = `<div class="hl-accordion"><button class="hl-accordion__header"><span>${title}</span><span class="hl-accordion__icon">▼</span></button><div class="hl-accordion__content-wrapper"><div class="hl-accordion__content"><div class="hl-accordion__content-inner hl-content-text">${this.innerHTML}</div></div></div></div>`;
    const btn = this.querySelector('.hl-accordion__header');
    const container = this.querySelector('.hl-accordion');
    btn.addEventListener('click', () => container.classList.toggle('is-open'));
  }
}
customElements.define('hl-accordion', HlAccordion);

class HlTabs extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    setTimeout(() => {
      const panels = Array.from(this.querySelectorAll('.hl-tab-panel'));
      const navHtml = panels.map((panel, index) => {
        const label = panel.getAttribute('data-label') || `タブ ${index + 1}`;
        return `<button class="hl-tabs-btn ${index === 0 ? 'is-active' : ''}" data-index="${index}">${label}</button>`;
      }).join('');
      const navContainer = document.createElement('div');
      navContainer.className = 'hl-tabs-nav';
      navContainer.innerHTML = navHtml;
      this.insertBefore(navContainer, this.firstChild);
      const btns = this.querySelectorAll('.hl-tabs-btn');
      if(panels[0]) panels[0].classList.add('is-active');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-index'), 10);
          btns.forEach(b => b.classList.remove('is-active'));
          panels.forEach(p => p.classList.remove('is-active'));
          e.target.classList.add('is-active');
          if(panels[index]) panels[index].classList.add('is-active');
        });
      });
    }, 10);
  }
}
customElements.define('hl-tabs', HlTabs);

class HlModal extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title') || '';
    const overlay = document.createElement('div');
    overlay.className = 'hl-modal-overlay';
    overlay.innerHTML = `<div class="hl-modal-content"><button class="hl-modal-close" aria-label="閉じる">✕</button>${title ? `<h3 class="hl-modal-title">${title}</h3>` : ''}<div class="hl-content-text">${this.innerHTML}</div></div>`;
    document.body.appendChild(overlay);
    this.innerHTML = '';
    this._overlay = overlay;
    const closeBtn = overlay.querySelector('.hl-modal-close');
    closeBtn.addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => { if(e.target === overlay) this.close(); });
  }
  open() { this._overlay.classList.add('is-open'); }
  close() { this._overlay.classList.remove('is-open'); }
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
    toast.innerHTML = message;
    this.container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-show')));
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
    this.innerHTML = `<div class="hl-code-wrapper"><div class="hl-code-header"><span class="hl-code-lang">${lang}</span><button class="hl-code-copy">📋 Copy</button></div><pre class="hl-code-pre"><code class="hl-code-content">${codeText}</code></pre></div>`;
    const copyBtn = this.querySelector('.hl-code-copy');
    copyBtn.addEventListener('click', () => {
      const textToCopy = this.querySelector('.hl-code-content').textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (window.HlToast) HlToast.show('✅ コードをコピーしました！');
        copyBtn.textContent = '✔️ Copied!';
        setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
      });
    });
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
    this.innerHTML = `<div class="hl-step-item"><div class="hl-step-marker">${num}</div><div class="hl-step-body">${titleHtml}<div class="hl-content-text">${content}</div></div></div>`;
  }
}
customElements.define('hl-step-item', HlStepItem);