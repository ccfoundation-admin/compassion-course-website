# GitHub Deployment Troubleshooting

## Issue: GitHub Actions Not Deploying

If GitHub Actions is not deploying after a push, check the following:

## 1. Verify Branch Name

The workflow triggers on pushes to `main` or `master` branches only.

**Check your current branch:**
```bash
git branch --show-current
```

**If not on main/master:**
```bash
git checkout main
# or
git checkout master
```

## 2. Verify Push Was Successful

**Check if commits were pushed:**
```bash
git log origin/main..HEAD --oneline
```

If this shows commits, they haven't been pushed yet. Push them:
```bash
git push origin main
```

## 3. Check GitHub Actions Status

1. Go to: https://github.com/ccfoundation-admin/compassion-course-website/actions
2. Look for the latest workflow run
3. Check if it:
   - **Ran** (green checkmark = success, red X = failed, yellow circle = in progress)
   - **Didn't run** (no entry = workflow didn't trigger)

## 4. Common Issues

### Workflow Didn't Trigger

**Possible causes:**
- Push was to wrong branch (not `main` or `master`)
- Workflow file has syntax errors
- GitHub Actions is disabled for the repository

**Fix:**
- Ensure you're pushing to `main` or `master`
- Check `.github/workflows/firebase-deploy.yml` exists and is valid YAML
- Go to repository Settings → Actions → General → ensure "Allow all actions and reusable workflows" is enabled

### Workflow Failed

**Check the workflow logs:**
1. Go to: https://github.com/ccfoundation-admin/compassion-course-website/actions
2. Click on the failed workflow run
3. Check which step failed
4. Common failures:
   - Missing GitHub Secrets (VITE_FIREBASE_*, GCP_SA_KEY_JSON)
   - Service account authentication issues
   - Build errors

### Manual Trigger

You can manually trigger the workflow:
1. Go to: https://github.com/ccfoundation-admin/compassion-course-website/actions
2. Click on "Deploy to Firebase Hosting" workflow
3. Click "Run workflow" button
4. Select branch (`main` or `master`)
5. Click "Run workflow"

## 5. Verify Required Secrets

The workflow requires these GitHub Secrets (Settings → Secrets and variables → Actions):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `GCP_SA_KEY_JSON` (Service Account JSON key)

**Check if secrets exist:**
1. Go to: https://github.com/ccfoundation-admin/compassion-course-website/settings/secrets/actions
2. Verify all required secrets are listed

## 6. Force a Deployment

If everything looks correct but deployment isn't happening:

```bash
# Make sure you're on main branch
git checkout main

# Make a small change to trigger deployment
echo "# Deployment trigger $(date)" >> .deploy-trigger
git add .deploy-trigger
git commit -m "Trigger deployment"
git push origin main
```

Or manually trigger via GitHub UI (see step 4 above).

## 7. Check Workflow File Location

The workflow file must be at:
```
.github/workflows/firebase-deploy.yml
```

Verify it exists:
```bash
ls -la .github/workflows/firebase-deploy.yml
```

## Quick Diagnostic Commands

Run these to check your setup:

```bash
# Check current branch
git branch --show-current

# Check if there are unpushed commits
git log origin/main..HEAD --oneline

# Check remote URL
git remote get-url origin

# Check last commit
git log -1 --oneline

# Check if workflow file exists
ls -la .github/workflows/firebase-deploy.yml
```

## Next Steps

1. **Verify branch**: Make sure you're on `main` or `master`
2. **Push changes**: `git push origin main`
3. **Check Actions tab**: https://github.com/ccfoundation-admin/compassion-course-website/actions
4. **If still not working**: Manually trigger the workflow from GitHub UI
