// /js/ui/favoritesPanel.js
import { getFavorites } from '/js/state.js';
import { getProductBySlug, addToCart } from '/js/api.js';

export async function mountFavoritesPanel(){
  const root = document.getElementById('panel-favoris');
  if (!root) return;

  async function render(){
    const slugs = getFavorites();
    if (!slugs.length) {
      root.querySelector('.content')?.remove();
      root.insertAdjacentHTML('beforeend', `<div class="content"><p>Aucun favori.</p></div>`);
      return;
    }
    const prods = (await Promise.all(slugs.map(getProductBySlug))).filter(Boolean);
    const html = prods.map(p => `
      <div class="fav-item">
        <img src="${(Array.isArray(p.images) && p.images[0]) || '/images/placeholder.png'}" alt="${p.title}">
        <div class="txt">
          <a href="/produit.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a>
          <div class="row">
            <span>CHF ${(p.price/100).toFixed(2)}</span>
            <button data-id="${p.id}" data-slug="${p.slug}" class="mini-btn">Ajouter</button>
          </div>
        </div>
      </div>`).join('');
    root.querySelector('.content')?.remove();
    root.insertAdjacentHTML('beforeend', `<div class="content">${html}</div>`);
    root.querySelectorAll('.mini-btn').forEach(b=>{
      const prod = prods.find(x=>x.id===b.dataset.id);
      b.onclick = () => addToCart({
        id: prod.id, slug: prod.slug, title: prod.title,
        unitPrice: prod.price, image: (Array.isArray(prod.images) ? prod.images[0] : null)
      }, 1);
    });
  }

  document.addEventListener('fav:changed', render);
  render();
}
