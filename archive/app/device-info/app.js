/**
 * Device & Network Inspector - Main JavaScript Application
 * Halcyon Shared Components Integrated
 */

document.addEventListener('DOMContentLoaded', () => {
  const inspectorData = {
    network: {},
    device: {},
    display: {},
    battery: {},
    system: {}
  };

  /* ==========================================================================
     1. UI要素の参照
     ========================================================================== */
  const elements = {
    // ネットワーク
    ipAddress: document.getElementById('ip-address'),
    netIsp: document.getElementById('net-isp'),
    netLocation: document.getElementById('net-location'),
    netEffectiveType: document.getElementById('net-effective-type'),
    netDownlink: document.getElementById('net-downlink'),
    netRtt: document.getElementById('net-rtt'),
    netSaveData: document.getElementById('net-save-data'),
    netOnlineStatus: document.getElementById('net-online-status'),
    
    // スピードテスト
    btnStartSpeedtest: document.getElementById('btn-start-speedtest'),
    speedPing: document.getElementById('speed-ping'),
    speedDownload: document.getElementById('speed-download'),
    speedProgressBar: document.getElementById('speedtest-progress-bar'),
    speedProgressFill: document.getElementById('speedtest-progress-fill'),

    // デバイス
    devOs: document.getElementById('dev-os'),
    devBrowser: document.getElementById('dev-browser'),
    devCores: document.getElementById('dev-cores'),
    devMemory: document.getElementById('dev-memory'),
    devTouch: document.getElementById('dev-touch'),
    devUa: document.getElementById('dev-ua'),

    // ディスプレイ
    dispScreen: document.getElementById('disp-screen'),
    dispViewport: document.getElementById('disp-viewport'),
    dispDpr: document.getElementById('disp-dpr'),
    dispColorDepth: document.getElementById('disp-color-depth'),
    dispColorGamut: document.getElementById('disp-color-gamut'),
    dispTheme: document.getElementById('disp-theme'),

    // バッテリー
    batteryFill: document.getElementById('battery-fill'),
    batteryPercent: document.getElementById('battery-percent'),
    batteryChargingStatus: document.getElementById('battery-charging-status'),
    batteryChargeTime: document.getElementById('battery-charge-time'),
    batteryDischargeTime: document.getElementById('battery-discharge-time'),

    // システム
    sysLang: document.getElementById('sys-lang'),
    sysTimezone: document.getElementById('sys-timezone'),
    sysTime: document.getElementById('sys-time'),
    sysCookies: document.getElementById('sys-cookies'),

    // ボタン & アラート領域
    btnCopyAll: document.getElementById('btn-copy-all'),
    btnCopyIp: document.getElementById('btn-copy-ip'),
    btnRefresh: document.getElementById('btn-refresh'),
    alertContainer: document.getElementById('alert-container')
  };

  /* ==========================================================================
     2. 初期化処理
     ========================================================================== */
  function initApp() {
    fetchNetworkDetails();
    parseDeviceInfo();
    updateDisplayInfo();
    setupBatteryMonitoring();
    updateSystemInfo();
    setupEventListeners();
    startClock();
  }

  /* ==========================================================================
     3. ネットワーク情報の取得
     ========================================================================== */
  async function fetchNetworkDetails() {
    updateOnlineBadge();

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const effectiveType = conn.effectiveType ? conn.effectiveType.toUpperCase() : '不明';
      const downlink = conn.downlink !== undefined ? `${conn.downlink} Mbps` : '非対応';
      const rtt = conn.rtt !== undefined ? `${conn.rtt} ms` : '非対応';
      const saveData = conn.saveData ? 'ON (有効)' : 'OFF (無効)';

      if (elements.netEffectiveType) elements.netEffectiveType.textContent = effectiveType;
      if (elements.netDownlink) elements.netDownlink.textContent = downlink;
      if (elements.netRtt) elements.netRtt.textContent = rtt;
      if (elements.netSaveData) elements.netSaveData.textContent = saveData;

      inspectorData.network.effectiveType = effectiveType;
      inspectorData.network.downlink = downlink;
      inspectorData.network.rtt = rtt;
      inspectorData.network.saveData = saveData;
    }

    try {
      if (elements.ipAddress) elements.ipAddress.textContent = '取得中...';
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error('IP API Request failed');
      const data = await res.json();

      const ip = data.ip || '不明';
      const isp = data.org || data.asn || '不明';
      const location = (data.city && data.country_name) 
        ? `${data.city}, ${data.country_name} (${data.country_code})` 
        : (data.country_name || '不明');

      if (elements.ipAddress) elements.ipAddress.textContent = ip;
      if (elements.netIsp) elements.netIsp.textContent = isp;
      if (elements.netLocation) elements.netLocation.textContent = location;

      inspectorData.network.ip = ip;
      inspectorData.network.isp = isp;
      inspectorData.network.location = location;
    } catch (err) {
      try {
        const fallbackRes = await fetch('https://api.ipify.org?format=json');
        const fallbackData = await fallbackRes.json();
        const ip = fallbackData.ip || '取得失敗';
        
        if (elements.ipAddress) elements.ipAddress.textContent = ip;
        if (elements.netIsp) elements.netIsp.textContent = '取得できませんでした';
        if (elements.netLocation) elements.netLocation.textContent = '取得できませんでした';

        inspectorData.network.ip = ip;
      } catch (fallbackErr) {
        if (elements.ipAddress) elements.ipAddress.textContent = '接続エラー';
      }
    }
  }

  function updateOnlineBadge() {
    const isOnline = navigator.onLine;
    if (elements.netOnlineStatus) {
      if (isOnline) {
        elements.netOnlineStatus.textContent = 'オンライン';
        elements.netOnlineStatus.classList.remove('offline');
      } else {
        elements.netOnlineStatus.textContent = 'オフライン';
        elements.netOnlineStatus.classList.add('offline');
        showAlert('ネットワークが切断されています（オフライン状態）。', 'warning');
      }
    }
    inspectorData.network.isOnline = isOnline;
  }

  /* ==========================================================================
     4. デバイス & OS情報
     ========================================================================== */
  function parseDeviceInfo() {
    const ua = navigator.userAgent;
    if (elements.devUa) {
      elements.devUa.textContent = ua;
      elements.devUa.title = ua;
    }
    inspectorData.device.userAgent = ua;

    let os = '不明なOS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Linux')) os = 'Linux';
    if (elements.devOs) elements.devOs.textContent = os;
    inspectorData.device.os = os;

    let browser = '不明なブラウザ';
    if (ua.includes('Edg/')) {
      const match = ua.match(/Edg\/([\d.]+)/);
      browser = `Microsoft Edge ${match ? match[1] : ''}`;
    } else if (ua.includes('Chrome/')) {
      const match = ua.match(/Chrome\/([\d.]+)/);
      browser = `Google Chrome ${match ? match[1] : ''}`;
    } else if (ua.includes('Firefox/')) {
      const match = ua.match(/Firefox\/([\d.]+)/);
      browser = `Mozilla Firefox ${match ? match[1] : ''}`;
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      const match = ua.match(/Version\/([\d.]+)/);
      browser = `Apple Safari ${match ? match[1] : ''}`;
    }
    if (elements.devBrowser) elements.devBrowser.textContent = browser;
    inspectorData.device.browser = browser;

    const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} スレッド / コア` : '非公開 / 非対応';
    if (elements.devCores) elements.devCores.textContent = cores;

    const memory = navigator.deviceMemory ? `約 ${navigator.deviceMemory} GB` : '非公開 / 非対応';
    if (elements.devMemory) elements.devMemory.textContent = memory;

    const maxTouch = navigator.maxTouchPoints || 0;
    const touchText = maxTouch > 0 ? `対応 (最大 ${maxTouch} 点検出)` : '非対応 (マウス / キーボード)';
    if (elements.devTouch) elements.devTouch.textContent = touchText;
  }

  /* ==========================================================================
     5. ディスプレイ情報
     ========================================================================== */
  function updateDisplayInfo() {
    const screenRes = `${screen.width} × ${screen.height} px`;
    const viewportRes = `${window.innerWidth} × ${window.innerHeight} px`;
    const dpr = `${window.devicePixelRatio || 1}x`;
    const colorDepth = `${screen.colorDepth || 24} bit`;

    const isP3 = window.matchMedia && window.matchMedia('(color-gamut: p3)').matches;
    const gamutText = isP3 ? '対応 (P3 広色域)' : '標準 (sRGB)';

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeText = isDarkMode ? 'ダークモード' : 'ライトモード';

    if (elements.dispScreen) elements.dispScreen.textContent = screenRes;
    if (elements.dispViewport) elements.dispViewport.textContent = viewportRes;
    if (elements.dispDpr) elements.dispDpr.textContent = dpr;
    if (elements.dispColorDepth) elements.dispColorDepth.textContent = colorDepth;
    if (elements.dispColorGamut) elements.dispColorGamut.textContent = gamutText;
    if (elements.dispTheme) elements.dispTheme.textContent = themeText;

    inspectorData.display = {
      screenResolution: screenRes,
      viewportSize: viewportRes,
      pixelRatio: dpr
    };
  }

  /* ==========================================================================
     6. バッテリー情報の監視
     ========================================================================== */
  async function setupBatteryMonitoring() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        
        function updateBatteryStatus() {
          const level = Math.round(battery.level * 100);
          if (elements.batteryFill) elements.batteryFill.style.width = `${level}%`;
          if (elements.batteryPercent) elements.batteryPercent.textContent = `${level}%`;

          const isCharging = battery.charging;
          if (elements.batteryChargingStatus) {
            elements.batteryChargingStatus.textContent = isCharging ? '充電中 (AC / USB)' : 'バッテリー駆動中';
          }

          if (elements.batteryChargeTime) {
            elements.batteryChargeTime.textContent = (isCharging && battery.chargingTime !== Infinity) 
              ? `${Math.round(battery.chargingTime / 60)} 分で完電` 
              : (isCharging ? '充電完了' : '--');
          }

          if (elements.batteryDischargeTime) {
            elements.batteryDischargeTime.textContent = (!isCharging && battery.dischargingTime !== Infinity) 
              ? `${Math.round(battery.dischargingTime / 60)} 分使用可能` 
              : (!isCharging ? '計測中...' : '--');
          }

          inspectorData.battery = { level: `${level}%`, charging: isCharging ? '充電中' : '放電中' };
        }

        updateBatteryStatus();

        battery.addEventListener('chargingchange', updateBatteryStatus);
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingtimechange', updateBatteryStatus);
        battery.addEventListener('dischargingtimechange', updateBatteryStatus);

      } catch (e) {
        if (elements.batteryPercent) elements.batteryPercent.textContent = '非対応';
      }
    } else {
      if (elements.batteryPercent) elements.batteryPercent.textContent = 'N/A';
      if (elements.batteryChargingStatus) elements.batteryChargingStatus.textContent = 'Battery API 非対応';
      showAlert('お使いのブラウザ環境は Battery API に非対応のため、バッテリー情報は表示されません。', 'info');
    }
  }

  /* ==========================================================================
     7. システム & ロケール
     ========================================================================== */
  function updateSystemInfo() {
    const lang = navigator.language || '不明';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '不明';
    const cookiesEnabled = navigator.cookieEnabled ? '有効 (許可)' : '無効 (ブロック中)';

    if (elements.sysLang) elements.sysLang.textContent = lang;
    if (elements.sysTimezone) elements.sysTimezone.textContent = tz;
    if (elements.sysCookies) elements.sysCookies.textContent = cookiesEnabled;

    inspectorData.system.language = lang;
    inspectorData.system.timezone = tz;
  }

  function startClock() {
    function updateClock() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
      const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (elements.sysTime) elements.sysTime.textContent = `${dateStr} ${timeStr}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ==========================================================================
     8. 簡易スピードテスト
     ========================================================================== */
  async function runSpeedTest() {
    if (elements.speedProgressBar) elements.speedProgressBar.classList.remove('hidden');
    if (elements.speedProgressFill) elements.speedProgressFill.style.width = '15%';

    if (elements.speedPing) elements.speedPing.innerHTML = '測定中...';
    if (elements.speedDownload) elements.speedDownload.innerHTML = '測定中...';

    // 1. Ping計測
    try {
      const startTime = performance.now();
      await fetch(`https://api.ipify.org?format=json&t=${Date.now()}`, { cache: 'no-store' });
      const endTime = performance.now();
      const pingMs = Math.round(endTime - startTime);
      if (elements.speedPing) elements.speedPing.innerHTML = `${pingMs} <small>ms</small>`;
    } catch (e) {
      if (elements.speedPing) elements.speedPing.innerHTML = 'エラー';
    }

    if (elements.speedProgressFill) elements.speedProgressFill.style.width = '50%';

    // 2. 下り速度計測
    try {
      const testFileUrl = 'https://picsum.photos/800/800';
      const downloadStart = performance.now();
      
      const response = await fetch(`${testFileUrl}?cachebust=${Date.now()}`, { cache: 'no-store' });
      const blob = await response.blob();
      const downloadEnd = performance.now();

      if (elements.speedProgressFill) elements.speedProgressFill.style.width = '90%';

      const durationInSeconds = (downloadEnd - downloadStart) / 1000;
      const bitsLoaded = blob.size * 8;
      const speedBps = bitsLoaded / durationInSeconds;
      const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);

      if (elements.speedDownload) elements.speedDownload.innerHTML = `${speedMbps} <small>Mbps</small>`;
    } catch (e) {
      if (elements.speedDownload) elements.speedDownload.innerHTML = '計測失敗';
    }

    if (elements.speedProgressFill) elements.speedProgressFill.style.width = '100%';
    setTimeout(() => {
      if (elements.speedProgressBar) elements.speedProgressBar.classList.add('hidden');
      showToast('スピードテストが完了しました');
    }, 500);
  }

  /* ==========================================================================
     9. イベントリスナー & 通知ヘルパー
     ========================================================================== */
  function setupEventListeners() {
    window.addEventListener('resize', updateDisplayInfo);

    window.addEventListener('online', () => {
      updateOnlineBadge();
      showToast('ネットワーク接続が復旧しました');
    });

    window.addEventListener('offline', () => {
      updateOnlineBadge();
    });

    if (elements.btnCopyAll) {
      elements.btnCopyAll.addEventListener('click', () => {
        const formattedText = `=== Device & Network Inspector Data ===\n` +
          `【IP / 回線】 IP: ${inspectorData.network.ip || 'N/A'} | ISP: ${inspectorData.network.isp || 'N/A'} | Location: ${inspectorData.network.location || 'N/A'}\n` +
          `【デバイス】 OS: ${inspectorData.device.os} | Browser: ${inspectorData.device.browser} | CPU: ${elements.devCores ? elements.devCores.textContent : 'N/A'}\n` +
          `【画面】 Resolution: ${inspectorData.display.screenResolution} | Viewport: ${inspectorData.display.viewportSize}\n` +
          `【バッテリー】 Status: ${inspectorData.battery.level || 'N/A'}\n` +
          `【システム】 Timezone: ${inspectorData.system.timezone} | Language: ${inspectorData.system.language}\n` +
          `取得日時: ${new Date().toLocaleString('ja-JP')}`;

        navigator.clipboard.writeText(formattedText).then(() => {
          showToast('全情報をクリップボードにコピーしました');
        }).catch(() => {
          showToast('コピーに失敗しました', true);
        });
      });
    }

    if (elements.btnCopyIp) {
      elements.btnCopyIp.addEventListener('click', () => {
        const ip = elements.ipAddress ? elements.ipAddress.textContent : '';
        if (ip && ip !== '取得中...' && ip !== '接続エラー') {
          navigator.clipboard.writeText(ip).then(() => {
            showToast(`IPアドレス (${ip}) をコピーしました`);
          });
        }
      });
    }

    if (elements.btnRefresh) {
      elements.btnRefresh.addEventListener('click', () => {
        initApp();
        showToast('最新情報を再読み込みしました');
      });
    }

    if (elements.btnStartSpeedtest) {
      elements.btnStartSpeedtest.addEventListener('click', runSpeedTest);
    }
  }

  /* サイト共通 HlToast 呼び出し */
  function showToast(message, isError = false) {
    if (window.HlToast && typeof window.HlToast.show === 'function') {
      window.HlToast.show(message, isError ? 'warning' : 'success', 2500);
    }
  }

  /* サイト共通 アラート表示ヘルパー */
  function showAlert(message, variant = 'info') {
    if (!elements.alertContainer) return;
    elements.alertContainer.innerHTML = `<hl-alert variant="${variant}">${message}</hl-alert>`;
  }

  // 初期化実行
  initApp();
});
