/**
 * =============================================================
 * Halcyon Loading Screen  ―  loading.js
 * =============================================================
 *
 * このファイルは何をする？
 * ---------------------------------------------------------------
 * ページ遷移時にローディングオーバーレイを表示し、
 * 読み込み完了後に次のページへシームレスに遷移する機能を持ちます。
 * また、ページ到着時に body をフェードインさせる機能も内包しています。
 *
 * =============================================================
 * 展開方法
 * =============================================================
 *
 * ─────────────────────────────────────────────────────────────
 * ▶ 「推奨」 CDN 方式（https://5gkyu.github.io/components/ より読み込み）
 * ─────────────────────────────────────────────────────────────
 *
 *   ファイル配置不要。HTML の </body> 直前に以下 2 行を追加するだけ。
 *   必ず components.js の後に配置すること。
 *
 *         <script src="https://5gkyu.github.io/components/components.js"></script>
 *         <script src="https://5gkyu.github.io/components/loading.js"></script>
 *
 * ─────────────────────────────────────────────────────────────
 * ▶ ローカル方式（リポジトリごとにファイルを管理する場合）
 * ─────────────────────────────────────────────────────────────
 *
 *   STEP 1: components.js と同じ components/ フォルダに配置する。
 *
 *   STEP 2: HTML の </body> 直前で読み込む。
 *           必ず components.js の後に持ってくること。
 *
 *         <script src="components/components.js"></script>
 *         <script src="components/loading.js"></script>
 *
 *   STEP 3: キャラクター画像を配置（任意）。
 *         ルートフォルダに image_0.png を置くだけで自動適用される。
 *         未配置時はプレースホルダーアイコンが表示される。
 *
 * =============================================================
 * ⚠️ 既存サイトで使う際の注意点
 * =============================================================
 *
 *   body に background-color: #FBF6EA （クリームアイボリー）を設定することを推奨します。
 *   未設定の場合、ローディング画面が消えた瞬間にページが真っ白にチラつくことがあります。
 *   複数のサイトで別のベースカラーを使っている場合は、そのサイトの body に
 *   実際の背景色を設定することで同様に解決できます。
 *
 * =============================================================
 * 動作仕様
 * =============================================================
 *
 *   ページ読み込み時 : body に 0.7s ease-out のフェードインを適用。
 *   リンククリック時  : オーバーレイがフェードイン → プログレス 0→100% →
 *                     フェードアウト → window.location.href で遷移。
 *
 *   自動インターセプト対象外リンク（標準以下はスキップ）:
 *     - http / https から始まる外部URL
 *     - # から始まるあんかーリンク
 *     - mailto: / tel: / javascript:
 *     - target="_blank"（別タブ）
 *
 * =============================================================
 * 調整可能な定数（ファイル内上部の DURATION_MS 等）
 * =============================================================
 *
 *   DURATION_MS  プログレスバーが 0→1000% に達するまでの時間（ms）。
 *                小さくすると画面切り替わりが速くなる。デフォルト: 2000
 *   FADE_IN_MS   オーバーレイがフェードインする時間（ms）。デフォルト: 380
 *   FADE_OUT_MS  オーバーレイがフェードアウトしてから実際に遷移するまでの時間（ms）。デフォルト: 480
 *
 * =============================================================
 * ステージメッセージ
 * =============================================================
 *
 *   プログレスに応じて 5段階のメッセージが切り替わります。
 *   stage 0 ( 0–25%)  : "手帳をまとめています..."
 *   stage 1 (25–50%)  : "「{destLabel}」へ向かっています..."
 *                        destLabel はクリックしたリンクのテキストから自動取得。
 *   stage 2 (50–75%)  : "もうすぐ到着します..."
 *   stage 3 (75–100%) : "ゲートが見えてきました..."
 *   stage 4 (100%)    : "ご案内します！"
 *
 * =============================================================
 * アニメーションシーケンス
 * =============================================================
 *
 *   stage 0 : こくんとお辞儀（手帳を閉じるイメージ）
 *   stage 1 : 縦バウンス（歩き），横方向に移動開始
 *   stage 2 : 歩き続ける（マイルストーンに触れる）
 *   stage 3 : つま先立ち（ゲートの前で見上げる）
 *   stage 4 : 手を振って消える，コンパニオンが会釈
 *
 * =============================================================
 * 注意事項
 * =============================================================
 *
 *   - loading.js は必ず components.js の後に読み込むこと。
 *   - 内部リンクのみ自動インターセプトされる。外部リンクは現行後がデフォルトです。
 *   - image_0.png がなくても動作します（プレースホルダー表示）。
 *   - policy.html へのリンクは JS から生成された相対パスなので、
 *     各サイトのルートに policy.html を配置するか、フッターのリンクを上書きすること。
 *   - ⚠️ body に background-color: #FBF6EA を設定することを強く推奨します。
 *     未設定の場合、ローディング画面が消えた瞬間にページが真っ白にチラつくことがあります。
 *     別の背景色を使うサイトでは、そのサイトの実際の背景色を body に設定してください。
 *
 */
(function () {
  'use strict';

  // --------------------------------------------------------
  // 設定
  // --------------------------------------------------------
  const DURATION_MS  = 2000;  // 0→100% にかかる時間（ms）
  const FADE_IN_MS   = 380;
  const FADE_OUT_MS  = 480;

  const STAGE_MSGS = [
    () => '手帳をまとめています...',
    () => `「${destLabel}」へ向かっています...`,
    () => 'もうすぐ到着します...',
    () => 'ゲートが見えてきました...',
    () => 'ご案内します！',
  ];

  // --------------------------------------------------------
  // ページ読み込み時のフェードイン（body に適用）
  // --------------------------------------------------------
  if (!document.getElementById('hl-page-fadein')) {
    const s = document.createElement('style');
    s.id = 'hl-page-fadein';
    s.textContent = `
      body { animation: hl-page-in 0.7s ease-out both; }
      @keyframes hl-page-in { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(s);
  }

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
  // スタイル注入
  // --------------------------------------------------------
  const style = document.createElement('style');
  style.id = 'hl-loading-style';
  style.textContent = `
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
      opacity: 0;
      pointer-events: none;
      transition: opacity ${FADE_IN_MS}ms ease;
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
    @keyframes hl-breathe {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 0.9; }
    }

    .hl-overlay.is-active {
      opacity: 1;
      pointer-events: all;
    }
    .hl-overlay.is-out {
      opacity: 0;
      pointer-events: none;
      transition: opacity ${FADE_OUT_MS}ms ease;
    }

    /* 行き先バッジ（右上） */
    .hl-badge {
      position: absolute;
      top: 1.6rem;
      right: 1.8rem;
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      color: #9AB08F;
      opacity: 0;
      transition: opacity 0.5s ease 0.2s;
      z-index: 1;
    }
    .hl-overlay.is-active .hl-badge { opacity: 0.8; }

    /* ============================================================
       キャラクターエリア
    ============================================================ */
    /* outer: JS が translateX で横移動させる */
    .hl-char-outer {
      position: relative;
      z-index: 1;
      will-change: transform;
    }

    /* inner: CSS アニメーション（縦バウンス・つま先立ち・手振り）*/
    .hl-char-inner {
      position: relative;
      width: 140px;
      height: 180px;
    }

    /* キャラクター画像 */
    .hl-char-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 6px 16px rgba(154,176,143,0.35));
      display: block;
    }
    .hl-char-img.is-missing { display: none; }
    .hl-char-img.is-loaded  ~ .hl-char-placeholder { display: none; }

    /* 画像がない間のプレースホルダー */
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

    /* コンパニオン（肩の鳥） */
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

    /* ---- ステージ別アニメーション ---- */

    /* stage 0: 手帳を閉じる（こくんとお辞儀） */
    .hl-overlay[data-stage="0"] .hl-char-inner {
      animation: hl-nod 0.55s ease;
    }
    /* stage 1, 2: 歩く（縦バウンス） */
    .hl-overlay[data-stage="1"] .hl-char-inner,
    .hl-overlay[data-stage="2"] .hl-char-inner {
      animation: hl-walk 0.65s ease-in-out infinite;
    }
    /* stage 1, 2: コンパニオンも揺れる */
    .hl-overlay[data-stage="1"] .hl-companion,
    .hl-overlay[data-stage="2"] .hl-companion {
      animation: hl-bird-bob 0.65s ease-in-out infinite;
    }
    /* stage 3: ゲートを見上げる（つま先立ち） */
    .hl-overlay[data-stage="3"] .hl-char-inner {
      animation: hl-tiptoe 1s ease-in-out infinite;
    }
    /* stage 4: 手を振って消える */
    .hl-overlay[data-stage="4"] .hl-char-inner {
      animation: hl-wave 1.4s ease forwards;
    }
    /* stage 4: コンパニオンが会釈 */
    .hl-overlay[data-stage="4"] .hl-companion {
      animation: hl-bird-bow 0.9s ease 0.9s both;
    }

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
    @keyframes hl-bird-bob {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-5px); }
    }
    @keyframes hl-bird-bow {
      0%   { transform: rotate(0deg); }
      40%  { transform: rotate(-26deg); }
      70%  { transform: rotate(10deg); }
      100% { transform: rotate(-16deg); }
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
    /* 点線の背景パス */
    .hl-road-bg {
      fill: none;
      stroke: rgba(154,176,143,0.20);
      stroke-width: 2.5;
      stroke-dasharray: 7 5;
      stroke-linecap: round;
    }
    /* 進捗に応じて引かれるパス */
    .hl-road-fg {
      fill: none;
      stroke: #9AB08F;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    /* マイルストーン記号 */
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
    <!-- 行き先バッジ -->
    <span class="hl-badge" id="hl-badge">→</span>

    <!-- キャラクター -->
    <div class="hl-char-outer" id="hl-char-outer">
      <div class="hl-char-inner">
        <img
          id="hl-char-img"
          class="hl-char-img"
          src="image_0.png"
          alt="キャラクター"
        >
        <div class="hl-char-placeholder" id="hl-char-placeholder">
          <span class="hl-char-placeholder-icon">🎨</span>
          <span class="hl-char-placeholder-label">image_0.png<br>（準備中）</span>
        </div>
        <span class="hl-companion" aria-hidden="true">🐦</span>
      </div>
    </div>

    <!-- ウェーブロード（底部） -->
    <div class="hl-road-wrap" aria-hidden="true">
      <svg class="hl-road-svg" viewBox="0 0 1440 88" preserveAspectRatio="none">
        <!-- 背景の点線パス -->
        <path class="hl-road-bg"
          d="M-20,55 C200,25 380,72 600,42 C820,12 1020,68 1220,40 C1320,25 1390,50 1460,44"/>
        <!-- 進捗パス（JS で stroke-dashoffset を操作） -->
        <path class="hl-road-fg" id="hl-road-fg"
          d="M-20,55 C200,25 380,72 600,42 C820,12 1020,68 1220,40 C1320,25 1390,50 1460,44"/>
        <!-- 25% マイルストーン：新芽 -->
        <text class="hl-road-milestone" id="hl-m1"
          x="355" y="62" font-size="18" text-anchor="middle" fill="#9AB08F">🌿</text>
        <!-- 50% マイルストーン：星 -->
        <text class="hl-road-milestone" id="hl-m2"
          x="720" y="28" font-size="18" text-anchor="middle" fill="#EEAFA1">✦</text>
        <!-- 75% マイルストーン：花 -->
        <text class="hl-road-milestone" id="hl-m3"
          x="1080" y="54" font-size="18" text-anchor="middle" fill="#92B5BC">❀</text>
        <!-- 100% ゲート -->
        <text class="hl-road-milestone" id="hl-m4"
          x="1410" y="34" font-size="16" text-anchor="middle" font-weight="bold"
          fill="#9AB08F" font-family="'Zen Maru Gothic', sans-serif">⛩</text>
      </svg>
    </div>

    <!-- メッセージ -->
    <p class="hl-message" id="hl-message">読み込んでいます...</p>

    <!-- プログレスバー -->
    <div class="hl-bar-wrap">
      <span class="hl-bar-pct" id="hl-pct">0%</span>
      <div class="hl-bar-track">
        <div class="hl-bar-fill" id="hl-bar-fill"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // 画像ロード結果に応じてクラス付与
  const charImg = document.getElementById('hl-char-img');
  charImg.addEventListener('load',  () => charImg.classList.add('is-loaded'));
  charImg.addEventListener('error', () => charImg.classList.add('is-missing'));

  // ウェーブパスの全長を取得（stroke-dashoffset 制御用）
  const roadFg   = document.getElementById('hl-road-fg');
  let pathLength = 0;
  // DOMContentLoaded 後に計算
  function initPathLength() {
    try {
      pathLength = roadFg.getTotalLength();
      roadFg.style.strokeDasharray  = pathLength;
      roadFg.style.strokeDashoffset = pathLength; // 最初は非表示
    } catch (_) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPathLength);
  } else {
    // rAF で確実に描画後に計算
    requestAnimationFrame(initPathLength);
  }

  // --------------------------------------------------------
  // 状態変数
  // --------------------------------------------------------
  const pctEl    = document.getElementById('hl-pct');
  const fillEl   = document.getElementById('hl-bar-fill');
  const msgEl    = document.getElementById('hl-message');
  const badgeEl  = document.getElementById('hl-badge');
  const outerEl  = document.getElementById('hl-char-outer');
  const m1       = document.getElementById('hl-m1');
  const m2       = document.getElementById('hl-m2');
  const m3       = document.getElementById('hl-m3');
  const m4       = document.getElementById('hl-m4');

  let currentStage = -1;
  let rafId    = null;
  let startTs  = null;
  let destHref  = null;
  let destLabel = 'リンク先';

  // --------------------------------------------------------
  // キャラクターの横位置計算（translateX）
  //   0–25%  : 左端（-50px）でこくんと動く
  //   25–75% : -50px → +50px を歩いて横断
  //   75–100%: 右端（+50px）でつま先立ち
  // --------------------------------------------------------
  function charX(p) {
    if (p < 0.25) return -50;
    if (p < 0.75) return -50 + ((p - 0.25) / 0.50) * 100;
    return 50;
  }

  // イージング（easeInOutQuad）
  function ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // --------------------------------------------------------
  // 進捗更新
  // --------------------------------------------------------
  function setProgress(p) {
    const pct = Math.round(p * 100);
    pctEl.textContent  = pct + '%';
    fillEl.style.width = pct + '%';

    // キャラクター横移動（outer に translateX）
    outerEl.style.transform = `translateX(${charX(p).toFixed(1)}px)`;

    // ロードパスの描画
    if (pathLength > 0) {
      roadFg.style.strokeDashoffset = (pathLength * (1 - p)).toFixed(2);
    }

    // マイルストーン出現
    if (p >= 0.25) m1.classList.add('is-reached');
    if (p >= 0.50) m2.classList.add('is-reached');
    if (p >= 0.75) m3.classList.add('is-reached');
    if (p >= 1.00) m4.classList.add('is-reached');

    // ステージ更新
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

  // --------------------------------------------------------
  // RAF ループ
  // --------------------------------------------------------
  function tick(ts) {
    if (!startTs) startTs = ts;
    const raw   = Math.min((ts - startTs) / DURATION_MS, 1);
    const eased = ease(raw);
    setProgress(eased);

    if (raw < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      setTimeout(finishLoading, 450);
    }
  }

  function finishLoading() {
    overlay.classList.add('is-out');
    setTimeout(() => {
      window.location.href = destHref;
    }, FADE_OUT_MS);
  }

  // --------------------------------------------------------
  // オーバーレイ表示リセット
  // --------------------------------------------------------
  function resetOverlay() {
    // マイルストーンをリセット
    [m1, m2, m3, m4].forEach(m => m.classList.remove('is-reached'));
    // パスをリセット
    if (pathLength > 0) {
      roadFg.style.strokeDashoffset = pathLength;
    }
    currentStage = -1;
    overlay.dataset.stage = '-1';
    outerEl.style.transform = `translateX(${charX(0).toFixed(1)}px)`;
    fillEl.style.width = '0%';
    pctEl.textContent  = '0%';
    msgEl.textContent  = '読み込んでいます...';
    msgEl.classList.remove('is-fade');
  }

  // --------------------------------------------------------
  // リンクのインターセプト
  // --------------------------------------------------------
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('http') || href.startsWith('//') ||
      href.startsWith('#')    || href.startsWith('mailto:') ||
      href.startsWith('tel:') || href.startsWith('javascript:') ||
      link.target === '_blank'
    ) return;

    e.preventDefault();

    // 前のアニメーションがあればキャンセル
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    destHref  = href;
    destLabel = link.textContent.trim() || 'リンク先';
    startTs   = null;

    // 行き先バッジ更新
    badgeEl.textContent = '→ ' + (link.textContent.trim() || href);

    // オーバーレイをリセットしてから表示
    overlay.classList.remove('is-out', 'is-active');
    resetOverlay();

    // reflow を強制してトランジションを起動
    overlay.offsetHeight;
    overlay.classList.add('is-active');

    // フェードイン完了後にプログレス開始
    setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, FADE_IN_MS);
  });

})();
