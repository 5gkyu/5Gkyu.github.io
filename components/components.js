/**
 * =============================================================
 * Halcyon Shared Components  ―  components.js
 * =============================================================
 *
 * このファイルは何をする？
 * ---------------------------------------------------------------
 * Web Components（カスタム要素）を使ってヘッダー／フッターを
 * HTML タグ一行で展開できる共通コンポーネントです。
 * CSS変数、Google Fonts読み込み、到着アニメーションCSSも
 * このファイル一本にまとまっています。
 *
 * =============================================================
 * 展開方法（新規・既存どちらでも）
 * =============================================================
 *
 * ─────────────────────────────────────────────────────────────
 * ▶ 「推奨」 CDN 方式（複数サイトで一元管理）
 * ─────────────────────────────────────────────────────────────
 *
 *   ファイルを各サイトにコピーする代わりに、
 *   https://5gkyu.github.io/components/ のホスティング版を
 *   直接読み込む方式です。
 *   一か所のファイルを山で展開でき、内容の変更が即座に全サイトに反映されます。
 *
 *   STEP 1: ファイル配置不要。
 *           各サイトの HTML に ↓ 2 行追加するだけ。
 *
 *         <script src="https://5gkyu.github.io/components/components.js"></script>
 *         <script src="https://5gkyu.github.io/components/loading.js"></script>
 *
 *   STEP 2: HTML にタグを書く（内容は下記「最小 HTML テンプレート」参照）。
 *
 *   STEP 3: キャラクター画像を配置（任意）。
 *           サイトのルートに image_0.png を置くだけで自動適用される。
 *
 *   ⚠️ 注意: 定数数値の変更（DURATION_MS 等）は CDN 側のファイルを編集する必要があります。
 *   ⚠️ 注意: GitHub Pages に CDN 用リポジトリ（5gkyu.github.io のルート）の
 *           components/ フォルダにこのファイルをプッシュしておく必要があります。
 *
 * ─────────────────────────────────────────────────────────────
 * ▶ ローカルコピー方式（リポジトリごとにファイルを管理する場合）
 * ─────────────────────────────────────────────────────────────
 *
 *   STEP 1: ファイルを配置
 *     プロジェクトのルートに components/ フォルダを作り、
 *     components.js と loading.js を入れる。
 *
 *     my-site/
 *     ├── index.html
 *     ├── image_0.png       ← キャラクター画像（ローディング用）
 *     └── components/
 *         ├── components.js   ← このファイル
 *         └── loading.js      ← ローディング画面
 *
 *   STEP 2: HTML にタグを書く
 *
 *   <script src="components/components.js"></script>
 *   <script src="components/loading.js"></script>
 *
 *   <html lang="ja">
 *   <head>
 *     <meta charset="UTF-8">
 *     <meta name="viewport" content="width=device-width, initial-scale=1.0">
 *     <title>ページタイトル</title>
 *     <!-- body に background-color: #FBF6EA を設定するのを推奨 -->
 *     <!-- 未設定の場合、ローディング画面が消えた瞬間にページが真っ白にチラつくことがあります -->
 *   </head>
 *   <body>
 *
 *     <site-header
 *       site-name="ページ名"
 *       nav-items='[{"href":"other.html","label":"別ページ"}]'
 *       contact-href="https://example.com/contact">
 *     </site-header>
 *
 *     <main>コンテンツ</main>
 *
 *     <site-footer copy="コピーライト名"></site-footer>
 *
 *     <!-- CDN 方式 -->
 *     <script src="https://5gkyu.github.io/components/components.js"></script>
 *     <script src="https://5gkyu.github.io/components/loading.js"></script>
 *     <!-- ローカル方式 -->
 *     <!-- <script src="components/components.js"></script> -->
 *     <!-- <script src="components/loading.js"></script> -->
 *   </body>
 *   </html>
 *
 * =============================================================
 * <site-header> 属性 一覧
 * =============================================================
 *
 *   site-name    {string}
 *     ロゴ部分に表示するサイト名。省略時は "Halcyon"。
 *
 *   nav-items    {JSON配列文字列}  素: { href, label }
 *     ナビゲーションリンクの配列。省略時は空（お問い合わせボタンのみ表示）。
 *     例: nav-items='[{"href":"about.html","label":"について"}]'
 *
 *   contact-href {string}
 *     「お問い合わせ」ボタンのリンク先URL。
 *     省略時は https://5gkyu.github.io/KyuLink/?tag=Contact。
 *
 * =============================================================
 * <site-footer> 属性 一覧
 * =============================================================
 *
 *   copy  {string}
 *     コピーライト表示名。省略時は "5Gkyu"。
 *     実際の表示: "© 2026 {copy}. All Rights Reserved."
 *
 * =============================================================
 * 到着アニメーション用 CSS クラス
 * =============================================================
 *
 *   このファイルは到着アニメーション用の CSS クラスも定義しています。
 *   ページ内の任意要素に付与することで個別にアニメーションさせることができます。
 *
 *   .fluffy-entry          … 下からフワッと浮き上がる（メインコンテンツ・フッター向き）
 *   .fluffy-entry-down     … 上からフワッと降りてくる（ヘッダー向き）
 *   .delay-1               … 0.15s 遅延
 *   .delay-2               … 0.35s 遅延
 *   .delay-3               … 0.55s 遅延
 *
 *   例： <section class="fluffy-entry delay-2">...</section>
 *
 * =============================================================
 * カラーパレット（デザイントークン）
 * =============================================================
 *
 *   --clr-cream      #FBF6EA   クリームアイボリー  ベース背景
 *   --clr-sage       #9AB08F   セージグリーン    ヘッダー
 *   --clr-peach      #EEAFA1   ピーチアプリコット  ガクセント（テキストホバー・ボタン）
 *   --clr-dusty-blue #92B5BC   ダスティブルー    サブ要素
 *   --clr-brown      #6A564A   ウォームブラウン  テキスト
 *   footer-bg        #4A3B32   ダークブラウン    フッター背景
 *
 *   ※ ページ側でアクセントカラーを変えたい場合は、
 *     body または :root 内で変数を上書きするだけで OK。
 *
 * =============================================================
 * フォント
 * =============================================================
 *
 *   Zen Maru Gothic（Google Fonts）を自動読わせます。
 *   別途読み込み不要。ページ内で font-family: var(--font-main) を使用可能。
 *
 * =============================================================
 * カスタマイズメモ
 * =============================================================
 *
 *   Q: ヘッダーの背景色を変えたい
 *     A: .site-header { background: ... } をページ側のCSSで上書きする。
 *
 *   Q: フッターの右列に要素を追加したい
 *     A: SiteFooterのconnectedCallback内の #site-footer-right-col の内容を編集する。
 *        または connectedCallback 後に JS で querySelector してDOM操作でも延。
 *
 *   Q: お問い偓わせボタンを隠したい
 *     A: contact-href="" （空文字列）を指定すると、
 *        JS内で何もレンダリングしないよう改修するとよい。
 *
 */

// ============================================================
// Shared Style Injection（一度だけ挿入）
// ============================================================
(function injectStyles() {
  if (document.getElementById('halcyon-shared-style')) return;

  /* Google Fonts */
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);

  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap';
  document.head.appendChild(fontLink);

  /* CSS Variables & Component Styles */
  const style = document.createElement('style');
  style.id = 'halcyon-shared-style';
  style.textContent = `
    /* スクロールバー出現によるレイアウトずれを防止 */
    html {
      scrollbar-gutter: stable;
      overflow-x: hidden;
    }

    /* ---- Design Tokens ---- */
    :root {
      --clr-cream:       #FBF6EA;
      --clr-sage:        #9AB08F;
      --clr-peach:       #EEAFA1;
      --clr-dusty-blue:  #92B5BC;
      --clr-brown:       #6A564A;
      --font-main:       'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', 'Rounded Mplus 1c', sans-serif;
    }

    /* ============================================================
       HEADER
    ============================================================ */
    .site-header {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 200;
      background: rgba(154, 176, 143, 0.96);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1.5px solid rgba(106, 86, 74, 0.10);
      font-family: var(--font-main);
    }

    .site-header__inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .site-header__logo-area {
      display: flex;
      align-items: center;
    }

    .site-header__logo-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      user-select: none;
      transition: opacity 0.25s ease;
    }

    .site-header__logo-link:hover {
      opacity: 0.72;
    }

    .site-header__logo-icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .site-header__logo-text {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--clr-cream);
      letter-spacing: 0.06em;
    }

    /* 現在地テキスト（ロゴ右側に小さく表示） */
    .site-header__site-name {
      font-size: 0.68rem;
      font-weight: 500;
      color: var(--clr-cream);
      opacity: 0.55;
      letter-spacing: 0.10em;
      margin-left: 0.55rem;
      padding: 0.18rem 0.55rem;
      border: 1px solid rgba(251,246,234,0.28);
      border-radius: 50px;
      white-space: nowrap;
    }

    .site-header__nav {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .site-header__nav-link {
      position: relative;
      color: var(--clr-cream);
      font-family: var(--font-main);
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      padding-bottom: 3px;
      transition: color 0.25s ease;
    }

    /* 下線がスッと引かれるホバーアニメーション */
    .site-header__nav-link::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 1.5px;
      background: var(--clr-peach);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .site-header__nav-link:hover {
      color: var(--clr-peach);
    }

    .site-header__nav-link:hover::after {
      width: 100%;
    }

    /* お問い合わせリンク（右端固定） */
    .site-header__contact {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--clr-cream);
      font-family: var(--font-main);
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-decoration: none;
      padding: 0.38rem 0.95rem;
      border: 1.5px solid rgba(251,246,234,0.45);
      border-radius: 50px;
      transition: background 0.25s ease, border-color 0.25s ease;
    }

    .site-header__contact:hover {
      background: rgba(251,246,234,0.14);
      border-color: rgba(251,246,234,0.80);
    }

    /* ヘッダーから垂れ下がる葉っぱ */
    .site-header__leaves {
      position: absolute;
      /* ヘッダーの下端から垂れる */
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: min(520px, 70vw);
      /* 葉っぱの画像の高さに合わせて調整 */
      height: auto;
      pointer-events: none;
      z-index: 199;           /* ヘッダー(200)の直下 */
      filter: drop-shadow(0 4px 10px rgba(106,86,74,0.12));
      /* 画像なしの時は非表示 */
      display: none;
    }
    .site-header__leaves.is-loaded {
      display: block;
      animation: hl-leaves-in 0.9s cubic-bezier(0.25,1,0.5,1) both;
      animation-delay: 0.25s;
    }
    @keyframes hl-leaves-in {
      from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .site-footer {
      font-family: var(--font-main);
      line-height: 1;
      position: relative;   /* キャラクターの基点 */
    }

    /* フッター右に座るキャラクター */
    .site-footer__chara {
      position: absolute;
      right: max(1rem, calc(50% - 560px));  /* コンテンツ幅に追従 */
      bottom: 100%;                          /* フッター上端に辺を合わせる */
      width: clamp(90px, 12vw, 150px);
      height: auto;
      pointer-events: none;
      filter: drop-shadow(-3px 0 12px rgba(74,59,50,0.18));
      display: none;
      z-index: 1;
    }
    .site-footer__chara.is-loaded {
      display: block;
      animation: hl-chara-in 1s cubic-bezier(0.25,1,0.5,1) both;
      animation-delay: 0.45s;
    }
    @keyframes hl-chara-in {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* モバイルではキャラクターを小さく */
    @media (max-width: 640px) {
      .site-footer__chara {
        width: clamp(60px, 18vw, 90px);
        right: 0.5rem;
      }
    }

    .site-footer__body {
      background: #4A3B32;
      padding: 1.5rem 2rem 2rem;
    }

    /* 4列グリッド / モバイルは 2×2 */
    .site-footer__grid {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 1.5rem 2rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(251,246,234,0.12);
    }

    /* モバイル: 左 2 列を上段、右 2 列を下段に表示 */
    @media (max-width: 640px) {
      .site-footer__grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .site-footer__col-heading {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--clr-cream);
      letter-spacing: 0.14em;
      opacity: 0.45;
      text-transform: uppercase;
      margin-bottom: 0.6rem;
    }

    .site-footer__col-link {
      display: block;
      color: var(--clr-cream);
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      opacity: 0.72;
      text-decoration: none;
      line-height: 2;
      transition: opacity 0.25s ease;
    }

    .site-footer__col-link:hover {
      opacity: 1;
    }

    /* 下部：ドット＋コピーライト */
    .site-footer__bottom {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      padding-top: 1.25rem;
    }

    .site-footer__dots {
      display: flex;
      gap: 7px;
      align-items: center;
    }

    .site-footer__dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--clr-cream);
      opacity: 0.45;
    }

    .site-footer__dot:nth-child(2) {
      width: 7px;
      height: 7px;
      opacity: 0.65;
    }

    .site-footer__copy {
      color: var(--clr-cream);
      font-size: 0.75rem;
      letter-spacing: 0.06em;
      opacity: 0.55;
    }

    .site-footer__policy-link {
      color: var(--clr-cream);
      font-size: 0.75rem;
      letter-spacing: 0.06em;
      opacity: 0.55;
      text-decoration: none;
      border-bottom: 1px solid rgba(251,246,234,0.30);
      padding-bottom: 1px;
      transition: opacity 0.25s ease;
    }

    .site-footer__policy-link:hover {
      opacity: 0.9;
    }

    /* ============================================================
       到着アニメーション（スタッガー）
    ============================================================ */

    /* 下からフワッと浮き上がる */
    .fluffy-entry {
      opacity: 0;
      animation: hl-float-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) both;
    }

    /* 上からフワッと降りてくる（ヘッダー用） */
    .fluffy-entry-down {
      opacity: 0;
      animation: hl-float-down 0.8s cubic-bezier(0.25, 1, 0.5, 1) both;
    }

    @keyframes hl-float-up {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes hl-float-down {
      from { opacity: 0; transform: translateY(-18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.35s; }
    .delay-3 { animation-delay: 0.55s; }
  `;
  document.head.appendChild(style);
})();


// ============================================================
// <site-header> Custom Element
// 属性:
//   site-name    : 現在地表示用テキスト （ロゴ場所の右側に小さく表示、省略可）
//   nav-items    : JSON配列 [{href, label}, ...]
//   contact-href : お問い合わせリンクのURL（省略時はデフォルト）
// ============================================================
class SiteHeader extends HTMLElement {
  connectedCallback() {
    const siteName    = this.getAttribute('site-name')    || '';
    const contactHref = this.getAttribute('contact-href') || 'https://5gkyu.github.io/KyuLink/?tag=Contact';

    let navItems = [];
    try {
      navItems = JSON.parse(this.getAttribute('nav-items') || '[]');
    } catch (_) {}

    const siteLabel = siteName
      ? `<span class="site-header__site-name" aria-hidden="true">${siteName}</span>`
      : '';

    this.innerHTML = `
      <header class="site-header fluffy-entry-down delay-1" role="banner">
        <div class="site-header__inner">
          <div class="site-header__logo-area">
            <a href="https://5gkyu.github.io/KyuLink/?tag=Home"
               class="site-header__logo-link"
               aria-label="5Gkyu ホームへ">
              <span class="site-header__logo-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="13" stroke="#FBF6EA" stroke-width="1.5" stroke-opacity="0.5"/>
                  <path d="M14 5 L14 5 C14 5 8 10.5 8 15.5 A6 6 0 0 0 20 15.5 C20 10.5 14 5 14 5Z"
                        fill="#FBF6EA" opacity="0.85"/>
                  <circle cx="14" cy="9.5" r="1.2" fill="#EEAFA1" opacity="0.9"/>
                </svg>
              </span>
              <span class="site-header__logo-text">5Gkyu</span>
            </a>
            ${siteLabel}
          </div>
          <nav class="site-header__nav" aria-label="グローバルナビゲーション">
            ${navItems.map(item =>
              `<a href="${item.href}" class="site-header__nav-link">${item.label}</a>`
            ).join('')}
            <a href="${contactHref}" class="site-header__contact">お問い合わせ</a>
          </nav>
        </div>
        <!-- 垂れ下がる葉っぱ（header_leaves.png を配置したら自動表示） -->
        <img
          class="site-header__leaves"
          src="header_leaves.png"
          alt=""
          aria-hidden="true"
          onload="this.classList.add('is-loaded')"
          onerror="this.style.display='none'"
        >
      </header>
    `;
  }
}


// ============================================================
// <site-footer> Custom Element
// 属性:
//   copy : コピーライト名（省略時 "5Gkyu"）
// ============================================================
class SiteFooter extends HTMLElement {
  connectedCallback() {
    const copyText = this.getAttribute('copy') || '5Gkyu';
    const year = new Date().getFullYear();

    this.innerHTML = `
      <footer class="site-footer fluffy-entry delay-3" role="contentinfo">
        <!-- フッター右に座るキャラクター（footer_chara.png を配置したら自動表示） -->
        <img
          class="site-footer__chara"
          src="footer_chara.png"
          alt=""
          aria-hidden="true"
          onload="this.classList.add('is-loaded')"
          onerror="this.style.display='none'"
        >
        <div class="site-footer__body">
          <div class="site-footer__grid">
            <div>
              <p class="site-footer__col-heading">ポリシー</p>
              <a href="policy.html" class="site-footer__col-link">サイトポリシー</a>
            </div>
            <div>
              <p class="site-footer__col-heading">SNS</p>
              <a href="https://x.com/5gkyu" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">🐦‍⬛ @5gkyu</a>
            </div>
            <div>
              <p class="site-footer__col-heading">サイト</p>
              <a href="https://5gkyu.github.io/KyuLink/?tag=Home" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">KyuLink</a>
              <a href="https://5gkyu.github.io/KyuLink/?tag=Contact" class="site-footer__col-link" target="_blank" rel="noopener noreferrer">お問い合わせ</a>
            </div>
            <div>
              <p class="site-footer__col-heading">クレジット</p>
              <p class="site-footer__col-link" style="cursor:default;opacity:0.45;">Design &amp; Illust</p>
              <p class="site-footer__col-link" style="cursor:default;">${copyText}</p>
            </div>
          </div>
          <div class="site-footer__bottom">
            <div class="site-footer__dots" aria-hidden="true">
              <span class="site-footer__dot"></span>
              <span class="site-footer__dot"></span>
              <span class="site-footer__dot"></span>
            </div>
            <p class="site-footer__copy">© ${year} ${copyText}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    `;
  }
}


customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
