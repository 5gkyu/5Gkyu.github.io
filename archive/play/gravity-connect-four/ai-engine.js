/**
 * 重力反転コネクトフォー 最強AI探索エンジン
 * 
 * 探索アルゴリズム:
 * - 反復深化 (Iterative Deepening)
 * - アルファベータ法 (Alpha-Beta Pruning) によるゲーム木探索
 * - 置換表 (Transposition Table) による同一局面のメモ化枝刈り
 * - 指し手オーダリング (Move Ordering) による枝刈り効率最大化
 * - 4連・3連・2連・中央支配・MP効率を考慮した高精度評価関数
 */

const ROWS = 7;
const COLS = 7;
const MAX_MP = 8;
const REVERSE_COST = 2;
const FORWARD_COST = 4;
const SHIFT_COST = 8;

const GRAVITY_CYCLE = [
  { name: '下', id: 'down', dr: 1, dc: 0 },
  { name: '右', id: 'right', dr: 0, dc: 1 },
  { name: '上', id: 'up', dr: -1, dc: 0 },
  { name: '左', id: 'left', dr: 0, dc: -1 }
];

// 置換表（探索キャッシュ）
const transpositionTable = new Map();

/* -------------------------------------------------------------
   盤面状態のディープコピー
------------------------------------------------------------- */
function cloneState(state) {
  const newGrid = Array.from({ length: ROWS }, (_, r) => [...state.grid[r]]);
  return {
    grid: newGrid,
    gravityIndex: state.gravityIndex,
    movesLeft: state.movesLeft,
    isClockwise: state.isClockwise,
    redMP: state.redMP,
    yellowMP: state.yellowMP,
    currentPlayer: state.currentPlayer
  };
}

/* -------------------------------------------------------------
   初期状態の生成
------------------------------------------------------------- */
function createInitialState() {
  return {
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    gravityIndex: 0, // 0:下
    movesLeft: 3,
    isClockwise: true,
    redMP: MAX_MP,
    yellowMP: MAX_MP,
    currentPlayer: 'red'
  };
}

/* -------------------------------------------------------------
   落下着地点の計算
------------------------------------------------------------- */
function getLandingPosition(startR, startC, grid, gravity) {
  const { dr, dc } = gravity;
  let entryR = startR;
  let entryC = startC;

  if (dr === 1 && dc === 0) { entryR = 0; entryC = startC; }
  else if (dr === -1 && dc === 0) { entryR = ROWS - 1; entryC = startC; }
  else if (dr === 0 && dc === 1) { entryR = startR; entryC = 0; }
  else if (dr === 0 && dc === -1) { entryR = startR; entryC = COLS - 1; }

  if (grid[entryR][entryC] !== null) return null;

  let r = entryR;
  let c = entryC;
  while (true) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
    if (grid[nr][nc] !== null) break;
    r = nr;
    c = nc;
  }
  return { r, c };
}

/* -------------------------------------------------------------
   全石の一斉スライド
------------------------------------------------------------- */
function slideAllDiscs(grid, gravity) {
  const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  if (gravity.id === 'down') {
    for (let c = 0; c < COLS; c++) {
      let targetR = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][c]) {
          newGrid[targetR][c] = grid[r][c];
          targetR--;
        }
      }
    }
  } else if (gravity.id === 'up') {
    for (let c = 0; c < COLS; c++) {
      let targetR = 0;
      for (let r = 0; r < ROWS; r++) {
        if (grid[r][c]) {
          newGrid[targetR][c] = grid[r][c];
          targetR++;
        }
      }
    }
  } else if (gravity.id === 'right') {
    for (let r = 0; r < ROWS; r++) {
      let targetC = COLS - 1;
      for (let c = COLS - 1; c >= 0; c--) {
        if (grid[r][c]) {
          newGrid[r][targetC] = grid[r][c];
          targetC--;
        }
      }
    }
  } else if (gravity.id === 'left') {
    for (let r = 0; r < ROWS; r++) {
      let targetC = 0;
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) {
          newGrid[r][targetC] = grid[r][c];
          targetC++;
        }
      }
    }
  }
  return newGrid;
}

// 全88本の4連ラインを事前計算
const PRECOMPUTED_WIN_LINES = [];
(function precomputeWinLines() {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        const line = [];
        let ok = true;
        for (let step = 0; step < 4; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) { ok = false; break; }
          line.push({ r: nr, c: nc });
        }
        if (ok) PRECOMPUTED_WIN_LINES.push(line);
      }
    }
  }
})();

/* -------------------------------------------------------------
   勝敗判定 (4目並びの検査)
------------------------------------------------------------- */
function checkWinner(grid) {
  let redWins = false;
  let yellowWins = false;

  for (let i = 0; i < PRECOMPUTED_WIN_LINES.length; i++) {
    const line = PRECOMPUTED_WIN_LINES[i];
    const p0 = grid[line[0].r][line[0].c];
    if (!p0) continue;

    if (grid[line[1].r][line[1].c] !== p0) continue;
    if (grid[line[2].r][line[2].c] !== p0) continue;
    if (grid[line[3].r][line[3].c] !== p0) continue;

    if (p0 === 'red') redWins = true;
    else yellowWins = true;

    if (redWins && yellowWins) return 'both';
  }

  if (redWins) return 'red';
  if (yellowWins) return 'yellow';
  return null;
}

/* -------------------------------------------------------------
   盤面ハッシュ値生成 (置換表のキー)
------------------------------------------------------------- */
function computeStateHash(state) {
  let str = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = state.grid[r][c];
      str += v === 'red' ? 'R' : v === 'yellow' ? 'Y' : '.';
    }
  }
  return `${str}|${state.gravityIndex}|${state.movesLeft}|${state.isClockwise ? 1 : 0}|${state.redMP}|${state.yellowMP}|${state.currentPlayer}`;
}

/* -------------------------------------------------------------
   合法手の生成
------------------------------------------------------------- */
function generateLegalMoves(state) {
  const moves = [];
  const p = state.currentPlayer;
  const currentMP = p === 'red' ? state.redMP : state.yellowMP;
  const grav = GRAVITY_CYCLE[state.gravityIndex];

  // 1. スキル: 即時転換 (8 MP)
  if (currentMP >= SHIFT_COST) {
    for (let i = 0; i < 4; i++) {
      if (i !== state.gravityIndex) {
        moves.push({ type: 'skill_shift', targetDir: i });
      }
    }
  }

  // 2. スキル: 重力前進 (4 MP)
  if (currentMP >= FORWARD_COST) {
    moves.push({ type: 'skill_forward' });
  }

  // 3. スキル: 周期反転 (2 MP)
  if (currentMP >= REVERSE_COST) {
    moves.push({ type: 'skill_reverse' });
  }

  // 4. 通常の石配置 (7レーン)
  // 中央寄りのレーン (3, 2, 4, 1, 5, 0, 6) を優先探索
  const laneOrder = [3, 2, 4, 1, 5, 0, 6];
  for (const idx of laneOrder) {
    let startR = 0, startC = 0;
    if (grav.id === 'down') { startR = 0; startC = idx; }
    else if (grav.id === 'up') { startR = ROWS - 1; startC = idx; }
    else if (grav.id === 'left') { startR = idx; startC = COLS - 1; }
    else if (grav.id === 'right') { startR = idx; startC = 0; }

    const landing = getLandingPosition(startR, startC, state.grid, grav);
    if (landing !== null) {
      moves.push({ type: 'drop', r: startR, c: startC, laneIdx: idx });
    }
  }

  return moves;
}

/* -------------------------------------------------------------
   着手実行と状態更新
------------------------------------------------------------- */
function applyMove(state, move) {
  const next = cloneState(state);
  const p = next.currentPlayer;

  if (move.type === 'drop') {
    const grav = GRAVITY_CYCLE[next.gravityIndex];
    const landing = getLandingPosition(move.r, move.c, next.grid, grav);
    next.grid[landing.r][landing.c] = p;

    // 石配置で MP +1 回復
    if (p === 'red') next.redMP = Math.min(MAX_MP, next.redMP + 1);
    else next.yellowMP = Math.min(MAX_MP, next.yellowMP + 1);

    // 手数カウント減少
    next.movesLeft--;
    if (next.movesLeft === 0) {
      const step = next.isClockwise ? 1 : -1;
      next.gravityIndex = (next.gravityIndex + step + 4) % 4;
      next.grid = slideAllDiscs(next.grid, GRAVITY_CYCLE[next.gravityIndex]);
      next.movesLeft = 3;
    }
  } else if (move.type === 'skill_reverse') {
    if (p === 'red') next.redMP -= REVERSE_COST;
    else next.yellowMP -= REVERSE_COST;
    next.isClockwise = !next.isClockwise;

    next.movesLeft--;
    if (next.movesLeft === 0) {
      const step = next.isClockwise ? 1 : -1;
      next.gravityIndex = (next.gravityIndex + step + 4) % 4;
      next.grid = slideAllDiscs(next.grid, GRAVITY_CYCLE[next.gravityIndex]);
      next.movesLeft = 3;
    }
  } else if (move.type === 'skill_forward') {
    if (p === 'red') next.redMP -= FORWARD_COST;
    else next.yellowMP -= FORWARD_COST;

    const step = next.isClockwise ? 1 : -1;
    next.gravityIndex = (next.gravityIndex + step + 4) % 4;
    next.grid = slideAllDiscs(next.grid, GRAVITY_CYCLE[next.gravityIndex]);
    next.movesLeft = 3;
  } else if (move.type === 'skill_shift') {
    if (p === 'red') next.redMP -= SHIFT_COST;
    else next.yellowMP -= SHIFT_COST;

    next.gravityIndex = move.targetDir;
    next.grid = slideAllDiscs(next.grid, GRAVITY_CYCLE[next.gravityIndex]);
    next.movesLeft = 3;
  }

  // ターン交代
  next.currentPlayer = p === 'red' ? 'yellow' : 'red';
  return next;
}

/* -------------------------------------------------------------
   盤面評価関数 (Heuristic Evaluation)
------------------------------------------------------------- */
function evaluateState(state, perspectivePlayer) {
  const winner = checkWinner(state.grid);
  if (winner !== null) {
    if (winner === 'both') return 0; // 同時達成
    return winner === perspectivePlayer ? 100000 : -100000;
  }

  let score = 0;
  const opp = perspectivePlayer === 'red' ? 'yellow' : 'red';

  // 4連ラインパターン評価
  for (let i = 0; i < PRECOMPUTED_WIN_LINES.length; i++) {
    const line = PRECOMPUTED_WIN_LINES[i];
    let myCount = 0;
    let oppCount = 0;

    for (let j = 0; j < 4; j++) {
      const val = state.grid[line[j].r][line[j].c];
      if (val === perspectivePlayer) myCount++;
      else if (val === opp) oppCount++;
    }

    if (myCount > 0 && oppCount === 0) {
      if (myCount === 3) score += 950;
      else if (myCount === 2) score += 65;
      else score += 6;
    } else if (oppCount > 0 && myCount === 0) {
      if (oppCount === 3) score -= 1150;
      else if (oppCount === 2) score -= 85;
      else score -= 6;
    }
  }

  // 中央配置ボーナス
  for (let r = 2; r <= 4; r++) {
    for (let c = 2; c <= 4; c++) {
      const val = state.grid[r][c];
      if (val) {
        const weight = (r === 3 && c === 3) ? 14 : 7;
        if (val === perspectivePlayer) score += weight;
        else score -= weight;
      }
    }
  }

  // MP差分ボーナス
  const myMP = perspectivePlayer === 'red' ? state.redMP : state.yellowMP;
  const oppMP = perspectivePlayer === 'red' ? state.yellowMP : state.redMP;
  score += (myMP - oppMP) * 20;

  return score;
}

/* -------------------------------------------------------------
   アルファベータ枝刈り探索 (Negamax)
------------------------------------------------------------- */
let nodesEvaluated = 0;

function negamax(state, depth, alpha, beta, perspectivePlayer) {
  nodesEvaluated++;

  // 1. 勝敗終端判定
  const winner = checkWinner(state.grid);
  if (winner !== null) {
    if (winner === 'both') return 0;
    // 浅い手数での勝利ほど高得点（早期勝利を好む）
    return (winner === state.currentPlayer ? 100000 : -100000) * (depth + 1);
  }

  // 2. 深さ上限到達
  if (depth <= 0) {
    const evalScore = evaluateState(state, state.currentPlayer);
    return evalScore;
  }

  // 3. 置換表 (Transposition Table) チェック
  const stateHash = computeStateHash(state);
  const cached = transpositionTable.get(stateHash);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'EXACT') return cached.score;
    if (cached.flag === 'LOWER' && cached.score > alpha) alpha = cached.score;
    if (cached.flag === 'UPPER' && cached.score < beta) beta = cached.score;
    if (alpha >= beta) return cached.score;
  }

  // 4. 合法手の生成
  const moves = generateLegalMoves(state);
  if (moves.length === 0) return 0; // 引き分け

  let maxScore = -Infinity;
  let bestMove = null;

  for (const move of moves) {
    const nextState = applyMove(state, move);
    // 相手番の視点になるため符号反転
    const score = -negamax(nextState, depth - 1, -beta, -alpha, perspectivePlayer);

    if (score > maxScore) {
      maxScore = score;
      bestMove = move;
    }
    if (score > alpha) {
      alpha = score;
    }
    if (alpha >= beta) {
      break; // ベータ枝刈り
    }
  }

  // 置換表に結果を保存
  let flag = 'EXACT';
  if (maxScore <= alpha) flag = 'UPPER';
  else if (maxScore >= beta) flag = 'LOWER';

  transpositionTable.set(stateHash, {
    depth,
    score: maxScore,
    flag,
    bestMove
  });

  return maxScore;
}

/* -------------------------------------------------------------
   反復深化探索 (Iterative Deepening Search)
------------------------------------------------------------- */
function findBestMove(state, maxDepth = 4, maxTimeMs = 3000) {
  const startTime = Date.now();
  nodesEvaluated = 0;
  let bestMoveOverall = null;
  let bestScoreOverall = -Infinity;

  const legalMoves = generateLegalMoves(state);
  if (legalMoves.length === 0) return null;
  if (legalMoves.length === 1) return legalMoves[0];

  console.log(`\n=== 最強AI探索開始 (手番: ${state.currentPlayer}, 現在重力: ${GRAVITY_CYCLE[state.gravityIndex].name}) ===`);

  for (let depth = 1; depth <= maxDepth; depth++) {
    let currentBestMove = null;
    let currentBestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of legalMoves) {
      const nextState = applyMove(state, move);
      const score = -negamax(nextState, depth - 1, -beta, -alpha, state.currentPlayer);

      if (score > currentBestScore) {
        currentBestScore = score;
        currentBestMove = move;
      }
      if (score > alpha) {
        alpha = score;
      }

      // 時間超過チェック
      if (Date.now() - startTime > maxTimeMs) {
        console.log(`[制限時間到達] 深さ ${depth} の途中で探索を打ち切りました`);
        break;
      }
    }

    bestMoveOverall = currentBestMove;
    bestScoreOverall = currentBestScore;

    const elapsed = Date.now() - startTime;
    console.log(`深さ ${depth}: 最善手評価値 = ${bestScoreOverall}, 評価ノード数 = ${nodesEvaluated}, 所要時間 = ${elapsed}ms`);

    // 必勝ルートが見つかった場合は即座に決定
    if (bestScoreOverall > 80000) {
      console.log(`★ 必勝の勝ち筋を完全検出しました！`);
      break;
    }

    if (elapsed > maxTimeMs) break;
  }

  return { move: bestMoveOverall, score: bestScoreOverall, nodes: nodesEvaluated };
}

/* -------------------------------------------------------------
   指し手の文字列表現
------------------------------------------------------------- */
function formatMove(move) {
  if (!move) return 'なし';
  if (move.type === 'drop') {
    return `石を落とす [第 ${move.laneIdx + 1} レーン]`;
  }
  if (move.type === 'skill_reverse') {
    return `【スキル】周期反転 (2 MP)`;
  }
  if (move.type === 'skill_forward') {
    return `【スキル】重力前進 (4 MP)`;
  }
  if (move.type === 'skill_shift') {
    return `【スキル】即時転換 (8 MP) -> [${GRAVITY_CYCLE[move.targetDir].name}方向]`;
  }
  return JSON.stringify(move);
}

/* -------------------------------------------------------------
   デモ実行 (初手局面からの探索)
------------------------------------------------------------- */
if (require.main === module) {
  const initial = createInitialState();
  const result = findBestMove(initial, 5, 2000);
  console.log(`\n【AIの結論】`);
  console.log(`選ばれた最適手: ${formatMove(result.move)}`);
  console.log(`局面評価値: ${result.score}`);
  console.log(`総探索ノード数: ${result.nodes}`);
}

module.exports = {
  createInitialState,
  applyMove,
  findBestMove,
  evaluateState,
  formatMove
};
