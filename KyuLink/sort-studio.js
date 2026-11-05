/**
 * KyuLink 並び替えスタジオ (Sort Studio)
 * 4列前提特化: 横長スリムカードで画面内に50個以上を一望＆快適並び替え
 */

(function () {
  'use strict';

  let studioEl = null;
  let sortable = null;
  let currentTargetTag = null; // nullなら「全て」、'__notag__'ならタグなし、それ以外はタグ名
  let initialOrderIds = [];
  let hasChanges = false;

  // オートスクロール & ポインター制御用ステート
  let isDraggingInStudio = false;
  let autoScrollRaf = null;
  let autoScrollSpeed = 0;
  let lastPointerPos = { x: 0, y: 0 };

  // 本番と同一の主要タグデータ定義
  const PRIMARY_BUTTONS_DATA = [
    { id: '__all__', label: '全て', isSpecial: true },
    { id: '__notag__', label: 'タグなし', isSpecial: true },
    { id: 'Kyu', label: 'Kyu', imgUrl: 'https://5gkyu.github.io/icon/Fuka_icon.jpg' },
    { id: 'ブロスタ', label: 'ブロスタ', imgUrl: 'https://5gkyu.github.io/icon/Brawl.png' },
    { id: 'プロセカ', label: 'プロセカ', imgUrl: 'https://5gkyu.github.io/icon/page-grid-icon/crop_1791289331169.jpg' },
    { id: 'モンスト', label: 'モンスト', imgUrl: 'https://pbs.twimg.com/profile_images/2046049090723803136/dOoonFuu_400x400.png' },
    { id: 'ボカロ', label: 'ボカロ', imgUrl: 'https://pbs.twimg.com/profile_images/1509818267812364288/Y1EMCVdD_400x400.jpg' },
    { id: 'SNS', label: 'SNS', imgUrl: 'https://pbs.twimg.com/profile_images/1955359038532653056/OSHY3ewP_400x400.jpg' },
    { id: 'AI', label: 'AI', imgUrl: 'https://pbs.twimg.com/profile_images/1885410181409820672/ztsaR0JW_400x400.jpg' },
    { id: '素材', label: '素材', imgUrl: 'https://pbs.twimg.com/profile_images/1328114095183204352/CNPySvgE_400x400.jpg' },
    { id: 'Steam', label: 'Steam', imgUrl: 'https://www.google.com/s2/favicons?sz=128&domain=store.steampowered.com', bgWhite: true },
    { id: 'Google', label: 'Google', imgUrl: 'https://www.google.com/s2/favicons?sz=128&domain=google.com', bgWhite: true }
  ];

  // URLからドメインを抽出するヘルパー関数
  function extractDomain(urlStr) {
    if (!urlStr) return '';
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, '');
    } catch (_) {
      return '';
    }
  }

  // トースト表示
  function showToast(msg) {
    let toast = document.getElementById('sortStudioToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sortStudioToast';
      toast.className = 'sort-studio-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // ドラッグ中の画面端オートスクロール実行ループ
  function runStudioAutoScroll() {
    const mainEl = document.getElementById('studioMain');
    if (!isDraggingInStudio || !mainEl) {
      autoScrollRaf = null;
      autoScrollSpeed = 0;
      return;
    }
    if (autoScrollSpeed !== 0) {
      mainEl.scrollTop += autoScrollSpeed;
      if (lastPointerPos.x || lastPointerPos.y) {
        const moveEvt = new MouseEvent('mousemove', {
          clientX: lastPointerPos.x,
          clientY: lastPointerPos.y,
          bubbles: true
        });
        document.dispatchEvent(moveEvt);
      }
    }
    autoScrollRaf = requestAnimationFrame(runStudioAutoScroll);
  }

  // マウス移動監視（画面上端/下端への接近判定）
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingInStudio) return;
    lastPointerPos.x = e.clientX;
    lastPointerPos.y = e.clientY;

    const mainEl = document.getElementById('studioMain');
    if (!mainEl) return;
    const rect = mainEl.getBoundingClientRect();

    if (e.clientX < rect.left || e.clientX > rect.right) {
      autoScrollSpeed = 0;
      return;
    }

    const threshold = 120;
    const topDist = e.clientY - rect.top;
    const bottomDist = rect.bottom - e.clientY;

    if (topDist > 0 && topDist < threshold) {
      const factor = Math.max(0, (threshold - topDist) / threshold);
      autoScrollSpeed = -Math.round(4 + factor * 26);
      if (!autoScrollRaf) autoScrollRaf = requestAnimationFrame(runStudioAutoScroll);
    } else if (bottomDist > 0 && bottomDist < threshold) {
      const factor = Math.max(0, (threshold - bottomDist) / threshold);
      autoScrollSpeed = Math.round(4 + factor * 26);
      if (!autoScrollRaf) autoScrollRaf = requestAnimationFrame(runStudioAutoScroll);
    } else {
      autoScrollSpeed = 0;
    }
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    isDraggingInStudio = false;
    autoScrollSpeed = 0;
    if (autoScrollRaf) {
      cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = null;
    }
  });

  window.addEventListener('wheel', (e) => {
    if (!isDraggingInStudio) return;
    const mainEl = document.getElementById('studioMain');
    if (!mainEl) return;
    mainEl.scrollTop += e.deltaY;
    if (lastPointerPos.x || lastPointerPos.y) {
      const moveEvt = new MouseEvent('mousemove', {
        clientX: lastPointerPos.x,
        clientY: lastPointerPos.y,
        bubbles: true
      });
      document.dispatchEvent(moveEvt);
    }
  }, { passive: true });

  // スタジオUIの骨格を初期化
  function initStudioDOM() {
    if (document.getElementById('sortStudioOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sortStudioOverlay';
    overlay.innerHTML = `
      <div class="sort-studio-container" role="dialog" aria-modal="true" aria-label="並び替えスタジオ">
        <header class="sort-studio-header">
          <div class="sort-studio-title-group">
            <div class="sort-studio-title">
              <span>並び替えスタジオ</span>
              <span class="sort-studio-count-badge" id="studioCountBadge">0 件</span>
            </div>
            <div class="sort-studio-current-tag" id="studioCurrentTagBadge">対象: 全て</div>
          </div>

          <div class="sort-studio-search-wrap">
            <input type="text" id="studioSearchInput" class="sort-studio-search-input" placeholder="タイトル・URL・タグを検索..." autocomplete="off">
          </div>

          <div class="sort-studio-actions">
            <button class="sort-studio-btn btn-close" id="studioCloseBtn" title="閉じる (Esc)">閉じる ×</button>
          </div>
        </header>

        <div class="sort-studio-workspace">
          <!-- 左サイドバー（タグ選択メニュー） -->
          <aside class="sort-studio-sidebar" id="studioSidebar">
            <div class="sort-studio-sidebar-header">主要タグ</div>
            <div class="sort-studio-primary-tags" id="studioPrimaryTags"></div>

            <div class="sort-studio-sidebar-divider"></div>
            <div class="sort-studio-sidebar-subtitle">全タグ一覧</div>
            <div class="sort-studio-tag-list" id="studioTagList"></div>
          </aside>

          <!-- 右メイン領域（並び替えグリッド: 4列固定） -->
          <main class="sort-studio-main" id="studioMain">
            <div class="list layout-grid" id="studioGrid"></div>
          </main>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    studioEl = overlay;

    // オーバーレイ背景クリックで自動保存して閉じる
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeStudio();
      }
    });

    // 閉じるボタン (自動保存して閉じる)
    document.getElementById('studioCloseBtn').addEventListener('click', closeStudio);

    // インクリメンタル検索イベント
    const searchInput = document.getElementById('studioSearchInput');
    searchInput.addEventListener('input', handleStudioSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        handleStudioSearch();
        searchInput.blur();
      }
    });

    // キーボードショートカット (Esc で閉じる)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && studioEl.classList.contains('is-open')) {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.id === 'studioSearchInput' && activeEl.value) {
          // 検索入力がある場合は先に検索クリア
          return;
        }
        closeStudio();
      }
    });
  }

  // クイック検索処理 (非一致カードをディミング表示)
  function handleStudioSearch() {
    const searchInput = document.getElementById('studioSearchInput');
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const grid = document.getElementById('studioGrid');
    if (!grid) return;

    const rows = grid.querySelectorAll('.row');
    let matchCount = 0;

    rows.forEach(row => {
      if (!query) {
        row.classList.remove('is-dimmed');
        matchCount++;
      } else {
        const title = row.dataset.title || '';
        const url = row.dataset.url || '';
        const tags = row.dataset.tags || '';
        const isMatch = title.includes(query) || url.includes(query) || tags.includes(query);
        row.classList.toggle('is-dimmed', !isMatch);
        if (isMatch) matchCount++;
      }
    });

    const countBadge = document.getElementById('studioCountBadge');
    if (countBadge) {
      if (query) {
        countBadge.textContent = `${matchCount} / ${rows.length} 件`;
      } else {
        countBadge.textContent = `${rows.length} 件`;
      }
    }
  }

  // 左サイドバーのタグメニューをレンダリング
  function renderStudioSidebar(allData) {
    const primaryContainer = document.getElementById('studioPrimaryTags');
    const listContainer = document.getElementById('studioTagList');
    if (!primaryContainer || !listContainer) return;

    // 1. 主要タグのレンダリング
    primaryContainer.innerHTML = '';
    const fragPrimary = document.createDocumentFragment();

    PRIMARY_BUTTONS_DATA.forEach(btnInfo => {
      const btn = document.createElement('div');
      let isAct = false;

      if (btnInfo.isSpecial) {
        if (btnInfo.id === '__all__') isAct = (currentTargetTag === null);
        else if (btnInfo.id === '__notag__') isAct = (currentTargetTag === '__notag__');
      } else {
        isAct = (currentTargetTag === btnInfo.id);
      }

      let cls = 'sort-studio-tag-btn';
      if (btnInfo.isSpecial) cls += ' special';
      if (btnInfo.bgWhite) cls += ' bg-white';
      if (isAct) cls += ' active';
      btn.className = cls;

      if (btnInfo.imgUrl) {
        btn.style.setProperty('--tag-bg', `url('${btnInfo.imgUrl}')`);
      }
      btn.innerHTML = `<span class="tag-label">${btnInfo.label}</span>`;

      btn.addEventListener('click', () => {
        const nextTag = btnInfo.isSpecial ? (btnInfo.id === '__all__' ? null : '__notag__') : btnInfo.id;
        if (nextTag === currentTargetTag) return;
        if (hasChanges) {
          saveCurrentOrder();
        }
        openStudio(nextTag);
      });

      fragPrimary.appendChild(btn);
    });
    primaryContainer.appendChild(fragPrimary);

    // 2. 全タグ一覧のレンダリング
    listContainer.innerHTML = '';
    const allTagsMap = new Map();
    allData.forEach(d => {
      (d.tags || []).forEach(t => {
        allTagsMap.set(t, (allTagsMap.get(t) || 0) + 1);
      });
    });

    const sortedTags = Array.from(allTagsMap.keys()).sort((a, b) => a.localeCompare(b, 'ja'));
    const fragList = document.createDocumentFragment();

    sortedTags.forEach(tagName => {
      const count = allTagsMap.get(tagName);
      const item = document.createElement('div');
      const isAct = (currentTargetTag === tagName);
      item.className = 'sort-studio-tag-item' + (isAct ? ' active' : '');
      item.innerHTML = `
        <span class="sort-studio-tag-item-name">${tagName}</span>
        <span class="sort-studio-tag-item-count">${count}</span>
      `;

      item.addEventListener('click', () => {
        if (tagName === currentTargetTag) return;
        if (hasChanges) {
          saveCurrentOrder();
        }
        openStudio(tagName);
      });

      fragList.appendChild(item);
    });
    listContainer.appendChild(fragList);
  }

  // バッジとステータスの更新
  function updateOrderBadges() {
    const grid = document.getElementById('studioGrid');
    if (!grid) return;
    const rows = grid.querySelectorAll('.row');
    rows.forEach((row, idx) => {
      let badge = row.querySelector('.studio-order-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'studio-order-badge';
        row.insertBefore(badge, row.firstChild);
      }
      badge.textContent = `#${idx + 1}`;
    });

    // 変更の有無を確認
    const curIds = Array.from(rows).map(r => r.dataset.id);
    hasChanges = JSON.stringify(curIds) !== JSON.stringify(initialOrderIds);
  }

  // グリッド互換ミニカード要素を生成 (本番グリッドと同一の横長ワイドサムネイル比率)
  function createStudioCard(item) {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.id = String(item.id);
    row.dataset.title = (item.title || '').toLowerCase();
    row.dataset.url = (item.url || '').toLowerCase();
    row.dataset.tags = (item.tags || []).join(' ').toLowerCase();

    // 1. 順序バッジ (#1, #2... 左上にフロート)
    const badge = document.createElement('div');
    badge.className = 'studio-order-badge';
    badge.textContent = '#';

    // 2. 本番互換ワイドサムネイル領域 (icon-wrap)
    const iconWrap = document.createElement('div');
    iconWrap.className = 'icon-wrap';

    const heroSrc = item.og_image || item.icon_url;
    const fallbackSrc = item.favicon_url || item.icon_url || `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(item.url || '')}`;

    if (heroSrc) {
      const img = document.createElement('img');
      img.src = heroSrc;
      img.alt = item.title || 'アイコン';
      img.className = 'hero';
      img.loading = 'lazy';
      img.decoding = 'async';
      try { img.referrerPolicy = 'no-referrer'; } catch (_) { }

      img.addEventListener('load', () => {
        try {
          if (img.naturalWidth && img.naturalHeight) {
            const nw = img.naturalWidth;
            const nh = img.naturalHeight;
            const ratio = nw / nh;
            if (nw < 140 && nh < 140) {
              img.classList.add('small-badge');
              img.style.objectFit = 'contain';
              iconWrap.classList.remove('has-square-hero');
            } else if (ratio > 0.85 && ratio < 1.18) {
              img.classList.add('square');
              img.style.objectFit = 'contain';
              iconWrap.classList.add('has-square-hero');
            } else {
              img.classList.remove('square');
              img.classList.remove('small-badge');
              iconWrap.classList.remove('has-square-hero');
              img.style.objectFit = 'cover';
            }
          }
        } catch (_) { }
      });

      img.onerror = () => {
        img.remove();
        const f = document.createElement('img');
        f.className = 'fallback';
        f.src = fallbackSrc;
        f.alt = item.title || 'アイコン';
        f.onerror = () => {
          f.className = 'fallback grid-fallback';
          f.src = '/icon/404grid.png?v=2';
        };
        iconWrap.appendChild(f);
      };

      iconWrap.appendChild(img);
    } else {
      const f = document.createElement('img');
      f.className = 'fallback';
      f.src = fallbackSrc;
      f.alt = item.title || 'アイコン';
      f.onerror = () => {
        f.className = 'fallback grid-fallback';
        f.src = '/icon/404grid.png?v=2';
      };
      iconWrap.appendChild(f);
    }

    // 3. 下部メタ領域 (タイトル & ドメイン/タグ)
    const meta = document.createElement('div');
    meta.className = 'meta';

    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.textContent = item.title || '無題';
    titleEl.title = item.title || '';

    const descEl = document.createElement('div');
    descEl.className = 'desc';
    const domain = extractDomain(item.url);
    const tagList = (item.tags && item.tags.length) ? item.tags.slice(0, 2).join(', ') : '';
    let subText = domain;
    if (tagList) {
      subText = domain ? `${domain} ・ ${tagList}` : tagList;
    }
    descEl.textContent = subText || 'リンク';

    meta.appendChild(titleEl);
    meta.appendChild(descEl);

    // 4. クイック移動ボタン群 (ホバー時にサムネイル右上に表示: ⇤ ← → ⇥)
    const quickNav = document.createElement('div');
    quickNav.className = 'studio-quick-nav';
    quickNav.innerHTML = `
      <button class="studio-quick-btn" data-act="top" title="先頭へ移動">⇤</button>
      <button class="studio-quick-btn" data-act="prev" title="前へ移動">←</button>
      <button class="studio-quick-btn" data-act="next" title="後ろへ移動">→</button>
      <button class="studio-quick-btn" data-act="bottom" title="末尾へ移動">⇥</button>
    `;

    quickNav.addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.target.closest('.studio-quick-btn');
      if (!btn) return;
      const act = btn.dataset.act;
      const grid = document.getElementById('studioGrid');
      if (!grid) return;

      if (act === 'top') {
        grid.insertBefore(row, grid.firstChild);
      } else if (act === 'prev') {
        const prev = row.previousElementSibling;
        if (prev) grid.insertBefore(row, prev);
      } else if (act === 'next') {
        const next = row.nextElementSibling;
        if (next) grid.insertBefore(next, row);
      } else if (act === 'bottom') {
        grid.appendChild(row);
      }
      updateOrderBadges();
    });

    row.appendChild(badge);
    row.appendChild(iconWrap);
    row.appendChild(meta);
    row.appendChild(quickNav);

    return row;
  }

  // スタジオを開く
  function openStudio(targetTag = null) {
    initStudioDOM();

    // 権限チェック
    if (window.isReadOnlyMode) {
      alert('並び替えスタジオは管理者のみ利用可能です。');
      return;
    }

    const allData = window.DATA || [];
    if (!allData.length) {
      alert('データが読み込まれていません。');
      return;
    }

    // 初期ターゲットタグの決定
    if (targetTag !== null && targetTag !== undefined) {
      currentTargetTag = targetTag;
    } else if (window.state) {
      if (window.state.noTagFilter) {
        currentTargetTag = '__notag__';
      } else if (window.state.tags && window.state.tags.size > 0) {
        currentTargetTag = Array.from(window.state.tags)[0];
      } else {
        currentTargetTag = null;
      }
    } else {
      currentTargetTag = null;
    }

    // 検索入力をリセット
    const searchInput = document.getElementById('studioSearchInput');
    if (searchInput) searchInput.value = '';

    // 左サイドバーのタグ一覧を描画
    renderStudioSidebar(allData);

    // ヘッダーの対象タグバッジの更新
    const tagBadge = document.getElementById('studioCurrentTagBadge');
    if (tagBadge) {
      if (currentTargetTag === null) tagBadge.textContent = '対象: 全て';
      else if (currentTargetTag === '__notag__') tagBadge.textContent = '対象: タグなし';
      else tagBadge.textContent = `対象: ${currentTargetTag}`;
    }

    // 対象アイテムの抽出と並び順の決定
    let items = [];
    if (currentTargetTag === '__notag__') {
      items = allData.filter(d => !(d.tags && d.tags.length));
    } else if (currentTargetTag) {
      items = allData.filter(d => (d.tags || []).includes(currentTargetTag));
      const order = (window.TAG_ORDERS && window.TAG_ORDERS[currentTargetTag]) || [];
      if (order && order.length) {
        const idMap = new Map(order.map((id, idx) => [String(id), idx]));
        items.sort((a, b) => {
          const ia = idMap.has(String(a.id)) ? idMap.get(String(a.id)) : 999999;
          const ib = idMap.has(String(b.id)) ? idMap.get(String(b.id)) : 999999;
          return ia - ib;
        });
      }
    } else {
      items = [...allData];
    }

    // カウント表示
    const countBadge = document.getElementById('studioCountBadge');
    if (countBadge) countBadge.textContent = `${items.length} 件`;

    // グリッドコンテナの初期化
    const grid = document.getElementById('studioGrid');
    const mainEl = document.getElementById('studioMain');
    grid.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(item => {
      const card = createStudioCard(item);
      frag.appendChild(card);
    });
    grid.appendChild(frag);

    initialOrderIds = items.map(it => String(it.id));
    hasChanges = false;
    updateOrderBadges();

    // SortableJS の初期化
    if (sortable) {
      sortable.destroy();
      sortable = null;
    }
    if (typeof Sortable !== 'undefined') {
      sortable = Sortable.create(grid, {
        animation: 240,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        swapThreshold: 0.65,
        invertSwap: true,
        scroll: mainEl,
        scrollSensitivity: 140,
        scrollSpeed: 25,
        bubbleScroll: true,
        touchStartThreshold: 3,
        onStart: function (evt) {
          isDraggingInStudio = true;
          if (evt.originalEvent) {
            lastPointerPos.x = evt.originalEvent.clientX || 0;
            lastPointerPos.y = evt.originalEvent.clientY || 0;
          }
        },
        onEnd: function () {
          isDraggingInStudio = false;
          autoScrollSpeed = 0;
          if (autoScrollRaf) {
            cancelAnimationFrame(autoScrollRaf);
            autoScrollRaf = null;
          }
          updateOrderBadges();
        }
      });
    }

    studioEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  // 並び順を保存
  function saveCurrentOrder() {
    if (!hasChanges) return;
    const grid = document.getElementById('studioGrid');
    if (!grid) return;
    const rows = Array.from(grid.querySelectorAll('.row'));
    const newIds = rows.map(r => r.dataset.id);

    if (currentTargetTag && currentTargetTag !== '__notag__') {
      if (typeof window.setTagOrder === 'function') {
        window.setTagOrder(currentTargetTag, newIds);
      } else {
        if (!window.TAG_ORDERS) window.TAG_ORDERS = {};
        window.TAG_ORDERS[currentTargetTag] = newIds;
        if (typeof window._setCachedOrders === 'function') window._setCachedOrders(window.TAG_ORDERS);
        if (typeof window.saveTagOrdersToRemote === 'function') window.saveTagOrdersToRemote();
      }
    } else {
      if (typeof window.setGlobalOrder === 'function') {
        window.setGlobalOrder(newIds);
      } else {
        const idMap = new Map(newIds.map((id, idx) => [String(id), idx]));
        if (window.DATA) {
          window.DATA.sort((a, b) => {
            const ia = idMap.has(String(a.id)) ? idMap.get(String(a.id)) : 999999;
            const ib = idMap.has(String(b.id)) ? idMap.get(String(b.id)) : 999999;
            return ia - ib;
          });
        }
        if (typeof window.setLocalBookmarks === 'function') window.setLocalBookmarks(window.DATA);
        if (typeof window.saveBookmarksToRemote === 'function') window.saveBookmarksToRemote();
      }
    }

    if (typeof window.renderList === 'function') window.renderList();

    hasChanges = false;
    showToast('並び順を保存しました');
  }

  // スタジオを閉じる (閉じた時点で自動保存)
  function closeStudio() {
    // 変更があれば自動保存を実行
    if (hasChanges) {
      saveCurrentOrder();
    }

    // 本番画面の表示タグとソート状態を同期
    if (typeof window.selectTagInMain === 'function') {
      window.selectTagInMain(currentTargetTag);
    }

    isDraggingInStudio = false;
    autoScrollSpeed = 0;
    if (autoScrollRaf) {
      cancelAnimationFrame(autoScrollRaf);
      autoScrollRaf = null;
    }
    if (sortable) {
      sortable.destroy();
      sortable = null;
    }
    if (studioEl) {
      studioEl.classList.remove('is-open');
    }
    document.body.style.overflow = '';
  }

  // グローバル公開
  window.SortStudio = {
    open: openStudio,
    close: closeStudio
  };
})();
