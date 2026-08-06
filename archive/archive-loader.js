/**
 * archive-loader.js
 * /archive/data.json を fetch してセクション一覧を動的レンダリングするユーティリティ。
 *
 * 使い方:
 *   <div id="sections-container"></div>
 *   <script src="/archive/archive-loader.js"></script>
 *   <script>loadArchiveSections('app', 'sections-container');</script>
 *
 * /archive/data.json スキーマ:
 * {
 *   "app": {
 *     "sections": [
 *       {
 *         "id": "section-id",          // <section id="..."> に使用
 *         "heading": "<hl-icon name="image"></hl-icon> セクション名", // <section-heading> の中身
 *         "cols": 3,                   // <hl-card-grid cols="...">（省略時: 3）
 *         "items": [
 *           {
 *             "title": "タイトル",
 *             "tag": "タグ",
 *             "href": "/path/to/page/",
 *             "image": "https://example.com/ogp.png",  // 省略可
 *             "description": "説明文。"
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   "note": { "sections": [...] },
 *   "play": { "sections": [...] },
 *   "other": { "sections": [...] }
 * }
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

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderItem(item) {
    const imageAttr = item.image ? ` image="${escapeAttr(item.image)}"` : '';
    const href      = escapeAttr(item.href || '#');
    const title     = escapeAttr(item.title || '');
    const desc      = item.description || '';
    return `<hl-card title="${title}" href="${href}"${imageAttr}>${desc}</hl-card>`;
  }

  function renderSection(section) {
    const cols  = section.cols || 3;
    const items = (section.items || []).map(renderItem).join('\n        ');
    const id    = escapeAttr(section.id || '');
    const descHtml = section.description ? `\n      <p class="hl-content-text" style="margin-bottom: 1.5rem;">${escapeAttr(section.description)}</p>` : '';
    return `<section class="hl-section" id="${id}">
      <section-heading>${section.heading || ''}</section-heading>${descHtml}
      <hl-card-grid cols="${cols}">
        ${items}
      </hl-card-grid>
    </section>`;
  }

  window.loadArchiveSections = async function (pageKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
      const data = await fetchData();
      const page = data[pageKey];
      if (!page) throw new Error(`Key "${pageKey}" not found in data.json`);
      container.innerHTML = (page.sections || []).map(renderSection).join('\n\n      ');
      // Notify elements like <hl-toc> that content has been loaded
      window.dispatchEvent(new Event('halcyon-content-loaded'));
    } catch (err) {
      console.error('[archive-loader] Failed to load', DATA_URL, err);
    }
  };
})();
