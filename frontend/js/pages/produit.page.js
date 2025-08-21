// js/pages/produit.page.js
// Produit : galerie, variantes/couleurs, ajout au panier (silencieux) + slider caractéristiques

import { getProductBySlug, addToCart } from '../api.js';

// Récupère le slug dans l'URL (ex: produit.html?slug=assiette-email-beige)
const params = new URLSearchParams(location.search);
const slug = params.get('slug') || 'assiette-email-beige';

// Sélecteurs principaux
const mainImage     = document.querySelector(".main-image");
const thumbsWrap    = document.querySelector(".thumbnail-container");
const addBtn        = document.querySelector(".add-to-cart");
const colorDotsWrap = document.querySelector(".color-options");

// État local
let product = null;
let selectedVariantId = null;

/* =========================
   Helpers feedback/badge
   ========================= */
function flashButton(btn, text) {
  const prev = btn.textContent;
  btn.disabled = true;
  btn.textContent = text;
  setTimeout(() => {
    btn.textContent = prev;
    btn.disabled = false;
  }, 1200);
}

function updateCartBadge(count) {
  const cartLink = document.getElementById('open-panier');
  if (!cartLink) return;
  let badge = cartLink.querySelector('.cart-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge';
    Object.assign(badge.style, {
      position: 'absolute',
      top: '-6px',
      right: '-8px',
      background: '#7f0000',
      color: '#fff',
      borderRadius: '999px',
      fontSize: '12px',
      lineHeight: '1',
      padding: '2px 6px',
      minWidth: '18px',
      textAlign: 'center'
    });
    cartLink.style.position = 'relative';
    cartLink.appendChild(badge);
  }
  badge.textContent = String(count);
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

/* =========================
   Montage de la galerie
   ========================= */
function mountGallery(images = []) {
  if (!mainImage || !thumbsWrap || !images.length) return;

  // Image principale
  mainImage.src = images[0];
  mainImage.alt = "Image produit 1";

  // Miniatures
  thumbsWrap.innerHTML = images
    .map((src, i) => `<img src="${src}" class="thumbnail ${i===0?'selected':''}" alt="Image produit ${i+1}" />`)
    .join('');

  // Click miniatures
  thumbsWrap.querySelectorAll('.thumbnail').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbsWrap.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
      mainImage.src = thumb.src;
      mainImage.alt = thumb.alt;
    });
  });
}

/* =========================
   Montage variantes/couleurs
   ========================= */
function mountVariants(variants = []) {
  if (!colorDotsWrap || !variants.length) return;

  colorDotsWrap.innerHTML = variants.map((v, i) =>
    `<span class="color-dot ${i===0?'active':''}" data-id="${v.id}" style="background-color:${v.color || '#d4a373'}"></span>`
  ).join('');

  selectedVariantId = variants[0]?.id || null;

  colorDotsWrap.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      colorDotsWrap.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedVariantId = dot.dataset.id;
    });
  });
}

/* =========================
   Slider caractéristiques (2 par slide)
   ========================= */
function setupCaracSlider() {
  const slider = document.querySelector(".icons-banner-slider");
  const dots = document.querySelectorAll(".accordion-navigation .dot");
  if (!slider || !dots.length) return;

  let idx = 0;
  const update = () => {
    slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[idx]?.classList.add('active');
  };
  dots.forEach((d, i) => d.addEventListener('click', () => { idx = i; update(); }));
  window.addEventListener('resize', update);
  update();
}

/* =========================
   Init page
   ========================= */
async function init() {
  // 1) Charger le produit (mock API pour l’instant)
  product = await getProductBySlug(slug);

  // 2) Monter la galerie & variantes
  mountGallery(product.images || []);
  mountVariants(product.variants || []);

  // 3) Ajouter au panier (silencieux : pas d’ouverture du panel)
  addBtn?.addEventListener('click', async () => {
    if (!selectedVariantId) return;

    const cart = await addToCart({
      productId: product.id,
      variantId: selectedVariantId,
      quantity: 1,
      title: product.title,
      unitPrice: product.price
    });

    // Feedback sur le bouton
    flashButton(addBtn, 'Ajouté ✓');

    // Mettre à jour le badge sur l’icône panier
    const count = cart.items.reduce((s, it) => s + (it.quantity || 1), 0);
    updateCartBadge(count);
  });

  // 4) Slider caractéristiques
  setupCaracSlider();
}
init();

import { showToast } from '../ui/toast.js';

// ...
addBtn?.addEventListener('click', async () => {
  // ... addToCart(...)
  showToast('Ajouté au panier', { sub: product.title });
  // et mets à jour le badge avec updateCartBadge(count) comme tu le fais déjà
});

