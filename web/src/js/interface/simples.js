/**
 * @arquivo js/interface/simples.js
 * Camada: Interface
 * Tela simples por padrão e letra grande (menu ⋯ → Personalizar).
 */

import { $, lsGet, lsSet } from '../nucleo/utilitarios.js';

/*
 * Quem nunca usou o app (ou pouca tecnologia) se perde com muitos botões. Por padrão a tela mostra
 * só o essencial: Treino/Livre, som, ⋯, aproximar e afastar. "Mais botões na tela" devolve dia e
 * noite, estilo e camadas do mapa, giro, passeio, mapa plano e o filtro do Livre (tudo isso também
 * fica no menu). "Letra grande" aumenta perguntas, cartões e menus. As duas escolhas ficam salvas.
 */
function aplicar() {
  var grande = !!lsGet('globo.letra', false);
  document.body.classList.toggle('simples', !lsGet('globo.avancado', false));
  document.body.classList.toggle('letra-grande', grande);
  $('oLetra').checked = grande;
  var w = $('wletra');
  if (w) { w.setAttribute('aria-pressed', grande ? 'true' : 'false'); w.textContent = grande ? '🔠 Voltar à letra normal' : '🔠 Letra maior'; }
}

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  var av = $('oAvancado'), le = $('oLetra');
  av.checked = !!lsGet('globo.avancado', false);
  av.onchange = function () { lsSet('globo.avancado', av.checked); aplicar(); };
  le.onchange = function () { lsSet('globo.letra', le.checked); aplicar(); };
  /* também já nas boas-vindas, para quem enxerga pouco não precisar achar o menu */
  if ($('wletra')) $('wletra').onclick = function () { lsSet('globo.letra', !lsGet('globo.letra', false)); aplicar(); };
  aplicar();
}

export { iniciar };
