// ============================================================================
// Multi-Style Master Synthesizer Engine for Lagtrain (ラグトレイン)
// 【✨ 全10重奏 グランド・オルゴール・オーケストラ (Grand Music Box Orchestra)】
// ★ Track 5:  [Center]       メインボーカル主旋律オルゴール
// ★ Track 1:  [Right +0.45]  イントロ・主オブリガート・オルゴール
// ★ Track 2:  [Left -0.45]   対旋律・エコーオブリガート・オルゴール
// ★ Track 3:  [Wide Center]  ディープ・バス・オルゴール
// ★ Track 4:  [Left -0.65]   木製チェンバー和音オルゴール
// ★ Track 6:  [Right +0.65]  温かい空間和音オルゴール
// ★ Track 7:  [Left -0.35]   Aメロ・分散アルペジオ・オルゴール
// ★ Track 11: [Right +0.70]  サビ高音ベルきらめきオルゴール
// ★ Track 12,13,14: [Mid]    間奏ブリッジ ＆ Cメロリズム・オルゴール
// ★ Track 15,16: [Wide Amb]  サビ空間ロングトーン ＆ アンビエント・オルゴール
// ============================================================================
(function () {
  'use strict';

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

      this.isMuted = false;
      this.volume = 0.76;
      this.nextNoteIdx = 0;
      this.isPlaying = false;
      this.notes = [];
      this.activeNodes = new Set();
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // 耳に優しい滑らかなローパスフィルター (4600Hz)
      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.setValueAtTime(4600, this.ctx.currentTime);
      this.masterFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

      // マスタリング・コンプレッサー (音数が増えても割れないよう自動調整)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4.0, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.22, this.ctx.currentTime);

      // 豊かな空間リバーブ (ふんわり広がる柔らかな残響)
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.createReverbBuffer(3.0, 2.2);
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(0.38, this.ctx.currentTime);
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.compressor);

      // 優しいステレオディレイ (広がりと奥行き)
      const delayTimeSec = 0.227; // BPM 132 テンポ同期
      this.delayNodeL = this.ctx.createDelay();
      this.delayNodeR = this.ctx.createDelay();
      this.delayNodeL.delayTime.setValueAtTime(delayTimeSec, this.ctx.currentTime);
      this.delayNodeR.delayTime.setValueAtTime(delayTimeSec * 1.5, this.ctx.currentTime);

      this.delayFeedbackL = this.ctx.createGain();
      this.delayFeedbackR = this.ctx.createGain();
      this.delayFeedbackL.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.delayFeedbackR.gain.setValueAtTime(0.18, this.ctx.currentTime);

      const merger = this.ctx.createChannelMerger(2);
      this.delayNodeL.connect(this.delayFeedbackL);
      this.delayFeedbackL.connect(this.delayNodeR);
      this.delayNodeR.connect(this.delayFeedbackR);
      this.delayFeedbackR.connect(this.delayNodeL);

      this.delayNodeL.connect(merger, 0, 0);
      this.delayNodeR.connect(merger, 0, 1);

      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.setValueAtTime(0.20, this.ctx.currentTime);
      merger.connect(this.delayGain);
      this.delayGain.connect(this.compressor);

      this.compressor.connect(this.masterFilter);
      this.masterFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      if (window.LAGTRAIN_MIDI_NOTES && Array.isArray(window.LAGTRAIN_MIDI_NOTES)) {
        this.notes = window.LAGTRAIN_MIDI_NOTES;
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
      const lookaheadMs = 400;

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

        if (startMs >= currentMs - 50) {
          const noteDelaySec = Math.max(0, (startMs - currentMs) / 1000);
          const noteAudioTime = nowAudioTime + noteDelaySec;
          const durationSec = durMs / 1000;
          const velGain = (velocity / 127);

          this.playOrchestraNote(rawMidiNote, noteAudioTime, durationSec, velGain, channel, trackIdx);
        }

        this.nextNoteIdx++;
      }
    }

    // =========================================================================
    // 🎵【全10重奏 グランド・オルゴール・オーケストラ 発音ルーティング】
    // =========================================================================
    playOrchestraNote(midiNote, time, duration, velGain, channel, trackIdx) {
      // ドラムチャンネル ＆ 2分10秒付近の7秒間超低音ノイズ (Track 16, 8, 10) を完全に除外
      if (channel === 9 || trackIdx === 10 || trackIdx === 8 || trackIdx === 16) {
        return;
      }
      // ブーという濁った超低音を除外 (MIDI 45未満のノイズ成分をカット)
      if (midiNote < 44) return;

      // 1. 【Track 5: メインボーカル主旋律】-> Center / 芯のある澄んだオルゴール
      if (trackIdx === 5) {
        this.voiceBoxVoice(midiNote, time, duration, velGain * 0.72, 0.0, true);
        return;
      }

      // 2. 【Track 1: イントロ・主オブリガート】-> Right +0.40 / 優しいきらめきオルゴール
      if (trackIdx === 1) {
        this.voiceBoxVoice(midiNote, time, duration, velGain * 0.65, 0.40, true);
        return;
      }

      // 3. 【Track 2: 対旋律・エコーオブリガート】-> Left -0.40 / Track 1と掛け合うエコーオルゴール
      if (trackIdx === 2) {
        this.voiceBoxVoice(midiNote, time, duration, velGain * 0.58, -0.40, true);
        return;
      }

      // 4. 【Track 3: ベースライン】-> Center Deep / 深みのあるバス・オルゴール
      if (trackIdx === 3) {
        this.voiceBoxBass(midiNote, time, duration, velGain * 0.62);
        return;
      }

      // 5. 【Track 4: メイン和音伴奏】-> Left -0.60 / 木製チェンバー和音オルゴール
      if (trackIdx === 4) {
        this.voiceBoxChamber(midiNote, time, duration, velGain * 0.45, -0.60);
        return;
      }

      // 6. 【Track 6: サブ和音伴奏】-> Right +0.60 / 温かい空間和音オルゴール
      if (trackIdx === 6) {
        this.voiceBoxChamber(midiNote, time, duration, velGain * 0.45, 0.60);
        return;
      }

      // 7. 【Track 7: Aメロ・分散アルペジオ】-> Left -0.25 / ポロポロと流れる装飾オルゴール
      if (trackIdx === 7) {
        this.voiceBoxArp(midiNote, time, duration, velGain * 0.48, -0.25);
        return;
      }

      // 8. 【Track 11: サビ高音ベルきらめき】-> Right +0.65 / サビで舞い降りるベル・オルゴール
      if (trackIdx === 11) {
        this.voiceBoxBell(midiNote, time, duration, velGain * 0.42, 0.65);
        return;
      }

      // 9. 【Track 12, 13, 14: 間奏ブリッジ ＆ Cメロリズム】-> Center-Mid +0.20
      if (trackIdx === 12 || trackIdx === 13 || trackIdx === 14) {
        this.voiceBoxArp(midiNote, time, duration, velGain * 0.46, 0.20);
        return;
      }

      // 10. 【Track 15: サビ空間ロングトーン】-> Wide Ambient (澄んだ高音のみ)
      if (trackIdx === 15) {
        if (midiNote >= 60) {
          this.voiceBoxPad(midiNote, time, duration, velGain * 0.35);
        }
        return;
      }

      // その他のノート
      this.voiceBoxChamber(midiNote, time, duration, velGain * 0.40, 0.0);
    }

    // =========================================================================
    // ✨【オルゴール音色 1: メロディ・ボイス (主旋律・オブリガート)】
    // =========================================================================
    voiceBoxVoice(midiNote, time, duration, velGain, panVal, isLead) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 2.0, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(3600, freq * 3.5), time);

      panner.pan.setValueAtTime(panVal || 0, time);

      const peak = velGain * 0.55;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.004);
      const decaySec = Math.min(Math.max(duration * 1.3, 0.45), isLead ? 1.25 : 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.12, time);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(gain);
      gain.connect(panner);

      panner.connect(this.compressor);
      panner.connect(this.reverbNode);
      if (panVal > 0) panner.connect(this.delayNodeR);
      else panner.connect(this.delayNodeL);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + decaySec + 0.02);
      osc2.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc1);
      osc1.onended = () => { this.activeNodes.delete(osc1); };
    }

    // =========================================================================
    // 🪵【オルゴール音色 2: チェンバー和音 (木製箱の温もり)】
    // =========================================================================
    voiceBoxChamber(midiNote, time, duration, velGain, panVal) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, time);

      panner.pan.setValueAtTime(panVal !== undefined ? panVal : 0, time);

      const peak = velGain * 0.38;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.006);
      const decaySec = Math.min(Math.max(duration * 1.2, 0.40), 0.90);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);

      panner.connect(this.compressor);
      panner.connect(this.reverbNode);
      panner.connect(this.delayNodeL);

      osc.start(time);
      osc.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc);
      osc.onended = () => { this.activeNodes.delete(osc); };
    }

    // =========================================================================
    // 🪕【オルゴール音色 3: アルペジオ ＆ リズム装飾】
    // =========================================================================
    voiceBoxArp(midiNote, time, duration, velGain, panVal) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, time);

      panner.pan.setValueAtTime(panVal !== undefined ? panVal : 0, time);

      const peak = velGain * 0.35;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.003);
      const decaySec = Math.min(Math.max(duration * 1.1, 0.35), 0.70);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);

      panner.connect(this.compressor);
      panner.connect(this.reverbNode);
      panner.connect(this.delayNodeR);

      osc.start(time);
      osc.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc);
      osc.onended = () => { this.activeNodes.delete(osc); };
    }

    // =========================================================================
    // 🔔【オルゴール音色 4: サビ高音ベルきらめき】
    // =========================================================================
    voiceBoxBell(midiNote, time, duration, velGain, panVal) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3400, time);

      panner.pan.setValueAtTime(panVal !== undefined ? panVal : 0.6, time);

      const peak = velGain * 0.30;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.002);
      const decaySec = Math.min(Math.max(duration * 1.1, 0.30), 0.65);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);

      panner.connect(this.compressor);
      panner.connect(this.reverbNode);
      panner.connect(this.delayNodeR);

      osc.start(time);
      osc.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc);
      osc.onended = () => { this.activeNodes.delete(osc); };
    }

    // =========================================================================
    // 🔊【オルゴール音色 5: ディープ・バス】
    // =========================================================================
    voiceBoxBass(midiNote, time, duration, velGain) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);

      const peak = velGain * 0.45;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.010);
      const decaySec = Math.min(Math.max(duration * 1.4, 0.50), 1.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decaySec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);

      osc.start(time);
      osc.stop(time + decaySec + 0.02);

      this.activeNodes.add(osc);
      osc.onended = () => { this.activeNodes.delete(osc); };
    }

    // =========================================================================
    // 🌌【オルゴール音色 6: 空間ロングトーン・アンビエント】
    // =========================================================================
    voiceBoxPad(midiNote, time, duration, velGain) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, time);

      const peak = velGain * 0.32;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.08); // ゆったり立ち上がる
      gain.gain.setValueAtTime(peak * 0.8, time + Math.max(0.1, duration - 0.1));
      gain.gain.linearRampToValueAtTime(0.0001, time + duration + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);
      gain.connect(this.reverbNode);

      osc.start(time);
      osc.stop(time + duration + 0.40);

      this.activeNodes.add(osc);
      osc.onended = () => { this.activeNodes.delete(osc); };
    }
  }

  window.LagtrainMultiStyleSynth = LagtrainMultiStyleSynth;
  window.lagtrainSynth = new LagtrainMultiStyleSynth();
})();
