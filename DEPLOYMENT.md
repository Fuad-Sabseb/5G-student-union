# Deploying GBSG to Production

This covers the three things you need to put the site live: a production database, a hosted backend, and a hosted frontend.

## 1. MongoDB Atlas (production database)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) if you haven't already.
2. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) — simplest option since your backend host's IP isn't fixed on most free tiers. Tighten this later if your host gives you a static IP.
3. Under **Database Access**, create a database user with a strong password.
4. Get your connection string (**Connect → Drivers**) — it looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shanan_gibe_union?retryWrites=true&w=majority
   ```
   This is your production `MONGO_URI`.

## 2. Backend hosting

Any Node host works (Render, Railway, Fly.io). Render's free tier is a solid default:

1. Push the `backend/` folder to a GitHub repo (or the whole project — just point Render at the `backend` subdirectory).
2. On [render.com](https://render.com): **New → Web Service**, connect the repo.
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add environment variables (Render dashboard → Environment):
   ```
   PORT=10000            (Render sets this automatically — you can omit it)
   NODE_ENV=production
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<a long random string — generate with: openssl rand -hex 32>
   JWT_EXPIRES_IN=30d
   CLIENT_URL=<your deployed frontend URL, e.g. https://gbsg.vercel.app>
   GOOGLE_CLIENT_ID=<your Google OAuth Client ID from Google Cloud Console>
   SMTP_EMAIL=<your Gmail address>
   SMTP_PASSWORD=<your Gmail app password>
   GEMINI_API_KEY=<your Gemini API key (optional)>
   ```
4. Deploy. Check `https://<your-backend>.onrender.com/api/health` returns `{"status":"ok",...}`.

### ⚠️ Important: uploaded images won't survive redeploys on most free hosting
The gallery/news/blog image upload feature (`/api/upload`) writes files to a local `backend/uploads` folder. Render, Railway, and similar platforms use **ephemeral disks** on their free/standard tiers — meaning uploaded files are wiped on every redeploy or restart. This is fine for local development and testing, but for a real production site you have two options:

- **Simplest fix:** Render's paid plans support a "Persistent Disk" you can mount at `/opt/render/project/src/backend/uploads` — cheap and requires zero code changes.
- **More robust fix:** switch image storage to a cloud provider like Cloudinary or AWS S3 (free tiers available). This would mean swapping `multer.diskStorage` for a cloud-upload equivalent in `backend/middleware/uploadMiddleware.js` — a reasonable follow-up task if you want it, just let me know.

Until one of those is in place, treat uploaded images as temporary in production.

## 3. Frontend hosting

Vercel is the easiest fit for a Vite app:

1. Push `frontend/` to GitHub (same repo is fine).
2. On [vercel.com](https://vercel.com): **New Project**, import the repo, set **Root Directory** to `frontend`.
3. Vercel auto-detects Vite (`npm run build`, output `dist`). The `vercel.json` already included in this project handles React Router's client-side routes, so deep links like `/about` won't 404 on refresh.
4. Add environment variables:
   ```
   VITE_API_URL=https://<your-backend>.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=<your Google OAuth Client ID from Google Cloud Console>
   ```
   
   ⚠️ **IMPORTANT:** The `VITE_GOOGLE_CLIENT_ID` must be the same Client ID you used for the backend. Get it from [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
5. Deploy. Visit the Vercel URL — the site should load and talk to your live backend.

**Using Netlify instead?** The project also includes `frontend/public/_redirects` for Netlify's equivalent SPA routing fix — same idea, different platform. Build command `npm run build`, publish directory `dist`.

## 4. Custom domain (optional)

Both Render and Vercel let you attach a custom domain (e.g. `gbsg.jimma.edu` or `shanangibe.org`) under their respective dashboard's Domain settings — you'll add a CNAME/A record with your domain registrar pointing at the host. Once that's done, update `CLIENT_URL` on the backend and `VITE_API_URL` on the frontend to match the final domains, and redeploy both.

## 5. Configure Google OAuth for Production

After deploying, you **must** update your Google Cloud Console OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Add your **production frontend URL** to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
4. Add the same URL to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app
   ```
5. Click **Save**
6. Wait 5-10 minutes for changes to propagate

**Common mistake:** Forgetting to add the production URL causes the "Authorization Error" you saw.

## 6. Post-deploy checklist

- [ ] `GET /api/health` on the live backend returns `ok`
- [ ] Frontend loads at its live URL, in both English and Afaan Oromo
- [ ] **Test Google Sign-In** - Click "Sign in with Google", select an account, verify it works
- [ ] Register a test account with email/password
- [ ] In MongoDB Atlas manually set that test member's `role` to `"admin"` and `membershipStatus` to `"active"`
- [ ] Log in as that admin, confirm the **Admin Panel** link appears and each section (Members, News & Events, Gallery, Articles, Support Requests) loads
- [ ] Publish a test news post and a test event, confirm they render correctly in both languages
- [ ] Upload a gallery photo, confirm it displays (remember the ephemeral-storage caveat above)
- [ ] Submit a test support request as a regular member, then respond to it from the admin panel
- [ ] Test on a phone-sized screen — the header collapses to a hamburger menu under ~900px width
