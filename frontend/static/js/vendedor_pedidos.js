document.addEventListener("DOMContentLoaded", async () => {
  const ordersContainer = document.querySelector("[data-seller-orders]");

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function renderEmpty(message) {
    if (!ordersContainer) return;

    ordersContainer.innerHTML = `
      <article class="seller-empty">
        <h2>Nenhum pedido encontrado</h2>
        <p>${message}</p>
      </article>
    `;
  }

  function renderOrders(orders) {
    if (!ordersContainer) return;

    if (!orders.length) {
      renderEmpty("Assim que uma compra for finalizada, ela vai aparecer aqui.");
      return;
    }

    ordersContainer.innerHTML = orders
      .map((order) => {
        const deliveryLabel =
          order.delivery_mode === "pickup" ? "Retirada" : "Entrega";

        const itemsMarkup = (order.items || [])
          .map((item) => {
            const customization = item.customization || {};

            return `
              <article class="seller-item">
                <img src="${item.image || customization.previewImage || ""}" alt="${item.title || "Produto"}" />
                <div class="seller-item__meta">
                  <strong>${item.title || "Produto"}</strong>
                  <span>SKU: ${item.sku || "-"}</span>
                  <span>Quantidade: ${item.quantity || 1}</span>
                  <span>Valor unitario: ${formatPrice(item.unit_price)}</span>
                  <span>Subtotal: ${formatPrice(item.subtotal)}</span>
                  <span>${customization.productLabel ? `Base: ${customization.productLabel}` : "Produto padrao"}</span>
                  <span>${customization.artName ? `Arte enviada: ${customization.artName}` : "Sem arquivo personalizado"}</span>
                </div>
              </article>
            `;
          })
          .join("");

        return `
          <article class="seller-order">
            <div class="seller-order__top">
              <div>
                <h2>Pedido ${order.order_number}</h2>
                <p>${order.customer_name || order.user_email}</p>
              </div>
              <span class="seller-order__status">${order.status || "Recebido"}</span>
            </div>

            <div class="seller-order__meta">
              <span>Cliente: ${order.user_email}</span>
              <span>Entrega: ${deliveryLabel}</span>
              <span>Pagamento: ${order.payment_method || "pix"}</span>
              <span>Frete: ${formatPrice(order.shipping)}</span>
              <span>Total: ${formatPrice(order.total)}</span>
              <span>CEP: ${order.cep || "-"}</span>
            </div>

            <div class="seller-items">
              ${itemsMarkup}
            </div>
          </article>
        `;
      })
      .join("");
  }

  try {
    const response = await fetch("/api/seller/orders");
    const data = await response.json();

    if (!response.ok || !data.ok) {
      renderEmpty("Nao foi possivel carregar os pedidos agora.");
      return;
    }

    renderOrders(data.orders || []);
  } catch (error) {
    console.error(error);
    renderEmpty("Ocorreu um erro ao buscar os pedidos.");
  }
});
