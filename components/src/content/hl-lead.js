/* ============================================================
   HL-LEAD — 記事リード文
   使用例: <hl-lead><p>要約テキスト</p></hl-lead>
============================================================ */
class HlLead extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const content = this.innerHTML;
    this.innerHTML = `<div class="hl-lead">${content}</div>`;
  }
}
customElements.define('hl-lead', HlLead);
