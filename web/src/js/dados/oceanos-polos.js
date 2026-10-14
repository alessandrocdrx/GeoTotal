/**
 * @arquivo js/dados/oceanos-polos.js
 * Camada: Dados
 * Rótulos dos oceanos (os mares, com contorno, estão em regioes-naturais.js).
 */

/* ---------- Oceanos e mares ---------- */
let OC;

function xyz(lat,lng){var a=lat*Math.PI/180,b=lng*Math.PI/180;return {lat:lat,lng:lng,x:Math.cos(a)*Math.sin(b),y:Math.sin(a),z:Math.cos(a)*Math.cos(b)};}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  OC = [
   ['OCEANO','ATLÂNTICO',24,-38],['OCEANO','ATLÂNTICO',-22,-10],
   ['OCEANO','PACÍFICO',5,-140],['OCEANO','PACÍFICO',-30,-125],['OCEANO','PACÍFICO',15,170],
   ['OCEANO','ÍNDICO',-15,78],
   ['OCEANO GLACIAL','ÁRTICO',80,-150],
   ['OCEANO','AUSTRAL',-63,20],['OCEANO','AUSTRAL',-63,140],['OCEANO','AUSTRAL',-62,-100]
  ].map(function(o){var p=xyz(o[2],o[3]);p.l1=o[0];p.l2=o[1];return p;});
}

export { iniciar, OC };
