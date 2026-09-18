/**
 * 404.js - Lost Fragments / 404 Error Particle System
 * 
 * Halcyon デザインシステム準拠のデジタル・グリッチ＆ホログラフィック 404 粒子アート
 * - 3Dボクセル立体 404 タイポグラフィ（高密度5層レイヤー）
 * - RGB色収差・水平スキャンライン＆デジタルグリッチパルス
 * - サブテキスト「[ 404 : PAGE NOT FOUND ]」「DRIFTING IN THE VOID」
 * - サイバーHUDフレーム、オーディオウェーブ、周回ホログラフィックキューブ、星屑データダスト
 */

'use strict';

(function (root) {

  // --- ビットマップフォント (5x7) 定義 ---
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
    'C': [' ####', '#    ', '#    ', '#    ', '#    ', '#    ', ' ####'],
    'D': ['#### ', '#   #', '#   #', '#   #', '#   #', '#   #', '#### '],
    'E': ['#####', '#    ', '#### ', '#    ', '#    ', '#    ', '#####'],
    'F': ['#####', '#    ', '#### ', '#    ', '#    ', '#    ', '#    '],
    'G': [' ####', '#    ', '#  ##', '#   #', '#   #', '#   #', ' ### '],
    'I': [' ### ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
    'L': ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
    'N': ['#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'],
    'O': [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    'P': ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
    'R': ['#### ', '#   #', '#   #', '#### ', '#  # ', '#   #', '#   #'],
    'S': [' ####', '#    ', ' ### ', '    #', '    #', '#   #', ' ### '],
    'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
    'U': ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    'V': ['#   #', '#   #', '#   #', '#   #', '#   #', ' # # ', '  #  '],
    ' ': ['     ', '     ', '     ', '     ', '     ', '     ', '     '],
    '-': ['     ', '     ', '     ', ' ### ', '     ', '     ', '     '],
    ':': ['     ', '  #  ', '     ', '     ', '  #  ', '     ', '     '],
    '.': ['     ', '     ', '     ', '     ', '     ', '  #  ', '  #  '],
    '/': ['    #', '   # ', '   # ', '  #  ', ' #   ', ' #   ', '#    '],
    '[': [' ### ', ' #   ', ' #   ', ' #   ', ' #   ', ' #   ', ' ### '],
    ']': [' ### ', '   # ', '   # ', '   # ', '   # ', '   # ', ' ### ']
  };

  // 巨大な太字 404 グリッド (9x13)
  const BIG_4 = [
    '      ###',
    '     ####',
    '    ## ##',
    '   ##  ##',
    '  ##   ##',
    ' ##    ##',
    '#########',
    '#########',
    '       ##',
    '       ##',
    '       ##',
    '       ##',
    '       ##'
  ];

  const BIG_0 = [
    ' ####### ',
    '#########',
    '##     ##',
    '##     ##',
    '##     ##',
    '##     ##',
    '##     ##',
    '##     ##',
    '##     ##',
    '##     ##',
    '##     ##',
    '#########',
    ' ####### '
  ];

  // 疑似乱数シード
  function pseudoRandom(seed) {
    const x = Math.sin(seed * 9999.123 + 123.456) * 43758.5453;
    return x - Math.floor(x);
  }

  // --- 404 テンプレート生成関数 ---
  function generate404Template(time = 0) {
    const points = [];

    // グリッチ変調の計算（2.6秒周期で約0.22秒間のデジタルグリッチ）
    const glitchCycle = time % 2.6;
    const isGlitch = glitchCycle > 0.0 && glitchCycle < 0.24;
    const glitchIntensity = isGlitch ? Math.sin((glitchCycle / 0.24) * Math.PI) : 0.0;
    
    // スキャンライン（上から下へ周期的に通過）
    const scanlineY = ((time * 85) % 300) - 150;

    // 基本パラメータ
    const DOT_SPACING = 6.8;
    const DEPTH_LAYERS = 5; // 3D立体奥行きレイヤー数
    const LAYER_OFFSET_X = -2.8;
    const LAYER_OFFSET_Y = 2.8;

    // 1. 巨大「4 0 4」の立体ボクセル点群
    const chars = [
      { grid: BIG_4, offsetX: -116 },
      { grid: BIG_0, offsetX: -18 },
      { grid: BIG_4, offsetX: 80 }
    ];

    const topBaseY = -68;

    chars.forEach((charObj) => {
      const grid = charObj.grid;
      const rows = grid.length;
      const cols = grid[0].length;

      for (let r = 0; r < rows; r++) {
        const line = grid[r];
        for (let c = 0; c < cols; c++) {
          if (line[c] === '#') {
            const baseX = charObj.offsetX + c * DOT_SPACING;
            const baseY = topBaseY + r * DOT_SPACING;

            // スキャンラインによる発光強調
            const distToScan = Math.abs(baseY - scanlineY);
            const scanGlow = Math.max(0, 1.0 - distToScan / 22.0);

            // 水平グリッチ歪み
            let glitchOffsetX = 0;
            let glitchRGBShift = 0;
            if (isGlitch) {
              const rowNoise = pseudoRandom(r * 13 + Math.floor(time * 14));
              if (rowNoise > 0.38) {
                glitchOffsetX = (pseudoRandom(r * 37 + time) - 0.5) * 30 * glitchIntensity;
                glitchRGBShift = (pseudoRandom(r * 19) > 0.5 ? 1 : -1) * 12 * glitchIntensity;
              }
            }

            // 立体感を生み出す 3D レイヤー（奥から手前へ）
            for (let layer = 0; layer < DEPTH_LAYERS; layer++) {
              const layerFrac = layer / (DEPTH_LAYERS - 1); // 0(最奥) -> 1(最前面)
              const lx = baseX + layer * LAYER_OFFSET_X + glitchOffsetX;
              const ly = baseY + layer * LAYER_OFFSET_Y;

              let rgb;
              let size;

              if (layer === DEPTH_LAYERS - 1) {
                // --- 最前面（鮮やかな発光フェイス） ---
                if (glitchRGBShift !== 0) {
                  // グリッチ時の色収差 (シアン / マゼンタ分解)
                  if (glitchRGBShift > 0) {
                    rgb = [255, 50 + Math.floor(scanGlow * 205), 140]; // マゼンタ系
                  } else {
                    rgb = [30, 220 + Math.floor(scanGlow * 35), 255]; // シアン系
                  }
                } else {
                  // 通常時のグラデーション (左: ネオンピンク -> 中央: ホロバイオレット -> 右: エレクトリックシアン)
                  const gradT = (baseX + 116) / 232; // 0.0 〜 1.0
                  const rCol = Math.floor(255 * (1.0 - gradT * 0.75) + scanGlow * 50);
                  const gCol = Math.floor(70 * (1.0 - gradT) + 215 * gradT + scanGlow * 40);
                  const bCol = Math.floor(150 * (1.0 - gradT) + 255 * gradT);
                  
                  // スキャンライン通過時は白くスパーク
                  if (scanGlow > 0.65) {
                    rgb = [255, 255, 255];
                  } else {
                    rgb = [Math.min(255, rCol), Math.min(255, gCol), Math.min(255, bCol)];
                  }
                }
                size = scanGlow > 0.5 ? 2.8 : 2.4;
              } else {
                // --- 側面・奥行きシャドウ（サイバーインディゴ＆ディープパープル） ---
                const depthDarkness = 0.30 + layerFrac * 0.50;
                const rCol = Math.floor((110 * depthDarkness));
                const gCol = Math.floor((35 * depthDarkness));
                const bCol = Math.floor((220 * depthDarkness));
                rgb = [rCol, gCol, bCol];
                size = 1.5 + layerFrac * 0.5;
              }

              // 前面の微小な浮遊波打ち
              const breathe = Math.sin(time * 2.2 + baseX * 0.025) * 1.4;

              points.push({
                bx: lx + (layer === DEPTH_LAYERS - 1 ? glitchRGBShift : 0),
                by: ly + breathe,
                rgb: rgb,
                size: size,
                depth: layerFrac
              });
            }
          }
        }
      }
    });

    // 2. サブテキスト「[ 404 : NOT FOUND ]」をドットマトリクスで描画
    function drawSmallText(text, startX, startY, color, dotSize = 1.8, step = 3.4) {
      let curX = startX;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i].toUpperCase();
        const glyph = FONT_5X7[ch] || FONT_5X7[' '];
        for (let r = 0; r < 7; r++) {
          const rowStr = glyph[r];
          for (let c = 0; c < 5; c++) {
            if (rowStr[c] === '#') {
              const px = curX + c * step;
              const py = startY + r * step;
              
              // 微細な波打ち
              const waveY = Math.sin(time * 3.0 + px * 0.04) * 1.0;
              
              points.push({
                bx: px,
                by: py + waveY,
                rgb: color,
                size: dotSize
              });
            }
          }
        }
        curX += 6 * step;
      }
    }

    // 「[ 404 : NOT FOUND ]」
    const subText1 = '[ 404 : NOT FOUND ]';
    const subText1W = subText1.length * 6 * 3.4;
    drawSmallText(subText1, -subText1W * 0.5, 52, [255, 110, 175], 1.8, 3.4);

    // 「DRIFTING IN THE VOID」
    const subText2 = 'DRIFTING IN THE VOID';
    const subText2W = subText2.length * 6 * 2.5;
    drawSmallText(subText2, -subText2W * 0.5, 84, [80, 210, 255], 1.4, 2.5);

    // 3. デジタル・オーディオウェーブ / イコライザーバー（画面下部）
    const numBars = 23;
    const barSpacing = 11;
    const barStartX = -((numBars - 1) * barSpacing) * 0.5;
    const barBaseY = 118;
    for (let b = 0; b < numBars; b++) {
      const bx = barStartX + b * barSpacing;
      // 時間とインデックスに応じたバーの高さ
      const barHeight = Math.abs(Math.sin(time * 4.0 + b * 0.45) * Math.cos(time * 2.5 + b * 0.2)) * 16 + 3;
      const barDots = Math.floor(barHeight / 3.0);
      for (let d = 0; d <= barDots; d++) {
        const by = barBaseY - d * 3.2;
        const frac = d / Math.max(1, barDots);
        const col = frac > 0.8 ? [255, 255, 255] : (frac > 0.4 ? [255, 100, 180] : [40, 200, 255]);
        points.push({
          bx: bx,
          by: by,
          rgb: col,
          size: 1.4
        });
      }
    }

    // 4. ホログラフィック・コーナーブラケット（画面端の角括弧フレーム）
    const frameW = 168;
    const frameH = 132;
    const corners = [
      { x: -frameW, y: -frameH, dx: 1, dy: 1 },
      { x:  frameW, y: -frameH, dx: -1, dy: 1 },
      { x: -frameW, y:  frameH, dx: 1, dy: -1 },
      { x:  frameW, y:  frameH, dx: -1, dy: -1 }
    ];

    corners.forEach(corner => {
      const armLen = 24;
      const step = 3.6;
      for (let s = 0; s <= armLen; s += step) {
        // 水平腕
        points.push({
          bx: corner.x + s * corner.dx,
          by: corner.y,
          rgb: [70, 190, 255],
          size: 1.6
        });
        // 垂直腕
        if (s > 0) {
          points.push({
            bx: corner.x,
            by: corner.y + s * corner.dy,
            rgb: [70, 190, 255],
            size: 1.6
          });
        }
      }
    });

    // 5. 周囲を浮遊・周回するホログラフィック・データキューブ（4個）
    const numCubes = 4;
    for (let cb = 0; cb < numCubes; cb++) {
      const orbitSpeed = 0.5 + cb * 0.25;
      const orbitAngle = time * orbitSpeed + (cb * (Math.PI * 2 / numCubes));
      const orbitRadX = 152 + Math.sin(time * 0.7 + cb) * 22;
      const orbitRadY = 70 + Math.cos(time * 0.6 + cb) * 16;
      
      const cubeCenterX = Math.cos(orbitAngle) * orbitRadX;
      const cubeCenterY = Math.sin(orbitAngle) * orbitRadY - 12;
      
      // キューブ自体の回転
      const rotX = time * 1.6 + cb * 1.2;
      const rotY = time * 1.9 + cb * 2.1;
      const cubeSize = 9 + (cb % 2) * 3;

      // 8頂点
      const vertices = [
        [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1],
        [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1]
      ];

      // 12本の辺
      const edges = [
        [0,1], [1,2], [2,3], [3,0],
        [4,5], [5,6], [6,7], [7,4],
        [0,4], [1,5], [2,6], [3,7]
      ];

      // 頂点回転変換
      const transformedVerts = vertices.map(v => {
        let x = v[0] * cubeSize;
        let y = v[1] * cubeSize;
        let z = v[2] * cubeSize;

        // Y回転
        let cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        let x1 = x * cosY + z * sinY;
        let z1 = -x * sinY + z * cosY;

        // X回転
        let cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
      });

      // 辺上の点群
      const cubeColor = (cb % 3 === 0) ? [255, 90, 180] : ((cb % 3 === 1) ? [40, 240, 255] : [255, 215, 70]);
      edges.forEach(edge => {
        const vA = transformedVerts[edge[0]];
        const vB = transformedVerts[edge[1]];
        const edgeSteps = 4;
        for (let s = 0; s <= edgeSteps; s++) {
          const tFrac = s / edgeSteps;
          const px = cubeCenterX + vA.x + (vB.x - vA.x) * tFrac;
          const py = cubeCenterY + vA.y + (vB.y - vA.y) * tFrac;
          points.push({
            bx: px,
            by: py,
            rgb: cubeColor,
            size: 1.5
          });
        }
      });
    }

    // 6. 漂流する微細データダスト（星屑・浮遊グリッチピクセル）
    const numDust = 150;
    for (let d = 0; d < numDust; d++) {
      const dSeed = d * 17.13;
      const angle = pseudoRandom(dSeed) * Math.PI * 2;
      const dist = 25 + pseudoRandom(dSeed + 1) * 170;
      const driftSpeed = 0.2 + pseudoRandom(dSeed + 2) * 0.7;
      
      const px = Math.cos(angle + time * driftSpeed * 0.2) * dist;
      const py = Math.sin(angle + time * driftSpeed * 0.3) * (dist * 0.75);
      
      const twinkle = Math.sin(time * 4.0 + d) * 0.5 + 0.5;
      if (twinkle > 0.15) {
        const colType = Math.floor(pseudoRandom(dSeed + 3) * 3);
        const col = colType === 0 ? [255, 120, 200] : (colType === 1 ? [60, 220, 255] : [255, 255, 255]);
        points.push({
          bx: px,
          by: py,
          rgb: col,
          size: 1.0 + twinkle * 1.3
        });
      }
    }

    return points;
  }

  // グローバル公開
  if (typeof window !== 'undefined') {
    window.generate404Template = generate404Template;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generate404Template };
  }

})(typeof window !== 'undefined' ? window : global);
