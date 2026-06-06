const loadBtn = document.getElementById("loadBtn");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const rarityFilterBtn = document.getElementById("rarityFilterBtn");
const sortToggleBtn = document.getElementById("sortToggleBtn");
const tableViewEl = document.getElementById("tableView");
const detailModalEl = document.getElementById("detailModal");
const modalBackdropEl = document.getElementById("modalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitleEl = document.getElementById("modalTitle");
const modalContentEl = document.getElementById("modalContent");
const lastUpdatedEl = document.getElementById("lastUpdated");

// Rarity modal
const rarityModalEl = document.getElementById("rarityModal");
const rarityModalBackdropEl = document.getElementById("rarityModalBackdrop");
const rarityModalCloseBtn = document.getElementById("rarityModalCloseBtn");
const rarityModalContentEl = document.getElementById("rarityModalContent");

const SORT_MODES = [
  { value: "", label: "並び替え: レア度順" },
  { value: "strength-desc", label: "並び替え: 強さ順(高い順)" },
  { value: "strength-asc", label: "並び替え: 強さ順(低い順)" },
  { value: "difficulty-desc", label: "並び替え: 難易度順(高い順)" },
  { value: "difficulty-asc", label: "並び替え: 難易度順(低い順)" },
  { value: "name-asc", label: "並び替え: 50音順" },
];

let currentSortIndex = 0;
let currentRarityFilter = "";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcNVApUIB8pKEmcyoKSF56gp43BIA_v93oWOgDPZRbIS3PcOIbu9TOh2DTf1W_Vmn4yEsePDqN1Clj/pub?output=csv";

const ASSET_BASE_PATH = "/image";

const STAR_ICON = {
  1: `${ASSET_BASE_PATH}/star1.png`,
  2: `${ASSET_BASE_PATH}/star2.png`,
};

const GADGET_ICON = {
  1: `${ASSET_BASE_PATH}/gad1.png`,
  2: `${ASSET_BASE_PATH}/gad2.png`,
};

const GEAR_NAME_TO_INDEX = {
  スピード: 1,
  ヒール: 2,
  ダメージ: 3,
  ビジョン: 4,
  シールド: 5,
  ガジェット短縮: 6,
  ウルト回転: 7,
  リロード速度: 8,
  ペット: 9,
  赤: 10,
};

const MODE_NAME_TO_KEY = {
  eme: "eme",
  godatu: "godatu",
  hotzone: "hotzone",
  knock: "knock",
  soccer: "soccer",
  syokin: "syokin",
};

const ROLE_LABELS = {
  "タンク": { emoji: "", color: "#3b82f6" },
  "アサシン": { emoji: "", color: "#ef4444" },
  "サポート": { emoji: "", color: "#22c55e" },
  "シューター": { emoji: "", color: "#f59e0b" },
  "コントローラー": { emoji: "", color: "#8b5cf6" },
  "スローワー": { emoji: "", color: "#f97316" },
};

const ROLE_SORT_ORDER = {
  "タンク": 1,
  "アサシン": 2,
  "シューター": 3,
  "スローワー": 4,
  "コントローラー": 5,
  "サポート": 6,
};

const RARITY_COLOR_TO_NAME = {
  "#97ee8d": "レア",
  "#80c3fd": "スーパーレア",
  "#d88bf6": "ハイパーレア",
  "#ff8090": "ウルトラレア",
  "#fff88f": "レジェンドレア",
  "#2c0249": "ウルトラレジェンドレア",
};

const RARITY_SORT_ORDER = ["#97ee8d", "#80c3fd", "#d88bf6", "#ff8090", "#fff88f", "#2c0249"];

const REQUIRED_COLUMNS = ["name", "image", "tuyosa", "sutapa", "gaje", "g1", "g2", "g3"];

const HEADER_ALIASES = {
  name: ["name", "キャラ名", "名前"],
  image: ["image", "アイコン", "icon"],
  tuyosa: ["tuyosa", "強さ"],
  sutapa: ["sutapa", "スタパ", "スターパワー"],
  gaje: ["gaje", "ガジェ", "ガジェット"],
  g1: ["g1"],
  g2: ["g2"],
  g3: ["g3"],
  g4: ["g4"],
  rare: ["rare", "レア", "レア度", "レアリティ"],
  com: ["com", "comment", "コメント"],
  skinimage: ["skinimage", "skin_image", "スキン画像"],
  skincome: ["skincome", "skin_comment", "スキンコメント"],
  m1: ["m1"],
  m2: ["m2"],
  m3: ["m3"],
  m4: ["m4"],
  role: ["role", "ロール", "役割"],
  difficulty: ["difficulty", "難易度"],
  tips: ["tips", "tip", "コツ", "ポイント"],
  banner: ["banner", "バナー"],
  guide: ["guide", "ガイド"],
  alias: ["alias", "表記ゆれ", "よみ", "読み", "yomi", "ヨミ", "ふりがな", "フリガナ", "カナ", "kana", "ruby", "ルビ"],
  hiragana: ["hiragana", "ひらがな"],
  addedDate: ["added", "addeddate", "実装日", "追加日"],
  updatedDate: ["updated", "updateddate", "更新日", "最終更新"],
};

let currentCharacters = [];

if (loadBtn) {
  loadBtn.addEventListener("click", async () => {
    await loadCharactersFromCsvUrl();
  });
}

function toggleSort() {
  currentSortIndex = (currentSortIndex + 1) % SORT_MODES.length;
  updateSortUI();
  renderCurrentView();
}

function updateSortUI() {
  const label = SORT_MODES[currentSortIndex].label;
  if (sortToggleBtn) sortToggleBtn.textContent = label;
}

if (sortToggleBtn) {
  sortToggleBtn.addEventListener("click", toggleSort);
}

searchInput.addEventListener("input", () => {
  renderCurrentView();
});

modalCloseBtn.addEventListener("click", closeModal);
modalBackdropEl.addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    if (typeof closeRarityModal === "function") closeRarityModal();
  }
});

// --- Rarity modal ---
function openRarityModal() {
  rarityModalEl.hidden = false;
  document.body.classList.add("modal-open");
}
function closeRarityModal() {
  rarityModalEl.hidden = true;
  document.body.classList.remove("modal-open");
}

if (rarityFilterBtn) rarityFilterBtn.addEventListener("click", openRarityModal);
if (rarityModalCloseBtn) rarityModalCloseBtn.addEventListener("click", closeRarityModal);
if (rarityModalBackdropEl) rarityModalBackdropEl.addEventListener("click", closeRarityModal);

document.addEventListener("DOMContentLoaded", async () => {
  await loadCharactersFromCsvUrl();
});

async function loadCharactersFromCsvUrl() {
  try {
    setStatus("CSVを取得中...");
    const cacheBusterUrl = CSV_URL + "&t=" + Date.now();
    const response = await fetch(cacheBusterUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      setStatus("データ行がありません。", true);
      currentCharacters = [];
      renderCurrentView();
      return;
    }

    const headers = rows[0].map((header) => header.trim().toLowerCase());
    const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

    if (missing.length > 0) {
      setStatus(`ヘッダーが不足しています: ${missing.join(", ")}`, true);
      currentCharacters = [];
      renderCurrentView();
      return;
    }

    const indexMap = buildIndexMap(headers);

    currentCharacters = rows
      .slice(1)
      .filter((row) => row.some((cell) => cell.trim() !== ""))
      .map((row, idx) => {
        const char = normalizeCharacter(row, indexMap);
        char.originalIndex = idx;
        return char;
      });

    updateRarityOptions(currentCharacters);
    setLastUpdatedFromTopRow(currentCharacters);

    renderCurrentView();
    setStatus(`${currentCharacters.length}件を表示しました。`);
  } catch (error) {
    setStatus("CSVの取得に失敗しました。公開設定やネット接続を確認してください。", true);
    currentCharacters = [];
    renderCurrentView();
    console.error(error);
  }
}

function getFilteredCharacters() {
  const query = (searchInput.value ?? "").trim().toLowerCase();
  const selectedRare = currentRarityFilter;
  const sortKey = SORT_MODES[currentSortIndex].value;

  const filtered = currentCharacters.filter((character) => {
    const nameMatched = !query ||
      (character.name ?? "").toLowerCase().includes(query) ||
      (character.alias ?? "").toLowerCase().includes(query);
    const rareMatched = !selectedRare || character.rare === selectedRare;
    return nameMatched && rareMatched;
  });

  if (sortKey) {
    filtered.sort((a, b) => {
      const isUnreleased = (char) => {
        const val = char.tuyosa;
        return val === null || val === undefined || String(val).trim() === "" || !Number.isFinite(Number(val));
      };
      const unreleasedA = isUnreleased(a);
      const unreleasedB = isUnreleased(b);

      if (unreleasedA && !unreleasedB) return 1;
      if (!unreleasedA && unreleasedB) return -1;

      let diff = 0;
      if (sortKey === "strength-desc") {
        diff = Number(b.tuyosa ?? 0) - Number(a.tuyosa ?? 0);
      } else if (sortKey === "strength-asc") {
        diff = Number(a.tuyosa ?? 0) - Number(b.tuyosa ?? 0);
      } else if (sortKey === "difficulty-desc") {
        const diffA = a.difficulty || 999;
        const diffB = b.difficulty || 999;
        diff = diffB - diffA;
      } else if (sortKey === "difficulty-asc") {
        const diffA = a.difficulty || 999;
        const diffB = b.difficulty || 999;
        diff = diffA - diffB;
      } else if (sortKey === "name-asc") {
        const nameA = a.hiragana || a.name || "";
        const nameB = b.hiragana || b.name || "";
        diff = nameA.localeCompare(nameB, "ja");
      }

      if (diff !== 0) return diff;

      if (sortKey !== "name-asc") {
        const getRarityRank = (rareHex) => {
          if (!rareHex) return 999;
          const index = RARITY_SORT_ORDER.indexOf(rareHex.toLowerCase());
          return index === -1 ? 999 : index;
        };

        const rareA = getRarityRank(a.rare);
        const rareB = getRarityRank(b.rare);
        if (rareA !== rareB) return rareA - rareB;
      }

      return (a.originalIndex ?? 0) - (b.originalIndex ?? 0);
    });
  }

  return filtered;
}

function renderCurrentView() {
  renderTableView(getFilteredCharacters());
}

function renderTableView(characters) {
  tableViewEl.innerHTML = "";

  if (characters.length === 0) {
    tableViewEl.innerHTML = '<div class="empty">表示できるデータがありません。</div>';
    return;
  }

  const rowsHtml = characters
    .map((character, index) => {
      const imagePath = resolveCharacterImagePath(character.image);
      const starPath = STAR_ICON[character.sutapa];
      const gadgetPath = GADGET_ICON[character.gaje];
      const gearIcons = createGearIconsHtml(character.gears, false);
      const imageBgStyle = character.rareColor ? ` style="background-color:${escapeHtml(character.rareColor)}"` : "";

      const imageCell = character.image
        ? `<div class="table-image-wrap" data-index="${index}"${imageBgStyle}><img src="${escapeHtml(imagePath)}" alt="${escapeHtml(character.name)}" class="table-char-image" loading="lazy" /><span class="table-char-name">${escapeHtml(character.name)}</span></div>`
        : `<div class="table-image-wrap" data-index="${index}"><span>-</span></div>`;

      const starCell = starPath
        ? `<div class="table-icon-wrap"><img src="${escapeHtml(starPath)}" alt="スターパワー${character.sutapa}" class="table-sg-icon" loading="lazy" /></div>`
        : "-";

      const gadgetCell = gadgetPath
        ? `<div class="table-icon-wrap"><img src="${escapeHtml(gadgetPath)}" alt="ガジェット${character.gaje}" class="table-sg-icon" loading="lazy" /></div>`
        : "-";

      return `
        <tr class="${character.tuyosa >= 4 ? "is-high-strength" : ""}">
          <td class="cell-image">${imageCell}</td>
          <td class="cell-strength">${createStrengthHtml(character.tuyosa, "table")}</td>
          <td class="cell-difficulty">${createDifficultyHtml(character.difficulty)}</td>
          <td class="cell-icon">${starCell}</td>
          <td class="cell-icon">${gadgetCell}</td>
          <td class="cell-gears">${gearIcons || "-"}</td>
        </tr>
      `;
    })
    .join("");

  tableViewEl.innerHTML = `
    <div class="table-wrap">
      <table class="rating-table">
        <thead>
          <tr class="table-header-row">
            <th class="th-image sortable-th" data-sorts=",name-asc" title="タップでレア度順 / 50音順を切り替え">アイコン <span class="sort-indicator"></span></th>
            <th class="th-strength sortable-th" data-sorts="strength-desc,strength-asc" title="タップで強さ順（昇順/降順）">強さ <span class="sort-indicator"></span></th>
            <th class="th-difficulty sortable-th" data-sorts="difficulty-asc,difficulty-desc" title="タップで難易度順（昇順/降順）">難易度 <span class="sort-indicator"></span></th>
            <th colspan="3" class="th-build">おすすめビルド</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;

  const currentSortKey = SORT_MODES[currentSortIndex].value;
  tableViewEl.querySelectorAll(".sortable-th").forEach(th => {
    const sorts = th.dataset.sorts.split(",");
    const indicator = th.querySelector(".sort-indicator");

    if (sorts.includes(currentSortKey)) {
      th.classList.add("is-active");
      if (currentSortKey === "") indicator.textContent = "▼";
      else if (currentSortKey === "name-asc") indicator.textContent = "▲";
      else if (currentSortKey === "strength-desc") indicator.textContent = "▼";
      else if (currentSortKey === "strength-asc") indicator.textContent = "▲";
      else if (currentSortKey === "difficulty-desc") indicator.textContent = "▼";
      else if (currentSortKey === "difficulty-asc") indicator.textContent = "▲";
    } else {
      th.classList.remove("is-active");
      indicator.textContent = "▼";
    }

    th.addEventListener("click", () => {
      let nextKey = sorts[0];
      const idx = sorts.indexOf(currentSortKey);
      if (idx !== -1) {
        nextKey = sorts[(idx + 1) % sorts.length];
      }

      const newIndex = SORT_MODES.findIndex(m => m.value === nextKey);
      if (newIndex !== -1) {
        currentSortIndex = newIndex;
        updateSortUI();
        renderCurrentView();
      }
    });
  });

  tableViewEl.querySelectorAll(".table-image-wrap[data-index]").forEach((wrap) => {
    wrap.addEventListener("click", () => {
      const idx = Number(wrap.dataset.index);
      openModal(characters[idx]);
    });
  });
}

function openModal(character) {
  const imagePath = resolveCharacterImagePath(character.image);
  const starPath = STAR_ICON[character.sutapa];
  const gadgetPath = GADGET_ICON[character.gaje];

  const nameTxt = escapeHtml(character.name || "(名前なし)");
  const dateBadge = character.addedDate
    ? ` <span class="modal-date-badge">実装日 ${escapeHtml(character.addedDate)}</span>`
    : '';
  modalTitleEl.innerHTML = nameTxt + dateBadge;

  // Banner (external URL) takes priority for top image in modal
  const bannerSrc = character.banner || "";
  const bannerHtml = bannerSrc
    ? `<img src="${escapeHtml(bannerSrc)}" alt="${escapeHtml(character.name)}" class="modal-banner" loading="lazy" />`
    : (character.image
      ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(character.name)}" class="modal-main-image" loading="lazy" />`
      : '<div class="modal-main-image modal-noimage">画像なし</div>');

  const starHtml = starPath
    ? `<img src="${escapeHtml(starPath)}" alt="スターパワー${character.sutapa}" class="icon icon-sg" loading="lazy" />`
    : '<span class="meta-dim">-</span>';

  const gadgetHtml = gadgetPath
    ? `<img src="${escapeHtml(gadgetPath)}" alt="ガジェット${character.gaje}" class="icon icon-sg" loading="lazy" />`
    : '<span class="meta-dim">-</span>';
  const gearsInlineHtml = createGearIconsHtml(character.gears, false) || '<span class="meta-dim">-</span>';
  const modeIconsHtml = createModeIconsHtml(character.modes);

  const comHtml = character.com
    ? `<div class="modal-com"><p class="meta">${escapeHtml(character.com)}</p></div>`
    : '';

  const guideHtml = character.guide && /^https?:\/\//i.test(character.guide)
    ? `<a href="${escapeHtml(character.guide)}" target="_blank" rel="noopener noreferrer" class="guide-link"> Brawl Insights で詳細を見る →</a>`
    : '';

  const roleInfo = ROLE_LABELS[character.role];
  const roleHtml = character.role
    ? `<span class="modal-role-badge" style="background:${roleInfo ? roleInfo.color : '#6b7280'}">${roleInfo ? roleInfo.emoji + ' ' : ''}${escapeHtml(character.role)}</span>`
    : '';

  const difficultyHtml = character.difficulty
    ? `<span class="modal-diff-inline">難易度: ${createDifficultyHtml(character.difficulty, "modal")}</span>`
    : '';

  const tagRowHtml = (roleHtml || difficultyHtml)
    ? `<div class="modal-tag-row">${roleHtml}${difficultyHtml}</div>`
    : '';

  const tipsHtml = character.tips
    ? `<div class="modal-tips"><p class="modal-tips-icon"><hl-icon name="lightbulb"></hl-icon></p><p class="modal-tips-text">${escapeHtml(character.tips)}</p></div>`
    : '';

  modalContentEl.innerHTML = `
    <div class="modal-section">${bannerHtml}</div>
    ${tagRowHtml}
    <div class="meta modal-strength-row">強さ: ${createStrengthHtml(character.tuyosa, "modal")}</div>
    ${tipsHtml}
    <p class="modal-meta-title">おすすめビルド</p>
    <div class="meta modal-icon-row">${starHtml}${gadgetHtml}${gearsInlineHtml}</div>
    ${modeIconsHtml ? `<p class="modal-meta-title">おすすめモード</p><div class="meta modal-mode-row">${modeIconsHtml}</div>` : ""}
    ${comHtml}
    ${guideHtml}
  `;

  const modalStrengthRow = modalContentEl.querySelector(".modal-strength-row");
  if (modalStrengthRow) {
    modalStrengthRow.querySelectorAll(".strength-wrap, .strength-bar").forEach((el) => el.remove());
    if (!modalStrengthRow.querySelector(".modal-strength-wrap")) {
      modalStrengthRow.innerHTML = `強さ: ${createStrengthHtml(character.tuyosa, "modal")}`;
    }
  }

  detailModalEl.hidden = false;
  document.body.classList.add("modal-open");
}

function createStrengthHtml(value, variant = "table") {
  const rawValue = value;
  if (
    rawValue === null ||
    rawValue === undefined ||
    String(rawValue).trim() === "" ||
    !Number.isFinite(Number(rawValue))
  ) {
    return '<span class="meta-dim">未実装</span>';
  }

  const safeValue = Math.max(1, Math.min(5, Number(rawValue) || 1));

  if (variant === "modal") {
    const dots = Array.from({ length: 5 }, (_, index) => {
      const onClass = index < safeValue ? " is-on" : "";
      return `<span class="modal-strength-dot${onClass}"></span>`;
    }).join("");

    return `<span class="modal-strength-wrap modal-strength-level-${safeValue}"><span class="modal-strength-meter">${dots}</span><span class="modal-strength-value">${safeValue}/5</span></span>`;
  }

  const bars = Array.from({ length: 5 }, (_, index) => {
    const onClass = index < safeValue ? " is-on" : "";
    return `<span class="strength-bar${onClass}"></span>`;
  }).join("");

  let modeClass = "strength-table";
  if (variant === "card") modeClass = "strength-card";
  const levelClass = `strength-level-${safeValue}`;
  return `<span class="strength-wrap ${modeClass} ${levelClass}"><span class="strength-meter">${bars}</span></span>`;
}

function createDifficultyHtml(value) {
  const DIFF_LABEL = { 1: "低", 2: "中", 3: "高" };
  const label = DIFF_LABEL[value];
  if (!label) return '<span class="meta-dim">-</span>';
  return `<span class="diff-badge diff-${value}">${label}</span>`;
}

function closeModal() {
  detailModalEl.hidden = true;
  document.body.classList.remove("modal-open");
}

function createGearIconsHtml(gears, withLabel) {
  if (!gears || gears.length === 0) return "";

  const items = gears
    .map((gearName) => {
      const iconPath = getGearIconPath(gearName);
      if (!iconPath) {
        return withLabel ? `<span class="gear-fallback">${escapeHtml(gearName)}</span>` : "";
      }

      if (withLabel) {
        return `<span class="gear-chip"><img src="${escapeHtml(iconPath)}" alt="${escapeHtml(gearName)}" class="icon icon-gear" loading="lazy" /><span>${escapeHtml(gearName)}</span></span>`;
      }

      return `<img src="${escapeHtml(iconPath)}" alt="${escapeHtml(gearName)}" class="table-gear-icon" loading="lazy" />`;
    })
    .filter((item) => item !== "")
    .join("");

  return withLabel ? `<div class="gear-chip-wrap">${items}</div>` : `<div class="gear-icon-wrap">${items}</div>`;
}

function createModeIconsHtml(modes) {
  if (!modes || modes.length === 0) return "";

  const items = modes
    .map((modeName) => {
      const iconPath = getModeIconPath(modeName);
      if (!iconPath) return "";
      return `<img src="${escapeHtml(iconPath)}" alt="${escapeHtml(modeName)}" class="mode-icon" loading="lazy" />`;
    })
    .filter((item) => item !== "")
    .join("");

  if (!items) return "";
  return `<div class="mode-icon-wrap">${items}</div>`;
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

function normalizeCharacter(row, indexMap) {
  const name = getFirstAvailableCell(row, indexMap, ["name"]);
  const image = getFirstAvailableCell(row, indexMap, ["image", "imageLegacy"]);
  const rare = getCell(row, indexMap, "rare");
  const rareColor = normalizeHexColor(rare);

  const tuyosaRaw = getFirstAvailableCell(row, indexMap, ["tuyosa", "tuyosaLegacy"]);
  let tuyosa = Number(tuyosaRaw);
  if (!tuyosaRaw || !Number.isFinite(tuyosa)) {
    tuyosa = null;
  } else {
    tuyosa = Math.max(1, Math.min(5, Math.round(tuyosa)));
  }

  const sutapaRaw = getFirstAvailableCell(row, indexMap, ["sutapa", "sutapaLegacy"]);
  const sutapaNum = Number(sutapaRaw);
  const sutapa = sutapaRaw && (sutapaNum === 1 || sutapaNum === 2) ? sutapaNum : null;

  const gajeRaw = getFirstAvailableCell(row, indexMap, ["gaje", "gajeLegacy"]);
  const gajeNum = Number(gajeRaw);
  const gaje = gajeRaw && (gajeNum === 1 || gajeNum === 2) ? gajeNum : null;

  const gears = ["g1", "g2", "g3", "g4"]
    .map((key) => getCell(row, indexMap, key))
    .filter((gear) => gear.length > 0);

  const com = getCell(row, indexMap, "com");
  const modes = ["m1", "m2", "m3", "m4"]
    .map((key) => getCell(row, indexMap, key))
    .filter((mode) => mode.length > 0);

  const role = getCell(row, indexMap, "role");
  const diffRaw = getCell(row, indexMap, "difficulty");
  let difficulty = 0;
  if (diffRaw === "低") difficulty = 1;
  else if (diffRaw === "中") difficulty = 2;
  else if (diffRaw === "高") difficulty = 3;
  else {
    const diffNum = Number(diffRaw);
    if (Number.isFinite(diffNum) && diffNum >= 1 && diffNum <= 3) difficulty = Math.round(diffNum);
  }
  const tips = getCell(row, indexMap, "tips");
  const banner = getCell(row, indexMap, "banner");
  const guide = getCell(row, indexMap, "guide");
  const alias = getCell(row, indexMap, "alias");
  const hiragana = getCell(row, indexMap, "hiragana");
  const addedDate = getCell(row, indexMap, "addedDate");
  const updatedDate = getCell(row, indexMap, "updatedDate");

  return { name, image, rare, rareColor, tuyosa, sutapa, gaje, gears, com, modes, role, difficulty, tips, banner, guide, alias, hiragana, addedDate, updatedDate };
}

function buildIndexMap(headers) {
  const indexMap = {};
  const normalizeHeader = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replaceAll("　", "")
      .replaceAll(" ", "")
      .replaceAll("_", "");

  const indicesByHeader = headers.reduce((acc, header, index) => {
    const key = normalizeHeader(header);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(index);
    return acc;
  }, {});

  const nameAliasKeys = (HEADER_ALIASES.name ?? []).map((alias) => normalizeHeader(alias));
  const allNameIndices = nameAliasKeys.flatMap((key) => indicesByHeader[key] ?? []);
  const nameAnchor = allNameIndices.length > 0 ? Math.max(...allNameIndices) : -1;

  const pickIndex = (canonicalKey, preferAfterName = false) => {
    const aliasKeys = (HEADER_ALIASES[canonicalKey] ?? [canonicalKey]).map((alias) => normalizeHeader(alias));
    const indices = aliasKeys.flatMap((key) => indicesByHeader[key] ?? []);
    if (indices.length === 0) return undefined;
    if (!preferAfterName || nameAnchor < 0) return indices[0];
    const after = indices.find((index) => index > nameAnchor);
    return after ?? indices[indices.length - 1];
  };

  const pickIndexByAliases = (aliasList, preferAfterName = false) => {
    const aliasKeys = aliasList.map((alias) => normalizeHeader(alias));
    const indices = aliasKeys.flatMap((key) => indicesByHeader[key] ?? []);
    if (indices.length === 0) return undefined;
    if (!preferAfterName || nameAnchor < 0) return indices[0];
    const after = indices.find((index) => index > nameAnchor);
    return after ?? indices[indices.length - 1];
  };

  indexMap.name = pickIndex("name");
  indexMap.image = pickIndex("image", true);
  indexMap.imageLegacy = pickIndexByAliases(["アイコン", "icon"], false);
  indexMap.tuyosa = pickIndex("tuyosa", true);
  indexMap.tuyosaLegacy = pickIndexByAliases(["強さ"], false);
  indexMap.sutapa = pickIndex("sutapa", true);
  indexMap.sutapaLegacy = pickIndexByAliases(["sutapa", "スタパ", "スターパワー"], false);
  indexMap.gaje = pickIndex("gaje", true);
  indexMap.gajeLegacy = pickIndexByAliases(["gaje", "ガジェ", "ガジェット"], false);
  indexMap.g1 = pickIndex("g1", true);
  indexMap.g2 = pickIndex("g2", true);
  indexMap.g3 = pickIndex("g3", true);
  indexMap.g4 = pickIndex("g4", true);
  indexMap.rare = pickIndex("rare");
  indexMap.com = pickIndex("com", true);
  indexMap.skinimage = pickIndex("skinimage", true);
  indexMap.skincome = pickIndex("skincome", true);
  indexMap.m1 = pickIndex("m1", true);
  indexMap.m2 = pickIndex("m2", true);
  indexMap.m3 = pickIndex("m3", true);
  indexMap.m4 = pickIndex("m4", true);
  indexMap.role = pickIndex("role", true);
  indexMap.difficulty = pickIndex("difficulty", true);
  indexMap.tips = pickIndex("tips", true);
  indexMap.banner = pickIndex("banner", true);
  indexMap.guide = pickIndex("guide", true);
  indexMap.alias = pickIndex("alias", true);
  indexMap.hiragana = pickIndex("hiragana", true);
  indexMap.addedDate = pickIndex("addedDate", true);
  indexMap.updatedDate = pickIndex("updatedDate", true);

  return indexMap;
}

function normalizeHexColor(value) {
  const raw = (value ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw;
  }
  return "";
}

function getCell(row, indexMap, key) {
  return (row[indexMap[key]] ?? "").trim();
}

function getFirstAvailableCell(row, indexMap, keys) {
  for (const key of keys) {
    const value = getCell(row, indexMap, key);
    if (value !== "") return value;
  }
  return "";
}

function resolveCharacterImagePath(value) {
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) return value;
  if (value.startsWith("image/")) return `/${value}`;
  if (value.includes("/")) return value;
  return `${ASSET_BASE_PATH}/${value}`;
}

function getGearIconPath(name) {
  const raw = (name ?? "").trim();
  if (!raw) return "";

  const compact = raw.replaceAll(" ", "").replaceAll("　", "");
  const index = GEAR_NAME_TO_INDEX[compact];
  if (index) {
    return `${ASSET_BASE_PATH}/gear${index}.png`;
  }

  const matched = compact.match(/^gear(10|[1-9])$/i);
  if (matched) {
    return `${ASSET_BASE_PATH}/gear${matched[1]}.png`;
  }

  return "";
}

function getModeIconPath(name) {
  const raw = (name ?? "").trim();
  if (!raw) return "";

  const compact = raw.toLowerCase().replaceAll(" ", "").replaceAll("　", "").replaceAll("-", "");
  const modeKey = MODE_NAME_TO_KEY[compact];
  if (!modeKey) return "";

  return `${ASSET_BASE_PATH}/e-${modeKey}.png`;
}

function setLastUpdatedFromTopRow(characters) {
  if (!lastUpdatedEl) return;
  const topDate = (characters?.[0]?.updatedDate ?? "").trim();
  lastUpdatedEl.textContent = topDate ? `最終更新: ${topDate}` : "最終更新: -";
}

function updateRarityOptions(characters) {
  if (!rarityModalContentEl) return;

  const rareValuesMap = new Map();
  characters.forEach((c) => {
    if (c.rare) rareValuesMap.set(c.rare.toLowerCase(), c.rare);
  });

  const rarityList = RARITY_SORT_ORDER
    .filter((hex) => rareValuesMap.has(hex))
    .map((hex) => rareValuesMap.get(hex));
  rareValuesMap.forEach((orig, lower) => {
    if (!RARITY_SORT_ORDER.includes(lower)) rarityList.push(orig);
  });

  rarityModalContentEl.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "rarity-color-btn" + (currentRarityFilter === "" ? " is-selected" : "");
  allBtn.textContent = "全レアリティ";
  allBtn.style.setProperty("--rarity-color", "var(--clr-sage)");
  allBtn.addEventListener("click", () => selectRarity(""));
  rarityModalContentEl.appendChild(allBtn);

  rarityList.forEach((orig) => {
    const origLower = orig.toLowerCase();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rarity-color-btn" + (currentRarityFilter === orig ? " is-selected" : "");
    btn.textContent = RARITY_COLOR_TO_NAME[origLower] ?? orig;
    btn.style.setProperty("--rarity-color", origLower);

    btn.addEventListener("click", () => selectRarity(orig));
    rarityModalContentEl.appendChild(btn);
  });
}

function selectRarity(rareValue) {
  currentRarityFilter = rareValue;
  const rareName = rareValue ? (RARITY_COLOR_TO_NAME[rareValue.toLowerCase()] ?? rareValue) : "すべて";
  if (rarityFilterBtn) rarityFilterBtn.textContent = `レアリティ: ${rareName}`;
  if (fabRarityFilterBtn) fabRarityFilterBtn.textContent = `レアリティ: ${rareName}`;

  updateRarityOptions(currentCharacters);
  closeRarityModal();
  renderCurrentView();
}

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b91c1c" : "#1d4ed8";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
