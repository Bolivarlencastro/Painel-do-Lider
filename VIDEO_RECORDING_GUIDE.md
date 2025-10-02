
# Roteiro de Gravação Bruta - Apresentação do Painel do Líder

Este é um guia de fluxo de navegação para gravar um vídeo completo demonstrando as funcionalidades do Painel do Líder. Siga estes passos para capturar todas as telas e interações necessárias.

---

### **Parte 1: A Visão Geral - O Diagnóstico em 30 Segundos**

1.  **Comece na tela "Visão Geral"**. A câmera está focada nos KPIs.
2.  **Passe o mouse sobre cada um dos 5 KPIs** lentamente, para que o tooltip com o contexto de cada métrica apareça. Deixe-o visível por 2-3 segundos em cada um.
3.  **Aponte para o ícone de informação** ao lado do título "Painel do Líder". Passe o mouse sobre ele para mostrar o tooltip que explica o escopo dos dados.
4.  **Mova o mouse para o canto inferior direito** da tela para revelar o botão roxo do "Painel de Corner Cases". Clique para abrir, mostre rapidamente as opções, e clique para fechar. (Isso demonstra a existência de ferramentas de debug/teste).

---

### **Parte 2: A Ação Proativa - Do Alerta à Solução**

1.  **Foque nos "Cards de Ação Rápida"**.
2.  **Destaque o card "Matrículas Obrigatórias"**. Aponte para o número em vermelho, indicando que há problemas.
3.  **Clique no botão "Ver todos"** neste card.
    > *A tela deve navegar automaticamente para a aba "Liderados" e a tabela já deve estar filtrada, mostrando apenas os usuários com pendências em obrigatórios.*
4.  **Role a tabela de Liderados para cima e para baixo** para mostrar os resultados filtrados. Aponte para as badges "Em Risco" e "Atenção".

---

### **Parte 3: O Drill-Down - Investigando um Liderado (Nível 1)**

1.  Na tabela de Liderados (ainda filtrada), **clique em um liderado com o status "Em Risco"** (ex: João Silva).
    > *O modal de detalhes do liderado deve abrir.*
2.  **Permaneça na aba "Visão Geral"** do modal. Destaque o "Diagnostic Card" (o card colorido no topo), os KPIs individuais e role para baixo para mostrar o gráfico de "Histórico de Conclusão".
3.  **Navegue pelas abas dentro do modal**:
    -   Clique na aba **"Cursos"**. Mostre a lista de matrículas, destacando os diferentes status, a barra de progresso e a data meta.
    -   Clique na aba **"Trilhas"**. Mostre a lista de trilhas.
    -   Clique rapidamente nas abas **"Pulses"**, **"Canais"** e **"Eventos"** para mostrar a completude da visão.

---

### **Parte 4: A Análise Granular - Detalhes da Matrícula (Nível 2)**

1.  Ainda no modal do liderado, **volte para a aba "Cursos"**.
2.  **Clique em um curso que esteja com o status "Iniciada" ou "Expirada"**.
    > *A visão do modal deve mudar para a tela de "Atividades da Matrícula".*
3.  **Mostre esta nova tela em detalhes**. Aponte para o resumo de performance (pontos, progresso), e role a lista de conteúdos para mostrar o status de cada item individual (vídeo, quiz, etc.).
4.  **Clique no botão "Voltar para o perfil"** para retornar ao modal de detalhes do liderado.
5.  **Feche o modal de detalhes do liderado** clicando no 'X' para retornar à tabela principal.

---

### **Parte 5: A Visão por Conteúdo**

1.  Na tela de "Liderados", **limpe o filtro/busca** para exibir todos os membros da equipe novamente.
2.  **Clique na aba "Cursos"** na navegação principal.
3.  Mostre a tabela de cursos. **Clique no cabeçalho da coluna "Liderados com Atraso"** para ordenar e trazer os cursos mais problemáticos para o topo.
4.  **Clique em um curso com dados relevantes**.
    > *O modal de detalhes do curso deve abrir.*
5.  **Navegue pelas abas do modal**: "Matrículas", "Não Matriculados" e "Associado às Trilhas".
6.  Feche o modal.
7.  **Clique rapidamente nas outras abas principais**: "Trilhas", "Pulses", "Canais", "Eventos", apenas para mostrar que as telas existem e estão populadas.

---

### **Parte 6: Ferramenta Avançada - Personificação de Líder**

1.  **Retorne para a "Visão Geral"**.
2.  Abra o "Painel de Corner Cases" e **ative a opção "Personificar Líder"**.
    > *O seletor de líderes deve aparecer no cabeçalho do painel.*
3.  **Clique no seletor** para abrir o dropdown.
4.  Mostre a lista, incluindo a busca e o agrupamento por cargo.
5.  **Selecione um único líder**. Mostre como os KPIs e cards da Visão Geral se atualizam para refletir apenas os dados da equipe daquele líder.
6.  Abra o seletor novamente e **selecione um segundo líder**. Mostre a visão consolidada (ex: "2 Líderes").
7.  Abra o seletor mais uma vez e **clique no checkbox de uma área inteira** para selecionar todos os líderes daquele grupo.
8.  **Clique em "Limpar Seleção"** e, em seguida, desative a personificação no painel de debug.

---

### **Parte 7: Funcionalidades Globais e Encerramento**

1.  **Clique no ícone de "Admin"** na barra lateral esquerda. Mostre brevemente o painel de admin.
2.  **Clique de volta em "Painel do Líder"** na barra lateral.
3.  No cabeçalho principal (top-bar), **clique no botão de busca** para abrir o `SearchDialog`. Digite algo e depois feche.
4.  Aponte para a área de **perfil do usuário e pontos** no canto superior direito.
5.  Vá para qualquer tabela com paginação (ex: "Liderados"), role até o final e **clique no botão "Baixar Dados"**. Mostre o menu de exportação que aparece.

Fim da gravação.
