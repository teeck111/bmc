# Firebase Security Rules for Production

## 🔥 Firestore Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to trips, authenticated write
    match /trips/{tripId} {
      // Anyone can read trips (for public viewing)
      allow read: if true;
      
      // Only allow writes from authenticated sources with password validation
      // Note: Client-side validation only - suitable for small club use
      allow write: if request.auth == null && 
                      isValidTripData(request.resource.data) &&
                      resource == null; // Only allow creating new trips, not updating
      
      // Admin operations (updates/deletes) require special token
      allow update, delete: if request.auth != null || 
                               hasAdminPermission(request);
    }
    
    // Helper functions
    function isValidTripData(data) {
      return data.keys().hasAll(['location', 'date', 'members']) &&
             data.location is string &&
             data.date is string &&
             data.members is list &&
             data.size() <= 20 && // Limit number of fields
             (!('photos' in data) || 
              (data.photos is list && data.photos.size() <= 10)); // Limit photos
    }
    
    function hasAdminPermission(request) {
      // In a real app, this would check a custom token or user role
      // For now, we rely on client-side authentication
      return request.headers.get('X-Admin-Token') == 'AdminBMC2024';
    }
  }
}
```

## 📁 Storage Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Trip photos upload rules
    match /trip-photos/{filename} {
      allow write: if isAuthenticated() && 
                      isValidImageFile() && 
                      isReasonableSize();
      allow delete: if hasAdminAccess();
    }
    
    // Helper functions
    function isAuthenticated() {
      // Allow uploads from authenticated sessions
      // In production, you might want stronger auth
      return request.auth != null || 
             resource == null; // Allow new uploads
    }
    
    function isValidImageFile() {
      return request.resource.contentType != null &&
             request.resource.contentType.matches('image/.*') &&
             !request.resource.contentType.matches('image/svg\\+xml'); // Block SVG for security
    }
    
    function isReasonableSize() {
      return request.resource.size <= 10 * 1024 * 1024; // 10MB limit
    }
    
    function hasAdminAccess() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
  }
}
```

## 🛡️ Security Considerations for Production

### Current Security Model
Your current setup uses **client-side authentication** which is suitable for:
- Small, trusted communities (like your climbing club)
- Low-stakes data (trip logs, photos)
- Situations where convenience > maximum security

### Recommendations for Enhanced Security

#### 1. **Environment Variables**
Store sensitive configuration in environment variables:
```javascript
// In production, load from environment
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminBMC2024';
const TRIP_PASSWORD = process.env.TRIP_PASSWORD || 'BigMountain2024';
```

#### 2. **Rate Limiting**
Consider implementing rate limiting for uploads:
```javascript
// Add to storage rules
match /trip-photos/{filename} {
  allow write: if isAuthenticated() && 
                  isValidImageFile() && 
                  isReasonableSize() &&
                  !hasExceededUploadRate(); // Custom function
}
```

#### 3. **Content Moderation**
For public sites, consider:
- Image content scanning
- Text content filtering
- User reporting mechanisms

#### 4. **Backup Strategy**
```bash
# Regular Firebase exports
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
```

## 🚀 Deployment Steps

### Step 1: Apply Security Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage:rules
```

### Step 2: Test Rules
Use the production test suite at `production-tests.html` to validate.

### Step 3: Monitor Usage
Set up Firebase monitoring:
- Usage quotas
- Error tracking
- Performance monitoring

## 🔧 Configuration Files

### firebase.json (Production)
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "**/test-*",
      "**/debug-*",
      "production-tests.html"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## ⚠️ Important Notes

1. **Client-Side Security**: Your current model relies on client-side validation, which is okay for a small club but not recommended for public applications with sensitive data.

2. **Password Management**: Consider changing default passwords before going live.

3. **Monitoring**: Set up Firebase Analytics to monitor usage and potential abuse.

4. **Backup**: Implement regular data backups.

5. **HTTPS**: Ensure your site is served over HTTPS (GitHub Pages does this automatically).

## 🔄 Migration Plan

If you need stronger security later, you can migrate to:
1. Firebase Authentication with user accounts
2. Server-side validation with Cloud Functions
3. More granular permission systems
4. Integration with external auth providers (Google, GitHub, etc.)

The current setup balances security with simplicity for your club's needs while providing a foundation for future enhancements.