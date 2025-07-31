document.addEventListener("DOMContentLoaded", () => {
  // ------------------- PRODUIT / TRI / CHARGER PLUS -------------------
  const productContainer = document.getElementById("product-list");
  const loadMoreButton = document.getElementById("load-more");
  const sortSelect = document.getElementById("category-filter");

  if (productContainer && loadMoreButton && sortSelect) {
    let currentIndex = 0;
    const productsPerPage = 8;

    const products = [
      {
        name: "Assiette crème Céracotta",
        price: "29.90 CHF",
        priceValue: 29.90,
        colors: ["#c62828", "#e7d8c4", "#1c1c1c"],
        image: "/images/bols.png"
      },
      {
        name: "Bol texturé mat",
        price: "34.90 CHF",
        priceValue: 34.90,
        colors: ["#000000", "#CCCCCC", "#996633", "#ffffff"],
        image: "/images/bols.png"
      },
      {
        name: "Assiette dorée brillante",
        price: "49.90 CHF",
        priceValue: 49.90,
        colors: ["#D4AF37", "#FFFFFF"],
        image: "/images/bols.png"
      }
    ];

    let sortedProducts = [...products];

    function renderProducts(reset = false) {
      if (reset) {
        productContainer.innerHTML = "";
        currentIndex = 0;
      }

      const slice = sortedProducts.slice(currentIndex, currentIndex + productsPerPage);

      slice.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";

        const imageLink = document.createElement("a");
        imageLink.href = "produit.html";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.className = "product-image";
        imageLink.appendChild(image);

        const name = document.createElement("h3");
        name.className = "product-title";
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = product.price;

        const colorContainer = document.createElement("div");
        colorContainer.className = "color-dots";

        const colorsToShow = product.colors.slice(0, 3);
        colorsToShow.forEach((color) => {
          const dot = document.createElement("span");
          dot.className = "dot";
          dot.style.backgroundColor = color;
          colorContainer.appendChild(dot);
        });

        if (product.colors.length > 3) {
          const more = document.createElement("span");
          more.className = "dot more-dot";
          more.textContent = "+1";
          colorContainer.appendChild(more);
        }

        card.appendChild(imageLink);
        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(colorContainer);

        productContainer.appendChild(card);
      });

      currentIndex += productsPerPage;
      loadMoreButton.style.display = currentIndex >= sortedProducts.length ? "none" : "block";
    }

    function sortProducts() {
      const sortValue = sortSelect.value;
      if (sortValue === "price-asc") {
        sortedProducts.sort((a, b) => a.priceValue - b.priceValue);
      } else if (sortValue === "price-desc") {
        sortedProducts.sort((a, b) => b.priceValue - a.priceValue);
      }
      renderProducts(true);
    }

    sortSelect.addEventListener("change", sortProducts);
    loadMoreButton.addEventListener("click", () => renderProducts());
    sortProducts();
  }

  // ------------------- MENU BURGER / PANELS -------------------
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
});
