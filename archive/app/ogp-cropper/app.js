/**
 * OGP Image Cropper - Application Logic
 * Halcyon Web Application
 */

(function () {
  'use strict';

  // プリセット定義
  const PRESETS = {
    'ogp-standard': { name: '標準 OGP (X / Web)', width: 1200, height: 630, ratio: 1200 / 630, sub: '1200 × 630 (1.91:1)' },
    'x-large': { name: 'X / Twitter (16:9)', width: 1200, height: 675, ratio: 16 / 9, sub: '1200 × 675 (16:9)' },
    'note-header': { name: 'note 見出し画像', width: 1280, height: 670, ratio: 1280 / 670, sub: '1280 × 670' },
    'youtube-thumb': { name: 'YouTube サムネイル', width: 1280, height: 720, ratio: 16 / 9, sub: '1280 × 720 (16:9)' },
    'square-1-1': { name: '正方形 (Instagram / アイコン)', width: 1080, height: 1080, ratio: 1, sub: '1080 × 1080 (1:1)' },
    'story-9-16': { name: 'ストーリー / Reels', width: 1080, height: 1920, ratio: 9 / 16, sub: '1080 × 1920 (9:16)' },
    'standard-4-3': { name: '4:3 スタンダード', width: 1200, height: 900, ratio: 4 / 3, sub: '1200 × 900 (4:3)' },
    'custom': { name: 'カスタム比率', width: 1200, height: 630, ratio: 1200 / 630, sub: '自由指定' }
  };

  // アプリケーション状態
  const state = {
    image: null,
    imageLoaded: false,
    currentPreset: 'ogp-standard',
    targetWidth: 1200,
    targetHeight: 630,
    targetRatio: 1200 / 630,
    
    // 変形パラメータ
    scale: 1.0,
    minScale: 0.1,
    maxScale: 5.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0, // 0, 90, 180, 270
    fineRotation: 0, // -45 ~ +45度
    flipH: false,
    flipV: false,

    // 表示ガイド
    showGrid: true,
    showSafeZone: true,
    
    // 背景スタイル ('blur' | 'color' | 'transparent')
    bgMode: 'blur',
    bgColor: '#ffffff',

    // テキストオーバーレイ
    enableText: false,
    textMain: '',
    textSub: '',
    textColor: '#ffffff',
    textBgColor: 'rgba(0, 0, 0, 0.65)',
    textPosition: 'bottom', // 'bottom' | 'center'

    // エクスポート設定
    format: 'image/png',
    quality: 0.92
  };

  // DOM要素
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const cropStage = document.getElementById('crop-stage');
  const canvasContainer = document.getElementById('canvas-container');
  const canvas = document.getElementById('crop-canvas');
  const ctx = canvas.getContext('2d');
  const toast = document.getElementById('app-toast');

  // コントロール要素
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomVal = document.getElementById('zoom-val');
  const rotateSlider = document.getElementById('rotate-slider');
  const rotateVal = document.getElementById('rotate-val');
  const customInputs = document.getElementById('custom-size-inputs');
  const customWidthInput = document.getElementById('custom-width');
  const customHeightInput = document.getElementById('custom-height');
  const exportDim = document.getElementById('export-dim');

  // ドラッグ操作状態
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialOffsetX = 0;
  let initialOffsetY = 0;
  let lastTouchDist = 0;

  // ------------------------------------------------------------
  // トースト表示
  // ------------------------------------------------------------
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // ------------------------------------------------------------
  // 初期化
  // ------------------------------------------------------------
  function init() {
    setupFileInputs();
    setupPresetButtons();
    setupControls();
    setupCanvasInteractions();
    setupExportActions();

    // 画面リサイズ監視
    window.addEventListener('resize', () => {
      if (state.imageLoaded) renderCanvas();
    });

    // クリップボードからの貼り付け対応
    window.addEventListener('paste', handleClipboardPaste);
  }

  // ------------------------------------------------------------
  // ファイル入力＆ドロップゾーン
  // ------------------------------------------------------------
  function setupFileInputs() {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadFile(e.target.files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });
  }

  function handleClipboardPaste(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        loadFile(blob);
        showToast('クリップボードから画像を読み込みました');
        break;
      }
    }
  }

  function loadFile(file) {
    if (!file.type.match('image.*')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        state.imageLoaded = true;
        resetTransform();
        showEditor();
        renderCanvas();
        showToast('画像を読み込みました');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showEditor() {
    document.getElementById('editor-section').style.display = 'block';
    document.getElementById('export-section').style.display = 'block';
    updateDimensionDisplay();
  }

  // ------------------------------------------------------------
  // プリセット切り替え
  // ------------------------------------------------------------
  function setupPresetButtons() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        if (!presetKey || !PRESETS[presetKey]) return;

        presetBtns.forEach((b) => b.classList.toggle('active', b === btn));
        state.currentPreset = presetKey;

        if (presetKey === 'custom') {
          customInputs.style.display = 'flex';
          state.targetWidth = parseInt(customWidthInput.value, 10) || 1200;
          state.targetHeight = parseInt(customHeightInput.value, 10) || 630;
          state.targetRatio = state.targetWidth / state.targetHeight;
        } else {
          customInputs.style.display = 'none';
          const p = PRESETS[presetKey];
          state.targetWidth = p.width;
          state.targetHeight = p.height;
          state.targetRatio = p.ratio;
        }

        updateDimensionDisplay();
        if (state.imageLoaded) {
          fitImageToCrop();
          renderCanvas();
        }
      });
    });

    // カスタムサイズ入力イベント
    const onCustomChange = () => {
      let w = parseInt(customWidthInput.value, 10) || 1200;
      let h = parseInt(customHeightInput.value, 10) || 630;
      w = Math.max(100, Math.min(4000, w));
      h = Math.max(100, Math.min(4000, h));
      state.targetWidth = w;
      state.targetHeight = h;
      state.targetRatio = w / h;
      updateDimensionDisplay();
      if (state.imageLoaded) renderCanvas();
    };

    customWidthInput.addEventListener('input', onCustomChange);
    customHeightInput.addEventListener('input', onCustomChange);
  }

  function updateDimensionDisplay() {
    if (exportDim) {
      exportDim.textContent = `${state.targetWidth} × ${state.targetHeight} px (${(state.targetRatio).toFixed(2)}:1)`;
    }
  }

  // ------------------------------------------------------------
  // 変形・コントローラー
  // ------------------------------------------------------------
  function resetTransform() {
    state.scale = 1.0;
    state.offsetX = 0;
    state.offsetY = 0;
    state.rotation = 0;
    state.fineRotation = 0;
    state.flipH = false;
    state.flipV = false;

    if (zoomSlider) zoomSlider.value = 1.0;
    if (zoomVal) zoomVal.textContent = '100%';
    if (rotateSlider) rotateSlider.value = 0;
    if (rotateVal) rotateVal.textContent = '0°';

    if (state.imageLoaded) fitImageToCrop();
  }

  function fitImageToCrop() {
    if (!state.image) return;
    const imgRatio = state.image.width / state.image.height;
    // 画像がクロップ枠を埋める初期スケールを計算 (Coverモード)
    if (imgRatio > state.targetRatio) {
      // 画像の方が横長 -> 高さに合わせる
      state.scale = 1.0;
    } else {
      // 画像の方が縦長 -> 幅に合わせる
      state.scale = 1.0;
    }
    state.offsetX = 0;
    state.offsetY = 0;
    if (zoomSlider) zoomSlider.value = state.scale;
    if (zoomVal) zoomVal.textContent = `${Math.round(state.scale * 100)}%`;
  }

  function setupControls() {
    // ズームスライダー
    if (zoomSlider) {
      zoomSlider.addEventListener('input', (e) => {
        state.scale = parseFloat(e.target.value);
        if (zoomVal) zoomVal.textContent = `${Math.round(state.scale * 100)}%`;
        renderCanvas();
      });
    }

    // 微調整回転スライダー
    if (rotateSlider) {
      rotateSlider.addEventListener('input', (e) => {
        state.fineRotation = parseInt(e.target.value, 10);
        if (rotateVal) rotateVal.textContent = `${state.fineRotation > 0 ? '+' : ''}${state.fineRotation}°`;
        renderCanvas();
      });
    }

    // 90度回転ボタン
    const btnRotateLeft = document.getElementById('btn-rotate-left');
    const btnRotateRight = document.getElementById('btn-rotate-right');
    if (btnRotateLeft) {
      btnRotateLeft.addEventListener('click', () => {
        state.rotation = (state.rotation - 90 + 360) % 360;
        renderCanvas();
      });
    }
    if (btnRotateRight) {
      btnRotateRight.addEventListener('click', () => {
        state.rotation = (state.rotation + 90) % 360;
        renderCanvas();
      });
    }

    // 反転ボタン
    const btnFlipH = document.getElementById('btn-flip-h');
    const btnFlipV = document.getElementById('btn-flip-v');
    if (btnFlipH) {
      btnFlipH.addEventListener('click', () => {
        state.flipH = !state.flipH;
        btnFlipH.classList.toggle('active', state.flipH);
        renderCanvas();
      });
    }
    if (btnFlipV) {
      btnFlipV.addEventListener('click', () => {
        state.flipV = !state.flipV;
        btnFlipV.classList.toggle('active', state.flipV);
        renderCanvas();
      });
    }

    // 中央揃え / リセットボタン
    const btnCenter = document.getElementById('btn-center');
    const btnReset = document.getElementById('btn-reset');
    if (btnCenter) {
      btnCenter.addEventListener('click', () => {
        state.offsetX = 0;
        state.offsetY = 0;
        renderCanvas();
        showToast('画像を中央に配置しました');
      });
    }
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        resetTransform();
        renderCanvas();
        showToast('位置とサイズをリセットしました');
      });
    }

    // ガイド線トグル
    const btnToggleGrid = document.getElementById('btn-toggle-grid');
    const btnToggleSafe = document.getElementById('btn-toggle-safe');
    if (btnToggleGrid) {
      btnToggleGrid.addEventListener('click', () => {
        state.showGrid = !state.showGrid;
        btnToggleGrid.classList.toggle('active', state.showGrid);
        renderCanvas();
      });
    }
    if (btnToggleSafe) {
      btnToggleSafe.addEventListener('click', () => {
        state.showSafeZone = !state.showSafeZone;
        btnToggleSafe.classList.toggle('active', state.showSafeZone);
        renderCanvas();
      });
    }

    // 背景埋めモード
    const bgBtns = document.querySelectorAll('.bg-mode-btn');
    bgBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        bgBtns.forEach((b) => b.classList.toggle('active', b === btn));
        state.bgMode = btn.getAttribute('data-bg-mode');
        renderCanvas();
      });
    });

    // テキストオーバーレイトグル
    const chkText = document.getElementById('chk-enable-text');
    const textOptions = document.getElementById('text-overlay-options');
    const inputMainText = document.getElementById('input-main-text');
    const inputSubText = document.getElementById('input-sub-text');

    if (chkText && textOptions) {
      chkText.addEventListener('change', (e) => {
        state.enableText = e.target.checked;
        textOptions.style.display = state.enableText ? 'flex' : 'none';
        renderCanvas();
      });
    }
    if (inputMainText) {
      inputMainText.addEventListener('input', (e) => {
        state.textMain = e.target.value;
        renderCanvas();
      });
    }
    if (inputSubText) {
      inputSubText.addEventListener('input', (e) => {
        state.textSub = e.target.value;
        renderCanvas();
      });
    }
  }

  // ------------------------------------------------------------
  // キャンバス・ドラッグ＆ホイール操作
  // ------------------------------------------------------------
  function setupCanvasInteractions() {
    canvasContainer.addEventListener('mousedown', (e) => {
      if (!state.imageLoaded) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialOffsetX = state.offsetX;
      initialOffsetY = state.offsetY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      state.offsetX = initialOffsetX + dx;
      state.offsetY = initialOffsetY + dy;
      renderCanvas();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // マウスホイールズーム
    canvasContainer.addEventListener('wheel', (e) => {
      if (!state.imageLoaded) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale + delta));
      if (zoomSlider) zoomSlider.value = state.scale;
      if (zoomVal) zoomVal.textContent = `${Math.round(state.scale * 100)}%`;
      renderCanvas();
    }, { passive: false });

    // スマホ・タッチ操作
    canvasContainer.addEventListener('touchstart', (e) => {
      if (!state.imageLoaded) return;
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        initialOffsetX = state.offsetX;
        initialOffsetY = state.offsetY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        lastTouchDist = getTouchDist(e.touches[0], e.touches[1]);
      }
    }, { passive: true });

    canvasContainer.addEventListener('touchmove', (e) => {
      if (!state.imageLoaded) return;
      if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        const dx = e.touches[0].clientX - dragStartX;
        const dy = e.touches[0].clientY - dragStartY;
        state.offsetX = initialOffsetX + dx;
        state.offsetY = initialOffsetY + dy;
        renderCanvas();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDist(e.touches[0], e.touches[1]);
        const factor = dist / (lastTouchDist || dist);
        lastTouchDist = dist;
        state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale * factor));
        if (zoomSlider) zoomSlider.value = state.scale;
        if (zoomVal) zoomVal.textContent = `${Math.round(state.scale * 100)}%`;
        renderCanvas();
      }
    }, { passive: false });

    canvasContainer.addEventListener('touchend', () => {
      isDragging = false;
      lastTouchDist = 0;
    });
  }

  function getTouchDist(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ------------------------------------------------------------
  // 描画エンジン (Render Engine)
  // ------------------------------------------------------------
  function renderCanvas() {
    if (!state.imageLoaded || !state.image) return;

    const containerRect = canvasContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const displayW = containerRect.width;
    const displayH = containerRect.height;

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. クロップ領域の計算（ステージ内に最大表示される矩形）
    const padding = 28;
    const maxCropW = displayW - padding * 2;
    const maxCropH = displayH - padding * 2;

    let cropW, cropH;
    if (maxCropW / maxCropH > state.targetRatio) {
      cropH = maxCropH;
      cropW = cropH * state.targetRatio;
    } else {
      cropW = maxCropW;
      cropH = cropW / state.targetRatio;
    }

    const cropX = (displayW - cropW) / 2;
    const cropY = (displayH - cropH) / 2;

    // 背景（ダークチェッカーまたは単色）
    ctx.fillStyle = '#14141e';
    ctx.fillRect(0, 0, displayW, displayH);

    // 2. クロップ枠内にクリッピングして画像を描画
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.clip();

    // 2-a. 背景埋め描画
    if (state.bgMode === 'blur') {
      ctx.save();
      ctx.filter = 'blur(16px) brightness(0.65)';
      ctx.drawImage(state.image, cropX - 20, cropY - 20, cropW + 40, cropH + 40);
      ctx.restore();
    } else if (state.bgMode === 'color') {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(cropX, cropY, cropW, cropH);
    }

    // 2-b. メイン画像の描画
    ctx.save();
    // クロップ枠の中心
    const centerX = cropX + cropW / 2 + state.offsetX;
    const centerY = cropY + cropH / 2 + state.offsetY;

    ctx.translate(centerX, centerY);
    const totalRotation = ((state.rotation + state.fineRotation) * Math.PI) / 180;
    ctx.rotate(totalRotation);
    ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);

    // 画像のアスペクト比を維持してフィットスケールを算出
    const baseScale = Math.max(cropW / state.image.width, cropH / state.image.height);
    const drawW = state.image.width * baseScale * state.scale;
    const drawH = state.image.height * baseScale * state.scale;

    ctx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 2-c. テキストオーバーレイ描画
    if (state.enableText && (state.textMain || state.textSub)) {
      renderTextOverlay(ctx, cropX, cropY, cropW, cropH);
    }

    ctx.restore(); // クリップ解除

    // 3. マスク暗転（クロップ枠外を半透明の黒で覆う）
    ctx.save();
    ctx.fillStyle = 'rgba(10, 12, 20, 0.75)';
    ctx.beginPath();
    ctx.rect(0, 0, displayW, displayH);
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.fill('evenodd');
    ctx.restore();

    // 4. クロップ枠線
    ctx.save();
    ctx.strokeStyle = '#4ae8ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // 4-a. 三分割グリッド線 (Rule of Thirds)
    if (state.showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      // 垂直線
      ctx.beginPath();
      ctx.moveTo(cropX + cropW / 3, cropY);
      ctx.lineTo(cropX + cropW / 3, cropY + cropH);
      ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
      ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
      // 水平線
      ctx.moveTo(cropX, cropY + cropH / 3);
      ctx.lineTo(cropX + cropW, cropY + cropH / 3);
      ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
      ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
      ctx.stroke();
    }

    // 4-b. SNSセーフゾーン（中央80%の目安枠）
    if (state.showSafeZone) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      const safeInsetX = cropW * 0.08;
      const safeInsetY = cropH * 0.08;
      ctx.strokeRect(
        cropX + safeInsetX,
        cropY + safeInsetY,
        cropW - safeInsetX * 2,
        cropH - safeInsetY * 2
      );

      // セーフゾーンラベル
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.font = '10px sans-serif';
      ctx.fillText('Safe Area', cropX + safeInsetX + 6, cropY + safeInsetY + 14);
    }

    ctx.restore();
    ctx.restore();
  }

  // ------------------------------------------------------------
  // テキストオーバーレイ描画ヘルパー
  // ------------------------------------------------------------
  function renderTextOverlay(context, x, y, w, h) {
    context.save();
    const barHeight = Math.max(50, h * 0.22);
    const barY = y + h - barHeight;

    // 背景帯
    context.fillStyle = state.textBgColor;
    context.fillRect(x, barY, w, barHeight);

    // テキスト
    context.fillStyle = state.textColor;
    context.textAlign = 'left';
    context.textBaseline = 'middle';

    const fontSize = Math.max(14, Math.round(barHeight * 0.38));
    context.font = `bold ${fontSize}px sans-serif`;

    const textPaddingX = 16;
    if (state.textMain && state.textSub) {
      context.fillText(state.textMain, x + textPaddingX, barY + barHeight * 0.35, w - textPaddingX * 2);
      context.font = `normal ${Math.round(fontSize * 0.72)}px sans-serif`;
      context.fillStyle = 'rgba(255, 255, 255, 0.85)';
      context.fillText(state.textSub, x + textPaddingX, barY + barHeight * 0.72, w - textPaddingX * 2);
    } else if (state.textMain) {
      context.fillText(state.textMain, x + textPaddingX, barY + barHeight * 0.5, w - textPaddingX * 2);
    }
    context.restore();
  }

  // ------------------------------------------------------------
  // フル解像度エクスポート生成
  // ------------------------------------------------------------
  function generateExportCanvas() {
    if (!state.imageLoaded || !state.image) return null;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = state.targetWidth;
    outCanvas.height = state.targetHeight;
    const outCtx = outCanvas.getContext('2d');

    const outW = state.targetWidth;
    const outH = state.targetHeight;

    // 1. 背景描画
    if (state.bgMode === 'blur') {
      outCtx.save();
      outCtx.filter = 'blur(24px) brightness(0.65)';
      outCtx.drawImage(state.image, -40, -40, outW + 80, outH + 80);
      outCtx.restore();
    } else if (state.bgMode === 'color') {
      outCtx.fillStyle = state.bgColor;
      outCtx.fillRect(0, 0, outW, outH);
    }

    // 2. メイン画像描画
    outCtx.save();
    // プレビュー上の比率からエクスポート解像度へスケーリング
    const containerRect = canvasContainer.getBoundingClientRect();
    const padding = 28;
    const maxCropW = containerRect.width - padding * 2;
    const maxCropH = containerRect.height - padding * 2;
    let previewCropW, previewCropH;
    if (maxCropW / maxCropH > state.targetRatio) {
      previewCropH = maxCropH;
      previewCropW = previewCropH * state.targetRatio;
    } else {
      previewCropW = maxCropW;
      previewCropH = previewCropW / state.targetRatio;
    }

    const scaleFactor = outW / previewCropW;

    const centerX = outW / 2 + state.offsetX * scaleFactor;
    const centerY = outH / 2 + state.offsetY * scaleFactor;

    outCtx.translate(centerX, centerY);
    const totalRotation = ((state.rotation + state.fineRotation) * Math.PI) / 180;
    outCtx.rotate(totalRotation);
    outCtx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);

    const baseScale = Math.max(outW / state.image.width, outH / state.image.height);
    const drawW = state.image.width * baseScale * state.scale;
    const drawH = state.image.height * baseScale * state.scale;

    outCtx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);
    outCtx.restore();

    // 3. テキストオーバーレイ描画
    if (state.enableText && (state.textMain || state.textSub)) {
      renderTextOverlay(outCtx, 0, 0, outW, outH);
    }

    return outCanvas;
  }

  // ------------------------------------------------------------
  // エクスポート＆ダウンロード
  // ------------------------------------------------------------
  function setupExportActions() {
    const btnDownloadPng = document.getElementById('btn-download-png');
    const btnDownloadJpg = document.getElementById('btn-download-jpg');
    const btnDownloadWebp = document.getElementById('btn-download-webp');
    const btnCopyClipboard = document.getElementById('btn-copy-clipboard');

    const downloadImage = (format, ext) => {
      const outCanvas = generateExportCanvas();
      if (!outCanvas) return;

      const dataUrl = outCanvas.toDataURL(format, state.quality);
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ogp_${state.targetWidth}x${state.targetHeight}_${timestamp}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`${ext.toUpperCase()}画像をダウンロードしました`);
    };

    if (btnDownloadPng) {
      btnDownloadPng.addEventListener('click', () => downloadImage('image/png', 'png'));
    }
    if (btnDownloadJpg) {
      btnDownloadJpg.addEventListener('click', () => downloadImage('image/jpeg', 'jpg'));
    }
    if (btnDownloadWebp) {
      btnDownloadWebp.addEventListener('click', () => downloadImage('image/webp', 'webp'));
    }

    // クリップボードへコピー
    if (btnCopyClipboard) {
      btnCopyClipboard.addEventListener('click', async () => {
        const outCanvas = generateExportCanvas();
        if (!outCanvas) return;

        try {
          outCanvas.toBlob(async (blob) => {
            if (!blob) return;
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            showToast('画像をクリップボードにコピーしました！');
          }, 'image/png');
        } catch (err) {
          console.error('Clipboard copy failed:', err);
          showToast('クリップボードへのコピーに対応していません');
        }
      });
    }
  }

  // アプリケーション起動
  window.addEventListener('DOMContentLoaded', init);
})();
