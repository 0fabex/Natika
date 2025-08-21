// Função para adicionar produto ao carrinho
function addToCart(productId, productName, productPrice, productImage) {
    // Recuperar carrinho atual do localStorage
    let cart = JSON.parse(localStorage.getItem('natika_cart')) || [];
    
    // Verificar se o produto já está no carrinho
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Se já existe, incrementar a quantidade
        cart[existingItemIndex].quantity += 1;
    } else {
        // Se não existe, adicionar novo item
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Salvar carrinho atualizado no localStorage
    localStorage.setItem('natika_cart', JSON.stringify(cart));
    
    // Atualizar contador do carrinho
    updateCartCount();
    
    // Mostrar mensagem de sucesso
    M.toast({html: 'Produto adicionado ao carrinho!'});
}

// Função para atualizar o contador do carrinho
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('natika_cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Atualizar em todas as páginas
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    // Salvar também no localStorage para acesso entre páginas
    localStorage.setItem('natika_cart_count', totalItems);
}

// Inicializar contador do carrinho quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Adicionar event listeners para os botões de adicionar ao carrinho
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart') || 
            e.target.closest('.add-to-cart')) {
            
            const button = e.target.classList.contains('add-to-cart') ? 
                          e.target : e.target.closest('.add-to-cart');
            
            // Obter dados diretamente dos atributos data-*
            const productId = button.getAttribute('data-id');
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            const productImage = button.getAttribute('data-image');
            
            if (productId) {
                addToCart(productId, productName, productPrice, productImage);
            }
        }
    });
});