/* ============================================================
   4. ローディング画面＆遅延表示スキップ (スコープカプセル化)
============================================================ */
(function initHalcyonLoading() {
  const foucStyle = document.getElementById('fouc-prevent');

  if (window.HL_SKIP_LOADING) {
    if (foucStyle) foucStyle.remove();
    return;
  }

  const SHOW_DELAY_MS = 180; // この時間（ms）以内に読み込みが終わればローディング画面を出さない
  const FADE_OUT_MS   = 400; // ローディングフェードアウト時間

  let isPageLoaded = (document.readyState === 'complete');
  let isOverlayShown = false;
  let overlay = null;
  let rafId = null;
  let showTimer = null;

  // ページ読み込み完了時のハンドラ
  function onPageReady() {
    isPageLoaded = true;

    // まだローディング画面が表示されていない（SHOW_DELAY_MS以内に終わった）場合
    if (!isOverlayShown) {
      if (showTimer) clearTimeout(showTimer);
      if (foucStyle) foucStyle.remove();
      document.body.classList.remove('hl-page-entering');
    }
  }

  if (isPageLoaded) {
    onPageReady();
    return;
  }

  window.addEventListener('load', onPageReady, { once: true });
  // 安全のためのフォールバック（DOMContentLoaded後少しして完了とみなす）
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(onPageReady, 600);
  }, { once: true });

  // 180ms待機して、まだ読み込み中ならローディング画面を表示
  showTimer = setTimeout(() => {
    if (isPageLoaded) return;
    showLoadingOverlay();
  }, SHOW_DELAY_MS);

  function showLoadingOverlay() {
    isOverlayShown = true;
    document.body.classList.add('hl-page-entering');

    let viewportMeta = document.querySelector('meta[name="viewport"]');
    let originalViewport = '';
    if (viewportMeta) {
      originalViewport = viewportMeta.content;
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    const STAGE_MSGS = [
      () => 'データをまとめています...',
      () => 'お昼寝の準備をしています...',
      () => 'ちょっとまってね',
      () => 'もうすこし...',
      () => 'ロード完了！',
    ];

    overlay = document.createElement('div');
    overlay.className  = 'hl-overlay';
    overlay.dataset.stage = '-1';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');

    overlay.innerHTML = `
      <div class="hl-char-outer" id="hl-char-outer">
        <div class="hl-char-inner">
          <div id="hl-char-img" class="css-bird">
            <div class="bird-container">
              <div class="bird-leaf leaf1"></div>
              <div class="bird-leaf leaf2"></div>
              <div class="bird-body">
                <div class="bird-eye eye-left"></div>
                <div class="bird-eye eye-right"></div>
                <div class="bird-blush blush-left"></div>
                <div class="bird-blush blush-right"></div>
                <div class="bird-beak"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hl-road-wrap" aria-hidden="true">
        <svg class="hl-road-svg" viewBox="0 0 1440 88" preserveAspectRatio="none">
          <path class="hl-road-bg" d="M0,55 C220,25 390,72 610,42 C830,12 1030,68 1230,40 C1330,25 1395,50 1440,44"/>
          <path class="hl-road-fg" id="hl-road-fg" d="M0,55 C220,25 390,72 610,42 C830,12 1030,68 1230,40 C1330,25 1395,50 1440,44"/>
          <text class="hl-road-milestone" id="hl-m1" x="355" y="62" font-size="18" text-anchor="middle" fill="#9AB08F">✿</text>
          <text class="hl-road-milestone" id="hl-m2" x="720" y="28" font-size="18" text-anchor="middle" fill="#EEAFA1">✦</text>
          <text class="hl-road-milestone" id="hl-m3" x="1080" y="54" font-size="18" text-anchor="middle" fill="#92B5BC">❀</text>
          <text class="hl-road-milestone" id="hl-m4" x="1410" y="34" font-size="16" text-anchor="middle" font-weight="bold" fill="#9AB08F" font-family="'Zen Maru Gothic', sans-serif">★</text>
        </svg>
      </div>
      <div class="hl-message" id="hl-message"></div>
      <div class="hl-bar-wrap">
        <span class="hl-bar-pct" id="hl-bar-pct">0%</span>
        <div class="hl-bar-track">
          <div class="hl-bar-fill" id="hl-bar-fill"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    function alignToVisualViewport() {
      if (!window.visualViewport) return;
      const vv = window.visualViewport;
      overlay.style.position = 'fixed';
      overlay.style.top = `${vv.offsetTop}px`;
      overlay.style.left = `${vv.offsetLeft}px`;
      overlay.style.width = `${vv.width}px`;
      overlay.style.height = `${vv.height}px`;
    }
    if (window.visualViewport) {
      alignToVisualViewport();
      window.visualViewport.addEventListener('resize', alignToVisualViewport);
      window.visualViewport.addEventListener('scroll', alignToVisualViewport);
    }

    const pathFg = overlay.querySelector('#hl-road-fg');
    let pathLen = 0;
    function initPathLength() {
      if (!pathFg) return;
      try {
        pathLen = pathFg.getTotalLength() || 1440;
      } catch (e) {
        pathLen = 1440;
      }
      pathFg.style.strokeDasharray = pathLen;
      pathFg.style.strokeDashoffset = pathLen;
    }
    requestAnimationFrame(initPathLength);

    const charOuter = overlay.querySelector('#hl-char-outer');
    const barFill   = overlay.querySelector('#hl-bar-fill');
    const barPct    = overlay.querySelector('#hl-bar-pct');
    const msgEl     = overlay.querySelector('#hl-message');

    const milestones = [
      { pct: 0.25, el: overlay.querySelector('#hl-m1') },
      { pct: 0.50, el: overlay.querySelector('#hl-m2') },
      { pct: 0.75, el: overlay.querySelector('#hl-m3') },
      { pct: 0.98, el: overlay.querySelector('#hl-m4') },
    ];

    let currentStage = -1;

    function setMessage(stageIndex) {
      if (stageIndex === currentStage) return;
      currentStage = stageIndex;
      overlay.dataset.stage = String(stageIndex);

      if (msgEl) {
        msgEl.classList.add('is-fade');
        setTimeout(() => {
          msgEl.textContent = STAGE_MSGS[stageIndex] ? STAGE_MSGS[stageIndex]() : '';
          msgEl.classList.remove('is-fade');
        }, 120);
      }
    }

    function charX(p) {
      const W = overlay.clientWidth || window.innerWidth;
      const startX = Math.max(16, W * 0.08);
      const endX   = W - Math.max(16, W * 0.08) - 140;
      return startX + (endX - startX) * p;
    }

    function setProgress(p) {
      const pct = Math.min(Math.round(p * 100), 100);
      if (barPct)  barPct.textContent = pct + '%';
      if (barFill) barFill.style.width = pct + '%';

      if (pathFg && pathLen) {
        pathFg.style.strokeDashoffset = String(pathLen * (1 - p));
      }

      if (charOuter) {
        charOuter.style.transform = `translateX(${charX(p)}px)`;
      }

      milestones.forEach(m => {
        if (m.el && p >= m.pct) {
          m.el.classList.add('is-reached');
        }
      });

      if      (p >= 0.95) setMessage(4);
      else if (p >= 0.75) setMessage(3);
      else if (p >= 0.45) setMessage(2);
      else if (p >= 0.15) setMessage(1);
      else                setMessage(0);
    }

    let simulatedProgress = 0.2;

    function tick() {
      // ページ読み込みが完了していれば一気に進行
      const step = isPageLoaded ? 0.09 : 0.025;
      simulatedProgress += step;
      if (simulatedProgress > 1) simulatedProgress = 1;
      setProgress(simulatedProgress);

      if (simulatedProgress < 1 || !isPageLoaded) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          if (foucStyle) foucStyle.remove();
          overlay.classList.add('is-out');

          setTimeout(() => {
            document.body.classList.remove('hl-page-entering');
          }, Math.max(80, FADE_OUT_MS - 150));

          setTimeout(() => {
            overlay.remove();
            if (viewportMeta) {
              viewportMeta.content = originalViewport;
            }
            if (window.visualViewport) {
              window.visualViewport.removeEventListener('resize', alignToVisualViewport);
              window.visualViewport.removeEventListener('scroll', alignToVisualViewport);
            }
          }, FADE_OUT_MS);
        }, 120);
      }
    }

    rafId = requestAnimationFrame(tick);
  }
})();
