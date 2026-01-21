# Configure Firebase Storage CORS - Manual Steps

The CORS errors you're seeing need to be fixed by configuring CORS on your Firebase Storage bucket.

## Quick Fix - Run These Commands

Open your terminal and run these commands one at a time:

```bash
# 1. Navigate to the project directory
cd "/Users/jaybond/Projects/Compassion Course"

# 2. Set the Google Cloud project
gcloud config set project compassion-course-websit-937d6

# 3. Configure CORS (this is the important one!)
gsutil cors set storage.cors.json gs://compassion-course-websit-937d6.firebasestorage.app

# 4. Verify it worked
gsutil cors get gs://compassion-course-websit-937d6.firebasestorage.app
```

## Alternative: Configure via Google Cloud Console

If `gsutil` doesn't work, you can configure CORS through the web interface:

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/storage/browser?project=compassion-course-websit-937d6

2. **Find your Storage bucket:**
   - Look for a bucket named `compassion-course-websit-937d6.firebasestorage.app`
   - Click on the bucket name

3. **Configure CORS:**
   - Click the "Configuration" tab
   - Scroll down to "Cross-origin resource sharing (CORS)"
   - Click "Edit CORS configuration"
   - Paste this JSON:
   ```json
   [
     {
       "origin": [
         "https://compassion-course-websit-937d6.firebaseapp.com",
         "https://compassioncf.com",
         "http://localhost:5173",
         "http://localhost:5174"
       ],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization"]
     }
   ]
   ```
   - Click "Save"

## After Configuration

Once CORS is configured:
1. Refresh your browser
2. Try uploading a photo again
3. The CORS errors should be gone!

## Troubleshooting

If you get "bucket not found" errors:
- Make sure Firebase Storage is enabled in Firebase Console
- The bucket name might be slightly different - check in Firebase Console → Storage → Settings

If `gsutil` command not found:
- Install Google Cloud SDK: `brew install google-cloud-sdk`
- Or use the Google Cloud Console method above
