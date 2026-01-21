# Firebase Storage Setup Instructions

## Issue
CORS errors when uploading photos to Firebase Storage. The error shows:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

## Solution Steps

### 1. Enable Firebase Storage

1. Go to Firebase Console: https://console.firebase.google.com/project/compassion-course-websit-937d6/storage
2. Click "Get Started"
3. Choose "Start in production mode" (we'll deploy rules next)
4. Select a location (same as Firestore, e.g., `us-central1`)
5. Click "Done"

### 2. Deploy Storage Security Rules

After enabling Storage, run:
```bash
firebase deploy --only storage:rules
```

### 3. Configure CORS for Firebase Storage

Firebase Storage requires CORS configuration to allow uploads from your web app. You need to use `gsutil` (Google Cloud SDK tool).

#### Install Google Cloud SDK (if not already installed)

**macOS:**
```bash
brew install google-cloud-sdk
```

**Or download from:** https://cloud.google.com/sdk/docs/install

#### Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project compassion-course-websit-937d6
```

#### Set CORS Configuration

```bash
gsutil cors set storage.cors.json gs://compassion-course-websit-937d6.firebasestorage.app
```

Or if the bucket name is different, check in Firebase Console → Storage → Settings for the exact bucket name.

#### Verify CORS Configuration

```bash
gsutil cors get gs://compassion-course-websit-937d6.firebasestorage.app
```

### 4. Alternative: Configure CORS via Firebase Console

If `gsutil` doesn't work, you can configure CORS through the Google Cloud Console:

1. Go to: https://console.cloud.google.com/storage/browser?project=compassion-course-websit-937d6
2. Find your Firebase Storage bucket (usually named like `compassion-course-websit-937d6.firebasestorage.app`)
3. Click on the bucket name
4. Go to "Configuration" tab
5. Scroll to "Cross-origin resource sharing (CORS)"
6. Click "Edit CORS configuration"
7. Paste the contents of `storage.cors.json` (the array part)
8. Click "Save"

## What This Fixes

- Allows your web app (`compassion-course-websit-937d6.firebaseapp.com` and `compassioncf.com`) to upload photos to Firebase Storage
- Allows local development (`localhost:5173`, `localhost:5174`) to upload photos
- Fixes the CORS preflight request errors

## After Setup

Once Storage is enabled and CORS is configured:
1. Try uploading a team member photo again
2. The CORS errors should be gone
3. Photos should upload successfully
