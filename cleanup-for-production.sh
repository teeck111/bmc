#!/bin/bash

# BMC Production Cleanup Script
# This script prepares your repository for production deployment by removing
# development files, test files, and sensitive information.

echo "🧹 BMC Production Cleanup Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for confirmation
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to safely remove files/directories
safe_remove() {
    local item="$1"
    local description="$2"
    
    if [ -e "$item" ]; then
        if confirm "Remove $description ($item)?"; then
            if [ -d "$item" ]; then
                rm -rf "$item"
            else
                rm -f "$item"
            fi
            echo -e "${GREEN}✅ Removed: $item${NC}"
        else
            echo -e "${YELLOW}⏭️  Skipped: $item${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  Not found: $item${NC}"
    fi
}

# Function to create .gitignore if it doesn't exist
create_gitignore() {
    if [ ! -f ".gitignore" ]; then
        echo "📝 Creating .gitignore file..."
        cat > .gitignore << 'EOF'
# Development and test files
test-*.html
debug-*.html
production-tests.html
cleanup-for-production.sh
firebase-rules-production.md

# Logs and temporary files
*.log
*.tmp
.DS_Store
Thumbs.db

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Firebase local files
.firebase/
firebase-debug.log
firestore-debug.log

# Node modules (if you add them later)
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Environment variables
.env
.env.local
.env.production

# Backup files
*.bak
*.backup
EOF
        echo -e "${GREEN}✅ Created .gitignore${NC}"
    else
        echo -e "${BLUE}ℹ️  .gitignore already exists${NC}"
    fi
}

# Function to update cache busting versions
update_cache_versions() {
    echo "🔄 Updating cache busting versions..."
    
    # Get current timestamp for versioning
    VERSION=$(date +%s)
    
    # Update HTML files to use new version
    for file in *.html; do
        if [ -f "$file" ] && [ "$file" != "production-tests.html" ] && [ "$file" != "test-suite.html" ]; then
            # Update JS file versions
            sed -i.bak "s/\.js?v=[0-9]*/\.js?v=$VERSION/g" "$file"
            # Update CSS file versions  
            sed -i.bak "s/\.css?v=[0-9]*/\.css?v=$VERSION/g" "$file"
            # Remove backup files
            rm -f "${file}.bak"
            echo -e "${GREEN}✅ Updated cache versions in: $file${NC}"
        fi
    done
}

echo "This script will clean up your repository for production deployment."
echo "It will remove development/test files and prepare for going live."
echo ""

if ! confirm "Continue with cleanup?"; then
    echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
    exit 0
fi

echo ""
echo "🗂️  Cleaning up development files..."

# Remove test and debug files
safe_remove "test-suite.html" "test suite"
safe_remove "production-tests.html" "production test suite"
safe_remove "debug-firebase.html" "Firebase debug page"
safe_remove "firebase-debug.log" "Firebase debug log"
safe_remove "firestore-debug.log" "Firestore debug log"

# Remove development scripts
safe_remove "cleanup-for-production.sh" "this cleanup script"

# Remove documentation that shouldn't be public
safe_remove "firebase-rules-production.md" "Firebase rules documentation"

# Remove any backup files
echo ""
echo "🗂️  Cleaning up backup files..."
find . -name "*.bak" -type f -exec rm -f {} \;
find . -name "*.backup" -type f -exec rm -f {} \;
find . -name "*~" -type f -exec rm -f {} \;

# Remove system files
echo ""
echo "🗂️  Cleaning up system files..."
find . -name ".DS_Store" -type f -exec rm -f {} \;
find . -name "Thumbs.db" -type f -exec rm -f {} \;

# Create/update .gitignore
echo ""
create_gitignore

# Update cache busting versions
echo ""
update_cache_versions

# Check for sensitive information
echo ""
echo "🔍 Checking for potential sensitive information..."

# Check for hardcoded passwords (basic check)
if grep -r "BigMountain2024\|AdminBMC2024" --exclude="*.sh" --exclude=".git" . > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: Found hardcoded passwords in files.${NC}"
    echo "   Consider changing these before going live:"
    echo "   - Trip password: BigMountain2024"  
    echo "   - Admin password: AdminBMC2024"
    echo ""
fi

# Check for Firebase config
if [ -f "firebase-config.js" ]; then
    echo -e "${BLUE}ℹ️  Firebase config found - this is okay for client-side apps${NC}"
fi

# Final recommendations
echo ""
echo "🎯 Final Steps for Production:"
echo "=============================="
echo ""
echo "1. 🔒 Security Review:"
echo "   - Consider changing default passwords"
echo "   - Review Firebase security rules"
echo "   - Test admin access controls"
echo ""
echo "2. 🧪 Testing:"
echo "   - Test all functionality on your local server"
echo "   - Verify photo uploads work with Firebase"
echo "   - Check mobile responsiveness"
echo ""
echo "3. 🚀 Deployment (GitHub Pages + SquareSpace):"
echo "   - Commit and push changes to GitHub"
echo "   - Verify site updates automatically"
echo "   - Test live site functionality"
echo ""
echo "4. 📊 Monitoring:"
echo "   - Check Firebase usage in console"
echo "   - Monitor for any errors or abuse"
echo "   - Set up usage alerts if needed"
echo ""
echo "5. 📝 Documentation:"
echo "   - Update README with deployment info"
echo "   - Document admin procedures"
echo "   - Create user guide if needed"
echo ""

if confirm "Create a deployment checklist file?"; then
    cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# 🚀 BMC Deployment Checklist

## Pre-Deployment
- [ ] Run production tests (`production-tests.html`)
- [ ] Clean up development files (`cleanup-for-production.sh`)
- [ ] Update cache busting versions
- [ ] Review and update passwords if needed
- [ ] Test all functionality locally

## Security Review
- [ ] Verify Firebase security rules are applied
- [ ] Test admin access controls
- [ ] Review photo upload permissions
- [ ] Check for any exposed sensitive data

## Deployment
- [ ] Commit changes to Git
- [ ] Push to GitHub repository
- [ ] Verify GitHub Pages deployment
- [ ] Test live site functionality
- [ ] Verify Firebase integration works live

## Post-Deployment
- [ ] Test photo uploads on live site
- [ ] Verify admin functionality
- [ ] Check mobile responsiveness
- [ ] Monitor Firebase usage
- [ ] Set up usage alerts (optional)

## Ongoing Maintenance
- [ ] Regular backups of Firebase data
- [ ] Monitor for abuse or spam
- [ ] Update content as needed
- [ ] Review security periodically

## Emergency Contacts
- Firebase Project: [Your Project ID]
- GitHub Repository: [Your Repo URL]
- SquareSpace Domain: bigmtnclub.com
EOF
    echo -e "${GREEN}✅ Created DEPLOYMENT_CHECKLIST.md${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Cleanup complete!${NC}"
echo ""
echo "Your repository is now ready for production deployment."
echo "Remember to test everything thoroughly before going live!"

exit 0