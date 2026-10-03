// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Monta web/geototal.html (arquivo único usado pelo app Android e pela versão no navegador)
// a partir do código-fonte organizado em web/src/.
//
// web/src/index.html é o molde: cada linha `<!-- @include caminho -->` é trocada pelo conteúdo
// do arquivo indicado, sem o cabeçalho de documentação (`/** @arquivo ... */` ou
// `<!-- @arquivo ... -->`). A ordem das inclusões é a ordem de execução: todo o JavaScript
// roda num único <script>, então funções podem ser usadas antes de declaradas, mas variáveis
// globais precisam ser criadas antes de usadas (ver docs/ARQUITETURA.md).
//
// Verificações feitas a cada build:
//   - todo arquivo de web/src/ é incluído exatamente uma vez;
//   - nenhuma função ou variável global é declarada em mais de um arquivo.
//
// Uso:
//   node scripts/build-web.mjs           gera web/geototal.html
//   node scripts/build-web.mjs --check   só confere se web/geototal.html está atualizado (CI)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'web', 'src');
const outFile = join(root, 'web', 'geototal.html');
const checkOnly = process.argv.includes('--check');

const INCLUDE = /^<!-- @include (\S+) -->$/;
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

/** Nomes declarados no nível de topo (função ou var/let/const sem recuo). */
function topLevelNames(text) {
  const names = [];
  for (const line of text.split('\n')) {
    let m = line.match(/^function\s+([\w$]+)/);
    if (m) { names.push(m[1]); continue; }
    m = line.match(/^(?:var|let|const)\s+(.*)/);
    if (!m) continue;
    // var a=1,b=f(x,y),c; -> a, b, c (ignora vírgulas dentro de parênteses/colchetes/chaves/strings)
    let depth = 0, quote = null, start = 0;
    const decl = m[1];
    const parts = [];
    for (let i = 0; i < decl.length; i++) {
      const ch = decl[i];
      if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') quote = ch;
      else if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) depth--;
      else if (ch === ',' && depth === 0) { parts.push(decl.slice(start, i)); start = i + 1; }
      else if (ch === ';' && depth === 0) break;
    }
    parts.push(decl.slice(start));
    for (const p of parts) {
      const n = p.trim().match(/^([\w$]+)/);
      if (n) names.push(n[1]);
    }
  }
  return names;
}

const template = readFileSync(join(srcDir, 'index.html'), 'utf8');
const used = new Set();
const declaredIn = new Map();
const out = [];

for (const line of template.split('\n')) {
  const m = line.match(INCLUDE);
  if (!m) { out.push(line); continue; }
  const rel = m[1];
  const path = join(srcDir, rel);
  if (used.has(rel)) fail(`${rel} foi incluído mais de uma vez`);
  used.add(rel);
  let text;
  try { text = readFileSync(path, 'utf8'); } catch { fail(`não encontrei ${rel}`); }
  text = stripHeader(rel, text);
  if (rel.endsWith('.js')) {
    for (const name of topLevelNames(text)) {
      if (declaredIn.has(name)) fail(`"${name}" declarado em ${declaredIn.get(name)} e em ${rel}`);
      declaredIn.set(name, rel);
    }
  }
  out.push(text.replace(/\n$/, ''));
}

const unused = listFiles(srcDir)
  .map((p) => relative(srcDir, p).split('\\').join('/'))
  .filter((rel) => rel !== 'index.html' && !used.has(rel));
if (unused.length) fail('arquivos de web/src/ fora do index.html: ' + unused.join(', '));

// aviso de arquivo gerado logo após a linha de copyright do <head>
const copyright = out.findIndex((l) => l.includes('Copyright') && l.startsWith('<!--'));
out.splice(copyright + 1, 0, NOTICE);
const html = out.join('\n');

if (checkOnly) {
  let current = '';
  try { current = readFileSync(outFile, 'utf8'); } catch {}
  if (current !== html) fail('web/geototal.html está desatualizado: rode `npm run build` e faça commit.');
  console.log('build-web: web/geototal.html está atualizado.');
} else {
  writeFileSync(outFile, html);
  console.log(`build-web: gerado web/geototal.html (${used.size} arquivos, ${declaredIn.size} nomes globais).`);
}
