// Public Portfolio Client Application
let portfolioData = null;
let activeCategory = 'All';

async function initPortfolio() {
  try {
    const res = await fetch('/api/portfolio');
    if (!res.ok) throw new Error('Failed to fetch portfolio data');
    const json = await res.json();
    if (json.success && json.data) {
      portfolioData = json.data;
      renderAll(portfolioData);
    }
  } catch (err) {
    console.error('Error initializing portfolio:', err);
    showToast('Failed to load live portfolio content', 'error');
  }
}

function renderAll(data) {
  renderProfile(data.profile, data.resume);
  renderCategories(data.categories, data.projects);
  renderProjects(data.projects, activeCategory);
  renderSkills(data.skills);
  renderExperience(data.experience);
  renderCredentials(data.education, data.certifications);
  renderContact(data.profile, data.social_links);
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderProfile(profile, resume) {
  if (!profile) return;
  
  // Page Title & Header
  if (profile.name) {
    document.title = `${profile.name} | ${profile.title || 'Data & Product Analyst'}`;
    const brandName = document.getElementById('nav-brand-name');
    if (brandName) brandName.textContent = profile.name;
    const footerName = document.getElementById('footer-name');
    if (footerName) footerName.textContent = profile.name;
  }
  if (profile.title) {
    const brandTitle = document.getElementById('nav-brand-title');
    if (brandTitle) brandTitle.textContent = profile.title;
  }

  // Hero
  const heroNameTitle = document.getElementById('hero-name-title');
  if (heroNameTitle) {
    heroNameTitle.textContent = profile.title 
      ? `Turning complex data into high-leverage business decisions.` 
      : 'Data & Product Analyst';
  }

  const heroHeadline = document.getElementById('hero-headline');
  if (heroHeadline) {
    heroHeadline.textContent = profile.headline || profile.short_bio || '';
  }

  const statusPill = document.getElementById('hero-status-pill');
  const statusText = document.getElementById('hero-status-text');
  if (statusText) {
    statusText.textContent = profile.status_text || 'Available for Data Analyst & Product Analytics Roles';
    if (statusPill) statusPill.style.display = profile.open_to_work ? 'inline-flex' : 'none';
  }

  const statExp = document.getElementById('stat-exp');
  if (statExp) statExp.textContent = profile.years_experience || '2+';

  const statProjects = document.getElementById('stat-projects');
  if (statProjects) statProjects.textContent = profile.projects_completed || '15+';

  const statSat = document.getElementById('stat-satisfaction');
  if (statSat) statSat.textContent = profile.satisfaction_rate || '99%';

  const heroLocation = document.getElementById('hero-location-tag');
  if (heroLocation && profile.location) heroLocation.textContent = profile.location.split('/')[0].trim();

  const heroAvatar = document.getElementById('hero-avatar-img');
  if (heroAvatar && profile.profile_photo) heroAvatar.src = profile.profile_photo;

  // About Me
  const aboutHeadline = document.getElementById('about-headline');
  if (aboutHeadline && profile.about_headline) aboutHeadline.textContent = profile.about_headline;

  const aboutBody = document.getElementById('about-body-text');
  if (aboutBody && profile.about_text) {
    const paras = profile.about_text.split('\n\n').filter(p => p.trim());
    aboutBody.innerHTML = paras.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }

  // Resume Download Links
  const resumeUrl = (resume && resume.file_url) ? resume.file_url : (profile.resume_url || '#');
  const resumeName = (resume && resume.filename) ? resume.filename : 'Raavi_Purna_Satya_Kumar_Resume.pdf';
  
  const navResume = document.getElementById('nav-resume-btn');
  if (navResume) {
    navResume.href = resumeUrl;
    navResume.setAttribute('download', resumeName);
  }
  const heroResume = document.getElementById('hero-download-resume');
  if (heroResume) {
    heroResume.href = resumeUrl;
    heroResume.setAttribute('download', resumeName);
  }
}

function renderCategories(categories, projects) {
  const container = document.getElementById('project-filter-tabs');
  if (!container) return;

  // Extract distinct categories from projects if not provided
  const catSet = new Set(['All']);
  if (categories && Array.isArray(categories)) {
    categories.forEach(c => catSet.add(c));
  }
  if (projects && Array.isArray(projects)) {
    projects.forEach(p => { if (p.category) catSet.add(p.category); });
  }

  container.innerHTML = Array.from(catSet).map(cat => {
    const isActive = cat === activeCategory ? 'active' : '';
    return `<button class="filter-tab ${isActive}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
  }).join('');

  container.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderProjects(portfolioData.projects, activeCategory);
    });
  });
}

function renderProjects(projects, category) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  let filtered = projects || [];
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">
      No projects found in category "${escapeHtml(category)}".
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const primaryImg = (p.images && p.images.length > 0) ? p.images[0] : 'assets/project-sql-1.svg';
    const techChips = (p.technologies || []).slice(0, 4).map(t => `<span class="tech-chip">${escapeHtml(t)}</span>`).join('');
    
    // Extract first impact metric if available
    let metricHtml = '';
    if (p.business_impact) {
      const match = p.business_impact.match(/(\d+[\d,.]*[%$kKmM]+|[\$₹]\d+[\d,.]*)/);
      const val = match ? match[0] : 'Verified ROI';
      metricHtml = `
        <div class="project-metric-box">
          <div class="project-metric-label">Key Business Impact</div>
          <div class="project-metric-val">${escapeHtml(p.business_impact.slice(0, 100))}${p.business_impact.length > 100 ? '...' : ''}</div>
        </div>
      `;
    }

    return `
      <div class="project-card" data-project-id="${escapeHtml(p.id)}">
        <div class="project-thumb-wrap">
          <img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(p.title)}" class="project-thumb-img" loading="lazy">
          ${p.featured ? `<div class="project-featured-badge"><i data-lucide="star" style="width:12px;height:12px;fill:#f59e0b;"></i> Featured</div>` : ''}
          <div class="project-category-tag">${escapeHtml(p.category || 'Data Analytics')}</div>
        </div>

        <div class="project-card-content">
          <h3 class="project-card-title">${escapeHtml(p.title)}</h3>
          <p class="project-card-desc">${escapeHtml(p.short_description || p.full_description || '')}</p>
          
          ${metricHtml}

          <div class="project-tech-tags">
            ${techChips}
          </div>

          <div class="project-card-footer">
            <span class="view-case-study">
              <span>Read Case Study</span>
              <i data-lucide="arrow-up-right" style="width:14px;height:14px;"></i>
            </span>

            <div class="project-ext-links" onclick="event.stopPropagation()">
              ${p.github_url ? `<a href="${escapeHtml(p.github_url)}" target="_blank" title="GitHub Repo"><i data-lucide="github" style="width:16px;height:16px;"></i></a>` : ''}
              ${p.live_demo_url ? `<a href="${escapeHtml(p.live_demo_url)}" target="_blank" title="Live Demo"><i data-lucide="external-link" style="width:16px;height:16px;"></i></a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add click handlers to open case study modal
  grid.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const projId = card.getAttribute('data-project-id');
      const project = (portfolioData.projects || []).find(p => p.id === projId);
      if (project) openProjectModal(project);
    });
  });

  if (window.lucide) lucide.createIcons();
}

function openProjectModal(p) {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  document.getElementById('modal-title').textContent = p.title || 'Case Study';
  document.getElementById('modal-category').textContent = p.category || 'Data Analytics';
  document.getElementById('modal-full-desc').textContent = p.full_description || p.short_description || '';

  // Gallery
  const images = (p.images && p.images.length > 0) ? p.images : ['assets/project-sql-1.svg'];
  const mainImg = document.getElementById('modal-main-img');
  mainImg.src = images[0];

  const thumbsContainer = document.getElementById('modal-thumbs');
  if (images.length > 1) {
    thumbsContainer.style.display = 'flex';
    thumbsContainer.innerHTML = images.map((img, idx) => `
      <div class="thumb-preview ${idx === 0 ? 'active' : ''}" data-src="${escapeHtml(img)}">
        <img src="${escapeHtml(img)}" alt="Thumb ${idx + 1}">
      </div>
    `).join('');

    thumbsContainer.querySelectorAll('.thumb-preview').forEach(th => {
      th.addEventListener('click', () => {
        thumbsContainer.querySelectorAll('.thumb-preview').forEach(t => t.classList.remove('active'));
        th.classList.add('active');
        mainImg.src = th.getAttribute('data-src');
      });
    });
  } else {
    thumbsContainer.style.display = 'none';
  }

  // Tech tags
  const techContainer = document.getElementById('modal-tech-tags');
  techContainer.innerHTML = (p.technologies || []).map(t => `<span class="tech-chip">${escapeHtml(t)}</span>`).join('');

  // Case study sections
  document.getElementById('modal-problem').textContent = p.problem_statement || 'N/A';
  document.getElementById('modal-objective').textContent = p.objective || 'N/A';
  document.getElementById('modal-dataset').textContent = p.dataset || 'N/A';
  document.getElementById('modal-methodology').textContent = p.methodology || 'N/A';
  document.getElementById('modal-findings').textContent = p.key_findings || 'N/A';
  document.getElementById('modal-impact').textContent = p.business_impact || 'N/A';

  // Links
  const ghLink = document.getElementById('modal-github-link');
  if (p.github_url) {
    ghLink.href = p.github_url;
    ghLink.style.display = 'inline-flex';
  } else {
    ghLink.style.display = 'none';
  }

  const demoLink = document.getElementById('modal-demo-link');
  if (p.live_demo_url) {
    demoLink.href = p.live_demo_url;
    demoLink.style.display = 'inline-flex';
  } else {
    demoLink.style.display = 'none';
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderSkills(skills) {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  // Group skills by category
  const groups = {};
  (skills || []).forEach(s => {
    const cat = s.category || 'General Analytics';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });

  container.innerHTML = Object.entries(groups).map(([cat, items]) => `
    <div class="skill-group-card">
      <h3 class="skill-group-title">
        <i data-lucide="layers" style="width:16px;height:16px;color:#38bdf8;"></i>
        <span>${escapeHtml(cat)}</span>
      </h3>
      <div class="skill-items-list">
        ${items.map(sk => `
          <div class="skill-item">
            <span class="skill-name">${escapeHtml(sk.name)}</span>
            <span class="skill-badge">${escapeHtml(sk.level || 'Advanced')}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderExperience(experience) {
  const container = document.getElementById('experience-timeline');
  if (!container) return;

  container.innerHTML = (experience || []).map(e => `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-card">
        <div class="timeline-header">
          <div>
            <h3 class="timeline-role">${escapeHtml(e.role)}</h3>
            <span class="timeline-company">${escapeHtml(e.company)} • ${escapeHtml(e.location || '')}</span>
          </div>
          <span class="timeline-date">${escapeHtml(e.start_date || '')} — ${e.current ? 'Present' : escapeHtml(e.end_date || '')}</span>
        </div>
        <p class="timeline-desc">${escapeHtml(e.description || '')}</p>
        
        ${(e.responsibilities && e.responsibilities.length > 0) ? `
          <ul class="timeline-bullets">
            ${e.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        ` : ''}

        ${(e.technologies && e.technologies.length > 0) ? `
          <div class="project-tech-tags" style="margin-bottom:0;">
            ${e.technologies.map(t => `<span class="tech-chip">${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function renderCredentials(education, certifications) {
  const container = document.getElementById('credentials-grid');
  if (!container) return;

  let certHtml = (certifications || []).map(c => `
    <div class="cert-card">
      <div class="cert-badge-wrap">
        <img src="${escapeHtml(c.image_url || 'assets/badge-microsoft.svg')}" alt="Badge" class="cert-badge-img">
      </div>
      <div class="cert-info">
        <h4 class="cert-title">${escapeHtml(c.title)}</h4>
        <div class="cert-issuer">${escapeHtml(c.issuer)}</div>
        <div class="cert-meta">
          <span>Issued: ${escapeHtml(c.issue_date || '')}</span>
          ${c.verification_url ? `<a href="${escapeHtml(c.verification_url)}" target="_blank" style="color:var(--accent-blue);">Verify ↗</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  let eduHtml = (education || []).map(ed => `
    <div class="cert-card" style="border-left: 3px solid var(--accent-indigo);">
      <div class="cert-badge-wrap" style="background:var(--accent-indigo-subtle);border-color:rgba(99,102,241,0.3);">
        <i data-lucide="graduation-cap" style="width:24px;height:24px;color:#a5b4fc;"></i>
      </div>
      <div class="cert-info">
        <h4 class="cert-title">${escapeHtml(ed.degree)}</h4>
        <div class="cert-issuer">${escapeHtml(ed.institution)} • ${escapeHtml(ed.location || '')}</div>
        <div class="cert-meta">
          <span>${escapeHtml(ed.start_date || '')} - ${escapeHtml(ed.end_date || '')}</span>
          ${ed.grade ? `<span style="color:#34d399;font-weight:600;">Grade: ${escapeHtml(ed.grade)}</span>` : ''}
        </div>
        ${ed.description ? `<p style="font-size:12px;color:#94a3b8;margin-top:6px;">${escapeHtml(ed.description)}</p>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = certHtml + eduHtml;
}

function renderContact(profile, socialLinks) {
  if (!profile) return;
  const emailEl = document.getElementById('contact-email');
  if (emailEl && profile.email) {
    emailEl.textContent = profile.email;
    emailEl.href = `mailto:${profile.email}`;
  }

  const locEl = document.getElementById('contact-location');
  if (locEl && profile.location) locEl.textContent = profile.location;

  const liEl = document.getElementById('contact-linkedin');
  if (liEl && profile.linkedin) {
    liEl.textContent = profile.linkedin.replace(/^https?:\/\/(www\.)?/, '');
    liEl.href = profile.linkedin;
  }

  const ghEl = document.getElementById('contact-github');
  if (ghEl && profile.github) {
    ghEl.textContent = profile.github.replace(/^https?:\/\/(www\.)?/, '');
    ghEl.href = profile.github;
  }
}

// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
  initPortfolio();

  // Modal close handlers
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);

  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

  // Contact form submission
  const form = document.getElementById('public-contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contact-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span>`;

      const formData = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await res.json();
        if (result.success) {
          showToast('✓ Message sent successfully! I will respond shortly.', 'success');
          form.reset();
        } else {
          showToast(result.error || 'Failed to send message', 'error');
        }
      } catch (err) {
        showToast('Network error while sending message', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="send" style="width:16px;height:16px;"></i><span>Send Message</span>`;
        if (window.lucide) lucide.createIcons();
      }
    });
  }
});

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
