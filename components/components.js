/**
 * =============================================================
 * Halcyon Shared Components & Loading Screen
 * =============================================================
 */

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

  // Google Fonts
  const preconnect1 = document.createElement('link'); preconnect1.rel = 'preconnect'; preconnect1.href = 'https://fonts.googleapis.com'; document.head.appendChild(preconnect1);
  const preconnect2 = document.createElement('link'); preconnect2.rel = 'preconnect'; preconnect2.href = 'https://fonts.gstatic.com'; preconnect2.crossOrigin = 'anonymous'; document.head.appendChild(preconnect2);
  const fontLink = document.createElement('link'); fontLink.rel = 'stylesheet'; fontLink.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap'; document.head.appendChild(fontLink);

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
      transition: opacity 500ms ease-in-out; /* ページ遷移用 */
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
    @media (max-width: 860px) { hl-layout[cols="2"] { grid-template-columns: 1fr; gap: 3rem; } }
    .hl-layout-main { min-width: 0; }
    .hl-layout-sidebar { min-width: 0; height: 100%; }

    /* ------------------------------------------------------------
       SIDEBAR COMPONENTS
    ------------------------------------------------------------ */
    .hl-sidebar-block { background: rgba(255, 255, 255, 0.75); border: 1.5px solid var(--clr-sage); border-radius: 24px 4px 24px 4px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 8px 25px rgba(106, 86, 74, 0.06); }
    .hl-sidebar-title { font-size: 0.85rem; font-weight: 700; color: var(--clr-sage); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem; }

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

    .hl-tags-wrapper { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    a.hl-badge { text-decoration: none; transition: all 0.2s ease; border: 1px solid transparent; display: inline-block; padding: 0.25rem 0.8rem; background: var(--clr-sage); color: var(--clr-cream); font-size: 0.7rem; font-weight: 700; border-radius: 50px; letter-spacing: 0.05em; }
    a.hl-badge:hover { background: #fff; color: var(--clr-sage); border-color: var(--clr-sage); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(154, 176, 143, 0.2); }

    hl-toc { position: sticky; top: 100px; z-index: 10; height: max-content; }
    .hl-toc__list { display: flex; flex-direction: column; gap: 0.8rem; }
    .hl-toc__link { color: var(--clr-brown); text-decoration: none; font-family: var(--font-main); font-size: 0.85rem; font-weight: 700; opacity: 0.5; transition: all 0.25s ease; border-left: 2px solid transparent; padding-left: 0.5rem; line-height: 1.4; }
    .hl-toc__link:hover { opacity: 0.8; }
    .hl-toc__link.is-active { opacity: 1; color: var(--clr-sage); border-left-color: var(--clr-sage); transform: translateX(4px); }

    /* ------------------------------------------------------------
       HEADER & FOOTER
    ------------------------------------------------------------ */
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

    .hl-alert { display: flex; gap: 1rem; padding: 1.2rem; border-radius: 8px; margin-bottom: 2rem; color: var(--clr-brown); }
    .hl-alert--info { background: rgba(146, 181, 188, 0.15); border-left: 4px solid var(--clr-dusty-blue); }
    .hl-alert--warning { background: rgba(238, 175, 161, 0.15); border-left: 4px solid var(--clr-peach); }
    .hl-alert__icon { font-size: 1.2rem; line-height: 1; }
    .hl-alert__body { margin: 0; line-height: 1.6; }

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
    .hl-tabs-btn { background: transparent; border: none; padding: 0.8rem 0.5rem; font-family: var(--font-main); font-size: 0.95rem; font-weight: 700; color: var(--clr-brown); opacity: 0.5; cursor: pointer; position: relative; white-space: nowrap; transition: opacity 0.3s ease; }
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

    .hl-toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 2000; display: flex; flex-direction: column; align-items: flex-end; gap: 0.8rem; pointer-events: none; }
    .hl-toast { background: #fff; color: var(--clr-brown); padding: 1rem 1.5rem; border-radius: 12px; font-family: var(--font-main); font-size: 0.9rem; font-weight: 700; box-shadow: 0 8px 25px rgba(106, 86, 74, 0.12); border-left: 4px solid var(--clr-sage); pointer-events: auto; transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease; }
    .hl-toast.is-show { transform: translateX(0); }
    .hl-toast.is-hide { opacity: 0; transform: translateY(-10px); }
    .hl-toast--warning { border-left-color: var(--clr-peach); }

    .hl-code-wrapper { background: #382F2A; border-radius: 12px; margin-bottom: 2rem; overflow: hidden; box-shadow: 0 8px 20px rgba(106, 86, 74, 0.15); }
    .hl-code-header { display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 0.6rem 1rem; }
    .hl-code-lang { font-size: 0.75rem; font-weight: 700; color: var(--clr-sage); letter-spacing: 0.05em; text-transform: uppercase; }
    .hl-code-copy { background: transparent; border: 1px solid rgba(154, 176, 143, 0.4); color: var(--clr-cream); border-radius: 4px; font-size: 0.75rem; padding: 0.3rem 0.8rem; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.4rem; }
    .hl-code-copy:hover { background: rgba(154, 176, 143, 0.2); border-color: var(--clr-sage); }
    .hl-code-pre { margin: 0; padding: 1.2rem; overflow-x: auto; }
    .hl-code-content { font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; line-height: 1.6; color: var(--clr-cream); white-space: pre; }

    .hl-step-container { margin-bottom: 2rem; display: flex; flex-direction: column; }
    .hl-step-item { display: flex; gap: 1.2rem; position: relative; }
    .hl-step-item::before { content: ''; position: absolute; left: 13px; top: 32px; bottom: -4px; width: 2px; background: rgba(154, 176, 143, 0.3); }
    .hl-step-item:last-child::before { display: none; }
    .hl-step-marker { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--clr-sage); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; margin-top: 4px; position: relative; z-index: 1; box-shadow: 0 0 0 4px var(--clr-cream), inset 0 0 0 2px rgba(255,255,255,0.2); }
    .hl-step-body { flex-grow: 1; padding-bottom: 2rem; }
    .hl-step-title { font-weight: 700; color: var(--clr-brown); font-size: 1.1rem; margin-bottom: 0.5rem; margin-top: 5px; }

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
       LOADING SCREEN STYLES
    ------------------------------------------------------------ */
    .hl-overlay { position: fixed; inset: 0; z-index: 9999; background: #FBF6EA; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.4rem; font-family: 'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif; opacity: 1; pointer-events: all; overflow: hidden; }
    .hl-overlay::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 18% 28%, rgba(255,250,230,0.55) 1px, transparent 2px), radial-gradient(circle at 73% 14%, rgba(255,255,255,0.65) 1.5px, transparent 2px), radial-gradient(circle at 44% 74%, rgba(240,255,250,0.45) 1px, transparent 2px), radial-gradient(circle at 83% 68%, rgba(255,250,220,0.55) 2px, transparent 3px); background-size: 200px 200px; opacity: 0.35; pointer-events: none; }
    .hl-overlay::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.5) 0%, transparent 65%); animation: hl-breathe 4.5s ease-in-out infinite; pointer-events: none; }
    .hl-overlay.is-out { opacity: 0; pointer-events: none; transition: opacity 480ms ease; }

    .css-bird { position: relative; width: 100%; height: 100%; filter: drop-shadow(0 6px 16px rgba(154,176,143,0.35)); }
    .bird-container { position: absolute; width: 120px; height: 120px; bottom: 0px; left: 10px; }
    .bird-body { position: absolute; bottom: 0; left: 0; width: 120px; height: 100px; background: #fdfaf3; background-image: radial-gradient(circle at 35% 30%, #ffffff 0%, #fdfaf3 50%, #f3eedc 100%); border: 4px solid #5a3f29; border-radius: 50% 50% 45% 50% / 60% 60% 40% 40%; z-index: 2; box-sizing: border-box; }
    .bird-leaf { position: absolute; background: #a4bc8e; border: 3.5px solid #5a3f29; z-index: 1; box-sizing: border-box; }
    .leaf1 { width: 28px; height: 18px; top: 25px; right: -8px; border-radius: 50%; transform: rotate(15deg); }
    .leaf2 { width: 22px; height: 16px; top: 8px; right: 12px; border-radius: 50%; transform: rotate(-45deg); }
    .bird-eye { position: absolute; width: 9px; height: 9px; background: #4a3320; border-radius: 50%; }
    .eye-left { top: 40px; left: 35px; } .eye-right { top: 46px; left: 75px; }
    .bird-beak { position: absolute; top: 47px; left: 50px; width: 18px; height: 10px; background: #f29a68; border: 3.5px solid #5a3f29; border-radius: 50%; transform: rotate(10deg); box-sizing: border-box; }
    .bird-blush { position: absolute; width: 18px; height: 14px; background: #ffc2af; border-radius: 50%; opacity: 0.7; }
    .blush-left { top: 48px; left: 16px; transform: rotate(-10deg); } .blush-right { top: 54px; left: 88px; transform: rotate(10deg); }

    .hl-char-outer { position: relative; z-index: 1; will-change: transform; }
    .hl-char-inner { position: relative; width: 140px; height: 180px; }
    
    .hl-overlay[data-stage="0"] .hl-char-inner { animation: hl-nod 0.55s ease; }
    .hl-overlay[data-stage="1"] .hl-char-inner, .hl-overlay[data-stage="2"] .hl-char-inner { animation: hl-walk 0.65s ease-in-out infinite; }
    .hl-overlay[data-stage="3"] .hl-char-inner { animation: hl-tiptoe 1s ease-in-out infinite; }
    .hl-overlay[data-stage="4"] .hl-char-inner { animation: hl-wave 1.4s ease forwards; }

    @keyframes hl-nod { 0%, 100% { transform: rotate(0deg) scale(1); } 45% { transform: rotate(-6deg) scale(0.97); } }
    @keyframes hl-walk { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    @keyframes hl-tiptoe { 0%, 100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(-11px) scaleY(1.04); } }
    @keyframes hl-wave { 0% { transform: rotate(0deg); opacity: 1; } 15% { transform: rotate(-14deg); } 30% { transform: rotate(9deg); } 50% { transform: rotate(-10deg); } 70% { transform: rotate(6deg) translateX(12px); } 100% { transform: rotate(0deg) translateX(24px) scale(0.75); opacity: 0; } }

    .hl-road-wrap { position: absolute; bottom: 60px; left: 0; right: 0; height: 88px; pointer-events: none; z-index: 0; }
    .hl-road-svg { width: 100%; height: 100%; overflow: visible; }
    .hl-road-bg { fill: none; stroke: rgba(154,176,143,0.20); stroke-width: 2.5; stroke-dasharray: 7 5; stroke-linecap: round; }
    .hl-road-fg { fill: none; stroke: #9AB08F; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; transition: stroke-dashoffset 0.1s linear; }
    .hl-road-milestone { opacity: 0; transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1); transform-origin: center; transform: scale(0); }
    .hl-road-milestone.is-reached { opacity: 1; transform: scale(1); }

    .hl-message { position: relative; z-index: 1; font-size: 0.87rem; color: #6A564A; opacity: 0.72; letter-spacing: 0.09em; min-height: 1.4em; text-align: center; transition: opacity 0.3s ease; }
    .hl-message.is-fade { opacity: 0; }
    .hl-bar-wrap { position: relative; z-index: 1; width: min(340px, 80vw); }
    .hl-bar-pct { position: absolute; right: 0; top: -1.55em; font-size: 0.76rem; font-weight: 500; color: #9AB08F; letter-spacing: 0.05em; min-width: 3em; text-align: right; }
    .hl-bar-track { height: 5px; background: rgba(154,176,143,0.16); border-radius: 10px; overflow: hidden; }
    .hl-bar-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #9AB08F 0%, #EEAFA1 100%); border-radius: 10px; transition: width 0.1s linear; }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   2. カスタムコンポーネント定義 (JS)
============================================================ */
/* ============================================================
   HEADER & FOOTER (JS)
============================================================ */
/* ============================================================
   HEADER (JS) - モーダル仕様
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
        .site-header__dropdown-link { display: block; padding: 0.6rem 1.5rem; color: var(--clr-brown); font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: background 0.2s ease, color 0.2s ease; }
        .site-header__dropdown-link:hover { background: rgba(154, 176, 143, 0.15); color: var(--clr-sage); }

        @media (min-width: 861px) {
          .site-header__dropdown:hover .site-header__dropdown-menu,
          .site-header__dropdown:focus-within .site-header__dropdown-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); pointer-events: auto; }
          .site-header__menu-btn { display: none; }
        }

        /* --- スマホ向け ハンバーガー（モーダル仕様） --- */
        @media (max-width: 860px) {
          .site-header__menu-btn { 
            display: flex; justify-content: center; align-items: center; width: 44px; height: 44px; 
            border: none; background: transparent; cursor: pointer; padding: 0; position: relative; 
            z-index: 250; /* ★ モーダルよりも手前に配置して「✕」を押せるようにする */
          }
          
          .site-header__menu-btn span { position: absolute; width: 26px; height: 14px; background: var(--clr-cream); border-radius: 14px 0 14px 0; transform: rotate(-20deg); transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); box-shadow: 0 2px 4px rgba(106, 86, 74, 0.15); transform-origin: center; }
          .site-header__menu-btn span::after { content: ''; position: absolute; top: 50%; left: 10%; width: 80%; height: 1.5px; background: rgba(154, 176, 143, 0.4); border-radius: 1px; transform: translateY(-50%); transition: opacity 0.2s ease; }

          .site-header__menu-btn.is-open span { height: 4px; border-radius: 2px; box-shadow: none; background: #6A564A; /* ✕の時は背景色に合わせて茶色に */ }
          .site-header__menu-btn.is-open span::after { opacity: 0; }
          .site-header__menu-btn.is-open span:nth-child(1) { width: 30px; transform: rotate(45deg); }
          .site-header__menu-btn.is-open span:nth-child(2) { width: 30px; transform: rotate(-45deg); }

          /* ★ モーダル（全画面オーバーレイ）の設定 */
          .site-header__nav { 
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
            background: rgba(251, 246, 234, 0.95); /* クリーム色の半透明 */
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            opacity: 0; visibility: hidden; transition: all 0.4s ease; z-index: 200; 
            clip-path: none; border: none; box-shadow: none;
          }
          .site-header__nav.is-open { opacity: 1; visibility: visible; }

          .site-header__nav-list { flex-direction: column; gap: 2.5rem; padding: 0; width: 100%; }
          .site-header__nav-list > li { width: 100%; text-align: center; }
          .site-header__nav-link, .site-header__contact { 
            display: inline-block; padding: 0.5rem; width: auto; font-size: 1.4rem; color: #6A564A; font-weight: bold; background: transparent; border: none;
          }
          .site-header__nav-link::after { display: none; }

          .site-header__dropdown-menu { position: static; transform: none; opacity: 1; visibility: visible; pointer-events: auto; background: transparent; box-shadow: none; border: none; padding: 1rem 0 0 0; display: none; flex-direction: column; z-index: auto; }
          .site-header__dropdown.is-expanded .site-header__dropdown-menu { display: flex; gap: 1rem; }
          .site-header__dropdown-link { padding: 0.5rem; color: #9AB08F; font-size: 1.1rem; }
        }
      </style>

      <header class="site-header fluffy-entry-down delay-1" role="banner" style="position: fixed;">
        <div class="site-header__inner">
          <div class="site-header__logo-area">
            <a href="https://5gkyu.github.io/" class="site-header__logo-link">
              <span class="site-header__logo-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="13" stroke="#FBF6EA" stroke-width="1.5" stroke-opacity="0.5"/><path d="M14 5 L14 5 C14 5 8 10.5 8 15.5 A6 6 0 0 0 20 15.5 C20 10.5 14 5 14 5Z" fill="#FBF6EA" opacity="0.85"/><circle cx="14" cy="9.5" r="1.2" fill="#EEAFA1" opacity="0.9"/></svg>
              </span>
              <span class="site-header__logo-text">5Gkyu</span>
            </a>
            ${siteLabel}
          </div>
          
          <button class="site-header__menu-btn" aria-label="メニューを開く">
            <span></span><span></span>
          </button>
          
          <nav class="site-header__nav" aria-label="グローバルナビゲーション">
            <ul class="site-header__nav-list">
              <li class="site-header__dropdown" tabindex="0">
                <span class="site-header__nav-link" style="cursor: pointer;">Archive ▾</span>
                <div class="site-header__dropdown-menu">
                  <a href="https://5gkyu.github.io/archive/tools/" class="site-header__dropdown-link">Tools</a>
                  <a href="https://5gkyu.github.io/archive/puzzle/" class="site-header__dropdown-link">Puzzle</a>
                  <a href="https://5gkyu.github.io/archive/notes/" class="site-header__dropdown-link">Notes</a>
                  <a href="https://5gkyu.github.io/archive/other/" class="site-header__dropdown-link">Other</a>
                </div>
              </li>
              <li><a href="https://5gkyu.github.io/about/" class="site-header__nav-link">About</a></li>
              <li><a href="https://5gkyu.github.io/contact/" class="site-header__contact">Contact</a></li>
            </ul>
          </nav>
        </div>
        
        <div style="position: absolute; bottom: -2px; left: 0; width: calc(100% - 15px); height: 3px; z-index: 150; pointer-events: none;">
          <img src="https://5gkyu.github.io/icon/Fuka_header.png" alt="" 
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
            <img src="https://5gkyu.github.io/icon/Pino_header.png" id="hl-header-bird" alt="" 
              style="
                position: absolute; 
                left: max(20px, 100%);
                margin-left: -10px; 
                transform: scaleX(-1); 
                bottom: -2px; 
                width: 20px; 
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
    const dropdown = this.querySelector('.site-header__dropdown');

    // ★ モーダルの開閉と背景スクロールロック制御
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.toggle('is-open');
      nav.classList.toggle('is-open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    dropdown.addEventListener('click', (e) => {
      if (window.innerWidth <= 860 && e.target.classList.contains('site-header__nav-link')) {
        dropdown.classList.toggle('is-expanded');
      }
    });

    // モーダル内のリンクをクリックした時に閉じる処理
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        menuBtn.classList.remove('is-open');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      const vine = this.querySelector('#hl-scroll-vine');
      const bird = this.querySelector('#hl-header-bird');
      
      if (vine) vine.style.width = scrolled + '%';
      
      if (bird) {
        if (winScroll > lastScroll) {
          bird.style.transform = 'scaleX(-1)';
        } else if (winScroll < lastScroll) {
          bird.style.transform = 'scaleX(1)';
        }
      }
      lastScroll = winScroll;
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
        <img class="site-footer__chara" src="https://5gkyu.github.io/icon/Fuka_footer.png" alt="いちのせ ふうか" role="button" tabindex="0" title="いちのせ ふうか" draggable="false" oncontextmenu="return false;" id="fuka-chara" onerror="this.style.display='none'">
        <div class="site-footer__body">
          <div class="site-footer__grid">
            <div><p class="site-footer__col-heading">ポリシー</p><a href="https://5gkyu.github.io/policy/" class="site-footer__col-link">サイトポリシー</a></div>
            <div><p class="site-footer__col-heading">SNS</p><a href="https://x.com/5gkyu" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">🐦‍⬛ @5gkyu</a></div>
            <div><p class="site-footer__col-heading">サイト</p><a href="https://5gkyu.github.io/" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">KyuLink</a><a href="https://5gkyu.github.io/contact/" class="site-footer__col-link">お問い合わせ</a></div>
            <div><p class="site-footer__col-heading">クレジット</p><p class="site-footer__col-link" style="cursor:default;opacity:0.45;">Design &amp; Illust</p><p class="site-footer__col-link" style="cursor:default;margin-bottom:0.8rem;">${copyText}</p><p class="site-footer__col-link" style="cursor:default;opacity:0.45;">Icons</p><a href="https://phosphoricons.com/" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">Phosphor Icons</a></div>
          </div>
          <div class="site-footer__bottom">
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


    // ★ ベルの生成部分
    if (!document.getElementById('hl-scroll-to-top')) {
      document.head.insertAdjacentHTML('beforeend', `<style>
        .hl-scroll-to-top { 
          position: fixed; bottom: -80px; right: 16px; 
          width: 48px; height: 48px; 
          background: rgba(251, 246, 234, 0.85); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          border: 1.5px solid rgba(146, 181, 188, 0.6); border-radius: 50%; 
          z-index: 199; cursor: pointer; 
          transition: bottom 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease, box-shadow 0.2s ease; 
          box-shadow: 0 4px 12px rgba(106, 86, 74, 0.1); 
          display: flex; align-items: center; justify-content: center; 
        }

        @media (min-width: 861px) { .hl-scroll-to-top { right: 30px; width: 56px; height: 56px; } }
        
        /* 300pxスクロールした時に下から現れる */
        .hl-scroll-to-top.is-visible { bottom: 20px; }
        @media (min-width: 861px) { .hl-scroll-to-top.is-visible { bottom: 30px; } }

        .hl-scroll-to-top:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(106, 86, 74, 0.15); }

        .hl-scroll-to-top svg {
          width: 24px; height: 24px;
          fill: #92B5BC; /* ★ CSS変数ではなく直接カラーコードを指定し、表示不具合を防止 */
          transition: fill 0.3s ease;
        }

        @media (min-width: 861px) { .hl-scroll-to-top svg { width: 28px; height: 28px; } }

        @keyframes hl-bell-ring {
          0% { transform: rotate(0); }
          20% { transform: rotate(20deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0); }
        }
        
        .hl-scroll-to-top.is-ringing svg {
          animation: hl-bell-ring 0.6s ease-in-out;
          transform-origin: top center; 
        }
      </style>`);

      const bookmark = document.createElement('div');
      bookmark.id = 'hl-scroll-to-top';
      bookmark.className = 'hl-scroll-to-top';
      bookmark.title = 'おうちに帰る'; 
      
      // SVGのコード（確実に描画されるプレーンな構成）
      bookmark.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M224,192H200V104a72,72,0,0,0-144,0v88H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16Zm-152,0V104a56,56,0,0,1,112,0v88Zm96,32a40,40,0,0,1-80,0h80Z"/></svg>`;
      
      document.body.appendChild(bookmark);
      
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          bookmark.classList.add('is-visible');
        } else {
          bookmark.classList.remove('is-visible');
        }
      });

      bookmark.addEventListener('click', () => {
        bookmark.classList.add('is-ringing');
        setTimeout(() => bookmark.classList.remove('is-ringing'), 600);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <img src="https://5gkyu.github.io/icon/ogp.png" alt="きゅー" class="hl-profile__icon" onerror="this.src='https://5gkyu.github.io/icon/Fuka_footer.png'">
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
          <div class="hl-profile__bio">妄想癖LV99。字と絵とコードがちょっとずつかける。ゲームが好き。<br><br>Webツールなどを気まぐれ更新
          。<br>ゲームはQueenKyu、ゲーム以外は5Gkyuで活動しています。</div>
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

/* ============================================================
   BREADCRUMB (パンくずリスト)
============================================================ */
class HlBreadcrumb extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    
    // HTML側で current="現在のページ名" と指定された値を取得
    const current = this.getAttribute('current') || 'Page';
    
    this.innerHTML = `
      <style>
        .hl-breadcrumb-nav { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: var(--clr-sage); margin-bottom: 2rem; list-style: none; padding: 0; }
        .hl-breadcrumb-nav li { display: flex; align-items: center; gap: 0.5rem; }
        .hl-breadcrumb-nav li:not(:last-child)::after { content: '>'; opacity: 0.5; font-size: 0.7rem; margin-top: 1px; }
        .hl-breadcrumb-nav a { color: var(--clr-dusty-blue); text-decoration: none; transition: color 0.2s ease; }
        .hl-breadcrumb-nav a:hover { color: var(--clr-peach); }
        .hl-breadcrumb-nav span { opacity: 0.6; }
      </style>
      <ul class="hl-breadcrumb-nav" aria-label="パンくずリスト">
        <li><a href="https://5gkyu.github.io/">Home</a></li>
        <li><span aria-current="page">${current}</span></li>
      </ul>
    `;
  }
}
customElements.define('hl-breadcrumb', HlBreadcrumb);

/* ============================================================
   3. ローディング画面＆自動フェードアウト (スコープカプセル化)
============================================================ */
(function initHalcyonLoading() {
  const FADE_OUT_MS  = 480;
  const PAGE_TRANSITION_MS = 500;

  // スマホ向け：一時的なズームリセット（前回追加分）
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
  overlay.setAttribute('aria-label', 'ページを読み込んでいます');

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
        <path class="hl-road-bg" d="M-20,55 C200,25 380,72 600,42 C820,12 1020,68 1220,40 C1320,25 1390,50 1460,44"/>
        <path class="hl-road-fg" id="hl-road-fg" d="M-20,55 C200,25 380,72 600,42 C820,12 1020,68 1220,40 C1320,25 1390,50 1460,44"/>
        <text class="hl-road-milestone" id="hl-m1" x="355" y="62" font-size="18" text-anchor="middle" fill="#9AB08F">🌿</text>
        <text class="hl-road-milestone" id="hl-m2" x="720" y="28" font-size="18" text-anchor="middle" fill="#EEAFA1">✦</text>
        <text class="hl-road-milestone" id="hl-m3" x="1080" y="54" font-size="18" text-anchor="middle" fill="#92B5BC">❀</text>
        <text class="hl-road-milestone" id="hl-m4" x="1410" y="34" font-size="16" text-anchor="middle" font-weight="bold" fill="#9AB08F" font-family="'Zen Maru Gothic', sans-serif">⛩</text>
      </svg>
    </div>
    <p class="hl-message" id="hl-message">読み込んでいます...</p>
    <div class="hl-bar-wrap">
      <span class="hl-bar-pct" id="hl-pct">0%</span>
      <div class="hl-bar-track"><div class="hl-bar-fill" id="hl-bar-fill"></div></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ローディング画面の準備ができたので、HTML側でかけていた「チラつき防止」のロックを解除する
  const foucStyle = document.getElementById('fouc-prevent');
  if (foucStyle) {
    foucStyle.remove();
  }
  // ▲▲▲ ここまで追加 ▲▲▲

  // ★ 拡大時（ピンチズーム等）に、ユーザーが「今見ている領域」の中央に追従させる
  function alignToVisualViewport() {
    if (!window.visualViewport) return;
    overlay.style.left = window.visualViewport.offsetLeft + 'px';
    overlay.style.top = window.visualViewport.offsetTop + 'px';
    overlay.style.width = window.visualViewport.width + 'px';
    overlay.style.height = window.visualViewport.height + 'px';
  }

  // Visual Viewport API がサポートされている場合のみリスナーを登録
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', alignToVisualViewport);
    window.visualViewport.addEventListener('scroll', alignToVisualViewport);
    alignToVisualViewport(); // 初期配置
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
        setTimeout(() => {
          overlay.remove();
          
          // ★ 追加: ロード完了時のクリーンアップ処理
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

    if (href && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript:')) {
      e.preventDefault();
      const targetUrl = anchor.href;
      document.body.classList.add('hl-page-fade-out');
      setTimeout(() => window.location.href = targetUrl, PAGE_TRANSITION_MS);
    }
  });

})();