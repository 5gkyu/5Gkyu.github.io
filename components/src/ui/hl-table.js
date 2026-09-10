/* ============================================================
   TABLE
============================================================ */
class HlTable extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    const striped = this.hasAttribute('striped') ? ' hl-table--striped' : '';
    const compact = this.hasAttribute('compact') ? ' hl-table--compact' : '';
    const table = this.querySelector('table');
    if (!table) return;
    table.classList.add('hl-table');
    if (striped) table.classList.add('hl-table--striped');
    if (compact) table.classList.add('hl-table--compact');
    const wrap = document.createElement('div');
    wrap.className = 'hl-table-wrap';
    this.appendChild(wrap);
    wrap.appendChild(table);
  }
}
customElements.define('hl-table', HlTable);
