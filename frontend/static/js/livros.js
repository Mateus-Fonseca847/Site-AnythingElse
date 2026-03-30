const sortDropdown = document.getElementById("sortDropdown");
const sortDropdownTrigger = document.getElementById("sortDropdownTrigger");
const sortDropdownMenu = document.getElementById("sortDropdownMenu");
const sortDropdownLabel = document.getElementById("sortDropdownLabel");
const sortProductsInput = document.getElementById("sortProducts");
const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");
const genreButtons = Array.from(document.querySelectorAll(".genre-chip"));
const sizeButtons = Array.from(document.querySelectorAll(".size-chip"));
const typeButtons = Array.from(document.querySelectorAll(".type-chip"));
const activeFilters = document.getElementById("activeFilters");
const activeFiltersList = document.getElementById("activeFiltersList");
const clearAllFilters = document.getElementById("clearAllFilters");

let selectedColors = [];
let selectedSizes = [];
let selectedTypes = [];
let currentSort = "relevancia";

function getProductCards() {
  return Array.from(productsGrid.querySelectorAll(".product-card"));
}

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function hasSize(productSizes, selectedSize) {
  const normalized = normalizeText(productSizes);
  if (!normalized) return false;
  return normalized
    .split(",")
    .map((item) => item.trim())
    .includes(normalizeText(selectedSize));
}

function applyFilters() {
  const cards = getProductCards();
  let visibleCount = 0;

  cards.forEach((card) => {
    const cardColor = normalizeText(card.dataset.color);
    const cardSizes = normalizeText(card.dataset.sizes);
    const cardType = normalizeText(card.dataset.type);

    const matchColor =
      selectedColors.length === 0 || selectedColors.includes(cardColor);

    const matchSize =
      selectedSizes.length === 0 ||
      selectedSizes.some((size) => hasSize(cardSizes, size));

    const matchType =
      selectedTypes.length === 0 || selectedTypes.includes(cardType);

    const visible = matchColor && matchSize && matchType;
    card.style.display = visible ? "" : "none";

    if (visible) visibleCount += 1;
  });

  if (productCount) {
    productCount.textContent = `${visibleCount} livro${visibleCount !== 1 ? "s" : ""}`;
  }

  updateActiveFilters();
}

function sortCards(value) {
  currentSort = value;
  const cards = getProductCards();

  cards.sort((a, b) => {
    const nameA = normalizeText(a.dataset.name);
    const nameB = normalizeText(b.dataset.name);
    const priceA = parseFloat(a.dataset.price || "0");
    const priceB = parseFloat(b.dataset.price || "0");
    const salesA = parseInt(a.dataset.sales || "0", 10);
    const salesB = parseInt(b.dataset.sales || "0", 10);
    const discountA = parseFloat(a.dataset.discount || "0");
    const discountB = parseFloat(b.dataset.discount || "0");
    const dateA = new Date(a.dataset.releaseDate || "1970-01-01").getTime();
    const dateB = new Date(b.dataset.releaseDate || "1970-01-01").getTime();

    switch (value) {
      case "mais-vendidos":
        return salesB - salesA;
      case "novidades":
        return dateB - dateA;
      case "melhor-desconto":
        return discountB - discountA;
      case "maior-preco":
        return priceB - priceA;
      case "menor-preco":
        return priceA - priceB;
      case "nome-az":
        return nameA.localeCompare(nameB, "pt-BR");
      case "nome-za":
        return nameB.localeCompare(nameA, "pt-BR");
      default:
        return 0;
    }
  });

  cards.forEach((card) => productsGrid.appendChild(card));
  applyFilters();
}

function updateActiveFilters() {
  const chips = [];

  selectedColors.forEach((color) => {
    chips.push({
      type: "color",
      value: color,
      label: `Gênero: ${color}`,
    });
  });

  selectedSizes.forEach((size) => {
    chips.push({ type: "size", value: size, label: `Formato: ${size}` });
  });

  selectedTypes.forEach((type) => {
    chips.push({ type: "type", value: type, label: `Tipo: ${type}` });
  });

  activeFiltersList.innerHTML = "";

  if (chips.length === 0) {
    activeFilters.hidden = true;
    return;
  }

  activeFilters.hidden = false;

  chips.forEach((chip) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "active-filter-chip";
    button.innerHTML = `${chip.label} <span>×</span>`;

    button.addEventListener("click", () => {
      if (chip.type === "color") {
        selectedColors = selectedColors.filter((item) => item !== chip.value);
        genreButtons.forEach((btn) => {
          if (btn.dataset.color === chip.value) btn.classList.remove("active");
        });
      }

      if (chip.type === "size") {
        selectedSizes = selectedSizes.filter((item) => item !== chip.value);
        sizeButtons.forEach((btn) => {
          if (btn.dataset.size === chip.value) btn.classList.remove("active");
        });
      }

      if (chip.type === "type") {
        selectedTypes = selectedTypes.filter((item) => item !== chip.value);
        typeButtons.forEach((btn) => {
          if (normalizeText(btn.dataset.type) === chip.value)
            btn.classList.remove("active");
        });
      }

      applyFilters();
    });

    activeFiltersList.appendChild(button);
  });
}

genreButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = normalizeText(button.dataset.color);
    button.classList.toggle("active");

    if (button.classList.contains("active")) {
      if (!selectedColors.includes(value)) selectedColors.push(value);
    } else {
      selectedColors = selectedColors.filter((item) => item !== value);
    }

    applyFilters();
  });
});

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = normalizeText(button.dataset.size);
    button.classList.toggle("active");

    if (button.classList.contains("active")) {
      if (!selectedSizes.includes(value)) selectedSizes.push(value);
    } else {
      selectedSizes = selectedSizes.filter((item) => item !== value);
    }

    applyFilters();
  });
});

typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = normalizeText(button.dataset.type);
    button.classList.toggle("active");

    if (button.classList.contains("active")) {
      if (!selectedTypes.includes(value)) selectedTypes.push(value);
    } else {
      selectedTypes = selectedTypes.filter((item) => item !== value);
    }

    applyFilters();
  });
});

if (clearAllFilters) {
  clearAllFilters.addEventListener("click", () => {
    selectedColors = [];
    selectedSizes = [];
    selectedTypes = [];

    genreButtons.forEach((btn) => btn.classList.remove("active"));
    sizeButtons.forEach((btn) => btn.classList.remove("active"));
    typeButtons.forEach((btn) => btn.classList.remove("active"));

    applyFilters();
  });
}

if (sortDropdownTrigger && sortDropdownMenu) {
  sortDropdownTrigger.addEventListener("click", () => {
    const expanded =
      sortDropdownTrigger.getAttribute("aria-expanded") === "true";
    sortDropdownTrigger.setAttribute("aria-expanded", String(!expanded));
    sortDropdown.classList.toggle("is-open", !expanded);
  });

  document.addEventListener("click", (event) => {
    if (!sortDropdown.contains(event.target)) {
      sortDropdown.classList.remove("is-open");
      sortDropdownTrigger.setAttribute("aria-expanded", "false");
    }
  });

  sortDropdownMenu
    .querySelectorAll(".sort-dropdown__option")
    .forEach((option) => {
      option.addEventListener("click", () => {
        sortDropdownMenu
          .querySelectorAll(".sort-dropdown__option")
          .forEach((btn) => btn.classList.remove("is-selected"));

        option.classList.add("is-selected");

        const text = option.textContent.trim();
        const value = option.dataset.value;

        sortDropdownLabel.textContent = text;
        sortProductsInput.value = value;

        sortDropdown.classList.remove("is-open");
        sortDropdownTrigger.setAttribute("aria-expanded", "false");

        sortCards(value);
      });
    });
}

applyFilters();
