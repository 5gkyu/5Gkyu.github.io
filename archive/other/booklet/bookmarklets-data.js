/* ================================================================
   ブックマークレット定義データ
   index.html と launcher.js の両方から参照する共有ファイル。
   更新はこのファイル1か所のみで反映される。
   ================================================================ */
window.BOOKMARKLETS = [
  {
    num: 1,
    id: "copy-title-url",
    tag: "便利ツール",
    title: "タイトル＆URLコピー",
    description: "閲覧中のページタイトルとURLをクリップボードにコピーします。共有やメモに便利。",
    code: `javascript:void(function(){var t=document.title,u=location.href;navigator.clipboard.writeText(t+'\\n'+u).then(function(){alert('コピーしました!\\n'+t)}).catch(function(){prompt('コピーしてください:',t+' '+u)})})()`
  },
  {
    num: 2,
    id: "simple-reader",
    tag: "読みやすさ",
    title: "かんたんリーダー",
    description: "ページの本文を中央寄せ・大きめフォントにして、読みやすく整えます。",
    code: `javascript:void(function(){var d=document,b=d.body;b.style.maxWidth='640px';b.style.margin='0 auto';b.style.padding='16px';b.style.fontSize='18px';b.style.lineHeight='1.8';b.style.color='%23333';b.style.background='%23fefefe';var imgs=d.querySelectorAll('img');for(var i=0;i<imgs.length;i++){imgs[i].style.maxWidth='100%25';imgs[i].style.height='auto'}alert('読みやすくしました!')})()`
  },
  {
    num: 3,
    id: "image-picker-downloader",
    tag: "画像ツール",
    title: "ページ内の画像を一覧表示",
    description: "ページ内の画像を一覧表示します。カードをクリックすると画像を新しいタブで開きます。",
    code: `javascript:void(function(){try{var list=[],seen=new Set();Array.prototype.forEach.call(document.images,function(im){var u=(im.currentSrc||im.src||'').trim();if(!u||u.indexOf('https://')!==0||seen.has(u))return;seen.add(u);list.push({url:u,alt:(im.alt||'').trim(),w:im.naturalWidth||im.width||0,h:im.naturalHeight||im.height||0});});if(!list.length){alert('画像が見つかりませんでした。');return;}var old=document.getElementById('__bm_img_dl_overlay__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_img_dl_overlay__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:12px;';var panel=document.createElement('div');panel.style.cssText='width:min(960px,96vw);max-height:92vh;background:#fff;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';var head=document.createElement('div');head.style.cssText='padding:10px 12px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;gap:8px;';var strong=document.createElement('strong');strong.style.fontSize='14px';strong.textContent='画像をクリックして開く';var span=document.createElement('span');span.style.cssText='font-size:12px;color:#666';span.textContent=list.length+'件';head.appendChild(strong);head.appendChild(span);var body=document.createElement('div');body.style.cssText='padding:8px 10px;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;';var foot=document.createElement('div');foot.style.cssText='padding:10px;border-top:1px solid #eee;display:flex;gap:8px;flex-wrap:wrap;';function mkBtn(text,bg,color){var b=document.createElement('button');b.type='button';b.textContent=text;b.style.cssText='border:none;border-radius:8px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;background:'+bg+';color:'+color+';';return b;}var btnClose=mkBtn('閉じる','#fff','#333');btnClose.style.border='1px solid #ddd';foot.appendChild(btnClose);list.forEach(function(it,i){var item=document.createElement('div');item.style.cssText='display:flex;gap:8px;align-items:flex-start;border:1px solid #eee;border-radius:8px;padding:8px;cursor:pointer;';item.onmouseover=function(){item.style.background='#f5f5f5';};item.onmouseout=function(){item.style.background='';};var img=document.createElement('img');img.src=it.url;img.loading='lazy';img.style.cssText='width:56px;height:56px;object-fit:cover;border-radius:6px;background:#f4f4f4;flex-shrink:0;';var meta=document.createElement('div');meta.style.cssText='min-width:0;flex:1;';var d1=document.createElement('div');d1.style.cssText='font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';d1.textContent=(it.alt||('image_'+(i+1)));var d2=document.createElement('div');d2.style.cssText='font-size:11px;color:#666';d2.textContent=it.w+'x'+it.h;var d3=document.createElement('div');d3.style.cssText='font-size:10px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';d3.textContent=it.url;meta.appendChild(d1);meta.appendChild(d2);meta.appendChild(d3);item.appendChild(img);item.appendChild(meta);item.onclick=function(){window.open(it.url,'_blank');};body.appendChild(item);});panel.appendChild(head);panel.appendChild(body);panel.appendChild(foot);ov.appendChild(panel);document.body.appendChild(ov);btnClose.onclick=function(){ov.remove();};ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 4,
    id: "yt-url-toolkit",
    tag: "YouTube",
    title: "YouTube URL ツール（統合版）",
    description: "YouTubeの動画ページで実行。短縮URL・現在時刻付き・クリーンURL・再生リスト除去URLをまとめて一覧表示し、個別にコピーできます。",
    code: `javascript:void(function(){try{var host=(location.hostname||'').replace(/^www\\./,''),u=new URL(location.href),vid='';if(host==='youtu.be'){vid=u.pathname.split('/').filter(Boolean)[0]||'';}else if(host==='youtube.com'||host==='m.youtube.com'){vid=u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':'');}if(!vid){alert('YouTube動画ページで実行してください');return;}var v=document.querySelector('video'),t=v?Math.floor(v.currentTime):0;var cu=new URL(location.href);['list','index','pp'].forEach(function(p){cu.searchParams.delete(p);});var cleanUrl=cu.toString();var rows=[{label:'短縮 URL',url:'https://youtu.be/'+vid},{label:'短縮 URL＋現在時刻（'+t+'s）',url:'https://youtu.be/'+vid+'?t='+t,skip:t<=0},{label:'クリーン URL',url:'https://www.youtube.com/watch?v='+vid},{label:'クリーン URL＋現在時刻（'+t+'s）',url:'https://www.youtube.com/watch?v='+vid+'&t='+t+'s',skip:t<=0},{label:'再生リスト除去 URL',url:cleanUrl,skip:cleanUrl===location.href}].filter(function(r){return!r.skip;});var old=document.getElementById('__bm_yt_url__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_yt_url__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;';var box=document.createElement('div');box.style.cssText='width:min(560px,96vw);background:#fff;border-radius:14px;overflow:hidden;font-family:sans-serif;';var hd=document.createElement('div');hd.style.cssText='padding:12px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;';var ht=document.createElement('strong');ht.style.fontSize='14px';ht.textContent='YouTube URL ツール';var hx=document.createElement('button');hx.type='button';hx.textContent='✕';hx.style.cssText='border:none;background:none;font-size:16px;cursor:pointer;color:#666;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:4px 0;';rows.forEach(function(row){var item=document.createElement('div');item.style.cssText='display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid #f5f5f5;gap:8px;';var left=document.createElement('div');left.style.cssText='flex:1;min-width:0;';var lbl=document.createElement('div');lbl.style.cssText='font-size:11px;color:#888;margin-bottom:2px;';lbl.textContent=row.label;var urlDiv=document.createElement('div');urlDiv.style.cssText='font-size:11px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';urlDiv.textContent=row.url;left.appendChild(lbl);left.appendChild(urlDiv);var btn=document.createElement('button');btn.type='button';btn.textContent='コピー';btn.style.cssText='flex-shrink:0;border:1.5px solid #e0e0e0;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;background:#fff;color:#333;white-space:nowrap;';btn.onclick=function(){navigator.clipboard.writeText(row.url).then(function(){btn.textContent='✓ コピー済み';btn.style.background='#e8f9ef';btn.style.borderColor='#a8e6c1';btn.style.color='#1a7a45';setTimeout(function(){btn.textContent='コピー';btn.style.background='#fff';btn.style.borderColor='#e0e0e0';btn.style.color='#333';},1800);}).catch(function(){prompt('URLをコピーしてください:',row.url);});};item.appendChild(left);item.appendChild(btn);bd.appendChild(item);});var ft=document.createElement('div');ft.style.cssText='padding:10px;';var bClose=document.createElement('button');bClose.type='button';bClose.textContent='閉じる';bClose.style.cssText='width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:#555;';bClose.onclick=function(){ov.remove();};ft.appendChild(bClose);box.appendChild(hd);box.appendChild(bd);box.appendChild(ft);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 5,
    id: "yt-embed-code",
    tag: "YouTube",
    title: "埋め込みコード生成（iframe）",
    description: "YouTubeの動画ページで実行。iframeタグ形式の埋め込みコードを自動生成します。現在時刻から開始・自動再生のオプションをチェックで切り替えられます。",
    code: `javascript:void(function(){try{var host=(location.hostname||'').replace(/^www\\./,''),u=new URL(location.href),vid='';if(host==='youtu.be'){vid=u.pathname.split('/').filter(Boolean)[0]||'';}else if(host==='youtube.com'||host==='m.youtube.com'){vid=u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':'');}if(!vid){alert('YouTube動画ページで実行してください');return;}var v=document.querySelector('video'),t=v?Math.floor(v.currentTime):0;var useTime=false,useAuto=false;function buildCode(){var params=[];if(useAuto)params.push('autoplay=1','mute=1');if(useTime&&t>0)params.push('start='+t);var src='https://www.youtube.com/embed/'+vid+(params.length?'?'+params.join('&'):'');return'<iframe width="560" height="315" src="'+src+'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';}var old=document.getElementById('__bm_yt_embed__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_yt_embed__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;';var box=document.createElement('div');box.style.cssText='width:min(560px,96vw);background:#fff;border-radius:14px;overflow:hidden;font-family:sans-serif;';var hd=document.createElement('div');hd.style.cssText='padding:12px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;';var ht=document.createElement('strong');ht.style.fontSize='14px';ht.textContent='YouTube 埋め込みコード生成';var hx=document.createElement('button');hx.type='button';hx.textContent='✕';hx.style.cssText='border:none;background:none;font-size:16px;cursor:pointer;color:#666;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:14px;display:flex;flex-direction:column;gap:10px;';function mkChk(labelText,dis,onChange){var wrap=document.createElement('label');wrap.style.cssText='display:flex;align-items:center;gap:8px;font-size:13px;color:'+(dis?'#aaa':'#333')+';cursor:'+(dis?'default':'pointer')+';user-select:none;';var cb=document.createElement('input');cb.type='checkbox';cb.style.cssText='accent-color:#f0446e;width:15px;height:15px;cursor:'+(dis?'default':'pointer')+';';if(dis)cb.disabled=true;cb.onchange=function(){onChange(cb.checked);ta.value=buildCode();};var sp=document.createElement('span');sp.textContent=labelText;wrap.appendChild(cb);wrap.appendChild(sp);return wrap;}var ta=document.createElement('textarea');ta.readOnly=true;ta.style.cssText='width:100%;height:76px;padding:10px;border:1px solid #e0e0e0;border-radius:8px;font-size:10px;font-family:ui-monospace,monospace;resize:vertical;line-height:1.5;color:#333;background:#fafafa;';ta.value=buildCode();bd.appendChild(mkChk('現在時刻から開始（'+t+'s）'+(t<=0?' — 動画再生中のみ有効':''),t<=0,function(v){useTime=v;}));bd.appendChild(mkChk('自動再生する（ミュートで開始）',false,function(v){useAuto=v;}));bd.appendChild(ta);var btnCopy=document.createElement('button');btnCopy.type='button';btnCopy.textContent='コードをコピー';btnCopy.style.cssText='width:100%;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;background:#f0446e;color:#fff;';btnCopy.onclick=function(){navigator.clipboard.writeText(ta.value).then(function(){btnCopy.textContent='コピーしました！';btnCopy.style.background='#27ae60';setTimeout(function(){btnCopy.textContent='コードをコピー';btnCopy.style.background='#f0446e';},1800);}).catch(function(){ta.focus();ta.select();document.execCommand('copy');});};bd.appendChild(btnCopy);var btnClose=document.createElement('button');btnClose.type='button';btnClose.textContent='閉じる';btnClose.style.cssText='width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:#555;';btnClose.onclick=function(){ov.remove();};bd.appendChild(btnClose);box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 6,
    id: "thumbnail-viewer",
    tag: "動画ツール",
    title: "サムネイルを取得して開く",
    description: "YouTube または niconico の動画ページで実行。サムネイル画像の一覧を表示し、クリックで新しいタブに開きます。YouTubeは4サイズ（maxres / SD / HQ / MQ）対応。",
    code: String.raw`javascript:void(function(){try{var host=(location.hostname||'').replace(/^www\./,'');var u=new URL(location.href);var thumbs=[],title='';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){var vid=host==='youtu.be'?(u.pathname.split('/').filter(Boolean)[0]||''):(u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':''));if(!vid){alert('動画IDを取得できませんでした。');return;}title='YouTube サムネイル';var b='https://img.youtube.com/vi/'+vid+'/';thumbs=[{label:'maxres (1280×720)',url:b+'maxresdefault.jpg'},{label:'SD (640×480)',url:b+'sddefault.jpg'},{label:'HQ (480×360)',url:b+'hqdefault.jpg'},{label:'MQ (320×180)',url:b+'mqdefault.jpg'}];}else if(host.indexOf('nicovideo.jp')>=0){title='niconico サムネイル';var og=document.querySelector('meta[property="og:image"]');if(og&&og.content){thumbs=[{label:'サムネイル',url:og.content}];}else{alert('サムネイルが取得できませんでした。');return;}}else{alert('YouTube または niconico の動画ページで実行してください。');return;}if(!thumbs.length){alert('サムネイルが取得できませんでした。');return;}var old=document.getElementById('__bm_thumb__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_thumb__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;';var box=document.createElement('div');box.style.cssText='width:min(640px,96vw);max-height:90vh;background:#fff;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;font-family:sans-serif;';var hd=document.createElement('div');hd.style.cssText='padding:12px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;';var ht=document.createElement('strong');ht.style.fontSize='14px';ht.textContent=title;var hx=document.createElement('button');hx.type='button';hx.textContent='✕';hx.style.cssText='border:none;background:none;font-size:16px;cursor:pointer;color:#666;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:12px;display:flex;flex-direction:column;gap:10px;overflow:auto;';thumbs.forEach(function(th){var card=document.createElement('div');card.style.cssText='border:1px solid #eee;border-radius:8px;overflow:hidden;cursor:pointer;';card.onmouseover=function(){card.style.borderColor='#f0446e';};card.onmouseout=function(){card.style.borderColor='#eee';};var img=document.createElement('img');img.src=th.url;img.style.cssText='width:100%;height:auto;display:block;background:#f4f4f4;min-height:40px;';img.alt=th.label;var lbl=document.createElement('div');lbl.style.cssText='padding:6px 10px;font-size:11px;color:#666;background:#fafafa;border-top:1px solid #eee;';lbl.textContent=th.label;card.appendChild(img);card.appendChild(lbl);card.onclick=function(){window.open(th.url,'_blank');};bd.appendChild(card);});box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 7,
    id: "vocaloid-cross-url",
    tag: "ボカロ変換",
    title: "YouTube⇔niconico URL取得",
    description: "YouTubeまたはniconicoの動画ページで実行すると、VocaDB経由で逆サイトの対応URLを取得してコピーします。データ提供: VocaDB（利用規約/APIルールを遵守して利用）",
    code: String.raw`javascript:void((async function(){try{var host=(location.hostname||'').replace(/^www\./,''),u=new URL(location.href),src='',pvId='';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){src='Youtube';pvId=host==='youtu.be'?(u.pathname.split('/').filter(Boolean)[0]||''):(u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':''));}else if(host.indexOf('nicovideo.jp')>=0){src='NicoNicoDouga';var p=(u.pathname||'').match(/\/watch\/([a-z]{2}\d+)/i);pvId=p?p[1]:'';}else{alert('YouTube または niconico の動画ページで実行してください。');return;}if(!pvId){alert('動画IDを取得できませんでした。');return;}var byPv='https://vocadb.net/api/songs/byPv?pvService='+encodeURIComponent(src)+'&pvId='+encodeURIComponent(pvId);var r1=await fetch(byPv);if(!r1.ok){throw new Error('VocaDB byPv: HTTP '+r1.status);}var song=await r1.json();if(!song||!song.id){alert('VocaDBに該当曲が見つかりませんでした。\nデータ提供: VocaDB\n規約: https://wiki.vocadb.net/docs/terms-of-service');return;}var r2=await fetch('https://vocadb.net/api/songs/'+encodeURIComponent(song.id)+'?fields=PVs');if(!r2.ok){throw new Error('VocaDB song: HTTP '+r2.status);}var detail=await r2.json(),pvs=Array.isArray(detail&&detail.pvs)?detail.pvs:[];var target='',targetSite=(src==='Youtube'?'niconico':'YouTube');if(src==='Youtube'){for(var i=0;i<pvs.length;i++){var n=pvs[i];if(n&&!n.disabled&&String(n.service||'').indexOf('NicoNico')===0){target=n.url||('https://www.nicovideo.jp/watch/'+n.pvId);break;}}}else{for(var j=0;j<pvs.length;j++){var y=pvs[j];if(y&&!y.disabled&&String(y.service||'')==='Youtube'){target=y.url||('https://youtu.be/'+y.pvId);break;}}}if(!target){alert(targetSite+' の動画URLが見つかりませんでした。\nデータ提供: VocaDB');return;}try{await navigator.clipboard.writeText(target);}catch(e){}var old=document.getElementById('__bm_voca_result__');if(old)old.remove();var ov=document.createElement('div');ov.id='__bm_voca_result__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;';var box=document.createElement('div');box.style.cssText='width:min(560px,94vw);background:#fff;border-radius:12px;padding:14px;font-family:sans-serif;';var ttl=document.createElement('div');ttl.style.cssText='font-size:14px;font-weight:700;margin-bottom:8px';ttl.textContent=targetSite+' のURLを取得しました';var urlText=document.createElement('div');urlText.style.cssText='font-size:12px;word-break:break-all;line-height:1.5;margin-bottom:10px';urlText.textContent=target;box.appendChild(ttl);box.appendChild(urlText);var actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;';function mk(t,b,c){var bt=document.createElement('button');bt.type='button';bt.textContent=t;bt.style.cssText='border:none;border-radius:8px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;background:'+b+';color:'+c+';';return bt;}var bCopy=mk('リンクを再コピー','#f0f0f0','#333');var bOpen=mk(targetSite+'で開く','#f0446e','#fff');var bClose=mk('閉じる','#fff','#333');bClose.style.border='1px solid #ddd';actions.appendChild(bCopy);actions.appendChild(bOpen);actions.appendChild(bClose);box.appendChild(actions);ov.appendChild(box);document.body.appendChild(ov);bCopy.onclick=async function(){try{await navigator.clipboard.writeText(target);alert(targetSite+' のURLをコピーしました。\n'+target+'\n\nデータ提供: VocaDB');}catch(e){prompt(targetSite+' のURL:',target);}};bOpen.onclick=function(){location.href=target;};bClose.onclick=function(){ov.remove();};ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(err){alert('エラー: '+(err&&err.message?err.message:err)+'\n(データ提供: VocaDB)');}})())`
  },
  {
    num: 8,
    id: "vocaloid-x-search",
    tag: "ボカロ変換",
    title: "X感想検索（YouTube/niconico）",
    description: "YouTubeまたはniconicoの動画ページで実行すると、VocaDB経由で曲名・両サイトの動画IDを取得し、Xで感想を検索します。データ提供: VocaDB（利用規約/APIルールを遵守して利用）",
    code: String.raw`javascript:void((async function(){try{var host=(location.hostname||'').replace(/^www\./,''),u=new URL(location.href),src='',pvId='';if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){src='Youtube';pvId=host==='youtu.be'?(u.pathname.split('/').filter(Boolean)[0]||''):(u.searchParams.get('v')||(u.pathname.indexOf('/shorts/')===0?u.pathname.split('/')[2]||'':''));}else if(host.indexOf('nicovideo.jp')>=0){src='NicoNicoDouga';var p=(u.pathname||'').match(/\/watch\/([a-z]{2}\d+)/i);pvId=p?p[1]:'';}else{alert('YouTube または niconico の動画ページで実行してください。');return;}if(!pvId){alert('動画IDを取得できませんでした。');return;}var r1=await fetch('https://vocadb.net/api/songs/byPv?pvService='+encodeURIComponent(src)+'&pvId='+encodeURIComponent(pvId));if(!r1.ok){throw new Error('VocaDB byPv: HTTP '+r1.status);}var song=await r1.json();if(!song||!song.id){alert('VocaDBに該当曲が見つかりませんでした。\nデータ提供: VocaDB\n規約: https://wiki.vocadb.net/docs/terms-of-service');return;}var r2=await fetch('https://vocadb.net/api/songs/'+encodeURIComponent(song.id)+'?fields=PVs,Names');if(!r2.ok){throw new Error('VocaDB song: HTTP '+r2.status);}var detail=await r2.json(),pvs=Array.isArray(detail&&detail.pvs)?detail.pvs:[],names=Array.isArray(detail&&detail.names)?detail.names:[];var title=song.name||'';for(var k=0;k<names.length;k++){if(names[k]&&names[k].language==='Japanese'){title=names[k].value||title;break;}}if(!title)title=detail.defaultName||song.name||'';var ytId='',nicoId='';for(var i=0;i<pvs.length;i++){var pv=pvs[i];if(!pv||pv.disabled)continue;if(!ytId&&String(pv.service||'')==='Youtube')ytId=pv.pvId||'';if(!nicoId&&String(pv.service||'').indexOf('NicoNico')===0)nicoId=pv.pvId||'';}var parts=[];if(title)parts.push('"""'+title+'"""');if(ytId)parts.push(ytId);if(nicoId)parts.push(nicoId);if(!parts.length){alert('検索クエリを生成できませんでした。\nデータ提供: VocaDB');return;}var query=(parts.length===1?parts[0]:'('+parts.join(' OR ')+')')+' lang:ja';window.open('https://x.com/search?q='+encodeURIComponent(query)+'&src=typed_query&f=live','_blank');}catch(err){alert('エラー: '+(err&&err.message?err.message:err)+'\n(データ提供: VocaDB)');}})())`
  },
  {
    num: 9,
    id: "kiite-niconico-transfer",
    tag: "Kiite→ニコニコ",
    title: "Kiite→ニコニコ 一括追加",
    description: "Kiiteのプレイリストで実行してIDをコピーし、その後ニコニコ動画のマイリストページで再度同じブックマークレットを実行してマイリストに追加する統合版ツールです。",
    code: String.raw`javascript:void((async function(){var h=location.hostname;if(h.indexOf('kiite.jp')>=0){var b=document.querySelectorAll('[data-type="song"][data-video-id]');if(!b.length)b=document.querySelectorAll('[data-video-id]');var s=new Set(),items=[];Array.prototype.forEach.call(b,function(e){var id=(e.getAttribute('data-video-id')||'').trim().toLowerCase();if(id&&/^[a-z]{2}\d+$/.test(id)&&!s.has(id)){s.add(id);var m='',ct=e.querySelector('.playlist-cmnt-txt');if(!ct){var p=e;for(var i=0;i<6;i++){p=p&&p.parentElement;if(!p)break;ct=p.querySelector('.playlist-cmnt-txt');if(ct)break;}}if(ct)m=ct.textContent.trim();items.push({id:id,memo:m});}});if(!items.length){document.querySelectorAll('a[href]').forEach(function(a){var m=(a.href||'').match(/\/([a-z]{2})(\d+)/i);if(m){var id=(m[1]+m[2]).toLowerCase();if(!s.has(id)){s.add(id);items.push({id:id,memo:''});}}});}if(!items.length){alert('動画IDが見つかりませんでした。\nKiiteのプレイリストページで実行してください。');return;}var msg=items.length+' 件を取得してコピーしました！\n\nニコニコのマイリスト一覧を開きますか？\n(キャンセルを押すとそのまま閉じます)';function o(){if(confirm(msg))window.open('https://www.nicovideo.jp/my/mylist/','_blank');}try{await navigator.clipboard.writeText(JSON.stringify(items));o();}catch(e){msg+='\n\n※自動コピーに失敗しました';o();}}else if(h.indexOf('nicovideo.jp')>=0){var m=(location.pathname||'').match(/\/mylist\/(\d+)/);if(!m){alert('ニコニコのマイリストページ（URLに /mylist/数字 を含む）で実行してください。');return;}var id=m[1],raw=prompt('Kiiteで取得したIDリストを貼り付けてください:');if(!raw)return;var p;try{p=JSON.parse(raw);}catch(e){alert('形式が正しくありません。\nKiiteでコピーし直してください。');return;}if(!p||!p.length){alert('IDリストが空です。');return;}var items=p.map(function(x){return typeof x==='string'?{id:x,memo:''}:x;});if(!confirm('マイリスト(ID: '+id+')に追加します。\n完了まで約'+Math.ceil(items.length*0.5)+'秒かかります。\nよろしいですか？'))return;var ov=document.createElement('div');ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;';var txt=document.createElement('div');txt.style.cssText='font-size:22px;font-weight:bold;margin-bottom:20px;';txt.textContent='登録中... (残り約'+Math.ceil(items.length*0.5)+'秒)';var bg=document.createElement('div');bg.style.cssText='width:300px;height:20px;background:#444;border-radius:10px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,.5);';var bar=document.createElement('div');bar.style.cssText='width:0%;height:100%;background:#00a3ff;transition:width 0.3s ease;';bg.appendChild(bar);ov.appendChild(txt);ov.appendChild(bg);document.body.appendChild(ov);var ok=0,fail=0,skip=0,err='';for(var i=0;i<items.length;i++){var it=items[i],vid=it.id,memo=it.memo||'';try{var d=memo?encodeURI(memo):'',url='https://nvapi.nicovideo.jp/v1/users/me/mylists/'+encodeURIComponent(id)+'/items?itemId='+encodeURIComponent(vid)+(d?'&description='+d:''),res=await fetch(url,{method:'POST',credentials:'include',mode:'cors',headers:{'X-Frontend-Id':'23','X-Request-With':'N-garage'}});var j=await res.json().catch(function(){return null;});var st=(j&&j.meta)?j.meta.status:res.status,ec=(j&&j.meta&&j.meta.errorCode)?j.meta.errorCode:'';if((st===201||st===200)&&j)ok++;else if(st===409){if(/EXIST|ALREADY|DUPLICATE/i.test(ec))skip++;else{fail++;if(!err)err=(ec||'上限エラー等')+' ('+vid+')';}}else{fail++;if(!err)err=(ec||'HTTP '+st+(j?'':'(空応答)'))+' ('+vid+')';};}catch(e){fail++;if(!err)err=String(e)+' ('+vid+')';}txt.textContent='登録中... (残り約'+Math.ceil((items.length-(i+1))*0.5)+'秒)';bar.style.width=Math.floor(((i+1)/items.length)*100)+'%';if(i<items.length-1)await new Promise(function(r){setTimeout(r,500);});}ov.remove();alert(fail>0?'完了しましたが、一部でエラーが発生しました。\n詳細: '+err:'完了しました！');location.reload();}else{alert('Kiiteのプレイリスト、またはニコニコのマイリストページで実行してください。');}})())`
  },
  {
    num: 10,
    id: "kyulink-add",
    tag: "KyuLink",
    title: "KyuLink 新規リンク追加",
    description: "現在開いているページの情報を取得し、KyuLinkの追加画面を開きます。KyuLinkの管理者用です。",
    code: `javascript:(function(){const absolutize=(u)=>{if(!u)return'';try{return new URL(u,window.location.href).href;}catch(e){return u;}};const getMeta=(name)=>{const el=document.querySelector(\`meta[property="\${name}"], meta[name="\${name}"]\`);return el?(el.getAttribute('content')||''):'';};const getFavicon=()=>{const el=document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');return el?el.href:'';};const data={url:window.location.href,title:document.title||getMeta('og:title'),desc:getMeta('og:description')||getMeta('description'),og_image:absolutize(getMeta('og:image')||getMeta('twitter:image')),favicon_url:getFavicon()};const jsonStr=JSON.stringify([data]);const ta=document.createElement('textarea');ta.style.position='fixed';ta.style.opacity='0';ta.value=jsonStr;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(err){}finally{document.body.removeChild(ta);}const params=new URLSearchParams();params.append('add','1');params.append('url',data.url);params.append('title',data.title);params.append('desc',data.desc);params.append('og_image',data.og_image);params.append('favicon_url',data.favicon_url);const kyuUrl='https://5gkyu.github.io/KyuLink/?'+params.toString();window.open(kyuUrl,'_blank')||(window.location.href=kyuUrl);})()`
  },
  {
    num: 11,
    id: "github-pages-url",
    tag: "便利ツール",
    title: "GitHub Pages URL変換",
    description: "GitHubのファイルページで実行するか、任意のページで実行してURLを入力すると、対応するGitHub PagesのURLに変換してクリップボードにコピーします。",
    code: `javascript:(function(){var u=location.href,r=/^\\/\\/github\\.com\\/([^\\/]+)\\/([^\\/]+)\\/blob\\/[^\\/]+\\/(.+)$/,m=u.match(r);if(!m){u=prompt('GitHubのファイルURLを入力するか貼り付けてください:\\n(例: https://github.com/user/repo/blob/main/...)');if(!u)return;m=u.match(r)}if(m){var user=m[1].toLowerCase(),repo=m[2],path=m[3],res="https://"+(repo.toLowerCase()===user+".github.io"?user+".github.io/"+path:user+".github.io/"+repo+"/"+path);navigator.clipboard.writeText(res).then(function(){alert('コピーしました!\\n'+res)}).catch(function(){prompt('コピーしてください:',res)})}else{alert('正しいGitHubのファイルURLではありません。')}})()`
  },
  {
    num: 12,
    id: "image-bulk-extractor",
    tag: "便利ツール",
    title: "ページ画像一括抽出・ZIP保存",
    description: "表示中ページ内の全画像（img、背景画像、SVG等）を抽出してギャラリー表示。拡張子バッジやURL表示・コピー機能、ZIP一括ダウンロードができます。",
    code: `javascript:(function() {
    var MIN_SIZE = 100;
    var urls = new Map();

    function addUrl(u, w, h) {
      if (!u) return;
      try {
        u = new URL(u, location.href).href;
      } catch (e) {
        return;
      }
      if (!urls.has(u)) {
        urls.set(u, { w: w || 0, h: h || 0 });
      }
    }

    // 1. img要素（src, data-src, srcset）
    document.querySelectorAll('img').forEach(function(img) {
      addUrl(img.currentSrc || img.src, img.naturalWidth, img.naturalHeight);
      ['data-src', 'data-original', 'data-lazy-src', 'data-url'].forEach(function(attr) {
        var v = img.getAttribute(attr);
        if (v) addUrl(v, img.naturalWidth, img.naturalHeight);
      });
      var ss = img.getAttribute('srcset') || img.getAttribute('data-srcset');
      if (ss) {
        ss.split(',').forEach(function(p) {
          addUrl(p.trim().split(' ')[0], 0, 0);
        });
      }
    });

    // 2. picture / source
    document.querySelectorAll('source').forEach(function(s) {
      ['srcset', 'data-srcset', 'src'].forEach(function(attr) {
        var v = s.getAttribute(attr);
        if (v) {
          v.split(',').forEach(function(p) {
            addUrl(p.trim().split(' ')[0], 0, 0);
          });
        }
      });
    });

    // 3. メタタグ（OGP画像、Twitter画像など）
    document.querySelectorAll('meta[property*="image"], meta[name*="image"]').forEach(function(m) {
      var c = m.getAttribute('content');
      if (c) addUrl(c, 0, 0);
    });

    // 4. linkタグ（アイコン、apple-touch-icon、preload画像など）
    document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"], link[rel="image_src"], link[rel="preload"][as="image"]').forEach(function(l) {
      var h = l.getAttribute('href');
      if (h) addUrl(h, 0, 0);
    });

    // 5. video poster
    document.querySelectorAll('video[poster]').forEach(function(v) {
      addUrl(v.poster || v.getAttribute('poster'), 0, 0);
    });

    // 6. svg image
    document.querySelectorAll('svg image').forEach(function(s) {
      addUrl(s.getAttribute('href') || s.getAttribute('xlink:href'), 0, 0);
    });

    // 7. 背景画像（CSS backgroundImage）
    document.querySelectorAll('*').forEach(function(el) {
      ['', '::before', '::after'].forEach(function(pseudo) {
        var bg = getComputedStyle(el, pseudo || null).backgroundImage;
        if (bg && bg.indexOf('url(') !== -1) {
          var start = bg.indexOf('url(') + 4;
          var end = bg.indexOf(')', start);
          if (end !== -1) {
            var raw = bg.substring(start, end).trim();
            if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
              raw = raw.slice(1, -1);
            }
            addUrl(raw, 0, 0);
          }
        }
      });
    });

    if (!urls.size) {
      alert('画像が見つかりませんでした');
      return;
    }

    var win = window.open('', '_blank');
    if (!win) {
      alert('ポップアップがブロックされました。ポップアップを許可して再度実行してください。');
      return;
    }

    function getExt(u) {
      if (u.indexOf('data:image/') === 0) {
        var semi = u.indexOf(';');
        if (semi !== -1) {
          return u.substring(11, semi).replace('+xml', '').toLowerCase();
        }
      }
      try {
        var p = new URL(u).pathname;
        var dot = p.lastIndexOf('.');
        if (dot !== -1 && dot < p.length - 1) {
          var ext = p.substring(dot + 1).split('?')[0].split('#')[0];
          if (ext.length >= 2 && ext.length <= 5) {
            return ext.toLowerCase();
          }
        }
      } catch (e) {}
      return 'jpg';
    }

    function getFileName(u) {
      if (u.indexOf('data:') === 0) return 'data_image';
      try {
        var p = new URL(u).pathname;
        var parts = p.split('/').filter(Boolean);
        var name = parts.pop();
        if (name) {
          return decodeURIComponent(name.split('?')[0].split('#')[0]);
        }
      } catch (e) {}
      return 'image';
    }

    var html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Image Gallery</title>',
      '<style>',
      '*{box-sizing:border-box;margin:0;padding:0;}',
      'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#FBF6EA;color:#6A564A;padding:20px;}',
      '.bar{position:sticky;top:0;background:#fff;padding:12px 18px;margin-bottom:20px;border-radius:14px;box-shadow:0 4px 16px rgba(106,86,74,0.1);z-index:100;display:flex;flex-wrap:wrap;align-items:center;gap:10px;border:1px solid rgba(154,176,143,0.3);}',
      '.btn{background:#fff;border:1.5px solid rgba(106,86,74,0.2);color:#6A564A;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;}',
      '.btn:hover{background:rgba(154,176,143,0.15);border-color:#9AB08F;color:#556B4A;}',
      '.btn-primary{background:#9AB08F;border-color:#9AB08F;color:#fff;}',
      '.btn-primary:hover{background:#849A7A;border-color:#849A7A;color:#fff;}',
      '#cnt{font-size:13px;font-weight:700;color:#6A564A;margin-left:auto;}',
      '.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;}',
      '.card{background:#fff;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(106,86,74,0.08);border:1.5px solid rgba(106,86,74,0.1);display:flex;flex-direction:column;gap:8px;transition:transform .15s,border-color .15s;}',
      '.card:hover{border-color:#9AB08F;transform:translateY(-2px);box-shadow:0 6px 18px rgba(106,86,74,0.12);}',
      '.img-box{width:100%;height:140px;background:#F6F1E3;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative;}',
      '.img-box img{max-width:100%;max-height:100%;object-fit:contain;display:block;}',
      '.ext-badge{position:absolute;top:6px;right:6px;background:rgba(106,86,74,0.75);color:#fff;font-size:10px;font-weight:800;padding:2px 6px;border-radius:5px;letter-spacing:.05em;text-transform:uppercase;}',
      '.meta{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(106,86,74,0.7);}',
      '.url-box{display:flex;align-items:center;gap:6px;background:#FBF6EA;padding:5px 8px;border-radius:6px;border:1px solid rgba(106,86,74,0.1);font-size:11px;}',
      '.url-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#6A564A;text-decoration:none;}',
      '.url-text:hover{text-decoration:underline;color:#9AB08F;}',
      '.btn-copy{border:none;background:#fff;color:#6A564A;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:10.5px;font-weight:700;border:1px solid rgba(106,86,74,0.2);flex-shrink:0;}',
      '.btn-copy:hover{background:#9AB08F;color:#fff;border-color:#9AB08F;}',
      '.label-row{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;cursor:pointer;user-select:none;}',
      '.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#6A564A;color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:200;}',
      '.toast.show{opacity:1;}',
      '</style></head><body>',
      '<div class="bar">',
      '<button class="btn" id="selAll">全選択</button>',
      '<button class="btn" id="selNone">全解除</button>',
      '<button class="btn" id="selMin">100px以上</button>',
      '<button class="btn btn-primary" id="dlZip">選択した画像をZIP保存</button>',
      '<span id="cnt"></span>',
      '</div>',
      '<div class="grid" id="grid"></div>',
      '<div class="toast" id="toast"></div>',
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"><\\/script>',
      '</body></html>'
    ].join('');

    win.document.write(html);
    win.document.close();

    var list = Array.from(urls.entries());
    var grid = win.document.getElementById('grid');
    var cnt = win.document.getElementById('cnt');
    var toast = win.document.getElementById('toast');

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
      }, 1800);
    }

    list.forEach(function(entry, i) {
      var url = entry[0], meta = entry[1];
      var ext = getExt(url);
      var fn = getFileName(url);
      var isSmall = meta.w && meta.h && (meta.w < MIN_SIZE || meta.h < MIN_SIZE);

      var card = win.document.createElement('div');
      card.className = 'card';

      var imgBox = win.document.createElement('div');
      imgBox.className = 'img-box';

      var img = win.document.createElement('img');
      img.src = url;
      img.loading = 'lazy';
      img.onload = function() {
        if (!meta.w || !meta.h) {
          meta.w = this.naturalWidth;
          meta.h = this.naturalHeight;
          dimSpan.textContent = meta.w + ' x ' + meta.h;
          if (meta.w < MIN_SIZE || meta.h < MIN_SIZE) {
            cb.checked = false;
            updateCount();
          }
        }
      };

      var extBadge = win.document.createElement('span');
      extBadge.className = 'ext-badge';
      extBadge.textContent = ext.toUpperCase();

      imgBox.appendChild(img);
      imgBox.appendChild(extBadge);

      var labelRow = win.document.createElement('label');
      labelRow.className = 'label-row';

      var cb = win.document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !isSmall;
      cb.dataset.url = url;
      cb.dataset.ext = ext;
      cb.dataset.fn = fn;

      var numSpan = win.document.createElement('span');
      numSpan.textContent = '#' + (i + 1) + ' ' + (fn.length > 18 ? fn.slice(0, 15) + '...' : fn);
      numSpan.title = fn;

      labelRow.appendChild(cb);
      labelRow.appendChild(numSpan);

      var metaRow = win.document.createElement('div');
      metaRow.className = 'meta';

      var dimSpan = win.document.createElement('span');
      dimSpan.textContent = (meta.w && meta.h) ? (meta.w + ' x ' + meta.h) : '読込中...';

      var extSpan = win.document.createElement('span');
      extSpan.textContent = '形式: ' + ext.toUpperCase();

      metaRow.appendChild(dimSpan);
      metaRow.appendChild(extSpan);

      var urlBox = win.document.createElement('div');
      urlBox.className = 'url-box';

      var urlLink = win.document.createElement('a');
      urlLink.className = 'url-text';
      urlLink.href = url;
      urlLink.target = '_blank';
      urlLink.rel = 'noopener noreferrer';
      urlLink.title = url;
      urlLink.textContent = url;

      var cpBtn = win.document.createElement('button');
      cpBtn.className = 'btn-copy';
      cpBtn.textContent = 'コピー';
      cpBtn.type = 'button';
      cpBtn.onclick = function(e) {
        e.stopPropagation();
        if (win.navigator && win.navigator.clipboard) {
          win.navigator.clipboard.writeText(url).then(function() {
            showToast('URLをコピーしました');
          });
        } else {
          var ta = win.document.createElement('textarea');
          ta.value = url;
          win.document.body.appendChild(ta);
          ta.select();
          win.document.execCommand('copy');
          win.document.body.removeChild(ta);
          showToast('URLをコピーしました');
        }
      };

      urlBox.appendChild(urlLink);
      urlBox.appendChild(cpBtn);

      card.appendChild(imgBox);
      card.appendChild(labelRow);
      card.appendChild(metaRow);
      card.appendChild(urlBox);
      grid.appendChild(card);
    });

    function updateCount() {
      var n = win.document.querySelectorAll('#grid input:checked').length;
      cnt.textContent = n + ' / ' + list.length + ' 件選択中';
    }
    updateCount();

    win.document.getElementById('selAll').onclick = function() {
      win.document.querySelectorAll('#grid input').forEach(function(c) {
        c.checked = true;
      });
      updateCount();
    };
    win.document.getElementById('selNone').onclick = function() {
      win.document.querySelectorAll('#grid input').forEach(function(c) {
        c.checked = false;
      });
      updateCount();
    };
    win.document.getElementById('selMin').onclick = function() {
      list.forEach(function(entry, i) {
        var meta = entry[1];
        var cb = win.document.querySelectorAll('#grid input')[i];
        if (cb) {
          cb.checked = !meta.w || !meta.h || (meta.w >= MIN_SIZE && meta.h >= MIN_SIZE);
        }
      });
      updateCount();
    };
    win.document.getElementById('grid').addEventListener('change', updateCount);

    win.document.getElementById('dlZip').onclick = function() {
      var checked = Array.from(win.document.querySelectorAll('#grid input:checked')).map(function(c) {
        return { url: c.dataset.url, ext: c.dataset.ext, fn: c.dataset.fn };
      });
      if (!checked.length) {
        win.alert('画像を選択してください');
        return;
      }
      if (!win.JSZip) {
        win.alert('ZIPライブラリの読み込み中です。少し待って再度お試しください');
        return;
      }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'ZIP作成中 (0/' + checked.length + ')...';
      var zip = new win.JSZip();
      var done = 0;
      checked.forEach(function(item, i) {
        fetch(item.url).then(function(r) {
          return r.blob();
        }).then(function(blob) {
          var ext = (blob.type.split('/')[1] || item.ext || 'jpg').split('+')[0];
          var baseName = item.fn || 'image';
          var dotIdx = baseName.lastIndexOf('.');
          if (dotIdx > 0) baseName = baseName.substring(0, dotIdx);
          var name = (i + 1) + '_' + baseName + '.' + ext;
          zip.file(name, blob);
        }).catch(function() {}).finally(function() {
          done++;
          btn.textContent = 'ZIP作成中 (' + done + '/' + checked.length + ')...';
          if (done === checked.length) {
            zip.generateAsync({ type: 'blob' }).then(function(content) {
              var a = win.document.createElement('a');
              a.href = win.URL.createObjectURL(content);
              a.download = 'images_' + Date.now() + '.zip';
              a.click();
              btn.disabled = false;
              btn.textContent = '選択した画像をZIP保存';
            });
          }
        });
      });
    };
  })()`
  },
  {
    num: 13,
    id: "site-meta-audit",
    tag: "サイト管理",
    title: "サイトメタデータ監査",
    description: "OGP、description、title、JSON-LD等のメタ情報を一覧表示。SNSシェア時のプレビュー確認にも。",
    code: `javascript:void(function(){try{var old=document.getElementById('__bm_meta_audit__');if(old)old.remove();var info={};info.title=document.title||'(未設定)';info.url=location.href;info.charset=(document.characterSet||document.charset||'(不明)');info.lang=(document.documentElement.lang||'(未設定)');var metas=[];document.querySelectorAll('meta').forEach(function(m){var n=m.getAttribute('name')||m.getAttribute('property')||m.getAttribute('http-equiv')||'';var c=m.getAttribute('content')||m.getAttribute('value')||'';if(n||c)metas.push({name:n,content:c});});var ogp={};metas.forEach(function(m){if(m.name.indexOf('og:')===0)ogp[m.name]=m.content;if(m.name.indexOf('twitter:')===0)ogp[m.name]=m.content;});var desc='';metas.forEach(function(m){if(m.name.toLowerCase()==='description')desc=m.content;});var jsonld=[];document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s){try{var j=JSON.parse(s.textContent);jsonld.push(j);}catch(e){}});var canonical='';var cl=document.querySelector('link[rel="canonical"]');if(cl)canonical=cl.href||'';var h1s=document.querySelectorAll('h1');var ov=document.createElement('div');ov.id='__bm_meta_audit__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(720px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='サイトメタデータ監査';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:16px;overflow:auto;display:flex;flex-direction:column;gap:14px;font-size:13px;line-height:1.6;';function addSection(title,items){var sec=document.createElement('div');sec.style.cssText='background:#fff;border-radius:12px;padding:12px 14px;border:1px solid rgba(154,176,143,.2);';var st=document.createElement('div');st.style.cssText='font-weight:700;font-size:13px;margin-bottom:8px;color:#556B4A;';st.textContent=title;sec.appendChild(st);items.forEach(function(it){var r=document.createElement('div');r.style.cssText='display:flex;gap:8px;padding:4px 0;border-bottom:1px solid rgba(106,86,74,.06);font-size:12px;';var lb=document.createElement('span');lb.style.cssText='font-weight:600;min-width:120px;flex-shrink:0;color:#6A564A;word-break:break-all;';lb.textContent=it.label;var vl=document.createElement('span');vl.style.cssText='flex:1;word-break:break-all;color:'+(it.warn?'#c0392b':'#6A564A')+';';vl.textContent=it.value;r.appendChild(lb);r.appendChild(vl);sec.appendChild(r);});bd.appendChild(sec);}addSection('基本情報',[{label:'title',value:info.title,warn:!document.title},{label:'description',value:desc||'(未設定)',warn:!desc},{label:'URL',value:info.url},{label:'canonical',value:canonical||'(未設定)',warn:!canonical},{label:'charset',value:info.charset},{label:'lang',value:info.lang,warn:!document.documentElement.lang},{label:'h1の数',value:h1s.length+'個'+(h1s.length!==1?' (推奨: 1個)':''),warn:h1s.length!==1}]);if(Object.keys(ogp).length){var ogpItems=[];for(var k in ogp)ogpItems.push({label:k,value:ogp[k]});addSection('OGP / Twitter Card',ogpItems);}else{addSection('OGP / Twitter Card',[{label:'状態',value:'OGPタグが見つかりません',warn:true}]);}if(jsonld.length){addSection('JSON-LD (構造化データ)',[{label:'数',value:jsonld.length+'件'},{label:'内容',value:JSON.stringify(jsonld,null,1).substring(0,500)+(JSON.stringify(jsonld).length>500?'...':'')}]);}else{addSection('JSON-LD (構造化データ)',[{label:'状態',value:'JSON-LDが見つかりません',warn:true}]);}if(metas.length){var metaItems=metas.slice(0,30).map(function(m){return{label:m.name||'(属性なし)',value:m.content};});addSection('全metaタグ (上位30件)',metaItems);}box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 14,
    id: "link-checker",
    tag: "サイト管理",
    title: "リンクチェッカー",
    description: "ページ内の全リンクを検証し、404やエラーリンクをハイライト表示。壊れたリンクの発見に。",
    code: `javascript:void((async function(){try{var old=document.getElementById('__bm_link_check__');if(old)old.remove();var links=[];var seen=new Set();document.querySelectorAll('a[href]').forEach(function(a){var h=a.href;if(!h||h.indexOf('javascript:')===0||h.indexOf('mailto:')===0||h.indexOf('tel:')===0||h==='#')return;try{h=new URL(h,location.href).href;}catch(e){return;}if(seen.has(h))return;seen.add(h);links.push({url:h,text:(a.textContent||'').trim().substring(0,60),el:a,status:null,ok:null});});if(!links.length){alert('リンクが見つかりませんでした。');return;}var ov=document.createElement('div');ov.id='__bm_link_check__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(760px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='リンクチェッカー ('+links.length+'件)';var prog=document.createElement('span');prog.style.cssText='font-size:12px;color:#888;';prog.textContent='検証中...';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(prog);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:12px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:12px;';links.forEach(function(lk){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border-radius:10px;border:1px solid rgba(154,176,143,.15);';var badge=document.createElement('span');badge.style.cssText='min-width:44px;text-align:center;padding:3px 6px;border-radius:6px;font-size:11px;font-weight:700;background:#eee;color:#999;';badge.textContent='...';lk._badge=badge;var info=document.createElement('div');info.style.cssText='flex:1;min-width:0;';var urlDiv=document.createElement('div');urlDiv.style.cssText='font-size:11px;color:#6A564A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';urlDiv.textContent=lk.url;var textDiv=document.createElement('div');textDiv.style.cssText='font-size:10px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;';textDiv.textContent=lk.text||'(テキストなし)';info.appendChild(urlDiv);info.appendChild(textDiv);row.appendChild(badge);row.appendChild(info);bd.appendChild(row);lk._row=row;});box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});var done=0,okCount=0,errCount=0;for(var i=0;i<links.length;i++){var lk=links[i];try{var r=await fetch(lk.url,{method:'HEAD',mode:'no-cors',cache:'no-cache'});var st=r.status;if(r.type==='opaque'){lk._badge.textContent='CORS';lk._badge.style.background='#ffeaa7';lk._badge.style.color='#d68910';lk.ok=true;okCount++;}else if(st>=200&&st<400){lk._badge.textContent=st;lk._badge.style.background='#d5f5e3';lk._badge.style.color='#1e8449';lk.ok=true;okCount++;}else{lk._badge.textContent=st;lk._badge.style.background='#fadbd8';lk._badge.style.color='#c0392b';lk._row.style.borderColor='#e74c3c';lk.el.style.outline='3px solid #e74c3c';lk.ok=false;errCount++;}}catch(e){lk._badge.textContent='ERR';lk._badge.style.background='#fadbd8';lk._badge.style.color='#c0392b';lk._row.style.borderColor='#e74c3c';lk.el.style.outline='3px solid #e74c3c';lk.ok=false;errCount++;}done++;prog.textContent=done+'/'+links.length+' 完了 (OK:'+okCount+' NG:'+errCount+')';}prog.textContent='完了 - OK:'+okCount+' NG:'+errCount+' / '+links.length+'件';}catch(e){alert('エラー: '+e);}})())`
  },
  {
    num: 15,
    id: "asset-list",
    tag: "サイト管理",
    title: "CSS/JSアセット一覧",
    description: "外部読み込みのスクリプト・スタイルシートを一覧表示。読み込み状況や重複チェックに。",
    code: `javascript:void(function(){try{var old=document.getElementById('__bm_asset_list__');if(old)old.remove();var assets=[];document.querySelectorAll('script[src]').forEach(function(s){assets.push({type:'JS',url:s.src,async:s.async,defer:s.defer,crossorigin:s.crossOrigin||''});});document.querySelectorAll('link[rel="stylesheet"]').forEach(function(l){assets.push({type:'CSS',url:l.href,media:l.media||'all',crossorigin:l.crossOrigin||''});});document.querySelectorAll('link[rel="preload"],link[rel="prefetch"],link[rel="preconnect"],link[rel="dns-prefetch"]').forEach(function(l){assets.push({type:l.rel.toUpperCase(),url:l.href,as:l.getAttribute('as')||''});});var inlineJS=document.querySelectorAll('script:not([src])').length;var inlineCSS=document.querySelectorAll('style').length;var ov=document.createElement('div');ov.id='__bm_asset_list__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(800px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='CSS/JS アセット一覧';var sm=document.createElement('span');sm.style.cssText='font-size:12px;color:#888;';sm.textContent='外部: '+assets.length+'件 / インラインJS: '+inlineJS+'件, CSS: '+inlineCSS+'件';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(sm);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:12px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:12px;';var dupes=new Map();assets.forEach(function(a){dupes.set(a.url,(dupes.get(a.url)||0)+1);});assets.forEach(function(a,i){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border-radius:10px;border:1px solid rgba(154,176,143,.15);';var badge=document.createElement('span');var bg=a.type==='JS'?'#fdebd0':a.type==='CSS'?'#d4efdf':'#d6eaf8';var col=a.type==='JS'?'#e67e22':a.type==='CSS'?'#27ae60':'#2980b9';badge.style.cssText='min-width:50px;text-align:center;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;background:'+bg+';color:'+col+';';badge.textContent=a.type;var info=document.createElement('div');info.style.cssText='flex:1;min-width:0;';var urlDiv=document.createElement('div');urlDiv.style.cssText='font-size:11px;color:#6A564A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';urlDiv.textContent=a.url;var detailDiv=document.createElement('div');detailDiv.style.cssText='font-size:10px;color:#999;margin-top:2px;';var details=[];if(a.async)details.push('async');if(a.defer)details.push('defer');if(a.media&&a.media!=='all')details.push('media:'+a.media);if(a.as)details.push('as:'+a.as);if(dupes.get(a.url)>1)details.push('重複!');detailDiv.textContent=details.join(' | ')||'';info.appendChild(urlDiv);if(details.length)info.appendChild(detailDiv);var cpBtn=document.createElement('button');cpBtn.type='button';cpBtn.textContent='コピー';cpBtn.style.cssText='border:1px solid rgba(106,86,74,.2);background:#fff;color:#6A564A;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;flex-shrink:0;';cpBtn.onclick=function(){navigator.clipboard.writeText(a.url).catch(function(){});cpBtn.textContent='OK';setTimeout(function(){cpBtn.textContent='コピー';},1200);};if(dupes.get(a.url)>1){row.style.borderColor='#e67e22';row.style.background='#fef9f0';}row.appendChild(badge);row.appendChild(info);row.appendChild(cpBtn);bd.appendChild(row);});box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 16,
    id: "page-performance",
    tag: "サイト管理",
    title: "ページパフォーマンス計測",
    description: "DOM要素数、ファイルサイズ、読込時間などの基本パフォーマンス指標を表示。",
    code: `javascript:void(function(){try{var old=document.getElementById('__bm_perf__');if(old)old.remove();var perf=performance.getEntriesByType('navigation')[0]||performance.timing;var res=performance.getEntriesByType('resource');var allEls=document.querySelectorAll('*').length;var imgs=document.querySelectorAll('img').length;var scripts=document.querySelectorAll('script').length;var styles=document.querySelectorAll('link[rel=stylesheet],style').length;var iframes=document.querySelectorAll('iframe').length;var totalSize=0;var typeSize={};res.forEach(function(r){var s=r.transferSize||r.encodedBodySize||0;totalSize+=s;var t=r.initiatorType||'other';typeSize[t]=(typeSize[t]||0)+s;});function fmt(b){if(b<1024)return b+'B';if(b<1048576)return(b/1024).toFixed(1)+'KB';return(b/1048576).toFixed(2)+'MB';}var dns=0,tcp=0,ttfb=0,dom=0,load=0,fcp=0;if(perf.domainLookupEnd){dns=Math.round(perf.domainLookupEnd-perf.domainLookupStart);tcp=Math.round(perf.connectEnd-perf.connectStart);ttfb=Math.round(perf.responseStart-(perf.requestStart||perf.fetchStart));dom=Math.round(perf.domContentLoadedEventEnd-perf.fetchStart);load=Math.round(perf.loadEventEnd-perf.fetchStart);}var fcpEntry=performance.getEntriesByName('first-contentful-paint');if(fcpEntry&&fcpEntry.length)fcp=Math.round(fcpEntry[0].startTime);var ov=document.createElement('div');ov.id='__bm_perf__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(680px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='ページパフォーマンス';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:16px;overflow:auto;display:flex;flex-direction:column;gap:14px;font-size:13px;';function addCard(title,rows){var c=document.createElement('div');c.style.cssText='background:#fff;border-radius:12px;padding:12px 14px;border:1px solid rgba(154,176,143,.2);';var t=document.createElement('div');t.style.cssText='font-weight:700;font-size:13px;margin-bottom:8px;color:#556B4A;';t.textContent=title;c.appendChild(t);rows.forEach(function(r){var d=document.createElement('div');d.style.cssText='display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(106,86,74,.06);font-size:12px;';var l=document.createElement('span');l.style.fontWeight='600';l.textContent=r[0];var v=document.createElement('span');v.style.color=r[2]||'#6A564A';v.style.fontWeight='600';v.textContent=r[1];d.appendChild(l);d.appendChild(v);c.appendChild(d);});bd.appendChild(c);}addCard('読み込み時間',[['DNS',dns+'ms'],['TCP接続',tcp+'ms'],['TTFB (最初のバイト)',ttfb+'ms',ttfb>600?'#c0392b':'#27ae60'],['FCP (最初の描画)',fcp+'ms',fcp>2500?'#c0392b':fcp>1000?'#e67e22':'#27ae60'],['DOM読込完了',dom+'ms',dom>3000?'#c0392b':'#27ae60'],['ページ読込完了',load+'ms',load>5000?'#c0392b':'#27ae60']]);addCard('DOM統計',[['全要素数',allEls+(allEls>1500?' (多め)':''),allEls>1500?'#e67e22':'#27ae60'],['img要素',imgs+'個'],['script要素',scripts+'個'],['style/link[css]',styles+'個'],['iframe',iframes+'個']]);var sizeRows=[['合計転送サイズ',fmt(totalSize)]];for(var k in typeSize){sizeRows.push([k,fmt(typeSize[k])]);}addCard('リソースサイズ ('+res.length+'件)',sizeRows);box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 17,
    id: "text-bulk-copy",
    tag: "サイト管理",
    title: "全テキスト一括コピー",
    description: "ページの主要テキスト（見出し・段落）を構造付きでクリップボードにコピー。コンテンツ移行に。",
    code: `javascript:void(function(){try{var old=document.getElementById('__bm_text_copy__');if(old)old.remove();var sections=[];var headings=['h1','h2','h3','h4','h5','h6'];var allNodes=document.querySelectorAll(headings.join(',')+',p,li,td,th,blockquote,figcaption,dt,dd');var result=[];allNodes.forEach(function(el){var tag=el.tagName.toLowerCase();var text=(el.textContent||'').trim();if(!text||text.length<2)return;var prefix='';if(tag==='h1')prefix='# ';else if(tag==='h2')prefix='## ';else if(tag==='h3')prefix='### ';else if(tag==='h4')prefix='#### ';else if(tag==='h5')prefix='##### ';else if(tag==='h6')prefix='###### ';else if(tag==='li')prefix='- ';else if(tag==='blockquote')prefix='> ';else if(tag==='dt')prefix='**';else if(tag==='dd')prefix='  ';if(tag==='dt')text=text+'**';result.push(prefix+text);});if(!result.length){alert('テキストが見つかりませんでした。');return;}var output=result.join('\\n\\n');var ov=document.createElement('div');ov.id='__bm_text_copy__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(700px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='テキスト抽出 ('+result.length+'ブロック)';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:14px;overflow:auto;display:flex;flex-direction:column;gap:10px;';var ta=document.createElement('textarea');ta.readOnly=true;ta.value=output;ta.style.cssText='width:100%;height:300px;padding:12px;border:1px solid rgba(154,176,143,.3);border-radius:10px;font-size:12px;font-family:ui-monospace,monospace;resize:vertical;line-height:1.6;color:#6A564A;background:#fff;';var btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;flex-wrap:wrap;';var btnCopy=document.createElement('button');btnCopy.type='button';btnCopy.textContent='クリップボードにコピー';btnCopy.style.cssText='border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;background:#9AB08F;color:#fff;';btnCopy.onclick=function(){navigator.clipboard.writeText(output).then(function(){btnCopy.textContent='コピーしました';btnCopy.style.background='#556B4A';setTimeout(function(){btnCopy.textContent='クリップボードにコピー';btnCopy.style.background='#9AB08F';},1800);}).catch(function(){ta.focus();ta.select();document.execCommand('copy');});};var btnClose=document.createElement('button');btnClose.type='button';btnClose.textContent='閉じる';btnClose.style.cssText='border:1.5px solid rgba(106,86,74,.2);border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;background:#fff;color:#6A564A;';btnClose.onclick=function(){ov.remove();};btnRow.appendChild(btnCopy);btnRow.appendChild(btnClose);bd.appendChild(ta);bd.appendChild(btnRow);box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 18,
    id: "accessibility-check",
    tag: "サイト管理",
    title: "アクセシビリティチェック",
    description: "alt属性の欠落、コントラスト不足、見出し階層の問題等を簡易診断。",
    code: `javascript:void(function(){try{var old=document.getElementById('__bm_a11y__');if(old)old.remove();var issues=[];var warnings=[];var good=[];var imgs=document.querySelectorAll('img');var noAlt=0;imgs.forEach(function(img){if(!img.hasAttribute('alt')){noAlt++;img.style.outline='3px solid #e74c3c';}});if(noAlt>0)issues.push('alt属性なしの画像: '+noAlt+'枚');else good.push('全画像にalt属性あり ('+imgs.length+'枚)');var headings=document.querySelectorAll('h1,h2,h3,h4,h5,h6');var h1Count=document.querySelectorAll('h1').length;if(h1Count===0)issues.push('h1要素がありません');else if(h1Count>1)warnings.push('h1要素が'+h1Count+'個あります (推奨: 1個)');else good.push('h1要素は1個 (適切)');var prevLevel=0;var skipCount=0;headings.forEach(function(h){var level=parseInt(h.tagName.charAt(1));if(prevLevel>0&&level>prevLevel+1)skipCount++;prevLevel=level;});if(skipCount>0)warnings.push('見出しレベルのスキップ: '+skipCount+'箇所');else good.push('見出し階層は適切 ('+headings.length+'個)');var inputs=document.querySelectorAll('input,select,textarea');var noLabel=0;inputs.forEach(function(inp){if(inp.type==='hidden'||inp.type==='submit'||inp.type==='button')return;var hasLabel=inp.id&&document.querySelector('label[for="'+inp.id+'"]');var hasAria=inp.getAttribute('aria-label')||inp.getAttribute('aria-labelledby');var wrapped=inp.closest('label');if(!hasLabel&&!hasAria&&!wrapped){noLabel++;inp.style.outline='3px solid #e67e22';}});if(noLabel>0)warnings.push('ラベルなしフォーム要素: '+noLabel+'個');else if(inputs.length)good.push('全フォーム要素にラベルあり');var buttons=document.querySelectorAll('button,a[role=button],[role=button]');var emptyBtn=0;buttons.forEach(function(b){var text=(b.textContent||'').trim();var ariaLabel=b.getAttribute('aria-label')||'';var title=b.getAttribute('title')||'';if(!text&&!ariaLabel&&!title){emptyBtn++;b.style.outline='3px solid #8e44ad';}});if(emptyBtn>0)warnings.push('テキストなしボタン/リンク: '+emptyBtn+'個');else if(buttons.length)good.push('全ボタンにテキストあり');var langAttr=document.documentElement.lang;if(!langAttr)issues.push('html要素にlang属性がありません');else good.push('lang属性: '+langAttr);var tabIndex=document.querySelectorAll('[tabindex]');var negTab=0;tabIndex.forEach(function(el){if(parseInt(el.getAttribute('tabindex'))<0)negTab++;});if(negTab>0)warnings.push('tabindex="-1"の要素: '+negTab+'個');var ov=document.createElement('div');ov.id='__bm_a11y__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';var box=document.createElement('div');box.style.cssText='width:min(680px,96vw);max-height:90vh;background:#FBF6EA;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#6A564A;';var hd=document.createElement('div');hd.style.cssText='padding:14px 18px;border-bottom:1px solid rgba(154,176,143,.3);display:flex;align-items:center;justify-content:space-between;background:#fff;';var ht=document.createElement('strong');ht.style.fontSize='15px';ht.textContent='アクセシビリティチェック';var hx=document.createElement('button');hx.type='button';hx.textContent='\\u2715';hx.style.cssText='border:none;background:none;font-size:18px;cursor:pointer;color:#6A564A;padding:0 4px;';hx.onclick=function(){ov.remove();};hd.appendChild(ht);hd.appendChild(hx);var bd=document.createElement('div');bd.style.cssText='padding:16px;overflow:auto;display:flex;flex-direction:column;gap:12px;font-size:13px;';var score=Math.max(0,100-issues.length*20-warnings.length*8);var scoreDiv=document.createElement('div');scoreDiv.style.cssText='text-align:center;padding:16px;background:#fff;border-radius:12px;border:1px solid rgba(154,176,143,.2);';var scoreNum=document.createElement('div');scoreNum.style.cssText='font-size:42px;font-weight:800;color:'+(score>=80?'#27ae60':score>=50?'#e67e22':'#c0392b')+';';scoreNum.textContent=score;var scoreLbl=document.createElement('div');scoreLbl.style.cssText='font-size:12px;color:#888;margin-top:4px;';scoreLbl.textContent='アクセシビリティスコア (簡易)';scoreDiv.appendChild(scoreNum);scoreDiv.appendChild(scoreLbl);bd.appendChild(scoreDiv);function addList(title,items,color,icon){if(!items.length)return;var sec=document.createElement('div');sec.style.cssText='background:#fff;border-radius:12px;padding:12px 14px;border:1px solid rgba(154,176,143,.2);';var st=document.createElement('div');st.style.cssText='font-weight:700;font-size:13px;margin-bottom:8px;color:'+color+';';st.textContent=icon+' '+title+' ('+items.length+')';sec.appendChild(st);items.forEach(function(it){var r=document.createElement('div');r.style.cssText='padding:4px 0;border-bottom:1px solid rgba(106,86,74,.06);font-size:12px;color:#6A564A;';r.textContent='\\u2022 '+it;sec.appendChild(r);});bd.appendChild(sec);}addList('問題',issues,'#c0392b','\\u26a0');addList('警告',warnings,'#e67e22','\\u26a1');addList('良好',good,'#27ae60','\\u2713');box.appendChild(hd);box.appendChild(bd);ov.appendChild(box);document.body.appendChild(ov);ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});}catch(e){alert('エラー: '+e);}})()`
  },
  {
    num: 19,
    id: "open-in-new-tab",
    tag: "便利ツール",
    title: "別タブで開く",
    description: "現在開いているページを新しいタブで複製して開きます。",
    code: `javascript:void(window.open(location.href,'_blank'))`
  }
];
