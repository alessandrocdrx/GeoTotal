/**
 * @arquivo js/app/inicio.js
 * Camada: App
 * Ponto de entrada: inicia o mapa e abre o modo Treino.
 */

import { quizOpen } from '../treino/perguntas.js';

/** Executa a parte deste módulo na inicialização do app (chamada por js/main.js, na ordem). */
function iniciar() {
  /* o app abre no modo Treino; o botão "🌍 Livre" leva ao globo livre */
  quizOpen();
}

export { iniciar };
