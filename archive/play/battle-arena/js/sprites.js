/**
 * キャラクター・エフェクト用プロシージャルスプライト生成モジュール
 * HTML5 Canvasを用いて、外部画像なしで高品質な板ポリ用テクスチャを瞬時に生成する。
 * （※絵文字は一切使用せず、ベクター描画で洗練されたキャラクターグラフィックを作成）
 */

export class SpriteGenerator {
    constructor() {
        this.cache = new Map();
    }

    /**
     * 指定勢力・状態のキャラクタースプライトCanvas（テクスチャ用）を取得
     */
    getCharacterCanvas(factionId, isChild = false) {
        const key = `${factionId}_${isChild ? 'child' : 'normal'}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const isLarge = factionId === 'dragon' || factionId === 'giant';
        const size = isLarge ? 256 : 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 各キャラクターごとの詳細描画
        switch (factionId) {
            case 'human':
                this.drawHuman(ctx, size);
                break;
            case 'dog':
                this.drawDog(ctx, size);
                break;
            case 'zombie':
                this.drawZombie(ctx, size);
                break;
            case 'robot':
                this.drawRobot(ctx, size);
                break;
            case 'slime':
                this.drawSlime(ctx, size, isChild);
                break;
            case 'ghost':
                this.drawGhost(ctx, size);
                break;
            case 'dragon':
                this.drawDragon(ctx, size);
                break;
            case 'ninja':
                this.drawNinja(ctx, size);
                break;
            // 新15勢力
            case 'rat':
                this.drawRat(ctx, size);
                break;
            case 'bee':
                this.drawBee(ctx, size);
                break;
            case 'mushroom':
                this.drawMushroom(ctx, size);
                break;
            case 'giant':
                this.drawGiant(ctx, size);
                break;
            case 'reaper':
                this.drawReaper(ctx, size);
                break;
            case 'samurai':
                this.drawSamurai(ctx, size);
                break;
            case 'golem':
                this.drawGolem(ctx, size, isChild);
                break;
            case 'bomber':
                this.drawBomber(ctx, size);
                break;
            case 'clown':
                this.drawClown(ctx, size);
                break;
            case 'mimic':
                this.drawMimic(ctx, size);
                break;
            case 'yukionna':
                this.drawYukionna(ctx, size);
                break;
            case 'vampire':
                this.drawVampire(ctx, size);
                break;
            case 'cat':
                this.drawCat(ctx, size);
                break;
            case 'raiju':
                this.drawRaiju(ctx, size);
                break;
            case 'cattle':
                this.drawCattle(ctx, size);
                break;
            default:
                this.drawDefault(ctx, size);
        }

        this.cache.set(key, canvas);
        return canvas;
    }

    /**
     * 人間（重装歩兵・ナイト）の描画
     */
    drawHuman(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.55;

        // マント
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy - 10);
        ctx.lineTo(cx - 36, cy + 38);
        ctx.lineTo(cx + 36, cy + 38);
        ctx.lineTo(cx + 24, cy - 10);
        ctx.closePath();
        ctx.fill();

        // 体（シルバーアーマー）
        const armorGrad = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
        armorGrad.addColorStop(0, '#7f8c8d');
        armorGrad.addColorStop(0.5, '#bdc3c7');
        armorGrad.addColorStop(1, '#95a5a6');
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 18, cy - 12, 36, 38, 6);
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 胸の紋章（ゴールド）
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(cx, cy + 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // 兜（ヘルメット）
        const helmGrad = ctx.createLinearGradient(cx - 22, 0, cx + 22, 0);
        helmGrad.addColorStop(0, '#95a5a6');
        helmGrad.addColorStop(0.5, '#ecf0f1');
        helmGrad.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = helmGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 26, 20, Math.PI, 0, false);
        ctx.lineTo(cx + 18, cy - 12);
        ctx.lineTo(cx - 18, cy - 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 兜のバイザー（スリット）
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(cx - 14, cy - 26, 28, 5);

        // 兜のトサカ羽飾り
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 46);
        ctx.quadraticCurveTo(cx, cy - 40, cx + 18, cy - 24);
        ctx.lineTo(cx, cy - 26);
        ctx.lineTo(cx - 6, cy - 24);
        ctx.closePath();
        ctx.fill();

        // 盾（左手側）
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(cx - 28, cy - 6);
        ctx.lineTo(cx - 14, cy - 6);
        ctx.lineTo(cx - 14, cy + 18);
        ctx.lineTo(cx - 21, cy + 28);
        ctx.lineTo(cx - 28, cy + 18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 剣（右手側）
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(cx + 26, cy - 38);
        ctx.lineTo(cx + 30, cy - 34);
        ctx.lineTo(cx + 22, cy + 12);
        ctx.lineTo(cx + 18, cy + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d35400';
        ctx.fillRect(cx + 14, cy + 6, 14, 4); // ツバ

        ctx.restore();
    }

    /**
     * 犬（俊敏な戦闘犬）の描画
     */
    drawDog(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.55;

        // 胴体
        const bodyGrad = ctx.createLinearGradient(cx - 30, cy, cx + 30, cy);
        bodyGrad.addColorStop(0, '#d35400');
        bodyGrad.addColorStop(0.5, '#e67e22');
        bodyGrad.addColorStop(1, '#f39c12');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, 32, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ba4a00';
        ctx.lineWidth = 3;
        ctx.stroke();

        // しっぽ（ピンと上がった尾）
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(cx - 28, cy + 2);
        ctx.quadraticCurveTo(cx - 40, cy - 14, cx - 34, cy - 26);
        ctx.stroke();

        // 四肢
        ctx.fillStyle = '#d35400';
        ctx.fillRect(cx - 22, cy + 18, 9, 20);
        ctx.fillRect(cx - 8, cy + 20, 9, 18);
        ctx.fillRect(cx + 8, cy + 20, 9, 18);
        ctx.fillRect(cx + 18, cy + 18, 9, 20);

        // 頭部
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(cx + 22, cy - 12, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 尖った耳
        ctx.fillStyle = '#ba4a00';
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 24);
        ctx.lineTo(cx + 18, cy - 42);
        ctx.lineTo(cx + 28, cy - 26);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 26, cy - 22);
        ctx.lineTo(cx + 34, cy - 38);
        ctx.lineTo(cx + 36, cy - 18);
        ctx.closePath();
        ctx.fill();

        // マズル・口・牙
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.ellipse(cx + 34, cy - 6, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // 鼻
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(cx + 43, cy - 8, 4, 0, Math.PI * 2);
        ctx.fill();

        // 鋭い目
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx + 26, cy - 16, 5, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(cx + 27, cy - 16, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 鋭い牙
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx + 33, cy - 2);
        ctx.lineTo(cx + 36, cy + 5);
        ctx.lineTo(cx + 39, cy - 2);
        ctx.closePath();
        ctx.fill();

        // 首輪（スタッズ付き）
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(cx + 12, cy - 2, 10, 8);
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(cx + 17, cy + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * ゾンビ（アンデッド）の描画
     */
    drawZombie(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.55;

        // ボロボロの衣服
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy - 6);
        ctx.lineTo(cx + 20, cy - 6);
        ctx.lineTo(cx + 18, cy + 30);
        ctx.lineTo(cx + 10, cy + 25);
        ctx.lineTo(cx + 2, cy + 32);
        ctx.lineTo(cx - 8, cy + 26);
        ctx.lineTo(cx - 18, cy + 30);
        ctx.closePath();
        ctx.fill();

        // 腕（前に突き出したゾンビポーズ）
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(cx + 14, cy - 2, 26, 10);
        ctx.fillRect(cx - 12, cy + 4, 24, 9);

        // 腐敗した手と爪
        ctx.fillStyle = '#1e8449';
        ctx.beginPath();
        ctx.arc(cx + 42, cy + 3, 5, 0, Math.PI * 2);
        ctx.fill();

        // 頭部（緑の肌）
        const skinGrad = ctx.createRadialGradient(cx, cy - 24, 4, cx, cy - 24, 22);
        skinGrad.addColorStop(0, '#2ecc71');
        skinGrad.addColorStop(1, '#229954');
        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 24, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#196f3d';
        ctx.lineWidth = 3;
        ctx.stroke();

        // ボサボサの髪
        ctx.fillStyle = '#1b2631';
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy - 30);
        ctx.lineTo(cx - 14, cy - 44);
        ctx.lineTo(cx - 4, cy - 36);
        ctx.lineTo(cx + 6, cy - 46);
        ctx.lineTo(cx + 16, cy - 38);
        ctx.lineTo(cx + 20, cy - 28);
        ctx.closePath();
        ctx.fill();

        // 赤く光る濁った目
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 24, 5, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy - 24, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 24, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy - 24, 3, 0, Math.PI * 2);
        ctx.fill();

        // 裂けた口
        ctx.strokeStyle = '#78281f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 12);
        ctx.lineTo(cx + 12, cy - 14);
        ctx.stroke();
        // 縫い目・ステッチ
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 15); ctx.lineTo(cx - 6, cy - 9);
        ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy - 10);
        ctx.moveTo(cx + 6, cy - 17); ctx.lineTo(cx + 6, cy - 11);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * ロボ（サイバーメカ）の描画
     */
    drawRobot(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // 肩の排気管
        ctx.fillStyle = '#34495e';
        ctx.fillRect(cx - 32, cy - 28, 8, 18);
        ctx.fillRect(cx + 24, cy - 28, 8, 18);

        // 重厚なボディ
        const mechaGrad = ctx.createLinearGradient(cx - 26, 0, cx + 26, 0);
        mechaGrad.addColorStop(0, '#576574');
        mechaGrad.addColorStop(0.5, '#8395a7');
        mechaGrad.addColorStop(1, '#576574');
        ctx.fillStyle = mechaGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 26, cy - 8, 52, 42, 6);
        ctx.fill();
        ctx.strokeStyle = '#222f3e';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // 装甲プレートリベット
        ctx.fillStyle = '#c8d6e5';
        [-20, 20].forEach(px => {
            [cy - 2, cy + 28].forEach(py => {
                ctx.beginPath();
                ctx.arc(cx + px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // 胸のエネルギーコア（シアン発光）
        ctx.fillStyle = '#00d2d3';
        ctx.shadowColor = '#00cec9';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 頭部（角張ったヘルメット）
        ctx.fillStyle = '#576574';
        ctx.beginPath();
        ctx.roundRect(cx - 20, cy - 38, 40, 28, 4);
        ctx.fill();
        ctx.stroke();

        // アンテナ
        ctx.strokeStyle = '#8395a7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 38);
        ctx.lineTo(cx, cy - 50);
        ctx.stroke();
        ctx.fillStyle = '#ff9f43';
        ctx.beginPath();
        ctx.arc(cx, cy - 51, 4, 0, Math.PI * 2);
        ctx.fill();

        // 単眼バイザー（光るサイバーアイ）
        ctx.fillStyle = '#10ac84';
        ctx.fillRect(cx - 16, cy - 28, 32, 9);
        ctx.fillStyle = '#00cec9';
        ctx.shadowColor = '#00cec9';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy - 23.5, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // アーム
        ctx.fillStyle = '#222f3e';
        ctx.fillRect(cx - 36, cy + 2, 12, 24);
        ctx.fillRect(cx + 24, cy + 2, 12, 24);

        ctx.restore();
    }

    /**
     * スライム（ゼリー状・ぷるぷる）の描画
     */
    drawSlime(ctx, s, isChild = false) {
        ctx.save();
        const cx = s * 0.5;
        const cy = isChild ? s * 0.6 : s * 0.55;
        const scale = isChild ? 0.75 : 1.0;

        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // スライムのボディ（ティアドロップ型・ぷるぷるドーム）
        const slimeGrad = ctx.createRadialGradient(-6, -10, 6, 0, 0, 36);
        slimeGrad.addColorStop(0, '#d6a2e8');
        slimeGrad.addColorStop(0.5, '#9b59b6');
        slimeGrad.addColorStop(1, '#6c3483');
        ctx.fillStyle = slimeGrad;

        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.bezierCurveTo(24, -36, 38, -6, 36, 18);
        ctx.bezierCurveTo(34, 32, -34, 32, -36, 18);
        ctx.bezierCurveTo(-38, -6, -24, -36, 0, -38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#512e5f';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 表面のツヤ・光沢ハイライト
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(-14, -18, 9, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-6, -24, 3, 0, Math.PI * 2);
        ctx.fill();

        // 大きな瞳
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-12, 2, 7, 9, 0, 0, Math.PI * 2);
        ctx.ellipse(12, 2, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.ellipse(-11, 3, 4, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(11, 3, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 瞳のハイライト
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-13, 0, 2.5, 0, Math.PI * 2);
        ctx.arc(9, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 口
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 10, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 幽霊（漂うゴースト）の描画
     */
    drawGhost(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.5;

        // ゴーストの浮遊オーラ
        const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 48);
        aura.addColorStop(0, 'rgba(116, 185, 255, 0.45)');
        aura.addColorStop(1, 'rgba(116, 185, 255, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, 48, 0, Math.PI * 2);
        ctx.fill();

        // 霊体ボディ
        const ghostGrad = ctx.createLinearGradient(cx, cy - 36, cx, cy + 36);
        ghostGrad.addColorStop(0, '#ffffff');
        ghostGrad.addColorStop(0.6, '#a0c4ff');
        ghostGrad.addColorStop(1, 'rgba(116, 185, 255, 0.2)');
        ctx.fillStyle = ghostGrad;

        ctx.beginPath();
        ctx.arc(cx, cy - 14, 24, Math.PI, 0, false);
        // ひらひらした下部
        ctx.bezierCurveTo(cx + 26, cy + 18, cx + 22, cy + 34, cx + 18, cy + 38);
        ctx.quadraticCurveTo(cx + 10, cy + 28, cx + 2, cy + 38);
        ctx.quadraticCurveTo(cx - 6, cy + 28, cx - 14, cy + 38);
        ctx.bezierCurveTo(cx - 20, cy + 32, cx - 26, cy + 18, cx - 24, cy - 14);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(74, 144, 226, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 冷たく妖しい瞳（深青）
        ctx.fillStyle = '#0984e3';
        ctx.shadowColor = '#74b9ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx - 9, cy - 12, 5, 0, Math.PI * 2);
        ctx.arc(cx + 9, cy - 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 瞳の光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 13, 2, 0, Math.PI * 2);
        ctx.arc(cx + 10, cy - 13, 2, 0, Math.PI * 2);
        ctx.fill();

        // ほのかな微笑み/開いた口
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * ドラゴン（圧倒的巨大モンスター 256x256）の描画
     */
    drawDragon(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // 巨大な翼（左右）
        const wingGrad = ctx.createLinearGradient(cx - 90, 0, cx + 90, 0);
        wingGrad.addColorStop(0, '#922b21');
        wingGrad.addColorStop(0.5, '#c0392b');
        wingGrad.addColorStop(1, '#922b21');

        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = '#641e16';
        ctx.lineWidth = 4;

        // 左翼
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy - 10);
        ctx.lineTo(cx - 100, cy - 70);
        ctx.quadraticCurveTo(cx - 70, cy - 20, cx - 90, cy + 20);
        ctx.quadraticCurveTo(cx - 50, cy + 10, cx - 60, cy + 40);
        ctx.quadraticCurveTo(cx - 30, cy + 20, cx - 20, cy + 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 右翼
        ctx.beginPath();
        ctx.moveTo(cx + 24, cy - 10);
        ctx.lineTo(cx + 100, cy - 70);
        ctx.quadraticCurveTo(cx + 70, cy - 20, cx + 90, cy + 20);
        ctx.quadraticCurveTo(cx + 50, cy + 10, cx + 60, cy + 40);
        ctx.quadraticCurveTo(cx + 30, cy + 20, cx + 20, cy + 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 翼の骨格筋
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy - 10); ctx.lineTo(cx - 96, cy - 66);
        ctx.moveTo(cx + 24, cy - 10); ctx.lineTo(cx + 96, cy - 66);
        ctx.stroke();

        // 頑強な胴体
        const bodyGrad = ctx.createRadialGradient(cx, cy + 10, 10, cx, cy + 10, 48);
        bodyGrad.addColorStop(0, '#e74c3c');
        bodyGrad.addColorStop(0.7, '#c0392b');
        bodyGrad.addColorStop(1, '#78281f');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 14, 38, 46, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#511b15';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 腹部の鱗プレート（ゴールド〜オレンジ）
        ctx.fillStyle = '#f39c12';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.ellipse(cx, cy - 4 + i * 14, 20 - i * 2, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 頭部・首
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 36, 28, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 巨大な角（左右）
        ctx.fillStyle = '#17202a';
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - 50);
        ctx.quadraticCurveTo(cx - 40, cy - 75, cx - 64, cy - 85);
        ctx.quadraticCurveTo(cx - 36, cy - 60, cx - 8, cy - 54);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 16, cy - 50);
        ctx.quadraticCurveTo(cx + 40, cy - 75, cx + 64, cy - 85);
        ctx.quadraticCurveTo(cx + 36, cy - 60, cx + 8, cy - 54);
        ctx.closePath();
        ctx.fill();

        // 獰猛な黄金の瞳
        ctx.fillStyle = '#f1c40f';
        ctx.shadowColor = '#e67e22';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(cx - 14, cy - 38, 7, 9, -0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 14, cy - 38, 7, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 縦長の瞳孔
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx - 15, cy - 44, 3, 12);
        ctx.fillRect(cx + 13, cy - 44, 3, 12);

        // 口元と牙・炎の息
        ctx.fillStyle = '#2c0b07';
        ctx.beginPath();
        ctx.arc(cx, cy - 22, 14, 0.1, Math.PI - 0.1);
        ctx.closePath();
        ctx.fill();

        // 白い鋭い牙
        ctx.fillStyle = '#ffffff';
        [-8, 0, 8].forEach(ox => {
            ctx.beginPath();
            ctx.moveTo(cx + ox - 3, cy - 22);
            ctx.lineTo(cx + ox, cy - 14);
            ctx.lineTo(cx + ox + 3, cy - 22);
            ctx.closePath();
            ctx.fill();
        });

        // 口から溢れる炎のオーラ
        const flame = ctx.createRadialGradient(cx, cy - 16, 2, cx, cy - 16, 16);
        flame.addColorStop(0, '#f1c40f');
        flame.addColorStop(0.6, '#e67e22');
        flame.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.arc(cx, cy - 16, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 忍者（シャドウアサシン）の描画
     */
    drawNinja(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.55;

        // 背中の忍者刀
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 28, cy - 34);
        ctx.lineTo(cx + 28, cy + 28);
        ctx.stroke();
        ctx.fillStyle = '#d35400';
        ctx.fillRect(cx - 32, cy - 40, 8, 8); // 柄

        // 漆黒の忍び装束
        const outfitGrad = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
        outfitGrad.addColorStop(0, '#1e272e');
        outfitGrad.addColorStop(0.5, '#2f3640');
        outfitGrad.addColorStop(1, '#1e272e');
        ctx.fillStyle = outfitGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 18, cy - 10, 36, 36, 6);
        ctx.fill();
        ctx.strokeStyle = '#10ac84'; // エメラルドグリーンのライン
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 帯（翡翠グリーン）
        ctx.fillStyle = '#10ac84';
        ctx.fillRect(cx - 18, cy + 12, 36, 6);

        // 頭部・覆面
        ctx.fillStyle = '#2f3640';
        ctx.beginPath();
        ctx.arc(cx, cy - 24, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // なびくハチマキ
        ctx.fillStyle = '#10ac84';
        ctx.fillRect(cx - 16, cy - 32, 32, 5);
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - 32);
        ctx.quadraticCurveTo(cx - 30, cy - 36, cx - 38, cy - 26);
        ctx.lineTo(cx - 36, cy - 22);
        ctx.quadraticCurveTo(cx - 28, cy - 30, cx - 16, cy - 27);
        ctx.closePath();
        ctx.fill();

        // 目元のスリット（覆面の隙間）
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(cx - 12, cy - 26, 24, 8);

        // 鋭く細められた瞳
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx - 9, cy - 23, 5, 2.5);
        ctx.fillRect(cx + 4, cy - 23, 5, 2.5);

        // 手裏剣（前方に構える）
        ctx.save();
        ctx.translate(cx + 22, cy);
        this.drawShurikenShape(ctx, 11);
        ctx.restore();

        ctx.restore();
    }

    /**
     * 手裏剣の形状描画
     */
    drawShurikenShape(ctx, r) {
        ctx.fillStyle = '#dcdde1';
        ctx.strokeStyle = '#2f3640';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const xTip = Math.cos(angle) * r;
            const yTip = Math.sin(angle) * r;
            const xInner = Math.cos(angle + Math.PI / 4) * (r * 0.35);
            const yInner = Math.sin(angle + Math.PI / 4) * (r * 0.35);

            if (i === 0) ctx.moveTo(xTip, yTip);
            else ctx.lineTo(xTip, yTip);
            ctx.lineTo(xInner, yInner);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2f3640';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * ネズミ（rat）の描画
     */
    drawRat(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.58;

        // しっぽ (細長いピンクのうねり曲線)
        ctx.strokeStyle = '#e056fd';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 10);
        ctx.quadraticCurveTo(cx - 36, cy + 18, cx - 38, cy - 6);
        ctx.stroke();

        // 胴体 (グレーブラウンの楕円)
        const bodyGrad = ctx.createRadialGradient(cx + 2, cy - 2, 4, cx, cy, 26);
        bodyGrad.addColorStop(0, '#95a5a6');
        bodyGrad.addColorStop(1, '#535c68');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 20, 15, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // 頭部
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy - 4, 13, 10, 0.25, 0, Math.PI * 2);
        ctx.fill();

        // 大きな耳 (外側グレー、内側ピンク)
        ctx.fillStyle = '#535c68';
        ctx.beginPath();
        ctx.arc(cx + 10, cy - 18, 9, 0, Math.PI * 2);
        ctx.arc(cx + 2, cy - 16, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffbe76';
        ctx.beginPath();
        ctx.arc(cx + 10, cy - 18, 6, 0, Math.PI * 2);
        ctx.arc(cx + 2, cy - 16, 5, 0, Math.PI * 2);
        ctx.fill();

        // 赤く光る目
        ctx.fillStyle = '#eb4d4b';
        ctx.beginPath();
        ctx.arc(cx + 19, cy - 7, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 20, cy - 8, 1, 0, Math.PI * 2);
        ctx.fill();

        // 鼻先と鋭い前歯
        ctx.fillStyle = '#ffbe76';
        ctx.beginPath();
        ctx.arc(cx + 26, cy - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 24, cy, 2, 4);
        ctx.fillRect(cx + 22, cy, 2, 4);

        // ヒゲ
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + 22, cy - 2);
        ctx.lineTo(cx + 34, cy - 7);
        ctx.moveTo(cx + 22, cy);
        ctx.lineTo(cx + 34, cy + 3);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * ハチ（bee）の描画
     */
    drawBee(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.55;

        // 半透明シアンの羽
        ctx.fillStyle = 'rgba(129, 236, 236, 0.7)';
        ctx.strokeStyle = '#00cec9';
        ctx.lineWidth = 1.5;
        // 左上羽
        ctx.beginPath();
        ctx.ellipse(cx - 8, cy - 24, 15, 8, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 右上羽
        ctx.beginPath();
        ctx.ellipse(cx + 8, cy - 24, 15, 8, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 腹部 (黄色と黒のストライプ)
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 黒縞ライン
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(cx - 16, cy - 10, 32, 6);
        ctx.fillRect(cx - 17, cy + 2, 34, 6);

        // 尾部の毒針
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 20);
        ctx.lineTo(cx + 4, cy + 20);
        ctx.lineTo(cx, cy + 32);
        ctx.closePath();
        ctx.fill();

        // 頭部
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(cx, cy - 18, 11, 0, Math.PI * 2);
        ctx.fill();

        // 複眼 (光沢ブラック)
        ctx.fillStyle = '#0984e3';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 19, 4, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 19, 4, 0, Math.PI * 2);
        ctx.fill();

        // 触角2本
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 27);
        ctx.lineTo(cx - 10, cy - 36);
        ctx.moveTo(cx + 4, cy - 27);
        ctx.lineTo(cx + 10, cy - 36);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * キノコ（mushroom）の描画
     */
    drawMushroom(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.55;

        // 胞子オーラ (紫の微粒子)
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const dist = 32 + (i % 2) * 8;
            ctx.fillStyle = 'rgba(162, 155, 254, 0.6)';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * dist, cy - 10 + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // 柄（胴体）
        const stemGrad = ctx.createLinearGradient(cx - 15, 0, cx + 15, 0);
        stemGrad.addColorStop(0, '#dfe6e9');
        stemGrad.addColorStop(0.5, '#ffffff');
        stemGrad.addColorStop(1, '#b2bec3');
        ctx.fillStyle = stemGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 16, cy - 6, 32, 34, 8);
        ctx.fill();
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 2;
        ctx.stroke();

        // つぶらな黒目とチーク
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(cx - 7, cy + 8, 3, 0, Math.PI * 2);
        ctx.arc(cx + 7, cy + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.arc(cx - 11, cy + 13, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 11, cy + 13, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 傘（赤の半球ドーム）
        const capGrad = ctx.createRadialGradient(cx, cy - 24, 6, cx, cy - 10, 36);
        capGrad.addColorStop(0, '#ff7675');
        capGrad.addColorStop(0.7, '#d63031');
        capGrad.addColorStop(1, '#9b111e');
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 34, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#632024';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 傘の白い水玉模様
        ctx.fillStyle = '#ffffff';
        const dots = [
            [cx, cy - 28, 6.5],
            [cx - 18, cy - 18, 5],
            [cx + 18, cy - 18, 5],
            [cx - 8, cy - 12, 4],
            [cx + 8, cy - 12, 4]
        ];
        dots.forEach(([x, y, r]) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    /**
     * 巨人（giant）の描画 (256x256)
     */
    drawGiant(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.52;

        // 棍棒（肩の後ろから突き出す太いトゲ丸太）
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.moveTo(cx + 28, cy - 80);
        ctx.lineTo(cx + 46, cy - 74);
        ctx.lineTo(cx + 20, cy + 30);
        ctx.lineTo(cx + 6, cy + 24);
        ctx.closePath();
        ctx.fill();
        // 棍棒のトゲ
        ctx.fillStyle = '#d7ccc8';
        ctx.beginPath();
        ctx.moveTo(cx + 46, cy - 70);
        ctx.lineTo(cx + 56, cy - 68);
        ctx.lineTo(cx + 42, cy - 58);
        ctx.closePath();
        ctx.fill();

        // 巨人の胴体 (がっしりした筋肉)
        const skinGrad = ctx.createLinearGradient(cx - 40, 0, cx + 40, 0);
        skinGrad.addColorStop(0, '#c77844');
        skinGrad.addColorStop(0.5, '#e09867');
        skinGrad.addColorStop(1, '#a65829');
        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 38, cy - 30, 76, 75, 16);
        ctx.fill();
        ctx.strokeStyle = '#5d2b0e';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 大胸筋・腹筋の陰影ライン
        ctx.strokeStyle = 'rgba(93, 43, 14, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy - 6);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 24, cy - 6);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + 32);
        ctx.stroke();

        // 毛皮の腰巻き
        ctx.fillStyle = '#d35400';
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy + 38);
        ctx.lineTo(cx + 40, cy + 38);
        ctx.lineTo(cx + 34, cy + 68);
        ctx.lineTo(cx + 12, cy + 62);
        ctx.lineTo(cx, cy + 70);
        ctx.lineTo(cx - 18, cy + 62);
        ctx.lineTo(cx - 34, cy + 68);
        ctx.closePath();
        ctx.fill();

        // 頭部
        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 50, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5d2b0e';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // 猛々しい髪と髭
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(cx, cy - 58, 28, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        // 顎髭
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - 40);
        ctx.lineTo(cx, cy - 24);
        ctx.lineTo(cx + 16, cy - 40);
        ctx.closePath();
        ctx.fill();

        // 険しい目と眉
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(cx - 9, cy - 50, 4, 0, Math.PI * 2);
        ctx.arc(cx + 9, cy - 50, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 死神（reaper）の描画
     */
    drawReaper(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.52;

        // 漆黒のローブ（裾がボロボロ）
        const robeGrad = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0);
        robeGrad.addColorStop(0, '#130f40');
        robeGrad.addColorStop(0.5, '#2f3542');
        robeGrad.addColorStop(1, '#0c0b1e');
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 36);
        ctx.lineTo(cx + 28, cy + 34);
        ctx.lineTo(cx + 16, cy + 42);
        ctx.lineTo(cx, cy + 36);
        ctx.lineTo(cx - 16, cy + 42);
        ctx.lineTo(cx - 28, cy + 34);
        ctx.closePath();
        ctx.fill();

        // 大鎌（巨大な白銀の三日月刃）
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy + 36);
        ctx.lineTo(cx - 18, cy - 46);
        ctx.stroke();

        // 鎌の刃先
        const scytheBlade = ctx.createLinearGradient(cx - 36, cy - 58, cx + 20, cy - 30);
        scytheBlade.addColorStop(0, '#dfe4ea');
        scytheBlade.addColorStop(0.5, '#70a1ff');
        scytheBlade.addColorStop(1, '#2f3542');
        ctx.fillStyle = scytheBlade;
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy - 46);
        ctx.quadraticCurveTo(cx - 44, cy - 52, cx - 36, cy - 20);
        ctx.quadraticCurveTo(cx - 30, cy - 38, cx - 18, cy - 46);
        ctx.closePath();
        ctx.fill();

        // フード
        ctx.fillStyle = '#1e1b29';
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 18, Math.PI, 0, false);
        ctx.lineTo(cx + 16, cy - 6);
        ctx.lineTo(cx - 16, cy - 6);
        ctx.closePath();
        ctx.fill();

        // フードの奥の髑髏
        ctx.fillStyle = '#0a0911';
        ctx.beginPath();
        ctx.arc(cx, cy - 17, 12, 0, Math.PI * 2);
        ctx.fill();

        // ドクロの顔（白骨）
        ctx.fillStyle = '#f1f2f6';
        ctx.beginPath();
        ctx.arc(cx, cy - 18, 9, 0, Math.PI * 2);
        ctx.fill();

        // 青白く光る眼窩
        ctx.fillStyle = '#70a1ff';
        ctx.beginPath();
        ctx.arc(cx - 3.5, cy - 19, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 3.5, cy - 19, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * サムライ（samurai）の描画
     */
    drawSamurai(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // 和装陣羽織（藍色＋白の袴）
        ctx.fillStyle = '#1e3799';
        ctx.beginPath();
        ctx.roundRect(cx - 20, cy - 12, 40, 26, 4);
        ctx.fill();

        // 袴
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy + 14);
        ctx.lineTo(cx + 18, cy + 14);
        ctx.lineTo(cx + 22, cy + 38);
        ctx.lineTo(cx - 22, cy + 38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 帯（赤）
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(cx - 20, cy + 10, 40, 5);

        // 日本刀（抜刀した鋭い白刃）
        const bladeGrad = ctx.createLinearGradient(cx + 12, cy - 36, cx + 32, cy + 12);
        bladeGrad.addColorStop(0, '#ffffff');
        bladeGrad.addColorStop(0.5, '#dcdde1');
        bladeGrad.addColorStop(1, '#718093');
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(cx + 30, cy - 42);
        ctx.lineTo(cx + 34, cy - 38);
        ctx.lineTo(cx + 16, cy + 14);
        ctx.lineTo(cx + 12, cy + 12);
        ctx.closePath();
        ctx.fill();

        // 金の鍔（つば）
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.ellipse(cx + 14, cy + 12, 5, 2.5, -0.6, 0, Math.PI * 2);
        ctx.fill();

        // 頭部と侍の髷（チョンマゲ）
        ctx.fillStyle = '#fed330';
        ctx.beginPath();
        ctx.arc(cx, cy - 24, 13, 0, Math.PI * 2);
        ctx.fill();

        // 黒髪と髷
        ctx.fillStyle = '#1e272e';
        ctx.beginPath();
        ctx.arc(cx, cy - 28, 13, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        // チョンマゲ結び
        ctx.fillRect(cx - 3, cy - 44, 6, 12);

        // 凛々しい目
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(cx - 7, cy - 25, 4, 2);
        ctx.fillRect(cx + 3, cy - 25, 4, 2);

        ctx.restore();
    }

    /**
     * ゴーレム（golem）の描画
     */
    drawGolem(ctx, s, isChild = false) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // ひび割れた角ばった巨石の胴体
        const rockGrad = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0);
        rockGrad.addColorStop(0, '#57606f');
        rockGrad.addColorStop(0.5, '#747d8c');
        rockGrad.addColorStop(1, '#2f3542');
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 24, cy - 18, 48, 46, 8);
        ctx.fill();
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 岩のひび割れライン
        ctx.strokeStyle = '#2ed573';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 10);
        ctx.lineTo(cx - 2, cy + 4);
        ctx.lineTo(cx - 8, cy + 18);
        ctx.stroke();

        // コケのアクセント
        ctx.fillStyle = '#2ed573';
        ctx.beginPath();
        ctx.arc(cx + 14, cy - 16, 5, 0, Math.PI * 2);
        ctx.arc(cx - 16, cy + 18, 4, 0, Math.PI * 2);
        ctx.fill();

        // 頭部（角ばった石ブロック）
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 16, cy - 38, 32, 22, 6);
        ctx.fill();
        ctx.stroke();

        // ルーン発光の青い瞳
        ctx.fillStyle = '#00d2d3';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 28, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy - 28, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 両肩の巨大岩石アーマー
        ctx.fillStyle = '#57606f';
        ctx.beginPath();
        ctx.arc(cx - 28, cy - 10, 10, 0, Math.PI * 2);
        ctx.arc(cx + 28, cy - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 爆弾魔（bomber）の描画
     */
    drawBomber(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.55;

        // 体（赤い服）
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.roundRect(cx - 14, cy - 8, 28, 32, 6);
        ctx.fill();

        // 抱えた特大球体爆弾 (黒光り)
        const bombGrad = ctx.createRadialGradient(cx - 2, cy + 10, 3, cx, cy + 12, 20);
        bombGrad.addColorStop(0, '#636e72');
        bombGrad.addColorStop(0.7, '#2d3436');
        bombGrad.addColorStop(1, '#000000');
        ctx.fillStyle = bombGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + 12, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 導火線と火花スパーク
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5);
        ctx.quadraticCurveTo(cx + 8, cy - 12, cx + 6, cy - 18);
        ctx.stroke();

        // 火花
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 19, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 19, 2, 0, Math.PI * 2);
        ctx.fill();

        // 頭部とゴーグル
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 12, 0, Math.PI * 2);
        ctx.fill();

        // 金色ゴーグル
        ctx.fillStyle = '#d35400';
        ctx.fillRect(cx - 12, cy - 24, 24, 6);
        ctx.fillStyle = '#00d2d3';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 21, 4, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 21, 4, 0, Math.PI * 2);
        ctx.fill();

        // 狂気のニヤリ口
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy - 16, 5, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * ピエロ（clown）の描画
     */
    drawClown(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // カラフルな服（紫と黄）
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(cx - 16, cy, 16, 32);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(cx, cy, 16, 32);

        // 大きなフリル襟（白）
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 20, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 白塗りの顔
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy - 18, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 赤いスポンジ鼻
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx, cy - 18, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // トランプダイヤのメイク目
        ctx.fillStyle = '#3498db';
        ctx.fillRect(cx - 7, cy - 24, 3, 5);
        ctx.fillRect(cx + 4, cy - 24, 3, 5);

        // ピエロの三角帽子
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 30);
        ctx.lineTo(cx, cy - 48);
        ctx.lineTo(cx + 12, cy - 30);
        ctx.closePath();
        ctx.fill();
        // 帽子のポンポン
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(cx, cy - 48, 4, 0, Math.PI * 2);
        ctx.fill();

        // 風船（左上に浮かぶ）
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(cx - 26, cy - 34, 9, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy - 22);
        ctx.lineTo(cx - 16, cy + 6);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * ミミック（mimic）の描画
     */
    drawMimic(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.56;

        // 宝箱の下部 (木目ブラウン)
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.roundRect(cx - 24, cy - 2, 48, 28, 4);
        ctx.fill();
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 金の金具・バンド
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(cx - 22, cy - 2, 6, 28);
        ctx.fillRect(cx + 16, cy - 2, 6, 28);

        // ガバッと開いた蓋（斜め上）
        ctx.save();
        ctx.translate(cx - 24, cy - 2);
        ctx.rotate(-0.5);
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(0, -18, 48, 18);
        ctx.strokeRect(0, -18, 48, 18);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(4, -18, 6, 18);
        ctx.fillRect(38, -18, 6, 18);
        ctx.restore();

        // 口内の闇
        ctx.fillStyle = '#1e0c1b';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 6, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 鋭い牙
        ctx.fillStyle = '#ecf0f1';
        for (let i = -14; i <= 14; i += 7) {
            ctx.beginPath();
            ctx.moveTo(cx + i - 2, cy - 2);
            ctx.lineTo(cx + i + 2, cy - 2);
            ctx.lineTo(cx + i, cy - 10);
            ctx.closePath();
            ctx.fill();
        }

        // 飛び出す紫の舌
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 4);
        ctx.quadraticCurveTo(cx + 4, cy + 18, cx + 18, cy + 8);
        ctx.quadraticCurveTo(cx + 6, cy + 6, cx + 4, cy - 4);
        ctx.closePath();
        ctx.fill();

        // 怪しく光る赤い目玉
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 10, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 雪女（yukionna）の描画
     */
    drawYukionna(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // 優美な純白着物（裾は水色グラデ）
        const kimonoGrad = ctx.createLinearGradient(0, cy - 20, 0, cy + 38);
        kimonoGrad.addColorStop(0, '#ffffff');
        kimonoGrad.addColorStop(0.7, '#ffffff');
        kimonoGrad.addColorStop(1, '#81ecec');
        ctx.fillStyle = kimonoGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 14);
        ctx.lineTo(cx + 18, cy + 38);
        ctx.lineTo(cx - 18, cy + 38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 水色の帯
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(cx - 10, cy + 4, 20, 6);

        // 長い艶やかな黒髪
        ctx.fillStyle = '#1e272e';
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 22);
        ctx.lineTo(cx - 16, cy + 32);
        ctx.lineTo(cx + 16, cy + 32);
        ctx.lineTo(cx + 14, cy - 22);
        ctx.closePath();
        ctx.fill();

        // 白磁の顔
        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        ctx.arc(cx, cy - 22, 11, 0, Math.PI * 2);
        ctx.fill();

        // 冷たく青い澄んだ瞳
        ctx.fillStyle = '#00cec9';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 22, 2.2, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 22, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 舞い散る雪の結晶オーラ
        ctx.strokeStyle = 'rgba(129, 236, 236, 0.8)';
        ctx.lineWidth = 1.5;
        const flakes = [[cx - 24, cy - 10], [cx + 22, cy - 16], [cx + 20, cy + 18]];
        flakes.forEach(([fx, fy]) => {
            ctx.beginPath();
            ctx.moveTo(fx - 4, fy);
            ctx.lineTo(fx + 4, fy);
            ctx.moveTo(fx, fy - 4);
            ctx.lineTo(fx, fy + 4);
            ctx.stroke();
        });

        ctx.restore();
    }

    /**
     * 吸血鬼（vampire）の描画
     */
    drawVampire(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // 立ち襟マント（外側漆黒、内側ワインレッド）
        ctx.fillStyle = '#800020'; // ワインレッド
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy - 32);
        ctx.lineTo(cx + 24, cy - 32);
        ctx.lineTo(cx + 28, cy + 36);
        ctx.lineTo(cx - 28, cy + 36);
        ctx.closePath();
        ctx.fill();

        // 黒のタキシード服
        ctx.fillStyle = '#1e1b29';
        ctx.beginPath();
        ctx.roundRect(cx - 14, cy - 8, 28, 38, 4);
        ctx.fill();

        // 白いフリルシャツ
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 8);
        ctx.lineTo(cx + 6, cy - 8);
        ctx.lineTo(cx, cy + 10);
        ctx.closePath();
        ctx.fill();

        // 頭部 (蒼白な肌)
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 12, 0, Math.PI * 2);
        ctx.fill();

        // オールバックの黒髪
        ctx.fillStyle = '#1e272e';
        ctx.beginPath();
        ctx.arc(cx, cy - 24, 12, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        // 妖しい赤い瞳
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 20, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 20, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 鋭い吸血牙
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 3, cy - 14, 1.5, 3.5);
        ctx.fillRect(cx + 1.5, cy - 14, 1.5, 3.5);

        ctx.restore();
    }

    /**
     * 猫（cat）の描画
     */
    drawCat(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.58;

        // 長く上向きにカールしたしっぽ
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy + 6);
        ctx.quadraticCurveTo(cx - 28, cy + 8, cx - 24, cy - 16);
        ctx.stroke();

        // 胴体 (茶トラ/オレンジの楕円)
        const catGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 22);
        catGrad.addColorStop(0, '#f39c12');
        catGrad.addColorStop(1, '#d35400');
        ctx.fillStyle = catGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // 白い胸当て
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx + 4, cy + 4, 8, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 頭部
        ctx.fillStyle = catGrad;
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 10, 13, 0, Math.PI * 2);
        ctx.fill();

        // ピンと立った三角の耳
        ctx.fillStyle = '#d35400';
        ctx.beginPath();
        ctx.moveTo(cx + 2, cy - 18);
        ctx.lineTo(cx + 6, cy - 30);
        ctx.lineTo(cx + 14, cy - 20);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 20);
        ctx.lineTo(cx + 20, cy - 30);
        ctx.lineTo(cx + 22, cy - 16);
        ctx.closePath();
        ctx.fill();

        // 耳の内側ピンク
        ctx.fillStyle = '#ffbe76';
        ctx.beginPath();
        ctx.moveTo(cx + 5, cy - 20);
        ctx.lineTo(cx + 7, cy - 26);
        ctx.lineTo(cx + 12, cy - 20);
        ctx.closePath();
        ctx.fill();

        // エメラルドグリーンのアーモンドアイ
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.ellipse(cx + 7, cy - 11, 3.2, 4.5, 0.2, 0, Math.PI * 2);
        ctx.ellipse(cx + 16, cy - 11, 3.2, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(cx + 6.5, cy - 13, 1.2, 5);
        ctx.fillRect(cx + 15.5, cy - 13, 1.2, 5);

        // ヒゲ
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 18, cy - 7);
        ctx.lineTo(cx + 30, cy - 10);
        ctx.moveTo(cx + 18, cy - 5);
        ctx.lineTo(cx + 30, cy - 3);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 雷獣（raiju）の描画
     */
    drawRaiju(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // 電撃プラズマオーラ
        ctx.strokeStyle = '#00d2d3';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy - 18);
        ctx.lineTo(cx - 18, cy - 6);
        ctx.lineTo(cx - 24, cy + 8);
        ctx.moveTo(cx + 20, cy - 22);
        ctx.lineTo(cx + 28, cy - 10);
        ctx.lineTo(cx + 18, cy + 4);
        ctx.stroke();

        // 黄金の四足獣胴体
        const raijuGrad = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0);
        raijuGrad.addColorStop(0, '#f1c40f');
        raijuGrad.addColorStop(0.5, '#f39c12');
        raijuGrad.addColorStop(1, '#e67e22');
        ctx.fillStyle = raijuGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 24, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 頭部と鋭い角
        ctx.fillStyle = raijuGrad;
        ctx.beginPath();
        ctx.ellipse(cx + 16, cy - 8, 14, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 稲妻の角
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy - 18);
        ctx.lineTo(cx + 18, cy - 32);
        ctx.lineTo(cx + 26, cy - 30);
        ctx.stroke();

        // 青白く光る雷光の瞳
        ctx.fillStyle = '#00cec9';
        ctx.beginPath();
        ctx.arc(cx + 20, cy - 9, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 牛の群れ（cattle）の描画
     */
    drawCattle(ctx, s) {
        ctx.save();
        const cx = s * 0.5;
        const cy = s * 0.54;

        // たくましい闘牛の胴体
        const bullGrad = ctx.createLinearGradient(cx - 26, 0, cx + 26, 0);
        bullGrad.addColorStop(0, '#5d4037');
        bullGrad.addColorStop(0.5, '#795548');
        bullGrad.addColorStop(1, '#3e2723');
        ctx.fillStyle = bullGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 26, cy - 14, 52, 36, 10);
        ctx.fill();
        ctx.strokeStyle = '#2d1d17';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 肩の逞しいコブ
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 14, 12, Math.PI, 0);
        ctx.fill();

        // 頭部
        ctx.fillStyle = bullGrad;
        ctx.beginPath();
        ctx.roundRect(cx + 12, cy - 20, 24, 28, 6);
        ctx.fill();
        ctx.stroke();

        // 前方に湾曲した鋭い白銀の角
        ctx.fillStyle = '#ecf0f1';
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1.5;
        // 左角
        ctx.beginPath();
        ctx.moveTo(cx + 18, cy - 20);
        ctx.quadraticCurveTo(cx + 24, cy - 38, cx + 36, cy - 32);
        ctx.quadraticCurveTo(cx + 28, cy - 24, cx + 24, cy - 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 金色の鼻輪
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx + 34, cy + 2, 5, 0, Math.PI * 2);
        ctx.stroke();

        // 鋭い眼光
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx + 24, cy - 12, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
    drawDefault(ctx, s) {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(s * 0.5, s * 0.5, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * キャラクターの影用テクスチャ
     */
    getShadowCanvas() {
        if (this.cache.has('shadow')) {
            return this.cache.get('shadow');
        }
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();
        this.cache.set('shadow', canvas);
        return canvas;
    }

    /**
     * 投擲用手裏剣スプライト
     */
    getShurikenCanvas() {
        if (this.cache.has('shuriken_proj')) {
            return this.cache.get('shuriken_proj');
        }
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.translate(16, 16);
        this.drawShurikenShape(ctx, 13);
        this.cache.set('shuriken_proj', canvas);
        return canvas;
    }

    /**
     * 火炎パーティクル用テクスチャ
     */
    getFlameParticleCanvas() {
        if (this.cache.has('flame_particle')) {
            return this.cache.get('flame_particle');
        }
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#f1c40f');
        grad.addColorStop(0.6, '#e67e22');
        grad.addColorStop(0.9, '#e74c3c');
        grad.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();
        this.cache.set('flame_particle', canvas);
        return canvas;
    }
}
