/**
 * flash_anzan.js - Flash Mental Arithmetic Particle Animation (フラッシュ暗算)
 * 
 * 仕様:
 * 1. タイムライン（1サイクル: 15.0秒）
 *    - 0.0s 〜 2.4s: 開始カウントダウン (3 -> 2 -> 1 -> READY)
 *    - 2.4s 〜 6.4s: 数字フラッシュ (0.8秒間隔 × 5問: 0.62s表示 + 0.18sフラッシュ)
 *    - 6.4s 〜 9.0s: シンキングタイム (THINKING... & 3, 2, 1 カウントダウン)
 *    - 9.0s 〜 13.5s: 正解発表 (ANSWER SUM = ◯◯ ＆ 花火・祝祭スパーク爆発)
 *    - 13.5s 〜 15.0s: 余韻・フェードアウト ＆ 次のランダム問題へ移行
 * 
 * 2. プロジェクタースクリーン（16:9比率）に完璧にフィットする高密度ドットマトリクスレイアウト。
 * 3. 各フレームのパーティクルは即座に（スナップ）描画され、瞬時にくっきりと数字が切り替わります。
 */

'use strict';

(function (root) {

  // --- ビットマップフォント定義 (5x7 グリッド) ---
  const FONT_5X7 = {
    '0': [
      ' ### ',
      '#   #',
      '#  ##',
      '# # #',
      '##  #',
      '#   #',
      ' ### '
    ],
    '1': [
      '  #  ',
      ' ##  ',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  ',
      ' ### '
    ],
    '2': [
      ' ### ',
      '#   #',
      '    #',
      '  ## ',
      ' #   ',
      '#    ',
      '#####'
    ],
    '3': [
      '#### ',
      '    #',
      '   # ',
      ' ### ',
      '    #',
      '    #',
      '#### '
    ],
    '4': [
      '   # ',
      '  ## ',
      ' # # ',
      '#  # ',
      '#####',
      '   # ',
      '   # '
    ],
    '5': [
      '#####',
      '#    ',
      '#### ',
      '    #',
      '    #',
      '#   #',
      ' ### '
    ],
    '6': [
      ' ### ',
      '#    ',
      '#### ',
      '#   #',
      '#   #',
      '#   #',
      ' ### '
    ],
    '7': [
      '#####',
      '    #',
      '   # ',
      '  #  ',
      ' #   ',
      ' #   ',
      ' #   '
    ],
    '8': [
      ' ### ',
      '#   #',
      '#   #',
      ' ### ',
      '#   #',
      '#   #',
      ' ### '
    ],
    '9': [
      ' ### ',
      '#   #',
      '#   #',
      ' ####',
      '    #',
      '   # ',
      ' ##  '
    ],
    'A': [
      ' ### ',
      '#   #',
      '#   #',
      '#####',
      '#   #',
      '#   #',
      '#   #'
    ],
    'B': [
      '#### ',
      '#   #',
      '#   #',
      '#### ',
      '#   #',
      '#   #',
      '#### '
    ],
    'C': [
      ' ### ',
      '#   #',
      '#    ',
      '#    ',
      '#    ',
      '#   #',
      ' ### '
    ],
    'D': [
      '#### ',
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      '#### '
    ],
    'E': [
      '#####',
      '#    ',
      '#### ',
      '#    ',
      '#    ',
      '#    ',
      '#####'
    ],
    'F': [
      '#####',
      '#    ',
      '#### ',
      '#    ',
      '#    ',
      '#    ',
      '#    '
    ],
    'G': [
      ' ### ',
      '#   #',
      '#    ',
      '# ###',
      '#   #',
      '#   #',
      ' ### '
    ],
    'H': [
      '#   #',
      '#   #',
      '#   #',
      '#####',
      '#   #',
      '#   #',
      '#   #'
    ],
    'I': [
      ' ### ',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  ',
      ' ### '
    ],
    'J': [
      '    #',
      '    #',
      '    #',
      '    #',
      '#   #',
      '#   #',
      ' ### '
    ],
    'K': [
      '#   #',
      '#  # ',
      '# #  ',
      '##   ',
      '# #  ',
      '#  # ',
      '#   #'
    ],
    'L': [
      '#    ',
      '#    ',
      '#    ',
      '#    ',
      '#    ',
      '#    ',
      '#####'
    ],
    'M': [
      '#   #',
      '## ##',
      '# # #',
      '# # #',
      '#   #',
      '#   #',
      '#   #'
    ],
    'N': [
      '#   #',
      '##  #',
      '# # #',
      '#  ##',
      '#   #',
      '#   #',
      '#   #'
    ],
    'O': [
      ' ### ',
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      ' ### '
    ],
    'P': [
      '#### ',
      '#   #',
      '#   #',
      '#### ',
      '#    ',
      '#    ',
      '#    '
    ],
    'Q': [
      ' ### ',
      '#   #',
      '#   #',
      '#   #',
      '# # #',
      '#  # ',
      ' ## #'
    ],
    'R': [
      '#### ',
      '#   #',
      '#   #',
      '#### ',
      '# #  ',
      '#  # ',
      '#   #'
    ],
    'S': [
      ' ####',
      '#    ',
      '#    ',
      ' ### ',
      '    #',
      '    #',
      '#### '
    ],
    'T': [
      '#####',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  '
    ],
    'U': [
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      ' ### '
    ],
    'V': [
      '#   #',
      '#   #',
      '#   #',
      '#   #',
      ' # # ',
      ' # # ',
      '  #  '
    ],
    'W': [
      '#   #',
      '#   #',
      '#   #',
      '# # #',
      '# # #',
      '## ##',
      '#   #'
    ],
    'X': [
      '#   #',
      '#   #',
      ' # # ',
      '  #  ',
      ' # # ',
      '#   #',
      '#   #'
    ],
    'Y': [
      '#   #',
      '#   #',
      ' # # ',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  '
    ],
    'Z': [
      '#####',
      '    #',
      '   # ',
      '  #  ',
      ' #   ',
      '#    ',
      '#####'
    ],
    '!': [
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  ',
      '  #  ',
      '     ',
      '  #  '
    ],
    '?': [
      ' ### ',
      '#   #',
      '    #',
      '  ## ',
      '  #  ',
      '     ',
      '  #  '
    ],
    '=': [
      '     ',
      '#####',
      '     ',
      '#####',
      '     ',
      '     ',
      '     '
    ],
    '+': [
      '     ',
      '  #  ',
      '  #  ',
      '#####',
      '  #  ',
      '  #  ',
      '     '
    ],
    ':': [
      '     ',
      '  #  ',
      '     ',
      '     ',
      '  #  ',
      '     ',
      '     '
    ],
    '/': [
      '    #',
      '   # ',
      '   # ',
      '  #  ',
      ' #   ',
      ' #   ',
      '#    '
    ],
    '[': [
      ' ### ',
      ' #   ',
      ' #   ',
      ' #   ',
      ' #   ',
      ' #   ',
      ' ### '
    ],
    ']': [
      ' ### ',
      '   # ',
      '   # ',
      '   # ',
      '   # ',
      '   # ',
      ' ### '
    ],
    '.': [
      '     ',
      '     ',
      '     ',
      '     ',
      '     ',
      '  ## ',
      '  ## '
    ],
    '-': [
      '     ',
      '     ',
      '     ',
      '#####',
      '     ',
      '     ',
      '     '
    ],
    ' ': [
      '     ',
      '     ',
      '     ',
      '     ',
      '     ',
      '     ',
      '     '
    ]
  };

  // 文字列からパーティクル点群をサンプリングするヘルパー関数
  function rasterizeText(text, scale = 4.0, spacing = 1.5, dotDensity = 2) {
    const pts = [];
    const charW = 5 * scale;
    const charH = 7 * scale;
    const totalW = text.length * charW + (text.length - 1) * (spacing * scale);
    const startX = -totalW * 0.5;
    const startY = -charH * 0.5;

    for (let cIdx = 0; cIdx < text.length; cIdx++) {
      const ch = text[cIdx].toUpperCase();
      const pattern = FONT_5X7[ch] || FONT_5X7[' '];
      const offsetX = startX + cIdx * (charW + spacing * scale);

      for (let r = 0; r < 7; r++) {
        const rowStr = pattern[r] || '     ';
        for (let c = 0; c < 5; c++) {
          if (rowStr[c] === '#') {
            for (let subY = 0; subY < dotDensity; subY++) {
              for (let subX = 0; subX < dotDensity; subX++) {
                const px = offsetX + (c + (subX + 0.5) / dotDensity) * scale;
                const py = startY + (r + (subY + 0.5) / dotDensity) * scale;
                pts.push({ x: px, y: py });
              }
            }
          }
        }
      }
    }
    return pts;
  }

  // --- 固定スロット数設計（厳密固定長バッファで60fps超高速描画） ---
  const MAX_TEXT_PTS = 1400;      // 中央メイン数字・文字用
  const MAX_SUBTEXT_PTS = 600;    // 上部・下部補助テキスト用
  const MAX_FRAME_PTS = 800;      // 外周サイバーHUDフレーム
  const MAX_INDICATOR_PTS = 300;  // 1/5〜5/5 プログレスインジケーター
  const MAX_EFFECT_PTS = 500;     // 花火・スパーク・フラッシュ演出用
  const TOTAL_POINTS = MAX_TEXT_PTS + MAX_SUBTEXT_PTS + MAX_FRAME_PTS + MAX_INDICATOR_PTS + MAX_EFFECT_PTS; // 3600点

  let templateBuffer = null;

  // シード付き疑似乱数（PRNG: xorshift32）でサイクルごとに再現性のある問題を出題
  function generateRoundData(cycleSeed) {
    let state = (Math.abs(Math.floor(cycleSeed)) * 1664525 + 1013904223) >>> 0;
    function nextRand() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    }

    const numbers = [];
    let sum = 0;
    for (let i = 0; i < 5; i++) {
      let num;
      const r = nextRand();
      if (r < 0.35) {
        // 1桁: 3 〜 9
        num = Math.floor(nextRand() * 7) + 3;
      } else if (r < 0.75) {
        // 2桁前半: 11 〜 49
        num = Math.floor(nextRand() * 39) + 11;
      } else {
        // 2桁後半: 50 〜 89
        num = Math.floor(nextRand() * 40) + 50;
      }
      numbers.push(num);
      sum += num;
    }
    return { numbers, sum };
  }

  // --- 外周サイバーHUDフレーム点群の静的初期化（スクリーン枠 X: -115〜+115, Y: -62.5〜+62.5 にゆとりを持って収める） ---
  const FRAME_PTS = [];
  const FW = 210, FH = 110;
  const frameDensity = 280;
  for (let i = 0; i < frameDensity; i++) {
    const frac = i / frameDensity;
    let fx, fy, type = 'border';
    if (frac < 0.25) {
      const t = frac / 0.25;
      fx = -FW * 0.5 + t * FW;
      fy = -FH * 0.5;
    } else if (frac < 0.5) {
      const t = (frac - 0.25) / 0.25;
      fx = FW * 0.5;
      fy = -FH * 0.5 + t * FH;
    } else if (frac < 0.75) {
      const t = (frac - 0.5) / 0.25;
      fx = FW * 0.5 - t * FW;
      fy = FH * 0.5;
    } else {
      const t = (frac - 0.75) / 0.25;
      fx = -FW * 0.5;
      fy = FH * 0.5 - t * FH;
    }
    FRAME_PTS.push({ x: fx, y: fy, type });
  }
  // コーナー装飾ブラケット
  const corners = [
    { cx: -FW * 0.5, cy: -FH * 0.5, dx: 1, dy: 1 },
    { cx: FW * 0.5, cy: -FH * 0.5, dx: -1, dy: 1 },
    { cx: FW * 0.5, cy: FH * 0.5, dx: -1, dy: -1 },
    { cx: -FW * 0.5, cy: FH * 0.5, dx: 1, dy: -1 }
  ];
  for (const c of corners) {
    for (let k = 0; k < 18; k++) {
      FRAME_PTS.push({ x: c.cx + c.dx * (k * 1.0), y: c.cy + c.dy * 6, type: 'corner' });
      FRAME_PTS.push({ x: c.cx + c.dx * 6, y: c.cy + c.dy * (k * 1.0), type: 'corner' });
    }
  }
  // 装飾用サイドスキャナーグリッド（Y: -36 〜 +36 に安全に収める）
  for (let s = 0; s < 180; s++) {
    const side = (s % 2 === 0) ? -1 : 1;
    const row = Math.floor(s / 2) % 9;
    const col = Math.floor(s / 18);
    FRAME_PTS.push({
      x: side * (FW * 0.5 - 6 - col * 3.5),
      y: -36 + row * 9,
      type: 'sideGrid'
    });
  }

  /**
   * generateFlashAnzanTemplate: 毎フレームのパーティクルバッファ生成
   * @param {number} time - アニメーション経過時間（秒）
   */
  function generateFlashAnzanTemplate(time = 0) {
    if (!templateBuffer || templateBuffer.length !== TOTAL_POINTS) {
      templateBuffer = new Array(TOTAL_POINTS);
      for (let i = 0; i < TOTAL_POINTS; i++) {
        templateBuffer[i] = { bx: 0, by: 0, rgb: [255, 255, 255], size: 2.0 };
      }
    }

    let pIdx = 0;
    const CYCLE_DURATION = 18.0; // 1サイクルの総秒数 (シンキングタイム5秒に拡大)
    const isZero = (time === 0);
    const curTime = isZero ? 0.0 : time;
    const cycleIdx = Math.floor(curTime / CYCLE_DURATION);
    const cycleT = curTime % CYCLE_DURATION;

    // 現在のサイクルの出題データ
    const { numbers, sum } = generateRoundData(cycleIdx + 101);

    // =========================================================
    // タイムラインのフェーズ判定
    // 1. カウントダウン: 0.0s 〜 2.4s (3 -> 2 -> 1 -> READY)
    // 2. フラッシュ出題: 2.4s 〜 6.4s (5問: 0.8s/問)
    // 3. シンキング: 6.4s 〜 11.4s (5秒間: 5 -> 4 -> 3 -> 2 -> 1)
    // 4. 正解発表: 11.4s 〜 16.0s (ANSWER SUM = sum & 花火)
    // 5. 次回準備: 16.0s 〜 18.0s (STANDBY)
    // =========================================================

    let mainText = '';
    let subText = 'FLASH ARITHMETIC';
    let mainColor = [0, 240, 255];   // シアン
    let subColor = [140, 210, 255];
    let mainScale = 5.0;
    let mainDotDensity = 2;
    let currentNumberIdx = -1;
    let flashPulse = 0;
    let isSparkActive = false;
    let sparkProgress = 0;

    if (cycleT < 2.4) {
      // --- Phase 1: 開始カウントダウン ---
      if (cycleT < 0.7) {
        mainText = '3';
        mainColor = [255, 90, 90];
        mainScale = 5.0;
        flashPulse = Math.sin((cycleT / 0.7) * Math.PI);
      } else if (cycleT < 1.4) {
        mainText = '2';
        mainColor = [255, 180, 50];
        mainScale = 5.0;
        flashPulse = Math.sin(((cycleT - 0.7) / 0.7) * Math.PI);
      } else if (cycleT < 2.1) {
        mainText = '1';
        mainColor = [255, 230, 60];
        mainScale = 5.0;
        flashPulse = Math.sin(((cycleT - 1.4) / 0.7) * Math.PI);
      } else {
        mainText = 'READY';
        mainColor = [0, 255, 180];
        mainScale = 3.2;
        flashPulse = 1.0;
      }
      subText = 'COUNTDOWN';
      subColor = [160, 220, 255];
    } else if (cycleT < 6.4) {
      // --- Phase 2: 数字フラッシュ (0.8秒間隔 × 5問) ---
      const flashLocalT = cycleT - 2.4;
      currentNumberIdx = Math.min(4, Math.floor(flashLocalT / 0.8));
      const stepT = flashLocalT % 0.8;
      const numVal = numbers[currentNumberIdx];

      // 各問の 0.0s〜0.62s: 数字表示、0.62s〜0.80s: ブランク/フラッシュ
      if (stepT < 0.62) {
        mainText = String(numVal);
        mainScale = numVal >= 10 ? 5.2 : 6.0;
        // 数字ごとに色鮮やかなサイバーカラー
        const colors = [
          [0, 240, 255],   // シアン
          [255, 215, 0],   // ゴールド
          [255, 80, 140],  // ネオンピンク
          [80, 255, 120],  // ネオングリーン
          [190, 100, 255]  // ネオンパープル
        ];
        mainColor = colors[currentNumberIdx % colors.length];
        flashPulse = Math.sin((stepT / 0.62) * Math.PI);
      } else {
        // ブランク閃光
        mainText = '+';
        mainScale = 3.0;
        mainColor = [255, 255, 255];
        flashPulse = 0.4;
      }
      subText = `STAGE [ ${currentNumberIdx + 1} / 5 ]`;
      subColor = [255, 220, 140];
    } else if (cycleT < 11.4) {
      // --- Phase 3: シンキングタイム (思考カウントダウン 5秒: 5 -> 4 -> 3 -> 2 -> 1) ---
      const thinkT = cycleT - 6.4; // 0.0s 〜 5.0s
      subText = 'THINKING...';
      subColor = [200, 180, 255];

      if (thinkT < 1.0) {
        mainText = '5';
        mainScale = 5.0;
        mainColor = [130, 220, 255]; // シアンブルー
      } else if (thinkT < 2.0) {
        mainText = '4';
        mainScale = 5.0;
        mainColor = [160, 240, 120]; // ネオングリーン
      } else if (thinkT < 3.0) {
        mainText = '3';
        mainScale = 5.0;
        mainColor = [255, 220, 70];  // イエロー
      } else if (thinkT < 4.0) {
        mainText = '2';
        mainScale = 5.0;
        mainColor = [255, 140, 60];  // オレンジ
      } else {
        mainText = '1';
        mainScale = 5.0;
        mainColor = [255, 70, 70];   // レッド
      }
      const stepThinkT = thinkT % 1.0;
      flashPulse = 0.85 + 0.15 * Math.sin(stepThinkT * Math.PI);
    } else if (cycleT < 16.0) {
      // --- Phase 4: 正解発表 (ANSWER SUM = sum) ---
      const ansT = cycleT - 11.4;
      mainText = String(sum);
      mainScale = sum >= 100 ? 5.0 : 5.8;
      mainColor = [255, 225, 60]; // 輝くゴールド
      subText = `ANSWER  SUM = ${sum}`;
      subColor = [80, 255, 180];
      flashPulse = 1.0 + 0.15 * Math.sin(curTime * 8);

      isSparkActive = true;
      sparkProgress = Math.min(1.0, ansT / 4.6);
    } else {
      // --- Phase 5: 余韻 & 次回準備 ---
      mainText = 'NEXT';
      mainScale = 3.2;
      mainColor = [160, 220, 255];
      subText = 'STANDBY';
      subColor = [120, 180, 240];
      flashPulse = Math.max(0, (18.0 - cycleT) / 2.0);
    }

    // ---------------------------------------------------------
    // 1. 中央メインテキストのパーティクル生成（Y: -4 付近）
    // ---------------------------------------------------------
    const textPts = rasterizeText(mainText, mainScale, 1.4, mainDotDensity);
    const numTextPts = textPts.length;

    for (let i = 0; i < MAX_TEXT_PTS; i++) {
      const item = templateBuffer[pIdx++];
      if (i < numTextPts) {
        const pt = textPts[i];
        item.bx = pt.x;
        item.by = pt.y - 4;

        // サイバーネオングロー発光色
        const bright = 0.90 + 0.10 * Math.sin(curTime * 6 + i * 0.1);
        item.rgb = [
          Math.min(255, Math.round(mainColor[0] * bright)),
          Math.min(255, Math.round(mainColor[1] * bright)),
          Math.min(255, Math.round(mainColor[2] * bright))
        ];
        item.size = 2.0;
      } else {
        // 余剰粒子：メイン数字の周囲（半径36px以内）に待機する微細ネオンオーラ
        const angle = (i / (MAX_TEXT_PTS - numTextPts)) * Math.PI * 2 + curTime * 0.8;
        const rad = 35 + (i % 12) * 1.0;
        item.bx = Math.cos(angle) * rad;
        item.by = Math.sin(angle) * (rad * 0.5) - 4;
        item.rgb = [
          Math.round(mainColor[0] * 0.3),
          Math.round(mainColor[1] * 0.3),
          Math.round(mainColor[2] * 0.3)
        ];
        item.size = 0.8;
      }
    }

    // ---------------------------------------------------------
    // 2. サブテキスト（下部 Y = +38 付近に安全配置）
    // ---------------------------------------------------------
    const subPts = rasterizeText(subText, 1.25, 1.1, 1);
    const numSubPts = subPts.length;

    for (let i = 0; i < MAX_SUBTEXT_PTS; i++) {
      const item = templateBuffer[pIdx++];
      if (i < numSubPts) {
        const pt = subPts[i];
        item.bx = pt.x;
        item.by = pt.y + 38;
        item.rgb = subColor;
        item.size = 1.3;
      } else {
        // 余剰粒子：下部アンダーバーライン（X: -70 〜 +70, Y: +46）
        const frac = (i - numSubPts) / (MAX_SUBTEXT_PTS - numSubPts || 1);
        item.bx = -70 + frac * 140;
        item.by = 46;
        item.rgb = [Math.round(subColor[0] * 0.35), Math.round(subColor[1] * 0.35), Math.round(subColor[2] * 0.35)];
        item.size = 0.7;
      }
    }

    // ---------------------------------------------------------
    // 3. サイバーHUDフレーム ＆ サイドスキャナー
    // ---------------------------------------------------------
    for (let i = 0; i < MAX_FRAME_PTS; i++) {
      const item = templateBuffer[pIdx++];
      if (i < FRAME_PTS.length) {
        const fp = FRAME_PTS[i];
        item.bx = fp.x;
        item.by = fp.y;

        if (fp.type === 'corner') {
          item.rgb = [255, 230, 100];
          item.size = 1.5;
        } else if (fp.type === 'sideGrid') {
          const scanWave = Math.sin(curTime * 3.5 + fp.y * 0.1);
          const gridAlpha = scanWave > 0.3 ? 0.75 : 0.2;
          item.rgb = [
            Math.round(50 * gridAlpha),
            Math.round(180 * gridAlpha),
            Math.round(255 * gridAlpha)
          ];
          item.size = 1.0;
        } else {
          // メイン外枠：パルス発光
          const bWave = 0.75 + 0.25 * Math.sin(curTime * 2.0 + fp.x * 0.03 + fp.y * 0.03);
          item.rgb = [
            Math.round(30 * bWave),
            Math.round(140 * bWave),
            Math.round(230 * bWave)
          ];
          item.size = 1.2;
        }
      } else {
        item.bx = 0; item.by = -FH * 0.5; item.rgb = [0, 100, 200]; item.size = 0.7;
      }
    }

    // ---------------------------------------------------------
    // 4. ラウンドインジケーター（1/5 〜 5/5 の進行ドット：Y = -42）
    // ---------------------------------------------------------
    const numSlots = 5;
    const ptsPerSlot = Math.floor(MAX_INDICATOR_PTS / numSlots);

    for (let slot = 0; slot < numSlots; slot++) {
      const slotCenterX = -40 + slot * 20; // X: -40, -20, 0, 20, 40
      const slotCenterY = -42;
      const isCompleted = (currentNumberIdx >= slot);
      const isCurrent = (currentNumberIdx === slot);

      for (let k = 0; k < ptsPerSlot; k++) {
        const item = templateBuffer[pIdx++];
        const angle = (k / ptsPerSlot) * Math.PI * 2;
        const rad = 4.2;
        const px = slotCenterX + Math.cos(angle) * rad;
        const py = slotCenterY + Math.sin(angle) * rad;

        item.bx = px;
        item.by = py;

        if (isCurrent) {
          const pulse = Math.sin(curTime * 12) * 0.3 + 0.7;
          item.rgb = [255, Math.round(220 * pulse), 40];
          item.size = 1.6;
        } else if (isCompleted) {
          item.rgb = [0, 255, 180];
          item.size = 1.2;
        } else {
          item.rgb = [40, 60, 95];
          item.size = 0.8;
        }
      }
    }

    // ---------------------------------------------------------
    // 5. 正解発表時の花火・祝祭スパーク爆発エフェクト（画面内半径45px以内で美しく拡散）
    // ---------------------------------------------------------
    for (let s = 0; s < MAX_EFFECT_PTS; s++) {
      const item = templateBuffer[pIdx++];
      if (isSparkActive) {
        const seedAngle = (s * 137.5) * (Math.PI / 180);
        const speed = 12 + (s % 10) * 6;
        const dist = speed * Math.pow(sparkProgress, 0.7) * 0.75;
        const gravity = Math.pow(sparkProgress, 2.0) * 10;

        item.bx = Math.cos(seedAngle) * dist;
        item.by = Math.sin(seedAngle) * (dist * 0.55) - 4 + gravity;

        // ゴールド・レインボーの火花
        const colorMode = s % 4;
        let sColor = [255, 235, 60];
        if (colorMode === 1) sColor = [255, 100, 180];
        else if (colorMode === 2) sColor = [80, 240, 255];
        else if (colorMode === 3) sColor = [120, 255, 120];

        const fade = Math.max(0.08, 1.0 - sparkProgress * 0.85);
        item.rgb = [
          Math.round(sColor[0] * fade),
          Math.round(sColor[1] * fade),
          Math.round(sColor[2] * fade)
        ];
        item.size = Math.max(0.7, (2.2 - sparkProgress * 1.2));
      } else {
        // 非アクティブ時：HUD上部に待機する微細なエネルギードット
        const idleFrac = s / MAX_EFFECT_PTS;
        item.bx = -FW * 0.5 + idleFrac * FW;
        item.by = -FH * 0.5;
        item.rgb = [20, 60, 120];
        item.size = 0.7;
      }
    }

    return templateBuffer;
  }

  function buildStaticFlashAnzan() {
    return generateFlashAnzanTemplate(0);
  }

  if (typeof window !== 'undefined') {
    window.buildFlashAnzanParticles = buildStaticFlashAnzan;
    window.generateFlashAnzanTemplate = generateFlashAnzanTemplate;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildFlashAnzanParticles: buildStaticFlashAnzan,
      generateFlashAnzanTemplate: generateFlashAnzanTemplate
    };
  }

})(this);
