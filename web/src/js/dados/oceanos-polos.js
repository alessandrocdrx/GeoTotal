/**
 * @arquivo js/dados/oceanos-polos.js
 * Camada: Dados
 * Rótulos de oceanos e polos.
 */

/* ---------- Oceanos e polos ---------- */
let OC;

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  OC = [
   ['OCEANO','ATLÂNTICO',28,-42],['OCEANO','ATLÂNTICO',-22,-10],
   ['OCEANO','PACÍFICO',5,-140],['OCEANO','PACÍFICO',-30,-125],['OCEANO','PACÍFICO',15,175],
   ['OCEANO','ÍNDICO',-15,78],
   ['OCEANO GLACIAL','ÁRTICO',74,-150],
   ['OCEANO','AUSTRAL',-63,20],['OCEANO','AUSTRAL',-63,140],['OCEANO','AUSTRAL',-62,-100]
  ].map(function(o){var a=o[2]*Math.PI/180,b=o[3]*Math.PI/180;
    return {l1:o[0],l2:o[1],x:Math.cos(a)*Math.sin(b),y:Math.sin(a),z:Math.cos(a)*Math.cos(b)};});
}

export { iniciar, OC };
