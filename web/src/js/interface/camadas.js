/**
 * @arquivo js/interface/camadas.js
 * Camada: Interface
 * Botão 🏷️ na tela: o que aparece no mapa (oceanos, mares, zonas climáticas, desertos, florestas,
 * cordilheiras) e quais lugares entram no
 * jogo (não reconhecidos, territórios dependentes, desabitados). Os lugares são as mesmas chaves do menu ⋯.
 */

import { ouvir } from '../nucleo/eventos.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';
import { estadoRender } from '../visualizacao/projecao.js';
import { estadoMapa } from '../visualizacao/tela.js';
import { ligarLugar, setIncludeDep, setIncludeDisputed, setIncludeUni } from './filtros.js';

/* chave na tela → camada (o valor inicial de cada uma está em estadoRender.camadas) */
const CHAVES = [['cOce','oceanos'],['cMar','mares'],['cZon','zonas'],['cDes','desertos'],['cFlo','florestas'],['cMon','montanhas']];

function mostrar(){
  CHAVES.forEach(function(c){$(c[0]).checked=estadoRender.camadas[c[1]];});
  $('cDis').checked=estadoMapa.includeDisputed;$('cDep').checked=estadoMapa.includeDep;$('cUni').checked=estadoMapa.includeUni;
}
function abrir(v){$('camadas').hidden=!v;$('camb').setAttribute('aria-expanded',v?'true':'false');if(v)mostrar();}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  CHAVES.forEach(function(c){estadoRender.camadas[c[1]]=lsGet('globo.cam.'+c[1],estadoRender.camadas[c[1]])===true;});
  CHAVES.forEach(function(c){
    $(c[0]).onchange=function(){estadoRender.camadas[c[1]]=this.checked;lsSet('globo.cam.'+c[1],this.checked);};
  });
  ligarLugar($('cDis'),setIncludeDisputed);ligarLugar($('cDep'),setIncludeDep);ligarLugar($('cUni'),setIncludeUni);
  ouvir('categorias-mudaram',mostrar);
  $('camb').onclick=function(){abrir($('camadas').hidden);};
  $('camfechar').onclick=function(){abrir(false);};
  /* toque fora do painel fecha */
  document.addEventListener('pointerdown',function(e){
    if(!$('camadas').hidden&&!$('camadas').contains(e.target)&&e.target!==$('camb'))abrir(false);
  },true);
  mostrar();
}

export { abrir, iniciar };
