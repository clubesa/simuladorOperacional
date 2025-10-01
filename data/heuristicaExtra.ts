export const heuristicaExtra = `
### Regra de Negócio para Abertura de Novas Turmas (Previsão Determinística)

Esta regra define como a capacidade das turmas deve ser gerenciada e quando é apropriado criar uma nova turma para acomodar alunos excedentes. O objetivo é evitar a criação de turmas com um número muito baixo de alunos, o que seria economicamente inviável.

**Capacidade Máxima por Turma:**
*   A capacidade máxima padrão para qualquer turma de atividade extracurricular é de **12 alunos**.

**Critério para Abertura de Nova Turma:**
*   Uma nova turma só deve ser aberta para acomodar alunos excedentes se houver um **mínimo de 3 alunos** para formar essa nova turma.
*   Isso significa que, se o número de alunos exceder 12, mas o excesso for de apenas 1 ou 2 alunos, eles devem ser mantidos na turma original, que ficará temporariamente com 13 ou 14 alunos.
*   A abertura de uma segunda turma só se justifica quando o número total de alunos para uma mesma atividade/horário atingir **15 (12 + 3)**.

**Exemplos Práticos:**
*   **1 a 12 alunos:** Uma única turma é formada, operando dentro da capacidade.
*   **13 ou 14 alunos:** Os alunos são mantidos em uma **única turma**. Embora a capacidade de 12 seja ultrapassada, não há o quórum mínimo de 3 alunos excedentes para justificar a abertura de uma segunda turma.
*   **15 alunos:** O limite de 12 é ultrapassado por 3 alunos. Neste ponto, uma **segunda turma é criada**, e os 15 alunos são redistribuídos entre as duas novas turmas (por exemplo, uma turma com 8 e outra com 7 alunos).

**Interface no Simulador:**
*   No simulador, o usuário controla a criação de turmas arrastando componentes para a grade.
*   O sistema informa ao usuário quantos "Alunos Não Alocados" existem.
*   Quando o número de "Alunos Não Alocados" atingir 3 ou mais, o usuário tem a indicação clara de que deve criar uma nova turma para absorver essa demanda excedente de forma viável.
`;