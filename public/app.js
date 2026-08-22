// Public Portfolio Client Application — Purna Satya Kumar Raavi

const AUTHENTIC_MASTER_DATA = {
  profile: {
    name: "Purna Satya Kumar Raavi",
    title: "Data & Product Analyst",
    headline: "SQL • Python • Power BI • Tableau | Turning Data Into Clear, Actionable Insights",
    short_bio: "I’m a Computer Science graduate specializing in AI & Machine Learning, with a growing focus on data and product analytics. I enjoy working with raw data, finding the story behind the numbers, and turning that story into something people can actually use.",
    about_headline: "Turning messy data into clear, defensible business decisions.",
    about_text: "I’m a Computer Science graduate specializing in AI & Machine Learning, with a growing focus on data and product analytics. I enjoy working with raw data, finding the story behind the numbers, and turning that story into something people can actually use.\n\nMy hands-on experience includes SQL, Python, Excel, Power BI, Tableau, data cleaning, exploratory analysis, KPI reporting, and dashboard development. Through internships and personal projects, I’ve worked with datasets ranging from thousands to 1M+ records, giving me practical exposure to data quality, analysis, visualization, and business problem-solving.\n\nI’m still early in my career, but I’ve never wanted to learn only from theory. I build projects, experiment with different tools, question my results, and keep improving. My goal is simple: understand the problem first, let the data speak, and turn the analysis into a useful decision.",
    email: "purnaravi26@gmail.com",
    phone: "+91 9390912936",
    location: "Andhra Pradesh, India",
    linkedin: "https://linkedin.com/in/purnaravi26",
    github: "https://github.com/purnaravi26",
    resume_url: "/assets/Purna_Satya_Kumar_Raavi_Resume.pdf",
    profile_photo: "assets/avatar.svg",
    open_to_work: true,
    status_text: "Open to Work • Data & Product Analyst Roles",
    years_experience: "1+",
    projects_completed: "6+",
    satisfaction_rate: "100%",
    records_analyzed: "1M+",
    fraud_reduction: "30%",
    decision_visibility: "35%"
  },
  projects: [
    {
      id: "proj-1",
      title: "Insight360 — Enterprise Analytics for Customer Retention, Service Excellence & Workforce Inclusion",
      slug: "insight360-enterprise-analytics",
      short_description: "A multi-dashboard Power BI project exploring customer service, customer churn and retention, and workforce diversity across 3 business areas.",
      full_description: "Insight360 is an enterprise analytics project exploring customer service operations, customer retention risk, and workforce diversity across 3 dedicated interactive dashboards.",
      category: "Power BI & Business Intelligence",
      technologies: ["Power BI", "DAX", "Data Modeling", "ETL", "Excel"],
      problem_statement: "Organizations often struggle to connect operational service metrics, customer churn risks, and workforce diversity into unified decision-making visibility.",
      objective: "Build 3 interactive dashboards providing clear visibility into customer satisfaction, churn drivers, and gender representation across departments.",
      dataset: "Enterprise customer service tickets, telecom churn datasets, and workforce demographic logs across multiple departments.",
      methodology: "Built dynamic DAX measures, star schema relationships, conditional KPIs, and churn risk segmentations.",
      key_findings: "Identified top churn drivers linked to contract terms and payment methods; uncovered specific customer service bottlenecks affecting resolution times.",
      business_impact: "Equipped stakeholders with clear, self-serve dashboards to monitor customer retention, improve resolution KPIs, and track diversity goals.",
      github_url: "https://github.com/Purna2011/Insight360-Enterprise-Analytics-for-Customer-Retention-Service-Excellence-Workforce-Inclusion",
      live_demo_url: "",
      images: ["assets/project-powerbi-1.svg"],
      featured: true,
      published: true,
      order: 1,
      version: 1
    },
    {
      id: "proj-2",
      title: "SQL Business Insights & Analytical Queries",
      slug: "sql-business-insights",
      short_description: "A practical SQL analytics project answering real business questions using advanced joins, aggregations, window functions, and CTEs.",
      full_description: "Focused on practical SQL querying to extract business insights from transactional datasets, including customer purchasing behavior, revenue trends, and operational efficiency.",
      category: "SQL & Business Intelligence",
      technologies: ["SQL", "MySQL", "PostgreSQL", "Window Functions", "CTEs", "Data Aggregation"],
      problem_statement: "Raw transactional data across multiple tables is difficult for decision-makers to interpret without clean analytical queries.",
      objective: "Design clean, optimized SQL queries using CTEs and window functions to extract revenue metrics, customer cohorts, and sales trends.",
      dataset: "Multi-table relational databases containing orders, customers, products, and payment transactions.",
      methodology: "Applied Common Table Expressions (CTEs), multi-table JOINs, subqueries, and window ranking functions (ROW_NUMBER, DENSE_RANK).",
      key_findings: "Extracted repeat customer purchase frequency, top-performing product categories, and monthly revenue growth rates.",
      business_impact: "Streamlined analytical query extraction, reducing manual spreadsheet reporting effort.",
      github_url: "https://github.com/purnaravi26/sql-business-analysis",
      live_demo_url: "",
      images: ["assets/project-sql-1.svg"],
      featured: true,
      published: true,
      order: 2,
      version: 1
    },
    {
      id: "proj-3",
      title: "T20 Cricket Batsmen Performance Analysis",
      slug: "t20-cricket-batsmen-analysis",
      short_description: "Power BI dashboard analyzing batsman strike rates, averages, boundaries, and performance benchmarks.",
      full_description: "Interactive sports analytics dashboard benchmarking batsmen across match phases, boundary percentages, and run contributions.",
      category: "Power BI & Analytics",
      technologies: ["Power BI", "DAX", "Data Modeling", "Excel", "Data Cleaning"],
      problem_statement: "Evaluating cricket batsmen solely on traditional averages overlooks strike rate impact and boundary frequency.",
      objective: "Build a comprehensive Power BI dashboard to compare batsman efficiency across runs, strike rate, and boundary percentages.",
      dataset: "Ball-by-ball and match-level T20 cricket player performance records.",
      methodology: "Transformed raw cricket data, created DAX measures for strike rates and boundary contributions, and built player comparison visual matrix.",
      key_findings: "Highlighted high-impact batsmen who maintain strong strike rates in middle and death overs.",
      business_impact: "Demonstrated data modeling and sports analytics visualization techniques for player performance benchmarking.",
      github_url: "https://github.com/purnaravi26",
      live_demo_url: "",
      images: ["assets/project-cricket-1.svg"],
      featured: false,
      published: true,
      order: 3,
      version: 1
    },
    {
      id: "proj-4",
      title: "Supermarket Sales Analysis",
      slug: "supermarket-sales-analysis",
      short_description: "Exploratory data analysis of retail transactions across product lines, payment modes, and customer ratings.",
      full_description: "In-depth exploratory data analysis uncovering sales patterns, gross income drivers, and customer satisfaction across store branches.",
      category: "Python & Data Analysis",
      technologies: ["Python", "Pandas", "Matplotlib", "Seaborn", "EDA"],
      problem_statement: "Supermarket chains need clarity on which product lines drive profitability and how branch performance differs.",
      objective: "Perform exploratory data analysis to identify top revenue-generating product lines, branch performance differences, and payment preferences.",
      dataset: "Historical supermarket transaction records across multiple branch locations.",
      methodology: "Cleaned datasets with Pandas, analyzed distributions, and visualized correlation between ratings, gross income, and product categories.",
      key_findings: "Identified highest-margin product lines and peak shopping hours across branches.",
      business_impact: "Provides actionable guidance on stock priority and targeted promotions for high-margin categories.",
      github_url: "https://github.com/purnaravi26",
      live_demo_url: "",
      images: ["assets/project-product-1.svg"],
      featured": false,
      published: true,
      order: 4,
      version: 1
    },
    {
      id: "proj-5",
      title: "Traffic Sign Detection",
      slug: "traffic-sign-detection",
      short_description: "Computer vision and deep learning project classifying traffic signs to support intelligent transportation systems.",
      full_description: "Implemented deep convolutional neural network models to accurately recognize and classify traffic signs under varying road and lighting conditions.",
      category: "Machine Learning & AI",
      technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "CNN"],
      problem_statement: "Autonomous systems require high-accuracy real-time traffic sign recognition under diverse weather and lighting conditions.",
      objective: "Train a convolutional neural network (CNN) model to accurately identify and classify multiple categories of traffic signs.",
      dataset: "German Traffic Sign Recognition Benchmark (GTSRB) dataset containing thousands of annotated sign images.",
      methodology: "Preprocessed images with OpenCV, augmented training datasets, and trained multi-layer CNN with dropout and batch normalization.",
      key_findings: "Achieved high classification accuracy across 40+ traffic sign classes with strong generalization.",
      business_impact: "Applied deep learning and computer vision techniques for real-world automated recognition systems.",
      github_url: "https://github.com/purnaravi26",
      live_demo_url: "",
      images: ["assets/project-sql-2.svg"],
      featured: false,
      published: true,
      order: 5,
      version: 1
    },
    {
      id: "proj-6",
      title: "Bike Sharing Demand Prediction",
      slug: "bike-sharing-demand-prediction",
      short_description: "Regression modeling to forecast hourly bike rental demand using weather, seasonal, and temporal variables.",
      full_description: "Built and evaluated multiple regression models to predict hourly rental demand for bike-sharing programs, helping optimize fleet distribution.",
      category: "Machine Learning & AI",
      technologies: ["Python", "Scikit-Learn", "Regression", "Pandas", "Feature Engineering"],
      problem_statement: "Bike sharing operators face vehicle shortages or surpluses when hourly rental demand fluctuates unpredictably.",
      objective: "Build regression models to forecast hourly rental demand based on weather, temperature, humidity, and calendar variables.",
      dataset: "Historical hourly bike sharing rental logs with associated meteorological data.",
      methodology: "Engineered seasonal and peak-hour features, trained Linear Regression, Random Forest, and Gradient Boosting regressors.",
      key_findings: "Temperature, hour of day, and working day indicators were the strongest predictors of rental spikes.",
      business_impact: "Enables proactive fleet rebalancing across stations ahead of morning and evening commute hours.",
      github_url: "https://github.com/purnaravi26",
      live_demo_url: "",
      images: ["assets/project-powerbi-2.svg"],
      featured: false,
      published: true,
      order: 6,
      version: 1
    }
  ],
  skills: [
    { id: "sk-1", name: "SQL (CTEs, Window Functions, Joins, Aggregations)", category: "Data Querying & Databases", level: "Advanced", featured: true, order: 1 },
    { id: "sk-2", name: "MySQL & PostgreSQL", category: "Data Querying & Databases", level: "Advanced", featured: true, order: 2 },
    { id: "sk-3", name: "Power BI (DAX, Data Modeling, Star Schema, Power Query)", category: "Business Intelligence & Visualization", level: "Advanced", featured: true, order: 3 },
    { id: "sk-4", name: "Tableau & Interactive Dashboards", category: "Business Intelligence & Visualization", level: "Proficient", featured: true, order: 4 },
    { id: "sk-5", name: "KPI Reporting & Business Performance Metrics", category: "Business Intelligence & Visualization", level: "Advanced", featured: true, order: 5 },
    { id: "sk-6", name: "Python (Pandas, NumPy, Matplotlib, Seaborn)", category: "Programming & Analytics", level: "Advanced", featured: true, order: 6 },
    { id: "sk-7", name: "Exploratory Data Analysis (EDA) & Data Cleaning", category: "Programming & Analytics", level: "Advanced", featured: true, order: 7 },
    { id: "sk-8", name: "ETL Pipelines & Automated Scripts", category: "Programming & Analytics", level: "Proficient", featured: false, order: 8 },
    { id: "sk-9", name: "Product Analytics & Funnel Analysis", category: "Product & Business Strategy", level: "Proficient", featured: true, order: 9 },
    { id: "sk-10", name: "Customer Retention & Churn Analysis", category: "Product & Business Strategy", level: "Proficient", featured: true, order: 10 },
    { id: "sk-11", name: "Advanced Excel (Pivot Tables, Power Query, Formulas)", category: "Tools & Frameworks", level: "Advanced", featured: true, order: 11 },
    { id: "sk-12", name: "Git & GitHub Version Control", category: "Tools & Frameworks", level: "Proficient", featured: false, order: 12 },
    { id: "sk-13", name: "Machine Learning & AI Foundations (CNN, Regression)", category: "Tools & Frameworks", level: "Proficient", featured: false, order: 13 }
  ],
  experience: [
    {
      id: "exp-1",
      role: "Data & Product Analytics Intern",
      company: "DigitalEdify",
      location: "India",
      start_date: "Jul 2025",
      end_date: "Feb 2026",
      current: false,
      description: "Worked with SQL, Excel, Power BI, and ETL pipelines to analyze operational records, support business analysis, and build automated KPI reporting.",
      responsibilities: [
        "Analyzed 1M+ operational records for business and product-related analysis.",
        "Worked on data governance and data-quality checks, helping reduce discrepancies and fraud risks by 30%.",
        "Built automated reporting workflows and Power BI dashboards, improving visibility for business decisions by 35%."
      ],
      technologies: ["SQL", "Excel", "Power BI", "ETL Pipelines"],
      order: 1,
      visible: true
    },
    {
      id: "exp-2",
      role: "Data & Risk Analytics Intern",
      company: "Fox Trading Solutions – 1Stop.ai",
      location: "India",
      start_date: "Apr 2025",
      end_date: "May 2025",
      current: false,
      description: "Explored risk analytics, data cleaning, and statistical patterns to assist data-driven operational decisions.",
      responsibilities: [
        "Analyzed risk patterns and transactional datasets using Python and SQL.",
        "Supported analytical workflows and reporting dashboards to assist decision-making.",
        "Delivered actionable findings on data patterns to support operational resource allocation."
      ],
      technologies: ["Python", "SQL", "Excel", "Risk Analytics"],
      order: 2,
      visible: true
    },
    {
      id: "exp-3",
      role: "Network Analyst (Virtual Internship)",
      company: "AICTE Cisco Virtual Internship",
      location: "Virtual",
      start_date: "Sep 2023",
      end_date: "Nov 2023",
      current: false,
      description: "Gained foundational experience in network analysis, protocols, and data infrastructure monitoring.",
      responsibilities: [
        "Monitored network topology and traffic flows using Cisco Packet Tracer.",
        "Analyzed network logs and diagnostic metrics to identify latency bottlenecks."
      ],
      technologies: ["Networking", "Cisco Packet Tracer", "Network Analytics"],
      order: 3,
      visible: true
    },
    {
      id: "exp-4",
      role: "IoT & Computer Vision Project Intern",
      company: "L&T IoT Internship",
      location: "India",
      start_date: "2023",
      end_date: "2023",
      current: false,
      description: "Built an eye-controlled interface project utilizing Python and OpenCV for assistive device interaction.",
      responsibilities: [
        "Developed computer vision algorithms for real-time eye gaze tracking using OpenCV.",
        "Integrated sensor outputs with hardware controllers for hands-free device control."
      ],
      technologies: ["Python", "OpenCV", "IoT", "Computer Vision"],
      order: 4,
      visible: true
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.Tech in Computer Science and Engineering (Artificial Intelligence & Machine Learning)",
      institution: "Lakireddy Bali Reddy College of Engineering",
      location: "Mylavaram, Andhra Pradesh, India",
      start_date: "2021",
      end_date: "2025",
      grade: "7.49 / 10 CGPA",
      description: "Specialized coursework: Database Management Systems (DBMS), Data Structures & Algorithms, Machine Learning, Deep Learning, Python Programming, Probability & Statistics."
    },
    {
      id: "edu-2",
      degree: "Intermediate (MPC)",
      institution: "Sri Nidhi Junior College",
      location: "Andhra Pradesh, India",
      start_date: "2019",
      end_date: "2021",
      grade: "83.4%",
      description: "Mathematics, Physics, Chemistry."
    },
    {
      id: "edu-3",
      degree: "Secondary School Certificate (SSC)",
      institution: "Dr. K.K.R. Gowtham Concept School",
      location: "Andhra Pradesh, India",
      start_date: "2018",
      end_date: "2019",
      grade: "8.2 / 10 CGPA",
      description: "General Secondary Education with distinction in Mathematics and Science."
    }
  ],
  certifications: [
    {
      id: "cert-1",
      title: "Data Analytics & Visualization Job Simulation",
      issuer: "Accenture (Forage)",
      issue_date: "Verified",
      credential_id: "",
      verification_url: "",
      image_url: "assets/badge-microsoft.svg"
    },
    {
      id: "cert-2",
      title: "Power BI Job Simulation",
      issuer: "PwC Switzerland (Forage)",
      issue_date: "Verified",
      credential_id: "",
      verification_url: "",
      image_url: "assets/badge-microsoft.svg"
    },
    {
      id: "cert-3",
      title: "Data Visualization: Empowering Business with Effective Insights",
      issuer: "Tata (Forage)",
      issue_date: "Verified",
      credential_id: "",
      verification_url: "",
      image_url: "assets/badge-google.svg"
    },
    {
      id: "cert-4",
      title: "Python for Data Science",
      issuer: "IBM",
      issue_date: "Verified",
      credential_id: "",
      verification_url: "",
      image_url: "assets/badge-sql.svg"
    },
    {
      id: "cert-5",
      title: "Data Science Orientation",
      issuer: "IBM",
      issue_date: "Verified",
      credential_id: "",
      verification_url: "",
      image_url: "assets/badge-sql.svg"
    }
  ],
  publications: [
    {
      id: "pub-1",
      title: "RetinaGuardX: A Hybrid Model with Grad-CAM for Retinal Disease Detection",
      conference: "ICICDS-2025",
      status: "Accepted",
      description: "Research paper developing a hybrid deep learning model enhanced with Grad-CAM interpretability for high-accuracy retinal disease screening. Accepted for presentation at ICICDS-2025.",
      link: ""
    }
  ],
  social_links: [
    { id: "soc-1", platform: "GitHub", url: "https://github.com/purnaravi26", icon: "github" },
    { id: "soc-2", platform: "LinkedIn", url: "https://linkedin.com/in/purnaravi26", icon: "linkedin" },
    { id: "soc-3", platform: "Email", url: "mailto:purnaravi26@gmail.com", icon: "mail" }
  ],
  resume: {
    filename: "Purna_Satya_Kumar_Raavi_Resume.pdf",
    file_url: "/assets/Purna_Satya_Kumar_Raavi_Resume.pdf",
    last_updated: "2026-08-22",
    file_size: "245 KB"
  },
  categories: [
    "All",
    "Power BI & Business Intelligence",
    "SQL & Business Intelligence",
    "Power BI & Analytics",
    "Python & Data Analysis",
    "Machine Learning & AI"
  ]
};

let portfolioData = AUTHENTIC_MASTER_DATA;
let activeCategory = 'All';

async function initPortfolio() {
  // 1. Check local live cache (from Admin panel edits)
  const cached = localStorage.getItem('portfolio_live_state');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.profile && parsed.profile.name === "Purna Satya Kumar Raavi") {
        portfolioData = {
          profile: parsed.profile,
          projects: (parsed.projects || []).filter(p => p.published),
          skills: parsed.skills || [],
          experience: parsed.experience || [],
          education: parsed.education || [],
          certifications: parsed.certifications || [],
          publications: parsed.publications || [],
          social_links: parsed.social_links || [],
          resume: parsed.resume || AUTHENTIC_MASTER_DATA.resume,
          categories: parsed.site_settings?.categories || AUTHENTIC_MASTER_DATA.categories
        };
        renderAll(portfolioData);
        return;
      }
    } catch (e) {
      console.warn('Cache parse error:', e);
    }
  }

  // 2. Render verified authentic master data immediately (Guarantees Picture 1 for every visitor)
  portfolioData = AUTHENTIC_MASTER_DATA;
  renderAll(portfolioData);

  // 3. Optional live sync from server API (only accept if it has updated real data)
  try {
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && json.data.profile) {
        // Only accept server data if it's the verified authentic profile, not the dummy template
        if (json.data.profile.email === 'purnaravi26@gmail.com' || json.data.profile.name === 'Purna Satya Kumar Raavi') {
          portfolioData = json.data;
          renderAll(portfolioData);
        }
      }
    }
  } catch (err) {
    console.warn('Server sync bypassed, using verified master data.');
  }
}

function renderAll(data) {
  renderProfile(data.profile, data.resume);
  renderCategories(data.categories, data.projects);
  renderProjects(data.projects, activeCategory);
  renderSkills(data.skills);
  renderExperience(data.experience);
  renderCredentials(data.education, data.certifications);
  renderPublications(data.publications);
  renderContact(data.profile, data.social_links);
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderProfile(profile, resume) {
  if (!profile) return;

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = `${profile.name} | ${profile.title}`;

  const navName = document.getElementById('nav-brand-name');
  if (navName) navName.textContent = profile.name;

  const navTitle = document.getElementById('nav-brand-title');
  if (navTitle) navTitle.textContent = profile.title;

  const heroName = document.getElementById('hero-name-title');
  if (heroName) {
    heroName.innerHTML = `Turning Data Into Clear,<br><span class="gradient-text">Actionable Insights.</span>`;
  }

  const heroHeadline = document.getElementById('hero-headline');
  if (heroHeadline) {
    heroHeadline.textContent = profile.headline 
      ? `${profile.headline} | ${profile.short_bio || ''}`
      : (profile.short_bio || '');
  }

  const statusPill = document.getElementById('hero-status-pill');
  const statusText = document.getElementById('hero-status-text');
  if (statusText) {
    statusText.textContent = profile.status_text || 'Open to Work • Data & Product Analyst Roles';
    if (statusPill) statusPill.style.display = profile.open_to_work ? 'inline-flex' : 'none';
  }

  // Real Verified Metrics
  const statRecords = document.getElementById('stat-records');
  if (statRecords) statRecords.textContent = profile.records_analyzed || '1M+';

  const statFraud = document.getElementById('stat-fraud');
  if (statFraud) statFraud.textContent = profile.fraud_reduction || '30%';

  const statVisibility = document.getElementById('stat-visibility');
  if (statVisibility) statVisibility.textContent = profile.decision_visibility || '35%';

  const heroLocation = document.getElementById('hero-location-tag');
  if (heroLocation && profile.location) heroLocation.textContent = profile.location.split(',')[0].trim() + ', IN';

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

  // Resume Download Buttons
  const navResume = document.getElementById('nav-resume-btn');
  if (navResume) {
    navResume.onclick = triggerResumeDownload;
  }
  const heroResume = document.getElementById('hero-download-resume');
  if (heroResume) {
    heroResume.onclick = triggerResumeDownload;
  }
}

// Guaranteed Instant Resume Downloader
async function triggerResumeDownload(e) {
  if (e && e.preventDefault) e.preventDefault();
  showToast('Preparing resume download...', 'info');

  const filename = 'Purna_Satya_Kumar_Raavi_Resume.pdf';
  const targetUrls = [
    '/assets/Purna_Satya_Kumar_Raavi_Resume.pdf',
    '/Purna_Satya_Kumar_Raavi_Resume.pdf',
    '/uploads/Purna_Satya_Kumar_Raavi_Resume.pdf'
  ];

  // 1. Try fetching existing PDF asset as a Blob
  for (const url of targetUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 200 && (blob.type.includes('pdf') || blob.type.includes('octet'))) {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          showToast('✓ Resume downloaded successfully!', 'success');
          return;
        }
      }
    } catch (err) {
      console.warn('Direct fetch attempt failed:', url, err);
    }
  }

  // 2. Direct embedded PDF Fallback (works 100% offline and in all browsers)
  try {
    const pdfContent = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj\n4 0 obj << /Length 980 >> stream\nBT\n/F2 18 Tf\n50 740 Td\n(PURNA SATYA KUMAR RAAVI) Tj\n/F1 11 Tf\n0 -22 Td\n(Data & Product Analyst | SQL - Python - Power BI - Tableau) Tj\n0 -18 Td\n(Email: purnaravi26@gmail.com | Phone: +91 9390912936 | Location: Andhra Pradesh, India) Tj\n0 -16 Td\n(GitHub: github.com/purnaravi26 | LinkedIn: linkedin.com/in/purnaravi26) Tj\n/F2 13 Tf\n0 -28 Td\n(PROFESSIONAL SUMMARY) Tj\n/F1 10 Tf\n0 -16 Td\n(Data & Product Analyst with Computer Science background in AI & ML. Experienced in SQL CTEs,) Tj\n0 -14 Td\n(Window Functions, Power BI DAX modeling, Python EDA, and ETL pipelines across 1M+ records.) Tj\n/F2 13 Tf\n0 -26 Td\n(WORK EXPERIENCE) Tj\n/F2 11 Tf\n0 -16 Td\n(DigitalEdify - Data & Product Analytics Intern | Jul 2025 - Feb 2026) Tj\n/F1 10 Tf\n0 -14 Td\n(- Analyzed 1M+ operational records for business and product-related analysis.) Tj\n0 -14 Td\n(- Worked on data governance & data-quality checks, reducing fraud risks by 30%.) Tj\n0 -14 Td\n(- Built automated Power BI dashboards, improving executive decision visibility by 35%.) Tj\n/F2 11 Tf\n0 -18 Td\n(Fox Trading Solutions - 1Stop.ai - Data & Risk Analytics Intern | Apr 2025 - May 2025) Tj\n/F1 10 Tf\n0 -14 Td\n(- Explored transactional risk datasets using Python and SQL to support resource allocation.) Tj\n/F2 13 Tf\n0 -26 Td\n(KEY PROJECTS) Tj\n/F1 10 Tf\n0 -16 Td\n(1. Insight360: Enterprise Power BI Analytics for Retention, Service & Inclusion (3 Dashboards)) Tj\n0 -14 Td\n(2. SQL Business Insights: Practical SQL analytics using CTEs, Window Functions & Joins) Tj\n0 -14 Td\n(3. T20 Cricket Batsmen Performance Analysis: Interactive Power BI player benchmark model) Tj\n/F2 13 Tf\n0 -26 Td\n(EDUCATION) Tj\n/F1 10 Tf\n0 -16 Td\n(B.Tech in CSE (AI & ML) - Lakireddy Bali Reddy College of Engineering | CGPA: 7.49 / 10 (2021-2025)) Tj\n0 -14 Td\n(Intermediate (12th) - Sri Nidhi Junior College | 83.4% (2021)) Tj\nET\nendstream\nendobj\n5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\nxref\n0 7\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000262 00000 n \n0000001300 00000 n \n0000001372 00000 n \ntrailer << /Size 7 /Root 1 0 R >>\nstartxref\n1449\n%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    showToast('✓ Resume downloaded successfully!', 'success');
  } catch (finalErr) {
    console.error('Final fallback error:', finalErr);
    showToast('Failed to download resume', 'error');
  }
}

function renderCategories(categories, projects) {
  const container = document.getElementById('project-filter-tabs');
  if (!container) return;

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

function renderProjects(projects, filterCategory) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (!projects || projects.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 48px; color: var(--text-muted);">No projects available in this category.</div>`;
    return;
  }

  const filtered = filterCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === filterCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 48px; color: var(--text-muted);">No projects found under "${escapeHtml(filterCategory)}".</div>`;
    return;
  }

  grid.innerHTML = filtered.map(proj => {
    const mainImg = (proj.images && proj.images.length > 0) ? proj.images[0] : 'assets/project-powerbi-1.svg';
    const techBadges = (proj.technologies || []).slice(0, 4).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');
    
    return `
      <article class="project-card" data-id="${proj.id}">
        <div class="project-card-img-wrap" onclick="openProjectModal('${proj.id}')">
          <img src="${escapeHtml(mainImg)}" alt="${escapeHtml(proj.title)}" class="project-card-img" loading="lazy">
          <span class="project-category-tag">${escapeHtml(proj.category || 'Data Analytics')}</span>
          ${proj.featured ? '<span class="project-featured-tag">★ Featured</span>' : ''}
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title" onclick="openProjectModal('${proj.id}')">${escapeHtml(proj.title)}</h3>
          <p class="project-card-desc">${escapeHtml(proj.short_description || '')}</p>
          <div class="project-tech-stack">
            ${techBadges}
          </div>
          <div class="project-card-footer">
            <button class="btn btn-secondary btn-sm" onclick="openProjectModal('${proj.id}')">
              <span>View Case Study</span>
              <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
            </button>
            <div class="project-links-group">
              ${proj.github_url ? `<a href="${escapeHtml(proj.github_url)}" target="_blank" class="icon-link" title="GitHub"><i data-lucide="github" style="width:16px;height:16px;"></i></a>` : ''}
              ${proj.live_demo_url ? `<a href="${escapeHtml(proj.live_demo_url)}" target="_blank" class="icon-link" title="Live Demo"><i data-lucide="external-link" style="width:16px;height:16px;"></i></a>` : ''}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

function openProjectModal(projectId) {
  if (!portfolioData || !portfolioData.projects) return;
  const proj = portfolioData.projects.find(p => p.id === projectId);
  if (!proj) return;

  const modal = document.getElementById('project-modal');
  if (!modal) return;

  document.getElementById('modal-project-title').textContent = proj.title;
  document.getElementById('modal-project-category').textContent = proj.category || 'Data Analytics';
  
  const imgEl = document.getElementById('modal-main-img');
  if (imgEl) {
    const mainImg = (proj.images && proj.images.length > 0) ? proj.images[0] : 'assets/project-powerbi-1.svg';
    imgEl.src = mainImg;
    imgEl.alt = proj.title;
  }

  const galleryEl = document.getElementById('modal-gallery-thumbs');
  if (galleryEl) {
    if (proj.images && proj.images.length > 1) {
      galleryEl.innerHTML = proj.images.map((src, i) => `
        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="switchModalMainImage('${escapeHtml(src)}', this)">
          <img src="${escapeHtml(src)}" alt="Thumbnail ${i + 1}">
        </div>
      `).join('');
      galleryEl.style.display = 'flex';
    } else {
      galleryEl.innerHTML = '';
      galleryEl.style.display = 'none';
    }
  }

  document.getElementById('modal-full-desc').textContent = proj.full_description || proj.short_description || '';
  
  const techContainer = document.getElementById('modal-tech-stack');
  if (techContainer) {
    techContainer.innerHTML = (proj.technologies || []).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('');
  }

  document.getElementById('modal-problem').textContent = proj.problem_statement || 'N/A';
  document.getElementById('modal-objective').textContent = proj.objective || 'N/A';
  document.getElementById('modal-dataset').textContent = proj.dataset || 'N/A';
  document.getElementById('modal-methodology').textContent = proj.methodology || 'N/A';
  document.getElementById('modal-findings').textContent = proj.key_findings || 'N/A';
  document.getElementById('modal-impact').textContent = proj.business_impact || 'N/A';

  const ghBtn = document.getElementById('modal-github-link');
  if (ghBtn) {
    if (proj.github_url) {
      ghBtn.href = proj.github_url;
      ghBtn.style.display = 'inline-flex';
    } else {
      ghBtn.style.display = 'none';
    }
  }

  const demoBtn = document.getElementById('modal-demo-link');
  if (demoBtn) {
    if (proj.live_demo_url) {
      demoBtn.href = proj.live_demo_url;
      demoBtn.style.display = 'inline-flex';
    } else {
      demoBtn.style.display = 'none';
    }
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function switchModalMainImage(src, thumbEl) {
  const mainImg = document.getElementById('modal-main-img');
  if (mainImg) mainImg.src = src;
  const parent = thumbEl.parentElement;
  if (parent) {
    parent.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumbEl.classList.add('active');
  }
}

function renderSkills(skills) {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  if (!skills || skills.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted);">No skills listed.</div>`;
    return;
  }

  // Group by category
  const grouped = {};
  skills.forEach(s => {
    const cat = s.category || 'General Tools';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  container.innerHTML = Object.entries(grouped).map(([category, items]) => `
    <div class="skill-category-card">
      <h4 class="skill-cat-title">${escapeHtml(category)}</h4>
      <div class="skill-tags-list">
        ${items.map(item => `
          <div class="skill-item">
            <span class="skill-name">${escapeHtml(item.name)}</span>
            <span class="skill-level">${escapeHtml(item.level || 'Proficient')}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderExperience(experience) {
  const container = document.getElementById('experience-timeline');
  if (!container) return;

  if (!experience || experience.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted);">No experience listed.</div>`;
    return;
  }

  container.innerHTML = experience.map(exp => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-header">
          <div>
            <h4 class="timeline-role">${escapeHtml(exp.role)}</h4>
            <div class="timeline-company">${escapeHtml(exp.company)} • <span style="font-weight:400;color:var(--text-muted);">${escapeHtml(exp.location || 'India')}</span></div>
          </div>
          <span class="timeline-date">${escapeHtml(exp.start_date || '')} – ${exp.current ? 'Present' : escapeHtml(exp.end_date || '')}</span>
        </div>
        <p class="timeline-desc">${escapeHtml(exp.description || '')}</p>
        ${exp.responsibilities && exp.responsibilities.length > 0 ? `
          <ul class="timeline-bullets">
            ${exp.responsibilities.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
          </ul>
        ` : ''}
        ${exp.technologies && exp.technologies.length > 0 ? `
          <div class="timeline-tech-stack">
            ${exp.technologies.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
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
        <i data-lucide="award" style="width:24px;height:24px;color:var(--accent-amber);"></i>
      </div>
      <div class="cert-info">
        <h4 class="cert-title">${escapeHtml(c.title)}</h4>
        <div class="cert-issuer">${escapeHtml(c.issuer)}</div>
        <div class="cert-meta">
          <span>${escapeHtml(c.issue_date || 'Verified')}</span>
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
          ${ed.grade ? `<span style="color:#34d399;font-weight:600;margin-left:8px;">CGPA / Grade: ${escapeHtml(ed.grade)}</span>` : ''}
        </div>
        ${ed.description ? `<p style="font-size:12px;color:#94a3b8;margin-top:6px;">${escapeHtml(ed.description)}</p>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = certHtml + eduHtml;
}

function renderPublications(publications) {
  const container = document.getElementById('publications-grid');
  if (!container) return;

  if (!publications || publications.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted);">No publications added yet.</div>`;
    return;
  }

  container.innerHTML = publications.map(pub => `
    <div class="cert-card" style="border-left: 3px solid var(--accent-teal);">
      <div class="cert-badge-wrap" style="background:var(--accent-teal-subtle);border-color:rgba(20,184,166,0.3);">
        <i data-lucide="book-open" style="width:24px;height:24px;color:var(--accent-teal);"></i>
      </div>
      <div class="cert-info">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
          <h4 class="cert-title" style="font-size:15px;margin-bottom:0;">${escapeHtml(pub.title)}</h4>
          <span style="background:var(--accent-emerald-subtle);color:#34d399;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600;">${escapeHtml(pub.status || 'Accepted')}</span>
        </div>
        <div class="cert-issuer" style="color:var(--accent-blue);font-weight:500;margin-top:2px;">Conference: ${escapeHtml(pub.conference)}</div>
        <p style="font-size:13px;color:var(--text-secondary);margin-top:8px;line-height:1.6;">${escapeHtml(pub.description || '')}</p>
      </div>
    </div>
  `).join('');
}

function renderContact(profile, socialLinks) {
  if (!profile) return;
  const emailEl = document.getElementById('contact-email');
  if (emailEl && profile.email) {
    emailEl.textContent = profile.email;
    emailEl.href = `mailto:${profile.email}`;
  }

  const phoneEl = document.getElementById('contact-phone');
  if (phoneEl && profile.phone) {
    phoneEl.textContent = profile.phone;
  }

  const locEl = document.getElementById('contact-location');
  if (locEl && profile.location) locEl.textContent = profile.location;

  const ghEl = document.getElementById('contact-github');
  if (ghEl && profile.github) {
    ghEl.textContent = profile.github.replace(/^https?:\/\/(www\.)?/, '');
    ghEl.href = profile.github;
  }

  const linkedinEl = document.getElementById('contact-linkedin');
  if (linkedinEl && profile.linkedin) {
    linkedinEl.textContent = profile.linkedin.replace(/^https?:\/\/(www\.)?/, '');
    linkedinEl.href = profile.linkedin;
  }
}

// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
  initPortfolio();

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
