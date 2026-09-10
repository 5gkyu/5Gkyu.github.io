// --- ARIA対応: HlTabs ---
class HlTabs extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    setTimeout(() => {
      const panels = Array.from(this.querySelectorAll('.hl-tab-panel'));
      const navHtml = panels.map((panel, index) => {
        const label = panel.getAttribute('data-label') || `タブ ${index + 1}`;
        const panelId = `tabpanel-${index}`;
        const tabId = `tab-${index}`;
        
        panel.id = panelId;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabId);
        
        return `<button class="hl-tabs-btn ${index === 0 ? 'is-active' : ''}" id="${tabId}" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" aria-controls="${panelId}" data-index="${index}" draggable="false" type="button">${label}</button>`;
      }).join('');
      
      const navContainer = document.createElement('div');
      navContainer.className = 'hl-tabs-nav';
      navContainer.setAttribute('role', 'tablist');
      navContainer.innerHTML = navHtml;
      this.insertBefore(navContainer, this.firstChild);
      
      const btns = this.querySelectorAll('.hl-tabs-btn');
      if(panels[0]) panels[0].classList.add('is-active');
      
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          // e.target が内部テキストノード等になるケースに備えてボタン自体を確実に取得
          const btnEl = e.currentTarget;
          const index = parseInt(btnEl.getAttribute('data-index'), 10);
          if (isNaN(index)) return;
          e.preventDefault();
          e.stopPropagation();
          btns.forEach(b => { 
            b.classList.remove('is-active'); 
            b.setAttribute('aria-selected', 'false');
          });
          panels.forEach(p => p.classList.remove('is-active'));
          
          btnEl.classList.add('is-active');
          btnEl.setAttribute('aria-selected', 'true');
          if(panels[index]) panels[index].classList.add('is-active');
        });
      });
    }, 10);
  }
}
customElements.define('hl-tabs', HlTabs);
