// ドット絵パレット変換 - メインスクリプト
const RECENT_KEY = "recentPalettes";

document.addEventListener("DOMContentLoaded", ()=> {
  // DOM refs
  const fileInput = document.getElementById("file");
  const fileInfo = document.getElementById("fileInfo");
  const srcC = document.getElementById("src");
  const dstC = document.getElementById("dst");
  const srcWrapper = document.getElementById("srcWrapper");
  const dstWrapper = document.getElementById("dstWrapper");
  const dlBtn = document.getElementById("download");
  const exportSvgBtn = document.getElementById("exportSvg");
  const paletteInput = document.getElementById("paletteInput");
  const palettePreview = document.getElementById("palettePreview");
  const paletteEditor = document.getElementById("paletteEditor");
  const selectedPalettePreview = document.getElementById("selectedPalettePreview");
  const usedColorCountEl = document.getElementById("usedColorCount");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  const imageExportFormat = document.getElementById("imageExportFormat");
  const exportImageBtn = document.getElementById("exportImageBtn");
  const paletteFormatSelect = document.getElementById("paletteFormatSelect");
  const exportPaletteBtn = document.getElementById("exportPaletteBtn");
  const outW = document.getElementById("outWidth");
  const outH = document.getElementById("outHeight");
  const toggleKeepAspectBtn = document.getElementById("toggleKeepAspectBtn");
  const applyPaletteBtn = document.getElementById("applyPaletteBtn");
  const dotScale = document.getElementById("dotScaleSlider");
  const dotScaleInfo = document.getElementById("dotScaleValue");
  const edgeStrengthSlider = document.getElementById("edgeStrengthSlider");
  const edgeStrengthNumber = document.getElementById("edgeStrengthNumber");
  const edgeStrengthValue = document.getElementById("edgeStrengthValue");
  const showNumber = document.getElementById("showNumber");
  const borderCheckbox = document.getElementById("borderCheckbox");
  const ditherCheckbox = document.getElementById("ditherCheckbox");
  const paletteOnlyCheckbox = document.getElementById("paletteOnlyCheckbox");
  const ditherPatternSelect = document.getElementById("ditherPattern");
  const ditherStrengthSlider = document.getElementById("ditherStrengthSlider");
  const ditherStrengthNumber = document.getElementById("ditherStrengthNumber");
  const ditherStrengthValue = document.getElementById("ditherStrengthValue");
  const exportJsonBtn = document.getElementById("exportJson");
  const importJsonInput = document.getElementById("importJson");
  const useLabInput = document.getElementById("useLab");
  const keepAlphaInput = document.getElementById("keepAlpha");
  const recentRow = document.getElementById("recentRow");
  const helpBtn = document.getElementById("helpBtn");
  const kbdBtn = document.getElementById("kbdBtn");
  const autoReduceColorCount = document.getElementById("autoReduceColorCount");
  const autoReduceColorSlider = document.getElementById("autoReduceColorSlider");
  const convertPreset = document.getElementById("convertPreset");
  const reduceMethodSelect = document.getElementById("reduceMethod");
  const openTestModalBtn = document.getElementById("openTestModalBtn");
  const testModal = document.getElementById("testModal");
  const closeTestModalBtn = document.getElementById("closeTestModalBtn");

  const AUTO_REDUCE_COUNTS = [8, 16, 32, 64, 128, 256];
  const PALETTE_CACHE_LIMIT = 12;
  const paletteExtractionCache = new Map();

  function normalizeAutoReduceCount(value){
    const parsed = parseInt(value, 10);
    if(!Number.isFinite(parsed)) return 32;
    let nearest = AUTO_REDUCE_COUNTS[0];
    let nearestDist = Math.abs(parsed - nearest);
    for(let i=1; i<AUTO_REDUCE_COUNTS.length; i++){
      const candidate = AUTO_REDUCE_COUNTS[i];
      const dist = Math.abs(parsed - candidate);
      if(dist < nearestDist || (dist === nearestDist && candidate > nearest)){
        nearest = candidate;
        nearestDist = dist;
      }
    }
    return nearest;
  }

  function colorCountToSliderIndex(count){
    const normalized = normalizeAutoReduceCount(count);
    const idx = AUTO_REDUCE_COUNTS.indexOf(normalized);
    return idx >= 0 ? idx : 2;
  }

  function syncAutoReduceControls(nextCount){
    const normalized = normalizeAutoReduceCount(nextCount);
    if(autoReduceColorCount) autoReduceColorCount.value = String(normalized);
    if(autoReduceColorSlider) autoReduceColorSlider.value = String(colorCountToSliderIndex(normalized));
    return normalized;
  }

  function hexListEqual(a, b){
    if(!Array.isArray(a) || !Array.isArray(b)) return false;
    if(a.length !== b.length) return false;
    for(let i=0; i<a.length; i++){
      if(a[i] !== b[i]) return false;
    }
    return true;
  }

  function getPaletteCacheKey(colorCount, method){
    const srcId = currentSrcSnapshotId || 0;
    const seedPart = (typeof userSeed === "number" && !Number.isNaN(userSeed)) ? (userSeed >>> 0) : "auto";
    return [
      srcId,
      method,
      colorCount,
      filterState.contrast,
      filterState.brightness,
      filterState.hue,
      filterState.saturation,
      filterState.luminance,
      seedPart
    ].join("|");
  }

  function setPaletteFromHexList(nextHexList){
    if(!Array.isArray(nextHexList) || nextHexList.length === 0) return false;
    const normalized = nextHexList.map(h=>String(h).toUpperCase());
    if(hexListEqual(currentHexList, normalized)) return true;
    paletteInput.value = normalized.join("\n");
    currentHexList = parsePalette(paletteInput.value || "");
    paletteNames = new Array(currentHexList.length).fill("");
    ensureNamesSize(currentHexList.length);
    refreshPalettePreview(currentHexList);
    buildPaletteEditor(currentHexList);
    return currentHexList.length > 0;
  }

  function cachePalette(key, palette){
    if(!key || !Array.isArray(palette) || palette.length === 0) return;
    if(paletteExtractionCache.has(key)) paletteExtractionCache.delete(key);
    paletteExtractionCache.set(key, palette.slice(0));
    while(paletteExtractionCache.size > PALETTE_CACHE_LIMIT){
      const firstKey = paletteExtractionCache.keys().next().value;
      paletteExtractionCache.delete(firstKey);
    }
  }

  if(palettePreview){
    palettePreview.addEventListener("wheel", (ev)=>{
      if(Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
      ev.preventDefault();
      palettePreview.scrollLeft += ev.deltaY;
    }, { passive:false });
  }

  function buildExportFilename(ext){
    const d = new Date();
    const pad = (n)=> String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `pixelart_${yyyy}-${mm}-${dd}-${hh}-${mi}.${ext}`;
  }

  function downloadBlob(blob, ext){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = buildExportFilename(ext);
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function ensureCanvasReady(){
    if(!offscreen){
      alert("変換結果がありません");
      return false;
    }
    return true;
  }

  function canvasToImageData(canvas){
    const ctx = canvas.getContext("2d");
    return ctx.getImageData(0,0,canvas.width,canvas.height);
  }

  function encodeBMPFromCanvas(canvas){
    const w = canvas.width, h = canvas.height;
    const imgData = canvasToImageData(canvas).data;
    const rowSize = w * 4;
    const pixelDataSize = rowSize * h;
    const headerSize = 14 + 40;
    const fileSize = headerSize + pixelDataSize;
    const buf = new ArrayBuffer(fileSize);
    const dv = new DataView(buf);
    let off = 0;
    dv.setUint8(off++, 0x42); // B
    dv.setUint8(off++, 0x4D); // M
    dv.setUint32(off, fileSize, true); off += 4;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint16(off, 0, true); off += 2;
    dv.setUint32(off, headerSize, true); off += 4;
    dv.setUint32(off, 40, true); off += 4; // DIB size
    dv.setInt32(off, w, true); off += 4;
    dv.setInt32(off, -h, true); off += 4; // top-down
    dv.setUint16(off, 1, true); off += 2; // planes
    dv.setUint16(off, 32, true); off += 2; // bpp
    dv.setUint32(off, 0, true); off += 4; // BI_RGB
    dv.setUint32(off, pixelDataSize, true); off += 4;
    dv.setInt32(off, 2835, true); off += 4; // ppm
    dv.setInt32(off, 2835, true); off += 4;
    dv.setUint32(off, 0, true); off += 4;
    dv.setUint32(off, 0, true); off += 4;
    const out = new Uint8Array(buf, headerSize);
    for(let i=0; i<w*h; i++){
      const si = i*4;
      const di = i*4;
      out[di] = imgData[si+2];
      out[di+1] = imgData[si+1];
      out[di+2] = imgData[si];
      out[di+3] = imgData[si+3];
    }
    return new Blob([buf], {type:"image/bmp"});
  }

  async function exportICO(canvas){
    const pngBlob = await new Promise((resolve)=> canvas.toBlob(resolve, "image/png"));
    if(!pngBlob) throw new Error("PNG生成に失敗しました");
    const pngBuf = await pngBlob.arrayBuffer();
    const pngSize = pngBuf.byteLength;
    const header = new ArrayBuffer(6 + 16);
    const dv = new DataView(header);
    dv.setUint16(0, 0, true);
    dv.setUint16(2, 1, true); // icon
    dv.setUint16(4, 1, true); // count
    dv.setUint8(6, canvas.width >= 256 ? 0 : canvas.width);
    dv.setUint8(7, canvas.height >= 256 ? 0 : canvas.height);
    dv.setUint8(8, 0);
    dv.setUint8(9, 0);
    dv.setUint16(10, 1, true);
    dv.setUint16(12, 32, true);
    dv.setUint32(14, pngSize, true);
    dv.setUint32(18, 6 + 16, true);
    return new Blob([header, pngBuf], {type:"image/x-icon"});
  }

  async function exportGIF(canvas){
    return new Promise((resolve, reject)=>{
      try{
        const gif = new GIF({
          workers: 2,
          quality: 10,
          workerScript: "https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.worker.js"
        });
        gif.addFrame(canvas, {copy: true, delay: 0});
        gif.on("finished", (blob)=> resolve(blob));
        gif.render();
      }catch(e){ reject(e); }
    });
  }

  function exportAPNG(canvas){
    const img = canvasToImageData(canvas);
    const rgba = img.data.buffer;
    const apng = UPNG.encode([rgba], canvas.width, canvas.height, 0, [0]);
    return new Blob([apng], {type:"image/apng"});
  }

  function exportTIFF(canvas){
    const img = canvasToImageData(canvas);
    const ifd = UTIF.encodeImage(img.data, canvas.width, canvas.height);
    const tiff = UTIF.encode([ifd]);
    return new Blob([tiff], {type:"image/tiff"});
  }

  function exportPDF(canvas){
    const { jsPDF } = window.jspdf || {};
    if(!jsPDF) throw new Error("jsPDFが読み込まれていません");
    const w = canvas.width;
    const h = canvas.height;
    const doc = new jsPDF({ unit: "px", format: [w, h] });
    const dataUrl = canvas.toDataURL("image/png");
    doc.addImage(dataUrl, "PNG", 0, 0, w, h);
    doc.save(buildExportFilename("pdf"));
  }

  function exportPaletteTXT(){
    const lines = currentHexList.map(h=>h.toUpperCase());
    return new Blob([lines.join("\n")], {type:"text/plain"});
  }

  function exportPaletteCSV(){
    const lines = ["index,hex,name"];
    currentHexList.forEach((h,i)=>{
      const name = (paletteNames[i]||"").replace(/"/g, '""');
      lines.push(`${i+1},${h.toUpperCase()},"${name}"`);
    });
    return new Blob([lines.join("\n")], {type:"text/csv"});
  }

  function exportPaletteGPL(){
    const lines = [
      "GIMP Palette",
      "Name: pixelart",
      "Columns: 8",
      "#"
    ];
    currentHexList.forEach((h,i)=>{
      const c = hexToRgbObj(h);
      const name = (paletteNames[i] || `color${i+1}`).trim() || `color${i+1}`;
      lines.push(`${c.r}\t${c.g}\t${c.b}\t${name}`);
    });
    return new Blob([lines.join("\n")], {type:"text/plain"});
  }

  function exportPalettePAL(){
    const lines = ["JASC-PAL", "0100", String(currentHexList.length)];
    currentHexList.forEach(h=>{
      const c = hexToRgbObj(h);
      lines.push(`${c.r} ${c.g} ${c.b}`);
    });
    return new Blob([lines.join("\n")], {type:"text/plain"});
  }

  function exportPaletteACT(){
    const buf = new Uint8Array(256*3);
    for(let i=0;i<256;i++){
      const h = currentHexList[i] || "#000000";
      const c = hexToRgbObj(h);
      buf[i*3+0] = c.r;
      buf[i*3+1] = c.g;
      buf[i*3+2] = c.b;
    }
    return new Blob([buf.buffer], {type:"application/octet-stream"});
  }

  function exportPaletteACO(){
    const count = currentHexList.length;
    const buf = new ArrayBuffer(4 + count * 10);
    const dv = new DataView(buf);
    dv.setUint16(0, 1, true);
    dv.setUint16(2, count, true);
    let off = 4;
    for(let i=0;i<count;i++){
      const c = hexToRgbObj(currentHexList[i]);
      dv.setUint16(off, 0, true); off += 2; // RGB
      dv.setUint16(off, Math.round(c.r/255*65535), true); off += 2;
      dv.setUint16(off, Math.round(c.g/255*65535), true); off += 2;
      dv.setUint16(off, Math.round(c.b/255*65535), true); off += 2;
      dv.setUint16(off, 0, true); off += 2;
    }
    return new Blob([buf], {type:"application/octet-stream"});
  }

  function exportPaletteASE(){
    const count = currentHexList.length;
    const chunks = [];
    const header = new ArrayBuffer(12);
    const dv = new DataView(header);
    dv.setUint8(0, 0x41); dv.setUint8(1, 0x53); dv.setUint8(2, 0x45); dv.setUint8(3, 0x46);
    dv.setUint16(4, 1, false); dv.setUint16(6, 0, false);
    dv.setUint32(8, count, false);
    chunks.push(header);
    for(let i=0;i<count;i++){
      const name = (paletteNames[i] || `Color ${i+1}`);
      const nameUtf16 = new Uint16Array(name.length + 1);
      for(let k=0;k<name.length;k++) nameUtf16[k] = name.charCodeAt(k);
      nameUtf16[name.length] = 0;
      const c = hexToRgbObj(currentHexList[i]);
      const blockSize = 2 + nameUtf16.byteLength + 4 + 12 + 2;
      const block = new ArrayBuffer(6 + blockSize);
      const bdv = new DataView(block);
      bdv.setUint16(0, 0x0001, false);
      bdv.setUint32(2, blockSize, false);
      bdv.setUint16(6, nameUtf16.length, false);
      new Uint16Array(block, 8, nameUtf16.length).set(nameUtf16);
      const modelOffset = 8 + nameUtf16.byteLength;
      bdv.setUint8(modelOffset+0, 0x52);
      bdv.setUint8(modelOffset+1, 0x47);
      bdv.setUint8(modelOffset+2, 0x42);
      bdv.setUint8(modelOffset+3, 0x20);
      bdv.setFloat32(modelOffset+4, c.r/255, false);
      bdv.setFloat32(modelOffset+8, c.g/255, false);
      bdv.setFloat32(modelOffset+12, c.b/255, false);
      bdv.setUint16(modelOffset+16, 0x0000, false);
      chunks.push(block);
    }
    return new Blob(chunks, {type:"application/octet-stream"});
  }

  // Conversion presets
  function setFilterState(next){
    if(typeof next.contrast === "number") filterState.contrast = next.contrast;
    if(typeof next.brightness === "number") filterState.brightness = next.brightness;
    if(typeof next.hue === "number") filterState.hue = next.hue;
    if(typeof next.saturation === "number") filterState.saturation = next.saturation;
    if(typeof next.luminance === "number") filterState.luminance = next.luminance;
    if(document.getElementById("contrastSlider")) document.getElementById("contrastSlider").value = filterState.contrast;
    if(document.getElementById("brightnessSlider")) document.getElementById("brightnessSlider").value = filterState.brightness;
    if(document.getElementById("hueSlider")) document.getElementById("hueSlider").value = filterState.hue;
    if(document.getElementById("saturationSlider")) document.getElementById("saturationSlider").value = filterState.saturation;
    if(document.getElementById("luminanceSlider")) document.getElementById("luminanceSlider").value = filterState.luminance;
    updateFilterSliderDisplay();
  }

  function setEdgeStrength(value){
    if(edgeStrengthSlider) edgeStrengthSlider.value = value;
    if(edgeStrengthNumber) edgeStrengthNumber.value = value;
    if(edgeStrengthValue) edgeStrengthValue.textContent = value + "%";
  }

  function setDitherStrength(value){
    if(ditherStrengthSlider) ditherStrengthSlider.value = value;
    if(ditherStrengthNumber) ditherStrengthNumber.value = value;
    updateDitherStrengthDisplay();
  }

  function applyConvertPreset(preset){
    if(!convertPreset) return;
    if(preset === "default"){
      const colorCount = syncAutoReduceControls(32);
      if(useLabInput) useLabInput.checked = true;
      if(ditherCheckbox) ditherCheckbox.checked = true;
      if(ditherPatternSelect) ditherPatternSelect.value = "basic";
      setDitherStrength(100);
      setEdgeStrength(100);
      setFilterState({ contrast: 100, brightness: 100, hue: 0, saturation: 100, luminance: 100 });
      if(srcImageData){
        updatePaletteFromSourceImage(colorCount);
        doProcess();
      }
      return;
    }

    if(preset === "natural"){
      const colorCount = syncAutoReduceControls(48);
      if(useLabInput) useLabInput.checked = true;
      if(ditherCheckbox) ditherCheckbox.checked = true;
      if(ditherPatternSelect) ditherPatternSelect.value = "basic";
      setDitherStrength(40);
      setEdgeStrength(90);
      setFilterState({ contrast: 100, brightness: 100, hue: 0, saturation: 100, luminance: 100 });
      if(srcImageData){
        updatePaletteFromSourceImage(colorCount);
        doProcess();
      }
      return;
    }

    if(preset === "retro"){
      const colorCount = syncAutoReduceControls(12);
      if(ditherCheckbox) ditherCheckbox.checked = true;
      if(ditherPatternSelect) ditherPatternSelect.value = "ichimatsu";
      setDitherStrength(120);
      setEdgeStrength(100);
      setFilterState({ contrast: 100, brightness: 100, hue: 0, saturation: 100, luminance: 100 });
      if(srcImageData){
        updatePaletteFromSourceImage(colorCount);
        doProcess();
      }
      return;
    }

    if(preset === "edge"){
      const colorCount = syncAutoReduceControls(24);
      if(ditherCheckbox) ditherCheckbox.checked = true;
      if(ditherPatternSelect) ditherPatternSelect.value = "basic";
      setDitherStrength(40);
      setEdgeStrength(140);
      setFilterState({ contrast: 110, brightness: 100, hue: 0, saturation: 100, luminance: 100 });
      if(srcImageData){
        updatePaletteFromSourceImage(colorCount);
        doProcess();
      }
      return;
    }

    if(preset === "limited"){
      const colorCount = syncAutoReduceControls(16);
      if(ditherCheckbox) ditherCheckbox.checked = false;
      if(ditherPatternSelect) ditherPatternSelect.value = "basic";
      setDitherStrength(100);
      if(srcImageData){
        updatePaletteFromSourceImage(colorCount);
        doProcess();
      }
    }
  }

  if(convertPreset){
    convertPreset.addEventListener("change", (ev)=>{
      applyConvertPreset(ev.target.value);
    });
  }

  let lastReduceMethod = reduceMethodSelect ? reduceMethodSelect.value : "standard";

  if(reduceMethodSelect){
    reduceMethodSelect.addEventListener("change", ()=>{
      const current = reduceMethodSelect.value;
      const paletteMethods = new Set(["wu", "neuquant", "kmeans"]);
      if(srcImageData){
        const colorCount = syncAutoReduceControls(autoReduceColorCount ? autoReduceColorCount.value : 32);
        if(paletteMethods.has(current)){
          updatePaletteFromSourceImage(colorCount, current);
        } else if(paletteMethods.has(lastReduceMethod)){
          updatePaletteFromSourceImage(colorCount, "standard");
        }
        doProcess();
      }
      lastReduceMethod = current;
    });
  }

  const headerStatusEl = document.getElementById("headerStatus");
  const statusText = document.getElementById("headerStatusText");
  const dotScaleNumber = document.getElementById("dotScaleNumber");
  const contrastNumber = document.getElementById("contrastNumber");
  const brightnessNumber = document.getElementById("brightnessNumber");
  const hueNumber = document.getElementById("hueNumber");
  const saturationNumber = document.getElementById("saturationNumber");
  const luminanceNumber = document.getElementById("luminanceNumber");
  const tooltip = document.getElementById("tooltip");

  // state
  let srcImageData = null, srcW=0, srcH=0, originalAspect=1;
  let autoAdjustMode = true;
  let lastRecoloredImage = null, offscreen = null;
  let lastUsedPaletteHexList = null;
  let camera = { zoom:1, centerX:0, centerY:0 };
  let lastViewport = null;
  const MIN_ZOOM = 1, MAX_ZOOM = 200;
  const wheelFactor = 1.12;
  let srcZoom = 1;
  let srcPanX = 0;
  let srcPanY = 0;
  const SRC_MAX_ZOOM = 20;

  function getSrcMinZoom(){
    if(!srcC || !srcWrapper || !srcC.width || !srcC.height) return 1;
    const rect = srcWrapper.getBoundingClientRect();
    const fit = Math.min(rect.width / srcC.width, rect.height / srcC.height);
    return Math.max(0.05, Math.min(1, Number.isFinite(fit) ? fit : 1));
  }

  let isProcessing = false;
  let pendingProcess = false;
  let processTimer = null;

  let isApplyingHistory = false;
  const historyStack = [];
  const redoStack = [];
  let historyTimer = null;
  const HISTORY_LIMIT = 50;
  let srcSnapshotSeq = 0;
  const srcSnapshotMap = new Map();
  let currentSrcSnapshotId = null;

  function clampSrcPan(){
    if(!srcWrapper || !srcC || !srcC.width || !srcC.height) return;
    const rect = srcWrapper.getBoundingClientRect();
    const scaledW = srcC.width * srcZoom;
    const scaledH = srcC.height * srcZoom;
    if(scaledW <= rect.width){
      srcPanX = (rect.width - scaledW) / 2;
    } else {
      const minX = rect.width - scaledW;
      srcPanX = Math.max(minX, Math.min(0, srcPanX));
    }
    if(scaledH <= rect.height){
      srcPanY = (rect.height - scaledH) / 2;
    } else {
      const minY = rect.height - scaledH;
      srcPanY = Math.max(minY, Math.min(0, srcPanY));
    }
  }

  function applySrcZoom(){
    if(!srcC) return;
    const minZoom = getSrcMinZoom();
    srcZoom = Math.max(minZoom, Math.min(SRC_MAX_ZOOM, Number.isFinite(srcZoom) ? srcZoom : minZoom));
    clampSrcPan();
    srcC.style.transformOrigin = "0 0";
    srcC.style.transform = `translate(${srcPanX}px, ${srcPanY}px) scale(${srcZoom})`;
  }

  function fitSrcToWrapper(){
    if(!srcC || !srcWrapper || !srcC.width || !srcC.height) return;
    const rect = srcWrapper.getBoundingClientRect();
    const fit = Math.min(rect.width / srcC.width, rect.height / srcC.height);
    const minZoom = getSrcMinZoom();
    srcZoom = Math.max(minZoom, Math.min(SRC_MAX_ZOOM, Math.min(1, fit || 1)));
    srcPanX = (rect.width - srcC.width * srcZoom) / 2;
    srcPanY = (rect.height - srcC.height * srcZoom) / 2;
    applySrcZoom();
  }

  function requestProcess(delay = 30){
    if(!srcImageData) return;
    if(processTimer) clearTimeout(processTimer);
    processTimer = setTimeout(()=>{
      doProcess();
    }, delay);
  }

  function storeSrcSnapshot(){
    if(!srcC || !srcC.width || !srcC.height) {
      currentSrcSnapshotId = null;
      return;
    }
    const url = srcC.toDataURL("image/png");
    const id = ++srcSnapshotSeq;
    srcSnapshotMap.set(id, { url, fileInfoText: fileInfo ? fileInfo.textContent : "" });
    currentSrcSnapshotId = id;
  }

  function updateHistoryButtons(){
    if(undoBtn) undoBtn.disabled = historyStack.length <= 1;
    if(redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  function captureState(){
    return {
      paletteText: paletteInput ? paletteInput.value : "",
      paletteNames: paletteNames.slice(0),
      selectedPaletteIndex,
      outWidth: outW ? outW.value : "",
      outHeight: outH ? outH.value : "",
      keepAspect: autoAdjustMode,
      dotScale: dotScale ? dotScale.value : "",
      dotScaleNumber: dotScaleNumber ? dotScaleNumber.value : "",
      edgeStrength: edgeStrengthSlider ? edgeStrengthSlider.value : "",
      edgeStrengthNumber: edgeStrengthNumber ? edgeStrengthNumber.value : "",
      filterState: { ...filterState },
      dither: ditherCheckbox ? ditherCheckbox.checked : false,
      paletteOnly: paletteOnlyCheckbox ? paletteOnlyCheckbox.checked : false,
      ditherPattern: ditherPatternSelect ? ditherPatternSelect.value : "",
      ditherStrength: ditherStrengthSlider ? ditherStrengthSlider.value : "",
      ditherStrengthNumber: ditherStrengthNumber ? ditherStrengthNumber.value : "",
      autoReduceColorCount: autoReduceColorCount ? autoReduceColorCount.value : "",
      convertPreset: convertPreset ? convertPreset.value : "",
      reduceMethod: reduceMethodSelect ? reduceMethodSelect.value : "",
      useLab: useLabInput ? useLabInput.checked : false,
      keepAlpha: keepAlphaInput ? keepAlphaInput.checked : false,
      showNumber: showNumber ? showNumber.checked : false,
      border: borderCheckbox ? borderCheckbox.checked : false,
      seed: seedInputEl ? seedInputEl.value : "",
      srcVisible,
      srcZoom,
      srcPanX,
      srcPanY,
      camera: { ...camera },
      srcSnapshotId: currentSrcSnapshotId
    };
  }

  function hashString(str){
    let h = 0;
    for(let i=0;i<str.length;i++){
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return h >>> 0;
  }

  function buildStateSignature(state){
    const paletteText = state.paletteText || "";
    const namesText = Array.isArray(state.paletteNames) ? state.paletteNames.join("|") : "";
    const f = state.filterState || {};
    const cam = state.camera || {};
    return [
      paletteText.length, hashString(paletteText),
      namesText.length, hashString(namesText),
      state.selectedPaletteIndex,
      state.outWidth, state.outHeight, state.keepAspect,
      state.dotScale, state.edgeStrength,
      f.contrast, f.brightness, f.hue, f.saturation, f.luminance,
      state.dither, state.paletteOnly, state.ditherPattern, state.ditherStrength,
      state.autoReduceColorCount, state.convertPreset, state.reduceMethod,
      state.useLab, state.keepAlpha, state.showNumber, state.border,
      state.seed,
      state.srcVisible, Number(state.srcZoom || 0).toFixed(3),
      Number(state.srcPanX || 0).toFixed(1), Number(state.srcPanY || 0).toFixed(1),
      cam.zoom, cam.centerX, cam.centerY,
      state.srcSnapshotId
    ].join("|");
  }

  function applyState(state){
    if(!state) return;
    isApplyingHistory = true;

    const applyAll = ()=>{
      if(paletteInput) paletteInput.value = state.paletteText || "";
      currentHexList = parsePalette(paletteInput.value || "");
      paletteNames = Array.isArray(state.paletteNames) ? state.paletteNames.slice(0) : new Array(currentHexList.length).fill("");
      ensureNamesSize(currentHexList.length);
      selectedPaletteIndex = typeof state.selectedPaletteIndex === "number" ? state.selectedPaletteIndex : -1;
      refreshPalettePreview(currentHexList);
      buildPaletteEditor(currentHexList);
      renderSelectedPalette();

      if(outW) outW.value = state.outWidth || outW.value;
      if(outH) outH.value = state.outHeight || outH.value;
      autoAdjustMode = state.keepAspect !== false;
      updateKeepAspectModeUI();

      if(dotScale) dotScale.value = state.dotScale || dotScale.value;
      if(dotScaleNumber) dotScaleNumber.value = state.dotScaleNumber || dotScaleNumber.value;
      onDotScaleChange();

      if(edgeStrengthSlider) edgeStrengthSlider.value = state.edgeStrength || edgeStrengthSlider.value;
      if(edgeStrengthNumber) edgeStrengthNumber.value = state.edgeStrengthNumber || edgeStrengthNumber.value;
      if(edgeStrengthValue) edgeStrengthValue.textContent = (edgeStrengthSlider ? edgeStrengthSlider.value : 100) + "%";

      filterState = { ...filterState, ...(state.filterState || {}) };
      if(document.getElementById("contrastSlider")) document.getElementById("contrastSlider").value = filterState.contrast;
      if(document.getElementById("brightnessSlider")) document.getElementById("brightnessSlider").value = filterState.brightness;
      if(document.getElementById("hueSlider")) document.getElementById("hueSlider").value = filterState.hue;
      if(document.getElementById("saturationSlider")) document.getElementById("saturationSlider").value = filterState.saturation;
      if(document.getElementById("luminanceSlider")) document.getElementById("luminanceSlider").value = filterState.luminance;
      updateFilterSliderDisplay();

      if(ditherCheckbox) ditherCheckbox.checked = !!state.dither;
      if(paletteOnlyCheckbox) paletteOnlyCheckbox.checked = !!state.paletteOnly;
      if(ditherPatternSelect) ditherPatternSelect.value = state.ditherPattern || ditherPatternSelect.value;
      if(ditherStrengthSlider) ditherStrengthSlider.value = state.ditherStrength || ditherStrengthSlider.value;
      if(ditherStrengthNumber) ditherStrengthNumber.value = state.ditherStrengthNumber || ditherStrengthNumber.value;
      updateDitherStrengthDisplay();

      syncAutoReduceControls(state.autoReduceColorCount || (autoReduceColorCount ? autoReduceColorCount.value : 32));
      if(convertPreset) convertPreset.value = state.convertPreset || convertPreset.value;
      if(reduceMethodSelect) reduceMethodSelect.value = state.reduceMethod || reduceMethodSelect.value;
      if(useLabInput) useLabInput.checked = !!state.useLab;
      if(keepAlphaInput) keepAlphaInput.checked = !!state.keepAlpha;
      if(showNumber) showNumber.checked = !!state.showNumber;
      if(borderCheckbox) borderCheckbox.checked = !!state.border;
      if(seedInputEl) seedInputEl.value = state.seed || "";

      srcVisible = !!state.srcVisible;
      updateSrcVisibility();
      srcZoom = state.srcZoom || 1;
      srcPanX = typeof state.srcPanX === "number" ? state.srcPanX : srcPanX;
      srcPanY = typeof state.srcPanY === "number" ? state.srcPanY : srcPanY;
      applySrcZoom();

      camera = state.camera ? { ...state.camera } : camera;
      if(srcImageData) doProcess();
      isApplyingHistory = false;
      updateHistoryButtons();
    };

    if(state.srcSnapshotId && srcSnapshotMap.has(state.srcSnapshotId)){
      const snap = srcSnapshotMap.get(state.srcSnapshotId);
      const img = new Image();
      img.onload = ()=>{
        loadImageToCanvas(img, snap && snap.fileInfoText ? snap.fileInfoText.split(" — ")[0] : "image", { skipAutoReduce: true, skipHistory: true });
        applyAll();
      };
      img.src = snap.url;
    } else {
      applyAll();
    }
  }

  function pushHistory(){
    if(isApplyingHistory) return;
    const state = captureState();
    state._sig = buildStateSignature(state);
    const last = historyStack[historyStack.length - 1];
    if(last && last._sig === state._sig){
      return;
    }
    historyStack.push(state);
    if(historyStack.length > HISTORY_LIMIT) historyStack.shift();
    redoStack.length = 0;
    updateHistoryButtons();
  }

  function scheduleHistory(){
    if(isApplyingHistory) return;
    if(historyTimer) clearTimeout(historyTimer);
    historyTimer = setTimeout(()=>{
      pushHistory();
    }, 300);
  }

  function undo(){
    if(historyStack.length <= 1) return;
    const current = historyStack.pop();
    redoStack.push(current);
    const prev = historyStack[historyStack.length - 1];
    applyState(prev);
  }

  function redo(){
    if(redoStack.length === 0) return;
    const next = redoStack.pop();
    historyStack.push(next);
    applyState(next);
  }

  // palette / names / recent
  function parsePalette(text){ 
    const parts = (text||"").trim().split(/[\r\n,; ]+/).map(x=>x.trim()).filter(x=>/^#?[0-9a-fA-F]{6}$/.test(x)); 
    return parts.map(h=> h.startsWith("#") ? h.toUpperCase() : ("#"+h).toUpperCase()); 
  }
  
  function hexNormalize(h){ 
    h=(h||"").trim().toUpperCase(); 
    if(!h) return null; 
    if(!h.startsWith("#")) h="#"+h; 
    return /^#[0-9A-F]{6}$/.test(h) ? h : null; 
  }
  
  function hexToRgbObj(hex){ 
    const s=(hex||"#000000").replace("#",""); 
    return { r: parseInt(s.slice(0,2),16), g: parseInt(s.slice(2,4),16), b: parseInt(s.slice(4,6),16), a:255 }; 
  }
  
  function rgbToHex(c){ 
    const h=(n)=>n.toString(16).padStart(2,"0").toUpperCase(); 
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`; 
  }

  let currentHexList = parsePalette(paletteInput.value || "");
  let paletteNames = new Array(currentHexList.length).fill("");
  let hexToName = {};
  
  function ensureNamesSize(n){ 
    while(paletteNames.length < n) paletteNames.push(""); 
    if(paletteNames.length > n) paletteNames.length = n; 
  }
  
  function rebuildHexToName(){ 
    hexToName = {}; 
    for(let i=0;i<currentHexList.length;i++){ 
      const h=currentHexList[i]; 
      if(!h) continue; 
      const nm=(paletteNames[i]||"").trim(); 
      if(nm) hexToName[h]=nm; 
    } 
  }

  // Lab helpers
  function srgbToLinear(v){ 
    v/=255; 
    return v<=0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); 
  }
  
  function rgbToXyz(r,g,b){ 
    const R=srgbToLinear(r), G=srgbToLinear(g), B=srgbToLinear(b); 
    return { 
      x:R*0.4124564 + G*0.3575761 + B*0.1804375, 
      y:R*0.2126729 + G*0.7151522 + B*0.0721750, 
      z:R*0.0193339 + G*0.1191920 + B*0.9503041 
    }; 
  }
  
  function xyzToLab(x,y,z){ 
    const Xn=0.95047, Yn=1.00000, Zn=1.08883; 
    const fx=f(x/Xn), fy=f(y/Yn), fz=f(z/Zn); 
    return { L:116*fy-16, a:500*(fx-fy), b:200*(fy-fz) }; 
    function f(t){ return t>0.008856 ? Math.cbrt(t) : (7.787*t + 16/116); } 
  }
  
  function rgbToLab(r,g,b){ 
    const {x,y,z}=rgbToXyz(r,g,b); 
    return xyzToLab(x,y,z); 
  }
  
  function labDist2(a,b){ 
    const dL = (a.L || a.l) - (b.L || b.l);
    const da = a.a - b.a;
    const db = (a.b || a.bb) - (b.b || b.bb);
    return dL*dL + da*da + db*db;
  }
  
  function rgbDist2(a,b){ 
    const dr=a.r-b.r, dg=a.g-b.g, db=a.b-b.b; 
    return dr*dr+dg*dg+db*db; 
  }

  // RGB ↔ HSL conversion
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h, s, l };
  }
  
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // フィルター関数
  let filterState = {
    contrast: 100,
    brightness: 100,
    hue: 0,
    saturation: 100,
    luminance: 100
  };

  let userSeed = null;

  function applyFilters(imageData) {
    if (!imageData) return null;
    const data = new Uint8ClampedArray(imageData.data);
    const len = data.length;
    
    for (let i = 0; i < len; i += 4) {
      let r = data[i], g = data[i+1], b = data[i+2];
      
      // Contrast
      const contrastFactor = filterState.contrast / 100;
      r = Math.round((r - 128) * contrastFactor + 128);
      g = Math.round((g - 128) * contrastFactor + 128);
      b = Math.round((b - 128) * contrastFactor + 128);
      
      // Brightness
      const brightnessFactor = (filterState.brightness - 100);
      r = Math.round(r + brightnessFactor * 2.55);
      g = Math.round(g + brightnessFactor * 2.55);
      b = Math.round(b + brightnessFactor * 2.55);
      
      // HSL conversion
      const hsl = rgbToHsl(r, g, b);
      
      // Hue shift
      if (filterState.hue !== 0) {
        hsl.h += filterState.hue / 360;
        if (hsl.h < 0) hsl.h += 1;
        if (hsl.h > 1) hsl.h -= 1;
      }
      
      // Saturation
      hsl.s *= (filterState.saturation / 100);
      hsl.s = Math.max(0, Math.min(1, hsl.s));
      
      // Luminance
      hsl.l *= (filterState.luminance / 100);
      hsl.l = Math.max(0, Math.min(1, hsl.l));
      
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      r = Math.max(0, Math.min(255, rgb.r));
      g = Math.max(0, Math.min(255, rgb.g));
      b = Math.max(0, Math.min(255, rgb.b));
      
      data[i] = r;
      data[i+1] = g;
      data[i+2] = b;
    }

    // Edge enhancement
    try{
      const es = (typeof edgeStrengthSlider !== 'undefined' && edgeStrengthSlider) ? (parseInt(edgeStrengthSlider.value,10) || 100) : 100;
      if(es !== 100){
        const w = imageData.width, h = imageData.height;
        const out = new Uint8ClampedArray(data);
        const factor = (es - 100) / 100;
        for(let y = 1; y < h-1; y++){
          for(let x = 1; x < w-1; x++){
            const i = (y * w + x) * 4;
            const r = data[i], g = data[i+1], b = data[i+2];
            const lum = 0.299*r + 0.587*g + 0.114*b;
            
            const ni = ((y-1)*w + x)*4; const ri = data[ni], gi = data[ni+1], bi = data[ni+2]; const lumN = 0.299*ri + 0.587*gi + 0.114*bi;
            const si = ((y+1)*w + x)*4; const rs = data[si], gs = data[si+1], bs = data[si+2]; const lumS = 0.299*rs + 0.587*gs + 0.114*bs;
            const wi = (y*w + (x-1))*4; const rw = data[wi], gw = data[wi+1], bw = data[wi+2]; const lumW = 0.299*rw + 0.587*gw + 0.114*bw;
            const ei = (y*w + (x+1))*4; const re = data[ei], ge = data[ei+1], be = data[ei+2]; const lumE = 0.299*re + 0.587*ge + 0.114*be;
            
            const neighAvg = (lumN + lumS + lumW + lumE) / 4;
            const edgeVal = lum - neighAvg;
            const add = edgeVal * factor;
            const lumC = lum || 1;
            
            out[i] = Math.max(0, Math.min(255, Math.round(out[i] + (out[i] / lumC) * add)));
            out[i+1] = Math.max(0, Math.min(255, Math.round(out[i+1] + (out[i+1] / lumC) * add)));
            out[i+2] = Math.max(0, Math.min(255, Math.round(out[i+2] + (out[i+2] / lumC) * add)));
          }
        }
        for(let k=0;k<data.length;k++) data[k]=out[k];
      }
    }catch(e){}

    return new ImageData(data, imageData.width, imageData.height);
  }

  function applyBilateralFilter(imageData, sigmaSpatial = 1.4, sigmaColor = 30){
    if(!imageData) return null;
    const w = imageData.width, h = imageData.height;
    const src = imageData.data;
    const out = new Uint8ClampedArray(src.length);
    const radius = 1;
    const twoSigmaSpatial2 = 2 * sigmaSpatial * sigmaSpatial;
    const twoSigmaColor2 = 2 * sigmaColor * sigmaColor;

    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){
        const i = (y*w + x)*4;
        const r0 = src[i], g0 = src[i+1], b0 = src[i+2], a0 = src[i+3];
        if(a0 === 0){
          out[i]=0; out[i+1]=0; out[i+2]=0; out[i+3]=0; 
          continue;
        }
        let sumR=0, sumG=0, sumB=0, sumW=0;
        for(let dy=-radius; dy<=radius; dy++){
          const yy = y + dy; if(yy<0 || yy>=h) continue;
          for(let dx=-radius; dx<=radius; dx++){
            const xx = x + dx; if(xx<0 || xx>=w) continue;
            const j = (yy*w + xx)*4;
            const r = src[j], g = src[j+1], b = src[j+2], a = src[j+3];
            if(a === 0) continue;
            const ds = dx*dx + dy*dy;
            const dr = r - r0, dg = g - g0, db = b - b0;
            const dc = dr*dr + dg*dg + db*db;
            const wgt = Math.exp(-(ds / twoSigmaSpatial2) - (dc / twoSigmaColor2));
            sumW += wgt;
            sumR += r * wgt;
            sumG += g * wgt;
            sumB += b * wgt;
          }
        }
        if(sumW > 0){
          out[i] = Math.round(sumR / sumW);
          out[i+1] = Math.round(sumG / sumW);
          out[i+2] = Math.round(sumB / sumW);
          out[i+3] = a0;
        } else {
          out[i]=r0; out[i+1]=g0; out[i+2]=b0; out[i+3]=a0;
        }
      }
    }
    return new ImageData(out, w, h);
  }

  function buildPaletteByKMeans(imageData, k=16, iterations=6){
    if(!imageData || k <= 0) return [];
    const data = imageData.data;
    const pixels = [];
    for(let i=0;i<data.length;i+=4){
      if(data[i+3] > 0){
        pixels.push([data[i], data[i+1], data[i+2]]);
      }
    }
    if(pixels.length === 0) return ["#000000"];
    k = Math.min(k, pixels.length);

    // init: sample evenly
    const centers = [];
    const step = Math.max(1, Math.floor(pixels.length / k));
    for(let i=0;i<k;i++){
      centers.push(pixels[i*step % pixels.length].slice());
    }

    for(let it=0; it<iterations; it++){
      const sums = Array.from({length:k}, ()=>[0,0,0,0]);
      for(const p of pixels){
        let best = 0, bestDist = Infinity;
        for(let c=0;c<k;c++){
          const dx = p[0]-centers[c][0];
          const dy = p[1]-centers[c][1];
          const dz = p[2]-centers[c][2];
          const d = dx*dx + dy*dy + dz*dz;
          if(d < bestDist){ bestDist = d; best = c; }
        }
        sums[best][0] += p[0];
        sums[best][1] += p[1];
        sums[best][2] += p[2];
        sums[best][3] += 1;
      }
      for(let c=0;c<k;c++){
        if(sums[c][3] > 0){
          centers[c][0] = Math.round(sums[c][0]/sums[c][3]);
          centers[c][1] = Math.round(sums[c][1]/sums[c][3]);
          centers[c][2] = Math.round(sums[c][2]/sums[c][3]);
        }
      }
    }
    return centers.map(c=>rgbToHex({r:c[0], g:c[1], b:c[2]}));
  }

  const blueNoiseCache = new Map();
  const bayerCache = new Map();

  function generateBayerMatrix(n){
    if(bayerCache.has(n)) return bayerCache.get(n);
    if(n === 2){
      const m = [ [0,2], [3,1] ];
      bayerCache.set(n, m);
      return m;
    }
    const half = n / 2;
    const prev = generateBayerMatrix(half);
    const m = Array.from({length:n}, ()=>Array(n).fill(0));
    for(let y=0;y<half;y++){
      for(let x=0;x<half;x++){
        const v = prev[y][x];
        m[y][x] = 4*v;
        m[y][x+half] = 4*v + 2;
        m[y+half][x] = 4*v + 3;
        m[y+half][x+half] = 4*v + 1;
      }
    }
    bayerCache.set(n, m);
    return m;
  }

  function generateBlueNoiseMatrix(size){
    if(blueNoiseCache.has(size)) return blueNoiseCache.get(size);
    const total = size * size;
    const used = Array.from({length:size}, ()=>Array(size).fill(false));
    const order = Array.from({length:size}, ()=>Array(size).fill(0));
    let seed = 1337 + size;
    const rand = ()=>{
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    let startX = Math.floor(rand() * size);
    let startY = Math.floor(rand() * size);
    used[startY][startX] = true;
    order[startY][startX] = 0;
    for(let k=1;k<total;k++){
      let bestX = 0, bestY = 0, bestD = -1;
      for(let y=0;y<size;y++){
        for(let x=0;x<size;x++){
          if(used[y][x]) continue;
          let minD = Infinity;
          for(let yy=0;yy<size;yy++){
            for(let xx=0;xx<size;xx++){
              if(!used[yy][xx]) continue;
              const dx = x - xx;
              const dy = y - yy;
              const d = dx*dx + dy*dy;
              if(d < minD) minD = d;
            }
          }
          if(minD > bestD){ bestD = minD; bestX = x; bestY = y; }
        }
      }
      used[bestY][bestX] = true;
      order[bestY][bestX] = k;
    }
    blueNoiseCache.set(size, order);
    return order;
  }

  function ciede2000(lab1, lab2){
    const L1 = lab1.L, a1 = lab1.a, b1 = lab1.b;
    const L2 = lab2.L, a2 = lab2.a, b2 = lab2.b;
    const kL = 1, kC = 1, kH = 1;

    const C1 = Math.sqrt(a1*a1 + b1*b1);
    const C2 = Math.sqrt(a2*a2 + b2*b2);
    const Cbar = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar,7) / (Math.pow(Cbar,7) + Math.pow(25,7))));
    const a1p = (1 + G) * a1;
    const a2p = (1 + G) * a2;
    const C1p = Math.sqrt(a1p*a1p + b1*b1);
    const C2p = Math.sqrt(a2p*a2p + b2*b2);
    const Cbarp = (C1p + C2p) / 2;
    const h1p = Math.atan2(b1, a1p) >= 0 ? Math.atan2(b1, a1p) : Math.atan2(b1, a1p) + 2*Math.PI;
    const h2p = Math.atan2(b2, a2p) >= 0 ? Math.atan2(b2, a2p) : Math.atan2(b2, a2p) + 2*Math.PI;

    let dLp = L2 - L1;
    let dCp = C2p - C1p;
    let dhp = 0;
    if(C1p * C2p !== 0){
      if(Math.abs(h2p - h1p) <= Math.PI){
        dhp = h2p - h1p;
      } else if(h2p <= h1p){
        dhp = h2p - h1p + 2*Math.PI;
      } else {
        dhp = h2p - h1p - 2*Math.PI;
      }
    }
    const dHp = 2 * Math.sqrt(C1p*C2p) * Math.sin(dhp/2);

    const Lbarp = (L1 + L2) / 2;
    let hbarp = 0;
    if(C1p*C2p === 0){
      hbarp = h1p + h2p;
    } else if(Math.abs(h1p - h2p) <= Math.PI){
      hbarp = (h1p + h2p) / 2;
    } else if(h1p + h2p < 2*Math.PI){
      hbarp = (h1p + h2p + 2*Math.PI) / 2;
    } else {
      hbarp = (h1p + h2p - 2*Math.PI) / 2;
    }

    const T = 1 - 0.17*Math.cos(hbarp - Math.PI/6) + 0.24*Math.cos(2*hbarp) + 0.32*Math.cos(3*hbarp + Math.PI/30) - 0.20*Math.cos(4*hbarp - 7*Math.PI/20);
    const dTheta = 30*Math.PI/180 * Math.exp(-Math.pow((hbarp*180/Math.PI - 275)/25, 2));
    const Rc = 2 * Math.sqrt(Math.pow(Cbarp,7) / (Math.pow(Cbarp,7) + Math.pow(25,7)));
    const Sl = 1 + (0.015*Math.pow(Lbarp - 50,2)) / Math.sqrt(20 + Math.pow(Lbarp - 50,2));
    const Sc = 1 + 0.045*Cbarp;
    const Sh = 1 + 0.015*Cbarp*T;
    const Rt = -Math.sin(2*dTheta) * Rc;

    const dE = Math.sqrt(
      Math.pow(dLp/(kL*Sl),2) +
      Math.pow(dCp/(kC*Sc),2) +
      Math.pow(dHp/(kH*Sh),2) +
      Rt * (dCp/(kC*Sc)) * (dHp/(kH*Sh))
    );
    return dE;
  }

  function wuQuantize(imageData, colorCount){
    if(!imageData || colorCount <= 0) return [];
    const data = imageData.data;
    const size = 33; // 0..32
    const cubeSize = size*size*size;
    const wt = new Float64Array(cubeSize);
    const mr = new Float64Array(cubeSize);
    const mg = new Float64Array(cubeSize);
    const mb = new Float64Array(cubeSize);
    const m2 = new Float64Array(cubeSize);

    function idx(r,g,b){ return (r*size + g)*size + b; }

    for(let i=0;i<data.length;i+=4){
      if(data[i+3] === 0) continue;
      const r = (data[i] >> 3) + 1;
      const g = (data[i+1] >> 3) + 1;
      const b = (data[i+2] >> 3) + 1;
      const ind = idx(r,g,b);
      wt[ind] += 1;
      mr[ind] += data[i];
      mg[ind] += data[i+1];
      mb[ind] += data[i+2];
      m2[ind] += data[i]*data[i] + data[i+1]*data[i+1] + data[i+2]*data[i+2];
    }

    for(let r=1;r<size;r++){
      for(let g=1;g<size;g++){
        let wtLine = 0, mrLine = 0, mgLine = 0, mbLine = 0, m2Line = 0;
        for(let b=1;b<size;b++){
          const ind = idx(r,g,b);
          wtLine += wt[ind];
          mrLine += mr[ind];
          mgLine += mg[ind];
          mbLine += mb[ind];
          m2Line += m2[ind];
          const indPrevR = idx(r-1,g,b);
          const indPrevG = idx(r,g-1,b);
          const indPrevRG = idx(r-1,g-1,b);
          wt[ind] = wt[indPrevR] + wt[indPrevG] - wt[indPrevRG] + wtLine;
          mr[ind] = mr[indPrevR] + mr[indPrevG] - mr[indPrevRG] + mrLine;
          mg[ind] = mg[indPrevR] + mg[indPrevG] - mg[indPrevRG] + mgLine;
          mb[ind] = mb[indPrevR] + mb[indPrevG] - mb[indPrevRG] + mbLine;
          m2[ind] = m2[indPrevR] + m2[indPrevG] - m2[indPrevRG] + m2Line;
        }
      }
    }

    function vol(box, moment){
      const {r0,r1,g0,g1,b0,b1} = box;
      return moment[idx(r1,g1,b1)] - moment[idx(r0,g1,b1)] - moment[idx(r1,g0,b1)] - moment[idx(r1,g1,b0)]
        + moment[idx(r0,g0,b1)] + moment[idx(r0,g1,b0)] + moment[idx(r1,g0,b0)] - moment[idx(r0,g0,b0)];
    }

    function variance(box){
      const w = vol(box, wt);
      if(w === 0) return 0;
      const r = vol(box, mr);
      const g = vol(box, mg);
      const b = vol(box, mb);
      const m2v = vol(box, m2);
      return m2v - (r*r + g*g + b*b) / w;
    }

    function maximize(box, dir){
      let max = 0;
      let cut = -1;
      const {r0,r1,g0,g1,b0,b1} = box;
      for(let i = (dir===0? r0+1 : dir===1? g0+1 : b0+1); i <= (dir===0? r1-1 : dir===1? g1-1 : b1-1); i++){
        const box1 = { r0, r1: dir===0? i : r1, g0, g1: dir===1? i : g1, b0, b1: dir===2? i : b1 };
        const box2 = { r0: dir===0? i : r0, r1, g0: dir===1? i : g0, g1, b0: dir===2? i : b0, b1 };
        const w1 = vol(box1, wt);
        const w2 = vol(box2, wt);
        if(w1 === 0 || w2 === 0) continue;
        const v = variance(box1) + variance(box2);
        if(v > max){ max = v; cut = i; }
      }
      return { max, cut };
    }

    const boxes = [{ r0:0, r1:32, g0:0, g1:32, b0:0, b1:32, var:0 }];
    boxes[0].var = variance(boxes[0]);

    for(let i=1; i<colorCount; i++){
      let best = -1; let bestVar = 0;
      for(let k=0;k<boxes.length;k++){
        if(boxes[k].var > bestVar){ bestVar = boxes[k].var; best = k; }
      }
      if(best < 0) break;

      const box = boxes[best];
      const r = maximize(box, 0);
      const g = maximize(box, 1);
      const b = maximize(box, 2);
      let dir = 0; let cut = r.cut; let maxv = r.max;
      if(g.max > maxv){ dir = 1; cut = g.cut; maxv = g.max; }
      if(b.max > maxv){ dir = 2; cut = b.cut; maxv = b.max; }
      if(cut < 0) { box.var = 0; continue; }

      const newBox = { r0: box.r0, r1: box.r1, g0: box.g0, g1: box.g1, b0: box.b0, b1: box.b1, var:0 };
      if(dir === 0){ newBox.r0 = cut; box.r1 = cut; }
      if(dir === 1){ newBox.g0 = cut; box.g1 = cut; }
      if(dir === 2){ newBox.b0 = cut; box.b1 = cut; }
      box.var = variance(box);
      newBox.var = variance(newBox);
      boxes.push(newBox);
    }

    const palette = boxes.map(box=>{
      const w = vol(box, wt);
      if(w === 0) return { r:0,g:0,b:0 };
      const r = Math.round(vol(box, mr) / w);
      const g = Math.round(vol(box, mg) / w);
      const b = Math.round(vol(box, mb) / w);
      return { r, g, b };
    });

    return palette.map(c=>rgbToHex(c));
  }

  function neuQuant(imageData, colorCount=16, sampleFactor=10){
    if(!imageData || colorCount <= 0) return [];
    const data = imageData.data;
    const pixels = [];
    for(let i=0;i<data.length;i+=4){
      if(data[i+3] > 0) pixels.push([data[i], data[i+1], data[i+2]]);
    }
    if(pixels.length === 0) return ["#000000"];
    const n = colorCount;
    const network = Array.from({length:n}, (_,i)=>{
      const t = i/(n-1 || 1);
      return [Math.round(255*t), Math.round(255*t), Math.round(255*t)];
    });

    let alpha = 0.5;
    let radius = Math.max(1, Math.floor(n/3));
    const steps = Math.max(1000, Math.floor(pixels.length / sampleFactor));
    for(let s=0; s<steps; s++){
      const p = pixels[(s * sampleFactor) % pixels.length];
      let best = 0, bestDist = Infinity;
      for(let i=0;i<n;i++){
        const dr = p[0]-network[i][0];
        const dg = p[1]-network[i][1];
        const db = p[2]-network[i][2];
        const d = dr*dr + dg*dg + db*db;
        if(d < bestDist){ bestDist = d; best = i; }
      }
      for(let i=0;i<n;i++){
        const dist = Math.abs(i - best);
        if(dist <= radius){
          const influence = alpha * (1 - dist / (radius+1));
          network[i][0] += influence * (p[0] - network[i][0]);
          network[i][1] += influence * (p[1] - network[i][1]);
          network[i][2] += influence * (p[2] - network[i][2]);
        }
      }
      if(s % 50 === 0){
        alpha *= 0.98;
        radius = Math.max(1, Math.floor(radius * 0.99));
      }
    }
    return network.map(c=>rgbToHex({r:Math.round(c[0]), g:Math.round(c[1]), b:Math.round(c[2])}));
  }

  // UI: palette preview/editor
  let selectedPaletteIndex = -1;

  function countSelectedColorPixels(){
    if(!lastRecoloredImage || selectedPaletteIndex < 0 || selectedPaletteIndex >= currentHexList.length) return null;
    const target = hexToRgbObj(currentHexList[selectedPaletteIndex]);
    const data = lastRecoloredImage.data;
    let count = 0;
    for(let i=0;i<data.length;i+=4){
      if(data[i+3] === 0) continue;
      if(data[i] === target.r && data[i+1] === target.g && data[i+2] === target.b){
        count++;
      }
    }
    const total = lastRecoloredImage.width * lastRecoloredImage.height;
    return { count, total };
  }

  function countUsedColors(){
    if(!lastRecoloredImage) return null;
    const data = lastRecoloredImage.data;
    const paletteSource = (lastUsedPaletteHexList && lastUsedPaletteHexList.length) ? lastUsedPaletteHexList : currentHexList;
    const paletteSet = new Set(paletteSource.map(hex => {
      const c = hexToRgbObj(hex);
      return (c.r << 16) | (c.g << 8) | c.b;
    }));
    const usedSet = new Set();
    let usedInPalette = 0;
    for(let i=0;i<data.length;i+=4){
      if(data[i+3] === 0) continue;
      const key = (data[i] << 16) | (data[i+1] << 8) | data[i+2];
      if(!usedSet.has(key)){
        usedSet.add(key);
        if(paletteSet.has(key)) usedInPalette++;
      }
    }
    return { total: usedSet.size, inPalette: usedInPalette, outPalette: usedSet.size - usedInPalette };
  }

  function updateUsedColorCount(){
    if(!usedColorCountEl){
      return;
    }
    const stats = countUsedColors();
    if(!stats){
      usedColorCountEl.textContent = "-";
      return;
    }
    usedColorCountEl.textContent = `${stats.total}（パレット内:${stats.inPalette} / 外:${stats.outPalette}）`;
  }

  function renderSelectedPalette(){
    if(!selectedPalettePreview) return;
    selectedPalettePreview.innerHTML = "";
    if(selectedPaletteIndex < 0 || selectedPaletteIndex >= currentHexList.length) return;

    const idx = selectedPaletteIndex;
    const hex = currentHexList[idx];

    const row = document.createElement("div");
    row.className = "paletteRow";

    const left = document.createElement("div");
    left.style.width = "44px";

    const swBtn = document.createElement("button");
    swBtn.className = "paletteSwatchBtn";
    swBtn.style.background = hex;
    swBtn.title = `色 ${idx+1}`;

    const badge = document.createElement("span");
    badge.className = "swatchBadge";
    badge.textContent = `#${idx+1}`;
    swBtn.appendChild(badge);
    swBtn.style.cursor = "pointer";
    swBtn.addEventListener("click", ()=>{
      selectedPaletteIndex = -1;
      renderSelectedPalette();
      highlightColorInImage(idx);
      scheduleHistory();
    });
    left.appendChild(swBtn);

    const right = document.createElement("div");
    right.style.flex = "1";
    right.style.display = "flex";
    right.style.flexDirection = "column";
    right.style.gap = "4px";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "paletteName";
    nameInput.value = paletteNames[idx] || "";
    nameInput.placeholder = `色${idx+1} 名称`;
    nameInput.name = `pname_${idx}`;
    nameInput.setAttribute("aria-label", `色${idx+1} の名前`);

    const hexRow = document.createElement("div");
    hexRow.style.display = "flex";
    hexRow.style.gap = "8px";
    hexRow.style.alignItems = "center";

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = hex;
    colorPicker.name = `picker_${idx}`;
    colorPicker.setAttribute("aria-label", `色${idx+1} カラーピッカー`);

    const hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.className = "paletteHexInput";
    hexInput.value = hex;
    hexInput.style.flex = "1";
    hexInput.name = `hex_${idx}`;
    hexInput.setAttribute("aria-label", `色${idx+1} HEX`);

    nameInput.addEventListener("input", (ev)=>{
      paletteNames[idx] = ev.target.value;
      const h = currentHexList[idx];
      if(h){
        if(paletteNames[idx].trim()) hexToName[h] = paletteNames[idx].trim();
        else delete hexToName[h];
      }
      scheduleHistory();
    });

    function setHex(newHex){
      const n = hexNormalize(newHex); if(!n) return;
      colorPicker.value = n; hexInput.value = n; swBtn.style.background = n;
      currentHexList[idx] = n;
      rebuildHexToName();
      paletteInput.value = currentHexList.join("\n");
      refreshPalettePreview(currentHexList);
      const col2 = hexToRgbObj(n); const lum2 = (0.299*col2.r + 0.587*col2.g + 0.114*col2.b);
      if(lum2 > 180){ badge.style.background = "rgba(0,0,0,0.12)"; badge.style.color = "#000"; }
      else { badge.style.background = "rgba(0,0,0,0.65)"; badge.style.color = "#fff"; }
      scheduleHistory();
    }

    colorPicker.addEventListener("input", (ev)=> setHex(ev.target.value));
    hexInput.addEventListener("change", (ev)=> setHex(ev.target.value));

    hexRow.appendChild(colorPicker); hexRow.appendChild(hexInput);
    right.appendChild(nameInput); right.appendChild(hexRow);

    const stats = document.createElement("div");
    stats.className = "small";
    stats.style.color = "var(--muted)";
    const statsData = countSelectedColorPixels();
    if(statsData){
      const percent = statsData.total > 0 ? (statsData.count / statsData.total) * 100 : 0;
      stats.textContent = `占有率: ${percent.toFixed(3)}%（${statsData.count} / ${statsData.total} px）`;
    } else {
      stats.textContent = "占有率: -（変換後に表示）";
    }
    right.appendChild(stats);
    row.appendChild(left); row.appendChild(right);
    selectedPalettePreview.appendChild(row);
  }

  function refreshPalettePreview(list){
    palettePreview.innerHTML="";
    list.forEach((hex,i)=>{
      const c = hexToRgbObj(hex);
      const d = document.createElement("div");
      d.className="swatch";
      d.style.background = hex;
      d.style.color = ((0.299*c.r + 0.587*c.g + 0.114*c.b) > 180) ? "#000" : "#fff";
      d.textContent = i+1;
      d.addEventListener("click", ()=>{
        selectedPaletteIndex = (selectedPaletteIndex === i) ? -1 : i;
        renderSelectedPalette();
        highlightColorInImage(i);
        scheduleHistory();
      });
      palettePreview.appendChild(d);
    });
    renderSelectedPalette();
  }

  let highlightedColorIndex = -1;

  function highlightColorInImage(colorIndex){
    highlightedColorIndex = highlightedColorIndex === colorIndex ? -1 : colorIndex;
    drawViewport();
  }

  function buildPaletteEditor(list){
    paletteEditor.innerHTML="";
    ensureNamesSize(list.length);
    for(let idx=0; idx<list.length; idx++){
      const hex = list[idx];
      const row = document.createElement("div"); 
      row.className="paletteRow";
      
      const left = document.createElement("div"); 
      left.style.width="44px";
      
      const swBtn = document.createElement("button"); 
      swBtn.className="paletteSwatchBtn"; 
      swBtn.style.background=hex; 
      swBtn.title=`色 ${idx+1}`;
      
      const badge = document.createElement("span"); 
      badge.className="swatchBadge"; 
      badge.textContent = `#${idx+1}`;
      swBtn.appendChild(badge);
      left.appendChild(swBtn);

      const right = document.createElement("div"); 
      right.style.flex="1"; 
      right.style.display="flex"; 
      right.style.flexDirection="column"; 
      right.style.gap="4px";
      
      const nameInput = document.createElement("input"); 
      nameInput.type="text"; 
      nameInput.className="paletteName"; 
      nameInput.value = paletteNames[idx] || ""; 
      nameInput.placeholder = `色${idx+1} 名称`;
      nameInput.name = `pname_${idx}`; 
      nameInput.setAttribute("aria-label", `色${idx+1} の名前`);
      
      const hexRow = document.createElement("div"); 
      hexRow.style.display="flex"; 
      hexRow.style.gap="8px"; 
      hexRow.style.alignItems="center";
      
      const colorPicker = document.createElement("input"); 
      colorPicker.type="color"; 
      colorPicker.value = hex; 
      colorPicker.name = `picker_${idx}`; 
      colorPicker.setAttribute("aria-label", `色${idx+1} カラーピッカー`);
      
      const hexInput = document.createElement("input"); 
      hexInput.type="text"; 
      hexInput.className="paletteHexInput"; 
      hexInput.value = hex; 
      hexInput.style.flex="1"; 
      hexInput.name = `hex_${idx}`; 
      hexInput.setAttribute("aria-label", `色${idx+1} HEX`);

      nameInput.addEventListener("input",(ev)=>{ 
        paletteNames[idx]=ev.target.value; 
        const h=currentHexList[idx]; 
        if(h){ 
          if(paletteNames[idx].trim()) hexToName[h]=paletteNames[idx].trim(); 
          else delete hexToName[h]; 
        } 
        scheduleHistory();
      });
      
        swBtn.addEventListener("click", ()=>{
          selectedPaletteIndex = (selectedPaletteIndex === idx) ? -1 : idx;
          renderSelectedPalette();
          highlightColorInImage(idx); 
        });

      function setHex(newHex){
        const n = hexNormalize(newHex); 
        if(!n) return;
        colorPicker.value = n; 
        hexInput.value = n; 
        swBtn.style.background = n;
        currentHexList[idx] = n;
        rebuildHexToName();
        paletteInput.value = currentHexList.join("\n");
        refreshPalettePreview(currentHexList);
        const col2 = hexToRgbObj(n); 
        const lum2 = (0.299*col2.r + 0.587*col2.g + 0.114*col2.b);
        if(lum2 > 180){ 
          badge.style.background = "rgba(0,0,0,0.12)"; 
          badge.style.color = "#000"; 
        } else { 
          badge.style.background = "rgba(0,0,0,0.65)"; 
          badge.style.color = "#fff"; 
        }
        scheduleHistory();
      }
      
      colorPicker.addEventListener("input",(ev)=> setHex(ev.target.value));
      hexInput.addEventListener("change",(ev)=> setHex(ev.target.value));

      hexRow.appendChild(colorPicker); 
      hexRow.appendChild(hexInput);
      right.appendChild(nameInput); 
      right.appendChild(hexRow);
      row.appendChild(left); 
      row.appendChild(right);
      paletteEditor.appendChild(row);
    }
    rebuildHexToName();
  }

  // 画像からシードを生成
  function hashImageData32(imageData){
    if(!imageData || !imageData.data) return 2166136261;
    let h = 2166136261 >>> 0;
    const d = imageData.data;
    const step = Math.max(1, Math.floor(d.length / 65536));
    for(let i = 0; i < d.length; i += 4 * step){
      h ^= d[i]; h = Math.imul(h, 16777619) >>> 0;
      h ^= d[i+1]; h = Math.imul(h, 16777619) >>> 0;
      h ^= d[i+2]; h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(seed){
    let a = seed >>> 0;
    return function(){
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 色抽出（Median Cut）
  function extractColorsGameQuality(imageData, targetColors){
    if(!imageData || targetColors <= 0) return [];
    
    const data = imageData.data;
    const pixels = [];
    
    for(let i = 0; i < data.length; i += 4){
      if(data[i+3] > 0){
        pixels.push({
          r: data[i],
          g: data[i+1],
          b: data[i+2]
        });
      }
    }
    
    if(pixels.length === 0) return ["#000000"];
    if(pixels.length <= targetColors){
      return pixels.map(p => rgbToHex(p));
    }
    
    function medianCutDiversity(pixelList, targetCount){
      if(pixelList.length === 0) return [];
      if(pixelList.length <= targetCount) return pixelList;
      if(targetCount <= 1){
        let sumR = 0, sumG = 0, sumB = 0;
        for(let p of pixelList){
          sumR += p.r;
          sumG += p.g;
          sumB += p.b;
        }
        return [{
          r: Math.round(sumR / pixelList.length),
          g: Math.round(sumG / pixelList.length),
          b: Math.round(sumB / pixelList.length)
        }];
      }
      
      let minR = 255, maxR = 0;
      let minG = 255, maxG = 0;
      let minB = 255, maxB = 0;
      
      for(let p of pixelList){
        minR = Math.min(minR, p.r); maxR = Math.max(maxR, p.r);
        minG = Math.min(minG, p.g); maxG = Math.max(maxG, p.g);
        minB = Math.min(minB, p.b); maxB = Math.max(maxB, p.b);
      }
      
      const rangeR = maxR - minR;
      const rangeG = maxG - minG;
      const rangeB = maxB - minB;
      
      let sortChannel;
      if(rangeR >= rangeG && rangeR >= rangeB){
        sortChannel = (p) => p.r;
      } else if(rangeG >= rangeB){
        sortChannel = (p) => p.g;
      } else {
        sortChannel = (p) => p.b;
      }
      
      pixelList.sort((a, b) => sortChannel(a) - sortChannel(b));
      
      const mid = Math.floor(pixelList.length / 2);
      const left = medianCutDiversity(pixelList.slice(0, mid), Math.ceil(targetCount / 2));
      const right = medianCutDiversity(pixelList.slice(mid), Math.floor(targetCount / 2));
      
      return left.concat(right);
    }
    
    const colors = medianCutDiversity(pixels, targetColors);
    let finalColors = colors.slice(0, targetColors);
    
    finalColors = finalColors.filter((c, idx) => {
      return !finalColors.slice(0, idx).find(prev =>
        Math.abs(c.r - prev.r) <= 20 &&
        Math.abs(c.g - prev.g) <= 20 &&
        Math.abs(c.b - prev.b) <= 20
      );
    });
    
    let rnd = Math.random;
    try{
      let seed;
      if(typeof userSeed === 'number' && !Number.isNaN(userSeed)){
        seed = userSeed >>> 0;
      } else {
        seed = hashImageData32(imageData);
      }
      rnd = mulberry32(seed);
    }catch(e){ rnd = Math.random; }

    while(finalColors.length < targetColors && pixels.length > 0){
      const idx = Math.floor(rnd() * pixels.length);
      const p = pixels[idx];
      if(!finalColors.find(c => 
        Math.abs(c.r - p.r) <= 25 && 
        Math.abs(c.g - p.g) <= 25 && 
        Math.abs(c.b - p.b) <= 25
      )){
        finalColors.push(p);
      }
      pixels.splice(idx, 1);
    }
    
    const palette = finalColors.map(c => rgbToHex(c));
    return palette.length > 0 ? palette : ["#000000"];
  }

  function updatePaletteFromSourceImage(colorCount = 16, methodOverride = null) {
    if(!srcImageData){ return false; }
    try {
      const normalizedColorCount = syncAutoReduceControls(colorCount);
      const method = methodOverride || (reduceMethodSelect ? reduceMethodSelect.value : "standard");
      const cacheKey = getPaletteCacheKey(normalizedColorCount, method);
      if(paletteExtractionCache.has(cacheKey)){
        return setPaletteFromHexList(paletteExtractionCache.get(cacheKey));
      }

      const MAX_SIDE = 320;
      const srcW0 = srcC.width || srcImageData.width;
      const srcH0 = srcC.height || srcImageData.height;
      const scale = Math.min(1, MAX_SIDE / Math.max(1, Math.max(srcW0, srcH0)));
      const tmpW = Math.max(1, Math.round(srcW0 * scale));
      const tmpH = Math.max(1, Math.round(srcH0 * scale));

      const tmp = document.createElement('canvas'); 
      tmp.width = tmpW; 
      tmp.height = tmpH;
      const tctx = tmp.getContext('2d'); 
      tctx.imageSmoothingEnabled = true;
      
      try{
        tctx.drawImage(srcC, 0, 0, srcW0, srcH0, 0, 0, tmpW, tmpH);
      }catch(e){
        const s = document.createElement('canvas'); 
        s.width = srcImageData.width; 
        s.height = srcImageData.height;
        s.getContext('2d').putImageData(srcImageData,0,0);
        tctx.drawImage(s,0,0,srcImageData.width,srcImageData.height,0,0,tmpW,tmpH);
      }

      let imageDataForExtraction = tctx.getImageData(0,0,tmpW,tmpH);

      const isFiltered = filterState.contrast !== 100 || filterState.brightness !== 100 || 
                        filterState.hue !== 0 || filterState.saturation !== 100 || filterState.luminance !== 100;
      if (isFiltered) {
        imageDataForExtraction = applyFilters(imageDataForExtraction);
        if (!imageDataForExtraction) return false;
      }

      let palette = null;
      if(method === "wu"){
        palette = wuQuantize(imageDataForExtraction, normalizedColorCount);
      } else if(method === "neuquant"){
        palette = neuQuant(imageDataForExtraction, normalizedColorCount, 10);
      } else if(method === "kmeans"){
        palette = buildPaletteByKMeans(imageDataForExtraction, normalizedColorCount, 6);
      } else {
        palette = extractColorsGameQuality(imageDataForExtraction, normalizedColorCount);
      }
      if(palette.length === 0) return false;
      const normalizedPalette = palette.map(h=>String(h).toUpperCase());
      cachePalette(cacheKey, normalizedPalette);
      return setPaletteFromHexList(normalizedPalette);
    } catch(err) {
      console.error("Palette update failed:", err);
      return false;
    }
  }

  function autoReduceFromCurrentCount(options = {}){
    if(!srcImageData) return false;
    const colorCount = syncAutoReduceControls(autoReduceColorCount ? autoReduceColorCount.value : 32);
    try{
      const ok = updatePaletteFromSourceImage(colorCount);
      if(!ok){
        if(options.alertOnFail) alert("色の抽出に失敗しました");
        return false;
      }
      if(options.scheduleHistory !== false) scheduleHistory();
      if(options.process !== false) requestProcess(10);
      return true;
    }catch(err){
      console.error(err);
      if(options.alertOnFail) alert("色の抽出中にエラーが発生しました: " + (err && err.message ? err.message : err));
      return false;
    }
  }

  // recent palettes
  function loadRecentPalettes(){
    try{
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  
  function saveRecentPalettes(arr){
    try{ localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0,3))); }catch(e){}
  }
  
  function pushRecentPalette(hexArr){
    if(!Array.isArray(hexArr)||hexArr.length===0) return;
    const raw = loadRecentPalettes();
    const serialized = hexArr.join("|");
    const filtered = raw.filter(r=> r.join("|") !== serialized);
    filtered.unshift(hexArr);
    saveRecentPalettes(filtered);
    renderRecent();
  }
  
  function renderRecent(){
    recentRow.innerHTML="";
    const raw = loadRecentPalettes();
    for(let i=0;i<raw.length && i<3;i++){
      const arr = raw[i];
      const btn = document.createElement("button");
      btn.className="recentBtn";
      btn.title = `最近のパレット ${i+1}`;
      const sw = document.createElement("div"); 
      sw.className="recentSwatch"; 
      sw.style.background=arr[0]||"#000";
      const label = document.createElement("div"); 
      label.className="small"; 
      label.textContent = `${arr.length} 色`;
      btn.appendChild(sw); 
      btn.appendChild(label);
      btn.addEventListener("click", ()=> {
        paletteInput.value = arr.join("\n");
        currentHexList = parsePalette(paletteInput.value || "");
        ensureNamesSize(currentHexList.length);
        refreshPalettePreview(currentHexList);
        buildPaletteEditor(currentHexList);
        scheduleHistory();
      });
      recentRow.appendChild(btn);
    }
  }

  // initial palette build
  currentHexList = parsePalette(paletteInput.value || "");
  ensureNamesSize(currentHexList.length);
  refreshPalettePreview(currentHexList);
  buildPaletteEditor(currentHexList);
  renderRecent();
  renderSelectedPalette();

  // シード入力
  const seedInputEl = document.getElementById("seedInput");
  const applySeedBtnEl = document.getElementById("applySeedBtn");
  const randomSeedBtnEl = document.getElementById("randomSeedBtn");

  syncAutoReduceControls(autoReduceColorCount ? autoReduceColorCount.value : 32);

  let autoReduceCountTimer = null;
  function queueAutoReduceFromCount(){
    if(!srcImageData) return;
    if(autoReduceCountTimer) clearTimeout(autoReduceCountTimer);
    autoReduceCountTimer = setTimeout(()=>{
      autoReduceFromCurrentCount({ alertOnFail: true, scheduleHistory: true, process: true });
    }, 50);
  }

  if(autoReduceColorSlider){
    autoReduceColorSlider.addEventListener("input", (ev)=>{
      const idx = Math.max(0, Math.min(AUTO_REDUCE_COUNTS.length - 1, parseInt(ev.target.value, 10) || 0));
      syncAutoReduceControls(AUTO_REDUCE_COUNTS[idx]);
      queueAutoReduceFromCount();
    });
  }

  if(autoReduceColorCount){
    autoReduceColorCount.addEventListener("input", ()=>{
      syncAutoReduceControls(autoReduceColorCount.value);
      queueAutoReduceFromCount();
    });
    autoReduceColorCount.addEventListener("change", ()=>{
      syncAutoReduceControls(autoReduceColorCount.value);
      queueAutoReduceFromCount();
    });
  }
  
  function currentAutoReduceCount(){ 
    return syncAutoReduceControls(autoReduceColorCount ? autoReduceColorCount.value : 32); 
  }
  
  if(applySeedBtnEl){
    applySeedBtnEl.addEventListener("click", ()=>{
      const raw = seedInputEl ? String(seedInputEl.value || "").trim() : "";
      if(raw === ""){
        userSeed = null;
        if(!srcImageData) return alert('シードをクリアしました（画像由来のシードを使用します）。');
        updatePaletteFromSourceImage(currentAutoReduceCount());
        scheduleHistory();
        setTimeout(()=>doProcess(), 50);
        return;
      }
      const v = parseInt(raw, 10);
      if(isNaN(v)) { alert('有効な数値シードを入力してください'); return; }
      userSeed = v >>> 0;
      if(!srcImageData) return alert('シードを設定しました（画像が未読込）。');
      updatePaletteFromSourceImage(currentAutoReduceCount());
      scheduleHistory();
      setTimeout(()=>doProcess(), 50);
    });
    updateUsedColorCount();
  }
  
  if(randomSeedBtnEl){
    randomSeedBtnEl.addEventListener("click", ()=>{
      try{
        const a = new Uint32Array(1); 
        window.crypto.getRandomValues(a); 
        userSeed = a[0] >>> 0;
      }catch(e){ 
        userSeed = Math.floor(Math.random() * 0x100000000) >>> 0; 
      }
      if(seedInputEl) seedInputEl.value = String(userSeed);
      if(!srcImageData) return alert('ランダムシードを生成しました（画像が未読込）。');
      updatePaletteFromSourceImage(currentAutoReduceCount());
      scheduleHistory();
      setTimeout(()=>doProcess(), 50);
    });
  }

  paletteInput.addEventListener("input", ()=>{
    const oldNames = paletteNames.slice(0);
    currentHexList = parsePalette(paletteInput.value || "");
    ensureNamesSize(currentHexList.length);
    if(selectedPaletteIndex >= currentHexList.length) selectedPaletteIndex = -1;
    for(let i=0;i<Math.min(oldNames.length, paletteNames.length); i++){
      if(!paletteNames[i]) paletteNames[i] = oldNames[i];
    }
    refreshPalettePreview(currentHexList);
    buildPaletteEditor(currentHexList);
  });

  if(applyPaletteBtn){
    applyPaletteBtn.addEventListener("click", ()=>{
      if(!currentHexList || currentHexList.length === 0){ alert("パレットが空です"); return; }
      refreshPalettePreview(currentHexList);
      buildPaletteEditor(currentHexList);
      scheduleHistory();
      try{ doProcess(); }catch(e){ console.error(e); alert('変換実行中にエラーが発生しました: ' + (e && e.message?e.message:e)); }
    });
  }

  // export/import JSON
  exportJsonBtn.addEventListener("click", ()=>{
    const data = { hex: currentHexList.slice(0), names: paletteNames.slice(0) };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    downloadBlob(blob, "json");
  });
  
  importJsonInput.addEventListener("change",(ev)=>{
    const f = ev.target.files?.[0]; 
    if(!f) return;
    const r = new FileReader();
    r.onload = ()=> {
      try{
        const obj = JSON.parse(String(r.result));
        if(!obj || !Array.isArray(obj.hex)) { 
          alert("不正なJSONです。{hex:[...], names:[...]} 形式を指定してください。"); 
          return; 
        }
        currentHexList = obj.hex.map(h=>(typeof h==="string")?(h.startsWith("#")?h.toUpperCase():("#"+h).toUpperCase()):null).filter(Boolean);
        paletteNames = Array.isArray(obj.names) ? obj.names.slice(0) : new Array(currentHexList.length).fill("");
        paletteInput.value = currentHexList.join("\n");
        ensureNamesSize(currentHexList.length);
        refreshPalettePreview(currentHexList);
        buildPaletteEditor(currentHexList);
        scheduleHistory();
        alert("JSONを読み込みました。");
      }catch(e){ 
        alert("JSONの読み込みに失敗しました: " + e.message); 
      }
    };
    r.onerror = ()=> { alert("ファイルの読み込みに失敗しました"); };
    r.readAsText(f);
    importJsonInput.value = "";
  });

  if(exportPaletteBtn){
    exportPaletteBtn.addEventListener("click", ()=>{
      if(!currentHexList || currentHexList.length === 0){ alert("パレットが空です"); return; }
      const fmt = paletteFormatSelect ? paletteFormatSelect.value : "txt";
      let blob = null; let ext = fmt;
      if(fmt === "txt") blob = exportPaletteTXT();
      else if(fmt === "csv") blob = exportPaletteCSV();
      else if(fmt === "gpl") blob = exportPaletteGPL();
      else if(fmt === "pal") blob = exportPalettePAL();
      else if(fmt === "act") blob = exportPaletteACT();
      else if(fmt === "aco") blob = exportPaletteACO();
      else if(fmt === "ase") blob = exportPaletteASE();
      if(!blob) { alert("出力形式に対応していません"); return; }
      downloadBlob(blob, ext);
    });
  }

  // Drag and drop
  const dropArea = document.getElementById('dropArea');
  if(dropArea){
    dropArea.addEventListener('click', ()=> fileInput.click());
    dropArea.addEventListener('dragover', (e)=>{ 
      e.preventDefault(); 
      dropArea.style.background='rgba(255,102,153,0.15)'; 
      dropArea.style.borderColor='rgba(255,102,153,0.5)'; 
    });
    dropArea.addEventListener('dragleave', (e)=>{ 
      e.preventDefault(); 
      dropArea.style.background='rgba(255,102,153,0.05)'; 
      dropArea.style.borderColor='rgba(255,102,153,0.3)'; 
    });
    dropArea.addEventListener('drop', (e)=>{
      e.preventDefault();
      dropArea.style.background='rgba(255,102,153,0.05)';
      dropArea.style.borderColor='rgba(255,102,153,0.3)';
      const files = e.dataTransfer.files;
      if(files && files.length > 0){
        const file = files[0];
        if(file.type.match(/image.*/)){
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event('change'));
        } else {
          alert('画像ファイルを選択してください（PNG, JPG, GIF, WEBP, BMP）');
        }
      }
    });
  }

  function loadImageToCanvas(img, name, options = {}){
    srcW = img.naturalWidth; 
    srcH = img.naturalHeight;
    originalAspect = srcW / srcH;
    srcC.width = srcW; 
    srcC.height = srcH;
    const sctx = srcC.getContext("2d"); 
    sctx.imageSmoothingEnabled=false;
    sctx.clearRect(0,0,srcW,srcH);
    sctx.drawImage(img,0,0);
    try{ srcImageData = sctx.getImageData(0,0,srcW,srcH); } catch(e){ srcImageData = null; }
    outW.value = srcW; 
    outH.value = srcH;
    fileInfo.textContent = `${name} — ${srcW}×${srcH}`;
    storeSrcSnapshot();
    fitSrcToWrapper();
    resetView();
    adjustSrcCssSize();
    applySliderToSize();
    if(!options.skipAutoReduce){
      setTimeout(()=>{ autoReduceFromCurrentCount({ scheduleHistory: false, process: true }); }, 150);
    }
    if(!options.skipHistory){
      scheduleHistory();
    }
  }

  // image load
  fileInput.addEventListener("change", (e)=>{
    const f = e.target.files?.[0]; 
    if(!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = ()=>{
      URL.revokeObjectURL(url);
      loadImageToCanvas(img, f.name);
    };
    img.onerror = ()=> { 
      URL.revokeObjectURL(url); 
      alert("画像の読み込みに失敗しました"); 
    };
    img.src = url;
  });

  function openTestModal(){
    if(!testModal) return;
    testModal.classList.add("active");
    testModal.setAttribute("aria-hidden", "false");
  }

  function closeTestModal(){
    if(!testModal) return;
    testModal.classList.remove("active");
    testModal.setAttribute("aria-hidden", "true");
  }

  function loadTestImage(src){
    const img = new Image();
    img.onload = ()=>{
      loadImageToCanvas(img, src);
      closeTestModal();
    };
    img.onerror = ()=>{
      alert(`${src} の読み込みに失敗しました`);
    };
    img.src = src;
  }

  if(openTestModalBtn){
    openTestModalBtn.addEventListener("click", openTestModal);
  }
  if(closeTestModalBtn){
    closeTestModalBtn.addEventListener("click", closeTestModal);
  }
  if(testModal){
    testModal.addEventListener("click", (ev)=>{
      if(ev.target === testModal) closeTestModal();
    });
    const testButtons = testModal.querySelectorAll(".testSelectBtn");
    testButtons.forEach(btn => {
      btn.addEventListener("click", ()=>{
        const src = btn.getAttribute("data-test-src");
        if(src) loadTestImage(src);
      });
    });
  }
  window.addEventListener("keydown", (ev)=>{
    if(ev.key === "Escape") closeTestModal();
  });

  // keepAspect sync
  let ignoreSizeSync=false;
  let outputSizeUpdateTimer = null;

  function updateKeepAspectModeUI(){
    if(!toggleKeepAspectBtn) return;
    const on = !!autoAdjustMode;
    toggleKeepAspectBtn.textContent = on ? "自動調整:ON" : "自動調整:OFF";
    toggleKeepAspectBtn.setAttribute("data-on", on ? "true" : "false");
  }

  if(toggleKeepAspectBtn){
    toggleKeepAspectBtn.addEventListener("click", ()=>{
      autoAdjustMode = !autoAdjustMode;
      updateKeepAspectModeUI();
      scheduleHistory();
    });
    updateKeepAspectModeUI();
  }

  function queueOutputSizeReprocess(){
    if(!srcImageData) return;
    if(outputSizeUpdateTimer) clearTimeout(outputSizeUpdateTimer);
    outputSizeUpdateTimer = setTimeout(()=>{
      requestProcess(30);
    }, 50);
  }

  outW.addEventListener("input", ()=>{
    if(ignoreSizeSync) return;
    if(autoAdjustMode && srcW && srcH){
      const w = parseInt(outW.value,10) || 0;
      if(w>0){ 
        ignoreSizeSync=true; 
        outH.value = Math.max(1, Math.round(w / originalAspect)); 
        ignoreSizeSync=false; 
      }
    }
    queueOutputSizeReprocess();
  });
  
  outH.addEventListener("input", ()=>{
    if(ignoreSizeSync) return;
    if(autoAdjustMode && srcW && srcH){
      const h = parseInt(outH.value,10) || 0;
      if(h>0){ 
        ignoreSizeSync=true; 
        outW.value = Math.max(1, Math.round(h * originalAspect)); 
        ignoreSizeSync=false; 
      }
    }
    queueOutputSizeReprocess();
  });

  function adjustSrcCssSize(){
    if(!srcC || !srcC.width || !srcC.height) return;
    srcC.style.width = `${srcC.width}px`;
    srcC.style.height = `${srcC.height}px`;
    if(srcZoom <= getSrcMinZoom() || !Number.isFinite(srcZoom)){
      fitSrcToWrapper();
      return;
    }
    applySrcZoom();
  }

  function calculateOutputSizeFromDotScale() {
    if(!srcW||!srcH) return;
    const dotPixelSize = parseInt(dotScale.value, 10) || 2500;
    const scaleFactor = Math.max(1, Math.min(10, 5000 / dotPixelSize));
    const newW = Math.max(1, Math.round(srcW / scaleFactor));
    const newH = Math.max(1, Math.round(srcH / scaleFactor));
    ignoreSizeSync = true;
    outW.value = newW;
    outH.value = newH;
    ignoreSizeSync = false;
    adjustSrcCssSize();
  }

  function applySliderToSize() {
    calculateOutputSizeFromDotScale();
  }
  
  let dotScaleUpdateTimeout = null;
  function triggerDotScaleReprocess() {
    if (dotScaleUpdateTimeout) clearTimeout(dotScaleUpdateTimeout);
    dotScaleUpdateTimeout = setTimeout(() => {
      if (!srcImageData) return;
      doProcess();
    }, 80);
  }
  
  function onDotScaleChange() {
    const value = parseInt(dotScale.value, 10);
    const percent = Math.round(value / 25);
    dotScaleInfo.textContent = percent + "%";
    if(dotScaleNumber) dotScaleNumber.value = percent;
    applySliderToSize();
    triggerDotScaleReprocess();
  }
  
  dotScale.addEventListener("input", onDotScaleChange);
  onDotScaleChange();

  // status helpers
  function showIdle(){ 
    if(headerStatusEl) headerStatusEl.setAttribute("data-state", "idle");
    statusText.textContent="待機中"; 
  }
  
  function showProcessing(){ 
    if(headerStatusEl) headerStatusEl.setAttribute("data-state", "processing");
    statusText.textContent="変換中…"; 
  }
  
  function showDonePersistent(){ 
    if(headerStatusEl) headerStatusEl.setAttribute("data-state", "done");
    statusText.textContent="変換完了"; 
  }

  // 変換処理（続く）
  function doProcess(){
    if(!srcC.width||!srcC.height){ alert("画像を読み込んでください"); return; }
    if(isProcessing){
      pendingProcess = true;
      return;
    }
    isProcessing = true;
    
    const prevViewportState = offscreen ? { 
      zoom: camera.zoom, 
      centerX: camera.centerX, 
      centerY: camera.centerY, 
      width: offscreen.width, 
      height: offscreen.height 
    } : null;
    
    const baseW = Math.max(1, parseInt(outW.value,10) || srcC.width);
    const baseH = Math.max(1, parseInt(outH.value,10) || srcC.height);
    const targetW = Math.max(1, Math.round(baseW)), targetH = Math.max(1, Math.round(baseH));
    let paletteObjs = currentHexList.map(h=>hexToRgbObj(h));
    
    if(paletteObjs.length===0){ 
      alert("パレットが空です"); 
      showDonePersistent(); 
      return; 
    }

    showProcessing();
    
    setTimeout(()=>{
      try{
        const tmp = document.createElement("canvas"); 
        tmp.width=targetW; 
        tmp.height=targetH;
        const tctx = tmp.getContext("2d"); 
        tctx.imageSmoothingEnabled=false;
        tctx.drawImage(srcC,0,0,srcC.width,srcC.height,0,0,targetW,targetH);
        let id = tctx.getImageData(0,0,targetW,targetH);
        
        const edgeStrength = edgeStrengthSlider ? parseInt(edgeStrengthSlider.value,10) : 100;
        const isFiltered = filterState.contrast !== 100 || filterState.brightness !== 100 || 
                          filterState.hue !== 0 || filterState.saturation !== 100 || 
                          filterState.luminance !== 100 || edgeStrength !== 100;
        if (isFiltered) {
          id = applyFilters(id);
          if (!id) { 
            alert("フィルター適用に失敗しました"); 
            showDonePersistent(); 
            return; 
          }
        }

        const reduceMethod = reduceMethodSelect ? reduceMethodSelect.value : "standard";

        if(reduceMethod === "bilateral"){
          const filtered = applyBilateralFilter(id, 1.4, 30);
          if(filtered) id = filtered;
        }

        if(reduceMethod === "kmeans"){
          const k = currentAutoReduceCount();
          const kmPalette = buildPaletteByKMeans(id, k, 6);
          if(kmPalette.length > 0){
            paletteInput.value = kmPalette.join("\n");
            currentHexList = parsePalette(paletteInput.value || "");
            paletteNames = new Array(currentHexList.length).fill("");
            ensureNamesSize(currentHexList.length);
            refreshPalettePreview(currentHexList);
            buildPaletteEditor(currentHexList);
            paletteObjs = currentHexList.map(h=>hexToRgbObj(h));
          }
        }

        if(reduceMethod === "wu"){
          const k = currentAutoReduceCount();
          const wuPalette = wuQuantize(id, k);
          if(wuPalette.length > 0){
            paletteInput.value = wuPalette.join("\n");
            currentHexList = parsePalette(paletteInput.value || "");
            paletteNames = new Array(currentHexList.length).fill("");
            ensureNamesSize(currentHexList.length);
            refreshPalettePreview(currentHexList);
            buildPaletteEditor(currentHexList);
            paletteObjs = currentHexList.map(h=>hexToRgbObj(h));
          }
        }

        if(reduceMethod === "neuquant"){
          const k = currentAutoReduceCount();
          const nqPalette = neuQuant(id, k, 10);
          if(nqPalette.length > 0){
            paletteInput.value = nqPalette.join("\n");
            currentHexList = parsePalette(paletteInput.value || "");
            paletteNames = new Array(currentHexList.length).fill("");
            ensureNamesSize(currentHexList.length);
            refreshPalettePreview(currentHexList);
            buildPaletteEditor(currentHexList);
            paletteObjs = currentHexList.map(h=>hexToRgbObj(h));
          }
        }
        
        const data = id.data;
        const useLab = useLabInput.checked;
        const keepAlpha = keepAlphaInput.checked;
        const dither = ditherCheckbox.checked;

        const paletteLab = (useLab || reduceMethod === "ciede2000") ? paletteObjs.map(c=>{
          const lab = rgbToLab(c.r,c.g,c.b);
          return { L: lab.L, a: lab.a, b: lab.b };
        }) : null;

        function findNearest(r,g,b){
          let bestIdx = 0; let bestDist = Infinity;
          if(reduceMethod === "ciede2000"){
            const lab = rgbToLab(r,g,b);
            for(let j=0;j<paletteObjs.length;j++){
              const d = ciede2000(lab, paletteLab[j]);
              if(d < bestDist){ bestDist = d; bestIdx = j; }
            }
            return { idx: bestIdx, dist: bestDist };
          }
          if(useLab){
            const lab = rgbToLab(r,g,b);
            for(let j=0;j<paletteObjs.length;j++){ 
              const d = labDist2(lab, paletteLab[j]); 
              if(d < bestDist){ bestDist = d; bestIdx = j; } 
            }
            return { idx: bestIdx, dist: bestDist };
          }
          for(let j=0;j<paletteObjs.length;j++){ 
            const d = rgbDist2({r,g,b}, paletteObjs[j]); 
            if(d < bestDist){ bestDist = d; bestIdx = j; } 
          }
          return { idx: bestIdx, dist: bestDist };
        }

        if(!dither){
          for(let i=0;i<data.length;i+=4){
            const a=data[i+3]; 
            if(keepAlpha&&a===0){
              const pc0 = paletteObjs[0];
              data[i]=pc0.r; data[i+1]=pc0.g; data[i+2]=pc0.b; data[i+3]=0;
              continue;
            }
            const r=data[i], g=data[i+1], b=data[i+2];
            const best = findNearest(r,g,b);
            const pc = paletteObjs[best.idx];
            data[i]=pc.r; data[i+1]=pc.g; data[i+2]=pc.b; data[i+3]=pc.a;
          }
        } else {
          const w = id.width, h = id.height;
          const buf = new Float32Array(w*h*4);
          for(let i=0;i<data.length;i++) buf[i] = data[i];
          
          const ditherPattern = ditherPatternSelect ? ditherPatternSelect.value : 'basic';
          const ditherStrength = ditherStrengthSlider ? parseInt(ditherStrengthSlider.value, 10) / 100 : 1.0;

          const orderedPatterns = new Set(["ordered4","ordered8","blue8","blue16"]);
          const diffusionModes = new Set(["atkinson","jarvis","stucki","burkes","sierra","sierra2","sierraLite"]);
          let usesBuffer = true;

          if(orderedPatterns.has(ditherPattern)){
            usesBuffer = false;
            const size = ditherPattern === "ordered4" ? 4 : ditherPattern === "ordered8" ? 8 : ditherPattern === "blue8" ? 8 : 16;
            const matrix = ditherPattern.startsWith("ordered") ? generateBayerMatrix(size) : generateBlueNoiseMatrix(size);
            const denom = size * size;
            for(let y=0;y<h;y++){
              for(let x=0;x<w;x++){
                const off = (y*w + x)*4;
                const a = data[off+3];
                if(keepAlpha && a===0){
                  const pc0 = paletteObjs[0];
                  data[off]=pc0.r; data[off+1]=pc0.g; data[off+2]=pc0.b; data[off+3]=0;
                  continue;
                }
                const t = (matrix[y%size][x%size] / denom - 0.5) * 64 * ditherStrength;
                const r = Math.max(0, Math.min(255, Math.round(data[off] + t)));
                const g = Math.max(0, Math.min(255, Math.round(data[off+1] + t)));
                const b = Math.max(0, Math.min(255, Math.round(data[off+2] + t)));
                const best = findNearest(r,g,b);
                const pc = paletteObjs[best.idx];
                data[off]=pc.r; data[off+1]=pc.g; data[off+2]=pc.b; data[off+3]=keepAlpha ? a : pc.a;
              }
            }
          } else if(ditherPattern === "riemersma"){
            usesBuffer = false;
            const qLen = 16;
            const weights = Array.from({length:qLen}, (_,i)=>Math.exp(-i/4));
            const norm = weights.reduce((a,b)=>a+b,0);
            for(let i=0;i<weights.length;i++) weights[i] /= norm;
            for(let y=0;y<h;y++){
              const serp = (y % 2) === 1;
              let qR = new Array(qLen).fill(0);
              let qG = new Array(qLen).fill(0);
              let qB = new Array(qLen).fill(0);
              for(let xi=0; xi<w; xi++){
                const x = serp ? (w - 1 - xi) : xi;
                const off = (y*w + x)*4;
                const a = data[off+3];
                if(keepAlpha && a===0){
                  const pc0 = paletteObjs[0];
                  data[off]=pc0.r; data[off+1]=pc0.g; data[off+2]=pc0.b; data[off+3]=0;
                  continue;
                }
                let addR=0, addG=0, addB=0;
                for(let i=0;i<qLen;i++){
                  addR += qR[i] * weights[i];
                  addG += qG[i] * weights[i];
                  addB += qB[i] * weights[i];
                }
                const r = Math.max(0, Math.min(255, Math.round(data[off] + addR)));
                const g = Math.max(0, Math.min(255, Math.round(data[off+1] + addG)));
                const b = Math.max(0, Math.min(255, Math.round(data[off+2] + addB)));
                const best = findNearest(r,g,b);
                const pc = paletteObjs[best.idx];
                data[off]=pc.r; data[off+1]=pc.g; data[off+2]=pc.b; data[off+3]=keepAlpha ? a : pc.a;
                const er = (r - pc.r) * ditherStrength;
                const eg = (g - pc.g) * ditherStrength;
                const eb = (b - pc.b) * ditherStrength;
                qR.pop(); qR.unshift(er);
                qG.pop(); qG.unshift(eg);
                qB.pop(); qB.unshift(eb);
              }
            }
          } else {
            function getPatternThreshold(x, y, pattern) {
              switch(pattern) {
                case 'check': return ((x + y) % 2 === 0) ? 0.25 : -0.25;
                case 'ichimatsu': return ((Math.floor(x/2) + Math.floor(y/2)) % 2 === 0) ? 0.3 : -0.3;
                case 'tile': {
                  const tx = x % 4, ty = y % 4;
                  const tileMatrix = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
                  return (tileMatrix[ty][tx] / 16 - 0.5);
                }
                case 'vertical': return (x % 2 === 0) ? 0.3 : -0.3;
                case 'horizontal': return (y % 2 === 0) ? 0.3 : -0.3;
                case 'diagonalUp': return ((x + y) % 3 === 0) ? 0.35 : (((x + y) % 3 === 1) ? 0 : -0.35);
                case 'diagonalDown': return ((x - y + 1000) % 3 === 0) ? 0.35 : (((x - y + 1000) % 3 === 1) ? 0 : -0.35);
                case 'mesh': return ((x % 3 === 0) || (y % 3 === 0)) ? 0.3 : -0.2;
                case 'halftone': {
                  const cx = (x % 4) - 1.5, cy = (y % 4) - 1.5;
                  const dist = Math.sqrt(cx*cx + cy*cy) / 2.12;
                  return (dist - 0.5) * 0.8;
                }
                case 'basic':
                default: return 0;
              }
            }

            function getKernel(name){
              switch(name){
                case "atkinson": return { div:8, pts:[[1,0,1],[2,0,1],[-1,1,1],[0,1,1],[1,1,1],[0,2,1]] };
                case "jarvis": return { div:48, pts:[[1,0,7],[2,0,5],[-2,1,3],[-1,1,5],[0,1,7],[1,1,5],[2,1,3],[-2,2,1],[-1,2,3],[0,2,5],[1,2,3],[2,2,1]] };
                case "stucki": return { div:42, pts:[[1,0,8],[2,0,4],[-2,1,2],[-1,1,4],[0,1,8],[1,1,4],[2,1,2],[-2,2,1],[-1,2,2],[0,2,4],[1,2,2],[2,2,1]] };
                case "burkes": return { div:32, pts:[[1,0,8],[2,0,4],[-2,1,2],[-1,1,4],[0,1,8],[1,1,4],[2,1,2]] };
                case "sierra": return { div:32, pts:[[1,0,5],[2,0,3],[-2,1,2],[-1,1,4],[0,1,5],[1,1,4],[2,1,2],[-1,2,2],[0,2,3],[1,2,2]] };
                case "sierra2": return { div:16, pts:[[1,0,4],[2,0,3],[-2,1,1],[-1,1,2],[0,1,3],[1,1,2],[2,1,1],[-1,2,1],[0,2,2],[1,2,1]] };
                case "sierraLite": return { div:4, pts:[[1,0,2],[-1,1,1],[0,1,1]] };
                default: return { div:16, pts:[[1,0,7],[-1,1,3],[0,1,5],[1,1,1]] };
              }
            }
            
            for(let y=0;y<h;y++){
              const serpentine = (y % 2) === 1;
              for(let x=0;x<w;x++){
                const off = (y*w + x)*4;
                const a = Math.round(buf[off+3]);
                if(keepAlpha && a===0){
                  const pc0 = paletteObjs[0];
                  buf[off+0]=pc0.r; buf[off+1]=pc0.g; buf[off+2]=pc0.b; buf[off+3]=0;
                  continue;
                }
                
                const patternOffset = diffusionModes.has(ditherPattern) ? 0 : getPatternThreshold(x, y, ditherPattern) * 64 * ditherStrength;
                const r = Math.max(0, Math.min(255, Math.round(buf[off+0] + patternOffset)));
                const g = Math.max(0, Math.min(255, Math.round(buf[off+1] + patternOffset)));
                const b = Math.max(0, Math.min(255, Math.round(buf[off+2] + patternOffset)));
                
                const best = findNearest(r,g,b);
                const pc = paletteObjs[best.idx];
                
                buf[off+0]=pc.r; buf[off+1]=pc.g; buf[off+2]=pc.b; buf[off+3]=keepAlpha ? a : 255;
                
                const er = r - pc.r;
                const eg = g - pc.g;
                const eb = b - pc.b;
                
                const delta = Math.sqrt(best.dist || 0);
                const level = parseInt(dotScale.value, 10);
                const baseFactor = (level <= 2) ? 0.04 : 0.12;
                const scaleDelta = 60;
                const adaptiveFactor = (baseFactor + (1 - baseFactor) * Math.min(1, delta / scaleDelta)) * ditherStrength;
                const kernel = getKernel(ditherPattern);
                for(const [dx0,dy,weight] of kernel.pts){
                  const dx = serpentine ? -dx0 : dx0;
                  const nx = x + dx;
                  const ny = y + dy;
                  if(nx<0 || nx>=w || ny<0 || ny>=h) continue;
                  const o = (ny*w + nx)*4;
                  const wgt = (weight / kernel.div) * adaptiveFactor;
                  buf[o+0] += er * wgt;
                  buf[o+1] += eg * wgt;
                  buf[o+2] += eb * wgt;
                }
              }
            }
          }

          if(usesBuffer){
            for(let i=0;i<data.length;i+=4){
              data[i] = Math.max(0, Math.min(255, Math.round(buf[i])));
              data[i+1] = Math.max(0, Math.min(255, Math.round(buf[i+1])));
              data[i+2] = Math.max(0, Math.min(255, Math.round(buf[i+2])));
              data[i+3] = keepAlpha ? Math.max(0, Math.min(255, Math.round(buf[i+3]))) : 255;
            }

            if(parseInt(dotScale.value, 10) <= 2){
              const w2 = id.width, h2 = id.height;
              const src = new Uint8ClampedArray(data);
              const out = new Uint8ClampedArray(src);
              for(let y=1;y<h2-1;y++){
                for(let x=1;x<w2-1;x++){
                  const off = (y*w2 + x)*4;
                  const r0 = src[off], g0 = src[off+1], b0 = src[off+2];
                  const counts = new Map();
                  for(let ny=-1; ny<=1; ny++){
                    for(let nx=-1; nx<=1; nx++){
                      if(nx===0 && ny===0) continue;
                      const oi = ((y+ny)*w2 + (x+nx))*4;
                      const key = (src[oi]<<16) | (src[oi+1]<<8) | src[oi+2];
                      counts.set(key, (counts.get(key)||0) + 1);
                    }
                  }
                  let maxKey = null, maxCount = 0;
                  for(const [k,v] of counts){ 
                    if(v>maxCount){ 
                      maxCount=v; 
                      maxKey=k; 
                    } 
                  }
                  if(maxCount >= 5){
                    const mr = (maxKey >> 16) & 0xFF;
                    const mg = (maxKey >> 8) & 0xFF;
                    const mb = maxKey & 0xFF;
                    if(!(Math.abs(r0-mr)===0 && Math.abs(g0-mg)===0 && Math.abs(b0-mb)===0)){
                      out[off]=mr; out[off+1]=mg; out[off+2]=mb; out[off+3]=255;
                    }
                  }
                }
              }
              for(let i=0;i<data.length;i++) data[i]=out[i];
            }
          }
        }

        if(paletteOnlyCheckbox && paletteOnlyCheckbox.checked){
          for(let i=0;i<data.length;i+=4){
            const a = data[i+3];
            if(keepAlpha && a===0){
              const pc0 = paletteObjs[0];
              data[i]=pc0.r; data[i+1]=pc0.g; data[i+2]=pc0.b; data[i+3]=0;
              continue;
            }
            const best = findNearest(data[i], data[i+1], data[i+2]);
            const pc = paletteObjs[best.idx];
            data[i]=pc.r; data[i+1]=pc.g; data[i+2]=pc.b; data[i+3]=keepAlpha ? a : pc.a;
          }
        }

        lastRecoloredImage = id;
        lastUsedPaletteHexList = currentHexList.slice(0);
        offscreen = document.createElement("canvas");
        offscreen.width = lastRecoloredImage.width; 
        offscreen.height = lastRecoloredImage.height;
        const offctx = offscreen.getContext("2d"); 
        offctx.imageSmoothingEnabled=false;
        offctx.putImageData(lastRecoloredImage,0,0);

        if(prevViewportState){
          camera.zoom = prevViewportState.zoom || 1;
          try{
            const sx = prevViewportState.width > 0 ? (offscreen.width / prevViewportState.width) : 1;
            const sy = prevViewportState.height > 0 ? (offscreen.height / prevViewportState.height) : 1;
            camera.centerX = Math.round((prevViewportState.centerX || offscreen.width/2) * sx);
            camera.centerY = Math.round((prevViewportState.centerY || offscreen.height/2) * sy);
          }catch(e){ 
            camera.centerX = offscreen.width/2; 
            camera.centerY = offscreen.height/2; 
          }
        } else {
          camera.zoom = 1; 
          camera.centerX = offscreen.width/2; 
          camera.centerY = offscreen.height/2;
        }
        
        drawViewport();
        dlBtn.disabled = false;
        if(exportImageBtn) exportImageBtn.disabled = false;
        renderSelectedPalette();
        updateUsedColorCount();
        pushRecentPalette(currentHexList.slice(0));
        console.log("doProcess: finished", offscreen.width, offscreen.height);
        showDonePersistent();
        isProcessing = false;
        if(pendingProcess){
          pendingProcess = false;
          requestProcess(40);
        }
      }catch(err){
        console.error(err);
        alert("変換中にエラーが発生しました: " + (err && err.message ? err.message : err));
        showIdle();
        isProcessing = false;
        if(pendingProcess){
          pendingProcess = false;
          requestProcess(40);
        }
      }
    }, 20);
  }

  // SVG export
  exportSvgBtn.addEventListener("click", ()=>{
    if(!lastRecoloredImage) { alert("変換結果がありません"); return; }
    const w = lastRecoloredImage.width, h=lastRecoloredImage.height;
    let svg = `<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" shape-rendering="crispEdges">\n`;
    const d = lastRecoloredImage.data;
    for(let y=0;y<h;y++){
      let row = "";
      for(let x=0;x<w;x++){
        const off = (y*w + x)*4;
        const a = d[off+3];
        if(a===0) continue;
        const hex = rgbToHex({r:d[off], g:d[off+1], b:d[off+2]});
        row += `<rect x="${x}" y="${y}" width="1" height="1" fill="${hex}"/>`;
      }
      if(row) svg += row + "\n";
    }
    svg += "</svg>";
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, "svg");
  });

  if(exportImageBtn){
    exportImageBtn.addEventListener("click", async ()=>{
      if(!ensureCanvasReady()) return;
      const fmt = imageExportFormat ? imageExportFormat.value : "jpg";
      const canvas = offscreen;
      try{
        if(fmt === "jpg"){
          canvas.toBlob((blob)=> blob && downloadBlob(blob, "jpg"), "image/jpeg", 0.92);
        } else if(fmt === "webp"){
          canvas.toBlob((blob)=> blob && downloadBlob(blob, "webp"), "image/webp", 0.92);
        } else if(fmt === "bmp"){
          downloadBlob(encodeBMPFromCanvas(canvas), "bmp");
        } else if(fmt === "gif"){
          const blob = await exportGIF(canvas);
          downloadBlob(blob, "gif");
        } else if(fmt === "apng"){
          const blob = exportAPNG(canvas);
          downloadBlob(blob, "apng");
        } else if(fmt === "tiff"){
          const blob = exportTIFF(canvas);
          downloadBlob(blob, "tiff");
        } else if(fmt === "ico"){
          const blob = await exportICO(canvas);
          downloadBlob(blob, "ico");
        } else if(fmt === "pdf"){
          exportPDF(canvas);
        } else {
          alert("出力形式に対応していません");
        }
      }catch(e){
        console.error(e);
        alert("保存に失敗しました: " + (e && e.message ? e.message : e));
      }
    });
  }

  // draw viewport
  function drawViewport(){
    const rect = dstWrapper.getBoundingClientRect();
    const vw = Math.max(1, rect.width), vh = Math.max(1, rect.height);
    const dpr = window.devicePixelRatio || 1;
    dstC.width = Math.round(vw * dpr); 
    dstC.height = Math.round(vh * dpr);
    const ctx = dstC.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,vw,vh);

    if(!offscreen || !lastRecoloredImage) return;

    const imgW = offscreen.width, imgH = offscreen.height;
    const sw = Math.max(1, imgW / camera.zoom);
    const sh = Math.max(1, imgH / camera.zoom);
    let sx = camera.centerX - sw/2, sy = camera.centerY - sh/2;
    sx = Math.max(0, Math.min(imgW - sw, sx)); 
    sy = Math.max(0, Math.min(imgH - sh, sy));

    const scaleX = vw / sw, scaleY = vh / sh;
    const scaleDest = Math.min(scaleX, scaleY);
    const destW = sw * scaleDest, destH = sh * scaleDest;
    const destX = (vw - destW) / 2, destY = (vh - destH) / 2;

    ctx.imageSmoothingEnabled = false;
    
    if(highlightedColorIndex >= 0 && highlightedColorIndex < currentHexList.length){
      const highlightedHex = currentHexList[highlightedColorIndex];
      const highlightedRgb = hexToRgbObj(highlightedHex);
      
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = lastRecoloredImage.width;
      maskCanvas.height = lastRecoloredImage.height;
      const maskCtx = maskCanvas.getContext("2d");
      const maskImageData = maskCtx.createImageData(lastRecoloredImage.width, lastRecoloredImage.height);
      const maskData = maskImageData.data;
      const imgData = lastRecoloredImage.data;
      
      for(let i = 0; i < imgData.length; i += 4){
        if(Math.abs(imgData[i] - highlightedRgb.r) <= 2 &&
           Math.abs(imgData[i+1] - highlightedRgb.g) <= 2 &&
           Math.abs(imgData[i+2] - highlightedRgb.b) <= 2){
          maskData[i] = imgData[i];
          maskData[i+1] = imgData[i+1];
          maskData[i+2] = imgData[i+2];
          maskData[i+3] = 255;
        } else {
          maskData[i] = maskData[i+1] = maskData[i+2] = 128;
          maskData[i+3] = 80;
        }
      }
      maskCtx.putImageData(maskImageData, 0, 0);
      ctx.drawImage(maskCanvas, sx, sy, sw, sh, destX, destY, destW, destH);
    } else {
      ctx.drawImage(offscreen, sx, sy, sw, sh, destX, destY, destW, destH);
    }

    if(borderCheckbox.checked){
      drawBordersViewport(ctx, lastRecoloredImage, sx, sy, sw, sh, destX, destY, destW, destH);
    }

    lastViewport = { sx, sy, sw, sh, destX, destY, destW, destH, vw, vh };
  }

  function drawBordersViewport(ctx,imgData,sx,sy,sw,sh,destX,destY,destW,destH){
    const pixelSize = destW / sw;
    const startX = Math.max(0, Math.floor(sx));
    const endX = Math.min(imgData.width, Math.ceil(sx + sw));
    const startY = Math.max(0, Math.floor(sy));
    const endY = Math.min(imgData.height, Math.ceil(sy + sh));
    
    if(pixelSize >= 6){
      const baseWidth = Math.max(0.5, 1 / pixelSize);
      ctx.save();
      ctx.lineWidth = baseWidth * 2.2; 
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      for(let x=startX;x<=endX;x++){ 
        const screenX = destX + ((x - sx) / sw) * destW + 0.5; 
        ctx.beginPath(); 
        ctx.moveTo(screenX,destY); 
        ctx.lineTo(screenX,destY+destH); 
        ctx.stroke(); 
      }
      for(let y=startY;y<=endY;y++){ 
        const screenY = destY + ((y - sy) / sh) * destH + 0.5; 
        ctx.beginPath(); 
        ctx.moveTo(destX,screenY); 
        ctx.lineTo(destX+destW,screenY); 
        ctx.stroke(); 
      }
      ctx.lineWidth = baseWidth * 0.9; 
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      for(let x=startX;x<=endX;x++){ 
        const screenX = destX + ((x - sx) / sw) * destW + 0.5; 
        ctx.beginPath(); 
        ctx.moveTo(screenX,destY); 
        ctx.lineTo(screenX,destY+destH); 
        ctx.stroke(); 
      }
      for(let y=startY;y<=endY;y++){ 
        const screenY = destY + ((y - sy) / sh) * destH + 0.5; 
        ctx.beginPath(); 
        ctx.moveTo(destX,screenY); 
        ctx.lineTo(destX+destW,screenY); 
        ctx.stroke(); 
      }
      ctx.restore();
    } else {
      ctx.save(); 
      ctx.lineWidth = Math.max(0.35, 0.9 * (pixelSize/6)); 
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      for(let y=startY;y<endY;y++){ 
        for(let x=startX;x<endX;x++){
          if(x+1<imgData.width && !pixelEquals(imgData,x,y,x+1,y)){ 
            const sxpos = destX + ((x+1 - sx)/sw)*destW; 
            const y0 = destY + ((y - sy)/sh)*destH; 
            const y1 = destY + ((y+1 - sy)/sh)*destH; 
            ctx.beginPath(); 
            ctx.moveTo(sxpos,y0); 
            ctx.lineTo(sxpos,y1); 
            ctx.stroke(); 
          }
          if(y+1<imgData.height && !pixelEquals(imgData,x,y,x,y+1)){ 
            const sypos = destY + ((y+1 - sy)/sh)*destH; 
            const x0 = destX + ((x - sx)/sw)*destW; 
            const x1 = destX + ((x+1 - sx)/sw)*destW; 
            ctx.beginPath(); 
            ctx.moveTo(x0,sypos); 
            ctx.lineTo(x1,sypos); 
            ctx.stroke(); 
          }
        } 
      }
      ctx.restore();
      ctx.save(); 
      ctx.lineWidth=Math.max(0.18,0.6*(pixelSize/6)); 
      ctx.strokeStyle="rgba(0,0,0,0.45)";
      for(let y=startY;y<endY;y++){ 
        for(let x=startX;x<endX;x++){
          if(x+1<imgData.width && !pixelEquals(imgData,x,y,x+1,y)){ 
            const sxpos = destX + ((x+1 - sx)/sw)*destW; 
            const y0 = destY + ((y - sy)/sh)*destH; 
            const y1 = destY + ((y+1 - sy)/sh)*destH; 
            ctx.beginPath(); 
            ctx.moveTo(sxpos,y0); 
            ctx.lineTo(sxpos,y1); 
            ctx.stroke(); 
          }
          if(y+1<imgData.height && !pixelEquals(imgData,x,y,x,y+1)){ 
            const sypos = destY + ((y+1 - sy)/sh)*destH; 
            const x0 = destX + ((x - sx)/sw)*destW; 
            const x1 = destX + ((x+1 - sx)/sw)*destW; 
            ctx.beginPath(); 
            ctx.moveTo(x0,sypos); 
            ctx.lineTo(x1,sypos); 
            ctx.stroke(); 
          }
        } 
      }
      ctx.restore();
    }
  }

  function pixelEquals(imgData,x1,y1,x2,y2){
    if(x2<0||y2<0||x2>=imgData.width||y2>=imgData.height) return false;
    const off1 = (y1*imgData.width + x1)*4;
    const off2 = (y2*imgData.width + x2)*4;
    return imgData.data[off1]===imgData.data[off2] && 
           imgData.data[off1+1]===imgData.data[off2+1] && 
           imgData.data[off1+2]===imgData.data[off2+2] && 
           imgData.data[off1+3]===imgData.data[off2+3];
  }

  // tooltip on hover
  dstWrapper.addEventListener("mousemove",(ev)=>{
    if(!lastRecoloredImage || !showNumber.checked || !lastViewport){ 
      tooltip.style.display="none"; 
      return; 
    }
    const rect = dstWrapper.getBoundingClientRect();
    const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
    const { sx, sy, sw, sh, destX, destY, destW, destH } = lastViewport;
    if(mx<destX||my<destY||mx>destX+destW||my>destY+destH){ 
      tooltip.style.display="none"; 
      return; 
    }
    const imgX = sx + ((mx - destX)/destW)*sw;
    const imgY = sy + ((my - destY)/destH)*sh;
    const ix = Math.floor(imgX), iy = Math.floor(imgY);
    if(ix<0||iy<0||ix>=lastRecoloredImage.width||iy>=lastRecoloredImage.height){ 
      tooltip.style.display="none"; 
      return; 
    }
    const off = (iy*lastRecoloredImage.width + ix)*4;
    const r=lastRecoloredImage.data[off], 
          g=lastRecoloredImage.data[off+1], 
          b=lastRecoloredImage.data[off+2], 
          a=lastRecoloredImage.data[off+3];
    if(a===0){ 
      tooltip.innerHTML = `透明 (${ix},${iy})`; 
    } else {
      const hex = rgbToHex({r,g,b});
      let palIndex=-1;
      for(let k=0;k<currentHexList.length;k++){ 
        if(currentHexList[k]===hex){ palIndex=k; break; } 
      }
      let labelText="(パレット外)";
      if(palIndex>=0){ 
        const nm=(paletteNames[palIndex]||"").trim(); 
        labelText = nm ? nm : `色${palIndex+1}`; 
      } else if(hexToName[hex]) labelText = hexToName[hex];
      tooltip.innerHTML = `${labelText} ${hex} (${ix},${iy})`;
    }
    tooltip.style.display="block";
    let left = ev.clientX + 12, top = ev.clientY + 12;
    if(left + 260 > window.innerWidth) left = ev.clientX - 260 - 12;
    tooltip.style.left = left + "px"; 
    tooltip.style.top = top + "px";
  });
  
  dstWrapper.addEventListener("mouseleave", ()=> tooltip.style.display="none");

  // wheel zoom
  dstWrapper.addEventListener("wheel",(ev)=>{
    if(!offscreen) return;
    ev.preventDefault();
    const before = clientToImageCoord(ev.clientX, ev.clientY);
    const imgXBefore = before ? before.imgX : camera.centerX;
    const imgYBefore = before ? before.imgY : camera.centerY;
    const factor = ev.deltaY < 0 ? wheelFactor : 1/wheelFactor;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom * factor));
    const imgW = offscreen.width, imgH = offscreen.height;
    const swNew = Math.max(1, imgW / newZoom);
    const shNew = Math.max(1, imgH / newZoom);
    const rect = dstWrapper.getBoundingClientRect();
    const vw = Math.max(1, rect.width), vh = Math.max(1, rect.height);
    const scaleDest = Math.min(vw / swNew, vh / shNew);
    const destW = swNew * scaleDest; const destH = shNew * scaleDest;
    const destX = (vw - destW) / 2; const destY = (vh - destH) / 2;
    const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
    const ux = destW > 0 ? (mx - destX) / destW : 0.5;
    const uy = destH > 0 ? (my - destY) / destH : 0.5;
    const uxClamped = Math.max(0, Math.min(1, ux)), uyClamped = Math.max(0, Math.min(1, uy));
    const sxNew = imgXBefore - uxClamped * swNew;
    const syNew = imgYBefore - uyClamped * shNew;
    camera.zoom = newZoom;
    camera.centerX = sxNew + swNew/2;
    camera.centerY = syNew + shNew/2;
    camera.centerX = Math.max(swNew/2, Math.min(imgW - swNew/2, camera.centerX));
    camera.centerY = Math.max(shNew/2, Math.min(imgH - shNew/2, camera.centerY));
    drawViewport();
  }, { passive:false });

  srcWrapper.addEventListener("wheel", (ev)=>{
    if(!srcC || !srcC.width) return;
    ev.preventDefault();
    const rect = srcWrapper.getBoundingClientRect();
    const localX = ev.clientX - rect.left;
    const localY = ev.clientY - rect.top;
    const imageX = (localX - srcPanX) / srcZoom;
    const imageY = (localY - srcPanY) / srcZoom;
    const factor = ev.deltaY < 0 ? wheelFactor : 1 / wheelFactor;
    srcZoom = Math.max(getSrcMinZoom(), Math.min(SRC_MAX_ZOOM, srcZoom * factor));
    srcPanX = localX - imageX * srcZoom;
    srcPanY = localY - imageY * srcZoom;
    applySrcZoom();
    scheduleHistory();
  }, { passive:false });

  function clientToImageCoord(clientX, clientY){
    if(!lastViewport) return null;
    const rect = dstWrapper.getBoundingClientRect();
    const mx = clientX - rect.left, my = clientY - rect.top;
    const { sx, sy, sw, sh, destX, destY, destW, destH } = lastViewport;
    if(mx < destX || my < destY || mx > destX + destW || my > destY + destH) return null;
    const imgX = sx + ((mx - destX) / destW) * sw;
    const imgY = sy + ((my - destY) / destH) * sh;
    return { imgX, imgY, sx, sy, sw, sh, destX, destY, destW, destH };
  }

  // pan
  let isPanning=false, panStart=null, spaceDown=false;
  let isSrcPanning = false, srcPanStart = null;
  window.addEventListener("keydown",(ev)=>{ 
    if(ev.code==="Space"){ 
      spaceDown=true; 
      ev.preventDefault && ev.preventDefault(); 
    }
  });
  window.addEventListener("keyup",(ev)=>{ 
    if(ev.code==="Space"){ spaceDown=false; }
  });
  
  dstWrapper.addEventListener("mousedown",(ev)=>{
    if(ev.button===0 && (spaceDown || ev.ctrlKey || ev.metaKey) && offscreen){
      ev.preventDefault();
      isPanning=true;
      panStart = { 
        clientX:ev.clientX, 
        clientY:ev.clientY, 
        centerX:camera.centerX, 
        centerY:camera.centerY, 
        viewport:lastViewport ? Object.assign({}, lastViewport) : null 
      };
      dstWrapper.style.cursor="grabbing";
    }
  });

  srcWrapper.addEventListener("mousedown", (ev)=>{
    if(ev.button===0 && (spaceDown || ev.ctrlKey || ev.metaKey) && srcC && srcC.width){
      ev.preventDefault();
      isSrcPanning = true;
      srcPanStart = {
        clientX: ev.clientX,
        clientY: ev.clientY,
        panX: srcPanX,
        panY: srcPanY
      };
      srcWrapper.style.cursor = "grabbing";
    }
  });
  
  window.addEventListener("mousemove",(ev)=>{
    if(!isPanning || !offscreen || !panStart) return;
    ev.preventDefault();
    if(!panStart.viewport) return;
    const { sw, destW, sh, destH } = panStart.viewport;
    const dx = ev.clientX - panStart.clientX, dy = ev.clientY - panStart.clientY;
    const moveX = -dx * (sw / destW), moveY = -dy * (sh / destH);
    camera.centerX = panStart.centerX + moveX; 
    camera.centerY = panStart.centerY + moveY;
    const imgW=offscreen.width, imgH=offscreen.height;
    const swNow = Math.max(1, imgW/camera.zoom), shNow=Math.max(1,imgH/camera.zoom);
    camera.centerX = Math.max(swNow/2, Math.min(imgW - swNow/2, camera.centerX));
    camera.centerY = Math.max(shNow/2, Math.min(imgH - shNow/2, camera.centerY));
    drawViewport();
  });

  window.addEventListener("mousemove", (ev)=>{
    if(!isSrcPanning || !srcPanStart) return;
    ev.preventDefault();
    const dx = ev.clientX - srcPanStart.clientX;
    const dy = ev.clientY - srcPanStart.clientY;
    srcPanX = srcPanStart.panX + dx;
    srcPanY = srcPanStart.panY + dy;
    applySrcZoom();
  });
  
  window.addEventListener("mouseup",(ev)=>{ 
    if(isPanning){ 
      isPanning=false; 
      panStart=null; 
      dstWrapper.style.cursor="default"; 
    } 
  });

  window.addEventListener("mouseup", ()=>{
    if(isSrcPanning){
      isSrcPanning = false;
      srcPanStart = null;
      srcWrapper.style.cursor = "default";
      scheduleHistory();
    }
  });

  // keyboard shortcuts
  window.addEventListener("keydown",(ev)=>{
    if(ev.key === "+" || ev.key === "="){ 
      if(offscreen){ 
        camera.zoom = Math.min(MAX_ZOOM, camera.zoom * 1.2); 
        drawViewport(); 
      }
    } else if(ev.key === "-"){ 
      if(offscreen){ 
        camera.zoom = Math.max(MIN_ZOOM, camera.zoom / 1.2); 
        drawViewport(); 
      } 
    }
  });

  // pointer/touch
  const pointers = new Map();
  let initialPinch = null;
  
  dstWrapper.addEventListener("pointerdown",(ev)=>{
    dstWrapper.setPointerCapture(ev.pointerId);
    pointers.set(ev.pointerId, ev);
    if(pointers.size === 2){
      const pts = Array.from(pointers.values());
      initialPinch = { 
        a: pts[0], 
        b: pts[1], 
        zoom: camera.zoom, 
        centerX: camera.centerX, 
        centerY: camera.centerY 
      };
    }
  });
  
  dstWrapper.addEventListener("pointermove",(ev)=>{
    if(!pointers.has(ev.pointerId)) return;
    pointers.set(ev.pointerId, ev);
    if(pointers.size === 2 && initialPinch && offscreen){
      const pts = Array.from(pointers.values());
      const p0 = pts[0], p1 = pts[1];
      function dist(a,b){ 
        const dx=a.clientX-b.clientX, dy=a.clientY-b.clientY; 
        return Math.hypot(dx,dy); 
      }
      const initialDist = dist(initialPinch.a, initialPinch.b);
      const nowDist = dist(p0,p1);
      const factor = nowDist / Math.max(1, initialDist);
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialPinch.zoom * factor));
      const cx = (p0.clientX + p1.clientX)/2, cy = (p0.clientY + p1.clientY)/2;
      const before = clientToImageCoord(cx, cy);
      const imgXBefore = before ? before.imgX : camera.centerX;
      const imgYBefore = before ? before.imgY : camera.centerY;
      const imgW = offscreen.width, imgH = offscreen.height;
      const swNew = Math.max(1, imgW / newZoom);
      const shNew = Math.max(1, imgH / newZoom);
      const rect = dstWrapper.getBoundingClientRect();
      const vw = Math.max(1, rect.width), vh = Math.max(1, rect.height);
      const scaleDest = Math.min(vw / swNew, vh / shNew);
      const destW = swNew * scaleDest; const destH = shNew * scaleDest;
      const destX = (vw - destW)/2; const destY = (vh - destH)/2;
      const mx = cx - rect.left, my = cy - rect.top;
      const ux = destW > 0 ? (mx - destX) / destW : 0.5; 
      const uy = destH > 0 ? (my - destY) / destH : 0.5;
      const uxClamped = Math.max(0, Math.min(1, ux)), uyClamped = Math.max(0, Math.min(1, uy));
      const sxNew = imgXBefore - uxClamped * swNew;
      const syNew = imgYBefore - uyClamped * shNew;
      camera.zoom = newZoom;
      camera.centerX = sxNew + swNew/2;
      camera.centerY = syNew + shNew/2;
      camera.centerX = Math.max(swNew/2, Math.min(imgW - swNew/2, camera.centerX));
      camera.centerY = Math.max(shNew/2, Math.min(imgH - shNew/2, camera.centerY));
      drawViewport();
    }
  });
  
  dstWrapper.addEventListener("pointerup",(ev)=>{ 
    pointers.delete(ev.pointerId); 
    initialPinch = null; 
    dstWrapper.releasePointerCapture(ev.pointerId); 
  });
  
  dstWrapper.addEventListener("pointercancel",(ev)=>{ 
    pointers.delete(ev.pointerId); 
    initialPinch = null; 
  });

  // double click reset
  dstWrapper.addEventListener("dblclick", ()=>{ 
    if(offscreen){ 
      camera.zoom=1; 
      camera.centerX = offscreen.width/2; 
      camera.centerY = offscreen.height/2; 
      drawViewport(); 
    } 
  });

  // download PNG
  dlBtn.addEventListener("click", ()=>{
    if(!offscreen) return;
    const c = document.createElement("canvas"); 
    c.width = offscreen.width; 
    c.height = offscreen.height;
    const ctx = c.getContext("2d"); 
    ctx.imageSmoothingEnabled=false; 
    ctx.drawImage(offscreen,0,0);
    c.toBlob(blob=>{ 
      if(blob) downloadBlob(blob, "png");
    }, "image/png");
  });

  function resetView(){ 
    lastRecoloredImage = null; 
    offscreen = null; 
    lastUsedPaletteHexList = null;
    camera = { zoom:1, centerX:0, centerY:0 }; 
    dstC.width=dstC.height=0; 
    lastViewport=null; 
    tooltip.style.display='none'; 
    dlBtn.disabled=true; 
    if(exportImageBtn) exportImageBtn.disabled = true;
    updateUsedColorCount();
    showIdle(); 
  }
  
  new ResizeObserver(()=>{ 
    adjustSrcCssSize(); 
    drawViewport(); 
  }).observe(srcWrapper);
  
  new ResizeObserver(()=>{ drawViewport(); }).observe(dstWrapper);
  window.addEventListener("resize", ()=>{ adjustSrcCssSize(); drawViewport(); });

  // Filter sliders
  let filterUpdateTimeout = null;

  function updateFilterSliderDisplay() {
    document.getElementById("contrastValue").textContent = filterState.contrast + "%";
    document.getElementById("brightnessValue").textContent = filterState.brightness + "%";
    document.getElementById("hueValue").textContent = filterState.hue + "°";
    document.getElementById("saturationValue").textContent = filterState.saturation + "%";
    document.getElementById("luminanceValue").textContent = filterState.luminance + "%";
    if(contrastNumber) contrastNumber.value = filterState.contrast;
    if(brightnessNumber) brightnessNumber.value = filterState.brightness;
    if(hueNumber) hueNumber.value = filterState.hue;
    if(saturationNumber) saturationNumber.value = filterState.saturation;
    if(luminanceNumber) luminanceNumber.value = filterState.luminance;
  }

  function triggerFilteredReprocess() {
    if (filterUpdateTimeout) clearTimeout(filterUpdateTimeout);
    filterUpdateTimeout = setTimeout(() => {
      if (!srcImageData) return;
      const filtered = applyFilters(srcImageData);
      if (!filtered) return;
      const colorCount = currentAutoReduceCount();
      updatePaletteFromSourceImage(colorCount);
      doProcess();
    }, 200);
  }

  document.getElementById("contrastSlider").addEventListener("input", (ev) => {
    filterState.contrast = Math.max(0, Math.min(400, parseInt(ev.target.value, 10)));
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
  });

  if(contrastNumber){
    contrastNumber.addEventListener('input', (e)=>{
      let v = parseInt(e.target.value,10);
      if(isNaN(v)) v = 100;
      v = Math.max(0, Math.min(400, v));
      filterState.contrast = v;
      document.getElementById("contrastSlider").value = v;
      updateFilterSliderDisplay();
      triggerFilteredReprocess();
    });
  }

  document.getElementById("brightnessSlider").addEventListener("input", (ev) => {
    filterState.brightness = Math.max(0, Math.min(400, parseInt(ev.target.value, 10)));
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
  });

  if(brightnessNumber){
    brightnessNumber.addEventListener('input', (e)=>{
      let v = parseInt(e.target.value,10);
      if(isNaN(v)) v = 100;
      v = Math.max(0, Math.min(400, v));
      filterState.brightness = v;
      document.getElementById("brightnessSlider").value = v;
      updateFilterSliderDisplay();
      triggerFilteredReprocess();
    });
  }

  document.getElementById("hueSlider").addEventListener("input", (ev) => {
    filterState.hue = Math.max(-180, Math.min(180, parseInt(ev.target.value, 10)));
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
  });

  if(hueNumber){
    hueNumber.addEventListener('input', (e)=>{
      let v = parseInt(e.target.value,10);
      if(isNaN(v)) v = 0;
      v = Math.max(-180, Math.min(180, v));
      filterState.hue = v;
      document.getElementById("hueSlider").value = v;
      updateFilterSliderDisplay();
      triggerFilteredReprocess();
    });
  }

  document.getElementById("saturationSlider").addEventListener("input", (ev) => {
    filterState.saturation = Math.max(0, Math.min(400, parseInt(ev.target.value, 10)));
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
  });

  if(saturationNumber){
    saturationNumber.addEventListener('input', (e)=>{
      let v = parseInt(e.target.value,10);
      if(isNaN(v)) v = 100;
      v = Math.max(0, Math.min(400, v));
      filterState.saturation = v;
      document.getElementById("saturationSlider").value = v;
      updateFilterSliderDisplay();
      triggerFilteredReprocess();
    });
  }

  document.getElementById("luminanceSlider").addEventListener("input", (ev) => {
    filterState.luminance = Math.max(0, Math.min(400, parseInt(ev.target.value, 10)));
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
  });

  if(luminanceNumber){
    luminanceNumber.addEventListener('input', (e)=>{
      let v = parseInt(e.target.value,10);
      if(isNaN(v)) v = 100;
      v = Math.max(0, Math.min(400, v));
      filterState.luminance = v;
      document.getElementById("luminanceSlider").value = v;
      updateFilterSliderDisplay();
      triggerFilteredReprocess();
    });
  }

  // Reset buttons
  document.getElementById("resetDotScaleBtn").addEventListener("click", () => {
    dotScale.value = 2500;
    onDotScaleChange();
    scheduleHistory();
  });

  if(dotScaleNumber){
    dotScaleNumber.addEventListener('input', (e)=>{
      let p = parseInt(e.target.value,10);
      if(isNaN(p)) p = 100;
      p = Math.max(4, Math.min(200, p));
      const v = Math.round(p * 25);
      dotScale.value = v;
      onDotScaleChange();
    });
  }

  if(edgeStrengthSlider){
    edgeStrengthSlider.addEventListener('input', ()=>{
      const v = parseInt(edgeStrengthSlider.value,10) || 100;
      if(edgeStrengthValue) edgeStrengthValue.textContent = v + "%";
      if(edgeStrengthNumber) edgeStrengthNumber.value = v;
      if(srcImageData) requestProcess(120);
    });
  }
  
  if(edgeStrengthNumber){
    edgeStrengthNumber.addEventListener('input', (e)=>{
      let v = parseInt(e.target.value,10);
      if(isNaN(v)) v = 100;
      v = Math.max(0, Math.min(400, v));
      if(edgeStrengthSlider) edgeStrengthSlider.value = v;
      if(edgeStrengthValue) edgeStrengthValue.textContent = v + "%";
      if(srcImageData) requestProcess(120);
    });
  }
  
  const resetEdgeBtn = document.getElementById('resetEdgeStrengthBtn');
  if(resetEdgeBtn){ 
    resetEdgeBtn.addEventListener('click', ()=>{ 
      if(edgeStrengthSlider) edgeStrengthSlider.value = 100; 
      if(edgeStrengthNumber) edgeStrengthNumber.value = 100; 
      if(edgeStrengthValue) edgeStrengthValue.textContent = '100%'; 
      if(srcImageData) doProcess(); 
      scheduleHistory();
    }); 
  }

  document.getElementById("resetContrastBtn").addEventListener("click", () => {
    filterState.contrast = 100;
    document.getElementById("contrastSlider").value = 100;
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
    scheduleHistory();
  });

  document.getElementById("resetBrightnessBtn").addEventListener("click", () => {
    filterState.brightness = 100;
    document.getElementById("brightnessSlider").value = 100;
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
    scheduleHistory();
  });

  document.getElementById("resetHueBtn").addEventListener("click", () => {
    filterState.hue = 0;
    document.getElementById("hueSlider").value = 0;
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
    scheduleHistory();
  });

  document.getElementById("resetSaturationBtn").addEventListener("click", () => {
    filterState.saturation = 100;
    document.getElementById("saturationSlider").value = 100;
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
    scheduleHistory();
  });

  document.getElementById("resetLuminanceBtn").addEventListener("click", () => {
    filterState.luminance = 100;
    document.getElementById("luminanceSlider").value = 100;
    updateFilterSliderDisplay();
    triggerFilteredReprocess();
    scheduleHistory();
  });

  document.getElementById("resetAllFiltersBtn").addEventListener("click", () => {
    dotScale.value = 2500;
    onDotScaleChange();

    filterState.contrast = 100;
    filterState.brightness = 100;
    filterState.hue = 0;
    filterState.saturation = 100;
    filterState.luminance = 100;

    document.getElementById("contrastSlider").value = 100;
    document.getElementById("brightnessSlider").value = 100;
    document.getElementById("hueSlider").value = 0;
    document.getElementById("saturationSlider").value = 100;
    document.getElementById("luminanceSlider").value = 100;

    updateFilterSliderDisplay();
    triggerFilteredReprocess();
    scheduleHistory();
  });

  // Dither
  function updateDitherStrengthDisplay() {
    if(ditherStrengthValue) ditherStrengthValue.textContent = (ditherStrengthSlider ? ditherStrengthSlider.value : 100) + '%';
    if(ditherStrengthNumber && ditherStrengthSlider) ditherStrengthNumber.value = ditherStrengthSlider.value;
  }
  
  if(ditherPatternSelect){
    ditherPatternSelect.addEventListener('change', ()=>{
      if(srcImageData && ditherCheckbox.checked) requestProcess(80);
    });
  }

  if(ditherCheckbox){
    ditherCheckbox.addEventListener('change', ()=>{
      if(srcImageData) requestProcess(80);
    });
  }

  if(paletteOnlyCheckbox){
    paletteOnlyCheckbox.addEventListener('change', ()=>{
      if(srcImageData) requestProcess(80);
    });
  }
  
  if(ditherStrengthSlider){
    ditherStrengthSlider.addEventListener('input', ()=>{
      updateDitherStrengthDisplay();
      if(srcImageData && ditherCheckbox.checked) requestProcess(80);
    });
  }
  
  if(ditherStrengthNumber){
    ditherStrengthNumber.addEventListener('input', (e)=>{
      let v = parseInt(e.target.value, 10);
      if(isNaN(v)) v = 100;
      v = Math.max(0, Math.min(200, v));
      if(ditherStrengthSlider) ditherStrengthSlider.value = v;
      updateDitherStrengthDisplay();
      if(srcImageData && ditherCheckbox.checked) requestProcess(80);
    });
  }
  
  const resetDitherStrengthBtn = document.getElementById('resetDitherStrengthBtn');
  if(resetDitherStrengthBtn){
    resetDitherStrengthBtn.addEventListener('click', ()=>{
      if(ditherStrengthSlider) ditherStrengthSlider.value = 100;
      if(ditherStrengthNumber) ditherStrengthNumber.value = 100;
      updateDitherStrengthDisplay();
      if(srcImageData && ditherCheckbox.checked) requestProcess(80);
      scheduleHistory();
    });
  }
  
  updateDitherStrengthDisplay();
  if(edgeStrengthValue) edgeStrengthValue.textContent = (edgeStrengthSlider ? edgeStrengthSlider.value : 100) + "%";
  if(edgeStrengthNumber && edgeStrengthSlider) edgeStrengthNumber.value = edgeStrengthSlider.value;

  // help buttons
  helpBtn.addEventListener("click", ()=> {
    alert("【ドット絵コンバーター 使い方】\n\n【基本操作】\n① 「ファイルを選択」ボタンから画像を読み込みます\n② 出力設定で出力サイズを指定（縦横比保持チェックあり）\n③ 「ドット粗さ」スライダーでドットサイズを調整\n④ 左側のパレットから色を選ぶ（「自動減色」で最適パレットを抽出可能）\n⑤ 「変換する」ボタンで変換実行\n\n【機能説明】\n・自動減色：画像からゲーム向けの最適パレットを自動抽出（色数指定可能）\n・パレット色クリック：その色がどこで使われているかをハイライト表示\n・ボーダー表示：ドット境界を白線で表示（チェックボンで切替）\n・dither：誤差拡散ディザリング（色数が少ないときに使用推奨）\n\n【出力形式】\n・PNG：透明度対応、背景保持\n・SVG：ベクトル形式、拡大しても劣化なし");
  });
  
  kbdBtn.addEventListener("click", ()=> {
    alert("キーボード操作：\nQ/W/E/R/T：タブ切り替え\nSpace を押しながらドラッグ：パン\nCtrl / ⌘ を押しながらドラッグ：パン\n+ / =：ズームイン\n-：ズームアウト\nダブルクリック：ビューをリセット（1:1に戻る）\n\nモバイル：ピンチでズーム、一本指でドラッグしてパン可能です。");
  });

  // Toggle source image
  const toggleSrcBtn = document.getElementById('toggleSrcBtn');
  const srcPanel = document.getElementById('srcPanel');
  const dstPanel = document.getElementById('dstPanel');
  let srcVisible = true;

  function updateSrcVisibility() {
    if (srcVisible) {
      srcPanel.style.display = '';
      dstPanel.style.flex = '1';
      toggleSrcBtn.textContent = '元画像を非表示';
    } else {
      srcPanel.style.display = 'none';
      dstPanel.style.flex = '2';
      toggleSrcBtn.textContent = '元画像を表示';
    }
    setTimeout(() => drawViewport(), 50);
  }

  toggleSrcBtn.addEventListener('click', () => {
    srcVisible = !srcVisible;
    updateSrcVisibility();
    scheduleHistory();
  });

  if(borderCheckbox){
    borderCheckbox.addEventListener('change', ()=>{
      drawViewport();
    });
  }

  // Tab navigation
  const tabBtns = document.querySelectorAll('.tabBtn');
  const sections = document.querySelectorAll('.left details[data-section]');
  
  function switchTab(tabName) {
    tabBtns.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    sections.forEach(section => {
      if (section.dataset.section === tabName) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  }
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  window.addEventListener("keydown", (ev)=>{
    if(ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const tag = ev.target && ev.target.tagName ? ev.target.tagName.toUpperCase() : "";
    if(tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (ev.target && ev.target.isContentEditable)) return;
    const key = (ev.key || "").toLowerCase();
    const matched = Array.from(tabBtns).find(btn => (btn.dataset.key || "").toLowerCase() === key);
    if(!matched) return;
    ev.preventDefault();
    switchTab(matched.dataset.tab);
  });
  
  switchTab('img');

  if(undoBtn) undoBtn.addEventListener("click", undo);
  if(redoBtn) redoBtn.addEventListener("click", redo);

  window.addEventListener("keydown", (ev)=>{
    const isMac = navigator.platform && /Mac/i.test(navigator.platform);
    const mod = isMac ? ev.metaKey : ev.ctrlKey;
    if(mod && ev.key.toLowerCase() === "z"){
      ev.preventDefault();
      if(ev.shiftKey){
        redo();
      } else {
        undo();
      }
    } else if(mod && ev.key.toLowerCase() === "y"){
      ev.preventDefault();
      redo();
    }
  });

  const historyTargets = [
    paletteInput, outW, outH, dotScale, dotScaleNumber,
    edgeStrengthSlider, edgeStrengthNumber, ditherCheckbox, paletteOnlyCheckbox,
    ditherPatternSelect, ditherStrengthSlider, ditherStrengthNumber,
    autoReduceColorCount, convertPreset, reduceMethodSelect, useLabInput,
    keepAlphaInput, showNumber, borderCheckbox,
    seedInputEl, document.getElementById("contrastSlider"),
    document.getElementById("brightnessSlider"), document.getElementById("hueSlider"),
    document.getElementById("saturationSlider"), document.getElementById("luminanceSlider")
  ].filter(Boolean);

  historyTargets.forEach(el=>{
    el.addEventListener("input", scheduleHistory);
    el.addEventListener("change", scheduleHistory);
  });

  pushHistory();
  updateHistoryButtons();

  // init
  dlBtn.disabled = true;
  showIdle();
  console.log("初期化完了（完全版）");
});
