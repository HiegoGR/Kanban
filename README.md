# Kanban

Projeto simples de quadro Kanban criado com Angular 21.

## Funcionalidades

- 4 colunas: Backlog, Para fazer, Em desenvolvimento e Finalizado
- Criar cards com título, descrição curta, detalhes e responsável
- Editar card em qualquer etapa
- Alterar prioridade
- Mover card entre colunas
- Registrar automaticamente as datas de movimentação
- Ver histórico de movimentação do card
- Excluir card

## Como rodar

```bash
npm install
npm start
```

ou:

```bash
ng serve -o
```

Acesse:

```text
http://localhost:4200
```

## Observação

Os dados estão mockados em memória no `app.component.ts`. Ao atualizar a página, as alterações voltam para o estado inicial. Uma próxima melhoria seria salvar os cards no `localStorage` ou integrar com uma API backend.
