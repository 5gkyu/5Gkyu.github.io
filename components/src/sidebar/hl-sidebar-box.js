class HlSidebarBox extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const title = this.getAttribute('title');
    const icon = this.getAttribute('icon');
    let iconHtml = '';
    if (icon) {
      if (icon.match(/^[a-zA-Z0-9\-]+$/)) {
        iconHtml = `<span><hl-icon name="${icon}"></hl-icon></span>`;
      } else {
        iconHtml = `<span>${icon}</span>`;
      }
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'hl-sidebar-block';
    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'hl-sidebar-title';
      titleEl.innerHTML = `${iconHtml}${title}`;
      wrapper.appendChild(titleEl);
    }

    // 既存の子ノード（イベントリスナーや入力状態）を維持したまま移動
    while (this.firstChild) {
      wrapper.appendChild(this.firstChild);
    }
    this.appendChild(wrapper);
  }
}
customElements.define('hl-sidebar-box', HlSidebarBox);
