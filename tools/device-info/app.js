/**
 * Device & Network Inspector - Main JavaScript Application
 * ユーザーのデバイス・通信回線・画面・電源ステータスを解析・表示します
 */

document.addEventListener('DOMContentLoaded', () => {
  // 取得した全情報を保持するオブジェクト
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

    // ボタン & トースト
    btnCopyAll: document.getElementById('btn-copy-all'),
    btnCopyIp: document.getElementById('btn-copy-ip'),
    btnRefresh: document.getElementById('btn-refresh'),
    toastContainer: document.getElementById('toast-container')
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
     3. ネットワーク情報の取得 (IP/ISP/Network API)
     ========================================================================== */
  async function fetchNetworkDetails() {
    updateOnlineBadge();

    // 回線情報の取得 (Network Information API)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const effectiveType = conn.effectiveType ? conn.effectiveType.toUpperCase() : '不明';
      const downlink = conn.downlink !== undefined ? `${conn.downlink} Mbps` : '非対応';
      const rtt = conn.rtt !== undefined ? `${conn.rtt} ms` : '非対応';
      const saveData = conn.saveData ? 'ON (有効)' : 'OFF (無効)';

      elements.netEffectiveType.textContent = effectiveType;
      elements.netDownlink.textContent = downlink;
      elements.netRtt.textContent = rtt;
      elements.netSaveData.textContent = saveData;

      inspectorData.network.effectiveType = effectiveType;
      inspectorData.network.downlink = downlink;
      inspectorData.network.rtt = rtt;
      inspectorData.network.saveData = saveData;
    } else {
      elements.netEffectiveType.textContent = 'API非対応';
      elements.netDownlink.textContent = 'API非対応';
      elements.netRtt.textContent = 'API非対応';
      elements.netSaveData.textContent = 'API非対応';
    }

    // パブリックIP & 地理情報APIの呼び出し（フォールバック構造）
    try {
      elements.ipAddress.textContent = '取得中...';
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error('IP API Request failed');
      const data = await res.json();

      const ip = data.ip || '不明';
      const isp = data.org || data.asn || '不明';
      const location = (data.city && data.country_name) 
        ? `${data.city}, ${data.country_name} (${data.country_code})` 
        : (data.country_name || '不明');

      elements.ipAddress.textContent = ip;
      elements.netIsp.textContent = isp;
      elements.netLocation.textContent = location;

      inspectorData.network.ip = ip;
      inspectorData.network.isp = isp;
      inspectorData.network.location = location;
    } catch (err) {
      // フォールバック: ipify API
      try {
        const fallbackRes = await fetch('https://api.ipify.org?format=json');
        const fallbackData = await fallbackRes.json();
        const ip = fallbackData.ip || '取得失敗';
        
        elements.ipAddress.textContent = ip;
        elements.netIsp.textContent = '取得できませんでした';
        elements.netLocation.textContent = '取得できませんでした';

        inspectorData.network.ip = ip;
        inspectorData.network.isp = '不明';
        inspectorData.network.location = '不明';
      } catch (fallbackErr) {
        elements.ipAddress.textContent = '接続エラー';
        elements.netIsp.textContent = 'エラー';
        elements.netLocation.textContent = 'エラー';
      }
    }
  }

  function updateOnlineBadge() {
    const isOnline = navigator.onLine;
    if (isOnline) {
      elements.netOnlineStatus.textContent = 'オンライン';
      elements.netOnlineStatus.classList.remove('offline');
    } else {
      elements.netOnlineStatus.textContent = 'オフライン';
      elements.netOnlineStatus.classList.add('offline');
    }
    inspectorData.network.isOnline = isOnline;
  }

  /* ==========================================================================
     4. デバイス & OS & ブラウザの判定
     ========================================================================== */
  function parseDeviceInfo() {
    const ua = navigator.userAgent;
    elements.devUa.textContent = ua;
    elements.devUa.title = ua;
    inspectorData.device.userAgent = ua;

    // OS判定
    let os = '不明なOS';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Linux')) os = 'Linux';
    elements.devOs.textContent = os;
    inspectorData.device.os = os;

    // ブラウザ判定
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
    elements.devBrowser.textContent = browser;
    inspectorData.device.browser = browser;

    // CPUコア数
    const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} スレッド / コア` : '非公開 / 非対応';
    elements.devCores.textContent = cores;
    inspectorData.device.cpuCores = cores;

    // メモリ容量
    const memory = navigator.deviceMemory ? `約 ${navigator.deviceMemory} GB` : '非公開 / 非対応';
    elements.devMemory.textContent = memory;
    inspectorData.device.memory = memory;

    // タッチ操作サポート
    const maxTouch = navigator.maxTouchPoints || 0;
    const touchText = maxTouch > 0 ? `対応 (最大 ${maxTouch} 点検出)` : '非対応 (マウス / キーボード)';
    elements.devTouch.textContent = touchText;
    inspectorData.device.touchSupport = touchText;
  }

  /* ==========================================================================
     5. ディスプレイ情報の解析
     ========================================================================== */
  function updateDisplayInfo() {
    const screenRes = `${screen.width} × ${screen.height} px`;
    const viewportRes = `${window.innerWidth} × ${window.innerHeight} px`;
    const dpr = `${window.devicePixelRatio || 1}x`;
    const colorDepth = `${screen.colorDepth || 24} bit`;

    // Display P3 (広色域) チェック
    const isP3 = window.matchMedia && window.matchMedia('(color-gamut: p3)').matches;
    const gamutText = isP3 ? '対応 (P3 広色域)' : '標準 (sRGB)';

    // ダークモードテーマチェック
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeText = isDarkMode ? 'ダークモード' : 'ライトモード';

    elements.dispScreen.textContent = screenRes;
    elements.dispViewport.textContent = viewportRes;
    elements.dispDpr.textContent = dpr;
    elements.dispColorDepth.textContent = colorDepth;
    elements.dispColorGamut.textContent = gamutText;
    elements.dispTheme.textContent = themeText;

    inspectorData.display = {
      screenResolution: screenRes,
      viewportSize: viewportRes,
      pixelRatio: dpr,
      colorDepth: colorDepth,
      colorGamut: gamutText,
      osTheme: themeText
    };
  }

  /* ==========================================================================
     6. バッテリー情報の取得・監視
     ========================================================================== */
  async function setupBatteryMonitoring() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        
        function updateBatteryStatus() {
          const level = Math.round(battery.level * 100);
          elements.batteryFill.style.width = `${level}%`;
          elements.batteryPercent.textContent = `${level}%`;

          const isCharging = battery.charging;
          elements.batteryChargingStatus.textContent = isCharging ? '充電中 (AC / USB)' : 'バッテリー駆動中';

          // 色変更
          if (level <= 20 && !isCharging) {
            elements.batteryFill.style.background = 'linear-gradient(90deg, #f43f5e, #e11d48)';
          } else {
            elements.batteryFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
          }

          // 時間予測
          elements.batteryChargeTime.textContent = (isCharging && battery.chargingTime !== Infinity) 
            ? `${Math.round(battery.chargingTime / 60)} 分で完電` 
            : (isCharging ? '充電完了' : '--');

          elements.batteryDischargeTime.textContent = (!isCharging && battery.dischargingTime !== Infinity) 
            ? `${Math.round(battery.dischargingTime / 60)} 分使用可能` 
            : (!isCharging ? '計測中...' : '--');

          inspectorData.battery = {
            level: `${level}%`,
            charging: isCharging ? '充電中' : '放電中',
            chargeTime: elements.batteryChargeTime.textContent,
            dischargeTime: elements.batteryDischargeTime.textContent
          };
        }

        updateBatteryStatus();

        // 状態変更リスナー
        battery.addEventListener('chargingchange', updateBatteryStatus);
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingtimechange', updateBatteryStatus);
        battery.addEventListener('dischargingtimechange', updateBatteryStatus);

      } catch (e) {
        elements.batteryPercent.textContent = 'API非対応';
        elements.batteryChargingStatus.textContent = '取得できませんでした';
      }
    } else {
      elements.batteryPercent.textContent = 'N/A';
      elements.batteryChargingStatus.textContent = 'Battery API 非対応ブラウザ';
      inspectorData.battery.status = 'Battery API 非対応';
    }
  }

  /* ==========================================================================
     7. システム・ロケール情報 & リアルタイム時計
     ========================================================================== */
  function updateSystemInfo() {
    const lang = navigator.language || '不明';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '不明';
    const cookiesEnabled = navigator.cookieEnabled ? '有効 (許可)' : '無効 (ブロック中)';

    elements.sysLang.textContent = lang;
    elements.sysTimezone.textContent = tz;
    elements.sysCookies.textContent = cookiesEnabled;

    inspectorData.system.language = lang;
    inspectorData.system.timezone = tz;
    inspectorData.system.cookiesEnabled = cookiesEnabled;
  }

  function startClock() {
    function updateClock() {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
      const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      elements.sysTime.textContent = `${dateStr} ${timeStr}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ==========================================================================
     8. 簡易回線スピードテスト機能
     ========================================================================== */
  async function runSpeedTest() {
    elements.btnStartSpeedtest.disabled = true;
    elements.btnStartSpeedtest.querySelector('span').textContent = '測定中...';
    elements.speedProgressBar.classList.remove('hidden');
    elements.speedProgressFill.style.width = '10%';

    elements.speedPing.innerHTML = '測定中...';
    elements.speedDownload.innerHTML = '測定中...';

    // 1. Ping計測
    try {
      const startTime = performance.now();
      await fetch(`https://api.ipify.org?format=json&t=${Date.now()}`, { cache: 'no-store' });
      const endTime = performance.now();
      const pingMs = Math.round(endTime - startTime);
      elements.speedPing.innerHTML = `${pingMs} <small>ms</small>`;
      inspectorData.network.measuredPing = `${pingMs} ms`;
    } catch (e) {
      elements.speedPing.innerHTML = 'エラー';
    }

    elements.speedProgressFill.style.width = '40%';

    // 2. 下り実測速度計測 (画像ファイルまたはダミーデータ取得)
    try {
      const testFileUrl = 'https://picsum.photos/800/800'; // テスト画像
      const downloadStart = performance.now();
      
      const response = await fetch(`${testFileUrl}?cachebust=${Date.now()}`, { cache: 'no-store' });
      const blob = await response.blob();
      const downloadEnd = performance.now();

      elements.speedProgressFill.style.width = '90%';

      const durationInSeconds = (downloadEnd - downloadStart) / 1000;
      const bitsLoaded = blob.size * 8;
      const speedBps = bitsLoaded / durationInSeconds;
      const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);

      elements.speedDownload.innerHTML = `${speedMbps} <small>Mbps</small>`;
      inspectorData.network.measuredDownloadSpeed = `${speedMbps} Mbps`;
    } catch (e) {
      elements.speedDownload.innerHTML = '計測失敗';
    }

    elements.speedProgressFill.style.width = '100%';
    setTimeout(() => {
      elements.speedProgressBar.classList.add('hidden');
      elements.btnStartSpeedtest.disabled = false;
      elements.btnStartSpeedtest.querySelector('span').textContent = '再テスト';
      showToast('スピードテストが完了しました');
    }, 500);
  }

  /* ==========================================================================
     9. イベントリスナー & ユーティリティ
     ========================================================================== */
  function setupEventListeners() {
    // 画面リサイズ検知
    window.addEventListener('resize', () => {
      updateDisplayInfo();
    });

    // オンライン/オフライン切替検知
    window.addEventListener('online', () => {
      updateOnlineBadge();
      showToast('ネットワーク接続が復旧しました');
    });

    window.addEventListener('offline', () => {
      updateOnlineBadge();
      showToast('ネットワークが切断されました', true);
    });

    // 全コピーボタン
    elements.btnCopyAll.addEventListener('click', () => {
      const formattedText = `=== Device & Network Inspector Data ===\n` +
        `【IP / 回線】 IP: ${inspectorData.network.ip || 'N/A'} | ISP: ${inspectorData.network.isp || 'N/A'} | Location: ${inspectorData.network.location || 'N/A'}\n` +
        `【デバイス】 OS: ${inspectorData.device.os} | Browser: ${inspectorData.device.browser} | CPU: ${inspectorData.device.cpuCores} | Memory: ${inspectorData.device.memory}\n` +
        `【画面】 Resolution: ${inspectorData.display.screenResolution} | Viewport: ${inspectorData.display.viewportSize} | DPR: ${inspectorData.display.pixelRatio}\n` +
        `【バッテリー】 Status: ${inspectorData.battery.level || 'N/A'} (${inspectorData.battery.charging || 'N/A'})\n` +
        `【システム】 Timezone: ${inspectorData.system.timezone} | Language: ${inspectorData.system.language}\n` +
        `取得日時: ${new Date().toLocaleString('ja-JP')}`;

      navigator.clipboard.writeText(formattedText).then(() => {
        showToast('全情報をクリップボードにコピーしました');
      }).catch(() => {
        showToast('コピーに失敗しました', true);
      });
    });

    // IPコピーボタン
    elements.btnCopyIp.addEventListener('click', () => {
      const ip = elements.ipAddress.textContent;
      if (ip && ip !== '取得中...' && ip !== '接続エラー') {
        navigator.clipboard.writeText(ip).then(() => {
          showToast(`IPアドレス (${ip}) をコピーしました`);
        });
      }
    });

    // 手動更新ボタン
    elements.btnRefresh.addEventListener('click', () => {
      initApp();
      showToast('最新情報を取得・再読み込みしました');
    });

    // スピードテストボタン
    elements.btnStartSpeedtest.addEventListener('click', runSpeedTest);
  }

  /* トースト表示ユーティリティ */
  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isError ? '#f43f5e' : '#38bdf8'}" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // アプリ起動
  initApp();
});
