document.addEventListener("DOMContentLoaded", () => {
  // Produit gallery thumbnails
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

  // Carrousel Avis Clients
  const reviewsWrapper = document.querySelector(".reviews-wrapper > div");
  const reviewPrevBtn = document.querySelector(".reviews-carousel .carousel-btn.prev");
  const reviewNextBtn = document.querySelector(".reviews-carousel .carousel-btn.next");

  let reviewIndex = 0;
  const reviewItemWidth = 300 + 16; // 280 + gap approx

  reviewPrevBtn.addEventListener("click", () => {
    reviewIndex = Math.max(reviewIndex - 1, 0);
    reviewsWrapper.style.transform = `translateX(-${reviewIndex * reviewItemWidth}px)`;
  });

  reviewNextBtn.addEventListener("click", () => {
    const maxIndex = reviewsWrapper.children.length - 3; // afficher 3 à la fois
    reviewIndex = Math.min(reviewIndex + 1, maxIndex);
    reviewsWrapper.style.transform = `translateX(-${reviewIndex * reviewItemWidth}px)`;
  });

  // Carrousel "Tu aimerais aussi"
  const carousel = document.querySelector(".aimerais-aussi .carousel");
  const btnLeft = document.querySelector(".aimerais-aussi .carousel-btn.left");
  const btnRight = document.querySelector(".aimerais-aussi .carousel-btn.right");

  btnLeft.addEventListener("click", () => {
    carousel.scrollBy({ left: -240, behavior: "smooth" });
  });

  btnRight.addEventListener("click", () => {
    carousel.scrollBy({ left: 240, behavior: "smooth" });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const btnLeft = document.querySelector(".aimerais-aussi .carousel-btn.left");
  const btnRight = document.querySelector(".aimerais-aussi .carousel-btn.right");
  const carousel = document.querySelector(".aimerais-aussi .carousel");

  btnLeft.addEventListener("click", () => {
    carousel.scrollBy({
      left: -240,
      behavior: "smooth"
    });
  });

  btnRight.addEventListener("click", () => {
    carousel.scrollBy({
      left: 240,
      behavior: "smooth"
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const dots = document.querySelectorAll('.accordion-navigation .dot');
  const slider = document.querySelector('.accordion-slider');

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      slider.style.transform = `translateX(-${index * 50}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });
});



document.addEventListener("DOMContentLoaded", () => {
  // Slider Caractéristiques par 2
  const dots = document.querySelectorAll('.accordion-navigation .dot');
  const slider = document.querySelector('.icons-banner');

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      slider.style.transform = `translateX(-${index * 50}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector('.icons-banner');
  const dots = document.querySelectorAll('.accordion-navigation .dot');
  let currentSlide = 0;
  const totalSlides = 2; // 4 items, 2 par slide

  function goToSlide(index) {
    slider.style.transform = `translateX(-${index * 50}%)`; // 50% = largeur de 2 items
    dots.forEach(d => d.classList.remove('active'));
    dots[index].classList.add('active');
    currentSlide = index;
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      resetAutoSlide();
    });
  });

  // Auto slide
  let autoSlide = setInterval(() => {
    let next = (currentSlide + 1) % totalSlides;
    goToSlide(next);
  }, 3500);

  function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      let next = (currentSlide + 1) % totalSlides;
      goToSlide(next);
    }, 3500);
  }

  goToSlide(0);
});

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
