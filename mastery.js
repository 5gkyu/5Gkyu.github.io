function calculate(){

       var tro1=parseFloat(document.getElementById("tro").value);
       var mas=parseFloat(document.getElementById("masp").value);
       var win=parseFloat(document.getElementById("win").value);
       var mvp=parseFloat(document.getElementById("mvp").value);
       var time=parseFloat(document.getElementById("time").value);
       var mtime=parseFloat(document.getElementById("mtime").value); 
       var dayr=parseFloat(document.getElementById("dayr").value);
       var fy=parseFloat(document.getElementById("fy").value);
       var fm=parseFloat(document.getElementById("fm").value);
       var fd=parseFloat(document.getElementById("fd").value);

       var mvptro=(tro1+(tro1/5)).toFixed(0);
       var tro=tro1+(tro1/5*mvp);
       var check=document.getElementById("doubleTro").checked;
       if(check){tro=tro*1.5}
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
       var ndate=new Date();
       // var ny=ndate.getFullYear();
       // var nm=ndate.getMonth() +1;
       // var nd=ndate.getDate();

       var fdate=new Date(fy, fm-1, fd);

       var td=fdate.getTime()-ndate.getTime();
       var dd=td/(1000*60*60*24);

       var nokorid=Math.round(dd);
       if(nokorid < 0) nokorid =0;

       var nokorip=((dayr-mas))

       var dp=Math.ceil(nokorip/nokorid);
       var dw=Math.round((dp/tro*win));
       var dt=dw*time+dw*mtime;
       if(dp < 0)dp  = 0;
       if(dw < 0)dw  = 0;
       if(dt < 0)dt  = 0;
       var dh=Math.floor(dt/3600);

       var dm=Math.floor(dt%3600/60);
       /////////////////出力

       document.getElementById("winp").innerText = tro1;
       document.getElementById("mvpwinp").innerText = mvptro;
       document.getElementById("mvpp").innerText = Math.round(tro1/5);
       document.getElementById("wwinp").innerText = Math.round(tro1*1.5);
       document.getElementById("wmvpwinp").innerText = Math.round(mvptro*1.5);
       document.getElementById("wmvpp").innerText = Math.round((tro1/5)*1.5);

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

       document.getElementById("nokorid").innerText ="あと"+nokorid+"日";
       document.getElementById("nokorip").innerText = nokorip;
       document.getElementById("dp").innerText = dp;
       document.getElementById("dw").innerText = "約"+dw+"戦";
       document.getElementById("dtime").innerText = "約"+dh+"時間"+dm+"分";


       }
