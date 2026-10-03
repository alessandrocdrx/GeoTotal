/**
 * @arquivo js/interface/ganchos.js
 * Camada: Interface
 * Pontos de extensão da interface: Brasil e treino registram aqui o que cartão, filtros, busca, passeio e toques precisam deles.
 */

/*
 * A interface (cartão, filtros, busca, passeio, toques) é a base sobre a qual Brasil e treino
 * funcionam, então não os importa: consulta estes ganchos, que eles preenchem no seu iniciar().
 * Os valores abaixo são o comportamento sem ninguém registrado.
 */
const ganchosInterface = {
  /** Mostra no cartão o desempenho do usuário no treino com este país ou estado. */
  mostrarDesempenho: (/* chave, ehEstado */) => {},
  /** Brasil: ir ao estado anterior (-1) ou seguinte (+1) no cartão. */
  passoEstado: (/* direcao */) => {},
  /** Brasil: mostrar ou esconder o botão "Estados" do cartão. */
  atualizarBotaoEstados: () => {},
  /** Brasil: "Só vizinhos" com um estado selecionado. */
  alternarVizinhosEstado: () => {},
  /** Brasil: chips de região quando o mapa mostra os estados. */
  montarChipsEstados: () => {},
  /** Brasil: abrir o mapa dos estados num estado (resultado da busca). */
  abrirEstado: (/* estado */) => {},
  /** Brasil: selecionar um estado (passeio pela rota). */
  selecionarEstado: (/* estado, voar */) => {},
  /*
   * Toques no globo, nesta ordem. Cada um devolve true se tratou o toque (aí ninguém mais trata).
   */
  /** Treino: ignorar toques durante perguntas ou responder no mapa do Brasil. */
  toqueAntes: (/* x, y */) => false,
  /** Brasil: escolher um estado no mapa dos estados. */
  toqueEstados: (/* x, y */) => false,
  /** Treino: responder "Achar no mapa" (mundo). cand = países perto do toque. */
  toqueNoGlobo: (/* x, y, cand */) => false,
  /** Treino: o mesmo no mapa 2D. */
  toqueNoMapa2D: (/* x, y */) => false,
};

export { ganchosInterface };
