// ===== SISTEMA DE BUSCA =====
function realizarBusca(event) {
    if (event) event.preventDefault();
    let btn = event.target || event;
    let input = btn.previousElementSibling;
    if (input && input.tagName === 'INPUT') {
        let query = input.value.trim();
        if (query) {
            window.location.href = 'busca.html?q=' + encodeURIComponent(query);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

const normalizeProductName = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

    
// === 0. INICIALIZACAO DE ADMIN ===
let currentUsers = JSON.parse(localStorage.getItem('rolagem_usuarios')) || [];
const adminExists = currentUsers.find(u => u.isAdmin === true || u.email === 'admin@rolagemcritica.com');
if (!adminExists) {
    currentUsers.push({ id: 'admin1', nome: 'Administrador', email: 'admin@rolagemcritica.com', senha: 'admin', isAdmin: true });
    localStorage.setItem('rolagem_usuarios', JSON.stringify(currentUsers));
}

// Atualizar header actions DINAMICAMENTE se logado como admin
let tempLoggedUser = JSON.parse(localStorage.getItem('rolagem_usuarioLogado'));
if (tempLoggedUser && tempLoggedUser.isAdmin) {
    const accLinks = document.querySelectorAll('a[href="login.html"], a[href="perfil.html"]');
    accLinks.forEach(link => {
        if (link.textContent.includes('Conta') || link.textContent.includes('Perfil')) {
            link.textContent = 'Painel Admin';
            link.href = 'admin.html';
        }
    });
}

    // === 1. SISTEMA DE BUSCA NA VIEW DE BUSCA ===
    if (window.location.pathname.includes('busca.html')) {
        let params = new URLSearchParams(window.location.search);
        let q = params.get('q');
        let searchTitle = document.getElementById('search-title');
        let products = document.querySelectorAll('#search-grid .product-card');
        
        if (q) {
            q = q.toLowerCase();
            if (searchTitle) searchTitle.innerText = 'Resultados da Busca: "' + q + '"';
            let foundCount = 0;
            products.forEach(p => {
                let titleDiv = p.querySelector('.product-title');
                if (titleDiv) {
                    let title = titleDiv.innerText.toLowerCase();
                    if (title.includes(q)) {
                        p.style.display = 'block';
                        foundCount++;
                    } else {
                        p.style.display = 'none';
                    }
                }
            });
            if (foundCount === 0 && searchTitle) searchTitle.innerText = 'Nenhum resultado encontrado para "' + q + '"';
        }
    }
    
    // Anexar realizarBusca aos campos da lupa
    document.querySelectorAll('.search-bar button').forEach(btn => {
        btn.onclick = realizarBusca;
        let input = btn.previousElementSibling;
        if(input) {
            input.addEventListener('keypress', function(e) {
                if(e.key === 'Enter') {
                    e.preventDefault();
                    btn.click();
                }
            });
        }
    });

    // === 2. VISUALIZACAO DINAMICA DE PRODUTOS ===
    document.querySelectorAll('a[href="produto.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            let card = e.target.closest('.product-card');
            if (e.target.closest('.btn-add') || e.target.closest('.btn-action') || e.target.tagName.toLowerCase() === 'button') {
                return;
            }
            if (card) {
                e.preventDefault();
                let productData = {
                    titulo: card.querySelector('.product-title')?.textContent.trim() || 'Produto Desconhecido',
                    imagem: card.querySelector('.product-img')?.src || 'https://via.placeholder.com/600x600',
                    preco: card.querySelector('.product-price')?.childNodes[0].textContent.trim() || 'R$ 0,00'
                };
                localStorage.setItem('rolagem_produto_view', JSON.stringify(productData));
                window.location.href = 'produto.html';
            }
        });
    });

    if (window.location.pathname.includes('produto.html')) {
        let productData = JSON.parse(localStorage.getItem('rolagem_produto_view'));
        const titleEl = document.querySelector('.product-detail-info h1');
        if (productData && titleEl) {
            titleEl.textContent = productData.titulo;
            document.querySelector('.product-detail-img img').src = productData.imagem;
            document.querySelector('.product-detail-img img').alt = productData.titulo;
            document.querySelector('.price').textContent = productData.preco;
            document.title = productData.titulo + ' | Rolagem Critica';
        }

        const stockInfo = document.getElementById('stock-info');
        const qtdInput = document.getElementById('qtd');
        const addBtn = document.querySelector('.product-detail-info .btn');
        if (titleEl && stockInfo) {
            const updateProductStockView = () => {
                const tituloPagina = normalizeProductName(titleEl.textContent || '');
                const estMock = JSON.parse(localStorage.getItem('rolagem_estoque_mock')) || [];
                const produtoEstoque = estMock.find(x => normalizeProductName(x.nome) === tituloPagina);
                const estoqueTotal = produtoEstoque ? Number(produtoEstoque.qtd) || 0 : 0;

                const carrinho = JSON.parse(localStorage.getItem('rolagem_carrinho')) || [];
                const itemNoCarrinho = carrinho.find(i => normalizeProductName(i.titulo || i.id) === tituloPagina);
                const qtdNoCarrinho = itemNoCarrinho ? Number(itemNoCarrinho.quantidade) || 0 : 0;

                const qtdDisponivel = Math.max(estoqueTotal - qtdNoCarrinho, 0);

                let selecionada = 1;
                if (qtdInput) {
                    selecionada = parseInt(qtdInput.value, 10);
                    if (isNaN(selecionada) || selecionada < 1) selecionada = 1;
                    if (qtdDisponivel === 0) selecionada = 0;
                    else if (selecionada > qtdDisponivel) selecionada = qtdDisponivel;

                    qtdInput.max = String(Math.max(qtdDisponivel, 1));
                    qtdInput.value = String(selecionada);
                    qtdInput.disabled = qtdDisponivel <= 0;
                }

                const restanteAposSelecao = Math.max(qtdDisponivel - selecionada, 0);
                if (qtdDisponivel > 0) {
                    stockInfo.textContent = 'Estoque disponivel: ' + qtdDisponivel + ' unidade(s) | Restam ' + restanteAposSelecao + ' apos esta selecao';
                    stockInfo.style.color = 'var(--gray)';
                } else {
                    stockInfo.textContent = 'Produto esgotado no momento';
                    stockInfo.style.color = '#c91818';
                }

                if (addBtn) {
                    addBtn.disabled = qtdDisponivel <= 0;
                    addBtn.style.opacity = qtdDisponivel <= 0 ? '0.6' : '1';
                    addBtn.style.cursor = qtdDisponivel <= 0 ? 'not-allowed' : 'pointer';
                }
            };

            if (qtdInput) {
                qtdInput.addEventListener('input', updateProductStockView);
                qtdInput.addEventListener('change', updateProductStockView);
            }
            window.addEventListener('cartUpdated', updateProductStockView);
            updateProductStockView();
        }
    }

    // === 3. LOGIN E CADASTRO ===
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const nomeInput = document.getElementById('nome');
        const telefoneInput = document.getElementById('telefone');
        const cpfInput = document.getElementById('cpf');
        const registerFeedback = document.getElementById('register-feedback');

        const setRegisterFeedback = (msg, field) => {
            if (registerFeedback) {
                registerFeedback.style.color = '#d32f2f';
                registerFeedback.textContent = msg || '';
            }
            if (field && typeof field.focus === 'function') {
                field.focus();
                field.setAttribute('aria-invalid', 'true');
            }
        };
        const clearInvalid = () => {
            [nomeInput, telefoneInput, cpfInput, document.getElementById('email'), document.getElementById('data_nasc'), document.getElementById('senha'), document.getElementById('confirma_senha')]
                .filter(Boolean)
                .forEach(el => el.removeAttribute('aria-invalid'));
        };

        if (cpfInput) {
            cpfInput.addEventListener('input', function () {
                const digits = this.value.replace(/\D/g, '').slice(0, 11);
                this.value = digits
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            });
        }

        if (telefoneInput) {
            telefoneInput.addEventListener('input', function () {
                const digits = this.value.replace(/\D/g, '').slice(0, 11);
                if (digits.length <= 10) {
                    this.value = digits
                        .replace(/(\d{2})(\d)/, '($1) $2')
                        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
                } else {
                    this.value = digits
                        .replace(/(\d{2})(\d)/, '($1) $2')
                        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
                }
            });
        }

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearInvalid();
            if (registerFeedback) registerFeedback.textContent = '';
            const nome = (nomeInput ? nomeInput.value : '').replace(/\s+/g, ' ').trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const telefone = (telefoneInput ? telefoneInput.value : '').trim();
            const cpf = (cpfInput ? cpfInput.value : '').trim();
            const dataNascInput = document.getElementById('data_nasc');
            const dataNasc = (dataNascInput?.value || '').trim();
            const senhaInput = document.getElementById('senha');
            const confirmaSenhaInput = document.getElementById('confirma_senha');
            const emailInput = document.getElementById('email');
            const senha = senhaInput.value;
            const confirma_senha = confirmaSenhaInput.value;

            if (!nome || nome.length < 10) return setRegisterFeedback('O nome deve ter pelo menos 10 caracteres.', nomeInput);
            if (/\d/.test(nome)) return setRegisterFeedback('O nome nao pode conter numeros.', nomeInput);
            if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) return setRegisterFeedback('O nome deve conter apenas letras e espacos.', nomeInput);

            if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) return setRegisterFeedback('CPF invalido. Use o formato 000.000.000-00.', cpfInput);
            if (!/^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(telefone)) return setRegisterFeedback('Telefone invalido. Use o formato (DD) 99999-9999.', telefoneInput);
            if (!dataNasc) return setRegisterFeedback('Informe a data de nascimento.', dataNascInput);

            if (senha !== confirma_senha) return setRegisterFeedback('As senhas nao coincidem.', confirmaSenhaInput);
            if (senha.length < 8) return setRegisterFeedback('A senha deve ter no minimo 8 caracteres.', senhaInput);

            let usuarios = JSON.parse(localStorage.getItem('rolagem_usuarios')) || [];
            if (usuarios.find(user => user.email.toLowerCase() === email)) return setRegisterFeedback('E-mail ja cadastrado!', emailInput);

            usuarios.push({ id: Date.now(), nome: nome, email: email, telefone: telefone, cpf: cpf, data_nasc: dataNasc, senha: senha });
            localStorage.setItem('rolagem_usuarios', JSON.stringify(usuarios));
            if (registerFeedback) {
                registerFeedback.style.color = '#32bcad';
                registerFeedback.textContent = 'Cadastro efetuado com sucesso! Redirecionando...';
            }
            alert('Cadastro efetuado com sucesso!');
            window.location.href = 'login.html';
        });
    }

    const loginform = document.getElementById('login-form');
    if (loginform) {
        loginform.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const senha = document.getElementById('senha').value;
            let usuarios = JSON.parse(localStorage.getItem('rolagem_usuarios')) || [];
            const user = usuarios.find(u => u.email.toLowerCase() === email && u.senha === senha);

            if (user) {
                localStorage.setItem('rolagem_usuarioLogado', JSON.stringify({ id: user.id, nome: user.nome, email: user.email, isAdmin: user.isAdmin }));
                alert('Bem-vindo de volta, ' + user.nome + '!');
                if (user.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                alert('E-mail ou senha incorretos.');
            }
        });
    }

    const recoverForm = document.getElementById('recover-form');
    if (recoverForm) {
        recoverForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim().toLowerCase();
            let usuarios = JSON.parse(localStorage.getItem('rolagem_usuarios')) || [];
            const user = usuarios.find(u => u.email.toLowerCase() === email);

            if (user) {
                alert('Sua senha atual e: ' + user.senha + '\n\n(Simulacao de recuperacao de senha via e-mail)');
                window.location.href = 'login.html';
            } else {
                alert('E-mail nao encontrado no sistema.');
            }
        });
    }

    // Header updates ("Minha Conta" -> "Meu Perfil" / "Painel Admin")
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        const accLink = Array.from(headerActions.querySelectorAll('a')).find(a => a.textContent.trim().includes('Conta') || a.textContent.trim().includes('Perfil') || a.textContent.trim().includes('Painel'));
        if (accLink) {
            let loggedIn = JSON.parse(localStorage.getItem('rolagem_usuarioLogado'));
            if (loggedIn) {
                if (loggedIn.isAdmin) {
                    accLink.textContent = 'Painel Admin';
                    accLink.href = 'admin.html';
                } else {
                    accLink.textContent = 'Meu Perfil';
                    accLink.href = 'perfil.html';
                }
            } else {
                accLink.textContent = 'Minha Conta';
                accLink.href = 'login.html';
            }
        }
    }

    // Perfil e Funcionalidades
    if (window.location.pathname.includes('perfil.html')) {
        let userLogado = JSON.parse(localStorage.getItem('rolagem_usuarioLogado'));
        if (!userLogado) {
            alert('Voce precisa estar logado!');
            window.location.href = 'login.html';
            return;
        }

        const profileName = document.getElementById('profile-user-name');
        if (profileName) profileName.textContent = 'Ola, ' + userLogado.nome;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.onclick = (e) => { 
            e.preventDefault(); 
            localStorage.removeItem('rolagem_usuarioLogado'); 
            window.location.href='index.html'; 
        };

        // Tabs functionality
        const tabsNav = document.querySelectorAll('#profile-tabs-nav a:not(#logout-btn)');
        const tabsContent = document.querySelectorAll('.profile-tab');

        tabsNav.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tabsNav.forEach(t => t.classList.remove('active'));
                tabsContent.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const target = document.getElementById(tab.getAttribute('data-target'));
                if (target) target.classList.add('active');
            });
        });

        // Preencher dados pessoais no form
        const inputNome = document.getElementById('perfil-nome');
        const inputEmail = document.getElementById('perfil-email');
        const inputTel = document.getElementById('perfil-telefone');
        const inputCpf = document.getElementById('perfil-cpf');
        
        if (inputNome) inputNome.value = userLogado.nome || '';
        if (inputEmail) inputEmail.value = userLogado.email || '';
        if (inputTel) inputTel.value = userLogado.telefone || '';
        if (inputCpf) inputCpf.value = userLogado.cpf || '';

        window.salvarDadosPerfil = function() {
            let uName = inputNome.value.trim();
            let uTel = inputTel.value.trim();
            let uCpf = inputCpf.value.trim();
            let msg = document.getElementById('msg-dados');
            
            if(!uName) {
                msg.style.color = '#d32f2f'; msg.textContent = 'Nome e obrigatorio.'; return;
            }

            // Update user in memory
            userLogado.nome = uName;
            userLogado.telefone = uTel;
            userLogado.cpf = uCpf;
            localStorage.setItem('rolagem_usuarioLogado', JSON.stringify(userLogado));

            // Update local users db too to persist over logouts
            let localUsers = JSON.parse(localStorage.getItem('rolagem_usuarios')) || [];
            if (!localUsers.length) {
                const legacyUsers = JSON.parse(localStorage.getItem('rolagem_users')) || [];
                if (legacyUsers.length) {
                    localUsers = legacyUsers;
                    localStorage.setItem('rolagem_usuarios', JSON.stringify(localUsers));
                }
            }
            let userIndex = localUsers.findIndex(u => u.email === userLogado.email);
            if(userIndex !== -1) {
                localUsers[userIndex] = { ...localUsers[userIndex], nome: uName, telefone: uTel, cpf: uCpf };
                localStorage.setItem('rolagem_usuarios', JSON.stringify(localUsers));
            }

            if (profileName) profileName.textContent = 'Ola, ' + userLogado.nome;
            msg.style.color = '#32bcad'; msg.textContent = 'Dados atualizados com sucesso!';
            setTimeout(() => msg.textContent = '', 3000);
        };

        window.salvarSenhaPerfil = function() {
            let sAtual = document.getElementById('perfil-senha-atual').value;
            let sNova = document.getElementById('perfil-senha-nova').value;
            let sConf = document.getElementById('perfil-senha-confirma').value;
            let msg = document.getElementById('msg-senha');

            let localUsers = JSON.parse(localStorage.getItem('rolagem_usuarios')) || [];
            if (!localUsers.length) {
                const legacyUsers = JSON.parse(localStorage.getItem('rolagem_users')) || [];
                if (legacyUsers.length) {
                    localUsers = legacyUsers;
                    localStorage.setItem('rolagem_usuarios', JSON.stringify(localUsers));
                }
            }
            let currentUser = localUsers.find(u => u.email === userLogado.email);
            let senhaValid = currentUser ? currentUser.senha : userLogado.senha;

            if(sAtual !== senhaValid) {
                msg.style.color = '#d32f2f'; msg.textContent = 'Senha atual incorreta.'; return;
            }
            if(sNova.length < 8) {
                msg.style.color = '#d32f2f'; msg.textContent = 'A nova senha deve ter no minimo 8 caracteres.'; return;
            }
            if(sNova !== sConf) {
                msg.style.color = '#d32f2f'; msg.textContent = 'As novas senhas nao conferem.'; return;
            }

            userLogado.senha = sNova;
            localStorage.setItem('rolagem_usuarioLogado', JSON.stringify(userLogado));

            let userIndex = localUsers.findIndex(u => u.email === userLogado.email);
            if(userIndex !== -1) {
                localUsers[userIndex].senha = sNova;
                localStorage.setItem('rolagem_usuarios', JSON.stringify(localUsers));
            }

            document.getElementById('form-seguranca').reset();
            msg.style.color = '#32bcad'; msg.textContent = 'Senha alterada com sucesso!';
            setTimeout(() => msg.textContent = '', 3000);
        };

        // Render Pedidos
        const pedidos = JSON.parse(localStorage.getItem('rolagem_pedidos')) || [];
        const meusPedidos = pedidos.filter(p => p.email === userLogado.email);
        const containerPedidos = document.getElementById('pedidos-container');
        
        const formatMoney = (value) => 'R$ ' + (Number(value) || 0).toFixed(2).replace('.', ',');
        const escapeHtml = (value) => String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        window.toggleOrderDetails = function(orderId) {
            const panel = document.getElementById('order-details-' + orderId);
            if (!panel) return;
            const btn = document.querySelector('.order-details-btn[data-order="' + orderId + '"]');
            const willOpen = panel.style.display === 'none' || panel.style.display === '';
            panel.style.display = willOpen ? 'block' : 'none';
            if (btn) btn.textContent = willOpen ? 'Ocultar Detalhes' : 'Ver Detalhes';
        };

        let htmlPedidos = '';
        if (meusPedidos.length === 0) {
            htmlPedidos = '<p style="color: var(--gray);">Voce ainda nao tem pedidos finalizados.</p>';
        } else {
            meusPedidos.reverse().forEach(p => {
                // Compatibility for old orders missing the 'valorTotal' key
                let total = p.valorTotal || p.carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
                let metodo = p.pagamento || 'cartao';
                let subtotalPedido = (p.carrinho || []).reduce((acc, item) => acc + ((item.preco || 0) * (item.quantidade || 0)), 0);
                let itemsHtml = (p.carrinho || []).map(item => {
                    const nome = escapeHtml(item.titulo);
                    const qtd = Number(item.quantidade) || 0;
                    const precoUnit = Number(item.preco) || 0;
                    const totalItem = qtd * precoUnit;
                    return '<li class="order-item-line">'
                        + '<span class="order-item-name">' + qtd + 'x ' + nome + '</span>'
                        + '<strong class="order-item-total">' + formatMoney(totalItem) + '</strong>'
                        + '</li>';
                }).join('');

                if (!itemsHtml) {
                    itemsHtml = '<li class="order-item-empty">Itens indisponiveis para este pedido antigo.</li>';
                }

                htmlPedidos += `
                <div class="order-card">
                    <div class="order-main">
                        <h3 class="order-id">Pedido #${p.id}</h3>
                        <p class="order-date">Realizado em ${p.data}</p>
                        <p class="order-total-line">Total: ${formatMoney(total)} <span class="order-payment">via ${metodo}</span></p>
                    </div>
                    <div class="order-actions">
                        <span class="status">${p.status || 'Pendente'}</span>
                        <a href="javascript:void(0)" class="order-details-btn" data-order="${p.id}" onclick="window.toggleOrderDetails('${p.id}')">Ver Detalhes</a>
                    </div>
                    <div id="order-details-${p.id}" class="order-details-panel" style="display:none;">
                        <h4 class="order-details-title">Itens do Pedido</h4>
                        <ul class="order-items-list">${itemsHtml}</ul>
                        <p class="order-summary-line"><strong>Subtotal:</strong> ${formatMoney(subtotalPedido)}</p>
                        <p class="order-summary-line"><strong>Total Final:</strong> ${formatMoney(total)}</p>
                    </div>
                </div>`;
            });
        }
        if(containerPedidos) containerPedidos.innerHTML = htmlPedidos;
    }

    // === 4. SISTEMA DE carrinho ===
    const atualizarContador = () => {
        let car = JSON.parse(localStorage.getItem('rolagem_carrinho')) || [];
        let qty = car.reduce((acc, item) => acc + item.quantidade, 0);
        document.querySelectorAll('.header-actions a[href="carrinho.html"]').forEach(l => l.textContent = 'carrinho (' + qty + ')');
    };
    atualizarContador();

    // Botoes de ADD
    document.querySelectorAll('.btn-add, .product-card .btn, .product-detail-info .btn').forEach(btn => {
        btn.removeAttribute('onclick'); // override hardcoded
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            let productElement = e.target.closest('.product-card');
            let titulo = "Produto Misterioso", precoTexto = "0", imagem = "", quantidadeReq = 1;

            if (productElement) {
                titulo = productElement.querySelector('.product-title')?.textContent.trim();
                let nodes = productElement.querySelector('.product-price')?.childNodes;
                precoTexto = nodes ? nodes[0].textContent.trim() : '0';
                imagem = productElement.querySelector('.product-img')?.src;
            } else {
                productElement = document.querySelector('.product-detail-info');
                if(productElement) {
                    titulo = productElement.querySelector('h1')?.textContent.trim();
                    precoTexto = productElement.querySelector('.price')?.textContent.trim();
                    imagem = document.querySelector('.product-detail-img img')?.src;
                    quantidadeReq = parseInt(document.getElementById('qtd')?.value) || 1;
                }
            }

            if (!titulo) return;

            // BLOQUEIO DE estoque ZERO
            let estMock = JSON.parse(localStorage.getItem('rolagem_estoque_mock')) || [];
            const tituloNorm = normalizeProductName(titulo);
            let prodencontrado = estMock.find(x => normalizeProductName(x.nome) === tituloNorm);
            if (prodencontrado && prodencontrado.qtd < 1) {
                return alert('Ops! Este produto esta esgotado no momento ("' + titulo + '").');
            }

            const preco = parseFloat(precoTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
            
            let car = JSON.parse(localStorage.getItem('rolagem_carrinho')) || [];
            const idx = car.findIndex(i => normalizeProductName(i.id || i.titulo) === tituloNorm);

            if (idx > -1) {
                let currentMax = prodencontrado ? prodencontrado.qtd : 0;
                let available = currentMax > 10 ? 10 : currentMax;
                if (car[idx].quantidade + quantidadeReq > available) return alert('Estoque insuficiente! Voce so pode adicionar ate ' + available + ' unidades deste produto.');
                car[idx].quantidade += quantidadeReq;
            } else {
                let currentMax = prodencontrado ? prodencontrado.qtd : 0;
                let available = currentMax > 10 ? 10 : currentMax;
                if (quantidadeReq > available) return alert('Estoque insuficiente! Voce so pode adicionar ate ' + available + ' unidades deste produto.');
                car.push({ id: titulo, titulo, preco, imagem, quantidade: quantidadeReq });
            }

            localStorage.setItem('rolagem_carrinho', JSON.stringify(car));
            window.dispatchEvent(new Event('cartUpdated'));
            atualizarContador();
            alert(titulo + ' foi adicionado ao carrinho com sucesso!');
        });
    });

    // PAGINA DO carrinho
    const cartCont = document.getElementById('cart-items-container');
    if (cartCont) {
        const renderCart = () => {
            let car = JSON.parse(localStorage.getItem('rolagem_carrinho')) || [];
            cartCont.innerHTML = '';
            let subtotal = 0; let itemCount = 0;
            
            if (car.length === 0) {
                cartCont.innerHTML = '<p class="empty-cart-msg">Seu carrinho esta vazio.</p>';
            } else {
                car.forEach((item, i) => {
                    subtotal += item.preco * item.quantidade; itemCount += item.quantidade;
                    cartCont.innerHTML += `
                        <div class="cart-item">
                            <img src="${item.imagem}" class="item-img" alt="${item.titulo}">
                            <div class="item-details">
                                <div class="item-title">${item.titulo}</div>
                                <div class="item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                                <div class="quantity-control">
                                    <button class="quantity-btn btn-minus" data-index="${i}">-</button>
                                    <input type="number" class="quantity-input" value="${item.quantidade}" readonly>
                                    <button class="quantity-btn btn-plus" data-index="${i}">+</button>
                                </div>
                            </div>
                            <button class="item-remove btn-remove-item" data-index="${i}">Remover</button>
                        </div>`;
                });
            }

            // Atualiza resumo
            const subVals = document.querySelectorAll('.summary-row span:last-child');
            if(subVals[0]) subVals[0].textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
            
            let frete = parseFloat(localStorage.getItem('rolagem_frete'));
            const spanFrete = document.getElementById('cart-frete-val');
            
            // Revalida frete Gratis se o usuario adicionou/removeu itens e ja tinha calculado
            if (!isNaN(frete)) {
                // Se ja tinha calculado frete, vamos tentar re-garantir a regra de >200 so por seguranca
                // (O ideal seria ler o CEP de novo, mas nao temos o CEP salvo. Vamos fazer de conta que ele recalcula)
                if (spanFrete) {
                    if (frete === 0) {
                        spanFrete.textContent = 'Gratis';
                        spanFrete.className = 'frete-val-gratis';
                    } else {
                        spanFrete.textContent = 'R$ ' + frete.toFixed(2).replace('.', ',');
                        spanFrete.className = 'frete-val-pago';
                    }
                }
            } else {
                frete = 0; // se nao calculou ainda, nao soma
                if (spanFrete) spanFrete.textContent = '--';
            }

            const ttl = document.querySelector('.summary-total span:last-child');
            let totalGeral = subtotal + frete;
            if(ttl) ttl.textContent = 'R$ ' + totalGeral.toFixed(2).replace('.', ',');

            const txtParcela = document.querySelector('.cart-summary > div[style*="text-align: right"]');
            if (txtParcela) txtParcela.textContent = `ou em ate 6x de R$ ${(totalGeral/6).toFixed(2).replace('.', ',')} sem juros`;



            // Listener de Botoes cart
            document.querySelectorAll('.btn-plus').forEach(b => b.onclick = (e) => {
                let id = e.target.getAttribute('data-index');
                let estMock = JSON.parse(localStorage.getItem('rolagem_estoque_mock')) || [];
                let p = estMock.find(x => normalizeProductName(x.nome) === normalizeProductName(car[id].titulo || car[id].id));
                let max = p ? p.qtd : 10;
                if (max > 10) max = 10;
                
                if (car[id].quantidade >= max) return alert(`Estoque limite atingido! (Max: ${max} unidades)`);
                car[id].quantidade++; localStorage.setItem('rolagem_carrinho', JSON.stringify(car)); atualizarContador(); renderCart();
            });
            document.querySelectorAll('.btn-minus').forEach(b => b.onclick = (e) => {
                let id = e.target.getAttribute('data-index');
                if (car[id].quantidade > 1) { 
                    car[id].quantidade--; 
                    localStorage.setItem('rolagem_carrinho', JSON.stringify(car)); 
                    atualizarContador(); renderCart(); 
                }
            });
            document.querySelectorAll('.item-remove').forEach(b => b.onclick = (e) => {
                let id = e.target.getAttribute('data-index');
                car.splice(id, 1); 
                localStorage.setItem('rolagem_carrinho', JSON.stringify(car)); 
                atualizarContador(); renderCart();
            });

            // Direcionar ao checkout
            const checkoutBtn = document.querySelector('.btn-checkout');
            if (checkoutBtn) {
                checkoutBtn.onclick = (e) => {
                    e.preventDefault();
                    if (car.length === 0) return alert('Adicione produtos no carrinho primeiro!');
                    if (!localStorage.getItem('rolagem_usuarioLogado')) {
                        alert('Voce precisa estar logado para ir ao checkout!'); window.location.href = 'login.html'; return;
                    }
                    window.location.href = 'checkout.html';
                };
            }
        };
        renderCart();

        // CALCULAR FRETE NO carrinho
        const btnFrete = document.getElementById('btn-calcular-frete');
        if (btnFrete) {
            btnFrete.addEventListener('click', async () => {
                const cepInput = document.getElementById('input-cep') || document.querySelector('input[placeholder="00000-000"]');
                const freteMsg = document.getElementById('frete-msg');
                const btnOriginalText = btnFrete.innerHTML;
                
                let cep = cepInput ? cepInput.value.replace(/\D/g, '') : '';
                
                if (cep.length === 8) {
                    btnFrete.innerHTML = 'Calculando...';
                    try {
                        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        const data = await response.json();
                        
                        if (!data.erro) {
                            // Simulando um valor de frete baseado no estado
                            let valorFrete = 25.90; // Padrao
                            if (data.uf === 'SP') valorFrete = 12.50;
                            else if (['RJ', 'MG', 'PR', 'SC', 'RS'].includes(data.uf)) valorFrete = 18.90;
                            else if (['ES', 'MS', 'GO', 'DF'].includes(data.uf)) valorFrete = 22.00;
                            else valorFrete = 35.00; // Norte/Nordeste
                            
                            // Regra de Frete Gratis: Sul/Sudeste + Mais de R$ 200,00
                            let carAtual = JSON.parse(localStorage.getItem('rolagem_carrinho')) || [];
                            let subtotalcarrinho = carAtual.reduce((s, i) => s + (i.preco * i.quantidade), 0);
                            const sulSudeste = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'];
                            
                            if (sulSudeste.includes(data.uf) && subtotalcarrinho >= 200) {
                                valorFrete = 0;
                            }
                            
                            localStorage.setItem('rolagem_frete', valorFrete.toString());
                            localStorage.setItem('rolagem_frete_uf', data.uf);
                            
                            const spanFrete = document.getElementById('cart-frete-val');
                            if(spanFrete) {
                                if (valorFrete === 0) {
                                    spanFrete.textContent = 'Gratis';
                                    spanFrete.className = 'frete-val-Gratis';
                                } else {
                                    spanFrete.textContent = 'R$ ' + valorFrete.toFixed(2).replace('.', ',');
                                    spanFrete.className = 'frete-val-pago';
                                }
                            }
                            
                            if(freteMsg) {
                                freteMsg.className = 'frete-msg frete-msg-success';
                                freteMsg.textContent = `Entrega em ${data.localidade} - ${data.uf}`;
                            }
                            
                            renderCart();
                        } else {
                            if(freteMsg) {
                                freteMsg.className = 'frete-msg frete-msg-error';
                                freteMsg.textContent = 'CEP nao encontrado.';
                            }
                        }
                    } catch (err) {
                        if(freteMsg) {
                            freteMsg.className = 'frete-msg frete-msg-error';
                            freteMsg.textContent = 'Erro ao consultar o CEP.';
                        }
                    } finally {
                        btnFrete.innerHTML = btnOriginalText;
                    }
                } else if(freteMsg) {
                    freteMsg.className = 'frete-msg frete-msg-error';
                    freteMsg.textContent = 'Por favor, insira um CEP valido.';
                }
            });
        }
    }

    // CHECKOUT PAGE
    if (window.location.pathname.includes('checkout.html')) {
        let car = JSON.parse(localStorage.getItem('rolagem_carrinho')) || [];
        if (car.length === 0) { alert('Carrinho vazio.'); window.location.href='index.html'; return; }
        if (!localStorage.getItem('rolagem_usuarioLogado')) { alert('Faca login primeiro.'); window.location.href='login.html'; return; }

        const renderResumoCheckout = () => {
            let subtotal = car.reduce((s, i) => s + (i.preco * i.quantidade), 0);
            let frete = parseFloat(localStorage.getItem('rolagem_frete')) || 0;
            let desconto = 0;
            
            const pixRadio = document.getElementById('pix');
            if (pixRadio && pixRadio.checked) {
                desconto = subtotal * 0.10; // 10% de desconto
            }

            let finalTotal = (subtotal - desconto) + frete;

            let cSub = document.getElementById('checkout-subtotal-val');
            let cSubLab = document.getElementById('checkout-subtotal-label');
            if(cSub) cSub.textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
            if(cSubLab) cSubLab.textContent = `Subtotal (${car.reduce((a,i)=>a+i.quantidade,0)} itens)`;
            
            let cDesc = document.getElementById('checkout-desc-val');
            if(cDesc) cDesc.textContent = desconto > 0 ? '- R$ ' + desconto.toFixed(2).replace('.', ',') : 'R$ 0,00';

            let cFrete = document.getElementById('checkout-frete-val');
            if (cFrete) {
                if (frete === 0) { cFrete.textContent = 'Gratis'; cFrete.className = 'frete-val-gratis'; }
                else { cFrete.textContent = 'R$ ' + frete.toFixed(2).replace('.', ','); cFrete.className = 'frete-val-pago'; }
            }
            
            let cTot = document.getElementById('checkout-total-val');
            if(cTot) cTot.textContent = 'R$ ' + finalTotal.toFixed(2).replace('.', ',');
        };

        renderResumoCheckout();
        window.addEventListener('paymentMethodChanged', renderResumoCheckout);

        // Sincroniza selecao visual PIX/Cartao com os radios.
        const paymentCards = document.querySelectorAll('#metodos-pagamento .pay-method');
        const syncPaymentSelection = () => {
            paymentCards.forEach(cardEl => {
                const radio = cardEl.querySelector('input[type="radio"]');
                if (!radio) return;
                if (radio.checked) cardEl.classList.add('selected');
                else cardEl.classList.remove('selected');
            });
            window.dispatchEvent(new Event('paymentMethodChanged'));
        };

        paymentCards.forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                const radio = cardEl.querySelector('input[type="radio"]');
                if (!radio) return;
                radio.checked = true;
                syncPaymentSelection();
            });

            const radio = cardEl.querySelector('input[type="radio"]');
            if (radio) {
                radio.addEventListener('change', syncPaymentSelection);
            }
        });

        syncPaymentSelection();

        // Busca de CEP automatica via API ViaCEP
        const cepInput = document.getElementById('checkout-cep') || document.querySelector('input[placeholder="00000-000"]');
        if (cepInput) {
            cepInput.addEventListener('blur', async (e) => {
                let cep = e.target.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    try {
                        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        const data = await response.json();
                        
                        if (!data.erro) {
                            const rua = document.getElementById('checkout-rua') || document.querySelector('input[placeholder*="Rua"]');
                            if(rua) rua.value = data.logradouro || '';
                            
                            const bairro = document.getElementById('bairro');
                            if(bairro) bairro.value = data.bairro || '';
                            
                            const cidade = document.getElementById('cidade');
                            if(cidade) cidade.value = data.localidade || '';
                            
                            const estado = document.getElementById('estado');
                            if(estado) estado.value = data.uf || '';
                            
                            const num = document.getElementById('numero');
                            if(num) num.focus(); // Joga o foco pro numero pra facilitar
                        }
                    } catch (err) {
                        console.error('Erro ao buscar o CEP:', err);
                    }
                }
            });
        }
    }

    // FINALIZAR A COMPRA (Funcao Global para o botao onSubmit / onclick)
    window.finalizarCompra = function(e) {
        if(e) e.preventDefault();
        let user = JSON.parse(localStorage.getItem('rolagem_usuarioLogado'));
        let car = JSON.parse(localStorage.getItem('rolagem_carrinho')) || [];
        
        if (!user) return alert('Faca login para concluir a compra!');
        if (car.length === 0) return alert('Ops! Seu carrinho esta vazio!');
        
        const cep = document.getElementById('checkout-cep') || document.querySelector('input[placeholder="00000-000"]');
        if (!cep || !cep.value.trim() || cep.value.length < 8) return alert('Preencha o CEP para entrega (minimo 8 digitos).');

        const rs = document.getElementById('checkout-rua') || document.querySelector('input[placeholder*="Rua"]');
        if (!rs || !rs.value.trim()) return alert('Preencha a Rua/Logradouro.');
        
        const num = document.getElementById('numero');
        if (!num || !num.value.trim()) return alert('Preencha o numero da residencia.');

        const cid = document.getElementById('cidade');
        if (!cid || !cid.value.trim()) return alert('Preencha a Cidade.');

        const est = document.getElementById('estado');
        if (!est || !est.value.trim()) return alert('Selecione o estado.');

        const card = document.getElementById('cartao');
        const pix = document.getElementById('pix');
        if(card && pix && !card.checked && !pix.checked) return alert('Escolha o metodo de pagamento (cartao ou PIX).');
        
        if (card && card.checked) {
            if (!document.getElementById('nome_cartao').value.trim()) return alert('Preencha o nome impresso no cartao.');
            if (document.getElementById('num_cartao').value.length < 16) return alert('Verifique o numero do cartao.');
            if (document.getElementById('val_cartao').value.length < 5) return alert('Preencha a validade corretamente (MM/AA).');
            if (document.getElementById('cvv_cartao').value.length < 3) return alert('Preencha o codigo de seguranca (CVV).');
        }

        let pedidos = JSON.parse(localStorage.getItem('rolagem_pedidos')) || [];
        
        // Bloqueio final e reducao de estoque
        let estMock = JSON.parse(localStorage.getItem('rolagem_estoque_mock')) || [];
        for (let item of car) {
            let info = estMock.find(x => normalizeProductName(x.nome) === normalizeProductName(item.titulo || item.id));
            if (info && item.quantidade > info.qtd) {
                return alert(`Falha na compra! O item "${item.titulo}" nao possui estoque suficiente. (Estoque atual: ${info.qtd})`);
            }
        }
        for (let item of car) {
            let info = estMock.find(x => normalizeProductName(x.nome) === normalizeProductName(item.titulo || item.id));
            if (info) info.qtd -= item.quantidade;
        }
        localStorage.setItem('rolagem_estoque_mock', JSON.stringify(estMock));

        // Calcular total com desconto para o card final
        let subtotal = car.reduce((s, i) => s + (i.preco * i.quantidade), 0);
        let txFrete = parseFloat(localStorage.getItem('rolagem_frete')) || 0;
        let cDesc = (pix && pix.checked) ? (subtotal * 0.10) : 0;

        pedidos.push({
            id: Date.now().toString().slice(-6),
            email: user.email,
            carrinho: car,
            data: new Date().toLocaleString('pt-BR'),
            pagamento: (card && card.checked) ? 'cartao' : 'PIX',
            valorTotal: (subtotal - cDesc) + txFrete
        });
        localStorage.setItem('rolagem_pedidos', JSON.stringify(pedidos));
        localStorage.removeItem('rolagem_carrinho');
        
                alert('COMPRA FINALIZADA COM SUCESSO! O rastreio sera enviado pro seu e-mail.');
        window.location.href = 'perfil.html';
    };
});

// === PAINEL ADMIN Funcionalidades ===
if (window.location.pathname.includes('admin.html')) {
    let userLogado = JSON.parse(localStorage.getItem('rolagem_usuarioLogado'));
    if (!userLogado || !userLogado.isAdmin) {
        alert('Acesso negado. Apenas administradores.');
        window.location.href = 'index.html';
    }

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) logoutBtn.onclick = (e) => { 
        e.preventDefault(); 
        localStorage.removeItem('rolagem_usuarioLogado'); 
        window.location.href = 'login.html'; 
    };

    const tabsNav = document.querySelectorAll('#admin-tabs-nav a:not(#admin-logout-btn)');
    const tabsContent = document.querySelectorAll('.profile-tab');

    tabsNav.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabsNav.forEach(t => t.classList.remove('active'));
            tabsContent.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            let targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    let allPedidos = JSON.parse(localStorage.getItem('rolagem_pedidos')) || [];
    let allUsers = JSON.parse(localStorage.getItem('rolagem_usuarios')) || [];

    let totalVendido = allPedidos.reduce((acc, p) => acc + (parseFloat(p.valorTotal) || 0), 0);
    document.getElementById('admin-total-vendido').textContent = 'R$ ' + totalVendido.toFixed(2).replace('.', ',');
    let pendentes = allPedidos.filter(p => !p.status || p.status === 'Pendente' || p.status === 'Processando').length;
    document.getElementById('admin-pedidos-pendentes').textContent = pendentes;

    const tbodyUsers = document.getElementById('admin-usuarios-tbody');
    if (tbodyUsers) {
        let htmlUsers = '';
        allUsers.forEach(u => {
            htmlUsers += `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 10px;">${u.nome || '-'}</td>
                    <td style="padding: 10px;">${u.email}</td>
                    <td style="padding: 10px;">
                        <span style="color: ${u.isAdmin ? 'var(--primary)' : 'var(--gray)'}">${u.isAdmin ? 'Sim' : 'nao'}</span>
                    </td>
                </tr>
            `;
        });
        tbodyUsers.innerHTML = htmlUsers || '<tr><td colspan="3" style="padding: 10px;">Nenhum usuario cadastrado.</td></tr>';
    }

    const containerPedidos = document.getElementById('admin-pedidos-container');
    if (containerPedidos) {
        let htmlPedidos = '';
        allPedidos.forEach(p => {
            let total = p.valorTotal || 0;
            let currentStatus = p.status || 'Pendente';
            let itemsHtml = p.carrinho ? p.carrinho.map(i => i.quantidade + 'x ' + i.titulo).join('<br>') : 'Itens antigos';
            htmlPedidos += `
                <div class="order-card" style="display:flex; flex-direction:column; align-items:flex-start; margin-bottom:1rem; border:1px solid #333; padding:1rem; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; width:100%; border-bottom:1px solid #333; padding-bottom:0.5rem; margin-bottom:0.5rem;">
                        <div>
                            <strong>ID: ${p.id}</strong><br>
                            <small style="color:var(--gray)">${p.data}</small><br>
                            <small style="color:var(--gray)">Cliente: ${p.email}</small>
                        </div>
                        <div style="text-align:right;">
                            <strong>Total: R$ ${total.toFixed(2).replace('.', ',')}</strong><br>
                            <small>Pgto: ${p.pagamento || '-'}</small>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <div style="font-size: 0.9rem;">
                            ${itemsHtml}
                        </div>
                        <div>
                            <select onchange="window.mudarStatusPedido(${p.id}, this.value)" style="padding:0.3rem; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
                                <option value="Pendente" ${currentStatus === 'Pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="Aprovado" ${currentStatus === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                                <option value="Enviado" ${currentStatus === 'Enviado' ? 'selected' : ''}>Enviado</option>
                                <option value="Entregue" ${currentStatus === 'Entregue' ? 'selected' : ''}>Entregue</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        });
        containerPedidos.innerHTML = htmlPedidos || '<p>Nenhum pedido encontrado.</p>';
    }

    window.mudarStatusPedido = function(id, novoStatus) {
        let peds = JSON.parse(localStorage.getItem('rolagem_pedidos')) || [];
        let pIndex = peds.findIndex(x => x.id == id);
        if(pIndex > -1) {
            peds[pIndex].status = novoStatus;
            localStorage.setItem('rolagem_pedidos', JSON.stringify(peds));
            let pend = peds.filter(x => !x.status || x.status === 'Pendente' || x.status === 'Processando').length;
            document.getElementById('admin-pedidos-pendentes').textContent = pend;
            alert('Status atualizado para: ' + novoStatus);
        }
    };

    const tbodyestoque = document.getElementById('admin-estoque-tbody');
    if (tbodyestoque) {
        const estoquePadrao = [
            { id: '101', nome: 'Sistema D20 Moderno - Edicao Revisada', qtd: 15 },
            { id: '102', nome: 'Bandeja de Dados em Couro Ecologico', qtd: 8 },
            { id: '103', nome: 'Labirinto da Morte - Edicao de Colecionador', qtd: 3 },
            { id: '104', nome: 'Bestiario Fantastico Vol. 1', qtd: 0 },
            { id: '105', nome: 'Conjunto de Dados Poliedrais - Nebulosa', qtd: 24 },
            { id: '106', nome: 'Escudo do Mestre (Cenario de Fantasia)', qtd: 10 },
            { id: '107', nome: 'O Guia Definitivo do Mestre de Jogo', qtd: 5 },
            { id: '108', nome: 'Colonos do Abismo: O Jogo de Tabuleiro', qtd: 12 },
            { id: '109', nome: 'Batalha dos Reinos: Deck Base', qtd: 20 },
            { id: '110', nome: 'A Queda do Dragao Dourado (Capa Dura)', qtd: 7 },
            { id: '111', nome: 'Pack de Miniaturas - Aventureiros Basicos', qtd: 15 },
            { id: '112', nome: 'Campanha Epica: As Cinzas do Imperio', qtd: 2 }
        ];

        // Migra e corrige dados antigos: nome sempre canonical por ID e quantidade preservada.
        let estoqueSalvo = JSON.parse(localStorage.getItem('rolagem_estoque_mock')) || [];
        if (!Array.isArray(estoqueSalvo)) estoqueSalvo = [];

        const byId = new Map();
        estoqueSalvo.forEach(item => {
            if (!item || !item.id) return;
            const qtdNum = parseInt(item.qtd, 10);
            byId.set(String(item.id), isNaN(qtdNum) || qtdNum < 0 ? 0 : qtdNum);
        });

        let estoque = estoquePadrao.map(base => ({
            id: base.id,
            nome: base.nome,
            qtd: byId.has(base.id) ? byId.get(base.id) : base.qtd
        }));

        localStorage.setItem('rolagem_estoque_mock', JSON.stringify(estoque));

        const renderestoque = () => {
            let htmlE = '';
            estoque.forEach(item => {
                let colorQtd = item.qtd > 5 ? 'var(--primary)' : (item.qtd > 0 ? 'orange' : 'red');
                htmlE += `
                    <tr style="border-bottom: 1px solid #333;">
                        <td style="padding: 10px;">#${item.id}</td>
                        <td style="padding: 10px;">${item.nome}</td>
                        <td style="padding: 10px; font-weight:bold; color: ${colorQtd}">${item.qtd} un</td>
                        <td style="padding: 10px;"><input type="number" min="0" value="${item.qtd}" onchange="window.updateestoque('${item.id}', this.value)" style="width: 80px; padding: 6px; border-radius: 4px; border: 1px solid #555; background: #222; color: #fff; font-weight: bold; text-align: center;"></td>
                    </tr>
                `;
            });
            tbodyestoque.innerHTML = htmlE;
        };
        renderestoque();

        window.updateestoque = function(id, novaQtd) {
            let est = JSON.parse(localStorage.getItem('rolagem_estoque_mock'));
            let item = est.find(i => i.id === id);
            if(item) {
                let parsed = parseInt(novaQtd);
                if(isNaN(parsed) || parsed < 0) parsed = 0;
                item.qtd = parsed;
                localStorage.setItem('rolagem_estoque_mock', JSON.stringify(est));
                estoque = est;
                renderestoque();
            }
        };
    }
}


































