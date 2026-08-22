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

async function checkAuthAndInit() {
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
  try {
    const res = await fetch('/api/admin/data');
    if (!res.ok) {
      if (res.status === 401) return showLogin();
      throw new Error('Failed to load admin data');
    }
    const json = await res.json();
    if (json.success && json.data) {
      adminData = json.data;
      renderAllViews();
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to load portfolio control data', 'error');
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

  // Logout Button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
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

      try {
        const res = await fetch('/api/admin/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          isDirty = false;
          showToast('✓ Profile details saved and live on public site', 'success');
          await fetchAdminData();
        } else {
          showToast(json.error || 'Failed to save profile', 'error');
        }
      } catch (err) {
        showToast('Error saving profile', 'error');
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

      try {
        const res = await fetch('/api/admin/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          isDirty = false;
          showToast('✓ About Me content updated successfully', 'success');
          await fetchAdminData();
        } else {
          showToast(json.error || 'Failed to save about content', 'error');
        }
      } catch (err) {
        showToast('Error saving about content', 'error');
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
        images: currentProjectImages.length > 0 ? currentProjectImages : ['assets/project-sql-1.svg'],
        featured: projForm.featured.checked,
        published: projForm.published.checked,
        _change_note: projForm.change_note.value
      };

      try {
        let res;
        if (id) {
          res = await fetch(`/api/admin/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/api/admin/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
        const json = await res.json();
        if (json.success) {
          isDirty = false;
          showToast(id ? '✓ Project updated & version snapshot logged' : '✓ New project created & published successfully', 'success');
          closeProjectEditor();
          await fetchAdminData();
        } else {
          showToast(json.error || 'Failed to save project', 'error');
        }
      } catch (err) {
        showToast('Network error while saving project', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="check" style="width:16px;height:16px;"></i><span>Save &amp; Publish Project</span>`;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Delete Confirm Button
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!pendingDeleteId) return;
      try {
        const res = await fetch(`/api/admin/projects/${pendingDeleteId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          showToast('✓ Project deleted from portfolio', 'success');
          closeDeleteConfirm();
          await fetchAdminData();
        } else {
          showToast(json.error || 'Failed to delete project', 'error');
        }
      } catch (err) {
        showToast('Error deleting project', 'error');
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

  // Screenshot File Uploader (Works reliably on Local, Vercel, Render, Netlify)
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
            if (json.success && json.file_url) {
              finalUrl = json.file_url;
            }
          } catch (uploadErr) {
            console.warn('[Upload] Falling back to direct image data URL:', uploadErr);
          }

          currentProjectImages.push(finalUrl);
          renderScreenshotPreviews();
          isDirty = true;
          showToast(`✓ Added screenshot: ${file.name}`, 'success');
        } catch (err) {
          console.error(err);
          showToast(`Failed to process ${file.name}`, 'error');
        }
      }
      imgInput.value = '';
    });
  }

  // Resume File Uploader (Works reliably on Local, Vercel, Render, Netlify)
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
          if (uploadJson.success && uploadJson.file_url) {
            finalUrl = uploadJson.file_url;
          }
        } catch (uploadErr) {
          console.warn('[Upload] Using direct PDF Data URL for resume:', uploadErr);
        }

        try {
          const updateRes = await fetch('/api/admin/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_url: finalUrl,
              last_updated: new Date().toISOString().split('T')[0],
              file_size: `${sizeKb} KB`
            })
          });
          const updateJson = await updateRes.json();
          if (updateRes.ok && updateJson.success) {
            showToast('✓ Active resume updated! Live "Download Resume" button updated.', 'success');
            await fetchAdminData();
          } else {
            showToast('Failed to save resume settings', 'error');
          }
        } catch (saveErr) {
          showToast('Failed to update resume', 'error');
        }
      };
      reader.readAsDataURL(file);
      resumeInput.value = '';
    });
  }

  // Change Password Form
  const passForm = document.getElementById('change-password-form');
  if (passForm) {
    passForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_password: passForm.current_password.value,
            new_password: passForm.new_password.value
          })
        });
        const json = await res.json();
        if (json.success) {
          showToast('✓ Admin password updated successfully', 'success');
          passForm.reset();
        } else {
          showToast(json.error || 'Failed to update password', 'error');
        }
      } catch (err) {
        showToast('Error updating password', 'error');
      }
    });
  }

  // Supabase Settings Form
  const sbForm = document.getElementById('supabase-settings-form');
  if (sbForm) {
    sbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabase_url: sbForm.supabase_url.value,
            supabase_anon_key: sbForm.supabase_anon_key.value,
            enable_supabase_sync: sbForm.enable_supabase_sync.checked
          })
        });
        const json = await res.json();
        if (json.success) {
          showToast('✓ Cloud synchronization settings saved', 'success');
        }
      } catch (err) {
        showToast('Failed to save settings', 'error');
      }
    });
  }

  // Track dirty changes
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', () => { isDirty = true; });
  });
}

function switchAdminView(viewId) {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewId);
  });

  document.querySelectorAll('.admin-view').forEach(view => {
    view.classList.toggle('active', view.id === viewId);
  });

  const titleMap = {
    'view-overview': 'Dashboard Overview',
    'view-profile': 'Personal Details & Branding',
    'view-about': 'About Me Narrative',
    'view-projects': 'Project Manager',
    'view-skills': 'Technical Skills Matrix',
    'view-experience': 'Work Experience',
    'view-education': 'Education',
    'view-certifications': 'Certifications',
    'view-resume': 'Resume Manager',
    'view-settings': 'Settings & Cloud Sync'
  };

  const titleEl = document.getElementById('admin-view-title');
  if (titleEl) titleEl.textContent = titleMap[viewId] || 'Control Center';

  if (window.lucide) lucide.createIcons();
}

function renderAllViews() {
  if (!adminData) return;

  // 1. Overview Counters
  const pubCount = (adminData.projects || []).filter(p => p.published).length;
  const draftCount = (adminData.projects || []).filter(p => !p.published).length;
  document.getElementById('stat-published-count').textContent = pubCount;
  document.getElementById('stat-draft-count').textContent = draftCount;
  document.getElementById('stat-skills-count').textContent = (adminData.skills || []).length;
  document.getElementById('stat-exp-count').textContent = (adminData.experience || []).length;
  document.getElementById('stat-certs-count').textContent = (adminData.certifications || []).length;

  // 2. Profile form fields
  const p = adminData.profile || {};
  const profForm = document.getElementById('profile-editor-form');
  if (profForm) {
    profForm.name.value = p.name || '';
    profForm.title.value = p.title || '';
    profForm.headline.value = p.headline || '';
    profForm.short_bio.value = p.short_bio || '';
    profForm.email.value = p.email || '';
    profForm.phone.value = p.phone || '';
    profForm.location.value = p.location || '';
    profForm.linkedin.value = p.linkedin || '';
    profForm.github.value = p.github || '';
    profForm.years_experience.value = p.years_experience || '2+';
    profForm.projects_completed.value = p.projects_completed || '15+';
    profForm.satisfaction_rate.value = p.satisfaction_rate || '99%';
    profForm.open_to_work.checked = !!p.open_to_work;
    profForm.status_text.value = p.status_text || '';
  }

  // 3. About form fields
  const aboutForm = document.getElementById('about-editor-form');
  if (aboutForm) {
    aboutForm.about_headline.value = p.about_headline || '';
    aboutForm.about_text.value = p.about_text || '';
  }

  // 4. Projects list
  renderProjectsList(adminData.projects || []);

  // 5. Skills list
  renderSkillsList(adminData.skills || []);

  // 6. Experience list
  renderExperienceList(adminData.experience || []);

  // 7. Education list
  renderEducationList(adminData.education || []);

  // 8. Certifications list
  renderCertificationsList(adminData.certifications || []);

  // 9. Resume info
  if (adminData.resume) {
    const r = adminData.resume;
    const nameEl = document.getElementById('resume-current-filename');
    if (nameEl) nameEl.textContent = r.filename || 'Resume.pdf';
    const dateEl = document.getElementById('resume-last-updated');
    if (dateEl) dateEl.textContent = r.last_updated || '2026-08-15';
    const sizeEl = document.getElementById('resume-filesize');
    if (sizeEl) sizeEl.textContent = r.file_size || '245 KB';
    const dlLink = document.getElementById('resume-test-download');
    if (dlLink) dlLink.href = r.file_url || '#';
  }

  // 10. Settings info
  if (adminData.site_settings) {
    const sb = adminData.site_settings;
    const sbUrl = document.getElementById('sb-url');
    if (sbUrl) sbUrl.value = sb.supabase_url || '';
    const sbKey = document.getElementById('sb-key');
    if (sbKey) sbKey.value = sb.supabase_anon_key || '';
    const sbEnable = document.getElementById('sb-enable');
    if (sbEnable) sbEnable.checked = !!sb.enable_supabase_sync;
  }

  if (window.lucide) lucide.createIcons();
}

function renderProjectsList(projects) {
  const container = document.getElementById('admin-projects-list');
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">No projects yet. Click "+ Add New Project" to create your first case study.</div>`;
    return;
  }

  container.innerHTML = projects.map((p, idx) => `
    <div class="admin-item-card" data-project-id="${escapeHtml(p.id)}">
      <div style="display:flex;align-items:center;gap:14px;flex:1;min-width:0;">
        <span class="drag-handle" title="Reorder"><i data-lucide="grip-vertical" style="width:16px;height:16px;"></i></span>
        
        <div style="width:48px;height:48px;border-radius:var(--radius-sm);overflow:hidden;background:#090d16;border:1px solid var(--border-subtle);flex-shrink:0;">
          <img src="${escapeHtml((p.images && p.images[0]) || 'assets/project-sql-1.svg')}" style="width:100%;height:100%;object-fit:cover;">
        </div>

        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong style="font-size:15px;color:var(--text-primary);">${escapeHtml(p.title)}</strong>
            ${p.published ? '<span class="status-badge-published">Published</span>' : '<span class="status-badge-draft">Draft</span>'}
            ${p.featured ? '<span style="color:var(--accent-amber);font-size:12px;display:flex;align-items:center;gap:2px;"><i data-lucide="star" style="width:12px;height:12px;fill:#f59e0b;"></i> Featured</span>' : ''}
            <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">v${p.version || 1}</span>
          </div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">
            ${escapeHtml(p.category || 'Data Analytics')} • Order #${p.order || idx + 1}
          </div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <!-- Move Up / Down Buttons -->
        <button class="btn btn-secondary btn-sm" onclick="moveProject('${p.id}', -1)" title="Move Up" ${idx === 0 ? 'disabled' : ''}>
          <i data-lucide="chevron-up" style="width:14px;height:14px;"></i>
        </button>
        <button class="btn btn-secondary btn-sm" onclick="moveProject('${p.id}', 1)" title="Move Down" ${idx === projects.length - 1 ? 'disabled' : ''}>
          <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
        </button>

        <button class="btn btn-secondary btn-sm" onclick="openVersionHistory('${p.id}')" title="Version History">
          <i data-lucide="history" style="width:14px;height:14px;"></i>
          <span>History</span>
        </button>

        <button class="btn btn-secondary btn-sm" onclick="editProject('${p.id}')">
          <i data-lucide="edit-2" style="width:14px;height:14px;"></i>
          <span>Edit</span>
        </button>

        <button class="btn btn-danger btn-sm" onclick="openDeleteConfirm('${p.id}')" title="Delete Project">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

async function moveProject(id, direction) {
  const list = (adminData.projects || []).slice();
  const index = list.findIndex(p => p.id === id);
  if (index === -1) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= list.length) return;

  const temp = list[index];
  list[index] = list[targetIndex];
  list[targetIndex] = temp;

  const orderIds = list.map(p => p.id);
  try {
    const res = await fetch('/api/admin/projects/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_ids: orderIds })
    });
    if (res.ok) {
      showToast('✓ Project order updated', 'success');
      await fetchAdminData();
    }
  } catch (err) {
    showToast('Failed to reorder projects', 'error');
  }
}

function openProjectEditor(project = null) {
  const modal = document.getElementById('project-editor-modal');
  const heading = document.getElementById('project-modal-heading');
  const form = document.getElementById('project-form');

  if (!modal || !form) return;

  if (project) {
    heading.textContent = `Edit Project: ${project.title}`;
    document.getElementById('proj-edit-id').value = project.id;
    form.title.value = project.title || '';
    form.category.value = project.category || 'Data Analytics';
    form.short_description.value = project.short_description || '';
    form.full_description.value = project.full_description || '';
    form.technologies.value = (project.technologies || []).join(', ');
    form.problem_statement.value = project.problem_statement || '';
    form.objective.value = project.objective || '';
    form.dataset.value = project.dataset || '';
    form.methodology.value = project.methodology || '';
    form.key_findings.value = project.key_findings || '';
    form.business_impact.value = project.business_impact || '';
    form.github_url.value = project.github_url || '';
    form.live_demo_url.value = project.live_demo_url || '';
    form.published.checked = project.published !== false;
    form.featured.checked = !!project.featured;
    form.change_note.value = '';
    currentProjectImages = (project.images && project.images.length > 0) ? [...project.images] : ['assets/project-sql-1.svg'];
  } else {
    heading.textContent = '+ Add New Project';
    document.getElementById('proj-edit-id').value = '';
    form.reset();
    form.published.checked = true;
    form.featured.checked = false;
    currentProjectImages = ['assets/project-sql-1.svg'];
  }

  renderScreenshotPreviews();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
}

function editProject(id) {
  const proj = (adminData.projects || []).find(p => p.id === id);
  if (proj) openProjectEditor(proj);
}

function closeProjectEditor() {
  const modal = document.getElementById('project-editor-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderScreenshotPreviews() {
  const container = document.getElementById('proj-screenshot-previews');
  if (!container) return;

  container.innerHTML = currentProjectImages.map((img, idx) => `
    <div class="screenshot-preview-card">
      <img src="${escapeHtml(img)}" alt="Screenshot ${idx + 1}">
      <button type="button" class="screenshot-remove-btn" onclick="removeScreenshot(${idx})" title="Remove screenshot">×</button>
      ${idx === 0 ? '<span style="position:absolute;bottom:4px;left:4px;background:#2563eb;color:#fff;font-size:9px;padding:2px 4px;border-radius:2px;">Primary</span>' : ''}
    </div>
  `).join('');
}

function removeScreenshot(index) {
  currentProjectImages.splice(index, 1);
  renderScreenshotPreviews();
}

function previewCurrentProjectModal() {
  const form = document.getElementById('project-form');
  const modal = document.getElementById('admin-preview-modal');
  if (!form || !modal) return;

  document.getElementById('prev-title').textContent = form.title.value || 'Untitled Project';
  document.getElementById('prev-category').textContent = form.category.value || 'Data Analytics';
  document.getElementById('prev-desc').textContent = form.full_description.value || form.short_description.value || 'No description provided.';
  document.getElementById('prev-img').src = currentProjectImages[0] || 'assets/project-sql-1.svg';
  document.getElementById('prev-problem').textContent = form.problem_statement.value || 'N/A';
  document.getElementById('prev-objective').textContent = form.objective.value || 'N/A';
  document.getElementById('prev-findings').textContent = form.key_findings.value || 'N/A';
  document.getElementById('prev-impact').textContent = form.business_impact.value || 'N/A';

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeAdminPreviewModal() {
  const modal = document.getElementById('admin-preview-modal');
  if (modal) modal.classList.remove('active');
}

// Version History Modal
async function openVersionHistory(projectId) {
  const proj = (adminData.projects || []).find(p => p.id === projectId);
  if (!proj) return;

  document.getElementById('version-history-proj-title').textContent = `Project: ${proj.title}`;
  const listContainer = document.getElementById('version-history-list');
  listContainer.innerHTML = '<div>Loading version snapshots...</div>';

  const modal = document.getElementById('version-history-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    const res = await fetch(`/api/admin/projects/${projectId}/versions`);
    const json = await res.json();
    if (json.success && json.data) {
      const versions = json.data;
      if (versions.length === 0) {
        listContainer.innerHTML = `<div style="color:var(--text-muted);padding:20px;text-align:center;">No previous versions recorded for this project yet.</div>`;
        return;
      }

      listContainer.innerHTML = versions.map(v => `
        <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
            <div>
              <strong style="font-size:14px;color:var(--accent-blue);">Version #${v.version_number}</strong>
              <span style="font-size:12px;color:var(--text-muted);margin-left:8px;">${new Date(v.saved_at).toLocaleString()}</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="restoreVersion('${projectId}', '${v.version_id}')">
              <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i>
              <span>Restore This Version</span>
            </button>
          </div>
          <div style="font-size:13px;color:var(--text-secondary);">
            <em>Note:</em> ${escapeHtml(v.change_note || 'Snapshot version')}
          </div>
          ${v.snapshot ? `
            <div style="font-size:12px;color:var(--text-muted);margin-top:6px;background:var(--bg-input);padding:8px;border-radius:4px;">
              Title: <strong>${escapeHtml(v.snapshot.title || '')}</strong> • Impact: ${escapeHtml(v.snapshot.business_impact || 'N/A')}
            </div>
          ` : ''}
        </div>
      `).join('');

      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    listContainer.innerHTML = '<div style="color:var(--accent-rose);">Failed to load version snapshots.</div>';
  }
}

async function restoreVersion(projectId, versionId) {
  if (!confirm('Restore this project snapshot? It will update the active project state.')) return;

  try {
    const res = await fetch(`/api/admin/projects/${projectId}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version_id: versionId })
    });
    const json = await res.json();
    if (json.success) {
      showToast('✓ Project restored to selected version snapshot', 'success');
      closeVersionHistory();
      await fetchAdminData();
    } else {
      showToast(json.error || 'Failed to restore version', 'error');
    }
  } catch (err) {
    showToast('Error restoring version', 'error');
  }
}

function closeVersionHistory() {
  const modal = document.getElementById('version-history-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Delete Project Confirmation Modal
function openDeleteConfirm(projectId) {
  pendingDeleteId = projectId;
  const proj = (adminData.projects || []).find(p => p.id === projectId);
  const msg = document.getElementById('delete-confirm-msg');
  if (msg && proj) {
    msg.textContent = `Are you sure you want to delete "${proj.title}"? This action will remove the project from your public portfolio.`;
  }
  const modal = document.getElementById('delete-confirm-modal');
  modal.classList.add('active');
}

function closeDeleteConfirm() {
  pendingDeleteId = null;
  const modal = document.getElementById('delete-confirm-modal');
  if (modal) modal.classList.remove('active');
}

// Unsaved Changes Modal
function openUnsavedChangesModal() {
  document.getElementById('unsaved-changes-modal').classList.add('active');
}
function closeUnsavedChangesModal() {
  document.getElementById('unsaved-changes-modal').classList.remove('active');
}

// Skills List & CRUD
function renderSkillsList(skills) {
  const container = document.getElementById('admin-skills-list');
  if (!container) return;

  container.innerHTML = skills.map(s => `
    <div class="admin-item-card">
      <div>
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(s.name)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(s.category)} • Level: ${escapeHtml(s.level || 'Advanced')}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-danger btn-sm" onclick="deleteSkill('${s.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      </div>
    </div>
  `).join('');
}

function openSkillModal() {
  const form = document.getElementById('generic-item-form');
  document.getElementById('generic-modal-title').textContent = 'Add Technical Skill';
  form.innerHTML = `
    <div class="form-group"><label class="form-label">Skill Name *</label><input type="text" name="name" required placeholder="e.g. SQL (PostgreSQL)"></div>
    <div class="form-group"><label class="form-label">Category</label><input type="text" name="category" value="Data Querying & Databases" required></div>
    <div class="form-group"><label class="form-label">Proficiency Level</label><select name="level"><option value="Advanced">Advanced</option><option value="Proficient">Proficient</option><option value="Intermediate">Intermediate</option></select></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Skill</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.value, category: form.category.value, level: form.level.value })
      });
      if (res.ok) {
        showToast('✓ Skill added', 'success');
        closeGenericModal();
        await fetchAdminData();
      }
    } catch (err) {
      showToast('Error adding skill', 'error');
    }
  };

  document.getElementById('generic-item-modal').classList.add('active');
}

async function deleteSkill(id) {
  if (!confirm('Delete this skill?')) return;
  try {
    const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('✓ Skill deleted', 'success');
      await fetchAdminData();
    }
  } catch (err) {
    showToast('Failed to delete skill', 'error');
  }
}

// Experience List & CRUD
function renderExperienceList(exps) {
  const container = document.getElementById('admin-experience-list');
  if (!container) return;

  container.innerHTML = exps.map(e => `
    <div class="admin-item-card">
      <div>
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(e.role)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(e.company)} • ${escapeHtml(e.start_date || '')} - ${e.current ? 'Present' : escapeHtml(e.end_date || '')}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteExperience('${e.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
    </div>
  `).join('');
}

function openExperienceModal() {
  const form = document.getElementById('generic-item-form');
  document.getElementById('generic-modal-title').textContent = 'Add Work Experience';
  form.innerHTML = `
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Role Title *</label><input type="text" name="role" required placeholder="Data & Product Analyst"></div>
      <div class="form-group"><label class="form-label">Organization / Company *</label><input type="text" name="company" required placeholder="Company Name"></div>
    </div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Start Date</label><input type="text" name="start_date" placeholder="2024-01"></div>
      <div class="form-group"><label class="form-label">End Date</label><input type="text" name="end_date" placeholder="Present"></div>
    </div>
    <div class="form-group"><label class="form-label">Summary Description</label><textarea name="description" rows="2"></textarea></div>
    <div class="form-group"><label class="form-label">Achievements (one bullet per line)</label><textarea name="responsibilities" rows="3" placeholder="Quantified achievements and metrics..."></textarea></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Experience</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const bullets = form.responsibilities.value.split('\n').map(b => b.trim()).filter(Boolean);
    try {
      const res = await fetch('/api/admin/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: form.role.value,
          company: form.company.value,
          start_date: form.start_date.value,
          end_date: form.end_date.value,
          description: form.description.value,
          responsibilities: bullets
        })
      });
      if (res.ok) {
        showToast('✓ Experience entry added', 'success');
        closeGenericModal();
        await fetchAdminData();
      }
    } catch (err) {
      showToast('Error saving experience', 'error');
    }
  };

  document.getElementById('generic-item-modal').classList.add('active');
}

async function deleteExperience(id) {
  if (!confirm('Delete this experience entry?')) return;
  try {
    const res = await fetch(`/api/admin/experience/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('✓ Experience deleted', 'success');
      await fetchAdminData();
    }
  } catch (err) {
    showToast('Failed to delete experience', 'error');
  }
}

// Education List & CRUD
function renderEducationList(edus) {
  const container = document.getElementById('admin-education-list');
  if (!container) return;

  container.innerHTML = edus.map(ed => `
    <div class="admin-item-card">
      <div>
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(ed.degree)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(ed.institution)} • ${escapeHtml(ed.grade || '')}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteEducation('${ed.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
    </div>
  `).join('');
}

function openEducationModal() {
  const form = document.getElementById('generic-item-form');
  document.getElementById('generic-modal-title').textContent = 'Add Education';
  form.innerHTML = `
    <div class="form-group"><label class="form-label">Degree *</label><input type="text" name="degree" required placeholder="B.Tech in Computer Science"></div>
    <div class="form-group"><label class="form-label">Institution *</label><input type="text" name="institution" required placeholder="University Name"></div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Duration</label><input type="text" name="start_date" placeholder="2020 - 2024"></div>
      <div class="form-group"><label class="form-label">Grade / CGPA</label><input type="text" name="grade" placeholder="8.65 / 10.0 CGPA"></div>
    </div>
    <div class="form-group"><label class="form-label">Description</label><textarea name="description" rows="2"></textarea></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Education</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          degree: form.degree.value,
          institution: form.institution.value,
          start_date: form.start_date.value,
          grade: form.grade.value,
          description: form.description.value
        })
      });
      if (res.ok) {
        showToast('✓ Education entry added', 'success');
        closeGenericModal();
        await fetchAdminData();
      }
    } catch (err) {
      showToast('Error saving education', 'error');
    }
  };

  document.getElementById('generic-item-modal').classList.add('active');
}

async function deleteEducation(id) {
  if (!confirm('Delete this education entry?')) return;
  try {
    const res = await fetch(`/api/admin/education/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('✓ Education deleted', 'success');
      await fetchAdminData();
    }
  } catch (err) {
    showToast('Failed to delete education', 'error');
  }
}

// Certifications List & CRUD
function renderCertificationsList(certs) {
  const container = document.getElementById('admin-certifications-list');
  if (!container) return;

  container.innerHTML = certs.map(c => `
    <div class="admin-item-card">
      <div>
        <strong style="font-size:14px;color:var(--text-primary);">${escapeHtml(c.title)}</strong>
        <div style="font-size:12px;color:var(--text-secondary);">${escapeHtml(c.issuer)} • Issued: ${escapeHtml(c.issue_date || '')}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteCertification('${c.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
    </div>
  `).join('');
}

function openCertificationModal() {
  const form = document.getElementById('generic-item-form');
  document.getElementById('generic-modal-title').textContent = 'Add Certification';
  form.innerHTML = `
    <div class="form-group"><label class="form-label">Certification Title *</label><input type="text" name="title" required placeholder="Microsoft Certified: Power BI Data Analyst (PL-300)"></div>
    <div class="form-group"><label class="form-label">Issuing Organization *</label><input type="text" name="issuer" required placeholder="Microsoft"></div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label">Issue Date</label><input type="text" name="issue_date" placeholder="2024-06"></div>
      <div class="form-group"><label class="form-label">Credential ID</label><input type="text" name="credential_id" placeholder="MS-PL300-1234"></div>
    </div>
    <div class="form-group"><label class="form-label">Verification URL</label><input type="url" name="verification_url" placeholder="https://learn.microsoft.com/credentials"></div>
    <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
      <button type="button" class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Certification</button>
    </div>
  `;

  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.value,
          issuer: form.issuer.value,
          issue_date: form.issue_date.value,
          credential_id: form.credential_id.value,
          verification_url: form.verification_url.value,
          image_url: 'assets/badge-microsoft.svg'
        })
      });
      if (res.ok) {
        showToast('✓ Certification added', 'success');
        closeGenericModal();
        await fetchAdminData();
      }
    } catch (err) {
      showToast('Error saving certification', 'error');
    }
  };

  document.getElementById('generic-item-modal').classList.add('active');
}

async function deleteCertification(id) {
  if (!confirm('Delete this certification?')) return;
  try {
    const res = await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('✓ Certification deleted', 'success');
      await fetchAdminData();
    }
  } catch (err) {
    showToast('Failed to delete certification', 'error');
  }
}

function closeGenericModal() {
  const modal = document.getElementById('generic-item-modal');
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
