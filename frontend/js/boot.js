// /js/boot.js — version corrigée qui monte le panel d'auth sur ton index.html

import { mountFavoritesPanel } from '/js/ui/favoritesPanel.js';
import { mountUserMenu } from '/js/ui/userMenu.js';
import { state, LS } from '/js/state.js';
import { me } from '/js/api.js';
import { mountAuthPanel } from '/js/auth.js';

window.addEventListener('DOMContentLoaded', () => {
  // Init UI modules
  mountFavoritesPanel();
  mountUserMenu();
  mountAuthPanel(); // <-- active le formulaire du panel compte

  const overlay = document.getElementById('overlay');
  const panels  = Array.from(document.querySelectorAll('.side-panel'));

  function openPanel(el) {
    panels.forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    overlay?.classList.add('active');
  }
  function closePanels() {
    panels.forEach(p => p.classList.remove('active'));
    overlay?.classList.remove('active');
  }

  // Boutons fermer & overlay
  document.querySelectorAll('.side-panel .close-btn')
    .forEach(btn => btn.addEventListener('click', closePanels));
  overlay?.addEventListener('click', closePanels);

  // --- Badge panier global (inchangé)
  function updateCartBadgeFromState() {
    const link = document.getElementById('open-panier');
    if (!link) return;
    let badge = link.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      link.appendChild(badge);
    }
    const count = (state?.cart?.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  window.__STATE__ = state;
  updateCartBadgeFromState();
  document.addEventListener('cart:changed', updateCartBadgeFromState);

  // Tente /me si token présent mais pas encore de user
  if (state.accessToken && !state.user) {
    me().then(d => {
      if (d?.user) {
        const user = d.user;
        localStorage.setItem(LS.USER, JSON.stringify(user));
        document.dispatchEvent(new CustomEvent('auth:changed', { detail: { user } }));
      }
    }).catch(() => {});
  }

  // === Icône utilisateur : un SEUL handler
  document.getElementById('open-compte')?.addEventListener('click', (e) => {
    e.preventDefault();
    const u = state.user;
    if (u?.role === 'ADMIN') { location.href = '/admin.html'; return; }
    if (u) { location.href = '/account.html'; return; }
    const el = document.getElementById('panel-compte');
    if (el) openPanel(el);
  });

  // === Favoris / Panier
  document.getElementById('open-favoris')?.addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.getElementById('panel-favoris');
    if (el) openPanel(el);
  });
  document.getElementById('open-panier')?.addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.getElementById('panel-panier');
    if (el) openPanel(el);
  });

  // (facultatif) lien "Créer un compte" dans le panel -> page register
  document.querySelector('#panel-compte .alt-action a')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      location.href = '/register.html';
    });

  // Après login/register (setAuth déclenche cet event), ferme panel et va au compte
  document.addEventListener('auth:changed', (ev) => {
    const user = ev?.detail?.user || state.user;
    if (user) {
      closePanels();
      location.href = '/account.html';
    }
  });
});
