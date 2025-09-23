# Firebase Storage Setup for BMC Photo Uploads

## 1. Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your BMC project
3. Click **"Storage"** in the left sidebar
4. Click **"Get started"**
5. Choose **"Start in test mode"** for now
6. Select a location (choose closest to your users)
7. Click **"Done"**

## 2. Configure Storage Security Rules

Go to **Storage > Rules** and replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read photos
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow writes to trip-photos folder
    match /trip-photos/{tripId}/{filename} {
      allow write: if request.auth == null // For now, allow anonymous uploads
        && resource == null // Only allow new files, not overwrites
        && request.resource.size < 10 * 1024 * 1024 // Max 10MB
        && request.resource.contentType.matches('image/.*'); // Only images
    }
  }
}
```

**For Production (Optional - More Secure):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read photos
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated writes to trip-photos folder
    match /trip-photos/{tripId}/{filename} {
      allow write: if request.auth != null // Require authentication
        && resource == null // Only allow new files
        && request.resource.size < 10 * 1024 * 1024 // Max 10MB
        && request.resource.contentType.matches('image/.*'); // Only images
    }
  }
}
```

## 3. Test the Setup

1. Start your local server: `python3 -m http.server 8000`
2. Go to `http://localhost:8000/add-trip.html`
3. Enter password: `BigMountain2024`
4. Try uploading a photo
5. Check Firebase Console > Storage to see uploaded files

## 4. Monitor Usage and Costs

- Go to **Storage > Usage** to monitor storage usage
- Set up billing alerts in Google Cloud Console if needed
- Firebase Storage pricing: 
  - Free tier: 1GB storage, 10GB/month bandwidth
  - After free tier: ~$0.026/GB/month storage

## 5. File Organization

Photos are organized as:
```
trip-photos/
  ├── temp-1234567890/     (temporary uploads before trip creation)
  ├── ABC123DEF456/        (Firebase-generated trip IDs)
  └── user-defined-id/     (if using custom trip IDs)
```

## 6. Cleanup (Optional)

To clean up unused photos from failed uploads, you can:
1. Use Firebase Storage console to manually delete old temp folders
2. Set up Firebase Functions to auto-cleanup old temp uploads
3. Use the Firebase Admin SDK to batch delete unused files

## 7. Domain Configuration (Production)

For production, add your domain to Firebase:
1. Go to **Authentication > Settings > Authorized domains**
2. Add `bigmtnclub.com` and any other domains you use

## Troubleshooting

**"Storage reference is invalid" error:**
- Check that Firebase Storage is enabled
- Verify storage rules allow your operation
- Ensure Firebase Storage SDK is loaded

**"Upload failed" errors:**
- Check browser console for detailed error messages
- Verify file size is under 10MB
- Ensure file is a valid image format
- Check Firebase Storage security rules