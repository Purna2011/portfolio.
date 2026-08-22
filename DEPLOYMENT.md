# Deployment Guide — Portfolio & Private CMS Dashboard

Your portfolio and CMS are ready to deploy to any cloud hosting provider. Below are the easiest free deployment options:

---

## 🌟 Option 1: Deploy to Render.com (Recommended Free Full-Stack Host)

Render provides free Node.js hosting with persistent disk and HTTPS.

### Steps:
1. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new) and create a repository named `portfolio`.
   - Upload the files from this folder (`C:\Users\RAVI PURNA\.gemini\antigravity\scratch\portfolio`).
2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign in with GitHub.
   - Click **New +** > **Web Service**.
   - Select your GitHub repository.
   - Set:
     - **Build Command**: *(leave empty)*
     - **Start Command**: `node server.js`
   - Click **Deploy Web Service**.
3. **Your Live Site**:
   - Render will build and deploy your portfolio at a public URL like `https://raavi-portfolio.onrender.com`.
   - Access public portfolio at `/` and private control center at `/admin`.

---

## ⚡ Option 2: Deploy to Vercel (Instant Serverless)

Vercel is great for ultrafast global CDN deployment.

### Steps:
1. Push your project files to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Select your GitHub repository.
4. Vercel automatically detects `vercel.json` and configures everything.
5. Click **Deploy**.
6. Your live portfolio will be live at `https://your-portfolio.vercel.app`!

---

## 🚂 Option 3: Deploy to Railway / Fly.io / Docker

The project includes a production-ready `Dockerfile`:
1. Push to GitHub.
2. Link your repository in [railway.app](https://railway.app).
3. Railway will build the `Dockerfile` and give you a custom domain with SSL enabled.

---

## 🗄️ Optional Supabase Cloud Database Connection

If you want your portfolio database stored in Supabase cloud PostgreSQL:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to your portfolio admin at `/admin` > **Settings & Sync**.
3. Paste your **Supabase Project URL** and **Anon Key**.
4. Check **Enable Auto-Sync to Supabase** and click **Save Cloud Config**.
