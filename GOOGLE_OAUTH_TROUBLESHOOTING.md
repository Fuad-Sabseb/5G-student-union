# Google OAuth Troubleshooting Guide

## Error: "Access blocked: Authorization Error - Missing required parameter: client_id"

This error means the Google OAuth library cannot find your Client ID. Here's how to fix it:

---

## ✅ Solution: Add Environment Variables to Your Hosting Platform

### For Vercel (Frontend)

1. Go to your Vercel Dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add this variable:
   ```
   Name: VITE_GOOGLE_CLIENT_ID
   Value: 254095783441-uhj2qqdkl7jtc9bcrtja7cca1doj5sm6.apps.googleusercontent.com
   ```
5. Select **Production**, **Preview**, and **Development**
6. Click **Save**
7. **Redeploy your application:**
   - Go to **Deployments**
   - Click the three dots (...) on the latest deployment
   - Click **Redeploy**

### For Netlify (Frontend - if using)

1. Go to your Netlify Dashboard
2. Select your site
3. Click **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add:
   ```
   Key: VITE_GOOGLE_CLIENT_ID
   Value: 254095783441-uhj2qqdkl7jtc9bcrtja7cca1doj5sm6.apps.googleusercontent.com
   ```
6. Click **Save**
7. **Trigger a new deploy:**
   - Go to **Deploys**
   - Click **Trigger deploy** → **Clear cache and deploy site**

### For Render (Backend)

1. Go to your Render Dashboard
2. Select your backend web service
3. Click **Environment**
4. Add this variable:
   ```
   Key: GOOGLE_CLIENT_ID
   Value: 254095783441-uhj2qqdkl7jtc9bcrtja7cca1doj5sm6.apps.googleusercontent.com
   ```
5. Click **Save Changes**
6. Render will automatically redeploy

---

## ✅ Solution 2: Update Google Cloud Console

You also need to authorize your production domain in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Under **Authorized JavaScript origins**, add:
   ```
   https://fullstack-website-for-5g-student.vercel.app
   ```
   (Replace with your actual Vercel URL)

6. Under **Authorized redirect URIs**, add the same:
   ```
   https://fullstack-website-for-5g-student.vercel.app
   ```

7. Click **Save**
8. **Wait 5-10 minutes** for Google's changes to propagate

---

## Verification Steps

After completing both solutions above:

1. **Check environment variables are set:**
   - Vercel: Settings → Environment Variables → verify `VITE_GOOGLE_CLIENT_ID` is there
   - Render: Environment → verify `GOOGLE_CLIENT_ID` is there

2. **Verify deployment picked up the variables:**
   - Open your browser console (F12)
   - Go to your deployed site
   - Type: `console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)`
   - It should show your Client ID (not `undefined`)

3. **Test Google Sign-In:**
   - Go to your deployed site's login page
   - Click "Sign in with Google"
   - Google's account chooser should appear
   - Select an account
   - You should be logged in successfully

---

## Common Issues

### Issue: "VITE_GOOGLE_CLIENT_ID is undefined in production"

**Cause:** Environment variable wasn't set before the build, or deployment didn't pick it up.

**Fix:**
1. Verify the variable name is exactly: `VITE_GOOGLE_CLIENT_ID` (case-sensitive, starts with `VITE_`)
2. Redeploy after adding the variable (environment changes require a new build)
3. Check the build logs for any errors

### Issue: "redirect_uri_mismatch"

**Cause:** Your production URL is not in Google Cloud Console's authorized list.

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Add your exact production URL to both:
   - Authorized JavaScript origins
   - Authorized redirect URIs
3. Don't include trailing slashes
4. Wait 5-10 minutes

### Issue: "Origin not allowed"

**Cause:** CORS issue or wrong origin in Google Cloud Console.

**Fix:**
1. Verify your production URL is **exactly** as it appears in the browser (including https://)
2. Check for typos in Google Cloud Console
3. Make sure you added both the main domain and any preview/staging URLs

### Issue: Google button doesn't appear at all

**Cause:** Client ID is missing or invalid.

**Fix:**
1. Check browser console for errors
2. Verify `VITE_GOOGLE_CLIENT_ID` environment variable is set
3. Ensure you redeployed after adding the variable
4. Try in incognito mode to rule out caching issues

---

## Local vs Production Checklist

| Environment | Frontend `.env` | Backend `.env` | Google Cloud Console |
|-------------|-----------------|----------------|----------------------|
| **Local** | `VITE_GOOGLE_CLIENT_ID=...` | `GOOGLE_CLIENT_ID=...` | `http://localhost:5173` in origins |
| **Production** | Set in Vercel/Netlify dashboard | Set in Render dashboard | `https://your-app.vercel.app` in origins |

---

## Quick Copy-Paste Commands

### Your Google Client ID
```
254095783441-uhj2qqdkl7jtc9bcrtja7cca1doj5sm6.apps.googleusercontent.com
```

### For Vercel Environment Variable
```
VITE_GOOGLE_CLIENT_ID=254095783441-uhj2qqdkl7jtc9bcrtja7cca1doj5sm6.apps.googleusercontent.com
```

### For Render Environment Variable
```
GOOGLE_CLIENT_ID=254095783441-uhj2qqdkl7jtc9bcrtja7cca1doj5sm6.apps.googleusercontent.com
```

---

## Still Not Working?

If you've completed all the steps above and Google Sign-In still doesn't work:

1. **Check browser console** for specific error messages
2. **Check backend logs** (Render dashboard → Logs) for authentication errors
3. **Verify your Client ID** is correct (copy it directly from Google Cloud Console)
4. **Try in a different browser** or incognito mode
5. **Clear your browser cache** and reload
6. **Wait 10-15 minutes** after making Google Cloud Console changes

---

## Debug Commands

Run these in your browser console on the deployed site:

```javascript
// Check if Client ID is loaded
console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check if Google library is loaded
console.log('Google loaded:', typeof window.google !== 'undefined');
```

Expected output:
```
Client ID: 254095783441-uhj2qqdkl7jtc9bcrtja7cca1doj5sm6.apps.googleusercontent.com
API URL: https://your-backend.onrender.com/api
Google loaded: true
```

---

## Need More Help?

If none of the above works, gather this information:

1. Screenshot of the error in your browser
2. Browser console error messages (F12 → Console tab)
3. Your Vercel/Netlify deployment URL
4. Your Render backend URL
5. Screenshot of your Google Cloud Console authorized origins

Then reach out to your technical team with these details.
