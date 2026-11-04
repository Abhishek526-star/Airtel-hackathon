# PROJECT UDYAM DIGITAL — DEPLOYMENT & PRODUCTION RUNBOOK
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Status:** Complete  

---

## 1. Hosting Architecture & Target Platforms

Project Udyam Digital is architected for zero-friction cloud deployment:

```
┌────────────────────────────────────────────────────────┐
│                   DEPLOYMENT TOPOLOGY                  │
├───────────────────────┬────────────────────────────────┤
│ Component             │ Recommended Cloud Provider     │
├───────────────────────┼────────────────────────────────┤
│ **Frontend Client**   │ Vercel / Netlify (SPA Vite)    │
│ **Backend API**       │ Render / Railway (Node Docker) │
│ **Database**          │ MongoDB Atlas (M0 / Dedicated) │
│ **Document Storage**  │ Cloudinary / Secure Local Disk │
└───────────────────────┴────────────────────────────────┘
```

---

## 2. Environment Variables Checklist

### 2.1 Backend Environment Variables (`server/.env`)
```bash
# Server Environment
NODE_ENV=production
PORT=5000

# Database Connection (MongoDB Atlas URI)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/udyam_digital?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=udyam_digital_enterprise_super_secret_jwt_key_2026

# Token Lifetime
JWT_EXPIRES_IN=7d

# Google Gemini API Key (Optional - Fallback triggers seamlessly if omitted)
GEMINI_API_KEY=AIzaSy...

# Permitted Client Origin for CORS
CLIENT_URL=https://udyam-digital.vercel.app
```

### 2.2 Frontend Environment Variables (`client/.env`)
```bash
# Base URL of Deployed Backend API
VITE_API_BASE_URL=https://udyam-digital-api.onrender.com/api
```

---

## 3. Step-by-Step Deployment Instructions

### 3.1 Deploying the Backend on Render
1. Connect your GitHub repository to [Render.com](https://render.com).
2. Create a new **Web Service**.
3. Set the **Root Directory** to `server`.
4. Configure the build and start commands:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
5. Under **Environment Variables**, paste the backend variables from Section 2.1.
6. Once deployed, run the seed script via Render's Shell or initial startup:
   ```bash
   npm run seed
   ```

### 3.2 Deploying the Frontend on Vercel
1. Connect your repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Configure Build Settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add the environment variable:
   - `VITE_API_BASE_URL`: URL of your deployed Render backend (e.g., `https://udyam-digital-api.onrender.com/api`).
6. Deploy.

---

## 4. Local Development & Verification Commands

```bash
# 1. Install root, server, and client dependencies
npm install --prefix server
npm install --prefix client

# 2. Seed database with 25 products, demo users, and 5,000 synthetic leads
npm run seed --prefix server

# 3. Run automated backend subsystem verification tests
node server/tests/api.test.js

# 4. Build frontend production bundle
npm run build --prefix client

# 5. Start development servers
# Terminal 1: Backend API (Port 5000)
npm run dev --prefix server

# Terminal 2: Frontend Client (Port 5173)
npm run dev --prefix client
```

