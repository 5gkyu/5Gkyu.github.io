/* ============================================================
   HL-ARTICLE — Note記事用 統合ラッパーコンポーネント
   Markdown + HTMLハイブリッド記法対応
   
   使用例:
   <hl-article title="記事タイトル" date="2026.06.01" badge="雑学" description="要約">
     ## 見出し
     本文テキスト。**太字**や `コード` も使えます。
     
     <hl-chat char="A">会話文もそのまま書けます</hl-chat>
     <hl-chat char="B">便利ですね！</hl-chat>
   </hl-article>
============================================================ */

/**
 * 軽量かつHTMLブロックを壊さないMarkdownパーサー
 */
function parseMarkdown(text) {
  if (!text) return '';

  // 行に分割（インデントの共通プレフィックスを除去）
  const rawLines = text.split('\n');
  
  // 最初の数行の空行を除去
  while (rawLines.length > 0 && rawLines[0].trim() === '') rawLines.shift();
  while (rawLines.length > 0 && rawLines[rawLines.length - 1].trim() === '') rawLines.pop();

  // 最小共通インデントを計算してトリム
  let minIndent = Infinity;
  for (const line of rawLines) {
    if (line.trim().length > 0) {
      const match = line.match(/^([ \t]*)/);
      if (match && match[1].length < minIndent) {
        minIndent = match[1].length;
      }
    }
  }
  const lines = (minIndent > 0 && minIndent !== Infinity)
    ? rawLines.map(l => l.startsWith(' '.repeat(minIndent)) ? l.slice(minIndent) : (l.startsWith('\t') ? l.slice(1) : l))
    : rawLines;

  function inlineFormat(str) {
    if (!str) return '';
    return str
      // インラインコード: `code`
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 太字: **text** または __text__
      .replace(/(\*\*|__)([\s\S]*?)\1/g, '<strong>$2</strong>')
      // 斜体: *text* または _text_
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>')
      // リンク: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="hl-link">$1</a>');
  }

  // HTMLブロック内のテキスト部分（タグの外側）にのみインライン装飾を適用する
  function formatHtmlBlockText(html) {
    // pre, code, hl-code, script, style はコード内容保護のため置換しない
    const codeBlocks = [];
    const protectedHtml = html.replace(/<(pre|code|hl-code|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
      const placeholder = `__HL_PROTECTED_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(match);
      return placeholder;
    });

    // タグとテキストに分割
    const parts = protectedHtml.split(/(<[^>]+>)/g);
    const formattedParts = parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part; // HTMLタグはそのまま
      }
      return inlineFormat(part); // テキスト部分のみインライン変換
    });

    let result = formattedParts.join('');
    // 保護したコードブロックを復元
    codeBlocks.forEach((block, idx) => {
      result = result.replace(`__HL_PROTECTED_BLOCK_${idx}__`, block);
    });

    return result;
  }

  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. 空行
    if (trimmed === '') {
      i++;
      continue;
    }

    // 2. HTMLブロック要素（<hl-*, <div>, <p>, <table>, <pre>, <blockquote> 等の開始）
    if (/^<[a-zA-Z0-9\-]+(\s|>|$)/.test(trimmed)) {
      const tagMatch = trimmed.match(/^<([a-zA-Z0-9\-]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
      
      // 単一タグまたは即時閉じているタグ、あるいは通常要素
      const htmlChunk = [];
      let depth = 0;
      let started = false;

      while (i < lines.length) {
        const curLine = lines[i];
        htmlChunk.push(curLine);

        // 開始タグと終了タグの簡易カウント（自己完結タグやvoid要素は考慮）
        const openMatches = (curLine.match(new RegExp(`<${tagName}(\\s|>|$)`, 'gi')) || []).length;
        const closeMatches = (curLine.match(new RegExp(`</${tagName}>`, 'gi')) || []).length;
        
        if (openMatches > 0) started = true;
        depth += (openMatches - closeMatches);

        if (started && depth <= 0) {
          i++;
          break;
        }
        i++;
      }
      const rawHtml = htmlChunk.join('\n');
      output.push(formatHtmlBlockText(rawHtml));
      continue;
    }

    // 3. 見出し: ###, ##, #
    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      output.push(`<h3>${inlineFormat(h3Match[1])}</h3>`);
      i++;
      continue;
    }
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      output.push(`<h2>${inlineFormat(h2Match[1])}</h2>`);
      i++;
      continue;
    }
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      output.push(`<h1>${inlineFormat(h1Match[1])}</h1>`);
      i++;
      continue;
    }

    // 4. 水平線: --- または ***
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      output.push('<hr class="hl-divider">');
      i++;
      continue;
    }

    // 5. リスト（箇条書き: - または * ）
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inlineFormat(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`);
        i++;
      }
      output.push(`<ul>\n${items.join('\n')}\n</ul>`);
      continue;
    }

    // 6. 番号付きリスト: 1. 2. 
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inlineFormat(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        i++;
      }
      output.push(`<ol>\n${items.join('\n')}\n</ol>`);
      continue;
    }

    // 7. 引用: >
    if (/^>\s?/.test(trimmed)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(inlineFormat(lines[i].trim().replace(/^>\s?/, '')));
        i++;
      }
      output.push(`<blockquote><p>${quoteLines.join('<br>')}</p></blockquote>`);
      continue;
    }

    // 8. テーブル: | ヘッダー | ... |
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1].trim();
      if (/^\|(\s*:?-+:?\s*\|)+$/.test(nextTrimmed)) {
        const headerCells = trimmed
          .slice(1, -1)
          .split('|')
          .map(c => c.trim());

        const alignCells = nextTrimmed
          .slice(1, -1)
          .split('|')
          .map(c => {
            const t = c.trim();
            if (t.startsWith(':') && t.endsWith(':')) return 'center';
            if (t.endsWith(':')) return 'right';
            return 'left';
          });

        const ths = headerCells.map((text, idx) => {
          const align = alignCells[idx] || 'left';
          return `<th style="text-align: ${align};">${inlineFormat(text)}</th>`;
        }).join('');

        i += 2;

        const trs = [];
        while (i < lines.length) {
          const rowLine = lines[i].trim();
          if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break;

          const rowCells = rowLine
            .slice(1, -1)
            .split('|')
            .map(c => c.trim());

          const tds = rowCells.map((text, idx) => {
            const align = alignCells[idx] || 'left';
            return `<td style="text-align: ${align};">${inlineFormat(text)}</td>`;
          }).join('');

          trs.push(`<tr>${tds}</tr>`);
          i++;
        }

        output.push(`
<div class="hl-table-wrap" style="margin: 1.8rem 0;">
  <table class="hl-table">
    <thead>
      <tr>${ths}</tr>
    </thead>
    <tbody>
      ${trs.join('\n      ')}
    </tbody>
  </table>
</div>`.trim());
        continue;
      }
    }

    // 9. 通常の段落（連続する非空行を1つの <p> にまとめる）
    const paraLines = [];
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (cur === '') break;
      // 次の行が見出しやリスト、HTMLタグ、テーブルなら段落終了
      if (/^(#{1,6}\s+|[-*]\s+|\d+\.\s+|>|<|```|\|)/.test(cur)) break;
      paraLines.push(inlineFormat(cur));
      i++;
    }
    if (paraLines.length > 0) {
      output.push(`<p>${paraLines.join('<br>')}</p>`);
    }
  }

  return output.join('\n\n');
}

class HlArticle extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const title       = this.getAttribute('title') || document.title || '記事タイトル';
    const date        = this.getAttribute('date')  || '';
    const badge       = this.getAttribute('badge') || '';
    const category    = this.getAttribute('category') || 'Note';
    const categoryUrl = this.getAttribute('category-url') || '/archive/note/';
    const desc        = this.getAttribute('description') || '';

    // ドキュメントタイトルの自動補完
    if (!document.title || document.title.trim() === '' || document.title.includes('Halcyon')) {
      document.title = `${title} | Halcyon - 5Gkyu`;
    }

    // メタディスクリプション補完
    if (desc) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = desc;
    }

    // 元の内部テキスト（Markdown + タグ）を取得してパース
    const rawContent = this.innerHTML;
    const parsedContent = parseMarkdown(rawContent);

    // メタ情報（日付・バッジ）のHTML
    let metaHtml = '';
    if (date || badge) {
      const dateSpan  = date  ? `<span class="article-meta__date">${date}</span>` : '';
      const badgeSpan = badge ? `<span class="article-meta__badge">${badge}</span>` : '';
      metaHtml = `<div class="article-meta">${dateSpan}${badgeSpan}</div>`;
    }

    // 全体のレイアウトを展開
    this.innerHTML = `
      <style>
        .article-meta {
          display: flex;
          gap: 0.8rem;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .article-meta__date {
          font-size: 0.82rem;
          color: var(--clr-brown);
          opacity: 0.5;
          font-weight: 700;
        }
        .article-meta__badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.75rem;
          border-radius: 50px;
          background: rgba(154, 176, 143, 0.15);
          color: var(--clr-sage);
          border: 1px solid rgba(154, 176, 143, 0.3);
        }
        .sidebar-sticky {
          position: sticky;
          top: 90px;
          max-height: calc(100vh - 110px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(154, 176, 143, 0.4) transparent;
        }
        .sidebar-sticky::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-sticky::-webkit-scrollbar-thumb {
          background: rgba(154, 176, 143, 0.4);
          border-radius: 4px;
        }
      </style>

      <site-header site-name="${category}"></site-header>

      <hl-layout cols="2" class="fluffy-entry delay-1">
        <div class="hl-layout-main">

          <hl-breadcrumb
            level1-name="Archive" level1-url="/archive/"
            level2-name="${category}" level2-url="${categoryUrl}"
            current="${title}">
          </hl-breadcrumb>

          <page-title>${title}</page-title>

          ${metaHtml}

          <div class="hl-content-text">
            ${parsedContent}
          </div>

          <hl-share></hl-share>

        </div>

        <aside class="hl-layout-sidebar">
          <hl-profile style="margin-bottom: 1.5rem;"></hl-profile>
          <div class="sidebar-sticky">
            <hl-toc></hl-toc>
          </div>
        </aside>
      </hl-layout>

      <site-footer copy="5Gkyu"></site-footer>
    `;

    // コンテンツ読み込み完了イベントを発火（hl-toc等の再スキャンを促す）
    window.dispatchEvent(new CustomEvent('halcyon-content-loaded'));
  }
}

customElements.define('hl-article', HlArticle);
