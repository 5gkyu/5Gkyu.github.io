/**
 * =============================================================
 * Halcyon Design System - View Counter Component
 * =============================================================
 * GitHub Pages 等の静的サイト向けに、Firebase Realtime Database REST API を用いて
 * サイト全ページの累計閲覧数（合計PV）を自動集計・表示するコンポーネント。
 *
 * - components.js 経由で全ページに自動ロードされ、1セッション1ページにつき1回加算
 * - <hl-view-counter> タグを配置した箇所へ現在の合計閲覧数を表示
 */
(function () {
  if (window.__halcyonViewCounterLoaded) return;
  window.__halcyonViewCounterLoaded = true;

  // =============================================================
  // 新規 Firebase Realtime Database 接続先設定
  // 作成したプロジェクトの Realtime Database URL をここに入力してください
  // 例: 'https://your-project-id-default-rtdb.firebaseio.com'
  // =============================================================
  const FIREBASE_DATABASE_URL = 'https://hl-view-3ec0b-default-rtdb.firebaseio.com';
  const STATS_PATH = '/halcyonStats/totalViews.json';

  const DB_ENDPOINT = FIREBASE_DATABASE_URL
    ? FIREBASE_DATABASE_URL.replace(/\/+$/, '') + STATS_PATH
    : '';
  const SESSION_PREFIX = 'halcyon_viewed_v1:';

  let cachedTotal = null;
  let pendingPromise = null;

  // ローカル開発環境ではカウントを増やさず読み取りのみ行う
  function isLocalEnv() {
    const host = window.location.hostname;
    const proto = window.location.protocol;
    return proto === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '';
  }

  // 現在のページをこのセッション内で既にカウント済みか判定
  function hasViewedInSession() {
    try {
      const key = SESSION_PREFIX + window.location.pathname;
      return window.sessionStorage.getItem(key) === '1';
    } catch (_) {
      return false;
    }
  }

  function markViewedInSession() {
    try {
      const key = SESSION_PREFIX + window.location.pathname;
      window.sessionStorage.setItem(key, '1');
    } catch (_) {
      // sessionStorage 利用不可時は無視
    }
  }

  // 合計閲覧数を取得（必要時のみサーバー側でアトミックに +1）
  async function fetchAndRecordViews() {
    if (!DB_ENDPOINT) return null;
    if (cachedTotal !== null) return cachedTotal;
    if (pendingPromise) return pendingPromise;

    pendingPromise = (async () => {
      const shouldIncrement = !isLocalEnv() && !hasViewedInSession();

      if (shouldIncrement) {
        try {
          const putRes = await fetch(DB_ENDPOINT, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ '.sv': { increment: 1 } })
          });
          if (putRes.ok) {
            const val = await putRes.json();
            if (typeof val === 'number' && Number.isFinite(val)) {
              cachedTotal = val;
              markViewedInSession();
              return val;
            }
          }
        } catch (_) {
          // ネットワークエラー等は読み取りフォールバックへ
        }
      }

      try {
        const getRes = await fetch(DB_ENDPOINT, { cache: 'no-store' });
        if (getRes.ok) {
          const val = await getRes.json();
          if (typeof val === 'number' && Number.isFinite(val)) {
            cachedTotal = val;
            return val;
          }
        }
      } catch (_) {
        // 取得失敗時は null のまま
      }
      return null;
    })();

    return pendingPromise;
  }

  // ページ読み込み時点で自動集計を開始
  const initialRequest = fetchAndRecordViews();

  class HlViewCounter extends HTMLElement {
    connectedCallback() {
      if (this.dataset.rendered) return;
      this.dataset.rendered = 'true';

      const fallback = this.getAttribute('fallback') || '--';
      const pad = parseInt(this.getAttribute('pad') || '0', 10);
      const useComma = this.getAttribute('format') !== 'plain';

      this.textContent = fallback;

      initialRequest.then((total) => {
        if (typeof total !== 'number') return;
        let text = String(total);
        if (pad > 0) {
          text = text.padStart(pad, '0');
        } else if (useComma) {
          text = total.toLocaleString('ja-JP');
        }
        this.textContent = text;
        this.setAttribute('aria-label', `累計閲覧数 ${total}`);
      });
    }
  }

  if (!customElements.get('hl-view-counter')) {
    customElements.define('hl-view-counter', HlViewCounter);
  }

  window.HalcyonViewCounter = {
    getTotal: fetchAndRecordViews
  };
})();
