/* ============================================================
   0. ユーティリティ関数
============================================================ */
// フォーカストラップ（モーダルやドロワー用）
window.trapFocus = function trapFocus(element) {
  const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (focusableEls.length === 0) return;
  
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  element.addEventListener('keydown', function(e) {
    const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);
    if (!isTabPressed) return;

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  });
  // 開いた直後に最初のフォーカス可能要素にフォーカスを当てる
  setTimeout(() => firstEl.focus(), 100);
}
