/* ============================================================
   SLIDER
============================================================ */
class HlSlider extends HTMLElement {
  static get observedAttributes() { return ['value', 'min', 'max', 'step', 'disabled']; }

  connectedCallback() {
    this._setup();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal || !this._track) return;
    if (name === 'value') {
      this._val = this._clamp(parseFloat(newVal));
      this._update();
    } else {
      // min/max/step/disabled changes require full re-render
      this._setup();
    }
  }

  _setup() {
    this._min      = parseFloat(this.getAttribute('min'))  || 0;
    this._max      = parseFloat(this.getAttribute('max'))  || 100;
    this._step     = parseFloat(this.getAttribute('step')) || 1;
    this._val      = this._clamp(parseFloat(this.getAttribute('value')) || this._min);
    const label    = this.getAttribute('label')  || '';
    const unit     = this.getAttribute('unit')   || '';
    const ticksRaw = this.getAttribute('ticks');
    const disabled = this.hasAttribute('disabled');
    this._unit     = unit;

    const id = 'hl-slider-' + Math.random().toString(36).substr(2, 7);

    let ticksHtml = '';
    if (ticksRaw) {
      const ticks = ticksRaw.split(',').map(s => s.trim());
      ticksHtml = `<div class="hl-slider__ticks" aria-hidden="true">${ticks.map(t => `<span class="hl-slider__tick">${t}</span>`).join('')}</div>`;
    }

    this.innerHTML = `
      <div class="hl-slider${disabled ? ' is-disabled' : ''}">
        ${label ? `<div class="hl-slider__header">
          <label class="hl-slider__label" for="${id}">${label}</label>
          <span class="hl-slider__value" id="${id}-val">${this._fmt(this._val)}</span>
        </div>` : `<div class="hl-slider__header" style="justify-content:flex-end;">
          <span class="hl-slider__value" id="${id}-val">${this._fmt(this._val)}</span>
        </div>`}
        <div class="hl-slider__track" role="none">
          <div class="hl-slider__fill"></div>
          <div class="hl-slider__thumb"
            role="slider"
            id="${id}"
            tabindex="${disabled ? -1 : 0}"
            aria-valuemin="${this._min}"
            aria-valuemax="${this._max}"
            aria-valuenow="${this._val}"
            aria-label="${label || 'スライダー'}"
            ${disabled ? 'aria-disabled="true"' : ''}
          ></div>
        </div>
        ${ticksHtml}
        <input type="range" class="hl-slider__input" min="${this._min}" max="${this._max}" step="${this._step}" value="${this._val}" aria-hidden="true" tabindex="-1">
      </div>`;

    this._track  = this.querySelector('.hl-slider__track');
    this._fill   = this.querySelector('.hl-slider__fill');
    this._thumb  = this.querySelector('.hl-slider__thumb');
    this._valEl  = this.querySelector('.hl-slider__value');
    this._input  = this.querySelector('.hl-slider__input');

    this._update();
    if (!disabled) this._bindEvents();
  }

  _clamp(v) {
    v = Math.min(this._max, Math.max(this._min, v));
    const steps = Math.round((v - this._min) / this._step);
    return parseFloat((this._min + steps * this._step).toFixed(10));
  }

  _fmt(v) {
    return v + (this._unit ? '\u00a0' + this._unit : '');
  }

  _pct() {
    return (this._val - this._min) / (this._max - this._min) * 100;
  }

  _update() {
    const pct = this._pct();
    this._fill.style.width  = pct + '%';
    this._thumb.style.left  = pct + '%';
    this._thumb.setAttribute('aria-valuenow', this._val);
    if (this._valEl) this._valEl.textContent = this._fmt(this._val);
    if (this._input) this._input.value = this._val;
  }

  _posToVal(clientX) {
    const rect = this._track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return this._clamp(this._min + ratio * (this._max - this._min));
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('hl-slider-change', {
      detail: { value: this._val },
      bubbles: true
    }));
  }

  _bindEvents() {
    // Mouse / Touch drag
    const move = (clientX) => {
      this._val = this._posToVal(clientX);
      this._update();
      this._emit();
    };

    this._thumb.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const onMove = (e) => move(e.clientX);
      const onUp   = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    this._thumb.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const onMove = (e) => move(e.touches[0].clientX);
      const onEnd  = () => { document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    });

    // Click on track
    this._track.addEventListener('click', (e) => {
      if (e.target === this._thumb) return;
      this._val = this._posToVal(e.clientX);
      this._update();
      this._emit();
    });

    // Keyboard
    this._thumb.addEventListener('keydown', (e) => {
      let changed = false;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        this._val = this._clamp(this._val + this._step); changed = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        this._val = this._clamp(this._val - this._step); changed = true;
      } else if (e.key === 'Home') {
        this._val = this._min; changed = true;
      } else if (e.key === 'End') {
        this._val = this._max; changed = true;
      }
      if (changed) { e.preventDefault(); this._update(); this._emit(); }
    });
  }

  // Public API
  get value() { return this._val; }
  set value(v) { this._val = this._clamp(parseFloat(v)); this._update(); }
}
customElements.define('hl-slider', HlSlider);
