/**
 * Three.js 3D描画レンダラー
 * 斜め見下ろしカメラ (45〜60度) + コロシアム闘技場 + 板ポリキャラ (Billboard Plane)
 */

import { FACTIONS } from './simulation.js';

export class BattleRenderer {
    constructor(containerElement, spriteGenerator) {
        this.container = containerElement;
        this.spriteGen = spriteGenerator;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // ユニットのメッシュ管理マップ (unitId -> { root, bodyMesh, shadowMesh, hpBarMesh, hpFillMesh, ... })
        this.unitVisuals = new Map();

        // テクスチャキャッシュ
        this.textures = new Map();

        // 視覚エフェクト（弾・火炎・パーティクル・ダメージ数値）の管理配列
        this.projectiles = [];
        this.particles = [];
        this.damagePopups = [];

        // アニメーションタイマー
        this.clock = new THREE.Clock();

        // デフォルトカメラパラメータ（斜め見下ろし約52度）
        this.defaultCameraPos = new THREE.Vector3(0, 36, 28);
        this.defaultCameraLookAt = new THREE.Vector3(0, 0, 2);

        this.init();
    }

    init() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        // 1. シーン
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0e1117);
        this.scene.fog = new THREE.FogExp2(0x0e1117, 0.012);

        // 2. カメラ (視野角 FOV 45度、斜め見下ろし)
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
        this.camera.position.copy(this.defaultCameraPos);
        this.camera.lookAt(this.defaultCameraLookAt);

        // 3. レンダラー
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 4. OrbitControls（自由回転・ズーム・パン）
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.06;
            this.controls.target.copy(this.defaultCameraLookAt);
            this.controls.maxPolarAngle = Math.PI / 2.15; // 地面下に潜り込まないよう制限
            this.controls.minDistance = 8;
            this.controls.maxDistance = 90;
        }

        // 5. ライティング
        this.setupLights();

        // 6. アリーナ（コロシアム闘技場）の構築
        this.buildArena(26);

        // 7. リサイズ監視
        window.addEventListener('resize', () => this.onResize());
    }

    setupLights() {
        // 環境光
        const ambient = new THREE.AmbientLight(0xdff9fb, 0.65);
        this.scene.add(ambient);

        // 主光源（アリーナ上空からのディレクショナルライト）
        const dirLight = new THREE.DirectionalLight(0xfff9e6, 0.95);
        dirLight.position.set(20, 45, 25);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 100;
        dirLight.shadow.camera.left = -32;
        dirLight.shadow.camera.right = 32;
        dirLight.shadow.camera.top = 32;
        dirLight.shadow.camera.bottom = -32;
        dirLight.shadow.bias = -0.0005;
        this.scene.add(dirLight);

        // アリーナ中央への淡いスポットライト
        const centerSpot = new THREE.SpotLight(0x70a1ff, 0.8, 80, Math.PI / 4, 0.3);
        centerSpot.position.set(0, 40, 0);
        centerSpot.target.position.set(0, 0, 0);
        this.scene.add(centerSpot);
        this.scene.add(centerSpot.target);

        // 外周の松明ライト（4箇所）
        this.torches = [];
        const torchPositions = [
            [25, 2.5, 0, 0xff7675],
            [-25, 2.5, 0, 0x74b9ff],
            [0, 2.5, 25, 0xfdcb6e],
            [0, 2.5, -25, 0x55efc4]
        ];
        torchPositions.forEach(([x, y, z, color]) => {
            const torchLight = new THREE.PointLight(color, 0.9, 22);
            torchLight.position.set(x, y, z);
            this.scene.add(torchLight);
            this.torches.push({ light: torchLight, baseY: y, baseIntensity: 0.9 });
        });
    }

    /**
     * アリーナ（円形コロシアム）の生成
     */
    buildArena(radius) {
        // 床面テクスチャ（Canvasでダークスレート＋魔法陣をプロシージャル生成）
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 1024;
        floorCanvas.height = 1024;
        const fctx = floorCanvas.getContext('2d');

        // ダークスレートストーン背景
        fctx.fillStyle = '#141824';
        fctx.fillRect(0, 0, 1024, 1024);

        // 同心円サークルと石畳パターン
        fctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        fctx.lineWidth = 2;
        for (let r = 80; r < 500; r += 70) {
            fctx.beginPath();
            fctx.arc(512, 512, r, 0, Math.PI * 2);
            fctx.stroke();
        }

        // 放射状ライン
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            fctx.beginPath();
            fctx.moveTo(512 + Math.cos(a) * 60, 512 + Math.sin(a) * 60);
            fctx.lineTo(512 + Math.cos(a) * 480, 512 + Math.sin(a) * 480);
            fctx.stroke();
        }

        // 中央の魔法陣・グリフリング
        fctx.strokeStyle = 'rgba(74, 144, 226, 0.28)';
        fctx.lineWidth = 4;
        fctx.beginPath();
        fctx.arc(512, 512, 180, 0, Math.PI * 2);
        fctx.stroke();
        fctx.beginPath();
        fctx.arc(512, 512, 220, 0, Math.PI * 2);
        fctx.stroke();

        // 中央のシンボル
        fctx.strokeStyle = 'rgba(241, 196, 15, 0.35)';
        fctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x1 = 512 + Math.cos(angle) * 160;
            const y1 = 512 + Math.sin(angle) * 160;
            const x2 = 512 + Math.cos(angle + (Math.PI * 2) / 3) * 160;
            const y2 = 512 + Math.sin(angle + (Math.PI * 2) / 3) * 160;
            fctx.beginPath();
            fctx.moveTo(x1, y1);
            fctx.lineTo(x2, y2);
            fctx.stroke();
        }

        const floorTexture = new THREE.CanvasTexture(floorCanvas);
        floorTexture.wrapS = THREE.ClampToEdgeWrapping;
        floorTexture.wrapT = THREE.ClampToEdgeWrapping;

        // 円形闘技場フロアメッシュ
        const floorGeo = new THREE.CircleGeometry(radius, 64);
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.75,
            metalness: 0.15
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = 0;
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        // 外周の光る境界リング（バリアライン）
        const ringGeo = new THREE.RingGeometry(radius - 0.2, radius + 0.3, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.02;
        this.scene.add(ringMesh);

        // 外周の柱（古代コロシアム風のピラー）
        const numPillars = 16;
        const pillarGeo = new THREE.CylinderGeometry(0.7, 0.9, 3.5, 12);
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            roughness: 0.9,
            metalness: 0.1
        });
        for (let i = 0; i < numPillars; i++) {
            const angle = (i / numPillars) * Math.PI * 2;
            const px = Math.cos(angle) * (radius + 1.2);
            const pz = Math.sin(angle) * (radius + 1.2);
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(px, 1.75, pz);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);

            // 柱頭の飾り炎・クリスタル
            if (i % 4 === 0) {
                const orbGeo = new THREE.DodecahedronGeometry(0.35);
                const orbMat = new THREE.MeshBasicMaterial({ color: 0x00d2d3 });
                const orb = new THREE.Mesh(orbGeo, orbMat);
                orb.position.set(px, 3.9, pz);
                this.scene.add(orb);
            }
        }

        // 外周崖・底なし穴の演出用シリンダー
        const abyssGeo = new THREE.CylinderGeometry(radius + 0.5, radius + 8, 12, 64, 1, true);
        const abyssMat = new THREE.MeshBasicMaterial({
            color: 0x05070a,
            side: THREE.BackSide
        });
        const abyssMesh = new THREE.Mesh(abyssGeo, abyssMat);
        abyssMesh.position.y = -6;
        this.scene.add(abyssMesh);
    }

    /**
     * キャラクタースプライト用テクスチャの取得
     */
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

    /**
     * 影テクスチャ
     */
    getShadowTexture() {
        if (!this.textures.has('shadow')) {
            const canvas = this.spriteGen.getShadowCanvas();
            const tex = new THREE.CanvasTexture(canvas);
            this.textures.set('shadow', tex);
        }
        return this.textures.get('shadow');
    }

    /**
     * 手裏剣テクスチャ
     */
    getShurikenTexture() {
        if (!this.textures.has('shuriken')) {
            const canvas = this.spriteGen.getShurikenCanvas();
            const tex = new THREE.CanvasTexture(canvas);
            this.textures.set('shuriken', tex);
        }
        return this.textures.get('shuriken');
    }

    /**
     * 火炎テクスチャ
     */
    getFlameTexture() {
        if (!this.textures.has('flame')) {
            const canvas = this.spriteGen.getFlameParticleCanvas();
            const tex = new THREE.CanvasTexture(canvas);
            this.textures.set('flame', tex);
        }
        return this.textures.get('flame');
    }

    /**
     * 新しいラウンド開始時のビジュアル初期化
     */
    resetArenaVisuals(units) {
        // 既存ユニットメッシュの完全破棄
        for (const [id, visual] of this.unitVisuals.entries()) {
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

        // 既存エフェクトの破棄
        this.clearEffects();

        // 初期ユニットの3Dメッシュ生成
        units.forEach(u => this.addUnitVisual(u));
    }

    /**
     * 1ユニットの3D板ポリビジュアル生成
     */
    addUnitVisual(unit) {
        if (this.unitVisuals.has(unit.id)) return;

        const root = new THREE.Group();
        root.position.set(unit.x, 0, unit.z);

        const isDragon = unit.factionId === 'dragon';
        const polyWidth = isDragon ? 4.8 : 2.2 * unit.scale;
        const polyHeight = isDragon ? 4.8 : 2.2 * unit.scale;
        const bodyCenterY = polyHeight * 0.48;

        // 1. 板ポリゴン (PlaneGeometry)
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

        // 2. 足元ドロップシャドウ (Circle/Plane)
        const shadowRadius = unit.radius * (isDragon ? 1.6 : 1.2);
        const shadowGeo = new THREE.PlaneGeometry(shadowRadius * 2, shadowRadius * 2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: this.getShadowTexture(),
            transparent: true,
            opacity: 0.55,
            depthWrite: false
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.rotation.x = -Math.PI / 2;
        shadowMesh.position.y = 0.02;
        root.add(shadowMesh);

        // 3. 頭上HPバー
        const hpBarWidth = isDragon ? 3.0 : 1.4;
        const hpBarHeight = isDragon ? 0.25 : 0.16;
        const hpPosY = bodyCenterY + polyHeight * 0.52;

        // HPバー背景（黒枠）
        const hpBarGeo = new THREE.PlaneGeometry(hpBarWidth + 0.06, hpBarHeight + 0.04);
        const hpBarMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
        const hpBarMesh = new THREE.Mesh(hpBarGeo, hpBarMat);
        hpBarMesh.position.set(0, hpPosY, 0);

        // HPバー現在量ゲージ（緑〜赤）
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

    /**
     * ユニットの死亡ビジュアル処理（消滅パーティクル演出）
     */
    removeUnitVisual(unitId, factionId, x, z) {
        const visual = this.unitVisuals.get(unitId);
        if (!visual) return;

        // 死亡消滅パーティクル
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

    /**
     * 毎フレームの描画同期更新
     */
    syncUnits(units, dt) {
        const camQuat = this.camera.quaternion;

        for (const unit of units) {
            let visual = this.unitVisuals.get(unit.id);
            if (!visual && unit.alive) {
                // ゾンビ化や分裂で新登場したユニットを登録
                this.addUnitVisual(unit);
                visual = this.unitVisuals.get(unit.id);
            }
            if (!visual) continue;

            // 1. 位置同期（滑らかな補間またはダイレクト代入）
            visual.root.position.x = unit.x;
            visual.root.position.z = unit.z;

            // 2. 板ポリのビルボード化（常にカメラを正面に向ける）
            visual.bodyMesh.quaternion.copy(camQuat);
            visual.hpBarMesh.quaternion.copy(camQuat);

            // 3. 移動アニメーション（歩行時のピョコピョコ上下ボビングと左右の揺れ）
            visual.bobbingTimer += dt * (unit.spd * 2.5);
            const isMoving = Math.abs(unit.vx) > 0.1 || Math.abs(unit.vz) > 0.1;
            const bobOffset = isMoving ? Math.sin(visual.bobbingTimer) * 0.12 : 0;
            visual.bodyMesh.position.y = visual.bodyCenterY + bobOffset;

            // 4. 幽霊の霊体化（すり抜け）または吸血鬼のコウモリ化演出：半透明化
            if (unit.factionId === 'ghost') {
                visual.bodyMat.opacity = unit.isPhasing ? 0.28 : 0.95;
            } else if (unit.factionId === 'vampire') {
                visual.bodyMat.opacity = unit.isBat ? 0.40 : 1.0;
            }

            // 5. ロボの故障痙攣演出
            if (unit.factionId === 'robot' && unit.isGlitching) {
                visual.bodyMesh.position.x = (Math.random() - 0.5) * 0.15;
                if (Math.random() < 0.3) {
                    this.spawnGlitchSparks(unit.x, visual.bodyCenterY, unit.z);
                }
            } else if (unit.factionId === 'robot') {
                visual.bodyMesh.position.x = 0;
            }

            // 6. HPバーの更新
            const hpRatio = Math.max(0, unit.hp / unit.maxHp);
            visual.hpFillMesh.scale.x = hpRatio;
            // 左寄せにするためオフセット
            visual.hpFillMesh.position.x = (hpRatio - 1) * (visual.baseHpWidth * 0.5);

            // HP割合で色変化 (緑 -> 黄 -> 赤)
            if (hpRatio > 0.5) {
                visual.hpFillMat.color.setHex(0x2ecc71);
            } else if (hpRatio > 0.25) {
                visual.hpFillMat.color.setHex(0xf1c40f);
            } else {
                visual.hpFillMat.color.setHex(0xe74c3c);
            }

            // 万一HPが0以下または死亡フラグが立っている場合は即座に消去
            if (!unit.alive || unit.hp <= 0) {
                this.removeUnitVisual(unit.id, unit.factionId, unit.x, unit.z);
            }
        }
    }

    /**
     * イベントに応じた3D演出の発火
     */
    handleEvents(events) {
        for (const ev of events) {
            switch (ev.type) {
                case 'hit':
                    this.spawnHitSpark(ev.x, ev.z);
                    this.spawnDamagePopup(ev.x, ev.z, ev.damage);
                    break;
                case 'evade':
                    this.spawnDamagePopup(ev.x, ev.z, 'MISS', true);
                    break;
                case 'death':
                    this.removeUnitVisual(ev.unitId, ev.factionId, ev.x, ev.z);
                    break;
                case 'dragon_breath':
                    this.spawnDragonBreath(ev.origin.x, ev.origin.z, ev.angle, ev.range);
                    break;
                case 'ninja_shuriken':
                    this.spawnShurikenProjectile(ev.from, ev.to);
                    break;
                case 'ninja_teleport':
                    this.spawnSmokePuff(ev.from.x, ev.from.z);
                    this.spawnSmokePuff(ev.to.x, ev.to.z);
                    break;
                case 'zombie_infect':
                    this.spawnInfectAura(ev.x, ev.z);
                    break;
                case 'slime_split':
                    this.spawnSlimePuff(ev.x, ev.z);
                    break;
                case 'bomber_explode':
                    this.spawnExplosion(ev.x, ev.z, ev.radius || 3.0);
                    break;
                case 'giant_stomp':
                    this.spawnShockwave(ev.x, ev.z, ev.radius || 2.5);
                    break;
                case 'raiju_lightning':
                    this.spawnLightning(ev.points);
                    break;
                case 'mushroom_cloud':
                    this.spawnSporeCloud(ev.x, ev.z, ev.radius || 3.0);
                    break;
                case 'yukionna_frozen':
                    this.spawnIceBurst(ev.x, ev.z);
                    break;
                case 'cattle_stampede':
                case 'cattle_hit':
                    this.spawnDustPuff(ev.x, ev.z);
                    break;
                case 'samurai_iaido':
                    this.spawnSlashFlash(ev.x, ev.z);
                    break;
                case 'vampire_drain':
                    this.spawnDrainSparkles(ev.x, ev.z, ev.healAmount);
                    break;
            }
        }
    }

    /**
     * ダメージ数値のポップアップ（3Dスプライト）
     */
    spawnDamagePopup(x, z, text, isMiss = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.font = 'bold 36px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isMiss) {
            ctx.fillStyle = '#74b9ff';
            ctx.fillText(text, 64, 32);
        } else {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.strokeText(text, 64, 32);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, 64, 32);
        }

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 1.0 });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.8, 0.9, 1);
        sprite.position.set(x + (Math.random() - 0.5) * 0.6, 2.2, z + (Math.random() - 0.5) * 0.6);

        this.scene.add(sprite);
        this.damagePopups.push({
            sprite,
            tex,
            mat,
            age: 0,
            maxAge: 0.75,
            vy: 2.2
        });
    }

    /**
     * ヒットスパーク（打撃時の閃光）
     */
    spawnHitSpark(x, z) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            const geo = new THREE.PlaneGeometry(0.2, 0.2);
            const mat = new THREE.MeshBasicMaterial({ color: 0xfff200, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, 1.2, z);
            this.scene.add(mesh);

            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 3.5;
            this.particles.push({
                mesh,
                geo,
                mat,
                vx: Math.cos(angle) * speed,
                vy: (Math.random() - 0.2) * 3,
                vz: Math.sin(angle) * speed,
                age: 0,
                maxAge: 0.25
            });
        }
    }

    /**
     * ドラゴンの火炎放射ブレス（火炎パーティクル群）
     */
    spawnDragonBreath(x, z, angle, range) {
        const count = 18;
        const flameTex = this.getFlameTexture();

        for (let i = 0; i < count; i++) {
            const mat = new THREE.SpriteMaterial({
                map: flameTex,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(mat);
            const spread = (Math.random() - 0.5) * 0.6;
            const pAngle = angle + spread;
            const speed = 7.0 + Math.random() * 4.0;

            sprite.position.set(x + Math.cos(angle) * 1.2, 1.5, z + Math.sin(angle) * 1.2);
            const initScale = 0.6 + Math.random() * 0.4;
            sprite.scale.set(initScale, initScale, 1);

            this.scene.add(sprite);
            this.particles.push({
                sprite,
                mat,
                vx: Math.cos(pAngle) * speed,
                vy: (Math.random() - 0.3) * 1.2,
                vz: Math.sin(pAngle) * speed,
                scaleGrowth: 2.5,
                age: 0,
                maxAge: 0.45
            });
        }
    }

    /**
     * 手裏剣の飛翔弾
     */
    spawnShurikenProjectile(from, to) {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const dist = Math.sqrt(dx * dx + dz * dz) || 1;
        const speed = 14;
        const duration = dist / speed;

        const geo = new THREE.PlaneGeometry(0.65, 0.65);
        const mat = new THREE.MeshBasicMaterial({
            map: this.getShurikenTexture(),
            transparent: true,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(from.x, 1.3, from.z);
        this.scene.add(mesh);

        this.projectiles.push({
            mesh,
            geo,
            mat,
            from: { ...from, y: 1.3 },
            to: { ...to, y: 1.3 },
            age: 0,
            duration
        });
    }

    /**
     * 忍者の身代わり煙玉
     */
    spawnSmokePuff(x, z) {
        for (let i = 0; i < 8; i++) {
            const mat = new THREE.SpriteMaterial({
                color: 0x95a5a6,
                transparent: true,
                opacity: 0.7
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * 0.8, 1.0, z + (Math.random() - 0.5) * 0.8);
            sprite.scale.set(0.8, 0.8, 1);
            this.scene.add(sprite);

            this.particles.push({
                sprite,
                mat,
                vx: (Math.random() - 0.5) * 1.5,
                vy: 1.8 + Math.random() * 1.5,
                vz: (Math.random() - 0.5) * 1.5,
                scaleGrowth: 1.8,
                age: 0,
                maxAge: 0.4
            });
        }
    }

    /**
     * ゾンビ感染オーラ
     */
    spawnInfectAura(x, z) {
        for (let i = 0; i < 10; i++) {
            const mat = new THREE.SpriteMaterial({
                color: 0x2ecc71,
                transparent: true,
                opacity: 0.8
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * 0.6, 0.4, z + (Math.random() - 0.5) * 0.6);
            sprite.scale.set(0.4, 0.4, 1);
            this.scene.add(sprite);

            this.particles.push({
                sprite,
                mat,
                vx: (Math.random() - 0.5) * 1.2,
                vy: 2.5 + Math.random() * 1.5,
                vz: (Math.random() - 0.5) * 1.2,
                scaleGrowth: 0.8,
                age: 0,
                maxAge: 0.5
            });
        }
    }

    /**
     * スライム分裂ポップ
     */
    spawnSlimePuff(x, z) {
        for (let i = 0; i < 8; i++) {
            const mat = new THREE.SpriteMaterial({
                color: 0x9b59b6,
                transparent: true,
                opacity: 0.8
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x, 0.6, z);
            sprite.scale.set(0.5, 0.5, 1);
            this.scene.add(sprite);

            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                sprite,
                mat,
                vx: Math.cos(angle) * 3,
                vy: 2.0,
                vz: Math.sin(angle) * 3,
                scaleGrowth: 0.5,
                age: 0,
                maxAge: 0.35
            });
        }
    }

    /**
     * ロボ故障スパーク
     */
    spawnGlitchSparks(x, y, z) {
        const mat = new THREE.SpriteMaterial({
            color: 0x00d2d3,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(x + (Math.random() - 0.5) * 0.6, y + (Math.random() - 0.5) * 0.6, z + (Math.random() - 0.5) * 0.6);
        sprite.scale.set(0.3, 0.3, 1);
        this.scene.add(sprite);

        this.particles.push({
            sprite,
            mat,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            vz: (Math.random() - 0.5) * 3,
            scaleGrowth: 0,
            age: 0,
            maxAge: 0.15
        });
    }

    /**
     * 死亡消滅パーティクル
     */
    spawnDeathParticles(x, z, colorInt) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const mat = new THREE.SpriteMaterial({
                color: colorInt,
                transparent: true,
                opacity: 0.85
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * 0.5, 0.8, z + (Math.random() - 0.5) * 0.5);
            sprite.scale.set(0.35, 0.35, 1);
            this.scene.add(sprite);

            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 2.5;
            this.particles.push({
                sprite,
                mat,
                vx: Math.cos(angle) * speed,
                vy: 1.5 + Math.random() * 2.5,
                vz: Math.sin(angle) * speed,
                scaleGrowth: -0.4,
                age: 0,
                maxAge: 0.6
            });
        }
    }

    /**
     * 爆弾魔の特大大爆発エフェクト
     */
    spawnExplosion(x, z, radius) {
        const count = 28;
        const colors = [0xff4757, 0xffa502, 0x2f3542, 0xffffff];
        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mat = new THREE.SpriteMaterial({
                color,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * 0.8, 1.2, z + (Math.random() - 0.5) * 0.8);
            const scale = 0.8 + Math.random() * 1.2;
            sprite.scale.set(scale, scale, 1);
            this.scene.add(sprite);

            const angle = Math.random() * Math.PI * 2;
            const speed = 4.0 + Math.random() * 7.0;
            this.particles.push({
                sprite,
                mat,
                vx: Math.cos(angle) * speed,
                vy: 2.0 + Math.random() * 6.0,
                vz: Math.sin(angle) * speed,
                scaleGrowth: 2.0,
                age: 0,
                maxAge: 0.55
            });
        }
    }

    /**
     * 巨人の踏みつけ衝撃波
     */
    spawnShockwave(x, z, radius) {
        const geo = new THREE.RingGeometry(0.2, 0.6, 24);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.08, z);
        this.scene.add(mesh);

        this.particles.push({
            mesh,
            geo,
            mat,
            vx: 0,
            vy: 0,
            vz: 0,
            scaleGrowth: radius * 3.5,
            age: 0,
            maxAge: 0.4
        });
    }

    /**
     * 雷獣の連鎖放電ライン
     */
    spawnLightning(points) {
        if (!points || points.length < 1) return;
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            for (let j = 0; j < 6; j++) {
                const mat = new THREE.SpriteMaterial({
                    color: 0x00d2d3,
                    transparent: true,
                    opacity: 1.0,
                    blending: THREE.AdditiveBlending
                });
                const sprite = new THREE.Sprite(mat);
                sprite.position.set(p.x + (Math.random() - 0.5) * 0.8, 1.2 + (Math.random() - 0.5) * 0.8, p.z + (Math.random() - 0.5) * 0.8);
                sprite.scale.set(0.6, 0.6, 1);
                this.scene.add(sprite);

                this.particles.push({
                    sprite,
                    mat,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    vz: (Math.random() - 0.5) * 2,
                    scaleGrowth: -0.5,
                    age: 0,
                    maxAge: 0.25
                });
            }
        }
    }

    /**
     * キノコの胞子雲
     */
    spawnSporeCloud(x, z, radius) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const mat = new THREE.SpriteMaterial({
                color: 0xa29bfe,
                transparent: true,
                opacity: 0.75
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * radius, 0.8 + Math.random() * 1.5, z + (Math.random() - 0.5) * radius);
            sprite.scale.set(0.9, 0.9, 1);
            this.scene.add(sprite);

            this.particles.push({
                sprite,
                mat,
                vx: (Math.random() - 0.5) * 0.8,
                vy: 0.5 + Math.random() * 0.8,
                vz: (Math.random() - 0.5) * 0.8,
                scaleGrowth: 1.2,
                age: 0,
                maxAge: 1.2
            });
        }
    }

    /**
     * 雪女の氷結エフェクト
     */
    spawnIceBurst(x, z) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const mat = new THREE.SpriteMaterial({
                color: 0x81ecec,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 1.2, z + (Math.random() - 0.5) * 0.6);
            sprite.scale.set(0.5, 0.5, 1);
            this.scene.add(sprite);

            this.particles.push({
                sprite,
                mat,
                vx: (Math.random() - 0.5) * 1.5,
                vy: 1.2 + Math.random() * 1.5,
                vz: (Math.random() - 0.5) * 1.5,
                scaleGrowth: -0.2,
                age: 0,
                maxAge: 0.5
            });
        }
    }

    /**
     * 闘牛突進の土煙
     */
    spawnDustPuff(x, z) {
        for (let i = 0; i < 6; i++) {
            const mat = new THREE.SpriteMaterial({
                color: 0xa4b0be,
                transparent: true,
                opacity: 0.6
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * 0.6, 0.3, z + (Math.random() - 0.5) * 0.6);
            sprite.scale.set(0.7, 0.7, 1);
            this.scene.add(sprite);

            this.particles.push({
                sprite,
                mat,
                vx: (Math.random() - 0.5) * 1.5,
                vy: 0.8 + Math.random() * 0.8,
                vz: (Math.random() - 0.5) * 1.5,
                scaleGrowth: 1.2,
                age: 0,
                maxAge: 0.4
            });
        }
    }

    /**
     * サムライの居合一閃光
     */
    spawnSlashFlash(x, z) {
        const mat = new THREE.SpriteMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(x, 1.2, z);
        sprite.scale.set(2.5, 2.5, 1);
        this.scene.add(sprite);

        this.particles.push({
            sprite,
            mat,
            vx: 0,
            vy: 0,
            vz: 0,
            scaleGrowth: -2.0,
            age: 0,
            maxAge: 0.18
        });
    }

    /**
     * 吸血鬼のドレイン粒子
     */
    spawnDrainSparkles(x, z, healAmount) {
        for (let i = 0; i < 8; i++) {
            const mat = new THREE.SpriteMaterial({
                color: 0x2ed573,
                transparent: true,
                opacity: 0.85
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x + (Math.random() - 0.5) * 0.6, 0.5, z + (Math.random() - 0.5) * 0.6);
            sprite.scale.set(0.3, 0.3, 1);
            this.scene.add(sprite);

            this.particles.push({
                sprite,
                mat,
                vx: (Math.random() - 0.5) * 0.8,
                vy: 1.8 + Math.random() * 1.2,
                vz: (Math.random() - 0.5) * 0.8,
                scaleGrowth: -0.1,
                age: 0,
                maxAge: 0.4
            });
        }
    }

    /**
     * パーティクル・弾丸・ポップアップの更新
     */
    updateEffects(dt) {
        // 1. ダメージポップアップ
        for (let i = this.damagePopups.length - 1; i >= 0; i--) {
            const dp = this.damagePopups[i];
            dp.age += dt;
            dp.sprite.position.y += dp.vy * dt;
            dp.mat.opacity = Math.max(0, 1 - (dp.age / dp.maxAge));

            if (dp.age >= dp.maxAge) {
                this.scene.remove(dp.sprite);
                dp.tex.dispose();
                dp.mat.dispose();
                this.damagePopups.splice(i, 1);
            }
        }

        // 2. 弾丸（手裏剣等）
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.age += dt;
            const t = Math.min(1, p.age / p.duration);
            p.mesh.position.x = p.from.x + (p.to.x - p.from.x) * t;
            p.mesh.position.z = p.from.z + (p.to.z - p.from.z) * t;
            p.mesh.rotation.z += dt * 25; // 高速回転

            if (t >= 1) {
                this.scene.remove(p.mesh);
                p.geo.dispose();
                p.mat.dispose();
                this.projectiles.splice(i, 1);
            }
        }

        // 3. パーティクル
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.age += dt;
            const t = pt.age / pt.maxAge;

            if (pt.sprite) {
                pt.sprite.position.x += pt.vx * dt;
                pt.sprite.position.y += pt.vy * dt;
                pt.sprite.position.z += pt.vz * dt;
                pt.mat.opacity = (1 - t) * 0.9;
                if (pt.scaleGrowth) {
                    const currentScale = pt.sprite.scale.x + pt.scaleGrowth * dt;
                    pt.sprite.scale.set(currentScale, currentScale, 1);
                }
            } else if (pt.mesh) {
                pt.mesh.position.x += pt.vx * dt;
                pt.mesh.position.y += pt.vy * dt;
                pt.mesh.position.z += pt.vz * dt;
                pt.mat.opacity = 1 - t;
            }

            if (pt.age >= pt.maxAge) {
                if (pt.sprite) {
                    this.scene.remove(pt.sprite);
                    pt.mat.dispose();
                } else if (pt.mesh) {
                    this.scene.remove(pt.mesh);
                    pt.geo.dispose();
                    pt.mat.dispose();
                }
                this.particles.splice(i, 1);
            }
        }

        // 4. 松明の揺らめき演出
        if (this.torches) {
            const time = performance.now() * 0.005;
            this.torches.forEach((t, idx) => {
                t.light.intensity = t.baseIntensity + Math.sin(time + idx) * 0.15;
            });
        }
    }

    clearEffects() {
        this.damagePopups.forEach(dp => {
            this.scene.remove(dp.sprite);
            dp.tex.dispose();
            dp.mat.dispose();
        });
        this.damagePopups = [];

        this.projectiles.forEach(p => {
            this.scene.remove(p.mesh);
            p.geo.dispose();
            p.mat.dispose();
        });
        this.projectiles = [];

        this.particles.forEach(pt => {
            if (pt.sprite) {
                this.scene.remove(pt.sprite);
                pt.mat.dispose();
            } else if (pt.mesh) {
                this.scene.remove(pt.mesh);
                pt.geo.dispose();
                pt.mat.dispose();
            }
        });
        this.particles = [];
    }

    /**
     * カメラをデフォルトの斜め見下ろし位置にリセット
     */
    resetCamera() {
        if (this.controls) {
            this.controls.reset();
            this.camera.position.copy(this.defaultCameraPos);
            this.controls.target.copy(this.defaultCameraLookAt);
        }
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * レンダリングループ実行
     */
    render() {
        if (this.controls) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
}
