const authState = {
  isLoggedIn: false,
  user: null
};

function persistSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function restoreAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    authState.isLoggedIn = true;
    authState.user = JSON.parse(user);
    updateAuthUI();
  }
}

async function handleRegister() {
  try {
    const payload = {
      name: document.getElementById('regName').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      password: document.getElementById('regPassword').value,
      phone: document.getElementById('regPhone').value.trim(),
      location: document.getElementById('regLocation').value.trim(),
      role: document.getElementById('regRole').value,
      skillType: document.getElementById('regSkillType').value,
      skills: document.getElementById('regSkills').value.split(',').map((item) => item.trim()).filter(Boolean),
      bio: document.getElementById('regBio').value.trim()
    };

    const result = await API.register(payload);
    authState.isLoggedIn = true;
    authState.user = result.user;
    persistSession(result.token, result.user);
    updateAuthUI();
    showNotification('Account created successfully');
    await refreshAppData();
    navigateTo('dashboard');
  } catch (error) {
    alert(error.message);
  }
}

async function handleLogin() {
  try {
    const result = await API.login({
      email: document.getElementById('loginEmail').value.trim(),
      password: document.getElementById('loginPassword').value
    });

    authState.isLoggedIn = true;
    authState.user = result.user;
    persistSession(result.token, result.user);
    updateAuthUI();
    showNotification('Login successful');
    await refreshAppData();
    navigateTo('dashboard');
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  authState.isLoggedIn = false;
  authState.user = null;
  clearSession();
  updateAuthUI();
  navigateTo('home');
  refreshAppData();
}

function toggleAuth() {
  if (authState.isLoggedIn) {
    logout();
    return;
  }
  navigateTo('auth');
}

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  if (!authBtn) return;

  authBtn.textContent = authState.isLoggedIn ? `Logout (${authState.user.name})` : 'Login';
}
