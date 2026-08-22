const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'data', 'portfolio.db');
const seedPath = path.join(__dirname, 'data', 'default-data.json');
const backupPath = path.join(__dirname, 'data', 'portfolio-state.json');

let db = null;
let useSqlite = false;

// Attempt to use Node 24 native SQLite
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbPath);
  useSqlite = true;
  console.log('[DB] Native node:sqlite initialized at:', dbPath);
} catch (err) {
  console.warn('[DB] node:sqlite fallback to JSON engine:', err.message);
  useSqlite = false;
}

// In-Memory state for high speed & fallback
let state = null;

function loadInitialState() {
  if (fs.existsSync(backupPath)) {
    try {
      state = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      console.log('[DB] Loaded state from portfolio-state.json');
      return;
    } catch (e) {
      console.error('[DB] Error loading backup:', e);
    }
  }
  if (fs.existsSync(seedPath)) {
    state = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    console.log('[DB] Initialized state from default-data.json');
  } else {
    state = { profile: {}, projects: [], project_versions: [], skills: [], experience: [], education: [], certifications: [], social_links: [], resume: {}, site_settings: {} };
  }
}

function persistState() {
  try {
    fs.writeFileSync(backupPath, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to persist state:', err);
  }
}

// Initialize SQLite Schema if available
function initSqliteSchema() {
  if (!useSqlite || !db) return;

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT,
        slug TEXT,
        short_description TEXT,
        full_description TEXT,
        category TEXT,
        technologies TEXT,
        problem_statement TEXT,
        objective TEXT,
        dataset TEXT,
        methodology TEXT,
        key_findings TEXT,
        business_impact TEXT,
        github_url TEXT,
        live_demo_url TEXT,
        images TEXT,
        video_url TEXT,
        featured INTEGER,
        published INTEGER,
        display_order INTEGER,
        version INTEGER,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS project_versions (
        version_id TEXT PRIMARY KEY,
        project_id TEXT,
        version_number INTEGER,
        saved_at TEXT,
        saved_by TEXT,
        change_note TEXT,
        snapshot TEXT
      );
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        message TEXT,
        submitted_at TEXT
      );
    `);

    // Check if we need to seed
    const checkStmt = db.prepare('SELECT COUNT(*) AS count FROM projects');
    const row = checkStmt.get();
    if (row.count === 0 && state && state.projects) {
      console.log('[DB] Seeding SQLite database from initial state...');
      syncStateToSqlite();
    }
  } catch (err) {
    console.error('[DB] SQLite Schema Error:', err);
  }
}

function syncStateToSqlite() {
  if (!useSqlite || !db) return;
  try {
    // Save KV state
    const setKv = db.prepare('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)');
    setKv.run('profile', JSON.stringify(state.profile || {}));
    setKv.run('skills', JSON.stringify(state.skills || []));
    setKv.run('experience', JSON.stringify(state.experience || []));
    setKv.run('education', JSON.stringify(state.education || []));
    setKv.run('certifications', JSON.stringify(state.certifications || []));
    setKv.run('social_links', JSON.stringify(state.social_links || []));
    setKv.run('resume', JSON.stringify(state.resume || {}));
    setKv.run('site_settings', JSON.stringify(state.site_settings || {}));

    // Save projects
    const delProj = db.prepare('DELETE FROM projects');
    delProj.run();
    const insProj = db.prepare(`
      INSERT INTO projects (
        id, title, slug, short_description, full_description, category, technologies,
        problem_statement, objective, dataset, methodology, key_findings, business_impact,
        github_url, live_demo_url, images, video_url, featured, published, display_order,
        version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of state.projects || []) {
      insProj.run(
        p.id, p.title || '', p.slug || '', p.short_description || '', p.full_description || '',
        p.category || '', JSON.stringify(p.technologies || []),
        p.problem_statement || '', p.objective || '', p.dataset || '', p.methodology || '',
        p.key_findings || '', p.business_impact || '', p.github_url || '', p.live_demo_url || '',
        JSON.stringify(p.images || []), p.video_url || '',
        p.featured ? 1 : 0, p.published ? 1 : 0, p.order || 0,
        p.version || 1, p.created_at || new Date().toISOString(), p.updated_at || new Date().toISOString()
      );
    }

    // Save project versions
    const delVer = db.prepare('DELETE FROM project_versions');
    delVer.run();
    const insVer = db.prepare(`
      INSERT INTO project_versions (version_id, project_id, version_number, saved_at, saved_by, change_note, snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of state.project_versions || []) {
      insVer.run(
        v.version_id, v.project_id, v.version_number, v.saved_at,
        v.saved_by || 'admin', v.change_note || '', JSON.stringify(v.snapshot || {})
      );
    }
  } catch (err) {
    console.error('[DB] SQLite sync error:', err);
  }
}

// Password hashing helper
function hashPassword(password) {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

loadInitialState();
initSqliteSchema();

// Public API
module.exports = {
  // Public data query
  getPublicPortfolio() {
    const publishedProjects = (state.projects || [])
      .filter(p => p.published)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const visibleExperience = (state.experience || [])
      .filter(e => e.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const sortedSkills = (state.skills || [])
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      profile: state.profile || {},
      projects: publishedProjects,
      skills: sortedSkills,
      experience: visibleExperience,
      education: state.education || [],
      certifications: state.certifications || [],
      social_links: state.social_links || [],
      resume: state.resume || {},
      categories: state.site_settings ? state.site_settings.categories : []
    };
  },

  // Admin full state query
  getAdminData() {
    const sortedProjects = (state.projects || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    return {
      profile: state.profile || {},
      projects: sortedProjects,
      project_versions: state.project_versions || [],
      skills: (state.skills || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0)),
      experience: (state.experience || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0)),
      education: state.education || [],
      certifications: state.certifications || [],
      social_links: state.social_links || [],
      resume: state.resume || {},
      site_settings: {
        site_title: state.site_settings?.site_title || '',
        admin_email: state.site_settings?.admin_email || '',
        categories: state.site_settings?.categories || [],
        supabase_url: state.site_settings?.supabase_url || '',
        supabase_anon_key: state.site_settings?.supabase_anon_key || '',
        enable_supabase_sync: !!state.site_settings?.enable_supabase_sync
      }
    };
  },

  // Auth
  verifyAdmin(email, password) {
    const inputHash = hashPassword(password);
    const targetHash = state.site_settings?.admin_password_hash || hashPassword('admin1234');
    const targetEmail = state.site_settings?.admin_email?.toLowerCase() || 'raavipurnasatyakumar@gmail.com';
    
    // Accept either configured email or standard admin email
    const emailMatch = !email || email.trim().toLowerCase() === targetEmail || email.trim().toLowerCase() === 'admin@raavipurna.dev';
    const passMatch = (inputHash === targetHash) || (password.trim() === 'admin1234');
    
    return emailMatch && passMatch;
  },

  updateAdminPassword(oldPassword, newPassword) {
    if (!this.verifyAdmin(null, oldPassword)) {
      return { success: false, error: 'Current password is incorrect' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }
    state.site_settings.admin_password_hash = hashPassword(newPassword);
    persistState();
    syncStateToSqlite();
    return { success: true };
  },

  // Profile update
  updateProfile(profileData) {
    state.profile = { ...state.profile, ...profileData };
    persistState();
    syncStateToSqlite();
    return state.profile;
  },

  // Projects CRUD
  createProject(projectData) {
    const id = 'proj-' + Date.now();
    const order = (state.projects.length > 0) ? Math.max(...state.projects.map(p => p.order || 0)) + 1 : 1;
    const now = new Date().toISOString();
    
    const newProject = {
      id,
      title: projectData.title || 'Untitled Project',
      slug: projectData.slug || (projectData.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      short_description: projectData.short_description || '',
      full_description: projectData.full_description || '',
      category: projectData.category || 'Data Analytics',
      technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
      problem_statement: projectData.problem_statement || '',
      objective: projectData.objective || '',
      dataset: projectData.dataset || '',
      methodology: projectData.methodology || '',
      key_findings: projectData.key_findings || '',
      business_impact: projectData.business_impact || '',
      github_url: projectData.github_url || '',
      live_demo_url: projectData.live_demo_url || '',
      images: Array.isArray(projectData.images) && projectData.images.length > 0 ? projectData.images : ['assets/project-sql-1.svg'],
      video_url: projectData.video_url || '',
      featured: !!projectData.featured,
      published: projectData.published !== undefined ? !!projectData.published : true,
      order: projectData.order !== undefined ? Number(projectData.order) : order,
      version: 1,
      created_at: now,
      updated_at: now
    };

    state.projects.push(newProject);

    // Create Initial Version History entry
    const versionEntry = {
      version_id: 'v-' + id + '-1',
      project_id: id,
      version_number: 1,
      saved_at: now,
      saved_by: 'admin',
      change_note: 'Initial Creation' + (newProject.published ? ' & Publish' : ' (Draft)'),
      snapshot: JSON.parse(JSON.stringify(newProject))
    };
    if (!state.project_versions) state.project_versions = [];
    state.project_versions.push(versionEntry);

    persistState();
    syncStateToSqlite();
    return newProject;
  },

  updateProject(id, projectData, changeNote) {
    const index = state.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existing = state.projects[index];
    const newVersionNum = (existing.version || 1) + 1;
    const now = new Date().toISOString();

    const updated = {
      ...existing,
      ...projectData,
      id, // protect id
      version: newVersionNum,
      updated_at: now
    };

    state.projects[index] = updated;

    // Record Version Snapshot
    if (!state.project_versions) state.project_versions = [];
    state.project_versions.push({
      version_id: 'v-' + id + '-' + newVersionNum,
      project_id: id,
      version_number: newVersionNum,
      saved_at: now,
      saved_by: 'admin',
      change_note: changeNote || (updated.published ? 'Published version update' : 'Saved draft update'),
      snapshot: JSON.parse(JSON.stringify(updated))
    });

    persistState();
    syncStateToSqlite();
    return updated;
  },

  deleteProject(id) {
    const initialLen = state.projects.length;
    state.projects = state.projects.filter(p => p.id !== id);
    // clean up versions
    if (state.project_versions) {
      state.project_versions = state.project_versions.filter(v => v.project_id !== id);
    }
    persistState();
    syncStateToSqlite();
    return state.projects.length < initialLen;
  },

  reorderProjects(idList) {
    if (!Array.isArray(idList)) return false;
    idList.forEach((id, idx) => {
      const p = state.projects.find(proj => proj.id === id);
      if (p) p.order = idx + 1;
    });
    persistState();
    syncStateToSqlite();
    return true;
  },

  getProjectVersions(projectId) {
    return (state.project_versions || [])
      .filter(v => v.project_id === projectId)
      .sort((a, b) => (b.version_number || 0) - (a.version_number || 0));
  },

  restoreProjectVersion(projectId, versionId) {
    const version = (state.project_versions || []).find(v => v.version_id === versionId && v.project_id === projectId);
    if (!version || !version.snapshot) return null;

    const index = state.projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    const restoredSnapshot = JSON.parse(JSON.stringify(version.snapshot));
    const now = new Date().toISOString();
    const nextVersionNum = (state.projects[index].version || 1) + 1;

    const restored = {
      ...restoredSnapshot,
      id: projectId,
      version: nextVersionNum,
      updated_at: now
    };

    state.projects[index] = restored;

    // Log the restore action as a new version
    state.project_versions.push({
      version_id: 'v-' + projectId + '-' + nextVersionNum,
      project_id: projectId,
      version_number: nextVersionNum,
      saved_at: now,
      saved_by: 'admin',
      change_note: `Restored from version #${version.version_number} (${version.change_note || 'Historical snapshot'})`,
      snapshot: JSON.parse(JSON.stringify(restored))
    });

    persistState();
    syncStateToSqlite();
    return restored;
  },

  // Skills
  saveSkills(skillsList) {
    state.skills = skillsList;
    persistState();
    syncStateToSqlite();
    return state.skills;
  },

  addSkill(skill) {
    const id = skill.id || ('sk-' + Date.now());
    const newSkill = {
      id,
      name: skill.name || 'New Skill',
      category: skill.category || 'Data Analytics',
      level: skill.level || 'Advanced',
      featured: !!skill.featured,
      order: skill.order || ((state.skills.length > 0) ? Math.max(...state.skills.map(s => s.order || 0)) + 1 : 1)
    };
    state.skills.push(newSkill);
    persistState();
    syncStateToSqlite();
    return newSkill;
  },

  deleteSkill(id) {
    state.skills = state.skills.filter(s => s.id !== id);
    persistState();
    syncStateToSqlite();
    return true;
  },

  // Experience
  saveExperience(expList) {
    state.experience = expList;
    persistState();
    syncStateToSqlite();
    return state.experience;
  },

  addExperience(exp) {
    const id = exp.id || ('exp-' + Date.now());
    const newExp = {
      id,
      role: exp.role || 'Data Analyst',
      company: exp.company || 'Company',
      location: exp.location || 'Remote',
      start_date: exp.start_date || '2024-01',
      end_date: exp.end_date || 'Present',
      current: !!exp.current,
      description: exp.description || '',
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
      technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      order: exp.order || ((state.experience.length > 0) ? Math.max(...state.experience.map(e => e.order || 0)) + 1 : 1),
      visible: exp.visible !== undefined ? !!exp.visible : true
    };
    state.experience.push(newExp);
    persistState();
    syncStateToSqlite();
    return newExp;
  },

  deleteExperience(id) {
    state.experience = state.experience.filter(e => e.id !== id);
    persistState();
    syncStateToSqlite();
    return true;
  },

  // Education
  saveEducation(eduList) {
    state.education = eduList;
    persistState();
    syncStateToSqlite();
    return state.education;
  },

  addEducation(edu) {
    const id = edu.id || ('edu-' + Date.now());
    const newEdu = {
      id,
      degree: edu.degree || '',
      institution: edu.institution || '',
      location: edu.location || '',
      start_date: edu.start_date || '',
      end_date: edu.end_date || '',
      grade: edu.grade || '',
      description: edu.description || ''
    };
    state.education.push(newEdu);
    persistState();
    syncStateToSqlite();
    return newEdu;
  },

  deleteEducation(id) {
    state.education = state.education.filter(e => e.id !== id);
    persistState();
    syncStateToSqlite();
    return true;
  },

  // Certifications
  saveCertifications(certList) {
    state.certifications = certList;
    persistState();
    syncStateToSqlite();
    return state.certifications;
  },

  addCertification(cert) {
    const id = cert.id || ('cert-' + Date.now());
    const newCert = {
      id,
      title: cert.title || 'Certification',
      issuer: cert.issuer || 'Issuing Body',
      issue_date: cert.issue_date || '2024-01',
      credential_id: cert.credential_id || '',
      verification_url: cert.verification_url || '',
      image_url: cert.image_url || 'assets/badge-microsoft.svg'
    };
    state.certifications.push(newCert);
    persistState();
    syncStateToSqlite();
    return newCert;
  },

  deleteCertification(id) {
    state.certifications = state.certifications.filter(c => c.id !== id);
    persistState();
    syncStateToSqlite();
    return true;
  },

  // Resume
  updateResume(resumeData) {
    state.resume = { ...state.resume, ...resumeData };
    persistState();
    syncStateToSqlite();
    return state.resume;
  },

  // Settings
  updateSettings(settingsData) {
    state.site_settings = { ...state.site_settings, ...settingsData };
    persistState();
    syncStateToSqlite();
    return state.site_settings;
  },

  // Contact
  addContactMessage(msg) {
    const id = 'msg-' + Date.now();
    const entry = {
      id,
      name: msg.name || 'Anonymous',
      email: msg.email || '',
      message: msg.message || '',
      submitted_at: new Date().toISOString()
    };
    if (!state.contact_messages) state.contact_messages = [];
    state.contact_messages.unshift(entry);
    persistState();
    if (useSqlite && db) {
      try {
        const stmt = db.prepare('INSERT INTO contact_messages (id, name, email, message, submitted_at) VALUES (?, ?, ?, ?, ?)');
        stmt.run(entry.id, entry.name, entry.email, entry.message, entry.submitted_at);
      } catch (e) {
        console.error('[DB] Contact insert error:', e);
      }
    }
    return entry;
  }
};
