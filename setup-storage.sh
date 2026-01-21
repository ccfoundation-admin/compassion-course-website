#!/bin/bash

# Firebase Storage Setup Script
# Run this after enabling Storage in Firebase Console

echo "🔧 Setting up Firebase Storage..."

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    echo "❌ gsutil not found. Please install Google Cloud SDK:"
    echo "   brew install google-cloud-sdk"
    exit 1
fi

# Set project
echo "📦 Setting Google Cloud project..."
gcloud config set project compassion-course-websit-937d6

# Deploy storage rules
echo "📝 Deploying storage security rules..."
firebase deploy --only storage:rules

# Configure CORS
echo "🌐 Configuring CORS for Firebase Storage..."
BUCKET_NAME="compassion-course-websit-937d6.firebasestorage.app"

if [ -f "storage.cors.json" ]; then
    echo "   Setting CORS configuration from storage.cors.json..."
    gsutil cors set storage.cors.json gs://$BUCKET_NAME
    
    echo "✅ CORS configuration applied!"
    echo ""
    echo "Verifying CORS configuration:"
    gsutil cors get gs://$BUCKET_NAME
else
    echo "❌ storage.cors.json not found!"
    exit 1
fi

echo ""
echo "✅ Firebase Storage setup complete!"
echo "   You can now upload photos through the CMS."
