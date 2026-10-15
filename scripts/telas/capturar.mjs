// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Captura uma tela do app como ela aparece no celular do usuário (Motorola Edge 60 Pro:
// 450x842 no artefato, tema escuro, fonte Roboto, imagem 900px de largura como os prints dele).
// Uso: npm run build && node scripts/telas/capturar.mjs saida.png ["código JS para abrir a tela"] [--app]
// Para a fonte bater, o sistema precisa ter Roboto como sans-serif (ver docs/ARQUITETURA.md).
import { iniciarServidor } from '../../tests/e2e/apoio.mjs';

const args = process.argv.slice(2);
const app = args.includes('--app');
const [saida = 'tela.png', abrir = ''] = args.filter((a) => a !== '--app');
const amb = await iniciarServidor();
const ctx = await amb.navegador.newContext({ viewport: { width: 450, height: app ? 925 : 842 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark' });
const p = await ctx.newPage();
await p.addInitScript(() => { try { localStorage.setItem('globo.bv.v1', 'true'); localStorage.setItem('globo.legenda.vista', 'true'); } catch {} });
await p.goto(amb.url);
await p.waitForFunction(() => globalThis.__geoTotal && globalThis.__geoTotal.estadoRender.feats, null, { timeout: 15000 });
await p.waitForTimeout(800);
if (abrir) await p.evaluate(abrir);
await p.waitForTimeout(800);
await p.screenshot({ path: saida });
await amb.encerrar();
console.log('salvo em', saida);
