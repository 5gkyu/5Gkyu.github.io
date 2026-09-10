/* ============================================================
   CAROUSEL
============================================================ */
class HlCarousel extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    setTimeout(() => this._setup(), 0);
  }
  _setup() {
    const slides   = Array.from(this.querySelectorAll('.hl-carousel-slide'));
    if (!slides.length) return;
    const loop     = this.hasAttribute('loop');
    const autoplay = this.hasAttribute('autoplay');
    const interval = parseInt(this.getAttribute('interval')) || 4000;
    this._total    = slides.length;
    this._current  = 0;
    const dots = slides.map((_, i) => `<button class="hl-carousel-dot${i === 0 ? ' is-active' : ''}" aria-label="${i + 1}ページ目" data-idx="${i}"></button>`).join('');
    const track = document.createElement('div');
    track.className = 'hl-carousel-track';
    slides.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', `${i + 1} of ${this._total}`);
      track.appendChild(s);
    });
    this.innerHTML = `
      <div role="region" aria-roledescription="carousel" aria-label="ギャラリー">
        <div class="hl-carousel-viewport">
          <button class="hl-carousel-btn hl-carousel-btn--prev" aria-label="前へ">‹</button>
          <button class="hl-carousel-btn hl-carousel-btn--next" aria-label="次へ">›</button>
        </div>
        <div class="hl-carousel-dots">${dots}</div>
      </div>`;
    const viewport = this.querySelector('.hl-carousel-viewport');
    viewport.insertBefore(track, this.querySelector('.hl-carousel-btn--prev'));
    this._track = track;
    this.querySelector('.hl-carousel-btn--prev').addEventListener('click', () => this._go(this._current - 1));
    this.querySelector('.hl-carousel-btn--next').addEventListener('click', () => this._go(this._current + 1));
    this.querySelectorAll('.hl-carousel-dot').forEach(d => d.addEventListener('click', () => this._go(parseInt(d.dataset.idx))));
    if (autoplay) this._timer = setInterval(() => this._go(this._current + 1), interval);
  }
  _go(idx) {
    const loop = this.hasAttribute('loop');
    if (loop) { idx = ((idx % this._total) + this._total) % this._total; }
    else       { idx = Math.max(0, Math.min(this._total - 1, idx)); }
    this._current = idx;
    this._track.style.transform = `translateX(-${idx * 100}%)`;
    this.querySelectorAll('.hl-carousel-dot').forEach((d, i) => d.classList.toggle('is-active', i === idx));
    const prev = this.querySelector('.hl-carousel-btn--prev');
    const next = this.querySelector('.hl-carousel-btn--next');
    if (!loop) { prev.disabled = idx === 0; next.disabled = idx === this._total - 1; }
  }
  disconnectedCallback() { clearInterval(this._timer); }
}
customElements.define('hl-carousel', HlCarousel);
