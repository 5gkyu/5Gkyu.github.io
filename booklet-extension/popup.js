/**
 * Halcyon Bookmarklet Launcher - Popup Script
 * GitHub Pages上の bookmarklets-data.js と自動同期し、
 * ページのCSPセキュリティ制限を受けずにスクリプトを実行します。
 */

(() => {
  'use strict';

  // ── 設定 ──
  const GITHUB_DATA_URL = 'https://5gkyu.github.io/archive/other/booklet/bookmarklets-data.js';

  // ── DOM要素 ──
  const cardList = document.getElementById('cardList');
  const countBadge = document.getElementById('countBadge');
  const syncStatus = document.getElementById('syncStatus');
  const btnSync = document.getElementById('btnSync');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const tagBar = document.getElementById('tagBar');
  const emptyState = document.getElementById('emptyState');
  const toast = document.getElementById('toast');

  // ── 内部状態 ──
  let bookmarklets = [];
  let activeTag = 'すべて';
  let searchQuery = '';
  let toastTimer = null;

  // ── トースト通知 ──
  function showToast(message, isError = false, duration = 2200) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('toast-error', isError);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // ── 時刻フォーマット ──
  function formatTime(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // ── タグ一覧の生成と描画 ──
  function renderTags() {
    if (!tagBar) return;
    const tags = ['すべて', ...new Set(bookmarklets.map(b => b.tag).filter(Boolean))];

    tagBar.innerHTML = '';
    tags.forEach(tag => {
      const pill = document.createElement('button');
      pill.className = `tag-pill ${tag === activeTag ? 'active' : ''}`;
      pill.textContent = tag;
      pill.dataset.tag = tag;
      tagBar.appendChild(pill);
    });
  }

  // ── カード一覧の描画 ──
  function renderCards() {
    if (!cardList) return;
    cardList.innerHTML = '';

    const q = searchQuery.trim().toLowerCase();
    let visibleCount = 0;

    bookmarklets.forEach(bm => {
      const matchTag = activeTag === 'すべて' || bm.tag === activeTag;
      const matchSearch = !q ||
        (bm.title && bm.title.toLowerCase().includes(q)) ||
        (bm.description && bm.description.toLowerCase().includes(q)) ||
        (bm.tag && bm.tag.toLowerCase().includes(q)) ||
        (String(bm.num).includes(q));

      if (matchTag && matchSearch) {
        visibleCount++;
        const card = document.createElement('div');
        card.className = 'bm-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.title = `${bm.title} を実行`;

        card.innerHTML = `
          <div class="bm-card-body">
            <div class="bm-meta">
              <span class="bm-num">${bm.num || ''}</span>
              <span class="bm-tag">${escapeHtml(bm.tag || 'ツール')}</span>
            </div>
            <h2 class="bm-title">${escapeHtml(bm.title || '名称未設定')}</h2>
            <p class="bm-desc">${escapeHtml(bm.description || '')}</p>
          </div>
          <div class="bm-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        `;

        // クリック時・Enterキー押下時に実行
        const runAction = (e) => {
          e.preventDefault();
          executeBookmarklet(bm);
        };
        card.addEventListener('click', runAction);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') runAction(e);
        });

        cardList.appendChild(card);
      }
    });

    if (countBadge) {
      countBadge.textContent = `${visibleCount}件`;
    }
    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  // HTMLエスケープ
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── ブックマークレットの実行 ──
  async function executeBookmarklet(bm) {
    if (!bm || !bm.code) {
      showToast('実行可能なコードがありません', true);
      return;
    }

    try {
      // 1. 現在アクティブなタブを取得
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        showToast('対象のタブが見つかりません', true);
        return;
      }

      // 2. ブラウザ内部ページ（制限ページ）の検証
      if (tab.url && (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('https://chromewebstore.google.com')
      )) {
        showToast('ブラウザ内部ページでは実行できません', true, 3000);
        return;
      }

      // 3. javascript: プレフィックスの除去
      const rawCode = bm.code.replace(/^\s*javascript:/i, '').trim();

      // 4. chrome.scripting.executeScript によるWebページコンテキスト（world: 'MAIN'）への注入
      // CSP制限を完全にバイパスし、ページのグローバル変数やDOMを自在に操作可能
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: (codeToRun) => {
          try {
            const s = document.createElement('script');
            s.textContent = codeToRun;
            (document.head || document.documentElement || document.body).appendChild(s);
            s.remove();
          } catch (e) {
            // スクリプト要素注入が万が一遮断された場合のフォールバック
            (0, eval)(codeToRun);
          }
        },
        args: [rawCode]
      });

      showToast(`「${bm.title}」を実行しました`);

      // 実行後に少し余韻を持たせてからポップアップを閉じる
      setTimeout(() => {
        window.close();
      }, 700);

    } catch (err) {
      console.error('Bookmarklet execution failed:', err);
      showToast(`実行エラー: ${err.message || err}`, true, 3500);
    }
  }

  // ── GitHubから最新データを自動同期 ──
  async function syncFromGitHub(isManual = false) {
    if (btnSync) {
      btnSync.classList.add('is-spinning');
    }
    if (syncStatus) {
      syncStatus.textContent = isManual ? 'GitHubから最新データを取得中...' : '同期確認中...';
    }

    try {
      const response = await fetch(`${GITHUB_DATA_URL}?_=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();

      // bookmarklets-data.js から JSON 配列 [ ... ] を安全に抽出
      const startIdx = text.indexOf('[');
      const endIdx = text.lastIndexOf(']');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('データ配列の構文が見つかりません');
      }

      const jsonStr = text.substring(startIdx, endIdx + 1);
      const parsedData = JSON.parse(jsonStr);

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        bookmarklets = parsedData;
        const now = Date.now();

        // ローカルストレージにキャッシュ保存（次回起動時の高速化用）
        await chrome.storage.local.set({
          bookmarklets: parsedData,
          lastSync: now
        });

        renderTags();
        renderCards();

        if (syncStatus) {
          syncStatus.textContent = `GitHub同期: ${formatTime(now)}`;
        }
        if (isManual) {
          showToast(`最新データを取得しました（${parsedData.length}件）`);
        }
      } else {
        throw new Error('有効なデータが空です');
      }

    } catch (err) {
      console.warn('GitHub sync failed, using cached data if available:', err);
      if (syncStatus) {
        syncStatus.textContent = 'オフライン（キャッシュ表示中）';
      }
      if (isManual) {
        showToast('データの取得に失敗しました（通信環境を確認してください）', true);
      }
    } finally {
      if (btnSync) {
        btnSync.classList.remove('is-spinning');
      }
    }
  }

  // ── 初期化 ──
  async function init() {
    // 1. キャッシュから即時読み込み（待機時間ゼロでUIを表示）
    try {
      const cached = await chrome.storage.local.get(['bookmarklets', 'lastSync']);
      if (cached && Array.isArray(cached.bookmarklets) && cached.bookmarklets.length > 0) {
        bookmarklets = cached.bookmarklets;
        renderTags();
        renderCards();
        if (syncStatus && cached.lastSync) {
          syncStatus.textContent = `GitHub同期: ${formatTime(cached.lastSync)}`;
        }
      }
    } catch (e) {
      console.warn('Cache load error:', e);
    }

    // 2. バックグラウンドでGitHubから最新データを取得・同期
    syncFromGitHub(false);

    // 3. イベント登録
    // 手動同期ボタン
    if (btnSync) {
      btnSync.addEventListener('click', () => {
        syncFromGitHub(true);
      });
    }

    // 検索入力
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClear) {
          searchClear.classList.toggle('visible', searchQuery.length > 0);
        }
        renderCards();
      });
      // 自動フォーカス
      setTimeout(() => searchInput.focus(), 80);
    }

    // 検索クリアボタン
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchClear.classList.remove('visible');
        renderCards();
      });
    }

    // タグ切り替え
    if (tagBar) {
      tagBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.tag-pill');
        if (!pill) return;
        activeTag = pill.dataset.tag || 'すべて';
        document.querySelectorAll('.tag-pill').forEach(p => {
          p.classList.toggle('active', p.dataset.tag === activeTag);
        });
        renderCards();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
