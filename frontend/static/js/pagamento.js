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
  const paymentFeedback = document.querySelector("[data-payment-feedback]");
  const cardNumberInput = document.querySelector("[data-card-number]");
  const cardExpiryInput = document.querySelector("[data-card-expiry]");
  const cardCvvInput = document.querySelector("[data-card-cvv]");
  const cardNameInput = document.querySelector("[data-card-name]");

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

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCpf(value) {
    const digits = onlyDigits(value).slice(0, 11);

    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  function formatPhone(value) {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  function formatCardNumber(value) {
    const digits = onlyDigits(value).slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function formatCardExpiry(value) {
    const digits = onlyDigits(value).slice(0, 4);

    if (digits.length < 3) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function setPaymentFeedback(message, type = "info") {
    if (!paymentFeedback) return;
    paymentFeedback.textContent = message;
    paymentFeedback.dataset.state = type;
  }

  function isCustomerDataComplete() {
    const firstName = firstNameInput?.value.trim() || "";
    const lastName = lastNameInput?.value.trim() || "";
    const cpf = onlyDigits(cpfInput?.value || "");
    const phone = onlyDigits(phoneInput?.value || "");

    return (
      firstName.length >= 2 &&
      lastName.length >= 2 &&
      cpf.length === 11 &&
      phone.length >= 10
    );
  }

  function isDeliveryDataComplete() {
    const deliveryMode = checkoutState?.deliveryMode || "delivery";

    if (deliveryMode === "pickup") {
      return true;
    }

    const cep = normalizeCep(cepInput?.value || checkoutState?.cep || "");
    const recipient = recipientInput?.value.trim() || "";
    const addressNumber = addressNumberInput?.value.trim() || "";
    const selectedShipping = checkoutState?.selectedShipping;

    return Boolean(
      cep.length === 8 &&
        recipient.length >= 3 &&
        addressNumber.length >= 1 &&
        selectedShipping?.id,
    );
  }

  function isPaymentDataComplete() {
    const method = getSelectedPaymentMethod();

    if (method === "pix" || method === "ticket") {
      return true;
    }

    const cardNumber = onlyDigits(cardNumberInput?.value || "");
    const cardExpiry = onlyDigits(cardExpiryInput?.value || "");
    const cardCvv = onlyDigits(cardCvvInput?.value || "");
    const cardName = cardNameInput?.value.trim() || "";

    return (
      cardNumber.length === 16 &&
      cardExpiry.length === 4 &&
      cardCvv.length >= 3 &&
      cardName.length >= 4
    );
  }

  function getPaymentReadiness() {
    if (!cart.length) {
      return {
        ready: false,
        message: "Sua sacola esta vazia, adicione produtos primeiro.",
        type: "error",
      };
    }

    if (!isCustomerDataComplete()) {
      return {
        ready: false,
        message: "Preencha seus dados pessoais para continuar.",
        type: "warning",
      };
    }

    if (!isDeliveryDataComplete()) {
      return {
        ready: false,
        message: "Revise entrega, CEP e frete antes de finalizar.",
        type: "warning",
      };
    }

    if (!isPaymentDataComplete()) {
      return {
        ready: false,
        message: "Complete os dados da forma de pagamento selecionada.",
        type: "warning",
      };
    }

    const method = getSelectedPaymentMethod();
    const messageByMethod = {
      pix: "Tudo pronto. Gere o pagamento por Pix com seguranca.",
      card: "Tudo pronto. Finalize o pagamento no cartao com seguranca.",
      ticket: "Tudo pronto. Gere seu boleto para concluir o pedido.",
    };

    return {
      ready: true,
      message: messageByMethod[method] || "Tudo pronto para finalizar a compra.",
      type: "success",
    };
  }

  function updateSubmitState() {
    if (!submitOrderButton) return;

    const readiness = getPaymentReadiness();
    const method = getSelectedPaymentMethod();
    const labelByMethod = {
      pix: "Gerar pagamento Pix",
      card: "Pagar com cartao",
      ticket: "Gerar boleto",
    };

    submitOrderButton.disabled = !readiness.ready;
    submitOrderButton.textContent =
      labelByMethod[method] || "Finalizar compra";

    setPaymentFeedback(readiness.message, readiness.type);
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

  function syncGuestStateToUserIfNeeded() {
    if (!currentUser?.email) return;

    const guestCartKey = "anythingelse_cart_guest";
    const guestCheckoutStateKey = "anythingelse_checkout_state_guest";
    const userCartKey = getCartStorageKey();
    const userCheckoutStateKey = getCheckoutStateKey();

    try {
      const guestCart = localStorage.getItem(guestCartKey);
      const userCart = localStorage.getItem(userCartKey);

      if (guestCart && !userCart) {
        localStorage.setItem(userCartKey, guestCart);
      }

      const guestCheckoutState = localStorage.getItem(guestCheckoutStateKey);
      const userCheckoutState = localStorage.getItem(userCheckoutStateKey);

      if (guestCheckoutState && !userCheckoutState) {
        localStorage.setItem(userCheckoutStateKey, guestCheckoutState);
      }
    } catch (error) {
      console.error(error);
    }
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

  function saveLastPaymentResult(data) {
    try {
      localStorage.setItem(
        "anythingelse_last_payment_result",
        JSON.stringify({
          order: data.order || {},
          payment: data.payment || {},
          items: cart,
          subtotal: getSubtotal(),
          shipping: getShippingValue(),
          total: getSubtotal() + getShippingValue(),
        }),
      );
    } catch (error) {
      console.error(error);
    }
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

    cpfInput.value = formatCpf(cpfInput?.value || "");
    phoneInput.value = formatPhone(phoneInput?.value || "");
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
      updateSubmitState();
      return;
    }

    const selectedShipping = checkoutState?.selectedShipping;

    deliveryMethods.innerHTML = "";

    if (selectedShipping?.id) {
      const element = document.createElement("div");
      element.className = "delivery-method is-active";
      element.innerHTML = `
        <div>
          <strong>${selectedShipping.label}</strong>
          <p>Em ate ${selectedShipping.business_days} dia${
            selectedShipping.business_days > 1 ? "s" : ""
          } uteis</p>
        </div>
        <strong>${formatPrice(selectedShipping.price)}</strong>
      `;

      deliveryMethods.appendChild(element);
    }

    updateSubmitState();
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
      updateSubmitState();
    });

    recipientInput?.addEventListener("input", (event) => {
      checkoutState = {
        ...(checkoutState || {}),
        recipient: event.target.value,
      };
      saveCheckoutState();
      updateSubmitState();
    });

    addressNumberInput?.addEventListener("input", updateSubmitState);
    addressComplementInput?.addEventListener("input", updateSubmitState);
    firstNameInput?.addEventListener("input", updateSubmitState);
    lastNameInput?.addEventListener("input", updateSubmitState);

    cpfInput?.addEventListener("input", (event) => {
      event.target.value = formatCpf(event.target.value);
      updateSubmitState();
    });

    phoneInput?.addEventListener("input", (event) => {
      event.target.value = formatPhone(event.target.value);
      updateSubmitState();
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
        updateSubmitState();
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

    updateSubmitState();
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

        updateSubmitState();
      });
    });

    cardNumberInput?.addEventListener("input", (event) => {
      event.target.value = formatCardNumber(event.target.value);
      updateSubmitState();
    });

    cardExpiryInput?.addEventListener("input", (event) => {
      event.target.value = formatCardExpiry(event.target.value);
      updateSubmitState();
    });

    cardCvvInput?.addEventListener("input", (event) => {
      event.target.value = onlyDigits(event.target.value).slice(0, 4);
      updateSubmitState();
    });

    cardNameInput?.addEventListener("input", updateSubmitState);
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
      setPaymentFeedback(
        "Sua sacola esta vazia, adicione produtos primeiro.",
        "error",
      );
      return;
    }

    const payload = buildOrderPayload();
    const readiness = getPaymentReadiness();

    if (!readiness.ready) {
      setPaymentFeedback(readiness.message, readiness.type);
      return;
    }

    if (payload.delivery_mode === "delivery" && !payload.cep) {
      setPaymentFeedback("Informe um CEP para concluir a entrega.", "error");
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
        setPaymentFeedback(
          data.message || "Nao foi possivel finalizar a compra.",
          "error",
        );
        return;
      }

      saveLastPaymentResult(data);
      clearPurchaseState();
      const paymentMethod = data.payment?.method || "";

      if (paymentMethod === "pix") {
        window.location.href = "/pagamento/pix";
        return;
      }

      if (paymentMethod === "ticket") {
        window.location.href = "/pagamento/boleto";
        return;
      }

      window.location.href = "/compra-finalizada";
    } catch (error) {
      console.error(error);
      setPaymentFeedback("Ocorreu um erro ao finalizar a compra.", "error");
    } finally {
      if (submitOrderButton) {
        submitOrderButton.textContent = originalText;
      }
      updateSubmitState();
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
  syncGuestStateToUserIfNeeded();
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
  updateSubmitState();
});
