/**
 * archive-loader.js
 * /archive/data.json を fetch して、カテゴリタブ・横長コンパクトリスト・タイル表示・リアルタイム検索・動的サイドバーTOCを提供する共通ローダー。
 *
 * 使い方:
 *   <div id="sections-container"></div>
 *   <script src="/components/components.js"></script>
 *   <script src="/archive/archive-loader.js"></script>
 *   <script>loadArchiveSections('app', 'sections-container');</script>
 */
(function () {
  'use strict';

  const DATA_URL = '/archive/data.json?v=' + Date.now();
  let _cache = null;

  async function fetchData() {
    if (_cache) return _cache;
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache = await res.json();
    return _cache;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function stripTags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  }

  // スタイルの注入（初回のみ）
  function injectStyles() {
    if (document.getElementById('archive-hub-styles')) return;

    const style = document.createElement('style');
    style.id = 'archive-hub-styles';
    style.textContent = `
      :root {
        --clr-cream: #FBF6EA;
        --clr-sage: #9AB08F;
        --clr-peach: #EEAFA1;
        --clr-dusty-blue: #92B5BC;
        --clr-brown: #6A564A;
        --clr-card-bg: rgba(255, 255, 255, 0.85);
        --clr-border: rgba(106, 86, 74, 0.12);
        --clr-border-hover: rgba(154, 176, 143, 0.5);
      }

      /* ツールバー */
      .archive-toolbar {
        display: flex;
        flex-direction: column;
        gap: 0.95rem;
        margin-bottom: 1.6rem;
      }

      .archive-toolbar__top {
        display: flex;
        gap: 0.8rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .archive-search-wrapper {
        position: relative;
        flex: 1;
        min-width: 240px;
      }

      .archive-search-input {
        width: 100%;
        padding: 0.65rem 2.4rem 0.65rem 2.4rem;
        border: 1.5px solid var(--clr-border);
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: var(--clr-brown);
        font-family: inherit;
        font-size: 0.88rem;
        outline: none;
        transition: all 0.25s ease;
      }
      .archive-search-input:focus {
        border-color: var(--clr-sage);
        background: #fff;
        box-shadow: 0 0 0 3px rgba(154, 176, 143, 0.22);
      }

      .archive-search-icon {
        position: absolute;
        left: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.45;
        pointer-events: none;
        display: flex;
        align-items: center;
      }

      .archive-search-clear {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--clr-brown);
        opacity: 0.4;
        cursor: pointer;
        font-size: 0.9rem;
        padding: 0.2rem 0.4rem;
        display: none;
      }
      .archive-search-clear:hover { opacity: 0.85; }

      /* ビュー切替トグル */
      .archive-view-toggle {
        display: flex;
        align-items: center;
        gap: 0.2rem;
        background: rgba(106, 86, 74, 0.07);
        padding: 0.22rem;
        border-radius: 50px;
        border: 1px solid var(--clr-border);
      }

      .archive-view-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.38rem 0.8rem;
        border: 1.5px solid #DFD9CE;
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.7);
        color: var(--clr-brown);
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 0 #C4BCAD;
        transition: all 0.12s ease;
        opacity: 0.75;
        font-family: inherit;
      }
      .archive-view-btn:active {
        transform: translateY(2px);
        box-shadow: 0 0 0 #C4BCAD;
      }
      .archive-view-btn svg { width: 14px; height: 14px; }
      .archive-view-btn.is-active {
        background: #4A3E3D;
        color: #fff;
        border-color: #4A3E3D;
        opacity: 1;
        box-shadow: 0 2px 0 #2E2524;
      }

      /* カテゴリタブ */
      .archive-category-tabs {
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .archive-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.85rem;
        border-radius: 50px;
        border: 1.5px solid #DFD9CE;
        background: rgba(255, 255, 255, 0.85);
        color: var(--clr-brown);
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 0 #C4BCAD;
        transition: all 0.14s ease;
        font-family: inherit;
      }
      .archive-tab-btn:hover {
        background: #fff;
        border-color: #EDE6D8;
        transform: translateY(-1px);
        box-shadow: 0 3px 0 #C4BCAD;
      }
      .archive-tab-btn:active {
        transform: translateY(2px);
        box-shadow: 0 0 0 #C4BCAD;
      }
      .archive-tab-btn.is-active {
        background: #4A3E3D;
        color: #fff;
        border-color: #4A3E3D;
        box-shadow: 0 2px 0 #2E2524;
      }
      .archive-tab-count {
        font-size: 0.72rem;
        opacity: 0.78;
        font-weight: 600;
        padding: 0.05rem 0.4rem;
        border-radius: 50px;
        background: rgba(106, 86, 74, 0.08);
      }
      .archive-tab-btn.is-active .archive-tab-count {
        background: rgba(255, 255, 255, 0.22);
        color: #fff;
      }

      /* ステータスバー（件数） */
      .archive-status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        color: var(--clr-brown);
        opacity: 0.65;
        font-weight: 700;
        margin-bottom: 1.2rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(106, 86, 74, 0.08);
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      /* ============================================================
         横長コンパクトリスト表示 (List Mode - キースイッチ仕様)
         ============================================================ */
      .archive-list-view {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .archive-list-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1.1rem;
        padding: 0.8rem 1.15rem;
        background: #FFFFFF;
        border: 2.5px solid #DFD9CE;
        border-radius: 16px;
        text-decoration: none;
        color: var(--clr-brown);
        /* 横長キーのしっかりとした立体ストローク */
        box-shadow:
          0 7px 0 #C4BCAD,
          0 10px 18px rgba(106, 86, 74, 0.12);
        transition: transform 0.16s cubic-bezier(0.18, 0.89, 0.32, 1.25), box-shadow 0.16s ease, border-color 0.16s ease, filter 0.08s ease;
        overflow: hidden;
        cursor: pointer;
      }
      .archive-list-card:hover {
        transform: translateY(-2px);
        background: #fff;
        border-color: #EDE6D8;
        box-shadow:
          0 9px 0 #C4BCAD,
          0 14px 24px rgba(106, 86, 74, 0.16);
      }
      /* クリック時の深い底打ち沈み込み */
      .archive-list-card:active {
        transform: translateY(7px);
        box-shadow:
          0 0 0 #C4BCAD,
          inset 0 3px 6px rgba(0, 0, 0, 0.1),
          0 2px 4px rgba(106, 86, 74, 0.2);
        filter: brightness(0.97);
        transition: transform 0.04s ease-in, box-shadow 0.04s ease-in, filter 0.04s ease-in;
      }

      /* スクロール移動時のハイライト演出 */
      .archive-list-card.is-highlighted,
      .archive-grid-card.is-highlighted {
        animation: card-pulse 1.6s ease-out;
      }

      @keyframes card-pulse {
        0% {
          border-color: var(--clr-peach);
          box-shadow: 0 0 0 4px rgba(238, 175, 161, 0.4), 0 8px 25px rgba(238, 175, 161, 0.3);
          transform: scale(1.02);
        }
        50% {
          border-color: var(--clr-sage);
          box-shadow: 0 0 0 3px rgba(154, 176, 143, 0.3);
          transform: scale(1.01);
        }
        100% {
          border-color: #DFD9CE;
          box-shadow: 0 7px 0 #C4BCAD, 0 10px 18px rgba(106, 86, 74, 0.12);
          transform: scale(1);
        }
      }

      .archive-list-card__thumb {
        flex-shrink: 0;
        width: 64px;
        height: 48px;
        border-radius: 10px;
        overflow: hidden;
        background: rgba(106, 86, 74, 0.06);
        border: 2px solid #EAE3D5;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .archive-list-card__thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }
      .archive-list-card:hover .archive-list-card__thumb img {
        transform: scale(1.08);
      }

      .archive-list-card__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .archive-list-card__header {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
      }

      .archive-list-card__title {
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--clr-brown);
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .archive-list-card__badge {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 0.12rem 0.5rem;
        border-radius: 50px;
        background: rgba(154, 176, 143, 0.18);
        color: var(--clr-sage);
        border: 1px solid rgba(154, 176, 143, 0.35);
        white-space: nowrap;
      }

      .archive-list-card__desc {
        font-size: 0.78rem;
        color: var(--clr-brown);
        opacity: 0.68;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .archive-list-card__arrow {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(106, 86, 74, 0.05);
        color: var(--clr-brown);
        opacity: 0.85;
        font-size: 0.9rem;
        border: 1.5px solid #DFD9CE;
        box-shadow: 0 2px 0 #C4BCAD;
        transition: all 0.15s ease;
      }
      .archive-list-card:hover .archive-list-card__arrow {
        background: #6E947A;
        color: #fff;
        border-color: #5A7E65;
        box-shadow: 0 1px 0 #46654F, 0 0 8px rgba(110, 148, 122, 0.4);
        transform: scale(1.06);
      }

      /* ============================================================
         コンパクトタイル表示 (Grid Mode - キースイッチ仕様)
         ============================================================ */
      .archive-grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.3rem;
      }

      .archive-grid-card {
        position: relative;
        display: flex;
        flex-direction: column;
        background: #FFFFFF;
        border: 3px solid #DFD9CE;
        border-radius: 18px;
        text-decoration: none;
        color: var(--clr-brown);
        overflow: hidden;
        /* キースイッチのしっかりとした前面の厚み */
        box-shadow:
          0 8px 0 #C4BCAD,
          0 12px 20px rgba(106, 86, 74, 0.14);
        transition: transform 0.16s cubic-bezier(0.18, 0.89, 0.32, 1.25), box-shadow 0.16s ease, border-color 0.16s ease, filter 0.08s ease;
        cursor: pointer;
      }
      .archive-grid-card:hover {
        transform: translateY(-3px);
        background: #fff;
        border-color: #EDE6D8;
        box-shadow:
          0 11px 0 #C4BCAD,
          0 16px 28px rgba(106, 86, 74, 0.18);
      }
      /* クリック時の深いキーストローク沈み込み（底打ちアクション） */
      .archive-grid-card:active {
        transform: translateY(8px);
        box-shadow:
          0 0 0 #C4BCAD,
          inset 0 4px 8px rgba(0, 0, 0, 0.12),
          0 2px 4px rgba(106, 86, 74, 0.2);
        filter: brightness(0.97);
        transition: transform 0.04s ease-in, box-shadow 0.04s ease-in, filter 0.04s ease-in;
      }

      .archive-grid-card__thumb {
        width: 100%;
        aspect-ratio: 2.2 / 1;
        overflow: hidden;
        background: rgba(106, 86, 74, 0.06);
        border-bottom: 2px solid #EAE3D5;
        position: relative;
      }
      /* サムネイル上端のキーキャップ光沢 */
      .archive-grid-card__thumb::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.6);
        z-index: 2;
        pointer-events: none;
      }
      .archive-grid-card__thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }
      .archive-grid-card:hover .archive-grid-card__thumb img {
        transform: scale(1.08);
      }

      .archive-grid-card__content {
        padding: 0.95rem 1.05rem;
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 0.4rem;
      }

      .archive-grid-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .archive-grid-card__title {
        font-size: 0.95rem;
        font-weight: 700;
        line-height: 1.4;
        color: var(--clr-brown);
      }

      .archive-grid-card__desc {
        font-size: 0.77rem;
        line-height: 1.48;
        color: var(--clr-brown);
        opacity: 0.68;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-top: auto;
      }

      .archive-empty-state {
        padding: 3.5rem 1rem;
        text-align: center;
        color: var(--clr-brown);
        opacity: 0.55;
        font-size: 0.92rem;
      }

      /* サイドバーTOCの件数バッジスタイル */
      .hl-toc__link-badge {
        font-size: 0.7rem;
        opacity: 0.65;
        font-weight: 600;
        margin-left: auto;
        padding: 0.05rem 0.45rem;
        border-radius: 50px;
        background: rgba(106, 86, 74, 0.08);
      }
      .hl-toc__link.is-active .hl-toc__link-badge {
        background: rgba(154, 176, 143, 0.25);
        color: var(--clr-sage);
        opacity: 1;
      }

      /* サイドバー戻るボタン */
      .hl-toc__back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--clr-sage);
        text-decoration: none;
        padding: 0.35rem 0.6rem;
        margin-bottom: 0.6rem;
        border-radius: 6px;
        background: rgba(154, 176, 143, 0.12);
        transition: all 0.2s ease;
      }
      .hl-toc__back-btn:hover {
        background: rgba(154, 176, 143, 0.22);
        color: var(--clr-brown);
        transform: translateX(-2px);
      }

      @media (max-width: 640px) {
        .archive-list-card {
          padding: 0.65rem 0.85rem;
          gap: 0.75rem;
        }
        .archive-list-card__thumb {
          width: 52px;
          height: 40px;
        }
        .archive-list-card__title {
          font-size: 0.88rem;
        }
        .archive-list-card__desc {
          display: none;
        }
        .archive-grid-view {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // メイン描画関数
  window.loadArchiveSections = async function (pageKey, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    injectStyles();

    try {
      const data = await fetchData();
      const pageData = data[pageKey];
      if (!pageData || !pageData.sections) {
        throw new Error(`Section data for "${pageKey}" not found`);
      }

      const sections = pageData.sections;
      let allItems = [];
      let categories = [];

      sections.forEach(sec => {
        const secId = sec.id || 'default';
        const rawHeading = sec.heading || secId;
        const cleanHeading = stripTags(rawHeading).trim() || rawHeading;

        categories.push({
          id: secId,
          name: cleanHeading,
          rawHeading: rawHeading,
          description: sec.description || ''
        });

        (sec.items || []).forEach((item, itemIdx) => {
          allItems.push({
            ...item,
            uniqueId: `card-${secId}-${itemIdx}`,
            categoryId: secId,
            categoryName: cleanHeading
          });
        });
      });

      // 状態管理
      let currentCategory = 'all';
      let currentQuery = '';
      let currentView = options.defaultView || 'list'; // デフォルトは横長リスト

      // ツールバーとコンテナのHTML構築
      container.innerHTML = `
        <div class="archive-toolbar">
          <div class="archive-toolbar__top">
            <!-- 検索入力 -->
            <div class="archive-search-wrapper">
              <span class="archive-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
                </svg>
              </span>
              <input type="search" class="archive-search-input" placeholder="タイトル・解説で検索…" autocomplete="off">
              <button class="archive-search-clear" aria-label="検索クリア">✕</button>
            </div>

            <!-- ビュー切替ボタン -->
            <div class="archive-view-toggle">
              <button class="archive-view-btn ${currentView === 'list' ? 'is-active' : ''}" data-view="list" title="横長リスト表示">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>
                </svg>
                リスト
              </button>
              <button class="archive-view-btn ${currentView === 'grid' ? 'is-active' : ''}" data-view="grid" title="タイル表示">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M104,40H48A16,16,0,0,0,32,56v56a16,16,0,0,0,16,16h56a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,72H48V56h56Zm104-72H152a16,16,0,0,0-16,16v56a16,16,0,0,0,16,16h56a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,72H152V56h56Zm-104,32H48a16,16,0,0,0-16,16v56a16,16,0,0,0,16,16h56a16,16,0,0,0,16-16V160A16,16,0,0,0,104,144Zm0,72H48V160h56Zm104-72H152a16,16,0,0,0-16,16v56a16,16,0,0,0,16,16h56a16,16,0,0,0,16-16V160A16,16,0,0,0,208,144Zm0,72H152V160h56Z"/>
                </svg>
                タイル
              </button>
            </div>
          </div>

          <!-- カテゴリタブ -->
          <div class="archive-category-tabs">
            <button class="archive-tab-btn is-active" data-cat="all">
              すべて <span class="archive-tab-count">${allItems.length}</span>
            </button>
            ${categories.map(cat => {
              const count = allItems.filter(i => i.categoryId === cat.id).length;
              return `
                <button class="archive-tab-btn" data-cat="${escapeHtml(cat.id)}">
                  ${escapeHtml(cat.name)} <span class="archive-tab-count">${count}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ステータスバー -->
        <div class="archive-status-bar">
          <span class="archive-results-count">全件表示中</span>
          <span class="archive-filter-label">すべて</span>
        </div>

        <!-- アイテム一覧コンテナ -->
        <div class="archive-items-container"></div>
      `;

      // 要素の取得
      const searchInput = container.querySelector('.archive-search-input');
      const searchClear = container.querySelector('.archive-search-clear');
      const countEl = container.querySelector('.archive-results-count');
      const filterLabelEl = container.querySelector('.archive-filter-label');
      const viewBtns = container.querySelectorAll('.archive-view-btn');
      const tabBtns = container.querySelectorAll('.archive-tab-btn');
      const itemsContainer = container.querySelector('.archive-items-container');

      // ============================================================
      // サイドバーの <hl-toc> と連携（動的コンテンツ連動）
      // ============================================================
      function setupSidebarToc() {
        const tocElement = document.querySelector('hl-toc');
        if (!tocElement) return;

        tocElement.dataset.customMode = 'true';
        tocElement.dataset.rendered = 'true';

        let titleText = 'Categories';
        let tocLinksHtml = '';

        if (currentCategory === 'all') {
          // 「すべて」選択時：カテゴリ一覧を表示
          titleText = 'Categories';
          tocLinksHtml += `
            <a href="#" class="hl-toc__link is-active" data-action="cat" data-cat="all">
              <span>すべて</span>
              <span class="hl-toc__link-badge">${allItems.length}</span>
            </a>
          `;

          categories.forEach(cat => {
            const count = allItems.filter(i => i.categoryId === cat.id).length;
            tocLinksHtml += `
              <a href="#" class="hl-toc__link" data-action="cat" data-cat="${escapeHtml(cat.id)}">
                <span>${escapeHtml(cat.name)}</span>
                <span class="hl-toc__link-badge">${count}</span>
              </a>
            `;
          });
        } else {
          // 特定カテゴリ選択時：そのカテゴリ内のツール/記事一覧を表示
          const matchedCat = categories.find(c => c.id === currentCategory);
          const catName = matchedCat ? matchedCat.name : currentCategory;
          const catItems = allItems.filter(i => i.categoryId === currentCategory);

          titleText = escapeHtml(catName);

          // 戻るボタン
          tocLinksHtml += `
            <a href="#" class="hl-toc__back-btn" data-action="cat" data-cat="all">
              ← すべてのカテゴリ
            </a>
          `;

          catItems.forEach(item => {
            tocLinksHtml += `
              <a href="#${item.uniqueId}" class="hl-toc__link" data-action="scroll" data-target="${item.uniqueId}">
                <span>${escapeHtml(item.title || '')}</span>
              </a>
            `;
          });
        }

        tocElement.innerHTML = `
          <div class="hl-sidebar-block" style="margin-bottom:0;">
            <div class="hl-sidebar-title">
              <span><img src="https://5gkyu.github.io/icon/content.svg" alt="" style="width:1em;height:1em;vertical-align:middle;display:inline-block;"></span>
              ${titleText}
            </div>
            <div class="hl-toc__list">${tocLinksHtml}</div>
          </div>
        `;

        // イベントデリゲーション
        tocElement.onclick = (e) => {
          const link = e.target.closest('[data-action]');
          if (!link) return;

          e.preventDefault();
          const action = link.dataset.action;

          if (action === 'cat') {
            const catId = link.dataset.cat;
            setCategory(catId);
          } else if (action === 'scroll') {
            const targetId = link.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              // スムーズスクロール
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // 一瞬ハイライト演出
              targetEl.classList.remove('is-highlighted');
              void targetEl.offsetWidth; // リフロー強制
              targetEl.classList.add('is-highlighted');
            }
          }
        };
      }

      function setCategory(catId) {
        currentCategory = catId;

        // 上部タブのアクティブ更新
        tabBtns.forEach(b => {
          b.classList.toggle('is-active', b.dataset.cat === currentCategory);
        });

        // サイドバーTOCの再描画
        setupSidebarToc();

        render();
      }

      function getFilteredItems() {
        return allItems.filter(item => {
          if (currentCategory !== 'all' && item.categoryId !== currentCategory) {
            return false;
          }
          if (currentQuery) {
            const q = currentQuery.toLowerCase();
            const matchTitle = (item.title || '').toLowerCase().includes(q);
            const matchDesc  = (item.description || '').toLowerCase().includes(q);
            const matchCat   = (item.categoryName || '').toLowerCase().includes(q);
            return matchTitle || matchDesc || matchCat;
          }
          return true;
        });
      }

      function render() {
        const filtered = getFilteredItems();

        countEl.textContent = `${filtered.length} 件表示中`;
        const filters = [];
        if (currentCategory !== 'all') {
          const matchedCat = categories.find(c => c.id === currentCategory);
          filters.push(`カテゴリ: ${matchedCat ? matchedCat.name : currentCategory}`);
        }
        if (currentQuery) filters.push(`検索: "${currentQuery}"`);
        filterLabelEl.textContent = filters.length > 0 ? filters.join(' / ') : 'すべて';

        if (filtered.length === 0) {
          itemsContainer.className = 'archive-items-container';
          itemsContainer.innerHTML = `
            <div class="archive-empty-state">
              該当する項目が見つかりませんでした。<br>
              <span style="font-size:0.8rem;opacity:0.7;">検索キーワードを変更してみてください。</span>
            </div>
          `;
          return;
        }

        if (currentView === 'list') {
          // 横長コンパクトリスト
          itemsContainer.className = 'archive-items-container archive-list-view';
          itemsContainer.innerHTML = filtered.map(item => {
            const imgUrl = item.image || 'https://5gkyu.github.io/icon/404grid.png';

            return `
              <a href="${escapeHtml(item.href || '#')}" id="${item.uniqueId}" class="archive-list-card">
                <div class="archive-list-card__thumb">
                  <img src="${escapeHtml(imgUrl)}" loading="lazy" decoding="async" alt="">
                </div>
                <div class="archive-list-card__body">
                  <div class="archive-list-card__header">
                    <h3 class="archive-list-card__title">${escapeHtml(item.title || '')}</h3>
                    <span class="archive-list-card__badge">${escapeHtml(item.categoryName || '')}</span>
                  </div>
                  <p class="archive-list-card__desc">${escapeHtml(item.description || '')}</p>
                </div>
                <div class="archive-list-card__arrow">→</div>
              </a>
            `;
          }).join('');
        } else {
          // コンパクトタイル
          itemsContainer.className = 'archive-items-container archive-grid-view';
          itemsContainer.innerHTML = filtered.map(item => {
            const imgUrl = item.image || 'https://5gkyu.github.io/icon/404grid.png';
            return `
              <a href="${escapeHtml(item.href || '#')}" id="${item.uniqueId}" class="archive-grid-card">
                <div class="archive-grid-card__thumb">
                  <img src="${escapeHtml(imgUrl)}" loading="lazy" decoding="async" alt="">
                </div>
                <div class="archive-grid-card__content">
                  <div class="archive-grid-card__header">
                    <span class="archive-list-card__badge">${escapeHtml(item.categoryName || '')}</span>
                  </div>
                  <h3 class="archive-grid-card__title">${escapeHtml(item.title || '')}</h3>
                  <p class="archive-grid-card__desc">${escapeHtml(item.description || '')}</p>
                </div>
              </a>
            `;
          }).join('');
        }
      }

      // イベントリスナー
      searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value.trim();
        searchClear.style.display = currentQuery ? 'block' : 'none';
        render();
      });

      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        currentQuery = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        render();
      });

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          setCategory(btn.dataset.cat);
        });
      });

      viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          viewBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          currentView = btn.dataset.view;
          render();
        });
      });

      // サイドバーTOCのセットアップと初回描画
      setupSidebarToc();
      render();

      // コンポーネント遅延ロード後の再上書き防止
      if (window.customElements) {
        customElements.whenDefined('hl-toc').then(() => {
          setupSidebarToc();
        });
      }

    } catch (err) {
      console.error('[archive-loader] Failed to load', DATA_URL, err);
      container.innerHTML = '<div class="archive-empty-state">データの取得に失敗しました。</div>';
    }
  };
})();
