# Rolagem Critica - Site Frontend E-commerce

Projeto academico de e-commerce focado em frontend (HTML, CSS e JavaScript puro), com fluxo completo de vitrine, carrinho, checkout e area de perfil/admin usando `localStorage` para simulacao de dados.

## Como executar

1. Abra a pasta do projeto no VS Code.
2. Execute com uma extensao de servidor local (ex.: Live Server) ou abra `index.html` no navegador.
3. Navegue normalmente pelo fluxo da loja.

## Fluxos implementados

- Catalogo de produtos por paginas de categoria.
- Busca por termo (`busca.html?q=`).
- Pagina de produto com exibicao de estoque disponivel.
- Carrinho com adicionar/remover e ajuste de quantidade.
- Calculo de frete por CEP (ViaCEP) e regra de frete gratis por regiao/faixa.
- Checkout com endereco e pagamento simulado (PIX/cartao).
- Cadastro, login, logout e recuperacao de senha simulada.
- Perfil com atualizacao de dados e alteracao de senha.
- Historico de pedidos com "Ver Detalhes".
- Painel admin com gestao de status de pedidos e estoque.

## Regras de negocio

- Bloqueio de compra quando estoque for insuficiente.
- Validacao de quantidade maxima por item no carrinho.
- Validacao de cadastro:
  - Nome sem numeros e com minimo de 10 caracteres.
  - CPF no formato `000.000.000-00`.
  - Telefone no formato `(DD) 99999-9999`.
  - Senha com minimo de 8 caracteres.
- Validacao de checkout antes de finalizar o pedido.

## Dados de teste

- Admin padrao:
  - Email: `admin@rolagemcritica.com`
  - Senha: `admin`
- Usuario de teste:
  - Crie pelo formulario em `cadastro.html`.

## Evidencias para entrega

- Fluxo recomendado para gravacao/prints:
  1. Catalogo -> produto.
  2. Produto -> carrinho.
  3. Carrinho -> checkout.
  4. Checkout -> confirmacao.
  5. Perfil -> historico de pedidos (ver detalhes).
  6. Admin -> ajuste de estoque e status do pedido.

## Escopo e limitacoes

- Projeto somente frontend.
- Dados persistidos no `localStorage` do navegador.
- Nao ha backend real, gateway de pagamento real ou autenticacao em servidor.
