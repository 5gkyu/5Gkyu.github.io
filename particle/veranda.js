/**
 * veranda.js - Starry Veranda (星屑のテラスで夜更かし)
 * 
 * Halcyonのキャラクターたち（Akari, Fuka, Charlotte, Becky, Dulcie）が
 * 満天の星屑と夜風に包まれたテラスで、思い思いのまったりした時間を過ごす
 * デフォルト用パーティクルアニメーション。
 * 
 * 登場キャラクター & アニメーション:
 * - Akari: テラスの縁で足をぶらぶら + ぷくーっと膨らんで弾ける風船ガム
 * - Fuka: ノートにスケッチ + 膝の上で翼をパタパタさせる白い小鳥
 * - Charlotte: 大切そうに抱えたマグカップ + ふわりと立ち昇る光の湯気
 * - Becky & Dulcie: 並んで夜空を見上げ、星を指差しておしゃべり
 * - 星型ランタン: テラスの端で温かいアンバーの光を放ち、そよ風に揺れる
 * - 天の川 & 蛍火星屑: 空間全体を包む幻想的な夜空の光
 */

(function () {
  'use strict';

  const TOTAL_POINTS = 4200;

  // キャラクター＆テラスのカラーパレット
  const PALETTE = {
    // テラス・背景
    deckBase: [75, 95, 145],         // ウッドデッキの影（ディープインディゴ）
    deckLight: [140, 185, 235],      // ウッドデッキの稜線・手すり（シアンブルー）
    deckGlow: [180, 220, 255],       // 木漏れ星光ハイライト
    lanternGlass: [255, 225, 130],   // 星型ランタンの光（アンバーゴールド）
    lanternCore: [255, 250, 210],    // ランタン中心光（ウォームホワイト）

    // Akari (ローズピンク)
    akariHair: [240, 150, 175],      // 髪色
    akariCap: [227, 106, 140],       // 耳付きベレー帽
    akariCloth: [250, 235, 242],     // トップス
    akariSkin: [255, 230, 220],      // 肌
    akariGum: [255, 115, 170],       // 風船ガム（ネオンピンク）
    akariGumGlow: [255, 220, 240],   // ガムのハイライト

    // Fuka (ミントグリーン)
    fukaHair: [169, 196, 125],       // 髪色
    fukaCap: [140, 175, 100],        // ベレー帽
    fukaSprout: [120, 220, 110],     // 帽子のアホ毛・双葉ピン
    fukaCloth: [235, 245, 230],      // セーター
    fukaSkin: [255, 232, 220],       // 肌
    fukaBook: [245, 250, 240],       // スケッチブック
    fukaBird: [255, 255, 255],       // 膝の上の白い小鳥
    fukaBirdSprout: [130, 230, 120], // 小鳥の頭の双葉

    // Charlotte (ラベンダーパープル)
    charlotteHair: [195, 168, 235],  // ストレートロングヘア
    charlotteRibbon: [183, 148, 218],// 大きなリボン
    charlotteCloth: [240, 235, 250], // 清楚なブラウス
    charlotteSkin: [255, 230, 225],  // 肌
    charlotteMug: [255, 215, 180],   // マグカップ
    charlotteSteam: [225, 205, 255], // 立ち上る湯気粒子

    // Becky (スカイブルー)
    beckyHair: [159, 201, 214],      // ツインテール
    beckyRibbon: [130, 180, 210],    // ヘアリボン
    beckyCloth: [230, 245, 255],     // ニット
    beckySkin: [255, 232, 220],      // 肌

    // Dulcie (コーラルオレンジ)
    dulcieHair: [244, 149, 106],     // ロングヘア
    dulcieHoodie: [255, 175, 135],   // パーカー
    dulcieCloth: [255, 240, 235],    // インナー
    dulcieSkin: [255, 232, 220],      // 肌

    // 共通・夜空
    starDusk: [170, 195, 240],       // 遠景の星屑
    starShine: [255, 255, 255]       // 瞬く星
  };

  // 決定論的擬似乱数
  function pseudoRand(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // 固定出力用バッファ
  const templateBuffer = new Array(TOTAL_POINTS);
  for (let i = 0; i < TOTAL_POINTS; i++) {
    templateBuffer[i] = { bx: 0, by: 0, rgb: [200, 220, 255], size: 2.0 };
  }

  /**
   * 星屑のテラス アニメーション点群生成
   * @param {number} time frameCount * 0.02 相当の時間変数
   */
  function generateVerandaTemplate(time) {
    let pIdx = 0;

    // =========================================================================
    // 1. テラス構造（ウッドデッキの床板、手すり、柵、支柱）：約850点
    // =========================================================================
    const DECK_Y = 110;
    const DECK_X_MIN = -380;
    const DECK_X_MAX = 380;

    // 床板（水平ライン3層：パースペクティブ付き）
    for (let layer = 0; layer < 3; layer++) {
      const ly = DECK_Y + layer * 16;
      const count = 120;
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const lx = DECK_X_MIN + t * (DECK_X_MAX - DECK_X_MIN);
        const col = (layer === 0) ? PALETTE.deckLight : (layer === 1 ? PALETTE.deckBase : PALETTE.deckGlow);
        templateBuffer[pIdx++] = {
          bx: lx,
          by: ly,
          rgb: col,
          size: 2.2 - layer * 0.4
        };
      }
    }

    // 床板の目地（スリット）：規則的な縦線
    for (let sl = -340; sl <= 340; sl += 40) {
      for (let j = 0; j < 5; j++) {
        templateBuffer[pIdx++] = {
          bx: sl + (j * 1.5),
          by: DECK_Y + j * 7,
          rgb: PALETTE.deckBase,
          size: 1.8
        };
      }
    }

    // 手すり（上部レールと格子支柱）：y = 40 〜 110
    const RAIL_Y = 40;
    for (let i = 0; i < 150; i++) {
      const t = i / 149;
      const rx = DECK_X_MIN + t * (DECK_X_MAX - DECK_X_MIN);
      templateBuffer[pIdx++] = {
        bx: rx,
        by: RAIL_Y + Math.sin(rx * 0.015) * 1.5,
        rgb: PALETTE.deckLight,
        size: 2.4
      };
    }

    // 縦の柵（一定間隔の支柱）
    for (let postX = -360; postX <= 360; postX += 30) {
      for (let k = 0; k < 7; k++) {
        const py = RAIL_Y + (k / 6) * (DECK_Y - RAIL_Y);
        templateBuffer[pIdx++] = {
          bx: postX,
          by: py,
          rgb: (k === 0 || k === 6) ? PALETTE.deckLight : PALETTE.deckBase,
          size: 1.8
        };
      }
    }

    // =========================================================================
    // 2. 星型ランタン（テラス左端の支柱から吊り下げ）：約120点
    // =========================================================================
    // そよ風にゆらゆら揺れる（振子運動）
    const lanternSway = Math.sin(time * 1.6) * 7;
    const lanternAnchorX = -320;
    const lanternAnchorY = RAIL_Y - 25;
    const lanternX = lanternAnchorX + lanternSway;
    const lanternY = lanternAnchorY + 45;

    // 吊り紐
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      templateBuffer[pIdx++] = {
        bx: lanternAnchorX + lanternSway * t,
        by: lanternAnchorY + t * 45,
        rgb: PALETTE.deckLight,
        size: 1.6
      };
    }

    // 星型ランタンのフレーム＆ガラス
    const STAR_R = 15;
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2;
      const r = (i % 2 === 0) ? STAR_R : STAR_R * 0.55;
      templateBuffer[pIdx++] = {
        bx: lanternX + Math.cos(angle) * r,
        by: lanternY + Math.sin(angle) * r,
        rgb: PALETTE.lanternGlass,
        size: 2.4
      };
    }
    // ランタン中心の灯火コア（呼吸するようにパルス発光）
    const lanternPulse = 1.0 + Math.sin(time * 3.5) * 0.25;
    for (let i = 0; i < 20; i++) {
      const r = Math.sqrt(pseudoRand(i * 17.1)) * (8 * lanternPulse);
      const theta = pseudoRand(i * 31.4) * Math.PI * 2;
      templateBuffer[pIdx++] = {
        bx: lanternX + Math.cos(theta) * r,
        by: lanternY + Math.sin(theta) * r,
        rgb: (r < 4) ? PALETTE.lanternCore : PALETTE.lanternGlass,
        size: 2.5
      };
    }
    // ランタンから漏れ出る温かい光の粉
    for (let i = 0; i < 25; i++) {
      const pTime = time * 0.8 + i * 0.25;
      const dist = 12 + (pTime % 1.0) * 28;
      const ang = (i * 1.3) + Math.sin(pTime) * 0.4;
      templateBuffer[pIdx++] = {
        bx: lanternX + Math.cos(ang) * dist,
        by: lanternY + Math.sin(ang) * dist + (pTime % 1.0) * 8,
        rgb: PALETTE.lanternGlass,
        size: Math.max(1.0, 2.2 * (1.0 - (pTime % 1.0)))
      };
    }

    // =========================================================================
    // 3. キャラクター1：Akari（左端で足ぶらぶら & 風船ガム）：約680点
    // =========================================================================
    const akariX = -215;
    const akariY = 62; // 座り位置の基準点

    // 上下呼吸
    const akariBreathe = Math.sin(time * 2.0) * 1.2;

    // A. 体・洋服（セーラー風トップス・チョーカー）
    for (let i = 0; i < 90; i++) {
      const u = pseudoRand(i * 11.2);
      const v = pseudoRand(i * 23.4);
      const bx = akariX + (u - 0.5) * 34;
      const by = akariY + akariBreathe + v * 32;
      templateBuffer[pIdx++] = {
        bx: bx,
        by: by,
        rgb: (v > 0.8) ? PALETTE.akariCap : PALETTE.akariCloth,
        size: 2.2
      };
    }

    // B. 頭・輪郭・お顔
    for (let i = 0; i < 80; i++) {
      const ang = (i / 80) * Math.PI * 2;
      const rx = 18 + Math.cos(ang) * 2;
      const ry = 19;
      templateBuffer[pIdx++] = {
        bx: akariX + Math.cos(ang) * rx,
        by: akariY - 20 + akariBreathe + Math.sin(ang) * ry,
        rgb: PALETTE.akariSkin,
        size: 2.0
      };
    }
    // 瞳（大きなハイライト付き瞳）
    templateBuffer[pIdx++] = { bx: akariX - 7, by: akariY - 20 + akariBreathe, rgb: [40, 30, 45], size: 3.2 };
    templateBuffer[pIdx++] = { bx: akariX - 6, by: akariY - 21 + akariBreathe, rgb: [255, 255, 255], size: 1.6 };
    templateBuffer[pIdx++] = { bx: akariX + 7, by: akariY - 20 + akariBreathe, rgb: [40, 30, 45], size: 3.2 };
    templateBuffer[pIdx++] = { bx: akariX + 8, by: akariY - 21 + akariBreathe, rgb: [255, 255, 255], size: 1.6 };
    // ほんのりチーク
    templateBuffer[pIdx++] = { bx: akariX - 11, by: akariY - 15 + akariBreathe, rgb: [255, 160, 180], size: 2.6 };
    templateBuffer[pIdx++] = { bx: akariX + 11, by: akariY - 15 + akariBreathe, rgb: [255, 160, 180], size: 2.6 };

    // C. 耳付きベレー帽（耳の突起とチェック調シルエット）
    for (let i = 0; i < 110; i++) {
      const ang = Math.PI * 0.85 + (i / 110) * Math.PI * 1.3;
      const r = 24;
      const capX = akariX + Math.cos(ang) * r;
      const capY = akariY - 24 + akariBreathe + Math.sin(ang) * 16;
      templateBuffer[pIdx++] = {
        bx: capX,
        by: capY,
        rgb: PALETTE.akariCap,
        size: 2.5
      };
    }
    // ベレー帽の耳（左右の愛らしいケモ耳パーツ）
    for (let side = -1; side <= 1; side += 2) {
      const earBaseX = akariX + side * 14;
      const earBaseY = akariY - 38 + akariBreathe;
      for (let k = 0; k < 18; k++) {
        const t = k / 17;
        templateBuffer[pIdx++] = {
          bx: earBaseX + side * (t * 6),
          by: earBaseY - t * 14,
          rgb: (t < 0.6) ? PALETTE.akariCap : PALETTE.akariSkin,
          size: 2.2
        };
      }
    }

    // D. サイドテール（風にゆらゆら揺れる）
    const ponytailSway = Math.sin(time * 2.3) * 4;
    for (let i = 0; i < 60; i++) {
      const t = i / 59;
      const px = akariX - 22 - t * 16 + ponytailSway * t;
      const py = akariY - 16 + akariBreathe + Math.sin(t * Math.PI) * 10 + t * 24;
      templateBuffer[pIdx++] = {
        bx: px,
        by: py,
        rgb: PALETTE.akariHair,
        size: 2.2 - t * 0.6
      };
    }

    // E. 足ぶらぶらモーション（左右交互にゆらゆら）
    const legSwingLeft = Math.sin(time * 2.2) * 14;
    const legSwingRight = Math.sin(time * 2.2 + Math.PI) * 14;
    // 左足
    for (let k = 0; k < 22; k++) {
      const t = k / 21;
      templateBuffer[pIdx++] = {
        bx: akariX - 6 + (legSwingLeft * t * 0.4),
        by: akariY + 32 + t * 26,
        rgb: (t > 0.8) ? PALETTE.akariCap : PALETTE.akariSkin,
        size: 2.4
      };
    }
    // 右足
    for (let k = 0; k < 22; k++) {
      const t = k / 21;
      templateBuffer[pIdx++] = {
        bx: akariX + 6 + (legSwingRight * t * 0.4),
        by: akariY + 32 + t * 26,
        rgb: (t > 0.8) ? PALETTE.akariCap : PALETTE.akariSkin,
        size: 2.4
      };
    }

    // F. 風船ガム（ぷくーっと膨らんでパチンと弾けるループアニメーション！）
    const gumCycle = (time * 0.7) % (Math.PI * 2);
    let gumRadius = 0;
    let isPopped = false;

    if (gumCycle < Math.PI * 1.5) {
      // 膨らむフェーズ（徐々に大きくなる）
      const progress = gumCycle / (Math.PI * 1.5);
      gumRadius = 3 + Math.pow(progress, 1.4) * 15;
    } else if (gumCycle < Math.PI * 1.7) {
      // 弾けた瞬間（破裂エフェクト）
      isPopped = true;
      gumRadius = 18;
    } else {
      // もぐもぐフェーズ（小さく休止）
      gumRadius = 2.5 + Math.sin(time * 6.0) * 0.8;
    }

    const gumCenterX = akariX + 4;
    const gumCenterY = akariY - 10 + akariBreathe;

    if (!isPopped) {
      // 通常の丸い風船ガム
      for (let i = 0; i < 45; i++) {
        const ang = (i / 45) * Math.PI * 2;
        const r = gumRadius;
        templateBuffer[pIdx++] = {
          bx: gumCenterX + Math.cos(ang) * r,
          by: gumCenterY + Math.sin(ang) * r,
          rgb: (i < 8) ? PALETTE.akariGumGlow : PALETTE.akariGum,
          size: 2.4
        };
      }
      // 中の透明感
      for (let i = 0; i < 20; i++) {
        const r = Math.sqrt(pseudoRand(i * 3.3)) * (gumRadius * 0.75);
        const ang = pseudoRand(i * 7.7) * Math.PI * 2;
        templateBuffer[pIdx++] = {
          bx: gumCenterX + Math.cos(ang) * r,
          by: gumCenterY + Math.sin(ang) * r,
          rgb: PALETTE.akariGum,
          size: 2.0
        };
      }
    } else {
      // 弾けた瞬間の飛散パーティクル
      const popProgress = (gumCycle - Math.PI * 1.5) / (Math.PI * 0.2);
      for (let i = 0; i < 65; i++) {
        const ang = (i / 65) * Math.PI * 2;
        const dist = gumRadius + popProgress * 18 + pseudoRand(i * 13.1) * 8;
        templateBuffer[pIdx++] = {
          bx: gumCenterX + Math.cos(ang) * dist,
          by: gumCenterY + Math.sin(ang) * dist,
          rgb: PALETTE.akariGum,
          size: Math.max(1.0, 2.5 * (1.0 - popProgress))
        };
      }
    }

    // =========================================================================
    // 4. キャラクター2：Fuka（中央左でスケッチ & 膝の上の小鳥）：約720点
    // =========================================================================
    const fukaX = -75;
    const fukaY = 62;
    const fukaBreathe = Math.sin(time * 1.9 + 1.0) * 1.1;

    // A. 体・セーター・リボン
    for (let i = 0; i < 100; i++) {
      const u = pseudoRand(i * 13.5);
      const v = pseudoRand(i * 27.2);
      const bx = fukaX + (u - 0.5) * 36;
      const by = fukaY + fukaBreathe + v * 32;
      templateBuffer[pIdx++] = {
        bx: bx,
        by: by,
        rgb: (v < 0.25 && Math.abs(u - 0.5) < 0.2) ? PALETTE.fukaHair : PALETTE.fukaCloth,
        size: 2.2
      };
    }

    // B. 頭・ボブヘア・お顔
    for (let i = 0; i < 85; i++) {
      const ang = (i / 85) * Math.PI * 2;
      const rx = 18;
      const ry = 19;
      templateBuffer[pIdx++] = {
        bx: fukaX + Math.cos(ang) * rx,
        by: fukaY - 20 + fukaBreathe + Math.sin(ang) * ry,
        rgb: PALETTE.fukaSkin,
        size: 2.0
      };
    }
    // まん丸な瞳（スケッチブックを真剣に見つめる伏し目）
    templateBuffer[pIdx++] = { bx: fukaX - 6, by: fukaY - 18 + fukaBreathe, rgb: [30, 45, 35], size: 3.0 };
    templateBuffer[pIdx++] = { bx: fukaX + 6, by: fukaY - 18 + fukaBreathe, rgb: [30, 45, 35], size: 3.0 };
    // 前髪・ボブヘアの豊かな広がり
    for (let i = 0; i < 70; i++) {
      const ang = Math.PI * 0.8 + (i / 70) * Math.PI * 1.4;
      const hx = fukaX + Math.cos(ang) * 23;
      const hy = fukaY - 18 + fukaBreathe + Math.sin(ang) * 22;
      templateBuffer[pIdx++] = {
        bx: hx,
        by: hy,
        rgb: PALETTE.fukaHair,
        size: 2.3
      };
    }

    // C. ベレー帽 & 頭の双葉ピン（ぴょこぴょこ揺れる）
    for (let i = 0; i < 90; i++) {
      const ang = Math.PI * 0.9 + (i / 90) * Math.PI * 1.2;
      const capX = fukaX + Math.cos(ang) * 26;
      const capY = fukaY - 28 + fukaBreathe + Math.sin(ang) * 16;
      templateBuffer[pIdx++] = {
        bx: capX,
        by: capY,
        rgb: PALETTE.fukaCap,
        size: 2.4
      };
    }
    // 双葉ピン
    const sproutWiggle = Math.sin(time * 3.2) * 3;
    for (let k = 0; k < 15; k++) {
      const t = k / 14;
      templateBuffer[pIdx++] = {
        bx: fukaX + 12 + sproutWiggle * t + Math.sin(t * Math.PI) * 4,
        by: fukaY - 42 + fukaBreathe - t * 10,
        rgb: PALETTE.fukaSprout,
        size: 2.0
      };
    }

    // D. 手元のスケッチブック（開いたノート）
    const bookX = fukaX - 4;
    const bookY = fukaY + 18 + fukaBreathe;
    for (let page = -1; page <= 1; page += 2) {
      for (let i = 0; i < 35; i++) {
        const u = pseudoRand(i * 5.1);
        const v = pseudoRand(i * 9.3);
        templateBuffer[pIdx++] = {
          bx: bookX + page * (4 + u * 14),
          by: bookY + (v - 0.5) * 18,
          rgb: PALETTE.fukaBook,
          size: 1.8
        };
      }
    }
    // ペンを持つ手と、カリカリ動くペン先
    const penWiggle = Math.sin(time * 5.5) * 2;
    for (let k = 0; k < 10; k++) {
      const t = k / 9;
      templateBuffer[pIdx++] = {
        bx: bookX + 6 + penWiggle + t * 6,
        by: bookY - 2 + t * 8,
        rgb: [60, 80, 70],
        size: 1.6
      };
    }

    // E. 膝の上の白い小鳥（ことりマスコット：翼をパタパタ羽ばたかせる！）
    const birdX = fukaX + 22;
    const birdY = fukaY + 20 + fukaBreathe;
    const birdFlapCycle = (time * 1.2) % 6.0;
    const isFlapping = (birdFlapCycle < 1.2);
    const birdWingFlap = isFlapping ? Math.sin(time * 22.0) * 8 : 0;

    // 小鳥の体（ふっくらした白玉のような丸いフォルム）
    for (let i = 0; i < 50; i++) {
      const r = Math.sqrt(pseudoRand(i * 7.1)) * 9;
      const ang = pseudoRand(i * 19.3) * Math.PI * 2;
      templateBuffer[pIdx++] = {
        bx: birdX + Math.cos(ang) * (r * 1.1),
        by: birdY + Math.sin(ang) * r,
        rgb: PALETTE.fukaBird,
        size: 2.2
      };
    }
    // 小鳥のつぶらな瞳＆黄色いくちばし
    templateBuffer[pIdx++] = { bx: birdX + 6, by: birdY - 3, rgb: [30, 30, 30], size: 2.0 };
    templateBuffer[pIdx++] = { bx: birdX + 9, by: birdY - 1, rgb: [255, 200, 50], size: 2.4 };
    // 小鳥の小さな翼（羽ばたき）
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      templateBuffer[pIdx++] = {
        bx: birdX - 3 - t * 8,
        by: birdY - 2 - birdWingFlap * t,
        rgb: PALETTE.fukaBird,
        size: 2.0
      };
    }
    // 小鳥の頭の双葉
    templateBuffer[pIdx++] = { bx: birdX, by: birdY - 11, rgb: PALETTE.fukaBirdSprout, size: 2.0 };
    templateBuffer[pIdx++] = { bx: birdX + 2, by: birdY - 13, rgb: PALETTE.fukaBirdSprout, size: 2.0 };

    // =========================================================================
    // 5. キャラクター3：Charlotte（中央右で温かいマグカップと湯気）：約740点
    // =========================================================================
    const charlotteX = +75;
    const charlotteY = 62;
    const charlotteBreathe = Math.sin(time * 1.8 + 2.0) * 1.1;

    // A. 体・清楚なブラウス・胸元リボン
    for (let i = 0; i < 110; i++) {
      const u = pseudoRand(i * 15.3);
      const v = pseudoRand(i * 31.7);
      const bx = charlotteX + (u - 0.5) * 36;
      const by = charlotteY + charlotteBreathe + v * 34;
      templateBuffer[pIdx++] = {
        bx: bx,
        by: by,
        rgb: (v < 0.3 && Math.abs(u - 0.5) < 0.25) ? PALETTE.charlotteRibbon : PALETTE.charlotteCloth,
        size: 2.2
      };
    }

    // B. 頭・お顔・上品なストレートロングヘア
    for (let i = 0; i < 85; i++) {
      const ang = (i / 85) * Math.PI * 2;
      const rx = 18;
      const ry = 19;
      templateBuffer[pIdx++] = {
        bx: charlotteX + Math.cos(ang) * rx,
        by: charlotteY - 20 + charlotteBreathe + Math.sin(ang) * ry,
        rgb: PALETTE.charlotteSkin,
        size: 2.0
      };
    }
    // 穏やかに目を細める上品な瞳
    templateBuffer[pIdx++] = { bx: charlotteX - 6, by: charlotteY - 20 + charlotteBreathe, rgb: [50, 40, 65], size: 2.8 };
    templateBuffer[pIdx++] = { bx: charlotteX - 5, by: charlotteY - 21 + charlotteBreathe, rgb: [255, 255, 255], size: 1.4 };
    templateBuffer[pIdx++] = { bx: charlotteX + 6, by: charlotteY - 20 + charlotteBreathe, rgb: [50, 40, 65], size: 2.8 };
    templateBuffer[pIdx++] = { bx: charlotteX + 7, by: charlotteY - 21 + charlotteBreathe, rgb: [255, 255, 255], size: 1.4 };

    // ストレートロングヘア（さらさらとなびく長い髪）
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 65; i++) {
        const t = i / 64;
        const hairWave = Math.sin(time * 1.8 + t * 2.0) * (3 * t);
        const hx = charlotteX + side * (16 + t * 8) + hairWave;
        const hy = charlotteY - 18 + charlotteBreathe + t * 58;
        templateBuffer[pIdx++] = {
          bx: hx,
          by: hy,
          rgb: PALETTE.charlotteHair,
          size: 2.3 - t * 0.5
        };
      }
    }
    // 頭の大きなリボン
    for (let side = -1; side <= 1; side += 2) {
      for (let k = 0; k < 18; k++) {
        const ang = (k / 18) * Math.PI * 2;
        templateBuffer[pIdx++] = {
          bx: charlotteX + side * 14 + Math.cos(ang) * 6,
          by: charlotteY - 36 + charlotteBreathe + Math.sin(ang) * 5,
          rgb: PALETTE.charlotteRibbon,
          size: 2.2
        };
      }
    }

    // C. 大切そうに両手で抱えた温かいマグカップ
    const mugX = charlotteX;
    const mugY = charlotteY + 16 + charlotteBreathe;
    for (let i = 0; i < 35; i++) {
      const u = (i % 7) / 6;
      const v = Math.floor(i / 7) / 4;
      templateBuffer[pIdx++] = {
        bx: mugX + (u - 0.5) * 16,
        by: mugY + (v - 0.5) * 14,
        rgb: PALETTE.charlotteMug,
        size: 2.2
      };
    }
    // カップの持ち手
    for (let a = -1.2; a <= 1.2; a += 0.4) {
      templateBuffer[pIdx++] = {
        bx: mugX + 9 + Math.cos(a) * 4,
        by: mugY + Math.sin(a) * 5,
        rgb: PALETTE.charlotteMug,
        size: 1.8
      };
    }

    // D. マグカップから立ち昇る光の湯気（螺旋を描いて夜空へ昇るアニメーション）
    const STEAM_POINTS = 60;
    for (let i = 0; i < STEAM_POINTS; i++) {
      const sProgress = ((time * 0.6 + i / STEAM_POINTS) % 1.0);
      const steamY = mugY - 8 - sProgress * 55;
      const steamWobble = Math.sin(time * 2.5 + sProgress * 6.0) * (6 * sProgress);
      const steamAlpha = Math.sin(sProgress * Math.PI);
      templateBuffer[pIdx++] = {
        bx: mugX + steamWobble + (pseudoRand(i * 12.3) - 0.5) * 4,
        by: steamY,
        rgb: PALETTE.charlotteSteam,
        size: Math.max(1.0, 2.6 * steamAlpha)
      };
    }

    // =========================================================================
    // 6. キャラクター4 & 5：Becky & Dulcie（右側で星空を見上げるペア）：約950点
    // =========================================================================
    // --- Becky (スカイブルー、ツインテール、夜空を指差す) ---
    const beckyX = +210;
    const beckyY = 62;
    const beckyBreathe = Math.sin(time * 2.1 + 0.5) * 1.1;

    // 体・ニットセーター
    for (let i = 0; i < 90; i++) {
      const u = pseudoRand(i * 14.1);
      const v = pseudoRand(i * 28.5);
      templateBuffer[pIdx++] = {
        bx: beckyX + (u - 0.5) * 32,
        by: beckyY + beckyBreathe + v * 32,
        rgb: PALETTE.beckyCloth,
        size: 2.2
      };
    }

    // 頭・お顔・笑顔
    for (let i = 0; i < 80; i++) {
      const ang = (i / 80) * Math.PI * 2;
      templateBuffer[pIdx++] = {
        bx: beckyX + Math.cos(ang) * 18,
        by: beckyY - 20 + beckyBreathe + Math.sin(ang) * 19,
        rgb: PALETTE.beckySkin,
        size: 2.0
      };
    }
    // 上を見上げる嬉しそうな瞳
    templateBuffer[pIdx++] = { bx: beckyX - 6, by: beckyY - 22 + beckyBreathe, rgb: [30, 40, 50], size: 3.0 };
    templateBuffer[pIdx++] = { bx: beckyX + 6, by: beckyY - 22 + beckyBreathe, rgb: [30, 40, 50], size: 3.0 };
    // にっこり口元
    templateBuffer[pIdx++] = { bx: beckyX, by: beckyY - 14 + beckyBreathe, rgb: [230, 110, 120], size: 2.4 };

    // ツインテール（左右でぴょこぴょこ弾む）
    for (let side = -1; side <= 1; side += 2) {
      const tailBounce = Math.sin(time * 3.0 + side) * 3;
      for (let i = 0; i < 45; i++) {
        const t = i / 44;
        const tx = beckyX + side * (18 + t * 14) + tailBounce * (side * 0.5);
        const ty = beckyY - 22 + beckyBreathe + t * 38;
        templateBuffer[pIdx++] = {
          bx: tx,
          by: ty,
          rgb: PALETTE.beckyHair,
          size: 2.2 - t * 0.4
        };
      }
      // リボン
      templateBuffer[pIdx++] = { bx: beckyX + side * 18, by: beckyY - 22 + beckyBreathe, rgb: PALETTE.beckyRibbon, size: 3.0 };
    }

    // 指差し腕（夜空の星を指差すモーション）
    const armWave = Math.sin(time * 1.5) * 4;
    for (let k = 0; k < 22; k++) {
      const t = k / 21;
      templateBuffer[pIdx++] = {
        bx: beckyX + 12 + t * 20,
        by: beckyY + 8 + beckyBreathe - t * 30 + armWave * t,
        rgb: PALETTE.beckyCloth,
        size: 2.2
      };
    }
    // 指先ハイライト（星を指す先端）
    templateBuffer[pIdx++] = {
      bx: beckyX + 33,
      by: beckyY - 23 + beckyBreathe + armWave,
      rgb: PALETTE.beckySkin,
      size: 2.6
    };

    // --- Dulcie (コーラルオレンジ、ロングヘア、パーカー) ---
    const dulcieX = +280;
    const dulcieY = 62;
    const dulcieBreathe = Math.sin(time * 1.9 + 1.8) * 1.1;

    // 体・パーカー
    for (let i = 0; i < 95; i++) {
      const u = pseudoRand(i * 16.7);
      const v = pseudoRand(i * 33.2);
      templateBuffer[pIdx++] = {
        bx: dulcieX + (u - 0.5) * 34,
        by: dulcieY + dulcieBreathe + v * 32,
        rgb: PALETTE.dulcieHoodie,
        size: 2.2
      };
    }

    // 頭・お顔・ウインク
    for (let i = 0; i < 80; i++) {
      const ang = (i / 80) * Math.PI * 2;
      templateBuffer[pIdx++] = {
        bx: dulcieX + Math.cos(ang) * 18,
        by: dulcieY - 20 + dulcieBreathe + Math.sin(ang) * 19,
        rgb: PALETTE.dulcieSkin,
        size: 2.0
      };
    }
    // 左目パッチリ、右目ウインク（Dulcieの特徴）
    templateBuffer[pIdx++] = { bx: dulcieX - 6, by: dulcieY - 20 + dulcieBreathe, rgb: [50, 35, 30], size: 3.2 };
    templateBuffer[pIdx++] = { bx: dulcieX - 5, by: dulcieY - 21 + dulcieBreathe, rgb: [255, 255, 255], size: 1.5 };
    // ウインクライン
    templateBuffer[pIdx++] = { bx: dulcieX + 5, by: dulcieY - 20 + dulcieBreathe, rgb: [50, 35, 30], size: 2.4 };
    templateBuffer[pIdx++] = { bx: dulcieX + 7, by: dulcieY - 21 + dulcieBreathe, rgb: [50, 35, 30], size: 2.4 };
    // 明るい笑顔
    templateBuffer[pIdx++] = { bx: dulcieX, by: dulcieY - 14 + dulcieBreathe, rgb: [240, 100, 100], size: 2.5 };

    // サラサラの長い髪（風になびく）
    for (let i = 0; i < 75; i++) {
      const t = i / 74;
      const hairWind = Math.sin(time * 2.0 + t * 2.5) * (4 * t);
      templateBuffer[pIdx++] = {
        bx: dulcieX + 16 + t * 14 + hairWind,
        by: dulcieY - 18 + dulcieBreathe + t * 50,
        rgb: PALETTE.dulcieHair,
        size: 2.3 - t * 0.4
      };
    }

    // 寄り添うポーズ：Beckyの方を向いて楽しそうに頷くモーション
    const nod = Math.sin(time * 3.5) * 1.5;
    for (let k = 0; k < 18; k++) {
      const t = k / 17;
      templateBuffer[pIdx++] = {
        bx: dulcieX - 10 - t * 12,
        by: dulcieY + 12 + dulcieBreathe + nod,
        rgb: PALETTE.dulcieHoodie,
        size: 2.2
      };
    }

    // =========================================================================
    // 7. 夜空・天の川・そよ風に舞う星屑（Stardust Veil）：残りの粒子すべて
    // =========================================================================
    const remainingCount = TOTAL_POINTS - pIdx;
    for (let i = 0; i < remainingCount; i++) {
      const seed = i * 19.73;
      const tDrift = time * 0.08 + pseudoRand(seed * 2.1);
      
      // 天の川の大きなゆるやかな帯（水平〜斜めに横断）
      const sx = -420 + ((i / remainingCount) * 840 + Math.sin(tDrift * 3.0) * 20);
      const sy = -200 + Math.sin(sx * 0.006 + time * 0.5) * 45 + (pseudoRand(seed * 4.3) - 0.5) * 120;

      // 瞬き
      const twinkle = Math.sin(time * 3.0 + seed);
      const isBright = twinkle > 0.8;
      const starCol = isBright ? PALETTE.starShine : (i % 2 === 0 ? PALETTE.starDusk : PALETTE.deckGlow);

      templateBuffer[pIdx++] = {
        bx: sx,
        by: sy,
        rgb: starCol,
        size: isBright ? 2.5 : (1.2 + Math.abs(twinkle) * 0.8)
      };
    }

    return templateBuffer;
  }

  // グローバル公開
  window.generateVerandaTemplate = generateVerandaTemplate;
})();
