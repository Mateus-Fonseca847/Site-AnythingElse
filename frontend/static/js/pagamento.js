document.addEventListener("DOMContentLoaded", async () => {
  const emailInput = document.querySelector("[data-user-email]");
  const nameInput = document.querySelector("[data-user-name]");
  const firstNameInput = document.querySelector("[data-first-name]");
  const lastNameInput = document.querySelector("[data-last-name]");
  const cpfInput = document.querySelector("[data-cpf]");
  const phoneInput = document.querySelector("[data-phone]");
  const cepInput = document.querySelector("[data-payment-cep]");
  const recipientInput = document.querySelector("[data-delivery-recipient]");
  const addressNumberInput = document.querySelector("[data-address-number]");
  const addressComplementInput = document.querySelector("[data-address-complement]");
  const addressPreview = document.querySelector("[data-delivery-address]");
  const deliveryMethods = document.querySelector("[data-delivery-methods]");
  const deliveryCard = document.querySelectorAll(".payment-card")[1];
  const deliveryModeButtons = Array.from(
    document.querySelectorAll("[data-delivery-mode]"),
  );
  const pickupBox = document.querySelector("[data-pickup-box]");
  const summaryProducts = document.querySelector("[data-summary-products]");
  const summarySubtotal = document.querySelector("[data-summary-subtotal]");
  const summaryShipping = document.querySelector("[data-summary-shipping]");
  const summaryTotal = document.querySelector("[data-summary-total]");
  const paymentTotalInline = document.querySelector("[data-payment-total-inline]");
  const paymentMethodMenu = document.querySelector("[data-payment-method-menu]");
  const submitOrderButton = document.querySelector("[data-submit-order]");

  let currentUser = null;
  let cart = [];
  let checkoutState = null;

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

  async function loadCurrentUser() {
    try {
      const response = await fetch("/auth/me");
      const data = await response.json();

      if (response.ok && data.user) {
        currentUser = data.user;
        return true;
      }
    } catch (error) {
      console.error(error);
    }

    currentUser = null;
    return false;
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

  function loadCart() {
    try {
      const raw = localStorage.getItem(getCartStorageKey());
      cart = raw ? JSON.parse(raw) : [];
    } catch (error) {
      cart = [];
    }
  }

  function loadCheckoutState() {
    try {
      const raw = localStorage.getItem(getCheckoutStateKey());
      checkoutState = raw ? JSON.parse(raw) : null;
    } catch (error) {
      checkoutState = null;
    }
  }

  function saveCheckoutState() {
    localStorage.setItem(
      getCheckoutStateKey(),
      JSON.stringify(checkoutState || {}),
    );
  }

  function clearPurchaseState() {
    localStorage.removeItem(getCartStorageKey());
    localStorage.removeItem(getCheckoutStateKey());
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }

  function getShippingValue() {
    if (checkoutState?.deliveryMode === "pickup") {
      return 0;
    }

    return Number(checkoutState?.selectedShipping?.price || 0);
  }

  function getSelectedPaymentMethod() {
    return (
      paymentMethodMenu
        ?.querySelector(".payment-method.is-active")
        ?.dataset.paymentMethod || "pix"
    );
  }

  function renderUser() {
    if (emailInput) {
      emailInput.value = currentUser?.email || "";
    }

    if (nameInput) {
      nameInput.value = currentUser?.name || "";
    }

    if (firstNameInput && !firstNameInput.value) {
      firstNameInput.value = (currentUser?.name || "").split(" ")[0] || "";
    }

    if (lastNameInput && !lastNameInput.value) {
      lastNameInput.value = (currentUser?.name || "").split(" ").slice(1).join(" ");
    }

    if (recipientInput && !recipientInput.value) {
      recipientInput.value =
        checkoutState?.recipient || currentUser?.name || "";
    }
  }

  function renderDelivery() {
    const deliveryMode = checkoutState?.deliveryMode || "delivery";
    const cep = checkoutState?.cep || "";

    deliveryModeButtons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.deliveryMode === deliveryMode,
      );
    });

    if (deliveryCard) {
      deliveryCard.classList.toggle(
        "delivery-section--pickup",
        deliveryMode === "pickup",
      );
    }

    if (pickupBox) {
      pickupBox.hidden = deliveryMode !== "pickup";
    }

    if (cepInput) {
      cepInput.value = formatCep(cep);
      cepInput.disabled = deliveryMode === "pickup";
    }

    if (recipientInput) {
      recipientInput.disabled = deliveryMode === "pickup";
    }

    if (addressPreview) {
      addressPreview.textContent =
        deliveryMode === "pickup"
          ? "Seu pedido ficara disponivel para retirada na sede em Petropolis/RJ."
          : cep
            ? `Destino informado no checkout: CEP ${formatCep(cep)}. Complete numero e complemento abaixo para concluir o pedido.`
            : "Informe um CEP no checkout para carregar o destino aqui.";
    }

    if (!deliveryMethods) return;

    if (deliveryMode === "pickup") {
      deliveryMethods.innerHTML = `
        <div class="delivery-method is-active">
          <div>
            <strong>Retirada na sede</strong>
            <p>Disponivel apos confirmacao do pagamento</p>
          </div>
          <strong>${formatPrice(0)}</strong>
        </div>
      `;
      return;
    }

    const options = Array.isArray(checkoutState?.shippingOptions)
      ? checkoutState.shippingOptions
      : [];
    const selectedId = checkoutState?.selectedShipping?.id;

    deliveryMethods.innerHTML = "";

    options.forEach((option) => {
      const element = document.createElement("div");
      element.className = "delivery-method";

      if (option.id === selectedId) {
        element.classList.add("is-active");
      }

      element.innerHTML = `
        <div>
          <strong>${option.label}</strong>
          <p>Em ate ${option.business_days} dia${
            option.business_days > 1 ? "s" : ""
          } uteis</p>
        </div>
        <strong>${formatPrice(option.price)}</strong>
      `;

      deliveryMethods.appendChild(element);
    });
  }

  function bindDeliveryFields() {
    cepInput?.addEventListener("input", (event) => {
      const formattedCep = formatCep(event.target.value);
      event.target.value = formattedCep;

      checkoutState = {
        ...(checkoutState || {}),
        cep: normalizeCep(formattedCep),
        deliveryMode: "delivery",
      };
      saveCheckoutState();
      renderDelivery();
      renderSummary();
    });

    recipientInput?.addEventListener("input", (event) => {
      checkoutState = {
        ...(checkoutState || {}),
        recipient: event.target.value,
      };
      saveCheckoutState();
    });
  }

  function bindDeliveryMode() {
    deliveryModeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        checkoutState = {
          ...(checkoutState || {}),
          deliveryMode: button.dataset.deliveryMode,
        };

        saveCheckoutState();
        renderDelivery();
        renderSummary();
      });
    });
  }

  function renderSummary() {
    if (!summaryProducts) return;

    summaryProducts.innerHTML = "";

    cart.forEach((item) => {
      const quantity = Number(item.quantity || 1);
      const total = Number(item.price || 0) * quantity;
      const element = document.createElement("article");
      const isCustomized = Boolean(item.isCustomized);

      element.className = "summary-product";
      element.innerHTML = `
        <img src="${item.image || ""}" alt="${item.title || "Produto"}" />
        <div>
          <strong>${item.title || "Produto"}</strong>
          <p>Qtd. ${quantity}${item.size ? ` | Tam. ${item.size}` : ""}${isCustomized ? " | Personalizado" : ""}</p>
        </div>
        <strong>${formatPrice(total)}</strong>
      `;

      summaryProducts.appendChild(element);
    });

    const subtotal = getSubtotal();
    const shipping = getShippingValue();
    const total = subtotal + shipping;

    if (summarySubtotal) {
      summarySubtotal.textContent = formatPrice(subtotal);
    }

    if (summaryShipping) {
      summaryShipping.textContent = formatPrice(shipping);
    }

    if (summaryTotal) {
      summaryTotal.textContent = formatPrice(total);
    }

    if (paymentTotalInline) {
      paymentTotalInline.textContent = formatPrice(total);
    }
  }

  function bindPaymentMethods() {
    paymentMethodMenu?.querySelectorAll("[data-payment-method]").forEach((button) => {
      button.addEventListener("click", () => {
        const method = button.dataset.paymentMethod;

        paymentMethodMenu
          .querySelectorAll("[data-payment-method]")
          .forEach((item) => item.classList.remove("is-active"));

        button.classList.add("is-active");

        document.querySelectorAll("[data-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.panel !== method;
        });
      });
    });
  }

  function buildOrderPayload() {
    const subtotal = getSubtotal();
    const shipping = getShippingValue();
    const total = subtotal + shipping;
    const customerName = [firstNameInput?.value, lastNameInput?.value]
      .filter(Boolean)
      .join(" ")
      .trim() || currentUser?.name || "";

    return {
      customer_name: customerName,
      cpf: cpfInput?.value || "",
      phone: phoneInput?.value || "",
      cep: normalizeCep(cepInput?.value || checkoutState?.cep || ""),
      recipient: recipientInput?.value || currentUser?.name || "",
      address_number: addressNumberInput?.value || "",
      address_complement: addressComplementInput?.value || "",
      delivery_mode: checkoutState?.deliveryMode || "delivery",
      selected_shipping: checkoutState?.selectedShipping || null,
      payment_method: getSelectedPaymentMethod(),
      subtotal,
      shipping,
      total,
      items: cart,
    };
  }

  async function submitOrder() {
    if (!cart.length) {
      window.alert("Sua sacola esta vazia.");
      return;
    }

    const payload = buildOrderPayload();

    if (payload.delivery_mode === "delivery" && !payload.cep) {
      window.alert("Informe um CEP para concluir a entrega.");
      return;
    }

    const originalText = submitOrderButton?.textContent || "Finalizar compra";

    if (submitOrderButton) {
      submitOrderButton.disabled = true;
      submitOrderButton.textContent = "Finalizando...";
    }

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        window.alert(data.message || "Nao foi possivel finalizar a compra.");
        return;
      }

      clearPurchaseState();
      const orderNumber = data.order?.order_number || "";
      const paymentStatus = data.payment?.status || "";
      const transactionId = data.payment?.transaction_id || "";
      const paymentMethod = data.payment?.method || "";

      let successMessage = `Pedido ${orderNumber} finalizado com sucesso.`;

      if (paymentMethod === "pix") {
        successMessage = `Pedido ${orderNumber} confirmado via Pix. Transacao ${transactionId}.`;
      } else if (paymentMethod === "ticket") {
        successMessage = `Pedido ${orderNumber} criado. Boleto gerado com status: ${paymentStatus}.`;
      } else if (paymentMethod === "card") {
        successMessage = `Pedido ${orderNumber} aprovado no cartao. Transacao ${transactionId}.`;
      }

      window.alert(successMessage);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      window.alert("Ocorreu um erro ao finalizar a compra.");
    } finally {
      if (submitOrderButton) {
        submitOrderButton.disabled = false;
        submitOrderButton.textContent = originalText;
      }
    }
  }

  submitOrderButton?.addEventListener("click", submitOrder);

  const isAuthenticated = await loadCurrentUser();

  if (!isAuthenticated) {
    window.location.href = "/identificacao?next=/pagamento";
    return;
  }

  loadCart();
  loadCheckoutState();
  checkoutState = {
    ...(checkoutState || {}),
    deliveryMode: checkoutState?.deliveryMode || "delivery",
  };
  renderUser();
  renderDelivery();
  renderSummary();
  bindDeliveryFields();
  bindDeliveryMode();
  bindPaymentMethods();
});
