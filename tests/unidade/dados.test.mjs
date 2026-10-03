// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Testes de integridade dos dados (sem navegador). Leem os textos-fonte de web/src/js/dados/
// e conferem as regras que o app assume: códigos únicos, dados extras completos, rota dos
// territórios coerente e vizinhanças apontando para países que existem.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dados = (f) => readFileSync(fileURLToPath(new URL(`../../web/src/js/dados/${f}`, import.meta.url)), 'utf8');
const bloco = (texto, nome) => {
  const m = texto.match(new RegExp('(?:var|let|const) ' + nome + ' ?= ?`([\\s\\S]*?)`'));
  assert.ok(m, `bloco ${nome} não encontrado`);
  return m[1].trim().split('\n').map((l) => l.split('|'));
};

const paisesJs = dados('paises.js');
const BASE = bloco(paisesJs, 'RAW');
const DEP = bloco(paisesJs, 'RAW_DEP');
const UNI = bloco(paisesJs, 'RAW_UNI');
const TODOS = [...BASE, ...DEP, ...UNI];
const codigo = (p) => p[7];

test('todo país ou território tem os 8 campos obrigatórios', () => {
  for (const p of TODOS) {
    assert.ok(p.length >= 8, `linha incompleta: ${p.join('|')}`);
    assert.ok(p[0] && p[1], `nome ou capital vazio: ${p.join('|')}`);
    assert.match(codigo(p), /^[A-Z]{2}$/, `código inválido em ${p[0]}`);
  }
});

test('códigos e nomes são únicos', () => {
  const vistos = new Set();
  for (const p of TODOS) {
    assert.ok(!vistos.has(codigo(p)), `código repetido: ${codigo(p)}`);
    vistos.add(codigo(p));
  }
  const nomes = TODOS.map((p) => p[0]);
  assert.equal(new Set(nomes).size, nomes.length, 'nome repetido');
});

test('coordenadas dentro do globo', () => {
  for (const p of TODOS) {
    const lat = +p[2], lng = +p[3];
    assert.ok(lat >= -90 && lat <= 90, `latitude fora do intervalo em ${p[0]}`);
    assert.ok(lng >= -180 && lng <= 180, `longitude fora do intervalo em ${p[0]}`);
  }
});

test('categorias marcadas corretamente', () => {
  for (const p of DEP) assert.equal(p[8], 'dep', `${p[0]} deveria ser |dep`);
  for (const p of UNI) assert.equal(p[8], 'uni', `${p[0]} deveria ser |uni`);
  // A lista principal pode ter territórios dependentes que ficam na posição original da rota
  // (ex.: Guiana Francesa), mas nunca desabitados.
  for (const p of BASE) assert.ok(!p[8] || p[8] === 'dep', `${p[0]} está em RAW com categoria ${p[8]}`);
});

test('rota dos territórios: cada um ancorado em um país que existe, uma vez só', () => {
  const m = paisesJs.match(/(?:var|let|const) DEP_AFTER ?= ?(\{[^;]*\});/);
  assert.ok(m, 'DEP_AFTER não encontrado');
  const ancoras = Function('return ' + m[1])();
  const base = new Set(BASE.map(codigo));
  const extras = new Set([...DEP, ...UNI].map(codigo));
  const listados = [];
  for (const [ancora, lista] of Object.entries(ancoras)) {
    assert.ok(base.has(ancora), `âncora ${ancora} não é um país da lista principal`);
    for (const c of lista.split(' ')) {
      assert.ok(extras.has(c), `${c} em DEP_AFTER não é território`);
      listados.push(c);
    }
  }
  assert.equal(new Set(listados).size, listados.length, 'território listado em duas âncoras');
  // Sem âncora só os da região Antártida (r=7), que fecham a rota no fim.
  for (const p of [...DEP, ...UNI]) {
    if (p[4] === '7') continue;
    assert.ok(listados.includes(codigo(p)), `território ${codigo(p)} sem âncora na rota`);
  }
});

test('dados extras (INFO) para todo país e território', () => {
  const info = new Set(bloco(dados('info-paises.js'), 'INFO_RAW').map((p) => p[0]));
  for (const p of TODOS) assert.ok(info.has(codigo(p)), `sem dados extras: ${p[0]} (${codigo(p)})`);
});

// mesma regra do app (byName em vizinhos.js): sem acentos, minúsculas e sem o trecho entre parênteses
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const chave = (nome) => norm(nome.split(' (')[0]);

test('vizinhanças apontam para países existentes', () => {
  const nomes = new Set(TODOS.map((p) => chave(p[0])));
  const linhas = dados('vizinhos.js').match(/(?:var|let|const) NB_RAW ?= ?`([\s\S]*?)`/)[1].trim().split('\n');
  for (const l of linhas) {
    const [a, viz = ''] = l.split(':');
    assert.ok(nomes.has(norm(a.trim())), `vizinhança de país desconhecido: ${a}`);
    for (const n of viz.split(',').map((s) => s.trim()).filter(Boolean)) {
      assert.ok(nomes.has(norm(n)), `vizinho desconhecido "${n}" em ${a}`);
    }
  }
});
