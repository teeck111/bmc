# 🏔️ Big Mountain Club Website

**A modern, Netlify-powered website for the Big Mountain Club - connecting adventure seekers for epic outdoor experiences.**

[![Live Site](https://img.shields.io/badge/Live%20Site-bmcwebsite.netlify.app-blue)](https://bmcwebsite.netlify.app)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7)](https://netlify.com)
[![Security](https://img.shields.io/badge/Security-Serverless%20Functions-green)](#security)

## 🌟 Features

- **📱 Responsive Design**: Mobile-first design built with Bootstrap 5
- **⚡ Netlify Functions**: Serverless backend with GitHub data storage
- **📸 Photo Uploads**: Direct photo uploads to GitHub repository (20MB limit)
- **🛑️ Security**: Password-protected functions with club authentication
- **🎯 Admin Panel**: Full CRUD operations for trip management
- **📊 Trip Logging**: Real-time trip display with filtering and search
- **🚀 Performance**: Static site with serverless functions, optimized deployments

## 🗂️ Project Structure

```
bmc/
├── 📄 Main Pages
│   ├── index.html              # Homepage with member showcase
│   ├── trip-log.html           # Trip log and admin panel
│   ├── add-trip.html           # Trip submission form
│   ├── planning.html           # Trip planning resources
│   ├── join.html               # Membership information
│   └── training.html           # Training resources
│
├── 📁 assets/                   # Static assets
│   ├── css/
│   │   └── styles.css          # Main stylesheet
│   ├── js/
│   │   ├── netlify-database.js # Netlify functions client
│   │   ├── trip-log.js         # Trip log functionality
│   │   ├── add-trip.js         # Trip submission logic
│   │   └── test-suite.js       # Automated testing
│   └── images/                 # All site images
│       ├── bmclogo.jpeg        # Site logo/favicon
│       ├── BMC_Logo.png        # Alternative logo
│       └── [trip-photos]/      # Member and trip photos
│
├── 📁 netlify/                 # Netlify configuration
│   └── functions/              # Serverless functions
│       ├── get-trips.js        # Load trips from GitHub
│       ├── add-trip.js         # Add new trips to GitHub
│       ├── update-trip.js      # Update existing trips
│       ├── delete-trip.js      # Delete trips
│       └── upload-photos.js    # Photo upload to GitHub
│
├── 📁 docs/                    # Documentation
│   ├── NETLIFY_DEPLOYMENT.md   # Netlify deployment guide
│   ├── PROJECT_STATUS.md       # Current functionality status
│   ├── FIX_DEPLOYMENTS.md      # Deployment optimization guide
│   └── WARP.md                 # AI assistant context
│
├── 📁 debug/                   # Debug and testing tools
│   ├── debug-netlify.html      # Netlify functions testing
│   └── test-functionality.html # Local functionality testing
│
├── ⚙️ Configuration
│   ├── netlify.toml            # Netlify build configuration
│   ├── package.json            # Dependencies for Netlify functions
│   ├── .gitignore              # Git ignore rules
│   ├── CNAME                   # Custom domain configuration
│   └── README.md               # This file
│
├── 📁 data/                    # GitHub-stored data
│   ├── trips.json              # Trip data (auto-generated)
│   └── photos/                 # Uploaded photos (auto-generated)
│
└── 📊 Git
    └── .git/                   # Git repository data
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
# Test everything works locally
python3 -m http.server 8000

# Deploy to Netlify (automatic)
git add .
git commit -m "Your update message"
git push origin master
```

Your live site at [bmcwebsite.netlify.app](https://bmcwebsite.netlify.app) updates automatically via Netlify CI/CD.

## 🔐 Security

### Current Security Level: **Production Ready** 🟢

- ✅ **Serverless Functions**: Password-protected API endpoints
- ✅ **File Upload Security**: Images only, 20MB limit, GitHub storage
- ✅ **Access Controls**: Admin-only edit/delete capabilities  
- ✅ **Input Validation**: All form data validated client and server-side
- ✅ **Environment Variables**: Secure token storage in Netlify
- ✅ **CORS Protection**: Proper cross-origin request handling

### Authentication
- **API Security**: All functions require club password header



### Managing Photos
- Photos automatically upload to GitHub repository
- Located in `/photos/` folder in the repo
- Accessible via GitHub web interface or Git

### Monitoring
- **Netlify Dashboard**: Monitor deployments and function logs
- **GitHub Repository**: Track all data changes and commits
- **Debug Tools**: Use `/debug-netlify.html` for function testing

## 🧪 Testing

### Production Test Suite
```bash
# Start local server
python3 -m http.server 8000

# Run local functionality tests
open http://localhost:8000/test-functionality.html

# Test Netlify functions (requires deployment)
open https://your-site.netlify.app/debug-netlify.html
```

Tests cover:
- Netlify functions integration
- Trip CRUD operations
- Photo upload functionality
- Admin authentication
- Mobile compatibility

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
- **Backend**: Netlify Serverless Functions
- **Database**: GitHub Repository (JSON files)
- **Storage**: GitHub Repository (for photos)
- **Hosting**: Netlify
- **Domain**: Custom domain via Netlify
- **Icons**: Font Awesome 6.0
- **Fonts**: Google Fonts (Space Grotesk)

### Key Features Implementation
- **Data Storage**: GitHub API for persistent JSON storage
- **Photo Management**: Direct GitHub repository integration (20MB limit)
- **Security**: Password-protected serverless functions
- **Performance**: Static site + serverless functions, optimized build process
- **Deployment**: Automatic CI/CD with build optimization

## 🚨 Emergency Procedures

### Site Down
1. Check [Netlify status](https://www.netlifystatus.com/)
2. Verify domain settings in Netlify dashboard
3. Check recent commits and deployments
4. Review Netlify function logs for errors

### Function Issues
```bash
# Check function logs in Netlify dashboard
# Environment variables in Site Settings > Environment Variables
# Test individual functions via debug-netlify.html
```

### Rollback Changes
```bash
git revert [commit-hash]  # Revert specific commit
git push origin master    # Deploy rollback automatically
```

## 📞 Support

### Resources
- **Netlify Dashboard**: [app.netlify.com](https://app.netlify.com)
- **GitHub Repository**: [github.com/teeck111/bmc](https://github.com/teeck111/bmc)
- **Function Debugging**: Use `/debug-netlify.html` on live site
- **Documentation**: `/docs/` folder

### Common Issues
- **Environment Variables**: Check all required vars are set in Netlify
- **Function Timeouts**: Large photos may timeout, use smaller images
- **Cache Issues**: Use Ctrl+F5 (or Cmd+Shift+R on Mac) for hard refresh
- **Build Limits**: Monitor build minutes in Netlify dashboard

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