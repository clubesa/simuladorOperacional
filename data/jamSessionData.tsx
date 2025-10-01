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
            { id: 'c1', name: 'Circuito Acrobático Circense', experience: 'Vivências de equilíbrio, acrobacias, cooperação e ludicidade.', icon: '🤸', ficha: {
                intencionalidade: 'Favorecer a consciência corporal, o equilíbrio e a cooperação por meio da linguagem do circo, explorando o corpo como potência criativa, lúdica e coletiva. A experiência desenvolve autonomia, coragem e confiança, enquanto resgata uma arte popular que valoriza diversidade, brasilidade e imaginação.',
                temasBncc: '• Temas transversais: Cultura, diversidade, saúde, ética, ludicidade.\n• BNCC:\n\t• Competência Geral 3: Repertório cultural.\n\t• Competência Geral 8: Autoconhecimento e autocuidado.\n\t• Campos de Experiência (EI): “O corpo, gestos e movimentos” e “Traços, sons, cores e formas”.\n\t• EF: Educação Física (habilidades EF35EF01, EF15EF02).',
                idades: '6 a 14 anos (com adaptações para cada faixa etária).',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 15 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Sim, 1 assistente pedagógico é recomendado para garantir segurança durante os exercícios e manejo de equipamentos.',
                recursosEscola: 'Quadra, pátio ou gramado amplo, com espaço livre de obstáculos.\nPé-direito alto em caso de uso interno.',
                recursosLabirintar: 'Educador empreendedor circense, kit de malabares (bolas, claves, fitas), slackline, trapézio de solo, trave de equilíbrio portátil, colchonetes.',
                protocolosSeguranca: '• Supervisão contínua em todos os aparelhos.\n• Uso obrigatório de colchonetes em atividades de altura.\n• Adaptação das técnicas conforme faixa etária.\n• Circuitos organizados com rotatividade e pausas.',
                materialidades: 'Trapézio de solo, slackline, trave de equilíbrio, bolas, claves, fitas de malabares, cordas, colchonetes, cones.',
                experienciaEstetica: 'Vivência do corpo como arte em movimento; encantamento pelo imaginário circense; prazer lúdico e estético da criação coletiva.',
                dinamicaAulas: '1. Acolhida e aquecimento lúdico (5–10 min)\n2. Introdução a um elemento circense do dia\n3. Experimentação guiada em circuito com diferentes estações\n4. Momento coletivo de demonstração e apreciação\n5. Fechamento com roda de conversa sobre descobertas',
                produtoFinal: 'Mostra circense ao final do semestre, com circuito aberto para famílias e comunidade escolar.',
                documentacao: '• Registro fotográfico e audiovisual de ensaios e apresentações\n• Relatos reflexivos das crianças (oral, desenho, escrita)\n• Relatório narrativo automatizado via Nina com fotos e principais conquistas de cada encontro'
            }},
            { id: 'c2', name: 'Práticas Esportivas Coletivas', experience: 'Futebol cooperativo, queimada, mini-vôlei, basquete lúdico, handebol infantil, corridas de revezamento, jogos cooperativos...', icon: '⚽', ficha: {
                intencionalidade: 'Desenvolver o espírito de equipe, a cooperação e a ética no jogo, utilizando diversas modalidades esportivas como ferramenta para o desenvolvimento motor, social e emocional.',
                temasBncc: '• Temas transversais: Saúde, ética, pluralidade cultural.\n• BNCC: Educação Física (habilidades EF35EF05, EF35EF06).',
                idades: '6 a 14 anos.',
                minMaxAlunos: 'Mínimo: 8 alunos\nMáximo: 20 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório, mas recomendado para turmas maiores ou com crianças mais novas.',
                recursosEscola: 'Quadra poliesportiva ou pátio amplo.',
                recursosLabirintar: 'Educador empreendedor esportivo, bolas de diferentes modalidades, cones, coletes, arcos e materiais para circuitos.',
                protocolosSeguranca: '• Aquecimento e alongamento no início das aulas.\n• Adaptação das regras para garantir a inclusão e segurança de todos.\n• Hidratação constante.',
                materialidades: 'Bolas, cones, coletes, redes, arcos, apitos.',
                experienciaEstetica: 'Alegria do movimento coletivo; a beleza da jogada cooperativa; a superação de desafios em equipe.',
                dinamicaAulas: '1. Aquecimento e integração\n2. Apresentação do esporte/jogo do dia\n3. Exercícios de fundamentos\n4. Jogo ou circuito coletivo\n5. Roda de conversa e relaxamento',
                produtoFinal: 'Festival de jogos cooperativos, onde as equipes são mistas e o objetivo é a diversão e a integração.',
                documentacao: '• Registros fotográficos das partidas e atividades.\n• Criação de "álbum de figurinhas" da turma.'
            }},
            { id: 'c3', name: 'Práticas Esportivas Urbanas', experience: 'Skate infantil, patins/patinete, slackline, circuitos de bike...', icon: '🛹', ficha: {
                intencionalidade: 'Explorar o equilíbrio, a coordenação e a coragem através de esportes urbanos, promovendo a autonomia e a superação de desafios individuais em um ambiente seguro e coletivo.',
                temasBncc: '• Temas transversais: Saúde, cultura juvenil.\n• BNCC: Educação Física (habilidades EF67EF04, EF67EF05).',
                idades: '8 a 14 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 12 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Sim, 1 assistente é fundamental para garantir a segurança.',
                recursosEscola: 'Pátio com piso liso e sem obstáculos.',
                recursosLabirintar: 'Educador empreendedor especialista, skates, capacetes, joelheiras, cotoveleiras, cones, rampas de baixa altura, slackline.',
                protocolosSeguranca: '• Uso obrigatório de todos os equipamentos de segurança (capacete, joelheira, cotoveleira).\n• Verificação prévia dos equipamentos.\n• Progressão gradual de dificuldade.',
                materialidades: 'Skate, asfalto, madeira das rampas, equipamentos de proteção, fita do slackline.',
                experienciaEstetica: 'A fluidez do movimento sobre rodas; a concentração no equilíbrio; a estética da cultura de rua (música, grafite).',
                dinamicaAulas: '1. Checagem de equipamentos e aquecimento\n2. Instrução de uma nova manobra ou técnica\n3. Prática livre supervisionada em estações\n4. Desafio coletivo lúdico\n5. Roda de conversa e alongamento',
                produtoFinal: 'Apresentação de manobras e circuito de habilidades para a comunidade escolar.',
                documentacao: '• Vídeos curtos das manobras aprendidas (slow motion).\n• Criação de um "zine" com fotos e desenhos da turma.'
            }},
        ]
    },
    {
        id: 'eixo2',
        name: 'Arte, Cultura e Expressão',
        intention: 'Cultivar a imaginação, a oralidade e a expressão simbólica, valorizando a diversidade cultural e o encantamento artístico.',
        components: [
            { id: 'c4', name: 'Teatro', experience: 'Expressão cênica, improvisação e criação de personagens.', icon: '🎭', ficha: {
                intencionalidade: 'Desenvolver a desinibição, a expressão corporal e vocal, a criatividade e a empatia por meio de jogos teatrais e da criação de cenas coletivas.',
                temasBncc: '• Temas transversais: Ética, pluralidade cultural.\n• BNCC: Arte (habilidades EF15AR18, EF15AR19).',
                idades: '7 a 14 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 16 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala ampla com espaço para movimentação, que possa ser escurecida.',
                recursosLabirintar: 'Educador empreendedor de artes cênicas, tecidos, figurinos simples, objetos de cena, caixa de som.',
                protocolosSeguranca: '• Aquecimento corporal e vocal no início das aulas.\n• Foco em exercícios que promovam a confiança e o respeito mútuo.',
                materialidades: 'O corpo, a voz, tecidos, máscaras, figurinos, luz e sombra.',
                experienciaEstetica: 'A transformação em personagem; a catarse da cena; a potência da expressão de sentimentos e ideias.',
                dinamicaAulas: '1. Roda de conversa e aquecimento\n2. Jogos de integração e improviso\n3. Exercício teatral focado (voz, corpo, personagem)\n4. Criação de pequenas cenas em grupo\n5. Apresentação e apreciação das cenas',
                produtoFinal: 'Mostra de cenas curtas criadas pelo grupo, apresentada para outras turmas ou famílias.',
                documentacao: '• Gravação em vídeo das cenas.\n• Criação de um diário de bordo do processo criativo.'
            }},
            { id: 'c5', name: 'Dança e Percussão', experience: 'Integração de ritmo, música e movimento, ampliando a expressão coletiva.', icon: '🥁', ficha: {
                intencionalidade: 'Explorar a relação entre som e movimento, desenvolvendo a consciência rítmica, a coordenação motora e a expressão cultural através de danças e ritmos brasileiros.',
                temasBncc: '• Temas transversais: Pluralidade cultural.\n• BNCC: Arte (habilidades EF15AR11, EF15AR14), Educação Física (habilidades EF15EF09).',
                idades: '6 a 14 anos.',
                minMaxAlunos: 'Mínimo: 8 alunos\nMáximo: 18 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala ampla com bom isolamento acústico e piso adequado para dança.',
                recursosLabirintar: 'Educador empreendedor de música/dança, instrumentos de percussão (tambores, chocalhos, agogôs), caixa de som.',
                protocolosSeguranca: '• Aquecimento e alongamento adequados.\n• Volume sonoro controlado para proteger a audição.',
                materialidades: 'O corpo em movimento, o som dos instrumentos, a vibração do chão.',
                experienciaEstetica: 'A pulsação do ritmo coletivo; a energia da dança; a descoberta de manifestações culturais brasileiras.',
                dinamicaAulas: '1. Aquecimento rítmico\n2. Exploração de um instrumento ou ritmo\n3. Criação de sequências de movimento\n4. Prática coletiva da dança/música\n5. Roda de relaxamento e apreciação',
                produtoFinal: 'Apresentação de uma coreografia percussiva para a comunidade escolar.',
                documentacao: '• Gravação em áudio e vídeo das criações do grupo.\n• Mapa mental coletivo sobre os ritmos aprendidos.'
            }},
            { id: 'c6', name: 'Contação de Histórias', experience: 'Narrativas orais que encantam e fortalecem a imaginação.', icon: '📚', ficha: {
                intencionalidade: 'Ampliar o repertório cultural e a imaginação, desenvolver a escuta atenta, a oralidade e o prazer pela leitura através de vivências lúdicas com narrativas da literatura mundial e da tradição oral.',
                temasBncc: '• Temas transversais: Pluralidade cultural, ética.\n• BNCC: Língua Portuguesa (habilidades EF15LP15, EF15LP19).',
                idades: '4 a 10 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 15 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Biblioteca, sala aconchegante com almofadas ou tapetes.',
                recursosLabirintar: 'Educador empreendedor contador de histórias, livros, fantoches, tecidos, pequenos objetos cênicos.',
                protocolosSeguranca: '• Ambiente seguro e acolhedor para a expressão de ideias e sentimentos.',
                materialidades: 'A voz, o livro, fantoches, dedoches, tecidos, objetos que se transformam.',
                experienciaEstetica: 'O encantamento da narrativa; a viagem pela imaginação; a conexão afetiva com o contador e o grupo.',
                dinamicaAulas: '1. Roda de acolhida e "esquenta-ouvidos"\n2. Contação da história principal com recursos lúdicos\n3. Atividade criativa baseada na história (desenho, modelagem, reconto)\n4. Roda de partilha das criações',
                produtoFinal: 'Festival de contação de histórias, onde as crianças recontam suas histórias favoritas para outras turmas.',
                documentacao: '• Gravações em áudio dos recontos das crianças.\n• Varal com os desenhos e produções inspirados nas histórias.'
            }},
            { id: 'c7', name: 'Brincadeiras Musicais', experience: 'Valorização de tradições, cantos, ritmos e brincadeiras brasileiras.', icon: '🎶', ficha: {
                intencionalidade: 'Resgatar e valorizar o patrimônio cultural imaterial brasileiro, desenvolvendo a musicalidade, a memória e a socialização por meio de cantigas e brincadeiras de roda.',
                temasBncc: '• Temas transversais: Pluralidade cultural.\n• BNCC: Arte (habilidades EF15AR14), Educação Física (habilidades EF15EF08).',
                idades: '4 a 8 anos.',
                minMaxAlunos: 'Mínimo: 8 alunos\nMáximo: 20 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Pátio, quadra ou sala ampla.',
                recursosLabirintar: 'Educador empreendedor musicista, pequenos instrumentos (chocalhos, triângulos), lenços, elásticos grandes.',
                protocolosSeguranca: '• Espaço livre de obstáculos para as brincadeiras de movimento.',
                materialidades: 'A voz, o corpo, o círculo, instrumentos de pequena percussão, tecidos coloridos.',
                experienciaEstetica: 'A alegria contagiante da roda; a beleza das melodias tradicionais; o pertencimento a uma cultura.',
                dinamicaAulas: '1. Roda de canto e acolhida\n2. Apresentação de uma nova brincadeira cantada\n3. Vivência da brincadeira em grupo\n4. Exploração livre com instrumentos\n5. Canto de despedida',
                produtoFinal: 'Roda de brincadeiras cantadas aberta para as famílias participarem.',
                documentacao: '• "Cancioneiro" ilustrado pela turma com as músicas aprendidas.\n• Vídeos curtos das rodas.'
            }},
            { id: 'c8', name: 'Improvisação e RPG', experience: 'Liberdade criativa em movimento, escuta corporal e criação de narrativas coletivas.', icon: '🐉', ficha: {
                intencionalidade: 'Desenvolver a criatividade, a resolução de problemas em grupo, o pensamento estratégico e a oralidade, através da criação e participação em jogos de interpretação de papéis (RPG) e improvisação.',
                temasBncc: '• Temas transversais: Ética, cidadania.\n• BNCC: Língua Portuguesa (habilidades EF69LP50), Arte (habilidades EF69AR31).',
                idades: '10 a 14 anos.',
                minMaxAlunos: 'Mínimo: 4 alunos\nMáximo: 8 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala de aula com mesas que possam ser agrupadas.',
                recursosLabirintar: 'Educador empreendedor mestre de RPG, dados de RPG, fichas de personagem, mapas, miniaturas (opcional).',
                protocolosSeguranca: '• Acordos de convivência para garantir um jogo respeitoso e inclusivo.',
                materialidades: 'Dados, papel, lápis, a imaginação, a voz narrativa, mapas.',
                experienciaEstetica: 'A imersão em um mundo fantástico; a emoção de tomar decisões com consequências; a co-criação de uma saga épica.',
                dinamicaAulas: '1. Acolhida e resumo da "sessão" anterior\n2. Desenvolvimento da aventura narrada pelo mestre\n3. Momentos de tomada de decisão e interpretação dos jogadores\n4. Resolução de desafios (combate, quebra-cabeças)\n5. Fechamento e "ganchos" para a próxima sessão',
                produtoFinal: 'Conclusão de uma campanha de RPG, com um registro escrito ou gravado da aventura criada pelo grupo.',
                documentacao: '• Diário de campanha com o resumo de cada sessão.\n• Fichas e desenhos dos personagens criados pelos jogadores.'
            }},
        ]
    },
    {
        id: 'eixo3',
        name: 'Manualidades',
        intention: 'Fortalecer a experiência sensorial, a autonomia e o prazer do fazer manual. Desenvolver coordenação fina e criatividade.',
        components: [
            { id: 'c9', name: 'Marcenaria Criativa', experience: 'Experimentação com madeira e construção de objetos com ferramentas seguras.', icon: '🪚', ficha: {
                intencionalidade: 'Promover a concentração, o planejamento e a coordenação motora fina através do trabalho com madeira, desenvolvendo a confiança para transformar matéria-prima em objetos lúdicos e funcionais.',
                temasBncc: '• Temas transversais: Trabalho e consumo, meio ambiente.\n• BNCC: Arte (habilidades EF15AR04).',
                idades: '8 a 14 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 10 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Sim, 1 assistente é fundamental para garantir a segurança.',
                recursosEscola: 'Sala com boa ventilação e bancadas firmes (sala de artes ou laboratório).',
                recursosLabirintar: 'Educador empreendedor marceneiro, kit de ferramentas infantis seguras (serras de arco, martelos pequenos, lixas, furadeira manual), madeira de reuso, pregos, cola.',
                protocolosSeguranca: '• Treinamento inicial sobre o uso correto e seguro de cada ferramenta.\n• Uso de óculos de proteção (opcional, mas recomendado).\n• Supervisão constante.',
                materialidades: 'Madeira, lixa, pregos, cola, o cheiro da serragem, o som do martelo.',
                experienciaEstetica: 'A satisfação de criar algo com as próprias mãos; a beleza da textura e dos veios da madeira; a engenhosidade das construções.',
                dinamicaAulas: '1. Apresentação do projeto do dia\n2. Planejamento e desenho\n3. Corte, lixamento e montagem\n4. Acabamento e personalização\n5. Exposição e partilha dos projetos',
                produtoFinal: 'Exposição de brinquedos e objetos criados pelos alunos.',
                documentacao: '• Portfólio fotográfico "passo a passo" da construção de cada objeto.'
            }},
            { id: 'c10', name: 'Pães Artesanais', experience: 'Experiência manual e coletiva, do amassar à partilha.', icon: '🥖', ficha: {
                intencionalidade: 'Conectar as crianças com o processo de produção do alimento, desenvolvendo noções de química, biologia (fermentação) e matemática (medidas) de forma sensorial e saborosa.',
                temasBncc: '• Temas transversais: Saúde, ciência e tecnologia, trabalho e consumo.\n• BNCC: Ciências (habilidades EF02CI01), Matemática (habilidades EF01MA15).',
                idades: '6 a 12 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 12 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Sim, 1 assistente é recomendado para auxiliar na higiene e organização.',
                recursosEscola: 'Cozinha ou espaço com pia, bancadas e forno.',
                recursosLabirintar: 'Educador empreendedor culinarista, farinha, fermento, sal, água, potes, balanças, formas.',
                protocolosSeguranca: '• Higienização das mãos e dos utensílios.\n• Supervisão total durante o uso do forno.',
                materialidades: 'Farinha, água, a textura da massa, o calor do forno, o aroma do pão assando.',
                experienciaEstetica: 'A magia da transformação da massa; o aroma que preenche o ambiente; o prazer de partilhar e saborear o próprio pão.',
                dinamicaAulas: '1. Roda de conversa e higienização\n2. Medição dos ingredientes\n3. Sova e modelagem da massa\n4. Enquanto o pão cresce/assa: atividade relacionada (desenho, história)\n5. Degustação e partilha',
                produtoFinal: 'Piquenique coletivo com os diferentes pães produzidos pela turma.',
                documentacao: '• Livro de receitas ilustrado pelas crianças.\n• Registro fotográfico das etapas do processo.'
            }},
            { id: 'c11', name: 'Origami', experience: 'Delicadeza, concentração e criação manual por meio da dobra.', icon: '🦢', ficha: {
                intencionalidade: 'Desenvolver a concentração, a paciência, a precisão motora e o pensamento geométrico através da arte milenar japonesa de dobrar papel.',
                temasBncc: '• Temas transversais: Pluralidade cultural.\n• BNCC: Matemática (habilidades EF02MA13), Arte (habilidades EF15AR04).',
                idades: '7 a 14 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 15 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala de aula com mesas e boa iluminação.',
                recursosLabirintar: 'Educador empreendedor origamista, papéis de origami de diversas cores e tamanhos.',
                protocolosSeguranca: '• Nenhum protocolo específico, apenas um ambiente tranquilo.',
                materialidades: 'Papel, a precisão da dobra, as formas geométricas que surgem.',
                experienciaEstetica: 'A transformação de uma folha plana em uma forma tridimensional; a delicadeza e a beleza das criações; a serenidade do processo.',
                dinamicaAulas: '1. Apresentação da forma do dia e sua história\n2. Demonstração passo a passo da dobradura\n3. Prática individual com suporte do educador\n4. Momento de apreciar as criações\n5. Criação de um móbile ou painel coletivo',
                produtoFinal: 'Exposição de móbiles e painéis de origami, decorando um espaço da escola.',
                documentacao: '• Mostruário com todas as dobraduras aprendidas.\n• Vídeos em time-lapse do processo de dobra.'
            }},
            { id: 'c12', name: 'Modelagem 3D', experience: 'Criação em novas linguagens, conectando o físico ao digital.', icon: '🧊', ficha: {
                intencionalidade: 'Introduzir o pensamento espacial e o design de produtos de forma lúdica e criativa, utilizando softwares de modelagem 3D para criar objetos, personagens e cenários virtuais.',
                temasBncc: '• Temas transversais: Ciência e tecnologia.\n• BNCC: Arte (habilidades EF69AR33), Matemática (habilidades EF06MA17).',
                idades: '10 a 14 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 12 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Laboratório de informática com computadores e acesso à internet.',
                recursosLabirintar: 'Educador empreendedor maker/designer, acesso a softwares gratuitos de modelagem 3D (Tinkercad, Blender).',
                protocolosSeguranca: '• Orientações sobre ergonomia e tempo de tela.',
                materialidades: 'O objeto virtual, eixos X-Y-Z, vértices, arestas, faces, texturas digitais.',
                experienciaEstetica: 'A satisfação de dar forma a uma ideia no espaço virtual; a exploração de formas, volumes e texturas; a conexão com o universo dos games e animações.',
                dinamicaAulas: '1. Apresentação de um conceito ou ferramenta de modelagem\n2. Desafio de criação do dia\n3. Desenvolvimento individual do projeto\n4. "Galeria virtual" para compartilhar e apreciar os modelos\n5. Discussão sobre os próximos passos do projeto',
                produtoFinal: 'Criação de uma galeria virtual ou de um curta de animação com os modelos criados pela turma.',
                documentacao: '• Portfólio digital com imagens (renders) dos objetos modelados por cada aluno.'
            }},
        ]
    },
    {
        id: 'eixo4',
        name: 'Jogos, Lógica e Estratégia',
        intention: 'Estimular raciocínio lógico, tomada de decisão, cooperação e criatividade, explorando jogos analógicos, digitais e narrativos.',
        components: [
            { id: 'c13', name: 'Criação de Jogos de Tabuleiro', experience: 'Concepção, prototipagem e jogabilidade.', icon: '🎲', ficha: {
                intencionalidade: 'Desenvolver o pensamento sistêmico, a criatividade e a colaboração através do processo completo de design de um jogo de tabuleiro, da ideia inicial ao protótipo jogável.',
                temasBncc: '• Temas transversais: Trabalho e consumo, cidadania.\n• BNCC: Arte (habilidades EF69AR31), Língua Portuguesa (habilidades EF69LP50).',
                idades: '9 a 14 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 16 alunos (em grupos)',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala de aula com mesas grandes para trabalho em grupo.',
                recursosLabirintar: 'Educador empreendedor game designer, cartolina, canetas, dados, peões, e outros materiais de prototipagem.',
                protocolosSeguranca: '• Nenhum protocolo específico.',
                materialidades: 'Papelão, cartas, dados, miniaturas, regras escritas, o tabuleiro.',
                experienciaEstetica: 'O prazer de criar um universo com regras próprias; a dinâmica social da partida; a beleza de um protótipo bem acabado.',
                dinamicaAulas: '1. Apresentação de uma mecânica de jogo\n2. Brainstorm de temas e ideias em grupo\n3. Desenvolvimento de regras e prototipagem\n4. "Playtest" dos jogos entre os grupos\n5. Iteração e refinamento do jogo',
                produtoFinal: 'Festival de jogos de tabuleiro, onde os jogos criados são apresentados e jogados pela comunidade escolar.',
                documentacao: '• Manual de regras ilustrado de cada jogo.\n• Caixa do jogo personalizada.'
            }},
            { id: 'c14', name: 'Criação de Jogos Digitais', experience: 'Lógica de programação criativa, storytelling e interatividade.', icon: '🎮', ficha: {
                intencionalidade: 'Introduzir os fundamentos da lógica de programação e do design de narrativas interativas, capacitando as crianças a passarem de consumidoras a criadoras de tecnologia.',
                temasBncc: '• Temas transversais: Ciência e tecnologia, mundo digital.\n• BNCC: Matemática (habilidades EF06MA32), Língua Portuguesa (habilidades EF69LP50).',
                idades: '10 a 14 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 12 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Laboratório de informática com computadores e acesso à internet.',
                recursosLabirintar: 'Educador empreendedor desenvolvedor, acesso a plataformas de criação de jogos baseadas em blocos (Scratch, GDevelop).',
                protocolosSeguranca: '• Orientações sobre segurança digital e tempo de tela.',
                materialidades: 'Blocos de código, sprites, cenários, trilhas sonoras, a lógica "se-então".',
                experienciaEstetica: 'A satisfação de ver um personagem se mover com seu código; a criação de uma história interativa; a estética visual e sonora do jogo.',
                dinamicaAulas: '1. Apresentação de um conceito de programação/design\n2. Desafio de implementação\n3. Desenvolvimento individual do projeto de jogo\n4. Momento de jogar e avaliar os jogos dos colegas\n5. Refinamento e adição de novas funcionalidades',
                produtoFinal: 'Arcade day, um evento onde os jogos criados são disponibilizados para todos jogarem.',
                documentacao: '• Página do projeto em plataformas como o Scratch, com o jogo jogável e instruções.'
            }},
            { id: 'c15', name: 'Xadrez para a Vida', experience: 'Desenvolvimento de pensamento estratégico e paciência.', icon: '♟️', ficha: {
                intencionalidade: 'Desenvolver o raciocínio lógico, a capacidade de planejamento, a concentração e a tomada de decisão sob pressão, utilizando o jogo de xadrez como uma metáfora para os desafios da vida.',
                temasBncc: '• Temas transversais: Ética, cidadania.\n• BNCC: Matemática (habilidades EF04MA13).',
                idades: '7 a 14 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 20 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala de aula silenciosa com mesas.',
                recursosLabirintar: 'Educador empreendedor enxadrista, tabuleiros e peças de xadrez para todos, relógios de xadrez (opcional), tabuleiro mural para demonstrações.',
                protocolosSeguranca: '• Nenhum protocolo específico.',
                materialidades: 'O tabuleiro, as peças, o silêncio da concentração, a lógica dos movimentos.',
                experienciaEstetica: 'A beleza de uma partida bem jogada; a elegância das táticas e estratégias; o respeito pelo adversário.',
                dinamicaAulas: '1. Apresentação de um conceito (abertura, tática, final)\n2. Resolução de problemas/quebra-cabeças de xadrez\n3. Partidas entre os alunos\n4. Análise coletiva de uma partida\n5. Torneio interno ou partidas simultâneas',
                produtoFinal: 'Torneio de xadrez da escola.',
                documentacao: '• Registro das partidas mais interessantes em notação de xadrez.\n• Criação de um "livro de táticas" da turma.'
            }},
            { id: 'c16', name: 'Robótica Sustentável', experience: 'Montagem, lógica e resolução de problemas de forma lúdica.', icon: '🤖', ficha: {
                intencionalidade: 'Introduzir conceitos de mecânica, eletrônica e programação de forma prática e criativa, utilizando materiais reciclados e kits de robótica para resolver desafios e criar autômatos.',
                temasBncc: '• Temas transversais: Meio ambiente, ciência e tecnologia.\n• BNCC: Ciências (habilidades EF06CI03), Matemática (habilidades EF06MA32).',
                idades: '9 a 14 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 12 alunos (em duplas)',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Sim, 1 assistente é recomendado para auxiliar na organização dos materiais.',
                recursosEscola: 'Sala com mesas amplas e tomadas (laboratório ou sala de artes).',
                recursosLabirintar: 'Educador empreendedor maker, kits de robótica (Arduino, micro:bit), motores, sensores, LEDs, baterias, materiais de sucata (papelão, garrafas PET).',
                protocolosSeguranca: '• Orientações sobre o manuseio seguro de componentes eletrônicos e baterias.',
                materialidades: 'Placas, fios, sensores, motores, sucata, o código que dá vida ao robô.',
                experienciaEstetica: 'A "mágica" de um objeto inanimado ganhando movimento e reagindo ao ambiente; a engenhosidade de soluções criadas com sucata.',
                dinamicaAulas: '1. Apresentação do desafio da semana\n2. Brainstorm e planejamento da solução em duplas\n3. Montagem mecânica e conexão dos circuitos\n4. Programação e testes\n5. Demonstração e partilha dos resultados',
                produtoFinal: 'Feira de invenções, onde os robôs criados são apresentados e demonstram suas funcionalidades.',
                documentacao: '• Diário de projetos com fotos, esquemas e trechos de código para cada robô construído.'
            }},
        ]
    },
    {
        id: 'eixo5',
        name: 'Cuidar de si, do outro e do mundo',
        intention: 'Favorecer o autoconhecimento, o equilíbrio emocional e a visão de futuro, integrando competências de vida e bem-estar.',
        components: [
            { id: 'c17', name: 'Mindfulness e Yoga', experience: 'Práticas de atenção plena, respiração e consciência corporal.', icon: '🧘', ficha: {
                intencionalidade: 'Promover o bem-estar, a inteligência emocional e a concentração, oferecendo ferramentas práticas de respiração, meditação e posturas de yoga para lidar com os desafios do dia a dia.',
                temasBncc: '• Temas transversais: Saúde, autoconhecimento.\n• BNCC: Competência Geral 8: Autoconhecimento e autocuidado.',
                idades: '6 a 14 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 15 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala silenciosa, limpa e com espaço para movimentação. Pátio ou jardim também são ótimos.',
                recursosLabirintar: 'Educador empreendedor de yoga/mindfulness, tapetes de yoga (mat-colchonetes), almofadas, sinos ou tigelas tibetanas.',
                protocolosSeguranca: '• Respeitar os limites do corpo de cada criança.\n• Foco em um ambiente não-competitivo e de autoaceitação.',
                materialidades: 'O corpo, a respiração, o som do sino, o conforto da almofada.',
                experienciaEstetica: 'A calma interior; a descoberta da força e flexibilidade do próprio corpo; a sensação de presença no aqui e agora.',
                dinamicaAulas: '1. Roda de acolhida e partilha de sentimentos\n2. Prática de respiração (pranayama)\n3. Sequência de posturas de yoga (asanas) através de histórias ou temas\n4. Exercício de atenção plena (mindfulness)\n5. Relaxamento final (savasana)',
                produtoFinal: 'Criação de um "cantinho da calma" na escola, com materiais e dicas desenvolvidos pela turma.',
                documentacao: '• Diário de emoções ilustrado.\n• "Baralho de posturas" criado pelas crianças.'
            }},
            { id: 'c18', name: 'Empreendedorismo', experience: 'Vivências de criação, liderança e cooperação.', icon: '💡', ficha: {
                intencionalidade: 'Desenvolver a proatividade, a criatividade, a resiliência e a colaboração, através da criação de um projeto com impacto social ou ambiental, da ideia à execução.',
                temasBncc: '• Temas transversais: Cidadania, trabalho e consumo, meio ambiente.\n• BNCC: Competência Geral 6: Trabalho e projeto de vida.',
                idades: '10 a 14 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 16 alunos (em grupos)',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala de aula com acesso à internet para pesquisas.',
                recursosLabirintar: 'Educador empreendedor com experiência em gestão de projetos, materiais de escritório (post-its, cartolinas, canetas).',
                protocolosSeguranca: '• Nenhum protocolo específico.',
                materialidades: 'Ideias, post-its, canvas de projeto, planilhas, apresentações.',
                experienciaEstetica: 'A empolgação de transformar uma ideia em realidade; a força do trabalho em equipe; o impacto positivo gerado no mundo.',
                dinamicaAulas: '1. Apresentação de uma etapa do projeto (ideação, planejamento, etc.)\n2. Trabalho em grupo para desenvolver o projeto\n3. Mentoria do educador para cada grupo\n4. Apresentação do progresso (pitch)\n5. Definição dos próximos passos',
                produtoFinal: 'Feira de empreendedorismo, onde os projetos são apresentados para a comunidade e postos em prática.',
                documentacao: '• Plano de negócios simplificado do projeto.\n• Apresentação de slides (pitch deck) criada pelo grupo.'
            }},
            { id: 'c19', name: 'Educação Financeira', experience: 'Introdução lúdica a conceitos de planejamento e cuidado com recursos.', icon: '💸', ficha: {
                intencionalidade: 'Construir uma relação saudável e consciente com o dinheiro, desenvolvendo noções de planejamento, poupança, investimento e consumo consciente através de jogos e simulações.',
                temasBncc: '• Temas transversais: Cidadania, trabalho e consumo.\n• BNCC: Matemática (habilidades EF05MA21).',
                idades: '8 a 12 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 15 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Sala de aula com projetor.',
                recursosLabirintar: 'Educador empreendedor com conhecimentos em finanças, jogos de tabuleiro sobre finanças, dinheiro de brinquedo, planilhas simples.',
                protocolosSeguranca: '• Nenhum protocolo específico.',
                materialidades: 'Dinheiro de brinquedo, planilhas, gráficos, cofrinhos, jogos.',
                experienciaEstetica: 'A segurança do planejamento; a alegria de atingir uma meta de poupança; a consciência do poder de escolha como consumidor.',
                dinamicaAulas: '1. Discussão sobre um tema financeiro (ex: "de onde vem o dinheiro?")\n2. Atividade prática ou jogo sobre o tema\n3. Simulação de um desafio financeiro (ex: "planejar uma festa")\n4. Registro das decisões e aprendizados\n5. Roda de conversa sobre as escolhas feitas',
                produtoFinal: 'Criação de um "guia de dicas financeiras para crianças" ou a organização de uma feira de trocas na escola.',
                documentacao: '• "Cofrinho do sonho" com o planejamento de cada aluno para atingir uma meta pessoal.'
            }},
        ]
    },
    {
        id: 'eixo6',
        name: 'Cidade e Cultura Viva',
        intention: 'Valorizar a cidade como espaço educador e a cultura como expressão de pertencimento, memória e diversidade.',
        components: [
            { id: 'c20', name: 'Cozinhas e Infâncias', experience: 'Receitas ligadas à cultura e às memórias familiares (Educação Alimentar e Ambiental).', icon: '🧑‍🍳', ficha: {
                intencionalidade: 'Explorar a cultura e a memória afetiva através da culinária, promovendo a educação alimentar, a partilha de saberes e a valorização das histórias de cada família.',
                temasBncc: '• Temas transversais: Pluralidade cultural, saúde, meio ambiente.\n• BNCC: Competência Geral 3: Repertório cultural.',
                idades: '6 a 12 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 12 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Sim, 1 assistente é recomendado para auxiliar na higiene e organização.',
                recursosEscola: 'Cozinha ou espaço com pia, bancadas e fogão/forno.',
                recursosLabirintar: 'Educador empreendedor culinarista, ingredientes, utensílios de cozinha, livros de receitas.',
                protocolosSeguranca: '• Higienização das mãos e alimentos.\n• Supervisão total durante o uso de fogo e objetos cortantes (adaptados para crianças).',
                materialidades: 'Ingredientes, texturas, aromas, sabores, receitas de família, o calor do fogão.',
                experienciaEstetica: 'O afeto da comida de casa; a descoberta de novos sabores; a beleza de um prato montado coletivamente.',
                dinamicaAulas: '1. Roda de conversa sobre a receita e sua história\n2. Preparo coletivo da receita\n3. Exploração sensorial dos ingredientes\n4. Degustação e partilha\n5. Registro da receita no caderno da turma',
                produtoFinal: 'Publicação de um livro de receitas digital ou impresso com as histórias e pratos da turma.',
                documentacao: '• Fotos e vídeos do processo de preparo.\n• Desenhos das crianças sobre suas memórias alimentares.'
            }},
            { id: 'c21', name: 'Projeto CidadeVamos', experience: 'Cartografias afetivas e mapeamento de espaços pelo entorno.', icon: '🏙️', ficha: {
                intencionalidade: 'Desenvolver um olhar crítico e sensível sobre o território, transformando os alunos em exploradores e cartógrafos de seu próprio bairro e cidade, e fortalecendo o sentimento de pertencimento.',
                temasBncc: '• Temas transversais: Cidadania, meio ambiente.\n• BNCC: Geografia (habilidades EF03GE02), História (habilidades EF03HI05).',
                idades: '8 a 12 anos.',
                minMaxAlunos: 'Mínimo: 6 alunos\nMáximo: 15 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Sim, 1 assistente é obrigatório para saídas no entorno.',
                recursosEscola: 'Autorização dos pais para saídas no entorno. Sala de aula para planejamento.',
                recursosLabirintar: 'Educador empreendedor arquiteto/urbanista, mapas, pranchetas, câmeras fotográficas (ou celulares), gravadores de áudio.',
                protocolosSeguranca: '• Rota segura e pré-definida para as saídas.\n• Uso de coletes de identificação.\n• Proporção adequada de adultos por criança.',
                materialidades: 'O mapa, a rua, os sons da cidade, as fachadas, as pessoas, as plantas urbanas.',
                experienciaEstetica: 'A redescoberta do caminho de casa; a percepção da cidade como um organismo vivo; a beleza nos detalhes urbanos.',
                dinamicaAulas: '1. Planejamento da expedição (o que observar?)\n2. Saída a campo para exploração e registro\n3. Retorno à sala e organização do material coletado\n4. Criação de mapas afetivos, sonoros ou fotográficos\n5. Partilha das descobertas',
                produtoFinal: 'Exposição de cartografias afetivas do bairro, com fotos, desenhos, sons e relatos dos alunos.',
                documentacao: '• Diário de bordo das expedições urbanas.'
            }},
            { id: 'c22', name: 'Fotografia', experience: 'Registro do olhar da criança e produção de sentido pela imagem.', icon: '📷', ficha: {
                intencionalidade: 'Desenvolver a sensibilidade do olhar, a composição e a narrativa visual, utilizando a fotografia como uma ferramenta para expressar a forma como as crianças veem o mundo.',
                temasBncc: '• Temas transversais: Cultura, arte.\n• BNCC: Arte (habilidades EF15AR05, EF69AR06).',
                idades: '9 a 14 anos.',
                minMaxAlunos: 'Mínimo: 5 alunos\nMáximo: 12 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Pátios, jardins e outros espaços com boa iluminação e elementos visuais interessantes.',
                recursosLabirintar: 'Educador empreendedor fotógrafo, câmeras fotográficas digitais (podem ser celulares dos próprios alunos, se permitido), acesso a um computador para visualizar as fotos.',
                protocolosSeguranca: '• Cuidado com os equipamentos.\n• Respeito à imagem do outro (não fotografar colegas sem permissão).',
                materialidades: 'A luz, a sombra, o enquadramento, o foco, as cores, as texturas.',
                experienciaEstetica: 'A descoberta de que um lugar comum pode ser extraordinário sob um novo olhar; a potência de uma imagem para contar uma história.',
                dinamicaAulas: '1. Apresentação de um conceito fotográfico (luz, composição, etc.) e fotógrafos de referência\n2. Desafio fotográfico do dia\n3. Saída para fotografar\n4. Visualização e seleção das melhores fotos\n5. Roda de conversa e apreciação das imagens',
                produtoFinal: 'Exposição fotográfica na escola ou a criação de um fotolivro da turma.',
                documentacao: '• Portfólio digital com as melhores fotos de cada aluno.'
            }},
            { id: 'c23', name: 'Cultura Urbana', experience: 'Unindo esporte, cultura e música (roda de capoeira, parkour, danças de rua...).', icon: '🎤', ficha: {
                intencionalidade: 'Explorar e valorizar as manifestações culturais que nascem nas cidades, como o hip-hop, o grafite e a capoeira, promovendo a expressão, a identidade e o respeito à diversidade.',
                temasBncc: '• Temas transversais: Pluralidade cultural, cultura juvenil.\n• BNCC: Arte (habilidades EF69AR31), Educação Física (habilidades EF67EF11).',
                idades: '9 a 14 anos.',
                minMaxAlunos: 'Mínimo: 8 alunos\nMáximo: 16 alunos',
                duracao: '1 encontro semanal de 1h\nTrilha semestral de 16 encontros',
                apoioPedagogico: 'Não obrigatório.',
                recursosEscola: 'Quadra, pátio, muros autorizados para pintura.',
                recursosLabirintar: 'Educador empreendedor especialista na cultura (mestre de capoeira, dançarino de hip-hop, grafiteiro), caixa de som, sprays (tinta à base de água).',
                protocolosSeguranca: '• Aquecimento para atividades físicas.\n• Uso de máscara e luvas para o grafite.\n• Praticar em locais seguros e autorizados.',
                materialidades: 'O corpo, o som do berimbau, o beat da música, o spray, o muro.',
                experienciaEstetica: 'A energia da roda; a fluidez dos movimentos da dança; o impacto visual do grafite; a potência da rima.',
                dinamicaAulas: '1. Acolhida e apresentação de um elemento da cultura urbana\n2. Vivência prática (roda de capoeira, passos de dança, rascunho de grafite)\n3. Criação coletiva\n4. Mostra e partilha entre os participantes\n5. Roda de conversa sobre a história e os valores daquela manifestação',
                produtoFinal: '"Sarau Urbano" com apresentação de dança, roda de capoeira e exposição de grafites.',
                documentacao: '• Vídeo-documentário sobre o processo de criação do sarau.'
            }},
        ]
    },
    {
        id: 'eixo7',
        name: 'Formação',
        intention: 'Promover o desenvolvimento contínuo dos educadores, alinhando práticas pedagógicas e fortalecendo a cultura do ecossistema.',
        components: [
            { id: 'c24', name: 'Pedagógica', experience: 'Encontros de planejamento, formação e alinhamento para educadores.', icon: '🧑‍🏫', ficha: {
                intencionalidade: 'Garantir a coesão pedagógica, a troca de experiências e a formação continuada dos educadores do ecossistema, fortalecendo a qualidade e a intencionalidade de todas as práticas.',
                temasBncc: '• N/A (voltado para educadores)',
                idades: 'Adultos (Educadores)',
                minMaxAlunos: 'N/A',
                duracao: 'Encontros periódicos (quinzenais ou mensais) de 1h30',
                apoioPedagogico: 'N/A',
                recursosEscola: 'Sala de reunião com projetor.',
                recursosLabirintar: 'Coordenador pedagógico da LABirintar, materiais de formação, pautas estruturadas.',
                protocolosSeguranca: '• Nenhum protocolo específico.',
                materialidades: 'Diálogo, pautas, planejamentos, referenciais teóricos, relatos de prática.',
                experienciaEstetica: 'A construção de uma inteligência coletiva; o fortalecimento da comunidade de prática; a inspiração vinda da troca com os pares.',
                dinamicaAulas: '1. Acolhida e check-in\n2. Estudo de um tema pedagógico\n3. Troca de experiências e desafios da prática\n4. Planejamento de ações coletivas\n5. Encaminhamentos e check-out',
                produtoFinal: 'Planejamento pedagógico semestral alinhado; projetos interdisciplinares entre as experiências.',
                documentacao: '• Atas formativas dos encontros.\n• Portfólio de boas práticas do ecossistema.'
            }},
        ]
    },
];

export const allComponents = eixosPedagogicos.flatMap(eixo => eixo.components);

// Manter a exportação 'categorias' com o novo nome para evitar quebras em outros componentes
// que ainda não foram atualizados para usar 'eixosPedagogicos'.
export const categorias = eixosPedagogicos;