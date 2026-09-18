class HlChat extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const char  = this.getAttribute('char')  || 'A';
    const defaultAligns = { A: 'left', B: 'right', C: 'left', D: 'right', E: 'right', F: 'left' };
    const align = this.getAttribute('align') || defaultAligns[char] || 'left';
    const src   = this.getAttribute('src')   || '';
    let imgSrc;
    if (src) {
      imgSrc = src;
    } else {
      const charNames = { A: 'Akari', B: 'Becky', C: 'Charlotte', D: 'Dulcie', E: 'Esme', F: 'Fuka' };
      const charName = charNames[char] || char;
      imgSrc = `https://5gkyu.github.io/icon/hl-char/${charName}.png`;
    }
    this.innerHTML = `<div class="hl-chat-wrapper is-${align}" data-char="${char}"><div class="hl-chat-icon"><img src="${imgSrc}" loading="lazy" decoding="async" alt="Character ${char}" draggable="false" oncontextmenu="return false;" onerror="this.style.display='none'; this.parentNode.innerText='${char}'"></div><div class="hl-chat-bubble">${this.innerHTML}</div></div>`;
  }
}
customElements.define('hl-chat', HlChat);
