const fs = require('fs');

// stargazer_data.json の読み込み
const rawData = JSON.parse(fs.readFileSync('particle/stargazer_data.json', 'utf8'));

// 1. NEBULA_DATA（暗夜・星雲グリッド）
const nebulaPts = [];
for (let y = -307; y <= -1; y += 5) {
  for (let x = -512; x <= 512; x += 5) {
    const pulsePhase = Math.round((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % (Math.PI * 2)) * 100) / 100;
    nebulaPts.push({
      bx: x,
      by: y,
      rgb: [5, 8, 15],
      base_size: 1.21,
      pulse_phase: Math.abs(pulsePhase)
    });
  }
}

// 2. STARS_DATA（夜空の星々 738点）
const starsPts = [];
for (let i = 0; i < 738; i++) {
  const sx = Math.sin(i * 99.1) * 500;
  const sy = -300 + (Math.cos(i * 33.7) * 0.5 + 0.5) * 295;
  starsPts.push({
    bx: Math.round(sx * 10) / 10,
    by: Math.round(sy * 10) / 10,
    rgb: [220, 240, 255],
    base_size: 1.2,
    twinkle_speed: 1.5 + (i % 5) * 0.4,
    twinkle_phase: (i * 1.618) % (Math.PI * 2)
  });
}

// 3. MAJOR_STAR_PTS（556点、28個の星：5種バリエーション）
const majorCores = [
  { bx: -380, by: -240, type: 'hex', sz: 5.5 },
  { bx: -310, by: -180, type: 'halo', sz: 4.2 },
  { bx: -240, by: -260, type: 'diamond', sz: 4.8 },
  { bx: -180, by: -190, type: 'cluster', sz: 4.5 },
  { bx: -120, by: -270, type: 'cross', sz: 4.2 },
  { bx: -60,  by: -220, type: 'hex', sz: 6.0 },
  { bx: 20,   by: -250, type: 'halo', sz: 4.4 },
  { bx: 80,   by: -190, type: 'diamond', sz: 4.6 },
  { bx: 150,  by: -270, type: 'hex', sz: 5.8 },
  { bx: 210,  by: -210, type: 'cluster', sz: 4.5 },
  { bx: 280,  by: -260, type: 'halo', sz: 4.2 },
  { bx: 340,  by: -180, type: 'diamond', sz: 4.8 },
  { bx: 400,  by: -240, type: 'halo', sz: 4.2 },
  { bx: -350, by: -120, type: 'cluster', sz: 4.0 },
  { bx: -280, by: -80,  type: 'diamond', sz: 4.2 },
  { bx: -200, by: -130, type: 'halo', sz: 4.0 },
  { bx: -140, by: -60,  type: 'cross', sz: 4.5 },
  { bx: -80,  by: -140, type: 'halo', sz: 4.2 },
  { bx: 40,   by: -120, type: 'cluster', sz: 4.2 },
  { bx: 110,  by: -70,  type: 'diamond', sz: 4.5 },
  { bx: 180,  by: -140, type: 'halo', sz: 4.0 },
  { bx: 250,  by: -80,  type: 'cross', sz: 4.5 },
  { bx: 320,  by: -130, type: 'halo', sz: 4.2 },
  { bx: 390,  by: -70,  type: 'cross', sz: 4.2 },
  { bx: -420, by: -40,  type: 'diamond', sz: 3.8 },
  { bx: -220, by: -30,  type: 'halo', sz: 3.8 },
  { bx: 200,  by: -35,  type: 'cluster', sz: 3.8 },
  { bx: 420,  by: -30,  type: 'cross', sz: 3.8 }
];

const majorStarPts = [];
const ptsPerStar = Math.floor(556 / majorCores.length);

majorCores.forEach((c, sIdx) => {
  const cx = c.bx;
  const cy = c.by;
  const starType = c.type;

  majorStarPts.push({
    bx: cx,
    by: cy,
    rgb: [255, 255, 255],
    base_size: c.sz,
    type: 'core',
    star_type: starType,
    pulse_speed: 1.5 + (sIdx % 3) * 0.4,
    pulse_phase: sIdx * 0.7
  });

  const numPts = ptsPerStar - 1;

  if (starType === 'hex') {
    const rays = 6;
    const ptsPerRay = Math.floor(numPts / rays);
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 3) * r;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.5 + (p + 1) * 3.8;
        majorStarPts.push({
          bx: Math.round((cx + cosA * dist) * 10) / 10,
          by: Math.round((cy + sinA * dist) * 10) / 10,
          dx: cosA * dist,
          dy: sinA * dist,
          rgb: [230, 245, 255],
          base_size: 1.8,
          type: 'hex_ray',
          star_type: 'hex',
          pulse_speed: 1.6,
          pulse_phase: sIdx * 0.7 + r * 0.5
        });
      }
    }
  } else if (starType === 'halo') {
    for (let p = 0; p < numPts; p++) {
      const angle = (Math.PI * 2 / numPts) * p;
      const r = (p % 2 === 0 ? 4.5 : 8.5) + (p % 3) * 2.0;
      majorStarPts.push({
        bx: Math.round((cx + Math.cos(angle) * r) * 10) / 10,
        by: Math.round((cy + Math.sin(angle) * r) * 10) / 10,
        cx: cx,
        cy: cy,
        rgb: [210, 235, 255],
        base_size: 1.5,
        type: 'halo_orb',
        star_type: 'halo',
        pulse_speed: 1.3,
        pulse_phase: sIdx * 0.7 + p * 0.3
      });
    }
  } else if (starType === 'diamond') {
    const rays = 4;
    const ptsPerRay = Math.floor(numPts / rays);
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 4) + (Math.PI / 2) * r;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.0 + (p + 1) * 3.5;
        majorStarPts.push({
          bx: Math.round((cx + cosA * dist) * 10) / 10,
          by: Math.round((cy + sinA * dist) * 10) / 10,
          dx: cosA * dist,
          dy: sinA * dist,
          rgb: [240, 245, 255],
          base_size: 1.6,
          type: 'diamond_point',
          star_type: 'diamond',
          pulse_speed: 1.7,
          pulse_phase: sIdx * 0.7 + r * 0.6
        });
      }
    }
  } else if (starType === 'cluster') {
    const companionDist = 5.5;
    for (let p = 0; p < numPts; p++) {
      let ox, oy;
      if (p === 0) {
        ox = companionDist; oy = -2.5;
      } else {
        const a = p * 2.4;
        const d = 3.0 + (p % 4) * 2.5;
        ox = Math.cos(a) * d + (p % 2 === 0 ? companionDist * 0.5 : 0);
        oy = Math.sin(a) * d;
      }
      majorStarPts.push({
        bx: Math.round((cx + ox) * 10) / 10,
        by: Math.round((cy + oy) * 10) / 10,
        rgb: [220, 240, 255],
        base_size: p === 0 ? 2.8 : 1.4,
        type: p === 0 ? 'companion' : 'cluster_dust',
        star_type: 'cluster',
        pulse_speed: 1.2,
        pulse_phase: sIdx * 0.7 + p * 0.4
      });
    }
  } else {
    // cross
    const rays = 4;
    const ptsPerRay = Math.floor(numPts / rays);
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 2) * r;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.0 + (p + 1) * 4.0;
        majorStarPts.push({
          bx: Math.round((cx + cosA * dist) * 10) / 10,
          by: Math.round((cy + sinA * dist) * 10) / 10,
          dx: cosA * dist,
          dy: sinA * dist,
          rgb: [230, 240, 255],
          base_size: 1.8,
          type: 'cross_ray',
          star_type: 'cross',
          pulse_speed: 1.5,
          pulse_phase: sIdx * 0.7 + r * 0.5
        });
      }
    }
  }
});

while (majorStarPts.length < 556) {
  majorStarPts.push({
    bx: 0, by: -200, dx: 0, dy: 0,
    rgb: [255, 255, 255], base_size: 1.5,
    type: 'core', star_type: 'cross', pulse_speed: 1.0, pulse_phase: 0
  });
}

// 4. GIRL_DATA & GIRL_REFL_DATA（3,147点ずつ、ディザリング減衰を適用）
const rawGirl = rawData.girl;
const girlPts = [];
const girlReflPts = [];

rawGirl.forEach((p, idx) => {
  const x = p.rx;
  const y = p.ry;
  const absX = Math.abs(x);
  
  let keepProb = 1.0;
  if (absX > 38) {
    const t = (absX - 38) / (62 - 38);
    keepProb = Math.pow(Math.max(0, 1 - t), 2.2);
  }
  
  const hash = Math.sin(idx * 12.9898 + x * 78.233 + y * 37.719) * 43758.5453;
  const rand = hash - Math.floor(hash);
  
  if (rand < keepProb * 0.40) {
    girlPts.push({
      bx: x,
      by: y,
      rgb: p.rgb,
      size: 1.35,
      part: p.part
    });
    
    const reflY = -y;
    girlReflPts.push({
      bx: x,
      by: reflY,
      rgb: [
        Math.min(255, Math.round(p.rgb[0] * 0.75 + 12)),
        Math.min(255, Math.round(p.rgb[1] * 0.88 + 24)),
        Math.min(255, Math.round(p.rgb[2] * 1.05 + 45))
      ],
      size: 1.35,
      part: p.part
    });
  }
});

// 5. WATER_RIPPLE_PTS（自然な水平基準のさざ波光条）
const waterRipplePts = [];
// 水平地平線（不自然な強いアーチではなく、自然な直線基準）
for (let x = -480; x <= 480; x += 3.5) {
  waterRipplePts.push({
    bx: Math.round(x * 10) / 10,
    by: 1,
    size: 1.4,
    type: 'horizon_edge',
    phase: x * 0.05
  });
}
// 水面さざ波ライン
for (let y = 4; y <= 126; y += 4.5) {
  const yRatio = y / 126;
  const spreadX = 480 * (1 - yRatio * 0.1);
  const stepX = 6 + yRatio * 3.5;
  for (let x = -spreadX; x <= spreadX; x += stepX) {
    waterRipplePts.push({
      bx: Math.round(x * 10) / 10,
      by: Math.round(y * 10) / 10,
      size: 1.25,
      type: 'ripple_line',
      depthRatio: yRatio,
      phase: x * 0.04 + y * 0.08
    });
  }
}

// 6. WATER_STAR_REFL（星々の静かな水鏡反射 674点）
const waterStarRefl = [];
for (let i = 0; i < 674; i++) {
  const sx = Math.sin(i * 77.3) * 460;
  const sy = 4 + (Math.cos(i * 44.1) * 0.5 + 0.5) * 118;
  waterStarRefl.push({
    bx: Math.round(sx * 10) / 10,
    by: Math.round(sy * 10) / 10,
    rgb: [200, 235, 255],
    base_size: 1.2 + (i % 4) * 0.3,
    twinkle_speed: 1.4 + (i % 5) * 0.3,
    twinkle_phase: (i * 2.1) % (Math.PI * 2)
  });
}

const shootSlotCount = 60;
const totalCount = nebulaPts.length + starsPts.length + majorStarPts.length +
                   girlPts.length + girlReflPts.length + waterRipplePts.length +
                   waterStarRefl.length + shootSlotCount;

console.log('Generating exact master stargazer.js! Total count:', totalCount);

const outputCode = `/**
 * stargazer.js - Starry Mirror & The Stargazer (星の鏡と佇む少女) [Exact Historical Masterpiece]
 * 
 * 仕様:
 * 1. 配列長は毎フレーム 100% 厳密に固定（総数: ${totalCount} 点）。
 * 2. 満天の星空・天の川銀河光芒・5種の大星・全身上下反転水鏡・自然な水平さざ波光条を描画。
 * 3. ドットの不要な過剰揺れを完全排除し、安定した美しさと物理復元を実現。
 */

'use strict';

(function (root) {

  // 静的データ定義
  const NEBULA_DATA = ${JSON.stringify(nebulaPts)};
  const STARS_DATA = ${JSON.stringify(starsPts)};
  const MAJOR_STAR_PTS = ${JSON.stringify(majorStarPts)};
  const GIRL_DATA = ${JSON.stringify(girlPts)};
  const GIRL_REFL_DATA = ${JSON.stringify(girlReflPts)};
  const WATER_RIPPLE_PTS = ${JSON.stringify(waterRipplePts)};
  const WATER_STAR_REFL = ${JSON.stringify(waterStarRefl)};

  const SHOOT_SLOT_COUNT = ${shootSlotCount};

  const TOTAL_POINTS = NEBULA_DATA.length +
                       STARS_DATA.length +
                       MAJOR_STAR_PTS.length +
                       GIRL_DATA.length +
                       GIRL_REFL_DATA.length +
                       WATER_RIPPLE_PTS.length +
                       WATER_STAR_REFL.length +
                       SHOOT_SLOT_COUNT;

  let templateBuffer = null;

  function generateStargazerTemplate(time = 0) {
    if (!templateBuffer || templateBuffer.length !== TOTAL_POINTS) {
      templateBuffer = new Array(TOTAL_POINTS);
      for (let i = 0; i < TOTAL_POINTS; i++) {
        templateBuffer[i] = { bx: 0, by: 0, rgb: [255, 255, 255], size: 2.0 };
      }
    }

    let pIdx = 0;
    const isZero = (time === 0);

    // =========================================================
    // 1. 壮大な天の川銀河 ＆ 星雲光芒（Milky Way Galaxy & Cosmic Nebulae）
    // =========================================================
    for (let i = 0; i < NEBULA_DATA.length; i++) {
      const p = NEBULA_DATA[i];
      const item = templateBuffer[pIdx++];
      item.bx = p.bx;
      item.by = p.by;

      if (isZero) {
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        // 天の川の斜め主軸（左上から右下へ夜空を雄大に横断する銀河の河）
        const galaxyDist = Math.abs(2.0 * p.bx - 7.0 * p.by - 1260) / 7.28;

        // 星間ガスの有機的なうねりと呼吸
        const flowTime = time * 0.4;
        const gasNoise = Math.sin(p.bx * 0.015 + p.by * 0.02 + flowTime) * 0.6
                       + Math.cos(p.bx * 0.03 - p.by * 0.015 - flowTime * 0.8) * 0.4;
        const nebulaPulse = 0.88 + 0.12 * Math.sin(time * 0.7 + p.pulse_phase);

        let r = p.rgb[0] * nebulaPulse;
        let g = p.rgb[1] * nebulaPulse;
        let b = p.rgb[2] * nebulaPulse;
        let sz = p.base_size * nebulaPulse;

        // 天の川の光芒（中心軸 d=0 付近でまばゆく、d=125 へ向けて美しく広がる）
        if (galaxyDist < 125) {
          const normDist = galaxyDist / 125.0;
          const coreGlow = Math.pow(1.0 - normDist, 1.8) * (0.85 + 0.30 * gasNoise);

          const coreR = 40 + coreGlow * 135 + Math.sin(p.bx * 0.01) * 25;
          const coreG = 75 + coreGlow * 155 + Math.cos(p.by * 0.015) * 30;
          const coreB = 145 + coreGlow * 110;

          r = Math.max(r, coreR * coreGlow);
          g = Math.max(g, coreG * coreGlow);
          b = Math.max(b, coreB * coreGlow);
          sz = Math.max(sz, (p.base_size + 0.35) * (0.9 + coreGlow * 0.4));
        }

        // 宇宙の散光星雲（左上のエメラルドシアン星雲 ＆ 右上の深宇宙マゼンタ星雲）
        const leftNebulaDist = Math.hypot(p.bx - (-260), p.by - (-220));
        if (leftNebulaDist < 150) {
          const lGlow = Math.pow(1.0 - leftNebulaDist / 150.0, 1.7) * 0.75 * (0.8 + 0.2 * gasNoise);
          r = Math.max(r, 20 * lGlow);
          g = Math.max(g, 120 * lGlow);
          b = Math.max(b, 175 * lGlow);
          sz = Math.max(sz, p.base_size * (1.0 + lGlow * 0.3));
        }

        const rightNebulaDist = Math.hypot(p.bx - (280), p.by - (-240));
        if (rightNebulaDist < 140) {
          const rGlow = Math.pow(1.0 - rightNebulaDist / 140.0, 1.7) * 0.70 * (0.8 + 0.2 * gasNoise);
          r = Math.max(r, 110 * rGlow);
          g = Math.max(g, 40 * rGlow);
          b = Math.max(b, 160 * rGlow);
          sz = Math.max(sz, p.base_size * (1.0 + rGlow * 0.3));
        }

        item.rgb = [
          Math.min(255, Math.round(r)),
          Math.min(255, Math.round(g)),
          Math.min(255, Math.round(b))
        ];
        item.size = sz;
      }
    }

    // =========================================================
    // 2. 夜空の星々（多色スペクトルの瞬きとダイヤモンドダスト）
    // =========================================================
    for (let i = 0; i < STARS_DATA.length; i++) {
      const p = STARS_DATA[i];
      const item = templateBuffer[pIdx++];

      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        item.bx = p.bx + Math.cos(time * 0.6 + p.twinkle_phase) * 0.35;
        item.by = p.by + Math.sin(time * 0.7 + p.twinkle_phase) * 0.35;

        const colorType = i % 5;
        const twinkle = Math.sin(time * p.twinkle_speed + p.twinkle_phase);
        const bright = 0.65 + 0.35 * Math.pow(Math.max(0, twinkle), 1.5);
        const flash = (twinkle > 0.85) ? (twinkle - 0.85) / 0.15 : 0;

        let baseR = p.rgb[0], baseG = p.rgb[1], baseB = p.rgb[2];

        if (colorType === 0) {
          baseR = 190; baseG = 225; baseB = 255;
        } else if (colorType === 1) {
          baseR = 255; baseG = 215; baseB = 140;
        } else if (colorType === 2) {
          baseR = 255; baseG = 175; baseB = 120;
        } else if (colorType === 3) {
          baseR = 140; baseG = 220; baseB = 255;
        } else {
          baseR = 245; baseG = 250; baseB = 255;
        }

        item.rgb = [
          Math.min(255, Math.round((baseR * bright + flash * 45))),
          Math.min(255, Math.round((baseG * bright + flash * 45))),
          Math.min(255, Math.round((baseB * bright + flash * 35)))
        ];
        item.size = (p.base_size + 0.2) * (0.85 + 0.35 * bright + flash * 0.6);
      }
    }

    // =========================================================
    // 3. 多様な大星群（六条星、ハロー、ダイヤモンド、連星、クロス星）
    // =========================================================
    for (let i = 0; i < MAJOR_STAR_PTS.length; i++) {
      const p = MAJOR_STAR_PTS[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        const pulse = Math.sin(time * p.pulse_speed + p.pulse_phase);
        const st = p.star_type || 'cross';
        
        let dynamicDx = 0, dynamicDy = 0;
        let starSize = p.base_size;
        let starAlpha = 1.0;

        if (p.type === 'core') {
          starSize = p.base_size * (0.85 + 0.15 * pulse);
          starAlpha = 0.90 + 0.10 * pulse;
        } else if (st === 'hex') {
          const rayPulse = Math.sin(time * (p.pulse_speed * 1.2) + p.pulse_phase);
          dynamicDx = (p.dx || 0) * (0.12 * rayPulse);
          dynamicDy = (p.dy || 0) * (0.12 * rayPulse);
          starSize = p.base_size * (0.75 + 0.25 * rayPulse);
          starAlpha = 0.70 + 0.30 * rayPulse;
        } else if (st === 'halo') {
          const haloRotate = time * 0.4;
          const hdist = Math.sqrt((p.bx - p.cx) ** 2 + (p.by - p.cy) ** 2) || 1;
          const curAngle = Math.atan2(p.by - p.cy, p.bx - p.cx) + haloRotate;
          dynamicDx = Math.cos(curAngle) * hdist - (p.bx - p.cx);
          dynamicDy = Math.sin(curAngle) * hdist - (p.by - p.cy);
          starSize = p.base_size * (0.80 + 0.20 * pulse);
          starAlpha = 0.65 + 0.35 * pulse;
        } else if (st === 'diamond') {
          const dPulse = Math.sin(time * (p.pulse_speed * 1.5) + p.pulse_phase);
          starSize = p.base_size * (0.70 + 0.30 * dPulse);
          starAlpha = 0.75 + 0.25 * dPulse;
        } else if (st === 'cluster') {
          const drift = Math.sin(time * 0.8 + p.pulse_phase) * 0.8;
          dynamicDx = drift;
          dynamicDy = Math.cos(time * 0.8 + p.pulse_phase) * 0.6;
          starSize = p.base_size * (0.80 + 0.20 * pulse);
          starAlpha = 0.70 + 0.30 * pulse;
        } else {
          dynamicDx = (p.dx || 0) * (0.08 * pulse);
          dynamicDy = (p.dy || 0) * (0.08 * pulse);
          starSize = p.base_size * (0.80 + 0.20 * pulse);
          starAlpha = 0.75 + 0.25 * pulse;
        }

        item.bx = p.bx + dynamicDx;
        item.by = p.by + dynamicDy;
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * starAlpha)),
          Math.min(255, Math.round(p.rgb[1] * starAlpha)),
          Math.min(255, Math.round(p.rgb[2] * starAlpha))
        ];
        item.size = Math.max(0.7, starSize);
      }
    }

    // =========================================================
    // 4. 少女本体（微細な自然な呼吸となびき・過剰なブレを排除）
    // =========================================================
    const girlBreathe = isZero ? 0 : Math.sin(time * 1.0) * 0.60;

    for (let i = 0; i < GIRL_DATA.length; i++) {
      const p = GIRL_DATA[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.size;
      } else {
        const heightFactor = Math.max(0, Math.min(1, (-p.by) / 120.0));
        let animX = 0;
        let animY = girlBreathe * heightFactor;

        if (p.bx > 0) {
          const swayWeight = Math.min(1.0, Math.max(0.0, (p.bx - 2.0) / 28.0));
          const wavePhase = time * 1.0 + p.by * 0.05;
          animX += Math.sin(wavePhase) * (1.2 * swayWeight);
          animY += Math.cos(wavePhase) * (0.3 * swayWeight);
        }

        item.bx = p.bx + animX;
        item.by = p.by + animY;
        item.rgb = p.rgb;
        item.size = p.size;
      }
    }

    // =========================================================
    // 5. 少女の水鏡反射像（上下完全反転水鏡）
    // =========================================================
    for (let i = 0; i < GIRL_REFL_DATA.length; i++) {
      const p = GIRL_REFL_DATA[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.size;
      } else {
        const depthFactor = Math.min(1.0, Math.max(0, (p.by - 1) / 126.0));
        const waveAmpX = 0.2 + depthFactor * 2.8;
        const waveAmpY = 0.1 + depthFactor * 1.4;

        const reflWaveX = Math.sin(time * 0.95 + p.by * 0.08 + p.bx * 0.03) * waveAmpX;
        const reflWaveY = Math.cos(time * 0.75 + p.bx * 0.03 + p.by * 0.05) * waveAmpY;

        item.bx = p.bx + reflWaveX;
        item.by = p.by + reflWaveY;

        const shimmer = 0.92 + 0.08 * Math.sin(time * 1.3 + p.by * 0.05 + p.bx * 0.04);
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * shimmer)),
          Math.min(255, Math.round(p.rgb[1] * shimmer)),
          Math.min(255, Math.round(p.rgb[2] * shimmer))
        ];
        item.size = Math.max(0.7, p.size * (0.95 + depthFactor * 0.15));
      }
    }

    // =========================================================
    // 6. 水面のさざ波光条（少女の真下も貫通して流れる自然な波）
    // =========================================================
    for (let i = 0; i < WATER_RIPPLE_PTS.length; i++) {
      const p = WATER_RIPPLE_PTS[i];
      const item = templateBuffer[pIdx++];

      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = [30, 80, 150];
        item.size = p.size;
      } else {
        const absX = Math.abs(p.bx);
        let edgeAlpha = 1.0;
        if (absX > 380) {
          edgeAlpha *= Math.max(0, (480 - absX) / 100);
        }

        const waveX = Math.cos(time * 0.7 + p.by * 0.05) * 1.0;
        const waveY = Math.sin(time * 0.9 + p.bx * 0.02 + p.by * 0.06) * (p.type === 'horizon_edge' ? 0.3 : 1.0);

        item.bx = p.bx + waveX;
        item.by = p.by + waveY;

        const waveGlow = Math.sin(time * 1.1 + p.phase);
        const glowFactor = 0.80 + 0.20 * waveGlow;

        if (p.type === 'horizon_edge') {
          item.rgb = [
            Math.min(255, Math.round((35 + waveGlow * 15) * glowFactor * edgeAlpha)),
            Math.min(255, Math.round((90 + waveGlow * 30) * glowFactor * edgeAlpha)),
            Math.min(255, Math.round((180 + waveGlow * 45) * glowFactor * edgeAlpha))
          ];
          item.size = Math.max(0.8, 1.2 * glowFactor * edgeAlpha);
        } else {
          const depthFade = Math.max(0.45, 1.0 - (p.depthRatio || 0) * 0.45) * edgeAlpha;
          const isPeak = waveGlow > 0.4;
          const r = isPeak ? 35 : 20;
          const g = isPeak ? 85 : 55;
          const b = isPeak ? 175 : 125;

          item.rgb = [
            Math.min(255, Math.round(r * glowFactor * depthFade)),
            Math.min(255, Math.round(g * glowFactor * depthFade)),
            Math.min(255, Math.round(b * glowFactor * depthFade))
          ];
          item.size = Math.max(0.7, (isPeak ? 1.4 : 1.1) * depthFade);
        }
      }
    }

    // =========================================================
    // 7. 星々の水面反射
    // =========================================================
    for (let i = 0; i < WATER_STAR_REFL.length; i++) {
      const p = WATER_STAR_REFL[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        const absX = Math.abs(p.bx);
        let edgeAlpha = 1.0;
        if (absX > 380) {
          edgeAlpha *= Math.max(0, (480 - absX) / 100);
        }
        const waveX = Math.cos(time * 0.65 + p.twinkle_phase) * 0.5;
        const waveY = Math.sin(time * 0.75 + p.twinkle_phase) * 0.5;
        item.bx = p.bx + waveX;
        item.by = p.by + waveY;
        const twinkle = Math.sin(time * p.twinkle_speed + p.twinkle_phase);
        const starBright = (0.75 + 0.25 * twinkle) * edgeAlpha;
        item.rgb = [
          Math.min(255, Math.round((p.rgb[0] * 0.75 + 10) * starBright)),
          Math.min(255, Math.round((p.rgb[1] * 0.85 + 20) * starBright)),
          Math.min(255, Math.round((p.rgb[2] * 0.95 + 40) * starBright))
        ];
        item.size = Math.max(0.6, p.base_size * (0.85 + 0.15 * twinkle));
      }
    }

    // =========================================================
    // 8. 流れ星
    // =========================================================
    const shootCycle = 6.0;
    const shootT = isZero ? -1 : (time % shootCycle);
    const isShootingActive = (shootT >= 0.2 && shootT < 1.6);
    const endX = -320;
    const endY = -120;

    for (let i = 0; i < SHOOT_SLOT_COUNT; i++) {
      const item = templateBuffer[pIdx++];
      if (isShootingActive) {
        const progress = (shootT - 0.2) / 1.4;
        const startX = 380;
        const startY = -280;
        const tailOffset = (i / SHOOT_SLOT_COUNT) * 0.22;
        const particleProg = Math.max(0, Math.min(1, progress - tailOffset));
        const curX = startX + (endX - startX) * particleProg;
        const curY = startY + (endY - startY) * particleProg;
        let alpha = Math.max(0, 1.0 - (i / SHOOT_SLOT_COUNT) * 1.1);
        if (progress < 0.1) {
          alpha *= (progress / 0.1);
        } else if (progress > 0.85) {
          alpha *= Math.max(0, (1.0 - progress) / 0.15);
        }
        item.bx = curX;
        item.by = curY;
        item.rgb = [
          Math.round(255 * alpha),
          Math.round(245 * alpha),
          Math.round(220 * alpha)
        ];
        item.size = Math.max(0, (i === 0 ? 3.0 : (2.4 * alpha)));
      } else {
        item.bx = endX;
        item.by = endY;
        item.rgb = [0, 0, 0];
        item.size = 0.0;
      }
    }

    return templateBuffer;
  }

  function buildStargazerParticles() {
    return generateStargazerTemplate(0);
  }

  if (typeof window !== 'undefined') {
    window.buildStargazerParticles = buildStargazerParticles;
    window.generateStargazerTemplate = generateStargazerTemplate;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildStargazerParticles: buildStargazerParticles,
      generateStargazerTemplate: generateStargazerTemplate
    };
  }

})(this);
`;

fs.writeFileSync('particle/stargazer.js', outputCode);
console.log('Successfully written particle/stargazer.js!');

// index.html の物理演算を元に戻す
let html = fs.readFileSync('index.html', 'utf8');

// isExactModel ブロックの復元
const regexWrong = /let ds = pSpeed\[i\]; if \(dist < 80\) ds = \(dist \/ 80\) \* ds;[\s\S]*?velX\[i\] = \(velX\[i\] \+ ax\) \* 0\.93;/;

if (!html.includes('if (isExactModel && shockwaves.length === 0')) {
  const pOldPhysics = `            } else {
              if (isExactModel && shockwaves.length === 0 && vortexes.length === 0) {
                if (tdistSq > 10000.0) {
                  posX[i] = tx;
                  posY[i] = ty;
                  velX[i] = 0;
                  velY[i] = 0;
                } else if (tdistSq < 4.0) {
                  posX[i] = tx;
                  posY[i] = ty;
                  velX[i] = 0;
                  velY[i] = 0;
                } else {
                  posX[i] += (tx - posX[i]) * 0.35;
                  posY[i] += (ty - posY[i]) * 0.35;
                  velX[i] = 0;
                  velY[i] = 0;
                }
              } else {
                let dx = tx - posX[i], dy = ty - posY[i];
                const dist = Math.sqrt(dx * dx + dy * dy);
                let ds = pSpeed[i]; if (dist < 80) ds = (dist / 80) * ds;
                if (dist > 0.001) { dx = (dx / dist) * ds; dy = (dy / dist) * ds; }
                ax = dx - velX[i]; ay = dy - velY[i];
                const mag = Math.sqrt(ax * ax + ay * ay);
                if (mag > pForce[i]) { ax = (ax / mag) * pForce[i]; ay = (ay / mag) * pForce[i]; }

                if (shockwaves.length > 0) {
                  for (let s = 0; s < shockwaves.length; s++) {
                    const sw = shockwaves[s];
                    const sdx = posX[i] - sw.x;
                    const sdy = posY[i] - sw.y;
                    const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
                    const diff = Math.abs(sdist - sw.radius);
                    if (diff < 45 && sdist > 0.01) {
                      const bl = sw.power * (1 - diff / 45);
                      ax += (sdx / sdist) * bl;
                      ay += (sdy / sdist) * bl;
                    }
                  }
                }

                if (vortexes.length > 0) {
                  for (let v = 0; v < vortexes.length; v++) {
                    const vt = vortexes[v];
                    const vdx = vt.x - posX[i];
                    const vdy = vt.y - posY[i];
                    const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
                    const maxR = 400;
                    if (vdist < maxR && vdist > 0.1) {
                      const pull = Math.pow(1.0 - vdist / maxR, 1.5) * vt.power * 1.25;
                      ax += (vdx / vdist) * pull;
                      ay += (vdy / vdist) * pull;
                      ax += (-vdy / vdist) * (pull * 0.75);
                      ay += (vdx / vdist) * (pull * 0.75);
                    }
                  }
                }

                velX[i] = (velX[i] + ax) * 0.93;
                velY[i] = (velY[i] + ay) * 0.93;
                posX[i] += velX[i];
                posY[i] += velY[i];
              }
            }`;

  const targetSectionStart = html.indexOf('} else {');
  // pSpeed[i] がある箇所の } else { を探す
  const pspeedIdx = html.indexOf('let ds = pSpeed[i];');
  if (pspeedIdx !== -1) {
    const startElse = html.lastIndexOf('} else {', pspeedIdx);
    const endElse = html.indexOf('velY[i] += velY[i];\n            }', startElse) !== -1
      ? html.indexOf('velY[i] += velY[i];\n            }', startElse) + 'velY[i] += velY[i];\n            }'.length
      : html.indexOf('velY[i] += velY[i];\r\n            }', startElse) + 'velY[i] += velY[i];\r\n            }'.length;

    if (startElse !== -1 && endElse !== -1) {
      html = html.slice(0, startElse) + pOldPhysics.trim() + html.slice(endElse);
      console.log('Successfully replaced index.html physics section!');
    }
  }
}

html = html.replace(/stargazer\.js\?v=[^"']*/g, 'stargazer.js?v=20260911_v4_perfect');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html!');
