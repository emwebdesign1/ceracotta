// /js/ui/userMenu.js
import { state } from '/js/state.js';

export function mountUserMenu() {
  const link = document.getElementById('open-compte');
  if (!link) return;

  // inject badge pseudo à droite de l’icône
  let nameTag = document.getElementById('user-shortname');
  if (!nameTag) {
    nameTag = document.createElement('span');
    nameTag.id = 'user-shortname';
    nameTag.style.marginLeft = '6px';
    nameTag.style.color = '#7f0000';
    nameTag.style.fontWeight = '700';
    link.parentElement?.appendChild(nameTag);
  }

  const render = () => {
    if (state.user?.username) nameTag.textContent = state.user.username;
    else nameTag.textContent = '';
  };
  render();

  // quand on clique sur l’icône
  link.onclick = (e) => {
    e.preventDefault();
    if (state.user) {
      if (state.user.role === 'ADMIN') location.href = '/admin.html';
      else location.href = '/account.html';
    } else {
      // ouvre le side-panel de connexion (géré par shell/boot)
      document.getElementById('panel-compte')?.classList.add('active');
      document.getElementById('overlay')?.classList.add('active');
    }
  };

  document.addEventListener('auth:changed', render);
}
