const fs = require('fs');

let code = fs.readFileSync('particle/stargazer.js', 'utf8');

// 1. 定義ブロックの更新（WATER_SURF_PTS の地平線を半円・円弧形状へ）
const defStart = code.indexOf('// 有機的水面粒子群');
const totalPointsLineEnd = code.indexOf('\n', code.indexOf('const TOTAL_POINTS =', defStart));

const newDefBlock = `// 有機的水面粒子群（地平線を直線から美しい半円アーチへ、水面全体を半円状の湖面盤として形成）
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
  const xRadius = 480;
  const yDepth = 135;

  for (let y = 0; y <= yDepth + 35; y += 2.0) {
    for (let x = -xRadius; x <= xRadius; x += 2.8) {
      const normX = x / xRadius;
      // 地平線の美しい半円円弧（中央 x=0 で y=0、左右 x=±480 で y=32 へ丸く下がる半円アーチ）
      const horizonY = (1 - Math.cos(normX * Math.PI * 0.5)) * 32.0;

      // 地平線より上（空）は除外
      if (y < horizonY) continue;

      // 水面全体の深さ（手前への広がり）
      const dy = y - horizonY;
      const normDy = dy / yDepth;

      // 手前の半円・半楕円外周境界（完全な半円形状盤）
      if (normX * normX + normDy * normDy > 1.0) continue;

      // 直線（走査線）に見えないように自然なジッターを加える
      const jx = x + (rng() - 0.5) * 2.0;
      const jy = y + (rng() - 0.5) * 1.4;

      // 少女の反射の中心部は少し密度を抑えて少女の影を際立たせる
      if (jx >= -52 && jx <= 52 && jy >= 1 && jy <= 127) {
        if (rng() > 0.35) continue;
      }

      const depthRatio = dy / yDepth;
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

// 2. 描画ループブロックの更新（反射キャラクターの色を洗練し、水面描画も半円エッジフェードに対応）
const loop5Start = code.indexOf('// 5. 少女の全身完全反転水鏡');
const loop6Start = code.indexOf('// =========================================================\r\n    // 6. 流れ星', loop5Start) !== -1
  ? code.indexOf('// =========================================================\r\n    // 6. 流れ星', loop5Start)
  : code.indexOf('// =========================================================\n    // 6. 流れ星', loop5Start);

const newLoopBlock = `// 5. 少女の全身完全反転水鏡（透明感と輝きを両立した洗練された反射色彩）
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
        const depthFactor = Math.min(1.0, Math.max(0, (p.by - 1) / 126.0));

        const waveAmpX = 0.2 + depthFactor * 3.6;
        const waveAmpY = 0.1 + depthFactor * 1.8;

        const reflWaveX = Math.sin(time * 0.95 + p.by * 0.08 + p.bx * 0.03) * waveAmpX
                        + Math.cos(time * 0.65 + p.by * 0.04) * (waveAmpX * 0.5);
        const reflWaveY = Math.cos(time * 0.75 + p.bx * 0.03 + p.by * 0.05) * waveAmpY;

        item.bx = p.bx + reflWaveX;
        item.by = p.by + reflWaveY;

        // 水面の波によるきらめきパルス
        const shimmer = 0.94 + 0.10 * Math.sin(time * 1.3 + p.by * 0.05 + p.bx * 0.04);
        const isHighLight = (p.part === 'rim' || p.part === 'loose_hair' || p.part === 'dress_edge');

        let rVal, gVal, bVal;

        if (isHighLight) {
          // フード輪郭・髪・ドレス裾の光るパーツ：
          // 水鏡に映る星空の光として、澄んだシアン・ホワイトの輝きを鮮やかに保つ
          // 深さによる黒沈みを防ぎ、透明感あふれる光条として水面に揺らめく
          const lightFade = (0.95 - depthFactor * 0.18) * edgeAlpha;
          const lightGlow = 1.05 + 0.12 * Math.sin(time * 1.6 + p.bx * 0.06);

          rVal = (p.rgb[0] * 0.92 + 18) * lightGlow * lightFade;
          gVal = (p.rgb[1] * 1.02 + 28) * lightGlow * lightFade;
          bVal = (p.rgb[2] * 1.08 + 40) * lightGlow * lightFade;
        } else {
          // ボディ・ドレス・足元：
          // 泥のように暗く潰さず、深海・サファイアネイビーの上品な色彩として水面と調和
          const bodyFade = (0.88 - depthFactor * 0.28) * edgeAlpha;

          rVal = (p.rgb[0] * 0.88 + 14) * shimmer * bodyFade;
          gVal = (p.rgb[1] * 0.96 + 32) * shimmer * bodyFade;
          bVal = (p.rgb[2] * 1.06 + 62) * shimmer * bodyFade;
        }

        item.rgb = [
          Math.min(255, Math.max(0, Math.round(rVal))),
          Math.min(255, Math.max(0, Math.round(gVal))),
          Math.min(255, Math.max(0, Math.round(bVal)))
        ];
        // 水面付近はくっきり、手前は波の広がりとともにわずかに柔らかく
        item.size = Math.max(0.9, (p.size || 1.3) * (0.95 + depthFactor * 0.15));
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
    // 5.2 水面全域の半円湖面（直線地平線を排した優美な円弧水面）
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
          edgeAlpha *= Math.max(0, (480 - absX) / 80);
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
        const depthFade = (0.92 - depthFactor * 0.30) * edgeAlpha;

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

code = code.slice(0, loop5Start) + newLoopBlock + code.slice(loop6Start);

fs.writeFileSync('particle/stargazer.js', code, 'utf8');
console.log('Successfully updated stargazer.js with semicircle horizon and refined reflection colors!');
