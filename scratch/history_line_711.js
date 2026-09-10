const fs = require('fs');

const raw = fs.readFileSync('particle/stargazer.js', 'utf8');
const lines = raw.split('\r\n');

let startLine = -1;
let endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// 4. 少女（呼吸モーション') && startLine === -1) startLine = i - 1;
  if (lines[i].includes('// 5.1 星々の水面反射')) endLine = i - 1;
}

console.log('Replacing from line', startLine + 1, 'to line', endLine + 1);

const replacementLines = `    // =========================================================
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
    }`.split('\n');

const newLines = [
  ...lines.slice(0, startLine),
  ...replacementLines,
  ...lines.slice(endLine)
];

fs.writeFileSync('particle/stargazer.js', newLines.join('\r\n'), 'utf8');
console.log('Applied lines replacement successfully!');
