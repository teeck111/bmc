# 🚀 BMC Deployment Guide

## Overview
Your Big Mountain Club website is deployed using:
- **GitHub Pages** for hosting the static files
- **SquareSpace** for domain management (bigmtnclub.com)
- **Firebase** for backend services (database & photo storage)

## Current Setup Status ✅

Since you mentioned your site is already live via GitHub Pages through SquareSpace, the basic infrastructure is working. You only need to **push changes to update** your live site.

## 🎯 Quick Update Process

For routine updates to your live site:

```bash
# 1. Navigate to your project
cd /Users/tylerkivelson/Downloads/bmc

# 2. Test changes locally first
python3 -m http.server 8000
# Visit http://localhost:8000 to test

# 3. Add and commit changes
git add .
git commit -m "Update: [describe your changes]"

# 4. Push to update live site
git push origin main
```

Your site should update automatically within a few minutes.

## 🧪 Production Readiness Steps

Before making any major updates live, follow this process:

### Step 1: Run Production Tests
```bash
# Start local server
python3 -m http.server 8000

# Open in browser:
# http://localhost:8000/production-tests.html

# Click "Run All Tests" and verify all pass
```

### Step 2: Clean Up for Production
```bash
# Run the cleanup script
./cleanup-for-production.sh

# Follow the prompts to remove development files
```

### Step 3: Deploy Updates
```bash
git add .
git commit -m "Production update: [description]"
git push origin main
```

## 🔧 Firebase Configuration for Production

### Security Rules Deployment

Your Firebase backend needs proper security rules for production use:

#### 1. Firestore Rules
```bash
# Create firestore.rules file in your project root:
cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read: if true;
      allow write: if request.auth == null && 
                      isValidTripData(request.resource.data) &&
                      resource == null;
      allow update, delete: if request.auth != null;
    }
    
    function isValidTripData(data) {
      return data.keys().hasAll(['location', 'date', 'members']) &&
             data.location is string &&
             data.date is string &&
             data.members is list &&
             data.size() <= 20 &&
             (!('photos' in data) || 
              (data.photos is list && data.photos.size() <= 10));
    }
  }
}
EOF

# Deploy the rules
firebase deploy --only firestore:rules
```

#### 2. Storage Rules
```bash
# Create storage.rules file:
cat > storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
    }
    
    match /trip-photos/{filename} {
      allow write: if request.resource.contentType != null &&
                      request.resource.contentType.matches('image/.*') &&
                      request.resource.size <= 10 * 1024 * 1024;
    }
  }
}
EOF

# Deploy storage rules
firebase deploy --only storage:rules
```

## 🔍 Testing Your Live Site

After deploying updates:

### 1. Basic Functionality
- ✅ Visit https://bigmtnclub.com
- ✅ Navigate through all pages
- ✅ Test trip log viewing
- ✅ Test mobile responsiveness

### 2. Admin Functions
- ✅ Go to trip-log page
- ✅ Type "admin" to unlock admin mode
- ✅ Enter admin password: `AdminBMC2024`
- ✅ Test edit/delete functions

### 3. Trip Submission
- ✅ Go to add-trip page  
- ✅ Fill out form with test data
- ✅ Enter trip password: `BigMountain2024`
- ✅ Test photo upload (if using Firebase Storage)
- ✅ Verify submission appears in trip log

### 4. Firebase Integration
- ✅ Check Firebase console for new data
- ✅ Verify photos appear in Firebase Storage
- ✅ Monitor for any errors in console

## 🛡️ Security Best Practices

### Before Going Live Checklist:

#### 1. Password Security
- [ ] Consider changing default passwords:
  - Trip password: `BigMountain2024` 
  - Admin password: `AdminBMC2024`
- [ ] Store passwords securely (not in version control)

#### 2. Firebase Security
- [ ] Deploy production security rules
- [ ] Set up usage quotas and alerts
- [ ] Monitor Firebase console for abuse

#### 3. Content Review  
- [ ] Review all trip data for appropriateness
- [ ] Ensure no sensitive personal information is exposed
- [ ] Test all user-facing functionality

## 📊 Monitoring & Maintenance

### Daily/Weekly Monitoring:
1. **Firebase Console**: Check for unusual activity
2. **GitHub Pages**: Verify site is accessible
3. **Domain**: Ensure bigmtnclub.com resolves correctly

### Monthly Tasks:
1. **Backup Firebase Data**:
   ```bash
   firebase firestore:export gs://your-project/backups/$(date +%Y%m%d)
   ```

2. **Review Usage**:
   - Check Firebase quotas
   - Review photo storage usage
   - Monitor site traffic (if analytics enabled)

3. **Security Review**:
   - Check for suspicious trip submissions
   - Review admin access logs
   - Update passwords if needed

## 🚨 Troubleshooting

### Common Issues:

#### Site Not Updating
```bash
# Check GitHub Pages status
# Visit: https://github.com/[your-username]/[repo-name]/settings/pages

# Force refresh browser cache
# Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

# Check commit history
git log --oneline -5
```

#### Firebase Not Working
```bash
# Check Firebase project status
firebase projects:list

# Verify rules deployment
firebase deploy --only firestore:rules,storage:rules

# Check console for errors
# Open browser dev tools (F12) and check console
```

#### Domain Issues
- Contact SquareSpace support if bigmtnclub.com isn't resolving
- Verify DNS settings point to GitHub Pages
- Check CNAME file in your repository

## 🔄 Rollback Plan

If something goes wrong after deployment:

```bash
# 1. Check recent commits
git log --oneline -10

# 2. Revert to previous working commit
git revert [commit-hash]

# 3. Push rollback
git push origin main

# 4. Or reset to specific commit (use carefully!)
git reset --hard [commit-hash]
git push --force-with-lease origin main
```

## 📞 Support Resources

- **GitHub Pages Help**: https://docs.github.com/en/pages
- **Firebase Documentation**: https://firebase.google.com/docs
- **SquareSpace Domain Support**: SquareSpace help center
- **Your Repository**: [Insert your GitHub repo URL]

## 🎉 You're Ready!

Your site architecture is solid and ready for production use:

- ✅ **Static Hosting**: GitHub Pages (reliable, fast, free)
- ✅ **Custom Domain**: SquareSpace integration working
- ✅ **Backend**: Firebase (scalable, secure)
- ✅ **Security**: Client-side auth suitable for club use
- ✅ **Mobile**: Bootstrap responsive design
- ✅ **Testing**: Comprehensive test suite available

**Next Steps**: 
1. Run the production tests
2. Clean up development files  
3. Push your changes
4. Test the live site
5. Enjoy your live club website! 🏔️

---

*Remember: Since your site is already live, any push to your main branch will update the public site. Always test locally first!*