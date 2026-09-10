const fs = require('fs');

let code = fs.readFileSync('particle/stargazer.js', 'utf8');

const fnStart = code.indexOf('function generateStargazerTemplate(time = 0) {');
const lastBuild = code.lastIndexOf('function buildStargazerParticles() {');

const header = code.slice(0, fnStart);
const footer = code.slice(lastBuild);

const cleanFnBody = `function generateStargazerTemplate(time = 0) {
    let pIdx = 0;
    const isZero = (time === 0);

    // =========================================================
    // 1. 星雲・暗夜背景（微細な輝度呼吸のみ、座標は静止）
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
        const pulse = 0.90 + 0.10 * Math.sin(time * 0.8 + p.pulse_phase);
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * pulse)),
          Math.min(255, Math.round(p.rgb[1] * pulse)),
          Math.min(255, Math.round(p.rgb[2] * (0.92 + 0.08 * pulse)))
        ];
        item.size = p.base_size * pulse;
      }
    }

    // =========================================================
    // 2. 夜空の星々（微細な瞬きと、超微細な浮遊感）
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

        const twinkle = Math.sin(time * p.twinkle_speed + p.twinkle_phase);
        const bright = 0.70 + 0.30 * twinkle;
        item.rgb = [
          Math.min(255, Math.round(p.rgb[0] * (0.75 + 0.25 * bright))),
          Math.min(255, Math.round(p.rgb[1] * (0.75 + 0.25 * bright))),
          Math.min(255, Math.round(p.rgb[2] * (0.85 + 0.15 * bright)))
        ];
        item.size = p.base_size * (0.88 + 0.22 * bright);
      }
    }

    // =========================================================
    // 3. クロス大星（核と光条の呼吸）
    // =========================================================
    for (let i = 0; i < MAJOR_STAR_PTS.length; i++) {
      const p = MAJOR_STAR_PTS[i];
      const item = templateBuffer[pIdx++];
      item.bx = p.bx;
      item.by = p.by;

      if (isZero) {
        item.rgb = p.rgb;
        item.size = p.base_size;
      } else {
        const pulse = 0.85 + 0.15 * Math.sin(time * p.pulse_speed + p.pulse_phase);

        let edgeAlpha = 1.0;
        const absX = Math.abs(p.bx);
        if (absX > 400) {
          edgeAlpha *= Math.max(0, (512 - absX) / 112);
        }
        if (p.by < -260) {
          edgeAlpha *= Math.max(0, (p.by - (-307)) / 47);
        } else if (p.by > 20) {
          edgeAlpha *= Math.max(0, (120 - p.by) / 100);
        }

        const finalPulse = pulse * edgeAlpha;
        if (p.type === 'core') {
          item.rgb = [
            Math.round(p.rgb[0] * edgeAlpha),
            Math.round(p.rgb[1] * edgeAlpha),
            Math.round(p.rgb[2] * edgeAlpha)
          ];
          item.size = p.base_size * finalPulse;
        } else {
          item.rgb = [
            Math.min(255, Math.round(p.rgb[0] * finalPulse)),
            Math.min(255, Math.round(p.rgb[1] * finalPulse)),
            Math.min(255, Math.round(p.rgb[2] * (0.85 + 0.15 * finalPulse)))
          ];
          item.size = p.base_size * finalPulse;
        }
      }
    }

    // =========================================================
    // 4. 少女（外側に向かって滑らかにドットが減るグラデーション境界）
    // =========================================================
    const girlBreathe = isZero ? 0 : Math.sin(time * 1.0) * 0.70;

    for (let i = 0; i < GIRL_DATA.length; i++) {
      const p = GIRL_DATA[i];
      const item = templateBuffer[pIdx++];

      // 外側に行くにつれてドットが減る確率的ディザリング（明らかな縦の直線境界線を完全排除）
      const distFromCenter = Math.abs(p.bx);
      const isKeyPart = (p.part === 'rim' || p.part === 'loose_hair' || p.part === 'dress_edge');
      let edgeWeight = 1.0;

      if (!isKeyPart && distFromCenter > 18) {
        const t = Math.min(1.0, (distFromCenter - 18) / 44.0);
        // 外側へ行くほどドット生存率が急激に減衰（外側ではほぼ消失）
        const keepProb = Math.max(0.01, Math.pow(1.0 - t, 2.5));
        const dotHash = (Math.abs(Math.sin(p.bx * 12.9898 + p.by * 78.233) * 43758.5453)) % 1;

        if (dotHash > keepProb) {
          item.bx = p.bx;
          item.by = p.by;
          item.rgb = [0, 0, 0];
          item.size = 0;
          continue;
        }
        edgeWeight = Math.max(0.1, Math.pow(1.0 - t, 1.6));
      }

      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = [
          Math.round(p.rgb[0] * edgeWeight),
          Math.round(p.rgb[1] * edgeWeight),
          Math.round(p.rgb[2] * edgeWeight)
        ];
        item.size = p.size * edgeWeight;
      } else {
        const heightFactor = Math.max(0, Math.min(1, (-p.by) / 120.0));
        let animX = 0;
        let animY = girlBreathe * heightFactor;

        if (p.bx > 0) {
          const swayWeight = Math.min(1.0, Math.max(0.0, (p.bx - 2.0) / 28.0));
          const wavePhase = time * 1.0 + p.by * 0.05;
          animX += Math.sin(wavePhase) * (1.5 * swayWeight);
          animY += Math.cos(wavePhase) * (0.4 * swayWeight);
        }

        if (p.by > -50) {
          const skirtWeight = Math.min(1.0, Math.max(0.0, (p.by - (-50)) / 40.0));
          animX += Math.sin(time * 0.9 + p.bx * 0.07) * (0.8 * skirtWeight);
          animY += Math.cos(time * 0.9 + p.bx * 0.07) * (0.3 * skirtWeight);
        }

        item.bx = p.bx + animX;
        item.by = p.by + animY;

        if (p.part === 'rim' || p.part === 'loose_hair') {
          const shimmer = Math.sin(time * 2.0 + p.by * 0.10);
          if (shimmer > 0.65) {
            item.rgb = [
              Math.min(255, Math.round((p.rgb[0] + 20) * edgeWeight)),
              Math.min(255, Math.round((p.rgb[1] + 18) * edgeWeight)),
              Math.min(255, Math.round((p.rgb[2] + 12) * edgeWeight))
            ];
            item.size = (p.size + 0.18) * 1.08 * edgeWeight;
          } else {
            item.rgb = [
              Math.round(p.rgb[0] * edgeWeight),
              Math.round(p.rgb[1] * edgeWeight),
              Math.round(p.rgb[2] * edgeWeight)
            ];
            item.size = (p.size + 0.15) * edgeWeight;
          }
        } else {
          item.rgb = [
            Math.round(p.rgb[0] * edgeWeight),
            Math.round(p.rgb[1] * edgeWeight),
            Math.round(p.rgb[2] * edgeWeight)
          ];
          item.size = p.size * edgeWeight;
        }
      }
    }

    // =========================================================
    // 5. 少女の全身完全反転水鏡（外側に向かってドットが減る自然な水面反射）
    // =========================================================
    for (let i = 0; i < GIRL_REFL_DATA.length; i++) {
      const p = GIRL_REFL_DATA[i];
      const item = templateBuffer[pIdx++];

      const distFromCenter = Math.abs(p.bx);
      const isKeyPart = (p.part === 'rim' || p.part === 'loose_hair' || p.part === 'dress_edge');
      let edgeWeight = 1.0;

      if (!isKeyPart && distFromCenter > 18) {
        const t = Math.min(1.0, (distFromCenter - 18) / 44.0);
        const keepProb = Math.max(0.01, Math.pow(1.0 - t, 2.5));
        const dotHash = (Math.abs(Math.sin(p.bx * 12.9898 + p.by * 78.233) * 43758.5453)) % 1;

        if (dotHash > keepProb) {
          item.bx = p.bx;
          item.by = p.by;
          item.rgb = [0, 0, 0];
          item.size = 0;
          continue;
        }
        edgeWeight = Math.max(0.1, Math.pow(1.0 - t, 1.6));
      }

      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = [
          Math.round(p.rgb[0] * edgeWeight),
          Math.round(p.rgb[1] * edgeWeight),
          Math.round(p.rgb[2] * edgeWeight)
        ];
        item.size = p.size * edgeWeight;
      } else {
        const depthFactor = Math.min(1.0, Math.max(0, (p.by - 1) / 126.0));

        const waveAmpX = 0.2 + depthFactor * 3.6;
        const waveAmpY = 0.1 + depthFactor * 1.8;

        const reflWaveX = Math.sin(time * 0.95 + p.by * 0.08 + p.bx * 0.03) * waveAmpX
                        + Math.cos(time * 0.65 + p.by * 0.04) * (waveAmpX * 0.5);
        const reflWaveY = Math.cos(time * 0.75 + p.bx * 0.03 + p.by * 0.05) * waveAmpY;

        item.bx = p.bx + reflWaveX;
        item.by = p.by + reflWaveY;

        const shimmer = 0.94 + 0.10 * Math.sin(time * 1.3 + p.by * 0.05 + p.bx * 0.04);
        let rVal, gVal, bVal;

        if (isKeyPart) {
          const lightFade = (0.95 - depthFactor * 0.18) * edgeWeight;
          const lightGlow = 1.05 + 0.12 * Math.sin(time * 1.6 + p.bx * 0.06);

          rVal = (p.rgb[0] * 0.92 + 18) * lightGlow * lightFade;
          gVal = (p.rgb[1] * 1.02 + 28) * lightGlow * lightFade;
          bVal = (p.rgb[2] * 1.08 + 40) * lightGlow * lightFade;
        } else {
          const bodyFade = (0.88 - depthFactor * 0.28) * edgeWeight;

          rVal = (p.rgb[0] * 0.88 + 14) * shimmer * bodyFade;
          gVal = (p.rgb[1] * 0.96 + 32) * shimmer * bodyFade;
          bVal = (p.rgb[2] * 1.06 + 62) * shimmer * bodyFade;
        }

        item.rgb = [
          Math.min(255, Math.max(0, Math.round(rVal))),
          Math.min(255, Math.max(0, Math.round(gVal))),
          Math.min(255, Math.max(0, Math.round(bVal)))
        ];
        item.size = Math.max(0.8, (p.size || 1.3) * (0.95 + depthFactor * 0.15) * edgeWeight);
      }
    }

    // =========================================================
    // 5.1 星々の水面反射（星空の輝きの映り込み）
    // =========================================================
    for (let i = 0; i < STAR_REFL_DATA.length; i++) {
      const p = STAR_REFL_DATA[i];
      const item = templateBuffer[pIdx++];

      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = p.rgb;
        item.size = p.size;
      } else {
        const absX = Math.abs(p.bx);
        let edgeAlpha = 1.0;
        if (absX > 400) {
          edgeAlpha *= Math.max(0, (512 - absX) / 112);
        }

        const depthFactor = Math.min(1.0, Math.max(0, (p.by - 1) / 100.0));
        const waveAmpX = 0.4 + depthFactor * 2.5;
        const waveAmpY = 0.2 + depthFactor * 1.5;

        const waveX = Math.sin(time * 0.9 + p.by * 0.05 + p.bx * 0.02) * waveAmpX;
        const waveY = Math.cos(time * 0.75 + p.bx * 0.025 + p.by * 0.03) * waveAmpY;

        item.bx = p.bx + waveX;
        item.by = p.by + waveY;

        const waveGlow = Math.sin(time * 1.1 + p.bx * 0.025 + p.by * 0.04);
        const starShimmer = 0.88 + 0.15 * waveGlow;
        const starAlpha = (0.85 - depthFactor * 0.25) * edgeAlpha;

        item.rgb = [
          Math.min(255, Math.round((p.rgb[0] + 18) * starShimmer * starAlpha)),
          Math.min(255, Math.round((p.rgb[1] + 40) * starShimmer * starAlpha)),
          Math.min(255, Math.round((p.rgb[2] + 85) * starShimmer * starAlpha))
        ];
        item.size = Math.max(0.85, p.size * (1.0 + waveGlow * 0.2));
      }
    }

    // =========================================================
    // 5.2 水面のさざ波光条（少女の真下も貫通して流れる優美な波）
    // =========================================================
    for (let i = 0; i < WATER_RIPPLE_PTS.length; i++) {
      const p = WATER_RIPPLE_PTS[i];
      const item = templateBuffer[pIdx++];

      if (isZero) {
        item.bx = p.bx;
        item.by = p.by;
        item.rgb = [30, 80, 150];
        item.size = 1.3;
      } else {
        const absX = Math.abs(p.bx);
        let edgeAlpha = 1.0;
        if (absX > 380) {
          edgeAlpha *= Math.max(0, (480 - absX) / 100);
        }

        const waveX = Math.cos(time * 0.7 + p.by * 0.05) * 1.2;
        const waveY = Math.sin(time * 0.9 + p.bx * 0.02 + p.by * 0.06) * (p.type === 'horizon_edge' ? 0.4 : 1.4);

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
    // 5.3 星々の静かな水鏡反射（星空がそのまま湖面に映る透明な水鏡）
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

    // =========================================================
    // 6. 流れ星（固定スロットで夜空を横切る流麗な光跡）
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

  `;

const fullCode = header + cleanFnBody + footer;
fs.writeFileSync('particle/stargazer.js', fullCode, 'utf8');
console.log('Rebuilt clean stargazer.js successfully!');
