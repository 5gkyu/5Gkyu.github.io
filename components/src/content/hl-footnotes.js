/* ============================================================
   HL-FN / HL-FN-ITEM / HL-FOOTNOTES — 脚注
   hl-fn:        本文中の参照マーカー（属性: num）
   hl-fn-item:   個別注釈エントリ（属性: num、hl-footnotesの子要素として使用）
   hl-footnotes: 脚注一覧コンテナ（属性: label）
   使用例:
     本文中: ...本文テキスト<hl-fn num="1"></hl-fn>...
     末尾:
       <hl-footnotes label="注記">
         <hl-fn-item num="1">注釈テキスト</hl-fn-item>
       </hl-footnotes>
============================================================ */
class HlFn extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const num = this.getAttribute('num') || '?';
    this.innerHTML = `<span class="hl-fn-ref"><a href="#hl-footnote-${num}" id="hl-fn-ref-${num}" aria-label="脚注${num}">[${num}]</a></span>`;
  }
}
customElements.define('hl-fn', HlFn);

class HlFnItem extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const num = this.getAttribute('num') || '?';
    const content = this.innerHTML;
    this.innerHTML = `<span class="hl-footnotes__num"><a href="#hl-fn-ref-${num}" aria-label="本文に戻る">[${num}]</a></span><span>${content}</span>`;
    this.id = `hl-footnote-${num}`;
    this.setAttribute('role', 'listitem');
  }
}
customElements.define('hl-fn-item', HlFnItem);

class HlFootnotes extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const label = this.getAttribute('label') || '参考・注記';
    const items = this.innerHTML;
    this.innerHTML = `<section class="hl-footnotes" aria-label="${label}"><p class="hl-footnotes__title">${label}</p><ol class="hl-footnotes__list">${items}</ol></section>`;
  }
}
customElements.define('hl-footnotes', HlFootnotes);
