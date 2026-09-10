class HlTextarea extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name     = this.getAttribute('name') || 'textarea';
    const ph       = this.getAttribute('placeholder') || '';
    const label    = this.getAttribute('label') || '';
    const hint     = this.getAttribute('hint') || '';
    const rows     = this.getAttribute('rows') || '4';
    const required = this.hasAttribute('required');
    const optional = this.hasAttribute('optional');
    const inner    = this.innerHTML.trim();
    const badge    = required ? '<span class="hl-label__required">必須</span>' : optional ? '<span class="hl-label__optional">任意</span>' : '';
    const labelHtml = label ? `<label class="hl-label" for="hl-${name}">${label}${badge}</label>` : '';
    const hintHtml  = hint  ? `<span class="hl-field-hint" id="hl-hint-${name}">${hint}</span>` : '';
    this.innerHTML = `<div class="hl-field">${labelHtml}<textarea class="hl-textarea" id="hl-${name}" name="${name}" placeholder="${ph}" rows="${rows}"${required ? ' required aria-required="true"' : ''}${hint ? ` aria-describedby="hl-hint-${name}"` : ''}>${inner}</textarea><div class="hl-field-error" style="display:none;" aria-live="polite"></div>${hintHtml}</div>`;
  }
}
customElements.define('hl-textarea', HlTextarea);
