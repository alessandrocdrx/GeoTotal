/**
 * @arquivo js/dados/micronacoes.js
 * Camada: Dados
 * Micronações: lugares que se declaram países, mas que nenhum país da ONU reconhece. Entram no jogo
 * como uma categoria própria ("Micronações", nos lugares do 🏷️ e do menu ⋯) e no modo Lugares especiais.
 * Linha no formato de paises.js: nome|"capital"|lat|lng|região|sub-região|observação|código|mic
 * (códigos Y? são do geoTotal, não oficiais). Informações públicas até 2025: micronações mudam rápido.
 */

const RAW_MIC = `
Liberland|Liberpolis (planejada)|45.7766|18.8758|4|Europa Centro-Oriental|Micronação proclamada em 2015 numa faixa de terra no Danúbio que nem a Croácia nem a Sérvia reivindicam|YL|mic
Sealand|Plataforma Roughs Tower|51.8951|1.4806|4|Europa Ocidental|Micronação numa antiga plataforma militar no Mar do Norte, perto da Inglaterra|YS|mic
Seborga|Seborga|43.8256|7.6944|4|Europa Meridional|Vila italiana que diz nunca ter entrado oficialmente na Itália; para a Itália, é um município comum|YG|mic
Molossia|Baughston|39.2937|-119.5906|2|América do Norte|Micronação num terreno no estado de Nevada, Estados Unidos, criada como brincadeira em 1977|YM|mic
Ladônia|Sem capital (esculturas Nimis e Arx)|56.2996|12.4747|4|Europa Setentrional|Micronação criada por um artista em volta das suas esculturas numa reserva natural da Suécia|YD|mic`;

/* detalhes do cartão: fatos, história em parágrafos, curiosidades e o site oficial */
const INFO_MIC = {
  YL:{
    nomeOficial:'República Livre de Liberland',perto:['Entre',['HR','RS']],
    fatos:[['📅 Proclamada','13 de abril de 2015'],['👤 Fundador','Vít Jedlička (tcheco)'],['📐 Território','~7 km² (Gornja Siga)'],['🗣️ Lema','"Viver e deixar viver"'],['💰 Moeda','Liberland Merit (LLM), digital'],['🏛️ Governo','República com governo mínimo'],['👥 Moradores','Nenhum permanente'],['🌍 Reconhecimento','Nenhum país da ONU']],
    historia:[
      'Croácia e Sérvia discordam de onde passa a fronteira no rio Danúbio. A Sérvia segue o curso atual do rio; a Croácia, o curso antigo, dos mapas do século XIX. Com isso, sobram alguns pedaços de terra que nenhum dos dois reivindica.',
      'Em 13 de abril de 2015, o político tcheco Vít Jedlička fincou uma bandeira no maior desses pedaços, Gornja Siga, com uns 7 km² de mata à beira do rio, e proclamou a República Livre de Liberland.',
      'A ideia é um país com o mínimo de governo: impostos voluntários, muita liberdade econômica e uso de tecnologia blockchain na administração e na moeda, o Liberland Merit.',
      'Na prática, a polícia da Croácia controla o acesso pela margem do rio, e ninguém mora lá. Mesmo assim, Liberland tem constituição, governo, eleições pela internet e muitos milhares de pessoas que pediram a cidadania pelo site.',
    ],
    curiosidades:[
      'O lema em latim é "Vivere et vivere sinere": viver e deixar viver.',
      'A capital planejada se chama Liberpolis, mas ainda não existe.',
      'Visitantes que tentaram chegar ao território já foram parados pela polícia croata.',
      'É um dos casos mais conhecidos de "terra nullius" (terra de ninguém) do mundo.',
    ],
    site:'https://liberland.org',
  },
  YS:{
    nomeOficial:'Principado de Sealand',perto:['Na costa de',['GB']],
    fatos:[['📅 Declarado','2 de setembro de 1967'],['👤 Fundador','Paddy Roy Bates (britânico)'],['📐 Território','~0,004 km² (uma plataforma)'],['🗣️ Lema','"E Mare Libertas" (Do mar, liberdade)'],['👥 Moradores','Poucos, às vezes nenhum'],['🌍 Reconhecimento','Nenhum país da ONU']],
    historia:[
      'Na Segunda Guerra Mundial, o Reino Unido construiu plataformas com canhões antiaéreos no Mar do Norte. Uma delas, a Roughs Tower, fica a uns 12 km da costa da Inglaterra.',
      'Em 1967, o ex-major Paddy Roy Bates ocupou a plataforma abandonada e declarou a independência do Principado de Sealand, com ele como príncipe.',
      'Em 1968, um tribunal britânico disse que não podia julgar o caso porque a plataforma ficava fora das águas do Reino Unido na época.',
      'Em 1978, um grupo tentou tomar a plataforma enquanto a família estava fora; os Bates a retomaram dias depois. Hoje o príncipe é Michael Bates, filho de Roy.',
    ],
    curiosidades:[
      'Sealand vende títulos de nobreza pela internet: dá para virar lorde ou barão de Sealand.',
      'Tem bandeira, hino, selos e moedas próprias, todos para colecionadores.',
      'É provavelmente o menor "país" do mundo que se diz independente.',
    ],
    site:'https://www.sealandgov.org',
  },
  YG:{
    nomeOficial:'Principado de Seborga',perto:['Dentro de',['IT']],
    fatos:[['📍 Onde','Ligúria, Itália, perto de Sanremo'],['👥 Moradores','~300'],['💰 Moeda','Luigino (simbólico)'],['🌍 Reconhecimento','Nenhum país; é um município italiano']],
    historia:[
      'Seborga é uma vila no alto das colinas da Ligúria, no noroeste da Itália.',
      'Nos anos 1960, um morador, Giorgio Carbone, passou a defender que Seborga nunca entrou oficialmente na Itália, por causa de uma suposta falha nos documentos de uma venda de 1729. Foi eleito "príncipe Giorgio I" pelos moradores.',
      'Desde então, a vila tem príncipe eleito, bandeira, moeda simbólica e até guardas de fronteira, mais como tradição e atração turística. Para a Itália, Seborga é um município comum.',
    ],
    curiosidades:[
      'A moeda, o luigino, é vendida como lembrança para turistas.',
      'Os príncipes de Seborga são eleitos pelos moradores.',
    ],
  },
  YM:{
    nomeOficial:'República de Molossia',perto:['Dentro de',['US']],
    fatos:[['📅 Criada','1977'],['👤 Presidente','Kevin Baugh'],['📍 Onde','Perto de Dayton, Nevada (EUA)'],['📐 Território','Um terreno de uns 5 mil m²'],['💰 Moeda','Valora'],['🌍 Reconhecimento','Nenhum país']],
    historia:[
      'Molossia começou em 1977 como brincadeira de dois amigos adolescentes nos Estados Unidos. Um deles, Kevin Baugh, levou a ideia adiante e se tornou o "presidente".',
      'O "país" é o terreno da casa dele no deserto de Nevada, com placas de fronteira, correio, bandeira e até uma "agência espacial".',
    ],
    curiosidades:[
      'O valor da moeda, a valora, foi atrelado ao de massa de biscoito pronta.',
      'Recebe turistas com visita marcada, que ganham carimbo no passaporte.',
    ],
    site:'https://www.molossia.org',
  },
  YD:{
    nomeOficial:'Reino-República de Ladônia',perto:['Dentro de',['SE']],
    fatos:[['📅 Criada','1996'],['👤 Fundador','Lars Vilks (artista sueco)'],['📍 Onde','Reserva de Kullaberg, sul da Suécia'],['📐 Território','~1 km²'],['👥 Moradores','Nenhum (milhares de "cidadãos" online)'],['🌍 Reconhecimento','Nenhum país']],
    historia:[
      'O artista Lars Vilks construiu na praia de uma reserva natural sueca duas grandes esculturas, Nimis (de madeira trazida pelo mar) e Arx (de pedra). As autoridades quiseram derrubá-las, e começou uma longa briga na justiça.',
      'Em 1996, Vilks declarou a área em volta das esculturas como um país independente, a Ladônia, em parte como arte e protesto.',
    ],
    curiosidades:[
      'A cidadania é de graça pela internet, e a Ladônia tem milhares de "cidadãos" no mundo.',
      'Em 2001, chegaram milhares de pedidos de cidadania do Paquistão, de pessoas que acharam que fosse um país de verdade.',
    ],
    site:'https://www.ladonia.org',
  },
};

export { INFO_MIC, RAW_MIC };
