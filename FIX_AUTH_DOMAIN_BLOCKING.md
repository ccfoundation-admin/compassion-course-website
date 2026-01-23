# Fix Firebase Domain Blocking Error

## Error Message

```
auth/requests-from-referer-https://compassion-course-websit-937d6.firebaseapp.com-are-blocked
```

This error means Firebase is blocking authentication requests because the domain is not authorized in Firebase Console.

## Quick Fix (3 Steps)

You must authorize the domain in **three separate places**. Missing any one will cause authentication to fail.

---

## Step 1: Firebase Auth → Authorized Domains

**Direct Link:** [Firebase Console → Authentication → Settings](https://console.firebase.google.com/project/compassion-course-websit-937d6/authentication/settings)

1. Click the **"Authorized domains"** tab
2. Click **"Add domain"** button
3. Add these domains (one at a time, without `https://` or `/*`):
   - `compassion-course-websit-937d6.firebaseapp.com`
   - `compassion-course-websit-937d6.web.app`
   - `localhost` (for development)
   - Any custom domains you're using (e.g., `compassioncf.com`)
4. Click **"Add"** for each domain
5. **Wait 1-2 minutes** for changes to propagate

**Important:** Enter domains without `https://` or `/*` - just the domain name (e.g., `compassion-course-websit-937d6.firebaseapp.com`)

---

## Step 2: Google Cloud Console → API Key → HTTP Referrer Restrictions

**Direct Link:** [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials?project=compassion-course-websit-937d6)

1. Find the API key named **"Browser key (auto created by Firebase)"**
2. Click on it to edit
3. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
4. Under **"Website restrictions"**, click **"Add an item"** and add:
   - `https://compassion-course-websit-937d6.firebaseapp.com/*`
   - `https://compassion-course-websit-937d6.web.app/*`
   - `http://localhost:*` (for development)
   - `https://compassioncf.com/*` (if using custom domain)
5. Click **"Save"**
6. **Wait 1-2 minutes** for changes to propagate

**Important:** Include `https://` and `/*` for API key restrictions (e.g., `https://compassion-course-websit-937d6.firebaseapp.com/*`)

---

## Step 3: Google Cloud Console → OAuth 2.0 Client ID → Authorized JavaScript Origins

**Direct Link:** [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials?project=compassion-course-websit-937d6)

1. Find the OAuth 2.0 Client ID named **"Web client (auto created by Google Service)"**
2. Click the edit icon (pencil) to edit it
3. Under **"Authorized JavaScript origins"**, click **"Add URI"** and add:
   - `https://compassion-course-websit-937d6.firebaseapp.com`
   - `https://compassion-course-websit-937d6.web.app`
   - `http://localhost:5173` (for development)
   - `http://localhost:5174` (for development)
   - `https://compassioncf.com` (if using custom domain)
4. **Important:** Enter origins without trailing slashes or wildcards (e.g., `https://compassion-course-websit-937d6.firebaseapp.com`)
5. Under **"Authorized redirect URIs"**, verify these are present (Firebase auto-adds these):
   - `https://compassion-course-websit-937d6.firebaseapp.com/__/auth/handler`
   - `https://compassion-course-websit-937d6.web.app/__/auth/handler`
6. Click **"Save"**
7. **Wait 1-2 minutes** for changes to propagate

**Important:** Enter origins without trailing slashes or wildcards (e.g., `https://compassion-course-websit-937d6.firebaseapp.com`)

---

## Verification Steps

After completing all three steps:

1. **Wait 2-3 minutes** for all changes to propagate across Google's systems
2. **Clear your browser cache** or use an incognito/private window
3. **Try accessing the site again:**
   - Go to: `https://compassion-course-websit-937d6.firebaseapp.com/login`
   - Try logging in with email/password or Google sign-in
4. **Check browser console** (F12) for any remaining errors
5. If still blocked, verify each location again - sometimes changes take up to 5 minutes to propagate

---

## Common Mistakes

- **Adding `https://` or `/*` to Firebase Auth authorized domains** - Use just the domain name
- **Missing the `.web.app` domain** - Firebase provides both `.firebaseapp.com` and `.web.app` domains
- **Not waiting for propagation** - Changes can take 1-5 minutes to take effect
- **Browser cache** - Old cached configurations can cause issues, clear cache or use incognito mode
- **Typos in domain names** - Domain names must match exactly

---

## Alternative: Use .web.app Domain

If `.firebaseapp.com` continues to have issues, try using the `.web.app` domain instead:
- `https://compassion-course-websit-937d6.web.app/login`

Both domains should work identically once properly configured.

---

## Still Not Working?

If the error persists after completing all three steps:

1. **Double-check each location** - It's easy to miss one
2. **Verify project ID** - Ensure you're editing the correct project (`compassion-course-websit-937d6`)
3. **Check for typos** - Domain names must match exactly
4. **Try a different browser** - Rule out browser-specific issues
5. **Check OAuth consent screen** - If using Google sign-in, ensure OAuth consent screen is configured:
   - Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?project=compassion-course-websit-937d6)
   - If in "Testing" mode, add your email as a test user
   - If in "In production", ensure all required fields are filled
6. **Check browser console** (F12) - The app now logs detailed diagnostic information when domain blocking errors occur

---

## Diagnostic Information

The application now includes diagnostic logging. When a domain blocking error occurs:

1. Open browser console (F12)
2. Look for the diagnostic log group: "🔍 Firebase Auth Diagnostics"
3. This will show:
   - Current domain
   - Auth domain from config
   - Expected domains
   - Whether domain matches expected patterns
   - Detailed fix instructions

---

## Summary Checklist

- [ ] Step 1: Added domain to Firebase Auth → Authorized domains
- [ ] Step 2: Added domain to Google Cloud Console → API Key → HTTP referrer restrictions
- [ ] Step 3: Added domain to Google Cloud Console → OAuth 2.0 Client ID → Authorized JavaScript origins
- [ ] Waited 2-3 minutes for propagation
- [ ] Cleared browser cache or used incognito mode
- [ ] Tested login again
- [ ] Checked browser console for diagnostic information

---

**Note:** This is a Firebase Console configuration issue. Code changes cannot fix it - the domain must be authorized in Firebase Console manually.
