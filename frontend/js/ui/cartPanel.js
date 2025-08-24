// js/ui/cartPanel.js
import { updateCartItem, removeCartItem, clearCart } from '../api.js';

const panel = () => document.getElementById("panel-panier");

export function renderCartPanel(cart) {
  const root = panel();
  if (!root) return;
  root.classList.add('cart-panel'); // applique les styles "beaux"

  const total = cart.items.reduce((s, it) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);

  root.innerHTML = `
    <button class="close-btn" aria-label="Fermer">×</button>
    <div class="cart-header">
      <h2>Votre panier</h2>
      <span class="cart-count">${cart.items.length} article${cart.items.length>1?'s':''}</span>
    </div>

    ${cart.items.length === 0 ? `
      <div class="cart-empty">
        <p>Votre panier est vide.</p>
      </div>
    ` : `
      <ul class="cart-list">
        ${cart.items.map(it => `
          <li class="cart-item" data-id="${it.id}">
            <div class="thumb">
              ${it.image ? `<img src="${it.image}" alt="${it.title}"/>` : `<div class="ph"></div>`}
            </div>
            <div class="meta">
              <div class="title">${it.title || 'Produit'}</div>
              ${it.variantLabel ? `<div class="variant">${it.variantLabel}</div>` : ``}
              <div class="price">CHF ${( (it.unitPrice||0)/100 ).toFixed(2)}</div>
              <div class="qty-controls">
                <button class="qty dec" aria-label="Diminuer">−</button>
                <span class="qty-val">${it.quantity || 1}</span>
                <button class="qty inc" aria-label="Augmenter">+</button>
              </div>
            </div>
            <button class="rm" aria-label="Retirer">×</button>
          </li>
        `).join('')}
      </ul>

      <div class="cart-summary">
        <div class="row">
          <span>Sous‑total</span>
          <strong>CHF ${(total/100).toFixed(2)}</strong>
        </div>
        <p class="hint">Livraison et taxes calculées lors du paiement.</p>
        <div class="actions">
          <button class="btn ghost clear">Vider</button>
          <button class="btn primary checkout">Commander</button>
        </div>
      </div>
    `}
  `;

  // wire events
  root.querySelectorAll('.cart-item').forEach(li => {
    const id = li.dataset.id;
    li.querySelector('.inc')?.addEventListener('click', async () => {
      const q = Number(li.querySelector('.qty-val').textContent) + 1;
      renderCartPanel(await updateCartItem({ itemId: id, quantity: q }));
    });
    li.querySelector('.dec')?.addEventListener('click', async () => {
      const current = Number(li.querySelector('.qty-val').textContent);
      const q = Math.max(1, current - 1);
      renderCartPanel(await updateCartItem({ itemId: id, quantity: q }));
    });
    li.querySelector('.rm')?.addEventListener('click', async () => {
      renderCartPanel(await removeCartItem(id));
    });
  });

  root.querySelector('.clear')?.addEventListener('click', async () => {
    renderCartPanel(await clearCart());
  });

  // (checkout sera branché au backend: intent + confirm)
}
root.querySelector('.checkout')?.addEventListener('click', () => {
  location.href = '/checkout.html';
});
