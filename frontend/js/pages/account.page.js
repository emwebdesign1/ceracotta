const API = 'http://localhost:4000/api';
const token = localStorage.getItem('token');
if(!token){ alert('Connecte-toi pour accéder à ton compte.'); location.href='index.html'; }

const H = { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };
async function j(url, opts={}){ const r=await fetch(url,opts); const d=await r.json(); if(!r.ok) throw new Error(d.message||'Erreur'); return d; }

const F = document.getElementById('meForm');
const M = document.getElementById('meMsg');
const $ = (s,p=document)=>p.querySelector(s);

async function loadMe(){
  const { user } = await j(`${API}/auth/me`, { headers:H });
  ['firstName','lastName','username','addressLine1','addressLine2','zip','city','country'].forEach(k=>{
    if (user?.[k]!==undefined) F.elements[k].value = user[k] ?? '';
  });
}
F.addEventListener('submit', async e=>{
  e.preventDefault();
  const body = Object.fromEntries(new FormData(F).entries());
  try{
    await j(`${API}/auth/me`, { method:'PATCH', headers:H, body: JSON.stringify(body) });
    M.textContent='Profil mis à jour ✔';
  }catch(err){ M.textContent = err.message; }
});

async function loadOrders(){
  const list = await j(`${API}/orders/my`, { headers:H });
  const tb = $('#ordersTable tbody'); tb.innerHTML='';
  list.forEach(o=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(o.createdAt).toLocaleString()}</td>
    <td>CHF ${(o.amount/100).toFixed(2)}</td><td>${o.status}</td><td>${o.paymentMethod}</td>`;
    tb.appendChild(tr);
  });
}

loadMe(); loadOrders();
