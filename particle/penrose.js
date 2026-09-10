/**
 * penrose.js - Penrose Stairs (ペンローズの階段 / 不可能立体)
 * ワイドパースペクティブ＆20段サイバースペクトラムによる完全版ペンローズ階段
 * 視線・顔がくっきりとした人間キャラクターのアニメーション
 */

'use strict';

  const COS30 = Math.cos(Math.PI / 6);
  const SIN30 = Math.sin(Math.PI / 6);
  const SCALE = 25.0; // グリッド基本単位

  // HSLからRGBへの変換ヘルパー
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  // 等角投影変換
  function isoProject(u, v, z) {
    return {
      bx: (u - v) * COS30 * SCALE,
      by: (u + v) * SIN30 * SCALE - z * SCALE
    };
  }

  // 1段のサイズパラメータ
  const W = 1.0;  // 幅
  const D = 1.0;  // 奥行き
  const H = 0.85; // 垂直段差の高さ

  // ワイド比率の20段ペンローズ階段ステップ定義 (U: 0..6, V: 0..4)
  const rawSteps = [
    // Leg 0: 手前左 -> 左奥 (4段)
    { u: 0, v: 0, z: 0.00 },
    { u: 0, v: 1, z: 0.85 },
    { u: 0, v: 2, z: 1.70 },
    { u: 0, v: 3, z: 2.55 },

    // Leg 1: 左奥 -> 右奥 (6段ワイドスパン)
    { u: 0, v: 4, z: 3.40 },
    { u: 1, v: 4, z: 4.25 },
    { u: 2, v: 4, z: 5.10 },
    { u: 3, v: 4, z: 5.95 },
    { u: 4, v: 4, z: 6.80 },
    { u: 5, v: 4, z: 7.65 },

    // Leg 2: 右奥 -> 右手前 (4段)
    { u: 6, v: 4, z: 8.50 },
    { u: 6, v: 3, z: 7.65 },
    { u: 6, v: 2, z: 6.80 },
    { u: 6, v: 1, z: 5.95 },

    // Leg 3: 右手前 -> 手前左 (6段ワイドスパン)
    { u: 6, v: 0, z: 5.10 },
    { u: 5, v: 0, z: 4.25 },
    { u: 4, v: 0, z: 3.40 },
    { u: 3, v: 0, z: 2.55 },
    { u: 2, v: 0, z: 1.70 },
    { u: 1, v: 0, z: 0.85 }
  ];

  const numSteps = rawSteps.length;

  // 階段の立体点群生成
  function generateStairSolidPoints() {
    const points = [];

    rawSteps.forEach((st, idx) => {
      const u = st.u;
      const v = st.v;
      const z = st.z;

      // 20段それぞれの美しいサイバーカラースペクトラム
      const hue = (idx / numSteps) * 360;
      const rgbTop = hslToRgb(hue, 0.92, 0.62);       // 踏面（鮮やか）
      const rgbEdge = hslToRgb(hue, 0.40, 0.94);      // 踏面エッジ（純白に近いハイライト）
      const rgbFront = hslToRgb(hue, 0.85, 0.35);     // 前蹴上面（濃い段差壁）
      const rgbSide = hslToRgb(hue, 0.85, 0.22);      // 側蹴上面（暗い段差壁）

      // 1. 踏面（上面・床面）を高密度グリッドで充填
      const topStepsU = 7;
      const topStepsV = 7;
      for (let iu = 0; iu <= topStepsU; iu++) {
        for (let iv = 0; iv <= topStepsV; iv++) {
          const du = (iu / topStepsU) * W;
          const dv = (iv / topStepsV) * D;
          const pt = isoProject(u + du, v + dv, z + H);
          const isBorder = (iu === 0 || iu === topStepsU || iv === 0 || iv === topStepsV);
          points.push({
            bx: pt.bx,
            by: pt.by,
            rgb: isBorder ? rgbEdge : rgbTop,
            size: isBorder ? 2.5 : 2.0
          });
        }
      }

      // 2. 垂直な蹴上面（段差の壁）
      const frontStepsZ = 5;
      for (let iu = 0; iu <= topStepsU; iu++) {
        for (let iz = 0; iz < frontStepsZ; iz++) {
          const du = (iu / topStepsU) * W;
          const dz = (iz / frontStepsZ) * H;
          const ptFront = isoProject(u + du, v, z + dz);
          points.push({
            bx: ptFront.bx,
            by: ptFront.by,
            rgb: rgbFront,
            size: 1.6
          });
        }
      }

      const sideStepsZ = 5;
      for (let iv = 0; iv <= topStepsV; iv++) {
        for (let iz = 0; iz < sideStepsZ; iz++) {
          const dv = (iv / topStepsV) * D;
          const dz = (iz / sideStepsZ) * H;
          const ptSide = isoProject(u, v + dv, z + dz);
          points.push({
            bx: ptSide.bx,
            by: ptSide.by,
            rgb: rgbSide,
            size: 1.6
          });
        }
      }
    });

    // 3. 台座フレーム
    const RGB_BASE_FRAME = [55, 95, 175];
    const baseDepth = 2.5;

    const corners = [
      { u: 0, v: 0 },
      { u: 0, v: 5 },
      { u: 7, v: 5 },
      { u: 7, v: 0 }
    ];

    corners.forEach(c => {
      for (let z = -baseDepth; z <= 0; z += 0.35) {
        const pt = isoProject(c.u, c.v, z);
        points.push({ bx: pt.bx, by: pt.by, rgb: RGB_BASE_FRAME, size: 1.5 });
      }
    });

    for (let t = 0; t <= 7.0; t += 0.35) {
      const p1 = isoProject(t, 0, -baseDepth);
      const p2 = isoProject(t, 5, -baseDepth);
      points.push({ bx: p1.bx, by: p1.by, rgb: RGB_BASE_FRAME, size: 1.4 });
      points.push({ bx: p2.bx, by: p2.by, rgb: RGB_BASE_FRAME, size: 1.4 });
    }
    for (let t = 0; t <= 5.0; t += 0.35) {
      const p1 = isoProject(0, t, -baseDepth);
      const p2 = isoProject(7, t, -baseDepth);
      points.push({ bx: p1.bx, by: p1.by, rgb: RGB_BASE_FRAME, size: 1.4 });
      points.push({ bx: p2.bx, by: p2.by, rgb: RGB_BASE_FRAME, size: 1.4 });
    }

    return points;
  }

  // 静的階段の点群を初回キャッシュ
  const staticStairs = generateStairSolidPoints();

  // 歩行人間（ウォーカー）の計算
  const walkerKeyframes = rawSteps.map(st => {
    const centerProj = isoProject(st.u + W * 0.5, st.v + D * 0.5, st.z + H);
    return {
      bx: centerProj.bx,
      by: centerProj.by
    };
  });

  const totalWalkerSteps = walkerKeyframes.length;

  function getWalkerPosition(progress) {
    const pNorm = ((progress % 1.0) + 1.0) % 1.0;
    const fIndex = pNorm * totalWalkerSteps;
    const idx0 = Math.floor(fIndex) % totalWalkerSteps;
    const idx1 = (idx0 + 1) % totalWalkerSteps;
    const frac = fIndex - Math.floor(fIndex);

    const k0 = walkerKeyframes[idx0];
    const k1 = walkerKeyframes[idx1];

    const curBx = k0.bx + (k1.bx - k0.bx) * frac;
    const curBy = k0.by + (k1.by - k0.by) * frac;

    // 進行方向ベクトル
    const dx = k1.bx - k0.bx;
    const dy = k1.by - k0.by;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;

    // 足の踏み込み・登りバウンス
    const stepBounce = Math.sin(frac * Math.PI) * 7.0;

    return {
      bx: curBx,
      by: curBy - stepBounce,
      frac: frac,
      dirX: dirX,
      dirY: dirY
    };
  }

  // 人間キャラクターの点群生成 (顔・目・目線付き)
  function generateWalkerPoints(walker) {
    const points = [];
    const RGB_HEAD     = [255, 240, 180]; // 頭部（ペールゴールド）
    const RGB_EYE      = [0, 240, 255];   // 瞳（鮮やかなシアンブルー）
    const RGB_EYE_PUPIL= [255, 255, 255]; // 瞳ハイライト（白）
    const RGB_GAZE     = [80, 255, 230];  // 目線ビーム / アイライト
    const RGB_BODY     = [255, 170, 50];  // 胴体（オレンジゴールド）
    const RGB_LIMB     = [255, 90, 60];   // 手足（コーラルレッド）

    const rootX = walker.bx;
    const rootY = walker.by - 4;
    const walkCycle = walker.frac * Math.PI * 2;
    const dirX = walker.dirX;
    const dirY = walker.dirY;

    // 1. 頭部 (円形 16点)
    const headRadius = 7.0;
    const headCenterY = rootY - 37;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      points.push({
        bx: rootX + Math.cos(a) * headRadius,
        by: headCenterY + Math.sin(a) * headRadius,
        rgb: RGB_HEAD,
        size: 2.3
      });
    }
    // 頭部内側ベース
    points.push({ bx: rootX, by: headCenterY, rgb: RGB_HEAD, size: 2.5 });

    // 2. 顔（目・視線）: 進行方向 dirX, dirY に向けて配置
    const eyeOffsetX = dirX * 4.2;
    const eyeOffsetY = dirY * 3.0 - 0.5; // やや上目遣いで前を見つめる

    // 左右の目のオフセット（進行方向と直交するベクトル）
    const perpX = -dirY * 2.6;
    const perpY = dirX * 2.6;

    // 左目
    const eye1X = rootX + eyeOffsetX + perpX;
    const eye1Y = headCenterY + eyeOffsetY + perpY;
    points.push({ bx: eye1X, by: eye1Y, rgb: RGB_EYE, size: 2.4 });
    points.push({ bx: eye1X + dirX * 0.8, by: eye1Y + dirY * 0.8, rgb: RGB_EYE_PUPIL, size: 1.8 });

    // 右目
    const eye2X = rootX + eyeOffsetX - perpX;
    const eye2Y = headCenterY + eyeOffsetY - perpY;
    points.push({ bx: eye2X, by: eye2Y, rgb: RGB_EYE, size: 2.4 });
    points.push({ bx: eye2X + dirX * 0.8, by: eye2Y + dirY * 0.8, rgb: RGB_EYE_PUPIL, size: 1.8 });

    // 目線（視線の先を見つめるアイライト・パーティクル 2点）
    const gaze1X = rootX + dirX * 12.0;
    const gaze1Y = headCenterY + dirY * 8.0;
    const gaze2X = rootX + dirX * 18.0;
    const gaze2Y = headCenterY + dirY * 12.0;
    points.push({ bx: gaze1X, by: gaze1Y, rgb: RGB_GAZE, size: 2.0 });
    points.push({ bx: gaze2X, by: gaze2Y, rgb: [180, 255, 245], size: 1.5 });

    // 3. 胴体 (背骨・胸・腰 18点)
    const spineTopY = headCenterY + headRadius + 2;
    const hipY = rootY - 13;
    for (let i = 0; i <= 5; i++) {
      const sy = spineTopY + (hipY - spineTopY) * (i / 5);
      points.push({ bx: rootX, by: sy, rgb: RGB_BODY, size: 2.6 });
      points.push({ bx: rootX - 2.5, by: sy, rgb: RGB_BODY, size: 2.2 });
      points.push({ bx: rootX + 2.5, by: sy, rgb: RGB_BODY, size: 2.2 });
    }

    // 4. 脚部 (歩行スイング)
    const legSwing1 = Math.sin(walkCycle);
    const legSwing2 = -legSwing1;
    const legLift1 = Math.max(0, Math.sin(walkCycle)) * 6;
    const legLift2 = Math.max(0, Math.sin(walkCycle + Math.PI)) * 6;

    // 左脚
    const knee1X = rootX - 4 + legSwing1 * 5;
    const knee1Y = hipY + 9 - legLift1;
    const foot1X = rootX - 5 + legSwing1 * 8;
    const foot1Y = rootY - legLift1;

    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      points.push({ bx: rootX - 2 + (knee1X - rootX + 2) * t, by: hipY + (knee1Y - hipY) * t, rgb: RGB_LIMB, size: 2.2 });
      points.push({ bx: knee1X + (foot1X - knee1X) * t, by: knee1Y + (foot1Y - knee1Y) * t, rgb: RGB_LIMB, size: 2.2 });
    }

    // 右脚
    const knee2X = rootX + 4 + legSwing2 * 5;
    const knee2Y = hipY + 9 - legLift2;
    const foot2X = rootX + 5 + legSwing2 * 8;
    const foot2Y = rootY - legLift2;

    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      points.push({ bx: rootX + 2 + (knee2X - rootX - 2) * t, by: hipY + (knee2Y - hipY) * t, rgb: RGB_LIMB, size: 2.2 });
      points.push({ bx: knee2X + (foot2X - knee2X) * t, by: knee2Y + (foot2Y - knee2Y) * t, rgb: RGB_LIMB, size: 2.2 });
    }

    // 5. 腕部
    const armSwing1 = -legSwing1 * 7;
    const armSwing2 = -legSwing2 * 7;
    const shoulderY = spineTopY + 2;

    const hand1X = rootX - 7 + armSwing1;
    const hand1Y = shoulderY + 12;
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      points.push({ bx: rootX - 3 + (hand1X - rootX + 3) * t, by: shoulderY + (hand1Y - shoulderY) * t, rgb: RGB_BODY, size: 2.0 });
    }

    const hand2X = rootX + 7 + armSwing2;
    const hand2Y = shoulderY + 12;
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      points.push({ bx: rootX + 3 + (hand2X - rootX - 3) * t, by: shoulderY + (hand2Y - shoulderY) * t, rgb: RGB_BODY, size: 2.0 });
    }

    return points;
  }

  // 外部公開
  function generatePenroseTemplate(time = 0) {
    const pts = staticStairs.slice();
    const progress = ((time || 0) * 0.065) % 1.0;
    const walker = getWalkerPosition(progress);
    const walkerPts = generateWalkerPoints(walker);
    return pts.concat(walkerPts);
  }

  function buildStairsParticles() {
    return staticStairs;
  }

  if (typeof window !== 'undefined') {
    window.buildStairsParticles = buildStairsParticles;
    window.generatePenroseTemplate = generatePenroseTemplate;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildStairsParticles: buildStairsParticles,
      generatePenroseTemplate: generatePenroseTemplate
    };
  }
