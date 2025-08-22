// ADMIN – pilote l'API admin
const API = 'http://localhost:4000/api'; // ajuste si backend ailleurs
const token = localStorage.getItem('admintoken') || localStorage.getItem('token'); // réutilise si déjà connecté admin
const H = { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) };

async function j(url, opts={}){ const r=await fetch(url,opts); const d=await r.json(); if(!r.ok) throw new Error(d.message||'Erreur'); return d; }

const $ = (s,p=document)=>p.querySelector(s);

async function loadProducts(){
  const { items } = await j(`${API}/products?limit=200`, { headers:H });
  const tb = $('#productsTable tbody'); tb.innerHTML='';
  items.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.title}</td><td>${p.category?.slug||''}</td><td>CHF ${(p.price/100).toFixed(2)}</td><td>${p.stock}</td>
      <td><button class="ghost" data-id="${p.id}">Supprimer</button></td>`;
    tr.querySelector('button').onclick = async()=>{
      await j(`${API}/admin/products/${p.id}`, { method:'DELETE', headers:H });
      loadProducts();
    };
    tb.appendChild(tr);
  });
}

async function loadOrders(){
  const list = await j(`${API}/admin/orders`, { headers:H });
  const tb = $('#ordersTable tbody'); tb.innerHTML='';
  list.forEach(o=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(o.createdAt).toLocaleString()}</td>
    <td>${o.user?.email||'-'}</td><td>CHF ${(o.amount/100).toFixed(2)}</td><td>${o.status}</td><td>${o.paymentMethod}</td>`;
    tb.appendChild(tr);
  });
}

async function loadUsers(){
  const list = await j(`${API}/admin/users`, { headers:H });
  const tb = $('#usersTable tbody'); tb.innerHTML='';
  list.forEach(u=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.email}</td><td>${(u.firstName||'')+' '+(u.lastName||'')}</td><td>${u.role}</td><td>${new Date(u.createdAt).toLocaleDateString()}</td>`;
    tb.appendChild(tr);
  });
}

$('#createForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const body = {
    title: f.get('title'), slug: f.get('slug'), description: f.get('description'),
    images: JSON.parse(f.get('images')||'[]'),
    characteristics: JSON.parse(f.get('characteristics')||'[]'),
    price: Number(f.get('price')), stock: Number(f.get('stock')),
    categorySlug: f.get('categorySlug') || null
  };
  try{
    await j(`${API}/admin/products`, { method:'POST', headers:H, body: JSON.stringify(body) });
    document.getElementById('createMsg').textContent='Produit créé ✔';
    e.currentTarget.reset();
    loadProducts();
  }catch(err){ document.getElementById('createMsg').textContent=err.message; }
});

loadProducts(); loadOrders(); loadUsers();
