// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Correções da 1.40 em celulares difíceis: (1) sem WebGL (o WebView de alguns celulares não cria o contexto 3D): o globo
// não aparece, então o app abre sozinho o mapa plano e avisa o motivo; (2) página aberta antes de o
// WebView ter tamanho (tela 0×0 por um instante): o mapa tem de aparecer quando a tela crescer;
// (3) fonte larga com o 🔥 da sequência no cabeçalho: nada pode passar da tela e os atalhos
// 🔊 ☀️ 🛰️ 🏷️ continuam no topo.
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

test('tela 0×0 na abertura (WebView ainda sem tamanho): o mapa aparece quando a tela cresce', async () => {
  const ctx = await ambiente.navegador.newContext({ viewport: { width: 1, height: 1 }, isMobile: true, hasTouch: true });
  const pagina = await ctx.newPage();
  const erros = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  await pagina.addInitScript(() => { try { localStorage.setItem('globo.bv.v1', 'true'); localStorage.setItem('globo.legenda.vista', 'true'); } catch {} });
  await pagina.goto(ambiente.url);
  await pagina.waitForTimeout(2500);
  await pagina.setViewportSize({ width: 360, height: 720 });
  await pagina.waitForFunction(() => window.__geoTotal && window.__geoTotal.estadoRender.feats, null, { timeout: 25000 });
  await pagina.waitForTimeout(1500);
  const r = await pagina.evaluate(() => ({ cy: window.__geoTotal.estadoCamera.cyFrac, w: document.getElementById('g').width }));
  // o mapa continua sendo redesenhado: girar a câmera muda o desenho
  const quadro = () => pagina.evaluate(() => document.getElementById('g').toDataURL().length);
  const antes = await quadro();
  await pagina.evaluate(() => { window.__geoTotal.estadoCamera.lam += 1; });
  await pagina.waitForTimeout(500);
  const depois = await quadro();
  await ctx.close();
  assert.ok(Number.isFinite(r.cy), `posição do globo é um número (${r.cy})`);
  assert.ok(r.w > 0, 'o mapa ganhou tamanho');
  assert.notEqual(antes, depois, 'o mapa continua sendo desenhado');
  assert.deepEqual(erros, []);
});

test('cabeçalho com 🔥 da sequência cabe na tela, mesmo com fonte larga', async () => {
  const problemas = [];
  for (const largura of [320, 360]) {
    const ctx = await ambiente.navegador.newContext({ viewport: { width: largura, height: 720 }, isMobile: true, hasTouch: true });
    const pagina = await ctx.newPage();
    await pagina.addInitScript(() => { try { localStorage.setItem('globo.bv.v1', 'true'); localStorage.setItem('globo.legenda.vista', 'true'); } catch {} });
    await pagina.goto(ambiente.url);
    await pagina.waitForFunction(() => window.__geoTotal && window.__geoTotal.estadoRender.feats, null, { timeout: 15000 });
    await pagina.addStyleTag({ content: '*{font-family:"DejaVu Sans",Verdana,sans-serif!important}' });
    await pagina.evaluate(() => { const s = document.getElementById('streakpill'); s.style.display = ''; s.textContent = '🔥 12'; });
    await pagina.waitForTimeout(300);
    const r = await pagina.evaluate(() => ({ pagina: document.documentElement.scrollWidth, menu: Math.round(document.getElementById('mbtn').getBoundingClientRect().right) }));
    if (r.pagina > largura) problemas.push(`${largura}px: página com ${r.pagina}px (rolagem lateral)`);
    if (r.menu > largura) problemas.push(`${largura}px: botão ⋯ termina em ${r.menu}px, fora da tela`);
    /* os atalhos rápidos do topo nunca somem */
    const atalhos = await pagina.evaluate((L) => ['msom', 'mvisual', 'mestilotop', 'camb'].filter((id) => {
      const b = document.getElementById(id).getBoundingClientRect();
      return !(b.width > 20 && b.right <= L);
    }), largura);
    if (atalhos.length) problemas.push(`${largura}px: atalhos escondidos ou fora da tela: ${atalhos.join(', ')}`);
    await ctx.close();
  }
  assert.deepEqual(problemas, []);
});
