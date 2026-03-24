const sortDropdown = document.getElementById("sortDropdown");
const sortTrigger = document.getElementById("sortDropdownTrigger");
const sortMenu = document.getElementById("sortDropdownMenu");
const sortLabel = document.getElementById("sortDropdownLabel");
const sortInput = document.getElementById("sortProducts");
const sortOptions = document.querySelectorAll(".sort-dropdown__option");

if (sortDropdown && sortTrigger && sortMenu && sortLabel && sortInput) {
  sortTrigger.addEventListener("click", () => {
    const isOpen = sortDropdown.classList.toggle("is-open");
    sortTrigger.setAttribute("aria-expanded", String(isOpen));
  });

  sortOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value || "";
      const label = option.textContent.trim();

      sortInput.value = value;
      sortLabel.textContent = label;

      sortOptions.forEach((item) => item.classList.remove("is-selected"));
      option.classList.add("is-selected");

      sortDropdown.classList.remove("is-open");
      sortTrigger.setAttribute("aria-expanded", "false");

      // aqui você pode chamar sua função de ordenação real
      // ex.: ordenarProdutos(value);
    });
  });

  document.addEventListener("click", (event) => {
    if (!sortDropdown.contains(event.target)) {
      sortDropdown.classList.remove("is-open");
      sortTrigger.setAttribute("aria-expanded", "false");
    }
  });
}
