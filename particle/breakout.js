/**
 * breakout.js - Cyber Breakout (ネオン・ブロック崩し)
 * 
 * Halcyon デザインシステム準拠のリアルタイム・ブロック崩しパーティクルシステム
 * - 6行 x 8列のカラフルなサイバーネオンブロック群
 * - 等速直線運動 ＆ 鏡面反射による完全なブロック崩し物理演算
 * - パドル追尾＆キャッチリバウンド、壁・天井・ブロックとの正確な衝突
 * - ブロック破壊時のスパーク飛散エフェクト
 * - 右側サイバーHUD（SCORE, HIGH, BALLS, ロゴ, イコライザー波形）
 * - フレーム間での点数不変性（完全固定点数）を100%保証
 */

'use strict';

(function (root) {

  const COLS = 8;
  const ROWS = 6;
  const BRICK_W = 16.0;
  const BRICK_H = 7.5;
  const GAP_X = 2.0;
  const GAP_Y = 3.5;

  const FIELD_W = COLS * (BRICK_W + GAP_X) - GAP_X; // 142
  const FIELD_H = 220;

  // メインフィールドを左にオフセットし、右側にサイドHUDを配置
  const ORIGIN_X = -FIELD_W * 0.5 - 28;
  const ORIGIN_Y = -FIELD_H * 0.5;

  const BRICK_START_Y = 30;
  const PADDLE_Y = FIELD_H - 18; // 202
  const PADDLE_W = 34;

  const ROW_COLORS = [
    { fill: [255, 65, 110], edge: [255, 180, 205] },  // Row 0: ネオンマゼンタ
    { fill: [255, 140, 45], edge: [255, 215, 160] },  // Row 1: サンセットオレンジ
    { fill: [255, 225, 45], edge: [255, 250, 180] },  // Row 2: ネオンゴールド
    { fill: [45, 235, 120], edge: [180, 255, 210] },  // Row 3: エメラルドグリーン
    { fill: [35, 210, 255], edge: [190, 245, 255] },  // Row 4: エレクトリックシアン
    { fill: [175, 95, 255], edge: [235, 195, 255] }   // Row 5: ホロバイオレット
  ];

  // 1ブロックあたり 4x4 = 16点サンプリング
  const BRICK_PTS_OFFSETS = [];
  for (let iy = 0; iy < 4; iy++) {
    for (let ix = 0; ix < 4; ix++) {
      const isEdge = (ix === 0 || ix === 3 || iy === 0 || iy === 3);
      BRICK_PTS_OFFSETS.push({
        dx: (ix / 3) * (BRICK_W - 1.5) + 0.75,
        dy: (iy / 3) * (BRICK_H - 1.5) + 0.75,
        isEdge: isEdge,
        vx: (ix - 1.5) * 18.0 + (Math.sin(ix * 3 + iy) * 8.0),
        vy: (iy - 1.5) * 16.0 - 15.0 - (Math.cos(ix + iy * 2) * 10.0)
      });
    }
  }

  // ブロック定義
  const BRICK_DEFS = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * (BRICK_W + GAP_X);
      const y = BRICK_START_Y + r * (BRICK_H + GAP_Y);
      BRICK_DEFS.push({
        id: r * COLS + c,
        r: r,
        c: c,
        x: x,
        y: y,
        color: ROW_COLORS[r]
      });
    }
  }

  // 5x7 ビットマップフォント
  const FONT_5X7 = {
    '0': [' ### ', '#   #', '#  ##', '# # #', '##  #', '#   #', ' ### '],
    '1': ['  #  ', ' ##  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
    '2': [' ### ', '#   #', '    #', '  ## ', ' #   ', '#    ', '#####'],
    '3': ['#### ', '    #', '   # ', ' ### ', '    #', '    #', '#### '],
    '4': ['   # ', '  ## ', ' # # ', '#  # ', '#####', '   # ', '   # '],
    '5': ['#####', '#    ', '#### ', '    #', '    #', '#   #', ' ### '],
    '6': [' ### ', '#    ', '#### ', '#   #', '#   #', '#   #', ' ### '],
    '7': ['#####', '    #', '   # ', '  #  ', ' #   ', ' #   ', ' #   '],
    '8': [' ### ', '#   #', '#   #', ' ### ', '#   #', '#   #', ' ### '],
    '9': [' ### ', '#   #', '#   #', ' ####', '    #', '    #', ' ### '],
    'A': [' ### ', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
    'B': ['#### ', '#   #', '#   #', '#### ', '#   #', '#   #', '#### '],
    'C': [' ####', '#    ', '#    ', '#    ', '#    ', '#    ', ' ####'],
    'E': ['#####', '#    ', '#### ', '#    ', '#    ', '#    ', '#####'],
    'G': [' ####', '#    ', '#  ##', '#   #', '#   #', '#   #', ' ### '],
    'H': ['#   #', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
    'I': [' ### ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
    'K': ['#   #', '#  # ', '# #  ', '##   ', '# #  ', '#  # ', '#   #'],
    'L': ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
    'M': ['#   #', '## ##', '# # #', '# # #', '#   #', '#   #', '#   #'],
    'O': [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    'P': ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
    'R': ['#### ', '#   #', '#   #', '#### ', '#  # ', '#   #', '#   #'],
    'S': [' ####', '#    ', ' ### ', '    #', '    #', '#   #', ' ### '],
    'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
    'U': ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    'V': ['#   #', '#   #', '#   #', '#   #', '#   #', ' # # ', '  #  '],
    ' ': ['     ', '     ', '     ', '     ', '     ', '     ', '     ']
  };

  // 通常テキスト描画（静的HUD用）
  function drawText(pts, text, startX, startY, color, scale = 1.35, spacing = 2.4, size = 1.6) {
    const charW = 5 * scale;
    for (let c = 0; c < text.length; c++) {
      const ch = text[c];
      const pattern = FONT_5X7[ch] || FONT_5X7[' '];
      const ox = startX + c * (charW + spacing);
      for (let r = 0; r < 7; r++) {
        const row = pattern[r];
        for (let col = 0; col < 5; col++) {
          if (row[col] === '#') {
            pts.push({
              bx: ox + col * scale,
              by: startY + r * scale,
              rgb: color,
              size: size
            });
          }
        }
      }
    }
  }

  // 固定点数デジタル数字描画（各桁 5x7 = 35点固定、数字が変わっても点数増減ゼロ）
  function drawFixedDigitalNumber(pts, numStr, startX, startY, activeColor, scale = 1.25, spacing = 2.0) {
    const charW = 5 * scale;
    for (let c = 0; c < numStr.length; c++) {
      const ch = numStr[c];
      const pattern = FONT_5X7[ch] || FONT_5X7['0'];
      const ox = startX + c * (charW + spacing);
      for (let r = 0; r < 7; r++) {
        const row = pattern[r];
        for (let col = 0; col < 5; col++) {
          const isLit = (row[col] === '#');
          pts.push({
            bx: ox + col * scale,
            by: startY + r * scale,
            rgb: isLit ? activeColor : [12, 20, 42],
            size: isLit ? 1.7 : 0.4
          });
        }
      }
    }
  }

  // ==========================================
  // 静的枠線＆HUD（不変点群：約750点）
  // ==========================================
  function generateStaticHUD() {
    const pts = [];
    const RGB_BORDER = [45, 140, 240];
    const RGB_OUTER = [20, 55, 115];
    const RGB_HEADER = [90, 210, 255];
    const RGB_CYAN = [60, 230, 255];

    // 1. メインフィールド外枠（上・左・右の2重ネオンフレーム）
    // 上辺
    for (let x = -4; x <= FIELD_W + 4; x += 2.5) {
      pts.push({ bx: ORIGIN_X + x, by: ORIGIN_Y - 4, rgb: RGB_OUTER, size: 1.5 });
      pts.push({ bx: ORIGIN_X + x, by: ORIGIN_Y, rgb: RGB_BORDER, size: 2.2 });
    }
    // 左辺・右辺
    for (let y = -4; y <= FIELD_H; y += 2.5) {
      pts.push({ bx: ORIGIN_X - 4, by: ORIGIN_Y + y, rgb: RGB_OUTER, size: 1.5 });
      pts.push({ bx: ORIGIN_X, by: ORIGIN_Y + y, rgb: RGB_BORDER, size: 2.2 });
      pts.push({ bx: ORIGIN_X + FIELD_W, by: ORIGIN_Y + y, rgb: RGB_BORDER, size: 2.2 });
      pts.push({ bx: ORIGIN_X + FIELD_W + 4, by: ORIGIN_Y + y, rgb: RGB_OUTER, size: 1.5 });
    }
    // 底面（ロストライン：赤い警告破線ドット）
    for (let x = 2; x < FIELD_W; x += 5.5) {
      pts.push({ bx: ORIGIN_X + x, by: ORIGIN_Y + FIELD_H, rgb: [255, 40, 70], size: 1.5 });
    }

    // 2. サイドHUDパネル（右側）
    const HUD_X = ORIGIN_X + FIELD_W + 18;
    const HUD_Y = ORIGIN_Y + 8;
    const HUD_W = 68;

    // 「SCORE」枠
    const SCORE_BOX_H = 38;
    for (let x = 0; x <= HUD_W; x += 2.6) {
      pts.push({ bx: HUD_X + x, by: HUD_Y, rgb: RGB_HEADER, size: 1.8 });
      pts.push({ bx: HUD_X + x, by: HUD_Y + SCORE_BOX_H, rgb: RGB_HEADER, size: 1.8 });
    }
    for (let y = 0; y <= SCORE_BOX_H; y += 2.6) {
      pts.push({ bx: HUD_X, by: HUD_Y + y, rgb: RGB_HEADER, size: 1.8 });
      pts.push({ bx: HUD_X + HUD_W, by: HUD_Y + y, rgb: RGB_HEADER, size: 1.8 });
    }
    drawText(pts, 'SCORE', HUD_X + 9, HUD_Y - 11, RGB_CYAN, 1.15, 2.0, 1.5);

    // 「HIGH」枠
    const HIGH_Y = HUD_Y + 54;
    const HIGH_BOX_H = 34;
    for (let x = 0; x <= HUD_W; x += 2.6) {
      pts.push({ bx: HUD_X + x, by: HIGH_Y, rgb: RGB_HEADER, size: 1.8 });
      pts.push({ bx: HUD_X + x, by: HIGH_Y + HIGH_BOX_H, rgb: RGB_HEADER, size: 1.8 });
    }
    for (let y = 0; y <= HIGH_BOX_H; y += 2.6) {
      pts.push({ bx: HUD_X, by: HIGH_Y + y, rgb: RGB_HEADER, size: 1.8 });
      pts.push({ bx: HUD_X + HUD_W, by: HIGH_Y + y, rgb: RGB_HEADER, size: 1.8 });
    }
    drawText(pts, 'HIGH', HUD_X + 14, HIGH_Y - 11, [255, 215, 70], 1.15, 2.0, 1.5);
    drawText(pts, '09840', HUD_X + 8, HIGH_Y + 11, [255, 235, 120], 1.25, 2.0, 1.6);

    // 「BALLS」インジケーター（3機のミニパドル＆ボール）
    const LIVES_Y = HIGH_Y + 48;
    drawText(pts, 'BALLS', HUD_X + 11, LIVES_Y, [120, 200, 255], 1.05, 1.8, 1.4);
    for (let i = 0; i < 3; i++) {
      const lx = HUD_X + 12 + i * 18;
      const ly = LIVES_Y + 16;
      pts.push({ bx: lx, by: ly - 2, rgb: [255, 255, 255], size: 1.8 });
      pts.push({ bx: lx, by: ly - 2, rgb: [60, 220, 255], size: 2.4 });
      pts.push({ bx: lx - 4, by: ly + 4, rgb: [40, 180, 255], size: 1.6 });
      pts.push({ bx: lx, by: ly + 4, rgb: [220, 245, 255], size: 1.8 });
      pts.push({ bx: lx + 4, by: ly + 4, rgb: [40, 180, 255], size: 1.6 });
    }

    // 「PLAY / BREAKOUT」ロゴ
    const LOGO_Y = LIVES_Y + 36;
    drawText(pts, 'BREAK', HUD_X + 9, LOGO_Y, [255, 110, 180], 1.15, 2.0, 1.6);
    drawText(pts, ' OUT ', HUD_X + 9, LOGO_Y + 13, [255, 110, 180], 1.15, 2.0, 1.6);

    return pts;
  }

  const STATIC_HUD_PTS = generateStaticHUD();

  // ==========================================
  // 完全な等速直線運動＆鏡面反射ウェイポイントリスト
  // 【完全遮蔽・下から順ルール厳守】手前が壊れて空いた穴のみ奥へ進入可能
  // 全8列（Col 0〜7）すべてにボールが届き、最下段全列を攻略
  // ==========================================
  const CYCLE_DURATION = 20.0;

  // 各反射地点（折れ線頂点）：t(秒), bx(ボールX), by(ボールY), px(パドルX)
  const WAYPOINTS = [
    { t: 0.000,  bx: 71.0,  by: 197.0, px: 71.0  }, // start: パドル中央から斜め左上へ
    { t: 0.687,  bx: 22.8,  by: 94.6,  px: 22.9  }, // ブロック41(r=5, c=1)底面に衝突・反射！
    { t: 0.968,  bx: 3.0,   by: 136.6, px: 19.0  }, // 左壁衝突・反射
    { t: 1.379,  bx: 31.9,  by: 197.9, px: 31.9  }, // パドル打ち返し！
    { t: 2.072,  bx: 80.5,  by: 94.6,  px: 80.4  }, // ブロック44(r=5, c=4)底面に衝突・反射！
    { t: 2.765,  bx: 129.2, by: 197.9, px: 129.2 }, // パドル打ち返し！
    { t: 3.578,  bx: 43.6,  by: 94.6,  px: 43.9  }, // ブロック42(r=5, c=2)底面に衝突・反射！
    { t: 3.964,  bx: 3.0,   by: 143.7, px: 19.0  }, // 左壁衝突・反射
    { t: 4.392,  bx: 47.9,  by: 197.9, px: 47.9  }, // パドル打ち返し！
    { t: 5.205,  bx: 133.4, by: 94.6,  px: 123.0 }, // ブロック47(r=5, c=7: 最右端)底面に衝突・反射！
    { t: 5.258,  bx: 139.0, by: 101.3, px: 123.0 }, // 右壁衝突・反射
    { t: 6.019,  bx: 59.0,  by: 197.9, px: 59.0  }, // パドル打ち返し！
    { t: 6.735,  bx: 29.7,  by: 83.6,  px: 29.7  }, // c=1の穴から進入！ブロック33(r=4, c=1)衝突・反射！
    { t: 7.384,  bx: 3.0,   by: 187.4, px: 19.0  }, // 左壁衝突・反射
    { t: 7.451,  bx: 5.7,   by: 197.9, px: 5.7   }, // パドル滑り込みキャッチ！
    { t: 8.167,  bx: 35.1,  by: 83.6,  px: 35.0  }, // c=2の穴から進入！ブロック34(r=4, c=2)衝突・反射！
    { t: 8.883,  bx: 64.5,  by: 197.9, px: 64.5  }, // パドル打ち返し！
    { t: 9.510,  bx: 64.5,  by: 94.6,  px: 64.5  }, // ブロック43(r=5, c=3)底面に衝突・反射！
    { t: 10.136, bx: 64.5,  by: 197.9, px: 64.5  }, // パドル打ち返し！
    { t: 10.838, bx: 82.6,  by: 83.6,  px: 82.5  }, // c=4の穴から進入！ブロック36(r=4, c=4)衝突・反射！
    { t: 11.540, bx: 100.7, by: 197.9, px: 100.7 }, // パドル打ち返し！
    { t: 12.310, bx: 80.8,  by: 72.6,  px: 80.9  }, // c=4の深穴へ進入！ブロック28(r=3, c=4)衝突・反射！
    { t: 13.080, bx: 61.0,  by: 197.9, px: 61.0  }, // パドル打ち返し！
    { t: 13.772, bx: 12.3,  by: 94.6,  px: 19.0  }, // ブロック40(r=5, c=0: 最左端)底面に衝突・反射！
    { t: 13.905, bx: 3.0,   by: 114.4, px: 19.0  }, // 左壁衝突・反射
    { t: 14.465, bx: 42.3,  by: 197.9, px: 42.3  }, // パドル打ち返し！
    { t: 15.158, bx: 91.0,  by: 94.6,  px: 90.8  }, // ブロック45(r=5, c=5)底面に衝突・反射！
    { t: 15.842, bx: 139.0, by: 196.7, px: 123.0 }, // 右壁衝突・反射
    { t: 15.850, bx: 138.4, by: 197.9, px: 138.4 }, // パドル打ち返し！
    { t: 16.837, bx: 34.7,  by: 72.6,  px: 34.9  }, // c=1の深穴へ進入！ブロック25(r=3, c=1)衝突・反射！
    { t: 17.138, bx: 3.0,   by: 110.9, px: 19.0  }, // 左壁衝突・反射
    { t: 17.823, bx: 75.1,  by: 197.9, px: 75.1  }, // パドル打ち返し！
    { t: 18.431, bx: 139.0, by: 120.6, px: 123.0 }, // 右壁衝突・反射
    { t: 18.637, bx: 117.4, by: 94.6,  px: 117.6 }, // ブロック46(r=5, c=6)底面に衝突・反射！
    { t: 19.450, bx: 31.9,  by: 197.9, px: 31.9  }, // パドルフィニッシュキャッチ！
    { t: 20.000, bx: 9.3,   by: 110.0, px: 19.0  }  // 周期末端
  ];

  // 48ブロックそれぞれの破壊時刻テーブル（手前から順に穴が開いた箇所のみ奥が破壊）
  const BREAK_TIMES = [
    // Row 0 (id: 0..7)
    999, 999, 999, 999, 999, 999, 999, 999,
    // Row 1 (id: 8..15)
    999, 999, 999, 999, 999, 999, 999, 999,
    // Row 2 (id: 16..23)
    999, 999, 999, 999, 999, 999, 999, 999,
    // Row 3 (id: 24..31) - c=1, c=4の深穴奥
    999, 16.84, 999, 999, 12.31, 999, 999, 999,
    // Row 4 (id: 32..39) - c=1, c=2, c=4の中段奥
    999, 6.73, 8.17, 999, 10.84, 999, 999, 999,
    // Row 5 (id: 40..47) - 最下段・手前全8列
    13.77, 0.69, 3.58, 9.51, 2.07, 15.16, 18.64, 5.21
  ];

  // ウェイポイント間の完全線形補間（完全等速直線運動）
  function getSimulationState(tInCycle) {
    let idx = 0;
    while (idx < WAYPOINTS.length - 1 && WAYPOINTS[idx + 1].t <= tInCycle) {
      idx++;
    }
    const w0 = WAYPOINTS[idx];
    const w1 = WAYPOINTS[Math.min(idx + 1, WAYPOINTS.length - 1)];

    const dt = w1.t - w0.t;
    const frac = dt > 0.00001 ? (tInCycle - w0.t) / dt : 0.0;

    // 完璧な等速直線補間
    const ballX = w0.bx + (w1.bx - w0.bx) * frac;
    const ballY = w0.by + (w1.by - w0.by) * frac;

    // パドルの追従（ボール打ち返し地点へ完璧に配置）
    const paddleX = w0.px + (w1.px - w0.px) * frac;

    // スコア計算
    let score = 0;
    for (let i = 0; i < BREAK_TIMES.length; i++) {
      if (tInCycle >= BREAK_TIMES[i]) {
        score += 240;
      }
    }

    return {
      ballX: ballX,
      ballY: ballY,
      paddleX: paddleX,
      score: score
    };
  }

  // ==========================================
  // メインテンプレート生成関数
  // ==========================================
  function generateBreakoutTemplate(time = 0) {
    const points = [];

    // 1. 静的枠線＆HUD（約750点）
    for (let i = 0; i < STATIC_HUD_PTS.length; i++) {
      const p = STATIC_HUD_PTS[i];
      points.push({ bx: p.bx, by: p.by, rgb: p.rgb, size: p.size });
    }

    // 周期内時間 (0.0 〜 20.0s)
    const tInCycle = time % CYCLE_DURATION;
    const state = getSimulationState(tInCycle);

    // 2. 動的スコア表示（HUD枠内: 各桁35点固定で点数変動ゼロ）
    const HUD_X = ORIGIN_X + FIELD_W + 18;
    const HUD_Y = ORIGIN_Y + 8;
    const scoreStr = ('00000' + state.score).slice(-5);
    drawFixedDigitalNumber(points, scoreStr, HUD_X + 8, HUD_Y + 13, [255, 255, 255], 1.25, 2.0);

    // 3. ブロック群（48ブロック x 16点 = 768点固定）
    for (let b = 0; b < BRICK_DEFS.length; b++) {
      const brick = BRICK_DEFS[b];
      const breakTime = BREAK_TIMES[b];
      const isAlive = (tInCycle < breakTime);

      const col = brick.color;

      if (isAlive) {
        // --- 生存中：綺麗なネオンブロック ---
        const bx0 = ORIGIN_X + brick.x;
        const by0 = ORIGIN_Y + brick.y;

        for (let k = 0; k < BRICK_PTS_OFFSETS.length; k++) {
          const off = BRICK_PTS_OFFSETS[k];
          points.push({
            bx: bx0 + off.dx,
            by: by0 + off.dy,
            rgb: off.isEdge ? col.edge : col.fill,
            size: off.isEdge ? 1.7 : 1.4
          });
        }
      } else {
        // --- 破壊後：爆発火花パーティクル飛散 ---
        const dt = tInCycle - breakTime;

        if (dt >= 0 && dt < 1.4) {
          // 破片が放射状に飛び散り、重力で落下しながらフェード
          const bx0 = ORIGIN_X + brick.x + BRICK_W * 0.5;
          const by0 = ORIGIN_Y + brick.y + BRICK_H * 0.5;
          const fade = Math.max(0, 1.0 - dt / 1.4);

          for (let k = 0; k < BRICK_PTS_OFFSETS.length; k++) {
            const off = BRICK_PTS_OFFSETS[k];
            const px = bx0 + off.vx * dt;
            const py = by0 + off.vy * dt + 45.0 * dt * dt;

            const r = Math.floor(col.edge[0] * fade);
            const g = Math.floor(col.edge[1] * fade);
            const b_col = Math.floor(col.edge[2] * fade);

            points.push({
              bx: px,
              by: py,
              rgb: [r, g, b_col],
              size: (1.5 * fade) + 0.3
            });
          }
        } else {
          // 飛散終了後は画面外でダミー待機（点数完全固定）
          for (let k = 0; k < BRICK_PTS_OFFSETS.length; k++) {
            points.push({
              bx: ORIGIN_X + brick.x + 8,
              by: ORIGIN_Y - 50,
              rgb: [10, 15, 30],
              size: 0.1
            });
          }
        }
      }
    }

    // 4. パドル（Paddle: 約90点固定）
    const paddleScreenX = ORIGIN_X + state.paddleX;
    const paddleScreenY = ORIGIN_Y + PADDLE_Y;
    const hw = PADDLE_W * 0.5;

    // パドル天面（ボール跳ね返し面：高輝度ホワイト/シアン）
    for (let x = -hw; x <= hw; x += 1.8) {
      points.push({
        bx: paddleScreenX + x,
        by: paddleScreenY - 2.5,
        rgb: [220, 250, 255],
        size: 2.1
      });
      points.push({
        bx: paddleScreenX + x,
        by: paddleScreenY + 2.5,
        rgb: [35, 140, 255],
        size: 1.6
      });
    }
    // パドル両端キャップ＆中央パワーコア
    points.push({ bx: paddleScreenX - hw - 2, by: paddleScreenY, rgb: [255, 90, 180], size: 2.3 });
    points.push({ bx: paddleScreenX + hw + 2, by: paddleScreenY, rgb: [255, 90, 180], size: 2.3 });
    // パドル中央コア
    points.push({ bx: paddleScreenX, by: paddleScreenY, rgb: [255, 255, 255], size: 2.6 });
    points.push({ bx: paddleScreenX - 2.5, by: paddleScreenY, rgb: [60, 230, 255], size: 2.0 });
    points.push({ bx: paddleScreenX + 2.5, by: paddleScreenY, rgb: [60, 230, 255], size: 2.0 });

    // 5. ボール＆直線モーションブラートレイル（約50点固定）
    const ballScreenX = ORIGIN_X + state.ballX;
    const ballScreenY = ORIGIN_Y + state.ballY;

    // ボール本体（多層ネオンドット光球）
    const ballOffsets = [
      { dx: 0, dy: 0, col: [255, 255, 255], sz: 2.8 },
      { dx: -1.5, dy: 0, col: [200, 245, 255], sz: 2.2 },
      { dx: 1.5, dy: 0, col: [200, 245, 255], sz: 2.2 },
      { dx: 0, dy: -1.5, col: [200, 245, 255], sz: 2.2 },
      { dx: 0, dy: 1.5, col: [200, 245, 255], sz: 2.2 },
      { dx: -1.2, dy: -1.2, col: [60, 220, 255], sz: 1.8 },
      { dx: 1.2, dy: -1.2, col: [60, 220, 255], sz: 1.8 },
      { dx: -1.2, dy: 1.2, col: [60, 220, 255], sz: 1.8 },
      { dx: 1.2, dy: 1.2, col: [60, 220, 255], sz: 1.8 }
    ];
    for (let k = 0; k < ballOffsets.length; k++) {
      const bo = ballOffsets[k];
      points.push({
        bx: ballScreenX + bo.dx,
        by: ballScreenY + bo.dy,
        rgb: bo.col,
        size: bo.sz
      });
    }

    // 直線残像トレイル（過去4ステップ）
    for (let step = 1; step <= 4; step++) {
      const pastTime = Math.max(0, tInCycle - step * 0.035);
      const pastState = getSimulationState(pastTime);
      const trailAlpha = 1.0 - (step / 5.0);
      const tCol = [Math.floor(40 * trailAlpha), Math.floor(180 * trailAlpha), Math.floor(255 * trailAlpha)];

      points.push({
        bx: ORIGIN_X + pastState.ballX,
        by: ORIGIN_Y + pastState.ballY,
        rgb: tCol,
        size: 1.9 * trailAlpha
      });
      points.push({
        bx: ORIGIN_X + pastState.ballX - 1.2,
        by: ORIGIN_Y + pastState.ballY,
        rgb: tCol,
        size: 1.4 * trailAlpha
      });
      points.push({
        bx: ORIGIN_X + pastState.ballX + 1.2,
        by: ORIGIN_Y + pastState.ballY,
        rgb: tCol,
        size: 1.4 * trailAlpha
      });
    }

    // 6. サイドHUD下部イコライザー（32点固定）
    const EQ_X = HUD_X + 2;
    const EQ_Y = ORIGIN_Y + FIELD_H - 12;
    const numBars = 8;
    for (let b = 0; b < numBars; b++) {
      const bx = EQ_X + b * 8;
      const barH = Math.abs(Math.sin(time * 5.0 + b * 0.6)) * 18 + 4;
      for (let s = 0; s < 4; s++) {
        const by = EQ_Y - (s / 3) * barH;
        const col = s === 3 ? [255, 90, 160] : (s >= 1 ? [60, 220, 255] : [35, 120, 220]);
        points.push({
          bx: bx,
          by: by,
          rgb: col,
          size: 1.4
        });
      }
    }

    // 7. フィールド内サイバーダスト（微小星屑：60点固定）
    const dustCount = 60;
    for (let d = 0; d < dustCount; d++) {
      const dX = (d * 37.3 + time * 6.0) % (FIELD_W - 10) + 5;
      const dY = (d * 59.1 + time * 8.0) % (FIELD_H - 10) + 5;
      const twinkle = Math.sin(time * 3.0 + d) * 0.5 + 0.5;
      points.push({
        bx: ORIGIN_X + dX,
        by: ORIGIN_Y + dY,
        rgb: [Math.floor(50 * twinkle), Math.floor(130 * twinkle), Math.floor(200 * twinkle)],
        size: 0.9 + twinkle * 0.6
      });
    }

    return points;
  }

  function buildStaticBreakout() {
    return generateBreakoutTemplate(0);
  }

  // グローバル公開
  if (typeof window !== 'undefined') {
    window.buildBreakoutParticles = buildStaticBreakout;
    window.generateBreakoutTemplate = generateBreakoutTemplate;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildStaticBreakout: buildStaticBreakout,
      generateBreakoutTemplate: generateBreakoutTemplate
    };
  }

})(typeof window !== 'undefined' ? window : global);
