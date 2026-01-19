#!/bin/bash
# Helper script to base64-encode the Firebase service account JSON

echo "=========================================="
echo "Firebase Service Account Base64 Encoder"
echo "=========================================="
echo ""
echo "This script will help you encode your service account JSON for GitHub Secrets."
echo ""

# Check if file path provided
if [ -z "$1" ]; then
    echo "Usage: ./encode-service-account.sh <path-to-service-account.json>"
    echo ""
    echo "Example:"
    echo "  ./encode-service-account.sh ~/Downloads/service-account.json"
    echo ""
    exit 1
fi

SERVICE_ACCOUNT_FILE="$1"

# Check if file exists
if [ ! -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo "ERROR: File not found: $SERVICE_ACCOUNT_FILE"
    exit 1
fi

# Encode to base64
echo "Encoding service account JSON..."
ENCODED=$(base64 -i "$SERVICE_ACCOUNT_FILE" | tr -d '\n')

# Copy to clipboard if pbcopy is available (Mac)
if command -v pbcopy &> /dev/null; then
    echo "$ENCODED" | pbcopy
    echo "✓ Base64-encoded string copied to clipboard!"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://github.com/ccfoundation-admin/compassion-course-website/settings/secrets/actions"
    echo "2. Click on FIREBASE_SERVICE_ACCOUNT"
    echo "3. Paste the encoded string (Cmd+V)"
    echo "4. Save"
else
    echo "Base64-encoded string (copy this):"
    echo "=========================================="
    echo "$ENCODED"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Copy the entire string above"
    echo "2. Go to: https://github.com/ccfoundation-admin/compassion-course-website/settings/secrets/actions"
    echo "3. Click on FIREBASE_SERVICE_ACCOUNT"
    echo "4. Paste the encoded string"
    echo "5. Save"
fi

echo ""
echo "Note: The encoded string should be one continuous line with no spaces or newlines."
