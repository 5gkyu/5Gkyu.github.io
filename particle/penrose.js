/**
 * penrose.js - Penrose Stairs (参考画像を直接再現)
 *
 * 設計:
 *   - 4×4グリッド、16段（各辺4段）、H=0.85
 *   - 等角投影 + ペインターアルゴリズム
 *   - 不可能コーナー: step15(1,0,0.85)の底面 = step0(0,0,0)の上面
 *     → どちらも座標(u=1,v=0,z=0.85)で完全一致
 *   - 大型ベースブロックで参考画像の雰囲気を再現
 */

'use strict';

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;
const SCALE = 38.0;

// HSL→RGB変換
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
}

/**
 * 純粋等角投影
 * depth = (u+v) - z : 大きいほど奥 = 先に描画 = 背後に隠れる
 */
function isoProject(u, v, z) {
  return {
    bx:    (u - v) * COS30 * SCALE,
    by:    (u + v) * SIN30 * SCALE - z * SCALE,
    depth: (u + v) - z
  };
}

const W = 1.0;
const D = 1.0;
const H = 0.85; // 段の高さ: 参考画像に合わせた比率

/**
 * 16段ペンローズ階段 (4×4グリッド)
 *
 * 不可能コーナーの数学的証明:
 *   step15(u=1, v=0, z=H=0.85) の底面 z=0.85
 *   step0 (u=0, v=0, z=0)      の上面 z=H=0.85
 *   コーナー点 (u=1, v=0) での screen_y:
 *     by = (1+0)*0.5*38 - 0.85*38 = 19 - 32.3 = -13.3 ← 完全一致！
 *
 * 深度ソートで step0(depth=0) が step15(depth=0.15) より手前に来るため
 * 不可能コーナーが自然に「階段の続き」に見える。
 */
const rawSteps = [
  // Leg 0: 左辺 (+v方向, z上昇) 視覚上昇
  { u: 0, v: 0, z: 0.00 },
  { u: 0, v: 1, z: 0.85 },
  { u: 0, v: 2, z: 1.70 },
  { u: 0, v: 3, z: 2.55 },

  // Leg 1: 奥辺 (+u方向, z上昇) 視覚上昇
  { u: 0, v: 4, z: 3.40 },
  { u: 1, v: 4, z: 4.25 },
  { u: 2, v: 4, z: 5.10 },
  { u: 3, v: 4, z: 5.95 },

  // Leg 2: 右辺 (-v方向, z下降)
  { u: 4, v: 4, z: 6.80 },
  { u: 4, v: 3, z: 5.95 },
  { u: 4, v: 2, z: 5.10 },
  { u: 4, v: 1, z: 4.25 },

  // Leg 3: 前辺 (-u方向, z下降)
  { u: 4, v: 0, z: 3.40 },
  { u: 3, v: 0, z: 2.55 },
  { u: 2, v: 0, z: 1.70 },
  { u: 1, v: 0, z: 0.85 }
];

const numSteps = rawSteps.length; // 16

/**
 * 階段の立体点群生成 (参考画像の3面シェーディング)
 *
 * 上面: 明るい (参考画像の白い面)
 * 前面: 中間  (参考画像の正面グレー)
 * 側面: 暗い  (参考画像の側面ダークグレー)
 */
function generateStairSolidPoints() {
  const points = [];

  rawSteps.forEach((st, idx) => {
    const u = st.u;
    const v = st.v;
    const z = st.z;

    const hue = (idx / numSteps) * 360;

    // 3面シェーディング: 上面=明 / 前面=中 / 側面=暗
    const rgbTop   = hslToRgb(hue, 0.85, 0.78);
    const rgbFront = hslToRgb(hue, 0.78, 0.42);
    const rgbSide  = hslToRgb(hue, 0.72, 0.22);
    const rgbEdge  = hslToRgb(hue, 0.20, 0.96);

    // ---- 上面 (踏面) ----
    const nu = 10, nv = 10;
    for (let iu = 0; iu <= nu; iu++) {
      for (let iv = 0; iv <= nv; iv++) {
        const du = (iu / nu) * W;
        const dv = (iv / nv) * D;
        const pt = isoProject(u + du, v + dv, z + H);
        const edge = (iu === 0 || iu === nu || iv === 0 || iv === nv);
        points.push({
          bx: pt.bx, by: pt.by,
          rgb:  edge ? rgbEdge : rgbTop,
          size: edge ? 3.0 : 2.4,
          depth: pt.depth
        });
      }
    }

    // ---- 前面 (v=v側の垂直壁, 参考画像の正面グレー) ----
    const fnu = 10, fnz = 7;
    for (let iu = 0; iu <= fnu; iu++) {
      for (let iz = 0; iz <= fnz; iz++) {
        const du = (iu / fnu) * W;
        const dz = (iz / fnz) * H;
        const pt = isoProject(u + du, v, z + dz);
        points.push({
          bx: pt.bx, by: pt.by,
          rgb: rgbFront, size: 2.1,
          depth: pt.depth
        });
      }
    }

    // ---- 側面 (u=u側の垂直壁, 参考画像の側面ダークグレー) ----
    const snv = 10, snz = 7;
    for (let iv = 0; iv <= snv; iv++) {
      for (let iz = 0; iz <= snz; iz++) {
        const dv = (iv / snv) * D;
        const dz = (iz / snz) * H;
        const pt = isoProject(u, v + dv, z + dz);
        points.push({
          bx: pt.bx, by: pt.by,
          rgb: rgbSide, size: 2.1,
          depth: pt.depth
        });
      }
    }
  });

  // ---- 大型ベースブロック (参考画像の土台) ----
  // 参考画像: 階段より大きな長方形プラットフォームが土台
  const BASE_U0 = -0.5, BASE_U1 = 4.5;
  const BASE_V0 = -0.5, BASE_V1 = 4.5;
  const BASE_Z_TOP = 0.0;
  const BASE_Z_BOT = -2.8;

  // 上面 (階段の間から見える)
  for (let tu = BASE_U0; tu <= BASE_U1; tu += 0.38) {
    for (let tv = BASE_V0; tv <= BASE_V1; tv += 0.38) {
      const pt = isoProject(tu, tv, BASE_Z_TOP);
      points.push({ bx: pt.bx, by: pt.by, rgb: [45, 70, 140], size: 1.5, depth: pt.depth });
    }
  }
  // 前面 (v=BASE_V0側)
  for (let tu = BASE_U0; tu <= BASE_U1; tu += 0.35) {
    for (let tz = BASE_Z_BOT; tz <= BASE_Z_TOP; tz += 0.28) {
      const pt = isoProject(tu, BASE_V0, tz);
      points.push({ bx: pt.bx, by: pt.by, rgb: [28, 45, 105], size: 1.4, depth: pt.depth });
    }
  }
  // 左面 (u=BASE_U0側)
  for (let tv = BASE_V0; tv <= BASE_V1; tv += 0.35) {
    for (let tz = BASE_Z_BOT; tz <= BASE_Z_TOP; tz += 0.28) {
      const pt = isoProject(BASE_U0, tv, tz);
      points.push({ bx: pt.bx, by: pt.by, rgb: [18, 30, 80], size: 1.4, depth: pt.depth });
    }
  }
  // 右面 (u=BASE_U1側)
  for (let tv = BASE_V0; tv <= BASE_V1; tv += 0.35) {
    for (let tz = BASE_Z_BOT; tz <= BASE_Z_TOP; tz += 0.28) {
      const pt = isoProject(BASE_U1, tv, tz);
      points.push({ bx: pt.bx, by: pt.by, rgb: [28, 45, 105], size: 1.4, depth: pt.depth });
    }
  }

  // ペインターアルゴリズム: depth降順 (奥→手前の順で描画)
  points.sort((a, b) => b.depth - a.depth);

  return points;
}

const staticStairs = generateStairSolidPoints();

// ウォーカーのキーフレーム (各段の中央投影座標)
const walkerKeyframes = rawSteps.map(st => {
  const pt = isoProject(st.u + W * 0.5, st.v + D * 0.5, st.z + H);
  return { bx: pt.bx, by: pt.by };
});

const totalWalkerSteps = walkerKeyframes.length;

/**
 * 進行状況からウォーカー位置を補間
 * 16段すべてで完全表示 (不可能コーナーも含め常時可視)
 */
function getWalkerPosition(progress) {
  const pNorm  = ((progress % 1.0) + 1.0) % 1.0;
  const fIndex = pNorm * totalWalkerSteps;
  const idx0   = Math.floor(fIndex) % totalWalkerSteps;
  const idx1   = (idx0 + 1) % totalWalkerSteps;
  const frac   = fIndex - Math.floor(fIndex);

  const k0 = walkerKeyframes[idx0];
  const k1 = walkerKeyframes[idx1];

  const curBx = k0.bx + (k1.bx - k0.bx) * frac;
  const curBy = k0.by + (k1.by - k0.by) * frac;

  const dx   = k1.bx - k0.bx;
  const dy   = k1.by - k0.by;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const stepBounce = Math.sin(frac * Math.PI) * 7.0;

  return {
    bx:         curBx,
    by:         curBy - stepBounce,
    frac:       frac,
    dirX:       dx / dist,
    dirY:       dy / dist,
    visibility: 1.0
  };
}

/**
 * ウォーカー点群生成
 */
function generateWalkerPoints(walker) {
  const points  = [];
  const vis     = walker.visibility;
  const sc      = vis;
  const dim     = (rgb) => rgb.map(c => Math.round(c * vis));

  const RGB_HEAD  = dim([255, 235, 170]);
  const RGB_EYE   = dim([0,   240, 255]);
  const RGB_PUPIL = dim([255, 255, 255]);
  const RGB_GAZE  = dim([80,  255, 220]);
  const RGB_BODY  = dim([255, 165,  45]);
  const RGB_LIMB  = dim([255,  85,  55]);

  const rootX     = walker.bx;
  const rootY     = walker.by - 4;
  const walkCycle = walker.frac * Math.PI * 2;
  const dirX      = walker.dirX;
  const dirY      = walker.dirY;

  const headR       = 7.0 * sc;
  const headCenterY = rootY - 37;

  // 頭部
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    points.push({ bx: rootX + Math.cos(a)*headR, by: headCenterY + Math.sin(a)*headR, rgb: RGB_HEAD, size: 2.2*sc });
  }
  points.push({ bx: rootX, by: headCenterY, rgb: RGB_HEAD, size: 2.5*sc });

  // 目 (常に同じ高さ)
  const eyeFwdX   = dirX * 3.5;
  const eyeFwdY   = dirY * 2.0;
  const eyeSepX   = -dirY * 2.8;
  const eyeBaseY  = headCenterY - 1.5;

  const eye1X = rootX + eyeFwdX + eyeSepX;
  const eye1Y = eyeBaseY + eyeFwdY;
  points.push({ bx: eye1X, by: eye1Y, rgb: RGB_EYE,   size: 2.3*sc });
  points.push({ bx: eye1X + dirX*0.8, by: eye1Y + dirY*0.8, rgb: RGB_PUPIL, size: 1.7*sc });

  const eye2X = rootX + eyeFwdX - eyeSepX;
  const eye2Y = eyeBaseY + eyeFwdY;
  points.push({ bx: eye2X, by: eye2Y, rgb: RGB_EYE,   size: 2.3*sc });
  points.push({ bx: eye2X + dirX*0.8, by: eye2Y + dirY*0.8, rgb: RGB_PUPIL, size: 1.7*sc });

  // 視線ビーム
  if (vis > 0.6) {
    points.push({ bx: rootX + dirX*12, by: headCenterY + dirY*8,  rgb: RGB_GAZE, size: 2.0*sc });
    points.push({ bx: rootX + dirX*18, by: headCenterY + dirY*12, rgb: dim([180,255,240]), size: 1.4*sc });
  }

  // 胴体
  const spineTopY = headCenterY + headR + 2;
  const hipY      = rootY - 13;
  for (let i = 0; i <= 5; i++) {
    const sy = spineTopY + (hipY - spineTopY) * (i/5);
    points.push({ bx: rootX,     by: sy, rgb: RGB_BODY, size: 2.5*sc });
    points.push({ bx: rootX-2.5, by: sy, rgb: RGB_BODY, size: 2.1*sc });
    points.push({ bx: rootX+2.5, by: sy, rgb: RGB_BODY, size: 2.1*sc });
  }

  // 脚
  const ls1 = Math.sin(walkCycle);
  const ls2 = -ls1;
  const ll1 = Math.max(0, Math.sin(walkCycle)) * 6;
  const ll2 = Math.max(0, Math.sin(walkCycle + Math.PI)) * 6;

  const knee1X = rootX - 4 + ls1*5, knee1Y = hipY + 9 - ll1;
  const foot1X = rootX - 5 + ls1*8, foot1Y = rootY - ll1;
  for (let i = 0; i <= 3; i++) {
    const t = i/3;
    points.push({ bx: rootX-2 + (knee1X-rootX+2)*t, by: hipY   + (knee1Y-hipY)*t,   rgb: RGB_LIMB, size: 2.1*sc });
    points.push({ bx: knee1X  + (foot1X-knee1X)*t,   by: knee1Y + (foot1Y-knee1Y)*t, rgb: RGB_LIMB, size: 2.1*sc });
  }
  const knee2X = rootX + 4 + ls2*5, knee2Y = hipY + 9 - ll2;
  const foot2X = rootX + 5 + ls2*8, foot2Y = rootY - ll2;
  for (let i = 0; i <= 3; i++) {
    const t = i/3;
    points.push({ bx: rootX+2 + (knee2X-rootX-2)*t, by: hipY   + (knee2Y-hipY)*t,   rgb: RGB_LIMB, size: 2.1*sc });
    points.push({ bx: knee2X  + (foot2X-knee2X)*t,   by: knee2Y + (foot2Y-knee2Y)*t, rgb: RGB_LIMB, size: 2.1*sc });
  }

  // 腕
  const as1 = -ls1*7, as2 = -ls2*7;
  const shoulderY = spineTopY + 2;

  const hand1X = rootX - 7 + as1, hand1Y = shoulderY + 12;
  for (let i = 0; i <= 3; i++) {
    const t = i/3;
    points.push({ bx: rootX-3 + (hand1X-rootX+3)*t, by: shoulderY + (hand1Y-shoulderY)*t, rgb: RGB_BODY, size: 1.9*sc });
  }
  const hand2X = rootX + 7 + as2, hand2Y = shoulderY + 12;
  for (let i = 0; i <= 3; i++) {
    const t = i/3;
    points.push({ bx: rootX+3 + (hand2X-rootX-3)*t, by: shoulderY + (hand2Y-shoulderY)*t, rgb: RGB_BODY, size: 1.9*sc });
  }

  return points;
}

// ---- 外部公開 API ----

function generatePenroseTemplate(time = 0) {
  const pts      = staticStairs.slice();
  const progress = ((time || 0) * 0.08) % 1.0;
  const walker   = getWalkerPosition(progress);
  const wPts     = generateWalkerPoints(walker);
  return pts.concat(wPts);
}

function buildStairsParticles() {
  return staticStairs;
}

if (typeof window !== 'undefined') {
  window.buildStairsParticles    = buildStairsParticles;
  window.generatePenroseTemplate = generatePenroseTemplate;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildStairsParticles, generatePenroseTemplate };
}
