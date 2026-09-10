class HlImage extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    
    const src = this.getAttribute('src') || '';
    const alt = this.getAttribute('alt') || '';
    // プレースホルダー（軽量なボカシ用画像など）。指定がなければ透明な1px画像を使用。
    const placeholder = this.getAttribute('placeholder') || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

    this.innerHTML = `
      <div class="hl-lazy-image">
        <img src="${placeholder}" data-src="${src}" alt="${alt}" class="is-loading" draggable="false" oncontextmenu="return false;">
      </div>
    `;
    
    const img = this.querySelector('img');
    
    // Intersection Observerで画面内に入ったら本画像を読み込む
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const trueSrc = img.getAttribute('data-src');
          if (trueSrc) {
            // 裏側で画像を読み込んでから表示を切り替える
            const tempImg = new Image();
            tempImg.src = trueSrc;
            tempImg.onload = () => {
              img.src = trueSrc;
              img.classList.remove('is-loading');
              img.classList.add('is-loaded');
            };
          }
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px 0px' }); // 画面に入る100px手前で読み込み開始
    
    observer.observe(img);
  }
}
customElements.define('hl-image', HlImage);
