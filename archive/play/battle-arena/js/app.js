/**
 * バトルアリーナ メインアプリケーションコントローラー
 * 予想フェーズ (BETTING) -> 戦闘フェーズ (BATTLE) -> 結果フェーズ (RESULT) のフローを制御する。
 */

import { BattleEngine, FACTIONS, calculateOdds } from './simulation.js';
import { SpriteGenerator } from './sprites.js';
import { BattleRenderer } from './renderer.js';
import { SoundManager } from './audio.js';
import { PreviewPlayer } from './preview.js?v=20260930_4';

class BattleApp {
    constructor() {
        this.engine = new BattleEngine(26);
        this.spriteGen = new SpriteGenerator();
        this.sound = new SoundManager();

        this.renderer = null;
        this.previewPlayer = null;
        this.currentRound = 1;
        this.speedMultiplier = 1.0;
        this.isPaused = false;
        this.autoNextRound = false;

        // フェーズ管理: 'BETTING' (予想中) | 'BATTLE' (戦闘中) | 'RESULT' (決着・結果)
        this.phase = 'BETTING';

        // 賭け・コイン管理
        this.playerCoins = 1000;
        this.selectedBetFaction = null;
        this.betAmount = 100;
        this.currentOdds = {};
        this.initialCounts = {};

        // カウントダウンタイマー
        this.countdownRemaining = 0;
        this.countdownInterval = null;

        // UI要素キャッシュ
        this.ui = {
            roundNumber: document.getElementById('round-number'),
            phaseBadge: document.getElementById('phase-badge'),
            aliveTotal: document.getElementById('alive-total'),
            elapsedTime: document.getElementById('elapsed-time'),
            factionsContainer: document.getElementById('factions-container'),
            combatLog: document.getElementById('combat-log'),
            winnerModal: document.getElementById('winner-modal'),
            winnerTitle: document.getElementById('winner-title'),
            winnerSubtitle: document.getElementById('winner-subtitle'),
            winnerStats: document.getElementById('winner-stats'),
            btnNextRound: document.getElementById('btn-next-round'),
            btnReroll: document.getElementById('btn-reroll'),
            btnResetCam: document.getElementById('btn-reset-cam'),
            btnSoundToggle: document.getElementById('btn-sound-toggle'),
            speedButtons: document.querySelectorAll('.btn-speed'),
            autoPlayCheckbox: document.getElementById('auto-play-checkbox'),
            playerCoins: document.getElementById('player-coins'),
            // 予想フェーズ専用UI
            bettingActionBar: document.getElementById('betting-action-bar'),
            betGuideText: document.getElementById('bet-guide-text'),
            btnStartBattle: document.getElementById('btn-start-battle'),
            countdownText: document.getElementById('countdown-text'),
            betAmountButtons: document.querySelectorAll('.btn-amount'),
            // 全画面キャラクター図鑑UI
            btnOpenEncyclopedia: document.getElementById('btn-open-encyclopedia'),
            btnCloseEncyclopedia: document.getElementById('btn-close-encyclopedia'),
            encyclopediaFullscreen: document.getElementById('encyclopedia-fullscreen'),
            encyclopediaIconGrid: document.getElementById('encyclopedia-icon-grid'),
            encyclopediaDetailView: document.getElementById('encyclopedia-detail-view'),
            encyColStatus: document.getElementById('ency-col-status'),
            encyColAbility: document.getElementById('ency-col-ability'),
            btnPreviewReplay: document.getElementById('btn-preview-replay'),
            btnPreviewToggle: document.getElementById('btn-preview-toggle'),
            previewToggleText: document.getElementById('preview-toggle-text'),
            encyCategoryTabs: document.getElementById('ency-category-tabs')
        };

        this.lastFrameTime = performance.now();
        this.simAccumulator = 0;
        this.logCount = 0;

        this.init();
    }

    init() {
        // 3Dレンダラーの初期化
        const container = document.getElementById('canvas-container');
        this.renderer = new BattleRenderer(container, this.spriteGen);

        // UIイベントのバインド
        this.bindEvents();

        // キャラクター図鑑の初期構築
        this.initEncyclopedia();

        // 最初のラウンドの予想フェーズを準備
        this.prepareRound();

        // メイン描画ループ始動
        requestAnimationFrame((t) => this.loop(t));
    }

    bindEvents() {
        // 全画面キャラクター図鑑の開閉イベント
        this.ui.btnOpenEncyclopedia.addEventListener('click', () => {
            this.sound.init();
            this.sound.playBetSelect();
            this.openEncyclopedia();
        });

        this.ui.btnCloseEncyclopedia.addEventListener('click', () => {
            this.sound.init();
            this.closeEncyclopedia();
        });

        // Escキーで全画面図鑑を閉じる
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.ui.encyclopediaFullscreen.classList.contains('active')) {
                this.closeEncyclopedia();
            }
        });

        // 速度ボタン
        this.ui.speedButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.speedButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const speed = parseFloat(btn.dataset.speed);
                if (speed === 0) {
                    this.isPaused = true;
                } else {
                    this.isPaused = false;
                    this.speedMultiplier = speed;
                }
            });
        });

        // カメラリセット
        this.ui.btnResetCam.addEventListener('click', () => {
            this.renderer.resetCamera();
        });

        // サウンド切り替え
        this.ui.btnSoundToggle.addEventListener('click', () => {
            this.sound.init();
            const isMuted = this.sound.toggleMute();
            const iconSvg = isMuted ? 
                '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>' :
                '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
            this.ui.btnSoundToggle.querySelector('svg').innerHTML = iconSvg;
        });

        // リロール（新しい対決を抽選）
        this.ui.btnReroll.addEventListener('click', () => {
            this.clearCountdown();
            this.prepareRound();
        });

        // 戦闘開始ボタン
        this.ui.btnStartBattle.addEventListener('click', () => {
            if (this.phase === 'BETTING') {
                this.startBattle();
            }
        });

        // 賭け金選択ボタン
        this.ui.betAmountButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.betAmountButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const amt = btn.dataset.amount;
                if (amt === 'ALL') {
                    this.betAmount = Math.max(10, this.playerCoins);
                } else {
                    this.betAmount = parseInt(amt, 10);
                }
                this.updateBetGuide();
            });
        });

        // 次のラウンドへボタン
        this.ui.btnNextRound.addEventListener('click', () => {
            this.ui.winnerModal.classList.remove('active');
            this.currentRound++;
            this.prepareRound();
        });

        // オートプレイトグル
        this.ui.autoPlayCheckbox.addEventListener('change', (e) => {
            this.autoNextRound = e.target.checked;
            if (this.phase === 'BETTING' && this.autoNextRound) {
                this.startCountdown(5);
            } else if (!this.autoNextRound) {
                this.clearCountdown();
            }
        });

        // 画面クリックでオーディオ初期化
        window.addEventListener('click', () => {
            this.sound.init();
        }, { once: true });
    }

    /**
     * ラウンドの準備（予想フェーズの開始）
     * 勢力と人数を決定し、ユニットを初期位置に配置してオッズを事前計算する。
     */
    prepareRound() {
        this.phase = 'BETTING';
        this.ui.winnerModal.classList.remove('active');
        this.clearCountdown();

        // 予想ステート初期化
        this.selectedBetFaction = null;

        // UIのフェーズバッジを「予想受付中」に
        this.ui.phaseBadge.className = 'phase-badge phase-betting';
        this.ui.phaseBadge.textContent = '予想受付中';
        this.ui.bettingActionBar.classList.remove('in-battle');
        this.ui.roundNumber.textContent = this.currentRound;

        // 勢力と人数の初期化（2〜5勢力、ランダム）
        const roundData = this.engine.initRound();
        this.initialCounts = { ...roundData.counts };

        // 3Dアリーナの再構築・ユニット初期配置（まだ戦わず待機）
        this.renderer.resetArenaVisuals(this.engine.units);

        // 高速シミュレーション（100回）による各勢力オッズの事前自動計算
        const oddsResult = calculateOdds(roundData.factions, roundData.counts, 100);
        this.currentOdds = oddsResult.odds;

        // UI表示の構築（オッズ・人数の反映）
        this.renderFactionCards(roundData.factions);
        this.updateBetGuide();

        // 初期ステータス表示
        const totalUnits = this.engine.units.length;
        this.ui.aliveTotal.textContent = totalUnits;
        this.ui.elapsedTime.textContent = '0.0s';

        // ログ出力
        this.clearLog();
        const factionNames = roundData.factions.map(f => `${FACTIONS[f].name}(${this.initialCounts[f]}体/x${this.currentOdds[f]})`).join(' vs ');
        this.appendLog(`第 ${this.currentRound} ラウンド 【予想受付中】: ${factionNames}`);

        // オートプレイが有効なら5秒カウントダウン後に自動開始
        if (this.autoNextRound) {
            this.startCountdown(5);
        }
    }

    /**
     * 勢力ステータスカードの構築（オッズ表示付き）
     */
    renderFactionCards(factions) {
        this.ui.factionsContainer.innerHTML = '';

        factions.forEach(fId => {
            const fac = FACTIONS[fId];
            const count = this.initialCounts[fId] || 0;
            const odds = this.currentOdds[fId] || 2.0;

            const card = document.createElement('div');
            card.className = `faction-card faction-${fId}`;
            card.dataset.factionId = fId;
            card.style.setProperty('--fac-color', fac.color);
            card.title = `クリックで【${fac.name}】の図鑑・能力詳細・実戦プレビューを開く`;

            card.innerHTML = `
                <div class="faction-card-header">
                    <div class="faction-indicator" style="background-color: ${fac.color};"></div>
                    <span class="faction-name">${fac.name}</span>
                    <span class="faction-ency-hint">
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <span>図鑑</span>
                    </span>
                    <div class="faction-header-right">
                        <span class="faction-odds-badge" title="配当倍率">x${odds.toFixed(1)}</span>
                        <span class="faction-count" id="count-${fId}">${count}</span>
                    </div>
                </div>
                <div class="faction-progress-bar">
                    <div class="faction-progress-fill" id="fill-${fId}" style="width: 100%; background-color: ${fac.color};"></div>
                </div>
                <div class="faction-info">
                    <span class="faction-ability-tag">${fac.ability.split(' ')[0]}</span>
                    <button class="btn-bet" data-faction="${fId}">予想する</button>
                </div>
            `;

            // カード本体クリックでそのキャラの全画面図鑑を開く
            card.addEventListener('click', (e) => {
                // 「予想する」ボタンのクリック時は図鑑を開かない
                if (e.target.closest('.btn-bet')) {
                    return;
                }
                this.sound.init();
                this.sound.playBetSelect();
                this.openEncyclopedia(fId);
            });

            // 予想ボタンのイベント
            const btnBet = card.querySelector('.btn-bet');
            btnBet.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.phase === 'BETTING') {
                    this.selectBet(fId);
                }
            });

            this.ui.factionsContainer.appendChild(card);
        });
    }

    /**
     * 賭け（予想）の選択
     */
    selectBet(fId) {
        this.sound.playBetSelect();
        this.selectedBetFaction = fId;

        // 全カードの見た目更新
        const allCards = this.ui.factionsContainer.querySelectorAll('.faction-card');
        allCards.forEach(card => {
            const cardFId = card.dataset.factionId;
            const btn = card.querySelector('.btn-bet');

            if (cardFId === fId) {
                card.classList.add('selected-bet');
                btn.classList.add('selected');
                btn.textContent = '予想中';
            } else {
                card.classList.remove('selected-bet');
                btn.classList.remove('selected');
                btn.textContent = '予想する';
            }
        });

        this.updateBetGuide();
        const fac = FACTIONS[fId];
        const odds = this.currentOdds[fId];
        this.appendLog(`【予想】「${fac.name}」(オッズ x${odds.toFixed(1)}) に ${this.betAmount} コインを賭けました！`);
    }

    /**
     * ガイドテキストと払戻見込みの更新
     */
    updateBetGuide() {
        if (!this.selectedBetFaction) {
            this.ui.betGuideText.innerHTML = '勝利する勢力を選択して「戦闘開始」を押してください';
        } else {
            const fac = FACTIONS[this.selectedBetFaction];
            const odds = this.currentOdds[this.selectedBetFaction] || 1.0;
            const payout = Math.round(this.betAmount * odds);
            this.ui.betGuideText.innerHTML = `予想: <span class="highlight-faction">${fac.name}</span> (x${odds.toFixed(1)}) ｜ 的中時配当: <span class="highlight-faction">${payout}</span> コイン`;
        }
    }

    /**
     * カウントダウンの開始（オート進行時）
     */
    startCountdown(seconds) {
        this.clearCountdown();
        this.countdownRemaining = seconds;
        this.ui.countdownText.textContent = `自動開戦まで: ${this.countdownRemaining}s`;

        this.countdownInterval = setInterval(() => {
            this.countdownRemaining--;
            if (this.countdownRemaining <= 0) {
                this.clearCountdown();
                if (this.phase === 'BETTING') {
                    this.startBattle();
                }
            } else {
                this.ui.countdownText.textContent = `自動開戦まで: ${this.countdownRemaining}s`;
            }
        }, 1000);
    }

    clearCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.ui.countdownText.textContent = '';
    }

    /**
     * 戦闘フェーズ (BATTLE) への移行
     */
    startBattle() {
        this.clearCountdown();
        this.phase = 'BATTLE';

        // 開戦効果音（重厚なゴング音）
        this.sound.playBattleStart();

        // 賭け金の処理
        if (this.selectedBetFaction) {
            if (this.playerCoins >= this.betAmount) {
                this.playerCoins -= this.betAmount;
            } else {
                this.betAmount = this.playerCoins;
                this.playerCoins = 0;
            }
            this.ui.playerCoins.textContent = this.playerCoins;
        }

        // UI表示の更新
        this.ui.phaseBadge.className = 'phase-badge phase-battle';
        this.ui.phaseBadge.textContent = '戦闘中';
        this.ui.bettingActionBar.classList.add('in-battle');

        // 予想ボタンのロック
        const allBetBtns = this.ui.factionsContainer.querySelectorAll('.btn-bet');
        allBetBtns.forEach(btn => {
            btn.style.pointerEvents = 'none';
        });

        this.appendLog('【開戦】銅鑼が鳴り響き、全勢力が突撃を開始しました！');
    }

    /**
     * メインループ (シミュレーション + レンダリング)
     */
    loop(currentTime) {
        requestAnimationFrame((t) => this.loop(t));

        const delta = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = currentTime;

        // 戦闘フェーズ中のみシミュレーションを前進させる
        if (this.phase === 'BATTLE' && !this.isPaused && !this.engine.isFinished) {
            const simDt = 1 / 60;
            const effectiveDt = delta * this.speedMultiplier;
            this.simAccumulator += effectiveDt;

            while (this.simAccumulator >= simDt) {
                const events = this.engine.update(simDt);
                this.simAccumulator -= simDt;

                // イベント処理（効果音と3D演出）
                this.handleEngineEvents(events);

                if (this.engine.isFinished) break;
            }

            // UIのリアルタイム数値更新
            this.updateLiveUI();
        }

        // 3Dレンダラーの更新 (板ポリ同期・パーティクル・カメラ)
        this.renderer.syncUnits(this.engine.units, delta);
        this.renderer.updateEffects(delta);
        this.renderer.render();

        // 決着判定
        if (this.phase === 'BATTLE' && this.engine.isFinished && !this.ui.winnerModal.classList.contains('active')) {
            this.handleRoundFinish();
        }
    }

    /**
     * シミュレーションイベントに応じた演出・効果音
     */
    handleEngineEvents(events) {
        if (!events || events.length === 0) return;

        this.renderer.handleEvents(events);

        let playedSlash = false;
        let playedHit = false;

        for (const ev of events) {
            switch (ev.type) {
                case 'melee_attack':
                    if (!playedSlash) {
                        this.sound.playSlash();
                        playedSlash = true;
                    }
                    break;
                case 'hit':
                    if (!playedHit) {
                        this.sound.playHit();
                        playedHit = true;
                    }
                    break;
                case 'dragon_breath':
                    this.sound.playDragonBreath();
                    this.appendLog('ドラゴンの灼熱の火炎ブレスが炸裂！');
                    break;
                case 'ninja_shuriken':
                    this.sound.playShuriken();
                    break;
                case 'ninja_teleport':
                    this.sound.playShuriken();
                    this.appendLog('忍者が空蝉の術で背後に瞬間移動！');
                    break;
                case 'zombie_infect':
                    this.sound.playInfect();
                    this.appendLog('倒れた戦士がゾンビに感染して復活！');
                    break;
                case 'slime_split':
                    this.sound.playSplit();
                    this.appendLog('スライムが2体に分裂！');
                    break;
                case 'robot_glitch':
                    this.sound.playGlitch();
                    this.appendLog('ロボが過負荷で一時ショート故障！');
                    break;
                case 'bomber_explode':
                    this.sound.playExplosion();
                    this.appendLog('爆弾魔が敵味方巻き込む大自爆を敢行！');
                    break;
                case 'giant_stomp':
                    this.sound.playStomp();
                    this.appendLog('巨人の大地を揺るがす踏みつけが炸裂！');
                    break;
                case 'raiju_lightning':
                    this.sound.playLightning();
                    this.appendLog('雷獣の高圧連鎖稲妻が駆け巡る！');
                    break;
                case 'yukionna_frozen':
                    this.sound.playFreeze();
                    this.appendLog('雪女の冷気で敵が完全に氷結！');
                    break;
                case 'cattle_stampede':
                    this.sound.playStampede();
                    this.appendLog('牛の群れが怒涛のスタンピード突進！');
                    break;
                case 'samurai_iaido':
                    this.sound.playIaido();
                    this.appendLog('サムライの神速居合一閃が炸裂！');
                    break;
                case 'cat_revive':
                    this.appendLog('猫が九つの命で奇跡の復活！');
                    break;
                case 'clown_swap':
                    this.appendLog('ピエロが入れ替わりの奇術で位置を交換！');
                    break;
                case 'vampire_bat_start':
                    this.appendLog('吸血鬼が窮地を脱するためコウモリに変身！');
                    break;
            }
        }
    }

    /**
     * 生存数・HPバーのリアルタイム更新
     */
    updateLiveUI() {
        const counts = this.engine.getFactionCounts();
        let totalAlive = 0;

        for (const fId of this.engine.activeFactionIds) {
            const count = counts[fId] || 0;
            totalAlive += count;

            const countEl = document.getElementById(`count-${fId}`);
            const fillEl = document.getElementById(`fill-${fId}`);
            if (countEl) countEl.textContent = count;

            if (fillEl && this.initialCounts && this.initialCounts[fId]) {
                const ratio = Math.min(100, Math.max(0, (count / this.initialCounts[fId]) * 100));
                fillEl.style.width = `${ratio}%`;
            }

            // 全滅した勢力カードを半透明化
            const card = document.querySelector(`.faction-card[data-faction-id="${fId}"]`);
            if (card) {
                if (count === 0) {
                    card.classList.add('eliminated');
                } else {
                    card.classList.remove('eliminated');
                }
            }
        }

        this.ui.aliveTotal.textContent = totalAlive;
        this.ui.elapsedTime.textContent = `${this.engine.elapsedTime.toFixed(1)}s`;
    }

    /**
     * ラウンド決着時の処理
     */
    handleRoundFinish() {
        this.phase = 'RESULT';
        this.sound.playVictory();

        const winnerId = this.engine.winnerFactionId;
        const winner = winnerId ? FACTIONS[winnerId] : null;

        let betResultHtml = '';

        if (winner) {
            this.ui.winnerTitle.textContent = `${winner.name} の勝利！`;
            this.ui.winnerTitle.style.color = winner.color;
            this.ui.winnerSubtitle.textContent = `決着タイム: ${this.engine.elapsedTime.toFixed(1)} 秒`;
            this.appendLog(`【決着】第 ${this.currentRound} ラウンドは「${winner.name}」が制しました！`);

            // 予想の判定と配当受け取り
            if (this.selectedBetFaction) {
                if (this.selectedBetFaction === winnerId) {
                    const odds = this.currentOdds[winnerId] || 1.0;
                    const payout = Math.round(this.betAmount * odds);
                    this.playerCoins += payout;
                    this.sound.playCoinPayout();
                    betResultHtml = `<div class="bet-result-box win">予想的中！ 配当 +${payout} コイン (x${odds.toFixed(1)})</div>`;
                    this.appendLog(`予想的中！ 配当 ${payout} コインを獲得しました！`);
                } else {
                    const chosen = FACTIONS[this.selectedBetFaction];
                    betResultHtml = `<div class="bet-result-box lose">予想失敗… (${chosen ? chosen.name : ''}は敗北)</div>`;
                    this.appendLog(`予想は外れました…`);
                }
                this.ui.playerCoins.textContent = this.playerCoins;
            }
        } else {
            this.ui.winnerTitle.textContent = '引き分け（相打ち）';
            this.ui.winnerTitle.style.color = '#bdc3c7';
            this.ui.winnerSubtitle.textContent = '全勢力が全滅しました';
            this.appendLog(`【決着】相打ちとなり引き分けました。`);
            // 引き分け時は賭け金を返還
            if (this.selectedBetFaction) {
                this.playerCoins += this.betAmount;
                this.ui.playerCoins.textContent = this.playerCoins;
                betResultHtml = `<div class="bet-result-box draw">引き分けのため賭け金 ${this.betAmount} コインが返還されました</div>`;
            }
        }

        // MVP・リーダーボード
        const topUnits = this.engine.getLeaderboard();
        let statsHtml = betResultHtml;
        statsHtml += '<div class="mvp-list"><div class="mvp-header">戦闘功績ランキング</div>';
        topUnits.slice(0, 3).forEach((u, idx) => {
            const f = FACTIONS[u.factionId];
            statsHtml += `
                <div class="mvp-row">
                    <span class="mvp-rank">#${idx + 1}</span>
                    <span class="mvp-faction" style="color: ${f.color};">${f.name}</span>
                    <span class="mvp-kills">${u.kills} キル</span>
                    <span class="mvp-dmg">${u.damageDealt} 与ダメ</span>
                </div>
            `;
        });
        statsHtml += '</div>';
        this.ui.winnerStats.innerHTML = statsHtml;

        // モーダル表示
        this.ui.winnerModal.classList.add('active');

        // オートプレイが有効なら3.5秒後に自動で次へ
        if (this.autoNextRound) {
            setTimeout(() => {
                if (this.phase === 'RESULT' && this.autoNextRound) {
                    this.ui.winnerModal.classList.remove('active');
                    this.currentRound++;
                    this.prepareRound();
                }
            }, 3500);
        }
    }

    appendLog(text) {
        const item = document.createElement('div');
        item.className = 'log-item';
        item.textContent = `[${this.engine.elapsedTime.toFixed(1)}s] ${text}`;
        this.ui.combatLog.prepend(item);

        this.logCount++;
        if (this.logCount > 20) {
            const last = this.ui.combatLog.lastElementChild;
            if (last) last.remove();
        }
    }

    clearLog() {
        this.ui.combatLog.innerHTML = '';
        this.logCount = 0;
    }

    /**
     * 全画面キャラクター図鑑を開く
     * @param {string|null} targetFactionId 直接開きたい勢力ID（指定があればそのキャラを直接選択表示）
     */
    openEncyclopedia(targetFactionId = null) {
        this.ui.encyclopediaFullscreen.classList.add('active');

        // 指定勢力がある場合は、カテゴリタブを「すべて (all)」にリセットし、対象キャラを直接表示
        if (targetFactionId && FACTIONS[targetFactionId]) {
            if (this.ui.encyCategoryTabs) {
                const tabs = this.ui.encyCategoryTabs.querySelectorAll('.btn-ency-tab');
                tabs.forEach(t => {
                    if (t.dataset.category === 'all') {
                        t.classList.add('active');
                    } else {
                        t.classList.remove('active');
                    }
                });
            }
            this.selectedEncyclopediaFactionId = targetFactionId;
            this.renderEncyclopediaIcons('all');
            this.showEncyclopediaCharacter(targetFactionId);

            // 横スクロールバーの対象アイコン位置へスムーズスクロール
            setTimeout(() => {
                const activeCard = this.ui.encyclopediaIconGrid.querySelector(`.ency-icon-card[data-faction-id="${targetFactionId}"]`);
                if (activeCard) {
                    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }, 60);
        }

        if (this.previewPlayer) {
            this.previewPlayer.start();
            this.previewPlayer.onResize();
            if (targetFactionId && FACTIONS[targetFactionId]) {
                this.previewPlayer.playScenario(targetFactionId);
            }
        }
    }

    /**
     * 全画面キャラクター図鑑を閉じる
     */
    closeEncyclopedia() {
        this.ui.encyclopediaFullscreen.classList.remove('active');
        if (this.previewPlayer) {
            this.previewPlayer.stop();
        }
    }

    /**
     * キャラクター図鑑の初期化 (全23勢力アイコンカードの生成 ＆ プレビュープレイヤー生成 ＆ カテゴリフィルタ)
     */
    initEncyclopedia() {
        this.selectedEncyclopediaFactionId = 'human';
        this.currentEncyclopediaCategory = 'all';

        // カテゴリタブのイベントバインド
        if (this.ui.encyCategoryTabs) {
            const tabs = this.ui.encyCategoryTabs.querySelectorAll('.btn-ency-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.sound.playBetSelect();
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const category = tab.dataset.category || 'all';
                    this.renderEncyclopediaIcons(category);
                });
            });
        }

        // 実戦アクションプレビュープレイヤーの初期化
        const previewContainer = document.getElementById('ency-preview-viewport');
        const previewCaption = document.getElementById('ency-preview-caption');
        if (previewContainer && previewCaption) {
            this.previewPlayer = new PreviewPlayer(previewContainer, previewCaption, this.spriteGen, this.sound);
        }

        // プレビュー操作ボタンのイベントバインド
        if (this.ui.btnPreviewReplay) {
            this.ui.btnPreviewReplay.addEventListener('click', () => {
                this.sound.playBetSelect();
                if (this.previewPlayer) {
                    this.previewPlayer.playScenario(this.previewPlayer.currentFactionId);
                }
            });
        }

        if (this.ui.btnPreviewToggle) {
            this.ui.btnPreviewToggle.addEventListener('click', () => {
                this.sound.playBetSelect();
                if (this.previewPlayer) {
                    const isPaused = this.previewPlayer.togglePause();
                    if (this.ui.previewToggleText) {
                        this.ui.previewToggleText.textContent = isPaused ? '再生' : '一時停止';
                    }
                }
            });
        }

        // 初期描画（全勢力）
        this.renderEncyclopediaIcons('all');
    }

    /**
     * カテゴリに応じたアイコンカード一覧の描画
     */
    renderEncyclopediaIcons(category = 'all') {
        this.currentEncyclopediaCategory = category;
        this.ui.encyclopediaIconGrid.innerHTML = '';

        let factionKeys = Object.keys(FACTIONS);
        if (category !== 'all') {
            factionKeys = factionKeys.filter(fId => FACTIONS[fId].category === category);
        }

        factionKeys.forEach((fId) => {
            const fac = FACTIONS[fId];
            const card = document.createElement('div');
            card.className = `ency-icon-card ${fId === this.selectedEncyclopediaFactionId ? 'active' : ''}`;
            card.dataset.factionId = fId;
            card.style.setProperty('--card-color', fac.color);
            card.style.setProperty('--card-glow', `${fac.color}66`);

            // スプライトアイコン生成
            const charCanvas = this.spriteGen.getCharacterCanvas(fId);
            const dataUrl = charCanvas.toDataURL();

            card.innerHTML = `
                <div class="ency-icon-avatar">
                    <img src="${dataUrl}" alt="${fac.name}">
                </div>
                <span class="ency-icon-name">${fac.name}</span>
                <span class="ency-icon-rarity" style="color: ${fac.rarityColor}; border: 1px solid ${fac.rarityColor}40;">${fac.rarityLabel}</span>
            `;

            card.addEventListener('click', () => {
                this.sound.playBetSelect();
                this.showEncyclopediaCharacter(fId);
            });

            this.ui.encyclopediaIconGrid.appendChild(card);
        });

        // 現在選択中のキャラがリストに含まれていればそれを表示、なければ先頭キャラを表示
        if (factionKeys.length > 0) {
            if (!factionKeys.includes(this.selectedEncyclopediaFactionId)) {
                this.showEncyclopediaCharacter(factionKeys[0]);
            } else {
                this.showEncyclopediaCharacter(this.selectedEncyclopediaFactionId);
            }
        }
    }

    /**
     * 指定キャラクターの図鑑詳細を描画 (実戦アクションプレビュー ＋ 固有能力の確定仕様・計算式)
     */
    showEncyclopediaCharacter(factionId) {
        const fac = FACTIONS[factionId];
        if (!fac) return;

        this.selectedEncyclopediaFactionId = factionId;

        // アイコンカードのアクティブ状態更新
        const allCards = this.ui.encyclopediaIconGrid.querySelectorAll('.ency-icon-card');
        allCards.forEach(c => {
            if (c.dataset.factionId === factionId) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });

        // プレビューでそのキャラの専用活躍シナリオを再生
        if (this.previewPlayer) {
            this.previewPlayer.playScenario(factionId);
            if (this.ui.previewToggleText) {
                this.ui.previewToggleText.textContent = '一時停止';
            }
        }

        // プレビュー用Canvasの生成
        const charCanvas = this.spriteGen.getCharacterCanvas(factionId);
        const dataUrl = charCanvas.toDataURL();

        // 出現数のフォーマット
        const [minSpawn, maxSpawn] = fac.spawnRange;
        const spawnText = minSpawn === maxSpawn ? `必ず ${minSpawn} 体限定` : `${minSpawn} 〜 ${maxSpawn} 体`;

        // 固有能力の確定仕様テーブル行の生成
        const abilityData = fac.abilityData || {
            name: fac.ability,
            type: '固有能力',
            summary: fac.desc,
            specs: [],
            formula: 'なし'
        };

        let specsTableHtml = '';
        if (abilityData.specs && abilityData.specs.length > 0) {
            specsTableHtml = `
                <div class="ency-specs-container">
                    <div class="ency-section-heading">固有能力 精密仕様書 (確定数値パラメータ)</div>
                    <table class="ency-specs-table">
                        <tbody>
                            ${abilityData.specs.map(s => `
                                <tr>
                                    <td class="ency-specs-label">${s.label}</td>
                                    <td class="ency-specs-val">${s.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // 確定計算式ボックスの生成
        let formulaHtml = '';
        if (abilityData.formula) {
            formulaHtml = `
                <div>
                    <div class="ency-formula-label">内部演算ロジック・ダメージ計算式</div>
                    <div class="ency-formula-box">${abilityData.formula}</div>
                </div>
            `;
        }

        // 1. カラム1：ヒーローカード＆基礎ステータス＆プロフィール
        if (this.ui.encyColStatus) {
            this.ui.encyColStatus.innerHTML = `
                <div class="ency-profile-card">
                    <div class="ency-hero-box">
                        <div class="ency-large-preview">
                            <img src="${dataUrl}" alt="${fac.name}">
                        </div>
                        <div class="ency-hero-meta">
                            <div class="ency-hero-title-row">
                                <span class="ency-hero-name" style="color: ${fac.color};">${fac.name}</span>
                                <span class="ency-badge" style="background-color: ${fac.rarityColor}25; color: ${fac.rarityColor}; border: 1px solid ${fac.rarityColor}60;">${fac.rarityLabel}</span>
                            </div>
                            <div class="ency-hero-role">${fac.role}</div>
                            <div class="ency-hero-spawn">
                                出現数: <span class="ency-spawn-badge">${spawnText}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 6大基礎ステータスグリッド -->
                    <div>
                        <div class="ency-section-heading">基本ステータス</div>
                        <div class="ency-stats-grid">
                            <div class="ency-stat-card">
                                <div class="ency-stat-label">体力 (HP)</div>
                                <div class="ency-stat-value">${fac.hp}</div>
                            </div>
                            <div class="ency-stat-card">
                                <div class="ency-stat-label">攻撃力 (ATK)</div>
                                <div class="ency-stat-value">${fac.atk}</div>
                            </div>
                            <div class="ency-stat-card">
                                <div class="ency-stat-label">防御力 (DEF)</div>
                                <div class="ency-stat-value">${fac.def}</div>
                            </div>
                            <div class="ency-stat-card">
                                <div class="ency-stat-label">移動速度 (SPD)</div>
                                <div class="ency-stat-value">${fac.spd} m/s</div>
                            </div>
                            <div class="ency-stat-card">
                                <div class="ency-stat-label">射程 (RANGE)</div>
                                <div class="ency-stat-value">${fac.range} m</div>
                            </div>
                            <div class="ency-stat-card">
                                <div class="ency-stat-label">攻撃間隔 (INTERVAL)</div>
                                <div class="ency-stat-value">${fac.atkCooldown} 秒</div>
                            </div>
                        </div>
                    </div>

                    <!-- キャラクター背景 -->
                    <div>
                        <div class="ency-section-heading">キャラクター背景 (PROFILE)</div>
                        <div class="ency-desc-text">${fac.profile}</div>
                    </div>
                </div>
            `;
        }

        // 2. カラム2：固有能力の確定仕様・詳細数値パネル ＆ 内部計算式 ＆ 戦術解説
        if (this.ui.encyColAbility) {
            this.ui.encyColAbility.innerHTML = `
                <div class="ency-ability-detail-panel">
                    <div class="ency-ability-top">
                        <div class="ency-ability-title-group">
                            <div class="ency-ability-name">${abilityData.name}</div>
                            <span class="ency-ability-type-badge">${abilityData.type}</span>
                        </div>
                    </div>

                    <div class="ency-ability-summary">${abilityData.summary}</div>

                    <!-- 確定仕様テーブル -->
                    ${specsTableHtml}

                    <!-- 内部計算式 -->
                    ${formulaHtml}

                    <!-- 戦術・予想のコツ -->
                    <div class="ency-tactics-box">
                        <div class="ency-section-heading">戦術解説 ＆ 予想のポイント (TACTICS)</div>
                        <div class="ency-desc-text">${fac.tactics}</div>
                    </div>
                </div>
            `;
        }
    }
}

// 起動
window.addEventListener('DOMContentLoaded', () => {
    new BattleApp();
});
