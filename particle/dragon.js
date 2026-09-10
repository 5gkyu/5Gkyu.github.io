// ============================================================================
// クォンタム・サイバードラゴン（蒼雷をまとう龍神の飛翔）
// 3D空間内を画面全体に旋回する東洋龍 + 蒼雷プラズマ演出
// ============================================================================
(function () {
  'use strict';

  // --- 粒子総数は厳格に固定（暴れ防止の鉄則）---
  const TOTAL_POINTS = 3200;

  // 粒子の役割割り当て（インデックス固定）
  const BODY_COUNT = 1400;       // 龍の胴体・頭・尾（節構造）
  const SPINE_COUNT = 200;       // 背びれ・ヒゲ・角
  const LIGHTNING_COUNT = 600;   // 蒼雷プラズマエフェクト
  const ORBIT_STARS = 500;       // 周回するスターダスト背景
  const AURA_COUNT = TOTAL_POINTS - BODY_COUNT - SPINE_COUNT - LIGHTNING_COUNT - ORBIT_STARS; // オーラ・残光

  // 初期形状データ
  const basePoints = new Array(TOTAL_POINTS);
  for (let i = 0; i < TOTAL_POINTS; i++) {
    basePoints[i] = { bx: 0, by: 0, rgb: [30, 180, 255], size: 2.0, layer: 'main' };
  }

  // 龍の3D飛行パス（8の字レムニスケート曲線の3D拡張）
  function getDragonPath3D(t) {
    const loopSpeed = t * 0.25;
    const denom = 1 + Math.sin(loopSpeed) * Math.sin(loopSpeed);
    const px = Math.cos(loopSpeed) / denom * 220;
    const py = Math.sin(loopSpeed) * Math.cos(loopSpeed) / denom * 140;
    const pz = Math.sin(loopSpeed * 0.7) * 180;
    return { x: px, y: py, z: pz };
  }

  // 3D→2D投影（パースペクティブ投影）
  function project3D(x, y, z) {
    const fov = 600;
    const viewDist = fov + z * 0.5;
    const scale = fov / Math.max(viewDist, 100);
    return { sx: x * scale, sy: y * scale, scale: scale };
  }

  // HSL→RGB変換
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r1, g1, b1;
    if (h < 60) { r1 = c; g1 = x; b1 = 0; }
    else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }
    return [
      Math.round((r1 + m) * 255),
      Math.round((g1 + m) * 255),
      Math.round((b1 + m) * 255)
    ];
  }

  // 決定論的擬似乱数シード（毎フレーム同一値を返す）
  const randSeed = new Array(TOTAL_POINTS);
  const randSeed2 = new Array(TOTAL_POINTS);
  const randSeed3 = new Array(TOTAL_POINTS);
  for (let i = 0; i < TOTAL_POINTS; i++) {
    randSeed[i] = Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
    randSeed2[i] = Math.abs(Math.sin(i * 269.5 + 183.3) * 28001.8384) % 1;
    randSeed3[i] = Math.abs(Math.sin(i * 419.2 + 371.9) * 59230.1823) % 1;
  }

  // 龍の節（関節）の数と各節の円周粒子数
  const SEGMENTS = 70;
  const RING_PER_SEG = 20;

  function generateDragonTemplate(time) {
    const points = new Array(TOTAL_POINTS);
    let idx = 0;

    // ========================
    // A. 龍の胴体（70節 x 20粒子 = 1400粒子）
    // ========================
    const segPositions = new Array(SEGMENTS);
    for (let s = 0; s < SEGMENTS; s++) {
      const pastTime = time - s * 0.06;
      const pos = getDragonPath3D(pastTime);
      const undulate = Math.sin(time * 3.0 - s * 0.35) * (8 + s * 0.3);
      const undulateV = Math.cos(time * 2.5 - s * 0.25) * (5 + s * 0.15);
      segPositions[s] = {
        x: pos.x + undulate,
        y: pos.y + undulateV,
        z: pos.z + Math.sin(time * 1.8 - s * 0.2) * 20
      };
    }

    for (let s = 0; s < SEGMENTS; s++) {
      const sp = segPositions[s];
      const taper = s < 8 ? 3 + s * 2.2 : 20 - (s - 8) * 0.22;
      const radius = Math.max(2, taper);
      const nextS = Math.min(s + 1, SEGMENTS - 1);
      const prevS = Math.max(s - 1, 0);
      const tangentX = segPositions[nextS].x - segPositions[prevS].x;
      const tangentY = segPositions[nextS].y - segPositions[prevS].y;
      const tangentZ = segPositions[nextS].z - segPositions[prevS].z;
      const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY + tangentZ * tangentZ) || 1;
      const nx = -tangentY / tangentLen;
      const ny = tangentX / tangentLen;

      for (let r = 0; r < RING_PER_SEG; r++) {
        const angle = (r / RING_PER_SEG) * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const x3d = sp.x + cosA * radius * nx - sinA * radius * 0.3;
        const y3d = sp.y + cosA * radius * ny + sinA * radius * 0.7;
        const z3d = sp.z + sinA * radius;
        const proj = project3D(x3d, y3d, z3d);
        const hue = 200 + (s / SEGMENTS) * 40 + Math.sin(time * 2 + s * 0.1) * 10;
        const lightness = 0.45 + proj.scale * 0.15 + Math.sin(angle * 2 + time) * 0.08;
        const saturation = 0.75 + (1 - s / SEGMENTS) * 0.2;
        const rgb = hslToRgb(hue, saturation, Math.min(0.85, lightness));
        const depthSize = Math.max(0.8, 2.2 * proj.scale);
        const scaleGlint = Math.sin(time * 5 + s * 0.5 + r * 0.8) > 0.85 ? 1.3 : 1.0;
        points[idx] = {
          bx: proj.sx, by: proj.sy,
          rgb: [
            Math.min(255, Math.round(rgb[0] * scaleGlint)),
            Math.min(255, Math.round(rgb[1] * scaleGlint)),
            Math.min(255, Math.round(rgb[2] * scaleGlint))
          ],
          size: depthSize * scaleGlint, layer: 'body'
        };
        idx++;
      }
    }

    // ========================
    // B. 背びれ・ヒゲ・角（200粒子）
    // ========================
    for (let i = 0; i < SPINE_COUNT; i++) {
      const segIdx = Math.floor((i / SPINE_COUNT) * (SEGMENTS * 0.7));
      const sp = segPositions[Math.min(segIdx, SEGMENTS - 1)];
      const ri = idx;
      const spineType = i < 60 ? 'horn' : (i < 140 ? 'dorsal' : 'whisker');
      let x3d, y3d, z3d;
      if (spineType === 'horn') {
        const hornLen = 15 + randSeed[ri] * 20;
        const hornAngle = (i / 60) * Math.PI * 0.6 - Math.PI * 0.3;
        const hornWave = Math.sin(time * 3 + i * 0.5) * 3;
        x3d = segPositions[0].x + Math.cos(hornAngle + time * 0.3) * hornLen + hornWave;
        y3d = segPositions[0].y - hornLen * 0.8 - randSeed2[ri] * 10;
        z3d = segPositions[0].z + Math.sin(hornAngle) * hornLen * 0.5;
      } else if (spineType === 'dorsal') {
        const spineHeight = 8 + randSeed[ri] * 12;
        const wave = Math.sin(time * 2.5 - segIdx * 0.3) * 4;
        x3d = sp.x + wave;
        y3d = sp.y - spineHeight - randSeed2[ri] * 5;
        z3d = sp.z + (randSeed3[ri] - 0.5) * 6;
      } else {
        const whiskerLen = 20 + randSeed[ri] * 35;
        const whiskerAngle = ((i - 140) / 60) * Math.PI - Math.PI * 0.5;
        const whiskerWave = Math.sin(time * 4 + i * 0.3) * (5 + randSeed2[ri] * 8);
        x3d = segPositions[0].x + Math.cos(whiskerAngle) * whiskerLen;
        y3d = segPositions[0].y + Math.sin(whiskerAngle) * whiskerLen * 0.4 + whiskerWave;
        z3d = segPositions[0].z + (randSeed3[ri] - 0.5) * whiskerLen * 0.3;
      }
      const proj = project3D(x3d, y3d, z3d);
      const brightness = spineType === 'horn' ? 0.75 : (spineType === 'whisker' ? 0.7 : 0.55);
      const hue = spineType === 'horn' ? 190 : (spineType === 'whisker' ? 195 : 210);
      const rgb = hslToRgb(hue + Math.sin(time + i) * 15, 0.8, brightness);
      points[idx] = {
        bx: proj.sx, by: proj.sy, rgb: rgb,
        size: Math.max(0.6, 1.6 * proj.scale), layer: 'spine'
      };
      idx++;
    }

    // ========================
    // C. 蒼雷プラズマエフェクト（600粒子）
    // ========================
    for (let i = 0; i < LIGHTNING_COUNT; i++) {
      const ri = idx;
      const sourceSegIdx = Math.floor(randSeed[ri] * SEGMENTS * 0.8);
      const sp = segPositions[Math.min(sourceSegIdx, SEGMENTS - 1)];
      const lightningCycle = (time * 3.0 + randSeed2[ri] * 20) % (1.5 + randSeed3[ri] * 2.0);
      const isActive = lightningCycle < 0.4;
      if (isActive) {
        const boltLen = 15 + randSeed[ri] * 50;
        const boltAngle = randSeed2[ri] * Math.PI * 2 + time * 5;
        const zigzag = Math.sin(time * 20 + i * 7.3) * (8 + randSeed3[ri] * 12);
        const x3d = sp.x + Math.cos(boltAngle) * boltLen + zigzag;
        const y3d = sp.y + Math.sin(boltAngle) * boltLen * 0.6 + Math.sin(time * 15 + i * 3.1) * 10;
        const z3d = sp.z + (randSeed3[ri] - 0.5) * boltLen;
        const proj = project3D(x3d, y3d, z3d);
        const intensity = 0.7 + Math.sin(time * 30 + i * 11) * 0.3;
        points[idx] = {
          bx: proj.sx, by: proj.sy,
          rgb: [Math.round(120 + 135 * intensity), Math.round(200 + 55 * intensity), 255],
          size: Math.max(0.4, (1.2 + randSeed[ri] * 1.5) * proj.scale * intensity),
          layer: 'lightning'
        };
      } else {
        points[idx] = { bx: 0, by: -999, rgb: [0, 0, 0], size: 0.01, layer: 'hidden' };
      }
      idx++;
    }

    // ========================
    // D. 周回スターダスト背景（500粒子）
    // ========================
    for (let i = 0; i < ORBIT_STARS; i++) {
      const ri = idx;
      const phi = i * 2.399963;
      const r = Math.sqrt(i / ORBIT_STARS) * 280;
      const wobble = Math.sin(time * 0.8 + i * 0.1) * 15;
      const x = Math.cos(phi + time * 0.15) * (r + wobble);
      const y = Math.sin(phi + time * 0.15) * (r + wobble) * 0.7;
      const z = Math.sin(phi * 0.5 + time * 0.3) * 100;
      const proj = project3D(x, y, z);
      const starHue = 200 + randSeed[ri] * 60;
      const starBright = 0.3 + Math.sin(time * 1.5 + randSeed2[ri] * 10) * 0.15;
      const rgb = hslToRgb(starHue, 0.5, starBright);
      points[idx] = {
        bx: proj.sx, by: proj.sy, rgb: rgb,
        size: Math.max(0.5, (0.8 + randSeed[ri] * 0.8) * proj.scale), layer: 'star'
      };
      idx++;
    }

    // ========================
    // E. オーラ・残光（500粒子）
    // ========================
    for (let i = 0; i < AURA_COUNT; i++) {
      const ri = idx;
      const trailTime = time - 0.5 - randSeed[ri] * 2.5;
      const trailPos = getDragonPath3D(trailTime);
      const spread = 5 + randSeed2[ri] * 25;
      const x3d = trailPos.x + (randSeed[ri] - 0.5) * spread * 2;
      const y3d = trailPos.y + (randSeed2[ri] - 0.5) * spread * 2;
      const z3d = trailPos.z + (randSeed3[ri] - 0.5) * spread;
      const proj = project3D(x3d, y3d, z3d);
      const fadeHue = 210 + randSeed3[ri] * 50;
      const fadeBright = 0.25 + Math.sin(time * 2 + randSeed[ri] * 6) * 0.1;
      const rgb = hslToRgb(fadeHue, 0.6, fadeBright);
      points[idx] = {
        bx: proj.sx, by: proj.sy, rgb: rgb,
        size: Math.max(0.3, (0.6 + randSeed2[ri] * 0.6) * proj.scale), layer: 'aura'
      };
      idx++;
    }

    return points;
  }

  // グローバル公開
  if (typeof window !== 'undefined') {
    window.dragonModelTmpl = basePoints;
    window.generateDragonTemplate = generateDragonTemplate;
  }
})();
