/**
 * =============================================================
 * Halcyon Design System - Components Entry Point
 * =============================================================
 * 各コンポーネントは /components/src/ 配下に「1ファイル1コンポーネント」として
 * 整理・分割されています。
 * このエントリポイントにより、既存のHTMLはこれまで通り 1行 の記述で
 * 全コンポーネントを利用できます。
 */

(function loadHalcyonComponents() {
  // スクリプト自身の読み込み元URLから base URL を動的に特定
  let basePath = '/components/src/';
  const scriptEl = document.currentScript;
  if (scriptEl && scriptEl.src) {
    try {
      const url = new URL(scriptEl.src);
      basePath = new URL('./src/', url).href;
    } catch (e) {
      // フォールバック
    }
  }

  const modules = [
    // 基礎・基盤
    'base/utils.js',
    'base/base-style.js',
    'base/loading.js',
    'base/page-transition.js',

    // レイアウト系
    'layout/site-header.js',
    'layout/site-footer.js',
    'layout/page-title.js',
    'layout/section-heading.js',
    'layout/hl-layout.js',
    'layout/hl-breadcrumb.js',

    // サイドバー系
    'sidebar/hl-profile.js',
    'sidebar/hl-app-sheet.js',
    'sidebar/hl-sidebar-box.js',
    'sidebar/hl-toc.js',

    // 記事・コンテンツ系 (Note用)
    'content/hl-article.js',
    'content/hl-share.js',
    'content/hl-quote.js',
    'content/hl-chat.js',
    'content/hl-image.js',
    'content/hl-lead.js',
    'content/hl-figure.js',
    'content/hl-cite.js',
    'content/hl-footnotes.js',
    'content/hl-embed.js',
    'content/hl-compare.js',

    // 基本UIパーツ
    'ui/hl-icon.js',
    'ui/hl-card.js',
    'ui/hl-alert.js',
    'ui/hl-button.js',
    'ui/hl-code.js',
    'ui/hl-step.js',
    'ui/hl-table.js',
    'ui/hl-pagination.js',
    'ui/hl-skeleton.js',
    'ui/hl-divider.js',
    'ui/hl-avatar.js',
    'ui/hl-carousel.js',
    'ui/hl-chip.js',

    // インタラクション系
    'interactive/hl-accordion.js',
    'interactive/hl-tabs.js',
    'interactive/hl-modal.js',
    'interactive/hl-tooltip.js',
    'interactive/hl-popover.js',
    'interactive/hl-drawer.js',

    // フォーム部品群
    'forms/hl-input.js',
    'forms/hl-textarea.js',
    'forms/hl-select.js',
    'forms/hl-checkbox.js',
    'forms/hl-radio.js',
    'forms/hl-toggle.js',
    'forms/hl-slider.js',
    'forms/hl-file-input.js',

    // 拡張・ツール系
    'extensions/hl-archive-search.js',
    'extensions/hl-copy-box.js',
    'extensions/hl-gauge.js',
    'extensions/hl-before-after.js',
    'extensions/hl-tag-filter.js'
  ];

  // 全モジュールを並列ロード
  modules.forEach(mod => {
    const fullUrl = basePath.endsWith('/') ? basePath + mod : basePath + '/' + mod;
    import(fullUrl).catch(err => {
      console.warn(`[Halcyon] Failed to load component: ${mod}`, err);
    });
  });
})();