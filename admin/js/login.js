function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toast');
  const item = document.createElement('div');
  item.className = `toast toast-${type}`;
  item.textContent = msg;
  wrap.appendChild(item);

  setTimeout(() => {
    item.style.opacity = 0;
    setTimeout(() => wrap.removeChild(item), 300);
  }, 3000);
}

async function checkAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) return; 

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'verify' })
    });

    if (res.ok) {
      window.location.href = '/admin/dashboard';
    }
  } catch {}
}


checkAuth();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        username,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Login failed', 'error');
      throw new Error();
    }

    localStorage.setItem('auth_token', data.token);
    showToast('Login success!', 'success');

    setTimeout(() => {
      window.location.href = '/admin/dashboard';
    }, 500);

  } catch {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
  }
});
