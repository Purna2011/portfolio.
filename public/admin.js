// Portfolio Control Center (Admin CMS) Application
let adminData = null;
let currentProjectId = null;
let currentProjectImages = [];
let pendingDeleteId = null;
let isDirty = false;
let pendingNavView = null;

// Initial bootstrap
document.addEventListener('DOMContentLoaded', () => {
  checkAuthAndInit();
  setupEventListeners();
});

function syncLiveStateLocally() {
  if (adminData) {
    try {
      localStorage.setItem('portfolio_live_state', JSON.stringify(adminData));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }
}

async function checkAuthAndInit() {
  // Load cached state first if available
  const cached = localStorage.getItem('portfolio_live_state');
  if (cached) {
    try {
      adminData = JSON.parse(cached);
    } catch (e) {}
  }

  try {
    const res = await fetch('/api/auth/session');
    const json = await res.json();
    if (json.authenticated) {
      showDashboard();
      await fetchAdminData();
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('admin-login-overlay').style.display = 'flex';
  document.getElementById('admin-dashboard-layout').style.display = 'none';
  if (window.lucide) lucide.createIcons();
}

function showDashboard() {
  document.getElementById('admin-login-overlay').style.display = 'none';
  document.getElementById('admin-dashboard-layout').style.display = 'flex';
  if (window.lucide) lucide.createIcons();
}

async function fetchAdminData() {
  const cached = localStorage.getItem('portfolio_live_state');
  if (cached) {
    try {
      adminData = JSON.parse(cached);
      renderAllViews();
    } catch (e) {}
  }

  try {
    const res = await fetch('/api/admin/data');
    if (!res.ok) {
      if (res.status === 401 && !cached) return showLogin();
      return;
    }
    const json = await res.json();
    if (json.success && json.data) {
      // Merge with local changes if present, or use server data
      if (!cached) {
        adminData = json.data;
        syncLiveStateLocally();
      }
      renderAllViews();
    }
  } catch (err) {
    console.warn('Offline / local mode active:', err);
    if (adminData) renderAllViews();
  }
}

function setupEventListeners() {
  // Login Form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const loginBtn = document.getElementById('login-btn');
      loginBtn.disabled = true;
      loginBtn.innerHTML = `<span>Authenticating...</span>`;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginForm['login-email'].value,
            password: loginForm['login-password'].value
          })
        });
        const json = await res.json();
        if (json.success) {
          showToast('✓ Authenticated successfully', 'success');
          showDashboard();
          await fetchAdminData();
        } else {
          showToast(json.error || 'Authentication failed', 'error');
        }
      } catch (err) {
        showToast('Network error during authentication', 'error');
      } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = `<i data-lucide="lock" style="width:16px;height:16px;"></i><span>Authenticate &amp; Open Control Center</span>`;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
      showToast('Logged out of control center', 'info');
      showLogin();
    });
  }

  // Nav Switcher with Unsaved Changes Guard
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = item.getAttribute('data-view');
      if (isDirty) {
        pendingNavView = viewId;
        openUnsavedChangesModal();
      } else {
        switchAdminView(viewId);
      }
    });
  });

  // Discard Unsaved Changes button in modal
  const discardBtn = document.getElementById('discard-changes-btn');
  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      isDirty = false;
      closeUnsavedChangesModal();
      if (pendingNavView) {
        switchAdminView(pendingNavView);
        pendingNavView = null;
      }
    });
  }

  // Profile Form Submit
  const profileForm = document.getElementById('profile-editor-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: profileForm.name.value,
        title: profileForm.title.value,
        headline: profileForm.headline.value,
        short_bio: profileForm.short_bio.value,
        email: profileForm.email.value,
        phone: profileForm.phone.value,
        location: profileForm.location.value,
        linkedin: profileForm.linkedin.value,
        github: profileForm.github.value,
        years_experience: profileForm.years_experience.value,
        projects_completed: profileForm.projects_completed.value,
        satisfaction_rate: profileForm.satisfaction_rate.value,
        open_to_work: profileForm.open_to_work.checked,
        status_text: profileForm.status_text.value
      };

      adminData = adminData || {};
      adminData.profile = { ...(adminData.profile || {}), ...payload };
      syncLiveStateLocally();
      isDirty = false;
      showToast('✓ Profile details saved and live on public site', 'success');

      try {
        await fetch('/api/admin/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('API save fallback:', err);
      }
    });
  }

  // About Form Submit
  const aboutForm = document.getElementById('about-editor-form');
  if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        about_headline: aboutForm.about_headline.value,
        about_text: aboutForm.about_text.value
      };

      adminData = adminData || {};
      adminData.profile = { ...(adminData.profile || {}), ...payload };
      syncLiveStateLocally();
      isDirty = false;
      showToast('✓ About Me content updated successfully', 'success');

      try {
        await fetch('/api/admin/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('API save fallback:', err);
      }
    });
  }

  // Project Form Submit
  const projForm = document.getElementById('project-form');
  if (projForm) {
    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('proj-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Saving project...</span>`;

      const id = document.getElementById('proj-edit-id').value;
      const techs = projForm.technologies.value.split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        id: id || ('proj-' + Date.now()),
        title: projForm.title.value,
        category: projForm.category.value || 'Data Analytics',
        short_description: projForm.short_description.value,
        full_description: projForm.full_description.value,
        technologies: techs,
        problem_statement: projForm.problem_statement.value,
        objective: projForm.objective.value,
        dataset: projForm.dataset.value,
        methodology: projForm.methodology.value,
        key_findings: projForm.key_findings.value,
        business_impact: projForm.business_impact.value,
        github_url: projForm.github_url.value,
        live_demo_url: projForm.live_demo_url.value,
        images: currentProjectImages.length > 0 ? currentProjectImages : ['assets/project-powerbi-1.svg'],
        featured: projForm.featured.checked,
        published: projForm.published.checked,
        _change_note: projForm.change_note.value
      };

      adminData = adminData || { projects: [] };
      if (id) {
        const idx = adminData.projects.findIndex(p => p.id === id);
        if (idx !== -1) adminData.projects[idx] = { ...adminData.projects[idx], ...payload };
      } else {
        adminData.projects.push(payload);
      }

      syncLiveStateLocally();
      isDirty = false;
      showToast(id ? '✓ Project updated & saved' : '✓ New project created & published successfully', 'success');
      closeProjectEditor();
      renderProjectsList(adminData.projects);
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i data-lucide="check" style="width:16px;height:16px;"></i><span>Save &amp; Publish Project</span>`;

      try {
        if (id) {
          await fetch(`/api/admin/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch('/api/admin/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        console.warn('API save fallback:', err);
      }
    });
  }

  // Delete Confirm Button
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!pendingDeleteId) return;
      if (adminData && adminData.projects) {
        adminData.projects = adminData.projects.filter(p => p.id !== pendingDeleteId);
        syncLiveStateLocally();
        renderProjectsList(adminData.projects);
      }
      showToast('✓ Project deleted from portfolio', 'success');
      closeDeleteConfirm();

      try {
        await fetch(`/api/admin/projects/${pendingDeleteId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('API delete fallback:', err);
      }
    });
  }

  // Helper: Client-side Image Compression & Resizing
  function compressImage(file, maxWidth = 1400, quality = 0.85) {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.size < 150 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Screenshot File Uploader
  const imgInput = document.getElementById('proj-image-file-input');
  if (imgInput) {
    imgInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      showToast(`Processing ${files.length} screenshot(s)...`, 'info');

      for (const file of files) {
        try {
          const dataUrl = await compressImage(file);
          let finalUrl = dataUrl;
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: file.name, data: dataUrl })
            });
            const json = await res.json();
            if (json.success && json.file_url) finalUrl = json.file_url;
          } catch (uploadErr) {
            console.warn('[Upload] Falling back to direct image data URL:', uploadErr);
          }

          currentProjectImages.push(finalUrl);
          renderScreenshotPreviews();
          isDirty = true;
          showToast(`✓ Added screenshot: ${file.name}`, 'success');
        } catch (err) {
          showToast(`Failed to process ${file.name}`, 'error');
        }
      }
      imgInput.value = '';
    });
  }

  // Resume File Uploader
  const resumeInput = document.getElementById('resume-file-input');
  if (resumeInput) {
    resumeInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showToast('Processing resume file...', 'info');

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const sizeKb = Math.round(file.size / 1024);
        let finalUrl = dataUrl;

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, data: dataUrl })
          });
          const uploadJson = await uploadRes.json();
          if (uploadJson.success && uploadJson.file_url) finalUrl = uploadJson.file_url;
        } catch (uploadErr) {}

        const resumePayload = {
          filename: file.name,
          file_url: finalUrl,
          last_updated: new Date().toISOString().split('T')[0],
          file_size: `${sizeKb} KB`
        };

        adminData = adminData || {};
        adminData.resume = resumePayload;
        syncLiveStateLocally();
        showToast('✓ Resume updated! Live "Download Resume" button updated.', 'success');
        renderResumeView(resumePayload);

        try {
          await fetch('/api/admin/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumePayload)
          });
        } catch (saveErr) {}
      };
      reader.readAsDataURL(file);
      resumeInput.value = '';
    });
  }

  // Track dirty state on inputs
  document.querySelectorAll('#profile-editor-form input, #profile-editor-form textarea, #about-editor-form textarea, #project-form input, #project-form textarea').forEach(el => {
    el.addEventListener('input', () => { isDirty = true; });
  });
}

function switchAdminView(viewId) {
  document.querySelectorAll('.admin-nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-view') === viewId);
  });
  document.querySelectorAll('.admin-view').forEach(el => {
    el.classList.toggle('active', el.id === viewId);
  });

  const titles = {
    'view-overview': 'Dashboard Overview',
    'view-profile': 'Personal Details & Branding',
    'view-about': 'About Me Narrative',
    'view-projects': 'Project Manager',
    'view-skills': 'Skills & Toolkit',
    'view-experience': 'Work Experience',
    'view-education': 'Academic Education',
    'view-certifications': 'Certifications & Credentials',
    'view-resume': 'Resume Manager',
    'view-settings': 'Site Settings & Cloud Sync'
  };

  const titleEl = document.getElementById('admin-view-title');
  if (titleEl) titleEl.textContent = titles[viewId] || 'Control Center';
  if (window.lucide) lucide.createIcons();
}

function renderAllViews() {
  if (!adminData) return;
  renderOverview(adminData);
  renderProfileForm(adminData.profile);
  renderAboutForm(adminData.profile);
  renderProjectsList(adminData.projects);
  renderSkillsList(adminData.skills);
  renderExperienceList(adminData.experience);
  renderEducationList(adminData.education);
  renderCertificationsList(adminData.certifications);
  renderResumeView(adminData.resume);
  renderSettingsForm(adminData.site_settings);
  if (window.lucide) lucide.createIcons();
}

function renderOverview(data) {
  const published = (data.projects || []).filter(p => p.published).length;
  const drafts = (data.projects || []).filter(p => !p.published).length;

  document.getElementById('stat-published-count').textContent = published;
  document.getElementById('stat-draft-count').textContent = drafts;
  document.getElementById('stat-skills-count').textContent = (data.skills || []).length;
  document.getElementById('stat-exp-count').textContent = (data.experience || []).length;
  document.getElementById('stat-certs-count').textContent = (data.certifications || []).length;
}

function renderProfileForm(profile) {
  if (!profile) return;
  const f = document.getElementById('profile-editor-form');
  if (!f) return;
  f.name.value = profile.name || '';
  f.title.value = profile.title || '';
  f.headline.value = profile.headline || '';
  f.short_bio.value = profile.short_bio || '';
  f.email.value = profile.email || '';
  f.phone.value = profile.phone || '';
  f.location.value = profile.location || '';
  f.linkedin.value = profile.linkedin || '';
  f.github.value = profile.github || '';
  f.years_experience.value = profile.years_experience || '';
  f.projects_completed.value = profile.projects_completed || '';
  f.satisfaction_rate.value = profile.satisfaction_rate || '';
  f.open_to_work.checked = !!profile.open_to_work;
  f.status_text.value = profile.status_text || '';
}

function renderAboutForm(profile) {
  if (!profile) return;
  const f = document.getElementById('about-editor-form');
  if (!f) return;
  f.about_headline.value = profile.about_headline || '';
  f.about_text.value = profile.about_text || '';
}

function renderProjectsList(projects) {
  const container = document.getElementById('admin-projects-list');
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);">No projects found. Click "+ Add New Project" to create one.</div>`;
    return;
  }

  container.innerHTML = projects.map((p, idx) => `
    <div class="admin-item-card" data-id="${p.id}">
      <div style="display:flex;align-items:center;gap:14px;flex:1;">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <button class="btn btn-secondary btn-sm" onclick="moveProject('${p.id}', -1)" ${idx === 0 ? 'disabled' : ''} style="padding:2px 6px;">▲</button>
          <button class="btn btn-secondary btn-sm" onclick="moveProject('${p.id}', 1)" ${idx === projects.length - 1 ? 'disabled' : ''} style="padding:2px 6px;">▼</button>
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <strong style="font-size:15px;color:var(--text-primary);">${escapeHtml(p.title)}</strong>
            <span style="font-size:11px;padding:2px 6px;border-radius:4px;font-weight:600;${p.published ? 'background:#F0FDF4;color:#15803D;' : 'background:#FEF3C7;color:#B45309;'}">${p.published ? 'Published' : 'Draft'}</span>
            ${p.featured ? `<span style="font-size:11px;padding:2px 6px;border-radius:4px;font-weight:600;background:#FFF7ED;color:#C2410C;">Featured</span>` : ''}
          </div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">
            ${escapeHtml(p.category || 'Data Analytics')} • Version ${p.version || 1}
          </div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="openProjectEditor('${p.id}')"><i data-lucide="edit-3" style="width:14px;height:14px;"></i><span>Edit</span></button>
        <button class="btn btn-danger btn-sm" onclick="openDeleteConfirm('${p.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function openProjectEditor(projectId = null) {
  currentProjectId = projectId;
  const modal = document.getElementById('project-modal');
  const form = document.getElementById('project-form');
  document.getElementById('proj-edit-id').value = projectId || '';

  if (projectId) {
    const p = (adminData.projects || []).find(proj => proj.id === projectId);
    if (!p) return;
    document.getElementById('proj-modal-title').textContent = 'Edit Case Study';
    form.title.value = p.title || '';
    form.category.value = p.category || 'Power BI & Business Intelligence';
    form.short_description.value = p.short_description || '';
    form.full_description.value = p.full_description || '';
    form.technologies.value = (p.technologies || []).join(', ');
    form.problem_statement.value = p.problem_statement || '';
    form.objective.value = p.objective || '';
    form.dataset.value = p.dataset || '';
    form.methodology.value = p.methodology || '';
    form.key_findings.value = p.key_findings || '';
    form.business_impact.value = p.business_impact || '';
    form.github_url.value = p.github_url || '';
    form.live_demo_url.value = p.live_demo_url || '';
    form.featured.checked = !!p.featured;
    form.published.checked = p.published !== false;
    currentProjectImages = p.images ? [...p.images] : [];
  } else {
    document.getElementById('proj-modal-title').textContent = 'Add New Project';
    form.reset();
    form.featured.checked = false;
    form.published.checked = true;
    currentProjectImages = [];
  }

  renderScreenshotPreviews();
  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeProjectEditor() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.classList.remove('active');
}

function renderScreenshotPreviews() {
  const container = document.getElementById('screenshot-previews-container');
  if (!container) return;

  if (currentProjectImages.length === 0) {
    container.innerHTML = `<span style="font-size:12px;color:var(--text-muted);">No screenshots uploaded yet.</span>`;
    return;
  }

  container.innerHTML = currentProjectImages.map((src, idx) => `
    <div class="screenshot-preview-card">
      <img src="${escapeHtml(src)}" alt="Screenshot ${idx + 1}">
      <button type="button" class="screenshot-remove-btn" onclick="removeScreenshot(${idx})">×</button>
    </div>
  `).join('');
}

function removeScreenshot(idx) {
  currentProjectImages.splice(idx, 1);
  renderScreenshotPreviews();
}

function openDeleteConfirm(id) {
  pendingDeleteId = id;
  const modal = document.getElementById('delete-confirm-modal');
  if (modal) modal.classList.add('active');
}

function closeDeleteConfirm() {
  pendingDeleteId = null;
  const modal = document.getElementById('delete-confirm-modal');
  if (modal) modal.classList.remove('active');
}

function moveProject(id, direction) {
  const projects = adminData.projects || [];
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= projects.length) return;

  const temp = projects[idx];
  projects[idx] = projects[targetIdx];
  projects[targetIdx] = temp;

  syncLiveStateLocally();
  renderProjectsList(projects);
}

// Skills List & CRUD
function renderSkillsList(skills) {
  const container = document.getElementById('admin-skills-list');
  if (!container) return;

  container.innerHTML = (skills || []).map(s => `
    <div class="admin-item-card">
      <div>
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(s.name)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(s.category)} • ${escapeHtml(s.level)}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="openSkillModal('${s.id}')"><i data-lucide="edit" style="width:14px;height:14px;"></i><span>Edit</span></button>
        <button class="btn btn-danger btn-sm" onclick="deleteSkill('${s.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      </div>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function openSkillModal(editId = null) {
  const form = document.getElementById('generic-item-form');
  const existing = editId ? (adminData.skills || []).find(s => s.id === editId) : null;
  document.getElementById('generic-modal-title').textContent = existing ? 'Edit Technical Skill' : 'Add Technical Skill';

  form.innerHTML = `
    <div class="form-group"><label class="form-label">Skill Name *</label><input type="text" name="name" required value="${existing ? escapeHtml(existing.name) : ''}" placeholder="e.g. SQL (MySQL, PostgreSQL)"></div>
    <div class="form-group"><label class="form-label">Category</label><input type="text" name="category" value="${existing ? escapeHtml(existing.category) : 'SQL & Databases'}" required></div>
    <div class="form-group"><label class="form-label">Proficiency Level</label><select name="level">
      <option value="Advanced" ${existing && existing.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
      <option value="Proficient" ${existing && existing.level === 'Proficient' ? 'selected' : ''}>Proficient</option>
      <option value="Familiar" ${existing && existing.level === 'Familiar' ? 'selected' : ''}>Familiar</option>
    </select></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${existing ? 'Update Skill' : 'Save Skill'}</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: existing ? existing.id : ('sk-' + Date.now()),
      name: form.name.value,
      category: form.category.value,
      level: form.level.value
    };

    adminData.skills = adminData.skills || [];
    if (existing) {
      const idx = adminData.skills.findIndex(s => s.id === existing.id);
      if (idx !== -1) adminData.skills[idx] = payload;
    } else {
      adminData.skills.push(payload);
    }

    syncLiveStateLocally();
    renderSkillsList(adminData.skills);
    closeGenericModal();
    showToast(existing ? '✓ Skill updated' : '✓ Skill added', 'success');

    try {
      await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData.skills)
      });
    } catch (err) {}
  };

  document.getElementById('generic-item-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

async function deleteSkill(id) {
  if (!confirm('Delete this skill?')) return;
  adminData.skills = (adminData.skills || []).filter(s => s.id !== id);
  syncLiveStateLocally();
  renderSkillsList(adminData.skills);
  showToast('✓ Skill deleted', 'success');

  try { await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' }); } catch (err) {}
}

// Experience List & CRUD
function renderExperienceList(exps) {
  const container = document.getElementById('admin-experience-list');
  if (!container) return;

  container.innerHTML = (exps || []).map(e => `
    <div class="admin-item-card">
      <div style="flex:1;">
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(e.role)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(e.company)} • ${escapeHtml(e.start_date || '')} - ${e.current ? 'Present' : escapeHtml(e.end_date || '')}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="openExperienceModal('${e.id}')"><i data-lucide="edit" style="width:14px;height:14px;"></i><span>Edit</span></button>
        <button class="btn btn-danger btn-sm" onclick="deleteExperience('${e.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      </div>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function openExperienceModal(editId = null) {
  const form = document.getElementById('generic-item-form');
  const existing = editId ? (adminData.experience || []).find(e => e.id === editId) : null;
  document.getElementById('generic-modal-title').textContent = existing ? 'Edit Work Experience' : 'Add Work Experience';

  const bulletsText = existing && existing.responsibilities ? existing.responsibilities.join('\n') : '';

  form.innerHTML = `
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Role Title *</label><input type="text" name="role" required value="${existing ? escapeHtml(existing.role) : ''}" placeholder="Data & Product Analyst Intern"></div>
      <div class="form-group"><label class="form-label">Organization / Company *</label><input type="text" name="company" required value="${existing ? escapeHtml(existing.company) : ''}" placeholder="DigitalEdify"></div>
    </div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Start Date</label><input type="text" name="start_date" value="${existing ? escapeHtml(existing.start_date || '') : ''}" placeholder="Jul 2025"></div>
      <div class="form-group"><label class="form-label">End Date</label><input type="text" name="end_date" value="${existing ? escapeHtml(existing.end_date || '') : ''}" placeholder="Feb 2026"></div>
    </div>
    <div class="form-group"><label class="form-label">Summary Description</label><textarea name="description" rows="2">${existing ? escapeHtml(existing.description || '') : ''}</textarea></div>
    <div class="form-group"><label class="form-label">Achievements & Responsibilities (one bullet per line)</label><textarea name="responsibilities" rows="4" placeholder="Analyzed 1M+ records...&#10;Reduced fraud risks by 30%...">${bulletsText}</textarea></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${existing ? 'Update Experience' : 'Save Experience'}</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const bullets = form.responsibilities.value.split('\n').map(b => b.trim()).filter(Boolean);
    const expPayload = {
      id: existing ? existing.id : ('exp-' + Date.now()),
      role: form.role.value,
      company: form.company.value,
      start_date: form.start_date.value,
      end_date: form.end_date.value,
      description: form.description.value,
      responsibilities: bullets,
      technologies: existing ? existing.technologies : ['SQL', 'Excel', 'Power BI']
    };

    adminData.experience = adminData.experience || [];
    if (existing) {
      const idx = adminData.experience.findIndex(e => e.id === existing.id);
      if (idx !== -1) adminData.experience[idx] = expPayload;
    } else {
      adminData.experience.push(expPayload);
    }

    syncLiveStateLocally();
    renderExperienceList(adminData.experience);
    closeGenericModal();
    showToast(existing ? '✓ Experience updated & saved' : '✓ Experience added & saved', 'success');

    try {
      await fetch('/api/admin/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData.experience)
      });
    } catch (err) {}
  };

  document.getElementById('generic-item-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

async function deleteExperience(id) {
  if (!confirm('Delete this experience entry?')) return;
  adminData.experience = (adminData.experience || []).filter(e => e.id !== id);
  syncLiveStateLocally();
  renderExperienceList(adminData.experience);
  showToast('✓ Experience deleted', 'success');

  try { await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' }); } catch (err) {}
}

// Education List & CRUD
function renderEducationList(edus) {
  const container = document.getElementById('admin-education-list');
  if (!container) return;

  container.innerHTML = (edus || []).map(ed => `
    <div class="admin-item-card">
      <div style="flex:1;">
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(ed.degree)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(ed.institution)} • ${escapeHtml(ed.grade || '')}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="openEducationModal('${ed.id}')"><i data-lucide="edit" style="width:14px;height:14px;"></i><span>Edit</span></button>
        <button class="btn btn-danger btn-sm" onclick="deleteEducation('${ed.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      </div>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function openEducationModal(editId = null) {
  const form = document.getElementById('generic-item-form');
  const existing = editId ? (adminData.education || []).find(ed => ed.id === editId) : null;
  document.getElementById('generic-modal-title').textContent = existing ? 'Edit Education' : 'Add Education';

  form.innerHTML = `
    <div class="form-group"><label class="form-label">Degree *</label><input type="text" name="degree" required value="${existing ? escapeHtml(existing.degree) : ''}" placeholder="B.Tech in Computer Science"></div>
    <div class="form-group"><label class="form-label">Institution *</label><input type="text" name="institution" required value="${existing ? escapeHtml(existing.institution) : ''}" placeholder="University Name"></div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Duration</label><input type="text" name="start_date" value="${existing ? escapeHtml(existing.start_date || '') : ''}" placeholder="2021 - 2025"></div>
      <div class="form-group"><label class="form-label">Grade / CGPA</label><input type="text" name="grade" value="${existing ? escapeHtml(existing.grade || '') : ''}" placeholder="7.49 / 10 CGPA"></div>
    </div>
    <div class="form-group"><label class="form-label">Description</label><textarea name="description" rows="2">${existing ? escapeHtml(existing.description || '') : ''}</textarea></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${existing ? 'Update Education' : 'Save Education'}</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: existing ? existing.id : ('edu-' + Date.now()),
      degree: form.degree.value,
      institution: form.institution.value,
      start_date: form.start_date.value,
      grade: form.grade.value,
      description: form.description.value
    };

    adminData.education = adminData.education || [];
    if (existing) {
      const idx = adminData.education.findIndex(ed => ed.id === existing.id);
      if (idx !== -1) adminData.education[idx] = payload;
    } else {
      adminData.education.push(payload);
    }

    syncLiveStateLocally();
    renderEducationList(adminData.education);
    closeGenericModal();
    showToast(existing ? '✓ Education updated' : '✓ Education added', 'success');

    try {
      await fetch('/api/admin/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData.education)
      });
    } catch (err) {}
  };

  document.getElementById('generic-item-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

async function deleteEducation(id) {
  if (!confirm('Delete this education entry?')) return;
  adminData.education = (adminData.education || []).filter(ed => ed.id !== id);
  syncLiveStateLocally();
  renderEducationList(adminData.education);
  showToast('✓ Education deleted', 'success');

  try { await fetch(`/api/admin/education/${id}`, { method: 'DELETE' }); } catch (err) {}
}

// Certifications List & CRUD
function renderCertificationsList(certs) {
  const container = document.getElementById('admin-certifications-list');
  if (!container) return;

  container.innerHTML = (certs || []).map(c => `
    <div class="admin-item-card">
      <div style="flex:1;">
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(c.title)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(c.issuer)} • Issued: ${escapeHtml(c.issue_date || '')}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="openCertificationModal('${c.id}')"><i data-lucide="edit" style="width:14px;height:14px;"></i><span>Edit</span></button>
        <button class="btn btn-danger btn-sm" onclick="deleteCertification('${c.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      </div>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function openCertificationModal(editId = null) {
  const form = document.getElementById('generic-item-form');
  const existing = editId ? (adminData.certifications || []).find(c => c.id === editId) : null;
  document.getElementById('generic-modal-title').textContent = existing ? 'Edit Certification' : 'Add Certification';

  form.innerHTML = `
    <div class="form-group"><label class="form-label">Certification Title *</label><input type="text" name="title" required value="${existing ? escapeHtml(existing.title) : ''}" placeholder="Data Analytics & Visualization"></div>
    <div class="form-group"><label class="form-label">Issuing Organization *</label><input type="text" name="issuer" required value="${existing ? escapeHtml(existing.issuer) : ''}" placeholder="Accenture / IBM"></div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Issue Date</label><input type="text" name="issue_date" value="${existing ? escapeHtml(existing.issue_date || '') : ''}" placeholder="Verified"></div>
      <div class="form-group"><label class="form-label">Credential ID</label><input type="text" name="credential_id" value="${existing ? escapeHtml(existing.credential_id || '') : ''}" placeholder="ID (optional)"></div>
    </div>
    <div class="form-group"><label class="form-label">Verification URL</label><input type="url" name="verification_url" value="${existing ? escapeHtml(existing.verification_url || '') : ''}" placeholder="https://..."></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">${existing ? 'Update Certification' : 'Save Certification'}</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: existing ? existing.id : ('cert-' + Date.now()),
      title: form.title.value,
      issuer: form.issuer.value,
      issue_date: form.issue_date.value,
      credential_id: form.credential_id.value,
      verification_url: form.verification_url.value,
      image_url: 'assets/badge-microsoft.svg'
    };

    adminData.certifications = adminData.certifications || [];
    if (existing) {
      const idx = adminData.certifications.findIndex(c => c.id === existing.id);
      if (idx !== -1) adminData.certifications[idx] = payload;
    } else {
      adminData.certifications.push(payload);
    }

    syncLiveStateLocally();
    renderCertificationsList(adminData.certifications);
    closeGenericModal();
    showToast(existing ? '✓ Certification updated' : '✓ Certification added', 'success');

    try {
      await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData.certifications)
      });
    } catch (err) {}
  };

  document.getElementById('generic-item-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

async function deleteCertification(id) {
  if (!confirm('Delete this certification?')) return;
  adminData.certifications = (adminData.certifications || []).filter(c => c.id !== id);
  syncLiveStateLocally();
  renderCertificationsList(adminData.certifications);
  showToast('✓ Certification deleted', 'success');

  try { await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' }); } catch (err) {}
}

function renderResumeView(resume) {
  if (!resume) return;
  const nameEl = document.getElementById('active-resume-name');
  if (nameEl) nameEl.textContent = resume.filename || 'Purna_Satya_Kumar_Raavi_Resume.pdf';
  const metaEl = document.getElementById('active-resume-meta');
  if (metaEl) metaEl.textContent = `Updated: ${resume.last_updated || '2026-08-22'} • Size: ${resume.file_size || '245 KB'}`;
  const downloadBtn = document.getElementById('active-resume-download-btn');
  if (downloadBtn && resume.file_url) {
    downloadBtn.href = resume.file_url;
    downloadBtn.setAttribute('download', resume.filename || 'Purna_Satya_Kumar_Raavi_Resume.pdf');
  }
}

function renderSettingsForm(settings) {
  if (!settings) return;
  const f = document.getElementById('site-settings-form');
  if (!f) return;
  f.site_title.value = settings.site_title || '';
  f.admin_email.value = settings.admin_email || '';
  f.supabase_url.value = settings.supabase_url || '';
  f.supabase_anon_key.value = settings.supabase_anon_key || '';
  f.enable_supabase_sync.checked = !!settings.enable_supabase_sync;
}

function exportDataJson() {
  if (!adminData) return;
  const jsonStr = JSON.stringify(adminData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'default-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✓ default-data.json downloaded! You can upload it to GitHub anytime.', 'success');
}

function closeGenericModal() {
  const modal = document.getElementById('generic-item-modal');
  if (modal) modal.classList.remove('active');
}

function openUnsavedChangesModal() {
  const modal = document.getElementById('unsaved-changes-modal');
  if (modal) modal.classList.add('active');
}

function closeUnsavedChangesModal() {
  const modal = document.getElementById('unsaved-changes-modal');
  if (modal) modal.classList.remove('active');
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${escapeHtml(msg)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
