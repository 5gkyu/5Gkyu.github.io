/**
 * Image Splitter - Main Logic
 */

let originalImage = null; // 読み込んだ元画像オブジェクト (Image)
let originalFilename = 'image';
let mainMode = 'square'; // 'square' または 'rect'
let squareCount = 3; // 正方形モードの分割数 (3x3)
let splitImagesData = []; // 切り出した画像のBase64データ配列

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('image-input');
  const fileNameDisplay = document.getElementById('file-name-display');

  // 標準の input type="file" の change イベントを監視
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      fileNameDisplay.textContent = '選択されていません';
      return;
    }

    fileNameDisplay.textContent = file.name;

    if (!file.type.startsWith('image/')) {
      if (window.HlToast) window.HlToast.show('画像ファイルを選択してください。', 'error');
      return;
    }

    // 元のファイル名を保持（拡張子を除く）
    originalFilename = file.name.replace(/\.[^/.]+$/, "");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        processImage(); // 画像処理開始
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
});

/**
 * モード（正方形 / 長方形）の切り替え
 */
function switchMainMode(mode) {
  mainMode = mode;

  const tabSquare = document.getElementById('tab-square');
  const tabRect = document.getElementById('tab-rect');
  const squareOpts = document.getElementById('square-options');
  const rectOpts = document.getElementById('rect-options');

  if (mode === 'square') {
    tabSquare.setAttribute('variant', 'primary');
    tabSquare.setAttribute('selected', '');
    tabRect.setAttribute('variant', 'secondary');
    tabRect.removeAttribute('selected');
    squareOpts.style.display = 'flex';
    rectOpts.style.display = 'none';
  } else {
    tabSquare.setAttribute('variant', 'secondary');
    tabSquare.removeAttribute('selected');
    tabRect.setAttribute('variant', 'primary');
    tabRect.setAttribute('selected', '');
    squareOpts.style.display = 'none';
    rectOpts.style.display = 'block';
  }

  if (originalImage) {
    processImage();
  }
}

/**
 * 正方形プリセット切り替え
 */
function setSquarePreset(count) {
  squareCount = count;

  document.querySelectorAll('#square-options .split-btn').forEach(btn => {
    btn.setAttribute('variant', 'secondary');
    btn.removeAttribute('selected');
  });
  const activeBtn = document.getElementById(`btn-${count}x${count}`);
  if (activeBtn) {
    activeBtn.setAttribute('variant', 'primary');
    activeBtn.setAttribute('selected', '');
  }

  if (originalImage) {
    processImage();
  }
}

/**
 * 長方形モードの入力パラメータ変更時
 */
function onRectParamChange() {
  if (originalImage && mainMode === 'rect') {
    processImage();
  }
}

/**
 * 画像の分割処理とプレビュー表示
 */
function processImage() {
  if (!originalImage) return;

  const resultArea = document.getElementById('result-area');
  const previewGrid = document.getElementById('grid-preview');
  
  resultArea.style.display = 'block';
  previewGrid.innerHTML = '';
  splitImagesData = []; // 初期化

  let cols = 3;
  let rows = 3;
  let pieceWidth = 0;
  let pieceHeight = 0;
  let startX = 0;
  let startY = 0;
  let modeName = '';

  const imgWidth = originalImage.width;
  const imgHeight = originalImage.height;

  if (mainMode === 'square') {
    cols = squareCount;
    rows = squareCount;
    modeName = `${cols}x${rows}`;

    // 短辺を基準に正方形クロップ
    const squareSize = Math.min(imgWidth, imgHeight);
    startX = (imgWidth - squareSize) / 2;
    startY = (imgHeight - squareSize) / 2;
    pieceWidth = squareSize / cols;
    pieceHeight = squareSize / rows;

    previewGrid.style.aspectRatio = '1 / 1';
  } else {
    // 長方形モード（ユーザー指定の列数・行数で画像全体を均等分割）
    const colsInput = parseInt(document.getElementById('rect-cols').value);
    const rowsInput = parseInt(document.getElementById('rect-rows').value);
    cols = isNaN(colsInput) || colsInput < 1 ? 3 : Math.min(colsInput, 15);
    rows = isNaN(rowsInput) || rowsInput < 1 ? 2 : Math.min(rowsInput, 15);
    modeName = `${cols}x${rows}`;

    startX = 0;
    startY = 0;
    pieceWidth = imgWidth / cols;
    pieceHeight = imgHeight / rows;

    previewGrid.style.aspectRatio = `${imgWidth} / ${imgHeight}`;
  }

  // グリッドレイアウトの更新
  previewGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  previewGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  // Canvasを作成して処理
  const canvas = document.createElement('canvas');
  canvas.width = pieceWidth;
  canvas.height = pieceHeight;
  const ctx = canvas.getContext('2d');

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 元画像の該当部分を描画
      ctx.drawImage(
        originalImage,
        startX + (c * pieceWidth),  // ソースX
        startY + (r * pieceHeight), // ソースY
        pieceWidth, pieceHeight,    // ソースW, H
        0, 0,                        // 描画先X, Y
        pieceWidth, pieceHeight     // 描画先W, H
      );

      // Base64エンコード (JPEG 95%品質)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      const index = (r * cols) + c + 1;
      // 保存ファイル名: 分割数x分割数_ナンバリング.jpg (例: 3x3_1.jpg)
      const pieceFilename = `${cols}x${rows}_${index}.jpg`;
      
      splitImagesData.push({
        dataUrl: dataUrl,
        filename: pieceFilename,
        index: index
      });

      // プレビュー要素
      const cell = document.createElement('div');
      cell.className = 'grid-preview-cell';
      
      const imgElem = document.createElement('img');
      imgElem.src = dataUrl;
      imgElem.className = 'grid-preview-item';
      imgElem.title = `保存: ${pieceFilename}`;
      
      cell.onclick = () => downloadSingleImage(dataUrl, pieceFilename);
      
      cell.appendChild(imgElem);
      previewGrid.appendChild(cell);
    }
  }

  if (window.HlToast) {
    window.HlToast.show(`画像を ${cols}×${rows} (${cols * rows}枚) に分割しました`, 'success');
  }
}

/**
 * 画像1枚をダウンロード
 */
function downloadSingleImage(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (window.HlToast) {
    window.HlToast.show(`${filename} を保存しました`, 'success');
  }
}

/**
 * JSZipを利用してすべての画像をZIPで一括ダウンロード
 */
async function downloadAllAsZip() {
  if (splitImagesData.length === 0) return;

  const btn = document.getElementById('btn-download-zip');
  const originalText = btn.innerHTML;
  btn.innerHTML = '処理中...';
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.7';

  try {
    const zip = new JSZip();
    // 例: split_3x3 フォルダ
    const firstFilename = splitImagesData[0].filename.split('_')[0];
    const folderName = `split_${firstFilename}`;
    const folder = zip.folder(folderName);

    splitImagesData.forEach(item => {
      // "data:image/jpeg;base64,....." のプレフィックスを取り除く
      const base64Data = item.dataUrl.split(',')[1];
      folder.file(item.filename, base64Data, {base64: true});
    });

    const content = await zip.generateAsync({type:"blob"});
    
    // ダウンロード
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${folderName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    if (window.HlToast) {
      window.HlToast.show('ZIPファイルの一括ダウンロードが完了しました', 'success');
    }
  } catch (error) {
    console.error(error);
    if (window.HlToast) {
      window.HlToast.show('ZIPの生成に失敗しました', 'error');
    }
  } finally {
    // ボタンの状態復元
    btn.innerHTML = originalText;
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
  }
}
