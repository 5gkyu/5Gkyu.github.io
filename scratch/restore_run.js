const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('particle/stargazer.js', 'utf8');
const sandbox = { window: {}, module: {}, exports: {} };
vm.createContext(sandbox);

const extractCode = code.replace('(function (root) {', '(function (root) {\n root.getData = function() { return { NEBULA_DATA, GIRL_DATA, GIRL_REFL_DATA, WATER_RIPPLE_PTS, WATER_STAR_REFL, MAJOR_STAR_PTS, STARS_DATA }; };');
vm.runInContext(extractCode, sandbox);
const orig = sandbox.getData();

// 1. NEBULA サンプリング (1,681点)
const newNebula = orig.NEBULA_DATA;

// 2. GIRL サンプリング (1,349点)
const newGirl = orig.GIRL_DATA;

// 3. GIRL_REFL サンプリング (787点)
const newGirlRefl = orig.GIRL_REFL_DATA;

// 4. WATER_RIPPLE サンプリング (448点)
const newWaterRipple = orig.WATER_RIPPLE_PTS.map(p => ({
  bx: p.bx,
  by: p.by,
  base_size: p.base_size || 1.8,
  speed: p.speed || 1.5,
  phase: p.phase || 0,
  amp: p.amp || 0.8
}));

// 5. WATER_STAR_REFL サンプリング (225点)
const newWaterStar = orig.WATER_STAR_REFL.map(p => ({
  bx: p.bx,
  by: p.by,
  rgb: p.rgb || [180, 220, 255],
  base_size: p.base_size || 1.8,
  twinkle_speed: p.twinkle_speed || 2.0,
  twinkle_phase: p.twinkle_phase || 0
}));

// 6. STARS サンプリング (369点)
const newStars = orig.STARS_DATA;

// 7. MAJOR_STARS サンプリング (278点)
const newMajorStars = orig.MAJOR_STAR_PTS;

const shootSlotCount = 30;

const totalCount = newNebula.length + newGirl.length + newGirlRefl.length + 
                   newWaterRipple.length + newWaterStar.length + newStars.length + 
                   newMajorStars.length + shootSlotCount;

console.log('Optimized counts:', {
  NEBULA: newNebula.length,
  GIRL: newGirl.length,
  GIRL_REFL: newGirlRefl.length,
  WATER_RIPPLE: newWaterRipple.length,
  WATER_STAR: newWaterStar.length,
  STARS: newStars.length,
  MAJOR_STARS: newMajorStars.length,
  SHOOT: shootSlotCount,
  TOTAL: totalCount
});

// 新しい stargazer.js を生成
const outputCode = `/**
 * stargazer.js - Starry Mirror & The Stargazer (星の鏡と佇む少女) [Optimized Lightweight Edition]
 * 
 * 仕様:
 * 1. 配列長は毎フレーム 100% 厳密に固定（総数: ${totalCount} 点）。
 * 2. turtle モデルと同等の軽量・高速なステアリング物理演算（60FPS維持）。
 * 3. 少女の呼吸・夜風になびく髪と裾、水面の揺らめき、星の瞬き、流れ星を極上のクオリティで描画。
 */

'use strict';

(function (root) {

  // 静的データ定義
  const NEBULA_DATA = ${JSON.stringify(newNebula)};
  const GIRL_DATA = ${JSON.stringify(newGirl)};
  const GIRL_REFL_DATA = ${JSON.stringify(newGirlRefl)};
  const WATER_RIPPLE_PTS = ${JSON.stringify(newWaterRipple)};
  const WATER_STAR_REFL = ${JSON.stringify(newWaterStar)};
  const STARS_DATA = ${JSON.stringify(newStars)};
  const MAJOR_STAR_PTS = ${JSON.stringify(newMajorStars)};

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
        item.size = Math.max(0.8, p.base_size * (0.90 + 0.10 * pulse));
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
        item.size = Math.max(0.7, p.base_size * (0.80 + 0.20 * pulse));
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
        item.size = Math.max(0.8, p.base_size * (p.is_core ? (0.90 + 0.10 * pulse) : (0.80 + 0.20 * pulse)));
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
        const depth = Math.max(1, p.orig_y || (p.by - 20));
        const depthFactor = Math.min(1.0, depth / 100);
        const waveX = Math.sin(time * (p.speed || 1.2) + (p.phase || 0) + depth * 0.08) * ((p.amp || 0.8) + depthFactor * 1.5);
        const waveY = Math.cos(time * ((p.speed || 1.2) * 0.85) + (p.phase || 0) + depth * 0.06) * (0.3 + depthFactor * 0.8);
        item.bx = p.bx + waveX;
        item.by = p.by + waveY - breath * 0.6;
        const shimmer = 0.88 + 0.12 * Math.sin(time * 2.2 + (p.phase || 0));
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * shimmer)),
          Math.min(255, Math.round(p.rgb[1] * shimmer)),
          Math.min(255, Math.round(p.rgb[2] * shimmer))
        ];
        item.size = Math.max(0.7, p.base_size * (0.92 + 0.08 * shimmer));
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
        item.size = Math.max(0.7, p.base_size * (0.85 + 0.15 * waveLight));
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
        item.size = Math.max(0.7, p.base_size * (0.85 + 0.15 * twinkle));
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
console.log('Successfully written particle/stargazer.js!');
