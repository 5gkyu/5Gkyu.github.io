/**
 * <becky-anim>
 * スプライトシート: 4列 × 2行 = 8フレーム (1254×1254px, 2pxボーダー)
 * 属性:
 *   cols      列数 (default: 4)
 *   rows      行数 (default: 2)
 *   fps       フレームレート (default: 4)
 *   width     表示幅 (default: 120px)
 *   src       スプライト画像パス
 *   img-w     画像幅px (default: 1254)
 *   img-h     画像高さpx (default: 1254)
 *   frame-w   1フレームの幅px・ボーダー除く (default: 312)
 *   frame-h   1フレームの高さpx・ボーダー除く (default: 626)
 *   step-x    列方向ステップpx・ボーダー込み (default: 314)
 *   step-y    行方向ステップpx・ボーダー込み (default: 628)
 * ※ height は frame-w/frame-h の縦横比から自動計算
 */
class BeckyAnimation extends HTMLElement {
  constructor() {
    super();
    this._cols = 4; this._rows = 2; this._fps = 4;
    this._imgW = 1254; this._imgH = 1254;
    this._frameW = 312; this._frameH = 626;
    this._stepX = 314; this._stepY = 628;
    this._displayW = 120;
    this._frame = 0; this._intervalId = null; this._sprite = null;
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
    return ['cols', 'rows', 'fps', 'width', 'src', 'img-w', 'img-h', 'frame-w', 'frame-h', 'step-x', 'step-y'];
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this._readAttrs();
    this._render();
    this._stop();
    this._start();
  }

  _readAttrs() {
    this._cols   = parseInt(this.getAttribute('cols'))    || 4;
    this._rows   = parseInt(this.getAttribute('rows'))    || 2;
    this._fps    = parseFloat(this.getAttribute('fps'))   || 4;
    this._imgW   = parseInt(this.getAttribute('img-w'))   || 1254;
    this._imgH   = parseInt(this.getAttribute('img-h'))   || 1254;
    this._frameW = parseInt(this.getAttribute('frame-w')) || 312;
    this._frameH = parseInt(this.getAttribute('frame-h')) || 626;
    this._stepX  = parseInt(this.getAttribute('step-x'))  || 314;
    this._stepY  = parseInt(this.getAttribute('step-y'))  || 628;
    this._displayW = parseFloat(this.getAttribute('width')) || 120;
  }

  _render() {
    // heightはフレームの縦横比から自動計算
    const displayH = (this._displayW * this._frameH / this._frameW).toFixed(1);
    const src = this.getAttribute('src') || '/components/Becky_animation.png';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; width: ${this._displayW}px; height: ${displayH}px; overflow: hidden; }
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

  _applyFrame() {
    if (!this._sprite) return;
    const scale = this._displayW / this._frameW;
    const bgW = Math.round(this._imgW * scale);
    const bgH = Math.round(this._imgH * scale);
    const col = this._frame % this._cols;
    const row = Math.floor(this._frame / this._cols);
    const posX = -(col * this._stepX * scale);
    const posY = -(row * this._stepY * scale);
    this._sprite.style.backgroundSize     = `${bgW}px ${bgH}px`;
    this._sprite.style.backgroundPosition = `${posX.toFixed(2)}px ${posY.toFixed(2)}px`;
  }

  _start() {
    if (this._intervalId) return;
    const total = this._cols * this._rows;
    this._intervalId = setInterval(() => {
      this._frame = (this._frame + 1) % total;
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

if (!customElements.get('becky-anim')) {
  customElements.define('becky-anim', BeckyAnimation);
}
