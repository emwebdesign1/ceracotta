// /js/pages/produit.page.js
import { getProductBySlug, addToCart } from '/js/api.js';
import { addFavorite, isFavorite } from '/js/state.js';
import { showToast } from '/js/ui/toast.js';

// ========== utils ==========
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

const CHF = cents =>
  typeof cents === 'number' ? `CHF ${(cents/100).toFixed(2)}` : '';

function escapeHTML(str = '') {
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Transforme un texte multi-lignes stocké en DB en HTML propre (paragraphes + puces)
function renderMultilineToHTML(text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const bullets = [];
  const paras = [];
  for (const l of lines) {
    if (/^[•\-]/.test(l)) bullets.push(escapeHTML(l.replace(/^[•\-]\s*/, '')));
    else paras.push(escapeHTML(l));
  }
  const pHTML  = paras.map(p => `<p>${p}</p>`).join('');
  const ulHTML = bullets.length ? `<ul>${bullets.map(li => `<li>${li}</li>`).join('')}</ul>` : '';
  return pHTML + ulHTML;
}

function renderColorDots(colors = []) {
  // colors peut venir de ProductColor[] {hex,name} (DB) OU d'une simple liste d'hex
  return colors.map(c => {
    const hex = typeof c === 'string' ? c : (c.hex || '#ccc');
    const title = typeof c === 'string' ? c : (c.name || hex);
    return `<span class="dot" title="${title}" style="background:${hex};"></span>`;
  }).join('');
}

// ========== slug depuis l'URL ==========
const params = new URLSearchParams(location.search);
const slug = params.get('slug');
if (!slug) {
  document.body.innerHTML = '<p style="padding:2rem">Produit introuvable (slug manquant).</p>';
  throw new Error('missing slug');
}

// ========== hooks DOM ==========
const mainImg     = $('.product-gallery .main-image');
const thumbsWrap  = $('.product-gallery .thumbnail-container');
const titleEl     = $('.product-details h1');
const priceEl     = $('.product-details .price');
const descEl      = $('.product-details .description');
const colorWrap   = $('.product-details .color-options');
const addBtn      = $('.product-details .add-to-cart');
const favBtn      = $('.product-details .fav-toggle');
const favHeart    = $('.product-details .fav-toggle .heart');

// Les 3 accordéons déjà dans ton HTML
const detailsP    = document.querySelector('.accordion-section details:nth-of-type(1) > p'); // Votre pièce en détail
const careP       = document.querySelector('.accordion-section details:nth-of-type(2) > p'); // Conseil & entretien
const shippingP   = document.querySelector('.accordion-section details:nth-of-type(3) > p'); // Livraison & retours

// ========== logique ==========
async function init() {
  try {
    // 1) récup produit depuis l’API
    const p = await getProductBySlug(slug);
    if (!p) throw new Error('Produit introuvable');

    // 2) titre / prix / desc
    titleEl.textContent = p.title || '';
    priceEl.textContent = CHF(p.price);
    descEl.textContent  = p.description || '';

    // 3) couleurs
    colorWrap.innerHTML = renderColorDots(p.colors || []);

    // 4) images
    const imgs = Array.isArray(p.images) ? p.images.slice().sort((a,b) => {
      const pa = typeof a === 'string' ? 0 : (a.position ?? 0);
      const pb = typeof b === 'string' ? 0 : (b.position ?? 0);
      return pa - pb;
    }) : [];

    const getUrl = (item) => typeof item === 'string' ? item : item.url;

    if (imgs.length) {
      mainImg.src = getUrl(imgs[0]);
      mainImg.alt = p.title || '';
      thumbsWrap.innerHTML = imgs
        .map(it => `<img class="thumbnail" src="${getUrl(it)}" alt="${p.title || ''}">`)
        .join('');
      thumbsWrap.addEventListener('click', e => {
        const t = e.target;
        if (t && t.classList.contains('thumbnail')) {
          mainImg.src = t.getAttribute('src');
        }
      });
    } else {
      mainImg.src = '/images/placeholder.png';
      mainImg.alt = p.title || '';
      thumbsWrap.innerHTML = '';
    }

    // 5) accordéons depuis la DB
    if (detailsP)  detailsP.innerHTML  = renderMultilineToHTML(p.pieceDetail);
    if (careP)     careP.innerHTML     = renderMultilineToHTML(p.careAdvice);
    if (shippingP) shippingP.innerHTML = renderMultilineToHTML(p.shippingReturn);

    // 6) favoris (UI de base)
    try {
      if (isFavorite && isFavorite(p.slug)) {
        favHeart.textContent = '❤';
        favBtn?.classList.add('active');
      }
    } catch {} // au cas où state.js diffère

    favBtn?.addEventListener('click', () => {
      try {
        addFavorite && addFavorite({
          id: p.id, slug: p.slug, title: p.title,
          image: imgs.length ? getUrl(imgs[0]) : null,
          price: p.price
        });
        favHeart.textContent = '❤';
        favBtn.classList.add('active');
        showToast && showToast('Ajouté aux favoris');
      } catch {
        // pas critique
      }
    });

    // 7) panier (ajout 1 quantité)
    addBtn?.addEventListener('click', async () => {
      await addToCart({
        id: p.id,
        slug: p.slug,
        title: p.title,
        unitPrice: p.price,
        image: imgs.length ? getUrl(imgs[0]) : null
      }, 1);
      showToast && showToast('Ajouté au panier');
    });

  } catch (err) {
    console.error(err);
    document.querySelector('.product-page')?.insertAdjacentHTML(
      'beforeend',
      `<p style="color:#b00020;margin-top:1rem">Erreur chargement produit.</p>`
    );
  }
}

init();
