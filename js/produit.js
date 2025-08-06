document.addEventListener("DOMContentLoaded", () => {
  // --- Image principale + miniatures
  const mainImage = document.querySelector(".main-image");
  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbnails.forEach(t => t.classList.remove("selected"));
      thumb.classList.add("selected");
      mainImage.src = thumb.src;
      mainImage.alt = thumb.alt;
    });
  });

  // --- Carrousel "Tu aimerais aussi"
  const carousel = document.querySelector(".aimerais-aussi .carousel");
  const btnLeft = document.querySelector(".aimerais-aussi .carousel-btn.left");
  const btnRight = document.querySelector(".aimerais-aussi .carousel-btn.right");

  btnLeft?.addEventListener("click", () => {
    carousel.scrollBy({ left: -240, behavior: "smooth" });
  });

  btnRight?.addEventListener("click", () => {
    carousel.scrollBy({ left: 240, behavior: "smooth" });
  });

  // --- Slider Caractéristiques (2 éléments par slide avec dots)
  const slider = document.querySelector('.icons-banner');
  const dots = document.querySelectorAll('.accordion-navigation .dot');
  let currentSlide = 0;
  const totalSlides = Math.ceil(slider.children.length / 2); // Dynamique
  function goToSlide(index) {
    slider.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
    currentSlide = index;
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoSlide();
    });
  });

  // --- Auto-slide toutes les 4 secondes
  let autoSlide = setInterval(() => {
    let next = (currentSlide + 1) % totalSlides;
    goToSlide(next);
  }, 4000);

  function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      let next = (currentSlide + 1) % totalSlides;
      goToSlide(next);
    }, 4000);
  }

  goToSlide(0);

  // --- Menu burger + side panels
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("side-menu");
  const overlay = document.getElementById("overlay");

  const sidePanels = {
    compte: document.getElementById("panel-compte"),
    panier: document.getElementById("panel-panier"),
    favoris: document.getElementById("panel-favoris"),
  };

  function closeAllSidePanels() {
    Object.values(sidePanels).forEach(panel => panel?.classList.remove("active"));
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
    hamburger.classList.remove("open");
  }

  function openSidePanel(name) {
    closeAllSidePanels();
    const panel = sidePanels[name];
    if (panel) {
      panel.classList.add("active");
      overlay.classList.add("active");
      document.body.classList.add("menu-open");
    }
  }

  hamburger?.addEventListener("click", () => {
    nav.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("menu-open");
    hamburger.classList.toggle("open");
  });

  overlay?.addEventListener("click", () => {
    nav.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
    hamburger.classList.remove("open");
    closeAllSidePanels();
  });

  document.getElementById("open-compte")?.addEventListener("click", e => {
    e.preventDefault();
    openSidePanel("compte");
  });

  document.getElementById("open-favoris")?.addEventListener("click", e => {
    e.preventDefault();
    openSidePanel("favoris");
  });

  document.getElementById("open-panier")?.addEventListener("click", e => {
    e.preventDefault();
    openSidePanel("panier");
  });

  document.querySelectorAll(".close-btn").forEach(btn =>
    btn.addEventListener("click", closeAllSidePanels)
  );

  // --- Déroulant collections
  const dropdown = document.querySelector(".dropdown");
  const link = document.getElementById("collections-link");
  link?.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown?.classList.toggle("open");
  });

  // --- Scroll vers section univers (page d’accueil)
  document.querySelector('.cta-button')?.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.getElementById('univers');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
