# Checklist de Fluxo do Painel do Líder

Este documento verifica a conformidade do aplicativo atual com o fluxo de navegação e visualização de dados descrito.

**Legenda:**
- ✅ **Conforme:** A funcionalidade está implementada exatamente como descrito.
- ⚠️ **Parcialmente Conforme:** A funcionalidade existe, mas com pequenas diferenças em relação à descrição.
- ❌ **Não Conforme:** A funcionalidade descrita não foi encontrada ou difere significativamente.

---

## 1. Navegação Principal e Módulos

| Módulo | Descrição da Listagem | Status | Observações |
| :--- | :--- | :--- | :--- |
| **Visão Geral** | Tela default com KPIs, alertas e gráficos. | ✅ | Conforme. |
| **Liderados** | Tabela com nome, cargo, progresso obrigatório, próximo vencimento, última atividade, engajamento e status. | ✅ | Conforme. Todos os campos estão presentes em `TeamMembersTable`. |
| **Cursos** | Tabela com total de liderados inscritos, total com atraso, taxa de conclusão e progresso médio da equipe. | ✅ | Conforme. Todos os campos estão presentes em `CoursesTable`. |
| **Trilhas** | Tabela com duração, total de liderados inscritos, total com atraso, taxa de conclusão e progresso médio. | ✅ | Conforme. Todos os campos estão presentes em `TrailsTable`. |
| **Pulses** | Tabela com total de visualizações, tipo, duração e progresso médio (taxa de consumo). | ✅ | Conforme. Todos os campos estão presentes em `PulsesTable`. |
| **Canais** | Tabela com descrição, total de liderados inscritos, total de pulses, última atividade e progresso geral (engajamento). | ✅ | Conforme. Todos os campos estão presentes em `ChannelsTable`. |
| **Eventos** | Tabela com total de inscritos, datas, status e índice de participação. | ✅ | Conforme. Todos os campos estão presentes em `EventsTable`. |

## 2. Fluxos de Detalhe (Cliques em Linhas)

### 2.1 Clique em Liderado ➡️ Visão do Perfil do Usuário

| Aba | Descrição da Tela | Status | Observações |
| :--- | :--- | :--- | :--- |
| **Visão Geral (Default)** | Cursos concluídos, progresso, pontuação, ranking e gráfico histórico. | ✅ | Conforme. A `MemberOverview` exibe todos esses dados. |
| **Cursos** | Lista de cursos com nome, progresso e data meta. | ✅ | Conforme. |
| **Trilhas** | Lista de trilhas com progresso e data meta. | ✅ | Conforme. |
| **Pulses** | Lista de pulses inscritos e progresso do usuário. | ❌ | A `MemberPulsesTable` exibe a "Data de Consumo", não um percentual de progresso, o que é comum para pulses. |
| **Canais** | Lista de canais com pulses totais/consumidos e progresso. | ✅ | Conforme. A `MemberChannelsTable` mostra o progresso no canal. |
| **Eventos** | Lista de eventos com data e status de participação. | ✅ | Conforme. A `MemberEventsTable` mostra os dados corretos. |

### 2.2 Clique em Curso ➡️ Detalhe do Curso

| Aba | Descrição da Tela | Status | Observações |
| :--- | :--- | :--- | :--- |
| **Liderados Inscritos (Default)** | Lista de liderados inscritos. | ✅ | Conforme. |
| **Não Matriculados** | Lista de liderados não inscritos. | ✅ | Conforme. |
| **Associado às Trilhas** | Lista de trilhas vinculadas e o progresso da equipe nelas. | ✅ | Conforme. |

### 2.3 Clique em Trilha ➡️ Detalhe da Trilha

| Aba | Descrição da Tela | Status | Observações |
| :--- | :--- | :--- | :--- |
| **Liderados Inscritos (Default)** | Lista de liderados inscritos. | ✅ | Conforme. |
| **Não Matriculados** | Lista de liderados não inscritos. | ✅ | Conforme. |
| **Cursos na Trilha** | Lista de cursos vinculados. | ✅ | Conforme. |
| **Pulses na Trilha** | Lista de pulses vinculados. | ✅ | Conforme. |

### 2.4 Clique em Pulse ➡️ Detalhe do Pulse

| Aba | Descrição da Tela | Status | Observações |
| :--- | :--- | :--- | :--- |
| **Consumido por (Default)** | Lista de usuários que consumiram, com data de consumo. | ✅ | Conforme. O fluxo pede "progresso ou data", e a data é exibida. |
| **Não Visualizaram** | Lista de usuários que não consumiram. | ✅ | Conforme. |
| **Parte das Trilhas** | Lista de trilhas em que o pulse está vinculado. | ✅ | Conforme. |

### 2.5 Clique em Canal ➡️ Detalhe do Canal

| Aba | Descrição da Tela | Status | Observações |
| :--- | :--- | :--- | :--- |
| **Liderados Inscritos (Default)** | Lista de liderados inscritos com progresso no canal. | ✅ | Conforme. |
| **Pulses no Canal** | Lista de pulses vinculados com o progresso da equipe. | ✅ | Conforme. |
| **Não Inscritos** | Lista de liderados não inscritos. | ✅ | Conforme. |

### 2.6 Clique em Evento ➡️ Detalhe do Evento

| Cenário | Descrição da Tela | Status | Observações |
| :--- | :--- | :--- | :--- |
| **Evento Agendado** | Listagem de liderados inscritos e não inscritos. | ✅ | Conforme. O componente `ScheduledEventDetail` é renderizado com abas de "Participantes" e "Não Inscritos". |
| **Evento Realizado** | Listagem de liderados que participaram e não participaram. | ✅ | Conforme. O componente `CompletedEventDetail` trata ambos os cenários (dia único e múltiplos dias). |

---

## 3. Conclusão

O aplicativo apresenta **alta conformidade** com o fluxo descrito. As principais funcionalidades de navegação e visualização de dados estão implementadas corretamente. As poucas discrepâncias encontradas são menores e não comprometem a experiência do usuário principal, representando oportunidades de refinamento futuro.