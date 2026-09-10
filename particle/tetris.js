/**
 * tetris.js - Neon Tetris (軽量化・高速最適化版)
 * 1. 粒子数を約9,500点から約2,800点へと大幅スリム化（CPU/GPU負荷を70%以上削減）
 * 2. 1マスあたり4x4(16点)の美しく鮮明なサンプリング
 * 3. 2重ネオン外枠と最適化されたHUDで軽快な60fps動作を実現
 */

'use strict';

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
    T: { color: [185, 60, 255], edge: [245, 210, 255] },
    S: { color: [40, 235, 90], edge: [210, 255, 230] },
    Z: { color: [255, 50, 75], edge: [255, 210, 220] },
    J: { color: [35, 110, 255], edge: [210, 230, 255] },
    L: { color: [255, 140, 25], edge: [255, 230, 200] }
  };

  const MOVE_CONFIGS = [
    // 手0: J (列0, rot2)
    { type: 'J', col: 0, baseLandingR: 14, fallDur: 0.45, lockDur: 0.20, pauseDur: 0.60, flashDur: 0.0, dropDur: 0.0, restDur: 0.0 },
    // 手1: I (列3, rot1)
    { type: 'I', col: 3, baseLandingR: 12, fallDur: 0.45, lockDur: 0.20, pauseDur: 0.60, flashDur: 0.0, dropDur: 0.0, restDur: 0.0 },
    // 手2: T (列4, rot2)
    { type: 'T', col: 4, baseLandingR: 14, fallDur: 0.45, lockDur: 0.20, pauseDur: 0.60, flashDur: 0.0, dropDur: 0.0, restDur: 0.0 },
    // 手3: S (列6, rot0)
    { type: 'S', col: 6, baseLandingR: 14, fallDur: 0.45, lockDur: 0.20, pauseDur: 0.60, flashDur: 0.0, dropDur: 0.0, restDur: 0.0 },
    // 手4: Z (列8, rot1) -> ★1段消去
    { type: 'Z', col: 8, baseLandingR: 13, fallDur: 0.45, lockDur: 0.20, pauseDur: 1.50, flashDur: 0.45, dropDur: 0.35, restDur: 0.60 },
    // 手5: O (列0, rot0)
    { type: 'O', col: 0, baseLandingR: 14, fallDur: 0.45, lockDur: 0.20, pauseDur: 0.60, flashDur: 0.0, dropDur: 0.0, restDur: 0.0 },
    // 手6: L (列0, rot0)
    { type: 'L', col: 0, baseLandingR: 13, fallDur: 0.45, lockDur: 0.20, pauseDur: 0.60, flashDur: 0.0, dropDur: 0.0, restDur: 0.0 },
    // 手7: T (列4, rot1) -> ★1段消去
    { type: 'T', col: 4, baseLandingR: 13, fallDur: 0.45, lockDur: 0.20, pauseDur: 1.50, flashDur: 0.45, dropDur: 0.35, restDur: 0.60 },
    // 手8: S (列5, rot0)
    { type: 'S', col: 5, baseLandingR: 14, fallDur: 0.45, lockDur: 0.20, pauseDur: 0.60, flashDur: 0.0, dropDur: 0.0, restDur: 0.0 },
    // 手9: L (列7, rot0) -> ★ダブル消去＆パーフェクトクリア
    { type: 'L', col: 7, baseLandingR: 14, fallDur: 0.45, lockDur: 0.20, pauseDur: 1.80, flashDur: 0.65, dropDur: 0.0, restDur: 2.00 }
  ];

  const MOVES = MOVE_CONFIGS.map(m => {
    const totalDuration = m.fallDur + m.lockDur + m.pauseDur + m.flashDur + m.dropDur + m.restDur;
    return { ...m, totalDuration };
  });

  const TOTAL_CYCLE_DURATION = MOVES.reduce((sum, m) => sum + m.totalDuration, 0);

  const MOVE_START_TIMES = [];
  let accumTime = 0;
  for (let m = 0; m < MOVES.length; m++) {
    MOVE_START_TIMES.push(accumTime);
    accumTime += MOVES[m].totalDuration;
  }

  // 全40個のブロック実体
  const BLOCK_SPRITES = [
    // --- 1手目: Jミノ ---
    { id: 0, type: 'J', moveIdx: 0, relC: 0, relR: 1, c: 0, landingR: 15, vanishMove: 4, shifts: [] },
    { id: 1, type: 'J', moveIdx: 0, relC: 1, relR: 1, c: 1, landingR: 15, vanishMove: 4, shifts: [] },
    { id: 2, type: 'J', moveIdx: 0, relC: 2, relR: 1, c: 2, landingR: 15, vanishMove: 4, shifts: [] },
    { id: 3, type: 'J', moveIdx: 0, relC: 2, relR: 0, c: 2, landingR: 14, vanishMove: 7, shifts: [{ moveIdx: 4, fromR: 14, toR: 15 }] },

    // --- 2手目: Iミノ ---
    { id: 4, type: 'I', moveIdx: 1, relC: 0, relR: 0, c: 3, landingR: 12, vanishMove: 9, shifts: [{ moveIdx: 4, fromR: 12, toR: 13 }, { moveIdx: 7, fromR: 13, toR: 14 }] },
    { id: 5, type: 'I', moveIdx: 1, relC: 0, relR: 1, c: 3, landingR: 13, vanishMove: 9, shifts: [{ moveIdx: 4, fromR: 13, toR: 14 }, { moveIdx: 7, fromR: 14, toR: 15 }] },
    { id: 6, type: 'I', moveIdx: 1, relC: 0, relR: 2, c: 3, landingR: 14, vanishMove: 7, shifts: [{ moveIdx: 4, fromR: 14, toR: 15 }] },
    { id: 7, type: 'I', moveIdx: 1, relC: 0, relR: 3, c: 3, landingR: 15, vanishMove: 4, shifts: [] },

    // --- 3手目: Tミノ ---
    { id: 8, type: 'T', moveIdx: 2, relC: 1, relR: 0, c: 5, landingR: 14, vanishMove: 7, shifts: [{ moveIdx: 4, fromR: 14, toR: 15 }] },
    { id: 9, type: 'T', moveIdx: 2, relC: 0, relR: 1, c: 4, landingR: 15, vanishMove: 4, shifts: [] },
    { id: 10, type: 'T', moveIdx: 2, relC: 1, relR: 1, c: 5, landingR: 15, vanishMove: 4, shifts: [] },
    { id: 11, type: 'T', moveIdx: 2, relC: 2, relR: 1, c: 6, landingR: 15, vanishMove: 4, shifts: [] },

    // --- 4手目: Sミノ ---
    { id: 12, type: 'S', moveIdx: 3, relC: 0, relR: 0, c: 6, landingR: 14, vanishMove: 7, shifts: [{ moveIdx: 4, fromR: 14, toR: 15 }] },
    { id: 13, type: 'S', moveIdx: 3, relC: 1, relR: 0, c: 7, landingR: 14, vanishMove: 7, shifts: [{ moveIdx: 4, fromR: 14, toR: 15 }] },
    { id: 14, type: 'S', moveIdx: 3, relC: 1, relR: 1, c: 7, landingR: 15, vanishMove: 4, shifts: [] },
    { id: 15, type: 'S', moveIdx: 3, relC: 2, relR: 1, c: 8, landingR: 15, vanishMove: 4, shifts: [] },

    // --- 5手目: Zミノ ---
    { id: 16, type: 'Z', moveIdx: 4, relC: 0, relR: 0, c: 8, landingR: 13, vanishMove: 9, shifts: [{ moveIdx: 4, fromR: 13, toR: 14 }, { moveIdx: 7, fromR: 14, toR: 15 }] },
    { id: 17, type: 'Z', moveIdx: 4, relC: 0, relR: 1, c: 8, landingR: 14, vanishMove: 7, shifts: [{ moveIdx: 4, fromR: 14, toR: 15 }] },
    { id: 18, type: 'Z', moveIdx: 4, relC: 1, relR: 1, c: 9, landingR: 14, vanishMove: 7, shifts: [{ moveIdx: 4, fromR: 14, toR: 15 }] },
    { id: 19, type: 'Z', moveIdx: 4, relC: 1, relR: 2, c: 9, landingR: 15, vanishMove: 4, shifts: [] },

    // --- 6手目: Oミノ ---
    { id: 20, type: 'O', moveIdx: 5, relC: 0, relR: 0, c: 0, landingR: 14, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 14, toR: 15 }] },
    { id: 21, type: 'O', moveIdx: 5, relC: 1, relR: 0, c: 1, landingR: 14, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 14, toR: 15 }] },
    { id: 22, type: 'O', moveIdx: 5, relC: 0, relR: 1, c: 0, landingR: 15, vanishMove: 7, shifts: [] },
    { id: 23, type: 'O', moveIdx: 5, relC: 1, relR: 1, c: 1, landingR: 15, vanishMove: 7, shifts: [] },

    // --- 7手目: Lミノ ---
    { id: 24, type: 'L', moveIdx: 6, relC: 0, relR: 0, c: 0, landingR: 13, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 13, toR: 14 }] },
    { id: 25, type: 'L', moveIdx: 6, relC: 1, relR: 0, c: 1, landingR: 13, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 13, toR: 14 }] },
    { id: 26, type: 'L', moveIdx: 6, relC: 2, relR: 0, c: 2, landingR: 13, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 13, toR: 14 }] },
    { id: 27, type: 'L', moveIdx: 6, relC: 2, relR: 1, c: 2, landingR: 14, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 14, toR: 15 }] },

    // --- 8手目: Tミノ ---
    { id: 28, type: 'T', moveIdx: 7, relC: 0, relR: 0, c: 4, landingR: 13, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 13, toR: 14 }] },
    { id: 29, type: 'T', moveIdx: 7, relC: 0, relR: 1, c: 4, landingR: 14, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 14, toR: 15 }] },
    { id: 30, type: 'T', moveIdx: 7, relC: 1, relR: 1, c: 5, landingR: 14, vanishMove: 9, shifts: [{ moveIdx: 7, fromR: 14, toR: 15 }] },
    { id: 31, type: 'T', moveIdx: 7, relC: 0, relR: 2, c: 4, landingR: 15, vanishMove: 7, shifts: [] },

    // --- 9手目: Sミノ ---
    { id: 32, type: 'S', moveIdx: 8, relC: 0, relR: 0, c: 5, landingR: 14, vanishMove: 9, shifts: [] },
    { id: 33, type: 'S', moveIdx: 8, relC: 1, relR: 0, c: 6, landingR: 14, vanishMove: 9, shifts: [] },
    { id: 34, type: 'S', moveIdx: 8, relC: 1, relR: 1, c: 6, landingR: 15, vanishMove: 9, shifts: [] },
    { id: 35, type: 'S', moveIdx: 8, relC: 2, relR: 1, c: 7, landingR: 15, vanishMove: 9, shifts: [] },

    // --- 10手目: Lミノ ---
    { id: 36, type: 'L', moveIdx: 9, relC: 0, relR: 0, c: 7, landingR: 14, vanishMove: 9, shifts: [] },
    { id: 37, type: 'L', moveIdx: 9, relC: 1, relR: 0, c: 8, landingR: 14, vanishMove: 9, shifts: [] },
    { id: 38, type: 'L', moveIdx: 9, relC: 2, relR: 0, c: 9, landingR: 14, vanishMove: 9, shifts: [] },
    { id: 39, type: 'L', moveIdx: 9, relC: 2, relR: 1, c: 9, landingR: 15, vanishMove: 9, shifts: [] }
  ];

  // ★軽量化サンプリング：1セルあたり 4x4 = 16点
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

  // 静的枠線＆HUD（軽量2重ネオンフレーム：約550点）
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

    // 「NEXT」文字ドット
    const LABEL_Y = NEXT_Y - 7;
    const labelPoints = [
      { x: NEXT_X + 8, y: LABEL_Y }, { x: NEXT_X + 8, y: LABEL_Y + 2 }, { x: NEXT_X + 8, y: LABEL_Y + 4 },
      { x: NEXT_X + 11, y: LABEL_Y + 2 }, { x: NEXT_X + 14, y: LABEL_Y }, { x: NEXT_X + 14, y: LABEL_Y + 4 },
      { x: NEXT_X + 20, y: LABEL_Y }, { x: NEXT_X + 20, y: LABEL_Y + 2 }, { x: NEXT_X + 20, y: LABEL_Y + 4 },
      { x: NEXT_X + 24, y: LABEL_Y }, { x: NEXT_X + 23, y: LABEL_Y + 2 }, { x: NEXT_X + 24, y: LABEL_Y + 4 },
      { x: NEXT_X + 30, y: LABEL_Y }, { x: NEXT_X + 34, y: LABEL_Y }, { x: NEXT_X + 32, y: LABEL_Y + 2 },
      { x: NEXT_X + 30, y: LABEL_Y + 4 }, { x: NEXT_X + 34, y: LABEL_Y + 4 },
      { x: NEXT_X + 40, y: LABEL_Y }, { x: NEXT_X + 44, y: LABEL_Y }, { x: NEXT_X + 42, y: LABEL_Y + 2 }, { x: NEXT_X + 42, y: LABEL_Y + 4 }
    ];
    labelPoints.forEach(lp => {
      pts.push({ bx: lp.x, by: lp.y, rgb: [160, 230, 255], size: 1.9 });
    });

    // 背景グリッド交点（140点）
    for (let r = 1; r < ROWS; r++) {
      for (let c = 1; c < COLS; c++) {
        pts.push({
          bx: ORIGIN_X + c * CELL_SIZE,
          by: ORIGIN_Y + r * CELL_SIZE,
          rgb: [25, 45, 85],
          size: 1.1
        });
      }
    }

    return pts;
  }

  const staticHUD = generateStaticHUD();

  // 毎フレーム計算（完全固定長 約2,800点）
  function generateTetrisTemplate(time = 0) {
    const points = [];

    // 1. 静的枠線＆HUD（不変スロット）
    for (let i = 0; i < staticHUD.length; i++) {
      points.push(staticHUD[i]);
    }

    const cycleTime = (time % TOTAL_CYCLE_DURATION);

    let curMoveIdx = 0;
    for (let m = MOVES.length - 1; m >= 0; m--) {
      if (cycleTime >= MOVE_START_TIMES[m]) {
        curMoveIdx = m;
        break;
      }
    }

    // 2. 全40個のブロック実体の計算（40 × 16点 = 640点）
    for (let bIdx = 0; bIdx < BLOCK_SPRITES.length; bIdx++) {
      const blk = BLOCK_SPRITES[bIdx];
      const tetro = TETROMINO_DEFS[blk.type];

      const spawnTime = MOVE_START_TIMES[blk.moveIdx];
      const spawnConfig = MOVES[blk.moveIdx];

      const vanishTime = MOVE_START_TIMES[blk.vanishMove];
      const vanishConfig = MOVES[blk.vanishMove];
      const vanishFlashStartTime = vanishTime + vanishConfig.fallDur + vanishConfig.lockDur + vanishConfig.pauseDur;
      const vanishEndTime = vanishFlashStartTime + vanishConfig.flashDur;

      let isVisible = false;
      let curCol = blk.c;
      let curRow = blk.landingR;
      let isLockGlow = false;
      let isFlashing = false;
      let flashProgress = 0;

      if (cycleTime < spawnTime) {
        isVisible = false;
        curCol = blk.c;
        curRow = -1.5 + blk.relR;
      } else if (cycleTime < spawnTime + spawnConfig.fallDur) {
        isVisible = true;
        const fallFrac = (cycleTime - spawnTime) / spawnConfig.fallDur;
        const easeDrop = fallFrac * fallFrac;
        curCol = blk.c;
        curRow = (-1.0 + blk.relR) + (blk.landingR - (-1.0 + blk.relR)) * easeDrop;
      } else if (cycleTime < spawnTime + spawnConfig.fallDur + spawnConfig.lockDur) {
        isVisible = true;
        curCol = blk.c;
        curRow = blk.landingR;
        isLockGlow = true;
      } else if (cycleTime < vanishFlashStartTime) {
        isVisible = true;
        curCol = blk.c;
        curRow = blk.landingR;

        for (let s = 0; s < blk.shifts.length; s++) {
          const shift = blk.shifts[s];
          const shiftConfig = MOVES[shift.moveIdx];
          const shiftStartTime = MOVE_START_TIMES[shift.moveIdx] + shiftConfig.fallDur + shiftConfig.lockDur + shiftConfig.pauseDur + shiftConfig.flashDur;
          const shiftEndTime = shiftStartTime + shiftConfig.dropDur;

          if (cycleTime >= shiftEndTime) {
            curRow = shift.toR;
          } else if (cycleTime >= shiftStartTime) {
            const dropFrac = (cycleTime - shiftStartTime) / shiftConfig.dropDur;
            const easeDrop = dropFrac * dropFrac * (3 - 2 * dropFrac);
            curRow = shift.fromR + (shift.toR - shift.fromR) * easeDrop;
            break;
          } else {
            break;
          }
        }
      } else if (cycleTime < vanishEndTime) {
        isVisible = true;
        isFlashing = true;
        flashProgress = (cycleTime - vanishFlashStartTime) / vanishConfig.flashDur;
        curCol = blk.c;
        curRow = blk.landingR;
        for (let s = 0; s < blk.shifts.length; s++) {
          const shift = blk.shifts[s];
          const shiftConfig = MOVES[shift.moveIdx];
          const shiftEndTime = MOVE_START_TIMES[shift.moveIdx] + shiftConfig.fallDur + shiftConfig.lockDur + shiftConfig.pauseDur + shiftConfig.flashDur + shiftConfig.dropDur;
          if (cycleTime >= shiftEndTime) {
            curRow = shift.toR;
          }
        }
      } else {
        isVisible = false;
        curCol = blk.c;
        curRow = -1.5 + blk.relR;
      }

      const px = ORIGIN_X + curCol * CELL_SIZE;
      const py = ORIGIN_Y + curRow * CELL_SIZE;

      for (let k = 0; k < CELL_PTS_OFFSETS.length; k++) {
        const off = CELL_PTS_OFFSETS[k];
        if (isVisible) {
          if (isFlashing) {
            const spread = (curCol < 5 ? -1 : 1) * flashProgress * 55;
            const flashRgb = flashProgress < 0.25 ? [255, 255, 255] : tetro.color;
            points.push({
              bx: px + off.dx + spread,
              by: py + off.dy,
              rgb: flashRgb,
              size: Math.max(0.5, 2.4 * (1.0 - flashProgress))
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
          points.push({
            bx: px + off.dx,
            by: py + off.dy,
            rgb: [15, 25, 55],
            size: 0.7
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
    const nextMoveIdx = (curMoveIdx + 1) % MOVES.length;
    const nextMoveConfig = MOVES[nextMoveIdx];
    const nextTetro = TETROMINO_DEFS[nextMoveConfig.type];

    const NEXT_SHAPES = {
      J: [[2, 0], [0, 1], [1, 1], [2, 1]],
      I: [[0, 0], [0, 1], [0, 2], [0, 3]],
      T: [[1, 0], [0, 1], [1, 1], [2, 1]],
      S: [[0, 0], [1, 0], [1, 1], [2, 1]],
      Z: [[0, 0], [0, 1], [1, 1], [1, 2]],
      O: [[0, 0], [1, 0], [0, 1], [1, 1]],
      L: [[0, 0], [1, 0], [2, 0], [2, 1]]
    };

    const nextShape = NEXT_SHAPES[nextMoveConfig.type] || [[0, 0]];
    const NEXT_ORIGIN_X = ORIGIN_X + FIELD_W + 30;
    const NEXT_ORIGIN_Y = ORIGIN_Y + 25;

    nextShape.forEach(blk => {
      const nbx = NEXT_ORIGIN_X + blk[0] * 12;
      const nby = NEXT_ORIGIN_Y + blk[1] * 12;
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

    // 5. ラインクリア時の火花・スパーク爆発（30点）
    const numSparks = 30;
    const isVanishMove = (curMoveIdx === 4 || curMoveIdx === 7 || curMoveIdx === 9);
    const vanishStart = MOVE_START_TIMES[curMoveIdx] + MOVES[curMoveIdx].fallDur + MOVES[curMoveIdx].lockDur + MOVES[curMoveIdx].pauseDur;
    const isSparksActive = isVanishMove && (cycleTime >= vanishStart && cycleTime < vanishStart + MOVES[curMoveIdx].flashDur);
    const sparkFrac = isSparksActive ? (cycleTime - vanishStart) / MOVES[curMoveIdx].flashDur : 0;

    for (let s = 0; s < numSparks; s++) {
      if (isSparksActive) {
        const sAngle = (s / numSparks) * Math.PI * 2 + s * 1.5;
        const sSpeed = 26 + (s % 6) * 20;
        const sx = ORIGIN_X + (FIELD_W * 0.5) + Math.cos(sAngle) * (sSpeed * sparkFrac);
        const targetRow = (curMoveIdx === 9) ? 14.5 : 15;
        const sy = ORIGIN_Y + (targetRow * CELL_SIZE) + Math.sin(sAngle) * (sSpeed * sparkFrac);
        const sColor = (curMoveIdx === 9) ? [255, 235, 80] : [0, 240, 255];

        points.push({
          bx: sx,
          by: sy,
          rgb: sparkFrac < 0.20 ? [255, 255, 255] : sColor,
          size: Math.max(0.8, 3.2 * (1.0 - sparkFrac))
        });
      } else {
        points.push({
          bx: ORIGIN_X + (s / numSparks) * FIELD_W,
          by: ORIGIN_Y + FIELD_H + 12,
          rgb: [30, 50, 100],
          size: 1.1
        });
      }
    }

    return points;
  }

  function buildStaticTetris() {
    return generateTetrisTemplate(0);
  }

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
