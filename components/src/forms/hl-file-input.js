/* ============================================================
   HL-FILE-INPUT  — スタイル付きファイル選択コンポーネント
   属性:
     accept   – 許可する MIME タイプ / 拡張子 (例: "image/*")
     multiple – 複数選択を許可
     drop     – ドラッグ＆ドロップゾーン UI を使用
   プロパティ:
     .files   – 選択された FileList
   メソッド:
     .reset() – 選択状態をクリア
   イベント:
     change   – ファイル選択 / ドロップ時に bubbles: true で発火
============================================================ */
class HlFileInput extends HTMLElement {
  static get observedAttributes() { return ['accept', 'multiple', 'drop']; }

  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this._render();
    this._bind();
  }

  _render() {
    const accept   = this.getAttribute('accept') || '';
    const multiple = this.hasAttribute('multiple');
    const drop     = this.hasAttribute('drop');

    if (drop) {
      this.innerHTML = `
        <div class="hl-file-input hl-file-input--drop">
          <span class="hl-file-input__icon"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,44,44a8,8,0,0,0,11.31,0l28.69-28.68L216,184.68V200Z"/><circle cx="96" cy="96" r="16"/></svg></span>
          <button class="hl-file-input__btn" type="button">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12v3a2 2 0 002 2h10a2 2 0 002-2v-3M10 3v9M7 6l3-3 3 3"/>
            </svg>
            ファイルを選択
          </button>
          <span class="hl-file-input__name">選択されていません</span>
          <span class="hl-file-input__hint">またはここにドロップ</span>
          <input type="file" class="hl-file-input__native"${accept ? ` accept="${accept}"` : ''}${multiple ? ' multiple' : ''}>
        </div>`;
    } else {
      this.innerHTML = `
        <div class="hl-file-input">
          <button class="hl-file-input__btn" type="button">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12v3a2 2 0 002 2h10a2 2 0 002-2v-3M10 3v9M7 6l3-3 3 3"/>
            </svg>
            ファイルを選択
          </button>
          <span class="hl-file-input__name">選択されていません</span>
          <input type="file" class="hl-file-input__native"${accept ? ` accept="${accept}"` : ''}${multiple ? ' multiple' : ''}>
        </div>`;
    }

    this._wrap   = this.querySelector('.hl-file-input');
    this._btn    = this.querySelector('.hl-file-input__btn');
    this._name   = this.querySelector('.hl-file-input__name');
    this._native = this.querySelector('.hl-file-input__native');
  }

  _bind() {
    // ボタンクリック → ファイルダイアログを開く
    this._btn.addEventListener('click', () => this._native.click());

    // ドロップゾーンのクリック（ボタン以外の領域）
    if (this.hasAttribute('drop')) {
      this._wrap.addEventListener('click', (e) => {
        if (e.target === this._btn || this._btn.contains(e.target)) return;
        this._native.click();
      });
    }

    // ファイルが選択された
    this._native.addEventListener('change', () => this._onFiles(this._native.files));

    // ドラッグ＆ドロップ (drop 属性がある場合)
    if (this.hasAttribute('drop')) {
      this._wrap.addEventListener('dragover', (e) => {
        e.preventDefault();
        this._wrap.classList.add('is-dragging');
      });
      this._wrap.addEventListener('dragleave', () => {
        this._wrap.classList.remove('is-dragging');
      });
      this._wrap.addEventListener('drop', (e) => {
        e.preventDefault();
        this._wrap.classList.remove('is-dragging');
        const droppedFiles = e.dataTransfer.files;
        if (!droppedFiles.length) return;
        // multiple 属性がない場合は先頭 1 件のみ受け付ける
        const srcArr = this.hasAttribute('multiple')
          ? Array.from(droppedFiles)
          : [droppedFiles[0]];
        try {
          const dt = new DataTransfer();
          srcArr.forEach(f => dt.items.add(f));
          this._native.files = dt.files;
          this._onFiles(dt.files);
        } catch (_) {
          this._onFiles(droppedFiles);
        }
      });
    }
  }

  _onFiles(files) {
    if (files && files.length) {
      const names = Array.from(files).map(f => f.name).join(', ');
      this._name.textContent = names;
      this._name.classList.add('is-set');
    } else {
      this._name.textContent = '選択されていません';
      this._name.classList.remove('is-set');
    }
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  get files() { return this._native ? this._native.files : null; }

  reset() {
    if (this._native) this._native.value = '';
    if (this._name) {
      this._name.textContent = '選択されていません';
      this._name.classList.remove('is-set');
    }
  }
}
customElements.define('hl-file-input', HlFileInput);
