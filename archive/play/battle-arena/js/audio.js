/**
 * サウンドエフェクト管理モジュール (Web Audio API)
 * 外部音声ファイルに頼らず、ブラウザ内蔵のオシレーターとノイズ生成でリッチな効果音を発音。
 */

export class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.25;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    /**
     * 斬撃・近接攻撃音
     */
    playSlash() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

            gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.09);
        } catch (e) {}
    }

    /**
     * ヒット音
     */
    playHit() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.06);

            gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.07);
        } catch (e) {}
    }

    /**
     * ドラゴン火炎ブレス音 (重低音ホワイトノイズ + スウィープ)
     */
    playDragonBreath() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const bufferSize = this.ctx.sampleRate * 0.35;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(350, t);
            filter.frequency.linearRampToValueAtTime(700, t + 0.15);
            filter.frequency.exponentialRampToValueAtTime(150, t + 0.35);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(this.masterVolume * 0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(t);
        } catch (e) {}
    }

    /**
     * 手裏剣投擲音 (シュッという高速風切り音)
     */
    playShuriken() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);

            gain.gain.setValueAtTime(this.masterVolume * 0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.07);
        } catch (e) {}
    }

    /**
     * ゾンビ感染音 (不気味なピッチベンド)
     */
    playInfect() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.linearRampToValueAtTime(90, t + 0.18);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.22);
        } catch (e) {}
    }

    /**
     * ロボ故障音 (電気ショートスパーク)
     */
    playGlitch() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.setValueAtTime(120, t + 0.04);
            osc.frequency.setValueAtTime(800, t + 0.08);
            osc.frequency.setValueAtTime(80, t + 0.12);

            gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.22);
        } catch (e) {}
    }

    /**
     * スライム分裂音
     */
    playSplit() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, t);
            osc.frequency.exponentialRampToValueAtTime(680, t + 0.12);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.15);
        } catch (e) {}
    }

    /**
     * 戦闘開始ゴング・銅鑼の音
     */
    playBattleStart() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            // 低音の銅鑼 (Gong)
            [110, 164.8, 220, 293.7].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, t);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.96, t + 1.2);

                gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + 1.5);
            });
        } catch (e) {}
    }

    /**
     * ベット・予想選択時のクリック音
     */
    playBetSelect() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.06);
        } catch (e) {}
    }

    /**
     * コイン配当獲得音 (チャリンチャリン)
     */
    playCoinPayout() {
        if (this.isMuted || !this.ctx) return;
        try {
            [987.77, 1318.51, 1567.98, 1975.53].forEach((freq, i) => {
                const t = this.ctx.currentTime + i * 0.08;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t);

                gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + 0.2);
            });
        } catch (e) {}
    }

    /**
     * 勝利ファンファーレ音
     */
    playVictory() {
        if (this.isMuted || !this.ctx) return;
        try {
            const notes = [440, 554.37, 659.25, 880]; // A - C# - E - A
            notes.forEach((freq, idx) => {
                const t = this.ctx.currentTime + idx * 0.12;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t);

                gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.6 : 0.25));

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(t);
                osc.stop(t + (idx === 3 ? 0.7 : 0.3));
            });
        } catch (e) {}
    }

    /**
     * 爆発音 (爆弾魔)
     */
    playExplosion() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const bufferSize = this.ctx.sampleRate * 0.45;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, t);
            filter.frequency.exponentialRampToValueAtTime(60, t + 0.4);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(this.masterVolume * 0.7, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(t);
        } catch (e) {}
    }

    /**
     * 連鎖雷音 (雷獣)
     */
    playLightning() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.linearRampToValueAtTime(300, t + 0.08);
            osc.frequency.linearRampToValueAtTime(800, t + 0.15);

            gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.19);
        } catch (e) {}
    }

    /**
     * 踏みつけ・地響き音 (巨人)
     */
    playStomp() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(90, t);
            osc.frequency.exponentialRampToValueAtTime(25, t + 0.25);

            gain.gain.setValueAtTime(this.masterVolume * 0.65, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.26);
        } catch (e) {}
    }

    /**
     * 氷結音 (雪女)
     */
    playFreeze() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1800, t);
            osc.frequency.exponentialRampToValueAtTime(2400, t + 0.15);

            gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.22);
        } catch (e) {}
    }

    /**
     * 突進音 (牛の群れ)
     */
    playStampede() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, t);
            osc.frequency.linearRampToValueAtTime(80, t + 0.3);

            gain.gain.setValueAtTime(this.masterVolume * 0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.36);
        } catch (e) {}
    }

    /**
     * 居合抜刀音 (サムライ)
     */
    playIaido() {
        if (this.isMuted || !this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1600, t);
            osc.frequency.exponentialRampToValueAtTime(3200, t + 0.08);

            gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.13);
        } catch (e) {}
    }
}
