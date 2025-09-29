export const planoDeNegocio = `O Motor de Viabilidade Econômica: Modelando a Rentabilidade e a Decisão "Fazer vs. Comprar"

O motor de otimização matemática requer um parâmetro crítico: o número mínimo de alunos por turma (L) para que ela seja economicamente viável. Este capítulo detalha a construção do motor financeiro que calcula L e fornece uma estrutura quantitativa para a análise da decisão estratégica "Fazer vs. Comprar" pela escola.

4.1 Economia Unitária para a Escola (Cenário "Fazer")

Neste cenário, a escola opera o programa extracurricular internamente, arcando com todos os custos e retendo toda a receita. A análise de ponto de equilíbrio (Break-Even Point) é fundamental.
PUV (Preço de Venda Unitário): O valor mensal que a família paga, extraído diretamente das tabelas de preços.1 Para a análise por slot, este valor deve ser normalizado. Exemplo: para o produto "Integral 8h-13h" na Gara, que custa R$ 636,16 por 1 vez/semana, assumindo 4 semanas/mês e 5 horas/dia, o preço por aluno por slot é
R$636,16/(4×5)=R$31,81.
CVU (Custo Variável Unitário): Custos que variam diretamente com o número de alunos. Inclui almoço (R$ 22/dia) e lanche (R$ 11/dia), conforme informado.
CF (Custo Fixo por Turma): O custo principal é o do educador por slot. A pesquisa indica que o salário de um "Auxiliar de Sala" em São Paulo gira em torno de R$ 2.001 por mês.6 Considerando uma carga horária de 220h mensais, o custo por hora é de aproximadamente R$ 9,10. Adicionando encargos e benefícios (aproximadamente 70-80%), o custo total por hora (slot) pode ser estimado em torno de R$ 16 a R$ 17. Para um educador mais qualificado ou um estagiário com remuneração de R$ 37,95 por hora-aula 7, este custo pode ser maior. O simulador deve permitir a inserção deste valor como um parâmetro configurável, que chamaremos de
CFeducador​.
MCU (Margem de Contribuição Unitária): A margem que cada aluno gera para cobrir os custos fixos. A fórmula é MCUescola​=PUVslot​−CVUslot​.
PEQ (Ponto de Equilíbrio em Quantidade): O número mínimo de alunos para cobrir o custo do educador.
Lescola​=⌈MCUescola​CFeducador​​⌉
O símbolo ⌈⋅⌉ representa a função teto, que arredonda o resultado para o próximo inteiro, pois não é possível ter uma fração de aluno.

4.2 Economia Unitária da Parceria (Cenário "Comprar")

Neste cenário, a escola firma parceria com a LABirintar, alterando fundamentalmente sua estrutura de custos e riscos. A análise se baseia nos modelos de monetização do Plano de Negócios.1
Modelo Entrada (Split de Receita): A escola recebe uma porcentagem da receita (e.g., 20% ou 30% do PUV) sem custos de implementação.
A Transformação Estratégica: O principal benefício para a escola é a eliminação do CFeducador​. Este custo fixo, que gera o risco da ociosidade identificado na Gara 1, é convertido em um custo de oportunidade variável (a parcela da receita repassada à LABirintar). A escola só "paga" pelo serviço quando há receita, eliminando o risco financeiro de turmas vazias.
Nova Estrutura de Lucro da Escola: O lucro da escola por aluno por slot é simplesmente Lucroescola​=(%split​×PUVslot​)−CVUslot​. Não há mais um ponto de equilíbrio a ser atingido para a escola em relação ao custo do educador.
Esta transformação é a proposta de valor financeira mais poderosa da LABirintar para a persona do "Diretor Executivo/Financeiro" identificada no Playbook de Vendas.1 Ele troca um risco fixo e uma dor de cabeça operacional por um fluxo de receita garantido e sem riscos. A análise quantitativa torna este benefício, que é um "analgésico" para as dores da escola, explícito e irrefutável.

4.3 Calculando o Tamanho Mínimo Viável da Turma (L) para o Sistema

O valor de L a ser usado no modelo de otimização deve garantir a viabilidade para a LABirintar, que agora assume o custo do Educador Empreendedor (EE).
Receita da LABirintar por Aluno: A porcentagem do PUV que lhe cabe no split (e.g., 20% ou 30%).
CVU da LABirintar: O custo variável unitário informado de R$ 39,25 por matrícula. Este valor deve ser normalizado para uma base por slot. Se uma matrícula média envolve, por exemplo, 40 slots/mês, o CVUlab,slot​ seria de aproximadamente R$ 0,98.
CF por Turma da LABirintar: O custo do EE por slot. Este é um parâmetro chave. Pode ser o valor de R$ 150/hora mencionado como referência de mercado ou um valor negociado com o EE.
MCU da LABirintar: MCUlab​=Receitalab,slot​−CVUlab,slot​.
PEQ da LABirintar:
Llab​=⌈MCUlab​CFEE​​⌉
O Parâmetro Final para Otimização: O valor de L (ou CapMing​) que alimentará o modelo da Parte III será o Llab​ calculado, pois no cenário de parceria, a viabilidade da turma é responsabilidade da LABirintar.
`;
