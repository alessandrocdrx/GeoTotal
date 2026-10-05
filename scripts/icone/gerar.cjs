// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
// Gera o ícone adaptativo do app (mipmap-*/ic_launcher_{background,foreground,monochrome}.png)
// as imagens da Play Store (playstore/icone-512.png e destaque-1024x500.png) e a logo do cabeçalho
// (web/src/estilos/marca.css) a partir de
// scripts/icone/icone.html. Requer Playwright com Chromium.
// Uso: node scripts/icone/gerar.cjs
const path = require('node:path');
const fs = require('node:fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.join(__dirname, '..', '..');
const RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');
const DENS = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'icone.html'));
  await p.waitForFunction(() => window.ICON);
  async function shot(markup, w, h, out) {
    await p.setViewportSize({ width: w, height: h });
    await p.evaluate(m => { document.getElementById('out').innerHTML = m; }, markup);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await p.locator('#out svg').screenshot({ path: out, omitBackground: true });
    console.log('gerado', path.relative(ROOT, out));
  }
  for (const [d, px] of Object.entries(DENS)) {
    for (const k of ['background', 'foreground', 'monochrome']) {
      const fn = { background: 'bg', foreground: 'fg', monochrome: 'mono' }[k];
      await shot(await p.evaluate(([f, n]) => ICON[f](n), [fn, px]), px, px, path.join(RES, 'mipmap-' + d, 'ic_launcher_' + k + '.png'));
    }
  }
  await shot(await p.evaluate(() => ICON.full(512)), 512, 512, path.join(ROOT, 'playstore', 'icone-512.png'));
  await shot(await p.evaluate(() => ICON.feature()), 1024, 500, path.join(ROOT, 'playstore', 'destaque-1024x500.png'));
  // logo pequena do cabeçalho do app, embutida no CSS (o app não carrega arquivos de fora)
  const mini = path.join(require('node:os').tmpdir(), 'geototal-logo-96.png');
  await shot(await p.evaluate(() => ICON.full(96)), 96, 96, mini);
  const b64 = fs.readFileSync(mini).toString('base64');
  fs.writeFileSync(path.join(ROOT, 'web', 'src', 'estilos', 'marca.css'),
    '/**\n * @arquivo estilos/marca.css\n * Camada: Tema\n * Logo pequena do cabeçalho (GERADO por scripts/icone/gerar.cjs a partir de icone.html).\n */\n' +
    '.marca-logo{background-image:url(data:image/png;base64,' + b64 + ')}\n');
  console.log('gerado web/src/estilos/marca.css');
  await b.close();
})();
