document.addEventListener("DOMContentLoaded", () => {
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
  const sizeButtons = Array.from(document.querySelectorAll("[data-size-option]"));
  const colorButtons = Array.from(document.querySelectorAll("[data-color-option]"));
  const viewButtons = Array.from(document.querySelectorAll("[data-view-option]"));
  const contactPhoneInput = document.querySelector("[data-contact-phone]");
  const customCommentInput = document.querySelector("[data-custom-comment]");
  const layerStack = document.querySelector("[data-layer-stack]");
  const layerList = document.querySelector("[data-layer-list]");
  const layerCount = document.querySelector("[data-layer-count]");
  const viewActions = document.querySelector("[data-view-actions]");
  const mockupNode = document.querySelector("[data-mockup]");
  const printArea = document.querySelector("[data-print-area]");
  const placeholder = document.querySelector("[data-placeholder]");
  const productImage = document.querySelector("[data-product-image]");
  const initialProduct =
    mockupNode?.dataset.initialProduct &&
    ["camiseta", "caneca", "ecobag", "moletom"].includes(mockupNode.dataset.initialProduct)
      ? mockupNode.dataset.initialProduct
      : "camiseta";

  const products = {
    camiseta: {
      label: "Camiseta",
      title: "Camiseta personalizada",
      descriptionFront: "Arraste suas artes para posicionar a estampa na frente do produto.",
      descriptionBack: "As costas possuem uma area separada para novas artes e ajustes proprios.",
      composeTitleFront: "Arte da frente",
      composeTitleBack: "Arte das costas",
      className: "mockup--camiseta",
      scaleBase: 0.72,
      price: 89.9,
      hasViews: true,
      hasColors: true,
      hasSizes: true,
      colors: {
        Branco: {
          front: "/static/img/camisa-branca-frente.png",
          back: "/static/img/camisa-branca-costas.png",
        },
        Preto: {
          front: "/static/img/camisa-preta-frente.png",
          back: "/static/img/camisa-preta-costas.png",
        },
        Azul: {
          front: "/static/img/camisa-azul-frente.png",
          back: "/static/img/camisa-azul-costas.png",
        },
        Bege: {
          front: "/static/img/camisa-bege-frente.png",
          back: "/static/img/camisa-bege-costas.png",
        },
        Cinza: {
          front: "/static/img/camisa-cinza-frente.png",
          back: "/static/img/camisa-cinza-costas.png",
        },
        Verde: {
          front: "/static/img/camisa-verde-frente.png",
          back: "/static/img/camisa-verde-costas.png",
        },
        Vermelho: {
          front: "/static/img/camisa-vermelha-frente.png",
          back: "/static/img/camisa-vermelha-costas.png",
        },
      },
    },
    caneca: {
      label: "Caneca",
      title: "Caneca personalizada",
      descriptionFront: "Posicione sua arte na faixa visivel da caneca e acompanhe o resultado no mockup.",
      descriptionBack: "Posicione sua arte na faixa visivel da caneca e acompanhe o resultado no mockup.",
      className: "mockup--caneca",
      scaleBase: 0.56,
      price: 54.9,
      hasViews: false,
      hasColors: true,
      hasSizes: false,
      colors: {
        Branco: { front: "/static/img/caneca-branca.png" },
        Preto: { front: "/static/img/caneca-preta.png" },
        Azul: { front: "/static/img/caneca-azul.png" },
        Bege: { front: "/static/img/caneca-bege.png" },
        Cinza: { front: "/static/img/caneca-cinza.png" },
        Verde: { front: "/static/img/caneca-verde.png" },
        Vermelho: { front: "/static/img/caneca-vermelha.png" },
      },
    },
    ecobag: {
      label: "Ecobag",
      title: "Ecobag personalizada",
      descriptionFront: "Monte sua arte na frente da ecobag com uma area ampla para composicoes verticais.",
      descriptionBack: "Use as costas da ecobag para criar uma segunda composicao independente.",
      className: "mockup--ecobag",
      scaleBase: 0.72,
      price: 64.9,
      hasViews: true,
      hasColors: true,
      showOnlyAvailableColors: true,
      hasSizes: false,
      colors: {
        Branco: {
          front: "/static/img/ecobag-branca-frente.png",
          back: "/static/img/ecobag-branca-costas.png",
        },
        Preto: {
          front: "/static/img/ecobag-preta-frente.png",
          back: "/static/img/ecobag-preta-costas.png",
        },
        Bege: {
          front: "/static/img/ecobag-bege-frente.png",
          back: "/static/img/ecobag-bege-costas.png",
        },
      },
    },
    moletom: {
      label: "Moletom",
      title: "Moletom personalizado",
      descriptionFront: "Aplique sua arte no peito do moletom e confira o destaque da composicao.",
      descriptionBack: "As costas do moletom recebem uma arte separada para completar a personalizacao.",
      className: "mockup--moletom",
      scaleBase: 0.6,
      price: 149.9,
      hasViews: true,
      hasColors: true,
      hasSizes: true,
      colors: {
        Branco: {
          front: "/static/img/moletom-branco-frente.png",
          back: "/static/img/moletom-branco-costas.png",
        },
        Preto: {
          front: "/static/img/moletom-preto-frente.png",
          back: "/static/img/moletom-preto-costas.png",
        },
        Azul: {
          front: "/static/img/moletom-azul-frente.png",
          back: "/static/img/moletom-azul-costas.png",
        },
        Bege: {
          front: "/static/img/moletom-bege-frente.png",
          back: "/static/img/moletom-bege-costas.png",
        },
        Cinza: {
          front: "/static/img/moletom-cinza-frente.png",
          back: "/static/img/moletom-cinza-costas.png",
        },
        Verde: {
          front: "/static/img/moletom-verde-frente.png",
          back: "/static/img/moletom-verde-costas.png",
        },
        Vermelho: {
          front: "/static/img/moletom-vermelho-frente.png",
          back: "/static/img/moletom-vermelho-costas.png",
        },
      },
    },
  };

  const state = {
    product: initialProduct,
    artworksByView: { front: [], back: [] },
    activeArtworkIdByView: { front: null, back: null },
    draggingArt: false,
    artPointerId: null,
    dragArtworkId: null,
    startPointerX: 0,
    startPointerY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    currentUser: null,
    selectedSize:
      sizeButtons.find((button) => button.classList.contains("is-active"))?.dataset.sizeOption || "G",
    selectedColor:
      colorButtons.find((button) => button.classList.contains("is-active"))?.dataset.colorOption || "Branco",
    currentView:
      viewButtons.find((button) => button.classList.contains("is-active"))?.dataset.viewOption || "front",
    contactPhone: "",
    customComment: "",
  };

  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  function getCurrentArtworks() {
    return state.artworksByView[state.currentView];
  }

  function getCurrentActiveArtworkId() {
    return state.activeArtworkIdByView[state.currentView];
  }

  function setCurrentActiveArtworkId(artworkId) {
    state.activeArtworkIdByView[state.currentView] = artworkId;
  }

  function getActiveArtwork() {
    return getCurrentArtworks().find((artwork) => artwork.id === getCurrentActiveArtworkId()) || null;
  }

  function getAnyArtworkCount() {
    return state.artworksByView.front.length + state.artworksByView.back.length;
  }

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

  function formatPhone(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
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

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  function getProductImageByColor(product, view = state.currentView) {
    const colorEntry = product.colors[state.selectedColor] || product.colors.Branco;
    return colorEntry[view] || colorEntry.front;
  }

  function getAvailableColors(product) {
    return Object.keys(product.colors || {});
  }

  function clampOffsets(artwork, nextX, nextY) {
    if (!artwork?.element) {
      return { x: 0, y: 0 };
    }

    const areaWidth = printArea.clientWidth;
    const areaHeight = printArea.clientHeight;
    const imageWidth = artwork.element.offsetWidth;
    const imageHeight = artwork.element.offsetHeight;
    const limitX = Math.max(0, (areaWidth + imageWidth) / 2 - 28);
    const limitY = Math.max(0, (areaHeight + imageHeight) / 2 - 28);

    return {
      x: Math.min(limitX, Math.max(-limitX, nextX)),
      y: Math.min(limitY, Math.max(-limitY, nextY)),
    };
  }

  function updateScaleControl() {
    const activeArtwork = getActiveArtwork();
    const scale = activeArtwork?.scale || 100;
    if (scaleRange) {
      scaleRange.value = String(scale);
      scaleRange.disabled = !activeArtwork;
    }
    if (scaleValue) {
      scaleValue.textContent = `${scale}%`;
    }
  }

  function applyArtworkTransform(artwork) {
    if (!artwork?.element) return;
    const product = products[state.product];
    const areaWidth = printArea.clientWidth;
    const areaHeight = printArea.clientHeight;
    const ratio =
      artwork.element.naturalWidth && artwork.element.naturalHeight
        ? artwork.element.naturalWidth / artwork.element.naturalHeight
        : 1;
    const dominantSize =
      Math.min(areaWidth, areaHeight) * product.scaleBase * (artwork.scale / 100);

    if (ratio >= 1) {
      artwork.element.style.width = `${dominantSize}px`;
      artwork.element.style.height = "auto";
    } else {
      artwork.element.style.height = `${dominantSize}px`;
      artwork.element.style.width = "auto";
    }

    const clamped = clampOffsets(artwork, artwork.offsetX, artwork.offsetY);
    artwork.offsetX = clamped.x;
    artwork.offsetY = clamped.y;
    artwork.element.style.transform = `translate(calc(-50% + ${artwork.offsetX}px), calc(-50% + ${artwork.offsetY}px))`;
  }

  function renderLayerList() {
    if (!layerList) return;
    const artworks = getCurrentArtworks();
    const viewLabel = state.currentView === "front" ? "frente" : "costas";
    layerList.innerHTML = "";

    artworks.forEach((artwork, index) => {
      const item = document.createElement("div");
      item.className = "editor-layer-item";
      if (artwork.id === getCurrentActiveArtworkId()) {
        item.classList.add("is-active");
      }

      const name = document.createElement("div");
      name.className = "editor-layer-item__name";
      name.textContent = artwork.fileName;

      const meta = document.createElement("div");
      meta.className = "editor-layer-item__meta";
      meta.textContent = `${viewLabel} • Camada ${index + 1}`;

      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "editor-layer-item__action";
      selectButton.textContent = artwork.id === getCurrentActiveArtworkId() ? "Ativa" : "Selecionar";
      selectButton.addEventListener("click", () => {
        setCurrentActiveArtworkId(artwork.id);
        renderLayerList();
        renderArtworks();
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "editor-layer-item__action editor-layer-item__action--remove";
      removeButton.textContent = "Remover";
      removeButton.addEventListener("click", () => removeArtwork(artwork.id));

      item.append(name, meta, selectButton, removeButton);
      item.style.gridTemplateColumns = "minmax(0, 1fr) auto auto auto";
      layerList.appendChild(item);
    });

    if (layerCount) {
      layerCount.textContent = `${artworks.length} arquivo(s)`;
    }
  }

  function syncPlaceholderState() {
    const artworks = getCurrentArtworks();
    const activeArtwork = getActiveArtwork();
    const hasArtworks = artworks.length > 0;
    const viewLabel = state.currentView === "front" ? "frente" : "costas";

    placeholder.hidden = hasArtworks;
    printArea.classList.toggle("has-art", hasArtworks);

    if (selectedFile) {
      selectedFile.textContent = activeArtwork
        ? activeArtwork.fileName
        : hasArtworks
          ? `${artworks.length} arquivos PNG`
          : `Aguardando PNG (${viewLabel})`;
    }

    if (uploadName) {
      uploadName.textContent = hasArtworks
        ? `${artworks.length} arquivo(s) selecionado(s) para ${viewLabel}`
        : "Nenhum arquivo escolhido";
    }

    if (layerStack) {
      layerStack.hidden = !hasArtworks;
    }
  }

  function createArtworkElement(artwork) {
    const image = document.createElement("img");
    image.className = "mockup__art";
    image.alt = artwork.fileName;
    image.src = artwork.src;
    image.dataset.artworkId = artwork.id;

    image.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      setCurrentActiveArtworkId(artwork.id);
      renderLayerList();
      renderArtworks();

      state.draggingArt = true;
      state.artPointerId = event.pointerId;
      state.dragArtworkId = artwork.id;
      state.startPointerX = event.clientX;
      state.startPointerY = event.clientY;
      state.startOffsetX = artwork.offsetX;
      state.startOffsetY = artwork.offsetY;

      image.classList.add("is-dragging");
      image.setPointerCapture(event.pointerId);
    });

    artwork.element = image;
    printArea.appendChild(image);
  }

  function renderArtworks() {
    printArea.querySelectorAll(".mockup__art").forEach((node) => node.remove());
    const artworks = getCurrentArtworks();

    artworks.forEach((artwork) => {
      artwork.element = null;
      createArtworkElement(artwork);
      applyArtworkTransform(artwork);
    });

    syncPlaceholderState();
    updateScaleControl();
  }

  function updateDescriptionForView() {
    const product = products[state.product];
    if (!previewDescription) return;
    previewDescription.textContent =
      state.currentView === "back" ? product.descriptionBack : product.descriptionFront;
  }

  function renderProduct() {
    const product = products[state.product];
    const availableColors = getAvailableColors(product);

    if (!availableColors.includes(state.selectedColor)) {
      state.selectedColor = availableColors[0] || "Branco";
    }

    if (!product.hasViews && state.currentView !== "front") {
      state.currentView = "front";
    }

    mockupNode.dataset.product = state.product;
    mockupNode.className = `mockup ${product.className}`;

    productImage.src = getProductImageByColor(product);
    productImage.alt = product.title;

    if (previewTitle) previewTitle.textContent = product.title;
    if (selectedProduct) selectedProduct.textContent = product.label;
    if (selectedPrice) selectedPrice.textContent = formatPrice(product.price);
    updateDescriptionForView();

    if (sizeGroup) sizeGroup.hidden = !product.hasSizes;
    if (colorGroup) colorGroup.hidden = !product.hasColors;
    if (viewActions) viewActions.hidden = !product.hasViews;

    colorButtons.forEach((button) => {
      const colorName = button.dataset.colorOption || "";
      const isAvailable = availableColors.includes(colorName);
      button.hidden = !product.hasColors || Boolean(product.showOnlyAvailableColors && !isAvailable);
      button.disabled = !isAvailable;
      button.setAttribute("aria-disabled", String(!isAvailable));
      button.classList.toggle("is-disabled", !isAvailable);
      button.classList.toggle("is-active", button.dataset.colorOption === state.selectedColor);
    });

    viewButtons.forEach((button) => {
      button.hidden = !product.hasViews;
      button.classList.toggle("is-active", button.dataset.viewOption === state.currentView);
    });

    requestAnimationFrame(() => {
      renderArtworks();
    });
  }

  function setCurrentView(view) {
    if (!products[state.product].hasViews) {
      state.currentView = "front";
      renderProduct();
      return;
    }
    state.currentView = view;
    renderProduct();
  }

  function removeArtwork(artworkId) {
    const artworks = getCurrentArtworks();
    const index = artworks.findIndex((artwork) => artwork.id === artworkId);
    if (index === -1) return;

    artworks.splice(index, 1);
    if (getCurrentActiveArtworkId() === artworkId) {
      setCurrentActiveArtworkId(artworks[artworks.length - 1]?.id || null);
    }

    renderLayerList();
    renderArtworks();

    if (!artworks.length) {
      setMessage(
        `Envie um PNG para a ${state.currentView === "front" ? "frente" : "costas"} da peça.`,
      );
    }
  }

  async function addArtworkFiles(fileList) {
    const files = Array.from(fileList || []);
    const pngFiles = files.filter((file) => file.type === "image/png");
    if (!pngFiles.length) {
      setMessage("Use apenas arquivos PNG para personalizar os produtos.");
      if (uploadInput) uploadInput.value = "";
      return;
    }

    try {
      const artworks = await Promise.all(
        pngFiles.map(async (file) => ({
          id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fileName: file.name,
          src: await readFileAsDataUrl(file),
          scale: 100,
          offsetX: 0,
          offsetY: 0,
          element: null,
        })),
      );

      const currentArtworks = getCurrentArtworks();
      currentArtworks.push(...artworks);
      setCurrentActiveArtworkId(artworks[artworks.length - 1]?.id || getCurrentActiveArtworkId());
      renderLayerList();
      renderArtworks();
      setMessage(
        `PNG(s) carregado(s) para a ${state.currentView === "front" ? "frente" : "costas"}.`,
        true,
      );
    } catch (error) {
      console.error(error);
      setMessage("Nao foi possivel carregar os arquivos PNG.");
    } finally {
      if (uploadInput) uploadInput.value = "";
    }
  }

  async function buildPreviewImageForSide(side) {
    const previousView = state.currentView;
    if (previousView !== side) {
      state.currentView = side;
      renderProduct();
      await nextFrame();
    }

    const product = products[state.product];
    const mockupRect = mockupNode.getBoundingClientRect();
    const productRect = productImage.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const canvasSize = 1200;
    const scale = canvasSize / Math.max(mockupRect.width, 1);

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const productAsset = await loadImage(getProductImageByColor(product, side));
    const productX = (productRect.left - mockupRect.left) * scale;
    const productY = (productRect.top - mockupRect.top) * scale;
    const productWidth = productRect.width * scale;
    const productHeight = productRect.height * scale;
    context.drawImage(productAsset, productX, productY, productWidth, productHeight);

    for (const artwork of state.artworksByView[side]) {
      if (!artwork.element) continue;
      const artRect = artwork.element.getBoundingClientRect();
      const artAsset = await loadImage(artwork.src);
      const artX = (artRect.left - mockupRect.left) * scale;
      const artY = (artRect.top - mockupRect.top) * scale;
      const artWidth = artRect.width * scale;
      const artHeight = artRect.height * scale;
      context.drawImage(artAsset, artX, artY, artWidth, artHeight);
    }

    if (previousView !== side) {
      state.currentView = previousView;
      renderProduct();
      await nextFrame();
    }

    return canvas.toDataURL("image/png");
  }

  async function addCustomizedProductToCart() {
    if (!getAnyArtworkCount()) {
      setMessage("Envie pelo menos um PNG antes de adicionar o produto personalizado ao carrinho.");
      return;
    }

    if (String(state.contactPhone || "").replace(/\D/g, "").length < 10) {
      setMessage("Informe um numero para contato valido antes de finalizar a personalizacao.");
      contactPhoneInput?.focus();
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
      const frontPreviewImage = await buildPreviewImageForSide("front");
      const backPreviewImage =
        state.artworksByView.back.length > 0 ? await buildPreviewImageForSide("back") : null;
      const cart = loadCart();
      const customSku = `CUSTOM-${state.product.toUpperCase()}-${Date.now()}`;

      const item = {
        sku: customSku,
        title: `Produto personalizado - ${product.label}`,
        price: product.price,
        image: frontPreviewImage,
        size: state.selectedSize,
        quantity: 1,
        isCustomized: true,
        customization: {
          productType: state.product,
          productLabel: product.label,
          selectedSize: state.selectedSize,
          selectedColor: state.selectedColor,
          contactPhone: state.contactPhone,
          customComment: state.customComment.trim(),
          artworkCountFront: state.artworksByView.front.length,
          artworkCountBack: state.artworksByView.back.length,
          artFiles: {
            front: state.artworksByView.front.map((artwork) => ({
              fileName: artwork.fileName,
              artSrc: artwork.src,
              scale: artwork.scale,
              offsetX: artwork.offsetX,
              offsetY: artwork.offsetY,
            })),
            back: state.artworksByView.back.map((artwork) => ({
              fileName: artwork.fileName,
              artSrc: artwork.src,
              scale: artwork.scale,
              offsetX: artwork.offsetX,
              offsetY: artwork.offsetY,
            })),
          },
          previewImageFront: frontPreviewImage,
          previewImageBack: backPreviewImage,
          mockupImageFront: getProductImageByColor(product, "front"),
          mockupImageBack: getProductImageByColor(product, "back"),
        },
      };

      cart.push(item);
      saveCart(cart);
      setMessage(`${product.label} personalizada adicionada ao carrinho com sucesso.`, true);
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

  sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSize = button.dataset.sizeOption || "G";
      sizeButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.selectedColor = button.dataset.colorOption || "Branco";
      renderProduct();
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCurrentView(button.dataset.viewOption || "front");
    });
  });

  uploadInput?.addEventListener("change", (event) => addArtworkFiles(event.target.files));

  scaleRange?.addEventListener("input", (event) => {
    const activeArtwork = getActiveArtwork();
    if (!activeArtwork) return;
    activeArtwork.scale = Number(event.target.value || 100);
    if (scaleValue) {
      scaleValue.textContent = `${activeArtwork.scale}%`;
    }
    applyArtworkTransform(activeArtwork);
  });

  contactPhoneInput?.addEventListener("input", (event) => {
    const formattedValue = formatPhone(event.target.value);
    state.contactPhone = formattedValue;
    event.target.value = formattedValue;
  });

  customCommentInput?.addEventListener("input", (event) => {
    state.customComment = String(event.target.value || "");
  });

  clearButton?.addEventListener("click", () => {
    state.artworksByView[state.currentView] = [];
    state.activeArtworkIdByView[state.currentView] = null;
    renderLayerList();
    renderArtworks();
    setMessage(
      `As artes da ${state.currentView === "front" ? "frente" : "costas"} foram removidas.`,
    );
  });

  addButton?.addEventListener("click", addCustomizedProductToCart);

  printArea?.addEventListener("pointermove", (event) => {
    if (!state.draggingArt || event.pointerId !== state.artPointerId) return;
    const artwork = getCurrentArtworks().find((item) => item.id === state.dragArtworkId);
    if (!artwork) return;

    const nextX = state.startOffsetX + (event.clientX - state.startPointerX);
    const nextY = state.startOffsetY + (event.clientY - state.startPointerY);
    const clamped = clampOffsets(artwork, nextX, nextY);
    artwork.offsetX = clamped.x;
    artwork.offsetY = clamped.y;
    applyArtworkTransform(artwork);
  });

  function stopDraggingArtwork(event) {
    if (!state.draggingArt || event.pointerId !== state.artPointerId) return;
    const dragArtwork = getCurrentArtworks().find((item) => item.id === state.dragArtworkId);
    dragArtwork?.element?.classList.remove("is-dragging");
    dragArtwork?.element?.releasePointerCapture(event.pointerId);
    state.draggingArt = false;
    state.artPointerId = null;
    state.dragArtworkId = null;
  }

  printArea?.addEventListener("pointerup", stopDraggingArtwork);
  printArea?.addEventListener("pointercancel", stopDraggingArtwork);

  window.addEventListener("resize", () => {
    renderArtworks();
  });

  renderProduct();
  renderLayerList();
  renderArtworks();
  if (contactPhoneInput) contactPhoneInput.value = state.contactPhone;
  if (customCommentInput) customCommentInput.value = state.customComment;
  resolveCurrentUser();
});
