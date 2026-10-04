/**
 * @arquivo js/nucleo/som.js
 * Camada: Núcleo
 * Efeitos sonoros e música ambiente gerados na hora (Web Audio), sem arquivos de áudio.
 */

import { lsGet, lsSet } from './utilitarios.js';

/*
 * Tudo é sintetizado: o app continua pequeno, funciona sem internet e não depende de licença de
 * música. O navegador só libera o áudio depois de um toque, então o contexto é criado no primeiro
 * toque na tela. A música para quando o app sai da tela (visibilitychange).
 */

/** Preferências (efeitos começam ligados, música desligada). */
const estadoSom = { efeitos: true, musica: false };

let ac = null;
let mestre = null;
let busMusica = null;
let timerMusica = 0;
let acorde = 0;

function contexto(){
  if(ac)return ac;
  var C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;
  try{ac=new C();}catch(e){return null;}
  mestre=ac.createGain();mestre.gain.value=0.9;mestre.connect(ac.destination);
  return ac;
}

/** Uma nota curta: tipo de onda, frequência, início (s a partir de agora), duração, volume. */
function nota(tipo,f,t0,dur,vol,destino){
  var c=contexto();if(!c)return;
  var t=c.currentTime+t0,o=c.createOscillator(),g=c.createGain();
  o.type=tipo;o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(vol,t+Math.min(0.02,dur/3));
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(destino||mestre);
  o.start(t);o.stop(t+dur+0.05);
}
function hz(semitonsDeLa4){return 440*Math.pow(2,semitonsDeLa4/12);}

const EFEITOS = {
  /** acerto: duas notas subindo */
  acerto: function(){nota('triangle',hz(7),0,0.12,0.18);nota('triangle',hz(12),0.08,0.22,0.2);},
  /** erro: duas notas graves descendo, sem agressividade */
  erro: function(){nota('sine',hz(-9),0,0.18,0.22);nota('sine',hz(-13),0.12,0.3,0.2);},
  /** toque num país */
  toque: function(){nota('sine',hz(19),0,0.06,0.06);},
  /** subiu de nível */
  nivel: function(){[3,7,10,15].forEach(function(s,i){nota('triangle',hz(s),i*0.09,0.3,0.16);});},
  /** meta do dia */
  meta: function(){[0,4,7,12].forEach(function(s,i){nota('triangle',hz(s),i*0.1,0.35,0.16);});nota('sine',hz(24),0.4,0.6,0.05);},
  /** conquista ou medalha */
  conquista: function(){[0,4,7,12,16].forEach(function(s,i){nota('triangle',hz(s),i*0.08,0.4,0.15);});[19,24].forEach(function(s,i){nota('sine',hz(s),0.45+i*0.12,0.7,0.05);});},
};

function tocar(nome){
  if(!estadoSom.efeitos||!EFEITOS[nome])return;
  var c=contexto();if(!c||c.state!=='running')return;
  try{EFEITOS[nome]();}catch(e){}
}

/* ---------- música ambiente: notas soltas de uma escala pentatônica sobre acordes lentos ---------- */
const ACORDES = [[-12,-5,0,3],[-16,-9,-4,0],[-9,-2,3,7],[-14,-7,-2,2]];   /* Lá m, Fá, Dó, Sol (semitons de Lá4) */
const ESCALA = [0,3,5,7,10,12,15,17,19];                                   /* Lá menor pentatônica */

function montarMusica(){
  var c=contexto();if(!c||busMusica)return;
  busMusica=c.createGain();busMusica.gain.value=0.0001;
  var filtro=c.createBiquadFilter();filtro.type='lowpass';filtro.frequency.value=1800;
  var eco=c.createDelay(1.5);eco.delayTime.value=0.55;
  var retorno=c.createGain();retorno.gain.value=0.35;
  busMusica.connect(filtro);filtro.connect(mestre);
  filtro.connect(eco);eco.connect(retorno);retorno.connect(eco);retorno.connect(mestre);
}
function passoMusica(){
  if(!estadoSom.musica||!ac||ac.state!=='running')return;
  /* a cada 4 passos troca o acorde de fundo (pad longo e baixo) */
  if(passoMusica.n%4===0){
    var ac0=ACORDES[acorde%ACORDES.length];acorde++;
    ac0.forEach(function(s){nota('sine',hz(s),0,9,0.035,busMusica);});
  }
  passoMusica.n++;
  /* uma ou duas notas da melodia, em tempos levemente irregulares */
  var s=ESCALA[Math.floor(Math.random()*ESCALA.length)];
  nota('triangle',hz(s),0.1,2.2,0.05,busMusica);
  if(Math.random()<0.35)nota('sine',hz(ESCALA[Math.floor(Math.random()*ESCALA.length)]+12),0.9,1.6,0.025,busMusica);
  timerMusica=setTimeout(passoMusica,2200+Math.random()*900);
}
passoMusica.n=0;

function iniciarMusica(){
  var c=contexto();if(!c||c.state!=='running')return;
  montarMusica();
  busMusica.gain.cancelScheduledValues(c.currentTime);
  busMusica.gain.setTargetAtTime(1,c.currentTime,1.5);
  clearTimeout(timerMusica);passoMusica();
}
function pararMusica(){
  clearTimeout(timerMusica);
  if(ac&&busMusica){busMusica.gain.cancelScheduledValues(ac.currentTime);busMusica.gain.setTargetAtTime(0.0001,ac.currentTime,0.4);}
}

function alternarEfeitos(){estadoSom.efeitos=!estadoSom.efeitos;lsSet('globo.som.efeitos',estadoSom.efeitos);if(estadoSom.efeitos)tocar('toque');return estadoSom.efeitos;}
function alternarMusica(){
  estadoSom.musica=!estadoSom.musica;lsSet('globo.som.musica',estadoSom.musica);
  if(estadoSom.musica){var c=contexto();if(c&&c.state!=='running')c.resume().then(iniciarMusica);else iniciarMusica();}
  else pararMusica();
  return estadoSom.musica;
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  estadoSom.efeitos = lsGet('globo.som.efeitos',true);
  estadoSom.musica = lsGet('globo.som.musica',false);
  /* o áudio só pode começar depois de um toque */
  function liberar(){
    var c=contexto();if(!c)return;
    var p=c.state==='running'?Promise.resolve():c.resume();
    p.then(function(){if(estadoSom.musica&&!timerMusica)iniciarMusica();});
  }
  document.addEventListener('pointerdown',liberar,{capture:true});
  /* fora da tela, silêncio (e o Android não toca música com o app em segundo plano) */
  document.addEventListener('visibilitychange',function(){
    if(!ac)return;
    if(document.hidden){clearTimeout(timerMusica);timerMusica=0;ac.suspend();}
    else ac.resume().then(function(){if(estadoSom.musica)iniciarMusica();});
  });
}

export { alternarEfeitos, alternarMusica, estadoSom, iniciar, tocar };
