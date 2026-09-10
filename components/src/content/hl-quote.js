/* --- QUOTE --- */
class HlQuote extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const source = this.getAttribute('source') || '';
    const href = this.getAttribute('href') || '';
    const citeHtml = source ? (href ? `<cite class="hl-quote__cite"><a href="${href}" target="_blank" rel="noopener noreferrer" class="hl-link">― ${source}</a></cite>` : `<cite class="hl-quote__cite">― ${source}</cite>`) : '';
    this.innerHTML = `<blockquote class="hl-quote"><div class="hl-quote__icon">“</div><div class="hl-quote__body hl-content-text">${this.innerHTML}</div>${citeHtml}</blockquote>`;
  }
}
customElements.define('hl-quote', HlQuote);
