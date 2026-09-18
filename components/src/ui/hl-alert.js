class HlAlert extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const type = this.getAttribute('type') || 'info';

    const svgIcons = {
      info: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C7.58 2 4 5.58 4 10c0 2.67 1.34 5.03 3.4 6.43.34.23.6.59.6 1v1.57c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1.57c0-.41.26-.77.6-1C18.66 15.03 20 12.67 20 10c0-4.42-3.58-8-8-8zm-2 19c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-.5h-4v.5zm2-17c3.31 0 6 2.69 6 6 0 1.98-.97 3.74-2.48 4.82-.71.51-1.12 1.33-1.12 2.21v.47h-4.8v-.47c0-.88-.41-1.7-1.12-2.21C7.97 13.74 7 11.98 7 10c0-3.31 2.69-6 6-6z"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
      success: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
    };

    const icon = svgIcons[type] || svgIcons.info;
    const bodyContent = this.innerHTML.trim();

    this.innerHTML = `
      <div class="hl-alert hl-alert--${type}">
        <span class="hl-alert__icon" aria-hidden="true">${icon}</span>
        <div class="hl-alert__body">${bodyContent}</div>
      </div>`;
  }
}
customElements.define('hl-alert', HlAlert);
