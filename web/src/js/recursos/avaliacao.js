/**
 * @arquivo js/recursos/avaliacao.js
 * Camada: Recursos
 * Pedido de avaliação na Play Store, depois de um momento bom (zerar uma região, rodada com 2 ou 3
 * estrelas), para quem já jogou em pelo menos 3 dias diferentes; no máximo uma vez a cada 30 dias.
 * No app Android usa o cartão oficial do Google (In-App Review); o Google ainda decide se mostra.
 */

import { ouvir } from '../nucleo/eventos.js';
import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';

const LOJA = 'https://play.google.com/store/apps/details?id=io.github.alessandrocdrx.geototal';
const DIAS_MINIMOS = 3, INTERVALO = 30 * 864e5;

function hoje(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function podePedir(){
  var B=window.AndroidBridge;if(!B||!B.requestReview)return false;
  return lsGet('globo.dias.uso',[]).length>=DIAS_MINIMOS&&Date.now()-lsGet('globo.avaliacao.pedida',0)>INTERVALO;
}
function pedir(){
  try{window.AndroidBridge.requestReview();lsSet('globo.avaliacao.pedida',Date.now());}catch(e){}
}
/* espera a comemoração passar antes de abrir o cartão */
function momentoBom(){if(podePedir())setTimeout(pedir,2500);}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  var dias=lsGet('globo.dias.uso',[]);
  if(dias.indexOf(hoje())<0){dias.push(hoje());lsSet('globo.dias.uso',dias.slice(-30));}
  ouvir('partida-zerada',momentoBom);
  ouvir('rodada-terminou',function(o){var log=o.log||[],ok=log.filter(function(x){return x.ok;}).length;if(log.length>=8&&ok/log.length>=0.7)momentoBom();});
  /* menu ⋯ > Ajuda: avaliar quando quiser (no app, o cartão do Google; fora dele, a página da loja) */
  $('mavaliar').onclick=function(){
    if(window.AndroidBridge&&window.AndroidBridge.requestReview){window.AndroidBridge.requestReview();return;}
    window.open(LOJA,'_blank','noopener');
  };
}

export { iniciar };
