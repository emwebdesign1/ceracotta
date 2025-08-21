document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("side-menu");
  const overlay = document.getElementById("overlay");
  const scrollTopBtn = document.getElementById("scroll-top");

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

  const dropdown = document.querySelector(".dropdown");
  const link = document.getElementById("collections-link");
  link?.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown?.classList.toggle("open");
  });

  const sections = document.querySelectorAll(".section");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  sections.forEach(section => observer.observe(section));

  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slider = document.querySelector('.avis-slider');
  const btnPrev = document.getElementById('avis-prev');
  const btnNext = document.getElementById('avis-next');

  btnPrev?.addEventListener('click', () => {
    slider.scrollBy({ left: -320, behavior: 'smooth' });
  });

  btnNext?.addEventListener('click', () => {
    slider.scrollBy({ left: 320, behavior: 'smooth' });
  });

  document.querySelector('.cta-button')?.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.getElementById('univers');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
