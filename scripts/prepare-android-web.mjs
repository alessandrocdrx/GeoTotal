// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
// Gera android/app/src/main/assets/www/index.html a partir de web/geototal.html:
// - carrega d3, topojson, datamaps e os estados do Brasil de assets/www/lib (funciona offline),
//   mantendo os CDNs como reserva;
// - injeta scripts/android-shim.js (salvar CSV, imprimir e botão voltar no Android);
// - copia LICENSE e NOTICE para dentro do APK, como pede a licença Apache 2.0.
// Uso: node scripts/prepare-android-web.mjs
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = root + 'web/geototal.html';
const out = root + 'android/app/src/main/assets/www/index.html';

let html = readFileSync(src, 'utf8');

const local = [
  ["['https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js'", 'lib/d3.min.js'],
  ["['https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js'", 'lib/topojson.min.js'],
  ["['https://cdn.jsdelivr.net/npm/datamaps@0.5.9/dist/datamaps.world.min.js'", 'lib/datamaps.world.min.js'],
  ["['https://cdn.jsdelivr.net/npm/@amcharts/amcharts5-geodata@5.1.4/brazilLow.js'", 'lib/brazilLow.js'],
];
for (const [list, file] of local) {
  if (!html.includes(list)) throw new Error(`Não achei a lista de scripts ${list} no HTML`);
  html = html.split(list).join(`['${file}',` + list.slice(1));
}

const shim = readFileSync(root + 'scripts/android-shim.js', 'utf8');
if (!html.includes('<head>')) throw new Error('Não achei <head> no HTML');
html = html.replace('<head>', `<head>\n<script>\n${shim}</script>`);

writeFileSync(out, html);
for (const f of ['LICENSE', 'NOTICE']) copyFileSync(root + f, root + `android/app/src/main/assets/www/${f}`);
console.log(`Gerado ${out}`);
