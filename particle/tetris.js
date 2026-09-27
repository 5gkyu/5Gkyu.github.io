/**
 * tetris.js - Neon Tetris (完全整合性保証版)
 * 
 * すべてのシナリオはスクリプトで数学的に検証済み:
 * - テトリミノ形状の正確性（全回転パターンとの照合）
 * - セル重複の完全排除
 * - 接地チェーン（床 or 既存ブロック）の保証
 * - ライン消去条件（行の全10マス充填）の厳密検証
 *
 * シナリオ1: TSD（T-Spin Double）- 6手
 *   I, S, Z, J, L で盤面構築 → T回転入れで行14,15同時消去
 * シナリオ2: パフェクリア - 10手
 *   J, L, L, J, O, O, S, Z, I, I で4行同時全消し
 */

'use strict';

(function (root) {

  const COLS = 10;
  const ROWS = 16;
  const CELL_SIZE = 14.0;
  const FIELD_W = COLS * CELL_SIZE; // 140
  const FIELD_H = ROWS * CELL_SIZE; // 224

  const ORIGIN_X = -FIELD_W * 0.5 - 25;
  const ORIGIN_Y = -FIELD_H * 0.5;

  const TETROMINO_DEFS = {
    I: { color: [0, 240, 255], edge: [220, 255, 255] },
    O: { color: [255, 235, 30], edge: [255, 255, 210] },
    T: { color: [195, 60, 255], edge: [250, 210, 255] },
    S: { color: [40, 235, 90], edge: [210, 255, 230] },
    Z: { color: [255, 50, 75], edge: [255, 210, 220] },
    J: { color: [35, 110, 255], edge: [210, 230, 255] },
    L: { color: [255, 140, 25], edge: [255, 230, 200] }
  };

  // 1セルあたり 4x4 = 16点サンプリング
  const CELL_PTS_OFFSETS = [];
  for (let iy = 0; iy < 4; iy++) {
    for (let ix = 0; ix < 4; ix++) {
      const isBorder = (ix === 0 || ix === 3 || iy === 0 || iy === 3);
      CELL_PTS_OFFSETS.push({
        dx: 1.5 + (ix / 3) * 11.0,
        dy: 1.5 + (iy / 3) * 11.0,
        isBorder: isBorder
      });
    }
  }

  // ==========================================
  // 静的枠線＆HUD（不変点群：約560点）
  // ==========================================
  function generateStaticHUD() {
    const pts = [];
    const RGB_BORDER = [45, 110, 230];
    const RGB_OUTER = [20, 50, 120];
    const RGB_HEADER = [90, 200, 255];

    // マトリックス外枠（2重ネオンフレーム）
    for (let x = -4; x <= FIELD_W + 4; x += 2.5) {
      pts.push({ bx: ORIGIN_X + x, by: ORIGIN_Y - 4, rgb: RGB_OUTER, size: 1.5 });
      pts.push({ bx: ORIGIN_X + x, by: ORIGIN_Y, rgb: RGB_BORDER, size: 2.2 });
      pts.push({ bx: ORIGIN_X + x, by: ORIGIN_Y + FIELD_H, rgb: RGB_BORDER, size: 2.3 });
      pts.push({ bx: ORIGIN_X + x, by: ORIGIN_Y + FIELD_H + 4, rgb: RGB_OUTER, size: 1.5 });
    }
    for (let y = -4; y <= FIELD_H + 4; y += 2.5) {
      pts.push({ bx: ORIGIN_X - 4, by: ORIGIN_Y + y, rgb: RGB_OUTER, size: 1.5 });
      pts.push({ bx: ORIGIN_X, by: ORIGIN_Y + y, rgb: RGB_BORDER, size: 2.2 });
      pts.push({ bx: ORIGIN_X + FIELD_W, by: ORIGIN_Y + y, rgb: RGB_BORDER, size: 2.2 });
      pts.push({ bx: ORIGIN_X + FIELD_W + 4, by: ORIGIN_Y + y, rgb: RGB_OUTER, size: 1.5 });
    }

    // NEXT枠（右上）
    const NEXT_X = ORIGIN_X + FIELD_W + 18;
    const NEXT_Y = ORIGIN_Y + 12;
    const NEXT_W = 64;
    const NEXT_H = 58;

    for (let x = 0; x <= NEXT_W; x += 2.5) {
      pts.push({ bx: NEXT_X + x, by: NEXT_Y, rgb: RGB_HEADER, size: 1.9 });
      pts.push({ bx: NEXT_X + x, by: NEXT_Y + NEXT_H, rgb: RGB_HEADER, size: 1.9 });
    }
    for (let y = 0; y <= NEXT_H; y += 2.5) {
      pts.push({ bx: NEXT_X, by: NEXT_Y + y, rgb: RGB_HEADER, size: 1.9 });
      pts.push({ bx: NEXT_X + NEXT_W, by: NEXT_Y + y, rgb: RGB_HEADER, size: 1.9 });
    }

    // 「NEXT」文字ドット（5x7 ビットマップフォント）
    const FONT_5x7_NEXT = {
      'N': ['#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'],
      'E': ['#####', '#    ', '#### ', '#    ', '#    ', '#    ', '#####'],
      'X': ['#   #', '#   #', ' # # ', '  #  ', ' # # ', '#   #', '#   #'],
      'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ']
    };

    const nextStr = 'NEXT';
    const charScale = 1.35;
    const charW = 5 * charScale;
    const charSpacing = 2.4;
    const totalW = nextStr.length * charW + (nextStr.length - 1) * charSpacing;
    const startX = NEXT_X + (NEXT_W - totalW) * 0.5;
    const startY = NEXT_Y - 13.5;

    for (let c = 0; c < nextStr.length; c++) {
      const ch = nextStr[c];
      const pattern = FONT_5x7_NEXT[ch];
      if (!pattern) continue;
      const ox = startX + c * (charW + charSpacing);
      for (let r = 0; r < 7; r++) {
        const row = pattern[r];
        for (let col = 0; col < 5; col++) {
          if (row[col] === '#') {
            pts.push({
              bx: ox + col * charScale,
              by: startY + r * charScale,
              rgb: [180, 240, 255],
              size: 1.6
            });
          }
        }
      }
    }

    return pts;
  }

  const staticHUD = generateStaticHUD();

  // NEXTプレビュー用テトリミノ形状
  const NEXT_SHAPES = {
    I: [[0, 1.5], [1, 1.5], [2, 1.5], [3, 1.5]],
    O: [[0.5, 0.5], [1.5, 0.5], [0.5, 1.5], [1.5, 1.5]],
    T: [[1, 0.5], [0, 1.5], [1, 1.5], [2, 1.5]],
    S: [[1, 0.5], [2, 0.5], [0, 1.5], [1, 1.5]],
    Z: [[0, 0.5], [1, 0.5], [1, 1.5], [2, 1.5]],
    J: [[0, 0.5], [0, 1.5], [1, 1.5], [2, 1.5]],
    L: [[2, 0.5], [0, 1.5], [1, 1.5], [2, 1.5]]
  };

  // =========================================================================
  // シナリオ定義（数学的に検証済み）
  // =========================================================================

  // -------------------------------------------------------------------------
  // シナリオ1: TSD (T-Spin Double) - 6手で盤面構築 → 2行同時消去
  //
  // 検証済み盤面（T配置直前）:
  //   行12: [........L.]
  //   行13: [.Z...J..L.]
  //   行14: [ZZSS.JJJLL]  ← 全10マス埋まり → 消去!
  //   行15: [ZSSTTTIIII]  ← 全10マス埋まり → 消去!
  //
  // 消去後: 行12-13のブロックが落下 → フラッシュ全消しで演出
  // -------------------------------------------------------------------------
  const SCENARIO_TSPIN = {
    id: 'tspin',
    name: 'T-SPIN DOUBLE',
    moves: [
      // 手0: I水平 → 行15 col6-9（床に接地）
      { type: 'I', targetC: 7.5, targetR: 15.0, startC: 4, startR: -2, startRot: 0,
        fallDur: 0.25, lockDur: 0.10, pauseDur: 0.12, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[6,15],[7,15],[8,15],[9,15]], vanishMove: 5, clears: [] },
      // 手1: S → 行14 col2-3 + 行15 col1-2（col1,2行15が床に接地）
      { type: 'S', targetC: 2.0, targetR: 14.5, startC: 4, startR: -2, startRot: 0,
        fallDur: 0.22, lockDur: 0.10, pauseDur: 0.12, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[2,14],[3,14],[1,15],[2,15]], vanishMove: 5, clears: [] },
      // 手2: Z回転90 → 行13 col1 + 行14 col0-1 + 行15 col0（col0行15が床に接地）
      { type: 'Z', targetC: 0.5, targetR: 14.0, startC: 4, startR: -2, startRot: Math.PI * 0.5,
        fallDur: 0.22, lockDur: 0.10, pauseDur: 0.12, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[1,13],[0,14],[1,14],[0,15]], vanishMove: 5, clears: [] },
      // 手3: J → 行13 col5(屋根) + 行14 col5-7（col6,7行15がI上に接地）
      { type: 'J', targetC: 6.0, targetR: 13.5, startC: 4, startR: -2, startRot: 0,
        fallDur: 0.22, lockDur: 0.10, pauseDur: 0.12, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[5,13],[5,14],[6,14],[7,14]], vanishMove: 5, clears: [] },
      // 手4: L縦 → 行12-14 col8 + 行14 col9（col8-9行15がI上に接地）
      { type: 'L', targetC: 8.5, targetR: 13.0, startC: 4, startR: -2, startRot: -Math.PI * 0.5,
        fallDur: 0.22, lockDur: 0.10, pauseDur: 0.15, flashDur: 0, dropDur: 0, restDur: 0.06,
        cells: [[8,12],[8,13],[8,14],[9,14]], vanishMove: 5, clears: [] },
      // 手5: T (★T-SPIN DOUBLE!) → 列4-5上空から回転入れ → 行14 col4 + 行15 col3-5
      // → 行14,行15の全10マスが100%埋まり → TSD発火! → 2行同時消去!
      // → 消去後の残存ブロック(行12-13)もフラッシュで全消し演出
      { type: 'T', targetC: 4.0, targetR: 14.5, startC: 4, startR: -2, startRot: Math.PI,
        isTSpin: true, fallDur: 0.34, lockDur: 0.14, pauseDur: 0.20,
        flashDur: 0.70, dropDur: 0, restDur: 1.60,
        cells: [[4,14],[3,15],[4,15],[5,15]], vanishMove: 5, clears: [14, 15] }
    ]
  };

  // -------------------------------------------------------------------------
  // シナリオ2: パフェクリア (Perfect Clear) - 10手で4行全消し
  //
  // 検証済み盤面（I2配置直後）:
  //   行12: [6888879999]  ← 全10マス → 消去!
  //   行13: [6644772553]  ← 全10マス → 消去!
  //   行14: [0644712553]  ← 全10マス → 消去!
  //   行15: [0001112233]  ← 全10マス → 消去!
  // -------------------------------------------------------------------------
  const SCENARIO_PC = {
    id: 'pc',
    name: 'PERFECT CLEAR',
    moves: [
      // 手0: J1 → 行14 col0 + 行15 col0-2（床に接地）
      { type: 'J', targetC: 1.0, targetR: 14.5, startC: 4, startR: -2, startRot: Math.PI * 0.5,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[0,14],[0,15],[1,15],[2,15]], vanishMove: 9, clears: [] },
      // 手1: L1 → 行14 col5 + 行15 col3-5（床に接地）
      { type: 'L', targetC: 4.0, targetR: 14.5, startC: 4, startR: -2, startRot: -Math.PI * 0.5,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[5,14],[3,15],[4,15],[5,15]], vanishMove: 9, clears: [] },
      // 手2: L2 → 行13-15 col6 + 行15 col7（col6行15が床に接地）
      { type: 'L', targetC: 6.5, targetR: 14.0, startC: 4, startR: -2, startRot: 0,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[6,13],[6,14],[6,15],[7,15]], vanishMove: 9, clears: [] },
      // 手3: J2 → 行13-14 col9 + 行15 col8-9（col8,9行15が床に接地）
      { type: 'J', targetC: 8.5, targetR: 14.0, startC: 4, startR: -2, startRot: 0,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[9,13],[9,14],[8,15],[9,15]], vanishMove: 9, clears: [] },
      // 手4: O1 → 行13-14 col2-3（J1,L1上に接地）
      { type: 'O', targetC: 2.5, targetR: 13.5, startC: 4, startR: -2, startRot: 0,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[2,13],[3,13],[2,14],[3,14]], vanishMove: 9, clears: [] },
      // 手5: O2 → 行13-14 col7-8（L2,J2上に接地）
      { type: 'O', targetC: 7.5, targetR: 13.5, startC: 4, startR: -2, startRot: 0,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[7,13],[8,13],[7,14],[8,14]], vanishMove: 9, clears: [] },
      // 手6: S → 行12-13 col0 + 行13-14 col1（J1,O1上に接地）
      { type: 'S', targetC: 0.5, targetR: 13.0, startC: 4, startR: -2, startRot: -Math.PI * 0.5,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[0,12],[0,13],[1,13],[1,14]], vanishMove: 9, clears: [] },
      // 手7: Z → 行12-13 col5 + 行13-14 col4（L1,O1上に接地）
      { type: 'Z', targetC: 4.5, targetR: 13.0, startC: 4, startR: -2, startRot: Math.PI * 0.5,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[5,12],[4,13],[5,13],[4,14]], vanishMove: 9, clears: [] },
      // 手8: I1水平 → 行12 col1-4（S,O1,Z上に接地）
      { type: 'I', targetC: 2.5, targetR: 12.0, startC: 4, startR: -2, startRot: Math.PI * 0.5,
        fallDur: 0.20, lockDur: 0.08, pauseDur: 0.10, flashDur: 0, dropDur: 0, restDur: 0.04,
        cells: [[1,12],[2,12],[3,12],[4,12]], vanishMove: 9, clears: [] },
      // 手9: I2水平 → 行12 col6-9（L2,O2,J2上に接地）
      // → 4行40マスが完全充填 → PERFECT CLEAR! 全消し!
      { type: 'I', targetC: 7.5, targetR: 12.0, startC: 4, startR: -2, startRot: Math.PI * 0.5,
        isPC: true, fallDur: 0.22, lockDur: 0.12, pauseDur: 0.25,
        flashDur: 0.90, dropDur: 0, restDur: 1.80,
        cells: [[6,12],[7,12],[8,12],[9,12]], vanishMove: 9, clears: [12, 13, 14, 15] }
    ]
  };

  const ALL_SCENARIOS = [
    SCENARIO_TSPIN,
    SCENARIO_PC
  ];

  // =========================================================================
  // データの自動正規化
  // =========================================================================
  ALL_SCENARIOS.forEach(sc => {
    const sprites = [];
    sc.moves.forEach((m, mIdx) => {
      m.totalDuration = m.fallDur + m.lockDur + m.pauseDur + m.flashDur + m.dropDur + m.restDur;

      // 各セルの相対座標を計算
      m.cells.forEach(cell => {
        sprites.push({
          moveIdx: mIdx,
          relX: cell[0] - m.targetC,
          relY: cell[1] - m.targetR,
          c: cell[0],
          landingR: cell[1],
          vanishMove: m.vanishMove !== undefined ? m.vanishMove : -1
        });
      });
    });

    sc.sprites = sprites;
    sc.totalDuration = sc.moves.reduce((sum, m) => sum + m.totalDuration, 0);

    sc.startTimes = [];
    let acc = 0;
    for (let m = 0; m < sc.moves.length; m++) {
      sc.startTimes.push(acc);
      acc += sc.moves[m].totalDuration;
    }
  });

  const GRAND_CYCLE_DURATION = ALL_SCENARIOS.reduce((sum, sc) => sum + sc.totalDuration, 0);

  // ==========================================
  // 毎フレーム粒子生成関数 generateTetrisTemplate
  // ==========================================
  function generateTetrisTemplate(time = 0) {
    const points = [];

    // 1. 静的枠線＆HUD（不変スロット 約560点）
    for (let i = 0; i < staticHUD.length; i++) {
      points.push(staticHUD[i]);
    }

    // 現在のシナリオの決定
    const grandTime = (time % GRAND_CYCLE_DURATION);
    let curSc = ALL_SCENARIOS[0];
    let scLocalTime = grandTime;
    let accTime = 0;

    for (let s = 0; s < ALL_SCENARIOS.length; s++) {
      const sc = ALL_SCENARIOS[s];
      if (grandTime >= accTime && grandTime < accTime + sc.totalDuration) {
        curSc = sc;
        scLocalTime = grandTime - accTime;
        break;
      }
      accTime += sc.totalDuration;
    }

    // シナリオ内での現在の手インデックス
    let curMoveIdx = 0;
    for (let m = curSc.moves.length - 1; m >= 0; m--) {
      if (scLocalTime >= curSc.startTimes[m]) {
        curMoveIdx = m;
        break;
      }
    }

    const curMove = curSc.moves[curMoveIdx];
    const isTSpinClear = curMove.isTSpin && curMove.clears && curMove.clears.length > 0;
    const isPCClear = curMove.isPC;

    // 2. ブロック実体の計算（最大40ブロック × 16点 = 640点）
    const MAX_SPRITES = 40;
    for (let bIdx = 0; bIdx < MAX_SPRITES; bIdx++) {
      if (bIdx >= curSc.sprites.length) {
        // 未使用スロットは待機ダスト粒子
        points.push(...generateDummyBlockPoints(bIdx));
        continue;
      }

      const blk = curSc.sprites[bIdx];
      const moveConfig = curSc.moves[blk.moveIdx];
      const tetro = TETROMINO_DEFS[moveConfig.type];

      const spawnTime = curSc.startTimes[blk.moveIdx];
      const vanishMoveIdx = blk.vanishMove;
      const vanishConfig = vanishMoveIdx >= 0 && vanishMoveIdx < curSc.moves.length ? curSc.moves[vanishMoveIdx] : null;
      const vanishTime = vanishConfig ? curSc.startTimes[vanishMoveIdx] : 999999;
      const vanishFlashStartTime = vanishConfig ? (vanishTime + vanishConfig.fallDur + vanishConfig.lockDur + vanishConfig.pauseDur) : 999999;
      const vanishEndTime = vanishConfig ? (vanishFlashStartTime + vanishConfig.flashDur) : 999999;

      let isVisible = false;
      let curCol = blk.c;
      let curRow = blk.landingR;
      let isLockGlow = false;
      let isFlashing = false;
      let flashProgress = 0;

      if (scLocalTime < spawnTime) {
        // 未スポーン
        isVisible = false;
        curCol = moveConfig.startC;
        curRow = -2.0;
      } else if (scLocalTime < spawnTime + moveConfig.fallDur) {
        // ★高速落下＆回転アニメーション
        isVisible = true;
        const fallFrac = (scLocalTime - spawnTime) / moveConfig.fallDur;

        if (moveConfig.isTSpin) {
          // --- Tスピン特殊軌道（急降下 → 回転して穴にハマる！）---
          if (fallFrac < 0.60) {
            // フェーズ1: 直線降下（col4のルートを通る）
            const subFrac = fallFrac / 0.60;
            const easeY = subFrac * subFrac;
            const centerC = moveConfig.startC;
            const centerR = moveConfig.startR + (12.5 - moveConfig.startR) * easeY;
            const curRot = moveConfig.startRot;
            curCol = centerC + (blk.relX * Math.cos(curRot) - blk.relY * Math.sin(curRot));
            curRow = centerR + (blk.relX * Math.sin(curRot) + blk.relY * Math.cos(curRot));
          } else {
            // フェーズ2: 回転して穴に滑り込む！
            const twistFrac = (fallFrac - 0.60) / 0.40;
            const easeTwist = Math.sin(twistFrac * Math.PI * 0.5);
            const centerC = moveConfig.startC + (moveConfig.targetC - moveConfig.startC) * easeTwist;
            const centerR = 12.5 + (moveConfig.targetR - 12.5) * easeTwist;
            const curRot = moveConfig.startRot * (1.0 - easeTwist);
            curCol = centerC + (blk.relX * Math.cos(curRot) - blk.relY * Math.sin(curRot));
            curRow = centerR + (blk.relX * Math.sin(curRot) + blk.relY * Math.cos(curRot));
          }
        } else {
          // --- 通常の高速ハードドロップ＆滑らかな回転 ---
          const easeDrop = Math.pow(fallFrac, 2.0);
          const rotFrac = Math.sin(fallFrac * Math.PI * 0.5);
          const curRot = moveConfig.startRot * (1.0 - rotFrac);
          const centerC = moveConfig.startC + (moveConfig.targetC - moveConfig.startC) * fallFrac;
          const centerR = moveConfig.startR + (moveConfig.targetR - moveConfig.startR) * easeDrop;

          curCol = centerC + (blk.relX * Math.cos(curRot) - blk.relY * Math.sin(curRot));
          curRow = centerR + (blk.relX * Math.sin(curRot) + blk.relY * Math.cos(curRot));
        }
      } else if (scLocalTime < spawnTime + moveConfig.fallDur + moveConfig.lockDur) {
        // 着地ロック閃光
        isVisible = true;
        curCol = blk.c;
        curRow = blk.landingR;
        isLockGlow = true;
      } else if (scLocalTime < vanishFlashStartTime) {
        // 着地後〜消去フラッシュ前（盤面上で静止）
        isVisible = true;
        curCol = blk.c;
        curRow = blk.landingR;
      } else if (scLocalTime < vanishEndTime) {
        // ★消去フラッシュ中（四方閃光拡散）
        isVisible = true;
        isFlashing = true;
        flashProgress = (scLocalTime - vanishFlashStartTime) / vanishConfig.flashDur;
        curCol = blk.c;
        curRow = blk.landingR;
      } else {
        // 消去完了（非表示）
        isVisible = false;
        curCol = blk.c;
        curRow = -2.0;
      }

      const px = ORIGIN_X + curCol * CELL_SIZE;
      const py = ORIGIN_Y + curRow * CELL_SIZE;

      for (let k = 0; k < CELL_PTS_OFFSETS.length; k++) {
        const off = CELL_PTS_OFFSETS[k];
        if (isVisible) {
          if (isFlashing) {
            // 消去時の爆発拡散
            const spreadMult = isPCClear ? 100 : (isTSpinClear ? 80 : 60);
            const spread = (curCol < 5 ? -1 : 1) * flashProgress * spreadMult;
            const flashRgb = flashProgress < 0.20 ? [255, 255, 255] : tetro.color;
            points.push({
              bx: px + off.dx + spread,
              by: py + off.dy + (Math.sin(k + flashProgress * 10) * 8 * flashProgress),
              rgb: flashRgb,
              size: Math.max(0.5, 2.5 * (1.0 - flashProgress))
            });
          } else {
            const rgb = isLockGlow
              ? [255, 255, 255]
              : (off.isBorder ? tetro.edge : tetro.color);
            points.push({
              bx: px + off.dx,
              by: py + off.dy,
              rgb: rgb,
              size: isLockGlow ? 2.8 : (off.isBorder ? 2.3 : 1.9)
            });
          }
        } else {
          // 非表示ブロックの待機ダスト
          points.push({
            bx: px + off.dx,
            by: py + off.dy,
            rgb: [12, 20, 45],
            size: 0.6
          });
        }
      }
    }

    // 3. マトリックス全160セルの背景グリッド点群（160 × 9点 = 1,440点）
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cellX = ORIGIN_X + c * CELL_SIZE;
        const cellY = ORIGIN_Y + r * CELL_SIZE;
        for (let iy = 0; iy < 3; iy++) {
          for (let ix = 0; ix < 3; ix++) {
            points.push({
              bx: cellX + 2.0 + ix * 5.0,
              by: cellY + 2.0 + iy * 5.0,
              rgb: (ix === 1 && iy === 1) ? [24, 42, 80] : [10, 18, 38],
              size: (ix === 1 && iy === 1) ? 1.0 : 0.6
            });
          }
        }
      }
    }

    // 4. NEXT枠内のプレビューミノ（4マス × 16点 = 64点）
    const nextMoveIdx = (curMoveIdx + 1) % curSc.moves.length;
    const nextMoveConfig = curSc.moves[nextMoveIdx];
    const nextTetro = TETROMINO_DEFS[nextMoveConfig.type];
    const nextShape = NEXT_SHAPES[nextMoveConfig.type] || [[0, 0]];
    const NEXT_ORIGIN_X = ORIGIN_X + FIELD_W + 30;
    const NEXT_ORIGIN_Y = ORIGIN_Y + 24;

    const floatY = Math.sin(time * 3.5) * 1.5;

    nextShape.forEach(blk => {
      const nbx = NEXT_ORIGIN_X + blk[0] * 12;
      const nby = NEXT_ORIGIN_Y + blk[1] * 12 + floatY;
      for (let k = 0; k < CELL_PTS_OFFSETS.length; k++) {
        const off = CELL_PTS_OFFSETS[k];
        const rgb = off.isBorder ? nextTetro.edge : nextTetro.color;
        points.push({
          bx: nbx + (off.dx * 0.8),
          by: nby + (off.dy * 0.8),
          rgb: rgb,
          size: off.isBorder ? 2.1 : 1.7
        });
      }
    });

    // 5. 消去爆発粒子（完全固定 60点）
    const numSparks = 60;
    const vanishStart = curSc.startTimes[curMoveIdx] + curMove.fallDur + curMove.lockDur + curMove.pauseDur;
    const isSparksActive = (curMove.flashDur > 0) && (scLocalTime >= vanishStart && scLocalTime < vanishStart + curMove.flashDur);
    const sparkFrac = isSparksActive ? (scLocalTime - vanishStart) / curMove.flashDur : 0;

    for (let s = 0; s < numSparks; s++) {
      if (isSparksActive) {
        const sAngle = (s / numSparks) * Math.PI * 2 + s * 1.8;
        const speedBase = isPCClear ? 65 : (isTSpinClear ? 45 : 30);
        const sSpeed = speedBase + (s % 8) * 18;
        const sx = ORIGIN_X + (FIELD_W * 0.5) + Math.cos(sAngle) * (sSpeed * sparkFrac);
        const targetRow = 14.5;
        const sy = ORIGIN_Y + (targetRow * CELL_SIZE) + Math.sin(sAngle) * (sSpeed * sparkFrac);

        let sColor = [0, 240, 255];
        if (isTSpinClear) {
          sColor = (s % 2 === 0) ? [240, 80, 255] : [255, 120, 200];
        } else if (isPCClear) {
          sColor = (s % 2 === 0) ? [255, 255, 255] : [255, 215, 70];
        }

        points.push({
          bx: sx,
          by: sy,
          rgb: sparkFrac < 0.15 ? [255, 255, 255] : sColor,
          size: Math.max(0.6, 3.2 * (1.0 - sparkFrac))
        });
      } else {
        points.push({
          bx: ORIGIN_X + (s / numSparks) * FIELD_W,
          by: ORIGIN_Y + FIELD_H + 12,
          rgb: [25, 45, 90],
          size: 1.1
        });
      }
    }

    return points;
  }

  // 未使用スロット用ダミー粒子生成（16点）
  function generateDummyBlockPoints(bIdx) {
    const pts = [];
    const dummyX = ORIGIN_X + (bIdx % 10) * CELL_SIZE;
    const dummyY = ORIGIN_Y - 2.0 * CELL_SIZE;
    for (let k = 0; k < CELL_PTS_OFFSETS.length; k++) {
      pts.push({
        bx: dummyX + CELL_PTS_OFFSETS[k].dx,
        by: dummyY + CELL_PTS_OFFSETS[k].dy,
        rgb: [10, 16, 35],
        size: 0.5
      });
    }
    return pts;
  }

  function buildStaticTetris() {
    return generateTetrisTemplate(0);
  }

  // グローバル公開
  if (typeof window !== 'undefined') {
    window.buildTetrisParticles = buildStaticTetris;
    window.generateTetrisTemplate = generateTetrisTemplate;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildStaticTetris: buildStaticTetris,
      generateTetrisTemplate: generateTetrisTemplate
    };
  }

})(typeof window !== 'undefined' ? window : global);
