/**
 * <fuka-anim>
 * スプライトシート: 5列 × 3行 = 15フレーム (1430×1100px, ボーダーなし)
 * 再生: ピンポン往復 (0→14→0)
 * 各フレームの実際のキャラクター中心座標を使い、常に中央揃えで表示
 * 属性:
 *   fps    フレームレート (default: 4)
 *   width  表示幅px (default: 120)
 *   src    スプライト画像パス
 */

// 画像解析で取得した各フレームのキャラクター絶対中心座標 [acx, acy]
const FUKA_CENTERS = [
  [162.50, 181.00],  // frame 0
  [428.50, 181.00],  // frame 1
  [713.50, 181.00],  // frame 2
  [1001.00, 181.00], // frame 3
  [1270.00, 181.00], // frame 4
  [152.50, 537.00],  // frame 5
  [436.00, 537.00],  // frame 6
  [711.00, 537.00],  // frame 7
  [1001.00, 537.00], // frame 8
  [1257.50, 537.00], // frame 9
  [152.50, 891.50],  // frame 10
  [428.50, 891.50],  // frame 11
  [715.00, 891.50],  // frame 12
  [1000.50, 891.50], // frame 13
  [1252.00, 891.50], // frame 14
];

// 画像内キャラクターの最大サイズ (source px): 285 x 280
const FUKA_CHAR_MAX_W = 285;
const FUKA_CHAR_MAX_H = 280;

// デフォルトの再生順 (ユーザー指定): 1ベースで記載
// ユーザー要望: 3 4 5 6 7 10 11 のみをループ
const DEFAULT_ORDER = [3,4,5,6,7,10,11];

class FukaAnimation extends HTMLElement {
  constructor() {
    super();
    this._fps = 4;
    this._displayW = 120;
    this._seq = 0; this._intervalId = null; this._sprite = null;
    // sequence: 配列 of frameIndex (0-based)
    this._sequence = DEFAULT_ORDER.map(n => Math.max(0, n - 1));
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._readAttrs();
    this._render();
    this._start();
  }

  disconnectedCallback() {
    this._stop();
  }

  static get observedAttributes() {
    return ['fps', 'width', 'src'];
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this._readAttrs();
    this._render();
    this._stop();
    this._seq = 0;
    this._start();
  }

  _readAttrs() {
    this._fps      = parseFloat(this.getAttribute('fps'))   || 4;
    this._displayW = parseFloat(this.getAttribute('width')) || 120;
    // カスタム順序を attribute 'order' で指定可能（例: "3,4,5,6,7,10,11,10,7,6,5,4,3"）
    const orderAttr = this.getAttribute('order');
    if (orderAttr) {
      const arr = orderAttr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (arr.length > 0) {
        // 入力が1ベースとして与えられる想定 -> 0ベースに変換
        this._sequence = arr.map(n => {
          // clamp to 1..length, then convert to 0-based
          const clamped = Math.max(1, Math.min(FUKA_CENTERS.length, n));
          return clamped - 1;
        });
      }
    }
  }

  _render() {
    // 表示サイズはキャラクターの最大バウンディングボックスに合わせる
    const srcW = 1430, srcH = 1100, cols = 5;
    const scale = this._displayW / FUKA_CHAR_MAX_W;
    const displayH = Math.round(FUKA_CHAR_MAX_H * scale);
    const src = this.getAttribute('src') || '/components/Fuka_animatiion.png';

    this._scale = scale;
    this._displayH = displayH;
    this._bgW = Math.round(srcW * scale);
    this._bgH = Math.round(srcH * scale);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; width: ${this._displayW}px; height: ${displayH}px; overflow: hidden; border-radius: 50%; }
        .sprite {
          width: 100%; height: 100%;
          background-image: url('${src}');
          background-repeat: no-repeat;
          image-rendering: crisp-edges;
          image-rendering: -webkit-optimize-contrast;
        }
      </style>
      <div class="sprite" id="sp" aria-hidden="true"></div>
    `;
    this._sprite = this.shadowRoot.getElementById('sp');
    this._applyFrame();
  }

  // シーケンスからフレーム番号を取得
  _seqToFrame(seq) {
    if (!this._sequence || this._sequence.length === 0) return 0;
    const idx = seq % this._sequence.length;
    return this._sequence[idx];
  }

  _applyFrame() {
    if (!this._sprite) return;
    const frameIndex = this._seqToFrame(this._seq);
    const [acx, acy] = FUKA_CENTERS[frameIndex];

    // キャラクター中心を表示領域中心に合わせるオフセット
    const posX = (this._displayW  / 2) - acx * this._scale;
    const posY = (this._displayH / 2) - acy * this._scale;

    this._sprite.style.backgroundSize     = `${this._bgW}px ${this._bgH}px`;
    this._sprite.style.backgroundPosition = `${posX.toFixed(2)}px ${posY.toFixed(2)}px`;
  }

  _start() {
    if (this._intervalId) return;
    const seqLength = (this._sequence && this._sequence.length) ? this._sequence.length : FUKA_CENTERS.length;
    this._intervalId = setInterval(() => {
      this._seq = (this._seq + 1) % seqLength;
      this._applyFrame();
    }, 1000 / this._fps);
  }

  _stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
}

if (!customElements.get('fuka-anim')) {
  customElements.define('fuka-anim', FukaAnimation);
}
