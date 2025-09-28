export interface Componente {
    id: string;
    name: string;
    icon: string;
}

export interface Categoria {
    id: string;
    name: string;
    components: Componente[];
}

export interface Produto {
    id: string;
    name: string;
    startSlot: number;
    endSlot: number;
    priceMatrix: { [key: number]: number }; // frequency -> price
}

export interface Schedule {
    [day: string]: {
        [slot: string]: string; // slot -> componentId
    };
}

// Data based on Gara's price table
export const produtos: Produto[] = [
    {
        id: 'p1',
        name: 'Integral + almoço + 1 lanche (8h - 13h)',
        startSlot: 8,
        endSlot: 13,
        priceMatrix: {
            1: 636.16,
            2: 1191.04,
            3: 1581.86,
            4: 1879.23,
            5: 2060.75,
        }
    },
    {
        id: 'p2',
        name: 'Semi integral + almoço (10h-13h - manhã)',
        startSlot: 10,
        endSlot: 13,
        priceMatrix: {
            1: 500.10,
            2: 957.70,
            3: 1275.30,
            4: 1574.89,
            5: 1790.00,
        }
    },
    {
        id: 'p3',
        name: 'Semi Integral + almoço + 1 lanche (12h - 15h30 - tarde)',
        startSlot: 12,
        endSlot: 16, // Ends before 16:00
        priceMatrix: {
            1: 529.94,
            2: 1012.39,
            3: 1348.88,
            4: 1600.87,
            5: 1817.58,
        }
    },
    {
        id: 'p4',
        name: 'Integral + almoço + 1 lanche (12h - 17h - tarde)',
        startSlot: 12,
        endSlot: 17,
        priceMatrix: {
            1: 691.07,
            2: 1322.30,
            3: 1755.99,
            4: 2088.31,
            5: 2291.40,
        }
    },
     {
        id: 'p5',
        name: 'Integral + almoço + 2 lanches (12h - 18h)',
        startSlot: 12,
        endSlot: 18,
        priceMatrix: {
            1: 794.90,
            2: 1520.40,
            3: 2020.86,
            4: 2401.31,
            5: 2633.60,
        }
    }
];

export const categorias: Categoria[] = [
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

export const allComponents: Componente[] = categorias.flatMap(cat => cat.components);