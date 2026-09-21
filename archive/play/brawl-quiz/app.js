/**
 * Brawl Quiz Cheat Sheet - クロス表モード
 * 言語（列）× 単語（行）の交差セルに答えを表示
 * 検索バーで言語・単語・答えを即時絞り込み
 */

(function () {
  'use strict';

  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7_sCDnVaj03OEIUwtrtca52MgnOcvO5griTDsCBvpNQ9pC3D7zMCcpQ-w0zlV2O_AvSkyol_pt6D7/pub?gid=0&single=true&output=csv';

  let quizData = {
    languages: [],
    words: [],
    languageData: [],
    triviaData: [],
    totalCount: 0
  };

  // 現在のタブ（'lang' or 'trivia'）
  let currentTab = 'lang';

  // 選択状態（言語列・単語行）
  let selectedLang = null;
  let selectedWord = null;

  // 答えの高速ルックアップ用 Map: "言語|単語" -> answer
  let answerMap = new Map();

  // ---- 初期化 ----
  async function init() {
    setupEventListeners();
    await loadLocalJson();
    renderAll();
    fetchLatestCsv(false);
  }

  async function loadLocalJson() {
    try {
      const res = await fetch('./quiz-data.json?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        applyQuizData(data);
      }
    } catch (e) {
      console.warn('ローカルデータ読み込みエラー:', e);
    }
  }

  async function fetchLatestCsv(showToastNotice = true) {
    const syncBtn = document.getElementById('bqc-mini-sync');
    if (syncBtn) syncBtn.innerHTML = '🔄 同期中...';

    try {
      const res = await fetch(CSV_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const csvText = await res.text();
      parseAndApplyCsv(csvText);
      renderAll();
      if (showToastNotice) {
        showToast(`最新スプレッドシートと同期完了 (全${quizData.totalCount}問)`);
      }
    } catch (e) {
      console.warn('CSV直接フェッチ失敗、ローカル最新データを使用:', e);
      await loadLocalJson();
      renderAll();
      if (showToastNotice) {
        showToast(`最新データで表示中 (全${quizData.totalCount}問)`);
      }
    } finally {
      if (syncBtn) {
        syncBtn.innerHTML = `🔄 シート更新 (<span id="bqc-status-count">${quizData.totalCount}問</span>)`;
      }
    }
  }

  // ---- CSV パース ----
  function parseCSVLine(text) {
    const res = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQ && text[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (c === ',' && !inQ) {
        res.push(cur.trim()); cur = '';
      } else { cur += c; }
    }
    res.push(cur.trim());
    return res;
  }

  function parseAndApplyCsv(csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    const allRows = lines.slice(1).map(l => {
      const cols = parseCSVLine(l);
      return {
        category: (cols[0] || '').trim(),
        question: (cols[1] || '').trim(),
        answer: (cols[2] || '').trim()
      };
    }).filter(r => r.category && r.question && r.answer);

    const langData = [];
    const trivia = [];
    const langSet = new Set();
    const wordSet = new Set();

    // 単語の読み仮名辞書（ソート用）
    const wordReadings = {
      '1': 'いち', '2': 'に', '3': 'さん',
      '愛': 'あい', '愛してる': 'あいしてる', '赤': 'あか', 'ありがとう': 'ありがとう',
      '家': 'いえ', '椅子': 'いす', '犬': 'いぬ', '美しい': 'うつくしい', '馬': 'うま',
      'お母さん': 'おかあさん', 'お父さん': 'おとうさん', 'お願いします': 'おねがいします', 'おやすみ': 'おやすみ',
      '家族': 'かぞく', '学校': 'がっこう', '黄色': 'きいろ', '牛乳': 'ぎゅうにゅう', '車': 'くるま',
      '携帯電話': 'けいたいでんわ', 'コーヒー': 'こーひー', 'こんにちは': 'こんにちは',
      'さようなら': 'さようなら', '自転車': 'じてんしゃ', '白': 'しろ', '幸せ': 'しあわせ',
      '卵': 'たまご', 'チーズ': 'ちーず', '月': 'つき', '友達': 'ともだち',
      '猫': 'ねこ',
      'はい': 'はい', '腹を立てる': 'はらをたてる', 'パン': 'ぱん', '火': 'ひ', '本': 'ほん', '本棚': 'ほんだな',
      '水': 'みず', '緑': 'みどり',
      '夜': 'よる', '山': 'やま', '雪': 'ゆき', 'ようこそ': 'ようこそ', '良い': 'よい',
      'りんご': 'りんご'
    };

    allRows.forEach(row => {
      if (row.category === 'その他' || !row.question.includes('で「')) {
        trivia.push({ question: row.question, answer: row.answer });
      } else {
        const m = row.question.match(/「(.+?)」/);
        const w = m ? m[1] : '';
        langSet.add(row.category);
        if (w) wordSet.add(w);
        langData.push({ lang: row.category, word: w, answer: row.answer });
      }
    });

    const parsedData = {
      languages: Array.from(langSet).sort((a, b) => a.localeCompare(b, 'ja')),
      words: Array.from(wordSet).sort((a, b) => {
        const ra = wordReadings[a] || a;
        const rb = wordReadings[b] || b;
        return ra.localeCompare(rb, 'ja');
      }),
      languageData: langData,
      triviaData: trivia,
      totalCount: allRows.length
    };

    applyQuizData(parsedData);
  }

  function applyQuizData(data) {
    quizData = data;

    // 高速ルックアップ用 Map を構築
    answerMap.clear();
    quizData.languageData.forEach(item => {
      answerMap.set(`${item.lang}|${item.word}`, item.answer);
    });

    const countEl = document.getElementById('bqc-status-count');
    if (countEl) countEl.textContent = `${quizData.totalCount}問`;
  }

  // ---- イベントリスナー ----
  function setupEventListeners() {
    // 検索
    const searchInput = document.getElementById('bqc-search-input');
    const searchClear = document.getElementById('bqc-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const val = searchInput.value;
        if (searchClear) searchClear.style.display = val ? 'block' : 'none';
        filterTable(val.trim());
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          if (searchClear) searchClear.style.display = 'none';
          filterTable('');
          clearSelection();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) { searchInput.value = ''; searchInput.focus(); }
        searchClear.style.display = 'none';
        filterTable('');
      });
    }

    // 選択リセットボタン
    const resetBtn = document.getElementById('bqc-reset-selection');
    if (resetBtn) resetBtn.addEventListener('click', clearSelection);

    // 同期ボタン
    const syncBtn = document.getElementById('bqc-mini-sync');
    if (syncBtn) syncBtn.addEventListener('click', () => fetchLatestCsv(true));

    // タブ切り替え
    const tabLang = document.getElementById('bqc-tab-lang');
    const tabTrivia = document.getElementById('bqc-tab-trivia');
    if (tabLang) tabLang.addEventListener('click', () => switchTab('lang'));
    if (tabTrivia) tabTrivia.addEventListener('click', () => switchTab('trivia'));

    // 言語ヘッダー位置でのマウスホイール横スクロール
    const matrixWrapper = document.getElementById('bqc-matrix-wrapper');
    const matrixThead = document.getElementById('bqc-matrix-thead');
    if (matrixThead && matrixWrapper) {
      matrixThead.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          matrixWrapper.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // テーブルのクリックイベント（行列・交点のハイライト & コーナークリックでリセット）
    const matrixTable = document.getElementById('bqc-matrix-table');
    if (matrixTable) {
      matrixTable.addEventListener('click', (e) => {
        const corner = e.target.closest('.bqc-corner');
        const langTh = e.target.closest('.bqc-lang-th');
        const wordTh = e.target.closest('.bqc-word-th');
        const cell = e.target.closest('.bqc-cell');

        if (corner) {
          clearSelection();
        } else if (langTh) {
          const lang = langTh.dataset.lang;
          selectedLang = (selectedLang === lang) ? null : lang;
          updateHighlights();
        } else if (wordTh) {
          const tr = wordTh.closest('tr');
          const word = tr ? tr.dataset.word : null;
          selectedWord = (selectedWord === word) ? null : word;
          updateHighlights();
        } else if (cell) {
          const lang = cell.dataset.lang;
          const tr = cell.closest('tr');
          const word = tr ? tr.dataset.word : null;

          if (selectedLang === lang && selectedWord === word) {
            selectedLang = null;
            selectedWord = null;
          } else {
            selectedLang = lang;
            selectedWord = word;
          }
          updateHighlights();
        }
      });
    }
  }

  function clearSelection() {
    selectedLang = null;
    selectedWord = null;
    updateHighlights();
  }

  function updateHighlights() {
    const table = document.getElementById('bqc-matrix-table');
    if (!table) return;

    // 言語ヘッダー
    table.querySelectorAll('.bqc-lang-th').forEach(th => {
      th.classList.toggle('is-active', Boolean(selectedLang && th.dataset.lang === selectedLang));
    });

    // 単語ヘッダー
    table.querySelectorAll('.bqc-word-th').forEach(th => {
      const tr = th.closest('tr');
      const word = tr ? tr.dataset.word : '';
      th.classList.toggle('is-active', Boolean(selectedWord && word === selectedWord));
    });

    // 各セル
    table.querySelectorAll('.bqc-cell').forEach(td => {
      const lang = td.dataset.lang;
      const tr = td.closest('tr');
      const word = tr ? tr.dataset.word : '';

      const isCol = Boolean(selectedLang && lang === selectedLang);
      const isRow = Boolean(selectedWord && word === selectedWord);
      const isInter = isCol && isRow;

      td.classList.toggle('is-col-active', isCol && !isInter);
      td.classList.toggle('is-row-active', isRow && !isInter);
      td.classList.toggle('is-intersection', isInter);
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    const matrixWrapper = document.getElementById('bqc-matrix-wrapper');
    const triviaWrapper = document.getElementById('bqc-trivia-wrapper');
    const tabLang = document.getElementById('bqc-tab-lang');
    const tabTrivia = document.getElementById('bqc-tab-trivia');

    if (tab === 'lang') {
      if (matrixWrapper) matrixWrapper.style.display = '';
      if (triviaWrapper) triviaWrapper.classList.remove('active');
      if (tabLang) tabLang.classList.add('active');
      if (tabTrivia) tabTrivia.classList.remove('active');
    } else {
      if (matrixWrapper) matrixWrapper.style.display = 'none';
      if (triviaWrapper) triviaWrapper.classList.add('active');
      if (tabLang) tabLang.classList.remove('active');
      if (tabTrivia) tabTrivia.classList.add('active');
    }
  }

  // ---- レンダリング ----
  function renderAll() {
    renderMatrix();
    renderTrivia();
  }

  /**
   * クロス表を構築
   * 行 = 単語、列 = 言語
   */
  function renderMatrix() {
    const thead = document.getElementById('bqc-matrix-thead');
    const tbody = document.getElementById('bqc-matrix-tbody');
    if (!thead || !tbody) return;

    const langs = quizData.languages;
    const words = quizData.words;

    // ---- ヘッダー行 ----
    thead.innerHTML = '';
    const headerRow = document.createElement('tr');

    // 左上コーナー
    const corner = document.createElement('th');
    corner.className = 'bqc-corner';
    corner.textContent = '単語 \\ 言語';
    headerRow.appendChild(corner);

    // 各言語列ヘッダー
    langs.forEach(lang => {
      const th = document.createElement('th');
      th.className = 'bqc-lang-th';
      th.dataset.lang = lang;
      // 「語」を省略して表示（スペース節約）
      th.textContent = lang.replace('語', '');
      th.title = lang;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    // ---- 本体行 ----
    tbody.innerHTML = '';

    words.forEach(word => {
      const tr = document.createElement('tr');
      tr.dataset.word = word;

      // 単語ラベルセル（左固定）
      const wordTh = document.createElement('th');
      wordTh.className = 'bqc-word-th';
      wordTh.textContent = word;
      wordTh.title = word;
      tr.appendChild(wordTh);

      // 各言語の答えセル
      langs.forEach(lang => {
        const td = document.createElement('td');
        td.className = 'bqc-cell';
        td.dataset.lang = lang;

        const ans = answerMap.get(`${lang}|${word}`);
        if (ans) {
          td.textContent = ans;
          td.title = `${lang}で「${word}」→ ${ans}`;
        } else {
          td.textContent = '—';
          td.classList.add('empty');
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  /**
   * 雑学リストを構築
   */
  function renderTrivia() {
    const grid = document.getElementById('bqc-trivia-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!quizData.triviaData || quizData.triviaData.length === 0) {
      grid.innerHTML = '<div style="color:var(--bqc-text-muted);padding:10px;">データがありません</div>';
      return;
    }

    quizData.triviaData.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'bqc-trivia-item';
      card.innerHTML = `
        <div class="bqc-trivia-q">
          <span style="color:var(--bqc-accent-dark);font-weight:900;margin-right:4px;">Q${idx + 1}.</span>
          ${escapeHtml(item.question)}
        </div>
        <div class="bqc-trivia-a">${escapeHtml(item.answer)}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ---- 検索フィルタ ----
  function toHiragana(str) {
    return str.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
  }
  function toKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60));
  }

  function filterTable(query) {
    const thead = document.getElementById('bqc-matrix-thead');
    const tbody = document.getElementById('bqc-matrix-tbody');
    if (!thead || !tbody) return;

    if (!query) {
      // フィルタ解除：全列・全行を表示
      thead.querySelectorAll('.bqc-lang-th').forEach(th => th.classList.remove('hidden-col'));
      tbody.querySelectorAll('tr').forEach(tr => {
        tr.classList.remove('hidden-row');
        tr.querySelectorAll('.bqc-cell').forEach(td => td.classList.remove('hidden-col'));
      });
      return;
    }

    const q = query.toLowerCase();
    const qH = toHiragana(q);
    const qK = toKatakana(q);

    // 言語列マッチ判定（クエリが言語名に含まれるか）
    const langHeaders = thead.querySelectorAll('.bqc-lang-th');
    const visibleLangs = new Set();

    // 答えにクエリが含まれる言語を収集
    const langMatchedByAnswer = new Set();
    answerMap.forEach((ans, key) => {
      if (ans.toLowerCase().includes(q)) {
        const [lang] = key.split('|');
        langMatchedByAnswer.add(lang);
      }
    });

    langHeaders.forEach(th => {
      const lang = th.dataset.lang;
      const langL = lang.toLowerCase();
      const isLangMatch = langL.includes(q) || langL.includes(qH) || langL.includes(qK) || langMatchedByAnswer.has(lang);
      if (isLangMatch) {
        th.classList.remove('hidden-col');
        visibleLangs.add(lang);
      } else {
        th.classList.add('hidden-col');
      }
    });

    // 単語行マッチ判定（クエリが単語名か答えに含まれるか）
    tbody.querySelectorAll('tr').forEach(tr => {
      const word = tr.dataset.word || '';
      const wordL = word.toLowerCase();
      const isWordMatch = wordL.includes(q) || wordL.includes(qH) || wordL.includes(qK);

      // 答えにクエリが含まれる行かどうかも確認
      let hasAnswerMatch = false;
      tr.querySelectorAll('.bqc-cell').forEach(td => {
        const lang = td.dataset.lang;
        const ansL = (td.textContent || '').toLowerCase();
        const colVisible = visibleLangs.has(lang) || visibleLangs.size === 0;
        if (ansL.includes(q) && colVisible) hasAnswerMatch = true;
        td.classList.toggle('hidden-col', !visibleLangs.has(lang));
      });

      // 行を表示するか：単語マッチ、または答えマッチ
      const showRow = isWordMatch || hasAnswerMatch || visibleLangs.size > 0;
      tr.classList.toggle('hidden-row', !showRow);
    });

    // 言語が全て非表示なら、単語のみのマッチで行を表示
    if (visibleLangs.size === 0) {
      // 言語フィルタなし → 単語・答えで行を絞る
      langHeaders.forEach(th => th.classList.remove('hidden-col'));
      tbody.querySelectorAll('tr').forEach(tr => {
        const word = tr.dataset.word || '';
        const wordL = word.toLowerCase();
        const wordMatch = wordL.includes(q) || wordL.includes(qH) || wordL.includes(qK);

        // セルの答えでマッチ確認
        let rowHasMatch = wordMatch;
        if (!rowHasMatch) {
          tr.querySelectorAll('.bqc-cell').forEach(td => {
            if ((td.textContent || '').toLowerCase().includes(q)) rowHasMatch = true;
          });
        }

        tr.classList.toggle('hidden-row', !rowHasMatch);
        tr.querySelectorAll('.bqc-cell').forEach(td => td.classList.remove('hidden-col'));
      });
    }
  }

  // ---- トースト ----
  function showToast(msg) {
    let t = document.getElementById('bqc-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'bqc-toast';
      t.className = 'bqc-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
