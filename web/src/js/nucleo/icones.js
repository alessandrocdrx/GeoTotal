/**
 * @arquivo js/nucleo/icones.js
 * Camada: Núcleo
 * Ícones de traço (SVG) dos botões do topo e do mapa: iguais em qualquer celular, ao contrário
 * dos emoji, que mudam de desenho e de tamanho de um aparelho para outro. O botão guarda o nome
 * do ícone atual em data-ico (é isso que os testes conferem).
 */

/* desenhos numa grade 24×24, só com traço (a cor vem do texto do botão) */
const DESENHOS = {
  som: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.5 6.2a8.3 8.3 0 0 1 0 11.6"/>',
  mudo: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  'dia-noite': '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
  satelite: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 16l5-4.5 4 3.5 3-2.5 6 5"/><circle cx="16" cy="9" r="1.6"/>',
  atlas: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.5-.7 1.5-1.5 0-1.1-1-1.5-1-2.5s.8-1.7 1.8-1.7h2.2a4 4 0 0 0 4-4c0-4.1-3.8-7.3-8.5-7.3z"/><circle cx="7.6" cy="11.2" r="1.1" fill="currentColor"/><circle cx="10" cy="7.4" r="1.1" fill="currentColor"/><circle cx="14.6" cy="7.6" r="1.1" fill="currentColor"/>',
  camadas: '<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 12.6l9 4.8 9-4.8"/><path d="M3 16.4l9 4.8 9-4.8" opacity=".55"/>',
  mais: '<circle cx="5.5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18.5" cy="12" r="1.5" fill="currentColor"/>',
  aproximar: '<path d="M12 5v14M5 12h14"/>',
  afastar: '<path d="M5 12h14"/>',
  giro: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.2h-4.2"/>',
  passeio: '<path d="M8.5 5.5l10 6.5-10 6.5z"/>',
  parar: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
  mapa: '<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  globo: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.3-3.8-8.5s1.2-6.1 3.8-8.5z"/>',
};

/** SVG pronto do ícone (decorativo: o nome do botão fica no aria-label). */
function icone(nome) {
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (DESENHOS[nome] || '') + '</svg>';
}

/** Troca o ícone de um botão (não redesenha se já for o mesmo). */
function pintarIcone(el, nome) {
  if (!el || el.dataset.ico === nome && el.querySelector('svg.ico')) return;
  el.dataset.ico = nome;
  el.innerHTML = icone(nome);
}

/** Desenha os ícones de todos os botões marcados com data-ico no HTML. */
function iniciar() {
  Array.prototype.forEach.call(document.querySelectorAll('[data-ico]'), function (el) { pintarIcone(el, el.dataset.ico); });
}

export { icone, iniciar, pintarIcone };
