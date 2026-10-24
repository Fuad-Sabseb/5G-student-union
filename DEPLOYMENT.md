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
   
   # REQUIRED: Cloudinary credentials (for persistent image storage)
   CLOUDINARY_CLOUD_NAME=<your Cloudinary cloud name>
   CLOUDINARY_API_KEY=<your Cloudinary API key>
   CLOUDINARY_API_SECRET=<your Cloudinary API secret>
   ```
   
   **⚠️ CRITICAL:** The Cloudinary credentials are required to prevent image loss. See `CLOUDINARY_SETUP_GUIDE.md` for setup instructions.
4. Deploy. Check `https://<your-backend>.onrender.com/api/health` returns `{"status":"ok",...}`.

### ⚠️ Important: Persistent Image Storage Required

**SOLUTION IMPLEMENTED:** The application now uses **Cloudinary** for permanent image storage.

#### Before (Problem):
The gallery/news/blog image upload feature wrote files to a local `backend/uploads` folder. Render, Railway, and similar platforms use **ephemeral disks** on their free/standard tiers — meaning uploaded files were wiped on every redeploy or restart.

#### After (Solution):
All image uploads now go directly to **Cloudinary** (cloud storage with free tier), ensuring images survive all deploys, restarts, and spin-downs.

#### Setup Required:
1. Create a free Cloudinary account at https://cloudinary.com/users/register_free
2. Get your credentials (Cloud Name, API Key, API Secret)
3. Add them to Render environment variables (see Step 2)
4. See `CLOUDINARY_SETUP_GUIDE.md` for complete setup instructions

#### Testing:
- Upload a test image through admin panel
- Trigger a redeploy
- Verify image still displays after redeploy ✅

**Note:** Existing images with `/uploads/...` paths need to be re-uploaded. A migration script is available in `backend/scripts/migrate-images-to-cloudinary.js`.

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
- [ ] **Test Image Upload** - Upload a gallery photo, verify it displays, trigger a redeploy, verify it still displays
- [ ] Register a test account with email/password
- [ ] In MongoDB Atlas manually set that test member's `role` to `"admin"` and `membershipStatus` to `"active"`
- [ ] Log in as that admin, confirm the **Admin Panel** link appears and each section (Members, News & Events, Gallery, Articles, Support Requests) loads
- [ ] Publish a test news post and a test event, confirm they render correctly in both languages
- [ ] **Upload a gallery photo through admin panel** - Verify URL is `https://res.cloudinary.com/...` (not `/uploads/...`)
- [ ] **Test image persistence** - Wait a few minutes, refresh gallery, verify images still display
- [ ] Submit a test support request as a regular member, then respond to it from the admin panel
- [ ] Test on a phone-sized screen — the header collapses to a hamburger menu under ~900px width


---

## 4. Progressive Web App (PWA) Features

The site is now an installable Progressive Web App! Users can install it on their phones and desktops.

### What's Included

✅ **Installable**: Users can add the app to their home screen  
✅ **Offline Support**: Previously viewed content works offline  
✅ **Fast Loading**: Cached assets load instantly  
✅ **App-like Experience**: Fullscreen, no browser UI

### Deployment Checklist

The PWA features are automatically included in the production build:

- [x] Web app manifest (`manifest.json`)
- [x] Service worker (auto-generated)
- [x] App icons (192×192, 512×512, Apple touch icon)
- [x] Install prompts (Android/iOS/Desktop)
- [x] Offline fallback page
- [x] PWA meta tags

### Verifying PWA in Production

After deploying to Vercel:

1. **Visit your site on mobile** (https://5gstudentunion.vercel.app)
2. **Check for install prompt** (Android shows banner, iOS requires manual install)
3. **Test installation**:
   - Android: Tap install banner
   - iOS: Share → Add to Home Screen
   - Desktop: Click install icon in address bar
4. **Verify in Chrome DevTools**:
   - Open DevTools → Application tab
   - Check Manifest section (should show no errors)
   - Check Service Workers (should be "activated and running")

### User Installation Guide

Share the `PWA_USER_GUIDE.md` file with your users for installation instructions.

### Browser Support

| Platform | Install Support | Offline Support |
|----------|----------------|-----------------|
| Android (Chrome) | ✅ Full | ✅ Full |
| iOS (Safari) | ⚠️ Manual only | ✅ Full |
| Desktop (Chrome/Edge) | ✅ Full | ✅ Full |

### Troubleshooting

**Install prompt not showing:**
- Verify site is served over HTTPS (Vercel provides this)
- Check browser console for manifest errors
- Some browsers require multiple visits before showing prompt

**Service worker not registering:**
- Check that all PWA files are in the deployed `dist/` folder
- Verify no console errors on the site
- Clear browser cache and try again

**Images not loading offline:**
- First visit requires internet to cache images
- Only previously viewed images work offline
- Cloudinary images are cached for 7 days

For complete PWA documentation, see the generated artifact or contact the development team.
