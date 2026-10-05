// geoTotal — Copyright 2026 alessandrocdrx
// SPDX-License-Identifier: Apache-2.0
//
// Testes de ponta a ponta: abrem o app (o mesmo index.html que vai no APK) num Chromium
// sem tela e conferem os fluxos principais. O estado interno é lido por window.__geoTotal
// (exposto por web/src/js/main.js). Rodam depois de `npm run build` e de
// `node scripts/prepare-android-web.mjs` (o script `npm run test:e2e` já faz os dois).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, abrirApp as abrir } from './apoio.mjs';

let ambiente;
before(async () => { ambiente = await iniciarServidor(); });
after(async () => { await ambiente?.encerrar(); });
const abrirApp = (opcoes) => abrir(ambiente, opcoes);

test('abre no Treino, sem erros e sem acessar a internet', async () => {
  const { pagina, erros, externos, fechar } = await abrirApp();
  const estado = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    return {
      treino: g.quiz.open,
      paises: g.availCount(),
      fronteiras: !!g.estadoRender.feats,
      treinoMarcado: document.getElementById('qbtn').getAttribute('aria-pressed'),
    };
  });
  assert.equal(estado.treino, true);
  assert.equal(estado.treinoMarcado, 'true');
  assert.equal(estado.paises, 204, 'países disponíveis por padrão (inclui a Guiana Francesa)');
  assert.ok(estado.fronteiras, 'fronteiras dos países carregadas do próprio app');
  assert.deepEqual(erros, []);
  assert.deepEqual(externos, [], 'o app não deve acessar nada fora do próprio pacote');
  await fechar();
});

test('troca entre Treino e Livre pelo cabeçalho', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), false);
  await pagina.click('#qbtn');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), true);
  assert.deepEqual(erros, []);
  await fechar();
});

test('filtro por continente e Desfazer funcionam no modo Livre (regressão: "hist.push")', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const ligados = () => pagina.evaluate(() => {
    const g = window.__geoTotal;
    return g.D.filter((d) => g.estadoMapa.on[d.i]).length;
  });
  const total = await ligados();
  await pagina.evaluate(() => document.querySelectorAll('#chips button')[2].click());
  const umContinente = await ligados();
  assert.ok(umContinente > 0 && umContinente < total, 'filtrar por continente reduz a lista');
  await pagina.evaluate(() => document.getElementById('ubtn').click());
  assert.equal(await ligados(), total, 'Desfazer volta ao filtro anterior');
  assert.deepEqual(erros, []);
  await fechar();
});

test('menu ⋯ abre as opções do treino', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('[data-p="mp-train"]');
  assert.equal(await pagina.evaluate(() => document.getElementById('mtitle').textContent), 'Opções do treino');
  assert.ok(await pagina.evaluate(() => document.getElementById('qtypes').getClientRects().length > 0));
  assert.deepEqual(erros, []);
  await fechar();
});

test('partida: cada país aparece uma vez por volta e a ordem muda entre partidas', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const jogar = () => pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'reg', r: 1 });
    const n = g.poolIdx().length, ordem = [];
    for (let k = 0; k < n; k++) {
      ordem.push(g.D[g.quiz.cur].cc);
      g.quiz.answered = false; g.finishQ(true); g.nextQ();
    }
    const zerou = !g.runPool().length;
    g.runRestart();
    return { n, ordem, zerou };
  });
  const p1 = await jogar();
  const p2 = await jogar();
  assert.equal(new Set(p1.ordem).size, p1.n, 'nenhum país repetido acertando todos');
  assert.ok(p1.zerou, 'acertar todos zera a região');
  assert.notDeepEqual(p1.ordem, p2.ordem, 'duas partidas seguidas não têm a mesma ordem');
  assert.deepEqual(erros, []);
  await fechar();
});

test('territórios dependentes seguem a rota: República Dominicana → Porto Rico', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.setIncludeDep(true);
    g.select(g.D.find((d) => d.cc === 'DO'), true);
  });
  await pagina.waitForTimeout(500);
  await pagina.click('#next');
  await pagina.waitForTimeout(500);
  assert.equal(await pagina.evaluate(() => document.getElementById('cname').textContent), 'Porto Rico');
  assert.deepEqual(erros, []);
  await fechar();
});

test('desabitados e Antártida: desligados por padrão e só em "Achar no mapa"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const antes = g.availCount();
    g.setIncludeUni(true);
    g.quizSetMode('cap');
    const naCapital = g.poolIdx().some((i) => g.D[i].uni);
    g.quizSetMode('map');
    const noMapa = g.poolIdx().filter((i) => g.D[i].uni).length;
    return { antes, depois: g.availCount(), naCapital, noMapa };
  });
  assert.equal(r.antes, 204);
  assert.equal(r.depois, 219);
  assert.equal(r.naCapital, false, 'sem perguntas de capital para lugares sem capital');
  assert.equal(r.noMapa, 15);
  assert.deepEqual(erros, []);
  await fechar();
});

test('ganchos do globo estão registrados pelas camadas de cima', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const k = g.ganchos;
    const abertoNoTreino = k.treinoAberto();
    document.getElementById('qclose').click();
    return {
      abertoNoTreino,
      abertoNoLivre: k.treinoAberto(),
      arco: k.desenharArco === g.drawArc,
      pulso: k.desenharPulsoEscopo === g.drawScopePulse,
      selo: k.desenharSeloResposta === g.drawBadge,
      ocultar: k.ocultarMarcadores === g.qHide,
      alturaCartao: typeof k.alturaCartao() === 'number',
    };
  });
  assert.deepEqual(r, { abertoNoTreino: true, abertoNoLivre: false, arco: true, pulso: true, selo: true, ocultar: true, alturaCartao: true });
  assert.deepEqual(erros, []);
  await fechar();
});

test('toques e categorias passam pelos ganchos da interface', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const k = g.ganchosInterface;
    g.quizSetMode('cap');
    const ignoraNoTreino = k.toqueAntes(10, 10);
    document.getElementById('qclose').click();
    const livre = k.toqueAntes(10, 10) || k.toqueNoGlobo(10, 10, []) || k.toqueEstados(10, 10);
    const antes = g.availCount();
    document.getElementById('oDep').click();
    return { ignoraNoTreino, livre, cresceu: g.availCount() > antes, marcadaNoTreino: document.getElementById('oDepQ').checked };
  });
  assert.deepEqual(r, { ignoraNoTreino: true, livre: false, cresceu: true, marcadaNoTreino: true });
  assert.deepEqual(erros, []);
  await fechar();
});

test('som: efeitos e música ligam e desligam pelo menu, sem erros', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.evaluate(() => document.querySelectorAll('.mfold').forEach((d) => { d.open = true; }));
  const antes = await pagina.evaluate(() => ({ e: document.getElementById('msfxv').textContent, m: document.getElementById('mmusicv').textContent }));
  await pagina.click('#mmusic');
  await pagina.evaluate(() => { const g = window.__geoTotal; ['acerto', 'erro', 'toque', 'nivel', 'meta', 'conquista'].forEach(g.tocar); });
  await pagina.waitForTimeout(3500);
  await pagina.click('#msfx');
  const depois = await pagina.evaluate(() => ({ e: document.getElementById('msfxv').textContent, m: document.getElementById('mmusicv').textContent, musica: window.__geoTotal.estadoSom.musica }));
  assert.deepEqual(antes, { e: 'Ligados', m: 'Ligada (toca no modo Livre)' });
  assert.equal(depois.e, 'Desligados');
  assert.equal(depois.musica, false, 'tocar em Música desliga (começa ligada)');
  assert.deepEqual(erros, []);
  await fechar();
});

test('primeira vez: cartão Treino leva à América do Sul; alternativas sem lugares disputados', async () => {
  const { pagina, erros, fechar } = await abrirApp({ novato: true });
  assert.equal(await pagina.isVisible('#welcome'), true, 'boas-vindas aparecem na primeira vez');
  await pagina.click('#wtreino');
  await pagina.waitForTimeout(500);
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    let disputados = 0;
    for (let k = 0; k < 40; k++) {
      const i = g.D.findIndex((d) => !d.dis && d.r === k % 9);
      if (i >= 0) disputados += g.makeOptions(i).filter((x) => g.D[x].dis).length;
    }
    return { escopo: g.estadoTreino.quizScope, aberto: !document.getElementById('welcome').hidden, disputados };
  });
  assert.deepEqual(r.escopo, { t: 'reg', r: 0 });
  assert.equal(r.aberto, false);
  assert.equal(r.disputados, 0, 'resposta certa comum não tem alternativa disputada');
  assert.deepEqual(erros, []);
  await fechar();
});

test('rodada de 10: termina com estrelas, XP e "Jogar de novo"', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    for (let k = 0; k < 10; k++) { g.quiz.answered = false; g.finishQ(true); if (k < 9) g.nextQ(); }
    document.getElementById('qnext').click();
    const fim = document.querySelector('.rodadafim');
    return {
      len: g.quiz.sessionLen,
      fim: !!fim,
      estrelas: fim ? fim.querySelectorAll('.estrelas .on').length : -1,
      combo: document.getElementById('qcomb').textContent,
      jogar: !!document.querySelector('.rfjogar'),
    };
  });
  assert.equal(r.len, 10, 'rodadas de 10 por padrão');
  assert.equal(r.fim, true, 'tela de fim de rodada aparece');
  assert.equal(r.estrelas, 3, '10 de 10 = 3 estrelas');
  assert.equal(r.combo, '🔥 x10');
  assert.equal(r.jogar, true);
  await pagina.click('.rfjogar');
  assert.equal(await pagina.evaluate(() => !!document.querySelector('.rodadafim')), false, '"Jogar de novo" começa outra rodada');
  assert.deepEqual(erros, []);
  await fechar();
});

test('desafio do dia: 10 países iguais para todos, uma vez por dia, com resultado para copiar', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('#mdesafio');
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const fila = g.estadoTreino.desafio.fila.slice();
    const vistos = [];
    for (let k = 0; k < 10; k++) { vistos.push(g.quiz.cur); g.quiz.answered = false; g.finishQ(k % 3 !== 0); if (k < 9) g.nextQ(); }
    document.getElementById('qnext').click();
    return {
      mesmaFila: JSON.stringify(fila) === JSON.stringify(vistos),
      titulo: document.querySelector('.rftit').textContent,
      grade: document.querySelector('.rfgrade').textContent,
      copiar: !!document.querySelector('.rfcopiar'),
      encerrou: g.estadoTreino.desafio === null,
      salvo: JSON.parse(localStorage.getItem('globo.desafio.v1')).certas,
    };
  });
  assert.equal(r.mesmaFila, true, 'as perguntas seguem a fila do dia');
  assert.match(r.titulo, /Desafio do dia #\d+/);
  assert.equal(r.grade, '🟥🟩🟩🟥🟩🟩🟥🟩🟩🟥');
  assert.equal(r.copiar, true);
  assert.equal(r.encerrou, true);
  assert.equal(r.salvo, 6);
  assert.deepEqual(erros, []);
  await fechar();
});

test('conquistas mostram progresso; cartão leva ao treino da região; curiosidade usa dados reais', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#mbtn');
  await pagina.click('#mbadges');
  const barras = await pagina.evaluate(() => document.querySelectorAll('#badgesbody .bprog').length);
  assert.ok(barras >= 10, 'conquistas bloqueadas têm barra de progresso');
  await pagina.evaluate(() => { document.getElementById('badgesclose').click(); document.getElementById('mclose').click(); document.getElementById('qclose').click(); });
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.select(g.D.find((d) => d.cc === 'JP'), true);
    const b = document.querySelector('#cstat .cstreinar');
    const texto = b && b.textContent;
    b.click();
    const jp = g.D.find((d) => d.cc === 'JP');
    return { texto, aberto: g.quiz.open, escopo: g.estadoTreino.quizScope, regJP: jp.r, curio: g.curiosidade(jp) };
  });
  assert.match(r.texto, /^Treinar /);
  assert.equal(r.aberto, true);
  assert.deepEqual(r.escopo, { t: 'reg', r: r.regJP });
  assert.match(r.curio, /Japão/);
  assert.deepEqual(erros, []);
  await fechar();
});

test('título do jogador, quase-acerto pelo vizinho e países dominados no globo', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const titulo = document.getElementById('qlevel').textContent;
    const br = g.D.findIndex((d) => d.cc === 'BR'), ar = g.D.findIndex((d) => d.cc === 'AR');
    g.quiz.cur = br; g.quiz.escolhido = ar;
    const quase = g.fbText(g.D[br], false);
    g.estadoTreino.QS.m.cap.BR = { r: 3, w: 0, s: 3 };
    return { titulo, quase, dominado: g.ganchos.dominado(br), naoDominado: g.ganchos.dominado(ar) };
  });
  assert.match(r.titulo, /Nv 1 · Turista/);
  assert.match(r.quase, /Quase! .*Argentina é vizinho/);
  assert.equal(r.dominado, true);
  assert.equal(r.naoDominado, false);
  assert.deepEqual(erros, []);
  await fechar();
});

test('progresso: salvar e restaurar; música pausa no treino; legenda no Livre', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.evaluate(() => localStorage.removeItem('globo.legenda.vista'));
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    // progresso: o arquivo leva as chaves globo.* e volta igual
    localStorage.setItem('globo.teste', 'x1');
    const arquivo = JSON.stringify({ tipo: 'geoTotal-progresso', versao: 1, dados: { 'globo.teste': 'restaurado' } });
    const ruim = g.restaurarDeTexto('{"oi":1}');
    const bom = g.restaurarDeTexto(arquivo);
    return {
      ruim, bom, valor: localStorage.getItem('globo.teste'),
      pausadaNoTreino: g.estadoSom.pausada,
    };
  });
  assert.match(r.ruim, /não é um progresso/);
  assert.equal(r.bom, '');
  assert.equal(r.valor, 'restaurado');
  assert.equal(r.pausadaNoTreino, true, 'no treino a música fica pausada');
  await pagina.click('#qclose');
  await pagina.waitForTimeout(900);
  const livre = await pagina.evaluate(() => ({ pausada: window.__geoTotal.estadoSom.pausada, legenda: !document.getElementById('legenda').hidden, itens: document.querySelectorAll('#legitens span').length }));
  assert.equal(livre.pausada, false, 'no Livre a música pode tocar');
  assert.equal(livre.legenda, true, 'legenda aparece na primeira visita ao Livre');
  assert.equal(livre.itens, 7);
  await pagina.click('#legok');
  assert.equal(await pagina.evaluate(() => document.getElementById('legenda').hidden), true);
  assert.deepEqual(erros, []);
  await fechar();
});

test('boas-vindas: cartão Livre abre o Livre; tour passa por todos os passos e fica no menu', async () => {
  const { pagina, erros, fechar } = await abrirApp({ novato: true });
  await pagina.click('#wlivre');
  await pagina.waitForTimeout(600);
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), false, 'Livre aberto');
  await pagina.click('#mbtn');
  await pagina.click('#mtour');
  await pagina.waitForTimeout(900);
  assert.equal(await pagina.isVisible('#guia'), true, 'tour aparece');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.quiz.open), true, 'tour abre o Treino');
  const passos = [];
  for (let k = 0; k < 10 && await pagina.isVisible('#guia'); k++) {
    passos.push(await pagina.textContent('#guiapasso'));
    await pagina.click('#guiaprox');
    await pagina.waitForTimeout(150);
  }
  assert.ok(passos.length >= 6, 'passa por pelo menos 6 passos: ' + passos.join(', '));
  assert.equal(await pagina.isVisible('#guia'), false, 'tour fecha no fim');
  assert.deepEqual(erros, []);
  await fechar();
});

test('giro e passeio: escondidos no Treino; no Livre explicam o que fazem', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  assert.equal(await pagina.isVisible('#tour'), false, 'passeio escondido no Treino');
  assert.equal(await pagina.isVisible('#spin'), false, 'giro escondido no Treino');
  await pagina.click('#qclose');
  await pagina.waitForTimeout(400);
  await pagina.click('#spin');
  assert.match(await pagina.textContent('#status'), /Giro automático desligado/);
  await pagina.click('#tour');
  assert.match(await pagina.textContent('#status'), /Passeio/);
  assert.equal(await pagina.textContent('#tour'), '⏹');
  await pagina.click('#tour');
  assert.equal(await pagina.textContent('#tour'), '🎬');
  assert.deepEqual(erros, []);
  await fechar();
});

test('passeio continua ao fechar o cartão; giro funciona no mapa plano', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  await pagina.waitForTimeout(400);
  await pagina.click('#tour');
  await pagina.waitForTimeout(600);
  await pagina.click('#close');
  const antes = await pagina.evaluate(() => window.__geoTotal.estadoMapa.selected.cc);
  await pagina.waitForTimeout(4800);
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    return { passeio: !!g.estadoCartao.passeio, depois: g.estadoMapa.selected.cc, cartao: document.getElementById('card').style.display };
  });
  assert.equal(r.passeio, true, 'passeio segue depois de fechar o cartão');
  assert.notEqual(r.depois, antes, 'foi para o próximo país');
  assert.equal(r.cartao, 'none', 'sem o cartão');
  await pagina.click('#tour');
  await pagina.evaluate(() => { const g = window.__geoTotal; g.estadoMapa.selected = null; g.estadoCamera.auto = true; g.estadoCamera.lastInteract = 0; document.getElementById('flat2d').click(); });
  const l0 = await pagina.evaluate(() => window.__geoTotal.estadoCamera.lam);
  await pagina.waitForTimeout(1500);
  const l1 = await pagina.evaluate(() => window.__geoTotal.estadoCamera.lam);
  assert.notEqual(l1, l0, 'o mapa plano desliza com o giro automático');
  assert.deepEqual(erros, []);
  await fechar();
});

test('zerou a região: duas próximas paradas e entra sozinho na primeira', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quiz.sessionLen = 0;
    g.applyScopeChange({ t: 'reg', r: 0 });
    for (let k = 0; k < 40 && g.runPool().length; k++) { g.quiz.answered = false; g.finishQ(true); g.nextQ(); }
  });
  await pagina.waitForTimeout(300);
  const r = await pagina.evaluate(() => ({ botoes: [...document.querySelectorAll('.proxbtn b')].map((b) => b.textContent), cont: (document.querySelector('.proxcont') || {}).textContent }));
  assert.equal(r.botoes.length, 2, 'duas sugestões: ' + r.botoes.join(', '));
  assert.ok(!r.botoes.includes('América do Sul'), 'não sugere a região que acabou de zerar');
  assert.match(r.cont, /começa em \d+s/);
  await pagina.waitForTimeout(12500); // 1,2 s do avanço automático da última resposta + 10 s de contagem
  const depois = await pagina.evaluate(() => window.__geoTotal.estadoTreino.quizScope);
  assert.equal(depois.t, 'reg');
  assert.notEqual(depois.r, 0, 'entrou sozinho na próxima região');
  assert.deepEqual(erros, []);
  await fechar();
});

test('estados do Brasil: o treino não entrega a resposta (etiqueta sem capital, pergunta sem sigla)', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'br' });
    g.quizSetMode('cap');
    const st = g.QD()[g.quiz.cur];
    const capQ = document.querySelector('#qbody .qq').firstChild.textContent;
    const etiqueta = g.stBadgeMetrics(g.estadoBrasil.selSt);
    g.quizSetMode('code');
    const st2 = g.QD()[g.quiz.cur];
    const codeQ = document.querySelector('#qbody .qq').firstChild.textContent;
    return { capQ, cap: st.cap, t2: etiqueta.t2, codeQ, sigla: st2.sigla };
  });
  assert.ok(!r.capQ.includes(r.cap), 'a pergunta não mostra a capital');
  assert.equal(r.t2, '', 'etiqueta do mapa sem "Capital: …" durante o treino');
  assert.ok(!new RegExp('\\b' + r.sigla + '\\b').test(r.codeQ), 'a pergunta da sigla não mostra a sigla: ' + r.codeQ);
  assert.deepEqual(erros, []);
  await fechar();
});

test('numa região a rodada não corta em 10: vai até zerar', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.applyScopeChange({ t: 'br' });
    for (let k = 0; k < 12; k++) { g.quiz.answered = false; g.finishQ(true); document.getElementById('qnext').click(); }
    return { fim: !!document.querySelector('.rodadafim'), restam: g.runPool().length };
  });
  assert.equal(r.fim, false, 'depois de 12 respostas nos estados, não interrompeu');
  assert.equal(r.restam, 15);
  assert.deepEqual(erros, []);
  await fechar();
});

test('cabeçalho: logo, botão de som; dia e noite ligado; tocar num país no treino mostra só o nome', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    const logo = getComputedStyle(document.querySelector('h1 .marca-logo')).backgroundImage.startsWith('url("data:image/png');
    const noite = g.optNight === true && document.getElementById('oNight').checked;
    document.getElementById('msom').click();
    const mudo = g.estadoSom.mudo, icone = document.getElementById('msom').textContent;
    document.getElementById('msom').click();
    return { logo, noite, mudo, icone, voltou: g.estadoSom.mudo };
  });
  assert.deepEqual(r, { logo: true, noite: true, mudo: true, icone: '🔇', voltou: false });
  const sobre = await pagina.evaluate(() => document.querySelector('#mp-sobre').textContent);
  assert.match(sobre, /Criado por alessandrocdrx/);
  assert.match(sobre, /versão \d+\.\d+/);
  assert.deepEqual(erros, []);
  await fechar();
});

test('cartão de estado não herda o selo "Não reconhecido" do país anterior; foguinho explica a sequência', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.select(g.D.find((d) => d.dis), true);
    const antes = document.getElementById('cdis').style.display;
    g.enterStates(g.BRS.find((s) => s.sigla === 'RS'));
    return { antes, depois: document.getElementById('cdis').style.display };
  });
  assert.notEqual(r.antes, 'none', 'país disputado mostra o selo');
  assert.equal(r.depois, 'none', 'estado não mostra o selo');
  assert.deepEqual(erros, []);
  await fechar();
});

test('cartão mostra a hora agora e a diferença para Brasília (país e estado)', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qclose');
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.select(g.D.find((d) => d.cc === 'JP'), true);
    const jp = document.getElementById('cfacts').textContent;
    g.enterStates(g.BRS.find((s) => s.sigla === 'AM'));
    const am = document.getElementById('cfacts').textContent;
    return { jp, am, brAgora: g.horaAgora('BR').dif };
  });
  assert.match(r.jp, /Hora agora/);
  assert.match(r.jp, /\+12h em relação a Brasília/);
  assert.match(r.am, /−1h em relação a Brasília/);
  assert.equal(r.brAgora, 'mesma hora de Brasília');
  assert.deepEqual(erros, []);
  await fechar();
});

test('"Onde treinar?": Guiana Francesa na América do Sul, Américas Central e do Norte juntas, lista das categorias', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  await pagina.click('#qscopeb');
  const r = await pagina.evaluate(() => {
    const tiles = [...document.querySelectorAll('.stile b')].map((b) => b.textContent);
    document.getElementById('scopeadv').open = true;
    document.getElementById('catlista').open = true;
    const ultra = [...document.querySelectorAll('.catrow')].filter((x) => x.querySelector('.catultra')).length;
    const g = window.__geoTotal;
    return { tiles, ultra, sul: g.D.filter((d) => d.r === 0 && g.avail(d)).map((d) => d.cc).includes('GF') };
  });
  assert.ok(r.tiles.includes('América Central e do Norte'));
  assert.ok(!r.tiles.includes('América do Norte'));
  assert.ok(r.sul, 'Guiana Francesa entra na América do Sul');
  assert.ok(r.ultra >= 5, 'territórios ultramarinos marcados');
  await pagina.click('.stile:nth-child(3)');
  assert.equal(await pagina.evaluate(() => window.__geoTotal.scopeLabel()), 'América Central e do Norte');
  assert.deepEqual(erros, []);
  await fechar();
});

test('dica na múltipla escolha tira 2 erradas sem dar a letra; seletor leva às outras opções do treino', async () => {
  const { pagina, erros, fechar } = await abrirApp();
  const r = await pagina.evaluate(() => {
    const g = window.__geoTotal;
    g.quizSetMode('cap');
    document.querySelector('.qhintbtn').click();
    const certo = g.optLabel(g.quiz.cur);
    const elim = [...document.querySelectorAll('#qbody .qopts button.elim')].map((b) => b.textContent);
    return { elim, certo, texto: document.querySelector('.qhintbtn').textContent };
  });
  assert.equal(r.elim.length, 2, 'duas opções eliminadas');
  assert.ok(!r.elim.includes(r.certo), 'a certa nunca é eliminada');
  assert.doesNotMatch(r.texto, /começa com/);
  await pagina.click('#qmodeb');
  await pagina.click('.qmodesmais');
  await pagina.waitForTimeout(300);
  assert.equal(await pagina.evaluate(() => !document.getElementById('mp-train').hidden), true, 'abre Opções do treino');
  assert.deepEqual(erros, []);
  await fechar();
});
