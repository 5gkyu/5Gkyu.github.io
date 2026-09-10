/* ============================================================
   FORM COMPONENTS
============================================================ */
class HlInput extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const name     = this.getAttribute('name') || 'input';
    const type     = this.getAttribute('type') || 'text';
    const ph       = this.getAttribute('placeholder') || '';
    const label    = this.getAttribute('label') || '';
    const hint     = this.getAttribute('hint') || '';
    const autocomplete = this.getAttribute('autocomplete') || 'off'; // 追加
    const required = this.hasAttribute('required');
    const optional = this.hasAttribute('optional');
    const val      = this.getAttribute('value') || '';
    const badge    = required ? '<span class="hl-label__required">必須</span>'
                   : optional ? '<span class="hl-label__optional">任意</span>' : '';
    const labelHtml = label ? `<label class="hl-label" for="hl-${name}">${label}${badge}</label>` : '';
    const hintHtml  = hint  ? `<span class="hl-field-hint">${hint}</span>` : '';
    // autocomplete="${autocomplete}" を追加
    this.innerHTML = `<div class="hl-field">${labelHtml}<input class="hl-input" id="hl-${name}" name="${name}" type="${type}" placeholder="${ph}" value="${val}" autocomplete="${autocomplete}"${required ? ' required' : ''}><div class="hl-field-error" style="display:none;" aria-live="polite"></div>${hintHtml}</div>`;
  }
}
customElements.define('hl-input', HlInput);
