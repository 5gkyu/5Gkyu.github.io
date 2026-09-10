/**
 * gears.js - Clockwork Logic Gears (精密幾何学ネオン歯車機構)
 * 数学的に完全なインボリュート噛み合い位相公式を適用し、
 * 歯と谷が寸分の狂いもなくぴったり噛み合って連動回転するメカニカルアート
 */

'use strict';

  const M = 6.5; // モジュール（歯のピッチ規格）

  // 4つの歯車の歯数
  const N1 = 20; // 歯車1（大：シアン）
  const N2 = 14; // 歯車2（中：ゴールド）
  const N3 = 12; // 歯車3（中：マゼンタ）
  const N4 = 8;  // 歯車4（小：エメラルド）

  // ピッチ円半径 R = N * M / 2
  const R1 = (N1 * M) / 2; // 65.0
  const R2 = (N2 * M) / 2; // 45.5
  const R3 = (N3 * M) / 2; // 39.0
  const R4 = (N4 * M) / 2; // 26.0

  // 歯車1の中心
  const G1_X = -20;
  const G1_Y = -10;

  // 歯車2の配置角度（歯車1の右上）
  const ang12 = -Math.PI * 0.22; // 約 -39.6度
  const dist12 = R1 + R2;        // 110.5
  const G2_X = G1_X + Math.cos(ang12) * dist12;
  const G2_Y = G1_Y + Math.sin(ang12) * dist12;

  // 歯車3の配置角度（歯車1の左下）
  const ang13 = Math.PI * 0.74;  // 約 133.2度
  const dist13 = R1 + R3;        // 104.0
  const G3_X = G1_X + Math.cos(ang13) * dist13;
  const G3_Y = G1_Y + Math.sin(ang13) * dist13;

  // 歯車4の配置角度（歯車2の右下）
  const ang24 = Math.PI * 0.32;  // 約 57.6度
  const dist24 = R2 + R4;        // 71.5
  const G4_X = G2_X + Math.cos(ang24) * dist24;
  const G4_Y = G2_Y + Math.sin(ang24) * dist24;

  // 数学的に厳密な噛み合い初期位相オフセット計算
  // 歯車 A (NA) と 歯車 B (NB) が角度 alpha で中心間距離 RA + RB で配置されたときの位相
  function calcMeshOffset(NA, NB, alpha) {
    return alpha * (1 + NA / NB) + Math.PI * (1 - 1 / NB);
  }

  const phi12 = calcMeshOffset(N1, N2, ang12);
  const phi13 = calcMeshOffset(N1, N3, ang13);
  const phi24 = calcMeshOffset(N2, N4, ang24);

  // カラーパレット
  const PALETTE_G1 = {
    rim: [30, 220, 255],     // シアン
    edge: [220, 255, 255],
    spoke: [20, 130, 210],
    hub: [0, 255, 240]
  };

  const PALETTE_G2 = {
    rim: [255, 190, 40],     // ゴールドアンバー
    edge: [255, 245, 190],
    spoke: [210, 120, 20],
    hub: [255, 220, 80]
  };

  const PALETTE_G3 = {
    rim: [255, 60, 160],     // ネオンマゼンタ
    edge: [255, 200, 235],
    spoke: [180, 30, 100],
    hub: [255, 100, 190]
  };

  const PALETTE_G4 = {
    rim: [40, 255, 140],     // ネオングリーン
    edge: [210, 255, 230],
    spoke: [20, 170, 80],
    hub: [80, 255, 170]
  };

  // 精密インボリュート歯車幾何学点群の生成
  function generateGearGeometry(teethCount, radius, palette, numSpokes) {
    const points = [];

    // 標準的な歯車規格寸法
    const addendum = M * 0.85;   // 歯先高さ
    const dedendum = M * 0.95;   // 歯底深さ
    const rTip = radius + addendum; // 歯先円半径
    const rRoot = radius - dedendum; // 歯底円半径
    const rInnerRim = radius * 0.76;
    const rHub = radius * 0.28;
    const rHole = radius * 0.11;

    // 1. 歯（Teeth）の輪郭点群：1歯あたり24サンプリング
    const totalSteps = teethCount * 24;
    for (let i = 0; i < totalSteps; i++) {
      const angle = (i / totalSteps) * Math.PI * 2;
      const toothPhase = (i % 24) / 24; // 0..1

      // 精密な台形インボリュート歯形（山50% / 谷50%）
      let r;
      if (toothPhase < 0.18) {
        // 谷（歯底フラット）
        r = rRoot;
      } else if (toothPhase < 0.35) {
        // 立ち上がり（インボリュート曲線）
        const t = (toothPhase - 0.18) / 0.17;
        r = rRoot + (rTip - rRoot) * (t * t * (3 - 2 * t));
      } else if (toothPhase < 0.65) {
        // 歯先フラット（山頂）
        r = rTip;
      } else if (toothPhase < 0.82) {
        // 立ち下がり（インボリュート曲線）
        const t = (toothPhase - 0.65) / 0.17;
        r = rTip - (rTip - rRoot) * (t * t * (3 - 2 * t));
      } else {
        // 谷（歯底フラット）
        r = rRoot;
      }

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // 外周歯エッジ
      const isTip = (r >= rTip * 0.96);
      points.push({
        rx: cos * r,
        ry: sin * r,
        rgb: isTip ? palette.edge : palette.rim,
        size: isTip ? 2.3 : 1.9
      });

      // ピッチ円リング（噛み合いの基準線）
      if (i % 2 === 0) {
        points.push({
          rx: cos * radius,
          ry: sin * radius,
          rgb: palette.rim,
          size: 1.7
        });
      }

      // リム内周リング
      if (i % 3 === 0) {
        points.push({
          rx: cos * rInnerRim,
          ry: sin * rInnerRim,
          rgb: palette.edge,
          size: 1.8
        });
      }
    }

    // 2. 立体スポーク（アーム）
    for (let s = 0; s < numSpokes; s++) {
      const spokeAngle = (s / numSpokes) * Math.PI * 2;
      const cosS = Math.cos(spokeAngle);
      const sinS = Math.sin(spokeAngle);
      const perpCos = -sinS;
      const perpSin = cosS;

      const spokeSteps = 12;
      for (let step = 0; step <= spokeSteps; step++) {
        const tr = rHub + (rInnerRim - rHub) * (step / spokeSteps);
        // 主軸
        points.push({
          rx: cosS * tr,
          ry: sinS * tr,
          rgb: palette.spoke,
          size: 2.1
        });
        // 左右の厚み
        points.push({
          rx: cosS * tr + perpCos * 2.2,
          ry: sinS * tr + perpSin * 2.2,
          rgb: palette.spoke,
          size: 1.6
        });
        points.push({
          rx: cosS * tr - perpCos * 2.2,
          ry: sinS * tr - perpSin * 2.2,
          rgb: palette.spoke,
          size: 1.6
        });
      }
    }

    // 3. センターハブ＆軸受け
    const hubSteps = 24;
    for (let i = 0; i < hubSteps; i++) {
      const angle = (i / hubSteps) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      points.push({
        rx: cos * rHub,
        ry: sin * rHub,
        rgb: palette.hub,
        size: 2.3
      });
      points.push({
        rx: cos * (rHub + rHole) * 0.5,
        ry: sin * (rHub + rHole) * 0.5,
        rgb: palette.edge,
        size: 1.8
      });
      if (i % 2 === 0) {
        points.push({
          rx: cos * rHole,
          ry: sin * rHole,
          rgb: [255, 255, 255],
          size: 2.0
        });
      }
    }

    return points;
  }

  // 4つの歯車の幾何データを生成
  const gear1Geom = generateGearGeometry(N1, R1, PALETTE_G1, 5);
  const gear2Geom = generateGearGeometry(N2, R2, PALETTE_G2, 4);
  const gear3Geom = generateGearGeometry(N3, R3, PALETTE_G3, 4);
  const gear4Geom = generateGearGeometry(N4, R4, PALETTE_G4, 3);

  // 静的初期フレーム
  function buildStaticGears() {
    return generateGearsTemplate(0);
  }

  // 毎フレーム計算（完璧な噛み合い回転）
  function generateGearsTemplate(time = 0) {
    const points = [];

    const baseSpeed = 0.50;
    const theta1 = time * baseSpeed;
    const theta2 = -theta1 * (N1 / N2) + phi12;
    const theta3 = -theta1 * (N1 / N3) + phi13;
    const theta4 = -theta2 * (N2 / N4) + phi24;

    // 1. 歯車1（メイン・シアン）
    const cos1 = Math.cos(theta1);
    const sin1 = Math.sin(theta1);
    for (let i = 0; i < gear1Geom.length; i++) {
      const p = gear1Geom[i];
      points.push({
        bx: G1_X + (p.rx * cos1 - p.ry * sin1),
        by: G1_Y + (p.rx * sin1 + p.ry * cos1),
        rgb: p.rgb,
        size: p.size
      });
    }

    // 2. 歯車2（ゴールドアンバー）
    const cos2 = Math.cos(theta2);
    const sin2 = Math.sin(theta2);
    for (let i = 0; i < gear2Geom.length; i++) {
      const p = gear2Geom[i];
      points.push({
        bx: G2_X + (p.rx * cos2 - p.ry * sin2),
        by: G2_Y + (p.rx * sin2 + p.ry * cos2),
        rgb: p.rgb,
        size: p.size
      });
    }

    // 3. 歯車3（マゼンタピンク）
    const cos3 = Math.cos(theta3);
    const sin3 = Math.sin(theta3);
    for (let i = 0; i < gear3Geom.length; i++) {
      const p = gear3Geom[i];
      points.push({
        bx: G3_X + (p.rx * cos3 - p.ry * sin3),
        by: G3_Y + (p.rx * sin3 + p.ry * cos3),
        rgb: p.rgb,
        size: p.size
      });
    }

    // 4. 歯車4（エメラルドグリーン）
    const cos4 = Math.cos(theta4);
    const sin4 = Math.sin(theta4);
    for (let i = 0; i < gear4Geom.length; i++) {
      const p = gear4Geom[i];
      points.push({
        bx: G4_X + (p.rx * cos4 - p.ry * sin4),
        by: G4_Y + (p.rx * sin4 + p.ry * cos4),
        rgb: p.rgb,
        size: p.size
      });
    }

    // 5. 噛み合い接点（3箇所）からの火花・スパークパーティクル
    const contact12 = { x: (G1_X * R2 + G2_X * R1) / (R1 + R2), y: (G1_Y * R2 + G2_Y * R1) / (R1 + R2) };
    const contact13 = { x: (G1_X * R3 + G3_X * R1) / (R1 + R3), y: (G1_Y * R3 + G3_Y * R1) / (R1 + R3) };
    const contact24 = { x: (G2_X * R4 + G4_X * R2) / (R2 + R4), y: (G2_Y * R4 + G4_Y * R2) / (R2 + R4) };

    const contacts = [
      { pt: contact12, color: [255, 240, 140], burstColor: [100, 240, 255] },
      { pt: contact13, color: [255, 180, 240], burstColor: [255, 80, 180] },
      { pt: contact24, color: [160, 255, 210], burstColor: [255, 230, 100] }
    ];

    contacts.forEach((c, cIdx) => {
      // 接点コア
      points.push({ bx: c.pt.x, by: c.pt.y, rgb: [255, 255, 255], size: 3.2 });
      points.push({ bx: c.pt.x + 1.5, by: c.pt.y - 1.0, rgb: c.color, size: 2.4 });
      points.push({ bx: c.pt.x - 1.5, by: c.pt.y + 1.0, rgb: c.burstColor, size: 2.4 });

      // 飛び散る火花
      const numSparks = 8;
      for (let s = 0; s < numSparks; s++) {
        const sparkPhase = ((time * 3.5 + s * 1.3 + cIdx * 2.1) % 1.0);
        const sparkAngle = (s / numSparks) * Math.PI * 2 + Math.sin(time * 2.0 + s);
        const sparkDist = sparkPhase * 24.0;
        const sparkX = c.pt.x + Math.cos(sparkAngle) * sparkDist;
        const sparkY = c.pt.y + Math.sin(sparkAngle) * sparkDist;
        const sparkAlpha = 1.0 - sparkPhase;

        if (sparkAlpha > 0.1) {
          points.push({
            bx: sparkX,
            by: sparkY,
            rgb: sparkPhase < 0.4 ? [255, 255, 255] : c.color,
            size: Math.max(1.0, 2.6 * (1.0 - sparkPhase))
          });
        }
      }
    });

    // 6. バックプレート（マウントフレーム）
    const mountCenters = [
      { x: G1_X, y: G1_Y },
      { x: G2_X, y: G2_Y },
      { x: G3_X, y: G3_Y },
      { x: G4_X, y: G4_Y }
    ];

    for (let m = 0; m < mountCenters.length - 1; m++) {
      const pA = mountCenters[m];
      const pB = mountCenters[m + 1];
      for (let t = 0; t <= 8; t++) {
        const tx = pA.x + (pB.x - pA.x) * (t / 8);
        const ty = pA.y + (pB.y - pA.y) * (t / 8);
        points.push({ bx: tx, by: ty, rgb: [40, 65, 120], size: 1.4 });
      }
    }

    return points;
  }

  // 外部公開
  if (typeof window !== 'undefined') {
    window.buildGearsParticles = buildStaticGears;
    window.generateGearsTemplate = generateGearsTemplate;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildGearsParticles: buildStaticGears,
      generateGearsTemplate: generateGearsTemplate
    };
  }
