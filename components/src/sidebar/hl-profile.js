class HlProfile extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this.innerHTML = `
      <div class="hl-sidebar-block" style="padding: 1.2rem;">
        <div class="hl-profile">
          <div class="hl-profile__header">
            <img src="https://5gkyu.github.io/icon/Fuka_icon.png" alt="きゅー" class="hl-profile__icon" draggable="false" oncontextmenu="return false;" onerror="this.src='https://5gkyu.github.io/icon/Fuka_footer.png'">
            <div class="hl-profile__name-wrap">
              <div class="hl-profile__name">きゅー</div>
              <div class="hl-profile__aliases">Kyu / 5Gkyu / QueenKyu / EMA</div>
              <div class="hl-profile__sns">
                <a href="https://x.com/5gkyu" target="_blank" class="hl-sns-icon" aria-label="X (Twitter)" title="X" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/x.png" alt="X" draggable="false" oncontextmenu="return false;"></a>
                <a href="https://steamcommunity.com/id/QueenKyu" target="_blank" class="hl-sns-icon" aria-label="Steam" title="Steam" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/Steam.png" alt="Steam" draggable="false" oncontextmenu="return false;"></a>
                <a href="https://note.com/5gkyu" target="_blank" class="hl-sns-icon" aria-label="Note" title="Note" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/note.png" alt="Note" draggable="false" oncontextmenu="return false;"></a>
                <a href="https://marshmallow-qa.com/622lav7ywnaaew5" class="hl-sns-icon" aria-label="Marshmallow" title="Marshmallow" oncontextmenu="return false;"><img src="https://5gkyu.github.io/icon/marshmallow.png" alt="Marshmallow" draggable="false" oncontextmenu="return false;"></a>
              </div>
            </div>
          </div>
          <div class="hl-profile__bio">字と絵とコードがちょっとずつかける。ゲームはQueenKyu、それ以外は大体5Gkyuで活動しています。</div>
        </div>
      </div>
    `;
  }
}
customElements.define('hl-profile', HlProfile);
