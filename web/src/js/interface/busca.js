/**
 * @arquivo js/interface/busca.js
 * Camada: Interface
 * Busca por país ou capital.
 */

import { BRREG, BRS } from '../dados/estados-brasil.js';
import { D, dflag, norm, REG } from '../dados/paises.js';
import { capShort, short } from '../dados/vizinhos.js';
import { select } from './cartao-pais.js';
import { ganchosInterface } from './ganchos.js';
import { tourStop } from './passeio.js';
import { estadoBrasil } from '../visualizacao/estados.js';

/* ---------- Busca ---------- */
let q;
let res;

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  q = document.getElementById('q');
  res = document.getElementById('results');
  q.addEventListener('input',function(){
    var s=norm(q.value.trim());res.innerHTML='';
    if(!s){res.style.display='none';return;}
    var items=[];
    if(!estadoBrasil.statesMode)D.filter(function(d){return d.key.indexOf(s)>-1;}).slice(0,5).forEach(function(d){
      items.push({dot:REG[d.r].c,name:dflag(d)+' '+short(d)+(d.dis?' ⚠':''),sub:capShort(d),fn:function(){select(d,true);}});
    });
    BRS.filter(function(st){return st.key.indexOf(s)>-1;}).slice(0,estadoBrasil.statesMode?7:3).forEach(function(st){
      items.push({dot:BRREG[st.reg].c,name:st.sigla+' — '+st.name,sub:'Estado · '+st.cap,fn:function(){ganchosInterface.abrirEstado(st);}});
    });
    if(!items.length){res.style.display='none';return;}
    items.forEach(function(it){
      var b=document.createElement('button');
      var dot=document.createElement('span');dot.className='dot';dot.style.background=it.dot;
      var t=document.createElement('span');t.textContent=it.name;
      var sm2=document.createElement('small');sm2.textContent=it.sub;
      b.appendChild(dot);b.appendChild(t);b.appendChild(sm2);
      b.onclick=function(){tourStop();res.style.display='none';q.value='';q.blur();it.fn();};
      res.appendChild(b);
    });
    res.style.display='block';
  });
  document.addEventListener('pointerdown',function(e){if(!res.contains(e.target)&&e.target!==q)res.style.display='none';});
}

export { iniciar };
