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
    'B': ['#### ', '#   #', '#   #', '#### ', '#   #', '#   #', '#### '],
    'C': [' ####', '#    ', '#    ', '#    ', '#    ', '#    ', ' ####'],
    'D': ['#### ', '#   #', '#   #', '#   #', '#   #', '#   #', '#### '],
    'E': ['#####', '#    ', '#### ', '#    ', '#    ', '#    ', '#####'],
    'F': ['#####', '#    ', '#### ', '#    ', '#    ', '#    ', '#    '],
    'G': [' ####', '#    ', '#  ##', '#   #', '#   #', '#   #', ' ### '],
    'H': ['#   #', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
    'I': [' ### ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
    'K': ['#   #', '#  # ', '# #  ', '##   ', '# #  ', '#  # ', '#   #'],
    'L': ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
    'M': ['#   #', '## ##', '# # #', '# # #', '#   #', '#   #', '#   #'],
    'N': ['#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'],
    'O': [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    'P': ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
    'R': ['#### ', '#   #', '#   #', '#### ', '#  # ', '#   #', '#   #'],
    'S': [' ####', '#    ', ' ### ', '    #', '    #', '#   #', ' ### '],
    'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
    'U': ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
    'V': ['#   #', '#   #', '#   #', '#   #', '#   #', ' # # ', '  #  '],
    '<': ['   # ', '  #  ', ' #   ', '#    ', ' #   ', '  #  ', '   # '],
    '>': [' #   ', '  #  ', '   # ', '    #', '   # ', '  #  ', ' #   '],
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


  // --- 3D幾何変換および漂流遺物メッシュジェネレーター群 ---
  function rotate3D(x, y, z, rx, ry, rz) {
    // X軸回転
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    // Y軸回転
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;
    // Z軸回転
    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;
    return { x: x3, y: y3, z: z2 };
  }

  const DRIFT_ITEM_POINTS = 170; // 全アイテム共通の固定頂点数（パーティクル補間の安定性を100%保証）

  // 高密度 170点メッシュ定義（全22種・動的アニメーション対応）
  
  // 0. テトラポッド（消波ブロック）: 170点
  function generateTetrapodMesh(time = 0) {
    const pts = [];
    const tetraAxes = [
      { x:  0.000, y:  1.000, z:  0.000 },
      { x:  0.000, y: -0.333, z:  0.943 },
      { x: -0.816, y: -0.333, z: -0.471 },
      { x:  0.816, y: -0.333, z: -0.471 }
    ];
    const armLen = 22;

    tetraAxes.forEach((axis) => {
      let perp = Math.abs(axis.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
      let ux = axis.y * perp.z - axis.z * perp.y;
      let uy = axis.z * perp.x - axis.x * perp.z;
      let uz = axis.x * perp.y - axis.y * perp.x;
      const uLen = Math.hypot(ux, uy, uz);
      ux /= uLen; uy /= uLen; uz /= uLen;
      let vx = axis.y * uz - axis.z * uy;
      let vy = axis.z * ux - axis.x * uz;
      let vz = axis.x * uy - axis.y * ux;

      // 4層リング × 8点 = 32点
      for (let r = 1; r <= 4; r++) {
        const frac = r / 4;
        const dist = frac * armLen;
        const rad = 3.6 + frac * 2.8;
        for (let p = 0; p < 8; p++) {
          const ang = (p / 8) * Math.PI * 2;
          pts.push({
            x: axis.x * dist + (ux * Math.cos(ang) + vx * Math.sin(ang)) * rad,
            y: axis.y * dist + (uy * Math.cos(ang) + vy * Math.sin(ang)) * rad,
            z: axis.z * dist + (uz * Math.cos(ang) + vz * Math.sin(ang)) * rad,
            rgb: [165, 195, 230],
            size: 1.4
          });
        }
      }
      // 先端ドームキャップ 4点
      for (let cp = 0; cp < 4; cp++) {
        const ang = (cp / 4) * Math.PI * 2;
        pts.push({
          x: axis.x * (armLen + 2.5) + ux * Math.cos(ang) * 2.4,
          y: axis.y * (armLen + 2.5) + uy * Math.cos(ang) * 2.4,
          z: axis.z * (armLen + 2.5) + uz * Math.cos(ang) * 2.4,
          rgb: [185, 215, 245],
          size: 1.5
        });
      }
    }); // 4脚 × (32 + 4) = 144点

    // 中心結合球コア 26点
    for (let c = 0; c < 26; c++) {
      const phi = Math.acos(-1 + (2 * c) / 25);
      const theta = Math.sqrt(26 * Math.PI) * phi;
      pts.push({
        x: Math.cos(theta) * Math.sin(phi) * 4.8,
        y: Math.sin(theta) * Math.sin(phi) * 4.8,
        z: Math.cos(phi) * 4.8,
        rgb: [135, 170, 205],
        size: 1.35
      });
    } // 144 + 26 = 170点
    return pts;
  }

  // 1. 三角コーン（工事用パイロン）: 170点
  function generateTrafficConeMesh(time = 0) {
    const pts = [];
    const baseW = 24, halfBW = 12, baseY = 16;
    
    // 黒い四角台座（外枠 32点 ＋ 内枠 16点）: 48点
    for (let s = 0; s < 32; s++) {
      let bx, bz;
      if (s < 9) { bx = -halfBW + (s / 8) * baseW; bz = -halfBW; }
      else if (s < 17) { bx = halfBW; bz = -halfBW + ((s - 8) / 8) * baseW; }
      else if (s < 25) { bx = halfBW - ((s - 16) / 8) * baseW; bz = halfBW; }
      else { bx = -halfBW; bz = halfBW - ((s - 24) / 8) * baseW; }
      pts.push({ x: bx, y: baseY, z: bz, rgb: [55, 60, 75], size: 1.4 });
    }
    for (let s = 0; s < 16; s++) {
      let bx, bz;
      const innerW = 16, halfIW = 8;
      if (s < 5) { bx = -halfIW + (s / 4) * innerW; bz = -halfIW; }
      else if (s < 9) { bx = halfIW; bz = -halfIW + ((s - 4) / 4) * innerW; }
      else if (s < 13) { bx = halfIW - ((s - 8) / 4) * innerW; bz = halfIW; }
      else { bx = -halfIW; bz = halfIW - ((s - 12) / 4) * innerW; }
      pts.push({ x: bx, y: baseY - 1.0, z: bz, rgb: [70, 75, 90], size: 1.35 });
    } // 48点

    // コーン本体円錐（7層リング × 16点）: 112点
    const coneHeight = 36;
    const rings = [
      { frac: 0.05, rad: 9.6, col: [255, 95, 30], size: 1.4 },
      { frac: 0.20, rad: 8.2, col: [255, 95, 30], size: 1.4 },
      { frac: 0.38, rad: 6.6, col: [255, 255, 255], size: 1.6 },
      { frac: 0.52, rad: 5.3, col: [255, 255, 255], size: 1.6 },
      { frac: 0.68, rad: 3.9, col: [255, 95, 30], size: 1.4 },
      { frac: 0.82, rad: 2.7, col: [255, 255, 255], size: 1.55 },
      { frac: 0.94, rad: 1.6, col: [255, 95, 30], size: 1.4 }
    ];
    rings.forEach(ring => {
      const cy = baseY - ring.frac * coneHeight;
      for (let p = 0; p < 16; p++) {
        const ang = (p / 16) * Math.PI * 2;
        pts.push({
          x: Math.cos(ang) * ring.rad,
          y: cy,
          z: Math.sin(ang) * ring.rad,
          rgb: ring.col,
          size: ring.size
        });
      }
    }); // 112点

    // 先端キャップ 10点
    const tipY = baseY - coneHeight - 1.5;
    for (let tp = 0; tp < 8; tp++) {
      const ang = (tp / 8) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * 0.9, y: tipY, z: Math.sin(ang) * 0.9, rgb: [255, 110, 45], size: 1.4 });
    }
    pts.push({ x: 0, y: tipY - 1.0, z: 0, rgb: [255, 130, 60], size: 1.6 });
    pts.push({ x: 0, y: tipY - 2.0, z: 0, rgb: [255, 150, 80], size: 1.5 });
    return pts; // 48 + 112 + 10 = 170点
  }

  // 2. マンホールの蓋: 170点（蒸気・スチームの立ち上りアニメーション付き）
  function generateManholeMesh(time = 0) {
    const pts = [];
    // 外枠リング 2層: 36点 + 28点 = 64点
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 17.5, y: 0, z: Math.sin(a) * 17.5, rgb: [130, 135, 145], size: 1.45 });
    }
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 15.0, y: 0.2, z: Math.sin(a) * 15.0, rgb: [110, 115, 125], size: 1.35 });
    }
    // 中間同心円 2層: 24点 + 16点 = 40点
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 11.5, y: 0.4, z: Math.sin(a) * 11.5, rgb: [95, 100, 110], size: 1.35 });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 7.5, y: 0.5, z: Math.sin(a) * 7.5, rgb: [90, 95, 105], size: 1.3 });
    }
    // 8方向放射リブ格子: 8本 × 4点 = 32点
    for (let dir = 0; dir < 8; dir++) {
      const a = dir * (Math.PI / 4);
      for (let step = 1; step <= 4; step++) {
        const d = 3.0 + step * 2.8;
        pts.push({ x: Math.cos(a) * d, y: 0.6, z: Math.sin(a) * d, rgb: [150, 155, 165], size: 1.3 });
      }
    }
    // 中心紋章（市章）8点
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 3.2, y: 0.8, z: Math.sin(a) * 3.2, rgb: [180, 185, 200], size: 1.45 });
    }
    // 蒸気・スチーム微粒子（隙間からゆらゆら昇華するアニメーション）: 26点
    for (let s = 0; s < 26; s++) {
      const steamPhase = (s / 26 + time * 0.45) % 1.0;
      const steamY = -0.5 - Math.pow(steamPhase, 1.2) * 18.0;
      const spread = Math.sin(s * 3.1 + time * 2.0) * (1.0 + steamPhase * 5.0);
      const depth = Math.cos(s * 2.7 + time * 1.8) * (1.0 + steamPhase * 5.0);
      const alpha = Math.max(0.15, 1.0 - steamPhase);
      pts.push({
        x: spread,
        y: steamY,
        z: depth,
        rgb: [Math.floor(200 * alpha + 55), Math.floor(220 * alpha + 35), Math.floor(245 * alpha + 10)],
        size: 1.1 + steamPhase * 1.3
      });
    } // 64 + 40 + 32 + 8 + 26 = 170点
    return pts;
  }

  // 3. 消火栓: 170点
  function generateFireHydrantMesh(time = 0) {
    const pts = [];
    // 底面フランジ台座 2層: 20点 + 16点 = 36点
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 9.5, y: 16, z: Math.sin(a) * 9.5, rgb: [170, 30, 30], size: 1.4 });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 8.2, y: 14, z: Math.sin(a) * 8.2, rgb: [195, 35, 35], size: 1.4 });
    }
    // 主円筒胴体 4層 × 16点 = 64点
    [-8, -2, 4, 10].forEach(yPos => {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        pts.push({ x: Math.cos(a) * 6.8, y: yPos, z: Math.sin(a) * 6.8, rgb: [245, 45, 45], size: 1.5 });
      }
    });
    // 左右放水口ノズル＆キャップ 2基: 各17点 × 2 = 34点
    [-1, 1].forEach(side => {
      for (let p = 0; p < 9; p++) {
        const a = (p / 9) * Math.PI * 2;
        pts.push({ x: side * (8.5 + Math.cos(a) * 2.2), y: 0 + Math.sin(a) * 2.2, z: side * 1.5, rgb: [240, 215, 110], size: 1.45 });
      }
      for (let p = 0; p < 8; p++) {
        const a = (p / 8) * Math.PI * 2;
        pts.push({ x: side * (11.0 + Math.cos(a) * 1.4), y: 0 + Math.sin(a) * 1.4, z: side * 1.5, rgb: [255, 235, 140], size: 1.5 });
      }
    });
    // 上部ドーム天頂＆五角形ボルトヘッド: 24点 + 12点 = 36点
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 5.0, y: -12.5, z: Math.sin(a) * 5.0, rgb: [225, 40, 40], size: 1.5 });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 3.0, y: -15.0, z: Math.sin(a) * 3.0, rgb: [210, 35, 35], size: 1.5 });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 1.6, y: -17.5, z: Math.sin(a) * 1.6, rgb: [255, 225, 120], size: 1.6 });
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 0.8, y: -19.0, z: Math.sin(a) * 0.8, rgb: [255, 245, 160], size: 1.6 });
    }
    return pts; // 36 + 64 + 34 + 36 = 170点
  }

  // 4. 道路鋲（キャッツアイ）: 170点（琥珀色リフレクターのパルス点滅）
  function generateCatsEyeMesh(time = 0) {
    const pts = [];
    const w = 22, halfW = 11, h = 18, halfH = 9;
    // アルミ合金ベース外周 2層: 36点 + 28点 = 64点
    for (let s = 0; s < 36; s++) {
      let bx, bz;
      if (s < 10) { bx = -halfW + (s / 10) * w; bz = -halfH; }
      else if (s < 18) { bx = halfW; bz = -halfH + ((s - 10) / 8) * h; }
      else if (s < 28) { bx = halfW - ((s - 18) / 10) * w; bz = halfH; }
      else { bx = -halfW; bz = halfH - ((s - 28) / 8) * h; }
      pts.push({ x: bx, y: 3.5, z: bz, rgb: [135, 140, 150], size: 1.4 });
    }
    for (let s = 0; s < 28; s++) {
      let bx, bz;
      if (s < 8) { bx = -8.5 + (s / 8) * 17; bz = -6.5; }
      else if (s < 14) { bx = 8.5; bz = -6.5 + ((s - 8) / 6) * 13; }
      else if (s < 22) { bx = 8.5 - ((s - 14) / 8) * 17; bz = 6.5; }
      else { bx = -8.5; bz = 6.5 - ((s - 22) / 6) * 13; }
      pts.push({ x: bx, y: 1.5, z: bz, rgb: [160, 165, 175], size: 1.35 });
    } // 64点
    
    // 傾斜面＆天頂ドーム: 24点 + 16点 = 40点
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 6.5, y: -0.5, z: Math.sin(a) * 4.5, rgb: [175, 180, 190], size: 1.35 });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 3.5, y: -2.0, z: Math.sin(a) * 2.5, rgb: [195, 200, 215], size: 1.4 });
    } // 40点

    // 高輝度琥珀色レンズ（前後2面 × 28点 ＝ 56点）：明暗の呼吸パルス
    const amberPulse = 0.8 + Math.sin(time * 3.5) * 0.2;
    [-4.2, 4.2].forEach(zSide => {
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 14; col++) {
          const frac = (col / 13) - 0.5;
          const isCore = col >= 4 && col <= 9;
          const rCol = isCore ? 255 : Math.floor(240 * amberPulse);
          const gCol = isCore ? Math.floor(220 * amberPulse) : Math.floor(160 * amberPulse);
          pts.push({
            x: frac * 15,
            y: -1.2 + row * 1.8,
            z: zSide,
            rgb: [rCol, gCol, 40],
            size: isCore ? 1.75 : 1.45
          });
        }
      }
    }); // 56点

    // アンカー固定ボルト 10点
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 1.5, y: -3.0, z: Math.sin(a) * 1.0, rgb: [255, 255, 255], size: 1.6 });
    } // 64 + 40 + 56 + 10 = 170点
    return pts;
  }

  // 5. 電柱の変圧器（トランス）: 170点（青白プラズマ放電スパーク付き）
  function generateTransformerMesh(time = 0) {
    const pts = [];
    // 円筒タンク本体 4層 × 18点 = 72点
    [-11, -4, 3, 10].forEach(yPos => {
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        pts.push({ x: Math.cos(a) * 8.5, y: yPos, z: Math.sin(a) * 8.5, rgb: [135, 140, 150], size: 1.45 });
      }
    }); // 72点

    // 上蓋＆吊り下げブラケット: 20点 + 14点 = 34点
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 9.2, y: -13.5, z: Math.sin(a) * 9.2, rgb: [170, 175, 185], size: 1.5 });
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 5.5, y: -21.0, z: Math.sin(a) * 5.5, rgb: [110, 115, 125], size: 1.35 });
    } // 34点

    // 上部高圧碍子（白い段々コーン 3本 × 16点 = 48点）
    [-5.5, 0, 5.5].forEach(xOffset => {
      for (let layer = 0; layer < 4; layer++) {
        const rad = 2.4 - layer * 0.45;
        for (let p = 0; p < 4; p++) {
          const a = (p / 4) * Math.PI * 2;
          pts.push({
            x: xOffset + Math.cos(a) * rad,
            y: -15.0 - layer * 1.5,
            z: Math.sin(a) * rad,
            rgb: [240, 245, 255],
            size: 1.45
          });
        }
      }
    }); // 48点

    // 碍子先端の青白放電スパーク（チチッと走る電気火花）: 16点
    for (let sp = 0; sp < 16; sp++) {
      const sparkAng = sp * 2.1 + time * 12.0;
      const sparkDist = 1.0 + Math.sin(sp * 1.7 + time * 18.0) * 4.0;
      const xSrc = (sp % 3 === 0) ? -5.5 : ((sp % 3 === 1) ? 0 : 5.5);
      const isBright = Math.sin(time * 15.0 + sp) > 0.3;
      pts.push({
        x: xSrc + Math.cos(sparkAng) * sparkDist,
        y: -21.5 + Math.sin(sparkAng * 2.0) * 2.0,
        z: Math.sin(sparkAng) * sparkDist,
        rgb: isBright ? [200, 245, 255] : [70, 180, 255],
        size: isBright ? 1.8 : 1.2
      });
    } // 72 + 34 + 48 + 16 = 170点
    return pts;
  }

  // 6. 踏切の警報機: 170点（左右交互点滅アニメーション付き）
  function generateRailroadSignalMesh(time = 0) {
    const pts = [];
    // 垂直支柱ポール: 24点
    for (let p = 0; p < 24; p++) {
      pts.push({ x: 0, y: -20 + p * 1.8, z: 0, rgb: [95, 100, 110], size: 1.45 });
    } // 24点

    // X字クロス踏切標識（黄黒トラ縞）2本の斜め腕 × 各30点 = 60点
    [-1, 1].forEach(sign => {
      for (let s = 0; s < 30; s++) {
        const frac = (s / 29) - 0.5;
        const isYellow = (s % 2 === 0);
        pts.push({
          x: frac * 28,
          y: -15 + frac * 18 * sign,
          z: 1.2,
          rgb: isYellow ? [255, 215, 0] : [35, 35, 40],
          size: 1.5
        });
      }
    }); // 60点

    // 左右警報灯（各26点 ＝ 52点）：左右交互点滅
    const blinkPhase = Math.sin(time * 5.0);
    const leftActive = blinkPhase > 0;

    [-9.5, 9.5].forEach((xSide, sIdx) => {
      const isLit = (sIdx === 0) ? leftActive : !leftActive;
      const glowFrac = isLit ? 1.0 : 0.22;

      // 外枠リング 16点
      for (let r = 0; r < 16; r++) {
        const ang = (r / 16) * Math.PI * 2;
        pts.push({
          x: xSide + Math.cos(ang) * 4.6,
          y: 2.0 + Math.sin(ang) * 4.6,
          z: 2.2,
          rgb: [Math.floor(240 * glowFrac), Math.floor(35 * glowFrac), Math.floor(35 * glowFrac)],
          size: isLit ? 1.6 : 1.25
        });
      }
      // 中心発光コア 10点
      for (let c = 0; c < 10; c++) {
        const ang = (c / 10) * Math.PI * 2;
        pts.push({
          x: xSide + Math.cos(ang) * 2.2,
          y: 2.0 + Math.sin(ang) * 2.2,
          z: 2.8,
          rgb: isLit ? [255, 140, 140] : [90, 15, 15],
          size: isLit ? 2.1 : 1.1
        });
      }
    }); // 52点

    // 日除け庇シェード 2基: 各17点 × 2 = 34点
    [-9.5, 9.5].forEach(xSide => {
      for (let s = 0; s < 17; s++) {
        const frac = (s / 16) * Math.PI;
        pts.push({
          x: xSide - Math.cos(frac) * 5.2,
          y: -1.2 - Math.sin(frac) * 2.6,
          z: 3.5,
          rgb: [50, 55, 65],
          size: 1.45
        });
      }
    }); // 34点 -> 合計 24 + 60 + 52 + 34 = 170点
    return pts;
  }

  // 7. 「立入禁止」看板: 170点
  function generateNoEntrySignMesh(time = 0) {
    const pts = [];
    // 支柱スタンド 2本: 左右各14点 = 28点
    [-6, 6].forEach(xSide => {
      for (let p = 0; p < 14; p++) {
        pts.push({ x: xSide, y: 7 + p * 1.5, z: -0.5, rgb: [100, 105, 115], size: 1.4 });
      }
    }); // 28点

    // 四角看板ボード（外枠 34点 ＋ 内枠 24点）: 58点
    const w = 24, halfW = 12, h = 30, halfH = 15, centerY = -6;
    for (let s = 0; s < 34; s++) {
      let px, py;
      if (s < 10) { px = -halfW + (s / 10) * w; py = centerY - halfH; }
      else if (s < 17) { px = halfW; py = centerY - halfH + ((s - 10) / 7) * h; }
      else if (s < 27) { px = halfW - ((s - 17) / 10) * w; py = centerY + halfH; }
      else { px = -halfW; py = centerY + halfH - ((s - 27) / 7) * h; }
      pts.push({ x: px, y: py, z: 0, rgb: [245, 235, 90], size: 1.45 });
    }
    for (let s = 0; s < 24; s++) {
      let px, py;
      if (s < 7) { px = -10 + (s / 7) * 20; py = centerY - 13; }
      else if (s < 12) { px = 10; py = centerY - 13 + ((s - 7) / 5) * 26; }
      else if (s < 19) { px = 10 - ((s - 12) / 7) * 20; py = centerY + 13; }
      else { px = -10; py = centerY + 13 - ((s - 19) / 5) * 26; }
      pts.push({ x: px, y: py, z: 0.2, rgb: [220, 210, 80], size: 1.35 });
    } // 58点

    // 進入禁止赤丸 2層: 28点 + 20点 = 48点
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 8.5, y: centerY + Math.sin(a) * 8.5, z: 0.6, rgb: [255, 35, 35], size: 1.55 });
    }
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 6.8, y: centerY + Math.sin(a) * 6.8, z: 0.7, rgb: [230, 25, 25], size: 1.5 });
    } // 48点

    // 中央白横バー 2層: 20点 + 16点 = 36点
    [-1.0, 1.0].forEach(yOff => {
      for (let p = 0; p < 18; p++) {
        const f = (p / 17) - 0.5;
        pts.push({ x: f * 12.5, y: centerY + yOff, z: 0.9, rgb: [255, 255, 255], size: 1.6 });
      }
    }); // 36点 -> 合計 28 + 58 + 48 + 36 = 170点
    return pts;
  }

  // 8. コインパーキングのロック板: 170点（青色LEDインジケーターの明滅）
  function generateParkingLockMesh(time = 0) {
    const pts = [];
    const baseW = 26, halfBW = 13, baseL = 26, halfBL = 13;
    // 地面固定ベース枠 2層: 36点 + 24点 = 60点
    for (let s = 0; s < 36; s++) {
      let bx, bz;
      if (s < 10) { bx = -halfBW + (s / 10) * baseW; bz = -halfBL; }
      else if (s < 18) { bx = halfBW; bz = -halfBL + ((s - 10) / 8) * baseL; }
      else if (s < 28) { bx = halfBW - ((s - 18) / 10) * baseW; bz = halfBL; }
      else { bx = -halfBW; bz = halfBL - ((s - 28) / 8) * baseL; }
      pts.push({ x: bx, y: 6, z: bz, rgb: [240, 195, 25], size: 1.4 });
    }
    for (let s = 0; s < 24; s++) {
      let bx, bz;
      if (s < 7) { bx = -10 + (s / 7) * 20; bz = -10; }
      else if (s < 12) { bx = 10; bz = -10 + ((s - 7) / 5) * 20; }
      else if (s < 19) { bx = 10 - ((s - 12) / 7) * 20; bz = 10; }
      else { bx = -10; bz = 10 - ((s - 19) / 5) * 20; }
      pts.push({ x: bx, y: 5.5, z: bz, rgb: [100, 105, 115], size: 1.35 });
    } // 60点

    // 跳ね上がりフラップ板（6×12グリッド）: 72点
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 12; col++) {
        const u = (col / 11) - 0.5;
        const v = row / 5;
        const isWarn = (row === 5 || col === 0 || col === 11);
        pts.push({
          x: u * 19,
          y: 5.5 - v * 14.5,
          z: -4 + v * 12.5,
          rgb: isWarn ? [255, 215, 20] : [160, 165, 175],
          size: 1.45
        });
      }
    } // 72点

    // 回転ヒンジシャフト 18点
    for (let i = 0; i < 18; i++) {
      const f = (i / 17) - 0.5;
      pts.push({ x: f * 20, y: 5.0, z: -4.0, rgb: [70, 75, 85], size: 1.5 });
    } // 18点

    // 超音波センサー＆青色LEDインジケーター（呼吸点滅）: 20点
    const ledPulse = 0.6 + Math.sin(time * 3.0) * 0.4;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push({
        x: Math.cos(a) * 2.2,
        y: -10.0,
        z: 9.0 + Math.sin(a) * 2.2,
        rgb: [Math.floor(40 * ledPulse), Math.floor(160 * ledPulse), 255],
        size: 1.8
      });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 1.0, y: -10.5, z: 9.0 + Math.sin(a) * 1.0, rgb: [220, 245, 255], size: 1.9 });
    } // 20点 -> 合計 60 + 72 + 18 + 20 = 170点
    return pts;
  }

  // 9. 街路灯: 170点（淡い光条アニメーション）
  function generateStreetlightMesh(time = 0) {
    const pts = [];
    // 垂直ポール支柱: 34点
    for (let p = 0; p < 34; p++) {
      pts.push({ x: -7, y: 18 - p * 1.2, z: 0, rgb: [120, 125, 135], size: 1.4 });
    } // 34点

    // 上部湾曲アーチアーム 2層: 24点 + 18点 = 42点
    for (let a = 0; a < 24; a++) {
      const frac = a / 23;
      const ang = frac * (Math.PI * 0.58);
      pts.push({ x: -7 + Math.sin(ang) * 16, y: -18.5 - Math.cos(ang) * 6.5, z: 0, rgb: [140, 145, 155], size: 1.45 });
    }
    for (let a = 0; a < 18; a++) {
      const frac = a / 17;
      const ang = frac * (Math.PI * 0.58);
      pts.push({ x: -7 + Math.sin(ang) * 15, y: -19.8 - Math.cos(ang) * 6.0, z: 0, rgb: [115, 120, 130], size: 1.35 });
    } // 42点

    // ランプフード傘 2層: 20点 + 14点 = 34点
    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * Math.PI * 2;
      pts.push({ x: 8.5 + Math.cos(ang) * 5.8, y: -23.0, z: Math.sin(ang) * 3.8, rgb: [50, 70, 80], size: 1.45 });
    }
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      pts.push({ x: 8.5 + Math.cos(ang) * 4.2, y: -24.2, z: Math.sin(ang) * 2.8, rgb: [65, 85, 95], size: 1.4 });
    } // 34点

    // 発光LEDレンズ 2層: 18点 + 12点 = 30点
    const lampGlow = 0.85 + Math.sin(time * 2.2) * 0.15;
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      pts.push({
        x: 8.5 + Math.cos(ang) * 4.0,
        y: -21.8,
        z: Math.sin(ang) * 2.6,
        rgb: [Math.floor(230 * lampGlow), Math.floor(250 * lampGlow), 255],
        size: 1.8
      });
    }
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      pts.push({
        x: 8.5 + Math.cos(ang) * 2.2,
        y: -21.2,
        z: Math.sin(ang) * 1.4,
        rgb: [255, 255, 255],
        size: 2.0
      });
    } // 30点

    // 下方への光条コーン（光のシャワー粒子）: 30点
    for (let d = 0; d < 30; d++) {
      const beamPhase = (d / 30 + time * 0.35) % 1.0;
      const by = -20.5 + beamPhase * 36;
      const spread = 2.0 + beamPhase * 11;
      const ang = d * 1.37;
      const alpha = Math.max(0.2, (1.0 - beamPhase) * lampGlow);
      pts.push({
        x: 8.5 + Math.cos(ang) * spread,
        y: by,
        z: Math.sin(ang) * spread * 0.6,
        rgb: [Math.floor(180 * alpha), Math.floor(235 * alpha), Math.floor(255 * alpha)],
        size: 1.0 + (1.0 - beamPhase) * 0.8
      });
    } // 30点 -> 合計 34 + 42 + 34 + 30 + 30 = 170点
    return pts;
  }

  // 10. 火災報知器ボックス: 170点（上部赤色表示灯の鼓動点滅）
  function generateFireAlarmBoxMesh(time = 0) {
    const pts = [];
    const w = 22, halfW = 11, h = 30, halfH = 15;
    // 赤い筐体外枠 2層: 36点 + 28点 = 64点
    for (let s = 0; s < 36; s++) {
      let px, py;
      if (s < 10) { px = -halfW + (s / 10) * w; py = -halfH; }
      else if (s < 18) { px = halfW; py = -halfH + ((s - 10) / 8) * h; }
      else if (s < 28) { px = halfW - ((s - 18) / 10) * w; py = halfH; }
      else { px = -halfW; py = halfH - ((s - 28) / 8) * h; }
      pts.push({ x: px, y: py, z: 0, rgb: [225, 35, 35], size: 1.45 });
    }
    for (let s = 0; s < 28; s++) {
      let px, py;
      if (s < 8) { px = -9 + (s / 8) * 18; py = -12; }
      else if (s < 14) { px = 9; py = -12 + ((s - 8) / 6) * 24; }
      else if (s < 22) { px = 9 - ((s - 14) / 8) * 18; py = 12; }
      else { px = -9; py = 12 - ((s - 22) / 6) * 24; }
      pts.push({ x: px, y: py, z: 0.3, rgb: [195, 30, 30], size: 1.35 });
    }
    // 中央非常ボタン保護リング 2層: 24点 + 16点 = 40点
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 5.2, y: 2.0 + Math.sin(a) * 5.2, z: 0.8, rgb: [255, 255, 255], size: 1.5 });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 3.8, y: 2.0 + Math.sin(a) * 3.8, z: 1.0, rgb: [220, 220, 220], size: 1.4 });
    }
    // 中央押しボタン（赤・凸）: 16点 + 10点 = 26点
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 2.2, y: 2.0 + Math.sin(a) * 2.2, z: 1.5, rgb: [255, 40, 40], size: 1.6 });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 1.0, y: 2.0 + Math.sin(a) * 1.0, z: 1.8, rgb: [255, 80, 80], size: 1.7 });
    }
    // 上部赤色表示灯（常時点灯LEDランプ：鼓動のように脈打つ）2層: 24点 + 16点 = 40点
    const lampPulse = 0.7 + Math.sin(time * 3.5) * 0.3;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push({
        x: Math.cos(a) * 4.0,
        y: -8.5 + Math.sin(a) * 4.0,
        z: 1.0,
        rgb: [Math.floor(255 * lampPulse), Math.floor(60 * lampPulse), Math.floor(60 * lampPulse)],
        size: 1.6 * lampPulse
      });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push({
        x: Math.cos(a) * 2.0,
        y: -8.5 + Math.sin(a) * 2.0,
        z: 1.4,
        rgb: [255, Math.floor(140 * lampPulse), Math.floor(140 * lampPulse)],
        size: 1.8
      });
    }
    return pts; // 64 + 40 + 26 + 40 = 170点
  }

  // 11. 横断歩道の白線: 170点
  function generateCrosswalkMesh(time = 0) {
    const pts = [];
    // 3本のストライプ（各56点）: 168点 + ガイド2点 = 170点
    [-14, 0, 14].forEach(xOff => {
      const w = 8.0, halfW = 4.0, l = 26, halfL = 13;
      // 外枠 32点
      for (let s = 0; s < 32; s++) {
        let px, pz;
        if (s < 9) { px = -halfW + (s / 9) * w; pz = -halfL; }
        else if (s < 16) { px = halfW; pz = -halfL + ((s - 9) / 7) * l; }
        else if (s < 25) { px = halfW - ((s - 16) / 9) * w; pz = halfL; }
        else { px = -halfW; pz = halfL - ((s - 25) / 7) * l; }
        pts.push({ x: xOff + px, y: 0, z: pz, rgb: [240, 245, 255], size: 1.45 });
      }
      // 内側ストライプハッチ 24点 (2列×12)
      [-1.8, 1.8].forEach(innerX => {
        for (let p = 0; p < 12; p++) {
          const frac = (p / 11) - 0.5;
          pts.push({ x: xOff + innerX, y: 0.2, z: frac * 22, rgb: [255, 255, 255], size: 1.4 });
        }
      });
    }); // 56 × 3 = 168点
    pts.push({ x: -21, y: 0, z: 0, rgb: [200, 210, 230], size: 1.3 });
    pts.push({ x:  21, y: 0, z: 0, rgb: [200, 210, 230], size: 1.3 });
    return pts; // 168 + 2 = 170点
  }

  // 12. 工事現場のバリケード: 170点（上部ソーラー警告灯の回転点滅付き）
  function generateBarricadeMesh(time = 0) {
    const pts = [];
    // 左右A型スタンド脚: 左右各28点 = 56点
    [-14, 14].forEach(xSide => {
      for (let p = 0; p < 10; p++) {
        const f = p / 9;
        pts.push({ x: xSide - 4 + f * 4, y: 14 - f * 22, z: 6 - f * 6, rgb: [95, 100, 110], size: 1.35 });
        pts.push({ x: xSide + 4 - f * 4, y: 14 - f * 22, z: -6 + f * 6, rgb: [95, 100, 110], size: 1.35 });
      }
      for (let p = 0; p < 4; p++) {
        const f = (p / 3) - 0.5;
        pts.push({ x: xSide, y: 7, z: f * 8, rgb: [95, 100, 110], size: 1.3 });
        pts.push({ x: xSide, y: -1, z: f * 4, rgb: [95, 100, 110], size: 1.3 });
      }
    }); // 56点

    // 中央横バー（トラ縞模様）3列 × 30点 = 90点
    [-5, 0, 5].forEach(yOff => {
      for (let p = 0; p < 30; p++) {
        const frac = (p / 29) - 0.5;
        const isYellow = (p % 2 === 0);
        pts.push({
          x: frac * 32,
          y: yOff,
          z: 0,
          rgb: isYellow ? [255, 215, 0] : [35, 35, 40],
          size: 1.55
        });
      }
    }); // 90点

    // 上部ソーラー回転警告灯 2基（クルクル回転する光点）: 各12点 = 24点
    const rotLightAng = time * 6.0;
    [-7, 7].forEach((xOff, lIdx) => {
      const sign = (lIdx === 0) ? 1 : -1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const beamGlow = Math.cos(a - rotLightAng * sign) * 0.5 + 0.5;
        pts.push({
          x: xOff + Math.cos(a) * 2.2,
          y: -9.5,
          z: Math.sin(a) * 2.2,
          rgb: [255, Math.floor(100 + 120 * beamGlow), Math.floor(20 + 40 * beamGlow)],
          size: 1.4 + beamGlow * 0.7
        });
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        pts.push({ x: xOff + Math.cos(a) * 1.0, y: -11.5, z: Math.sin(a) * 1.0, rgb: [255, 200, 70], size: 1.8 });
      }
    }); // 24点 -> 合計 56 + 90 + 24 = 170点
    return pts;
  }

  // 13. 側溝の格子蓋（グレーチング）: 170点
  function generateGratingMesh(time = 0) {
    const pts = [];
    const w = 26, halfW = 13, l = 18, halfL = 9;
    // 外枠フレーム 2層: 48点
    for (let s = 0; s < 4; s++) {
      for (let p = 0; p < 8; p++) {
        const f = p / 8;
        let bx, bz;
        if (s === 0) { bx = -halfW + f * w; bz = -halfL; }
        else if (s === 1) { bx = halfW; bz = -halfL + f * l; }
        else if (s === 2) { bx = halfW - f * w; bz = halfL; }
        else { bx = -halfW; bz = halfL - f * l; }
        pts.push({ x: bx, y: 0, z: bz, rgb: [160, 165, 175], size: 1.4 });
      }
    }
    for (let s = 0; s < 4; s++) {
      for (let p = 0; p < 4; p++) {
        const f = p / 4;
        let bx, bz;
        if (s === 0) { bx = -10 + f * 20; bz = -6.5; }
        else if (s === 1) { bx = 10; bz = -6.5 + f * 13; }
        else if (s === 2) { bx = 10 - f * 20; bz = 6.5; }
        else { bx = -10; bz = 6.5 - f * 13; }
        pts.push({ x: bx, y: 0.5, z: bz, rgb: [140, 145, 155], size: 1.35 });
      }
    } // 32 + 16 = 48点

    // 縦格子バー 8本 × 各12点 = 96点
    for (let bar = 0; bar < 8; bar++) {
      const bx = -9.5 + bar * 2.7;
      for (let p = 0; p < 12; p++) {
        const f = (p / 11) - 0.5;
        pts.push({ x: bx, y: 0, z: f * 15, rgb: [135, 140, 150], size: 1.35 });
      }
    } // 96点

    // ねじり横補強クロスバー 2本 × 各13点 = 26点
    [-4.0, 4.0].forEach(bz => {
      for (let p = 0; p < 13; p++) {
        const f = (p / 12) - 0.5;
        pts.push({ x: f * 22, y: -0.5, z: bz, rgb: [110, 115, 125], size: 1.3 });
      }
    }); // 26点 -> 合計 48 + 96 + 26 = 170点
    return pts;
  }

  // 14. 郵便ポスト: 170点
  function generateMailboxMesh(time = 0) {
    const pts = [];
    // 支柱スタンド: 18点
    for (let p = 0; p < 18; p++) {
      pts.push({ x: 0, y: 9 + p * 1.5, z: 0, rgb: [85, 90, 100], size: 1.4 });
    }
    // ポスト直方体本体: 66点
    const halfH = 10, halfD = 7;
    // 上蓋庇リング 2層: 20点 + 16点 = 36点
    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * 10.0, y: -halfH - 2.0, z: Math.sin(ang) * 8.0, rgb: [235, 30, 30], size: 1.45 });
    }
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * 8.5, y: -halfH - 0.5, z: Math.sin(ang) * 6.8, rgb: [220, 25, 25], size: 1.4 });
    }
    // 胴体下部リング 2層: 16点 + 14点 = 30点
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * 8.0, y: halfH - 2.0, z: Math.sin(ang) * 6.5, rgb: [205, 30, 30], size: 1.4 });
    }
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      pts.push({ x: Math.cos(ang) * 7.5, y: halfH, z: Math.sin(ang) * 6.0, rgb: [190, 25, 25], size: 1.35 });
    }
    // 投函口スリット 2列: 18点 × 2 = 36点
    [-4.5, -2.5].forEach(yOff => {
      for (let p = 0; p < 18; p++) {
        const f = (p / 17) - 0.5;
        const isEdge = (p === 0 || p === 17);
        pts.push({ x: f * 12.5, y: yOff, z: halfD + 0.5, rgb: isEdge ? [240, 240, 240] : [20, 20, 25], size: 1.5 });
      }
    });
    // 正面取出し扉・「〒」マーク: 50点
    // 扉枠 26点
    for (let s = 0; s < 26; s++) {
      let px, py;
      if (s < 8) { px = -5.5 + (s / 8) * 11; py = 2.0; }
      else if (s < 13) { px = 5.5; py = 2.0 + ((s - 8) / 5) * 6.5; }
      else if (s < 21) { px = 5.5 - ((s - 13) / 8) * 11; py = 8.5; }
      else { px = -5.5; py = 8.5 - ((s - 21) / 5) * 6.5; }
      pts.push({ x: px, y: py, z: halfD + 0.4, rgb: [255, 255, 255], size: 1.4 });
    }
    // 〒マーク 24点 (横棒2本16点 + 縦棒8点)
    for (let p = 0; p < 8; p++) {
      const f = (p / 7) - 0.5;
      pts.push({ x: f * 7.0, y: 4.0, z: halfD + 0.6, rgb: [255, 255, 255], size: 1.5 });
      pts.push({ x: f * 5.0, y: 5.5, z: halfD + 0.6, rgb: [255, 255, 255], size: 1.5 });
    }
    for (let p = 0; p < 8; p++) {
      pts.push({ x: 0, y: 3.5 + (p / 7) * 3.5, z: halfD + 0.6, rgb: [255, 255, 255], size: 1.5 });
    }
    return pts; // 18 + 66 + 36 + 50 = 170点
  }

  // 15. 電話ボックスの骨組み: 170点
  function generatePhoneBoothMesh(time = 0) {
    const pts = [];
    const w = 15, halfW = 7.5, d = 15, halfD = 7.5, h = 34, halfH = 17;
    // 4本の垂直ピラー支柱: 各16点 × 4 = 64点
    const corners = [{ x: -halfW, z: -halfD }, { x: halfW, z: -halfD }, { x: halfW, z: halfD }, { x: -halfW, z: halfD }];
    corners.forEach(c => {
      for (let p = 0; p < 16; p++) {
        pts.push({ x: c.x, y: -halfH + (p / 15) * h, z: c.z, rgb: [165, 185, 200], size: 1.4 });
      }
    }); // 64点
    // 天井枠正方形 2層: 20点 + 16点 = 36点
    for (let s = 0; s < 4; s++) {
      for (let p = 0; p < 5; p++) {
        const f = p / 5;
        let bx, bz;
        if (s === 0) { bx = -halfW + f * w; bz = -halfD; }
        else if (s === 1) { bx = halfW; bz = -halfD + f * d; }
        else if (s === 2) { bx = halfW - f * w; bz = halfD; }
        else { bx = -halfW; bz = halfD - f * d; }
        pts.push({ x: bx, y: -halfH, z: bz, rgb: [90, 150, 125], size: 1.45 });
      }
    }
    for (let s = 0; s < 4; s++) {
      for (let p = 0; p < 4; p++) {
        const f = p / 4;
        let bx, bz;
        if (s === 0) { bx = -5 + f * 10; bz = -5; }
        else if (s === 1) { bx = 5; bz = -5 + f * 10; }
        else if (s === 2) { bx = 5 - f * 10; bz = 5; }
        else { bx = -5; bz = 5 - f * 10; }
        pts.push({ x: bx, y: -halfH - 1.5, z: bz, rgb: [100, 165, 140], size: 1.4 });
      }
    } // 36点
    // 底面枠正方形: 28点
    for (let s = 0; s < 4; s++) {
      for (let p = 0; p < 7; p++) {
        const f = p / 7;
        let bx, bz;
        if (s === 0) { bx = -halfW + f * w; bz = -halfD; }
        else if (s === 1) { bx = halfW; bz = -halfD + f * d; }
        else if (s === 2) { bx = halfW - f * w; bz = halfD; }
        else { bx = -halfW; bz = halfD - f * d; }
        pts.push({ x: bx, y: halfH, z: bz, rgb: [75, 80, 90], size: 1.35 });
      }
    } // 28点
    // 中間腰高バー 3面: 24点
    for (let s = 0; s < 3; s++) {
      for (let p = 0; p < 8; p++) {
        const f = p / 8;
        let bx, bz;
        if (s === 0) { bx = -halfW + f * w; bz = -halfD; }
        else if (s === 1) { bx = halfW; bz = -halfD + f * d; }
        else { bx = halfW - f * w; bz = halfD; }
        pts.push({ x: bx, y: 1.5, z: bz, rgb: [120, 135, 150], size: 1.3 });
      }
    } // 24点
    // 天井ルーフ電話ライト（淡く光る照明）: 18点
    const lightGlow = 0.85 + Math.sin(time * 2.5) * 0.15;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push({
        x: Math.cos(a) * 3.2,
        y: -halfH - 2.5,
        z: Math.sin(a) * 3.2,
        rgb: [Math.floor(255 * lightGlow), Math.floor(250 * lightGlow), Math.floor(200 * lightGlow)],
        size: 1.6
      });
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 1.5, y: -halfH - 3.5, z: Math.sin(a) * 1.5, rgb: [255, 255, 240], size: 1.8 });
    } // 18点 -> 合計 64 + 36 + 28 + 24 + 18 = 170点
    return pts;
  }

  // 16. 自動販売機の照明パネル: 170点（商品ボタンのウェーブ発光付き）
  function generateVendingPanelMesh(time = 0) {
    const pts = [];
    const w = 24, halfW = 12, h = 32, halfH = 16;
    // 外枠キャビネット 2層: 48点
    for (let s = 0; s < 28; s++) {
      let px, py;
      if (s < 8) { px = -halfW + (s / 8) * w; py = -halfH; }
      else if (s < 14) { px = halfW; py = -halfH + ((s - 8) / 6) * h; }
      else if (s < 22) { px = halfW - ((s - 14) / 8) * w; py = halfH; }
      else { px = -halfW; py = halfH - ((s - 22) / 6) * h; }
      pts.push({ x: px, y: py, z: 0, rgb: [30, 45, 75], size: 1.4 });
    }
    for (let s = 0; s < 20; s++) {
      let px, py;
      if (s < 6) { px = -10 + (s / 6) * 20; py = -14; }
      else if (s < 10) { px = 10; py = -14 + ((s - 6) / 4) * 28; }
      else if (s < 16) { px = 10 - ((s - 10) / 6) * 20; py = 14; }
      else { px = -10; py = 14 - ((s - 16) / 4) * 28; }
      pts.push({ x: px, y: py, z: 0.2, rgb: [45, 60, 95], size: 1.35 });
    } // 48点

    // 商品サンプル照明窓（5×14グリッド）: 70点
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 14; c++) {
        const u = (c / 13) - 0.5;
        const v = (r / 4) - 0.5;
        const colTwinkle = 0.85 + Math.sin(time * 3.0 + c * 0.5 + r) * 0.15;
        pts.push({
          x: u * 18,
          y: -6 + v * 13,
          z: 0.6,
          rgb: [Math.floor(210 * colTwinkle), Math.floor(245 * colTwinkle), 255],
          size: 1.65
        });
      }
    } // 70点

    // 押しボタン列（青/赤）2列 × 16 = 32点：流れるウェーブ点滅
    [5.5, 7.5].forEach((yOff, rIdx) => {
      for (let b = 0; b < 16; b++) {
        const u = (b / 15) - 0.5;
        const isCold = (b % 2 === 0);
        const wave = Math.sin(time * 4.0 - b * 0.4 + rIdx * 1.5) * 0.5 + 0.5;
        const rVal = isCold ? Math.floor(40 + 80 * wave) : Math.floor(200 + 55 * wave);
        const gVal = isCold ? Math.floor(130 + 100 * wave) : Math.floor(60 + 60 * wave);
        const bVal = isCold ? 255 : Math.floor(60 + 40 * wave);
        pts.push({
          x: u * 18,
          y: yOff,
          z: 0.9,
          rgb: [rVal, gVal, bVal],
          size: 1.3 + wave * 0.4
        });
      }
    }); // 32点

    // 投入口・返却口スリット: 20点
    for (let p = 0; p < 20; p++) {
      const u = (p / 19) - 0.5;
      pts.push({ x: u * 14, y: 11.5, z: 0.6, rgb: [40, 40, 45], size: 1.4 });
    } // 20点 -> 合計 48 + 70 + 32 + 20 = 170点
    return pts;
  }

  // 17. 駐輪場のラック: 170点
  function generateBicycleRackMesh(time = 0) {
    const pts = [];
    // 地面ベースレール 前後2本 × 18点 = 36点
    [-4.5, 4.5].forEach(zPos => {
      for (let p = 0; p < 18; p++) {
        const u = (p / 17) - 0.5;
        pts.push({ x: u * 28, y: 9, z: zPos, rgb: [100, 105, 115], size: 1.35 });
      }
    }); // 36点

    // U字型スタンドアーチ 3基（各42点）: 126点
    [-9.5, 0, 9.5].forEach(xOffset => {
      for (let p = 0; p < 42; p++) {
        const frac = p / 41;
        let y, z;
        if (frac < 0.35) {
          y = 9 - (frac / 0.35) * 16;
          z = -4.0;
        } else if (frac > 0.65) {
          y = -7 + ((frac - 0.65) / 0.35) * 16;
          z = 4.0;
        } else {
          const a = ((frac - 0.35) / 0.30) * Math.PI;
          y = -7 - Math.sin(a) * 4.2;
          z = -4.0 + (1 - Math.cos(a)) * 4.0;
        }
        pts.push({
          x: xOffset,
          y: y,
          z: z,
          rgb: [165, 175, 185],
          size: 1.45
        });
      }
    }); // 126点

    // 固定ボルト 8点
    [-11, -8, 8, 11].forEach(xOff => {
      pts.push({ x: xOff, y: 8.5, z: -4.5, rgb: [200, 205, 215], size: 1.5 });
      pts.push({ x: xOff, y: 8.5, z:  4.5, rgb: [200, 205, 215], size: 1.5 });
    }); // 8点 -> 合計 36 + 126 + 8 = 170点
    return pts;
  }

  // 18. 案内地図の現在地マーク: 170点（着地点の波紋パルスアニメーション付き）
  function generateLocationMarkerMesh(time = 0) {
    const pts = [];
    // 上部円環ヘッド 2層: 36点 + 24点 = 60点
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 9.5, y: -7.5 + Math.sin(a) * 9.5, z: 0, rgb: [245, 45, 55], size: 1.6 });
    }
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 7.5, y: -7.5 + Math.sin(a) * 7.5, z: 0.2, rgb: [225, 35, 45], size: 1.5 });
    } // 60点

    // 中央くり抜き白リング: 30点
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 4.2, y: -7.5 + Math.sin(a) * 4.2, z: 0.5, rgb: [255, 255, 255], size: 1.55 });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 2.5, y: -7.5 + Math.sin(a) * 2.5, z: 0.6, rgb: [240, 245, 255], size: 1.45 });
    } // 30点

    // 下向きV字テール 2層: 28点 + 22点 = 50点
    for (let p = 0; p < 14; p++) {
      const frac = p / 13;
      pts.push({ x: -8.0 * (1 - frac), y: -1.5 + frac * 17, z: 0, rgb: [235, 40, 50], size: 1.5 });
      pts.push({ x:  8.0 * (1 - frac), y: -1.5 + frac * 17, z: 0, rgb: [235, 40, 50], size: 1.5 });
    }
    for (let p = 0; p < 11; p++) {
      const frac = p / 10;
      pts.push({ x: -5.5 * (1 - frac), y: -1.0 + frac * 15, z: 0.2, rgb: [215, 30, 40], size: 1.4 });
      pts.push({ x:  5.5 * (1 - frac), y: -1.0 + frac * 15, z: 0.2, rgb: [215, 30, 40], size: 1.4 });
    } // 50点

    // 接地点の波紋リング 2層（パルス拡大アニメーション）: 18点 + 12点 = 30点
    const ripple1 = (time * 0.7) % 1.0;
    const ripple2 = (time * 0.7 + 0.5) % 1.0;
    const rad1 = 1.5 + ripple1 * 8.5;
    const rad2 = 1.5 + ripple2 * 8.5;
    const alpha1 = Math.max(0.15, 1.0 - ripple1);
    const alpha2 = Math.max(0.15, 1.0 - ripple2);

    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      pts.push({
        x: Math.cos(a) * rad1,
        y: 16.5,
        z: Math.sin(a) * rad1,
        rgb: [Math.floor(255 * alpha1), Math.floor(100 * alpha1), Math.floor(120 * alpha1)],
        size: 1.1 + alpha1 * 0.6
      });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push({
        x: Math.cos(a) * rad2,
        y: 16.5,
        z: Math.sin(a) * rad2,
        rgb: [Math.floor(255 * alpha2), Math.floor(140 * alpha2), Math.floor(160 * alpha2)],
        size: 1.0 + alpha2 * 0.6
      });
    } // 30点 -> 合計 60 + 30 + 50 + 30 = 170点
    return pts;
  }

  // 19. 監視カメラ: 170点（左右首振りパン運動＆録画ランプ点滅）
  function generateSurveillanceCameraMesh(time = 0) {
    const pts = [];
    // 壁面取付プレート 2層: 12点 + 8点 = 20点
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push({ x: -11, y: Math.sin(a) * 6.0, z: Math.cos(a) * 6.0, rgb: [150, 155, 165], size: 1.4 });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      pts.push({ x: -10.5, y: Math.sin(a) * 3.5, z: Math.cos(a) * 3.5, rgb: [170, 175, 185], size: 1.35 });
    } // 20点

    // 多関節アーム: 26点
    for (let p = 0; p < 13; p++) {
      const frac = p / 12;
      pts.push({ x: -11 + frac * 10, y: -2 + frac * 2, z: -1.0, rgb: [180, 185, 195], size: 1.4 });
      pts.push({ x: -11 + frac * 10, y: -2 + frac * 2, z:  1.0, rgb: [180, 185, 195], size: 1.4 });
    } // 26点

    // 首振りパン角度 (左右にゆっくり見渡す)
    const panAngle = Math.sin(time * 0.8) * 0.32;
    const cosP = Math.cos(panAngle), sinP = Math.sin(panAngle);

    // 円筒カメラ本体 6層 × 10点 = 60点
    for (let layer = 0; layer < 6; layer++) {
      const lx = layer * 3.0;
      const ly = layer * 1.4;
      for (let p = 0; p < 10; p++) {
        const a = (p / 10) * Math.PI * 2;
        const cy = ly + Math.sin(a) * 4.2;
        const cz = Math.cos(a) * 4.2;
        // Y軸周りの首振り回転
        const rotX = lx * cosP + cz * sinP;
        const rotZ = -lx * sinP + cz * cosP;
        pts.push({
          x: rotX,
          y: cy,
          z: rotZ,
          rgb: [235, 240, 250],
          size: 1.45
        });
      }
    } // 60点

    // サンシェードひさし 2層: 14点 + 14点 = 28点
    for (let layer = 0; layer < 2; layer++) {
      const lx = 14 + layer * 2.5;
      const ly = 5.5 + layer * 1.2;
      for (let p = 0; p < 14; p++) {
        const frac = (p / 13) - 0.5;
        const cz = frac * 9.5;
        const rotX = lx * cosP + cz * sinP;
        const rotZ = -lx * sinP + cz * cosP;
        pts.push({ x: rotX, y: ly - 3.5, z: rotZ, rgb: [70, 75, 85], size: 1.5 });
      }
    } // 28点

    // 赤外線LEDリング ＆ レンズ面（赤色録画ランプの明滅）: 24点 + 12点 = 36点
    const recGlow = 0.5 + Math.sin(time * 4.0) * 0.5;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const lx = 16.5;
      const ly = 7.2 + Math.sin(a) * 3.0;
      const cz = Math.cos(a) * 3.0;
      const rotX = lx * cosP + cz * sinP;
      const rotZ = -lx * sinP + cz * cosP;
      pts.push({
        x: rotX,
        y: ly,
        z: rotZ,
        rgb: [Math.floor(255 * (0.6 + 0.4 * recGlow)), Math.floor(45 * recGlow), Math.floor(45 * recGlow)],
        size: 1.6 + recGlow * 0.3
      });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const lx = 16.8;
      const ly = 7.2 + Math.sin(a) * 1.5;
      const cz = Math.cos(a) * 1.5;
      const rotX = lx * cosP + cz * sinP;
      const rotZ = -lx * sinP + cz * cosP;
      pts.push({ x: rotX, y: ly, z: rotZ, rgb: [80, 180, 255], size: 1.8 });
    } // 36点 -> 合計 20 + 26 + 60 + 28 + 36 = 170点
    return pts;
  }

  // 20. 消防用ホース格納箱: 170点
  function generateHoseCabinetMesh(time = 0) {
    const pts = [];
    // 2本スタンド脚: 左右各12点 = 24点
    [-7, 7].forEach(xSide => {
      for (let p = 0; p < 12; p++) {
        pts.push({ x: xSide, y: 10 + p * 1.2, z: 0, rgb: [180, 45, 45], size: 1.4 });
      }
    }); // 24点

    // 赤いボックス外枠 2層: 38点 + 28点 = 66点
    const w = 22, halfW = 11, h = 20, halfH = 10;
    for (let s = 0; s < 38; s++) {
      let px, py;
      if (s < 11) { px = -halfW + (s / 11) * w; py = -halfH; }
      else if (s < 19) { px = halfW; py = -halfH + ((s - 11) / 8) * h; }
      else if (s < 30) { px = halfW - ((s - 19) / 11) * w; py = halfH; }
      else { px = -halfW; py = halfH - ((s - 30) / 8) * h; }
      pts.push({ x: px, y: py, z: 0, rgb: [230, 35, 35], size: 1.45 });
    }
    for (let s = 0; s < 28; s++) {
      let px, py;
      if (s < 8) { px = -9 + (s / 8) * 18; py = -8; }
      else if (s < 14) { px = 9; py = -8 + ((s - 8) / 6) * 16; }
      else if (s < 22) { px = 9 - ((s - 14) / 8) * 18; py = 8; }
      else { px = -9; py = 8 - ((s - 22) / 6) * 16; }
      pts.push({ x: px, y: py, z: 0.2, rgb: [200, 30, 30], size: 1.35 });
    } // 66点

    // 扉の窓枠 2層: 20点 + 16点 = 36点
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 5.8, y: Math.sin(a) * 5.8, z: 0.5, rgb: [255, 255, 255], size: 1.5 });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push({ x: Math.cos(a) * 4.2, y: Math.sin(a) * 4.2, z: 0.6, rgb: [220, 220, 225], size: 1.4 });
    } // 36点

    // 内部の巻かれたホース螺旋 2層: 24点 + 20点 = 44点
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 4, r = 1.0 + (i / 24) * 3.6;
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0.8, rgb: [215, 210, 185], size: 1.4 });
    }
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 4, r = 0.8 + (i / 20) * 3.2;
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0.9, rgb: [235, 230, 205], size: 1.35 });
    } // 44点 -> 合計 24 + 66 + 36 + 44 = 170点
    return pts;
  }

  // 21. 排水管の先端: 170点（重力加速水滴ポタポタ＆流水アニメーション付き）
  function generateDrainpipeMesh(time = 0) {
    const pts = [];
    // 水平パイプ 4層リング × 10点 = 40点
    [-14, -10, -6, -2].forEach(xPos => {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        pts.push({ x: xPos, y: -7 + Math.sin(a) * 4.2, z: Math.cos(a) * 4.2, rgb: [125, 130, 140], size: 1.4 });
      }
    }); // 40点

    // 90度エルボ曲がり管 3層 × 12点 = 36点
    for (let ring = 0; ring < 3; ring++) {
      const frac = ring / 2;
      const angOff = frac * (Math.PI * 0.45);
      const cx = -2.0 + Math.sin(angOff) * 3.5;
      const cy = -7.0 + (1 - Math.cos(angOff)) * 4.5;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(a) * 3.8, y: cy + Math.sin(a) * 2.0, z: Math.sin(a) * 3.8, rgb: [110, 115, 125], size: 1.4 });
      }
    } // 36点

    // 下向き開口部リム 2層: 14点 + 10点 = 24点
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push({ x: 1.5 + Math.cos(a) * 4.6, y: -0.5, z: Math.sin(a) * 4.6, rgb: [95, 100, 110], size: 1.45 });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pts.push({ x: 1.5 + Math.cos(a) * 3.2, y: 0.5, z: Math.sin(a) * 3.2, rgb: [80, 85, 95], size: 1.4 });
    } // 24点

    // 虚空へ滴り落ちる水滴ストリーム（重力加速ポタポタアニメーション）: 70点
    for (let p = 0; p < 70; p++) {
      // 連続した滴下サイクル (0.0 〜 1.0)
      const dropCycle = (p / 70 + time * 0.45) % 1.0;
      // 重力加速度カーブ
      const fallY = 1.0 + Math.pow(dropCycle, 1.4) * 28.0;
      // 水滴の微小スプレー揺らぎ
      const spray = Math.sin(p * 2.3 + time * 2.5) * (0.3 + dropCycle * 3.2);
      const depth = Math.cos(p * 1.9 + time * 2.0) * (0.3 + dropCycle * 3.2);
      
      const isDropHead = (dropCycle < 0.12);
      const rCol = isDropHead ? 230 : Math.floor(60 + (1 - dropCycle) * 70);
      const gCol = isDropHead ? 250 : Math.floor(190 + (1 - dropCycle) * 60);
      const bCol = 255;
      const sz = isDropHead ? 2.0 : (1.4 * (1.0 - dropCycle * 0.35));

      pts.push({
        x: 1.5 + spray,
        y: fallY,
        z: depth,
        rgb: [rCol, gCol, bCol],
        size: sz
      });
    } // 70点 -> 合計 40 + 36 + 24 + 70 = 170点
    return pts;
  }

  const DRIFT_REGISTRY = [
    { id: 'tetrapod', name: '消波ブロック (Tetrapod)', generate: generateTetrapodMesh, baseRot: [0.35, 0.40, 0.20], sway: 'yaw' },
    { id: 'traffic_cone', name: '三角コーン (Traffic Cone)', generate: generateTrafficConeMesh, baseRot: [0.12, 0.00, 0.00], sway: 'face' },
    { id: 'manhole', name: 'マンホールの蓋', generate: generateManholeMesh, baseRot: [0.85, 0.00, 0.00], sway: 'pitch' },
    { id: 'fire_hydrant', name: '消火栓', generate: generateFireHydrantMesh, baseRot: [0.08, 0.00, 0.00], sway: 'face' },
    { id: 'cats_eye', name: '道路鋲（キャッツアイ）', generate: generateCatsEyeMesh, baseRot: [0.75, 0.00, 0.00], sway: 'pitch' },
    { id: 'transformer', name: '電柱の変圧器（トランス）', generate: generateTransformerMesh, baseRot: [0.10, 0.00, 0.00], sway: 'face' },
    { id: 'railroad_signal', name: '踏切の警報機', generate: generateRailroadSignalMesh, baseRot: [0.05, 0.00, 0.00], sway: 'face' },
    { id: 'no_entry_sign', name: '「立入禁止」看板', generate: generateNoEntrySignMesh, baseRot: [0.06, 0.08, 0.00], sway: 'face' },
    { id: 'parking_lock', name: 'コインパーキングのロック板', generate: generateParkingLockMesh, baseRot: [0.65, 0.30, 0.00], sway: 'pitch' },
    { id: 'streetlight', name: '街路灯', generate: generateStreetlightMesh, baseRot: [0.05, 0.20, 0.00], sway: 'face' },
    { id: 'fire_alarm_box', name: '火災報知器ボックス', generate: generateFireAlarmBoxMesh, baseRot: [0.05, 0.00, 0.00], sway: 'face' },
    { id: 'crosswalk', name: '横断歩道の白線', generate: generateCrosswalkMesh, baseRot: [0.80, 0.15, 0.00], sway: 'pitch' },
    { id: 'barricade', name: '工事現場のバリケード', generate: generateBarricadeMesh, baseRot: [0.10, 0.25, 0.00], sway: 'face' },
    { id: 'grating', name: '側溝の格子蓋（グレーチング）', generate: generateGratingMesh, baseRot: [0.80, 0.10, 0.00], sway: 'pitch' },
    { id: 'mailbox', name: '郵便ポスト', generate: generateMailboxMesh, baseRot: [0.10, 0.35, 0.00], sway: 'face' },
    { id: 'phone_booth', name: '電話ボックスの骨組み', generate: generatePhoneBoothMesh, baseRot: [0.15, 0.40, 0.00], sway: 'face' },
    { id: 'vending_panel', name: '自動販売機の照明パネル', generate: generateVendingPanelMesh, baseRot: [0.08, 0.20, 0.00], sway: 'face' },
    { id: 'bicycle_rack', name: '駐輪場のラック', generate: generateBicycleRackMesh, baseRot: [0.55, 0.35, 0.00], sway: 'pitch' },
    { id: 'location_marker', name: '案内地図の現在地マーク', generate: generateLocationMarkerMesh, baseRot: [0.05, 0.00, 0.00], sway: 'face' },
    { id: 'surveillance_cam', name: '監視カメラ', generate: generateSurveillanceCameraMesh, baseRot: [0.15, 0.35, 0.00], sway: 'face' },
    { id: 'hose_cabinet', name: '消防用ホース格納箱', generate: generateHoseCabinetMesh, baseRot: [0.10, 0.25, 0.00], sway: 'face' },
    { id: 'drainpipe', name: '排水管の先端', generate: generateDrainpipeMesh, baseRot: [0.20, 0.30, 0.00], sway: 'face' }
  ];


  // --- 404 テンプレート生成関数 ---
  function generate404Template(time = 0, options = {}) {
    const points = [];
    const showButtons = options.showButtons || false;
    const hoverBtn = options.hoverBtn || null;

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

    // 3. デジタル・オーディオウェーブ / イコライザーバー（画面下部：ドット数完全固定）
    const numBars = 23;
    const barSpacing = 11;
    const barStartX = -((numBars - 1) * barSpacing) * 0.5;
    const barBaseY = 118;
    const dotsPerBar = 6;
    for (let b = 0; b < numBars; b++) {
      const bx = barStartX + b * barSpacing;
      // 時間とインデックスに応じたバーの高さ（滑らかな伸縮アニメーション）
      const barHeight = Math.abs(Math.sin(time * 4.0 + b * 0.45) * Math.cos(time * 2.5 + b * 0.2)) * 16 + 4;
      for (let d = 0; d < dotsPerBar; d++) {
        const frac = d / (dotsPerBar - 1);
        const by = barBaseY - frac * barHeight;
        const col = frac > 0.8 ? [255, 255, 255] : (frac > 0.4 ? [255, 100, 180] : [40, 200, 255]);
        points.push({
          bx: bx,
          by: by,
          rgb: col,
          size: 1.4
        });
      }
    }

    // 3.5 インタラクティブ・ドットボタン群（404.html専用: options.showButtons === true）
    if (showButtons) {
      const drawDotButton = (label, centerX, centerY, width, height, isHovered, primary = false) => {
        const hw = width * 0.5;
        const hh = height * 0.5;

        // ボタン外枠のドット（四角形フレーム：波打ちなしで完全静止）
        const borderStepsX = Math.floor(width / 5.2);
        const borderStepsY = Math.floor(height / 5.2);
        const borderCol = isHovered 
          ? [255, 255, 255] 
          : (primary ? [56, 189, 248] : [148, 163, 184]);
        const dotSz = isHovered ? 2.2 : 1.5;

        // 水平枠線（上下）
        for (let i = 0; i <= borderStepsX; i++) {
          const x = -hw + (i / borderStepsX) * width;
          // 上辺
          points.push({
            bx: centerX + x,
            by: centerY - hh,
            rgb: borderCol,
            size: dotSz
          });
          // 下辺
          points.push({
            bx: centerX + x,
            by: centerY + hh,
            rgb: borderCol,
            size: dotSz
          });
        }
        // 垂直枠線（左右）
        for (let j = 1; j < borderStepsY; j++) {
          const y = -hh + (j / borderStepsY) * height;
          // 左辺
          points.push({
            bx: centerX - hw,
            by: centerY + y,
            rgb: borderCol,
            size: dotSz
          });
          // 右辺
          points.push({
            bx: centerX + hw,
            by: centerY + y,
            rgb: borderCol,
            size: dotSz
          });
        }

        // テキスト文字（FONT_5X7：文字ピッチを拡大し、波打ちなしでクッキリ表示）
        const textStep = 2.5;
        const charW = 6 * textStep;
        const totalTextW = label.length * charW - textStep;
        const textStartX = centerX - totalTextW * 0.5;
        const textStartY = centerY - (7 * textStep) * 0.5;

        const textCol = isHovered 
          ? [255, 255, 255] 
          : (primary ? [60, 220, 255] : [220, 235, 250]);

        let curX = textStartX;
        for (let i = 0; i < label.length; i++) {
          const ch = label[i].toUpperCase();
          const glyph = FONT_5X7[ch] || FONT_5X7[' '];
          for (let r = 0; r < 7; r++) {
            const rowStr = glyph[r];
            for (let c = 0; c < 5; c++) {
              if (rowStr[c] === '#') {
                const px = curX + c * textStep;
                const py = textStartY + r * textStep;
                points.push({
                  bx: px,
                  by: py,
                  rgb: textCol,
                  size: isHovered ? 2.4 : 1.7
                });
              }
            }
          }
          curX += charW;
        }
      };

      // イコライザーバー（y: 118）の下、y: 154 に配置（サイズ・間隔を最適化）
      const btnY = 154;
      const isHomeHover = (hoverBtn === 'home');
      const isBackHover = (hoverBtn === 'back');

      // [ RETURN HOME ]
      drawDotButton('RETURN HOME', -96, btnY, 172, 28, isHomeHover, true);

      // [ GO BACK ]
      drawDotButton('GO BACK', 96, btnY, 118, 28, isBackHover, false);
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
      const colType = Math.floor(pseudoRandom(dSeed + 3) * 3);
      const baseCol = colType === 0 ? [255, 120, 200] : (colType === 1 ? [60, 220, 255] : [255, 255, 255]);
      
      // 点数を常に完全固定し、瞬きは輝度とサイズで表現（インデックスずれ・荒ぶりを完全防止）
      const bright = 0.15 + twinkle * 0.85;
      points.push({
        bx: px,
        by: py,
        rgb: [
          Math.floor(baseCol[0] * bright),
          Math.floor(baseCol[1] * bright),
          Math.floor(baseCol[2] * bright)
        ],
        size: 0.8 + twinkle * 1.5
      });
    }

    // ========================================================
    // --- 外周スペース：虚空（VOID）を漂う未知の幾何学構造物群 ---
    // ========================================================

    // 3D空間ベクトル回転補助関数
    function rotate3D(x, y, z, rx, ry, rz) {
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const y1 = y * cx - z * sx;
      const z1 = y * sx + z * cx;

      const cy = Math.cos(ry), sy = Math.sin(ry);
      const x2 = x * cy + z1 * sy;
      const z2 = -x * sy + z1 * cy;

      const cz = Math.cos(rz), sz = Math.sin(rz);
      const x3 = x2 * cz - y1 * sz;
      const y3 = x2 * sz + y1 * cz;

      return { x: x3, y: y3, z: z2 };
    }

    // 共通外周グリッチオフセット（中央のグリッチと同期）
    const outerGlitchX = isGlitch ? (pseudoRandom(Math.floor(time * 19)) - 0.5) * 36 * glitchIntensity : 0;
    const outerGlitchY = isGlitch ? (pseudoRandom(Math.floor(time * 23)) - 0.5) * 10 * glitchIntensity : 0;

    // --------------------------------------------------------
    // 7. 特異点ジャイロスコープ・リング（Singularity Gyro Rings）
    // 右上の虚空に浮かぶ多重回転リング ＆ 中心特異点渦
    // --------------------------------------------------------
    const gyroBaseX = 265 + Math.sin(time * 0.45) * 10 + outerGlitchX;
    const gyroBaseY = -115 + Math.cos(time * 0.38) * 8 + outerGlitchY;

    // 多重リングパラメータ（半径、回転角、分割数、色）
    const gyroRings = [
      { rad: 78, rx: time * 0.55, ry: time * 0.80, rz: time * 0.20, steps: 56, col: [60, 220, 255] },
      { rad: 56, rx: -time * 0.90, ry: time * 0.45, rz: time * 0.65, steps: 44, col: [175, 95, 255] },
      { rad: 36, rx: time * 1.15, ry: -time * 1.05, rz: -time * 0.50, steps: 32, col: [255, 90, 190] }
    ];

    gyroRings.forEach((rg, rIdx) => {
      for (let s = 0; s < rg.steps; s++) {
        const theta = (s / rg.steps) * Math.PI * 2;
        // 基本円軌道（XY平面）
        const lx = Math.cos(theta) * rg.rad;
        const ly = Math.sin(theta) * rg.rad;
        const lz = 0;

        const rot = rotate3D(lx, ly, lz, rg.rx, rg.ry, rg.rz);

        // リング上を走るパルス光ノード
        const pulsePhase = (s / rg.steps + time * (0.8 + rIdx * 0.3)) % 1.0;
        const isPulse = pulsePhase < 0.12;
        const isNode = (s % Math.floor(rg.steps / 6) === 0);

        let col = rg.col;
        let ptSize = 1.35;

        if (isPulse) {
          col = [255, 255, 255];
          ptSize = 2.4;
        } else if (isNode) {
          col = [255, 235, 120];
          ptSize = 2.0;
        }

        points.push({
          bx: gyroBaseX + rot.x,
          by: gyroBaseY + rot.y,
          rgb: col,
          size: ptSize
        });
      }
    });

    // ジャイロ中心の特異点コア（吸い込まれるような微細な渦巻き）
    const numSpiral = 48;
    for (let sp = 0; sp < numSpiral; sp++) {
      const spFrac = sp / numSpiral;
      const spAng = spFrac * Math.PI * 8 - time * 3.5;
      const spDist = 1.5 + Math.pow(spFrac, 1.4) * 20;
      const sx = Math.cos(spAng) * spDist;
      const sy = Math.sin(spAng) * (spDist * 0.7);
      
      const spCol = spFrac < 0.35 ? [255, 255, 255] : (spFrac < 0.7 ? [60, 240, 255] : [140, 80, 255]);
      points.push({
        bx: gyroBaseX + sx,
        by: gyroBaseY + sy,
        rgb: spCol,
        size: 0.9 + (1.0 - spFrac) * 1.5
      });
    }

    // --------------------------------------------------------
    // 8. 現実に実在する謎の漂流遺物空間（Drifting Void Relics - High Fidelity 170pts）
    // 全方位・全高度へ飛び交うテーマ1「街角・インフラの境界遺物（全20種）」＋テトラポッド・三角コーンの全22種
    // 【拡張性】DRIFT_REGISTRY にアイテムを追加するだけで自動的に宇宙の漂流空間に合流
    // --------------------------------------------------------
    const NUM_DRIFT_SLOTS = 22;     // 全22種類のアイテムが常時宇宙を漂流
    const SPAN_X = 960;             // 画面横幅スパン (-480 〜 +480)
    const SPAN_Y = 620;             // 画面縦幅スパン (-310 〜 +310: 高さを画面全体にランダム分布)
    const SPAN_Z = 160;             // 画面奥行きスパン (-80 〜 +80)

    for (let s = 0; s < NUM_DRIFT_SLOTS; s++) {
      const itemDef = DRIFT_REGISTRY[s % DRIFT_REGISTRY.length];

      // 1. 全方位360度への進行方向ベクトル（右から左の縛りを撤廃）
      const dirAngle = (s / NUM_DRIFT_SLOTS) * Math.PI * 2 + 0.38;
      // スロットごとに異なる自然な飛行速度 (18 〜 32 px/s)
      const speed = 18.0 + ((s * 7) % 15);
      const vx = Math.cos(dirAngle) * speed;
      const vy = Math.sin(dirAngle) * speed;
      const vz = Math.sin(s * 1.7) * 9.0;

      // 2. 高さと位置のランダム分布（画面全体に広く散らす）
      const x0 = (s * 137.5) % SPAN_X;
      const y0 = (s * 219.3) % SPAN_Y;
      const z0 = (s * 41.7) % SPAN_Z;

      // 時間経過によるトーラス状シームレス全方向移動
      const rawX = x0 + vx * time;
      const posX = (((rawX % SPAN_X) + SPAN_X) % SPAN_X) - SPAN_X * 0.5 + outerGlitchX;

      const rawY = y0 + vy * time;
      const posY = (((rawY % SPAN_Y) + SPAN_Y) % SPAN_Y) - SPAN_Y * 0.5 + outerGlitchY;

      const rawZ = z0 + vz * time;
      const posZ = (((rawZ % SPAN_Z) + SPAN_Z) % SPAN_Z) - SPAN_Z * 0.5;

      // 3. シルエットを破壊しない姿勢制御（何なのかハッキリ識別できる角度を維持）
      let rotX = itemDef.baseRot[0];
      let rotY = itemDef.baseRot[1];
      let rotZ = itemDef.baseRot[2];

      if (itemDef.sway === 'yaw') {
        // 水平自転（ゆっくり一回転）＋微小揺らぎ
        rotY += time * 0.28 + s * 0.7;
        rotX += Math.sin(time * 0.6 + s) * 0.08;
        rotZ += Math.cos(time * 0.5 + s) * 0.06;
      } else if (itemDef.sway === 'pitch') {
        // 見下ろし面キープ＋緩やかな面内旋回
        rotY += Math.sin(time * 0.4 + s) * 0.22;
        rotX += Math.cos(time * 0.5 + s) * 0.06;
        rotZ += Math.sin(time * 0.35 + s * 1.5) * 0.10;
      } else {
        // 正面・特徴的アングルキープ＋無重力スウェイ（傾きは最大5〜7度以内）
        rotX += Math.sin(time * 0.5 + s * 1.3) * 0.08;
        rotY += Math.cos(time * 0.45 + s * 1.9) * 0.12;
        rotZ += Math.sin(time * 0.35 + s * 0.8) * 0.06;
      }

      // 4. 画面端（上下左右）での滑らかなフェードアウト（急な消滅・再出現を防止）
      const edgeX = Math.abs(posX);
      const edgeY = Math.abs(posY);
      const fadeX = edgeX > 370 ? Math.max(0.08, 1.0 - (edgeX - 370) / 90) : 1.0;
      const fadeY = edgeY > 230 ? Math.max(0.08, 1.0 - (edgeY - 230) / 70) : 1.0;
      const edgeFade = Math.min(fadeX, fadeY);

      // 各スロットに固定のアイテムを割り当て（インデックスの不変性を100%保持）
      const meshPoints = itemDef.generate(time);

      meshPoints.forEach(pt => {
        // アイテムローカル座標を3D回転
        const rot = rotate3D(pt.x, pt.y, pt.z, rotX, rotY, rotZ);

        // 深度による明暗陰影
        const depthShade = 0.75 + 0.25 * ((rot.z + posZ + 60) / 120);
        const finalR = Math.floor(pt.rgb[0] * depthShade * edgeFade);
        const finalG = Math.floor(pt.rgb[1] * depthShade * edgeFade);
        const finalB = Math.floor(pt.rgb[2] * depthShade * edgeFade);

        points.push({
          bx: posX + rot.x,
          by: posY + rot.y,
          rgb: [finalR, finalG, finalB],
          size: pt.size * edgeFade
        });
      });
    }

    // --------------------------------------------------------
    // 9. 四次元超立方体（4D Tesseract）の3D投影立体
    // 左上の虚空で内側と外側が裏返りながら回転し続ける超次元幾何学
    // --------------------------------------------------------
    const tesseractBaseX = -260 + Math.sin(time * 0.4) * 8 + outerGlitchX;
    const tesseractBaseY = -110 + Math.cos(time * 0.35) * 8 + outerGlitchY;

    // 4次元超立方体の16頂点 (±1, ±1, ±1, ±1)
    const tesseractVerts4D = [];
    for (let i = 0; i < 16; i++) {
      tesseractVerts4D.push([
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      ]);
    }

    // 4次元回転角
    const rot4D_XW = time * 0.70;
    const rot4D_YZ = time * 0.52;
    const dist4D = 2.35;
    const tesseractScale = 28;

    // 32本の辺（頂点番号間でハミング距離が1のペア）
    const tesseractEdges = [];
    for (let i = 0; i < 16; i++) {
      for (let bit = 1; bit <= 8; bit <<= 1) {
        const j = i ^ bit;
        if (i < j) {
          tesseractEdges.push([i, j]);
        }
      }
    }

    // 4D -> 3D 遠視投影 ＆ 3D全体姿勢変換
    const tesseractRotVerts3D = tesseractVerts4D.map(v => {
      let x = v[0], y = v[1], z = v[2], w = v[3];

      // XW平面回転
      const cosXW = Math.cos(rot4D_XW), sinXW = Math.sin(rot4D_XW);
      const x1 = x * cosXW - w * sinXW;
      const w1 = x * sinXW + w * cosXW;

      // YZ平面回転
      const cosYZ = Math.cos(rot4D_YZ), sinYZ = Math.sin(rot4D_YZ);
      const y1 = y * cosYZ - z * sinYZ;
      const z1 = y * sinYZ + z * cosYZ;

      // 4D透視投影
      const persp = dist4D / (dist4D - w1);
      const p3x = x1 * persp * tesseractScale;
      const p3y = y1 * persp * tesseractScale;
      const p3z = z1 * persp * tesseractScale;

      // 3D空間全体を少し傾けて見やすくする
      return rotate3D(p3x, p3y, p3z, 0.45, time * 0.25, -0.2);
    });

    // 辺上の点群を描画
    tesseractEdges.forEach(edge => {
      const vA = tesseractRotVerts3D[edge[0]];
      const vB = tesseractRotVerts3D[edge[1]];
      const steps = 4;
      for (let s = 0; s <= steps; s++) {
        const tFrac = s / steps;
        const px = vA.x + (vB.x - vA.x) * tFrac;
        const py = vA.y + (vB.y - vA.y) * tFrac;
        const pz = vA.z + (vB.z - vA.z) * tFrac;

        // 深度に応じた発光グラデーション
        const depthFrac = Math.max(0, Math.min(1, (pz + 45) / 90));
        const rCol = Math.floor(255 * (1.0 - depthFrac) + 60 * depthFrac);
        const gCol = Math.floor(80 * (1.0 - depthFrac) + 220 * depthFrac);
        const bCol = Math.floor(210 * (1.0 - depthFrac) + 255 * depthFrac);

        points.push({
          bx: tesseractBaseX + px,
          by: tesseractBaseY + py,
          rgb: [rCol, gCol, bCol],
          size: 1.2 + depthFrac * 0.8
        });
      }
    });

    // --------------------------------------------------------
    // 10. 虚無を螺旋旋回する崩壊メビウス・粒子リボン（Gravitational Mobius Strip）
    // --------------------------------------------------------

    // (B) 虚無を螺旋旋回する崩壊メビウス・粒子リボン（Gravitational Mobius Strip）
    const numRibbon = 120;
    for (let rb = 0; rb < numRibbon; rb++) {
      const u = (rb / numRibbon) * Math.PI * 2;
      const ribbonTime = time * 0.65;
      const effU = u + ribbonTime;

      // メビウスの帯の3Dパラメータ方程式
      const ribbonRad = 290 + Math.sin(effU * 2) * 25;
      const ribbonW = 18;
      const v = Math.sin(effU * 3 + time) * ribbonW; // 幅方向の揺れ

      // メビウスのねじれ角 (u / 2)
      const twist = effU * 0.5;
      const rx = (ribbonRad + v * Math.cos(twist)) * Math.cos(effU);
      const ry = (ribbonRad * 0.52 + v * Math.cos(twist) * 0.5) * Math.sin(effU);
      const rz = v * Math.sin(twist);

      // 視線傾斜回転
      const rot = rotate3D(rx, ry, rz, 0.35, 0.25, time * 0.08);

      const sparkle = Math.sin(time * 5.0 + rb) * 0.5 + 0.5;
      const col = (rb % 3 === 0) ? [60, 240, 255] : ((rb % 3 === 1) ? [255, 110, 220] : [240, 245, 255]);

      points.push({
        bx: rot.x + outerGlitchX,
        by: rot.y + outerGlitchY,
        rgb: col,
        size: 1.1 + sparkle * 1.1
      });
    }

    return points;
  }

  // グローバル公開
  if (typeof window !== 'undefined') {
    window.generate404Template = generate404Template;
    window.DRIFT_REGISTRY = DRIFT_REGISTRY;
    window.generateTetrapodMesh = generateTetrapodMesh;
    window.generateTrafficConeMesh = generateTrafficConeMesh;
    window.generateManholeMesh = generateManholeMesh;
    window.generateFireHydrantMesh = generateFireHydrantMesh;
    window.generateCatsEyeMesh = generateCatsEyeMesh;
    window.generateTransformerMesh = generateTransformerMesh;
    window.generateRailroadSignalMesh = generateRailroadSignalMesh;
    window.generateNoEntrySignMesh = generateNoEntrySignMesh;
    window.generateParkingLockMesh = generateParkingLockMesh;
    window.generateStreetlightMesh = generateStreetlightMesh;
    window.generateFireAlarmBoxMesh = generateFireAlarmBoxMesh;
    window.generateCrosswalkMesh = generateCrosswalkMesh;
    window.generateBarricadeMesh = generateBarricadeMesh;
    window.generateGratingMesh = generateGratingMesh;
    window.generateMailboxMesh = generateMailboxMesh;
    window.generatePhoneBoothMesh = generatePhoneBoothMesh;
    window.generateVendingPanelMesh = generateVendingPanelMesh;
    window.generateBicycleRackMesh = generateBicycleRackMesh;
    window.generateLocationMarkerMesh = generateLocationMarkerMesh;
    window.generateSurveillanceCameraMesh = generateSurveillanceCameraMesh;
    window.generateHoseCabinetMesh = generateHoseCabinetMesh;
    window.generateDrainpipeMesh = generateDrainpipeMesh;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      generate404Template,
      DRIFT_REGISTRY,
      generateTetrapodMesh,
      generateTrafficConeMesh,
      generateManholeMesh,
      generateFireHydrantMesh,
      generateCatsEyeMesh,
      generateTransformerMesh,
      generateRailroadSignalMesh,
      generateNoEntrySignMesh,
      generateParkingLockMesh,
      generateStreetlightMesh,
      generateFireAlarmBoxMesh,
      generateCrosswalkMesh,
      generateBarricadeMesh,
      generateGratingMesh,
      generateMailboxMesh,
      generatePhoneBoothMesh,
      generateVendingPanelMesh,
      generateBicycleRackMesh,
      generateLocationMarkerMesh,
      generateSurveillanceCameraMesh,
      generateHoseCabinetMesh,
      generateDrainpipeMesh
    };
  }

})(typeof window !== 'undefined' ? window : global);
