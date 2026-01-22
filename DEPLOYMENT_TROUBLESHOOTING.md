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
