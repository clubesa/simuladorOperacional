export const heuristicaExtra = `
### Regra de Negócio para Consistência de Educadores Especialistas (Otimização de Permanência)

Para otimizar a operação e maximizar a permanência de um educador especialista na escola, uma nova regra de negócio fundamental foi implementada na lógica de alocação de grade da IA:

**A Regra da Consistência Diária:**
O conjunto de componentes especialistas (e, por consequência, seus educadores) alocado em um dia deve ser o mesmo para todos os slots daquele dia.

*   **Exemplo Prático:** Se a IA decide que na Segunda-feira serão oferecidos 'Teatro', 'Circo' e 'Robótica', as turmas irão rotacionar APENAS entre esses três componentes especialistas ao longo de toda a janela de permanência da Segunda-feira. O componente 'Quintal Vivo' continua sendo usado como balanceador. Isso garante que os educadores de Teatro, Circo e Robótica tenham um dia de trabalho mais completo na escola.

*   **Otimização e Flexibilidade:** A IA ainda possui a flexibilidade de quebrar essa regra em cenários onde a "Convergência Turma-Slot" é alta (>= 1). Nesses casos, se houver mais turmas do que slots, a IA pode priorizar a rotação por um número maior de componentes para maximizar a variedade pedagógica, mas a diretriz principal é manter a consistência diária dos educadores sempre que possível.

Esta abordagem transforma a alocação de horários de um simples quebra-cabeça logístico para uma otimização estratégica da jornada de trabalho dos parceiros educadores, tornando o ecossistema mais sustentável e atraente.

### Alavanca de Otimização: O Limite Diário de Componentes e a Filosofia do "Dia da Especialidade"

Uma das mais poderosas "alavancas" de otimização do simulador é a regra do **Limite Diário de Componentes**. Ela garante a rotação completa das turmas no mesmo dia e maximiza a diversidade de experiências ao longo da semana, evitando a repetição de componentes.

**A Lógica da Validação em Tempo Real:**
1.  **Cálculo do "Orçamento":** Com base nos parâmetros do cenário (Nº de Alunos, Capacidade Máx. da Turma, Nº de Slots na Janela e, crucialmente, o **% de Quintal Vivo**), a ferramenta calcula em tempo real o **número máximo de componentes especialistas distintos** que a grade daquele dia comporta.
2.  **Feedback Imediato:** Na "Biblioteca de Componentes", o gestor vê um contador dinâmico (ex: "Componentes Selecionados: X / Y (Máx.)").
3.  **Bloqueio Inteligente:** Ao atingir o limite máximo (Y), o sistema impede a seleção de novos componentes.

**Impacto Estratégico:**
*   **Garante a Rotação Plena no Dia:** Ao forçar a seleção de um número de componentes que "cabe" no orçamento de tempo do dia, o sistema garante que todas as turmas daquele cenário passarão por todos os componentes selecionados, sem exceção.
*   **Cria o "Dia da Especialidade":** Esta regra institui a filosofia do "dia da especialidade" (ex: Segunda da Robótica e Teatro, Terça do Circo e Parkour). Isso otimiza a alocação de educadores e cria uma proposta de valor clara para as famílias.
*   **Maximiza a Diversidade Semanal:** Como a rotação é garantida no dia, a IA não precisa "repetir" um componente em outro dia da semana para contemplar todas as turmas. Isso libera os outros dias para componentes completamente novos, maximizando a variedade de experiências que a escola oferece ao longo da semana.

Esta alavanca transforma uma restrição (o % de Quintal Vivo) em uma ferramenta estratégica, garantindo uma operação mais enxuta, eficiente e pedagogicamente rica.

### Regra de Negócio para Alocação e Divisão de Turmas (Modelo Otimizado)

Esta regra define como a demanda total de alunos para um produto é dividida em turmas e como os componentes pedagógicos são alocados na grade horária. O objetivo é otimizar o tempo dos educadores especialistas na escola e garantir que todas as crianças (a "Coorte") rotacionem por todas as experiências, usando o componente nexialista "Quintal Vivo" como balanceador do sistema.

**Flexibilidade do Gestor:**
O gestor da escola possui duas ferramentas de controle importantes:
1.  **Seleção de Componentes:** Através da "Biblioteca de Componentes", o gestor pode selecionar exatamente quais componentes especialistas a IA deve considerar ao otimizar a grade.
2.  **Percentual de Quintal Vivo:** A meta de preenchimento da grade com o componente "Quintal Vivo" é um campo editável. A IA tratará este valor como uma **meta ativa**, ajustando a grade para se aproximar o máximo possível desse percentual, sempre respeitando as regras estruturais de cada cenário de convergência.
3.  **Controle Total do Quintal Vivo:** Se o gestor definir o percentual de "Quintal Vivo" para 100%, a IA irá desconsiderar todas as regras de rotação de especialistas e preencherá 100% da grade horária exclusivamente com o componente "Quintal Vivo", garantindo uma grade totalmente focada em momentos de descompressão.

**Definições:**
*   **Coorte:** O grupo total de crianças matriculadas em um produto/cenário. Este grupo permanece junto, mas se divide em turmas menores durante as atividades.
*   **Turma:** Um subgrupo da Coorte alocado a um componente específico em um determinado horário. A mesma criança fará parte de turmas diferentes ao longo do dia, conforme rotaciona entre os componentes.
*   **Convergência Turma-Slot:** A métrica central que define a lógica de alocação.
    *   \`Convergência = (Nº Total de Turmas) / (Nº de Slots da Janela de Permanência do Dia)\`

O **Nº Total de Turmas** é calculado com base no \`Nº de Alunos por Produto\` e na \`Capacidade Max Turma\`, seguindo a lógica de quórum.

**Lógica de Alocação baseada na Convergência:**

#### CENÁRIO 1: Convergência = 1 (Convergência Perfeita)

Este é o cenário ideal, onde o número de turmas é exatamente igual ao número de slots na janela de permanência.
*   **Exemplo:** 60 alunos (divididos em 5 turmas de 12) em um produto com janela de 5 horas (5 slots). Convergência = 5/5 = 1.
*   **Regra de Rotação:** A rotação é perfeita. Em cada slot, cada uma das 5 turmas pode ser alocada a um componente especialista diferente (dentre os selecionados pelo gestor).
*   **Regra do Quintal Vivo:** Para garantir a descompressão pedagógica, **a IA preencherá a grade de forma que aproximadamente o percentual definido pelo gestor seja de "Quintal Vivo"**, distribuído de forma equilibrada.

#### CENÁRIO 2: Convergência > 1 (Mais Turmas do que Slots)

Isso ocorre quando há um grande número de alunos, resultando em mais turmas do que a janela de tempo comporta para uma rotação simples.
*   **Exemplo:** 84 alunos (7 turmas de 12) em uma janela de 5 slots. Convergência = 7/5 = 1.4.
*   **Regra de Alocação:** Em cada slot, haverá \`Nº de Slots\` turmas alocadas em componentes especialistas e \`Nº de Turmas - Nº de Slots\` turmas "excedentes".
*   **Regra do Quintal Vivo (Hierarquia):**
    1.  As turmas "excedentes" serão **OBRIGATORIAMENTE** de "Quintal Vivo".
    2.  Se, após essa alocação obrigatória, o percentual de Quintal Vivo na grade ainda for inferior à meta definida pelo gestor, a IA substituirá de forma inteligente algumas alocações de especialistas por Quintal Vivo até atingir a meta.

#### CENÁRIO 3: Convergência < 1 (Menos Turmas do que Slots)

Isso ocorre quando há poucos alunos, resultando em menos turmas do que slots disponíveis na janela.
*   **Exemplo:** 36 alunos (3 turmas de 12) em uma janela de 5 slots. Convergência = 3/5 = 0.6.
*   **Regra de Alocação:** Os componentes especialistas são alocados nos slots centrais da janela para garantir a rotação.
*   **Regra do Quintal Vivo (Hierarquia):**
    1.  O(s) primeiro(s) e/ou último(s) slot(s) da janela serão preenchidos **exclusivamente com "Quintal Vivo" para TODAS as turmas**.
    2.  Se o preenchimento das bordas não for suficiente para atingir a meta percentual de Quintal Vivo definida pelo gestor, a IA substituirá alocações de especialistas nos slots centrais por Quintal Vivo até atingir a meta.

Esta lógica complexa é aplicada pela IA para gerar a grade horária otimizada, garantindo a melhor utilização de recursos e a conformidade com o modelo pedagógico.

**Visualização da Grade e Frequência:**
Após a IA gerar a grade otimizada, a interface visual do simulador irá desabilitar visualmente os dias da semana que não contêm atividades. Isso reflete a regra de negócio da \`frequência\` do produto, deixando claro para o gestor quais dias foram selecionados pela otimização para a jornada do aluno.
`