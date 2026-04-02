document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
  });

  function debounce(callback, wait = 180) {
    let timeoutId;

    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => callback(...args), wait);
    };
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[char] || char;
    });
  }

  const carousel = document.querySelector(".promo-carousel");

  if (carousel) {
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

    nextButton?.addEventListener("click", () => {
      nextSlide();
      startAutoPlay();
    });

    prevButton?.addEventListener("click", () => {
      prevSlide();
      startAutoPlay();
    });

    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);

    showSlide(0);
    startAutoPlay();
  }

  const recommendedCarousel = document.querySelector(".recommended-carousel");

  if (recommendedCarousel) {
    const track = recommendedCarousel.querySelector(
      ".recommended-carousel__track",
    );
    const prevButton = recommendedCarousel.querySelector(
      ".recommended-carousel__arrow--prev",
    );
    const nextButton = recommendedCarousel.querySelector(
      ".recommended-carousel__arrow--next",
    );

    let isAnimating = false;

    function getStepSize() {
      const firstCard = track?.querySelector(".recommended-card");

      if (!track || !firstCard) return 0;

      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return firstCard.getBoundingClientRect().width + gap;
    }

    function resetTrackPosition() {
      if (!track) return;

      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      void track.offsetWidth;
      track.style.transition = "transform 0.45s ease";
    }

    function moveNext() {
      if (!track || isAnimating || track.children.length <= 1) return;

      const stepSize = getStepSize();
      if (!stepSize) return;

      isAnimating = true;
      track.style.transform = `translateX(-${stepSize}px)`;

      const handleTransitionEnd = () => {
        const firstCard = track.firstElementChild;

        if (firstCard) {
          track.appendChild(firstCard);
        }

        resetTrackPosition();
        isAnimating = false;
        track.removeEventListener("transitionend", handleTransitionEnd);
      };

      track.addEventListener("transitionend", handleTransitionEnd);
    }

    function movePrev() {
      if (!track || isAnimating || track.children.length <= 1) return;

      const stepSize = getStepSize();
      const lastCard = track.lastElementChild;

      if (!stepSize || !lastCard) return;

      isAnimating = true;
      track.style.transition = "none";
      track.prepend(lastCard);
      track.style.transform = `translateX(-${stepSize}px)`;
      void track.offsetWidth;
      track.style.transition = "transform 0.45s ease";
      track.style.transform = "translateX(0)";

      const handleTransitionEnd = () => {
        isAnimating = false;
        track.removeEventListener("transitionend", handleTransitionEnd);
      };

      track.addEventListener("transitionend", handleTransitionEnd);
    }

    nextButton?.addEventListener("click", moveNext);
    prevButton?.addEventListener("click", movePrev);

    window.addEventListener("resize", resetTrackPosition);
    resetTrackPosition();
  }

  const newsSection = document.querySelector(".news-section");

  if (newsSection) {
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
      if (!track || !cards.length) return;

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

    nextButton?.addEventListener("click", () => {
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, cards.length - visibleCards);

      if (currentIndex < maxIndex) {
        currentIndex += 1;
        updateNewsCarousel();
      }
    });

    prevButton?.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        updateNewsCarousel();
      }
    });

    window.addEventListener("resize", updateNewsCarousel);
    updateNewsCarousel();
  }

  const chips = document.querySelectorAll(".newsletter-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
    });
  });

  function setupSearchForms() {
    const searchForms = Array.from(document.querySelectorAll(".search-bar"));
    const currentSearchValue =
      new URLSearchParams(window.location.search).get("q") || "";

    searchForms.forEach((form) => {
      const wrapper = form.closest(".search-wrapper");
      const input = form.querySelector("input[type='text'], input[type='search']");

      if (!wrapper || !input) return;

      form.setAttribute("action", "/busca");
      form.setAttribute("method", "get");
      input.setAttribute("name", "q");
      input.setAttribute("autocomplete", "off");

      if (!input.value && currentSearchValue) {
        input.value = currentSearchValue;
      }

      const suggestions = document.createElement("div");
      suggestions.className = "search-suggestions";
      suggestions.innerHTML = `
        <div class="search-suggestions__list"></div>
        <div class="search-suggestions__footer" hidden>
          <a href="#">Ver todos os resultados</a>
        </div>
      `;
      wrapper.appendChild(suggestions);

      const list = suggestions.querySelector(".search-suggestions__list");
      const footer = suggestions.querySelector(".search-suggestions__footer");
      const footerLink = footer?.querySelector("a");
      let activeIndex = -1;
      function closeSuggestions() {
        suggestions.classList.remove("is-open");
        activeIndex = -1;
      }

      function openSuggestions() {
        if (!list.childElementCount) return;
        suggestions.classList.add("is-open");
      }

      function updateActiveItem(nextIndex) {
        const links = Array.from(
          list.querySelectorAll(".search-suggestions__item"),
        );

        links.forEach((link, index) => {
          link.classList.toggle("is-active", index === nextIndex);
        });

        activeIndex = nextIndex;
      }

      function renderSuggestions(products, query) {
        list.innerHTML = "";
        activeIndex = -1;

        if (!query) {
          closeSuggestions();
          return;
        }

        if (!products.length) {
          list.innerHTML = `
            <div class="search-suggestions__empty">
              Nenhum produto encontrado para "${escapeHtml(query)}".
            </div>
          `;
          if (footer) footer.hidden = true;
          suggestions.classList.add("is-open");
          return;
        }

        products.forEach((product) => {
          const item = document.createElement("a");
          item.className = "search-suggestions__item";
          item.href = `/produto/${encodeURIComponent(product.codigo)}`;

          const imageSrc = product.imagem
            ? `/static/${product.imagem}`
            : "https://via.placeholder.com/120x120?text=Produto";

          item.innerHTML = `
            <div class="search-suggestions__thumb">
              <img src="${imageSrc}" alt="${escapeHtml(product.nome)}" />
            </div>
            <div class="search-suggestions__meta">
              <strong>${escapeHtml(product.nome)}</strong>
              <span>${escapeHtml(product.tipo_produto || "Produto")} • ${Number(product.preco || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          `;

          list.appendChild(item);
        });

        if (footer && footerLink) {
          footer.hidden = false;
          footerLink.href = `/busca?q=${encodeURIComponent(query)}`;
        }

        openSuggestions();
      }

      const fetchSuggestions = debounce(async () => {
        const query = input.value.trim();

        if (query.length < 2) {
          closeSuggestions();
          return;
        }

        try {
          const response = await fetch(
            `/api/products/search?q=${encodeURIComponent(query)}&limit=6`,
          );
          const data = await response.json();

          if (!response.ok || !data.ok) {
            closeSuggestions();
            return;
          }

          renderSuggestions(Array.isArray(data.products) ? data.products : [], query);
        } catch (error) {
          console.error(error);
          closeSuggestions();
        }
      }, 200);

      input.addEventListener("input", fetchSuggestions);
      input.addEventListener("focus", () => {
        if (list.childElementCount) {
          suggestions.classList.add("is-open");
        }
      });

      input.addEventListener("keydown", (event) => {
        const links = Array.from(
          list.querySelectorAll(".search-suggestions__item"),
        );

        if (!suggestions.classList.contains("is-open") || !links.length) {
          if (event.key === "Enter" && !input.value.trim()) {
            event.preventDefault();
          }
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          const nextIndex = activeIndex >= links.length - 1 ? 0 : activeIndex + 1;
          updateActiveItem(nextIndex);
          links[nextIndex]?.scrollIntoView({ block: "nearest" });
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          const nextIndex = activeIndex <= 0 ? links.length - 1 : activeIndex - 1;
          updateActiveItem(nextIndex);
          links[nextIndex]?.scrollIntoView({ block: "nearest" });
        }

        if (event.key === "Enter" && activeIndex >= 0) {
          event.preventDefault();
          window.location.href = links[activeIndex].href;
        }

        if (event.key === "Escape") {
          closeSuggestions();
        }
      });

      form.addEventListener("submit", (event) => {
        const query = input.value.trim();

        if (!query) {
          event.preventDefault();
          closeSuggestions();
          return;
        }

        closeSuggestions();
      });

      document.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) {
          closeSuggestions();
        }
      });
    });
  }

  setupSearchForms();

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
  const cartFooter = document.querySelector(".cart-drawer__footer");
  const cartCheckoutButton = document.querySelector(".cart-drawer__checkout");
  const cartCount = document.querySelector(".cart-count");
  const cartTotal = document.querySelector(".header-cart-total");
  const cartDrawerTotal = document.querySelector(".cart-drawer-total");
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

    loadCart();
    updateCartUI();
  }

  function clearLoggedUser() {
    currentUser = null;

    if (loginTextSpan) loginTextSpan.textContent = "Entre ou";
    if (loginTextStrong) loginTextStrong.textContent = "Cadastre-se";

    loadCart();
    updateCartUI();
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
    if (authForgot)
      authForgot.style.display = isRegister ? "none" : "inline-flex";
    if (authSubmitButton)
      authSubmitButton.textContent = isRegister ? "Cadastrar" : "Entrar";
    if (authSwitchMode)
      authSwitchMode.textContent = isRegister ? "Entrar" : "Cadastre-se";

    setAuthMessage("");
  }

  async function requestAuth(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  function formatPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
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
    if (!cartItemsContainer || !cartEmptyState) return;

    const totalItems = cart.reduce(
      (sum, item) => sum + Number(item.quantity || 1),
      0,
    );

    if (cartCount) {
      cartCount.textContent = String(totalItems);
    }

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      cartEmptyState.style.display = "block";
      cartEmptyState.hidden = false;

      cartItemsContainer.style.display = "none";
      cartItemsContainer.hidden = true;

      if (cartFooter) {
        cartFooter.hidden = true;
      }

      if (cartTotal) {
        cartTotal.textContent = "R$0,00";
      }

      if (cartDrawerTotal) {
        cartDrawerTotal.textContent = "R$0,00";
      }

      return;
    }

    cartEmptyState.style.display = "none";
    cartEmptyState.hidden = true;

    cartItemsContainer.style.display = "flex";
    cartItemsContainer.hidden = false;

    if (cartFooter) {
      cartFooter.hidden = false;
    }

    let total = 0;

    cart.forEach((item, index) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const subtotal = quantity * price;

      total += subtotal;

      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";

      itemElement.innerHTML = `
      <div class="cart-item__image">
        <img src="${item.image || ""}" alt="${item.title || "Produto"}">
      </div>

      <div class="cart-item__content">
        <h3 class="cart-item__title">${item.title || "Produto"}</h3>
        ${item.size ? `<p class="cart-item__meta">Tamanho: ${item.size}</p>` : ""}
        <p class="cart-item__meta">Qtd.: ${quantity}</p>
        <strong class="cart-item__price">${formatPrice(subtotal)}</strong>
      </div>

      <button
        class="cart-item__remove"
        type="button"
        data-index="${index}"
        aria-label="Remover item"
      >
        ×
      </button>
    `;

      cartItemsContainer.appendChild(itemElement);
    });

    if (cartTotal) {
      cartTotal.textContent = formatPrice(total);
    }

    if (cartDrawerTotal) {
      cartDrawerTotal.textContent = formatPrice(total);
    }

    cartItemsContainer
      .querySelectorAll(".cart-item__remove")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.index);
          cart.splice(index, 1);
          saveCart();
          updateCartUI();
        });
      });
  }
  window.addProductToCartGlobal = function (product) {
    if (!product) return false;

    const existingItem = cart.find((item) => {
      return (
        item.sku === product.sku && (item.size || "") === (product.size || "")
      );
    });

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 1) + 1;
    } else {
      cart.push({
        sku: product.sku,
        title: product.title,
        price: Number(product.price || 0),
        image: product.image || "",
        size: product.size || "",
        quantity: 1,
      });
    }

    saveCart();
    updateCartUI();
    openCartDrawer();
    return true;
  };

  loginTrigger?.addEventListener("click", (event) => {
    event.preventDefault();
    if (currentUser) openAccountMenu();
    else openAuthModal();
  });

  authOverlay?.addEventListener("click", closeAuthModal);
  authClose?.addEventListener("click", closeAuthModal);
  authBack?.addEventListener("click", closeAuthModal);

  cartTrigger?.addEventListener("click", (event) => {
    event.preventDefault();
    openCartDrawer();
  });

  cartCheckoutButton?.addEventListener("click", () => {
    closeCartDrawer();
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
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok || !data.ok) return;

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
