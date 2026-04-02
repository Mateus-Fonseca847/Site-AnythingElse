document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = Array.from(
    document.querySelectorAll("[data-filter-category]"),
  );
  const productCards = Array.from(document.querySelectorAll("[data-custom-card]"));
  const emptyState = document.querySelector("[data-custom-empty]");
  const resetButton = document.querySelector("[data-reset-filter]");

  if (!filterButtons.length || !productCards.length) {
    return;
  }

  const normalizeCategory = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  function applyFilter(category) {
    const normalizedCategory = normalizeCategory(category);
    let visibleCount = 0;

    filterButtons.forEach((button) => {
      const isActive = button.dataset.filterCategory === normalizedCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    productCards.forEach((card) => {
      const cardCategory = normalizeCategory(card.dataset.category);
      const shouldShow =
        normalizedCategory === "todos" ||
        cardCategory === normalizedCategory ||
        (normalizedCategory === "acessorios" && cardCategory.startsWith("acessor"));

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.filterCategory || "todos");
    });
  });

  resetButton?.addEventListener("click", () => {
    applyFilter("todos");
  });

  applyFilter("todos");
});
