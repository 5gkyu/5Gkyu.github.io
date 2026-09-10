/* ============================================================
   ARCHIVE SEARCH COMPONENT
============================================================ */
class HlArchiveSearch extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const target      = this.getAttribute('target')      || 'sections-container';
    const placeholder = this.getAttribute('placeholder') || 'タイトル・内容で検索…';

    this.innerHTML = `
      <style>
        .hl-asearch {
          margin-bottom: 2rem;
        }
        .hl-asearch__field {
          position: relative;
          display: flex;
          align-items: center;
        }
        .hl-asearch__icon {
          position: absolute;
          left: 1rem;
          pointer-events: none;
          opacity: 0.45;
          display: flex;
          align-items: center;
          color: var(--clr-brown);
        }
        .hl-asearch__icon svg {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
        .hl-asearch__input {
          width: 100%;
          padding: 0.75rem 2.8rem 0.75rem 2.6rem;
          border: 1.5px solid rgba(106, 86, 74, 0.15);
          border-radius: 50px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(6px);
          color: var(--clr-brown);
          font-family: var(--font-main);
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          -webkit-appearance: none;
          appearance: none;
        }
        .hl-asearch__input::placeholder { opacity: 0.45; }
        .hl-asearch__input:focus {
          border-color: var(--clr-sage);
          box-shadow: 0 0 0 3px rgba(154, 176, 143, 0.18);
        }
        /* ネイティブのクリアボタンを隠す */
        .hl-asearch__input::-webkit-search-cancel-button { display: none; }
        .hl-asearch__clear {
          position: absolute;
          right: 0.85rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          color: var(--clr-brown);
          opacity: 0.4;
          padding: 0.25rem 0.35rem;
          border-radius: 50%;
          line-height: 1;
          transition: opacity 0.15s ease, background 0.15s ease;
        }
        .hl-asearch__clear:hover { opacity: 0.75; background: rgba(106,86,74,0.08); }
        .hl-asearch__meta {
          margin-top: 0.6rem;
          min-height: 1.2em;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--clr-brown);
          opacity: 0.5;
          padding-left: 0.3rem;
        }
        .hl-asearch__empty {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--clr-brown);
          opacity: 0.45;
          padding: 2.5rem 1rem;
          border: 1.5px dashed rgba(106,86,74,0.12);
          border-radius: 16px;
        }
      </style>
      <div class="hl-asearch" role="search" aria-label="記事内検索">
        <div class="hl-asearch__field">
          <span class="hl-asearch__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg></span>
          <input type="search" class="hl-asearch__input" placeholder="${placeholder}" aria-label="記事を検索">
          <button class="hl-asearch__clear" aria-label="検索をクリア" style="display:none;">✕</button>
        </div>
        <p class="hl-asearch__meta" aria-live="polite"></p>
      </div>
    `;

    const input   = this.querySelector('.hl-asearch__input');
    const clearBtn = this.querySelector('.hl-asearch__clear');
    const metaEl  = this.querySelector('.hl-asearch__meta');

    // 既存の empty placeholder 要素を管理 (sections-container 外に配置)
    let emptyEl = null;

    const doFilter = () => {
      const q = input.value.trim().toLowerCase();
      const container = document.getElementById(target);
      if (!container) return;

      clearBtn.style.display = q ? '' : 'none';

      const cards = container.querySelectorAll('hl-card');
      let total = cards.length;
      let visible = 0;

      cards.forEach(card => {
        const title = (card.getAttribute('title') || '').toLowerCase();
        const body  = (card.textContent || '').toLowerCase();
        const match = !q || title.includes(q) || body.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // セクションに可視カードがなければセクションごと隠す
      container.querySelectorAll('section.hl-section').forEach(sec => {
        const any = [...sec.querySelectorAll('hl-card')].some(c => c.style.display !== 'none');
        sec.style.display = any ? '' : 'none';
      });

      if (q) {
        metaEl.textContent = visible === 0 ? '一致する記事が見つかりませんでした' : `${visible} / ${total} 件`;
        // 0件のとき空状態プレースホルダー表示
        if (!emptyEl) {
          emptyEl = document.createElement('p');
          emptyEl.className = 'hl-asearch__empty';
          emptyEl.textContent = '「' + input.value.trim() + '」に一致する記事はありませんでした。';
          container.after(emptyEl);
        }
        if (visible === 0) {
          emptyEl.textContent = '「' + input.value.trim() + '」に一致する記事はありませんでした。';
          emptyEl.style.display = '';
        } else {
          emptyEl.style.display = 'none';
        }
      } else {
        metaEl.textContent = '';
        if (emptyEl) emptyEl.style.display = 'none';
      }
    };

    const wireEvents = () => {
      input.addEventListener('input', doFilter);
      clearBtn.addEventListener('click', () => {
        input.value = '';
        doFilter();
        input.focus();
      });
      // Enterキーでフォームのデフォルト送信を防止
      input.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    };

    // コンテンツがすでに読み込まれているか、後で読み込まれるかを判定
    const container = document.getElementById(target);
    if (container && container.children.length > 0) {
      wireEvents();
    } else {
      window.addEventListener('halcyon-content-loaded', wireEvents, { once: true });
    }
  }
}
customElements.define('hl-archive-search', HlArchiveSearch);
