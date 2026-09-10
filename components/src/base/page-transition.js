/* ============================================================
   5. ページ遷移アニメーション＆bfcache対応
============================================================ */
(function initPageTransition() {
  const PAGE_TRANSITION_MS = 500;

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    const target = anchor.getAttribute('target');
    const hasDownload = anchor.hasAttribute('download');

    if (href && href.trim() !== '' && href !== '#' && !href.startsWith('#') && target !== '_blank' && !href.startsWith('javascript:') && !hasDownload) {
      e.preventDefault();
      const targetUrl = anchor.href;
      // 現在のURLと全く同じ場合（ハッシュ除く）はリロード防止のため実行しない
      if (targetUrl === window.location.href) return;
      document.body.classList.add('hl-page-fade-out');
      setTimeout(() => window.location.href = targetUrl, PAGE_TRANSITION_MS);
    }
  });

  // bfcache復元時（ブラウザバック・フォワード）に fade-out クラスと FOUC スタイルをリセット
  window.addEventListener('pageshow', (e) => {
    document.body.classList.remove('hl-page-fade-out');
    const foucStyle = document.getElementById('fouc-prevent');
    if (foucStyle) foucStyle.remove();
  });
})();
