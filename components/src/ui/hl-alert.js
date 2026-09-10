class HlAlert extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const type = this.getAttribute('type') || 'info';
    const BASE = 'https://5gkyu.github.io/icon/';
    const iconMap = {
      info:    `<img src="${BASE}lightbulb.svg" alt="">`,
      warning: `<img src="${BASE}warning.svg"   alt="">`,
      success: `<img src="${BASE}check.svg"     alt="">`,
    };
    const icon = iconMap[type] || iconMap.info;
    this.innerHTML = `<div class="hl-alert hl-alert--${type}"><span class="hl-alert__icon">${icon}</span><div class="hl-content-text hl-alert__body">${this.innerHTML}</div></div>`;
  }
}
customElements.define('hl-alert', HlAlert);
