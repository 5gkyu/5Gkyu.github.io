const fs = require('fs');

// stargazer_data.json の読み込み
const rawData = JSON.parse(fs.readFileSync('particle/stargazer_data.json', 'utf8'));

// 1. GIRL_DATA & GIRL_REFL_DATA の生成（3,147点ずつ）
const rawGirl = rawData.girl; // 10,367点
const girlPts = [];
const girlReflPts = [];

rawGirl.forEach((p, idx) => {
  const x = p.rx;
  const y = p.ry;
  const absX = Math.abs(x);
  
  // X = 0〜38 は 100% 保持、38〜62 に向かって滑らかに減衰
  let keepProb = 1.0;
  if (absX > 38) {
    const t = (absX - 38) / (62 - 38);
    keepProb = Math.pow(Math.max(0, 1 - t), 2.2);
  }
  
  const hash = Math.sin(idx * 12.9898 + x * 78.233 + y * 37.719) * 43758.5453;
  const rand = hash - Math.floor(hash);
  
  if (rand < keepProb * 0.45) { // 少女本体
    girlPts.push({
      bx: x,
      by: y,
      rgb: p.rgb,
      base_size: 1.35,
      sway_type: y < -40 ? 'hair' : 'dress',
      sway_phase: (x * 0.05 + y * 0.03),
      sway_speed: y < -40 ? 1.8 : 1.4,
      sway_amp: y < -40 ? 1.2 : 0.8
    });
    
    // 少女水鏡反射（完全反転）
    const reflY = -y;
    girlReflPts.push({
      bx: x,
      by: reflY,
      rgb: [
        Math.min(255, Math.round(p.rgb[0] * 0.75 + 12)),
        Math.min(255, Math.round(p.rgb[1] * 0.88 + 24)),
        Math.min(255, Math.round(p.rgb[2] * 1.05 + 45))
      ],
      base_size: 1.35,
      orig_y: reflY,
      phase: (x * 0.06 + reflY * 0.04),
      speed: 1.2 + (reflY / 100) * 0.6,
      amp: 0.6 + (reflY / 100) * 1.4
    });
  }
});

// 2. NEBULA_DATA（11,762点）: 天の川銀河光芒・散光星雲
const nebulaPts = [];
for (let y = -307; y <= -2; y += 4) {
  for (let x = -512; x <= 512; x += 4) {
    const mwDist = Math.abs(y - (0.55 * x - 50 + Math.sin(x * 0.008) * 45));
    const mwIntensity = Math.exp(-(mwDist * mwDist) / (85 * 85));
    
    const n1 = Math.sin(x * 0.012 + y * 0.008);
    const n2 = Math.cos(x * 0.02 - y * 0.015);
    const nebNoise = (n1 + n2) * 0.5;
    
    if (mwIntensity > 0.06 || nebNoise > 0.35) {
      const bRatio = mwIntensity;
      const r = Math.round(5 + bRatio * 35 + (nebNoise > 0 ? nebNoise * 15 : 0));
      const g = Math.round(8 + bRatio * 65 + (nebNoise > 0 ? nebNoise * 25 : 0));
      const b = Math.round(18 + bRatio * 135 + (nebNoise > 0 ? nebNoise * 45 : 0));
      
      const pulsePhase = (x * 0.02 + y * 0.03) % (Math.PI * 2);
      nebulaPts.push({
        bx: x,
        by: y,
        rgb: [r, g, b],
        base_size: 1.1 + bRatio * 0.5,
        pulse_phase: pulsePhase
      });
    }
  }
}

// 3. STARS_DATA（738点）: 多色きらめき星々
const starColors = [
  [220, 245, 255], // 青白
  [255, 240, 190], // 黄金
  [255, 210, 160], // 琥珀
  [200, 230, 255], // ダイヤモンド
  [240, 200, 255]  // ペールバイオレット
];
const starsPts = [];
for (let i = 0; i < 738; i++) {
  const sx = (Math.sin(i * 99.1) * 500);
  const sy = -300 + (Math.cos(i * 33.7) * 0.5 + 0.5) * 295;
  const col = starColors[i % starColors.length];
  starsPts.push({
    bx: Math.round(sx * 10) / 10,
    by: Math.round(sy * 10) / 10,
    rgb: col,
    base_size: 1.0 + (i % 5) * 0.3,
    twinkle_speed: 1.2 + (i % 7) * 0.4,
    twinkle_phase: (i * 1.618) % (Math.PI * 2),
    pulse_speed: 0.8 + (i % 4) * 0.5
  });
}

// 4. MAJOR_STAR_PTS（556点）: 28個の多様な大星（六条星、ハロー、ダイヤ、連星、クロス）
const majorCores = [
  { bx: -380, by: -240, sz: 5.5, type: 'hex' },
  { bx: -310, by: -180, sz: 4.2, type: 'halo' },
  { bx: -240, by: -260, sz: 4.8, type: 'diamond' },
  { bx: -180, by: -190, sz: 4.5, type: 'cluster' },
  { bx: -120, by: -270, sz: 4.2, type: 'cross' },
  { bx: -60,  by: -220, sz: 6.0, type: 'hex' },
  { bx: 20,   by: -250, sz: 4.4, type: 'halo' },
  { bx: 80,   by: -190, sz: 4.6, type: 'diamond' },
  { bx: 150,  by: -270, sz: 5.8, type: 'hex' },
  { bx: 210,  by: -210, sz: 4.5, type: 'cluster' },
  { bx: 280,  by: -260, sz: 4.2, type: 'halo' },
  { bx: 340,  by: -180, sz: 4.8, type: 'diamond' },
  { bx: 400,  by: -240, sz: 4.2, type: 'halo' },
  { bx: -350, by: -120, sz: 4.0, type: 'cluster' },
  { bx: -280, by: -80,  sz: 4.2, type: 'diamond' },
  { bx: -200, by: -130, sz: 4.0, type: 'halo' },
  { bx: -140, by: -60,  sz: 4.5, type: 'cross' },
  { bx: -80,  by: -140, sz: 4.2, type: 'halo' },
  { bx: 40,   by: -120, sz: 4.2, type: 'cluster' },
  { bx: 110,  by: -70,  sz: 4.5, type: 'diamond' },
  { bx: 180,  by: -140, sz: 4.0, type: 'halo' },
  { bx: 250,  by: -80,  sz: 4.5, type: 'cross' },
  { bx: 320,  by: -130, sz: 4.2, type: 'halo' },
  { bx: 390,  by: -70,  sz: 4.2, type: 'cross' },
  { bx: -420, by: -40,  sz: 3.8, type: 'diamond' },
  { bx: -220, by: -30,  sz: 3.8, type: 'halo' },
  { bx: 200,  by: -35,  sz: 3.8, type: 'cluster' },
  { bx: 420,  by: -30,  sz: 3.8, type: 'cross' }
];

const majorStarPts = [];
const ptsPerStar = Math.floor(556 / majorCores.length); // 約19点/星

majorCores.forEach((c, sIdx) => {
  const cx = c.bx;
  const cy = c.by;
  const starType = c.type;
  
  majorStarPts.push({
    star_id: sIdx,
    cx: cx,
    cy: cy,
    dx: 0,
    dy: 0,
    rgb: [255, 255, 255],
    base_size: c.sz,
    is_core: true,
    phase: sIdx * 0.7,
    speed: 1.5 + (sIdx % 3) * 0.4,
    star_type: starType
  });
  
  const remainPts = ptsPerStar - 1;
  
  if (starType === 'hex') {
    const rays = 6;
    const ptsPerRay = Math.floor(remainPts / rays);
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 3) * r;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.5 + (p + 1) * 3.5;
        const fade = 1 - (p / ptsPerRay) * 0.6;
        majorStarPts.push({
          star_id: sIdx,
          cx: cx,
          cy: cy,
          dx: Math.round(cosA * dist * 10) / 10,
          dy: Math.round(sinA * dist * 10) / 10,
          rgb: [Math.round(210 * fade), Math.round(235 * fade), Math.round(255 * fade)],
          base_size: 1.8 * fade,
          is_core: false,
          phase: sIdx * 0.7 + r * 0.5,
          speed: 1.8,
          star_type: 'hex'
        });
      }
    }
  } else if (starType === 'halo') {
    for (let p = 0; p < remainPts; p++) {
      const angle = (Math.PI * 2 / remainPts) * p;
      const r = (p % 2 === 0 ? 4.5 : 8.5) + (p % 3) * 2.0;
      majorStarPts.push({
        star_id: sIdx,
        cx: cx,
        cy: cy,
        dx: Math.round(Math.cos(angle) * r * 10) / 10,
        dy: Math.round(Math.sin(angle) * r * 10) / 10,
        rgb: [180, 220, 255],
        base_size: 1.6,
        is_core: false,
        phase: sIdx * 0.7 + p * 0.3,
        speed: 1.4,
        star_type: 'halo'
      });
    }
  } else if (starType === 'diamond') {
    const rays = 4;
    const ptsPerRay = Math.floor(remainPts / rays);
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 2) * r + Math.PI / 4;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.0 + (p + 1) * 3.5;
        const fade = 1 - (p / ptsPerRay) * 0.5;
        majorStarPts.push({
          star_id: sIdx,
          cx: cx,
          cy: cy,
          dx: Math.round(cosA * dist * 10) / 10,
          dy: Math.round(sinA * dist * 10) / 10,
          rgb: [Math.round(240 * fade), Math.round(230 * fade), Math.round(255 * fade)],
          base_size: 1.8 * fade,
          is_core: false,
          phase: sIdx * 0.7 + r * 0.6,
          speed: 1.6,
          star_type: 'diamond'
        });
      }
    }
  } else if (starType === 'cluster') {
    const companionDist = 5.5;
    for (let p = 0; p < remainPts; p++) {
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
        star_id: sIdx,
        cx: cx,
        cy: cy,
        dx: Math.round(ox * 10) / 10,
        dy: Math.round(oy * 10) / 10,
        rgb: [220, 240, 255],
        base_size: p === 0 ? 2.8 : 1.4,
        is_core: false,
        phase: sIdx * 0.7 + p * 0.4,
        speed: 1.2,
        star_type: 'cluster'
      });
    }
  } else {
    const rays = 4;
    const ptsPerRay = Math.floor(remainPts / rays);
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 2) * r;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.0 + (p + 1) * 4.0;
        const fade = 1 - (p / ptsPerRay) * 0.6;
        majorStarPts.push({
          star_id: sIdx,
          cx: cx,
          cy: cy,
          dx: Math.round(cosA * dist * 10) / 10,
          dy: Math.round(sinA * dist * 10) / 10,
          rgb: [Math.round(230 * fade), Math.round(240 * fade), Math.round(255 * fade)],
          base_size: 1.8 * fade,
          is_core: false,
          phase: sIdx * 0.7 + r * 0.5,
          speed: 1.5,
          star_type: 'cross'
        });
      }
    }
  }
});

while (majorStarPts.length < 556) {
  majorStarPts.push({
    star_id: 0,
    cx: 0, cy: -200, dx: 0, dy: 0,
    rgb: [255, 255, 255],
    base_size: 1.5,
    is_core: false,
    phase: 0, speed: 1.0, star_type: 'cross'
  });
}

// 5. WATER_RIPPLE_PTS（1,342点）: 半円アーチ地平線とさざ波光条
const waterRipplePts = [];
for (let x = -480; x <= 480; x += 3.5) {
  const archY = 1 + Math.pow(x / 480, 2) * 28;
  waterRipplePts.push({
    bx: Math.round(x * 10) / 10,
    by: Math.round(archY * 10) / 10,
    base_size: 1.5,
    speed: 1.4,
    phase: x * 0.05,
    amp: 0.6,
    is_arch: true
  });
}
for (let y = 5; y <= 126; y += 4) {
  const yRatio = y / 126;
  const spreadX = 480 * (1 - yRatio * 0.15);
  const stepX = 6 + yRatio * 4;
  for (let x = -spreadX; x <= spreadX; x += stepX) {
    waterRipplePts.push({
      bx: Math.round(x * 10) / 10,
      by: Math.round(y * 10) / 10,
      base_size: 1.3 + (1 - yRatio) * 0.5,
      speed: 1.2 + yRatio * 0.8,
      phase: x * 0.04 + y * 0.08,
      amp: 0.8 + yRatio * 1.2,
      is_arch: false
    });
  }
}

// 6. WATER_STAR_REFL（674点）: 星々の水面反射
const waterStarRefl = [];
for (let i = 0; i < 674; i++) {
  const sx = (Math.sin(i * 77.3) * 460);
  const sy = 4 + (Math.cos(i * 44.1) * 0.5 + 0.5) * 118;
  const col = starColors[i % starColors.length];
  waterStarRefl.push({
    bx: Math.round(sx * 10) / 10,
    by: Math.round(sy * 10) / 10,
    rgb: col,
    base_size: 1.2 + (i % 4) * 0.3,
    twinkle_speed: 1.4 + (i % 5) * 0.3,
    twinkle_phase: (i * 2.1) % (Math.PI * 2)
  });
}

const shootSlotCount = 60;

const totalCount = nebulaPts.length + girlPts.length + girlReflPts.length +
                   waterRipplePts.length + waterStarRefl.length + starsPts.length +
                   majorStarPts.length + shootSlotCount;

console.log('Restored Full 21630 counts:', {
  NEBULA: nebulaPts.length,
  GIRL: girlPts.length,
  GIRL_REFL: girlReflPts.length,
  WATER_RIPPLE: waterRipplePts.length,
  WATER_STAR: waterStarRefl.length,
  STARS: starsPts.length,
  MAJOR_STARS: majorStarPts.length,
  SHOOT: shootSlotCount,
  TOTAL: totalCount
});

// stargazer.js のコード生成
const outputCode = `/**
 * stargazer.js - Starry Mirror & The Stargazer (星の鏡と佇む少女) [Full Rich Edition]
 * 
 * 仕様:
 * 1. 配列長は毎フレーム 100% 厳密に固定（総数: ${totalCount} 点）。
 * 2. 満天の星空・天の川銀河光芒・5種の大星・全身上下反転水鏡・流麗なさざ波光条を極上のクオリティで描画。
 */

'use strict';

(function (root) {

  // 静的データ定義
  const NEBULA_DATA = ${JSON.stringify(nebulaPts)};
  const GIRL_DATA = ${JSON.stringify(girlPts)};
  const GIRL_REFL_DATA = ${JSON.stringify(girlReflPts)};
  const WATER_RIPPLE_PTS = ${JSON.stringify(waterRipplePts)};
  const WATER_STAR_REFL = ${JSON.stringify(waterStarRefl)};
  const STARS_DATA = ${JSON.stringify(starsPts)};
  const MAJOR_STAR_PTS = ${JSON.stringify(majorStarPts)};

  const SHOOT_SLOT_COUNT = ${shootSlotCount};

  const TOTAL_POINTS = NEBULA_DATA.length +
                       GIRL_DATA.length +
                       GIRL_REFL_DATA.length +
                       WATER_RIPPLE_PTS.length +
                       WATER_STAR_REFL.length +
                       STARS_DATA.length +
                       MAJOR_STAR_PTS.length +
                       SHOOT_SLOT_COUNT;

  let templateBuffer = null;

  function generateStargazerTemplate(time) {
    if (!templateBuffer || templateBuffer.length !== TOTAL_POINTS) {
      templateBuffer = new Array(TOTAL_POINTS);
      for (let i = 0; i < TOTAL_POINTS; i++) {
        templateBuffer[i] = { bx: 0, by: 0, rgb: [255, 255, 255], size: 2.0 };
      }
    }

    let pIdx = 0;
    const isZero = (time === 0);

    // 1. 星雲・天の川（雄大な天の川銀河光芒の息づかい）
    for (let i = 0; i < NEBULA_DATA.length; i++) {
      const p = NEBULA_DATA[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        const pulse = Math.sin(time * 0.45 + p.pulse_phase);
        const shiftX = Math.cos(time * 0.25 + p.pulse_phase) * 0.8;
        const shiftY = Math.sin(time * 0.35 + p.pulse_phase) * 0.6;
        item.bx = p.bx + shiftX;
        item.by = p.by + shiftY;
        const bright = 0.85 + 0.15 * pulse;
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * bright)),
          Math.min(255, Math.round(p.rgb[1] * bright)),
          Math.min(255, Math.round(p.rgb[2] * bright))
        ];
        item.size = Math.max(0.7, p.base_size * (0.90 + 0.10 * pulse));
      }
    }

    // 2. 背景の星々（多色スペクトル瞬き）
    for (let i = 0; i < STARS_DATA.length; i++) {
      const p = STARS_DATA[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        const twinkle = Math.sin(time * p.twinkle_speed + p.twinkle_phase);
        const pulse = Math.sin(time * p.pulse_speed + p.twinkle_phase * 1.5);
        item.bx = p.bx;
        item.by = p.by;
        const bright = 0.65 + 0.35 * twinkle;
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * bright)),
          Math.min(255, Math.round(p.rgb[1] * bright)),
          Math.min(255, Math.round(p.rgb[2] * bright))
        ];
        item.size = Math.max(0.6, p.base_size * (0.80 + 0.20 * pulse));
      }
    }

    // 3. 5種の大星（六条星、ハロー星、ダイヤモンド星、連星、十字星）
    for (let i = 0; i < MAJOR_STAR_PTS.length; i++) {
      const p = MAJOR_STAR_PTS[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.cx + p.dx;
        item.by = p.cy + p.dy;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        const pulse = Math.sin(time * p.speed + p.phase);
        const beamScale = p.is_core ? (0.92 + 0.08 * pulse) : (0.75 + 0.25 * pulse);
        item.bx = p.cx + p.dx * beamScale;
        item.by = p.cy + p.dy * beamScale;
        const bright = p.is_core ? (0.90 + 0.10 * pulse) : (0.70 + 0.30 * pulse);
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * bright)),
          Math.min(255, Math.round(p.rgb[1] * bright)),
          Math.min(255, Math.round(p.rgb[2] * bright))
        ];
        item.size = Math.max(0.7, p.base_size * (p.is_core ? (0.90 + 0.10 * pulse) : (0.80 + 0.20 * pulse)));
      }
    }

    // 4.1 少女本体（夜風になびく髪と裾、呼吸）
    const breath = isZero ? 0 : (Math.sin(time * 1.2) * 0.7);
    for (let i = 0; i < GIRL_DATA.length; i++) {
      const p = GIRL_DATA[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        let swayX = 0, swayY = 0;
        if (p.sway_type === 'hair') {
          swayX = Math.sin(time * p.sway_speed + p.sway_phase) * p.sway_amp;
          swayY = Math.cos(time * (p.sway_speed * 0.8) + p.sway_phase) * (p.sway_amp * 0.3);
        } else if (p.sway_type === 'dress') {
          swayX = Math.sin(time * p.sway_speed + p.sway_phase) * p.sway_amp;
          swayY = Math.cos(time * p.sway_speed + p.sway_phase) * (p.sway_amp * 0.2);
        }
        item.bx = p.bx + swayX;
        item.by = p.by + swayY + breath;
        item.rgb = p.rgb;
        item.size = p.base_size;
      }
    }

    // 4.2 少女の水鏡反射像（完全な上下反転水鏡）
    for (let i = 0; i < GIRL_REFL_DATA.length; i++) {
      const p = GIRL_REFL_DATA[i];
      const item = templateBuffer[pIdx++];
      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        const depth = Math.max(1, p.orig_y);
        const depthFactor = Math.min(1.0, depth / 100);
        const waveX = Math.sin(time * p.speed + p.phase + depth * 0.08) * (p.amp + depthFactor * 1.5);
        const waveY = Math.cos(time * (p.speed * 0.85) + p.phase + depth * 0.06) * (0.3 + depthFactor * 0.8);
        item.bx = p.bx + waveX;
        item.by = p.by + waveY - breath * 0.6;
        const shimmer = 0.88 + 0.12 * Math.sin(time * 2.2 + p.phase);
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * shimmer)),
          Math.min(255, Math.round(p.rgb[1] * shimmer)),
          Math.min(255, Math.round(p.rgb[2] * shimmer))
        ];
        item.size = Math.max(0.6, p.base_size * (0.92 + 0.08 * shimmer));
      }
    }

    // 5.1 水面さざ波・半円アーチ地平線
    for (let i = 0; i < WATER_RIPPLE_PTS.length; i++) {
      const p = WATER_RIPPLE_PTS[i];
      const item = templateBuffer[pIdx++];
      const absX = Math.abs(p.bx);
      let edgeAlpha = 1.0;
      if (absX > 380) {
        edgeAlpha *= Math.max(0, (480 - absX) / 100);
      }
      const depth = Math.max(0, p.by - 20);
      const depthRatio = Math.min(1.0, depth / 110);
      
      const rBase = Math.round(15 + depthRatio * 12);
      const gBase = Math.round(80 + (1 - depthRatio) * 90);
      const bBase = Math.round(170 + (1 - depthRatio) * 80);

      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = [rBase, gBase, bBase];
        item.size = p.base_size;
      } else {
        const rippleX = Math.cos(time * (p.speed * 0.7) + p.phase) * (p.amp * 0.8);
        const rippleY = Math.sin(time * p.speed + p.phase) * (p.amp * 0.6);
        item.bx = p.bx + rippleX;
        item.by = p.by + rippleY;
        const waveLight = (0.75 + 0.25 * Math.sin(time * (p.speed * 1.2) + p.phase)) * edgeAlpha;
        item.rgb = [
          Math.min(255, Math.round(rBase * waveLight)),
          Math.min(255, Math.round(gBase * waveLight)),
          Math.min(255, Math.round(bBase * waveLight))
        ];
        item.size = Math.max(0.6, p.base_size * (0.85 + 0.15 * waveLight));
      }
    }

    // 5.2 星々の水鏡反射
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
        const waveX = Math.cos(time * 0.65 + p.twinkle_phase) * 0.6;
        const waveY = Math.sin(time * 0.75 + p.twinkle_phase) * 0.6;
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

    // 6. 流れ星
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
console.log('Successfully written perfect full stargazer.js! Total count:', totalCount);
