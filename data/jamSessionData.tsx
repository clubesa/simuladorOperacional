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
            id: 'b-i1', name: 'Builders Infantil - Acolhida Manhã (8h-10h)', type: 'window',
            startSlot: 8, endSlot: 10, priceMatrix: { 1: 400, 2: 780, 3: 1140, 4: 1480, 5: 1800 }
        },
        {
            id: 'b-i2', name: 'Builders Infantil - Meio Período Manhã (8h-12h)', type: 'window',
            startSlot: 8, endSlot: 12, priceMatrix: { 1: 650, 2: 1250, 3: 1800, 4: 2300, 5: 2750 }
        },
        {
            id: 'b-i3', name: 'Builders Infantil - Integral Manhã (8h-13h)', type: 'window',
            startSlot: 8, endSlot: 13, priceMatrix: { 1: 750, 2: 1450, 3: 2100, 4: 2700, 5: 3250 }
        },
        {
            id: 'b-i4', name: 'Builders Infantil - Acolhida Tarde (13h-15h)', type: 'window',
            startSlot: 13, endSlot: 15, priceMatrix: { 1: 400, 2: 780, 3: 1140, 4: 1480, 5: 1800 }
        },
        {
            id: 'b-i5', name: 'Builders Infantil - Meio Período Tarde (13h-17h)', type: 'window',
            startSlot: 13, endSlot: 17, priceMatrix: { 1: 650, 2: 1250, 3: 1800, 4: 2300, 5: 2750 }
        },
        {
            id: 'b-i6', name: 'Builders Infantil - Integral Tarde (12h-18h)', type: 'window',
            startSlot: 12, endSlot: 18, priceMatrix: { 1: 850, 2: 1650, 3: 2400, 4: 3100, 5: 3750 }
        },
        {
            id: 'b-f1', name: 'Builders Fundamental - Avulso', type: 'component',
            priceMatrix: { 1: 350.00, 2: 680.00, 3: 990.00, 4: 1280.00, 5: 1550.00 }
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
