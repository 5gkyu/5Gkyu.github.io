import { LitElement, html } from 'https://esm.sh/lit';

/**
 * コピーボックスコンポーネント (Lit製)
 */
class HlCopyBox extends LitElement {
  static properties = {
    value: { type: String },
    label: { type: String },
    buttonText: { type: String, attribute: 'button-text' },
    copied: { type: Boolean, state: true }
  };

  constructor() {
    super();
    this.value = '';
    this.label = '';
    this.buttonText = 'コピー';
    this.copied = false;
  }

  createRenderRoot() {
    return this;
  }

  async copy() {
    if (!this.value) return;
    try {
      await navigator.clipboard.writeText(this.value);
      this.copied = true;
      if (window.HlToast) {
        window.HlToast.show('クリップボードにコピーしました', 'success', 2500);
      }
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  }

  render() {
    const currentBtnText = this.copied ? 'コピー完了！' : (this.buttonText || 'コピー');

    return html`
      <div class="hl-copy-box-wrap" style="display:flex; flex-direction:column; gap:0.35rem; background:rgba(248,243,234,0.7); border:1px solid rgba(154,176,143,0.3); padding:0.85rem 1rem; border-radius:12px; margin:0.5rem 0;">
        ${this.label ? html`<span style="font-size:0.75rem; font-weight:600; color:#6e6056;">${this.label}</span>` : ''}
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem;">
          <code style="font-family:'Fira Code',Consolas,monospace; font-size:0.9rem; font-weight:600; color:#b04f35; word-break:break-all;">${this.value}</code>
          <hl-button 
            class="hl-copy-btn" 
            variant="${this.copied ? 'primary' : 'secondary'}" 
            size="sm" 
            icon="copy" 
            @click="${this.copy}"
          >
            ${currentBtnText}
          </hl-button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('hl-copy-box')) {
  customElements.define('hl-copy-box', HlCopyBox);
}
