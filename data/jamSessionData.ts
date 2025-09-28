export interface Componente {
    id: string;
    name: string;
    icon: string;
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

export const componentes: Componente[] = [
    { id: 'c1', name: 'Robótica', icon: '🤖' },
    { id: 'c2', name: 'Circo', icon: '🎪' },
    { id: 'c3', name: 'Xadrez', icon: '♟️' },
    { id: 'c4', name: 'Ioga', icon: '🧘' },
    { id: 'c5', name: 'Programação', icon: '💻' },
    { id: 'c6', name: 'Teatro', icon: '🎭' },
    { id: 'c7', name: 'Música', icon: '🎸' },
    { id: 'c8', name: 'Artes', icon: '🎨' },
    { id: 'c9', name: 'Esportes', icon: '⚽' },
    { id: 'c10', name: 'Supervisão', icon: '👀' },
    { id: 'c11', name: 'Marcenaria', icon: '🪚' },
    { id: 'c12', name: 'Culinária', icon: '🧑‍🍳' },
    { id: 'c13', name: 'Tecnologia', icon: '🔬' },
    { id: 'c14', name: 'Cidade', icon: '🏙️' },
    { id: 'c15', name: 'Brincar', icon: '🪁' },
    { id: 'c16', name: 'Mindfulness', icon: '🧠' },
    { id: 'c17', name: 'Atelies', icon: '🎨' },
    { id: 'c18', name: 'Drone Educativo', icon: '🛸' },
];