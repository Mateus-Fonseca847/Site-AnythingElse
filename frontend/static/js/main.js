document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".promo-carousel");

  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll(".promo-slide"));
  const tabs = Array.from(carousel.querySelectorAll(".promo-tab"));
  const prevButton = carousel.querySelector(".promo-control--prev");
  const nextButton = carousel.querySelector(".promo-control--next");

  let currentIndex = 0;
  let autoPlay;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === currentIndex);
    });

    tabs.forEach((tab, i) => {
      const isActive = i === currentIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlay = setInterval(nextSlide, 6000);
  }

  function stopAutoPlay() {
    if (autoPlay) clearInterval(autoPlay);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const index = Number(tab.dataset.index);
      showSlide(index);
      startAutoPlay();
    });
  });

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      prevSlide();
      startAutoPlay();
    });
  }

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);

  showSlide(0);
  startAutoPlay();
});

document.addEventListener("DOMContentLoaded", () => {
  const recommendedCarousel = document.querySelector(".recommended-carousel");

  if (!recommendedCarousel) return;

  const track = recommendedCarousel.querySelector(
    ".recommended-carousel__track",
  );
  const cards = Array.from(
    recommendedCarousel.querySelectorAll(".recommended-card"),
  );
  const prevButton = recommendedCarousel.querySelector(
    ".recommended-carousel__arrow--prev",
  );
  const nextButton = recommendedCarousel.querySelector(
    ".recommended-carousel__arrow--next",
  );

  let currentIndex = 0;

  function getVisibleCards() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 5;
  }

  function updateCarousel() {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, cards.length - visibleCards);
    currentIndex = Math.min(currentIndex, maxIndex);

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const translateX = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${translateX}px)`;

    if (prevButton) prevButton.disabled = currentIndex === 0;
    if (nextButton) nextButton.disabled = currentIndex >= maxIndex;
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, cards.length - visibleCards);

      if (currentIndex < maxIndex) {
        currentIndex += 1;
        updateCarousel();
      }
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        updateCarousel();
      }
    });
  }

  window.addEventListener("resize", updateCarousel);

  updateCarousel();
});

document.addEventListener("DOMContentLoaded", () => {
  const newsSection = document.querySelector(".news-section");

  if (!newsSection) return;

  const track = newsSection.querySelector(".news-carousel__track");
  const cards = Array.from(newsSection.querySelectorAll(".product-card"));
  const prevButton = newsSection.querySelector(".news-section__arrow--prev");
  const nextButton = newsSection.querySelector(".news-section__arrow--next");

  let currentIndex = 0;

  function getVisibleCards() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 4;
  }

  function updateNewsCarousel() {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, cards.length - visibleCards);
    currentIndex = Math.min(currentIndex, maxIndex);

    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const translateX = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${translateX}px)`;

    if (prevButton) prevButton.disabled = currentIndex === 0;
    if (nextButton) nextButton.disabled = currentIndex >= maxIndex;
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, cards.length - visibleCards);

      if (currentIndex < maxIndex) {
        currentIndex += 1;
        updateNewsCarousel();
      }
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        updateNewsCarousel();
      }
    });
  }

  window.addEventListener("resize", updateNewsCarousel);

  updateNewsCarousel();
});

document.addEventListener("DOMContentLoaded", () => {
  const chips = document.querySelectorAll(".newsletter-chip");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const loginTrigger = document.querySelector(".header-login-trigger");
  const authModal = document.querySelector(".auth-modal");
  const authOverlay = document.querySelector(".auth-modal__overlay");
  const authClose = document.querySelector(".auth-modal__close");
  const authBack = document.querySelector(".auth-modal__back");

  const cartTrigger = document.querySelector(".header-cart-trigger");
  const cartDrawer = document.querySelector(".cart-drawer");
  const cartOverlay = document.querySelector(".cart-drawer__overlay");
  const cartClose = document.querySelector(".cart-drawer__close");
  const cartItemsContainer = document.querySelector(".cart-drawer__items");
  const cartEmptyState = document.querySelector(".cart-drawer__empty");
  const cartCount = document.querySelector(".cart-count");
  const cartTotal = document.querySelector(".header-cart-total");

  const addToCartButtons = Array.from(
    document.querySelectorAll(".product-card__button"),
  );

  const authForm = document.getElementById("authForm");
  const authTabs = Array.from(document.querySelectorAll(".auth-modal__tab"));
  const authTitle = document.getElementById("auth-modal-title");
  const authNameField = document.querySelector(".auth-modal__field--name");
  const authConfirmField = document.querySelector(
    ".auth-modal__field--confirm",
  );
  const authForgot = document.querySelector(".auth-modal__forgot-link");
  const authSwitchMode = document.querySelector(".auth-modal__switch-mode");
  const authMessage = document.getElementById("authMessage");
  const authSubmitButton = document.getElementById("authSubmitButton");

  const authName = document.getElementById("authName");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authConfirmPassword = document.getElementById("authConfirmPassword");

  const loginTextStrong = loginTrigger?.querySelector(".tool-text strong");
  const loginTextSpan = loginTrigger?.querySelector(".tool-text span");

  const accountMenu = document.querySelector(".account-menu");
  const accountMenuOverlay = document.querySelector(".account-menu__overlay");
  const accountMenuClose = document.querySelector(".account-menu__close");
  const accountMenuUser = document.getElementById("accountMenuUser");
  const switchUserButton = document.getElementById("switchUserButton");
  const logoutButton = document.getElementById("logoutButton");

  let cart = [];
  let authMode = "login";
  let currentUser = null;

  function lockScroll(shouldLock) {
    document.body.style.overflow = shouldLock ? "hidden" : "";
  }

  function positionPopupBelowButton(dialogElement, triggerElement) {
    if (!dialogElement || !triggerElement) return;

    const rect = triggerElement.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const scrollLeft = window.scrollX || window.pageXOffset;
    const dialogWidth = dialogElement.offsetWidth || 320;

    dialogElement.style.top = `${rect.bottom + scrollTop + 8}px`;
    dialogElement.style.left = `${rect.right + scrollLeft - dialogWidth}px`;
  }

  function openAuthModal() {
    if (!authModal || !loginTrigger) return;

    const dialog = authModal.querySelector(".auth-modal__dialog");
    positionPopupBelowButton(dialog, loginTrigger);

    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
    lockScroll(true);
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");

    if (
      !cartDrawer?.classList.contains("is-open") &&
      !accountMenu?.classList.contains("is-open")
    ) {
      lockScroll(false);
    }
  }

  function openCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    lockScroll(true);
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");

    if (
      !authModal?.classList.contains("is-open") &&
      !accountMenu?.classList.contains("is-open")
    ) {
      lockScroll(false);
    }
  }

  function openAccountMenu() {
    if (!accountMenu || !loginTrigger) return;

    const dialog = accountMenu.querySelector(".account-menu__dialog");
    positionPopupBelowButton(dialog, loginTrigger);

    if (accountMenuUser && currentUser) {
      accountMenuUser.textContent = `${currentUser.name} • ${currentUser.email}`;
    }

    accountMenu.classList.add("is-open");
    accountMenu.setAttribute("aria-hidden", "false");
    lockScroll(true);
  }

  function closeAccountMenu() {
    if (!accountMenu) return;
    accountMenu.classList.remove("is-open");
    accountMenu.setAttribute("aria-hidden", "true");

    if (
      !authModal?.classList.contains("is-open") &&
      !cartDrawer?.classList.contains("is-open")
    ) {
      lockScroll(false);
    }
  }

  function setLoggedUser(user) {
    currentUser = user;

    if (loginTextSpan) loginTextSpan.textContent = "Olá,";
    if (loginTextStrong)
      loginTextStrong.textContent = user?.name || "Cadastre-se";
  }

  function clearLoggedUser() {
    currentUser = null;

    if (loginTextSpan) loginTextSpan.textContent = "Entre ou";
    if (loginTextStrong) loginTextStrong.textContent = "Cadastre-se";
  }

  function setAuthMessage(message = "", isSuccess = false) {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.classList.toggle("is-success", isSuccess);
  }

  function updateAuthMode(mode) {
    authMode = mode;

    authTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.authMode === mode);
    });

    const isRegister = mode === "register";

    if (authTitle) {
      authTitle.textContent = isRegister
        ? "Crie sua conta"
        : "Entre com email e senha";
    }

    if (authNameField) authNameField.hidden = !isRegister;
    if (authConfirmField) authConfirmField.hidden = !isRegister;
    if (authForgot) {
      authForgot.style.display = isRegister ? "none" : "inline-flex";
    }
    if (authSubmitButton) {
      authSubmitButton.textContent = isRegister ? "Cadastrar" : "Entrar";
    }
    if (authSwitchMode) {
      authSwitchMode.textContent = isRegister ? "Entrar" : "Cadastre-se";
    }

    setAuthMessage("");
  }

  async function requestAuth(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { response, data };
  }

  async function updateHeaderUser() {
    try {
      const response = await fetch("/auth/me");
      const data = await response.json();

      if (!response.ok || !data.user) {
        clearLoggedUser();
        return;
      }

      setLoggedUser(data.user);
    } catch (error) {
      clearLoggedUser();
      console.error(error);
    }
  }

  function parsePrice(priceText) {
    return Number(
      priceText.replace("R$", "").replace(/\./g, "").replace(",", ".").trim(),
    );
  }

  function formatPrice(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  function getCartStorageKey() {
    if (currentUser?.email) {
      return `anythingelse_cart_user_${currentUser.email}`;
    }
    return "anythingelse_cart_guest";
  }

  function saveCart() {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  }

  function loadCart() {
    try {
      const savedCart = localStorage.getItem(getCartStorageKey());
      cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      cart = [];
    }
  }
  function updateCartUI() {
    if (!cartItemsContainer || !cartEmptyState || !cartCount || !cartTotal) {
      return;
    }

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartEmptyState.hidden = false;
      cartItemsContainer.hidden = true;
      cartCount.textContent = "0";
      cartTotal.textContent = "R$0,00";
      return;
    }

    cartEmptyState.hidden = true;
    cartItemsContainer.hidden = false;

    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;

      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";
      itemElement.innerHTML = `
        <img class="cart-item__image" src="${item.image}" alt="${item.title}">
        <div>
          <p class="cart-item__title">${item.title}</p>
          <p class="cart-item__price">${formatPrice(item.price)}</p>
        </div>
        <button type="button" class="cart-item__remove" data-index="${index}" aria-label="Remover item">×</button>
      `;

      cartItemsContainer.appendChild(itemElement);
    });

    cartCount.textContent = String(cart.length);
    cartTotal.textContent = formatPrice(total);

    cartItemsContainer
      .querySelectorAll(".cart-item__remove")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.index);
          cart.splice(index, 1);
          updateCartUI();
        });
      });
  }

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();

      const productCard = button.closest(".product-card");
      if (!productCard) return;

      const title =
        productCard.querySelector(".product-card__title")?.textContent.trim() ||
        "Produto";
      const priceText =
        productCard.querySelector(".product-card__price")?.textContent ||
        "R$0,00";
      const image =
        productCard
          .querySelector(".product-card__image--main")
          ?.getAttribute("src") || "";

      const sku = productCard.getAttribute("data-sku") || "";

      try {
        const stockResponse = await fetch(`/api/stock/${sku}`);
        const stockData = await stockResponse.json();

        if (!stockResponse.ok || !stockData.ok) {
          alert("Erro ao consultar estoque");
          return;
        }

        if (stockData.qtd_estoque <= 0) {
          alert("Produto esgotado");
          return;
        }

        await fetch("/api/stock/exit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            codigo: sku,
            quantidade: 1,
          }),
        });

        cart.push({
          sku,
          title,
          price: parsePrice(priceText),
          image,
        });

        saveCart();
        updateCartUI();
        openCartDrawer();
      } catch (error) {
        console.error(error);
        alert("Erro ao processar compra");
      }
    });
  });
  loginTrigger?.addEventListener("click", (event) => {
    event.preventDefault();

    if (currentUser) {
      openAccountMenu();
    } else {
      openAuthModal();
    }
  });

  authOverlay?.addEventListener("click", closeAuthModal);
  authClose?.addEventListener("click", closeAuthModal);
  authBack?.addEventListener("click", closeAuthModal);

  cartTrigger?.addEventListener("click", (event) => {
    event.preventDefault();
    openCartDrawer();
  });

  cartOverlay?.addEventListener("click", closeCartDrawer);
  cartClose?.addEventListener("click", closeCartDrawer);

  accountMenuOverlay?.addEventListener("click", closeAccountMenu);
  accountMenuClose?.addEventListener("click", closeAccountMenu);

  switchUserButton?.addEventListener("click", () => {
    closeAccountMenu();
    openAuthModal();
  });

  logoutButton?.addEventListener("click", async () => {
    try {
      const loggedUser = currentUser?.email || null;

      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        return;
      }

      if (loggedUser) {
        localStorage.removeItem(`anythingelse_cart_user_${loggedUser}`);
      }

      localStorage.removeItem("anythingelse_cart_guest");

      cart = [];
      updateCartUI();

      clearLoggedUser();
      closeAccountMenu();
    } catch (error) {
      console.error(error);
    }
  });

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      updateAuthMode(tab.dataset.authMode);
    });
  });

  authSwitchMode?.addEventListener("click", (event) => {
    event.preventDefault();
    updateAuthMode(authMode === "login" ? "register" : "login");
  });

  authForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthMessage("");

    const email = authEmail?.value.trim() || "";
    const password = authPassword?.value || "";

    authSubmitButton.disabled = true;
    const originalText = authSubmitButton.textContent;
    authSubmitButton.textContent =
      authMode === "register" ? "Cadastrando..." : "Entrando...";

    try {
      if (authMode === "register") {
        const name = authName?.value.trim() || "";
        const confirmPassword = authConfirmPassword?.value || "";

        const { response, data } = await requestAuth("/auth/register", {
          name,
          email,
          password,
          confirm_password: confirmPassword,
        });

        if (!response.ok) {
          setAuthMessage(data.message || "Não foi possível criar sua conta.");
          return;
        }

        setAuthMessage(data.message || "Conta criada com sucesso.", true);
        setLoggedUser(data.user);

        setTimeout(() => {
          closeAuthModal();
        }, 700);
      } else {
        const { response, data } = await requestAuth("/auth/login", {
          email,
          password,
        });

        if (!response.ok) {
          setAuthMessage(data.message || "Não foi possível entrar.");
          return;
        }

        setAuthMessage(data.message || "Login realizado com sucesso.", true);
        setLoggedUser(data.user);

        setTimeout(() => {
          closeAuthModal();
        }, 700);
      }
    } catch (error) {
      setAuthMessage("Ocorreu um erro ao conectar com o servidor.");
      console.error(error);
    } finally {
      authSubmitButton.disabled = false;
      authSubmitButton.textContent = originalText;
    }
  });

  const authEye = document.querySelector(".auth-modal__eye");
  authEye?.addEventListener("click", () => {
    if (!authPassword) return;
    authPassword.type = authPassword.type === "password" ? "text" : "password";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAuthModal();
      closeCartDrawer();
      closeAccountMenu();
    }
  });

  loadCart();
  updateCartUI();
  updateAuthMode("login");
  updateHeaderUser();
});
