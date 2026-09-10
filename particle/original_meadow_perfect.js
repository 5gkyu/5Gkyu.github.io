/**
 * meadow.js - Starlight Meadow & Libra Constellation (草原に包まれる少女とてんびん座 - 完全改善版)
 * 
 * 修正点:
 * 1. 髪の毛を後ろへ広がる羽状から、背中に沿って自然に下へ垂れる清楚なストレートボブ/ミディアムヘアに刷新。
 * 2. 少女の手前に豊かな草の葉と月光花をしっかり重ね、下半身・膝・ドレスが自然に草の中に隠れる完全オクルージョンを実現。
 * 3. てんびん座アニメーションと満天の星空・水平パノラマ草原を完全調和。
 */

'use strict';

const MEADOW_PARTICLE_COUNT = 4500;

// 深夜の草原・月光花・てんびん座・白黒少女のカラーパレット
const PALETTE_MEADOW = {
  // 草原
  mgGrass: [20, 130, 90],          // 深い夜の草原
  mgGrassEdge: [150, 245, 195],    // 草の先端（星明かりハイライト）
  mgGrassFlow: [45, 185, 130],     // 風の波紋

  // 深夜の幻想的な野花（ナイトブロッサム）
  flowerMoonWhite: [245, 255, 255],// 月光白
  flowerLuminousCyan: [85, 235, 255],// ルミナスシアン
  flowerNightViolet: [205, 150, 255],// ナイトバイオレット
  flowerMoonGold: [255, 245, 140],  // 月光ゴールド
  flowerCore: [255, 255, 200],     // 花芯

  // てんびん座（Libra）
  constellationStar: [255, 255, 255],     // てんびん座の主星（純白）
  constellationCyan: [130, 235, 255],     // 主星のシアンオーラ
  constellationLine: [120, 190, 255],     // 星座線

  // 少女（洗練された白黒シルエット）
  girlSilhouetteEdge: [250, 255, 255], // 月光ハイライト（純白）
  girlSilhouetteMid: [150, 170, 190],  // 階調（スモーキーグレー）
  girlSilhouetteDark: [15, 20, 32],    // 影（ダークチャコール）

  // 遠景・背景
  bgHillNear: [18, 70, 75],        // 近い丘
  bgHillFar: [14, 38, 70],         // 遠い山並み（大気遠近の青）
  bgMist: [90, 165, 205],          // 地平線の霞
  starSky: [210, 240, 255]         // 夜空の星
};

function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// -------------------------------------------------------------
// 1. てんびん座（Libra Constellation）
// -------------------------------------------------------------
function generateLibraConstellation() {
  const stars = [
    { id: 'beta', x: 150, y: -195, name: 'Zubeneschamali', mag: 3.2 },
    { id: 'alpha', x: 85, y: -145, name: 'Zubenelgenubi', mag: 3.0 },
    { id: 'gamma', x: 220, y: -170, name: 'Zubenelakrab', mag: 2.7 },
    { id: 'sigma', x: 195, y: -120, name: 'Brachium', mag: 2.8 },
    { id: 'upsilon', x: 120, y: -110, name: 'Upsilon Lib', mag: 2.4 },
    { id: 'theta', x: 160, y: -145, name: 'Theta Lib', mag: 2.2 }
  ];

  const lines = [
    ['beta', 'alpha'],
    ['beta', 'gamma'],
    ['alpha', 'upsilon'],
    ['gamma', 'sigma'],
    ['upsilon', 'sigma'],
    ['beta', 'theta'],
    ['theta', 'upsilon'],
    ['theta', 'sigma']
  ];

  const linePoints = [];
  const starMap = {};
  stars.forEach(s => { starMap[s.id] = s; });

  lines.forEach(([sId1, sId2]) => {
    const s1 = starMap[sId1];
    const s2 = starMap[sId2];
    const dist = Math.sqrt((s2.x - s1.x) ** 2 + (s2.y - s1.y) ** 2);
    const steps = Math.floor(dist / 4.0);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      linePoints.push({
        x: s1.x + (s2.x - s1.x) * t,
        y: s1.y + (s2.y - s1.y) * t,
        tRatio: t
      });
    }
  });

  return { stars, linePoints };
}

// -------------------------------------------------------------
// 2. 少女の精密白黒シルエット（清楚なストレートボブ/ミディアムヘア）
// -------------------------------------------------------------
function generateGirlSilhouette() {
  const pts = [];
  const baseX = -280;
  const baseY = 10; // 接地Y座標

  // (A) 頭部（小さな丸みと右上を見上げる横顔）
  for (let y = -26; y <= -18; y += 1.0) {
    for (let x = -5; x <= 5; x += 1.0) {
      const dHead = Math.sqrt((x - 0.0) ** 2 + (y - (-22.0)) ** 2);
      if (dHead <= 3.8) {
        const isProfileEdge = (x >= 1.8 && y <= -20); // 見上げる輪郭
        const isTopEdge = (y <= -24.5);
        let col = PALETTE_MEADOW.girlSilhouetteDark;
        if (isProfileEdge || isTopEdge) col = PALETTE_MEADOW.girlSilhouetteEdge;

        pts.push({
          part: 'head',
          rx: x, ry: y,
          col: col,
          size: 1.8
        });
      }
    }
  }

  // (B) 清楚なストレートヘア（後頭部から背中に沿って真下に自然に下りる）
  // 後ろへ翼のように広がらず、背中に沿って下りる上品な髪
  for (let y = -24; y <= -10; y += 1.0) {
    const t = (y - (-24)) / 14; // 0(頭頂部) .. 1(毛先)
    const hairStartX = -4.2 - t * 0.8; // 背中のラインにぴったり沿う
    const hairEndX = -1.0;

    for (let x = hairStartX; x <= hairEndX; x += 0.9) {
      const isBackEdge = (Math.abs(x - hairStartX) < 0.8);
      pts.push({
        part: 'hair_straight',
        tRatio: t,
        rx: x, ry: y,
        col: isBackEdge ? PALETTE_MEADOW.girlSilhouetteEdge : PALETTE_MEADOW.girlSilhouetteMid,
        size: 1.7
      });
    }
  }

  // (C) 首・背中・丸まった身体（膝を抱えて座る）
  for (let y = -18; y <= 5; y += 1.0) {
    const t = (y - (-18)) / 23;
    const backX = -3.8 - Math.sin(t * Math.PI * 0.75) * 3.8; // 丸まった背中
    const frontX = 1.2 + Math.sin(t * Math.PI * 0.6) * 5.8;  // 前面の膝・胸

    for (let x = backX; x <= frontX; x += 1.0) {
      const isEdge = (Math.abs(x - backX) < 1.0 || Math.abs(x - frontX) < 1.0);
      pts.push({
        part: 'body',
        rx: x, ry: y,
        col: isEdge ? PALETTE_MEADOW.girlSilhouetteEdge : ((x < (backX + frontX) * 0.5) ? PALETTE_MEADOW.girlSilhouetteMid : PALETTE_MEADOW.girlSilhouetteDark),
        size: 1.8
      });
    }
  }

  // (D) 膝を抱える腕
  for (let a = 0; a <= 1.0; a += 0.08) {
    const ax = -1.5 + a * 7.5;
    const ay = -11.0 + Math.sin(a * Math.PI * 0.75) * 5.5;
    pts.push({
      part: 'arm',
      rx: ax, ry: ay,
      col: PALETTE_MEADOW.girlSilhouetteEdge,
      size: 1.6
    });
  }

  return { baseX, baseY, pts };
}

// -------------------------------------------------------------
// 3. 広大な草原 ＆ 深夜の月光花 ＆ 少女を包み隠す草（完全オクルージョン）
// -------------------------------------------------------------
function generateMeadowAndFlowersData() {
  const pts = [];
  const totalCount = 2850;

  for (let i = 0; i < totalCount; i++) {
    const r0 = pseudoRandom(i * 1.73 + 0.1);
    const r1 = pseudoRandom(i * 1.73 + 0.2);
    const r2 = pseudoRandom(i * 1.73 + 0.3);
    const r3 = pseudoRandom(i * 1.73 + 0.4);

    const depthY = -35 + r1 * 175; // -35 (奥) .. +140 (手前)
    const depthRatio = (depthY + 35) / 175;
    const spreadX = (r0 - 0.5) * 1040;

    const tuftH = 6 + depthRatio * 14;

    const isFlower = (r2 < 0.30);
    let flowerType = 'grass';
    let flowerCol = PALETTE_MEADOW.mgGrassEdge;

    if (isFlower) {
      if (r3 < 0.30) {
        flowerType = 'moon_white';
        flowerCol = PALETTE_MEADOW.flowerMoonWhite;
      } else if (r3 < 0.60) {
        flowerType = 'luminous_cyan';
        flowerCol = PALETTE_MEADOW.flowerLuminousCyan;
      } else if (r3 < 0.85) {
        flowerType = 'night_violet';
        flowerCol = PALETTE_MEADOW.flowerNightViolet;
      } else {
        flowerType = 'moon_gold';
        flowerCol = PALETTE_MEADOW.flowerMoonGold;
      }
    }

    pts.push({
      gx: spreadX,
      gy: depthY,
      depthRatio: depthRatio,
      tuftH: tuftH,
      isFlower: isFlower,
      flowerType: flowerType,
      flowerCol: flowerCol,
      phaseOffset: spreadX * 0.008 + depthY * 0.012 + r0 * Math.PI,
      size: (isFlower ? 1.4 : 1.1) + depthRatio * 1.1
    });
  }

  // ★少女の足元・手前（X: -310 .. -245, Y: 11 .. 45）に、少女の腰・膝・裾をしっかり隠す草・月光花を約 180点配置！
  for (let i = 0; i < 180; i++) {
    const r0 = pseudoRandom(i * 2.87 + 0.1);
    const r1 = pseudoRandom(i * 2.87 + 0.2);
    const r2 = pseudoRandom(i * 2.87 + 0.3);
    const r3 = pseudoRandom(i * 2.87 + 0.4);

    const gx = -310 + r0 * 65;
    const gy = 11 + r1 * 34; // 少女の接地Y(10)より手前
    const depthRatio = (gy + 35) / 175;
    // 少女の腰や膝の前にしっかり届く高さ (8〜16px)
    const tuftH = 8 + r2 * 10;
    const isFlower = (r3 < 0.40);

    pts.push({
      gx: gx,
      gy: gy,
      depthRatio: depthRatio,
      tuftH: tuftH,
      isFlower: isFlower,
      flowerType: isFlower ? 'luminous_cyan' : 'grass',
      flowerCol: isFlower ? PALETTE_MEADOW.flowerLuminousCyan : PALETTE_MEADOW.mgGrassEdge,
      phaseOffset: gx * 0.008 + gy * 0.012,
      size: 1.6 + depthRatio * 0.7
    });
  }

  return pts;
}

// -------------------------------------------------------------
// 4. 遠景の山並み・低丘・地平線ミスト
// -------------------------------------------------------------
function generateBackgroundData() {
  const pts = [];

  for (let x = -520; x <= 520; x += 3.5) {
    const mountainY = -68 + Math.sin(x * 0.009) * 20 + Math.sin(x * 0.022 + 1.1) * 8;
    for (let y = mountainY; y <= -32; y += 4.5) {
      const depthAlpha = (-32 - y) / 36;
      pts.push({
        type: 'mountain',
        bx: x,
        by: y,
        rgb: [
          Math.round(PALETTE_MEADOW.bgHillFar[0] * (1 - depthAlpha * 0.25)),
          Math.round(PALETTE_MEADOW.bgHillFar[1] * (1 - depthAlpha * 0.15)),
          Math.round(PALETTE_MEADOW.bgHillFar[2] * (1 + depthAlpha * 0.2))
        ],
        size: 1.6
      });
    }
  }

  for (let x = -500; x <= 500; x += 3.0) {
    const hillY = -44 + Math.cos(x * 0.013 + 0.4) * 12 + Math.sin(x * 0.028) * 5;
    for (let y = hillY; y <= -24; y += 4.0) {
      pts.push({
        type: 'hill',
        bx: x,
        by: y,
        rgb: PALETTE_MEADOW.bgHillNear,
        size: 1.7
      });
    }
  }

  for (let i = 0; i < 180; i++) {
    const r0 = pseudoRandom(i * 3.3 + 0.5);
    const r1 = pseudoRandom(i * 3.3 + 0.8);
    pts.push({
      type: 'mist',
      bx: (r0 - 0.5) * 1000,
      by: -38 + (r1 - 0.5) * 14,
      size: 1.4 + r0 * 1.1
    });
  }

  return pts;
}

// -------------------------------------------------------------
// 5. 夜空の星々 ＆ 光粒子
// -------------------------------------------------------------
function generateSkyData() {
  const pts = [];

  for (let i = 0; i < 480; i++) {
    const r0 = pseudoRandom(i * 4.1 + 0.1);
    const r1 = pseudoRandom(i * 4.1 + 0.2);
    const r2 = pseudoRandom(i * 4.1 + 0.3);

    const sx = (r0 - 0.5) * 1020;
    const sy = -240 + r1 * 180;

    pts.push({
      type: 'star',
      sx: sx,
      sy: sy,
      twinklePhase: r2 * Math.PI * 2,
      twinkleSpeed: 1.1 + r0 * 2.2,
      size: 1.2 + r2 * 1.5
    });
  }

  for (let i = 0; i < 140; i++) {
    const r0 = pseudoRandom(i * 5.2 + 0.2);
    const r1 = pseudoRandom(i * 5.2 + 0.5);
    const r2 = pseudoRandom(i * 5.2 + 0.8);

    pts.push({
      type: 'spore',
      seedX: r0,
      seedY: r1,
      size: 1.3 + r0 * 1.0
    });
  }

  return pts;
}

const libraData = generateLibraConstellation();
const girlData = generateGirlSilhouette();
const meadowData = generateMeadowAndFlowersData();
const bgData = generateBackgroundData();
const skyData = generateSkyData();

// --- 毎フレームリアルタイムアニメーション生成 ---
function generateMeadowTemplate(time = 0) {
  const skyPoints = [];
  const bgPoints = [];
  const groundAndGirlPoints = [];

  // ==========================================
  // レイヤー1: 背景の星空 ＆ てんびん座 ＆ 舞い上がる光粒子
  // ==========================================
  for (let i = 0; i < skyData.length; i++) {
    const p = skyData[i];
    if (p.type === 'star') {
      const twinkle = Math.sin(time * p.twinkleSpeed + p.twinklePhase);
      const alphaVal = 0.5 + 0.5 * twinkle;
      const starRgb = [
        Math.round(PALETTE_MEADOW.starSky[0] * (0.7 + 0.3 * alphaVal)),
        Math.round(PALETTE_MEADOW.starSky[1] * (0.7 + 0.3 * alphaVal)),
        Math.round(PALETTE_MEADOW.starSky[2])
      ];

      skyPoints.push({
        bx: p.sx,
        by: p.sy,
        rgb: starRgb,
        size: p.size * (0.85 + 0.3 * alphaVal)
      });
    } else if (p.type === 'spore') {
      const progress = ((time * 0.07 + p.seedX) % 1.0);
      const sporeX = -480 + progress * 960 + Math.sin(time * 1.8 + p.seedY * 10) * 16;
      const sporeY = 80 - (p.seedY * 280) - Math.cos(time * 1.4 + p.seedX * 8) * 18;

      skyPoints.push({
        bx: sporeX,
        by: sporeY,
        rgb: [220, 255, 240],
        size: Math.max(0.6, p.size * (1.0 - progress * 0.4))
      });
    }
  }

  // てんびん座アニメーション
  const linePulse = 0.65 + 0.35 * Math.sin(time * 1.5);
  for (let i = 0; i < libraData.linePoints.length; i++) {
    const lp = libraData.linePoints[i];
    const waveOnLine = Math.sin(time * 3.0 - lp.tRatio * Math.PI * 2);
    const lineAlpha = linePulse * (0.8 + 0.2 * waveOnLine);
    const lineCol = [
      Math.round(PALETTE_MEADOW.constellationLine[0] * lineAlpha),
      Math.round(PALETTE_MEADOW.constellationLine[1] * lineAlpha),
      Math.round(PALETTE_MEADOW.constellationLine[2] * (0.8 + 0.2 * lineAlpha))
    ];

    skyPoints.push({
      bx: lp.x,
      by: lp.y,
      rgb: lineCol,
      size: 1.2 + 0.3 * waveOnLine
    });
  }

  for (let i = 0; i < libraData.stars.length; i++) {
    const s = libraData.stars[i];
    const starTwinkle = Math.sin(time * 2.2 + i * 1.2);
    const pulseMag = s.mag * (1.0 + starTwinkle * 0.25);

    skyPoints.push({
      bx: s.x,
      by: s.y,
      rgb: PALETTE_MEADOW.constellationStar,
      size: pulseMag * 1.1
    });

    const auraDist = 2.5 + starTwinkle * 0.8;
    skyPoints.push({ bx: s.x - auraDist, by: s.y, rgb: PALETTE_MEADOW.constellationCyan, size: 1.5 });
    skyPoints.push({ bx: s.x + auraDist, by: s.y, rgb: PALETTE_MEADOW.constellationCyan, size: 1.5 });
    skyPoints.push({ bx: s.x, by: s.y - auraDist, rgb: PALETTE_MEADOW.constellationCyan, size: 1.5 });
    skyPoints.push({ bx: s.x, by: s.y + auraDist, rgb: PALETTE_MEADOW.constellationCyan, size: 1.5 });
  }

  // ==========================================
  // レイヤー2: 遠景の山並み ＆ 低丘 ＆ 地平線ミスト
  // ==========================================
  for (let i = 0; i < bgData.length; i++) {
    const p = bgData[i];
    if (p.type === 'mist') {
      const mistSway = Math.sin(time * 1.2 + p.bx * 0.01) * 6;
      bgPoints.push({
        bx: p.bx + mistSway,
        by: p.by,
        rgb: PALETTE_MEADOW.bgMist,
        size: p.size
      });
    } else {
      bgPoints.push({
        bx: p.bx,
        by: p.by,
        rgb: p.rgb,
        size: p.size
      });
    }
  }

  // ==========================================
  // レイヤー3 & 4: 草原・花・少女のZ軸深度統合ソート
  // ==========================================

  // (A) 草原 ＆ 月光花（手前の草は少女の前にしっかり配置）
  for (let i = 0; i < meadowData.length; i++) {
    const p = meadowData[i];
    const windWave = Math.sin(time * 1.6 - p.gx * 0.007 + p.gy * 0.010);
    const offsetX = windWave * (1.6 + p.depthRatio * 3.8);
    const isWaveHighlight = (!p.isFlower && windWave > 0.65);

    // 茎・根元
    groundAndGirlPoints.push({
      zDepthY: p.gy,
      bx: p.gx,
      by: p.gy,
      rgb: PALETTE_MEADOW.mgGrass,
      size: p.size * 0.9
    });

    if (p.isFlower) {
      const flowerGlow = Math.sin(time * 2.4 + p.phaseOffset) * 0.15;
      const flowerX = p.gx + offsetX;
      const flowerY = p.gy - p.tuftH;

      groundAndGirlPoints.push({
        zDepthY: p.gy,
        bx: flowerX,
        by: flowerY,
        rgb: p.flowerCol,
        size: p.size * (1.2 + flowerGlow)
      });

      if (p.depthRatio > 0.35) {
        groundAndGirlPoints.push({
          zDepthY: p.gy,
          bx: flowerX - 1.2,
          by: flowerY - 0.6,
          rgb: p.flowerCol,
          size: p.size * 0.95
        });
        groundAndGirlPoints.push({
          zDepthY: p.gy,
          bx: flowerX + 1.2,
          by: flowerY - 0.6,
          rgb: p.flowerCol,
          size: p.size * 0.95
        });
        groundAndGirlPoints.push({
          zDepthY: p.gy,
          bx: flowerX,
          by: flowerY - 0.3,
          rgb: PALETTE_MEADOW.flowerCore,
          size: p.size * 0.8
        });
      }
    } else {
      groundAndGirlPoints.push({
        zDepthY: p.gy,
        bx: p.gx + offsetX,
        by: p.gy - p.tuftH,
        rgb: isWaveHighlight ? PALETTE_MEADOW.mgGrassFlow : PALETTE_MEADOW.mgGrassEdge,
        size: p.size * 1.05
      });
    }
  }

  // (B) 少女（清楚なストレートボブ／自然な呼吸レベルの揺れ）
  const { baseX, baseY, pts: gPts } = girlData;
  const bodySwayX = Math.sin(time * 1.2) * 0.4;
  const bodySwayY = Math.cos(time * 0.9) * 0.25;

  for (let i = 0; i < gPts.length; i++) {
    const p = gPts[i];
    let animX = bodySwayX;
    let animY = bodySwayY;

    if (p.part === 'hair_straight') {
      // 髪の毛先が風でわずかに自然にそよぐ（羽のような広がりを完全解消）
      const hairWind = Math.sin(time * 1.5);
      animX += -hairWind * (p.tRatio * 0.9);
      animY += Math.cos(time * 1.2) * (p.tRatio * 0.5);
    }

    groundAndGirlPoints.push({
      zDepthY: baseY, // 少女の接地深度 Y=10
      bx: baseX + p.rx + animX,
      by: baseY + p.ry + animY,
      rgb: p.col,
      size: p.size
    });
  }

  // Z軸ソート（奥から手前へ正確に描画）
  groundAndGirlPoints.sort((a, b) => a.zDepthY - b.zDepthY);

  return skyPoints.concat(bgPoints, groundAndGirlPoints);
}

function buildMeadowParticles() {
  return generateMeadowTemplate(0);
}

if (typeof window !== 'undefined') {
  window.buildMeadowParticles = buildMeadowParticles;
  window.generateMeadowTemplate = generateMeadowTemplate;
  window.generateCustomTemplate = generateMeadowTemplate;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildMeadowParticles: buildMeadowParticles,
    generateMeadowTemplate: generateMeadowTemplate,
    generateCustomTemplate: generateMeadowTemplate
  };
}
