const fs = require('fs');

let code = fs.readFileSync('particle/stargazer.js', 'utf8');

// 1. 定義ブロックの更新
// 密集した斑点状ドットを完全に廃止し、
// 「星空の水鏡映り込み (WATER_STAR_REFL)」と「優美なさざ波の光条ライン (WATER_RIPPLE_PTS)」で
// 集合体恐怖症の不安をゼロにし、極めて清潔で透明感あふれる美しい水面を構築
const defStart = code.indexOf('// 有機的水面粒子群');
const totalPointsLineEnd = code.indexOf('\n', code.indexOf('const TOTAL_POINTS =', defStart));

const newDefBlock = `// 清潔で透明感あふれる水面構造（集合体恐怖症の要因となる密集ドットを完全排除）
  // 1. 地平線の流麗な半円アーチライン
  // 2. 数本の優美なさざ波光条（ライン状の滑らかな波紋）
  // 3. 上空の星々が静かに映り込む星の水鏡
  const xRadius = 480;
  const yDepth = 135;

  function getHorizonY(x) {
    const normX = Math.max(-1, Math.min(1, x / xRadius));
    return (1 - Math.cos(normX * Math.PI * 0.5)) * 32.0;
  }

  // A. 水面のさざ波光条パーティクル（斑点ではなく、水面を走る光のライン）
  const WATER_RIPPLE_PTS = [];

  // 地平線境界の半円アーチ光（細やかな光の帯）
  for (let x = -440; x <= 440; x += 3.5) {
    const hy = getHorizonY(x);
    WATER_RIPPLE_PTS.push({
      bx: x,
      by: hy,
      type: 'horizon_edge',
      phase: (x / 440) * Math.PI
    });
  }

  // 数層の優美なさざ波ライン（間隔を広く取り、ツブツブ感をゼロに）
  const rippleRows = [12, 26, 42, 60, 80, 102, 125];
  rippleRows.forEach((baseDy, rIdx) => {
    const maxSpan = xRadius * Math.sqrt(Math.max(0, 1 - Math.pow(baseDy / yDepth, 2)));
    const step = 5.0; // ゆったりとした間隔の光条
    for (let x = -maxSpan; x <= maxSpan; x += step) {
      const hy = getHorizonY(x);
      const y = hy + baseDy;
      // 少女の反射の中心部は間引き、反射像をクリアに際立たせる
      if (x >= -45 && x <= 45 && y >= 1 && y <= 127) {
        if (Math.abs(x) < 32) continue;
      }
      WATER_RIPPLE_PTS.push({
        bx: x,
        by: y,
        type: 'ripple',
        depthRatio: baseDy / yDepth,
        phase: rIdx * 0.85 + (x / 90.0)
      });
    }
  });

  // B. 上空の星々が静かに映り込む星鏡パーティクル
  const WATER_STAR_REFL = [];
  STARS_DATA.forEach(s => {
    // 上空の星を水面に上下反転（縮尺で水面領域に優美に収める）
    const reflY = -s.by * 0.44;
    const hy = getHorizonY(s.bx);
    if (reflY >= hy && reflY <= hy + yDepth) {
      const normX = s.bx / xRadius;
      const normDy = (reflY - hy) / yDepth;
      if (normX * normX + normDy * normDy <= 0.98) {
        WATER_STAR_REFL.push({
          bx: s.bx,
          by: reflY,
          rgb: s.rgb,
          base_size: s.base_size,
          twinkle_phase: s.twinkle_phase,
          twinkle_speed: s.twinkle_speed
        });
      }
    }
  });

  const SHOOT_SLOT_COUNT = 60;

  const TOTAL_POINTS = NEBULA_DATA.length + STARS_DATA.length + MAJOR_STAR_PTS.length + GIRL_DATA.length + GIRL_REFL_DATA.length + STAR_REFL_DATA.length + WATER_RIPPLE_PTS.length + WATER_STAR_REFL.length + SHOOT_SLOT_COUNT;`;

code = code.slice(0, defStart) + newDefBlock + code.slice(totalPointsLineEnd);

// 2. 描画ループブロックの更新
const loop52Start = code.indexOf('// 5.2 水面全域の半円湖面');
const loop6Start = code.indexOf('// =========================================================\r\n    // 6. 流れ星', loop52Start) !== -1
  ? code.indexOf('// =========================================================\r\n    // 6. 流れ星', loop52Start)
  : code.indexOf('// =========================================================\n    // 6. 流れ星', loop52Start);

const newLoop52Block = `// 5.2 水面のさざ波光条（斑点感を排した、優雅に流れる光の波）
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

        // 水面を静かに伝うさざ波の揺らめき
        const waveX = Math.cos(time * 0.7 + p.by * 0.05) * 1.2;
        const waveY = Math.sin(time * 0.9 + p.bx * 0.02 + p.by * 0.06) * (p.type === 'horizon_edge' ? 0.4 : 1.4);

        item.bx = p.bx + waveX;
        item.by = p.by + waveY;

        const waveGlow = Math.sin(time * 1.1 + p.phase);
        const glowFactor = 0.80 + 0.20 * waveGlow;

        if (p.type === 'horizon_edge') {
          // 地平線の美しい発光アーチ（星の地平線として優雅に光る）
          item.rgb = [
            Math.min(255, Math.round((35 + waveGlow * 15) * glowFactor * edgeAlpha)),
            Math.min(255, Math.round((90 + waveGlow * 30) * glowFactor * edgeAlpha)),
            Math.min(255, Math.round((180 + waveGlow * 45) * glowFactor * edgeAlpha))
          ];
          item.size = Math.max(0.8, 1.2 * glowFactor * edgeAlpha);
        } else {
          // さざ波ライン：澄んだサファイアブルーの流麗な光の筋
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

        // 水面の波による柔らかな揺らぎ
        const waveX = Math.cos(time * 0.65 + p.twinkle_phase) * 0.6;
        const waveY = Math.sin(time * 0.75 + p.twinkle_phase) * 0.6;

        item.bx = p.bx + waveX;
        item.by = p.by + waveY;

        const twinkle = Math.sin(time * p.twinkle_speed + p.twinkle_phase);
        const starBright = (0.75 + 0.25 * twinkle) * edgeAlpha;

        // 水鏡に映る星の光（上空の星より少し淡く、澄んだ青みを帯びた光）
        item.rgb = [
          Math.min(255, Math.round((p.rgb[0] * 0.75 + 10) * starBright)),
          Math.min(255, Math.round((p.rgb[1] * 0.85 + 20) * starBright)),
          Math.min(255, Math.round((p.rgb[2] * 0.95 + 40) * starBright))
        ];
        item.size = Math.max(0.7, p.base_size * (0.85 + 0.15 * twinkle));
      }
    }

    `;

code = code.slice(0, loop52Start) + newLoop52Block + code.slice(loop6Start);

fs.writeFileSync('particle/stargazer.js', code, 'utf8');
console.log('Successfully updated stargazer.js with clean, elegant ripple water surface!');
