/* ============================================================
   HL-STEPPER — 動的プログレス・ステッパーコンポーネント
   横並びまたは縦型で、進行度・ステップ状況を可視化・切り替え
   
   使用例:
   <hl-stepper current="1" layout="vertical|horizontal">
     <hl-stepper-item step="1" title="設定入力" sub="基本情報"></hl-stepper-item>
     <hl-stepper-item step="2" title="コード確認" sub="プレビュー"></hl-stepper-item>
     <hl-stepper-item step="3" title="ZIP保存" sub="ダウンロード"></hl-stepper-item>
     <hl-stepper-item step="4" title="導入手順" sub="Chrome拡張"></hl-stepper-item>
   </hl-stepper>
============================================================ */

class HlStepper extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const layout = this.getAttribute('layout') || 'horizontal';
    const isVertical = layout === 'vertical' || this.hasAttribute('vertical');
    this.classList.add(isVertical ? 'hl-stepper--vertical' : 'hl-stepper--horizontal');
  }

  setCurrent(stepNum) {
    this.setAttribute('current', stepNum);
    const items = this.querySelectorAll('hl-stepper-item, .hl-stepper-item');
    items.forEach(item => {
      const s = parseInt(item.getAttribute('step') || item.dataset.step, 10);
      if (typeof item.updateState === 'function') {
        item.updateState(stepNum);
      } else {
        item.classList.remove('active', 'completed');
        const circle = item.querySelector('.hl-stepper-circle');
        if (s < stepNum) {
          item.classList.add('completed');
          if (circle) circle.textContent = '✓';
        } else if (s === stepNum) {
          item.classList.add('active');
          if (circle) circle.textContent = s;
        } else {
          if (circle) circle.textContent = s;
        }
      }
    });
  }
}
customElements.define('hl-stepper', HlStepper);

class HlStepperItem extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';

    const step = this.getAttribute('step') || '1';
    const title = this.getAttribute('title') || '';
    const sub = this.getAttribute('sub') || '';

    this.innerHTML = `
      <button class="hl-stepper-btn" type="button" aria-label="${step}. ${title}">
        <div class="hl-stepper-circle">${step}</div>
        <div class="hl-stepper-text">
          <div class="hl-stepper-title">${title}</div>
          ${sub ? `<div class="hl-stepper-sub">${sub}</div>` : ''}
        </div>
      </button>
    `;

    const parent = this.closest('hl-stepper');
    const current = parent ? parseInt(parent.getAttribute('current') || '1', 10) : 1;
    this.updateState(current);

    this.querySelector('.hl-stepper-btn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('step-click', {
        bubbles: true,
        detail: { step: parseInt(step, 10) }
      }));
    });
  }

  updateState(currentStep) {
    const stepNum = parseInt(this.getAttribute('step') || '1', 10);
    const circle = this.querySelector('.hl-stepper-circle');
    this.classList.remove('active', 'completed');

    if (stepNum < currentStep) {
      this.classList.add('completed');
      if (circle) circle.textContent = '✓';
    } else if (stepNum === currentStep) {
      this.classList.add('active');
      if (circle) circle.textContent = stepNum;
    } else {
      if (circle) circle.textContent = stepNum;
    }
  }
}
customElements.define('hl-stepper-item', HlStepperItem);
