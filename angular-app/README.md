# Rolagem Critica - Angular + TypeScript

Projeto academico frontend de e-commerce desenvolvido em Angular com TypeScript.

## Como executar

No PowerShell (Windows), execute:

```bash
cmd /c npm.cmd install
cmd /c npm.cmd start
```

Abra `http://localhost:4200/`.

## Rotas principais

- `/catalogo`
- `/produtos`
- `/produto/:id`
- `/carrinho`
- `/checkout`
- `/pedido-finalizado`

## Funcionalidades principais

- Catalogo de produtos
- Detalhe de produto
- Carrinho com adicionar, remover e alterar quantidade
- Checkout com validacao basica de formulario
- Pagina de pedido finalizado

## Estrutura do projeto

- `src/app/core`: estado da aplicacao e servicos base
- `src/app/shared`: componentes reutilizaveis
- `src/app/domain`: modelos de dominio
- `src/app/data`: repositorios de dados
- `src/app/features`: telas por funcionalidade

## Estado da aplicacao

- `CartStore` com Signals: itens, subtotal, loading, error e success
- `CheckoutStore` com Signals: loading, error, success e ultimo pedido

## Componentes reutilizaveis

- `app-header`
- `app-product-card`

## Dados de teste

- A aplicacao usa dados mockados no frontend.
- Nao ha backend real ou gateway de pagamento real.

## Roteiro rapido de validacao

1. Acessar `/catalogo`
2. Abrir um produto em `/produto/:id`
3. Adicionar no `/carrinho`
4. Finalizar no `/checkout`
5. Confirmar em `/pedido-finalizado`
