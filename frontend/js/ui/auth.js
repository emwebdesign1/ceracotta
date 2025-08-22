// Injecte deux onglets (login / register) dans #panel-compte et gère les appels API
const API = 'http://localhost:4000/api';

export function mountAuthPanel(){
  const root = document.getElementById('panel-compte');
  if (!root) return;

  // UI minimale si vide
  if (!root.querySelector('.auth-tabs')) {
    root.innerHTML = `
      <button class="close-btn" aria-label="Fermer">×</button>
      <div class="auth-tabs">
        <button class="tab active" data-tab="login">Se connecter</button>
        <button class="tab" data-tab="register">Créer un compte</button>
      </div>
      <div class="auth-views">
        <form id="loginView" class="auth-view active">
          <label>Email<input name="email" type="email" required></label>
          <label>Mot de passe<input name="password" type="password" required></label>
          <button class="btn primary" type="submit">Connexion</button>
          <div class="msg" id="loginMsg"></div>
        </form>
        <form id="registerView" class="auth-view">
          <div class="grid">
            <label>Prénom<input name="firstName"></label>
            <label>Nom<input name="lastName"></label>
          </div>
          <label>Nom d’utilisateur<input name="username"></label>
          <label>Email<input name="email" type="email" required></label>
          <label>Mot de passe<input name="password" type="password" required></label>
          <button class="btn primary" type="submit">Créer mon compte</button>
          <div class="msg" id="registerMsg"></div>
        </form>
      </div>
    ` + root.innerHTML;
  }

  const tabs = root.querySelectorAll('.tab');
  const views = root.querySelectorAll('.auth-view');
  tabs.forEach(t=>t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active')); t.classList.add('active');
    views.forEach(v=>v.classList.remove('active'));
    root.querySelector(`#${t.dataset.tab}View`).classList.add('active');
  }));

  const setToken = (t) => { localStorage.setItem('token', t); };

  root.querySelector('#loginView')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = { email:f.get('email'), password:f.get('password') };
    const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const d = await r.json();
    const msg = root.querySelector('#loginMsg');
    if (!r.ok) { msg.textContent = d.message||'Erreur connexion'; return; }
    setToken(d.accessToken);
    msg.textContent = 'Connecté ✔';
  });

  root.querySelector('#registerView')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(f.entries());
    const r = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const d = await r.json();
    const msg = root.querySelector('#registerMsg');
    if (!r.ok) { msg.textContent = d.message||'Erreur création compte'; return; }
    setToken(d.accessToken);
    msg.textContent = 'Compte créé ✔';
  });
}
