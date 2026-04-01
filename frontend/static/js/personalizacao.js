document.addEventListener("DOMContentLoaded", () => {
  const productButtons = Array.from(
    document.querySelectorAll("[data-product-select]"),
  );
  const uploadInput = document.getElementById("artUpload");
  const uploadName = document.querySelector("[data-upload-name]");
  const scaleRange = document.querySelector("[data-scale-range]");
  const clearButton = document.querySelector("[data-clear-art]");
  const message = document.querySelector("[data-custom-message]");
  const previewTitle = document.querySelector("[data-preview-title]");
  const previewDescription = document.querySelector("[data-preview-description]");
  const selectedProduct = document.querySelector("[data-selected-product]");
  const selectedFile = document.querySelector("[data-selected-file]");
  const mockup = document.querySelector("[data-mockup]");
  const printArea = document.querySelector("[data-print-area]");
  const placeholder = document.querySelector("[data-placeholder]");
  const artImage = document.querySelector("[data-art-image]");

  const products = {
    camiseta: {
      label: "Camiseta",
      title: "Camiseta personalizada",
      description:
        "Arraste sua arte para posicionar a estampa na frente do produto.",
      className: "mockup--camiseta",
      scaleBase: 0.72,
    },
    ecobag: {
      label: "Ecobag",
      title: "Ecobag personalizada",
      description:
        "Visualize sua arte na area frontal ampla da bolsa.",
      className: "mockup--ecobag",
      scaleBase: 0.78,
    },
    caneca: {
      label: "Caneca",
      title: "Caneca personalizada",
      description:
        "Ajuste sua arte na faixa lateral da caneca para testar a aplicacao.",
      className: "mockup--caneca",
      scaleBase: 0.82,
    },
    moletom: {
      label: "Moletom",
      title: "Moletom personalizado",
      description:
        "Posicione sua arte no peito do moletom e confira o resultado.",
      className: "mockup--moletom",
      scaleBase: 0.74,
    },
  };

  const state = {
    product: "camiseta",
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
  };

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function clampOffsets(nextX, nextY) {
    if (!artImage || artImage.hidden) {
      return { x: 0, y: 0 };
    }

    const areaWidth = mockup.clientWidth;
    const areaHeight = mockup.clientHeight;
    const imageWidth = artImage.offsetWidth;
    const imageHeight = artImage.offsetHeight;
    const limitX = Math.max(0, (areaWidth + imageWidth) / 2 - 40);
    const limitY = Math.max(0, (areaHeight + imageHeight) / 2 - 40);

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

  function renderProduct() {
    const product = products[state.product];

    mockup.dataset.product = state.product;
    mockup.className = `mockup ${product.className}`;

    productButtons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.productSelect === state.product,
      );
    });

    if (previewTitle) previewTitle.textContent = product.title;
    if (previewDescription) previewDescription.textContent = product.description;
    if (selectedProduct) selectedProduct.textContent = product.label;

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
      setMessage("PNG carregado. Agora arraste sua arte sobre o produto.");
    };
    reader.readAsDataURL(file);
  });

  scaleRange?.addEventListener("input", (event) => {
    state.scale = Number(event.target.value || 100);
    applyArtTransform();
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
});
