// Configuração do Supabase
const supabaseUrl = 'https://unwzexiljnemttknupwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud3pleGlsam5lbXR0a251cHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTIxNzIsImV4cCI6MjA3MTEyODE3Mn0.5QSJF1ktICzTkB1AjVIv5fgvs9M6K9ECchYwlsI2xdA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis para paginação
let currentPage = 1;
const productsPerPage = 12;
let allProducts = [];
let filteredProducts = [];

// Flag para controlar se o evento já foi configurado
let cartEventInitialized = false;

// Função para formatar preço
function formatPrice(price) {
    if (!price) return 'R$ 0,00';
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para renderizar avaliação em estrelas
function renderRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '<i class="fa fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            starsHtml += '<i class="fa fa-star-half-o"></i>';
        } else {
            starsHtml += '<i class="fa fa-star-o"></i>';
        }
    }
    
    return starsHtml;
}

// Função para renderizar produtos
function renderProducts(products) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) {
        console.error('Elemento #products-container não encontrado');
        return;
    }
    
    // Limpar apenas se for a primeira página
    if (currentPage === 1) {
        productsContainer.innerHTML = '';
    }
    
    if (!products || products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">Nenhum produto encontrado</p>';
        return;
    }
    
    // Usar DocumentFragment para melhor performance
    const fragment = document.createDocumentFragment();
    
    products.forEach(produto => {
        const productCard = document.createElement('div');
        productCard.className = 'col s6 m4 l3';
        
        // Usar estoque_geral em vez de estoque
        const estoqueClass = (produto.estoque_geral > 0) ? 'stock' : 'stock out-of-stock';
        const estoqueText = (produto.estoque_geral > 0) ? 'Disponível' : 'Esgotado';
        
        // Usar valor_varejo em vez de venda_valor
        const preco = produto.valor_varejo || 0;
        
        // Verifica se o produto é novo (coluna "novos" = "sim")
        const isNew = produto.novos && produto.novos.toLowerCase() === 'sim';
        
        productCard.innerHTML = `
            <div class="product-card">
                <div class="content">
                    <img src="${produto.imagem || 'img/placeholder.jpg'}" alt="${produto.titulo || 'Produto sem nome'}" loading="lazy">
                    ${isNew ? '<span class="new-badge">Novo</span>' : ''}
                    <h5><a href="sobreprod.html?id=${produto.id || ''}">${produto.titulo || 'Produto sem nome'}</a></h5>
                    <h6 class="price">${formatPrice(preco)}</h6>
                    <div class="details">
                        ${produto.descricao ? `<div>${produto.descricao}</div>` : ''}
                        ${produto.cor_banho ? `<div>Banho: ${produto.cor_banho}</div>` : ''}
                        ${produto.tempo_garantia ? `<div>Garantia: ${produto.tempo_garantia} meses</div>` : ''}
                    </div>
                    <div class="${estoqueClass}">${estoqueText}</div>
                    <div class="rating">
                        ${renderRating(produto.avaliacao || 0)}
                    </div>
                    <button class="add-to-cart" data-id="${produto.id}" data-name="${produto.titulo}" data-price="${preco}" data-image="${produto.imagem || 'img/placeholder.jpg'}">
                        <i class="fa fa-shopping-cart"></i> Adicionar
                    </button>
                </div>
            </div>    
        `;
        
        fragment.appendChild(productCard);
    });
    
    productsContainer.appendChild(fragment);
    
    // Configurar eventos dos botões do carrinho (apenas uma vez)
    if (!cartEventInitialized) {
        initializeCartEvents();
        cartEventInitialized = true;
    }
}

// Configurar eventos dos botões do carrinho (apenas uma vez)
function initializeCartEvents() {
    console.log('Inicializando eventos do carrinho...');
    
    // Usar event delegation no container principal
    document.addEventListener('click', function(event) {
        // Verificar se o clique foi em um botão "Adicionar ao carrinho" ou em seus filhos
        const addToCartButton = event.target.closest('.add-to-cart');
        
        if (addToCartButton) {
            event.preventDefault();
            event.stopPropagation();
            
            const id = addToCartButton.getAttribute('data-id');
            const name = addToCartButton.getAttribute('data-name');
            const price = parseFloat(addToCartButton.getAttribute('data-price'));
            const image = addToCartButton.getAttribute('data-image');
            
            // Verificar se a função addToCart existe (do carrinho.js)
            if (typeof addToCart === 'function') {
                addToCart(id, name, price, image);
            } else {
                console.error('Função addToCart não encontrada. Verifique se carrinho.js foi carregado primeiro.');
                // Fallback: função local temporária para evitar erro
                fallbackAddToCart(id, name, price, image);
            }
        }
    });
}

// Função fallback caso carrinho.js não esteja carregado
function fallbackAddToCart(id, name, price, image) {
    console.warn('Usando fallbackAddToCart - carrinho.js não carregado');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verificar se o produto já está no carrinho
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    if (typeof M !== 'undefined') {
        M.toast({html: 'Produto adicionado ao carrinho!'});
    }
    
    const button = document.querySelector(`.add-to-cart[data-id="${id}"]`);
    if (button) {
        button.classList.add('added');
        setTimeout(() => button.classList.remove('added'), 1000);
    }
}

// Função para atualizar contador do carrinho
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Função para carregar mais produtos
function loadMoreProducts() {
    currentPage++;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(0, endIndex);
    
    renderProducts(productsToShow);
    
    const loadMoreBtn = document.getElementById('load-more-button');
    if (loadMoreBtn && endIndex >= filteredProducts.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// Função para filtrar produtos
function filterProducts(category, sortBy) {
    currentPage = 1;
    
    // Filtrar por categoria
    if (category) {
        filteredProducts = allProducts.filter(product => 
            product.categoria && product.categoria.toLowerCase() === category.toLowerCase()
        );
    } else {
        filteredProducts = [...allProducts];
    }
    
    // Ordenar
    if (sortBy === 'menor-preco') {
        filteredProducts.sort((a, b) => 
            (a.valor_varejo || 0) - (b.valor_varejo || 0)
        );
    } else if (sortBy === 'maior-preco') {
        filteredProducts.sort((a, b) => 
            (b.valor_varejo || 0) - (a.valor_varejo || 0)
        );
    }
    
    const initialProducts = filteredProducts.slice(0, productsPerPage);
    renderProducts(initialProducts);
    
    const loadMoreBtn = document.getElementById('load-more-button');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 
            filteredProducts.length > productsPerPage ? 'block' : 'none';
    }
}

// Função principal para buscar produtos
async function fetchProducts() {
    try {
        console.log('Iniciando busca de produtos...');
        const loader = document.getElementById('fakeLoader');
        if (loader) loader.style.display = 'block';
        
        // Verificar conexão com Supabase
        if (!supabaseClient) {
            throw new Error('Cliente Supabase não inicializado');
        }
        
        // Buscar produtos no Supabase
        const { data: produtos, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .order('titulo', { ascending: true });
        
        if (error) {
            console.error('Erro na consulta:', error);
            throw error;
        }
        
        console.log('Produtos recebidos:', produtos);
        
        if (!produtos || produtos.length === 0) {
            console.warn('Nenhum produto encontrado na tabela');
        }
        
        allProducts = produtos || [];
        filteredProducts = [...allProducts];
        
        renderProducts(filteredProducts.slice(0, productsPerPage));
        
        const loadMoreBtn = document.getElementById('load-more-button');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 
                filteredProducts.length > productsPerPage ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        
        // Mostrar mensagem de erro para o usuário
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="col s12">
                    <p class="center-align red-text">
                        Erro ao carregar produtos. Por favor, recarregue a página.
                    </p>
                    <p class="center-align">Detalhes: ${error.message}</p>
                </div>
            `;
        }
        
    } finally {
        const loader = document.getElementById('fakeLoader');
        if (loader) loader.style.display = 'none';
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando...');
    
    try {
        // Verificar se o cliente Supabase foi criado
        if (!supabaseClient) {
            throw new Error('Falha na inicialização do Supabase');
        }
        
        // Atualizar contador do carrinho
        updateCartCount();
        
        // Buscar produtos
        fetchProducts();
        
        // Event listener para aplicar filtros
        const applyButton = document.getElementById('apply-filters');
        if (applyButton) {
            applyButton.addEventListener('click', function() {
                const category = document.getElementById('category-select').value;
                const sortBy = document.getElementById('sort-select').value;
                
                filterProducts(category, sortBy);
            });
        }
        
        // Event listener para carregar mais produtos
        const loadMoreBtn = document.getElementById('load-more-button');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loadMoreProducts();
            });
        }
        
        // Permitir aplicar filtros pressionando Enter nos selects
        const categorySelect = document.getElementById('category-select');
        const sortSelect = document.getElementById('sort-select');
        
        if (categorySelect && sortSelect && applyButton) {
            [categorySelect, sortSelect].forEach(select => {
                select.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        applyButton.click();
                    }
                });
            });
        }
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        
        // Mostrar mensagem de erro para o usuário
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="col s12">
                    <p class="center-align red-text">
                        Erro ao inicializar a página: ${error.message}
                    </p>
                </div>
            `;
        }
    }
});