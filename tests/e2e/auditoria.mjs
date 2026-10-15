// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Auditoria de layout e usabilidade: roda dentro da página (pagina.evaluate) e devolve a lista
// de problemas visíveis na tela atual. Usada por layout.test.mjs em vários tamanhos de celular.

/** Tamanhos de tela testados: celular pequeno, comum, Edge 60 Pro, deitado e tablet. */
export const TELAS = [
  { nome: 'pequeno 320x640', width: 320, height: 640 },
  { nome: 'comum 360x720', width: 360, height: 720 },
  // Motorola Edge 60 Pro do usuário (medido nos prints dele): 450px de largura, tema escuro;
  // 842px de altura no artefato do Claude, 925px no app instalado
  { nome: 'Edge 60 Pro artefato 450x842', width: 450, height: 842, escuro: true },
  { nome: 'Edge 60 Pro app 450x925', width: 450, height: 925, escuro: true },
  { nome: 'deitado 800x360', width: 800, height: 360 },
  { nome: 'tablet 768x1024', width: 768, height: 1024 },
];

/** Menor lado aceito para algo tocável, em px (o Android recomenda 48; abaixo de 32 erra o dedo). */
export const ALVO_MIN = 32;

/** Função que roda na página. Recebe { alvoMin } e devolve [{ tipo, alvo, detalhe }]. */
export function auditarTela({ alvoMin }) {
  const W = innerWidth, H = innerHeight, problemas = [];
  const nome = (el) => {
    const t = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.value || '').replace(/\s+/g, ' ').trim();
    return (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')) + (t ? ' "' + t.slice(0, 30) + '"' : '');
  };
  const add = (tipo, el, detalhe) => problemas.push({ tipo, alvo: nome(el), detalhe });
  const visivel = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
      if (e.tagName === 'DETAILS' && !e.open && e !== el.closest('summary')?.parentElement) return false;
    }
    return true;
  };
  const rolavel = (el) => {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (/(auto|scroll)/.test(s.overflowY + s.overflowX) && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1)) return e;
    }
    return null;
  };

  // 1) nada pode empurrar a página para o lado
  if (document.documentElement.scrollWidth > W + 1) problemas.push({ tipo: 'rolagem lateral', alvo: 'página', detalhe: document.documentElement.scrollWidth + 'px > ' + W + 'px' });

  // parte do elemento que aparece de fato (descontando painéis com rolagem ou corte)
  const areaVisivel = (el) => {
    const r = el.getBoundingClientRect();
    let a = { l: r.left, t: r.top, r: r.right, b: r.bottom }, recorte = null;
    for (let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
      const p = e.getBoundingClientRect();
      a = { l: Math.max(a.l, p.left), t: Math.max(a.t, p.top), r: Math.min(a.r, p.right), b: Math.min(a.b, p.bottom) };
      if (!/(auto|scroll)/.test(s.overflowX + s.overflowY)) recorte = recorte || e;
    }
    return { a, recorte, vazio: a.r - a.l < 1 || a.b - a.t < 1 };
  };

  // tela por cima (folha/menu que cobre quase tudo): só ela conta, o que está atrás fica bloqueado de propósito
  let camada = document.body;
  for (const [x, y] of [[W / 2, H / 2], [W / 2, H - 4], [W / 2, 4]]) {
    for (let e = document.elementFromPoint(x, y); e && e !== document.body; e = e.parentElement) {
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      if (s.position === 'fixed' && r.width * r.height >= W * H * 0.9) { camada = e; break; }
    }
    if (camada !== document.body) break;
  }

  const tocaveis = [...camada.querySelectorAll('button, a[href], input:not([type=hidden]), select, summary, [role=button], label.tg')].filter(visivel);
  for (const el of tocaveis) {
    const r = el.getBoundingClientRect();
    // 2) fora da tela (sem um painel rolável que permita chegar até ele)
    const fora = r.right > W + 1 || r.left < -1 || r.bottom > H + 1 || r.top < -1;
    if (fora && !rolavel(el)) add('fora da tela', el, `x ${Math.round(r.left)}–${Math.round(r.right)}, y ${Math.round(r.top)}–${Math.round(r.bottom)}`);
    // 3) alvo pequeno demais para o dedo (input de texto e checkbox dentro de rótulo contam pelo rótulo)
    // caixinha de marcar: 24px (mínimo do WCAG 2.2); o resto: alvoMin
    const min = el.type === 'checkbox' || el.type === 'radio' ? 24 : alvoMin;
    const peq = Math.min(r.width, r.height) < min;
    const dentroDeRotulo = el.closest('label') && el.tagName === 'INPUT';
    if (peq && !dentroDeRotulo) add('alvo pequeno', el, Math.round(r.width) + 'x' + Math.round(r.height));
    // 4) coberto por outra coisa (o toque no meio da parte visível cai em outro elemento);
    //    o que está escondido dentro de um painel rolável conta como alcançável (é só rolar)
    const v = areaVisivel(el);
    if (v.vazio && v.recorte && !rolavel(el)) add('escondido', el, 'cortado por ' + nome(v.recorte));
    if (!fora && !v.vazio) {
      const x = Math.min(W - 1, Math.max(0, (v.a.l + v.a.r) / 2)), y = Math.min(H - 1, Math.max(0, (v.a.t + v.a.b) / 2));
      const hit = document.elementFromPoint(x, y);
      const lbl = el.closest('label');
      // rodapé/cabeçalho grudado (sticky) por cima de algo que dá para alcançar rolando é normal
      const grudado = (h) => { for (let e = h; e && e !== document.body; e = e.parentElement) if (getComputedStyle(e).position === 'sticky') return true; return false; };
      if (hit && !(grudado(hit) && rolavel(el)) && !(el === hit || el.contains(hit) || hit.contains(el) || (lbl && lbl.contains(hit)) || (el.labels && [...el.labels].some((l) => l.contains(hit))))) add('coberto', el, 'por ' + nome(hit) + (hit.parentElement?.closest('[id]') ? ' em #' + hit.parentElement.closest('[id]').id : ''));
    }
    // 5b) rótulo curto quebrado em duas linhas (ex.: "←" numa linha e "Anterior" na outra)
    //     (respostas do treino e nomes da folha de estudo podem ocupar duas linhas de propósito)
    if (el.tagName === 'BUTTON' && !el.closest('.qopts,#study') && !el.querySelector('br,small,div,p') && el.textContent.trim().length <= 24) {
      const linhas = new Set();
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) if (q.width > 2) linhas.add(Math.round((q.top + q.bottom) / 16));
      }
      if (linhas.size > 1) add('rótulo quebrado', el, linhas.size + ' linhas');
    }
    // 5) sem nome para leitor de tela
    if (/^(BUTTON|A|SELECT)$/.test(el.tagName) && !(el.getAttribute('aria-label') || el.textContent.trim() || el.title)) add('sem nome', el, '');
  }

  // 6) texto cortado: caixa com texto que não cabe e sem reticências
  for (const el of camada.querySelectorAll('*')) {
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    if (!visivel(el)) continue;
    const s = getComputedStyle(el);
    if (s.textOverflow === 'ellipsis' || /(auto|scroll)/.test(s.overflowX)) continue;
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && s.overflowX !== 'visible') add('texto cortado', el, el.scrollWidth + 'px em ' + el.clientWidth + 'px');
    else if (s.overflowX === 'visible' && s.whiteSpace === 'nowrap' && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      const p = el.getBoundingClientRect();
      if (p.right > W + 1) add('texto vaza', el, 'passa da borda da tela');
    }
  }
  // 7) código cru no lugar de bandeira ou nome (ex.: "[XO] Ossétia do Sul")
  const cru = (camada.innerText || '').match(/\[[A-Z]{2}\]/);
  if (cru) problemas.push({ tipo: 'código cru', alvo: cru[0], detalhe: 'texto técnico aparecendo para o jogador' });
  return problemas;
}
