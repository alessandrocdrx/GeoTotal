/**
 * @arquivo js/treino/dica.js
 * Camada: Treino
 * Dicas por tipo de pergunta.
 */

import { short } from '../dados/vizinhos.js';
import { fitScopeView, poolIdx, qcapD, QD, regNameOf } from './dominio.js';
import { estadoTreino, quiz } from './estado.js';

/* ---------- dica ---------- */
function hintText(d){
  var reg=regNameOf(d);
  if(quiz.mode==='cap'){var l=(qcapD(d).replace(/[^\p{L}]/gu,'')[0]||'?').toUpperCase();return 'Fica em: '+reg+'. A capital começa com "'+l+'".';}
  if(quiz.mode==='code')return 'Fica em: '+reg+'.';
  var l2=(short(d).replace(/[^\p{L}]/gu,'')[0]||'?').toUpperCase();
  return 'Fica em: '+reg+'. O nome começa com "'+l2+'".';
}
function addHintBtn(container,d,isMap){
  var b=document.createElement('button');b.className='qcenter qhintbtn';
  b.textContent=isMap?'💡 Dica (revela a região)':'💡 Dica';
  b.onclick=function(){
    if(quiz.hinted||quiz.answered)return;
    quiz.hinted=true;
    var reg=regNameOf(d);
    if(isMap){
      b.textContent='💡 '+reg;
      var idxs=poolIdx().filter(function(k){return QD()[k].r===d.r&&(estadoTreino.quizDomain==='world'?QD()[k].sub===d.sub:true);});
      if(idxs.length)fitScopeView(idxs);
    }else if(quiz.type==='choice'||quiz.mode==='neighbor'){
      /* múltipla escolha: a primeira letra entregaria a resposta; a dica tira 2 opções erradas */
      var certo=quiz.mode==='neighbor'?quiz.nbAnswer:quiz.cur,erradas=[];
      Array.prototype.forEach.call(document.querySelectorAll('#qbody .qopts button'),function(o){if(o.dataset.k!==String(certo))erradas.push(o);});
      for(var k=erradas.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=erradas[k];erradas[k]=erradas[j];erradas[j]=t;}
      erradas.slice(0,2).forEach(function(o){o.disabled=true;o.classList.add('elim');});
      b.textContent='💡 Tirei 2 erradas'+(quiz.mode==='code'||quiz.mode==='neighbor'?'':' · fica em: '+reg);
    }else{
      b.textContent='💡 '+hintText(d);
    }
    b.disabled=true;
  };
  container.appendChild(b);
}

export { addHintBtn };
