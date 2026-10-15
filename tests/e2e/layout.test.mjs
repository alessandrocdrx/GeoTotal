// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Layout e usabilidade: abre cada tela do app em vários tamanhos de celular (e deitado/tablet)
// e confere, com auditoria.mjs, que nada empurra a página para o lado, nada tocável fica fora da
// tela, coberto ou pequeno demais para o dedo, nenhum rótulo curto quebra no meio e todo botão tem
// nome. Rode antes de publicar qualquer versão (npm run test:e2e roda junto).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor } from './apoio.mjs';
import { auditarTela, TELAS, ALVO_MIN } from './auditoria.mjs';

const C = (id) => `document.getElementById('${id}').click();`;
const BUSCA = C('qclose') + "var q=document.getElementById('q');q.value='japao';q.dispatchEvent(new Event('input'));document.querySelector('#results button').click();";

/** Telas do app e como abrir cada uma a partir do início (Treino). */
export const TELAS_APP = [
  ['Treino', ''],
  ['Jogos', C('qmodeb')],
  ['Ajustes', C('qajustb')],
  ['Escopo', C('qscopeb')],
  ['Livre', C('qclose')],
  ['Cartão do país', BUSCA],
  ['Detalhes do país', BUSCA + C('moreb')],
  ['Filtros', C('qclose') + C('fbtn')],
  ['Menu', C('mbtn')],
  ...['mp-visual', 'mp-lugares', 'mp-dados', 'mp-sobre', 'mp-cmp', 'mp-br'].map((p) => ['Menu ' + p, C('mbtn') + `document.querySelector('[data-p=${p}]').click();`]),
  ['Passaporte', C('mbtn') + C('mpassaporte')],
  ['Conquistas', C('mbtn') + C('mbadges')],
  ['Histórico', C('mbtn') + C('mhist')],
  ['Distância', C('mbtn') + C('mdist')],
  ['Folha de estudo', C('mbtn') + C('expStudy')],
  ['Estados do Brasil', C('mbtn') + "document.querySelector('[data-p=mp-br]').click();" + C('stGo')],
  ['Resposta do treino', "document.querySelector('.qopts button').click();"],
  ['Busca de lugar sem bandeira', C('qclose') + "var q=document.getElementById('q');q.value='ossetia';q.dispatchEvent(new Event('input'));"],
  ['Como jogar', C('mbtn') + C('mtour')],
  ['Boas-vindas', "sessionStorage.setItem('bvteste','1');localStorage.removeItem('globo.bv.v1');setTimeout(function(){location.reload();},0);"],
];

/**
 * Exceções conscientes (cada uma com o motivo). O cartão do país é arrastável e fica por cima dos
 * botões do mapa quando cresce numa tela baixa: é só puxá-lo para baixo ou fechá-lo.
 */
const PERMITIDOS = [
  { tipo: 'coberto', alvo: /^#(zin|zout|spin|tour|flat2d) /, detalhe: /#card|alca|#close|#next|#prev|chead/ },
  // a lista de resultados da busca abre por cima dos botões do mapa só enquanto se digita
  { tipo: 'coberto', alvo: /^#(zin|zout|spin|tour|flat2d) /, detalhe: / em #results$/ },
];
const permitido = (p) => PERMITIDOS.some((x) => x.tipo === p.tipo && x.alvo.test(p.alvo) && x.detalhe.test(p.detalhe));

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente?.encerrar(); });

for (const tela of TELAS) {
  test(`layout sem quebras: ${tela.nome}`, async () => {
    const problemas = [];
    for (const [nome, abrir] of TELAS_APP) {
      const ctx = await ambiente.navegador.newContext({ viewport: { width: tela.width, height: tela.height }, isMobile: true, hasTouch: true, colorScheme: tela.escuro ? 'dark' : 'light' });
      const pagina = await ctx.newPage();
      const erros = [];
      pagina.on('pageerror', (e) => erros.push(e.message));
      await pagina.addInitScript(() => { try { if (!sessionStorage.getItem('bvteste')) localStorage.setItem('globo.bv.v1', 'true'); localStorage.setItem('globo.legenda.vista', 'true'); } catch {} });
      await pagina.goto(ambiente.url);
      await pagina.waitForFunction(() => window.__geoTotal && window.__geoTotal.estadoRender.feats, null, { timeout: 15000 });
      await pagina.waitForTimeout(400);
      try { await pagina.evaluate(abrir); } catch (e) { problemas.push(`${nome}: não abriu (${e.message})`); }
      await pagina.waitForTimeout(600);
      await pagina.waitForFunction(() => window.__geoTotal && window.__geoTotal.estadoRender.feats, null, { timeout: 15000 });
      await pagina.waitForTimeout(400);
      for (const p of await pagina.evaluate(auditarTela, { alvoMin: ALVO_MIN })) {
        if (!permitido(p)) problemas.push(`${nome}: ${p.tipo} — ${p.alvo} (${p.detalhe})`);
      }
      for (const e of erros) problemas.push(`${nome}: erro de JavaScript — ${e}`);
      await ctx.close();
    }
    assert.deepEqual(problemas, [], `${tela.nome}:\n` + problemas.join('\n'));
  });
}
