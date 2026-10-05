// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Monta web/geototal.html (arquivo único usado pelo app Android e pela versão no navegador)
// a partir do código-fonte organizado em web/src/.
//
// web/src/index.html é o molde:
//   - `<!-- @include caminho -->` é trocado pelo conteúdo do arquivo (CSS ou HTML), sem o
//     cabeçalho de documentação `/** @arquivo ... */` ou `<!-- @arquivo ... -->`;
//   - `<!-- @bundle js/main.js -->` é trocado pelo JavaScript empacotado pelo esbuild a partir
//     do ponto de entrada (módulos ES com import/export, ver docs/ARQUITETURA.md).
//
// Verificações feitas a cada build:
//   - todo arquivo de web/src/ é usado (incluído no molde ou importado a partir de main.js);
//   - todo arquivo tem o cabeçalho @arquivo;
//   - o esbuild recusa importações de nomes que não existem.
//
// Uso:
//   node scripts/build-web.mjs           gera web/geototal.html
//   node scripts/build-web.mjs --check   só confere se web/geototal.html está atualizado (CI)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildSync } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'web', 'src');
const outFile = join(root, 'web', 'geototal.html');
const checkOnly = process.argv.includes('--check');

const INCLUDE = /^<!-- @include (\S+) -->$/;
const BUNDLE = /^<!-- @bundle (\S+) -->$/;
const HEADER_JS = /^\/\*\*\n \* @arquivo [^\n]*\n(?: \*[^\n]*\n)*? \*\/\n/;
const HEADER_HTML = /^<!-- @arquivo [\s\S]*? -->\n/;
const NOTICE = '<!-- Arquivo GERADO por scripts/build-web.mjs a partir de web/src/. Não edite aqui: edite web/src/ e rode `npm run build`. -->';

function fail(msg) {
  console.error('build-web: ' + msg);
  process.exit(1);
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

function stripHeader(path, text) {
  const re = path.endsWith('.html') ? HEADER_HTML : HEADER_JS;
  if (!re.test(text)) fail(`${path} não começa com o cabeçalho @arquivo`);
  return text.replace(re, '');
}

/** Empacota o ponto de entrada num único script (IIFE) e devolve o código e os arquivos usados. */
function bundle(entry) {
  const res = buildSync({
    entryPoints: [join(srcDir, entry)],
    bundle: true,
    format: 'iife',
    target: 'es2018', // WebView atualizável do Android 8+ (minSdk 26); usa regex com \p{...}
    charset: 'utf8',
    legalComments: 'none',
    write: false,
    metafile: true,
    logLevel: 'silent',
  });
  const js = res.outputFiles[0].text;
  if (/<\/script/i.test(js)) fail('o JavaScript contém "</script", que fecharia a tag no HTML');
  const inputs = Object.keys(res.metafile.inputs).map((p) => relative(srcDir, join(root, p)).split('\\').join('/'));
  return { js: js.replace(/\n$/, ''), inputs };
}

const template = readFileSync(join(srcDir, 'index.html'), 'utf8');
const used = new Set();
const out = [];

for (const line of template.split('\n')) {
  const b = line.match(BUNDLE);
  if (b) {
    let res;
    try { res = bundle(b[1]); } catch (e) { fail('erro no JavaScript:\n' + (e.errors || []).map((x) => `  ${x.location?.file}:${x.location?.line}: ${x.text}`).join('\n')); }
    for (const rel of res.inputs) {
      if (!HEADER_JS.test(readFileSync(join(srcDir, rel), 'utf8'))) fail(`${rel} não começa com o cabeçalho @arquivo`);
      used.add(rel);
    }
    out.push(res.js);
    continue;
  }
  const m = line.match(INCLUDE);
  if (!m) { out.push(line); continue; }
  const rel = m[1];
  const path = join(srcDir, rel);
  if (used.has(rel)) fail(`${rel} foi incluído mais de uma vez`);
  used.add(rel);
  let text;
  try { text = readFileSync(path, 'utf8'); } catch { fail(`não encontrei ${rel}`); }
  text = stripHeader(rel, text);
  out.push(text.replace(/\n$/, ''));
}

const unused = listFiles(srcDir)
  .map((p) => relative(srcDir, p).split('\\').join('/'))
  .filter((rel) => rel !== 'index.html' && !used.has(rel));
if (unused.length) fail('arquivos de web/src/ fora do index.html: ' + unused.join(', '));

// aviso de arquivo gerado logo após a linha de copyright do <head>
const copyright = out.findIndex((l) => l.includes('Copyright') && l.startsWith('<!--'));
out.splice(copyright + 1, 0, NOTICE);
// {{VERSAO}} no HTML (tela "Sobre") vira a versão do package.json
const versao = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version.replace(/\.0$/, '');
const html = out.join('\n').replace(/\{\{VERSAO\}\}/g, versao);

if (checkOnly) {
  let current = '';
  try { current = readFileSync(outFile, 'utf8'); } catch {}
  if (current !== html) fail('web/geototal.html está desatualizado: rode `npm run build` e faça commit.');
  console.log('build-web: web/geototal.html está atualizado.');
} else {
  writeFileSync(outFile, html);
  console.log(`build-web: gerado web/geototal.html (${used.size} arquivos de web/src/).`);
}
