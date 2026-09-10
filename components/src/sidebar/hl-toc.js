// class HlCategories extends HTMLElement {
//   connectedCallback() {
//     if (this.dataset.rendered) return;
//     this.dataset.rendered = 'true';
//     this.innerHTML = `
//       <hl-sidebar-box title="作ったもの" icon="🎨">
//         <div class="hl-tags-wrapper">
//           <a href="#" class="hl-badge">Webツール</a><a href="#" class="hl-badge">ロジックパズル</a><a href="#" class="hl-badge">デザイン</a><a href="#" class="hl-badge">ゲーム</a>
//         </div>
//       </hl-sidebar-box>
//     `;
//   }
// }
// customElements.define('hl-categories', HlCategories);


class HlToc extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = 'true';
    this._onContentLoaded = () => this.render();
    window.addEventListener('halcyon-content-loaded', this._onContentLoaded);
    this.render();
  }

  disconnectedCallback() {
    if (this._onContentLoaded) {
      window.removeEventListener('halcyon-content-loaded', this._onContentLoaded);
    }
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  render() {
    setTimeout(() => {
      const headingHosts = Array.from(document.querySelectorAll('section-heading'));
      
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }

      // page-titleを取得 (先頭にあるか確認)
      const pageTitleHost = document.querySelector('page-title');
      let tocTargets = [];
      
      if (pageTitleHost) {
        const titleId = 'hl-heading-top';
        pageTitleHost.id = titleId;
        const titleText = pageTitleHost.textContent.trim();
        tocTargets.push({ id: titleId, text: titleText || 'Top', target: pageTitleHost, level: 2 });
      }

      if (headingHosts.length > 0) {
        const headingTargets = headingHosts.map((host, index) => {
          const section = host.closest('section');
          const target = section || host.querySelector('h2') || host;
          if (!target.id) target.id = `hl-heading-${index}`;
          return { id: target.id, text: host.textContent.trim(), target, level: 2 };
        }).filter(item => item.text.length > 0);
        
        tocTargets = tocTargets.concat(headingTargets);
      } else {
        // 記事ページ用: .hl-layout-main 内の h2[id] / h3[id] を収集
        const contentHeadings = Array.from(
          document.querySelectorAll('.hl-layout-main h2[id], .hl-layout-main h3[id]')
        );
        let currentH2Id = null;
        contentHeadings.forEach((el) => {
          const isH3 = el.tagName === 'H3';
          if (!isH3) currentH2Id = el.id;
          tocTargets.push({ id: el.id, text: el.textContent.trim(), target: el, level: isH3 ? 3 : 2, parentH2: isH3 ? currentH2Id : null });
        });
      }

      if (tocTargets.length === 0) return;

      // h3が含まれるか確認
      const hasH3 = tocTargets.some(t => t.level === 3);

      // HTML構築
      let linksHtml = '';
      if (!hasH3) {
        // シンプルモード（全て同レベル）
        tocTargets.forEach((item) => {
          linksHtml += `<a href="#${item.id}" class="hl-toc__link">${item.text}</a>`;
        });
      } else {
        // 記事モード: h3をh2のサブリストにまとめて折りたたみ
        let i = 0;
        while (i < tocTargets.length) {
          const item = tocTargets[i];
          if (item.level === 3) {
            // 親h2なしの孤立h3
            linksHtml += `<a href="#${item.id}" class="hl-toc__link hl-toc__link--h3" data-parent="">${item.text}</a>`;
            i++;
          } else {
            // h2リンク出力 → 直後のh3をサブリストにまとめる
            linksHtml += `<a href="#${item.id}" class="hl-toc__link" data-h2id="${item.id}">${item.text}</a>`;
            const h3Items = [];
            let j = i + 1;
            while (j < tocTargets.length && tocTargets[j].level === 3) {
              h3Items.push(tocTargets[j]);
              j++;
            }
            if (h3Items.length > 0) {
              const h3Links = h3Items.map(h =>
                `<a href="#${h.id}" class="hl-toc__link hl-toc__link--h3" data-parent="${item.id}">${h.text}</a>`
              ).join('');
              linksHtml += `<div class="hl-toc__sub-list" data-group="${item.id}"><div class="hl-toc__sub-list__inner">${h3Links}</div></div>`;
              i = j;
            } else {
              i++;
            }
          }
        }
      }

      this.innerHTML = `<div class="hl-sidebar-block" style="margin-bottom:0;"><div class="hl-sidebar-title"><span><img src="https://5gkyu.github.io/icon/content.svg" alt="" style="width:1em;height:1em;vertical-align:middle;display:inline-block;"></span>Contents</div><div class="hl-toc__list">${linksHtml}</div></div>`;

      this._observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.querySelectorAll('.hl-toc__link').forEach(link => link.classList.remove('is-active'));
            const activeLink = this.querySelector(`.hl-toc__link[href="#${entry.target.id}"]`);
            if (activeLink) {
              activeLink.classList.add('is-active');
              if (hasH3) {
                // アクティブ見出しのグループを展開・他は折りたたむ
                const activeGroupId = activeLink.dataset.parent !== undefined
                  ? activeLink.dataset.parent
                  : (activeLink.dataset.h2id || null);
                this.querySelectorAll('.hl-toc__sub-list').forEach(subList => {
                  subList.classList.toggle('is-group-active', !!activeGroupId && subList.dataset.group === activeGroupId);
                });
              }
            }
          }
        });
      }, { rootMargin: '-120px 0px -60% 0px' });
      tocTargets.forEach((item) => {
         this._observer.observe(item.target);
      });
    }, 50);
  }
}
customElements.define('hl-toc', HlToc);
