// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Apoio aos testes de ponta a ponta: servidor local da pasta de assets do Android e abertura
// do app num celular simulado (Chromium sem tela).
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

/** Sobe o servidor e o navegador. Devolve { url, navegador, encerrar }. */
export async function iniciarServidor() {
  const servidor = createServer(async (req, res) => {
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
  const navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  return {
    url: `http://127.0.0.1:${servidor.address().port}/www/index.html`,
    navegador,
    encerrar: async () => { await navegador.close(); servidor.close(); },
  };
}

/**
 * Abre o app num celular simulado, usando o ambiente de iniciarServidor(). Devolve a página, a
 * lista de erros de JavaScript/CSP e a de acessos a endereços externos. novato: true abre como na
 * primeira vez (com as boas-vindas).
 */
export async function abrirApp(ambiente, { esperar = 5000, novato = false } = {}) {
  const ctx = await ambiente.navegador.newContext({ viewport: { width: 360, height: 720 }, isMobile: true, hasTouch: true });
  const pagina = await ctx.newPage();
  const erros = [];
  const externos = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  pagina.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) erros.push('CSP: ' + m.text()); });
  pagina.on('request', (r) => { if (!/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(r.url())) externos.push(r.url()); });
  await pagina.addInitScript(() => { window.AndroidBridge = { saveFile() {}, print() {}, shareImage() {} }; });
  // por padrão, um usuário que já viu as boas-vindas (o teste delas passa novato: true)
  if (!novato) await pagina.addInitScript(() => { try { localStorage.setItem('globo.bv.v1', 'true'); } catch {} });
  await pagina.goto(ambiente.url);
  await pagina.waitForTimeout(esperar);
  return { pagina, erros, externos, fechar: () => ctx.close() };
}
