# Kanban Frontend

Frontend da aplicação **Kanban**, desenvolvido com **Angular 21**. A aplicação permite o gerenciamento de tarefas em um quadro Kanban, consumindo uma API REST desenvolvida em Micronaut.

## Tecnologias

- Angular 21
- TypeScript
- Signals
- Standalone Components
- HTML/CSS
- Angular HttpClient

## Funcionalidades

- Cadastro de cards
- Edição de cards
- Exclusão de cards
- Movimentação entre colunas
- Controle de prioridade
- Histórico de movimentações
- Datas de criação e atualização
- Integração com API REST

## Estrutura do quadro

O sistema possui quatro colunas:

- 📋 Backlog
- 📝 Para Fazer
- ⚙️ Em Desenvolvimento
- ✅ Finalizado

## Pré-requisitos

- Node.js 20+
- NPM
- Backend Kanban em execução na porta **8080**

## Instalação

Instale as dependências:

```bash
npm install
```

## Executando a aplicação

Como o frontend utiliza um **proxy** para evitar problemas de CORS durante o desenvolvimento, execute:

```bash
ng serve --open --proxy-config proxy.conf.json
```

Ou configure o script `start` no `package.json` e execute:

```bash
npm start
```

A aplicação ficará disponível em:

```text
http://localhost:4200
```

## Proxy

O projeto utiliza o arquivo:

```text
proxy.conf.json
```

para redirecionar todas as chamadas:

```text
/api/*
```

para:

```text
http://localhost:8080
```

Isso permite que o frontend se comunique com o backend sem necessidade de configurar CORS durante o desenvolvimento.

## Backend

O backend deve estar em execução antes de iniciar o frontend.

Por padrão, a aplicação espera a API disponível em:

```text
http://localhost:8080/api/kanban
```

## Funcionalidades implementadas

- ✅ Listar cards
- ✅ Criar card
- ✅ Editar card
- ✅ Excluir card
- ✅ Movimentar card entre colunas
- ✅ Consultar histórico de movimentações
- ✅ Atualização automática da interface após operações

## Estrutura do projeto

```
src/
 ├── app/
 │   ├── models/
 │   ├── services/
 │   ├── app.component.*
 │   └── ...
 ├── styles.css
 └── main.ts
```

## Próximas melhorias

- Drag & Drop entre colunas
- Pesquisa de cards
- Filtros por prioridade
- Ordenação dos cards
- Autenticação de usuários
- Responsáveis cadastrados
- Dashboard com métricas
- Testes unitários e de integração
