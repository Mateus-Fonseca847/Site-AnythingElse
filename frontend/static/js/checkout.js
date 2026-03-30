document.addEventListener("DOMContentLoaded", async () => {
  const cartCountLabel = document.querySelector("[data-cart-count-label]");
  const emptyState = document.querySelector("[data-checkout-empty]");
  const productList = document.querySelector("[data-checkout-product-list]");
  const shippingCepInput = document.querySelector("[data-shipping-cep]");
  const shippingCalculateButton = document.querySelector(
    "[data-shipping-calculate]",
  );
  const shippingFeedback = document.querySelector("[data-shipping-feedback]");
  const shippingResult = document.querySelector("[data-shipping-result]");
  const summarySubtotal = document.querySelector("[data-summary-subtotal]");
  const summaryShipping = document.querySelector("[data-summary-shipping]");
  const summaryTotal = document.querySelector("[data-summary-total]");
  const summaryInstallments = document.querySelector(
    "[data-summary-installments]",
  );
  const continueButton = document.querySelector(".primary-checkout-btn");

  let currentUser = null;
  let cart = [];
  let shippingOptions = [];
  let selectedShippingOptionId = null;

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function normalizeCep(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 8);
  }

  function formatCep(value) {
    const cep = normalizeCep(value);

    if (cep.length <= 5) return cep;

    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  }

  function getCartStorageKey() {
    if (currentUser?.email) {
      return `anythingelse_cart_user_${currentUser.email}`;
    }

    return "anythingelse_cart_guest";
  }

  function getCheckoutStateKey() {
    if (currentUser?.email) {
      return `anythingelse_checkout_state_${currentUser.email}`;
    }

    return "anythingelse_checkout_state_guest";
  }

  function saveCart() {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  }

  function loadCart() {
    try {
      const savedCart = localStorage.getItem(getCartStorageKey());
      cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      cart = [];
    }
  }

  function getCartQuantity() {
    return cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  }

  function getCartSubtotal() {
    return cart.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }

  function getSelectedShippingPrice() {
    const selectedOption = shippingOptions.find(
      (option) => option.id === selectedShippingOptionId,
    );

    return Number(selectedOption?.price || 0);
  }

  function saveCheckoutState() {
    const selectedShipping = shippingOptions.find(
      (option) => option.id === selectedShippingOptionId,
    );

    localStorage.setItem(
      getCheckoutStateKey(),
      JSON.stringify({
        cep: normalizeCep(shippingCepInput?.value || ""),
        shippingOptions,
        selectedShipping: selectedShipping || null,
      }),
    );
  }

  function updateSummary() {
    const subtotal = getCartSubtotal();
    const shipping = getSelectedShippingPrice();
    const total = subtotal + shipping;
    const installmentValue = total / 5;

    if (summarySubtotal) {
      summarySubtotal.textContent = formatPrice(subtotal);
    }

    if (summaryShipping) {
      summaryShipping.textContent = shippingOptions.length
        ? formatPrice(shipping)
        : "A calcular";
    }

    if (summaryTotal) {
      summaryTotal.textContent = formatPrice(total);
    }

    if (summaryInstallments) {
      summaryInstallments.innerHTML = `ou em ate <b>5x de ${formatPrice(
        installmentValue,
      )}</b> sem juros`;
    }
  }

  function updateCartCountLabel() {
    if (!cartCountLabel) return;

    const totalItems = getCartQuantity();

    if (totalItems === 0) {
      cartCountLabel.textContent = "Nenhum item adicionado a sacola";
      return;
    }

    cartCountLabel.textContent = `${totalItems} ${
      totalItems === 1 ? "item adicionado" : "itens adicionados"
    } a sacola`;
  }

  function renderShippingOptions() {
    if (!shippingResult) return;

    shippingResult.innerHTML = "";

    shippingOptions.forEach((option) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "shipping-option";

      if (option.id === selectedShippingOptionId) {
        element.classList.add("selected");
      }

      element.innerHTML = `
        <div>
          <strong>${option.label}</strong>
          <p>Receba em ate ${option.business_days} dia${
            option.business_days > 1 ? "s" : ""
          } uteis</p>
        </div>
        <span>${formatPrice(option.price)}</span>
      `;

      element.addEventListener("click", () => {
        selectedShippingOptionId = option.id;
        saveCheckoutState();
        renderShippingOptions();
        updateSummary();
      });

      shippingResult.appendChild(element);
    });
  }

  function updateEmptyState() {
    const isEmpty = cart.length === 0;

    if (emptyState) {
      emptyState.hidden = !isEmpty;
    }

    if (productList) {
      productList.hidden = isEmpty;
    }

    if (shippingCalculateButton) {
      shippingCalculateButton.disabled = isEmpty;
    }

    if (shippingCepInput) {
      shippingCepInput.disabled = isEmpty;
    }

    if (isEmpty) {
      shippingOptions = [];
      selectedShippingOptionId = null;
      saveCheckoutState();

      if (shippingFeedback) {
        shippingFeedback.textContent =
          "Adicione produtos a sacola para calcular o frete.";
      }

      renderShippingOptions();
    }
  }

  function renderCartItems() {
    if (!productList) return;

    productList.innerHTML = "";

    cart.forEach((item, index) => {
      const quantity = Number(item.quantity || 1);
      const subtotal = Number(item.price || 0) * quantity;
      const article = document.createElement("article");

      article.className = "checkout-product";
      article.innerHTML = `
        <div class="checkout-product-image">
          <img src="${item.image || ""}" alt="${item.title || "Produto"}" />
        </div>

        <div class="checkout-product-info">
          <h3>${item.title || "Produto"}</h3>
          ${
            item.size
              ? `<p class="checkout-product-meta">Tamanho: ${item.size}</p>`
              : ""
          }
          <p class="checkout-product-meta">SKU: ${item.sku || "N/A"}</p>
          <button class="remove-item" type="button" data-remove-index="${index}">
            Remover item
          </button>
        </div>

        <div class="checkout-product-qty">
          <span class="product-label">Quantidade</span>
          <div class="qty-control">
            <button type="button" data-quantity-action="decrease" data-index="${index}">-</button>
            <input type="text" value="${quantity}" readonly />
            <button type="button" data-quantity-action="increase" data-index="${index}">+</button>
          </div>
        </div>

        <div class="checkout-product-price">
          <span class="product-label">Total</span>
          <strong>${formatPrice(subtotal)}</strong>
        </div>
      `;

      productList.appendChild(article);
    });

    productList.querySelectorAll("[data-remove-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.removeIndex);
        cart.splice(index, 1);
        saveCart();
        renderAll();
      });
    });

    productList.querySelectorAll("[data-quantity-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const action = button.dataset.quantityAction;
        const item = cart[index];

        if (!item) return;

        const currentQuantity = Number(item.quantity || 1);

        if (action === "increase") {
          item.quantity = currentQuantity + 1;
        }

        if (action === "decrease") {
          if (currentQuantity <= 1) {
            cart.splice(index, 1);
          } else {
            item.quantity = currentQuantity - 1;
          }
        }

        saveCart();
        renderAll();
      });
    });
  }

  async function calculateShipping() {
    if (!shippingCepInput || cart.length === 0) return;

    const cep = normalizeCep(shippingCepInput.value);
    shippingCepInput.value = formatCep(cep);

    if (cep.length !== 8) {
      shippingOptions = [];
      selectedShippingOptionId = null;
      renderShippingOptions();
      saveCheckoutState();
      updateSummary();

      if (shippingFeedback) {
        shippingFeedback.textContent = "Digite um CEP valido com 8 digitos.";
      }
      return;
    }

    if (shippingFeedback) {
      shippingFeedback.textContent = "Calculando frete...";
    }

    try {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cep,
          subtotal: getCartSubtotal(),
          item_count: getCartQuantity(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Nao foi possivel calcular o frete.");
      }

      shippingOptions = Array.isArray(data.options) ? data.options : [];
      selectedShippingOptionId =
        shippingOptions.find((option) => option.selected)?.id ||
        shippingOptions[0]?.id ||
        null;

      renderShippingOptions();
      saveCheckoutState();
      updateSummary();

      if (shippingFeedback) {
        shippingFeedback.textContent =
          "Frete calculado com origem em Petropolis/RJ.";
      }
    } catch (error) {
      shippingOptions = [];
      selectedShippingOptionId = null;
      renderShippingOptions();
      saveCheckoutState();
      updateSummary();

      if (shippingFeedback) {
        shippingFeedback.textContent =
          error.message || "Nao foi possivel calcular o frete.";
      }
    }
  }

  function renderAll() {
    updateCartCountLabel();
    updateEmptyState();
    renderCartItems();
    updateSummary();

    if (continueButton) {
      continueButton.textContent = currentUser
        ? "Ir para pagamento"
        : "Continuar para identificacao";
      continueButton.disabled = cart.length === 0;
    }
  }

  async function loadCurrentUser() {
    try {
      const response = await fetch("/auth/me");
      const data = await response.json();

      if (response.ok && data.user) {
        currentUser = data.user;
        return;
      }
    } catch (error) {
      console.error(error);
    }

    currentUser = null;
  }

  shippingCepInput?.addEventListener("input", (event) => {
    event.target.value = formatCep(event.target.value);
  });

  shippingCepInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      calculateShipping();
    }
  });

  shippingCalculateButton?.addEventListener("click", calculateShipping);
  continueButton?.addEventListener("click", () => {
    saveCheckoutState();
    window.location.href = currentUser
      ? "/pagamento"
      : "/identificacao?next=/pagamento";
  });

  await loadCurrentUser();
  loadCart();
  renderAll();
});
