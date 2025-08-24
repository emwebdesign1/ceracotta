// /js/boot.js  — version sans renderUserChip

import { mountFavoritesPanel } from '/js/ui/favoritesPanel.js';
import { mountUserMenu } from '/js/ui/userMenu.js';
import { state } from '/js/state.js';
import { me } from '/js/api.js';

window.addEventListener('DOMContentLoaded', () => {
  // Init UI modules (une seule fois)
  mountFavoritesPanel();
  mountUserMenu();

  const overlay = document.getElementById('overlay');
  const panels = Array.from(document.querySelectorAll('.side-panel'));

  function openPanel(el) {
    panels.forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    overlay?.classList.add('active');
  }
  function closePanels() {
    panels.forEach(p => p.classList.remove('active'));
    overlay?.classList.remove('active');
  }

  // Boutons header
  document.getElementById('open-compte')?.addEventListener('click', e => {
    e.preventDefault();
    const el = document.getElementById('panel-compte');
    if (el) openPanel(el);
  });
  document.getElementById('open-favoris')?.addEventListener('click', e => {
    e.preventDefault();
    const el = document.getElementById('panel-favoris');
    if (el) openPanel(el);
  });
  document.getElementById('open-panier')?.addEventListener('click', e => {
    e.preventDefault();
    const el = document.getElementById('panel-panier');
    if (el) openPanel(el);
  });

  // Boutons fermer & overlay
  document.querySelectorAll('.side-panel .close-btn')
    .forEach(btn => btn.addEventListener('click', closePanels));
  overlay?.addEventListener('click', closePanels);

  // --- Badge panier global
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

  // Expose lecture seule (facultatif)
  window.__STATE__ = state;

  updateCartBadgeFromState();
  document.addEventListener('cart:changed', () => {
    updateCartBadgeFromState();
  });

  // --- Lien "Créer un compte" → page d’inscription
  document.querySelector('#panel-compte .alt-action a')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      location.href = '/register.html';
    });

  // Au chargement, tente /me si token présent
  if (state.accessToken && !state.user) {
    me().then(d => {
      if (d?.user) {
        const user = d.user;
        localStorage.setItem('user.v1', JSON.stringify(user));
        document.dispatchEvent(new CustomEvent('auth:changed', { detail: { user } }));
      }
    }).catch(() => {});
  }

  // Clic sur l'icône utilisateur -> redirection selon rôle
  document.getElementById('open-compte')?.addEventListener('click', (e) => {
    e.preventDefault();
    const u = state.user;
    if (u?.role === 'ADMIN') location.href = '/admin.html';
    else if (u) location.href = '/account.html';
    else {
      const el = document.getElementById('panel-compte');
      if (el) { overlay?.classList.add('active'); el.classList.add('active'); }
    }
  });
});
