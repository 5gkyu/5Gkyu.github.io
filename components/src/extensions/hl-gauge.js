import { LitElement, html } from 'https://esm.sh/lit';

/**
 * ゲージメーターコンポーネント (Lit製)
 * 属性値（value, max など）の変更を自動で検知して滑らかにリアクティブ描画します。
 */
class HlGauge extends LitElement {
  static properties = {
    value: { type: Number },
    max: { type: Number },
    label: { type: String },
    unit: { type: String },
    color: { type: String }
  };

  constructor() {
    super();
    this.value = 0;
    this.max = 100;
    this.label = '';
    this.unit = '%';
    this.color = '#2d6c66';
  }

  // 既存のグローバルCSSをそのまま適用するため Light DOM としてレンダリング
  createRenderRoot() {
    return this;
  }

  render() {
    const val = Number(this.value) || 0;
    const max = Number(this.max) || 100;
    const pct = Math.min(100, Math.max(0, Math.round((val / max) * 100)));
    const strokeDash = (pct / 100) * 251.2;

    return html`
      <div class="hl-gauge-wrap" style="display:inline-flex; flex-direction:column; align-items:center; gap:0.5rem; padding:1.25rem; background:rgba(255,255,255,0.75); border:1px solid rgba(154,176,143,0.25); border-radius:16px; text-align:center;">
        <div style="position:relative; width:90px; height:90px;">
          <svg width="90" height="90" viewBox="0 0 100 100" style="transform:rotate(-90deg);">
            <circle cx="50" cy="50" r="40" stroke="rgba(154,176,143,0.2)" stroke-width="8" fill="none"></circle>
            <circle cx="50" cy="50" r="40" stroke="${this.color}" stroke-width="8" fill="none" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - strokeDash}" stroke-linecap="round" style="transition: stroke-dashoffset 0.8s ease;"></circle>
          </svg>
          <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:'Fira Code',monospace; font-size:1.1rem; font-weight:700; color:#2f2218;">
            ${pct}<small style="font-size:0.65rem;">${this.unit}</small>
          </div>
        </div>
        ${this.label ? html`<span style="font-size:0.8rem; font-weight:700; color:#2f2218;">${this.label}</span>` : ''}
      </div>
    `;
  }
}

if (!customElements.get('hl-gauge')) {
  customElements.define('hl-gauge', HlGauge);
}
