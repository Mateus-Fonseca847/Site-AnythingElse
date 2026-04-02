document.addEventListener("DOMContentLoaded", async () => {
  const tabs = Array.from(document.querySelectorAll("[data-auth-mode]"));
  const title = document.querySelector("[data-auth-title]");
  const form = document.getElementById("identificationAuthForm");
  const nameField = document.querySelector("[data-auth-name-field]");
  const confirmField = document.querySelector("[data-auth-confirm-field]");
  const message = document.querySelector("[data-auth-message]");
  const submitButton = document.querySelector("[data-auth-submit]");
  const nameInput = document.getElementById("identificationName");
  const emailInput = document.getElementById("identificationEmail");
  const passwordInput = document.getElementById("identificationPassword");
  const confirmPasswordInput = document.getElementById(
    "identificationConfirmPassword",
  );

  const nextUrl =
    new URLSearchParams(window.location.search).get("next") || "/pagamento";
  const guestCartKey = "anythingelse_cart_guest";
  const guestCheckoutStateKey = "anythingelse_checkout_state_guest";

  let mode = "login";

  function setMessage(text, isSuccess = false) {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle("is-success", isSuccess);
  }

  function migrateGuestPurchaseState(user) {
    const email = user?.email;

    if (!email) return;

    const userCartKey = `anythingelse_cart_user_${email}`;
    const userCheckoutStateKey = `anythingelse_checkout_state_${email}`;

    try {
      const guestCart = localStorage.getItem(guestCartKey);
      const userCart = localStorage.getItem(userCartKey);

      if (guestCart && !userCart) {
        localStorage.setItem(userCartKey, guestCart);
      }

      const guestCheckoutState = localStorage.getItem(guestCheckoutStateKey);
      const userCheckoutState = localStorage.getItem(userCheckoutStateKey);

      if (guestCheckoutState && !userCheckoutState) {
        localStorage.setItem(userCheckoutStateKey, guestCheckoutState);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function updateMode(nextMode) {
    mode = nextMode;

    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.authMode === nextMode);
    });

    const isRegister = nextMode === "register";
    if (nameField) nameField.hidden = !isRegister;
    if (confirmField) confirmField.hidden = !isRegister;

    if (title) {
      title.textContent = isRegister
        ? "Crie sua conta para seguir para o pagamento."
        : "Entre com email e senha para seguir ao pagamento.";
    }

    if (submitButton) {
      submitButton.textContent = isRegister
        ? "Criar conta e continuar"
        : "Continuar para pagamento";
    }

    setMessage("");
  }

  async function redirectIfAuthenticated() {
    try {
      const response = await fetch("/auth/me");
      const data = await response.json();

      if (response.ok && data.user) {
        window.location.href = nextUrl;
      }
    } catch (error) {
      console.error(error);
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => updateMode(tab.dataset.authMode));
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const name = nameInput?.value.trim() || "";
    const confirmPassword = confirmPasswordInput?.value || "";

    if (!email || !password) {
      setMessage("Preencha email e senha para continuar.");
      return;
    }

    if (mode === "register" && !name) {
      setMessage("Informe seu nome para criar a conta.");
      return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent =
      mode === "register" ? "Criando conta..." : "Entrando...";

    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const payload =
        mode === "register"
          ? {
              name,
              email,
              password,
              confirm_password: confirmPassword,
            }
          : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Nao foi possivel continuar.");
        return;
      }

      migrateGuestPurchaseState(data.user);

      setMessage(
        data.message || "Autenticacao realizada com sucesso.",
        true,
      );

      setTimeout(() => {
        window.location.href = nextUrl;
      }, 500);
    } catch (error) {
      console.error(error);
      setMessage("Ocorreu um erro ao conectar com o servidor.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  updateMode("login");
  await redirectIfAuthenticated();
});
