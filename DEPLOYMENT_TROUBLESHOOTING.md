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
