# Google OAuth 2.0 Setup Guide

This guide explains how to configure Google Sign-In for the Gamtaa Barattoota Shanan Gibee website.

---

## 🔐 Security Update

**Previous Implementation:** The application previously used a simulated Google account chooser that did not perform actual authentication. This has been **completely replaced** with secure Google OAuth 2.0.

**Current Implementation:** Now uses official Google Identity Services with cryptographic ID token verification on the backend.

---

## Prerequisites

- Google Account (for accessing Google Cloud Console)
- Admin access to the Google Cloud Console
- Backend and frontend deployment URLs

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Project name: `Gamtaa Barattoota Shanan Gibee` (or your preferred name)
4. Click **Create**

---

## Step 2: Enable Google+ API (Optional but Recommended)

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for public access)
3. Click **Create**

### Fill in the Application Information:

- **App name:** `Gamtaa Barattoota Shanan Gibee`
- **User support email:** Your union email (e.g., `gamtaabarattootashanangibeeju@gmail.com`)
- **App logo:** Upload your GBSG logo
- **Application home page:** Your production URL (e.g., `https://gbsg.vercel.app`)
- **Application privacy policy:** `https://gbsg.vercel.app/privacy`
- **Application terms of service:** `https://gbsg.vercel.app/terms`
- **Authorized domains:** Add your domain (e.g., `vercel.app`, `onrender.com`)
- **Developer contact information:** Your email address

4. Click **Save and Continue**

### Scopes (Step 2):
1. Click **Add or Remove Scopes**
2. Select the following:
   - `../auth/userinfo.email` - See your primary Google Account email address
   - `../auth/userinfo.profile` - See your personal info
   - `openid` - Associate you with your personal info on Google
3. Click **Update** → **Save and Continue**

### Test Users (Step 3):
- For development, add test users (your Gmail addresses)
- In production, you can publish the app for all users

4. Click **Save and Continue**
5. Review and click **Back to Dashboard**

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `GBSG Web Client`

### Authorized JavaScript origins:
Add all your frontend URLs:
```
http://localhost:5173
http://localhost:3000
https://your-production-domain.vercel.app
https://your-staging-domain.vercel.app
```

### Authorized redirect URIs:
Add your backend callback URLs (if using server-side flow):
```
http://localhost:5173
http://localhost:3000
https://your-production-domain.vercel.app
https://your-staging-domain.vercel.app
```

5. Click **Create**
6. **Copy the Client ID** - you'll need this for your `.env` files

---

## Step 5: Configure Environment Variables

### Backend (`.env`)

Add the following to your backend `.env` file:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

### Frontend (`.env`)

Add the following to your frontend `.env` file:

```env
# Google OAuth 2.0 Client ID
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Example:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

⚠️ **Important:** 
- Use the **same Client ID** for both frontend and backend
- Never commit your actual `.env` files to version control
- Update `.env.example` files with placeholder values

---

## Step 6: Deploy and Test

### Local Testing

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Navigate to `http://localhost:5173/login`
4. Click **Sign in with Google**
5. **Expected behavior:**
   - Google's official account chooser appears
   - You can select any Google account signed into your browser
   - After selecting an account and granting permissions, you're logged in
   - The backend verifies the ID token cryptographically

### Production Deployment

1. Add your production URL to **Authorized JavaScript origins** in Google Cloud Console
2. Set the `GOOGLE_CLIENT_ID` environment variable in your hosting platform:
   - **Vercel:** Project Settings → Environment Variables
   - **Render:** Dashboard → Environment → Environment Variables
   - **Railway:** Project → Variables
3. Redeploy your application
4. Test the Google Sign-In flow on production

---

## How It Works

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Google's actual OAuth popup/redirect appears
   ↓
3. User selects a Google account and grants permissions
   ↓
4. Google issues a signed JWT ID token
   ↓
5. Frontend receives the ID token
   ↓
6. Frontend sends ID token to backend /api/auth/google
   ↓
7. Backend verifies token signature with Google's public keys
   ↓
8. Backend validates issuer, audience, expiration
   ↓
9. Backend extracts verified email and sub (Google user ID)
   ↓
10. Backend creates/updates user in database
   ↓
11. Backend issues JWT session token
   ↓
12. User is authenticated
```

### Security Features

✅ **ID Token Verification:** Backend uses `google-auth-library` to cryptographically verify tokens  
✅ **Signature Validation:** Tokens are verified against Google's public keys  
✅ **Issuer Check:** Ensures token was issued by `https://accounts.google.com`  
✅ **Audience Check:** Validates token was intended for your Client ID  
✅ **Expiration Check:** Rejects expired tokens  
✅ **Stable User ID:** Uses Google's `sub` claim (not email) as the primary identifier  
✅ **Account Selection:** `prompt: 'select_account'` forces Google to show account chooser  

---

## Troubleshooting

### Error: "Google OAuth is not configured"

**Cause:** `GOOGLE_CLIENT_ID` is not set in backend `.env`  
**Fix:** Add the Client ID to your backend `.env` file and restart the server

### Error: "Invalid Google ID token"

**Causes:**
- Clock skew between client and server
- Expired token
- Token from wrong Client ID
- Network issues during verification

**Fix:**
- Ensure server time is synchronized
- Check that frontend and backend use the same `GOOGLE_CLIENT_ID`
- Verify your internet connection

### Error: "redirect_uri_mismatch"

**Cause:** Your current URL is not in the **Authorized redirect URIs** list  
**Fix:** 
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add the current URL to **Authorized redirect URIs**
4. Wait 5 minutes for changes to propagate

### Google Button Not Appearing

**Causes:**
- `VITE_GOOGLE_CLIENT_ID` not set in frontend `.env`
- JavaScript errors in console
- AdBlockers blocking Google scripts

**Fix:**
- Check browser console for errors
- Verify environment variable is set correctly
- Try in incognito mode or different browser
- Temporarily disable ad blockers

### "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not properly configured  
**Fix:**
1. Go to Google Cloud Console → OAuth consent screen
2. Verify all required fields are filled
3. Add your domain to **Authorized domains**
4. Ensure you've completed all steps in the consent screen setup

---

## Migrating Existing Accounts

### For Development/Testing

If you have existing accounts that used the old simulated Google auth:

1. The backend will automatically migrate them on next Google sign-in
2. The `googleSub` field will be populated with the real Google user ID
3. Legacy `googleId` field is kept for backward compatibility

### For Production

If you already have users in production:

1. **Option A (Recommended):** Automatic Migration
   - Deploy the new code
   - Users sign in with Google again
   - Backend updates their account with real `googleSub`

2. **Option B:** Manual Database Update
   - Connect to your production database
   - Run a migration script to clear fake `googleId` values
   - Users will be prompted to sign in with Google again

**MongoDB Migration Query:**
```javascript
// Clear fake googleId values (those starting with 'google_')
db.members.updateMany(
  { googleId: /^google_/ },
  { $set: { googleId: null, googleSub: null } }
);
```

---

## Security Best Practices

1. **Never expose your Client Secret** (if you accidentally created one, revoke it)
2. **Keep your `.env` files secure** and never commit them to Git
3. **Use HTTPS in production** - OAuth requires secure connections
4. **Rotate credentials periodically** for sensitive applications
5. **Monitor OAuth usage** in Google Cloud Console
6. **Enable 2FA** on your Google Cloud account
7. **Restrict API key usage** if you create API keys
8. **Review OAuth scopes** - only request what you need

---

## Testing Different Scenarios

### Test Case 1: First-Time User
- Click "Sign in with Google"
- Select a Google account
- Grant permissions
- User should be created and logged in

### Test Case 2: Returning User
- Click "Sign in with Google"
- Select previously used account
- Should log in immediately without re-prompting for permissions

### Test Case 3: Multiple Accounts
- Sign in with Google Account A
- Log out
- Sign in with Google Account B
- Both accounts should work independently

### Test Case 4: Account Selection
- Open the app with multiple Google accounts signed in
- Click "Sign in with Google"
- Google should show all signed-in accounts
- User can select any account

### Test Case 5: Token Expiration
- Sign in successfully
- Wait for session to expire (based on JWT_EXPIRES_IN)
- Attempt to access protected route
- Should be redirected to login

---

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/rfc6749)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [google-auth-library Documentation](https://github.com/googleapis/google-auth-library-nodejs)

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Check the backend logs for authentication errors
3. Verify all environment variables are set correctly
4. Ensure your Google Cloud project is properly configured
5. Contact the technical team for assistance

---

## Changelog

### v2.0.0 (Current)
- ✅ Implemented secure Google OAuth 2.0 with ID token verification
- ✅ Removed simulated account chooser
- ✅ Added `google-auth-library` for backend verification
- ✅ Added `@react-oauth/google` for frontend integration
- ✅ Enforced account selection on every login (`prompt: 'select_account'`)
- ✅ Added `googleSub` field for stable user identification

### v1.0.0 (Deprecated)
- ❌ Used simulated Google account chooser (security vulnerability)
- ❌ No actual Google authentication
- ❌ Client-submitted user data without verification
