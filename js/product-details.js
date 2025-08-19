// Configuração do Supabase - CHAVE CORRIGIDA
const supabaseUrl = 'https://unwzexiljnemttknupwr.supabase.co';
// Substitua esta chave pela sua chave API válida do Supabase
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

// Função para renderizar os detalhes do produto
function renderProductDetails(produto) {
    const productContainer = document.getElementById('product-details');
    if (!productContainer) {
        console.error('Elemento #product-details não encontrado');
        return;
    }
    
    if (!produto) {
        productContainer.innerHTML = '<p class="center-align">Produto não encontrado.</p>';
        return;
    }
    
    // Usar estoque_geral em vez de estoque
    const estoqueClass = (produto.estoque_geral > 0) ? 'stock' : 'stock out-of-stock';
    const estoqueText = (produto.estoque_geral > 0) ? 'Disponível' : 'Esgotado';
    
    // Usar valor_varejo em vez de venda_valor
    const preco = produto.valor_varejo || 0;
    
    // Verifica se o produto é novo (coluna "novos" = "sim")
    const isNew = produto.novos && produto.novos.toLowerCase() === 'sim';
    
    productContainer.innerHTML = `
        <img src="${produto.imagem || 'img/placeholder.jpg'}" alt="${produto.titulo || 'Produto sem nome'}">
        ${isNew ? '<span class="new-badge">Novo</span>' : ''}
        <h5>${produto.titulo || 'Produto sem nome'}</h5>
        <span>${formatPrice(preco)}</span>
        <div class="${estoqueClass}">${estoqueText}</div>
        <div class="rating">
            ${renderRating(produto.avaliacao || 0)}
        </div>
        <p>${produto.descricao || 'Descrição não disponível.'}</p>
        
        <!-- Informações adicionais do produto -->
        <div class="product-info">
            <h6>Informações do Produto</h6>
            <ul>
                ${produto.material ? `<li><strong>Material:</strong> ${produto.material}</li>` : ''}
                ${produto.cor ? `<li><strong>Cor:</strong> ${produto.cor}</li>` : ''}
                ${produto.tamanho ? `<li><strong>Tamanho:</strong> ${produto.tamanho}</li>` : ''}
                ${produto.peso ? `<li><strong>Peso:</strong> ${produto.peso}g</li>` : ''}
                ${produto.codigo_referencia ? `<li><strong>Código:</strong> ${produto.codigo_referencia}</li>` : ''}
            </ul>
        </div>
    `;
}

// Função para buscar os detalhes do produto
async function fetchProductDetails() {
    try {
        console.log('Buscando detalhes do produto...');
        const loader = document.getElementById('fakeLoader');
        if (loader) loader.style.display = 'block';
        
        // Obter o ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            throw new Error('ID do produto não especificado na URL');
        }
        
        // Buscar produto no Supabase
        const { data: produto, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error('Erro na consulta:', error);
            throw error;
        }
        
        console.log('Produto recebido:', produto);
        
        renderProductDetails(produto);
        
    } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        
        // Mostrar mensagem de erro para o usuário
        const productContainer = document.getElementById('product-details');
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="col s12">
                    <p class="center-align red-text">
                        Erro ao carregar detalhes do produto. Verifique sua conexão com a internet.
                    </p>
                    <p class="center-align">Detalhes: ${error.message}</p>
                    <p class="center-align"><a href="produtos.html" class="button-default">Voltar para produtos</a></p>
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
    console.log('DOM carregado, inicializando detalhes do produto...');
    
    try {
        // Verificar se o cliente Supabase foi criado
        if (!supabaseClient) {
            throw new Error('Falha na inicialização do Supabase');
        }
        
        // Buscar detalhes do produto
        fetchProductDetails();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        
        // Mostrar mensagem de erro para o usuário
        const productContainer = document.getElementById('product-details');
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="col s12">
                    <p class="center-align red-text">
                        Erro ao carregar detalhes do produto.
                    </p>
                    <p class="center-align"><a href="produtos.html" class="button-default">Voltar para produtos</a></p>
                </div>
            `;
        }
    }
});