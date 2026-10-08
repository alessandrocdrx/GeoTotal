/**
 * @arquivo js/visualizacao/ganchos.js
 * Camada: Visualização
 * Pontos de extensão: as camadas de cima registram aqui o que o globo precisa saber ou desenhar.
 */

/*
 * A visualização não importa interface, treino nem Brasil. Quando precisa de algo deles (saber
 * se o treino está aberto, desenhar o selo da resposta), consulta estes ganchos, que cada camada
 * de cima preenche no seu iniciar(). Os valores abaixo são o comportamento sem ninguém registrado.
 */
const ganchos = {
  /** O painel do treino está aberto? (esconde os rótulos e centraliza o globo acima dele) */
  treinoAberto: () => false,
  /** Altura, em pixels, do painel do treino na parte de baixo da tela. */
  alturaTreino: () => 0,
  /** Altura, em pixels, do cartão do país ou estado; 0 enquanto não foi medido. */
  alturaCartao: () => 0,
  /** Esconder os marcadores dos países (pergunta em que eles entregariam a resposta). */
  ocultarMarcadores: () => false,
  /** Treino: o jogador já domina este país (3 acertos seguidos)? Pinta de dourado no modo Livre. */
  dominado: (/* indice */) => false,
  /** Esconder os marcadores dos estados (pergunta "Achar no mapa" do Brasil). */
  ocultarMarcadoresEstados: () => false,
  /** País piscando no treino: { i, kind: 'ok' | 'ask' | 'reveal' } ou null. */
  destaquePais: () => null,
  /** Arco da distância entre duas capitais. */
  desenharArco: (/* R, cx, cy */) => {},
  /** Pulso que destaca a região escolhida para o treino. */
  desenharPulsoEscopo: (/* R, cx, cy */) => {},
  /** Selo com o nome do país da resposta, depois de responder. */
  desenharSeloResposta: (/* R, cx, cy */) => {},
  /** Liga ou desliga o globo cartoon (preenchido por visualizacao/carregamento.js). */
  trocarCartoon: (/* ligado */) => {},
};

export { ganchos };
