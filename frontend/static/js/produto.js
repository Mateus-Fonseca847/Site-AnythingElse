const thumbs = document.querySelectorAll(".product-thumb");
const mainProductImage = document.getElementById("mainProductImage");
const stickyBuybar = document.getElementById("stickyBuybar");
const productSizes = document.querySelectorAll(".product-size");
const addToCartButton = document.getElementById("addToCartButton");
const stickyAddToCartButton = document.getElementById("stickyAddToCartButton");

let selectedSize = "";

function addProductToMainCart(button) {
  if (!button) return false;

  const sizeRequired = productSizes.length > 0;

  if (sizeRequired && !selectedSize) {
    alert("Selecione um tamanho antes de adicionar à sacola.");
    return false;
  }

  const product = {
    sku: button.dataset.productCode,
    title: button.dataset.productName,
    price: Number(button.dataset.productPrice || 0),
    image: button.dataset.productImage || "",
    size: selectedSize || "",
  };

  if (typeof window.addProductToCartGlobal === "function") {
    return window.addProductToCartGlobal(product);
  }

  console.error("Carrinho global não encontrado");
  return false;
}

function showAddToCartFeedback(button) {
  if (!button) return;

  const originalText = button.innerHTML;
  button.innerHTML = "✔ Adicionado!";
  button.style.background = "#16a34a";

  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.background = "";
  }, 1500);
}

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const image = thumb.querySelector("img");
    if (!image || !mainProductImage) return;

    mainProductImage.src = image.src;
    mainProductImage.alt = image.alt || mainProductImage.alt;

    thumbs.forEach((item) => item.classList.remove("is-active"));
    thumb.classList.add("is-active");
  });
});

productSizes.forEach((button) => {
  button.addEventListener("click", () => {
    productSizes.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    selectedSize = button.textContent.trim();
  });
});

if (addToCartButton) {
  addToCartButton.addEventListener("click", () => {
    const added = addProductToMainCart(addToCartButton);
    if (added) showAddToCartFeedback(addToCartButton);
  });
}

if (stickyAddToCartButton) {
  stickyAddToCartButton.addEventListener("click", () => {
    const added = addProductToMainCart(stickyAddToCartButton);
    if (added) showAddToCartFeedback(stickyAddToCartButton);
  });
}

function toggleStickyBuybar() {
  if (!stickyBuybar) return;
  stickyBuybar.classList.toggle("is-visible", window.scrollY > 500);
}

window.addEventListener("scroll", toggleStickyBuybar);
