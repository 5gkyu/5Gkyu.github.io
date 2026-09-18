/**
 * cyber_jellyfish_max.js
 * 巨大ネオン・クラゲ（4,000点フルスケール / 宙返り＆高速ダッシュ＆生体発光）
 */

'use strict';

(function() {
  // 1. 粒子総数を最大規模の4,000点に厳密に固定（迫力と密度の向上）
  const TOTAL_POINTS = 4000;
  const basePoints = new Array(TOTAL_POINTS);
  const roles = new Array(TOTAL_POINTS);

  // HSLからRGBへの変換ヘルパー
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  // 迫力を増すための3D透視投影（カメラを少し近づけてパースを強調）
  function project(x, y, z) {
    const depth = 900 / (900 + z * 0.8); 
    const px = x * depth;
    const py = (y * 0.9 - z * 0.2) * depth;
    return { px, py, depth };
  }

  // イージング関数群
  function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOutExpo(x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
  function easeInOutQuad(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  // 2. 初期化：巨大化した各パーツの役割と配置を計算
  for (let i = 0; i < TOTAL_POINTS; i++) {
    if (i < 2000) { 
      // 傘（Dome）: 2000点
      const idx = i + 0.5;
      const rRatio = Math.acos(1 - 1 * (idx / 2000)) / (Math.PI / 2);
      const phi = rRatio * (Math.PI / 2);
      const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
      
      const R = 140; // 傘を大幅に巨大化
      const ox = R * Math.sin(phi) * Math.cos(theta);
      const oy = -R * Math.cos(phi); 
      const oz = R * Math.sin(phi) * Math.sin(theta);
      
      roles[i] = { type: 'dome', ox, oy, oz, rRatio, R }; 

    } else if (i < 2200) { 
      // 中心のフリル（Oral Arms）: 200点（ゆったりとした心地よい密度）
      const tIdx = i - 2000;
      const numArms = 5; // 5本のふんわりしたフリル
      const armNum = tIdx % numArms;
      const tPos = Math.floor(tIdx / numArms) / (200 / numArms); 
      
      const angle = (armNum / numArms) * Math.PI * 2 + tPos * Math.PI * 0.6; // 螺旋状のねじれ
      const spread = 20 + tPos * 38;
      const ox = Math.cos(angle) * spread;
      const oz = Math.sin(angle) * spread;
      const oy = tPos * 200; 
      
      roles[i] = { type: 'oral_arm', ox, oy, oz, armNum, tPos };

    } else { 
      // 外側の長い触手（Tentacles）: 1800点
      const tIdx = i - 2200;
      const numTentacles = 45; // 45本の触手
      const tNum = tIdx % numTentacles;
      const tPos = Math.floor(tIdx / numTentacles) / (1800 / numTentacles); 
      
      const angle = (tNum / numTentacles) * Math.PI * 2;
      const rootR = 125;
      const ox = Math.cos(angle) * rootR;
      const oz = Math.sin(angle) * rootR;
      const oy = tPos * 350; // 画面下部まで長く伸びる
      
      roles[i] = { type: 'tentacle', ox, oy, oz, tNum, tPos };
    }
    
    basePoints[i] = { bx: 0, by: 0, rgb: [0, 0, 0], size: 2.0, layer: 'main' };
  }

  // 毎フレームの動的計算
  function generateCustomTemplate(time = 0) {
    const points = new Array(TOTAL_POINTS);
    
    // 遊び心のアクション：16秒のドラマチックなサイクル
    const cycle = time % 16.0;
    
    // アクション1: 宙返り（バク宙）
    let rollAngle = 0;
    if (cycle > 6.0 && cycle < 7.5) {
      const p = (cycle - 6.0) / 1.5;
      rollAngle = easeInOutCubic(p) * Math.PI * 2;
    }

    // アクション2: 傘をすぼめて急上昇ダッシュ ＆ ネオンカラーシフト
    let dashActive = 0; // 0: 通常, 1: ダッシュ中（すぼまる）
    let dashY = 0;
    let colorShift = 0; // 色相シフトの強さ
    if (cycle > 10.0 && cycle < 13.0) {
      if (cycle < 10.5) {
         // 沈み込んで力を溜める
         const p = (cycle - 10.0) / 0.5;
         dashActive = p;
         dashY = easeInOutQuad(p) * 40; 
      } else if (cycle < 11.0) {
         // 一気に急上昇
         const p = (cycle - 10.5) / 0.5;
         dashActive = 1 - p * 0.2; // 少し開きながら進む
         dashY = 40 - easeOutExpo(p) * 240; 
         colorShift = Math.sin(p * Math.PI); // ダッシュ時に色が鮮やかに変化
      } else {
         // ゆっくりと元の位置へ漂い戻る
         const p = (cycle - 11.0) / 2.0;
         dashActive = 0.8 * (1 - easeInOutQuad(p));
         dashY = -200 * (1 - easeInOutQuad(p)); 
         colorShift = 1 - p; 
      }
    }

    // ベースの拍動と浮遊
    const swimTime = time * 2.0;
    const swimPulse = Math.sin(swimTime);
    
    // ダッシュ中は傘をすぼめる（X/Zを縮め、Yを伸ばす）
    const baseScaleXZ = 1.0 - swimPulse * 0.1;
    const baseScaleY = 1.0 + Math.max(0, swimPulse) * 0.12;
    const scaleXZ = baseScaleXZ * (1.0 - dashActive * 0.45);
    const scaleY = baseScaleY * (1.0 + dashActive * 0.3);
    
    const globalY = Math.sin(time * 1.2) * 20 - 40 + dashY;

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const r = roles[i];
      let rgb, sz;
      let finalX = 0, finalY = 0, finalZ = 0;

      if (r.type === 'dome') {
        finalX = r.ox * scaleXZ;
        finalZ = r.oz * scaleXZ;
        finalY = r.oy * scaleY;
        
        // ダッシュ中は空気抵抗ですぼまるため、フリルの波打ちを抑える
        if (r.rRatio > 0.8) {
          const ruffle = Math.sin(time * 3.5 + Math.atan2(finalZ, finalX) * 8) * (5 * (1 - dashActive));
          finalX += (finalX / r.R) * ruffle;
          finalZ += (finalZ / r.R) * ruffle;
        }

        const zNorm = finalZ / r.R;
        // ダッシュ時にシアンからディープピンクへ色がシフト
        let h = 190 + r.rRatio * 45 + colorShift * 110; 
        let l = 0.6 - zNorm * 0.15 + colorShift * 0.15;
        rgb = hslToRgb(h, 0.9, l);
        sz = 2.8;
        
      } else if (r.type === 'oral_arm') {
        const rootX = r.ox * scaleXZ;
        const rootZ = r.oz * scaleXZ;
        
        const frill = Math.sin(time * 4 - r.tPos * 15) * (8 * (1 - dashActive));
        const waveX = Math.sin(swimTime - r.tPos * 5) * (25 * r.tPos) * (1 - dashActive * 0.8);
        const waveZ = Math.cos(swimTime * 1.1 - r.tPos * 4.5) * (25 * r.tPos) * (1 - dashActive * 0.8);
        
        finalX = rootX + waveX + Math.cos(r.armNum * Math.PI / 2) * frill;
        finalZ = rootZ + waveZ + Math.sin(r.armNum * Math.PI / 2) * frill;
        
        const lift = Math.max(0, swimPulse) * 30 * r.tPos;
        // ダッシュ時は慣性でフリルが下へ引っ張られる
        finalY = r.oy - lift - 5 + dashActive * r.tPos * 60; 
        
        const zNorm = finalZ / 140;
        let h = 220 + r.tPos * 50 + colorShift * 100;
        let l = 0.7 - zNorm * 0.1 + colorShift * 0.15;
        rgb = hslToRgb(h, 0.8, l);
        sz = 2.4;

      } else if (r.type === 'tentacle') { 
        const rootX = r.ox * scaleXZ;
        const rootZ = r.oz * scaleXZ;
        
        const waveX = Math.sin(swimTime - r.tPos * 6.5 + r.tNum) * (50 * r.tPos) * (1 - dashActive * 0.8);
        const waveZ = Math.cos(swimTime * 0.9 - r.tPos * 5.5 + r.tNum) * (35 * r.tPos) * (1 - dashActive * 0.8);
        
        finalX = rootX + waveX;
        finalZ = rootZ + waveZ;
        
        const lift = Math.max(0, swimPulse) * 80 * r.tPos;
        // ダッシュ時は触手が真っ直ぐ下へ長く伸びる
        finalY = r.oy - lift + dashActive * r.tPos * 140;

        const zNorm = finalZ / 140;
        let h = 210 + r.tPos * 110 + colorShift * 90;
        let l = 0.65 - zNorm * 0.1 + colorShift * 0.2;
        sz = 1.8;
        
        // アクション3: 生体発光（バイオルミネセンス）
        // 触手の根元から先端へ向かって、光のパルスが滑らかに駆け抜ける
        const bioPhase = Math.sin(time * 4.0 - r.tPos * 12.0 + r.tNum * 0.7);
        if (bioPhase > 0.7) {
           const glow = (bioPhase - 0.7) * 1.5; // 0.0 〜 0.45
           l += glow;
           sz += glow * 4.0; // 光る部分は太くなる
           rgb = hslToRgb(h, 1.0, l); 
        } else {
           rgb = hslToRgb(h, 0.95, l); 
        }
      }

      // バク宙の回転行列適用
      if (rollAngle > 0) {
        const pivotY = 50; 
        const dy = finalY - pivotY;
        const dz = finalZ;

        const rotY = dy * Math.cos(rollAngle) - dz * Math.sin(rollAngle);
        const rotZ = dy * Math.sin(rollAngle) + dz * Math.cos(rollAngle);

        finalY = rotY + pivotY;
        finalZ = rotZ;
      }

      // 最終透視投影
      const proj = project(finalX, finalY + globalY, finalZ);
      points[i] = { 
        bx: proj.px, 
        by: proj.py, 
        rgb, 
        size: sz * proj.depth, 
        layer: 'main' 
      };
    }
    
    return points;
  }

  // 外部公開設定
  if (typeof window !== 'undefined') {
    window.customModelTmpl = basePoints;
    window.generateCustomTemplate = generateCustomTemplate;
    window.jellyfishModelTmpl = basePoints;
    window.generateJellyfishTemplate = generateCustomTemplate;
  }
})();