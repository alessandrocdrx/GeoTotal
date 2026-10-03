/**
 * @arquivo js/app/compat-emoji.js
 * Camada: App
 * Compatibilidade: carrega fonte de emoji onde o sistema não desenha bandeiras.
 */

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  /* Windows (Chrome, Edge, Brave) não desenha bandeiras em emoji: carrega uma fonte que as tem */
  (function(){
    if(window.AndroidBridge)return; /* no app Android não há internet; o sistema já tem as bandeiras */
    try{
      var c=document.createElement('canvas').getContext('2d');c.font='32px sans-serif';
      var w2=c.measureText('\uD83C\uDDE7\uD83C\uDDF7').width,w1=c.measureText('\uD83C\uDDE7').width;
      if(w1>0&&w2<w1*1.5)return;
    }catch(e){}
    var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap';
    l.onload=function(){try{if(document.fonts&&document.fonts.load)document.fonts.load('32px "Noto Color Emoji"','\uD83C\uDDE7\uD83C\uDDF7').catch(function(){});}catch(e){}};
    document.head.appendChild(l);
  })();
}

export { iniciar };
