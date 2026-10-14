/**
 * @arquivo js/dados/zonas-climaticas.js
 * Camada: Dados
 * Linhas e faixas das zonas climáticas (desertos, florestas e relevo estão em regioes-naturais.js).
 */

/** Paralelos que dividem as zonas climáticas (latitude, nome). */
const LINHAS_ZONAS = [
  [66.56,'Círculo Polar Ártico'],[23.44,'Trópico de Câncer'],[0,'Equador'],
  [-23.44,'Trópico de Capricórnio'],[-66.56,'Círculo Polar Antártico']
];
/** Faixas entre as linhas: [de, até, nome, cor]. */
const FAIXAS_ZONAS = [
  [66.56,90,'Zona polar norte','#bfe3ff'],[23.44,66.56,'Zona temperada norte','#9be38f'],
  [-23.44,23.44,'Zona tropical','#ffb347'],[-66.56,-23.44,'Zona temperada sul','#9be38f'],[-90,-66.56,'Zona polar sul','#bfe3ff']
];

export { FAIXAS_ZONAS, LINHAS_ZONAS };
