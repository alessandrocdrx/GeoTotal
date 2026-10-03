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
