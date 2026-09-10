/* ============================================================
   HL-EMBED — 動画埋め込み（YouTube / Niconico 等）
   属性:
     url     — 視聴URL（embed用URLに自動変換）
     src     — embed URL直接指定（urlと排他）
     caption — キャプション（任意）
   対応サービス:
     YouTube: https://www.youtube.com/watch?v=... / https://youtu.be/...
     Niconico: https://www.nicovideo.jp/watch/...
============================================================ */
class HlEmbed extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    let src           = this.getAttribute('src')     || '';
    const url         = this.getAttribute('url')     || '';
    const caption     = this.getAttribute('caption') || '';
    
    // オプション属性の取得
    const autoplay = this.hasAttribute('autoplay');
    const loop = this.hasAttribute('loop');
    const muted = this.hasAttribute('muted');

    if (!src && url) src = HlEmbed.toEmbedUrl(url, { autoplay, loop, muted });
    if (!src) { this.innerHTML = ''; return; }
    
    const captionHtml = caption ? `<p class="hl-embed__caption">${caption}</p>` : '';
    this.innerHTML = `
      <div class="hl-embed">
        <div class="hl-embed__video">
          <iframe src="${src}" allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy" title="${caption || '動画'}"></iframe>
        </div>
        ${captionHtml}
      </div>`;
  }
  
  static toEmbedUrl(url, options = {}) {
    let embedSrc = '';
    let isYouTube = false;
    let videoId = '';
    
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
        videoId = u.searchParams.get('v');
        if (videoId) { embedSrc = `https://www.youtube.com/embed/${videoId}`; isYouTube = true; }
      }
      else if (u.hostname === 'youtu.be') {
        videoId = u.pathname.slice(1);
        if (videoId) { embedSrc = `https://www.youtube.com/embed/${videoId}`; isYouTube = true; }
      }
      else if (u.hostname.includes('nicovideo.jp') && u.pathname.startsWith('/watch/')) {
        videoId = u.pathname.replace('/watch/', '');
        if (videoId) { embedSrc = `https://embed.nicovideo.jp/watch/${videoId}`; }
      }
    } catch (e) {}

    if (!embedSrc) return '';

    // パラメータの組み立て
    const params = new URLSearchParams();
    if (options.autoplay) params.append('autoplay', '1');
    if (options.muted) {
      if (isYouTube) params.append('mute', '1');
      else params.append('muted', '1');
    }
    if (options.loop) {
      if (isYouTube) {
        params.append('loop', '1');
        params.append('playlist', videoId); // YouTubeはloopにplaylistの指定が必要
      } else {
        params.append('loop', '1');
      }
    }
    
    const queryString = params.toString();
    return queryString ? `${embedSrc}?${queryString}` : embedSrc;
  }
}
customElements.define('hl-embed', HlEmbed);
