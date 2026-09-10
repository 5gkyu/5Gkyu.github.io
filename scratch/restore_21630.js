const fs = require('fs');

let code = fs.readFileSync('particle/stargazer.js', 'utf8');

const targetStartStr = `    // =========================================================
    // 1. 星雲・暗夜背景（微細な輝度呼吸のみ、座標は静止）
    // =========================================================`;

const targetEndStr = `    // =========================================================
    // 4. 少女（外側に向かって滑らかにドットが減るグラデーション境界）
    // =========================================================`;

const startIdx = code.indexOf(targetStartStr);
const endIdx = code.indexOf(targetEndStr);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

const replacement = `    // =========================================================
    // 1. 壮大な天の川銀河 ＆ 星雲光芒（Milky Way Galaxy & Cosmic Nebulae）
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
        // 天の川の斜め主軸（左上から右下へ夜空を雄大に横断する銀河の河）
        const galaxyDist = Math.abs(2.0 * p.bx - 7.0 * p.by - 1260) / 7.28;

        // 星間ガスの有機的なうねりと呼吸
        const flowTime = time * 0.4;
        const gasNoise = Math.sin(p.bx * 0.015 + p.by * 0.02 + flowTime) * 0.6
                       + Math.cos(p.bx * 0.03 - p.by * 0.015 - flowTime * 0.8) * 0.4;
        const nebulaPulse = 0.88 + 0.12 * Math.sin(time * 0.7 + p.pulse_phase);

        let r = p.rgb[0] * nebulaPulse;
        let g = p.rgb[1] * nebulaPulse;
        let b = p.rgb[2] * nebulaPulse;
        let sz = p.base_size * nebulaPulse;

        // 天の川の光芒（中心軸 d=0 付近でまばゆく、d=125 へ向けて美しく広がる）
        if (galaxyDist < 125) {
          const normDist = galaxyDist / 125.0;
          const coreGlow = Math.pow(1.0 - normDist, 1.8) * (0.85 + 0.30 * gasNoise);

          const coreR = 40 + coreGlow * 135 + Math.sin(p.bx * 0.01) * 25;
          const coreG = 75 + coreGlow * 155 + Math.cos(p.by * 0.015) * 30;
          const coreB = 145 + coreGlow * 110;

          r = Math.max(r, coreR * coreGlow);
          g = Math.max(g, coreG * coreGlow);
          b = Math.max(b, coreB * coreGlow);
          sz = Math.max(sz, (p.base_size + 0.35) * (0.9 + coreGlow * 0.4));
        }

        // 宇宙の散光星雲（左上のエメラルドシアン星雲 ＆ 右上の深宇宙マゼンタ星雲）
        const leftNebulaDist = Math.hypot(p.bx - (-260), p.by - (-220));
        if (leftNebulaDist < 150) {
          const lGlow = Math.pow(1.0 - leftNebulaDist / 150.0, 1.7) * 0.75 * (0.8 + 0.2 * gasNoise);
          r = Math.max(r, 20 * lGlow);
          g = Math.max(g, 120 * lGlow);
          b = Math.max(b, 175 * lGlow);
          sz = Math.max(sz, p.base_size * (1.0 + lGlow * 0.3));
        }

        const rightNebulaDist = Math.hypot(p.bx - (280), p.by - (-240));
        if (rightNebulaDist < 140) {
          const rGlow = Math.pow(1.0 - rightNebulaDist / 140.0, 1.7) * 0.70 * (0.8 + 0.2 * gasNoise);
          r = Math.max(r, 110 * rGlow);
          g = Math.max(g, 40 * rGlow);
          b = Math.max(b, 160 * rGlow);
          sz = Math.max(sz, p.base_size * (1.0 + rGlow * 0.3));
        }

        item.rgb = [
          Math.min(255, Math.round(r)),
          Math.min(255, Math.round(g)),
          Math.min(255, Math.round(b))
        ];
        item.size = sz;
      }
    }

    // =========================================================
    // 2. 夜空の星々（多色スペクトルの瞬きとダイヤモンドダスト）
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

        // 星ごとの固有カラー（青白、黄金、サファイア、ルビー、ダイヤモンド）
        const colorType = i % 5;
        const twinkle = Math.sin(time * p.twinkle_speed + p.twinkle_phase);
        const bright = 0.65 + 0.35 * Math.pow(Math.max(0, twinkle), 1.5);
        const flash = (twinkle > 0.85) ? (twinkle - 0.85) / 0.15 : 0;

        let baseR = p.rgb[0], baseG = p.rgb[1], baseB = p.rgb[2];

        if (colorType === 0) {
          baseR = 190; baseG = 225; baseB = 255;
        } else if (colorType === 1) {
          baseR = 255; baseG = 215; baseB = 140;
        } else if (colorType === 2) {
          baseR = 255; baseG = 175; baseB = 120;
        } else if (colorType === 3) {
          baseR = 140; baseG = 220; baseB = 255;
        } else {
          baseR = 245; baseG = 250; baseB = 255;
        }

        item.rgb = [
          Math.min(255, Math.round((baseR * bright + flash * 45))),
          Math.min(255, Math.round((baseG * bright + flash * 45))),
          Math.min(255, Math.round((baseB * bright + flash * 35)))
        ];
        item.size = (p.base_size + 0.2) * (0.85 + 0.35 * bright + flash * 0.6);
      }
    }

    // =========================================================
    // 3. クロス大星（核と光条のドラマチックな呼吸とスパークル）
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
        const pulse = 0.80 + 0.25 * Math.sin(time * p.pulse_speed + p.pulse_phase);
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
          item.rgb = [
            Math.min(255, Math.round((240 + flare * 15) * edgeAlpha)),
            Math.min(255, Math.round((245 + flare * 10) * edgeAlpha)),
            Math.min(255, Math.round(255 * edgeAlpha))
          ];
          item.size = (p.base_size + 0.4) * finalPulse;
        } else {
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

if (startIdx !== -1 && endIdx !== -1) {
  code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
  fs.writeFileSync('particle/stargazer.js', code, 'utf8');
  console.log('Successfully upgraded sky with Milky Way and rich nebulae!');
} else {
  console.error('Could not find start or end index');
}
