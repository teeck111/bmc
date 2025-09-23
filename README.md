# 🏔️ Big Mountain Club Website

**A modern, Firebase-powered website for the Big Mountain Club - connecting adventure seekers for epic outdoor experiences.**

[![Live Site](https://img.shields.io/badge/Live%20Site-bigmtnclub.com-blue)](https://bigmtnclub.com)
[![Firebase](https://img.shields.io/badge/Firebase-Deployed-orange)](https://firebase.google.com)
[![Security](https://img.shields.io/badge/Security-Locked%20Down-green)](#security)

## 🌟 Features

- **📱 Responsive Design**: Mobile-first design built with Bootstrap 5
- **🔥 Firebase Backend**: Real-time database and secure file storage
- **📸 Photo Uploads**: Direct photo uploads to Firebase Storage  
- **🛡️ Security**: Production-ready security rules and data validation
- **🎯 Admin Panel**: Password-protected admin controls for content management
- **📊 Trip Logging**: Complete trip logging system with filtering and search
- **⚡ Performance**: Optimized for speed with CDN assets and caching

## 🗂️ Project Structure

```
bmc/
├── 📄 Main Pages
│   ├── index.html              # Homepage with member showcase
│   ├── trip-log.html          # Trip log and admin panel
│   ├── add-trip.html          # Trip submission form
│   ├── planning.html          # Trip planning resources
│   ├── join.html             # Membership information
│   └── training.html         # Training resources
│
├── 📁 assets/                 # Static assets
│   ├── css/
│   │   └── styles.css        # Main stylesheet
│   ├── js/
│   │   ├── firebase-config.js # Firebase configuration
│   │   ├── trip-log.js       # Trip log functionality
│   │   ├── add-trip.js       # Trip submission logic
│   │   └── test-suite.js     # Automated testing
│   └── images/               # All site images
│       ├── bmclogo.jpeg      # Site logo/favicon
│       ├── BMC_Logo.png      # Alternative logo
│       └── [trip-photos]/    # Member and trip photos
│
├── 📁 config/                # Configuration files
│   ├── firestore.rules       # Firestore security rules
│   ├── storage.rules         # Storage security rules
│   └── firestore.indexes.json # Database indexes
│
├── 📁 docs/                  # Documentation
│   ├── FIREBASE_SETUP.md     # Firebase initial setup guide
│   ├── FIREBASE_SECURITY_LOCKDOWN.md # Security implementation
│   ├── FIREBASE_STORAGE_SETUP.md     # Photo upload setup
│   ├── DEPLOYMENT_GUIDE.md   # Production deployment guide
│   ├── DEPLOYMENT_CHECKLIST.md # Pre-deployment checklist
│   └── WARP.md              # AI assistant context
│
├── 📁 scripts/              # Utility scripts
│   ├── cleanup-for-production.sh # Production cleanup script
│   └── add-trip-backup.js   # Backup of trip submission code
│
├── 📁 tests/                # Test files (not deployed)
│   ├── production-tests.html # Comprehensive production test suite
│   ├── test-suite.html      # Legacy test file
│   ├── debug-add-trip.html  # Debug interface for trip submission
│   └── clean-storage.html   # Storage cleanup utility
│
├── ⚙️ Configuration
│   ├── firebase.json          # Firebase project configuration
│   ├── .gitignore            # Git ignore rules
│   ├── CNAME                 # Custom domain configuration
│   └── README.md            # This file
│
└── 📊 Git
    └── .git/                 # Git repository data
```

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone [your-repo-url]
cd bmc

# Start local server
python3 -m http.server 8000

# Visit http://localhost:8000
```

### Production Deployment
```bash
# Test everything works
python3 -m http.server 8000

# Deploy to live site (GitHub Pages + SquareSpace)
git add .
git commit -m "Your update message"
git push origin main
```

Your live site at [bigmtnclub.com](https://bigmtnclub.com) will update automatically within minutes.

## 🔐 Security

### Current Security Level: **Production Ready** 🟢

- ✅ **Input Validation**: All form data validated before storage
- ✅ **File Upload Security**: Images only, 10MB limit, safe file types
- ✅ **Access Controls**: Admin-only edit/delete capabilities
- ✅ **Spam Protection**: Data size limits and format validation
- ✅ **Firebase Rules**: Deployed and active security rules

### Authentication
- **Trip Submission**: Password protected (`BigMountain2024`)
- **Admin Access**: Secret key sequence + password (`admin` → `AdminBMC2024`)

## 🛠️ Admin Guide

### Adding/Editing Trips
1. Go to [Trip Log](https://bigmtnclub.com/trip-log.html)
2. Type "admin" to unlock admin mode
3. Enter admin password: `AdminBMC2024`
4. Use edit/delete buttons on trip cards

### Managing Photos
- Photos automatically upload to Firebase Storage
- Located in `/trip-photos/` folder
- Accessible via Firebase Console for management

### Monitoring
- **Firebase Console**: Monitor usage and data
- **GitHub Actions**: Track deployments  
- **Site Analytics**: Available if Google Analytics added

## 🧪 Testing

### Production Test Suite
```bash
# Start local server
python3 -m http.server 8000

# Run comprehensive tests
open http://localhost:8000/tests/production-tests.html
```

Tests cover:
- Security validation
- All functionality
- Performance benchmarks
- Mobile compatibility
- Firebase integration

### Manual Testing Checklist
- [ ] Homepage loads correctly
- [ ] All navigation works
- [ ] Trip submission works with password
- [ ] Photo uploads work
- [ ] Admin functions work
- [ ] Mobile responsive design
- [ ] All images load correctly

## 🔧 Development

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5.3.3
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage  
- **Hosting**: GitHub Pages
- **Domain**: SquareSpace DNS → GitHub Pages
- **Icons**: Font Awesome 6.0
- **Fonts**: Google Fonts (Space Grotesk)

### Key Features Implementation
- **Real-time Data**: Firebase Firestore with offline support
- **Photo Management**: Direct Firebase Storage integration
- **Security**: Multi-layer validation (client + Firebase rules)
- **Performance**: CDN assets, image optimization, caching headers

## 🚨 Emergency Procedures

### Site Down
1. Check [GitHub Pages status](https://www.githubstatus.com/)
2. Verify domain settings in SquareSpace
3. Check recent commits for issues

### Firebase Issues
```bash
# Emergency lockdown
firebase deploy --only firestore:rules  # Deploy restrictive rules
```

### Rollback Changes
```bash
git revert [commit-hash]  # Revert specific commit
git push origin main      # Deploy rollback
```

## 📞 Support

### Resources
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **GitHub Repository**: [Your repo URL]
- **Domain Management**: SquareSpace account
- **Documentation**: `/docs/` folder

### Common Issues
- **Path Updates**: After reorganization, ensure all paths are correct
- **Cache Issues**: Use Ctrl+F5 (or Cmd+Shift+R on Mac) for hard refresh
- **Firebase Limits**: Monitor usage in Firebase Console

## 🎯 Future Enhancements

### Potential Upgrades
- [ ] User authentication system
- [ ] Advanced spam detection
- [ ] Photo compression/optimization
- [ ] Trip planning tools integration
- [ ] Member directory
- [ ] Event calendar
- [ ] Mobile app (PWA)

### Performance Optimizations
- [ ] Image lazy loading
- [ ] Service Worker for offline support
- [ ] Database query optimization
- [ ] CDN for images

---

## 📝 License & Contributing

This project is maintained by the Big Mountain Club. For contributions or issues, please contact the club administrators.

**Built with ❤️ for the outdoor adventure community**