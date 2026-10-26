/**
 * @arquivo js/interface/camadas.js
 * Camada: Interface
 * Página "Mapa" do menu: o que aparece no mapa (oceanos, mares, zonas climáticas, desertos,
 * florestas, cordilheiras) e a época do ano. Os lugares do jogo ficam na página "Lugares no jogo".
 */

import { ouvir } from '../nucleo/eventos.js';
import { $, lsGet, lsSet, setStatus } from '../nucleo/utilitarios.js';
import { trocarMes } from '../visualizacao/carregamento.js';
import { estadoRender } from '../visualizacao/projecao.js';

/* chave na tela → camada (o valor inicial de cada uma está em estadoRender.camadas) */
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
/* estação no hemisfério sul (Brasil) */
const ESTACAO = ['verão','verão','outono','outono','outono','inverno','inverno','inverno','primavera','primavera','primavera','verão'];
const CHAVES = [['cOce','oceanos'],['cMar','mares'],['cZon','zonas'],['cDes','desertos'],['cFlo','florestas'],['cMon','montanhas']];

function mostrar(){
  CHAVES.forEach(function(c){$(c[0]).checked=estadoRender.camadas[c[1]];});
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  CHAVES.forEach(function(c){estadoRender.camadas[c[1]]=lsGet('globo.cam.'+c[1],estadoRender.camadas[c[1]])===true;});
  CHAVES.forEach(function(c){
    $(c[0]).onchange=function(){estadoRender.camadas[c[1]]=this.checked;lsSet('globo.cam.'+c[1],this.checked);};
  });
  /* época do ano: a neve do globo muda com o mês (no Brasil, as estações ao contrário do norte);
     lista com bolinha, como as outras escolhas do menu */
  var box=$('cMes'),hoje=new Date().getMonth();
  var opcoes=[['','Agora ('+MESES[hoje]+')']].concat(MESES.map(function(m,k){return [String(k),m+' · '+ESTACAO[k]];}));
  opcoes.forEach(function(o){var b=document.createElement('button');b.dataset.v=o[0];b.textContent=o[1];box.appendChild(b);});
  var salvo=lsGet('globo.mes',null);estadoRender.mesMapa=(salvo===null||salvo==='')?null:+salvo;
  function marca(){
    var v=estadoRender.mesMapa==null?'':String(estadoRender.mesMapa);
    Array.prototype.forEach.call(box.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',b.dataset.v===v?'true':'false');});
    $('cMesV').textContent=opcoes.filter(function(o){return o[0]===v;})[0][1];
  }
  Array.prototype.forEach.call(box.querySelectorAll('button'),function(b){
    b.onclick=function(){
      estadoRender.mesMapa=b.dataset.v===''?null:+b.dataset.v;lsSet('globo.mes',estadoRender.mesMapa);
      marca();
      if(estadoRender.atlas)setStatus('A neve aparece na foto de satélite (Mapa › Foto de satélite).',3000);
      trocarMes();
    };
  });
  marca();
  ouvir('categorias-mudaram',mostrar);
  mostrar();
}

export { iniciar };
