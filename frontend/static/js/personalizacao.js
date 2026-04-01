document.addEventListener("DOMContentLoaded", () => {
  const productButtons = Array.from(
    document.querySelectorAll("[data-product-select]"),
  );
  const uploadInput = document.getElementById("artUpload");
  const uploadName = document.querySelector("[data-upload-name]");
  const scaleRange = document.querySelector("[data-scale-range]");
  const clearButton = document.querySelector("[data-clear-art]");
  const addButton = document.querySelector("[data-add-custom-product]");
  const message = document.querySelector("[data-custom-message]");
  const previewTitle = document.querySelector("[data-preview-title]");
  const previewDescription = document.querySelector("[data-preview-description]");
  const selectedProduct = document.querySelector("[data-selected-product]");
  const selectedPrice = document.querySelector("[data-selected-price]");
  const selectedFile = document.querySelector("[data-selected-file]");
  const scaleValue = document.querySelector("[data-scale-value]");
  const sizeGroup = document.querySelector("[data-size-group]");
  const colorGroup = document.querySelector("[data-color-group]");
  const sizeButtons = Array.from(
    document.querySelectorAll("[data-size-option]"),
  );
  const colorButtons = Array.from(
    document.querySelectorAll("[data-color-option]"),
  );
  const mockup = document.querySelector("[data-mockup]");
  const printArea = document.querySelector("[data-print-area]");
  const placeholder = document.querySelector("[data-placeholder]");
  const artImage = document.querySelector("[data-art-image]");
  const productImage = document.querySelector("[data-product-image]");
  const initialProduct =
    mockup?.dataset.initialProduct && ["camiseta", "ecobag", "caneca", "moletom"].includes(mockup.dataset.initialProduct)
      ? mockup.dataset.initialProduct
      : "camiseta";

  const products = {
    camiseta: {
      label: "Camiseta",
      title: "Camiseta personalizada",
      description:
        "Arraste sua arte para posicionar a estampa na frente do produto.",
      className: "mockup--camiseta",
      scaleBase: 0.72,
      price: 89.9,
      image: "/static/img/camisa.jpg",
      imageWhite: "/static/img/camisa.jpg",
      imageBlack: "/static/img/camisa.jpg",
    },
    ecobag: {
      label: "Ecobag",
      title: "Ecobag personalizada",
      description: "Visualize sua arte na area frontal ampla da bolsa.",
      className: "mockup--ecobag",
      scaleBase: 0.78,
      price: 64.9,
      image: "/static/img/ecobag.webp",
      imageWhite: "/static/img/ecobag.webp",
      imageBlack: "/static/img/ecobag.webp",
    },
    caneca: {
      label: "Caneca",
      title: "Caneca personalizada",
      description:
        "Ajuste sua arte na faixa lateral da caneca para testar a aplicacao.",
      className: "mockup--caneca",
      scaleBase: 0.82,
      price: 54.9,
      image: "/static/img/caneca.webp",
      imageWhite: "/static/img/caneca.webp",
      imageBlack: "/static/img/caneca.webp",
    },
    moletom: {
      label: "Moletom",
      title: "Moletom personalizado",
      description:
        "Posicione sua arte no peito do moletom e confira o resultado.",
      className: "mockup--moletom",
      scaleBase: 0.74,
      price: 149.9,
      image: "/static/img/moletom.webp",
      imageWhite: "/static/img/moletom.webp",
      imageBlack: "/static/img/moletom.webp",
    },
  };

  const state = {
    product: initialProduct,
    fileName: "",
    src: "",
    scale: 100,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    pointerId: null,
    startPointerX: 0,
    startPointerY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    currentUser: null,
    selectedSize:
      sizeButtons.find((button) => button.classList.contains("is-active"))
        ?.dataset.sizeOption || "G",
    selectedColor:
      colorButtons.find((button) => button.classList.contains("is-active"))
        ?.dataset.colorOption || "Branco",
  };

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function setMessage(text, isSuccess = false) {
    if (!message) return;
    message.textContent = text;
    message.style.color = isSuccess ? "#0f766e" : "";
  }

  function getCartStorageKey() {
    if (state.currentUser?.email) {
      return `anythingelse_cart_user_${state.currentUser.email}`;
    }

    return "anythingelse_cart_guest";
  }

  async function resolveCurrentUser() {
    try {
      const response = await fetch("/auth/me");
      const data = await response.json();

      if (response.ok && data.user) {
        state.currentUser = data.user;
        return data.user;
      }
    } catch (error) {
      console.error(error);
    }

    state.currentUser = null;
    return null;
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(getCartStorageKey());
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  }

  function clampOffsets(nextX, nextY) {
    if (!artImage || artImage.hidden) {
      return { x: 0, y: 0 };
    }

    const areaWidth = mockup.clientWidth;
    const areaHeight = mockup.clientHeight;
    const imageWidth = artImage.offsetWidth;
    const imageHeight = artImage.offsetHeight;
    const limitX = Math.max(0, (areaWidth + imageWidth) / 2 - 28);
    const limitY = Math.max(0, (areaHeight + imageHeight) / 2 - 28);

    return {
      x: Math.min(limitX, Math.max(-limitX, nextX)),
      y: Math.min(limitY, Math.max(-limitY, nextY)),
    };
  }

  function applyArtTransform() {
    if (!artImage || !state.src) return;

    const product = products[state.product];
    const areaWidth = printArea.clientWidth;
    const areaHeight = printArea.clientHeight;
    const ratio = artImage.naturalWidth && artImage.naturalHeight
      ? artImage.naturalWidth / artImage.naturalHeight
      : 1;
    const dominantSize =
      Math.min(areaWidth, areaHeight) * product.scaleBase * (state.scale / 100);

    if (ratio >= 1) {
      artImage.style.width = `${dominantSize}px`;
      artImage.style.height = "auto";
    } else {
      artImage.style.height = `${dominantSize}px`;
      artImage.style.width = "auto";
    }

    const clamped = clampOffsets(state.offsetX, state.offsetY);
    state.offsetX = clamped.x;
    state.offsetY = clamped.y;

    artImage.style.transform = `translate(calc(-50% + ${state.offsetX}px), calc(-50% + ${state.offsetY}px))`;
  }

  function getProductImageByColor(product) {
    if (state.product === "ecobag" || state.product === "caneca") {
      return product.image;
    }

    if (state.selectedColor === "Preto") {
      return product.imageBlack || product.image;
    }

    return product.imageWhite || product.image;
  }

  function renderProduct() {
    const product = products[state.product];
    const hideVariants = state.product === "ecobag" || state.product === "caneca";

    mockup.dataset.product = state.product;
    mockup.className = `mockup ${product.className}`;
    productImage.src = getProductImageByColor(product);
    productImage.alt = product.title;

    productButtons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.productSelect === state.product,
      );
    });

    if (previewTitle) previewTitle.textContent = product.title;
    if (previewDescription) previewDescription.textContent = product.description;
    if (selectedProduct) selectedProduct.textContent = product.label;
    if (selectedPrice) selectedPrice.textContent = formatPrice(product.price);
    if (sizeGroup) {
      sizeGroup.hidden = hideVariants;
    }
    if (colorGroup) {
      colorGroup.hidden = hideVariants;
    }

    if (hideVariants) {
      mockup.dataset.colorName = "Original";
      mockup.dataset.colorVariant = "Original";
    } else {
      mockup.dataset.colorName = state.selectedColor;
      mockup.dataset.colorVariant = state.selectedColor;
    }

    requestAnimationFrame(() => {
      applyArtTransform();
    });
  }

  function renderArt() {
    const hasArt = Boolean(state.src);

    if (!hasArt) {
      artImage.hidden = true;
      artImage.removeAttribute("src");
      placeholder.hidden = false;
      if (selectedFile) selectedFile.textContent = "Aguardando PNG";
      if (uploadName) uploadName.textContent = "Nenhum arquivo escolhido";
      return;
    }

    artImage.src = state.src;
    artImage.hidden = false;
    placeholder.hidden = true;

    if (selectedFile) selectedFile.textContent = state.fileName;
    if (uploadName) uploadName.textContent = state.fileName;

    if (artImage.complete) {
      requestAnimationFrame(() => {
        applyArtTransform();
      });
      return;
    }

    artImage.onload = () => {
      applyArtTransform();
    };
  }

  function resetArtPosition() {
    state.offsetX = 0;
    state.offsetY = 0;
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  async function buildPreviewImage() {
    const mockupRect = mockup.getBoundingClientRect();
    const productRect = productImage.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const canvasSize = 1200;
    const scale = canvasSize / Math.max(mockupRect.width, 1);
    const context = canvas.getContext("2d");
    const product = products[state.product];

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const productAsset = await loadImage(getProductImageByColor(product));
    const productX = (productRect.left - mockupRect.left) * scale;
    const productY = (productRect.top - mockupRect.top) * scale;
    const productWidth = productRect.width * scale;
    const productHeight = productRect.height * scale;

    context.drawImage(
      productAsset,
      productX,
      productY,
      productWidth,
      productHeight,
    );

    if (state.src && !artImage.hidden) {
      const artRect = artImage.getBoundingClientRect();
      const artAsset = await loadImage(state.src);
      const artX = (artRect.left - mockupRect.left) * scale;
      const artY = (artRect.top - mockupRect.top) * scale;
      const artWidth = artRect.width * scale;
      const artHeight = artRect.height * scale;

      context.drawImage(artAsset, artX, artY, artWidth, artHeight);
    }

    return canvas.toDataURL("image/png");
  }

  async function addCustomizedProductToCart() {
    if (!state.src) {
      setMessage("Envie um PNG antes de adicionar o produto personalizado ao carrinho.");
      return;
    }

    const buttonText = addButton?.textContent || "Adicionar ao carrinho";

    if (addButton) {
      addButton.disabled = true;
      addButton.textContent = "Adicionando...";
    }

    try {
      await resolveCurrentUser();
      const product = products[state.product];
      const previewImage = await buildPreviewImage();
      const cart = loadCart();
      const customSku = `CUSTOM-${state.product.toUpperCase()}-${Date.now()}`;
      const item = {
        sku: customSku,
        title: `Produto personalizado - ${product.label}`,
        price: product.price,
        image: previewImage,
        size: hideVariants ? "" : state.selectedSize,
        quantity: 1,
        isCustomized: true,
        customization: {
          productType: state.product,
          productLabel: product.label,
          selectedSize: hideVariants ? "" : state.selectedSize,
          selectedColor: hideVariants ? "" : state.selectedColor,
          artName: state.fileName,
          artSrc: state.src,
          scale: state.scale,
          offsetX: state.offsetX,
          offsetY: state.offsetY,
          previewImage,
          mockupImage: getProductImageByColor(product),
        },
      };

      cart.push(item);
      saveCart(cart);

      setMessage(
        `${product.label} personalizada adicionada ao carrinho com sucesso.`,
        true,
      );
    } catch (error) {
      console.error(error);
      setMessage("Nao foi possivel adicionar o produto personalizado ao carrinho.");
    } finally {
      if (addButton) {
        addButton.disabled = false;
        addButton.textContent = buttonText;
      }
    }
  }

  productButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.product = button.dataset.productSelect;
      resetArtPosition();
      renderProduct();
    });
  });

  uploadInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "image/png") {
      setMessage("Use apenas arquivos PNG para personalizar os produtos.");
      uploadInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      state.src = String(reader.result || "");
      state.fileName = file.name;
      state.scale = 100;
      scaleRange.value = "100";
      resetArtPosition();
      renderArt();
      setMessage("PNG carregado. Agora arraste sua arte sobre o produto.", true);
    };
    reader.readAsDataURL(file);
  });

  scaleRange?.addEventListener("input", (event) => {
    state.scale = Number(event.target.value || 100);
    if (scaleValue) {
      scaleValue.textContent = `${state.scale}%`;
    }
    applyArtTransform();
  });

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSize = button.dataset.sizeOption || "G";
      sizeButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedColor = button.dataset.colorOption || "Branco";
      colorButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderProduct();
    });
  });

  clearButton?.addEventListener("click", () => {
    state.src = "";
    state.fileName = "";
    state.scale = 100;
    scaleRange.value = "100";
    resetArtPosition();
    renderArt();
    setMessage("Envie um PNG e arraste a arte dentro da area destacada do produto.");
  });

  addButton?.addEventListener("click", addCustomizedProductToCart);

  artImage?.addEventListener("pointerdown", (event) => {
    if (!state.src) return;

    state.dragging = true;
    state.pointerId = event.pointerId;
    state.startPointerX = event.clientX;
    state.startPointerY = event.clientY;
    state.startOffsetX = state.offsetX;
    state.startOffsetY = state.offsetY;

    artImage.classList.add("is-dragging");
    artImage.setPointerCapture(event.pointerId);
  });

  artImage?.addEventListener("pointermove", (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    const nextX = state.startOffsetX + (event.clientX - state.startPointerX);
    const nextY = state.startOffsetY + (event.clientY - state.startPointerY);
    const clamped = clampOffsets(nextX, nextY);

    state.offsetX = clamped.x;
    state.offsetY = clamped.y;
    applyArtTransform();
  });

  function stopDragging(event) {
    if (!state.dragging || event.pointerId !== state.pointerId) return;

    state.dragging = false;
    artImage.classList.remove("is-dragging");
    artImage.releasePointerCapture(event.pointerId);
  }

  artImage?.addEventListener("pointerup", stopDragging);
  artImage?.addEventListener("pointercancel", stopDragging);

  window.addEventListener("resize", () => {
    applyArtTransform();
  });

  renderProduct();
  renderArt();
  if (scaleValue) {
    scaleValue.textContent = `${state.scale}%`;
  }
  resolveCurrentUser();
});
