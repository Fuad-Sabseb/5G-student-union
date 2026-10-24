# Cloudinary Setup and Configuration Guide

## Overview

This guide explains how to configure Cloudinary for persistent image storage, replacing the ephemeral local filesystem that causes images to disappear after deployments.

---

## Step 1: Create Cloudinary Account (5 minutes)

### If You Don't Have a Cloudinary Account:

1. Go to https://cloudinary.com/users/register_free
2. Sign up with your email (no credit card required)
3. Verify your email address
4. Log in to your dashboard

### Free Tier Includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth per month
- ✅ Image transformations and optimization
- ✅ CDN delivery
- ✅ More than sufficient for this application

---

## Step 2: Get Your Credentials

After logging in to Cloudinary dashboard (https://cloudinary.com/console):

1. You'll see your **Dashboard** page
2. Copy these three values (they're displayed at the top):

```
Cloud Name:  dxyz123abc              ← Example, yours will be different
API Key:     123456789012345         ← Example
API Secret:  abcdefGHIJKLmnopQRST    ← Example (click "eye" icon to reveal)
```

---

## Step 3: Configure Local Development

### Update `backend/.env`:

Replace the placeholder values with your actual credentials:

```env
# Before (placeholders):
CLOUDINARY_CLOUD_NAME = Fuad
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret

# After (your actual values):
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefGHIJKLmnopQRST
```

**Important Notes:**
- Remove spaces around `=` sign
- No quotes needed
- Keep this file secure (it's in `.gitignore`)

---

## Step 4: Test Locally

### 4.1 Start Backend

```bash
cd backend
npm start
```

Check logs for:
```
✅ Cloudinary configured successfully
Server running on port 5001
```

### 4.2 Test Upload

1. Start frontend: `cd frontend && npm run dev`
2. Log in to admin panel: http://localhost:5173/admin/gallery
3. Upload a test image
4. Check console logs - should see:
   ```
   Uploading to Cloudinary: 1234567890-123456789.jpg
   Cloudinary upload successful: https://res.cloudinary.com/dxyz123abc/...
   ```
5. Verify image displays in gallery
6. Check MongoDB - `imageUrl` should be `https://res.cloudinary.com/...` (not `/uploads/...`)

### 4.3 Test Persistence

1. Stop backend (Ctrl+C)
2. Restart backend (`npm start`)
3. Refresh gallery page
4. **CRITICAL TEST:** Image should still display (proves it's not using local storage)

---

## Step 5: Migrate Existing Local Images

### Check What Images You Have Locally:

```bash
ls -lah backend/uploads/
```

### Run Migration Script:

```bash
cd backend
node scripts/migrate-images-to-cloudinary.js
```

**What This Does:**
1. Finds all database records with `/uploads/...` paths
2. Checks if local file exists
3. Uploads to Cloudinary
4. Updates database with new Cloudinary URL
5. Creates backup of original data

**Expected Output:**
```
🚀 Starting Image Migration to Cloudinary
✅ Cloudinary configured
📊 Found 6 local files

📸 Migrating Gallery Items...
Processing: 64abc... - /uploads/1786651678422-182484937.png
  ✅ Uploaded: https://res.cloudinary.com/...
...

📊 Migration Summary:
Gallery Items:     6/6 migrated, 0 failed
✅ Migration completed successfully! 6 images migrated.
```

**If Migration Fails:**
- Check Cloudinary credentials are correct
- Verify local files exist in `backend/uploads/`
- Check MongoDB connection string
- Review error messages in console

---

## Step 6: Configure Production (Render)

### 6.1 Add Environment Variables

1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Environment** in left sidebar
4. Add these three variables:

```
Key: CLOUDINARY_CLOUD_NAME
Value: dxyz123abc                    ← Your actual value

Key: CLOUDINARY_API_KEY
Value: 123456789012345               ← Your actual value

Key: CLOUDINARY_API_SECRET
Value: abcdefGHIJKLmnopQRST          ← Your actual value
```

5. Click **Save Changes**
6. Render will automatically redeploy (~2-3 minutes)

### 6.2 Verify Render Deployment

1. Go to **Logs** tab in Render dashboard
2. Look for:
   ```
   ✅ Cloudinary configured successfully
   Server running on port 10000
   ```
3. If you see errors, double-check environment variables

---

## Step 7: Test Production

### 7.1 Test New Upload

1. Go to https://5gstudentunion.vercel.app/admin/gallery
2. Log in as admin
3. Upload a new test image
4. **CRITICAL:** Check browser DevTools → Network tab
5. Look for `/api/upload` request → Response should show:
   ```json
   {
     "success": true,
     "imageUrl": "https://res.cloudinary.com/dxyz123abc/...",
     "storage": "cloudinary"
   }
   ```
6. Verify image displays in gallery

### 7.2 Test Persistence After Deployment

1. Make a trivial code change (e.g., add a comment to README.md)
2. Commit and push to trigger Render redeploy
3. Wait for redeploy to complete
4. Visit gallery page
5. **CRITICAL TEST:** All images should still display
6. This confirms images survive deployments

### 7.3 Test Spin-Down Recovery

1. Wait 20 minutes (Render free tier spins down after 15 min inactivity)
2. Visit site again (triggers spin-up)
3. **CRITICAL TEST:** All images should still display
4. This confirms images survive container restarts

---

## Step 8: Verify MongoDB Records

### Check Database Records Are Updated:

Option 1: MongoDB Atlas Dashboard
1. Go to https://cloud.mongodb.com
2. Browse Collections → `galleryitems`
3. Check `imageUrl` field
4. Should be: `https://res.cloudinary.com/...`
5. Should NOT be: `/uploads/...`

Option 2: Using MongoDB Shell
```javascript
// Connect to your database
use shanan_gibe_union

// Check gallery items
db.galleryitems.find({}, { imageUrl: 1, caption_en: 1 }).pretty()

// Count local vs Cloudinary
db.galleryitems.countDocuments({ imageUrl: /^\/uploads\// })  // Should be 0
db.galleryitems.countDocuments({ imageUrl: /cloudinary/ })    // Should be > 0
```

---

## Troubleshooting

### Issue: "Cloudinary is not configured"

**Cause:** Environment variables not set correctly

**Fix:**
- Check variable names are exact: `CLOUDINARY_CLOUD_NAME` (not `CLOUD_NAME`)
- Check no extra spaces around `=` in `.env`
- Restart backend after changing `.env`
- On Render: verify variables are saved and redeploy completed

### Issue: "Upload failed: Invalid credentials"

**Cause:** API Key or Secret is incorrect

**Fix:**
- Go to Cloudinary dashboard
- Copy credentials again (make sure no spaces)
- Update `.env` or Render environment variables
- Restart/redeploy

### Issue: "File not found during migration"

**Cause:** Local files don't exist (expected for production-uploaded images)

**Fix:**
- This is normal - you can only migrate images that exist locally
- Production-uploaded images are already lost (ephemeral storage)
- You'll need to re-upload those manually or from backups

### Issue: Images still show `/uploads/...` paths

**Cause:** Migration didn't run or failed

**Fix:**
- Run migration script again: `node scripts/migrate-images-to-cloudinary.js`
- Check for error messages
- Verify Cloudinary credentials are correct

### Issue: "Mixed content" warning in browser

**Cause:** Cloudinary URLs are HTTPS but your site might be HTTP locally

**Fix:**
- Cloudinary always uses HTTPS (this is correct)
- In production, this won't be an issue (Vercel uses HTTPS)
- Locally, you can ignore this or use HTTPS in development

---

## Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore`
- Use environment variables on hosting platforms
- Rotate credentials if exposed
- Use Cloudinary's signed uploads for sensitive content

### ❌ DON'T:
- Commit `.env` file to Git
- Share API Secret publicly
- Hardcode credentials in source code
- Use same credentials for multiple projects (if possible)

---

## Monitoring and Maintenance

### Check Cloudinary Usage:

1. Log in to https://cloudinary.com/console
2. View **Dashboard** for:
   - Storage used
   - Bandwidth used
   - Transformations used
3. Free tier limits:
   - 25 GB storage
   - 25 GB bandwidth/month
4. Set up usage alerts if desired

### Clean Up Old Uploads:

After successful migration and verification:

```bash
# Optional: Remove local uploads directory
rm -rf backend/uploads/*

# Keep the directory itself for development
# New uploads will still work locally without Cloudinary configured
```

---

## Cost Estimates

### Free Tier (Current Recommendation):
- **Cost:** $0/month
- **Storage:** 25 GB
- **Bandwidth:** 25 GB/month
- **Sufficient for:** Most student union websites

### If You Exceed Free Tier:
- **Paid Plan:** Starts at $99/month
- **Alternative:** Optimize images, implement pagination, or archive old content
- **Your Usage:** Unlikely to exceed free tier with typical student website traffic

---

## Rollback Plan

If something goes wrong and you need to rollback:

### Restore From Backup:

```bash
# Backup file created during migration
cat backend/scripts/image-migration-backup.json

# Manual restore (if needed)
# Use MongoDB Compass or shell to update records back to original values
```

### Revert Code Changes:

```bash
git log --oneline | head -5
git revert <commit-hash>
```

### Keep in Mind:
- Images uploaded to Cloudinary will remain there (won't be deleted)
- You can download them from Cloudinary dashboard if needed
- Local images in `backend/uploads/` are your source of truth for migration

---

## Next Steps After Setup

1. ✅ Monitor first few uploads in production
2. ✅ Re-upload any critical images that were lost
3. ✅ Update documentation for team members
4. ✅ Set up Cloudinary usage alerts
5. ✅ Consider implementing image optimization (Cloudinary does this automatically)
6. ✅ Plan regular backups of MongoDB

---

## Support

**Cloudinary Support:**
- Documentation: https://cloudinary.com/documentation
- Community: https://support.cloudinary.com/

**Application Support:**
- Check backend logs (Render dashboard → Logs)
- Check browser console for frontend errors
- Review migration script output for database issues

---

**Setup Date:** October 23, 2026  
**Last Updated:** October 23, 2026  
**Cloudinary Version:** 2.10.0
