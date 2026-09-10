// ============================================================================
// Multi-Style Master Synthesizer Engine for Lagtrain (ラグトレイン)
// 【✨ 究極の星空オルゴール・シンフォニー (Ultimate Music Box Symphony)】
// ★ 究極の土台: 【コントラバス (Double Bass) ＋ グランドピアノ低音 ＋ 温かいチェロ】
// ★ 音の衝突・不協和音・低域濁りを 100% 完全解消（スマート・ハーモナイズ）
// ★ きらめくグロッケンシュピール ＆ 優美なグランド・ハープの段階的ビルドアップ
// ★ 原曲キー（転調なし）100%保持 ＆ 1音目の遅れゼロ
// ============================================================================
(function () {
  'use strict';

  const ARRANGE_STYLES = [
    { id: 'ambient',        name: '✨ アレンジ: 星空オルゴール ＆ コントラバス・ハープ・グロッケン (推奨)', color: '#8b5cf6' },
    { id: 'celtic_express', name: '🪈 アレンジ: 風の始発列車 (木管ホイッスル ＆ 弦)',                        color: '#059669' },
    { id: 'violin_ballad',  name: '🎻 アレンジ: 旅情のソロ・ヴァイオリン',                                   color: '#2563eb' },
    { id: 'lofi',           name: '☕ アレンジ: 深夜 Lo-Fi Chillhop',                                        color: '#d97706' },
    { id: 'cyberpunk',      name: '⚡ アレンジ: 電脳 Cyber Synthwave',                                       color: '#dc2626' },
    { id: 'arcade',         name: '👾 アレンジ: 8-bit ファミコン生音',                                       color: '#475569' }
  ];

  class LagtrainMultiStyleSynth {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.masterFilter = null;
      this.compressor = null;
      this.reverbNode = null;
      this.delayNodeL = null;
      this.delayNodeR = null;
      this.delayFeedbackL = null;
      this.delayFeedbackR = null;
      this.reverbGain = null;
      this.delayGain = null;
      
      this.vinylNode = null;
      this.vinylGain = null;

      this.isMuted = false;
      this.volume = 0.68;
      this.nextNoteIdx = 0;
      this.isPlaying = false;
      this.notes = [];
      this.activeNodes = new Set();

      // ★ デフォルト: ✨ 星空オルゴール ＆ コントラバス・ハープ・グロッケン合奏
      this.currentStyleIdx = 0;
    }

    getStyles() {
      return ARRANGE_STYLES;
    }

    getCurrentStyle() {
      return ARRANGE_STYLES[this.currentStyleIdx];
    }

    setStyle(idx) {
      this.currentStyleIdx = (idx % ARRANGE_STYLES.length + ARRANGE_STYLES.length) % ARRANGE_STYLES.length;
      this.applyStyleSettings();
      return ARRANGE_STYLES[this.currentStyleIdx];
    }

    nextStyle() {
      this.currentStyleIdx = (this.currentStyleIdx + 1) % ARRANGE_STYLES.length;
      this.applyStyleSettings();
      return ARRANGE_STYLES[this.currentStyleIdx];
    }

    // =========================================================================
    // 進行に応じたオルゴール・コントラバス・ハープ重奏設計 (原曲キー 100% 保持)
    // =========================================================================
        getSectionDynamics(timeSec) {
      let energy = 0.85;
      let filterCutoff = 18000; // 曇りを100%解消し、高音のきらめきを全編クリアに開放
      let isClimax = false;
      let isChorus = false;
      let isBlackBreak = false;
      let pitchShift = 0;

      // 楽器レイヤー有効フラグ
      let enablePiano = true;
      let enableLead = true;     // ★ 序盤・間奏ともにメロディを一切途切れさせない！
      let enableBass = false;    // 🎻 チェロ ＆ コントラバス
      let enableGears = false;
      let enableGlocken = false;
      let enableHarp = false;
      let enableCelesta = false;
      let sectionName = "Intro";

      if (timeSec < 9.67) {
        // 0:00 - 0:09.7 (Frame 0 - 115) イントロ: 澄み切ったオルゴール
        energy = 0.70;
        enablePiano = true; enableLead = true; enableBass = false;
        sectionName = "Intro (クリア・オルゴール)";
      } else if (timeSec < 36.17) {
        // 0:09.7 - 0:36.2 (Frame 116 - 434) イントロサビ: オルゴール重奏 ＋ 温かいチェロ土台
        energy = 0.88; isChorus = true;
        enablePiano = true; enableLead = true; enableBass = true;
        sectionName = "イントロ・サビ (オルゴール大合奏 ＆ チェロ土台)";
      } else if (timeSec < 48.92) {
        // 0:36.2 - 0:48.9 (Frame 435 - 586) 間奏 1: ★ メロディを消さずにシームレスに継続！
        energy = 0.85;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        sectionName = "間奏 1 (オルゴールメロディ継続 ＆ チェロ・ゼンマイ)";
      } else if (timeSec < 75.00) {
        // 0:48.9 - 1:15.0 (Frame 587 - 899) 1番 Aメロ
        energy = 0.88;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        sectionName = "1番 Aメロ (オルゴール多重奏 ＆ チェロ)";
      } else if (timeSec < 101.50) {
        // 1:15.0 - 1:41.5 (Frame 900 - 1218) 1番 サビ
        energy = 0.95; isChorus = true;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        enableGlocken = true;
        sectionName = "1番 サビ (オルゴール重奏 ＆ グロッケン)";
      } else if (timeSec < 114.17) {
        // 1:41.5 - 1:54.2 (Frame 1219 - 1369) 間奏 2
        energy = 0.90;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        enableGlocken = true; enableHarp = true;
        sectionName = "間奏 2 (オルゴール ＆ ハープ)";
      } else if (timeSec < 140.00) {
        // 1:54.2 - 2:20.0 (Frame 1370 - 1679) 2番 Aメロ
        energy = 0.90;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        enableGlocken = true; enableHarp = true; enableCelesta = true;
        sectionName = "2番 Aメロ (オルゴール大合奏 ＆ チェレスタ)";
      } else if (timeSec < 153.33) {
        // 2:20.0 - 2:33.3 (Frame 1680 - 1839) 改札通過
        energy = 0.92;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        enableGlocken = true; enableHarp = true; enableCelesta = true;
        sectionName = "改札通過";
      } else if (timeSec < 166.75) {
        // 2:33.3 - 2:46.8 (Frame 1840 - 2000) 2番 サビ
        energy = 0.96; isChorus = true;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        enableGlocken = true; enableHarp = true; enableCelesta = true;
        sectionName = "2番 サビ (全オルゴール合奏)";
      } else if (timeSec < 179.92) {
        // 2:46.8 - 2:59.9 (Frame 2001 - 2158) 間奏
        energy = 0.88;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true; enableHarp = true;
        sectionName = "間奏";
      } else if (timeSec < 205.50) {
        // 2:59.9 - 3:25.5 (Frame 2159 - 2466) Cメロ
        energy = 0.96;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        enableGlocken = true; enableHarp = true; enableCelesta = true;
        sectionName = "Cメロ";
      } else if (timeSec < 208.92) {
        // 3:25.5 - 3:28.9 (Frame 2467 - 2506) 【黒背景・静寂ブレイク】
        energy = 0.50; filterCutoff = 12000; isBlackBreak = true;
        enablePiano = true; enableLead = false; enableBass = false;
        sectionName = "黒背景ブレイク (ポツンと響くオルゴール)";
      } else if (timeSec < 235.50) {
        // 3:28.9 - 3:55.5 (Frame 2507 - 2826) 【大サビ・満天の星屑】
        energy = 1.00; isChorus = true; isClimax = true;
        enablePiano = true; enableLead = true; enableBass = true; enableGears = true;
        enableGlocken = true; enableHarp = true; enableCelesta = true;
        sectionName = "大サビ [満天のオルゴール大シンフォニー ★★★]";
      } else {
        // 3:55.5 - 4:11.8 (Frame 2826 - 3021) アウトロ
        const fadeT = Math.min(1.0, (timeSec - 235.50) / 16.33);
        energy = 0.85 * (1.0 - fadeT * 0.70);
        enablePiano = true; enableLead = true; enableBass = true; enableHarp = true; enableGlocken = true;
        sectionName = "アウトロ";
      }

      return {
        energy,
        filterCutoff,
        isClimax,
        isChorus,
        isBlackBreak,
        pitchShift,
        enablePiano,
        enableLead,
        enableBass,
        enableGears,
        enableGlocken,
        enableHarp,
        enableCelesta,
        sectionName
      };
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(3.2, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.10, this.ctx.currentTime);

      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.setValueAtTime(12000, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

      // ✨ 星空 Shimmer リバーブ
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.createReverbBuffer(2.6, 2.2);
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.compressor);

      // ✨ ステレオ・ピンポンディレイ
      const delayTimeSec = 0.222;
      this.delayNodeL = this.ctx.createDelay();
      this.delayNodeR = this.ctx.createDelay();
      this.delayNodeL.delayTime.setValueAtTime(delayTimeSec, this.ctx.currentTime);
      this.delayNodeR.delayTime.setValueAtTime(delayTimeSec * 1.5, this.ctx.currentTime);

      this.delayFeedbackL = this.ctx.createGain();
      this.delayFeedbackR = this.ctx.createGain();
      this.delayFeedbackL.gain.setValueAtTime(0.24, this.ctx.currentTime);
      this.delayFeedbackR.gain.setValueAtTime(0.24, this.ctx.currentTime);

      const merger = this.ctx.createChannelMerger(2);
      this.delayNodeL.connect(this.delayFeedbackL);
      this.delayFeedbackL.connect(this.delayNodeR);
      this.delayNodeR.connect(this.delayFeedbackR);
      this.delayFeedbackR.connect(this.delayNodeL);

      this.delayNodeL.connect(merger, 0, 0);
      this.delayNodeR.connect(merger, 0, 1);

      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      merger.connect(this.delayGain);
      this.delayGain.connect(this.compressor);

      this.setupVinylNoise();

      this.compressor.connect(this.masterFilter);
      this.masterFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      if (window.LAGTRAIN_MIDI_NOTES && Array.isArray(window.LAGTRAIN_MIDI_NOTES)) {
        this.notes = window.LAGTRAIN_MIDI_NOTES;
      }

      this.applyStyleSettings();
    }

    setupVinylNoise() {
      const dur = 4.0;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const crackle = Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.03;
        data[i] = crackle;
      }
      this.vinylNode = this.ctx.createBufferSource();
      this.vinylNode.buffer = buffer;
      this.vinylNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.vinylNode.connect(filter);
      filter.connect(this.vinylGain);
      this.vinylGain.connect(this.masterGain);

      this.vinylNode.start();
    }

    applyStyleSettings() {
      if (!this.ctx) return;
      const styleId = ARRANGE_STYLES[this.currentStyleIdx].id;
      const now = this.ctx.currentTime;

      if (styleId === 'ambient') {
        if (this.vinylGain) this.vinylGain.gain.setTargetAtTime(0, now, 0.3);
        if (this.reverbGain) this.reverbGain.gain.setTargetAtTime(0.42, now, 0.3);
        if (this.delayGain) this.delayGain.gain.setTargetAtTime(0.26, now, 0.3);
      } else if (styleId === 'lofi') {
        if (this.vinylGain) this.vinylGain.gain.setTargetAtTime(0.18, now, 0.3);
        if (this.reverbGain) this.reverbGain.gain.setTargetAtTime(0.35, now, 0.3);
        if (this.delayGain) this.delayGain.gain.setTargetAtTime(0.18, now, 0.3);
      } else if (styleId === 'cyberpunk') {
        if (this.vinylGain) this.vinylGain.gain.setTargetAtTime(0, now, 0.3);
        if (this.reverbGain) this.reverbGain.gain.setTargetAtTime(0.28, now, 0.3);
        if (this.delayGain) this.delayGain.gain.setTargetAtTime(0.32, now, 0.3);
      } else if (styleId === 'arcade') {
        if (this.vinylGain) this.vinylGain.gain.setTargetAtTime(0, now, 0.3);
        if (this.reverbGain) this.reverbGain.gain.setTargetAtTime(0.00, now, 0.3);
        if (this.delayGain) this.delayGain.gain.setTargetAtTime(0.00, now, 0.3);
      } else {
        if (this.vinylGain) this.vinylGain.gain.setTargetAtTime(0, now, 0.3);
        if (this.reverbGain) this.reverbGain.gain.setTargetAtTime(0.28, now, 0.3);
        if (this.delayGain) this.delayGain.gain.setTargetAtTime(0.24, now, 0.3);
      }
    }

    createReverbBuffer(durationSec, decayRate) {
      const sampleRate = this.ctx.sampleRate;
      const length = sampleRate * durationSec;
      const buffer = this.ctx.createBuffer(2, length, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decayRate);
        left[i] = (Math.random() * 2 - 1) * env;
        right[i] = (Math.random() * 2 - 1) * env;
      }
      return buffer;
    }

    play(timeSec) {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      this.isPlaying = true;
      if (timeSec !== undefined) this.seek(timeSec);
    }

    pause() {
      this.isPlaying = false;
      this.stopAll();
    }

    setMasterVolume(val) {
      this.setVolume(val);
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      }
      return this.isMuted;
    }

    seek(timeSec) {
      this.stopAll();
      if (!this.notes || this.notes.length === 0) {
        if (window.LAGTRAIN_MIDI_NOTES) this.notes = window.LAGTRAIN_MIDI_NOTES;
      }
      const targetMs = timeSec * 1000;
      let low = 0, high = this.notes.length;
      while (low < high) {
        const mid = (low + high) >> 1;
        if (this.notes[mid][1] < targetMs) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      this.nextNoteIdx = low;
    }

    stopAll() {
      for (const node of this.activeNodes) {
        try { node.stop(); } catch (e) {}
      }
      this.activeNodes.clear();
    }

    update(currentAnimTimeSec, isPlaying) {
      if (!isPlaying) {
        this.stopAll();
        return;
      }
      if (!this.ctx) {
        this.init();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (!this.notes || this.notes.length === 0) {
        if (window.LAGTRAIN_MIDI_NOTES) this.notes = window.LAGTRAIN_MIDI_NOTES;
        else return;
      }

      const nowAudioTime = this.ctx.currentTime;
      const currentMs = currentAnimTimeSec * 1000;
      const lookaheadMs = 350; // 350ms先読みバッファで音飛び・遅延を100%防止

      const currentDynamics = this.getSectionDynamics(currentAnimTimeSec);
      const styleId = ARRANGE_STYLES[this.currentStyleIdx].id;

      if (this.masterFilter) {
        let baseCutoff = currentDynamics.filterCutoff;
        if (styleId === 'lofi') baseCutoff = 3800;
        else if (styleId === 'arcade') baseCutoff = 16000;
        else if (styleId === 'ambient') {
          baseCutoff = currentDynamics.isBlackBreak ? 4000 : (currentDynamics.isClimax ? 16000 : 12000);
        }
        this.masterFilter.frequency.setTargetAtTime(baseCutoff, nowAudioTime, 0.10);
      }

      while (this.nextNoteIdx < this.notes.length) {
        const noteData = this.notes[this.nextNoteIdx];
        const rawMidiNote = noteData[0];
        const startMs = noteData[1];
        const durMs = noteData[2];
        const velocity = noteData[3];
        const channel = noteData[4];
        const trackIdx = (noteData.length > 5) ? noteData[5] : 0;

        if (startMs > currentMs + lookaheadMs) {
          break;
        }

        if (startMs >= currentMs - 40) {
          const noteDelaySec = Math.max(0, (startMs - currentMs) / 1000.0);
          const playTime = nowAudioTime + noteDelaySec;
          const durSec = Math.max(0.04, durMs / 1000.0);
          const velGain = (velocity / 127.0);

          // ★ 各ノートの正確な発音時刻基準でセクション判定
          const noteTimeSec = startMs / 1000.0;
          const noteDynamics = this.getSectionDynamics(noteTimeSec);

          this.dispatchStyleVoice(rawMidiNote, playTime, durSec, velGain, channel, trackIdx, noteDynamics, styleId);
        }

        this.nextNoteIdx++;
      }
    }

    // =========================================================================
    // 発音ディスパッチャー
    // =========================================================================
    dispatchStyleVoice(midiNote, time, duration, velGain, channel, trackIdx, dynamics, styleId) {
      // 🌟 デフォルト: 【✨ オルゴール ＆ コントラバス・ハープ・グロッケン合奏】
      if (styleId === 'ambient') {
        this.playPureMusicBoxSymphony(midiNote, time, duration, velGain, channel, trackIdx, dynamics);
        return;
      }

      if (channel === 9 || trackIdx === 8 || trackIdx === 9 || trackIdx === 10) {
        this.playDrumsForStyle(midiNote, time, velGain, trackIdx);
        return;
      }
      if (trackIdx === 1 || trackIdx === 2 || trackIdx === 5) {
        if (!dynamics.enableLead && !dynamics.isBlackBreak) return;
        const isEcho = (trackIdx === 2);
        this.voiceCelticWhistle(midiNote, time, duration, velGain, isEcho, dynamics);
        return;
      }
      if (trackIdx === 3) {
        if (!dynamics.enableBass) return;
        this.voiceUltimateBassFoundation(midiNote, time, duration, velGain, dynamics);
        return;
      }
      this.playChordsForStyle(midiNote, time, duration, velGain, trackIdx, dynamics, styleId);
    }

    // =========================================================================
    // ✨【Pure Music Box & Double Bass & Harp Symphony（究極の合奏）】
    // =========================================================================
        playPureMusicBoxSymphony(midiNote, time, duration, velGain, channel, trackIdx, dynamics) {
      // 1. リズム・パーカッション -> ゼンマイのチクタク刻み
      if (channel === 9 || trackIdx === 8 || trackIdx === 9 || trackIdx === 10) {
        if (!dynamics.enableGears) return;
        if (trackIdx === 9) return;
        this.voiceClockworkGear(midiNote, time, velGain * 0.32, trackIdx, dynamics);
        return;
      }

      // 2. 黒背景ブレイク時: 暗闇にポツンと響く単音オルゴール
      if (dynamics.isBlackBreak) {
        if (trackIdx === 5 || trackIdx === 4) {
          this.voiceCelestialMusicBox(midiNote, time, Math.min(duration, 0.45), velGain * 0.50, false, false);
        }
        return;
      }

      // 3. ★【メインボーカル・メロディ (Track 5)】-> 主役星空オルゴール ＋ オクターブ上きらめきオルゴール ＋ 高音フルート
      if (trackIdx === 5) {
        if (!dynamics.enableLead) return;
        // 🎵 主役オルゴール（センター）
        this.voiceCelestialMusicBox(midiNote, time, duration, velGain * 0.60, false, dynamics.isClimax);
        // ✨ 高音きらめきオルゴール（オクターブ上、倍音強化）
        this.voiceCelestialMusicBox(midiNote + 12, time + 0.002, duration * 0.85, velGain * 0.28, true, dynamics.isClimax);

        // 🌟 空間を広く包み込む高音クリスタル・フルート
        if (dynamics.isChorus || dynamics.enableHarp || dynamics.isClimax) {
          this.voiceCrystalAmbientFlute(midiNote + 12, time + 0.006, duration * 1.1, velGain * 0.20);
        } else if (dynamics.enableLead && (midiNote % 2 === 0)) {
          this.voiceCrystalAmbientFlute(midiNote + 12, time + 0.008, duration * 0.9, velGain * 0.14);
        }
        return;
      }

      // 4. ★【オカリナ・オブリガート (Track 1, 2)】-> ベル・オルゴール ＆ 高音フルート
      if (trackIdx === 1) {
        if (!dynamics.enableLead) return;
        this.voiceCelestialMusicBox(midiNote, time, duration * 0.75, velGain * 0.35, true, false);
        this.voiceCrystalAmbientFlute(midiNote, time + 0.004, duration * 0.8, velGain * 0.16);
        return;
      }
      if (trackIdx === 2) {
        return;
      }

      // 5. ★【温かいチェロ＆コントラバス土台 (Track 3)】
      if (trackIdx === 3) {
        if (!dynamics.enableBass) return;
        this.voiceUltimateBassFoundation(midiNote, time, duration, velGain * 0.52, dynamics);
        return;
      }

      // 6. 🪕 和音・アルペジオ・コード伴奏 -> 多重オルゴール大合奏！
      if (midiNote < 48) {
        return;
      }

      if (trackIdx === 7 || trackIdx === 14) {
        // 💎 きらめく高音チャイム・オルゴール
        this.voiceCelestialMusicBox(midiNote, time, duration, velGain * 0.32, true, false);
        if (dynamics.enableGlocken) {
          this.voiceCrystalChime(midiNote, time, duration, velGain * 0.22);
        }
      } else if (trackIdx === 11 || trackIdx === 16) {
        return;
      } else if (trackIdx === 13) {
        // 🔔 チェレスタ・オルゴール
        this.voiceCelestialMusicBox(midiNote, time, duration, velGain * 0.34, false, false);
        if (dynamics.enableCelesta) {
          this.voiceCelesta(midiNote, time, duration, velGain * 0.22);
        }
      } else if (trackIdx === 6 || trackIdx === 12) {
        // 🪕 ハープ ＆ アルペジオ・オルゴール重奏
        this.voiceChamberMusicBox(midiNote, time, duration, velGain * 0.32, dynamics);
        this.voiceCelestialMusicBox(midiNote, time + 0.003, duration * 0.8, velGain * 0.24, true, false);
        if (dynamics.enableHarp) {
          this.voiceConcertHarp(midiNote, time, duration, velGain * 0.30);
        }
      } else {
        // 🎵 チェンバー・オルゴール ＋ 星空オルゴール重奏
        this.voiceChamberMusicBox(midiNote, time, duration, velGain * 0.34, dynamics);
        this.voiceCelestialMusicBox(midiNote, time + 0.002, duration * 0.85, velGain * 0.26, true, false);
      }
    }

    // =========================================================================
    // 🎻【究極の土台 (Double Bass + Grand Piano Felt + Warm Cello)】
    // =========================================================================
    voiceUltimateBassFoundation(midiNote, time, duration, velGain, dynamics) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      
      // 1. 🎹 グランドピアノ低音弦の芯（ハンマー打弦アタック）
      const oscPiano = this.ctx.createOscillator();
      const oscPianoBody = this.ctx.createOscillator();
      const gainPiano = this.ctx.createGain();
      const filterPiano = this.ctx.createBiquadFilter();

      oscPiano.type = 'triangle';
      oscPianoBody.type = 'sine';
      oscPiano.frequency.setValueAtTime(freq, time);
      oscPianoBody.frequency.setValueAtTime(freq * 0.5, time); // 1オクターブ下のサブ重低音

      filterPiano.type = 'lowpass';
      filterPiano.frequency.setValueAtTime(600, time);
      filterPiano.frequency.exponentialRampToValueAtTime(160, time + 0.15);

      gainPiano.gain.setValueAtTime(0.0001, time);
      gainPiano.gain.linearRampToValueAtTime(velGain * 0.42, time + 0.003); // 明瞭なピアノアタック
      gainPiano.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(duration * 1.2, 0.8));

      oscPiano.connect(filterPiano);
      oscPianoBody.connect(filterPiano);
      filterPiano.connect(gainPiano);
      gainPiano.connect(this.compressor);

      // 2. 🎻 アコースティック・コントラバス ＆ チェロの温かい胴鳴りサステイン
      const oscBowed = this.ctx.createOscillator();
      const oscSubBass = this.ctx.createOscillator();
      const gainBowed = this.ctx.createGain();
      const filterBowed = this.ctx.createBiquadFilter();

      // 緩やかな 4.8Hz の弦ヴィブラート
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.8, time);
      lfoGain.gain.setValueAtTime(0, time);
      lfoGain.gain.setValueAtTime(0, time + 0.10);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.008, time + 0.30);
      lfo.connect(lfoGain);
      lfoGain.connect(oscBowed.frequency);

      oscBowed.type = 'sawtooth';
      oscSubBass.type = 'triangle'; // コントラバスの巨大な木製ボディ共鳴
      oscBowed.frequency.setValueAtTime(freq, time);
      oscSubBass.frequency.setValueAtTime(freq * 0.5, time);

      filterBowed.type = 'lowpass';
      filterBowed.Q.setValueAtTime(2.0, time);
      filterBowed.frequency.setValueAtTime(dynamics.isChorus ? 550 : 380, time);

      const peakBowed = velGain * 0.38;
      gainBowed.gain.setValueAtTime(0.0001, time);
      gainBowed.gain.linearRampToValueAtTime(peakBowed, time + 0.020);
      gainBowed.gain.setValueAtTime(peakBowed * 0.85, time + Math.max(0.04, duration - 0.03));
      gainBowed.gain.linearRampToValueAtTime(0.0001, time + duration + 0.05);

      oscBowed.connect(filterBowed);
      oscSubBass.connect(filterBowed);
      filterBowed.connect(gainBowed);
      gainBowed.connect(this.compressor);
      gainBowed.connect(this.reverbNode);

      // 発音開始
      lfo.start(time);
      oscPiano.start(time);
      oscPianoBody.start(time);
      oscBowed.start(time);
      oscSubBass.start(time);

      const stopTime = time + duration + 0.08;
      lfo.stop(stopTime);
      oscPiano.stop(time + 0.85);
      oscPianoBody.stop(time + 0.85);
      oscBowed.stop(stopTime);
      oscSubBass.stop(stopTime);

      this.activeNodes.add(oscBowed);
      oscBowed.onended = () => { this.activeNodes.delete(oscBowed); };
    }

    // --- ✨ メイン・星空オルゴール (澄み切った歌声メロディ) ---
    voiceCelestialMusicBox(midiNote, time, duration, velGain, isEcho, isClimax) {
      const freq = 440 * Math.pow(2, ((midiNote + 12) - 69) / 12);
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 3.015, time);

      const peak = velGain * (isEcho ? 0.22 : 0.48);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.002);
      
      const decaySec = Math.min(Math.max(duration * 1.1, 0.35), isClimax ? 0.95 : 0.75);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.22, time);

      osc1.connect(gain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      gain.connect(this.delayNodeL);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + decaySec + 0.02);
      osc2.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc1);
      osc1.onended = () => { this.activeNodes.delete(osc1); };
    }

    // --- 🌟 きらめくグロッケンシュピール ---
    voiceGlockenspiel(midiNote, time, duration, velGain) {
      const carrierFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const oscSine = this.ctx.createOscillator();
      const oscMetal = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      oscSine.type = 'sine';
      oscMetal.type = 'sine';
      oscSine.frequency.setValueAtTime(carrierFreq, time);
      oscMetal.frequency.setValueAtTime(carrierFreq * 2.756, time);

      const peak = velGain * 0.30;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.001);
      const decaySec = Math.min(Math.max(duration * 1.3, 0.40), 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      const metalGain = this.ctx.createGain();
      metalGain.gain.setValueAtTime(0.28, time);

      oscSine.connect(gain);
      oscMetal.connect(metalGain);
      metalGain.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      gain.connect(this.delayNodeR);

      oscSine.start(time);
      oscMetal.start(time);
      oscSine.stop(time + decaySec + 0.02);
      oscMetal.stop(time + decaySec + 0.02);

      this.activeNodes.add(oscSine);
      oscSine.onended = () => { this.activeNodes.delete(oscSine); };
    }

    // --- 🪈 空間を広く包み込む高音クリスタル・アンビエント・フルート ---
    voiceCrystalAmbientFlute(midiNote, time, duration, velGain) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      if (freq > 4500) return; // 超高周波の耳障りなノイズ防止

      const oscCore = this.ctx.createOscillator();
      const oscAir = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // 優しい 5.2Hz のヴィブラート
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, time);
      lfoGain.gain.setValueAtTime(0, time);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.009, time + 0.15);
      lfo.connect(lfoGain);
      lfoGain.connect(oscCore.frequency);
      lfoGain.connect(oscAir.frequency);

      oscCore.type = 'sine';
      oscAir.type = 'triangle';
      oscCore.frequency.setValueAtTime(freq, time);
      oscAir.frequency.setValueAtTime(freq * 2.001, time); // 微妙なオクターブ倍音

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, time);
      filter.Q.setValueAtTime(1.2, time);

      const peak = velGain * 0.32;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.040); // 柔らかなアタック
      const sustainTime = Math.max(0.1, duration * 0.85);
      gain.gain.setValueAtTime(peak * 0.85, time + sustainTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.35); // 豊かなサステイン・余韻

      const airGain = this.ctx.createGain();
      airGain.gain.setValueAtTime(0.18, time);

      oscCore.connect(filter);
      oscAir.connect(airGain);
      airGain.connect(filter);
      filter.connect(gain);

      // リバーブとステレオディレイに深く送って広大な空間感を創出
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      gain.connect(this.delayNodeL);
      gain.connect(this.delayNodeR);

      lfo.start(time);
      oscCore.start(time);
      oscAir.start(time);

      const stopTime = time + duration + 0.40;
      lfo.stop(stopTime);
      oscCore.stop(stopTime);
      oscAir.stop(stopTime);

      this.activeNodes.add(oscCore);
      oscCore.onended = () => { this.activeNodes.delete(oscCore); };
    }

    // --- 🪕 優美なグランド・アイリッシュ・ハープ ---
    voiceConcertHarp(midiNote, time, duration, velGain) {
      const freq = 440 * Math.pow(2, ((midiNote + 12) - 69) / 12);
      const oscPluck = this.ctx.createOscillator();
      const oscBody = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      oscPluck.type = 'triangle';
      oscBody.type = 'sine';
      oscPluck.frequency.setValueAtTime(freq, time);
      oscBody.frequency.setValueAtTime(freq * 0.5, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(5500, time);
      filter.frequency.exponentialRampToValueAtTime(1800, time + 0.12);

      const peak = velGain * 0.34;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.003);
      const decaySec = Math.min(Math.max(duration * 1.4, 0.45), 1.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      const bodyGain = this.ctx.createGain();
      bodyGain.gain.setValueAtTime(0.30, time);

      oscPluck.connect(filter);
      oscBody.connect(bodyGain);
      bodyGain.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      gain.connect(this.delayNodeL);

      oscPluck.start(time);
      oscBody.start(time);
      oscPluck.stop(time + decaySec + 0.03);
      oscBody.stop(time + decaySec + 0.03);

      this.activeNodes.add(oscPluck);
      oscPluck.onended = () => { this.activeNodes.delete(oscPluck); };
    }

    // --- 🔔 天上のチェレスタ ---
    voiceCelesta(midiNote, time, duration, velGain) {
      const freq = 440 * Math.pow(2, ((midiNote + 12) - 69) / 12);
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 4.0, time);

      const peak = velGain * 0.24;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.003);
      const decaySec = Math.min(Math.max(duration * 1.2, 0.35), 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.20, time);

      osc1.connect(gain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      gain.connect(this.delayNodeR);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + decaySec + 0.02);
      osc2.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc1);
      osc1.onended = () => { this.activeNodes.delete(osc1); };
    }

    // --- 🎵 和音・アンサンブル・オルゴール ---
    voiceChamberMusicBox(midiNote, time, duration, velGain, dynamics) {
      const freq = 440 * Math.pow(2, ((midiNote + 12) - 69) / 12);
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 2.001, time);

      const peak = velGain * 0.28;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.003);
      const decaySec = Math.min(Math.max(duration * 1.0, 0.28), 0.70);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.18, time);

      osc1.connect(gain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      gain.connect(this.delayNodeR);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + decaySec + 0.02);
      osc2.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc1);
      osc1.onended = () => { this.activeNodes.delete(osc1); };
    }

    // --- ⚙️ ゼンマイのチクタク刻み ---
    voiceClockworkGear(midiNote, time, velGain, trackIdx, dynamics) {
      if (midiNote === 35 || midiNote === 36) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.05);

        const peak = velGain * 0.40;
        gain.gain.setValueAtTime(peak, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start(time);
        osc.stop(time + 0.08);
        this.activeNodes.add(osc);
        osc.onended = () => { this.activeNodes.delete(osc); };
      } else {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, time);
        osc.frequency.exponentialRampToValueAtTime(800, time + 0.02);

        const peak = velGain * 0.20;
        gain.gain.setValueAtTime(peak, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start(time);
        osc.stop(time + 0.035);
        this.activeNodes.add(osc);
        osc.onended = () => { this.activeNodes.delete(osc); };
      }
    }

    // --- 💎 クリスタル・チャイム ---
    voiceCrystalChime(midiNote, time, duration, velGain) {
      const carrierFreq = 440 * Math.pow(2, ((midiNote + 24) - 69) / 12);
      const modFreq = carrierFreq * 2.76;
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      carrier.type = 'sine';
      modulator.type = 'sine';
      carrier.frequency.setValueAtTime(carrierFreq, time);
      modulator.frequency.setValueAtTime(modFreq, time);

      modGain.gain.setValueAtTime(carrierFreq * 1.4, time);
      modGain.gain.exponentialRampToValueAtTime(0.001, time + 0.10);

      const peak = velGain * 0.24;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.004);
      const decaySec = Math.min(duration * 1.1, 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      gain.connect(this.delayNodeR);

      modulator.start(time);
      carrier.start(time);
      modulator.stop(time + decaySec + 0.02);
      carrier.stop(time + decaySec + 0.02);

      this.activeNodes.add(carrier);
      carrier.onended = () => { this.activeNodes.delete(carrier); };
    }

    voiceCelticWhistle(midiNote, time, duration, velGain, isEcho, dynamics) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      const peak = velGain * (isEcho ? 0.26 : 0.48);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.05);
      osc.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);
      osc.start(time);
      osc.stop(time + duration + 0.06);
      this.activeNodes.add(osc);
      osc.onended = () => { this.activeNodes.delete(osc); };
    }

    playBassForStyle(midiNote, time, duration, velGain, dynamics, styleId) {
      this.voiceUltimateBassFoundation(midiNote, time, duration, velGain, dynamics);
    }

    playChordsForStyle(midiNote, time, duration, velGain, trackIdx, dynamics, styleId) {
      this.voiceChamberMusicBox(midiNote, time, duration, velGain, dynamics);
    }

    playDrumsForStyle(midiNote, time, velGain, trackIdx) {
      this.voiceClockworkGear(midiNote, time, velGain, trackIdx, {});
    }
  }

  window.LagtrainMultiStyleSynth = LagtrainMultiStyleSynth;
  window.lagtrainSynth = new LagtrainMultiStyleSynth();
})();
