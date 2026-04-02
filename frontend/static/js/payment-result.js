document.addEventListener("DOMContentLoaded", () => {
  const resultKey = "anythingelse_last_payment_result";
  const raw = localStorage.getItem(resultKey);
  const payload = raw ? JSON.parse(raw) : null;

  const pageType = document.body.dataset.paymentPage || "final";
  const orderNumber = document.querySelector("[data-order-number]");
  const amount = document.querySelector("[data-order-amount]");
  const paymentStatus = document.querySelector("[data-payment-status]");
  const methodLabel = document.querySelector("[data-payment-method-label]");
  const productsHost = document.querySelector("[data-result-products]");
  const subtotal = document.querySelector("[data-result-subtotal]");
  const shipping = document.querySelector("[data-result-shipping]");
  const total = document.querySelector("[data-result-total]");
  const qrHost = document.querySelector("[data-qr-grid]");
  const copyInput = document.querySelector("[data-copy-value]");
  const copyButton = document.querySelector("[data-copy-button]");
  const copyFeedback = document.querySelector("[data-copy-feedback]");
  const boletoDue = document.querySelector("[data-boleto-due]");
  const boletoLink = document.querySelector("[data-boleto-link]");
  const confirmationText = document.querySelector("[data-confirmation-text]");
  const qrImage = document.querySelector("[data-qr-image]");
  const pixReceiver = document.querySelector("[data-pix-receiver]");
  const pixKey = document.querySelector("[data-pix-key]");
  const pixCity = document.querySelector("[data-pix-city]");

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(dateText) {
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) return dateText || "-";
    return date.toLocaleDateString("pt-BR");
  }

  function getSnapshot() {
    if (payload) return payload;

    return {
      order: { order_number: "-" },
      payment: { method: pageType, status: "-", amount: 0, details: {} },
      items: [],
      subtotal: 0,
      shipping: 0,
      total: 0,
    };
  }

  function renderProducts(items) {
    if (!productsHost) return;
    productsHost.innerHTML = "";

    items.forEach((item) => {
      const element = document.createElement("article");
      const quantity = Number(item.quantity || 1);
      const lineTotal = Number(item.price || 0) * quantity;
      element.className = "payment-result-product";
      element.innerHTML = `
        <img src="${item.image || ""}" alt="${item.title || "Produto"}" />
        <div>
          <strong>${item.title || "Produto"}</strong>
          <p>Qtd. ${quantity}${item.size ? ` | Tam. ${item.size}` : ""}</p>
        </div>
        <strong>${formatPrice(lineTotal)}</strong>
      `;
      productsHost.appendChild(element);
    });
  }

  function seededValue(seed, index) {
    const char = seed.charCodeAt(index % seed.length) || 0;
    return (char + index * 17) % 7;
  }

  function drawFinder(grid, startRow, startCol) {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const cell = grid[startRow + row][startCol + col];
        const border = row === 0 || row === 6 || col === 0 || col === 6;
        const center = row >= 2 && row <= 4 && col >= 2 && col <= 4;
        cell.dark = border || center;
      }
    }
  }

  function renderPseudoQr(code) {
    if (!qrHost || !code) return;

    const size = 21;
    const grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({ dark: false })),
    );

    drawFinder(grid, 0, 0);
    drawFinder(grid, 0, size - 7);
    drawFinder(grid, size - 7, 0);

    let pointer = 0;
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const inFinder =
          (row < 7 && col < 7) ||
          (row < 7 && col >= size - 7) ||
          (row >= size - 7 && col < 7);
        if (inFinder) continue;
        grid[row][col].dark = seededValue(code, pointer) >= 3;
        pointer += 1;
      }
    }

    qrHost.innerHTML = "";
    grid.flat().forEach((cell) => {
      const square = document.createElement("span");
      square.className = `payment-result-qr__cell${
        cell.dark ? " is-dark" : ""
      }`;
      qrHost.appendChild(square);
    });
  }

  async function copyValue() {
    if (!copyInput) return;
    try {
      await navigator.clipboard.writeText(copyInput.value);
      if (copyFeedback) {
        copyFeedback.textContent = "Codigo copiado com sucesso.";
        copyFeedback.dataset.state = "success";
      }
    } catch (error) {
      if (copyFeedback) {
        copyFeedback.textContent = "Nao foi possivel copiar o codigo.";
        copyFeedback.dataset.state = "error";
      }
    }
  }

  const snapshot = getSnapshot();
  const payment = snapshot.payment || {};
  const details = payment.details || {};
  const methodByPage = {
    pix: "pix",
    ticket: "ticket",
    final: payment.method || "card",
  };
  const effectiveMethod = methodByPage[pageType] || payment.method || "pix";
  const statusByPage = {
    pix: "Aguardando Pix",
    ticket: "Aguardando boleto",
  };
  const effectiveStatus = statusByPage[pageType] || payment.status || "-";

  if (orderNumber) orderNumber.textContent = snapshot.order?.order_number || "-";
  if (amount) amount.textContent = formatPrice(snapshot.total || payment.amount || 0);
  if (paymentStatus) paymentStatus.textContent = effectiveStatus;
  if (methodLabel) {
    const labels = {
      pix: "Pix",
      card: "Cartao de credito",
      ticket: "Boleto",
    };
    methodLabel.textContent = labels[effectiveMethod] || "Pagamento";
  }

  if (subtotal) subtotal.textContent = formatPrice(snapshot.subtotal || 0);
  if (shipping) shipping.textContent = formatPrice(snapshot.shipping || 0);
  if (total) total.textContent = formatPrice(snapshot.total || 0);
  renderProducts(snapshot.items || []);

  if (pageType === "pix") {
    const pixCode = details.pix_code || details.qr_code_text || "";
    if (copyInput) copyInput.value = pixCode;
    if (pixReceiver) pixReceiver.textContent = details.receiver_name || "-";
    if (pixKey) pixKey.textContent = details.receiver_key || "-";
    if (pixCity) pixCity.textContent = details.receiver_city || "-";

    if (qrImage && details.qr_code_url) {
      qrImage.src = details.qr_code_url;
      qrImage.hidden = false;
      if (qrHost) qrHost.hidden = true;
    } else {
      renderPseudoQr(pixCode);
      if (qrHost) qrHost.hidden = false;
      if (qrImage) qrImage.hidden = true;
    }
  }

  if (pageType === "ticket") {
    const boletoCode =
      details.boleto_code ||
      `${(payment.transaction_id || "").replace(/\D/g, "").slice(0, 12)}.${Date.now()
        .toString()
        .slice(-8)}`;
    if (copyInput) copyInput.value = boletoCode;
    if (boletoDue) boletoDue.textContent = formatDate(details.due_date);
    if (boletoLink) {
      boletoLink.textContent = details.boleto_url || "#";
      if ("href" in boletoLink) {
        boletoLink.href = details.boleto_url || "#";
      }
    }
  }

  if (pageType === "final" && confirmationText) {
    const labels = {
      card: "Pagamento aprovado no cartao. Seu pedido ja esta em processamento.",
      pix: "Pagamento recebido com sucesso. Seu pedido esta em processamento.",
      ticket: "Boleto identificado e pedido confirmado com sucesso.",
    };
    confirmationText.textContent =
      labels[effectiveMethod] || "Compra finalizada com sucesso.";
  }

  copyButton?.addEventListener("click", copyValue);
});
