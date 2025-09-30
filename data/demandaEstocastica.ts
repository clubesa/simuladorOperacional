
export const demandaEstocastica = `### Relatório de Pesquisa e Concepção: Simulação de Demanda Multidimensional

**1. Análise Estratégica e o Cenário de Dados Nacionais**

A incorporação de uma simulação de Monte Carlo baseada em estatísticas para a distribuição de matrículas por produto (Janela de Permanência) e por frequência semanal (1 a 5 dias) é um aprofundamento estratégico fundamental. A capacidade de modelar a incerteza da demanda é crucial para a análise de viabilidade e o planejamento de capacidade.

Uma pesquisa abrangente em fontes de dados públicos, como o Censo Escolar do INEP e a Pesquisa Nacional por Amostra de Domicílios (PNAD) Contínua do IBGE, revela um ponto importante. Embora existam dados macro sobre matrículas na educação básica, o crescimento da rede privada, e a expansão do tempo integral, não há uma estatística pública detalhada que segmente o mercado de atividades extracurriculares pela estrutura comercial dos produtos (ex: % de alunos em pacotes de 3 horas vs. 5 horas) ou pela frequência de contratação semanal (ex: % de alunos em pacotes de 2x vs. 5x por semana). Essas são métricas de inteligência de negócio, geralmente proprietárias de cada instituição ou rede de ensino.

Essa lacuna de dados públicos não é um obstáculo, mas sim uma oportunidade estratégica. Ela reforça o valor do "Simulador Operacional" como uma ferramenta que não apenas consome dados, mas ajuda a criá-los e a testar hipóteses. A solução, portanto, não será fornecer um número nacional fixo, mas sim criar uma arquitetura de simulação flexível que:
1.  **Forneça Benchmarks Editáveis:** O app virá com "Perfis de Distribuição Padrão" (ex: "Conservador", "Moderado") como pontos de partida inteligentes.
2.  **Capacite o Gestor:** Permita que o usuário insira seus próprios dados históricos ou hipóteses estratégicas, tornando a simulação totalmente personalizada à realidade de cada escola.

**2. A Lógica da Simulação Monte Carlo em Duas Dimensões**

Para capturar a complexidade da decisão familiar, a simulação de Monte Carlo será estruturada em duas etapas sequenciais, mimetizando o processo de compra:

*   **Simulação Nível 1 (Distribuição por Produto):** Primeiro, o modelo distribui o número total de alunos projetados para o extracurricular entre os diferentes "Produtos" (Janelas de Permanência) cadastrados. Cada produto terá uma probabilidade de ser escolhido, definida pelo gestor.
*   **Simulação Nível 2 (Distribuição por Frequência):** Em seguida, para cada grupo de alunos já alocado a um produto, o modelo executa uma segunda simulação. Ele distribui esses alunos entre as opções de frequência semanal (1 a 5 dias). Crucialmente, o perfil de probabilidade de frequência pode ser diferente para cada produto. Por exemplo, é razoável supor que um produto "Integral" terá uma maior concentração de alunos na frequência de 5x/semana, enquanto um produto de "1 hora extra" pode ter uma distribuição mais pulverizada entre 1x e 2x/semana.

Essa abordagem em duas camadas permite uma modelagem de cenários muito mais rica e precisa, transformando o "Gerador de Cenários de Demanda" em uma poderosa ferramenta de previsão e análise de risco.`;
