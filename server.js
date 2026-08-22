const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./db.js');

const PORT = process.env.PORT || 3000;
const sessions = new Map(); // token -> { email, expiresAt }

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // 25MB max payload for uploads
      if (body.length > 25 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function getAuthToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // check cookies
  const cookie = req.headers['cookie'];
  if (cookie) {
    const match = cookie.match(/admin_session=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

function isAuthenticated(req) {
  const token = getAuthToken(req);
  if (!token) return false;
  const sess = sessions.get(token);
  if (!sess) return false;
  if (Date.now() > sess.expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function serveStatic(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'public, max-age=3600'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  try {
    // ----------------------------------------------------
    // 1. PUBLIC API ROUTES
    // ----------------------------------------------------
    if (pathname === '/api/portfolio' && method === 'GET') {
      const data = db.getPublicPortfolio();
      return sendJson(res, 200, { success: true, data });
    }

    if (pathname === '/api/contact' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.name || !body.email || !body.message) {
        return sendJson(res, 400, { success: false, error: 'Name, email, and message are required.' });
      }
      const saved = db.addContactMessage(body);
      return sendJson(res, 200, { success: true, message: 'Message sent successfully!', data: saved });
    }

    // ----------------------------------------------------
    // 2. AUTHENTICATION ROUTES
    // ----------------------------------------------------
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;

      if (!password) {
        return sendJson(res, 400, { success: false, error: 'Password is required' });
      }

      const isValid = db.verifyAdmin(email, password);
      if (!isValid) {
        return sendJson(res, 401, { success: false, error: 'Invalid email or password' });
      }

      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      sessions.set(token, { email: email || 'admin', expiresAt });

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        success: true,
        token,
        message: 'Authentication successful',
        user: { email: email || 'raavipurnasatyakumar@gmail.com', role: 'admin' }
      }));
      return;
    }

    if (pathname === '/api/auth/session' && method === 'GET') {
      const valid = isAuthenticated(req);
      return sendJson(res, 200, { authenticated: valid });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      const token = getAuthToken(req);
      if (token) sessions.delete(token);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': `admin_session=; Path=/; HttpOnly; Max-Age=0`
      });
      return res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
    }

    // ----------------------------------------------------
    // 3. PROTECTED ADMIN CMS ROUTES
    // ----------------------------------------------------
    if (pathname.startsWith('/api/admin') || pathname === '/api/upload') {
      if (!isAuthenticated(req)) {
        return sendJson(res, 401, { success: false, error: 'Unauthorized. Please login to access Portfolio Control Center.' });
      }

      // Get Full Admin Data
      if (pathname === '/api/admin/data' && method === 'GET') {
        const adminData = db.getAdminData();
        return sendJson(res, 200, { success: true, data: adminData });
      }

      // Update Password
      if (pathname === '/api/admin/change-password' && method === 'POST') {
        const body = await parseBody(req);
        const result = db.updateAdminPassword(body.current_password, body.new_password);
        if (!result.success) {
          return sendJson(res, 400, result);
        }
        return sendJson(res, 200, { success: true, message: 'Password updated successfully' });
      }

      // Update Profile
      if (pathname === '/api/admin/profile' && method === 'POST') {
        const body = await parseBody(req);
        const updated = db.updateProfile(body);
        return sendJson(res, 200, { success: true, message: 'Profile updated successfully', data: updated });
      }

      // Create Project
      if (pathname === '/api/admin/projects' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.title) {
          return sendJson(res, 400, { success: false, error: 'Project title is required' });
        }
        const created = db.createProject(body);
        return sendJson(res, 201, { success: true, message: 'Project created successfully', data: created });
      }

      // Update Project
      if (pathname.startsWith('/api/admin/projects/') && method === 'PUT') {
        const id = pathname.replace('/api/admin/projects/', '').split('/')[0];
        const body = await parseBody(req);
        const updated = db.updateProject(id, body, body._change_note);
        if (!updated) {
          return sendJson(res, 404, { success: false, error: 'Project not found' });
        }
        return sendJson(res, 200, { success: true, message: 'Project updated successfully', data: updated });
      }

      // Delete Project
      if (pathname.startsWith('/api/admin/projects/') && method === 'DELETE') {
        const id = pathname.replace('/api/admin/projects/', '').split('/')[0];
        const success = db.deleteProject(id);
        if (!success) {
          return sendJson(res, 404, { success: false, error: 'Project not found' });
        }
        return sendJson(res, 200, { success: true, message: 'Project deleted successfully' });
      }

      // Reorder Projects
      if (pathname === '/api/admin/projects/reorder' && method === 'POST') {
        const body = await parseBody(req);
        const success = db.reorderProjects(body.order_ids);
        return sendJson(res, 200, { success, message: 'Project order updated successfully' });
      }

      // Get Project Version History
      if (pathname.match(/^\/api\/admin\/projects\/([^/]+)\/versions$/) && method === 'GET') {
        const match = pathname.match(/^\/api\/admin\/projects\/([^/]+)\/versions$/);
        const projectId = match[1];
        const versions = db.getProjectVersions(projectId);
        return sendJson(res, 200, { success: true, data: versions });
      }

      // Restore Project Version
      if (pathname.match(/^\/api\/admin\/projects\/([^/]+)\/restore$/) && method === 'POST') {
        const match = pathname.match(/^\/api\/admin\/projects\/([^/]+)\/restore$/);
        const projectId = match[1];
        const body = await parseBody(req);
        if (!body.version_id) {
          return sendJson(res, 400, { success: false, error: 'version_id is required' });
        }
        const restored = db.restoreProjectVersion(projectId, body.version_id);
        if (!restored) {
          return sendJson(res, 404, { success: false, error: 'Project or version snapshot not found' });
        }
        return sendJson(res, 200, { success: true, message: `Restored project to snapshot version`, data: restored });
      }

      // Skills CRUD
      if (pathname === '/api/admin/skills' && method === 'POST') {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          const updated = db.saveSkills(body);
          return sendJson(res, 200, { success: true, message: 'Skills saved', data: updated });
        } else {
          const created = db.addSkill(body);
          return sendJson(res, 201, { success: true, message: 'Skill added', data: created });
        }
      }
      if (pathname.startsWith('/api/admin/skills/') && method === 'DELETE') {
        const id = pathname.replace('/api/admin/skills/', '');
        db.deleteSkill(id);
        return sendJson(res, 200, { success: true, message: 'Skill deleted' });
      }

      // Experience CRUD
      if (pathname === '/api/admin/experience' && method === 'POST') {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          const updated = db.saveExperience(body);
          return sendJson(res, 200, { success: true, message: 'Experience saved', data: updated });
        } else {
          const created = db.addExperience(body);
          return sendJson(res, 201, { success: true, message: 'Experience added', data: created });
        }
      }
      if (pathname.startsWith('/api/admin/experience/') && method === 'DELETE') {
        const id = pathname.replace('/api/admin/experience/', '');
        db.deleteExperience(id);
        return sendJson(res, 200, { success: true, message: 'Experience deleted' });
      }

      // Education CRUD
      if (pathname === '/api/admin/education' && method === 'POST') {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          const updated = db.saveEducation(body);
          return sendJson(res, 200, { success: true, message: 'Education saved', data: updated });
        } else {
          const created = db.addEducation(body);
          return sendJson(res, 201, { success: true, message: 'Education added', data: created });
        }
      }
      if (pathname.startsWith('/api/admin/education/') && method === 'DELETE') {
        const id = pathname.replace('/api/admin/education/', '');
        db.deleteEducation(id);
        return sendJson(res, 200, { success: true, message: 'Education deleted' });
      }

      // Certifications CRUD
      if (pathname === '/api/admin/certifications' && method === 'POST') {
        const body = await parseBody(req);
        if (Array.isArray(body)) {
          const updated = db.saveCertifications(body);
          return sendJson(res, 200, { success: true, message: 'Certifications saved', data: updated });
        } else {
          const created = db.addCertification(body);
          return sendJson(res, 201, { success: true, message: 'Certification added', data: created });
        }
      }
      if (pathname.startsWith('/api/admin/certifications/') && method === 'DELETE') {
        const id = pathname.replace('/api/admin/certifications/', '');
        db.deleteCertification(id);
        return sendJson(res, 200, { success: true, message: 'Certification deleted' });
      }

      // Resume Update
      if (pathname === '/api/admin/resume' && method === 'POST') {
        const body = await parseBody(req);
        const updated = db.updateResume(body);
        return sendJson(res, 200, { success: true, message: 'Resume settings updated', data: updated });
      }

      // Settings Update
      if (pathname === '/api/admin/settings' && method === 'POST') {
        const body = await parseBody(req);
        const updated = db.updateSettings(body);
        return sendJson(res, 200, { success: true, message: 'Site settings updated', data: updated });
      }

      // File Upload Endpoint (for Screenshots, Avatars, Resumes, Certificates)
      if (pathname === '/api/upload' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.filename || !body.data) {
          return sendJson(res, 400, { success: false, error: 'Filename and base64 data are required.' });
        }

        const safeFilename = Date.now() + '-' + body.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        let fileUrl = body.data; // Fallback to Data URL for serverless/Vercel environments
        let sizeKb = Math.round((body.data.length * 0.75) / 1024);

        try {
          const uploadDir = path.join(__dirname, 'uploads');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

          const targetPath = path.join(uploadDir, safeFilename);

          let base64Data = body.data;
          if (base64Data.includes(';base64,')) {
            base64Data = base64Data.split(';base64,')[1];
          }

          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(targetPath, buffer);
          fileUrl = `/uploads/${safeFilename}`;
          sizeKb = Math.round(buffer.length / 1024);
        } catch (fsErr) {
          console.warn('[Upload] Disk write unavailable (serverless environment), utilizing data URL directly:', fsErr.message);
          fileUrl = body.data;
        }

        return sendJson(res, 200, {
          success: true,
          message: 'File processed successfully',
          file_url: fileUrl,
          filename: safeFilename,
          size_kb: sizeKb
        });
      }
    }

    // ----------------------------------------------------
    // 4. STATIC ASSET & HTML PAGE SERVING
    // ----------------------------------------------------
    if (pathname === '/' || pathname === '/index.html') {
      return serveStatic(req, res, path.join(__dirname, 'public', 'index.html'));
    }

    if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin.html') {
      return serveStatic(req, res, path.join(__dirname, 'public', 'admin.html'));
    }

    if (pathname.startsWith('/uploads/')) {
      const relPath = pathname.replace('/uploads/', '');
      const filePath = path.join(__dirname, 'uploads', relPath);
      return serveStatic(req, res, filePath);
    }

    if (pathname.startsWith('/assets/')) {
      const relPath = pathname.replace('/assets/', '');
      const filePath = path.join(__dirname, 'public', 'assets', relPath);
      return serveStatic(req, res, filePath);
    }

    // Default static file fallback in public/
    const publicFilePath = path.join(__dirname, 'public', pathname.replace(/^\//, ''));
    if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
      return serveStatic(req, res, publicFilePath);
    }

    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');

  } catch (err) {
    console.error('[Server Error]', err);
    sendJson(res, 500, { success: false, error: 'Internal Server Error: ' + err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  PORTFOLIO & CMS SERVER RUNNING`);
  console.log(`  Public Portfolio: http://localhost:${PORT}`);
  console.log(`  Private Admin:    http://localhost:${PORT}/admin`);
  console.log(`======================================================\n`);
});
