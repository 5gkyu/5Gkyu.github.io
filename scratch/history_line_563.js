const fs = require('fs');

let code = fs.readFileSync('particle/stargazer.js', 'utf8');

// 定義ブロックの更新
const defStart = code.indexOf('// 有機的水面粒子群');
const totalPointsLineEnd = code.indexOf('\n', code.indexOf('const TOTAL_POINTS =', defStart));

const newDefBlock = `// 有機的水面粒子群（横線パターンを排除しつつ、左右全域にしっかりと広がる美しい水面）
  // 擬似乱数ジェネレータで決定論的・均一かつ自然なジッタード分布を生成
  function prng(seed) {
    let s = seed;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  const rng = prng(98765);
  const WATER_SURF_PTS = [];
  const rowSpacing = 2.0;
  const colSpacing = 2.8;

  for (let y = 1; y <= 135; y += rowSpacing) {
    for (let x = -480; x <= 480; x += colSpacing) {
      // 直線（走査線）に見えないように自然なジッターを加える
      const jx = x + (rng() - 0.5) * 2.0;
      const jy = y + (rng() - 0.5) * 1.4;
      // 少女の反射の中心部は少し密度を抑えて少女の影を際立たせる
      if (jx >= -52 && jx <= 52 && jy >= 1 && jy <= 127) {
        if (rng() > 0.35) continue;
      }
      const depthRatio = jy / 135.0;
      // しっかりと視認できる美しい夜の湖面の色彩（群青〜サファイア〜エメラルドシアン）
      const r = Math.round(28 + (1 - depthRatio) * 12 + (rng() - 0.5) * 10);
      const g = Math.round(65 + (1 - depthRatio) * 25 + (rng() - 0.5) * 16);
      const b = Math.round(125 + (1 - depthRatio) * 35 + (rng() - 0.5) * 20);
      WATER_SURF_PTS.push({
        bx: Math.round(jx * 10) / 10,
        by: Math.round(jy * 10) / 10,
        rgb: [r, g, b],
        size: 1.35 + rng() * 0.35,
        phase: rng() * 6.28
      });
    }
  }

  const SHOOT_SLOT_COUNT = 60;

  const TOTAL_POINTS = NEBULA_DATA.length + STARS_DATA.length + MAJOR_STAR_PTS.length + GIRL_DATA.length + GIRL_REFL_DATA.length + STAR_REFL_DATA.length + WATER_SURF_PTS.length + SHOOT_SLOT_COUNT;`;

code = code.slice(0, defStart) + newDefBlock + code.slice(totalPointsLineEnd);

// 描画ループブロックの更新（セクション 5.2 のみ更新、少女の影の転写 5 はそのまま！）
const loop52Start = code.indexOf('// 5.2 水面全域の有機的粒子');
const loop52End = code.indexOf('// =========================================================\r\n    // 6. 流れ星', loop52Start) !== -1
  ? code.indexOf('// =========================================================\r\n    // 6. 流れ星', loop52Start)
  : code.indexOf('// =========================================================\n    // 6. 流れ星', loop52Start);

const newLoop52Block = `// 5.2 水面全域の有機的湖面（少女の影の転写と調和する美しい水面光彩）
    // =========================================================
    for (let i = 0; i < WATER_SURF_PTS.length; i++) {
      const p = WATER_SURF_PTS[i];
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

        const depthFactor = Math.min(1.0, Math.max(0, (p.by - 1) / 134.0));
        const waveAmpX = 0.3 + depthFactor * 2.5;
        const waveAmpY = 0.2 + depthFactor * 1.5;

        const surfWaveX = Math.sin(time * 0.95 + p.by * 0.06 + p.bx * 0.02) * waveAmpX;
        const surfWaveY = Math.cos(time * 0.75 + p.bx * 0.025 + p.by * 0.04) * waveAmpY;

        item.bx = p.bx + surfWaveX;
        item.by = p.by + surfWaveY;

        // 水面の波紋のきらめきハイライト（光の筋が滑らかに水面を走る）
        const waveGlow = Math.sin(time * 1.1 + p.bx * 0.02 + p.by * 0.035);
        const shimmer = 0.88 + 0.20 * Math.sin(time * 1.2 + p.phase);
        const depthFade = (0.92 - depthFactor * 0.32) * edgeAlpha;

        let rVal = p.rgb[0] * shimmer * depthFade;
        let gVal = (p.rgb[1] + (waveGlow > 0.3 ? 20 : 0)) * shimmer * depthFade;
        let bVal = (p.rgb[2] + (waveGlow > 0.3 ? 40 : 0)) * shimmer * depthFade;

        item.rgb = [
          Math.min(255, Math.max(0, Math.round(rVal))),
          Math.min(255, Math.max(0, Math.round(gVal))),
          Math.min(255, Math.max(0, Math.round(bVal)))
        ];
        item.size = Math.max(0.9, p.size * (0.95 + waveGlow * 0.15));
      }
    }

    `;

code = code.slice(0, loop52Start) + newLoop52Block + code.slice(loop52End);

fs.writeFileSync('particle/stargazer.js', code, 'utf8');
console.log('Successfully updated stargazer.js with visible water surface!');
