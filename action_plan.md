# Plano de Ação: Refatoração para um Modelo Baseado em Matrículas

Este documento detalha o plano estratégico para refatorar a arquitetura de dados do Painel do Líder, movendo de um modelo centrado no conteúdo para um modelo centrado na **Matrícula**. Essa mudança é crucial para refletir com precisão a lógica de negócio do Konquest, onde a obrigatoriedade, os prazos e o progresso são atributos de uma matrícula, e não do curso em si.

## Fase 1: A Nova Arquitetura de Dados (Fundação)

O primeiro passo é redefinir a estrutura de dados para que a **Matrícula** (`Enrollment`) seja a entidade central que conecta um `Usuário` a um `Curso`.

### 1.1. Introduzir a Entidade `Matrícula`
Criaremos uma nova estrutura de dados para as matrículas. Cada objeto de matrícula conterá:
-   `id`: Identificador único da matrícula.
-   `userId`: ID do liderado.
-   `courseId`: ID do curso associado.
-   `type`: `'Livre' | 'Obrigatória'`.
-   `isNormativa`: `boolean` (verdadeiro apenas se `type` for `Obrigatória`).
-   `dueDate`: A data meta específica desta matrícula.
-   `progress`: O progresso (0-100) do usuário nesta matrícula específica.
-   `status`: O status atual da matrícula (`Não Iniciado`, `Em Andamento`, `Concluído`, `Atrasado`).
-   `renewalDate`: Data da próxima renovação (para normativas).

### 1.2. Atualizar Mocks de Dados
-   Criaremos um novo `ENROLLMENTS_DATA` que conterá todas as matrículas da equipe.
-   Removeremos as propriedades `isMandatory`, `isNormativa` e `dueDate` de `COURSES_DATA`. Um curso, por si só, não tem um prazo; a matrícula nele é que tem.
-   Em `TEAM_MEMBERS_DATA`, substituiremos `courseIds` por `enrollmentIds` para refletir a nova relação.

## Fase 2: Redesenho da Tela de Detalhes do Curso

A tela de detalhes de um curso deixará de mostrar apenas "quem está no curso" e passará a mostrar **"quais são as matrículas ativas neste curso"**.

### 2.1. Aba "Liderados Inscritos"
-   **Comportamento:** A lista agora exibirá uma linha **para cada matrícula**. Se um mesmo liderado tiver duas matrículas no mesmo curso (ex: uma concluída em 2023 e uma nova normativa para 2024), **ele aparecerá duas vezes na lista**.
-   **Visualização:** Cada linha da lista será enriquecida para mostrar o contexto da matrícula:
    -   **Badges de Identificação:** Ao lado do nome do curso ou do liderado, exibiremos badges claros: `[Obrigatória]`, `[Normativa]`, `[Livre]`.
    -   **Badge de Normativa:** O badge `[Normativa]` terá um ícone especial (ex: `autorenew`) e, ao passar o mouse sobre ele, um tooltip informará: "Esta matrícula deve ser renovada até `renewalDate`".
    -   **Dados da Matrícula:** As colunas de "Progresso", "Status" e "Data Meta" passarão a exibir os dados que vêm diretamente do objeto da matrícula, não mais do curso ou de um cálculo genérico do membro.

### 2.2. Aba "Não Matriculados"
-   **Comportamento:** A lógica aqui permanece simples. A aba listará todos os liderados da equipe que **não possuem nenhuma matrícula ativa** para este curso específico.

## Fase 3: Redesenho da Tela de Detalhes do Liderado

A visão de perfil do usuário se tornará um espelho fiel de seu histórico de matrículas.

### 3.1. Aba "Cursos"
-   **Comportamento:** Assim como na tela de detalhes do curso, esta aba não listará mais cursos únicos, e sim **todas as matrículas** do liderado.
-   **Visualização:** Cada item na lista representará uma matrícula e exibirá:
    -   O nome do curso.
    -   Os mesmos badges de identificação: `[Obrigatória]`, `[Normativa]`, `[Livre]`.
    -   O progresso e a data meta específicos daquela matrícula.
-   **Exemplo:** Se o liderado fez um curso de "Liderança" de forma livre em 2023 e agora foi matriculado obrigatoriamente no mesmo curso, a lista mostrará duas entradas distintas para "Liderança", cada uma com seu próprio status, progresso e tipo.

## Fase 4: Impacto em Outras Áreas do Painel

Esta mudança fundamental se propagará por todo o sistema, tornando-o mais preciso.

### 4.1. KPIs e Cards da Visão Geral
-   **"Matrículas Obrigatórias" / "Normativas Vencendo":** A lógica destes cards será refatorada para buscar diretamente em `ENROLLMENTS_DATA` por matrículas com `type === 'Obrigatória'` que estejam vencidas ou a vencer, ignorando as de tipo `Livre`.
-   **"Matrículas Livres":** Este card passará a analisar apenas as matrículas com `type === 'Livre'` que possuam uma data meta.

### 4.2. Tabelas Principais (`TeamMembersTable`, `CoursesTable`)
-   **Status Geral do Liderado (`TeamMembersTable`):** O cálculo do status (`Em Risco`, `Atenção`, etc.) será muito mais preciso, pois será baseado no status de suas **matrículas obrigatórias**, e não em uma lista genérica de cursos.
-   **Estatísticas do Curso (`CoursesTable`):** Os cálculos de "Liderados com Atraso" e "Taxa de Conclusão" serão feitos a partir da agregação dos dados de todas as matrículas associadas àquele curso.

## Resumo dos Benefícios do Plano

-   **Precisão nos Dados:** O painel refletirá a realidade do negócio, tratando cada matrícula como um evento único.
-   **Clareza para o Líder:** Ficará explícito quais pendências são obrigatórias, normativas ou de desenvolvimento livre.
-   **Escalabilidade:** O modelo suportará cenários complexos, como recertificações e múltiplas matrículas, sem a necessidade de gambiarras.
-   **Inteligência de Negócio:** Abre portas para futuros insights, como "Qual a taxa de conclusão média de matrículas livres vs. obrigatórias?".

Este plano estabelece uma base sólida e correta para a evolução do Painel do Líder.
