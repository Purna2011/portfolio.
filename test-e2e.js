const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING PORTFOLIO & CMS AUTOMATED TEST SUITE ---');

  // Test 1: Public Portfolio GET
  console.log('\n[1] Testing GET /api/portfolio...');
  const pubRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/portfolio',
    method: 'GET'
  });
  console.log('Status:', pubRes.status);
  console.log('Profile Name:', pubRes.body?.data?.profile?.name);
  console.log('Published Projects Count:', pubRes.body?.data?.projects?.length);
  if (pubRes.status !== 200 || !pubRes.body?.data?.profile?.name) throw new Error('Public portfolio test failed');
  console.log('✓ Public portfolio API passed');

  // Test 2: Authentication Login
  console.log('\n[2] Testing POST /api/auth/login...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'raavipurnasatyakumar@gmail.com',
    password: 'admin1234'
  });
  console.log('Login Status:', loginRes.status);
  console.log('Token received:', !!loginRes.body?.token);
  if (loginRes.status !== 200 || !loginRes.body?.token) throw new Error('Auth login failed');
  const token = loginRes.body.token;
  console.log('✓ Authentication login passed');

  // Test 3: Admin Data GET
  console.log('\n[3] Testing GET /api/admin/data with auth token...');
  const adminRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/data',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Admin Data Status:', adminRes.status);
  console.log('Total Projects in Admin (including drafts):', adminRes.body?.data?.projects?.length);
  console.log('Skills Count:', adminRes.body?.data?.skills?.length);
  if (adminRes.status !== 200) throw new Error('Admin data retrieval failed');
  console.log('✓ Admin full state query passed');

  // Test 4: Create New Project via Admin (+ Add Project Workflow)
  console.log('\n[4] Testing POST /api/admin/projects (+ Add New Project)...');
  const newProjPayload = {
    title: 'Customer Lifetime Value (LTV) Prediction & Cohort Modeling',
    category: 'Product Analytics',
    short_description: 'Predictive analytics pipeline modeling 18-month customer lifetime value to optimize CAC-to-LTV payback periods.',
    full_description: 'Designed a machine learning and SQL cohort framework analyzing multi-touch attribution and repurchase probabilities.',
    technologies: ['Python', 'SQL', 'Scikit-Learn', 'Power BI', 'Survival Analysis'],
    problem_statement: 'High acquisition spending on low-retention cohorts was inflating customer acquisition costs (CAC).',
    objective: 'Predict 12-month expected customer value at day 14 of registration.',
    dataset: '180,000 transaction histories spanning 3 years.',
    methodology: 'Built Gamma-Gamma and BG/NBD probability models combined with gradient boosting.',
    key_findings: 'Top 10% of customers generated 58% of cumulative margin.',
    business_impact: 'Shifted paid acquisition budget towards high-LTV personas, reducing customer acquisition payback from 11 months to 6.2 months.',
    github_url: 'https://github.com/raavipurna/ltv-cohort-modeling',
    live_demo_url: 'https://demo.raavipurna.dev/ltv-model',
    images: ['assets/project-product-1.svg'],
    featured: true,
    published: true
  };

  const createProjRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/projects',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, newProjPayload);

  console.log('Create Project Status:', createProjRes.status);
  const createdProject = createProjRes.body?.data;
  console.log('Created Project ID:', createdProject?.id);
  console.log('Created Project Title:', createdProject?.title);
  if (createProjRes.status !== 201 || !createdProject?.id) throw new Error('Create project failed');
  console.log('✓ Project creation (+ Add Project) passed');

  // Test 5: Verify New Project Appears on Public Portfolio
  console.log('\n[5] Verifying project automatically appears on public portfolio...');
  const pubVerifyRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/portfolio',
    method: 'GET'
  });
  const foundPub = pubVerifyRes.body?.data?.projects?.find(p => p.id === createdProject.id);
  console.log('Found newly created project on public site:', !!foundPub);
  if (!foundPub) throw new Error('New project did not appear on public portfolio!');
  console.log('✓ Zero-code public update verified');

  // Test 6: Edit Project & Version History
  console.log('\n[6] Testing project edit with version history tracking...');
  const editProjRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/projects/${createdProject.id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: 'Customer Lifetime Value (LTV) & Churn Survival Model [Updated]',
    business_impact: 'Reduced CAC payback to 5.8 months and increased 90-day repurchase margin by +22.4%.',
    _change_note: 'Updated payback metrics with Q3 cohort audit data'
  });
  console.log('Edit Project Status:', editProjRes.status);
  console.log('Updated Version Number:', editProjRes.body?.data?.version);
  if (editProjRes.status !== 200 || editProjRes.body?.data?.version !== 2) throw new Error('Project edit failed');
  console.log('✓ Project edit and version increment passed');

  // Test 7: Get Version History Snapshots
  console.log('\n[7] Testing GET /api/admin/projects/:id/versions...');
  const verHistoryRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/projects/${createdProject.id}/versions`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Version snapshots count:', verHistoryRes.body?.data?.length);
  if (verHistoryRes.body?.data?.length < 2) throw new Error('Version snapshots not recorded properly');
  const v1 = verHistoryRes.body.data.find(v => v.version_number === 1);
  console.log('Found Version #1 snapshot note:', v1?.change_note);
  console.log('✓ Version history tracking passed');

  // Test 8: Restore Historical Version
  console.log('\n[8] Testing 1-Click Version Snapshot Restore...');
  const restoreRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/projects/${createdProject.id}/restore`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, { version_id: v1.version_id });
  console.log('Restore Status:', restoreRes.status);
  console.log('Restored Title:', restoreRes.body?.data?.title);
  if (restoreRes.status !== 200 || restoreRes.body?.data?.title !== newProjPayload.title) {
    throw new Error('Version restore failed');
  }
  console.log('✓ Version restore passed');

  // Test 9: File Upload (Screenshot / Resume)
  console.log('\n[9] Testing POST /api/upload...');
  const sampleBase64 = Buffer.from('sample-image-data-binary-content').toString('base64');
  const uploadRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    filename: 'test-screenshot.png',
    data: `data:image/png;base64,${sampleBase64}`
  });
  console.log('Upload Status:', uploadRes.status);
  console.log('Uploaded File URL:', uploadRes.body?.file_url);
  if (uploadRes.status !== 200 || !uploadRes.body?.file_url) throw new Error('Upload failed');
  console.log('✓ File upload API passed');

  // Test 10: Delete Project with Confirmation
  console.log('\n[10] Testing project deletion...');
  const delRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/projects/${createdProject.id}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Delete Status:', delRes.status);
  if (delRes.status !== 200) throw new Error('Delete failed');

  // Verify deletion on public site
  const pubVerifyAfterDel = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/portfolio',
    method: 'GET'
  });
  const foundAfterDel = pubVerifyAfterDel.body?.data?.projects?.find(p => p.id === createdProject.id);
  console.log('Project present after deletion:', !!foundAfterDel);
  if (foundAfterDel) throw new Error('Project still present after deletion!');
  console.log('✓ Project deletion verified');

  console.log('\n======================================================');
  console.log('  ALL 10 AUTOMATED ACCEPTANCE TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Error:', err);
  process.exit(1);
});
