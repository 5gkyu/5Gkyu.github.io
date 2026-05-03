/**
 * =============================================================
 * Halcyon Initial Loading Screen & Auto Fade-Out
 * =============================================================
 *
 * 外部からサイトへアクセスした際、ページの全リソース（画像等）の
 * 読み込みが完了するまで画面を覆い、ユーザーの回線速度に合わせて
 * 進行する初回ローディング画面です。
 * 
 * さらに、ページ内のリンクをクリックした際に自動でフェードアウト
 * する画面遷移アニメーション機能が含まれています。
 *
 */
(function () {
  'use strict';

  // --------------------------------------------------------
  // 設定
  // --------------------------------------------------------
  const FADE_IN_MS   = 0;   // 初回表示なので即座に出す
  const FADE_OUT_MS  = 480;
  const PAGE_TRANSITION_MS = 500; // ページ離脱時のフェードアウト時間(ms)

  const STAGE_MSGS = [
    () => 'データをまとめています...',
    () => 'お昼寝の準備をしています...',
    () => 'ちょっとまってね',
    () => 'もうすこし...',
    () => 'ロード完了！',
  ];

  // --------------------------------------------------------
  // フォント（未ロードの場合のみ追加）
  // --------------------------------------------------------
  if (!document.querySelector('link[href*="Zen+Maru"]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap';
    document.head.appendChild(l);
  }

  // --------------------------------------------------------
  // スタイル注入 (ローディング画面 ＋ 自動フェードアウト用)
  // --------------------------------------------------------
  const style = document.createElement('style');
  style.id = 'hl-loading-style';
  style.textContent = `
    /* ============================================================
       ページ遷移用の自動フェードアウトスタイル
    ============================================================ */
    body {
      transition: opacity ${PAGE_TRANSITION_MS}ms ease-in-out;
    }
    body.hl-page-fade-out {
      opacity: 0;
      pointer-events: none; /* フェードアウト中の誤クリック防止 */
    }

    /* ============================================================
       ローディングオーバーレイ本体
    ============================================================ */
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
      opacity: 1; /* 初回表示のため最初から1 */
      pointer-events: all;
      overflow: hidden;
    }

    /* 紙テクスチャ */
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

    /* 呼吸する光のグラデーション */
    .hl-overlay::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.5) 0%, transparent 65%);
      animation: hl-breathe 4.5s ease-in-out infinite;
      pointer-events: none;
    }
   /* 呼吸アニメーション（縦に1.5%だけ伸び縮みさせる） */
    @keyframes hl-breathe {
      0% { transform: translateY(27%) scaleY(1); }
      100% { transform: translateY(27%) scaleY(1.015); }
    }

    .hl-overlay.is-out {
      opacity: 0;
      pointer-events: none;
      transition: opacity ${FADE_OUT_MS}ms ease;
    }

    /* ============================================================
       CSSキャラクター（鳥さん）のスタイリング
    ============================================================ */
    .css-bird {
      position: relative;
      width: 100%;
      height: 100%;
      /* 元の画像の影エフェクトを適用 */
      filter: drop-shadow(0 6px 16px rgba(154,176,143,0.35));
    }

    .bird-container {
      position: absolute;
      width: 120px;
      height: 120px;
      bottom: 0px;
      left: 10px;
    }

    /* 体 */
    .bird-body {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 120px;
      height: 100px;
      /* 水彩風のふんわりとした質感と色 */
      background: #fdfaf3;
      background-image: radial-gradient(circle at 35% 30%, #ffffff 0%, #fdfaf3 50%, #f3eedc 100%);
      border: 4px solid #5a3f29;
      /* おにぎりのような丸みを帯びた形 */
      border-radius: 50% 50% 45% 50% / 60% 60% 40% 40%;
      z-index: 2;
      box-sizing: border-box;
    }

    /* 葉っぱの共通スタイル */
    .bird-leaf {
      position: absolute;
      background: #a4bc8e;
      border: 3.5px solid #5a3f29;
      z-index: 1;
      box-sizing: border-box;
    }
    /* 右横の葉 */
    .leaf1 {
      width: 28px;
      height: 18px;
      top: 25px;
      right: -8px;
      border-radius: 50%;
      transform: rotate(15deg);
    }
    /* 上の葉 */
    .leaf2 {
      width: 22px;
      height: 16px;
      top: 8px;
      right: 12px;
      border-radius: 50%;
      transform: rotate(-45deg);
    }

    /* 目 */
    .bird-eye {
      position: absolute;
      width: 9px;
      height: 9px;
      background: #4a3320;
      border-radius: 50%;
    }
    .eye-left  { top: 40px; left: 35px; }
    .eye-right { top: 46px; left: 75px; } /* 少し傾いた顔の角度を表現 */

    /* くちばし */
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

    /* ほっぺ（チーク） */
    .bird-blush {
      position: absolute;
      width: 18px;
      height: 14px;
      background: #ffc2af;
      border-radius: 50%;
      opacity: 0.7;
    }
    .blush-left  { top: 48px; left: 16px; transform: rotate(-10deg); }
    .blush-right { top: 54px; left: 88px; transform: rotate(10deg); }

    /* ============================================================
       キャラクターエリア
    ============================================================ */
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
    .hl-char-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 6px 16px rgba(154,176,143,0.35));
      display: block;
    }
    .hl-char-img.is-missing { display: none; }
    .hl-char-img.is-loaded  ~ .hl-char-placeholder { display: none; }

    .hl-char-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      background: linear-gradient(148deg, rgba(154,176,143,0.10), rgba(238,175,161,0.08));
      border-radius: 20px;
      border: 2px dashed rgba(154,176,143,0.30);
    }
    .hl-char-placeholder-icon  { font-size: 3rem; opacity: 0.4; }
    .hl-char-placeholder-label {
      font-size: 0.62rem;
      color: #9AB08F;
      opacity: 0.7;
      text-align: center;
      line-height: 1.7;
    }

    
    .hl-overlay:not([data-stage="-1"]) .hl-companion { opacity: 1; }

    /* ---- ステージ別アニメーション ---- */
    .hl-overlay[data-stage="0"] .hl-char-inner { animation: hl-nod 0.55s ease; }
    .hl-overlay[data-stage="1"] .hl-char-inner,
    .hl-overlay[data-stage="2"] .hl-char-inner { animation: hl-walk 0.65s ease-in-out infinite; }
    .hl-overlay[data-stage="1"] .hl-companion,
    .hl-overlay[data-stage="2"] .hl-companion { animation: hl-bird-bob 0.65s ease-in-out infinite; }
    .hl-overlay[data-stage="3"] .hl-char-inner { animation: hl-tiptoe 1s ease-in-out infinite; }
    .hl-overlay[data-stage="4"] .hl-char-inner { animation: hl-wave 1.4s ease forwards; }
    .hl-overlay[data-stage="4"] .hl-companion { animation: hl-bird-bow 0.9s ease 0.9s both; }

    @keyframes hl-nod {
      0%, 100% { transform: rotate(0deg) scale(1); }
      45%       { transform: rotate(-6deg) scale(0.97); }
    }
    @keyframes hl-walk {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes hl-tiptoe {
      0%, 100% { transform: translateY(0) scaleY(1); }
      50%       { transform: translateY(-11px) scaleY(1.04); }
    }
    @keyframes hl-wave {
      0%   { transform: rotate(0deg); opacity: 1; }
      15%  { transform: rotate(-14deg); }
      30%  { transform: rotate(9deg); }
      50%  { transform: rotate(-10deg); }
      70%  { transform: rotate(6deg) translateX(12px); }
      100% { transform: rotate(0deg) translateX(24px) scale(0.75); opacity: 0; }
    }

    /* ============================================================
       ウェーブロード（底部 SVG パス）
    ============================================================ */
    .hl-road-wrap {
      position: absolute;
      bottom: 60px;
      left: 0;
      right: 0;
      height: 88px;
      pointer-events: none;
      z-index: 0;
    }
    .hl-road-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
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
    .hl-road-milestone.is-reached {
      opacity: 1;
      transform: scale(1);
    }

    /* ============================================================
       メッセージ・プログレスバー
    ============================================================ */
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
  `;
  document.head.appendChild(style);

  // --------------------------------------------------------
  // オーバーレイ DOM 構築
  // --------------------------------------------------------
  const overlay = document.createElement('div');
  overlay.className  = 'hl-overlay';
  overlay.dataset.stage = '-1';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', 'ページを読み込んでいます');

  overlay.innerHTML = `
    <div class="hl-char-outer" id="hl-char-outer">
      <div class="hl-char-inner">
        <!-- 画像の代わりにCSSで描画した鳥さんを配置 -->
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
      <div class="hl-bar-track">
        <div class="hl-bar-fill" id="hl-bar-fill"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

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

  // --------------------------------------------------------
  // 状態変数とロード監視ロジック
  // --------------------------------------------------------
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
  
  // 動的プログレス用の変数
  let simulatedProgress = 0;
  let isFullyLoaded = false;

  if (document.readyState === 'complete') {
    isFullyLoaded = true;
  } else {
    window.addEventListener('load', () => {
      isFullyLoaded = true;
    });
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

    if (pathLength > 0) {
      roadFg.style.strokeDashoffset = (pathLength * (1 - p)).toFixed(2);
    }

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
        setTimeout(() => overlay.remove(), FADE_OUT_MS);
      }, 450);
    }
  }

  rafId = requestAnimationFrame(tick);

  // --------------------------------------------------------
  // 自動フェードアウト（ページ遷移）処理
  // --------------------------------------------------------
  document.addEventListener('click', (e) => {
    // クリックされた要素が aタグ（またはその子要素）かチェック
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    const target = anchor.getAttribute('target');

    // 以下の場合はフェードアウトを適用しない
    // 1. href属性がない
    // 2. ページ内リンク（#から始まる）
    // 3. 別タブで開く（target="_blank"）
    // 4. javascript:で始まるリンク
    if (href && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript:')) {
      
      e.preventDefault(); // デフォルトの遷移をキャンセル
      const targetUrl = anchor.href;

      // bodyにフェードアウト用のクラスを追加
      document.body.classList.add('hl-page-fade-out');

      // CSSのtransition時間に合わせて画面を遷移
      setTimeout(() => {
        window.location.href = targetUrl;
      }, PAGE_TRANSITION_MS);
    }
  });

})();