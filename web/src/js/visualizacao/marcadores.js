/**
 * @arquivo js/visualizacao/marcadores.js
 * Camada: Visualização
 * Formas dos marcadores por região (acessibilidade para daltonismo).
 */

import { ctx } from './globo.js';

/* ---------- formas dos marcadores (ajuda quem confunde cores) ---------- */
const SHAPES = ['c','d','s','t','c','s','d'];
function shapePath(x,y,r,sh){
  if(sh==='d'){ctx.moveTo(x,y-r*1.25);ctx.lineTo(x+r*1.25,y);ctx.lineTo(x,y+r*1.25);ctx.lineTo(x-r*1.25,y);ctx.closePath();}
  else if(sh==='s'){ctx.rect(x-r*.95,y-r*.95,r*1.9,r*1.9);}
  else if(sh==='t'){ctx.moveTo(x,y-r*1.25);ctx.lineTo(x+r*1.2,y+r*.9);ctx.lineTo(x-r*1.2,y+r*.9);ctx.closePath();}
  else{ctx.arc(x,y,r,0,7);}
}

export { shapePath, SHAPES };
