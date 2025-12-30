
function toHiragana(str){
  if(!str) return '';
  str = str.normalize('NFKC');
  let out = '';
  for (let ch of str){
    const code = ch.charCodeAt(0);
    if (code >= 0x30A1 && code <= 0x30F4){ out += String.fromCharCode(code - 0x60); }
    else out += ch;
  }
  return out.toLowerCase();
}
function normalizeForSearch(s){ if(!s) return ''; return toHiragana(s).replace(/\s+/g,'').toLowerCase(); }

/* CSV parser removed (unused). Keep utilities small. */
function faviconFromUrl(u, size=64){
  try{ const url = new URL(u); return `https://www.google.com/s2/favicons?sz=${size}&domain=${url.hostname}`; } catch(e){ return '' }
}
function getImageProxy(imageUrl){
  // Use Worker's /img endpoint to proxy images, avoiding CORS/hotlink issues
  if(!imageUrl || !imageUrl.trim()) return '';
  try{
    const proxy = getOgpProxy(); // reuse OGP proxy base URL
    if(!proxy || !proxy.trim()) return imageUrl; // no proxy, return original
    const base = proxy.replace(/\/$/, '');
    return base + '/img?url=' + encodeURIComponent(imageUrl);
  }catch(e){ return imageUrl; }
}
/**
 * Clean/normalize titles returned from OGP/oEmbed
 * - Trim surrounding whitespace
 * - Remove common site suffixes like " - YouTube", " | YouTube", "· YouTube"
 * - If result is empty or only contains site name, return null
 */
function cleanTitle(t){
  if(!t) return null;
  try{
    let s = String(t).trim();
    // remove common separators and trailing site names
    s = s.replace(/^[\-\|\u00B7\s]+|[\-\|\u00B7\s]+$/g, '');
    // common patterns: "Title - YouTube", "Title | YouTube"
    s = s.replace(/\s+[\-\|\u00B7]\s+YouTube$/i, '');
    s = s.replace(/\s+[\-\|\u00B7]\s+Twitter$/i, '');
    s = s.replace(/\s+\|\s+Facebook$/i, '');
    s = s.trim();
    // if only contains 'YouTube' or host-like content, treat as empty
    if(/^youtube(?:\.com)?$/i.test(s) || /^www\.youtube\.com$/i.test(s) || s.length === 0) return null;
    return s || null;
  }catch(e){ return String(t).trim() || null; }
}

/* ------------------ state & dom refs ------------------ */
const VIEW_MODE_KEY = 'bookmark_view_mode_v1'; // localStorage キー
const SORT_KEY = 'bookmark_sort_v1';
// フォルダ機能は廃止されたため、関連する localStorage キーと定数は削除
const state = { q:'', tags: new Set(), sort:'alpha_en_asc', editMode: false, viewMode: 'medium', selectedIds: new Set(), noTagFilter: false };
// in-memory bookmark storage (initialized empty; populated from remote or user actions)
let DATA = [];
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
  addTitleInput: document.getElementById('addTitleInput'),
  addIcon: document.getElementById('addIcon'),
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
  deleteInModal: document.getElementById('deleteInModal'),
  viewSizeSelect: document.getElementById('viewSizeSelect'),
  sortSelect: document.getElementById('sortSelect'),
  quickTagsContainer: document.getElementById('quickTagsContainer')
};

const STORAGE_KEY = 'bookmark_data_v1';
// If you run a local OGP proxy (see ogp-proxy-server), set its base URL here, e.g. 'http://localhost:3000'
// Default OGP proxy (hidden; no UI required). Set to deployed Worker.
const OGP_PROXY = 'https://ogp-proxy.kyu68002.workers.dev';
function getOgpProxy(){ try{ return (localStorage.getItem('ogp_proxy') || OGP_PROXY || '').toString(); }catch(e){ return OGP_PROXY || ''; } }
function saveToStorage(){
  try{
    // ブックマーク関連はローカルに保存しない仕様に変更
    // ここでは UI 関連のレンダリングのみ行う（保存は行わない）
    try{ DATA = dedupeData(DATA || []); }catch(e){}
    
    console.log('saveToStorage: skipped writing bookmark_data_v1 to localStorage (UI-only mode)');
  }catch(e){ console.warn('saveToStorage (UI-only) error', e); }
}
// 正規化して比較用のキーを作る（簡易）
function normalizeUrlForCompare(u){
  try{
    let s = (u||'').toString().trim();
    if(!s) return '';
    if(!/^https?:\/\//i.test(s)) s = 'https://' + s;
    const url = new URL(s);
    // 小文字化、末尾スラッシュ削除、ハッシュ除去
    url.hash = '';
    let path = url.pathname || '/';
    // remove trailing slash except when path is '/'
    if(path.length > 1 && path.endsWith('/')) path = path.replace(/\/+$/, '');
    // basic utm removal for common params
    url.searchParams.forEach((v,k)=>{ if(/^utm_/i.test(k)) url.searchParams.delete(k); });
    const norm = url.protocol + '//' + url.hostname.toLowerCase() + (path === '/' ? '' : path) + (url.search ? '?' + url.searchParams.toString() : '');
    return norm;
  }catch(e){ return (u||'').toString().trim(); }
}

// 配列内の重複 URL を除去する。先に出現するものを残す。
function dedupeData(arr){
  const seen = new Set();
  const res = [];
  (arr || []).forEach(item=>{
    const key = normalizeUrlForCompare(item.url || '');
    if(!key) return; // skip malformed
    if(seen.has(key)) return; // duplicate -> skip
    seen.add(key);
    res.push(item);
  });
  return res;
}
function loadFromStorage(){
  // ブックマークはローカルに保存しないため、読み込みは行わない
  return false;
}

// load and dedupe: called at init to ensure duplicates removed
function loadAndDedupeFromStorage(){
  // localStorage からブックマークをロードしない（UIのみローカル保持）
  return false;
}

/* ------------------ タグ関連レンダリング ------------------ */
function buildAllTags(data){
  return Array.from(new Set((data || []).flatMap(d=>(d.tags || [])))).sort((a,b)=>a.localeCompare(b,'ja'));
}
 
function renderTags(){
  const all = buildAllTags(DATA);
  const showN = 8;
  try{
    if(el.chipContainer){
      el.chipContainer.innerHTML = '';
      // タグなし チップ
      const noTagCount = (DATA || []).filter(d=> !(d.tags && d.tags.length)).length;
      const noTagChip = document.createElement('button');
      noTagChip.className = 'chip' + (state.noTagFilter ? ' active' : '');
      noTagChip.textContent = `タグなし (${noTagCount})`;
      noTagChip.addEventListener('click', ()=>{ state.noTagFilter = !state.noTagFilter; renderTags(); renderList(); });
      el.chipContainer.appendChild(noTagChip);

      all.slice(0,showN).forEach(t=>{
        const count = DATA.filter(d=> (d.tags||[]).includes(t)).length;
        const chip = document.createElement('button');
        chip.className = 'chip' + (state.tags.has(t) ? ' active' : '');
        chip.textContent = `${t} (${count})`;
        chip.addEventListener('click', ()=>{ if(state.tags.has(t)) state.tags.delete(t); else state.tags.add(t); state.noTagFilter = false; renderTags(); renderList(); });
        el.chipContainer.appendChild(chip);
      });
    }
    const remaining = Math.max(0, all.length - showN);
    if(el.moreTagsBtn) el.moreTagsBtn.textContent = remaining>0 ? `タグ（あと ${remaining} 件）` : 'タグ';
    renderModalTags(all);
  }catch(e){ console.warn('renderTags error', e); }
}
function renderModalTags(all){
  try{
    if(!el.modalTags) return;
    el.modalTags.innerHTML = '';
    // タグなし ボタンを先頭に追加
    const noTagCount = (DATA || []).filter(d=> !(d.tags && d.tags.length)).length;
    const noTagBtn = document.createElement('button');
    noTagBtn.className = 'chip' + (state.noTagFilter ? ' active' : '');
    noTagBtn.textContent = `タグなし (${noTagCount})`;
    noTagBtn.addEventListener('click', ()=>{ state.noTagFilter = !state.noTagFilter; renderModalTags(all); renderTags(); renderList(); });
    el.modalTags.appendChild(noTagBtn);

    all.forEach(t=>{
      const count = DATA.filter(d=> (d.tags||[]).includes(t)).length;
      const cb = document.createElement('button');
      cb.className = 'chip' + (state.tags.has(t) ? ' active' : '');
      cb.textContent = `${t} (${count})`;
      cb.addEventListener('click', ()=>{ if(state.tags.has(t)) state.tags.delete(t); else state.tags.add(t); state.noTagFilter = false; renderModalTags(all); renderTags(); renderList(); });
      el.modalTags.appendChild(cb);
    });
  }catch(e){ console.warn('renderModalTags error', e); }
}

/* ------------------ フィルタ・ソート・リスト表示 ------------------ */
function filterAndSort(){
  const qn = normalizeForSearch(state.q);
  let arr = (DATA || []).filter(item=>{
    const inName = normalizeForSearch(item.title).includes(qn);
    const inUrl = normalizeForSearch(item.url).includes(qn);
    const inDesc = normalizeForSearch(item.desc||'').includes(qn);
    const tagsMatch = state.noTagFilter ? (!(item.tags && item.tags.length)) : Array.from(state.tags).every(t=>(item.tags||[]).includes(t));
    return (qn === '' || inName || inUrl || inDesc) && tagsMatch;
  });

  // フォルダ機能は廃止されたため、ここでのフィルタは行いません。

  if(state.sort === 'alpha_en_asc' || state.sort === 'alpha_en_desc'){
    // English-first then Japanese ordering.
    function makeAlphaEnJaKey(s){
      const t = (s||'').toString().trim();
      // presence of ASCII letter/digit -> treat as English group
      const hasLatin = /[A-Za-z0-9]/.test(t);
      if(hasLatin){
        return '0' + t.toLowerCase();
      }
      // fallback: use hiragana-normalized key
      return '1' + toHiragana(t);
    }
    arr.sort((a,b)=>{
      const ka = makeAlphaEnJaKey(a.title || '');
      const kb = makeAlphaEnJaKey(b.title || '');
      if(ka < kb) return -1;
      if(ka > kb) return 1;
      return 0;
    });
    if(state.sort === 'alpha_en_desc') arr.reverse();
  } else if(state.sort === 'date-new'){
    arr.sort((a,b)=> (b.created_at || 0) - (a.created_at || 0));
  } else if(state.sort === 'date-old'){
    arr.sort((a,b)=> (a.created_at || 0) - (b.created_at || 0));
  }
  return arr;
}

function renderList(){
  const arr = filterAndSort();
  el.list.innerHTML = '';
  if(el.countText) el.countText.textContent = `${arr.length} 件`;

  // 表示モードに応じて list 要素にクラスを付与
  el.list.className = 'list';
  if(state.viewMode === 'small') el.list.classList.add('list--small');
  else el.list.classList.add('list--medium');

  arr.forEach(item=>{
    const row = document.createElement('div'); row.className = 'row';

    const iconWrap = document.createElement('div'); iconWrap.className = 'icon-wrap';
    // Show checkbox in edit mode if owner
    if(!isReadOnlyMode && state.editMode){
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'row-selector';
      cb.checked = state.selectedIds.has(item.id);
      cb.addEventListener('click', (e)=>{
        e.stopPropagation();
        if(cb.checked) state.selectedIds.add(item.id); else state.selectedIds.delete(item.id);
        updateHeaderControls();
        renderList();
      });
      iconWrap.appendChild(cb);
    }
    // 表示モード別のアイコン表示:
    // - small / medium: 常にファビコンを表示
    // - large: OGP のアイコン（item.icon_url）を優先、なければファビコン
    // large view disabled: always show favicon for small/medium
    if(false && state.viewMode === 'large' && item.icon_url){
      const img = document.createElement('img');
      img.src = getImageProxy(item.icon_url);
      img.alt = item.title + ' アイコン';
      img.onerror = ()=>{ img.src = faviconFromUrl(item.url,64); };
      iconWrap.appendChild(img);
    } else {
      const img = document.createElement('img');
      img.src = faviconFromUrl(item.url,64);
      img.alt = item.title ? item.title + ' ファビコン' : 'ファビコン';
      img.onerror = ()=>{ iconWrap.textContent = item.title ? item.title[0] : '🔗'; };
      iconWrap.appendChild(img);
    }

    const meta = document.createElement('div'); meta.className = 'meta';
    const title = document.createElement('div'); title.className = 'title'; title.textContent = item.title;
    // Show URL in edit mode if owner
    if(!isReadOnlyMode && state.editMode){
      const urlEl = document.createElement('div'); urlEl.className = 'small muted'; urlEl.textContent = item.url; meta.appendChild(urlEl);
    }

    // 表示モード別のタイトル行: large モードではタイトルの左にファビコンを表示
    // large view disabled: use medium flow
    if(false){
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
      fav.onerror = ()=>{ fav.style.display = 'none'; };
      titleRow.appendChild(fav);
      titleRow.appendChild(title);
      // small モードでは desc と tags を生成しない（パフォーマンス重視）
      if(state.viewMode !== 'small'){
        const desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = item.desc || '';
        const tagsWrap = document.createElement('div'); tagsWrap.className = 'tags';
        (item.tags || []).forEach(t=>{ const s=document.createElement('span'); s.className='tag'; s.textContent=t; tagsWrap.appendChild(s); });
        meta.appendChild(titleRow); meta.appendChild(desc); meta.appendChild(tagsWrap);
      } else {
        meta.appendChild(titleRow);
      }
    } else {
      // small / medium の既存フロー
      if(state.viewMode !== 'small'){
        const desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = item.desc || '';
        const tagsWrap = document.createElement('div'); tagsWrap.className = 'tags';
        (item.tags || []).forEach(t=>{ const s=document.createElement('span'); s.className='tag'; s.textContent=t; tagsWrap.appendChild(s); });
        meta.appendChild(title); meta.appendChild(desc); meta.appendChild(tagsWrap);
      } else {
        meta.appendChild(title);
      }
    }

    const actions = document.createElement('div'); actions.className = 'actions';
    
    if(isReadOnlyMode){
      // Read-only: no action buttons (row click opens link)
    } else {
      // Owner can edit: show edit/delete buttons
      const btn = document.createElement('button'); btn.className = 'open-btn'; btn.setAttribute('aria-label', item.title + ' を編集する');
      btn.innerHTML = '編集 <span style="opacity:0.85">✎</span>';
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); openEdit(item); });
      
      const del = document.createElement('button'); del.className='small-btn'; del.textContent='削除';
      del.addEventListener('click',(e)=>{ e.stopPropagation(); if(confirm('このリンクを削除しますか？')){ DATA = DATA.filter(d=>d.id !== item.id); saveToStorage(); renderTags(); renderList(); saveBookmarksToRemote(); } });
      
      const edit = document.createElement('button'); edit.className='small-btn'; edit.textContent='編集';
      edit.addEventListener('click',(e)=>{ e.stopPropagation(); openEdit(item); });
      
      if(!state.editMode){
        actions.appendChild(edit);
        actions.appendChild(del);
      }
      actions.appendChild(btn);
    }

    iconWrap.style.cursor = 'default';
    iconWrap.draggable = false;

    row.appendChild(iconWrap); row.appendChild(meta); row.appendChild(actions);
    // 行クリックの動作
    row.addEventListener('click', (e) => {
      // Owner in edit mode: toggle selection
      if(!isReadOnlyMode && state.editMode){
        const isSelected = state.selectedIds.has(item.id);
        if(isSelected) state.selectedIds.delete(item.id); else state.selectedIds.add(item.id);
        updateHeaderControls();
        renderList();
        return;
      }
      // Otherwise: open link
      if(state.selectedIds && state.selectedIds.size > 0) return;
      try{
        if(item && item.url){ window.open(item.url, '_blank', 'noopener'); }
      }catch(e){}
    });
    el.list.appendChild(row);
  });

  if(arr.length === 0) el.list.innerHTML = '<div style="color:var(--muted)">該当するリンクがありません。</div>';
}

/* ------------------ 編集フロー ------------------ */
function openEdit(item){
  openAddModal();
  el.addUrl.value = item.url;
  el.addTitleInput.value = item.title;
  el.addIcon.value = item.icon_url || '';
  el.addDesc.value = item.desc || '';
  el.addTags.value = (item.tags || []).join(',');
  el.saveAdd.dataset.editId = item.id;
  try{ if(el.deleteInModal) el.deleteInModal.style.display = 'inline-block'; }catch(e){}
}

/* ------------------ 表示モード初期化 ------------------ */
function loadViewMode(){
  try{
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if(saved){
      if(['small','medium'].includes(saved)) state.viewMode = saved;
      else if(saved === 'large') state.viewMode = 'medium'; // fallback: large disabled
    }
  }catch(e){ console.warn('viewMode load failed', e); }
}
// saveViewMode defined earlier; keep single implementation

function loadSort(){
  try{
    const s = localStorage.getItem(SORT_KEY);
    if(s && typeof s === 'string'){
      state.sort = s;
    }
    // Sort UI is now in hamburger menu, updated dynamically when menu is created
  }catch(e){ console.warn('loadSort failed', e); }
}

function saveSort(){
  try{ localStorage.setItem(SORT_KEY, state.sort); }catch(e){}
}
function saveViewMode(){
  try{ localStorage.setItem(VIEW_MODE_KEY, state.viewMode); }catch(e){}
}
// Update header controls visibility based on edit mode and selection
function updateHeaderControls(){
  try{
    const hasSelection = (state.selectedIds && state.selectedIds.size > 0);
    if(el.topDeleteSelectedBtn) el.topDeleteSelectedBtn.style.display = (hasSelection || state.editMode) ? 'inline-block' : 'none';
    if(el.topOpenAdd) el.topOpenAdd.style.display = hasSelection ? 'none' : (state.editMode ? 'none' : 'inline-block');
    if(el.openAdd) el.openAdd.style.display = hasSelection ? 'none' : '';
    if(el.topEditModeBtn) el.topEditModeBtn.classList.toggle('active', state.editMode);
    if(el.editModeBtn) el.editModeBtn.classList.toggle('active', state.editMode);
  }catch(e){/* ignore */}
}

function updateViewModeUI(){
  const radios = document.querySelectorAll('.view-mode-menu input[type="radio"]');
  radios.forEach(r=>{
    r.checked = (r.value === state.viewMode);
    const label = r.closest('.menu-radio');
    if(label) label.setAttribute('aria-checked', r.checked ? 'true' : 'false');
  });
}

/* ------------------ イベントワイヤリング ------------------ */
el.q.addEventListener('input', ()=>{ state.q = el.q.value; renderList(); });
// Sort control is now in hamburger menu (createViewMenu function)

// 表示モード選択イベント: 旧メニューは削除。モーダルで選択します。

// Initialize view mode modal/button elements
setTimeout(()=>{
  try{
    el.viewModeBtn = document.getElementById('viewModeBtn');
    el.viewModeModal = document.getElementById('viewModeModal');
    el.viewModeCancel = document.getElementById('viewModeCancel');
    el.viewModeSave = document.getElementById('viewModeSave');
    if(el.viewModeBtn) el.viewModeBtn.addEventListener('click', ()=>{ if(el.viewModeModal) el.viewModeModal.style.display='flex'; const radios = document.getElementsByName('vmode'); radios.forEach && radios.forEach(r=> r.checked = (r.value === state.viewMode)); });
    if(el.viewModeCancel) el.viewModeCancel.addEventListener('click', ()=>{ if(el.viewModeModal) el.viewModeModal.style.display='none'; });
    if(el.viewModeSave) el.viewModeSave.addEventListener('click', ()=>{
      const radios = document.getElementsByName('vmode'); let sel = 'medium';
      for(let i=0;i<radios.length;i++){ if(radios[i].checked) { sel = radios[i].value; break; } }
      // 'large' option was removed; no special fallback required
      state.viewMode = sel; saveViewMode(); updateViewModeUI(); renderList(); if(el.viewModeModal) el.viewModeModal.style.display='none';
    });
  }catch(e){ console.warn('viewMode modal init failed', e); }
}, 50);

 

// ハンバーガーの既定の動作は保持しますが、旧メニューは削除済みです。
const headerToggleBtn = document.getElementById('headerToggle');
if(headerToggleBtn){
  headerToggleBtn.addEventListener('click', (e)=>{ e.stopPropagation(); /* reserved */ });
}

function toggleEditMode(){
  if(isReadOnlyMode) {
    console.log('toggleEditMode: disabled in read-only mode');
    alert('編集権限がありません。オーナーとしてログインしてください。');
    return;
  }
  state.editMode = !state.editMode;
  document.body.classList.toggle('edit-mode', state.editMode);
  if(el.editModeBtn) el.editModeBtn.classList.toggle('active', state.editMode);
  if(el.topEditModeBtn) el.topEditModeBtn.classList.toggle('active', state.editMode);
  updateHeaderControls();
  renderList();
}
// Edit mode button (will be shown/hidden based on permissions)
if(el.editModeBtn) el.editModeBtn.addEventListener('click', toggleEditMode);
// Edit mode buttons (will be shown/hidden based on permissions)
if(el.topEditModeBtn) el.topEditModeBtn.addEventListener('click', toggleEditMode);
  if(el.topDeleteSelectedBtn) el.topDeleteSelectedBtn.addEventListener('click', ()=>{
    if(!state.editMode) return;
    if(state.selectedIds.size === 0){ alert('削除対象が選択されていません'); return; }
    if(!confirm(`選択された ${state.selectedIds.size} 件を削除しますか？`)) return;
    // remove selected
    const ids = Array.from(state.selectedIds);
    DATA = DATA.filter(d=>!ids.includes(d.id));
    state.selectedIds.clear();
    saveToStorage(); renderTags(); renderList();
    if (typeof saveBookmarksToRemote === 'function') saveBookmarksToRemote();
  });
// View size select
if(el.viewSizeSelect){
  el.viewSizeSelect.value = state.viewMode || 'medium';
  el.viewSizeSelect.addEventListener('change', (e)=>{
    state.viewMode = e.target.value;
    saveViewMode();
    renderList();
  });
}

// Sort select
if(el.sortSelect){
  el.sortSelect.value = state.sort || 'alpha_en_asc';
  el.sortSelect.addEventListener('change', (e)=>{
    state.sort = e.target.value;
    saveSort();
    renderList();
  });
}

// Add button listeners (will be shown/hidden based on permissions)
if(el.topOpenAdd) el.topOpenAdd.addEventListener('click', ()=>{ if(!isReadOnlyMode) openAddModal(); });
if(el.openAdd) el.openAdd.addEventListener('click', ()=>{ if(!isReadOnlyMode) openAddModal(); });
if(el.cancelAdd) el.cancelAdd.addEventListener('click', ()=>{ closeAddModal(); });
if(el.deleteInModal) el.deleteInModal.addEventListener('click', ()=>{
  try{
    const eid = el.saveAdd && el.saveAdd.dataset && el.saveAdd.dataset.editId ? Number(el.saveAdd.dataset.editId) : null;
    if(!eid){ alert('削除対象がありません'); return; }
    if(!confirm('このリンクを削除しますか？')) return;
    DATA = DATA.filter(d=>d.id !== eid);
    delete el.saveAdd.dataset.editId;
    try{ el.deleteInModal.style.display = 'none'; }catch(e){}
    saveToStorage(); renderTags(); renderList(); closeAddModal();
    if (typeof saveBookmarksToRemote === 'function') saveBookmarksToRemote();
  }catch(e){ console.error('deleteInModal error', e); alert('削除に失敗しました'); }
});

if(el.moreTagsBtn) el.moreTagsBtn.addEventListener('click', ()=>{ if(el.tagModal) el.tagModal.style.display='flex'; document.body.classList.add('modal-tag-open'); try{ if(el.tagSearch){ el.tagSearch.value=''; el.tagSearch.focus(); } }catch(e){} });
if(el.closeModal) el.closeModal.addEventListener('click', ()=>{ if(el.tagModal) el.tagModal.style.display='none'; document.body.classList.remove('modal-tag-open'); setTimeout(adjustWrapForHeader, 50); });
if(el.tagModal) el.tagModal.addEventListener('click', (e)=>{ if(e.target === el.tagModal){ el.tagModal.style.display='none'; document.body.classList.remove('modal-tag-open'); setTimeout(adjustWrapForHeader, 50); } });
if(el.tagSearch) el.tagSearch.addEventListener('input', ()=>{ const q=el.tagSearch.value.trim().toLowerCase(); const all=buildAllTags(DATA); const filtered = all.filter(t=>t.toLowerCase().includes(q)); renderModalTags(filtered); });

function renderQuickTags(){
  if(!el.quickTagsContainer) return;
  el.quickTagsContainer.innerHTML = '';
  const existingTags = buildAllTags(DATA);
  existingTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'small-btn';
    btn.textContent = tag;
    btn.style.fontSize = '11px';
    btn.style.padding = '4px 8px';
    btn.addEventListener('click', ()=>{
      if(!el.addTags) return;
      const currentTags = el.addTags.value.split(',').map(t => t.trim()).filter(t => t);
      if(!currentTags.includes(tag)){
        currentTags.push(tag);
        el.addTags.value = currentTags.join(', ');
      }
    });
    el.quickTagsContainer.appendChild(btn);
  });
}

function openAddModal(){
  el.addModal.style.display='flex';
  try{ document.body.classList.add('modal-add-open'); }catch(e){}
  el.addUrl.value=''; el.addTitleInput.value=''; el.addIcon.value=''; el.addDesc.value=''; el.addTags.value='';
  delete el.saveAdd.dataset.editId;
  try{ if(el.deleteInModal) el.deleteInModal.style.display = 'none'; }catch(e){}
  renderQuickTags();
  
  setTimeout(()=>el.addUrl.focus(),50);
}
function closeAddModal(){
  try{ document.body.classList.remove('modal-add-open'); }catch(e){}
  el.addModal.style.display='none';
}

/* export/import JSON UI removed */

/* JSON import/export feature removed (unused). */

el.pasteUrlBtn.addEventListener('click', async ()=>{
  try{
    const text = await navigator.clipboard.readText();
    if(text.trim()) el.addUrl.value = text.trim();
  } catch(err){
    console.warn('クリップボード読み込みに失敗: ', err);
    alert('クリップボードからの読み込みに失敗しました。手動で貼り付けてください。');
  }
});

/* save/add bookmark: ここに saveBookmarksToRemote() 呼び出しを追加 */
// save/add bookmark: try to fetch page title when title input is empty
el.saveAdd.addEventListener('click', async ()=>{
  const url = el.addUrl.value.trim();
  if(!url){ alert('URL は必須です'); return; }

  // Debug: log initial input state
  try{ console.debug('[saveAdd] initial input url:', el.addUrl.value, ' initial title input:', el.addTitleInput.value); }catch(e){}

  let title = el.addTitleInput.value.trim();

  async function fetchTitleFromUrl(u){
    try{
      // 正規化: スキームが無ければ https:// を付与して absolute URL にする
      let targetUrl = (u || '').toString().trim();
      if(!/^https?:\/\//i.test(targetUrl)){
        targetUrl = 'https://' + targetUrl;
      }
      // quick validate
      try{ new URL(targetUrl); } catch(e){ return null; }
      // try using configured proxy first, supporting both '/fetch?url=' and '?url=' styles,
      // then fall back to direct fetch if proxy is not set or fails.
      const controller = new AbortController();
      const id = setTimeout(()=>controller.abort(), 5000);
      const proxy = getOgpProxy();
      async function tryFetchReturnResponse(url){
        try{
          const r = await fetch(url, { method: 'GET', mode: 'cors', redirect: 'follow', signal: controller.signal });
          if(!r || !r.ok) return null;
          return r;
        }catch(e){ return null; }
      }

      let resp = null;
      // Debug: log which proxy/base will be used
      try{ console.debug('[fetchTitleFromUrl] using proxy:', proxy, ' target:', targetUrl); }catch(e){}
      if(proxy && proxy.trim()){
        const base = proxy.replace(/\/$/, '');
        // try worker-style query first
        resp = await tryFetchReturnResponse(base + '?url=' + encodeURIComponent(targetUrl)) || await tryFetchReturnResponse(base + '/fetch?url=' + encodeURIComponent(targetUrl));
        try{ if(resp) console.debug('[fetchTitleFromUrl] proxy response status:', resp.status, resp.statusText); }catch(e){}
      }
      if(!resp){
        // Do NOT fall back to direct fetch from browser to avoid CORB/CORS issues.
        // If proxy failed or is not set, return null so caller can handle fallback.
        clearTimeout(id);
        return null;
      }
      clearTimeout(id);

      // If proxy/endpoint returned JSON (OGP-only Worker), parse it
      const contentType = (resp.headers && resp.headers.get) ? (resp.headers.get('content-type') || '') : '';
      // デバッグログ: レスポンスの Content-Type を出力
      try{ console.debug('[fetchTitleFromUrl] resp content-type:', contentType, ' for ', u); }catch(e){}
      try{
        if(contentType.includes('application/json')){
          // JSON 応答をログ（大きすぎないよう先頭のみ）
          const txt = await resp.clone().text();
          try{ console.debug('[fetchTitleFromUrl] json response:', txt.slice(0,1000)); }catch(e){}
          const json = JSON.parse(txt);
          try{ console.debug('[fetchTitleFromUrl] parsed json:', json && json.ok ? json.meta : json); }catch(e){}
          if(json && json.ok && json.meta){
            const t = cleanTitle(json.meta.title) || json.meta.title || null;
            return { title: t, description: json.meta.description || null, image: json.meta.image || null };
          }
        }
      }catch(e){ console.debug('[fetchTitleFromUrl] json parse failed', e); /* not json or parse failed, fallback to text parsing */ }

      // Fallback: treat response as HTML text and parse for meta tags
      try{
        const text = await resp.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        // collect og:title, og:description, og:image (also check name variants)
        const getMeta = (sel) => {
          const el = doc.querySelector(sel) || doc.querySelector(sel.replace('property', 'name'));
          if(!el) return null;
          return el.getAttribute('content') || el.getAttribute('value') || el.textContent || null;
        };
        const ogTitle = getMeta('meta[property="og:title"]') || getMeta('meta[name="twitter:title"]');
        const ogDesc = getMeta('meta[property="og:description"]') || getMeta('meta[name="description"]') || getMeta('meta[name="twitter:description"]');
        const ogImage = getMeta('meta[property="og:image"]') || getMeta('meta[name="twitter:image"]');
        const title = (ogTitle && ogTitle.trim()) || (doc.querySelector('title') && doc.querySelector('title').textContent.trim()) || null;
        return { title: title, description: ogDesc ? (''+ogDesc).trim() : null, image: ogImage ? (''+ogImage).trim() : null };
      }catch(e){ /* parse error */ }
      return null;
    }catch(e){ return null; }
  }

  // If fetchTitleFromUrl returned null for title but URL is a known provider (YouTube),
  // try a public oEmbed-like fallback (noembed.com) to get title/thumbnail.
  try{
    const host = (new URL(targetUrl)).hostname.toLowerCase();
    const providerHosts = ['youtube.com','www.youtube.com','youtu.be'];
    if(providerHosts.includes(host) || providerHosts.some(h=>host.endsWith('.' + h))){
      try{
        const oe = await fetch('https://noembed.com/embed?url=' + encodeURIComponent(targetUrl), { method:'GET', mode:'cors' });
        if(oe && oe.ok){
          const j = await oe.json();
          // noembed returns { title, author_name, thumbnail_url, ... }
          return { title: j.title || null, description: j.author_name || null, image: j.thumbnail_url || null };
        }
      }catch(e){ /* ignore noembed errors */ }
    }
  }catch(e){ /* ignore */ }

  // only attempt fetch when title is empty
  let fetched = null;
    if(!title){
    try{ fetched = await fetchTitleFromUrl(url); }catch(e){}
    if(fetched && fetched.title){
      try{ console.debug('[saveAdd] fetched.title (raw):', fetched.title); }catch(e){}
      const cleaned = cleanTitle(fetched.title);
      try{ console.debug('[saveAdd] fetched.title (cleaned):', cleaned); }catch(e){}
      title = cleaned || null;
    }
  } else {
    // even if title provided, we may still want description/icon from ogp
    try{ fetched = await fetchTitleFromUrl(url); }catch(e){}
  }

  // fallback to hostname or the raw url -- but require confirmation if OGP fetch failed
  try{
    if(!title){
      if(fetched === null){
        // OGP fetch failed or was blocked (CORB/CORS). Ask user before saving a fallback title.
        const proceed = confirm('ページ情報の取得に失敗しました。タイトルが空のまま保存しますか？\n(キャンセルすると保存を中止します)');
        if(!proceed){
          return; // abort save
        }
      }
      title = (new URL(url)).hostname;
    }
  } catch(e){ if(!title) title = url; }

  // decide icon and desc: prefer user-specified, otherwise OGP (via proxy), otherwise favicon
  let icon = el.addIcon.value.trim();
  // まずユーザー指定を優先
  if(!icon){
    // OGP で取得できている場合は採用（プロキシ経由で保存するので CORS 問題は回避される）
    if(fetched && fetched.image){
      // Store the original OGP image URL (will be proxied when rendered)
      icon = fetched.image;
    } else {
      // No OGP image: use favicon as fallback
      icon = faviconFromUrl(url,64);
    }
  }
  let desc = el.addDesc.value.trim();
  if(!desc && fetched && fetched.description) desc = fetched.description;
  const tags = (el.addTags.value||'').split(/[,;|]/).map(s=>s.trim()).filter(Boolean);
  

  // Debug: final title before save
  try{ console.debug('[saveAdd] final title before save:', title); }catch(e){}

  // ensure input shows the final title
  try{ if(title) el.addTitleInput.value = title; }catch(e){}

  if(el.saveAdd.dataset.editId){
    const eid = Number(el.saveAdd.dataset.editId);
    const idx = DATA.findIndex(d=>d.id === eid);
    if(idx !== -1){
      // 編集時に他のエントリと URL が重複しないかチェック
      try{
        const newKey = normalizeUrlForCompare(url);
        const dup = DATA.some((d,i)=> i !== idx && normalizeUrlForCompare(d.url) === newKey);
        if(dup){ alert('別のエントリと URL が重複します。編集を中止しました。'); return; }
      }catch(e){}
      const created = DATA[idx].created_at || Date.now();
      DATA[idx].url = url; DATA[idx].title = title; DATA[idx].icon_url = icon; DATA[idx].desc = desc; DATA[idx].tags = tags;
      DATA[idx].created_at = created;
    }
  } else {
    // 追加前に重複 URL をチェック
    try{
      const newKey = normalizeUrlForCompare(url);
      const exists = (DATA || []).some(d=> normalizeUrlForCompare(d.url) === newKey );
      if(exists){ alert('同じ URL のブックマークは既に存在します。'); return; }
    }catch(e){}
    const id = Date.now() + Math.floor(Math.random()*1000);
    const newItem = { id, title, url, icon_url: icon, desc, tags, created_at: Date.now() };
    DATA.unshift(newItem);
  }

  saveToStorage();
  renderTags(); renderList();
  closeAddModal();
  if (typeof saveBookmarksToRemote === 'function') saveBookmarksToRemote();
});

// Enterキーによる自動保存機能は無効化しました（誤保存防止のため）。

/* init */
// load and dedupe stored bookmarks
if(!loadAndDedupeFromStorage()){
  // keep initial DATA if local empty
}

loadViewMode(); // 表示モードを localStorage から読み込み
loadSort(); // ソート設定を localStorage から読み込み
updateViewModeUI(); // ラジオボタンの状態を更新
renderTags(); renderList();

function adjustWrapForHeader(){
  const hdr = document.querySelector('header.card');
  const wrap = document.querySelector('.wrap');
  if(hdr && wrap){
    const h = hdr.offsetHeight || 0;
    // align content directly under header; remove header internal bottom padding/gap
    try{
      const cs = window.getComputedStyle(hdr);
      const pb = parseFloat(cs.getPropertyValue('padding-bottom')) || 0;
      const rowGap = parseFloat(cs.getPropertyValue('row-gap')) || parseFloat(cs.getPropertyValue('gap')) || 0;
      // subtract internal bottom padding and row gap so content sits flush beneath visible header
      const topPad = Math.max(0, h - pb - rowGap);
      wrap.style.paddingTop = topPad + 'px';
      // expose adjusted header height as CSS variable so sticky elements can align exactly
      document.documentElement.style.setProperty('--hdr-h', topPad + 'px');
    }catch(e){
      wrap.style.paddingTop = (h) + 'px';
      try{ document.documentElement.style.setProperty('--hdr-h', h + 'px'); }catch(e){}
    }
  }
}
adjustWrapForHeader();
window.addEventListener('resize', adjustWrapForHeader);

// Hide loading overlay if present (page initialization complete)
try{
  const lo = document.getElementById('loadingOverlay');
  if(lo){ lo.style.display = 'none'; }
}catch(e){}

const headerEl = document.querySelector('header.card');
// Hamburger menu removed - view size and sort now inline with count

window.LINKS_DATA = DATA; window.rebuild = ()=>{ renderTags(); renderList(); };

document.addEventListener('keydown', async (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key === 'v'){
    if(!e.target.matches('input, textarea')){
      e.preventDefault();
      try{
        const text = await navigator.clipboard.readText();
        if(text.trim()){
          openAddModal();
          el.addUrl.value = text.trim();
          setTimeout(()=>el.addTitleInput.focus(), 100);
        }
      } catch(err){
        console.warn('Clipboard paste failed:', err);
      }
    }
  }
  if((e.ctrlKey || e.metaKey) && e.key === 'i'){
    e.preventDefault();
    toggleEditMode();
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
console.log('Current page URL:', window.location.href);
console.log('Current page origin:', window.location.origin);
console.log('Firebase authDomain:', firebaseConfig.authDomain);

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
    console.log('Initializing Firebase app...');
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase app initialized');
  }
  // 初期化直後にpersistenceを設定
  try {
    if (firebase.auth && firebase.auth().setPersistence) {
      console.log('Setting initial persistence to LOCAL...');
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => console.log('Initial persistence set successfully'))
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
let isReadOnlyMode = true; // Will be set to false if logged-in user is the owner

/* Check if current user is owner and update UI accordingly */
function updateEditPermissions(user){
  const isOwner = user && user.uid === OWNER_UID;
  isReadOnlyMode = !isOwner;
  
  console.log('updateEditPermissions: user=', user ? user.uid : 'null', 'isOwner=', isOwner, 'isReadOnlyMode=', isReadOnlyMode);
  
  // Show/hide edit buttons based on ownership
  if(isOwner){
    // Owner can edit: show all edit buttons
    if(el.topOpenAdd) el.topOpenAdd.style.display = 'inline-block';
    if(el.topEditModeBtn) el.topEditModeBtn.style.display = 'inline-block';
    if(el.editModeBtn) el.editModeBtn.style.display = 'inline-block';
  } else {
    // Not owner: hide edit buttons
    if(el.topOpenAdd) el.topOpenAdd.style.display = 'none';
    if(el.topEditModeBtn) el.topEditModeBtn.style.display = 'none';
    if(el.editModeBtn) el.editModeBtn.style.display = 'none';
    if(el.topDeleteSelectedBtn) el.topDeleteSelectedBtn.style.display = 'none';
  }
}

/* local <-> functions (DATA を使う) */
function getLocalBookmarks(){
  if (typeof DATA !== 'undefined' && Array.isArray(DATA)) return DATA;
  if (typeof window !== 'undefined' && Array.isArray(window.DATA)) return window.DATA;
  return [];
}
function setLocalBookmarks(arr){
  const normalized = Array.isArray(arr) ? arr : [];
  
  try{ DATA = normalized; } catch(e){}
  try{ window.DATA = normalized; } catch(e){}
  // Do not persist bookmarks to localStorage in UI-only mode
  try{ console.log('setLocalBookmarks: updated in-memory DATA; not saved to localStorage (UI-only mode)'); }catch(e){}
  try { renderTags(); renderList(); } catch(e){ /* ignore */ }
}

function ensureIdAndTsForSync(item){
  if (!item) item = {};
  if (!item.id) {
    if (window.crypto && crypto.randomUUID) item.id = crypto.randomUUID();
    else item.id = String(Date.now()) + '-' + Math.floor(Math.random()*1000);
  }
  if (!item.created_at) item.created_at = Date.now();
  item.updated_at = Date.now();
  return item;
}

function arrayOrObjToMap(data){
  const m = {};
  if (!data) return m;
  if (Array.isArray(data)) data.forEach(it => { if(it && it.id) m[it.id] = it; });
  else if (typeof data === 'object') Object.values(data).forEach(it => { if(it && it.id) m[it.id] = it; });
  return m;
}
function mapToArray(mapObj){ return Object.values(mapObj || {}); }
function deepEqualMaps(a,b){
  const ka = Object.keys(a||{}).sort();
  const kb = Object.keys(b||{}).sort();
  if (ka.length !== kb.length) return false;
  for(let k of ka){
    if(!b[k]) return false;
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false;
  }
  return true;
}

/* sync */
function startSyncForUser(uid){
  if (!db) return;
  // Always use OWNER_UID for read-only public view
  firebaseUid = OWNER_UID;
  console.log('startSyncForUser (read-only mode) owner uid=', OWNER_UID);
  const path = 'bookmarks/' + OWNER_UID;
  const ref = db.ref(path);

  if (currentRemoteRef && typeof currentRemoteRef.off === 'function') {
    try { currentRemoteRef.off(); } catch(e){ /* ignore */ }
  }
  currentRemoteRef = ref;

  ref.once('value').then(snap => {
    const remoteVal = snap.val();
    try{
      if (remoteVal && ((Array.isArray(remoteVal) && remoteVal.length > 0) || (typeof remoteVal === 'object' && Object.keys(remoteVal).length > 0))) {
        let arr = mapToArray(arrayOrObjToMap(remoteVal)).sort((a,b)=> (b.updated_at||0)-(a.updated_at||0));
        setLocalBookmarks(arr);
      } else {
        // リモートにデータが無い場合: 単純にローカルを上書きして消さないようにする
        // 既にローカルにアイテムがある場合はそれをリモート側へ保存して初期化する
        // Read-only mode: do not upload data
        console.log('Remote empty (read-only mode) — no data to display');
      }
    }catch(e){ console.error(e); }
  }).catch(console.error);

  ref.on('value', snapshot => {
    const remoteVal = snapshot.val();
    try {
      // If remoteVal is empty/null, do not overwrite local data to avoid accidental data loss
      if (remoteVal && ((Array.isArray(remoteVal) && remoteVal.length > 0) || (typeof remoteVal === 'object' && Object.keys(remoteVal).length > 0))) {
        let arr = mapToArray(arrayOrObjToMap(remoteVal)).sort((a,b)=> (b.updated_at||0)-(a.updated_at||0));
        setLocalBookmarks(arr);
      } else {
        console.log('Remote snapshot empty — ignoring to avoid overwriting local data');
      }
    } catch(e){ console.error(e); }
  });
}

function handleRemoteSnapshot(remoteVal, ref){
  // リモートデータが正しい単一ソースとなるよう、単純にローカルを上書きする
  try{
    const arr = mapToArray(arrayOrObjToMap(remoteVal)).sort((a,b)=> (b.updated_at||0)-(a.updated_at||0));
    setLocalBookmarks(arr);
  }catch(e){ console.error('handleRemoteSnapshot error', e); }
}

function saveBookmarksToRemote(){
  if (isReadOnlyMode) { console.log('saveBookmarksToRemote: skipped (read-only mode)'); return; }
  if (!firebaseUid || !db){ console.warn('saveBookmarksToRemote: no firebase uid/db'); return; }
  const ref = db.ref('bookmarks/' + firebaseUid);
  let local = (getLocalBookmarks() || []).map(it => ensureIdAndTsForSync(it));
  console.log('saveBookmarksToRemote uid=', firebaseUid, 'items=', local.length);
  // Safety guard: if local is empty but remote currently contains data, DO NOT overwrite (to avoid accidental deletion)
  try{
    ref.once('value').then(snap => {
      const remoteVal = snap.val();
      const remoteHasData = remoteVal && ((Array.isArray(remoteVal) && remoteVal.length > 0) || (typeof remoteVal === 'object' && Object.keys(remoteVal).length > 0));
      if(remoteHasData && (!Array.isArray(local) || local.length === 0)){
        console.warn('Aborting remote save: remote has data but local is empty — prevented accidental overwrite');
        // Optionally notify the user in UI
        try{ if(window && window.alert) window.alert('リモート側にデータが存在するため、空のデータで上書きするのを防ぎました。手動で確認してください。'); }catch(e){}
        return;
      }
      // Otherwise it's safe to set (either remote empty or local has items)
      ref.set(local).then(()=>{ console.log('saveBookmarksToRemote: saved', firebaseUid); }).catch(err=>{ console.error('saveBookmarksToRemote error', err); alert('リモート保存に失敗しました: ' + (err && err.message || err)); });
    }).catch(err=>{ console.error('saveBookmarksToRemote read-before-set failed', err); /* fallback to set to avoid blocking in unexpected cases */ ref.set(local).catch(e=>{ console.error('fallback set failed', e); }); });
  }catch(e){ console.error('saveBookmarksToRemote guard error', e); ref.set(local).catch(err=>{ console.error('saveBookmarksToRemote final set error', err); }); }
}

/* helper wrapper */
function addBookmarkAndSync(bookmark){
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
function openUserSettingsModal(){
  if(userSettingsModal) userSettingsModal.style.display = 'flex';
  document.body.classList.add('modal-settings-open');
  updateModalLoginSection();
  try{
    const v = localStorage.getItem('ogp_proxy') || '';
    const inp = document.getElementById('ogpProxyInput');
    if(inp) inp.value = v;
    // sync dark mode toggle state when opening modal
    try{
      const dm = localStorage.getItem('dark_mode') === '1';
      const chk = document.getElementById('darkModeToggle');
      if(chk) chk.checked = dm;
    }catch(e){}
  }catch(e){}
}
function closeUserSettingsModalFn(){
  if(userSettingsModal) userSettingsModal.style.display = 'none';
  document.body.classList.remove('modal-settings-open');
}
if(userInfoBtn) userInfoBtn.addEventListener('click', openUserSettingsModal);
if(closeUserSettingsModal) closeUserSettingsModal.addEventListener('click', closeUserSettingsModalFn);
if(userSettingsModal) userSettingsModal.addEventListener('click', (e)=>{ if(e.target === userSettingsModal) closeUserSettingsModalFn(); });

// Dark mode handling
function applyDarkMode(enabled){
  try{
    if(enabled) document.documentElement.classList.add('dark-mode'); else document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('dark_mode', enabled ? '1' : '0');
  }catch(e){ console.warn('applyDarkMode error', e); }
}

// Bind toggle if present
try{
  const dmToggle = document.getElementById('darkModeToggle');
  if(dmToggle){
    dmToggle.addEventListener('change', (e)=>{ applyDarkMode(!!e.target.checked); });
  }
  // Apply persisted preference on script load
  const saved = localStorage.getItem('dark_mode') === '1';
  applyDarkMode(saved);
}catch(e){ /* ignore */ }

// ログインセクション表示切替
function updateModalLoginSection(){
  const user = (window.firebase && firebase.auth) ? firebase.auth().currentUser : null;
  if(user && !user.isAnonymous){
    if(loginSection) loginSection.style.display = 'none';
    if(logoutSection) logoutSection.style.display = 'block';
    if(loggedInEmail) loggedInEmail.textContent = 'ログイン中: ' + (user.email || user.uid);
  } else {
    if(loginSection) loginSection.style.display = 'block';
    if(logoutSection) logoutSection.style.display = 'none';
  }
}

// ヘッダーのユーザー情報更新
function updateAuthUI(user){
  if(!userInfoText) return;
  if(!user){
    userInfoText.textContent = 'ユーザー: ゲスト';
    if(userMiniAvatar) userMiniAvatar.innerHTML = '👤';
    if(userAvatarLarge) userAvatarLarge.innerHTML = '👤';
    // 未ログイン時はローカルの一覧をクリアしてログイン促進メッセージを表示
    try{ setLocalBookmarks([]); } catch(e){}
    try{
      if(el && el.countText) el.countText.textContent = 'ログインして下さい';
      if(el && el.list) el.list.innerHTML = '<div id="guestLoginPrompt" style="color:var(--muted);padding:14px;border-radius:10px;background:var(--card);cursor:pointer">ログインして下さい</div>';
      // attach click handler to the guest login prompt area to open user settings modal
      setTimeout(()=>{
        const wrap = document.getElementById('guestLoginPrompt');
        if(wrap){ wrap.addEventListener('click', ()=>{ openUserSettingsModal(); }); }
      },50);
      // 非ログイン時は追加や編集ボタンを隠す
      if(el && el.openAdd) el.openAdd.style.display = 'none';
      if(el && el.topOpenAdd) el.topOpenAdd.style.display = 'none';
      if(el && el.editModeBtn) el.editModeBtn.style.display = 'none';
      if(el && el.topEditModeBtn) el.topEditModeBtn.style.display = 'none';
    }catch(e){}
  } else {
    // ログイン時は UI を有効化
    try{
      if(el && el.openAdd) el.openAdd.style.display = '';
      if(el && el.topOpenAdd) el.topOpenAdd.style.display = '';
      if(el && el.editModeBtn) el.editModeBtn.style.display = '';
      if(el && el.topEditModeBtn) el.topEditModeBtn.style.display = '';
    }catch(e){}
    const isAnonymous = user.isAnonymous === true;
    const displayText = isAnonymous ? 'ゲスト' : (user.email || user.displayName || user.uid);
    userInfoText.textContent = 'ユーザー: ' + displayText;
    // アバター（photoURL が無ければ providerData、さらに localStorage をフォールバック）
    try{ console.log('updateAuthUI user:', user); }catch(e){}
    const savedAvatar = localStorage.getItem('userAvatar');
    const providerPhoto = (user.providerData && Array.isArray(user.providerData) && user.providerData.length)
      ? (user.providerData.find(p=>p && p.photoURL) || {}).photoURL
      : null;
    const photoURL = user.photoURL || providerPhoto || savedAvatar || null;

    if(photoURL){
      userAvatarUrl = photoURL;
      // img 要素を生成して安全に差し替える
      try{
        const miniImg = document.createElement('img');
        miniImg.alt = 'avatar';
        miniImg.src = photoURL;
        miniImg.style.width = '100%';
        miniImg.style.height = '100%';
        miniImg.style.objectFit = 'cover';
        miniImg.onerror = ()=>{ if(userMiniAvatar) userMiniAvatar.innerHTML = '👤'; };

        const largeImg = document.createElement('img');
        largeImg.alt = 'avatar';
        largeImg.src = photoURL;
        largeImg.style.width = '100%';
        largeImg.style.height = '100%';
        largeImg.style.objectFit = 'cover';
        largeImg.onerror = ()=>{ if(userAvatarLarge) userAvatarLarge.innerHTML = '👤'; };

        if(userMiniAvatar){ userMiniAvatar.innerHTML = ''; userMiniAvatar.appendChild(miniImg); }
        if(userAvatarLarge){ userAvatarLarge.innerHTML = ''; userAvatarLarge.appendChild(largeImg); }
      } catch(e){
        if(userMiniAvatar) userMiniAvatar.innerHTML = '👤';
        if(userAvatarLarge) userAvatarLarge.innerHTML = '👤';
      }
      // アバター表示のみ（ファビコンの変更は不要なので実行しない）
    } else {
      if(userMiniAvatar) userMiniAvatar.innerHTML = '👤';
      if(userAvatarLarge) userAvatarLarge.innerHTML = '👤';
    }
  }
  updateModalLoginSection();
}

// ファビコン制御は削除（不要）

// アバターアップロード
if(uploadAvatarBtn) uploadAvatarBtn.addEventListener('click', ()=>{ if(avatarUploadInput) avatarUploadInput.click(); });
if(avatarUploadInput) avatarUploadInput.addEventListener('change', (e)=>{
  const file = e.target.files && e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    userAvatarUrl = ev.target.result;
    if(userMiniAvatar) userMiniAvatar.innerHTML = `<img src="${userAvatarUrl}" alt="avatar">`;
    if(userAvatarLarge) userAvatarLarge.innerHTML = `<img src="${userAvatarUrl}" alt="avatar">`;
    localStorage.setItem('userAvatar', userAvatarUrl);
    // DBにも保存
    const uid = firebaseUid || (window.firebase && firebase.auth && firebase.auth().currentUser && firebase.auth().currentUser.uid);
    if(uid && db){
      db.ref(`users/${uid}`).update({ avatar: userAvatarUrl }).catch(e=>console.warn('avatar save failed',e));
    }
  };
  reader.readAsDataURL(file);
});

/* OGP proxy UI bindings removed — using hidden default proxy set in OGP_PROXY constant */

async function signInWithGoogle(){
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
      try{
        localStorage.setItem('auth_redirect_origin', window.location.href);
        console.log('Saved origin URL:', window.location.href);
      }catch(e){}
      
      try{
        // リダイレクト前にセッション永続化を確実に設定
        console.log('Setting persistence to LOCAL');
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        console.log('Persistence set successfully');
      }catch(e){ 
        console.error('setPersistence before redirect failed', e); 
      }
      
      try{ 
        localStorage.setItem('auth_redirecting', '1');
        localStorage.setItem('auth_redirect_time', Date.now().toString());
        console.log('Set auth_redirecting flag at', new Date().toISOString());
      }catch(e){
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
    try{
      // Do not await setPersistence here to preserve the user gesture for the popup
      // awaiting can cause the popup to be blocked by the browser
      if(firebase.auth && firebase.auth().setPersistence){
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(()=> console.log('Persistence set (async)'))
          .catch(e=> console.warn('setPersistence (async) failed', e));
      }
    }catch(e){ console.warn('setPersistence call failed', e); }

    const res = await firebase.auth().signInWithPopup(provider);
    console.log('signInWithPopup result:', res && res.user && res.user.uid);
    
    // サインイン直後に明示的に同期を開始し、res.user を使って確実に同期を行う
    try{
      const signedUser = (res && res.user) ? res.user : (firebase.auth().currentUser || null);
      if(signedUser && signedUser.uid){
        // 確実に firebaseUid を設定
        firebaseUid = signedUser.uid;
        startSyncForUser(signedUser.uid);
        const local = getLocalBookmarks() || [];
        if(local.length > 0){
          console.log('Local has items after signIn, pushing to remote');
          saveBookmarksToRemote();
        }
      } else {
        console.warn('No signedUser found after signInWithPopup');
      }
    }catch(e){ console.warn('postSignIn sync failed', e); }
    return;
  } catch(e){
    console.error('Google sign-in error', e);
    if(e.code) console.error('Error code:', e.code);
    alert('Googleサインインに失敗しました: ' + (e && (e.message || e.code) || e));
  }
}

async function signOut(){
  try {
    await firebase.auth().signOut();
    alert('サインアウトしました');
  } catch(e){
    console.error('signOut error', e);
    alert('サインアウトエラー: ' + (e && (e.message || e.code) || e));
  }
}

if (googleSignInBtn2) {
  // Bind a direct handler that calls signInWithPopup synchronously
  googleSignInBtn2.addEventListener('click', async (e) => {
    try{
      console.log('googleSignInBtn2 clicked - invoking popup flow');
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      // Do not await persistence here to preserve the user gesture
      if(firebase.auth && firebase.auth().setPersistence){
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(()=> console.log('persistence set (async)'))
          .catch(e=> console.warn('persistence set failed (async)', e));
      }

      // Call signInWithPopup immediately in the click handler context
      const res = await firebase.auth().signInWithPopup(provider);
      console.log('popup sign-in result (button):', res);
      const signedUser = (res && res.user) ? res.user : (firebase.auth().currentUser || null);
      if(signedUser && signedUser.uid){
        firebaseUid = signedUser.uid;
        startSyncForUser(signedUser.uid);
        const local = getLocalBookmarks() || [];
        if(local.length > 0){ saveBookmarksToRemote(); }
      }
    }catch(err){
      console.error('googleSignInBtn2 signIn error', err);
      // If popup blocked or other error, fall back to redirect flow
      try{ console.log('Falling back to redirect flow'); localStorage.setItem('auth_redirecting','1'); }catch(e){}
      try{ await firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()); }catch(e){ console.error('redirect fallback failed', e); }
    }
  });
}
if (signOutBtn2) signOutBtn2.addEventListener('click', async ()=>{
  await signOut();
  closeUserSettingsModalFn();
});

/* onAuthStateChanged */
if (window.firebase) {
  // まずgetRedirectResultを処理してからonAuthStateChangedを設定
  console.log('Setting up Firebase auth listeners...');
  
  // ページ読み込み時のリダイレクトフラグ確認
  const wasRedirecting = localStorage.getItem('auth_redirecting');
  const redirectTime = localStorage.getItem('auth_redirect_time');
  const redirectOrigin = localStorage.getItem('auth_redirect_origin');
  
  if(wasRedirecting){
    console.log('=== REDIRECT DETECTED ===');
    console.log('Redirect started at:', redirectTime ? new Date(parseInt(redirectTime)).toISOString() : 'unknown');
    console.log('Redirect origin:', redirectOrigin || 'unknown');
    console.log('Current URL:', window.location.href);
    console.log('Time elapsed:', redirectTime ? (Date.now() - parseInt(redirectTime)) + 'ms' : 'unknown');
  }
  
  // getRedirectResultを先に処理
  firebase.auth().getRedirectResult().then(result => {
    console.log('=== getRedirectResult ===');
    console.log('Full result object:', result);
    console.log('Has user:', !!result?.user);
    console.log('Has credential:', !!result?.credential);
    
    if(result?.user){
      console.log('✓ User from redirect:', result.user.uid, result.user.email);
    }
    if(result?.credential){
      console.log('✓ Credential from redirect:', result.credential);
    }
    
    // リダイレクトフラグをクリア
    try{ 
      localStorage.removeItem('auth_redirecting');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('auth_redirect_origin');
    }catch(e){}
  }).catch(err => {
    console.error('=== getRedirectResult ERROR ===');
    console.error('Error object:', err);
    if(err.code) console.error('Error code:', err.code);
    if(err.message) console.error('Error message:', err.message);
    
    // リダイレクトフラグをクリア
    try{ 
      localStorage.removeItem('auth_redirecting');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('auth_redirect_origin');
    }catch(e){}
    
    // 特定のエラーのみユーザーに通知
    if(err.code && err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request'){
      alert('ログイン処理でエラーが発生しました: ' + err.message);
    }
  });
  
  // onAuthStateChangedを設定（これがメインの認証状態監視）
  firebase.auth().onAuthStateChanged(async user => {
    console.log('=== onAuthStateChanged ===');
    console.log('User:', user ? user.uid : 'null', user ? user.email : '');
    
    updateAuthUI(user);
    updateEditPermissions(user);
    
    if (!user) {
      // 未ログイン時でも公開データを読み込む（読み取り専用）
      console.log('No authenticated user - loading public data in read-only mode');
      startSyncForUser(null); // OWNER_UIDのデータを読み込む
      return;
    }
    
    // ログイン成功
    console.log('✓ User authenticated:', user.uid);
    console.log('User email:', user.email);
    console.log('User displayName:', user.displayName);
    
    try{
        // If this user is not the owner, immediately sign them out (keep UI visible)
        if(user.uid !== OWNER_UID){
          console.warn('Non-owner attempted login, signing out:', user.uid);
          try{ alert('このサイトはオーナーのみログイン可能です。'); }catch(e){}
          try{ await firebase.auth().signOut(); }catch(e){ console.warn('signOut after non-owner login failed', e); }
          // ensure UI reflects guest state and load public data
          try{ updateAuthUI(null); updateEditPermissions(null); }catch(e){}
          startSyncForUser(null);
          return;
        }

        firebaseUid = user.uid;
        startSyncForUser(user.uid);
      
      // リダイレクト後ならメッセージ表示（wasRedirectingは既にクリア済みなので別の方法で判定）
      // onAuthStateChangedは複数回発火するので、初回のみ通知
      const notifiedKey = 'auth_login_notified_' + user.uid;
      const alreadyNotified = sessionStorage.getItem(notifiedKey);
      
      if(!alreadyNotified){
        console.log('First login detection in this session');
        setTimeout(()=>{ alert('ログインしました！'); }, 300);
        try{ sessionStorage.setItem(notifiedKey, '1'); }catch(e){}
        
        // ローカルデータを同期
        try{
          const local = getLocalBookmarks() || [];
          if(local.length > 0){
            console.log('Local has items, pushing to remote');
            saveBookmarksToRemote();
          }
        }catch(e){ console.warn('post-login sync failed', e); }
      }
    }catch(e){ 
      console.error('startSyncForUser failed', e); 
    }
  });
}

/* merge anonymous -> target */
/* anonymous-merge logic removed: app now requires explicit Google login only */

/* unload 保険 */
window.addEventListener('beforeunload', ()=>{ try{ saveBookmarksToRemote(); } catch(e){} });
