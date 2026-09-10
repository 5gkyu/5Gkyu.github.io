const fs = require('fs');

let code = fs.readFileSync('particle/stargazer.js', 'utf8');

// 1. starReflData の抽出
const waterDataStart = code.indexOf('const WATER_DATA = [');
const waterDataEnd = code.indexOf('];', waterDataStart) + 1;
const waterDataStr = code.slice(waterDataStart + 'const WATER_DATA = '.length, waterDataEnd);
const waterData = JSON.parse(waterDataStr);
const starReflData = waterData.filter(p => p.type === 'star_refl');

// 2. 定義ブロックの置換範囲
const totalPointsIdx = code.indexOf('const TOTAL_POINTS =', waterDataStart);
const totalPointsLineEnd = code.indexOf('\n', totalPointsIdx);

const newDefBlock = `// 少女本体（GIRL_DATA 3,147点）を水面（Y = 0）に対して上下完全反転（by = -p.by）
  // これにより、頭頂部（-127）〜足元（-1）まで、フード状の輪郭を含む少女全体の完全な鏡像を生成
  const GIRL_REFL_DATA = GIRL_DATA.map(p => ({
    bx: p.bx,
    by: -p.by, // Y: 1 〜 127
    rgb: p.rgb,
    part: p.part,
    size: p.size || 1.3
  }));

  // 星々の水面反射データ（204点）
  const STAR_REFL_DATA = ${JSON.stringify(starReflData)};

  // 有機的水面粒子群（横線パターン・スキャンラインを100%排除した自然な星空水面）
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
  const rowSpacing = 2.5;
  const colSpacing = 3.5;
  for (let y = 1; y <= 130; y += rowSpacing) {
    for (let x = -480; x <= 480; x += colSpacing) {
      // 水平・垂直に自然なジッターを加えることで、人工的な横線（サウンドウェーブ）の発生を完全に防止
      const jx = x + (rng() - 0.5) * 2.4;
      const jy = y + (rng() - 0.5) * 1.8;
      // 少女の反射の中心部（X: -52..52 かつ Y: 1..127）は少女自身の鏡像が濃密にあるため、外側と自然にブレンド
      if (jx >= -50 && jx <= 50 && jy >= 1 && jy <= 127) {
        if (rng() > 0.15) continue;
      }
      const depthRatio = jy / 130.0;
      const r = Math.round(14 + rng() * 14);
      const g = Math.round(28 + depthRatio * 16 + rng() * 22);
      const b = Math.round(58 + depthRatio * 32 + rng() * 40);
      WATER_SURF_PTS.push({
        bx: Math.round(jx * 10) / 10,
        by: Math.round(jy * 10) / 10,
        rgb: [r, g, b],
        size: 1.1 + rng() * 0.4,
        phase: rng() * 6.28
      });
    }
  }

  const SHOOT_SLOT_COUNT = 60;

  const TOTAL_POINTS = NEBULA_DATA.length + STARS_DATA.length + MAJOR_STAR_PTS.length + GIRL_DATA.length + GIRL_REFL_DATA.length + STAR_REFL_DATA.length + WATER_SURF_PTS.length + SHOOT_SLOT_COUNT;`;

code = code.slice(0, waterDataStart) + newDefBlock + code.slice(totalPointsLineEnd);

// 3. 描画ループブロックの置換
const loopStart = code.indexOf('// 5. 水面と鏡面反射');
const loopEnd = code.indexOf('// 6. 流れ星');

const newLoopBlock = `// 5. 少女の全身完全反転水鏡（頭部・フード状の輪郭全体まで映し出す鏡像）
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
        // 画面端のフェードアウト
        const absX = Math.abs(p.bx);
        let edgeAlpha = 1.0;
        if (absX > 400) {
          edgeAlpha *= Math.max(0, (512 - absX) / 112);
        }

        // 水面境界（Y=1付近）が最もシャープで、手前（Y=127付近・頭部）に離れるほど波でにじむ物理表現
        // depthFactor: Y=1 で 0.0、Y=127 で 1.0
        const depthFactor = Math.min(1.0, Math.max(0, (p.by - 1) / 126.0));

        // 水面直下は極めてシャープ（振幅 0.2px）、離れるほど波紋の揺らぎが大きくなり自然ににじむ（最大 3.6px）
        const waveAmpX = 0.2 + depthFactor * 3.6;
        const waveAmpY = 0.1 + depthFactor * 1.8;

        const reflWaveX = Math.sin(time * 0.95 + p.by * 0.08 + p.bx * 0.03) * waveAmpX
                        + Math.cos(time * 0.65 + p.by * 0.04) * (waveAmpX * 0.5);
        const reflWaveY = Math.cos(time * 0.75 + p.bx * 0.03 + p.by * 0.05) * waveAmpY;

        item.bx = p.bx + reflWaveX;
        item.by = p.by + reflWaveY;

        // 水深による自然な透過と減衰（うっすらと幻想的に映り込む水鏡の質感）
        const reflAlpha = (0.82 - depthFactor * 0.44) * edgeAlpha;
        const reflPulse = 0.92 + 0.08 * Math.sin(time * 1.2 + p.by * 0.06);

        // リムライト（フードや頭部の輪郭・白・シアンの輝き）は水面でもキラッと反射
        const isRimOrGlow = (p.part === 'rim' || p.rgb[0] > 60 || p.rgb[1] > 110 || p.rgb[2] > 160);
        const colorBoost = isRimOrGlow ? 1.25 : 0.88;

        const rVal = (p.rgb[0] * colorBoost + 10) * reflPulse * reflAlpha;
        const gVal = (p.rgb[1] * colorBoost + 22) * reflPulse * reflAlpha;
        const bVal = (p.rgb[2] * colorBoost + 42) * reflPulse * reflAlpha;

        item.rgb = [
          Math.min(255, Math.max(0, Math.round(rVal))),
          Math.min(255, Math.max(0, Math.round(gVal))),
          Math.min(255, Math.max(0, Math.round(bVal)))
        ];
        // 水面付近はくっきり、手前は波の広がりとともにわずかに柔らかく
        item.size = Math.max(0.8, p.size * (0.95 + depthFactor * 0.15));
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
        const starShimmer = 0.85 + 0.15 * waveGlow;
        const starAlpha = (0.80 - depthFactor * 0.35) * edgeAlpha;

        item.rgb = [
          Math.min(255, Math.round((p.rgb[0] + 15) * starShimmer * starAlpha)),
          Math.min(255, Math.round((p.rgb[1] + 35) * starShimmer * starAlpha)),
          Math.min(255, Math.round((p.rgb[2] + 75) * starShimmer * starAlpha))
        ];
        item.size = Math.max(0.8, p.size * (1.0 + waveGlow * 0.2));
      }
    }

    // =========================================================
    // 5.2 水面全域の有機的粒子（横線・サウンドウェーブを100%排除した自然な湖面演出）
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

        const depthFactor = Math.min(1.0, Math.max(0, (p.by - 1) / 129.0));
        const waveAmpX = 0.3 + depthFactor * 2.8;
        const waveAmpY = 0.2 + depthFactor * 1.6;

        const surfWaveX = Math.sin(time * 0.9 + p.by * 0.06 + p.bx * 0.02) * waveAmpX;
        const surfWaveY = Math.cos(time * 0.75 + p.bx * 0.025 + p.by * 0.04) * waveAmpY;

        item.bx = p.bx + surfWaveX;
        item.by = p.by + surfWaveY;

        // 水面の穏やかな明滅ときらめき
        const shimmer = 0.85 + 0.15 * Math.sin(time * 1.0 + p.phase);
        const depthAlpha = (0.75 - depthFactor * 0.35) * edgeAlpha;

        item.rgb = [
          Math.min(255, Math.max(0, Math.round(p.rgb[0] * shimmer * depthAlpha))),
          Math.min(255, Math.max(0, Math.round(p.rgb[1] * shimmer * depthAlpha))),
          Math.min(255, Math.max(0, Math.round(p.rgb[2] * shimmer * depthAlpha)))
        ];
        item.size = Math.max(0.7, p.size * shimmer);
      }
    }

    // =========================================================
    `;

code = code.slice(0, loopStart) + newLoopBlock + code.slice(loopEnd);

fs.writeFileSync('particle/stargazer.js', code, 'utf8');
console.log('Successfully updated stargazer.js');
