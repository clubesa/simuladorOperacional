export const productDataBySchool = {
    'Gara': [
        {
            id: 'g1',
            name: 'Gara - Integral + almoço + 1 lanche (8h - 13h)',
            type: 'window',
            startSlot: 8,
            endSlot: 13,
            priceMatrix: { 1: 636.16, 2: 1191.04, 3: 1581.86, 4: 1879.23, 5: 2060.75 }
        },
        {
            id: 'g2',
            name: 'Gara - Semi integral + almoço (10h-13h - manhã)',
            type: 'window',
            startSlot: 10,
            endSlot: 13,
            priceMatrix: { 1: 500.10, 2: 957.70, 3: 1275.30, 4: 1574.89, 5: 1790.00 }
        },
        {
            id: 'g3',
            name: 'Gara - Semi Integral + almoço + 1 lanche (12h - 15h30)',
            type: 'window',
            startSlot: 12,
            endSlot: 16, // Ends before 16:00
            priceMatrix: { 1: 529.94, 2: 1012.39, 3: 1348.88, 4: 1600.87, 5: 1817.58 }
        },
        {
            id: 'g4',
            name: 'Gara - Integral + almoço + 1 lanche (12h - 17h - tarde)',
            type: 'window',
            startSlot: 12,
            endSlot: 17,
            priceMatrix: { 1: 691.07, 2: 1322.30, 3: 1755.99, 4: 2088.31, 5: 2291.40 }
        },
        {
            id: 'g5',
            name: 'Gara - Integral + almoço + 2 lanches (12h - 18h)',
            type: 'window',
            startSlot: 12,
            endSlot: 18,
            priceMatrix: { 1: 794.90, 2: 1520.40, 3: 2020.86, 4: 2401.31, 5: 2633.60 }
        },
        {
            id: 'g6',
            name: 'Gara - Hora extra + 1 lanche (17h - 18h)',
            type: 'window',
            startSlot: 17,
            endSlot: 18,
            priceMatrix: { 1: 449.97, 2: 864.11, 3: 1147.77, 4: 1417.77, 5: 1610.75 }
        }
    ],
    'Builders': [
        {
            id: 'b-i1',
            name: 'Infantil - Extra + almoço + 1 lanche (8h-13h)',
            type: 'window',
            startSlot: 8,
            endSlot: 13,
            priceMatrix: { 1: 723.53, 2: 1396.36, 3: 1859.24, 4: 2207.55, 5: 2423.61 }
        },
        {
            id: 'b-i2',
            name: 'Infantil - Extra + almoço (10h-13h)',
            type: 'window',
            startSlot: 10,
            endSlot: 13,
            priceMatrix: { 1: 586.03, 2: 1122.98, 3: 1489.89, 4: 1837.17, 5: 2092.09 }
        },
        {
            id: 'b-i3',
            name: 'Infantil - Extra + almoço + 1 lanche (12h-15h30)',
            type: 'window',
            startSlot: 12,
            endSlot: 16,
            priceMatrix: { 1: 617.07, 2: 1186.18, 3: 1574.51, 4: 1868.10, 5: 2124.68 }
        },
        {
            id: 'b-i4',
            name: 'Infantil - Extra + almoço + 2 lanches (12h-17h30)',
            type: 'window',
            startSlot: 12,
            endSlot: 18,
            priceMatrix: { 1: 806.84, 2: 1547.14, 3: 2056.42, 4: 2439.66, 5: 2677.48 }
        },
        {
            id: 'b-i5',
            name: 'Infantil - Extra + 1 lanche (15h-16h30)',
            type: 'window',
            startSlot: 15,
            endSlot: 17,
            priceMatrix: { 1: 340.47, 2: 617.10, 3: 867.49, 4: 1048.64, 5: 1223.82 }
        },
        {
            id: 'b-i6',
            name: 'Infantil - Extra + 1 lanche (15h-17h30)',
            type: 'window',
            startSlot: 15,
            endSlot: 18,
            priceMatrix: { 1: 449.97, 2: 815.57, 3: 1146.49, 4: 1385.90, 5: 1617.42 }
        },
        {
            id: 'b-f1',
            name: 'Fundamental - B1 (max 2/dia)',
            type: 'component',
            maxPerDay: 2,
            priceMatrix: { 1: 362.84, 2: 689.39, 3: 979.67, 4: 1233.65, 5: 1451.36, 6: 1687.20, 7: 1917.61, 8: 2133.49, 9: 2334.87, 10: 2530.80 }
        },
        {
            id: 'b-f2',
            name: 'Fundamental - B2 (max 1/dia)',
            type: 'component',
            maxPerDay: 1,
            priceMatrix: { 1: 362.84, 2: 689.39, 3: 979.67, 4: 1233.65, 5: 1451.36 }
        }
    ]
};

export const eixosPedagogicos = [
    {
        id: 'eixo1',
        name: 'Corpo e Movimento',
        intention: 'Valorizar o corpo como instrumento de expressão, vitalidade e cooperação. Desenvolver habilidades motoras, consciência corporal e espírito coletivo por meio de práticas lúdicas, artísticas e esportivas.',
        components: [
            { id: 'c1', name: 'Circuito Acrobático Circense', experience: 'Vivências de equilíbrio, acrobacias, cooperação e ludicidade.', icon: '🤸' },
            { id: 'c2', name: 'Práticas Esportivas Coletivas', experience: 'Futebol cooperativo, queimada, mini-vôlei, basquete lúdico, handebol infantil, corridas de revezamento, jogos cooperativos...', icon: '⚽' },
            { id: 'c3', name: 'Práticas Esportivas Urbanas', experience: 'Skate infantil, patins/patinete, slackline, circuitos de bike...', icon: '🛹' },
        ]
    },
    {
        id: 'eixo2',
        name: 'Arte, Cultura e Expressão',
        intention: 'Cultivar a imaginação, a oralidade e a expressão simbólica, valorizando a diversidade cultural e o encantamento artístico.',
        components: [
            { id: 'c4', name: 'Teatro', experience: 'Expressão cênica, improvisação e criação de personagens.', icon: '🎭' },
            { id: 'c5', name: 'Dança e Percussão', experience: 'Integração de ritmo, música e movimento, ampliando a expressão coletiva.', icon: '🥁' },
            { id: 'c6', name: 'Contação de Histórias', experience: 'Narrativas orais que encantam e fortalecem a imaginação.', icon: '📚' },
            { id: 'c7', name: 'Brincadeiras Musicais', experience: 'Valorização de tradições, cantos, ritmos e brincadeiras brasileiras.', icon: '🎶' },
            { id: 'c8', name: 'Improvisação e RPG', experience: 'Liberdade criativa em movimento, escuta corporal e criação de narrativas coletivas.', icon: '🐉' },
        ]
    },
    {
        id: 'eixo3',
        name: 'Manualidades',
        intention: 'Fortalecer a experiência sensorial, a autonomia e o prazer do fazer manual. Desenvolver coordenação fina e criatividade.',
        components: [
            { id: 'c9', name: 'Marcenaria Criativa', experience: 'Experimentação com madeira e construção de objetos com ferramentas seguras.', icon: '🪚' },
            { id: 'c10', name: 'Pães Artesanais', experience: 'Experiência manual e coletiva, do amassar à partilha.', icon: '🥖' },
            { id: 'c11', name: 'Origami', experience: 'Delicadeza, concentração e criação manual por meio da dobra.', icon: '🦢' },
            { id: 'c12', name: 'Modelagem 3D', experience: 'Criação em novas linguagens, conectando o físico ao digital.', icon: '🧊' },
        ]
    },
    {
        id: 'eixo4',
        name: 'Jogos, Lógica e Estratégia',
        intention: 'Estimular raciocínio lógico, tomada de decisão, cooperação e criatividade, explorando jogos analógicos, digitais e narrativos.',
        components: [
            { id: 'c13', name: 'Criação de Jogos de Tabuleiro', experience: 'Concepção, prototipagem e jogabilidade.', icon: '🎲' },
            { id: 'c14', name: 'Criação de Jogos Digitais', experience: 'Lógica de programação criativa, storytelling e interatividade.', icon: '🎮' },
            { id: 'c15', name: 'Xadrez para a Vida', experience: 'Desenvolvimento de pensamento estratégico e paciência.', icon: '♟️' },
            { id: 'c16', name: 'Robótica Sustentável', experience: 'Montagem, lógica e resolução de problemas de forma lúdica.', icon: '🤖' },
        ]
    },
    {
        id: 'eixo5',
        name: 'Cuidar de si, do outro e do mundo',
        intention: 'Favorecer o autoconhecimento, o equilíbrio emocional e a visão de futuro, integrando competências de vida e bem-estar.',
        components: [
            { id: 'c17', name: 'Mindfulness e Yoga', experience: 'Práticas de atenção plena, respiração e consciência corporal.', icon: '🧘' },
            { id: 'c18', name: 'Empreendedorismo', experience: 'Vivências de criação, liderança e cooperação.', icon: '💡' },
            { id: 'c19', name: 'Educação Financeira', experience: 'Introdução lúdica a conceitos de planejamento e cuidado com recursos.', icon: '💸' },
        ]
    },
    {
        id: 'eixo6',
        name: 'Cidade e Cultura Viva',
        intention: 'Valorizar a cidade como espaço educador e a cultura como expressão de pertencimento, memória e diversidade.',
        components: [
            { id: 'c20', name: 'Cozinhas e Infâncias', experience: 'Receitas ligadas à cultura e às memórias familiares (Educação Alimentar e Ambiental).', icon: '🧑‍🍳' },
            { id: 'c21', name: 'Projeto CidadeVamos', experience: 'Cartografias afetivas e mapeamento de espaços pelo entorno.', icon: '🏙️' },
            { id: 'c22', name: 'Fotografia', experience: 'Registro do olhar da criança e produção de sentido pela imagem.', icon: '📷' },
            { id: 'c23', name: 'Cultura Urbana', experience: 'Unindo esporte, cultura e música (roda de capoeira, parkour, danças de rua...).', icon: '🎤' },
        ]
    },
];

export const allComponents = eixosPedagogicos.flatMap(eixo => eixo.components);

// Manter a exportação 'categorias' com o novo nome para evitar quebras em outros componentes
// que ainda não foram atualizados para usar 'eixosPedagogicos'.
export const categorias = eixosPedagogicos;