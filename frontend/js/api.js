// /js/api.js
// /js/api.js
import { state, authHeaders, saveCart, setAuth } from './state.js';

// Mets FALSE pour activer les vraies requêtes côté backend
const MOCK = { products: true, cart: true, auth: false };


// -------- Produits (mock)
export async function getProducts({ category, q='', sort='-createdAt', page=1, limit=12 } = {}) {
  if (MOCK) {
    const items = [
      { id:'p1', slug:'assiette-email-beige', title:'Assiette émail beige', price:2900, images:['/images/bols.png'], variants:[{id:'v1', color:'Beige', size:'20cm', price:2900, stock:20}] },
      { id:'p2', slug:'bol-texture-mat',     title:'Bol texturé mat',     price:3490, images:['/images/bols.png'], variants:[{id:'v2', color:'Noir',  size:'Standard', price:3490, stock:12}] },
    ];
    return { items, total: items.length };
  }
  const params = new URLSearchParams({ q, sort, page, limit, ...(category?{category}:{}) });
  const res = await fetch(`/api/products?${params.toString()}`);
  return res.json();
}

export async function getProductBySlug(slug) {
  if (MOCK) {
    return {
      id:'p1',
      title:'Assiette Céramique Émaillée',
      slug:'assiette-email-beige',
      price:4500,
      description:'Assiette en céramique fabriquée à la main...',
      images:['/images/test2.png','/images/bols.png','/images/bols.png'],
      variants:[
        { id:'v1', sku:'ASB-20', color:'#f5f5dc', size:'20cm', price:4500, stock:10 },
        { id:'v2', sku:'ASB-26', color:'#d4a373', size:'26cm', price:4900, stock:6 },
        { id:'v3', sku:'ASB-XL', color:'#8d6748', size:'XL',   price:4900, stock:2 }
      ]
    };
  }
  const res = await fetch(`/api/products/${slug}`);
  return res.json();
}

/* ===== Auth réelle ===== */
export async function register(payload) {
  if (MOCK.auth) {
    const data = { user:{ id:'u1', email:payload.email, role:'CUSTOMER', username: payload.username }, accessToken:'FAKE_TOKEN' };
    setAuth(data); return data;
  }
  const res = await fetch('/api/auth/register', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json(); if (res.ok) setAuth(data); return data;
}

export async function login({ email, password }) {
  if (MOCK.auth) {
    const data = { user:{ id:'u1', email, role:'CUSTOMER', username:'emma' }, accessToken:'FAKE_TOKEN' };
    setAuth(data); return data;
  }
  const res = await fetch('/api/auth/login', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json(); if (res.ok) setAuth(data); return data;
}

export async function me() {
  const res = await fetch('/api/auth/me', { headers: { ...authHeaders() }});
  return res.ok ? res.json() : { user:null };
}

export function logout() { setAuth({ user:null, accessToken:null }); }

// -------- Panier
const safeId = () => (crypto?.randomUUID?.() || ('it_' + Math.random().toString(36).slice(2)));

export async function getCart() {
  if (MOCK) return state.cart;
  const res = await fetch('/api/carts/my', { headers: { ...authHeaders() }});
  return res.json();
}

export async function addToCart({ productId, variantId, quantity=1, title, unitPrice, id, slug, image }) {
  if (MOCK) {
    const key = variantId || productId || id;
    const found = state.cart.items.find(it => (it.variantId || it.productId || it.id) === key);
    if (found) found.quantity += quantity;
    else state.cart.items.push({
      id: safeId(),
      productId: id || productId,
      variantId, slug, title, unitPrice,
      image: image || null, quantity
    });
    saveCart();
    return structuredClone(state.cart);
  }
  const res = await fetch('/api/carts/add', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', ...authHeaders() },
    body: JSON.stringify({ productId, variantId, quantity })
  });
  const cart = await res.json();
  saveCart();
  return cart;
}

export async function updateCartItem({ itemId, quantity }) {
  if (MOCK) {
    const it = state.cart.items.find(i => i.id === itemId);
    if (it) it.quantity = Math.max(1, quantity);
    saveCart();
    return structuredClone(state.cart);
  }
  await fetch('/api/carts/update', { method:'PATCH',
    headers:{ 'Content-Type':'application/json', ...authHeaders() },
    body: JSON.stringify({ itemId, quantity })
  });
  const cart = await getCart(); saveCart(); return cart;
}

export async function removeCartItem(itemId) {
  if (MOCK) {
    state.cart.items = state.cart.items.filter(i => i.id !== itemId);
    saveCart(); return structuredClone(state.cart);
  }
  await fetch(`/api/carts/item/${itemId}`, { method:'DELETE', headers:{ ...authHeaders() }});
  const cart = await getCart(); saveCart(); return cart;
}

export async function clearCart() {
  if (MOCK) { state.cart.items = []; saveCart(); return structuredClone(state.cart); }
  await fetch('/api/carts/clear', { method:'DELETE', headers:{ ...authHeaders() }});
  const cart = await getCart(); saveCart(); return cart;
}
