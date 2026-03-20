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
