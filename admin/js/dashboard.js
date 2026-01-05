let isSubmittingProject = false;
let isSubmittingCert = false;

function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toast');
  if (!wrap) return;

  const item = document.createElement('div');
  item.className = `toast toast-${type}`;
  item.textContent = msg;
  wrap.appendChild(item);

  setTimeout(() => {
    item.style.opacity = 0;
    setTimeout(() => wrap.removeChild(item), 300);
  }, 3000);
}

function getToken() {
  return localStorage.getItem('auth_token');
}

async function apiCall(url, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = 'index.html';
    throw new Error('No token');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = 'index.html';
    throw new Error('Unauthorized');
  }

  return res;
}

async function checkAuth() {
  try {
    const res = await apiCall('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify' })
    });
    const data = await res.json();
    const el = document.getElementById('userName');
    if (el) el.textContent = `Sovereign ${data.user.username}`;
  } catch {}
}

checkAuth();

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await apiCall('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'logout' })
      });
    } finally {
      localStorage.removeItem('auth_token');
      window.location.href = 'index.html';
    }
  });
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {

    if (item.hasAttribute('data-section')) {
      
      const section = item.dataset.section;

      document.querySelectorAll('.nav-item[data-section]').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.content-section').forEach(s => (s.style.display = 'none'));
      const target = document.getElementById(`${section}Section`);
      if (target) target.style.display = 'block';
    } 
  });
});

let editingProjectId = null;

function updateDashboardStats(projects, certs) {
  const pCount = document.getElementById('countProjects');
  const cCount = document.getElementById('countCerts');
  const fCount = document.getElementById('countFeatured');

  if (pCount) pCount.textContent = projects.length;
  if (cCount) cCount.textContent = certs.length;
  if (fCount) fCount.textContent = projects.filter(p => p.is_featured).length;
}

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

const skeletonHTML = Array(3).fill(0).map(() => `
  <div class="skeleton-card">
    <div class="skeleton skeleton-img"></div>
    <div class="skeleton-content">
      <div class="skeleton" style="width: 70%; height: 24px; border-radius: 6px;"></div>
      <div class="skeleton" style="width: 100%; height: 16px; border-radius: 4px;"></div>
      <div class="skeleton" style="width: 90%; height: 16px; border-radius: 4px;"></div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <div class="skeleton" style="width: 60px; height: 32px; border-radius: 8px;"></div>
        <div class="skeleton" style="width: 60px; height: 32px; border-radius: 8px;"></div>
      </div>
    </div>
  </div>
`).join('');

grid.innerHTML = skeletonHTML;
  try {
    const [res] = await Promise.all([
      apiCall('/api/projects'),
      new Promise(resolve => setTimeout(resolve, 400)) 
    ]);
    const data = await res.json();

    if (!data.projects.length) {
      grid.innerHTML = '<p style="color:var(--text-dim)">No projects yet.</p>';
      return;
    }

    loadCertificates().then(certData => {
     updateDashboardStats(data.projects, certData || []);
  });

    grid.innerHTML = data.projects.map(p => `
      <div class="item-card" style="position: relative;">
        ${p.is_featured ? '<span class="badge-featured">Featured</span>' : ''}
        <img src="${p.image_url}" class="item-image" />
        <div class="item-body">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="item-actions">
            <button class="btn-edit-alt" onclick="editProject(${p.id}, this)">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button class="btn-delete-alt" onclick="deleteProject(${p.id})">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showToast('Failed to load projects', 'error');
  }
}

const addProjectBtn = document.getElementById('addProjectBtn');
if (addProjectBtn) {
  addProjectBtn.addEventListener('click', () => {
    editingProjectId = null;
    document.getElementById('projectModalTitle').textContent = 'Add Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectModal').classList.add('active');
  });
}

['projectModalClose', 'projectCancelBtn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => document.getElementById('projectModal').classList.remove('active'));
});

const projectForm = document.getElementById('projectForm');
if (projectForm) {
  projectForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (isSubmittingProject) return;
    isSubmittingProject = true;

    const submitBtn = projectForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    let image_url = document.getElementById('projectImage').value.trim();
    if (image_url) {
      image_url = image_url.replace(/\\/g, '/');
      if (!image_url.startsWith('/')) image_url = '/' + image_url;
    }

    const payload = {
      title: document.getElementById('projectTitle').value,
      description: document.getElementById('projectDesc').value,
      image_url,
      github_link: document.getElementById('projectGithub').value,
      demo_link: document.getElementById('projectDemo').value,
      tags: document.getElementById('projectTags').value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      is_featured: document.getElementById('projectFeatured').checked
    };

    try {
      const url = editingProjectId
        ? `/api/project?id=${editingProjectId}`
        : '/api/project';

      const method = editingProjectId ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      showToast('Project saved', 'success');
      document.getElementById('projectModal').classList.remove('active');
      loadProjects();
    } catch {
      showToast('Failed to save project', 'error');
    } finally {
      isSubmittingProject = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Project';
      }
    }
  });
}


window.editProject = async (id, btnElement) => {
  const originalContent = btnElement.innerHTML;
  btnElement.disabled = true;
  btnElement.classList.add('btn-loading');
  btnElement.innerHTML = '<span class="spinner"></span> Loading...';

  try {
    const res = await apiCall(`/api/project?id=${id}`);
    const { project } = await res.json();

    editingProjectId = id;
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    
    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectDesc').value = project.description;
    document.getElementById('projectImage').value = project.image_url?.startsWith('/') 
      ? project.image_url.slice(1) : project.image_url;
    document.getElementById('projectGithub').value = project.github_link || '';
    document.getElementById('projectDemo').value = project.demo_link || '';
    document.getElementById('projectTags').value = (project.tags || []).join(', ');
    document.getElementById('projectFeatured').checked = project.is_featured;

    document.getElementById('projectModal').classList.add('active');
  } catch (err) {
    showToast('Failed to load project', 'error');
  } finally {

    btnElement.disabled = false;
    btnElement.classList.remove('btn-loading');
    btnElement.innerHTML = originalContent;
  }
};

window.deleteProject = async id => {
  if (!confirm('Delete this project?')) return;
  try {
    await apiCall(`/api/project?id=${id}`, { method: 'DELETE' });
    showToast('Project deleted', 'success');
    loadProjects();
  } catch {
    showToast('Failed to delete project', 'error');
  }
};

loadProjects();


let editingCertId = null;

async function loadCertificates() {
  const grid = document.getElementById('certificatesGrid');
  if (!grid) return;

const skeletonHTML = Array(3).fill(0).map(() => `
  <div class="skeleton-card">
    <div class="skeleton skeleton-img"></div>
    <div class="skeleton-content">
      <div class="skeleton" style="width: 70%; height: 24px; border-radius: 6px;"></div>
      <div class="skeleton" style="width: 100%; height: 16px; border-radius: 4px;"></div>
      <div class="skeleton" style="width: 90%; height: 16px; border-radius: 4px;"></div>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <div class="skeleton" style="width: 60px; height: 32px; border-radius: 8px;"></div>
        <div class="skeleton" style="width: 60px; height: 32px; border-radius: 8px;"></div>
      </div>
    </div>
  </div>
`).join('');

grid.innerHTML = skeletonHTML;

  try {
    const res = await apiCall('/api/certificates');
    const data = await res.json();

    const grid = document.getElementById('certificatesGrid');
    if (!grid) return;

    const countEl = document.getElementById('countCerts');
    if (countEl) countEl.textContent = data.certificates.length;

    if (!data.certificates.length) {
      grid.innerHTML = '<p style="color:var(--text-dim)">No certificates yet.</p>';
      return;
    }

    grid.innerHTML = data.certificates
      .map(
        c => `
      <div class="item-card">
        <div class="item-badge" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; position: absolute; top: 10px; right: 10px; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: bold;">
          CERTIFIED
        </div>
        <img src="${c.thumbnail_url}" class="item-image" />
        <div class="item-body">
          <div class="item-category" style="color: var(--primary); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">
            ${c.issuer || 'Professional Certificate'}
          </div>
          <h3 style="margin-bottom: 15px;">${c.title}</h3>
          
          <div class="item-actions">
            <button class="btn-edit-alt" onclick="editCert(${c.id}, this)">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn-delete-alt" onclick="deleteCert(${c.id})">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
      
    return data.certificates; 
  } catch {
    showToast('Failed to load certificates', 'error');
  }
}

const addCertBtn = document.getElementById('addCertBtn');
if (addCertBtn) {
  addCertBtn.addEventListener('click', () => {
    editingCertId = null;
    document.getElementById('certModalTitle').textContent = 'Add Certificate';
    document.getElementById('certForm').reset();
    document.getElementById('certModal').classList.add('active');
  });
}

['certModalClose', 'certCancelBtn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => {
    document.getElementById('certModal').classList.remove('active');
  });
});

const certForm = document.getElementById('certForm');
if (certForm) {
  certForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (isSubmittingCert) return;
    isSubmittingCert = true;

    const submitBtn = certForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    let thumbnail_url = document.getElementById('certThumbPath').value.trim();
    let pdf_url = document.getElementById('certPdfPath').value.trim();

    [thumbnail_url, pdf_url] = [thumbnail_url, pdf_url].map(p => {
      if (!p) return '';
      p = p.replace(/\\/g, '/');
      return p.startsWith('/') ? p : '/' + p;
    });

    const payload = {
      title: document.getElementById('certTitle').value,
      issuer: document.getElementById('certIssuer').value,
      thumbnail_url,
      pdf_url
    };

    try {
      const url = editingCertId
        ? `/api/certificate?id=${editingCertId}`
        : '/api/certificate';

      const method = editingCertId ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      showToast('Certificate saved', 'success');
      document.getElementById('certModal').classList.remove('active');
      loadCertificates();
    } catch {
      showToast('Failed to save certificate', 'error');
    } finally {
      isSubmittingCert = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Certificate';
      }
    }
  });
}

window.editCert = async (id, btnElement) => {
  const originalContent = btnElement.innerHTML;
  btnElement.disabled = true;
  btnElement.classList.add('btn-loading');
  btnElement.innerHTML = '<span class="spinner"></span> Loading...';

  try {
    const res = await apiCall(`/api/certificate?id=${id}`);
    const { certificate } = await res.json();

    editingCertId = id;
    document.getElementById('certModalTitle').textContent = 'Edit Certificate';
    document.getElementById('certTitle').value = certificate.title;
    document.getElementById('certIssuer').value = certificate.issuer || '';
    document.getElementById('certThumbPath').value = certificate.thumbnail_url?.startsWith('/') 
      ? certificate.thumbnail_url.slice(1) : certificate.thumbnail_url;
    document.getElementById('certPdfPath').value = certificate.pdf_url?.startsWith('/') 
      ? certificate.pdf_url.slice(1) : certificate.pdf_url;

    document.getElementById('certModal').classList.add('active');
  } catch (err) {
    showToast('Failed to load certificate', 'error');
  } finally {
    btnElement.disabled = false;
    btnElement.classList.remove('btn-loading');
    btnElement.innerHTML = originalContent;
  }
};

window.deleteCert = async id => {
  if (!confirm('Delete this certificate?')) return;
  try {
    await apiCall(`/api/certificate?id=${id}`, { method: 'DELETE' });
    showToast('Certificate deleted', 'success');
    loadCertificates();
  } catch {
    showToast('Failed to delete certificate', 'error');
  }
};

loadCertificates();


