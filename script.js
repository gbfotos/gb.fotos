const slides = Array.from({ length: 27 }, (_, index) => `./assets/fotos/${index}.jpeg`);

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const photoStage = document.querySelector(".photo-stage");
const prevArrow = document.querySelector(".gallery-arrow--prev");
const nextArrow = document.querySelector(".gallery-arrow--next");
const coverflowTrack = document.querySelector(".coverflow-track");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox__image");
const lightboxClose = document.querySelector(".lightbox__close");
const lightboxBackdrop = document.querySelector(".lightbox__backdrop");
const lightboxPrev = document.querySelector(".lightbox__nav--prev");
const lightboxNext = document.querySelector(".lightbox__nav--next");
const siteAudio = document.querySelector(".site-audio");

const THEME_KEY = "gabriel-silva-theme";
const AUTOPLAY_DELAY = 5000;

let currentIndex = 0;
let autoplayId = null;
let cards = [];
let audioStarted = false;

function stopAutoplay() {
  window.clearInterval(autoplayId);
  autoplayId = null;
}

function startSiteAudio() {
  if (!siteAudio || audioStarted) {
    return;
  }

  const playPromise = siteAudio.play();

  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => {
        audioStarted = true;
      })
      .catch(() => {
        audioStarted = false;
      });
    return;
  }

  audioStarted = true;
}

function bindAudioAutoplay() {
  startSiteAudio();

  const unlockAudio = () => {
    startSiteAudio();

    if (!audioStarted) {
      return;
    }

    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
  };

  document.addEventListener("click", unlockAudio);
  document.addEventListener("touchstart", unlockAudio);
  document.addEventListener("keydown", unlockAudio);
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function getRelativePosition(index) {
  const total = slides.length;
  let relative = index - currentIndex;

  if (relative > total / 2) {
    relative -= total;
  }

  if (relative < -total / 2) {
    relative += total;
  }

  return relative;
}

function getCardStyle(relative) {
  const abs = Math.abs(relative);

  if (abs > 2) {
    return {
      opacity: "0",
      filter: "blur(10px) brightness(0.45)",
      transform: `translateX(${relative * 14}%) translateZ(-320px) rotateY(${relative < 0 ? 74 : -74}deg) scale(0.74)`,
      zIndex: "0",
    };
  }

  if (relative === 0) {
    return {
      opacity: "1",
      filter: "blur(0) brightness(1)",
      transform: "translateX(0) translateZ(52px) rotateY(0deg) scale(1.46)",
      zIndex: "40",
    };
  }

  if (abs === 1) {
    return {
      opacity: "0.72",
      filter: "blur(1px) brightness(0.72)",
      transform: `translateX(${relative * 34}%) translateZ(-138px) rotateY(${relative < 0 ? 58 : -58}deg) scale(0.98)`,
      zIndex: "20",
    };
  }

  return {
    opacity: "0.22",
    filter: "blur(2px) brightness(0.54)",
    transform: `translateX(${relative * 48}%) translateZ(-260px) rotateY(${relative < 0 ? 68 : -68}deg) scale(0.82)`,
    zIndex: "10",
  };
}

function renderCoverflow() {
  cards.forEach((card, index) => {
    const relative = getRelativePosition(index);
    const style = getCardStyle(relative);

    card.classList.toggle("is-current", relative === 0);
    card.style.opacity = style.opacity;
    card.style.filter = style.filter;
    card.style.transform = style.transform;
    card.style.zIndex = style.zIndex;
  });
}

function buildCoverflow() {
  const fragment = document.createDocumentFragment();

  cards = slides.map((src, index) => {
    const card = document.createElement("div");
    const img = document.createElement("img");

    card.className = "coverflow-card";
    img.src = src;
    img.alt = `Fotografia ${index + 1} de Gabriel Silva`;
    img.loading = index < 5 ? "eager" : "lazy";

    card.appendChild(img);
    fragment.appendChild(card);
    return card;
  });

  coverflowTrack.appendChild(fragment);
  renderCoverflow();
}

function goTo(step) {
  currentIndex = (currentIndex + step + slides.length) % slides.length;
  photoStage.classList.remove("is-flashing");
  void photoStage.offsetWidth;
  photoStage.classList.add("is-flashing");
  renderCoverflow();
}

function nextSlide() {
  goTo(1);
}

function previousSlide() {
  goTo(-1);
}

function restartAutoplay() {
  stopAutoplay();
  autoplayId = window.setInterval(nextSlide, AUTOPLAY_DELAY);
}

function openLightbox() {
  syncLightboxImage();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-lightbox-open");
  stopAutoplay();
}

function syncLightboxImage() {
  const src = slides[currentIndex];

  lightboxImage.src = src;
  lightboxImage.alt = `Fotografia ampliada ${currentIndex + 1} de Gabriel Silva`;
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-lightbox-open");
  lightboxImage.removeAttribute("src");
  lightboxImage.alt = "";
  restartAutoplay();
}

function bindThemeToggle() {
  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

function bindStageInteraction() {
  photoStage.addEventListener("click", () => {
    openLightbox();
  });

  photoStage.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openLightbox();
  });

  prevArrow.addEventListener("click", (event) => {
    event.stopPropagation();
    previousSlide();
    restartAutoplay();
  });

  nextArrow.addEventListener("click", (event) => {
    event.stopPropagation();
    nextSlide();
    restartAutoplay();
  });

  photoStage.addEventListener("pointermove", (event) => {
    const bounds = photoStage.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    photoStage.style.setProperty("--tilt-x", `${offsetY * -4}deg`);
    photoStage.style.setProperty("--tilt-y", `${offsetX * 6}deg`);
    photoStage.style.setProperty("--float-x", `${offsetX * 8}px`);
    photoStage.style.setProperty("--float-y", `${offsetY * -8}px`);
  });

  photoStage.addEventListener("mouseenter", () => {
    stopAutoplay();
  });

  photoStage.addEventListener("mouseleave", () => {
    photoStage.style.setProperty("--tilt-x", "0deg");
    photoStage.style.setProperty("--tilt-y", "0deg");
    photoStage.style.setProperty("--float-x", "0px");
    photoStage.style.setProperty("--float-y", "0px");
    restartAutoplay();
  });

  photoStage.addEventListener("touchstart", () => {
    stopAutoplay();
  });

  photoStage.addEventListener("touchend", () => {
    restartAutoplay();
  });
}

function bindLightbox() {
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxBackdrop.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", (event) => {
    event.stopPropagation();
    previousSlide();
    syncLightboxImage();
  });
  lightboxNext.addEventListener("click", (event) => {
    event.stopPropagation();
    nextSlide();
    syncLightboxImage();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      previousSlide();
      syncLightboxImage();
      return;
    }

    if (event.key === "ArrowRight") {
      nextSlide();
      syncLightboxImage();
    }
  });
}

loadTheme();
buildCoverflow();
bindThemeToggle();
bindStageInteraction();
bindLightbox();
bindAudioAutoplay();
restartAutoplay();
