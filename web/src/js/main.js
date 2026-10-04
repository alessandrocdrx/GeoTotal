/**
 * @arquivo js/main.js
 * Camada: App
 * Ponto de entrada (composition root): inicializa os módulos na ordem certa e expõe as
 * integrações com o Android e com os testes.
 */
import * as AppCompatEmoji from './app/compat-emoji.js';
import * as DadosPaises from './dados/paises.js';
import * as DadosInfoPaises from './dados/info-paises.js';
import * as DadosReligioes from './dados/religioes.js';
import * as DadosLinguas from './dados/linguas.js';
import * as DadosMassasTerra from './dados/massas-terra.js';
import * as DadosVizinhos from './dados/vizinhos.js';
import * as DadosOceanosPolos from './dados/oceanos-polos.js';
import * as VisualizacaoGlobo from './visualizacao/globo.js';
import * as VisualizacaoAnimacao from './visualizacao/animacao.js';
import * as InterfaceInteracao from './interface/interacao.js';
import * as InterfaceCartaoPais from './interface/cartao-pais.js';
import * as InterfaceFiltros from './interface/filtros.js';
import * as InterfaceBusca from './interface/busca.js';
import * as InterfaceBotoes from './interface/botoes.js';
import * as VisualizacaoFronteiras from './visualizacao/fronteiras.js';
import * as VisualizacaoWebgl from './visualizacao/webgl.js';
import * as VisualizacaoTextura from './visualizacao/textura.js';
import * as NucleoUtilitarios from './nucleo/utilitarios.js';
import * as VisualizacaoMarcadores from './visualizacao/marcadores.js';
import * as InterfaceCartaoDetalhes from './interface/cartao-detalhes.js';
import * as InterfaceFiltrosDesfazer from './interface/filtros-desfazer.js';
import * as InterfaceListaProximos from './interface/lista-proximos.js';
import * as InterfaceFiltrosFavoritos from './interface/filtros-favoritos.js';
import * as InterfacePasseio from './interface/passeio.js';
import * as InterfaceDistancia from './interface/distancia.js';
import * as VisualizacaoDiaNoite from './visualizacao/dia-noite.js';
import * as VisualizacaoCarregamento from './visualizacao/carregamento.js';
import * as RecursosExportar from './recursos/exportar.js';
import * as TreinoEstado from './treino/estado.js';
import * as TreinoDominio from './treino/dominio.js';
import * as TreinoPartida from './treino/partida.js';
import * as TreinoDica from './treino/dica.js';
import * as TreinoPerguntas from './treino/perguntas.js';
import * as TreinoEstatisticas from './treino/estatisticas.js';
import * as TreinoDestaqueEscopo from './treino/destaque-escopo.js';
import * as TreinoEscopo from './treino/escopo.js';
import * as InterfaceMenu from './interface/menu.js';
import * as DadosEstadosBrasil from './dados/estados-brasil.js';
import * as BrasilModoEstados from './brasil/modo-estados.js';
import * as BrasilCartaoEstado from './brasil/cartao-estado.js';
import * as BrasilFiltros from './brasil/filtros.js';
import * as BrasilImportarContornos from './brasil/importar-contornos.js';
import * as BrasilMenu from './brasil/menu.js';
import * as AppUltimaVisao from './app/ultima-visao.js';
import * as VisualizacaoMapa2d from './visualizacao/mapa-2d.js';
import * as TreinoProgressao from './treino/progressao.js';
import * as AppInicio from './app/inicio.js';
import * as NucleoGeo from './nucleo/geo.js';
import * as VisualizacaoEnquadramento from './visualizacao/enquadramento.js';
import * as VisualizacaoEstados from './visualizacao/estados.js';
import * as VisualizacaoGanchos from './visualizacao/ganchos.js';
import * as VisualizacaoSelo from './visualizacao/selo.js';
import * as InterfaceGanchos from './interface/ganchos.js';
import * as NucleoEventos from './nucleo/eventos.js';
import * as TreinoToques from './treino/toques.js';
import * as VisualizacaoProjecao from './visualizacao/projecao.js';
import * as VisualizacaoTela from './visualizacao/tela.js';
import * as NucleoSom from './nucleo/som.js';

/* Módulos só definem funções e estado ao carregar; a execução começa aqui, nesta ordem. */
AppCompatEmoji.iniciar();
DadosPaises.iniciar();
DadosInfoPaises.iniciar();
DadosReligioes.iniciar();
DadosLinguas.iniciar();
DadosMassasTerra.iniciar();
DadosVizinhos.iniciar();
DadosOceanosPolos.iniciar();
NucleoSom.iniciar();
VisualizacaoTela.iniciar();
InterfaceInteracao.iniciar();
InterfaceCartaoDetalhes.iniciar();
InterfaceCartaoPais.iniciar();
InterfaceFiltros.iniciar();
InterfaceBusca.iniciar();
InterfaceBotoes.iniciar();
VisualizacaoFronteiras.iniciar();
VisualizacaoTextura.iniciar();
InterfaceFiltrosDesfazer.iniciar();
InterfaceListaProximos.iniciar();
InterfaceFiltrosFavoritos.iniciar();
InterfacePasseio.iniciar();
InterfaceDistancia.iniciar();
VisualizacaoDiaNoite.iniciar();
VisualizacaoCarregamento.iniciar();
RecursosExportar.iniciar();
TreinoEstado.iniciar();
TreinoPartida.iniciar();
TreinoPerguntas.iniciar();
TreinoToques.iniciar();
TreinoEstatisticas.iniciar();
TreinoDestaqueEscopo.iniciar();
TreinoEscopo.iniciar();
InterfaceMenu.iniciar();
DadosEstadosBrasil.iniciar();
VisualizacaoEstados.iniciar();
BrasilModoEstados.iniciar();
BrasilCartaoEstado.iniciar();
BrasilFiltros.iniciar();
BrasilImportarContornos.iniciar();
BrasilMenu.iniciar();
AppUltimaVisao.iniciar();
VisualizacaoMapa2d.iniciar();
TreinoProgressao.iniciar();
AppInicio.iniciar();

/* Integração com o app Android: MainActivity chama window.setStatus em erros de compartilhamento. */
window.setStatus = VisualizacaoFronteiras.setStatus;

/* Interface de depuração e testes (tests/e2e): window.__geoTotal.nome lê o valor atual. */
const modulos = [AppCompatEmoji, DadosPaises, DadosInfoPaises, DadosReligioes, DadosLinguas, DadosMassasTerra, DadosVizinhos, DadosOceanosPolos, VisualizacaoGlobo, VisualizacaoAnimacao, InterfaceInteracao, InterfaceCartaoPais, InterfaceFiltros, InterfaceBusca, InterfaceBotoes, VisualizacaoFronteiras, VisualizacaoWebgl, VisualizacaoTextura, NucleoUtilitarios, VisualizacaoMarcadores, InterfaceCartaoDetalhes, InterfaceFiltrosDesfazer, InterfaceListaProximos, InterfaceFiltrosFavoritos, InterfacePasseio, InterfaceDistancia, VisualizacaoDiaNoite, VisualizacaoCarregamento, RecursosExportar, TreinoEstado, TreinoDominio, TreinoPartida, TreinoDica, TreinoPerguntas, TreinoEstatisticas, TreinoDestaqueEscopo, TreinoEscopo, InterfaceMenu, DadosEstadosBrasil, BrasilModoEstados, BrasilCartaoEstado, BrasilFiltros, BrasilImportarContornos, BrasilMenu, AppUltimaVisao, VisualizacaoMapa2d, TreinoProgressao, AppInicio, NucleoGeo, VisualizacaoEnquadramento, VisualizacaoEstados, VisualizacaoGanchos, VisualizacaoSelo, InterfaceGanchos, NucleoEventos, TreinoToques, VisualizacaoProjecao, VisualizacaoTela, NucleoSom];
const api = {};
for (const mod of modulos) {
  for (const nome of Object.keys(mod)) {
    if (nome !== 'iniciar') Object.defineProperty(api, nome, { get: () => mod[nome], enumerable: true });
  }
}
window.__geoTotal = api;
