// Função para formatar preço
function formatPrice(price) {
    if (!price) return 'R$ 0,00';
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para carregar os itens do carrinho
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('natika_cart')) || [];
    const cartContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    
    // Atualizar contador
    updateCartCount();
    
    if (cartItems.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        if (cartContainer) cartContainer.innerHTML = '';
        return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    let cartHTML = '';
    let subtotal = 0;
    
    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
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
            </div>
        `;
    });
    
    if (cartContainer) {
        cartContainer.innerHTML = cartHTML;
    }
    
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
    
    const cartItems = JSON.parse(localStorage.getItem('natika_cart')) || [];
    if (index >= 0 && index < cartItems.length) {
        cartItems[index].quantity = newQuantity;
        localStorage.setItem('natika_cart', JSON.stringify(cartItems));
        loadCartItems();
    }
}

// Atualizar quantidade pelo input
function updateQuantityInput(index, value) {
    const newQuantity = parseInt(value) || 1;
    if (newQuantity > 0) {
        updateQuantity(index, newQuantity);
    }
}

// Remover item do carrinho
function removeItem(index) {
    const cartItems = JSON.parse(localStorage.getItem('natika_cart')) || [];
    if (index >= 0 && index < cartItems.length) {
        cartItems.splice(index, 1);
        localStorage.setItem('natika_cart', JSON.stringify(cartItems));
        loadCartItems();
    }
}

// Função para atualizar o contador do carrinho (também usada pelo carrinho.js)
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

// Inicializar a página do carrinho
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    
    // Verificar se o botão de finalizar compra existe
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            const cartItems = JSON.parse(localStorage.getItem('natika_cart')) || [];
            if (cartItems.length === 0) {
                e.preventDefault();
                M.toast({html: 'Seu carrinho está vazio!'});
            }
        });
    }
});