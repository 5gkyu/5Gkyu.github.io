
//===============================================================
// debounce関数
//===============================================================
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


//===============================================================
// メニュー関連
//===============================================================

// 変数でセレクタを管理
var $menubar = $('#menubar');
var $menubarHdr = $('#menubar_hdr');

// menu
$(window).on("load resize", debounce(function() {
    if(window.innerWidth < 900) {
        // 小さな端末用の処理
        $('body').addClass('small-screen').removeClass('large-screen');
        $menubar.addClass('display-none').removeClass('display-block');
        $menubarHdr.removeClass('display-none ham').addClass('display-block');
    } else {
        // 大きな端末用の処理
        $('body').addClass('large-screen').removeClass('small-screen');
        $menubar.addClass('display-block').removeClass('display-none');
        $menubarHdr.removeClass('display-block').addClass('display-none');

        // ドロップダウンメニューが開いていれば、それを閉じる
        $('.ddmenu_parent > ul').hide();
    }
}, 10));

$(function() {

    // ハンバーガーメニューをクリックした際の処理
    $menubarHdr.click(function() {
        $(this).toggleClass('ham');
        if ($(this).hasClass('ham')) {
            $menubar.addClass('display-block');
        } else {
            $menubar.removeClass('display-block');
        }
    });

    // アンカーリンクの場合にメニューを閉じる処理
    $menubar.find('a[href*="#"]').click(function() {
        $menubar.removeClass('display-block');
        $menubarHdr.removeClass('ham');
    });

    // ドロップダウンの親liタグ（空のリンクを持つaタグのデフォルト動作を防止）
	$menubar.find('a[href=""]').click(function() {
		return false;
	});

	// ドロップダウンメニューの処理
    $menubar.find('li:has(ul)').addClass('ddmenu_parent');
    $('.ddmenu_parent > a').addClass('ddmenu');

// タッチ開始位置を格納する変数
var touchStartY = 0;

// タッチデバイス用
$('.ddmenu').on('touchstart', function(e) {
    // タッチ開始位置を記録
    touchStartY = e.originalEvent.touches[0].clientY;
}).on('touchend', function(e) {
    // タッチ終了時の位置を取得
    var touchEndY = e.originalEvent.changedTouches[0].clientY;
    
    // タッチ開始位置とタッチ終了位置の差分を計算
    var touchDifference = touchStartY - touchEndY;
    
    // スクロール動作でない（差分が小さい）場合にのみドロップダウンを制御
    if (Math.abs(touchDifference) < 10) { // 10px以下の移動ならタップとみなす
        var $nextUl = $(this).next('ul');
        if ($nextUl.is(':visible')) {
            $nextUl.stop().hide();
        } else {
            $nextUl.stop().show();
        }
        $('.ddmenu').not(this).next('ul').hide();
        return false; // ドロップダウンのリンクがフォローされるのを防ぐ
    }
});

    //PC用
    $('.ddmenu_parent').hover(function() {
        $(this).children('ul').stop().show();
    }, function() {
        $(this).children('ul').stop().hide();
    });

    // ドロップダウンをページ内リンクで使った場合に、ドロップダウンを閉じる
    $('.ddmenu_parent ul a').click(function() {
        $('.ddmenu_parent > ul').hide();
    });

});


//===============================================================
// 小さなメニューが開いている際のみ、body要素のスクロールを禁止。
//===============================================================
$(document).ready(function() {
  function toggleBodyScroll() {
    // 条件をチェック
    if ($('#menubar_hdr').hasClass('ham') && !$('#menubar_hdr').hasClass('display-none')) {
      // #menubar_hdr が 'ham' クラスを持ち、かつ 'display-none' クラスを持たない場合、スクロールを禁止
      $('body').css({
        overflow: 'hidden',
        height: '100%'
      });
    } else {
      // その他の場合、スクロールを再び可能に
      $('body').css({
        overflow: '',
        height: ''
      });
    }
  }

  // 初期ロード時にチェックを実行
  toggleBodyScroll();

  // クラスが動的に変更されることを想定して、MutationObserverを使用
  const observer = new MutationObserver(toggleBodyScroll);
  observer.observe(document.getElementById('menubar_hdr'), { attributes: true, attributeFilter: ['class'] });
});


//===============================================================
// スムーススクロール（※バージョン2024-1）※通常タイプ
//===============================================================
$(function() {
    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');
    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';

    // スムーススクロールを実行する関数
    // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
    function smoothScroll(target) {
        // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
        var scrollTo = target === '#' ? 0 : $(target).offset().top - 25;
        // アニメーションでスムーススクロールを実行
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

    // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
    $('a[href^="#"], .pagetop').click(function(e) {
        e.preventDefault(); // デフォルトのアンカー動作をキャンセル
        var id = $(this).attr('href') || '#'; // クリックされた要素のhref属性を取得、なければ'#'
        smoothScroll(id); // スムーススクロールを実行
    });

    // スクロールに応じてページトップボタンの表示/非表示を切り替え
    $(topButton).hide(); // 初期状態ではボタンを隠す
    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) { // スクロール位置が300pxを超えたら
            $(topButton).fadeIn().addClass(scrollShow); // ボタンを表示
        } else {
            $(topButton).fadeOut().removeClass(scrollShow); // それ以外では非表示
        }
    });

    // ページロード時にURLのハッシュが存在する場合の処理
    if(window.location.hash) {
        // ページの最上部に即時スクロールする
        $('html, body').scrollTop(0);
        // 少し遅延させてからスムーススクロールを実行
        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 10);
    }
});


//===============================================================
// 汎用開閉処理
//===============================================================
$(function() {
	$('.openclose').next().hide();
	$('.openclose').click(function() {
		$(this).next().slideToggle();
		$('.openclose').not(this).next().slideUp();
	});
});


//===============================================================
// 背景切り替え
//===============================================================
$(document).ready(function () {
  function checkVisibility() {
    const viewportHeight = $(window).height(); // ビューポートの高さ
    const scrollTop = $(window).scrollTop(); // 現在のスクロール位置

    $(".section").each(function () {
      const sectionTop = $(this).offset().top; // セクションの上端位置
      const sectionHeight = $(this).outerHeight(); // セクションの高さ

      // セクションの位置をチェックして画像を切り替える
      if (sectionTop < scrollTop + viewportHeight * 0.6 && sectionTop + sectionHeight > scrollTop + viewportHeight * 0.4) {
        $(this).addClass("active").removeClass("inactive"); // フェードイン
      } else {
        $(this).addClass("inactive").removeClass("active"); // フェードアウト
      }
    });
  }

  // スクロールイベントでチェック
  $(window).on("scroll", checkVisibility);

  // 初期チェック
  checkVisibility();
});


function calculate(){

    var tro1=parseFloat(document.getElementById("tro").value);
    var mas=parseFloat(document.getElementById("masp").value);
    var win=parseFloat(document.getElementById("win").value);
    var mvp=parseFloat(document.getElementById("mvp").value);
    var time=parseFloat(document.getElementById("time").value);
    var mtime=parseFloat(document.getElementById("mtime").value); 
    
    var power;
    var coin;

    var powerlevel=parseFloat(document.getElementById("powerlevel").value);
    if(powerlevel==1){power=0,coin=0};
    if(powerlevel==2){power=20,coin=20};
    if(powerlevel==3){power=50,coin=50};
    if(powerlevel==4){power=100,coin=130};
    if(powerlevel==5){power=180,coin=270};
    if(powerlevel==6){power=310,coin=560};
    if(powerlevel==7){power=520,coin=1040};
    if(powerlevel==8){power=860,coin=1840};
    if(powerlevel==9){power=1410,coin=3090};
    if(powerlevel==10){power=2300,coin=4965};
    
    var star=parseFloat(document.getElementById("star").value);
    var gad=parseFloat(document.getElementById("gad").value);
    var gea=parseFloat(document.getElementById("gea").value);
    var hyper=parseFloat(document.getElementById("hyper").value);

    var mvptro=(tro1+(tro1/5)).toFixed(0);
    var tro=tro1+(tro1/5*mvp);
    var check=document.getElementById("doubleTro").checked;
    if(check){tro=tro*2.0}
    ///////////////////
    var b1win=((300-mas)/tro*win).toFixed(0); 
    var b2win=((800-mas)/tro*win).toFixed(0);
    var b3win=((1500-mas)/tro*win).toFixed(0);
    if(b1win < 0) b1win = 0;
    if(b2win < 0) b2win = 0;
    if(b3win < 0) b3win = 0;

    var s1win=((2600-mas)/tro*win).toFixed(0);
    var s2win=((4000-mas)/tro*win).toFixed(0);
    var s3win=((5800-mas)/tro*win).toFixed(0);
    if(s1win < 0) s1win = 0;
    if(s2win < 0) s2win = 0;
    if(s3win < 0) s3win = 0;

    var g1win=((10300-mas)/tro*win).toFixed(0);
    var g2win=((16800-mas)/tro*win).toFixed(0);
    var g3win=((24800-mas)/tro*win).toFixed(0);
    if(g1win < 0) g1win = 0;
    if(g2win < 0) g2win = 0;
    if(g3win < 0) g3win = 0;
    ////////////////////
    var btime1= b1win * time+b1win*mtime;
    var btime2= b2win * time+b2win*mtime;
    var btime3= b3win * time+b3win*mtime;

    var stime1= s1win * time+s1win*mtime;
    var stime2= s2win * time+s2win*mtime;
    var stime3= s3win * time+s3win*mtime;

    var gtime1= g1win * time+g1win*mtime;
    var gtime2= g2win * time+g2win*mtime;
    var gtime3= g3win * time+g3win*mtime;
    //////////////////////
    var bh1=Math.floor(btime1/3600);
    var bh2=Math.floor(btime2/3600);
    var bh3=Math.floor(btime3/3600);

    var bm1=Math.floor(btime1%3600/60);
    var bm2=Math.floor(btime2%3600/60);
    var bm3=Math.floor(btime3%3600/60);

    var sh1=Math.floor(stime1/3600);
    var sh2=Math.floor(stime2/3600);
    var sh3=Math.floor(stime3/3600);

    var sm1=Math.floor(stime1%3600/60);
    var sm2=Math.floor(stime2%3600/60);
    var sm3=Math.floor(stime3%3600/60);

    var gh1=Math.floor(gtime1/3600);
    var gh2=Math.floor(gtime2/3600);
    var gh3=Math.floor(gtime3/3600);

    var gm1=Math.floor(gtime1%3600/60);
    var gm2=Math.floor(gtime2%3600/60);
    var gm3=Math.floor(gtime3%3600/60);
    ////////////////////残りポイント
    var b1p=(300-mas) ;
    var b2p=(800-mas);
    var b3p=(1500-mas);
    if(b1p < 0) b1p = 0;
    if(b2p < 0) b2p = 0;
    if(b3p < 0) b3p = 0;

    var s1p=(2600-mas);
    var s2p=(4000-mas);
    var s3p=(5800-mas);
    if(s1p < 0) s1p = 0;
    if(s2p < 0) s2p = 0;
    if(s3p < 0) s3p = 0;

    var g1p=(10300-mas);
    var g2p=(16800-mas);
    var g3p=(24800-mas);
    if(g1p < 0) g1p = 0;
    if(g2p < 0) g2p = 0;
    if(g3p < 0) g3p = 0;
    //////////////////
    /////////////////出力

    document.getElementById("winp").innerText = tro1;
    document.getElementById("mvpwinp").innerText = mvptro;
    document.getElementById("mvpp").innerText = Math.round(tro1/5);
    document.getElementById("wwinp").innerText = Math.round(tro1*2.0);
    // document.getElementById("wmvpwinp").innerText = Math.round(mvptro*1.5);
    // document.getElementById("wmvpp").innerText = Math.round((tro1/5)*1.5);

    document.getElementById("b1win").innerText = "約"+ b1win+"戦";
    document.getElementById("b2win").innerText = "約"+ b2win+"戦";        
    document.getElementById("b3win").innerText = "約"+ b3win+"戦";

    document.getElementById("btime1").innerText = "約"+ bh1 +"時間"+bm1+"分";
    document.getElementById("btime2").innerText = "約"+ bh2 +"時間"+bm2+"分";
    document.getElementById("btime3").innerText = "約"+ bh3 +"時間"+bm3+"分";

    document.getElementById("s1win").innerText = "約"+ s1win+"戦";
    document.getElementById("s2win").innerText = "約"+ s2win+"戦";        
    document.getElementById("s3win").innerText = "約"+ s3win+"戦";

    document.getElementById("stime1").innerText = "約"+ sh1 +"時間"+sm1+"分";
    document.getElementById("stime2").innerText = "約"+ sh2 +"時間"+sm2+"分";
    document.getElementById("stime3").innerText = "約"+ sh3 +"時間"+sm3+"分";

    document.getElementById("g1win").innerText = "約"+ g1win+"戦";
    document.getElementById("g2win").innerText = "約"+ g2win+"戦";        
    document.getElementById("g3win").innerText = "約"+ g3win+"戦";

    document.getElementById("gtime1").innerText = "約"+ gh1 +"時間"+gm1+"分";
    document.getElementById("gtime2").innerText = "約"+ gh2 +"時間"+gm2+"分";
    document.getElementById("gtime3").innerText = "約"+ gh3 +"時間"+gm3+"分";

    document.getElementById("b1p").innerText = b1p;
    document.getElementById("b2p").innerText = b2p;
    document.getElementById("b3p").innerText = b3p;

    document.getElementById("s1p").innerText = s1p;
    document.getElementById("s2p").innerText = s2p;
    document.getElementById("s3p").innerText = s3p;

    document.getElementById("g1p").innerText = g1p;
    document.getElementById("g2p").innerText = g2p;
    document.getElementById("g3p").innerText = g3p;

    document.getElementById("2p").innerText = 20-power;
    document.getElementById("3p").innerText = 50-power;
    document.getElementById("4p").innerText = 100-power;
    document.getElementById("5p").innerText = 180-power;
    document.getElementById("6p").innerText = 310-power;
    document.getElementById("7p").innerText = 520-power;
    document.getElementById("8p").innerText = 860-power;
    document.getElementById("9p").innerText = 1410-power;
    document.getElementById("10p").innerText = 2300-power;
    document.getElementById("11p").innerText = 3740-power;

    document.getElementById("2c").innerText = 20-coin;
    document.getElementById("3c").innerText = 50-coin;
    document.getElementById("4c").innerText = 130-coin;
    document.getElementById("5c").innerText = 270-coin;
    document.getElementById("6c").innerText = 560-coin;
    document.getElementById("7c").innerText = 1040-coin;
    document.getElementById("8c").innerText = 1840-coin;
    document.getElementById("9c").innerText = 3090-coin;
    document.getElementById("10c").innerText = 4965-coin;
    document.getElementById("11c").innerText = 7765-coin;

    document.getElementById("2cc").innerText = 20-coin+star+gad+gea+hyper;
    document.getElementById("3cc").innerText = 50-coin+star+gad+gea+hyper;
    document.getElementById("4cc").innerText = 130-coin+star+gad+gea+hyper;
    document.getElementById("5cc").innerText = 270-coin+star+gad+gea+hyper;
    document.getElementById("6cc").innerText = 560-coin+star+gad+gea+hyper;
    document.getElementById("7cc").innerText = 1040-coin+star+gad+gea+hyper;
    document.getElementById("8cc").innerText = 1840-coin+star+gad+gea+hyper;
    document.getElementById("9cc").innerText = 3090-coin+star+gad+gea+hyper;
    document.getElementById("10cc").innerText = 4965-coin+star+gad+gea+hyper;
    document.getElementById("11cc").innerText = 7765-coin+star+gad+gea+hyper;

    document.getElementById("all").innerText = star+gad+gea+hyper;
    }