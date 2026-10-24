// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Revisão das telas num celular estreito (360 px): a busca abre o país com Enter, os jogos
// rápidos cabem nos cartões, o relógio da partida não anda enquanto o tour está aberto e o
// cartão do país cresce de verdade em "Mais informações".
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, abrirApp } from './apoio.mjs';

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente.encerrar(); });

test('busca: "Bra" mostra o Brasil primeiro e Enter abre o cartão', async () => {
  const { pagina, erros, fechar } = await abrirApp(ambiente);
  await pagina.locator('#qclose').click();
  await pagina.locator('#q').fill('Bra');
  assert.match(await pagina.locator('#results button').first().textContent(), /Brasil/);
  await pagina.keyboard.press('Enter');
  await pagina.waitForTimeout(800);
  assert.equal(await pagina.locator('#cname').textContent(), 'Brasil');
  assert.deepEqual(erros, []);
  await fechar();
});

test('jogos rápidos: nenhum nome sai do cartão', async () => {
  const { pagina, fechar } = await abrirApp(ambiente);
  await pagina.locator('#qmodeb').click();
  await pagina.waitForTimeout(400);
  const vazados = await pagina.evaluate(() => [...document.querySelectorAll('.qjr .mcard')]
    .filter((c) => c.scrollWidth > c.clientWidth + 1 || c.getBoundingClientRect().right > window.innerWidth)
    .map((c) => c.textContent.trim().slice(0, 20)));
  assert.deepEqual(vazados, []);
  await fechar();
});

test('relógio da partida fica parado durante o tour', async () => {
  const { pagina, fechar } = await abrirApp(ambiente);
  await pagina.waitForTimeout(2500);
  const jogado = await pagina.locator('#qtimer').textContent();
  await pagina.evaluate(() => { document.getElementById('mtour').click(); });
  await pagina.waitForFunction(() => !document.getElementById('guia').hidden);
  await pagina.waitForTimeout(1200);
  const antes = await pagina.locator('#qtimer').textContent();
  await pagina.waitForTimeout(3200);
  assert.equal(await pagina.locator('#qtimer').textContent(), antes);
  /* e não volta: o tempo jogado antes do tour continua no relógio */
  assert.ok(antes >= jogado, `relógio voltou de ${jogado} para ${antes}`);
  await fechar();
});

test('cartão do país: "Mais informações" deixa o cartão bem maior', async () => {
  const { pagina, fechar } = await abrirApp(ambiente);
  await pagina.locator('#qclose').click();
  await pagina.locator('#q').fill('Brasil');
  await pagina.keyboard.press('Enter');
  await pagina.waitForTimeout(800);
  const pequeno = await pagina.locator('#card').evaluate((c) => c.getBoundingClientRect().height);
  await pagina.locator('#cexpandir').click();
  await pagina.waitForTimeout(800);
  const grande = await pagina.locator('#card').evaluate((c) => c.getBoundingClientRect().height);
  assert.ok(grande > pequeno + 120, `cresceu só de ${Math.round(pequeno)} para ${Math.round(grande)} px`);
  await fechar();
});
