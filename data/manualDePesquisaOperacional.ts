export const manualDePesquisaOperacional = `MANUAL DE PESQUISA OPERACIONAL E LÓGICA DE NEGÓCIO
Versão 1.0 - Simulador Operacional LABirintar

INTRODUÇÃO

Este documento formaliza o modelo matemático, as heurísticas de negócio e a lógica financeira que constituem o "cérebro" do Simulador Operacional LABirintar. Seu objetivo é servir como a fonte da verdade para as regras que governam a alocação de recursos, o custeio da operação e a análise de viabilidade dos cenários.

O público-alvo inclui gestores de negócio, consultores pedagógicos e a equipe de desenvolvimento, garantindo que todos compartilhem um entendimento inequívoco da inteligência embarcada na ferramenta.

A filosofia do modelo é transformar um complexo problema de otimização em uma ferramenta intuitiva que capacita a tomada de decisão estratégica, convertendo dados operacionais em insights financeiros claros e acionáveis.

SEÇÃO 1: FUNDAMENTOS DO MODELO DE OTIMIZAÇÃO

1.1. A FUNÇÃO OBJETIVO: MAXIMIZAÇÃO DA MARGEM DE CONTRIBUIÇÃO

O objetivo primário do modelo, seja na análise "Fazer vs. Comprar" ou na "Saúde do Ecossistema", é sempre maximizar a rentabilidade. A métrica central para isso é a Margem de Contribuição.

DEFINIÇÃO: Margem de Contribuição (MC) é a receita de uma venda menos os custos diretamente associados a essa venda (custos variáveis). É o valor que "sobra" para pagar os custos fixos da operação e, eventualmente, gerar lucro.

FÓRMULA BÁSICA: MC = Receita Líquida - Custos Variáveis

No contexto do simulador, a função objetivo é encontrar a alocação de recursos que gere a maior Margem de Contribuição Total possível, garantindo a cobertura dos custos fixos e a maximização do resultado.

1.2. COMPONENTES DO MODELO (GLOSSÁRIO)

- ÍNDICES (Conjuntos): Categorias que organizam os dados.
  - k ∈ K: Alunos/Coortes de um cenário.
  - j ∈ J: Componentes pedagógicos (Teatro, Robótica, etc.).
  - g ∈ G: Turmas/Grupos (Turma A, Turma B).
  - d ∈ D: Dias da semana.
  - s ∈ S: Slots de tempo (horários).

- PARÂMETROS (Dados de Entrada): As informações que alimentam o simulador.
  - TotalAlunos_k: Nº de alunos no cenário.
  - PrecoProduto_k: Preço do produto para a coorte.
  - Custos Variáveis: Custos de alimentação, educadores especialistas, etc.
  - Custos Fixos: Custo mensal de educadores nexialistas, taxas.
  - CapacidadeMaximaTurma: Limite de alunos por turma (fixo: 12).
  - QuorumMinimoTurma: Mínimo de alunos para abrir uma turma (padrão: 6).
  - ParametrosProduto_k: Regras do produto (frequência, janela de horário, etc.).
  - ParametrosTributarios_p: Dados fiscais de cada entidade.

- VARIÁVEIS DE DECISÃO (Saídas): As decisões que o modelo (ou o usuário) toma.
  - Alocar(j, g, d, s): Decide se o componente j é alocado na turma g, no dia d, às s horas. O conjunto destas decisões forma a grade horária.
  - NumAlunos(g, d, s): O número resultante de alunos em cada turma.

SEÇÃO 2: LÓGICA DE DEMANDA E GERAÇÃO DE TURMAS

2.1. DA DEMANDA AGREGADA ÀS TURMAS OPERACIONAIS

O primeiro passo do modelo é traduzir a demanda de um cenário (TotalAlunos_k) em unidades operacionais (turmas), que são a base para a alocação e o custeio.

REGRA: O número de turmas necessárias (NumTurmas) para um componente em um slot é o menor inteiro que comporta todos os alunos, respeitando a capacidade máxima.
FÓRMULA: NumTurmas = teto(TotalAlunos_k / CapacidadeMaximaTurma)

Exemplo: Se TotalAlunos_k = 15 e CapacidadeMaximaTurma = 12, a conta é teto(1.25), resultando em 2 turmas.

2.2. DISTRIBUIÇÃO UNIFORME DE ALUNOS

Após definir o número de turmas, os alunos são distribuídos de forma a equilibrar o tamanho das turmas, garantindo uma melhor experiência pedagógica.

Exemplo: Para 15 alunos e 2 turmas, o sistema cria uma turma com 8 e outra com 7 alunos.

SEÇÃO 3: O CORAÇÃO DA OPERAÇÃO: RESTRIÇÕES DO MODELO

As restrições são as regras de negócio que garantem que a grade horária gerada seja viável, pedagogicamente coerente e comercialmente correta.

3.1. RESTRIÇÃO DE CAPACIDADE: A Realidade da Sala de Aula
- REGRA: O número de alunos em qualquer turma (NumAlunos(g, d, s)) não pode exceder a CapacidadeMaximaTurma (12).
- PROPÓSITO: Garantir a qualidade pedagógica e a segurança.

3.2. RESTRIÇÃO DE QUÓRUM MÍNIMO: Viabilidade Econômica
- REGRA: Uma nova turma para um componente só pode ser criada se o número de alunos excedentes for igual ou maior que o QuorumMinimoTurma (6). Uma exceção é a primeira turma de um cenário, que pode ser aberta com menos de 6 alunos se a opção correspondente estiver ativa.
- PROPÓSITO: Evitar a criação de turmas com prejuízo financeiro.

3.3. RESTRIÇÃO DE FAIXA ETÁRIA: Coerência Pedagógica
- REGRA: Um componente só pode ser alocado a um produto se suas faixas etárias forem compatíveis (ex: componente para 6-10 anos não pode ser alocado em um produto "Infantil").
- PROPÓSITO: Garantir que o conteúdo pedagógico seja adequado aos alunos.

3.4. RESTRIÇÃO DE UNICIDADE: Diversidade de Experiências
- REGRA: Um mesmo componente pedagógico (ex: Robótica) não pode ser alocado more de uma vez para a mesma coorte durante a semana. Esta regra não se aplica ao componente "Ócio Vivo" (ID c27), que pode ser utilizado múltiplas vezes ao dia e na semana para preencher lacunas na grade e servir como um momento de descompressão e respiro.
- PROPÓSITO: Garantir que o aluno tenha uma grade com diversidade de experiências estruturadas, enquanto permite flexibilidade com pausas e brincadeiras livres.

3.5. RESTRIÇÃO DE FREQUÊNCIA: Cumprindo a Promessa do Produto
- REGRA (Tipo "Window"): O número de dias da semana que contêm atividades deve ser EXATAMENTE igual à frequência contratada.
- REGRA (Tipo "Component"): O número total de componentes alocados na semana deve ser EXATAMENTE igual à frequência contratada.
- PROPÓSITO: Assegurar que o serviço entregue corresponda ao produto comprado pela família.

3.6. RESTRIÇÃO DE JANELA DE HORÁRIO: A Estrutura do Produto
- REGRA (Tipo "Window"): Componentes só podem ser alocados nos horários definidos pela "Janela de Permanência" do produto (ex: das 8h às 13h).
- PROPÓSITO: Estruturar a jornada do aluno de acordo com o produto adquirido.

3.7. RESTRIÇÃO DE PREENCHIMENTO OBRIGATÓRIO: Otimização do Tempo
- REGRA (Tipo "Window"): Se um dia da semana tem alguma atividade, TODOS os slots dentro da Janela de Horário daquele dia devem ser preenchidos.
- PROPÓSITO: Evitar "buracos" na grade e maximizar o uso do tempo contratado. O componente "Ócio Vivo" (ID c27) é a ferramenta para preencher esses espaços, garantindo a viabilidade.

3.8. RESTRIÇÃO DE COMPOSIÇÃO: A META DO ÓCIO VIVO
- REGRA: Para garantir equilíbrio pedagógico, a grade horária deve conter um percentual de slots preenchidos com "Ócio Vivo" (ID c27), conforme definido pelo usuário (padrão ~40%). Este valor é uma **meta ativa** para a IA. A IA aplicará as regras estruturais (conforme a convergência) e, se necessário, substituirá componentes especialistas por "Ócio Vivo" para se aproximar da meta definida.
- PROPÓSITO: Assegurar pausas e respiros na jornada da criança, promovendo bem-estar e servindo como ferramenta de otimização.

3.8.1. CASO ESPECIAL: 100% ÓCIO VIVO
- REGRA: Se o percentual de "Ócio Vivo" for definido como 100%, todas as outras regras de alocação de componentes especialistas, rotação e balanceamento são desconsideradas. A IA tem a única e exclusiva tarefa de preencher TODOS os slots de tempo, de TODAS as turmas, com o componente "Ócio Vivo" (ID c27).
- PROPÓSITO: Permitir a criação de cenários onde a grade é composta inteiramente por atividades de livre escolha e descompressão, sem a necessidade de rotação por especialistas.

3.9. RESTRIÇÃO DE FAIXA ETÁRIA: Coerência Pedagógica
- REGRA: Um componente pedagógico só pode ser alocado a um cenário (produto) se a faixa etária recomendada para o componente for compatível com a faixa etária do público do produto. A compatibilidade é definida como qualquer sobreposição entre os dois intervalos de idade.
- Exemplo: Um produto "Infantil" (0-5 anos) não pode receber um componente "RPG" (11-17 anos). Um componente "Teatro" (6-14 anos) é compatível com um produto "Fundamental" (6-14 anos).
- PROPÓSITO: Garantir que o conteúdo pedagógico e a complexidade da atividade sejam adequados ao nível de desenvolvimento dos alunos, evitando frustração e garantindo o engajamento.

3.10. RESTRIÇÃO DE DISTRIBUIÇÃO EQUILIBRADA (ÓCIO VIVO)
- REGRA: O componente "Ócio Vivo" (ID c27) deve ser alocado de forma intercalada entre os demais componentes pedagógicos dentro da janela de horário diária. Deve-se evitar o agrupamento de múltiplos slots de "Ócio Vivo" em sequência, especialmente no início ou no final da janela.
- PROPÓSITO: Garantir que as pausas e momentos de brincadeira livre sirvam como respiros pedagógicos ao longo da jornada do aluno, promovendo bem-estar e equilíbrio, em vez de serem apenas "preenchimentos" de tempo no começo ou fim do dia.

3.11. RESTRIÇÃO DE CONCORRÊNCIA E CONSISTÊNCIA DE TURMAS
- 3.11.1 Concorrência de Componentes: É permitido que, no mesmo dia e slot de horário, existam múltiplas turmas do mesmo componente (para acomodar mais alunos) ou turmas de componentes diferentes, desde que haja capacidade física (salas/espaços) na escola.
- 3.11.2 Consistência da Coorte: Para produtos do tipo "Window", o modelo deve priorizar a manutenção da estrutura de agrupamento dos alunos ao longo do dia. Uma vez que a coorte de alunos é dividida em 'N' turmas com tamanhos específicos no primeiro slot de atividade do dia, essa mesma configuração (N turmas com os mesmos tamanhos) deve ser mantida para todos os slots subsequentes dentro da janela de horário naquele dia.
- PROPÓSITO: Promover a estabilidade operacional e pedagógica, mantendo os grupos de alunos consistentes ao longo de sua jornada diária, facilitando a logística e o desenvolvimento de vínculos dentro das turmas.

3.12. DEFINIÇÃO E NOMEAÇÃO DE TURMAS
- 3.12.1 Definição de Turma: Uma 'turma' é um agrupamento específico de alunos alocados a um único componente pedagógico em um único slot de tempo. Uma coorte de alunos (total de alunos de um cenário) pode ser dividida em múltiplas turmas para o mesmo componente/horário se o número de alunos exceder a capacidade máxima.
- 3.12.2 Convenção de Nomenclatura: Para facilitar a identificação, cada turma deve receber um identificador único ('turmaId') que segue o formato: [Abreviação do Componente]-[Letra Sequencial].
- Exemplo: Se o componente 'Teatro' precisar de duas turmas em um horário, elas serão nomeadas 'TEAT-A' e 'TEAT-B'. Se 'Robótica' for alocado em outro horário, sua primeira turma será 'ROBO-A'. A letra é sequencial por componente em toda a grade do cenário.
- PROPÓSITO: Facilitar a identificação e o rastreamento de grupos específicos de alunos na grade horária, melhorando a clareza operacional e a comunicação.

3.13. RESTRIÇÃO DE CONSISTÊNCIA DE EDUCADOR ESPECIALISTA DIÁRIO
- REGRA: Para maximizar a eficiência e a permanência do educador especialista na escola, o conjunto de componentes especialistas alocados em um dia deve ser consistente. Se os componentes 'Teatro', 'Circo' e 'Robótica' são usados para a rotação de turmas em um determinado dia, esses mesmos três componentes (e seus respectivos educadores) devem ser os únicos especialistas utilizados para as rotações nos demais slots daquele dia.
- PROPÓSITO: Otimizar a jornada de trabalho dos educadores especialistas, evitando que um educador precise se deslocar para a escola por apenas uma ou duas horas. Isso aumenta a atratividade para os educadores e simplifica a gestão operacional. A regra pode ser flexibilizada pela IA em cenários de alta convergência (muitas turmas, poucos slots) para maximizar a variedade pedagógica, mas a prioridade é a consistência.

3.14. RESTRIÇÃO DE VALIDAÇÃO PRÉVIA DE COMPONENTES (GARANTIA DE ROTAÇÃO DIÁRIA)
- REGRA: Antes de solicitar a geração da grade à IA, o sistema deve executar uma validação para garantir que a configuração do cenário é viável para uma rotação diária completa. O sistema calcula o número máximo de componentes especialistas distintos (Y) que podem ser rotacionados em um dia, com base no "orçamento" de tempo disponível (definido pelo Nº de Turmas, Nº de Slots e % de Ócio Vivo). O gestor é então obrigado a selecionar um número de componentes (X) que seja exatamente igual a Y.
- PROPÓSITO: Esta é uma "alavanca" estratégica fundamental. Ela impede a criação de cenários inviáveis, garante a rotação completa de todas as turmas por todos os componentes no mesmo dia, e formaliza a "filosofia do dia da especialidade". Isso maximiza a diversidade de experiências na semana e otimiza a alocação de educadores.

SEÇÃO 4: ANÁLISE DE VIABILIDADE: CENÁRIO "FAZER"

Este modelo calcula a DRE (Demonstração do Resultado do Exercício) sob a perspectiva da escola internalizando toda a operação.

- Receita Bruta: (Preço do Produto) × (Nº de Alunos)
- (-) Impostos s/ Receita: Calculados pelo Módulo Tributário.
- (=) Receita Líquida
- (-) Custos Variáveis (CV): Custos que só existem se há alunos.
  - Alimentação: (Custo Almoço + Custo Lanche) × Frequência.
  - Educador Especialista: (Custo Mensal por Sessão Semanal por Aluno) × (Nº de Alunos) × (Nº de Sessões de Especialista por Semana por Aluno). Este é um custo variável que escala com o número de alunos e a quantidade de atividades especializadas que eles cursam.
- (=) Margem de Contribuição (MC)
- (-) Custos Fixos (CF): Custos que existem independentemente do nº de alunos.
  - Educadores Nexialistas: Custo de pessoal contratado (CLT) para componentes como "Ócio Vivo". É calculado com base no PICO de educadores nexialistas necessários simultaneamente na grade. Isso representa o risco operacional: a escola contrata para o pico, mesmo que em outros horários a demanda seja menor.
- (=) EBIT (Resultado Operacional)
- (-) Impostos s/ Resultado: (IRPJ/CSLL) Calculados pelo Módulo Tributário.
- (=) Resultado Líquido

Análise de Ponto de Equilíbrio (Break-Even Point - BEP):
- BEP (em Alunos) = Custos Fixos Totais / Margem de Contribuição Unitária
- SIGNIFICADO: O número mínimo de alunos necessários para que a operação pague todos os seus custos e não gere prejuízo.

SEÇÃO 5: A TRANSFORMAÇÃO ESTRATÉGICA: CENÁRIO "COMPRAR"

Este cenário modela a parceria com a LABirintar, que altera fundamentalmente a estrutura de risco e resultado da escola.

5.1. A MUDANÇA FUNDAMENTAL: DE CUSTO FIXO PARA CUSTO VARIÁVEL

No cenário "Fazer", o Custo com Educadores Nexialistas é FIXO, representando um risco financeiro (turmas vazias geram prejuízo). No cenário "Comprar", este custo é substituído por um percentual da receita (Split).

CONSEQUÊNCIA ESTRATÉGICA: A escola elimina o risco operacional. O custo só existe quando há receita, garantindo que a operação nunca gere prejuízo por falta de quórum.

5.2. NOVA DRE DA ESCOLA (CENÁRIO "COMPRAR")

- Receita Bruta (Escola): (TM Família cobrado pela LABirintar) × (Nº de Alunos) × (% de Split da Escola)
- (-) Impostos s/ Receita
- (=) Receita Líquida
- (-) Custos Variáveis: Apenas Alimentação.
- (=) Margem de Contribuição
- (-) Custos Fixos: Apenas Taxa de SaaS (se houver, no modelo "Escala"). O custo com pessoal é ZERADO.
- (=) EBIT
- (-) Impostos s/ Resultado
- (=) Resultado Líquido

5.3. APLICAÇÃO AO ECOSSISTEMA

A mesma lógica de DRE é aplicada a todos os parceiros na aba "Saúde do Ecossistema", cada um com seus próprios parâmetros de receita (split), custos e tributação, permitindo uma análise completa da sustentabilidade do modelo de negócio.

SEÇÃO 6: O MÓDULO TRIBUTÁRIO INTELIGENTE

Este módulo simula o complexo cenário fiscal brasileiro, adaptando-se ao ano da simulação devido à Reforma Tributária.

- INPUT: Receita, Custo, Regime, CNAE, Ano, etc.
- LÓGICA POR PERÍODO:
  - ATÉ 2026 (Cenário Atual): Aplica as regras conhecidas de Simples Nacional (com Fator R), Lucro Presumido e Lucro Real (com créditos de PIS/COFINS).
  - 2027-2028 (Transição 1): Simula a substituição de PIS/COFINS pela CBS (Contribuição sobre Bens e Serviços).
  - 2029-2032 (Transição 2): Simula a introdução gradual do IBS (Imposto sobre Bens e Serviços) em substituição ao ISS.
  - A PARTIR DE 2033 (Reforma Completa): Simula o modelo final com tributação unificada em CBS e IBS, com direito a crédito amplo para Lucro Real e Presumido.
- OUTPUT: O valor total de impostos e um detalhamento que separa os impostos que incidem "sobre a receita" dos que incidem "sobre o resultado", o que é crucial para o cálculo correto da Margem de Contribuição e do Resultado Líquido.

CONCLUSÃO

O Simulador Operacional, governado por este manual, não é apenas uma ferramenta de agendamento, mas um motor de inteligência de negócio. Ele permite que a LABirintar e seus parceiros modelem cenários, testem hipóteses, otimizem a alocação de recursos e, fundamentalmente, tomem decisões estratégicas baseadas em uma simulação quantitativa e robusta da realidade operacional e financeira.
`;