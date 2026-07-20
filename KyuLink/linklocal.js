
function toHiragana(str) {
  if (!str) return '';
  str = str.normalize('NFKC');
  let out = '';
  for (let ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 0x30A1 && code <= 0x30F4) { out += String.fromCharCode(code - 0x60); }
    else out += ch;
  }
  return out.toLowerCase();
}
function normalizeForSearch(s) { if (!s) return ''; return toHiragana(s).replace(/\s+/g, '').toLowerCase(); }

/* CSV parser removed (unused). Keep utilities small. */
function get404FallbackIconUrl(isGrid) {
  return isGrid ? 'https://5gkyu.github.io/icon/404grid.png' : 'https://5gkyu.github.io/icon/404list.png';
}

function show404FallbackIcon(iconWrap, isGrid, title) {
  if (!iconWrap) return;
  const img = document.createElement('img');
  img.src = get404FallbackIconUrl(isGrid);
  img.alt = title ? title + ' 画像なし' : '画像なし';
  if (isGrid) {
    // grid: fill the entire icon-wrap area like a hero image
    img.className = 'fallback grid-fallback';
  } else {
    img.className = 'fallback';
    img.width = 40;
    img.height = 40;
  }
  img.loading = 'lazy';
  img.decoding = 'async';
  try { img.referrerPolicy = 'no-referrer'; } catch (_) { }
  img.onerror = () => { img.remove(); };
  iconWrap.innerHTML = '';
  iconWrap.appendChild(img);
}

function faviconFromUrl(u, size = 64) {
  try { const url = new URL(u); return `https://www.google.com/s2/favicons?sz=${size}&domain=${url.hostname}`; } catch (e) { return '' }
}
function getImageProxy(imageUrl) {
  // Frontend policy: render images with their original URL during normal display.
  // Worker is reserved for metadata fetch on add/edit flows.
  if (!imageUrl || !imageUrl.trim()) return '';
  return imageUrl;
}
/**
 * Clean/normalize titles returned from OGP/oEmbed
 * - Trim surrounding whitespace
 * - Remove common site suffixes like " - YouTube", " | YouTube", "· YouTube"
 * - If result is empty or only contains site name, return null
 */
function cleanTitle(t) {
  if (!t) return null;
  try {
    let s = String(t).trim();
    // remove common separators and trailing site names
    s = s.replace(/^[\-\|\u00B7\s]+|[\-\|\u00B7\s]+$/g, '');
    // common patterns: "Title - YouTube", "Title | YouTube"
    s = s.replace(/\s+[\-\|\u00B7]\s+YouTube$/i, '');
    s = s.replace(/\s+[\-\|\u00B7]\s+Twitter$/i, '');
    s = s.replace(/\s+\|\s+Facebook$/i, '');
    s = s.trim();
    // if only contains 'YouTube' or host-like content, treat as empty
    if (/^youtube(?:\.com)?$/i.test(s) || /^www\.youtube\.com$/i.test(s) || s.length === 0) return null;
    return s || null;
  } catch (e) { return String(t).trim() || null; }
}

/* ------------------ state & dom refs ------------------ */
const VIEW_MODE_KEY = 'bookmark_view_mode_v1'; // localStorage キー
const SORT_KEY = 'bookmark_sort_v2';
// フォルダ機能は廃止されたため、関連する localStorage キーと定数は削除
const state = { q: '', tags: new Set(), sort: 'custom', editMode: false, viewMode: 'medium', selectedIds: new Set(), noTagFilter: false };
let _tagClickGuard = 0;
// in-memory bookmark storage (initialized empty; populated from remote or user actions)
let DATA = [];
let isReadOnlyMode = true; // Will be set to false if logged-in user is the owner
const el = {
  q: document.getElementById('q'),
  list: document.getElementById('list'),
  chipContainer: document.getElementById('chipContainer'),
  tagbar: document.getElementById('tagbar'),
  moreTagsBtn: document.getElementById('moreTagsBtn'),
  tagModal: document.getElementById('tagModal'),
  modalTags: document.getElementById('modalTags'),
  closeModal: document.getElementById('closeModal'),
  tagSearch: document.getElementById('tagSearch'),
  count: document.getElementById('count'),
  countText: document.getElementById('countText'),
  // sort control is now in hamburger menu (no #sort element in HTML)

  openAdd: document.getElementById('openAdd'),
  topOpenAdd: document.getElementById('topOpenAdd'),
  editModeBtn: document.getElementById('editModeBtn'),
  topEditModeBtn: document.getElementById('topEditModeBtn'),
  addModal: document.getElementById('addModal'),
  addUrl: document.getElementById('addUrl'),
  copyAddUrlBtn: document.getElementById('copyAddUrlBtn'),
  addTitleInput: document.getElementById('addTitleInput'),
  addIcon: document.getElementById('addIcon'),
  addGridImage: document.getElementById('addGridImage'),
  addListImage: document.getElementById('addListImage'),
  addDesc: document.getElementById('addDesc'),
  addTags: document.getElementById('addTags'),
  pasteUrlBtn: document.getElementById('pasteUrlBtn'),
  saveAdd: document.getElementById('saveAdd'),
  cancelAdd: document.getElementById('cancelAdd'),
  topDeleteSelectedBtn: document.getElementById('topDeleteSelectedBtn'),
  viewModeBtn: null,
  viewModeModal: null,
  viewModeCancel: null,
  viewModeSave: null,
  detailModal: document.getElementById('detailModal'),
  closeDetailModal: document.getElementById('closeDetailModal'),
  detailUrl: document.getElementById('detailUrl'),
  copyDetailUrlBtn: document.getElementById('copyDetailUrlBtn'),
  detailTitleText: document.getElementById('detailTitleText'),
  detailDesc: document.getElementById('detailDesc'),
  detailTags: document.getElementById('detailTags'),
  detailOpenLink: document.getElementById('detailOpenLink'),
  deleteInModal: document.getElementById('deleteInModal'),
  refreshImagesBtn: document.getElementById('refreshImagesBtn'),
  viewSizeSelect: document.getElementById('viewSizeSelect'),
  sortSelect: document.getElementById('sortSelect'),
  quickTagsContainer: document.getElementById('quickTagsContainer'),
  // Bottom navigation elements
  bottomNav: document.getElementById('bottomNav'),
  bottomSearchBtn: document.getElementById('bottomSearchBtn'),
  bottomTagsBtn: document.getElementById('bottomTagsBtn'),
  bottomAddBtn: document.getElementById('bottomAddBtn'),
  // Hub elements
  sidebarHubBtn: document.getElementById('sidebarHubBtn'),
  bottomHubBtn: document.getElementById('bottomHubBtn'),
  hubModal: document.getElementById('hubModal'),
  closeHubModal: document.getElementById('closeHubModal'),
  hubCreateBtn: document.getElementById('hubCreateBtn'),
  hubList: document.getElementById('hubList'),
  hubCreateModal: document.getElementById('hubCreateModal'),
  hubNameInput: document.getElementById('hubNameInput'),
  hubTextInput: document.getElementById('hubTextInput'),
  hubPasswordInput: document.getElementById('hubPasswordInput'),
  hubCreateCancel: document.getElementById('hubCreateCancel'),
  hubCreateSave: document.getElementById('hubCreateSave'),
  hubTextPasteBtn: document.getElementById('hubTextPasteBtn'),
  hubPasswordToggle: document.getElementById('hubPasswordToggle'),
  hubViewModal: document.getElementById('hubViewModal'),
  hubViewTitle: document.getElementById('hubViewTitle'),
  hubViewPasswordSection: document.getElementById('hubViewPasswordSection'),
  hubViewPasswordInput: document.getElementById('hubViewPasswordInput'),
  hubViewPasswordToggle: document.getElementById('hubViewPasswordToggle'),
  hubViewCancel: document.getElementById('hubViewCancel'),
  hubViewUnlock: document.getElementById('hubViewUnlock'),
  hubViewTextSection: document.getElementById('hubViewTextSection'),
  hubViewTextContent: document.getElementById('hubViewTextContent'),
  hubViewCopyBtn: document.getElementById('hubViewCopyBtn'),
  hubViewCloseBtn: document.getElementById('hubViewCloseBtn'),
  searchOverlay: document.getElementById('searchOverlay'),
  mobileSearchInput: document.getElementById('mobileSearchInput'),
  closeSearchOverlay: document.getElementById('closeSearchOverlay'),
  pasteJsonBtn: document.getElementById('pasteJsonBtn'),
  // Sidebar elements
  sidebar: document.getElementById('sidebar'),
  sidebarTagSearch: document.getElementById('sidebarTagSearch'),
  sidebarTags: document.getElementById('sidebarTags'),
  pinnedTags: document.getElementById('pinnedTags'),
  sidebarViewSize: document.getElementById('sidebarViewSize'),
  sidebarSort: document.getElementById('sidebarSort'),
  sidebarLayout: document.getElementById('sidebarLayout'),
  sidebarTheme: document.getElementById('sidebarTheme'),
  statTotal: document.getElementById('statTotal'),
  statTags: document.getElementById('statTags')
};

let TAG_ORDERS = {};
const STORAGE_KEY = 'bookmark_data_v1';
// If you run a local OGP proxy (see ogp-proxy-server), set its base URL here, e.g. 'http://localhost:3000'
// Default OGP proxy (hidden; no UI required). Set to deployed Worker.
const OGP_PROXY = 'https://ogp-proxy.kyu68002.workers.dev';
function getOgpProxy() { try { return (localStorage.getItem('ogp_proxy') || OGP_PROXY || '').toString(); } catch (e) { return OGP_PROXY || ''; } }

function unwrapProxyStoredUrl(v) {
  if (typeof v !== 'string') return v;
  const raw = v.trim();
  if (!raw) return raw;
  try {
    const u = new URL(raw, location.origin);
    const wrapped = u.searchParams.get('url');
    if (!wrapped) return raw;

    const proxy = (getOgpProxy() || '').trim();
    if (!proxy) return raw;

    let p;
    try { p = new URL(proxy); } catch (_) { return raw; }

    if (u.origin !== p.origin) return raw;
    const isImagePath = (u.pathname === '/img') || (u.pathname === (p.pathname + '/img')) || (u.pathname === p.pathname);
    if (!isImagePath) return raw;

    let out = wrapped;
    try { out = decodeURIComponent(out); } catch (_) { }
    if (!/^https?:\/\//i.test(out)) return raw;
    return out;
  } catch (e) {
    return raw;
  }
}

function migrateLegacyProxyImageUrls(items) {
  const src = Array.isArray(items) ? items : [];
  let changed = 0;
  const out = src.map(item => {
    if (!item || typeof item !== 'object') return item;
    const next = { ...item };
    let rowChanged = false;
    ['og_image', 'icon_url', 'favicon_url'].forEach((key) => {
      const nv = unwrapProxyStoredUrl(next[key]);
      if (nv !== next[key]) {
        next[key] = nv;
        rowChanged = true;
      }
    });
    if (rowChanged) {
      next.updated_at = Date.now();
      changed += 1;
    }
    return next;
  });
  return { items: out, changed };
}

function saveToStorage() {
  try {
    // ブックマーク関連はローカルに保存しない仕様に変更
    // ここでは UI 関連のレンダリングのみ行う（保存は行わない）
    try { DATA = dedupeData(DATA || []); } catch (e) { }

    console.log('saveToStorage: skipped writing bookmark_data_v1 to localStorage (UI-only mode)');
  } catch (e) { console.warn('saveToStorage (UI-only) error', e); }
}

// --- Modal scroll lock helpers ------------------------------------------------
let __savedModalScroll = null;
function lockScrollForModal() {
  try {
    __savedModalScroll = { x: window.scrollX || 0, y: window.scrollY || 0, listTop: (el.list ? el.list.scrollTop : 0) };
    const sb = window.innerWidth - document.documentElement.clientWidth;
    if (sb > 0) { document.body.style.paddingRight = sb + 'px'; }
    document.body.style.overflow = 'hidden';
  } catch (e) { console.warn('lockScrollForModal failed', e); }
}
function unlockScrollForModal() {
  try {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if (__savedModalScroll) {
      try { window.scrollTo(__savedModalScroll.x, __savedModalScroll.y); } catch (e) { }
      try { if (el.list) el.list.scrollTop = __savedModalScroll.listTop; } catch (e) { }
    }
  } catch (e) { console.warn('unlockScrollForModal failed', e); }
  __savedModalScroll = null;
}

// 正規化して比較用のキーを作る（簡易）
function normalizeUrlForCompare(u) {
  try {
    let s = (u || '').toString().trim();
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    const url = new URL(s);
    // 小文字化、末尾スラッシュ削除、ハッシュ除去
    url.hash = '';
    let path = url.pathname || '/';
    // remove trailing slash except when path is '/'
    if (path.length > 1 && path.endsWith('/')) path = path.replace(/\/+$/, '');
    // basic utm removal for common params
    url.searchParams.forEach((v, k) => { if (/^utm_/i.test(k)) url.searchParams.delete(k); });
    const norm = url.protocol + '//' + url.hostname.toLowerCase() + (path === '/' ? '' : path) + (url.search ? '?' + url.searchParams.toString() : '');
    return norm;
  } catch (e) { return (u || '').toString().trim(); }
}

// 配列内の重複 URL を除去する。先に出現するものを残す。
function dedupeData(arr) {
  const seen = new Set();
  const res = [];
  (arr || []).forEach(item => {
    const key = normalizeUrlForCompare(item.url || '');
    if (!key) return; // skip malformed
    if (seen.has(key)) return; // duplicate -> skip
    seen.add(key);
    res.push(item);
  });
  return res;
}
function loadFromStorage() {
  // ブックマークはローカルに保存しないため、読み込みは行わない
  return false;
}

// load and dedupe: called at init to ensure duplicates removed
function loadAndDedupeFromStorage() {
  // localStorage からブックマークをロードしない（UIのみローカル保持）
  return false;
}

// ------------------ Clipboard helpers & copy-button wiring ------------------
function copyTextToClipboard(text) {
  if (!text) return Promise.reject(new Error('empty'));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) resolve(); else reject(new Error('execCommand failed'));
    } catch (e) { reject(e); }
  });
}

function flashCopied(button) {
  if (!button) return;
  const orig = button.textContent;
  try { button.textContent = 'コピーしました'; button.disabled = true; }
  catch (e) { }
  setTimeout(() => { try { button.textContent = orig; button.disabled = false; } catch (e) { } }, 1600);
}

// attach listeners if elements exist
(function () {
  try {
    if (el.copyAddUrlBtn && el.addUrl) {
      el.copyAddUrlBtn.addEventListener('click', () => {
        const url = (el.addUrl && el.addUrl.value) ? el.addUrl.value.trim() : '';
        if (!url) return flashCopied(el.copyAddUrlBtn);
        copyTextToClipboard(url).then(() => flashCopied(el.copyAddUrlBtn)).catch(() => flashCopied(el.copyAddUrlBtn));
      });
    }

    if (el.copyDetailUrlBtn && el.detailUrl) {
      el.copyDetailUrlBtn.addEventListener('click', () => {
        const url = (el.detailUrl && el.detailUrl.textContent) ? el.detailUrl.textContent.trim() : '';
        if (!url) return flashCopied(el.copyDetailUrlBtn);
        copyTextToClipboard(url).then(() => flashCopied(el.copyDetailUrlBtn)).catch(() => flashCopied(el.copyDetailUrlBtn));
      });
    }
  } catch (e) { console.warn('copy button init error', e); }
})();

/* ------------------ タグ関連レンダリング ------------------ */
function buildAllTags(data) {
  return Array.from(new Set((data || []).flatMap(d => (d.tags || [])))).sort((a, b) => a.localeCompare(b, 'ja'));
}

function renderTags() {
  const all = buildAllTags(DATA);
  // Show all tags inline (previously limited to a preview of 8)
  const showN = all.length;
  try {
    if (el.chipContainer) {
      el.chipContainer.innerHTML = '';
      // 全て ボタン（タグなしの前）
      const allBtn = document.createElement('button');
      const isAllActive = !state.noTagFilter && state.tags.size === 0;
      allBtn.className = 'chip' + (isAllActive ? ' active' : '');
      allBtn.textContent = `全て (${(DATA || []).length})`;
      allBtn.addEventListener('click', () => { state.tags.clear(); state.noTagFilter = false; renderTags(); renderList(); renderSidebarTags(); });
      el.chipContainer.appendChild(allBtn);

      // タグなし チップ
      const noTagCount = (DATA || []).filter(d => !(d.tags && d.tags.length)).length;
      const noTagChip = document.createElement('button');
      noTagChip.className = 'chip' + (state.noTagFilter ? ' active' : '');
      noTagChip.textContent = `タグなし (${noTagCount})`;
      noTagChip.addEventListener('click', () => { state.noTagFilter = !state.noTagFilter; state.tags.clear(); renderTags(); renderList(); renderSidebarTags(); });
      el.chipContainer.appendChild(noTagChip);

      all.slice(0, showN).forEach(t => {
        const count = DATA.filter(d => (d.tags || []).includes(t)).length;
        const chip = document.createElement('button');
        chip.className = 'chip' + (state.tags.has(t) ? ' active' : '');
        chip.textContent = `${t} (${count})`;
        chip.addEventListener('click', (e) => { const _n = Date.now(); if (_n - _tagClickGuard < 350) { e.preventDefault(); return; } _tagClickGuard = _n; if (state.tags.has(t)) { state.tags.delete(t); } else { state.tags.clear(); state.tags.add(t); } state.noTagFilter = false; renderTags(); renderList(); renderSidebarTags(); });
        el.chipContainer.appendChild(chip);
      });
    }
    const remaining = Math.max(0, all.length - showN);
    if (el.moreTagsBtn) el.moreTagsBtn.textContent = remaining > 0 ? `タグ（あと ${remaining} 件）` : 'タグ';
    renderModalTags(all);
  } catch (e) { console.warn('renderTags error', e); }
}
function renderModalTags(all) {
  try {
    if (!el.modalTags) return;
    el.modalTags.innerHTML = '';
    // 全て ボタン（タグなしの前）
    const allBtn = document.createElement('button');
    const isAllActive = !state.noTagFilter && state.tags.size === 0;
    allBtn.className = 'chip' + (isAllActive ? ' active' : '');
    allBtn.textContent = `全て (${(DATA || []).length})`;
    allBtn.addEventListener('click', () => { state.tags.clear(); state.noTagFilter = false; renderModalTags(all); renderTags(); renderList(); renderSidebarTags(); });
    el.modalTags.appendChild(allBtn);

    // タグなし ボタンを先頭に追加
    const noTagCount = (DATA || []).filter(d => !(d.tags && d.tags.length)).length;
    const noTagBtn = document.createElement('button');
    noTagBtn.className = 'chip' + (state.noTagFilter ? ' active' : '');
    noTagBtn.textContent = `タグなし (${noTagCount})`;
    noTagBtn.addEventListener('click', () => { state.noTagFilter = !state.noTagFilter; state.tags.clear(); renderModalTags(all); renderTags(); renderList(); renderSidebarTags(); });
    el.modalTags.appendChild(noTagBtn);

    all.forEach(t => {
      const count = DATA.filter(d => (d.tags || []).includes(t)).length;
      const cb = document.createElement('button');
      cb.className = 'chip' + (state.tags.has(t) ? ' active' : '');
      cb.textContent = `${t} (${count})`;
      cb.addEventListener('click', (e) => { const _n = Date.now(); if (_n - _tagClickGuard < 350) { e.preventDefault(); return; } _tagClickGuard = _n; if (state.tags.has(t)) { state.tags.delete(t); } else { state.tags.clear(); state.tags.add(t); } state.noTagFilter = false; renderModalTags(all); renderTags(); renderList(); renderSidebarTags(); });
      el.modalTags.appendChild(cb);
    });
  } catch (e) { console.warn('renderModalTags error', e); }
}

/* ------------------ サイドバー ------------------ */
// タブレット/PCレイアウトとカラム数クラスを適用
// 実際の表示レイアウトを取得（モバイルなら強制リスト）
function getActiveLayout() {
  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
  if (isMobileViewport) return 'list';
  return localStorage.getItem('desktop_layout') || 'grid';
}

function applyGridLayout() {
  try {
    if (!el.list) return;
    const layout = getActiveLayout();
    const isGrid = layout === 'grid';
    el.list.classList.toggle('layout-grid', isGrid);
    // カラム数クラスを更新（タブレット/PC表示時のみ有効だが常に設定）
    el.list.classList.remove('cols-3', 'cols-4', 'cols-5', 'cols-6', 'cols-7');
    if (isGrid) {
      const cols = localStorage.getItem('grid_cols') || '4';
      el.list.classList.add('cols-' + cols);
    }
  } catch (e) { console.warn('applyGridLayout error', e); }
}

let lastRenderedLayout = null; // リサイズでレイアウトが変化したか検知するため

// カラム数設定行の表示/非表示を更新
function updateColsVisibility() {
  try {
    const layout = getActiveLayout();
    // スマホで強制リストになったなど、レイアウトが切り替わったら再描画
    if (lastRenderedLayout && lastRenderedLayout !== layout) {
      applyGridLayout();
      renderList();
    }

    // UIの表示制御（ユーザー設定は常に本来の設定値を基準にするか、現在のレイアウト基準にするか。ここでは実際レイアウトを基準にする）
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
    const isGrid = layout === 'grid';

    const sidebarRow = document.getElementById('sidebarColsRow');
    const settingsRow = document.getElementById('gridColsSettingRow');
    if (sidebarRow) sidebarRow.style.display = isGrid ? '' : 'none';
    if (settingsRow) settingsRow.style.display = (!isMobileViewport && isGrid) ? '' : 'none';
    // サイドバーの表示サイズ行はスマートフォンレイアウト時のみ表示
    const viewSizeRow = document.getElementById('sidebarViewSizeRow');
    if (viewSizeRow) viewSizeRow.style.display = isGrid ? 'none' : '';
    // ユーザー設定モーダル側の行を制御
    const settingsLayoutRow = document.getElementById('settingsLayoutRow');
    const settingsViewSizeRow = document.getElementById('settingsViewSizeRow');
    if (settingsLayoutRow) settingsLayoutRow.style.display = isMobileViewport ? 'none' : '';
    if (settingsViewSizeRow) settingsViewSizeRow.style.display = isGrid ? 'none' : '';
  } catch (e) { }
}

function renderSidebarTags() {
  try {
    const primaryContainer = document.getElementById('primaryTags');
    const mobilePrimaryContainer = document.getElementById('mobilePrimaryTags');

    // 主要なボタン群
    const buttonsData = [
      { id: 'all', label: '全て', isSpecial: true, action: () => { state.tags.clear(); state.noTagFilter = false; } },
      { id: 'notag', label: 'タグなし', isSpecial: true, action: () => { state.tags.clear(); state.noTagFilter = true; } },
      { id: 'kyu', label: 'Kyu', tagValue: 'Kyu', imgUrl: 'https://pbs.twimg.com/profile_images/2019552633665769472/Nybn41kH_400x400.jpg' },
      { id: 'brawlstars', label: 'ブロスタ', tagValue: 'ブロスタ', imgUrl: 'https://pbs.twimg.com/profile_images/2071888846371901441/TQ2kDIrd_400x400.jpg' },
      { id: 'proseka', label: 'プロセカ', tagValue: 'プロセカ', imgUrl: 'https://pbs.twimg.com/profile_images/1854064399478398976/W-uuO8DW_400x400.jpg' },
      { id: 'monst', label: 'モンスト', tagValue: 'モンスト', imgUrl: 'https://pbs.twimg.com/profile_images/2046049090723803136/dOoonFuu_400x400.png' },
      { id: 'vocalo', label: 'ボカロ', tagValue: 'ボカロ', imgUrl: 'https://pbs.twimg.com/profile_images/1509818267812364288/Y1EMCVdD_400x400.jpg' },
      { id: 'sns', label: 'SNS', tagValue: 'SNS', imgUrl: 'https://pbs.twimg.com/profile_images/1955359038532653056/OSHY3ewP_400x400.jpg' },
      { id: 'ai', label: 'AI', tagValue: 'AI', imgUrl: 'https://pbs.twimg.com/profile_images/1885410181409820672/ztsaR0JW_400x400.jpg' },
      { id: 'material', label: '素材', tagValue: '素材', imgUrl: 'https://pbs.twimg.com/profile_images/1328114095183204352/CNPySvgE_400x400.jpg' },
      { id: 'search', label: '検索エンジン', tagValue: '検索エンジン', imgUrl: 'https://pbs.twimg.com/profile_images/2042749771337564160/AgOFPEL3_400x400.jpg' },
      { id: 'live', label: '生配信', tagValue: '生配信', imgUrl: 'https://pbs.twimg.com/profile_images/1605211372585091073/p5dJeg51_400x400.jpg' }
    ];

    const renderToContainer = (container, baseClassName) => {
      if (!container) return;
      container.innerHTML = '';
      buttonsData.forEach(btnInfo => {
        const btn = document.createElement('div');

        let isActive = false;
        let count = 0;

        if (btnInfo.isSpecial) {
          if (btnInfo.id === 'all') {
            isActive = !state.noTagFilter && state.tags.size === 0;
            count = (DATA || []).length;
          } else if (btnInfo.id === 'notag') {
            isActive = state.noTagFilter;
            count = (DATA || []).filter(d => !(d.tags && d.tags.length)).length;
          }
        } else {
          isActive = state.tags.has(btnInfo.tagValue);
          count = DATA.filter(d => (d.tags || []).includes(btnInfo.tagValue)).length;
        }

        let cls = baseClassName;
        if (btnInfo.isSpecial) cls += ' special';
        if (isActive) cls += ' active';
        btn.className = cls;
        if (btnInfo.imgUrl) {
          btn.style.setProperty('--tag-bg', `url('${btnInfo.imgUrl}')`);
        }
        btn.innerHTML = `<span class="tag-label">${btnInfo.label}</span>`;

        btn.addEventListener('click', () => {
          const _n = Date.now(); if (_n - _tagClickGuard < 350) return; _tagClickGuard = _n;
          if (btnInfo.isSpecial) {
            btnInfo.action();
          } else {
            if (state.tags.has(btnInfo.tagValue)) { state.tags.delete(btnInfo.tagValue); }
            else { state.tags.clear(); state.tags.add(btnInfo.tagValue); }
            state.noTagFilter = false;
          }
          renderTags();
          renderList();
          renderSidebarTags();
          if (typeof closeAllModals === 'function') closeAllModals();
        });
        container.appendChild(btn);
      });
    };

    renderToContainer(primaryContainer, 'primary-tag-btn');
    renderToContainer(mobilePrimaryContainer, 'mobile-primary-tag-btn');
  } catch (e) { console.warn('renderSidebarTags error', e); }
}

function updateSidebarStats() {
  try {
    if (el.statTotal) el.statTotal.textContent = (DATA || []).length;
    if (el.statTags) el.statTags.textContent = buildAllTags(DATA).length;
  } catch (e) { }
}

function initSidebar() {
  try {
    // 「その他のタグ」ボタン
    const moreTagsBtn = document.getElementById('sidebarMoreTagsBtn');
    if (moreTagsBtn) {
      moreTagsBtn.addEventListener('click', () => {
        closeAllModals(); // すでにモーダルを開く関数がある前提
        if (el.tagModal) {
          el.tagModal.style.display = 'flex';
          document.body.classList.add('modal-tag-open');
          if (el.tagSearch) el.tagSearch.value = '';
        }
      });
    }

    // サイドバー表示サイズ
    if (el.sidebarViewSize) {
      el.sidebarViewSize.value = state.viewMode || 'medium';
      el.sidebarViewSize.addEventListener('change', (e) => {
        state.viewMode = e.target.value;
        saveViewMode();
        renderList();
        // 他のセレクトも同期
        if (el.viewSizeSelect) el.viewSizeSelect.value = e.target.value;
      });
    }

    // サイドバーソート
    if (el.sidebarSort) {
      el.sidebarSort.value = state.sort || 'custom';
      el.sidebarSort.addEventListener('change', (e) => {
        state.sort = e.target.value;
        saveSort();
        renderList();
        // 他のセレクトも同期
        if (el.sortSelect) el.sortSelect.value = e.target.value;
      });
    }

    // サイドバーレイアウト
    if (el.sidebarLayout) {
      const savedLayout = localStorage.getItem('desktop_layout') || 'grid';
      el.sidebarLayout.value = savedLayout;
      el.sidebarLayout.addEventListener('change', (e) => {
        const v = e.target.value === 'grid' ? 'grid' : 'list';
        localStorage.setItem('desktop_layout', v);
        // If switching to tablet/PC (grid), force view size to 'medium' first and re-render
        if (v === 'grid') {
          try {
            state.viewMode = 'medium'; saveViewMode(); updateViewModeUI();
            if (el.viewSizeSelect) el.viewSizeSelect.value = 'medium';
            const sidebarView = document.getElementById('sidebarViewSize'); if (sidebarView) sidebarView.value = 'medium';
            // ensure the list is re-rendered in medium size before applying grid layout
            renderList();
          } catch (_) { }
        }
        // Now apply the grid layout and re-render to reflect layout change
        applyGridLayout();
        renderList();
        // ユーザー設定モーダル内のセレクトも同期
        const desktopLayoutSelect = document.getElementById('desktopLayoutSelect');
        if (desktopLayoutSelect) desktopLayoutSelect.value = v;
        // カラム数設定の表示/非表示を更新
        updateColsVisibility();
      });
      // Wire up the new 1-click layout toggle buttons if present
      try {
        const btnPhone = document.getElementById('sidebarLayoutBtnPhone');
        const btnDesktop = document.getElementById('sidebarLayoutBtnDesktop');
        function setLayoutButtonsActive(v) {
          if (btnPhone) btnPhone.classList.toggle('active', v === 'list');
          if (btnDesktop) btnDesktop.classList.toggle('active', v === 'grid');
        }
        setLayoutButtonsActive(el.sidebarLayout.value || savedLayout);
        if (btnPhone) btnPhone.addEventListener('click', () => {
          el.sidebarLayout.value = 'list';
          setLayoutButtonsActive('list');
          el.sidebarLayout.dispatchEvent(new Event('change'));
        });
        if (btnDesktop) btnDesktop.addEventListener('click', () => {
          el.sidebarLayout.value = 'grid';
          setLayoutButtonsActive('grid');
          el.sidebarLayout.dispatchEvent(new Event('change'));
        });
      } catch (e) { /* ignore */ }
    }

    // サイドバーカラム数
    const sidebarCols = document.getElementById('sidebarCols');
    if (sidebarCols) {
      const savedCols = localStorage.getItem('grid_cols') || '4';
      sidebarCols.value = savedCols;
      sidebarCols.addEventListener('change', (e) => {
        localStorage.setItem('grid_cols', e.target.value);
        applyGridLayout();
        // ユーザー設定モーダル内のセレクトも同期
        const gridColsSelect = document.getElementById('gridColsSelect');
        if (gridColsSelect) gridColsSelect.value = e.target.value;
      });
    }
    updateColsVisibility();

    // サイドバーテーマ
    if (el.sidebarTheme) {
      const savedTheme = localStorage.getItem('app_theme') || 'awake';
      el.sidebarTheme.value = savedTheme;
      el.sidebarTheme.addEventListener('change', (e) => {
        if (typeof applyTheme === 'function') applyTheme(e.target.value);
        // ユーザー設定モーダル内のセレクトも同期
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = e.target.value;
      });
    }

    renderSidebarTags();
    updateSidebarStats();
  } catch (e) { console.warn('initSidebar error', e); }
}

/* ------------------ フィルタ・ソート・スマートフォン表示 ------------------ */
function filterAndSort() {
  const qn = normalizeForSearch(state.q);
  let arr = (DATA || []).filter(item => {
    const inName = normalizeForSearch(item.title).includes(qn);
    const inUrl = normalizeForSearch(item.url).includes(qn);
    const inDesc = normalizeForSearch(item.desc || '').includes(qn);
    const tagsMatch = state.noTagFilter ? (!(item.tags && item.tags.length)) : Array.from(state.tags).every(t => (item.tags || []).includes(t));
    return (qn === '' || inName || inUrl || inDesc) && tagsMatch;
  });

  let effectiveSort = state.sort;
  const isAllOrNoTag = (state.tags.size === 0 || state.noTagFilter);
  if (effectiveSort === 'custom' && isAllOrNoTag) {
    effectiveSort = 'date-new';
  }

  if (effectiveSort === 'custom') {
    // タグが1つの場合のみ、そのタグ専用の並び順 (TAG_ORDERS) を適用
    if (state.tags.size === 1) {
      const tag = Array.from(state.tags)[0];
      const order = TAG_ORDERS[tag] || [];
      arr.sort((a, b) => {
        const idxA = order.indexOf(a.id);
        const idxB = order.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        // どちらもオーダー未登録なら新着順
        return (b.created_at || 0) - (a.created_at || 0);
      });
    }
    return arr;
  }

  if (effectiveSort === 'alpha_en_asc' || effectiveSort === 'alpha_en_desc') {
    // English-first then Japanese ordering.
    function makeAlphaEnJaKey(s) {
      const t = (s || '').toString().trim();
      // presence of ASCII letter/digit -> treat as English group
      const hasLatin = /[A-Za-z0-9]/.test(t);
      if (hasLatin) {
        return '0' + t.toLowerCase();
      }
      // fallback: use hiragana-normalized key
      return '1' + toHiragana(t);
    }
    arr.sort((a, b) => {
      const ka = makeAlphaEnJaKey(a.title || '');
      const kb = makeAlphaEnJaKey(b.title || '');
      if (ka < kb) return -1;
      if (ka > kb) return 1;
      return 0;
    });
    if (effectiveSort === 'alpha_en_desc') arr.reverse();
  } else if (effectiveSort === 'date-new') {
    arr.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  } else if (effectiveSort === 'date-old') {
    arr.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
  }
  return arr;
}

let sortableInstance = null;
function renderList() {
  const arr = filterAndSort();
  el.list.innerHTML = '';
  if (el.countText) el.countText.textContent = `${arr.length} 件`;

  // 保存されたレイアウト設定を取得して適用
  const layout = getActiveLayout();
  lastRenderedLayout = layout;
  const isGridLayout = layout === 'grid';

  // 表示モードに応じて list 要素にクラスを付与（layout-gridを保持）
  // スマートフォン表示サイズクラスはタブレット/PCレイアウトに影響しないように分離
  el.list.className = 'list';
  if (!isGridLayout) {
    // スマートフォン表示時のみサイズクラスを適用
    if (state.viewMode === 'small') el.list.classList.add('list--small');
    else el.list.classList.add('list--medium');
  }

  // タブレット/PCレイアウトとカラム数を適用
  applyGridLayout();

  arr.forEach(item => {
    const row = document.createElement('div'); row.className = 'row';
    row.dataset.id = item.id;
    if (item.tags && item.tags.includes('Kyu')) { row.classList.add('kyu-special'); }

    const isAllOrNoTag = (state.tags.size === 0 || state.noTagFilter);
    const canCustomSort = state.sort === 'custom' && !isAllOrNoTag && state.tags.size === 1;
    if (state.editMode && canCustomSort && !isReadOnlyMode) {
      const handle = document.createElement('div');
      handle.className = 'drag-handle';
      handle.innerHTML = '≡';
      handle.style.cursor = 'grab';
      handle.style.padding = '0 10px';
      handle.style.fontSize = '1.2rem';
      handle.style.color = 'var(--muted)';
      handle.style.display = 'flex';
      handle.style.alignItems = 'center';
      row.appendChild(handle);
    }

    const iconWrap = document.createElement('div'); iconWrap.className = 'icon-wrap';
    // Show checkbox in edit mode if owner (Removed per user request)
    // 表示モード別のアイコン表示:
    // Grid layout: show OGP image (og_image) as hero, fallback to icon_url or favicon
    // List layout: show favicon (favicon_url) as small icon
    try {
      const isGrid = (el.list && el.list.classList && el.list.classList.contains('layout-grid'));
      if (isGrid) {
        // タブレット/PC表示: OGP画像を優先、なければicon_url、最後にファビコン
        const heroSrc = item.og_image || item.icon_url;
        if (heroSrc) {
          const img = document.createElement('img');
          img.src = heroSrc;
          img.alt = item.title + ' アイコン';
          img.className = 'hero';
          img.loading = 'lazy';
          img.decoding = 'async';
          try { img.referrerPolicy = 'no-referrer'; } catch (_) { }
          // If the loaded image is essentially square, show the entire square
          img.addEventListener('load', () => {
            try {
              if (img.naturalWidth && img.naturalHeight) {
                const ratio = img.naturalWidth / img.naturalHeight;
                if (ratio > 0.95 && ratio < 1.05) {
                  img.classList.add('square');
                  img.style.objectFit = 'contain';
                } else {
                  img.classList.remove('square');
                  img.style.objectFit = 'cover';
                }
              }
            } catch (_) { }
          });
          img.onerror = () => {
            // hero image failed -> remove and show fallback favicon
            img.remove();
            const f = document.createElement('img');
            f.className = 'fallback';
            const fSrc = item.favicon_url || item.icon_url || faviconFromUrl(item.url, 64);
            f.src = fSrc;
            f.alt = item.title ? item.title + ' ファビコン' : 'ファビコン';
            f.width = 64; f.height = 64;
            f.loading = 'lazy'; f.decoding = 'async';
            try { f.referrerPolicy = 'no-referrer'; } catch (_) { }
            f.onerror = () => { show404FallbackIcon(iconWrap, true, item.title); };
            iconWrap.appendChild(f);
          };
          iconWrap.appendChild(img);
        } else {
          // OGP画像もicon_urlもない場合はファビコン表示
          const img = document.createElement('img');
          const fSrc = item.favicon_url || item.icon_url || faviconFromUrl(item.url, 64);
          img.src = fSrc;
          img.alt = item.title ? item.title + ' ファビコン' : 'ファビコン';
          img.className = 'fallback';
          img.width = 64; img.height = 64;
          img.loading = 'lazy'; img.decoding = 'async';
          try { img.referrerPolicy = 'no-referrer'; } catch (_) { }
          img.onerror = () => { show404FallbackIcon(iconWrap, true, item.title); };
          iconWrap.appendChild(img);
        }
      } else {
        // スマートフォン表示: 必ずファビコンを表示（favicon_urlまたはGoogle s2）
        const img = document.createElement('img');
        const fSrc = item.favicon_url || faviconFromUrl(item.url, 64);
        img.src = fSrc;
        img.alt = item.title ? item.title + ' ファビコン' : 'ファビコン';
        img.className = 'fallback';
        img.width = 40; img.height = 40;
        img.loading = 'lazy'; img.decoding = 'async';
        try { img.referrerPolicy = 'no-referrer'; } catch (_) { }
        img.onerror = () => { show404FallbackIcon(iconWrap, false, item.title); };
        iconWrap.appendChild(img);
      }
    } catch (e) {
      // フォールバック: 必ずファビコンのみ
      try {
        const img = document.createElement('img');
        const fSrc = item.favicon_url || faviconFromUrl(item.url, 64);
        img.src = fSrc;
        img.alt = '';
        img.onerror = () => { show404FallbackIcon(iconWrap, isGridLayout, item.title); };
        iconWrap.appendChild(img);
      } catch (_) { }
    }

    const meta = document.createElement('div'); meta.className = 'meta';
    const title = document.createElement('div'); title.className = 'title'; title.textContent = item.title;
    // Show URL in edit mode if owner (Removed per user request)

    // 表示モード別のタイトル行: large モードではタイトルの左にファビコンを表示
    // large view disabled: use medium flow
    if (false) {
      const titleRow = document.createElement('div');
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';
      titleRow.style.gap = '8px';
      // favicon を小さく表示（OGP アイコンとは別にファビコン）
      const fav = document.createElement('img');
      fav.src = faviconFromUrl(item.url, 32);
      fav.alt = 'favicon';
      fav.style.width = '20px';
      fav.style.height = '20px';
      fav.style.borderRadius = '4px';
      fav.onerror = () => { fav.style.display = 'none'; };
      titleRow.appendChild(fav);
      titleRow.appendChild(title);
      // small モードでは desc と tags を生成しない（パフォーマンス重視）
      if (state.viewMode !== 'small') {
        const desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = item.desc || '';
        const tagsWrap = document.createElement('div'); tagsWrap.className = 'tags';
        (item.tags || []).slice().sort((a, b) => a.localeCompare(b, 'ja')).forEach(t => { const s = document.createElement('span'); s.className = 'tag'; s.textContent = t; tagsWrap.appendChild(s); });
        meta.appendChild(titleRow); meta.appendChild(desc); meta.appendChild(tagsWrap);
      } else {
        meta.appendChild(titleRow);
      }
    } else {
      // small / medium の既存フロー
      if (state.viewMode !== 'small') {
        const desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = item.desc || '';
        const tagsWrap = document.createElement('div'); tagsWrap.className = 'tags';
        (item.tags || []).slice().sort((a, b) => a.localeCompare(b, 'ja')).forEach(t => { const s = document.createElement('span'); s.className = 'tag'; s.textContent = t; tagsWrap.appendChild(s); });
        meta.appendChild(title); meta.appendChild(desc); meta.appendChild(tagsWrap);
      } else {
        meta.appendChild(title);
      }
    }

    const actions = document.createElement('div'); actions.className = 'actions';

    if (isReadOnlyMode) {
      // 一般ユーザー: 編集ボタンの代わりに詳細ボタンを表示（省スペース: '?'）
      const detailBtn = document.createElement('button');
      detailBtn.className = 'detail-btn';
      detailBtn.textContent = 'i';
      detailBtn.title = '詳細を表示';
      detailBtn.addEventListener('click', (e) => { e.stopPropagation(); openDetailModal(item); });
      actions.appendChild(detailBtn);
    } else {
      // Owner can edit: show edit/delete buttons
      if (!isReadOnlyMode) {
        if (!state.editMode) {
          // 編集モードではない時: 編集ボタンのみを表示
          const btn = document.createElement('button');
          btn.className = 'open-btn';
          btn.setAttribute('aria-label', item.title + ' を編集する');
          btn.textContent = '編集';
          btn.addEventListener('click', (e) => { e.stopPropagation(); openEdit(item); });
          actions.appendChild(btn);
        } else {
          // 編集モード時のカスタムソートはドラッグ＆ドロップで行うためボタンは表示しない
        }
      }
    }

    iconWrap.style.cursor = 'default';
    iconWrap.draggable = false;

    row.appendChild(iconWrap); row.appendChild(meta); row.appendChild(actions);
    // 行クリックの動作
    row.addEventListener('click', (e) => {
      // 編集モードであっても通常時と同じようにリンクを開く
      try {
        if (item && item.url) { window.open(item.url, '_blank', 'noopener'); }
      } catch (e) { }
    });
    el.list.appendChild(row);
  });

  if (arr.length === 0) {
    const isLoggedIn = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && firebase.auth && firebase.auth().currentUser;
    if (!isLoggedIn && isReadOnlyMode) {
      el.list.innerHTML = '<div style="color:var(--muted); padding:16px; text-align:center; word-break: keep-all;">データを表示するにはログインしてください。</div>';
    } else {
      el.list.innerHTML = '<div style="color:var(--muted); padding:16px; text-align:center;">該当するリンクがありません。</div>';
    }
  }

  // SortableJSの初期化
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
  const isAllOrNoTagSort = (state.tags.size === 0 || state.noTagFilter);
  const canCustomSortDrag = state.sort === 'custom' && !isAllOrNoTagSort && state.tags.size === 1;
  if (state.editMode && canCustomSortDrag && !isReadOnlyMode && typeof Sortable !== 'undefined') {
    sortableInstance = Sortable.create(el.list, {
      handle: '.drag-handle',
      animation: 150,
      forceFallback: true, // ネイティブドラッグを無効化し、マウスホイールを効くようにする
      scroll: true,
      bubbleScroll: true,
      scrollSensitivity: 80,
      scrollSpeed: 15,
      onEnd: function (evt) {
        const tag = Array.from(state.tags)[0];
        if (!TAG_ORDERS[tag]) {
          TAG_ORDERS[tag] = arr.map(item => item.id);
        }
        // DOMの順番通りにID配列を再構築する
        const newOrder = [];
        el.list.querySelectorAll('.row').forEach(row => {
          if (row.dataset.id) {
            newOrder.push(Number(row.dataset.id));
          }
        });
        TAG_ORDERS[tag] = newOrder;
        saveTagOrdersToRemote();
      }
    });
  }
}

// ----------------------------------------------------
// 並び替え処理 (上へ・下へ) - Drag and drop に移行したため削除
// ----------------------------------------------------

/* ------------------ 編集フロー ------------------ */
function openEdit(item) {
  openAddModal();
  el.addUrl.value = item.url;
  el.addTitleInput.value = item.title;
  el.addIcon.value = item.icon_url || '';
  if (el.addGridImage) el.addGridImage.value = item.og_image || '';
  if (el.addListImage) el.addListImage.value = item.favicon_url || item.icon_url || '';
  el.addDesc.value = item.desc || '';
  el.addTags.value = (item.tags || []).join(',');
  el.saveAdd.dataset.editId = item.id;
  try { if (el.deleteInModal) el.deleteInModal.style.display = 'inline-block'; } catch (e) { }
  try { if (el.refreshImagesBtn) el.refreshImagesBtn.style.display = 'inline-block'; } catch (e) { }
  // 既存タグに応じてクイックタグボタン状態を更新
  updateQuickTagButtons();
}

/* ------------------ 表示モード初期化 ------------------ */
function loadViewMode() {
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved) {
      if (['small', 'medium'].includes(saved)) state.viewMode = saved;
      else if (saved === 'large') state.viewMode = 'medium'; // fallback: large disabled
    }
  } catch (e) { console.warn('viewMode load failed', e); }
}
// saveViewMode defined earlier; keep single implementation

function loadSort() {
  try {
    const s = localStorage.getItem(SORT_KEY);
    if (s && typeof s === 'string') {
      state.sort = s;
    }
    // Sort UI is now in hamburger menu, updated dynamically when menu is created
  } catch (e) { console.warn('loadSort failed', e); }
}

function saveSort() {
  try { localStorage.setItem(SORT_KEY, state.sort); } catch (e) { }
}
function saveViewMode() {
  try { localStorage.setItem(VIEW_MODE_KEY, state.viewMode); } catch (e) { }
}
// Update header controls visibility based on edit mode and selection
function updateHeaderControls() {
  try {
    const hasSelection = (state.selectedIds && state.selectedIds.size > 0);
    if (el.topDeleteSelectedBtn) el.topDeleteSelectedBtn.style.display = (hasSelection || state.editMode) ? 'inline-block' : 'none';
    if (el.topOpenAdd) el.topOpenAdd.style.display = (hasSelection || state.editMode || isReadOnlyMode) ? 'none' : 'inline-block';
    // For the floating FAB use the owner-visible class. Hide it when selection exists or in read-only mode.
    if (el.openAdd) {
      if (hasSelection || isReadOnlyMode) el.openAdd.classList.remove('owner-visible');
      else el.openAdd.classList.add('owner-visible');
    }
    if (el.topEditModeBtn) el.topEditModeBtn.classList.toggle('active', state.editMode);
    if (el.editModeBtn) el.editModeBtn.classList.toggle('active', state.editMode);
  } catch (e) {/* ignore */ }
}

function updateViewModeUI() {
  const radios = document.querySelectorAll('.view-mode-menu input[type="radio"]');
  radios.forEach(r => {
    r.checked = (r.value === state.viewMode);
    const label = r.closest('.menu-radio');
    if (label) label.setAttribute('aria-checked', r.checked ? 'true' : 'false');
  });
}

/* ------------------ イベントワイヤリング ------------------ */
el.q.addEventListener('input', () => { state.q = el.q.value; renderList(); });
// Sort control is now in hamburger menu (createViewMenu function)

// 表示モード選択イベント: 旧メニューは削除。モーダルで選択します。

// Initialize view mode modal/button elements
setTimeout(() => {
  try {
    el.viewModeBtn = document.getElementById('viewModeBtn');
    el.viewModeModal = document.getElementById('viewModeModal');
    el.viewModeCancel = document.getElementById('viewModeCancel');
    el.viewModeSave = document.getElementById('viewModeSave');
    if (el.viewModeBtn) el.viewModeBtn.addEventListener('click', () => { try { lockScrollForModal(); } catch (e) { }; if (el.viewModeModal) el.viewModeModal.style.display = 'flex'; const radios = document.getElementsByName('vmode'); radios.forEach && radios.forEach(r => r.checked = (r.value === state.viewMode)); });
    if (el.viewModeCancel) el.viewModeCancel.addEventListener('click', () => { if (el.viewModeModal) el.viewModeModal.style.display = 'none'; try { unlockScrollForModal(); } catch (e) { } });
    if (el.viewModeSave) el.viewModeSave.addEventListener('click', () => {
      const radios = document.getElementsByName('vmode'); let sel = 'medium';
      for (let i = 0; i < radios.length; i++) { if (radios[i].checked) { sel = radios[i].value; break; } }
      // 'large' option was removed; no special fallback required
      state.viewMode = sel; saveViewMode(); updateViewModeUI(); renderList(); if (el.viewModeModal) el.viewModeModal.style.display = 'none'; try { unlockScrollForModal(); } catch (e) { }
    });
  } catch (e) { console.warn('viewMode modal init failed', e); }
}, 50);



// ハンバーガーの既定の動作は保持しますが、旧メニューは削除済みです。
const headerToggleBtn = document.getElementById('headerToggle');
if (headerToggleBtn) {
  headerToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); /* reserved */ });
}

function toggleEditMode() {
  if (isReadOnlyMode) {
    console.log('toggleEditMode: disabled in read-only mode');
    alert('編集権限がありません。オーナーとしてログインしてください。');
    return;
  }
  state.editMode = !state.editMode;
  document.body.classList.toggle('edit-mode', state.editMode);
  if (el.editModeBtn) el.editModeBtn.classList.toggle('active', state.editMode);
  if (el.topEditModeBtn) el.topEditModeBtn.classList.toggle('active', state.editMode);
  updateHeaderControls();
  renderList();
}
// Edit mode button (will be shown/hidden based on permissions)
if (el.editModeBtn) el.editModeBtn.addEventListener('click', toggleEditMode);
// Edit mode buttons (will be shown/hidden based on permissions)
if (el.topEditModeBtn) el.topEditModeBtn.addEventListener('click', toggleEditMode);
if (el.topDeleteSelectedBtn) el.topDeleteSelectedBtn.addEventListener('click', () => {
  if (!state.editMode) return;
  if (state.selectedIds.size === 0) { alert('削除対象が選択されていません'); return; }
  if (!confirm(`選択された ${state.selectedIds.size} 件を削除しますか？`)) return;
  // remove selected
  const ids = Array.from(state.selectedIds);
  DATA = DATA.filter(d => !ids.includes(d.id));
  state.selectedIds.clear();
  saveToStorage(); renderTags(); renderList(); renderSidebarTags(); updateSidebarStats();
  if (typeof saveBookmarksToRemote === 'function') saveBookmarksToRemote();
});
// View size select
if (el.viewSizeSelect) {
  el.viewSizeSelect.value = state.viewMode || 'medium';
  el.viewSizeSelect.addEventListener('change', (e) => {
    state.viewMode = e.target.value;
    saveViewMode();
    renderList();
    // サイドバーも同期
    if (el.sidebarViewSize) el.sidebarViewSize.value = e.target.value;
  });
}

// Sort select
if (el.sortSelect) {
  el.sortSelect.value = state.sort || 'alpha_en_asc';
  el.sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    saveSort();
    renderList();
    // サイドバーも同期
    if (el.sidebarSort) el.sidebarSort.value = e.target.value;
  });
}

// Add button listeners (will be shown/hidden based on permissions)
if (el.topOpenAdd) el.topOpenAdd.addEventListener('click', () => { if (!isReadOnlyMode) openAddModal(); });
if (el.openAdd) el.openAdd.addEventListener('click', () => { if (!isReadOnlyMode) openAddModal(); });
if (el.cancelAdd) el.cancelAdd.addEventListener('click', () => { closeAddModal(); });
if (el.addModal) el.addModal.addEventListener('click', (e) => {
  if (e.target === el.addModal) {
    // テキスト入力中はモーダル外クリックで閉じない
    const active = document.activeElement;
    if (active && el.addModal.contains(active) && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    closeAddModal();
  }
});
if (el.deleteInModal) el.deleteInModal.addEventListener('click', () => {
  try {
    const eid = el.saveAdd && el.saveAdd.dataset && el.saveAdd.dataset.editId ? Number(el.saveAdd.dataset.editId) : null;
    if (!eid) { alert('削除対象がありません'); return; }
    if (!confirm('このリンクを削除しますか？')) return;
    DATA = DATA.filter(d => d.id !== eid);
    delete el.saveAdd.dataset.editId;
    try { el.deleteInModal.style.display = 'none'; } catch (e) { }
    saveToStorage(); renderTags(); renderList(); renderSidebarTags(); updateSidebarStats(); closeAddModal();
    if (typeof saveBookmarksToRemote === 'function') saveBookmarksToRemote();
  } catch (e) { console.error('deleteInModal error', e); alert('削除に失敗しました'); }
});

// 画像更新ボタン: OGP画像とファビコンを再取得
if (el.refreshImagesBtn) el.refreshImagesBtn.addEventListener('click', async () => {
  try {
    const url = el.addUrl.value.trim();
    if (!url) { alert('URL を入力してください'); return; }

    el.refreshImagesBtn.disabled = true;
    el.refreshImagesBtn.textContent = '取得中...';

    // fetchTitleFromUrl を使って画像を再取得
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const proxy = getOgpProxy();

    let fetched = null;
    if (proxy && proxy.trim()) {
      const base = proxy.replace(/\/$/, '');
      try {
        const resp = await fetch(base + '?url=' + encodeURIComponent(targetUrl), {
          method: 'GET', mode: 'cors', redirect: 'follow', signal: controller.signal
        });
        clearTimeout(id);
        if (resp && resp.ok) {
          const json = await resp.json();
          if (json && json.ok && json.meta) {
            fetched = json.meta;
          }
        }
      } catch (e) { clearTimeout(id); console.warn('refreshImages fetch error', e); }
    }

    if (fetched) {
      // 取得した画像をモーダル内の該当欄に表示（ユーザーが確認できるように）
      if (fetched.image) {
        // legacy icon field (hidden) kept for compatibility
        try { if (el.addIcon) el.addIcon.value = fetched.image; } catch (_) { }
        // update grid/list specific modal inputs so user sees the new links immediately
        try { if (el.addGridImage) el.addGridImage.value = fetched.image; } catch (_) { }
      }
      if (fetched.favicon) {
        try { if (el.addListImage) el.addListImage.value = fetched.favicon; } catch (_) { }
      }
      // 編集中のアイテムを更新
      const eid = el.saveAdd && el.saveAdd.dataset && el.saveAdd.dataset.editId ? Number(el.saveAdd.dataset.editId) : null;
      if (eid) {
        const idx = DATA.findIndex(d => d.id === eid);
        if (idx !== -1) {
          if (fetched.image) DATA[idx].og_image = fetched.image;
          if (fetched.favicon) DATA[idx].favicon_url = fetched.favicon;
          // タイトルや説明も更新オプション
          if (fetched.title && !el.addTitleInput.value.trim()) {
            const cleaned = cleanTitle(fetched.title) || fetched.title;
            el.addTitleInput.value = cleaned;
            DATA[idx].title = cleaned;
          }
          if (fetched.description && !el.addDesc.value.trim()) {
            el.addDesc.value = fetched.description;
            DATA[idx].desc = fetched.description;
          }
        }
      }
      el.refreshImagesBtn.textContent = '✅ 更新完了';
      setTimeout(() => { if (el.refreshImagesBtn) el.refreshImagesBtn.textContent = '🔄 画像更新'; }, 2000);
    } else {
      el.refreshImagesBtn.textContent = '✖ 取得失敗';
      setTimeout(() => { if (el.refreshImagesBtn) el.refreshImagesBtn.textContent = '🔄 画像更新'; }, 2000);
    }

    el.refreshImagesBtn.disabled = false;
  } catch (e) {
    console.error('refreshImages error', e);
    el.refreshImagesBtn.disabled = false;
    el.refreshImagesBtn.textContent = '🔄 画像更新';
    alert('画像更新中にエラーが発生しました');
  }
});

if (el.moreTagsBtn) el.moreTagsBtn.addEventListener('click', () => { try { lockScrollForModal(); } catch (e) { }; if (el.tagModal) el.tagModal.style.display = 'flex'; document.body.classList.add('modal-tag-open'); try { if (el.tagSearch) { el.tagSearch.value = ''; } } catch (e) { } });
if (el.closeModal) el.closeModal.addEventListener('click', () => { if (el.tagModal) el.tagModal.style.display = 'none'; document.body.classList.remove('modal-tag-open'); try { unlockScrollForModal(); } catch (e) { }; setTimeout(adjustWrapForHeader, 50); });
if (el.tagModal) el.tagModal.addEventListener('click', (e) => { if (e.target === el.tagModal) { el.tagModal.style.display = 'none'; document.body.classList.remove('modal-tag-open'); try { unlockScrollForModal(); } catch (e) { }; setTimeout(adjustWrapForHeader, 50); } });
if (el.tagSearch) el.tagSearch.addEventListener('input', () => { const q = el.tagSearch.value.trim().toLowerCase(); const all = buildAllTags(DATA); const filtered = all.filter(t => t.toLowerCase().includes(q)); renderModalTags(filtered); });

// 直近で使用されたタグを追跡 (最大5つ)
let recentlyUsedTags = JSON.parse(localStorage.getItem('recentTags') || '[]');
function trackRecentTag(tag) {
  if (!tag) return;
  recentlyUsedTags = recentlyUsedTags.filter(t => t !== tag);
  recentlyUsedTags.unshift(tag);
  if (recentlyUsedTags.length > 5) recentlyUsedTags = recentlyUsedTags.slice(0, 5);
  localStorage.setItem('recentTags', JSON.stringify(recentlyUsedTags));
}

function renderQuickTags() {
  if (!el.quickTagsContainer) return;
  el.quickTagsContainer.innerHTML = '';
  const existingTags = buildAllTags(DATA);

  // datalistに全タグを追加（入力補完用）
  const datalist = document.getElementById('tagSuggestions');
  if (datalist) {
    datalist.innerHTML = '';
    existingTags.forEach(tag => {
      const opt = document.createElement('option');
      opt.value = tag;
      datalist.appendChild(opt);
    });
  }

  // 既存タグがない場合は表示しない
  if (existingTags.length === 0) return;

  // すべての既存タグをクリック可能なボタンとして表示
  existingTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'small-btn quick-tag-btn';
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      if (!el.addTags) return;
      const currentTags = el.addTags.value.split(',').map(t => t.trim()).filter(t => t);
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        el.addTags.value = currentTags.join(', ');
        btn.classList.add('active');
      } else {
        // すでにある場合は削除
        const idx = currentTags.indexOf(tag);
        if (idx > -1) currentTags.splice(idx, 1);
        el.addTags.value = currentTags.join(', ');
        btn.classList.remove('active');
      }
    });
    el.quickTagsContainer.appendChild(btn);
  });

  // 現在の入力値に応じてボタンの状態を更新
  updateQuickTagButtons();
}

function updateQuickTagButtons() {
  if (!el.quickTagsContainer || !el.addTags) return;
  const currentTags = el.addTags.value.split(',').map(t => t.trim()).filter(t => t);
  el.quickTagsContainer.querySelectorAll('.quick-tag-btn').forEach(btn => {
    if (currentTags.includes(btn.textContent)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function openAddModal() {
  // preserve scroll & prevent layout shift when modal opens
  lockScrollForModal();
  el.addModal.style.display = 'flex';
  try { document.body.classList.add('modal-add-open'); } catch (e) { }
  el.addUrl.value = ''; el.addTitleInput.value = ''; el.addIcon.value = '';
  if (el.addGridImage) el.addGridImage.value = '';
  if (el.addListImage) el.addListImage.value = '';
  el.addDesc.value = ''; el.addTags.value = '';
  delete el.saveAdd.dataset.editId;
  try { if (el.deleteInModal) el.deleteInModal.style.display = 'none'; } catch (e) { }
  try { if (el.refreshImagesBtn) el.refreshImagesBtn.style.display = 'none'; } catch (e) { }
  renderQuickTags();
  // 自動フォーカスは無効化（モバイルでキーボードが勝手に出るのを防止）
}
function closeAddModal() {
  try { document.body.classList.remove('modal-add-open'); } catch (e) { }
  el.addModal.style.display = 'none';
  // restore scroll position and remove temporary padding
  unlockScrollForModal();
}

// Prevent horizontal swipe gestures while add/edit modal is open (mobile)
; (function () {
  let startX = 0, startY = 0, active = false;
  function onTouchStart(e) {
    if (!document.body.classList.contains('modal-add-open')) return;
    const t = e.touches && e.touches[0]; if (!t) return;
    startX = t.clientX; startY = t.clientY; active = true;
  }
  function onTouchMove(e) {
    if (!active) return;
    const t = e.touches && e.touches[0]; if (!t) return;
    const dx = t.clientX - startX; const dy = t.clientY - startY;
    // If horizontal movement is dominant, prevent default to stop history-swipe/navigation
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      // preventDefault requires non-passive listener
      try { e.preventDefault(); e.stopPropagation(); } catch (err) { }
    }
  }
  function onTouchEnd(e) { active = false; }
  // attach listeners at capture on document to reliably intercept gestures
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
})();

/* ------------------ 詳細モーダル（閲覧のみ） ------------------ */
function openDetailModal(item) {
  if (!el.detailModal) return;
  try {
    // order: タイトル, URL, 説明, タグ
    el.detailTitleText.textContent = item.title || '（なし）';
    el.detailUrl.textContent = item.url || '（なし）';
    el.detailDesc.textContent = item.desc || '（なし）';
    el.detailTags.textContent = (item.tags && item.tags.length) ? item.tags.join(', ') : '（なし）';
    if (item.url) { el.detailOpenLink.href = item.url; el.detailOpenLink.style.display = ''; } else { el.detailOpenLink.style.display = 'none'; }
  } catch (e) { console.warn('openDetailModal error', e); }
  // preserve scroll & prevent layout shift when modal opens
  lockScrollForModal();
  el.detailModal.style.display = 'flex';
  try { document.body.classList.add('modal-detail-open'); } catch (e) { }
}
function closeDetailModal() { if (!el.detailModal) return; try { document.body.classList.remove('modal-detail-open'); } catch (e) { }; el.detailModal.style.display = 'none'; unlockScrollForModal(); }
if (el.closeDetailModal) el.closeDetailModal.addEventListener('click', closeDetailModal);
if (el.detailModal) el.detailModal.addEventListener('click', (e) => { if (e.target === el.detailModal) closeDetailModal(); });

/* export/import JSON UI removed */

/* JSON import/export feature removed (unused). */

el.pasteUrlBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text.trim()) el.addUrl.value = text.trim();
  } catch (err) {
    console.warn('クリップボード読み込みに失敗: ', err);
    alert('クリップボードからの読み込みに失敗しました。手動で貼り付けてください。');
  }
});

/* save/add bookmark: ここに saveBookmarksToRemote() 呼び出しを追加 */
// save/add bookmark: try to fetch page title when title input is empty
el.saveAdd.addEventListener('click', async () => {
  const url = el.addUrl.value.trim();
  if (!url) { alert('URL は必須です'); return; }

  // Debug: log initial input state
  try { console.debug('[saveAdd] initial input url:', el.addUrl.value, ' initial title input:', el.addTitleInput.value); } catch (e) { }

  let title = el.addTitleInput.value.trim();

  async function fetchTitleFromUrl(u) {
    try {
      // 正規化: スキームが無ければ https:// を付与して absolute URL にする
      let targetUrl = (u || '').toString().trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }
      // quick validate
      try { new URL(targetUrl); } catch (e) { return null; }
      // try using configured proxy first, supporting both '/fetch?url=' and '?url=' styles,
      // then fall back to direct fetch if proxy is not set or fails.
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const proxy = getOgpProxy();
      async function tryFetchReturnResponse(url) {
        try {
          const r = await fetch(url, { method: 'GET', mode: 'cors', redirect: 'follow', signal: controller.signal });
          if (!r || !r.ok) return null;
          return r;
        } catch (e) { return null; }
      }

      let resp = null;
      // Debug: log which proxy/base will be used
      try { console.debug('[fetchTitleFromUrl] using proxy:', proxy, ' target:', targetUrl); } catch (e) { }
      if (proxy && proxy.trim()) {
        const base = proxy.replace(/\/$/, '');
        // try worker-style query first
        resp = await tryFetchReturnResponse(base + '?url=' + encodeURIComponent(targetUrl)) || await tryFetchReturnResponse(base + '/fetch?url=' + encodeURIComponent(targetUrl));
        try { if (resp) console.debug('[fetchTitleFromUrl] proxy response status:', resp.status, resp.statusText); } catch (e) { }
      }
      if (!resp) {
        // Do NOT fall back to direct fetch from browser to avoid CORB/CORS issues.
        // If proxy failed or is not set, return null so caller can handle fallback.
        clearTimeout(id);
        return null;
      }
      clearTimeout(id);

      // If proxy/endpoint returned JSON (OGP-only Worker), parse it
      const contentType = (resp.headers && resp.headers.get) ? (resp.headers.get('content-type') || '') : '';
      // デバッグログ: レスポンスの Content-Type を出力
      try { console.debug('[fetchTitleFromUrl] resp content-type:', contentType, ' for ', u); } catch (e) { }
      try {
        if (contentType.includes('application/json')) {
          // JSON 応答をログ（大きすぎないよう先頭のみ）
          const txt = await resp.clone().text();
          try { console.debug('[fetchTitleFromUrl] json response:', txt.slice(0, 1000)); } catch (e) { }
          const json = JSON.parse(txt);
          try { console.debug('[fetchTitleFromUrl] parsed json:', json && json.ok ? json.meta : json); } catch (e) { }
          if (json && json.ok && json.meta) {
            const t = cleanTitle(json.meta.title) || json.meta.title || null;
            return { title: t, description: json.meta.description || null, image: json.meta.image || null, favicon: json.meta.favicon || null };
          }
        }
      } catch (e) { console.debug('[fetchTitleFromUrl] json parse failed', e); /* not json or parse failed, fallback to text parsing */ }

      // Fallback: treat response as HTML text and parse for meta tags
      try {
        const text = await resp.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        // collect og:title, og:description, og:image (also check name variants)
        const getMeta = (sel) => {
          const el = doc.querySelector(sel) || doc.querySelector(sel.replace('property', 'name'));
          if (!el) return null;
          return el.getAttribute('content') || el.getAttribute('value') || el.textContent || null;
        };
        const ogTitle = getMeta('meta[property="og:title"]') || getMeta('meta[name="twitter:title"]');
        const ogDesc = getMeta('meta[property="og:description"]') || getMeta('meta[name="description"]') || getMeta('meta[name="twitter:description"]');
        const ogImage = getMeta('meta[property="og:image"]') || getMeta('meta[name="twitter:image"]');
        // Get favicon from link elements
        const faviconEl = doc.querySelector('link[rel="icon"]') || doc.querySelector('link[rel="shortcut icon"]') || doc.querySelector('link[rel="apple-touch-icon"]');
        const faviconHref = faviconEl ? faviconEl.getAttribute('href') : null;
        const title = (ogTitle && ogTitle.trim()) || (doc.querySelector('title') && doc.querySelector('title').textContent.trim()) || null;
        return { title: title, description: ogDesc ? ('' + ogDesc).trim() : null, image: ogImage ? ('' + ogImage).trim() : null, favicon: faviconHref ? ('' + faviconHref).trim() : null };
      } catch (e) { /* parse error */ }
      return null;
    } catch (e) { return null; }
  }

  // If fetchTitleFromUrl returned null for title but URL is a known provider (YouTube),
  // try a public oEmbed-like fallback (noembed.com) to get title/thumbnail.
  try {
    const host = (new URL(targetUrl)).hostname.toLowerCase();
    const providerHosts = ['youtube.com', 'www.youtube.com', 'youtu.be'];
    if (providerHosts.includes(host) || providerHosts.some(h => host.endsWith('.' + h))) {
      try {
        const oe = await fetch('https://noembed.com/embed?url=' + encodeURIComponent(targetUrl), { method: 'GET', mode: 'cors' });
        if (oe && oe.ok) {
          const j = await oe.json();
          // noembed returns { title, author_name, thumbnail_url, ... }
          return { title: j.title || null, description: j.author_name || null, image: j.thumbnail_url || null };
        }
      } catch (e) { /* ignore noembed errors */ }
    }
  } catch (e) { /* ignore */ }

  // only attempt fetch when title is empty
  let fetched = null;
  if (!title) {
    try { fetched = await fetchTitleFromUrl(url); } catch (e) { }
    if (fetched && fetched.title) {
      try { console.debug('[saveAdd] fetched.title (raw):', fetched.title); } catch (e) { }
      const cleaned = cleanTitle(fetched.title);
      try { console.debug('[saveAdd] fetched.title (cleaned):', cleaned); } catch (e) { }
      title = cleaned || null;
    }
  }

  // fallback to hostname or the raw url -- but require confirmation if OGP fetch failed
  try {
    if (!title) {
      if (fetched === null) {
        // OGP fetch failed or was blocked (CORB/CORS). Ask user before saving a fallback title.
        const proceed = confirm('ページ情報の取得に失敗しました。タイトルが空のまま保存しますか？\n(キャンセルすると保存を中止します)');
        if (!proceed) {
          return; // abort save
        }
      }
      title = (new URL(url)).hostname;
    }
  } catch (e) { if (!title) title = url; }

  // decide icon and desc: prefer user-specified, otherwise OGP (via proxy), otherwise favicon
  let icon = el.addIcon.value.trim();
  // OGP画像とファビコンを別々に保存
  let ogImage = null;
  let faviconUrl = null;

  if (fetched) {
    // OGP画像を保存
    if (fetched.image) {
      ogImage = fetched.image;
    }
    // ファビコンを保存（プロキシから取得したもの or フォールバック）
    if (fetched.favicon) {
      faviconUrl = fetched.favicon;
    }
  }
  // ファビコンがない場合はGoogleサービスをフォールバック
  if (!faviconUrl) {
    faviconUrl = faviconFromUrl(url, 64);
  }
  // User-provided overrides from modal inputs (allow explicit setting/inspection)
  try {
    const userGrid = el.addGridImage ? (el.addGridImage.value || '').trim() : '';
    const userList = el.addListImage ? (el.addListImage.value || '').trim() : '';
    if (userGrid) ogImage = userGrid;
    if (userList) faviconUrl = userList;
  } catch (e) { }

  // icon_url（従来の互換性のため）: ユーザー指定 > OGP画像 > ファビコン
  if (!icon) {
    if (ogImage) {
      icon = ogImage;
    } else {
      icon = faviconUrl;
    }
  }
  let desc = el.addDesc.value.trim();
  if (!desc && fetched && fetched.description) desc = fetched.description;
  const tags = (el.addTags.value || '').split(/[,;|]/).map(s => s.trim()).filter(Boolean);


  // Debug: final title before save
  try { console.debug('[saveAdd] final title before save:', title); } catch (e) { }

  // ensure input shows the final title
  try { if (title) el.addTitleInput.value = title; } catch (e) { }

  if (el.saveAdd.dataset.editId) {
    const eid = Number(el.saveAdd.dataset.editId);
    const idx = DATA.findIndex(d => d.id === eid);
    if (idx !== -1) {
      // 編集時に他のエントリと URL が重複しないかチェック
      try {
        const newKey = normalizeUrlForCompare(url);
        const dup = DATA.some((d, i) => i !== idx && normalizeUrlForCompare(d.url) === newKey);
        if (dup) { alert('別のエントリと URL が重複します。編集を中止しました。'); return; }
      } catch (e) { }
      const created = DATA[idx].created_at || Date.now();
      DATA[idx].url = url; DATA[idx].title = title; DATA[idx].icon_url = icon; DATA[idx].desc = desc; DATA[idx].tags = tags;
      DATA[idx].og_image = ogImage; DATA[idx].favicon_url = faviconUrl;
      DATA[idx].created_at = created;
      DATA[idx].updated_at = Date.now();
    }
  } else {
    // 追加前に重複 URL をチェック
    try {
      const newKey = normalizeUrlForCompare(url);
      const exists = (DATA || []).some(d => normalizeUrlForCompare(d.url) === newKey);
      if (exists) { alert('同じ URL のブックマークは既に存在します。'); return; }
    } catch (e) { }
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const newItem = { id, title, url, icon_url: icon, og_image: ogImage, favicon_url: faviconUrl, desc, tags, created_at: Date.now(), updated_at: Date.now() };
    DATA.unshift(newItem);
  }

  saveToStorage();
  renderTags(); renderList(); renderSidebarTags(); updateSidebarStats();
  closeAddModal();
  if (typeof saveBookmarksToRemote === 'function') saveBookmarksToRemote();
});

// Enterキーによる自動保存機能は無効化しました（誤保存防止のため）。

/* init */
// load and dedupe stored bookmarks
if (!loadAndDedupeFromStorage()) {
  // keep initial DATA if local empty
}

loadViewMode(); // 表示モードを localStorage から読み込み
loadSort(); // ソート設定を localStorage から読み込み
updateViewModeUI(); // ラジオボタンの状態を更新
renderTags(); renderList();
// URL パラメータで状態を起動（全ユーザー向け）: ?tag= ?q= ?sort= ?layout= ?theme= ?notag=1
; (function () {
  try {
    const _p = new URLSearchParams(window.location.search);
    const _t = _p.get('tag');
    const _q = _p.get('q');
    const _sort = _p.get('sort');
    const _layout = _p.get('layout');
    const _theme = _p.get('theme');
    const _notag = _p.get('notag');
    let _changed = false;
    if (_t) {
      state.tags.clear();
      state.noTagFilter = false;
      state.tags.add(decodeURIComponent(_t));
      _changed = true;
    }
    if (_notag === '1') {
      state.noTagFilter = true;
      state.tags.clear();
      _changed = true;
    }
    if (_q) {
      state.q = decodeURIComponent(_q);
      const _qEl = document.getElementById('q');
      if (_qEl) _qEl.value = state.q;
      _changed = true;
    }
    const _validSorts = ['alpha_en_asc', 'alpha_en_desc', 'date-new', 'date-old'];
    if (_sort && _validSorts.includes(_sort)) {
      state.sort = _sort;
      const _sortEl = document.getElementById('sortSelect');
      if (_sortEl) _sortEl.value = _sort;
      _changed = true;
    }
    if (_layout === 'grid' || _layout === 'list') {
      localStorage.setItem('desktop_layout', _layout);
      if (typeof applyGridLayout === 'function') applyGridLayout();
      _changed = true;
    }
    const _validThemes = ['light', 'dark', 'awake', 'muse', 'majesty', 'eof'];
    if (_theme && _validThemes.includes(_theme)) {
      if (typeof applyTheme === 'function') applyTheme(_theme);
      const _themeEl = document.getElementById('themeSelect');
      if (_themeEl) _themeEl.value = _theme;
      _changed = true;
    }
    if (_changed) {
      try { window.history.replaceState(null, '', window.location.pathname); } catch (e) { }
      renderTags(); renderList(); renderSidebarTags();
    }
  } catch (e) { }
})();
initSidebar(); // サイドバーを初期化

try {
  const charLogoBtn = document.getElementById('charLogoBtn');
  if (charLogoBtn) {
    charLogoBtn.addEventListener('click', () => {
      const targetTag = 'Kyu';
      if (state.tags.has(targetTag)) {
        state.tags.delete(targetTag);
        if (state.tags.size === 0) state.noTagFilter = false; // Fix: should show all if nothing selected
      } else {
        state.tags.clear();
        state.tags.add(targetTag);
        state.noTagFilter = false;
      }
      renderTags();
      renderList();
      renderSidebarTags();
      // list表示等で画面トップにスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
} catch (e) { }

function adjustWrapForHeader() {
  const hdr = document.querySelector('header.card');
  const wrap = document.querySelector('.wrap');
  if (hdr && wrap) {
    const h = hdr.offsetHeight || 0;
    // align content directly under header; remove header internal bottom padding/gap
    try {
      const cs = window.getComputedStyle(hdr);
      const pb = parseFloat(cs.getPropertyValue('padding-bottom')) || 0;
      const rowGap = parseFloat(cs.getPropertyValue('row-gap')) || parseFloat(cs.getPropertyValue('gap')) || 0;
      // subtract internal bottom padding and row gap so content sits beneath visible header
      const topPad = Math.max(0, h - pb - rowGap);
      // add a small extra spacing to ensure cards don't visually collide with header
      const extraSpacing = 12; // px
      wrap.style.paddingTop = (topPad + extraSpacing) + 'px';
      // expose adjusted header height (including extra spacing) as CSS variable so sticky elements align
      document.documentElement.style.setProperty('--hdr-h', (topPad + extraSpacing) + 'px');
    } catch (e) {
      const extra = 12;
      wrap.style.paddingTop = (h + extra) + 'px';
      try { document.documentElement.style.setProperty('--hdr-h', (h + extra) + 'px'); } catch (e) { }
    }
  }
}
adjustWrapForHeader();
window.addEventListener('resize', adjustWrapForHeader);

// Hide loading overlay if present (page initialization complete)
try {
  const lo = document.getElementById('loadingOverlay');
  if (lo) { lo.style.display = 'none'; }
} catch (e) { }

const headerEl = document.querySelector('header.card');
// Hamburger menu removed - view size and sort now inline with count

window.LINKS_DATA = DATA; window.rebuild = () => { renderTags(); renderList(); };

document.addEventListener('keydown', async (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    if (!e.target.matches('input, textarea')) {
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
          openAddModal();
          el.addUrl.value = text.trim();
          setTimeout(() => el.addTitleInput.focus(), 100);
        }
      } catch (err) {
        console.warn('Clipboard paste failed:', err);
      }
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    toggleEditMode();
  }
  if (e.key === 'e' || e.key === 'E') {
    if (!e.target.matches('input, textarea')) {
      e.preventDefault();
      toggleEditMode();
    }
  }
});

/* ------------------ Firebase + RealtimeDB 同期 + Google Sign-in ------------------ */

/* --- your firebaseConfig --- */
const firebaseConfig = {
  apiKey: "AIzaSyDJjrwdBvHp5nGCVggO77vLIfobfFAVwWA",
  authDomain: "link-fd2f7.firebaseapp.com",
  databaseURL: "https://link-fd2f7-default-rtdb.firebaseio.com",
  projectId: "link-fd2f7",
  storageBucket: "link-fd2f7.firebasestorage.app",
  messagingSenderId: "856041551674",
  appId: "1:856041551674:web:b9e059f7fb6f789dadc203"
};

// 現在のURLをログに出力（デバッグ用）

// 127.0.0.1の場合はlocalhostにリダイレクト（Firebase認証用）
if (window.location.hostname === '127.0.0.1') {
  console.warn('⚠ 127.0.0.1で開かれています。Firebaseログインのためlocalhostにリダイレクトします...');
  const newUrl = window.location.href.replace('127.0.0.1', 'localhost');
  window.location.replace(newUrl);
}

/* ensure firebase SDK loaded */
if (!window.firebase) {
  console.error('Firebase SDK が読み込まれていません。index.html で SDK を一度だけ読み込んでください。');
} else {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  // 初期化直後にpersistenceを設定
  try {
    if (firebase.auth && firebase.auth().setPersistence) {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(e => console.error('setPersistence init failed', e));
    }
  } catch (e) {
    console.error('setPersistence init error', e);
  }
}

const db = (window.firebase) ? firebase.database() : null;

const OWNER_UID = 'FTdtnAHu8tRdbqC7v2URX6NpZVI3';
let firebaseUid = null;
let currentRemoteRef = null;
// isReadOnlyMode declaration moved to top
let remoteImageUrlMigrationDone = false;

/* ------------------ ブックマークレット用URLパラメータ処理 ------------------ */
function checkBookmarkletParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') !== '1') return;

    // パラメータから各データを取得
    const bUrl = params.get('url') || '';
    const bTitle = params.get('title') || '';
    const bDesc = params.get('desc') || '';
    const bOgImage = params.get('og_image') || '';
    const bFavicon = params.get('favicon_url') || '';

    if (!bUrl) return;

    // URLパラメータをアドレスバーから除去（履歴を汚さないため）
    try {
      const clean = window.location.pathname;
      window.history.replaceState(null, '', clean);
    } catch (e) { }

    // モーダルを開いて、取得した全データをセット
    openAddModal();
    if (el.addUrl) el.addUrl.value = bUrl;
    if (el.addTitleInput) el.addTitleInput.value = bTitle;
    if (el.addDesc) el.addDesc.value = bDesc;
    if (el.addGridImage) el.addGridImage.value = bOgImage;
    if (el.addListImage) el.addListImage.value = bFavicon;

    if (el.refreshImagesBtn) el.refreshImagesBtn.style.display = 'inline-block';
  } catch (e) { console.warn('checkBookmarkletParams error', e); }
}

/* Check if current user is owner and update UI accordingly */
function updateEditPermissions(user) {
  const isOwner = user && user.uid === OWNER_UID;
  isReadOnlyMode = !isOwner;

  // Show/hide edit buttons based on ownership
  if (isOwner) {
    // Owner can edit: show all edit buttons
    if (el.topOpenAdd) el.topOpenAdd.style.display = 'inline-block';
    if (el.topEditModeBtn) el.topEditModeBtn.style.display = 'inline-block';
    if (el.editModeBtn) el.editModeBtn.style.display = 'inline-block';
    if (el.openAdd) {
      el.openAdd.classList.add('owner-visible');
      el.openAdd.setAttribute('aria-hidden', 'false');
    }
    // ブックマークレット経由で開かれた場合はモーダルを自動オープン
    checkBookmarkletParams();
  } else {
    // Not owner: hide edit buttons
    if (el.topOpenAdd) el.topOpenAdd.style.display = 'none';
    if (el.topEditModeBtn) el.topEditModeBtn.style.display = 'none';
    if (el.editModeBtn) el.editModeBtn.style.display = 'none';
    if (el.topDeleteSelectedBtn) el.topDeleteSelectedBtn.style.display = 'none';
    if (el.openAdd) {
      el.openAdd.classList.remove('owner-visible');
      el.openAdd.setAttribute('aria-hidden', 'true');
    }
  }
}

/* local <-> functions (DATA を使う) */
function getLocalBookmarks() {
  if (typeof DATA !== 'undefined' && Array.isArray(DATA)) return DATA;
  if (typeof window !== 'undefined' && Array.isArray(window.DATA)) return window.DATA;
  return [];
}
function setLocalBookmarks(arr) {
  const normalized = Array.isArray(arr) ? arr : [];

  try { DATA = normalized; } catch (e) { }
  try { window.DATA = normalized; } catch (e) { }
  // Do not persist bookmarks to localStorage in UI-only mode
  try { renderTags(); renderList(); renderSidebarTags(); updateSidebarStats(); } catch (e) { /* ignore */ }
  // ローディング画面を解除
  try { if (window._kyulinkFinishLoading) window._kyulinkFinishLoading(); } catch (e) { }
}

function handleRemoteSnapshot(remoteVal, ref) {
  try {
    const arr = parseRemoteData(remoteVal);
    setLocalBookmarks(arr);
  } catch (e) { console.error('handleRemoteSnapshot error', e); }
}

function ensureIdAndTsForSync(item) {
  if (!item) item = {};
  if (!item.id) {
    if (window.crypto && crypto.randomUUID) item.id = crypto.randomUUID();
    else item.id = String(Date.now()) + '-' + Math.floor(Math.random() * 1000);
  }
  if (!item.created_at) item.created_at = Date.now();
  item.updated_at = Date.now();
  return item;
}

function arrayOrObjToMap(data) {
  const m = {};
  if (!data) return m;
  if (Array.isArray(data)) data.forEach(it => { if (it && it.id) m[it.id] = it; });
  else if (typeof data === 'object') Object.values(data).forEach(it => { if (it && it.id) m[it.id] = it; });
  return m;
}
function mapToArray(mapObj) { return Object.values(mapObj || {}); }
function parseRemoteData(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter(it => it && it.id);
  }
  // Firebaseが密な配列でない場合にオブジェクトで返すことがあるため、値だけを抽出して順番を維持する
  return Object.values(val).filter(it => it && it.id);
}
function deepEqualMaps(a, b) {
  const ka = Object.keys(a || {}).sort();
  const kb = Object.keys(b || {}).sort();
  if (ka.length !== kb.length) return false;
  for (let k of ka) {
    if (!b[k]) return false;
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false;
  }
  return true;
}

/* sync */
// localStorage cache key / TTL for read-only public data
const _DATA_CACHE_KEY = 'kyulink_data_cache_v2';
const _DATA_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function _getCachedData() {
  try {
    const raw = localStorage.getItem(_DATA_CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > _DATA_CACHE_TTL) return null;
    return data;
  } catch (e) { return null; }
}
function _setCachedData(data) {
  try { localStorage.setItem(_DATA_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (e) { }
}
function _clearDataCache() {
  try { localStorage.removeItem(_DATA_CACHE_KEY); localStorage.removeItem(_DATA_CACHE_KEY + '_orders'); } catch (e) { }
}

function _getCachedOrders() {
  try {
    const raw = localStorage.getItem(_DATA_CACHE_KEY + '_orders');
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > _DATA_CACHE_TTL) return null;
    return data;
  } catch (e) { return null; }
}
function _setCachedOrders(data) {
  try { localStorage.setItem(_DATA_CACHE_KEY + '_orders', JSON.stringify({ ts: Date.now(), data })); } catch (e) { }
}

function startSyncForUser(uid) {
  if (!db) return;
  // Always use OWNER_UID for read-only public view
  firebaseUid = OWNER_UID;
  remoteImageUrlMigrationDone = false;
  const path = 'bookmarks/' + OWNER_UID;
  const ref = db.ref(path);
  const orderRef = db.ref('tagOrders/' + OWNER_UID);

  if (currentRemoteRef && typeof currentRemoteRef.off === 'function') {
    try { currentRemoteRef.off(); } catch (e) { /* ignore */ }
  }
  currentRemoteRef = ref;
  if (window.currentOrderRef && typeof window.currentOrderRef.off === 'function') {
    try { window.currentOrderRef.off(); } catch (e) { }
  }
  window.currentOrderRef = orderRef;

  // ── 読み取り専用ゲスト: キャッシュがあればFirebaseを叩かない ──
  if (isReadOnlyMode) {
    const cached = _getCachedData();
    const cachedOrders = _getCachedOrders();
    if (cached) {
      try {
        let arr = parseRemoteData(cached);
        if (cachedOrders) TAG_ORDERS = cachedOrders;
        setLocalBookmarks(arr);
        console.log('startSyncForUser: served from localStorage cache');
      } catch (e) { console.error(e); }
      return; // Firebase読み込みをスキップ
    }

    // キャッシュなし → once() のみで取得してキャッシュ保存（ref.on() は使わない）
    Promise.all([
      ref.once('value'),
      orderRef.once('value').catch(() => ({ val: () => ({}) }))
    ]).then(([snap, orderSnap]) => {
      const remoteVal = snap.val();
      const orderVal = orderSnap.val() || {};
      TAG_ORDERS = orderVal;
      _setCachedOrders(orderVal);
      try {
        if (remoteVal && ((Array.isArray(remoteVal) && remoteVal.length > 0) || (typeof remoteVal === 'object' && Object.keys(remoteVal).length > 0))) {
          let arr = parseRemoteData(remoteVal);
          setLocalBookmarks(arr);
          _setCachedData(remoteVal); // キャッシュに保存
        } else {
          console.log('Remote empty (read-only mode) — no data to display');
        }
      } catch (e) { console.error(e); }
    }).catch(err => {
      if (err && err.code === 'PERMISSION_DENIED') {
        console.warn('データを読み込むにはログインが必要です。');
      } else {
        console.error(err);
      }
    });
    return;
  }

  // ── オーナーログイン時: ref.on() でリアルタイム同期 ──
  orderRef.on('value', snapshot => {
    TAG_ORDERS = snapshot.val() || {};
    renderList(); // 並び順が変わった場合は再描画
  });
  ref.on('value', snapshot => {
    const remoteVal = snapshot.val();
    try {
      // If remoteVal is empty/null, do not overwrite local data to avoid accidental data loss
      if (remoteVal && ((Array.isArray(remoteVal) && remoteVal.length > 0) || (typeof remoteVal === 'object' && Object.keys(remoteVal).length > 0))) {
        let arr = parseRemoteData(remoteVal);

        // One-time migration: unwrap legacy worker-proxied image URLs and persist direct URLs.
        if (!remoteImageUrlMigrationDone) {
          const migrated = migrateLegacyProxyImageUrls(arr);
          remoteImageUrlMigrationDone = true;
          if (migrated.changed > 0) {
            arr = migrated.items;
            setLocalBookmarks(arr);
            ref.set(arr)
              .then(() => { console.log('Firebase migration complete: normalized image URLs =', migrated.changed); _clearDataCache(); })
              .catch((err) => { console.error('Firebase migration save failed', err); });
            return;
          }
        }

        setLocalBookmarks(arr);
      } else {
        console.log('Remote snapshot empty — ignoring to avoid overwriting local data');
      }
    } catch (e) { console.error(e); }
  }, err => {
    if (err && err.code === 'PERMISSION_DENIED') {
      console.warn('データを同期するにはログインが必要です。');
    } else {
      console.error(err);
    }
  });
}



function saveBookmarksToRemote() {
  if (isReadOnlyMode) { console.log('saveBookmarksToRemote: skipped (read-only mode)'); return; }
  if (!firebaseUid || !db) { console.warn('saveBookmarksToRemote: no firebase uid/db'); return; }
  const ref = db.ref('bookmarks/' + firebaseUid);
  let local = (getLocalBookmarks() || []).map(it => ensureIdAndTsForSync(it));
  const migrated = migrateLegacyProxyImageUrls(local);
  if (migrated.changed > 0) {
    console.log('saveBookmarksToRemote: normalized legacy image URLs =', migrated.changed);
  }
  local = migrated.items;
  console.log('saveBookmarksToRemote uid=', firebaseUid, 'items=', local.length);
  // Safety guard: if local is empty but remote currently contains data, DO NOT overwrite (to avoid accidental deletion)
  try {
    ref.once('value').then(snap => {
      const remoteVal = snap.val();
      const remoteHasData = remoteVal && ((Array.isArray(remoteVal) && remoteVal.length > 0) || (typeof remoteVal === 'object' && Object.keys(remoteVal).length > 0));
      if (remoteHasData && (!Array.isArray(local) || local.length === 0)) {
        console.warn('Aborting remote save: remote has data but local is empty — prevented accidental overwrite');
        // Optionally notify the user in UI
        try { if (window && window.alert) window.alert('リモート側にデータが存在するため、空のデータで上書きするのを防ぎました。手動で確認してください。'); } catch (e) { }
        return;
      }
      // Otherwise it's safe to set (either remote empty or local has items)
      ref.set(local).then(() => { console.log('saveBookmarksToRemote: saved', firebaseUid); _clearDataCache(); }).catch(err => { console.error('saveBookmarksToRemote error', err); alert('リモート保存に失敗しました: ' + (err && err.message || err)); });
    }).catch(err => { console.error('saveBookmarksToRemote read-before-set failed', err); /* fallback to set to avoid blocking in unexpected cases */ ref.set(local).catch(e => { console.error('fallback set failed', e); }); });
  } catch (e) { console.error('saveBookmarksToRemote guard error', e); ref.set(local).catch(err => { console.error('saveBookmarksToRemote final set error', err); }); }
}

function saveTagOrdersToRemote() {
  if (isReadOnlyMode) { console.log('saveTagOrdersToRemote: skipped (read-only mode)'); return; }
  if (!firebaseUid || !db) { console.warn('saveTagOrdersToRemote: no firebase uid/db'); return; }
  const ref = db.ref('tagOrders/' + firebaseUid);
  ref.set(TAG_ORDERS).then(() => {
    console.log('saveTagOrdersToRemote: saved', firebaseUid);
    _clearDataCache();
  }).catch(err => {
    console.error('saveTagOrdersToRemote error', err);
    alert('並び順の保存に失敗しました: ' + (err && err.message || err));
  });
}

/* helper wrapper */
function addBookmarkAndSync(bookmark) {
  bookmark = ensureIdAndTsForSync(bookmark);
  const local = getLocalBookmarks();
  local.unshift(bookmark);
  setLocalBookmarks(local);
  saveBookmarksToRemote();
}

/* ---------- Auth UI handling ---------- */
// DOM要素
const userInfoBtn = document.getElementById('userInfoBtn');
const userMiniAvatar = document.getElementById('userMiniAvatar');
const userInfoText = document.getElementById('userInfoText');
const userSettingsModal = document.getElementById('userSettingsModal');
const userAvatarLarge = document.getElementById('userAvatarLarge');
const avatarUploadInput = document.getElementById('avatarUploadInput');
const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
const googleSignInBtn2 = document.getElementById('googleSignInBtn2');
const signOutBtn2 = document.getElementById('signOutBtn2');
const loginSection = document.getElementById('loginSection');
const logoutSection = document.getElementById('logoutSection');
const loggedInEmail = document.getElementById('loggedInEmail');
const closeUserSettingsModal = document.getElementById('closeUserSettingsModal');

let userAvatarUrl = null;

// モーダル開閉
function openUserSettingsModal() {
  try { lockScrollForModal(); } catch (e) { }
  if (userSettingsModal) userSettingsModal.style.display = 'flex';
  document.body.classList.add('modal-settings-open');
  updateModalLoginSection();
  try {
    const v = localStorage.getItem('ogp_proxy') || '';
    const inp = document.getElementById('ogpProxyInput');
    if (inp) inp.value = v;
    // sync theme select state when opening modal
    try {
      const savedTheme = localStorage.getItem('app_theme') || 'awake';
      const sel = document.getElementById('themeSelect');
      if (sel) sel.value = savedTheme;
      // sync desktop layout when opening modal
      const savedLayout = localStorage.getItem('desktop_layout') || 'grid';
      const layoutSel = document.getElementById('sidebarLayout');
      if (layoutSel) layoutSel.value = savedLayout;
      // sync grid cols when opening modal
      const savedCols = localStorage.getItem('grid_cols') || '4';
      const colsSel = document.getElementById('gridColsSelect');
      if (colsSel) colsSel.value = savedCols;
      updateColsVisibility();

    } catch (e) { }
  } catch (e) { }
}
function closeUserSettingsModalFn() {
  try {
    // If desktop layout is tablet/PC (grid), ensure display size is set to 'medium' inside modal before closing
    const layoutSel = document.getElementById('sidebarLayout');
    const layout = layoutSel ? layoutSel.value : (localStorage.getItem('desktop_layout') || 'grid');
    if (layout === 'grid') {
      try {
        const viewSel = document.getElementById('viewSizeSelect');
        if (viewSel) viewSel.value = 'medium';
        state.viewMode = 'medium'; saveViewMode(); updateViewModeUI(); renderList();
        // sync sidebar view size select if present
        const sidebarView = document.getElementById('sidebarViewSize');
        if (sidebarView) sidebarView.value = 'medium';
      } catch (e) { }
    }
  } catch (e) { }
  if (userSettingsModal) userSettingsModal.style.display = 'none';
  document.body.classList.remove('modal-settings-open');
  try { unlockScrollForModal(); } catch (e) { }
}
if (userInfoBtn) userInfoBtn.addEventListener('click', openUserSettingsModal);
if (closeUserSettingsModal) closeUserSettingsModal.addEventListener('click', closeUserSettingsModalFn);
if (userSettingsModal) userSettingsModal.addEventListener('click', (e) => { if (e.target === userSettingsModal) closeUserSettingsModalFn(); });

// Theme handling (multi-theme support)
function applyTheme(themeName) {
  try {
    // Remove all theme classes first
    document.documentElement.classList.remove('dark-mode', 'theme-awake', 'theme-muse', 'theme-majesty', 'theme-eof');

    if (themeName === 'awake') {
      document.documentElement.classList.add('theme-awake');
    } else if (themeName === 'muse') {
      document.documentElement.classList.add('theme-muse');
    } else if (themeName === 'eof') {
      document.documentElement.classList.add('theme-eof');
    } else if (themeName === 'kohane' || themeName === 'awake-dark') {
      // Legacy aliases: map to awake
      document.documentElement.classList.add('theme-awake');
      themeName = 'awake'; // normalize
    } else if (themeName === 'dreamer' || themeName === 'dreamer2') {
      // Legacy aliases: map to muse
      document.documentElement.classList.add('theme-muse');
      themeName = 'muse'; // normalize
    }
    // 'light' is default, no class needed
    localStorage.setItem('app_theme', themeName);

    // Update meta theme-color so mobile chrome / overscroll areas match theme
    try {
      var themeColor = '#f6fbfb';
      if (themeName === 'dark') themeColor = '#07181a';
      else if (themeName === 'awake' || themeName === 'kohane' || themeName === 'awake-dark') themeColor = '#ffdada';
      else if (themeName === 'muse' || themeName === 'dreamer' || themeName === 'dreamer2') themeColor = '#F4F1E8';
      else if (themeName === 'majesty') themeColor = '#f0eef5';
      else if (themeName === 'eof') themeColor = '#f5f2ee';
      else if (themeName === 'light') themeColor = getComputedStyle(document.documentElement).getPropertyValue('--bg') || themeColor;

      var meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', themeColor.trim());
    } catch (e) { /* non-fatal */ }
  } catch (e) { console.warn('applyTheme error', e); }
}

// Font handling (font presets)
function applyFont(fontName) {
  try {
    if (fontName === 'default') fontName = 'notojp';
    document.documentElement.classList.remove('font-dotgothic16', 'font-mplus', 'font-kosugi', 'font-yomogi', 'font-notojp');
    if (fontName === 'dotgothic16') {
      document.documentElement.classList.add('font-dotgothic16');
    } else if (fontName === 'mplus') {
      document.documentElement.classList.add('font-mplus');
    } else if (fontName === 'kosugi') {
      document.documentElement.classList.add('font-kosugi');
    } else if (fontName === 'yomogi') {
      document.documentElement.classList.add('font-yomogi');
    } else if (fontName === 'notojp') {
      document.documentElement.classList.add('font-notojp');
    } else if (fontName === 'dela') {
      // legacy mapping: map removed Dela to DotGothic16
      document.documentElement.classList.add('font-dotgothic16');
      fontName = 'dotgothic16';
    }
    // 'default' is migrated to 'notojp' for consistent first-visit appearance
    try { localStorage.setItem('app_font', fontName); } catch (e) { }
  } catch (e) { console.warn('applyFont error', e); }
}

// Bind theme select if present
try {
  const themeSelect = document.getElementById('themeSelect');
  const desktopLayoutSelect = document.getElementById('desktopLayoutSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
      // サイドバーのテーマセレクトも同期
      if (el.sidebarTheme) el.sidebarTheme.value = e.target.value;
    });
  }
  // Bind font select if present
  const fontSelect = document.getElementById('fontSelect');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      applyFont(e.target.value);
    });
  }

  if (desktopLayoutSelect) {
    desktopLayoutSelect.addEventListener('change', (e) => {
      const v = e.target.value === 'grid' ? 'grid' : 'list';
      try { localStorage.setItem('desktop_layout', v); } catch (e) { }
      // If switching to tablet/PC (grid), force view size to 'medium' first and re-render
      if (v === 'grid') {
        try {
          state.viewMode = 'medium'; saveViewMode(); updateViewModeUI();
          const viewSel = document.getElementById('viewSizeSelect'); if (viewSel) viewSel.value = 'medium';
          const sidebarView = document.getElementById('sidebarViewSize'); if (sidebarView) sidebarView.value = 'medium';
          renderList();
        } catch (_) { }
      }
      applyGridLayout();
      // レイアウト変更後に再レンダーしてアイコンを更新
      renderList();
      // サイドバーのレイアウトセレクトも同期
      if (el.sidebarLayout) el.sidebarLayout.value = v;
      updateColsVisibility();
    });
  }
  // Grid columns select in settings modal
  const gridColsSelect = document.getElementById('gridColsSelect');
  if (gridColsSelect) {
    const savedCols = localStorage.getItem('grid_cols') || '4';
    gridColsSelect.value = savedCols;
    gridColsSelect.addEventListener('change', (e) => {
      try { localStorage.setItem('grid_cols', e.target.value); } catch (ex) { }
      applyGridLayout();
      // サイドバーも同期
      const sidebarCols = document.getElementById('sidebarCols');
      if (sidebarCols) sidebarCols.value = e.target.value;
    });
  }
  // Apply persisted preference on script load
  const savedTheme = localStorage.getItem('app_theme') || 'awake';
  // Migrate old dark_mode setting
  if (!localStorage.getItem('app_theme') && localStorage.getItem('dark_mode') === '1') {
    applyTheme('dark');
  } else {
    applyTheme(savedTheme);
  }
  // Sync select state
  if (themeSelect) themeSelect.value = localStorage.getItem('app_theme') || 'awake';
  // Apply persisted font preference
  let savedFont = localStorage.getItem('app_font') || 'notojp';
  if (savedFont === 'default') savedFont = 'notojp';
  applyFont(savedFont);
  if (fontSelect) fontSelect.value = savedFont;
  // Apply persisted desktop layout and sync select
  try {
    const savedLayout = localStorage.getItem('desktop_layout') || 'grid';
    applyGridLayout();
    if (desktopLayoutSelect) desktopLayoutSelect.value = savedLayout;
    // カラム数セレクトも同期
    const savedCols = localStorage.getItem('grid_cols') || '4';
    const gridColsSelect = document.getElementById('gridColsSelect');
    if (gridColsSelect) gridColsSelect.value = savedCols;
    const sidebarCols = document.getElementById('sidebarCols');
    if (sidebarCols) sidebarCols.value = savedCols;
    updateColsVisibility();
  } catch (e) { }
  // Keep settings rows in sync when viewport changes (desktop <-> mobile)
  try { window.addEventListener('resize', updateColsVisibility); } catch (e) { }
} catch (e) { /* ignore */ }

// ログインセクション表示切替
function updateModalLoginSection() {
  const user = (window.firebase && firebase.auth) ? firebase.auth().currentUser : null;
  if (user && !user.isAnonymous) {
    if (loginSection) loginSection.style.display = 'none';
    if (logoutSection) logoutSection.style.display = 'block';
    if (loggedInEmail) loggedInEmail.textContent = 'ログイン中: ' + (user.email || user.uid);
  } else {
    if (loginSection) loginSection.style.display = 'block';
    if (logoutSection) logoutSection.style.display = 'none';
  }
}

// ヘッダーのユーザー情報更新
function updateAuthUI(user) {
  if (!userInfoText) return;
  if (!user) {
    userInfoText.textContent = 'ユーザー: ゲスト';
    if (userMiniAvatar) userMiniAvatar.innerHTML = '👤';
    if (userAvatarLarge) userAvatarLarge.innerHTML = '👤';
    // 未ログイン時はローカルの一覧をクリアしてログイン促進メッセージを表示
    try { setLocalBookmarks([]); } catch (e) { }
    try {
      if (el && el.countText) el.countText.textContent = 'ログインして下さい';
      if (el && el.list) el.list.innerHTML = '<div id="guestLoginPrompt" style="color:var(--muted);padding:14px;border-radius:10px;background:var(--card);cursor:pointer">ログインして下さい</div>';
      // attach click handler to the guest login prompt area to open user settings modal
      setTimeout(() => {
        const wrap = document.getElementById('guestLoginPrompt');
        if (wrap) { wrap.addEventListener('click', () => { openUserSettingsModal(); }); }
      }, 50);
      // 非ログイン時は追加や編集ボタンを隠す
      if (el && el.openAdd) el.openAdd.style.display = 'none';
      if (el && el.topOpenAdd) el.topOpenAdd.style.display = 'none';
      if (el && el.editModeBtn) el.editModeBtn.style.display = 'none';
      if (el && el.topEditModeBtn) el.topEditModeBtn.style.display = 'none';
    } catch (e) { }
  } else {
    // ログイン時は UI を有効化
    try {
      if (el && el.openAdd) el.openAdd.style.display = '';
      if (el && el.topOpenAdd) el.topOpenAdd.style.display = '';
      if (el && el.editModeBtn) el.editModeBtn.style.display = '';
      if (el && el.topEditModeBtn) el.topEditModeBtn.style.display = '';
    } catch (e) { }
    const isAnonymous = user.isAnonymous === true;
    const displayText = isAnonymous ? 'ゲスト' : (user.email || user.displayName || user.uid);
    userInfoText.textContent = 'ユーザー: ' + displayText;
    // アバター（photoURL が無ければ providerData、さらに localStorage をフォールバック）
    try { console.log('updateAuthUI user:', user); } catch (e) { }
    const savedAvatar = localStorage.getItem('userAvatar');
    const providerPhoto = (user.providerData && Array.isArray(user.providerData) && user.providerData.length)
      ? (user.providerData.find(p => p && p.photoURL) || {}).photoURL
      : null;
    const photoURL = user.photoURL || providerPhoto || savedAvatar || null;

    if (photoURL) {
      userAvatarUrl = photoURL;
      // img 要素を生成して安全に差し替える
      try {
        const miniImg = document.createElement('img');
        miniImg.alt = 'avatar';
        miniImg.src = photoURL;
        miniImg.style.width = '100%';
        miniImg.style.height = '100%';
        miniImg.style.objectFit = 'cover';
        miniImg.onerror = () => { if (userMiniAvatar) userMiniAvatar.innerHTML = '👤'; };

        const largeImg = document.createElement('img');
        largeImg.alt = 'avatar';
        largeImg.src = photoURL;
        largeImg.style.width = '100%';
        largeImg.style.height = '100%';
        largeImg.style.objectFit = 'cover';
        largeImg.onerror = () => { if (userAvatarLarge) userAvatarLarge.innerHTML = '👤'; };

        if (userMiniAvatar) { userMiniAvatar.innerHTML = ''; userMiniAvatar.appendChild(miniImg); }
        if (userAvatarLarge) { userAvatarLarge.innerHTML = ''; userAvatarLarge.appendChild(largeImg); }
      } catch (e) {
        if (userMiniAvatar) userMiniAvatar.innerHTML = '👤';
        if (userAvatarLarge) userAvatarLarge.innerHTML = '👤';
      }
      // アバター表示のみ（ファビコンの変更は不要なので実行しない）
    } else {
      if (userMiniAvatar) userMiniAvatar.innerHTML = '👤';
      if (userAvatarLarge) userAvatarLarge.innerHTML = '👤';
    }
  }
  updateModalLoginSection();
}

// ファビコン制御は削除（不要）

// アバターアップロード
if (uploadAvatarBtn) uploadAvatarBtn.addEventListener('click', () => { if (avatarUploadInput) avatarUploadInput.click(); });
if (avatarUploadInput) avatarUploadInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    userAvatarUrl = ev.target.result;
    if (userMiniAvatar) userMiniAvatar.innerHTML = `<img src="${userAvatarUrl}" alt="avatar">`;
    if (userAvatarLarge) userAvatarLarge.innerHTML = `<img src="${userAvatarUrl}" alt="avatar">`;
    localStorage.setItem('userAvatar', userAvatarUrl);
    // DBにも保存
    const uid = firebaseUid || (window.firebase && firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.uid);
    if (uid && db) {
      db.ref(`users/${uid}`).update({ avatar: userAvatarUrl }).catch(e => console.warn('avatar save failed', e));
    }
  };
  reader.readAsDataURL(file);
});

/* OGP proxy UI bindings removed — using hidden default proxy set in OGP_PROXY constant */

async function signInWithGoogle() {
  if (!window.firebase) return alert('Firebase SDKが読み込まれていません');

  console.log('signInWithGoogle called');
  console.log('Current auth state:', firebase.auth().currentUser ? 'logged in' : 'not logged in');

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  // カスタムパラメータを追加（リダイレクト時の問題を減らす）
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    // モバイル端末かどうかを検出（タッチ対応デバイス全般）
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || ('ontouchstart' in window)
      || (navigator.maxTouchPoints > 0);

    const useRedirect = isMobile;

    console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');
    console.log('Auth method:', useRedirect ? 'Redirect' : 'Popup');

    if (useRedirect) {
      // モバイルではリダイレクトフローを使用（ポップアップはブロックされやすいため）
      console.log('Starting redirect flow...');

      // 現在のURLを保存（デバッグ用）
      try {
        localStorage.setItem('auth_redirect_origin', window.location.href);
        console.log('Saved origin URL:', window.location.href);
      } catch (e) { }

      try {
        // リダイレクト前にセッション永続化を確実に設定
        console.log('Setting persistence to LOCAL');
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        console.log('Persistence set successfully');
      } catch (e) {
        console.error('setPersistence before redirect failed', e);
      }

      try {
        localStorage.setItem('auth_redirecting', '1');
        localStorage.setItem('auth_redirect_time', Date.now().toString());
        console.log('Set auth_redirecting flag at', new Date().toISOString());
      } catch (e) {
        console.error('Failed to set redirecting flag', e);
      }

      console.log('Calling signInWithRedirect...');
      console.log('Provider:', provider);
      await firebase.auth().signInWithRedirect(provider);
      console.log('signInWithRedirect called (page should redirect now)');
      return;
    }

    // デスクトップではポップアップフローを使用
    console.log('Starting popup flow...');
    try {
      // Do not await setPersistence here to preserve the user gesture for the popup
      // awaiting can cause the popup to be blocked by the browser
      if (firebase.auth && firebase.auth().setPersistence) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(() => console.log('Persistence set (async)'))
          .catch(e => console.warn('setPersistence (async) failed', e));
      }
    } catch (e) { console.warn('setPersistence call failed', e); }

    const res = await firebase.auth().signInWithPopup(provider);
    console.log('signInWithPopup result:', res && res.user && res.user.uid);

    // サインイン直後に明示的に同期を開始し、res.user を使って確実に同期を行う
    try {
      const signedUser = (res && res.user) ? res.user : (firebase.auth().currentUser || null);
      if (signedUser && signedUser.uid) {
        // 確実に firebaseUid を設定
        firebaseUid = signedUser.uid;
        startSyncForUser(signedUser.uid);
        const local = getLocalBookmarks() || [];
        if (local.length > 0) {
          console.log('Local has items after signIn, pushing to remote');
          saveBookmarksToRemote();
        }
      } else {
        console.warn('No signedUser found after signInWithPopup');
      }
    } catch (e) { console.warn('postSignIn sync failed', e); }
    return;
  } catch (e) {
    console.error('Google sign-in error', e);
    if (e.code) console.error('Error code:', e.code);
    alert('Googleサインインに失敗しました: ' + (e && (e.message || e.code) || e));
  }
}

async function signOut() {
  try {
    await firebase.auth().signOut();
    alert('サインアウトしました');
  } catch (e) {
    console.error('signOut error', e);
    alert('サインアウトエラー: ' + (e && (e.message || e.code) || e));
  }
}

if (googleSignInBtn2) {
  // Bind a direct handler that calls signInWithPopup synchronously
  googleSignInBtn2.addEventListener('click', async (e) => {
    try {
      console.log('googleSignInBtn2 clicked - invoking popup flow');
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      // Do not await persistence here to preserve the user gesture
      if (firebase.auth && firebase.auth().setPersistence) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(() => console.log('persistence set (async)'))
          .catch(e => console.warn('persistence set failed (async)', e));
      }

      // Call signInWithPopup immediately in the click handler context
      const res = await firebase.auth().signInWithPopup(provider);
      console.log('popup sign-in result (button):', res);
      const signedUser = (res && res.user) ? res.user : (firebase.auth().currentUser || null);
      if (signedUser && signedUser.uid) {
        firebaseUid = signedUser.uid;
        startSyncForUser(signedUser.uid);
        const local = getLocalBookmarks() || [];
        if (local.length > 0) { saveBookmarksToRemote(); }
      }
    } catch (err) {
      console.error('googleSignInBtn2 signIn error', err);
      // If popup blocked or other error, fall back to redirect flow
      try { console.log('Falling back to redirect flow'); localStorage.setItem('auth_redirecting', '1'); } catch (e) { }
      try { await firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()); } catch (e) { console.error('redirect fallback failed', e); }
    }
  });
}
if (signOutBtn2) signOutBtn2.addEventListener('click', async () => {
  await signOut();
  closeUserSettingsModalFn();
});

/* onAuthStateChanged */
if (window.firebase) {
  // まずgetRedirectResultを処理してからonAuthStateChangedを設定

  // ページ読み込み時のリダイレクトフラグ確認
  const wasRedirecting = localStorage.getItem('auth_redirecting');
  const redirectTime = localStorage.getItem('auth_redirect_time');
  const redirectOrigin = localStorage.getItem('auth_redirect_origin');

  if (wasRedirecting) {
    // redirect detected
  }

  // getRedirectResultを先に処理
  firebase.auth().getRedirectResult().then(result => {

    // リダイレクトフラグをクリア
    try {
      localStorage.removeItem('auth_redirecting');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('auth_redirect_origin');
    } catch (e) { }
  }).catch(err => {
    console.error('=== getRedirectResult ERROR ===');
    console.error('Error object:', err);
    if (err.code) console.error('Error code:', err.code);
    if (err.message) console.error('Error message:', err.message);

    // リダイレクトフラグをクリア
    try {
      localStorage.removeItem('auth_redirecting');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('auth_redirect_origin');
    } catch (e) { }

    // 特定のエラーのみユーザーに通知
    if (err.code && err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
      alert('ログイン処理でエラーが発生しました: ' + err.message);
    }
  });

  // onAuthStateChangedを設定（これがメインの認証状態監視）
  firebase.auth().onAuthStateChanged(async user => {

    updateAuthUI(user);
    updateEditPermissions(user);

    if (!user) {
      // 未ログイン時でも公開データを読み込む（読み取り専用）
      startSyncForUser(null); // OWNER_UIDのデータを読み込む
      return;
    }

    // ログイン成功
    console.log('✓ User authenticated:', user.uid);
    console.log('User email:', user.email);
    console.log('User displayName:', user.displayName);

    try {
      // If this user is not the owner, immediately sign them out (keep UI visible)
      if (user.uid !== OWNER_UID) {
        console.warn('Non-owner attempted login, signing out:', user.uid);
        try { alert('このサイトはオーナーのみログイン可能です。'); } catch (e) { }
        try { await firebase.auth().signOut(); } catch (e) { console.warn('signOut after non-owner login failed', e); }
        // ensure UI reflects guest state and load public data
        try { updateAuthUI(null); updateEditPermissions(null); } catch (e) { }
        startSyncForUser(null);
        return;
      }

      firebaseUid = user.uid;
      startSyncForUser(user.uid);

      // リダイレクト後ならメッセージ表示（wasRedirectingは既にクリア済みなので別の方法で判定）
      // onAuthStateChangedは複数回発火するので、初回のみ通知
      const notifiedKey = 'auth_login_notified_' + user.uid;
      const alreadyNotified = sessionStorage.getItem(notifiedKey);

      if (!alreadyNotified) {
        console.log('First login detection in this session');
        try { sessionStorage.setItem(notifiedKey, '1'); } catch (e) { }

        // ローカルデータを同期
        try {
          const local = getLocalBookmarks() || [];
          if (local.length > 0) {
            console.log('Local has items, pushing to remote');
            saveBookmarksToRemote();
          }
        } catch (e) { console.warn('post-login sync failed', e); }
      }
    } catch (e) {
      console.error('startSyncForUser failed', e);
    }
  });
}

/* merge anonymous -> target */
/* anonymous-merge logic removed: app now requires explicit Google login only */

/* unload 保険 */
window.addEventListener('beforeunload', () => { try { saveBookmarksToRemote(); } catch (e) { } });

// Ensure bottom navigation is attached to body so fixed positioning is stable.
// Do not apply inline visual styles here; theme CSS must control appearance.
(function ensureBottomNavAttached() {
  try {
    const bn = document.getElementById('bottomNav');
    if (!bn) return;
    // move to body to avoid being inside transformed/limited container
    if (bn.parentNode !== document.body) document.body.appendChild(bn);
  } catch (e) { console.warn('ensureBottomNavAttached failed', e); }
})();
/* ========== Bottom Navigation Handlers ========== */
// 全モーダルを閉じるヘルパー
function closeAllModals() {
  if (el.addModal) { el.addModal.style.display = 'none'; document.body.classList.remove('modal-add-open'); }
  if (el.tagModal) { el.tagModal.style.display = 'none'; document.body.classList.remove('modal-tag-open'); }
  const mobileMenuModal = document.getElementById('mobileMenuModal');
  if (mobileMenuModal) mobileMenuModal.style.display = 'none';
  if (el.detailModal) { if (typeof closeDetailModal === 'function') closeDetailModal(); else { el.detailModal.style.display = 'none'; try { document.body.classList.remove('modal-detail-open'); } catch (e) { } } }
  if (el.viewModeModal) el.viewModeModal.style.display = 'none';
  // Close hub modals
  if (el.hubModal) el.hubModal.style.display = 'none';
  if (el.hubCreateModal) el.hubCreateModal.style.display = 'none';
  if (el.hubViewModal) el.hubViewModal.style.display = 'none';
  document.body.classList.remove('modal-hub-open');
  // Also close user settings modal if open
  try { if (typeof closeUserSettingsModalFn === 'function') closeUserSettingsModalFn(); } catch (e) { }
  // Restore scroll/padding if any modal had locked it
  try { unlockScrollForModal(); } catch (e) { }
}

// Search button - focus main search input directly
if (el.bottomSearchBtn) {
  el.bottomSearchBtn.addEventListener('click', () => {
    closeAllModals();
    try {
      if (el.q) {
        el.q.scrollIntoView({ behavior: 'auto', block: 'center' });
        try { el.q.focus({ preventScroll: true }); } catch (e) { el.q.focus(); }
        try { const len = (el.q.value || '').length; el.q.setSelectionRange(len, len); } catch (e) { }
        try { el.q.click(); } catch (e) { }
      }
    } catch (e) { }
  });
}

// Tags button - open mobile menu modal
if (el.bottomTagsBtn) {
  el.bottomTagsBtn.addEventListener('click', () => {
    closeAllModals(); // 先に他のモーダルを全て閉じる
    const mobileMenuModal = document.getElementById('mobileMenuModal');
    if (mobileMenuModal) {
      mobileMenuModal.style.display = 'flex';

      // レイアウトボタンの状態同期
      const btnPhone = document.getElementById('mobileLayoutBtnPhone');
      const btnDesktop = document.getElementById('mobileLayoutBtnDesktop');
      if (state.viewMode === 'list') {
        if (btnPhone) btnPhone.classList.add('active');
        if (btnDesktop) btnDesktop.classList.remove('active');
      } else {
        if (btnPhone) btnPhone.classList.remove('active');
        if (btnDesktop) btnDesktop.classList.add('active');
      }
    }
  });
}

// Mobile Menu Modal Event Listeners
const mobileMenuModalEl = document.getElementById('mobileMenuModal');
if (mobileMenuModalEl) {
  mobileMenuModalEl.addEventListener('click', (e) => {
    if (e.target === mobileMenuModalEl) {
      closeAllModals();
    }
  });
}

const closeMobileMenuModalBtn = document.getElementById('closeMobileMenuModal');
if (closeMobileMenuModalBtn) {
  closeMobileMenuModalBtn.addEventListener('click', closeAllModals);
}

const mobileMoreTagsBtn = document.getElementById('mobileMoreTagsBtn');
if (mobileMoreTagsBtn) {
  mobileMoreTagsBtn.addEventListener('click', () => {
    closeAllModals();
    if (el.tagModal) {
      el.tagModal.style.display = 'flex';
      document.body.classList.add('modal-tag-open');
      if (el.tagSearch) el.tagSearch.value = '';
    }
  });
}

const mobileLayoutBtnPhone = document.getElementById('mobileLayoutBtnPhone');
if (mobileLayoutBtnPhone) {
  mobileLayoutBtnPhone.addEventListener('click', () => {
    state.viewMode = 'list';
    saveViewMode();
    renderList();
    closeAllModals();
  });
}

const mobileLayoutBtnDesktop = document.getElementById('mobileLayoutBtnDesktop');
if (mobileLayoutBtnDesktop) {
  mobileLayoutBtnDesktop.addEventListener('click', () => {
    state.viewMode = 'grid';
    saveViewMode();
    renderList();
    closeAllModals();
  });
}

// Add button - open add modal or show permission error
if (el.bottomAddBtn) {
  el.bottomAddBtn.addEventListener('click', () => {
    if (isReadOnlyMode) {
      alert('リンクを追加するには、オーナーとしてログインしてください。');
      return;
    }
    closeAllModals(); // 先に他のモーダルを全て閉じる
    openAddModal();
  });
}

/* ========== JSON Paste Handler ========== */
function parseLinkItemsFromText(text) {
  const src = (text || '').toString().trim();
  if (!src) return null;

  // 1) Strict JSON
  try {
    const parsed = JSON.parse(src);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return [parsed];
  } catch (e) { }

  // 2) JS module-like dataset (e.g. const links=[...]; export default links;)
  function findMatchingArrayEnd(s, startIdx) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    let inLineComment = false;
    let inBlockComment = false;
    let escaped = false;

    for (let i = startIdx; i < s.length; i++) {
      const ch = s[i];
      const nx = s[i + 1];

      if (inLineComment) {
        if (ch === '\n') inLineComment = false;
        continue;
      }
      if (inBlockComment) {
        if (ch === '*' && nx === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }
      if (inSingle) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '\'') inSingle = false;
        continue;
      }
      if (inDouble) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '"') inDouble = false;
        continue;
      }
      if (inTemplate) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === '`') inTemplate = false;
        continue;
      }

      if (ch === '/' && nx === '/') {
        inLineComment = true;
        i++;
        continue;
      }
      if (ch === '/' && nx === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
      if (ch === '\'') { inSingle = true; continue; }
      if (ch === '"') { inDouble = true; continue; }
      if (ch === '`') { inTemplate = true; continue; }

      if (ch === '[') {
        depth++;
      } else if (ch === ']') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function extractArrayLiteral(s) {
    const markers = [
      /(?:const|let|var)\s+links\s*=/i,
      /export\s+default/i
    ];
    for (const marker of markers) {
      const m = marker.exec(s);
      if (!m) continue;
      const from = m.index + m[0].length;
      const start = s.indexOf('[', from);
      if (start === -1) continue;
      const end = findMatchingArrayEnd(s, start);
      if (end === -1) continue;
      return s.slice(start, end + 1);
    }
    return null;
  }

  const arrayLiteral = extractArrayLiteral(src);
  if (!arrayLiteral) return null;
  try {
    const parsed = (new Function('"use strict"; return (' + arrayLiteral + ');'))();
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
}

function fillAddModalFromLinkItem(item) {
  if (!item || typeof item !== 'object') return;
  if (item.url && el.addUrl) el.addUrl.value = String(item.url).trim();
  if (item.title && el.addTitleInput) el.addTitleInput.value = String(item.title).trim();
  if (item.desc && el.addDesc) el.addDesc.value = String(item.desc).trim();
  else if (item.description && el.addDesc) el.addDesc.value = String(item.description).trim();
  if (item.tags && el.addTags) {
    if (Array.isArray(item.tags)) el.addTags.value = item.tags.map(t => String(t).trim()).filter(Boolean).join(', ');
    else if (typeof item.tags === 'string') el.addTags.value = item.tags;
  }
  if (item.og_image && el.addGridImage) el.addGridImage.value = String(item.og_image).trim();
  else if (item.image && el.addGridImage) el.addGridImage.value = String(item.image).trim();
  if (item.favicon_url && el.addListImage) el.addListImage.value = String(item.favicon_url).trim();
  else if (item.favicon && el.addListImage) el.addListImage.value = String(item.favicon).trim();
  if (item.icon_url && el.addIcon) el.addIcon.value = String(item.icon_url).trim();
  else if (item.icon && el.addIcon) el.addIcon.value = String(item.icon).trim();
}

function normalizeImportedLinkItem(raw, ts) {
  if (!raw || typeof raw !== 'object') return null;
  let url = (raw.url || '').toString().trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  let title = (raw.title || '').toString().trim();
  if (!title) {
    try { title = (new URL(url)).hostname; }
    catch (e) { title = url; }
  }

  let desc = '';
  if (typeof raw.desc === 'string') desc = raw.desc.trim();
  else if (typeof raw.description === 'string') desc = raw.description.trim();

  let tags = [];
  if (Array.isArray(raw.tags)) tags = raw.tags.map(t => String(t).trim()).filter(Boolean);
  else if (typeof raw.tags === 'string') tags = raw.tags.split(/[,;|]/).map(s => s.trim()).filter(Boolean);

  let ogImage = '';
  if (typeof raw.og_image === 'string' && raw.og_image.trim()) ogImage = raw.og_image.trim();
  else if (typeof raw.image === 'string' && raw.image.trim()) ogImage = raw.image.trim();

  let faviconUrl = '';
  if (typeof raw.favicon_url === 'string' && raw.favicon_url.trim()) faviconUrl = raw.favicon_url.trim();
  else if (typeof raw.favicon === 'string' && raw.favicon.trim()) faviconUrl = raw.favicon.trim();
  if (!faviconUrl) faviconUrl = faviconFromUrl(url, 64);

  let icon = '';
  if (typeof raw.icon_url === 'string' && raw.icon_url.trim()) icon = raw.icon_url.trim();
  else if (typeof raw.icon === 'string' && raw.icon.trim()) icon = raw.icon.trim();
  if (!icon) icon = ogImage || faviconUrl || '';

  return {
    id: ts + Math.floor(Math.random() * 1000),
    title,
    url,
    icon_url: icon,
    og_image: ogImage || null,
    favicon_url: faviconUrl || null,
    desc,
    tags,
    created_at: ts
  };
}

function importLinksIntoData(rawItems) {
  const list = Array.isArray(rawItems) ? rawItems : [];
  const existingKeys = new Set((DATA || []).map(d => normalizeUrlForCompare((d && d.url) || '')).filter(Boolean));
  const toAdd = [];
  let duplicateCount = 0;
  let invalidCount = 0;
  const baseTs = Date.now();

  list.forEach((raw, idx) => {
    const normalized = normalizeImportedLinkItem(raw, baseTs + idx + 1);
    if (!normalized) { invalidCount++; return; }
    const key = normalizeUrlForCompare(normalized.url);
    if (!key) { invalidCount++; return; }
    if (existingKeys.has(key)) { duplicateCount++; return; }
    existingKeys.add(key);
    toAdd.push(normalized);
  });

  if (toAdd.length) {
    DATA = toAdd.concat(DATA || []);
    saveToStorage();
    renderTags();
    renderList();
    renderSidebarTags();
    updateSidebarStats();
    if (typeof saveBookmarksToRemote === 'function') saveBookmarksToRemote();
  }

  return { addedCount: toAdd.length, duplicateCount, invalidCount };
}

if (el.pasteJsonBtn) {
  el.pasteJsonBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('クリップボードにテキストがありません。');
        return;
      }

      const items = parseLinkItemsFromText(text);
      if (!items || !items.length) {
        alert('リンクデータとして解析できませんでした。JSON または links 配列形式を貼り付けてください。');
        return;
      }

      if (items.length > 1) {
        if (!confirm('リンクデータを ' + items.length + ' 件検出しました。一括追加しますか？')) return;
        const res = importLinksIntoData(items);
        alert('一括追加しました。追加: ' + res.addedCount + '件 / 重複: ' + res.duplicateCount + '件 / 無効: ' + res.invalidCount + '件');
        console.log('JSON paste: bulk imported', res);
      } else {
        const item = items[0];
        if (!item || typeof item !== 'object') {
          alert('有効なリンクオブジェクトが見つかりません。');
          return;
        }
        fillAddModalFromLinkItem(item);
        console.log('JSON paste: filled form with', item);
      }
    } catch (err) {
      console.warn('JSONペースト失敗:', err);
      alert('クリップボードの読み取りに失敗しました。');
    }
  });
}

/* ========== Keyboard Shortcuts (PC only, Owner only) ========== */
document.addEventListener('keydown', async (e) => {
  // 管理者モードでない場合は無視
  if (isReadOnlyMode) return;

  // 入力フィールドにフォーカス中は無視（テキスト入力を邪魔しない）
  const activeEl = document.activeElement;
  const isTyping = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable
  );

  // 'A' キー: 追加モーダルを開く（入力中でない場合のみ）
  if ((e.key === 'a' || e.key === 'A') && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // モーダルが既に開いている場合は無視
    if (el.addModal && el.addModal.style.display === 'flex') return;
    e.preventDefault();
    closeAllModals();
    openAddModal();
    return;
  }

  // 'V' キー: 追加モーダル内でペースト（URLまたはJSON自動識別）
  if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // 追加モーダルが開いている場合のみ
    if (!el.addModal || el.addModal.style.display !== 'flex') return;
    // 入力フィールドにフォーカス中は通常のペーストを許可
    if (isTyping) return;

    e.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('クリップボードにテキストがありません。');
        return;
      }

      const trimmed = text.trim();

      // URLかどうかを判定
      const isUrl = /^https?:\/\//i.test(trimmed);

      if (isUrl) {
        // URLとしてペースト
        if (el.addUrl) el.addUrl.value = trimmed;
        console.log('Shortcut V: pasted as URL');
      } else {
        const items = parseLinkItemsFromText(trimmed);
        if (items && items.length) {
          if (items.length > 1) {
            const res = importLinksIntoData(items);
            alert('一括追加しました。追加: ' + res.addedCount + '件 / 重複: ' + res.duplicateCount + '件 / 無効: ' + res.invalidCount + '件');
            console.log('Shortcut V: bulk imported', res);
          } else {
            fillAddModalFromLinkItem(items[0]);
            console.log('Shortcut V: pasted as JSON', items[0]);
          }
        } else {
          // 解析失敗時はURL欄にそのまま入れる
          if (el.addUrl) el.addUrl.value = trimmed;
          console.log('Shortcut V: pasted as plain text to URL field');
        }
      }
    } catch (err) {
      console.warn('Shortcut V paste failed:', err);
      alert('クリップボードの読み取りに失敗しました。');
    }
  }
});

// Close any open modal when pressing 'z' (works for all users, not only owner)
document.addEventListener('keydown', (e) => {
  if (!(e.key === 'z' || e.key === 'Z')) return;
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  const activeEl = document.activeElement;
  const isTyping = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable
  );
  if (isTyping) return;

  const anyOpen = (
    (el.addModal && el.addModal.style.display === 'flex') ||
    (el.tagModal && el.tagModal.style.display === 'flex') ||
    (el.detailModal && el.detailModal.style.display === 'flex') ||
    (el.viewModeModal && el.viewModeModal.style.display === 'flex') ||
    (el.hubModal && el.hubModal.style.display === 'flex') ||
    (el.hubCreateModal && el.hubCreateModal.style.display === 'flex') ||
    (el.hubViewModal && el.hubViewModal.style.display === 'flex') ||
    (el.searchOverlay && el.searchOverlay.classList && el.searchOverlay.classList.contains('open')) ||
    (typeof userSettingsModal !== 'undefined' && userSettingsModal && userSettingsModal.style && userSettingsModal.style.display === 'flex')
  );

  if (anyOpen) {
    e.preventDefault();
    try { closeAllModals(); } catch (err) { }
    try { if (typeof closeDetailModal === 'function') closeDetailModal(); } catch (err) { }
    try { if (typeof closeUserSettingsModalFn === 'function') closeUserSettingsModalFn(); } catch (err) { }
  }
});

/* ========== Hub (テキスト共有ハブ) ========== */
(function initHub() {
  const HUB_PATH = 'hubs/' + OWNER_UID;
  let currentHubViewId = null;
  let _hubModalOpenTime = 0;

  function isOwnerLoggedIn() {
    try {
      const user = firebase.auth().currentUser;
      return user && user.uid === OWNER_UID;
    } catch (e) { return false; }
  }

  /* --- Hash password with SHA-256 for storage --- */
  async function hashPassword(pw) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(pw));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* --- Open Hub Modal --- */
  function openHubModal() {
    closeAllModals();
    if (!el.hubModal) return;
    el.hubModal.style.display = 'flex';
    _hubModalOpenTime = Date.now();
    document.body.classList.add('modal-hub-open');
    // Show create button only for owner
    if (el.hubCreateBtn) el.hubCreateBtn.style.display = isOwnerLoggedIn() ? 'inline-block' : 'none';
    loadHubList();
  }

  function closeHubModalFn() {
    if (el.hubModal) el.hubModal.style.display = 'none';
    document.body.classList.remove('modal-hub-open');
  }

  /* --- Load and render hub list from Firebase --- */
  function loadHubList() {
    if (!db || !el.hubList) return;
    el.hubList.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;">読み込み中…</div>';
    const ref = db.ref(HUB_PATH);
    ref.once('value').then(snap => {
      const data = snap.val();
      renderHubList(data);
    }).catch(err => {
      console.error('Hub load error:', err);
      el.hubList.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;">読み込みに失敗しました</div>';
    });
  }

  function renderHubList(data) {
    if (!el.hubList) return;
    if (!data || Object.keys(data).length === 0) {
      el.hubList.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;">ハブはまだありません</div>';
      return;
    }
    const items = Object.entries(data).map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

    const owner = isOwnerLoggedIn();
    el.hubList.innerHTML = items.map(item => {
      const name = escapeHtml(item.name || '無題のハブ');
      const date = item.created_at ? new Date(item.created_at).toLocaleString('ja-JP') : '';
      const deleteBtn = owner ? `<button class="hub-delete-btn small-btn" data-id="${escapeHtml(item.id)}" title="削除">🗑️</button>` : '';
      return `<div class="hub-item" data-id="${escapeHtml(item.id)}">
        <div class="hub-item-info">
          <div class="hub-item-name">${name}</div>
          <div class="hub-item-date">${date}</div>
        </div>
        <div class="hub-item-actions">
          <button class="hub-view-btn open-btn" data-id="${escapeHtml(item.id)}">表示</button>
          ${deleteBtn}
        </div>
      </div>`;
    }).join('');

    // Attach event listeners
    el.hubList.querySelectorAll('.hub-view-btn').forEach(btn => {
      btn.addEventListener('click', () => openHubView(btn.dataset.id));
    });
    el.hubList.querySelectorAll('.hub-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteHub(btn.dataset.id));
    });
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* --- Create Hub --- */
  function openHubCreateModal() {
    if (!el.hubCreateModal) return;
    el.hubModal.style.display = 'none';
    el.hubCreateModal.style.display = 'flex';
    _hubModalOpenTime = Date.now();
    if (el.hubNameInput) el.hubNameInput.value = '';
    if (el.hubTextInput) el.hubTextInput.value = '';
    if (el.hubPasswordInput) { el.hubPasswordInput.value = ''; el.hubPasswordInput.classList.remove('pw-visible'); if (el.hubPasswordToggle) el.hubPasswordToggle.textContent = '\uD83D\uDC41\uFE0F'; }
  }

  function closeHubCreateModal() {
    if (el.hubCreateModal) el.hubCreateModal.style.display = 'none';
    // Re-open hub list
    openHubModal();
  }

  async function saveHub() {
    if (!isOwnerLoggedIn()) {
      alert('ハブの作成はオーナーのみ可能です。');
      return;
    }
    const text = (el.hubTextInput ? el.hubTextInput.value : '').trim();
    const password = (el.hubPasswordInput ? el.hubPasswordInput.value : '').trim();
    const name = (el.hubNameInput ? el.hubNameInput.value : '').trim() || '無題のハブ';

    if (!text) {
      alert('テキストを入力してください。');
      return;
    }
    try {
      const hashedPw = password ? await hashPassword(password) : null;
      const id = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.floor(Math.random() * 10000));
      const hubData = {
        name: name,
        text: text,
        passwordHash: hashedPw,
        created_at: Date.now()
      };
      await db.ref(HUB_PATH + '/' + id).set(hubData);
      if (el.hubCreateModal) el.hubCreateModal.style.display = 'none';
      openHubModal();
    } catch (err) {
      console.error('Hub create error:', err);
      alert('ハブの作成に失敗しました: ' + (err.message || err));
    }
  }

  /* --- Delete Hub --- */
  async function deleteHub(id) {
    if (!isOwnerLoggedIn()) {
      alert('ハブの削除はオーナーのみ可能です。');
      return;
    }
    if (!confirm('このハブを削除しますか？')) return;
    try {
      await db.ref(HUB_PATH + '/' + id).remove();
      loadHubList();
    } catch (err) {
      console.error('Hub delete error:', err);
      alert('削除に失敗しました: ' + (err.message || err));
    }
  }

  /* --- View Hub (password unlock) --- */
  function openHubView(id) {
    currentHubViewId = id;
    if (!el.hubViewModal) return;
    el.hubModal.style.display = 'none';
    el.hubViewModal.style.display = 'flex';
    _hubModalOpenTime = Date.now();
    // Reset state
    if (el.hubViewPasswordSection) el.hubViewPasswordSection.style.display = 'block';
    if (el.hubViewTextSection) el.hubViewTextSection.style.display = 'none';
    if (el.hubViewPasswordInput) { el.hubViewPasswordInput.value = ''; el.hubViewPasswordInput.classList.remove('pw-visible'); if (el.hubViewPasswordToggle) el.hubViewPasswordToggle.textContent = '\uD83D\uDC41\uFE0F'; }
    if (el.hubViewTextContent) el.hubViewTextContent.textContent = '';

    // Load hub data for title and check password requirement
    db.ref(HUB_PATH + '/' + id).once('value').then(snap => {
      const data = snap.val();
      if (!data) return;
      const name = data.name || '無題のハブ';
      if (el.hubViewTitle) el.hubViewTitle.textContent = name;
      
      if (!data.passwordHash) {
        // パスワードなしの場合は直接表示
        if (el.hubViewPasswordSection) el.hubViewPasswordSection.style.display = 'none';
        if (el.hubViewTextSection) el.hubViewTextSection.style.display = 'block';
        if (el.hubViewTextContent) el.hubViewTextContent.textContent = data.text || '';
      }
    }).catch(() => { });
  }

  async function unlockHub() {
    if (!currentHubViewId) return;
    const password = (el.hubViewPasswordInput ? el.hubViewPasswordInput.value : '').trim();
    if (!password) {
      alert('パスワードを入力してください。');
      return;
    }

    try {
      const snap = await db.ref(HUB_PATH + '/' + currentHubViewId).once('value');
      const data = snap.val();
      if (!data) {
        alert('ハブが見つかりません。');
        return;
      }
      if (data.passwordHash) {
        const hashedInput = await hashPassword(password);
        if (hashedInput !== data.passwordHash) {
          alert('パスワードが正しくありません。');
          return;
        }
      }
      // Show text
      if (el.hubViewPasswordSection) el.hubViewPasswordSection.style.display = 'none';
      if (el.hubViewTextSection) el.hubViewTextSection.style.display = 'block';
      if (el.hubViewTextContent) el.hubViewTextContent.textContent = data.text || '';
    } catch (err) {
      console.error('Hub unlock error:', err);
      alert('表示に失敗しました: ' + (err.message || err));
    }
  }

  function closeHubView() {
    if (el.hubViewModal) el.hubViewModal.style.display = 'none';
    currentHubViewId = null;
    // Re-open hub list
    openHubModal();
  }

  async function copyHubText() {
    try {
      const text = el.hubViewTextContent ? el.hubViewTextContent.textContent : '';
      await navigator.clipboard.writeText(text);
      if (el.hubViewCopyBtn) {
        const orig = el.hubViewCopyBtn.textContent;
        el.hubViewCopyBtn.textContent = 'コピー済み✓';
        setTimeout(() => { el.hubViewCopyBtn.textContent = orig; }, 1500);
      }
    } catch (err) {
      alert('コピーに失敗しました。');
    }
  }

  /* --- Wire up event listeners --- */
  if (el.bottomHubBtn) {
    el.bottomHubBtn.addEventListener('click', () => {
      openHubModal();
    });
  }
  if (el.sidebarHubBtn) {
    el.sidebarHubBtn.addEventListener('click', () => {
      openHubModal();
    });
  }

  // Paste button for hub text (overwrites textarea with clipboard content)
  if (el.hubTextPasteBtn) {
    el.hubTextPasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (el.hubTextInput) {
          el.hubTextInput.value = text;
          el.hubTextInput.focus();
          const orig = el.hubTextPasteBtn.textContent;
          el.hubTextPasteBtn.textContent = '✓ ペースト完了';
          setTimeout(() => { el.hubTextPasteBtn.textContent = orig; }, 1500);
        }
      } catch (err) { alert('クリップボードの読み取りに失敗しました。'); }
    });
  }

  // Password show/hide toggles
  function togglePwVisibility(input, btn) {
    if (!input) return;
    const visible = input.classList.toggle('pw-visible');
    if (btn) btn.textContent = visible ? '隠す' : '表示';
  }
  if (el.hubPasswordToggle) el.hubPasswordToggle.addEventListener('click', () => togglePwVisibility(el.hubPasswordInput, el.hubPasswordToggle));
  if (el.hubViewPasswordToggle) el.hubViewPasswordToggle.addEventListener('click', () => togglePwVisibility(el.hubViewPasswordInput, el.hubViewPasswordToggle));
  if (el.closeHubModal) el.closeHubModal.addEventListener('click', closeHubModalFn);
  if (el.hubModal) el.hubModal.addEventListener('click', (e) => { if (e.target === el.hubModal && Date.now() - _hubModalOpenTime > 400) closeHubModalFn(); });

  if (el.hubCreateBtn) el.hubCreateBtn.addEventListener('click', openHubCreateModal);
  if (el.hubCreateCancel) el.hubCreateCancel.addEventListener('click', closeHubCreateModal);
  if (el.hubCreateSave) el.hubCreateSave.addEventListener('click', saveHub);
  if (el.hubCreateModal) el.hubCreateModal.addEventListener('click', (e) => { if (e.target === el.hubCreateModal && Date.now() - _hubModalOpenTime > 400) closeHubCreateModal(); });

  if (el.hubViewCancel) el.hubViewCancel.addEventListener('click', closeHubView);
  if (el.hubViewCloseBtn) el.hubViewCloseBtn.addEventListener('click', closeHubView);
  if (el.hubViewUnlock) el.hubViewUnlock.addEventListener('click', unlockHub);
  if (el.hubViewCopyBtn) el.hubViewCopyBtn.addEventListener('click', copyHubText);
  if (el.hubViewModal) el.hubViewModal.addEventListener('click', (e) => { if (e.target === el.hubViewModal && Date.now() - _hubModalOpenTime > 400) closeHubView(); });
  // Enter key on password input triggers unlock
  if (el.hubViewPasswordInput) el.hubViewPasswordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') unlockHub(); });

  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (clearSearchBtn && el.q) {
    clearSearchBtn.addEventListener('click', () => {
      el.q.value = '';
      state.q = '';
      clearSearchBtn.style.display = 'none';
      renderList();
    });
    el.q.addEventListener('input', () => {
      clearSearchBtn.style.display = el.q.value ? 'flex' : 'none';
    });
    clearSearchBtn.style.display = el.q.value ? 'flex' : 'none';
  }
})();
