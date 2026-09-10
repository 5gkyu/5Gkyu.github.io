/**
 * ブックマークレットランチャー（自己完結型）
 *
 * このファイル1つで完結する。外部ファイルへの依存なし。
 * bookmarklets-data.js が同じページで読み込み済みなら優先して使う。
 *
 * 登録するブックマークレット:
 *   javascript:void(function(){var s=document.createElement('script');s.src='https://5gkyu.github.io/archive/other/booklet/launcher.js?_='+Date.now();document.head.appendChild(s);}())
 */
(function () {
  'use strict';

  /* ── 設定 ──────────────────────────────────────────────── */
  var OVERLAY_ID = '__bm_launcher_ov__';
  var STYLE_ID   = '__bm_launcher_css__';

  /* ── トグル: 既に開いていれば閉じる ────────────────────── */
  var existingOv = document.getElementById(OVERLAY_ID);
  if (existingOv) {
    _closeOv(existingOv);
    return;
  }

  /* ── データ取得（インライン埋め込み or 外部共有データ）── */
  var data = window.BOOKMARKLETS && window.BOOKMARKLETS.length
    ? window.BOOKMARKLETS
    : _getInlineData();

  _buildUI(data);

  /* ════════════════════════════════════════════════════════
     インライン埋め込みデータ
     bookmarklets-data.js と内容を同期して管理する
  ════════════════════════════════════════════════════════ */
  function _getInlineData() {
    return [
      {
        num: 1,
        id: 'copy-title-url',
        tag: '便利ツール',
        title: 'タイトル＆URLコピー',
        description: '閲覧中のページタイトルとURLをクリップボードにコピーします。共有やメモに便利。',
        code: 'javascript:void(function(){var t=document.title,u=location.href;navigator.clipboard.writeText(t+\'\\n\'+u).then(function(){alert(\'コピーしました!\\n\'+t)}).catch(function(){prompt(\'コピーしてください:\',t+\' \'+u)})})()'
      },
      {
        num: 2,
        id: 'simple-reader',
        tag: '読みやすさ',
        title: 'かんたんリーダー',
        description: 'ページの本文を中央寄せ・大きめフォントにして、読みやすく整えます。',
        code: 'javascript:void(function(){var d=document,b=d.body;b.style.maxWidth=\'640px\';b.style.margin=\'0 auto\';b.style.padding=\'16px\';b.style.fontSize=\'18px\';b.style.lineHeight=\'1.8\';b.style.color=\'%23333\';b.style.background=\'%23fefefe\';var imgs=d.querySelectorAll(\'img\');for(var i=0;i<imgs.length;i++){imgs[i].style.maxWidth=\'100%25\';imgs[i].style.height=\'auto\'}alert(\'読みやすくしました!\')})()'
      },
      {
        num: 3,
        id: 'image-picker-downloader',
        tag: '画像ツール',
        title: 'ページ内の画像を一覧表示',
        description: 'ページ内の画像を一覧表示します。カードをクリックすると画像を新しいタブで開きます。',
        code: 'javascript:void(function(){try{var list=[],seen=new Set();Array.prototype.forEach.call(document.images,function(im){var u=(im.currentSrc||im.src||\'\'). trim();if(!u||u.indexOf(\'https://\')!==0||seen.has(u))return;seen.add(u);list.push({url:u,alt:(im.alt||\'\'). trim(),w:im.naturalWidth||im.width||0,h:im.naturalHeight||im.height||0});});if(!list.length){alert(\'画像が見つかりませんでした。\');return;}var old=document.getElementById(\'__bm_img_dl_overlay__\');if(old)old.remove();var ov=document.createElement(\'div\');ov.id=\'__bm_img_dl_overlay__\';ov.style.cssText=\'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:12px;\';var panel=document.createElement(\'div\');panel.style.cssText=\'width:min(960px,96vw);max-height:92vh;background:#fff;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;\';var head=document.createElement(\'div\');head.style.cssText=\'padding:10px 12px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;gap:8px;\';var strong=document.createElement(\'strong\');strong.style.fontSize=\'14px\';strong.textContent=\'画像をクリックして開く\';var span=document.createElement(\'span\');span.style.cssText=\'font-size:12px;color:#666\';span.textContent=list.length+\'件\';head.appendChild(strong);head.appendChild(span);var body=document.createElement(\'div\');body.style.cssText=\'padding:8px 10px;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;\';var foot=document.createElement(\'div\');foot.style.cssText=\'padding:10px;border-top:1px solid #eee;display:flex;gap:8px;flex-wrap:wrap;\';function mkBtn(text,bg,color){var b=document.createElement(\'button\');b.type=\'button\';b.textContent=text;b.style.cssText=\'border:none;border-radius:8px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;background:\'+bg+\';color:\'+color+\';\';return b;}var btnClose=mkBtn(\'閉じる\',\'#fff\',\'#333\');btnClose.style.border=\'1px solid #ddd\';foot.appendChild(btnClose);list.forEach(function(it,i){var item=document.createElement(\'div\');item.style.cssText=\'display:flex;gap:8px;align-items:flex-start;border:1px solid #eee;border-radius:8px;padding:8px;cursor:pointer;\';item.onmouseover=function(){item.style.background=\'#f5f5f5\';};item.onmouseout=function(){item.style.background=\'\';};var img=document.createElement(\'img\');img.src=it.url;img.loading=\'lazy\';img.style.cssText=\'width:56px;height:56px;object-fit:cover;border-radius:6px;background:#f4f4f4;flex-shrink:0;\';var meta=document.createElement(\'div\');meta.style.cssText=\'min-width:0;flex:1;\';var d1=document.createElement(\'div\');d1.style.cssText=\'font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\';d1.textContent=(it.alt||(\'image_\'+(i+1)));var d2=document.createElement(\'div\');d2.style.cssText=\'font-size:11px;color:#666\';d2.textContent=it.w+\'x\'+it.h;var d3=document.createElement(\'div\');d3.style.cssText=\'font-size:10px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\';d3.textContent=it.url;meta.appendChild(d1);meta.appendChild(d2);meta.appendChild(d3);item.appendChild(img);item.appendChild(meta);item.onclick=function(){window.open(it.url,\'_blank\');};body.appendChild(item);});panel.appendChild(head);panel.appendChild(body);panel.appendChild(foot);ov.appendChild(panel);document.body.appendChild(ov);btnClose.onclick=function(){ov.remove();};ov.addEventListener(\'click\',function(e){if(e.target===ov)ov.remove();});}catch(e){alert(\'エラー: \'+e);}})()'
      },
      {
        num: 4,
        id: 'yt-url-toolkit',
        tag: 'YouTube',
        title: 'YouTube URL ツール（統合版）',
        description: 'YouTubeの動画ページで実行。短縮URL・現在時刻付き・クリーンURL・再生リスト除去URLをまとめて一覧表示し、個別にコピーできます。',
        code: "javascript:void(function(){try{var host=(location.hostname||'').replace(/^www\\./,''),u=new URL(location.href),vid='';if(host==='youtu.be'){vid=u.pathname.split('/').filter(Boolean)[0]||'';}else if(host==='youtube.com'||host==='m.youtube.com'){vid=u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':'');}if(!vid){alert('YouTube動画ページで実行してください');return;}var v=document.querySelector('video'),t=v?Math.floor(v.currentTime):0;var cu=new URL(location.href);['list','index','pp'].forEach(function(p){cu.searchParams.delete(p);});var cleanUrl=cu.toString();var rows=[{label:'短縮 URL',url:'https://youtu.be/'+vid},{label:'短縮 URL＋現在時刻（'+t+'s）',url:'https://youtu.be/'+vid+'?t='+t,skip:t<=0},{label:'クリーン URL',url:'https://www.youtube.com/watch?v='+vid},{label:'クリーン URL＋現在時刻（'+t+'s）',url:'https://www.youtube.com/watch?v='+vid+'&t='+t+'s',skip:t<=0},{label:'再生リスト除去 URL',url:cleanUrl,skip:cleanUrl===location.href}].filter(function(r){return!r.skip;});var old=document.getElementById('__bm_yt_url__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_yt_url__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;';var box=document.createElement('div');box.style.cssText='width:min(560px,96vw);background:#fff;border-radius:14px;overflow:hidden;font-family:sans-serif;';var hd=document.createElement('div');hd.style.cssText='padding:12px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;';var ht=document.createElement('strong');ht.style.fontSize='14px';ht.textContent='YouTube URL ツール';var hx=document.createElement('button');hx.type='button';hx.textContent='✕';hx.style.cssText='border:none;background:none;font-size:16px;cursor:pointer;color:#666;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:4px 0;';rows.forEach(function(row){var item=document.createElement('div');item.style.cssText='display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid #f5f5f5;gap:8px;';var left=document.createElement('div');left.style.cssText='flex:1;min-width:0;';var lbl=document.createElement('div');lbl.style.cssText='font-size:11px;color:#888;margin-bottom:2px;';lbl.textContent=row.label;var urlDiv=document.createElement('div');urlDiv.style.cssText='font-size:11px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';urlDiv.textContent=row.url;left.appendChild(lbl);left.appendChild(urlDiv);var btn=document.createElement('button');btn.type='button';btn.textContent='コピー';btn.style.cssText='flex-shrink:0;border:1.5px solid #e0e0e0;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;background:#fff;color:#333;white-space:nowrap;';btn.onclick=function(){navigator.clipboard.writeText(row.url).then(function(){btn.textContent='✓ コピー済み';btn.style.background='#e8f9ef';btn.style.borderColor='#a8e6c1';btn.style.color='#1a7a45';setTimeout(function(){btn.textContent='コピー';btn.style.background='#fff';btn.style.borderColor='#e0e0e0';btn.style.color='#333';},1800);}).catch(function(){prompt('URLをコピーしてください:',row.url);});};item.appendChild(left);item.appendChild(btn);bd.appendChild(item);});var ft=document.createElement('div');ft.style.cssText='padding:10px;';var bClose=document.createElement('button');bClose.type='button';bClose.textContent='閉じる';bClose.style.cssText='width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:#555;';bClose.onclick=function(){ov.remove();};ft.appendChild(bClose);box.appendChild(hd);box.appendChild(bd);box.appendChild(ft);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 5,
        id: 'yt-embed-code',
        tag: 'YouTube',
        title: '埋め込みコード生成（iframe）',
        description: 'YouTubeの動画ページで実行。iframeタグ形式の埋め込みコードを自動生成します。現在時刻から開始・自動再生のオプションをチェックで切り替えられます。',
        code: "javascript:void(function(){try{var host=(location.hostname||'').replace(/^www\\./,''),u=new URL(location.href),vid='';if(host==='youtu.be'){vid=u.pathname.split('/').filter(Boolean)[0]||'';}else if(host==='youtube.com'||host==='m.youtube.com'){vid=u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':'');}if(!vid){alert('YouTube動画ページで実行してください');return;}var v=document.querySelector('video'),t=v?Math.floor(v.currentTime):0;var useTime=false,useAuto=false;function buildCode(){var params=[];if(useAuto)params.push('autoplay=1','mute=1');if(useTime&&t>0)params.push('start='+t);var src='https://www.youtube.com/embed/'+vid+(params.length?'?'+params.join('&'):'');return'<iframe width=\"560\" height=\"315\" src=\"'+src+'\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>';}var old=document.getElementById('__bm_yt_embed__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_yt_embed__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;';var box=document.createElement('div');box.style.cssText='width:min(560px,96vw);background:#fff;border-radius:14px;overflow:hidden;font-family:sans-serif;';var hd=document.createElement('div');hd.style.cssText='padding:12px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;';var ht=document.createElement('strong');ht.style.fontSize='14px';ht.textContent='YouTube 埋め込みコード生成';var hx=document.createElement('button');hx.type='button';hx.textContent='✕';hx.style.cssText='border:none;background:none;font-size:16px;cursor:pointer;color:#666;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:14px;display:flex;flex-direction:column;gap:10px;';function mkChk(labelText,dis,onChange){var wrap=document.createElement('label');wrap.style.cssText='display:flex;align-items:center;gap:8px;font-size:13px;color:'+(dis?'#aaa':'#333')+';cursor:'+(dis?'default':'pointer')+';user-select:none;';var cb=document.createElement('input');cb.type='checkbox';cb.style.cssText='accent-color:#f0446e;width:15px;height:15px;cursor:'+(dis?'default':'pointer')+';';if(dis)cb.disabled=true;cb.onchange=function(){onChange(cb.checked);ta.value=buildCode();};var sp=document.createElement('span');sp.textContent=labelText;wrap.appendChild(cb);wrap.appendChild(sp);return wrap;}var ta=document.createElement('textarea');ta.readOnly=true;ta.style.cssText='width:100%;height:76px;padding:10px;border:1px solid #e0e0e0;border-radius:8px;font-size:10px;font-family:ui-monospace,monospace;resize:vertical;line-height:1.5;color:#333;background:#fafafa;';ta.value=buildCode();bd.appendChild(mkChk('現在時刻から開始（'+t+'s）'+(t<=0?' — 動画再生中のみ有効':''),t<=0,function(v){useTime=v;}));bd.appendChild(mkChk('自動再生する（ミュートで開始）',false,function(v){useAuto=v;}));bd.appendChild(ta);var btnCopy=document.createElement('button');btnCopy.type='button';btnCopy.textContent='コードをコピー';btnCopy.style.cssText='width:100%;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;background:#f0446e;color:#fff;';btnCopy.onclick=function(){navigator.clipboard.writeText(ta.value).then(function(){btnCopy.textContent='コピーしました！';btnCopy.style.background='#27ae60';setTimeout(function(){btnCopy.textContent='コードをコピー';btnCopy.style.background='#f0446e';},1800);}).catch(function(){ta.focus();ta.select();document.execCommand('copy');});};bd.appendChild(btnCopy);var btnClose=document.createElement('button');btnClose.type='button';btnClose.textContent='閉じる';btnClose.style.cssText='width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:#555;';btnClose.onclick=function(){ov.remove();};bd.appendChild(btnClose);box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 6,
        id: 'thumbnail-viewer',
        tag: '動画ツール',
        title: 'サムネイルを取得して開く',
        description: 'YouTube または niconico の動画ページで実行。サムネイル画像の一覧を表示し、クリックで新しいタブに開きます。YouTubeは4サイズ（maxres / SD / HQ / MQ）対応。',
        code: "javascript:void(function(){try{var host=(location.hostname||'').replace(/^www\\./,'');var u=new URL(location.href);var thumbs=[],title='';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){var vid=host==='youtu.be'?(u.pathname.split('/').filter(Boolean)[0]||''):(u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':''));if(!vid){alert('動画IDを取得できませんでした。');return;}title='YouTube サムネイル';var b='https://img.youtube.com/vi/'+vid+'/';thumbs=[{label:'maxres (1280×720)',url:b+'maxresdefault.jpg'},{label:'SD (640×480)',url:b+'sddefault.jpg'},{label:'HQ (480×360)',url:b+'hqdefault.jpg'},{label:'MQ (320×180)',url:b+'mqdefault.jpg'}];}else if(host.indexOf('nicovideo.jp')>=0){title='niconico サムネイル';var og=document.querySelector('meta[property=\"og:image\"]');if(og&&og.content){thumbs=[{label:'サムネイル',url:og.content}];}else{alert('サムネイルが取得できませんでした。');return;}}else{alert('YouTube または niconico の動画ページで実行してください。');return;}if(!thumbs.length){alert('サムネイルが取得できませんでした。');return;}var old=document.getElementById('__bm_thumb__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_thumb__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;';var box=document.createElement('div');box.style.cssText='width:min(640px,96vw);max-height:90vh;background:#fff;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';var hd=document.createElement('div');hd.style.cssText='padding:12px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;';var ht=document.createElement('strong');ht.style.fontSize='14px';ht.textContent=title;var hx=document.createElement('button');hx.type='button';hx.textContent='✕';hx.style.cssText='border:none;background:none;font-size:16px;cursor:pointer;color:#666;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:12px;display:flex;flex-direction:column;gap:10px;overflow:auto;';thumbs.forEach(function(th){var card=document.createElement('div');card.style.cssText='border:1px solid #eee;border-radius:8px;overflow:hidden;cursor:pointer;';card.onmouseover=function(){card.style.borderColor='#f0446e';};card.onmouseout=function(){card.style.borderColor='#eee';};var img=document.createElement('img');img.src=th.url;img.style.cssText='width:100%;height:auto;display:block;background:#f4f4f4;min-height:40px;';img.alt=th.label;var lbl=document.createElement('div');lbl.style.cssText='padding:6px 10px;font-size:11px;color:#666;background:#fafafa;border-top:1px solid #eee;';lbl.textContent=th.label;card.appendChild(img);card.appendChild(lbl);card.onclick=function(){window.open(th.url,'_blank');};bd.appendChild(card);});box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 7,
        id: 'vocaloid-cross-url',
        tag: 'ボカロ変換',
        title: 'YouTube⇔niconico URL取得',
        description: 'YouTubeまたはniconicoの動画ページで実行すると、VocaDB経由で逆サイトの対応URLを取得してコピーします。データ提供: VocaDB（利用規約/APIルールを遵守して利用）',
        code: "javascript:void((async function(){try{var host=(location.hostname||'').replace(/^www\\./,''),u=new URL(location.href),src='',pvId='';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){src='Youtube';pvId=host==='youtu.be'?(u.pathname.split('/').filter(Boolean)[0]||''):(u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':''));}else if(host.indexOf('nicovideo.jp')>=0){src='NicoNicoDouga';var p=(u.pathname||'').match(/\\/watch\\/([a-z]{2}\\d+)/i);pvId=p?p[1]:'';}else{alert('YouTube または niconico の動画ページで実行してください。');return;}if(!pvId){alert('動画IDを取得できませんでした。');return;}var byPv='https://vocadb.net/api/songs/byPv?pvService='+encodeURIComponent(src)+'&pvId='+encodeURIComponent(pvId);var r1=await fetch(byPv);if(!r1.ok){throw new Error('VocaDB byPv: HTTP '+r1.status);}var song=await r1.json();if(!song||!song.id){alert('VocaDBに該当曲が見つかりませんでした。\\nデータ提供: VocaDB');return;}var r2=await fetch('https://vocadb.net/api/songs/'+encodeURIComponent(song.id)+'?fields=PVs');if(!r2.ok){throw new Error('VocaDB song: HTTP '+r2.status);}var detail=await r2.json(),pvs=Array.isArray(detail&&detail.pvs)?detail.pvs:[];var target='',targetSite=(src==='Youtube'?'niconico':'YouTube');if(src==='Youtube'){for(var i=0;i<pvs.length;i++){var n=pvs[i];if(n&&!n.disabled&&String(n.service||'').indexOf('NicoNico')===0){target=n.url||('https://www.nicovideo.jp/watch/'+n.pvId);break;}}}else{for(var j=0;j<pvs.length;j++){var y=pvs[j];if(y&&!y.disabled&&String(y.service||'')==='Youtube'){target=y.url||('https://youtu.be/'+y.pvId);break;}}}if(!target){alert(targetSite+' の動画URLが見つかりませんでした。');return;}try{await navigator.clipboard.writeText(target);}catch(e){}alert(targetSite+' のURLをコピーしました:\\n'+target);}catch(err){alert('エラー: '+(err&&err.message?err.message:err));}})())"
      },
      {
        num: 8,
        id: 'vocaloid-x-search',
        tag: 'ボカロ変換',
        title: 'X感想検索（YouTube/niconico）',
        description: 'YouTubeまたはniconicoの動画ページで実行すると、VocaDB経由で曲名・両サイトの動画IDを取得し、Xで感想を検索します。データ提供: VocaDB（利用規約/APIルールを遵守して利用）',
        code: "javascript:void((async function(){try{var host=(location.hostname||'').replace(/^www\\./,''),u=new URL(location.href),src='',pvId='';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){src='Youtube';pvId=host==='youtu.be'?(u.pathname.split('/').filter(Boolean)[0]||''):(u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':''));}else if(host.indexOf('nicovideo.jp')>=0){src='NicoNicoDouga';var p=(u.pathname||'').match(/\\/watch\\/([a-z]{2}\\d+)/i);pvId=p?p[1]:'';}else{alert('YouTube または niconico の動画ページで実行してください。');return;}if(!pvId){alert('動画IDを取得できませんでした。');return;}var r1=await fetch('https://vocadb.net/api/songs/byPv?pvService='+encodeURIComponent(src)+'&pvId='+encodeURIComponent(pvId));if(!r1.ok){throw new Error('VocaDB byPv: HTTP '+r1.status);}var song=await r1.json();if(!song||!song.id){alert('VocaDBに該当曲が見つかりませんでした。');return;}var r2=await fetch('https://vocadb.net/api/songs/'+encodeURIComponent(song.id)+'?fields=PVs,Names');if(!r2.ok){throw new Error('VocaDB song: HTTP '+r2.status);}var detail=await r2.json(),pvs=Array.isArray(detail&&detail.pvs)?detail.pvs:[],names=Array.isArray(detail&&detail.names)?detail.names:[];var title=song.name||'';for(var k=0;k<names.length;k++){if(names[k]&&names[k].language==='Japanese'){title=names[k].value||title;break;}}if(!title)title=detail.defaultName||song.name||'';var ytId='',nicoId='';for(var i=0;i<pvs.length;i++){var pv=pvs[i];if(!pv||pv.disabled)continue;if(!ytId&&String(pv.service||'')==='Youtube')ytId=pv.pvId||'';if(!nicoId&&String(pv.service||'').indexOf('NicoNico')===0)nicoId=pv.pvId||'';}var parts=[];if(title)parts.push('\"\"\"'+title+'\"\"\"');if(ytId)parts.push(ytId);if(nicoId)parts.push(nicoId);if(!parts.length){alert('検索クエリを生成できませんでした。');return;}var query=(parts.length===1?parts[0]:'('+parts.join(' OR ')+')')+' lang:ja';window.open('https://x.com/search?q='+encodeURIComponent(query)+'&src=typed_query&f=live','_blank');}catch(err){alert('エラー: '+(err&&err.message?err.message:err));}})())"
      },
      {
        num: 9,
        id: 'kiite-niconico-transfer',
        tag: 'Kiite→ニコニコ',
        title: 'Kiite→ニコニコ 一括追加',
        description: 'Kiiteのプレイリストで実行してIDをコピーし、その後ニコニコ動画のマイリストページで再度同じブックマークレットを実行してマイリストに追加する統合版ツールです。',
        code: "javascript:void((async function(){var h=location.hostname;if(h.indexOf('kiite.jp')>=0){var b=document.querySelectorAll('[data-type=\"song\"][data-video-id]');if(!b.length)b=document.querySelectorAll('[data-video-id]');var s=new Set(),items=[];Array.prototype.forEach.call(b,function(e){var id=(e.getAttribute('data-video-id')||'').trim().toLowerCase();if(id&&/^[a-z]{2}\\d+$/.test(id)&&!s.has(id)){s.add(id);var m='',ct=e.querySelector('.playlist-cmnt-txt');if(!ct){var p=e;for(var i=0;i<6;i++){p=p&&p.parentElement;if(!p)break;ct=p.querySelector('.playlist-cmnt-txt');if(ct)break;}}if(ct)m=ct.textContent.trim();items.push({id:id,memo:m});}});if(!items.length){alert('動画IDが見つかりませんでした。');return;}var msg=items.length+' 件を取得しました！\\nニコニコのマイリスト一覧を開きますか？';try{await navigator.clipboard.writeText(JSON.stringify(items));}catch(e){}if(confirm(msg))window.open('https://www.nicovideo.jp/my/mylist/','_blank');}else if(h.indexOf('nicovideo.jp')>=0){var m=(location.pathname||'').match(/\\/mylist\\/(\\d+)/);if(!m){alert('ニコニコのマイリストページで実行してください。');return;}var id=m[1],raw=prompt('Kiiteで取得したIDリストを貼り付けてください:');if(!raw)return;var p;try{p=JSON.parse(raw);}catch(e){alert('形式が正しくありません。');return;}if(!p||!p.length){alert('IDリストが空です。');return;}var items=p.map(function(x){return typeof x==='string'?{id:x,memo:''}:x;});if(!confirm('マイリスト(ID: '+id+')に'+items.length+'件追加します。よろしいですか？'))return;var ok=0,fail=0;for(var i=0;i<items.length;i++){try{var res=await fetch('https://nvapi.nicovideo.jp/v1/users/me/mylists/'+id+'/items?itemId='+items[i].id,{method:'POST',credentials:'include',headers:{'X-Frontend-Id':'23','X-Request-With':'N-garage'}});if(res.status===201||res.status===200)ok++;else fail++;}catch(e){fail++;}if(i<items.length-1)await new Promise(function(r){setTimeout(r,500);});}alert('完了: '+ok+'件追加, '+fail+'件エラー');location.reload();}else{alert('KiiteまたはニコニコのマイリストページDe実行してください。');}})())"
      },
      {
        num: 10,
        id: 'kyulink-add',
        tag: 'KyuLink',
        title: 'KyuLink 新規リンク追加',
        description: '現在開いているページの情報を取得し、KyuLinkの追加画面を開きます。KyuLinkの管理者用です。',
        code: "javascript:(function(){const absolutize=(u)=>{if(!u)return'';try{return new URL(u,window.location.href).href;}catch(e){return u;}};const getMeta=(name)=>{const el=document.querySelector(`meta[property=\"${name}\"], meta[name=\"${name}\"]`);return el?(el.getAttribute('content')||''):'';};const getFavicon=()=>{const el=document.querySelector('link[rel=\"icon\"], link[rel=\"shortcut icon\"], link[rel=\"apple-touch-icon\"]');return el?el.href:'';};const data={url:window.location.href,title:document.title||getMeta('og:title'),desc:getMeta('og:description')||getMeta('description'),og_image:absolutize(getMeta('og:image')||getMeta('twitter:image')),favicon_url:getFavicon()};const params=new URLSearchParams();params.append('add','1');params.append('url',data.url);params.append('title',data.title);params.append('desc',data.desc);params.append('og_image',data.og_image);params.append('favicon_url',data.favicon_url);const kyuUrl='https://5gkyu.github.io/KyuLink/?'+params.toString();window.open(kyuUrl,'_blank')||(window.location.href=kyuUrl);})()"
      },
      {
        num: 11,
        id: 'github-pages-url',
        tag: '便利ツール',
        title: 'GitHub Pages URL変換',
        description: 'GitHubのファイルページで実行するか、任意のページで実行してURLを入力すると、対応するGitHub PagesのURLに変換してクリップボードにコピーします。',
        code: "javascript:(function(){var u=location.href,r=/^\\/\\/github\\.com\\/([^\\/]+)\\/([^\\/]+)\\/blob\\/[^\\/]+\\/(.+)$/,m=u.match(r);if(!m){u=prompt('GitHubのファイルURLを入力してください:');if(!u)return;m=u.match(r)}if(m){var user=m[1].toLowerCase(),repo=m[2],path=m[3],res='https://'+(repo.toLowerCase()===user+'.github.io'?user+'.github.io/'+path:user+'.github.io/'+repo+'/'+path);navigator.clipboard.writeText(res).then(function(){alert('コピーしました!\\n'+res)}).catch(function(){prompt('コピーしてください:',res)})}else{alert('正しいGitHubのファイルURLではありません。')}})()"
      },
      {
        num: 12,
        id: 'image-bulk-extractor',
        tag: '便利ツール',
        title: 'ページ画像一括抽出・ZIP保存',
        description: '表示中ページ内の全画像（img、背景画像、SVG等）を抽出してギャラリー表示。拡張子バッジやURL表示・コピー機能、ZIP一括ダウンロードができます。',
        code: "javascript:(function() {\n    var MIN_SIZE = 100;\n    var urls = new Map();\n\n    function addUrl(u, w, h) {\n      if (!u) return;\n      try {\n        u = new URL(u, location.href).href;\n      } catch (e) {\n        return;\n      }\n      if (!urls.has(u)) {\n        urls.set(u, { w: w || 0, h: h || 0 });\n      }\n    }\n\n    // 1. img要素（src, data-src, srcset）\n    document.querySelectorAll('img').forEach(function(img) {\n      addUrl(img.currentSrc || img.src, img.naturalWidth, img.naturalHeight);\n      ['data-src', 'data-original', 'data-lazy-src', 'data-url'].forEach(function(attr) {\n        var v = img.getAttribute(attr);\n        if (v) addUrl(v, img.naturalWidth, img.naturalHeight);\n      });\n      var ss = img.getAttribute('srcset') || img.getAttribute('data-srcset');\n      if (ss) {\n        ss.split(',').forEach(function(p) {\n          addUrl(p.trim().split(' ')[0], 0, 0);\n        });\n      }\n    });\n\n    // 2. picture / source\n    document.querySelectorAll('source').forEach(function(s) {\n      ['srcset', 'data-srcset', 'src'].forEach(function(attr) {\n        var v = s.getAttribute(attr);\n        if (v) {\n          v.split(',').forEach(function(p) {\n            addUrl(p.trim().split(' ')[0], 0, 0);\n          });\n        }\n      });\n    });\n\n    // 3. メタタグ（OGP画像、Twitter画像など）\n    document.querySelectorAll('meta[property*=\"image\"], meta[name*=\"image\"]').forEach(function(m) {\n      var c = m.getAttribute('content');\n      if (c) addUrl(c, 0, 0);\n    });\n\n    // 4. linkタグ（アイコン、apple-touch-icon、preload画像など）\n    document.querySelectorAll('link[rel*=\"icon\"], link[rel=\"apple-touch-icon\"], link[rel=\"image_src\"], link[rel=\"preload\"][as=\"image\"]').forEach(function(l) {\n      var h = l.getAttribute('href');\n      if (h) addUrl(h, 0, 0);\n    });\n\n    // 5. video poster\n    document.querySelectorAll('video[poster]').forEach(function(v) {\n      addUrl(v.poster || v.getAttribute('poster'), 0, 0);\n    });\n\n    // 6. svg image\n    document.querySelectorAll('svg image').forEach(function(s) {\n      addUrl(s.getAttribute('href') || s.getAttribute('xlink:href'), 0, 0);\n    });\n\n    // 7. 背景画像（CSS backgroundImage）\n    document.querySelectorAll('*').forEach(function(el) {\n      ['', '::before', '::after'].forEach(function(pseudo) {\n        var bg = getComputedStyle(el, pseudo || null).backgroundImage;\n        if (bg && bg.indexOf('url(') !== -1) {\n          var start = bg.indexOf('url(') + 4;\n          var end = bg.indexOf(')', start);\n          if (end !== -1) {\n            var raw = bg.substring(start, end).trim();\n            if ((raw.startsWith('\"') && raw.endsWith('\"')) || (raw.startsWith(\"'\") && raw.endsWith(\"'\"))) {\n              raw = raw.slice(1, -1);\n            }\n            addUrl(raw, 0, 0);\n          }\n        }\n      });\n    });\n\n    if (!urls.size) {\n      alert('画像が見つかりませんでした');\n      return;\n    }\n\n    var win = window.open('', '_blank');\n    if (!win) {\n      alert('ポップアップがブロックされました。ポップアップを許可して再度実行してください。');\n      return;\n    }\n\n    function getExt(u) {\n      if (u.indexOf('data:image/') === 0) {\n        var semi = u.indexOf(';');\n        if (semi !== -1) {\n          return u.substring(11, semi).replace('+xml', '').toLowerCase();\n        }\n      }\n      try {\n        var p = new URL(u).pathname;\n        var dot = p.lastIndexOf('.');\n        if (dot !== -1 && dot < p.length - 1) {\n          var ext = p.substring(dot + 1).split('?')[0].split('#')[0];\n          if (ext.length >= 2 && ext.length <= 5) {\n            return ext.toLowerCase();\n          }\n        }\n      } catch (e) {}\n      return 'jpg';\n    }\n\n    function getFileName(u) {\n      if (u.indexOf('data:') === 0) return 'data_image';\n      try {\n        var p = new URL(u).pathname;\n        var parts = p.split('/').filter(Boolean);\n        var name = parts.pop();\n        if (name) {\n          return decodeURIComponent(name.split('?')[0].split('#')[0]);\n        }\n      } catch (e) {}\n      return 'image';\n    }\n\n    var html = [\n      '<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Image Gallery</title>',\n      '<style>',\n      '*{box-sizing:border-box;margin:0;padding:0;}',\n      'body{font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;background:#FBF6EA;color:#6A564A;padding:20px;}',\n      '.bar{position:sticky;top:0;background:#fff;padding:12px 18px;margin-bottom:20px;border-radius:14px;box-shadow:0 4px 16px rgba(106,86,74,0.1);z-index:100;display:flex;flex-wrap:wrap;align-items:center;gap:10px;border:1px solid rgba(154,176,143,0.3);}',\n      '.btn{background:#fff;border:1.5px solid rgba(106,86,74,0.2);color:#6A564A;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;}',\n      '.btn:hover{background:rgba(154,176,143,0.15);border-color:#9AB08F;color:#556B4A;}',\n      '.btn-primary{background:#9AB08F;border-color:#9AB08F;color:#fff;}',\n      '.btn-primary:hover{background:#849A7A;border-color:#849A7A;color:#fff;}',\n      '#cnt{font-size:13px;font-weight:700;color:#6A564A;margin-left:auto;}',\n      '.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;}',\n      '.card{background:#fff;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(106,86,74,0.08);border:1.5px solid rgba(106,86,74,0.1);display:flex;flex-direction:column;gap:8px;transition:transform .15s,border-color .15s;}',\n      '.card:hover{border-color:#9AB08F;transform:translateY(-2px);box-shadow:0 6px 18px rgba(106,86,74,0.12);}',\n      '.img-box{width:100%;height:140px;background:#F6F1E3;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative;}',\n      '.img-box img{max-width:100%;max-height:100%;object-fit:contain;display:block;}',\n      '.ext-badge{position:absolute;top:6px;right:6px;background:rgba(106,86,74,0.75);color:#fff;font-size:10px;font-weight:800;padding:2px 6px;border-radius:5px;letter-spacing:.05em;text-transform:uppercase;}',\n      '.meta{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(106,86,74,0.7);}',\n      '.url-box{display:flex;align-items:center;gap:6px;background:#FBF6EA;padding:5px 8px;border-radius:6px;border:1px solid rgba(106,86,74,0.1);font-size:11px;}',\n      '.url-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#6A564A;text-decoration:none;}',\n      '.url-text:hover{text-decoration:underline;color:#9AB08F;}',\n      '.btn-copy{border:none;background:#fff;color:#6A564A;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:10.5px;font-weight:700;border:1px solid rgba(106,86,74,0.2);flex-shrink:0;}',\n      '.btn-copy:hover{background:#9AB08F;color:#fff;border-color:#9AB08F;}',\n      '.label-row{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;cursor:pointer;user-select:none;}',\n      '.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#6A564A;color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:200;}',\n      '.toast.show{opacity:1;}',\n      '</style></head><body>',\n      '<div class=\"bar\">',\n      '<button class=\"btn\" id=\"selAll\">全選択</button>',\n      '<button class=\"btn\" id=\"selNone\">全解除</button>',\n      '<button class=\"btn\" id=\"selMin\">100px以上</button>',\n      '<button class=\"btn btn-primary\" id=\"dlZip\">選択した画像をZIP保存</button>',\n      '<span id=\"cnt\"></span>',\n      '</div>',\n      '<div class=\"grid\" id=\"grid\"></div>',\n      '<div class=\"toast\" id=\"toast\"></div>',\n      '<script src=\"https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js\"><\\\\/script>',\n      '</body></html>'\n    ].join('');\n\n    win.document.write(html);\n    win.document.close();\n\n    var list = Array.from(urls.entries());\n    var grid = win.document.getElementById('grid');\n    var cnt = win.document.getElementById('cnt');\n    var toast = win.document.getElementById('toast');\n\n    function showToast(msg) {\n      toast.textContent = msg;\n      toast.classList.add('show');\n      setTimeout(function() {\n        toast.classList.remove('show');\n      }, 1800);\n    }\n\n    list.forEach(function(entry, i) {\n      var url = entry[0], meta = entry[1];\n      var ext = getExt(url);\n      var fn = getFileName(url);\n      var isSmall = meta.w && meta.h && (meta.w < MIN_SIZE || meta.h < MIN_SIZE);\n\n      var card = win.document.createElement('div');\n      card.className = 'card';\n\n      var imgBox = win.document.createElement('div');\n      imgBox.className = 'img-box';\n\n      var img = win.document.createElement('img');\n      img.src = url;\n      img.loading = 'lazy';\n      img.onload = function() {\n        if (!meta.w || !meta.h) {\n          meta.w = this.naturalWidth;\n          meta.h = this.naturalHeight;\n          dimSpan.textContent = meta.w + ' x ' + meta.h;\n          if (meta.w < MIN_SIZE || meta.h < MIN_SIZE) {\n            cb.checked = false;\n            updateCount();\n          }\n        }\n      };\n\n      var extBadge = win.document.createElement('span');\n      extBadge.className = 'ext-badge';\n      extBadge.textContent = ext.toUpperCase();\n\n      imgBox.appendChild(img);\n      imgBox.appendChild(extBadge);\n\n      var labelRow = win.document.createElement('label');\n      labelRow.className = 'label-row';\n\n      var cb = win.document.createElement('input');\n      cb.type = 'checkbox';\n      cb.checked = !isSmall;\n      cb.dataset.url = url;\n      cb.dataset.ext = ext;\n      cb.dataset.fn = fn;\n\n      var numSpan = win.document.createElement('span');\n      numSpan.textContent = '#' + (i + 1) + ' ' + (fn.length > 18 ? fn.slice(0, 15) + '...' : fn);\n      numSpan.title = fn;\n\n      labelRow.appendChild(cb);\n      labelRow.appendChild(numSpan);\n\n      var metaRow = win.document.createElement('div');\n      metaRow.className = 'meta';\n\n      var dimSpan = win.document.createElement('span');\n      dimSpan.textContent = (meta.w && meta.h) ? (meta.w + ' x ' + meta.h) : '読込中...';\n\n      var extSpan = win.document.createElement('span');\n      extSpan.textContent = '形式: ' + ext.toUpperCase();\n\n      metaRow.appendChild(dimSpan);\n      metaRow.appendChild(extSpan);\n\n      var urlBox = win.document.createElement('div');\n      urlBox.className = 'url-box';\n\n      var urlLink = win.document.createElement('a');\n      urlLink.className = 'url-text';\n      urlLink.href = url;\n      urlLink.target = '_blank';\n      urlLink.rel = 'noopener noreferrer';\n      urlLink.title = url;\n      urlLink.textContent = url;\n\n      var cpBtn = win.document.createElement('button');\n      cpBtn.className = 'btn-copy';\n      cpBtn.textContent = 'コピー';\n      cpBtn.type = 'button';\n      cpBtn.onclick = function(e) {\n        e.stopPropagation();\n        if (win.navigator && win.navigator.clipboard) {\n          win.navigator.clipboard.writeText(url).then(function() {\n            showToast('URLをコピーしました');\n          });\n        } else {\n          var ta = win.document.createElement('textarea');\n          ta.value = url;\n          win.document.body.appendChild(ta);\n          ta.select();\n          win.document.execCommand('copy');\n          win.document.body.removeChild(ta);\n          showToast('URLをコピーしました');\n        }\n      };\n\n      urlBox.appendChild(urlLink);\n      urlBox.appendChild(cpBtn);\n\n      card.appendChild(imgBox);\n      card.appendChild(labelRow);\n      card.appendChild(metaRow);\n      card.appendChild(urlBox);\n      grid.appendChild(card);\n    });\n\n    function updateCount() {\n      var n = win.document.querySelectorAll('#grid input:checked').length;\n      cnt.textContent = n + ' / ' + list.length + ' 件選択中';\n    }\n    updateCount();\n\n    win.document.getElementById('selAll').onclick = function() {\n      win.document.querySelectorAll('#grid input').forEach(function(c) {\n        c.checked = true;\n      });\n      updateCount();\n    };\n    win.document.getElementById('selNone').onclick = function() {\n      win.document.querySelectorAll('#grid input').forEach(function(c) {\n        c.checked = false;\n      });\n      updateCount();\n    };\n    win.document.getElementById('selMin').onclick = function() {\n      list.forEach(function(entry, i) {\n        var meta = entry[1];\n        var cb = win.document.querySelectorAll('#grid input')[i];\n        if (cb) {\n          cb.checked = !meta.w || !meta.h || (meta.w >= MIN_SIZE && meta.h >= MIN_SIZE);\n        }\n      });\n      updateCount();\n    };\n    win.document.getElementById('grid').addEventListener('change', updateCount);\n\n    win.document.getElementById('dlZip').onclick = function() {\n      var checked = Array.from(win.document.querySelectorAll('#grid input:checked')).map(function(c) {\n        return { url: c.dataset.url, ext: c.dataset.ext, fn: c.dataset.fn };\n      });\n      if (!checked.length) {\n        win.alert('画像を選択してください');\n        return;\n      }\n      if (!win.JSZip) {\n        win.alert('ZIPライブラリの読み込み中です。少し待って再度お試しください');\n        return;\n      }\n      var btn = this;\n      btn.disabled = true;\n      btn.textContent = 'ZIP作成中 (0/' + checked.length + ')...';\n      var zip = new win.JSZip();\n      var done = 0;\n      checked.forEach(function(item, i) {\n        fetch(item.url).then(function(r) {\n          return r.blob();\n        }).then(function(blob) {\n          var ext = (blob.type.split('/')[1] || item.ext || 'jpg').split('+')[0];\n          var baseName = item.fn || 'image';\n          var dotIdx = baseName.lastIndexOf('.');\n          if (dotIdx > 0) baseName = baseName.substring(0, dotIdx);\n          var name = (i + 1) + '_' + baseName + '.' + ext;\n          zip.file(name, blob);\n        }).catch(function() {}).finally(function() {\n          done++;\n          btn.textContent = 'ZIP作成中 (' + done + '/' + checked.length + ')...';\n          if (done === checked.length) {\n            zip.generateAsync({ type: 'blob' }).then(function(content) {\n              var a = win.document.createElement('a');\n              a.href = win.URL.createObjectURL(content);\n              a.download = 'images_' + Date.now() + '.zip';\n              a.click();\n              btn.disabled = false;\n              btn.textContent = '選択した画像をZIP保存';\n            });\n          }\n        });\n      });\n    };\n  })()"
      },
      {
        num: 13,
        id: 'site-meta-audit',
        tag: 'サイト管理',
        title: 'サイトメタデータ監査',
        description: 'OGP、description、title、JSON-LD等のメタ情報を一覧表示。SNSシェア時のプレビュー確認にも。',
        code: "javascript:void(function(){try{var old=document.getElementById('__bm_meta_audit__');if(old)old.remove();var info={};info.title=document.title||'(未設定)';info.url=location.href;info.charset=(document.characterSet||document.charset||'(不明)');info.lang=(document.documentElement.lang||'(未設定)');var metas=[];document.querySelectorAll('meta').forEach(function(m){var n=m.getAttribute('name')||m.getAttribute('property')||m.getAttribute('http-equiv')||'';var c=m.getAttribute('content')||m.getAttribute('value')||'';if(n||c)metas.push({name:n,content:c});});var ogp={};metas.forEach(function(m){if(m.name.indexOf('og:')===0)ogp[m.name]=m.content;if(m.name.indexOf('twitter:')===0)ogp[m.name]=m.content;});var desc='';metas.forEach(function(m){if(m.name.toLowerCase()==='description')desc=m.content;});var jsonld=[];document.querySelectorAll('script[type=\\\"application/ld+json\\\"]').forEach(function(s){try{var j=JSON.parse(s.textContent);jsonld.push(j);}catch(e){}});var canonical='';var cl=document.querySelector('link[rel=\\\"canonical\\\"]');if(cl)canonical=cl.href||'';var h1s=document.querySelectorAll('h1');var ov=document.createElement('div');ov.id='__bm_meta_audit__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(720px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='サイトメタデータ監査';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:16px;overflow:auto;display:flex;flex-direction:column;gap:14px;font-size:13px;line-height:1.6;';function addSection(title,items){var sec=document.createElement('div');sec.style.cssText='background:#fff;border-radius:12px;padding:12px 14px;border:1px solid rgba(154,176,143,.2);';var st=document.createElement('div');st.style.cssText='font-weight:700;font-size:13px;margin-bottom:8px;color:#556B4A;';st.textContent=title;sec.appendChild(st);items.forEach(function(it){var r=document.createElement('div');r.style.cssText='display:flex;gap:8px;padding:4px 0;border-bottom:1px solid rgba(106,86,74,.06);font-size:12px;';var lb=document.createElement('span');lb.style.cssText='font-weight:600;min-width:120px;flex-shrink:0;color:#6A564A;word-break:break-all;';lb.textContent=it.label;var vl=document.createElement('span');vl.style.cssText='flex:1;word-break:break-all;color:'+(it.warn?'#c0392b':'#6A564A')+';';vl.textContent=it.value;r.appendChild(lb);r.appendChild(vl);sec.appendChild(r);});bd.appendChild(sec);}addSection('基本情報',[{label:'title',value:info.title,warn:!document.title},{label:'description',value:desc||'(未設定)',warn:!desc},{label:'URL',value:info.url},{label:'canonical',value:canonical||'(未設定)',warn:!canonical},{label:'charset',value:info.charset},{label:'lang',value:info.lang,warn:!document.documentElement.lang},{label:'h1の数',value:h1s.length+'個'+(h1s.length!==1?' (推奨: 1個)':''),warn:h1s.length!==1}]);if(Object.keys(ogp).length){var ogpItems=[];for(var k in ogp)ogpItems.push({label:k,value:ogp[k]});addSection('OGP / Twitter Card',ogpItems);}else{addSection('OGP / Twitter Card',[{label:'状態',value:'OGPタグが見つかりません',warn:true}]);}if(jsonld.length){addSection('JSON-LD (構造化データ)',[{label:'数',value:jsonld.length+'件'},{label:'内容',value:JSON.stringify(jsonld,null,1).substring(0,500)+(JSON.stringify(jsonld).length>500?'...':'')}]);}else{addSection('JSON-LD (構造化データ)',[{label:'状態',value:'JSON-LDが見つかりません',warn:true}]);}if(metas.length){var metaItems=metas.slice(0,30).map(function(m){return{label:m.name||'(属性なし)',value:m.content};});addSection('全metaタグ (上位30件)',metaItems);}box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 14,
        id: 'link-checker',
        tag: 'サイト管理',
        title: 'リンクチェッカー',
        description: 'ページ内の全リンクを検証し、404やエラーリンクをハイライト表示。壊れたリンクの発見に。',
        code: "javascript:void((async function(){try{var old=document.getElementById('__bm_link_check__');if(old)old.remove();var links=[];var seen=new Set();document.querySelectorAll('a[href]').forEach(function(a){var h=a.href;if(!h||h.indexOf('javascript:')===0||h.indexOf('mailto:')===0||h.indexOf('tel:')===0||h==='#')return;try{h=new URL(h,location.href).href;}catch(e){return;}if(seen.has(h))return;seen.add(h);links.push({url:h,text:(a.textContent||'').trim().substring(0,60),el:a,status:null,ok:null});});if(!links.length){alert('リンクが見つかりませんでした。');return;}var ov=document.createElement('div');ov.id='__bm_link_check__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(760px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='リンクチェッカー ('+links.length+'件)';var prog=document.createElement('span');prog.style.cssText='font-size:12px;color:#888;';prog.textContent='検証中...';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(prog);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:12px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:12px;';links.forEach(function(lk){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border-radius:10px;border:1px solid rgba(154,176,143,.15);';var badge=document.createElement('span');badge.style.cssText='min-width:44px;text-align:center;padding:3px 6px;border-radius:6px;font-size:11px;font-weight:700;background:#eee;color:#999;';badge.textContent='...';lk._badge=badge;var info=document.createElement('div');info.style.cssText='flex:1;min-width:0;';var urlDiv=document.createElement('div');urlDiv.style.cssText='font-size:11px;color:#6A564A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';urlDiv.textContent=lk.url;var textDiv=document.createElement('div');textDiv.style.cssText='font-size:10px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;';textDiv.textContent=lk.text||'(テキストなし)';info.appendChild(urlDiv);info.appendChild(textDiv);row.appendChild(badge);row.appendChild(info);bd.appendChild(row);lk._row=row;});box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});var done=0,okCount=0,errCount=0;for(var i=0;i<links.length;i++){var lk=links[i];try{var r=await fetch(lk.url,{method:'HEAD',mode:'no-cors',cache:'no-cache'});var st=r.status;if(r.type==='opaque'){lk._badge.textContent='CORS';lk._badge.style.background='#ffeaa7';lk._badge.style.color='#d68910';lk.ok=true;okCount++;}else if(st>=200&&st<400){lk._badge.textContent=st;lk._badge.style.background='#d5f5e3';lk._badge.style.color='#1e8449';lk.ok=true;okCount++;}else{lk._badge.textContent=st;lk._badge.style.background='#fadbd8';lk._badge.style.color='#c0392b';lk._row.style.borderColor='#e74c3c';lk.el.style.outline='3px solid #e74c3c';lk.ok=false;errCount++;}}catch(e){lk._badge.textContent='ERR';lk._badge.style.background='#fadbd8';lk._badge.style.color='#c0392b';lk._row.style.borderColor='#e74c3c';lk.el.style.outline='3px solid #e74c3c';lk.ok=false;errCount++;}done++;prog.textContent=done+'/'+links.length+' 完了 (OK:'+okCount+' NG:'+errCount+')';}prog.textContent='完了 - OK:'+okCount+' NG:'+errCount+' / '+links.length+'件';}catch(e){alert('エラー: '+e);}})())"
      },
      {
        num: 15,
        id: 'asset-list',
        tag: 'サイト管理',
        title: 'CSS/JSアセット一覧',
        description: '外部読み込みのスクリプト・スタイルシートを一覧表示。読み込み状況や重複チェックに。',
        code: "javascript:void(function(){try{var old=document.getElementById('__bm_asset_list__');if(old)old.remove();var assets=[];document.querySelectorAll('script[src]').forEach(function(s){assets.push({type:'JS',url:s.src,async:s.async,defer:s.defer,crossorigin:s.crossOrigin||''});});document.querySelectorAll('link[rel=\\\"stylesheet\\\"]').forEach(function(l){assets.push({type:'CSS',url:l.href,media:l.media||'all',crossorigin:l.crossOrigin||''});});document.querySelectorAll('link[rel=\\\"preload\\\"],link[rel=\\\"prefetch\\\"],link[rel=\\\"preconnect\\\"],link[rel=\\\"dns-prefetch\\\"]').forEach(function(l){assets.push({type:l.rel.toUpperCase(),url:l.href,as:l.getAttribute('as')||''});});var inlineJS=document.querySelectorAll('script:not([src])').length;var inlineCSS=document.querySelectorAll('style').length;var ov=document.createElement('div');ov.id='__bm_asset_list__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(800px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='CSS/JS アセット一覧';var sm=document.createElement('span');sm.style.cssText='font-size:12px;color:#888;';sm.textContent='外部: '+assets.length+'件 / インラインJS: '+inlineJS+'件, CSS: '+inlineCSS+'件';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(sm);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:12px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:12px;';var dupes=new Map();assets.forEach(function(a){dupes.set(a.url,(dupes.get(a.url)||0)+1);});assets.forEach(function(a,i){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border-radius:10px;border:1px solid rgba(154,176,143,.15);';var badge=document.createElement('span');var bg=a.type==='JS'?'#fdebd0':a.type==='CSS'?'#d4efdf':'#d6eaf8';var col=a.type==='JS'?'#e67e22':a.type==='CSS'?'#27ae60':'#2980b9';badge.style.cssText='min-width:50px;text-align:center;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;background:'+bg+';color:'+col+';';badge.textContent=a.type;var info=document.createElement('div');info.style.cssText='flex:1;min-width:0;';var urlDiv=document.createElement('div');urlDiv.style.cssText='font-size:11px;color:#6A564A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';urlDiv.textContent=a.url;var detailDiv=document.createElement('div');detailDiv.style.cssText='font-size:10px;color:#999;margin-top:2px;';var details=[];if(a.async)details.push('async');if(a.defer)details.push('defer');if(a.media&&a.media!=='all')details.push('media:'+a.media);if(a.as)details.push('as:'+a.as);if(dupes.get(a.url)>1)details.push('重複!');detailDiv.textContent=details.join(' | ')||'';info.appendChild(urlDiv);if(details.length)info.appendChild(detailDiv);var cpBtn=document.createElement('button');cpBtn.type='button';cpBtn.textContent='コピー';cpBtn.style.cssText='border:1px solid rgba(106,86,74,.2);background:#fff;color:#6A564A;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;flex-shrink:0;';cpBtn.onclick=function(){navigator.clipboard.writeText(a.url).catch(function(){});cpBtn.textContent='OK';setTimeout(function(){cpBtn.textContent='コピー';},1200);};if(dupes.get(a.url)>1){row.style.borderColor='#e67e22';row.style.background='#fef9f0';}row.appendChild(badge);row.appendChild(info);row.appendChild(cpBtn);bd.appendChild(row);});box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 16,
        id: 'page-performance',
        tag: 'サイト管理',
        title: 'ページパフォーマンス計測',
        description: 'DOM要素数、ファイルサイズ、読込時間などの基本パフォーマンス指標を表示。',
        code: "javascript:void(function(){try{var old=document.getElementById('__bm_perf__');if(old)old.remove();var perf=performance.getEntriesByType('navigation')[0]||performance.timing;var res=performance.getEntriesByType('resource');var allEls=document.querySelectorAll('*').length;var imgs=document.querySelectorAll('img').length;var scripts=document.querySelectorAll('script').length;var styles=document.querySelectorAll('link[rel=stylesheet],style').length;var iframes=document.querySelectorAll('iframe').length;var totalSize=0;var typeSize={};res.forEach(function(r){var s=r.transferSize||r.encodedBodySize||0;totalSize+=s;var t=r.initiatorType||'other';typeSize[t]=(typeSize[t]||0)+s;});function fmt(b){if(b<1024)return b+'B';if(b<1048576)return(b/1024).toFixed(1)+'KB';return(b/1048576).toFixed(2)+'MB';}var dns=0,tcp=0,ttfb=0,dom=0,load=0,fcp=0;if(perf.domainLookupEnd){dns=Math.round(perf.domainLookupEnd-perf.domainLookupStart);tcp=Math.round(perf.connectEnd-perf.connectStart);ttfb=Math.round(perf.responseStart-(perf.requestStart||perf.fetchStart));dom=Math.round(perf.domContentLoadedEventEnd-perf.fetchStart);load=Math.round(perf.loadEventEnd-perf.fetchStart);}var fcpEntry=performance.getEntriesByName('first-contentful-paint');if(fcpEntry&&fcpEntry.length)fcp=Math.round(fcpEntry[0].startTime);var ov=document.createElement('div');ov.id='__bm_perf__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(680px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='ページパフォーマンス';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:16px;overflow:auto;display:flex;flex-direction:column;gap:14px;font-size:13px;';function addCard(title,rows){var c=document.createElement('div');c.style.cssText='background:#fff;border-radius:12px;padding:12px 14px;border:1px solid rgba(154,176,143,.2);';var t=document.createElement('div');t.style.cssText='font-weight:700;font-size:13px;margin-bottom:8px;color:#556B4A;';t.textContent=title;c.appendChild(t);rows.forEach(function(r){var d=document.createElement('div');d.style.cssText='display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(106,86,74,.06);font-size:12px;';var l=document.createElement('span');l.style.fontWeight='600';l.textContent=r[0];var v=document.createElement('span');v.style.color=r[2]||'#6A564A';v.style.fontWeight='600';v.textContent=r[1];d.appendChild(l);d.appendChild(v);c.appendChild(d);});bd.appendChild(c);}addCard('読み込み時間',[['DNS',dns+'ms'],['TCP接続',tcp+'ms'],['TTFB (最初のバイト)',ttfb+'ms',ttfb>600?'#c0392b':'#27ae60'],['FCP (最初の描画)',fcp+'ms',fcp>2500?'#c0392b':fcp>1000?'#e67e22':'#27ae60'],['DOM読込完了',dom+'ms',dom>3000?'#c0392b':'#27ae60'],['ページ読込完了',load+'ms',load>5000?'#c0392b':'#27ae60']]);addCard('DOM統計',[['全要素数',allEls+(allEls>1500?' (多め)':''),allEls>1500?'#e67e22':'#27ae60'],['img要素',imgs+'個'],['script要素',scripts+'個'],['style/link[css]',styles+'個'],['iframe',iframes+'個']]);var sizeRows=[['合計転送サイズ',fmt(totalSize)]];for(var k in typeSize){sizeRows.push([k,fmt(typeSize[k])]);}addCard('リソースサイズ ('+res.length+'件)',sizeRows);box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 17,
        id: 'text-bulk-copy',
        tag: 'サイト管理',
        title: '全テキスト一括コピー',
        description: 'ページの主要テキスト（見出し・段落）を構造付きでクリップボードにコピー。コンテンツ移行に。',
        code: "javascript:void(function(){try{var old=document.getElementById('__bm_text_copy__');if(old)old.remove();var headings=['h1','h2','h3','h4','h5','h6'];var allNodes=document.querySelectorAll(headings.join(',')+',p,li,td,th,blockquote,figcaption,dt,dd');var result=[];allNodes.forEach(function(el){var tag=el.tagName.toLowerCase();var text=(el.textContent||'').trim();if(!text||text.length<2)return;var prefix='';if(tag==='h1')prefix='# ';else if(tag==='h2')prefix='## ';else if(tag==='h3')prefix='### ';else if(tag==='h4')prefix='#### ';else if(tag==='h5')prefix='##### ';else if(tag==='h6')prefix='###### ';else if(tag==='li')prefix='- ';else if(tag==='blockquote')prefix='> ';else if(tag==='dt')prefix='**';else if(tag==='dd')prefix='  ';if(tag==='dt')text=text+'**';result.push(prefix+text);});if(!result.length){alert('テキストが見つかりませんでした。');return;}var output=result.join('\\n\\n');var ov=document.createElement('div');ov.id='__bm_text_copy__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(700px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='テキスト抽出 ('+result.length+'ブロック)';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:14px;overflow:auto;display:flex;flex-direction:column;gap:10px;';var ta=document.createElement('textarea');ta.readOnly=true;ta.value=output;ta.style.cssText='width:100%;height:300px;padding:12px;border:1px solid rgba(154,176,143,.3);border-radius:10px;font-size:12px;font-family:ui-monospace,monospace;resize:vertical;line-height:1.6;color:#6A564A;background:#fff;';var btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;flex-wrap:wrap;';var btnCopy=document.createElement('button');btnCopy.type='button';btnCopy.textContent='クリップボードにコピー';btnCopy.style.cssText='border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;background:#9AB08F;color:#fff;';btnCopy.onclick=function(){navigator.clipboard.writeText(output).then(function(){btnCopy.textContent='コピーしました';btnCopy.style.background='#556B4A';setTimeout(function(){btnCopy.textContent='クリップボードにコピー';btnCopy.style.background='#9AB08F';},1800);}).catch(function(){ta.focus();ta.select();document.execCommand('copy');});};var btnClose=document.createElement('button');btnClose.type='button';btnClose.textContent='閉じる';btnClose.style.cssText='border:1.5px solid rgba(106,86,74,.2);border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;background:#fff;color:#6A564A;';btnClose.onclick=function(){ov.remove();};btnRow.appendChild(btnCopy);btnRow.appendChild(btnClose);bd.appendChild(ta);bd.appendChild(btnRow);box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 18,
        id: 'accessibility-check',
        tag: 'サイト管理',
        title: 'アクセシビリティチェック',
        description: 'alt属性の欠落、コントラスト不足、見出し階層の問題等を簡易診断。',
        code: "javascript:void(function(){try{var old=document.getElementById('__bm_a11y__');if(old)old.remove();var issues=[];var warnings=[];var good=[];var imgs=document.querySelectorAll('img');var noAlt=0;imgs.forEach(function(img){if(!img.hasAttribute('alt')){noAlt++;img.style.outline='3px solid #e74c3c';}});if(noAlt>0)issues.push('alt属性なしの画像: '+noAlt+'枚');else good.push('全画像にalt属性あり ('+imgs.length+'枚)');var headings=document.querySelectorAll('h1,h2,h3,h4,h5,h6');var h1Count=document.querySelectorAll('h1').length;if(h1Count===0)issues.push('h1要素がありません');else if(h1Count>1)warnings.push('h1要素が'+h1Count+'個あります (推奨: 1個)');else good.push('h1要素は1個 (適切)');var prevLevel=0;var skipCount=0;headings.forEach(function(h){var level=parseInt(h.tagName.charAt(1));if(prevLevel>0&&level>prevLevel+1)skipCount++;prevLevel=level;});if(skipCount>0)warnings.push('見出しレベルのスキップ: '+skipCount+'箇所');else good.push('見出し階層は適切 ('+headings.length+'個)');var inputs=document.querySelectorAll('input,select,textarea');var noLabel=0;inputs.forEach(function(inp){if(inp.type==='hidden'||inp.type==='submit'||inp.type==='button')return;var hasLabel=inp.id&&document.querySelector('label[for=\\\"'+inp.id+'\\\"]');var hasAria=inp.getAttribute('aria-label')||inp.getAttribute('aria-labelledby');var wrapped=inp.closest('label');if(!hasLabel&&!hasAria&&!wrapped){noLabel++;inp.style.outline='3px solid #e67e22';}});if(noLabel>0)warnings.push('ラベルなしフォーム要素: '+noLabel+'個');else if(inputs.length)good.push('全フォーム要素にラベルあり');var buttons=document.querySelectorAll('button,a[role=button],[role=button]');var emptyBtn=0;buttons.forEach(function(b){var text=(b.textContent||'').trim();var ariaLabel=b.getAttribute('aria-label')||'';var title=b.getAttribute('title')||'';if(!text&&!ariaLabel&&!title){emptyBtn++;b.style.outline='3px solid #8e44ad';}});if(emptyBtn>0)warnings.push('テキストなしボタン/リンク: '+emptyBtn+'個');else if(buttons.length)good.push('全ボタンにテキストあり');var langAttr=document.documentElement.lang;if(!langAttr)issues.push('html要素にlang属性がありません');else good.push('lang属性: '+langAttr);var tabIndex=document.querySelectorAll('[tabindex]');var negTab=0;tabIndex.forEach(function(el){if(parseInt(el.getAttribute('tabindex'))<0)negTab++;});if(negTab>0)warnings.push('tabindex=\\\"-1\\\"の要素: '+negTab+'個');var ov=document.createElement('div');ov.id='__bm_a11y__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(680px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='アクセシビリティチェック';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:16px;overflow:auto;display:flex;flex-direction:column;gap:12px;font-size:13px;';var score=Math.max(0,100-issues.length*20-warnings.length*8);var scoreDiv=document.createElement('div');scoreDiv.style.cssText='text-align:center;padding:16px;background:#fff;border-radius:12px;border:1px solid rgba(154,176,143,.2);';var scoreNum=document.createElement('div');scoreNum.style.cssText='font-size:42px;font-weight:800;color:'+(score>=80?'#27ae60':score>=50?'#e67e22':'#c0392b')+';';scoreNum.textContent=score;var scoreLbl=document.createElement('div');scoreLbl.style.cssText='font-size:12px;color:#888;margin-top:4px;';scoreLbl.textContent='アクセシビリティスコア (簡易)';scoreDiv.appendChild(scoreNum);scoreDiv.appendChild(scoreLbl);bd.appendChild(scoreDiv);function addList(title,items,color,icon){if(!items.length)return;var sec=document.createElement('div');sec.style.cssText='background:#fff;border-radius:12px;padding:12px 14px;border:1px solid rgba(154,176,143,.2);';var st=document.createElement('div');st.style.cssText='font-weight:700;font-size:13px;margin-bottom:8px;color:'+color+';';st.textContent=icon+' '+title+' ('+items.length+')';sec.appendChild(st);items.forEach(function(it){var r=document.createElement('div');r.style.cssText='padding:4px 0;border-bottom:1px solid rgba(106,86,74,.06);font-size:12px;color:#6A564A;';r.textContent='\\u2022 '+it;sec.appendChild(r);});bd.appendChild(sec);}addList('問題',issues,'#c0392b','\\u26a0');addList('警告',warnings,'#e67e22','\\u26a1');addList('良好',good,'#27ae60','\\u2713');box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()"
      },
      {
        num: 19,
        id: 'open-in-new-tab',
        tag: '便利ツール',
        title: '別タブで開く',
        description: '現在開いているページを新しいタブで複製して開きます。',
        code: "javascript:void(window.open(location.href,'_blank'))"
      }
    ];
  }

  /* ── オーバーレイを閉じる ───────────────────────────────── */
  function _closeOv(ov) {
    var panel = ov.querySelector('[data-bm=panel]');
    if (panel) {
      panel.style.transform = 'translateY(110%)';
      panel.style.opacity   = '0';
    }
    ov.style.opacity = '0';
    setTimeout(function () {
      if (ov && ov.parentNode) ov.remove();
      var st = document.getElementById(STYLE_ID);
      if (st && st.parentNode) st.remove();
    }, 340);
  }

  /* ── コード実行（オーバーレイを閉じてから）─────────────── */
  function _execute(ov, code) {
    _closeOv(ov);
    setTimeout(function () {
      /* "javascript:" プレフィックスを除去 */
      var js = (code || '').replace(/^javascript:/i, '').trim();
      try { js = decodeURIComponent(js); } catch (_) {}
      try {
        (0, eval)(js); // eslint-disable-line no-eval
      } catch (err) {
        alert('実行エラー: ' + (err && err.message ? err.message : String(err)));
      }
    }, 380);
  }

  /* ── UI 構築 ────────────────────────────────────────────── */
  function _buildUI(data) {
    /* タグ一覧（重複排除） */
    var tags = ['すべて'];
    data.forEach(function (bm) {
      if (tags.indexOf(bm.tag) === -1) tags.push(bm.tag);
    });
    var activeTag = 'すべて';
    var searchQ   = '';

    /* ── CSS 注入 ─────────────────────────────────────────── */
    var styleEl = document.createElement('style');
    styleEl.id  = STYLE_ID;
    styleEl.textContent = [
      '#' + OVERLAY_ID + ' * {',
      '  box-sizing: border-box;',
      '  -webkit-font-smoothing: antialiased;',
      '}',
      '#' + OVERLAY_ID + ' {',
      '  position: fixed !important; inset: 0 !important;',
      '  z-index: 2147483647 !important;',
      '  background: rgba(74, 59, 50, 0.48) !important;',
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
      '  display: flex !important; align-items: flex-end !important;',
      '  justify-content: center !important;',
      '  opacity: 0; transition: opacity 0.25s ease;',
      '  padding: 0 !important;',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Hiragino Sans, "Noto Sans JP", sans-serif !important;',
      '}',
      '#' + OVERLAY_ID + '.bm-open { opacity: 1 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=panel] {',
      '  background: #FBF6EA !important; width: 100%; max-height: 90dvh;',
      '  border-radius: 24px 24px 0 0; display: flex; flex-direction: column;',
      '  overflow: hidden; transform: translateY(100%); opacity: 1;',
      '  transition: transform 0.35s cubic-bezier(0.32, 1.25, 0.6, 1), opacity 0.25s ease;',
      '  box-shadow: 0 -8px 48px rgba(106, 86, 74, 0.25);',
      '}',
      '#' + OVERLAY_ID + '.bm-open [data-bm=panel] { transform: translateY(0) !important; }',
      '@media (min-width: 640px) {',
      '  #' + OVERLAY_ID + ' { align-items: center !important; padding: 40px 32px !important; }',
      '  #' + OVERLAY_ID + ' [data-bm=panel] {',
      '    width: min(880px, 94vw); max-height: 84dvh;',
      '    border-radius: 24px;',
      '    transform: scale(0.92) translateY(20px);',
      '    border: 1.5px solid rgba(154, 176, 143, 0.35);',
      '    box-shadow: 0 24px 72px rgba(106, 86, 74, 0.24);',
      '  }',
      '  #' + OVERLAY_ID + '.bm-open [data-bm=panel] { transform: scale(1) translateY(0) !important; }',
      '}',
      '@media (min-width: 1040px) {',
      '  #' + OVERLAY_ID + ' [data-bm=panel] { width: min(1120px, 92vw); max-height: 84dvh; border-radius: 26px; }',
      '}',
      '#' + OVERLAY_ID + ' [data-bm=handle] { width: 44px; height: 5px; background: rgba(106, 86, 74, 0.18);',
      '  border-radius: 99px; margin: 14px auto 6px !important; flex-shrink: 0; order: 1; }',
      '@media (min-width: 640px) { #' + OVERLAY_ID + ' [data-bm=handle] { display: none; } }',
      '#' + OVERLAY_ID + ' [data-bm=header] { padding: 16px 22px 14px !important; flex-shrink: 0; background: #FBF6EA !important;',
      '  border-bottom: 1px solid rgba(106, 86, 74, 0.1); position: relative; order: 2; }',
      '@media (min-width: 640px) { #' + OVERLAY_ID + ' [data-bm=header] { padding: 24px 36px 14px !important; border-bottom: none !important; order: 1; } }',
      '#' + OVERLAY_ID + ' [data-bm=head-top] { display: flex; align-items: center; justify-content: space-between; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=title] { font-size: 17px; font-weight: 800; color: #6A564A !important;',
      '  letter-spacing: -0.01em; display: flex; align-items: center; gap: 9px; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=logo] { width: 22px; height: 22px; object-fit: contain; border-radius: 6px; flex-shrink: 0; display: inline-block; }',
      '#' + OVERLAY_ID + ' [data-bm=title-badge] { font-size: 11.5px; font-weight: 700; background: rgba(154, 176, 143, 0.22);',
      '  color: #556B4A; padding: 2px 8px !important; border-radius: 7px; border: 1px solid rgba(154, 176, 143, 0.35); }',
      '#' + OVERLAY_ID + ' [data-bm=close-x] { border: none; background: rgba(106, 86, 74, 0.08); cursor: pointer; color: #6A564A;',
      '  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;',
      '  justify-content: center; transition: background 0.15s, color 0.15s; padding: 0 !important; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=close-x]:hover { background: rgba(238, 175, 161, 0.35); color: #6A564A; }',
      '#' + OVERLAY_ID + ' [data-bm=controls] { padding: 12px 20px 12px !important; flex-shrink: 0; background: #FBF6EA !important;',
      '  border-top: 1px solid rgba(106, 86, 74, 0.1); order: 4; }',
      '@media (min-width: 640px) {',
      '  #' + OVERLAY_ID + ' [data-bm=controls] { padding: 0 36px 18px !important; border-top: none !important; border-bottom: 1px solid rgba(106, 86, 74, 0.1); order: 2; }',
      '}',
      '#' + OVERLAY_ID + ' [data-bm=search-wrap] { display: flex; align-items: center; gap: 10px;',
      '  background: #ffffff; border: 1.5px solid rgba(106, 86, 74, 0.16); border-radius: 14px;',
      '  padding: 10px 16px !important; margin: 0 0 10px 0 !important; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; box-sizing: border-box; }',
      '#' + OVERLAY_ID + ' [data-bm=search-wrap]:focus-within { background: #ffffff; border-color: #9AB08F;',
      '  box-shadow: 0 0 0 3px rgba(154, 176, 143, 0.25); }',
      '#' + OVERLAY_ID + ' [data-bm=search-input] { flex: 1; border: none !important; background: transparent !important;',
      '  outline: none !important; font-size: 14.5px; color: #6A564A !important; caret-color: #9AB08F;',
      '  font-family: inherit; min-width: 0; padding: 0 !important; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=search-input]::placeholder { color: rgba(106, 86, 74, 0.42); }',
      '#' + OVERLAY_ID + ' [data-bm=clear-btn] { border: none; background: none; cursor: pointer;',
      '  color: rgba(106, 86, 74, 0.4); padding: 0 !important; line-height: 0; display: none; flex-shrink: 0; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=clear-btn]:hover { color: #6A564A; }',
      '#' + OVERLAY_ID + ' [data-bm=clear-btn].bm-show { display: block; }',
      '#' + OVERLAY_ID + ' [data-bm=tags] { display: flex; align-items: center; gap: 8px; overflow-x: auto; overflow-y: hidden;',
      '  scrollbar-width: none; padding: 2px 0 !important; margin: 0 !important; -webkit-overflow-scrolling: touch; min-height: 34px; }',
      '#' + OVERLAY_ID + ' [data-bm=tags]::-webkit-scrollbar { display: none; }',
      '@media (min-width: 640px) { #' + OVERLAY_ID + ' [data-bm=tags] { flex-wrap: wrap; overflow: visible; } }',
      '#' + OVERLAY_ID + ' [data-bm=tag-pill] { flex-shrink: 0; height: 30px; display: inline-flex; align-items: center; justify-content: center;',
      '  padding: 0 14px !important; border-radius: 99px;',
      '  border: 1.5px solid rgba(106, 86, 74, 0.16); background: #ffffff; color: #6A564A;',
      '  font-size: 12px; font-weight: 600; cursor: pointer; box-sizing: border-box !important;',
      '  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;',
      '  -webkit-tap-highlight-color: transparent; user-select: none;',
      '  white-space: nowrap; font-family: inherit; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=tag-pill]:hover { border-color: #9AB08F; color: #556B4A; background: rgba(154, 176, 143, 0.08); }',
      '#' + OVERLAY_ID + ' [data-bm=tag-pill].bm-active { background: #9AB08F !important; border-color: #9AB08F !important; color: #ffffff !important; box-shadow: 0 2px 6px rgba(154, 176, 143, 0.35); }',
      '#' + OVERLAY_ID + ' [data-bm=count] { display: none; }',
      '#' + OVERLAY_ID + ' [data-bm=list] { flex: 1; overflow-y: auto; overflow-x: hidden !important;',
      '  padding: 16px 20px 20px !important; display: flex; flex-direction: column; gap: 10px; order: 3;',
      '  background: #F6F1E3 !important; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=list]::-webkit-scrollbar { width: 6px; }',
      '#' + OVERLAY_ID + ' [data-bm=list]::-webkit-scrollbar-thumb { background: rgba(106, 86, 74, 0.2); border-radius: 4px; }',
      '#' + OVERLAY_ID + ' [data-bm=list]::-webkit-scrollbar-thumb:hover { background: #9AB08F; }',
      '@media (min-width: 640px) {',
      '  #' + OVERLAY_ID + ' [data-bm=list] {',
      '    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));',
      '    gap: 16px; padding: 22px 36px 26px !important;',
      '  }',
      '}',
      '@media (min-width: 1040px) {',
      '  #' + OVERLAY_ID + ' [data-bm=list] {',
      '    grid-template-columns: repeat(3, minmax(0, 1fr));',
      '    gap: 18px; padding: 24px 36px 30px !important;',
      '  }',
      '}',
      '#' + OVERLAY_ID + ' [data-bm=card] { background: #ffffff; border: 1.5px solid rgba(106, 86, 74, 0.12);',
      '  border-radius: 16px; padding: 16px 18px !important; cursor: pointer; margin: 0 !important;',
      '  transition: transform 0.15s ease, border-color 0.15s, background 0.15s, box-shadow 0.15s;',
      '  -webkit-tap-highlight-color: transparent; display: flex; gap: 14px; align-items: flex-start; }',
      '@media (hover: hover) {',
      '  #' + OVERLAY_ID + ' [data-bm=card]:hover {',
      '    border-color: #9AB08F; background: #FFFDF9;',
      '    transform: translateY(-2px); box-shadow: 0 8px 24px rgba(106, 86, 74, 0.08), 0 2px 6px rgba(154, 176, 143, 0.15);',
      '  }',
      '}',
      '#' + OVERLAY_ID + ' [data-bm=card]:active { transform: scale(0.98); }',
      '#' + OVERLAY_ID + ' [data-bm=card][hidden] { display: none !important; }',
      '#' + OVERLAY_ID + ' [data-bm=card-num] { width: 36px; height: 36px; border-radius: 11px;',
      '  background: rgba(154, 176, 143, 0.2); color: #556B4A; font-size: 13.5px; font-weight: 800;',
      '  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=card-body] { flex: 1; min-width: 0; margin: 0 !important; padding: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=card-tag] { display: inline-block; background: rgba(146, 181, 188, 0.22); color: #436970;',
      '  font-size: 10.5px; font-weight: 700; padding: 2px 8px !important; border-radius: 6px;',
      '  margin: 0 0 5px 0 !important; letter-spacing: 0.02em; }',
      '#' + OVERLAY_ID + ' [data-bm=card-title] { font-size: 14px; font-weight: 700; color: #6A564A;',
      '  line-height: 1.35; margin: 0 0 5px 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=card-desc] { font-size: 12px; color: rgba(106, 86, 74, 0.72); line-height: 1.55;',
      '  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=card-arrow] { color: rgba(106, 86, 74, 0.28); flex-shrink: 0; align-self: center;',
      '  line-height: 0; transition: color 0.15s, transform 0.15s; margin: 0 !important; padding: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=card]:hover [data-bm=card-arrow] { color: #9AB08F; transform: translateX(3px); }',
      '#' + OVERLAY_ID + ' [data-bm=empty] { text-align: center; padding: 48px 16px !important; color: rgba(106, 86, 74, 0.5);',
      '  font-size: 14px; display: none; grid-column: 1 / -1; margin: 0 !important; }',
      '#' + OVERLAY_ID + ' [data-bm=empty].bm-show { display: block; }',
      '#' + OVERLAY_ID + ' [data-bm=footer] { padding: 14px 22px 16px !important; flex-shrink: 0; border-top: 1px solid rgba(106, 86, 74, 0.1); background: #FBF6EA !important;',
      '  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 !important; order: 5; }',
      '@supports (padding-bottom: env(safe-area-inset-bottom)) {',
      '  #' + OVERLAY_ID + ' [data-bm=footer] { padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important; }',
      '}',
      '@media (min-width: 640px) { #' + OVERLAY_ID + ' [data-bm=footer] { padding: 18px 36px !important; order: 4; } }',
      '#' + OVERLAY_ID + ' [data-bm=hint] { font-size: 12px; color: rgba(106, 86, 74, 0.55); display: none; margin: 0 !important; }',
      '@media (min-width: 640px) { #' + OVERLAY_ID + ' [data-bm=hint] { display: block; } }',
      '#' + OVERLAY_ID + ' [data-bm=close-btn] { padding: 10px 22px !important;',
      '  border: 1.5px solid rgba(106, 86, 74, 0.18); border-radius: 12px; background: #ffffff; color: #6A564A;',
      '  font-size: 13.5px; font-weight: 700; cursor: pointer;',
      '  -webkit-tap-highlight-color: transparent; transition: background 0.15s, border-color 0.15s, transform 0.1s;',
      '  font-family: inherit; margin-left: auto !important; }',
      '@media (max-width: 639px) { #' + OVERLAY_ID + ' [data-bm=close-btn] { width: 100%; padding: 12px !important; font-size: 14px; border-radius: 14px; } }',
      '#' + OVERLAY_ID + ' [data-bm=close-btn]:hover { background: rgba(106, 86, 74, 0.08); border-color: rgba(106, 86, 74, 0.3); }',
      '#' + OVERLAY_ID + ' [data-bm=close-btn]:active { transform: scale(0.98); }'
    ].join('\n');
    document.head.appendChild(styleEl);

    /* ── DOM 構築 ─────────────────────────────────────────── */
    var ov = document.createElement('div');
    ov.id = OVERLAY_ID;
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'ブックマークレットランチャー');

    var panel = document.createElement('div');
    panel.setAttribute('data-bm', 'panel');

    var handle = document.createElement('div');
    handle.setAttribute('data-bm', 'handle');

    /* ヘッダー */
    var header = document.createElement('div');
    header.setAttribute('data-bm', 'header');

    var headTop = document.createElement('div');
    headTop.setAttribute('data-bm', 'head-top');

    var titleEl = document.createElement('div');
    titleEl.setAttribute('data-bm', 'title');
    titleEl.innerHTML =
      '<img data-bm="logo" src="https://5gkyu.github.io/icon/hl-logo-6A7963.png" alt="Halcyon Logo" draggable="false" oncontextmenu="return false;">' +
      '<span>Halcyon ブックマークレット</span> <span data-bm="title-badge">' + data.length + '件</span>';

    var closeX = document.createElement('button');
    closeX.setAttribute('data-bm', 'close-x');
    closeX.setAttribute('aria-label', '閉じる');
    closeX.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 256 256" fill="none"' +
      ' stroke="currentColor" stroke-width="24" stroke-linecap="round">' +
      '<line x1="48" y1="48" x2="208" y2="208"/><line x1="208" y1="48" x2="48" y2="208"/></svg>';
    closeX.onclick = function () { _closeOv(ov); };

    headTop.appendChild(titleEl);
    headTop.appendChild(closeX);
    header.appendChild(headTop);

    /* 検索バー */
    var searchWrap = document.createElement('div');
    searchWrap.setAttribute('data-bm', 'search-wrap');

    var searchIcon = document.createElement('span');
    searchIcon.setAttribute('aria-hidden', 'true');
    searchIcon.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 256 256" fill="none"' +
      ' stroke="#9AB08F" stroke-width="20" stroke-linecap="round">' +
      '<circle cx="112" cy="112" r="80"/><line x1="168" y1="168" x2="224" y2="224"/></svg>';

    var searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.setAttribute('data-bm', 'search-input');
    searchInput.placeholder = 'ブックマークレットを検索...';
    searchInput.autocomplete = 'off';
    searchInput.setAttribute('aria-label', 'ブックマークレットを検索');

    var clearBtn = document.createElement('button');
    clearBtn.setAttribute('data-bm', 'clear-btn');
    clearBtn.setAttribute('aria-label', 'クリア');
    clearBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 256 256" fill="none"' +
      ' stroke="currentColor" stroke-width="24" stroke-linecap="round">' +
      '<line x1="48" y1="48" x2="208" y2="208"/><line x1="208" y1="48" x2="48" y2="208"/></svg>';
    clearBtn.onclick = function () {
      searchInput.value = '';
      searchQ = '';
      clearBtn.classList.remove('bm-show');
      _applyFilter();
    };

    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(searchInput);
    searchWrap.appendChild(clearBtn);

    /* タグフィルター */
    var tagsWrap = document.createElement('div');
    tagsWrap.setAttribute('data-bm', 'tags');
    tags.forEach(function (tag) {
      var pill = document.createElement('button');
      pill.setAttribute('data-bm', 'tag-pill');
      pill.setAttribute('data-tag', tag);
      pill.textContent = tag;
      if (tag === 'すべて') pill.classList.add('bm-active');
      pill.onclick = function () {
        activeTag = tag;
        tagsWrap.querySelectorAll('[data-bm=tag-pill]').forEach(function (p) {
          p.classList.toggle('bm-active', p.getAttribute('data-tag') === activeTag);
        });
        _applyFilter();
      };
      tagsWrap.appendChild(pill);
    });

    /* コントロール（検索バー＋タグフィルター） */
    var controls = document.createElement('div');
    controls.setAttribute('data-bm', 'controls');
    controls.appendChild(searchWrap);
    controls.appendChild(tagsWrap);

    /* 件数 */
    var countEl = document.createElement('div');
    countEl.setAttribute('data-bm', 'count');

    /* カードリスト */
    var listEl = document.createElement('div');
    listEl.setAttribute('data-bm', 'list');

    data.forEach(function (bm) {
      var card = document.createElement('div');
      card.setAttribute('data-bm', 'card');
      card.setAttribute('data-tag', bm.tag);
      card.setAttribute('data-search',
        (bm.num + ' ' + bm.title + ' ' + bm.description + ' ' + bm.tag).toLowerCase()
      );
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', bm.title + ' を実行');

      var numEl = document.createElement('div');
      numEl.setAttribute('data-bm', 'card-num');
      numEl.textContent = bm.num;

      var body = document.createElement('div');
      body.setAttribute('data-bm', 'card-body');

      var tagEl = document.createElement('span');
      tagEl.setAttribute('data-bm', 'card-tag');
      tagEl.textContent = bm.tag;

      var cardTitle = document.createElement('div');
      cardTitle.setAttribute('data-bm', 'card-title');
      cardTitle.textContent = bm.title;

      var cardDesc = document.createElement('div');
      cardDesc.setAttribute('data-bm', 'card-desc');
      cardDesc.textContent = bm.description;

      body.appendChild(tagEl);
      body.appendChild(cardTitle);
      body.appendChild(cardDesc);

      var arrow = document.createElement('div');
      arrow.setAttribute('data-bm', 'card-arrow');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 256 256" fill="none"' +
        ' stroke="currentColor" stroke-width="24" stroke-linecap="round">' +
        '<polyline points="96 48 176 128 96 208"/></svg>';

      card.appendChild(numEl);
      card.appendChild(body);
      card.appendChild(arrow);

      var _doRun = function () { _execute(ov, bm.code); };
      card.onclick = _doRun;
      card.onkeydown = function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _doRun(); }
      };

      listEl.appendChild(card);
    });

    /* 空状態 */
    var emptyEl = document.createElement('div');
    emptyEl.setAttribute('data-bm', 'empty');
    emptyEl.textContent = '該当するブックマークレットが見つかりませんでした';
    listEl.appendChild(emptyEl);

    /* フッター */
    var footer = document.createElement('div');
    footer.setAttribute('data-bm', 'footer');
    var hint = document.createElement('span');
    hint.setAttribute('data-bm', 'hint');
    hint.textContent = 'ESCキーまたは外側クリックで閉じます';
    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('data-bm', 'close-btn');
    closeBtn.textContent = '閉じる';
    closeBtn.onclick = function () { _closeOv(ov); };
    footer.appendChild(hint);
    footer.appendChild(closeBtn);

    /* 組み立て */
    panel.appendChild(handle);
    panel.appendChild(header);
    panel.appendChild(controls);
    panel.appendChild(countEl);
    panel.appendChild(listEl);
    panel.appendChild(footer);
    ov.appendChild(panel);
    document.body.appendChild(ov);

    /* アニメーション開始 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ov.classList.add('bm-open');
        if (window.innerWidth >= 640) {
          setTimeout(function () { searchInput.focus(); }, 400);
        }
      });
    });

    /* 検索入力 */
    searchInput.addEventListener('input', function () {
      searchQ = searchInput.value.trim().toLowerCase();
      clearBtn.classList.toggle('bm-show', searchQ.length > 0);
      _applyFilter();
    });

    /* 背景クリックで閉じる */
    ov.addEventListener('click', function (e) {
      if (e.target === ov) _closeOv(ov);
    });

    /* Esc キーで閉じる */
    document.addEventListener('keydown', function _onKey(e) {
      if (e.key === 'Escape') {
        _closeOv(ov);
        document.removeEventListener('keydown', _onKey);
      }
    });

    /* フィルタ適用 */
    function _applyFilter() {
      var visible = 0;
      listEl.querySelectorAll('[data-bm=card]').forEach(function (card) {
        var matchTag    = activeTag === 'すべて' || card.getAttribute('data-tag') === activeTag;
        var matchSearch = !searchQ || card.getAttribute('data-search').indexOf(searchQ) !== -1;
        var show = matchTag && matchSearch;
        card.hidden = !show;
        if (show) visible++;
      });
      countEl.textContent = visible + ' 件';
      emptyEl.classList.toggle('bm-show', visible === 0);
    }

    _applyFilter();
  }
})();
