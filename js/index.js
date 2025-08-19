// Configuração do Supabase
const supabaseUrl = 'https://unwzexiljnemttknupwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud3pleGlsam5lbXR0a251cHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTIxNzIsImV4cCI6MjA3MTEyODE3Mn0.5QSJF1ktICzTkB1AjVIv5fgvs9M6K9ECchYwlsI2xdA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Função para formatar preço
function formatPrice(price) {
    if (!price) return 'R$ 0,00';
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para renderizar produtos em destaque
function renderFeaturedProducts(products) {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) {
        console.error('Elemento #featured-products não encontrado');
        return;
    }
    
    featuredContainer.innerHTML = '';
    
    if (!products || products.length === 0) {
        featuredContainer.innerHTML = '<p class="center-align">Nenhum produto em destaque no momento</p>';
        return;
    }
    
    // Limitar a 3 produtos em destaque
    const limitedProducts = products.slice(0, 3);
    
    limitedProducts.forEach((produto) => {
        const productCard = document.createElement('div');
        productCard.className = 'col s6 m4';
        
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
                    <h5><a href="sobreprod.html?id=${produto.id || ''}">${produto.titulo || 'Produto sem nome'}</a></h5>                    <div class="star">
                        ${renderRating(produto.avaliacao || 0)}
                    </div>
                    <h6 class="price">${formatPrice(preco)}</h6>
                    <div class="${estoqueClass}">${estoqueText}</div>
                    <button class="add-to-cart" data-id="${produto.id}">
                        <i class="fa fa-shopping-cart"></i> Adicionar
                    </button>
                </div>
            </div>
        `;
        
        featuredContainer.appendChild(productCard);
    });
}

// Função auxiliar para renderizar avaliação em estrelas
function renderRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '<span class="active"><i class="fa fa-star"></i></span>';
        } else if (i === fullStars && hasHalfStar) {
            starsHtml += '<span class="active"><i class="fa fa-star-half-o"></i></span>';
        } else {
            starsHtml += '<span class="non-active"><i class="fa fa-star"></i></span>';
        }
    }
    
    return starsHtml;
}

// Função para buscar produtos em destaque
async function fetchFeaturedProducts() {
    try {
        console.log('Buscando produtos em destaque...');
        const loader = document.getElementById('fakeLoader');
        if (loader) loader.style.display = 'block';
        
        // Buscar produtos em destaque no Supabase (onde destaque = 'sim')
        const { data: produtos, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .eq('destaque', 'sim')
            .order('titulo', { ascending: true });
        
        if (error) {
            console.error('Erro na consulta de produtos em destaque:', error);
            throw error;
        }
        
        console.log('Produtos em destaque recebidos:', produtos);
        
        if (!produtos || produtos.length === 0) {
            console.warn('Nenhum produto em destaque encontrado');
        }
        
        renderFeaturedProducts(produtos || []);
        
    } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
        
        // Mostrar mensagem de erro para o usuário
        const featuredContainer = document.getElementById('featured-products');
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="col s12">
                    <p class="center-align red-text">
                        Erro ao carregar produtos em destaque.
                    </p>
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
    console.log('DOM carregado, inicializando produtos em destaque...');
    
    try {
        // Verificar se o cliente Supabase foi criado
        if (!supabaseClient) {
            throw new Error('Falha na inicialização do Supabase');
        }
        
        // Buscar produtos em destaque
        fetchFeaturedProducts();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        
        // Mostrar mensagem de erro para o usuário
        const featuredContainer = document.getElementById('featured-products');
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="col s12">
                    <p class="center-align red-text">
                        Erro ao carregar produtos em destaque.
                    </p>
                </div>
            `;
        }
    }
});