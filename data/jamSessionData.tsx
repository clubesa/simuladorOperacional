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
            priceMatrix: { 1: 362.84, 2: 689.39, 3: 979.67, 4: 1233.65, 5: 1451.36 }
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
export const categorias = [
    {
        id: 'cat1', name: 'Tecnologia', components: [
            { id: 'c1', name: 'Robótica', icon: '🤖' },
            { id: 'c5', name: 'Programação', icon: '💻' },
            { id: 'c19', name: 'Game Design', icon: '🎮' },
            { id: 'c20', name: 'Modelagem 3D', icon: '🧊' },
        ]
    },
    { id: 'cat2', name: 'Marcenaria', components: [{ id: 'c11', name: 'Marcenaria', icon: '🪚' }] },
    {
        id: 'cat3', name: 'Circo', components: [
            { id: 'c21', name: 'Circuitos Acrobáticos', icon: '🤸' },
            { id: 'c22', name: 'Calistenia', icon: '💪' },
        ]
    },
    {
        id: 'cat4', name: 'Alimentação', components: [
            { id: 'c23', name: 'Panificação', icon: '🥖' },
            { id: 'c12', name: 'Culinária', icon: '🧑‍🍳' },
            { id: 'c24', name: 'Horta', icon: '🌱' },
        ]
    },
    { id: 'cat5', name: 'Cidade', components: [{ id: 'c25', name: 'CidadeVamos', icon: '🏙️' }] },
    {
        id: 'cat6', name: 'Esportes', components: [
            { id: 'c26', name: 'Arquearia Meditativa', icon: '🏹' },
            { id: 'c9', name: 'Práticas Esportivas', icon: '⚽' },
        ]
    },
    { id: 'cat7', name: 'Quintais', components: [{ id: 'c15', name: 'Brincar Livre', icon: '🪁' }] },
    { id: 'cat8', name: 'Mindfulness', components: [{ id: 'c27', name: 'Pequenos Meditadores', icon: '🧘' }] },
    {
        id: 'cat9', name: 'Ateliês', components: [
            { id: 'c8', name: 'Artes', icon: '🎨' },
            { id: 'c6', name: 'Teatro', icon: '🎭' },
            { id: 'c7', name: 'Música', icon: '🎸' },
        ]
    },
    { id: 'cat10', name: 'Drone Educativo', components: [{ id: 'c28', name: 'Drone Lab', icon: '🛸' }] },
    { id: 'cat11', name: 'Xadrez', components: [{ id: 'c3', name: 'Xadrez para a Vida', icon: '♟️' }] },
    { id: 'cat12', name: 'Gestão Pedagógica', components: [{ id: 'c10', name: 'Supervisão', icon: '👀' }] },
];
export const allComponents = categorias.flatMap(cat => cat.components);