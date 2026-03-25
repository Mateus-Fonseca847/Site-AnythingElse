const sortDropdown = document.getElementById("sortDropdown");
const sortTrigger = document.getElementById("sortDropdownTrigger");
const sortMenu = document.getElementById("sortDropdownMenu");
const sortLabel = document.getElementById("sortDropdownLabel");
const sortInput = document.getElementById("sortProducts");
const sortOptions = document.querySelectorAll(".sort-dropdown__option");

const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");

const colorButtons = document.querySelectorAll(".color-dot");
const sizeButtons = document.querySelectorAll(".size-chip");
const typeButtons = document.querySelectorAll(".type-chip");

const activeFilters = document.getElementById("activeFilters");
const activeFiltersList = document.getElementById("activeFiltersList");
const clearAllFiltersButton = document.getElementById("clearAllFilters");

const state = {
  color: "",
  size: "",
  type: "",
  sort: sortInput?.value || "relevancia",
};

function getProductCards() {
  return Array.from(document.querySelectorAll(".product-card"));
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDateValue(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function capitalizeText(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getSortLabel(value) {
  const labels = {
    relevancia: "Relevância",
    "mais-vendidos": "Mais vendidos",
    novidades: "Novidades",
    "melhor-desconto": "Maior desconto",
    "maior-preco": "Maior preço",
    "menor-preco": "Menor preço",
    "nome-az": "Nome A-Z",
    "nome-za": "Nome Z-A",
  };

  return labels[value] || "Relevância";
}

function getTypeLabel(value) {
  const labels = {
    camiseta: "Camiseta",
    acessório: "Acessório",
    acessorio: "Acessório",
    mochila: "Mochila",
    ecobag: "Ecobag",
    garrafa: "Garrafa",
    livro: "Livro",
    "action figure": "Action Figure",
    máscara: "Máscara",
    mascara: "Máscara",
    "box dvd": "Box DVD",
  };

  return labels[value] || capitalizeText(value);
}

function createActiveFilterTag(label, value, onRemove) {
  const tag = document.createElement("div");
  tag.className = "active-filter-tag";

  const text = document.createElement("span");
  text.innerHTML = `<strong>${label}:</strong> ${value}`;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remover filtro ${label}`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", onRemove);

  tag.appendChild(text);
  tag.appendChild(removeButton);

  return tag;
}

function syncButtonStates() {
  colorButtons.forEach((button) => {
    const color = normalizeText(button.dataset.color);
    button.classList.toggle(
      "is-active",
      color === state.color && state.color !== "",
    );
  });

  sizeButtons.forEach((button) => {
    const size = normalizeText(button.dataset.size);
    button.classList.toggle(
      "is-active",
      size === state.size && state.size !== "",
    );
  });

  typeButtons.forEach((button) => {
    const type = normalizeText(button.dataset.type);
    button.classList.toggle(
      "is-active",
      type === state.type && state.type !== "",
    );
  });

  sortOptions.forEach((option) => {
    const value = option.dataset.value || "";
    option.classList.toggle("is-selected", value === state.sort);
  });

  if (sortLabel) {
    sortLabel.textContent = getSortLabel(state.sort);
  }

  if (sortInput) {
    sortInput.value = state.sort;
  }
}

function renderActiveFilters() {
  if (!activeFilters || !activeFiltersList) return;

  activeFiltersList.innerHTML = "";

  const tags = [];

  if (state.color) {
    tags.push(
      createActiveFilterTag("Cor", capitalizeText(state.color), () => {
        state.color = "";
        syncButtonStates();
        applyFiltersAndSort();
      }),
    );
  }

  if (state.size) {
    tags.push(
      createActiveFilterTag("Tamanho", state.size.toUpperCase(), () => {
        state.size = "";
        syncButtonStates();
        applyFiltersAndSort();
      }),
    );
  }

  if (state.type) {
    tags.push(
      createActiveFilterTag("Tipo", getTypeLabel(state.type), () => {
        state.type = "";
        syncButtonStates();
        applyFiltersAndSort();
      }),
    );
  }

  if (state.sort && state.sort !== "relevancia") {
    tags.push(
      createActiveFilterTag("Ordenação", getSortLabel(state.sort), () => {
        state.sort = "relevancia";
        syncButtonStates();
        applyFiltersAndSort();
      }),
    );
  }

  if (tags.length === 0) {
    activeFilters.hidden = true;
    return;
  }

  tags.forEach((tag) => activeFiltersList.appendChild(tag));
  activeFilters.hidden = false;
}

function productMatchesFilters(card) {
  const productType = normalizeText(card.dataset.type);
  const productColor = normalizeText(card.dataset.color);
  const productSizes = normalizeText(card.dataset.sizes)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (state.color) {
    const allowedColorTypes = [
      "camiseta",
      "acessório",
      "acessorio",
      "mochila",
      "ecobag",
      "garrafa",
    ];
    const hasCompatibleType = allowedColorTypes.includes(productType);
    const hasDefinedColor = productColor !== "";

    if (
      !hasCompatibleType ||
      !hasDefinedColor ||
      productColor !== state.color
    ) {
      return false;
    }
  }

  if (state.size) {
    if (productType !== "camiseta") return false;
    if (!productSizes.includes(state.size.toLowerCase())) return false;
  }

  if (state.type && productType !== state.type) {
    return false;
  }

  return true;
}

function compareProducts(a, b) {
  const sortValue = state.sort;

  const priceA = parseNumber(a.dataset.price);
  const priceB = parseNumber(b.dataset.price);

  const salesA = parseNumber(a.dataset.sales);
  const salesB = parseNumber(b.dataset.sales);

  const discountA = parseNumber(a.dataset.discount, 0);
  const discountB = parseNumber(b.dataset.discount, 0);

  const dateA = parseDateValue(a.dataset.releaseDate);
  const dateB = parseDateValue(b.dataset.releaseDate);

  const nameA = normalizeText(a.dataset.name);
  const nameB = normalizeText(b.dataset.name);

  switch (sortValue) {
    case "mais-vendidos":
      return salesB - salesA || nameA.localeCompare(nameB, "pt-BR");

    case "novidades":
      return dateB - dateA || nameA.localeCompare(nameB, "pt-BR");

    case "melhor-desconto":
      return discountB - discountA || nameA.localeCompare(nameB, "pt-BR");

    case "maior-preco":
      return priceB - priceA || nameA.localeCompare(nameB, "pt-BR");

    case "menor-preco":
      return priceA - priceB || nameA.localeCompare(nameB, "pt-BR");

    case "nome-az":
      return nameA.localeCompare(nameB, "pt-BR");

    case "nome-za":
      return nameB.localeCompare(nameA, "pt-BR");

    case "relevancia":
    default:
      return 0;
  }
}

function applyFiltersAndSort() {
  if (!productsGrid) return;

  const cards = getProductCards();
  const filteredCards = cards.filter(productMatchesFilters);
  const sortedCards = [...filteredCards].sort(compareProducts);

  cards.forEach((card) => {
    card.style.display = "none";
  });

  sortedCards.forEach((card) => {
    card.style.display = "";
    productsGrid.appendChild(card);
  });

  if (productCount) {
    const total = sortedCards.length;
    productCount.textContent = `${total} produto${total !== 1 ? "s" : ""}`;
  }

  renderActiveFilters();
}

function toggleSingleSelection(buttons, activeButton, stateKey, value) {
  const isAlreadyActive = activeButton.classList.contains("is-active");

  buttons.forEach((button) => button.classList.remove("is-active"));

  if (isAlreadyActive) {
    state[stateKey] = "";
  } else {
    activeButton.classList.add("is-active");
    state[stateKey] = value;
  }

  applyFiltersAndSort();
}

if (sortDropdown && sortTrigger && sortMenu && sortLabel && sortInput) {
  sortTrigger.addEventListener("click", () => {
    const isOpen = sortDropdown.classList.toggle("is-open");
    sortTrigger.setAttribute("aria-expanded", String(isOpen));
  });

  sortOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value || "";
      const label = option.textContent.trim();

      state.sort = value;
      sortInput.value = value;
      sortLabel.textContent = label;

      sortOptions.forEach((item) => item.classList.remove("is-selected"));
      option.classList.add("is-selected");

      sortDropdown.classList.remove("is-open");
      sortTrigger.setAttribute("aria-expanded", "false");

      applyFiltersAndSort();
    });
  });

  document.addEventListener("click", (event) => {
    if (!sortDropdown.contains(event.target)) {
      sortDropdown.classList.remove("is-open");
      sortTrigger.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll(".product-card").forEach((card) => {
  card.style.cursor = "pointer";

  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;

    const url = card.dataset.url;
    if (url) {
      window.location.href = url;
    }
  });
});

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const color = normalizeText(button.dataset.color);
    toggleSingleSelection(colorButtons, button, "color", color);
  });
});

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const size = normalizeText(button.dataset.size);
    toggleSingleSelection(sizeButtons, button, "size", size);
  });
});

typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = normalizeText(button.dataset.type);
    toggleSingleSelection(typeButtons, button, "type", type);
  });
});

if (clearAllFiltersButton) {
  clearAllFiltersButton.addEventListener("click", () => {
    state.color = "";
    state.size = "";
    state.type = "";
    state.sort = "relevancia";

    syncButtonStates();
    applyFiltersAndSort();
  });
}

syncButtonStates();
applyFiltersAndSort();
