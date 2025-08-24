import { register } from '/js/api.js';

const form = document.getElementById('register-form');
const msg = document.getElementById('reg-msg');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  payload.newsletter = !!fd.get('newsletter');

  msg.textContent = 'Création du compte…';
  const res = await register(payload);
  if (res?.user) {
    msg.textContent = 'Compte créé ✓';
    // si admin => redir admin, sinon account
    if (res.user.role === 'ADMIN') location.href = '/admin.html';
    else location.href = '/account.html';
  } else {
    msg.textContent = res?.message || 'Erreur';
  }
});
