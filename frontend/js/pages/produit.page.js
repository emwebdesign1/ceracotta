// /js/pages/produit.page.js
import { getProductBySlug, addToCart } from '/js/api.js';
import { addFavorite, isFavorite } from '/js/state.js';
import { showToast } from '/js/ui/toast.js';

const params = new URLSearchParams(location.search);
const slug = params.get('slug');
if (!slug) {
  document.body.innerHTML = '<p style="padding:2rem">Produit introuvable (slug manquant).</p>';
  throw new Error('missing slug');
}

// Hooks dans le DOM
const mainImage   = document.querySelector('.main-image');
const thumbsWrap  = document.querySelector('.thumbnail-container');
const titleEl     = document.querySelector('.product-details h1');
const priceEl     = document.querySelector('.product-details .price');
const descEl      = document.querySelector('.product-details .description');
const colorsWrap  = document.querySelector('.product-details .color-options');
const addBtn      = document.querySelector('.add-to-cart');
const buyBtn      = document.querySelector('.buy-now');
const favBtn      = document.querySelector('.fav-toggle');

function chf(cents) { return `CHF ${(cents / 100).toFixed(2)}`; }

function flashButton(btn, text) {
  if (!btn) return;
  const prev = btn.textContent;
  btn.disabled = true;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 900);
}

function updateCartBadge(count) {
  const cartLink = document.getElementById('open-panier');
  if (!cartLink) return;
  let badge = cartLink.querySelector('.cart-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge';
    Object.assign(badge.style, {
      position: 'absolute', top: '-6px', right: '-8px',
      background: '#7f0000', color: '#fff', borderRadius: '999px',
      fontSize: '12px', lineHeight: '1', padding: '2px 6px',
      minWidth: '18px', textAlign: 'center'
    });
    cartLink.style.position = 'relative';
    cartLink.appendChild(badge);
  }
  badge.textContent = String(count);
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

function mountGallery(images = []) {
  const list = Array.isArray(images)
    ? images
    : (typeof images === 'string' ? JSON.parse(images) : []);
  if (!list.length) return;

  if (mainImage) {
    mainImage.src = list[0];
    mainImage.alt = 'Image produit 1';
  }

  if (thumbsWrap) {
    thumbsWrap.innerHTML = list
      .map((src, i) => `<img src="${src}" class="thumbnail ${i===0?'selected':''}" alt="Image produit ${i+1}" />`)
      .join('');
    thumbsWrap.querySelectorAll('.thumbnail').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        thumbsWrap.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
        if (mainImage) { mainImage.src = thumb.src; mainImage.alt = thumb.alt; }
      });
    });
  }
}

function renderColors(p) {
  if (!colorsWrap) return;
  const fromVariants = Array.isArray(p.variants) ? p.variants.map(v => v.color).filter(Boolean) : [];
  const fromCaracs   = Array.isArray(p.characteristics?.colors) ? p.characteristics.colors : [];
  const fromColors   = Array.isArray(p.colors) ? p.colors : [];
  const colors = [...new Set([...fromVariants, ...fromCaracs, ...fromColors])].slice(0, 8);

  colorsWrap.innerHTML = colors.length
    ? colors.map(c => `<span class="color-dot" title="${c}" style="background:${c}"></span>`).join('')
    : '';
}

function setupCaracSlider() {
  const slider = document.querySelector('.icons-banner-slider');
  const dots = document.querySelectorAll('.accordion-navigation .dot');
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

(async function init() {
  const p = await getProductBySlug(slug);
  if (!p) {
    document.body.innerHTML = '<p style="padding:2rem">Produit introuvable.</p>';
    return;
  }

  // Meta + texte
  document.title = `${p.title} – Céracotta`;
  titleEl && (titleEl.textContent = p.title || 'Produit');
  priceEl && (priceEl.textContent = chf(p.price ?? 0));
  descEl  && (descEl.textContent  = p.description || '');

  // UI
  mountGallery(p.images || []);
  renderColors(p);

  // Favori
  if (favBtn) {
    const refreshHeart = () => {
      const fav = isFavorite(slug);
      favBtn.querySelector('.heart')?.replaceWith(Object.assign(document.createElement('span'), {
        className: 'heart',
        textContent: fav ? '♥' : '♡'
      }));
      favBtn.setAttribute('aria-pressed', fav);
    };
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addFavorite(slug);
      refreshHeart();
      showToast(isFavorite(slug) ? 'Ajouté aux favoris' : 'Retiré des favoris', { sub: p.title });
    });
    refreshHeart();
  }

  // Panier
  addBtn?.addEventListener('click', async () => {
    const cart = await addToCart({
      id: p.id,
      slug: p.slug,
      title: p.title,
      unitPrice: p.price,
      image: Array.isArray(p.images) ? p.images[0] : null
    }, 1);

    flashButton(addBtn, 'Ajouté ✓');
    showToast('Ajouté au panier', { sub: p.title });

    const count = (cart?.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
    updateCartBadge(count);
  });

  buyBtn?.addEventListener('click', async () => {
    await addToCart({
      id: p.id, slug: p.slug, title: p.title, unitPrice: p.price,
      image: Array.isArray(p.images) ? p.images[0] : null
    }, 1);
    location.href = '/checkout.html';
  });

  setupCaracSlider();
})();
