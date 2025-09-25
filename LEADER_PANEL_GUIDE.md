# Guia Completo: Painel do Líder Konquest

## 1. Visão Geral e Propósito

O **Painel do Líder** é uma central de comando analítica e de gestão, projetada para empoderar líderes com as ferramentas e os dados necessários para monitorar, guiar e impulsionar o desenvolvimento de suas equipes.

O objetivo é transformar a gestão de pessoas de reativa para **proativa**, fornecendo insights claros que permitem ao líder:
- **Identificar Riscos:** Ver quem está com treinamentos obrigatórios atrasados ou com baixo engajamento.
- **Acompanhar o Progresso:** Entender o desempenho da equipe em cursos, trilhas e outros conteúdos.
- **Tomar Decisões Baseadas em Dados:** Utilizar métricas de performance para guiar conversas de feedback e planos de desenvolvimento.
- **Aumentar o Engajamento:** Facilitar o acompanhamento e a comunicação, incentivando uma cultura de aprendizado contínuo.

---

## 2. Estrutura e Hierarquia de Navegação

O painel foi projetado com uma lógica de **drill-down**, permitindo que o líder navegue de uma visão macro para os detalhes mais granulares com poucos cliques.

A hierarquia básica é:
1.  **Visão Geral (Dashboard):** KPIs e alertas de alto nível.
2.  **Módulos (Tabelas Principais):** Visões agregadas por Liderados, Cursos, Trilhas, etc.
3.  **Detalhes do Item (Modal Nível 1):** Ao clicar em um item de uma tabela (ex: um liderado), um modal com informações detalhadas é aberto.
4.  **Detalhes Específicos (Modal Nível 2):** Dentro do modal de um liderado, é possível clicar em um curso específico para ver o progresso detalhado em cada atividade daquele curso.

**Exemplo de Fluxo:**
*Visão Geral ➡️ Card "Liderados Inativos" ➡️ Tabela de Liderados (filtrada) ➡️ Clica em "João Silva" ➡️ Modal de Detalhes do João ➡️ Aba "Cursos" ➡️ Clica no curso "Liderança 2.0" ➡️ Tela de Atividades do João no Curso.*

---

## 3. Explicação dos Módulos (Abas de Navegação)

O painel é dividido em sete módulos principais, acessíveis por abas.

### A. Visão Geral (Dashboard)
É a tela inicial, oferecendo um resumo da saúde da equipe.

-   **KPIs Principais:**
    -   **Total de Matrículas:** Soma de todas as matrículas em Cursos e Trilhas.
    -   **Taxa de Liderados Ativos:** % de liderados que acessaram a plataforma nos últimos 30 dias.
    -   **Taxa de Conclusão:** % de matrículas concluídas em relação ao total de matrículas da equipe.
    -   **Média de Horas por Liderado:** Média de horas de treinamento, calculada com base nos cursos concluídos e pulses consumidos.
    -   **Progresso dos Cursos Obrigatórios:** % de conclusão do total de matrículas obrigatórias.

-   **Cards de Ação Rápida:**
    -   **Matrículas Obrigatórias:** Foco em **compliance**. Lista os liderados com cursos obrigatórios vencidos ou com vencimento próximo (7 dias). É a prioridade máxima do líder.
    -   **Matrículas Livres:** Foco em **engajamento**. Lista liderados com matrículas livres (não obrigatórias) que possuem prazo vencido ou a vencer nos próximos 30 dias.
    -   **Liderados Inativos:** Foco em **reativação**. Lista liderados que não acessam a plataforma há mais de 15 dias.

-   **Cards de Desempenho:**
    -   **Normativas Vencendo:** Uma visão focada nos prazos dos cursos obrigatórios do tipo "Normativa", ordenada por urgência.
    -   **Ranking:** Um resumo do Top 5 da equipe, promovendo a gamificação e o reconhecimento.

### B. Módulo Liderados
Centraliza a gestão individual dos membros da equipe.

-   **Lógica da Tabela:**
    -   **Progresso Obrigatório:** Mostra o status apenas dos conteúdos mandatórios (`Atrasado`, `A vencer`, `Concluído`).
    -   **Próximo Vencimento:** Calcula e exibe o prazo mais próximo para um conteúdo obrigatório, facilitando a priorização.
    -   **Última Atividade:** Converte a data do último acesso em um formato relativo ("Hoje", "Há 5 dias").
    -   **Engajamento:** Um indicador calculado que cruza o progresso geral do usuário com sua última atividade. Classificado como `Alto`, `Médio` ou `Baixo`.
    -   **Status Geral:** O indicador mais importante. Consolida os dados e classifica o liderado em uma de quatro categorias, com a seguinte prioridade:
        1.  **Em Risco (Vermelho):** Possui pelo menos um conteúdo obrigatório **atrasado**.
        2.  **Atenção (Amarelo):** Não tem atrasos, mas possui um obrigatório vencendo em até 7 dias OU está inativo há mais de 15 dias (e menos de 30).
        3.  **Em Dia (Verde):** Sem pendências críticas.
        4.  **Inativo (Cinza):** Não acessa há mais de 30 dias (sobrepõe o status "Em Dia").

-   **Drill-Down (Detalhes do Liderado):** Ao clicar em um liderado, um modal exibe:
    -   **Visão Geral:** KPIs individuais, diagnóstico de status e gráfico de histórico de progresso.
    -   **Abas de Conteúdo (Cursos, Trilhas, etc.):** Listas de todos os conteúdos nos quais o liderado está inscrito, com seu progresso e status individual em cada um.

### C. Módulo Cursos
Permite analisar o desempenho da equipe em cada curso.

-   **Lógica da Tabela:**
    -   **Matrículas:** Total de liderados da equipe inscritos no curso.
    -   **Liderados com Atraso:** Contagem de quantos desses liderados estão com o curso vencido (se aplicável).
    -   **Taxa de Conclusão:** `(Liderados que concluíram / Liderados inscritos) * 100`. Mede a eficácia.
    -   **Progresso Médio:** A média do percentual de progresso de todos os liderados inscritos. Mede o andamento.

-   **Drill-Down (Detalhes do Curso):** Ao clicar, o modal mostra:
    -   **Liderados Inscritos:** Lista quem está fazendo o curso, com progresso e status individual.
    -   **Não Matriculados:** Lista quem da equipe ainda não se inscreveu.
    -   **Associado às Trilhas:** Mostra em quais trilhas de aprendizagem este curso está incluído.

### D. Módulo Trilhas
Semelhante ao de Cursos, mas focado em jornadas de aprendizagem.

-   **Lógica da Tabela:** Os campos são os mesmos do módulo Cursos, mas calculados com base no progresso geral da trilha. A coluna **Duração** exibe a soma da duração de todos os conteúdos da trilha.
-   **Drill-Down (Detalhes da Trilha):**
    -   Mostra os liderados inscritos e não inscritos.
    -   Lista todos os **cursos e pulses** que compõem a trilha.

### E. Módulo Pulses
Focado em micro-learning e conteúdos rápidos.

-   **Lógica da Tabela:**
    -   **Visualizações:** Contagem de quantos liderados da equipe consumiram o pulse.
    -   **Taxa de Consumo:** `(Liderados que consumiram / Liderados inscritos no canal do pulse) * 100`. Mede o alcance do pulse dentro do seu público-alvo.

-   **Drill-Down (Detalhes do Pulse):**
    -   **Consumido por:** Lista quem visualizou e a data.
    -   **Não Visualizaram:** Lista quem ainda não visualizou.
    -   **Parte das Trilhas:** Mostra se o pulse faz parte de alguma trilha.

### F. Módulo Canais
Monitora o engajamento em canais de conteúdo.

-   **Lógica da Tabela:**
    -   **Última Atividade:** Mostra a data da interação mais recente de qualquer membro da equipe com qualquer pulse do canal.
    -   **Progresso Geral:** Métrica-chave que calcula a % de consumo. `(Total de pulses consumidos pela equipe / (Nº de liderados inscritos * Nº de pulses no canal)) * 100`.

-   **Drill-Down (Detalhes do Canal):**
    -   **Liderados Inscritos:** Mostra o progresso de cada membro no canal (quantos pulses consumiu do total).
    -   **Pulses no Canal:** Lista os conteúdos do canal e o progresso da equipe em cada um.
    -   **Não Inscritos:** Lista quem da equipe não segue o canal.

### G. Módulo Eventos
Acompanha a participação em eventos presenciais ou online.

-   **Lógica da Tabela:**
    -   **Status:** `Agendado` ou `Realizado`, com base na data.
    -   **Participação:** Para eventos realizados, exibe a taxa de comparecimento da equipe inscrita.

-   **Drill-Down (Detalhes do Evento):**
    -   **Se Agendado:** Mostra quem está inscrito e quem não está, permitindo enviar lembretes.
    -   **Se Realizado:** Mostra quem participou e quem não participou. Para eventos de múltiplos dias, oferece uma visão detalhada por dia.

---

## 4. Funcionalidades Globais e Ações

-   **Busca e Filtros:** Todas as tabelas principais possuem campos de busca e filtros contextuais (ex: filtrar por status, performance) para facilitar a análise.
-   **Download de Dados:** Um botão localizado no rodapé das tabelas (na área de paginação) permite exportar os dados da visão atual para formatos como CSV, PDF e Excel.
-   **Ações Diretas:** Em certas telas (como Planos de Desenvolvimento), líderes podem executar ações como **"Lembrar equipe"**, agilizando a comunicação e a gestão de pendências.
