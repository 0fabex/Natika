// Função para formatar preços
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Função para obter o carrinho do localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Função para salvar o carrinho no localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Atualizar contador do carrinho em todas as páginas
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Função para mostrar mensagem (compatível com Materialize ou fallback)
function showMessage(message) {
    if (typeof M !== 'undefined' && M.toast) {
        M.toast({html: message});
    } else {
        // Fallback para quando Materialize não está disponível
        console.log(message);
        alert(message);
    }
}

// Função para carregar os itens do carrinho na página do carrinho
function loadCartItems() {
    const cartItems = getCart();
    
    updateCartCount();
    
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    const cartContainer = document.getElementById('cart-items-container');
    
    if (!cartContainer) return; // Não está na página do carrinho
    
    if (cartItems.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        cartContainer.innerHTML = '';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartContainer.innerHTML = '';
    
    let subtotal = 0;
    
    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantityInput(${index}, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-total">${formatPrice(itemTotal)}</div>
            <button class="remove-item" onclick="removeItem(${index})">
                <i class="fa fa-trash"></i>
            </button>
        `;
        
        cartContainer.appendChild(cartItemElement);
    });
    
    // Calcular totais
    const shipping = subtotal > 200 ? 0 : 15; // Frete grátis para compras acima de R$ 200
    const total = subtotal + shipping;
    
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = formatPrice(subtotal);
    }
    if (document.getElementById('shipping')) {
        document.getElementById('shipping').textContent = formatPrice(shipping);
    }
    if (document.getElementById('total')) {
        document.getElementById('total').textContent = formatPrice(total);
    }
}

// Atualizar quantidade pelo botão
function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    
    const cartItems = getCart();
    cartItems[index].quantity = newQuantity;
    saveCart(cartItems);
    
    loadCartItems();
    showMessage('Quantidade atualizada!');
}

// Atualizar quantidade pelo input
function updateQuantityInput(index, value) {
    const newQuantity = parseInt(value) || 1;
    updateQuantity(index, newQuantity);
}

// Remover item do carrinho
function removeItem(index) {
    const cartItems = getCart();
    const removedItem = cartItems[index];
    cartItems.splice(index, 1);
    saveCart(cartItems);
    
    loadCartItems();
    showMessage(`${removedItem.name} removido do carrinho!`);
}

// Adicionar produto ao carrinho (usado na página de produtos)
function addToCart(id, name, price, image) {
    let cart = getCart();
    
    // Verificar se o produto já está no carrinho
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        // Se já existe, incrementar a quantidade
        cart[existingItemIndex].quantity += 1;
    } else {
        // Se não existe, adicionar novo item
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    saveCart(cart);
    
    // Mostrar mensagem de sucesso
    showMessage('Produto adicionado ao carrinho!');
    
    // Adicionar efeito visual de confirmação
    const button = document.querySelector(`.add-to-cart[data-id="${id}"]`);
    if (button) {
        button.classList.add('added');
        setTimeout(() => button.classList.remove('added'), 1000);
    }
}

// Inicializar a página do carrinho
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar contador do carrinho em todas as páginas
    updateCartCount();
    
    // Se estiver na página do carrinho, carregar os itens
    if (document.getElementById('cart-items-container')) {
        // Inicializar componentes do Materialize (se disponível)
        if (typeof M !== 'undefined') {
            var elems = document.querySelectorAll('select');
            var instances = M.FormSelect.init(elems);
        }
        
        // Carregar itens do carrinho
        loadCartItems();
    }
});

// Adicionar estilos para o efeito visual do botão
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .add-to-cart.added {
            background-color: #4caf50 !important;
            transform: scale(1.05);
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

// Tornar funções disponíveis globalmente para os eventos onclick no HTML
window.updateQuantity = updateQuantity;
window.updateQuantityInput = updateQuantityInput;
window.removeItem = removeItem;
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;