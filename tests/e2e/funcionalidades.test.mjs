// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Percorre todas as funcionalidades do app (como uma pessoa faria, tocando nos botões) e falha
// se qualquer passo gerar erro de JavaScript. Protege as áreas menos usadas contra quebras.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, abrirApp } from './apoio.mjs';

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente?.encerrar(); });

/** Executa os passos em ordem; cada passo é [nome, função na página]. Devolve erros por passo. */
async function percorrer(pagina, erros, passos) {
  const falhas = [];
  for (const [nome, fn, arg] of passos) {
    const antes = erros.length;
    try {
      await pagina.evaluate(fn, arg);
      await pagina.waitForTimeout(250);
    } catch (e) {
      falhas.push(`${nome}: ${e.message.split('\n')[0]}`);
      continue;
    }
    if (erros.length > antes) falhas.push(`${nome}: ${erros.slice(antes).join(' | ')}`);
  }
  return falhas;
}

// As funções rodam dentro da página: não enxergam variáveis daqui, só o argumento recebido.
const CLICAR = (id) => {
  const el = document.getElementById(id) || document.querySelector(id);
  if (!el) throw new Error('não achei ' + id);
  el.click();
};
const RESPONDER = (certo) => {
  const g = window.__geoTotal;
  g.quiz.answered = false;
  g.finishQ(certo);
  g.nextQ();
};
const menu = (pagina) => [`abrir página ${pagina} do menu`, (p) => {
  document.getElementById('mbtn').click();
  document.querySelector(`[data-p="${p}"]`).click();
}, pagina];

/** Abre ⚙️ Ajustes da partida e toca na alternativa n da linha com esse título. */
const ajuste = (titulo, n) => [`ajuste ${titulo} → ${n}`, ([t, i]) => {
  document.getElementById('qajustb').click();
  const linha = [...document.querySelectorAll('#ajbody .ajrow')].find((r) => r.querySelector('b').textContent === t);
  if (!linha) throw new Error('sem a linha ' + t);
  linha.querySelectorAll('.aseg button')[i].click();
}, [titulo, n]];

test('treino: todos os tipos de pergunta, respostas, dica, digitação e opções', async () => {
  const { pagina, erros, fechar } = await abrirApp(ambiente);
  const passos = [];
  for (const modo of ['cap', 'pais', 'flag', 'neighbor', 'code', 'map']) {
    passos.push([`modo ${modo}`, (m) => window.__geoTotal.quizSetMode(m), modo]);
    passos.push([`responder certo (${modo})`, RESPONDER, true]);
    passos.push([`responder errado (${modo})`, RESPONDER, false]);
    passos.push([`dica (${modo})`, () => { const b = document.querySelector('.qhintbtn'); if (b) b.click(); }]);
    passos.push([`tocar numa opção (${modo})`, () => { const b = document.querySelector('#qbody .qopts button'); if (b) b.click(); }]);
    passos.push([`próxima (${modo})`, CLICAR, 'qnext']);
  }
  passos.push(
    ['modo País → Capital', () => window.__geoTotal.quizSetMode('cap')],
    ajuste('Responder', 1),
    ['digitar resposta', () => {
      const i = document.querySelector('#qbody input');
      if (!i) throw new Error('sem campo de digitação');
      i.value = 'brasilia';
      i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      const ok = document.querySelector('#qbody .qrow button'); if (ok) ok.click();
    }],
    ajuste('Responder', 0),
    ['abrir lista de jogos', CLICAR, 'qmodeb'],
    ['escolher Capital → País pela lista', () => document.querySelectorAll('#qmodes button')[1].click()],
    ajuste('Perguntas', 1),
    ajuste('Perguntas', 2),
    ajuste('Perguntas', 0),
    ajuste('Ordem', 1),
    ajuste('Ordem', 0),
    ajuste('Tamanho da rodada', 2),
    ajuste('Cronômetro', 1),
    ajuste('Sobrevivência', 1),
    ajuste('Sobrevivência', 0),
    ajuste('Meta do dia', 2),
    ['fechar ajustes', CLICAR, 'ajok'],
    ['abrir escopo', CLICAR, 'qscopeb'],
    ['escolher uma região no escopo', () => document.querySelectorAll('#scopelist .sitem')[3].click()],
    ['abrir escopo de novo', CLICAR, 'qscopeb'],
    ['buscar no escopo', () => { const q = document.getElementById('scopeq'); q.value = 'bra'; q.dispatchEvent(new Event('input')); }],
    ['fechar escopo combinado', () => { const s = document.getElementById('scopesheet'); if (s.style.display === 'block') document.getElementById('scopeclose').click(); }],
    ['estados do Brasil no treino', () => window.__geoTotal.applyScopeChange({ t: 'br' })],
    ['pergunta de estado', RESPONDER, true],
    ['fechar escopo', () => { const s = document.getElementById('scopesheet'); if (s.style.display === 'block') document.getElementById('scopeclose').click(); }],
    ['voltar ao mundo', () => window.__geoTotal.applyScopeChange({ t: 'world' })],
    ['meta diária abre os ajustes', CLICAR, 'goalgo'],
    ['fechar ajustes pelo ✕', CLICAR, 'ajclose'],
    ['abrir jogos e voltar do Android', () => { document.getElementById('qmodeb').click(); if (!window.__androidBack()) throw new Error('Voltar não fechou a lista de jogos'); if (document.getElementById('jogosheet').style.display === 'block') throw new Error('lista de jogos continuou aberta'); }],
    ['abrir ajustes e voltar do Android', () => { document.getElementById('qajustb').click(); if (!window.__androidBack()) throw new Error('Voltar não fechou os ajustes'); if (document.getElementById('ajsheet').style.display === 'block') throw new Error('ajustes continuaram abertos'); }],
    ['jogo rápido Misto', () => { document.getElementById('qmodeb').click(); document.getElementById('jr-misto').click(); }],
    ['jogo rápido Relâmpago', () => { document.getElementById('qmodeb').click(); document.getElementById('jr-relampago').click(); }],
    ['desafio do dia', () => { document.getElementById('qmodeb').click(); document.getElementById('jr-desafio').click(); }],
  );
  const falhas = await percorrer(pagina, erros, passos);
  assert.deepEqual(falhas, []);
  await fechar();
});

test('modo Livre: cartão, filtros, busca, globo, 2D, Brasil e ferramentas', async () => {
  const { pagina, erros, fechar } = await abrirApp(ambiente);
  const passos = [
    ['ir para Livre', CLICAR, 'qclose'],
    ['buscar país', () => { const q = document.getElementById('q'); q.value = 'japao'; q.dispatchEvent(new Event('input')); }],
    ['abrir resultado', () => document.querySelector('#results button').click()],
    ['ver mais detalhes', CLICAR, 'moreb'],
    ['só vizinhos', CLICAR, 'nbtn'],
    ['próximo país', CLICAR, 'next'],
    ['país anterior', CLICAR, 'prev'],
    ['fechar cartão', CLICAR, 'close'],
    ['filtros: abrir painel', CLICAR, 'fbtn'],
    ['filtros: desligar todos', CLICAR, 'alloff'],
    ['filtros: ligar todos', CLICAR, 'allon'],
    ['filtros: só país e vizinhos', CLICAR, 'nbsolo'],
    ['filtros: somar vizinhos', CLICAR, 'nbadd'],
    ['filtros: fechar', CLICAR, 'sclose'],
    ['desfazer', CLICAR, 'ubtn'],
    ['chip de continente', () => document.querySelectorAll('#chips button')[4].click()],
    ['chip Todas', () => document.querySelectorAll('#chips button')[0].click()],
    ['zoom +', CLICAR, 'zin'],
    ['zoom −', CLICAR, 'zout'],
    ['girar', CLICAR, 'spin'],
    ['passeio', CLICAR, 'tour'],
    ['parar passeio', CLICAR, 'tour'],
    ['mapa 2D', CLICAR, 'flat2d'],
    ['tocar no mapa 2D', () => { const r = document.getElementById('g').getBoundingClientRect(); window.__geoTotal.tap2D(r.left + r.width / 2, r.top + r.height / 2); }],
    ['voltar ao globo', CLICAR, 'flat2d'],
    ['tocar no globo', () => { const r = document.getElementById('g').getBoundingClientRect(); window.__geoTotal.tap(r.left + r.width / 2, r.top + r.height / 2); }],
    ['nomes no mapa (capitais)', () => { document.getElementById('mbtn').click(); document.querySelector('#mlabels [data-v="c"]').click(); }],
    ['nomes no mapa (países)', () => document.querySelector('#mlabels [data-v="p"]').click()],
    ['menu: incluir lugares especiais', () => ['oDisputed', 'oDep', 'oUni'].forEach((id) => document.getElementById(id).click())],
    ['menu: lista dos lugares especiais', () => { const d = document.getElementById('catlista'); d.open = true; d.dispatchEvent(new Event('toggle')); }],
    ['menu: efeitos e música', () => ['msfx', 'mmusic', 'msfx', 'mmusic'].forEach((id) => document.getElementById(id).click())],
    ['menu: fronteiras e cores', () => ['oBor', 'oFill', 'oBor', 'oFill'].forEach((id) => { const c = document.getElementById(id); if (!c.disabled) c.click(); })],
    menu('mp-cmp'),
    ['comparar países', () => { const a = document.getElementById('cmpA'), b = document.getElementById('cmpB'); a.selectedIndex = 1; b.selectedIndex = 5; b.dispatchEvent(new Event('change')); if (!document.querySelector('#cmpres .duelplacar')) throw new Error('sem placar do duelo'); }],
    ['comparar: sortear e trocar', () => { document.getElementById('cmpSort').click(); document.getElementById('cmpTroca').click(); }],
    ['voltar no menu', CLICAR, 'mback'],
    ['distância entre capitais', () => { document.querySelector('[data-p="mp-dist"]').click(); const a = document.getElementById('dA'), b = document.getElementById('dB'); a.selectedIndex = 1; b.selectedIndex = 9; document.getElementById('dgo').click(); }],
    ['limpar distância', CLICAR, 'dclear'],
    ['tema', () => { document.getElementById('mback').click(); ['dark', 'light', 'auto'].forEach((v) => document.querySelector(`#mtema [data-v="${v}"]`).click()); }],
    ['fechar menu', CLICAR, 'mclose'],
    menu('mp-br'),
    ['ver estados do Brasil', CLICAR, 'stAll'],
    ['estados com divisas', () => { if (!window.__geoTotal.estadoBrasil.STFEAT.filter(Boolean).length) throw new Error('estados sem divisas'); }],
    ['tocar num estado', () => { const r = document.getElementById('g').getBoundingClientRect(); window.__geoTotal.tap(r.left + r.width / 2, r.top + r.height / 2); }],
    ['sair dos estados', () => { const b = document.getElementById('stexit'); if (b && b.getClientRects().length) b.click(); }],
    ['folha de estudo', () => { document.getElementById('mbtn').click(); document.getElementById('expStudy').click(); }],
    ['fechar folha', () => { const b = document.getElementById('studyclose'); if (b) b.click(); }],
    ['conquistas', () => { document.getElementById('mbtn').click(); document.getElementById('mbadges').click(); }],
    ['fechar conquistas', CLICAR, 'badgesclose'],
    ['histórico', () => { document.getElementById('mbtn').click(); document.getElementById('mhist').click(); }],
    ['histórico por região', CLICAR, 'htabR'],
    ['histórico por país', CLICAR, 'htabC'],
    ['fechar histórico', CLICAR, 'statsclose'],
    ['voltar (botão do Android)', () => window.__androidBack && window.__androidBack()],
  ];
  const falhas = await percorrer(pagina, erros, passos);
  assert.deepEqual(falhas, []);
  await fechar();
});
