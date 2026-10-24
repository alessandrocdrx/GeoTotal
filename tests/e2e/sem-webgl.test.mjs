// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Aparelho sem WebGL (o WebView de alguns celulares não cria o contexto 3D): o globo não aparece,
// então o app abre sozinho o mapa plano e avisa o motivo, em vez de ficar com a tela vazia.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor } from './apoio.mjs';

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente.encerrar(); });

test('sem WebGL: abre o mapa plano e avisa que o globo 3D não abriu', async () => {
  const ctx = await ambiente.navegador.newContext({ viewport: { width: 360, height: 720 }, isMobile: true, hasTouch: true });
  const pagina = await ctx.newPage();
  const erros = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  await pagina.addInitScript(() => {
    try { localStorage.setItem('globo.bv.v1', 'true'); localStorage.setItem('globo.legenda.vista', 'true'); } catch {}
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (tipo, ...resto) {
      return /webgl/.test(tipo) ? null : original.call(this, tipo, ...resto);
    };
  });
  await pagina.goto(ambiente.url);
  await pagina.waitForFunction(() => window.__geoTotal && window.__geoTotal.estadoRender.feats, null, { timeout: 25000 });
  await pagina.waitForTimeout(3000);
  const r = await pagina.evaluate(() => ({
    plano: window.__geoTotal.estadoCamera.plano2D,
    botao: document.getElementById('flat2d').getAttribute('aria-pressed'),
    aviso: document.getElementById('status').style.display === 'block' ? document.getElementById('status').textContent : '',
  }));
  await ctx.close();
  assert.equal(r.plano, true, 'o mapa plano é o que aparece');
  assert.equal(r.botao, 'true', 'o botão 🗺️ mostra que o mapa plano está ligado');
  assert.match(r.aviso, /não mostra o globo 3D/, 'o aviso aparece na tela');
  assert.deepEqual(erros, []);
});
