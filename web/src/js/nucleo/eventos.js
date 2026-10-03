/**
 * @arquivo js/nucleo/eventos.js
 * Camada: Núcleo
 * Eventos entre módulos: quem avisa (emitir) não precisa conhecer quem reage (ouvir).
 */

/*
 * Notificações entre camadas. Ex.: a interface emite 'visao-mudou' e o app (que fica acima dela)
 * salva a última visão, sem a interface depender do app. Os ouvintes rodam na hora, em ordem.
 *
 * Eventos usados hoje:
 *   visao-mudou            país selecionado ou filtros mudaram (app/ultima-visao salva)
 *   fronteiras-carregadas  contornos dos países prontos ou trocados (interface/filtros atualiza)
 *   categorias-mudaram     territórios incluídos ou excluídos; dados: { placar } (treino atualiza)
 *   modo-estados-abriu     entrou no mapa dos estados do Brasil (treino fecha o painel)
 */
const ouvintes = {};

function ouvir(evento, fn) {
  (ouvintes[evento] || (ouvintes[evento] = [])).push(fn);
}

function emitir(evento, dados) {
  (ouvintes[evento] || []).forEach(function (fn) { fn(dados); });
}

export { emitir, ouvir };
