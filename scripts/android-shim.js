/*
 * geoTotal — Copyright 2026 alessandrocdrx
 * SPDX-License-Identifier: Apache-2.0
 */
/* Injetado no início do index.html do APK: liga a página às funções nativas do Android
   (window.AndroidBridge, definido em MainActivity.java). */
(function(){
  var B=window.AndroidBridge;
  if(!B)return;

  /* "Exportar CSV" usa claude.use('downloads'); aqui o arquivo é salvo pelo seletor do Android. */
  var seq=0,pend={};
  window.__androidSaveDone=function(id,st){
    var p=pend[id];if(!p)return;delete pend[id];
    if(st==='ok')p.ok();else p.no({code:st});
  };
  var downloads={save:function(o){
    return new Promise(function(ok,no){
      var id='s'+(++seq);pend[id]={ok:ok,no:no};
      try{B.saveFile(id,String(o.filename||'arquivo.txt'),String(o.data==null?'':o.data));}
      catch(e){delete pend[id];no(e);}
    });
  }};
  window.claude={use:function(n){return n==='downloads'?Promise.resolve(downloads):Promise.reject(new Error('indisponível'));}};

  /* "Imprimir" da folha de estudo: abre a impressão do Android (dá para salvar em PDF). */
  window.print=function(){B.print();};

  /* Botão voltar: fecha o que estiver aberto, do painel mais alto para o mais baixo. */
  var CLOSERS=[['txtd','txtclose'],['study','studyclose'],['sharesheet','shareclose'],['statsheet','statsclose'],['badgesheet','badgesclose'],['scopesheet','scopeclose'],
    ['mback','mback'],['msheet','mclose'],['sheet','sclose'],['quiz','qclose'],['card','close'],['stbar','stexit']];
  window.__androidBack=function(){
    for(var i=0;i<CLOSERS.length;i++){
      var el=document.getElementById(CLOSERS[i][0]),b=document.getElementById(CLOSERS[i][1]);
      if(el&&b&&el.getClientRects().length){b.click();return true;}
    }
    return false;
  };
})();
