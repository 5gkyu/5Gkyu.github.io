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

    const leftLabel  = this.getAttribute('left-label')  || '項目 A';
    const rightLabel = this.getAttribute('right-label') || '項目 B';
    const leftSlot   = this.querySelector('[slot="left"]');
    const rightSlot  = this.querySelector('[slot="right"]');

    const formatSlot = (slot) => {
      if (!slot) return '';
      let html = slot.innerHTML.trim();

      // インライン装飾（**太字**、`コード`、リンク等）
      const formatInline = (str) => {
        return str
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/(\*\*|__)([\s\S]*?)\1/g, '<strong>$2</strong>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="hl-link">$1</a>');
      };

      // すでに ul, ol, p などのブロックタグが含まれていればタグ外のみフォーマット
      if (/<(ul|ol|p|div|table)\b/i.test(html)) {
        return formatInline(html);
      }

      // 行に分割してリストまたは段落に自動整形
      const lines = html.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const isAllList = lines.length > 0 && lines.every(l => /^[-*•]\s+/.test(l));

      if (isAllList) {
        const items = lines.map(l => {
          const text = l.replace(/^[-*•]\s+/, '');
          return `<li>${formatInline(text)}</li>`;
        }).join('\n');
        return `<ul class="hl-compare__list">\n${items}\n</ul>`;
      }

      // 通常テキストの場合
      return lines.map(l => `<p>${formatInline(l)}</p>`).join('\n');
    };

    const leftContent  = formatSlot(leftSlot);
    const rightContent = formatSlot(rightSlot);

    this.innerHTML = `
      <div class="hl-compare">
        <div class="hl-compare__col hl-compare__col--left">
          <div class="hl-compare__label hl-compare__label--left">
            <span class="hl-compare__badge">${leftLabel}</span>
          </div>
          <div class="hl-compare__body">${leftContent}</div>
        </div>
        <div class="hl-compare__col hl-compare__col--right">
          <div class="hl-compare__label hl-compare__label--right">
            <span class="hl-compare__badge">${rightLabel}</span>
          </div>
          <div class="hl-compare__body">${rightContent}</div>
        </div>
      </div>`;
  }
}
customElements.define('hl-compare', HlCompare);
