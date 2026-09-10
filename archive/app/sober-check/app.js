/**
 * ほろ酔い診断テスト (Sober Check)
 * お酒を飲む前と飲んだ後で同じテストを実施し、能力の変化から酔い度を優しく測定・診断します。
 * 飲む前・飲んだ後それぞれ最大10件まで履歴を保存・確認できます。
 */

'use strict';

(function () {
  // --- 定数・標準平均値（飲む前未測定時の比較用） ---
  const STANDARD_AVERAGES = {
    reflex: 260,          // 成人平均反応速度: 260ms (トリム平均)
    stroopAccuracy: 95,   // 正答率: 95%
    stroopTime: 1050,     // 平均判断時間: 1050ms
    memory: 90,           // 記憶スコア: 90点
    trailTime: 4200,      // 数字探索クリア時間: 4200ms (4.2秒)
    timePerceptionDiff: 650, // 10秒との平均絶対誤差: 650ms
    riskCount: 2,         // リスク選択数 (5問中): 2回 (平常時の適度なリスク選好)
    riskDecisionTime: 1200,// 意思決定時間: 1200ms
    dualReflex: 330,      // 二重課題下反応速度: 330ms (単純より約70ms遅延)
    dualMistakes: 0       // 3の倍数お手つき回数: 0回
  };

  // --- ステップごとのルール・解説文定義 (全7ステップ) ---
  const STEP_RULES = {
    1: {
      badge: 'STEP 1 / 7 のルール説明',
      title: '反射神経テスト（単純反応速度）',
      inst: '画面が「緑色」に変わった瞬間に、できるだけ素早くタップしてください。',
      rules: [
        { icon: '●', text: '「タップして計測開始」を押すと待機画面（赤色）になります。' },
        { icon: '●', text: '赤色の間は待機です。焦ってタップするとフライングでやり直しになります。' },
        { icon: '●', text: '画面がパッと「緑色」に変わったら、できるだけ速く画面をタップしてください。' },
        { icon: '●', text: '【精度向上】全5回測定し、最速と最遅を除いた安定したトリム平均を算出します。' }
      ]
    },
    2: {
      badge: 'STEP 2 / 7 のルール説明',
      title: '認知・色判断テスト（ストループ課題）',
      inst: '文字の「意味」ではなく、表示されている「文字の色」を素早く選んでください。',
      rules: [
        { icon: '●', text: '画面に「あか」「あお」などの文字が表示されます。' },
        { icon: '●', text: '【重要】文字の意味ではなく、その文字が「何色のフォントで書かれているか」を下の4色から選んでください。' },
        { icon: '●', text: '【時間測定】正確さだけでなく、回答にかかった時間もミリ秒単位でリアルタイム測定しています。' },
        { icon: '●', text: '統計的ブレを抑えるため全10問出題されます。迷わずスピーディに回答してください。' }
      ]
    },
    3: {
      badge: 'STEP 3 / 7 のルール説明',
      title: '短期記憶テスト（光るタイルの順序）',
      inst: '順番に光るタイルをよく覚えて、光り終わった後に同じ順番でタップしてください。',
      rules: [
        { icon: '●', text: '9つのパネルのうち、いくつか（3〜5枚）が順番にピカピカと光ります。' },
        { icon: '●', text: 'まずはじっと見て、光った順番を頭の中でしっかり記憶してください。' },
        { icon: '●', text: '「タップしてください」の合図が出たら、覚えた順番通りにタイルをタップします。' },
        { icon: '●', text: '全3問出題され、手数は「3手 → 4手 → 5手」と段階的に増えていきます。' }
      ]
    },
    4: {
      badge: 'STEP 4 / 7 のルール説明',
      title: '視野・探索テスト（数字クイックタップ）',
      inst: '画面に散らばった 1 〜 8 の数字を、順番通りにできるだけ素早くタップしてください。',
      rules: [
        { icon: '●', text: '画面の中に 1 から 8 までの丸い数字ボタンが散らばって現れます。' },
        { icon: '●', text: '【重要】必ず「1 → 2 → 3 → 4 → 5 → 6 → 7 → 8」の順番通りにタップしてください。' },
        { icon: '●', text: '目標を見つける「視線の素早い切り替え」と「情報処理速度」を測定します。' },
        { icon: '●', text: '最後の「8」まで全て押し終わるまでのクリアタイム（秒）を測定します。' }
      ]
    },
    5: {
      badge: 'STEP 5 / 7 のルール説明',
      title: '時間感覚テスト（主観的10秒ストップ）',
      inst: '体内時計で「ちょうど10秒」を測り、ストップボタンを押してください。',
      rules: [
        { icon: '●', text: '「スタート」を押すと体内タイマーが開始されます（画面上に秒数は表示されません）。' },
        { icon: '●', text: '頭の中でカウントし、自分が「ちょうど10秒経った」と感じたタイミングで「ストップ」を押します。' },
        { icon: '●', text: 'アルコールによる時間の進み・遅れ感覚のズレを測るため、全2回実施し平均誤差を算出します。' },
        { icon: '●', text: '※測定中に別のタブへ切り替えると無効になりますのでご注意ください。' }
      ]
    },
    6: {
      badge: 'STEP 6 / 7 のルール説明',
      title: 'リスク判断テスト（簡易意思決定課題）',
      inst: '「安全」か「リスク」か、あなたの直感で選択肢を選んでください。',
      rules: [
        { icon: '●', text: '各問で「安全（+10pt確定）」と「リスク（50%で+30pt/0pt）」の二択が提示されます（全5問）。' },
        { icon: '●', text: '前頭葉の抑制低下に伴うリスク選好の変化（衝動性や普段からのブレ）と、決断までの時間を測定します。' },
        { icon: '●', text: '※本テストは実際の金銭や賞品を伴わない、ポイントのみの疑似ゲームです。' }
      ]
    },
    7: {
      badge: 'STEP 7 / 7 のルール説明',
      title: '二重課題テスト（ながら反射神経）',
      inst: '緑色になったらタップ！ただし「数字が3の倍数」の時はタップ禁止です。',
      rules: [
        { icon: '●', text: 'STEP 1と同様に、画面が緑色に変わったら素早くタップします。' },
        { icon: '●', text: '【追加ルール】画面上の数字が「3の倍数（3, 6, 9）」の時は、緑になっても絶対にタップしてはいけません！' },
        { icon: '●', text: '複数の刺激を同時に処理する「分割的注意力」の低下とお手つき回数を測定します（全4試行）。' }
      ]
    }
  };

  // --- ローカルストレージキー ---
  const STORAGE_KEY_BASELINE_LIST = 'halcyon_sober_baseline_list_v3';
  const STORAGE_KEY_AFTER_LIST = 'halcyon_sober_after_list_v3';
  const STORAGE_KEY_ACTIVE_BASE_ID = 'halcyon_sober_active_base_id_v3';

  // --- 状態管理 ---
  let currentMode = 'baseline'; // 'baseline' (飲む前) | 'soberTest' (飲んだ後) | 'quick' (即時)
  let currentStep = 1;         // 1〜7
  let currentHistoryTab = 'before'; // 'before' | 'after'

  // 測定結果一時保存用
  let sessionResults = {
    reflexTimes: [],          // 5回
    stroopTotal: 10,          // 10問
    stroopCorrect: 0,
    stroopTimes: [],
    memoryRounds: 3,          // 3問
    memoryScore: 0,
    trailTime: 0,
    timeDiffs: [],            // 2回
    riskChoices: [],          // 5問 ('safe' | 'gamble')
    riskTimes: [],
    dualTimes: [],            // 4回
    dualMistakes: 0
  };

  // --- DOM要素 ---
  const elHomeView = document.getElementById('sober-home-view');
  const elTestScreen = document.getElementById('sober-test-screen');
  const elResultScreen = document.getElementById('sober-result-screen');
  const elBaselineStatus = document.getElementById('baseline-status-badge');

  // ルール説明 & カウントダウン
  const elStepIntroOverlay = document.getElementById('step-intro-overlay');
  const elIntroStepBadge = document.getElementById('intro-step-badge');
  const elIntroStepTitle = document.getElementById('intro-step-title');
  const elIntroRuleList = document.getElementById('intro-rule-list');
  const elBtnConfirmStartStep = document.getElementById('btn-confirm-start-step');

  const elCountdownOverlay = document.getElementById('step-countdown-overlay');
  const elCountdownNumber = document.getElementById('countdown-number');
  const elCountdownMsg = document.getElementById('countdown-msg');

  // テスト共通表示要素
  const elActiveTestWorkspace = document.getElementById('active-test-workspace');
  const elProgressFill = document.getElementById('test-progress-fill');
  const elStepLabel = document.getElementById('test-step-label');
  const elStepTitle = document.getElementById('test-step-title');
  const elStepInst = document.getElementById('test-step-inst');

  // テストエリア各コンテナ (全7ステップ)
  const elReflexArea = document.getElementById('test-area-reflex');
  const elStroopArea = document.getElementById('test-area-stroop');
  const elMemoryArea = document.getElementById('test-area-memory');
  const elTrailArea = document.getElementById('test-area-trail');
  const elTimeArea = document.getElementById('test-area-time');
  const elRiskArea = document.getElementById('test-area-risk');
  const elDualArea = document.getElementById('test-area-dual');

  // 履歴モーダル要素
  const elHistoryModal = document.getElementById('history-modal-overlay');
  const elBtnCloseHistory = document.getElementById('btn-close-history');
  const elBtnModalCloseFooter = document.getElementById('btn-modal-close-footer');
  const elTabBtnBefore = document.getElementById('tab-btn-before');
  const elTabBtnAfter = document.getElementById('tab-btn-after');
  const elCountBefore = document.getElementById('count-before');
  const elCountAfter = document.getElementById('count-after');
  const elHistoryListContainer = document.getElementById('history-list-container');
  const elBtnClearAllHistory = document.getElementById('btn-clear-all-history');

  // 初期ロード時
  document.addEventListener('DOMContentLoaded', () => {
    updateBaselineBadge();
    bindEvents();
  });

  // 履歴取得ヘルパー（最大10件）
  function getBaselineList() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BASELINE_LIST);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function getAfterList() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AFTER_LIST);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // 現在有効な飲む前の基準レコードを取得
  function getActiveBaselineRecord() {
    const list = getBaselineList();
    if (list.length === 0) return null;

    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_BASE_ID);
    if (activeId) {
      const found = list.find(item => item.id === activeId);
      if (found) return found;
    }
    return list[0]; // デフォルトは最新
  }

  // 基準値ステータス更新
  function updateBaselineBadge() {
    const activeBase = getActiveBaselineRecord();
    const count = getBaselineList().length;

    if (activeBase) {
      const dateStr = new Date(activeBase.timestamp).toLocaleString('ja-JP', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      elBaselineStatus.innerHTML = `<span class="status-dot"></span> 飲む前の基準値: 記録あり (${dateStr} 使用中 / 全${count}件)`;
      elBaselineStatus.classList.remove('not-recorded');
    } else {
      elBaselineStatus.innerHTML = `<span class="status-dot not-recorded"></span> 飲む前の基準値: まだ記録されていません`;
      elBaselineStatus.classList.add('not-recorded');
    }
  }

  // イベント登録
  function bindEvents() {
    document.getElementById('btn-start-baseline').addEventListener('click', () => startTestFlow('baseline'));
    document.getElementById('btn-start-check').addEventListener('click', () => {
      const hasBaseline = !!getActiveBaselineRecord();
      if (!hasBaseline) {
        if (confirm('飲む前の基準データがまだありません。一般的な標準平均値と比較するクイック診断として開始しますか？')) {
          startTestFlow('quick');
        }
      } else {
        startTestFlow('soberTest');
      }
    });
    document.getElementById('btn-start-quick').addEventListener('click', () => startTestFlow('quick'));

    elBtnConfirmStartStep.addEventListener('click', () => {
      startStepCountdown(currentStep);
    });

    document.getElementById('btn-open-history').addEventListener('click', () => openHistoryModal('before'));
    const btnResultHistory = document.getElementById('btn-result-open-history');
    if (btnResultHistory) {
      btnResultHistory.addEventListener('click', () => openHistoryModal('after'));
    }

    elBtnCloseHistory.addEventListener('click', closeHistoryModal);
    elBtnModalCloseFooter.addEventListener('click', closeHistoryModal);
    elHistoryModal.addEventListener('click', (e) => {
      if (e.target === elHistoryModal) closeHistoryModal();
    });

    elTabBtnBefore.addEventListener('click', () => switchHistoryTab('before'));
    elTabBtnAfter.addEventListener('click', () => switchHistoryTab('after'));
    elBtnClearAllHistory.addEventListener('click', handleClearAllTabHistory);

    document.getElementById('btn-retry-test').addEventListener('click', () => {
      elResultScreen.style.display = 'none';
      elHomeView.style.display = 'block';
      updateBaselineBadge();
    });

    document.getElementById('btn-reset-baseline').addEventListener('click', () => {
      if (confirm('保存されている「飲む前の基準値」をすべて消去してもよろしいですか？')) {
        localStorage.removeItem(STORAGE_KEY_BASELINE_LIST);
        localStorage.removeItem(STORAGE_KEY_ACTIVE_BASE_ID);
        updateBaselineBadge();
        alert('飲む前の基準値を消去しました。');
      }
    });

    document.querySelectorAll('.drink-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.drink-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        updateDrinkCareEstimate(parseInt(this.dataset.drinks || 1, 10));
      });
    });
  }

  // ==========================================================================
  // 履歴モーダル制御 (飲む前/後 各最大10件)
  // ==========================================================================
  function openHistoryModal(tab = 'before') {
    currentHistoryTab = tab;
    elHistoryModal.classList.add('open');
    renderHistoryModalView();
  }

  function closeHistoryModal() {
    elHistoryModal.classList.remove('open');
  }

  function switchHistoryTab(tab) {
    currentHistoryTab = tab;
    renderHistoryModalView();
  }

  function renderHistoryModalView() {
    const beforeList = getBaselineList();
    const afterList = getAfterList();

    elCountBefore.textContent = beforeList.length;
    elCountAfter.textContent = afterList.length;

    if (currentHistoryTab === 'before') {
      elTabBtnBefore.classList.add('active');
      elTabBtnAfter.classList.remove('active');
      renderBeforeHistoryList(beforeList);
    } else {
      elTabBtnBefore.classList.remove('active');
      elTabBtnAfter.classList.add('active');
      renderAfterHistoryList(afterList);
    }
  }

  function renderBeforeHistoryList(list) {
    elHistoryListContainer.innerHTML = '';

    if (list.length === 0) {
      elHistoryListContainer.innerHTML = `
        <div class="history-empty-state">
          <p style="font-weight: 700; margin-bottom: 0.4rem; color: var(--app-brown);">まだ飲む前の記録がありません</p>
          <p>平常時の冴えた状態を「飲む前テスト」で記録しておくと、ここへ最大10件まで自動保存されます。</p>
        </div>
      `;
      return;
    }

    const activeRecord = getActiveBaselineRecord();
    const activeId = activeRecord ? activeRecord.id : null;

    list.forEach((item, index) => {
      const isActive = (item.id === activeId);
      const dateStr = new Date(item.timestamp).toLocaleString('ja-JP', {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const trailSec = (item.trailTime / 1000).toFixed(2);
      const card = document.createElement('div');
      card.className = 'history-item-card';
      card.innerHTML = `
        <div class="history-item-header">
          <span class="history-item-date">${dateStr}</span>
          <span class="history-item-badge" style="${isActive ? 'background: var(--app-sage); color: #fff;' : ''}">
            ${isActive ? '基準値として使用中' : `記録 #${list.length - index}`}
          </span>
        </div>
        <div class="history-metrics-grid">
          <div>反応速度: <span class="history-metric-val">${item.reflex} ms</span></div>
          <div>色認知: <span class="history-metric-val">${item.stroopAccuracy}% (${(item.stroopTime/1000).toFixed(2)}秒)</span></div>
          <div>短期記憶: <span class="history-metric-val">${item.memory} 点</span></div>
          <div>探索視野: <span class="history-metric-val">${trailSec} 秒</span></div>
          ${item.timePerceptionDiff !== undefined ? `<div>時間感覚: <span class="history-metric-val">±${((item.timePerceptionDiff)/1000).toFixed(2)} 秒</span></div>` : ''}
          ${item.riskCount !== undefined ? `<div>リスク選択: <span class="history-metric-val">${item.riskCount} / 5回</span></div>` : ''}
          ${item.dualReflex !== undefined ? `<div>二重課題: <span class="history-metric-val">${item.dualReflex} ms (ミス${item.dualMistakes||0})</span></div>` : ''}
        </div>
        <div class="history-item-actions">
          ${!isActive ? `<button type="button" class="btn-history-action btn-use-base" data-id="${item.id}">この記録を比較基準にする</button>` : ''}
          <button type="button" class="btn-history-action btn-del" data-type="before" data-index="${index}">削除</button>
        </div>
      `;

      const btnUse = card.querySelector('.btn-use-base');
      if (btnUse) {
        btnUse.onclick = () => {
          localStorage.setItem(STORAGE_KEY_ACTIVE_BASE_ID, item.id);
          updateBaselineBadge();
          renderHistoryModalView();
        };
      }

      const btnDel = card.querySelector('.btn-del');
      btnDel.onclick = () => {
        if (confirm(`${dateStr} の記録を削除しますか？`)) {
          deleteBaselineItem(index);
        }
      };

      elHistoryListContainer.appendChild(card);
    });
  }

  function renderAfterHistoryList(list) {
    elHistoryListContainer.innerHTML = '';

    if (list.length === 0) {
      elHistoryListContainer.innerHTML = `
        <div class="history-empty-state">
          <p style="font-weight: 700; margin-bottom: 0.4rem; color: var(--app-brown);">まだ飲んだ後の記録がありません</p>
          <p>お酒を飲んだ後に「飲んだ後テスト」を行うと、診断結果がここへ最大10件まで自動保存されます。</p>
        </div>
      `;
      return;
    }

    list.forEach((item, index) => {
      const dateStr = new Date(item.timestamp).toLocaleString('ja-JP', {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const trailSec = (item.metrics.trailTime / 1000).toFixed(2);
      const m = item.metrics;
      const card = document.createElement('div');
      card.className = 'history-item-card';
      card.innerHTML = `
        <div class="history-item-header">
          <div>
            <span class="history-item-date">${dateStr}</span>
            <span style="font-size: 0.8rem; margin-left: 0.5rem; font-weight: 700; color: var(--app-brown);">
              酔い度: ${item.soberScore}%
            </span>
          </div>
          <span class="history-item-badge badge-after">${item.statusTitle || '診断結果'}</span>
        </div>
        <div class="history-metrics-grid">
          <div>反応速度: <span class="history-metric-val">${m.reflex} ms</span></div>
          <div>色認知: <span class="history-metric-val">${m.stroopAccuracy}% (${(m.stroopTime/1000).toFixed(2)}秒)</span></div>
          <div>短期記憶: <span class="history-metric-val">${m.memory} 点</span></div>
          <div>探索視野: <span class="history-metric-val">${trailSec} 秒</span></div>
          ${m.timePerceptionDiff !== undefined ? `<div>時間感覚: <span class="history-metric-val">±${((m.timePerceptionDiff)/1000).toFixed(2)} 秒</span></div>` : ''}
          ${m.riskCount !== undefined ? `<div>リスク選択: <span class="history-metric-val">${m.riskCount} / 5回</span></div>` : ''}
          ${m.dualReflex !== undefined ? `<div>二重課題: <span class="history-metric-val">${m.dualReflex} ms (ミス${m.dualMistakes||0})</span></div>` : ''}
        </div>
        <div class="history-item-actions">
          <button type="button" class="btn-history-action btn-del" data-type="after" data-index="${index}">削除</button>
        </div>
      `;

      const btnDel = card.querySelector('.btn-del');
      btnDel.onclick = () => {
        if (confirm(`${dateStr} の診断結果を削除しますか？`)) {
          deleteAfterItem(index);
        }
      };

      elHistoryListContainer.appendChild(card);
    });
  }

  function deleteBaselineItem(index) {
    const list = getBaselineList();
    list.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_BASELINE_LIST, JSON.stringify(list));
    updateBaselineBadge();
    renderHistoryModalView();
  }

  function deleteAfterItem(index) {
    const list = getAfterList();
    list.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_AFTER_LIST, JSON.stringify(list));
    renderHistoryModalView();
  }

  function handleClearAllTabHistory() {
    if (currentHistoryTab === 'before') {
      if (confirm('飲む前（基準）の履歴をすべて消去しますか？')) {
        localStorage.removeItem(STORAGE_KEY_BASELINE_LIST);
        localStorage.removeItem(STORAGE_KEY_ACTIVE_BASE_ID);
        updateBaselineBadge();
        renderHistoryModalView();
      }
    } else {
      if (confirm('飲んだ後の診断履歴をすべて消去しますか？')) {
        localStorage.removeItem(STORAGE_KEY_AFTER_LIST);
        renderHistoryModalView();
      }
    }
  }

  // ==========================================================================
  // テストフロー制御
  // ==========================================================================
  function startTestFlow(mode) {
    currentMode = mode;
    currentStep = 1;
    sessionResults = {
      reflexTimes: [],
      stroopTotal: 10,
      stroopCorrect: 0,
      stroopTimes: [],
      memoryRounds: 3,
      memoryScore: 0,
      trailTime: 0,
      timeDiffs: [],
      riskChoices: [],
      riskTimes: [],
      dualTimes: [],
      dualMistakes: 0
    };

    elHomeView.style.display = 'none';
    elResultScreen.style.display = 'none';
    elTestScreen.style.display = 'block';

    prepareStepWithIntro(currentStep);
  }

  function prepareStepWithIntro(step) {
    currentStep = step;
    elProgressFill.style.width = `${((step - 1) / 7) * 100}%`;

    elActiveTestWorkspace.style.display = 'none';
    elCountdownOverlay.style.display = 'none';
    elStepIntroOverlay.style.display = 'block';

    const info = STEP_RULES[step];
    elIntroStepBadge.textContent = info.badge;
    elIntroStepTitle.textContent = info.title;

    elIntroRuleList.innerHTML = '';
    info.rules.forEach(r => {
      const item = document.createElement('div');
      item.className = 'step-rule-item';
      item.innerHTML = `<span class="step-rule-icon">${r.icon}</span><span>${r.text}</span>`;
      elIntroRuleList.appendChild(item);
    });

    elTestScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function startStepCountdown(step) {
    elStepIntroOverlay.style.display = 'none';
    elCountdownOverlay.style.display = 'flex';

    let count = 3;
    elCountdownNumber.textContent = count;
    elCountdownMsg.textContent = '呼吸をととのえて、準備してください…';

    const countTimer = setInterval(() => {
      count--;
      if (count > 0) {
        elCountdownNumber.textContent = count;
      } else if (count === 0) {
        elCountdownNumber.textContent = 'START!';
        elCountdownMsg.textContent = 'スタート！';
      } else {
        clearInterval(countTimer);
        elCountdownOverlay.style.display = 'none';
        launchStepActualTest(step);
      }
    }, 900);
  }

  function launchStepActualTest(step) {
    elProgressFill.style.width = `${(step / 7) * 100}%`;
    elActiveTestWorkspace.style.display = 'block';

    const info = STEP_RULES[step];
    elStepLabel.textContent = `STEP ${step} / 7`;
    elStepTitle.textContent = info.title;
    elStepInst.textContent = info.inst;

    // 全エリアを一旦非表示
    elReflexArea.style.display = 'none';
    elStroopArea.style.display = 'none';
    elMemoryArea.style.display = 'none';
    elTrailArea.style.display = 'none';
    elTimeArea.style.display = 'none';
    elRiskArea.style.display = 'none';
    elDualArea.style.display = 'none';

    if (step === 1) {
      elReflexArea.style.display = 'block';
      initReflexTest();
    } else if (step === 2) {
      elStroopArea.style.display = 'block';
      initStroopTest();
    } else if (step === 3) {
      elMemoryArea.style.display = 'block';
      initMemoryTest();
    } else if (step === 4) {
      elTrailArea.style.display = 'block';
      initTrailTest();
    } else if (step === 5) {
      elTimeArea.style.display = 'block';
      initTimeTest();
    } else if (step === 6) {
      elRiskArea.style.display = 'block';
      initRiskTest();
    } else if (step === 7) {
      elDualArea.style.display = 'block';
      initDualTest();
    }
  }

  function nextStep() {
    if (currentStep < 7) {
      prepareStepWithIntro(currentStep + 1);
    } else {
      finishAllTests();
    }
  }

  // ==========================================================================
  // テスト1：反射神経テスト (5回測定・トリム平均)
  // ==========================================================================
  let reflexState = 'ready';
  let reflexStartTime = 0;
  let reflexTimer = null;
  let reflexCount = 0;

  function initReflexTest() {
    reflexCount = 0;
    sessionResults.reflexTimes = [];
    setupReflexBox();
  }

  function setupReflexBox() {
    const box = document.getElementById('reflex-interactive-box');
    const mainText = document.getElementById('reflex-main-text');
    const subText = document.getElementById('reflex-sub-text');

    box.className = 'reflex-box state-ready';
    mainText.textContent = `タップして計測開始 (${reflexCount + 1} / 5回目)`;
    subText.textContent = 'タップすると赤色（待機中）に変わります';
    reflexState = 'ready';

    box.onclick = handleReflexClick;
  }

  function handleReflexClick() {
    const box = document.getElementById('reflex-interactive-box');
    const mainText = document.getElementById('reflex-main-text');
    const subText = document.getElementById('reflex-sub-text');

    if (reflexState === 'ready') {
      reflexState = 'wait';
      box.className = 'reflex-box state-wait';
      mainText.textContent = '赤色のまま待機…';
      subText.textContent = '緑色に変わったら素早くタップ！';

      const delay = 1600 + Math.random() * 2400;
      reflexTimer = setTimeout(() => {
        reflexState = 'click';
        box.className = 'reflex-box state-click';
        mainText.textContent = '今すぐタップ！';
        subText.textContent = '素早く！';
        reflexStartTime = performance.now();
      }, delay);

    } else if (reflexState === 'wait') {
      clearTimeout(reflexTimer);
      reflexState = 'early';
      box.className = 'reflex-box state-early';
      mainText.textContent = '少し早すぎました！';
      subText.textContent = '緑色に変わるまで待ってください。タップしてやり直します。';

    } else if (reflexState === 'early') {
      reflexState = 'ready';
      setupReflexBox();

    } else if (reflexState === 'click') {
      const elapsed = Math.round(performance.now() - reflexStartTime);
      sessionResults.reflexTimes.push(elapsed);
      reflexCount++;

      box.className = 'reflex-box state-ready';
      mainText.textContent = `${elapsed} ms (ミリ秒) !`;

      if (reflexCount < 5) {
        subText.textContent = `計測完了。画面をタップして次の回 (${reflexCount + 1}回目) へ進みます`;
        reflexState = 'ready';
      } else {
        subText.textContent = '5回の反射神経テストが完了しました！次のステップへ進みます…';
        box.onclick = null;
        setTimeout(() => nextStep(), 1200);
      }
    }
  }

  // ==========================================================================
  // テスト2：ストループ認知テスト (動的生成・全10問)
  // ==========================================================================
  let stroopItems = [];
  let stroopIndex = 0;
  let stroopQuestionStartTime = 0;
  let stroopLiveTimerInterval = null;

  function initStroopTest() {
    stroopIndex = 0;
    sessionResults.stroopCorrect = 0;
    sessionResults.stroopTimes = [];
    
    // 毎回ランダムに10問生成（学習効果による暗記を排除）
    const words = ['あか', 'あお', 'みどり', 'きいろ'];
    const colorMap = {
      'あか': { name: '赤', hex: '#D95D39' },
      'あお': { name: '青', hex: '#3A7CA5' },
      'みどり': { name: '緑', hex: '#439A86' },
      'きいろ': { name: '黄', hex: '#E09F3E' }
    };
    stroopItems = [];
    for (let i = 0; i < 10; i++) {
      const textKey = words[Math.floor(Math.random() * words.length)];
      let colorKey;
      do {
        colorKey = words[Math.floor(Math.random() * words.length)];
      } while (colorKey === textKey);
      stroopItems.push({
        text: textKey,
        color: colorMap[colorKey].hex,
        colorName: colorMap[colorKey].name
      });
    }

    showNextStroopQuestion();
  }

  function showNextStroopQuestion() {
    clearInterval(stroopLiveTimerInterval);

    if (stroopIndex >= stroopItems.length) {
      setTimeout(() => nextStep(), 600);
      return;
    }

    const item = stroopItems[stroopIndex];
    const wordEl = document.getElementById('stroop-word');
    wordEl.textContent = item.text;
    wordEl.style.color = item.color;

    document.getElementById('stroop-q-num').textContent = `問題 ${stroopIndex + 1} / ${stroopItems.length}`;
    
    const timerEl = document.getElementById('stroop-live-timer');
    timerEl.textContent = '回答時間: 0.00 秒';

    const feedbackBadge = document.getElementById('stroop-feedback-badge');
    feedbackBadge.className = 'stroop-feedback-badge';

    const colors = ['赤', '青', '緑', '黄'];
    colors.sort(() => Math.random() - 0.5);

    const btnWrap = document.getElementById('stroop-options');
    btnWrap.innerHTML = '';
    colors.forEach(col => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stroop-btn';
      btn.textContent = col;
      btn.onclick = () => handleStroopAnswer(col, item.colorName);
      btnWrap.appendChild(btn);
    });

    stroopQuestionStartTime = performance.now();

    stroopLiveTimerInterval = setInterval(() => {
      const currentElapsed = (performance.now() - stroopQuestionStartTime) / 1000;
      timerEl.textContent = `回答時間: ${currentElapsed.toFixed(2)} 秒`;
    }, 15);
  }

  function handleStroopAnswer(selected, correct) {
    clearInterval(stroopLiveTimerInterval);
    const elapsed = Math.round(performance.now() - stroopQuestionStartTime);
    sessionResults.stroopTimes.push(elapsed);

    const isCorrect = (selected === correct);
    if (isCorrect) {
      sessionResults.stroopCorrect++;
    }

    const feedbackBadge = document.getElementById('stroop-feedback-badge');
    const secStr = (elapsed / 1000).toFixed(2);
    if (isCorrect) {
      feedbackBadge.textContent = `正解！ (${secStr}秒)`;
      feedbackBadge.className = 'stroop-feedback-badge show-correct';
    } else {
      feedbackBadge.textContent = `不正解… 正しい色は「${correct}」 (${secStr}秒)`;
      feedbackBadge.className = 'stroop-feedback-badge show-wrong';
    }

    document.querySelectorAll('.stroop-btn').forEach(b => b.disabled = true);

    stroopIndex++;
    setTimeout(() => {
      showNextStroopQuestion();
    }, 600);
  }

  // ==========================================================================
  // テスト3：短期記憶・パネル順序テスト (全3問・3手→4手→5手)
  // ==========================================================================
  let memoryRound = 0;
  let memorySequence = [];
  let userSequenceIndex = 0;
  let isMemoryInputActive = false;

  function initMemoryTest() {
    memoryRound = 0;
    sessionResults.memoryScore = 0;
    setupMemoryGrid();
    startMemoryRound();
  }

  function setupMemoryGrid() {
    const grid = document.getElementById('memory-grid-container');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const tile = document.createElement('div');
      tile.className = 'memory-tile';
      tile.dataset.index = i;
      tile.onclick = () => handleMemoryTileClick(i);
      grid.appendChild(tile);
    }
  }

  function startMemoryRound() {
    isMemoryInputActive = false;
    userSequenceIndex = 0;
    const qStatus = document.getElementById('memory-status-text');
    qStatus.textContent = `第 ${memoryRound + 1} / 3 問: タイルが光る順番を覚えてください…`;

    // 段階的に手数増加 (3手 → 4手 → 5手)
    const seqLen = 3 + memoryRound;
    memorySequence = [];
    for (let i = 0; i < seqLen; i++) {
      memorySequence.push(Math.floor(Math.random() * 9));
    }

    let step = 0;
    const tiles = document.querySelectorAll('.memory-tile');

    const flashTimer = setInterval(() => {
      if (step < memorySequence.length) {
        const tIdx = memorySequence[step];
        const tile = tiles[tIdx];
        tile.classList.add('active-flash');
        setTimeout(() => {
          tile.classList.remove('active-flash');
        }, 380);
        step++;
      } else {
        clearInterval(flashTimer);
        setTimeout(() => {
          isMemoryInputActive = true;
          qStatus.textContent = `覚えた順番通りにタイルをタップしてください！（全${seqLen}手）`;
        }, 450);
      }
    }, 650);
  }

  function handleMemoryTileClick(index) {
    if (!isMemoryInputActive) return;

    const tiles = document.querySelectorAll('.memory-tile');
    const tile = tiles[index];
    tile.classList.add('user-clicked');
    setTimeout(() => tile.classList.remove('user-clicked'), 250);

    if (index === memorySequence[userSequenceIndex]) {
      userSequenceIndex++;
      if (userSequenceIndex >= memorySequence.length) {
        // 1問正解につき約33.3点 (3問全正解で100点)
        sessionResults.memoryScore += (memoryRound === 2 ? 34 : 33);
        isMemoryInputActive = false;
        memoryRound++;
        if (memoryRound < 3) {
          document.getElementById('memory-status-text').textContent = '素晴らしい！正解です。次の問題へ進みます。';
          setTimeout(() => startMemoryRound(), 1100);
        } else {
          document.getElementById('memory-status-text').textContent = '記憶テスト完了！次のステップへ進みます。';
          setTimeout(() => nextStep(), 1100);
        }
      }
    } else {
      isMemoryInputActive = false;
      memoryRound++;
      document.getElementById('memory-status-text').textContent = 'おしい！順番が違いました。';
      if (memoryRound < 3) {
        setTimeout(() => startMemoryRound(), 1200);
      } else {
        setTimeout(() => nextStep(), 1200);
      }
    }
  }

  // ==========================================================================
  // テスト4：視野・数字探索テスト (1〜8 順番タップ)
  // ==========================================================================
  let trailTargetNumber = 1;
  let trailStartTime = 0;
  let trailTimerInterval = null;

  function initTrailTest() {
    trailTargetNumber = 1;
    clearInterval(trailTimerInterval);

    const area = document.getElementById('trail-interactive-area');
    const targetIndicator = document.getElementById('trail-next-target');
    const timerEl = document.getElementById('trail-live-timer');

    targetIndicator.textContent = '1';
    timerEl.textContent = '経過時間: 0.00 秒';
    area.innerHTML = '';

    const rect = area.getBoundingClientRect();
    const areaW = Math.max(300, rect.width || 360);
    const areaH = Math.max(260, rect.height || 300);

    const cols = 4;
    const rows = 2;
    const cellW = (areaW - 60) / cols;
    const cellH = (areaH - 60) / rows;

    const cellIndices = [0, 1, 2, 3, 4, 5, 6, 7];
    cellIndices.sort(() => Math.random() - 0.5);

    const bubbles = [];
    for (let num = 1; num <= 8; num++) {
      const cellIdx = cellIndices[num - 1];
      const c = cellIdx % cols;
      const r = Math.floor(cellIdx / cols);

      const posX = 30 + c * cellW + cellW * 0.5 + (Math.random() - 0.5) * (cellW * 0.35);
      const posY = 30 + r * cellH + cellH * 0.5 + (Math.random() - 0.5) * (cellH * 0.35);

      const bubble = document.createElement('div');
      bubble.className = 'trail-bubble';
      bubble.textContent = num;
      bubble.style.left = `${posX}px`;
      bubble.style.top = `${posY}px`;

      bubble.onclick = () => handleTrailBubbleClick(num, bubble);
      area.appendChild(bubble);
      bubbles.push(bubble);
    }

    trailStartTime = performance.now();
    trailTimerInterval = setInterval(() => {
      const elapsed = (performance.now() - trailStartTime) / 1000;
      timerEl.textContent = `経過時間: ${elapsed.toFixed(2)} 秒`;
    }, 15);
  }

  function handleTrailBubbleClick(num, bubbleEl) {
    if (num === trailTargetNumber) {
      bubbleEl.classList.add('tapped-done');
      trailTargetNumber++;

      const targetIndicator = document.getElementById('trail-next-target');
      if (trailTargetNumber <= 8) {
        targetIndicator.textContent = trailTargetNumber;
      } else {
        clearInterval(trailTimerInterval);
        const elapsedMs = Math.round(performance.now() - trailStartTime);
        sessionResults.trailTime = elapsedMs;

        targetIndicator.textContent = '完了！';
        const timerEl = document.getElementById('trail-live-timer');
        timerEl.textContent = `クリア！ ${(elapsedMs/1000).toFixed(2)} 秒`;

        setTimeout(() => nextStep(), 800);
      }
    } else {
      bubbleEl.classList.remove('error-shake');
      void bubbleEl.offsetWidth;
      bubbleEl.classList.add('error-shake');
    }
  }

  // ==========================================================================
  // テスト5：時間感覚テスト (主観的10秒ストップ・全2回・タブ切り替え検知)
  // ==========================================================================
  let timeTestRound = 0;
  let timeMeasureStartTime = 0;
  let isTimeMeasuring = false;

  function initTimeTest() {
    timeTestRound = 0;
    sessionResults.timeDiffs = [];
    setupTimeRoundView();
  }

  function setupTimeRoundView() {
    isTimeMeasuring = false;
    document.getElementById('time-round-label').textContent = `計測 ${timeTestRound + 1} / 2 回目`;
    document.getElementById('time-warning-msg').style.display = 'none';
    document.getElementById('time-feedback-box').style.display = 'none';

    const btnStart = document.getElementById('btn-time-start');
    const btnStop = document.getElementById('btn-time-stop');

    btnStart.style.display = 'inline-block';
    btnStop.style.display = 'none';

    btnStart.onclick = handleTimeStart;
    btnStop.onclick = handleTimeStop;
  }

  function handleTimeStart() {
    isTimeMeasuring = true;
    timeMeasureStartTime = performance.now();

    document.getElementById('btn-time-start').style.display = 'none';
    document.getElementById('btn-time-stop').style.display = 'inline-block';
  }

  function handleTimeStop() {
    if (!isTimeMeasuring) return;
    isTimeMeasuring = false;

    const elapsedMs = performance.now() - timeMeasureStartTime;
    const diffMs = Math.abs(elapsedMs - 10000);
    sessionResults.timeDiffs.push(diffMs);

    const btnStop = document.getElementById('btn-time-stop');
    btnStop.style.display = 'none';

    const feedbackBox = document.getElementById('time-feedback-box');
    feedbackBox.style.display = 'block';
    const actualSec = (elapsedMs / 1000).toFixed(2);
    const diffSec = (diffMs / 1000).toFixed(2);

    feedbackBox.innerHTML = `
      <strong>計測結果:</strong> あなたの感覚: <strong>${actualSec} 秒</strong> (目標10秒とのズレ: <strong>±${diffSec} 秒</strong>)
    `;

    timeTestRound++;
    if (timeTestRound < 2) {
      setTimeout(() => setupTimeRoundView(), 1800);
    } else {
      setTimeout(() => nextStep(), 1800);
    }
  }

  // タブ切り替えによる不正・測定ブレ防止
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isTimeMeasuring && currentStep === 5) {
      isTimeMeasuring = false;
      const warningEl = document.getElementById('time-warning-msg');
      if (warningEl) {
        warningEl.style.display = 'block';
      }
      const btnStart = document.getElementById('btn-time-start');
      const btnStop = document.getElementById('btn-time-stop');
      if (btnStart && btnStop) {
        btnStart.style.display = 'inline-block';
        btnStop.style.display = 'none';
      }
    }
  });

  // ==========================================================================
  // テスト6：リスク判断テスト (簡易ギャンブリング課題・全5問)
  // ==========================================================================
  let riskRoundIndex = 0;
  let riskRoundStartTime = 0;
  let riskCurrentPoints = 0;

  function initRiskTest() {
    riskRoundIndex = 0;
    riskCurrentPoints = 0;
    sessionResults.riskChoices = [];
    sessionResults.riskTimes = [];
    document.getElementById('risk-total-pts').textContent = '0';
    document.getElementById('risk-feedback-msg').style.display = 'none';

    setupRiskQuestion();
  }

  function setupRiskQuestion() {
    if (riskRoundIndex >= 5) {
      setTimeout(() => nextStep(), 800);
      return;
    }

    document.getElementById('risk-q-num').textContent = `試行 ${riskRoundIndex + 1} / 5`;
    document.getElementById('risk-feedback-msg').style.display = 'none';

    const btnSafe = document.getElementById('btn-risk-safe');
    const btnGamble = document.getElementById('btn-risk-gamble');

    btnSafe.disabled = false;
    btnGamble.disabled = false;

    btnSafe.onclick = () => handleRiskChoice('safe');
    btnGamble.onclick = () => handleRiskChoice('gamble');

    riskRoundStartTime = performance.now();
  }

  function handleRiskChoice(choice) {
    const decisionTime = Math.round(performance.now() - riskRoundStartTime);
    sessionResults.riskChoices.push(choice);
    sessionResults.riskTimes.push(decisionTime);

    const btnSafe = document.getElementById('btn-risk-safe');
    const btnGamble = document.getElementById('btn-risk-gamble');
    btnSafe.disabled = true;
    btnGamble.disabled = true;

    const feedbackEl = document.getElementById('risk-feedback-msg');
    feedbackEl.style.display = 'block';

    if (choice === 'safe') {
      riskCurrentPoints += 10;
      feedbackEl.textContent = `【安全】確実に +10 pt 獲得！ (決定時間: ${(decisionTime/1000).toFixed(2)}秒)`;
      feedbackEl.style.backgroundColor = 'var(--app-sage-light)';
    } else {
      const isWin = Math.random() < 0.5;
      if (isWin) {
        riskCurrentPoints += 30;
        feedbackEl.textContent = `【リスク成功】+30 pt 獲得！ (決定時間: ${(decisionTime/1000).toFixed(2)}秒)`;
        feedbackEl.style.backgroundColor = 'var(--app-peach-light)';
      } else {
        feedbackEl.textContent = `【リスク失敗】0 pt でした… (決定時間: ${(decisionTime/1000).toFixed(2)}秒)`;
        feedbackEl.style.backgroundColor = 'rgba(106, 86, 74, 0.08)';
      }
    }

    document.getElementById('risk-total-pts').textContent = riskCurrentPoints;

    riskRoundIndex++;
    setTimeout(() => setupRiskQuestion(), 1000);
  }

  // ==========================================================================
  // テスト7：二重課題テスト (ながら反射神経・Go/No-Go 4試行)
  // STEP 1 のロジックを再利用し、数字表示と3の倍数ルール判定を追加
  // ==========================================================================
  let dualCount = 0;
  let dualState = 'ready';
  let dualStartTime = 0;
  let dualTimer = null;
  let dualActiveNumber = 5;
  let dualNoGoWaitTimer = null;

  function initDualTest() {
    dualCount = 0;
    sessionResults.dualTimes = [];
    sessionResults.dualMistakes = 0;
    setupDualBox();
  }

  function setupDualBox() {
    const box = document.getElementById('dual-interactive-box');
    const mainText = document.getElementById('dual-main-text');
    const subText = document.getElementById('dual-sub-text');
    const numEl = document.getElementById('dual-active-number');
    const roundLabel = document.getElementById('dual-round-label');
    const errorBadge = document.getElementById('dual-error-counter');

    roundLabel.textContent = `試行 ${dualCount + 1} / 4`;
    errorBadge.textContent = `お手つき: ${sessionResults.dualMistakes}回`;

    box.className = 'reflex-box state-ready';
    mainText.textContent = `タップして計測開始 (${dualCount + 1} / 4回目)`;
    subText.textContent = 'タップすると赤色（待機中）になり、数字が表示されます';
    dualState = 'ready';

    // ランダムな初期数字
    dualActiveNumber = Math.floor(Math.random() * 9) + 1;
    numEl.textContent = dualActiveNumber;

    box.onclick = handleDualClick;
  }

  function handleDualClick() {
    const box = document.getElementById('dual-interactive-box');
    const mainText = document.getElementById('dual-main-text');
    const subText = document.getElementById('dual-sub-text');
    const numEl = document.getElementById('dual-active-number');
    const errorBadge = document.getElementById('dual-error-counter');

    if (dualState === 'ready') {
      dualState = 'wait';
      box.className = 'reflex-box state-wait';
      mainText.textContent = '赤色のまま待機…';
      subText.textContent = '数字を確認！緑に変わっても3の倍数(3,6,9)ならタップ禁止！';

      // 4試行中、偶数回は3の倍数、奇数回は3の倍数以外にするなどのバランス調整
      const isNoGoRound = (dualCount % 2 === 1);
      if (isNoGoRound) {
        const noGoNums = [3, 6, 9];
        dualActiveNumber = noGoNums[Math.floor(Math.random() * noGoNums.length)];
      } else {
        const goNums = [1, 2, 4, 5, 7, 8];
        dualActiveNumber = goNums[Math.floor(Math.random() * goNums.length)];
      }
      numEl.textContent = dualActiveNumber;

      const delay = 1600 + Math.random() * 2000;
      dualTimer = setTimeout(() => {
        dualState = 'click';
        box.className = 'reflex-box state-click';
        mainText.textContent = '緑になりました！';
        subText.textContent = (dualActiveNumber % 3 === 0) ? '※3の倍数です！タップしてはいけません！' : '3の倍数ではないので今すぐタップ！';
        dualStartTime = performance.now();

        // 3の倍数の場合、タップせずに1.8秒耐えたら「我慢成功」としてクリア
        if (dualActiveNumber % 3 === 0) {
          dualNoGoWaitTimer = setTimeout(() => {
            if (dualState === 'click') {
              dualCount++;
              box.className = 'reflex-box state-ready';
              mainText.textContent = '見事な抑制！正解です';
              subText.textContent = '3の倍数を見極めて我慢できました。';
              if (dualCount < 4) {
                setTimeout(() => setupDualBox(), 1200);
              } else {
                setTimeout(() => finishAllTests(), 1200);
              }
            }
          }, 1800);
        }
      }, delay);

    } else if (dualState === 'wait') {
      clearTimeout(dualTimer);
      dualState = 'early';
      box.className = 'reflex-box state-early';
      mainText.textContent = '少し早すぎました！';
      subText.textContent = '緑色に変わるまで待ってください。タップしてやり直します。';

    } else if (dualState === 'early') {
      dualState = 'ready';
      setupDualBox();

    } else if (dualState === 'click') {
      clearTimeout(dualNoGoWaitTimer);
      const elapsed = Math.round(performance.now() - dualStartTime);

      if (dualActiveNumber % 3 === 0) {
        // 3の倍数なのにタップしてしまった（お手つき）
        sessionResults.dualMistakes++;
        errorBadge.textContent = `お手つき: ${sessionResults.dualMistakes}回`;
        dualCount++;

        box.className = 'reflex-box state-early';
        mainText.textContent = 'お手つき！3の倍数でした';
        subText.textContent = `数字が「${dualActiveNumber}」の時はタップ禁止でした。次へ進みます。`;

        if (dualCount < 4) {
          setTimeout(() => setupDualBox(), 1400);
        } else {
          setTimeout(() => finishAllTests(), 1400);
        }
      } else {
        // 正常なGoタップ
        sessionResults.dualTimes.push(elapsed);
        dualCount++;

        box.className = 'reflex-box state-ready';
        mainText.textContent = `${elapsed} ms (ミリ秒) !`;

        if (dualCount < 4) {
          subText.textContent = `計測完了。次の試行 (${dualCount + 1}回目) へ進みます`;
          setTimeout(() => setupDualBox(), 1200);
        } else {
          subText.textContent = '全テストが終了しました！診断結果を作成します…';
          box.onclick = null;
          setTimeout(() => finishAllTests(), 1200);
        }
      }
    }
  }

  // ==========================================================================
  // 全テスト完了・集計＆履歴保存＆診断
  // ==========================================================================
  function finishAllTests() {
    elTestScreen.style.display = 'none';

    // 1. 反射神経：トリム平均 (5回中、最速と最遅を除外した3回の平均)
    let avgReflex = STANDARD_AVERAGES.reflex;
    if (sessionResults.reflexTimes.length >= 5) {
      const sorted = [...sessionResults.reflexTimes].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, 4);
      avgReflex = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
    } else if (sessionResults.reflexTimes.length > 0) {
      avgReflex = Math.round(sessionResults.reflexTimes.reduce((a, b) => a + b, 0) / sessionResults.reflexTimes.length);
    }

    // 2. ストループ：正答率 & 平均回答時間
    const stroopAcc = Math.round((sessionResults.stroopCorrect / sessionResults.stroopTotal) * 100);
    const avgStroopTime = sessionResults.stroopTimes.length > 0
      ? Math.round(sessionResults.stroopTimes.reduce((a, b) => a + b, 0) / sessionResults.stroopTimes.length)
      : STANDARD_AVERAGES.stroopTime;

    // 3. 短期記憶：容量スコア (0〜100点)
    const memoryScore = sessionResults.memoryScore;

    // 4. 探索処理：クリア所要時間 (ms)
    const trailScore = sessionResults.trailTime || STANDARD_AVERAGES.trailTime;

    // 5. 時間感覚：目標10秒との平均絶対誤差 (ms)
    const avgTimeDiff = sessionResults.timeDiffs.length > 0
      ? Math.round(sessionResults.timeDiffs.reduce((a, b) => a + b, 0) / sessionResults.timeDiffs.length)
      : STANDARD_AVERAGES.timePerceptionDiff;

    // 6. リスク判断：リスク選択数(0〜5) & 平均決定時間 (ms)
    const riskCount = sessionResults.riskChoices.filter(c => c === 'gamble').length;
    const avgRiskTime = sessionResults.riskTimes.length > 0
      ? Math.round(sessionResults.riskTimes.reduce((a, b) => a + b, 0) / sessionResults.riskTimes.length)
      : STANDARD_AVERAGES.riskDecisionTime;

    // 7. 二重課題：Go時平均反応時間 (ms) & お手つき回数
    const avgDualTime = sessionResults.dualTimes.length > 0
      ? Math.round(sessionResults.dualTimes.reduce((a, b) => a + b, 0) / sessionResults.dualTimes.length)
      : (avgReflex + 70);
    const dualMistakes = sessionResults.dualMistakes;

    const currentMetrics = {
      id: 'metric_' + Date.now(),
      reflex: avgReflex,
      stroopAccuracy: stroopAcc,
      stroopTime: avgStroopTime,
      memory: memoryScore,
      trailTime: trailScore,
      timePerceptionDiff: avgTimeDiff,
      riskCount: riskCount,
      riskDecisionTime: avgRiskTime,
      dualReflex: avgDualTime,
      dualMistakes: dualMistakes,
      timestamp: Date.now()
    };

    if (currentMode === 'baseline') {
      const list = getBaselineList();
      list.unshift(currentMetrics);
      const trimmed = list.slice(0, 10);
      localStorage.setItem(STORAGE_KEY_BASELINE_LIST, JSON.stringify(trimmed));
      localStorage.setItem(STORAGE_KEY_ACTIVE_BASE_ID, currentMetrics.id);

      updateBaselineBadge();
      renderBaselineDoneScreen(currentMetrics);
    } else {
      let base = STANDARD_AVERAGES;
      const activeRecord = getActiveBaselineRecord();
      if (activeRecord && currentMode === 'soberTest') {
        base = activeRecord;
      }
      renderDiagnosisScreen(currentMetrics, base);
    }
  }

  // 飲む前基準値の保存完了画面
  function renderBaselineDoneScreen(metrics) {
    elResultScreen.style.display = 'block';

    const titleEl = document.getElementById('result-status-title');
    const badgeEl = document.getElementById('result-badge-text');
    const scoreNumEl = document.getElementById('result-score-num');
    const scoreUnitEl = document.getElementById('result-score-unit');
    const warmMsgEl = document.getElementById('result-warm-msg');

    badgeEl.textContent = '飲む前の基準値（ベースライン）';
    badgeEl.style.backgroundColor = 'var(--app-sage)';
    titleEl.textContent = '基準スコアの記録が完了しました';
    scoreNumEl.textContent = '100';
    scoreUnitEl.textContent = '点（シラフ平常時）';

    const count = getBaselineList().length;
    warmMsgEl.textContent = `あなたの平常時の基準データを記録しました（履歴保存: ${count}/10件）。お酒を飲んだ後に「飲んだ後テスト」を行うと、この基準値と比較して現在の酔い度を客観的・正確に判定できます。楽しい時間をお過ごしくださいね。`;

    renderMetricsTable(metrics, null);
    drawRadarChart(metrics, null);

    document.getElementById('care-advice-section').style.display = 'none';
  }

  // 飲酒後／クイックの酔い診断結果画面 & 履歴保存
  function renderDiagnosisScreen(curr, base) {
    elResultScreen.style.display = 'block';
    document.getElementById('care-advice-section').style.display = 'block';

    // 各能力の低下率・変化率の算出（古い基準データでも安全にフォールバック）
    const bReflex = base.reflex || STANDARD_AVERAGES.reflex;
    const bStroopAcc = base.stroopAccuracy || STANDARD_AVERAGES.stroopAccuracy;
    const bStroopTime = base.stroopTime || STANDARD_AVERAGES.stroopTime;
    const bMemory = base.memory !== undefined ? base.memory : STANDARD_AVERAGES.memory;
    const bTrail = base.trailTime || STANDARD_AVERAGES.trailTime;
    const bTimeDiff = base.timePerceptionDiff || STANDARD_AVERAGES.timePerceptionDiff;
    const bRiskCount = base.riskCount !== undefined ? base.riskCount : STANDARD_AVERAGES.riskCount;
    const bRiskTime = base.riskDecisionTime || STANDARD_AVERAGES.riskDecisionTime;
    const bDualReflex = base.dualReflex || STANDARD_AVERAGES.dualReflex;

    // 1. 反射速度低下率 (重み 15%)
    const reflexDrop = Math.max(0, (curr.reflex - bReflex) / bReflex);

    // 2. 認知抑制低下率 (重み 20%): 正答率低下と判断時間遅延の合成
    const stroopAccDrop = Math.max(0, (bStroopAcc - curr.stroopAccuracy) / 100);
    const stroopTimeDrop = Math.max(0, (curr.stroopTime - bStroopTime) / bStroopTime);
    const cognitionDrop = stroopAccDrop * 0.4 + stroopTimeDrop * 0.6;

    // 3. 短期記憶低下率 (重み 15%)
    const memoryDrop = Math.max(0, (bMemory - curr.memory) / 100);

    // 4. 探索処理遅延率 (重み 15%)
    const trailDrop = Math.max(0, (curr.trailTime - bTrail) / bTrail);

    // 5. 時間感覚誤差拡大率 (重み 10%)
    const timeDrop = Math.max(0, (curr.timePerceptionDiff - bTimeDiff) / Math.max(500, bTimeDiff));

    // 6. リスク判断の乖離度 (重み 10%): 平常時の選択数からのブレ＋迷い時間
    const riskChoiceShift = Math.abs(curr.riskCount - bRiskCount) / 5;
    const riskTimeShift = Math.max(0, (curr.riskDecisionTime - bRiskTime) / bRiskTime);
    const riskDrop = riskChoiceShift * 0.7 + riskTimeShift * 0.3;

    // 7. 二重課題の低下率 (重み 15%): 二重条件下での反応遅延拡大 ＋ お手つき回数
    const dualTimeDrop = Math.max(0, (curr.dualReflex - bDualReflex) / bDualReflex);
    const dualMistakePenalty = Math.min(1.0, curr.dualMistakes * 0.25);
    const dualDrop = dualTimeDrop * 0.6 + dualMistakePenalty * 0.4;

    const totalDrunkennessRatio = (
      reflexDrop * 0.15 +
      cognitionDrop * 0.20 +
      memoryDrop * 0.15 +
      trailDrop * 0.15 +
      timeDrop * 0.10 +
      riskDrop * 0.10 +
      dualDrop * 0.15
    );

    let soberScore = Math.min(100, Math.round(totalDrunkennessRatio * 160));
    if (soberScore < 10) soberScore = 5;

    const titleEl = document.getElementById('result-status-title');
    const badgeEl = document.getElementById('result-badge-text');
    const scoreNumEl = document.getElementById('result-score-num');
    const scoreUnitEl = document.getElementById('result-score-unit');
    const warmMsgEl = document.getElementById('result-warm-msg');

    scoreNumEl.textContent = soberScore;
    scoreUnitEl.textContent = '%（酔い度）';

    let statusText = '';
    if (soberScore <= 15) {
      badgeEl.textContent = 'シラフ状態';
      badgeEl.style.backgroundColor = 'var(--app-sage)';
      titleEl.textContent = 'ほとんど酔いは見られません';
      statusText = 'シラフ（平常）';
      warmMsgEl.textContent = '飲む前とほぼ変わらない極めてクリアな反応速度と判断力を保っています。まだまだ普段通りの冴えた状態です。この心地よいペースを大切にお過ごしくださいね。';
    } else if (soberScore <= 35) {
      badgeEl.textContent = 'ほんのりほろ酔い';
      badgeEl.style.backgroundColor = 'var(--app-blue)';
      titleEl.textContent = '心地よいリラックス状態です';
      statusText = 'ほんのりほろ酔い';
      warmMsgEl.textContent = '身体の緊張がふんわりとほぐれ、適度にリラックスできている素敵な状態です。感覚のわずかな変化はありますが、楽しくおしゃべりしたり音楽を楽しむのにちょうど良い時間ですね。';
    } else if (soberScore <= 55) {
      badgeEl.textContent = 'いい気分（適量期）';
      badgeEl.style.backgroundColor = '#E09F3E';
      titleEl.textContent = 'しっかりお酒が回っています';
      statusText = 'いい気分（適量）';
      warmMsgEl.textContent = 'ほろ酔い気分が広がり、視野や二重課題の反応にやわらかな遅れが出始めています。今が一番楽しいタイミングかもしれませんが、ここでお水をコップ1杯挟んであげると、明日の朝もスッキリ快適に過ごせますよ。';
    } else if (soberScore <= 75) {
      badgeEl.textContent = 'しっかり酔い（注意期）';
      badgeEl.style.backgroundColor = 'var(--app-peach)';
      titleEl.textContent = '身体が休息を求めています';
      statusText = 'しっかり酔い（注意）';
      warmMsgEl.textContent = '探索判断や二重課題、反応速度に明らかな影響が出ています。思考がおやすみモードに入ろうとしていますので、お酒はここまでに切り替えて、温かいお茶や水分をゆっくり補給しましょうね。';
    } else {
      badgeEl.textContent = 'おやすみ推奨（深酔い期）';
      badgeEl.style.backgroundColor = '#D95D39';
      titleEl.textContent = '今すぐゆっくり休みましょう';
      statusText = 'おやすみ推奨（深酔い）';
      warmMsgEl.textContent = 'かなりしっかりとお酒が身体を巡っています。無理をせず、座って深呼吸をして、水分をたっぷり摂って横になりましょう。今日はいっぱい楽しんだご褒美に、ぐっすり眠ってくださいね。';
    }

    // 飲んだ後の記録を履歴に保存（最大10件）
    const afterRecord = {
      id: 'after_' + Date.now(),
      timestamp: Date.now(),
      soberScore: soberScore,
      statusTitle: statusText,
      metrics: curr,
      baseUsed: {
        reflex: bReflex,
        stroopAccuracy: bStroopAcc,
        stroopTime: bStroopTime,
        memory: bMemory,
        trailTime: bTrail,
        timePerceptionDiff: bTimeDiff,
        riskCount: bRiskCount,
        riskDecisionTime: bRiskTime,
        dualReflex: bDualReflex
      }
    };
    const afterList = getAfterList();
    afterList.unshift(afterRecord);
    localStorage.setItem(STORAGE_KEY_AFTER_LIST, JSON.stringify(afterList.slice(0, 10)));

    renderMetricsTable(curr, base);
    drawRadarChart(curr, base);
    updateDrinkCareEstimate(1);
  }

  function renderMetricsTable(curr, base) {
    const listEl = document.getElementById('metrics-list-container');
    listEl.innerHTML = '';

    const createRow = (label, currentStr, diffStr, isDown) => {
      const row = document.createElement('div');
      row.className = 'metric-row';
      row.innerHTML = `
        <span class="metric-label">${label}</span>
        <div class="metric-values">
          <span class="metric-current">${currentStr}</span>
          ${diffStr ? `<span class="metric-diff ${isDown ? 'down' : 'same'}">${diffStr}</span>` : ''}
        </div>
      `;
      return row;
    };

    if (base) {
      const bReflex = base.reflex || STANDARD_AVERAGES.reflex;
      const bStroopAcc = base.stroopAccuracy || STANDARD_AVERAGES.stroopAccuracy;
      const bStroopTime = base.stroopTime || STANDARD_AVERAGES.stroopTime;
      const bMemory = base.memory !== undefined ? base.memory : STANDARD_AVERAGES.memory;
      const bTrail = base.trailTime || STANDARD_AVERAGES.trailTime;
      const bTimeDiff = base.timePerceptionDiff || STANDARD_AVERAGES.timePerceptionDiff;
      const bRiskCount = base.riskCount !== undefined ? base.riskCount : STANDARD_AVERAGES.riskCount;
      const bRiskTime = base.riskDecisionTime || STANDARD_AVERAGES.riskDecisionTime;
      const bDualReflex = base.dualReflex || STANDARD_AVERAGES.dualReflex;

      // 1. 反射速度
      const reflexDiff = curr.reflex - bReflex;
      const reflexText = reflexDiff > 0 ? `+${reflexDiff}ms 遅れ` : `${reflexDiff}ms 良好`;
      listEl.appendChild(createRow('1. 反射速度（トリム平均）', `${curr.reflex} ms`, reflexText, reflexDiff > 30));

      // 2. ストループ認知
      const accDiff = curr.stroopAccuracy - bStroopAcc;
      const timeDiff = curr.stroopTime - bStroopTime;
      const stroopDesc = `${curr.stroopAccuracy}% (平均 ${(curr.stroopTime/1000).toFixed(2)}秒)`;
      const diffText = (timeDiff > 0 ? `+${(timeDiff/1000).toFixed(2)}秒遅延` : '良好');
      listEl.appendChild(createRow('2. 認知抑制・判断速度', stroopDesc, diffText, timeDiff > 250 || accDiff < 0));

      // 3. 短期記憶
      const memDiff = curr.memory - bMemory;
      const memText = memDiff < 0 ? `${memDiff}点 低下` : `同等`;
      listEl.appendChild(createRow('3. 短期記憶容量', `${curr.memory} 点`, memText, memDiff < 0));

      // 4. 探索処理
      const trailDiff = curr.trailTime - bTrail;
      const trailSec = (curr.trailTime / 1000).toFixed(2);
      const trailDiffSec = (trailDiff / 1000).toFixed(2);
      const trailText = trailDiff > 0 ? `+${trailDiffSec}秒 遅延` : `スムーズ`;
      listEl.appendChild(createRow('4. 視野・探索速度', `${trailSec} 秒`, trailText, trailDiff > 1000));

      // 5. 時間感覚
      const timeErrSec = ((curr.timePerceptionDiff || 0) / 1000).toFixed(2);
      const bTimeErrSec = (bTimeDiff / 1000).toFixed(2);
      const timeDiffDelta = (curr.timePerceptionDiff || 0) - bTimeDiff;
      const timeDiffText = timeDiffDelta > 0 ? `+${(timeDiffDelta/1000).toFixed(2)}秒 ズレ拡大` : `体内時計安定`;
      listEl.appendChild(createRow('5. 時間感覚 (10秒の誤差)', `±${timeErrSec} 秒`, timeDiffText, timeDiffDelta > 500));

      // 6. リスク判断
      const riskShift = curr.riskCount - bRiskCount;
      const riskShiftText = riskShift !== 0 ? `${riskShift > 0 ? '+' : ''}${riskShift}回 普段と乖離` : `普段通り`;
      listEl.appendChild(createRow('6. リスク判断・衝動性', `リスク選択 ${curr.riskCount}/5回`, riskShiftText, Math.abs(riskShift) >= 2));

      // 7. 二重課題
      const dualDiff = curr.dualReflex - bDualReflex;
      const dualText = `${dualDiff > 0 ? `+${dualDiff}ms` : '良好'} (お手つき${curr.dualMistakes}回)`;
      listEl.appendChild(createRow('7. 二重課題（分割注意）', `${curr.dualReflex} ms`, dualText, dualDiff > 50 || curr.dualMistakes > 0));

    } else {
      listEl.appendChild(createRow('1. 反射速度（トリム平均）', `${curr.reflex} ms`, '基準値として保存', false));
      listEl.appendChild(createRow('2. 認知抑制・判断速度', `${curr.stroopAccuracy}% (平均 ${(curr.stroopTime/1000).toFixed(2)}秒)`, '基準値として保存', false));
      listEl.appendChild(createRow('3. 短期記憶容量', `${curr.memory} 点`, '基準値として保存', false));
      listEl.appendChild(createRow('4. 視野・探索速度', `${(curr.trailTime/1000).toFixed(2)} 秒`, '基準値として保存', false));
      listEl.appendChild(createRow('5. 時間感覚 (10秒の誤差)', `±${((curr.timePerceptionDiff || 0)/1000).toFixed(2)} 秒`, '基準値として保存', false));
      listEl.appendChild(createRow('6. リスク判断・衝動性', `リスク選択 ${curr.riskCount}/5回`, '基準値として保存', false));
      listEl.appendChild(createRow('7. 二重課題（分割注意）', `${curr.dualReflex} ms (お手つき${curr.dualMistakes}回)`, '基準値として保存', false));
    }
  }

  // ==========================================================================
  // 7軸レーダーチャート描画
  // ==========================================================================
  function drawRadarChart(curr, base) {
    const canvas = document.getElementById('sober-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const size = 320;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.35;

    ctx.clearRect(0, 0, size, size);

    const labels = ['反射速度', '認知抑制', '短期記憶', '探索処理', '時間感覚', 'リスク制御', '分割注意'];
    const totalAxes = labels.length;

    // グリッド線
    ctx.strokeStyle = 'rgba(106, 86, 74, 0.12)';
    ctx.lineWidth = 1;
    for (let level = 1; level <= 4; level++) {
      const r = (maxR / 4) * level;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 軸ラベル
    ctx.fillStyle = '#6A564A';
    ctx.font = 'bold 11px DotGothic16, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * maxR;
      const y = cy + Math.sin(angle) * maxR;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      const labelDist = maxR + 22;
      const lx = cx + Math.cos(angle) * labelDist;
      const ly = cy + Math.sin(angle) * labelDist;
      ctx.fillText(labels[i], lx, ly);
    }

    const getScores = (m) => {
      // 1. 反射速度
      const sReflex = Math.max(0.2, Math.min(1.0, 1.0 - (m.reflex - 180) / 320));
      // 2. 認知抑制
      const sCognition = Math.max(0.2, Math.min(1.0, (m.stroopAccuracy / 100) * 0.4 + (1.0 - Math.min(1.0, m.stroopTime / 2400)) * 0.6));
      // 3. 短期記憶
      const sMemory = Math.max(0.2, Math.min(1.0, m.memory / 100));
      // 4. 探索処理
      const sTrail = Math.max(0.2, Math.min(1.0, 1.0 - (m.trailTime - 2500) / 6500));
      // 5. 時間感覚
      const sTime = Math.max(0.2, Math.min(1.0, 1.0 - Math.min(1.0, (m.timePerceptionDiff || 650) / 3000)));
      // 6. リスク制御
      const rCount = m.riskCount !== undefined ? m.riskCount : 2;
      const sRisk = Math.max(0.2, Math.min(1.0, 1.0 - (Math.abs(rCount - 2) / 3) * 0.6));
      // 7. 分割注意 (二重課題)
      const dReflex = m.dualReflex || 330;
      const dMistakes = m.dualMistakes || 0;
      const sDual = Math.max(0.2, Math.min(1.0, 1.0 - (dReflex - 220) / 400 * 0.6 - dMistakes * 0.15));

      return [sReflex, sCognition, sMemory, sTrail, sTime, sRisk, sDual];
    };

    if (base) {
      const bScores = getScores(base);
      ctx.fillStyle = 'rgba(154, 176, 143, 0.25)';
      ctx.strokeStyle = 'rgba(154, 176, 143, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const r = maxR * bScores[i];
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    const cScores = getScores(curr);
    ctx.fillStyle = 'rgba(238, 175, 161, 0.45)';
    ctx.strokeStyle = 'rgba(238, 175, 161, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const r = maxR * cScores[i];
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const r = maxR * cScores[i];
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      ctx.fillStyle = '#EEAFA1';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateDrinkCareEstimate(drinks) {
    const hours = Math.round(drinks * 3.5 * 10) / 10;
    const waterMl = drinks * 280;

    const estEl = document.getElementById('calc-estimate-result');
    if (estEl) {
      estEl.innerHTML = `
        <span>アルコール分解の目安時間: <strong>約 ${hours} 時間</strong></span>
        <span>推奨水分補給量: <strong>約 ${waterMl} ml</strong></span>
      `;
    }
  }

})();
