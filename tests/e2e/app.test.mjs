// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Testes de ponta a ponta: abrem o app (o mesmo index.html que vai no APK) num Chromium
// sem tela e conferem os fluxos principais. O estado interno é lido por window.__geoTotal
// (exposto por web/src/js/main.js). Rodam depois de `npm run build` e de
// `node scripts/prepare-android-web.mjs` (o script `npm run test:e2e` já faz os dois).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, abrirApp as abrir } from './apoio.mjs';

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente?.encerrar(); });
const abrirApp = (opcoes) => abrir(ambiente, opcoes);

test('abre no Treino, sem erros e sem acessar a internet', async () => {
  const { pagina, erros, externos, fechar } = await abrirApp();
  const estado = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    return {
      treino: g.quiz.open,
      paises: g.availCount(),
      fronteiras: !!g.estadoRender.feats,
      treinoMarcado: document.getElementById('qbtn').getAttribute('aria-pressed'),
    };
  });
  assert.equal(estado.treino, true);
  assert.equal(estado.treinoMarcado, 'true');
  assert.equal(estado.paises, 203, 'países disponíveis por padrão');
  assert.ok(estado.fronteiras, 'fronteiras dos países carregadas do próprio app');
  assert.deepEqual(erros, []);
  assert.deepEqual(externos, [], 'o app não deve acessar nada fora do próprio pacote');
  await fechar();
});

test('troca entre Treino e Livre pelo cabeçalho', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), false);
  await pagina.click('#qbtn');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), true);
  assert.deepEqual(erros, []);
  await fechar();
});

test('filtro por continente e Desfazer funcionam no modo Livre (regressão: "hist.push")', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const ligados = () => pagina.evaluate(() => {
    const g = window.__geoTotal;
    return g.D.filter((d) => g.estadoMapa.on[d.i]).length;
  });
  const total = await ligados();
  await pagina.evaluate(() => document.querySelectorAll('#chips button')[2].click());
  const umContinente = await ligados();
  assert.ok(umContinente > 0 && umContinente < total, 'filtrar por continente reduz a lista');
  await pagina.evaluate(() => document.getElementById('ubtn').click());
  assert.equal(await ligados(), total, 'Desfazer volta ao filtro anterior');
  assert.deepEqual(erros, []);
  await fechar();
});

test('menu ⋯ abre as opções do treino', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('[data-p="mp-train"]');
  assert.equal(await pagina.evaluate(() => document.getElementById('mtitle').textContent), 'Opções do treino');
  assert.ok(await pagina.evaluate(() => document.getElementById('qtypes').getClientRects().length > 0));
  assert.deepEqual(erros, []);
  await fechar();
});

test('partida: cada país aparece uma vez por volta e a ordem muda entre partidas', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const jogar = () => pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'reg', r: 1 });
    const n = g.poolIdx().length, ordem = [];
    for (let k = 0; k < n; k++) {
      ordem.push(g.D[g.quiz.cur].cc);
      g.quiz.answered = false; g.finishQ(true); g.nextQ();
    }
    const zerou = !g.runPool().length;
    g.runRestart();
    return { n, ordem, zerou };
  });
  const p1 = await jogar();
  const p2 = await jogar();
  assert.equal(new Set(p1.ordem).size, p1.n, 'nenhum país repetido acertando todos');
  assert.ok(p1.zerou, 'acertar todos zera a região');
  assert.notDeepEqual(p1.ordem, p2.ordem, 'duas partidas seguidas não têm a mesma ordem');
  assert.deepEqual(erros, []);
  await fechar();
});

test('territórios dependentes seguem a rota: República Dominicana → Porto Rico', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.setIncludeDep(true);
    g.select(g.D.find((d) => d.cc === 'DO'), true);
  });
  await pagina.waitForTimeout(500);
  await pagina.click('#next');
  await pagina.waitForTimeout(500);
  assert.equal(await pagina.evaluate(() => document.getElementById('cname').textContent), 'Porto Rico');
  assert.deepEqual(erros, []);
  await fechar();
});

test('desabitados e Antártida: desligados por padrão e só em "Achar no mapa"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const antes = g.availCount();
    g.setIncludeUni(true);
    g.quizSetMode('cap');
    const naCapital = g.poolIdx().some((i) => g.D[i].uni);
    g.quizSetMode('map');
    const noMapa = g.poolIdx().filter((i) => g.D[i].uni).length;
    return { antes, depois: g.availCount(), naCapital, noMapa };
  });
  assert.equal(r.antes, 203);
  assert.equal(r.depois, 218);
  assert.equal(r.naCapital, false, 'sem perguntas de capital para lugares sem capital');
  assert.equal(r.noMapa, 15);
  assert.deepEqual(erros, []);
  await fechar();
});

test('ganchos do globo estão registrados pelas camadas de cima', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const k = g.ganchos;
    const abertoNoTreino = k.treinoAberto();
    document.getElementById('qclose').click();
    return {
      abertoNoTreino,
      abertoNoLivre: k.treinoAberto(),
      arco: k.desenharArco === g.drawArc,
      pulso: k.desenharPulsoEscopo === g.drawScopePulse,
      selo: k.desenharSeloResposta === g.drawBadge,
      ocultar: k.ocultarMarcadores === g.qHide,
      alturaCartao: typeof k.alturaCartao() === 'number',
    };
  });
  assert.deepEqual(r, { abertoNoTreino: true, abertoNoLivre: false, arco: true, pulso: true, selo: true, ocultar: true, alturaCartao: true });
  assert.deepEqual(erros, []);
  await fechar();
});

test('toques e categorias passam pelos ganchos da interface', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const k = g.ganchosInterface;
    g.quizSetMode('cap');
    const ignoraNoTreino = k.toqueAntes(10, 10);
    document.getElementById('qclose').click();
    const livre = k.toqueAntes(10, 10) || k.toqueNoGlobo(10, 10, []) || k.toqueEstados(10, 10);
    const antes = g.availCount();
    document.getElementById('oDep').click();
    return { ignoraNoTreino, livre, cresceu: g.availCount() > antes, marcadaNoTreino: document.getElementById('oDepQ').checked };
  });
  assert.deepEqual(r, { ignoraNoTreino: true, livre: false, cresceu: true, marcadaNoTreino: true });
  assert.deepEqual(erros, []);
  await fechar();
});

test('som: efeitos e música ligam e desligam pelo menu, sem erros', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  const antes = await pagina.evaluate(() => ({ e: document.getElementById('msfxv').textContent, m: document.getElementById('mmusicv').textContent }));
  await pagina.click('#mmusic');
  await pagina.evaluate(() => { const g = window.__geoTotal; ['acerto', 'erro', 'toque', 'nivel', 'meta', 'conquista'].forEach(g.tocar); });
  await pagina.waitForTimeout(3500);
  await pagina.click('#msfx');
  const depois = await pagina.evaluate(() => ({ e: document.getElementById('msfxv').textContent, m: document.getElementById('mmusicv').textContent, musica: window.__geoTotal.estadoSom.musica }));
  assert.deepEqual(antes, { e: 'Ligados', m: 'Desligada' });
  assert.equal(depois.e, 'Desligados');
  assert.equal(depois.musica, true);
  assert.deepEqual(erros, []);
  await fechar();
});

test('primeira vez: boas-vindas levam à América do Sul; alternativas sem lugares disputados', async () => {
  const { pagina, erros, fechar } = await abrirApp({ novato: true });
  assert.equal(await pagina.isVisible('#welcome'), true, 'boas-vindas aparecem na primeira vez');
  await pagina.click('#wgo');
  await pagina.waitForTimeout(500);
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    let disputados = 0;
    for (let k = 0; k < 40; k++) {
      const i = g.D.findIndex((d) => !d.dis && d.r === k % 9);
      if (i >= 0) disputados += g.makeOptions(i).filter((x) => g.D[x].dis).length;
    }
    return { escopo: g.estadoTreino.quizScope, aberto: !document.getElementById('welcome').hidden, disputados };
  });
  assert.deepEqual(r.escopo, { t: 'reg', r: 0 });
  assert.equal(r.aberto, false);
  assert.equal(r.disputados, 0, 'resposta certa comum não tem alternativa disputada');
  assert.deepEqual(erros, []);
  await fechar();
});

test('rodada de 10: termina com estrelas, XP e "Jogar de novo"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    for (let k = 0; k < 10; k++) { g.quiz.answered = false; g.finishQ(true); if (k < 9) g.nextQ(); }
    document.getElementById('qnext').click();
    const fim = document.querySelector('.rodadafim');
    return {
      len: g.quiz.sessionLen,
      fim: !!fim,
      estrelas: fim ? fim.querySelectorAll('.estrelas .on').length : -1,
      combo: document.getElementById('qcomb').textContent,
      jogar: !!document.querySelector('.rfjogar'),
    };
  });
  assert.equal(r.len, 10, 'rodadas de 10 por padrão');
  assert.equal(r.fim, true, 'tela de fim de rodada aparece');
  assert.equal(r.estrelas, 3, '10 de 10 = 3 estrelas');
  assert.equal(r.combo, '🔥 x10');
  assert.equal(r.jogar, true);
  await pagina.click('.rfjogar');
  assert.equal(await pagina.evaluate(() => !!document.querySelector('.rodadafim')), false, '"Jogar de novo" começa outra rodada');
  assert.deepEqual(erros, []);
  await fechar();
});

test('desafio do dia: 10 países iguais para todos, uma vez por dia, com resultado para copiar', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('#mdesafio');
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const fila = g.estadoTreino.desafio.fila.slice();
    const vistos = [];
    for (let k = 0; k < 10; k++) { vistos.push(g.quiz.cur); g.quiz.answered = false; g.finishQ(k % 3 !== 0); if (k < 9) g.nextQ(); }
    document.getElementById('qnext').click();
    return {
      mesmaFila: JSON.stringify(fila) === JSON.stringify(vistos),
      titulo: document.querySelector('.rftit').textContent,
      grade: document.querySelector('.rfgrade').textContent,
      copiar: !!document.querySelector('.rfcopiar'),
      encerrou: g.estadoTreino.desafio === null,
      salvo: JSON.parse(localStorage.getItem('globo.desafio.v1')).certas,
    };
  });
  assert.equal(r.mesmaFila, true, 'as perguntas seguem a fila do dia');
  assert.match(r.titulo, /Desafio do dia #\d+/);
  assert.equal(r.grade, '🟥🟩🟩🟥🟩🟩🟥🟩🟩🟥');
  assert.equal(r.copiar, true);
  assert.equal(r.encerrou, true);
  assert.equal(r.salvo, 6);
  assert.deepEqual(erros, []);
  await fechar();
});

test('conquistas mostram progresso; cartão leva ao treino da região; curiosidade usa dados reais', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('#mbadges');
  const barras = await pagina.evaluate(() => document.querySelectorAll('#badgesbody .bprog').length);
  assert.ok(barras >= 10, 'conquistas bloqueadas têm barra de progresso');
  await pagina.evaluate(() => { document.getElementById('badgesclose').click(); document.getElementById('mclose').click(); document.getElementById('qclose').click(); });
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.select(g.D.find((d) => d.cc === 'JP'), true);
    const b = document.querySelector('#cstat .cstreinar');
    const texto = b && b.textContent;
    b.click();
    const jp = g.D.find((d) => d.cc === 'JP');
    return { texto, aberto: g.quiz.open, escopo: g.estadoTreino.quizScope, regJP: jp.r, curio: g.curiosidade(jp) };
  });
  assert.match(r.texto, /^Treinar /);
  assert.equal(r.aberto, true);
  assert.deepEqual(r.escopo, { t: 'reg', r: r.regJP });
  assert.match(r.curio, /Japão/);
  assert.deepEqual(erros, []);
  await fechar();
});
