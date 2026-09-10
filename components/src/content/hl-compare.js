/* ============================================================
   HL-COMPARE — 2カラム比較
   属性:
     left-label  — 左列の見出し
     right-label — 右列の見出し
   子要素:
     <div slot="left">左内容</div>
     <div slot="right">右内容</div>
   モバイル時: 縦積み
============================================================ */
class HlCompare extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const leftLabel  = this.getAttribute('left-label')  || 'A';
    const rightLabel = this.getAttribute('right-label') || 'B';
    const leftSlot   = this.querySelector('[slot="left"]');
    const rightSlot  = this.querySelector('[slot="right"]');
    const leftContent  = leftSlot  ? leftSlot.innerHTML  : '';
    const rightContent = rightSlot ? rightSlot.innerHTML : '';
    this.innerHTML = `
      <div class="hl-compare">
        <div class="hl-compare__col hl-compare__col--left">
          <div class="hl-compare__label hl-compare__label--left">${leftLabel}</div>
          <div class="hl-compare__body hl-content-text">${leftContent}</div>
        </div>
        <div class="hl-compare__col hl-compare__col--right">
          <div class="hl-compare__label hl-compare__label--right">${rightLabel}</div>
          <div class="hl-compare__body hl-content-text">${rightContent}</div>
        </div>
      </div>`;
  }
}
customElements.define('hl-compare', HlCompare);
