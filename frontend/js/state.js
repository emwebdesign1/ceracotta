// === Favoris (localStorage) ===
const LS = {
  CART:  'cart.v1',
  USER:  'user.v1',
  TOKEN: 'token.v1',
  FAVS:  'favs.v1'
};

export const state = {
  accessToken: null,
  user: null,
  cart: { items: [] },
  favs: []
};

(function boot() {
  try { state.cart = JSON.parse(localStorage.getItem(LS.CART) || '{"items":[]}'); } catch {}
  try { state.user = JSON.parse(localStorage.getItem(LS.USER) || 'null'); } catch {}
  state.accessToken = localStorage.getItem(LS.TOKEN) || null;
  try { state.favs = JSON.parse(localStorage.getItem(LS.FAVS) || '[]'); } catch {}
})();

export const authHeaders = () =>
  state.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {};

export function saveCart() {
  localStorage.setItem(LS.CART, JSON.stringify(state.cart));
  document.dispatchEvent(new CustomEvent('cart:changed', { detail: state.cart }));
}

export function setAuth({ user, accessToken }) {
  state.user = user || null;
  state.accessToken = accessToken || null;
  if (user) localStorage.setItem(LS.USER, JSON.stringify(user));
  else localStorage.removeItem(LS.USER);
  if (accessToken) localStorage.setItem(LS.TOKEN, accessToken);
  else localStorage.removeItem(LS.TOKEN);
  document.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: state.user } }));
}

// --- favoris
export function getFavorites() {
  return Array.isArray(state.favs) ? state.favs : [];
}
export function isFavorite(slug) {
  return state.favs.includes(slug);
}
export function addFavorite(slug) {
  const i = state.favs.indexOf(slug);
  if (i === -1) state.favs.push(slug);
  else state.favs.splice(i, 1);
  localStorage.setItem(LS.FAVS, JSON.stringify(state.favs));
  document.dispatchEvent(new CustomEvent('fav:changed', { detail: state.favs }));
}
