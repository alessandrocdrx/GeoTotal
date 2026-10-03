// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Testes de ponta a ponta: abrem o app (o mesmo index.html que vai no APK) num Chromium
// sem tela e conferem os fluxos principais. Rodam depois de `npm run build` e de
// `node scripts/prepare-android-web.mjs` (o script `npm run test:e2e` já faz os dois).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  // ambiente sem node_modules (ex.: sessão de desenvolvimento com Playwright global)
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}

const ASSETS = fileURLToPath(new URL('../../android/app/src/main/assets/', import.meta.url));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

let servidor, base, navegador;

before(async () => {
  servidor = createServer(async (req, res) => {
    const caminho = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    if (caminho.includes('..')) { res.writeHead(400).end(); return; }
    try {
      const corpo = await readFile(join(ASSETS, caminho));
      res.writeHead(200, { 'content-type': TIPOS[extname(caminho)] || 'application/octet-stream' }).end(corpo);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  base = `http://127.0.0.1:${servidor.address().port}/www/index.html`;
  navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
});

after(async () => {
  await navegador?.close();
  servidor?.close();
});

/** Abre o app num celular simulado e devolve a página e as listas de erros e de acessos externos. */
async function abrirApp({ esperar = 5000 } = {}) {
  const ctx = await navegador.newContext({ viewport: { width: 360, height: 720 }, isMobile: true, hasTouch: true });
  const pagina = await ctx.newPage();
  const erros = [];
  const externos = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  pagina.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) erros.push('CSP: ' + m.text()); });
  pagina.on('request', (r) => { if (!/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(r.url())) externos.push(r.url()); });
  await pagina.addInitScript(() => { window.AndroidBridge = { saveFile() {}, print() {}, shareImage() {} }; });
  await pagina.goto(base);
  await pagina.waitForTimeout(esperar);
  return { pagina, erros, externos, fechar: () => ctx.close() };
}

test('abre no Treino, sem erros e sem acessar a internet', async () => {
  const { pagina, erros, externos, fechar } = await abrirApp();
  const estado = await pagina.evaluate(() => ({
    treino: quiz.open,
    paises: availCount(),
    fronteiras: !!feats,
    treinoMarcado: document.getElementById('qbtn').getAttribute('aria-pressed'),
  }));
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
  assert.equal(await pagina.evaluate(() => quiz.open), false);
  await pagina.click('#qbtn');
  assert.equal(await pagina.evaluate(() => quiz.open), true);
  assert.deepEqual(erros, []);
  await fechar();
});

test('filtro por continente e Desfazer funcionam no modo Livre (regressão: "hist.push")', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const ligados = () => pagina.evaluate(() => D.filter((d) => on[d.i]).length);
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
    applyScopeChange({ t: 'reg', r: 1 });
    const n = poolIdx().length, ordem = [];
    for (let k = 0; k < n; k++) {
      ordem.push(D[quiz.cur].cc);
      quiz.answered = false; finishQ(true); nextQ();
    }
    const zerou = !runPool().length;
    runRestart();
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
  await pagina.evaluate(() => { setIncludeDep(true); select(D.find((d) => d.cc === 'DO'), true); });
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
    const antes = availCount();
    setIncludeUni(true);
    quizSetMode('cap');
    const naCapital = poolIdx().some((i) => D[i].uni);
    quizSetMode('map');
    const noMapa = poolIdx().filter((i) => D[i].uni).length;
    return { antes, depois: availCount(), naCapital, noMapa };
  });
  assert.equal(r.antes, 203);
  assert.equal(r.depois, 218);
  assert.equal(r.naCapital, false, 'sem perguntas de capital para lugares sem capital');
  assert.equal(r.noMapa, 15);
  assert.deepEqual(erros, []);
  await fechar();
});
