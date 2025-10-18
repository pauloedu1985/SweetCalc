# Changelog

## v0.2.0 - 2025-10-18

### Adicionado

- **Cálculo de Custo de Gás:** Implementado o cálculo automático de custo de gás (GLP) na tela de criação de receitas, com base no tempo e temperatura do forno.
- O custo do gás agora é somado ao custo total da receita e salvo com os detalhes da receita.

## v1.0.0 - 2025-10-16

### Adicionado

- **Autenticação de Usuário:** Implementado sistema de login e registro utilizando Firebase Authentication.
- **Páginas Protegidas:** Adicionadas rotas e componentes para proteger páginas que exigem que o usuário esteja logado.
- **Componente de Navegação:** Criado um menu de navegação que exibe diferentes opções para usuários logados e não logados.
- **Contexto de Autenticação:** Implementado um `AuthContext` para gerenciar e compartilhar o estado de autenticação em toda a aplicação.

### Modificado

- **Arquitetura do Projeto:** O backend baseado em Node.js/Express foi removido. A aplicação agora utiliza o Firebase como backend (BaaS - Backend as a Service).
- **Estrutura de Pastas:** O código do frontend foi movido para a pasta `frontend/` para melhor organização.
- **Configuração do Firebase:** A inicialização e configuração do Firebase foram centralizadas e movidas para a pasta `frontend/`.

### Removido

- **Backend legadp:** A pasta `backend/` e toda a sua estrutura baseada em Node.js foram removidas do projeto.
- **Arquivos de Configuração:** Arquivos de configuração do Firebase (`firebase.json`, `.firebaserc`, etc.) foram removidos da raiz do projeto para corrigir a inicialização incorreta.
- **Pasta `.emergent` e seus metadados:** Removida para desvincular o projeto da ferramenta de criação.
