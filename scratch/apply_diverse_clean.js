const fs = require('fs');
let code = fs.readFileSync('particle/stargazer.js', 'utf8');

const majorMatch = code.match(/const MAJOR_STAR_PTS = (\[[\s\S]*?\]);\r?\n/);
if (!majorMatch) {
  console.error('MAJOR_STAR_PTS not found');
  process.exit(1);
}
const major = JSON.parse(majorMatch[1]);

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
  const starType = starTypeAssignment[sIdx] || 'cross';
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

code = code.replace(/const MAJOR_STAR_PTS = \[[\s\S]*?\];\r?\n/, 'const MAJOR_STAR_PTS = ' + JSON.stringify(newMajorPts) + ';\n');

// 描画ループの更新（5種の星の描画）
const oldLoop = code.match(/\/\/ 3\. 大星のドラマチックなクロス光条[\s\S]*?\/\/ 4\.1 少女本体/);
if (oldLoop) {
  const newLoop = `// 3. 多様な大星群の光条・ハロー・星団（六条星、ハロー、ダイヤモンド、連星、クロス星）
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

    // 4.1 少女本体`;
  code = code.replace(oldLoop[0], newLoop);
}

fs.writeFileSync('particle/stargazer.js', code);
console.log('Successfully applied diverse stars to stargazer.js!');
