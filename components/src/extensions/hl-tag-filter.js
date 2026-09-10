import { LitElement, html } from 'https://esm.sh/lit';

/**
 * タグフィルターバーコンポーネント (Lit製)
 */
class HlTagFilter extends LitElement {
  static properties = {
    target: { type: String },
    activeTag: { type: String, state: true }
  };

  constructor() {
    super();
    this.target = '';
    this.activeTag = 'all';
  }

  createRenderRoot() {
    return this;
  }

  setTag(tag) {
    this.activeTag = tag;
    const targetEl = document.getElementById(this.target);
    if (targetEl) {
      const items = targetEl.querySelectorAll('[data-tag]');
      items.forEach(item => {
        const itemTag = item.getAttribute('data-tag');
        if (tag === 'all' || itemTag === tag) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
  }

  render() {
    const tags = [
      { id: 'all', label: 'すべて' },
      { id: 'network', label: 'ネットワーク' },
      { id: 'device', label: 'デバイス' },
      { id: 'system', label: 'システム' }
    ];

    return html`
      <div class="hl-tag-filter-bar" style="display:flex; gap:0.5rem; flex-wrap:wrap; margin:1rem 0;">
        ${tags.map(t => html`
          <hl-button 
            class="hl-tag-btn" 
            variant="${this.activeTag === t.id ? 'primary' : 'secondary'}" 
            size="sm"
            @click="${() => this.setTag(t.id)}"
          >
            ${t.label}
          </hl-button>
        `)}
      </div>
    `;
  }
}

if (!customElements.get('hl-tag-filter')) {
  customElements.define('hl-tag-filter', HlTagFilter);
}
