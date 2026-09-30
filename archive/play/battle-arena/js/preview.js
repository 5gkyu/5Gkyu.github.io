/**
 * 図鑑用実戦アクションプレビュー (PreviewPlayer)
 * 各キャラクターが実際に戦って固有能力を炸裂させるショーケースシーンを
 * 専用の小型3Dステージでループ再生・シミュレーションする。
 */

import { FACTIONS, BattleUnit, BattleEngine } from './simulation.js';

export class PreviewPlayer {
    constructor(containerElement, captionElement, spriteGenerator, soundManager = null) {
        this.container = containerElement;
        this.captionEl = captionElement;
        this.spriteGen = spriteGenerator;
        this.sound = soundManager;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // シミュレーションエンジン（プレビュー用、アリーナ半径11m）
        this.engine = new BattleEngine(11);

        // ユニットのメッシュ管理
        this.unitVisuals = new Map();
        this.textures = new Map();

        // エフェクト管理
        this.projectiles = [];
        this.particles = [];
        this.damagePopups = [];

        // 状態フラグ
        this.currentFactionId = 'human';
        this.isRunning = false;
        this.isPaused = false;
        this.restartTimer = null;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        if (!this.container) return;

        const width = this.container.clientWidth || 600;
        const height = this.container.clientHeight || 240;

        // 1. シーン
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0d14);
        this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.022);

        // 2. カメラ (少し近距離の斜め見下ろし約45度)
        this.camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 150);
        this.camera.position.set(0, 15, 14);
        this.camera.lookAt(0, 0, 0);

        // 3. レンダラー
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 4. OrbitControls（ドラッグでプレビュー視点回転可能）
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.08;
            this.controls.target.set(0, 0, 0);
            this.controls.maxPolarAngle = Math.PI / 2.15;
            this.controls.minDistance = 6;
            this.controls.maxDistance = 35;
        }

        // 5. ライティング
        this.setupLights();

        // 6. ミニコロシアムフロア
        this.buildMiniArena(11);

        // 7. リサイズ対応
        this.resizeObserver = new ResizeObserver(() => this.onResize());
        this.resizeObserver.observe(this.container);
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xdff9fb, 0.75);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xfff9e6, 1.0);
        dirLight.position.set(12, 28, 16);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 5;
        dirLight.shadow.camera.far = 60;
        dirLight.shadow.camera.left = -15;
        dirLight.shadow.camera.right = 15;
        dirLight.shadow.camera.top = 15;
        dirLight.shadow.camera.bottom = -15;
        this.scene.add(dirLight);

        // 中央スポットライト
        const centerSpot = new THREE.SpotLight(0x70a1ff, 0.85, 45, Math.PI / 3.5, 0.3);
        centerSpot.position.set(0, 24, 0);
        centerSpot.target.position.set(0, 0, 0);
        this.scene.add(centerSpot);
        this.scene.add(centerSpot.target);
    }

    buildMiniArena(radius) {
        // フロアテクスチャ生成
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const fctx = floorCanvas.getContext('2d');

        fctx.fillStyle = '#10141f';
        fctx.fillRect(0, 0, 512, 512);

        // 同心円サークル
        fctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        fctx.lineWidth = 2;
        for (let r = 40; r < 250; r += 40) {
            fctx.beginPath();
            fctx.arc(256, 256, r, 0, Math.PI * 2);
            fctx.stroke();
        }

        // 魔法陣リング
        fctx.strokeStyle = 'rgba(74, 144, 226, 0.35)';
        fctx.lineWidth = 3;
        fctx.beginPath();
        fctx.arc(256, 256, 100, 0, Math.PI * 2);
        fctx.stroke();

        fctx.strokeStyle = 'rgba(241, 196, 15, 0.4)';
        fctx.lineWidth = 2;
        fctx.beginPath();
        fctx.arc(256, 256, 130, 0, Math.PI * 2);
        fctx.stroke();

        const floorTexture = new THREE.CanvasTexture(floorCanvas);
        const floorGeo = new THREE.CircleGeometry(radius, 48);
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.7,
            metalness: 0.2
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        // 外周境界リング
        const ringGeo = new THREE.RingGeometry(radius - 0.2, radius + 0.2, 48);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.02;
        this.scene.add(ringMesh);

        // 外周ミニピラー（8本）
        const numPillars = 8;
        const pillarGeo = new THREE.CylinderGeometry(0.4, 0.5, 2.2, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x222831, roughness: 0.8 });
        for (let i = 0; i < numPillars; i++) {
            const angle = (i / numPillars) * Math.PI * 2;
            const px = Math.cos(angle) * (radius + 0.8);
            const pz = Math.sin(angle) * (radius + 0.8);
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(px, 1.1, pz);
            pillar.castShadow = true;
            this.scene.add(pillar);
        }
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * 指定勢力のショーケースシナリオを開始
     */
    playScenario(factionId) {
        this.currentFactionId = factionId;
        this.isPaused = false;
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }

        // カメラ位置のリセット
        this.camera.position.set(0, 15, 14);
        if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }

        // 既存ビジュアル・エフェクトのクリア
        this.clearVisuals();

        // エンジンのリセットと専用シナリオのユニット配置
        this.setupScenarioUnits(factionId);

        // ビジュアル生成
        this.engine.units.forEach(u => this.addUnitVisual(u));

        // ループが停止していれば再開
        if (!this.isRunning) {
            this.start();
        }
    }

    /**
     * 主役ユニットに不屈プロテクション（HP 1未満にならない）を適用
     */
    protectHeroUnit(unit) {
        if (unit.factionId === this.currentFactionId) {
            // スライムの親のみ分裂演出を見せるため死亡可能。分裂体および他主役ユニットは絶対不屈
            if (this.currentFactionId === 'slime' && !unit.isChild) {
                return;
            }
            if (unit._heroProtected) return;
            unit._heroProtected = true;

            const originalTakeDamage = unit.takeDamage.bind(unit);
            unit.takeDamage = (rawDmg, isPure) => {
                const actual = originalTakeDamage(rawDmg, isPure);
                if (unit.hp <= 1) {
                    unit.hp = 1;
                    unit.alive = true;
                }
                return actual;
            };
        }
    }

    /**
     * 各キャラ専用の活躍シナリオのセットアップ
     */
    setupScenarioUnits(factionId) {
        this.engine.units = [];
        this.engine.nextUnitId = 1;
        this.engine.isFinished = false;
        this.engine.winnerFactionId = null;
        this.engine.elapsedTime = 0;
        this.engine.events = [];

        let captionText = '';

        switch (factionId) {
            case 'human': {
                // 【人間：結束】密集した人間部隊 vs 突っ込んでくる犬の群れ
                this.engine.activeFactionIds = ['human', 'dog'];
                captionText = '【結束 (Phalanx)】仲間と密集陣形を組み、攻防を飛躍的に高めて突進部隊を撃破！';

                // 人間部隊（左側に密集配置：結束数MAX近くで攻防極大）
                const humanPositions = [
                    [-4.2, -0.8], [-3.8, 0.6], [-4.8, 0.0],
                    [-3.2, -0.3], [-3.0, 0.5], [-3.9, -1.5]
                ];
                humanPositions.forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // 犬部隊（右側から突入、人間の結束打撃1〜2発で倒れるようmaxHp/hp24に設定）
                const dogPositions = [
                    [4.2, -1.2], [4.8, 0.0], [4.2, 1.2]
                ];
                dogPositions.forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'dog', x, z);
                    u.maxHp = 24;
                    u.hp = 24;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'dog': {
                // 【犬：猛突進】俊敏な犬が急接近し、超高速連続噛みつきで瞬殺
                this.engine.activeFactionIds = ['dog', 'human'];
                captionText = '【猛突進 (Savage Rush)】全勢力最速の足で急接近し、毎秒2.2回の猛烈な連続噛みつきで瞬殺！';

                // 犬3体（左側）
                [[-4.2, -1.0], [-4.6, 0.8], [-3.6, 0.0]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'dog', x, z);
                    this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // 人間2体（右側、犬の猛速噛みつきで約1.2秒で倒れるようmaxHp/hp30・DEF0に設定）
                [[3.2, -0.6], [3.5, 0.8]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 30;
                    u.hp = 30;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'zombie': {
                // 【ゾンビ：感染】敵を倒した瞬間、ゾンビとして蘇生させて雪だるま式増殖
                this.engine.activeFactionIds = ['zombie', 'human'];
                captionText = '【感染 (Infection)】倒した敵を即座にゾンビ化！味方を雪だるま式に増やして逆転！';

                // ゾンビ2体（左側、攻撃力を少し底上げしてスムーズに撃破）
                [[-3.6, -0.8], [-3.6, 0.8]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'zombie', x, z);
                    u.atk = 18;
                    this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // 人間3体（右側、ゾンビの攻撃2発で感染発動するようmaxHp/hp28に設定）
                [[2.6, -1.1], [3.0, 0.0], [3.2, 1.2]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 28;
                    u.hp = 28;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'robot': {
                // 【ロボ：重装甲＆故障】群がる敵の攻撃をDEF 10で弾き、怪力の一撃で叩き潰す
                this.engine.activeFactionIds = ['robot', 'dog', 'human'];
                captionText = '【重装甲＆故障】DEF 10の鉄壁装甲で打撃をほぼ無力化！故障を乗り越え怪力パンチで粉砕！';

                // ロボ1体（左中央）
                const robo = new BattleUnit(this.engine.nextUnitId++, 'robot', -2.5, 0.0);
                robo.atk = 45;
                this.protectHeroUnit(robo);
                this.engine.units.push(robo);

                // 犬2体 ＋ 人間1体（右側から突撃、ロボの豪快パンチで一撃粉砕）
                [[3.0, -1.0], [3.0, 1.0]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'dog', x, z);
                    u.maxHp = 24;
                    u.hp = 24;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                const human = new BattleUnit(this.engine.nextUnitId++, 'human', 3.8, 0.0);
                human.maxHp = 24;
                human.hp = 24;
                human.def = 0;
                this.engine.units.push(human);
                break;
            }

            case 'slime': {
                // 【スライム：細胞分裂】倒された瞬間にミニスライムに分裂し、粘着包囲で敵を撃破
                this.engine.activeFactionIds = ['slime', 'robot'];
                captionText = '【細胞分裂 (Cell Division)】倒されてもミニスライムに分裂！粘り強い数の暴力で格上の敵を翻弄！';

                // スライム2体（左側、初撃で速やかに分裂演出を見せるためmaxHp/hp25に設定）
                [[-3.0, -0.7], [-3.0, 0.7]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'slime', x, z);
                    u.maxHp = 25;
                    u.hp = 25;
                    this.engine.units.push(u);
                });

                // ロボ1体（右側、分裂体4体の一斉攻撃で倒れるようmaxHp/hp42に設定）
                const enemyRobo = new BattleUnit(this.engine.nextUnitId++, 'robot', 2.6, 0.0);
                enemyRobo.maxHp = 42;
                enemyRobo.hp = 42;
                enemyRobo.def = 2;
                this.engine.units.push(enemyRobo);
                break;
            }

            case 'ghost': {
                // 【幽霊：霊体化・すり抜け】攻撃をすり抜け無敵化し、背後から冷気急襲
                this.engine.activeFactionIds = ['ghost', 'robot'];
                captionText = '【霊体化 (Phase Shift)】一定周期で完全無敵化！敵の強打をすり抜けて背後から急襲！';

                // 幽霊2体（左側、開幕直後に即霊体化）
                [[-3.0, -0.8], [-3.0, 0.8]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'ghost', x, z);
                    u.phaseTimer = 3.6; // 開始後0.4秒で即霊体化
                    u.atk = 26;
                    this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // ロボ1体（右側、幽霊の攻撃で倒れるようmaxHp/hp45に設定）
                const robo = new BattleUnit(this.engine.nextUnitId++, 'robot', 2.5, 0.0);
                robo.maxHp = 45;
                robo.hp = 45;
                robo.def = 2;
                this.engine.units.push(robo);
                break;
            }

            case 'dragon': {
                // 【ドラゴン：灼熱の火炎ブレス】前方広範囲に火炎を放射し、群がる大軍勢を一網打尽
                this.engine.activeFactionIds = ['dragon', 'human', 'slime'];
                captionText = '【灼熱の火炎ブレス】前方広範囲に業火を放射！群がる大群勢を一撃で焼き尽くす！';

                // ドラゴン1体（左中央に雄大に配置）
                const dragon = new BattleUnit(this.engine.nextUnitId++, 'dragon', -2.2, 0.0);
                dragon.facingAngle = 0; // 右向き
                this.protectHeroUnit(dragon);
                this.engine.units.push(dragon);

                // 人間＆スライムの大軍勢（右側に扇状に密集配置、ブレス1発で爽快に一網打尽）
                const hordePositions = [
                    [2.6, -1.2], [2.8, 0.0], [2.6, 1.2],
                    [3.8, -0.6], [3.8, 0.6]
                ];
                hordePositions.forEach(([x, z], i) => {
                    const fac = i % 2 === 0 ? 'human' : 'slime';
                    const u = new BattleUnit(this.engine.nextUnitId++, fac, x, z);
                    u.maxHp = 25;
                    u.hp = 25;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'ninja': {
                // 【忍者：手裏剣＆空蝉】遠距離射撃 ＋ ピンチ時に背後へ瞬間移動して逆転
                this.engine.activeFactionIds = ['ninja', 'human'];
                captionText = '【空蝉の術 (Utsusemi)】HPが減った窮地に背後へ瞬間移動！死角からの手裏剣連射で劇的逆転！';

                // 忍者1体（左側、被弾1発で空蝉発動し、背後から手裏剣連射で倒す）
                const ninja = new BattleUnit(this.engine.nextUnitId++, 'ninja', -4.0, 0.0);
                ninja.hp = 42; // 被弾1回でHP39以下になり空蝉発動
                ninja.atk = 28;
                this.protectHeroUnit(ninja);
                this.engine.units.push(ninja);

                // 人間2体（右側、手裏剣2発ずつで倒れるようmaxHp/hp30に設定）
                [[2.6, -0.8], [2.8, 0.8]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 30;
                    u.hp = 30;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'rat': {
                // 【ネズミ：疫病】大群で群がり、重複する毒ダメージで高装甲ロボをも削り倒す！
                this.engine.activeFactionIds = ['rat', 'robot'];
                captionText = '【疫病 (Plague)】噛みつくたびに毒が蓄積！最低ダメージ保証と毒の重複で堅牢なロボをも削り倒す！';

                // ネズミ部隊（8体）
                const ratPositions = [
                    [-4.2, -1.0], [-3.8, 0.5], [-4.6, 0.0], [-3.2, -0.5],
                    [-4.0, 1.2], [-3.0, 0.8], [-4.4, -0.4], [-3.5, -1.2]
                ];
                ratPositions.forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'rat', x, z);
                    this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // ロボ1体（右側、毒の削りで気持ちよく倒れるようmaxHp/hp70に設定）
                const targetRobot = new BattleUnit(this.engine.nextUnitId++, 'robot', 3.2, 0.0);
                targetRobot.maxHp = 70;
                targetRobot.hp = 70;
                this.engine.units.push(targetRobot);
                break;
            }

            case 'bee': {
                // 【ハチ：毒針】飛行特性で回避しつつ、決死の刺突で強毒を残して撃破！
                this.engine.activeFactionIds = ['bee', 'human'];
                captionText = '【毒針 (Stinger)】飛行特性で攻撃を20%回避！決死の特攻毒針で強毒を残し敵を制圧！';

                // ハチ5体（前衛2体が刺して敵を倒し、後衛3体が生き残って勝利）
                [[-2.2, -0.6], [-2.2, 0.6], [-4.5, -1.0], [-4.5, 1.0], [-5.0, 0.0]].forEach(([x, z], idx) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'bee', x, z);
                    if (idx >= 2) this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // 人間2体（右側、毒針の初撃で即座に倒れるようHP8に設定）
                [[2.0, -0.6], [2.2, 0.6]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 8;
                    u.hp = 8;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'mushroom': {
                // 【キノコ：胞子】周囲の敵を混乱させて同士討ち！死後胞子雲で敵陣崩壊！
                this.engine.activeFactionIds = ['mushroom', 'dog'];
                captionText = '【胞子 (Spores)】周囲の敵を混乱させて同士討ち！倒れた後も胞子雲を残し敵陣を内側から崩壊！';

                // キノコ2体（中央付近）
                [[-1.5, -0.6], [-1.5, 0.6]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'mushroom', x, z);
                    u.atk = 18;
                    this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // 犬4体（右側から突入、混乱して同士討ち＆キノコに撃破）
                [[2.8, -1.0], [3.2, -0.3], [3.2, 0.3], [2.8, 1.0]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'dog', x, z);
                    u.maxHp = 16;
                    u.hp = 16;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'giant': {
                // 【巨人：踏みつけ】足元の小型ユニットを即死粉砕！
                this.engine.activeFactionIds = ['giant', 'dog', 'rat'];
                captionText = '【踏みつけ (Colossal Stomp)】HP50以下の小型ユニットを即死！大地を揺るがす範囲打撃！';

                const giant = new BattleUnit(this.engine.nextUnitId++, 'giant', -2.8, 0.0);
                this.protectHeroUnit(giant);
                this.engine.units.push(giant);

                // 群がる小型ユニット（犬とネズミ）
                const smallEnemies = [
                    [1.6, -0.8], [2.0, 0.0], [1.6, 0.8],
                    [2.4, -0.5], [2.4, 0.5]
                ];
                smallEnemies.forEach(([x, z], idx) => {
                    const fId = idx % 2 === 0 ? 'dog' : 'rat';
                    const u = new BattleUnit(this.engine.nextUnitId++, fId, x, z);
                    u.maxHp = 20;
                    u.hp = 20;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'reaper': {
                // 【死神：刈り取り】瀕死の敵を大鎌で即死刈り取り！倒すたびに速度上昇！
                this.engine.activeFactionIds = ['reaper', 'human'];
                captionText = '【刈り取り (Soul Harvest)】HP20%以下の敵を即死刈り取り！敵を屠るたびに移動速度が上昇！';

                const reaper = new BattleUnit(this.engine.nextUnitId++, 'reaper', -3.5, 0.0);
                reaper.atk = 35;
                this.protectHeroUnit(reaper);
                this.engine.units.push(reaper);

                // 弱った人間たち（HPが20%以下で配置、一撃で即死刈り取り発動）
                [[1.8, -1.0], [2.2, -0.3], [2.2, 0.3], [1.8, 1.0]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 100;
                    u.hp = 12; // 20%以下
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'samurai': {
                // 【サムライ：神速居合】間合いに入って1秒後の一撃が3倍ダメージ！
                this.engine.activeFactionIds = ['samurai', 'robot'];
                captionText = '【神速居合 (Iaido Strike)】間合いに入り精神集中1秒後、3倍威力の白刃一閃で巨大装甲を両断！';

                const samurai = new BattleUnit(this.engine.nextUnitId++, 'samurai', -3.5, 0.0);
                samurai.iaidoTimer = 0.9; // すぐに居合発動可能な状態
                this.protectHeroUnit(samurai);
                this.engine.units.push(samurai);

                const enemyRobot = new BattleUnit(this.engine.nextUnitId++, 'robot', 2.8, 0.0);
                enemyRobot.maxHp = 60;
                enemyRobot.hp = 60;
                this.engine.units.push(enemyRobot);
                break;
            }

            case 'golem': {
                // 【ゴーレム：岩の体】DEF 14で鉄壁防御、砕け散っても小岩3体に崩落分裂！
                this.engine.activeFactionIds = ['golem', 'dog'];
                captionText = '【岩の体 (Granite Form)】DEF 14の鉄壁石肌！砕かれようとも3体の小岩ゴーレムに分裂！';

                const golem = new BattleUnit(this.engine.nextUnitId++, 'golem', -2.0, 0.0);
                golem.maxHp = 35;
                golem.hp = 35; // プレビューで小岩分裂を見せるため適度に削れるHP
                this.engine.units.push(golem);

                // 犬2体（小岩に倒されるようHP14に設定）
                [[2.0, -0.6], [2.0, 0.6]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'dog', x, z);
                    u.maxHp = 14;
                    u.hp = 14;
                    u.atk = 18;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'bomber': {
                // 【爆弾魔：大自爆】敵陣に飛び込み、特大の無差別大爆発で一網打尽！
                this.engine.activeFactionIds = ['bomber', 'human'];
                captionText = '【破滅の大自爆 (Mega Blast)】敵陣へダイブ！半径3mを巻き込む大爆破で敵部隊を一網打尽！';

                // 特攻爆弾魔（HP10で即起爆準備）
                const kamikaze = new BattleUnit(this.engine.nextUnitId++, 'bomber', -0.5, 0.0);
                kamikaze.hp = 10;
                this.engine.units.push(kamikaze);

                // 後方で見守る爆弾魔（生き残って勝利）
                [[-4.0, -0.6], [-4.0, 0.6]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'bomber', x, z);
                    this.protectHeroUnit(u);
                    this.engine.units.push(u);
                });

                // 密集した人間部隊（爆発で全員吹き飛ぶ）
                [[1.6, -0.7], [2.0, 0.0], [1.6, 0.7]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 40;
                    u.hp = 40;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'clown': {
                // 【ピエロ：入れ替わり】敵と位置をシャッフルして奇襲！
                this.engine.activeFactionIds = ['clown', 'human'];
                captionText = '【入れ替わり (Trick Swap)】奇術で敵と位置を突如交換！陣形を翻弄して背後から撃破！';

                const clown = new BattleUnit(this.engine.nextUnitId++, 'clown', -3.5, 0.0);
                clown.clownSwapTimer = 0.8; // すぐに入れ替わり発動
                this.protectHeroUnit(clown);
                this.engine.units.push(clown);

                [[2.8, -0.8], [3.2, 0.8]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 25;
                    u.hp = 25;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'mimic': {
                // 【ミミック：擬態】敵の能力とステータスをコピーして反撃！
                this.engine.activeFactionIds = ['mimic', 'robot'];
                captionText = '【擬態 (Mimicry)】接触した敵の能力と攻防の30%を即時コピー！相手の力で相手を粉砕！';

                const mimic = new BattleUnit(this.engine.nextUnitId++, 'mimic', -3.5, 0.0);
                this.protectHeroUnit(mimic);
                this.engine.units.push(mimic);

                const robot = new BattleUnit(this.engine.nextUnitId++, 'robot', 3.0, 0.0);
                robot.maxHp = 45;
                robot.hp = 45;
                this.engine.units.push(robot);
                break;
            }

            case 'yukionna': {
                // 【雪女：凍結】氷雪の冷気で敵を鈍足化、3スタックで完全凍結！
                this.engine.activeFactionIds = ['yukionna', 'dog'];
                captionText = '【凍結 (Blizzard Curse)】命中で速度-40%、3スタックで完全氷結！俊足相手を一方的に固めて封殺！';

                const yukionna = new BattleUnit(this.engine.nextUnitId++, 'yukionna', -4.2, 0.0);
                yukionna.atk = 20;
                this.protectHeroUnit(yukionna);
                this.engine.units.push(yukionna);

                // 突っ込んでくる犬2体（凍結して倒れる）
                [[2.8, -0.6], [3.2, 0.6]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'dog', x, z);
                    u.maxHp = 30;
                    u.hp = 30;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'vampire': {
                // 【吸血鬼：吸血＆コウモリ化】与ダメ50%回復、ピンチでコウモリ化脱出！
                this.engine.activeFactionIds = ['vampire', 'human'];
                captionText = '【吸血＆蝙蝠変生】与ダメの50%を即座にHP吸収！ピンチにはコウモリ化して完全無敵で逃亡！';

                const vampire = new BattleUnit(this.engine.nextUnitId++, 'vampire', -3.5, 0.0);
                vampire.hp = 25; // 序盤にコウモリ化を実演
                this.protectHeroUnit(vampire);
                this.engine.units.push(vampire);

                [[2.6, -0.7], [3.0, 0.7]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 35;
                    u.hp = 35;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'cat': {
                // 【猫：九つの命】倒されても最大3回復活！不屈の粘り勝ち！
                this.engine.activeFactionIds = ['cat', 'dog'];
                captionText = '【九つの命 (Nine Lives)】倒されても即座にHP30%で蘇生！何度でも立ち上がる圧倒的粘り強さ！';

                const cat = new BattleUnit(this.engine.nextUnitId++, 'cat', -3.2, 0.0);
                cat.hp = 8; // 1発で倒れて復活演出を実演
                cat.catLives = 2;
                this.protectHeroUnit(cat);
                this.engine.units.push(cat);

                const dog = new BattleUnit(this.engine.nextUnitId++, 'dog', 2.8, 0.0);
                dog.maxHp = 25;
                dog.hp = 25;
                dog.def = 0;
                this.engine.units.push(dog);
                break;
            }

            case 'raiju': {
                // 【雷獣：連鎖雷】攻撃が近くの敵に次々に連鎖跳躍！
                this.engine.activeFactionIds = ['raiju', 'human'];
                captionText = '【連鎖雷 (Chain Lightning)】高圧の電撃が近くの敵へ次々に跳躍！密集した部隊を一瞬で感電粉砕！';

                const raiju = new BattleUnit(this.engine.nextUnitId++, 'raiju', -4.0, 0.0);
                this.protectHeroUnit(raiju);
                this.engine.units.push(raiju);

                // 密集した人間3体（連鎖雷で一気に撃破）
                [[2.4, -0.6], [2.8, 0.0], [2.4, 0.6]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 30;
                    u.hp = 30;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }

            case 'cattle': {
                // 【牛の群れ：スタンピード】怒涛の直線突進で敵を弾き飛ばす！
                this.engine.activeFactionIds = ['cattle', 'human'];
                captionText = '【スタンピード (Stampede Charge)】怒涛の直線突進で敵陣を粉砕！進路上の敵を豪快に弾き飛ばす！';

                const bull = new BattleUnit(this.engine.nextUnitId++, 'cattle', -4.5, 0.0);
                bull.stampedeTimer = 0.5; // すぐに突進開始
                this.protectHeroUnit(bull);
                this.engine.units.push(bull);

                // 直線上に並ぶ敵兵
                [[0.5, 0.0], [2.2, 0.0], [3.8, 0.0]].forEach(([x, z]) => {
                    const u = new BattleUnit(this.engine.nextUnitId++, 'human', x, z);
                    u.maxHp = 25;
                    u.hp = 25;
                    u.def = 0;
                    this.engine.units.push(u);
                });
                break;
            }
        }

        // キャプションの表示
        if (this.captionEl) {
            this.captionEl.textContent = captionText;
            this.captionEl.style.color = FACTIONS[factionId] ? FACTIONS[factionId].color : '#74b9ff';
        }
    }

    /**
     * 1ユニットの3Dビジュアル生成
     */
    addUnitVisual(unit) {
        if (this.unitVisuals.has(unit.id)) return;

        const root = new THREE.Group();
        root.position.set(unit.x, 0, unit.z);

        const isDragon = unit.factionId === 'dragon';
        const polyWidth = isDragon ? 4.2 : 2.0 * unit.scale;
        const polyHeight = isDragon ? 4.2 : 2.0 * unit.scale;
        const bodyCenterY = polyHeight * 0.48;

        // 1. スプライト板ポリ
        const bodyGeo = new THREE.PlaneGeometry(polyWidth, polyHeight);
        const texture = this.getCharacterTexture(unit.factionId, unit.isChild);
        const bodyMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.05,
            side: THREE.DoubleSide
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.y = bodyCenterY;
        root.add(bodyMesh);

        // 2. 足元ドロップシャドウ
        const shadowRadius = unit.radius * (isDragon ? 1.5 : 1.1);
        const shadowGeo = new THREE.PlaneGeometry(shadowRadius * 2, shadowRadius * 2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: this.getShadowTexture(),
            transparent: true,
            opacity: 0.5,
            depthWrite: false
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.02;
        root.add(shadowMesh);

        // 3. 頭上HPバー
        const hpBarWidth = isDragon ? 2.6 : 1.2;
        const hpBarHeight = isDragon ? 0.22 : 0.14;
        const hpPosY = bodyCenterY + polyHeight * 0.52;

        const hpBarGeo = new THREE.PlaneGeometry(hpBarWidth + 0.06, hpBarHeight + 0.04);
        const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
        const hpBarMesh = new THREE.Mesh(hpBarGeo, hpBarMat);
        hpBarMesh.position.set(0, hpPosY, 0);

        const hpFillGeo = new THREE.PlaneGeometry(hpBarWidth, hpBarHeight);
        const hpFillMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71, side: THREE.DoubleSide });
        const hpFillMesh = new THREE.Mesh(hpFillGeo, hpFillMat);
        hpFillMesh.position.set(0, 0, 0.01);
        hpBarMesh.add(hpFillMesh);

        root.add(hpBarMesh);
        this.scene.add(root);

        this.unitVisuals.set(unit.id, {
            root,
            bodyMesh,
            bodyMat,
            bodyGeo,
            shadowMesh,
            shadowMat,
            shadowGeo,
            hpBarMesh,
            hpBarMat,
            hpBarGeo,
            hpFillMesh,
            hpFillMat,
            hpFillGeo,
            baseHpWidth: hpBarWidth,
            bodyCenterY,
            bobbingTimer: Math.random() * 10
        });
    }

    removeUnitVisual(unitId, factionId, x, z) {
        const visual = this.unitVisuals.get(unitId);
        if (!visual) return;

        visual.root.visible = false;
        this.spawnDeathParticles(x, z, FACTIONS[factionId] ? FACTIONS[factionId].colorInt : 0xffffff);

        this.scene.remove(visual.root);
        visual.bodyGeo.dispose();
        visual.bodyMat.dispose();
        visual.shadowGeo.dispose();
        visual.shadowMat.dispose();
        visual.hpBarGeo.dispose();
        visual.hpBarMat.dispose();
        visual.hpFillGeo.dispose();
        visual.hpFillMat.dispose();

        this.unitVisuals.delete(unitId);
    }

    clearVisuals() {
        for (const [, visual] of this.unitVisuals.entries()) {
            this.scene.remove(visual.root);
            visual.bodyGeo.dispose();
            visual.bodyMat.dispose();
            visual.shadowGeo.dispose();
            visual.shadowMat.dispose();
            visual.hpBarGeo.dispose();
            visual.hpBarMat.dispose();
            visual.hpFillGeo.dispose();
            visual.hpFillMat.dispose();
        }
        this.unitVisuals.clear();

        // エフェクトの破棄
        this.projectiles.forEach(p => {
            this.scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
        });
        this.projectiles = [];

        this.particles.forEach(p => {
            this.scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
        });
        this.particles = [];

        this.damagePopups.forEach(d => {
            this.scene.remove(d.mesh);
            d.mesh.geometry.dispose();
            d.mesh.material.map.dispose();
            d.mesh.material.dispose();
        });
        this.damagePopups = [];
    }

    /**
     * 毎フレームのループ更新
     */
    update() {
        if (!this.isRunning) return;

        const dt = Math.min(this.clock.getDelta(), 0.05);

        if (!this.isPaused) {
            // 主役キャラクター保護（不屈プロテクション）:
            // プレビューの主役勢力ユニット（スライム分裂体・感染ゾンビを含む）に保護を適用
            for (const u of this.engine.units) {
                this.protectHeroUnit(u);
            }

            // シミュレーション計算
            const events = this.engine.update(dt);

            // シミュレーション計算後も新ユニット（分裂・感染）に保護を即時適用
            for (const u of this.engine.units) {
                this.protectHeroUnit(u);
                if (u.factionId === this.currentFactionId) {
                    if (this.currentFactionId === 'slime' && !u.isChild) {
                        continue;
                    }
                    if (u.hp <= 1) {
                        u.hp = 1;
                        u.alive = true;
                    }
                }
            }

            // イベントの処理（エフェクト発動・SE）
            this.handleEvents(events);

            // ユニット同期
            this.syncUnits(this.engine.units, dt);

            // エフェクト更新
            this.updateEffects(dt);

            // 決着判定と自動ループ（主役の勝利を確実に保証）
            if (this.engine.isFinished && !this.restartTimer) {
                // 決着時に敵ユニットのvisualを完全除去（主役のみが立つ状態にする）
                for (const u of this.engine.units) {
                    if (u.factionId !== this.currentFactionId || !u.alive || u.hp <= 0) {
                        if (u.factionId !== this.currentFactionId) {
                            u.alive = false;
                            u.hp = 0;
                            const v = this.unitVisuals.get(u.id);
                            if (v) {
                                v.root.visible = false;
                                this.removeUnitVisual(u.id, u.factionId, u.x, u.z);
                            }
                        }
                    }
                }

                // 主役勢力を勝者に確定
                this.engine.winnerFactionId = this.currentFactionId;
                const winnerFac = FACTIONS[this.currentFactionId];
                if (this.captionEl && winnerFac) {
                    this.captionEl.textContent = `【決着】${winnerFac.name}の完全勝利！ (まもなくリプレイ)`;
                }
                this.restartTimer = setTimeout(() => {
                    this.restartTimer = null;
                    if (this.isRunning) {
                        this.playScenario(this.currentFactionId);
                    }
                }, 2200);
            }
        }

        // カメラOrbitControls更新
        if (this.controls) {
            this.controls.update();
        }

        // 描画
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => this.update());
    }

    handleEvents(events) {
        for (const ev of events) {
            switch (ev.type) {
                case 'hit': {
                    const hx = ev.x ?? ev.targetX ?? 0;
                    const hz = ev.z ?? ev.targetZ ?? 0;
                    this.spawnDamagePopup(hx, hz, ev.damage);
                    if (this.sound) this.sound.playHit();
                    break;
                }
                case 'evade':
                case 'miss': {
                    const mx = ev.x ?? ev.targetX ?? 0;
                    const mz = ev.z ?? ev.targetZ ?? 0;
                    this.spawnMissPopup(mx, mz);
                    break;
                }
                case 'death':
                case 'unit_death': {
                    this.removeUnitVisual(ev.unitId, ev.factionId, ev.x, ev.z);
                    break;
                }
                case 'dragon_breath': {
                    const ox = ev.origin ? ev.origin.x : (ev.x ?? 0);
                    const oz = ev.origin ? ev.origin.z : (ev.z ?? 0);
                    this.spawnDragonBreath(ox, oz, ev.angle, ev.range);
                    if (this.sound) this.sound.playDragonBreath();
                    break;
                }
                case 'ninja_shuriken': {
                    const fx = ev.from ? ev.from.x : (ev.fromX ?? 0);
                    const fz = ev.from ? ev.from.z : (ev.fromZ ?? 0);
                    const tx = ev.to ? ev.to.x : (ev.toX ?? 0);
                    const tz = ev.to ? ev.to.z : (ev.toZ ?? 0);
                    this.spawnShuriken(fx, fz, tx, tz);
                    if (this.sound) this.sound.playShuriken();
                    break;
                }
                case 'ninja_teleport': {
                    const fx = ev.from ? ev.from.x : (ev.fromX ?? 0);
                    const fz = ev.from ? ev.from.z : (ev.fromZ ?? 0);
                    const tx = ev.to ? ev.to.x : (ev.toX ?? 0);
                    const tz = ev.to ? ev.to.z : (ev.toZ ?? 0);
                    this.spawnTeleportEffect(fx, fz);
                    this.spawnTeleportEffect(tx, tz);
                    if (this.sound) this.sound.playShuriken();
                    break;
                }
                case 'zombie_infect':
                    this.spawnInfectEffect(ev.x, ev.z);
                    if (this.sound) this.sound.playInfect();
                    break;
                case 'slime_split':
                    this.spawnSplitEffect(ev.x, ev.z);
                    if (this.sound) this.sound.playSplit();
                    break;
                case 'robot_glitch':
                    this.spawnGlitchEffect(ev.x, ev.z);
                    if (this.sound) this.sound.playGlitch();
                    break;
                case 'bomber_explode':
                    this.spawnExplosionEffect(ev.x, ev.z, ev.radius || 3.0);
                    if (this.sound) this.sound.playExplosion();
                    break;
                case 'giant_stomp':
                    this.spawnShockwaveEffect(ev.x, ev.z, ev.radius || 3.5);
                    if (this.sound) this.sound.playStomp();
                    break;
                case 'raiju_lightning':
                    this.spawnLightningEffect(ev.points);
                    if (this.sound) this.sound.playLightning();
                    break;
                case 'mushroom_cloud':
                    this.spawnCloudEffect(ev.x, ev.z, 0xe056fd);
                    break;
                case 'yukionna_frozen':
                    this.spawnFreezeEffect(ev.x, ev.z);
                    if (this.sound) this.sound.playFreeze();
                    break;
                case 'cattle_hit':
                case 'cattle_stampede':
                    this.spawnDustEffect(ev.x, ev.z);
                    if (this.sound) this.sound.playStampede();
                    break;
                case 'samurai_iaido':
                    this.spawnSlashEffect(ev.x, ev.z);
                    if (this.sound) this.sound.playIaido();
                    break;
                case 'vampire_drain':
                    this.spawnDrainEffect(ev.x, ev.z);
                    break;
            }
        }
    }

    syncUnits(units, dt) {
        const camQuat = this.camera.quaternion;

        for (const unit of units) {
            let visual = this.unitVisuals.get(unit.id);

            // 体力が0または非生存のユニットは即座に破棄・消去
            if (!unit.alive || unit.hp <= 0) {
                if (visual) {
                    this.removeUnitVisual(unit.id, unit.factionId, unit.x, unit.z);
                }
                continue;
            }

            if (!visual && unit.alive) {
                this.addUnitVisual(unit);
                visual = this.unitVisuals.get(unit.id);
            }
            if (!visual) continue;

            visual.root.position.x = unit.x;
            visual.root.position.z = unit.z;

            // ビルボード回転（常にカメラ正面を向く）
            visual.bodyMesh.quaternion.copy(camQuat);
            visual.hpBarMesh.quaternion.copy(camQuat);

            // 進行方向に向いた左右反転
            const isMovingLeft = Math.cos(unit.facingAngle) < -0.1;
            visual.bodyMesh.scale.x = isMovingLeft ? -1 : 1;

            // アニメーション（移動時の微小ボビング）
            const isMoving = Math.abs(unit.vx) > 0.05 || Math.abs(unit.vz) > 0.05;
            if (isMoving && !unit.isGlitching) {
                visual.bobbingTimer += dt * unit.spd * 3.5;
                const bobY = Math.abs(Math.sin(visual.bobbingTimer)) * 0.16;
                visual.bodyMesh.position.y = visual.bodyCenterY + bobY;
            } else {
                visual.bodyMesh.position.y = visual.bodyCenterY;
            }

            // 幽霊の霊体化（半透明化）
            if (unit.factionId === 'ghost') {
                visual.bodyMat.opacity = unit.isPhasing ? 0.28 : 1.0;
            }

            // ロボの故障硬直（点滅）
            if (unit.factionId === 'robot') {
                if (unit.isGlitching) {
                    visual.bodyMesh.position.x += (Math.random() - 0.5) * 0.08;
                }
            }

            // HPバー更新
            const hpRatio = Math.max(0, Math.min(1, unit.hp / unit.maxHp));
            const fillWidth = visual.baseHpWidth * hpRatio;
            visual.hpFillMesh.scale.x = Math.max(0.001, hpRatio);
            visual.hpFillMesh.position.x = -(visual.baseHpWidth - fillWidth) / 2;

            if (hpRatio > 0.5) {
                visual.hpFillMat.color.setHex(0x2ecc71);
            } else if (hpRatio > 0.25) {
                visual.hpFillMat.color.setHex(0xf1c40f);
            } else {
                visual.hpFillMat.color.setHex(0xe74c3c);
            }
        }
    }

    /* エフェクト生成群 */
    spawnDamagePopup(x, z, damage) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = damage >= 30 ? '#ff7675' : '#ffffff';
        ctx.font = 'bold 36px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(damage, 64, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(1.4, 0.7);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x + (Math.random() - 0.5) * 0.4, 2.0, z);
        this.scene.add(mesh);

        this.damagePopups.push({ mesh, life: 0.65, maxLife: 0.65, vy: 1.8 });
    }

    spawnMissPopup(x, z) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#74b9ff';
        ctx.font = 'bold 30px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MISS', 64, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(1.4, 0.7);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 2.2, z);
        this.scene.add(mesh);

        this.damagePopups.push({ mesh, life: 0.6, maxLife: 0.6, vy: 1.5 });
    }

    spawnDeathParticles(x, z, colorInt) {
        const num = 12;
        const geo = new THREE.PlaneGeometry(0.2, 0.2);
        for (let i = 0; i < num; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: colorInt, transparent: true, opacity: 0.9 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, 0.8, z);
            mesh.quaternion.copy(this.camera.quaternion);
            this.scene.add(mesh);

            const speed = 1.8 + Math.random() * 2.5;
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                mesh,
                vx: Math.cos(angle) * speed,
                vy: 2.0 + Math.random() * 2.5,
                vz: Math.sin(angle) * speed,
                life: 0.5,
                maxLife: 0.5
            });
        }
    }

    spawnDragonBreath(x, z, angle, range) {
        const count = 30;
        const flameTex = this.getFlameTexture();
        const geo = new THREE.PlaneGeometry(0.85, 0.85);

        for (let i = 0; i < count; i++) {
            const mat = new THREE.MeshBasicMaterial({
                map: flameTex,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, 1.4, z);
            this.scene.add(mesh);

            const spreadAngle = angle + (Math.random() - 0.5) * 0.75;
            const speed = (range * (0.6 + Math.random() * 0.6)) / 0.55;
            this.particles.push({
                mesh,
                vx: Math.cos(spreadAngle) * speed,
                vy: (Math.random() - 0.5) * 0.6,
                vz: Math.sin(spreadAngle) * speed,
                life: 0.55,
                maxLife: 0.55,
                isFlame: true
            });
        }
    }

    spawnShuriken(fx, fz, tx, tz) {
        const geo = new THREE.PlaneGeometry(0.65, 0.65);
        const mat = new THREE.MeshBasicMaterial({
            map: this.getShurikenTexture(),
            transparent: true,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(fx, 1.2, fz);
        this.scene.add(mesh);

        const dx = tx - fx;
        const dz = tz - fz;
        const dist = Math.hypot(dx, dz);
        const speed = 14.0;
        const duration = Math.max(0.1, dist / speed);

        this.projectiles.push({
            mesh,
            vx: (dx / dist) * speed,
            vz: (dz / dist) * speed,
            life: duration,
            maxLife: duration
        });
    }

    spawnTeleportEffect(x, z) {
        this.spawnDeathParticles(x, z, 0x9b59b6);
    }

    spawnInfectEffect(x, z) {
        this.spawnDeathParticles(x, z, 0x2ecc71);
    }

    spawnSplitEffect(x, z) {
        this.spawnDeathParticles(x, z, 0xa29bfe);
    }

    spawnGlitchEffect(x, z) {
        this.spawnDeathParticles(x, z, 0x00cec9);
    }

    spawnExplosionEffect(x, z, radius = 3.0) {
        this.spawnDeathParticles(x, z, 0xff4757);
        this.spawnDeathParticles(x + 0.3, z - 0.2, 0xffa502);
    }

    spawnShockwaveEffect(x, z, radius = 3.5) {
        this.spawnDeathParticles(x, z, 0xdfe6e9);
        this.spawnDeathParticles(x, z, 0xe17055);
    }

    spawnLightningEffect(points) {
        if (!points || !points.length) return;
        points.forEach(pt => {
            this.spawnDeathParticles(pt.x, pt.z, 0x00d2d3);
        });
    }

    spawnCloudEffect(x, z, colorInt) {
        this.spawnDeathParticles(x, z, colorInt);
    }

    spawnFreezeEffect(x, z) {
        this.spawnDeathParticles(x, z, 0x74b9ff);
        this.spawnDeathParticles(x, z, 0xffffff);
    }

    spawnDustEffect(x, z) {
        this.spawnDeathParticles(x, z, 0xb2bec3);
    }

    spawnSlashEffect(x, z) {
        this.spawnDeathParticles(x, z, 0xffffff);
        this.spawnDeathParticles(x, z, 0xf1c40f);
    }

    spawnDrainEffect(x, z) {
        this.spawnDeathParticles(x, z, 0xe84118);
    }

    updateEffects(dt) {
        const camQuat = this.camera.quaternion;

        // ダメージポップアップ
        for (let i = this.damagePopups.length - 1; i >= 0; i--) {
            const p = this.damagePopups[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.map.dispose();
                p.mesh.material.dispose();
                this.damagePopups.splice(i, 1);
            } else {
                p.mesh.position.y += p.vy * dt;
                p.mesh.quaternion.copy(camQuat);
                p.mesh.material.opacity = p.life / p.maxLife;
            }
        }

        // 手裏剣
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.projectiles.splice(i, 1);
            } else {
                p.mesh.position.x += p.vx * dt;
                p.mesh.position.z += p.vz * dt;
                p.mesh.quaternion.copy(camQuat);
                p.mesh.rotation.z += dt * 25.0; // 高速回転
            }
        }

        // パーティクル
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.life -= dt;
            if (pt.life <= 0) {
                this.scene.remove(pt.mesh);
                pt.mesh.geometry.dispose();
                pt.mesh.material.dispose();
                this.particles.splice(i, 1);
            } else {
                pt.mesh.position.x += pt.vx * dt;
                pt.mesh.position.y += pt.vy * dt;
                pt.mesh.position.z += pt.vz * dt;
                pt.mesh.quaternion.copy(camQuat);
                pt.mesh.material.opacity = (pt.life / pt.maxLife) * (pt.isFlame ? 0.85 : 0.9);
                if (pt.isFlame) {
                    pt.mesh.scale.multiplyScalar(1.03); // 炎が広がる
                }
            }
        }
    }

    /* テクスチャヘルパー */
    getCharacterTexture(factionId, isChild = false) {
        const key = `${factionId}_${isChild ? 'child' : 'normal'}`;
        if (!this.textures.has(key)) {
            const canvas = this.spriteGen.getCharacterCanvas(factionId, isChild);
            const tex = new THREE.CanvasTexture(canvas);
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            this.textures.set(key, tex);
        }
        return this.textures.get(key);
    }

    getShadowTexture() {
        if (!this.textures.has('shadow')) {
            const canvas = this.spriteGen.getShadowCanvas();
            const tex = new THREE.CanvasTexture(canvas);
            this.textures.set('shadow', tex);
        }
        return this.textures.get('shadow');
    }

    getShurikenTexture() {
        if (!this.textures.has('shuriken')) {
            const canvas = this.spriteGen.getShurikenCanvas();
            const tex = new THREE.CanvasTexture(canvas);
            this.textures.set('shuriken', tex);
        }
        return this.textures.get('shuriken');
    }

    getFlameTexture() {
        if (!this.textures.has('flame')) {
            const canvas = this.spriteGen.getFlameParticleCanvas();
            const tex = new THREE.CanvasTexture(canvas);
            this.textures.set('flame', tex);
        }
        return this.textures.get('flame');
    }

    /**
     * アニメーション開始
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.clock.start();
        this.update();
    }

    /**
     * アニメーション停止（図鑑を閉じたとき用）
     */
    stop() {
        this.isRunning = false;
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }
    }

    /**
     * 一時停止 / 再生 切り替え
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
}
