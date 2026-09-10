class HlSelect extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name     = this.getAttribute('name') || 'select';
    const label    = this.getAttribute('label') || '';
    const hint     = this.getAttribute('hint') || '';
    const required = this.hasAttribute('required');
    const optional = this.hasAttribute('optional');
    const options  = this.innerHTML;
    const badge    = required ? '<span class="hl-label__required">必須</span>' : optional ? '<span class="hl-label__optional">任意</span>' : '';
    const labelHtml = label ? `<label class="hl-label" for="hl-${name}">${label}${badge}</label>` : '';
    const hintHtml  = hint  ? `<span class="hl-field-hint" id="hl-hint-${name}">${hint}</span>` : '';
    this.innerHTML = `<div class="hl-field">${labelHtml}<div class="hl-select-wrap"><select class="hl-select" id="hl-${name}" name="${name}"${required ? ' required aria-required="true"' : ''}${hint ? ` aria-describedby="hl-hint-${name}"` : ''}>${options}</select></div>${hintHtml}</div>`;
  }
}
customElements.define('hl-select', HlSelect);
