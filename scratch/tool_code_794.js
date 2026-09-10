const fs = require('fs');

let code = fs.readFileSync('particle/stargazer.js', 'utf8');

// 1. MAJOR_STAR_PTS の再定義（クロス偏重を解消し、多彩な星の形状を構築）
const majorStart = code.indexOf('const MAJOR_STAR_PTS = [');
const majorEnd = code.indexOf('];\r\n  const GIRL_DATA') !== -1
  ? code.indexOf('];\r\n  const GIRL_DATA') + 2
  : code.indexOf('];\n  const GIRL_DATA') + 2;

const majorStr = code.slice(majorStart + 'const MAJOR_STAR_PTS = '.length, majorEnd - 1);
const major = JSON.parse(majorStr);

const stars = [];
let curStar = null;
major.forEach(p => {
  if (p.type === 'core') {
    curStar = { core: p, pts: [] };
    stars.push(curStar);
  } else if (curStar) {
    curStar.pts.push(p);
  }
});

const starTypeAssignment = [
  'hex',      // 0 (特大六条星)
  'halo',     // 1 (円形ハローオーブ)
  'diamond',  // 2 (斜めダイヤモンド)
  'cluster',  // 3 (連星・星団)
  'cross',    // 4 (十字クロス)
  'hex',      // 5 (特大六条星)
  'halo',     // 6 (円形ハローオーブ)
  'diamond',  // 7 (斜めダイヤモンド)
  'hex',      // 8 (特大六条星)
  'cluster',  // 9 (連星・星団)
  'halo',     // 10
  'diamond',  // 11
  'halo',     // 12
  'cluster',  // 13
  'diamond',  // 14
  'halo',     // 15
  'cross',    // 16 (十字クロス)
  'halo',     // 17
  'cluster',  // 18
  'diamond',  // 19
  'halo',     // 20
  'cross',    // 21 (十字クロス)
  'halo',     // 22
  'cross',    // 23 (十字クロス)
  'diamond',  // 24
  'halo',     // 25
  'cluster',  // 26
  'cross'     // 27 (十字クロス)
];

const newMajorPts = [];

stars.forEach((s, sIdx) => {
  const cx = s.core.bx;
  const cy = s.core.by;
  const starType = starTypeAssignment[sIdx];
  const numPts = s.pts.length;

  newMajorPts.push({
    ...s.core,
    star_type: starType
  });

  if (starType === 'hex') {
    const rays = 6;
    const ptsPerRay = numPts / rays;
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 3) * r;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.5 + (p + 1) * 3.8;
        const origPt = s.pts[r * ptsPerRay + p];
        newMajorPts.push({
          ...origPt,
          bx: Math.round((cx + cosA * dist) * 10) / 10,
          by: Math.round((cy + sinA * dist) * 10) / 10,
          type: 'hex_ray',
          star_type: 'hex'
        });
      }
    }
  } else if (starType === 'halo') {
    for (let p = 0; p < numPts; p++) {
      const angle = (Math.PI * 2 / numPts) * p;
      const r = (p % 2 === 0 ? 4.5 : 8.5) + (p % 3) * 2.0;
      const origPt = s.pts[p];
      newMajorPts.push({
        ...origPt,
        bx: Math.round((cx + Math.cos(angle) * r) * 10) / 10,
        by: Math.round((cy + Math.sin(angle) * r) * 10) / 10,
        type: 'halo_orb',
        star_type: 'halo'
      });
    }
  } else if (starType === 'diamond') {
    const rays = 4;
    const ptsPerRay = numPts / rays;
    for (let r = 0; r < rays; r++) {
      const angle = (Math.PI / 2) * r + Math.PI / 4;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      for (let p = 0; p < ptsPerRay; p++) {
        const dist = 3.0 + (p + 1) * 3.5;
        const origPt = s.pts[r * ptsPerRay + p];
        newMajorPts.push({
          ...origPt,
          bx: Math.round((cx + cosA * dist) * 10) / 10,
          by: Math.round((cy + sinA * dist) * 10) / 10,
          type: 'diamond_ray',
          star_type: 'diamond'
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
        const a = (p * 2.4);
        const d = 3.0 + (p % 4) * 2.5;
        ox = Math.cos(a) * d + (p % 2 === 0 ? companionDist * 0.5 : 0);
        oy = Math.sin(a) * d;
      }
      const origPt = s.pts[p];
      newMajorPts.push({
        ...origPt,
        bx: Math.round((cx + ox) * 10) / 10,
        by: Math.round((cy + oy) * 10) / 10,
        type: (p === 0 ? 'companion' : 'cluster_dust'),
        star_type: 'cluster'
      });
    }
  } else {
    s.pts.forEach(p => newMajorPts.push({ ...p, star_type: 'cross' }));
  }
});

const newMajorBlock = `const MAJOR_STAR_PTS = ${JSON.stringify(newMajorPts)};`;
code = code.slice(0, majorStart) + newMajorBlock + code.slice(majorEnd - 1);

// 2. 描画ループ内のセクション3（多様な星の形態に合わせた発光・アニメーション）の更新
const sec3Start = code.indexOf('// =========================================================\r\n    // 3. クロス大星') !== -1
  ? code.indexOf('// =========================================================\r\n    // 3. クロス大星')
  : code.indexOf('// =========================================================\n    // 3. クロス大星');

const sec4Start = code.indexOf('// =========================================================\r\n    // 4. 少女') !== -1
  ? code.indexOf('// =========================================================\r\n    // 4. 少女')
  : code.indexOf('// =========================================================\n    // 4. 少女');

const newSec3 = `// =========================================================
    // 3. 多様な大星群（六条星・円形ハロー・ダイヤモンド・連星・クロス星）
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
        const pulse = 0.82 + 0.22 * Math.sin(time * p.pulse_speed + p.pulse_phase);
        const flare = Math.pow(Math.max(0, Math.sin(time * (p.pulse_speed * 0.7) + p.pulse_phase)), 3.0);

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

        const finalPulse = (pulse + flare * 0.35) * edgeAlpha;

        if (p.type === 'core') {
          // 星の核（純白のまばゆい輝き）
          item.rgb = [
            Math.min(255, Math.round((245 + flare * 10) * edgeAlpha)),
            Math.min(255, Math.round((250 + flare * 5) * edgeAlpha)),
            Math.min(255, Math.round(255 * edgeAlpha))
          ];
          item.size = (p.base_size + 0.35) * finalPulse;
        } else if (p.type === 'hex_ray') {
          // 六条星光芒（シアンとペールホワイトのエレガントな6条フレア）
          item.rgb = [
            Math.min(255, Math.round((p.rgb[0] * 1.1 + flare * 55) * finalPulse)),
            Math.min(255, Math.round((p.rgb[1] * 1.15 + flare * 45) * finalPulse)),
            Math.min(255, Math.round((p.rgb[2] * 1.2 + flare * 35) * finalPulse))
          ];
          item.size = (p.base_size + 0.25) * finalPulse;
        } else if (p.type === 'halo_orb') {
          // 円形ハロー（柔らかな光の球体ヴェール）
          const haloPulse = 0.75 + 0.25 * Math.sin(time * p.pulse_speed * 0.8 + p.pulse_phase);
          item.rgb = [
            Math.min(255, Math.round((p.rgb[0] * 0.8 + 20) * haloPulse * edgeAlpha)),
            Math.min(255, Math.round((p.rgb[1] * 0.9 + 45) * haloPulse * edgeAlpha)),
            Math.min(255, Math.round((p.rgb[2] * 1.05 + 85) * haloPulse * edgeAlpha))
          ];
          item.size = Math.max(0.7, p.base_size * 0.85 * haloPulse);
        } else if (p.type === 'diamond_ray') {
          // 斜め4条ダイヤモンド星（結晶のようなシャープな輝き）
          item.rgb = [
            Math.min(255, Math.round((p.rgb[0] * 1.15 + flare * 65) * finalPulse)),
            Math.min(255, Math.round((p.rgb[1] * 1.1 + flare * 40) * finalPulse)),
            Math.min(255, Math.round((p.rgb[2] * 1.25 + flare * 50) * finalPulse))
          ];
          item.size = (p.base_size + 0.2) * finalPulse;
        } else if (p.type === 'companion') {
          // 連星の伴星
          item.rgb = [
            Math.min(255, Math.round(230 * edgeAlpha)),
            Math.min(255, Math.round(240 * edgeAlpha)),
            Math.min(255, Math.round(255 * edgeAlpha))
          ];
          item.size = p.base_size * 0.9 * finalPulse;
        } else if (p.type === 'cluster_dust') {
          // 星団の微細星屑
          const dustTwinkle = 0.7 + 0.3 * Math.sin(time * 2.5 + p.bx * 0.1);
          item.rgb = [
            Math.min(255, Math.round((p.rgb[0] * 0.9 + 25) * dustTwinkle * edgeAlpha)),
            Math.min(255, Math.round((p.rgb[1] * 0.95 + 35) * dustTwinkle * edgeAlpha)),
            Math.min(255, Math.round((p.rgb[2] * 1.1 + 60) * dustTwinkle * edgeAlpha))
          ];
          item.size = Math.max(0.6, p.base_size * 0.75 * dustTwinkle);
        } else {
          // クラシック・クロス星（全体のわずか15%のみアクセントとして配置）
          item.rgb = [
            Math.min(255, Math.round((p.rgb[0] * 1.1 + flare * 60) * finalPulse)),
            Math.min(255, Math.round((p.rgb[1] * 1.15 + flare * 50) * finalPulse)),
            Math.min(255, Math.round((p.rgb[2] * 1.2 + flare * 40) * finalPulse))
          ];
          item.size = (p.base_size + 0.25) * finalPulse;
        }
      }
    }

    `;

code = code.slice(0, sec3Start) + newSec3 + code.slice(sec4Start);

fs.writeFileSync('particle/stargazer.js', code, 'utf8');
console.log('Successfully diversified major star shapes (Hex, Halo, Diamond, Cluster, and subtle Cross)!');
