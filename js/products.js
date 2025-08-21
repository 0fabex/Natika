// Configuração do Supabase
const supabaseUrl = 'https://unwzexiljnemttknupwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud3pleGlsam5lbXR0a251cHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTIxNzIsImV4cCI6MjA3MTEyODE3Mn0.5QSJF1ktICzTkB1AjVIv5fgvs9M6K9ECchYwlsI2xdA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis para paginação
let currentPage = 1;
const productsPerPage = 12;
let allProducts = [];
let filteredProducts = [];

// Função para formatar preço
function formatPrice(price) {
    if (!price) return 'R$ 0,00';
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
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
        
        productsContainer.appendChild(productCard);
    });
}

// Função auxiliar para renderizar avaliação em estrelas
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

// Função para carregar mais produtos
function loadMoreProducts() {
    currentPage++;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(0, endIndex);
    
    renderProducts(productsToShow);
    
    if (endIndex >= filteredProducts.length) {
        document.getElementById('load-more-button').style.display = 'none';
    }
}

// Função para ordenar produtos
function sortProducts(sortBy) {
    currentPage = 1;
    
    if (!filteredProducts) return;
    
    switch(sortBy) {
        case '1': // Novidades
            filteredProducts.sort((a, b) => 
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
            break;
        case '2': // Mais vendidos
            // Adicionando vendas como 0 por padrão, já que não existe essa coluna no banco
            filteredProducts.sort((a, b) => 
                (b.vendas || 0) - (a.vendas || 0)
            );
            break;
        case '3': // Melhores avaliações
            filteredProducts.sort((a, b) => 
                (b.avaliacao || 0) - (a.avaliacao || 0)
            );
            break;
        case '4': // Menor preço
            filteredProducts.sort((a, b) => 
                (a.valor_varejo || 0) - (b.valor_varejo || 0)
            );
            break;
        case '5': // Maior preço
            filteredProducts.sort((a, b) => 
                (b.valor_varejo || 0) - (a.valor_varejo || 0)
            );
            break;
        default:
            filteredProducts.sort((a, b) => 
                (a.titulo || '').localeCompare(b.titulo || '')
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
        
        // Inicializar os selects do Materialize
        const selectElems = document.querySelectorAll('select');
        if (selectElems.length > 0 && typeof M !== 'undefined') {
            M.FormSelect.init(selectElems);
        }
        
        // Buscar produtos
        fetchProducts();
        
        // Event listener para ordenação
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                sortProducts(this.value);
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
