/**
 * @arquivo js/visualizacao/atlas.js
 * Camada: Visualização
 * Estilo atlas escolar: cada país com uma cor clara própria, sem vizinho de fronteira com a mesma cor,
 * oceano azul-claro e fronteiras escuras. Ajuda a ver o formato de cada país e quem faz divisa com quem.
 */

import { D } from '../dados/paises.js';
import { NB } from '../dados/vizinhos.js';

/* tons pastel bem diferentes entre si (como nos atlas de papel) */
const PALETA = ['#f6d58e','#b9dea0','#f3b29f','#c5b6e8','#e6c39a','#f2c1d8','#dfe59a'];
const OCEANO = ['#cfe8f8','#a9d2ef','#8cbfe4'];
const BORDA = 'rgba(70,72,90,.75)';
const SEM_PAIS = '#ece6d6';
let cores = null;

/* coloração gulosa: os países com mais vizinhos escolhem primeiro; cada um pega a primeira cor que
   nenhum vizinho usa, começando de um ponto que muda com a região (assim os continentes variam) */
function colorir(){
  cores=new Array(D.length);
  var ordem=D.map(function(d){return d.i;}).sort(function(a,b){return (NB[b]||[]).length-(NB[a]||[]).length;});
  ordem.forEach(function(i){
    var usadas={};(NB[i]||[]).forEach(function(j){if(cores[j]!=null)usadas[cores[j]]=1;});
    for(var k=0;k<PALETA.length;k++){var c=(k+D[i].r*2+i)%PALETA.length;if(!usadas[c]){cores[i]=c;return;}}
    cores[i]=i%PALETA.length;
  });
}
/** Índice da cor do país i na PALETA. */
function corAtlas(i){if(!cores)colorir();return cores[i];}

export { BORDA, corAtlas, OCEANO, PALETA, SEM_PAIS };
