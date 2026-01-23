# Deployment Troubleshooting Guide

## Current Issue: GitHub Actions Not Deploying

### Workflow Configuration
The workflow file (`.github/workflows/firebase-deploy.yml`) is configured to:
- Trigger on pushes to `main` or `master` branches
- Deploy both hosting and storage rules
- Use service account authentication

### Common Issues to Check:

1. **Branch Name Mismatch**
   - Workflow triggers on: `main` or `master`
   - Check your current branch: `git branch --show-current`
   - If you're on a different branch, either:
     - Push to `main`/`master`, or
     - Update the workflow to include your branch

2. **Missing GitHub Secrets**
   Required secrets in GitHub repository settings:
   - `GCP_SA_KEY_JSON` - Google Cloud Service Account JSON key
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

3. **Workflow Not Running**
   - Go to GitHub → Your Repo → Actions tab
   - Check if workflows are showing up
   - Look for any error messages

4. **Service Account Permissions**
   - The service account needs Firebase Admin permissions
   - Check if `GCP_SA_KEY_JSON` has correct permissions

### Quick Fixes:

**Option 1: Manual Deployment (Immediate)**
```bash
firebase deploy --only storage
```

**Option 2: Trigger Workflow Manually**
- Go to GitHub → Actions → "Deploy to Firebase Hosting"
- Click "Run workflow" button
- Select branch and run

**Option 3: Check Workflow Logs**
- Go to GitHub → Actions
- Click on the latest workflow run
- Check for error messages in the logs

### Verify Current Setup:
```bash
# Check current branch
git branch --show-current

# Check if workflow file exists
ls -la .github/workflows/firebase-deploy.yml

# Check recent commits
git log --oneline -5
```

## Firebase API Key Issues

### Error: "auth/api-key-not-valid.-please-pass-a-valid-api-key."

This error means Firebase can't validate your API key. Common causes:

1. **API Key Not Set in GitHub Secrets**
   - Go to GitHub → Your Repo → Settings → Secrets and variables → Actions
   - Verify `VITE_FIREBASE_API_KEY` exists and is correct
   - The API key should start with `AIza` and be about 39 characters long

2. **API Key Has Domain Restrictions**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select project: `compassion-course-websit-937d6`
   - Go to APIs & Services → Credentials
   - Find your API key (the one used in Firebase)
   - Click on it to edit
   - Under "Application restrictions", check:
     - If set to "HTTP referrers", ensure these domains are added:
       - `compassion-course-websit-937d6.firebaseapp.com/*`
       - `compassion-course-websit-937d6.web.app/*`
       - `compassioncf.com/*` (if using custom domain)
       - `localhost:*` (for development)
     - If set to "None", that's fine
   - Under "API restrictions", ensure these APIs are enabled:
     - Firebase Authentication API
     - Firebase Realtime Database API (if using)
     - Cloud Firestore API
     - Firebase Storage API
   - Save changes

3. **API Key Deleted or Disabled**
   - Check if the API key still exists in Google Cloud Console
   - If deleted, you'll need to:
     - Go to Firebase Console → Project Settings → General
     - Copy the Web API Key
     - Update it in GitHub Secrets

4. **Build-Time Environment Variables Not Passed**
   - Check the GitHub Actions workflow logs
   - Verify the build step includes all `VITE_FIREBASE_*` environment variables
   - The API key must be available at build time (Vite embeds it in the bundle)

### How to Get the Correct API Key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `compassion-course-websit-937d6`
3. Click the gear icon → Project Settings
4. Scroll to "Your apps" section
5. Find your web app (or create one if it doesn't exist)
6. Copy the "Web API Key" (starts with `AIza`)
7. Update `VITE_FIREBASE_API_KEY` in GitHub Secrets

### Verify API Key in Deployed Site:

1. Open browser console on the deployed site
2. Look for log message: `🔧 Firebase config:`
3. Check if `apiKey` shows a value (first 10 chars) or `MISSING`
4. If `MISSING`, the environment variable wasn't set during build

## Google Sign-In Issues

### Common Problems:

1. **"Popup was blocked" Error**
   - Browser is blocking popups
   - Solution: Allow popups for your domain in browser settings
   - Or use a different browser

2. **"This domain is not authorized" Error**
   - Your domain is not in Firebase's authorized domains list
   - Solution:
     1. Go to Firebase Console → Authentication → Settings → Authorized domains
     2. Add your domain (e.g., `compassion-course-websit-937d6.firebaseapp.com`, `compassioncf.com`)
     3. Also add `localhost` for local development

3. **"Google sign-in is not enabled" Error**
   - Google OAuth provider is not enabled in Firebase
   - Solution:
     1. Go to Firebase Console → Authentication → Sign-in method
     2. Click on "Google" provider
     3. Enable it and save
     4. Configure OAuth consent screen in Google Cloud Console if needed

4. **"Sign-in was cancelled" Error**
   - User closed the popup window
   - This is normal - just try again

5. **No Error but Can't Log In**
   - Google sign-in works but admin check fails
   - Solution: Ensure your email is in the admin list (`info@compassioncf.com`)
   - The system will auto-create admin documents for admin emails

### Setup Steps in Firebase Console:

1. **Enable Google Sign-In Provider:**
   - Firebase Console → Authentication → Sign-in method
   - Click "Google"
   - Toggle "Enable"
   - Set project support email
   - Save

2. **Add Authorized Domains:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add domains:
     - `compassion-course-websit-937d6.firebaseapp.com`
     - `compassion-course-websit-937d6.web.app`
     - `compassioncf.com` (if using custom domain)
     - `localhost` (for development)

3. **Configure OAuth Consent Screen (if needed):**
   - Google Cloud Console → APIs & Services → OAuth consent screen
   - Configure app information
   - Add scopes if needed
   - Add test users if app is in testing mode

### Testing Google Sign-In:

1. Open browser console (F12)
2. Try to sign in with Google
3. Check console for error messages
4. Common error codes:
   - `auth/popup-closed-by-user` - User cancelled
   - `auth/popup-blocked` - Popup blocked by browser
   - `auth/unauthorized-domain` - Domain not authorized
   - `auth/operation-not-allowed` - Provider not enabled

## Firebase Domain Blocking Error (auth/requests-from-referer-blocked)

### Error: "auth/requests-from-referer-https://compassion-course-websit-937d6.firebaseapp.com-are-blocked"

This error indicates that Firebase is blocking authentication requests from your domain. The domain must be authorized in **three separate places** in Firebase/Google Cloud Console.

#### Root Cause

Firebase requires explicit authorization for domains in multiple configuration locations:
1. Firebase Auth authorized domains
2. Google Cloud API Key HTTP referrer restrictions
3. OAuth 2.0 Client ID authorized JavaScript origins

If any of these are missing or incorrect, authentication requests will be blocked.

#### Solution: Authorize Domain in All Three Places

**Step 1: Firebase Auth → Authorized Domains**

1. Go to [Firebase Console → Authentication → Settings](https://console.firebase.google.com/project/compassion-course-websit-937d6/authentication/settings)
2. Click the **"Authorized domains"** tab
3. Verify these domains are listed (if not, click "Add domain"):
   - `compassion-course-websit-937d6.firebaseapp.com`
   - `compassion-course-websit-937d6.web.app`
   - `localhost` (for development)
   - Any custom domains you're using (e.g., `compassioncf.com`)
4. **Important**: Enter domains without `https://` or `/*` - just the domain name
5. Wait 1-2 minutes for changes to propagate

**Step 2: Google Cloud Console → API Key → HTTP Referrer Restrictions**

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials?project=compassion-course-websit-937d6)
2. Find the API key named **"Browser key (auto created by Firebase)"**
3. Click on it to edit
4. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
5. Under **"Website restrictions"**, ensure these are listed (add if missing):
   - `https://compassion-course-websit-937d6.firebaseapp.com/*`
   - `https://compassion-course-websit-937d6.web.app/*`
   - `http://localhost:*` (for development)
   - `https://compassioncf.com/*` (if using custom domain)
6. Click **"Save"**
7. Wait 1-2 minutes for changes to propagate

**Step 3: Google Cloud Console → OAuth 2.0 Client ID → Authorized JavaScript Origins**

1. In the same [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials?project=compassion-course-websit-937d6) page
2. Find the OAuth 2.0 Client ID named **"Web client (auto created by Google Service)"**
3. Click the edit icon (pencil) to edit it
4. Under **"Authorized JavaScript origins"**, ensure these are listed (add if missing):
   - `https://compassion-course-websit-937d6.firebaseapp.com`
   - `https://compassion-course-websit-937d6.web.app`
   - `http://localhost:5173` (for development)
   - `http://localhost:5174` (for development)
   - `https://compassioncf.com` (if using custom domain)
5. **Important**: Enter origins without trailing slashes or wildcards
6. Under **"Authorized redirect URIs"**, verify these are present (Firebase auto-adds these):
   - `https://compassion-course-websit-937d6.firebaseapp.com/__/auth/handler`
   - `https://compassion-course-websit-937d6.web.app/__/auth/handler`
7. Click **"Save"**
8. Wait 1-2 minutes for changes to propagate

#### Verification Steps

After making all three changes:

1. **Wait 2-3 minutes** for all changes to propagate across Google's systems
2. **Clear your browser cache** or use an incognito/private window
3. **Try accessing the site again**:
   - Go to: `https://compassion-course-websit-937d6.firebaseapp.com/admin/login-4f73b2c`
   - Try Google sign-in or password reset
4. **Check browser console** (F12) for any remaining errors
5. If still blocked, verify each location again - sometimes changes take up to 5 minutes to propagate

#### Common Mistakes

- **Adding `https://` or `/*` to Firebase Auth authorized domains** - Use just the domain name
- **Missing the `.web.app` domain** - Firebase provides both `.firebaseapp.com` and `.web.app` domains
- **Not waiting for propagation** - Changes can take 1-5 minutes to take effect
- **Browser cache** - Old cached configurations can cause issues, clear cache or use incognito mode

#### Alternative: Use .web.app Domain

If `.firebaseapp.com` continues to have issues, try using the `.web.app` domain instead:
- `https://compassion-course-websit-937d6.web.app/admin/login-4f73b2c`

Both domains should work identically once properly configured.

#### Still Not Working?

If the error persists after completing all three steps:

1. **Double-check each location** - It's easy to miss one
2. **Verify project ID** - Ensure you're editing the correct project (`compassion-course-websit-937d6`)
3. **Check for typos** - Domain names must match exactly
4. **Try a different browser** - Rule out browser-specific issues
5. **Check OAuth consent screen** - If using Google sign-in, ensure OAuth consent screen is configured:
   - Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?project=compassion-course-websit-937d6)
   - If in "Testing" mode, add your email as a test user
   - If in "In production", ensure all required fields are filled
