import { LitElement, html } from 'https://esm.sh/lit';

/**
 * ビフォーアフター比較スライダー (Lit製)
 */
class HlBeforeAfter extends LitElement {
  static properties = {
    before: { type: String },
    after: { type: String },
    labelBefore: { type: String, attribute: 'label-before' },
    labelAfter: { type: String, attribute: 'label-after' },
    sliderPos: { type: Number, state: true }
  };

  constructor() {
    super();
    this.before = '';
    this.after = '';
    this.labelBefore = 'Before';
    this.labelAfter = 'After';
    this.sliderPos = 50;
  }

  createRenderRoot() {
    return this;
  }

  onSliderInput(e) {
    this.sliderPos = Number(e.target.value);
  }

  render() {
    return html`
      <div class="hl-ba-container" style="position:relative; width:100%; max-width:640px; height:320px; border-radius:16px; overflow:hidden; border:1px solid rgba(154,176,143,0.3); user-select:none;">
        <img src="${this.after}" alt="${this.labelAfter}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;">
        <span style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); color:#fff; padding:4px 10px; border-radius:999px; font-size:0.75rem; font-weight:700; z-index:1;">${this.labelAfter}</span>
        
        <div class="hl-ba-before-wrap" style="position:absolute; top:0; left:0; bottom:0; width:${this.sliderPos}%; overflow:hidden; border-right:2px solid #ffffff; box-shadow:2px 0 10px rgba(0,0,0,0.3);">
          <img src="${this.before}" alt="${this.labelBefore}" style="width:640px; height:100%; object-fit:cover;">
          <span style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.6); color:#fff; padding:4px 10px; border-radius:999px; font-size:0.75rem; font-weight:700;">${this.labelBefore}</span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          .value="${this.sliderPos}" 
          @input="${this.onSliderInput}" 
          style="position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:ew-resize; z-index:10;"
        >
      </div>
    `;
  }
}

if (!customElements.get('hl-before-after')) {
  customElements.define('hl-before-after', HlBeforeAfter);
}
