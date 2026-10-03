// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Relatório de arquitetura do JavaScript (npm run camadas): importações que sobem de camada
// (ex.: visualização usando treino) e grupos de módulos com dependência circular.
// Ver "Camadas e dependências" em docs/ARQUITETURA.md.
//
// Uso: node scripts/verificar-camadas.mjs [--max N]   (falha se houver mais de N violações)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const CAMADAS = ['dados', 'nucleo', 'visualizacao', 'interface', 'recursos', 'brasil', 'treino', 'app'];
const raiz = fileURLToPath(new URL('../web/src/js/', import.meta.url));

const arquivos = [];
(function listar(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) listar(p);
    else if (p.endsWith('.js')) arquivos.push(p);
  }
})(raiz);

const rel = (p) => relative(raiz, p).split('\\').join('/');
const camada = (p) => rel(p).split('/')[0];
const grafo = new Map();
for (const f of arquivos) {
  const codigo = readFileSync(f, 'utf8');
  grafo.set(f, [...codigo.matchAll(/^import .* from '([^']+)';$/gm)].map((m) => normalize(join(dirname(f), m[1]))));
}

const violacoes = [];
for (const [f, deps] of grafo) {
  if (!CAMADAS.includes(camada(f))) continue; // main.js pode importar tudo
  for (const d of deps) {
    if (CAMADAS.indexOf(camada(d)) > CAMADAS.indexOf(camada(f))) violacoes.push(`${rel(f)} → ${rel(d)}`);
  }
}

// componentes fortemente conexos (Tarjan) = grupos circulares
let indice = 0;
const pilha = [], naPilha = new Set(), idx = new Map(), baixo = new Map(), grupos = [];
function visitar(v) {
  idx.set(v, indice); baixo.set(v, indice); indice++;
  pilha.push(v); naPilha.add(v);
  for (const w of grafo.get(v) || []) {
    if (!idx.has(w)) { visitar(w); baixo.set(v, Math.min(baixo.get(v), baixo.get(w))); }
    else if (naPilha.has(w)) baixo.set(v, Math.min(baixo.get(v), idx.get(w)));
  }
  if (baixo.get(v) === idx.get(v)) {
    const g = [];
    let w;
    do { w = pilha.pop(); naPilha.delete(w); g.push(rel(w)); } while (w !== v);
    if (g.length > 1) grupos.push(g);
  }
}
for (const f of arquivos) if (!idx.has(f)) visitar(f);

console.log(`Módulos: ${arquivos.length}`);
console.log(`Importações que sobem de camada: ${violacoes.length}`);
const porPar = {};
for (const v of violacoes) {
  const [a, b] = v.split(' → ').map((x) => x.split('/')[0]);
  porPar[`${a} → ${b}`] = (porPar[`${a} → ${b}`] || 0) + 1;
}
for (const [par, n] of Object.entries(porPar).sort((a, b) => b[1] - a[1])) console.log(`  ${par}: ${n}`);
console.log(`Grupos circulares: ${grupos.length}${grupos.length ? ' (' + grupos.map((g) => g.length + ' módulos').join(', ') + ')' : ''}`);

const i = process.argv.indexOf('--max');
if (i > 0 && violacoes.length > Number(process.argv[i + 1])) {
  console.error(`\nMais violações (${violacoes.length}) do que o limite (${process.argv[i + 1]}). Não piore a arquitetura.`);
  process.exit(1);
}
