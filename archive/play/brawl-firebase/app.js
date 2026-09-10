import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase 設定 (halcyon-brawl)
const firebaseConfig = {
  apiKey: "AIzaSyD3b8HWgA3BsJNFfp6WD9qCXHtb4amUgfs",
  authDomain: "halcyon-brawl.firebaseapp.com",
  databaseURL: "https://halcyon-brawl-default-rtdb.firebaseio.com",
  projectId: "halcyon-brawl",
  storageBucket: "halcyon-brawl.firebasestorage.app",
  messagingSenderId: "533587237332",
  appId: "1:533587237332:web:ace7ab10141e4fbc2c5e41",
  measurementId: "G-TSMJT02FF6"
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// レア度キーのマッピング
const RARITY_HEX_TO_KEY = {
  "#fff88f": "legend",
  "#ff8090": "ultra",
  "#d88bf6": "hyper",
  "#80c3fd": "super",
  "#97ee8d": "rare",
  "#2c0249": "ultra_legend"
};

const RARITY_NAME_MAP = {
  "#fff88f": "レジェンドレア",
  "#ff8090": "ウルトラレア",
  "#d88bf6": "ハイパーレア",
  "#80c3fd": "スーパーレア",
  "#97ee8d": "レア",
  "#2c0249": "ウルトラレジェンドレア"
};

// グローバル状態
let characters = [];
let currentUser = null;
const ADMIN_UID = "GXgKpWNF0WSg6hhP9qQtXF2Plop1";
const isAdmin = () => currentUser && currentUser.uid === ADMIN_UID;

// DOM要素
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const tableViewEl = document.getElementById("tableView");
const adminInfoEl = document.getElementById("adminInfo");

// タグフィルター・並び順要素
const sortSelect = document.getElementById("sortSelect");
const tagFilterSelect = document.getElementById("tagFilterSelect");
const tagFilterToggleBtn = document.getElementById("tagFilterToggleBtn");
const tagFilterPanel = document.getElementById("tagFilterPanel");
const tagFilterPanelBody = document.getElementById("tagFilterPanelBody");
const btnResetTagFilter = document.getElementById("btnResetTagFilter");
const activeTagBanner = document.getElementById("activeTagBanner");
const activeTagName = document.getElementById("activeTagName");
const activeTagClearBtn = document.getElementById("activeTagClearBtn");

let selectedTagFilter = "";

const btnLogin = document.getElementById("btnLogin");
const btnAddNew = document.getElementById("btnAddNew");
const btnReseed = document.getElementById("btnReseed");
const btnLogout = document.getElementById("btnLogout");

// 詳細モーダル
const detailModalEl = document.getElementById("detailModal");
const modalBackdropEl = document.getElementById("modalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitleEl = document.getElementById("modalTitle");
const modalContentEl = document.getElementById("modalContent");

// Tier表モーダル
const tierModalEl = document.getElementById("tierModal");
const tierModalBackdropEl = document.getElementById("tierModalBackdrop");
const tierModalCloseBtn = document.getElementById("tierModalCloseBtn");
const btnOpenTierModal = document.getElementById("btnOpenTierModal");
const btnExportTierImage = document.getElementById("btnExportTierImage");
const btnExportTierPdf = document.getElementById("btnExportTierPdf");
const tierCaptureArea = document.getElementById("tierCaptureArea");
const tierRowsContainer = document.getElementById("tierRowsContainer");
const tierBoardMeta = document.getElementById("tierBoardMeta");

// 実装年別表モーダル
const yearModalEl = document.getElementById("yearModal");
const yearModalBackdropEl = document.getElementById("yearModalBackdrop");
const yearModalCloseBtn = document.getElementById("yearModalCloseBtn");
const btnOpenYearModal = document.getElementById("btnOpenYearModal");
const btnExportYearImage = document.getElementById("btnExportYearImage");
const btnExportYearPdf = document.getElementById("btnExportYearPdf");
const yearCaptureArea = document.getElementById("yearCaptureArea");
const yearRowsContainer = document.getElementById("yearRowsContainer");
const yearBoardMeta = document.getElementById("yearBoardMeta");

// エディタモーダル
const editorModalEl = document.getElementById("editorModal");
const editorModalBackdropEl = document.getElementById("editorModalBackdrop");
const editorModalCloseBtn = document.getElementById("editorModalCloseBtn");
const btnCancelEdit = document.getElementById("btnCancelEdit");
const charEditorForm = document.getElementById("charEditorForm");
const editorModalTitle = document.getElementById("editorModalTitle");

const editCharId = document.getElementById("editCharId");
const editName = document.getElementById("editName");
const editAlias = document.getElementById("editAlias");
const editDate = document.getElementById("editDate");
const editRare = document.getElementById("editRare");
const editRole = document.getElementById("editRole");
const editTuyosa = document.getElementById("editTuyosa");
const editDifficulty = document.getElementById("editDifficulty");
const editSutapa = document.getElementById("editSutapa");
const editGaje = document.getElementById("editGaje");
const editCom = document.getElementById("editCom");
const editGuide = document.getElementById("editGuide");
const editWiki = document.getElementById("editWiki");

// アイコン
const ASSET_BASE_PATH = "/image";
const STAR_ICON = { 1: `${ASSET_BASE_PATH}/star1.png`, 2: `${ASSET_BASE_PATH}/star2.png` };
const GADGET_ICON = { 1: `${ASSET_BASE_PATH}/gad1.png`, 2: `${ASSET_BASE_PATH}/gad2.png` };
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
  赤: 10
};

// タグカテゴリ定義（ドラフトを最優先・先頭に配置）
const TAG_CATEGORIES = [
  {
    key: "role",
    category: "ドラフト",
    tagRows: [
      ["ミッド", "サイド", "キャリー"],
      ["先出しで強い", "後出しで強い"],
      ["1手目", "2-3手目", "4-5手目", "6手目"]
    ],
    tags: ["ミッド", "サイド", "キャリー", "先出しで強い", "後出しで強い", "1手目", "2-3手目", "4-5手目", "6手目"]
  },
  {
    key: "class",
    category: "ロール",
    tagRows: [
      ["タンク", "アサシン", "スナイパー", "シューター", "投げ", "サポート", "ハイブリッド"]
    ],
    tags: ["タンク", "アサシン", "スナイパー", "シューター", "投げ", "サポート", "ハイブリッド"]
  },
  {
    key: "combat",
    category: "タイプ",
    tagRows: [
      ["長射程", "中射程", "短射程"],
      ["単発", "連射", "複数攻撃"]
    ],
    tags: ["長射程", "中射程", "短射程", "単発", "連射", "複数攻撃"]
  },
  {
    key: "meta",
    category: "メタ",
    tagRows: [
      ["タンク対策", "アサシン対策", "投げ対策", "スナイパー対策", "召喚物対策"]
    ],
    tags: ["タンク対策", "アサシン対策", "投げ対策", "スナイパー対策", "召喚物対策"]
  },
  {
    key: "cc",
    category: "自衛",
    tagRows: [
      ["ノックバック", "スタン", "スロー", "攻撃封印", "バリア", "エスケープ", "瞬間火力"]
    ],
    tags: ["ノックバック", "スタン", "スロー", "攻撃封印", "バリア", "エスケープ", "瞬間火力"]
  },
  {
    key: "util",
    category: "ユーティリティ",
    tagRows: [
      ["回復", "壁草破壊", "索敵", "透明化", "高機動力", "召喚物"],
      ["金庫削り", "金庫防衛"]
    ],
    tags: ["回復", "壁草破壊", "索敵", "透明化", "高機動力", "召喚物", "金庫削り", "金庫防衛"]
  }
];

const TAG_TO_CAT_KEY = {};
TAG_CATEGORIES.forEach(cat => {
  cat.tags.forEach(t => {
    TAG_TO_CAT_KEY[t] = cat.key;
  });
});

// タグごとの簡単な解説マスター
const TAG_DESCRIPTIONS = {
  // ドラフト
  "ミッド": "中央レーンを担当し、盤面維持やエメラルド回収・視野確保を行うキャラ",
  "サイド": "左右レーンで対面にプレッシャーをかけ、ラインを押し上げるキャラ",
  "キャリー": "単独で試合を動かし、連続キルや逆転を狙える決定力のあるキャラ",
  "先出しで強い": "相性不利が少なく、相手の構成が見えない序盤でも安定して選べるキャラ",
  "後出しで強い": "相手の構成に対して明確なカウンターとして刺すことで真価を発揮するキャラ",
  "1手目": "1番目のピックに適した、隙が少なくメタの中心となる安定キャラ",
  "2-3手目": "相手の1手目を見つつ柔軟に対応・編成を固められるキャラ",
  "4-5手目": "相手の構成の弱点を突き、こちらの狙いを決定づけるキャラ",
  "6手目": "最後にピックして相手に対策させずに試合を破壊するラストピック枠",

  // ロール
  "タンク": "高いHPで前線を押し上げ、エリアを確保する近接キャラクター",
  "アサシン": "高い機動力や奇襲能力で敵の後衛や弱点を素早く仕留めるキャラ",
  "スナイパー": "超長距離から高火力の単発弾を撃ち込む遠距離特化キャラ",
  "シューター": "中〜長距離で継続的な火力を出し、撃ち合いで圧倒するキャラ",
  "投げ": "壁を越えて放物線攻撃を行い、障害物裏の敵を攻撃・制圧するキャラ",
  "サポート": "味方の回復・加速・シールド付与などでチーム全体を強化するキャラ",
  "ハイブリッド": "複数の役割（例: タンク＋アサシン）を併せ持つキャラ",

  // タイプ
  "長射程": "遠くから一方的に攻撃できる射程を持つ",
  "中射程": "汎用性が高く、多くの対面と安定して撃ち合える射程",
  "短射程": "近距離での接近戦で真価を発揮する射程",
  "単発": "1発あたりの威力が高く、瞬間火力や牽制に優れる",
  "連射": "連続して弾を発射し、弾幕で敵を追い詰める",
  "複数攻撃": "扇状や拡散、複数弾で広範囲を攻撃できる",

  // メタ
  "タンク対策": "タンクの高いHPを一瞬で削る、または近づかせない能力を持つ",
  "投げ対策": "壁裏に隠れる投げキャラに対して素早く接近・排除できる",
  "スナイパー対策": "遠距離スナイパーに対して距離を詰める、または弾を避けやすい",
  "アサシン対策": "奇襲してきたアサシンをノックバックやスタン、瞬間火力で返り討ちにする",
  "召喚物対策": "タレットや手下、ペットなどの召喚物を素早く処理できる",

  // 自衛
  "ノックバック": "敵を弾き飛ばし、距離を取る・詠唱を中断させる",
  "スタン": "敵を行動不能にして反撃の隙を与えない",
  "スロー": "敵の移動速度を低下させて逃げ・追撃を有利にする",
  "攻撃封印": "敵の攻撃やガジェットを一時的に封じる",
  "バリア": "ダメージ軽減やシールドを展開して生存力を高める",
  "エスケープ": "ダッシュやジャンプ、テレポートでピンチから即座に離脱する",
  "瞬間火力": "一瞬で大ダメージを叩き出し、敵を即座に倒す",

  // ユーティリティ
  "回復": "自身や味方のHPを回復して前線を維持する",
  "壁草破壊": "壁や草むらを壊して敵の隠れ場所を奪う",
  "索敵": "視界外や草むらに潜む敵を発見・可視化する",
  "透明化": "姿を消して敵のレーダーから外れ、安全に接近・奇襲する",
  "高機動力": "移動速度やダッシュ技でマップを素早く移動する",
  "召喚物": "タレットや分身、ペットを召喚して数的優位を作る",
  "金庫削り": "強奪の金庫を一瞬で大ダメージで削る",
  "金庫防衛": "攻めてくる敵を撃退し、金庫を守り切る"
};

function initTagEditor() {
  const container = document.getElementById("tagEditorCategories");
  const clearBtn = document.getElementById("btnTagClear");
  if (!container) return;

  container.innerHTML = TAG_CATEGORIES.map(cat => {
    const rowsHtml = (cat.tagRows || [cat.tags]).map(row => `
      <div class="tag-subgroup-row">
        ${row.map(t => {
          const desc = TAG_DESCRIPTIONS[t] || "";
          return `<button type="button" class="tag-select-chip tag-chip-${cat.key}" data-tag="${escapeHtml(t)}" data-cat="${cat.key}" title="${escapeHtml(desc)}">${escapeHtml(t)}</button>`;
        }).join("")}
      </div>
    `).join("");

    return `
      <div class="tag-cat-row tag-cat-group-${cat.key}">
        <div class="tag-cat-title">${escapeHtml(cat.category)}</div>
        <div class="tag-cat-subgroups">
          ${rowsHtml}
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".tag-select-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      updateTagEditorCount();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      container.querySelectorAll(".tag-select-chip.active").forEach(b => b.classList.remove("active"));
      updateTagEditorCount();
    });
  }
}

function updateTagEditorCount() {
  const countEl = document.getElementById("tagEditorCount");
  if (!countEl) return;
  const activeCount = document.querySelectorAll(".tag-select-chip.active").length;
  countEl.textContent = `選択中: ${activeCount}個`;
}

function setTagEditorValues(tags = []) {
  const tagSet = new Set(Array.isArray(tags) ? tags : []);
  document.querySelectorAll(".tag-select-chip").forEach(btn => {
    btn.classList.toggle("active", tagSet.has(btn.dataset.tag));
  });
  updateTagEditorCount();
}

function getTagEditorValues() {
  return Array.from(document.querySelectorAll(".tag-select-chip.active")).map(el => el.dataset.tag);
}

// 初期シードデータ
const SEED_DATA = [
  { id: "shelly", name: "シェリー", alias: "しぇりー", image: "shelly.png", tuyosa: 3, difficulty: 1, sutapa: 1, gaje: 2, gears: ["スピード", "ダメージ"], rare: "#97ee8d", role: "タンク", com: "近距離での必殺技連発が強力。" },
  { id: "colt", name: "コルト", alias: "こると", image: "colt.png", tuyosa: 4, difficulty: 3, sutapa: 2, gaje: 1, gears: ["リロード速度", "ダメージ"], rare: "#80c3fd", role: "シューター", com: "高い火力と壁破壊能力を持つ。" },
  { id: "el_primo", name: "エル・プリモ", alias: "えるぷりも", image: "el_primo.png", tuyosa: 3, difficulty: 2, sutapa: 1, gaje: 1, gears: ["スピード", "シールド"], rare: "#97ee8d", role: "タンク", com: "高いHPとウルトによる強襲が魅力。" },
  { id: "spike", name: "スパイク", alias: "すぱいく", image: "spike.png", tuyosa: 5, difficulty: 2, sutapa: 2, gaje: 2, gears: ["ダメージ", "ビジョン"], rare: "#fff88f", role: "コントローラー", com: "全距離で安定したダメージを出せる万能キャラ。" },
  { id: "crow", name: "クロウ", alias: "くろう", image: "crow.png", tuyosa: 4, difficulty: 2, sutapa: 1, gaje: 1, gears: ["ビジョン", "シールド"], rare: "#fff88f", role: "アサシン", com: "毒攻撃により敵の回復を妨害。" }
];

// メイン開始
document.addEventListener("DOMContentLoaded", () => {
  setupFirebaseListeners();
  setupEventListeners();
});

function setupFirebaseListeners() {
  // Realtime DB (レア度別構造 /brawl_eval/by_rarity を監視)
  const charRef = ref(db, "brawl_eval/by_rarity");
  onValue(charRef, async (snapshot) => {
    const data = snapshot.val();
    let allChars = [];

    if (data) {
      Object.keys(data).forEach(rKey => {
        const group = data[rKey];
        if (group) {
          const list = Array.isArray(group) ? group : Object.values(group);
          allChars.push(...list);
        }
      });
      characters = allChars;
      setStatus(`Firebaseからレア度別に ${characters.length} 件のキャラデータをリアルタイム受信中`);
    } else {
      // データが空なら data.json からレア度別シードデータを取得
      try {
        const res = await fetch("./data.json?v=" + Date.now());
        const groupedData = await res.json();

        Object.keys(groupedData).forEach(rKey => {
          const group = groupedData[rKey];
          if (group) {
            const list = Array.isArray(group) ? group : Object.values(group);
            allChars.push(...list);
          }
        });
        characters = allChars;

        if (isAdmin() && Object.keys(groupedData).length > 0) {
          await set(ref(db, "brawl_eval/by_rarity"), groupedData);
          setStatus(`Firebase初期化完了: ${characters.length} 件のキャラクターデータをレア度別に登録しました。`);
        } else {
          setStatus("データが登録されていません。（管理者でログインするとデータが初期登録されます）");
        }
      } catch (e) {
        console.error(e);
        characters = [];
      }

      if (isAdmin() && characters.length > 0) {
        await saveToFirebase(characters);
        setStatus(`Firebase初期化完了: ${characters.length} 件のキャラクターデータを登録しました。`);
      } else {
        setStatus("データが登録されていません。（管理者でログインするとデータが初期登録されます）");
      }
    }
    renderTableView();
  }, (err) => {
    setStatus("Firebaseからの読み込みエラー: 権限を確認してください。", true);
    console.error(err);
  });

  // 認証状態監視
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      adminInfoEl.innerHTML = `
        <span class="admin-user-badge">
          <img src="${user.photoURL || ''}" class="admin-user-avatar" onerror="this.style.display='none'" />
          ${escapeHtml(user.displayName || user.email)}
        </span>
        <span style="font-size:0.75rem; color:var(--clr-brown); opacity:0.8;">(UID: ${user.uid})</span>
      `;
      btnLogin.style.display = "none";
      btnAddNew.style.display = "";
      btnReseed.style.display = "";
      btnLogout.style.display = "";
    } else {
      adminInfoEl.innerHTML = "<span>閲覧モード (ログインして編集)</span>";
      btnLogin.style.display = "";
      btnAddNew.style.display = "none";
      btnReseed.style.display = "none";
      btnLogout.style.display = "none";
    }
    renderTableView();
  });
}

function setupEventListeners() {
  searchInput.addEventListener("input", renderTableView);

  // 並び順セレクトボックスの変更リスナー
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      const idx = SORT_MODES.findIndex(m => m.value === val);
      currentSortIndex = idx !== -1 ? idx : 0;
      renderTableView();
    });
  }

  // タグフィルター初期化
  initTagFilterUI();

  btnLogin.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      alert("ログインに失敗しました: " + e.message);
    }
  });

  btnLogout.addEventListener("click", () => signOut(auth));

  btnAddNew.addEventListener("click", () => openEditorModal(null));

  // データ再初期化 (data.jsonから読み込んでFirebaseを強制上書き)
  btnReseed.addEventListener("click", async () => {
    if (!isAdmin()) { alert("管理者権限が必要です。"); return; }
    if (!confirm("data.jsonの内容でFirebaseのデータを上書きします。\n並び順（スプレッドシートの順）にリセットされます。\n続けますか？")) return;
    try {
      setStatus("データ再初期化中...");
      const res = await fetch("./data.json?v=" + Date.now());
      const groupedData = await res.json();
      await set(ref(db, "brawl_eval/by_rarity"), groupedData);
      setStatus("再初期化完了。ページを再読み込みしてください。");
      alert("データ再初期化が完了しました。");
    } catch (e) {
      console.error(e);
      alert("失敗しました: " + e.message);
    }
  });

  modalCloseBtn.addEventListener("click", closeDetailModal);
  modalBackdropEl.addEventListener("click", closeDetailModal);

  editorModalCloseBtn.addEventListener("click", closeEditorModal);
  editorModalBackdropEl.addEventListener("click", closeEditorModal);
  btnCancelEdit.addEventListener("click", closeEditorModal);

  charEditorForm.addEventListener("submit", handleFormSubmit);
  const btnSaveChar = document.querySelector("hl-button[type='submit']");
  if (btnSaveChar) {
    btnSaveChar.addEventListener("click", handleFormSubmit);
  }

  setupToggleButtons();

  // Tier表モーダルイベント
  if (btnOpenTierModal) {
    btnOpenTierModal.addEventListener("click", openTierModal);
  }
  if (tierModalCloseBtn) {
    tierModalCloseBtn.addEventListener("click", closeTierModal);
  }
  if (tierModalBackdropEl) {
    tierModalBackdropEl.addEventListener("click", closeTierModal);
  }
  if (btnExportTierImage) {
    btnExportTierImage.addEventListener("click", exportTierAsImage);
  }
  if (btnExportTierPdf) {
    btnExportTierPdf.addEventListener("click", exportTierAsPdf);
  }

  // 実装年別表モーダルイベント
  if (btnOpenYearModal) {
    btnOpenYearModal.addEventListener("click", openYearModal);
  }
  if (yearModalCloseBtn) {
    yearModalCloseBtn.addEventListener("click", closeYearModal);
  }
  if (yearModalBackdropEl) {
    yearModalBackdropEl.addEventListener("click", closeYearModal);
  }
  if (btnExportYearImage) {
    btnExportYearImage.addEventListener("click", exportYearAsImage);
  }
  if (btnExportYearPdf) {
    btnExportYearPdf.addEventListener("click", exportYearAsPdf);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeEditorModal();
      closeDetailModal();
      closeTierModal();
      closeYearModal();
    }
  });
}

function setupToggleButtons() {
  document.querySelectorAll("#rareToggleGroup .rare-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#rareToggleGroup .rare-toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      editRare.value = btn.dataset.rare;
    });
  });

  document.querySelectorAll("#tuyosaToggleGroup .meter-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tuyosaToggleGroup .meter-toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      editTuyosa.value = btn.dataset.tuyosa;
    });
  });

  document.querySelectorAll("#difficultyToggleGroup .meter-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#difficultyToggleGroup .meter-toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      editDifficulty.value = btn.dataset.diff;
    });
  });

  document.querySelectorAll("#sutapaToggleGroup .img-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sutapaToggleGroup .img-toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      editSutapa.value = btn.dataset.sutapa;
    });
  });

  document.querySelectorAll("#gajeToggleGroup .img-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#gajeToggleGroup .img-toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      editGaje.value = btn.dataset.gaje;
    });
  });

  document.querySelectorAll(".mode-toggle-group .meter-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".mode-toggle-group");
      if (group) {
        group.querySelectorAll(".meter-toggle-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }
    });
  });

  // ギアスロット初期化（スロット1〜4を生成）
  initGearSlots();

  // タグエディタ初期化
  initTagEditor();
}

// ---- タグ絞り込みフィルター ----
function initTagFilterUI() {
  if (!tagFilterSelect || !tagFilterPanelBody) return;

  const explanationTextEl = document.getElementById("tagExplanationText");
  const DEFAULT_EXPLANATION = "タグにカーソルを合わせると簡単な解説が表示されます";

  // 1. tagFilterSelect に <optgroup> を生成
  tagFilterSelect.innerHTML = '<option value="">すべてのタグ</option>';
  TAG_CATEGORIES.forEach(cat => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = `【${cat.category}】`;
    cat.tags.forEach(tag => {
      const opt = document.createElement("option");
      opt.value = tag;
      opt.textContent = `${cat.category}: ${tag}`;
      if (TAG_DESCRIPTIONS[tag]) {
        opt.title = TAG_DESCRIPTIONS[tag];
      }
      optgroup.appendChild(opt);
    });
    tagFilterSelect.appendChild(optgroup);
  });

  // 2. tagFilterPanelBody にカテゴリ別チップを生成
  tagFilterPanelBody.innerHTML = TAG_CATEGORIES.map(cat => {
    const tagButtons = cat.tags.map(tag => {
      const desc = TAG_DESCRIPTIONS[tag] || "";
      return `<button type="button" class="tag-filter-chip tag-cat-${cat.key}" data-tag="${escapeHtml(tag)}" title="${escapeHtml(desc)}">${escapeHtml(tag)}</button>`;
    }).join("");

    return `
      <div class="tag-filter-group">
        <span class="tag-filter-group-label tag-label-${cat.key}">${escapeHtml(cat.category)}</span>
        <div class="tag-filter-group-chips">
          ${tagButtons}
        </div>
      </div>
    `;
  }).join("");

  // 3. ホバー・タッチ時のタグ解説表示
  if (explanationTextEl) {
    tagFilterPanelBody.addEventListener("mouseover", (e) => {
      const chip = e.target.closest(".tag-filter-chip");
      if (chip && chip.dataset.tag) {
        const tag = chip.dataset.tag;
        const desc = TAG_DESCRIPTIONS[tag];
        if (desc) {
          explanationTextEl.textContent = `【${tag}】 ${desc}`;
          explanationTextEl.classList.add("highlight");
        }
      }
    });

    tagFilterPanelBody.addEventListener("mouseout", (e) => {
      const chip = e.target.closest(".tag-filter-chip");
      if (chip) {
        if (selectedTagFilter && TAG_DESCRIPTIONS[selectedTagFilter]) {
          explanationTextEl.textContent = `【${selectedTagFilter}】 ${TAG_DESCRIPTIONS[selectedTagFilter]}`;
          explanationTextEl.classList.add("highlight");
        } else {
          explanationTextEl.textContent = DEFAULT_EXPLANATION;
          explanationTextEl.classList.remove("highlight");
        }
      }
    });
  }

  // 4. イベント登録
  tagFilterSelect.addEventListener("change", (e) => {
    setTagFilter(e.target.value);
  });

  if (tagFilterToggleBtn && tagFilterPanel) {
    tagFilterToggleBtn.addEventListener("click", () => {
      const isHidden = tagFilterPanel.hidden;
      tagFilterPanel.hidden = !isHidden;
      tagFilterToggleBtn.classList.toggle("is-active", !tagFilterPanel.hidden);
    });
  }

  tagFilterPanelBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-filter-chip");
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (selectedTagFilter === tag) {
      setTagFilter(""); // 同じタグを再クリックで解除
    } else {
      setTagFilter(tag);
    }
  });

  if (btnResetTagFilter) {
    btnResetTagFilter.addEventListener("click", () => setTagFilter(""));
  }

  if (activeTagClearBtn) {
    activeTagClearBtn.addEventListener("click", () => setTagFilter(""));
  }
}

function setTagFilter(tag) {
  selectedTagFilter = tag || "";
  if (tagFilterSelect) tagFilterSelect.value = selectedTagFilter;

  const explanationTextEl = document.getElementById("tagExplanationText");
  const activeTagDescEl = document.getElementById("activeTagDesc");

  // チップのアクティブ状態更新
  if (tagFilterPanelBody) {
    tagFilterPanelBody.querySelectorAll(".tag-filter-chip").forEach(btn => {
      btn.classList.toggle("is-selected", btn.dataset.tag === selectedTagFilter);
    });
  }

  // タグ解説ボックスの更新
  if (explanationTextEl) {
    if (selectedTagFilter && TAG_DESCRIPTIONS[selectedTagFilter]) {
      explanationTextEl.textContent = `【${selectedTagFilter}】 ${TAG_DESCRIPTIONS[selectedTagFilter]}`;
      explanationTextEl.classList.add("highlight");
    } else {
      explanationTextEl.textContent = "タグにカーソルを合わせると簡単な解説が表示されます";
      explanationTextEl.classList.remove("highlight");
    }
  }

  // トグルボタンのバッジ・スタイル
  if (tagFilterToggleBtn) {
    tagFilterToggleBtn.classList.toggle("has-filter", !!selectedTagFilter);
  }

  // 選択中タグバナーの更新
  if (activeTagBanner && activeTagName) {
    if (selectedTagFilter) {
      activeTagName.textContent = selectedTagFilter;
      if (activeTagDescEl) {
        activeTagDescEl.textContent = TAG_DESCRIPTIONS[selectedTagFilter] || "";
      }
      activeTagBanner.hidden = false;
    } else {
      activeTagBanner.hidden = true;
    }
  }

  // テーブル再描画
  renderTableView();
}

// ---- Tier表モーダル & エクスポート ----
const TIER_DEFINITIONS = [
  { rank: "S", level: 5, label: "最上位", classKey: "s" },
  { rank: "A", level: 4, label: "環境", classKey: "a" },
  { rank: "B", level: 3, label: "現役", classKey: "b" },
  { rank: "C", level: 2, label: "使い所少", classKey: "c" },
  { rank: "D", level: 1, label: "使い所無", classKey: "d" }
];

function openTierModal() {
  if (!tierModalEl || !tierRowsContainer) return;

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  if (tierBoardMeta) {
    tierBoardMeta.textContent = `作成日: ${dateStr} | 総キャラ数: ${characters.length}体 | ※左右差なし（レア度順）`;
  }

  // Tier行の生成
  tierRowsContainer.innerHTML = TIER_DEFINITIONS.map(tier => {
    // 該当する強さのキャラを抽出
    const tierChars = characters.filter(c => Number(c.tuyosa || 0) === tier.level);

    // レア度順（低レアリティ→高レアリティ、同レア度内はorder順）でソート
    tierChars.sort((a, b) => {
      const rareA = RARITY_SORT_ORDER.indexOf((a.rare || "").toLowerCase());
      const rareB = RARITY_SORT_ORDER.indexOf((b.rare || "").toLowerCase());
      const rA = rareA === -1 ? 999 : rareA;
      const rB = rareB === -1 ? 999 : rareB;
      if (rA !== rB) return rA - rB;
      return (a.order || 0) - (b.order || 0);
    });

    const charsHtml = tierChars.length > 0 ? tierChars.map(c => {
      const imagePath = c.image ? `${ASSET_BASE_PATH}/${c.image}` : `${ASSET_BASE_PATH}/shelly.png`;
      const rareBorder = c.rare || "#97ee8d";
      const DIFF_LABEL = { 1: "低", 2: "中", 3: "高" };
      const diffKanji = DIFF_LABEL[c.difficulty] || "-";
      return `
        <div class="tier-char-card" style="border: 2px solid ${rareBorder};" title="${escapeHtml(c.name)} (操作難易度: ${diffKanji})">
          <span class="tier-card-badge tier-diff-badge diff-${c.difficulty || 1}">${diffKanji}</span>
          <img src="${imagePath}" alt="${escapeHtml(c.name)}" class="tier-char-img" onerror="this.src='${ASSET_BASE_PATH}/shelly.png'" />
          <span class="tier-char-name">${escapeHtml(c.name)}</span>
        </div>
      `;
    }).join("") : `<span class="tier-chars-empty">(該当なし)</span>`;

    return `
      <div class="tier-row tier-row-${tier.classKey}">
        <div class="tier-label-box">
          <span class="tier-label-main">${tier.rank}</span>
          <span class="tier-label-sub">${tier.label}</span>
        </div>
        <div class="tier-chars-wrap">
          ${charsHtml}
        </div>
      </div>
    `;
  }).join("");

  tierModalEl.hidden = false;
  document.body.classList.add("modal-open");
}

function closeTierModal() {
  if (!tierModalEl) return;
  tierModalEl.hidden = true;
  document.body.classList.remove("modal-open");
}

async function exportTierAsImage() {
  if (!tierCaptureArea) return;
  if (typeof html2canvas === "undefined") {
    alert("画像生成ライブラリの読み込みに失敗しました。ページを再読み込みしてください。");
    return;
  }

  const origBtnText = btnExportTierImage ? btnExportTierImage.textContent : "";
  if (btnExportTierImage) {
    btnExportTierImage.textContent = "画像生成中...";
    btnExportTierImage.disabled = true;
  }

  try {
    const canvas = await html2canvas(tierCaptureArea, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#1e2029",
      logging: false
    });

    const link = document.createElement("a");
    const d = new Date();
    const dateFormatted = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    link.download = `brawl-stars-tier-list-${dateFormatted}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    if (window.HlToast) {
      window.HlToast.show("Tier表画像をPNG形式で保存しました！", "success");
    }
  } catch (err) {
    console.error(err);
    alert("画像の保存に失敗しました: " + err.message);
  } finally {
    if (btnExportTierImage) {
      btnExportTierImage.textContent = origBtnText;
      btnExportTierImage.disabled = false;
    }
  }
}

function exportTierAsPdf() {
  window.print();
}

// ---- 実装年別表モーダル & エクスポート ----
function getYearFromDate(dateStr) {
  if (!dateStr) return 9999;
  const match = String(dateStr).match(/(\d{4})[年\-\/]/);
  return match ? parseInt(match[1], 10) : 9999;
}

function getMonthDayFromDate(dateStr) {
  if (!dateStr) return "";
  const match = String(dateStr).match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/);
  if (match) {
    return `${parseInt(match[2], 10)}/${parseInt(match[3], 10)}`;
  }
  return "";
}

function openYearModal() {
  if (!yearModalEl || !yearRowsContainer) return;

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  if (yearBoardMeta) {
    yearBoardMeta.textContent = `作成日: ${dateStr} | 総キャラ数: ${characters.length}体`;
  }

  // 実装年を抽出して古い順（昇順: 2017年 -> 2026年）にソート
  const yearsSet = new Set();
  characters.forEach(c => {
    const y = getYearFromDate(c.addedDate);
    if (y !== 9999) yearsSet.add(y);
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  // 年ごとの行を生成
  yearRowsContainer.innerHTML = sortedYears.map(year => {
    // 該当する年のキャラを抽出
    const yearChars = characters.filter(c => getYearFromDate(c.addedDate) === year);

    // 実装日の古い順（月日順）でソート、同じ日付ならレア度順/order順
    yearChars.sort((a, b) => {
      const diffDate = parseAddedDate(a.addedDate) - parseAddedDate(b.addedDate);
      if (diffDate !== 0) return diffDate;
      const rareA = RARITY_SORT_ORDER.indexOf((a.rare || "").toLowerCase());
      const rareB = RARITY_SORT_ORDER.indexOf((b.rare || "").toLowerCase());
      const rA = rareA === -1 ? 999 : rareA;
      const rB = rareB === -1 ? 999 : rareB;
      if (rA !== rB) return rA - rB;
      return (a.order || 0) - (b.order || 0);
    });

    const charsHtml = yearChars.map(c => {
      const imagePath = c.image ? `${ASSET_BASE_PATH}/${c.image}` : `${ASSET_BASE_PATH}/shelly.png`;
      const rareBorder = c.rare || "#97ee8d";
      const monthDay = getMonthDayFromDate(c.addedDate);
      return `
        <div class="tier-char-card" style="border: 2px solid ${rareBorder};" title="${escapeHtml(c.name)} (実装日: ${escapeHtml(c.addedDate || '-')})">
          <span class="tier-card-badge year-date-badge">${monthDay}</span>
          <img src="${imagePath}" alt="${escapeHtml(c.name)}" class="tier-char-img" onerror="this.src='${ASSET_BASE_PATH}/shelly.png'" />
          <span class="tier-char-name">${escapeHtml(c.name)}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="year-row year-row-${year}">
        <div class="year-label-box">
          <span class="year-label-main">${year}</span>
          <span class="year-label-sub">${yearChars.length}体</span>
        </div>
        <div class="tier-chars-wrap">
          ${charsHtml}
        </div>
      </div>
    `;
  }).join("");

  yearModalEl.hidden = false;
  document.body.classList.add("modal-open");
}

function closeYearModal() {
  if (!yearModalEl) return;
  yearModalEl.hidden = true;
  document.body.classList.remove("modal-open");
}

async function exportYearAsImage() {
  if (!yearCaptureArea) return;
  if (typeof html2canvas === "undefined") {
    alert("画像生成ライブラリの読み込みに失敗しました。ページを再読み込みしてください。");
    return;
  }

  const origBtnText = btnExportYearImage ? btnExportYearImage.textContent : "";
  if (btnExportYearImage) {
    btnExportYearImage.textContent = "画像生成中...";
    btnExportYearImage.disabled = true;
  }

  try {
    const canvas = await html2canvas(yearCaptureArea, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#1e2029",
      logging: false
    });

    const link = document.createElement("a");
    const d = new Date();
    const dateFormatted = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    link.download = `brawl-stars-timeline-${dateFormatted}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    if (window.HlToast) {
      window.HlToast.show("年別タイムライン画像をPNG形式で保存しました！", "success");
    }
  } catch (err) {
    console.error(err);
    alert("画像の保存に失敗しました: " + err.message);
  } finally {
    if (btnExportYearImage) {
      btnExportYearImage.textContent = origBtnText;
      btnExportYearImage.disabled = false;
    }
  }
}

function exportYearAsPdf() {
  window.print();
}

const SORT_MODES = [
  { value: "", label: "レア度順" },
  { value: "date-desc", label: "実装日 (新しい順)" },
  { value: "date-asc", label: "実装日 (古い順)" },
  { value: "strength-desc", label: "強さ (高い順)" },
  { value: "strength-asc", label: "強さ (低い順)" },
  { value: "difficulty-desc", label: "難易度 (高い順)" },
  { value: "difficulty-asc", label: "難易度 (低い順)" },
  { value: "name-asc", label: "50音順" },
];

// カタカナをひらがなに正規化
function toHiragana(str) {
  if (!str) return "";
  return String(str).replace(/[\u30a1-\u30f6]/g, match => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

// 50音順ソート用の正確な読み仮名（ひらがな）を取得
function getKanaReading(char) {
  if (!char) return "";
  const name = (char.name || "").trim();

  // 特殊な名前・英数字表記キャラクターの読み仮名
  const SPECIAL_READINGS = {
    "8ビット": "はちびっと",
    "８ビット": "はちびっと",
    "8-Bit": "はちびっと",
    "8-bit": "はちびっと",
    "8bit": "はちびっと",
    "emz": "えむず",
    "Emz": "えむず",
    "EMZ": "えむず",
    "MAX": "まっくす",
    "Max": "まっくす",
    "max": "まっくす",
    "RT": "あーるてぃー",
    "R-T": "あーるてぃー",
    "r-t": "あーるてぃー",
  };

  if (SPECIAL_READINGS[name]) {
    return SPECIAL_READINGS[name];
  }

  // alias からひらがな表記（例: "ぼう", "えむず", "しぇりー" 等）を抽出
  if (char.alias) {
    const parts = String(char.alias).split(/[,、\s]+/).map(p => p.trim());
    const hiraPart = parts.find(p => p && /^[\u3040-\u309Fー]+$/.test(p));
    if (hiraPart) {
      return hiraPart;
    }
  }

  return toHiragana(name);
}

function parseAddedDate(dateStr) {
  if (!dateStr) return 0;
  const match = String(dateStr).match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
  }
  return 0;
}

// テーブル表示用の短い日付形式 (YYYY/MM/DD)
function formatShortDate(dateStr) {
  if (!dateStr) return "-";
  const match = String(dateStr).match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, "0");
    const d = match[3].padStart(2, "0");
    return `${y}/${m}/${d}`;
  }
  return dateStr;
}

// 低レアリティ→高レアリティの順（低い順に表示）
const RARITY_SORT_ORDER = ["#97ee8d", "#80c3fd", "#d88bf6", "#ff8090", "#fff88f", "#2c0249"];
let currentSortIndex = 0;

function setStatus(msg, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#ef4444" : "var(--clr-sage)";
}

function getFilteredAndSortedCharacters() {
  const query = (searchInput.value || "").trim().toLowerCase();
  const sortKey = SORT_MODES[currentSortIndex].value;

  const filtered = characters.filter((c) => {
    // 検索ワード判定（名前・エイリアス・タグ内テキスト）
    const matchesSearch = !query ||
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.alias && c.alias.toLowerCase().includes(query)) ||
      (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(query)));

    // タグ絞り込み判定
    const matchesTag = !selectedTagFilter ||
      (Array.isArray(c.tags) && c.tags.includes(selectedTagFilter));

    return matchesSearch && matchesTag;
  });

  if (sortKey) {
    filtered.sort((a, b) => {
      let diff = 0;
      if (sortKey === "date-desc") {
        diff = parseAddedDate(b.addedDate) - parseAddedDate(a.addedDate);
      } else if (sortKey === "date-asc") {
        diff = parseAddedDate(a.addedDate) - parseAddedDate(b.addedDate);
      } else if (sortKey === "strength-desc") {
        diff = Number(b.tuyosa || 0) - Number(a.tuyosa || 0);
      } else if (sortKey === "strength-asc") {
        diff = Number(a.tuyosa || 0) - Number(b.tuyosa || 0);
      } else if (sortKey === "difficulty-desc") {
        diff = Number(b.difficulty || 1) - Number(a.difficulty || 1);
      } else if (sortKey === "difficulty-asc") {
        diff = Number(a.difficulty || 1) - Number(b.difficulty || 1);
      } else if (sortKey === "name-asc") {
        // 読み仮名（ひらがな）で50音順ソート（8ビット、emz、MAX等も正しい読みで並ぶ）
        const kanaA = getKanaReading(a);
        const kanaB = getKanaReading(b);
        diff = kanaA.localeCompare(kanaB, "ja");
      }
      if (diff !== 0) return diff;

      if (sortKey !== "name-asc") {
        // 同順位内はスプレッドシートの順番(order)を維持する
        const rareA = RARITY_SORT_ORDER.indexOf((a.rare || "").toLowerCase());
        const rareB = RARITY_SORT_ORDER.indexOf((b.rare || "").toLowerCase());
        const rA = rareA === -1 ? 999 : rareA;
        const rB = rareB === -1 ? 999 : rareB;
        if (rA !== rB) return rA - rB;
        return (a.order || 0) - (b.order || 0);
      }
      return (a.order || 0) - (b.order || 0);
    });
  } else {
    // デフォルト（レア度順）：低い順→高い順、同レア度内はスプレッドシートの行順
    filtered.sort((a, b) => {
      const rareA = RARITY_SORT_ORDER.indexOf((a.rare || "").toLowerCase());
      const rareB = RARITY_SORT_ORDER.indexOf((b.rare || "").toLowerCase());
      const rA = rareA === -1 ? 999 : rareA;
      const rB = rareB === -1 ? 999 : rareB;
      if (rA !== rB) return rA - rB;
      return (a.order || 0) - (b.order || 0);
    });
  }

  return filtered;
}

function renderTableView() {
  const filtered = getFilteredAndSortedCharacters();

  if (filtered.length === 0) {
    tableViewEl.innerHTML = '<div style="padding:20px; text-align:center; color:rgba(106,86,74,0.6);">該当するキャラクターが見つかりません。</div>';
    return;
  }

  const isEditable = isAdmin();

  const rowsHtml = filtered.map((c) => {
    const imagePath = c.image ? `${ASSET_BASE_PATH}/${c.image}` : `${ASSET_BASE_PATH}/shelly.png`;
    const starPath = STAR_ICON[c.sutapa];
    const gadgetPath = GADGET_ICON[c.gaje];
    const gearIcons = createGearIconsHtml(c.gears);
    const tableModeRatingsHtml = createTableModeRatingsHtml(c);
    const tableDraftStepsHtml = createTableDraftStepsHtml(c);

    const starCell = starPath ? `<img src="${starPath}" class="table-sg-icon" />` : "-";
    const gadgetCell = gadgetPath ? `<img src="${gadgetPath}" class="table-sg-icon" />` : "-";

    const clickFn = isEditable ? `window.openEditorModal('${c.id}')` : `window.openDetailModal('${c.id}')`;
    const clickTitle = isEditable ? `${escapeHtml(c.name)} を編集` : `${escapeHtml(c.name)} の詳細を見る`;

    return `
      <tr>
        <td class="cell-image">
          <div class="table-image-wrap" style="background-color: ${c.rare || '#97ee8d'}; cursor: pointer;" onclick="${clickFn}" title="${clickTitle}">
            <img src="${imagePath}" alt="${c.name}" class="table-char-image" onerror="this.src='${ASSET_BASE_PATH}/shelly.png'" />
            <span class="table-char-name">${escapeHtml(c.name)}</span>
          </div>
        </td>
        <td class="cell-strength">${createStrengthHtml(c.tuyosa)}</td>
        <td class="cell-difficulty">${createDifficultyHtml(c.difficulty)}</td>
        <td class="cell-icon">${starCell}</td>
        <td class="cell-icon">${gadgetCell}</td>
        <td class="cell-gears">${gearIcons}</td>
        <td class="cell-modes desktop-only">${tableModeRatingsHtml}</td>
        <td class="cell-draft-steps desktop-only">${tableDraftStepsHtml}</td>
        <td class="cell-date desktop-only"><span class="table-date-text">${formatShortDate(c.addedDate)}</span></td>
      </tr>
    `;
  }).join("");

  tableViewEl.innerHTML = `
    <div class="table-wrap">
      <table class="rating-table">
        <thead>
          <tr>
            <th class="sortable-th cell-image" data-sorts=",name-asc" title="タップでレア度順 / 50音順を切り替え">アイコン <span class="sort-indicator"></span></th>
            <th class="sortable-th cell-strength" data-sorts="strength-desc,strength-asc" title="タップで強さ順（昇順/降順）">強さ <span class="sort-indicator"></span></th>
            <th class="sortable-th cell-difficulty" data-sorts="difficulty-asc,difficulty-desc" title="タップで難易度順（昇順/降順）">難易度 <span class="sort-indicator"></span></th>
            <th colspan="3" class="cell-build">おすすめビルド</th>
            <th class="cell-modes desktop-only">モード別評価</th>
            <th class="cell-draft-steps desktop-only">ピック順</th>
            <th class="sortable-th cell-date desktop-only" data-sorts="date-desc,date-asc" title="タップで実装日順（新しい順/古い順）">実装日 <span class="sort-indicator"></span></th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;

  const currentSortKey = SORT_MODES[currentSortIndex].value;
  if (sortSelect) {
    sortSelect.value = currentSortKey;
  }
  tableViewEl.querySelectorAll(".sortable-th").forEach(th => {
    const sorts = th.dataset.sorts.split(",");
    const indicator = th.querySelector(".sort-indicator");

    if (sorts.includes(currentSortKey)) {
      th.classList.add("is-active");
      if (currentSortKey === "") indicator.textContent = "▼";
      else if (currentSortKey === "name-asc") indicator.textContent = "▲";
      else if (currentSortKey === "date-desc") indicator.textContent = "▼";
      else if (currentSortKey === "date-asc") indicator.textContent = "▲";
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
        renderTableView();
      }
    });
  });
}

// 難易度を「低/中/高」バッジで表示（Brawlディレクトリと同じ表示）
function createDifficultyHtml(value) {
  const DIFF_LABEL = { 1: "低", 2: "中", 3: "高" };
  const label = DIFF_LABEL[value];
  if (!label) return '<span class="meta-dim">-</span>';
  return `<span class="diff-badge diff-${value}">${label}</span>`;
}

function createGearIconsHtml(gears) {
  if (!gears || !Array.isArray(gears) || gears.length === 0) return "-";
  return `<div class="gear-icon-wrap">${gears.map(name => {
    const idx = GEAR_NAME_TO_INDEX[name];
    return idx ? `<img src="${ASSET_BASE_PATH}/gear${idx}.png" title="${name}" class="table-gear-icon" />` : `<span style="font-size:0.75rem;">${escapeHtml(name)}</span>`;
  }).join("")}</div>`;
}

// ---- ギアスロット方式 ----
const GEAR_SLOT_COUNT = 4;
let currentPickerSlot = null; // 現在ピッカーで編集中のスロットindex

function initGearSlots() {
  const slotsEl = document.getElementById("gearSlots");
  const pickerEl = document.getElementById("gearPicker");
  if (!slotsEl) return;

  slotsEl.innerHTML = "";
  for (let i = 0; i < GEAR_SLOT_COUNT; i++) {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "gear-slot";
    slot.dataset.slotIndex = i;
    slot.innerHTML = `<span class="gear-slot-num">${i + 1}</span><span class="gear-slot-empty">+</span>`;
    slot.addEventListener("click", () => {
      currentPickerSlot = i;
      // 現在のスロット値をピッカーで強調
      const currentGear = slot.dataset.gearName || "";
      document.querySelectorAll("#gearPicker .gear-pick-btn").forEach(b => {
        b.classList.toggle("is-selected", b.dataset.gear === currentGear);
      });
      pickerEl.hidden = false;
      // スロット要素にフォーカス効果
      document.querySelectorAll(".gear-slot").forEach(s => s.style.outline = "");
      slot.style.outline = "2px solid var(--clr-sage)";
    });
    slotsEl.appendChild(slot);
  }

  // ピッカーのギア選択
  document.querySelectorAll("#gearPicker .gear-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentPickerSlot === null) return;
      const gearName = btn.dataset.gear; // 空文字なら「なし」
      const slots = document.querySelectorAll(".gear-slot");
      const slot = slots[currentPickerSlot];
      if (!slot) return;

      if (gearName) {
        const idx = GEAR_NAME_TO_INDEX[gearName];
        slot.innerHTML = `<span class="gear-slot-num">${currentPickerSlot + 1}</span><img src="${ASSET_BASE_PATH}/gear${idx}.png" title="${gearName}" />`;
        slot.dataset.gearName = gearName;
        slot.classList.add("has-gear");
      } else {
        slot.innerHTML = `<span class="gear-slot-num">${currentPickerSlot + 1}</span><span class="gear-slot-empty">+</span>`;
        slot.dataset.gearName = "";
        slot.classList.remove("has-gear");
      }
      slot.style.outline = "";
      pickerEl.hidden = true;
      currentPickerSlot = null;
    });
  });
}

function setGearSlots(gears) {
  // スロットを初期化してからデータをセット
  initGearSlots();
  const slots = document.querySelectorAll(".gear-slot");
  gears.slice(0, GEAR_SLOT_COUNT).forEach((gearName, i) => {
    if (!gearName || !slots[i]) return;
    const idx = GEAR_NAME_TO_INDEX[gearName];
    if (!idx) return;
    slots[i].innerHTML = `<span class="gear-slot-num">${i + 1}</span><img src="${ASSET_BASE_PATH}/gear${idx}.png" title="${gearName}" />`;
    slots[i].dataset.gearName = gearName;
    slots[i].classList.add("has-gear");
  });
  // ピッカーを閉じる
  const pickerEl = document.getElementById("gearPicker");
  if (pickerEl) pickerEl.hidden = true;
  currentPickerSlot = null;
}

function getGearSlotsValue() {
  return Array.from(document.querySelectorAll(".gear-slot"))
    .map(s => s.dataset.gearName || "")
    .filter(g => g !== ""); // 空スロットは除外
}

function getCharModeRatings(char) {
  const defaultRatings = { gem: 1, ball: 1, heist: 1, zone: 1, bounty: 1, knockout: 1 };
  if (!char) return defaultRatings;
  if (char.modes && typeof char.modes === "object" && !Array.isArray(char.modes)) {
    return {
      gem: Number(char.modes.gem) || 1,
      ball: Number(char.modes.ball) || 1,
      heist: Number(char.modes.heist) || 1,
      zone: Number(char.modes.zone) || 1,
      bounty: Number(char.modes.bounty) || 1,
      knockout: Number(char.modes.knockout) || 1,
    };
  }
  const arr = Array.isArray(char.modes) ? char.modes : [];
  return {
    gem: arr.includes("エメハン") ? 3 : 1,
    ball: arr.includes("サッカー") ? 3 : 1,
    heist: arr.includes("強奪") ? 3 : 1,
    zone: arr.includes("ホットゾーン") ? 3 : 1,
    bounty: arr.includes("賞金稼ぎ") ? 3 : 1,
    knockout: arr.includes("ノックアウト") ? 3 : 1,
  };
}

function createTableModeRatingsHtml(char) {
  const modeRatings = getCharModeRatings(char);
  const modes = [
    { key: "gem", icon: "e-eme.png", title: "エメハン" },
    { key: "ball", icon: "e-soccer.png", title: "サッカー" },
    { key: "heist", icon: "e-godatu.png", title: "強奪" },
    { key: "zone", icon: "e-hotzone.png", title: "ホットゾーン" },
    { key: "bounty", icon: "e-syokin.png", title: "賞金稼ぎ" },
    { key: "knockout", icon: "e-knock.png", title: "ノックアウト" }
  ];
  return `<div class="table-mode-grid">` + modes.map(m => `
    <div class="table-mode-item" title="${m.title}">
      <img src="${ASSET_BASE_PATH}/${m.icon}" class="table-mode-icon" />
      ${createModeRatingHtml(modeRatings[m.key])}
    </div>
  `).join("") + `</div>`;
}

function createTableDraftStepsHtml(char) {
  const DRAFT_PICK_STEPS = ["1手目", "2-3手目", "4-5手目", "6手目"];
  // 表示ラベルは「手目」を除いた数字のみ
  const STEP_LABELS = { "1手目": "1", "2-3手目": "2-3", "4-5手目": "4-5", "6手目": "6" };
  const charTags = char.tags || [];

  // 先出し / 後出しバッジ（フルテキスト）
  const hasFirst = charTags.includes("先出しで強い");
  const hasLast  = charTags.includes("後出しで強い");
  const firstDesc = TAG_DESCRIPTIONS["先出しで強い"] || "";
  const lastDesc  = TAG_DESCRIPTIONS["後出しで強い"] || "";

  const firstBadge = `<span class="table-draft-timing-badge ${hasFirst ? 'is-active' : 'is-inactive'}" title="${escapeHtml("先出しで強い")}: ${escapeHtml(firstDesc)}">先出し</span>`;
  const lastBadge  = `<span class="table-draft-timing-badge ${hasLast  ? 'is-active-last' : 'is-inactive'}" title="${escapeHtml("後出しで強い")}: ${escapeHtml(lastDesc)}">後出し</span>`;
  const timingRow = `<div class="table-draft-timing-row">${firstBadge}${lastBadge}</div>`;

  // ピック順チップ（横並び）
  const chips = DRAFT_PICK_STEPS.map(step => {
    const isActive = charTags.includes(step);
    const desc = TAG_DESCRIPTIONS[step] || "";
    const label = STEP_LABELS[step] || step;
    return `<span class="table-draft-step-chip ${isActive ? 'is-active' : 'is-inactive'}" title="${escapeHtml(step)}: ${escapeHtml(desc)}">${escapeHtml(label)}</span>`;
  }).join("");
  const stepsRow = `<div class="table-draft-steps-track" title="ピック順">${chips}</div>`;

  return `<div class="table-draft-steps-cell">${timingRow}${stepsRow}</div>`;
}

function createModeRatingHtml(val) {
  const level = Number(val) || 1;
  const safeValue = Math.max(1, Math.min(3, level));

  const dots = Array.from({ length: 3 }, (_, index) => {
    const onClass = index < safeValue ? " is-on" : "";
    return `<span class="modal-mode-dot${onClass}"></span>`;
  }).join("");

  return `<span class="modal-mode-wrap modal-mode-level-${safeValue}"><span class="modal-strength-meter">${dots}</span><span class="modal-strength-value">${safeValue}/3</span></span>`;
}

function createStrengthHtml(val, variant = "table") {
  const level = Number(val) || 1;
  const safeValue = Math.max(1, Math.min(5, level));

  if (variant === "modal") {
    const dots = Array.from({ length: 5 }, (_, index) => {
      const onClass = index < safeValue ? " is-on" : "";
      return `<span class="modal-strength-dot${onClass}"></span>`;
    }).join("");

    return `<span class="modal-strength-wrap modal-strength-level-${safeValue}"><span class="modal-strength-meter">${dots}</span><span class="modal-strength-value">${safeValue}/5</span></span>`;
  }

  let bars = "";
  for (let i = 1; i <= 5; i++) {
    bars += `<span class="strength-bar ${i <= level ? 'is-on' : ''}"></span>`;
  }
  return `<span class="strength-wrap strength-level-${level}"><span class="strength-meter">${bars}</span></span>`;
}

function closeDetailModal() {
  if (detailModalEl) detailModalEl.hidden = true;
  document.body.classList.remove("modal-open");
}

window.openDetailModal = function (charId) {
  const char = characters.find(c => c.id === charId);
  if (!char) return;

  const imagePath = char.image ? `${ASSET_BASE_PATH}/${char.image}` : `${ASSET_BASE_PATH}/shelly.png`;
  const starPath = STAR_ICON[char.sutapa];
  const gadgetPath = GADGET_ICON[char.gaje];

  const nameTxt = escapeHtml(char.name || "(名前なし)");
  const rarityHex = char.rare ? char.rare.toLowerCase() : "";
  let rarityName = RARITY_NAME_MAP[rarityHex] || "不明";
  const rarityKey = RARITY_HEX_TO_KEY[rarityHex] || "default";

  const rarityBadge = rarityName !== "不明"
    ? `<span class="modal-rarity-badge rarity-theme-${rarityKey}">${escapeHtml(rarityName)}</span>`
    : '';

  const dateBadge = char.addedDate
    ? `<span class="modal-date-badge">実装日 ${escapeHtml(char.addedDate)}</span>`
    : '';

  modalTitleEl.style.display = "none";

  const bannerSrc = char.banner || "";
  const bannerHtml = bannerSrc
    ? `<img src="${escapeHtml(bannerSrc)}" alt="${escapeHtml(char.name)}" class="modal-banner" loading="lazy" />`
    : (char.image
      ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(char.name)}" class="modal-main-image" loading="lazy" />`
      : '<div class="modal-main-image modal-noimage">画像なし</div>');

  const starHtml = starPath
    ? `<div class="build-slot" title="スターパワー: ${char.sutapa}"><img src="${escapeHtml(starPath)}" alt="スターパワー${char.sutapa}" class="icon icon-sg" loading="lazy" /></div>`
    : '<div class="build-slot empty" title="スターパワーなし"></div>';

  const gadgetHtml = gadgetPath
    ? `<div class="build-slot" title="ガジェット: ${char.gaje}"><img src="${escapeHtml(gadgetPath)}" alt="ガジェット${char.gaje}" class="icon icon-sg" loading="lazy" /></div>`
    : '<div class="build-slot empty" title="ガジェットなし"></div>';

  const gearsInnerHtml = char.gears && char.gears.length > 0
    ? char.gears.map(name => {
        const idx = GEAR_NAME_TO_INDEX[name];
        return idx
          ? `<img src="${ASSET_BASE_PATH}/gear${idx}.png" alt="${name}" title="${name}" class="table-gear-icon" />`
          : `<span style="font-size:0.75rem;" title="${name}">${escapeHtml(name)}</span>`;
      }).join("")
    : '';

  const gearsInlineHtml = char.gears && char.gears.length > 0
    ? `<div class="build-slot gears-slot">${gearsInnerHtml}</div>`
    : '<div class="build-slot empty" title="ギアなし"></div>';

  const comHtml = ''; // コメント非表示要望により無効化

  const difficultyHtml = char.difficulty
    ? `<div class="modal-meta-stat"><span class="modal-stat-label">難易度</span>${createDifficultyHtml(char.difficulty)}</div>`
    : '';

  const strengthRowHtml = char.tuyosa
    ? `<div class="modal-meta-stat"><span class="modal-stat-label">強さ</span>${createStrengthHtml(char.tuyosa, "modal")}</div>`
    : '';

  const guideUrl = char.guide || "";
  const wikiUrl = char.wiki || `https://brawlstars.fandom.com/wiki/${encodeURIComponent(char.name)}`;

  const guideBtnHtml = /^https?:\/\//i.test(guideUrl)
    ? `<a href="${escapeHtml(guideUrl)}" target="_blank" rel="noopener noreferrer" class="guide-link">Brawl Insights ↗</a>`
    : '';

  const wikiBtnHtml = /^https?:\/\//i.test(wikiUrl)
    ? `<a href="${escapeHtml(wikiUrl)}" target="_blank" rel="noopener noreferrer" class="guide-link">Fandom Wiki ↗</a>`
    : '';

  const linkBtnsHtml = (guideBtnHtml || wikiBtnHtml)
    ? `<div class="link-btn-group">${guideBtnHtml}${wikiBtnHtml}</div>`
    : '';

  const modeRatings = getCharModeRatings(char);

  const modeRatingsHtml = `
    <div class="modal-mode-ratings">
      <!-- 1行目: エメハン, サッカー -->
      <div class="mode-rating-row">
        <div class="mode-rating-item">
          <img src="${ASSET_BASE_PATH}/e-eme.png" alt="エメハン" title="エメハン" class="mode-rating-icon" />
          ${createModeRatingHtml(modeRatings.gem)}
        </div>
        <div class="mode-rating-item">
          <img src="${ASSET_BASE_PATH}/e-soccer.png" alt="サッカー" title="サッカー" class="mode-rating-icon" />
          ${createModeRatingHtml(modeRatings.ball)}
        </div>
      </div>
      <!-- 2行目: 強奪, ホットゾーン -->
      <div class="mode-rating-row">
        <div class="mode-rating-item">
          <img src="${ASSET_BASE_PATH}/e-godatu.png" alt="強奪" title="強奪" class="mode-rating-icon" />
          ${createModeRatingHtml(modeRatings.heist)}
        </div>
        <div class="mode-rating-item">
          <img src="${ASSET_BASE_PATH}/e-hotzone.png" alt="ホットゾーン" title="ホットゾーン" class="mode-rating-icon" />
          ${createModeRatingHtml(modeRatings.zone)}
        </div>
      </div>
      <!-- 3行目: 賞金稼ぎ, ノックアウト -->
      <div class="mode-rating-row">
        <div class="mode-rating-item">
          <img src="${ASSET_BASE_PATH}/e-syokin.png" alt="賞金稼ぎ" title="賞金稼ぎ" class="mode-rating-icon" />
          ${createModeRatingHtml(modeRatings.bounty)}
        </div>
        <div class="mode-rating-item">
          <img src="${ASSET_BASE_PATH}/e-knock.png" alt="ノックアウト" title="ノックアウト" class="mode-rating-icon" />
          ${createModeRatingHtml(modeRatings.knockout)}
        </div>
      </div>
    </div>
  `;

  // ドラフト専用ハイライトセクション（手番トラック＋通常ドラフトタグ）
  const DRAFT_PICK_STEPS = ["1手目", "2-3手目", "4-5手目", "6手目"];
  const charTags = char.tags || [];

  const draftCategory = TAG_CATEGORIES.find(c => c.key === "role");
  // tagRows[0]: ポジション（ミッド/サイド/キャリー）, tagRows[1]: タイミング（先出し/後出し）
  // 全選択肢を常に表示し、持っていないものは is-inactive で薄くする
  const positionTags = (draftCategory?.tagRows?.[0] || []);
  const timingTags   = (draftCategory?.tagRows?.[1] || []);

  const makeAllChip = (tag, catKey) => {
    const isActive = charTags.includes(tag);
    const desc = TAG_DESCRIPTIONS[tag] || "";
    return `<span class="draft-all-chip draft-all-chip-${catKey} ${isActive ? 'is-active' : 'is-inactive'}" title="${escapeHtml(tag)}: ${escapeHtml(desc)}">${escapeHtml(tag)}</span>`;
  };

  const positionRowHtml = positionTags.map(t => makeAllChip(t, "role")).join("");
  const timingRowHtml   = timingTags.map(t => makeAllChip(t, "timing")).join("");

  const draftStepsHtml = DRAFT_PICK_STEPS.map(step => {
    const isActive = charTags.includes(step);
    const desc = TAG_DESCRIPTIONS[step] || "";
    return `<span class="draft-step-chip ${isActive ? 'is-active' : 'is-inactive'}" title="${escapeHtml(desc)}">${escapeHtml(step)}</span>`;
  }).join("");

  const draftSectionHtml = `
    <div class="modal-draft-card">
      <div class="modal-draft-card-header">
        <span class="modal-draft-card-title">ドラフト適性</span>
        <div class="modal-draft-badges">${positionRowHtml}</div>
        <div class="modal-draft-badges">${timingRowHtml}</div>
      </div>
      <div class="modal-draft-track-row">
        <span class="modal-draft-track-label">手番</span>
        <div class="draft-steps-track" title="推奨手番・ピック順">
          ${draftStepsHtml}
        </div>
      </div>
    </div>
  `;

  // 右カラムのタグ一覧（ドラフト以外の5カテゴリ：ロール、タイプ、メタ、自衛、ユーティリティ）
  const otherCategories = TAG_CATEGORIES.filter(c => c.key !== "role");
  const groupedTagsHtml = otherCategories.map(cat => {
    const catTags = charTags.filter(t => cat.tags.includes(t));
    if (catTags.length === 0) return "";
    return `
      <div class="modal-tag-group modal-tag-group-${cat.key}">
        <span class="modal-tag-group-label tag-label-${cat.key}">${escapeHtml(cat.category)}</span>
        <div class="modal-tag-group-chips">
          ${catTags.map(t => {
            const desc = TAG_DESCRIPTIONS[t] || "";
            return `<span class="char-tag-badge tag-cat-${cat.key}" title="${escapeHtml(desc)}">${escapeHtml(t)}</span>`;
          }).join("")}
        </div>
      </div>
    `;
  }).filter(Boolean).join("");

  const tagsHtml = groupedTagsHtml
    ? `<div class="modal-tags-grouped-container">${groupedTagsHtml}</div>`
    : '<div class="modal-tags-empty">タグ未設定</div>';

  modalContentEl.innerHTML = `
    <div class="modal-detail-grid">
      <!-- 1. ヘッダー: キャラクター基本情報 -->
      <div class="modal-grid-hero">
        <div class="modal-hero-row">
          <div class="modal-hero-image-wrap">
            <img src="${escapeHtml(imagePath)}" alt="${nameTxt}" class="modal-char-avatar" loading="lazy" />
          </div>
          <div class="modal-hero-header">
            <div class="modal-hero-name">${nameTxt}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
              ${rarityBadge}
              ${dateBadge}
            </div>
            <div class="modal-stats-row">
              ${difficultyHtml}
              ${strengthRowHtml}
            </div>
          </div>
        </div>
      </div>

      <!-- 2. ドラフト適性（PCでは右上、スマホではヘッダー直下） -->
      <div class="modal-grid-draft">
        ${draftSectionHtml}
      </div>

      <!-- 3. おすすめビルド & モード別評価 & 外部リンク -->
      <div class="modal-grid-build-modes">
        <p class="modal-meta-title">おすすめビルド</p>
        <div class="modal-icon-row">${starHtml}${gadgetHtml}${gearsInlineHtml}</div>

        <p class="modal-meta-title">モード別評価</p>
        ${modeRatingsHtml}
        ${linkBtnsHtml}
      </div>

      <!-- 4. タグ一覧 -->
      <div class="modal-grid-tags">
        <p class="modal-meta-title modal-tags-heading">タグ一覧</p>
        ${tagsHtml}
      </div>
    </div>
  `;

  detailModalEl.hidden = false;
  document.body.classList.add("modal-open");
};

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

window.openEditorModal = function (charId) {
  if (!isAdmin()) {
    alert("編集するには管理者権限（対象UID）でのログインが必要です。");
    return;
  }
  const char = characters.find(c => c.id === charId);

  const editorCharIcon = document.getElementById("editorCharIcon");
  const editorCharSubtitle = document.getElementById("editorCharSubtitle");

  if (char) {
    editorModalTitle.textContent = `${char.name} の情報を編集`;
    if (editorCharIcon) {
      editorCharIcon.src = char.image ? `${ASSET_BASE_PATH}/${char.image}` : `${ASSET_BASE_PATH}/shelly.png`;
      editorCharIcon.alt = char.name || "";
      editorCharIcon.style.display = "block";
    }
    if (editorCharSubtitle) {
      editorCharSubtitle.textContent = char.alias ? `(${char.alias})` : "";
    }
    editCharId.value = char.id;
    editName.value = char.name || "";
    editAlias.value = char.alias || "";
    editDate.value = char.addedDate || "";
    editRare.value = char.rare || "#97ee8d";
    editTuyosa.value = char.tuyosa || 3;
    editDifficulty.value = char.difficulty || 1;
    editSutapa.value = char.sutapa || 1;
    editGaje.value = char.gaje || 1;
    editCom.value = char.com || "";
    editGuide.value = char.guide || "";
    editWiki.value = char.wiki || "";
  } else {
    editorModalTitle.textContent = "新規キャラクター追加";
    if (editorCharIcon) {
      editorCharIcon.style.display = "none";
    }
    if (editorCharSubtitle) {
      editorCharSubtitle.textContent = "";
    }
    editCharId.value = "";
    charEditorForm.reset();
    editRare.value = "#97ee8d";
    editTuyosa.value = 3;
    editDifficulty.value = 1;
    editSutapa.value = 1;
    editGaje.value = 1;
    editGuide.value = "";
    editWiki.value = "";
  }

  // トグルボタンの状態設定
  document.querySelectorAll("#rareToggleGroup .rare-toggle-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.rare === editRare.value);
  });
  document.querySelectorAll("#tuyosaToggleGroup .meter-toggle-btn").forEach(b => {
    b.classList.toggle("active", String(b.dataset.tuyosa) === String(editTuyosa.value));
  });
  document.querySelectorAll("#difficultyToggleGroup .meter-toggle-btn").forEach(b => {
    b.classList.toggle("active", String(b.dataset.diff) === String(editDifficulty.value));
  });
  document.querySelectorAll("#sutapaToggleGroup .img-toggle-btn").forEach(b => {
    b.classList.toggle("active", String(b.dataset.sutapa) === String(editSutapa.value));
  });
  document.querySelectorAll("#gajeToggleGroup .img-toggle-btn").forEach(b => {
    b.classList.toggle("active", String(b.dataset.gaje) === String(editGaje.value));
  });

  const modeRatings = getCharModeRatings(char);
  document.querySelectorAll(".mode-toggle-group").forEach(group => {
    const key = group.dataset.mode;
    const val = modeRatings[key] || 1;
    group.querySelectorAll(".meter-toggle-btn").forEach(b => {
      b.classList.toggle("active", String(b.dataset.val) === String(val));
    });
  });

  // ギアスロットに既存データを反映
  setGearSlots(char ? (char.gears || []) : []);

  // タグ設定に既存データを反映
  setTagEditorValues(char ? (char.tags || []) : []);

  // 詳細情報アコーディオンをデフォルト折りたたみにリセット
  const editExtraDetails = document.getElementById("editExtraDetails");
  if (editExtraDetails) editExtraDetails.open = false;

  editorModalEl.hidden = false;
  document.body.classList.add("modal-open");
};

function closeEditorModal() {
  editorModalEl.hidden = true;
  document.body.classList.remove("modal-open");
}

async function handleFormSubmit(e) {
  if (e) e.preventDefault();

  console.log("handleFormSubmit called!");

  if (!isAdmin()) {
    alert("権限がありません。管理者（対象UID）でログインしてください。");
    return;
  }

  const id = editCharId.value || "char_" + Date.now();
  const oldChar = characters.find(c => c.id === id);
  const oldRareHex = oldChar ? oldChar.rare : null;

  const selectedGears = getGearSlotsValue();
  const selectedTags = getTagEditorValues();

  const modesObj = {};
  document.querySelectorAll(".mode-toggle-group").forEach(group => {
    const key = group.dataset.mode;
    const activeBtn = group.querySelector(".meter-toggle-btn.active");
    modesObj[key] = activeBtn ? Number(activeBtn.dataset.val) || 1 : 1;
  });

  const updatedChar = {
    id: id,
    order: oldChar?.order ?? (Math.max(0, ...characters.map(c => c.order || 0)) + 1),
    name: editName.value.trim(),
    alias: editAlias.value.trim(),
    addedDate: editDate.value.trim(),
    image: (editCharId.value && oldChar?.image) || `${id}.png`,
    rare: editRare.value,
    tuyosa: Number(editTuyosa.value),
    difficulty: Number(editDifficulty.value),
    sutapa: Number(editSutapa.value),
    gaje: Number(editGaje.value),
    gears: selectedGears,
    tags: selectedTags,
    modes: modesObj,
    guide: editGuide.value.trim(),
    wiki: editWiki.value.trim(),
    com: editCom.value.trim()
  };

  const newHex = (updatedChar.rare || "#97ee8d").toLowerCase();
  const newRarityKey = RARITY_HEX_TO_KEY[newHex] || "rare";

  try {
    // レア度が変更された場合、旧レア度ノードから削除
    if (oldRareHex) {
      const oldHex = oldRareHex.toLowerCase();
      const oldRarityKey = RARITY_HEX_TO_KEY[oldHex] || "rare";
      if (oldRarityKey !== newRarityKey) {
        await remove(ref(db, `brawl_eval/by_rarity/${oldRarityKey}/${id}`));
      }
    }

    // 新しいレア度ノードへ保存
    await set(ref(db, `brawl_eval/by_rarity/${newRarityKey}/${id}`), updatedChar);

    closeEditorModal();
    if (window.HlToast) {
      window.HlToast.show(`${updatedChar.name} を保存しました。`, "success");
    } else {
      setStatus(`${updatedChar.name} を保存しました。`);
    }
  } catch (err) {
    alert("Firebaseへの保存に失敗しました: " + err.message);
    console.error(err);
  }
}

window.deleteCharacter = async function (charId) {
  if (!isAdmin()) return;
  const char = characters.find(c => c.id === charId);
  if (!char) return;

  if (confirm(`「${char.name}」を削除してもよろしいですか？`)) {
    characters = characters.filter(c => c.id !== charId);
    try {
      await saveToFirebase(characters);
      setStatus(`「${char.name}」を削除しました。`);
    } catch (err) {
      alert("削除の保存に失敗しました: " + err.message);
    }
  }
};

async function saveToFirebase(data) {
  const charRef = ref(db, "brawl_eval/characters");
  await set(charRef, data);
}
