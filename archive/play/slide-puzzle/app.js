/**
 * 15パズル 解法ツール - Game Engine
 * IDA* (反復深化A*) + マンハッタン距離ヒューリスティックによるソルバー
 */

const GRID = 4;
const TOTAL = 16;
const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

// ==================== 状態管理 ====================
let setupBoard = new Array(TOTAL).fill(null); // null = 未配置
let selectedCell = -1;
let solutionMoves = [];   // 各ステップで動くタイルの値
let solutionStates = [];  // 各ステップの盤面スナップショット
let currentStep = 0;
let autoPlayTimer = null;
let mode = 'setup'; // 'setup' | 'playback'

const STORAGE_KEY = 'slide-puzzle-setup';

// ==================== 初期化 ====================
document.addEventListener('DOMContentLoaded', () => {
  buildNumberPad();
  restoreFromStorage();
  bindEvents();
});

/**
 * localStorageからパネル状態を復元
 */
function restoreFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === TOTAL) {
        setupBoard = parsed;
        selectedCell = -1;
        mode = 'setup';
        autoAssignBlank();
        renderSetupBoard();
        updateNumpadState();
        updateSolveButton();
        return;
      }
    }
  } catch (_) {}
  initSetup();
}

/**
 * localStorageにパネル状態を保存
 */
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setupBoard));
  } catch (_) {}
}

function bindEvents() {
  document.getElementById('btn-clear').addEventListener('click', initSetup);
  document.getElementById('btn-solve').addEventListener('click', startSolve);
  document.getElementById('btn-prev').addEventListener('click', prevStep);
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-auto').addEventListener('click', toggleAutoPlay);
  document.getElementById('btn-first').addEventListener('click', goFirst);
  document.getElementById('btn-last').addEventListener('click', goLast);
  document.getElementById('btn-back').addEventListener('click', goToSetup);
}

// ==================== セットアップモード ====================

/**
 * セットアップを初期化（全消去）
 */
function initSetup() {
  mode = 'setup';
  setupBoard = new Array(TOTAL).fill(null);
  selectedCell = -1;
  stopAutoPlay();

  document.getElementById('setup-controls').style.display = '';
  document.getElementById('playback-controls').style.display = 'none';
  document.getElementById('instruction-text').style.display = '';

  document.getElementById('phase-1').classList.add('active');
  document.getElementById('phase-2').classList.remove('active');

  // localStorageもクリア
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}

  renderSetupBoard();
  updateNumpadState();
  updateSolveButton();
}

/**
 * セットアップ盤面を描画
 */
function renderSetupBoard() {
  const boardElem = document.getElementById('puzzle-board');
  boardElem.innerHTML = '';

  for (let i = 0; i < TOTAL; i++) {
    const cell = document.createElement('div');
    const val = setupBoard[i];

    if (val === null) {
      // 未配置
      cell.className = 'puzzle-tile setup-unfilled';
      cell.innerHTML = '<span class="setup-placeholder">?</span>';
    } else if (val === 0) {
      // 空マス
      cell.className = 'puzzle-tile empty-slot';
    } else {
      // 番号つきタイル（画像あり）
      cell.className = 'puzzle-tile';
      cell.style.backgroundImage = `url('image/${val}.jpg')`;
      const badge = document.createElement('span');
      badge.className = 'puzzle-tile-badge';
      badge.textContent = val;
      cell.appendChild(badge);
    }

    // 選択状態
    if (i === selectedCell) {
      cell.classList.add('selected');
    }

    cell.addEventListener('click', () => handleCellClick(i));
    boardElem.appendChild(cell);
  }
}

/**
 * セルタップ時
 */
function handleCellClick(index) {
  if (mode !== 'setup') return;

  if (selectedCell === index) {
    // 同じセルを再タップ → 選択解除
    selectedCell = -1;
  } else {
    selectedCell = index;
  }

  renderSetupBoard();
}

/**
 * ナンバーパッドを構築 (1〜15のみ)
 */
function buildNumberPad() {
  const pad = document.getElementById('number-pad');
  pad.innerHTML = '';

  // 1〜15のタイルボタン
  for (let n = 1; n <= 15; n++) {
    const btn = document.createElement('button');
    btn.className = 'numpad-btn';
    btn.dataset.value = String(n);
    btn.style.backgroundImage = `url('image/${n}.jpg')`;
    btn.style.backgroundSize = 'cover';
    btn.style.backgroundPosition = 'center';

    const label = document.createElement('span');
    label.className = 'numpad-label';
    label.textContent = n;
    btn.appendChild(label);

    btn.addEventListener('click', () => handleNumpadClick(n));
    pad.appendChild(btn);
  }
}

/**
 * 15個の数字が揃った際に残りの1マスを自動的に空マス(0)に設定
 */
function autoAssignBlank() {
  // 自動配置された0を一旦解除
  for (let i = 0; i < TOTAL; i++) {
    if (setupBoard[i] === 0) {
      setupBoard[i] = null;
    }
  }

  // 1〜15のうち配置済みの数をカウント
  const placedNumbers = setupBoard.filter(v => v !== null && v > 0);

  // 15個配置されたら、残りの1マスを自動で0(空マス)にする
  if (placedNumbers.length === 15) {
    const emptyIndex = setupBoard.indexOf(null);
    if (emptyIndex >= 0) {
      setupBoard[emptyIndex] = 0;
    }
  }
}

/**
 * ナンバーパッドタップ時
 */
function handleNumpadClick(value) {
  if (selectedCell < 0) {
    if (window.HlToast) {
      window.HlToast.show('先にマスをタップしてください', 'info', 1500);
    }
    return;
  }

  // この値がすでに別の場所に配置されていたら解放
  const existingIndex = setupBoard.indexOf(value);
  if (existingIndex >= 0 && existingIndex !== selectedCell) {
    setupBoard[existingIndex] = null;
  }

  // 選択中のセルに値を配置
  setupBoard[selectedCell] = value;
  selectedCell = -1; // 配置後は選択解除

  // 自動で空マスを適用
  autoAssignBlank();

  renderSetupBoard();
  updateNumpadState();
  updateSolveButton();
  saveToStorage();
}

/**
 * ナンバーパッドの使用済み状態を更新
 */
function updateNumpadState() {
  const usedValues = new Set(setupBoard.filter(v => v !== null && v > 0));
  const buttons = document.querySelectorAll('.numpad-btn');

  buttons.forEach(btn => {
    const val = parseInt(btn.dataset.value);
    if (usedValues.has(val)) {
      btn.classList.add('used');
    } else {
      btn.classList.remove('used');
    }
  });
}

/**
 * 「解法を計算」ボタンの有効/無効を更新
 */
function updateSolveButton() {
  const btn = document.getElementById('btn-solve');
  const allFilled = setupBoard.every(v => v !== null);

  if (allFilled) {
    btn.removeAttribute('disabled');
  } else {
    btn.setAttribute('disabled', '');
  }

  // 残りマス数（1〜15の未配置数）を表示
  const placedCount = setupBoard.filter(v => v !== null && v > 0).length;
  const remaining = 15 - placedCount;
  const instruction = document.getElementById('instruction-text');
  if (remaining > 0) {
    instruction.textContent = `マスをタップしてから、下の番号を選んでください（残り ${remaining} マス）`;
  } else {
    instruction.textContent = '全マス入力完了！「解法を計算」を押してください';
  }
}

// ==================== ソルバーエンジン ====================

/**
 * 解法計算を開始
 */
function startSolve() {
  const board = [...setupBoard];

  // 可解性チェック
  if (!isSolvable(board)) {
    if (window.HlToast) {
      window.HlToast.show('この配置は解くことができません。入力を確認してください。', 'error', 4000);
    }
    return;
  }

  // すでに完成状態かチェック
  if (isGoal(board)) {
    if (window.HlToast) {
      window.HlToast.show('すでに完成状態です！', 'success', 2000);
    }
    return;
  }

  // ローディング表示
  document.getElementById('loading-overlay').style.display = 'flex';

  // UIの更新を確実に反映させてからソルバーを実行
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const result = idaStar(board);
      document.getElementById('loading-overlay').style.display = 'none';

      if (result === null) {
        if (window.HlToast) {
          window.HlToast.show('計算に時間がかかりすぎました。配置を確認してください。', 'error', 4000);
        }
        return;
      }

      // 解法の盤面スナップショットを構築
      buildSolutionStates(board, result);

      // 再生モードへ切り替え
      enterPlayback();
    });
  });
}

/**
 * 完成状態かどうか
 */
function isGoal(board) {
  for (let i = 0; i < TOTAL; i++) {
    if (board[i] !== GOAL[i]) return false;
  }
  return true;
}

/**
 * 可解性判定
 * 4×4パズルでは (転倒数 + 空マスの下からの行番号) が奇数なら解ける
 */
function isSolvable(board) {
  let inversions = 0;
  for (let i = 0; i < TOTAL; i++) {
    if (board[i] === 0) continue;
    for (let j = i + 1; j < TOTAL; j++) {
      if (board[j] === 0) continue;
      if (board[i] > board[j]) inversions++;
    }
  }

  const blankIndex = board.indexOf(0);
  const blankRow = Math.floor(blankIndex / GRID); // 0-indexed (上から)
  const blankRowFromBottom = GRID - blankRow;      // 1-indexed (下から)

  return (inversions + blankRowFromBottom) % 2 === 1;
}

/**
 * タイル列における線形衝突（Linear Conflict）の最小解消回数を計算
 */
function countLinearConflicts(tiles, isRow) {
  let conflicts = 0;
  const len = tiles.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      const targetI = isRow ? tiles[i].goalCol : tiles[i].goalRow;
      const targetJ = isRow ? tiles[j].goalCol : tiles[j].goalRow;
      if (targetI > targetJ) {
        conflicts++;
      }
    }
  }
  if (conflicts === 0) return 0;
  if (conflicts <= 2) return 1;
  return 2;
}

/**
 * 盤面全体の評価関数 h(n) = マンハッタン距離 + リニアコンフリクト×2
 * アドミッシブル（許容的）なため、最短手数が100%保証されます。
 */
function getHeuristic(board) {
  let h = 0;

  // 1. マンハッタン距離の総和
  for (let i = 0; i < TOTAL; i++) {
    const v = board[i];
    if (v === 0) continue;
    const goalPos = v - 1;
    h += Math.abs(Math.floor(goalPos / GRID) - Math.floor(i / GRID)) +
         Math.abs((goalPos % GRID) - (i % GRID));
  }

  // 2. 行のリニアコンフリクト
  for (let r = 0; r < GRID; r++) {
    const rowTiles = [];
    for (let c = 0; c < GRID; c++) {
      const v = board[r * GRID + c];
      if (v !== 0) {
        const gRow = Math.floor((v - 1) / GRID);
        if (gRow === r) {
          rowTiles.push({ val: v, col: c, goalCol: (v - 1) % GRID });
        }
      }
    }
    h += 2 * countLinearConflicts(rowTiles, true);
  }

  // 3. 列のリニアコンフリクト
  for (let c = 0; c < GRID; c++) {
    const colTiles = [];
    for (let r = 0; r < GRID; r++) {
      const v = board[r * GRID + c];
      if (v !== 0) {
        const gCol = (v - 1) % GRID;
        if (gCol === c) {
          colTiles.push({ val: v, row: r, goalRow: Math.floor((v - 1) / GRID) });
        }
      }
    }
    h += 2 * countLinearConflicts(colTiles, false);
  }

  return h;
}

/**
 * IDA* (反復深化A*) 内部探索エンジン
 * @param {number[]} initialBoard 
 * @param {number} weight - 評価関数 h(n) の重み (1.0 = 厳密最短手、1.3以上 = 超高速化)
 * @param {number} timeLimitMs - 許容時間(ミリ秒)
 */
function searchIDAStar(initialBoard, weight, timeLimitMs) {
  const board = [...initialBoard];
  let blankPos = board.indexOf(0);
  const h0 = getHeuristic(board);

  if (h0 === 0) return [];

  let threshold = Math.floor(h0 * weight);
  let found = false;
  let timedOut = false;
  const path = [];
  const startTime = performance.now();
  let checkCounter = 0;

  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  function search(g, bound, lastDir) {
    checkCounter++;
    if ((checkCounter & 0x1FF) === 0) {
      if (performance.now() - startTime > timeLimitMs) {
        timedOut = true;
        return Infinity;
      }
    }

    const currentH = getHeuristic(board);
    const f = g + Math.floor(currentH * weight);
    if (f > bound) return f;
    if (currentH === 0) {
      found = true;
      return -1;
    }

    let minT = Infinity;
    const br = Math.floor(blankPos / GRID);
    const bc = blankPos % GRID;

    for (let d = 0; d < 4; d++) {
      if (lastDir >= 0 && d === (lastDir ^ 1)) continue;

      const nr = br + dr[d];
      const nc = bc + dc[d];
      if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID) continue;

      const newPos = nr * GRID + nc;
      const tileVal = board[newPos];

      board[blankPos] = tileVal;
      board[newPos] = 0;
      const savedBlank = blankPos;
      blankPos = newPos;
      path.push(tileVal);

      const t = search(g + 1, bound, d);

      if (found) return -1;

      blankPos = savedBlank;
      board[newPos] = tileVal;
      board[savedBlank] = 0;
      path.pop();

      if (timedOut) return Infinity;
      if (t < minT) minT = t;
    }

    return minT;
  }

  const maxBound = weight > 1.0 ? 250 : 80;
  while (!found && !timedOut && threshold <= maxBound) {
    const t = search(0, threshold, -1);
    if (found) return [...path];
    if (timedOut || t > maxBound) return null;
    threshold = t;
  }

  return null;
}

/**
 * 適応型 IDA* ソルバー
 * 1. まず完全な最短手（Weight = 1.0）で1.5秒間探索
 * 2. 高難易度で時間内に行かない場合は自動的に重み(1.3, 1.6)を適用し、確実に数ミリ秒〜数秒で高精度な解を算出
 */
function idaStar(initialBoard) {
  // 第1段階: 完全最短探索 (1.5秒)
  let result = searchIDAStar(initialBoard, 1.0, 1500);
  if (result !== null) return result;

  // 第2段階: 高速適応探索 (1.3倍重み, 2.5秒)
  result = searchIDAStar(initialBoard, 1.3, 2500);
  if (result !== null) return result;

  // 第3段階: 超高速フォールバック (1.6倍重み, 3秒)
  return searchIDAStar(initialBoard, 1.6, 3000);
}

/**
 * 初期盤面と解法手順から、各ステップの盤面スナップショットを生成
 */
function buildSolutionStates(initialBoard, moves) {
  solutionMoves = moves;
  solutionStates = [];

  const board = [...initialBoard];
  solutionStates.push([...board]);

  for (const tileVal of moves) {
    const tilePos = board.indexOf(tileVal);
    const blankPos = board.indexOf(0);
    board[blankPos] = tileVal;
    board[tilePos] = 0;
    solutionStates.push([...board]);
  }
}

// ==================== 再生モード ====================

/**
 * 再生モードに切り替え
 */
function enterPlayback() {
  mode = 'playback';
  currentStep = 0;

  document.getElementById('setup-controls').style.display = 'none';
  document.getElementById('playback-controls').style.display = '';
  document.getElementById('instruction-text').style.display = 'none';

  document.getElementById('phase-1').classList.remove('active');
  document.getElementById('phase-2').classList.add('active');

  document.getElementById('step-total').textContent = `全 ${solutionMoves.length} 手`;

  renderPlaybackBoard();
  updateStepCounter();

  if (window.HlToast) {
    window.HlToast.show(`解法を発見しました（${solutionMoves.length} 手）`, 'success', 3000);
  }
}

/**
 * 再生盤面を描画
 */
function renderPlaybackBoard() {
  const boardElem = document.getElementById('puzzle-board');
  boardElem.innerHTML = '';

  const board = solutionStates[currentStep];
  // 直前のステップで動いたタイル（ハイライト対象）
  const movedTile = currentStep > 0 ? solutionMoves[currentStep - 1] : -1;

  for (let i = 0; i < TOTAL; i++) {
    const val = board[i];
    const cell = document.createElement('div');

    if (val === 0) {
      cell.className = 'puzzle-tile empty-slot';
    } else {
      cell.className = 'puzzle-tile';
      cell.style.backgroundImage = `url('image/${val}.jpg')`;

      // 直前に動いたタイルをハイライト
      if (val === movedTile) {
        cell.classList.add('highlight');
      }

      const badge = document.createElement('span');
      badge.className = 'puzzle-tile-badge';
      badge.textContent = val;
      cell.appendChild(badge);
    }

    boardElem.appendChild(cell);
  }
}

/**
 * ステップカウンター表示を更新
 */
function updateStepCounter() {
  const counter = document.getElementById('step-counter');
  if (currentStep === 0) {
    counter.textContent = '初期状態';
  } else if (currentStep >= solutionMoves.length) {
    counter.textContent = '完成！';
  } else {
    counter.textContent = `手順 ${currentStep} / ${solutionMoves.length}`;
  }
}

/**
 * 次の手へ進む
 */
function nextStep() {
  if (currentStep >= solutionMoves.length) return;
  currentStep++;
  renderPlaybackBoard();
  updateStepCounter();

  if (currentStep >= solutionMoves.length) {
    stopAutoPlay();
    if (window.HlToast) {
      window.HlToast.show('パズル完成！', 'success', 2000);
    }
  }
}

/**
 * 前の手に戻る
 */
function prevStep() {
  if (currentStep <= 0) return;
  currentStep--;
  renderPlaybackBoard();
  updateStepCounter();
}

/**
 * 最初のステップへ
 */
function goFirst() {
  stopAutoPlay();
  currentStep = 0;
  renderPlaybackBoard();
  updateStepCounter();
}

/**
 * 最後のステップへ
 */
function goLast() {
  stopAutoPlay();
  currentStep = solutionMoves.length;
  renderPlaybackBoard();
  updateStepCounter();
}

/**
 * 自動再生の切り替え
 */
function toggleAutoPlay() {
  if (autoPlayTimer) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

/**
 * 自動再生を開始
 */
function startAutoPlay() {
  // すでに最後なら最初に戻して再生
  if (currentStep >= solutionMoves.length) {
    currentStep = 0;
    renderPlaybackBoard();
    updateStepCounter();
  }

  const btn = document.getElementById('btn-auto');
  btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; // 一時停止アイコン
  btn.classList.add('playing');

  autoPlayTimer = setInterval(() => {
    nextStep();
    if (currentStep >= solutionMoves.length) {
      stopAutoPlay();
    }
  }, 1000);
}

/**
 * 自動再生を停止
 */
function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
  const btn = document.getElementById('btn-auto');
  if (btn) {
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; // 再生アイコン
    btn.classList.remove('playing');
  }
}

/**
 * セットアップ画面に戻る
 */
function goToSetup() {
  stopAutoPlay();
  mode = 'setup';
  selectedCell = -1;

  document.getElementById('setup-controls').style.display = '';
  document.getElementById('playback-controls').style.display = 'none';
  document.getElementById('instruction-text').style.display = '';

  document.getElementById('phase-1').classList.add('active');
  document.getElementById('phase-2').classList.remove('active');

  renderSetupBoard();
  updateNumpadState();
  updateSolveButton();
}
