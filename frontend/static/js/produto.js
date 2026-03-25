const thumbs = document.querySelectorAll(".product-thumb");
const mainProductImage = document.getElementById("mainProductImage");
const stickyBuybar = document.getElementById("stickyBuybar");
const productSizes = document.querySelectorAll(".product-size");
const addToCartButton = document.getElementById("addToCartButton");
const stickyAddToCartButton = document.getElementById("stickyAddToCartButton");

let selectedSize = "";

function formatPriceBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getCartStorageKey() {
  const loggedUser = localStorage.getItem("anythingelse_logged_user");
  return loggedUser
    ? `anythingelse_cart_user_${loggedUser}`
    : "anythingelse_cart_guest";
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(getCartStorageKey())) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
}

function updateHeaderCartTotal() {
  const totalElement = document.querySelector(".header-cart-total");
  if (!totalElement) return;

  const cart = getCart();
  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity || 1);
  }, 0);

  totalElement.textContent = formatPriceBRL(total);
}

function updateCartDrawer() {
  const cart = getCart();
  const emptyState = document.querySelector(".cart-drawer__empty");
  const itemsContainer = document.querySelector(".cart-drawer__items");

  if (!emptyState || !itemsContainer) return;

  if (!cart.length) {
    emptyState.hidden = false;
    itemsContainer.hidden = true;
    itemsContainer.innerHTML = "";
    return;
  }

  emptyState.hidden = true;
  itemsContainer.hidden = false;

  itemsContainer.innerHTML = cart
    .map((item, index) => {
      const sizeText = item.size
        ? `<span class="cart-item__meta">Tamanho: ${item.size}</span>`
        : "";
      const subtotal = Number(item.price) * Number(item.quantity || 1);

      return `
        <article class="cart-item">
          <a href="${item.url}" class="cart-item__image-link">
            <img class="cart-item__image" src="${item.image}" alt="${item.name}">
          </a>

          <div class="cart-item__content">
            <a href="${item.url}" class="cart-item__title">${item.name}</a>
            ${sizeText}
            <span class="cart-item__meta">Qtd.: ${item.quantity}</span>
            <strong class="cart-item__price">${formatPriceBRL(subtotal)}</strong>
          </div>

          <button
            type="button"
            class="cart-item__remove"
            data-cart-index="${index}"
            aria-label="Remover item"
          >
            ×
          </button>
        </article>
      `;
    })
    .join("");

  itemsContainer.querySelectorAll(".cart-item__remove").forEach((button) => {
    button.addEventListener("click", () => {
      const cartIndex = Number(button.dataset.cartIndex);
      const cartData = getCart();
      cartData.splice(cartIndex, 1);
      saveCart(cartData);
      updateHeaderCartTotal();
      updateCartDrawer();
    });
  });
}

function addCurrentProductToCart(button) {
  if (!button) return;

  const productCode = button.dataset.productCode;
  const productName = button.dataset.productName;
  const productPrice = Number(button.dataset.productPrice || 0);
  const productImage = button.dataset.productImage;
  const productUrl = button.dataset.productUrl;

  const hasSizes = productSizes.length > 0;

  if (hasSizes && !selectedSize) {
    alert("Selecione um tamanho antes de adicionar à sacola.");
    return;
  }

  const cart = getCart();

  const existingItem = cart.find((item) => {
    return (
      item.code === productCode && (item.size || "") === (selectedSize || "")
    );
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      code: productCode,
      name: productName,
      price: productPrice,
      image: productImage,
      url: productUrl,
      size: selectedSize,
      quantity: 1,
    });
  }

  saveCart(cart);
  updateHeaderCartTotal();
  updateCartDrawer();
}

function showAddToCartFeedback(button) {
  if (!button) return;

  const originalText = button.innerHTML;

  button.innerHTML = "✔ Adicionado!";
  button.style.background = "#16a34a";

  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.background = "";
  }, 1500);
}

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const image = thumb.querySelector("img");
    if (!image || !mainProductImage) return;

    mainProductImage.src = image.src;
    mainProductImage.alt = image.alt || mainProductImage.alt;

    thumbs.forEach((item) => item.classList.remove("is-active"));
    thumb.classList.add("is-active");
  });
});

productSizes.forEach((button) => {
  button.addEventListener("click", () => {
    productSizes.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    selectedSize = button.textContent.trim();
  });
});

if (addToCartButton) {
  addToCartButton.addEventListener("click", () => {
    addCurrentProductToCart(addToCartButton);
    showAddToCartFeedback(addToCartButton);
  });
}

if (stickyAddToCartButton) {
  stickyAddToCartButton.addEventListener("click", () => {
    addCurrentProductToCart(stickyAddToCartButton);
    showAddToCartFeedback(stickyAddToCartButton);
  });
}

function toggleStickyBuybar() {
  if (!stickyBuybar) return;
  stickyBuybar.classList.toggle("is-visible", window.scrollY > 500);
}

window.addEventListener("scroll", toggleStickyBuybar);
window.addEventListener("load", () => {
  toggleStickyBuybar();
  updateHeaderCartTotal();
  updateCartDrawer();
});
