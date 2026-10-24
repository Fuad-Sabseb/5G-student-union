# Cloudinary Quick Start - Image Storage Fix

## 🚀 5-Minute Setup

### Step 1: Get Cloudinary Credentials (2 minutes)

1. Go to https://cloudinary.com/users/register_free
2. Sign up (no credit card needed)
3. Copy these from your dashboard:

```
Cloud Name:  ________________
API Key:     ________________
API Secret:  ________________
```

---

### Step 2: Configure Local (1 minute)

Edit `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

---

### Step 3: Test Locally (2 minutes)

```bash
# Start backend
cd backend
npm start

# Start frontend (new terminal)
cd frontend
npm run dev

# Test upload
# 1. Go to http://localhost:5173/admin/gallery
# 2. Upload an image
# 3. Check console for "Cloudinary upload successful"
```

---

### Step 4: Migrate Existing Images (1 minute)

```bash
cd backend
node scripts/migrate-images-to-cloudinary.js
```

Expected output: `✅ Migration completed successfully! 6 images migrated.`

---

### Step 5: Deploy to Production (3 minutes)

1. **Render Dashboard** → Your backend service → **Environment**
2. Add these 3 variables:
   ```
   CLOUDINARY_CLOUD_NAME = your_cloud_name_here
   CLOUDINARY_API_KEY = your_api_key_here
   CLOUDINARY_API_SECRET = your_api_secret_here
   ```
3. Click **Save Changes** (auto-redeploys)
4. Test upload at https://5gstudentunion.vercel.app/admin/gallery

---

## ✅ Verification

### Local:
- [ ] Upload displays in gallery
- [ ] Console shows "Cloudinary upload successful"
- [ ] MongoDB record has `https://res.cloudinary.com/...` URL

### Production:
- [ ] Upload succeeds
- [ ] Image displays
- [ ] Trigger redeploy → Image still displays ✅
- [ ] Wait 20min → Image still displays ✅

---

## 🆘 Troubleshooting

**Error: "Cloudinary is not configured"**
- Check `.env` file has all 3 variables
- No spaces around `=` sign
- Restart backend

**Error: "Invalid credentials"**
- Copy credentials again from Cloudinary dashboard
- Check for typos

**Migration shows 0 files**
- Check `backend/uploads/` directory exists
- Normal if all uploads were to production (files lost)

---

## 📚 Full Documentation

- Complete guide: `CLOUDINARY_SETUP_GUIDE.md`
- Deployment: `DEPLOYMENT.md`
- Migration script: `backend/scripts/migrate-images-to-cloudinary.js`

---

**Total Time:** ~10-15 minutes  
**Cost:** $0 (Free Tier)  
**Result:** Images never disappear again! 🎉
